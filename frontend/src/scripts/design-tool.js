import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const DEFAULT_ROOM = { width: 960, depth: 420, height: 620 };
const roomState = { ...DEFAULT_ROOM };
const TEMPLATES = {
    'living-room': [
        { furnitureId: 1, x: 250, y: 490 }, { furnitureId: 3, x: 470, y: 505 },
        { furnitureId: 7, x: 720, y: 470 }, { furnitureId: 11, x: 500, y: 180 }
    ],
    bedroom: [
        { furnitureId: 9, x: 330, y: 500 }, { furnitureId: 10, x: 530, y: 500 },
        { furnitureId: 12, x: 700, y: 470 }, { furnitureId: 11, x: 500, y: 170 }
    ],
    kitchen: [
        { furnitureId: 4, x: 300, y: 500 }, { furnitureId: 5, x: 600, y: 500 },
        { furnitureId: 11, x: 500, y: 180 }
    ],
    office: [
        { furnitureId: 6, x: 360, y: 500 }, { furnitureId: 5, x: 650, y: 500 },
        { furnitureId: 8, x: 760, y: 180 }, { furnitureId: 11, x: 500, y: 180 }
    ]
};

const FURNITURE = [
    { id: 1, name: '双人沙发', category: 'seating', shape: 'sofa', anchor: 'floor', width: 220, height: 120, depth: 90, color: '#8fa0a8', price: 3999, icon: 'fas fa-couch' },
    { id: 2, name: '单人椅', category: 'seating', shape: 'chair', anchor: 'floor', width: 90, height: 120, depth: 80, color: '#c9d1c8', price: 1999, icon: 'fas fa-chair' },
    { id: 3, name: '茶几', category: 'tables', shape: 'table', anchor: 'floor', width: 140, height: 76, depth: 70, color: '#6f7d85', price: 899, icon: 'fas fa-coffee' },
    { id: 4, name: '餐桌', category: 'tables', shape: 'table', anchor: 'floor', width: 190, height: 82, depth: 92, color: '#8fa0a8', price: 1599, icon: 'fas fa-utensils' },
    { id: 5, name: '书柜', category: 'storage', shape: 'cabinet', anchor: 'floor', width: 130, height: 210, depth: 42, color: '#68757a', price: 1299, icon: 'fas fa-book' },
    { id: 6, name: '衣柜', category: 'storage', shape: 'cabinet', anchor: 'floor', width: 160, height: 220, depth: 56, color: '#c9d1c8', price: 1999, icon: 'fas fa-tshirt' },
    { id: 7, name: '落地灯', category: 'lighting', shape: 'lamp', anchor: 'floor', width: 70, height: 180, depth: 40, color: '#9aa8b1', price: 399, icon: 'fas fa-lightbulb' },
    { id: 8, name: '台灯', category: 'lighting', shape: 'lamp', anchor: 'floor', width: 64, height: 92, depth: 36, color: '#d8dfe6', price: 199, icon: 'fas fa-lightbulb' },
    { id: 9, name: '双人床', category: 'bed', shape: 'bed', anchor: 'floor', width: 240, height: 150, depth: 140, color: '#8fa0a8', price: 2899, icon: 'fas fa-bed' },
    { id: 10, name: '床头柜', category: 'bed', shape: 'cabinet', anchor: 'floor', width: 60, height: 70, depth: 45, color: '#c9d1c8', price: 299, icon: 'fas fa-square' },
    { id: 11, name: '落地窗', category: 'structure', shape: 'window', anchor: 'wall', width: 200, height: 130, depth: 16, color: '#d8dfe6', price: 0, icon: 'fas fa-clone' },
    { id: 12, name: '室内门', category: 'structure', shape: 'door', anchor: 'wall', width: 95, height: 210, depth: 16, color: '#c9d1c8', price: 0, icon: 'fas fa-door-open' }
];

const designState = {
    currentTool: 'select', selectedElement: null, elements: [], undoStack: [], redoStack: [],
    currentRoom: 'living-room', currentTheme: 'mist', furnitureItems: FURNITURE, sceneReady: false
};

