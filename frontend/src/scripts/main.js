// 主JavaScript文件 - 完整版
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    setupMobileMenu();
    setupImageSlider();
    setupParallaxHero();
    setupHeroTitleRotator();
    setupPageParallax();
    setupSectionParallax();
    setupAuthenticationNavigation();
    setupEventListeners();
    initializePageSpecificFeatures();
    checkLoginStatus();
    loadHotProducts();
    setupNotifications();
});

// 应用状态
let appState = {
    user: null,
    cart: [],
    notifications: [],
    currentPage: ''
};

// 无 emoji 的轻量 SVG 图标，供动态内容复用。
function svgIcon(name, className = 'icon-svg', label = '') {
    const paths = {
        close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>',
        star: '<path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 19.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"/>',
        starOutline: '<path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 19.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
        check: '<path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>'
    };
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="${label ? 'false' : 'true'}"${label ? ` aria-label="${label}"` : ''}>${paths[name] || paths.check}</svg>`;
}

window.svgIcon = svgIcon;

// 初始化应用
function initializeApplication() {
    // 设置当前页面
    appState.currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // 加载用户状态
    loadUserState();
    
    // 加载购物车
    loadCart();
    
    // 设置页面特定功能
    initializePageSpecificFeatures();
    
    // 更新UI状态
    updateUIState();
}

// 加载用户状态
function loadUserState() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            appState.user = JSON.parse(userData);
        }
    } catch (error) {
        console.error('加载用户状态失败:', error);
    }
}

// 加载购物车
function loadCart() {
    try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            appState.cart = JSON.parse(cartData);
        }
    } catch (error) {
        console.error('加载购物车失败:', error);
    }
    
    updateCartCount();
}

// 更新UI状态
function updateUIState() {
    // 更新用户显示
    updateUserDisplay();
    
    // 更新购物车数量
    updateCartCount();
    
    // 更新页面标题
    updatePageTitle();
}

// 更新用户显示
function updateUserDisplay() {
    const userElements = document.querySelectorAll('.user-status');
    
    userElements.forEach(element => {
        if (appState.user) {
            element.innerHTML = `<i class="fas fa-user-circle"></i> ${appState.user.username}`;
        } else {
            element.innerHTML = '<i class="fas fa-user"></i> 登录/注册';
        }
    });
}

// 更新购物车数量
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = appState.cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// 设置移动端菜单
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.style.display = mobileNav.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // 点击菜单项后关闭菜单
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.style.display = 'none';
            });
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileNav.style.display = 'none';
            }
        });
    }
}

// 设置图片轮播
function setupImageSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        // 初始化第一个幻灯片
        showSlide(currentSlide);
        
        // 每5秒切换一次
        const slideInterval = setInterval(nextSlide, 5000);
        
        // 鼠标悬停时暂停轮播
        const slider = document.querySelector('.image-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            
            slider.addEventListener('mouseleave', () => {
                setInterval(nextSlide, 5000);
            });
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 导航栏下拉菜单
    setupDropdownMenus();
    
    // 回到顶部按钮
    setupBackToTop();
    
    // 表单验证
    setupFormValidation();
    
    // 页面加载动画
    setupPageAnimations();
    
    // 键盘快捷键
    setupKeyboardShortcuts();
}

// 设置下拉菜单
function setupDropdownMenus() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        if (dropdown.dataset.dropdownReady === '1') return;
        dropdown.dataset.dropdownReady = '1';
        const trigger = Array.from(dropdown.children).find(child => child.tagName === 'A');
        const content = Array.from(dropdown.children).find(child => child.classList?.contains('dropdown-content'));
        if (!trigger || !content) return;

        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');

        dropdown.addEventListener('mouseenter', function() {
            dropdown.classList.add('is-hovered');
        });
        
        dropdown.addEventListener('mouseleave', function() {
            dropdown.classList.remove('is-hovered', 'is-hover-suppressed');
        });

        trigger.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const wasOpen = dropdown.classList.contains('is-open');
            const isOpen = !wasOpen;
            dropdown.classList.toggle('is-open', isOpen);
            dropdown.classList.toggle('is-hover-suppressed', wasOpen);
            trigger.setAttribute('aria-expanded', String(isOpen));
        });
    });

    if (document.documentElement.dataset.dropdownDocumentReady !== '1') {
        document.documentElement.dataset.dropdownDocumentReady = '1';
        document.addEventListener('click', function(event) {
        document.querySelectorAll('.nav-dropdown.is-open').forEach(dropdown => {
            if (dropdown.contains(event.target)) return;
            dropdown.classList.remove('is-open', 'is-hover-suppressed');
            const trigger = Array.from(dropdown.children).find(child => child.tagName === 'A');
            trigger?.setAttribute('aria-expanded', 'false');
        });
        });
    }
    
    // 移动端下拉菜单
    document.querySelectorAll('.mobile-nav .nav-dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.querySelector('.dropdown-content');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });
}

// 设置回到顶部按钮
function setupBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.style.display = 'none';
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTopBtn);
    
    // 监听滚动
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: var(--box-shadow);
            transition: var(--transition);
            z-index: 1000;
        }
        
        .back-to-top:hover {
            background: var(--secondary-color);
            transform: translateY(-3px);
        }
    `;
    document.head.appendChild(style);
}

