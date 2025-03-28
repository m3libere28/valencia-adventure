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
    `;
    document.head.appendChild(styleSheet);
}

// Initialize decorative elements
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    createFloatingElements();
    
    // Check if GSAP is available
    if (typeof gsap !== 'undefined') {
        // Animate hero section
        gsap.from('.hero-content', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });

        // Animate timeline items
        gsap.from('.timeline-item', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.timeline',
                start: 'top center+=100',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate features
        gsap.from('.feature-card', {
            duration: 0.6,
            y: 40,
            opacity: 0,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.features',
                start: 'top center+=100',
                toggleActions: 'play none none reverse'
            }
        });
    } else {
        console.log('GSAP not loaded, skipping animations');
    }
});