let initialized = false;
let scene;
let camera;
let previewCamera;
let renderer;
let previewRenderer;
let orbitControls;
let previewControls;
let transformControls;
let roomGroup;
let furnitureGroup;
let gridHelper;
let selectionHelper;
let animationFrame;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const THEME = {
    mist: { floor: 0xe5ebe8, wall: 0xf7f9f6 }, light: { floor: 0xf2f4f2, wall: 0xffffff },
    dark: { floor: 0x263238, wall: 0x39474d }, warm: { floor: 0xe8e2d8, wall: 0xf7f2ea },
    cool: { floor: 0xd8dfe6, wall: 0xf2f4f2 }
};

document.addEventListener('DOMContentLoaded', setupDesignTool);
window.initializeDesignTool = setupDesignTool;

function setupDesignTool() {
    if (initialized || !document.getElementById('designCanvas')) return;
    initialized = true;
    injectStyles(); setupScene(); setupFurnitureLibrary(); setupToolbar(); setupPropertiesPanel();
    setupRoomTemplates(); setupCategoryTabs(); setupColorThemes(); setupKeyboardShortcuts();
    loadRequestedTemplate(); renderShoppingList(); updateElementCount(); startRenderLoop();
}

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .room-outline { position:relative !important; overflow:hidden !important; height:680px !important; background:#e9efec !important; }
        .design-layout { height:760px !important; min-height:760px !important; align-items:stretch !important; }
        .design-sidebar, .design-canvas-container, .properties-panel { height:760px !important; min-height:0 !important; box-sizing:border-box; }
        .design-canvas-container { display:flex !important; flex-direction:column !important; }
        .design-canvas { min-height:0 !important; flex:1 1 auto !important; display:flex !important; align-items:stretch !important; background:#e9efec !important; overflow:hidden !important; }
        .room-outline { width:100% !important; height:100% !important; min-height:0 !important; flex:1 1 auto !important; margin:0 !important; border-radius:0 !important; }
        .three-scene-canvas, .preview-three-canvas { display:block; width:100%; height:100%; touch-action:none; }
        .preview-container { min-height:250px !important; padding:0 !important; overflow:hidden; }
        .design-preview { width:100% !important; height:280px !important; min-height:280px !important; position:relative; overflow:hidden; cursor:grab; }
        .design-preview:active { cursor:grabbing; }
        .preview-orbit-hint { position:absolute; left:50%; bottom:10px; transform:translateX(-50%); z-index:2; padding:4px 9px; border-radius:999px; background:rgba(251,252,250,.82); color:#68757a; font-size:10px; white-space:nowrap; pointer-events:none; }
        .room-settings-actions { display:flex; gap:8px; }
        .room-settings-actions button { flex:1; padding:8px 6px; font-size:12px; }
        .webgl-fallback { position:absolute; inset:0; display:grid; place-items:center; padding:30px; text-align:center; color:#68757a; background:#e9efec; }
    `;
    document.head.appendChild(style);
}

function setupScene() {
    const outline = document.querySelector('.room-outline');
    const preview = document.getElementById('designPreview');
    if (!outline || !preview) return;
    outline.innerHTML = '<canvas class="three-scene-canvas" aria-label="3D空间画布"></canvas>';
    preview.innerHTML = '<canvas class="preview-three-canvas" aria-label="空间预览"></canvas><div class="preview-orbit-hint">拖动预览旋转视角</div>';
    scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9efec);
    roomGroup = new THREE.Group(); furnitureGroup = new THREE.Group(); scene.add(roomGroup, furnitureGroup);
    camera = new THREE.PerspectiveCamera(42, 1, 1, 10000); previewCamera = new THREE.PerspectiveCamera(42, 1, 1, 10000);
    renderer = makeRenderer(outline.querySelector('canvas')); previewRenderer = makeRenderer(preview.querySelector('canvas'));
    orbitControls = new OrbitControls(camera, renderer.domElement); previewControls = new OrbitControls(previewCamera, previewRenderer.domElement);
    configureControls(orbitControls); configureControls(previewControls);
    transformControls = new TransformControls(camera, renderer.domElement); transformControls.setSize(0.8);
    transformControls.addEventListener('dragging-changed', event => { orbitControls.enabled = !event.value; });
    transformControls.addEventListener('change', syncSelectedFromMesh); scene.add(transformControls.getHelper());
    renderer.domElement.addEventListener('pointerdown', handleScenePointerDown);
    window.addEventListener('resize', resizeRenderers); resizeRenderers(); rebuildRoom(); designState.sceneReady = true;
}

function makeRenderer(canvas) {
    try {
        const target = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        target.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); target.shadowMap.enabled = true; return target;
    } catch (error) {
        canvas.parentElement.innerHTML = '<div class="webgl-fallback">当前浏览器不支持 WebGL，无法显示 3D 场景。</div>'; throw error;
    }
}

function configureControls(controls) {
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 300; controls.maxDistance = 3500;
    controls.target.set(0, roomState.height * 0.25, 0);
}

function rebuildRoom() {
    if (!roomGroup) return;
    roomGroup.clear(); const palette = THEME[designState.currentTheme] || THEME.mist;
    const floor = new THREE.Mesh(new THREE.BoxGeometry(roomState.width, 10, roomState.depth), new THREE.MeshStandardMaterial({ color: palette.floor, roughness: .88 }));
    floor.position.y = -5; floor.receiveShadow = true; roomGroup.add(floor);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: .92, side: THREE.DoubleSide });
    const thickness = 12;
    const back = new THREE.Mesh(new THREE.BoxGeometry(roomState.width, roomState.height, thickness), wallMaterial);
    back.position.set(0, roomState.height / 2, -roomState.depth / 2);
    const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, roomState.height, roomState.depth), wallMaterial);
    left.position.set(-roomState.width / 2, roomState.height / 2, 0); const right = left.clone(); right.position.x = roomState.width / 2;
    [back, left, right].forEach(wall => { wall.receiveShadow = true; roomGroup.add(wall); });
    gridHelper = new THREE.GridHelper(Math.max(roomState.width, roomState.depth), Math.max(10, Math.round(Math.max(roomState.width, roomState.depth) / 40)), 0x68757a, 0xb0bbb7);
    gridHelper.scale.z = roomState.depth / Math.max(roomState.width, roomState.depth); gridHelper.position.y = .6; roomGroup.add(gridHelper);
    const ambient = new THREE.HemisphereLight(0xf8fbf8, 0x708087, 2.2); roomGroup.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(roomState.width * .3, roomState.height * 1.7, roomState.depth * 1.2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); roomGroup.add(key);
    updateCameraFraming(); syncFurnitureMeshes();
}

function updateCameraFraming() {
    const distance = Math.max(roomState.width, roomState.depth, roomState.height) * 1.45;
    camera.position.set(distance * .78, distance * .68, distance); previewCamera.position.copy(camera.position);
    orbitControls?.target.set(0, roomState.height * .25, 0); previewControls?.target.set(0, roomState.height * .25, 0);
    camera.lookAt(0, roomState.height * .25, 0); previewCamera.lookAt(0, roomState.height * .25, 0);
}

function startRenderLoop() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    const render = () => { orbitControls?.update(); previewControls?.update(); renderer?.render(scene, camera); previewRenderer?.render(scene, previewCamera); animationFrame = requestAnimationFrame(render); };
    render();
}

function resizeRenderers() {
    if (!renderer || !previewRenderer) return;
    resizeRenderer(renderer, camera, renderer.domElement.parentElement); resizeRenderer(previewRenderer, previewCamera, previewRenderer.domElement.parentElement);
}

function resizeRenderer(target, targetCamera, container) {
    const width = Math.max(container.clientWidth, 1); const height = Math.max(container.clientHeight, 1);
    target.setSize(width, height, false); targetCamera.aspect = width / height; targetCamera.updateProjectionMatrix();
}

function setupFurnitureLibrary() { renderFurnitureItems('all'); }

function renderFurnitureItems(category) {
    const container = document.querySelector('.furniture-items'); if (!container) return; container.innerHTML = '';
    const items = category === 'all' ? FURNITURE : FURNITURE.filter(item => item.category === category);
    items.forEach(item => { const node = document.createElement('div'); node.className = 'furniture-item'; node.dataset.id = item.id; node.innerHTML = `<div class="furniture-icon"><i class="${item.icon}"></i></div><span>${item.name}</span>`; node.addEventListener('click', () => addFurnitureElement(item.id)); container.appendChild(node); });
}

function setupCategoryTabs() { document.querySelectorAll('.category-tab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.category-tab').forEach(item => item.classList.remove('active')); tab.classList.add('active'); renderFurnitureItems(tab.dataset.category); })); }
function setupRoomTemplates() { document.querySelectorAll('.room-template').forEach(template => template.addEventListener('click', () => loadRoomTemplate(template.dataset.template))); }
function setupColorThemes() { document.querySelectorAll('.color-theme').forEach(theme => theme.addEventListener('click', () => { designState.currentTheme = theme.dataset.theme; document.querySelectorAll('.color-theme').forEach(item => item.classList.remove('active')); theme.classList.add('active'); rebuildRoom(); })); }

function setupToolbar() {
    const actions = { selectTool: () => setCurrentTool('select'), moveTool: () => setCurrentTool('move'), rotateTool: () => setCurrentTool('rotate'), deleteTool: deleteSelectedElement, gridToggle: toggleGrid, clearAllBtn: clearAllElements, undoBtn: undo, redoBtn: redo, saveBtn: saveDesign, exportBtn: () => alert('导出功能将在下一步接入'), renderBtn: resizeRenderers, applyRoomBtn: applyRoomSettings, resetRoomBtn: resetRoomSettings };
    Object.entries(actions).forEach(([id, handler]) => document.getElementById(id)?.addEventListener('click', handler)); setCurrentTool('select');
}

function setupPropertiesPanel() {
    const bind = (id, callback, event = 'change') => document.getElementById(id)?.addEventListener(event, callback);
    bind('elementName', event => updateSelected({ name: event.target.value }), 'input'); bind('widthInput', event => updateSelected({ width: numberOr(event.target.value, 10) })); bind('heightInput', event => updateSelected({ height: numberOr(event.target.value, 10) })); bind('colorPicker', event => updateSelected({ color: event.target.value }), 'input'); bind('rotationSlider', event => updateSelected({ rotation: numberOr(event.target.value, 0) }), 'input');
}
function setupKeyboardShortcuts() { document.addEventListener('keydown', event => { if (event.key === 'Delete') deleteSelectedElement(); if (event.key === 'Escape') selectElement(null); }); }

function handleScenePointerDown(event) {
    if (transformControls?.dragging || event.button !== 0) return;
    const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(furnitureGroup.children, true).find(item => item.object.userData.elementId); selectElement(hit ? hit.object.userData.elementId : null);
}

function setCurrentTool(tool) {
    designState.currentTool = tool; document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`${tool}Tool`)?.classList.add('active');
    const label = { select: '选择工具', move: '移动工具', rotate: '旋转工具', delete: '删除工具' }[tool] || tool; const status = document.getElementById('currentTool'); if (status) status.textContent = label;
    if (transformControls) {
        transformControls.setMode(tool === 'rotate' ? 'rotate' : 'translate');
        transformControls.showX = tool !== 'rotate'; transformControls.showY = true; transformControls.showZ = tool !== 'rotate';
    }
    attachSelectedTransform();
}
function toggleGrid() { if (!gridHelper) return; gridHelper.visible = !gridHelper.visible; document.getElementById('gridToggle')?.classList.toggle('active', gridHelper.visible); }

function applyRoomSettings() {
    const width = numberOr(document.getElementById('roomWidthInput')?.value, roomState.width); const depth = numberOr(document.getElementById('roomDepthInput')?.value, roomState.depth); const height = numberOr(document.getElementById('roomHeightInput')?.value, roomState.height);
    if (width < 200 || depth < 200 || height < 200) return alert('空间尺寸不能小于 200 厘米'); saveState(); roomState.width = Math.min(width, 3000); roomState.depth = Math.min(depth, 3000); roomState.height = Math.min(height, 5000); clampAllFurniture(); rebuildRoom(); syncRoomInputs();
}
function resetRoomSettings() { saveState(); Object.assign(roomState, DEFAULT_ROOM); clampAllFurniture(); rebuildRoom(); syncRoomInputs(); }
function syncRoomInputs() { document.getElementById('roomWidthInput').value = roomState.width; document.getElementById('roomDepthInput').value = roomState.depth; document.getElementById('roomHeightInput').value = roomState.height; }

function loadRequestedTemplate() {
    const params = new URLSearchParams(window.location.search); const map = { modern: 'living-room', nordic: 'bedroom', industrial: 'office', 'modern-living': 'living-room', 'nordic-bedroom': 'bedroom', 'industrial-office': 'office' }; const requested = localStorage.getItem('loadTemplate') || params.get('style'); if (requested) localStorage.removeItem('loadTemplate'); loadRoomTemplate(map[requested] || requested || 'living-room');
}

function loadRoomTemplate(templateType) {
    const template = TEMPLATES[templateType] || TEMPLATES['living-room']; designState.currentRoom = TEMPLATES[templateType] ? templateType : 'living-room'; designState.elements = []; designState.undoStack = []; designState.redoStack = []; designState.selectedElement = null;
    document.querySelectorAll('.room-template').forEach(item => item.classList.toggle('active', item.dataset.template === designState.currentRoom)); template.forEach(item => addFurnitureElement(item.furnitureId, item, true)); syncFurnitureMeshes(); renderShoppingList(); updateElementCount();
}

function addFurnitureElement(furnitureId, templatePosition = null, fromTemplate = false) {
    const furniture = FURNITURE.find(item => item.id === furnitureId); if (!furniture) return; if (!fromTemplate) saveState();
    const x = templatePosition ? templatePosition.x - DEFAULT_ROOM.width / 2 : 0; const z = templatePosition ? (templatePosition.y - DEFAULT_ROOM.height / 2) * DEFAULT_ROOM.depth / DEFAULT_ROOM.height : 0;
    const element = { id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`, furnitureId, name: furniture.name, shape: furniture.shape, category: furniture.category, anchor: furniture.anchor, color: furniture.color, x, z: furniture.anchor === 'wall' ? 0 : z, y: furniture.anchor === 'wall' ? roomState.height * .55 : 0, width: furniture.width, height: furniture.height, depth: furniture.depth, rotation: 0, price: furniture.price };
    clampElement(element); designState.elements.forEach(item => { item.selected = false; }); element.selected = true; designState.elements.push(element); designState.selectedElement = element; syncFurnitureMeshes(); updatePropertiesPanel(element); renderShoppingList(); updateElementCount();
}

function createFurnitureMesh(element) {
    const material = new THREE.MeshStandardMaterial({ color: element.color, roughness: .72, metalness: .03 }); const group = new THREE.Group(); group.userData.elementId = element.id;
    const box = (w, h, d, x, y, z, color = null) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), color ? material.clone() : material); if (color) mesh.material.color.set(color); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.elementId = element.id; group.add(mesh); return mesh; };
    const { width: w, height: h, depth: d } = element;
    if (element.shape === 'sofa') { box(w * .74, h * .3, d * .72, 0, h * .2, d * .03); box(w * .72, h * .4, d * .2, 0, h * .62, -d * .27); box(w * .12, h * .48, d * .7, -w * .42, h * .3, 0); box(w * .12, h * .48, d * .7, w * .42, h * .3, 0); }
    else if (element.shape === 'bed') { box(w * .92, h * .24, d * .9, 0, h * .12, 0); box(w * .94, h * .65, d * .12, 0, h * .45, -d * .42, '#68757a'); box(w * .82, h * .18, d * .7, 0, h * .38, d * .03, '#f2f4f2'); }
    else if (element.shape === 'table') { box(w * .92, h * .16, d * .92, 0, h * .84, 0); [-.38, .38].forEach(x => [-.34, .34].forEach(z => box(Math.max(8, w * .08), h * .78, Math.max(8, d * .08), w * x, h * .39, d * z))); }
    else if (element.shape === 'chair') { box(w * .7, h * .16, d * .7, 0, h * .48, 0); box(w * .7, h * .45, d * .12, 0, h * .72, -d * .28); [-.26, .26].forEach(x => [-.24, .24].forEach(z => box(8, h * .45, 8, w * x, h * .22, d * z))); }
    else if (element.shape === 'cabinet') { box(w * .9, h * .9, d * .9, 0, h * .5, 0, '#68757a'); [0.28, 0.5, 0.72].forEach(y => box(w * .72, 4, d * .04, 0, h * y, d * .47, '#e8eee9')); }
    else if (element.shape === 'lamp') { const base = new THREE.Mesh(new THREE.CylinderGeometry(w * .34, w * .42, h * .06, 24), material); base.position.y = h * .03; base.castShadow = true; base.userData.elementId = element.id; group.add(base); const stem = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(3, w * .06), Math.max(4, w * .08), h * .68, 16), material); stem.position.y = h * .39; stem.castShadow = true; stem.userData.elementId = element.id; group.add(stem); const shade = new THREE.Mesh(new THREE.CylinderGeometry(w * .4, w * .25, h * .24, 24), material); shade.position.y = h * .82; shade.castShadow = true; shade.userData.elementId = element.id; group.add(shade); }
    else box(w, h, d, 0, h / 2, 0);
    // Floor furniture parts are authored from y=0 (their bottom), so the group itself stays on the floor.
    // Wall elements use y as their center coordinate.
    if (element.anchor === 'wall') group.position.set(element.x, element.y, -roomState.depth / 2 + d / 2 + 4); else group.position.set(element.x, 0, element.z);
    const highlight = new THREE.Mesh(
        new THREE.BoxGeometry(w + 14, h + 14, d + 14),
        new THREE.MeshBasicMaterial({ color: 0xff7e5f, wireframe: true, transparent: true, opacity: 0.95 })
    );
    highlight.name = '__selectionHelper';
    highlight.position.y = h / 2;
    highlight.visible = !!element.selected;
    highlight.userData.elementId = element.id;
    group.add(highlight);
    group.rotation.y = THREE.MathUtils.degToRad(element.rotation || 0);
    return group;
}