// 设置表单验证
function setupFormValidation() {
    // 为所有表单添加基础验证
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                highlightInvalidFields(this);
            }
        });
    });
    
    // 实时验证
    document.querySelectorAll('input[required], textarea[required], select[required]').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// 高亮无效字段
function highlightInvalidFields(form) {
    const invalidFields = form.querySelectorAll(':invalid');
    
    invalidFields.forEach(field => {
        field.classList.add('invalid');
        
        // 显示错误消息
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = field.validationMessage;
    });
    
    // 聚焦第一个无效字段
    if (invalidFields.length > 0) {
        invalidFields[0].focus();
    }
}

// 验证字段
function validateField(field) {
    if (!field.checkValidity()) {
        field.classList.add('invalid');
        
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = field.validationMessage;
    } else {
        clearFieldError(field);
    }
}

// 清除字段错误
function clearFieldError(field) {
    field.classList.remove('invalid');
    
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

// 设置页面动画
function setupPageAnimations() {
    // 添加淡入动画
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .post-card, .designer-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        /* 动态加载的首页商品不一定会被初始观察器捕获，默认保持可见。 */
        .feature-card,
        .product-card,
        .post-card,
        .designer-card {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// 设置键盘快捷键
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // ESC键：关闭所有模态框和菜单
        if (e.key === 'Escape') {
            closeAllModals();
            closeMobileMenu();
        }
        
        // 搜索快捷键：Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            focusSearchInput();
        }
        
        // 购物车快捷键：Ctrl/Cmd + B
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleCart();
        }
    });
}

// 关闭所有模态框
function closeAllModals() {
    document.querySelectorAll('.modal.active, .modal.show').forEach(modal => {
        modal.classList.remove('active', 'show');
    });
    
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.closest('.nav-dropdown')?.classList.remove('is-open');
        dropdown.closest('.nav-dropdown')?.classList.remove('is-hovered');
        dropdown.closest('.nav-dropdown')?.classList.remove('is-hover-suppressed');
        const owner = dropdown.closest('.nav-dropdown');
        const trigger = owner && Array.from(owner.children).find(child => child.tagName === 'A');
        trigger?.setAttribute('aria-expanded', 'false');
    });
}

