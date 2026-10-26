/**
 * BUILDINGDEEPDIVE.JS - Ficha Técnica Avanzada y Modal "Deep Dive" para Edificios
 * Inspirado en la arquitectura visual e interactiva de AoE Database.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.buildingDeepDive = exports;
    global.openBuildingDeepDive = exports.openBuildingDeepDive;
    global.closeBuildingDeepDive = exports.closeBuildingDeepDive;
    global.updateBuildingView = exports.updateBuildingView;
    global.getBaseBuilding = exports.getBaseBuilding;
    global.setModalCiv = exports.setModalCiv;
    global.getActiveGlobalCiv = exports.getActiveGlobalCiv;
    global.getCivDisplayName = exports.getCivDisplayName;
    global.CIVILIZATIONS = exports.CIVILIZATIONS;
    global.ALL_CIVILIZATIONS = exports.ALL_CIVILIZATIONS;
    global.populateCivSelector = exports.populateCivSelector;
    global.AoE2BuildingDeepDive = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Catálogo Maestro de Civilizaciones (Single Source of Truth)
  let civsMod = null;
  if (typeof civilizationsModule !== 'undefined') civsMod = civilizationsModule;
  else if (typeof window !== 'undefined' && window.civilizationsModule) civsMod = window.civilizationsModule;
  else if (typeof require === 'function') {
    try { civsMod = require('./civilizations.js'); } catch (e) {}
  }

  const CIVILIZATIONS_LIST = (civsMod && civsMod.CIVILIZATIONS) ? civsMod.CIVILIZATIONS : [
    { id: 'generic', name: 'Genérico', official: false },
    // 56 civilizaciones vigentes (oficiales + facciones mod - sin Holandeses)
    { id: 'armenians', name: 'Armenios', official: true },
    { id: 'aztecs', name: 'Aztecas', official: true },
    { id: 'bengalis', name: 'Bengalíes', official: true },
    { id: 'berbers', name: 'Bereberes', official: true },
    { id: 'burmese', name: 'Birmanos', official: true },
    { id: 'byzantines', name: 'Bizantinos', official: true },
    { id: 'bohemians', name: 'Bohemios', official: true },
    { id: 'burgundians', name: 'Borgoñones', official: true },
    { id: 'britons', name: 'Britanos', official: true },
    { id: 'bulgarians', name: 'Búlgaros', official: true },
    { id: 'celts', name: 'Celtas', official: true },
    { id: 'chinese', name: 'Chinos', official: true },
    { id: 'koreans', name: 'Coreanos', official: true },
    { id: 'cumans', name: 'Cumanos', official: true },
    { id: 'danes', name: 'Daneses', official: false },
    { id: 'dravidians', name: 'Dravídicos', official: true },
    { id: 'slavs', name: 'Eslavos', official: true },
    { id: 'spanish', name: 'Españoles', official: true },
    { id: 'ethiopians', name: 'Etíopes', official: true },
    { id: 'franks', name: 'Francos', official: true },
    { id: 'georgians', name: 'Georgianos', official: true },
    { id: 'goths', name: 'Godos', official: true },
    { id: 'gurjaras', name: 'Gurjaras', official: true },
    { id: 'hindustanis', name: 'Hindustaníes', official: true },
    { id: 'huns', name: 'Hunos', official: true },
    { id: 'incas', name: 'Incas', official: true },
    { id: 'italians', name: 'Italianos', official: true },
    { id: 'japanese', name: 'Japoneses', official: true },
    { id: 'khmer', name: 'Jemeres', official: true },
    { id: 'jurchens', name: 'Jurchen', official: false },
    { id: 'khitans', name: 'Khitanes', official: false },
    { id: 'lithuanians', name: 'Lituanos', official: true },
    { id: 'magyars', name: 'Magiares', official: true },
    { id: 'malay', name: 'Malayos', official: true },
    { id: 'malians', name: 'Malienses', official: true },
    { id: 'mapuche', name: 'Mapuches', official: false },
    { id: 'mayans', name: 'Mayas', official: true },
    { id: 'mongols', name: 'Mongoles', official: true },
    { id: 'muisca', name: 'Muiscas', official: false },
    { id: 'persians', name: 'Persas', official: true },
    { id: 'poles', name: 'Polacos', official: true },
    { id: 'portuguese', name: 'Portugueses', official: true },
    { id: 'romans', name: 'Romanos', official: true },
    { id: 'saxons', name: 'Sajones', official: false },
    { id: 'saracens', name: 'Sarracenos', official: true },
    { id: 'shu', name: 'Shu', official: false },
    { id: 'sicilians', name: 'Sicilianos', official: true },
    { id: 'tatars', name: 'Tártaros', official: true },
    { id: 'teutons', name: 'Teutones', official: true },
    { id: 'tupi', name: 'Tupís', official: false },
    { id: 'turks', name: 'Turcos', official: true },
    { id: 'varangians', name: 'Varegos', official: false },
    { id: 'vietnamese', name: 'Vietnamitas', official: true },
    { id: 'vikings', name: 'Vikingos', official: true },
    { id: 'wei', name: 'Wei', official: false },
    { id: 'wu', name: 'Wu', official: false }
  ];

  // Comprobación programática obligatoria (Exactamente 56 civilizaciones jugables)
  const playableCivs = CIVILIZATIONS_LIST.filter(civ => civ.id !== 'generic');
  console.assert(playableCivs.length === 56, `Error: Se esperaban 56 civilizaciones, pero hay ${playableCivs.length}`);
  if (playableCivs.length !== 56) {
    console.error(`[buildingDeepDive] Discrepancia: ${playableCivs.length} civilizaciones encontradas (esperadas: 56)`);
  }

  // Verificación estricta de erradicación de Holandeses
  const hasDutchSpurious = CIVILIZATIONS_LIST.some(c => c.id === 'dutch' || c.name.toLowerCase().includes('holand'));
  console.assert(!hasDutchSpurious, 'Error: Se detectó la entrada espuria Holandeses en buildingDeepDive.js');

  /**
   * Ordena las 56 civilizaciones alfabéticamente A-Z en español con Genérico anclado en index 0.
   */
  function getSortedCivilizations() {
    if (civsMod && typeof civsMod.getSortedCivilizations === 'function') {
      return civsMod.getSortedCivilizations();
    }
    const genericOption = CIVILIZATIONS_LIST.find(civ => civ.id === 'generic') || { id: 'generic', name: 'Genérico', official: false };
    const playable = CIVILIZATIONS_LIST.filter(civ => civ.id !== 'generic');
    const sortedCivs = [...playable].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
    return [genericOption, ...sortedCivs];
  }

  const ALL_CIVILIZATIONS = getSortedCivilizations().map(c => c.name);

  function getCivDisplayName(civKeyOrName) {
    if (!civKeyOrName) return 'Genérico';
    const norm = String(civKeyOrName).toLowerCase().trim();
    if (norm === 'all' || norm === 'generic' || norm === 'genérico') return 'Genérico';
    const found = CIVILIZATIONS_LIST.find(c => c.id === norm || c.name.toLowerCase() === norm);
    if (found) return found.name;
    if (typeof resolveCivKey === 'function') {
      const eng = resolveCivKey(civKeyOrName);
      const byEng = CIVILIZATIONS_LIST.find(c => c.id === eng.toLowerCase());
      if (byEng) return byEng.name;
    }
    return civKeyOrName.charAt(0).toUpperCase() + civKeyOrName.slice(1);
  }

  function getActiveGlobalCiv() {
    if (typeof window !== 'undefined' && window.state) {
      if (window.state.selectedBuildingCiv && window.state.selectedBuildingCiv !== 'all') {
        return window.state.selectedBuildingCiv;
      }
      if (window.state.selectedCiv && window.state.selectedCiv !== 'all') {
        return window.state.selectedCiv;
      }
    }
    if (typeof document !== 'undefined') {
      const bSelect = document.getElementById('building-civ-select-catalog');
      if (bSelect && bSelect.value && bSelect.value !== 'all') return bSelect.value;
      const uSelect = document.getElementById('civ-select');
      if (uSelect && uSelect.value && uSelect.value !== 'all') return uSelect.value;
    }
    return 'generic';
  }

  function setModalCiv(civ) {
    if (!civ || civ === 'all') {
      state.currentCiv = 'generic';
    } else {
      state.currentCiv = civ;
    }
    if (state.isOpen || (state.modalEl && state.modalEl.style.display !== 'none')) {
      updateBuildingView();
    }
  }

  function populateCivSelector(currentSelectedCiv = "generic") {
    const select = document.getElementById("building-civ-select-catalog") || document.getElementById("building-civ-select") || document.querySelector(".civ-selector-dropdown");
    if (!select) return;

    const selectedVal = String(currentSelectedCiv || select.value || state.currentCiv || "generic").toLowerCase();
    const sortedList = getSortedCivilizations();

    select.innerHTML = sortedList.map(civ => {
      const isSelected = (civ.id.toLowerCase() === selectedVal) || (civ.name.toLowerCase() === selectedVal);
      return `<option value="${civ.id}" ${isSelected ? "selected" : ""}>${civ.name}</option>`;
    }).join("");
  }

  // Estado interno del modal Deep Dive
  const state = {
    currentBuildingKey: 'castle',
    currentCiv: 'Genérico',
    currentAge: 3,
    activeTab: 'basic',
    upgrades: {
      masonry: false,
      architecture: false,
      murderHoles: false,
      treadmillCrane: false,
      fletching: false,
      bodkinArrow: false,
      bracer: false,
      chemistry: false,
      ballistics: false,
      arrowslits: false,
      greekFire: false,
      townWatch: false,
      townPatrol: false,
      crenellations: false,
      artillery: false,
      inquisition: false,
      greatWall: false,
      yasama: false,
      svanTowers: false,
      // Mejoras agrícolas y de pastoreo
      horse_collar: false,
      heavy_plow: false,
      crop_rotation: false,
      domestication: false,
      pastoralism: false,
      transhumance: false,
      // Mejoras estructurales y navales
      conscription: false,
      careening: false,
      dryDock: false,
      shipwright: false
    },
    modalEl: null,
    civFilterAvailability: ''
  };

  const AGE_NAMES = {
    1: { name: 'Alta Edad Media', short: 'Dark', color: '#7a6652' },
    2: { name: 'Edad Feudal', short: 'Feudal', color: '#3b7a42' },
    3: { name: 'Edad de los Castillos', short: 'Castillos', color: '#29689e' },
    4: { name: 'Edad Imperial', short: 'Imperial', color: '#9c2222' }
  };

  /**
   * Inicializa o localiza el contenedor del modal en el DOM
   */
  function ensureModalElement() {
    let modal = document.getElementById('building-deep-dive-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'building-deep-dive-modal';
      modal.className = 'building-deep-dive-modal modal-backdrop';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
    state.modalEl = modal;
    return modal;
  }

  /**
   * Obtiene la referencia al registro de edificios
   */
  function getRegistry() {
    if (typeof BUILDING_REGISTRY !== 'undefined') return BUILDING_REGISTRY;
    if (typeof window !== 'undefined' && window.BUILDING_REGISTRY) return window.BUILDING_REGISTRY;
    if (typeof require === 'function') {
      try { return require('./buildings.js').BUILDING_REGISTRY; } catch (e) {}
    }
    return {};
  }

  /**
   * Abre la ficha técnica de un edificio
   */
  function openBuildingDeepDive(buildingKeyOrId, initialCiv = null, initialAge = null) {
    ensureModalElement();
    const reg = getRegistry();
    let building = null;

    if (typeof getBuildingByKey === 'function') {
      building = getBuildingByKey(buildingKeyOrId);
    } else if (typeof window !== 'undefined' && typeof window.getBuildingByKey === 'function') {
      building = window.getBuildingByKey(buildingKeyOrId);
    }

    if (!building) {
      const num = Number(buildingKeyOrId);
      building = Object.values(reg).find(b => b.id === num || b.key === String(buildingKeyOrId).toLowerCase()) || reg.castle;
    }

    state.currentBuildingKey = building ? building.key : 'castle';
    if (initialCiv && initialCiv !== 'all') {
      state.currentCiv = (initialCiv === 'Generic') ? 'Genérico' : initialCiv;
    } else {
      state.currentCiv = getActiveGlobalCiv();
    }
    state.currentAge = initialAge ? Number(initialAge) : (building?.age || 3);
    state.activeTab = 'basic';
    state.civFilterAvailability = '';
    // Limpiar estado de mejoras al abrir nueva ficha técnica
    Object.keys(state.upgrades).forEach(k => { state.upgrades[k] = false; });

    renderModal();
    state.modalEl.style.display = 'flex';
    document.body.classList.add('modal-open');
  }

  /**
   * Cierra el modal
   */
  function closeBuildingDeepDive() {
    if (state.modalEl) {
      state.modalEl.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
  }

  /**
   * Cambia de pestaña activa
   */
  function switchTab(tabKey) {
    state.activeTab = tabKey;
    renderTabContent();
    updateTabButtons();
  }

  /**
   * Obtiene una copia limpia e inmutable de la estructura base desde buildings.js
   */
  function getBaseBuilding(keyOrId) {
    let raw = null;
    if (typeof getBuildingByKey === 'function') {
      raw = getBuildingByKey(keyOrId);
    } else if (typeof window !== 'undefined' && typeof window.getBuildingByKey === 'function') {
      raw = window.getBuildingByKey(keyOrId);
    } else if (typeof require === 'function') {
      try {
        const bMod = require('./buildings.js');
        if (bMod && typeof bMod.getBuildingByKey === 'function') raw = bMod.getBuildingByKey(keyOrId);
      } catch (e) {}
    }
    if (!raw) {
      const reg = getRegistry();
      raw = reg[keyOrId] || Object.values(reg).find(b => b.id === Number(keyOrId) || b.key === String(keyOrId).toLowerCase());
    }
    if (!raw) return null;
    try {
      return JSON.parse(JSON.stringify(raw));
    } catch (e) {
      return { ...raw };
    }
  }

  /**
   * Obtiene las estadísticas recalculadas del edificio actual
   */
  function getEffectiveStats() {
    const building = getBaseBuilding(state.currentBuildingKey) || getBaseBuilding('castle') || {};

    let calcFn = null;
    if (typeof calculateBuildingStats === 'function') calcFn = calculateBuildingStats;
    else if (typeof window !== 'undefined' && typeof window.calculateBuildingStats === 'function') calcFn = window.calculateBuildingStats;
    else if (typeof require === 'function') {
      try { calcFn = require('./civModifiers.js').calculateBuildingStats; } catch (e) {}
    }

    if (calcFn) {
      return {
        building,
        stats: calcFn(building, state.currentCiv, state.currentAge, state.upgrades)
      };
    }

    // Fallback si no está cargado civModifiers
    const baseCost = building.cost || {};
    return {
      building,
      stats: {
        hp: building.baseHp || 1000,
        meleeArmor: building.meleeArmor || 0,
        pierceArmor: building.pierceArmor || 0,
        buildingArmor: building.buildingArmor || 0,
        stoneArmor: building.stoneArmor || 0,
        range: building.baseRange || 0,
        minRange: building.minRange || 0,
        los: building.los || 6,
        attack: building.baseAttack || 0,
        reloadTime: building.reloadTime || 0,
        projectiles: building.projectiles || 0,
        accuracy: building.accuracy || 100,
        garrisonCapacity: building.garrisonCapacity || 0,
        population: building.population || 0,
        workRate: 1.0,
        healRate: building.healRate || 0,
        cost: { ...baseCost, Wood: baseCost.wood ?? baseCost.Wood ?? 0, Food: baseCost.food ?? baseCost.Food ?? 0, Gold: baseCost.gold ?? baseCost.Gold ?? 0, Stone: baseCost.stone ?? baseCost.Stone ?? 0 },
        buildTime: building.buildTime || 40,
        baseStats: {
          hp: building.baseHp || 1000,
          meleeArmor: building.meleeArmor || 0,
          pierceArmor: building.pierceArmor || 0,
          range: building.baseRange || 0,
          los: building.los || 6,
          cost: { ...baseCost, Wood: baseCost.wood ?? baseCost.Wood ?? 0, Food: baseCost.food ?? baseCost.Food ?? 0, Gold: baseCost.gold ?? baseCost.Gold ?? 0, Stone: baseCost.stone ?? baseCost.Stone ?? 0 },
          buildTime: building.buildTime || 40,
          workRate: 1.0
        },
        appliedBonuses: []
      }
    };
  }

  /**
   * Actualiza reactivamente la vista de la ficha técnica
   */
  function updateBuildingView() {
    renderTabContent();
  }

  /**
   * Renderiza el esqueleto principal del modal (Barra de título, selector, pestañas, cuerpo)
   */
  function renderModal() {
    const modal = state.modalEl;
    const { building } = getEffectiveStats();
    const reg = getRegistry();

    const buildingOptions = Object.values(reg).map(b => `
      <option value="${b.key}" ${b.key === building.key ? 'selected' : ''}>
        ${b.name} (${b.categoryName || 'Edificio'})
      </option>
    `).join('');

    modal.innerHTML = `
      <div class="building-modal-container parchment-card bevel-raised">
        
        <!-- Header superior con selector rápido de edificio y botón cerrar -->
        <div class="building-modal-top-bar">
          <div class="building-top-title-group">
            <span class="building-top-crest">🏰</span>
            <div class="building-select-wrapper">
              <label for="building-quick-select" class="visually-hidden">Edificio:</label>
              <select id="building-quick-select" class="building-quick-select medieval-select">
                ${buildingOptions}
              </select>
            </div>
            <span class="building-category-badge">${building.categoryName || 'Edificio'}</span>
          </div>

          <button id="close-building-modal-btn" class="modal-close-icon-btn" title="Cerrar Ficha Técnica">✕</button>
        </div>

        <!-- 1. BARRA SUPERIOR DE NAVEGACIÓN POR PESTAÑAS (AOE DATABASE) -->
        <nav class="building-tabs-nav" aria-label="Navegación Ficha Técnica">
          <button class="building-tab-btn ${state.activeTab === 'basic' ? 'active' : ''}" data-tab="basic">
            <span class="tab-icon">ℹ️</span> BASIC INFO
          </button>
          <button class="building-tab-btn ${state.activeTab === 'combat' ? 'active' : ''}" data-tab="combat">
            <span class="tab-icon">⚔️</span> ATTACK & ARMOR VALUES
          </button>
          <button class="building-tab-btn ${state.activeTab === 'upgrades' ? 'active' : ''}" data-tab="upgrades">
            <span class="tab-icon">⚙️</span> UPGRADES
          </button>
          <button class="building-tab-btn ${state.activeTab === 'units_research' ? 'active' : ''}" data-tab="units_research">
            <span class="tab-icon">📜</span> UNITS AND RESEARCH
          </button>
          <button class="building-tab-btn ${state.activeTab === 'availability' ? 'active' : ''}" data-tab="availability">
            <span class="tab-icon">🌍</span> AVAILABILITY
          </button>
          <button class="building-tab-btn ${state.activeTab === 'bonuses' ? 'active' : ''}" data-tab="bonuses">
            <span class="tab-icon">✨</span> BONUSES
          </button>
        </nav>

        <!-- Contenedor del contenido de la pestaña activa -->
        <div id="building-tab-body" class="building-tab-body">
          <!-- Inyectado dinámicamente -->
        </div>

      </div>
    `;

    // Event Listeners principales
    const closeBtn = modal.querySelector('#close-building-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeBuildingDeepDive);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBuildingDeepDive();
    });

    const quickSelect = modal.querySelector('#building-quick-select');
    if (quickSelect) {
      quickSelect.addEventListener('change', (e) => {
        state.currentBuildingKey = e.target.value;
        const newB = reg[e.target.value];
        if (newB) state.currentAge = newB.age || 3;
        renderModal();
      });
    }

    const tabButtons = modal.querySelectorAll('.building-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    renderTabContent();
  }

  function updateTabButtons() {
    const modal = state.modalEl;
    if (!modal) return;
    modal.querySelectorAll('.building-tab-btn').forEach(btn => {
      if (btn.dataset.tab === state.activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Renderiza el contenido de la pestaña activa
   */
  function renderTabContent() {
    const container = document.getElementById('building-tab-body');
    if (!container) return;

    switch (state.activeTab) {
      case 'basic':
        container.innerHTML = renderBasicInfoTab();
        attachBasicInfoEvents(container);
        break;
      case 'combat':
        container.innerHTML = renderAttackArmorTab();
        break;
      case 'upgrades':
        container.innerHTML = renderUpgradesTab();
        attachUpgradesEvents(container);
        break;
      case 'units_research':
        container.innerHTML = renderUnitsResearchTab();
        break;
      case 'availability':
        container.innerHTML = renderAvailabilityTab();
        attachAvailabilityEvents(container);
        break;
      case 'bonuses':
        container.innerHTML = renderBonusesTab();
        break;
      default:
        container.innerHTML = renderBasicInfoTab();
    }
  }

  // =========================================================================
  // PESTAÑA 1: BASIC INFO
  // =========================================================================
  function renderBasicInfoTab() {
    const { building, stats } = getEffectiveStats();
    const ageInfo = AGE_NAMES[state.currentAge] || { name: 'Edad', color: '#888' };
    const imgSrc = (typeof getBuildingIcon === 'function' ? getBuildingIcon(building) : null)
      || (typeof window !== 'undefined' && typeof window.getBuildingIcon === 'function' ? window.getBuildingIcon(building) : null)
      || building.image
      || 'img/Building/98.png';
    const fallbackSrc = 'img/Building/98.png';

    // Cost breakdown reactivo con comparador base
    const costChips = [];
    const baseCost = stats.baseStats?.cost || building.cost || {};
    const cost = stats.cost || building.cost || {};

    const pushCostChip = (resKey, resName, icon) => {
      const currentVal = cost[resKey] ?? cost[resKey.toLowerCase()] ?? 0;
      const baseVal = baseCost[resKey] ?? baseCost[resKey.toLowerCase()] ?? currentVal;
      if (currentVal <= 0 && baseVal <= 0) return;

      const isDiscounted = currentVal < baseVal;
      const isIncreased = currentVal > baseVal;
      const chipClass = `cost-chip ${resKey.toLowerCase()} ${isDiscounted ? 'buffed' : ''} ${isIncreased ? 'nerfed' : ''}`;
      const diffHtml = isDiscounted 
        ? `<small class="cost-diff" title="Coste base: ${baseVal}">(-${baseVal - currentVal})</small>`
        : isIncreased
          ? `<small class="cost-diff-up" title="Coste base: ${baseVal}">(+${currentVal - baseVal})</small>`
          : '';

      costChips.push(`<span class="${chipClass}"><img src="${icon}" alt="${resName}" class="res-icon"> ${currentVal}${diffHtml}</span>`);
    };

    pushCostChip('Wood', 'Madera', './img/wood.png');
    pushCostChip('Food', 'Alimento', './img/food.png');
    pushCostChip('Gold', 'Oro', './img/gold.png');
    pushCostChip('Stone', 'Piedra', './img/stone.png');

    if (costChips.length === 0) {
      costChips.push('<span class="cost-chip free">Sin Coste</span>');
    }

    const baseBuildTime = stats.baseStats?.buildTime || building.buildTime || 40;
    const isBuildTimeBuffed = stats.buildTime < baseBuildTime;
    const timeDiffHtml = isBuildTimeBuffed 
      ? `<small class="time-diff" title="Tiempo base: ${baseBuildTime}s">(-${baseBuildTime - stats.buildTime}s)</small>`
      : (stats.buildTime > baseBuildTime)
        ? `<small class="time-diff-up" title="Tiempo base: ${baseBuildTime}s">(+${stats.buildTime - baseBuildTime}s)</small>`
        : '';
    const timeBadgeClass = `stat-badge time ${isBuildTimeBuffed ? 'buffed' : ''}`;

    // Indicador de la civilización activa heredada
    const currentCivDisplayName = getCivDisplayName(state.currentCiv);

    // Alerta de disponibilidad / sustitución de edificio
    let availNoticeHtml = '';
    let availCheck = null;
    if (typeof getBuildingAvailability === 'function') {
      availCheck = getBuildingAvailability(building.key, state.currentCiv);
    } else if (typeof window !== 'undefined' && typeof window.getBuildingAvailability === 'function') {
      availCheck = window.getBuildingAvailability(building.key, state.currentCiv);
    }
    if (availCheck && (availCheck.status === 'unavailable' || availCheck.available === false)) {
      availNoticeHtml = `
        <div class="building-status-alert alert-unavailable" style="margin: 10px 0; padding: 10px 14px; background: rgba(239, 68, 68, 0.15); border-left: 4px solid #ef4444; border-radius: 4px; color: #fca5a5; font-size: 0.9rem; font-weight: 500;">
          🚫 <strong>No disponible:</strong> Esta civilización no posee acceso a este edificio.
        </div>
      `;
    }

    // Tiras de bonificaciones activas aplicadas
    let activeBonusesHtml = '';
    if (stats.appliedBonuses && stats.appliedBonuses.length > 0) {
      activeBonusesHtml = `
        <div class="building-active-bonuses-strip" style="display:flex; flex-wrap:wrap; gap:6px; margin: 10px 0 16px 0; padding: 8px 12px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
          <strong style="font-size:0.8rem; color:#86efac; display:flex; align-items:center; gap:4px; width:100%;">🏛️ Bonificaciones Activas de Civilización:</strong>
          ${stats.appliedBonuses.map(txt => `
            <span class="active-bonus-pill" style="display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; background:rgba(34,197,94,0.18); border:1px solid #22c55e; color:#bbf7d0; padding:2px 8px; border-radius:12px;">
              <span style="color:#22c55e;">✔</span> ${txt}
            </span>
          `).join('')}
        </div>
      `;
    }

    // Helper para celdas dinámicas con resaltado de modificaciones
    const bStats = stats.baseStats || {};
    const renderCell = (name, val, baseVal, suffix = '', lowerIsBetter = false) => {
      let isBuffed = false;
      let isNerfed = false;
      if (baseVal !== undefined && baseVal !== null) {
        if (lowerIsBetter) {
          isBuffed = val < baseVal;
          isNerfed = val > baseVal;
        } else {
          isBuffed = val > baseVal;
          isNerfed = val < baseVal;
        }
      }

      let diffHtml = '';
      if (isBuffed && typeof val === 'number' && typeof baseVal === 'number') {
        const diff = Math.abs(Math.round((val - baseVal) * 100) / 100);
        diffHtml = `<small class="stat-buff-badge" title="Valor base: ${baseVal}${suffix}">▲ +${diff}${suffix}</small>`;
      }

      const valClass = `stat-value ${isBuffed ? 'highlight buffed' : ''} ${isNerfed ? 'nerfed' : ''}`;
      return `
        <div class="stat-cell">
          <span class="stat-name">${name}</span>
          <span class="${valClass}">${val}${suffix} ${diffHtml}</span>
        </div>
      `;
    };

    // Development chain
    const dev = building.development || {};

    return `
      <div class="building-basic-info-layout">
        
        <!-- Encabezado con imagen, títulos y metadatos -->
        <div class="building-header-card parchment-subcard bevel-raised">
          <div class="building-visual-frame">
            <img 
              src="${imgSrc}" 
              alt="${building.name}" 
              class="building-render-img"
              onerror="if (!this.dataset.tried) { this.dataset.tried=1; this.src='${fallbackSrc}'; } else if (this.dataset.tried === '1') { this.dataset.tried=2; this.src='assets/icons/building_placeholder.svg'; } else { this.style.display='none'; this.nextElementSibling.style.display='block'; }"
            >
            <span class="icon-fallback" style="display:none; font-size:3.5rem;">🏰</span>
          </div>

          <div class="building-headline-content">
            <div class="building-title-row">
              <h2 class="building-main-title">${building.name}</h2>
              <span class="building-tech-icon-tag" title="ID Oficial #${building.id || building.ID}">#${building.id || building.ID}</span>
            </div>

            <!-- Metadatos requeridos: Builder Unit, Age, Class -->
            <div class="building-metadata-badges">
              <span class="meta-pill"><strong class="meta-label">Constructor:</strong> ${building.builderUnit || 'Aldeano'}</span>
              <span class="meta-pill age-pill" style="border-color:${ageInfo.color}"><strong class="meta-label">Edad:</strong> ${ageInfo.name}</span>
              <span class="meta-pill"><strong class="meta-label">Clase:</strong> ${building.class || 'Edificio'}</span>
              <span class="meta-pill"><strong class="meta-label">Categoría:</strong> ${building.categoryName || 'Militar'}</span>
            </div>

            <!-- Building Description -->
            <p class="building-description-text">${building.description}</p>
          </div>
        </div>

        ${availNoticeHtml}

        <!-- Controles interactivos: Indicador Civ Global + Selector Edad + Botón [Upgrades] -->
        <div class="building-controls-bar parchment-subcard bevel-raised">
          <div class="controls-left-group">
            <div class="civ-control-box">
              <div class="active-civ-indicator">
                <span class="label">Civilización:</span>
                <span class="civ-badge" id="modal-current-civ-name">${currentCivDisplayName}</span>
              </div>
            </div>

            <div class="age-control-box">
              <span class="medieval-control-label">⏳ Edad:</span>
              <div class="age-pills-selector">
                <button class="age-pill-btn ${state.currentAge === 1 ? 'active' : ''}" data-age="1">Dark</button>
                <button class="age-pill-btn ${state.currentAge === 2 ? 'active' : ''}" data-age="2">Feudal</button>
                <button class="age-pill-btn ${state.currentAge === 3 ? 'active' : ''}" data-age="3">Castle</button>
                <button class="age-pill-btn ${state.currentAge === 4 ? 'active' : ''}" data-age="4">Imperial</button>
              </div>
            </div>
          </div>

          <button id="quick-upgrades-btn" class="wood-action-btn gold-bevel" title="Configurar Mejoras e Investigaciones">
            <span class="btn-icon">⚙️</span> [Upgrades]
          </button>
        </div>

        <!-- Rejilla de Atributos Dinámica (16 Atributos canónicos) -->
        <div class="building-section-card parchment-subcard bevel-raised">
          <h3 class="section-card-title">📊 Building Stats (Atributos Dinámicos)</h3>
          
          ${activeBonusesHtml}

          <div class="building-stats-grid">
            ${renderCell('Hit Points', stats.hp, bStats.hp)}
            ${renderCell('Attack', stats.attack || 0, bStats.attack || 0)}
            ${renderCell('Melee Armor', stats.meleeArmor, bStats.meleeArmor)}
            ${renderCell('Pierce Armor', stats.pierceArmor, bStats.pierceArmor)}
            
            ${renderCell('Range', stats.range || 0, bStats.range || 0)}
            ${renderCell('Minimum Range', stats.minRange || 0, bStats.minRange || 0, '', true)}
            ${renderCell('Line Of Sight', stats.los || 6, bStats.los || 6)}
            ${renderCell('Reload Time', stats.reloadTime ? stats.reloadTime : '-', bStats.reloadTime ? bStats.reloadTime : '-', stats.reloadTime ? 's' : '', true)}
            
            <div class="stat-cell"><span class="stat-name">Attack Delay</span><span class="stat-value">0.0s</span></div>
            ${renderCell('Accuracy', stats.accuracy || 100, bStats.accuracy || 100, '%')}
            ${renderCell('Number Projectiles', stats.projectiles || (stats.attack > 0 ? 1 : 0), bStats.projectiles || (stats.attack > 0 ? 1 : 0))}
            <div class="stat-cell"><span class="stat-name">Projectile Speed</span><span class="stat-value">${stats.attack > 0 ? '7.0' : '-'}</span></div>
            
            ${renderCell('Garrison Capacity', stats.garrisonCapacity || 0, bStats.garrisonCapacity || 0)}
            ${renderCell('Population', stats.population || 0, bStats.population || 0)}
            ${renderCell('Work Rate', Math.round(stats.workRate * 100), Math.round((bStats.workRate || 1.0) * 100), '%')}
            ${renderCell('Heal Rate', stats.healRate || 0, bStats.healRate || 0, stats.healRate ? ' HP/s' : '')}
          </div>
        </div>

        ${stats.economicYield ? `
          <!-- Bloque de Rendimiento Económico Dinámico (Granjas, Peces, Pasturas) -->
          <div class="building-section-card parchment-subcard bevel-raised economic-yield-card" style="border-left: 4px solid #16a34a; background: rgba(22, 163, 74, 0.08); padding: 14px 18px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 class="section-card-title" style="margin: 0; color: #166534; font-size: 1.1rem;">
                🌾 Rendimiento Económico y Capacidad de Recursos
              </h3>
              <span class="stat-badge" style="background: #166534; color: #fff; font-size: 0.8rem; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
                ${stats.economicYield.resourceType}
              </span>
            </div>
            <div style="display: flex; gap: 20px; align-items: baseline; flex-wrap: wrap;">
              <div>
                <span style="font-size: 0.85rem; color: #4b5563;">Capacidad Total Actual:</span>
                <div style="font-size: 1.35rem; font-weight: bold; color: #15803d; margin-top: 2px;">
                  ${stats.economicYield.label}
                </div>
              </div>
              ${stats.economicYield.details ? `
                <div style="background: rgba(0,0,0,0.06); padding: 5px 12px; border-radius: 4px; font-size: 0.85rem; color: #374151; font-weight: 500;">
                  ${stats.economicYield.details}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${stats.aura ? `
          <!-- Bloque de Aura de Influencia Territorial (Iglesia Fortificada Georgiana, etc.) -->
          <div class="building-section-card parchment-subcard bevel-raised aura-effect-card" style="border-left: 4px solid #2563eb; background: rgba(37, 99, 235, 0.08); padding: 14px 18px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 class="section-card-title" style="margin: 0; color: #1d4ed8; font-size: 1.1rem;">
                ✨ Aura de Influencia Territorial (Radio: ${stats.aura.radius || 9} casillas)
              </h3>
              <span class="stat-badge" style="background: #2563eb; color: #fff; font-size: 0.8rem; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
                ${stats.aura.label || '+10% Velocidad de Trabajo'}
              </span>
            </div>
            <div style="display: flex; gap: 20px; align-items: baseline; flex-wrap: wrap;">
              <div>
                <span style="font-size: 0.85rem; color: #4b5563;">Efecto a Unidades Cercanas:</span>
                <div style="font-size: 1.15rem; font-weight: bold; color: #1e40af; margin-top: 2px;">
                  +${Math.round((stats.aura.value || 0.10) * 100)}% velocidad de trabajo a ${stats.aura.target === 'villager' ? 'Aldeanos' : 'Unidades'}
                </div>
              </div>
              ${stats.aura.description ? `
                <div style="background: rgba(0,0,0,0.06); padding: 5px 12px; border-radius: 4px; font-size: 0.85rem; color: #374151; font-weight: 500;">
                  ${stats.aura.description}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Dos columnas: Cost & Construction + Building Development -->
        <div class="building-bottom-grid">
          
          <!-- Building Cost & Construction -->
          <div class="building-section-card parchment-subcard bevel-raised">
            <h3 class="section-card-title">💰 Building Cost & Construction</h3>
            <div class="cost-construction-body">
              <div class="cost-row">
                <span class="sub-label">Coste Desglosado:</span>
                <div class="cost-chips-group">${costChips.join('')}</div>
              </div>
              <div class="construction-time-row">
                <span class="sub-label">Tiempo de Construcción:</span>
                <span class="${timeBadgeClass}">⏱️ ${stats.buildTime} segundos ${timeDiffHtml}</span>
              </div>
            </div>
          </div>

          <!-- Building Development -->
          <div class="building-section-card parchment-subcard bevel-raised">
            <h3 class="section-card-title">🏗️ Building Development</h3>
            <div class="development-list">
              <div class="dev-item"><span class="dev-label">Required Building:</span> <span class="dev-val">${dev.requiredBuilding || 'Ninguno'}</span></div>
              <div class="dev-item"><span class="dev-label">Required Technology:</span> <span class="dev-val">${dev.requiredTech || 'Ninguna'}</span></div>
              <div class="dev-item"><span class="dev-label">Upgraded From:</span> <span class="dev-val">${dev.upgradedFrom || 'Ninguno'}</span></div>
              <div class="dev-item"><span class="dev-label">Next Upgrade:</span> <span class="dev-val ${dev.nextUpgrade ? 'has-upgrade' : ''}">${dev.nextUpgrade || 'Ninguna (Máximo Nivel)'}</span></div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  function attachBasicInfoEvents(container) {
    const ageBtns = container.querySelectorAll('.age-pill-btn');
    ageBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentAge = Number(btn.dataset.age);
        updateBuildingView();
      });
    });

    const upgradesBtn = container.querySelector('#quick-upgrades-btn');
    if (upgradesBtn) {
      upgradesBtn.addEventListener('click', () => {
        switchTab('upgrades');
      });
    }
  }

  // =========================================================================
  // PESTAÑA 2: ATTACK & ARMOR VALUES
  // =========================================================================
  function renderAttackArmorTab() {
    const { building, stats } = getEffectiveStats();

    // Armaduras dinámicas con bonos activos
    const armoursRows = (building.armours || []).map(arm => {
      let effectiveAmount = arm.Amount;
      if (arm.Class === 4) effectiveAmount = stats.meleeArmor;
      if (arm.Class === 3) effectiveAmount = stats.pierceArmor;
      if (arm.Class === 11) effectiveAmount = stats.buildingArmor;

      const isBoosted = effectiveAmount > arm.Amount;
      return `
        <tr>
          <td><span class="class-id-badge">Clase ${arm.Class}</span></td>
          <td><strong>${arm.Name}</strong></td>
          <td>${arm.Amount}</td>
          <td class="${isBoosted ? 'highlight-boost' : ''}"><strong>${effectiveAmount}</strong> ${isBoosted ? '(+Mejoras)' : ''}</td>
        </tr>
      `;
    }).join('');

    // Tabla de ataques
    let attacksHtml = '';
    if (building.attacks && building.attacks.length > 0 && stats.attack > 0) {
      const attackRows = building.attacks.map(atk => {
        let effAtk = atk.Amount;
        if (atk.Class === 3) effAtk = stats.attack;
        const isBoosted = effAtk > atk.Amount;
        return `
          <tr>
            <td><span class="class-id-badge">Clase ${atk.Class}</span></td>
            <td><strong>${atk.Name}</strong></td>
            <td class="${isBoosted ? 'highlight-boost' : ''}"><strong>+${effAtk}</strong></td>
          </tr>
        `;
      }).join('');

      attacksHtml = `
        <div class="building-section-card parchment-subcard bevel-raised" style="margin-top: 18px;">
          <h3 class="section-card-title">🏹 Matriz de Ataque y Bonificaciones</h3>
          <div class="table-responsive">
            <table class="medieval-table">
              <thead>
                <tr>
                  <th>Clase Objetivo</th>
                  <th>Descripción del Bonus</th>
                  <th>Daño Base / Bonus Efectivo</th>
                </tr>
              </thead>
              <tbody>
                ${attackRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      attacksHtml = `
        <div class="empty-attacks-note parchment-subcard bevel-raised" style="margin-top: 18px;">
          <span class="note-icon">🛡️</span>
          <div>
            <h4>Estructura sin ataque directo</h4>
            <p>Este edificio no cuenta con proyectiles ofensivos directos. Su función principal es defensiva, de soporte o económica.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="building-combat-tab-layout">
        
        <!-- Tabla de Clases de Armadura -->
        <div class="building-section-card parchment-subcard bevel-raised">
          <h3 class="section-card-title">🛡️ Matriz de Clases de Armadura del Edificio</h3>
          <p class="tab-subtitle">Resistencia estructural frente a unidades de asedio, demolición y armas de proyectil.</p>
          
          <div class="table-responsive">
            <table class="medieval-table">
              <thead>
                <tr>
                  <th>Clase ID</th>
                  <th>Nombre de Clase Genie</th>
                  <th>Blindaje Base</th>
                  <th>Blindaje con Mejoras</th>
                </tr>
              </thead>
              <tbody>
                ${armoursRows}
              </tbody>
            </table>
          </div>
        </div>

        ${attacksHtml}

      </div>
    `;
  }

  // =========================================================================
  // =========================================================================
  // PESTAÑA 3: UPGRADES (TECNOLOGÍAS INTERACTIVAS CONTEXTUALIZADAS)
  // =========================================================================
  function renderUpgradesTab() {
    const { building, stats } = getEffectiveStats();
    const u = state.upgrades;
    const bKey = (building.key || '').toLowerCase();

    // Obtener lista canónica de tecnologías aplicables para esta estructura
    let applicableTechs = [];
    if (typeof getBuildingTechList === 'function') {
      applicableTechs = getBuildingTechList(bKey);
    } else if (typeof window !== 'undefined' && typeof window.getBuildingTechList === 'function') {
      applicableTechs = window.getBuildingTechList(bKey);
    } else if (typeof require === 'function') {
      try {
        const upg = require('./buildingUpgrades.js');
        if (upg && typeof upg.getBuildingTechList === 'function') {
          applicableTechs = upg.getBuildingTechList(bKey);
        }
      } catch (e) {}
    }

    const norm = bKey;
    const isFarm = ["granja", "farm"].includes(norm);
    const isPasture = ["pasturas", "pastura", "pasture", "pastizal"].includes(norm);
    const isDock = ["muelle", "dock", "puerto", "harbor"].includes(norm);
    const isDefensiveRanged = ["castillo", "castle", "torre", "tower", "centro urbano", "town_center", "donjon", "krepost", "watch_tower", "guard_tower", "keep", "bombard_tower", "town_center_feudal", "fortified_church", "iglesia_fortificada", "fortcrch"].some(k => norm.includes(k));
    const isMilitaryProd = ["barracks", "archery_range", "stable", "siege_workshop", "cuartel", "establo"].some(k => norm.includes(k));

    // Comprobador de disponibilidad de tecnología según civilización activa
    const isTechAllowed = (techId) => {
      if (typeof isTechAvailableForCiv === 'function') {
        return isTechAvailableForCiv(state.currentCiv, techId);
      }
      if (typeof window !== 'undefined' && typeof window.isTechAvailableForCiv === 'function') {
        return window.isTechAvailableForCiv(state.currentCiv, techId);
      }
      return true;
    };

    // Helper para generar filas de checkbox con verificación de disponibilidad de civilización
    const renderCheckboxRow = (id, key, techId, title, desc) => {
      const allowed = isTechAllowed(techId);
      if (!allowed) {
        u[key] = false;
      }
      const isChecked = allowed ? Boolean(u[key]) : false;
      const lockedClass = !allowed ? 'tech-locked' : '';
      const disabledAttr = !allowed ? 'disabled' : '';
      const isGeneric = ['generic', 'genérico'].includes(String(state.currentCiv || '').toLowerCase().trim());
      const civDisplay = getCivDisplayName(state.currentCiv);
      const lockNotice = !allowed && !isGeneric ? ` <span class="tech-locked-pill">(Bloqueado: No disp. en ${civDisplay})</span>` : '';

      return `
        <label class="wood-checkbox-row ${lockedClass}">
          <input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''} ${disabledAttr}>
          <span class="custom-checkbox"></span>
          <div class="upg-info">
            <strong>${title}${lockNotice}</strong>
            <span>${desc}</span>
          </div>
        </label>
      `;
    };

    // Banner de rendimiento económico dinámico si aplica
    let economicSummaryBanner = '';
    if (stats.economicYield) {
      economicSummaryBanner = `
        <div class="upgrades-yield-summary parchment-subcard bevel-raised" style="margin-bottom: 16px; border-left: 4px solid #16a34a; background: rgba(22, 163, 74, 0.08); padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.82rem; color: #4b5563;">Capacidad de Alimento Recalculada:</span>
            <div id="live-upgrades-yield-val" style="font-size: 1.35rem; font-weight: bold; color: #15803d; margin-top: 2px;">
              ${stats.economicYield.label}
            </div>
          </div>
          ${stats.economicYield.details ? `
            <span id="live-upgrades-yield-det" style="background: rgba(0,0,0,0.06); padding: 4px 10px; border-radius: 4px; font-size: 0.82rem; color: #374151; font-weight: 500;">
              ${stats.economicYield.details}
            </span>
          ` : '<span id="live-upgrades-yield-det"></span>'}
        </div>
      `;
    }

    let cardsHtml = '';

    // =========================================================================
    // CASO 1: GRANJAS (Exclusivamente línea de agricultura)
    // =========================================================================
    if (isFarm) {
      cardsHtml = `
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">🌾 Tecnologías Agrícolas (Molino)</h4>
          ${renderCheckboxRow('upg-horse-collar', 'horse_collar', 14, 'Collar de caballo (Horse Collar - ID 14)', '+75 de alimento (+169 para Sicilianos)')}
          ${renderCheckboxRow('upg-heavy-plow', 'heavy_plow', 13, 'Arado pesado (Heavy Plow - ID 13)', '+125 de alimento (+281 para Sicilianos)')}
          ${renderCheckboxRow('upg-crop-rotation', 'crop_rotation', 12, 'Rotación de cultivos (Crop Rotation - ID 12)', '+175 de alimento (+394 para Sicilianos)')}
        </div>
      `;
    }

    // =========================================================================
    // CASO 2: PASTURAS (Exclusivamente línea de pastoreo Khitan)
    // =========================================================================
    else if (isPasture) {
      cardsHtml = `
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">🐑 Tecnologías de Pastoreo (Kitán)</h4>
          ${renderCheckboxRow('upg-domestication', 'domestication', 'domestication', 'Domesticación (Domestication)', '+1 Animal adicional (+140 de Alimento)')}
          ${renderCheckboxRow('upg-pastoralism', 'pastoralism', 'pastoralism', 'Pastoralismo (Pastoralism)', '+2 Animales adicionales (+280 de Alimento)')}
          ${renderCheckboxRow('upg-transhumance', 'transhumance', 'transhumance', 'Trashumancia (Transhumance)', '+3 Animales adicionales (+420 de Alimento)')}
        </div>
      `;
    }

    // =========================================================================
    // CASO 3: DEFENSIVOS CON ATAQUE (Castillo, Torres, Donjon, Krepost, TC)
    // =========================================================================
    else if (isDefensiveRanged) {
      const isCastle = (bKey === 'castle' || bKey === 'krepost');
      const isBombardTower = (bKey === 'bombard_tower');
      const isTower = (bKey.includes('tower') || bKey === 'donjon' || bKey === 'krepost');
      const isFortifiedChurch = (bKey === 'fortified_church' || bKey === 'iglesia_fortificada' || bKey === 'fortcrch' || bKey === '88' || bKey === '1806');
      const isTownCenter = (bKey === 'town_center' || bKey === 'town_center_feudal' || bKey === 'rtwc' || bKey === 'rtwc2');

      const uniqueDefensiveTechs = [];
      if (isCastle) {
        uniqueDefensiveTechs.push(renderCheckboxRow('upg-crenellations', 'crenellations', 11, 'Almenas (Crenellations - Teutones)', '+3 de alcance a Castillos y la infantería guarnecida dispara flechas'));
      }
      if (isBombardTower) {
        uniqueDefensiveTechs.push(renderCheckboxRow('upg-artillery', 'artillery', 10, 'Artillería (Artillery - Turcos)', '+2 de alcance a Torres de bombardeo (Alcance total 10)'));
      }
      if (isTower) {
        uniqueDefensiveTechs.push(renderCheckboxRow('upg-great-wall', 'greatWall', 462, 'Gran Muralla (Great Wall - Chinos)', '+30% HP a muros, puertas y torres defensivas'));
        uniqueDefensiveTechs.push(renderCheckboxRow('upg-yasama', 'yasama', 484, 'Yasama (Yasama - Japoneses)', 'Las torres defensivas disparan +2 flechas adicionales'));
      }
      if (isTower || isCastle || isTownCenter || isFortifiedChurch) {
        uniqueDefensiveTechs.push(renderCheckboxRow('upg-svan-towers', 'svanTowers', 923, 'Torres esvanas (Svan Towers - Georgianos)', '+2 Ataque a edificios que disparan flechas'));
      }

      cardsHtml = `
        <!-- 1. Albañilería e Ingeniería Defensiva -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">🧱 Albañilería e Ingeniería Defensiva</h4>
          ${renderCheckboxRow('upg-masonry', 'masonry', 50, 'Albañilería (Masonry - ID 50)', '+10% HP, +1 Armadura Melee, +1 Pierce, +3 Armadura Edificios')}
          ${renderCheckboxRow('upg-architecture', 'architecture', 51, 'Arquitectura (Architecture - ID 51)', '+10% HP, +1 Armadura Melee, +1 Pierce, +3 Armadura Edificios')}
          ${renderCheckboxRow('upg-murder-holes', 'murderHoles', 322, 'Matacanes (Murder Holes - ID 322)', 'Elimina el rango mínimo de ataque (Min Range = 0)')}
          ${renderCheckboxRow('upg-treadmill-crane', 'treadmillCrane', 379, 'Grúa de rueda motriz (Treadmill Crane - ID 379)', 'Construcción un 20% más rápida')}
        </div>

        <!-- 2. Balística y Herrería Defensiva -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">🏹 Balística y Herrería Defensiva</h4>
          ${renderCheckboxRow('upg-fletching', 'fletching', 199, 'Flecha emplumada (Fletching - ID 199)', isFortifiedChurch ? '+1 Ataque (rango base anclado en 4)' : '+1 Ataque y +1 Alcance a fortificaciones')}
          ${renderCheckboxRow('upg-bodkin-arrow', 'bodkinArrow', 200, 'Flecha de punta de flecha (Bodkin Arrow - ID 200)', isFortifiedChurch ? '+1 Ataque adicional (rango base anclado en 4)' : '+1 Ataque y +1 Alcance adicional')}
          ${renderCheckboxRow('upg-bracer', 'bracer', 201, 'Braserío (Bracer - ID 201)', isFortifiedChurch ? '+1 Ataque adicional (rango base anclado en 4)' : '+1 Ataque y +1 Alcance adicional')}
          ${renderCheckboxRow('upg-chemistry', 'chemistry', 47, 'Química (Chemistry - ID 47)', '+1 Ataque a proyectiles convencionales')}
          ${renderCheckboxRow('upg-ballistics', 'ballistics', 93, 'Balística (Ballistics - ID 93)', 'Anticipa blancos en movimiento (100% puntería)')}
          ${isTower ? renderCheckboxRow('upg-arrowslits', 'arrowslits', 234, 'Saeteras (Arrowslits - ID 234)', '+1/+2/+3 de ataque a torres (Torre de guardia +1, Vigilancia +2, Homenaje +3)') : ''}
        </div>

        <!-- 3. Vigilancia y Coronas Únicas -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">👑 Coronas Únicas y Vigilancia</h4>
          ${renderCheckboxRow('upg-town-watch', 'townWatch', 280, 'Guardias de la ciudad (Town Watch)', '+4 Línea de visión (LoS) en todos los edificios')}
          ${renderCheckboxRow('upg-town-patrol', 'townPatrol', 281, 'Patrulla de la ciudad (Town Patrol)', '+4 Línea de visión (LoS) adicional')}
          ${uniqueDefensiveTechs.join('')}
          ${uniqueDefensiveTechs.length === 0 ? '<div class="no-unique-techs-note" style="margin-top: 10px; font-size: 0.85rem; color: #7a6e55; font-style: italic;">ℹ️ Sin tecnologías de corona exclusivas para este tipo de estructura.</div>' : ''}
        </div>
      `;
    }

    // =========================================================================
    // CASO 4: MUELLE Y PUERTO (Dock / Harbor)
    // =========================================================================
    else if (isDock) {
      cardsHtml = `
        <!-- 1. Albañilería e Ingeniería -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">🧱 Albañilería e Ingeniería</h4>
          ${renderCheckboxRow('upg-masonry', 'masonry', 50, 'Albañilería (Masonry - ID 50)', '+10% HP, +1 Armadura Melee, +1 Pierce, +3 Armadura Edificios')}
          ${renderCheckboxRow('upg-treadmill-crane', 'treadmillCrane', 379, 'Grúa de rueda motriz (Treadmill Crane - ID 379)', 'Construcción un 20% más rápida')}
        </div>

        <!-- 2. Tecnologías Navales de Muelle -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">⚓ Tecnologías Navales (Muelle)</h4>
          ${renderCheckboxRow('upg-careening', 'careening', 374, 'Carenado (Careening - ID 374)', 'Mejora blindaje de naves y soporte de puerto')}
          ${renderCheckboxRow('upg-dry-dock', 'dryDock', 374, 'Dique seco (Dry Dock - ID 374)', '+15% velocidad de trabajo en Muelle')}
          ${renderCheckboxRow('upg-shipwright', 'shipwright', 373, 'Constructor naval (Shipwright - ID 373 / 65)', 'Barcos se construyen un 35% más rápido')}
          ${bKey === 'harbor' ? renderCheckboxRow('upg-greek-fire', 'greekFire', 464, 'Fuego Griego (Greek Fire - Bizantinos)', '+1 de alcance a Puertos y dromones') : ''}
        </div>

        <!-- 3. Vigilancia y Coronas Únicas -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">👑 Coronas Únicas y Vigilancia</h4>
          ${renderCheckboxRow('upg-town-watch', 'townWatch', 280, 'Guardias de la ciudad (Town Watch)', '+4 Línea de visión (LoS) en todos los edificios')}
          ${renderCheckboxRow('upg-town-patrol', 'townPatrol', 281, 'Patrulla de la ciudad (Town Patrol)', '+4 Línea de visión (LoS) adicional')}
          ${renderCheckboxRow('upg-svan-towers', 'svanTowers', 923, 'Torres esvanas (Svan Towers - Georgianos)', '+2 Ataque a Muelles (disparan flechas con alcance 6)')}
        </div>
      `;
    }

    // =========================================================================
    // CASO 5: ESTRUCTURAS PASIVAS MILITARES Y CIVILES (Cuartel, Establo, Casa, etc.)
    // =========================================================================
    else {
      const isMonastery = (bKey === 'monastery' || bKey === 'fortified_church');
      const isWallOrGate = (bKey.includes('wall') || bKey.includes('gate') || bKey === 'palisade_gate');

      const uniqueStructuralTechs = [];
      if (isMonastery) {
        uniqueStructuralTechs.push(renderCheckboxRow('upg-inquisition', 'inquisition', 492, 'Inquisición (Inquisition - Españoles)', '+25% velocidad de conversión y trabajo en Monasterio'));
      }
      if (isWallOrGate) {
        uniqueStructuralTechs.push(renderCheckboxRow('upg-great-wall', 'greatWall', 462, 'Gran Muralla (Great Wall - Chinos)', '+30% HP a muros y puertas'));
      }

      cardsHtml = `
        <!-- 1. Albañilería e Ingeniería Estructural -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">🧱 Albañilería e Ingeniería Estructural</h4>
          ${renderCheckboxRow('upg-masonry', 'masonry', 50, 'Albañilería (Masonry - ID 50)', '+10% HP, +1 Armadura Melee, +1 Pierce, +3 Armadura Edificios')}
          ${renderCheckboxRow('upg-architecture', 'architecture', 51, 'Arquitectura (Architecture - ID 51)', '+10% HP, +1 Armadura Melee, +1 Pierce, +3 Armadura Edificios')}
          ${renderCheckboxRow('upg-treadmill-crane', 'treadmillCrane', 379, 'Grúa de rueda motriz (Treadmill Crane - ID 379)', 'Construcción un 20% más rápida')}
          ${isMilitaryProd ? renderCheckboxRow('upg-conscription', 'conscription', 65, 'Leva / Conscripción (Conscription - ID 65)', 'Unidades militares se crean un 33% más rápido') : ''}
        </div>

        <!-- 2. Vigilancia y Soporte -->
        <div class="upgrade-category-card parchment-subcard bevel-raised">
          <h4 class="category-header">👑 Vigilancia y Soporte</h4>
          ${renderCheckboxRow('upg-town-watch', 'townWatch', 280, 'Guardias de la ciudad (Town Watch)', '+4 Línea de visión (LoS) en todos los edificios')}
          ${renderCheckboxRow('upg-town-patrol', 'townPatrol', 281, 'Patrulla de la ciudad (Town Patrol)', '+4 Línea de visión (LoS) adicional')}
          ${uniqueStructuralTechs.join('')}
          ${uniqueStructuralTechs.length === 0 ? '<div class="no-unique-techs-note" style="margin-top: 10px; font-size: 0.85rem; color: #7a6e55; font-style: italic;">ℹ️ Sin tecnologías de corona exclusivas para esta estructura.</div>' : ''}
        </div>
      `;
    }

    return `
      <div class="building-upgrades-tab-layout">
        <div class="upgrades-intro parchment-subcard bevel-raised">
          <h3>⚙️ Simulador de Tecnologías Contextualizadas</h3>
          <p>Activa o desmarca mejoras aplicables para recalcular en tiempo real los atributos, blindajes, alcance y velocidad de trabajo de <strong>${building.name}</strong>.</p>
        </div>

        ${economicSummaryBanner}

        <div class="upgrades-grid-container">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function attachUpgradesEvents(container) {
    const bindCheck = (id, key) => {
      const el = container.querySelector(id);
      if (el) {
        el.addEventListener('change', (e) => {
          state.upgrades[key] = e.target.checked;
          const { stats: newStats } = getEffectiveStats();
          const liveVal = container.querySelector('#live-upgrades-yield-val');
          const liveDet = container.querySelector('#live-upgrades-yield-det');
          if (liveVal && newStats.economicYield) {
            liveVal.textContent = newStats.economicYield.label;
            if (liveDet) liveDet.textContent = newStats.economicYield.details || '';
          }
        });
      }
    };

    bindCheck('#upg-masonry', 'masonry');
    bindCheck('#upg-architecture', 'architecture');
    bindCheck('#upg-murder-holes', 'murderHoles');
    bindCheck('#upg-treadmill-crane', 'treadmillCrane');
    bindCheck('#upg-fletching', 'fletching');
    bindCheck('#upg-bodkin-arrow', 'bodkinArrow');
    bindCheck('#upg-bracer', 'bracer');
    bindCheck('#upg-chemistry', 'chemistry');
    bindCheck('#upg-ballistics', 'ballistics');
    bindCheck('#upg-arrowslits', 'arrowslits');
    bindCheck('#upg-town-watch', 'townWatch');
    bindCheck('#upg-town-patrol', 'townPatrol');
    bindCheck('#upg-crenellations', 'crenellations');
    bindCheck('#upg-artillery', 'artillery');
    bindCheck('#upg-inquisition', 'inquisition');
    bindCheck('#upg-great-wall', 'greatWall');
    bindCheck('#upg-yasama', 'yasama');
    bindCheck('#upg-svan-towers', 'svanTowers');
    bindCheck('#upg-greek-fire', 'greekFire');
    bindCheck('#upg-conscription', 'conscription');
    bindCheck('#upg-careening', 'careening');
    bindCheck('#upg-dry-dock', 'dryDock');
    bindCheck('#upg-shipwright', 'shipwright');
    // Mejoras de rendimiento agrícola y pastoreo
    bindCheck('#upg-horse-collar', 'horse_collar');
    bindCheck('#upg-heavy-plow', 'heavy_plow');
    bindCheck('#upg-crop-rotation', 'crop_rotation');
    bindCheck('#upg-domestication', 'domestication');
    bindCheck('#upg-pastoralism', 'pastoralism');
    bindCheck('#upg-transhumance', 'transhumance');
  }

  // =========================================================================
  // PESTAÑA 4: UNITS AND RESEARCH
  // =========================================================================
  function renderUnitsResearchTab() {
    const { building } = getEffectiveStats();

    // Unidades
    const unitsList = (building.units || []).map(u => {
      const imgSrc = `./img/units/${u.id}.png`;
      const fallbackSrc = `./img/Unit/${u.id}.png`;
      const costChips = [];
      if (u.cost?.Food) costChips.push(`<span class="mini-res food"><img src="./img/food.png" alt="A"> ${u.cost.Food}</span>`);
      if (u.cost?.Wood) costChips.push(`<span class="mini-res wood"><img src="./img/wood.png" alt="M"> ${u.cost.Wood}</span>`);
      if (u.cost?.Gold) costChips.push(`<span class="mini-res gold"><img src="./img/gold.png" alt="O"> ${u.cost.Gold}</span>`);
      if (u.cost?.Stone) costChips.push(`<span class="mini-res stone"><img src="./img/stone.png" alt="P"> ${u.cost.Stone}</span>`);

      return `
        <div class="entity-chip-card parchment-subcard bevel-raised">
          <div class="entity-avatar-frame">
            <img 
              src="${imgSrc}" 
              alt="${u.name}"
              onerror="if (!this.dataset.tried) { this.dataset.tried=1; this.src='${fallbackSrc}'; } else { this.style.display='none'; }"
            >
          </div>
          <div class="entity-details">
            <strong class="entity-name">${u.name}</strong>
            <span class="entity-age-tag">${AGE_NAMES[u.age]?.short || 'Edad ' + u.age}</span>
            <div class="entity-cost-row">${costChips.join('')}</div>
          </div>
        </div>
      `;
    }).join('');

    // Tecnologías
    const techsList = (building.techs || []).map(t => {
      const imgSrc = `./img/Tech/${t.id}.png`;
      const costChips = [];
      if (t.cost?.Food) costChips.push(`<span class="mini-res food"><img src="./img/food.png" alt="A"> ${t.cost.Food}</span>`);
      if (t.cost?.Wood) costChips.push(`<span class="mini-res wood"><img src="./img/wood.png" alt="M"> ${t.cost.Wood}</span>`);
      if (t.cost?.Gold) costChips.push(`<span class="mini-res gold"><img src="./img/gold.png" alt="O"> ${t.cost.Gold}</span>`);
      if (t.cost?.Stone) costChips.push(`<span class="mini-res stone"><img src="./img/stone.png" alt="P"> ${t.cost.Stone}</span>`);

      return `
        <div class="entity-chip-card parchment-subcard bevel-raised">
          <div class="entity-avatar-frame">
            <img 
              src="${imgSrc}" 
              alt="${t.name}"
              onerror="this.style.display='none';"
            >
          </div>
          <div class="entity-details">
            <strong class="entity-name">${t.name}</strong>
            <div class="entity-cost-row">${costChips.join('')}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="building-units-research-layout">
        
        <!-- Bloque de Unidades Producidas -->
        <div class="building-section-card parchment-subcard bevel-raised">
          <h3 class="section-card-title">⚔️ Unidades Producidas / Entrenadas (${building.units?.length || 0})</h3>
          ${unitsList ? `<div class="entities-grid">${unitsList}</div>` : '<p class="empty-note">Esta estructura no entrena unidades de forma directa.</p>'}
        </div>

        <!-- Bloque de Tecnologías Investigadas -->
        <div class="building-section-card parchment-subcard bevel-raised" style="margin-top: 20px;">
          <h3 class="section-card-title">📜 Tecnologías Investigadas (${building.techs?.length || 0})</h3>
          ${techsList ? `<div class="entities-grid">${techsList}</div>` : '<p class="empty-note">Esta estructura no posee tecnologías directas para investigar.</p>'}
        </div>

      </div>
    `;
  }

  // =========================================================================
  // PESTAÑA 5: AVAILABILITY (DISPONIBILIDAD POR CIVILIZACIÓN)
  // =========================================================================
  function renderAvailabilityTab() {
    const { building } = getEffectiveStats();
    let civList = [];

    if (typeof window !== 'undefined' && window.state && window.state.civsList) {
      civList = window.state.civsList;
    } else {
      civList = [
        'Armenians', 'Aztecs', 'Bengalis', 'Berbers', 'Bohemians', 'Britons', 'Bulgarians', 'Burgundians',
        'Burmese', 'Byzantines', 'Celts', 'Chinese', 'Cumans', 'Danes', 'Dravidians', 'Ethiopians',
        'Franks', 'Georgians', 'Goths', 'Gurjaras', 'Hindustanis', 'Huns', 'Incas', 'Italians',
        'Japanese', 'Jurchens', 'Khitans', 'Khmer', 'Koreans', 'Lithuanians', 'Magyars', 'Malay',
        'Malians', 'Mapuche', 'Mayans', 'Mongols', 'Muisca', 'Persians', 'Poles', 'Portuguese',
        'Romans', 'Saracens', 'Saxons', 'Shu', 'Sicilians', 'Slavs', 'Spanish', 'Tatars',
        'Teutons', 'Tupi', 'Turks', 'Varangians', 'Vietnamese', 'Vikings', 'Wei', 'Wu'
      ].map(name => ({ key: name.toLowerCase(), name }));
    }

    const filterQuery = (state.civFilterAvailability || '').toLowerCase().trim();

    const civCards = civList.filter(c => {
      if (!filterQuery) return true;
      return c.name.toLowerCase().includes(filterQuery) || c.key.toLowerCase().includes(filterQuery);
    }).map(c => {
      let avail = { status: 'available', text: 'Disponible' };
      if (typeof getBuildingAvailability === 'function') {
        avail = getBuildingAvailability(building.key, c.name);
      } else if (typeof window !== 'undefined' && typeof window.getBuildingAvailability === 'function') {
        avail = window.getBuildingAvailability(building.key, c.name);
      }

      const isUnavailable = avail.status === 'unavailable' || avail.available === false;
      const badgeClass = isUnavailable ? 'badge-unavailable' : 'badge-available';
      const icon = isUnavailable ? '🔴' : '🟢';

      const crestSrc = `./img/Civs/${c.key.toLowerCase()}.png`;

      return `
        <div class="civ-availability-card parchment-subcard bevel-raised ${avail.status}">
          <div class="civ-card-top">
            <img src="${crestSrc}" alt="${c.name}" class="civ-mini-crest" onerror="this.style.display='none';">
            <strong class="civ-title-name">${c.name}</strong>
          </div>
          <span class="availability-status-tag ${badgeClass}">
            ${icon} ${avail.text}
          </span>
        </div>
      `;
    }).join('');

    return `
      <div class="building-availability-layout">
        <div class="availability-filter-header parchment-subcard bevel-raised">
          <div class="header-text-group">
            <h3>🌍 Disponibilidad por Civilización (${civList.length} Civilizaciones)</h3>
            <p>Estado de acceso de todas las civilizaciones del juego según el árbol tecnológico oficial.</p>
          </div>
          <div class="search-civ-box">
            <input 
              type="text" 
              id="civ-avail-search-input" 
              class="medieval-input" 
              placeholder="Buscar civilización..." 
              value="${state.civFilterAvailability || ''}"
            >
          </div>
        </div>

        <div class="civs-availability-grid">
          ${civCards}
        </div>
      </div>
    `;
  }

  function attachAvailabilityEvents(container) {
    const input = container.querySelector('#civ-avail-search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        state.civFilterAvailability = e.target.value;
        const grid = container.querySelector('.civs-availability-grid');
        if (grid) {
          // Re-renderizar solo la cuadrícula
          const dummy = document.createElement('div');
          dummy.innerHTML = renderAvailabilityTab();
          const newGrid = dummy.querySelector('.civs-availability-grid');
          if (newGrid) grid.innerHTML = newGrid.innerHTML;
        }
      });
    }
  }

  // =========================================================================
  // PESTAÑA 6: BONUSES (BONIFICACIONES CONTEXTUALIZADAS POR CIVILIZACIÓN)
  // =========================================================================
  function renderBonusesTab() {
    const { building } = getEffectiveStats();
    let bonuses = { civBonuses: [], teamBonuses: [], allCivBonuses: [], allTeamBonuses: [] };

    const activeCiv = (state.currentCiv || 'all').trim();

    if (typeof getBuildingBonuses === 'function') {
      bonuses = getBuildingBonuses(building.key, activeCiv);
    } else if (typeof window !== 'undefined' && typeof window.getBuildingBonuses === 'function') {
      bonuses = window.getBuildingBonuses(building.key, activeCiv);
    }

    const hasSpecificCiv = activeCiv && !['all', 'generic', 'genérico'].includes(activeCiv.toLowerCase());
    const activeCivBonuses = bonuses.civBonuses || [];
    const activeTeamBonuses = bonuses.teamBonuses || [];

    // Panel superior con las bonificaciones activas de la civilización elegida
    let activeCivBannerHtml = '';
    if (hasSpecificCiv) {
      if (activeCivBonuses.length > 0 || activeTeamBonuses.length > 0) {
        activeCivBannerHtml = `
          <div class="active-civ-bonuses-card parchment-subcard bevel-raised" style="margin-bottom: 22px; border-left: 5px solid #d4af37; background: rgba(212, 175, 55, 0.09); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 class="section-card-title" style="margin: 0; color: #6b4e05; font-size: 1.15rem;">
                👑 Bonificaciones Activas para ${activeCiv}
              </h3>
              <span class="active-civ-badge" style="background: #8b6b15; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; letter-spacing: 0.5px;">
                CIVILIZACIÓN SELECCIONADA
              </span>
            </div>
            <ul class="bonuses-ul">
              ${activeCivBonuses.map(b => `
                <li class="bonus-list-item active-civ-highlight" style="border: 1px solid #d4af37; background: #fffcf0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 8px;">
                  <span class="bonus-civ-pill" style="background: #d4af37; color: #222; font-weight: bold;">${b.civ}</span>
                  <span class="bonus-text-content"><strong>${b.desc}</strong></span>
                </li>
              `).join('')}
              ${activeTeamBonuses.map(b => `
                <li class="bonus-list-item team active-civ-highlight" style="border: 1px solid #2e7d32; background: #f0fff4; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 8px;">
                  <span class="bonus-civ-pill team" style="background: #2e7d32; color: #fff; font-weight: bold;">${b.civ} (Equipo)</span>
                  <span class="bonus-text-content"><strong>${b.desc}</strong></span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      } else {
        activeCivBannerHtml = `
          <div class="active-civ-bonuses-card parchment-subcard bevel-raised" style="margin-bottom: 22px; border-left: 4px solid #8c8270; background: rgba(140, 130, 112, 0.08); padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #524738; font-size: 1rem;">
                ℹ️ Estado de Bonificaciones para <strong>${activeCiv}</strong>
              </h4>
              <span class="active-civ-badge" style="background: #6e6556; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem;">
                Sin Bono Específico
              </span>
            </div>
            <p style="margin: 6px 0 0 0; color: #625747; font-size: 0.88rem;">
              La civilización <strong>${activeCiv}</strong> no cuenta con bonificaciones directas ni de equipo para <strong>${building.name}</strong>.
            </p>
          </div>
        `;
      }
    }

    const civList = (bonuses.allCivBonuses || []).map(b => {
      const isSelected = hasSpecificCiv && b.civ.toLowerCase().includes(activeCiv.toLowerCase());
      return `
        <li class="bonus-list-item ${isSelected ? 'selected-civ-highlight' : ''}" style="${isSelected ? 'background: #fff9e6; border: 1.5px solid #d4af37; box-shadow: 0 1px 4px rgba(212,175,55,0.25);' : ''}">
          <span class="bonus-civ-pill" style="${isSelected ? 'background: #b8860b; color: #fff; font-weight: bold;' : ''}">${b.civ}${isSelected ? ' ⭐' : ''}</span>
          <span class="bonus-text-content" style="${isSelected ? 'font-weight: 600;' : ''}">${b.desc}</span>
        </li>
      `;
    }).join('');

    const teamList = (bonuses.allTeamBonuses || []).map(b => {
      const isSelected = hasSpecificCiv && b.civ.toLowerCase().includes(activeCiv.toLowerCase());
      return `
        <li class="bonus-list-item team ${isSelected ? 'selected-civ-highlight' : ''}" style="${isSelected ? 'background: #f1f8e9; border: 1.5px solid #4caf50; box-shadow: 0 1px 4px rgba(76,175,80,0.25);' : ''}">
          <span class="bonus-civ-pill team" style="${isSelected ? 'background: #2e7d32; color: #fff; font-weight: bold;' : ''}">${b.civ}${isSelected ? ' ⭐' : ''}</span>
          <span class="bonus-text-content" style="${isSelected ? 'font-weight: 600;' : ''}">${b.desc}</span>
        </li>
      `;
    }).join('');

    return `
      <div class="building-bonuses-layout">
        
        <!-- Bloque Destacado de Civilización Activa -->
        ${activeCivBannerHtml}

        <!-- Bonos de Civilización Globales -->
        <div class="building-section-card parchment-subcard bevel-raised">
          <h3 class="section-card-title">🏛️ Civilization Bonuses (Bonos Pasivos y Tecnologías Únicas)</h3>
          ${civList ? `<ul class="bonuses-ul">${civList}</ul>` : '<p class="empty-note">No hay bonos de civilización registrados para este edificio.</p>'}
        </div>

        <!-- Bonos de Equipo Globales -->
        <div class="building-section-card parchment-subcard bevel-raised" style="margin-top: 20px;">
          <h3 class="section-card-title">🤝 Team Bonuses (Bonos de Equipo)</h3>
          ${teamList ? `<ul class="bonuses-ul">${teamList}</ul>` : '<p class="empty-note">No hay bonos de equipo directos que modifiquen este edificio.</p>'}
        </div>

      </div>
    `;
  }

  // Estilos CSS incrustados para garantizar presentación visual exacta
  function injectStyles() {
    if (document.getElementById('building-deep-dive-styles')) return;
    const style = document.createElement('style');
    style.id = 'building-deep-dive-styles';
    style.textContent = `
      .building-modal-container {
        width: 95%;
        max-width: 1060px;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        border: 3px solid var(--gold-primary, #d4af37);
        border-radius: 8px;
        padding: 20px 24px;
        background: linear-gradient(180deg, #2b1a0e 0%, #150d06 100%);
        color: var(--parchment-base, #ebd9b5);
        box-shadow: 0 12px 48px rgba(0,0,0,0.85);
      }
      .building-modal-top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid rgba(212, 175, 55, 0.4);
        padding-bottom: 12px;
        margin-bottom: 14px;
      }
      .building-top-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .building-top-crest {
        font-size: 1.8rem;
      }
      .building-quick-select {
        font-size: 1.15rem;
        font-weight: bold;
        padding: 6px 12px;
        background: #1e1108;
        color: #ffe082;
        border: 2px solid var(--gold-primary, #d4af37);
        border-radius: 4px;
      }
      .building-category-badge {
        font-size: 0.8rem;
        padding: 3px 8px;
        background: rgba(212, 175, 55, 0.2);
        border: 1px solid var(--gold-primary, #d4af37);
        border-radius: 4px;
        color: #f7d879;
      }
      .modal-close-icon-btn {
        background: none;
        border: 2px solid var(--gold-dark, #8c6a1e);
        color: var(--parchment-base, #ebd9b5);
        font-size: 1.2rem;
        border-radius: 4px;
        width: 36px;
        height: 36px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .modal-close-icon-btn:hover {
        background: var(--gold-primary, #d4af37);
        color: #120904;
      }

      /* TABS NAVIGATION */
      .building-tabs-nav {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        border-bottom: 2px solid rgba(212, 175, 55, 0.3);
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .building-tab-btn {
        background: rgba(30, 17, 8, 0.8);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 4px;
        padding: 8px 14px;
        color: var(--parchment-dark, #d2bc90);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .building-tab-btn:hover {
        background: rgba(212, 175, 55, 0.15);
        color: #fff0aa;
        border-color: var(--gold-primary, #d4af37);
      }
      .building-tab-btn.active {
        background: linear-gradient(180deg, #442a17 0%, #2b1a0e 100%);
        border: 2px solid var(--gold-primary, #d4af37);
        color: #f7d879;
        box-shadow: inset 0 0 8px rgba(212, 175, 55, 0.4);
      }

      /* TAB BODY */
      .building-tab-body {
        flex: 1;
      }

      /* BASIC INFO LAYOUT */
      .building-header-card {
        display: flex;
        gap: 20px;
        padding: 16px;
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 6px;
        margin-bottom: 16px;
        align-items: center;
      }
      .building-visual-frame {
        width: 120px;
        height: 120px;
        flex-shrink: 0;
        background: radial-gradient(circle, #382212 0%, #150d06 100%);
        border: 2px solid var(--gold-primary, #d4af37);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .building-render-img {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.7));
      }
      .building-headline-content {
        flex: 1;
      }
      .building-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .building-main-title {
        font-size: 1.6rem;
        color: #ffe082;
        margin: 0;
      }
      .building-tech-icon-tag {
        font-size: 0.8rem;
        color: #d4af37;
        background: #180e07;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #8c6a1e;
      }
      .building-metadata-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .meta-pill {
        font-size: 0.8rem;
        background: #190f08;
        border: 1px solid rgba(212, 175, 55, 0.3);
        padding: 3px 8px;
        border-radius: 4px;
      }
      .meta-label {
        color: #f7d879;
      }
      .building-description-text {
        font-size: 0.88rem;
        color: #ebd9b5;
        line-height: 1.45;
        margin: 0;
      }

      /* CONTROLS BAR */
      .building-controls-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 6px;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .controls-left-group {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .active-civ-indicator {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(20, 11, 5, 0.85);
        border: 1px solid var(--gold-dark, #8c6a1e);
        padding: 5px 12px;
        border-radius: 4px;
      }
      .active-civ-indicator .label {
        font-size: 0.82rem;
        color: #d2bc90;
        font-weight: 600;
      }
      .civ-badge {
        background: linear-gradient(180deg, #d4af37 0%, #aa820a 100%);
        color: #120904;
        font-size: 0.85rem;
        font-weight: bold;
        padding: 2px 10px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      .medieval-control-label {
        font-size: 0.85rem;
        font-weight: bold;
        color: #ffe082;
        margin-right: 6px;
      }
      .age-pills-selector {
        display: inline-flex;
        border: 1px solid var(--gold-dark, #8c6a1e);
        border-radius: 4px;
        overflow: hidden;
      }
      .age-pill-btn {
        background: #180e07;
        border: none;
        border-right: 1px solid rgba(212, 175, 55, 0.2);
        color: #d2bc90;
        padding: 4px 10px;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .age-pill-btn.active {
        background: var(--gold-primary, #d4af37);
        color: #120904;
        font-weight: bold;
      }
      .wood-action-btn {
        background: linear-gradient(180deg, #583720 0%, #2c1a0e 100%);
        border: 2px solid var(--gold-primary, #d4af37);
        color: #ffe082;
        padding: 6px 14px;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
      }
      .wood-action-btn:hover {
        background: var(--gold-primary, #d4af37);
        color: #1a0e06;
      }

      /* STATS GRID */
      .section-card-title {
        font-size: 1.05rem;
        color: #ffe082;
        border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        padding-bottom: 6px;
        margin-bottom: 12px;
      }
      .building-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
      }
      .stat-cell {
        background: rgba(20, 11, 5, 0.8);
        border: 1px solid rgba(212, 175, 55, 0.25);
        border-radius: 4px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .stat-name {
        font-size: 0.82rem;
        color: #d2bc90;
      }
      .stat-value {
        font-size: 0.95rem;
        font-weight: bold;
        color: #fff;
      }
      .stat-value.highlight {
        color: #22c55e;
      }
      .stat-value.buffed {
        color: #22c55e !important;
        text-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
      }
      .stat-buff-badge {
        display: inline-block;
        font-size: 0.72rem;
        color: #86efac;
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.5);
        border-radius: 4px;
        padding: 1px 4px;
        margin-left: 4px;
        font-weight: 600;
        vertical-align: middle;
      }
      .cost-chip.buffed {
        border-color: #22c55e !important;
        background: rgba(34, 197, 94, 0.25) !important;
        box-shadow: 0 0 6px rgba(34, 197, 94, 0.3);
      }
      .cost-diff {
        color: #86efac;
        font-size: 0.75rem;
        margin-left: 4px;
        font-weight: bold;
      }
      .cost-diff-up {
        color: #fca5a5;
        font-size: 0.75rem;
        margin-left: 4px;
      }
      .stat-badge.time.buffed {
        border-color: #22c55e !important;
        color: #86efac !important;
        background: rgba(34, 197, 94, 0.2) !important;
      }
      .time-diff {
        color: #86efac;
        font-size: 0.75rem;
        margin-left: 4px;
        font-weight: bold;
      }

      /* BOTTOM GRID */
      .building-bottom-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 16px;
      }
      @media (max-width: 768px) {
        .building-bottom-grid {
          grid-template-columns: 1fr;
        }
      }
      .cost-chips-group {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 6px;
      }
      .cost-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: bold;
      }
      .cost-chip.wood { background: rgba(39, 174, 96, 0.25); border: 1px solid #27ae60; color: #a9dfbf; }
      .cost-chip.food { background: rgba(192, 57, 43, 0.25); border: 1px solid #c0392b; color: #f5b7b1; }
      .cost-chip.gold { background: rgba(243, 156, 18, 0.25); border: 1px solid #f39c12; color: #f9e79f; }
      .cost-chip.stone { background: rgba(127, 140, 141, 0.25); border: 1px solid #7f8c8d; color: #d5dbdb; }
      .res-icon { width: 16px; height: 16px; object-fit: contain; }
      .construction-time-row {
        margin-top: 10px;
        font-size: 0.88rem;
      }
      .development-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.85rem;
      }
      .dev-label {
        color: #f7d879;
        font-weight: 600;
      }
      .dev-val.has-upgrade {
        color: #22c55e;
        font-weight: bold;
      }

      /* TABLES */
      .medieval-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      .medieval-table th, .medieval-table td {
        border: 1px solid rgba(212, 175, 55, 0.25);
        padding: 8px 10px;
        text-align: left;
      }
      .medieval-table th {
        background: #1c0f06;
        color: #ffe082;
      }
      .medieval-table tr:nth-child(even) {
        background: rgba(25, 13, 7, 0.5);
      }
      .class-id-badge {
        background: #120904;
        border: 1px solid #8c6a1e;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.75rem;
        color: #d4af37;
      }
      .highlight-boost {
        color: #22c55e;
      }

      /* UPGRADES CHECKBOXES */
      .upgrades-grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 14px;
      }
      .wood-checkbox-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.15);
        cursor: pointer;
      }
      .wood-checkbox-row:hover {
        background: rgba(212, 175, 55, 0.08);
      }
      .wood-checkbox-row.tech-locked {
        opacity: 0.55;
        cursor: not-allowed;
        background: rgba(0, 0, 0, 0.2);
      }
      .wood-checkbox-row.tech-locked:hover {
        background: rgba(0, 0, 0, 0.2);
      }
      .wood-checkbox-row.tech-locked input[type="checkbox"] {
        cursor: not-allowed;
      }
      .tech-locked-pill {
        display: inline-block;
        font-size: 0.72rem;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        padding: 1px 6px;
        border-radius: 4px;
        margin-left: 6px;
        font-weight: 600;
      }
      .upg-info strong {
        display: block;
        color: #ffe082;
        font-size: 0.85rem;
      }
      .upg-info span {
        font-size: 0.78rem;
        color: #d2bc90;
      }

      /* ENTITIES CHIPS */
      .entities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 10px;
      }
      .entity-chip-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border: 1px solid rgba(212, 175, 55, 0.25);
        border-radius: 4px;
        background: rgba(25, 13, 7, 0.8);
      }
      .entity-avatar-frame {
        width: 36px;
        height: 36px;
        border: 1px solid var(--gold-dark, #8c6a1e);
        border-radius: 4px;
        overflow: hidden;
        background: #120904;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .entity-avatar-frame img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .entity-name {
        font-size: 0.82rem;
        color: #ffe082;
        display: block;
      }
      .entity-age-tag {
        font-size: 0.72rem;
        color: #aaa;
      }
      .entity-cost-row {
        display: flex;
        gap: 4px;
        margin-top: 2px;
      }
      .mini-res {
        font-size: 0.75rem;
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }
      .mini-res img {
        width: 12px;
        height: 12px;
      }

      /* AVAILABILITY GRID */
      .availability-filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 6px;
        margin-bottom: 14px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .civs-availability-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        gap: 8px;
      }
      .civ-availability-card {
        padding: 8px 10px;
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 4px;
        background: rgba(20, 11, 5, 0.7);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .civ-card-top {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .civ-mini-crest {
        width: 22px;
        height: 22px;
        object-fit: contain;
      }
      .civ-title-name {
        font-size: 0.82rem;
        color: #ffe082;
      }
      .availability-status-tag {
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 3px;
        text-align: center;
      }
      .badge-available { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #86efac; }
      .badge-unavailable { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; }
      .badge-replaced { background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; color: #fde047; }

      /* BONUSES LIST */
      .bonuses-ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bonus-list-item {
        padding: 8px 12px;
        border-left: 3px solid var(--gold-primary, #d4af37);
        background: rgba(25, 13, 7, 0.6);
        border-radius: 0 4px 4px 0;
        display: flex;
        gap: 10px;
        align-items: baseline;
      }
      .bonus-list-item.team {
        border-left-color: #3b82f6;
      }
      .bonus-civ-pill {
        background: var(--gold-primary, #d4af37);
        color: #140a04;
        font-weight: bold;
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 3px;
        flex-shrink: 0;
      }
      .bonus-civ-pill.team {
        background: #3b82f6;
        color: #fff;
      }
      .bonus-text-content {
        font-size: 0.84rem;
        line-height: 1.4;
        color: #ebd9b5;
      }
    `;
    document.head.appendChild(style);
  }

  // Inicializar estilos de inmediato
  if (typeof document !== 'undefined') {
    injectStyles();
  }

  return {
    openBuildingDeepDive,
    closeBuildingDeepDive,
    updateBuildingView,
    getBaseBuilding,
    switchTab,
    getEffectiveStats,
    ALL_CIVILIZATIONS,
    CIVILIZATIONS: CIVILIZATIONS_LIST,
    getSortedCivilizations,
    getActiveGlobalCiv,
    getCivDisplayName,
    setModalCiv,
    populateCivSelector,
    state
  };
});
