// 购物商城：优先使用后端商品接口，接口不可用时使用前端演示数据。
const API_BASE_URL = 'http://localhost:3000/api/v1';
const fallbackProducts = [
    { id: 1, name: '现代简约布艺沙发', category: 'sofa', style: 'modern', price: 3999, originalPrice: 4999, rating: 4.5, sales: 128, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85', tags: ['热销', '新品'], description: '柔软耐用的布艺沙发，适合现代客厅。' },
    { id: 2, name: '北欧实木餐桌椅组合', category: 'table', style: 'nordic', price: 2599, originalPrice: 2999, rating: 4.8, sales: 89, image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=85', tags: ['热销', '包邮'], description: '天然实木餐桌搭配舒适餐椅，温润耐看。' },
    { id: 3, name: '人体工学办公椅', category: 'seating', style: 'modern', price: 1599, originalPrice: 1999, rating: 4.7, sales: 156, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85', tags: ['热销', '新品'], description: '可调节人体工学设计，久坐也能保持舒适。' },
    { id: 4, name: '现代简约双人床', category: 'bed', style: 'modern', price: 2899, originalPrice: 3299, rating: 4.6, sales: 67, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85', tags: ['新品'], description: '简洁线条与稳固结构，营造安静卧室氛围。' },
    { id: 5, name: '工业风铁艺书架', category: 'storage', style: 'industrial', price: 899, originalPrice: 1199, rating: 4.3, sales: 42, image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=85', tags: ['限时折扣'], description: '金属与木板结合，兼顾收纳与展示功能。' },
    { id: 6, name: '北欧创意吊灯', category: 'lighting', style: 'nordic', price: 499, originalPrice: 699, rating: 4.9, sales: 203, image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=800&q=85', tags: ['热销', '包邮'], description: '柔和光线与轻盈造型，为空间增添层次。' },
    { id: 7, name: '现代简约落地地毯', category: 'decor', style: 'modern', price: 299, originalPrice: 399, rating: 4.4, sales: 78, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=800&q=85', tags: ['包邮'], description: '低饱和色彩地毯，提升客厅空间质感。' },
    { id: 8, name: '原木收纳边柜', category: 'storage', style: 'nordic', price: 1299, originalPrice: 1599, rating: 4.6, sales: 61, image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=85', tags: ['新品'], description: '自然原木材质，兼具收纳与展示功能。' }
];

let shoppingProducts = fallbackProducts.map(item => ({ ...item }));
const defaultCartItems = [
    { id: 1, name: fallbackProducts[0].name, price: fallbackProducts[0].price, quantity: 1, image: fallbackProducts[0].image },
    { id: 3, name: fallbackProducts[2].name, price: fallbackProducts[2].price, quantity: 1, image: fallbackProducts[2].image }
];
let cartItems = loadStoredCart();
let shoppingPageInitialized = false;

function loadStoredCart() {
    try {
        const stored = JSON.parse(localStorage.getItem('shoppingCart') || 'null');
        return Array.isArray(stored) && stored.length ? stored : defaultCartItems.map(item => ({ ...item }));
    } catch { return defaultCartItems.map(item => ({ ...item })); }
}
function persistCart() { localStorage.setItem('shoppingCart', JSON.stringify(cartItems)); }

document.addEventListener('DOMContentLoaded', setupShoppingPage);
function setupShoppingPage() {
    if (shoppingPageInitialized || !document.getElementById('productsContainer')) return;
    shoppingPageInitialized = true;
    setupFilters(); setupSearch(); setupCart();
    loadProducts();
}

async function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    const params = new URLSearchParams({ page: '1', pageSize: '100' });
    const category = document.getElementById('categoryFilter')?.value;
    const style = document.getElementById('styleFilter')?.value;
    const price = document.getElementById('priceFilter')?.value;
    const search = document.getElementById('searchInput')?.value?.trim();
    const sort = document.getElementById('sortBy')?.value;
    if (category && category !== 'all') params.set('category', category);
    if (style && style !== 'all') params.set('style', style);
    if (search) params.set('search', search);
    if (price && price !== 'all') { const [min, max] = price === '5000+' ? ['5000', ''] : price.split('-'); params.set('minPrice', min); if (max) params.set('maxPrice', max); }
    const sortMap = { 'price-asc': 'price_asc', 'price-desc': 'price_desc', sales: 'sales_desc', rating: 'rating_desc', newest: 'newest' };
    if (sortMap[sort]) params.set('sort', sortMap[sort]);
    try {
        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('商品接口不可用');
        shoppingProducts = Array.isArray(result.data?.items) && result.data.items.length ? result.data.items : fallbackProducts;
    } catch { shoppingProducts = fallbackProducts; }
    const count = document.getElementById('productCount'); if (count) count.textContent = shoppingProducts.length;
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('productsContainer'); if (!container) return;
    container.innerHTML = shoppingProducts.map(product => `<article class="product-card">${(product.tags || []).map(tag => `<span class="product-badge">${escapeHtml(tag)}</span>`).join('')}<div class="product-image" style="background-image:url('${escapeAttribute(product.image)}')"><div class="product-overlay"><button type="button" class="quick-view-btn" onclick="quickView(${Number(product.id)})">快速查看</button></div></div><div class="product-details"><div class="product-category">${escapeHtml(getCategoryName(product.category))}</div><h3 class="product-name">${escapeHtml(product.name)}</h3><div class="product-price"><span class="current-price">￥${Number(product.price).toLocaleString()}</span><span class="original-price">￥${Number(product.originalPrice || product.price).toLocaleString()}</span></div><div class="product-rating">${generateStars(Number(product.rating) || 0)} <span>(${Number(product.rating || 0).toFixed(1)})</span><span class="product-sales">已售 ${Number(product.sales) || 0}</span></div><div class="product-actions"><button type="button" class="cart-btn" onclick="addToCart(${Number(product.id)})">加入购物车</button><button type="button" class="fav-btn" onclick="addToFavorites(${Number(product.id)})" aria-label="收藏商品">收藏</button></div></div></article>`).join('');
}

function getCategoryName(category) { return { sofa: '沙发座椅', table: '餐桌椅', bed: '床具', storage: '储物柜', lighting: '灯具', decor: '装饰品', seating: '座椅' }[category] || category; }
function generateStars(rating) { const filled = Math.min(5, Math.max(0, Math.round(rating))); const path = 'm12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.5l6.2-.9L12 3Z'; return Array.from({ length: 5 }, (_, i) => `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" ${i < filled ? '' : 'fill="none" stroke="currentColor"'}/></svg>`).join(''); }
function setupFilters() { ['categoryFilter', 'priceFilter', 'styleFilter', 'sortBy'].forEach(id => document.getElementById(id)?.addEventListener('change', loadProducts)); document.querySelectorAll('.filter-tag').forEach(tag => tag.addEventListener('click', () => { tag.classList.toggle('active'); loadProducts(); })); }
function setupSearch() { document.getElementById('searchInput')?.addEventListener('input', () => loadProducts()); }
function applyFilters() { loadProducts(); }
function filterBySearch() { loadProducts(); }

function setupCart() { updateCartCount(); updateCartItems(); }
function toggleCart() { document.querySelector('.cart-sidebar')?.classList.toggle('active'); document.querySelector('.cart-overlay')?.classList.toggle('active'); }
function updateCartCount() { const count = cartItems.reduce((total, item) => total + item.quantity, 0); document.querySelectorAll('.cart-count').forEach(element => { element.textContent = count; }); }
function updateCartItems() { const container = document.querySelector('.cart-items'); if (!container) return; const subtotal = cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0); container.innerHTML = cartItems.length ? cartItems.map((item, index) => `<div class="cart-item"><div class="cart-item-image" style="background-image:url('${escapeAttribute(item.image)}')"></div><div class="cart-item-details"><h4>${escapeHtml(item.name)}</h4><div class="cart-item-price">￥${Number(item.price).toLocaleString()} × ${item.quantity}</div><div class="cart-item-actions"><button type="button" class="quantity-btn" onclick="updateQuantity(${index},-1)" aria-label="减少">−</button><span>${item.quantity}</span><button type="button" class="quantity-btn" onclick="updateQuantity(${index},1)" aria-label="增加">+</button><button type="button" class="remove-btn" onclick="removeFromCart(${index})" aria-label="移除商品">移除</button></div></div></div>`).join('') : '<div class="empty-cart"><p>购物车是空的</p></div>'; document.querySelector('.subtotal')?.replaceChildren(document.createTextNode(`￥${subtotal.toLocaleString()}`)); document.querySelector('.total-price')?.replaceChildren(document.createTextNode(`￥${subtotal.toLocaleString()}`)); }
function updateQuantity(index, change) { if (!cartItems[index]) return; cartItems[index].quantity += change; if (cartItems[index].quantity <= 0) cartItems.splice(index, 1); persistCart(); updateCartCount(); updateCartItems(); }
function removeFromCart(index) { cartItems.splice(index, 1); persistCart(); updateCartCount(); updateCartItems(); }
function addToCart(productId) { if (typeof window.requireAuthentication === 'function' && !window.requireAuthentication()) return; const product = shoppingProducts.find(item => Number(item.id) === Number(productId)); if (!product) return; const existing = cartItems.find(item => Number(item.id) === Number(productId)); if (existing) existing.quantity += 1; else cartItems.push({ id: product.id, name: product.name, price: Number(product.price), quantity: 1, image: product.image }); persistCart(); updateCartCount(); updateCartItems(); showShoppingNotice(`${product.name} 已加入购物车`); }
function addToFavorites(productId) { if (typeof window.requireAuthentication === 'function' && !window.requireAuthentication()) return; const product = shoppingProducts.find(item => Number(item.id) === Number(productId)); if (!product) return; const favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favorites.some(item => Number(item.id) === Number(productId))) { favorites.push({ id: product.id, name: product.name, price: product.price, image: product.image }); localStorage.setItem('favorites', JSON.stringify(favorites)); } showShoppingNotice(`${product.name} 已加入收藏`); }
async function quickView(productId) { const product = shoppingProducts.find(item => Number(item.id) === Number(productId)); if (product) showShoppingNotice(`${product.name}：${product.description || '暂无商品描述'}`); }
function showShoppingNotice(message) { if (typeof window.showNotification === 'function') window.showNotification(message, 'success'); else alert(message); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function escapeAttribute(value) { return String(value ?? '').replace(/[\\'"\r\n]/g, char => ({ '\\': '\\\\', "'": "\\'", '"': '%22', '\r': '', '\n': '' }[char])); }
Object.assign(window, { shoppingProducts, toggleCart, updateQuantity, removeFromCart, addToCart, addToFavorites, quickView, applyFilters, filterBySearch });
