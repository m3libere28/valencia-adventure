// Currency conversion functions
function swapCurrencies() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const tempValue = fromSelect.value;
    
    fromSelect.value = toSelect.value;
    toSelect.value = tempValue;
    
    // Trigger conversion with new values
    convertCurrency();
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    if (isNaN(amount)) {
        document.getElementById('result').textContent = 'Please enter a valid amount';
        return;
    }
    
    // Example fixed rates (replace with actual API call)
    const rates = {
        EUR: 1,
        USD: 1.08,
        GBP: 0.85,
        JPY: 163.45,
        AUD: 1.65,
        CAD: 1.47,
        CHF: 0.98,
        CNY: 7.82
    };
    
    const result = (amount / rates[fromCurrency]) * rates[toCurrency];
    document.getElementById('result').textContent = 
        `${amount.toFixed(2)} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;
}

// Initialize currency converter
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners for currency conversion
    document.getElementById('amount').addEventListener('input', convertCurrency);
    document.getElementById('from-currency').addEventListener('change', convertCurrency);
    document.getElementById('to-currency').addEventListener('change', convertCurrency);
});
