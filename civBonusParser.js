/**
 * civBonusParser.js
 * Motor de Extracción, Mapeo y Resolución de Reglas de Civilización
 * para Age of Empires II: Definitive Edition (Genie Engine).
 *
 * Analiza sistemáticamente las cadenas maestras de data/locales/es/strings.json
 * extrayendo:
 * 1. Bonificaciones de velocidad de entrenamiento militar (Work Rates)
 * 2. Descuentos dinámicos de recursos en costes de unidades (Unit Discounts)
 * 3. Tasas netas de recolección, sobrecoste de granjas y rendimiento económico
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    let civDataModule = null;
    try { civDataModule = require('./civModifiersData.js'); } catch (e) {}
    module.exports = factory(civDataModule);
  } else if (typeof define === 'function' && define.amd) {
    define(['./civModifiersData'], factory);
  } else {
    const exports = factory(global.civModifiersData || global.CIV_DETAILED_MODIFIERS);
    global.civBonusParser = exports;
    Object.assign(global, exports);
  }
})(typeof window !== 'undefined' ? window : this, function (civDataModule) {
  'use strict';

  const detailedModifiers = (civDataModule && civDataModule.CIV_DETAILED_MODIFIERS)
    ? civDataModule.CIV_DETAILED_MODIFIERS
    : (typeof window !== 'undefined' ? window.CIV_DETAILED_MODIFIERS : {});

  // =========================================================================
  // 1. DICCIONARIO DE PATRONES REGEX DE INGENIERÍA INVERSA
  // =========================================================================
  const BONUS_PATTERNS = [
    // --- FAMILIA A: CADENCIA MILITAR Y VELOCIDAD DE ENTRENAMIENTO ---
    {
      id: 'military_train_speed',
      type: 'work_rate',
      target: 'military',
      regex: /unidades militares se entrenan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        category: 'military',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'barracks_team_speed',
      type: 'work_rate',
      target: 'barracks',
      regex: /(?:los )?cuarteles funcionan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        category: 'barracks',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'goths_perfusion',
      type: 'work_rate',
      target: 'barracks',
      regex: /Movilización \((?:los )?cuarteles funcionan un \+?(\d+)\s*%\s*más rápido\)/i,
      extract: (match) => ({
        category: 'barracks',
        uniqueTech: 'perfusion',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'stables_team_speed',
      type: 'work_rate',
      target: 'stable',
      regex: /(?:los )?establos funcionan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        category: 'stable',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'franks_chivalry',
      type: 'work_rate',
      target: 'stable',
      regex: /Caballería \((?:los )?establos funcionan un \+?(\d+)\s*%\s*más rápido\)/i,
      extract: (match) => ({
        category: 'stable',
        uniqueTech: 'chivalry',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'range_team_speed',
      type: 'work_rate',
      target: 'range',
      regex: /galerías de tiro(?: con arco)? funcionan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        category: 'range',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'siege_team_speed',
      type: 'work_rate',
      target: 'siege',
      regex: /talleres de maquinaria de asedio funcionan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        category: 'siege',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'gunpowder_train_speed',
      type: 'work_rate',
      target: 'gunpowder',
      regex: /unidades de pólvora se entrenan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        unitClass: 'gunpowder',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'persians_tc_dock_speed',
      type: 'work_rate',
      target: 'town_center',
      regex: /centros urbanos y los muelles.*trabajan un (\d+)\/(\d+)\/(\d+)\/(\d+)\s*%/i,
      extract: (match) => ({
        category: 'town_center_and_dock',
        ratesByAge: {
          dark: Number(match[1]) / 100,
          feudal: Number(match[2]) / 100,
          castle: Number(match[3]) / 100,
          imperial: Number(match[4]) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'romans_comitatenses',
      type: 'work_rate',
      target: 'militia_knight_centurion',
      regex: /Comitatenses \(.*entrenan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        uniqueTech: 'comitatenses',
        targets: ['militia_line', 'knight_line', 'centurion'],
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'gurjaras_camel_elephant_speed',
      type: 'work_rate',
      target: 'camel_elephant',
      regex: /unidades del camello y el elefante entrenan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        targets: ['camel_line', 'battle_elephant_line'],
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'khitans_trio_speed',
      type: 'work_rate',
      target: 'skirm_spear_scout',
      regex: /guerrilleros, lanceros y caballería de exploración entrenan.*un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        targets: ['skirmisher_line', 'spearman_line', 'scout_cavalry_line'],
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'muisca_slinger_speed',
      type: 'work_rate',
      target: 'slinger',
      regex: /Huaracas \(.*entrenan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        uniqueTech: 'huaracas',
        target: 'slinger',
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'cumans_steppe_husbandry',
      type: 'work_rate',
      target: 'steppe_units',
      regex: /Ganadería de la estepa \(.*entrenan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        uniqueTech: 'steppe_husbandry',
        targets: ['scout_cavalry_line', 'steppe_lancer_line', 'cavalry_archer_line'],
        workRateBonus: Number(match[1]) / 100,
        description: match[0]
      })
    },

    // --- FAMILIA B: DESCUENTOS DINÁMICOS DE RECURSOS EN UNIDADES ---
    {
      id: 'hindustanis_villager_discount',
      type: 'unit_discount',
      target: 'villager',
      regex: /aldeanos cuestan un (\d+)\/(\d+)\/(\d+)\/(\d+)%\s*menos/i,
      extract: (match) => ({
        unit: 'villager',
        resource: 'all',
        discountByAge: {
          dark: Number(match[1]) / 100,
          feudal: Number(match[2]) / 100,
          castle: Number(match[3]) / 100,
          imperial: Number(match[4]) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'mayans_archer_discount',
      type: 'unit_discount',
      target: 'foot_archer',
      regex: /coste de los arqueros a pie se reduce un (\d+)\s*%\/(\d+)\s*%\/(\d+)\s*%/i,
      extract: (match) => ({
        unit: 'foot_archer',
        resource: 'all',
        discountByAge: {
          dark: 0,
          feudal: Number(match[1]) / 100,
          castle: Number(match[2]) / 100,
          imperial: Number(match[3]) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'goths_infantry_discount',
      type: 'unit_discount',
      target: 'infantry',
      regex: /infantería cuesta un (\d+)\/(\d+)\/(\d+)\/(\d+)\s*%\s*menos/i,
      extract: (match) => ({
        unitCategory: 'infantry',
        resource: 'all',
        discountByAge: {
          dark: Number(match[1]) / 100,
          feudal: Number(match[2]) / 100,
          castle: Number(match[3]) / 100,
          imperial: Number(match[4]) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'byzantines_trash_discount',
      type: 'unit_discount',
      target: 'counter_units',
      regex: /jinetes de camello, los guerrilleros y los lanceros cuestan un (\d+)\s*%\s*menos/i,
      extract: (match) => ({
        targets: ['camel_line', 'skirmisher_line', 'spearman_line'],
        resource: 'all',
        rate: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'portuguese_gold_discount',
      type: 'unit_discount',
      target: 'all_units',
      regex: /todas las unidades cuestan un (\d+)\s*%\s*menos de oro/i,
      extract: (match) => ({
        targets: ['all_units'],
        resource: 'gold',
        rate: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'berbers_stable_discount',
      type: 'unit_discount',
      target: 'stable_units',
      regex: /unidades de los establos cuestan un (\d+)\s*%\s*menos en la Edad de los Castillos y un (\d+)\s*%\s*menos en la Edad Imperial/i,
      extract: (match) => ({
        unitCategory: 'stable',
        resource: 'all',
        discountByAge: {
          dark: 0,
          feudal: 0,
          castle: Number(match[1]) / 100,
          imperial: Number(match[2]) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'incas_food_discount',
      type: 'unit_discount',
      target: 'military_food',
      regex: /coste de comida de las unidades militares se reduce un (\d+)\s*%\/(\d+)\s*%\/(\d+)\s*%(?: y (\d+)\s*%)?/i,
      extract: (match) => ({
        target: 'military_food',
        resource: 'food',
        discountByAge: {
          dark: Number(match[1]) / 100,
          feudal: Number(match[2]) / 100,
          castle: Number(match[3]) / 100,
          imperial: Number(match[4] || 30) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'malay_elephant_discount',
      type: 'unit_discount',
      target: 'battle_elephant',
      regex: /elefantes de combate cuestan un (\d+)\/(\d+)\s*%\s*menos/i,
      extract: (match) => ({
        target: 'battle_elephant_line',
        discountByAge: {
          castle: Number(match[1]) / 100,
          imperial: Number(match[2]) / 100
        },
        description: match[0]
      })
    },
    {
      id: 'persians_kamandaran',
      type: 'unit_conversion',
      target: 'archer_line',
      regex: /Kamandaran \(el coste de oro de los arqueros se reemplaza/i,
      extract: (match) => ({
        uniqueTech: 'kamandaran',
        conversion: 'archer_gold_to_wood',
        description: match[0]
      })
    },
    {
      id: 'magyars_corvinian',
      type: 'unit_conversion',
      target: 'magyar_huszar',
      regex: /Ejército corviniano \(los huszár magiares dejan de costar oro/i,
      extract: (match) => ({
        uniqueTech: 'corvinian_army',
        conversion: 'huszar_free_gold',
        description: match[0]
      })
    },

    // --- FAMILIA C: TASAS DE RECOLECCIÓN, RETENCIÓN Y RESIEMBRA DE GRANJAS ---
    {
      id: 'celts_lumberjacks',
      type: 'eco_gather',
      resource: 'wood',
      regex: /leñadores trabajan un (\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        resource: 'wood',
        gatherMultiplier: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    },
    {
      id: 'turks_gold_miners',
      type: 'eco_gather',
      resource: 'gold',
      regex: /mineros de oro trabajan un (\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        resource: 'gold',
        gatherMultiplier: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    },
    {
      id: 'koreans_stone_miners',
      type: 'eco_gather',
      resource: 'stone',
      regex: /canteros trabajan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        resource: 'stone',
        gatherMultiplier: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    },
    {
      id: 'slavs_farmers',
      type: 'eco_gather',
      resource: 'food_farming',
      regex: /agricultores trabajan un \+?(\d+)\s*%\s*más rápido/i,
      extract: (match) => ({
        resource: 'farming',
        farmRateMultiplier: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    },
    {
      id: 'khmer_farms',
      type: 'eco_farm_mechanic',
      target: 'khmer_perfect_farms',
      regex: /granjeros no necesitan molinos o centros urbanos para depositar/i,
      extract: (match) => ({
        perfectFarmRate: true,
        description: match[0]
      })
    },
    {
      id: 'khitans_pastures',
      type: 'eco_farm_mechanic',
      target: 'pastures',
      regex: /pasturas reemplazan a las granjas/i,
      extract: (match) => ({
        usesPastures: true,
        farmOverheadFree: true,
        description: match[0]
      })
    },
    {
      id: 'danes_food_dropoff',
      type: 'eco_dropoff',
      resource: 'food',
      regex: /aldeanos dejan un (\d+)\s*%\s*más de comida/i,
      extract: (match) => ({
        foodDropOffYield: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    },
    {
      id: 'mapuche_foraging_dropoff',
      type: 'eco_dropoff',
      resource: 'foraging',
      regex: /recolectores entregan un (\d+)\s*%\s*más de comida/i,
      extract: (match) => ({
        foragingDropOffYield: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    },
    {
      id: 'shu_woodcutters_food',
      type: 'eco_dual_yield',
      target: 'woodcutters',
      regex: /leñadores generan comida adicional, además de madera/i,
      extract: (match) => ({
        woodcuttersGenerateFoodRatio: 0.15,
        description: match[0]
      })
    },
    {
      id: 'teutons_farm_discount',
      type: 'eco_farm_cost',
      target: 'farms',
      regex: /granjas cuestan un (\d+)\s*%\s*menos/i,
      extract: (match) => ({
        farmWoodCost: Math.round(60 * (1 - (Number(match[1]) / 100))),
        description: match[0]
      })
    },
    {
      id: 'sicilians_farm_capacity',
      type: 'eco_farm_capacity',
      target: 'farms',
      regex: /mejoras de las granjas proporcionan un (\d+)\s*%\s*de comida adicional/i,
      extract: (match) => ({
        farmCapacityBonusMultiplier: Number(match[1]) / 100,
        description: match[0]
      })
    },
    {
      id: 'mayans_resource_duration',
      type: 'eco_resource_duration',
      target: 'all_resources',
      regex: /recursos duran un (\d+)\s*%\s*más/i,
      extract: (match) => ({
        resourceDurationMultiplier: 1 + (Number(match[1]) / 100),
        description: match[0]
      })
    }
  ];

  // =========================================================================
  // 2. MÉTODOS DE PARSING Y RESOLUCIÓN
  // =========================================================================

  /**
   * Extrae todas las reglas aplicables de un texto en bruto
   * @param {string} rawText Texto con o sin tags HTML
   * @param {string} [civId=''] Identificador opcional de civilización
   * @returns {Array<Object>} Lista de reglas extraídas
   */
  function parseStringBonuses(rawText, civId = '') {
    if (!rawText) return [];
    const text = String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const extracted = [];

    BONUS_PATTERNS.forEach(pattern => {
      const match = text.match(pattern.regex);
      if (match) {
        const data = pattern.extract(match);
        extracted.push({
          id: pattern.id,
          type: pattern.type,
          target: pattern.target,
          civId,
          ...data
        });
      }
    });

    return extracted;
  }

  /**
   * Extrae y clasifica los bonos de una civilización a partir de su string oficial
   * @param {string} civId
   * @param {string} rawString
   * @returns {{ workRateRules: Array, discountRules: Array, ecoRules: Array, rawMatches: Array }}
   */
  function extractCivBonuses(civId, rawString) {
    const rules = parseStringBonuses(rawString, civId);

    const workRateRules = rules.filter(r => r.type === 'work_rate');
    const discountRules = rules.filter(r => r.type === 'unit_discount' || r.type === 'unit_conversion');
    const ecoRules = rules.filter(r => r.type.startsWith('eco_'));

    return {
      civId,
      workRateRules,
      discountRules,
      ecoRules,
      rawMatches: rules
    };
  }

  /**
   * Procesa todo el diccionario de strings oficial y devuelve un mapa completo
   * @param {Object} stringsDict Objeto de strings.json
   * @param {Object} stringMap Mapeo de civId a ID numérico de string
   * @returns {Object<string, Object>} Mapa de resultados por civId
   */
  function parseAllCivsFromStrings(stringsDict, stringMap) {
    if (!stringsDict || !stringMap) return {};
    const results = {};

    for (const [civId, strId] of Object.entries(stringMap)) {
      const text = stringsDict[strId];
      if (text) {
        results[civId] = extractCivBonuses(civId, text);
      }
    }

    return results;
  }

  /**
   * Combina las reglas extraídas con el registro canónico tipificado (CIV_DETAILED_MODIFIERS)
   * @param {string} civId
   * @param {Object} [stringsDict=null]
   * @returns {Object} Modificadores consolidados
   */
  function getResolvedCivModifiers(civId, stringsDict = null) {
    const norm = String(civId || '').toLowerCase().trim();
    const staticData = detailedModifiers[norm] || detailedModifiers.generic || {};

    let dynamicRules = null;
    if (stringsDict && typeof stringsDict === 'object') {
      const strMap = (typeof window !== 'undefined' && window.CIV_STRING_MAP)
        ? window.CIV_STRING_MAP
        : null;
      if (strMap && strMap[norm]) {
        dynamicRules = extractCivBonuses(norm, stringsDict[strMap[norm]]);
      }
    }

    return {
      civId: norm,
      name: staticData.name || norm,
      workRates: staticData.workRates || {},
      unitDiscounts: staticData.unitDiscounts || {},
      ecoModifiers: staticData.ecoModifiers || {},
      extractedRules: dynamicRules
    };
  }

  return {
    BONUS_PATTERNS,
    parseStringBonuses,
    extractCivBonuses,
    parseAllCivsFromStrings,
    getResolvedCivModifiers
  };
});