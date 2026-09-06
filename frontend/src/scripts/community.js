// 社区支持功能
document.addEventListener('DOMContentLoaded', function() {
    initializeCommunity();
    loadPosts();
    setupEventListeners();
    updateCommunityStats();
    loadActiveUsers();
});

// 社区状态
let communityState = {
    posts: [],
    currentFilter: 'all',
    currentSort: 'newest',
    activeUsers: [],
    userPosts: JSON.parse(localStorage.getItem('userPosts') || '[]')
};

// 初始化社区
function initializeCommunity() {
    // 设置筛选器
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.textContent.trim();
            filterPosts(filter);
        });
    });
    
    // 设置话题标签
    document.querySelectorAll('.topic-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.replace('#', '');
            searchByTag(tagText);
        });
    });
    
    // 设置发布按钮
    document.querySelector('.create-post-btn').addEventListener('click', openPostModal);
    
    // 设置模态框关闭
    document.querySelector('.close-modal').addEventListener('click', closePostModal);
    
    // 设置表单提交
    document.getElementById('postForm').addEventListener('submit', submitPost);
    
    // 设置图片上传预览
    document.getElementById('postImage').addEventListener('change', handleImageUpload);
}

// 加载帖子
function loadPosts() {
    // 模拟数据
    const samplePosts = [
        {
            id: 1,
            author: '王设计师',
            avatar: '王',
            title: '小户型空间优化十大技巧',
            content: '分享一些针对小户型的空间优化技巧：\n\n1. 使用多功能家具\n2. 利用垂直空间\n3. 选择浅色系配色\n4. 巧用镜子扩大视觉空间\n5. 合理规划收纳系统\n\n大家有什么补充的吗？',
            category: 'experience',
            tags: ['装修经验', '小户型', '空间优化'],
            likes: 42,
            comments: 15,
            shares: 8,
            views: 256,
            time: '2小时前',
            liked: false,
            saved: false,
            images: []
        },
        {
            id: 2,
            author: '家居爱好者李',
            avatar: '李',
            title: '求推荐现代简约风格的沙发',
            content: '最近在装修新房，想要选购一款现代简约风格的沙发。预算在5000元左右，希望质量好且舒适。大家有什么品牌或款式推荐吗？最好是亲自使用过的。',
            category: 'question',
            tags: ['家具选择', '现代简约', '求推荐'],
            likes: 28,
            comments: 32,
            shares: 5,
            views: 189,
            time: '5小时前',
            liked: true,
            saved: false,
            images: []
        },
        {
            id: 3,
            author: '张装修工',
            avatar: '张',
            title: '分享一个装修预算控制的小技巧',
            content: '装修超预算是常见问题，分享一个实用技巧：\n\n将总预算分成几个部分：\n- 硬装：50%\n- 家具：30%\n- 软装：15%\n- 备用金：5%\n\n每个部分单独控制，避免超支。',
            category: 'experience',
            tags: ['预算控制', '装修经验', '省钱技巧'],
            likes: 56,
            comments: 23,
            shares: 12,
            views: 342,
            time: '1天前',
            liked: false,
            saved: true,
            images: []
        },
        {
            id: 4,
            author: '陈空间规划师',
            avatar: '陈',
            title: '北欧风格客厅设计案例分享',
            content: '最近完成的一个北欧风格客厅设计项目，客户要求温馨舒适且实用。\n\n主要设计要点：\n- 白色和原木色为主色调\n- 大窗户保证充足自然光\n- 功能性收纳设计\n- 绿植点缀增加生机\n\n分享几张效果图给大家参考。',
            category: 'showcase',
            tags: ['北欧风格', '设计案例', '客厅设计'],
            likes: 89,
            comments: 41,
            shares: 25,
            views: 567,
            time: '2天前',
            liked: true,
            saved: true,
            images: [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-4.0.3&auto=format&fit=crop&w-600&q=80'
            ]
        }
    ];
    
    // 合并用户发布的帖子
    communityState.posts = [...samplePosts, ...communityState.userPosts];
    renderPosts(communityState.posts);
}

// 渲染帖子
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 根据当前排序排序
    let sortedPosts = [...posts];
    switch(communityState.currentSort) {
        case 'hot':
            sortedPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
            break;
        case 'newest':
            sortedPosts.sort((a, b) => b.id - a.id);
            break;
        case 'answered':
            // 假设有已回答状态的帖子
            break;
        case 'unanswered':
            // 假设有未回答状态的帖子
            break;
    }
    
    sortedPosts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

