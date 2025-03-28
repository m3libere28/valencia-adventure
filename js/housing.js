// Utility cost estimates for Valencia (average monthly)
const utilityCosts = {
    electricity: 80, // €/month
    water: 30,      // €/month
    internet: 40,   // €/month
    gas: 25         // €/month
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function calculateTotalCost() {
    // Get input values
    const monthlyRent = parseFloat(document.getElementById('monthly-rent').value);
    const depositMonths = parseInt(document.getElementById('deposit-months').value);
    const agencyFee = parseInt(document.getElementById('agency-fee').value);
    const includeUtilities = document.getElementById('include-utilities').checked;
    
    // Validate input
    if (isNaN(monthlyRent) || monthlyRent <= 0) {
        document.getElementById('cost-result').innerHTML = `
            <div class="text-red-600">
                <i class="fas fa-exclamation-circle"></i>
                Please enter a valid monthly rent amount
            </div>
        `;
        return;
    }

    // Calculate costs
    const deposit = monthlyRent * depositMonths;
    const agencyFeeAmount = agencyFee ? monthlyRent : 0;
    let monthlyUtilities = 0;
    
    if (includeUtilities) {
        monthlyUtilities = Object.values(utilityCosts).reduce((a, b) => a + b, 0);
    }

    const totalMonthly = monthlyRent + (includeUtilities ? monthlyUtilities : 0);
    const initialCosts = deposit + agencyFeeAmount;
    
    // Format results
    const resultHTML = `
        <div class="space-y-4">
            <div class="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</div>
            
            <!-- Initial Costs -->
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="font-medium text-blue-800 mb-2">Initial Costs</div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Security Deposit (${depositMonths} month${depositMonths > 1 ? 's' : ''})</span>
                        <span class="font-medium">${formatCurrency(deposit)}</span>
                    </div>
                    ${agencyFeeAmount > 0 ? `
                        <div class="flex justify-between">
                            <span>Agency Fee</span>
                            <span class="font-medium">${formatCurrency(agencyFeeAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-blue-900 font-semibold pt-2 border-t border-blue-200">
                        <span>Total Initial Costs</span>
                        <span>${formatCurrency(initialCosts)}</span>
                    </div>
                </div>
            </div>

            <!-- Monthly Costs -->
            <div class="bg-purple-50 p-4 rounded-lg">
                <div class="font-medium text-purple-800 mb-2">Monthly Costs</div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Base Rent</span>
                        <span class="font-medium">${formatCurrency(monthlyRent)}</span>
                    </div>
                    ${includeUtilities ? `
                        <div class="space-y-1 pt-2 border-t border-purple-200">
                            <div class="text-purple-700 font-medium mb-1">Estimated Utilities</div>
                            <div class="flex justify-between">
                                <span>Electricity</span>
                                <span>${formatCurrency(utilityCosts.electricity)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Water</span>
                                <span>${formatCurrency(utilityCosts.water)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Internet</span>
                                <span>${formatCurrency(utilityCosts.internet)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Gas</span>
                                <span>${formatCurrency(utilityCosts.gas)}</span>
                            </div>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-purple-900 font-semibold pt-2 border-t border-purple-200">
                        <span>Total Monthly Costs</span>
                        <span>${formatCurrency(totalMonthly)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Show results with fade-in animation
    const resultElement = document.getElementById('cost-result');
    resultElement.style.opacity = '0';
    resultElement.innerHTML = resultHTML;
    resultElement.classList.remove('hidden');
    
    // Trigger reflow for animation
    void resultElement.offsetWidth;
    resultElement.style.transition = 'opacity 0.3s ease-in-out';
    resultElement.style.opacity = '1';
}
