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

// Helper functions
async function loadBudgetData(userId) {
    try {
        const doc = await window.db.collection('budgets').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            currentBudget = data.budget || 0;
            expenses = data.expenses || [];
        } else {
            // Create new budget document for user
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
        showError('Failed to load budget data. Please try again.');
    }
}

function resetBudgetData() {
    currentBudget = 0;
    expenses = [];
    updateBudgetDisplay();
    updateExpensesDisplay();
}

// Initialize budget when auth state changes
window.addEventListener('authStateChanged', (event) => {
    const { isAuthenticated, user } = event.detail;
    console.log('Auth state changed in budget.js:', isAuthenticated, user);
    if (isAuthenticated && user) {
        loadBudgetData(user.uid);
    } else {
        resetBudgetData();
    }
});

async function addExpense() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to add expenses');
        return;
    }

    try {
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value;
        const date = new Date().toISOString();

        if (!amount || !category) {
            showError('Please fill in all required fields');
            return;
        }

        const expense = { amount, category, description, date };
        expenses.push(expense);

        await window.db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayUnion(expense)
        });

        document.getElementById('expense-form').reset();
        updateBudgetDisplay();
        updateExpensesDisplay();
        showSuccess('Expense added successfully!');
    } catch (error) {
        console.error('Error adding expense:', error);
        showError('Failed to add expense. Please try again.');
    }
}

async function handleSetBudget() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to set budget');
        return;
    }

    try {
        const amount = parseFloat(document.getElementById('total-budget').value);
        if (!amount || amount <= 0) {
            showError('Please enter a valid budget amount');
            return;
        }

        currentBudget = amount;
        await window.db.collection('budgets').doc(user.uid).update({
            budget: amount
        });

        document.getElementById('budget-form').reset();
        updateBudgetDisplay();
        showSuccess('Budget updated successfully!');
    } catch (error) {
        console.error('Error setting budget:', error);
        showError('Failed to set budget. Please try again.');
    }
}

function updateBudgetDisplay() {
    const totalBudgetDisplay = document.getElementById('total-budget-display');
    const totalExpensesDisplay = document.getElementById('total-expenses');
    const remainingBudgetDisplay = document.getElementById('remaining-budget');

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = currentBudget - totalExpenses;

    if (totalBudgetDisplay) totalBudgetDisplay.textContent = formatCurrency(currentBudget);
    if (totalExpensesDisplay) totalExpensesDisplay.textContent = formatCurrency(totalExpenses);
    if (remainingBudgetDisplay) remainingBudgetDisplay.textContent = formatCurrency(remainingBudget);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

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

function updateExpensesDisplay() {
    const expenseList = document.getElementById('expense-list');
    if (!expenseList) return;

    if (!expenses.length) {
        expenseList.innerHTML = '<p class="text-gray-500 text-center py-4">No expenses yet</p>';
        return;
    }

    expenseList.innerHTML = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <div class="flex justify-between items-center py-4 border-b last:border-0">
                <div>
                    <p class="font-medium">${expense.description}</p>
                    <p class="text-sm text-gray-500">
                        <span class="inline-flex items-center">
                            <i class="fas ${budgetCategories[expense.category].icon} mr-2" style="color: ${budgetCategories[expense.category].color}"></i>
                            ${budgetCategories[expense.category].name}
                        </span>
                        • ${new Date(expense.date).toLocaleDateString()}
                    </p>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="font-medium">${formatCurrency(expense.amount)}</span>
                    <button onclick="deleteExpense('${expense.date}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
}

async function deleteExpense(date) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to delete expenses');
        return;
    }

    try {
        const expense = expenses.find(e => e.date === date);
        if (!expense) return;

        await window.db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayRemove(expense)
        });

        expenses = expenses.filter(e => e.date !== date);
        updateBudgetDisplay();
        updateExpensesDisplay();
        showSuccess('Expense deleted successfully!');
    } catch (error) {
        console.error('Error deleting expense:', error);
        showError('Failed to delete expense. Please try again.');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const budgetForm = document.getElementById('budget-form');

    if (expenseForm) {
        expenseForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await addExpense();
            expenseForm.reset();
        });
    }

    if (budgetForm) {
        budgetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleSetBudget();
            budgetForm.reset();
        });
    }
});
