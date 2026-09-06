// 3D空间设计工具
let designToolInitialized = false;

const ROOM = {
    width: 960,
    height: 620,
    depth: 420,
    floorTop: 250,
    floorBottom: 590,
    wallTop: 110,
    wallBottom: 260
};

const TEMPLATES = {
    'living-room': [
        { furnitureId: 1, x: 250, y: 490 },
        { furnitureId: 3, x: 470, y: 505 },
        { furnitureId: 7, x: 720, y: 470 },
        { furnitureId: 11, x: 500, y: 180 }
    ],
    'bedroom': [
        { furnitureId: 9, x: 330, y: 500 },
        { furnitureId: 10, x: 530, y: 500 },
        { furnitureId: 12, x: 700, y: 470 },
        { furnitureId: 11, x: 500, y: 170 }
    ],
    'kitchen': [
        { furnitureId: 4, x: 300, y: 500 },
        { furnitureId: 5, x: 600, y: 500 },
        { furnitureId: 11, x: 500, y: 180 }
    ],
    'office': [
        { furnitureId: 6, x: 360, y: 500 },
        { furnitureId: 5, x: 650, y: 500 },
        { furnitureId: 8, x: 760, y: 180 },
        { furnitureId: 11, x: 500, y: 180 }
    ]
};

let designState = {
    currentTool: 'select',
    selectedElement: null,
    elements: [],
    undoStack: [],
    redoStack: [],
    currentRoom: 'living-room',
    currentTheme: 'mist',
    furnitureItems: [],
    shoppingList: [],
    sceneReady: false
};

let paletteDragState = {
    active: false,
    pointerId: null,
    furniture: null,
    ghost: null,
    moved: false,
    pointerMoveHandler: null,
    pointerUpHandler: null,
    pointerCancelHandler: null
};

let previewState = {
    rotateX: 58,
    rotateY: -12,
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    stage: null
};

document.addEventListener('DOMContentLoaded', setupDesignTool);

function initializeDesignTool() {
    setupDesignTool();
}

function setupDesignTool() {
    if (designToolInitialized || !document.getElementById('designCanvas')) return;
    designToolInitialized = true;

    injectDesignToolStyles();
    loadFurnitureItems();
    buildScene();
    initializeCanvas();
    setupToolbar();
    setupPropertiesPanel();
    setupEventListeners();
    setupPreviewInteraction();
    setupCategoryTabs();
    setupRoomTemplates();
    setupColorThemes();
    applyQueryTemplate();
    setCurrentTool('select');
    updateElementCount();
    renderShoppingList();
    renderPreview();
}

