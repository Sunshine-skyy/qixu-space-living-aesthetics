// 方案推荐功能
document.addEventListener('DOMContentLoaded', function() {
    initializeRecommendations();
    setupQuiz();
    loadRecommendations();
    setupDesigners();
    setupAIRecommendation();
});

// 推荐系统状态
let recommendationsState = {
    quizAnswers: {},
    currentQuizStep: 1,
    recommendations: [],
    currentFilter: 'all',
    currentSort: 'relevance',
    designers: [],
    aiRecommendation: null
};

// 初始化推荐系统
function initializeRecommendations() {
    // 设置筛选器
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            filterRecommendations(filter);
        });
    });
    
    // 设置排序
    document.getElementById('sortRecommendations').addEventListener('change', function() {
        recommendationsState.currentSort = this.value;
        sortRecommendations();
    });
    
    // 设置模板使用
    document.querySelectorAll('.use-template').forEach(button => {
        button.addEventListener('click', function() {
            const template = this.getAttribute('data-template');
            useTemplate(template);
        });
    });
}

// 设置个性测试
function setupQuiz() {
    const totalSteps = 5;
    
    // 设置选项点击
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const step = parseInt(this.closest('.quiz-step').id.replace('step', ''));
            const value = this.getAttribute('data-value');
            
            // 保存答案
            recommendationsState.quizAnswers[`step${step}`] = value;
            
            // 更新选项状态
            this.closest('.quiz-step').querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // 启用下一步按钮
            if (step < totalSteps) {
                document.getElementById('nextBtn').style.display = 'inline-block';
                document.getElementById('submitBtn').style.display = 'none';
            } else {
                document.getElementById('nextBtn').style.display = 'none';
                document.getElementById('submitBtn').style.display = 'inline-block';
            }
        });
    });
    
    // 设置导航按钮
    document.getElementById('nextBtn').addEventListener('click', nextQuizStep);
    document.getElementById('prevBtn').addEventListener('click', prevQuizStep);
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
}

