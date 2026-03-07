// ========================================
// Global Variables & State
// ========================================
let currentEditId = null;
let currentSection = 'hero';

// ========================================
// Navigation
// ========================================
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        switchSection(section);
    });
});

function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `${section}-section`);
    });
    
    currentSection = section;
    loadSectionData(section);
}

// ========================================
// Alert System
// ========================================
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// ========================================
// Hero Content Management
// ========================================
const heroForm = document.getElementById('heroForm');
heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        media_type: document.getElementById('heroMediaType').value,
        media_url: document.getElementById('heroMediaUrl').value,
        title: document.getElementById('heroTitle').value,
        subtitle: document.getElementById('heroSubtitle').value,
        is_active: true
    };
    
    try {
        if (currentEditId) {
            await updateRecord('hero_content', currentEditId, data);
            showAlert('히어로 콘텐츠가 수정되었습니다.');
        } else {
            await createRecord('hero_content', data);
            showAlert('히어로 콘텐츠가 추가되었습니다.');
        }
        heroForm.reset();
        currentEditId = null;
        loadHeroList();
    } catch (error) {
        showAlert('오류가 발생했습니다: ' + error.message, 'error');
    }
});

async function loadHeroList() {
    try {
        const data = await fetchRecords('hero_content');
        const tbody = document.getElementById('heroList');
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.media_type}</td>
                <td>
                    ${item.media_type === 'image' 
                        ? `<img src="${item.media_url}" alt="Hero">` 
                        : '🎥 비디오'}
                </td>
                <td>${item.title}</td>
                <td>${item.subtitle}</td>
                <td>${item.is_active ? '✅' : '❌'}</td>
                <td class="table-actions">
                    <button class="btn btn-secondary" onclick="editHero('${item.id}')">수정</button>
                    <button class="btn btn-danger" onclick="deleteHero('${item.id}')">삭제</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function editHero(id) {
    try {
        const item = await fetchRecord('hero_content', id);
        document.getElementById('heroMediaType').value = item.media_type;
        document.getElementById('heroMediaUrl').value = item.media_url;
        document.getElementById('heroTitle').value = item.title;
        document.getElementById('heroSubtitle').value = item.subtitle;
        currentEditId = id;
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function deleteHero(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        await deleteRecord('hero_content', id);
        showAlert('삭제되었습니다.');
        loadHeroList();
    } catch (error) {
        showAlert('삭제 실패: ' + error.message, 'error');
    }
}

// ========================================
// Brands Management
// ========================================
const brandsForm = document.getElementById('brandsForm');
brandsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('brandName').value,
        image_url: document.getElementById('brandImage').value,
        description: document.getElementById('brandDescription').value,
        order: parseInt(document.getElementById('brandOrder').value)
    };
    
    try {
        if (currentEditId) {
            await updateRecord('brands', currentEditId, data);
            showAlert('브랜드가 수정되었습니다.');
        } else {
            await createRecord('brands', data);
            showAlert('브랜드가 추가되었습니다.');
        }
        brandsForm.reset();
        currentEditId = null;
        loadBrandsList();
    } catch (error) {
        showAlert('오류가 발생했습니다: ' + error.message, 'error');
    }
});

document.getElementById('brandResetBtn').addEventListener('click', () => {
    brandsForm.reset();
    currentEditId = null;
});

async function loadBrandsList() {
    try {
        const data = await fetchRecords('brands', 'order');
        const tbody = document.getElementById('brandsList');
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.order}</td>
                <td><img src="${item.image_url}" alt="${item.name}"></td>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td class="table-actions">
                    <button class="btn btn-secondary" onclick="editBrand('${item.id}')">수정</button>
                    <button class="btn btn-danger" onclick="deleteBrand('${item.id}')">삭제</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function editBrand(id) {
    try {
        const item = await fetchRecord('brands', id);
        document.getElementById('brandName').value = item.name;
        document.getElementById('brandImage').value = item.image_url;
        document.getElementById('brandDescription').value = item.description;
        document.getElementById('brandOrder').value = item.order;
        currentEditId = id;
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function deleteBrand(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        await deleteRecord('brands', id);
        showAlert('삭제되었습니다.');
        loadBrandsList();
    } catch (error) {
        showAlert('삭제 실패: ' + error.message, 'error');
    }
}

// ========================================
// News/PR Management
// ========================================
const newsForm = document.getElementById('newsForm');
newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        title: document.getElementById('newsTitle').value,
        image_url: document.getElementById('newsImage').value,
        content: document.getElementById('newsContent').value,
        date: new Date(document.getElementById('newsDate').value).toISOString()
    };
    
    try {
        if (currentEditId) {
            await updateRecord('news', currentEditId, data);
            showAlert('뉴스가 수정되었습니다.');
        } else {
            await createRecord('news', data);
            showAlert('뉴스가 추가되었습니다.');
        }
        newsForm.reset();
        currentEditId = null;
        loadNewsList();
    } catch (error) {
        showAlert('오류가 발생했습니다: ' + error.message, 'error');
    }
});

