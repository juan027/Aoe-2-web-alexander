/**
 * data/units.js
 * Catálogo Canónico de Unidades Faltantes y Metadatos de Entrenamiento en Age of Empires II: DE.
 *
 * Registra formalmente edificios de entrenamiento canónicos, tiempos de creación,
 * costes y asignación correcta para unidades de Cuartel, Galería de Tiro con Arco, Establo y Asedio.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.MISSING_BARRACKS_UNITS = exports.MISSING_BARRACKS_UNITS;
    global.MISSING_ARCHERY_UNITS = exports.MISSING_ARCHERY_UNITS;
    global.MISSING_STABLE_UNITS = exports.MISSING_STABLE_UNITS;
    global.MISSING_SIEGE_UNITS = exports.MISSING_SIEGE_UNITS;
    global.SOUTH_ASIA_AND_3K_SIEGE = exports.SOUTH_ASIA_AND_3K_SIEGE;
    global.CANONICAL_UNIT_OVERRIDES = exports.CANONICAL_UNIT_OVERRIDES;
    global.UNITS_DATA = Object.assign(global.UNITS_DATA || {}, exports.UNITS_DATA);
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Unidades de Cuartel
  const MISSING_BARRACKS_UNITS = {
    753: {
      id: 753,
      internalName: "eagle_scout",
      name: "Explorador águila",
      building: "barracks",
      age: "feudal",
      icon: "753.png",
      cost: { food: 20, gold: 50 },
      trainTime: 35
    },
    473: {
      id: 473,
      internalName: "two_handed_swordsman",
      name: "Espadachín de dos manos",
      building: "barracks",
      age: "imperial",
      icon: "11.png",
      cost: { food: 50, gold: 20 },
      trainTime: 21
    },
    567: {
      id: 567,
      internalName: "champion",
      name: "Campeón",
      building: "barracks",
      age: "imperial",
      icon: "11.png",
      cost: { food: 50, gold: 20 },
      trainTime: 21
    },
    1910: {
      id: 1910,
      internalName: "champa_warrior",
      name: "Guerrero Champa",
      building: "barracks",
      age: "castle",
      icon: "1910.png",
      cost: { food: 65, gold: 30 },
      trainTime: 16
    },
    1911: {
      id: 1911,
      internalName: "elite_champa_warrior",
      name: "Guerrero Champa de élite",
      building: "barracks",
      age: "imperial",
      icon: "1910.png",
      cost: { food: 65, gold: 30 },
      trainTime: 14
    },
    2582: {
      id: 2582,
      internalName: "ibirapema_warrior",
      name: "Guerrero Ibiraçema",
      building: "barracks",
      age: "castle",
      icon: "2582.png",
      cost: { food: 30, gold: 60 },
      trainTime: 24
    },
    2584: {
      id: 2584,
      internalName: "elite_ibirapema_warrior",
      name: "Guerrero Ibiraçema de élite",
      building: "barracks",
      age: "imperial",
      icon: "2584.png",
      cost: { food: 30, gold: 60 },
      trainTime: 24
    },
    2703: {
      id: 2703,
      internalName: "varangian_guard",
      name: "Guardia Varego",
      building: "barracks",
      age: "castle",
      icon: "2703.png",
      cost: { food: 65, gold: 45 },
      trainTime: 30
    },
    2704: {
      id: 2704,
      internalName: "elite_varangian_guard",
      name: "Guardia Varego de élite",
      building: "barracks",
      age: "imperial",
      icon: "2704.png",
      cost: { food: 65, gold: 45 },
      trainTime: 30
    },
    1901: {
      id: 1901,
      internalName: "fire_lancer",
      name: "Lancero Incendiario",
      building: "barracks",
      age: "castle",
      icon: "1901.png",
      cost: { wood: 45, gold: 45 },
      trainTime: 17
    },
    1903: {
      id: 1903,
      internalName: "elite_fire_lancer",
      name: "Lancero Incendiario de élite",
      building: "barracks",
      age: "imperial",
      icon: "1903.png",
      cost: { wood: 45, gold: 45 },
      trainTime: 17
    },
    1699: {
      id: 1699,
      internalName: "flemish_militia",
      name: "Milicia Flamenca",
      building: "barracks",
      age: "imperial",
      icon: "1699.png",
      cost: { food: 35, gold: 25 },
      trainTime: 16
    },
    882: {
      id: 882,
      internalName: "condottiero",
      name: "Condotiero",
      building: "barracks",
      age: "imperial",
      icon: "882.png",
      cost: { food: 50, gold: 35 },
      trainTime: 18
    },
    // Línea Champi (4 edades)
    2550: {
      id: 2550,
      internalName: "champi_scout",
      name: "Explorador Champi",
      building: "barracks",
      age: "dark",
      icon: "2550.png",
      cost: { food: 50, gold: 25 },
      trainTime: 42
    },
    2588: {
      id: 2588,
      internalName: "champi_runner",
      name: "Corredor Champi",
      building: "barracks",
      age: "feudal",
      icon: "2588.png",
      cost: { food: 50, gold: 25 },
      trainTime: 34
    },
    2552: {
      id: 2552,
      internalName: "champi_warrior",
      name: "Guerrero Champi",
      building: "barracks",
      age: "castle",
      icon: "2552.png",
      cost: { food: 50, gold: 25 },
      trainTime: 26
    },
    2554: {
      id: 2554,
      internalName: "elite_champi_warrior",
      name: "Guerrero Champi de élite",
      building: "barracks",
      age: "imperial",
      icon: "2554.png",
      cost: { food: 50, gold: 25 },
      trainTime: 21
    }
  };

  // Unidades de Galería de Tiro con Arco
  const MISSING_ARCHERY_UNITS = {
    39: {
      id: 39,
      internalName: "cavalry_archer",
      name: "Arquero a caballo",
      building: "archery_range",
      age: "castle",
      icon: "39.png",
      cost: { wood: 40, gold: 60 },
      trainTime: 34
    },
    474: {
      id: 474,
      internalName: "heavy_cavalry_archer",
      name: "Arquero a caballo pesado",
      building: "archery_range",
      age: "imperial",
      icon: "474.png",
      cost: { wood: 40, gold: 60 },
      trainTime: 27
    },
    5: {
      id: 5,
      internalName: "hand_cannoneer",
      name: "Artillero manual",
      building: "archery_range",
      age: "imperial",
      icon: "5.png",
      cost: { food: 45, gold: 50 },
      trainTime: 34
    },
    1010: {
      id: 1010,
      internalName: "genitour",
      name: "Genitour",
      building: "archery_range",
      age: "castle",
      icon: "1010.png",
      cost: { food: 40, wood: 35 },
      trainTime: 25
    },
    1012: {
      id: 1012,
      internalName: "elite_genitour",
      name: "Genitour de élite",
      building: "archery_range",
      age: "imperial",
      icon: "1012.png",
      cost: { food: 40, wood: 35 },
      trainTime: 23
    },
    2700: {
      id: 2700,
      internalName: "mounted_crossbowman",
      name: "Ballestero montado",
      building: "archery_range",
      age: "castle",
      icon: "2700.png",
      cost: { wood: 40, gold: 65 },
      trainTime: 40
    },
    2701: {
      id: 2701,
      internalName: "heavy_mounted_crossbowman",
      name: "Ballestero montado pesado",
      building: "archery_range",
      age: "imperial",
      icon: "2701.png",
      cost: { wood: 40, gold: 65 },
      trainTime: 30
    },
    1155: {
      id: 1155,
      internalName: "imperial_skirmisher",
      name: "Guerrillero imperial",
      building: "archery_range",
      age: "imperial",
      icon: "1155.png",
      cost: { food: 25, wood: 35 },
      trainTime: 22
    },
    2569: {
      id: 2569,
      internalName: "bolas_rider",
      name: "Jinete con boleadoras",
      building: "archery_range",
      age: "castle",
      icon: "2569.png",
      cost: { food: 55, gold: 60 },
      trainTime: 21
    },
    2571: {
      id: 2571,
      internalName: "elite_bolas_rider",
      name: "Jinete con boleadoras de élite",
      building: "archery_range",
      age: "imperial",
      icon: "2571.png",
      cost: { food: 55, gold: 60 },
      trainTime: 19
    },
    1902: {
      id: 1902,
      internalName: "elite_bolas_rider",
      name: "Jinete con boleadoras de élite",
      building: "archery_range",
      age: "imperial",
      icon: "1901.png",
      cost: { food: 55, gold: 60 },
      trainTime: 19
    },
    1920: {
      id: 1920,
      internalName: "grenadier",
      name: "Granadero",
      building: "archery_range",
      age: "imperial",
      icon: "1920.png",
      cost: { wood: 60, gold: 50 },
      trainTime: 24
    },
    185: {
      id: 185,
      internalName: "slinger",
      name: "Soldado con honda (Hondero)",
      building: "archery_range",
      age: "castle",
      icon: "18.png",
      cost: {
        food: 50,
        wood: 25,
        gold: 0,
        stone: 0
      },
      trainTime: 25
    }
  };

  // Unidades de Establo
  const MISSING_STABLE_UNITS = {
    1372: {
      id: 1372,
      internalName: "elite_steppe_lancer",
      name: "Lancero estepario de élite",
      building: "stable",
      age: "imperial",
      icon: "1372.png",
      cost: { food: 70, gold: 40 },
      trainTime: 20
    },
    1134: {
      id: 1134,
      internalName: "elite_battle_elephant",
      name: "Elefante de batalla de élite",
      building: "stable",
      age: "imperial",
      icon: "1134.png",
      cost: { food: 100, gold: 70 },
      trainTime: 24
    },
    1944: {
      id: 1944,
      internalName: "hei_guang_cavalry",
      name: "Jinete de Hei Guang",
      building: "stable",
      age: "castle",
      icon: "1944.png",
      cost: { food: 65, gold: 65 },
      trainTime: 28
    },
    1946: {
      id: 1946,
      internalName: "heavy_hei_guang_cavalry",
      name: "Jinete de Hei Guang pesado",
      building: "stable",
      age: "imperial",
      icon: "1946.png",
      cost: { food: 65, gold: 65 },
      trainTime: 28
    },
    1751: {
      id: 1751,
      internalName: "shrivamsha_rider",
      name: "Jinete de Shrivamsha",
      building: "stable",
      age: "castle",
      icon: "1751.png",
      cost: { food: 70, gold: 30 },
      trainTime: 20
    },
    1753: {
      id: 1753,
      internalName: "elite_shrivamsha_rider",
      name: "Jinete de Shrivamsha de élite",
      building: "stable",
      age: "imperial",
      icon: "1753.png",
      cost: { food: 70, gold: 30 },
      trainTime: 20
    }
  };

  // --- LÍNEA ELEFANTE DE ASEDIO (Dynasties of India) Y ASEDIO TRES REINOS ---
  const SOUTH_ASIA_AND_3K_SIEGE = {
    // --- LÍNEA ELEFANTE DE ASEDIO (Dynasties of India) ---
    1744: {
      id: 1744,
      internalName: "armored_elephant",
      name: "Elefante acorazado",
      building: "siege_workshop",
      age: "castle",
      icon: "1744.png", // o ID numérico del sprite en img/Unit/
      cost: { food: 130, gold: 95 },
      trainTime: 36
    },
    1746: {
      id: 1746,
      internalName: "siege_elephant",
      name: "Elefante de asedio",
      building: "siege_workshop",
      age: "imperial",
      icon: "1746.png",
      cost: { food: 130, gold: 95 },
      trainTime: 36
    },

    // --- TREBUCHET A TRACCIÓN (Tres Reinos / Mod) ---
    1800: {
      id: 1800,
      internalName: "traction_trebuchet",
      name: "Trebuchet a tracción",
      building: "siege_workshop", // En el Taller de Asedio
      age: "castle",
      icon: "428.png", // Sprite oficial 428.png de catapulta a tracción
      cost: { wood: 170, gold: 100 },
      trainTime: 35
    }
  };

  // Unidades de Asedio
  const MISSING_SIEGE_UNITS = {
    422: {
      id: 422,
      internalName: "capped_ram",
      name: "Ariete cubierto",
      building: "siege_workshop",
      age: "imperial",
      icon: "73.png",
      cost: { wood: 160, gold: 75 },
      trainTime: 36
    },
    548: {
      id: 548,
      internalName: "siege_ram",
      name: "Ariete de asedio",
      building: "siege_workshop",
      age: "imperial",
      icon: "73.png",
      cost: { wood: 160, gold: 75 },
      trainTime: 36
    },
    550: {
      id: 550,
      internalName: "siege_onager",
      name: "Onagro de asedio",
      building: "siege_workshop",
      age: "imperial",
      icon: "550.png",
      cost: { wood: 160, gold: 135 },
      trainTime: 46
    },
    1904: {
      id: 1904,
      internalName: "rocket_cart",
      name: "Carro cohete",
      building: "siege_workshop",
      age: "castle",
      icon: "1904.png",
      cost: { wood: 135, gold: 155 },
      trainTime: 40
    },
    1907: {
      id: 1907,
      internalName: "heavy_rocket_cart",
      name: "Carro cohete pesado",
      building: "siege_workshop",
      age: "imperial",
      icon: "1907.png",
      cost: { wood: 135, gold: 155 },
      trainTime: 40
    },
    ...SOUTH_ASIA_AND_3K_SIEGE
  };

  // Unidades de Castillo / Asedio especial
  const CASTLE_UNITS = {
    331: {
      id: 331,
      internalName: "PTREB",
      name: "Lanzapiedras",
      building: "castle",
      age: "imperial",
      icon: "29.png",
      cost: { wood: 200, gold: 200 },
      trainTime: 50
    },
    42: {
      id: 42,
      internalName: "TREBU",
      name: "Lanzapiedras",
      building: "castle",
      age: "imperial",
      icon: "29.png",
      cost: { wood: 200, gold: 200 },
      trainTime: 50
    }
  };

  const CANONICAL_UNIT_OVERRIDES = Object.freeze({
    ...MISSING_BARRACKS_UNITS,
    ...MISSING_ARCHERY_UNITS,
    ...MISSING_STABLE_UNITS,
    ...MISSING_SIEGE_UNITS,
    ...SOUTH_ASIA_AND_3K_SIEGE
  });

  const UNITS_DATA = Object.freeze({
    ...MISSING_BARRACKS_UNITS,
    ...MISSING_ARCHERY_UNITS,
    ...MISSING_STABLE_UNITS,
    ...MISSING_SIEGE_UNITS,
    ...SOUTH_ASIA_AND_3K_SIEGE,
    ...CANONICAL_UNIT_OVERRIDES,
    ...CASTLE_UNITS
  });

  return {
    MISSING_BARRACKS_UNITS,
    MISSING_ARCHERY_UNITS,
    MISSING_STABLE_UNITS,
    MISSING_SIEGE_UNITS,
    SOUTH_ASIA_AND_3K_SIEGE,
    CANONICAL_UNIT_OVERRIDES,
    UNITS_DATA
  };
});