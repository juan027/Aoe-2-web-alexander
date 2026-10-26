/**
 * TECHDEEPDIVE.JS - Ficha Técnica Avanzada y Modal "Deep Dive" para Tecnologías AoE2
 * Diseñado bajo la arquitectura visual e interactiva de AoE Database.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.techDeepDive = exports;
    global.openTechDeepDive = exports.openTechDeepDive;
    global.closeTechDeepDive = exports.closeTechDeepDive;
    global.AoE2TechDeepDive = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Estado interno del modal Deep Dive
  const state = {
    currentTechId: 22, // Por defecto Telar
    currentCiv: 'all',
    activeTab: 'basic',
    civSearchFilter: '',
    modalEl: null
  };

  const AGE_NAMES = {
    1: { name: 'Alta Edad Media', short: 'Dark Age', color: '#7a6652' },
    2: { name: 'Edad Feudal', short: 'Feudal Age', color: '#3b7a42' },
    3: { name: 'Edad de los Castillos', short: 'Castle Age', color: '#29689e' },
    4: { name: 'Edad Imperial', short: 'Imperial Age', color: '#9c2222' }
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

  function ensureModalElement() {
    if (!state.modalEl) {
      let el = document.getElementById('tech-deep-dive-modal');
      if (!el) {
        el = document.createElement('div');
        el.id = 'tech-deep-dive-modal';
        el.className = 'modal-backdrop tech-modal-backdrop';
        el.style.display = 'none';
        document.body.appendChild(el);
      }
      state.modalEl = el;

      // Cerrar al pulsar fuera del modal
      state.modalEl.addEventListener('click', (e) => {
        if (e.target === state.modalEl) {
          closeTechDeepDive();
        }
      });

      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.modalEl.style.display !== 'none') {
          closeTechDeepDive();
        }
      });

      injectStyles();
    }
  }

  function openTechDeepDive(techId, initialCiv = null) {
    ensureModalElement();
    const tMod = getTechModule();
    if (!tMod) {
      console.error('AoE2Techs module no encontrado');
      return;
    }

    const tech = tMod.getTechById(techId) || tMod.getAllTechs()[0];
    if (!tech) return;

    state.currentTechId = tech.id;
    if (tech.isUnique && tech.uniqueCiv) {
      state.currentCiv = tech.uniqueCiv;
    } else if (initialCiv && initialCiv !== 'all') {
      state.currentCiv = initialCiv;
    } else {
      state.currentCiv = 'Generic';
    }

    state.activeTab = 'basic';
    state.civSearchFilter = '';

    renderModal();
    state.modalEl.style.display = 'flex';
    document.body.classList.add('modal-open');
  }

  function closeTechDeepDive() {
    if (state.modalEl) {
      state.modalEl.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
  }

  function switchTab(tabKey) {
    state.activeTab = tabKey;
    renderTabContent();
    updateTabButtons();
  }

  function updateTabButtons() {
    const modal = state.modalEl;
    if (!modal) return;
    const tabBtns = modal.querySelectorAll('.tech-tab-btn');
    tabBtns.forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (tab === state.activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function renderModal() {
    const modal = state.modalEl;
    const tMod = getTechModule();
    const tech = tMod.getTechById(state.currentTechId);
    if (!tech) return;

    const allTechs = tMod.getAllTechs();
    const techOptions = allTechs.map(t => `
      <option value="${t.id}" ${t.id === tech.id ? 'selected' : ''}>
        ${t.name} (${t.categoryInfo.label} • ${t.buildingInfo.name})
      </option>
    `).join('');

    const ageInfo = AGE_NAMES[tech.age] || AGE_NAMES[1];

    modal.innerHTML = `
      <div class="tech-modal-container parchment-card bevel-raised">
        
        <!-- Top Bar con selector rápido de tecnología y botón cerrar -->
        <div class="tech-modal-top-bar">
          <div class="tech-top-title-group">
            <span class="tech-top-crest">📜</span>
            <div class="tech-select-wrapper">
              <label for="tech-quick-select" class="visually-hidden">Tecnología:</label>
              <select id="tech-quick-select" class="tech-quick-select medieval-select">
                ${techOptions}
              </select>
            </div>
            <span class="tech-category-badge" style="background: ${tech.categoryInfo.color}33; border: 1px solid ${tech.categoryInfo.color}; color: ${tech.categoryInfo.color};">
              ${tech.categoryInfo.emoji} ${tech.categoryInfo.label}
            </span>
          </div>

          <button id="close-tech-modal-btn" class="modal-close-icon-btn" title="Cerrar Ficha">✕</button>
        </div>

        <!-- Hero Header de la Tecnología -->
        <div class="tech-hero-header">
          <div class="tech-hero-icon-box">
            <img src="${tech.icon}" alt="${tech.name}" class="tech-hero-icon" onerror="this.onerror=null; this.src='img/missing.png';">
            <span class="tech-hero-age-pip age-${tech.age}" title="${ageInfo.name}"></span>
          </div>

          <div class="tech-hero-info">
            <div class="tech-hero-titles">
              <h2 class="tech-hero-title">${tech.name}</h2>
              <span class="tech-hero-internal">${tech.internal_name} • ID #${tech.id}</span>
            </div>

            <div class="tech-hero-tags">
              <span class="hero-badge badge-age" style="border-color: ${ageInfo.color}; color: ${ageInfo.color};">
                ${ageInfo.name}
              </span>
              <span class="hero-badge badge-building">
                <img src="${tech.buildingInfo.icon}" class="mini-building-icon" alt="" onerror="this.style.display='none';">
                ${tech.buildingInfo.name}
              </span>
              ${tech.isUnique ? `
                <span class="hero-badge badge-unique ${tech.crownType === 'castle' ? 'crown-silver' : 'crown-gold'}">
                  ${tech.crownType === 'castle' ? '👑 Corona de Castillos (Plata)' : '👑 Corona Imperial (Oro)'} • ${tech.uniqueCiv || 'Única'}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Selector de Civilización en Modal -->
          <div class="tech-modal-civ-selector">
            <label for="tech-modal-civ-dropdown" class="modal-civ-label">Civilización activa:</label>
            <select id="tech-modal-civ-dropdown" class="medieval-select">
              <option value="Generic" ${state.currentCiv === 'Generic' ? 'selected' : ''}>🏛️ Genérica (Estándar)</option>
              ${getCivDropdownOptions()}
            </select>
          </div>
        </div>

        <!-- Navegación por pestañas -->
        <nav class="tech-tabs-nav" aria-label="Pestañas de Tecnología">
          <button class="tech-tab-btn ${state.activeTab === 'basic' ? 'active' : ''}" data-tab="basic">
            <span class="tab-icon">ℹ️</span> FICHA TÉCNICA
          </button>
          <button class="tech-tab-btn ${state.activeTab === 'effects' ? 'active' : ''}" data-tab="effects">
            <span class="tab-icon">⚡</span> EFECTOS & BENEFICIOS
          </button>
          <button class="tech-tab-btn ${state.activeTab === 'civs' ? 'active' : ''}" data-tab="civs">
            <span class="tab-icon">🏛️</span> DISPONIBILIDAD (${tech.civs.length}/56)
          </button>
          <button class="tech-tab-btn ${state.activeTab === 'bonuses' ? 'active' : ''}" data-tab="bonuses">
            <span class="tab-icon">👑</span> BONOS DE CIV
          </button>
        </nav>

        <!-- Contenedor dinámico del cuerpo -->
        <div id="tech-tab-content-area" class="tech-tab-body">
          <!-- Renderizado dinámico -->
        </div>

      </div>
    `;

    bindModalEvents();
    renderTabContent();
  }

  function getCivDropdownOptions() {
    const civList = [
      'Armenians', 'Aztecs', 'Bengalis', 'Berbers', 'Bohemians', 'Britons', 'Bulgarians', 'Burgundians',
      'Burmese', 'Byzantines', 'Celts', 'Chinese', 'Cumans', 'Danes', 'Dravidians', 'Ethiopians',
      'Franks', 'Georgians', 'Goths', 'Gurjaras', 'Hindustanis', 'Huns', 'Incas', 'Italians',
      'Japanese', 'Jurchens', 'Khitans', 'Khmer', 'Koreans', 'Lithuanians', 'Magyars', 'Malay',
      'Malians', 'Mapuche', 'Mayans', 'Mongols', 'Muisca', 'Persians', 'Poles', 'Portuguese',
      'Romans', 'Saracens', 'Saxons', 'Shu', 'Sicilians', 'Slavs', 'Spanish', 'Tatars',
      'Teutons', 'Tupi', 'Turks', 'Varangians', 'Vietnamese', 'Vikings', 'Wei', 'Wu'
    ];
    return civList.map(c => `
      <option value="${c}" ${c.toLowerCase() === state.currentCiv.toLowerCase() ? 'selected' : ''}>${c}</option>
    `).join('');
  }

  function bindModalEvents() {
    const modal = state.modalEl;
    if (!modal) return;

    // Botón Cerrar
    const closeBtn = modal.querySelector('#close-tech-modal-btn');
    if (closeBtn) closeBtn.onclick = closeTechDeepDive;

    // Selector rápido de tecnología
    const quickSel = modal.querySelector('#tech-quick-select');
    if (quickSel) {
      quickSel.onchange = (e) => {
        state.currentTechId = Number(e.target.value);
        const tMod = getTechModule();
        const t = tMod.getTechById(state.currentTechId);
        if (t && t.isUnique && t.uniqueCiv) {
          state.currentCiv = t.uniqueCiv;
        }
        renderModal();
      };
    }

    // Selector de civ
    const civSel = modal.querySelector('#tech-modal-civ-dropdown');
    if (civSel) {
      civSel.onchange = (e) => {
        state.currentCiv = e.target.value;
        renderTabContent();
      };
    }

    // Pestañas
    const tabBtns = modal.querySelectorAll('.tech-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        switchTab(btn.getAttribute('data-tab'));
      };
    });
  }

  function renderTabContent() {
    const container = document.getElementById('tech-tab-content-area');
    if (!container) return;

    switch (state.activeTab) {
      case 'basic':
        container.innerHTML = renderBasicTab();
        break;
      case 'effects':
        container.innerHTML = renderEffectsTab();
        break;
      case 'civs':
        container.innerHTML = renderCivsTab();
        bindCivSearchEvents();
        break;
      case 'bonuses':
        container.innerHTML = renderBonusesTab();
        break;
      default:
        container.innerHTML = renderBasicTab();
    }
  }

  /**
   * Pestaña 1: Ficha Técnica & Costes
   */
  function renderBasicTab() {
    const tMod = getTechModule();
    const cMod = getCivModifiers();
    const tech = tMod.getTechById(state.currentTechId);
    if (!tech) return '';

    let costData = { cost: tech.cost, researchTime: tech.researchTime, bonuses: [] };
    if (cMod && typeof cMod.calculateTechCost === 'function' && state.currentCiv !== 'Generic') {
      costData = cMod.calculateTechCost(tech.id, state.currentCiv, tech.age, tech.cost, tech.researchTime, tech.category);
    }

    const { cost, researchTime, bonuses } = costData;
    const hasDiscount = JSON.stringify(cost) !== JSON.stringify(tech.cost) || researchTime !== tech.researchTime;

    return `
      <div class="tech-tab-pane">
        
        <!-- Banner de bonificación activa si aplica -->
        ${bonuses.length > 0 ? `
          <div class="civ-active-bonus-banner">
            <span class="bonus-banner-icon">✨</span>
            <div class="bonus-banner-content">
              <strong>Bonificaciones activas para ${state.currentCiv}:</strong>
              <ul>
                ${bonuses.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        <!-- Tarjetas de Costes de Recursos -->
        <div class="tech-section-block">
          <h4 class="tech-section-title">🪙 Costes de Investigación</h4>
          <div class="tech-costs-grid">
            
            <div class="cost-stat-card ${cost.Food > 0 ? 'cost-active' : 'cost-zero'}">
              <img src="img/food.png" class="res-cost-icon" alt="Alimento">
              <div class="cost-stat-info">
                <span class="res-label">Alimento</span>
                <span class="res-value ${hasDiscount && cost.Food < tech.cost.Food ? 'discounted' : ''}">${cost.Food}</span>
                ${hasDiscount && cost.Food < tech.cost.Food ? `<span class="base-struck">${tech.cost.Food}</span>` : ''}
              </div>
            </div>

            <div class="cost-stat-card ${cost.Wood > 0 ? 'cost-active' : 'cost-zero'}">
              <img src="img/wood.png" class="res-cost-icon" alt="Madera">
              <div class="cost-stat-info">
                <span class="res-label">Madera</span>
                <span class="res-value ${hasDiscount && cost.Wood < tech.cost.Wood ? 'discounted' : ''}">${cost.Wood}</span>
                ${hasDiscount && cost.Wood < tech.cost.Wood ? `<span class="base-struck">${tech.cost.Wood}</span>` : ''}
              </div>
            </div>

            <div class="cost-stat-card ${cost.Gold > 0 ? 'cost-active' : 'cost-zero'}">
              <img src="img/gold.png" class="res-cost-icon" alt="Oro">
              <div class="cost-stat-info">
                <span class="res-label">Oro</span>
                <span class="res-value ${hasDiscount && cost.Gold < tech.cost.Gold ? 'discounted' : ''}">${cost.Gold}</span>
                ${hasDiscount && cost.Gold < tech.cost.Gold ? `<span class="base-struck">${tech.cost.Gold}</span>` : ''}
              </div>
            </div>

            <div class="cost-stat-card ${cost.Stone > 0 ? 'cost-active' : 'cost-zero'}">
              <img src="img/stone.png" class="res-cost-icon" alt="Piedra">
              <div class="cost-stat-info">
                <span class="res-label">Piedra</span>
                <span class="res-value ${hasDiscount && cost.Stone < tech.cost.Stone ? 'discounted' : ''}">${cost.Stone}</span>
                ${hasDiscount && cost.Stone < tech.cost.Stone ? `<span class="base-struck">${tech.cost.Stone}</span>` : ''}
              </div>
            </div>

            <div class="cost-stat-card cost-time">
              <span class="res-time-icon">⏳</span>
              <div class="cost-stat-info">
                <span class="res-label">Tiempo</span>
                <span class="res-value ${hasDiscount && researchTime < tech.researchTime ? 'discounted' : ''}">${researchTime}s</span>
                ${hasDiscount && researchTime < tech.researchTime ? `<span class="base-struck">${tech.researchTime}s</span>` : ''}
              </div>
            </div>

          </div>
        </div>

        <!-- Descripción Oficial del Juego -->
        <div class="tech-section-block">
          <h4 class="tech-section-title">📜 Descripción Oficial (Definitive Edition)</h4>
          <div class="tech-official-description-box">
            <p class="tech-desc-text">
              ${tech.description ? tech.description : 'Sin descripción oficial detallada disponible para esta tecnología.'}
            </p>
          </div>
        </div>

        <!-- Parámetros Estructurales -->
        <div class="tech-section-block">
          <h4 class="tech-section-title">🏛️ Parámetros de Desarrollo</h4>
          <div class="tech-spec-table">
            <div class="spec-row">
              <span class="spec-label">Edificio de Investigación:</span>
              <span class="spec-value">
                <img src="${tech.buildingInfo.icon}" class="inline-building-icon" alt="">
                ${tech.buildingInfo.name} (ID #${tech.buildingId})
              </span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Edad Requerida:</span>
              <span class="spec-value">${AGE_NAMES[tech.age]?.name || 'Alta Edad Media'}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Categoría Estratégica:</span>
              <span class="spec-value">${tech.categoryInfo.emoji} ${tech.categoryInfo.label}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Disponibilidad en Partida:</span>
              <span class="spec-value">${tech.isUnique ? `Exclusiva de <b>${tech.uniqueCiv}</b>` : `Común para ${tech.civs.length} civilizaciones`}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Reiterable (Repeatable):</span>
              <span class="spec-value">${tech.repeatable ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * Pestaña 2: Efectos & Beneficios
   */
  function renderEffectsTab() {
    const tMod = getTechModule();
    const tech = tMod.getTechById(state.currentTechId);
    if (!tech) return '';

    return `
      <div class="tech-tab-pane">
        <div class="tech-section-block">
          <h4 class="tech-section-title">⚡ Efecto Táctico y Estadísticas Afectadas</h4>
          
          <div class="tech-effect-hero-box">
            <div class="effect-lead">
              <span class="effect-lightning">⚡</span>
              <div class="effect-lead-content">
                <h5>${tech.name}</h5>
                <p>${tech.description || 'Mejora de atributos y capacidades estratégicas.'}</p>
              </div>
            </div>
          </div>

          <div class="tech-detailed-effects-grid">
            <div class="detailed-effect-card">
              <span class="dec-icon">🎯</span>
              <div class="dec-info">
                <h6>Impacto en Unidades / Edificios</h6>
                <p>${getDetailedEffectBreakdown(tech)}</p>
              </div>
            </div>

            <div class="detailed-effect-card">
              <span class="dec-icon">🛡️</span>
              <div class="dec-info">
                <h6>Relevancia Competitiva</h6>
                <p>${getCompetitiveNotes(tech)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function getDetailedEffectBreakdown(tech) {
    const id = tech.id;
    const cat = tech.category;

    if (id === 22) return 'Aumenta los puntos de resistencia de los aldeanos de 25 a 40 (+15 PR), otorga +1 de armadura cuerpo a cuerpo y +2 antiproyectil.';
    if (id === 213) return 'Los aldeanos se mueven 10% más rápido y pueden transportar un 25% más de recursos (+3 de capacidad).';
    if (id === 249) return 'Los aldeanos se mueven 10% más rápido y pueden transportar un 50% más de recursos adicionales (+5 de capacidad).';
    if (id === 14) return 'Las granjas proporcionan +75 de alimento adicional (175 base -> 250 alimento).';
    if (id === 13) return 'Las granjas proporcionan +125 de alimento adicional (250 -> 375 alimento).';
    if (id === 12) return 'Las granjas proporcionan +175 de alimento adicional (375 -> 550 alimento).';
    if (id === 435) return 'Las unidades montadas (caballería, arqueros a caballo, camellos) obtienen +20 puntos de impacto (HP).';
    if (id === 39) return 'La caballería se desplaza un 10% más rápido.';
    if (id === 437) return 'Los arqueros a pie y a caballo disparan con 100% de precisión y velocidad de recarga incrementada.';
    if (id === 436) return 'Los arqueros a caballo obtienen +1 de armadura normal, +2 antiproyectil y +4 de daño contra piqueros.';
    if (id === 93) return 'Otorga 100% de puntería predictiva a arqueros, galeras, castillos y torres contra objetivos en movimiento.';
    if (id === 47) return '+1 de ataque perforante a unidades de proyectiles y desbloquea el entrenamiento de unidades de pólvora.';
    if (cat === 'blacksmith') return 'Mejora permanente acumulable de armas o armaduras para las líneas de infantería, arquería o caballería.';
    if (cat === 'monastery') return 'Mejora las capacidades místicas, puntos de resistencia, velocidad o alcance de conversión de los monjes.';
    if (cat === 'dock') return 'Mejora la velocidad, resistencia o costes de mantenimiento de la armada imperial.';
    if (tech.isUnique) return `Tecnología única exclusiva de ${tech.uniqueCiv}: ${tech.description}`;

    return tech.description || 'Incrementa el rendimiento general de las unidades y estructuras asociadas.';
  }

  function getCompetitiveNotes(tech) {
    if (tech.category === 'blacksmith') {
      return 'Tecnología crucial en el orden de construcción para duelos de arqueros o combates entre caballerías.';
    }
    if (tech.category === 'economic') {
      return 'Fundamental para mantener la producción constante de aldeanos y el equilibrio en la economía de recolección.';
    }
    if (tech.id === 93) {
      return 'Prioridad absoluta en Edad de los Castillos para cualquier jugador que base su composición en arqueros.';
    }
    if (tech.id === 435) {
      return 'Tecnología indispensable para asegurar la supervivencia y el valor de intercambio de jinetes y caballería ligera.';
    }
    if (tech.isUnique) {
      return 'Define la identidad táctica y la especialización competitiva de su civilización en Castillos e Imperial.';
    }
    return 'Proporciona una ventaja decisiva en el escalado a partidas tardías.';
  }

  /**
   * Pestaña 3: Disponibilidad por Civilización
   */
  function renderCivsTab() {
    const tMod = getTechModule();
    const tech = tMod.getTechById(state.currentTechId);
    if (!tech) return '';

    const allCivs = [
      'Armenians', 'Aztecs', 'Bengalis', 'Berbers', 'Bohemians', 'Britons', 'Bulgarians', 'Burgundians',
      'Burmese', 'Byzantines', 'Celts', 'Chinese', 'Cumans', 'Danes', 'Dravidians', 'Ethiopians',
      'Franks', 'Georgians', 'Goths', 'Gurjaras', 'Hindustanis', 'Huns', 'Incas', 'Italians',
      'Japanese', 'Jurchens', 'Khitans', 'Khmer', 'Koreans', 'Lithuanians', 'Magyars', 'Malay',
      'Malians', 'Mapuche', 'Mayans', 'Mongols', 'Muisca', 'Persians', 'Poles', 'Portuguese',
      'Romans', 'Saracens', 'Saxons', 'Shu', 'Sicilians', 'Slavs', 'Spanish', 'Tatars',
      'Teutons', 'Tupi', 'Turks', 'Varangians', 'Vietnamese', 'Vikings', 'Wei', 'Wu'
    ];

    const searchLower = state.civSearchFilter.toLowerCase().trim();
    const availableSet = new Set(tech.civs);

    const filtered = allCivs.filter(c => {
      if (!searchLower) return true;
      return c.toLowerCase().includes(searchLower);
    });

    const availableCount = tech.civs.length;
    const unavailableCount = allCivs.length - availableCount;

    return `
      <div class="tech-tab-pane">
        
        <div class="tech-civs-toolbar">
          <div class="civs-summary-box">
            <span class="civs-stat-pill available">✅ Disponibles: ${availableCount}</span>
            <span class="civs-stat-pill unavailable">❌ Carentes: ${unavailableCount}</span>
          </div>

          <div class="civs-search-wrapper">
            <span class="civ-search-icon">🔍</span>
            <input type="text" id="civ-availability-search-input" class="medieval-input" placeholder="Filtrar civilización..." value="${state.civSearchFilter}">
          </div>
        </div>

        <div class="civs-availability-grid">
          ${filtered.map(civName => {
            const isAvail = availableSet.has(civName);
            const isUniqueOwner = tech.isUnique && tech.uniqueCiv && tech.uniqueCiv.toLowerCase() === civName.toLowerCase();
            return `
              <div class="civ-avail-card ${isAvail ? 'is-available' : 'is-unavailable'} ${isUniqueOwner ? 'is-owner' : ''}">
                <div class="civ-card-left">
                  <img src="img/Civs/${civName.toLowerCase()}.png" class="civ-mini-flag" alt="" onerror="this.onerror=null; this.src='img/Civs/generic.png';">
                  <span class="civ-name-label">${civName}</span>
                </div>
                <div class="civ-card-right">
                  ${isUniqueOwner ? `
                    <span class="status-pill status-unique">👑 Exclusiva</span>
                  ` : isAvail ? `
                    <span class="status-pill status-yes">✓ Disponible</span>
                  ` : `
                    <span class="status-pill status-no">✗ Carece</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  function bindCivSearchEvents() {
    const input = document.getElementById('civ-availability-search-input');
    if (input) {
      input.oninput = (e) => {
        state.civSearchFilter = e.target.value;
        const container = document.getElementById('tech-tab-content-area');
        if (container) {
          container.innerHTML = renderCivsTab();
          bindCivSearchEvents();
          // restaurar foco
          const newInput = document.getElementById('civ-availability-search-input');
          if (newInput) {
            newInput.focus();
            newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
          }
        }
      };
    }
  }

  /**
   * Pestaña 4: Bonificaciones de Civilización
   */
  function renderBonusesTab() {
    const tMod = getTechModule();
    const tech = tMod.getTechById(state.currentTechId);
    if (!tech) return '';

    const bonusesData = getRelevantBonusesForTech(tech);

    return `
      <div class="tech-tab-pane">
        <div class="tech-section-block">
          <h4 class="tech-section-title">👑 Bonificaciones de Civilización Aplicables</h4>
          
          ${bonusesData.length === 0 ? `
            <div class="tech-empty-state">
              <p>Esta tecnología no recibe bonificaciones pasivas de civilización específicas adicionales a los costes estándar.</p>
            </div>
          ` : `
            <div class="tech-bonuses-list">
              ${bonusesData.map(b => {
                const isActive = state.currentCiv.toLowerCase().includes(b.civ.toLowerCase());
                return `
                  <div class="tech-bonus-item ${isActive ? 'bonus-highlighted' : ''}">
                    <div class="bonus-header-row">
                      <img src="img/Civs/${b.civ.toLowerCase()}.png" class="bonus-civ-flag" alt="" onerror="this.onerror=null; this.src='img/Civs/generic.png';">
                      <span class="bonus-civ-name">${b.civName}</span>
                      ${isActive ? '<span class="bonus-active-badge">⭐ ACTIVA AHORA</span>' : ''}
                    </div>
                    <p class="bonus-desc-text">${b.desc}</p>
                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>
      </div>
    `;
  }

  function getRelevantBonusesForTech(tech) {
    const list = [];
    const id = tech.id;
    const cat = tech.category;

    // Chinos: Todas las tecnologías
    list.push({
      civ: 'chinese',
      civName: 'Chinos',
      desc: 'Las tecnologías cuestan un -10% en Edad Feudal, -15% en Edad de los Castillos y -20% en Edad Imperial.'
    });

    // Portugueses: Todas las tecnologías
    list.push({
      civ: 'portuguese',
      civName: 'Portugueses',
      desc: 'Todas las tecnologías se investigan un +25% más rápido.'
    });

    // Búlgaros: Herrería
    if (cat === 'blacksmith') {
      list.push({
        civ: 'bulgarians',
        civName: 'Búlgaros',
        desc: 'Las tecnologías de la herrería cuestan un -50% de alimento.'
      });
    }

    // Españoles: Herrería
    if (cat === 'blacksmith') {
      list.push({
        civ: 'spanish',
        civName: 'Españoles',
        desc: 'Las tecnologías de la herrería no cuestan oro.'
      });
    }

    // Bizantinos: Guardia urbana y Patrulla urbana
    if ([8, 280].includes(id)) {
      list.push({
        civ: 'byzantines',
        civName: 'Bizantinos',
        desc: 'Guardia urbana y Patrulla urbana se obtienen automáticamente gratis al avanzar de edad.'
      });
    }

    // Turcos: Química
    if (id === 47) {
      list.push({
        civ: 'turks',
        civName: 'Turcos',
        desc: 'Química se investiga de forma instantánea y completamente gratis al alcanzar la Edad Imperial.'
      });
    }

    // Bohemios: Química
    if (id === 47) {
      list.push({
        civ: 'bohemians',
        civName: 'Bohemios',
        desc: 'Química está disponible para investigar desde la Edad de los Castillos.'
      });
    }

    // Francos: Mejoras de molino
    if ([14, 13, 12].includes(id)) {
      list.push({
        civ: 'franks',
        civName: 'Francos',
        desc: 'Las mejoras de granja (Collera, Arado pesado, Rotación de cultivos) son automáticas y gratuitas al avanzar a su respectiva edad.'
      });
    }

    // Birmanos: Maderero
    if ([202, 203, 221].includes(id)) {
      list.push({
        civ: 'burmese',
        civName: 'Birmanos',
        desc: 'Las mejoras del campamento maderero son gratuitas e instantáneas al avanzar a su respectiva edad.'
      });
    }

    // Tártaros: Thumb Ring y Parthian Tactics
    if ([437, 436].includes(id)) {
      list.push({
        civ: 'tatars',
        civName: 'Tártaros',
        desc: 'Anillo de pulgar y Tácticas partas se obtienen de manera gratuita al avanzar a la edad correspondiente.'
      });
    }

    // Italianos: Tecnologías de muelle
    if (cat === 'dock') {
      list.push({
        civ: 'italians',
        civName: 'Italianos',
        desc: 'Las tecnologías del muelle cuestan un -33% menos de recursos.'
      });
    }

    return list;
  }

  function injectStyles() {
    if (document.getElementById('tech-deep-dive-styles')) return;
    const style = document.createElement('style');
    style.id = 'tech-deep-dive-styles';
    style.textContent = `
      .tech-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(10, 6, 3, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        backdrop-filter: blur(5px);
        padding: 16px;
      }
      .tech-modal-container {
        width: 100%;
        max-width: 920px;
        max-height: 92vh;
        background: #1e1208;
        border: 2px solid #d4af37;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.85);
      }
      .tech-modal-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        background: rgba(0,0,0,0.5);
        border-bottom: 1px solid rgba(212,175,55,0.3);
      }
      .tech-top-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        overflow: hidden;
      }
      .tech-quick-select {
        max-width: 440px;
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 0.9rem;
      }
      .modal-close-icon-btn {
        background: none;
        border: 1px solid rgba(212,175,55,0.4);
        color: #d4af37;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .modal-close-icon-btn:hover {
        background: #c0392b;
        color: #fff;
        border-color: #e74c3c;
      }
      .tech-hero-header {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(180deg, rgba(35, 20, 10, 0.9) 0%, rgba(20, 11, 5, 0.95) 100%);
        border-bottom: 2px solid #5a3819;
        gap: 16px;
        flex-wrap: wrap;
      }
      .tech-hero-icon-box {
        position: relative;
        width: 64px;
        height: 64px;
        background: #110904;
        border: 2px solid #d4af37;
        border-radius: 6px;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tech-hero-icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .tech-hero-age-pip {
        position: absolute;
        bottom: -4px;
        right: -4px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #110904;
      }
      .tech-hero-info {
        flex: 1;
        min-width: 240px;
      }
      .tech-hero-title {
        margin: 0;
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 1.4rem;
        color: #f7d58b;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
      }
      .tech-hero-internal {
        font-size: 0.8rem;
        color: #bfa382;
      }
      .tech-hero-tags {
        display: flex;
        gap: 8px;
        margin-top: 6px;
        flex-wrap: wrap;
      }
      .hero-badge {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(0,0,0,0.4);
        border: 1px solid rgba(212,175,55,0.3);
        color: #e0d0b8;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .mini-building-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }
      .badge-unique.crown-silver {
        border-color: #bdc3c7;
        color: #ecf0f1;
        background: rgba(189, 195, 199, 0.2);
      }
      .badge-unique.crown-gold {
        border-color: #f39c12;
        color: #f1c40f;
        background: rgba(243, 156, 18, 0.2);
      }
      .tech-modal-civ-selector {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .modal-civ-label {
        font-size: 0.75rem;
        color: #d4af37;
      }
      .tech-tabs-nav {
        display: flex;
        background: #150b05;
        border-bottom: 2px solid #3d2311;
        overflow-x: auto;
      }
      .tech-tab-btn {
        background: none;
        border: none;
        border-right: 1px solid rgba(212,175,55,0.15);
        color: #bfa382;
        padding: 10px 18px;
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 0.82rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        transition: all 0.2s;
      }
      .tech-tab-btn:hover {
        background: rgba(212,175,55,0.1);
        color: #f7d58b;
      }
      .tech-tab-btn.active {
        background: #2b180d;
        color: #f7d58b;
        border-bottom: 2px solid #d4af37;
        font-weight: bold;
      }
      .tech-tab-body {
        padding: 18px 20px;
        overflow-y: auto;
        flex: 1;
      }
      .tech-section-block {
        margin-bottom: 20px;
      }
      .tech-section-title {
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 1rem;
        color: #d4af37;
        margin: 0 0 10px 0;
        border-bottom: 1px dashed rgba(212,175,55,0.3);
        padding-bottom: 4px;
      }
      .tech-costs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      .cost-stat-card {
        background: rgba(0,0,0,0.4);
        border: 1px solid rgba(212,175,55,0.25);
        border-radius: 6px;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .res-cost-icon {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
      .res-time-icon {
        font-size: 1.5rem;
      }
      .cost-stat-info {
        display: flex;
        flex-direction: column;
      }
      .res-label {
        font-size: 0.72rem;
        color: #bfa382;
        text-transform: uppercase;
      }
      .res-value {
        font-family: var(--font-serif, serif);
        font-size: 1.15rem;
        font-weight: bold;
        color: #f5f5f5;
      }
      .res-value.discounted {
        color: #2ecc71;
      }
      .base-struck {
        font-size: 0.75rem;
        color: #e74c3c;
        text-decoration: line-through;
      }
      .tech-official-description-box {
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(212,175,55,0.2);
        border-radius: 6px;
        padding: 14px 16px;
        color: #ecd7b7;
        font-size: 0.92rem;
        line-height: 1.5;
        border-left: 4px solid #d4af37;
      }
      .tech-spec-table {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(212,175,55,0.2);
        border-radius: 6px;
        padding: 8px 14px;
      }
      .spec-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        font-size: 0.85rem;
      }
      .spec-row:last-child {
        border-bottom: none;
      }
      .spec-label {
        color: #bfa382;
      }
      .spec-value {
        color: #f7d58b;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .inline-building-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
      }
      .civ-active-bonus-banner {
        background: rgba(46, 204, 113, 0.15);
        border: 1px solid #2ecc71;
        border-radius: 6px;
        padding: 10px 14px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
        margin-bottom: 16px;
        color: #a8e6cf;
        font-size: 0.85rem;
      }
      .civ-active-bonus-banner ul {
        margin: 4px 0 0 16px;
        padding: 0;
      }
      .tech-effect-hero-box {
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 6px;
        padding: 14px;
        margin-bottom: 14px;
      }
      .effect-lead {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .effect-lightning {
        font-size: 2rem;
        color: #f1c40f;
      }
      .effect-lead-content h5 {
        margin: 0 0 4px 0;
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 1.1rem;
        color: #f7d58b;
      }
      .effect-lead-content p {
        margin: 0;
        color: #e0d0b8;
        font-size: 0.9rem;
      }
      .tech-detailed-effects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
      }
      .detailed-effect-card {
        background: rgba(0,0,0,0.25);
        border: 1px solid rgba(212,175,55,0.2);
        border-radius: 6px;
        padding: 12px;
        display: flex;
        gap: 12px;
      }
      .dec-icon {
        font-size: 1.6rem;
      }
      .dec-info h6 {
        margin: 0 0 4px 0;
        color: #d4af37;
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 0.85rem;
      }
      .dec-info p {
        margin: 0;
        color: #cfbc9f;
        font-size: 0.82rem;
        line-height: 1.4;
      }
      .tech-civs-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        gap: 12px;
        flex-wrap: wrap;
      }
      .civs-summary-box {
        display: flex;
        gap: 8px;
      }
      .civs-stat-pill {
        font-size: 0.78rem;
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid;
      }
      .civs-stat-pill.available {
        border-color: #27ae60;
        background: rgba(39, 174, 96, 0.2);
        color: #2ecc71;
      }
      .civs-stat-pill.unavailable {
        border-color: #c0392b;
        background: rgba(192, 57, 43, 0.2);
        color: #e74c3c;
      }
      .civs-search-wrapper {
        position: relative;
        min-width: 220px;
      }
      .civ-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.85rem;
      }
      #civ-availability-search-input {
        padding-left: 30px;
        width: 100%;
        font-size: 0.82rem;
      }
      .civs-availability-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 8px;
        max-height: 480px;
        overflow-y: auto;
      }
      .civ-avail-card {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(212,175,55,0.2);
        border-radius: 4px;
        padding: 6px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .civ-avail-card.is-available {
        border-color: rgba(46, 204, 113, 0.4);
      }
      .civ-avail-card.is-unavailable {
        opacity: 0.55;
        border-color: rgba(231, 76, 60, 0.3);
      }
      .civ-avail-card.is-owner {
        border-color: #f39c12;
        background: rgba(243, 156, 18, 0.15);
      }
      .civ-card-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .civ-mini-flag {
        width: 18px;
        height: 18px;
        object-fit: contain;
      }
      .civ-name-label {
        font-size: 0.8rem;
        color: #e0d0b8;
      }
      .status-pill {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 3px;
      }
      .status-pill.status-yes {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }
      .status-pill.status-no {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
      .status-pill.status-unique {
        background: rgba(243, 156, 18, 0.3);
        color: #f1c40f;
        font-weight: bold;
      }
      .tech-bonuses-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .tech-bonus-item {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(212,175,55,0.25);
        border-left: 4px solid #d4af37;
        border-radius: 4px;
        padding: 10px 14px;
      }
      .tech-bonus-item.bonus-highlighted {
        border-left-color: #2ecc71;
        background: rgba(46, 204, 113, 0.1);
      }
      .bonus-header-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .bonus-civ-flag {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
      .bonus-civ-name {
        font-family: var(--font-cinzel, 'Cinzel', serif);
        font-size: 0.9rem;
        color: #f7d58b;
        font-weight: bold;
      }
      .bonus-active-badge {
        font-size: 0.7rem;
        background: #27ae60;
        color: #fff;
        padding: 2px 6px;
        border-radius: 3px;
        margin-left: auto;
      }
      .bonus-desc-text {
        margin: 0;
        font-size: 0.85rem;
        color: #e0d0b8;
        line-height: 1.4;
      }
      .tech-empty-state {
        padding: 20px;
        text-align: center;
        color: #bfa382;
        font-size: 0.9rem;
      }
    `;
    document.head.appendChild(style);
  }

  return {
    openTechDeepDive,
    closeTechDeepDive,
    switchTab
  };
});
