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
async function loadHeroContent() {
    try {
        const response = await fetch('tables/hero_content?limit=1');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const hero = data.data.find(item => item.is_active) || data.data[0];
            const heroMedia = document.getElementById('heroMedia');
            const heroTitle = document.getElementById('heroTitle');
            const heroSubtitle = document.getElementById('heroSubtitle');
            
            // Set media (video or image)
            if (hero.media_type === 'video') {
                heroMedia.innerHTML = `<video autoplay loop muted playsinline>
                    <source src="${hero.media_url}" type="video/mp4">
                </video>`;
            } else {
                heroMedia.innerHTML = `<img src="${hero.media_url}" alt="Hero Image">`;
            }
            
            // Set text content
            if (heroTitle) heroTitle.textContent = hero.title;
            if (heroSubtitle) heroSubtitle.textContent = hero.subtitle;
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
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
