// Currency conversion functionality
const exchangeRates = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.85
};

let fromCurrency = 'USD';
let toCurrency = 'EUR';

function swapCurrencies() {
    [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
    
    // Swap select values
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    if (fromSelect && toSelect) {
        [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
    }
    
    // Trigger conversion
    convertCurrency();
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const result = document.getElementById('conversion-result');
    
    if (!result) return;

    try {
        // Convert to EUR first (base currency)
        const amountInEUR = amount / exchangeRates[fromCurrency];
        // Then convert to target currency
        const finalAmount = amountInEUR * exchangeRates[toCurrency];
        
        result.textContent = formatCurrency(finalAmount, toCurrency);
    } catch (error) {
        console.error('Currency conversion error:', error);
        result.textContent = 'Conversion error';
    }
}

function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Initialize currency conversion
document.addEventListener('DOMContentLoaded', () => {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const amountInput = document.getElementById('amount');
    const swapButton = document.getElementById('swap-currencies');

    if (fromSelect) {
        fromSelect.addEventListener('change', (e) => {
            fromCurrency = e.target.value;
            convertCurrency();
        });
    }

    if (toSelect) {
        toSelect.addEventListener('change', (e) => {
            toCurrency = e.target.value;
            convertCurrency();
        });
    }

    if (amountInput) {
        amountInput.addEventListener('input', convertCurrency);
    }

    if (swapButton) {
        swapButton.addEventListener('click', swapCurrencies);
    }
});
