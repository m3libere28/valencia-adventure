// Budget categories with icons and colors
const budgetCategories = {
    housing: { icon: '🏠', color: '#4CAF50' },
    utilities: { icon: '💡', color: '#2196F3' },
    groceries: { icon: '🛒', color: '#FF9800' },
    transportation: { icon: '🚗', color: '#9C27B0' },
    entertainment: { icon: '🎭', color: '#E91E63' },
    healthcare: { icon: '🏥', color: '#F44336' },
    education: { icon: '📚', color: '#3F51B5' },
    other: { icon: '📝', color: '#607D8B' }
};

// Budget state
let currentBudget = 0;
let expenses = [];

// Initialize when Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be ready
    window.addEventListener('firebaseReady', () => {
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                await loadBudgetData(user.uid);
                updateBudgetDisplay();
            } else {
                resetBudgetData();
            }
        });
    });

    // Add form submit handlers
    const budgetForm = document.getElementById('budget-form');
    const expenseForm = document.getElementById('expense-form');

    if (budgetForm) {
        budgetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const amountInput = document.getElementById('budget-amount');
            const amount = amountInput ? parseFloat(amountInput.value) : 0;
            
            if (!amount || amount <= 0) {
                showError('Please enter a valid budget amount');
                return;
            }
            
            await setBudget(amount);
            
            // Reset form
            if (amountInput) amountInput.value = '';
        });
    }

    if (expenseForm) {
        expenseForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const amountInput = document.getElementById('expense-amount');
            const categoryInput = document.getElementById('expense-category');
            const descriptionInput = document.getElementById('expense-description');
            
            const amount = amountInput ? parseFloat(amountInput.value) : 0;
            const category = categoryInput ? categoryInput.value : '';
            const description = descriptionInput ? descriptionInput.value : '';
            
            if (!amount || amount <= 0) {
                showError('Please enter a valid expense amount');
                return;
            }
            
            if (!category) {
                showError('Please select a category');
                return;
            }
            
            if (!description) {
                showError('Please enter a description');
                return;
            }
            
            await addExpense(amount, category, description);
            
            // Reset form
            if (amountInput) amountInput.value = '';
            if (categoryInput) categoryInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
        });
    }
});

// Helper functions
async function loadBudgetData(userId) {
    try {
        const doc = await window.db.collection('budgets').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            currentBudget = data.budget || 0;
            expenses = data.expenses || [];
        } else {
            await window.db.collection('budgets').doc(userId).set({
                budget: 0,
                expenses: []
            });
            currentBudget = 0;
            expenses = [];
        }
        updateBudgetDisplay();
        updateExpensesDisplay();
    } catch (error) {
        console.error('Error loading budget data:', error);
        showError('Failed to load budget data');
    }
}

async function setBudget(amount) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to set budget');
            return;
        }

        currentBudget = amount;
        await window.db.collection('budgets').doc(user.uid).update({
            budget: amount
        });

        updateBudgetDisplay();
        showSuccess('Budget updated successfully');
    } catch (error) {
        console.error('Error setting budget:', error);
        showError('Failed to update budget');
    }
}

async function addExpense(amount, category, description) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to add expenses');
            return;
        }

        const expense = {
            amount,
            category,
            description,
            date: new Date().toISOString()
        };

        expenses.push(expense);
        await window.db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayUnion(expense)
        });

        updateExpensesDisplay();
        showSuccess('Expense added successfully');
    } catch (error) {
        console.error('Error adding expense:', error);
        showError('Failed to add expense');
    }
}

function updateBudgetDisplay() {
    const budgetDisplay = document.getElementById('budget-display');
    const remainingDisplay = document.getElementById('remaining-display');
    const spentDisplay = document.getElementById('spent-display');

    if (!budgetDisplay || !remainingDisplay || !spentDisplay) return;

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = currentBudget - totalSpent;

    budgetDisplay.textContent = formatCurrency(currentBudget);
    spentDisplay.textContent = formatCurrency(totalSpent);
    remainingDisplay.textContent = formatCurrency(remaining);

    // Update progress bar
    const progressBar = document.getElementById('budget-progress');
    if (progressBar && currentBudget > 0) {
        const percentage = Math.min((totalSpent / currentBudget) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.className = `h-full rounded-full transition-all duration-500 ${
            percentage > 90 ? 'bg-red-500' :
            percentage > 70 ? 'bg-yellow-500' :
            'bg-green-500'
        }`;
    }
}

function updateExpensesDisplay() {
    const expensesDiv = document.getElementById('expenses-list');
    if (!expensesDiv) return;

    if (expenses.length === 0) {
        expensesDiv.innerHTML = '<p class="text-gray-500">No expenses recorded</p>';
        return;
    }

    // Sort expenses by date, newest first
    const sortedExpenses = [...expenses].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    expensesDiv.innerHTML = sortedExpenses.map(expense => `
        <div class="bg-white shadow rounded-lg p-4 mb-3">
            <div class="flex justify-between items-center">
                <div>
                    <div class="flex items-center">
                        <span class="text-2xl mr-2">${budgetCategories[expense.category].icon}</span>
                        <div>
                            <h4 class="font-semibold">${expense.description}</h4>
                            <p class="text-sm text-gray-500">${expense.category}</p>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold">${formatCurrency(expense.amount)}</p>
                    <p class="text-sm text-gray-500">${new Date(expense.date).toLocaleDateString()}</p>
                </div>
            </div>
            <button onclick="deleteExpense('${expense.date}')" 
                    class="mt-2 text-red-500 hover:text-red-700 text-sm">
                Delete
            </button>
        </div>
    `).join('');

    // Update charts if they exist
    updateCharts();
}

async function deleteExpense(date) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Please login to delete expenses');
            return;
        }

        const expense = expenses.find(e => e.date === date);
        if (!expense) return;

        expenses = expenses.filter(e => e.date !== date);
        await window.db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayRemove(expense)
        });

        updateExpensesDisplay();
        updateBudgetDisplay();
        showSuccess('Expense deleted successfully');
    } catch (error) {
        console.error('Error deleting expense:', error);
        showError('Failed to delete expense');
    }
}

function resetBudgetData() {
    currentBudget = 0;
    expenses = [];
    updateBudgetDisplay();
    updateExpensesDisplay();
}

// UI feedback functions
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Make delete function available globally
window.deleteExpense = deleteExpense;
