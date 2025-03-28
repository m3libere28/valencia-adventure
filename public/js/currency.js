// Currency exchange functionality
async function getExchangeRate() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();
        
        if (response.ok) {
            const rate = data.rates[toCurrency];
            const result = (amount * rate).toFixed(2);
            
            document.getElementById('result').innerHTML = `
                <div class="text-2xl font-semibold text-gray-900 mb-2">
                    ${amount} ${fromCurrency} = ${result} ${toCurrency}
                </div>
                <div class="text-sm text-gray-600">
                    1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}
                </div>
                <div class="text-xs text-gray-500 mt-2">
                    Last updated: ${new Date(data.time_last_updated * 1000).toLocaleString()}
                </div>
            `;
        } else {
            throw new Error('Failed to fetch exchange rate');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `
            <div class="text-red-600">
                Unable to fetch exchange rate. Please try again later.
            </div>
        `;
    }
}

// Swap currencies
function swapCurrencies() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
    getExchangeRate();
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to inputs
    document.getElementById('amount').addEventListener('input', getExchangeRate);
    document.getElementById('fromCurrency').addEventListener('change', getExchangeRate);
    document.getElementById('toCurrency').addEventListener('change', getExchangeRate);
    
    // Set initial values
    document.getElementById('amount').value = '1';
    document.getElementById('fromCurrency').value = 'USD';
    document.getElementById('toCurrency').value = 'EUR';
    
    // Get initial exchange rate
    getExchangeRate();
});