function injectDesignToolStyles() {
    if (document.getElementById('design-3d-styles')) return;

    const style = document.createElement('style');
    style.id = 'design-3d-styles';
    style.textContent = `
        .design-tool {
            padding: 0 0 64px;
        }

        .design-layout {
            align-items: start;
            grid-template-columns: 260px minmax(0, 1fr) 300px;
            gap: 24px;
        }

        .design-sidebar,
        .properties-panel {
            background: rgba(251, 252, 250, 0.96);
            border: 1px solid rgba(143, 160, 168, 0.2);
        }

        .room-outline {
            position: relative;
            width: 100%;
            height: 680px;
            margin: 24px auto 0;
            perspective: 1800px;
            overflow: hidden;
            border-radius: 24px;
            background:
                radial-gradient(circle at 18% 18%, rgba(201, 209, 200, 0.25), transparent 28%),
                linear-gradient(135deg, #f2f4f2 0%, #d8dfe6 100%);
        }

        .scene-shell {
            position: absolute;
            inset: 0;
            transform-style: preserve-3d;
        }

        .scene-stage {
            position: absolute;
            left: 50%;
            top: 54%;
            width: ${ROOM.width}px;
            height: ${ROOM.height}px;
            transform-style: preserve-3d;
            transform: translate(-50%, -50%) scale(0.78);
            transition: transform 180ms ease;
        }

        .scene-floor {
            position: absolute;
            left: 50%;
            top: 59%;
            width: 760px;
            height: 470px;
            transform: translate(-50%, -50%) rotateX(66deg) translateZ(-8px);
            transform-origin: center;
            border-radius: 20px;
            background-color: transparent;
            background-image: none;
            box-shadow: none;
            transform-style: preserve-3d;
        }

        .scene-floor::after { display:none !important;
            content: '';
            position: absolute;
            inset: 0;
            transform: translateZ(-16px);
            border-radius: inherit;
            background: rgba(143, 160, 168, 0.2);
            box-shadow: 0 18px 0 rgba(30, 35, 39, 0.08);
        }

        .scene-wall {
            position: absolute;
            background: linear-gradient(180deg, rgba(251, 252, 250, 0.78), rgba(216, 223, 230, 0.46));
            box-shadow: inset 0 0 0 1px rgba(30, 35, 39, 0.05);
            transform-style: preserve-3d;
        }

        .scene-wall.back {
            left: 50%;
            top: 31%;
            width: 760px;
            height: 240px;
            transform: translate(-50%, -50%) translateZ(-210px);
            border-radius: 18px 18px 8px 8px;
        }

        .scene-wall.back::after { display:none !important;
            content: '';
            position: absolute;
            inset: 0;
            transform: translateZ(-18px);
            border-radius: inherit;
            background: rgba(143, 160, 168, 0.22);
        }

        .scene-wall.left {
            left: 15%;
            top: 37%;
            width: 470px;
            height: 240px;
            transform: translate(-50%, -50%) rotateY(90deg) translateZ(-380px);
            transform-origin: center;
            border-radius: 18px;
            background: linear-gradient(180deg, rgba(242, 244, 242, 0.66), rgba(216, 223, 230, 0.38));
        }

        .scene-wall.right {
            left: 85%;
            top: 37%;
            width: 470px;
            height: 240px;
            transform: translate(-50%, -50%) rotateY(-90deg) translateZ(-380px);
            transform-origin: center;
            border-radius: 18px;
            background: linear-gradient(180deg, rgba(242, 244, 242, 0.66), rgba(216, 223, 230, 0.38));
        }

        .scene-grid {
            position: absolute;
            left: 50%;
            top: 59%;
            width: 760px;
            height: 470px;
            transform: translate(-50%, -50%) rotateX(66deg) translateZ(2px);
            border-radius: 20px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M0 0h8M16 0h8M0 0v8M0 16v8' fill='none' stroke='%238fa0a8' stroke-opacity='.34' stroke-width='1'/%3E%3C/svg%3E");
            background-size: 32px 32px;
            pointer-events: none;
        }

        .placement-guide {
            position: absolute;
            display: none;
            min-width: 48px;
            min-height: 32px;
            border: 1px dashed rgba(30, 35, 39, 0.72);
            border-radius: 8px;
            background: rgba(201, 209, 200, 0.28);
            pointer-events: none;
            z-index: 18;
            box-shadow: 0 0 0 4px rgba(201, 209, 200, 0.14);
        }

        .placement-guide.visible {
            display: block;
        }

        .placement-guide.floor {
            transform: translate(-50%, -50%) rotateX(66deg) translateZ(8px);
            transform-origin: center;
            background-image:
                repeating-linear-gradient(0deg, transparent 0 15px, rgba(30, 35, 39, 0.42) 15px 16px),
                repeating-linear-gradient(90deg, transparent 0 15px, rgba(30, 35, 39, 0.42) 15px 16px);
            background-size: 16px 16px;
        }

        .placement-guide.wall {
            transform: translate(-50%, -50%) translateZ(-214px);
        }

        .scene-window-rail {
            position: absolute;
            left: 50%;
            top: 35%;
            width: 240px;
            height: 120px;
            transform: translate(-50%, -50%) translateZ(-209px);
            border: 1px solid rgba(30, 35, 39, 0.08);
            border-radius: 14px;
            background: linear-gradient(180deg, rgba(216, 223, 230, 0.9), rgba(242, 244, 242, 0.5));
        }

        .scene-window-rail::before,
        .scene-window-rail::after {
            content: '';
            position: absolute;
            inset: 12px;
            border-radius: 10px;
            border: 1px solid rgba(30, 35, 39, 0.08);
        }

        .scene-object {
            position: absolute;
            transform-style: preserve-3d;
            cursor: grab;
            user-select: none;
            filter: drop-shadow(0 20px 22px rgba(30, 35, 39, 0.14));
            touch-action: none;
        }

        .scene-object.selected {
            z-index: 20;
            filter: drop-shadow(0 24px 28px rgba(30, 35, 39, 0.2)) drop-shadow(0 0 0 rgba(0,0,0,0));
        }

        .scene-object[data-anchor="floor"] {
            transform: translate(-50%, -100%) translateZ(12px); z-index:4;
        }

        .scene-object[data-anchor="wall"] {
            transform: translate(-50%, -50%) translateZ(-210px);
        }

        .scene-object .model {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            border-radius: 18px;
        }

        .scene-object .model::before {
            content: '';
            position: absolute;
            inset: 0;
            transform: translate(14px, 16px) translateZ(-28px) rotateY(4deg);
            border-radius: inherit;
            background: color-mix(in srgb, var(--tone, #8fa0a8) 68%, black 32%);
            box-shadow: 0 12px 0 rgba(30, 35, 39, 0.12);
            pointer-events: none;
        }

        .scene-object .tone {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            transform: translateZ(10px);
            background: var(--tone, #8fa0a8);
        }

        .scene-object .accent {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            transform: translateZ(18px);
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(30, 35, 39, 0.08));
            mix-blend-mode: multiply;
        }

        .scene-object .shadow {
            position: absolute;
            left: 8%;
            right: 8%;
            bottom: -10px;
            height: 16px;
            border-radius: 50%;
            background: rgba(30, 35, 39, 0.18);
            filter: blur(6px);
        }

        .scene-object .label {
            position: absolute;
            left: 50%;
            bottom: -26px;
            transform: translateX(-50%);
            padding: 4px 8px;
            border-radius: 999px;
            background: rgba(251, 252, 250, 0.9);
            color: var(--gray-color);
            font-size: 11px;
            white-space: nowrap;
        }

        .model-sofa .sofa-base,
        .model-bed .bed-base,
        .model-cabinet .cabinet-shell,
        .model-window .window-frame,
        .model-door .door-frame,
        .model-table .table-top,
        .model-chair .chair-seat,
        .model-lamp .lamp-shade {
            position: absolute;
            border-radius: 16px;
            background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(30,35,39,0.1)), var(--tone, #8fa0a8);
            box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.25),
                inset 0 -8px 18px rgba(30, 35, 39, 0.14);
        }

        .model-sofa .sofa-base { left: 14%; right: 14%; bottom: 10%; height: 34%; }
        .model-sofa .sofa-back { left: 16%; right: 16%; top: 10%; height: 40%; border-radius: 18px 18px 10px 10px; background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(30,35,39,0.08)), color-mix(in srgb, var(--tone, #8fa0a8) 90%, black 10%); }
        .model-sofa .sofa-arm { position: absolute; top: 26%; bottom: 10%; width: 12%; border-radius: 16px; background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(30,35,39,0.08)), var(--tone, #8fa0a8); }
        .model-sofa .sofa-arm.left { left: 6%; }
        .model-sofa .sofa-arm.right { right: 6%; }
        .model-sofa .sofa-cushion { position: absolute; left: 24%; top: 34%; width: 22%; height: 18%; border-radius: 14px; background: rgba(242, 244, 242, 0.45); box-shadow: inset 0 -6px 12px rgba(30,35,39,0.1); }
        .model-sofa .sofa-cushion.second { left: 54%; }

        .model-bed .bed-base { left: 8%; right: 8%; bottom: 14%; height: 32%; border-radius: 16px; }
        .model-bed .bed-headboard { position: absolute; left: 6%; right: 6%; top: 8%; height: 24%; border-radius: 14px 14px 10px 10px; background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(30,35,39,0.08)), color-mix(in srgb, var(--tone, #8fa0a8) 82%, black 18%); }
        .model-bed .bed-sheet { position: absolute; left: 10%; right: 10%; top: 24%; bottom: 18%; border-radius: 14px; background: linear-gradient(180deg, rgba(251,252,250,0.55), rgba(216,223,230,0.25)); }
        .model-bed .bed-pillow { position: absolute; top: 28%; width: 18%; height: 12%; border-radius: 999px; background: rgba(251,252,250,0.9); box-shadow: inset 0 -4px 10px rgba(30,35,39,0.08); }
        .model-bed .bed-pillow.left { left: 18%; }
        .model-bed .bed-pillow.right { right: 18%; }

        .model-table .table-top { left: 10%; right: 10%; top: 12%; height: 18%; border-radius: 14px; }
        .model-table .table-leg { position: absolute; bottom: 10%; width: 10%; height: 54%; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(30,35,39,0.16)), color-mix(in srgb, var(--tone, #8fa0a8) 78%, black 22%); }
        .model-table .table-leg.one { left: 16%; }
        .model-table .table-leg.two { left: 38%; }
        .model-table .table-leg.three { right: 38%; }
        .model-table .table-leg.four { right: 16%; }

        .model-chair .chair-seat { left: 18%; right: 18%; bottom: 26%; height: 22%; border-radius: 14px; }
        .model-chair .chair-back { position: absolute; left: 22%; right: 22%; top: 12%; height: 34%; border-radius: 14px 14px 10px 10px; background: linear-gradient(180deg, rgba(255,255,255,0.15), rgba(30,35,39,0.1)), color-mix(in srgb, var(--tone, #8fa0a8) 84%, black 16%); }
        .model-chair .chair-leg { position: absolute; bottom: 8%; width: 8%; height: 26%; border-radius: 10px; background: color-mix(in srgb, var(--tone, #8fa0a8) 74%, black 26%); }
        .model-chair .chair-leg.one { left: 24%; }
        .model-chair .chair-leg.two { left: 42%; }
        .model-chair .chair-leg.three { right: 42%; }
        .model-chair .chair-leg.four { right: 24%; }

        .model-cabinet .cabinet-shell { left: 10%; right: 10%; top: 8%; bottom: 8%; border-radius: 14px; }
        .model-cabinet .cabinet-shelf { position: absolute; left: 16%; right: 16%; height: 6%; border-radius: 999px; background: rgba(242,244,242,0.5); box-shadow: inset 0 -4px 8px rgba(30,35,39,0.1); }
        .model-cabinet .cabinet-shelf.one { top: 26%; }
        .model-cabinet .cabinet-shelf.two { top: 48%; }
        .model-cabinet .cabinet-shelf.three { top: 70%; }

        .model-window .window-frame { left: 8%; right: 8%; top: 12%; bottom: 12%; border-radius: 18px; background: linear-gradient(180deg, rgba(242,244,242,0.86), rgba(216,223,230,0.7)); }
        .model-window .window-pane { position: absolute; inset: 18%; border-radius: 12px; background: linear-gradient(180deg, rgba(143,160,168,0.2), rgba(251,252,250,0.56)); border: 1px solid rgba(30,35,39,0.08); }
        .model-window .window-bar { position: absolute; left: 50%; top: 12%; bottom: 12%; width: 4%; transform: translateX(-50%); background: rgba(30,35,39,0.08); }
        .model-window .window-bar.horizontal { left: 8%; right: 8%; top: 50%; height: 4%; width: auto; transform: translateY(-50%); }

        .model-door .door-frame { left: 12%; right: 12%; top: 6%; bottom: 4%; border-radius: 16px 16px 10px 10px; background: linear-gradient(180deg, rgba(242,244,242,0.8), rgba(216,223,230,0.6)); }
        .model-door .door-panel { position: absolute; inset: 18% 18% 10% 18%; border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(30,35,39,0.12)), var(--tone, #8fa0a8); }
        .model-door .door-handle { position: absolute; right: 28%; top: 52%; width: 6%; height: 6%; border-radius: 50%; background: rgba(30,35,39,0.28); }

        .model-lamp .lamp-base { position: absolute; left: 28%; right: 28%; bottom: 6%; height: 10%; border-radius: 999px; background: color-mix(in srgb, var(--tone, #8fa0a8) 68%, black 32%); }
        .model-lamp .lamp-stand { position: absolute; left: 46%; top: 18%; width: 8%; bottom: 16%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(30,35,39,0.16)), var(--tone, #8fa0a8); }
        .model-lamp .lamp-shade { left: 18%; right: 18%; top: 0; height: 28%; border-radius: 18px 18px 30px 30px; background: linear-gradient(180deg, rgba(251,252,250,0.85), rgba(216,223,230,0.4)); }

        .model::after {
            content: '';
            position: absolute;
            left: 8%;
            right: 8%;
            bottom: -16px;
            height: 16px;
            transform: skewX(-24deg) translateZ(-16px);
            border-radius: 4px;
            background: color-mix(in srgb, var(--tone, #8fa0a8) 62%, black 38%);
            pointer-events: none;
        }

        .scene-object .controls {
            position: absolute;
            top: -18px;
            right: -18px;
            width: 26px;
            height: 26px;
            border: 1px solid rgba(30, 35, 39, 0.12);
            border-radius: 50%;
            background: rgba(251, 252, 250, 0.92);
            display: grid;
            place-items: center;
            color: var(--deep-ink);
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.18s ease;
        }

        .scene-object.selected .controls {
            opacity: 1;
        }

        .design-preview {
            position: relative;
            width: 100%;
            min-height: 230px;
            overflow: hidden;
            border-radius: 16px;
            background: linear-gradient(135deg, #f2f4f2 0%, #d8dfe6 100%);
        }

        .design-preview {
            position: relative;
            width: 100%;
            min-height: 250px;
            overflow: hidden;
            border-radius: 16px;
            background:
                radial-gradient(circle at 50% 30%, rgba(201, 209, 200, 0.3), transparent 42%),
                linear-gradient(135deg, #f2f4f2 0%, #d8dfe6 100%);
            perspective: 1100px;
            cursor: grab;
            touch-action: none;
        }

        .design-preview:active {
            cursor: grabbing;
        }

        .design-preview .preview-viewport {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
            overflow: hidden;
        }

        .design-preview .preview-stage {
            position: relative;
            flex: 0 0 auto;
            width: ${ROOM.width}px;
            height: ${ROOM.height}px;
            left: auto;
            top: auto;
            transform-origin: center;
            pointer-events: none;
        }

        .preview-orbit-hint {
            position: absolute;
            left: 50%;
            bottom: 12px;
            transform: translateX(-50%);
            z-index: 3;
            padding: 4px 9px;
            border: 1px solid rgba(30, 35, 39, 0.12);
            border-radius: 999px;
            background: rgba(251, 252, 250, 0.8);
            color: var(--gray-color);
            font-size: 10px;
            white-space: nowrap;
        }

        .preview-orbit-angle {
            color: var(--deep-ink);
            font-variant-numeric: tabular-nums;
        }

        .shopping-item {
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: 12px;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid rgba(143, 160, 168, 0.18);
        }

        .shopping-item h4 {
            margin-bottom: 4px;
            color: var(--deep-ink);
        }

        .shopping-item .price,
        .shopping-total {
            color: var(--gray-color);
            font-size: 14px;
        }

        .remove-item {
            border: none;
            background: transparent;
            color: var(--danger-color);
            cursor: pointer;
        }

        .empty-list,
        .products-empty {
            display: grid;
            place-items: center;
            min-height: 180px;
            padding: 24px;
            color: var(--gray-color);
            text-align: center;
        }

        .palette-ghost {
            position: fixed;
            z-index: 9999;
            width: 130px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(251, 252, 250, 0.96);
            border: 1px solid rgba(143, 160, 168, 0.25);
            box-shadow: 0 16px 30px rgba(30, 35, 39, 0.18);
            pointer-events: none;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--deep-ink);
        }

        .palette-ghost i {
            width: 28px;
            height: 28px;
            display: grid;
            place-items: center;
            border-radius: 8px;
            background: var(--mist-blue);
        }

        @media (max-width: 1100px) {
            .design-layout {
                grid-template-columns: 1fr;
            }

            .room-outline {
                height: 580px;
            }
        }
    `;
    document.head.appendChild(style);
}

