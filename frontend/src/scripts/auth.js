// 认证功能
const API_BASE_URL = 'http://localhost:3000/api/v1';

document.addEventListener('DOMContentLoaded', async function() {
    initializeAuth();
    await loadCurrentUser();
    checkLoginStatus();
    setupAuthForms();
    setupAuthModals();
    setupLogout();
});

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });
    const result = await response.json();
    if (!response.ok) {
        const error = new Error(result.error?.message || '请求失败');
        error.code = result.error?.code;
        throw error;
    }
    return result;
}

async function loadCurrentUser() {
    if (!localStorage.getItem('accessToken')) return;
    try {
        const result = await apiRequest('/auth/me');
        authState.user = result.data;
        authState.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(result.data));
        updateAuthUI();
    } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        authState.user = null;
        authState.isAuthenticated = false;
        updateAuthUI();
    }
}

// 认证状态
let authState = {
    user: null,
    isAuthenticated: false,
    authModalOpen: false
};

// 初始化认证
function initializeAuth() {
    // 从本地存储加载用户
    loadUserFromStorage();
    
    // 更新UI状态
    updateAuthUI();
    
    // 检查URL中的认证参数
    checkAuthParams();
}

// 从本地存储加载用户
function loadUserFromStorage() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            authState.user = JSON.parse(userData);
            authState.isAuthenticated = true;
        }
    } catch (error) {
        console.error('加载用户数据失败:', error);
        localStorage.removeItem('user');
    }
}

// 检查登录状态
function checkLoginStatus() {
    // 如果用户未登录且当前页面需要登录，重定向到登录
    const protectedPages = ['account.html', 'feedback.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !authState.isAuthenticated) {
        showAuthModal('login');
    }
}

// 更新认证UI
function updateAuthUI() {
    updateAuthenticationNavigation();

    // 更新导航栏的用户显示
    const userElements = document.querySelectorAll('.user-status, .nav-dropdown a');
    
    userElements.forEach(element => {
        if (authState.isAuthenticated && authState.user) {
            if (element.classList.contains('user-status')) {
                element.innerHTML = `<i class="fas fa-user-circle"></i> ${authState.user.username}`;
            }
        } else {
            if (element.classList.contains('user-status')) {
                element.innerHTML = '<i class="fas fa-user"></i> 登录/注册';
            }
        }
    });
    
    // 更新账户页面的用户信息
    updateAccountPage();
}

// 登录状态变化后同步桌面端和移动端导航显示。
function updateAuthenticationNavigation() {
    const loggedIn = Boolean(authState.isAuthenticated && authState.user);
    const desktopAuthActions = document.querySelector('.nav-auth-actions');

    if (loggedIn && desktopAuthActions) {
        const dropdown = document.createElement('div');
        dropdown.className = 'nav-dropdown';
        dropdown.innerHTML = `
            <a href="#" aria-haspopup="true" aria-expanded="false"><i class="fas fa-user"></i> 个人账户 <i class="fas fa-chevron-down"></i></a>
            <div class="dropdown-content">
                <a href="account.html"><i class="fas fa-user-circle"></i> 我的账户</a>
                <a href="account.html#history"><i class="fas fa-history"></i> 浏览历史</a>
                <a href="account.html#favorites"><i class="fas fa-heart"></i> 我的收藏</a>
                <div class="dropdown-divider"></div>
                <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
            </div>
        `;
        desktopAuthActions.replaceWith(dropdown);
        if (typeof setupDropdownMenus === 'function') setupDropdownMenus();
        setupLogout();
    }

    if (!loggedIn && !desktopAuthActions) {
        const dropdown = document.querySelector('.nav-dropdown');
        if (dropdown) {
            const authActions = document.createElement('div');
            authActions.className = 'nav-auth-actions';
            authActions.innerHTML = `
                <a class="nav-auth-link" href="account.html?auth=login"><i class="fas fa-user"></i> 登录/注册</a>
            `;
            dropdown.replaceWith(authActions);
        }
    }

    const mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav) return;
    mobileNav.querySelector('.mobile-auth-actions')?.remove();
    const mobileAccount = Array.from(mobileNav.querySelectorAll('a')).find(link => link.getAttribute('href') === 'account.html');
    if (!loggedIn && mobileAccount) mobileAccount.remove();
    if (!loggedIn) {
        const mobileActions = document.createElement('div');
        mobileActions.className = 'mobile-auth-actions';
        mobileActions.innerHTML = `
            <a href="account.html?auth=login"><i class="fas fa-user"></i> 登录/注册</a>
        `;
        mobileNav.appendChild(mobileActions);
    }
}

