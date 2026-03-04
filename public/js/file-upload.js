// ========================================
// File Upload Helper
// ========================================
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        
        const result = await response.json();
        return result.url;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

function createFileUploadUI(inputId, previewId) {
    const container = document.createElement('div');
    container.className = 'file-upload-container';
    container.style.cssText = 'margin-top: 10px; padding: 15px; background: #f9f9f9; border-radius: 8px;';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = `${inputId}_file`;
    fileInput.accept = 'image/*,video/*';
    fileInput.style.cssText = 'display: block; margin-bottom: 10px; padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: 4px;';
    
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.textContent = '📤 파일 업로드';
    uploadBtn.className = 'btn btn-secondary';
    uploadBtn.style.cssText = 'margin-top: 10px;';
    
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = 'margin-top: 10px; font-size: 14px; color: #666;';
    
    const preview = document.createElement('div');
    preview.id = previewId;
    preview.style.cssText = 'margin-top: 15px;';
    
    uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }
        
        // Check file size
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            return;
        }
        
        uploadBtn.disabled = true;
        uploadBtn.textContent = '⏳ 업로드 중...';
        statusDiv.textContent = '파일을 업로드하는 중입니다...';
        
        try {
            const url = await uploadFile(file);
            
            // Set the URL in the main input
            const mainInput = document.getElementById(inputId);
            mainInput.value = url;
            
            // Show preview
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-top: 10px;">`;
            } else if (file.type.startsWith('video/')) {
                preview.innerHTML = `<video src="${url}" controls style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-top: 10px;"></video>`;
            }
            
            statusDiv.textContent = '✅ 업로드 완료!';
            statusDiv.style.color = '#28a745';
            
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
            
        } catch (error) {
            statusDiv.textContent = '❌ 업로드 실패: ' + error.message;
            statusDiv.style.color = '#dc3545';
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '📤 파일 업로드';
        }
    });
    
    container.appendChild(fileInput);
    container.appendChild(uploadBtn);
    container.appendChild(statusDiv);
    container.appendChild(preview);
    
    return container;
}

// Add upload UI to existing URL inputs
document.addEventListener('DOMContentLoaded', () => {
    // Hero Media URL
    const heroMediaUrlInput = document.getElementById('heroMediaUrl');
    if (heroMediaUrlInput && heroMediaUrlInput.parentElement) {
        const uploadUI = createFileUploadUI('heroMediaUrl', 'heroMediaPreview');
        heroMediaUrlInput.parentElement.appendChild(uploadUI);
    }
    
    // Brand Image URL
    const brandImageInput = document.getElementById('brandImage');
    if (brandImageInput && brandImageInput.parentElement) {
        const uploadUI = createFileUploadUI('brandImage', 'brandImagePreview');
        brandImageInput.parentElement.appendChild(uploadUI);
    }
    
    // News Image URL
    const newsImageInput = document.getElementById('newsImage');
    if (newsImageInput && newsImageInput.parentElement) {
        const uploadUI = createFileUploadUI('newsImage', 'newsImagePreview');
        newsImageInput.parentElement.appendChild(uploadUI);
    }
    
    // About Story Image URL
    const aboutImageInput = document.getElementById('aboutImage');
    if (aboutImageInput && aboutImageInput.parentElement) {
        const uploadUI = createFileUploadUI('aboutImage', 'aboutImagePreview');
        aboutImageInput.parentElement.appendChild(uploadUI);
    }
});
