/**
 * ecoRates.js
 * Motor matemático de simulación económica y recolección para Age of Empires II: DE (Genie Engine).
 *
 * Implementa:
 * - Tabla empírica de recolección de granjas (Ideal, 2.º Anillo, Promedio Realista 50/50, Jemeres y Pasturas Khitan)
 * - Modificadores analíticos aditivos y acumulativos para madera, oro, piedra, bayas, caza y pastoreo
 * - Catálogo exhaustivo de bonificaciones para las 56 civilizaciones (CIV_ECO_MODIFIERS)
 * - Sobrecoste de madera por resiembra de granjas (Farm Reseeding Overhead)
 * - Tiempo de trabajo de aldeano (Villager Work Time / VT)
 * - Integración con descuentos dinámicos de unidades (civUnitDiscounts)
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Entorno CommonJS / Node.js
    let unitDiscounts = null;
    let modifiersData = null;
    let bonusParser = null;
    let unitClass = null;
    let unitService = null;
    try { unitDiscounts = require('./civUnitDiscounts.js'); } catch (e) {}
    try { modifiersData = require('./civModifiersData.js'); } catch (e) {}
    try { bonusParser = require('./civBonusParser.js'); } catch (e) {}
    try { unitClass = require('./unitClassification.js'); } catch (e) {}
    try { unitService = require('./unitService.js'); } catch (e) {}
    module.exports = factory(unitDiscounts, modifiersData, bonusParser, unitClass, unitService);
  } else if (typeof define === 'function' && define.amd) {
    define(['./civUnitDiscounts', './civModifiersData', './civBonusParser', './unitClassification', './unitService'], factory);
  } else {
    const exports = factory(
      global.civUnitDiscounts || global.civUnitDiscountsModule,
      global.civModifiersData || global.CIV_DETAILED_MODIFIERS,
      global.civBonusParser,
      global.unitClassification,
      global.unitService
    );
    global.ecoRates = exports;
    Object.assign(global, exports);
  }
})(typeof window !== 'undefined' ? window : this, function (unitDiscountsModule, modifiersDataModule, bonusParserModule, unitClassModule, unitServiceModule) {
  'use strict';

  // =========================================================================
  // 1. TABLA EMPÍRICA DE RATIOS DE GRANJAS (unidades de alimento / minuto)
  // Calibración canónica de AoE2 Database (Genie Engine)
  // =========================================================================
  const FARM_RATES_TABLE = Object.freeze({
    // Nivel 0: Sin mejoras (Dark / Feudal inicial)
    0: {
      ideal: 20.07,
      ring2: 16.65,
      realistic: 18.36,
      khmer: 20.07,
      khitans: 21.61
    },
    // Nivel 1: Carretilla + Collera (Feudal pleno)
    1: {
      ideal: 22.34,
      ring2: 19.32,
      realistic: 20.83,
      khmer: 22.34,
      khitans: 23.33
    },
    // Nivel 2: Carro de mano + Arado pesado (Edad de los Castillos)
    2: {
      ideal: 23.62,
      ring2: 23.01,
      realistic: 23.31,
      khmer: 23.62,
      khitans: 25.21
    },
    // Nivel 3: Rotación de cultivos (Edad Imperial)
    3: {
      ideal: 24.80,
      ring2: 24.10,
      realistic: 24.45,
      khmer: 24.80,
      khitans: 26.00
    }
  });

  // Tasas base de recolección natural (unidades / minuto por aldeano)
  const BASE_RATES_PER_MIN = Object.freeze({
    wood: 23.4,       // Leñador base (~0.39 rec/seg)
    gold: 22.8,       // Minero de oro base (~0.38 rec/seg)
    stone: 21.6,      // Cantero base (~0.36 rec/seg)
    foraging: 18.6,   // Recolector de bayas
    sheep: 19.8,      // Pastoreo / Ovejas
    hunting: 24.6,    // Cazador (jabalí / ciervos)
    shore_fish: 26.0  // Pescador de costa
  });

  // =========================================================================
  // 2. CATÁLOGO EXHAUSTIVO DE BONIFICACIONES ECONÓMICAS (CIV_ECO_MODIFIERS)
  // Cubre las 56 civilizaciones oficiales y regionales (Tres Reinos, Muisca, etc.)
  // =========================================================================
  const CIV_ECO_MODIFIERS = Object.freeze({
    // --- OFICIALES ---
    britons: { taskMultipliers: { sheep: 1.25 } },
    celts: { taskMultipliers: { wood: 1.15 } },
    franks: { 
      taskMultipliers: { foraging: 1.15 }, 
      freeTechs: { feudal: ['horse_collar'], castle: ['heavy_plow'], imperial: ['crop_rotation'] } // Granjas gratis
    },
    mongols: { taskMultipliers: { hunting: 1.40 } },
    slavs: { farmRateMultiplier: 1.15 },
    turks: { taskMultipliers: { gold: 1.25 } },
    koreans: { taskMultipliers: { stone: 1.20 } },
    malians: { taskMultipliers: { gold: 1.10 } }, // +10% oro depositado
    romans: { globalGatherMultiplier: 1.05 },
    vikings: { freeTechs: { feudal: ['wheelbarrow'], castle: ['hand_cart'] } }, // Carretilla y Carro de mano gratis
    burmese: { freeTechs: { feudal: ['double_bit_axe'], castle: ['bow_saw'], imperial: ['two_man_saw'] } }, // Maderero gratis
    bohemians: { 
      freeTechs: { 
        feudal: ['gold_mining', 'stone_mining'], 
        castle: ['gold_shaft_mining', 'stone_shaft_mining'] 
      } 
    },
    teutons: { farmCost: 36 }, // -40% coste de madera
    sicilians: { farmTechBonusMultiplier: 2.25 }, // +125% adicional al beneficio de granjas
    mayans: { resourceDurationMultiplier: 1.15 }, // Recursos y granjas rinden 15% más
    khmer: { perfectFarms: true }, // 100% ideal sin trayecto
    hindustanis: { villagerDiscounts: { dark: 0.08, feudal: 0.13, castle: 0.18, imperial: 0.23 } },
    aztecs: {
      workRates: { military: 1.15 },
      carryCapacityBonus: 3,
      taskMultipliers: {
        wood: 1.055,      // +5.5% rendimiento neto en madereros
        gold: 1.055,      // +5.5% en minería de oro
        stone: 1.055,     // +5.5% en canteras de piedra
        foraging: 1.06,   // +6.0% en bayas
        hunting: 1.06,    // +6.0% en caza
        sheep: 1.06,      // +6.0% en pastoreo
        shore_fish: 1.06, // +6.0% en pesca de orilla
        farm: 1.065       // +6.5% real en granjas (ahorro de viajes de depósito)
      }
    },
    berbers: { villagerSpeedBonus: 1.05 }, // Aldeanos +10% velocidad (~+5% recolección)
    poles: { folwarkFarms: true },
    bengalis: { freeVillagersOnAgeUp: 2 },
    persians: { tcWorkRateByAge: { dark: 1.05, feudal: 1.10, castle: 1.15, imperial: 1.20 } },
    spanish: { buildSpeedMultiplier: 1.30 },

    // --- MOD / REGIONALES / TRES REINOS ---
    danes: { foodDepositMultiplier: 1.05 }, // Aldeanos depositan +5% comida
    mapuche: { taskMultipliers: { foraging: 1.25 } }, // +25% comida entregada de bayas
    muiscas: { 
      freeTechs: { castle: ['caravans'], imperial: ['guilds'] },
      ageUpGoldDiscount: 0.50 
    },
    khitans: {
      usesPastures: true,
      pasture: {
        baseCost: 110,           // Coste en madera para levantar/resembrar la pastura (110 madera)
        baseCapacity: 345,       // Alimento base de la pastura sin mejoras (345 alimento)
        shepherdsPerPasture: 2,  // Ocupación simultánea: 2 pastores por parcela
        techBonuses: {
          domestication: 115,    // +115 Alimento (Total: 460)
          pastoralism: 230,      // +230 Alimento (Total: 690)
          transhumance: 345      // +345 Alimento (Total: 1035)
        }
      }
    },
    jurchen: { decayFactor: 0.0 }, // Caza sin descomposición
    shu: { woodcutterFoodRatio: 0.15 }, // Leñadores generan +15% de comida secundaria
    wei: { freeVillagerPerEcoTech: 1 }, // 1 aldeano gratis por mejora económica investigada
    wu: { militaryBuildingFoodBonus: 55 } // +55 alimento al completar edificios militares
  });

  /**
   * Helper para verificar presencia de tecnología por ID numérico o clave string
   */
  function hasTech(activeTechs, id, key) {
    if (!activeTechs) return false;
    if (Array.isArray(activeTechs)) {
      return activeTechs.includes(id) || activeTechs.includes(String(id)) || (key && activeTechs.includes(key));
    }
    if (activeTechs instanceof Set) {
      return activeTechs.has(id) || activeTechs.has(String(id)) || (key && activeTechs.has(key));
    }
    if (typeof activeTechs === 'object') {
      return Boolean(activeTechs[id] || (key && activeTechs[key]));
    }
    return false;
  }

  /**
   * Tasa de recolección de granjas en alimento por minuto por aldeano.
   * Las tecnologías de Molino (Collera #14, Arado pesado #13, Rotación de cultivos #12)
   * NO alteran esta función.
   *
   * @param {string} civId
   * @param {number[]|string[]|Set} [activeTechs=[]]
   * @param {'realistic'|'ideal'|'ring2'} [farmEfficiency='realistic']
   * @returns {number} alim/min/ald
   */
  function getFarmGatherRate(civId, activeTechs = [], farmEfficiency = 'realistic') {
    const civ = String(civId || '').toLowerCase().trim();
    const isKhmer = civ === 'khmer';
    const isKhitan = civ === 'khitans';

    const hasWheelbarrow = hasTech(activeTechs, 213, 'wheelbarrow');
    const hasHandCart = hasTech(activeTechs, 249, 'hand_cart');

    let rate = 0;

    // 1. Tasa base según nivel de mejoras de acarreo
    if (isKhitan) {
      // Pasturas Khitan (tasa empírica)
      if (hasHandCart) rate = 25.21;
      else if (hasWheelbarrow) rate = 23.33;
      else rate = 21.61;
    } else if (isKhmer || farmEfficiency === 'ideal') {
      // Jemeres (sin acarreo) o Granjas Ideales (1.er anillo de 8)
      if (hasHandCart) rate = 23.62;
      else if (hasWheelbarrow) rate = 22.34;
      else rate = 20.07;
    } else if (farmEfficiency === 'ring2') {
      // Granjas en 2.° anillo
      if (hasHandCart) rate = 23.01;
      else if (hasWheelbarrow) rate = 19.32;
      else rate = 16.65;
    } else {
      // Promedio Realista (50% 1.er anillo / 50% 2.° anillo)
      if (hasHandCart) rate = 23.31;
      else if (hasWheelbarrow) rate = 20.83;
      else rate = 18.36;
    }

    // 2. Bonificaciones de Civilización sobre la tasa
    if (civ === 'slavs') {
      rate *= 1.15; // Granjas trabajan +15% más rápido
    }
    if (civ === 'romans') {
      rate *= 1.05; // Aldeanos recolectan +5% más rápido
    }
    if (civ === 'danes') {
      rate *= 1.05; // +5% comida depositada general
    }
    if (civ === 'aztecs') {
      const azMult = (CIV_ECO_MODIFIERS.aztecs?.taskMultipliers?.farm) || 1.065;
      rate *= azMult; // +6.5% real en granjas (ahorro de viajes de depósito)
    }

    return Math.round(rate * 100) / 100;
  }

  /**
   * Capacidad de alimento de la granja (utilizada exclusivamente para el sobrecoste de resiembra).
   * AQUÍ es donde aplican Collera, Arado pesado y Rotación de cultivos.
   *
   * @param {string} civId
   * @param {number[]|string[]|Set} [activeTechs=[]]
   * @returns {number} Capacidad total de alimento
   */
  function getFarmCapacity(civId, activeTechs = []) {
    const civ = String(civId || '').toLowerCase().trim();
    let capacity = 175; // Base Alta Edad Media

    const isSicilian = civ === 'sicilians';
    const bonusMultiplier = isSicilian ? 2.25 : 1.0;

    // Collera (ID 14): +75 (+169 en Sicilianos)
    if (hasTech(activeTechs, 14, 'horse_collar')) capacity += Math.round(75 * bonusMultiplier);
    // Arado pesado (ID 13): +125 (+281 en Sicilianos)
    if (hasTech(activeTechs, 13, 'heavy_plow')) capacity += Math.round(125 * bonusMultiplier);
    // Rotación de cultivos (ID 12): +175 (+394 en Sicilianos)
    if (hasTech(activeTechs, 12, 'crop_rotation')) capacity += Math.round(175 * bonusMultiplier);

    // Mayas: Granjas y recursos duran un 15% más
    if (civ === 'mayans') {
      capacity = Math.round(capacity * 1.15);
    }
    // Chinos: Granjas proporcionan un 10% más de alimento (Team Bonus)
    if (civ === 'chinese') {
      capacity = Math.round(capacity * 1.10);
    }

    return capacity;
  }

  /**
   * Capacidad total de la pastura considerando tecnologías investigadas
   * Capacidad total de la pastura considerando tecnologías investigadas
   * Escalones oficiales: 345 (base), 460 (+115 Domesticación), 690 (+230 Pastoreo), 1035 (+345 Trashumancia)
   *
   * @param {Array|Set|Object} [activeTechs=[]]
   * @returns {number}
   */
  function getPastureCapacity(activeTechs = []) {
    const khitanConfig = (CIV_ECO_MODIFIERS.khitans && CIV_ECO_MODIFIERS.khitans.pasture) || {
      baseCost: 110,
      baseCapacity: 345,
      shepherdsPerPasture: 2,
      techBonuses: { domestication: 115, pastoralism: 230, transhumance: 345 }
    };
    let capacity = khitanConfig.baseCapacity || 345;
    const bonuses = khitanConfig.techBonuses || { domestication: 115, pastoralism: 230, transhumance: 345 };

    const techsArr = Array.isArray(activeTechs) ? activeTechs : Array.from(activeTechs || []);

    // 1. Domesticación (ID 138 / ID 1950 / 'domestication' / Collerón ID 14 / 'horse_collar'): +115 -> 460
    if (techsArr.includes(138) || techsArr.includes('138') ||
        techsArr.includes(1950) || techsArr.includes('1950') || techsArr.includes('domestication') ||
        techsArr.includes(14) || techsArr.includes('14') || techsArr.includes('horse_collar') ||
        hasTech(activeTechs, 138, 'domestication') || hasTech(activeTechs, 1950, 'domestication') || hasTech(activeTechs, 14, 'horse_collar')) {
      capacity += (bonuses.domestication || 115);
    }

    // 2. Pastoreo (ID 137 / ID 1951 / 'pastoralism' / Arado pesado ID 13 / 'heavy_plow'): +230 -> 690
    if (techsArr.includes(137) || techsArr.includes('137') ||
        techsArr.includes(1951) || techsArr.includes('1951') || techsArr.includes('pastoralism') ||
        techsArr.includes(13) || techsArr.includes('13') || techsArr.includes('heavy_plow') ||
        hasTech(activeTechs, 137, 'pastoralism') || hasTech(activeTechs, 1951, 'pastoralism') || hasTech(activeTechs, 13, 'heavy_plow')) {
      capacity += (bonuses.pastoralism || 230);
    }

    // 3. Trashumancia (ID 136 / ID 1952 / 'transhumance' / Rotación de cultivos ID 12 / 'crop_rotation'): +345 -> 1035
    if (techsArr.includes(136) || techsArr.includes('136') ||
        techsArr.includes(1952) || techsArr.includes('1952') || techsArr.includes('transhumance') ||
        techsArr.includes(12) || techsArr.includes('12') || techsArr.includes('crop_rotation') ||
        hasTech(activeTechs, 136, 'transhumance') || hasTech(activeTechs, 1952, 'transhumance') || hasTech(activeTechs, 12, 'crop_rotation')) {
      capacity += (bonuses.transhumance || 345);
    }

    return capacity;
  }

  /**
   * Obtiene la capacidad total de alimento y el coste de madera de las granjas
   * según la civilización y las tecnologías activas.
   *
   * @param {string} civId
   * @param {string[]|number[]} activeEcoTechs
   * @returns {{ farmCost: number, farmCapacity: number, usesPastures: boolean, shepherdsPerPasture?: number }}
   */
  function getFarmMetrics(civId = '', activeEcoTechs = []) {
    const civ = String(civId || '').toLowerCase().trim();
    const civMod = CIV_ECO_MODIFIERS[civ] || {};

    // Khitanes: usan Pasturas con coste de resiembra (110 madera), capacidad escalonada y ocupación doble (2 pastores)
    if (civMod.usesPastures || civ === 'khitans') {
      const pastureConfig = civMod.pasture || {
        baseCost: 110,
        baseCapacity: 345,
        shepherdsPerPasture: 2,
        techBonuses: { domestication: 115, pastoralism: 230, transhumance: 345 }
      };
      const farmCost = (typeof pastureConfig.baseCost === 'number') ? pastureConfig.baseCost : 110;
      const farmCapacity = getPastureCapacity(activeEcoTechs);
      const shepherdsPerPasture = pastureConfig.shepherdsPerPasture || 2;
      return {
        farmCost,
        farmCapacity,
        usesPastures: true,
        shepherdsPerPasture
      };
    }

    // Coste de madera: Base 60, Teutones 36 (-40%)
    let farmCost = (typeof civMod.farmCost === 'number') ? civMod.farmCost : 60;

    // Capacidad calculada exclusivamente mediante getFarmCapacity
    const farmCapacity = getFarmCapacity(civ, activeEcoTechs);

    return { farmCost, farmCapacity, usesPastures: false };
  }

  /**
   * Determina el nivel tecnológico de acarreo de la granja (0 a 2) según Carretilla y Carro de mano
   */
  function getFarmTechLevel(activeEcoTechs = []) {
    if (hasTech(activeEcoTechs, 249, 'hand_cart')) return 2;
    if (hasTech(activeEcoTechs, 213, 'wheelbarrow')) return 1;
    return 0;
  }

  /**
   * Calcula las tasas netas de recolección por recurso considerando la matriz empírica
   * y las bonificaciones de civilización.
   *
   * @param {string} civId
   * @param {string[]|number[]} activeEcoTechs
   * @param {Object} [options]
   * @param {string} [options.foodSource='farming']
   * @param {string} [options.farmEfficiencyMode='realistic'] - 'realistic' | 'ideal' | 'ring2'
   * @returns {{ food: number, wood: number, gold: number, stone: number, foodSource: string, farmEfficiencyMode: string }}
   */
  function getGatherRates(civId = '', activeEcoTechs = [], options = {}) {
    if (typeof civId === 'object' && civId !== null) {
      options = civId;
      civId = options.civId || options.civ || '';
      activeEcoTechs = options.activeEcoTechs || options.activeTechs || [];
    }
    const civ = String(civId || '').toLowerCase().trim();
    const civMod = CIV_ECO_MODIFIERS[civ] || {};
    const foodSource = options.foodSource || 'farming';
    const farmMode = options.farmEfficiencyMode || 'realistic';

    const hasWheelbarrow = hasTech(activeEcoTechs, 213, 'wheelbarrow');
    const hasHandCart = hasTech(activeEcoTechs, 249, 'hand_cart');

    // 1. TASA DE ALIMENTO
    let foodRate;
    if (foodSource === 'farming') {
      // Obtenido directamente de getFarmGatherRate, que ya incorpora los bonos específicos de granja
      foodRate = getFarmGatherRate(civ, activeEcoTechs, farmMode);
    } else {
      // Fuentes naturales (bayas, ovejas, caza, pesca de orilla)
      foodRate = BASE_RATES_PER_MIN[foodSource] || BASE_RATES_PER_MIN.foraging;
      if (civMod.taskMultipliers && civMod.taskMultipliers[foodSource]) {
        foodRate *= civMod.taskMultipliers[foodSource];
      }
      if (civ === 'danes' || civMod.foodDepositMultiplier) {
        foodRate *= 1.05; // Daneses: +5% en toda la comida depositada
      }
      if (civ === 'romans' || civMod.globalGatherMultiplier) {
        foodRate *= 1.05; // Romanos: +5% velocidad de trabajo en todas las tareas
      }
    }

    // 2. TASA DE MADERA
    let woodRate = BASE_RATES_PER_MIN.wood;
    let woodTechMultiplier = 1.0;
    if (hasTech(activeEcoTechs, 202, 'double_bit_axe')) woodTechMultiplier += 0.20;
    if (hasTech(activeEcoTechs, 203, 'bow_saw')) woodTechMultiplier += 0.20;
    if (hasTech(activeEcoTechs, 221, 'two_man_saw')) woodTechMultiplier += 0.10;
    woodRate *= woodTechMultiplier;

    // Logística: +5% acumulativo por Carretilla y +5% por Carro de mano
    if (hasWheelbarrow) woodRate *= 1.05;
    if (hasHandCart) woodRate *= 1.05;

    if (civMod.taskMultipliers && civMod.taskMultipliers.wood) {
      woodRate *= civMod.taskMultipliers.wood;
    }
    if (civ === 'romans' || civMod.globalGatherMultiplier) {
      woodRate *= 1.05; // Romanos: +5% global en todas las tareas
    }

    // 3. TASA DE ORO
    let goldRate = BASE_RATES_PER_MIN.gold;
    let goldTechMultiplier = 1.0;
    if (hasTech(activeEcoTechs, 55, 'gold_mining')) goldTechMultiplier += 0.15;
    if (hasTech(activeEcoTechs, 182, 'gold_shaft_mining')) goldTechMultiplier += 0.15;
    goldRate *= goldTechMultiplier;

    if (hasWheelbarrow) goldRate *= 1.05;
    if (hasHandCart) goldRate *= 1.05;

    if (civMod.taskMultipliers && civMod.taskMultipliers.gold) {
      goldRate *= civMod.taskMultipliers.gold;
    }
    if (civ === 'romans' || civMod.globalGatherMultiplier) {
      goldRate *= 1.05; // Romanos: +5% global
    }

    // 4. TASA DE PIEDRA
    let stoneRate = BASE_RATES_PER_MIN.stone;
    let stoneTechMultiplier = 1.0;
    if (hasTech(activeEcoTechs, 278, 'stone_mining')) stoneTechMultiplier += 0.15;
    if (hasTech(activeEcoTechs, 279, 'stone_shaft_mining')) stoneTechMultiplier += 0.15;
    stoneRate *= stoneTechMultiplier;

    if (hasWheelbarrow) stoneRate *= 1.05;
    if (hasHandCart) stoneRate *= 1.05;

    if (civMod.taskMultipliers && civMod.taskMultipliers.stone) {
      stoneRate *= civMod.taskMultipliers.stone;
    }
    if (civ === 'romans' || civMod.globalGatherMultiplier) {
      stoneRate *= 1.05; // Romanos: +5% global
    }

    return {
      food: Math.round(foodRate * 100) / 100,
      wood: Math.round(woodRate * 100) / 100,
      gold: Math.round(goldRate * 100) / 100,
      stone: Math.round(stoneRate * 100) / 100,
      foodSource,
      farmEfficiencyMode: farmMode
    };
  }

  /**
   * Calcula el sobrecoste de madera por resiembra de granjas o pasturas (Farm/Pasture Reseeding Overhead).
   * Para pasturas (Khitanes), cada parcela soporta simultáneamente a 2 pastores (extracción doble),
   * por lo que la parcela se agota en T_pasture = F_cap / (2 * G_food).
   */
  function calculateFarmOverhead(farmersCount, foodRatePerMin, farmMetrics, woodRatePerMin) {
    const fCount = Math.max(0, Number(farmersCount) || 0);
    const gFood = Math.max(0.01, Number(foodRatePerMin) || 18.36);
    const gWood = Math.max(0.01, Number(woodRatePerMin) || 23.4);
    const { farmCost = 0, farmCapacity = 0, usesPastures = false } = farmMetrics || {};
    const workersPerPlot = usesPastures ? (farmMetrics.shepherdsPerPasture || 2) : 1;

    // Si no hay recolectores o la parcela no cuesta madera o no tiene capacidad, sobrecoste nulo
    if (fCount === 0 || farmCost === 0 || farmCapacity <= 0) {
      return {
        farmCapacity: farmCapacity || 0,
        farmCost: 0,
        farmLifespanMin: farmCapacity > 0 ? Math.round((farmCapacity / (gFood * workersPerPlot)) * 100) / 100 : 0,
        woodDemandPerFarmerPerMin: 0,
        totalWoodDemandPerMin: 0,
        reseedLumberjacks: 0,
        usesPastures: Boolean(usesPastures),
        shepherdsPerPasture: workersPerPlot,
        activePlots: 0,
        ceilActivePlots: 0
      };
    }

    // Vida útil de la parcela (granja o pastura):
    // Granja: T_farm = F_cap / G_food
    // Pastura con extracción doble: T_pasture = F_cap / (2 * G_food)
    const farmLifespanMin = farmCapacity / (gFood * workersPerPlot);

    // Gasto de madera por recolector (pastor/granjero) por minuto:
    // D_wood/pastor = (C_pasture * G_food) / F_cap
    const woodDemandPerFarmerPerMin = (farmCost * gFood) / farmCapacity;

    // Demanda total de madera para resiembra: D_wood_total = V_f * D_wood/pastor
    const totalWoodDemandPerMin = fCount * woodDemandPerFarmerPerMin;

    // Leñadores de resiembra requeridos: ceil(D_wood_total / G_wood)
    const reseedLumberjacks = Math.ceil(totalWoodDemandPerMin / gWood);

    const activePlots = Math.round((fCount / workersPerPlot) * 10) / 10;
    const ceilActivePlots = Math.ceil(fCount / workersPerPlot);

    return {
      farmCapacity,
      farmCost,
      farmLifespanMin: Math.round(farmLifespanMin * 100) / 100,
      woodDemandPerFarmerPerMin: Math.round(woodDemandPerFarmerPerMin * 100) / 100,
      totalWoodDemandPerMin: Math.round(totalWoodDemandPerMin * 100) / 100,
      reseedLumberjacks,
      usesPastures: Boolean(usesPastures),
      shepherdsPerPasture: workersPerPlot,
      activePlots,
      ceilActivePlots
    };
  }

  /**
   * Calcula el Tiempo de Trabajo de Aldeano (Villager Work Time / VT).
   * Mide los segundos de trabajo recolector necesarios para costear una sola unidad.
   *
   * @param {{ Food?: number, Wood?: number, Gold?: number, Stone?: number, food?: number, wood?: number, gold?: number, stone?: number }} cost
   * @param {{ food: number, wood: number, gold: number, stone: number }} gatherRatesPerMin
   * @returns {{
   *   totalSeconds: number,
   *   villagerCycles: number,
   *   breakdownSeconds: { food: number, wood: number, gold: number, stone: number }
   * }}
   */
  function calculateVillagerWorkTime(cost = {}, gatherRatesPerMin = {}) {
    const fCost = Number(cost.Food ?? cost.food ?? 0);
    const wCost = Number(cost.Wood ?? cost.wood ?? 0);
    const gCost = Number(cost.Gold ?? cost.gold ?? 0);
    const sCost = Number(cost.Stone ?? cost.stone ?? 0);

    const fRateSec = Math.max(0.001, (gatherRatesPerMin.food || 18.36) / 60);
    const wRateSec = Math.max(0.001, (gatherRatesPerMin.wood || 23.4) / 60);
    const gRateSec = Math.max(0.001, (gatherRatesPerMin.gold || 22.8) / 60);
    const sRateSec = Math.max(0.001, (gatherRatesPerMin.stone || 21.6) / 60);

    const fSec = fCost / fRateSec;
    const wSec = wCost / wRateSec;
    const gSec = gCost / gRateSec;
    const sSec = sCost / sRateSec;

    const totalSeconds = fSec + wSec + gSec + sSec;
    const villagerCycles = totalSeconds / 25.0; // Ciclos de aldeano de 25 segundos

    return {
      totalSeconds: Math.round(totalSeconds * 10) / 10,
      villagerCycles: Math.round(villagerCycles * 100) / 100,
      breakdownSeconds: {
        food: Math.round(fSec * 10) / 10,
        wood: Math.round(wSec * 10) / 10,
        gold: Math.round(gSec * 10) / 10,
        stone: Math.round(sSec * 10) / 10
      }
    };
  }

  function getUnitServiceApi() {
    if (unitServiceModule && typeof unitServiceModule.getBaseUnitData === 'function') {
      return unitServiceModule;
    }
    if (typeof unitService !== 'undefined' && unitService && typeof unitService.getBaseUnitData === 'function') {
      return unitService;
    }
    if (typeof window !== 'undefined' && window.unitService && typeof window.unitService.getBaseUnitData === 'function') {
      return window.unitService;
    }
    return null;
  }

  // =========================================================================
  // CLASIFICACIÓN DE UNIDADES PARA BONIFICACIONES ECONÓMICAS
  // =========================================================================
  const GOTH_INFANTRY_IDS = new Set([
    74, 75, 77, 473, 567, 569, 1793, // Miliciano a Campeón / Legionario
    93, 358, 359,                     // Lancero, Piquero, Alabardero
    41, 555,                          // Huscarle y Huscarle de élite (Castillo)
    759, 761,                         // Huscarle y Huscarle de élite (Cuartel vía Anarquía)
    751, 752, 753, 755, 757,          // Línea de águilas
    882                               // Condotiero (aliado italiano)
  ]);

  const FOOT_ARCHER_IDS = new Set([
    4, 24, 492,                       // Arquero, Ballestero, Arbalestero
    7, 6, 218, 530, 1155,             // Guerrilleros
    185,                              // Hondero
    84, 763, 765, 1749                // Arquero de tiro largo, Arquero de plumas, Rattan
  ]);

  /**
   * Obtiene el coste efectivo de una unidad aplicando descuentos de civilización
   * Compatible con (unitObject, civId, age, activeTechs) o (unitId, civId, age, activeTechs)
   */
  function getEffectiveUnitCost(unit, civId, age = 'imperial', activeEcoTechs = []) {
    let unitObj = unit;
    let unitId = 0;

    const usApi = getUnitServiceApi();
    const classApi = unitClassModule || (typeof window !== 'undefined' ? window.unitClassification : null);

    if (typeof unit === 'number') {
      unitId = unit;
      const baseC = usApi ? usApi.getUnitBaseCost(unitId) : (classApi ? classApi.getUnitBaseCost(unitId) : { food: 0, wood: 0, gold: 0, stone: 0 });
      unitObj = { id: unitId, cost: baseC };
    } else if (unit && typeof unit === 'object') {
      unitId = Number(unit.id ?? unit.ID ?? 0);
    }

    // SSOT: Si unitService contiene esta unidad, usar su coste canónico como base oficial
    let rawCost;
    if (usApi && unitId > 0 && usApi.hasUnit(unitId)) {
      const canonicalData = usApi.getBaseUnitData(unitId);
      rawCost = canonicalData.Cost;
    } else {
      rawCost = (unitObj && (unitObj.cost || unitObj.Cost)) || (classApi ? classApi.getUnitBaseCost(unitId) : {});
    }

    const baseCost = {
      food: Number(rawCost.Food ?? rawCost.food ?? 0),
      wood: Number(rawCost.Wood ?? rawCost.wood ?? 0),
      gold: Number(rawCost.Gold ?? rawCost.gold ?? 0),
      stone: Number(rawCost.Stone ?? rawCost.stone ?? 0)
    };

    const discountsApi = unitDiscountsModule || (typeof window !== 'undefined' ? (window.civUnitDiscounts || window.civUnitDiscountsModule) : null);

    if (discountsApi && typeof discountsApi.calculateDiscountedCost === 'function') {
      try {
        const discounted = discountsApi.calculateDiscountedCost(
          rawCost,
          civId,
          unitId,
          age,
          { activeTechs: activeEcoTechs }
        );
        if (discounted && discounted.cost) {
          const isDiscounted = (discounted.cost.food !== baseCost.food) ||
                               (discounted.cost.wood !== baseCost.wood) ||
                               (discounted.cost.gold !== baseCost.gold) ||
                               (discounted.cost.stone !== baseCost.stone);
          return {
            cost: discounted.cost,
            baseCost: discounted.baseCost || baseCost,
            isDiscounted,
            discountsApplied: discounted.discountsApplied || [],
            food: discounted.cost.food,
            wood: discounted.cost.wood,
            gold: discounted.cost.gold,
            stone: discounted.cost.stone
          };
        }
      } catch (e) {
        // Fallback a lógica interna
      }
    }

    // Fallback de normalización de clases (unitClassification) si discountsApi falló o no está cargado
    const cId = String(civId || '').toLowerCase().trim();
    const ageLower = String(age || 'imperial').toLowerCase();
    let discountedCost = { ...baseCost };
    let hasDiscount = false;
    const applied = [];

    const isInf = GOTH_INFANTRY_IDS.has(unitId) || (classApi ? classApi.isInfantry(unitId) : (unitObj && (unitObj.category === 'barracks' || unitObj.unitClass === 'infantry')));
    if (cId === 'goths' && isInf) {
      const gothsRates = { dark: 0.20, feudal: 0.20, castle: 0.25, imperial: 0.35 };
      const rate = gothsRates[ageLower] || 0.35;
      discountedCost.food = Math.round(baseCost.food * (1 - rate));
      discountedCost.wood = Math.round(baseCost.wood * (1 - rate));
      discountedCost.gold = Math.round(baseCost.gold * (1 - rate));
      hasDiscount = true;
      applied.push({ name: 'Descuento en Infantería Goda', rateApplied: rate });
    }

    const isArch = FOOT_ARCHER_IDS.has(unitId) || (classApi ? classApi.isFootArcher(unitId) : (unitObj && (unitObj.category === 'range' || unitObj.unitClass === 'foot_archer')));
    if (cId === 'mayans' && isArch) {
      const mayanRates = { feudal: 0.10, castle: 0.20, imperial: 0.30 };
      const rate = mayanRates[ageLower] || 0;
      if (rate > 0) {
        discountedCost.wood = Math.round(baseCost.wood * (1 - rate));
        discountedCost.gold = Math.round(baseCost.gold * (1 - rate));
        hasDiscount = true;
        applied.push({ name: 'Descuento en Arqueros Mayas', rateApplied: rate });
      }
    }

    if (cId === 'hindustanis' && unitId === 83) {
      const hindRates = { dark: 0.08, feudal: 0.13, castle: 0.18, imperial: 0.23 };
      const rate = hindRates[ageLower] || 0.23;
      discountedCost.food = Math.round(baseCost.food * (1 - rate));
      hasDiscount = true;
      applied.push({ name: 'Descuento en Aldeanos Hindustanos', rateApplied: rate });
    }

    const isByzTrash = [93, 358, 359, 7, 6, 1155, 329, 330, 207].includes(unitId);
    if (cId === 'byzantines' && isByzTrash) {
      discountedCost.food = Math.round(baseCost.food * 0.75);
      discountedCost.wood = Math.round(baseCost.wood * 0.75);
      discountedCost.gold = Math.round(baseCost.gold * 0.75);
      hasDiscount = true;
      applied.push({ name: 'Descuento en Unidades de Contraataque', rateApplied: 0.25 });
    }

    if (cId === 'portuguese' && baseCost.gold > 0) {
      discountedCost.gold = Math.round(baseCost.gold * 0.80);
      hasDiscount = true;
      applied.push({ name: 'Descuento de Oro Portugués', rateApplied: 0.20 });
    }

    const isCav = classApi ? classApi.isCavalry(unitId) : (unitObj && (unitObj.category === 'stable' || unitObj.unitClass === 'cavalry'));
    if (cId === 'berbers' && isCav && (ageLower === 'castle' || ageLower === 'imperial')) {
      const rate = ageLower === 'imperial' ? 0.20 : 0.15;
      discountedCost.food = Math.round(baseCost.food * (1 - rate));
      discountedCost.gold = Math.round(baseCost.gold * (1 - rate));
      hasDiscount = true;
      applied.push({ name: 'Descuento de Establo Bereber', rateApplied: rate });
    }

    if (cId === 'incas' && (isInf || isArch || (classApi && classApi.isSiege(unitId)))) {
      const incaRates = { dark: 0.15, feudal: 0.20, castle: 0.25, imperial: 0.30 };
      const rate = incaRates[ageLower] || 0.30;
      if (baseCost.food > 0) {
        discountedCost.food = Math.round(baseCost.food * (1 - rate));
        hasDiscount = true;
        applied.push({ name: 'Descuento de Comida Militar Inca', rateApplied: rate });
      }
    }

    return {
      cost: discountedCost,
      baseCost,
      isDiscounted: hasDiscount,
      discountsApplied: applied,
      food: discountedCost.food,
      wood: discountedCost.wood,
      gold: discountedCost.gold,
      stone: discountedCost.stone
    };
  }

  // Alias canónico solicitado compatible con ambas firmas:
  // getDiscountedUnitCost(unitId, civId, age, activeEcoTechs)
  // o getDiscountedUnitCost(unitId, baseCost, civId, age)
  function getDiscountedUnitCost(unitId, arg2, arg3, arg4) {
    if (typeof arg2 === 'string') {
      return getEffectiveUnitCost(unitId, arg2, arg3, arg4);
    }
    return getEffectiveUnitCost({ id: unitId, cost: arg2 }, arg3, arg4);
  }

  /**
   * Resuelve la cadencia de trabajo y velocidad de entrenamiento de una unidad
   */
  function getUnitWorkRate(unit, civId, age = 'castle', activeEcoTechs = [], options = {}) {
    const modifiersApi = modifiersDataModule || (typeof window !== 'undefined' ? window.civModifiersData : null);
    if (modifiersApi && typeof modifiersApi.resolveCivWorkRate === 'function') {
      return modifiersApi.resolveCivWorkRate(unit, civId, age, activeEcoTechs, options);
    }
    // Fallback si modifiersDataModule no está enlazado
    let workRate = 1.0;
    let conscriptionBonus = 0.0;
    const techs = Array.isArray(activeEcoTechs) ? activeEcoTechs : Array.from(activeEcoTechs || []);
    const hasConscription = techs.includes('conscription') || (String(civId).toLowerCase() === 'vietnamese' && age === 'imperial');
    const uCat = String(unit?.category || '').toLowerCase();
    const bldLower = String(unit?.building || '').toLowerCase();
    const isConscriptionBuilding = ['barracks', 'range', 'archery_range', 'stable', 'castle', 'donjon'].includes(uCat) ||
                                   bldLower.includes('cuartel') || bldLower.includes('galer') || bldLower.includes('establo') || bldLower.includes('castillo') || bldLower.includes('donjon');
    const isConscriptionExcluded = ['siege', 'siege_workshop', 'town_center', 'dock', 'monastery'].includes(uCat) ||
                                   bldLower.includes('taller') || bldLower.includes('asedio') || bldLower.includes('centro') || bldLower.includes('muelle');
    if (hasConscription && isConscriptionBuilding && !isConscriptionExcluded) {
      conscriptionBonus = 0.3333;
      workRate += conscriptionBonus;
    }
    return {
      workRate: Math.round(workRate * 10000) / 10000,
      baseWorkRate: 1.0,
      civBonus: 0,
      conscriptionBonus: Math.round(conscriptionBonus * 10000) / 10000,
      breakdown: conscriptionBonus > 0 ? ['Leva (Conscription): +33.3%'] : []
    };
  }

  /**
   * Resuelve el tiempo de entrenamiento efectivo considerando Work Rate y Leva
   */
  function getEffectiveTrainTime(unit, civId, age = 'castle', activeEcoTechs = [], options = {}) {
    const usApi = getUnitServiceApi();
    const unitId = typeof unit === 'number' ? unit : Number(unit?.id ?? unit?.ID ?? 0);

    let baseTrainTime;
    if (usApi && unitId > 0 && usApi.hasUnit(unitId)) {
      baseTrainTime = usApi.getUnitBaseTrainTime(unitId);
    } else {
      const rawTime = Number(unit?.TrainTime ?? unit?.trainTime ?? 25);
      baseTrainTime = Math.max(1, rawTime);
    }

    const wrData = getUnitWorkRate(unit, civId, age, activeEcoTechs, options);
    const effectiveTrainTime = Math.round((baseTrainTime / wrData.workRate) * 10) / 10;
    const unitsPerMinute = Math.round((60 / effectiveTrainTime) * 100) / 100;

    return {
      baseTrainTime,
      effectiveTrainTime,
      workRate: wrData.workRate,
      civBonus: wrData.civBonus,
      conscriptionBonus: wrData.conscriptionBonus,
      unitsPerMinute,
      breakdown: wrData.breakdown
    };
  }

  /**
   * Calcula los requisitos de producción continua para una unidad dada.
   */
  function calculateContinuousProduction(params) {
    const {
      unit,
      buildingsCount = 1,
      civId = 'generic',
      age = 'castle',
      activeEcoTechs = [],
      foodSource = 'farming',
      farmEfficiencyMode = 'realistic'
    } = params;

    const bCount = Math.max(1, Number(buildingsCount) || 1);
    const trainTimeData = getEffectiveTrainTime(unit, civId, age, activeEcoTechs);
    const effectiveTrainTime = trainTimeData.effectiveTrainTime;
    const baseTrainTime = trainTimeData.baseTrainTime;

    // Coste dinámico con descuentos aplicados
    const costInfo = getEffectiveUnitCost(unit, civId, age, activeEcoTechs);
    const cost = costInfo.cost;
    const fCost = Number(cost.food || 0);
    const wCost = Number(cost.wood || 0);
    const gCost = Number(cost.gold || 0);
    const sCost = Number(cost.stone || 0);

    // Obtener tasas netas de recolección
    const gatherRates = getGatherRates(civId, activeEcoTechs, { foodSource, farmEfficiencyMode });

    // Demandas de recursos por minuto con cadencia efectiva:
    // Demanda = bCount * (Coste / effectiveTrainTime) * 60
    const demandFood = bCount * (fCost / effectiveTrainTime) * 60;
    const demandWood = bCount * (wCost / effectiveTrainTime) * 60;
    const demandGold = bCount * (gCost / effectiveTrainTime) * 60;
    const demandStone = bCount * (sCost / effectiveTrainTime) * 60;

    // Aldeanos netos directos requeridos por recurso: V_r = Demanda_r / GatherRate_r
    let vFood = demandFood > 0 ? demandFood / gatherRates.food : 0;
    const vWoodDirect = demandWood > 0 ? demandWood / gatherRates.wood : 0;
    const vGold = demandGold > 0 ? demandGold / gatherRates.gold : 0;
    const vStone = demandStone > 0 ? demandStone / gatherRates.stone : 0;

    // Modificador especial de Shu: Leñadores generan +15% de comida secundaria
    let shuSecondaryFoodPerMin = 0;
    const civNorm = String(civId).toLowerCase();
    if (civNorm === 'shu' && vWoodDirect > 0) {
      shuSecondaryFoodPerMin = vWoodDirect * gatherRates.wood * 0.15;
      const netFoodDemand = Math.max(0, demandFood - shuSecondaryFoodPerMin);
      vFood = netFoodDemand > 0 ? netFoodDemand / gatherRates.food : 0;
    }

    // Sobrecoste de resiembra de granjas
    let farmOverhead = null;
    let vReseed = 0;

    if (fCost > 0 && foodSource === 'farming') {
      const farmMetrics = getFarmMetrics(civId, activeEcoTechs);
      farmOverhead = calculateFarmOverhead(vFood, gatherRates.food, farmMetrics, gatherRates.wood);
      vReseed = farmOverhead.reseedLumberjacks;
    }

    const vWoodTotal = vWoodDirect + vReseed;
    const vTotal = vFood + vWoodTotal + vGold + vStone;

    // Métrica Villager Work Time (VT)
    const vtMetrics = calculateVillagerWorkTime(cost, gatherRates);

    return {
      unit,
      buildingsCount: bCount,
      baseTrainTime,
      trainTime: effectiveTrainTime,
      effectiveTrainTime,
      workRate: trainTimeData.workRate,
      civWorkRateBonus: trainTimeData.civBonus,
      conscriptionBonus: trainTimeData.conscriptionBonus,
      workRateBreakdown: trainTimeData.breakdown || [],
      effectiveCostInfo: costInfo,
      effectiveCost: cost,
      baseCost: costInfo.baseCost,
      isDiscounted: costInfo.isDiscounted,
      discountsApplied: costInfo.discountsApplied,
      unitsPerMinute: Math.round((bCount * (60 / effectiveTrainTime)) * 100) / 100,
      gatherRates,
      demandPerMin: {
        food: Math.round(demandFood * 10) / 10,
        wood: Math.round(demandWood * 10) / 10,
        gold: Math.round(demandGold * 10) / 10,
        stone: Math.round(demandStone * 10) / 10
      },
      shuSecondaryFoodPerMin: Math.round(shuSecondaryFoodPerMin * 10) / 10,
      villagers: {
        food: Math.round(vFood * 10) / 10,
        woodDirect: Math.round(vWoodDirect * 10) / 10,
        woodReseed: vReseed,
        woodTotal: Math.round(vWoodTotal * 10) / 10,
        gold: Math.round(vGold * 10) / 10,
        stone: Math.round(vStone * 10) / 10,
        total: Math.round(vTotal * 10) / 10,
        ceilTotal: Math.ceil(vFood) + Math.ceil(vWoodTotal) + Math.ceil(vGold) + Math.ceil(vStone)
      },
      farmOverhead,
      vtMetrics
    };
  }

  return {
    FARM_RATES_TABLE,
    BASE_RATES_PER_MIN,
    CIV_ECO_MODIFIERS,
    getFarmGatherRate,
    getFarmCapacity,
    getPastureCapacity,
    getFarmMetrics,
    getFarmTechLevel,
    getGatherRates,
    calculateFarmOverhead,
    calculateVillagerWorkTime,
    getEffectiveUnitCost,
    getDiscountedUnitCost,
    getUnitWorkRate,
    getEffectiveTrainTime,
    calculateContinuousProduction,
    GOTH_INFANTRY_IDS,
    FOOT_ARCHER_IDS
  };
});