function loadFurnitureItems() {
    designState.furnitureItems = [
        { id: 1, name: '双人沙发', category: 'seating', shape: 'sofa', anchor: 'floor', icon: 'fas fa-couch', width: 220, height: 120, depth: 90, color: '#8fa0a8', price: 3999 },
        { id: 2, name: '单人椅', category: 'seating', shape: 'chair', anchor: 'floor', icon: 'fas fa-chair', width: 90, height: 120, depth: 80, color: '#c9d1c8', price: 1999 },
        { id: 3, name: '茶几', category: 'tables', shape: 'table', anchor: 'floor', icon: 'fas fa-coffee', width: 140, height: 76, depth: 70, color: '#6f7d85', price: 899 },
        { id: 4, name: '餐桌', category: 'tables', shape: 'table', anchor: 'floor', icon: 'fas fa-utensils', width: 190, height: 82, depth: 92, color: '#8fa0a8', price: 1599 },
        { id: 5, name: '书柜', category: 'storage', shape: 'cabinet', anchor: 'floor', icon: 'fas fa-book', width: 130, height: 210, depth: 42, color: '#68757a', price: 1299 },
        { id: 6, name: '衣柜', category: 'storage', shape: 'cabinet', anchor: 'floor', icon: 'fas fa-tshirt', width: 160, height: 220, depth: 56, color: '#c9d1c8', price: 1999 },
        { id: 7, name: '落地灯', category: 'lighting', shape: 'lamp', anchor: 'floor', icon: 'fas fa-lightbulb', width: 70, height: 180, depth: 40, color: '#9aa8b1', price: 399 },
        { id: 8, name: '台灯', category: 'lighting', shape: 'lamp', anchor: 'floor', icon: 'fas fa-lightbulb', width: 64, height: 92, depth: 36, color: '#d8dfe6', price: 199 },
        { id: 9, name: '双人床', category: 'bed', shape: 'bed', anchor: 'floor', icon: 'fas fa-bed', width: 240, height: 150, depth: 140, color: '#8fa0a8', price: 2899 },
        { id: 10, name: '床头柜', category: 'bed', shape: 'cabinet', anchor: 'floor', icon: 'fas fa-square', width: 60, height: 70, depth: 45, color: '#c9d1c8', price: 299 },
        { id: 11, name: '落地窗', category: 'structure', shape: 'window', anchor: 'wall', icon: 'fas fa-clone', width: 200, height: 130, depth: 16, color: '#d8dfe6', price: 0 },
        { id: 12, name: '室内门', category: 'structure', shape: 'door', anchor: 'wall', icon: 'fas fa-door-open', width: 95, height: 210, depth: 16, color: '#c9d1c8', price: 0 }
    ];

    renderFurnitureItems('all');
}