document.getElementById('newsResetBtn').addEventListener('click', () => {
    newsForm.reset();
    currentEditId = null;
});

async function loadNewsList() {
    try {
        const data = await fetchRecords('news', '-date');
        const tbody = document.getElementById('newsList');
        
        tbody.innerHTML = data.map(item => {
            const date = new Date(item.date).toLocaleDateString('ko-KR');
            return `
                <tr>
                    <td><img src="${item.image_url}" alt="${item.title}"></td>
                    <td>${item.title}</td>
                    <td>${date}</td>
                    <td class="table-actions">
                        <button class="btn btn-secondary" onclick="editNews('${item.id}')">수정</button>
                        <button class="btn btn-danger" onclick="deleteNews('${item.id}')">삭제</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function editNews(id) {
    try {
        const item = await fetchRecord('news', id);
        document.getElementById('newsTitle').value = item.title;
        document.getElementById('newsImage').value = item.image_url;
        document.getElementById('newsContent').value = item.content;
        document.getElementById('newsDate').value = item.date.split('T')[0];
        currentEditId = id;
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function deleteNews(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        await deleteRecord('news', id);
        showAlert('삭제되었습니다.');
        loadNewsList();
    } catch (error) {
        showAlert('삭제 실패: ' + error.message, 'error');
    }
}

// ========================================
// About Story Management
// ========================================
const aboutForm = document.getElementById('aboutForm');
aboutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        image_url: document.getElementById('aboutImage').value,
        content: document.getElementById('aboutContent').value,
        order: parseInt(document.getElementById('aboutOrder').value)
    };
    
    try {
        if (currentEditId) {
            await updateRecord('about_story', currentEditId, data);
            showAlert('스토리가 수정되었습니다.');
        } else {
            await createRecord('about_story', data);
            showAlert('스토리가 추가되었습니다.');
        }
        aboutForm.reset();
        currentEditId = null;
        loadAboutList();
    } catch (error) {
        showAlert('오류가 발생했습니다: ' + error.message, 'error');
    }
});

document.getElementById('aboutResetBtn').addEventListener('click', () => {
    aboutForm.reset();
    currentEditId = null;
});

async function loadAboutList() {
    try {
        const data = await fetchRecords('about_story', 'order');
        const tbody = document.getElementById('aboutList');
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.order}</td>
                <td><img src="${item.image_url}" alt="About"></td>
                <td>${item.content.substring(0, 100)}...</td>
                <td class="table-actions">
                    <button class="btn btn-secondary" onclick="editAbout('${item.id}')">수정</button>
                    <button class="btn btn-danger" onclick="deleteAbout('${item.id}')">삭제</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function editAbout(id) {
    try {
        const item = await fetchRecord('about_story', id);
        document.getElementById('aboutImage').value = item.image_url;
        document.getElementById('aboutContent').value = item.content;
        document.getElementById('aboutOrder').value = item.order;
        currentEditId = id;
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

async function deleteAbout(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        await deleteRecord('about_story', id);
        showAlert('삭제되었습니다.');
        loadAboutList();
    } catch (error) {
        showAlert('삭제 실패: ' + error.message, 'error');
    }
}

// ========================================
// RESTful API Functions
// ========================================
async function fetchRecords(table, sort = null) {
    const url = sort ? `tables/${table}?sort=${sort}&limit=100` : `tables/${table}?limit=100`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
}

async function fetchRecord(table, id) {
    const response = await fetch(`tables/${table}/${id}`);
    return await response.json();
}

async function createRecord(table, data) {
    const response = await fetch(`tables/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function updateRecord(table, id, data) {
    const response = await fetch(`tables/${table}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function deleteRecord(table, id) {
    await fetch(`tables/${table}/${id}`, {
        method: 'DELETE'
    });
}

// ========================================
// Page Hero Management
// ========================================
let currentPageHeroData = {};

// Page hero sub-tab navigation
document.addEventListener('DOMContentLoaded', () => {
    const pageButtons = document.querySelectorAll('.page-nav-btn[data-page]');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageName = btn.dataset.page;
            
            // Update active tab styling
            pageButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'white';
                b.style.color = '#333';
                b.style.borderColor = '#e0e0e0';
            });
            btn.classList.add('active');
            btn.style.background = '#2c2855';
            btn.style.color = 'white';
            btn.style.borderColor = '#2c2855';
            
            // Load page hero data
            loadPageHeroData(pageName);
        });
    });
    
    // Load initial page (about)
    loadPageHeroData('about');
});

async function loadPageHeroData(pageName) {
    try {
        const data = await fetchRecords('page_hero_images');
        const pageHero = data.find(item => item.page_name === pageName);
        
        if (pageHero) {
            currentPageHeroData = pageHero;
            
            // Fill form
            document.getElementById('currentPageName').value = pageName;
            document.getElementById('pageHeroMediaUrl').value = pageHero.image_url || '';
            document.getElementById('pageHeroTitle').value = pageHero.title || '';
            document.getElementById('pageHeroSubtitle').value = pageHero.subtitle || '';
            
            // Set media type (default to image if not specified)
            const mediaType = pageHero.media_type || 'image';
            const mediaTypeSelect = document.getElementById('pageHeroMediaType');
            if (mediaTypeSelect) {
                mediaTypeSelect.value = mediaType;
            }
            
            // Show existing media preview
            const pageHeroMediaPreviewContainer = document.getElementById('pageHeroMediaPreviewContainer');
            if (pageHero.image_url && pageHeroMediaPreviewContainer) {
                if (mediaType === 'video') {
                    pageHeroMediaPreviewContainer.innerHTML = `
                        <video src="${pageHero.image_url}" class="preview-image" controls style="max-width: 300px;">
                            Your browser does not support video.
                        </video>
                    `;
                } else {
                    pageHeroMediaPreviewContainer.innerHTML = `
                        <img src="${pageHero.image_url}" class="preview-image" alt="Current hero image">
                    `;
                }
            }
            
            // Update preview
            updatePageHeroPreview();
        }
    } catch (error) {
        showAlert('데이터 로드 실패: ' + error.message, 'error');
    }
}

function updatePageHeroPreview() {
    const mediaUrl = document.getElementById('pageHeroMediaUrl').value;
    const title = document.getElementById('pageHeroTitle').value;
    const subtitle = document.getElementById('pageHeroSubtitle').value;
    
    const preview = document.getElementById('pageHeroPreview');
    const previewTitle = document.getElementById('previewTitle');
    const previewSubtitle = document.getElementById('previewSubtitle');
    
    if (preview && mediaUrl) {
        preview.style.backgroundImage = `url('${mediaUrl}')`;
    }
    if (previewTitle) {
        previewTitle.textContent = title || 'ABOUT US';
    }
    if (previewSubtitle) {
        previewSubtitle.textContent = subtitle || 'JJ WORLD를 소개합니다';
    }
}
    const previewSubtitle = document.getElementById('previewSubtitle');
    
    if (imageUrl) {
        preview.style.backgroundImage = `url('${imageUrl}')`;
    }
    previewTitle.textContent = title || 'ABOUT US';
    previewSubtitle.textContent = subtitle || 'JJ WORLD를 소개합니다';
}

// Listen to input changes for preview
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('pageHeroImageUrl');
    const titleInput = document.getElementById('pageHeroTitle');
    const subtitleInput = document.getElementById('pageHeroSubtitle');
    
    if (imageInput) imageInput.addEventListener('input', updatePageHeroPreview);
    if (titleInput) titleInput.addEventListener('input', updatePageHeroPreview);
    if (subtitleInput) subtitleInput.addEventListener('input', updatePageHeroPreview);
});

// Page hero form submission
const heroPageForm = document.getElementById('heroPageForm');
if (heroPageForm) {
    // Setup file upload for page hero
    const pageHeroUploadArea = document.getElementById('pageHeroUploadArea');
    const pageHeroMediaFile = document.getElementById('pageHeroMediaFile');
    const pageHeroMediaPreviewContainer = document.getElementById('pageHeroMediaPreviewContainer');
    const pageHeroMediaType = document.getElementById('pageHeroMediaType');
    
    if (pageHeroUploadArea && pageHeroMediaFile) {
        // Update file accept based on media type
        if (pageHeroMediaType) {
            pageHeroMediaType.addEventListener('change', () => {
                const type = pageHeroMediaType.value;
                if (type === 'image') {
                    pageHeroMediaFile.accept = 'image/*';
                } else if (type === 'video') {
                    pageHeroMediaFile.accept = 'video/*';
                }
            });
        }
        
        // Click to upload
        pageHeroUploadArea.addEventListener('click', () => {
            pageHeroMediaFile.click();
        });
        
        // File input change
        pageHeroMediaFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handlePageHeroFileUpload(file);
            }
        });
        
        // Drag and drop
        pageHeroUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            pageHeroUploadArea.classList.add('dragover');
        });
        
        pageHeroUploadArea.addEventListener('dragleave', () => {
            pageHeroUploadArea.classList.remove('dragover');
        });
        
        pageHeroUploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            pageHeroUploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                await handlePageHeroFileUpload(file);
            }
        });
    }
    
    async function handlePageHeroFileUpload(file) {
        try {
            const uploadedUrl = await uploadFile(file);
            document.getElementById('pageHeroMediaUrl').value = uploadedUrl;
            
            // Auto-detect media type
            const isVideo = file.type.startsWith('video/');
            if (pageHeroMediaType) {
                pageHeroMediaType.value = isVideo ? 'video' : 'image';
            }
            
            // Show preview
            if (isVideo) {
                pageHeroMediaPreviewContainer.innerHTML = `
                    <video src="${uploadedUrl}" class="preview-image" controls style="max-width: 300px;">
                        Your browser does not support video.
                    </video>
                    <p style="margin-top: 10px; color: #666; font-size: 14px;">✅ 비디오 업로드 완료</p>
                `;
            } else {
                pageHeroMediaPreviewContainer.innerHTML = `
                    <img src="${uploadedUrl}" class="preview-image" alt="Uploaded preview">
                    <p style="margin-top: 10px; color: #666; font-size: 14px;">✅ 이미지 업로드 완료</p>
                `;
            }
            
            // Update hero preview
            updatePageHeroPreview();
            
            showAlert(isVideo ? '비디오가 업로드되었습니다.' : '이미지가 업로드되었습니다.');
        } catch (error) {
            showAlert('업로드 실패: ' + error.message, 'error');
        }
    }
    
    heroPageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pageName = document.getElementById('currentPageName').value;
        const mediaUrl = document.getElementById('pageHeroMediaUrl').value;
        const mediaType = document.getElementById('pageHeroMediaType').value;
        const title = document.getElementById('pageHeroTitle').value;
        const subtitle = document.getElementById('pageHeroSubtitle').value;
        
        if (!mediaUrl) {
            showAlert('미디어 파일을 업로드해주세요.', 'error');
            return;
        }
        
        try {
            if (currentPageHeroData.id) {
                await updateRecord('page_hero_images', currentPageHeroData.id, {
                    image_url: mediaUrl,
                    media_type: mediaType,
                    title: title,
                    subtitle: subtitle
                });
                showAlert('페이지 히어로가 수정되었습니다.');
            }
        } catch (error) {
            showAlert('저장 실패: ' + error.message, 'error');
        }
    });
}

// Reset button
const pageHeroReset = document.getElementById('pageHeroReset');
if (pageHeroReset) {
    pageHeroReset.addEventListener('click', () => {
        const pageName = document.getElementById('currentPageName').value;
        loadPageHeroData(pageName);
    });
}

async function loadPageHeroList() {
    // Load first page (about) by default
    loadPageHeroData('about');
}

// ========================================
// Load Section Data
// ========================================
function loadSectionData(section) {
    switch(section) {
        case 'hero':
            loadHeroList();
            break;
        case 'brands':
            loadBrandsList();
            break;
        case 'news':
            loadNewsList();
            break;
        case 'about':
            loadAboutList();
            break;
        case 'pagehero':
            loadPageHeroList();
            break;
    }
}

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadHeroList();
});
