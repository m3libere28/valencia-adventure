// Calculate total initial costs for renting
function calculateTotalCost() {
    const monthlyRent = parseFloat(document.getElementById('monthly-rent').value);
    if (!monthlyRent || monthlyRent <= 0) {
        alert('Please enter a valid monthly rent amount');
        return;
    }

    const depositMonths = parseInt(document.getElementById('deposit-months').value);
    const hasAgencyFee = parseInt(document.getElementById('agency-fee').value) === 1;

    // Calculate components
    const deposit = monthlyRent * depositMonths;
    const firstMonth = monthlyRent;
    const agencyFee = hasAgencyFee ? monthlyRent : 0;
    const total = deposit + firstMonth + agencyFee;

    // Show results
    const resultDiv = document.getElementById('cost-result');
    resultDiv.innerHTML = `
        <h4 class="font-semibold mb-3">Initial Costs Breakdown:</h4>
        <ul class="space-y-2 text-gray-600">
            <li>• Security Deposit: €${deposit.toFixed(2)}</li>
            <li>• First Month's Rent: €${firstMonth.toFixed(2)}</li>
            ${hasAgencyFee ? `<li>• Agency Fee: €${agencyFee.toFixed(2)}</li>` : ''}
            <li class="pt-2 border-t font-semibold">Total Required: €${total.toFixed(2)}</li>
        </ul>
    `;
    resultDiv.classList.remove('hidden');
}