function syncFurnitureMeshes() { if (!furnitureGroup) return; transformControls?.detach(); furnitureGroup.clear(); designState.elements.forEach(element => furnitureGroup.add(createFurnitureMesh(element))); attachSelectedTransform(); }
function attachSelectedTransform() {
    const mesh = designState.selectedElement && furnitureGroup?.children.find(item => item.userData.elementId === designState.selectedElement.id);
    // Selection is intentionally read-only. Transform controls are enabled by Move/Rotate tools only.
    if (!mesh || !transformControls || designState.currentTool === 'select') { transformControls?.detach(); return; }
    transformControls.attach(mesh); transformControls.setMode(designState.currentTool === 'rotate' ? 'rotate' : 'translate');
}
function syncSelectedFromMesh() { if (!designState.selectedElement || !transformControls?.object) return; const element = designState.selectedElement; const mesh = transformControls.object; if (element.anchor === 'wall') { element.x = mesh.position.x; element.y = mesh.position.y; } else { element.x = mesh.position.x; element.z = mesh.position.z; } element.rotation = THREE.MathUtils.radToDeg(mesh.rotation.y); clampElement(element); if (element.anchor === 'wall') mesh.position.set(element.x, element.y, -roomState.depth / 2 + element.depth / 2 + 4); else mesh.position.set(element.x, 0, element.z); updatePropertiesPanel(element); }

