/**
 * TECHCATALOG.JS - Catálogo Interactivo, Buscador y Filtros de Tecnologías AoE2
 * Muestra el catálogo dinámico de tecnologías militares, económicas, coronas y soporte.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.techCatalog = exports;
    global.initTechCatalog = exports.initTechCatalog;
    global.filterTechs = exports.filterTechs;
    global.renderTechsGrid = exports.renderTechsGrid;
    global.AoE2TechCatalog = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const state = {
    currentCiv: 'all',
    currentCategory: 'all',
    currentAge: 'all',
    searchQuery: '',
    techs: [],
    initialized: false
  };

  const DOM = {
    view: null,
    searchInput: null,
    clearSearchBtn: null,
    civSelect: null,
    catButtons: null,
    ageButtons: null,
    countDisplay: null,
    grid: null,
    emptyMsg: null,
    backToMenuBtn: null
  };

  function getTechModule() {
    if (typeof AoE2Techs !== 'undefined') return AoE2Techs;
    if (typeof window !== 'undefined' && window.AoE2Techs) return window.AoE2Techs;
    if (typeof require === 'function') {
      try { return require('./techs.js'); } catch (e) {}
    }
    return null;
  }

  function getCivModifiers() {
    if (typeof civModifiers !== 'undefined') return civModifiers;
    if (typeof window !== 'undefined' && window.civModifiers) return window.civModifiers;
    if (typeof require === 'function') {
      try { return require('./civModifiers.js'); } catch (e) {}
    }
    return null;
  }

  function cacheDOM() {
    DOM.view = document.getElementById('techs-view');
    DOM.searchInput = document.getElementById('tech-search-input');
    DOM.clearSearchBtn = document.getElementById('clear-tech-search-btn');
    DOM.civSelect = document.getElementById('tech-civ-select-catalog');
    DOM.catButtons = document.querySelectorAll('.tech-cat-btn');
    DOM.ageButtons = document.querySelectorAll('.tech-age-btn');
    DOM.countDisplay = document.getElementById('techs-count-display');
    DOM.grid = document.getElementById('techs-grid');
    DOM.emptyMsg = document.getElementById('no-techs-msg');
    DOM.backToMenuBtn = document.getElementById('techs-back-to-menu-btn');
  }

  /**
   * Inicializa el catálogo interactivo de tecnologías
   */
  function initTechCatalog(dataJson, stringsJson) {
    cacheDOM();
    const tMod = getTechModule();
    if (!tMod) {
      console.warn('initTechCatalog: Módulo AoE2Techs no encontrado');
      return;
    }

    if (dataJson) {
      state.techs = tMod.parseTechs(dataJson, stringsJson || {});
    } else {
      state.techs = tMod.getAllTechs();
    }

    populateCivFilter(dataJson?.civs);
    bindEvents();
    renderCatalog();
    state.initialized = true;
  }

  function populateCivFilter(civsData) {
    if (!DOM.civSelect) return;
    const currentVal = DOM.civSelect.value || 'all';

    let civNames = [];
    if (civsData && typeof civsData === 'object') {
      civNames = Object.keys(civsData).sort();
    } else {
      civNames = [
        'Armenians', 'Aztecs', 'Bengalis', 'Berbers', 'Bohemians', 'Britons', 'Bulgarians', 'Burgundians',
        'Burmese', 'Byzantines', 'Celts', 'Chinese', 'Cumans', 'Danes', 'Dravidians', 'Ethiopians',
        'Franks', 'Georgians', 'Goths', 'Gurjaras', 'Hindustanis', 'Huns', 'Incas', 'Italians',
        'Japanese', 'Jurchens', 'Khitans', 'Khmer', 'Koreans', 'Lithuanians', 'Magyars', 'Malay',
        'Malians', 'Mapuche', 'Mayans', 'Mongols', 'Muisca', 'Persians', 'Poles', 'Portuguese',
        'Romans', 'Saracens', 'Saxons', 'Shu', 'Sicilians', 'Slavs', 'Spanish', 'Tatars',
        'Teutons', 'Tupi', 'Turks', 'Varangians', 'Vietnamese', 'Vikings', 'Wei', 'Wu'
      ];
    }

    DOM.civSelect.innerHTML = `
      <option value="all">🏛️ Todas las Civilizaciones</option>
      ${civNames.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('')}
    `;
  }

  function bindEvents() {
    // Buscador
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (DOM.clearSearchBtn) {
          DOM.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        renderCatalog();
      });
    }

    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.addEventListener('click', () => {
        if (DOM.searchInput) {
          DOM.searchInput.value = '';
          state.searchQuery = '';
          DOM.clearSearchBtn.style.display = 'none';
          DOM.searchInput.focus();
          renderCatalog();
        }
      });
    }

    // Selector de Civilización
    if (DOM.civSelect) {
      DOM.civSelect.addEventListener('change', (e) => {
        state.currentCiv = e.target.value;
        renderCatalog();
      });
    }

    // Filtros de Categoría
    if (DOM.catButtons) {
      DOM.catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.catButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.currentCategory = btn.getAttribute('data-tech-cat') || 'all';
          renderCatalog();
        });
      });
    }

    // Filtros de Edad
    if (DOM.ageButtons) {
      DOM.ageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.ageButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.currentAge = btn.getAttribute('data-tech-age') || 'all';
          renderCatalog();
        });
      });
    }

    // Botón Volver al Menú Principal
    if (DOM.backToMenuBtn) {
      DOM.backToMenuBtn.addEventListener('click', () => {
        if (typeof window.showView === 'function') {
          window.showView('main-menu-view');
        } else {
          const views = document.querySelectorAll('.view-section');
          views.forEach(v => v.classList.remove('active'));
          const mm = document.getElementById('main-menu-view');
          if (mm) mm.classList.add('active');
          const homeBtn = document.getElementById('nav-home-btn');
          if (homeBtn) homeBtn.style.display = 'none';
        }
      });
    }
  }

  /**
   * Filtra las tecnologías en base a búsqueda, civilización, categoría y edad
   */
  function filterTechs() {
    const tMod = getTechModule();
    if (!tMod) return [];
    const all = tMod.getAllTechs();

    return all.filter(tech => {
      // 0. Excluir tecnologías obsoletas, automáticas o sin panel de investigación en DE
      const isActionable = typeof isActionableTech === 'function' 
        ? isActionableTech(tech.id, tech)
        : (tMod && typeof tMod.isActionableTech === 'function' ? tMod.isActionableTech(tech.id, tech) : true);
      if (!isActionable) {
        return false;
      }

      // 1. Filtro por Edad
      if (state.currentAge !== 'all' && Number(state.currentAge) !== tech.age) {
        return false;
      }

      // 2. Filtro por Categoría
      if (state.currentCategory !== 'all' && state.currentCategory !== tech.category) {
        return false;
      }

      // 3. Filtro por Civilización
      if (state.currentCiv !== 'all') {
        const normCiv = state.currentCiv.toLowerCase().trim();
        const hasCiv = tech.civs.some(c => c.toLowerCase().trim() === normCiv);
        if (!hasCiv && tech.uniqueCiv?.toLowerCase().trim() !== normCiv) {
          return false;
        }
      }

      // 4. Filtro por Búsqueda de Texto
      if (state.searchQuery) {
        const q = state.searchQuery;
        const nameMatch = (tech.name || '').toLowerCase().includes(q);
        const intMatch = (tech.internal_name || '').toLowerCase().includes(q);
        const descMatch = (tech.description || '').toLowerCase().includes(q);
        const bNameMatch = (tech.buildingInfo?.name || '').toLowerCase().includes(q);
        const catMatch = (tech.categoryInfo?.label || '').toLowerCase().includes(q);

        if (!nameMatch && !intMatch && !descMatch && !bNameMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Renderiza la cuadrícula de tecnologías
   */
  function renderCatalog() {
    cacheDOM();
    if (!DOM.grid) return;

    const filtered = filterTechs();
    const tMod = getTechModule();
    const totalCount = tMod ? tMod.getAllTechs().length : filtered.length;

    // Actualizar contador
    if (DOM.countDisplay) {
      if (state.currentCiv !== 'all') {
        DOM.countDisplay.textContent = `Mostrando ${filtered.length} tecnologías disponibles para ${state.currentCiv}`;
      } else {
        DOM.countDisplay.textContent = `Mostrando ${filtered.length} de ${totalCount} tecnologías registradas`;
      }
    }

    // Manejar estado vacío
    if (filtered.length === 0) {
      DOM.grid.innerHTML = '';
      if (DOM.emptyMsg) DOM.emptyMsg.style.display = 'block';
      return;
    }

    if (DOM.emptyMsg) DOM.emptyMsg.style.display = 'none';

    const cMod = getCivModifiers();
    const isCustomCiv = state.currentCiv !== 'all' && state.currentCiv !== 'Generic';

    DOM.grid.innerHTML = filtered.map(tech => {
      // Calcular costes dinámicos si hay una civ seleccionada
      let costData = { cost: tech.cost, researchTime: tech.researchTime, bonuses: [] };
      if (cMod && typeof cMod.calculateTechCost === 'function' && isCustomCiv) {
        costData = cMod.calculateTechCost(tech.id, state.currentCiv, tech.age, tech.cost, tech.researchTime, tech.category);
      }
      const { cost, researchTime, bonuses } = costData;
      const hasDiscount = bonuses.length > 0;

      const AGE_NAMES = {
        1: { name: 'Alta Edad Media', class: 'age-1' },
        2: { name: 'Edad Feudal', class: 'age-2' },
        3: { name: 'Edad de los Castillos', class: 'age-3' },
        4: { name: 'Edad Imperial', class: 'age-4' }
      };
      const ageInfo = AGE_NAMES[tech.age] || AGE_NAMES[1];

      return `
        <div class="tech-catalog-card parchment-card bevel-raised ${tech.isUnique ? 'tech-unique-card' : ''}" 
             data-tech-id="${tech.id}" 
             tabindex="0" 
             role="button" 
             title="Haz clic para ver la Ficha Técnica de ${tech.name}">
          
          <!-- Encabezado de la Tarjeta -->
          <div class="tech-card-header">
            <div class="tech-card-icon-wrapper">
              <img src="${tech.icon}" alt="${tech.name}" class="tech-card-icon" onerror="this.onerror=null; this.src='img/missing.png';">
              <span class="tech-card-age-pip ${ageInfo.class}" title="${ageInfo.name}"></span>
            </div>

            <div class="tech-card-badge-column">
              <span class="tech-card-cat-badge" style="border-color: ${tech.categoryInfo.color}; color: ${tech.categoryInfo.color};">
                ${tech.categoryInfo.emoji} ${tech.categoryInfo.label}
              </span>
              <span class="tech-card-building-badge" title="Investigada en ${tech.buildingInfo.name}">
                <img src="${tech.buildingInfo.icon}" class="tiny-building-img" alt="" onerror="this.style.display='none';">
                ${tech.buildingInfo.name}
              </span>
            </div>
          </div>

          <!-- Títulos y descripción -->
          <div class="tech-card-body">
            <h4 class="tech-card-title">${tech.name}</h4>
            <span class="tech-card-subtitle">${tech.internal_name}</span>

            ${tech.isUnique ? `
              <div class="tech-card-crown-banner ${tech.crownType === 'castle' ? 'crown-silver' : 'crown-gold'}">
                <span>👑 ${tech.crownType === 'castle' ? 'Corona de Castillos' : 'Corona Imperial'}</span>
                <strong>${tech.uniqueCiv || ''}</strong>
              </div>
            ` : ''}

            <p class="tech-card-desc-snippet">${tech.description || 'Mejora estratégica y táctica en el árbol tecnológico.'}</p>
          </div>

          <!-- Fila de Costes y Tiempo -->
          <div class="tech-card-footer">
            <div class="tech-cost-pills">
              ${cost.Food > 0 ? `
                <span class="tech-res-pill food ${hasDiscount && cost.Food < tech.cost.Food ? 'res-discount' : ''}" title="Alimento: ${cost.Food}">
                  <img src="img/food.png" alt="Alimento"> ${cost.Food}
                </span>
              ` : ''}
              ${cost.Wood > 0 ? `
                <span class="tech-res-pill wood ${hasDiscount && cost.Wood < tech.cost.Wood ? 'res-discount' : ''}" title="Madera: ${cost.Wood}">
                  <img src="img/wood.png" alt="Madera"> ${cost.Wood}
                </span>
              ` : ''}
              ${cost.Gold > 0 ? `
                <span class="tech-res-pill gold ${hasDiscount && cost.Gold < tech.cost.Gold ? 'res-discount' : ''}" title="Oro: ${cost.Gold}">
                  <img src="img/gold.png" alt="Oro"> ${cost.Gold}
                </span>
              ` : ''}
              ${cost.Stone > 0 ? `
                <span class="tech-res-pill stone ${hasDiscount && cost.Stone < tech.cost.Stone ? 'res-discount' : ''}" title="Piedra: ${cost.Stone}">
                  <img src="img/stone.png" alt="Piedra"> ${cost.Stone}
                </span>
              ` : ''}
              ${cost.Food === 0 && cost.Wood === 0 && cost.Gold === 0 && cost.Stone === 0 ? `
                <span class="tech-res-pill free" title="Gratuita">Gratis</span>
              ` : ''}
            </div>

            <div class="tech-time-pill" title="Tiempo de Investigación: ${researchTime}s">
              ⏳ ${researchTime}s
            </div>
          </div>

          <!-- Indicador hover para inspección -->
          <div class="tech-card-hover-hint">
            <span>🔍 Ver Ficha Técnica</span>
          </div>

        </div>
      `;
    }).join('');

    // Asignar listeners de clic a cada tarjeta
    const cards = DOM.grid.querySelectorAll('.tech-catalog-card');
    cards.forEach(card => {
      const id = Number(card.getAttribute('data-tech-id'));
      const handler = () => {
        if (typeof window.openTechDeepDive === 'function') {
          window.openTechDeepDive(id, state.currentCiv);
        } else if (typeof openTechDeepDive === 'function') {
          openTechDeepDive(id, state.currentCiv);
        }
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });

    injectCatalogStyles();
  }

  function injectCatalogStyles() {
    if (document.getElementById('tech-catalog-injected-styles')) return;
    const style = document.createElement('style');
    style.id = 'tech-catalog-injected-styles';
    style.textContent = `
      .tech-catalog-card {
        background: rgba(30, 18, 9, 0.85);
        border: 2px solid #5a3819;
        border-radius: 6px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
        position: relative;
        overflow: hidden;
      }
      .tech-catalog-card:hover {
        transform: translateY(-4px);
        border-color: #d4af37;
        box-shadow: 0 8px 24px rgba(0,0,0,0.7), 0 0 12px rgba(212,175,55,0.3);
      }
      .tech-catalog-card:focus-visible {
        outline: 2px solid #f1c40f;
        outline-offset: 2px;
      }
      .tech-unique-card {
        border-color: #935116;
        background: linear-gradient(180deg, rgba(45, 25, 12, 0.9) 0%, rgba(25, 14, 7, 0.95) 100%);
      }
      .tech-card-header {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 8px;
      }
      .tech-card-icon-wrapper {
        position: relative;
        width: 48px;
        height: 48px;
        background: #110904;
        border: 1px solid #d4af37;
        border-radius: 4px;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tech-card-icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .tech-card-age-pip {
        position: absolute;
        bottom: -3px;
        right: -3px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #110904;
      }
      .tech-card-badge-column {
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow: hidden;
      }
      .tech-card-cat-badge {
        font-size: 0.72rem;
        padding: 1px 6px;
        border-radius: 3px;
        border: 1px solid;
        background: rgba(0,0,0,0.3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tech-card-building-badge {
        font-size: 0.72rem;
        color: #cfbc9f;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tiny-building-img {
        width: 14px;
        height: 14px;
        object-fit: contain;
      }
      .tech-card-body {
        flex: 1;
        margin-bottom: 8px;
      }
      .tech-card-title {
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 1rem;
        color: #f7d58b;
        margin: 0 0 2px 0;
        line-height: 1.25;
      }
      .tech-card-subtitle {
        font-size: 0.75rem;
        color: #a89076;
        display: block;
        margin-bottom: 6px;
      }
      .tech-card-crown-banner {
        font-size: 0.72rem;
        padding: 2px 6px;
        border-radius: 3px;
        margin-bottom: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .tech-card-crown-banner.crown-silver {
        background: rgba(189, 195, 199, 0.2);
        border: 1px solid #bdc3c7;
        color: #ecf0f1;
      }
      .tech-card-crown-banner.crown-gold {
        background: rgba(243, 156, 18, 0.2);
        border: 1px solid #f39c12;
        color: #f1c40f;
      }
      .tech-card-desc-snippet {
        font-size: 0.78rem;
        color: #d8c7b0;
        line-height: 1.35;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .tech-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 8px;
        border-top: 1px solid rgba(212,175,55,0.15);
        font-size: 0.76rem;
      }
      .tech-cost-pills {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .tech-res-pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 1px 5px;
        border-radius: 3px;
        background: rgba(0,0,0,0.4);
        color: #f5f5f5;
        font-family: var(--font-serif, serif);
        font-weight: bold;
        font-size: 0.75rem;
      }
      .tech-res-pill img {
        width: 14px;
        height: 14px;
        object-fit: contain;
      }
      .tech-res-pill.res-discount {
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.4);
      }
      .tech-res-pill.free {
        color: #2ecc71;
        border: 1px solid #2ecc71;
        background: rgba(46, 204, 113, 0.2);
      }
      .tech-time-pill {
        color: #bfa382;
        font-size: 0.74rem;
      }
      .tech-card-hover-hint {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(212, 175, 55, 0.95);
        color: #1a0f07;
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 0.75rem;
        font-weight: bold;
        text-align: center;
        padding: 3px 0;
        transform: translateY(100%);
        transition: transform 0.2s ease;
      }
      .tech-catalog-card:hover .tech-card-hover-hint {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  return {
    initTechCatalog,
    filterTechs,
    renderCatalog
  };
});