// Foreground copy travels faster than the shared page background.
function setupParallaxHero() {
    const hero = document.querySelector('[data-parallax-hero]');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const update = () => {
        const rect = hero.getBoundingClientRect();
        const visibleTravel = Math.min(Math.max(-rect.top, 0), rect.height);
        const ratio = Math.min(visibleTravel / rect.height, 1);

        hero.style.setProperty('--parallax-foreground-y', `${-visibleTravel * 0.24}px`);
        hero.style.setProperty('--parallax-image-y', `${-visibleTravel * 0.1}px`);
        hero.style.setProperty('--parallax-foreground-opacity', String(1 - ratio * 0.42));
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
}

function setupPageParallax() {
    const page = document.querySelector('[data-parallax-page]');
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const update = () => {
        // Keep enough overscan around the fixed image so long pages never reveal an empty edge.
        const maxOffset = Math.max(window.innerHeight * 0.42, 180);
        const offset = Math.min(Math.max(window.scrollY, 0) * 0.12, maxOffset);
        page.style.setProperty('--page-parallax-y', `${offset}px`);
        ticking = false;
    };
    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
}

// Rotate the four-character feature promise in the hero title.
function setupHeroTitleRotator() {
    const rotator = document.querySelector('.hero-title-rotator');
    const words = rotator ? Array.from(rotator.querySelectorAll('.hero-title-word')) : [];
    if (words.length < 2) return;

    let current = words.findIndex(word => word.classList.contains('is-active'));
    if (current < 0) current = 0;
    let timer;

    const showNext = () => {
        const previous = words[current];
        const nextIndex = (current + 1) % words.length;
        const next = words[nextIndex];
        previous.classList.remove('is-active');
        previous.classList.add('is-leaving');
        next.classList.add('is-active');
        current = nextIndex;
        window.setTimeout(() => previous.classList.remove('is-leaving'), 650);
    };

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = window.setInterval(showNext, 2800);
        window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true });
    }
}

// 仅使用 localStorage 控制前端导航显示，不涉及后端认证逻辑。
function setupAuthenticationNavigation() {
    let isLoggedIn = false;
    try {
        isLoggedIn = Boolean(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch (error) {
        localStorage.removeItem('user');
    }

    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
        if (isLoggedIn) return;
        const authActions = document.createElement('div');
        authActions.className = 'nav-auth-actions';
        authActions.innerHTML = `
            <a class="nav-auth-link" href="account.html?auth=login"><i class="fas fa-user"></i> 登录/注册</a>
        `;
        dropdown.replaceWith(authActions);
    });

    const mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav || mobileNav.querySelector('.mobile-auth-actions')) return;

    if (!isLoggedIn) {
        mobileNav.querySelectorAll('a[href="account.html"]').forEach(link => link.remove());
        const mobileActions = document.createElement('div');
        mobileActions.className = 'mobile-auth-actions';
        mobileActions.innerHTML = `
            <a href="account.html?auth=login"><i class="fas fa-user"></i> 登录/注册</a>
        `;
        mobileNav.appendChild(mobileActions);
    }
}

// Shared headers retain their layout while the common background image moves more slowly.
function setupSectionParallax() {
    const sections = document.querySelectorAll('[data-parallax-section]');
    if (!sections.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const update = () => {
        sections.forEach(section => {
            const offset = Math.max(Math.min(-section.getBoundingClientRect().top * 0.14, 140), -140);
            section.style.setProperty('--section-parallax-y', `${offset}px`);
        });
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
}

// 关闭移动端菜单
function closeMobileMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.style.display = 'none';
    }
}

// 聚焦搜索输入框
function focusSearchInput() {
    const searchInput = document.getElementById('searchInput') || document.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    } else {
        // 如果没有搜索框，显示搜索模态框
        showSearchModal();
    }
}

