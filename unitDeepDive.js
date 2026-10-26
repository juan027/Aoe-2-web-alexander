/**
 * unitDeepDive.js
 * Ficha Técnica Avanzada y Modal "Deep Dive" para Unidades de Age of Empires II: DE.
 *
 * Integra el motor matemático de costes dinámicos `unitModifiers.js` y el catálogo
 * de descuentos de civilización `civUnitDiscounts.js`.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.unitDeepDive = exports;
    global.openUnitDeepDive = exports.openUnitDeepDive;
    global.closeUnitDeepDive = exports.closeUnitDeepDive;
    global.AoE2UnitDeepDive = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Estado interno del modal
  const state = {
    currentUnit: null,
    currentCiv: 'generic',
    currentAge: 'imperial',
    activeTechs: [],
    activeTab: 'overview',
    modalEl: null
  };

  const AGE_NAMES = {
    dark: { name: 'Alta Edad Media', short: 'Dark', color: '#7a6652' },
    feudal: { name: 'Edad Feudal', short: 'Feudal', color: '#3b7a42' },
    castle: { name: 'Edad de los Castillos', short: 'Castle', color: '#29689e' },
    imperial: { name: 'Edad Imperial', short: 'Imperial', color: '#9c2222' }
  };

  /**
   * Obtiene la referencia al motor de cálculo de costes
   */
  function getCostCalculator() {
    if (typeof calculateUnitCost === 'function') return calculateUnitCost;
    if (typeof window !== 'undefined' && typeof window.calculateUnitCost === 'function') {
      return window.calculateUnitCost;
    }
    if (typeof require === 'function') {
      try {
        return require('./unitModifiers.js').calculateUnitCost;
      } catch (e) {}
    }
    return null;
  }

  /**
   * Asegura la existencia del contenedor del modal en el DOM
   */
  function ensureModalElement() {
    let modal = document.getElementById('unit-deep-dive-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'unit-deep-dive-modal';
      modal.className = 'unit-deep-dive-modal modal-backdrop';
      modal.style.display = 'none';
      document.body.appendChild(modal);

      injectModalStyles();
    }
    state.modalEl = modal;
    return modal;
  }

  /**
   * Inyecta estilos dedicados para el modal de inspección técnica profunda
   */
  function injectModalStyles() {
    if (document.getElementById('unit-deep-dive-styles')) return;
    const style = document.createElement('style');
    style.id = 'unit-deep-dive-styles';
    style.textContent = `
      .unit-deep-dive-modal.modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }
      .unit-deep-dive-content {
        background: #1e130c;
        border: 2px solid #8e6834;
        border-radius: 6px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.9), inset 0 0 15px rgba(0,0,0,0.6);
        width: 100%;
        max-width: 820px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        color: #f0e6d2;
        font-family: var(--font-main, 'Segoe UI', system-ui, sans-serif);
        overflow: hidden;
      }
      .unit-dd-header {
        background: linear-gradient(to bottom, #3b2314, #26160c);
        border-bottom: 2px solid #6b4c2b;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .unit-dd-header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .unit-dd-portrait {
        width: 64px;
        height: 64px;
        border-radius: 4px;
        border: 2px solid #b8860b;
        background: #000;
        object-fit: contain;
      }
      .unit-dd-title h2 {
        margin: 0;
        font-family: var(--font-serif, 'Cinzel', serif);
        font-size: 1.4rem;
        color: #ffd700;
        text-shadow: 1px 1px 3px #000;
      }
      .unit-dd-title .unit-dd-meta {
        font-size: 0.85rem;
        color: #c7b299;
        display: flex;
        gap: 10px;
        margin-top: 4px;
      }
      .unit-dd-close-btn {
        background: transparent;
        border: 1px solid #7a5832;
        color: #d1b894;
        font-size: 1.3rem;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      .unit-dd-close-btn:hover {
        background: #8b0000;
        color: #fff;
        border-color: #ff3333;
      }
      .unit-dd-tabs {
        display: flex;
        background: #140b06;
        border-bottom: 1px solid #4a301b;
      }
      .unit-dd-tab-btn {
        flex: 1;
        padding: 12px;
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        color: #a8947b;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }
      .unit-dd-tab-btn.active {
        color: #ffd700;
        background: rgba(184, 134, 11, 0.12);
        border-bottom-color: #ffd700;
      }
      .unit-dd-tab-btn:hover:not(.active) {
        color: #f5deb3;
        background: rgba(255, 255, 255, 0.04);
      }
      .unit-dd-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .unit-dd-cost-section {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid #5a3c20;
        border-radius: 4px;
        padding: 14px;
        margin-bottom: 18px;
      }
      .unit-dd-cost-heading {
        margin: 0 0 10px 0;
        font-size: 0.95rem;
        color: #e6c280;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .unit-dd-bonus-callout {
        background: rgba(46, 204, 113, 0.12);
        border-left: 3px solid #2ecc71;
        padding: 10px 12px;
        margin: 8px 0;
        border-radius: 0 4px 4px 0;
        font-size: 0.88rem;
        color: #d4f8e3;
      }
      .unit-dd-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 16px;
      }
      .unit-dd-stat-card {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid #4a301b;
        border-radius: 4px;
        padding: 10px;
        text-align: center;
      }
      .unit-dd-stat-label {
        font-size: 0.78rem;
        color: #a8947b;
        display: block;
        text-transform: uppercase;
      }
      .unit-dd-stat-value {
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffd700;
        margin-top: 4px;
        display: block;
      }
      .unit-dd-armors-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px;
      }
      .unit-dd-armor-item {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #3d2613;
        border-radius: 3px;
        padding: 6px 10px;
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Abre la ficha técnica avanzada de una unidad
   *
   * @param {Object|number} unitOrId - Objeto de unidad o ID canónico.
   * @param {string} [civId] - Civilización activa.
   * @param {string} [age] - Edad ('dark', 'feudal', 'castle', 'imperial').
   * @param {number[]} [activeTechs] - Tecnologías investigadas.
   */
  function openUnitDeepDive(unitOrId, civId = null, age = null, activeTechs = []) {
    const modal = ensureModalElement();

    // Resolver unidad
    let unit = unitOrId;
    if (typeof unitOrId === 'number' || typeof unitOrId === 'string') {
      const uId = Number(unitOrId);
      if (typeof window !== 'undefined' && window.state && Array.isArray(window.state.unitsList)) {
        unit = window.state.unitsList.find(u => u.ID === uId);
      }
    }

    if (!unit) {
      console.warn('[unitDeepDive] No se pudo encontrar la unidad:', unitOrId);
      return;
    }

    // Heredar estado global si no se proveyó
    let effectiveCiv = civId;
    if (!effectiveCiv && typeof window !== 'undefined' && window.state) {
      effectiveCiv = window.state.selectedCiv || window.state.selectedBuildingCiv || 'generic';
    }
    if (!effectiveCiv || effectiveCiv === 'all') effectiveCiv = 'generic';

    let effectiveAge = age;
    if (!effectiveAge && typeof window !== 'undefined' && window.state) {
      const a = window.state.selectedAge;
      effectiveAge = a === '1' ? 'dark' : (a === '2' ? 'feudal' : (a === '3' ? 'castle' : 'imperial'));
    }
    if (!effectiveAge) effectiveAge = 'imperial';

    state.currentUnit = unit;
    state.currentCiv = effectiveCiv;
    state.currentAge = effectiveAge;
    state.activeTechs = Array.isArray(activeTechs) ? activeTechs : [];
    state.activeTab = 'overview';

    renderModalContent();
    modal.style.display = 'flex';
  }

  /**
   * Cierra el modal de inspección
   */
  function closeUnitDeepDive() {
    if (state.modalEl) {
      state.modalEl.style.display = 'none';
    }
  }

  /**
   * Renderiza el contenido completo del modal
   */
  function renderModalContent() {
    const modal = state.modalEl;
    if (!modal || !state.currentUnit) return;

    const unit = state.currentUnit;
    const civId = state.currentCiv;
    const ageKey = state.currentAge;
    const calcFn = getCostCalculator();

    // 1. Calcular costes dinámicos
    let costResult = null;
    if (calcFn) {
      costResult = calcFn(
        {
          id: unit.ID ?? unit.id,
          name: unit.localizedName ?? unit.name,
          classes: (unit.Armours || []).map(a => a.Class),
          cost: unit.Cost || unit.cost
        },
        civId,
        ageKey,
        state.activeTechs
      );
    }

    const ageInfo = AGE_NAMES[ageKey] || AGE_NAMES.imperial;
    const imgSrc = `./img/units/${unit.ID}.png`;
    const fallbackSrc = `./img/Unit/${unit.ID}.png`;

    modal.innerHTML = `
      <div class="unit-deep-dive-content" onclick="event.stopPropagation()">
        <!-- Encabezado -->
        <div class="unit-dd-header">
          <div class="unit-dd-header-left">
            <img 
              src="${imgSrc}" 
              alt="${unit.localizedName}" 
              class="unit-dd-portrait"
              onerror="if (!this.dataset.tried) { this.dataset.tried=1; this.src='${fallbackSrc}'; } else { this.style.display='none'; }"
            >
            <div class="unit-dd-title">
              <h2>${unit.localizedName || unit.internal_name}</h2>
              <div class="unit-dd-meta">
                <span style="color:${ageInfo.color}; font-weight:bold;">${ageInfo.name}</span>
                <span>•</span>
                <span>ID #${unit.ID}</span>
                <span>•</span>
                <span>Facción: <strong style="color:#ffd700;">${costResult ? costResult.civName : civId}</strong></span>
              </div>
            </div>
          </div>
          <button class="unit-dd-close-btn" id="unit-dd-close-x" title="Cerrar (Esc)">✕</button>
        </div>

        <!-- Pestañas -->
        <div class="unit-dd-tabs">
          <button class="unit-dd-tab-btn ${state.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            🪙 Costes y Producción
          </button>
          <button class="unit-dd-tab-btn ${state.activeTab === 'stats' ? 'active' : ''}" data-tab="stats">
            ⚔️ Atributos de Combate
          </button>
          <button class="unit-dd-tab-btn ${state.activeTab === 'armors' ? 'active' : ''}" data-tab="armors">
            🛡️ Armaduras y Bonus Ocultos
          </button>
          <button class="unit-dd-tab-btn ${state.activeTab === 'upgrades' ? 'active' : ''}" data-tab="upgrades">
            ⚡ Mejoras y Tecnologías
          </button>
          <button class="unit-dd-tab-btn ${state.activeTab === 'lore' ? 'active' : ''}" data-tab="lore">
            📜 Historia y Ficha Técnica
          </button>
        </div>

        <!-- Cuerpo de Pestaña -->
        <div class="unit-dd-body">
          ${renderTabContent(unit, costResult)}
        </div>
      </div>
    `;

    // Asignar listeners
    modal.onclick = (e) => {
      if (e.target === modal) closeUnitDeepDive();
    };

    const closeBtn = modal.querySelector('#unit-dd-close-x');
    if (closeBtn) closeBtn.onclick = closeUnitDeepDive;

    modal.querySelectorAll('.unit-dd-tab-btn').forEach(btn => {
      btn.onclick = () => {
        state.activeTab = btn.dataset.tab;
        renderModalContent();
      };
    });
  }

  /**
   * Renderiza el contenido interno según la pestaña seleccionada
   */
  function renderTabContent(unit, costResult) {
    if (state.activeTab === 'overview') {
      return renderOverviewTab(unit, costResult);
    }
    if (state.activeTab === 'stats') {
      return renderStatsTab(unit);
    }
    if (state.activeTab === 'armors') {
      return renderArmorsTab(unit);
    }
    if (state.activeTab === 'upgrades') {
      return renderUpgradesTab(unit);
    }
    if (state.activeTab === 'lore') {
      return renderLoreTab(unit);
    }
    return '';
  }

  function renderOverviewTab(unit, costResult) {
    const rawCost = unit.Cost || {};
    const finalCost = costResult ? costResult.cost : {
      food: rawCost.Food || 0,
      wood: rawCost.Wood || 0,
      gold: rawCost.Gold || 0,
      stone: rawCost.Stone || 0
    };
    const isDiscounted = costResult ? costResult.isDiscounted : false;

    // Desglose de chips
    const chipsHTML = [];
    const resources = [
      { key: 'food', label: 'Comida', icon: '🥩', base: rawCost.Food || 0, cur: finalCost.food, css: 'res-food' },
      { key: 'wood', label: 'Madera', icon: '🪵', base: rawCost.Wood || 0, cur: finalCost.wood, css: 'res-wood' },
      { key: 'gold', label: 'Oro', icon: '🪙', base: rawCost.Gold || 0, cur: finalCost.gold, css: 'res-gold' },
      { key: 'stone', label: 'Piedra', icon: '🪨', base: rawCost.Stone || 0, cur: finalCost.stone, css: 'res-stone' }
    ];

    resources.forEach(res => {
      if (res.base > 0 || res.cur > 0) {
        if (res.cur < res.base) {
          chipsHTML.push(`
            <div class="resource-chip ${res.css}" style="background:rgba(0,0,0,0.4); border:1px solid #2ecc71; padding:8px 12px; border-radius:4px; display:inline-flex; align-items:center; gap:6px;">
              <span>${res.icon}</span>
              <span style="text-decoration:line-through; opacity:0.6;">${res.base}</span>
              <span style="color:#2ecc71; font-weight:bold; font-size:1.1rem;">${res.cur}</span>
              <span>${res.label}</span>
            </div>
          `);
        } else {
          chipsHTML.push(`
            <div class="resource-chip ${res.css}" style="background:rgba(0,0,0,0.4); border:1px solid #5a3c20; padding:8px 12px; border-radius:4px; display:inline-flex; align-items:center; gap:6px;">
              <span>${res.icon}</span>
              <span style="font-weight:bold; font-size:1.1rem;">${res.cur}</span>
              <span>${res.label}</span>
            </div>
          `);
        }
      }
    });

    // Bonificaciones activas
    let bonusesHTML = '';
    if (costResult && costResult.discountsApplied.length > 0) {
      bonusesHTML = `
        <h4 style="color:#ffd700; margin:16px 0 8px 0;">🏷️ Descuentos de Civilización Aplicados:</h4>
        ${costResult.discountsApplied.map(d => `
          <div class="unit-dd-bonus-callout">
            <strong>${d.name} (${d.ratePercent} de descuento en ${d.resource.toUpperCase()}):</strong><br>
            <em>"${d.sourceDescription}"</em>
          </div>
        `).join('')}
      `;
    } else if (costResult && costResult.costConversionApplied) {
      bonusesHTML = `
        <h4 style="color:#ffd700; margin:16px 0 8px 0;">🔄 Conversión de Recursos Activa:</h4>
        <div class="unit-dd-bonus-callout" style="border-left-color:#3498db; background:rgba(52,152,219,0.12);">
          <strong>${costResult.costConversionApplied.rule}</strong><br>
          <em>"${costResult.costConversionApplied.sourceDescription}"</em>
        </div>
      `;
    } else {
      bonusesHTML = `
        <p style="color:#8c7860; font-style:italic; margin-top:12px;">
          Esta unidad se produce a coste estándar base bajo la facción <strong>${costResult ? costResult.civName : state.currentCiv}</strong>.
        </p>
      `;
    }

    return `
      <div class="unit-dd-cost-section">
        <div class="unit-dd-cost-heading">
          <span>Coste de Entrenamiento</span>
          ${isDiscounted ? `
            <span style="color:#2ecc71; font-weight:bold; font-size:0.85rem; background:rgba(46,204,113,0.15); padding:2px 8px; border-radius:3px;">
              Ahorro Total: -${costResult.totalSavings.total} recursos (-${costResult.discountPercent}%)
            </span>
          ` : ''}
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          ${chipsHTML.join('')}
        </div>
        ${bonusesHTML}
      </div>

      <div class="unit-dd-stats-grid">
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Tiempo de Creación</span>
          <span class="unit-dd-stat-value">${unit.TrainTime ? `${unit.TrainTime}s` : '-'}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Espacio Población</span>
          <span class="unit-dd-stat-value">1 Hab</span>
        </div>
        <div class="unit-dd-stat-label unit-dd-stat-card">
          <span class="unit-dd-stat-label">Velocidad</span>
          <span class="unit-dd-stat-value">${unit.Speed ? `${unit.Speed.toFixed(2)} c/s` : '-'}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Línea de Visión (LOS)</span>
          <span class="unit-dd-stat-value">${unit.LineOfSight || '-'}</span>
        </div>
      </div>
    `;
  }

  function renderStatsTab(unit) {
    const rangeText = unit.Range > 0 ? (unit.MinRange > 0 ? `${unit.MinRange} - ${unit.Range}` : `${unit.Range}`) : 'Cuerpo a cuerpo';
    const accuracyText = unit.AccuracyPercent ? `${unit.AccuracyPercent}%` : '100%';
    const dps = (unit.Attack && unit.ReloadTime) ? (unit.Attack / unit.ReloadTime).toFixed(2) : '-';

    const uid = Number(unit.ID ?? unit.id ?? 0);
    const unitName = String(unit.name || unit.localizedName || unit.internal_name || '').toLowerCase();
    const isArbalester = uid === 492 || [4, 24, 492].includes(uid) || unitName.includes('arbalest') || unitName.includes('arbalesta') || ['ACOAR', 'ARBLST'].includes(unit.internal_name);
    const civId = String(state.currentCiv || '').toLowerCase();
    const isShu = ['shu'].includes(civId);
    const isShuArbalest = isArbalester && isShu;

    const baseProj = Number(unit.projectiles || 1);
    const effectiveProj = isShuArbalest ? 3 : baseProj;
    const showProjCard = effectiveProj > 1;

    let projValueText = `${effectiveProj}`;
    if (isShuArbalest) {
      projValueText = '3 (1 principal + 2 adicionales)';
    }

    return `
      <div class="unit-dd-stats-grid">
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Puntos de Vida (HP)</span>
          <span class="unit-dd-stat-value" style="color:#2ecc71;">${unit.HP}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Ataque Base</span>
          <span class="unit-dd-stat-value" style="color:#e67e22;">${unit.Attack !== undefined ? unit.Attack : '-'}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Armadura Melee</span>
          <span class="unit-dd-stat-value">${unit.MeleeArmor !== undefined ? unit.MeleeArmor : 0}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Armadura Pierce</span>
          <span class="unit-dd-stat-value">${unit.PierceArmor !== undefined ? unit.PierceArmor : 0}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Alcance (Rango)</span>
          <span class="unit-dd-stat-value">${rangeText}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Cadencia (Reload)</span>
          <span class="unit-dd-stat-value">${unit.ReloadTime ? `${unit.ReloadTime.toFixed(2)}s` : '-'}</span>
        </div>
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">Precisión</span>
          <span class="unit-dd-stat-value">${accuracyText}</span>
        </div>
        ${showProjCard ? `
          <div class="unit-dd-stat-card">
            <span class="unit-dd-stat-label">Proyectiles por Salva</span>
            <span class="unit-dd-stat-value" style="color:#e67e22;">${projValueText}</span>
          </div>
        ` : ''}
        <div class="unit-dd-stat-card">
          <span class="unit-dd-stat-label">DPS Teórico Base</span>
          <span class="unit-dd-stat-value" style="color:#ffd700;">${dps} / s</span>
        </div>
      </div>

      ${isShuArbalest ? `
        <div class="unit-dd-bonus-callout" style="border-left-color:#ffd700; background:rgba(241,196,15,0.12); margin-top:16px;">
          <strong style="color:#ffd700; font-size:0.92rem;">🏹 Salva de Ráfaga Múltiple (Cargador / Corona de Oro #1069 - Shu):</strong><br>
          <span style="font-size:0.86rem; color:#dcdde1; line-height:1.4; display:block; margin-top:4px;">
            Al investigar la Corona de Oro (Cargador), la Arbalesta dispara una <strong>ráfaga de 3 proyectiles</strong> por salva: 1 proyectil principal (${unit.Attack !== undefined ? unit.Attack : 6} ATQ) + <strong>2 proyectiles secundarios de 1 ATQ base</strong> c/u (con daño mínimo garantizado de 1 en motor Genie).
          </span>
        </div>
      ` : ''}
    `;
  }

  function renderArmorsTab(unit) {
    const armours = unit.Armours || [];
    const attacks = unit.Attacks || [];
    const bonusAttacks = attacks.filter(atk => atk.Class !== 4 && atk.Class !== 3 && atk.Amount > 0);

    return `
      <h4 style="color:#e6c280; margin:0 0 8px 0;">🛡️ Clases de Armadura Genie Engine</h4>
      <p style="font-size:0.83rem; color:#a8947b; margin-bottom:12px;">
        Define cómo interactúan las bonificaciones de daño de los contrincantes con esta unidad:
      </p>
      <div class="unit-dd-armors-list" style="margin-bottom:20px;">
        ${armours.length > 0 ? armours.map(arm => `
          <div class="unit-dd-armor-item">
            <span>Clase #${arm.Class}</span>
            <strong style="color:${arm.Amount >= 0 ? '#2ecc71' : '#e74c3c'};">${arm.Amount > 0 ? `+${arm.Amount}` : arm.Amount}</strong>
          </div>
        `).join('') : '<p style="color:#777;">Sin clases de armadura asignadas.</p>'}
      </div>

      <h4 style="color:#e6c280; margin:0 0 8px 0;">⚔️ Bonus de Ataque Específicos</h4>
      <div class="unit-dd-armors-list">
        ${bonusAttacks.length > 0 ? bonusAttacks.map(atk => `
          <div class="unit-dd-armor-item">
            <span>vs Clase #${atk.Class}</span>
            <strong style="color:#e67e22;">+${atk.Amount} daño</strong>
          </div>
        `).join('') : '<p style="color:#777;">Esta unidad no posee bonus de ataque especializados adicionales.</p>'}
      </div>
    `;
  }

  function renderUpgradesTab(unit) {
    const uid = Number(unit.ID ?? unit.id ?? 0);
    const unitName = String(unit.name || unit.localizedName || unit.internal_name || '').toLowerCase();
    const isScorpion = [279, 542].includes(uid) || ['SCBAL', 'HWBAL'].includes(unit.internal_name) || unitName.includes('scorpion') || unitName.includes('escorpión') || unitName.includes('escorpion');
    const isChuKoNu = [73, 559].includes(uid) || ['CHUKN', 'ECHUKN'].includes(unit.internal_name) || unitName.includes('chu ko nu') || unitName.includes('chuko');
    const isRocketCart = [1904, 1907].includes(uid) || ['RCKTCRT', 'HRCKTCRT'].includes(unit.internal_name) || unitName.includes('rocket_cart') || unitName.includes('carro de cohetes') || unitName.includes('carro_cohete');
    const isArbalester = uid === 492 || [4, 24, 492].includes(uid) || ['ACOAR', 'ARBLST'].includes(unit.internal_name) || unitName.includes('arbalest') || unitName.includes('arbalesta');
    const civId = String(state.currentCiv || '').toLowerCase();
    const isShu = ['shu'].includes(civId);

    if (isScorpion) {
      return `
        <!-- Aviso de exclusión estricta de Herrería -->
        <div class="unit-dd-bonus-callout" style="border-left-color:#e74c3c; background:rgba(231,76,60,0.12); margin-bottom:16px;">
          <strong style="color:#e74c3c; font-size:0.95rem;">🚫 Excluido de la Herrería (Reglas de Motor Genie):</strong><br>
          <span style="font-size:0.88rem; color:#dcdde1; line-height:1.4; display:block; margin-top:4px;">
            Los escorpiones son armas de asedio mecánicas y <strong>no reciben ninguna mejora de la herrería</strong> (Flechas, Punzón, Braseril ni armaduras de arqueros, infantería o caballería).
          </span>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">🏛️ Tecnologías Canónicas de la Universidad</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:20px;">
          <div class="unit-dd-armor-item">
            <span><strong>Química</strong> (Edad Imperial)</span>
            <strong style="color:#2ecc71;">+1 Ataque perforante</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Ingenieros de asedio</strong> (Edad Imperial)</span>
            <strong style="color:#3498db;">+1 Alcance • +20% vs edificios</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Balística</strong> (Edad de los Castillos)</span>
            <strong style="color:#f39c12;">Precisión guiada vs objetivos móviles</strong>
          </div>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">👑 Tecnologías Únicas & Coronas de Civilización</h4>
        <div class="unit-dd-armors-list">
          <div class="unit-dd-armor-item">
            <span><strong>Cohetería</strong> (Chinos • Corona Imperial #52)</span>
            <strong style="color:#ffd700;">+25% de ataque</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Balistas</strong> (Romanos • Corona de Castillos)</span>
            <strong style="color:#e67e22;">+33% velocidad de ataque</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Doble ballesta</strong> (Jemeres • Corona Imperial)</span>
            <strong style="color:#9b59b6;">Dispara 1 virote secundario extra</strong>
          </div>
        </div>
      `;
    }

    if (isChuKoNu) {
      return `
        <h4 style="color:#e6c280; margin:0 0 10px 0;">🔨 Mejoras de Herrería Aplicables (Arquero a Pie)</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:18px;">
          <div class="unit-dd-armor-item">
            <span><strong>Flechas / Punzón / Braseril</strong></span>
            <strong style="color:#2ecc71;">+1/+2/+3 Ataque y Alcance</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Armadura acolchada / Cuero / Anillas</strong></span>
            <strong style="color:#3498db;">+1/+1, +2/+2, +3/+4 Armadura</strong>
          </div>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">🏛️ Universidad & Galería de Tiro con Arco</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:18px;">
          <div class="unit-dd-armor-item">
            <span><strong>Química</strong> (Universidad • Edad Imperial)</span>
            <strong style="color:#2ecc71;">+1 Ataque perforante</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Balística</strong> (Universidad • Edad de los Castillos)</span>
            <strong style="color:#f39c12;">Precisión vs objetivos en movimiento</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Dedo de arquero</strong> (Galería • Castillos)</span>
            <strong style="color:#e67e22;">100% Precisión y cadencia máxima</strong>
          </div>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">👑 Tecnologías Únicas (Chinos)</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:16px;">
          <div class="unit-dd-armor-item">
            <span><strong>La Gran Muralla</strong> (Corona de Castillos)</span>
            <strong style="color:#ffd700;">Murallas y defensas +30% PR</strong>
          </div>
        </div>

        <div class="unit-dd-bonus-callout" style="border-left-color:#3498db; background:rgba(52,152,219,0.12);">
          <strong style="color:#74b9ff;">ℹ️ Balance Técnico Actual de Cohetería:</strong><br>
          <span style="font-size:0.86rem; color:#c8d6e5; line-height:1.4; display:block; margin-top:4px;">
            En la versión y balance actual de AoE2 DE, <strong>Cohetería (Rocketry)</strong> ya <em>no</em> otorga bonificación de ataque al Chu Ko Nu. Se centra exclusivamente en otorgar un <strong>+25% de ataque</strong> a las armas de asedio de virotes/cohetes (Escorpiones y Carro de cohetes).
          </span>
        </div>
      `;
    }

    if (isRocketCart) {
      return `
        <!-- Aviso de Asedio sin Herrería -->
        <div class="unit-dd-bonus-callout" style="border-left-color:#e74c3c; background:rgba(231,76,60,0.12); margin-bottom:16px;">
          <strong style="color:#e74c3c; font-size:0.95rem;">🚫 Sin mejoras de Herrería:</strong><br>
          <span style="font-size:0.88rem; color:#dcdde1; line-height:1.4; display:block; margin-top:4px;">
            El Carro de cohetes es una máquina de asedio y pólvora, por lo que no recibe las mejoras de ataque o armadura de la herrería.
          </span>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">🏛️ Tecnologías de Universidad</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:20px;">
          <div class="unit-dd-armor-item">
            <span><strong>Ingenieros de asedio</strong> (Edad Imperial)</span>
            <strong style="color:#3498db;">+1 Alcance • +20% vs edificios</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Química</strong> (Edad Imperial)</span>
            <strong style="color:#2ecc71;">+1 Ataque</strong>
          </div>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">👑 Tecnologías Únicas & Coronas de Civilización</h4>
        <div class="unit-dd-armors-list">
          <div class="unit-dd-armor-item">
            <span><strong>Cohetería</strong> (Chinos • Corona Imperial #52)</span>
            <strong style="color:#ffd700;">+25% de ataque</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Shinkichon</strong> (Coreanos • Corona Imperial #445)</span>
            <strong style="color:#3498db;">+1 Alcance y salva ampliada a 16 cohetes</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Bombas trueno</strong> (Yurchen/Jurchen • Corona Imperial #997)</span>
            <strong style="color:#e74c3c;">+4 Daño de impacto explosivo y detonación al morir</strong>
          </div>
        </div>
      `;
    }

    if (isArbalester) {
      return `
        ${isShu ? `
          <div class="unit-dd-bonus-callout" style="border-left-color:#ffd700; background:rgba(241,196,15,0.12); margin-bottom:16px;">
            <strong style="color:#ffd700; font-size:0.95rem;">👑 Tecnología Única Imperial de Shu — Cargador (#1069):</strong><br>
            <span style="font-size:0.88rem; color:#dcdde1; line-height:1.4; display:block; margin-top:4px;">
              Dispara una <strong>salva de 3 proyectiles</strong>: 1 proyectil primario con el ataque completo + <strong>2 proyectiles secundarios adicionales</strong> con 1 de daño base perforante (con suelo de daño de 1 garantizado en motor Genie).
            </span>
          </div>
        ` : ''}

        <h4 style="color:#e6c280; margin:0 0 10px 0;">🔨 Herrería Aplicable (Arqueros a Pie)</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:18px;">
          <div class="unit-dd-armor-item">
            <span><strong>Flechas / Punzón / Braseril</strong></span>
            <strong style="color:#2ecc71;">+1/+2/+3 Ataque y Alcance</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Armadura acolchada / Cuero / Anillas</strong></span>
            <strong style="color:#3498db;">+1/+1, +2/+2, +3/+4 Armadura</strong>
          </div>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">🏛️ Tecnologías de Universidad & Galería</h4>
        <div class="unit-dd-armors-list" style="margin-bottom:18px;">
          <div class="unit-dd-armor-item">
            <span><strong>Química</strong> (Universidad • Edad Imperial)</span>
            <strong style="color:#2ecc71;">+1 Ataque perforante</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Balística</strong> (Universidad • Edad de los Castillos)</span>
            <strong style="color:#f39c12;">Precisión guiada vs objetivos en movimiento</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Dedo de arquero</strong> (Galería • Castillos)</span>
            <strong style="color:#e67e22;">100% Precisión y cadencia de tiro aumentada</strong>
          </div>
        </div>

        <h4 style="color:#e6c280; margin:0 0 10px 0;">👑 Tecnologías Únicas & Coronas de Civilización</h4>
        <div class="unit-dd-armors-list">
          <div class="unit-dd-armor-item">
            <span><strong>Cargador</strong> (Shu • Corona Imperial #1069)</span>
            <strong style="color:#ffd700;">Ráfaga de 3 proyectiles (+2 secundarios de 1 ATQ)</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Yeomen</strong> (Británicos • Corona de Castillos #3)</span>
            <strong style="color:#3498db;">+1 Alcance</strong>
          </div>
          <div class="unit-dd-armor-item">
            <span><strong>Pavía</strong> (Italianos • Corona de Castillos #481)</span>
            <strong style="color:#2ecc71;">+1/+1 Armadura</strong>
          </div>
        </div>
      `;
    }

    // Unidades genéricas
    return `
      <div style="background:rgba(0,0,0,0.3); border:1px solid #4a301b; padding:16px; border-radius:4px; line-height:1.6; font-size:0.92rem; color:#d9c5af;">
        <h4 style="color:#ffd700; margin-top:0;">Mejoras Disponibles para ${unit.localizedName || unit.name}</h4>
        <p>
          Las tecnologías de herrería, universidad y edificios militares aplican según la clase de combate de la unidad (infantería, caballería, arqueros o asedio).
        </p>
      </div>
    `;
  }

  function renderLoreTab(unit) {
    return `
      <div style="background:rgba(0,0,0,0.3); border:1px solid #4a301b; padding:16px; border-radius:4px; line-height:1.6; font-size:0.92rem; color:#d9c5af;">
        <h4 style="color:#ffd700; margin-top:0;">Ficha Histórica y Técnica Oficial</h4>
        <p>
          ${unit.description ? unit.description.replace(/‹DEFAULT›/g, '').replace(/‹.*?›/g, '') : 'No hay descripción histórica disponible en la base de datos para esta unidad.'}
        </p>
        <hr style="border-color:#3d2613; margin:16px 0;">
        <div style="font-size:0.82rem; color:#8c7860;">
          <strong>Datos Internos:</strong> ID: #${unit.ID} • Nombre Técnico: <code>${unit.internal_name || 'N/A'}</code>
        </div>
      </div>
    `;
  }

  // Listener para cerrar con tecla Escape
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.modalEl && state.modalEl.style.display !== 'none') {
        closeUnitDeepDive();
      }
    });
  }

  return {
    openUnitDeepDive,
    closeUnitDeepDive
  };
});
