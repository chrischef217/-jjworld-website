/**
 * Scroll Animation - Fade In on Scroll
 * Applies fade-in animations to elements as they come into view
 */

// Make initScrollAnimations globally accessible
window.initScrollAnimations = function() {
    // Add CSS for animations (only once)
    if (!document.getElementById('scroll-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-animation-styles';
        style.textContent = `
            .scroll-animate {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }
            
            .scroll-animate.animated {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Delay variants for staggered animations */
            .scroll-animate.delay-1 {
                transition-delay: 0.1s;
            }
            
            .scroll-animate.delay-2 {
                transition-delay: 0.2s;
            }
            
            .scroll-animate.delay-3 {
                transition-delay: 0.3s;
            }
            
            .scroll-animate.delay-4 {
                transition-delay: 0.4s;
            }
            
            /* Slide variants */
            .scroll-animate-left {
                opacity: 0;
                transform: translateX(-50px);
                transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }
            
            .scroll-animate-left.animated {
                opacity: 1;
                transform: translateX(0);
            }
            
            .scroll-animate-right {
                opacity: 0;
                transform: translateX(50px);
                transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }
            
            .scroll-animate-right.animated {
                opacity: 1;
                transform: translateX(0);
            }
            
            /* Scale variant */
            .scroll-animate-scale {
                opacity: 0;
                transform: scale(0.9);
                transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }
            
            .scroll-animate-scale.animated {
                opacity: 1;
                transform: scale(1);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Find and observe all animation elements
    const animationClasses = [
        '.scroll-animate',
        '.scroll-animate-left',
        '.scroll-animate-right',
        '.scroll-animate-scale'
    ];
    
    animationClasses.forEach(className => {
        const elements = document.querySelectorAll(className);
        elements.forEach(el => {
            // Only observe if not already animated
            if (!el.classList.contains('animated')) {
                observer.observe(el);
            }
        });
    });
};

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initScrollAnimations);
} else {
    window.initScrollAnimations();
}
