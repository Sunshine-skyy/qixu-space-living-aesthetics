// 在线咨询功能
document.addEventListener('DOMContentLoaded', function() {
    initializeConsultation();
    loadDesigners();
    setupChat();
    setupFAQ();
    setupBooking();
    setupEventListeners();
});

// 咨询系统状态
let consultationState = {
    designers: [],
    selectedDesigner: null,
    messages: [],
    currentUser: '当前用户',
    chatActive: false,
    bookingInfo: null,
    consultationTypes: []
};

// 初始化咨询系统
function initializeConsultation() {
    // 设置咨询类型选择
    document.querySelectorAll('.type-card .btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.closest('.type-card').querySelector('h3').textContent;
            selectConsultationType(type);
        });
    });
    
    // 设置筛选器
    document.getElementById('designerFilter').addEventListener('change', filterDesigners);
    
    // 设置聊天输入
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 设置FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

// 选择咨询类型
function selectConsultationType(type) {
    consultationState.selectedType = type;
    
    // 更新选择状态
    document.querySelectorAll('.type-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.type-card').classList.add('selected');
    
    showNotification(`已选择 ${type} 咨询`, 'success');
    
    // 滚动到设计师部分
    document.querySelector('.designer-section').scrollIntoView({ behavior: 'smooth' });
}

// 加载设计师
function loadDesigners() {
    // 模拟设计师数据
    const designers = [
        {
            id: 1,
            name: '王设计师',
            title: '高级室内设计师',
            specialties: ['现代简约', '小户型', '空间优化'],
            rating: 4.9,
            experience: '8年',
            projects: 156,
            reviews: 89,
            price: 499,
            online: true,
            available: true
        },
        {
            id: 2,
            name: '李空间规划师',
            title: '空间规划专家',
            specialties: ['北欧风格', '收纳设计', '功能规划'],
            rating: 4.8,
            experience: '6年',
            projects: 89,
            reviews: 64,
            price: 399,
            online: true,
            available: true
        },
        {
            id: 3,
            name: '陈色彩顾问',
            title: '色彩搭配专家',
            specialties: ['色彩心理学', '软装搭配', '照明设计'],
            rating: 4.9,
            experience: '10年',
            projects: 203,
            reviews: 127,
            price: 299,
            online: false,
            available: true
        },
        {
            id: 4,
            name: '张装修监理',
            title: '装修工程监理',
            specialties: ['工程管理', '质量控制', '预算控制'],
            rating: 4.7,
            experience: '12年',
            projects: 178,
            reviews: 93,
            price: 599,
            online: true,
            available: false
        },
        {
            id: 5,
            name: '赵软装设计师',
            title: '软装设计专家',
            specialties: ['家具搭配', '布艺设计', '装饰艺术'],
            rating: 4.8,
            experience: '7年',
            projects: 112,
            reviews: 67,
            price: 349,
            online: true,
            available: true
        },
        {
            id: 6,
            name: '刘智能家居专家',
            title: '智能家居顾问',
            specialties: ['智能系统', '安防设计', '家庭自动化'],
            rating: 4.6,
            experience: '5年',
            projects: 78,
            reviews: 42,
            price: 449,
            online: true,
            available: true
        }
    ];
    
    consultationState.designers = designers;
    renderDesigners(designers);
}

// 渲染设计师
function renderDesigners(designers) {
    const container = document.getElementById('designerGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    designers.forEach(designer => {
        const designerElement = createDesignerElement(designer);
        container.appendChild(designerElement);
    });
}

// 创建设计师元素
function createDesignerElement(designer) {
    const designerDiv = document.createElement('div');
    designerDiv.className = 'designer-card';
    
    // 生成专长标签
    const specialtiesHTML = designer.specialties.map(spec => 
        `<span class="specialty-tag">${spec}</span>`
    ).join('');
    
    // 生成星级评分
    const stars = generateStars(designer.rating);
    
    designerDiv.innerHTML = `
        <div class="designer-header">
            <div class="designer-avatar">${designer.name.charAt(0)}</div>
            <div class="online-status ${designer.online ? '' : 'offline'}"></div>
            <h3 class="designer-name">${designer.name}</h3>
            <div class="designer-title">${designer.title}</div>
            <div class="designer-rating">
                ${stars}
                <span>${designer.rating}</span>
            </div>
            <div class="designer-specialties">
                ${specialtiesHTML}
            </div>
        </div>
        
        <div class="designer-content">
            <div class="designer-stats">
                <div class="stat-item">
                    <span class="stat-number">${designer.experience}</span>
                    <span class="stat-label">从业经验</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${designer.projects}+</span>
                    <span class="stat-label">成功案例</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${designer.reviews}</span>
                    <span class="stat-label">用户评价</span>
                </div>
            </div>
            
            <div class="designer-price" style="text-align: center; margin-bottom: 15px; font-size: 20px; font-weight: 700; color: var(--accent-color);">
                ¥${designer.price}/小时
            </div>
            
            <div class="designer-actions">
                <button class="btn-primary" onclick="startConsultation(${designer.id})" ${!designer.available ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    ${designer.online ? '立即咨询' : '预约咨询'}
                </button>
                <button class="btn-outline" onclick="viewDesignerProfile(${designer.id})">
                    查看详情
                </button>
            </div>
        </div>
    `;
    
    return designerDiv;
}