// 下一个测试步骤
function nextQuizStep() {
    if (recommendationsState.currentQuizStep < 5) {
        // 保存当前答案
        const currentStep = recommendationsState.currentQuizStep;
        const selectedOption = document.querySelector(`#step${currentStep} .quiz-option.selected`);
        
        if (!selectedOption && currentStep > 0) {
            showNotification('请选择答案', 'warning');
            return;
        }
        
        // 隐藏当前步骤
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}-indicator`).classList.remove('active');
        
        // 显示下一步
        recommendationsState.currentQuizStep++;
        document.getElementById(`step${recommendationsState.currentQuizStep}`).classList.add('active');
        document.getElementById(`step${recommendationsState.currentQuizStep}-indicator`).classList.add('active');
        
        // 更新按钮状态
        document.getElementById('prevBtn').style.display = 'inline-block';
        
        if (recommendationsState.currentQuizStep === 5) {
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('submitBtn').style.display = 'inline-block';
        }
    }
}

// 上一个测试步骤
function prevQuizStep() {
    if (recommendationsState.currentQuizStep > 1) {
        // 隐藏当前步骤
        document.getElementById(`step${recommendationsState.currentQuizStep}`).classList.remove('active');
        document.getElementById(`step${recommendationsState.currentQuizStep}-indicator`).classList.remove('active');
        
        // 显示上一步
        recommendationsState.currentQuizStep--;
        document.getElementById(`step${recommendationsState.currentQuizStep}`).classList.add('active');
        document.getElementById(`step${recommendationsState.currentQuizStep}-indicator`).classList.add('active');
        
        // 更新按钮状态
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
        
        if (recommendationsState.currentQuizStep === 1) {
            document.getElementById('prevBtn').style.display = 'none';
        }
    }
}

// 提交测试
function submitQuiz() {
    // 检查是否完成所有问题
    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
        if (!recommendationsState.quizAnswers[`step${i}`]) {
            showNotification('请完成所有问题', 'warning');
            return;
        }
    }
    
    // 生成推荐
    generateRecommendations();
    
    // 显示成功消息
    showNotification('个性测试完成！正在为您生成推荐方案...', 'success');
    
    // 跳转到推荐部分
    document.querySelector('.recommendations-section').scrollIntoView({ behavior: 'smooth' });
}

// 生成推荐
function generateRecommendations() {
    const answers = recommendationsState.quizAnswers;
    
    // 根据答案生成推荐
    const recommendations = [];
    
    // 小户型 + 现代简约 + 经济型
    if (answers.step1 === 'small' && answers.step2 === 'modern') {
        recommendations.push({
            id: 1,
            title: '小户型现代简约风整体方案',
            description: '针对小户型的现代简约风格整体设计方案，注重空间利用和功能性，预算控制在8万元以内。',
            style: '现代简约',
            budget: '经济型',
            rating: 4.8,
            popularity: 156,
            price: 79999,
            tags: ['小户型', '现代简约', '经济型'],
            features: ['空间优化设计', '多功能家具', '浅色系搭配']
        });
    }
    
    // 中户型 + 北欧风格 + 标准型
    if (answers.step1 === 'medium' && answers.step2 === 'nordic') {
        recommendations.push({
            id: 2,
            title: '北欧风格温馨家居方案',
            description: '北欧风格的中户型设计方案，注重自然光线和温馨氛围，使用天然材料和简洁线条。',
            style: '北欧风格',
            budget: '标准型',
            rating: 4.9,
            popularity: 203,
            price: 158000,
            tags: ['中户型', '北欧风格', '温馨舒适'],
            features: ['自然光线优化', '原木家具', '绿植装饰']
        });
    }
    
    // 大户型 + 工业风 + 豪华型
    if (answers.step1 === 'large' && answers.step2 === 'industrial') {
        recommendations.push({
            id: 3,
            title: '工业风创意空间设计',
            description: '针对大户型的工业风格设计方案，融合复古与现代元素，展现个性和创意。',
            style: '工业风',
            budget: '豪华型',
            rating: 4.7,
            popularity: 89,
            price: 285000,
            tags: ['大户型', '工业风', '个性设计'],
            features: ['裸露材料', '金属元素', '复古装饰']
        });
    }
    
    // 通用推荐
    recommendations.push(
        {
            id: 4,
            title: '智能家居集成方案',
            description: '整合智能家居设备的现代化设计方案，提升居住便利性和舒适度。',
            style: '现代科技',
            budget: '标准型',
            rating: 4.6,
            popularity: 134,
            price: 125000,
            tags: ['智能家居', '现代科技', '便利生活'],
            features: ['智能灯光系统', '安防监控', '语音控制']
        },
        {
            id: 5,
            title: '环保健康家居方案',
            description: '使用环保材料和健康设计理念，打造安全健康的居住环境。',
            style: '自然环保',
            budget: '标准型',
            rating: 4.8,
            popularity: 178,
            price: 142000,
            tags: ['环保材料', '健康生活', '可持续发展'],
            features: ['零甲醛材料', '空气净化', '节水设计']
        },
        {
            id: 6,
            title: '多功能家庭办公方案',
            description: '结合居家办公需求的设计方案，创造高效舒适的工作环境。',
            style: '现代简约',
            budget: '经济型',
            rating: 4.5,
            popularity: 112,
            price: 68000,
            tags: ['居家办公', '多功能空间', '工作效率'],
            features: ['办公区域规划', '隔音设计', '人体工学家具']
        }
    );
    
    recommendationsState.recommendations = recommendations;
    renderRecommendations(recommendations);
}

// 加载推荐方案
function loadRecommendations() {
    // 模拟推荐数据
    const recommendations = [
        {
            id: 1,
            title: '小户型现代简约风整体方案',
            description: '针对小户型的现代简约风格整体设计方案，注重空间利用和功能性。',
            style: '现代简约',
            budget: '经济型',
            rating: 4.8,
            popularity: 156,
            price: 79999,
            tags: ['热销', '小户型'],
            features: ['空间优化', '多功能家具']
        },
        {
            id: 2,
            title: '北欧风格温馨家居方案',
            description: '北欧风格设计方案，注重自然光线和温馨氛围，使用天然材料。',
            style: '北欧风格',
            budget: '标准型',
            rating: 4.9,
            popularity: 203,
            price: 158000,
            tags: ['最受欢迎', '自然风格'],
            features: ['自然光线', '原木家具']
        },
        {
            id: 3,
            title: '工业风创意空间设计',
            description: '工业风格设计方案，融合复古与现代元素，展现个性和创意。',
            style: '工业风',
            budget: '豪华型',
            rating: 4.7,
            popularity: 89,
            price: 285000,
            tags: ['个性设计', '创意空间'],
            features: ['裸露材料', '金属元素']
        },
        {
            id: 4,
            title: '智能家居集成方案',
            description: '整合智能家居设备的现代化设计方案，提升居住便利性。',
            style: '现代科技',
            budget: '标准型',
            rating: 4.6,
            popularity: 134,
            price: 125000,
            tags: ['科技前沿', '智能生活'],
            features: ['智能系统', '语音控制']
        }
    ];
    
    recommendationsState.recommendations = recommendations;
    renderRecommendations(recommendations);
}

// 渲染推荐方案
function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendationsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    recommendations.forEach(rec => {
        const recElement = createRecommendationElement(rec);
        container.appendChild(recElement);
    });
}

// 创建推荐方案元素
function createRecommendationElement(recommendation) {
    const recDiv = document.createElement('div');
    recDiv.className = 'recommendation-card';
    
    // 生成标签HTML
    let tagsHTML = '';
    if (recommendation.tags && recommendation.tags.length > 0) {
        tagsHTML = recommendation.tags.map(tag => 
            `<span class="recommendation-badge">${tag}</span>`
        ).join('');
    }
    
    // 生成星级评分
    const stars = generateStars(recommendation.rating);
    
    recDiv.innerHTML = `
        <div class="recommendation-image">
            ${tagsHTML}
        </div>
        <div class="recommendation-content">
            <h3 class="recommendation-title">${recommendation.title}</h3>
            <p class="recommendation-description">${recommendation.description}</p>
            
            <div class="recommendation-meta">
                <span class="recommendation-style">${recommendation.style}</span>
                <div class="recommendation-rating">
                    ${stars}
                    <span>${recommendation.rating}</span>
                </div>
            </div>
            
            <div class="recommendation-details">
                <div class="recommendation-price">¥${recommendation.price.toLocaleString()}</div>
                <button class="btn-primary" onclick="viewRecommendation(${recommendation.id})">
                    查看详情
                </button>
            </div>
        </div>
    `;
    
    return recDiv;
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

// 筛选推荐
function filterRecommendations(filter) {
    recommendationsState.currentFilter = filter;
    
    // 更新标签状态
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filtered = [...recommendationsState.recommendations];
    
    switch(filter) {
        case 'budget':
            filtered = filtered.filter(rec => rec.budget === '经济型');
            break;
        case 'popular':
            filtered.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'new':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'ai':
            filtered = filtered.filter(rec => rec.tags && rec.tags.includes('AI推荐'));
            break;
    }
    
    renderRecommendations(filtered);
}

// 排序推荐
function sortRecommendations() {
    let sorted = [...recommendationsState.recommendations];
    
    switch(recommendationsState.currentSort) {
        case 'price':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'popularity':
            sorted.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'relevance':
            // 根据测试答案的相关性排序
            break;
    }
    
    renderRecommendations(sorted);
}

// 查看推荐详情
function viewRecommendation(recommendationId) {
    const recommendation = recommendationsState.recommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;
    
    // 创建详情模态框
    const modalHTML = `
        <div class="recommendation-modal">
            <div class="modal-content">
                <button class="close-modal" onclick="closeRecommendationModal()">×</button>
                <div class="modal-body">
                    <h2>${recommendation.title}</h2>
                    <div class="modal-meta">
                        <span class="style">${recommendation.style}</span>
                        <span class="budget">${recommendation.budget}</span>
                        <span class="rating">${generateStars(recommendation.rating)} ${recommendation.rating}</span>
                    </div>
                    
                    <div class="modal-price">¥${recommendation.price.toLocaleString()}</div>
                    
                    <div class="modal-description">
                        <h3>方案描述</h3>
                        <p>${recommendation.description}</p>
                    </div>
                    
                    <div class="modal-features">
                        <h3>主要特点</h3>
                        <ul>
                            ${recommendation.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="applyRecommendation(${recommendationId})">
                            <i class="fas fa-check"></i> 应用此方案
                        </button>
                        <button class="btn-secondary" onclick="saveRecommendation(${recommendationId})">
                            <i class="fas fa-bookmark"></i> 收藏方案
                        </button>
                        <button class="btn-outline" onclick="consultDesigner(${recommendationId})">
                            <i class="fas fa-user-tie"></i> 咨询设计师
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-overlay" onclick="closeRecommendationModal()"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 关闭推荐详情模态框
function closeRecommendationModal() {
    const modal = document.querySelector('.recommendation-modal');
    if (modal) {
        modal.remove();
    }
}

// 应用推荐方案
function applyRecommendation(recommendationId) {
    const recommendation = recommendationsState.recommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;
    
    // 跳转到设计工具页面，并传递推荐方案信息
    localStorage.setItem('appliedRecommendation', JSON.stringify(recommendation));
    window.location.href = 'design-tool.html';
    
    showNotification('方案已应用，正在跳转到设计工具...', 'success');
}

// 保存推荐方案
function saveRecommendation(recommendationId) {
    let savedRecommendations = JSON.parse(localStorage.getItem('savedRecommendations') || '[]');
    
    if (!savedRecommendations.includes(recommendationId)) {
        savedRecommendations.push(recommendationId);
        localStorage.setItem('savedRecommendations', JSON.stringify(savedRecommendations));
        showNotification('方案已收藏', 'success');
    } else {
        showNotification('方案已在收藏中', 'info');
    }
}

// 咨询设计师
function consultDesigner(recommendationId) {
    window.location.href = 'consultation.html';
}

// 设置设计师
function setupDesigners() {
    // 预约咨询按钮
    document.querySelectorAll('.btn-primary[onclick*="bookConsultation"]').forEach(button => {
        button.addEventListener('click', function() {
            const designerName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            openBookingModal(designerName);
        });
    });
}

// 预约咨询
function bookConsultation(designerName) {
    openBookingModal(designerName);
}

// 打开预约模态框
function openBookingModal(designerName) {
    // 这里可以打开预约模态框
    showNotification(`即将预约 ${designerName} 的咨询`, 'info');
}

// 设置AI推荐
function setupAIRecommendation() {
    document.getElementById('aiPrompt').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateAIRecommendation();
        }
    });
}

