// Get Firestore instance
const db = firebase.firestore();

// Budget categories with icons and colors
const budgetCategories = {
    housing: { name: 'Housing', icon: 'fa-home', color: '#FF6384' },
    utilities: { name: 'Utilities', icon: 'fa-bolt', color: '#36A2EB' },
    groceries: { name: 'Groceries', icon: 'fa-shopping-cart', color: '#FFCE56' },
    transportation: { name: 'Transportation', icon: 'fa-car', color: '#4BC0C0' },
    healthcare: { name: 'Healthcare', icon: 'fa-hospital', color: '#9966FF' },
    entertainment: { name: 'Entertainment', icon: 'fa-film', color: '#FF9F40' },
    education: { name: 'Education', icon: 'fa-graduation-cap', color: '#FF6384' },
    shopping: { name: 'Shopping', icon: 'fa-shopping-bag', color: '#36A2EB' },
    savings: { name: 'Savings', icon: 'fa-piggy-bank', color: '#4BC0C0' },
    other: { name: 'Other', icon: 'fa-ellipsis-h', color: '#9966FF' }
};

// Budget management
let budgetData = {
    totalBudget: 0,
    expenses: [],
    categoryLimits: {}
};
let doughnutChart = null;
let lineChart = null;
let categoryChart = null;

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

async function loadBudgetData(userId) {
    console.log('Loading budget data for user:', userId);
    try {
        const doc = await db.collection('budgets').doc(userId).get();
        if (doc.exists) {
            budgetData = doc.data();
            console.log('Loaded budget data:', budgetData);
        } else {
            // Create new budget document for user
            await db.collection('budgets').doc(userId).set(budgetData);
            console.log('Created new budget document');
        }
        updateBudgetDisplay();
    } catch (error) {
        console.error('Error loading budget data:', error);
        showError('Failed to load budget data. Please try again.');
    }
}

function resetBudgetData() {
    budgetData = {
        totalBudget: 0,
        expenses: [],
        categoryLimits: {}
    };
    updateBudgetDisplay();
}

async function addExpense(event) {
    event.preventDefault();
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
        budgetData.expenses.push(expense);

        await db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayUnion(expense)
        });

        document.getElementById('expense-form').reset();
        updateBudgetDisplay();
        showSuccess('Expense added successfully!');
    } catch (error) {
        console.error('Error adding expense:', error);
        showError('Failed to add expense. Please try again.');
    }
}

async function handleSetBudget(event) {
    event.preventDefault();
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

        budgetData.totalBudget = amount;
        await db.collection('budgets').doc(user.uid).update({
            totalBudget: amount
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
    updateBudgetSummary();
    updateExpensesList();
    updateCategorySpending();
    updateCharts();
}

function updateBudgetSummary() {
    const totalBudgetDisplay = document.getElementById('total-budget-display');
    const totalExpensesDisplay = document.getElementById('total-expenses');
    const remainingBudgetDisplay = document.getElementById('remaining-budget');

    const totalExpenses = budgetData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = budgetData.totalBudget - totalExpenses;

    if (totalBudgetDisplay) totalBudgetDisplay.textContent = formatCurrency(budgetData.totalBudget);
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

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const budgetForm = document.getElementById('budget-form');

    if (expenseForm) {
        expenseForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await addExpense(event);
            expenseForm.reset();
        });
    }

    if (budgetForm) {
        budgetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleSetBudget(event);
            budgetForm.reset();
        });
    }
});

// Update expenses list
function updateExpensesList() {
    const expenseList = document.getElementById('expense-list');
    if (!expenseList) return;

    if (!budgetData.expenses.length) {
        expenseList.innerHTML = '<p class="text-gray-500 text-center py-4">No expenses yet</p>';
        return;
    }

    expenseList.innerHTML = budgetData.expenses
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

// Delete expense
async function deleteExpense(date) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to delete expenses');
        return;
    }

    try {
        const expense = budgetData.expenses.find(e => e.date === date);
        if (!expense) return;

        await db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayRemove(expense)
        });

        budgetData.expenses = budgetData.expenses.filter(e => e.date !== date);
        updateBudgetDisplay();
        showSuccess('Expense deleted successfully!');
    } catch (error) {
        console.error('Error deleting expense:', error);
        showError('Failed to delete expense. Please try again.');
    }
}

// Update category spending
function updateCategorySpending() {
    const categorySpending = {};
    Object.keys(budgetCategories).forEach(category => {
        categorySpending[category] = 0;
    });

    budgetData.expenses.forEach(expense => {
        if (categorySpending.hasOwnProperty(expense.category)) {
            categorySpending[expense.category] += expense.amount;
        }
    });

    const categoryContainer = document.getElementById('category-spending');
    if (!categoryContainer) return;

    categoryContainer.innerHTML = Object.entries(budgetCategories)
        .map(([category, info]) => {
            const spent = categorySpending[category];
            const percentage = budgetData.totalBudget ? (spent / budgetData.totalBudget) * 100 : 0;
            
            return `
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <i class="fas ${info.icon} text-2xl mr-3" style="color: ${info.color}"></i>
                            <span class="font-medium">${info.name}</span>
                        </div>
                        <span class="text-sm font-medium">${formatCurrency(spent)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-500" 
                             style="width: ${Math.min(percentage, 100)}%; background-color: ${info.color}">
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Update charts
function updateCharts() {
    const ctx = document.getElementById('spending-chart');
    if (!ctx) return;

    const categorySpending = {};
    Object.keys(budgetCategories).forEach(category => {
        categorySpending[category] = 0;
    });

    budgetData.expenses.forEach(expense => {
        if (categorySpending.hasOwnProperty(expense.category)) {
            categorySpending[expense.category] += expense.amount;
        }
    });

    const data = {
        labels: Object.values(budgetCategories).map(cat => cat.name),
        datasets: [{
            data: Object.values(categorySpending),
            backgroundColor: Object.values(budgetCategories).map(cat => cat.color),
            borderWidth: 1
        }]
    };

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}