// 更新账户页面
function updateAccountPage() {
    if (!authState.isAuthenticated || !authState.user) return;
    
    // 更新个人信息
    const usernameElement = document.getElementById('username');
    const userEmailElement = document.getElementById('userEmail');
    
    if (usernameElement) usernameElement.textContent = authState.user.username;
    if (userEmailElement) userEmailElement.textContent = authState.user.email;
    
    // 更新表单
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileUsername) profileUsername.value = authState.user.username;
    if (profileEmail) profileEmail.value = authState.user.email;
    
    // 更新头像
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement && authState.user.avatar) {
        avatarElement.innerHTML = `<img src="${authState.user.avatar}" alt="头像">`;
    }
}

// 设置认证表单
function setupAuthForms() {
    // 登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm && loginForm.dataset.authReady !== '1') {
        loginForm.addEventListener('submit', handleLogin);
        loginForm.dataset.authReady = '1';
    }
    
    // 注册表单
    const registerForm = document.getElementById('registerForm');
    if (registerForm && registerForm.dataset.authReady !== '1') {
        registerForm.addEventListener('submit', handleRegister);
        registerForm.dataset.authReady = '1';
    }
    
    // 密码重置表单
    const resetForm = document.getElementById('resetForm');
    if (resetForm && resetForm.dataset.authReady !== '1') {
        resetForm.addEventListener('submit', handlePasswordReset);
        resetForm.dataset.authReady = '1';
    }
}

// 设置认证模态框
function setupAuthModals() {
    // 登录链接
    document.querySelectorAll('[data-action="login"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal('login');
        });
    });
    
    // 注册链接
    document.querySelectorAll('[data-action="register"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal('register');
        });
    });
    
    // 模态框按需动态创建，使用事件委托保证右上角关闭按钮始终有效。
    if (document.documentElement.dataset.authModalEventsReady !== '1') {
        document.documentElement.dataset.authModalEventsReady = '1';
        document.addEventListener('click', function(event) {
            if (event.target.closest('.auth-modal .close-modal, .auth-modal .modal-overlay')) {
                event.preventDefault();
                closeAuthModal();
            }
        });
    }
    
    // 认证弹窗按需动态创建，使用事件委托保证登录/注册/重置链接始终有效。
    if (document.documentElement.dataset.authSwitchEventsReady !== '1') {
        document.documentElement.dataset.authSwitchEventsReady = '1';
        document.addEventListener('click', function(event) {
            const switchLink = event.target.closest('.auth-switch [data-target], .forgot-password[data-target]');
            if (!switchLink) return;
            event.preventDefault();
            switchAuthForm(switchLink.getAttribute('data-target'));
        });
    }
}

// 显示认证模态框
function showAuthModal(type = 'login') {
    // 创建模态框HTML（如果不存在）
    if (!document.querySelector('.auth-modal')) {
        createAuthModal();
    }

    // The modal is created lazily on pages without an auth query parameter.
    // Bind its forms after creation so click-opened dialogs submit correctly.
    setupAuthForms();
    
    // 显示模态框
    const modal = document.querySelector('.auth-modal');
    modal.classList.add('active');
    authState.authModalOpen = true;
    
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 切换到指定表单类型
    switchAuthForm(type);
}

