// 璐墿椤靛姛鑳?const shoppingProducts = [
    {
        id: 1,
        name: '鐜颁唬绠€绾﹀竷鑹烘矙鍙?,
        category: 'sofa',
        style: 'modern',
        price: 3999,
        originalPrice: 4999,
        rating: 4.5,
        sales: 128,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['鐑攢', '鏂板搧', '闄愭椂鎶樻墸'],
        description: '鑸掗€傚竷鑹烘矙鍙戯紝鐜颁唬绠€绾﹁璁?
    },
    {
        id: 2,
        name: '瀹炴湪椁愭妞呯粍鍚?,
        category: 'table',
        style: 'nordic',
        price: 2599,
        originalPrice: 2999,
        rating: 4.8,
        sales: 89,
        image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['鐑攢', '鍖呴偖'],
        description: '鍖楁椋庢牸瀹炴湪椁愭妞?
    },
    {
        id: 3,
        name: '鏅鸿兘浜轰綋宸ュ妞?,
        category: 'seating',
        style: 'modern',
        price: 1599,
        originalPrice: 1999,
        rating: 4.7,
        sales: 156,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['鐑攢', '鏂板搧'],
        description: '鍙皟鑺備汉浣撳伐瀛﹀姙鍏'
    },
    {
        id: 4,
        name: '鐜颁唬绠€绾﹀弻浜哄簥',
        category: 'bed',
        style: 'modern',
        price: 2899,
        originalPrice: 3299,
        rating: 4.6,
        sales: 67,
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['鏂板搧'],
        description: '绠€绾﹂鏍煎疄鏈ㄥ弻浜哄簥'
    },
    {
        id: 5,
        name: '宸ヤ笟椋庨搧鑹轰功鏋?,
        category: 'storage',
        style: 'industrial',
        price: 899,
        originalPrice: 1199,
        rating: 4.3,
        sales: 42,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['闄愭椂鎶樻墸'],
        description: '宸ヤ笟椋庢牸閾佽壓涔︽灦'
    },
    {
        id: 6,
        name: '鍖楁鍒涙剰鍚婄伅',
        category: 'lighting',
        style: 'nordic',
        price: 499,
        originalPrice: 699,
        rating: 4.9,
        sales: 203,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['鐑攢', '鍖呴偖'],
        description: '鍖楁椋庢牸鍒涙剰璁捐鍚婄伅'
    },
    {
        id: 7,
        name: '浼犵粺涓紡鑼舵',
        category: 'table',
        style: 'traditional',
        price: 1899,
        originalPrice: 2299,
        rating: 4.4,
        sales: 31,
        image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: [],
        description: '浼犵粺涓紡瀹炴湪鑼舵'
    },
    {
        id: 8,
        name: '鐜颁唬绠€绾﹀湴姣?,
        category: 'decor',
        style: 'modern',
        price: 299,
        originalPrice: 399,
        rating: 4.2,
        sales: 78,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['鍖呴偖'],
        description: '鐜颁唬绠€绾﹂鏍煎鍘呭湴姣?
    }
];

let cartItems = [
    {
        id: 1,
        name: '鐜颁唬绠€绾﹀竷鑹烘矙鍙?,
        price: 3999,
        quantity: 1,
        image: shoppingProducts[0].image
    },
    {
        id: 3,
        name: '鏅鸿兘浜轰綋宸ュ妞?,
        price: 1599,
        quantity: 2,
        image: shoppingProducts[2].image
    }
];

let shoppingPageInitialized = false;

document.addEventListener('DOMContentLoaded', setupShoppingPage);

function setupShoppingPage() {
    if (shoppingPageInitialized || !document.getElementById('productsContainer')) return;
    shoppingPageInitialized = true;
    loadProducts();
    setupFilters();
    setupCart();
    setupSearch();
    applyQuerySearch();
}

