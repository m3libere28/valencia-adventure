// Sample apartment data
const apartments = [
    {
        id: 1,
        title: "Modern Apartment in Russafa",
        location: "Russafa",
        price: 1200,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        beds: 2,
        baths: 1,
        size: 75,
        features: ["Balcony", "AC", "Elevator"],
        coordinates: [39.4561, -0.3769],
        description: "Beautiful modern apartment in the heart of Russafa with a spacious balcony and modern amenities."
    },
    {
        id: 2,
        title: "Cozy Studio in El Carmen",
        location: "Ciutat Vella",
        price: 800,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        beds: 1,
        baths: 1,
        size: 45,
        features: ["Furnished", "Historic Building"],
        coordinates: [39.4771, -0.3753],
        description: "Charming studio apartment in the historic center with original features and modern comforts."
    },
    {
        id: 3,
        title: "Luxury Penthouse with Sea View",
        location: "El Cabanyal",
        price: 1600,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        beds: 3,
        baths: 2,
        size: 120,
        features: ["Terrace", "Sea View", "Parking"],
        coordinates: [39.4697, -0.3251],
        description: "Stunning penthouse apartment with panoramic sea views and a large private terrace."
    }
];

let map;
let markers = [];

// Initialize the map
function initApartmentMap() {
    if (!document.getElementById('apartment-map')) return;
    
    map = L.map('apartment-map').setView([39.4699, -0.3763], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    updateMapMarkers(apartments);
}

// Update map markers
function updateMapMarkers(filteredApts) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add new markers
    filteredApts.forEach(apartment => {
        const marker = L.marker(apartment.coordinates)
            .bindPopup(`
                <div class="p-2">
                    <h3 class="font-bold">${apartment.title}</h3>
                    <p class="text-blue-600">€${apartment.price}/month</p>
                    <p class="text-sm mt-1">${apartment.description}</p>
                </div>
            `)
            .addTo(map);
        markers.push(marker);
    });

    // Adjust map view to show all markers if there are any
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Create apartment cards
function createApartmentCards(apartmentsToShow) {
    const container = document.getElementById('apartment-results');
    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';

    if (apartmentsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500 text-lg">No apartments found matching your criteria</p>
            </div>`;
        return;
    }

    apartmentsToShow.forEach(apartment => {
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
                        <p class="text-sm text-gray-600">${apartment.beds} Bed${apartment.beds > 1 ? 's' : ''}</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-bath text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apartment.baths} Bath${apartment.baths > 1 ? 's' : ''}</p>
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
    const neighborhood = document.getElementById('neighborhood-filter')?.value || 'All Areas';
    const priceRange = document.getElementById('price-filter')?.value || 'Any Price';
    const features = document.getElementById('features-filter')?.value || 'Must Have';

    let filteredApartments = apartments.filter(apt => {
        // Neighborhood filter
        if (neighborhood !== 'All Areas' && !apt.location.includes(neighborhood)) {
            return false;
        }

        // Price filter
        if (priceRange !== 'Any Price') {
            const [min, max] = priceRange.match(/\d+/g).map(Number);
            if (max && (apt.price < min || apt.price > max)) {
                return false;
            }
            if (!max && apt.price > min) {
                return false;
            }
        }

        // Features filter
        if (features !== 'Must Have' && !apt.features.includes(features)) {
            return false;
        }

        return true;
    });

    // Update UI
    createApartmentCards(filteredApartments);
    if (map) {
        updateMapMarkers(filteredApartments);
    }
}

// View apartment details
function viewApartmentDetails(id) {
    const apartment = apartments.find(apt => apt.id === id);
    if (!apartment) return;

    // You can implement a modal or redirect to a details page here
    alert(`
${apartment.title}
Price: €${apartment.price}/month
Location: ${apartment.location}
Size: ${apartment.size}m²
Features: ${apartment.features.join(', ')}
${apartment.description}
    `);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initApartmentMap();
    createApartmentCards(apartments);

    // Add event listeners to filters
    const filters = ['neighborhood-filter', 'price-filter', 'features-filter'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', filterApartments);
        }
    });
});
