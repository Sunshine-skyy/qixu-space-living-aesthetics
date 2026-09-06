// 个人账户功能
document.addEventListener('DOMContentLoaded', function() {
    initializeAccount();
    loadUserData();
    setupAccountNavigation();
    loadOrders();
    loadDesigns();
    loadFavorites();
    loadHistory();
    setupSettings();
});

// 账户状态
let accountState = {
    user: null,
    currentSection: 'profile',
    editMode: false
};

// 初始化账户
function initializeAccount() {
    // 检查登录状态
    checkLoginStatus();
    
    // 设置导航
    setupAccountNavigation();
    
    // 设置表单提交
    setupForms();
    
    // 设置头像上传
    setupAvatarUpload();
    
    // 加载用户数据
    loadUserData();
}

// 检查登录状态
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        // 未登录，重定向到登录页面
        window.location.hash = 'login';
        showLoginForm();
        return false;
    }
    
    accountState.user = user;
    return true;
}

// 加载用户数据
function loadUserData() {
    const user = accountState.user;
    if (!user) return;
    
    // 更新用户信息显示
    document.getElementById('username').textContent = user.username || '未登录用户';
    document.getElementById('userEmail').textContent = user.email || '请登录查看';
    
    // 更新个人信息表单
    document.getElementById('profileUsername').value = user.username || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileRegDate').value = user.regDate || '2023-01-01';
    document.getElementById('profileBio').value = user.bio || '';
    
    // 更新偏好风格
    if (user.preferredStyles) {
        user.preferredStyles.forEach(style => {
            const checkbox = document.querySelector(`input[name="style"][value="${style}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // 更新头像
    if (user.avatar) {
        document.getElementById('userAvatar').innerHTML = `<img src="${user.avatar}" alt="头像">`;
        document.getElementById('avatarPreview').innerHTML = `<img src="${user.avatar}" alt="头像">`;
    }
}

// 设置账户导航
function setupAccountNavigation() {
    // 获取URL哈希
    const hash = window.location.hash.substring(1) || 'profile';
    
    // 显示对应部分
    showSection(hash);
    
    // 设置导航点击事件
    document.querySelectorAll('.account-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // 更新URL
            window.location.hash = sectionId;
        });
    });
    
    // 监听hash变化
    window.addEventListener('hashchange', function() {
        const sectionId = window.location.hash.substring(1) || 'profile';
        showSection(sectionId);
    });
}

// 显示部分内容
function showSection(sectionId) {
    // 隐藏所有部分
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示选中部分
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // 更新导航状态
        document.querySelectorAll('.account-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // 更新当前部分
        accountState.currentSection = sectionId;
        
        // 如果是个人信息部分，退出编辑模式
        if (sectionId !== 'profile') {
            exitEditMode();
        }
    }
}

// 切换编辑模式
function toggleEditMode(section) {
    if (accountState.editMode) {
        exitEditMode();
    } else {
        enterEditMode(section);
    }
}

// 进入编辑模式
function enterEditMode(section) {
    accountState.editMode = true;
    
    // 启用表单输入
    document.querySelectorAll('#profileForm input, #profileForm textarea, #profileForm select').forEach(input => {
        if (input.type !== 'checkbox') {
            input.removeAttribute('readonly');
        } else {
            input.disabled = false;
        }
    });
    
    // 显示保存和取消按钮
    document.getElementById('saveProfileBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    
    // 隐藏编辑按钮
    document.querySelector('.edit-btn').style.display = 'none';
    
    // 更新复选框状态
    document.querySelectorAll('input[name="style"]').forEach(checkbox => {
        checkbox.disabled = false;
    });
}

// 退出编辑模式
function exitEditMode() {
    accountState.editMode = false;
    
    // 恢复表单只读
    document.querySelectorAll('#profileForm input, #profileForm textarea, #profileForm select').forEach(input => {
        if (input.type !== 'checkbox') {
            input.setAttribute('readonly', true);
        } else {
            input.disabled = true;
        }
    });
    
    // 隐藏保存和取消按钮
    document.getElementById('saveProfileBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    
    // 显示编辑按钮
    document.querySelector('.edit-btn').style.display = 'inline-block';
    
    // 恢复原始数据
    loadUserData();
}

// 取消编辑
function cancelEdit(section) {
    exitEditMode();
}

// 设置表单
function setupForms() {
    // 个人信息表单
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    // 密码修改表单
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
    
    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

// 保存个人信息
function saveProfile() {
    // 获取表单数据
    const username = document.getElementById('profileUsername').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const bio = document.getElementById('profileBio').value;
    
    // 获取偏好风格
    const preferredStyles = [];
    document.querySelectorAll('input[name="style"]:checked').forEach(checkbox => {
        preferredStyles.push(checkbox.value);
    });
    
    // 验证数据
    if (!username || !email) {
        showNotification('用户名和邮箱不能为空', 'warning');
        return;
    }
    
    // 更新用户数据
    accountState.user.username = username;
    accountState.user.email = email;
    accountState.user.phone = phone;
    accountState.user.bio = bio;
    accountState.user.preferredStyles = preferredStyles;
    
    // 保存到本地存储
    localStorage.setItem('user', JSON.stringify(accountState.user));
    
    // 更新显示
    loadUserData();
    
    // 退出编辑模式
    exitEditMode();
    
    showNotification('个人信息已更新', 'success');
}

// 设置头像上传
function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showNotification('请选择图片文件', 'warning');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showNotification('图片大小不能超过2MB', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // 更新预览
            avatarPreview.innerHTML = `<img src="${e.target.result}" alt="头像">`;
            
            // 更新用户头像
            document.getElementById('userAvatar').innerHTML = `<img src="${e.target.result}" alt="头像">`;
            
            // 保存到用户数据
            accountState.user.avatar = e.target.result;
            localStorage.setItem('user', JSON.stringify(accountState.user));
            
            showNotification('头像已更新', 'success');
        };
        reader.readAsDataURL(file);
    });
}

// 预览头像
function previewAvatar() {
    // 这个方法由HTML的onchange事件调用
}

// 加载订单
function loadOrders() {
    // 模拟订单数据
    const orders = [
        {
            id: 'ORD20231015001',
            date: '2023-10-15',
            status: 'completed',
            statusText: '已完成',
            items: [
                { name: '现代简约布艺沙发', price: 3999, quantity: 1, image: 'sofa' },
                { name: '智能人体工学椅', price: 1599, quantity: 2, image: 'chair' }
            ],
            total: 7197
        },
        {
            id: 'ORD20231010001',
            date: '2023-10-10',
            status: 'processing',
            statusText: '处理中',
            items: [
                { name: '实木餐桌椅组合', price: 2599, quantity: 1, image: 'table' }
            ],
            total: 2599
        },
        {
            id: 'ORD20231005001',
            date: '2023-10-05',
            status: 'pending',
            statusText: '待发货',
            items: [
                { name: '北欧创意吊灯', price: 499, quantity: 3, image: 'light' }
            ],
            total: 1497
        }
    ];
    
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = createOrderElement(order);
        container.appendChild(orderElement);
    });
}

// 创建订单元素
function createOrderElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-card';
    
    let itemsHTML = '';
    order.items.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <div class="item-image">
                    <i class="fas fa-${item.image}"></i>
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">¥${item.price.toLocaleString()} × ${item.quantity}</div>
                </div>
            </div>
        `;
    });
    
    orderDiv.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <div class="order-number">订单号: ${order.id}</div>
                <div class="order-date">下单时间: ${order.date}</div>
            </div>
            <span class="order-status status-${order.status}">${order.statusText}</span>
        </div>
        
        <div class="order-items">
            ${itemsHTML}
        </div>
        
        <div class="order-footer">
            <div class="order-total">总计: ¥${order.total.toLocaleString()}</div>
            <button class="btn-outline">查看详情</button>
        </div>
    `;
    
    return orderDiv;
}

// 加载设计作品
function loadDesigns() {
    // 模拟设计作品数据
    const designs = [
        {
            id: 1,
            title: '现代简约客厅设计',
            date: '2023-10-12',
            views: 128,
            likes: 42
        },
        {
            id: 2,
            title: '北欧风格卧室方案',
            date: '2023-10-08',
            views: 89,
            likes: 31
        },
        {
            id: 3,
            title: '小户型空间优化设计',
            date: '2023-10-01',
            views: 156,
            likes: 67
        }
    ];
    
    const container = document.getElementById('designsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    designs.forEach(design => {
        const designElement = createDesignElement(design);
        container.appendChild(designElement);
    });
}

// 创建设计作品元素
function createDesignElement(design) {
    const designDiv = document.createElement('div');
    designDiv.className = 'design-card';
    
    designDiv.innerHTML = `
        <div class="design-image">
            <i class="fas fa-palette"></i>
        </div>
        <div class="design-info">
            <h3 class="design-title">${design.title}</h3>
            <div class="design-meta">
                <span>${design.date}</span>
                <span>${design.views} 次浏览</span>
            </div>
            <div class="design-actions">
                <button class="btn-outline" onclick="viewDesign(${design.id})">查看</button>
                <button class="btn-outline" onclick="editDesign(${design.id})">编辑</button>
                <button class="btn-outline" onclick="deleteDesign(${design.id})">删除</button>
            </div>
        </div>
    `;
    
    return designDiv;
}

// 查看设计
function viewDesign(designId) {
    alert(`查看设计 ${designId}`);
    // 实际开发中可以跳转到设计查看页面
}

// 编辑设计
function editDesign(designId) {
    window.location.href = `design-tool.html?design=${designId}`;
}

// 删除设计
function deleteDesign(designId) {
    if (confirm('确定要删除这个设计吗？')) {
        showNotification('设计已删除', 'success');
        // 实际开发中需要从服务器删除
        loadDesigns(); // 重新加载
    }
}

// 加载收藏
function loadFavorites() {
    // 从本地存储获取收藏数据
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    const container = document.getElementById('favoritesList');
    if (!container) return;
    
    document.getElementById('favCount').textContent = favorites.length;
    
    container.innerHTML = '';
    
    if (favorites.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-color);">暂无收藏</p>';
        return;
    }
    
    favorites.forEach(item => {
        const favoriteElement = createFavoriteElement(item);
        container.appendChild(favoriteElement);
    });
}

// 创建收藏元素
function createFavoriteElement(item) {
    const favoriteDiv = document.createElement('div');
    favoriteDiv.className = 'favorite-card';
    
    favoriteDiv.innerHTML = `
        <div class="favorite-image">
            <div style="width: 100%; height: 100%; background: var(--light-color); display: flex; align-items: center; justify-content: center; font-size: 36px; color: var(--primary-color);">
                <i class="fas fa-couch"></i>
            </div>
            <div class="favorite-overlay">
                <button class="remove-fav" onclick="removeFromFavorites(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="favorite-info">
            <h4 class="favorite-name">${item.name}</h4>
            <div class="favorite-price">¥${item.price.toLocaleString()}</div>
        </div>
    `;
    
    return favoriteDiv;
}

// 从收藏中移除
function removeFromFavorites(itemId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(item => item.id !== itemId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    showNotification('已从收藏移除', 'success');
    loadFavorites();
}

// 加载浏览历史
function loadHistory() {
    // 从本地存储获取浏览历史
    let history = JSON.parse(localStorage.getItem('browseHistory') || '[]');
    
    const container = document.getElementById('historyList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-color);">暂无浏览历史</p>';
        return;
    }
    
    history.forEach(item => {
        const historyElement = createHistoryElement(item);
        container.appendChild(historyElement);
    });
}

// 创建历史记录元素
function createHistoryElement(item) {
    const historyDiv = document.createElement('div');
    historyDiv.className = 'history-item';
    
    historyDiv.innerHTML = `
        <div class="history-image">
            <i class="fas fa-${item.icon || 'eye'}"></i>
        </div>
        <div class="history-info">
            <h4 class="history-name">${item.name}</h4>
            <div class="history-time">${item.time}</div>
        </div>
        <button class="btn-outline" onclick="viewHistoryItem('${item.type}', ${item.id})">查看</button>
    `;
    
    return historyDiv;
}

// 清空历史
function clearHistory() {
    if (confirm('确定要清空浏览历史吗？')) {
        localStorage.removeItem('browseHistory');
        loadHistory();
        showNotification('浏览历史已清空', 'success');
    }
}

// 查看历史项目
function viewHistoryItem(type, id) {
    switch(type) {
        case 'product':
            window.location.href = `shopping.html?product=${id}`;
            break;
        case 'design':
            window.location.href = `design-tool.html?design=${id}`;
            break;
        case 'post':
            window.location.href = `community.html?post=${id}`;
            break;
    }
}

// 设置账户设置
function setupSettings() {
    // 两步验证开关
    document.getElementById('twoFactorToggle').addEventListener('change', function() {
        const enabled = this.checked;
        updateTwoFactorAuth(enabled);
    });
    
    // 退出其他设备
    document.querySelectorAll('.logout-session').forEach(btn => {
        btn.addEventListener('click', function() {
            logoutSession(this.closest('.session-item'));
        });
    });
    
    // 删除账户
    document.querySelector('.delete-account-btn')?.addEventListener('click', deleteAccount);
}

// 修改密码
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('请填写所有密码字段', 'warning');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('新密码和确认密码不一致', 'warning');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('新密码至少需要6个字符', 'warning');
        return;
    }
    
    // 模拟密码验证和更新
    // 实际开发中需要发送到服务器验证
    
    // 清空表单
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    showNotification('密码已更新', 'success');
}

// 更新两步验证
function updateTwoFactorAuth(enabled) {
    if (enabled) {
        showNotification('两步验证已启用', 'success');
    } else {
        showNotification('两步验证已禁用', 'info');
    }
}

// 退出其他设备会话
function logoutSession(sessionElement) {
    if (confirm('确定要退出这个设备的登录吗？')) {
        sessionElement.remove();
        showNotification('设备会话已退出', 'success');
    }
}

// 删除账户
function deleteAccount() {
    if (confirm('确定要删除账户吗？此操作不可撤销，所有数据将被永久删除。')) {
        if (prompt('请输入"DELETE"确认删除账户:') === 'DELETE') {
            // 删除用户数据
            localStorage.removeItem('user');
            localStorage.removeItem('favorites');
            localStorage.removeItem('browseHistory');
            localStorage.removeItem('userPosts');
            localStorage.removeItem('communityInteractions');
            localStorage.removeItem('userDesigns');
            
            // 跳转到首页
            window.location.href = 'index.html';
            
            showNotification('账户已删除', 'success');
        }
    }
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
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

// 添加通知样式（如果不存在）
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

