// 购物商城页面脚本
const shoppingProducts = [
    { id: 1, name: '现代简约布艺沙发', category: 'sofa', style: 'modern', price: 3999, originalPrice: 4999, rating: 4.5, sales: 128, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85', tags: ['热销', '新品'], description: '柔软耐用的布艺沙发，适合现代客厅。' },
    { id: 2, name: '北欧实木餐桌椅组合', category: 'table', style: 'nordic', price: 2599, originalPrice: 2999, rating: 4.8, sales: 89, image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=85', tags: ['热销', '包邮'], description: '天然实木餐桌搭配舒适餐椅，温润耐看。' },
    { id: 3, name: '人体工学办公椅', category: 'seating', style: 'modern', price: 1599, originalPrice: 1999, rating: 4.7, sales: 156, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85', tags: ['热销', '新品'], description: '可调节人体工学设计，久坐也能保持舒适。' },
    { id: 4, name: '现代简约双人床', category: 'bed', style: 'modern', price: 2899, originalPrice: 3299, rating: 4.6, sales: 67, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85', tags: ['新品'], description: '简洁线条与稳固结构，营造安静卧室氛围。' },
    { id: 5, name: '工业风铁艺书架', category: 'storage', style: 'industrial', price: 899, originalPrice: 1199, rating: 4.3, sales: 42, image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=85', tags: ['限时折扣'], description: '金属与木板结合，兼顾收纳与展示功能。' },
    { id: 6, name: '北欧创意吊灯', category: 'lighting', style: 'nordic', price: 499, originalPrice: 699, rating: 4.9, sales: 203, image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=800&q=85', tags: ['热销', '包邮'], description: '柔和光线与轻盈造型，为空间增添层次。' }
    ,{ id: 7, name: '现代简约落地地毯', category: 'decor', style: 'modern', price: 299, originalPrice: 399, rating: 4.4, sales: 78, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=800&q=85', tags: ['包邮'], description: '低饱和色彩地毯，提升客厅空间质感。' }
    ,{ id: 8, name: '原木收纳边柜', category: 'storage', style: 'nordic', price: 1299, originalPrice: 1599, rating: 4.6, sales: 61, image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=85', tags: ['新品'], description: '自然原木材质，兼具收纳与展示功能。' }
];

const defaultCartItems = [
    { id: 1, name: shoppingProducts[0].name, price: shoppingProducts[0].price, quantity: 1, image: shoppingProducts[0].image },
    { id: 3, name: shoppingProducts[2].name, price: shoppingProducts[2].price, quantity: 1, image: shoppingProducts[2].image }
];

let cartItems = loadStoredCart();
let shoppingPageInitialized = false;

function loadStoredCart() {
    try {
        const stored = JSON.parse(localStorage.getItem('shoppingCart') || 'null');
        return Array.isArray(stored) && stored.length ? stored : defaultCartItems.map(item => ({ ...item }));
    } catch (error) {
        return defaultCartItems.map(item => ({ ...item }));
    }
}

function persistCart() { localStorage.setItem('shoppingCart', JSON.stringify(cartItems)); }

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

function loadProducts(products = shoppingProducts) {
    const container = document.getElementById('productsContainer');
    const countElement = document.getElementById('productCount');
    if (!container) return;
    const list = Array.isArray(products) ? products : shoppingProducts;
    if (countElement) countElement.textContent = list.length;
    if (!list.length) {
        container.innerHTML = '<div class="products-empty"><div><p>暂无匹配的商品</p><small>请调整分类、价格或风格筛选条件。</small></div></div>';
        return;
    }
    container.innerHTML = list.map(product => `
        <article class="product-card">
            ${(product.tags || []).map(tag => `<span class="product-badge">${tag}</span>`).join('')}
            <div class="product-image" style="background-image:url('${product.image}')"><div class="product-overlay"><button type="button" class="quick-view-btn" onclick="quickView(${product.id})">快速查看</button></div></div>
            <div class="product-details"><div class="product-category">${getCategoryName(product.category)}</div><h3 class="product-name">${product.name}</h3>
                <div class="product-price"><span class="current-price">￥${product.price.toLocaleString()}</span><span class="original-price">￥${product.originalPrice.toLocaleString()}</span></div>
                <div class="product-rating">${generateStars(product.rating)} <span>(${product.rating})</span><span class="product-sales">已售 ${product.sales}</span></div>
                <div class="product-actions"><button type="button" class="cart-btn" onclick="addToCart(${product.id})">加入购物车</button><button type="button" class="fav-btn" aria-label="收藏商品" onclick="addToFavorites(${product.id})">收藏</button></div>
            </div>
        </article>`).join('');
}

function getCategoryName(category) { return { sofa: '沙发座椅', table: '餐桌椅', bed: '床具', storage: '储物柜', lighting: '灯具', decor: '装饰品', seating: '座椅' }[category] || category; }

function generateStars(rating) {
    const full = Math.floor(rating); const half = rating % 1 >= 0.5; let result = `<span class="stars" aria-label="评分 ${rating}">`;
    const star = ' <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.5l6.2-.9L12 3Z"/></svg>';
    const outline = ' <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.5l6.2-.9L12 3Z" fill="none" stroke="currentColor"/></svg>';
    result += star.repeat(full); if (half) result += outline; result += outline.repeat(5 - full - (half ? 1 : 0));
    return result + '</span>';
}

function setupFilters() {
    ['categoryFilter', 'priceFilter', 'styleFilter', 'sortBy'].forEach(id => document.getElementById(id)?.addEventListener('change', applyFilters));
    document.querySelectorAll('.filter-tag').forEach(tag => tag.addEventListener('click', () => { tag.classList.toggle('active'); applyFilters(); }));
}

function applyFilters() {
    const category = document.getElementById('categoryFilter')?.value || 'all'; const price = document.getElementById('priceFilter')?.value || 'all'; const style = document.getElementById('styleFilter')?.value || 'all'; const sortBy = document.getElementById('sortBy')?.value || 'default';
    const tags = [...document.querySelectorAll('.filter-tag.active')].map(tag => tag.textContent.trim());
    let filtered = shoppingProducts.filter(product => {
        if (category !== 'all' && product.category !== category) return false; if (style !== 'all' && product.style !== style) return false;
        if (price !== 'all') { const [min, max] = price === '5000+' ? [5000, Infinity] : price.split('-').map(Number); if (product.price < min || product.price > max) return false; }
        return !tags.length || tags.some(tag => product.tags.includes(tag));
    });
    const sorters = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, sales: (a, b) => b.sales - a.sales, rating: (a, b) => b.rating - a.rating, newest: (a, b) => b.id - a.id };
    if (sorters[sortBy]) filtered.sort(sorters[sortBy]);
    loadProducts(filtered);
}

function setupSearch() { document.getElementById('searchInput')?.addEventListener('input', event => filterBySearch(event.target.value)); }
function applyQuerySearch() { const query = new URLSearchParams(window.location.search).get('search'); if (query) { const input = document.getElementById('searchInput'); if (input) input.value = query; filterBySearch(query); } }
function filterBySearch(query) { const term = String(query || '').toLowerCase().trim(); if (!term) return applyFilters(); loadProducts(shoppingProducts.filter(product => `${product.name} ${product.description} ${getCategoryName(product.category)}`.toLowerCase().includes(term))); }

function setupCart() { updateCartCount(); updateCartItems(); }
function toggleCart() { document.querySelector('.cart-sidebar')?.classList.toggle('active'); document.querySelector('.cart-overlay')?.classList.toggle('active'); }
function updateCartCount() { const count = cartItems.reduce((total, item) => total + item.quantity, 0); document.querySelectorAll('.cart-count').forEach(element => { element.textContent = count; }); }

function updateCartItems() {
    const container = document.querySelector('.cart-items'); if (!container) return;
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    container.innerHTML = cartItems.length ? cartItems.map((item, index) => `<div class="cart-item"><div class="cart-item-image" style="background-image:url('${item.image}')"></div><div class="cart-item-details"><h4>${item.name}</h4><div class="cart-item-price">￥${item.price.toLocaleString()} × ${item.quantity}</div><div class="cart-item-actions"><button type="button" class="quantity-btn" onclick="updateQuantity(${index},-1)" aria-label="减少">−</button><span>${item.quantity}</span><button type="button" class="quantity-btn" onclick="updateQuantity(${index},1)" aria-label="增加">+</button><button type="button" class="remove-btn" onclick="removeFromCart(${index})" aria-label="移除商品">移除</button></div></div></div>`).join('') : '<div class="empty-cart"><p>购物车是空的</p></div>';
    document.querySelector('.subtotal')?.replaceChildren(document.createTextNode(`￥${subtotal.toLocaleString()}`)); document.querySelector('.total-price')?.replaceChildren(document.createTextNode(`￥${subtotal.toLocaleString()}`));
}

function updateQuantity(index, change) { if (!cartItems[index]) return; cartItems[index].quantity += change; if (cartItems[index].quantity <= 0) cartItems.splice(index, 1); persistCart(); updateCartCount(); updateCartItems(); }
function removeFromCart(index) { cartItems.splice(index, 1); persistCart(); updateCartCount(); updateCartItems(); }

function addToCart(productId) {
    if (typeof window.requireAuthentication === 'function' && !window.requireAuthentication()) return;
    const product = shoppingProducts.find(item => item.id === productId); if (!product) return;
    const existing = cartItems.find(item => item.id === productId); if (existing) existing.quantity += 1; else cartItems.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image });
    persistCart(); updateCartCount(); updateCartItems(); showShoppingNotice(`${product.name} 已加入购物车`);
}

function addToFavorites(productId) {
    if (typeof window.requireAuthentication === 'function' && !window.requireAuthentication()) return;
    const product = shoppingProducts.find(item => item.id === productId); if (!product) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); if (favorites.some(item => item.id === productId)) return showShoppingNotice('商品已经在收藏夹中');
    favorites.push({ id: product.id, name: product.name, price: product.price, image: product.image }); localStorage.setItem('favorites', JSON.stringify(favorites)); showShoppingNotice(`${product.name} 已加入收藏`);
}

function quickView(productId) {
    const product = shoppingProducts.find(item => item.id === productId); if (!product) return; document.querySelector('.quick-view-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<div class="quick-view-modal"><div class="modal-content"><button type="button" class="close-modal" onclick="closeQuickView()" aria-label="关闭"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><div class="modal-body"><div class="modal-image" style="background-image:url('${product.image}')"></div><div class="modal-details"><h2>${product.name}</h2><div class="modal-price"><span class="current">￥${product.price.toLocaleString()}</span><span class="original">￥${product.originalPrice.toLocaleString()}</span></div><div class="modal-rating">${generateStars(product.rating)} ${product.rating} 分</div><p>${product.description}</p><div class="modal-actions"><button type="button" class="btn-primary" onclick="addToCart(${product.id});closeQuickView();">加入购物车</button><button type="button" class="btn-secondary" onclick="closeQuickView()">关闭</button></div></div></div></div><div class="modal-overlay" onclick="closeQuickView()"></div></div>`);
}

function closeQuickView() { document.querySelector('.quick-view-modal')?.remove(); }
function showShoppingNotice(message) { if (typeof window.showNotification === 'function') return window.showNotification(message, 'success'); const notice = document.createElement('div'); notice.className = 'shopping-notice show'; notice.textContent = message; document.body.appendChild(notice); setTimeout(() => notice.remove(), 2600); }
Object.assign(window, { shoppingProducts, toggleCart, updateQuantity, removeFromCart, addToCart, addToFavorites, quickView, closeQuickView });