// 显示搜索模态框
function showSearchModal() {
    const modalHTML = `
        <div class="search-modal">
            <div class="modal-overlay" onclick="closeSearchModal()"></div>
            <div class="modal-content">
                <div class="search-box">
                    <input type="text" placeholder="搜索家居、设计、商品..." autofocus>
                    <button class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div class="search-suggestions">
                    <h4>热门搜索</h4>
                    <div class="suggestion-tags">
                        <span class="tag">现代简约沙发</span>
                        <span class="tag">小户型设计</span>
                        <span class="tag">智能家居</span>
                        <span class="tag">北欧风格</span>
                        <span class="tag">实木家具</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (!document.querySelector('.search-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 添加样式
        if (!document.querySelector('style#search-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'search-modal-styles';
            style.textContent = `
                .search-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 100px;
                    z-index: 1004;
                }
                
                .search-modal .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                }
                
                .search-modal .modal-content {
                    position: relative;
                    background: white;
                    border-radius: var(--border-radius);
                    width: 90%;
                    max-width: 600px;
                    padding: 30px;
                    box-shadow: var(--box-shadow);
                    z-index: 1;
                }
                
                .search-modal .search-box {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .search-modal input {
                    flex: 1;
                    padding: 15px;
                    border: 2px solid var(--primary-color);
                    border-radius: var(--border-radius);
                    font-size: 18px;
                }
                
                .search-modal .search-btn {
                    width: 60px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-size: 18px;
                }
                
                .search-suggestions h4 {
                    margin-bottom: 15px;
                    color: var(--gray-color);
                }
                
                .suggestion-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .suggestion-tags .tag {
                    padding: 8px 15px;
                    background: var(--light-color);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                
                .suggestion-tags .tag:hover {
                    background: var(--primary-color);
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    document.querySelector('.search-modal').classList.add('active');
    
    // 设置输入框事件
    const searchInput = document.querySelector('.search-modal input');
    const searchBtn = document.querySelector('.search-modal .search-btn');
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });
    
    searchBtn.addEventListener('click', function() {
        performSearch(searchInput.value);
    });
    
    // 设置标签点击事件
    document.querySelectorAll('.suggestion-tags .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            performSearch(this.textContent);
        });
    });
}

