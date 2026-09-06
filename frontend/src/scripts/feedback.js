// 用户反馈功能
document.addEventListener('DOMContentLoaded', function() {
    initializeFeedback();
    setupFeedbackForm();
    loadFeedbackHistory();
    setupTestimonialSlider();
    setupRoadmap();
    setupEventListeners();
});

// 反馈系统状态
let feedbackState = {
    currentStep: 1,
    formData: {},
    feedbackHistory: [],
    testimonials: [],
    currentTestimonial: 0,
    roadmapItems: []
};

// 初始化反馈系统
function initializeFeedback() {
    // 设置步骤指示器
    updateStepIndicator();
    
    // 设置表单验证
    setupFormValidation();
    
    // 设置图片上传
    setupImageUpload();
    
    // 设置字符计数
    setupCharacterCount();
}

// 设置反馈表单
function setupFeedbackForm() {
    // 设置反馈类型选择
    document.querySelectorAll('.feedback-type').forEach(type => {
        type.addEventListener('click', function() {
            selectFeedbackType(this);
        });
    });
    
    // 设置评分星星
    document.querySelectorAll('.rating-star').forEach(star => {
        star.addEventListener('click', function() {
            setRating(this);
        });
    });
    
    // 设置表单导航
    document.getElementById('nextBtn')?.addEventListener('click', nextStep);
    document.getElementById('prevBtn')?.addEventListener('click', prevStep);
    
    // 设置表单提交
    document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);
}

// 选择反馈类型
function selectFeedbackType(element) {
    // 移除其他类型的选择
    document.querySelectorAll('.feedback-type').forEach(type => {
        type.classList.remove('selected');
    });
    
    // 添加当前类型的选择
    element.classList.add('selected');
    
    // 获取反馈类型
    const type = element.querySelector('h4').textContent;
    feedbackState.formData.type = type;
    
    // 设置隐藏输入的值
    document.getElementById('feedbackType').value = type;
    
    // 启用下一步按钮
    document.getElementById('nextBtn').disabled = false;
}

// 设置评分
function setRating(star) {
    const rating = parseInt(star.getAttribute('data-rating'));
    
    // 更新星星显示
    document.querySelectorAll('.rating-star').forEach(s => {
        const starRating = parseInt(s.getAttribute('data-rating'));
        s.classList.toggle('active', starRating <= rating);
    });
    
    // 保存评分
    feedbackState.formData.rating = rating;
    document.getElementById('feedbackRating').value = rating;
}

// 下一步
function nextStep() {
    // 验证当前步骤
    if (!validateCurrentStep()) {
        return;
    }
    
    // 保存当前步骤数据
    saveCurrentStepData();
    
    // 隐藏当前步骤
    const currentStepElement = document.getElementById(`step${feedbackState.currentStep}`);
    currentStepElement.classList.remove('active');
    
    // 显示下一步
    feedbackState.currentStep++;
    const nextStepElement = document.getElementById(`step${feedbackState.currentStep}`);
    nextStepElement.classList.add('active');
    
    // 更新步骤指示器
    updateStepIndicator();
    
    // 更新按钮状态
    updateNavigationButtons();
    
    // 如果到第4步，更新摘要
    if (feedbackState.currentStep === 4) {
        updateSummary();
    }
}

// 上一步
function prevStep() {
    // 隐藏当前步骤
    const currentStepElement = document.getElementById(`step${feedbackState.currentStep}`);
    currentStepElement.classList.remove('active');
    
    // 显示上一步
    feedbackState.currentStep--;
    const prevStepElement = document.getElementById(`step${feedbackState.currentStep}`);
    prevStepElement.classList.add('active');
    
    // 更新步骤指示器
    updateStepIndicator();
    
    // 更新按钮状态
    updateNavigationButtons();
}

// 验证当前步骤
function validateCurrentStep() {
    switch(feedbackState.currentStep) {
        case 1:
            if (!feedbackState.formData.type) {
                showNotification('请选择反馈类型', 'warning');
                return false;
            }
            break;
        case 2:
            if (!feedbackState.formData.rating) {
                showNotification('请给出评分', 'warning');
                return false;
            }
            break;
        case 3:
            const title = document.getElementById('feedbackTitle').value.trim();
            const description = document.getElementById('feedbackDescription').value.trim();
            
            if (!title || title.length < 5) {
                showNotification('请填写有效的反馈标题', 'warning');
                document.getElementById('feedbackTitle').focus();
                return false;
            }
            
            if (!description || description.length < 20) {
                showNotification('请详细描述您的反馈内容', 'warning');
                document.getElementById('feedbackDescription').focus();
                return false;
            }
            break;
    }
    
    return true;
}