// 创建帖子元素
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    postDiv.setAttribute('data-id', post.id);
    
    // 生成标签HTML
    let tagsHTML = '';
    if (post.tags && post.tags.length > 0) {
        tagsHTML = `
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
            </div>
        `;
    }
    
    // 生成图片HTML
    let imagesHTML = '';
    if (post.images && post.images.length > 0) {
        imagesHTML = `
            <div class="post-image" style="background-image: url('${post.images[0]}')"></div>
        `;
    }
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="author-avatar">${post.avatar}</div>
                <div class="author-info">
                    <h4>${post.author}</h4>
                    <span class="post-time">${post.time}</span>
                </div>
            </div>
            ${tagsHTML}
        </div>
        
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <div class="post-text">${post.content.replace(/\n/g, '<br>')}</div>
            ${imagesHTML}
        </div>
        
        <div class="post-footer">
            <div class="post-actions">
                <button class="post-action ${post.liked ? 'active' : ''}" onclick="toggleLike(${post.id})">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${post.likes}</span>
                </button>
                <button class="post-action" onclick="toggleComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments}</span>
                </button>
                <button class="post-action ${post.saved ? 'active' : ''}" onclick="toggleSave(${post.id})">
                    <i class="fas fa-bookmark"></i>
                    <span>收藏</span>
                </button>
                <button class="post-action" onclick="sharePost(${post.id})">
                    <i class="fas fa-share"></i>
                    <span>分享</span>
                </button>
            </div>
            <div class="post-comments">
                <span>${post.views} 次浏览</span>
            </div>
        </div>
        
        <div class="comments-section" id="comments-${post.id}">
            <div class="comment-form">
                <textarea class="comment-input" placeholder="写下你的评论..."></textarea>
                <button class="btn-primary" onclick="submitComment(${post.id})">发表评论</button>
            </div>
            <div class="comments-list" id="comments-list-${post.id}">
                <!-- 评论动态加载 -->
            </div>
        </div>
    `;
    
    return postDiv;
}

// 筛选帖子
function filterPosts(filter) {
    communityState.currentFilter = filter;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filteredPosts = [...communityState.posts];
    
    switch(filter) {
        case '热门':
            filteredPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
            break;
        case '最新':
            filteredPosts.sort((a, b) => b.id - a.id);
            break;
        case '已解决':
            // 筛选已解决的帖子
            break;
        case '待解决':
            // 筛选待解决的帖子
            break;
    }
    
    renderPosts(filteredPosts);
}

// 按标签搜索
function searchByTag(tag) {
    const filteredPosts = communityState.posts.filter(post => 
        post.tags && post.tags.includes(tag)
    );
    
    renderPosts(filteredPosts);
    
    // 显示搜索提示
    showNotification(`正在显示包含"#${tag}"的帖子`, 'info');
}

// 切换点赞
function toggleLike(postId) {
    const post = communityState.posts.find(p => p.id === postId);
    if (!post) return;
    
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    
    // 更新显示
    const likeBtn = document.querySelector(`[data-id="${postId}"] .post-action .fa-thumbs-up`).parentElement;
    likeBtn.classList.toggle('active');
    likeBtn.querySelector('span').textContent = post.likes;
    
    // 保存状态
    saveCommunityState();
}

// 切换收藏
function toggleSave(postId) {
    const post = communityState.posts.find(p => p.id === postId);
    if (!post) return;
    
    post.saved = !post.saved;
    
    // 更新显示
    const saveBtn = document.querySelector(`[data-id="${postId}"] .post-action .fa-bookmark`).parentElement;
    saveBtn.classList.toggle('active');
    
    // 保存到用户收藏
    let savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    if (post.saved) {
        if (!savedPosts.includes(postId)) {
            savedPosts.push(postId);
        }
    } else {
        const index = savedPosts.indexOf(postId);
        if (index > -1) {
            savedPosts.splice(index, 1);
        }
    }
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
    
    showNotification(post.saved ? '已收藏' : '已取消收藏', 'success');
}

// 切换评论显示
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.classList.toggle('active');
    
    // 如果展开，加载评论
    if (commentsSection.classList.contains('active')) {
        loadComments(postId);
    }
}

// 加载评论
function loadComments(postId) {
    // 模拟评论数据
    const comments = [
        {
            id: 1,
            author: '热心网友',
            content: '很实用的技巧，谢谢分享！',
            time: '1小时前'
        },
        {
            id: 2,
            author: '装修小白',
            content: '请问具体实施的时候需要注意什么？',
            time: '30分钟前'
        }
    ];
    
    const container = document.getElementById(`comments-list-${postId}`);
    container.innerHTML = '';
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-card';
        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">
                    <div class="author-avatar">${comment.author.charAt(0)}</div>
                    <div>
                        <h4>${comment.author}</h4>
                        <span class="comment-time">${comment.time}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
        `;
        container.appendChild(commentElement);
    });
}

