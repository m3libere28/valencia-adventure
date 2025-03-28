// Currency conversion functions
function swapCurrencies() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    if (fromCurrency && toCurrency) {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
    }
}

// Initialize currency functionality
document.addEventListener('DOMContentLoaded', () => {
    const swapButton = document.getElementById('swapCurrencies');
    if (swapButton) {
        swapButton.addEventListener('click', swapCurrencies);
    }

    const convertForm = document.getElementById('currency-form');
    if (convertForm) {
        convertForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('amount').value);
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;
            
            if (!isNaN(amount)) {
                // For now, just show a placeholder conversion
                const result = document.getElementById('conversionResult');
                if (result) {
                    result.textContent = `${amount} ${fromCurrency} = ${(amount * 1.1).toFixed(2)} ${toCurrency}`;
                }
            }
        });
    }
});