// 保存当前步骤数据
function saveCurrentStepData() {
    switch(feedbackState.currentStep) {
        case 2:
            // 保存分类选择
            const selectedCategories = [];
            document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            feedbackState.formData.categories = selectedCategories;
            break;
        case 3:
            // 保存表单数据
            feedbackState.formData.title = document.getElementById('feedbackTitle').value.trim();
            feedbackState.formData.description = document.getElementById('feedbackDescription').value.trim();
            feedbackState.formData.priority = document.getElementById('feedbackPriority').value;
            
            // 保存图片
            const images = [];
            document.querySelectorAll('#imagePreview img').forEach(img => {
                images.push(img.src);
            });
            feedbackState.formData.images = images;
            
            // 保存联系许可
            feedbackState.formData.contactConsent = document.getElementById('contactConsent').checked;
            break;
    }
}

// 更新步骤指示器
function updateStepIndicator() {
    // 更新所有步骤状态
    for (let i = 1; i <= 4; i++) {
        const stepIndicator = document.getElementById(`step${i}-indicator`);
        if (!stepIndicator) continue;
        
        stepIndicator.classList.remove('active', 'completed');
        
        if (i < feedbackState.currentStep) {
            stepIndicator.classList.add('completed');
        } else if (i === feedbackState.currentStep) {
            stepIndicator.classList.add('active');
        }
    }
}

// 更新导航按钮
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) {
        prevBtn.style.display = feedbackState.currentStep > 1 ? 'inline-block' : 'none';
    }
    
    if (nextBtn) {
        nextBtn.style.display = feedbackState.currentStep < 4 ? 'inline-block' : 'none';
    }
    
    if (submitBtn) {
        submitBtn.style.display = feedbackState.currentStep === 4 ? 'inline-block' : 'none';
    }
}

// 更新摘要
function updateSummary() {
    // 更新类型
    document.getElementById('summaryType').textContent = feedbackState.formData.type || '未选择';
    
    // 更新评分
    const rating = feedbackState.formData.rating;
    document.getElementById('summaryRating').textContent = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '未选择';
    
    // 更新标题
    document.getElementById('summaryTitle').textContent = feedbackState.formData.title || '未填写';
    
    // 更新优先级
    const priorityMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'critical': '紧急'
    };
    document.getElementById('summaryPriority').textContent = priorityMap[feedbackState.formData.priority] || '中';
    
    // 更新描述
    document.getElementById('summaryDescription').textContent = feedbackState.formData.description || '未填写';
}

// 提交反馈
function submitFeedback(event) {
    event.preventDefault();
    
    // 验证最终同意
    if (!document.getElementById('finalConsent').checked) {
        showNotification('请同意服务条款', 'warning');
        return;
    }
    
    // 创建反馈记录
    const feedback = {
        id: `FB${Date.now()}`,
        ...feedbackState.formData,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        referenceNumber: `REF-${Date.now().toString().slice(-8)}`
    };
    
    // 保存反馈记录
    let feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
    feedbacks.unshift(feedback);
    localStorage.setItem('userFeedbacks', JSON.stringify(feedbacks));
    
    // 重置表单
    resetFeedbackForm();
    
    // 显示成功消息
    showNotification(`反馈提交成功！参考编号：${feedback.referenceNumber}`, 'success');
    
    // 重新加载反馈历史
    setTimeout(() => {
        loadFeedbackHistory();
        showSection('history');
    }, 1000);
}

// 重置反馈表单
function resetFeedbackForm() {
    // 重置表单数据
    feedbackState.formData = {};
    feedbackState.currentStep = 1;
    
    // 重置表单界面
    document.getElementById('feedbackForm').reset();
    
    // 重置步骤显示
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step1').classList.add('active');
    
    // 重置选择状态
    document.querySelectorAll('.feedback-type').forEach(type => {
        type.classList.remove('selected');
    });
    
    document.querySelectorAll('.rating-star').forEach(star => {
        star.classList.remove('active');
    });
    
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 清空图片预览
    document.getElementById('imagePreview').innerHTML = '';
    
    // 重置步骤指示器
    updateStepIndicator();
    
    // 重置导航按钮
    updateNavigationButtons();
    
    // 重置字符计数
    updateCharacterCount('feedbackTitle');
    updateCharacterCount('feedbackDescription');
}

