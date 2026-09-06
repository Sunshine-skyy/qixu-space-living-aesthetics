const API_BASE_URL = 'http://localhost:3000/api/v1';
let shoppingProducts = [];
let cartItems = [];
let shoppingPageInitialized = false;

document.addEventListener('DOMContentLoaded', setupShoppingPage);

function setupShoppingPage() {
    if (shoppingPageInitialized || !document.getElementById('productsContainer')) return;
    shoppingPageInitialized = true;
    loadProducts();
    setupFilters();
    setupSearch();
    setupCart();
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
    if (price && price !== 'all') {
        const [min, max] = price === '5000+' ? ['5000', ''] : price.split('-');
        if (min) params.set('minPrice', min);
        if (max) params.set('maxPrice', max);
    }
    const sortMap = { 'price-asc': 'price_asc', 'price-desc': 'price_desc', sales: 'sales_desc', rating: 'rating_desc', newest: 'newest' };
    if (sortMap[sort]) params.set('sort', sortMap[sort]);
    container.innerHTML = '<div class="products-empty"><p>正在加载商品...</p></div>';
    try {
        const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || '商品加载失败');
        shoppingProducts = result.data.items || [];
        const count = document.getElementById('productCount');
        if (count) count.textContent = result.data.pagination?.total ?? shoppingProducts.length;
        renderProducts();
    } catch (error) {
        shoppingProducts = [];
        const count = document.getElementById('productCount');
        if (count) count.textContent = '0';
        container.innerHTML = `<div class="products-empty"><p>${escapeHtml(error.message || '商品加载失败')}</p></div>`;
    }
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    if (!shoppingProducts.length) {
        container.innerHTML = '<div class="products-empty"><p>暂无符合条件的商品</p></div>';
        return;
    }
    container.innerHTML = shoppingProducts.map(product => {
        const rating = Number(product.rating) || 0;
        return `<article class="product-card"><div class="product-image" style="background-image:url('${escapeAttribute(product.image)}')"></div><div class="product-details"><div class="product-category">${escapeHtml(product.category)}</div><h3 class="product-name">${escapeHtml(product.name)}</h3><div class="product-price"><span class="current-price">￥${Number(product.price).toLocaleString()}</span></div><div class="product-rating">${generateStars(rating)} <span>(${rating.toFixed(1)})</span><span style="margin-left:auto">已售 ${Number(product.sales) || 0}</span></div><div class="product-actions"><button type="button" class="cart-btn" onclick="addToCart(${Number(product.id)})">加入购物车</button><button type="button" class="fav-btn" onclick="addToFavorites(${Number(product.id)})" aria-label="收藏商品">♡</button></div></div></article>`;
    }).join('');
}

function generateStars(rating) {
    const filled = Math.min(5, Math.max(0, Math.round(rating)));
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

async function quickView(productId) {
    let product = shoppingProducts.find(item => item.id === productId);
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const result = await response.json();
        if (response.ok && result.success) product = result.data;
    } catch { /* Use the list item when the detail request is unavailable. */ }
    if (!product) return;
    const details = product.description || '暂无商品描述';
    showShoppingNotice(`${product.name}: ${details}`);
}

function setupFilters() {
    ['categoryFilter', 'priceFilter', 'styleFilter', 'sortBy'].forEach(id => document.getElementById(id)?.addEventListener('change', loadProducts));
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(loadProducts, 300); });
}

function applyFilters() { loadProducts(); }
function filterBySearch() { loadProducts(); }
function setupCart() { updateCartCount(); updateCartItems(); }
function toggleCart() { document.querySelector('.cart-sidebar')?.classList.toggle('active'); document.querySelector('.cart-overlay')?.classList.toggle('active'); }
function updateCartCount() { const count = cartItems.reduce((total, item) => total + item.quantity, 0); document.querySelectorAll('.cart-count').forEach(element => { element.textContent = count; }); }
function updateCartItems() {
    const container = document.querySelector('.cart-items');
    if (!container) return;
    const subtotal = cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
    container.innerHTML = cartItems.length ? cartItems.map((item, index) => `<div class="cart-item"><div class="cart-item-image" style="background-image:url('${escapeAttribute(item.image)}')"></div><div class="cart-item-details"><h4>${escapeHtml(item.name)}</h4><div class="cart-item-price">￥${Number(item.price).toLocaleString()} × ${item.quantity}</div><div class="cart-item-actions"><button type="button" class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button><span>${item.quantity}</span><button type="button" class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button><button type="button" class="remove-btn" onclick="removeFromCart(${index})">删除</button></div></div></div>`).join('') : '<div class="empty-cart"><p>购物车是空的</p></div>';
    document.querySelector('.subtotal')?.replaceChildren(`￥${subtotal.toLocaleString()}`);
    document.querySelector('.total-price')?.replaceChildren(`￥${subtotal.toLocaleString()}`);
}
function updateQuantity(index, change) { if (!cartItems[index]) return; cartItems[index].quantity += change; if (cartItems[index].quantity <= 0) cartItems.splice(index, 1); updateCartCount(); updateCartItems(); }
function removeFromCart(index) { cartItems.splice(index, 1); updateCartCount(); updateCartItems(); }
function addToCart(productId) { const product = shoppingProducts.find(item => item.id === productId); if (!product) return; const item = cartItems.find(entry => entry.id === productId); if (item) item.quantity += 1; else cartItems.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }); updateCartCount(); updateCartItems(); showShoppingNotice(`${product.name} 已加入购物车`); }
function addToFavorites(productId) { const product = shoppingProducts.find(item => item.id === productId); if (!product) return; const favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favorites.some(item => item.id === productId)) { favorites.push({ id: product.id, name: product.name, price: product.price, image: product.image }); localStorage.setItem('favorites', JSON.stringify(favorites)); } showShoppingNotice(`${product.name} 已加入收藏`); }
function showShoppingNotice(message) { if (typeof window.showNotification === 'function') window.showNotification(message, 'success'); else alert(message); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function escapeAttribute(value) { return String(value ?? '').replace(/[\\'"\r\n]/g, char => ({ '\\': '\\\\', "'": "\\'", '"': '%22', '\r': '', '\n': '' }[char])); }