// 关闭搜索模态框
function closeSearchModal() {
    const modal = document.querySelector('.search-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 执行搜索
function performSearch(query) {
    if (!query.trim()) return;
    
    // 保存搜索历史
    saveSearchHistory(query);
    
    // 根据当前页面执行不同搜索
    if (appState.currentPage === 'shopping' || appState.currentPage === '') {
        // 跳转到购物页面搜索
        window.location.href = `shopping.html?search=${encodeURIComponent(query)}`;
    } else if (appState.currentPage === 'community') {
        // 在社区页面搜索
        searchCommunity(query);
    } else {
        // 默认跳转到购物页面
        window.location.href = `shopping.html?search=${encodeURIComponent(query)}`;
    }
    
    // 关闭搜索模态框
    closeSearchModal();
}

// 保存搜索历史
function saveSearchHistory(query) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // 移除重复项
    searchHistory = searchHistory.filter(item => item !== query);
    
    // 添加到开头
    searchHistory.unshift(query);
    
    // 限制数量
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// 切换购物车显示
function toggleCart() {
    // 如果当前在购物页面，使用页面内的功能
    if (appState.currentPage === 'shopping' && window.toggleCart) {
        window.toggleCart();
    } else {
        // 跳转到购物页面
        window.location.href = 'shopping.html';
    }
}

// 初始化页面特定功能
function initializePageSpecificFeatures() {
    switch(appState.currentPage) {
        case '':
        case 'index':
            setupHomePageFeatures();
            break;
        case 'shopping':
            if (typeof setupShoppingPage === 'function') {
                setupShoppingPage();
            }
            break;
        case 'design-tool':
            if (typeof initializeDesignTool === 'function') {
                initializeDesignTool();
            }
            break;
        case 'community':
            if (typeof initializeCommunity === 'function') {
                initializeCommunity();
            }
            break;
        case 'account':
            if (typeof initializeAccount === 'function') {
                initializeAccount();
            }
            break;
        case 'recommendations':
            if (typeof initializeRecommendations === 'function') {
                initializeRecommendations();
            }
            break;
        case 'consultation':
            if (typeof initializeConsultation === 'function') {
                initializeConsultation();
            }
            break;
        case 'feedback':
            if (typeof initializeFeedback === 'function') {
                initializeFeedback();
            }
            break;
    }
}

// 设置首页功能
function setupHomePageFeatures() {
    // 热门商品轮播
    setupHotProductsCarousel();
    
    // 活动倒计时
    setupActivityCountdown();
    
    // 趋势展示
    setupTrendsDisplay();
}

// 设置热门商品轮播
function setupHotProductsCarousel() {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;
    
    // 如果已经有产品，不重复设置
    if (productsContainer.children.length > 0) return;
    
    // 设置自动轮播
    setInterval(() => {
        const firstProduct = productsContainer.firstElementChild;
        if (firstProduct) {
            productsContainer.appendChild(firstProduct.cloneNode(true));
            firstProduct.remove();
        }
    }, 10000);
}

// 设置活动倒计时
function setupActivityCountdown() {
    const activityDate = new Date();
    activityDate.setDate(activityDate.getDate() + 5); // 5天后结束
    
    function updateCountdown() {
        const now = new Date();
        const diff = activityDate - now;
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            document.querySelectorAll('.countdown-timer').forEach(timer => {
                timer.textContent = '活动已结束';
            });
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.querySelectorAll('.countdown-timer').forEach(timer => {
            timer.textContent = `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`;
        });
    }
    
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // 立即执行一次
}

// 设置趋势展示
function setupTrendsDisplay() {
    // 添加趋势卡片点击效果
    document.querySelectorAll('.trend-card').forEach(card => {
        card.addEventListener('click', function() {
            const style = this.querySelector('h3').textContent;
            window.location.href = `design-tool.html?style=${encodeURIComponent(style)}`;
        });
    });
}

// 检查登录状态
function checkLoginStatus() {
    // 如果用户未登录且当前页面需要登录，显示提示
    const protectedPages = ['account', 'feedback'];
    
    if (protectedPages.includes(appState.currentPage) && !appState.user) {
        setTimeout(() => {
            showNotification('请先登录以访问此页面', 'warning');
        }, 1000);
    }
}

// 需要账户的操作统一使用此守卫。
function requireAuthentication(message = '请先登录后再使用此功能') {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
        localStorage.removeItem('user');
    }

    if (user) return true;

    showNotification(message, 'warning');
    setTimeout(() => {
        if (!window.location.pathname.endsWith('account.html')) {
            window.location.href = 'account.html?auth=login';
        } else if (typeof window.showAuthModal === 'function') {
            window.showAuthModal('login');
        } else {
            window.location.hash = 'login';
        }
    }, 350);
    return false;
}

window.requireAuthentication = requireAuthentication;

// 加载热门商品
function loadHotProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // 模拟商品数据
    const products = [
        {
            id: 1,
            name: '现代简约沙发',
            price: '¥3,999',
            originalPrice: '¥4,999',
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85',
            tags: ['热销', '新品']
        },
        {
            id: 2,
            name: '实木餐桌椅组合',
            price: '¥2,599',
            originalPrice: '¥2,999',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=85',
            tags: ['热销']
        },
        {
            id: 3,
            name: '智能床头柜',
            price: '¥899',
            originalPrice: '¥1,199',
            rating: 4.3,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85',
            tags: ['新品', '智能']
        },
        {
            id: 4,
            name: '人体工学办公椅',
            price: '¥1,599',
            originalPrice: '¥1,999',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1505843490701-5be5d7f7f4d6?auto=format&fit=crop&w=800&q=85',
            tags: ['热销', '舒适']
        }
    ];
    
    // 清空现有内容
    productsGrid.innerHTML = '';
    
    // 生成商品卡片
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // 生成标签HTML
        let tagsHTML = '';
        if (product.tags && product.tags.length > 0) {
            product.tags.forEach(tag => {
                tagsHTML += `<span class="product-badge">${tag}</span>`;
            });
        }
        
        // 生成星级评分
        const stars = generateStars(product.rating);
        
        productCard.innerHTML = `
            <div class="product-img" style="background-image: url('${product.image}'); background-size: cover; background-position: center;">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${product.price}</span>
                    <span class="original-price">${product.originalPrice}</span>
                </div>
                <div class="product-rating">
                    ${stars}
                    <span>(${product.rating})</span>
                </div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="addToCart(${product.id})">加入购物车</button>
                    <button class="btn-outline" onclick="addToFavorites(${product.id})">收藏</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// 生成星级评分
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// 添加到购物车
function addToCart(productId) {
    if (!requireAuthentication()) return;
    // 模拟添加到购物车
    const existingItem = appState.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        appState.cart.push({
            id: productId,
            name: `商品${productId}`,
            price: 999,
            quantity: 1
        });
    }
    
    // 保存到本地存储
    localStorage.setItem('cart', JSON.stringify(appState.cart));
    
    // 更新UI
    updateCartCount();
    
    // 显示通知
    showNotification('商品已添加到购物车', 'success');
}

// 添加到收藏
function addToFavorites(productId) {
    if (!requireAuthentication()) return;
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showNotification('商品已添加到收藏', 'success');
    } else {
        showNotification('商品已在收藏中', 'info');
    }
}

// 设置通知系统
function setupNotifications() {
    // 检查是否有未读通知
    checkUnreadNotifications();
    
    // 设置通知图标点击事件
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', showNotificationsPanel);
    }
}

// 检查未读通知
function checkUnreadNotifications() {
    const unreadNotifications = JSON.parse(localStorage.getItem('unreadNotifications') || '[]');
    
    if (unreadNotifications.length > 0) {
        // 显示通知徽章
        const notificationIcon = document.querySelector('.notification-icon');
        if (notificationIcon) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = unreadNotifications.length;
            notificationIcon.appendChild(badge);
        }
    }
}

// 显示通知面板
function showNotificationsPanel() {
    const panelHTML = `
        <div class="notifications-panel">
            <div class="panel-header">
                <h3>通知</h3>
                <button class="close-panel" aria-label="关闭"><svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg></button>
            </div>
            <div class="panel-content">
                <div class="notification-item unread">
                    <i class="fas fa-bell"></i>
                    <div class="notification-content">
                        <div class="notification-title">您的设计已保存</div>
                        <div class="notification-time">刚刚</div>
                    </div>
                </div>
                <div class="notification-item">
                    <i class="fas fa-shopping-cart"></i>
                    <div class="notification-content">
                        <div class="notification-title">您的订单已发货</div>
                        <div class="notification-time">1小时前</div>
                    </div>
                </div>
                <div class="notification-item">
                    <i class="fas fa-comment"></i>
                    <div class="notification-content">
                        <div class="notification-title">收到新的评论</div>
                        <div class="notification-time">3小时前</div>
                    </div>
                </div>
            </div>
            <div class="panel-footer">
                <a href="#">查看所有通知</a>
                <button class="btn-outline">标记所有为已读</button>
            </div>
        </div>
        <div class="panel-overlay"></div>
    `;
    
    if (!document.querySelector('.notifications-panel')) {
        document.body.insertAdjacentHTML('beforeend', panelHTML);
        
        // 添加样式
        if (!document.querySelector('style#notifications-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'notifications-panel-styles';
            style.textContent = `
                .notifications-panel {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 350px;
                    height: 100vh;
                    background: white;
                    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    z-index: 1005;
                    display: flex;
                    flex-direction: column;
                }
                
                .notifications-panel.active {
                    transform: translateX(0);
                }
                
                .panel-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    display: none;
                    z-index: 1004;
                }
                
                .notifications-panel.active + .panel-overlay {
                    display: block;
                }
                
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--light-gray);
                }
                
                .close-panel {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: var(--gray-color);
                }
                
                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 0;
                }
                
                .notification-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    padding: 15px 20px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                
                .notification-item:hover {
                    background: var(--light-color);
                }
                
                .notification-item.unread {
                    background: rgba(74, 111, 165, 0.05);
                }
                
                .notification-item i {
                    color: var(--primary-color);
                    font-size: 18px;
                    margin-top: 2px;
                }
                
                .notification-content {
                    flex: 1;
                }
                
                .notification-title {
                    font-weight: 500;
                    margin-bottom: 5px;
                }
                
                .notification-time {
                    font-size: 12px;
                    color: var(--gray-color);
                }
                
                .panel-footer {
                    padding: 20px;
                    border-top: 1px solid var(--light-gray);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .panel-footer a {
                    color: var(--primary-color);
                    text-decoration: none;
                    text-align: center;
                }
                
                .notification-icon {
                    position: relative;
                    cursor: pointer;
                }
                
                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: var(--accent-color);
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const panel = document.querySelector('.notifications-panel');
    panel.classList.add('active');
    
    // 设置关闭事件
    document.querySelector('.close-panel').addEventListener('click', closeNotificationsPanel);
    document.querySelector('.panel-overlay').addEventListener('click', closeNotificationsPanel);
    
    // 设置通知项点击事件
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
            // 标记为已读的逻辑
        });
    });
}

