// ========================================
// File Management Module
// ========================================

class FileManager {
    constructor() {
        this.files = [];
        this.init();
    }

    init() {
        // Load files when files section is opened
        document.addEventListener('DOMContentLoaded', () => {
            const filesNavBtn = document.querySelector('[data-section="files"]');
            if (filesNavBtn) {
                filesNavBtn.addEventListener('click', () => {
                    this.loadFiles();
                });
            }

            // Refresh button
            const refreshBtn = document.getElementById('refreshFilesBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.loadFiles();
                });
            }
        });
    }

    async loadFiles() {
        try {
            const authHeader = window.authManager.getAuthHeader();
            if (!authHeader) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/files', {
                headers: {
                    'Authorization': authHeader
                }
            });

            if (response.status === 401) {
                window.authManager.clearToken();
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                throw new Error('Failed to load files');
            }

            const data = await response.json();
            this.files = data.files || [];
            this.renderFiles();
        } catch (error) {
            console.error('Load files error:', error);
            this.showError('파일 목록을 불러오는데 실패했습니다: ' + error.message);
        }
    }

    renderFiles() {
        const grid = document.getElementById('filesGrid');
        const empty = document.getElementById('filesEmpty');
        const countEl = document.getElementById('filesCount');

        if (!grid || !empty || !countEl) return;

        if (this.files.length === 0) {
            grid.style.display = 'none';
            empty.style.display = 'block';
            countEl.textContent = '업로드된 파일: 0개';
            return;
        }

        grid.style.display = 'grid';
        empty.style.display = 'none';

        // Calculate total size
        const totalSize = this.files.reduce((sum, file) => sum + (file.size || 0), 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        countEl.textContent = `업로드된 파일: ${this.files.length}개 (총 ${totalSizeMB}MB)`;

        // Sort files by upload date (newest first)
        const sortedFiles = [...this.files].sort((a, b) => {
            return new Date(b.uploaded) - new Date(a.uploaded);
        });

        grid.innerHTML = sortedFiles.map(file => this.createFileCard(file)).join('');

        // Add event listeners for delete buttons
        grid.querySelectorAll('.delete-file-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.dataset.key;
                this.deleteFile(key);
            });
        });

        // Add event listeners for copy URL buttons
        grid.querySelectorAll('.copy-url-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.dataset.url;
                this.copyToClipboard(url);
            });
        });
    }

    createFileCard(file) {
        const filename = file.key.split('/').pop();
        const fileType = this.getFileType(filename);
        const fileIcon = this.getFileIcon(fileType);
        const uploadDate = new Date(file.uploaded).toLocaleDateString('ko-KR');
        const fileSizeKB = ((file.size || 0) / 1024).toFixed(1);

        let preview = '';
        if (fileType === 'image') {
            preview = `<img src="${file.url}" alt="${filename}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0;">`;
        } else if (fileType === 'video') {
            preview = `<video src="${file.url}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0;"></video>`;
        } else {
            preview = `<div style="width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 8px 8px 0 0; font-size: 48px;">${fileIcon}</div>`;
        }

        return `
            <div class="file-card" style="
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                transition: box-shadow 0.3s;
            " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                ${preview}
                <div style="padding: 15px;">
                    <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px; word-break: break-all;">
                        ${filename}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 12px;">
                        <div>${fileSizeKB} KB</div>
                        <div>${uploadDate}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="copy-url-btn" data-url="${file.url}" style="
                            flex: 1;
                            padding: 8px;
                            background: #2c2855;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        " title="URL 복사">
                            📋 복사
                        </button>
                        <button class="delete-file-btn" data-key="${file.key}" style="
                            padding: 8px 12px;
                            background: #dc3545;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        " title="파일 삭제">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['mp4', 'webm'].includes(ext)) return 'video';
        return 'other';
    }

    getFileIcon(type) {
        switch (type) {
            case 'image': return '🖼️';
            case 'video': return '🎥';
            default: return '📄';
        }
    }

    async deleteFile(key) {
        if (!confirm(`정말로 이 파일을 삭제하시겠습니까?\n\n${key}\n\n⚠️ 이 작업은 취소할 수 없습니다.`)) {
            return;
        }

        try {
            const authHeader = window.authManager.getAuthHeader();
            if (!authHeader) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`/api/files/${key}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authHeader
                }
            });

            if (response.status === 401) {
                window.authManager.clearToken();
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            this.showSuccess('파일이 삭제되었습니다.');
            this.loadFiles(); // Reload file list
        } catch (error) {
            console.error('Delete file error:', error);
            this.showError('파일 삭제에 실패했습니다: ' + error.message);
        }
    }

    copyToClipboard(text) {
        const fullUrl = window.location.origin + text;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullUrl).then(() => {
                this.showSuccess('✅ URL이 클립보드에 복사되었습니다!');
            }).catch(err => {
                this.fallbackCopyToClipboard(fullUrl);
            });
        } else {
            this.fallbackCopyToClipboard(fullUrl);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('✅ URL이 클립보드에 복사되었습니다!');
        } catch (err) {
            this.showError('복사에 실패했습니다. 수동으로 복사해주세요: ' + text);
        }
        
        document.body.removeChild(textArea);
    }

    showSuccess(message) {
        if (typeof showAlert === 'function') {
            showAlert(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (typeof showAlert === 'function') {
            showAlert(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Initialize file manager
const fileManager = new FileManager();
window.fileManager = fileManager;
