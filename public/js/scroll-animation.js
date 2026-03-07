/**
 * Scroll Animation - Fade In on Scroll
 * Applies fade-in animations to elements as they come into view
 */

// Initialize scroll animations
function initScrollAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
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
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Auto-detect and animate elements
    const animateSelectors = [
        '.about-section',
        '.about-section-image',
        '.about-section-content',
        '.brand-card',
        '.news-card',
        '.news-grid > *',
        '.brands-slider > *',
        '.faq-item',
        '.contact-info',
        '.section-title',
        '.section-subtitle',
        '.about-preview',
        'section:not(.hero)',
        '.container > h2',
        '.container > p'
    ];
    
    // Apply animations to matching elements
    animateSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            // Skip if already has animation class
            if (!el.classList.contains('scroll-animate') && 
                !el.classList.contains('scroll-animate-left') && 
                !el.classList.contains('scroll-animate-right') &&
                !el.classList.contains('scroll-animate-scale')) {
                
                // Add animation class based on element type
                if (el.classList.contains('about-section-image')) {
                    el.classList.add('scroll-animate-left');
                } else if (el.classList.contains('about-section-content')) {
                    el.classList.add('scroll-animate-right');
                } else if (el.classList.contains('brand-card') || 
                           el.classList.contains('news-card')) {
                    el.classList.add('scroll-animate-scale');
                    // Add staggered delay
                    if (index < 4) {
                        el.classList.add(`delay-${index + 1}`);
                    }
                } else {
                    el.classList.add('scroll-animate');
                }
                
                // Observe the element
                observer.observe(el);
            }
        });
    });
    
    // Manual animation for specific elements
    const manualElements = document.querySelectorAll('[data-animate]');
    manualElements.forEach(el => {
        const animationType = el.getAttribute('data-animate');
        const animationClass = `scroll-animate${animationType ? '-' + animationType : ''}`;
        el.classList.add(animationClass);
        observer.observe(el);
    });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}