// 设置表单验证
function setupFormValidation() {
    // 标题验证
    document.getElementById('feedbackTitle').addEventListener('input', function() {
        updateCharacterCount('feedbackTitle');
    });
    
    // 描述验证
    document.getElementById('feedbackDescription').addEventListener('input', function() {
        updateCharacterCount('feedbackDescription');
    });
}

// 设置字符计数
function setupCharacterCount() {
    updateCharacterCount('feedbackTitle');
    updateCharacterCount('feedbackDescription');
}

// 更新字符计数
function updateCharacterCount(fieldId) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(fieldId + 'Count');
    if (!field || !counter) return;
    
    const maxLength = field.getAttribute('maxlength') || 1000;
    const currentLength = field.value.length;
    
    counter.textContent = `${currentLength}/${maxLength}`;
    
    // 根据长度改变颜色
    counter.classList.remove('warning', 'error');
    
    if (currentLength > maxLength * 0.8) {
        counter.classList.add('warning');
    }
    
    if (currentLength > maxLength) {
        counter.classList.add('error');
    }
}

// 设置图片上传
function setupImageUpload() {
    document.getElementById('screenshotInput').addEventListener('change', handleScreenshotUpload);
}

// 处理图片上传
function handleScreenshotUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('screenshotPreview');
    
    if (!files || files.length === 0) return;
    
    // 限制最多5张图片
    const currentCount = preview.querySelectorAll('.screenshot-item').length;
    if (currentCount + files.length > 5) {
        showNotification('最多只能上传5张图片', 'warning');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showNotification('请选择图片文件', 'warning');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('图片大小不能超过5MB', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.createElement('div');
            imgElement.className = 'screenshot-item';
            imgElement.innerHTML = `
                <img src="${e.target.result}" alt="截图预览">
                <button class="remove-screenshot" onclick="this.parentElement.remove()">×</button>
            `;
            preview.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    });
}

// 加载反馈历史
function loadFeedbackHistory() {
    // 从本地存储获取反馈记录
    let feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
    
    // 合并示例数据
    const sampleFeedbacks = [
        {
            id: 'FB1',
            type: '功能建议',
            title: '希望增加3D预览功能',
            description: '建议在设计工具中增加3D预览功能，这样能更直观地看到设计效果。',
            rating: 4,
            status: 'reviewed',
            submittedAt: '2023-10-10T14:30:00Z',
            referenceNumber: 'REF-1001',
            response: '感谢您的建议！我们已经在规划3D预览功能，预计下个季度发布。'
        },
        {
            id: 'FB2',
            type: '问题报告',
            title: '购物车价格显示错误',
            description: '在购物车页面，部分商品价格计算有误，请检查修复。',
            rating: 3,
            status: 'resolved',
            submittedAt: '2023-10-05T09:15:00Z',
            referenceNumber: 'REF-1002',
            response: '感谢反馈！问题已修复，请刷新页面查看。'
        },
        {
            id: 'FB3',
            type: '设计反馈',
            title: '移动端界面优化建议',
            description: '移动端界面在小屏幕上有些拥挤，建议调整布局和字体大小。',
            rating: 4,
            status: 'pending',
            submittedAt: '2023-10-01T16:45:00Z',
            referenceNumber: 'REF-1003'
        }
    ];
    
    feedbackState.feedbackHistory = [...sampleFeedbacks, ...feedbacks];
    renderFeedbackHistory();
}

// 渲染反馈历史
function renderFeedbackHistory() {
    const container = document.getElementById('feedbackHistory');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 应用筛选和排序
    let filtered = [...feedbackState.feedbackHistory];
    
    const filter = document.getElementById('historyFilter').value;
    if (filter !== 'all') {
        filtered = filtered.filter(item => item.status === filter);
    }
    
    const sort = document.getElementById('historySort').value;
    switch(sort) {
        case 'newest':
            filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
            break;
        case 'priority':
            // 按状态排序：pending > reviewed > resolved
            const priorityOrder = { 'pending': 0, 'reviewed': 1, 'resolved': 2 };
            filtered.sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status]);
            break;
    }
    
    filtered.forEach(feedback => {
        const feedbackElement = createFeedbackElement(feedback);
        container.appendChild(feedbackElement);
    });
}