function selectElement(id) {
    designState.elements.forEach(item => { item.selected = item.id === id; });
    designState.selectedElement = designState.elements.find(item => item.id === id) || null;
    furnitureGroup?.children.forEach(group => {
        const helper = group.getObjectByName('__selectionHelper');
        if (helper) helper.visible = group.userData.elementId === id;
    });
    if (designState.selectedElement) updatePropertiesPanel(designState.selectedElement); else clearPropertiesPanel();
    attachSelectedTransform();
}
function updateSelected(values) { const element = designState.selectedElement; if (!element) return; saveState(); Object.assign(element, values); clampElement(element); syncFurnitureMeshes(); updatePropertiesPanel(element); renderShoppingList(); }
function clampElement(element) { if (element.anchor === 'wall') { element.x = clamp(element.x, -roomState.width / 2 + element.width / 2, roomState.width / 2 - element.width / 2); element.y = clamp(element.y, element.height / 2, roomState.height - element.height / 2); element.z = 0; } else { element.x = clamp(element.x, -roomState.width / 2 + element.width / 2, roomState.width / 2 - element.width / 2); element.z = clamp(element.z, -roomState.depth / 2 + element.depth / 2, roomState.depth / 2 - element.depth / 2); } }
function clampAllFurniture() { designState.elements.forEach(clampElement); }
function deleteSelectedElement() { if (!designState.selectedElement) return; saveState(); designState.elements = designState.elements.filter(item => item.id !== designState.selectedElement.id); designState.selectedElement = null; syncFurnitureMeshes(); renderShoppingList(); updateElementCount(); clearPropertiesPanel(); }
function clearAllElements() { if (!designState.elements.length || !window.confirm('确定要清空当前空间中的全部家具吗？')) return; saveState(); designState.elements = []; designState.selectedElement = null; syncFurnitureMeshes(); renderShoppingList(); updateElementCount(); clearPropertiesPanel(); }