// 生成AI推荐
function generateAIRecommendation() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    
    if (!prompt) {
        showNotification('请输入您的需求描述', 'warning');
        return;
    }
    
    if (prompt.length < 10) {
        showNotification('请提供更详细的需求描述', 'warning');
        return;
    }
    
    // 模拟AI处理
    showNotification('AI正在分析您的需求...', 'info');
    
    setTimeout(() => {
        const aiResult = generateAIResponse(prompt);
        recommendationsState.aiRecommendation = aiResult;
        
        // 显示结果
        document.getElementById('aiResultText').textContent = aiResult;
        document.getElementById('aiResult').classList.add('active');
        
        // 滚动到结果
        document.getElementById('aiResult').scrollIntoView({ behavior: 'smooth' });
        
        showNotification('AI推荐方案已生成', 'success');
    }, 2000);
}

// 生成AI响应
function generateAIResponse(prompt) {
    // 简单的关键词匹配
    let response = "根据您的需求，我为您生成了以下空间美学方案：\n\n";
    
    if (prompt.includes('小户型') || prompt.includes('小空间')) {
        response += "1. 空间优化方案：\n   - 使用多功能折叠家具\n   - 采用浅色系扩大视觉空间\n   - 墙面收纳系统设计\n   - 镜子装饰增加空间感\n\n";
    }
    
    if (prompt.includes('现代简约') || prompt.includes('简约')) {
        response += "2. 现代简约风格：\n   - 简洁线条的家具\n   - 黑白灰主色调\n   - 隐藏式储物设计\n   - 智能照明系统\n\n";
    }
    
    if (prompt.includes('预算') || prompt.includes('便宜') || prompt.includes('经济')) {
        response += "3. 预算控制建议：\n   - 优先投资基础硬装\n   - 家具分期购买\n   - DIY装饰品\n   - 二手家具改造\n\n";
    }
    
    if (prompt.includes('北欧') || prompt.includes('自然')) {
        response += "4. 北欧自然元素：\n   - 原木材质家具\n   - 大量绿植装饰\n   - 自然采光最大化\n   - 羊毛棉麻纺织品\n\n";
    }
    
    response += "具体实施建议：\n";
    response += "- 先确定整体色彩方案\n";
    response += "- 测量所有空间尺寸\n";
    response += "- 制定详细的采购清单\n";
    response += "- 分阶段实施装修计划\n\n";
    
    response += "如需更详细的方案，建议预约专业设计师进行一对一咨询。";
    
    return response;
}

// 保存AI推荐
function saveAIRecommendation() {
    if (!recommendationsState.aiRecommendation) {
        showNotification('没有可保存的推荐方案', 'warning');
        return;
    }
    
    let savedAIRecommendations = JSON.parse(localStorage.getItem('savedAIRecommendations') || '[]');
    savedAIRecommendations.push({
        id: Date.now(),
        content: recommendationsState.aiRecommendation,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('savedAIRecommendations', JSON.stringify(savedAIRecommendations));
    
    showNotification('AI推荐方案已保存', 'success');
}

// 修改AI推荐要求
function modifyAIRecommendation() {
    document.getElementById('aiPrompt').focus();
    showNotification('请修改您的需求描述', 'info');
}

// 使用模板
function useTemplate(templateType) {
    // 跳转到设计工具页面并加载模板
    localStorage.setItem('loadTemplate', templateType);
    window.location.href = 'design-tool.html';
    
    showNotification(`正在加载 ${templateType} 模板...`, 'success');
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