// 筛选设计师
function filterDesigners() {
    const filter = document.getElementById('designerFilter').value;
    let filtered = [...consultationState.designers];
    
    switch(filter) {
        case 'online':
            filtered = filtered.filter(designer => designer.online);
            break;
        case 'senior':
            filtered = filtered.filter(designer => parseInt(designer.experience) >= 8);
            break;
        case 'specialty':
            // 可以添加按专长筛选的逻辑
            break;
    }
    
    renderDesigners(filtered);
}

// 开始咨询
function startConsultation(designerId) {
    const designer = consultationState.designers.find(d => d.id === designerId);
    if (!designer) return;
    
    if (!designer.available) {
        showNotification('该设计师当前不可预约', 'warning');
        return;
    }
    
    if (designer.online) {
        // 在线咨询
        consultationState.selectedDesigner = designer;
        consultationState.chatActive = true;
        
        // 更新聊天界面
        updateChatInterface(designer);
        
        // 添加欢迎消息
        addSystemMessage(`${designer.name}已加入咨询，开始为您服务。`);
        
        // 滚动到聊天部分
        document.querySelector('.chat-section').scrollIntoView({ behavior: 'smooth' });
        
        showNotification(`开始与${designer.name}的在线咨询`, 'success');
    } else {
        // 离线，打开预约模态框
        openBookingModal(designer);
    }
}

