// Calculate total initial costs for renting
function calculateTotalCost() {
    const monthlyRent = parseFloat(document.getElementById('monthly-rent').value);
    if (!monthlyRent || monthlyRent <= 0) {
        showError('Please enter a valid monthly rent amount');
        return;
    }

    const depositMonths = parseInt(document.getElementById('deposit-months').value);
    const hasAgencyFee = parseInt(document.getElementById('agency-fee').value) === 1;
    const includeUtilities = document.getElementById('include-utilities').checked;

    // Estimated utility costs (average for Valencia)
    const utilityEstimates = {
        electricity: 80,
        water: 30,
        internet: 40,
        gas: 30
    };

    // Calculate components
    const deposit = monthlyRent * depositMonths;
    const firstMonth = monthlyRent;
    const agencyFee = hasAgencyFee ? monthlyRent : 0;
    const utilities = includeUtilities ? Object.values(utilityEstimates).reduce((a, b) => a + b, 0) : 0;
    const total = deposit + firstMonth + agencyFee + utilities;

    // Calculate monthly ongoing costs
    const monthlyTotal = monthlyRent + (includeUtilities ? utilities : 0);

    // Show results with animation
    const resultDiv = document.getElementById('cost-result');
    resultDiv.innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-lg mb-3 text-blue-800">Initial Costs:</h4>
                <ul class="space-y-2 text-gray-600">
                    <li class="flex justify-between items-center animate-slide-in" style="animation-delay: 0.1s">
                        <span>Security Deposit:</span>
                        <span class="font-medium">€${deposit.toFixed(2)}</span>
                    </li>
                    <li class="flex justify-between items-center animate-slide-in" style="animation-delay: 0.2s">
                        <span>First Month's Rent:</span>
                        <span class="font-medium">€${firstMonth.toFixed(2)}</span>
                    </li>
                    ${hasAgencyFee ? `
                        <li class="flex justify-between items-center animate-slide-in" style="animation-delay: 0.3s">
                            <span>Agency Fee:</span>
                            <span class="font-medium">€${agencyFee.toFixed(2)}</span>
                        </li>
                    ` : ''}
                    ${includeUtilities ? `
                        <li class="flex justify-between items-center animate-slide-in" style="animation-delay: 0.4s">
                            <span>Utility Setup:</span>
                            <span class="font-medium">€${utilities.toFixed(2)}</span>
                        </li>
                    ` : ''}
                    <li class="flex justify-between items-center font-semibold text-lg text-blue-800 pt-2 border-t animate-slide-in" 
                        style="animation-delay: 0.5s">
                        <span>Total Initial Cost:</span>
                        <span>€${total.toFixed(2)}</span>
                    </li>
                </ul>
            </div>

            ${includeUtilities ? `
                <div class="bg-purple-50 p-4 rounded-lg animate-slide-in" style="animation-delay: 0.6s">
                    <h4 class="font-semibold text-lg mb-3 text-purple-800">Monthly Utilities Estimate:</h4>
                    <ul class="space-y-2 text-gray-600">
                        <li class="flex justify-between items-center">
                            <span>Electricity:</span>
                            <span class="font-medium">€${utilityEstimates.electricity.toFixed(2)}</span>
                        </li>
                        <li class="flex justify-between items-center">
                            <span>Water:</span>
                            <span class="font-medium">€${utilityEstimates.water.toFixed(2)}</span>
                        </li>
                        <li class="flex justify-between items-center">
                            <span>Internet:</span>
                            <span class="font-medium">€${utilityEstimates.internet.toFixed(2)}</span>
                        </li>
                        <li class="flex justify-between items-center">
                            <span>Gas:</span>
                            <span class="font-medium">€${utilityEstimates.gas.toFixed(2)}</span>
                        </li>
                    </ul>
                </div>
            ` : ''}

            <div class="bg-green-50 p-4 rounded-lg animate-slide-in" style="animation-delay: 0.7s">
                <h4 class="font-semibold text-lg mb-2 text-green-800">Monthly Ongoing Costs:</h4>
                <div class="flex justify-between items-center text-gray-600">
                    <span>Total Monthly Payment:</span>
                    <span class="font-semibold text-lg">€${monthlyTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    resultDiv.classList.remove('hidden');
}

// Show error message
function showError(message) {
    const resultDiv = document.getElementById('cost-result');
    resultDiv.innerHTML = `
        <div class="bg-red-50 text-red-800 p-4 rounded-lg animate-shake">
            <i class="fas fa-exclamation-circle mr-2"></i>
            ${message}
        </div>
    `;
    resultDiv.classList.remove('hidden');
}
