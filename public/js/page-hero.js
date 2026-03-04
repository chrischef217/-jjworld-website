// Load hero image for any page
async function loadPageHeroImage(pageName) {
    try {
        const response = await fetch('/tables/page_hero_images');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const hero = data.data.find(item => item.page_name === pageName);
            if (hero) {
                const heroElement = document.querySelector('.page-hero');
                if (heroElement) {
                    heroElement.style.backgroundImage = `url('${hero.image_url}')`;
                    
                    const titleElement = heroElement.querySelector('h1');
                    const subtitleElement = heroElement.querySelector('p');
                    
                    if (hero.title && titleElement) {
                        titleElement.textContent = hero.title;
                    }
                    if (hero.subtitle && subtitleElement) {
                        subtitleElement.textContent = hero.subtitle;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading hero image:', error);
    }
}