// 查看设计师详情
function viewDesignerProfile(designerId) {
    const designer = consultationState.designers.find(d => d.id === designerId);
    if (!designer) return;
    
    // 创建详情模态框
    const modalHTML = `
        <div class="designer-modal">
            <div class="modal-content">
                <button class="close-modal" onclick="closeDesignerModal()">×</button>
                <div class="modal-body">
                    <div class="designer-header" style="text-align: center; padding: 0;">
                        <div class="designer-avatar" style="width: 120px; height: 120px; font-size: 48px;">${designer.name.charAt(0)}</div>
                        <h2>${designer.name}</h2>
                        <div class="designer-title">${designer.title}</div>
                        <div class="designer-rating">
                            ${generateStars(designer.rating)}
                            <span>${designer.rating} (${designer.reviews}个评价)</span>
                        </div>
                    </div>
                    
                    <div class="designer-details">
                        <div class="detail-section">
                            <h3>专业领域</h3>
                            <div class="designer-specialties">
                                ${designer.specialties.map(spec => `<span class="specialty-tag">${spec}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>专业经验</h3>
                            <p>${designer.experience}年从业经验，完成${designer.projects}+个成功案例</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>咨询服务</h3>
                            <div class="service-list">
                                <div class="service-item">
                                    <span>基础咨询</span>
                                    <span>¥${designer.price}/小时</span>
                                </div>
                                <div class="service-item">
                                    <span>深度方案</span>
                                    <span>¥${designer.price * 3}/3小时</span>
                                </div>
                                <div class="service-item">
                                    <span>全程指导</span>
                                    <span>¥${designer.price * 8}/项目</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>用户评价</h3>
                            <div class="review-excerpt">
                                "专业负责，给出的建议非常实用！" —— 张先生
                            </div>
                            <div class="review-excerpt">
                                "设计师很细心，方案考虑得很周全。" —— 李女士
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="startConsultation(${designer.id})">
                            ${designer.online ? '立即咨询' : '预约咨询'}
                        </button>
                        <button class="btn-outline" onclick="saveDesigner(${designer.id})">
                            <i class="fas fa-bookmark"></i> 收藏设计师
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-overlay" onclick="closeDesignerModal()"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 关闭设计师详情模态框
function closeDesignerModal() {
    const modal = document.querySelector('.designer-modal');
    if (modal) {
        modal.remove();
    }
}

// 保存设计师
function saveDesigner(designerId) {
    let savedDesigners = JSON.parse(localStorage.getItem('savedDesigners') || '[]');
    
    if (!savedDesigners.includes(designerId)) {
        savedDesigners.push(designerId);
        localStorage.setItem('savedDesigners', JSON.stringify(savedDesigners));
        showNotification('设计师已收藏', 'success');
    } else {
        showNotification('设计师已在收藏中', 'info');
    }
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

// 设置聊天功能
function setupChat() {
    consultationState.messages = [
        {
            id: 1,
            sender: 'designer',
            content: '您好！我是王设计师。很高兴为您提供空间美学咨询服务。',
            time: '10:30'
        },
        {
            id: 2,
            sender: 'user',
            content: '您好！我最近在装修一个小户型的公寓，想咨询一下空间优化的问题。',
            time: '10:32'
        },
        {
            id: 3,
            sender: 'designer',
            content: '好的，小户型空间优化是我的专长。您可以先告诉我具体的房间尺寸和您的需求吗？',
            time: '10:33'
        },
        {
            id: 4,
            sender: 'user',
            content: '公寓面积是65平米，两室一厅。我希望客厅能兼具工作和休闲功能。',
            time: '10:35'
        }
    ];
    
    renderMessages();
}

// 更新聊天界面
function updateChatInterface(designer) {
    document.querySelector('.partner-avatar').textContent = designer.name.charAt(0);
    document.querySelector('.partner-info h3').textContent = designer.name;
    document.querySelector('.chat-status').textContent = '在线 • 等待回复';
}

// 渲染消息
function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = '';
    
    consultationState.messages.forEach(message => {
        const messageElement = createMessageElement(message);
        container.appendChild(messageElement);
    });
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
}

// 创建消息元素
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
        <p>${message.content}</p>
        <div class="message-time">${message.time}</div>
    `;
    
    return messageDiv;
}

// 添加系统消息
function addSystemMessage(content) {
    const message = {
        id: Date.now(),
        sender: 'system',
        content: content,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    consultationState.messages.push(message);
    renderMessages();
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    if (!consultationState.chatActive) {
        showNotification('请先选择设计师开始咨询', 'warning');
        return;
    }
    
    // 添加用户消息
    const userMessage = {
        id: Date.now(),
        sender: 'user',
        content: content,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    consultationState.messages.push(userMessage);
    renderMessages();
    
    // 清空输入框
    input.value = '';
    
    // 模拟设计师回复
    setTimeout(() => {
        const reply = generateDesignerReply(content);
        const designerMessage = {
            id: Date.now(),
            sender: 'designer',
            content: reply,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        consultationState.messages.push(designerMessage);
        renderMessages();
        
        // 更新状态
        document.querySelector('.chat-status').textContent = '在线 • 正在输入...';
        
        setTimeout(() => {
            document.querySelector('.chat-status').textContent = '在线';
        }, 1000);
    }, 1500);
}

// 生成设计师回复
function generateDesignerReply(userMessage) {
    const replies = [
        '我了解了，对于65平米的两室一厅公寓，我建议考虑开放式布局。',
        '客厅可以设计成多功能区域，使用可折叠家具和墙面收纳。',
        '您对家具风格有什么偏好吗？比如现代简约还是北欧风格？',
        '建议选择浅色系配色，可以扩大空间感。',
        '是否需要考虑智能化家居设备？',
        '预算大概在什么范围？这样我可以给出更具体的建议。',
        '您有户型图吗？这样我可以帮您做更精准的规划。'
    ];
    
    // 简单的关键词匹配
    if (userMessage.includes('预算') || userMessage.includes('价格')) {
        return '关于预算，建议分为硬装、家具、软装三部分来规划。';
    }
    
    if (userMessage.includes('颜色') || userMessage.includes('色彩')) {
        return '小户型建议使用浅色系，比如米白、浅灰，配合一些亮色点缀。';
    }
    
    if (userMessage.includes('家具') || userMessage.includes('沙发')) {
        return '小户型建议选择多功能家具，比如沙发床、折叠餐桌等。';
    }
    
    // 随机选择一个回复
    return replies[Math.floor(Math.random() * replies.length)];
}

// 设置FAQ
function setupFAQ() {
    // 初始展开第一个问题
    const firstQuestion = document.querySelector('.faq-question');
    if (firstQuestion) {
        toggleFAQ(firstQuestion);
    }
}

// 切换FAQ显示
function toggleFAQ(questionElement) {
    const answer = questionElement.nextElementSibling;
    const icon = questionElement.querySelector('i');
    
    if (answer.classList.contains('active')) {
        answer.classList.remove('active');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        // 关闭其他打开的FAQ
        document.querySelectorAll('.faq-answer.active').forEach(ans => {
            ans.classList.remove('active');
            ans.previousElementSibling.querySelector('i').classList.remove('fa-chevron-up');
            ans.previousElementSibling.querySelector('i').classList.add('fa-chevron-down');
        });
        
        answer.classList.add('active');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// 设置预约功能
function setupBooking() {
    document.getElementById('bookingForm').addEventListener('submit', submitBooking);
    
    // 设置日期选择器的最小日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('consultationDate').min = today;
    
    // 设置时长变化时更新费用
    document.getElementById('consultationDuration').addEventListener('change', updateBookingFee);
    
    // 生成时间槽
    generateTimeSlots();
}

// 打开预约模态框
function openBookingModal(designerName) {
    if (designerName) {
        document.getElementById('consultantName').value = designerName;
    }
    
    document.getElementById('bookingModal').classList.add('active');
    
    // 生成可用的时间槽
    generateTimeSlots();
}

// 关闭预约模态框
function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.getElementById('bookingForm').reset();
    document.getElementById('consultationFee').textContent = '¥299';
    
    // 清空时间槽选择
    document.querySelectorAll('.time-slot.selected').forEach(slot => {
        slot.classList.remove('selected');
    });
}

// 生成时间槽
function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    if (!container) return;
    
    container.innerHTML = '';
    
    const timeSlots = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'
    ];
    
    // 模拟已预约的时间
    const bookedSlots = ['10:00', '15:00', '19:00'];
    
    timeSlots.forEach(time => {
        const slotDiv = document.createElement('div');
        slotDiv.className = `time-slot ${bookedSlots.includes(time) ? 'booked' : ''}`;
        slotDiv.textContent = time;
        slotDiv.setAttribute('data-time', time);
        
        if (!bookedSlots.includes(time)) {
            slotDiv.addEventListener('click', function() {
                // 取消选择其他时间槽
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('selected');
                });
                
                this.classList.add('selected');
            });
        } else {
            slotDiv.title = '已预约';
        }
        
        container.appendChild(slotDiv);
    });
}

// 更新预约费用
function updateBookingFee() {
    const duration = parseInt(document.getElementById('consultationDuration').value);
    const basePrice = 299; // 基础价格
    
    let fee = basePrice;
    if (duration === 30) fee = basePrice * 0.6;
    if (duration === 90) fee = basePrice * 1.5;
    if (duration === 120) fee = basePrice * 2;
    
    document.getElementById('consultationFee').textContent = `¥${fee}`;
}

// 提交预约
function submitBooking(event) {
    event.preventDefault();
    
    const consultantName = document.getElementById('consultantName').value;
    const date = document.getElementById('consultationDate').value;
    const selectedTime = document.querySelector('.time-slot.selected');
    const type = document.getElementById('consultationType').value;
    const duration = document.getElementById('consultationDuration').value;
    const topic = document.getElementById('consultationTopic').value;
    const notes = document.getElementById('consultationNotes').value;
    
    if (!consultantName || !date || !selectedTime || !type || !topic) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }
    
    if (!selectedTime) {
        showNotification('请选择预约时间', 'warning');
        return;
    }
    
    const time = selectedTime.getAttribute('data-time');
    const fee = document.getElementById('consultationFee').textContent;
    
    // 创建预约记录
    const booking = {
        id: `BK${Date.now()}`,
        consultantName,
        date,
        time,
        type,
        duration: `${duration}分钟`,
        topic,
        notes,
        fee,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // 保存预约记录
    let bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('userBookings', JSON.stringify(bookings));
    
    // 关闭模态框
    closeBookingModal();
    
    // 显示成功消息
    showNotification(`预约成功！预约编号：${booking.id}`, 'success');
    
    // 跳转到个人账户查看预约
    setTimeout(() => {
        window.location.href = 'account.html#orders';
    }, 2000);
}

// 设置事件监听器
function setupEventListeners() {
    // 点击模态框外部关闭
    document.getElementById('bookingModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeBookingModal();
        }
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // ESC键关闭模态框
        if (e.key === 'Escape' && document.getElementById('bookingModal').classList.contains('active')) {
            closeBookingModal();
        }
    });
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