function loadTemplates() {
    const active = document.querySelector('.room-template[data-template="living-room"]');
    if (active) active.classList.add('active');
}

function setupCategoryTabs() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            filterFurnitureByCategory(this.getAttribute('data-category'), this);
        });
    });
}

function setupRoomTemplates() {
    document.querySelectorAll('.room-template').forEach(template => {
        template.addEventListener('click', function() {
            loadRoomTemplate(this.getAttribute('data-template'));
        });
    });
}

function setupColorThemes() {
    document.querySelectorAll('.color-theme').forEach(theme => {
        theme.addEventListener('click', function() {
            changeColorTheme(this.getAttribute('data-theme'), this);
        });
    });
}

function buildScene() {
    const outline = document.querySelector('.room-outline');
    if (!outline) return;

    outline.innerHTML = `
        <div class="scene-shell">
            <div class="scene-stage" id="sceneStage">
                <div class="scene-wall back"></div>
                <div class="scene-wall left"></div>
                <div class="scene-wall right"></div>
                <div class="scene-floor"></div>
                <div class="scene-grid" id="sceneGrid"></div>
                <div class="placement-guide" id="placementGuide"></div>
                <div class="scene-window-rail"></div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('designCanvas');
    canvas.style.background = 'transparent';
    canvas.style.overflow = 'hidden';

    designState.sceneReady = true;
}

function renderFurnitureItems(category) {
    const container = document.querySelector('.furniture-items');
    if (!container) return;

    container.innerHTML = '';

    const items = category === 'all'
        ? designState.furnitureItems
        : designState.furnitureItems.filter(item => item.category === category);

    items.forEach(item => {
        const node = document.createElement('div');
        node.className = 'furniture-item';
        node.dataset.id = item.id;
        node.innerHTML = `
            <div class="furniture-icon"><i class="${item.icon}"></i></div>
            <span>${item.name}</span>
        `;

        node.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            beginPaletteDrag(item, e);
        });

        container.appendChild(node);
    });
}

function filterFurnitureByCategory(category, button) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    if (button) button.classList.add('active');
    renderFurnitureItems(category);
}

function loadRoomTemplate(templateType) {
    designState.currentRoom = templateType;
    designState.elements = [];
    designState.shoppingList = [];
    designState.undoStack = [];
    designState.redoStack = [];
    designState.selectedElement = null;

    document.querySelectorAll('.room-template').forEach(template => template.classList.remove('active'));
    const activeTemplate = document.querySelector(`.room-template[data-template="${templateType}"]`);
    if (activeTemplate) activeTemplate.classList.add('active');

    (TEMPLATES[templateType] || TEMPLATES['living-room']).forEach(item => {
        addFurnitureElement(item.furnitureId, item.x, item.y, true);
    });

    updateElementCount();
    renderShoppingList();
    renderPreview();
}

function changeColorTheme(themeType, button) {
    designState.currentTheme = themeType;
    document.querySelectorAll('.color-theme').forEach(theme => theme.classList.remove('active'));
    if (button) button.classList.add('active');

    const canvas = document.getElementById('designCanvas');
    const palette = {
        mist: { bg: '#f2f4f2', wall: '#fbfcfa' },
        stone: { bg: '#d8dfe6', wall: '#f2f4f2' },
        moss: { bg: '#c9d1c8', wall: '#f2f4f2' },
        ink: { bg: '#1e2327', wall: '#2c3539' },
        light: { bg: '#f2f4f2', wall: '#fbfcfa' },
        dark: { bg: '#1e2327', wall: '#2c3539' },
        warm: { bg: '#e8e2d8', wall: '#f7f2ea' },
        cool: { bg: '#d8dfe6', wall: '#f2f4f2' }
    };

    const tone = palette[themeType] || palette.mist;
    canvas.style.background = tone.bg;
    document.querySelector('.scene-floor')?.style.setProperty('background-color', tone.bg);
}

function setupToolbar() {
    const map = [
        ['selectTool', () => setCurrentTool('select')],
        ['moveTool', () => setCurrentTool('move')],
        ['rotateTool', () => setCurrentTool('rotate')],
        ['deleteTool', () => deleteSelectedElement()],
        ['gridToggle', () => toggleGrid()],
        ['undoBtn', () => undo()],
        ['redoBtn', () => redo()],
        ['saveBtn', () => saveDesign()],
        ['exportBtn', () => exportDesign()],
        ['renderBtn', () => renderPreview()]
    ];

    map.forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    });
}

function setCurrentTool(tool) {
    designState.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tool}Tool`)?.classList.add('active');
    document.getElementById('currentTool').textContent = getToolName(tool);
    updateCanvasCursor();
}

