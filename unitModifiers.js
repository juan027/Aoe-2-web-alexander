/**
 * unitModifiers.js
 * Motor Matemático e Inmutabilidad de Modificadores y Costes de Unidades para Age of Empires II: DE.
 *
 * Integra la base de datos de auditoría `civUnitDiscounts.js` y el catálogo de civilizaciones `civilizations.js`.
 * Soporta escalado por edad, discriminación estricta por recurso, tecnologías únicas,
 * conversiones de recursos y cálculo de eficiencia de intercambio (cost-effectiveness).
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(
      typeof require === 'function' ? (function () {
        try { return require('./civUnitDiscounts.js'); } catch (e) { return null; }
      })() : null,
      typeof require === 'function' ? (function () {
        try { return require('./civilizations.js'); } catch (e) { return null; }
      })() : null,
      typeof require === 'function' ? (function () {
        try { return require('./units.js'); } catch (e) { return null; }
      })() : null
    );
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory(global.civUnitDiscountsModule, global.civilizationsModule, global.unitsModule);
    global.unitModifiers = exports;
    global.calculateUnitCost = exports.calculateUnitCost;
    global.calculateDynamicUnitStats = exports.calculateDynamicUnitStats;
    global.calculateUnitStats = exports.calculateUnitStats;
    global.applyBlacksmithModifiers = exports.applyBlacksmithModifiers;
    global.calculateCostEffectiveness = exports.calculateCostEffectiveness;
    global.formatCostChipsHTML = exports.formatCostChipsHTML;
    global.isUnitEligibleForDiscount = exports.isUnitEligibleForDiscount;
    global.isCamelUnit = exports.isCamelUnit;
  }
})(typeof window !== 'undefined' ? window : this, function (discountsMod, civsMod, unitsMod) {
  'use strict';

  // =========================================================================
  // RESOLUCIÓN DE DEPENDENCIAS MODULARES
  // =========================================================================
  function getDiscountsModule() {
    if (discountsMod) return discountsMod;
    if (typeof window !== 'undefined' && window.civUnitDiscountsModule) return window.civUnitDiscountsModule;
    if (typeof require === 'function') {
      try { return require('./civUnitDiscounts.js'); } catch (e) {}
    }
    return null;
  }

  function getCivsModule() {
    if (civsMod) return civsMod;
    if (typeof window !== 'undefined' && window.civilizationsModule) return window.civilizationsModule;
    if (typeof require === 'function') {
      try { return require('./civilizations.js'); } catch (e) {}
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

  function isCamel(unitOrId) {
    const uMod = getUnitsModule();
    if (uMod && typeof uMod.isCamelUnit === 'function') {
      return uMod.isCamelUnit(unitOrId);
    }
    const uid = typeof unitOrId === 'object' ? Number(unitOrId?.id ?? unitOrId?.ID ?? 0) : Number(unitOrId);
    const camelIds = [207, 282, 329, 330, 542, 556, 1007, 1009, 1263, 1755, 1923];
    if (camelIds.includes(uid)) return true;
    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const armours = unitOrId.Armours || unitOrId.armours || [];
      if (Array.isArray(armours) && armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === 30)) {
        return true;
      }
      const name = String(unitOrId.internal_name || unitOrId.name || unitOrId.localizedName || '').toLowerCase();
      return name.includes('camel') || name.includes('camello') || name.includes('dervi') || name.includes('mameluk');
    }
    return false;
  }

  function isCamelArcher(unitOrId) {
    const uMod = getUnitsModule();
    if (uMod && typeof uMod.isCamelArcherUnit === 'function') {
      return uMod.isCamelArcherUnit(unitOrId);
    }
    if (!isCamel(unitOrId)) return false;
    const uid = typeof unitOrId === 'object' ? Number(unitOrId?.id ?? unitOrId?.ID ?? 0) : Number(unitOrId);
    if (uid === 1007 || uid === 1009) return true;
    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const armours = unitOrId.Armours || unitOrId.armours || [];
      if (Array.isArray(armours) && armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === 15)) {
        return true;
      }
    }
    return false;
  }

  // =========================================================================
  // NORMALIZADORES Y HELPERS
  // =========================================================================

  /**
   * Normaliza la edad a 'dark' | 'feudal' | 'castle' | 'imperial'.
   * @param {string|number} age
   * @returns {'dark'|'feudal'|'castle'|'imperial'}
   */
  function normalizeAgeKey(age) {
    if (!age) return 'imperial';
    if (typeof age === 'number') {
      switch (age) {
        case 1: return 'dark';
        case 2: return 'feudal';
        case 3: return 'castle';
        case 4: return 'imperial';
        default: return 'imperial';
      }
    }
    const lower = String(age).toLowerCase().trim();
    if (lower.includes('dark') || lower.includes('oscura')) return 'dark';
    if (lower.includes('feud')) return 'feudal';
    if (lower.includes('cast')) return 'castle';
    if (lower.includes('imp')) return 'imperial';
    return ['dark', 'feudal', 'castle', 'imperial'].includes(lower) ? lower : 'imperial';
  }

  /**
   * Normaliza el ID de civilización a identificador canónico en minúsculas.
   * @param {string|Object} civInput
   * @returns {string}
   */
  function normalizeCivId(civInput) {
    if (!civInput) return 'generic';
    if (typeof civInput === 'object' && civInput.id) {
      return String(civInput.id).toLowerCase().trim();
    }
    const lower = String(civInput).toLowerCase().trim().replace(/\s+/g, '_');
    const cMod = getCivsModule();
    if (cMod && typeof cMod.getCivByName === 'function') {
      const found = cMod.getCivByName(civInput);
      if (found) return found.id;
    }
    return lower;
  }

  /**
   * Obtiene el nombre legible de una civilización.
   * @param {string} civId
   * @returns {string}
   */
  function getCivName(civId) {
    const canonical = normalizeCivId(civId);
    const cMod = getCivsModule();
    if (cMod && typeof cMod.getCivById === 'function') {
      const found = cMod.getCivById(canonical);
      if (found) return found.name;
    }
    return canonical.charAt(0).toUpperCase() + canonical.slice(1);
  }

  // =========================================================================
  // FUNCIÓN CENTRAL: calculateUnitCost
  // =========================================================================

  /**
   * Pipeline de cálculo dinámico de costes de unidades militares y civiles.
   * Preserva inmutabilidad estricta sobre baseUnit y baseUnit.cost.
   *
   * @param {Object} baseUnit - Descriptor base de la unidad.
   * @param {number} baseUnit.id - ID canónico de la unidad en Genie Engine.
   * @param {string} baseUnit.name - Nombre o localizedName de la unidad.
   * @param {string[]} [baseUnit.classes] - Clases a las que pertenece.
   * @param {string} [baseUnit.category] - Categoría (ej. 'Archery Range', 'Barracks').
   * @param {Object} baseUnit.cost - Coste { food?, wood?, gold?, stone? } (acepta PascalCase).
   * @param {string} civId - Identificador o nombre de la civilización activa.
   * @param {'dark'|'feudal'|'castle'|'imperial'|number} age - Edad de la partida.
   * @param {number[]|string[]|Object} [activeTechIds=[]] - Array de IDs de tecnologías activas u opciones contextuales.
   * @returns {Object} UnitCostResult con coste final, base, desglose y ahorros.
   */
  function calculateUnitCost(baseUnit, civId, age, activeTechIds = []) {
    // 1. Resguardo de entrada nula o inválida
    if (!baseUnit || typeof baseUnit !== 'object') {
      return {
        unitId: 0,
        unitName: 'Desconocido',
        civId: 'generic',
        civName: 'Genérico',
        age: 'imperial',
        baseCost: { food: 0, wood: 0, gold: 0, stone: 0 },
        cost: { food: 0, wood: 0, gold: 0, stone: 0 },
        rawCost: { food: 0, wood: 0, gold: 0, stone: 0 },
        totalBaseCost: 0,
        totalCost: 0,
        totalSavings: { food: 0, wood: 0, gold: 0, stone: 0, total: 0 },
        discountPercent: 0,
        isDiscounted: false,
        discountsApplied: [],
        costConversionApplied: null
      };
    }

    // 2. Extracción inmutable y normalización de costes base
    const rawCostSource = baseUnit.cost || baseUnit.Cost || {};
    const baseCost = {
      food: Math.max(0, Number(rawCostSource.food ?? rawCostSource.Food ?? 0)),
      wood: Math.max(0, Number(rawCostSource.wood ?? rawCostSource.Wood ?? 0)),
      gold: Math.max(0, Number(rawCostSource.gold ?? rawCostSource.Gold ?? 0)),
      stone: Math.max(0, Number(rawCostSource.stone ?? rawCostSource.Stone ?? 0))
    };

    const unitId = Number(baseUnit.id ?? baseUnit.ID ?? 0);

    // Fallback a Fuente Única de Verdad (unitService) si no se especificaron costes
    if (baseCost.food === 0 && baseCost.wood === 0 && baseCost.gold === 0 && baseCost.stone === 0 && unitId > 0) {
      if (typeof unitService !== 'undefined' && unitService.getBaseUnitData) {
        const uData = unitService.getBaseUnitData(unitId);
        if (uData && uData.cost) {
          baseCost.food = uData.cost.food;
          baseCost.wood = uData.cost.wood;
          baseCost.gold = uData.cost.gold;
          baseCost.stone = uData.cost.stone;
        }
      } else if (typeof window !== 'undefined' && window.unitService && window.unitService.getBaseUnitData) {
        const uData = window.unitService.getBaseUnitData(unitId);
        if (uData && uData.cost) {
          baseCost.food = uData.cost.food;
          baseCost.wood = uData.cost.wood;
          baseCost.gold = uData.cost.gold;
          baseCost.stone = uData.cost.stone;
        }
      }
    }
    const unitName = String(baseUnit.name ?? baseUnit.localizedName ?? baseUnit.internal_name ?? `Unidad #${unitId}`);
    const normalizedAge = normalizeAgeKey(age);
    const canonicalCivId = normalizeCivId(civId);
    const civDisplayName = getCivName(canonicalCivId);

    // 3. Normalizar array de tecnologías y opciones adicionales
    let techsArray = [];
    let townCenters = 1;
    let castles = 0;
    let shouldRound = true;

    if (Array.isArray(activeTechIds)) {
      techsArray = activeTechIds;
    } else if (typeof activeTechIds === 'object' && activeTechIds !== null) {
      techsArray = Array.isArray(activeTechIds.activeTechIds) ? activeTechIds.activeTechIds : [];
      if (typeof activeTechIds.townCenters === 'number') townCenters = activeTechIds.townCenters;
      if (typeof activeTechIds.castles === 'number') castles = activeTechIds.castles;
      if (typeof activeTechIds.round === 'boolean') shouldRound = activeTechIds.round;
    }

    // Ajuste por defecto de edificios para Sajones según edad si no se especificaron
    if (canonicalCivId === 'saxons' && townCenters === 1 && castles === 0) {
      if (normalizedAge === 'castle') { townCenters = 3; castles = 0; }
      else if (normalizedAge === 'imperial') { townCenters = 3; castles = 1; }
    }

    // 4. Clon de trabajo para aplicar transformaciones (inmutabilidad estricta)
    let workingCost = { ...baseCost };
    let costConversionApplied = null;

    // =======================================================================
    // 5. EVALUACIÓN DE CONVERSIONES DE RECURSOS (Cost Conversions)
    // =======================================================================
    // Persas: Kamandaran (488) -> Línea de arqueros (4, 24, 492): coste de oro se vuelve madera
    if (canonicalCivId === 'persians' && workingCost.gold > 0) {
      const hasKamandaran = techsArray.includes(488) || techsArray.some(t => String(t).toLowerCase() === 'kamandaran');
      const isArcher = [4, 24, 492].includes(unitId) ||
                       (baseUnit.classes && baseUnit.classes.includes('archer_line')) ||
                       unitName.toLowerCase().includes('arquero') || unitName.toLowerCase().includes('ballestero');
      if (hasKamandaran && isArcher) {
        workingCost.wood += workingCost.gold;
        workingCost.gold = 0;
        costConversionApplied = {
          id: 'persians_kamandaran',
          rule: 'El coste de oro de los arqueros se reemplaza por madera',
          sourceDescription: 'Kamandaran (el coste de oro de los arqueros se reemplaza por un coste adicional de madera)'
        };
      }
    }

    // Bohemios: Reformas husitas (785) -> Monjes / Misioneros: coste de oro se vuelve comida
    if (canonicalCivId === 'bohemians' && workingCost.gold > 0) {
      const hasHussite = techsArray.includes(785) || techsArray.some(t => String(t).toLowerCase().includes('husita'));
      const isMonk = unitId === 125 || unitName.toLowerCase().includes('monje') || unitName.toLowerCase().includes('missionary');
      if (hasHussite && isMonk) {
        workingCost.food += workingCost.gold;
        workingCost.gold = 0;
        costConversionApplied = {
          id: 'bohemians_hussite_reforms',
          rule: 'El coste de oro de los monjes se reemplaza por comida',
          sourceDescription: 'Reformas husitas (el coste de oro de los monjes y de las tecnologías del monasterio se reemplaza por comida)'
        };
      }
    }

    // Malayos: Leva en masa (625) -> Milicia hasta Campeón: coste de oro se vuelve comida
    if (canonicalCivId === 'malay' && workingCost.gold > 0) {
      const hasForcedLevy = techsArray.includes(625) || techsArray.includes(688) || techsArray.some(t => String(t).toLowerCase().includes('leva'));
      const isMilitia = [74, 75, 77, 473, 567, 1793].includes(unitId) ||
                        (baseUnit.classes && baseUnit.classes.includes('militia_line'));
      if (hasForcedLevy && isMilitia) {
        workingCost.food += workingCost.gold;
        workingCost.gold = 0;
        costConversionApplied = {
          id: 'malay_forced_levy',
          rule: 'La milicia y subsiguientes dejan de costar oro y cuestan comida adicional',
          sourceDescription: 'Leva en masa (la milicia y subsiguientes dejan de costar oro y cuestan comida adicional)'
        };
      }
    }

    // Magiares: Ejército corviniano (514) -> Huszár magiar (869, 871): coste de oro se vuelve comida
    if (canonicalCivId === 'magyars' && workingCost.gold > 0) {
      const hasCorvinian = techsArray.includes(514) || techsArray.some(t => String(t).toLowerCase().includes('corvin'));
      const isMagyarHuszar = [869, 871].includes(unitId) || unitName.toLowerCase().includes('husz');
      if (hasCorvinian && isMagyarHuszar) {
        workingCost.food += workingCost.gold;
        workingCost.gold = 0;
        costConversionApplied = {
          id: 'magyars_corvinian_army',
          rule: 'Los huszár magiares dejan de costar oro y pasan a costar comida adicional',
          sourceDescription: 'Ejército corviniano (los huszár magiares dejan de costar oro y pasan a costar comida adicional)'
        };
      }
    }

    // =======================================================================
    // 6. OBTENCIÓN Y APLICACIÓN DE DESCUENTOS DE CIVILIZACIÓN
    // =======================================================================
    const dMod = getDiscountsModule();
    const discountsApplied = [];
    const multipliers = { food: 1.0, wood: 1.0, gold: 1.0, stone: 1.0 };

    if (dMod && typeof dMod.getCivUnitDiscounts === 'function') {
      const discounts = dMod.getCivUnitDiscounts(canonicalCivId);

      // Descriptor consolidado para comprobar pertenencia de unidad
      const unitDescriptor = {
        id: unitId,
        ID: unitId,
        name: unitName,
        internal_name: baseUnit.internal_name || unitName,
        classes: Array.isArray(baseUnit.classes) ? baseUnit.classes : [],
        category: baseUnit.category || '',
        isMilitary: Boolean(baseUnit.isMilitary ?? true)
      };

      for (const discount of discounts) {
        // Verificar si la unidad califica para el descuento
        let matches = false;

        // Comprobación global
        if (discount.targetClass.includes("all_units") || (discount.targetUnits && discount.targetUnits.includes("all"))) {
          matches = true;
        }

        // Comprobación por ID directo
        if (!matches && Array.isArray(discount.targetUnits) && discount.targetUnits.includes(unitId)) {
          matches = true;
        }

        // Comprobación por clases provistas en baseUnit.classes
        if (!matches && Array.isArray(baseUnit.classes)) {
          for (const c of baseUnit.classes) {
            if (discount.targetClass.includes(c)) {
              matches = true;
              break;
            }
          }
        }

        // Comprobación si la unidad es militar y el descuento es military_units
        if (!matches && (discount.targetClass.includes("military_units") || (discount.targetUnits && discount.targetUnits.includes("all_military")))) {
          const nonMilitaryIds = [83, 118, 293, 305, 1808, 128, 204, 17, 13, 545, 125];
          if (!nonMilitaryIds.includes(unitId) && unitDescriptor.isMilitary) {
            matches = true;
          }
        }

        // Comprobación a través del motor auxiliar de civUnitDiscounts
        if (!matches && typeof dMod.calculateDiscountedCost === 'function') {
          const dummy = dMod.calculateDiscountedCost({ food: 100 }, canonicalCivId, unitId || unitName, normalizedAge, techsArray);
          if (dummy.discountsApplied.some(da => da.id === discount.id)) {
            matches = true;
          }
        }

        if (!matches) continue;

        // Si es una tecnología única, comprobar que esté investigada
        if (discount.type === 'unique_tech') {
          const isResearched = techsArray.some(t => {
            if (typeof t === 'number') {
              return discount.techId === t || (Array.isArray(discount.techIds) && discount.techIds.includes(t));
            }
            const s = String(t).toLowerCase();
            return s === discount.id || s === discount.name.toLowerCase();
          });
          if (!isResearched) continue;
        }

        // Tasa de descuento por edad
        let rate = discount.discountByAge ? (discount.discountByAge[normalizedAge] || 0) : 0;

        // Escala dinámica (ej. Sajones)
        if (discount.scalingRule) {
          const totalBuildings = townCenters + castles;
          const calculatedRate = totalBuildings * discount.scalingRule.perBuilding;
          rate = Math.min(discount.scalingRule.maxDiscount, calculatedRate);
        }

        if (rate <= 0) continue;

        const affectedResources = discount.resource === 'all'
          ? ['food', 'wood', 'gold', 'stone']
          : [discount.resource];

        for (const res of affectedResources) {
          multipliers[res] *= (1.0 - rate);
        }

        discountsApplied.push({
          id: discount.id,
          name: discount.name,
          type: discount.type,
          resource: discount.resource,
          rate: rate,
          ratePercent: `${Math.round(rate * 100)}%`,
          sourceDescription: discount.sourceDescription,
          sourceDescriptionEn: discount.sourceDescriptionEn || ''
        });
      }
    }

    // 7. Cálculo de costes reducidos finales
    const rawCost = {
      food: workingCost.food * multipliers.food,
      wood: workingCost.wood * multipliers.wood,
      gold: workingCost.gold * multipliers.gold,
      stone: workingCost.stone * multipliers.stone
    };

    const finalCost = {
      food: shouldRound ? Math.round(rawCost.food) : rawCost.food,
      wood: shouldRound ? Math.round(rawCost.wood) : rawCost.wood,
      gold: shouldRound ? Math.round(rawCost.gold) : rawCost.gold,
      stone: shouldRound ? Math.round(rawCost.stone) : rawCost.stone
    };

    const totalBaseCost = baseCost.food + baseCost.wood + baseCost.gold + baseCost.stone;
    const totalCost = finalCost.food + finalCost.wood + finalCost.gold + finalCost.stone;

    const totalSavings = {
      food: Math.max(0, baseCost.food - finalCost.food),
      wood: Math.max(0, baseCost.wood - finalCost.wood),
      gold: Math.max(0, baseCost.gold - finalCost.gold),
      stone: Math.max(0, baseCost.stone - finalCost.stone),
      total: Math.max(0, totalBaseCost - totalCost)
    };

    const discountPercent = totalBaseCost > 0
      ? Number(((totalSavings.total / totalBaseCost) * 100).toFixed(1))
      : 0;

    const isDiscounted = totalSavings.total > 0 || discountsApplied.length > 0 || costConversionApplied !== null;

    // 8. Construcción inmutable del resultado
    return Object.freeze({
      unitId,
      unitName,
      civId: canonicalCivId,
      civName: civDisplayName,
      age: normalizedAge,
      baseCost: Object.freeze({ ...baseCost }),
      cost: Object.freeze({ ...finalCost }),
      rawCost: Object.freeze({ ...rawCost }),
      totalBaseCost,
      totalCost,
      totalSavings: Object.freeze({ ...totalSavings }),
      discountPercent,
      isDiscounted,
      discountsApplied: Object.freeze([...discountsApplied]),
      costConversionApplied: costConversionApplied ? Object.freeze({ ...costConversionApplied }) : null
    });
  }

  // =========================================================================
  // HELPER DE EFICIENCIA DE RECURSOS (Cost-Effectiveness Post-Combate)
  // =========================================================================

  /**
   * Calcula la relación de eficiencia de recursos entre dos combatientes tras un duelo,
   * integrando los costes dinámicos calculados por civ, edad y mejoras.
   *
   * @param {Object} combatantA - Descriptor del combatiente A.
   * @param {Object} combatantB - Descriptor del combatiente B.
   * @param {'A'|'B'|'draw'} winnerKey - Vencedor del duelo.
   * @param {Object} [options] - Opciones adicionales (remainingHP, maxHP).
   * @returns {Object} Desglose de eficiencia de intercambio.
   */
  function calculateCostEffectiveness(combatantA, combatantB, winnerKey, options = {}) {
    // Calcular costes dinámicos reales de cada unidad
    const costResA = calculateUnitCost(
      combatantA,
      combatantA.civ || combatantA.civId || options.civA || 'generic',
      combatantA.age || options.ageA || 'imperial',
      combatantA.activeTechIds || options.activeTechsA || []
    );

    const costResB = calculateUnitCost(
      combatantB,
      combatantB.civ || combatantB.civId || options.civB || 'generic',
      combatantB.age || options.ageB || 'imperial',
      combatantB.activeTechIds || options.activeTechsB || []
    );

    const costA = costResA.totalCost;
    const costB = costResB.totalCost;

    if (winnerKey === 'draw') {
      return {
        ratio: '1.00',
        costA,
        costB,
        costResA,
        costResB,
        desc: 'Equilibrio perfecto de intercambio de recursos (1.00x).'
      };
    }

    const winnerIsA = winnerKey === 'A';
    const winnerCombatant = winnerIsA ? combatantA : combatantB;
    const winnerCostRes = winnerIsA ? costResA : costResB;
    const loserCostRes = winnerIsA ? costResB : costResA;

    const winnerMaxHP = Number(winnerCombatant.maxHP ?? winnerCombatant.HP ?? 1);
    const winnerRemainingHP = Math.max(
      0,
      Number(options.remainingHP ?? (winnerIsA ? options.remainingHPA : options.remainingHPB) ?? winnerCombatant.currentHP ?? winnerMaxHP)
    );

    const hpLostFraction = Math.max(0, Math.min(1.0, (winnerMaxHP - winnerRemainingHP) / winnerMaxHP));
    const effectiveCostLostByWinner = Math.max(1, Math.round(winnerCostRes.totalCost * hpLostFraction));
    const destroyedValue = loserCostRes.totalCost;

    const ratio = (destroyedValue / effectiveCostLostByWinner).toFixed(2);
    const winnerName = winnerCombatant.localizedName || winnerCombatant.name || (winnerIsA ? 'Combatiente Azul' : 'Combatiente Rojo');

    const desc = `${winnerName} (${winnerCostRes.civName}) destruyó ${destroyedValue} recursos del rival sufriendo un desgaste estimado de ${effectiveCostLostByWinner} recursos (Ratio de eficiencia: ${ratio}x).`;

    return {
      ratio,
      costA,
      costB,
      costResA,
      costResB,
      destroyedValue,
      effectiveCostLostByWinner,
      desc
    };
  }

  // =========================================================================
  // HELPER DE UI: Formateo de Chips HTML de Costes
  // =========================================================================

  /**
   * Genera el bloque HTML de chips de recursos con visualización de descuento y tachado.
   * @param {Object} unitCostResult - Resultado de calculateUnitCost.
   * @returns {string} Fragmento HTML listo para renderizar.
   */
  function formatCostChipsHTML(unitCostResult) {
    if (!unitCostResult) return '';

    const { cost, baseCost, isDiscounted, discountPercent, totalSavings } = unitCostResult;
    const chips = [];

    const resources = [
      { key: 'food', label: 'Comida', icon: '🥩', css: 'res-food' },
      { key: 'wood', label: 'Madera', icon: '🪵', css: 'res-wood' },
      { key: 'gold', label: 'Oro', icon: '🪙', css: 'res-gold' },
      { key: 'stone', label: 'Piedra', icon: '🪨', css: 'res-stone' }
    ];

    for (const res of resources) {
      const currentVal = cost[res.key];
      const baseVal = baseCost[res.key];

      if (baseVal > 0 || currentVal > 0) {
        if (currentVal < baseVal) {
          chips.push(`
            <div class="resource-chip ${res.css} discounted-chip" title="Base: ${baseVal} → Descuento: ${currentVal}">
              <span>${res.icon}</span>
              <span class="cost-original-striked" style="text-decoration:line-through; opacity:0.65; margin-right:3px;">${baseVal}</span>
              <span class="cost-discounted-val" style="color:#2ecc71; font-weight:bold;">${currentVal}</span>
              <span>${res.label}</span>
            </div>
          `);
        } else {
          chips.push(`
            <div class="resource-chip ${res.css}">
              <span>${res.icon} ${currentVal} ${res.label}</span>
            </div>
          `);
        }
      }
    }

    if (chips.length === 0) {
      chips.push(`<div class="resource-chip" style="background:#222; color:#aaa;">Gratis / Sin coste</div>`);
    }

    let badgeHTML = '';
    if (isDiscounted && totalSavings.total > 0) {
      badgeHTML = `
        <div class="cost-savings-badge" style="background:rgba(46,204,113,0.15); border:1px solid #2ecc71; color:#2ecc71; padding:3px 8px; border-radius:3px; font-size:0.78rem; font-weight:bold; margin-top:4px; display:inline-flex; align-items:center; gap:4px;">
          <span>🏷️ Ahorro: -${totalSavings.total} recursos (-${discountPercent}%)</span>
        </div>
      `;
    }

    return `
      <div class="cost-breakdown-bar">
        ${chips.join('')}
      </div>
      ${badgeHTML}
    `;
  }

  /**
   * Comprueba si una unidad es candidata a descuento con la civilización y edad indicadas.
   */
  function isUnitEligibleForDiscount(baseUnit, civId, age = 'imperial') {
    const res = calculateUnitCost(baseUnit, civId, age);
    return res.isDiscounted;
  }

  // =========================================================================
  // MOTOR DE CÁLCULO DINÁMICO DE ESTADÍSTICAS Y HERRERÍA
  // =========================================================================

  /**
   * Calcula de forma inmutable las estadísticas dinámicas de combate de una unidad
   * integrando herrería, clase táctica y reglas específicas de camellos.
   *
   * Regla de Camellos (Genie Engine DE):
   * - Los camellos cuerpo a cuerpo (Camello ID #329, Jinete de camello pesado ID #330, Camello imperial ID #207)
   *   son unidades montadas que se benefician de la Armadura de caballería (Barding Armor line):
   *   - Armadura de escamas para caballos (+1/+1): +1 Melee / +1 Pierce
   *   - Armadura de cota de malla para caballos (+1/+1): +2 Melee / +2 Pierce
   *   - Armadura de placas para caballos (+1/+2): +3 Melee / +4 Pierce
   * - Ignoran cualquier valor residual de Armadura de infantería.
   *
   * @param {Object} baseUnit - Descriptor limpio de la unidad.
   * @param {string} [civId='generic'] - Civilización activa.
   * @param {string|number} [age='imperial'] - Edad.
   * @param {number[]|string[]} [activeTechIds=[]] - Tecnologías activas.
   * @param {Object} [options={}] - Opciones adicionales de upgrades.
   * @returns {Object} Estadísticas inmutables calculadas.
   */
  function calculateDynamicUnitStats(baseUnit, civId = 'generic', age = 'imperial', activeTechIds = [], options = {}) {
    if (!baseUnit || typeof baseUnit !== 'object') return null;

    const unitId = Number(baseUnit.id ?? baseUnit.ID ?? 0);
    const unitName = String(baseUnit.name ?? baseUnit.localizedName ?? baseUnit.internal_name ?? `Unidad #${unitId}`);
    const normalizedAge = normalizeAgeKey(age);
    const canonicalCivId = normalizeCivId(civId);

    const isCamelUnit = isCamel(baseUnit);
    const isArchCamel = isCamelArcher(baseUnit);
    const isMeleeCamel = isCamelUnit && !isArchCamel;

    // Clasificación específica de Asedio, Escorpiones y Chu Ko Nu
    const isScorpion = [279, 542].includes(unitId) ||
      (baseUnit.internal_name && ['SCBAL', 'HWBAL'].includes(baseUnit.internal_name)) ||
      unitName.toLowerCase().includes('scorpion') ||
      unitName.toLowerCase().includes('escorpión') ||
      unitName.toLowerCase().includes('escorpion');
    const isRocketCart = [1904, 1907].includes(unitId) ||
      (baseUnit.internal_name && ['RCKTCRT', 'HRCKTCRT'].includes(baseUnit.internal_name)) ||
      unitName.toLowerCase().includes('rocket_cart') ||
      unitName.toLowerCase().includes('carro de cohetes') ||
      unitName.toLowerCase().includes('carro_cohete');
    const isChuKoNu = [73, 559].includes(unitId) ||
      (baseUnit.internal_name && ['CHUKN', 'ECHUKN'].includes(baseUnit.internal_name)) ||
      unitName.toLowerCase().includes('chu ko nu') ||
      unitName.toLowerCase().includes('chuko');

    // Detectar clases de armadura de la unidad
    const armours = Array.isArray(baseUnit.Armours) ? baseUnit.Armours : (Array.isArray(baseUnit.armours) ? baseUnit.armours : []);
    const hasArmourClass = (cls) => armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === cls);

    const isShip = hasArmourClass(22) || hasArmourClass(16);
    const isSiege = hasArmourClass(20) || isScorpion || isRocketCart;
    const isArch = (hasArmourClass(15) || isArchCamel) && !isSiege;
    const isTrueCav = (hasArmourClass(8) || hasArmourClass(19) || isMeleeCamel) && !isArch && !isSiege;
    const isInf = (hasArmourClass(1) || hasArmourClass(11)) && !isCamelUnit && !isSiege;

    // Tecnologías activas
    const techs = Array.isArray(activeTechIds) ? activeTechIds : [];
    const hasTech = (id) => techs.includes(id) || techs.includes(Number(id));

    // Nivel Armadura de Caballería (81, 82, 80)
    let cavArmorLvl = options.cavalryArmorUpgrade !== undefined
      ? Number(options.cavalryArmorUpgrade || 0)
      : (hasTech(80) ? 3 : (hasTech(82) ? 2 : (hasTech(81) ? 1 : 0)));

    // Nivel Armadura de Infantería (74, 76, 77)
    let infArmorLvl = options.infantryArmorUpgrade !== undefined
      ? Number(options.infantryArmorUpgrade || 0)
      : (hasTech(77) ? 3 : (hasTech(76) ? 2 : (hasTech(74) ? 1 : 0)));

    // Nivel Armadura de Arqueros (211, 212, 219)
    let archArmorLvl = options.archerArmorUpgrade !== undefined
      ? Number(options.archerArmorUpgrade || 0)
      : (hasTech(219) ? 3 : (hasTech(212) ? 2 : (hasTech(211) ? 1 : 0)));

    // Soporte para options.armorUpgrade genérico
    if (options.armorUpgrade !== undefined) {
      const gen = Number(options.armorUpgrade || 0);
      if (isMeleeCamel || isTrueCav) cavArmorLvl = Math.max(cavArmorLvl, gen);
      else if (isInf) infArmorLvl = Math.max(infArmorLvl, gen);
      else if (isArch) archArmorLvl = Math.max(archArmorLvl, gen);
    }

    // Nivel Ataque Melee (67, 68, 75 o aliases 12, 199, 212)
    let meleeSmithLvl = options.meleeSmithing !== undefined
      ? Number(options.meleeSmithing || 0)
      : (hasTech(75) || hasTech(212) ? 3 : (hasTech(68) || hasTech(199) ? 2 : (hasTech(67) || hasTech(12) ? 1 : 0)));

    // Nivel Flechas/Proyectiles (199, 200, 201)
    let pierceSmithLvl = options.pierceSmithing !== undefined
      ? Number(options.pierceSmithing || 0)
      : (hasTech(201) ? 3 : (hasTech(200) ? 2 : (hasTech(199) ? 1 : 0)));

    // CÁLCULO DE ARMADURA
    let effectiveArmorLvl = 0;
    let armorGroup = 'none';

    if (!isShip && !isSiege) {
      if (isArch) {
        effectiveArmorLvl = Math.min(3, Math.max(0, archArmorLvl));
        armorGroup = 'archer';
      } else if (isMeleeCamel || isTrueCav) {
        // Camellos cuerpo a cuerpo: se benefician de armadura de caballería e IGNORAN infantería
        effectiveArmorLvl = Math.min(3, Math.max(0, cavArmorLvl));
        armorGroup = 'cavalry';
      } else if (isInf) {
        effectiveArmorLvl = Math.min(3, Math.max(0, infArmorLvl));
        armorGroup = 'infantry';
      }
    }

    // Deltas de armadura:
    // Nivel 1: +1 Melee / +1 Pierce (Escamas)
    // Nivel 2: +2 Melee / +2 Pierce (+1/+1 delta) (Malla)
    // Nivel 3: +3 Melee / +4 Pierce (+1 Melee / +2 Pierce delta) (Placas)
    let bonusMeleeArmor = 0;
    let bonusPierceArmor = 0;
    if (effectiveArmorLvl === 1) {
      bonusMeleeArmor = 1;
      bonusPierceArmor = 1;
    } else if (effectiveArmorLvl === 2) {
      bonusMeleeArmor = 2;
      bonusPierceArmor = 2;
    } else if (effectiveArmorLvl === 3) {
      bonusMeleeArmor = 3;
      bonusPierceArmor = 4;
    }

    // CÁLCULO DE ATAQUE
    const attacks = Array.isArray(baseUnit.Attacks) ? baseUnit.Attacks : (Array.isArray(baseUnit.attacks) ? baseUnit.attacks : []);
    const nativeMelee = attacks.find(a => (typeof a === 'object' ? a.Class : Number(a)) === 4 && (a.Amount ?? a.amount ?? 0) > 0);
    const nativePierce = attacks.find(a => (typeof a === 'object' ? a.Class : Number(a)) === 3 && (a.Amount ?? a.amount ?? 0) > 0);

    const baseMeleeAtk = nativeMelee ? Number(nativeMelee.Amount ?? nativeMelee.amount ?? 0) : 0;
    const basePierceAtk = nativePierce ? Number(nativePierce.Amount ?? nativePierce.amount ?? 0) : 0;

    let bonusMeleeAtk = 0;
    let bonusPierceAtk = 0;
    let bonusRange = 0;
    let attackGroup = 'none';

    if ((isArch || (basePierceAtk > 0 && (Number(baseUnit.Range ?? baseUnit.range ?? 0) > 0))) && !isShip && !isSiege) {
      attackGroup = 'archer';
      const lvl = Math.min(3, Math.max(0, pierceSmithLvl));
      bonusPierceAtk = lvl;
      bonusRange = lvl;
    } else if (baseMeleeAtk > 0 && !isShip && !isSiege) {
      attackGroup = (isMeleeCamel || isTrueCav) ? 'cavalry' : 'infantry';
      const lvl = Math.min(3, Math.max(0, meleeSmithLvl));
      if (lvl === 1) bonusMeleeAtk = 1;
      else if (lvl === 2) bonusMeleeAtk = 2;
      else if (lvl === 3) bonusMeleeAtk = 4;
    }

    // Tecnologías canónicas de Universidad / Asedio:
    // 1. Química (Chemistry, ID 47): +1 Pierce attack
    let chemistryBonus = 0;
    if ((options.chemistry || hasTech(47)) && (basePierceAtk > 0 || isScorpion)) {
      chemistryBonus = 1;
    }

    // 2. Ingenieros de Asedio (Siege Engineers, ID 377): +1 Range a armas de asedio y escorpiones
    let siegeEngineersBonus = 0;
    if ((options.siegeEngineers || options.siege_engineers || hasTech(377)) && (isSiege || isScorpion)) {
      siegeEngineersBonus = 1;
    }

    // 3. Cohetería (Rocketry, ID 52 - Chinos):
    // Rework actual: +25% de ataque a la línea de Escorpiones y Carro de cohetes.
    // Chu Ko Nu queda COMPLETAMENTE EXCLUIDO (0 bonificación).
    let rocketryBonus = 0;
    const isChinese = ['chinese', 'chinos', 'chino'].includes(canonicalCivId);
    const hasRocketry = hasTech(52) || options.rocketry || options.coheteria || (isChinese && (options.imperialCrown || options.uniqueImpTech));
    if (hasRocketry && !isChuKoNu) {
      if (isScorpion || isRocketCart) {
        const baseAtk = basePierceAtk > 0 ? basePierceAtk : (baseMeleeAtk > 0 ? baseMeleeAtk : Number(baseUnit.Attack ?? baseUnit.attack ?? 0));
        rocketryBonus = Math.round(baseAtk * 0.25);
      }
    }

    // Detección de Arbalesta del Shu y Corona de Oro (Cargador / Bolt Magazine, ID 1069)
    // Ráfaga de proyectiles adicionales: +2 proyectiles secundarios de 1 ATQ base
    const isArbalest = unitId === 492 || [4, 24, 492].includes(unitId) ||
      unitName.toLowerCase().includes('arbalest') ||
      unitName.toLowerCase().includes('arbalesta') ||
      (baseUnit.internal_name && ['ACOAR', 'ARBLST'].includes(baseUnit.internal_name));
    const isShu = ['shu'].includes(canonicalCivId);
    const isShuArbalest = isArbalest && isShu;
    const hasShuImperialUniqueTech = hasTech(1069) || options.boltMagazine || options.cargador || options.shuCrown || (isShu && (options.imperialCrown || options.uniqueImpTech));

    let projectiles = Number(baseUnit.projectiles || 1);
    let secondaryProjectiles = null;

    if (isShuArbalest && hasShuImperialUniqueTech) {
      projectiles = (baseUnit.projectiles || 1) + 2;
      secondaryProjectiles = Object.freeze({
        count: 2,
        attack: 1,
        attackType: 'pierce'
      });
    }

    // Estadísticas base
    const baseMeleeArm = Number(baseUnit.MeleeArmor ?? (armours.find(a => a.Class === 4)?.Amount) ?? 0);
    const basePierceArm = Number(baseUnit.PierceArmor ?? (armours.find(a => a.Class === 3)?.Amount) ?? 0);

    let baseHP = Number(baseUnit.HP ?? baseUnit.hp ?? 100);
    let baseSpeed = Number(baseUnit.Speed ?? baseUnit.speed ?? 1);
    const baseRange = Number(baseUnit.Range ?? baseUnit.range ?? 0);
    const baseReload = Number(baseUnit.ReloadTime ?? baseUnit.reloadTime ?? 2.0);

    // Tecnologías de establo: Pureza de sangre (+20 HP) y Ganadería (+10% Speed)
    if (options.bloodlines && (isTrueCav || isMeleeCamel)) {
      baseHP += (canonicalCivId === 'varangians' ? 30 : 20);
    }
    if (options.husbandry && (isTrueCav || isMeleeCamel)) {
      baseSpeed = Math.round((baseSpeed * 1.10 + Number.EPSILON) * 100) / 100;
    }

    const finalMeleeAtk = baseMeleeAtk > 0 ? (baseMeleeAtk + bonusMeleeAtk + (isRocketCart ? rocketryBonus : 0)) : 0;
    const finalPierceAtk = basePierceAtk > 0 ? (basePierceAtk + bonusPierceAtk + chemistryBonus + (isScorpion ? rocketryBonus : 0)) : 0;
    const finalMeleeArm = baseMeleeArm + bonusMeleeArmor;
    const finalPierceArm = basePierceArm + bonusPierceArmor;
    const finalRange = baseRange + bonusRange + siegeEngineersBonus;

    return Object.freeze({
      unitId,
      unitName,
      civId: canonicalCivId,
      civName: getCivName(canonicalCivId),
      age: normalizedAge,
      HP: baseHP,
      maxHP: baseHP,
      meleeAttack: finalMeleeAtk,
      pierceAttack: finalPierceAtk,
      attack: finalMeleeAtk > 0 ? finalMeleeAtk : finalPierceAtk,
      meleeArmor: finalMeleeArm,
      pierceArmor: finalPierceArm,
      range: finalRange,
      speed: baseSpeed,
      reloadTime: baseReload,
      isCamel: isCamelUnit,
      isScorpion,
      isRocketCart,
      isChuKoNu,
      isShuArbalest,
      hasShuImperialUniqueTech: Boolean(isShuArbalest && hasShuImperialUniqueTech),
      projectiles,
      secondaryProjectiles,
      chemistryBonus,
      siegeEngineersBonus,
      rocketryBonus,
      armorGroup,
      attackGroup,
      blacksmithBonus: Object.freeze({
        meleeAttack: bonusMeleeAtk,
        pierceAttack: bonusPierceAtk,
        meleeArmor: bonusMeleeArmor,
        pierceArmor: bonusPierceArmor,
        range: bonusRange,
        armorLevel: effectiveArmorLvl,
        armorGroup,
        attackGroup,
        ignoredInfantryArmor: isMeleeCamel && infArmorLvl > 0,
        ignoredBlacksmith: isScorpion || isSiege
      })
    });
  }

  const calculateUnitStats = calculateDynamicUnitStats;

  /**
   * Helper de bonificaciones de herrería sobre un objeto de unidad.
   */
  function applyBlacksmithModifiers(unit, activeTechIds = [], options = {}) {
    const stats = calculateDynamicUnitStats(unit, options.civId || options.civ || 'generic', options.age || 'imperial', activeTechIds, options);
    return stats ? stats.blacksmithBonus : null;
  }

  return {
    calculateUnitCost,
    calculateDynamicUnitStats,
    calculateUnitStats,
    applyBlacksmithModifiers,
    calculateCostEffectiveness,
    formatCostChipsHTML,
    isUnitEligibleForDiscount,
    isCamelUnit: isCamel,
    normalizeCivId,
    normalizeAgeKey
  };
});
