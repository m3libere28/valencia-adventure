// Set the target date for July 1, 2026
const targetDate = new Date('2026-07-01T00:00:00');

function updateCountdown() {
    const currentDate = new Date();
    const difference = targetDate - currentDate;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Update the countdown display with animation
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const timeUnits = [
            { value: days, label: 'days' },
            { value: hours, label: 'hours' },
            { value: minutes, label: 'minutes' },
            { value: seconds, label: 'seconds' }
        ];

        countdownElement.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${timeUnits.map(unit => `
                    <div class="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 transition-all duration-300">
                        <div class="text-4xl font-bold text-blue-600 mb-2">${String(unit.value).padStart(2, '0')}</div>
                        <div class="text-gray-600 text-sm">${unit.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-4 text-gray-600">
                Until the Big Move to Valencia!
            </div>
        `;
    }
}

// Update countdown every second
setInterval(updateCountdown, 1000);

// Initial update
document.addEventListener('DOMContentLoaded', updateCountdown);
