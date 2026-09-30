const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const reposFile = path.join(baseDir, 'data', 'repos_analyzed.json');
const outputFile = path.join(baseDir, 'index.html');

const repos = JSON.parse(fs.readFileSync(reposFile, 'utf8'));

// Sort repos alphabetically by default within categories
repos.sort((a, b) => a.name.localeCompare(b.name));

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa Mental - Portfólio de Repositórios | Sandro Peixoto</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --bg-surface: #0f172a;
      --bg-surface-elevated: #1e293b;
      --bg-card: rgba(15, 23, 42, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.4);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #06b6d4;
      --accent-glow: rgba(6, 182, 212, 0.15);
      --radius: 12px;
      --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg);
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }

    /* Header Nav */
    header {
      height: 70px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 40;
      flex-shrink: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      color: white;
      font-size: 20px;
    }

    .brand-text h1 {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-text p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .stats-pills {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
    }

    .stats-pills span strong {
      color: #fff;
    }

    /* Actions bar in Header */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box input {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid var(--border);
      padding: 8px 14px 8px 36px;
      border-radius: 10px;
      color: var(--text);
      font-family: var(--font);
      font-size: 13px;
      width: 260px;
      transition: all 0.2s ease;
      outline: none;
    }

    .search-box input:focus {
      width: 320px;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      background: rgba(30, 41, 59, 0.95);
    }

    .search-box svg {
      position: absolute;
      left: 12px;
      width: 15px;
      height: 15px;
      color: var(--text-dim);
      pointer-events: none;
    }

    .kbd-shortcut {
      position: absolute;
      right: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--text-dim);
      pointer-events: none;
    }

    .view-toggle {
      display: flex;
      background: rgba(30, 41, 59, 0.6);
      padding: 3px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    .view-toggle button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .view-toggle button.active {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }

    /* Subheader Filters */
    .filter-bar {
      background: rgba(15, 23, 42, 0.6);
      border-bottom: 1px solid var(--border);
      padding: 8px 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      z-index: 30;
      flex-shrink: 0;
    }

    .filter-chip {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .filter-chip:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
    }

    .filter-chip.active {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.4);
      color: #818cf8;
      font-weight: 600;
    }

    .chip-count {
      background: rgba(255, 255, 255, 0.1);
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 10px;
    }

    /* Main Container */
    .main-viewport {
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
    }

    /* Canvas Map Mode */
    #mindmap-container {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      cursor: grab;
      overflow: hidden;
      background-image: 
        radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        radial-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px);
      background-size: 32px 32px;
      background-position: 0 0, 16px 16px;
    }

    #mindmap-container:active {
      cursor: grabbing;
    }

    #mindmap-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Map Controls Float */
    .map-controls {
      position: absolute;
      bottom: 24px;
      left: 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 25;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 6px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .map-controls button {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.15s ease;
    }

    .map-controls button:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .map-legend {
      position: absolute;
      bottom: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      z-index: 25;
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    /* Grid View Mode */
    #grid-container {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 24px 32px;
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      background: var(--bg);
    }

    .grid-wrapper {
      max-width: 1400px;
      margin: 0 auto;
    }

    .grid-category-section {
      margin-bottom: 36px;
    }

    .grid-category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .grid-category-title {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .repo-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .repo-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--card-accent, var(--primary));
      opacity: 0.8;
    }

    .repo-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      background: var(--bg-surface-elevated);
    }

    .repo-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }

    .repo-card-name {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      word-break: break-word;
    }

    .repo-card-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--font-mono);
      white-space: nowrap;
    }

    .badge-private {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .badge-public {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .repo-card-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .repo-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: auto;
    }

    .tag-pill {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.05);
      font-family: var(--font-mono);
    }

    .tag-pill.framework {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border-color: rgba(99, 102, 241, 0.3);
    }

    .tag-pill.ai {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border-color: rgba(16, 185, 129, 0.3);
    }

    /* Detail Drawer / Modal */
    #detail-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 480px;
      max-width: 90vw;
      height: 100vh;
      background: #0f172a;
      border-left: 1px solid var(--border);
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
      transform: translateX(100%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #detail-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(30, 41, 59, 0.4);
    }

    .drawer-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .drawer-title {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      word-break: break-all;
    }

    .drawer-category {
      font-size: 12px;
      color: var(--accent);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .drawer-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .drawer-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .drawer-section {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }

    .drawer-section-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .drawer-desc {
      font-size: 13px;
      line-height: 1.6;
      color: #cbd5e1;
    }

    /* Language distribution bar */
    .lang-bar-container {
      display: flex;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
      background: #334155;
    }

    .lang-bar-segment {
      height: 100%;
      transition: width 0.3s ease;
    }

    .lang-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 11px;
    }

    .lang-legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--text-muted);
    }

    .lang-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    /* Stack grid */
    .stack-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .stack-tag {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--border);
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.9);
      display: flex;
      gap: 12px;
    }

    .btn-github {
      flex: 1;
      padding: 10px 16px;
      border-radius: 8px;
      background: #24292e;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: all 0.15s ease;
    }

    .btn-github:hover {
      background: #2f363d;
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* SVG Mindmap Styles */
    .node-group {
      cursor: pointer;
      transition: filter 0.15s ease;
    }

    .node-group:hover {
      filter: brightness(1.15);
    }

    .branch-link {
      fill: none;
      stroke-linecap: round;
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }

    .root-node-rect {
      filter: drop-shadow(0 0 25px rgba(99, 102, 241, 0.4));
    }

    /* Backdrop */
    #drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      z-index: 95;
      display: none;
    }

    #drawer-backdrop.open {
      display: block;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .stats-pills { display: none; }
      .search-box input { width: 180px; }
      .search-box input:focus { width: 220px; }
      #detail-drawer { width: 100%; }
    }
  </style>