// 关闭通知面板
function closeNotificationsPanel() {
    const panel = document.querySelector('.notifications-panel');
    if (panel) {
        panel.classList.remove('active');
        setTimeout(() => {
            panel.remove();
            document.querySelector('.panel-overlay').remove();
        }, 300);
    }
}

// 更新页面标题
function updatePageTitle() {
    const pageTitles = {
        '': '栖序空间生活美学 - 一站式空间美学与布局服务',
        'index': '栖序空间生活美学 - 一站式空间美学与布局服务',
        'shopping': '购物商城 - 栖序空间生活美学',
        'design-tool': '设计工具 - 栖序空间生活美学',
        'community': '社区支持 - 栖序空间生活美学',
        'account': '个人账户 - 栖序空间生活美学',
        'recommendations': '方案推荐 - 栖序空间生活美学',
        'consultation': '在线咨询 - 栖序空间生活美学',
        'feedback': '用户反馈 - 栖序空间生活美学'
    };
    
    const title = pageTitles[appState.currentPage] || '栖序空间生活美学';
    document.title = title;
}

// Keep the desktop account menu usable even if another page-specific initializer fails.
// This listener is intentionally delegated so every page with the shared navigation gets the same behavior.
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        const trigger = event.target.closest('.nav-dropdown > a');
        if (!trigger || trigger.closest('.mobile-nav')) return;
        const dropdown = trigger.parentElement;
        if (dropdown.dataset.dropdownReady === '1') return;
        event.preventDefault();
        const isOpen = !dropdown.classList.contains('is-open');
        dropdown.classList.toggle('is-open', isOpen);
        dropdown.classList.toggle('is-hover-suppressed', !isOpen);
        trigger.setAttribute('aria-expanded', String(isOpen));
    }, true);
});

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
    
    // 添加样式（如果不存在）
    if (!document.querySelector('style#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 10000;
                max-width: 400px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid var(--success-color);
            }
            
            .notification-success i {
                color: var(--success-color);
            }
            
            .notification-error {
                border-left: 4px solid var(--danger-color);
            }
            
            .notification-error i {
                color: var(--danger-color);
            }
            
            .notification-warning {
                border-left: 4px solid var(--warning-color);
            }
            
            .notification-warning i {
                color: var(--warning-color);
            }
            
            .notification-info {
                border-left: 4px solid var(--primary-color);
            }
            
            .notification-info i {
                color: var(--primary-color);
            }
        `;
        document.head.appendChild(style);
    }
}

// 全局工具函数
window.utils = {
    formatPrice: function(price) {
        return '¥' + parseFloat(price).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    formatDate: function(date, includeTime = false) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        
        if (includeTime) {
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
        
        return `${year}-${month}-${day}`;
    },
    
    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 导出全局函数
window.showNotification = showNotification;
window.addToCart = addToCart;
window.addToFavorites = addToFavorites;
window.generateStars = generateStars;
window.closeSearchModal = closeSearchModal;
window.performSearch = performSearch;

