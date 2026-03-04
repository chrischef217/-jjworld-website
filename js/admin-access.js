/* Admin Access Button & Modal HTML Component */
const adminAccessHTML = `
    <!-- Password Modal -->
    <div class="admin-modal" id="adminModal">
        <div class="admin-modal-content">
            <button class="admin-modal-close" id="modalClose">&times;</button>
            <h3>관리자 인증</h3>
            <form id="adminPasswordForm">
                <div class="form-group">
                    <label>비밀번호</label>
                    <input type="password" id="adminPassword" placeholder="비밀번호를 입력하세요" required autocomplete="off">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">접속</button>
            </form>
            <p id="errorMessage" style="color: #dc3545; font-size: 14px; margin-top: 15px; display: none;"></p>
        </div>
    </div>
`;

const adminButtonHTML = `
    <button class="admin-access-btn" id="adminAccessBtn" aria-label="관리자 모드" title="관리자 모드">
        ⚙️
    </button>
`;

/* Admin Access Functionality */
function initAdminAccess() {
    // Insert modal before closing body tag
    document.body.insertAdjacentHTML('beforeend', adminAccessHTML);
    
    // Insert button in footer copyright section
    const footerCopyright = document.querySelector('.footer-copyright');
    if (footerCopyright) {
        footerCopyright.insertAdjacentHTML('afterend', adminButtonHTML);
    }

    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const adminModal = document.getElementById('adminModal');
    const modalClose = document.getElementById('modalClose');
    const adminPasswordForm = document.getElementById('adminPasswordForm');
    const adminPassword = document.getElementById('adminPassword');
    const errorMessage = document.getElementById('errorMessage');

    if (!adminAccessBtn) return;

    adminAccessBtn.addEventListener('click', () => {
        adminModal.style.display = 'flex';
        adminPassword.focus();
    });

    modalClose.addEventListener('click', () => {
        adminModal.style.display = 'none';
        adminPasswordForm.reset();
        errorMessage.style.display = 'none';
    });

    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
            adminPasswordForm.reset();
            errorMessage.style.display = 'none';
        }
    });

    adminPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = adminPassword.value;
        
        if (password === '1111') {
            window.location.href = 'admin.html';
        } else {
            errorMessage.textContent = '⚠️ 비밀번호가 올바르지 않습니다.';
            errorMessage.style.display = 'block';
            adminPassword.value = '';
            adminPassword.focus();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && adminModal.style.display === 'flex') {
            adminModal.style.display = 'none';
            adminPasswordForm.reset();
            errorMessage.style.display = 'none';
        }
    });
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminAccess);
} else {
    initAdminAccess();
}
