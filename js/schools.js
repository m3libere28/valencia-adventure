// School data with ratings and age ranges
const schoolsData = {
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
            location: [39.4697, -0.3774],
            address: "C/ Guillem de Castro, 153, Valencia",
            curriculum: "Spanish National Curriculum",
            languages: ["Spanish", "Valencian", "English"],
            facilities: ["Playground", "Library", "Computer Lab"],
            extracurricular: ["Sports", "Music", "Language Support"],
            tuitionRange: "Free",
            website: "http://ceip-cervantes-valencia.edu.gva.es",
            goodFor7: true,
            notes: "Strong bilingual program and supportive learning environment"
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

// Initialize map
let map;
let markers = [];

function initMap() {
    // Center on Valencia
    map = L.map('schools-map').setView([39.4699, -0.3763], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for schools suitable for 7-year-olds
    [...schoolsData.international, ...schoolsData.public]
        .filter(school => school.goodFor7)
        .forEach(school => {
            const marker = L.marker(school.location)
                .bindPopup(`
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-2">${school.name}</h3>
                        <p class="text-sm mb-2">Rating: ${'★'.repeat(Math.floor(school.rating))}${school.rating % 1 >= 0.5 ? '½' : ''} (${school.rating})</p>
                        <p class="text-sm mb-2">${school.address}</p>
                        <p class="text-sm mb-2">Ages: ${school.ageRange}</p>
                        <p class="text-sm mb-2">Tuition: ${school.tuitionRange}</p>
                        <p class="text-sm mb-2">Languages: ${school.languages.join(', ')}</p>
                        <p class="text-sm mb-2 text-gray-600">${school.notes}</p>
                        ${school.website ? `<a href="${school.website}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm">Visit Website</a>` : ''}
                    </div>
                `, {
                    maxWidth: 300,
                    className: 'school-popup'
                })
                .addTo(map);
            markers.push(marker);
        });
}

// Generate school cards
function generateSchoolCards() {
    const internationalContainer = document.getElementById('international-schools');
    const publicContainer = document.getElementById('public-schools');

    // Clear existing cards
    internationalContainer.innerHTML = '';
    publicContainer.innerHTML = '';

    // Generate cards for each school type
    schoolsData.international.forEach(school => {
        internationalContainer.appendChild(createSchoolCard(school));
    });

    schoolsData.public.forEach(school => {
        publicContainer.appendChild(createSchoolCard(school));
    });
}

// Create a school card
function createSchoolCard(school) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300';
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">${school.name}</h3>
            <span class="text-sm font-medium px-3 py-1 rounded-full ${
                school.type === 'International' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }">${school.type}</span>
        </div>
        <div class="space-y-2">
            <p class="text-yellow-500">${'★'.repeat(Math.floor(school.rating))}${school.rating % 1 >= 0.5 ? '½' : ''} <span class="text-gray-600">(${school.rating})</span></p>
            <p class="text-gray-600">Ages: ${school.ageRange}</p>
            <p class="text-gray-600">Languages: ${school.languages.join(', ')}</p>
            <p class="text-gray-600">Tuition: ${school.tuitionRange}</p>
            <p class="text-sm text-gray-500 mt-2">${school.notes}</p>
            ${school.goodFor7 ? '<p class="text-green-600 font-medium mt-2"><i class="fas fa-check-circle"></i> Recommended for 7-year-olds</p>' : ''}
        </div>
        <div class="mt-4 flex justify-between items-center">
            <button onclick="showSchoolOnMap([${school.location}])" class="text-blue-500 hover:text-blue-700">
                <i class="fas fa-map-marker-alt mr-1"></i>View on Map
            </button>
            ${school.website ? `
                <a href="${school.website}" target="_blank" class="text-blue-500 hover:text-blue-700">
                    <i class="fas fa-external-link-alt mr-1"></i>Website
                </a>
            ` : ''}
        </div>
    `;
    return card;
}

// Show school on map
function showSchoolOnMap(location) {
    map.setView(location, 15);
    markers.forEach(marker => {
        if (marker.getLatLng().lat === location[0] && marker.getLatLng().lng === location[1]) {
            marker.openPopup();
        }
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    generateSchoolCards();
});