function loadProducts(filteredProducts = shoppingProducts) {
    const container = document.getElementById('productsContainer');
    const countElement = document.getElementById('productCount');
    if (!container) return;

    const list = Array.isArray(filteredProducts) ? filteredProducts : shoppingProducts;
    if (countElement) countElement.textContent = list.length;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="products-empty">
                <div>
                    <i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px;"></i>
                    <p>鏆傛湭鎵惧埌鍖归厤鐨勫晢鍝?/p>
                    <small>鍙互璋冩暣鍒嗙被銆佷环鏍兼垨椋庢牸绛涢€夋潯浠?/small>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(product => {
        const badges = (product.tags || [])
            .map(tag => `<span class="product-badge">${tag}</span>`)
            .join('');

        return `
            <article class="product-card">
                ${badges}
                <div class="product-image" style="background-image: url('${product.image}')">
                    <div class="product-overlay">
                        <button type="button" class="quick-view-btn" onclick="quickView(${product.id})">蹇€熸煡鐪?/button>
                    </div>
                </div>
                <div class="product-details">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">楼${product.price.toLocaleString()}</span>
                        ${product.originalPrice > product.price
                            ? `<span class="original-price">楼${product.originalPrice.toLocaleString()}</span>`
                            : ''}
                    </div>
                    <div class="product-rating">
                        ${generateStars(product.rating)}
                        <span>(${product.rating})</span>
                        <span style="margin-left: auto; color: var(--gray-color); font-size: 14px;">宸插敭 ${product.sales}</span>
                    </div>
                    <div class="product-actions">
                        <button type="button" class="cart-btn" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> 鍔犲叆璐墿杞?                        </button>
                        <button type="button" class="fav-btn" aria-label="鏀惰棌鍟嗗搧" onclick="addToFavorites(${product.id})">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function getCategoryName(category) {
    const categories = {
        sofa: '娌欏彂搴ф',
        table: '椁愭妞?,
        bed: '搴婂叿',
        storage: '鍌ㄧ墿鏌?,
        lighting: '鐏叿',
        decor: '瑁呴グ鍝?,
        seating: '搴ф'
    };
    return categories[category] || category;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));
    let html = '';

    for (let i = 0; i < fullStars; i += 1) {
        html += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i += 1) {
        html += '<i class="far fa-star"></i>';
    }

    return html;
}

function setupFilters() {
    ['categoryFilter', 'priceFilter', 'styleFilter', 'sortBy'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });

    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            applyFilters();
        });
    });
}

function applyFilters() {
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const price = document.getElementById('priceFilter')?.value || 'all';
    const style = document.getElementById('styleFilter')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'default';
    const activeTags = Array.from(document.querySelectorAll('.filter-tag.active'))
        .map(tag => tag.textContent.trim());

    let filtered = shoppingProducts.filter(product => {
        if (category !== 'all' && product.category !== category) return false;
        if (style !== 'all' && product.style !== style) return false;

        if (price !== 'all') {
            const [min, max] = price === '5000+'
                ? [5000, Infinity]
                : price.split('-').map(Number);
            if (product.price < min || product.price > max) return false;
        }

        if (activeTags.length > 0 && !activeTags.some(tag => product.tags.includes(tag))) {
            return false;
        }

        return true;
    });

    filtered = filtered.sort((a, b) => {
        switch (sortBy) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'sales': return b.sales - a.sales;
            case 'rating': return b.rating - a.rating;
            case 'newest': return b.id - a.id;
            default: return 0;
        }
    });

    loadProducts(filtered);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterBySearch(this.value), 180);
    });
}

function applyQuerySearch() {
    const query = new URLSearchParams(window.location.search).get('search');
    if (!query) return;

    const input = document.getElementById('searchInput');
    if (input) input.value = query;
    filterBySearch(query);
}

function filterBySearch(query) {
    const term = String(query || '').toLowerCase().trim();
    if (!term) {
        applyFilters();
        return;
    }

    const filtered = shoppingProducts.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        getCategoryName(product.category).includes(term)
    );

    loadProducts(filtered);
}

function setupCart() {
    updateCartCount();
    updateCartItems();
}

function toggleCart() {
    document.querySelector('.cart-sidebar')?.classList.toggle('active');
    document.querySelector('.cart-overlay')?.classList.toggle('active');
}

function updateCartCount() {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = count;
    });
}

function updateCartItems() {
    const container = document.querySelector('.cart-items');
    const subtotalElement = document.querySelector('.subtotal');
    const totalElement = document.querySelector('.total-price');
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: var(--gray-color); margin-bottom: 20px;"></i>
                <p>璐墿杞︽槸绌虹殑</p>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = '楼0';
        if (totalElement) totalElement.textContent = '楼0';
        return;
    }

    let subtotal = 0;
    container.innerHTML = cartItems.map((item, index) => {
        subtotal += item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">楼${item.price.toLocaleString()} 脳 ${item.quantity}</div>
                    <div class="cart-item-actions">
                        <button type="button" class="quantity-btn" onclick="updateQuantity(${index}, -1)">鈭?/button>
                        <span>${item.quantity}</span>
                        <button type="button" class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        <button type="button" class="remove-btn" onclick="removeFromCart(${index})" aria-label="绉婚櫎鍟嗗搧">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (subtotalElement) subtotalElement.textContent = `楼${subtotal.toLocaleString()}`;
    if (totalElement) totalElement.textContent = `楼${subtotal.toLocaleString()}`;
}

function updateQuantity(index, change) {
    if (!cartItems[index]) return;
    cartItems[index].quantity += change;
    if (cartItems[index].quantity <= 0) cartItems.splice(index, 1);
    updateCartCount();
    updateCartItems();
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartCount();
    updateCartItems();
}

function addToCart(productId) {
    const product = shoppingProducts.find(item => item.id === productId);
    if (!product) return;

    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }

    updateCartCount();
    updateCartItems();
    showShoppingNotice(`${product.name} 宸叉坊鍔犲埌璐墿杞);
}

function addToFavorites(productId) {
    const product = shoppingProducts.find(item => item.id === productId);
    if (!product) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.some(item => item.id === productId)) {
        showShoppingNotice('鍟嗗搧宸茬粡鍦ㄦ敹钘忓す涓?);
        return;
    }

    favorites.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showShoppingNotice(`${product.name} 宸叉坊鍔犲埌鏀惰棌`);
}

function quickView(productId) {
    const product = shoppingProducts.find(item => item.id === productId);
    if (!product) return;

    document.querySelector('.quick-view-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', `
        <div class="quick-view-modal">
            <div class="modal-content">
                <button type="button" class="close-modal" onclick="closeQuickView()">脳</button>
                <div class="modal-body">
                    <div class="modal-image" style="background-image: url('${product.image}')"></div>
                    <div class="modal-details">
                        <h2>${product.name}</h2>
                        <div class="modal-price">
                            <span class="current">楼${product.price.toLocaleString()}</span>
                            <span class="original">楼${product.originalPrice.toLocaleString()}</span>
                        </div>
                        <div class="modal-rating">${generateStars(product.rating)} <span>${product.rating} 鍒?/span></div>
                        <div class="modal-description">
                            <h3>鍟嗗搧鎻忚堪</h3>
                            <p>${product.description}</p>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-primary" onclick="addToCart(${product.id}); closeQuickView();">鍔犲叆璐墿杞?/button>
                            <button type="button" class="btn-secondary" onclick="closeQuickView()">鍏抽棴</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-overlay" onclick="closeQuickView()"></div>
        </div>
    `);
}

function closeQuickView() {
    document.querySelector('.quick-view-modal')?.remove();
}

function showShoppingNotice(message) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, 'success');
        return;
    }

    const notice = document.createElement('div');
    notice.className = 'shopping-notice';
    notice.textContent = message;
    document.body.appendChild(notice);
    requestAnimationFrame(() => notice.classList.add('show'));
    setTimeout(() => notice.remove(), 2600);
}

