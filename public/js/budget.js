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
    if (isAuthenticated && user) {
        loadBudgetData(user.uid);
    } else {
        resetBudgetData();
    }
});

async function loadBudgetData(userId) {
    try {
        const doc = await db.collection('budgets').doc(userId).get();
        if (doc.exists) {
            budgetData = doc.data();
        } else {
            // Create new budget document for user
            await db.collection('budgets').doc(userId).set(budgetData);
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

    const form = event.target;
    const expense = {
        description: form.description.value,
        amount: parseFloat(form.amount.value),
        category: form.category.value,
        date: new Date().toISOString(),
        recurring: form.recurring.checked,
        frequency: form.frequency.value
    };

    try {
        budgetData.expenses.push(expense);
        await db.collection('budgets').doc(user.uid).update({
            expenses: firebase.firestore.FieldValue.arrayUnion(expense)
        });
        updateBudgetDisplay();
        form.reset();
        showSuccess('Expense added successfully!');
    } catch (error) {
        console.error('Error adding expense:', error);
        showError('Failed to add expense. Please try again.');
    }
}

function updateBudgetDisplay() {
    updateBudgetSummary();
    updateCategorySpending();
    updateExpensesList();
    updateCharts();
}

function updateBudgetSummary() {
    const totalBudgetElement = document.getElementById('total-budget');
    const totalSpentElement = document.getElementById('total-spent');
    const remainingBudgetElement = document.getElementById('remaining-budget');

    const totalSpent = budgetData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budgetData.totalBudget - totalSpent;

    if (totalBudgetElement) totalBudgetElement.textContent = formatCurrency(budgetData.totalBudget);
    if (totalSpentElement) totalSpentElement.textContent = formatCurrency(totalSpent);
    if (remainingBudgetElement) remainingBudgetElement.textContent = formatCurrency(remaining);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

async function setTotalBudget() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Please login to set budget');
        return;
    }

    const amount = parseFloat(prompt('Enter total budget amount in EUR:'));
    if (isNaN(amount) || amount < 0) {
        showError('Please enter a valid amount');
        return;
    }

    try {
        budgetData.totalBudget = amount;
        await db.collection('budgets').doc(user.uid).update({
            totalBudget: amount
        });
        updateBudgetDisplay();
        showSuccess('Budget updated successfully!');
    } catch (error) {
        console.error('Error setting budget:', error);
        showError('Failed to set budget. Please try again.');
    }
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
    if (expenseForm) {
        expenseForm.addEventListener('submit', addExpense);
    }

    const setBudgetBtn = document.getElementById('set-budget-btn');
    if (setBudgetBtn) {
        setBudgetBtn.addEventListener('click', setTotalBudget);
    }
});

// Update expenses list
function updateExpensesList() {
    const tbody = document.getElementById('expenses-tbody');
    tbody.innerHTML = '';

    budgetData.expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(expense => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4">${new Date(expense.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${expense.description}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center">
                        <i class="fas ${budgetCategories[expense.category].icon} mr-2" style="color: ${budgetCategories[expense.category].color}"></i>
                        ${budgetCategories[expense.category].name}
                    </span>
                </td>
                <td class="px-6 py-4">${formatCurrency(expense.amount)}</td>
                <td class="px-6 py-4">
                    <button onclick="deleteExpense('${expense.date}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

// Delete expense
function deleteExpense(date) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const user = firebase.auth().currentUser;
        const expenseIndex = budgetData.expenses.findIndex(expense => expense.date === date);
        if (expenseIndex !== -1) {
            budgetData.expenses.splice(expenseIndex, 1);
            db.collection('budgets').doc(user.uid).update({
                expenses: firebase.firestore.FieldValue.arrayRemove(budgetData.expenses[expenseIndex])
            });
            updateExpensesList();
            updateCategorySpending();
            updateBudgetSummary();
        }
    }
}

// Update category spending
function updateCategorySpending() {
    // Reset category spending
    Object.keys(budgetData.categoryLimits).forEach(category => {
        budgetData.categoryLimits[category].spent = 0;
    });

    // Calculate spending by category
    budgetData.expenses.forEach(expense => {
        budgetData.categoryLimits[expense.category].spent += expense.amount;
    });

    // Update category cards
    const categoryContainer = document.getElementById('category-spending');
    categoryContainer.innerHTML = '';

    Object.entries(budgetCategories).forEach(([key, value]) => {
        const spent = budgetData.categoryLimits[key].spent;
        const limit = budgetData.categoryLimits[key].limit;
        const percentage = limit ? (spent / limit) * 100 : 0;

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-transform duration-300';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                    <i class="fas ${value.icon} text-xl mr-2" style="color: ${value.color}"></i>
                    <h4 class="font-semibold">${value.name}</h4>
                </div>
                <button onclick="editCategoryLimit('${key}')" class="text-blue-500 hover:text-blue-700">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span>Spent: ${formatCurrency(spent)}</span>
                    <span>Limit: ${formatCurrency(limit)}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-500 ${
                        percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
        categoryContainer.appendChild(card);
    });

    updateCharts();
}

// Update charts
function updateCharts() {
    const ctx = document.getElementById('spending-chart').getContext('2d');
    const categories = Object.keys(budgetCategories).map(key => budgetCategories[key].name);
    const spent = Object.keys(budgetCategories).map(key => budgetData.categoryLimits[key].spent);
    const colors = Object.keys(budgetCategories).map(key => budgetCategories[key].color);

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: spent,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });

    // Update line chart for monthly spending
    const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
    const monthlyData = getMonthlySpending();

    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Monthly Spending',
                data: monthlyData.values,
                borderColor: '#4BC0C0',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Get monthly spending data
function getMonthlySpending() {
    const months = {};
    budgetData.expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = (months[monthKey] || 0) + expense.amount;
    });

    const sortedMonths = Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6);

    return {
        labels: sortedMonths.map(([month]) => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        values: sortedMonths.map(([, value]) => value)
    };
}

// Edit category limit
function editCategoryLimit(category) {
    const currentLimit = budgetData.categoryLimits[category].limit;
    const newLimit = parseFloat(prompt(`Enter new limit for ${budgetCategories[category].name}:`, currentLimit));
    
    if (!isNaN(newLimit) && newLimit >= 0) {
        budgetData.categoryLimits[category].limit = newLimit;
        const user = firebase.auth().currentUser;
        db.collection('budgets').doc(user.uid).update({
            [`categoryLimits.${category}.limit`]: newLimit
        });
        updateCategorySpending();
    }
}