// 提交评论
function submitComment(postId) {
    const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
    const content = commentInput.value.trim();
    
    if (!content) {
        showNotification('请输入评论内容', 'warning');
        return;
    }
    
    const post = communityState.posts.find(p => p.id === postId);
    if (post) {
        post.comments++;
        
        // 更新评论数显示
        const commentBtn = document.querySelector(`[data-id="${postId}"] .post-action .fa-comment`).parentElement;
        commentBtn.querySelector('span').textContent = post.comments;
        
        // 添加新评论
        const newComment = {
            id: Date.now(),
            author: '当前用户',
            content: content,
            time: '刚刚'
        };
        
        const container = document.getElementById(`comments-list-${postId}`);
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-card';
        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">
                    <div class="author-avatar">当</div>
                    <div>
                        <h4>${newComment.author}</h4>
                        <span class="comment-time">${newComment.time}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content">
                ${newComment.content}
            </div>
        `;
        container.prepend(commentElement);
        
        // 清空输入框
        commentInput.value = '';
        
        showNotification('评论已发布', 'success');
    }
}

// 分享帖子
function sharePost(postId) {
    const post = communityState.posts.find(p => p.id === postId);
    if (!post) return;
    
    // 复制链接到剪贴板
    const shareUrl = `${window.location.origin}/community.html?post=${postId}`;
    navigator.clipboard.writeText(shareUrl)
        .then(() => {
            showNotification('链接已复制到剪贴板', 'success');
        })
        .catch(() => {
            showNotification('复制失败，请手动复制', 'warning');
        });
}

// 打开发布模态框
function openPostModal() {
    document.getElementById('createPostModal').classList.add('active');
}

// 关闭发布模态框
function closePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

// 处理图片上传
function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showNotification('请选择图片文件', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.createElement('div');
            imgElement.className = 'screenshot-item';
            imgElement.innerHTML = `
                <img src="${e.target.result}" alt="预览">
                <button class="remove-screenshot" onclick="this.parentElement.remove()">×</button>
            `;
            preview.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    });
}

// 提交帖子
function submitPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const tagsInput = document.getElementById('postTags').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!title || !category || !content) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }
    
    // 处理标签
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // 获取图片
    const images = [];
    document.querySelectorAll('#imagePreview img').forEach(img => {
        images.push(img.src);
    });
    
    // 创建新帖子
    const newPost = {
        id: Date.now(),
        author: '当前用户',
        avatar: '当',
        title: title,
        content: content,
        category: category,
        tags: tags,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        time: '刚刚',
        liked: false,
        saved: false,
        images: images
    };
    
    // 添加到社区状态
    communityState.posts.unshift(newPost);
    communityState.userPosts.unshift(newPost);
    
    // 保存到本地存储
    localStorage.setItem('userPosts', JSON.stringify(communityState.userPosts));
    
    // 重新渲染帖子
    renderPosts(communityState.posts);
    
    // 关闭模态框
    closePostModal();
    
    // 显示成功消息
    showNotification('帖子发布成功！', 'success');
    
    // 更新统计
    updateCommunityStats();
}

// 更新社区统计
function updateCommunityStats() {
    document.getElementById('totalPosts').textContent = communityState.posts.length;
    // 其他统计可以在这里更新
}

// 加载活跃用户
function loadActiveUsers() {
    // 模拟活跃用户数据
    const activeUsers = [
        { name: '王设计师', posts: 42 },
        { name: '家居爱好者李', posts: 38 },
        { name: '张装修工', posts: 35 },
        { name: '陈空间规划师', posts: 29 }
    ];
    
    communityState.activeUsers = activeUsers;
}

// 保存社区状态
function saveCommunityState() {
    // 可以保存用户互动状态
    const userInteractions = {
        likedPosts: communityState.posts.filter(p => p.liked).map(p => p.id),
        savedPosts: communityState.posts.filter(p => p.saved).map(p => p.id)
    };
    
    localStorage.setItem('communityInteractions', JSON.stringify(userInteractions));
}

// 设置事件监听器
function setupEventListeners() {
    // 点击模态框外部关闭
    document.getElementById('createPostModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePostModal();
        }
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // ESC键关闭模态框
        if (e.key === 'Escape' && document.getElementById('createPostModal').classList.contains('active')) {
            closePostModal();
        }
    });
}

