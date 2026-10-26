/**
 * unitClassification.js
 * Normalización de Clases de Unidades e Identificadores Canónicos para Age of Empires II: DE
 * Single Source of Truth para clasificación militar y cálculo de costes y descuentos.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.unitClassification = exports;
    global.INFANTRY_UNIT_IDS = exports.INFANTRY_UNIT_IDS;
    global.FOOT_ARCHER_IDS = exports.FOOT_ARCHER_IDS;
    global.CAVALRY_IDS = exports.CAVALRY_IDS;
    global.SIEGE_UNIT_IDS = exports.SIEGE_UNIT_IDS;
    global.GUNPOWDER_UNIT_IDS = exports.GUNPOWDER_UNIT_IDS;
    Object.assign(global, exports);
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // 1. Infantería: Milicia a Campeón, Lanceros, Huscarles, Águilas, etc.
  const INFANTRY_UNIT_IDS = new Set([
    74, 75, 77, 473, 567, 569, // Miliciano a Campeón
    93, 358, 359,              // Lancero, Piquero, Alabardero
    41, 555, 759, 761,         // Huscarle, Huscarle de élite (Castillo y Cuartel)
    751, 752, 753, 755, 757,   // Guerreros Águila
    1793,                      // Legionario
    882,                       // Condottiero
    207, 774, 831, 879, 1747, 1801, // Unidades únicas de infantería
    1920, 1921,                // Jian Swordsman (Tres Reinos)
    2700, 2701,                // Guardia Varego (Mod)
    2705, 2706                 // Tropa del Hogar (Sajones)
  ]);

  // 2. Soldados a distancia a pie: Arqueros, Guerrilleros, Honderos, UU a pie
  const FOOT_ARCHER_IDS = new Set([
    4, 24, 492,                // Arquero, Ballestero, Arbalestero
    7, 6, 218, 530, 1155,      // Guerrilleros
    185,                       // Soldado con honda (Slinger)
    84, 763, 765, 1749         // Arquero arco largo, Arquero emplumado, Rattan, etc.
  ]);

  // 3. Caballería: Exploración a Húsar, Jinetes, Caballeros, Paladines, Camellos, Elefantes, Lanceros Esteparios
  const CAVALRY_IDS = new Set([
    448, 546, 441, 1707,       // Caballería de exploración a Húsar / Húsar alado
    38, 283, 569, 1813,        // Jinete, Caballero, Paladín
    329, 330, 207, 1263,       // Camellos
    1132, 1134,                // Elefantes de batalla
    1370, 1372, 1751, 1753,    // Lanceros esteparios
    39, 474                    // Jinetes arqueros
  ]);

  // 4. Maquinaria de Asedio
  const SIEGE_UNIT_IDS = new Set([
    1258, 548, 422,            // Arietes
    280, 550, 420,             // Manganeles / Onagros
    279, 542,                  // Escorpiones
    36, 1105,                  // Cañones de asedio / Houfnice
    42                         // Trebuchet
  ]);

  // 5. Unidades de Pólvora
  const GUNPOWDER_UNIT_IDS = new Set([
    5, 36, 420, 691, 46, 557, 771, 773, 1001, 1003, 1105, 1704, 1706, 1795, 1911
  ]);

  // Costes canónicos base de unidades del motor Genie
  const CANONICAL_UNIT_COSTS = Object.freeze({
    // Cuartel (Infantería)
    74: { food: 50, gold: 20 },
    75: { food: 50, gold: 20 },
    77: { food: 50, gold: 20 },
    473: { food: 50, gold: 20 },
    567: { food: 50, gold: 20 },
    93: { food: 35, wood: 25 },
    358: { food: 35, wood: 25 },
    359: { food: 35, wood: 25 },
    751: { food: 20, gold: 50 },
    752: { food: 20, gold: 50 },

    // Galería (Arqueros y Distancia)
    4: { wood: 25, gold: 45 },
    24: { wood: 25, gold: 45 },
    492: { wood: 25, gold: 45 },
    7: { food: 25, wood: 35 },
    6: { food: 25, wood: 35 },
    1155: { food: 25, wood: 35 },
    39: { wood: 40, gold: 60 },
    474: { wood: 40, gold: 60 },
    5: { food: 45, gold: 50 },
    185: { food: 50, wood: 25 },

    // Establo (Caballería)
    448: { food: 80, wood: 0, gold: 0, stone: 0 },
    546: { food: 80, wood: 0, gold: 0, stone: 0 },
    441: { food: 80, wood: 0, gold: 0, stone: 0 },
    1707: { food: 80, wood: 0, gold: 0, stone: 0 },
    38: { food: 60, gold: 75 },
    283: { food: 60, gold: 75 },
    569: { food: 60, gold: 75 },
    329: { food: 55, gold: 60 },
    330: { food: 55, gold: 60 },
    1263: { food: 75, gold: 30 },
    1132: { food: 100, gold: 70 },
    1134: { food: 100, gold: 70 },
    1370: { food: 70, gold: 40 },
    1372: { food: 70, gold: 40 },

    // Taller de Asedio
    1258: { wood: 160, gold: 75 },
    548: { wood: 160, gold: 75 },
    422: { wood: 160, gold: 75 },
    280: { wood: 160, gold: 135 },
    550: { wood: 160, gold: 135 },
    420: { wood: 200, gold: 150 },
    279: { wood: 75, gold: 75 },
    542: { wood: 75, gold: 75 },
    36: { wood: 225, gold: 225 },
    1105: { wood: 100, gold: 120 },

    // Centro Urbano & Castillo
    83: { food: 50, wood: 0, gold: 0, stone: 0 },
    440: { food: 65, gold: 20 },
    42: { wood: 200, gold: 200 }
  });

  // Tiempos canónicos de creación (en segundos)
  const CANONICAL_TRAIN_TIMES = Object.freeze({
    74: 21, 75: 21, 77: 21, 473: 21, 567: 21,
    93: 22, 358: 22, 359: 22,
    751: 46, 752: 20,
    4: 35, 24: 27, 492: 27,
    7: 26, 6: 22, 1155: 22,
    39: 37, 474: 30, 5: 34, 185: 25,
    448: 30, 546: 30, 441: 30, 1707: 30,
    38: 30, 283: 30, 569: 30,
    329: 22, 330: 22, 1263: 30,
    1132: 24, 1134: 24,
    1370: 24, 1372: 20,
    1258: 36, 280: 46, 550: 46, 279: 30, 542: 30, 36: 56,
    83: 25, 440: 25, 42: 50
  });

  function extractUnitId(unitOrId) {
    if (typeof unitOrId === 'number') return unitOrId;
    if (unitOrId && typeof unitOrId === 'object') {
      return Number(unitOrId.id ?? unitOrId.ID ?? 0);
    }
    return 0;
  }

  function isInfantry(unitOrId) {
    const id = extractUnitId(unitOrId);
    if (INFANTRY_UNIT_IDS.has(id)) return true;
    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const cat = String(unitOrId.category || unitOrId.unitClass || '').toLowerCase();
      if (cat === 'infantry' || cat === 'barracks') return true;
    }
    return false;
  }

  function isFootArcher(unitOrId) {
    const id = extractUnitId(unitOrId);
    if (FOOT_ARCHER_IDS.has(id)) return true;
    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const cat = String(unitOrId.category || unitOrId.unitClass || '').toLowerCase();
      if ((cat === 'range' || cat === 'archery_range') && !isCavalry(unitOrId) && !isGunpowder(unitOrId)) return true;
    }
    return false;
  }

  function isCavalry(unitOrId) {
    const id = extractUnitId(unitOrId);
    if (CAVALRY_IDS.has(id)) return true;
    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const cat = String(unitOrId.category || unitOrId.unitClass || '').toLowerCase();
      if (cat === 'stable' || cat === 'cavalry') return true;
    }
    return false;
  }

  function isSiege(unitOrId) {
    const id = extractUnitId(unitOrId);
    if (SIEGE_UNIT_IDS.has(id)) return true;
    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const cat = String(unitOrId.category || unitOrId.unitClass || '').toLowerCase();
      if (cat === 'siege' || cat === 'siege_workshop') return true;
    }
    return false;
  }

  function isGunpowder(unitOrId) {
    const id = extractUnitId(unitOrId);
    return GUNPOWDER_UNIT_IDS.has(id);
  }

  function getUnitClass(unitOrId) {
    if (isInfantry(unitOrId)) return 'infantry';
    if (isFootArcher(unitOrId)) return 'foot_archer';
    if (isCavalry(unitOrId)) return 'cavalry';
    if (isSiege(unitOrId)) return 'siege';
    if (isGunpowder(unitOrId)) return 'gunpowder';
    return 'general';
  }

  function getUnitService() {
    if (typeof unitService !== 'undefined' && unitService && typeof unitService.getBaseUnitData === 'function') {
      return unitService;
    }
    if (typeof window !== 'undefined' && window.unitService && typeof window.unitService.getBaseUnitData === 'function') {
      return window.unitService;
    }
    if (typeof require === 'function') {
      try {
        return require('./unitService.js');
      } catch (e) {}
    }
    return null;
  }

  function getUnitBaseCost(unitOrId) {
    const us = getUnitService();
    const id = extractUnitId(unitOrId);
    if (us && id > 0) {
      const data = us.getBaseUnitData(id);
      if (data && data.cost) {
        return {
          food: data.cost.food,
          wood: data.cost.wood,
          gold: data.cost.gold,
          stone: data.cost.stone
        };
      }
    }

    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const c = unitOrId.cost || unitOrId.Cost;
      if (c && (c.Food !== undefined || c.food !== undefined || c.Wood !== undefined || c.wood !== undefined || c.Gold !== undefined || c.gold !== undefined)) {
        return {
          food: Number(c.Food ?? c.food ?? 0),
          wood: Number(c.Wood ?? c.wood ?? 0),
          gold: Number(c.Gold ?? c.gold ?? 0),
          stone: Number(c.Stone ?? c.stone ?? 0)
        };
      }
    }

    const canned = CANONICAL_UNIT_COSTS[id];
    if (canned) {
      return {
        food: Number(canned.food ?? canned.Food ?? 0),
        wood: Number(canned.wood ?? canned.Wood ?? 0),
        gold: Number(canned.gold ?? canned.Gold ?? 0),
        stone: Number(canned.stone ?? canned.Stone ?? 0)
      };
    }
    return { food: 0, wood: 0, gold: 0, stone: 0 };
  }

  function getUnitBaseTrainTime(unitOrId) {
    const us = getUnitService();
    const id = extractUnitId(unitOrId);
    if (us && id > 0) {
      const data = us.getBaseUnitData(id);
      if (data && typeof data.trainTime === 'number' && data.trainTime > 0) {
        return data.trainTime;
      }
    }

    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const t = unitOrId.trainTime ?? unitOrId.TrainTime;
      if (typeof t === 'number' && t > 0) return t;
    }

    return CANONICAL_TRAIN_TIMES[id] || 25;
  }

  return {
    INFANTRY_UNIT_IDS,
    FOOT_ARCHER_IDS,
    CAVALRY_IDS,
    SIEGE_UNIT_IDS,
    GUNPOWDER_UNIT_IDS,
    CANONICAL_UNIT_COSTS,
    CANONICAL_TRAIN_TIMES,
    extractUnitId,
    isInfantry,
    isFootArcher,
    isCavalry,
    isSiege,
    isGunpowder,
    getUnitClass,
    getUnitBaseCost,
    getUnitBaseTrainTime
  };
});