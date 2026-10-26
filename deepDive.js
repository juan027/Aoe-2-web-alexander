/**
 * DEEPDIVE.JS - Módulo de Análisis Profundo y Categorización Naval para Age of Empires II
 * Configuración integral y definitiva de la compatibilidad de mejoras de herrería naval (Genie Engine).
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.deepDive = exports;
    global.getNavalCategory = exports.getNavalCategory;
    global.getNavalBlacksmithCompatibility = exports.getNavalBlacksmithCompatibility;
    global.isNavalUnit = exports.isNavalUnit;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Familias y Categorías canónicas navales
  const NAVAL_CATEGORIES = {
    MELEE_SHIP: 'MELEE_SHIP',   // Línea de Hulk / Choque naval (Hulk, War Hulk, Carraca, Lou Chuan)
    ARROW_SHIP: 'ARROW_SHIP',   // Línea de Proyectil / Galeras (Galera, Galera de guerra, Galeón, Drakkar, Carabela)
    OTHER_SHIP: 'OTHER_SHIP'    // Incendiarios, Demolición, Pólvora y Especiales (Brulote, Dromon, Galeón artillado, Tortuga)
  };

  // IDs canónicos del esquema data.json
  const HULK_LINE_IDS = new Set([2626, 2627, 2628, 1948]); // Hulk, War Hulk, Carrack, Lou Chuan
  const ARROW_SHIP_IDS = new Set([539, 21, 442, 250, 533, 1004, 1006]); // Galera, Galera de guerra, Galeón, Drakkar, Drakkar de élite, Carabela, Carabela de élite
  const FIRE_SHIP_IDS = new Set([1103, 529, 532, 1302]); // Galera incendiaria, Barco incendiario, Brulote rápido, Barco dragón
  const DEMO_SHIP_IDS = new Set([1104, 527, 528]); // Balsa de demolición, Barco de demolición, Barco de demolición pesado
  const CANNON_GALLEON_IDS = new Set([420, 691]); // Galeón artillado, Galeón artillado de élite
  const DROMON_IDS = new Set([1795]);
  const TURTLE_SHIP_IDS = new Set([831, 832]);

  /**
   * Clasifica de forma robusta cualquier unidad en su familia naval o null si es terrestre.
   * Compatible con data.json (Clase 16 / Clase 22), nombres localizados, internal_name e IDs.
   * 
   * @param {Object} unit - Entidad de unidad o combatiente
   * @returns {'MELEE_SHIP' | 'ARROW_SHIP' | 'OTHER_SHIP' | null}
   */
  function getNavalCategory(unit) {
    if (!unit) return null;
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
    const id = Number(unit.ID ?? unit.id);
    const armours = Array.isArray(unit.Armours) ? unit.Armours : [];
    
    // Detección de navío: Clase 22 (especificación rápida) o Clase 16 (Genie Engine canónico de barcos) o keywords o ID
    const isShip = armours.some(a => a.Class === 22 || a.Class === 16) ||
                   name.includes('ship') || name.includes('galley') || name.includes('barco') || name.includes('hulk') ||
                   HULK_LINE_IDS.has(id) || ARROW_SHIP_IDS.has(id) || FIRE_SHIP_IDS.has(id) || DEMO_SHIP_IDS.has(id) ||
                   CANNON_GALLEON_IDS.has(id) || DROMON_IDS.has(id) || TURTLE_SHIP_IDS.has(id);

    if (!isShip) return null;

    // 1. Línea de Hulk / Choque naval melee
    const isHulk = HULK_LINE_IDS.has(id) ||
                   name.includes('hulk') || name.includes('carrack') || name.includes('carraca') || 
                   name.includes('lou_chuan') || name.includes('louchuan');
    if (isHulk) return NAVAL_CATEGORIES.MELEE_SHIP;

    // 2. Barcos de flechas / Proyectil
    const isArrowShip = ARROW_SHIP_IDS.has(id) ||
                        name.includes('galley') || name.includes('galera') || 
                        name.includes('galleon') || name.includes('galeon') || 
                        name.includes('longboat') || name.includes('drakkar') || 
                        name.includes('caravel') || name.includes('carabela') ||
                        name.includes('sgaly') || name.includes('warga');

    // Excluir de la línea de flechas los brulotes, artillados y dromones
    const isExcludedFromArrow = name.includes('fire') || name.includes('cannon') || 
                                name.includes('frgal') || name.includes('canga') || 
                                FIRE_SHIP_IDS.has(id) || CANNON_GALLEON_IDS.has(id) || DROMON_IDS.has(id);

    if (isArrowShip && !isExcludedFromArrow) {
      return NAVAL_CATEGORIES.ARROW_SHIP;
    }

    // 3. Incendiarios, Demolición, Pólvora y Especiales
    return NAVAL_CATEGORIES.OTHER_SHIP;
  }

  /**
   * Determina si una entidad es un navío militar.
   * @param {Object} unit
   * @returns {boolean}
   */
  function isNavalUnit(unit) {
    return getNavalCategory(unit) !== null;
  }

  /**
   * Devuelve las reglas de compatibilidad de Herrería aplicables según la matriz Genie Engine.
   * 
   * @param {Object} unit
   * @returns {Object} Reglas de herrería
   */
  function getNavalBlacksmithCompatibility(unit) {
    const category = getNavalCategory(unit);
    if (!category) {
      return {
        isShip: false,
        category: null,
        meleeSmithing: true,
        arrowSmithing: true,
        arrowRangeBonus: false,
        blacksmithArmor: true
      };
    }

    return {
      isShip: true,
      category: category,
      // Línea de Choque Melee: Sí recibe Herrería Melee (+1/+2/+4)
      meleeSmithing: category === NAVAL_CATEGORIES.MELEE_SHIP,
      // Línea de Proyectil: Sí recibe Herrería Flechas (+1/+2/+3 y +1/+2/+3 Rango)
      arrowSmithing: category === NAVAL_CATEGORIES.ARROW_SHIP,
      arrowRangeBonus: category === NAVAL_CATEGORIES.ARROW_SHIP,
      // REGLA UNIVERSAL: Ningún navío en el juego recibe armadura de la herrería
      blacksmithArmor: false
    };
  }

  /**
   * Calcula los bonos efectivos de herrería para un navío.
   * 
   * @param {Object} unit - Entidad de unidad
   * @param {Object} upgrades - { meleeSmithing: 0-3, pierceSmithing: 0-3, armorUpgrade: 0-3 }
   * @returns {Object} Bonos netos aplicados
   */
  function calculateNavalBlacksmithBonuses(unit, upgrades = {}) {
    const rules = getNavalBlacksmithCompatibility(unit);
    if (!rules.isShip) {
      return { meleeBonus: 0, pierceBonus: 0, rangeBonus: 0, armorBonus: 0 };
    }

    let meleeBonus = 0;
    let pierceBonus = 0;
    let rangeBonus = 0;

    if (rules.meleeSmithing) {
      const level = Math.min(3, Math.max(0, Number(upgrades.meleeSmithing || 0)));
      if (level === 1) meleeBonus = 1;
      else if (level === 2) meleeBonus = 2;
      else if (level === 3) meleeBonus = 4;
    }

    if (rules.arrowSmithing) {
      const level = Math.min(3, Math.max(0, Number(upgrades.pierceSmithing || 0)));
      pierceBonus = level; // +1, +2, +3
      if (rules.arrowRangeBonus) {
        rangeBonus = level; // +1, +2, +3 Rango
      }
    }

    return {
      category: rules.category,
      meleeBonus,
      pierceBonus,
      rangeBonus,
      armorBonus: 0 // Siempre 0 en barcos
    };
  }

  return {
    NAVAL_CATEGORIES,
    HULK_LINE_IDS,
    ARROW_SHIP_IDS,
    FIRE_SHIP_IDS,
    DEMO_SHIP_IDS,
    CANNON_GALLEON_IDS,
    DROMON_IDS,
    TURTLE_SHIP_IDS,
    getNavalCategory,
    isNavalUnit,
    getNavalBlacksmithCompatibility,
    calculateNavalBlacksmithBonuses
  };
});
