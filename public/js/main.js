// ========================================
// Mobile Menu Toggle
// ========================================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');

function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);
mobileNavClose.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking outside
mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
        toggleMobileMenu();
    }
});

// ========================================
// Load Hero Content from Database
// ========================================
let heroItems = [];
let currentHeroIndex = 0;

async function loadHeroContent() {
    try {
        const response = await fetch('tables/hero_content?limit=100');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Filter only active hero items and sort by id or order
            heroItems = data.data.filter(item => item.is_active);
            
            if (heroItems.length === 0) {
                heroItems = [data.data[0]]; // Fallback to first item if no active items
            }
            
            // Initialize first hero
            renderHeroItem(0);
            
            // Start slideshow if there are multiple items
            if (heroItems.length > 1) {
                startHeroSlideshow();
            }
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

function renderHeroItem(index) {
    const hero = heroItems[index];
    const heroMedia = document.getElementById('heroMedia');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    
    if (!heroMedia) return;
    
    // Create new media element
    const newMediaElement = document.createElement('div');
    newMediaElement.className = 'hero-media-item';
    newMediaElement.style.opacity = '0';
    newMediaElement.style.transition = 'opacity 0.8s ease-in-out';
    newMediaElement.style.position = 'absolute';
    newMediaElement.style.top = '0';
    newMediaElement.style.left = '0';
    newMediaElement.style.width = '100%';
    newMediaElement.style.height = '100%';
    
    // Set media (video or image)
    if (hero.media_type === 'video') {
        newMediaElement.innerHTML = `<video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
            <source src="${hero.media_url}" type="video/mp4">
        </video>`;
    } else {
        newMediaElement.innerHTML = `<img src="${hero.media_url}" alt="Hero Image" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
    
    // Get current media element
    const currentMediaElement = heroMedia.querySelector('.hero-media-item');
    
    // Add new element to DOM
    heroMedia.appendChild(newMediaElement);
    
    // Trigger fade in after a brief delay
    setTimeout(() => {
        newMediaElement.style.opacity = '1';
    }, 50);
    
    // Fade out and remove old element
    if (currentMediaElement) {
        currentMediaElement.style.opacity = '0';
        setTimeout(() => {
            if (currentMediaElement.parentNode) {
                currentMediaElement.remove();
            }
        }, 800); // Match transition duration
    }
    
    // Update text content with fade effect
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        setTimeout(() => {
            heroTitle.textContent = hero.title;
            heroTitle.style.opacity = '1';
        }, 400);
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        setTimeout(() => {
            heroSubtitle.textContent = hero.subtitle;
            heroSubtitle.style.opacity = '1';
        }, 400);
    }
}

function startHeroSlideshow() {
    // Change hero every 4 seconds (fast transition)
    setInterval(() => {
        currentHeroIndex = (currentHeroIndex + 1) % heroItems.length;
        renderHeroItem(currentHeroIndex);
    }, 4000); // 4 seconds per slide
}

// ========================================
// Load Brands from Database
// ========================================
let currentBrandIndex = 0;
let brands = [];

async function loadBrands() {
    try {
        const response = await fetch('tables/brands?sort=order');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            brands = data.data;
            renderBrands();
            initBrandSlider();
        }
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

function renderBrands() {
    const brandsSlider = document.getElementById('brandsSlider');
    if (!brandsSlider) return;
    
    brandsSlider.innerHTML = brands.map(brand => `
        <div class="brand-card">
            <img src="${brand.image_url}" alt="${brand.name}">
            <h3>${brand.name}</h3>
            <p>${brand.description}</p>
        </div>
    `).join('');
}

function initBrandSlider() {
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const slider = document.getElementById('brandsSlider');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    function updateSlider() {
        const cardWidth = slider.querySelector('.brand-card').offsetWidth;
        slider.style.transform = `translateX(-${currentBrandIndex * cardWidth}px)`;
    }
    
    prevBtn.addEventListener('click', () => {
        currentBrandIndex = currentBrandIndex > 0 ? currentBrandIndex - 1 : brands.length - 1;
        updateSlider();
    });
    
    nextBtn.addEventListener('click', () => {
        currentBrandIndex = currentBrandIndex < brands.length - 1 ? currentBrandIndex + 1 : 0;
        updateSlider();
    });
    
    // Auto slide every 5 seconds
    setInterval(() => {
        currentBrandIndex = currentBrandIndex < brands.length - 1 ? currentBrandIndex + 1 : 0;
        updateSlider();
    }, 5000);
    
    // Update slider on window resize
    window.addEventListener('resize', updateSlider);
}

// ========================================
// Load News/PR from Database
// ========================================
async function loadNews() {
    try {
        const response = await fetch('tables/news?limit=6&sort=-date');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            renderNews(data.data);
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function renderNews(newsItems) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    newsGrid.innerHTML = newsItems.map(item => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="news-card">
                <img src="${item.image_url}" alt="${item.title}">
                <div class="news-card-content">
                    <h3>${item.title}</h3>
                    <p>${item.content.substring(0, 100)}...</p>
                    <small>${formattedDate}</small>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ========================================
// Header Scroll Effect
// ========================================
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.85)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadHeroContent();
    loadBrands();
    loadNews();
});
