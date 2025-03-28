// Sample apartment data
const apartments = [
    {
        id: 1,
        title: "Modern Apartment in Russafa",
        location: "Russafa, Valencia",
        price: 1200,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        beds: 2,
        baths: 1,
        size: 75,
        features: ["Balcony", "AC", "Elevator"],
        coordinates: [39.4561, -0.3769]
    },
    {
        id: 2,
        title: "Cozy Studio in El Carmen",
        location: "Ciutat Vella, Valencia",
        price: 800,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        beds: 1,
        baths: 1,
        size: 45,
        features: ["Furnished", "Historic Building"],
        coordinates: [39.4771, -0.3753]
    },
    {
        id: 3,
        title: "Luxury Penthouse with Sea View",
        location: "El Cabanyal, Valencia",
        price: 1600,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        beds: 3,
        baths: 2,
        size: 120,
        features: ["Terrace", "Sea View", "Parking"],
        coordinates: [39.4697, -0.3251]
    }
];

let map;
let markers = [];

// Initialize the map
function initApartmentMap() {
    map = L.map('apartment-map').setView([39.4699, -0.3763], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for each apartment
    apartments.forEach(apartment => {
        const marker = L.marker(apartment.coordinates)
            .bindPopup(`
                <div class="p-2">
                    <h3 class="font-bold">${apartment.title}</h3>
                    <p class="text-blue-600">€${apartment.price}/month</p>
                </div>
            `)
            .addTo(map);
        markers.push(marker);
    });
}

// Create apartment cards
function createApartmentCards() {
    const container = document.querySelector('#apartment-results');
    if (!container) return;

    apartments.forEach(apartment => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';
        card.innerHTML = `
            <div class="relative">
                <img src="${apartment.image}" class="w-full h-48 object-cover" alt="${apartment.title}">
                <div class="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold text-blue-600">
                    €${apartment.price}/month
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-2">${apartment.title}</h3>
                <div class="flex items-center text-gray-600 mb-4">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <span>${apartment.location}</span>
                </div>
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <i class="fas fa-bed text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apartment.beds} Beds</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-bath text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apartment.baths} Bath</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-ruler-combined text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apartment.size}m²</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${apartment.features.map(feature => 
                        `<span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">${feature}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="p-6 pt-0">
                <button onclick="viewApartmentDetails(${apartment.id})" 
                        class="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg
                               hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                    View Details
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Filter apartments
function filterApartments() {
    const neighborhood = document.querySelector('#neighborhood-filter').value;
    const priceRange = document.querySelector('#price-filter').value;
    const features = document.querySelector('#features-filter').value;

    // Update UI based on filters
    const filteredApartments = apartments.filter(apt => {
        if (neighborhood !== 'All Areas' && !apt.location.includes(neighborhood)) return false;
        if (priceRange !== 'Any Price') {
            const price = parseInt(priceRange.match(/\d+/g)[0]);
            if (apt.price > price) return false;
        }
        if (features !== 'Must Have' && !apt.features.includes(features)) return false;
        return true;
    });

    // Update map markers and apartment cards
    updateResults(filteredApartments);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initApartmentMap();
    createApartmentCards();

    // Add event listeners to filters
    const filters = ['neighborhood-filter', 'price-filter', 'features-filter'];
    filters.forEach(id => {
        document.querySelector(`#${id}`)?.addEventListener('change', filterApartments);
    });
});