// 创建反馈元素
function createFeedbackElement(feedback) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-item';
    
    // 生成状态标签
    const statusMap = {
        'pending': { class: 'pending', text: '待处理' },
        'reviewed': { class: 'reviewed', text: '已查看' },
        'resolved': { class: 'resolved', text: '已解决' },
        'closed': { class: 'closed', text: '已关闭' }
    };
    
    const status = statusMap[feedback.status] || statusMap.pending;
    
    // 生成评级星星
    const ratingStars = '★'.repeat(feedback.rating || 0) + '☆'.repeat(5 - (feedback.rating || 0));
    
    // 生成响应HTML
    let responseHTML = '';
    if (feedback.response) {
        responseHTML = `
            <div class="feedback-response">
                <div class="response-header">
                    <span class="response-admin">管理员回复</span>
                    <span class="response-date">${formatDate(new Date(feedback.submittedAt), true)}</span>
                </div>
                <p>${feedback.response}</p>
            </div>
        `;
    }
    
    feedbackDiv.innerHTML = `
        <div class="feedback-header-info">
            <div>
                <span class="feedback-type-badge">${feedback.type}</span>
                <span class="feedback-status status-${status.class}">${status.text}</span>
            </div>
            <span class="feedback-date">${formatDate(new Date(feedback.submittedAt))}</span>
        </div>
        
        <div class="feedback-content">
            <h4>${feedback.title}</h4>
            <p>${feedback.description}</p>
            
            <div class="feedback-rating">
                <span>评分: ${ratingStars}</span>
            </div>
            
            <div class="feedback-info">
                <span>参考编号: ${feedback.referenceNumber}</span>
            </div>
        </div>
        
        ${responseHTML}
    `;
    
    return feedbackDiv;
}

// 设置见证滑块
function setupTestimonialSlider() {
    feedbackState.testimonials = document.querySelectorAll('.testimonial-slide');
    feedbackState.currentTestimonial = 0;
    
    // 设置点点击
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToTestimonial(index);
        });
    });
    
    // 自动轮播
    setInterval(() => {
        nextTestimonial();
    }, 5000);
}

// 下一个见证
function nextTestimonial() {
    feedbackState.currentTestimonial = (feedbackState.currentTestimonial + 1) % feedbackState.testimonials.length;
    updateTestimonialSlider();
}

// 上一个见证
function prevTestimonial() {
    feedbackState.currentTestimonial = (feedbackState.currentTestimonial - 1 + feedbackState.testimonials.length) % feedbackState.testimonials.length;
    updateTestimonialSlider();
}

// 跳转到指定见证
function goToTestimonial(index) {
    feedbackState.currentTestimonial = index;
    updateTestimonialSlider();
}

// 更新见证滑块
function updateTestimonialSlider() {
    // 隐藏所有见证
    feedbackState.testimonials.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // 显示当前见证
    feedbackState.testimonials[feedbackState.currentTestimonial].classList.add('active');
    
    // 更新点状态
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === feedbackState.currentTestimonial);
    });
}

// 设置路线图
function setupRoadmap() {
    // 路线图数据已经在HTML中，这里可以添加交互功能
    // 比如点击路线图项目查看更多详情
}

// 设置事件监听器
function setupEventListeners() {
    // 筛选和排序变化
    document.getElementById('historyFilter').addEventListener('change', () => {
        renderFeedbackHistory();
    });
    
    document.getElementById('historySort').addEventListener('change', () => {
        renderFeedbackHistory();
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 左箭头：上一个见证
        if (e.key === 'ArrowLeft') {
            prevTestimonial();
        }
        // 右箭头：下一个见证
        if (e.key === 'ArrowRight') {
            nextTestimonial();
        }
    });
}

// 格式化日期
function formatDate(date, includeTime = false) {
    const now = new Date();
    const diff = now - date;
    
    // 如果是今天
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        if (includeTime) {
            return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return '今天';
    }
    
    // 如果是昨天
    if (diff < 2 * 24 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
        return '昨天';
    }
    
    // 其他情况
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    if (includeTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
    }
    
    return `${date.getFullYear()}-${month}-${day}`;
}

// 显示部分内容
function showSection(sectionId) {
    // 移除所有部分的active类
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 添加目标部分的active类
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
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