function getToolName(tool) {
    const toolNames = {
        select: '选择工具',
        move: '移动工具',
        rotate: '旋转工具',
        delete: '删除工具',
        drag: '拖拽工具'
    };
    return toolNames[tool] || tool;
}

function updateToolStatus() {
    document.getElementById('currentTool').textContent = getToolName(designState.currentTool);
    updateCanvasCursor();
}

function updateCanvasCursor() {
    const canvas = document.getElementById('designCanvas');
    if (!canvas) return;

    const cursors = {
        select: 'default',
        move: 'grab',
        rotate: 'crosshair',
        drag: 'copy'
    };
    canvas.style.cursor = cursors[designState.currentTool] || 'default';
}

function initializeCanvas() {
    const canvas = document.getElementById('designCanvas');
    if (!canvas) return;

    updateCanvasCursor();
    toggleGrid(true);
}

function beginPaletteDrag(item, event) {
    event.preventDefault();
    paletteDragState.active = true;
    paletteDragState.pointerId = event.pointerId;
    paletteDragState.furniture = item;
    paletteDragState.moved = false;

    const ghost = document.createElement('div');
    ghost.className = 'palette-ghost';
    ghost.innerHTML = `<i class="${item.icon}"></i><span>${item.name}</span>`;
    document.body.appendChild(ghost);
    paletteDragState.ghost = ghost;

    positionGhost(event.clientX, event.clientY);
    const move = ev => {
        if (paletteDragState.pointerId !== ev.pointerId) return;
        paletteDragState.moved = true;
        positionGhost(ev.clientX, ev.clientY);
        const stage = document.getElementById('sceneStage');
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const inside = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        stage.style.outline = inside ? '2px solid rgba(143,160,168,0.5)' : 'none';
        if (inside) {
            const point = screenToScene(ev.clientX, ev.clientY, rect);
            showPlacementGuide(item, point.x, point.y);
        } else {
            hidePlacementGuide();
        }
    };

    const up = ev => {
        if (paletteDragState.pointerId !== ev.pointerId) return;
        const stage = document.getElementById('sceneStage');
        if (!stage) {
            cleanupPaletteDrag();
            return;
        }
        const rect = stage.getBoundingClientRect();
        const inside = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        if (inside) {
            const point = screenToScene(ev.clientX, ev.clientY, rect);
            addFurnitureElement(item.id, snapToGrid(point.x), snapToGrid(point.y));
        }
        cleanupPaletteDrag();
    };

    const cancel = () => cleanupPaletteDrag();

    paletteDragState.pointerMoveHandler = move;
    paletteDragState.pointerUpHandler = up;
    paletteDragState.pointerCancelHandler = cancel;

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
    document.addEventListener('pointercancel', cancel, { once: true });
}

function cleanupPaletteDrag() {
    if (paletteDragState.pointerMoveHandler) {
        document.removeEventListener('pointermove', paletteDragState.pointerMoveHandler);
    }
    if (paletteDragState.pointerUpHandler) {
        document.removeEventListener('pointerup', paletteDragState.pointerUpHandler);
    }
    if (paletteDragState.pointerCancelHandler) {
        document.removeEventListener('pointercancel', paletteDragState.pointerCancelHandler);
    }
    document.querySelector('.scene-stage')?.style && (document.querySelector('.scene-stage').style.outline = 'none');
    hidePlacementGuide();
    paletteDragState.ghost?.remove();
    paletteDragState.active = false;
    paletteDragState.pointerId = null;
    paletteDragState.furniture = null;
    paletteDragState.ghost = null;
    paletteDragState.moved = false;
    paletteDragState.pointerMoveHandler = null;
    paletteDragState.pointerUpHandler = null;
    paletteDragState.pointerCancelHandler = null;
}

function positionGhost(x, y) {
    if (!paletteDragState.ghost) return;
    paletteDragState.ghost.style.left = `${x}px`;
    paletteDragState.ghost.style.top = `${y}px`;
}

function screenToScene(clientX, clientY, rect) {
    const x = ((clientX - rect.left) / rect.width) * ROOM.width;
    const y = ((clientY - rect.top) / rect.height) * ROOM.height;
    return { x: clamp(x, 0, ROOM.width), y: clamp(y, 0, ROOM.height) };
}

function snapToGrid(value) {
    return Math.round(value / 8) * 8;
}

function showPlacementGuide(item, x, y) {
    const guide = document.getElementById('placementGuide');
    if (!guide || !item) return;

    const anchor = item.anchor || 'floor';
    const width = item.width || 48;
    const height = anchor === 'wall'
        ? item.height || 48
        : Math.max(item.depth || 32, 32);

    guide.className = `placement-guide visible ${anchor}`;
    guide.style.left = `${snapToGrid(x)}px`;
    guide.style.top = `${snapToGrid(anchor === 'floor' ? y - height / 2 : y)}px`;
    guide.style.width = `${width}px`;
    guide.style.height = `${height}px`;
}

