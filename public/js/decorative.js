// Spanish-themed decorative elements
const decorativeElements = [
    { icon: '🌺', title: 'Hibiscus', class: 'text-2xl' },
    { icon: '🍊', title: 'Valencia Orange', class: 'text-xl' },
    { icon: '🌞', title: 'Spanish Sun', class: 'text-3xl' },
    { icon: '🏰', title: 'Castle', class: 'text-2xl' },
    { icon: '⛱️', title: 'Beach Umbrella', class: 'text-2xl' },
    { icon: '🎸', title: 'Spanish Guitar', class: 'text-2xl' },
    { icon: '💃', title: 'Flamenco Dancer', class: 'text-2xl' },
    { icon: '🌊', title: 'Mediterranean Sea', class: 'text-xl' },
    { icon: '🍷', title: 'Spanish Wine', class: 'text-xl' },
    { icon: '🥘', title: 'Paella', class: 'text-2xl' },
    { icon: '🌴', title: 'Palm Tree', class: 'text-2xl' },
    { icon: '⛪', title: 'Cathedral', class: 'text-2xl' }
];

// Create floating elements
function createFloatingElements() {
    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-0';
    
    decorativeElements.forEach((element, index) => {
        const div = document.createElement('div');
        div.className = `absolute ${element.class} opacity-10 hover:opacity-20 transition-opacity duration-300`;
        div.title = element.title;
        div.innerHTML = element.icon;
        
        // Position elements around the page
        const top = Math.random() * 90 + 5; // 5-95%
        const left = Math.random() * 90 + 5; // 5-95%
        div.style.top = `${top}%`;
        div.style.left = `${left}%`;
        
        // Add floating animation
        div.style.animation = `float-${index % 3} ${10 + index}s infinite`;
        
        container.appendChild(div);
    });
    
    document.body.appendChild(container);
}

// Add CSS animations
function addAnimationStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float-0 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(10px, -10px) rotate(5deg); }
            50% { transform: translate(0, -20px) rotate(0deg); }
            75% { transform: translate(-10px, -10px) rotate(-5deg); }
        }
        
        @keyframes float-1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-15px, -15px) rotate(-3deg); }
            66% { transform: translate(15px, -15px) rotate(3deg); }
        }
        
        @keyframes float-2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(0, -20px) rotate(5deg); }
        }
        
        .fade-in {
            opacity: 0;
            animation: fadeIn 0.8s ease-out forwards;
        }

        .slide-up {
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }

        @keyframes slideUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Add animation classes to elements
function animateElements() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in');
    }

    // Animate timeline items with delay
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        item.classList.add('slide-up');
    });

    // Animate feature cards with delay
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
        card.classList.add('slide-up');
    });
}

// Initialize decorative elements
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    createFloatingElements();
    animateElements();
});