function updatePropertiesPanel(element) { const values = { elementName: element.name, widthInput: element.width, heightInput: element.height, colorPicker: element.color, selectedColor: element.color, rotationSlider: Math.round(element.rotation), rotationValue: `${Math.round(element.rotation)}°` }; Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node[id === 'selectedColor' || id === 'rotationValue' ? 'textContent' : 'value'] = value; }); }
function clearPropertiesPanel() { ['elementName', 'widthInput', 'heightInput'].forEach(id => { const node = document.getElementById(id); if (node) node.value = ''; }); const color = document.getElementById('colorPicker'); if (color) color.value = '#8fa0a8'; const selectedColor = document.getElementById('selectedColor'); if (selectedColor) selectedColor.textContent = '#8fa0a8'; const slider = document.getElementById('rotationSlider'); if (slider) slider.value = 0; const rotation = document.getElementById('rotationValue'); if (rotation) rotation.textContent = '0°'; }
function updateElementCount() { const node = document.getElementById('elementCount'); if (node) node.textContent = designState.elements.length; }

function renderShoppingList() { const container = document.getElementById('shoppingList'); if (!container) return; const grouped = new Map(); designState.elements.filter(item => item.price > 0).forEach(item => { const existing = grouped.get(item.furnitureId) || { ...item, quantity: 0 }; existing.quantity += 1; grouped.set(item.furnitureId, existing); }); if (!grouped.size) { container.innerHTML = '<div class="empty-list"><i class="fas fa-shopping-basket"></i><p>暂无商品</p></div>'; return; } let total = 0; const html = [...grouped.values()].map(item => { const subtotal = item.price * item.quantity; total += subtotal; return `<div class="shopping-item"><div class="shopping-info"><h4>${item.name}</h4><div class="price">￥${item.price.toLocaleString()} × ${item.quantity}</div></div><div class="shopping-total">￥${subtotal.toLocaleString()}</div><button class="remove-item" data-furniture-id="${item.furnitureId}" title="移除"><i class="fas fa-times"></i></button></div>`; }).join(''); container.innerHTML = `${html}<div class="shopping-total" style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(143,160,168,.18);"><strong>总计：￥${total.toLocaleString()}</strong></div><button class="btn-primary" style="width:100%;margin-top:15px;" id="shoppingLink"><i class="fas fa-shopping-cart"></i> 前往购物</button>`; container.querySelectorAll('[data-furniture-id]').forEach(node => node.addEventListener('click', () => removeFromShoppingList(Number(node.dataset.furnitureId)))); document.getElementById('shoppingLink')?.addEventListener('click', goToShopping); }
function removeFromShoppingList(furnitureId) { const target = designState.elements.find(item => item.furnitureId === furnitureId); if (!target) return; saveState(); designState.elements = designState.elements.filter(item => item.id !== target.id); designState.selectedElement = null; syncFurnitureMeshes(); renderShoppingList(); updateElementCount(); clearPropertiesPanel(); }
function goToShopping() { window.location.href = 'shopping.html'; }
function saveDesign() { if (typeof window.requireAuthentication === 'function' && !window.requireAuthentication()) return; localStorage.setItem('userDesigns', JSON.stringify([...JSON.parse(localStorage.getItem('userDesigns') || '[]'), { room: { ...roomState }, template: designState.currentRoom, elements: designState.elements, timestamp: new Date().toISOString() }])); alert('设计已保存'); }
function saveState() { designState.undoStack.push(JSON.parse(JSON.stringify(designState.elements))); designState.redoStack = []; if (designState.undoStack.length > 30) designState.undoStack.shift(); }
function undo() { if (!designState.undoStack.length) return; designState.redoStack.push(JSON.parse(JSON.stringify(designState.elements))); designState.elements = designState.undoStack.pop(); designState.selectedElement = null; syncFurnitureMeshes(); renderShoppingList(); updateElementCount(); clearPropertiesPanel(); }
function redo() { if (!designState.redoStack.length) return; designState.undoStack.push(JSON.parse(JSON.stringify(designState.elements))); designState.elements = designState.redoStack.pop(); designState.selectedElement = null; syncFurnitureMeshes(); renderShoppingList(); updateElementCount(); clearPropertiesPanel(); }
function numberOr(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

window.removeFromShoppingList = removeFromShoppingList;
window.goToShopping = goToShopping;