// 创建认证模态框
function createAuthModal() {
    const modalHTML = `
        <div class="auth-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="close-modal" aria-label="关闭"><svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg></button>
                
                <div class="auth-forms">
                    <!-- 登录表单 -->
                    <form id="loginForm" class="auth-form active">
                        <h2>用户登录</h2>
                        <div class="form-group">
                            <label for="loginEmail">邮箱地址</label>
                            <input type="email" id="loginEmail" placeholder="请输入邮箱" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">密码</label>
                            <input type="password" id="loginPassword" placeholder="请输入密码" required>
                            <div class="form-options">
                                <label>
                                    <input type="checkbox" id="rememberMe">
                                    <span>记住我</span>
                                </label>
                                <a href="#" class="forgot-password" data-target="reset">忘记密码？</a>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary">登录</button>
                        <div class="auth-switch">
                            还没有账号？ <a href="#" data-target="register">立即注册</a>
                        </div>
                    </form>
                    
                    <!-- 注册表单 -->
                    <form id="registerForm" class="auth-form">
                        <h2>用户注册</h2>
                        <div class="form-group">
                            <label for="registerUsername">用户名</label>
                            <input type="text" id="registerUsername" placeholder="请输入用户名" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">邮箱地址</label>
                            <input type="email" id="registerEmail" placeholder="请输入邮箱" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">密码</label>
                            <input type="password" id="registerPassword" placeholder="至少6个字符" required>
                        </div>
                        <div class="form-group">
                            <label for="registerConfirmPassword">确认密码</label>
                            <input type="password" id="registerConfirmPassword" placeholder="再次输入密码" required>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="acceptTerms" required>
                                <span>我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a></span>
                            </label>
                        </div>
                        <button type="submit" class="btn-primary">注册</button>
                        <div class="auth-switch">
                            已有账号？ <a href="#" data-target="login">立即登录</a>
                        </div>
                    </form>
                    
                    <!-- 重置密码表单 -->
                    <form id="resetForm" class="auth-form">
                        <h2>重置密码</h2>
                        <div class="form-group">
                            <label for="resetEmail">邮箱地址</label>
                            <input type="email" id="resetEmail" placeholder="请输入注册邮箱" required>
                        </div>
                        <button type="submit" class="btn-primary">发送重置链接</button>
                        <div class="auth-switch">
                            <a href="#" data-target="login">返回登录</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.querySelector('.auth-modal');
    modal.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            switchAuthForm(link.getAttribute('data-target'));
        });
    });
    
    // 添加样式
    if (!document.querySelector('style#auth-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-modal-styles';
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1003;
                padding: 20px;
            }
            
            .auth-modal.active {
                display: flex;
            }
            
            .auth-modal .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .auth-modal .modal-content {
                position: relative;
                background: white;
                border-radius: var(--border-radius);
                width: 100%;
                max-width: 450px;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 1;
            }
            
            .auth-modal .close-modal {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--gray-color);
            }
            
            .auth-form {
                display: none;
            }
            
            .auth-form.active {
                display: block;
                animation: fadeIn 0.3s ease;
            }
            
            .auth-form h2 {
                text-align: center;
                margin-bottom: 30px;
                color: var(--dark-color);
            }
            
            .auth-form .form-group {
                margin-bottom: 20px;
            }
            
            .auth-form label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .auth-form input[type="text"],
            .auth-form input[type="email"],
            .auth-form input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--light-gray);
                border-radius: var(--border-radius);
                font-size: 16px;
            }
            
            .auth-form input:focus {
                border-color: var(--primary-color);
                outline: none;
                box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.1);
            }
            
            .form-options {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
                font-size: 14px;
            }
            
            .form-options label {
                display: flex;
                align-items: center;
                gap: 5px;
                margin: 0;
                font-weight: normal;
            }
            
            .forgot-password {
                color: var(--primary-color);
                text-decoration: none;
            }
            
            .forgot-password:hover {
                text-decoration: underline;
            }
            
            .auth-form .btn-primary {
                width: 100%;
                margin-top: 10px;
            }
            
            .auth-switch {
                text-align: center;
                margin-top: 20px;
                color: var(--gray-color);
                font-size: 14px;
            }
            
            .auth-switch a {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: 500;
            }
            
            .auth-switch a:hover {
                text-decoration: underline;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// 关闭认证模态框
function closeAuthModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
        modal.classList.remove('active');
        authState.authModalOpen = false;
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }
}

// 切换认证表单
function switchAuthForm(type) {
    // 隐藏所有表单
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // 显示目标表单
    const targetForm = document.getElementById(type + 'Form');
    if (targetForm) {
        targetForm.classList.add('active');
        
        // 自动聚焦第一个输入框
        const firstInput = targetForm.querySelector('input[type="text"], input[type="email"]');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // 验证输入
    if (!email || !password) {
        showNotification('请填写邮箱和密码', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('请输入有效的邮箱地址', 'warning');
        return;
    }
    
    // 显示加载状态
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '登录中...';
    submitBtn.disabled = true;
    
    try {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const user = result.data.user;
        
        if (user) {
            // 登录成功
            authState.user = user;
            authState.isAuthenticated = true;
            
            // 保存用户信息
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', result.data.accessToken);
            
            // 更新UI
            updateAuthUI();
            
            // 关闭模态框
            closeAuthModal();
            
            // 清空表单
            event.target.reset();
            
            // 显示欢迎消息
            showNotification(`欢迎回来，${user.username}！`, 'success');
            
            // 重定向到原页面或首页
            setTimeout(() => {
                if (window.location.pathname.includes('account.html')) {
                    window.location.reload();
                } else if (window.location.hash === '#login') {
                    window.location.hash = '#profile';
                }
            }, 500);
        }
    } catch (error) {
        showNotification(error.message || '登录失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // 验证输入
    if (!username || !email || !password || !confirmPassword) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('请输入有效的邮箱地址', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码至少需要6个字符', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'warning');
        return;
    }
    
    if (!acceptTerms) {
        showNotification('请同意服务条款和隐私政策', 'warning');
        return;
    }
    
    // 显示加载状态
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '注册中...';
    submitBtn.disabled = true;
    
    try {
        const result = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        const user = result.data.user;
        
        // 注册成功
        authState.user = user;
        authState.isAuthenticated = true;
        
        // 保存用户信息
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', result.data.accessToken);
        
        // 更新UI
        updateAuthUI();
        
        // 清空表单
        event.target.reset();
        
        // 显示成功消息
        closeAuthModal();
        showNotification('注册成功！', 'success');
        
    } catch (error) {
        showNotification(error.message || '注册失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 处理密码重置
async function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    // 验证输入
    if (!email) {
        showNotification('请输入邮箱地址', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('请输入有效的邮箱地址', 'warning');
        return;
    }
    
    // 显示加载状态
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '发送中...';
    submitBtn.disabled = true;
    
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 检查用户是否存在
        if (!await userExists(email)) {
            throw new Error('该邮箱未注册');
        }
        
        // 模拟发送重置邮件
        await sendPasswordResetEmail(email);
        
        // 显示成功消息
        showNotification('重置链接已发送到您的邮箱，请查收。', 'success');
        
        // 清空表单
        event.target.reset();
        
        // 切换到登录表单
        setTimeout(() => {
            switchAuthForm('login');
        }, 1500);
        
    } catch (error) {
        showNotification(error.message || '发送重置链接失败', 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 模拟用户认证
async function authenticateUser(email, password) {
    // 模拟从本地存储获取用户
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 查找用户
    const user = storedUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            regDate: user.regDate
        };
    }
    
    // 如果没找到，检查默认用户
    if (email === 'user@example.com' && password === 'password123') {
        return {
            id: 1,
            username: '家居爱好者',
            email: 'user@example.com',
            avatar: null,
            regDate: '2023-01-15'
        };
    }
    
    return null;
}

// 检查用户是否存在
async function userExists(email) {
    // 模拟检查用户
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    return storedUsers.some(u => u.email === email);
}

// 创建用户
async function createUser(username, email, password) {
    // 生成用户ID
    const userId = Date.now();
    
    // 创建用户对象
    const newUser = {
        id: userId,
        username: username,
        email: email,
        password: password, // 注意：实际应用中应该加密存储
        avatar: null,
        regDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    // 保存到本地存储
    let storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));
    
    // 返回用户信息（不包含密码）
    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        regDate: newUser.regDate
    };
}

// 发送密码重置邮件
async function sendPasswordResetEmail(email) {
    // 模拟发送邮件
    console.log(`发送密码重置邮件到: ${email}`);
    return true;
}

// 设置退出登录
function setupLogout() {
    document.querySelectorAll('#logout-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除用户状态
        authState.user = null;
        authState.isAuthenticated = false;
        
        // 清除本地存储
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        
        // 更新UI
        updateAuthUI();
        
        // 显示消息
        showNotification('已退出登录', 'success');
        
        // 如果是账户页面，跳转到首页
        if (window.location.pathname.includes('account.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }
}

// 检查认证参数
function checkAuthParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('auth');
    
    if (action === 'login' || action === 'register') {
        showAuthModal(action);
        
        // 从URL中移除参数
        const url = new URL(window.location);
        url.searchParams.delete('auth');
        window.history.replaceState({}, '', url);
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