</head>
<body>

  <!-- Backdrop for drawer -->
  <div id="drawer-backdrop"></div>

  <!-- Header -->
  <header>
    <div class="brand">
      <div class="brand-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 12h3m12 0h3M12 3v3m0 12v3"></path>
          <path d="M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"></path>
        </svg>
      </div>
      <div class="brand-text">
        <h1>Sandro Peixoto <span style="font-size:12px; font-weight:500; color:var(--accent); background:rgba(6,182,212,0.1); padding:2px 8px; border-radius:999px; border:1px solid rgba(6,182,212,0.25);">GitHub Ecosystem</span></h1>
        <p>Mapa mental navegável e stacks dos 114 repositórios</p>
      </div>
    </div>

    <div class="stats-pills">
      <span>Total: <strong>\${repos.length} repos</strong></span>
      <span style="opacity:0.3">|</span>
      <span>🔒 Privados: <strong>\${repos.filter(r => r.isPrivate).length}</strong></span>
      <span style="opacity:0.3">|</span>
      <span>🌐 Públicos: <strong>\${repos.filter(r => !r.isPrivate).length}</strong></span>
      <span style="opacity:0.3">|</span>
      <span>⚛️ React: <strong>\${repos.filter(r => r.techStack.frameworks.includes('React')).length}</strong></span>
      <span style="opacity:0.3">|</span>
      <span>🔥 Firebase: <strong>\${repos.filter(r => r.techStack.cloud.includes('Firebase')).length}</strong></span>
    </div>

    <div class="header-actions">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" placeholder="Filtrar por nome, stack, pacote..." autocomplete="off">
        <span class="kbd-shortcut">/</span>
      </div>

      <div class="view-toggle">
        <button id="viewMapBtn" class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          Mapa Mental
        </button>
        <button id="viewGridBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Grade
        </button>
      </div>
    </div>
  </header>

  <!-- Filter Category Chips -->
  <div class="filter-bar" id="categoryFilterBar">
    <div class="filter-chip active" data-category="ALL">
      <span>Todos os Projetos</span>
      <span class="chip-count">\${repos.length}</span>
    </div>
  </div>

  <!-- Main Viewport -->
  <div class="main-viewport">
    <!-- View 1: Mind Map SVG Canvas -->
    <div id="mindmap-container">
      <svg id="mindmap-svg"></svg>

      <!-- Zoom/Pan Controls -->
      <div class="map-controls">
        <button id="zoomInBtn" title="Aumentar Zoom (Scroll Up)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button id="zoomOutBtn" title="Diminuir Zoom (Scroll Down)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button id="zoomResetBtn" title="Centralizar e Encaixar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6m0 6v6h-6M9 21H3v-6m0-6V3h6"></path></svg>
        </button>
      </div>

      <!-- Legend -->
      <div class="map-legend">
        <div class="legend-item"><div class="legend-dot" style="background:#3178c6"></div> TypeScript</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f7df1e"></div> JavaScript</div>
        <div class="legend-item"><div class="legend-dot" style="background:#4f5d95"></div> PHP</div>
        <div class="legend-item"><div class="legend-dot" style="background:#3572A5"></div> Python</div>
        <div class="legend-item"><div class="legend-dot" style="background:#00B4AB"></div> Dart/Flutter</div>
        <div class="legend-item">🔒 Privado</div>
        <div class="legend-item">🌐 Público</div>
      </div>
    </div>

    <!-- View 2: Cards Grid -->
    <div id="grid-container">
      <div class="grid-wrapper" id="gridContent"></div>
    </div>
  </div>

  <!-- Detail Slide-Over Drawer -->
  <div id="detail-drawer">
    <div class="drawer-header">
      <div class="drawer-title-wrap">
        <span class="drawer-category" id="drawerCategory">Categoria</span>
        <h2 class="drawer-title" id="drawerTitle">Nome do Repositório</h2>
      </div>
      <button class="drawer-close" id="drawerCloseBtn" title="Fechar (Esc)">✕</button>
    </div>

    <div class="drawer-body">
      <!-- Visibility & Dates Banner -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <div id="drawerBadges" style="display:flex; gap:6px;"></div>
        <span id="drawerDates" style="font-size:11px; color:var(--text-dim); font-family:var(--font-mono);"></span>
      </div>

      <!-- Description -->
      <div class="drawer-section">
        <div class="drawer-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          Descrição & Propósito
        </div>
        <p class="drawer-desc" id="drawerDesc">Sem descrição fornecida.</p>
      </div>

      <!-- Languages Breakdown -->
      <div class="drawer-section">
        <div class="drawer-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          Composição de Linguagens
        </div>
        <div class="lang-bar-container" id="drawerLangBar"></div>
        <div class="lang-legend" id="drawerLangLegend"></div>
      </div>

      <!-- Frameworks & UI -->
      <div class="drawer-section">
        <div class="drawer-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          Frameworks, UI & Bibliotecas
        </div>
        <div class="stack-grid" id="drawerFrameworks"></div>
      </div>

      <!-- Backend, Cloud & Infra -->
      <div class="drawer-section">
        <div class="drawer-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
          Backend, Cloud & Banco de Dados
        </div>
        <div class="stack-grid" id="drawerInfra"></div>
      </div>

      <!-- Key Dependencies -->
      <div class="drawer-section">
        <div class="drawer-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          Principais Dependências Detectadas
        </div>
        <div class="stack-grid" id="drawerDeps"></div>
      </div>
    </div>

    <div class="drawer-footer">
      <a href="#" target="_blank" id="drawerGithubLink" class="btn-github">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        Ver Repositório no GitHub
      </a>
    </div>
  </div>

  <script>
    // Embedded Repositories Data
    const REPOSITORIES = ${JSON.stringify(repos)};

    // Category styling & icons
    const CATEGORY_META = {
      'Sites Institucionais & Portais': { color: '#3b82f6', icon: '🏢' },
      'Aplicações Web & SaaS': { color: '#06b6d4', icon: '🌐' },
      'Sistemas de Gestão & Governança': { color: '#8b5cf6', icon: '📊' },
      'Backends, APIs & Serviços': { color: '#f59e0b', icon: '⚡' },
      'Inteligência Artificial & Agentes': { color: '#10b981', icon: '🤖' },
      'Comunicação, Automação & Bots': { color: '#ec4899', icon: '💬' },
      'Ferramentas, CLIs & Utilitários': { color: '#94a3b8', icon: '🛠️' },
      'Mobile & Multiplataforma': { color: '#0ea5e9', icon: '📱' },
      'Outros Projetos': { color: '#71717a', icon: '📦' }
    };

    const LANG_COLORS = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f7df1e',
      'PHP': '#4f5d95',
      'Python': '#3572A5',
      'Dart': '#00B4AB',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Shell': '#89e051',
      'Dockerfile': '#384d54'
    };

    // State
    let activeCategory = 'ALL';
    let searchQuery = '';
    let collapsedCategories = new Set();
    let currentView = 'map'; // 'map' | 'grid'

    // Pan & Zoom State for SVG
    let transform = { x: 0, y: 0, scale: 0.85 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    // Grouping repos
    const categoriesMap = {};
    REPOSITORIES.forEach(r => {
      if (!categoriesMap[r.category]) categoriesMap[r.category] = [];
      categoriesMap[r.category].push(r);
    });

    const categoryNames = Object.keys(categoriesMap).sort((a, b) => categoriesMap[b].length - categoriesMap[a].length);

    // Initialize Category Filters
    const filterBar = document.getElementById('categoryFilterBar');
    categoryNames.forEach(cat => {
      const meta = CATEGORY_META[cat] || { color: '#6366f1', icon: '📁' };
      const chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.dataset.category = cat;
      chip.innerHTML = \`<span>\${meta.icon} \${cat}</span><span class="chip-count">\${categoriesMap[cat].length}</span>\`;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = cat;
        renderCurrentView();
      });
      filterBar.appendChild(chip);
    });

    document.querySelector('.filter-chip[data-category="ALL"]').addEventListener('click', (e) => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeCategory = 'ALL';
      renderCurrentView();
    });

    // View Switching
    const viewMapBtn = document.getElementById('viewMapBtn');
    const viewGridBtn = document.getElementById('viewGridBtn');
    const mapContainer = document.getElementById('mindmap-container');
    const gridContainer = document.getElementById('grid-container');

    viewMapBtn.addEventListener('click', () => {
      currentView = 'map';
      viewMapBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      mapContainer.style.display = 'block';
      gridContainer.style.display = 'none';
      renderMindMap();
    });

    viewGridBtn.addEventListener('click', () => {
      currentView = 'grid';
      viewGridBtn.classList.add('active');
      viewMapBtn.classList.remove('active');
      mapContainer.style.display = 'none';
      gridContainer.style.display = 'block';
      renderGrid();
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderCurrentView();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape') {
        closeDrawer();
      }
    });

    function renderCurrentView() {
      if (currentView === 'map') {
        renderMindMap();
      } else {
        renderGrid();
      }
    }

    // Filter helper
    function matchesFilter(repo) {
      if (activeCategory !== 'ALL' && repo.category !== activeCategory) return false;
      if (!searchQuery) return true;

      const q = searchQuery;
      const name = repo.name.toLowerCase();
      const desc = (repo.effectiveDescription || '').toLowerCase();
      const lang = (repo.techStack.primaryLanguage || '').toLowerCase();
      const fws = repo.techStack.frameworks.map(f => f.toLowerCase()).join(' ');
      const libs = repo.techStack.libraries.map(l => l.toLowerCase()).join(' ');
      const tools = repo.techStack.tools.map(t => t.toLowerCase()).join(' ');
      const deps = (repo.techStack.keyDependencies || []).map(d => d.toLowerCase()).join(' ');

      return name.includes(q) || desc.includes(q) || lang.includes(q) || fws.includes(q) || libs.includes(q) || tools.includes(q) || deps.includes(q);
    }

    /* ----------------------------------------------------
       MIND MAP RENDERING (SVG HIERARCHICAL TREE)
       ---------------------------------------------------- */
    const svg = document.getElementById('mindmap-svg');

    function renderMindMap() {
      svg.innerHTML = '';

      const svgWidth = mapContainer.clientWidth;
      const svgHeight = mapContainer.clientHeight;

      const filteredCategories = categoryNames.filter(cat => {
        if (activeCategory !== 'ALL' && cat !== activeCategory) return false;
        const reposInCat = categoriesMap[cat].filter(matchesFilter);
        return reposInCat.length > 0;
      });

      const leftCats = [];
      const rightCats = [];
      filteredCategories.forEach((cat, idx) => {
        if (idx % 2 === 0) rightCats.push(cat);
        else leftCats.push(cat);
      });

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.id = 'viewport-group';
      g.setAttribute('transform', \`translate(\${transform.x}, \${transform.y}) scale(\${transform.scale})\`);
      svg.appendChild(g);

      const rootX = svgWidth / 2;
      const rootY = svgHeight / 2;

      const linksG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      linksG.id = 'links-group';
      const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodesG.id = 'nodes-group';
      g.appendChild(linksG);
      g.appendChild(nodesG);

      // Render root node
      const rootG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      rootG.setAttribute('transform', \`translate(\${rootX}, \${rootY})\`);
      rootG.className = 'node-group root-node';
      rootG.innerHTML = \`
        <rect x="-130" y="-36" width="260" height="72" rx="16" fill="#0f172a" stroke="rgba(99,102,241,0.6)" stroke-width="2.5" class="root-node-rect"/>
        <circle cx="-90" cy="0" r="20" fill="url(#rootGrad)"/>
        <text x="-90" y="5" text-anchor="middle" font-size="16" fill="#fff" font-weight="bold">SP</text>
        <text x="-56" y="-6" font-size="15" font-weight="700" fill="#ffffff" font-family="Plus Jakarta Sans">Sandro Peixoto</text>
        <text x="-56" y="16" font-size="12" fill="#06b6d4" font-family="Plus Jakarta Sans" font-weight="600">\${repos.length} Repositórios GitHub</text>
      \`;
      nodesG.appendChild(rootG);

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = \`
        <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      \`;
      svg.appendChild(defs);

      function layoutSide(sideCats, direction) {
        let startY = rootY - (sideCats.length * 150) / 2 + 50;

        sideCats.forEach((cat, catIdx) => {
          const catMeta = CATEGORY_META[cat] || { color: '#6366f1', icon: '📁' };
          const reposInCat = categoriesMap[cat].filter(matchesFilter);
          const isCollapsed = collapsedCategories.has(cat);

          const catX = rootX + direction * 380;
          const catY = startY + catIdx * 190;

          const link = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const cpX1 = rootX + direction * 150;
          const cpY1 = rootY;
          const cpX2 = catX - direction * 120;
          const cpY2 = catY;
          link.setAttribute('d', \`M \${rootX + direction * 130} \${rootY} C \${cpX1} \${cpY1}, \${cpX2} \${cpY2}, \${catX - direction * 110} \${catY}\`);
          link.setAttribute('stroke', catMeta.color);
          link.setAttribute('stroke-width', '3');
          link.setAttribute('stroke-opacity', '0.6');
          link.setAttribute('fill', 'none');
          link.className = 'branch-link';
          linksG.appendChild(link);

          const catG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          catG.setAttribute('transform', \`translate(\${catX}, \${catY})\`);
          catG.className = 'node-group cat-node';
          catG.style.cursor = 'pointer';

          catG.innerHTML = \`
            <rect x="-115" y="-24" width="230" height="48" rx="12" fill="#1e293b" stroke="\${catMeta.color}" stroke-width="2" stroke-opacity="0.8"/>
            <text x="0" y="-3" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff" font-family="Plus Jakarta Sans">\${catMeta.icon} \${cat}</text>
            <text x="0" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="\${catMeta.color}">\${reposInCat.length} repos \${isCollapsed ? ' (recolhido)' : ' (aberto)'}</text>
          \`;

          catG.addEventListener('click', (e) => {
            e.stopPropagation();
            if (collapsedCategories.has(cat)) {
              collapsedCategories.delete(cat);
            } else {
              collapsedCategories.add(cat);
            }
            renderMindMap();
          });

          nodesG.appendChild(catG);

          if (!isCollapsed) {
            const childSpacing = 42;
            const totalChildH = reposInCat.length * childSpacing;
            const childStartY = catY - totalChildH / 2 + childSpacing / 2;

            reposInCat.forEach((repo, rIdx) => {
              const childX = catX + direction * 280;
              const childY = childStartY + rIdx * childSpacing;

              const childLink = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              const ccpX1 = catX + direction * 115;
              const ccpY1 = catY;
              const ccpX2 = childX - direction * 90;
              const ccpY2 = childY;
              childLink.setAttribute('d', \`M \${catX + direction * 115} \${catY} C \${ccpX1} \${ccpY1}, \${ccpX2} \${ccpY2}, \${childX - direction * 90} \${childY}\`);
              childLink.setAttribute('stroke', catMeta.color);
              childLink.setAttribute('stroke-width', '1.5');
              childLink.setAttribute('stroke-opacity', '0.45');
              childLink.setAttribute('fill', 'none');
              linksG.appendChild(childLink);

              const repoG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              repoG.setAttribute('transform', \`translate(\${childX}, \${childY})\`);
              repoG.className = 'node-group repo-node';
              repoG.style.cursor = 'pointer';

              const langColor = LANG_COLORS[repo.techStack.primaryLanguage] || '#94a3b8';
              const isPrivate = repo.isPrivate;

              let displayName = repo.name;
              if (displayName.length > 20) displayName = displayName.substring(0, 18) + '…';

              repoG.innerHTML = \`
                <rect x="-95" y="-16" width="190" height="32" rx="8" fill="#0f172a" stroke="rgba(255,255,255,0.12)" stroke-width="1.2"/>
                <circle cx="-82" cy="0" r="4.5" fill="\${langColor}"/>
                <text x="-70" y="4" font-size="11" font-weight="600" fill="#f8fafc" font-family="Plus Jakarta Sans">\${displayName}</text>
                <text x="75" y="4" font-size="9" text-anchor="end" fill="var(--text-dim)" font-family="JetBrains Mono">\${isPrivate ? '🔒' : '🌐'}</text>
              \`;

              repoG.addEventListener('click', (e) => {
                e.stopPropagation();
                openDrawer(repo);
              });

              nodesG.appendChild(repoG);
            });
          }
        });
      }

      layoutSide(rightCats, 1);
      layoutSide(leftCats, -1);
    }

    // Pan & Zoom Event Listeners
    let pointerOrigin = { x: 0, y: 0 };

    mapContainer.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node-group') || e.target.closest('.map-controls') || e.target.closest('.map-legend')) return;
      isDragging = true;
      pointerOrigin = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - pointerOrigin.x;
      const dy = e.clientY - pointerOrigin.y;
      pointerOrigin = { x: e.clientX, y: e.clientY };

      transform.x += dx;
      transform.y += dy;

      const g = document.getElementById('viewport-group');
      if (g) g.setAttribute('transform', \`translate(\${transform.x}, \${transform.y}) scale(\${transform.scale})\`);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    mapContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.2), 2.5);

      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      transform.x = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
      transform.y = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
      transform.scale = newScale;

      const g = document.getElementById('viewport-group');
      if (g) g.setAttribute('transform', \`translate(\${transform.x}, \${transform.y}) scale(\${transform.scale})\`);
    }, { passive: false });

    // Controls
    document.getElementById('zoomInBtn').addEventListener('click', () => {
      transform.scale = Math.min(transform.scale * 1.25, 2.5);
      const g = document.getElementById('viewport-group');
      if (g) g.setAttribute('transform', \`translate(\${transform.x}, \${transform.y}) scale(\${transform.scale})\`);
    });

    document.getElementById('zoomOutBtn').addEventListener('click', () => {
      transform.scale = Math.max(transform.scale * 0.8, 0.2);
      const g = document.getElementById('viewport-group');
      if (g) g.setAttribute('transform', \`translate(\${transform.x}, \${transform.y}) scale(\${transform.scale})\`);
    });

    document.getElementById('zoomResetBtn').addEventListener('click', () => {
      transform = { x: 0, y: 0, scale: 0.85 };
      renderMindMap();
    });

    /* ----------------------------------------------------
       GRID VIEW RENDERING
       ---------------------------------------------------- */
    const gridContent = document.getElementById('gridContent');

    function renderGrid() {
      gridContent.innerHTML = '';

      let totalVisible = 0;

      categoryNames.forEach(cat => {
        if (activeCategory !== 'ALL' && cat !== activeCategory) return;
        const reposInCat = categoriesMap[cat].filter(matchesFilter);
        if (reposInCat.length === 0) return;

        totalVisible += reposInCat.length;
        const meta = CATEGORY_META[cat] || { color: '#6366f1', icon: '📁' };

        const sec = document.createElement('div');
        sec.className = 'grid-category-section';

        sec.innerHTML = \`
          <div class="grid-category-header">
            <h2 class="grid-category-title" style="color:\${meta.color}">
              <span>\${meta.icon}</span> \${cat}
              <span class="chip-count" style="font-size:12px; background:rgba(255,255,255,0.08);">\${reposInCat.length}</span>
            </h2>
          </div>
          <div class="grid-cards" id="cards-\${cat.replace(/\\W+/g, '-')}"></div>
        \`;

        gridContent.appendChild(sec);

        const cardsContainer = sec.querySelector(\`#cards-\${cat.replace(/\\W+/g, '-')}\`);

        reposInCat.forEach(repo => {
          const card = document.createElement('div');
          card.className = 'repo-card';
          card.style.setProperty('--card-accent', meta.color);

          const isPrivate = repo.isPrivate;
          const lang = repo.techStack.primaryLanguage;
          const langColor = LANG_COLORS[lang] || '#94a3b8';
          const desc = repo.effectiveDescription || 'Sem descrição cadastrada.';

          const tags = [];
          if (lang && lang !== 'N/A') tags.push(\`<span class="tag-pill" style="border-left:3px solid \${langColor}">\${lang}</span>\`);
          repo.techStack.frameworks.slice(0, 2).forEach(f => tags.push(\`<span class="tag-pill framework">\${f}</span>\`));
          repo.techStack.tools.slice(0, 2).forEach(t => tags.push(\`<span class="tag-pill ai">\${t}</span>\`));
          if (repo.techStack.cloud.includes('Firebase')) tags.push(\`<span class="tag-pill" style="color:#f59e0b">Firebase</span>\`);
          if (repo.techStack.cloud.includes('Cloudflare Workers')) tags.push(\`<span class="tag-pill" style="color:#f97316">Cloudflare</span>\`);
          if (repo.techStack.tools.includes('Docker')) tags.push(\`<span class="tag-pill" style="color:#0ea5e9">Docker</span>\`);

          card.innerHTML = \`
            <div>
              <div class="repo-card-header">
                <span class="repo-card-name">\${repo.name}</span>
                <span class="repo-card-badge \${isPrivate ? 'badge-private' : 'badge-public'}">\${isPrivate ? '🔒 Privado' : '🌐 Público'}</span>
              </div>
              <p class="repo-card-desc">\${desc}</p>
            </div>
            <div class="repo-card-tags">\${tags.join('')}</div>
          \`;

          card.addEventListener('click', () => openDrawer(repo));
          cardsContainer.appendChild(card);
        });
      });

      if (totalVisible === 0) {
        gridContent.innerHTML = \`
          <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
            <div style="font-size:36px; margin-bottom:12px;">🔍</div>
            <h3>Nenhum repositório encontrado</h3>
            <p style="font-size:13px; margin-top:4px;">Tente ajustar o termo da busca ou o filtro de categoria.</p>
          </div>
        \`;
      }
    }

    /* ----------------------------------------------------
       DETAIL DRAWER / MODAL
       ---------------------------------------------------- */
    const drawer = document.getElementById('detail-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');

    function openDrawer(repo) {
      document.getElementById('drawerTitle').textContent = repo.name;
      document.getElementById('drawerCategory').textContent = repo.category;
      document.getElementById('drawerGithubLink').href = repo.url;

      const badgesContainer = document.getElementById('drawerBadges');
      badgesContainer.innerHTML = \`
        <span class="repo-card-badge \${repo.isPrivate ? 'badge-private' : 'badge-public'}">\${repo.isPrivate ? '🔒 Repositório Privado' : '🌐 Repositório Público'}</span>
        \${repo.isFork ? '<span class="repo-card-badge" style="background:rgba(255,255,255,0.08); color:#cbd5e1;">Fork</span>' : ''}
      \`;

      const updatedDate = new Date(repo.updatedAt).toLocaleDateString('pt-BR');
      const createdDate = new Date(repo.createdAt).toLocaleDateString('pt-BR');
      document.getElementById('drawerDates').textContent = \`Criado em: \${createdDate} • Atualizado: \${updatedDate}\`;

      document.getElementById('drawerDesc').textContent = repo.effectiveDescription || 'Nenhuma descrição fornecida no repositório.';

      const langBar = document.getElementById('drawerLangBar');
      const langLegend = document.getElementById('drawerLangLegend');
      langBar.innerHTML = '';
      langLegend.innerHTML = '';

      if (repo.techStack.languages && repo.techStack.languages.length > 0) {
        repo.techStack.languages.forEach(l => {
          const color = LANG_COLORS[l.name] || '#94a3b8';
          const segment = document.createElement('div');
          segment.className = 'lang-bar-segment';
          segment.style.width = \`\${l.percentage}%\`;
          segment.style.backgroundColor = color;
          segment.title = \`\${l.name}: \${l.percentage}%\`;
          langBar.appendChild(segment);

          const legendItem = document.createElement('div');
          legendItem.className = 'lang-legend-item';
          legendItem.innerHTML = \`<div class="lang-dot" style="background:\${color}"></div><span>\${l.name} <strong>\${l.percentage}%</strong></span>\`;
          langLegend.appendChild(legendItem);
        });
      } else {
        langBar.innerHTML = \`<div class="lang-bar-segment" style="width:100%; background:#475569;"></div>\`;
        langLegend.innerHTML = \`<span style="color:var(--text-dim); font-size:12px;">\${repo.techStack.primaryLanguage || 'Não detectado'}</span>\`;
      }

      const fwContainer = document.getElementById('drawerFrameworks');
      fwContainer.innerHTML = '';
      const allUi = [...repo.techStack.frameworks, ...repo.techStack.libraries];
      if (allUi.length > 0) {
        allUi.forEach(item => {
          const tag = document.createElement('div');
          tag.className = 'stack-tag';
          tag.style.background = 'rgba(99, 102, 241, 0.15)';
          tag.style.borderColor = 'rgba(99, 102, 241, 0.3)';
          tag.style.color = '#c7d2fe';
          tag.innerHTML = \`<span>⚡</span> \${item}\`;
          fwContainer.appendChild(tag);
        });
      } else {
        fwContainer.innerHTML = '<span style="font-size:12px; color:var(--text-dim);">Nenhum framework frontend detectado no manifesto raiz.</span>';
      }

      const infraContainer = document.getElementById('drawerInfra');
      infraContainer.innerHTML = '';
      const allInfra = [...repo.techStack.cloud, ...repo.techStack.databases, ...repo.techStack.tools];
      if (allInfra.length > 0) {
        allInfra.forEach(item => {
          const tag = document.createElement('div');
          tag.className = 'stack-tag';
          tag.style.background = 'rgba(6, 182, 212, 0.12)';
          tag.style.borderColor = 'rgba(6, 182, 212, 0.25)';
          tag.style.color = '#a5f3fc';
          tag.innerHTML = \`<span>☁️</span> \${item}\`;
          infraContainer.appendChild(tag);
        });
      } else {
        infraContainer.innerHTML = '<span style="font-size:12px; color:var(--text-dim);">Nenhum serviço em nuvem ou banco configurado especificamente.</span>';
      }

      const depsContainer = document.getElementById('drawerDeps');
      depsContainer.innerHTML = '';
      const deps = repo.techStack.keyDependencies || [];
      if (deps.length > 0) {
        deps.forEach(dep => {
          const tag = document.createElement('div');
          tag.className = 'tag-pill';
          tag.textContent = dep;
          depsContainer.appendChild(tag);
        });
      } else {
        depsContainer.innerHTML = '<span style="font-size:12px; color:var(--text-dim);">Manifesto de pacotes sem dependências externas adicionais.</span>';
      }

      drawer.classList.add('open');
      drawerBackdrop.classList.add('open');
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      drawerBackdrop.classList.remove('open');
    }

    drawerCloseBtn.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    // Initial render
    window.addEventListener('DOMContentLoaded', () => {
      renderMindMap();
    });
    window.addEventListener('resize', () => {
      if (currentView === 'map') renderMindMap();
    });
    renderMindMap();
  </script>
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent, 'utf8');
console.log('HTML Mindmap successfully generated at: ' + outputFile);