function hidePlacementGuide() {
    const guide = document.getElementById('placementGuide');
    if (!guide) return;
    guide.classList.remove('visible', 'floor', 'wall');
}

function toggleGrid(forceOn = false) {
    const grid = document.getElementById('sceneGrid');
    const btn = document.getElementById('gridToggle');
    if (!grid) return;

    const shouldShow = forceOn || !grid.dataset.hidden || grid.dataset.hidden === '0';
    if (forceOn) {
        grid.dataset.hidden = '0';
    } else if (grid.dataset.hidden === '1') {
        grid.dataset.hidden = '0';
    } else {
        grid.dataset.hidden = '1';
    }

    const visible = grid.dataset.hidden !== '1';
    grid.style.display = visible ? 'block' : 'none';
    btn?.classList.toggle('active', visible);
}

function createGrid() {
    return document.getElementById('sceneGrid');
}

function addFurnitureElement(furnitureId, x, y, fromTemplate = false) {
    const furniture = designState.furnitureItems.find(item => item.id === furnitureId);
    if (!furniture) return;

    designState.elements.forEach(element => {
        element.selected = false;
    });

    const element = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        furnitureId: furniture.id,
        name: furniture.name,
        shape: furniture.shape,
        category: furniture.category,
        anchor: furniture.anchor,
        icon: furniture.icon,
        color: furniture.color,
        x: clamp(snapToGrid(x), 50, ROOM.width - 50),
        y: furniture.anchor === 'wall'
            ? clamp(snapToGrid(y), ROOM.wallTop, ROOM.wallBottom)
            : clamp(snapToGrid(y), ROOM.floorTop, ROOM.floorBottom),
        width: furniture.width,
        height: furniture.height,
        depth: furniture.depth,
        rotation: 0,
        selected: true,
        price: furniture.price
    };

    if (!fromTemplate) {
        saveState();
    }

    designState.elements.push(element);
    designState.selectedElement = element;
    renderSceneObjects();
    updateElementCount();
    renderShoppingList();
    updatePropertiesPanel(element);
    renderPreview();
}

function renderSceneObjects() {
    const stage = document.getElementById('sceneStage');
    if (!stage) return;

    stage.querySelectorAll('.scene-object').forEach(node => node.remove());

    designState.elements.forEach(element => {
        const node = document.createElement('div');
        node.className = `scene-object ${element.selected ? 'selected' : ''}`;
        node.dataset.id = element.id;
        node.dataset.anchor = element.anchor;
        node.dataset.shape = element.shape;
        node.style.left = `${element.x}px`;
        node.style.top = `${element.y}px`;
        node.style.width = `${element.width}px`;
        node.style.height = `${Math.max(element.height, 80)}px`;
        node.style.setProperty('--tone', element.color);
        node.style.transform = element.anchor === 'wall'
            ? `translate(-50%, -50%) translateZ(-210px) rotateZ(${element.rotation}deg)`
            : `translate(-50%, -100%) translateZ(0px) rotateZ(${element.rotation}deg)`;
        node.innerHTML = `
            ${buildModelMarkup(element)}
            <div class="shadow"></div>
            <div class="label">${element.name}</div>
            <div class="controls"><i class="fas fa-rotate-right"></i></div>
        `;

        node.addEventListener('click', e => {
            e.stopPropagation();
            if (designState.currentTool === 'delete') {
                designState.selectedElement = element;
                deleteSelectedElement();
                return;
            }
            selectElement(element.id);
        });

        node.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            selectElement(element.id);
            startElementPointerInteraction(element.id, e);
        });

        stage.appendChild(node);
    });
}

function buildModelMarkup(element) {
    switch (element.shape) {
        case 'sofa':
            return `
                <div class="model model-sofa">
                    <div class="sofa-back tone"></div>
                    <div class="sofa-base tone"></div>
                    <div class="sofa-arm left tone"></div>
                    <div class="sofa-arm right tone"></div>
                    <div class="sofa-cushion"></div>
                    <div class="sofa-cushion second"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'bed':
            return `
                <div class="model model-bed">
                    <div class="bed-headboard tone"></div>
                    <div class="bed-base tone"></div>
                    <div class="bed-sheet"></div>
                    <div class="bed-pillow left"></div>
                    <div class="bed-pillow right"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'table':
            return `
                <div class="model model-table">
                    <div class="table-top tone"></div>
                    <div class="table-leg one tone"></div>
                    <div class="table-leg two tone"></div>
                    <div class="table-leg three tone"></div>
                    <div class="table-leg four tone"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'chair':
            return `
                <div class="model model-chair">
                    <div class="chair-back tone"></div>
                    <div class="chair-seat tone"></div>
                    <div class="chair-leg one tone"></div>
                    <div class="chair-leg two tone"></div>
                    <div class="chair-leg three tone"></div>
                    <div class="chair-leg four tone"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'cabinet':
            return `
                <div class="model model-cabinet">
                    <div class="cabinet-shell tone"></div>
                    <div class="cabinet-shelf one"></div>
                    <div class="cabinet-shelf two"></div>
                    <div class="cabinet-shelf three"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'window':
            return `
                <div class="model model-window">
                    <div class="window-frame tone"></div>
                    <div class="window-pane"></div>
                    <div class="window-bar"></div>
                    <div class="window-bar horizontal"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'door':
            return `
                <div class="model model-door">
                    <div class="door-frame tone"></div>
                    <div class="door-panel"></div>
                    <div class="door-handle"></div>
                    <div class="accent"></div>
                </div>
            `;
        case 'lamp':
            return `
                <div class="model model-lamp">
                    <div class="lamp-shade tone"></div>
                    <div class="lamp-stand"></div>
                    <div class="lamp-base tone"></div>
                    <div class="accent"></div>
                </div>
            `;
        default:
            return `
                <div class="model model-cabinet">
                    <div class="cabinet-shell tone"></div>
                    <div class="accent"></div>
                </div>
            `;
    }
}

function selectElement(elementId) {
    designState.elements.forEach(element => {
        element.selected = element.id === elementId;
    });

    designState.selectedElement = designState.elements.find(el => el.id === elementId) || null;
    renderSceneObjects();

    if (designState.selectedElement) {
        updatePropertiesPanel(designState.selectedElement);
    }
}

