// Schools data
let schoolsData = [];

// Initialize schools when auth state changes
document.addEventListener('DOMContentLoaded', () => {
    // Listen for auth state changes
    window.addEventListener('authStateChanged', async (event) => {
        const { isAuthenticated, user } = event.detail;
        if (isAuthenticated && user) {
            await loadSchoolsData(user.uid);
        } else {
            resetSchoolsData();
        }
    });
});

// Initialize map
let map;
let markers = [];
let markerLayer;

// Initialize map
function initMap() {
    // Create map centered on Valencia
    map = L.map('schools-map').setView([39.4699, -0.3763], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Create marker layer group
    markerLayer = L.layerGroup().addTo(map);

    // Add markers for all schools
    [...schoolsData.international, ...schoolsData.public].forEach(school => {
        if (school.location) {
            const marker = L.marker(school.location)
                .bindPopup(`
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-2">${school.name}</h3>
                        <p class="text-sm mb-2">${school.type} School</p>
                        <p class="text-sm mb-2">Ages: ${school.ageRange}</p>
                        <p class="text-sm">${school.address}</p>
                        <a href="${school.website}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm">Visit Website</a>
                    </div>
                `);
            markers.push(marker);
            markerLayer.addLayer(marker);
        }
    });

    // Add event listener for map clicks
    map.on('click', function(e) {
        console.log('Map clicked at:', e.latlng);
    });
}

// Generate school cards
function generateSchoolCards() {
    const internationalContainer = document.getElementById('international-schools');
    const publicContainer = document.getElementById('public-schools');

    if (internationalContainer) {
        schoolsData.international.forEach(school => {
            internationalContainer.appendChild(createSchoolCard(school));
        });
    }

    if (publicContainer) {
        schoolsData.public.forEach(school => {
            publicContainer.appendChild(createSchoolCard(school));
        });
    }
}

// Create a school card
function createSchoolCard(school) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300';
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-semibold mb-2">${school.name}</h3>
                <div class="flex items-center mb-2">
                    <span class="text-yellow-500">${'★'.repeat(Math.floor(school.rating))}${school.rating % 1 >= 0.5 ? '½' : ''}</span>
                    <span class="text-gray-600 ml-2">${school.rating}</span>
                </div>
                <p class="text-gray-600">Ages: ${school.ageRange}</p>
            </div>
            <button onclick="showSchoolOnMap([${school.location}])" class="text-blue-500 hover:text-blue-700">
                <i class="fas fa-map-marker-alt"></i>
            </button>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600">
            <p><i class="fas fa-graduation-cap mr-2"></i>${school.curriculum}</p>
            <p><i class="fas fa-language mr-2"></i>${school.languages.join(', ')}</p>
            <p><i class="fas fa-euro-sign mr-2"></i>${school.tuitionRange}</p>
        </div>
        
        <div class="mt-4">
            <div class="flex flex-wrap gap-2 mb-2">
                ${school.facilities.map(facility => `
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ${facility}
                    </span>
                `).join('')}
            </div>
            <div class="flex flex-wrap gap-2">
                ${school.extracurricular.map(activity => `
                    <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        ${activity}
                    </span>
                `).join('')}
            </div>
        </div>
        
        <div class="mt-4 text-sm text-gray-600">
            <p><i class="fas fa-info-circle mr-2"></i>${school.notes}</p>
        </div>
        
        <div class="mt-4">
            <a href="${school.website}" target="_blank" class="text-blue-500 hover:text-blue-700">
                <i class="fas fa-external-link-alt mr-2"></i>Visit Website
            </a>
        </div>
    `;
    return card;
}

// Show school on map
function showSchoolOnMap(location) {
    if (!location || !map) return;
    map.setView(location, 15);
    const marker = markers.find(m => 
        m.getLatLng().lat === location[0] && 
        m.getLatLng().lng === location[1]
    );
    if (marker) marker.openPopup();
}

// Load schools data
async function loadSchoolsData(uid) {
    // TO DO: Load schools data from database or API
    schoolsData = {
        international: [
            {
                name: "American School of Valencia",
                type: "International",
                rating: 4.8,
                ageRange: "3-18",
                location: [39.5228, -0.4606],
                address: "Av. Serra Calderona, 3, 46530 Puçol, Valencia",
                curriculum: "American, IB",
                languages: ["English", "Spanish"],
                facilities: ["Pool", "Sports Fields", "Science Labs", "Art Studio"],
                extracurricular: ["Sports", "Music", "Drama", "Robotics"],
                tuitionRange: "€12,000 - €18,000",
                website: "https://asvalencia.org",
                goodFor7: true,
                notes: "Strong elementary program with small class sizes and experienced teachers"
            },
            {
                name: "Cambridge House Community College",
                type: "International",
                rating: 4.7,
                ageRange: "3-18",
                location: [39.5075, -0.4147],
                address: "C/ Profesorado Español, 1, 46111 Rocafort, Valencia",
                curriculum: "British, Cambridge",
                languages: ["English", "Spanish", "Valencian"],
                facilities: ["Library", "Sports Complex", "Science Labs", "Music Room"],
                extracurricular: ["Swimming", "Chess", "Coding", "Arts"],
                tuitionRange: "€11,000 - €17,000",
                website: "https://cambridgehouse.es",
                goodFor7: true,
                notes: "Excellent primary education with focus on creative development"
            },
            {
                name: "British School of Valencia",
                type: "International",
                rating: 4.6,
                ageRange: "2-18",
                location: [39.4789, -0.3247],
                address: "Carrer Saler 19, L'Eliana, Valencia",
                curriculum: "British National Curriculum",
                languages: ["English", "Spanish"],
                facilities: ["Modern Classrooms", "Sports Fields", "Theater"],
                extracurricular: ["Sports", "Arts", "Technology"],
                tuitionRange: "€10,000 - €16,000",
                website: "https://bsvalencia.com",
                goodFor7: true,
                notes: "Strong emphasis on individual attention and pastoral care"
            },
            {
                name: "Caxton College",
                type: "International",
                rating: 4.7,
                ageRange: "1-18",
                location: [39.5437, -0.4672],
                address: "C/ Mas de León, 5, Puçol, Valencia",
                curriculum: "British, Spanish",
                languages: ["English", "Spanish"],
                facilities: ["Swimming Pool", "Sports Center", "Art Studios"],
                extracurricular: ["Music", "Sports", "Drama"],
                tuitionRange: "€11,500 - €17,500",
                website: "https://caxtoncollege.com",
                goodFor7: true,
                notes: "Excellent integration program for international students"
            }
        ],
        public: [
            {
                name: "CEIP Cervantes",
                type: "Public",
                rating: 4.5,
                ageRange: "3-12",
                location: [39.4699, -0.3763],
                address: "Carrer de Guillem de Castro, 153, 46008 València",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Playground", "Library", "Computer Lab"],
                extracurricular: ["Sports", "Music", "Art"],
                tuitionRange: "Free",
                website: "http://mestreacasa.gva.es/web/ceipcervantes",
                goodFor7: true,
                notes: "Historic school with strong community involvement"
            },
            {
                name: "CEIP Luis Vives",
                type: "Public",
                rating: 4.4,
                ageRange: "3-12",
                location: [39.4715, -0.3825],
                address: "C/ San Pablo, 4, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Sports Court", "Library", "Art Room"],
                extracurricular: ["Sports", "Arts", "Homework Support"],
                tuitionRange: "Free",
                website: "http://ceip-luisvives-valencia.edu.gva.es",
                goodFor7: true,
                notes: "Well-established school with strong community involvement"
            },
            {
                name: "CEIP Teodoro Llorente",
                type: "Public",
                rating: 4.3,
                ageRange: "3-12",
                location: [39.4789, -0.3834],
                address: "C/ Juan Llorens, 56, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Playground", "Library", "Science Lab"],
                extracurricular: ["Sports", "Music"],
                tuitionRange: "Free",
                website: "http://ceip-teodorollorente.edu.gva.es",
                notes: "Focus on science and technology education"
            },
            {
                name: "CEIP Jaime Balmes",
                type: "Public",
                rating: 4.2,
                ageRange: "3-12",
                location: [39.4623, -0.3789],
                address: "C/ Maestro Aguilar, 15, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Sports Field", "Library", "Computer Room"],
                extracurricular: ["Sports", "Theatre", "Music"],
                tuitionRange: "Free",
                website: "http://ceip-jaimebalmes.edu.gva.es",
                notes: "Strong emphasis on performing arts"
            },
            {
                name: "CEIP Max Aub",
                type: "Public",
                rating: 4.3,
                ageRange: "3-12",
                location: [39.4843, -0.3692],
                address: "C/ Padre Urbano, s/n, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian", "English"],
                facilities: ["Large Playground", "Library", "Music Room"],
                extracurricular: ["Sports", "English Club", "Chess"],
                tuitionRange: "Free",
                website: "http://ceip-maxaub.edu.gva.es",
                notes: "Strong focus on language learning"
            },
            {
                name: "CEIP Padre Catalá",
                type: "Public",
                rating: 4.1,
                ageRange: "3-12",
                location: [39.4892, -0.3751],
                address: "C/ Padre Catalá, 48, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Sports Court", "Library", "Garden"],
                extracurricular: ["Sports", "Gardening", "Arts"],
                tuitionRange: "Free",
                website: "http://ceip-padrecatala.edu.gva.es",
                notes: "Environmental education focus"
            },
            {
                name: "CEIP Salvador Tuset",
                type: "Public",
                rating: 4.2,
                ageRange: "3-12",
                location: [39.4567, -0.3812],
                address: "C/ Salvador Tuset, 13, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Playground", "Library", "Art Room"],
                extracurricular: ["Sports", "Art Workshop", "Music"],
                tuitionRange: "Free",
                website: "http://ceip-salvadortuset.edu.gva.es",
                notes: "Strong arts and cultural program"
            },
            {
                name: "CEIP San Juan de Ribera",
                type: "Public",
                rating: 4.4,
                ageRange: "3-12",
                location: [39.4734, -0.3654],
                address: "C/ Cirilo Amorós, 3, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian", "English"],
                facilities: ["Modern Classrooms", "Library", "Computer Lab"],
                extracurricular: ["Sports", "Robotics", "Languages"],
                tuitionRange: "Free",
                website: "http://ceip-sanjuanderibera.edu.gva.es",
                notes: "Innovation in education and technology"
            },
            {
                name: "CEIP Mestalla",
                type: "Public",
                rating: 4.3,
                ageRange: "3-12",
                location: [39.4756, -0.3589],
                address: "C/ Ernesto Ferrer, 2, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Sports Facilities", "Library", "Music Room"],
                extracurricular: ["Sports", "Music", "Dance"],
                tuitionRange: "Free",
                website: "http://ceip-mestalla.edu.gva.es",
                notes: "Strong physical education program"
            },
            {
                name: "CEIP Professor Santiago Grisolía",
                type: "Public",
                rating: 4.2,
                ageRange: "3-12",
                location: [39.4912, -0.3823],
                address: "C/ Poeta Bodria, 5, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian", "English"],
                facilities: ["Science Lab", "Library", "Computer Room"],
                extracurricular: ["Science Club", "Sports", "English"],
                tuitionRange: "Free",
                website: "http://ceip-santiagogrisolia.edu.gva.es",
                notes: "Excellence in science education"
            },
            {
                name: "CEIP Benimaclet",
                type: "Public",
                rating: 4.3,
                ageRange: "3-12",
                location: [39.4867, -0.3567],
                address: "C/ Arquitecto Arnau, 30, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Garden", "Library", "Sports Court"],
                extracurricular: ["Environmental Club", "Sports", "Music"],
                tuitionRange: "Free",
                website: "http://ceip-benimaclet.edu.gva.es",
                notes: "Community-oriented school with environmental focus"
            },
            {
                name: "CEIP Ciudad de Bolonia",
                type: "Public",
                rating: 4.1,
                ageRange: "3-12",
                location: [39.4589, -0.3934],
                address: "C/ Casa de la Misericordia, 34, Valencia",
                curriculum: "Spanish National Curriculum",
                languages: ["Spanish", "Valencian"],
                facilities: ["Playground", "Library", "Art Room"],
                extracurricular: ["Sports", "Art", "Theatre"],
                tuitionRange: "Free",
                website: "http://ceip-ciudaddebolonia.edu.gva.es",
                notes: "Focus on creative development"
            }
        ]
    };
    initMap();
    generateSchoolCards();
}

// Reset schools data
function resetSchoolsData() {
    schoolsData = [];
    markers.forEach(marker => marker.remove());
    markers = [];
    markerLayer.clearLayers();
}
