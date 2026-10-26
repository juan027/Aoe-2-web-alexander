/**
 * combatSimulator.js
 * Fachada Modular del Simulador de Combate 1 vs 1 para Age of Empires II: DE.
 *
 * Expone la API de simulación de duelo, inicialización de combatientes, cálculo de
 * eficiencia de recursos post-combate y renderizado dinámico de costes en la UI.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(
      typeof require === 'function' ? (function () {
        try { return require('./combat.js'); } catch (e) { return null; }
      })() : null,
      typeof require === 'function' ? (function () {
        try { return require('./unitModifiers.js'); } catch (e) { return null; }
      })() : null,
      typeof require === 'function' ? (function () {
        try { return require('./units.js'); } catch (e) { return null; }
      })() : null
    );
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory(global.AoE2Combat, global.unitModifiers, global.unitsModule);
    global.combatSimulator = exports;
    global.simulateDuel = exports.simulateDuel;
    global.simulateCombat = exports.simulateCombat;
    global.initCombatant = exports.initCombatant;
    global.getUnitTotalCost = exports.getUnitTotalCost;
    global.calculateResourceEfficiency = exports.calculateResourceEfficiency;
    global.calculateDynamicUnitStats = exports.calculateDynamicUnitStats;
    global.calculateUnitStats = exports.calculateUnitStats;
    global.getModifiersAvailability = exports.getModifiersAvailability;
    global.updateModifiersAvailability = exports.updateModifiersAvailability;
    global.renderCombatantCost = exports.renderCombatantCost;
    global.updateAllCombatantCosts = exports.updateAllCombatantCosts;
  }
})(typeof window !== 'undefined' ? window : this, function (combatMod, uMod, unitsMod) {
  'use strict';

  function getBaseCombat() {
    if (combatMod) return combatMod;
    if (typeof window !== 'undefined' && window.AoE2Combat) return window.AoE2Combat;
    if (typeof require === 'function') {
      try { return require('./combat.js'); } catch (e) {}
    }
    return null;
  }

  function getModifiersModule() {
    if (uMod) return uMod;
    if (typeof window !== 'undefined' && window.unitModifiers) return window.unitModifiers;
    if (typeof require === 'function') {
      try { return require('./unitModifiers.js'); } catch (e) {}
    }
    return null;
  }

  function getUnitsModule() {
    if (unitsMod) return unitsMod;
    if (typeof window !== 'undefined' && window.unitsModule) return window.unitsModule;
    if (typeof require === 'function') {
      try { return require('./units.js'); } catch (e) {}
    }
    return null;
  }

  /**
   * Determina la disponibilidad de controles y selectores de herrería en la UI
   * para la unidad seleccionada.
   *
   * Regla para camellos cuerpo a cuerpo:
   * - ARMADURA CABALLERÍA: Habilitada (permite Escamas, Malla, Placas de barda).
   * - ARMADURA INFANTERÍA: Bloqueada (disabled = true, fijada en 0).
   * - ARMADURA ARQUEROS: Bloqueada (disabled = true).
   * - PUREZA DE SANGRE y GANADERÍA: Habilitadas (+20 HP, +10% Vel).
   * - HERRERÍA MELEE: Habilitada (+1, +2, +4 Atk).
   */
  function getModifiersAvailability(unit) {
    if (!unit) {
      return {
        cavalryArmor: false,
        infantryArmor: false,
        archerArmor: false,
        bloodlines: false,
        husbandry: false,
        meleeSmithing: false,
        pierceSmithing: false,
        chemistry: true,
        siegeEngineers: false,
        ballistics: true,
        isScorpion: false,
        isRocketCart: false,
        isChuKoNu: false
      };
    }

    const uMod = getUnitsModule();
    const uid = Number(unit.ID ?? unit.id ?? 0);
    const unitName = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();

    const isCamel = (uMod && typeof uMod.isCamelUnit === 'function')
      ? uMod.isCamelUnit(unit)
      : (function () {
          const camelIds = [207, 282, 329, 330, 556, 1007, 1009, 1263, 1755, 1923];
          if (camelIds.includes(uid)) return true;
          const armours = unit.Armours || unit.armours || [];
          return armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === 30);
        })();

    const isCamelArcher = (uMod && typeof uMod.isCamelArcherUnit === 'function')
      ? uMod.isCamelArcherUnit(unit)
      : (function () {
          return uid === 1007 || uid === 1009;
        })();

    const isMeleeCamel = isCamel && !isCamelArcher;

    const isScorpion = (uMod && typeof uMod.isScorpionUnit === 'function')
      ? uMod.isScorpionUnit(unit)
      : ([279, 542].includes(uid) || unitName.includes('scorpion') || unitName.includes('escorpión') || unitName.includes('escorpion'));

    const isRocketCart = (uMod && typeof uMod.isRocketCartUnit === 'function')
      ? uMod.isRocketCartUnit(unit)
      : ([1904, 1907].includes(uid) || unitName.includes('rocket_cart') || unitName.includes('carro de cohetes') || unitName.includes('carro_cohete'));

    const isChuKoNu = (uMod && typeof uMod.isChuKoNuUnit === 'function')
      ? uMod.isChuKoNuUnit(unit)
      : ([73, 559].includes(uid) || unitName.includes('chu ko nu') || unitName.includes('chuko'));

    const armours = unit.Armours || unit.armours || [];
    const hasCls = (cls) => armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === cls);

    const isShip = hasCls(22) || hasCls(16);
    const isSiege = hasCls(20) || isScorpion || isRocketCart;
    const isArch = (hasCls(15) || isCamelArcher) && !isSiege;
    const isCav = (hasCls(8) || hasCls(19) || isMeleeCamel) && !isArch && !isSiege;
    const isInf = (hasCls(1) || hasCls(11)) && !isCamel && !isSiege;

    const attacks = unit.Attacks || unit.attacks || [];
    const hasMelee = attacks.some(a => (typeof a === 'object' ? a.Class : Number(a)) === 4 && (a.Amount ?? a.amount ?? 0) > 0);
    const hasPierce = attacks.some(a => (typeof a === 'object' ? a.Class : Number(a)) === 3 && (a.Amount ?? a.amount ?? 0) > 0);
    const range = Number(unit.Range ?? unit.range ?? 0);

    return {
      isCamel,
      isMeleeCamel,
      isCamelArcher,
      isScorpion,
      isRocketCart,
      isChuKoNu,
      isSiege,
      cavalryArmor: !isShip && !isSiege && isCav,
      infantryArmor: !isShip && !isSiege && isInf,
      archerArmor: !isShip && !isSiege && isArch,
      bloodlines: !isShip && !isSiege && (isCav || isMeleeCamel),
      husbandry: !isShip && !isSiege && (isCav || isMeleeCamel),
      meleeSmithing: !isShip && !isSiege && Boolean(hasMelee),
      pierceSmithing: !isShip && !isSiege && Boolean(isArch || (hasPierce && range > 0)),
      chemistry: true,
      siegeEngineers: Boolean(isSiege),
      ballistics: true
    };
  }

  /**
   * Actualiza dinámicamente los controles del DOM según la disponibilidad de la unidad.
   * Para la línea de Escorpiones y asedio, desvincula por completo la herrería (Melee, Flechas, Armaduras)
   * y garantiza que las mejoras de la Universidad (Química, Balística) permanezcan habilitadas.
   */
  function updateModifiersAvailability(unit, side = 'a', domElements = null) {
    const avail = getModifiersAvailability(unit);
    const s = String(side).toUpperCase();
    const DOM = domElements || (typeof window !== 'undefined' && window.DOM ? window.DOM : null);

    if (DOM) {
      // 1. Armadura de Caballería
      const cavSelect = DOM[`duelArmorCav${s}`];
      const cavRow = DOM[`duelArmorCavRow${s}`];
      if (cavSelect) {
        cavSelect.disabled = !avail.cavalryArmor;
        if (!avail.cavalryArmor) {
          cavSelect.value = '0';
          cavSelect.classList.add('tech-locked');
        } else {
          cavSelect.classList.remove('tech-locked');
        }
        if (cavRow) cavRow.style.display = avail.cavalryArmor ? '' : 'none';
      }

      // 2. Armadura de Infantería
      const infSelect = DOM[`duelArmor${s}`];
      const infRow = DOM[`duelArmorRow${s}`];
      if (infSelect) {
        infSelect.disabled = !avail.infantryArmor;
        if (!avail.infantryArmor) {
          infSelect.value = '0';
          infSelect.classList.add('tech-locked');
        } else {
          infSelect.classList.remove('tech-locked');
        }
        if (infRow) infRow.style.display = avail.infantryArmor ? '' : 'none';
      }

      // 3. Armadura de Arqueros
      const archSelect = DOM[`duelArmorArch${s}`];
      const archRow = DOM[`duelArmorArchRow${s}`];
      if (archSelect) {
        archSelect.disabled = !avail.archerArmor;
        if (!avail.archerArmor) {
          archSelect.value = '0';
          archSelect.classList.add('tech-locked');
        } else {
          archSelect.classList.remove('tech-locked');
        }
        if (archRow) archRow.style.display = avail.archerArmor ? '' : 'none';
      }

      // 4. Herrería Melee (Deshabilitada para Escorpiones y Asedio)
      const meleeSelect = DOM[`duelSmithMelee${s}`];
      const meleeRow = DOM[`duelSmithMeleeRow${s}`];
      if (meleeSelect) {
        meleeSelect.disabled = !avail.meleeSmithing;
        if (!avail.meleeSmithing) {
          meleeSelect.value = '0';
          meleeSelect.classList.add('tech-locked');
        } else {
          meleeSelect.classList.remove('tech-locked');
        }
        if (meleeRow && (avail.isScorpion || avail.isSiege)) {
          meleeRow.style.display = 'none';
        }
      }

      // 5. Herrería Flechas (Deshabilitada para Escorpiones y Asedio)
      const pierceSelect = DOM[`duelSmithPierce${s}`];
      const pierceRow = DOM[`duelSmithPierceRow${s}`];
      if (pierceSelect) {
        pierceSelect.disabled = !avail.pierceSmithing;
        if (!avail.pierceSmithing) {
          pierceSelect.value = '0';
          pierceSelect.classList.add('tech-locked');
        } else {
          pierceSelect.classList.remove('tech-locked');
        }
        if (pierceRow && (avail.isScorpion || avail.isSiege)) {
          pierceRow.style.display = 'none';
        }
      }

      // 6. Universidad: Química y Balística permanecen interactivas para escorpiones
      const chemistryCheck = DOM[`duelChemistry${s}`];
      if (chemistryCheck) {
        chemistryCheck.disabled = false;
        chemistryCheck.classList.remove('tech-locked');
      }
      const ballisticsCheck = DOM[`duelBallistics${s}`];
      if (ballisticsCheck) {
        ballisticsCheck.disabled = false;
        ballisticsCheck.classList.remove('tech-locked');
      }
    }

    return avail;
  }

  function calculateDynamicUnitStats(baseUnit, civId, age, activeTechIds, options) {
    const m = getModifiersModule();
    if (m && typeof m.calculateDynamicUnitStats === 'function') {
      return m.calculateDynamicUnitStats(baseUnit, civId, age, activeTechIds, options);
    }
    return null;
  }

  const calculateUnitStats = calculateDynamicUnitStats;

  function initCombatant(unitData, options = {}) {
    const c = getBaseCombat();
    if (!c || typeof c.initCombatant !== 'function') {
      throw new Error('[combatSimulator] El motor AoE2Combat no está disponible.');
    }

    // Para camellos cuerpo a cuerpo: enrutar a armadura de caballería y anular infantería residual
    const avail = getModifiersAvailability(unitData);
    let sanitizedOptions = options;

    if (avail.isMeleeCamel) {
      sanitizedOptions = {
        ...options,
        cavalryArmorUpgrade: Number(options.cavalryArmorUpgrade ?? options.armorUpgrade ?? 0),
        infantryArmorUpgrade: 0
      };
    }

    return c.initCombatant(unitData, sanitizedOptions);
  }

  function getUnitTotalCost(unit) {
    const c = getBaseCombat();
    if (c && typeof c.getUnitTotalCost === 'function') {
      return c.getUnitTotalCost(unit);
    }
    const unitId = Number(unit?.ID ?? unit?.id ?? 0);
    let cost = unit?.Cost || unit?.cost;
    if ((!cost || (!cost.Food && !cost.food && !cost.Wood && !cost.wood && !cost.Gold && !cost.gold && !cost.Stone && !cost.stone)) && unitId > 0) {
      if (typeof unitService !== 'undefined' && unitService.getUnitBaseCost) {
        cost = unitService.getUnitBaseCost(unitId);
      } else if (typeof window !== 'undefined' && window.unitService && window.unitService.getUnitBaseCost) {
        cost = window.unitService.getUnitBaseCost(unitId);
      }
    }
    cost = cost || {};
    return (cost.Food || cost.food || 0) + (cost.Wood || cost.wood || 0) + (cost.Gold || cost.gold || 0) + (cost.Stone || cost.stone || 0);
  }

  function calculateResourceEfficiency(winnerKey, costA, costB, uA, uB) {
    const c = getBaseCombat();
    if (c && typeof c.calculateResourceEfficiency === 'function') {
      return c.calculateResourceEfficiency(winnerKey, costA, costB, uA, uB);
    }
    const mods = getModifiersModule();
    if (mods && typeof mods.calculateCostEffectiveness === 'function') {
      return mods.calculateCostEffectiveness(uA, uB, winnerKey);
    }
    return { ratio: '1.00', desc: 'Equilibrio de recursos.' };
  }

  function simulateDuel(combatantA, combatantB, options = {}) {
    const c = getBaseCombat();
    if (!c) {
      throw new Error('[combatSimulator] Motor de combate no inicializado.');
    }
    const simFn = c.simulateCombat || c.simulateDuel;
    return simFn(combatantA, combatantB, options);
  }

  const simulateCombat = simulateDuel;

  // =========================================================================
  // RENDERIZADO VISUAL DE COSTES EN LA UI DE LA ARENA
  // =========================================================================

  /**
   * Renderiza los badges de recursos y descuentos calculados en el panel de un combatiente.
   *
   * @param {'a'|'b'|'azul'|'rojo'|HTMLElement} target - Lado del combatiente o contenedor.
   * @param {Object} unit - Datos de la unidad limpia o combatiente.
   * @param {string} [civId='generic'] - Civilización activa.
   * @param {string|number} [age='imperial'] - Edad de juego.
   * @param {number[]} [activeTechs=[]] - Array de IDs de tecnologías activas.
   * @returns {Object|null} El desglose UnitCostResult calculado.
   */
  function renderCombatantCost(target, unit, civId = 'generic', age = 'imperial', activeTechs = []) {
    let container = null;
    if (typeof target === 'string') {
      if (typeof document === 'undefined') return null;
      const lower = target.toLowerCase().trim();
      if (lower === 'a' || lower === 'azul' || lower === 'combatant-cost-azul') {
        container = document.getElementById('combatant-cost-azul') || document.getElementById('combatant-cost-a');
      } else if (lower === 'b' || lower === 'rojo' || lower === 'combatant-cost-rojo') {
        container = document.getElementById('combatant-cost-rojo') || document.getElementById('combatant-cost-b');
      } else {
        container = document.getElementById(target);
      }
    } else if (target && (target.nodeType === 1 || typeof target.innerHTML === 'string')) {
      container = target;
    }

    if (!container) return null;

    if (!unit) {
      container.innerHTML = '';
      return null;
    }

    // Calcular costes dinámicos
    const mods = getModifiersModule();
    let costResult = null;

    const uId = Number(unit.ID ?? unit.id ?? 0);
    let uCost = unit.Cost || unit.cost || unit._rawUnitData?.Cost;
    if ((!uCost || (!uCost.Food && !uCost.food && !uCost.Wood && !uCost.wood && !uCost.Gold && !uCost.gold && !uCost.Stone && !uCost.stone)) && uId > 0) {
      if (typeof unitService !== 'undefined' && unitService.getBaseUnitData) {
        uCost = unitService.getBaseUnitData(uId).Cost;
      } else if (typeof window !== 'undefined' && window.unitService && window.unitService.getBaseUnitData) {
        uCost = window.unitService.getBaseUnitData(uId).Cost;
      }
    }

    const unitDescriptor = {
      id: uId,
      name: unit.localizedName ?? unit.name ?? unit.internal_name ?? '',
      classes: Array.isArray(unit.classes) ? unit.classes : ((unit.Armours || []).map(a => a.Class)),
      cost: uCost || {}
    };

    if (mods && typeof mods.calculateUnitCost === 'function') {
      costResult = mods.calculateUnitCost(unitDescriptor, civId, age, activeTechs);
    } else {
      // Fallback a coste directo sin modificadores
      const rawCost = unitDescriptor.cost;
      const baseCost = {
        food: Number(rawCost.food ?? rawCost.Food ?? 0),
        wood: Number(rawCost.wood ?? rawCost.Wood ?? 0),
        gold: Number(rawCost.gold ?? rawCost.Gold ?? 0),
        stone: Number(rawCost.stone ?? rawCost.Stone ?? 0)
      };
      const total = baseCost.food + baseCost.wood + baseCost.gold + baseCost.stone;
      costResult = {
        cost: baseCost,
        baseCost: baseCost,
        totalCost: total,
        totalBaseCost: total,
        totalSavings: { food: 0, wood: 0, gold: 0, stone: 0, total: 0 },
        discountPercent: 0,
        isDiscounted: false,
        discountsApplied: [],
        costConversionApplied: null
      };
    }

    // Construcción de badges de recursos
    const { cost, baseCost, totalCost, isDiscounted, discountPercent, totalSavings, discountsApplied, costConversionApplied } = costResult;
    const badgesHTML = [];

    const resources = [
      { key: 'food', label: 'Comida', icon: '🥩', css: 'res-food' },
      { key: 'wood', label: 'Madera', icon: '🪵', css: 'res-wood' },
      { key: 'gold', label: 'Oro', icon: '🪙', css: 'res-gold' },
      { key: 'stone', label: 'Piedra', icon: '🪨', css: 'res-stone' }
    ];

    resources.forEach(r => {
      const cur = cost[r.key];
      const base = baseCost[r.key];

      if (cur > 0 || base > 0) {
        if (cur < base) {
          badgesHTML.push(`
            <span class="combatant-resource-badge ${r.css}" title="Base: ${base} → Descuento: ${cur} (-${Math.round((1 - cur / base) * 100)}%)">
              <span>${r.icon}</span>
              <s class="cost-striked">${base}</s>
              <strong class="cost-final">${cur}</strong>
            </span>
          `);
        } else {
          badgesHTML.push(`
            <span class="combatant-resource-badge ${r.css}" title="${r.label}: ${cur}">
              <span>${r.icon}</span>
              <span>${cur}</span>
            </span>
          `);
        }
      }
    });

    if (badgesHTML.length === 0) {
      badgesHTML.push(`<span class="combatant-resource-badge" style="background:#222; color:#aaa;">Gratis</span>`);
    }

    // Badge de coste total
    badgesHTML.push(`
      <span class="combatant-total-badge" title="Coste Total en Recursos">∑ ${totalCost}</span>
    `);

    // Meta-información de ahorro o conversión si aplica
    let metaHTML = '';
    if (isDiscounted && totalSavings.total > 0) {
      const firstDiscount = discountsApplied[0];
      const descTitle = firstDiscount ? firstDiscount.sourceDescription : '';
      metaHTML = `
        <div class="combatant-cost-meta">
          <span class="combatant-savings-tag" title="${descTitle}">
            🏷️ -${totalSavings.total} rec (-${discountPercent}%)
          </span>
        </div>
      `;
    } else if (costConversionApplied) {
      metaHTML = `
        <div class="combatant-cost-meta">
          <span class="combatant-conversion-tag" title="${costConversionApplied.sourceDescription}">
            🔄 ${costConversionApplied.rule}
          </span>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="combatant-cost-badges">
        ${badgesHTML.join('')}
      </div>
      ${metaHTML}
    `;

    return costResult;
  }

  /**
   * Actualiza los bloques de coste de ambos combatientes leyendo el estado actual del DOM.
   */
  function updateAllCombatantCosts() {
    if (typeof document === 'undefined') return;

    ['a', 'b'].forEach(side => {
      const s = side.toUpperCase();
      const unitSelect = document.getElementById(`duel-unit-${side}`);
      const civSelect = document.getElementById(`duel-civ-${side}`);
      const ageSelect = document.getElementById(`duel-age-${side}`);

      if (!unitSelect) return;

      const unitId = Number(unitSelect.value);
      let cleanUnit = null;

      if (typeof window !== 'undefined' && window.state && Array.isArray(window.state.unitsList)) {
        cleanUnit = window.state.unitsList.find(u => u.ID === unitId);
      } else if (typeof window !== 'undefined' && typeof window.getCleanUnitById === 'function') {
        cleanUnit = window.getCleanUnitById(unitId);
      }

      if (!cleanUnit) return;

      const rawCiv = civSelect ? civSelect.value : 'generic';
      const ageVal = ageSelect ? ageSelect.value : '4';
      const ageKey = ageVal === '1' ? 'dark' : (ageVal === '2' ? 'feudal' : (ageVal === '3' ? 'castle' : 'imperial'));

      let activeTechs = [];
      if (typeof window !== 'undefined' && typeof window.getFighterOptions === 'function') {
        const opts = window.getFighterOptions(side);
        activeTechs = opts.activeUniqueTechs || [];
      }

      renderCombatantCost(side, cleanUnit, rawCiv, ageKey, activeTechs);
    });
  }

  return {
    initCombatant,
    simulateDuel,
    simulateCombat,
    getUnitTotalCost,
    calculateResourceEfficiency,
    calculateDynamicUnitStats,
    calculateUnitStats,
    getModifiersAvailability,
    updateModifiersAvailability,
    renderCombatantCost,
    updateAllCombatantCosts
  };
});