function startElementPointerInteraction(elementId, e) {
    const element = designState.elements.find(el => el.id === elementId);
    if (!element) return;

    const stage = document.getElementById('sceneStage');
    const rect = stage.getBoundingClientRect();
    const scaleX = ROOM.width / rect.width;
    const scaleY = ROOM.height / rect.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startElementX = element.x;
    const startElementY = element.y;
    const startRotation = element.rotation;
    let mode = null;

    function onMove(ev) {
        if (ev.pointerId !== e.pointerId) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!mode && Math.hypot(dx, dy) > 4) {
            mode = ev.shiftKey || designState.currentTool === 'rotate' ? 'rotate' : 'drag';
        }

        if (mode === 'rotate') {
            element.rotation = (startRotation + dx + 360) % 360;
            document.getElementById('rotationSlider').value = Math.round(element.rotation);
            document.getElementById('rotationValue').textContent = `${Math.round(element.rotation)}°`;
        } else {
            const sceneDx = dx * scaleX;
            const sceneDy = dy * scaleY;
            element.x = clamp(snapToGrid(startElementX + sceneDx), 50, ROOM.width - 50);
            element.y = element.anchor === 'wall'
                ? clamp(snapToGrid(startElementY + sceneDy), ROOM.wallTop, ROOM.wallBottom)
                : clamp(snapToGrid(startElementY + sceneDy), ROOM.floorTop, ROOM.floorBottom);
            showPlacementGuide(element, element.x, element.y);
            updatePropertiesPanel(element);
        }

        renderSceneObjects();
        renderPreview();
    }

    function onUp(ev) {
        if (ev.pointerId !== e.pointerId) return;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onCancel);
        hidePlacementGuide();
        saveState();
        renderShoppingList();
    }

    function onCancel(ev) {
        if (ev.pointerId !== e.pointerId) return;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onCancel);
        hidePlacementGuide();
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
    document.addEventListener('pointercancel', onCancel, { once: true });
}

function startRotate(elementId, e) {
    const element = designState.elements.find(el => el.id === elementId);
    if (!element) return;

    const startX = e.clientX;
    const startRotation = element.rotation;
    function onMove(ev) {
        if (ev.pointerId !== e.pointerId) return;
        const dx = ev.clientX - startX;
        element.rotation = (startRotation + dx + 360) % 360;
        document.getElementById('rotationSlider').value = Math.round(element.rotation);
        document.getElementById('rotationValue').textContent = `${Math.round(element.rotation)}°`;
        renderSceneObjects();
        renderPreview();
    }

    function onUp(ev) {
        if (ev.pointerId !== e.pointerId) return;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        saveState();
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
}

function deleteSelectedElement() {
    if (!designState.selectedElement) return;

    const index = designState.elements.findIndex(el => el.id === designState.selectedElement.id);
    if (index > -1) {
        saveState();
        designState.elements.splice(index, 1);
        designState.selectedElement = null;
        renderSceneObjects();
        updateElementCount();
        clearPropertiesPanel();
        renderShoppingList();
        renderPreview();
    }
}

function rerenderAllElements() {
    renderSceneObjects();
    renderShoppingList();
    renderPreview();
}

function renderAllElements() {
    renderSceneObjects();
}

function clearCanvas() {
    const stage = document.getElementById('sceneStage');
    stage?.querySelectorAll('.scene-object').forEach(node => node.remove());
}

function updateElementCount() {
    const counter = document.getElementById('elementCount');
    if (counter) counter.textContent = designState.elements.length;
}

function setupPropertiesPanel() {
    const nameInput = document.getElementById('elementName');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const colorPicker = document.getElementById('colorPicker');
    const rotationSlider = document.getElementById('rotationSlider');

    nameInput?.addEventListener('input', function() {
        if (!designState.selectedElement) return;
        designState.selectedElement.name = this.value;
        saveState();
        rerenderAllElements();
    });

    widthInput?.addEventListener('change', function() {
        if (!designState.selectedElement) return;
        designState.selectedElement.width = parseInt(this.value || '0', 10);
        saveState();
        rerenderAllElements();
    });

    heightInput?.addEventListener('change', function() {
        if (!designState.selectedElement) return;
        designState.selectedElement.height = parseInt(this.value || '0', 10);
        saveState();
        rerenderAllElements();
    });

    colorPicker?.addEventListener('input', function() {
        if (!designState.selectedElement) return;
        designState.selectedElement.color = this.value;
        document.getElementById('selectedColor').textContent = this.value;
        saveState();
        rerenderAllElements();
    });

    rotationSlider?.addEventListener('input', function() {
        if (!designState.selectedElement) return;
        designState.selectedElement.rotation = parseInt(this.value || '0', 10);
        document.getElementById('rotationValue').textContent = `${this.value}°`;
        saveState();
        rerenderAllElements();
    });
}

function updatePropertiesPanel(element) {
    document.getElementById('elementName').value = element.name;
    document.getElementById('widthInput').value = element.width;
    document.getElementById('heightInput').value = element.height;
    document.getElementById('colorPicker').value = element.color;
    document.getElementById('selectedColor').textContent = element.color;
    document.getElementById('rotationSlider').value = element.rotation;
    document.getElementById('rotationValue').textContent = `${element.rotation}°`;
}

function clearPropertiesPanel() {
    document.getElementById('elementName').value = '';
    document.getElementById('widthInput').value = '';
    document.getElementById('heightInput').value = '';
    document.getElementById('colorPicker').value = '#8fa0a8';
    document.getElementById('selectedColor').textContent = '#8fa0a8';
    document.getElementById('rotationSlider').value = 0;
    document.getElementById('rotationValue').textContent = '0°';
}

function saveState() {
    designState.undoStack.push(JSON.parse(JSON.stringify(designState.elements)));
    designState.redoStack = [];
}

function undo() {
    if (designState.undoStack.length === 0) return;
    designState.redoStack.push(JSON.parse(JSON.stringify(designState.elements)));
    designState.elements = designState.undoStack.pop();
    designState.selectedElement = null;
    rerenderAllElements();
    updateElementCount();
}

function redo() {
    if (designState.redoStack.length === 0) return;
    designState.undoStack.push(JSON.parse(JSON.stringify(designState.elements)));
    designState.elements = designState.redoStack.pop();
    designState.selectedElement = null;
    rerenderAllElements();
    updateElementCount();
}

function saveDesign() {
    const design = {
        room: designState.currentRoom,
        theme: designState.currentTheme,
        elements: designState.elements,
        timestamp: new Date().toISOString()
    };

    const saved = JSON.parse(localStorage.getItem('userDesigns') || '[]');
    saved.push(design);
    localStorage.setItem('userDesigns', JSON.stringify(saved));
    alert('设计已保存');
}

function exportDesign() {
    alert('导出功能稍后完善');
}

function renderPreview() {
    const preview = document.getElementById('designPreview');
    const stage = document.getElementById('sceneStage');
    if (!preview || !stage) return;

    preview.innerHTML = '';
    const clone = stage.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.classList.add('preview-stage');
    clone.style.position = 'relative';
    clone.style.width = `${ROOM.width}px`;
    clone.style.height = `${ROOM.height}px`;

    const viewport = document.createElement('div');
    viewport.className = 'preview-viewport';
    viewport.appendChild(clone);

    const hint = document.createElement('div');
    hint.className = 'preview-orbit-hint';
    hint.innerHTML = '拖动预览旋转视角 · <span class="preview-orbit-angle" id="previewOrbitAngle"></span>';

    preview.appendChild(viewport);
    preview.appendChild(hint);
    previewState.stage = clone;
    applyPreviewTransform();
}

function setupPreviewInteraction() {
    const preview = document.getElementById('designPreview');
    if (!preview || preview.dataset.orbitReady === '1') return;

    preview.dataset.orbitReady = '1';
    preview.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        previewState.active = true;
        previewState.pointerId = event.pointerId;
        previewState.lastX = event.clientX;
        previewState.lastY = event.clientY;
        preview.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    });

    preview.addEventListener('pointermove', event => {
        if (!previewState.active || previewState.pointerId !== event.pointerId) return;

        const dx = event.clientX - previewState.lastX;
        const dy = event.clientY - previewState.lastY;
        previewState.lastX = event.clientX;
        previewState.lastY = event.clientY;
        previewState.rotateY = (previewState.rotateY + dx * 0.65 + 360) % 360;
        previewState.rotateX = clamp(previewState.rotateX - dy * 0.45, 24, 78);
        applyPreviewTransform();
        event.preventDefault();
    });

    const endOrbit = event => {
        if (previewState.pointerId !== event.pointerId) return;
        previewState.active = false;
        previewState.pointerId = null;
        preview.releasePointerCapture?.(event.pointerId);
    };

    preview.addEventListener('pointerup', endOrbit);
    preview.addEventListener('pointercancel', endOrbit);
}

