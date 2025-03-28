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
let budgetData = null;
let doughnutChart = null;
let lineChart = null;
let categoryChart = null; // Store chart instance

async function initializeBudget() {
    if (!isAuthenticated) return;
    
    try {
        budgetData = await apiGet('budget');
        updateBudgetDisplay();
    } catch (error) {
        console.error('Error initializing budget:', error);
    }
}

async function addExpense(event) {
    event.preventDefault();
    
    if (!isAuthenticated) {
        alert('Please login to add expenses');
        return;
    }

    const form = event.target;
    const expense = {
        description: form.description.value,
        amount: parseFloat(form.amount.value),
        category: form.category.value,
        recurring: form.recurring.checked,
        frequency: form.frequency.value
    };

    try {
        budgetData = await apiPost('budget/expenses', expense);
        updateBudgetDisplay();
        form.reset();
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Error adding expense. Please try again.');
    }
}

function updateBudgetDisplay() {
    if (!budgetData) return;

    // Update total budget display
    document.getElementById('totalBudget').textContent = 
        budgetData.totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'EUR' });

    // Update expenses list
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = budgetData.expenses.map(expense => `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-semibold">${expense.description}</h4>
                    <p class="text-sm text-gray-600">${expense.category}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold">${expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}</p>
                    <p class="text-xs text-gray-500">${new Date(expense.date).toLocaleDateString()}</p>
                </div>
            </div>
            ${expense.recurring ? 
                `<p class="text-xs text-blue-600 mt-2">Recurring ${expense.frequency}</p>` : ''}
        </div>
    `).join('');

    // Update category breakdown
    updateCategoryChart();
}

function updateCategoryChart() {
    if (!budgetData) return;

    const ctx = document.getElementById('categoryChart');
    if (!ctx) return; // Exit if canvas element doesn't exist

    const categoryTotals = {};
    
    // Calculate totals for each category
    budgetData.expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Prepare data for the chart
    const data = {
        labels: Object.keys(categoryTotals).map(cat => budgetCategories[cat]?.name || cat),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: Object.keys(categoryTotals).map(cat => budgetCategories[cat]?.color || '#9966FF'),
            borderWidth: 1
        }]
    };

    // Destroy existing chart if it exists
    if (categoryChart) {
        categoryChart.destroy();
    }

    // Create new chart
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Initialize budget when auth state changes
document.addEventListener('DOMContentLoaded', () => {
    if (typeof isAuthenticated !== 'undefined' && isAuthenticated) {
        initializeBudget();
    }
});

// Add event listeners
document.getElementById('expenseForm')?.addEventListener('submit', addExpense);

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Update budget summary
function updateBudgetSummary() {
    const totalExpenses = budgetData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budgetData.totalBudget - totalExpenses;

    document.getElementById('total-budget').textContent = formatCurrency(budgetData.totalBudget || 0);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('remaining-budget').textContent = formatCurrency(remaining);

    // Update progress bar
    const progressBar = document.getElementById('budget-progress');
    const percentage = budgetData.totalBudget ? (totalExpenses / budgetData.totalBudget) * 100 : 0;
    progressBar.style.width = `${Math.min(percentage, 100)}%`;
    progressBar.className = `h-full rounded-full transition-all duration-500 ${
        percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
    }`;
}

// Update category spending
function updateCategorySpending() {
    // Reset category spending
    Object.keys(budgetData.categories).forEach(category => {
        budgetData.categories[category].spent = 0;
    });

    // Calculate spending by category
    budgetData.expenses.forEach(expense => {
        budgetData.categories[expense.category].spent += expense.amount;
    });

    // Update category cards
    const categoryContainer = document.getElementById('category-spending');
    categoryContainer.innerHTML = '';

    Object.entries(budgetCategories).forEach(([key, value]) => {
        const spent = budgetData.categories[key].spent;
        const limit = budgetData.categories[key].limit;
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
    const spent = Object.keys(budgetCategories).map(key => budgetData.categories[key].spent);
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

// Add expense
function addExpenseForm(e) {
    e.preventDefault();
    const form = e.target;
    const expense = {
        id: Date.now(),
        date: form.date.value,
        description: form.description.value,
        category: form.category.value,
        amount: parseFloat(form.amount.value),
        notes: form.notes.value
    };

    budgetData.expenses.push(expense);
    localStorage.setItem('budgetData', JSON.stringify(budgetData));

    updateExpensesList();
    updateCategorySpending();
    updateBudgetSummary();
    form.reset();
}

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
                    <button onclick="deleteExpense(${expense.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        budgetData.expenses = budgetData.expenses.filter(expense => expense.id !== id);
        localStorage.setItem('budgetData', JSON.stringify(budgetData));
        updateExpensesList();
        updateCategorySpending();
        updateBudgetSummary();
    }
}

// Edit category limit
function editCategoryLimit(category) {
    const currentLimit = budgetData.categories[category].limit;
    const newLimit = parseFloat(prompt(`Enter new limit for ${budgetCategories[category].name}:`, currentLimit));
    
    if (!isNaN(newLimit) && newLimit >= 0) {
        budgetData.categories[category].limit = newLimit;
        localStorage.setItem('budgetData', JSON.stringify(budgetData));
        updateCategorySpending();
    }
}

// Set total budget
function setTotalBudget() {
    const newBudget = parseFloat(prompt('Enter your total monthly budget:', budgetData.totalBudget));
    
    if (!isNaN(newBudget) && newBudget >= 0) {
        budgetData.totalBudget = newBudget;
        localStorage.setItem('budgetData', JSON.stringify(budgetData));
        updateBudgetSummary();
    }
}

// Export budget data
function exportBudgetData() {
    const dataStr = JSON.stringify(budgetData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import budget data
function importBudgetData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                budgetData = importedData;
                localStorage.setItem('budgetData', JSON.stringify(budgetData));
                updateExpensesList();
                updateCategorySpending();
                updateBudgetSummary();
                alert('Budget data imported successfully!');
            } catch (error) {
                alert('Error importing budget data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Clear existing budget data
    localStorage.removeItem('budgetData');
    
    // Initialize with new budget
    budgetData = {
        totalBudget: 6000,
        expenses: [],
        categories: Object.fromEntries(
            Object.entries(budgetCategories).map(([key, value]) => [key, { limit: 0, spent: 0 }])
        )
    };
    
    // Save to localStorage
    localStorage.setItem('budgetData', JSON.stringify(budgetData));
    
    // Initialize form handlers
    document.getElementById('expense-form').addEventListener('submit', addExpenseForm);
    document.getElementById('import-budget').addEventListener('change', importBudgetData);
    
    // Update all displays
    updateExpensesList();
    updateCategorySpending();
    updateBudgetSummary();
});

// Export functions for use in other modules
window.addExpense = addExpense;
window.initializeBudget = initializeBudget;
