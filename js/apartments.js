// Apartment data
const apartments = [
    {
        id: 1,
        title: "Modern Apartment in Russafa",
        area: "russafa",
        price: 1200,
        beds: 2,
        baths: 1,
        size: 75,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        features: ["Balcony", "AC", "Elevator"],
        coordinates: [39.4561, -0.3769],
        description: "Beautiful modern apartment in the heart of Russafa"
    },
    {
        id: 2,
        title: "Cozy Studio in Ciutat Vella",
        area: "ciutat-vella",
        price: 800,
        beds: 1,
        baths: 1,
        size: 45,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        features: ["Furnished", "Historic Building"],
        coordinates: [39.4771, -0.3753],
        description: "Charming studio in the historic center"
    },
    {
        id: 3,
        title: "Beach View Apartment",
        area: "cabanyal",
        price: 1400,
        beds: 2,
        baths: 2,
        size: 85,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        features: ["Sea View", "Balcony", "Parking"],
        coordinates: [39.4697, -0.3251],
        description: "Modern apartment with stunning sea views"
    },
    {
        id: 4,
        title: "Family Home in Benimaclet",
        area: "benimaclet",
        price: 1600,
        beds: 3,
        baths: 2,
        size: 110,
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
        features: ["Garden", "Parking", "Storage"],
        coordinates: [39.4850, -0.3567],
        description: "Spacious family home in a quiet neighborhood"
    }
];

let map;
let markers = [];

// Initialize map
function initMap() {
    if (!document.getElementById('apartment-map')) return;

    // Create map centered on Valencia
    map = L.map('apartment-map').setView([39.4699, -0.3763], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Initial display
    displayApartments(apartments);
}

// Create apartment card HTML
function createApartmentCard(apt) {
    return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div class="relative">
                <img src="${apt.image}" alt="${apt.title}" 
                     class="w-full h-48 object-cover">
                <div class="absolute top-4 right-4 bg-white rounded-full px-3 py-1 
                            text-sm font-semibold text-blue-600">
                    €${apt.price}/month
                </div>
            </div>
            
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${apt.title}</h3>
                
                <div class="flex items-center text-gray-600 mb-4">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <span>${apt.area.charAt(0).toUpperCase() + apt.area.slice(1)}</span>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <i class="fas fa-bed text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apt.beds} Bed${apt.beds > 1 ? 's' : ''}</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-bath text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apt.baths} Bath${apt.baths > 1 ? 's' : ''}</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-ruler-combined text-blue-500 mb-1"></i>
                        <p class="text-sm text-gray-600">${apt.size}m²</p>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${apt.features.map(feature => 
                        `<span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                            ${feature}
                        </span>`
                    ).join('')}
                </div>
                
                <button onclick="showDetails(${apt.id})" 
                        class="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                               text-white rounded-lg hover:from-blue-700 hover:to-purple-700 
                               transition-all duration-300">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Display filtered apartments
function displayApartments(filteredApts) {
    // Update results container
    const resultsContainer = document.getElementById('apartment-results');
    if (!resultsContainer) return;

    if (filteredApts.length === 0) {
        resultsContainer.innerHTML = `
            <div class="bg-white rounded-lg p-8 text-center">
                <p class="text-gray-500 text-lg">No apartments found matching your criteria</p>
            </div>`;
        return;
    }

    resultsContainer.innerHTML = filteredApts.map(apt => createApartmentCard(apt)).join('');

    // Update map markers
    updateMapMarkers(filteredApts);
}

// Update map markers
function updateMapMarkers(apts) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add new markers
    apts.forEach(apt => {
        const marker = L.marker(apt.coordinates)
            .bindPopup(`
                <div class="p-3">
                    <h3 class="font-bold mb-2">${apt.title}</h3>
                    <p class="text-blue-600 mb-2">€${apt.price}/month</p>
                    <p class="text-sm">${apt.description}</p>
                </div>
            `)
            .addTo(map);
        markers.push(marker);
    });

    // Adjust map view if there are markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Filter apartments based on selected criteria
function filterApartments() {
    const area = document.getElementById('area-filter').value;
    const price = document.getElementById('price-filter').value;
    const beds = document.getElementById('beds-filter').value;

    const filtered = apartments.filter(apt => {
        // Area filter
        if (area !== 'all' && apt.area !== area) return false;

        // Price filter
        if (price !== 'all') {
            const [min, max] = price.split('-').map(Number);
            if (max) {
                if (apt.price < min || apt.price > max) return false;
            } else {
                // Handle "1600+" case
                if (apt.price < min) return false;
            }
        }

        // Bedrooms filter
        if (beds !== 'all') {
            const bedCount = parseInt(beds);
            if (bedCount === 3) {
                if (apt.beds < 3) return false;
            } else {
                if (apt.beds !== bedCount) return false;
            }
        }

        return true;
    });

    displayApartments(filtered);
}

// Show apartment details
function showDetails(id) {
    const apt = apartments.find(a => a.id === id);
    if (!apt) return;

    const details = `
        ${apt.title}
        Price: €${apt.price}/month
        Area: ${apt.area}
        Size: ${apt.size}m²
        Bedrooms: ${apt.beds}
        Bathrooms: ${apt.baths}
        Features: ${apt.features.join(', ')}
        
        ${apt.description}
    `;

    alert(details); // We can replace this with a modal later
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    initMap();

    // Add filter event listeners
    ['area-filter', 'price-filter', 'beds-filter'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', filterApartments);
    });

    // Initial display
    displayApartments(apartments);
});