function applyPreviewTransform() {
    if (!previewState.stage) return;
    previewState.stage.style.transform =
        `scale(0.22) rotateX(${previewState.rotateX}deg) rotateY(${previewState.rotateY}deg)`;
    const angle = document.getElementById('previewOrbitAngle');
    if (angle) {
        angle.textContent = `${Math.round(previewState.rotateY)}° / ${Math.round(previewState.rotateX)}°`;
    }
}

function addToShoppingList() {
    renderShoppingList();
}

function removeFromShoppingList(furnitureId) {
    const index = designState.elements.findIndex(item => item.furnitureId === furnitureId);
    if (index > -1) {
        saveState();
        designState.elements.splice(index, 1);
        designState.selectedElement = null;
        rerenderAllElements();
        updateElementCount();
        renderShoppingList();
        renderPreview();
    }
}

function renderShoppingList() {
    const container = document.getElementById('shoppingList');
    if (!container) return;

    const items = designState.elements.filter(item => item.price > 0);
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-shopping-basket"></i>
                <p>暂无商品</p>
            </div>
        `;
        return;
    }

    const grouped = new Map();
    items.forEach(item => {
        if (!grouped.has(item.furnitureId)) {
            grouped.set(item.furnitureId, { ...item, quantity: 0 });
        }
        grouped.get(item.furnitureId).quantity += 1;
    });

    let total = 0;
    const html = Array.from(grouped.values()).map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="shopping-item">
                <div class="shopping-info">
                    <h4>${item.name}</h4>
                    <div class="price">¥${item.price.toLocaleString()} × ${item.quantity}</div>
                </div>
                <div class="shopping-total">¥${subtotal.toLocaleString()}</div>
                <button class="remove-item" onclick="removeFromShoppingList(${item.furnitureId})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        ${html}
        <div class="shopping-total" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(143,160,168,0.18);">
            <strong>总计: ¥${total.toLocaleString()}</strong>
        </div>
        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="goToShopping()">
            <i class="fas fa-shopping-cart"></i> 前往购物
        </button>
    `;
}

function goToShopping() {
    window.location.href = 'shopping.html';
}

function setupEventListeners() {
    document.querySelector('.room-outline')?.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('scene-shell') || e.target.classList.contains('scene-stage')) {
            designState.elements.forEach(element => element.selected = false);
            designState.selectedElement = null;
            renderSceneObjects();
            clearPropertiesPanel();
        }
    });

    window.addEventListener('resize', () => {
        renderPreview();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Delete') deleteSelectedElement();
        if (e.key === 'Escape') {
            designState.elements.forEach(element => element.selected = false);
            designState.selectedElement = null;
            renderSceneObjects();
            clearPropertiesPanel();
        }
    });
}

function setupShoppingList() {
    renderShoppingList();
}

function applyQueryTemplate() {
    const params = new URLSearchParams(window.location.search);
    const style = params.get('style');
    const templateMap = {
        modern: 'living-room',
        nordic: 'bedroom',
        industrial: 'office'
    };

    loadRoomTemplate(templateMap[style] || designState.currentRoom);
    renderShoppingList();
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

// Scene orbit controls


(function(){ var c=document.getElementById('designCanvas'); if(!c)return; var s=document.getElementById('sceneStage'); var a=false,p=null,x=0,y=0,rx=58,ry=-12; function apply(){s.style.transform='translate(-50%, -50%) scale(0.78) rotateX('+rx+'deg) rotateY('+ry+'deg)';} c.addEventListener('pointerdown',function(e){if(e.button!==0||e.target.closest('.scene-object'))return;a=true;p=e.pointerId;x=e.clientX;y=e.clientY;c.setPointerCapture&&c.setPointerCapture(p);}); c.addEventListener('pointermove',function(e){if(!a||e.pointerId!==p)return;ry=(ry+(e.clientX-x)*.6+360)%360;rx=Math.max(15,Math.min(85,rx-(e.clientY-y)*.4));x=e.clientX;y=e.clientY;apply();}); function end(e){if(e.pointerId===p){a=false;p=null;}} c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);apply();})();

