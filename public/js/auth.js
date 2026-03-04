// ========================================
// JWT Authentication Module
// ========================================

class AuthManager {
    constructor() {
        this.tokenKey = 'admin_jwt_token';
    }

    // Get token from localStorage
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Save token to localStorage
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    // Remove token
    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Login with password
    async login(password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            this.setToken(data.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Verify token
    async verify() {
        try {
            const token = this.getToken();
            if (!token) return false;

            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearToken();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            this.clearToken();
            return false;
        }
    }

    // Logout
    logout() {
        this.clearToken();
        window.location.href = '/';
    }

    // Get Authorization header
    getAuthHeader() {
        const token = this.getToken();
        return token ? `Bearer ${token}` : null;
    }
}

// Global instance
const authManager = new AuthManager();

// ========================================
// Enhanced File Upload with JWT
// ========================================

async function uploadFileWithAuth(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const authHeader = authManager.getAuthHeader();
    if (!authHeader) {
        throw new Error('Not authenticated. Please login first.');
    }
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            },
            body: formData
        });
        
        if (response.status === 401) {
            authManager.clearToken();
            throw new Error('Session expired. Please login again.');
        }
        
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

// Replace the old uploadFile function
window.uploadFile = uploadFileWithAuth;
window.authManager = authManager;

// ========================================
// Admin Page Authentication Check
// ========================================

// Check authentication on admin page load
if (window.location.pathname.includes('/admin')) {
    document.addEventListener('DOMContentLoaded', async () => {
        // If already has token, verify it
        if (authManager.isAuthenticated()) {
            const valid = await authManager.verify();
            if (valid) {
                console.log('✅ Authenticated with JWT');
                return;
            }
        }

        // Show enhanced login modal
        showJWTLoginModal();
    });
}

function showJWTLoginModal() {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
    `;

    modal.innerHTML = `
        <h2 style="margin: 0 0 20px 0; color: #2c2855; font-size: 24px;">🔐 관리자 로그인</h2>
        <p style="color: #666; margin-bottom: 20px;">JWT 인증으로 보호되는 관리자 페이지입니다.</p>
        <form id="jwtLoginForm">
            <input 
                type="password" 
                id="jwtPassword" 
                placeholder="관리자 비밀번호" 
                required
                style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                "
            />
            <button 
                type="submit" 
                style="
                    width: 100%;
                    padding: 12px;
                    background: #2c2855;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: 500;
                "
            >로그인</button>
        </form>
        <div id="jwtLoginError" style="color: #dc3545; margin-top: 15px; display: none;"></div>
        <div id="jwtLoginSuccess" style="color: #28a745; margin-top: 15px; display: none;"></div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Handle form submission
    const form = modal.querySelector('#jwtLoginForm');
    const passwordInput = modal.querySelector('#jwtPassword');
    const errorDiv = modal.querySelector('#jwtLoginError');
    const successDiv = modal.querySelector('#jwtLoginSuccess');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = passwordInput.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        try {
            await authManager.login(password);
            
            successDiv.textContent = '✅ 로그인 성공! 페이지를 새로고침합니다...';
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                backdrop.remove();
                window.location.reload();
            }, 1000);
        } catch (error) {
            errorDiv.textContent = '❌ ' + error.message;
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = '로그인';
        }
    });

    // Focus password input
    passwordInput.focus();
}

// Add logout button to admin header
if (window.location.pathname.includes('/admin')) {
    document.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('.admin-header');
        if (header && authManager.isAuthenticated()) {
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = '🚪 로그아웃';
            logoutBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
            `;
            logoutBtn.onclick = () => {
                if (confirm('로그아웃하시겠습니까?')) {
                    authManager.logout();
                }
            };
            header.style.position = 'relative';
            header.appendChild(logoutBtn);
        }
    });
}
