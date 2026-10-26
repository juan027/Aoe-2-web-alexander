/**
 * units.js
 * Registro Canónico de Unidades, Clasificación Táctica y Mapeo de Mejoras de Herrería para Age of Empires II: DE.
 *
 * Clasifica a los camellos (Camello, Jinete de camello pesado, Camello imperial) como unidades montadas
 * que se benefician de la línea de Armaduras de Caballería (Barding Armor line: Escamas, Malla, Placas)
 * y bloquea la Armadura de Infantería.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.unitsModule = exports;
    global.UNITS_DATA = exports.UNITS_DATA;
    global.MISSING_BARRACKS_UNITS = exports.MISSING_BARRACKS_UNITS;
    global.MISSING_ARCHERY_UNITS = exports.MISSING_ARCHERY_UNITS;
    global.MISSING_STABLE_UNITS = exports.MISSING_STABLE_UNITS;
    global.MISSING_SIEGE_UNITS = exports.MISSING_SIEGE_UNITS;
    global.SOUTH_ASIA_AND_3K_SIEGE = exports.SOUTH_ASIA_AND_3K_SIEGE;
    global.CANONICAL_UNIT_OVERRIDES = exports.CANONICAL_UNIT_OVERRIDES;
    global.TREBUCHET_UNIT_IDS = exports.TREBUCHET_UNIT_IDS;
    global.isTrebuchetUnit = exports.isTrebuchetUnit;
    global.resolveUnitIcon = exports.resolveUnitIcon;
    global.CAMEL_UNIT_IDS = exports.CAMEL_UNIT_IDS;
    global.CAMEL_UNITS_REGISTRY = exports.CAMEL_UNITS_REGISTRY;
    global.isCamelUnit = exports.isCamelUnit;
    global.isMeleeCamelUnit = exports.isMeleeCamelUnit;
    global.isCamelArcherUnit = exports.isCamelArcherUnit;
    global.getUnitArmorUpgradeType = exports.getUnitArmorUpgradeType;
    global.getUnitAttackUpgradeType = exports.getUnitAttackUpgradeType;
    global.getUnitClasses = exports.getUnitClasses;
    global.patchUnit = exports.patchUnit;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // =========================================================================
  // CONSTANTES DE CLASES GENIE ENGINE
  // =========================================================================
  const CLASSES = Object.freeze({
    INFANTRY: 1,
    INFANTRY_CANONICAL: 11,
    MELEE: 4,
    PIERCE: 3,
    CAVALRY: 8,
    ARCHER: 15,
    WAR_ELEPHANT: 19,
    SIEGE: 20,
    SHIP: 22,
    CAVALRY_ARCHER: 28,
    CAMEL: 30
  });

  // =========================================================================
  // REGISTRO Y MAPEO DE UNIDADES DE TIPO CAMELLO
  // =========================================================================
  // CATÁLOGO CANÓNICO DE UNIDADES Y CLASIFICACIÓN TÁCTICA
  // =========================================================================
  const CAMEL_UNIT_IDS = Object.freeze([
    207, 282, 329, 330, 556, 1007, 1009, 1263, 1755, 1923
  ]);

  const CAMEL_ID_SET = new Set(CAMEL_UNIT_IDS);

  // Línea de Escorpiones (Scorpion #279, Heavy Scorpion #542)
  const SCORPION_UNIT_IDS = Object.freeze([279, 542]);
  const SCORPION_ID_SET = new Set(SCORPION_UNIT_IDS);

  // Línea de Carros de Cohetes (Rocket Cart #1904, Heavy Rocket Cart #1907)
  const ROCKET_CART_IDS = Object.freeze([1904, 1907]);
  const ROCKET_CART_ID_SET = new Set(ROCKET_CART_IDS);

  // Línea Chu Ko Nu (Chu Ko Nu #73, Elite Chu Ko Nu #559)
  const CHU_KO_NU_IDS = Object.freeze([73, 559]);
  const CHU_KO_NU_ID_SET = new Set(CHU_KO_NU_IDS);

  // Línea de Lanzapiedras (Trebuchet empaquetado #331, desplegado #42)
  const TREBUCHET_UNIT_IDS = Object.freeze([42, 331]);
  const TREBUCHET_ID_SET = new Set(TREBUCHET_UNIT_IDS);

  // =========================================================================
  // CATÁLOGO CANÓNICO DE UNIDADES Y METADATOS TÁCTICOS / ICONOGRAFÍA (UNITS_DATA)
  // =========================================================================

  // Unidades de Cuartel
  const MISSING_BARRACKS_UNITS = Object.freeze({
    753: Object.freeze({
      id: 753,
      ID: 753,
      internalName: "eagle_scout",
      internal_name: "eagle_scout",
      name: "Explorador águila",
      localizedName: "Explorador águila",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "feudal",
      icon: "753.png",
      cost: Object.freeze({ food: 20, wood: 0, gold: 50, stone: 0 }),
      Cost: Object.freeze({ Food: 20, Wood: 0, Gold: 50, Stone: 0 }),
      trainTime: 35,
      TrainTime: 35
    }),
    473: Object.freeze({
      id: 473,
      ID: 473,
      internalName: "two_handed_swordsman",
      internal_name: "two_handed_swordsman",
      name: "Espadachín de dos manos",
      localizedName: "Espadachín de dos manos",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "11.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 20, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 20, Stone: 0 }),
      trainTime: 21,
      TrainTime: 21
    }),
    567: Object.freeze({
      id: 567,
      ID: 567,
      internalName: "champion",
      internal_name: "champion",
      name: "Campeón",
      localizedName: "Campeón",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "11.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 20, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 20, Stone: 0 }),
      trainTime: 21,
      TrainTime: 21
    }),
    1910: Object.freeze({
      id: 1910,
      ID: 1910,
      internalName: "champa_warrior",
      internal_name: "champa_warrior",
      name: "Guerrero Champa",
      localizedName: "Guerrero Champa",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "castle",
      icon: "1910.png",
      cost: Object.freeze({ food: 65, wood: 0, gold: 30, stone: 0 }),
      Cost: Object.freeze({ Food: 65, Wood: 0, Gold: 30, Stone: 0 }),
      trainTime: 16,
      TrainTime: 16
    }),
    1911: Object.freeze({
      id: 1911,
      ID: 1911,
      internalName: "elite_champa_warrior",
      internal_name: "elite_champa_warrior",
      name: "Guerrero Champa de élite",
      localizedName: "Guerrero Champa de élite",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "1910.png",
      cost: Object.freeze({ food: 65, wood: 0, gold: 30, stone: 0 }),
      Cost: Object.freeze({ Food: 65, Wood: 0, Gold: 30, Stone: 0 }),
      trainTime: 14,
      TrainTime: 14
    }),
    2582: Object.freeze({
      id: 2582,
      ID: 2582,
      internalName: "ibirapema_warrior",
      internal_name: "ibirapema_warrior",
      name: "Guerrero Ibiraçema",
      localizedName: "Guerrero Ibiraçema",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "castle",
      icon: "2582.png",
      cost: Object.freeze({ food: 30, wood: 0, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 30, Wood: 0, Gold: 60, Stone: 0 }),
      trainTime: 24,
      TrainTime: 24
    }),
    2584: Object.freeze({
      id: 2584,
      ID: 2584,
      internalName: "elite_ibirapema_warrior",
      internal_name: "elite_ibirapema_warrior",
      name: "Guerrero Ibiraçema de élite",
      localizedName: "Guerrero Ibiraçema de élite",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "2584.png",
      cost: Object.freeze({ food: 30, wood: 0, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 30, Wood: 0, Gold: 60, Stone: 0 }),
      trainTime: 24,
      TrainTime: 24
    }),
    2703: Object.freeze({
      id: 2703,
      ID: 2703,
      internalName: "varangian_guard",
      internal_name: "varangian_guard",
      name: "Guardia Varego",
      localizedName: "Guardia Varego",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "castle",
      icon: "2703.png",
      cost: Object.freeze({ food: 65, wood: 0, gold: 45, stone: 0 }),
      Cost: Object.freeze({ Food: 65, Wood: 0, Gold: 45, Stone: 0 }),
      trainTime: 30,
      TrainTime: 30
    }),
    2704: Object.freeze({
      id: 2704,
      ID: 2704,
      internalName: "elite_varangian_guard",
      internal_name: "elite_varangian_guard",
      name: "Guardia Varego de élite",
      localizedName: "Guardia Varego de élite",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "2704.png",
      cost: Object.freeze({ food: 65, wood: 0, gold: 45, stone: 0 }),
      Cost: Object.freeze({ Food: 65, Wood: 0, Gold: 45, Stone: 0 }),
      trainTime: 30,
      TrainTime: 30
    }),
    1901: Object.freeze({
      id: 1901,
      ID: 1901,
      internalName: "fire_lancer",
      internal_name: "fire_lancer",
      name: "Lancero Incendiario",
      localizedName: "Lancero Incendiario",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "castle",
      icon: "1901.png",
      cost: Object.freeze({ food: 0, wood: 45, gold: 45, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 45, Gold: 45, Stone: 0 }),
      trainTime: 17,
      TrainTime: 17
    }),
    1903: Object.freeze({
      id: 1903,
      ID: 1903,
      internalName: "elite_fire_lancer",
      internal_name: "elite_fire_lancer",
      name: "Lancero Incendiario de élite",
      localizedName: "Lancero Incendiario de élite",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "1903.png",
      cost: Object.freeze({ food: 0, wood: 45, gold: 45, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 45, Gold: 45, Stone: 0 }),
      trainTime: 17,
      TrainTime: 17
    }),
    1699: Object.freeze({
      id: 1699,
      ID: 1699,
      internalName: "flemish_militia",
      internal_name: "flemish_militia",
      name: "Milicia Flamenca",
      localizedName: "Milicia Flamenca",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "1699.png",
      cost: Object.freeze({ food: 35, wood: 0, gold: 25, stone: 0 }),
      Cost: Object.freeze({ Food: 35, Wood: 0, Gold: 25, Stone: 0 }),
      trainTime: 16,
      TrainTime: 16
    }),
    882: Object.freeze({
      id: 882,
      ID: 882,
      internalName: "condottiero",
      internal_name: "CONDO",
      name: "Condotiero",
      localizedName: "Condotiero",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "882.png",
      pictureIndex: 882,
      iconPath: "img/units/882.png",
      fallbackIcon: "img/Unit/882.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 35, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 35, Stone: 0 }),
      trainTime: 18,
      TrainTime: 18
    }),
    // Línea Champi (4 edades)
    2550: Object.freeze({
      id: 2550,
      ID: 2550,
      internalName: "champi_scout",
      internal_name: "champi_scout",
      name: "Explorador Champi",
      localizedName: "Explorador Champi",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "dark",
      icon: "2550.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 25, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 25, Stone: 0 }),
      trainTime: 42,
      TrainTime: 42
    }),
    2588: Object.freeze({
      id: 2588,
      ID: 2588,
      internalName: "champi_runner",
      internal_name: "champi_runner",
      name: "Corredor Champi",
      localizedName: "Corredor Champi",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "feudal",
      icon: "2588.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 25, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 25, Stone: 0 }),
      trainTime: 34,
      TrainTime: 34
    }),
    2552: Object.freeze({
      id: 2552,
      ID: 2552,
      internalName: "champi_warrior",
      internal_name: "champi_warrior",
      name: "Guerrero Champi",
      localizedName: "Guerrero Champi",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "castle",
      icon: "2552.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 25, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 25, Stone: 0 }),
      trainTime: 26,
      TrainTime: 26
    }),
    2554: Object.freeze({
      id: 2554,
      ID: 2554,
      internalName: "elite_champi_warrior",
      internal_name: "elite_champi_warrior",
      name: "Guerrero Champi de élite",
      localizedName: "Guerrero Champi de élite",
      category: "barracks",
      unitClass: "infantry",
      building: "barracks",
      age: "imperial",
      icon: "2554.png",
      cost: Object.freeze({ food: 50, wood: 0, gold: 25, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 0, Gold: 25, Stone: 0 }),
      trainTime: 21,
      TrainTime: 21
    })
  });

  // Unidades de Galería de Tiro con Arco
  const MISSING_ARCHERY_UNITS = Object.freeze({
    39: Object.freeze({
      id: 39,
      ID: 39,
      internalName: "cavalry_archer",
      internal_name: "cavalry_archer",
      name: "Arquero a caballo",
      localizedName: "Arquero a caballo",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "castle",
      icon: "39.png",
      cost: Object.freeze({ food: 0, wood: 40, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 40, Gold: 60, Stone: 0 }),
      trainTime: 34,
      TrainTime: 34
    }),
    474: Object.freeze({
      id: 474,
      ID: 474,
      internalName: "heavy_cavalry_archer",
      internal_name: "heavy_cavalry_archer",
      name: "Arquero a caballo pesado",
      localizedName: "Arquero a caballo pesado",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "imperial",
      icon: "474.png",
      cost: Object.freeze({ food: 0, wood: 40, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 40, Gold: 60, Stone: 0 }),
      trainTime: 27,
      TrainTime: 27
    }),
    5: Object.freeze({
      id: 5,
      ID: 5,
      internalName: "hand_cannoneer",
      internal_name: "hand_cannoneer",
      name: "Artillero manual",
      localizedName: "Artillero manual",
      category: "range",
      unitClass: "gunpowder",
      building: "archery_range",
      age: "imperial",
      icon: "5.png",
      cost: Object.freeze({ food: 45, wood: 0, gold: 50, stone: 0 }),
      Cost: Object.freeze({ Food: 45, Wood: 0, Gold: 50, Stone: 0 }),
      trainTime: 34,
      TrainTime: 34
    }),
    1010: Object.freeze({
      id: 1010,
      ID: 1010,
      internalName: "genitour",
      internal_name: "genitour",
      name: "Genitour",
      localizedName: "Genitour",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "castle",
      icon: "1010.png",
      cost: Object.freeze({ food: 40, wood: 35, gold: 0, stone: 0 }),
      Cost: Object.freeze({ Food: 40, Wood: 35, Gold: 0, Stone: 0 }),
      trainTime: 25,
      TrainTime: 25
    }),
    1012: Object.freeze({
      id: 1012,
      ID: 1012,
      internalName: "elite_genitour",
      internal_name: "elite_genitour",
      name: "Genitour de élite",
      localizedName: "Genitour de élite",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "imperial",
      icon: "1012.png",
      cost: Object.freeze({ food: 40, wood: 35, gold: 0, stone: 0 }),
      Cost: Object.freeze({ Food: 40, Wood: 35, Gold: 0, Stone: 0 }),
      trainTime: 23,
      TrainTime: 23
    }),
    2700: Object.freeze({
      id: 2700,
      ID: 2700,
      internalName: "mounted_crossbowman",
      internal_name: "mounted_crossbowman",
      name: "Ballestero montado",
      localizedName: "Ballestero montado",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "castle",
      icon: "2700.png",
      cost: Object.freeze({ food: 0, wood: 40, gold: 65, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 40, Gold: 65, Stone: 0 }),
      trainTime: 40,
      TrainTime: 40
    }),
    2701: Object.freeze({
      id: 2701,
      ID: 2701,
      internalName: "heavy_mounted_crossbowman",
      internal_name: "heavy_mounted_crossbowman",
      name: "Ballestero montado pesado",
      localizedName: "Ballestero montado pesado",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "imperial",
      icon: "2701.png",
      cost: Object.freeze({ food: 0, wood: 40, gold: 65, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 40, Gold: 65, Stone: 0 }),
      trainTime: 30,
      TrainTime: 30
    }),
    1155: Object.freeze({
      id: 1155,
      ID: 1155,
      internalName: "imperial_skirmisher",
      internal_name: "imperial_skirmisher",
      name: "Guerrillero imperial",
      localizedName: "Guerrillero imperial",
      category: "range",
      unitClass: "foot_archer",
      building: "archery_range",
      age: "imperial",
      icon: "1155.png",
      cost: Object.freeze({ food: 25, wood: 35, gold: 0, stone: 0 }),
      Cost: Object.freeze({ Food: 25, Wood: 35, Gold: 0, Stone: 0 }),
      trainTime: 22,
      TrainTime: 22
    }),
    2569: Object.freeze({
      id: 2569,
      ID: 2569,
      internalName: "bolas_rider",
      internal_name: "bolas_rider",
      name: "Jinete con boleadoras",
      localizedName: "Jinete con boleadoras",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "castle",
      icon: "2569.png",
      cost: Object.freeze({ food: 55, wood: 0, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 55, Wood: 0, Gold: 60, Stone: 0 }),
      trainTime: 21,
      TrainTime: 21
    }),
    2571: Object.freeze({
      id: 2571,
      ID: 2571,
      internalName: "elite_bolas_rider",
      internal_name: "elite_bolas_rider",
      name: "Jinete con boleadoras de élite",
      localizedName: "Jinete con boleadoras de élite",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "imperial",
      icon: "2571.png",
      cost: Object.freeze({ food: 55, wood: 0, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 55, Wood: 0, Gold: 60, Stone: 0 }),
      trainTime: 19,
      TrainTime: 19
    }),
    1902: Object.freeze({
      id: 1902,
      ID: 1902,
      internalName: "elite_bolas_rider",
      internal_name: "elite_bolas_rider",
      name: "Jinete con boleadoras de élite",
      localizedName: "Jinete con boleadoras de élite",
      category: "range",
      unitClass: "cavalry_archer",
      building: "archery_range",
      age: "imperial",
      icon: "1901.png",
      cost: Object.freeze({ food: 55, wood: 0, gold: 60, stone: 0 }),
      Cost: Object.freeze({ Food: 55, Wood: 0, Gold: 60, Stone: 0 }),
      trainTime: 19,
      TrainTime: 19
    }),
    1920: Object.freeze({
      id: 1920,
      ID: 1920,
      internalName: "grenadier",
      internal_name: "grenadier",
      name: "Granadero",
      localizedName: "Granadero",
      category: "range",
      unitClass: "gunpowder",
      building: "archery_range",
      age: "imperial",
      icon: "1920.png",
      cost: Object.freeze({ food: 0, wood: 60, gold: 50, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 60, Gold: 50, Stone: 0 }),
      trainTime: 24,
      TrainTime: 24
    }),
    185: Object.freeze({
      id: 185,
      ID: 185,
      internalName: "slinger",
      internal_name: "slinger",
      name: "Soldado con honda (Hondero)",
      localizedName: "Soldado con honda (Hondero)",
      category: "range",
      unitClass: "foot_archer",
      building: "archery_range",
      age: "castle",
      icon: "18.png",
      pictureIndex: 18,
      iconPath: "img/Unit/18.png",
      unitIcon: "img/units/185.png",
      fallbackIcon: "img/Unit/18.png",
      cost: Object.freeze({ food: 50, wood: 25, gold: 0, stone: 0 }),
      Cost: Object.freeze({ Food: 50, Wood: 25, Gold: 0, Stone: 0 }),
      trainTime: 25,
      TrainTime: 25
    })
  });

  // Unidades de Establo
  const MISSING_STABLE_UNITS = Object.freeze({
    1372: Object.freeze({
      id: 1372,
      ID: 1372,
      internalName: "elite_steppe_lancer",
      internal_name: "elite_steppe_lancer",
      name: "Lancero estepario de élite",
      localizedName: "Lancero estepario de élite",
      category: "stable",
      unitClass: "cavalry",
      building: "stable",
      age: "imperial",
      icon: "1372.png",
      cost: Object.freeze({ food: 70, wood: 0, gold: 40, stone: 0 }),
      Cost: Object.freeze({ Food: 70, Wood: 0, Gold: 40, Stone: 0 }),
      trainTime: 20,
      TrainTime: 20
    }),
    1134: Object.freeze({
      id: 1134,
      ID: 1134,
      internalName: "elite_battle_elephant",
      internal_name: "elite_battle_elephant",
      name: "Elefante de batalla de élite",
      localizedName: "Elefante de batalla de élite",
      category: "stable",
      unitClass: "cavalry",
      building: "stable",
      age: "imperial",
      icon: "1134.png",
      cost: Object.freeze({ food: 100, wood: 0, gold: 70, stone: 0 }),
      Cost: Object.freeze({ Food: 100, Wood: 0, Gold: 70, Stone: 0 }),
      trainTime: 24,
      TrainTime: 24
    }),
    1944: Object.freeze({
      id: 1944,
      ID: 1944,
      internalName: "hei_guang_cavalry",
      internal_name: "hei_guang_cavalry",
      name: "Jinete de Hei Guang",
      localizedName: "Jinete de Hei Guang",
      category: "stable",
      unitClass: "cavalry",
      building: "stable",
      age: "castle",
      icon: "1944.png",
      cost: Object.freeze({ food: 65, wood: 0, gold: 65, stone: 0 }),
      Cost: Object.freeze({ Food: 65, Wood: 0, Gold: 65, Stone: 0 }),
      trainTime: 28,
      TrainTime: 28
    }),
    1946: Object.freeze({
      id: 1946,
      ID: 1946,
      internalName: "heavy_hei_guang_cavalry",
      internal_name: "heavy_hei_guang_cavalry",
      name: "Jinete de Hei Guang pesado",
      localizedName: "Jinete de Hei Guang pesado",
      category: "stable",
      unitClass: "cavalry",
      building: "stable",
      age: "imperial",
      icon: "1946.png",
      cost: Object.freeze({ food: 65, wood: 0, gold: 65, stone: 0 }),
      Cost: Object.freeze({ Food: 65, Wood: 0, Gold: 65, Stone: 0 }),
      trainTime: 28,
      TrainTime: 28
    }),
    1751: Object.freeze({
      id: 1751,
      ID: 1751,
      internalName: "shrivamsha_rider",
      internal_name: "shrivamsha_rider",
      name: "Jinete de Shrivamsha",
      localizedName: "Jinete de Shrivamsha",
      category: "stable",
      unitClass: "cavalry",
      building: "stable",
      age: "castle",
      icon: "1751.png",
      cost: Object.freeze({ food: 70, wood: 0, gold: 30, stone: 0 }),
      Cost: Object.freeze({ Food: 70, Wood: 0, Gold: 30, Stone: 0 }),
      trainTime: 20,
      TrainTime: 20
    }),
    1753: Object.freeze({
      id: 1753,
      ID: 1753,
      internalName: "elite_shrivamsha_rider",
      internal_name: "elite_shrivamsha_rider",
      name: "Jinete de Shrivamsha de élite",
      localizedName: "Jinete de Shrivamsha de élite",
      category: "stable",
      unitClass: "cavalry",
      building: "stable",
      age: "imperial",
      icon: "1753.png",
      cost: Object.freeze({ food: 70, wood: 0, gold: 30, stone: 0 }),
      Cost: Object.freeze({ Food: 70, Wood: 0, Gold: 30, Stone: 0 }),
      trainTime: 20,
      TrainTime: 20
    })
  });

  // --- LÍNEA ELEFANTE DE ASEDIO (Dynasties of India) Y ASEDIO TRES REINOS ---
  const SOUTH_ASIA_AND_3K_SIEGE = Object.freeze({
    // --- LÍNEA ELEFANTE DE ASEDIO (Dynasties of India) ---
    1744: Object.freeze({
      id: 1744,
      ID: 1744,
      internalName: "armored_elephant",
      internal_name: "armored_elephant",
      name: "Elefante acorazado",
      localizedName: "Elefante acorazado",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "castle",
      icon: "1744.png",
      pictureIndex: 1744,
      iconPath: "img/Unit/1744.png",
      unitIcon: "img/units/1744.png",
      fallbackIcon: "img/Unit/1744.png",
      cost: Object.freeze({ food: 130, wood: 0, gold: 95, stone: 0 }),
      Cost: Object.freeze({ Food: 130, Wood: 0, Gold: 95, Stone: 0 }),
      trainTime: 36,
      TrainTime: 36
    }),
    1746: Object.freeze({
      id: 1746,
      ID: 1746,
      internalName: "siege_elephant",
      internal_name: "siege_elephant",
      name: "Elefante de asedio",
      localizedName: "Elefante de asedio",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "imperial",
      icon: "1746.png",
      pictureIndex: 1746,
      iconPath: "img/Unit/1746.png",
      unitIcon: "img/units/1746.png",
      fallbackIcon: "img/Unit/1746.png",
      cost: Object.freeze({ food: 130, wood: 0, gold: 95, stone: 0 }),
      Cost: Object.freeze({ Food: 130, Wood: 0, Gold: 95, Stone: 0 }),
      trainTime: 36,
      TrainTime: 36
    }),

    // --- TREBUCHET A TRACCIÓN (Tres Reinos / Mod) ---
    1800: Object.freeze({
      id: 1800,
      ID: 1800,
      internalName: "traction_trebuchet",
      internal_name: "traction_trebuchet",
      name: "Trebuchet a tracción",
      localizedName: "Trebuchet a tracción",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "castle",
      icon: "428.png",
      pictureIndex: 428,
      iconPath: "img/Unit/428.png",
      unitIcon: "img/units/428.png",
      fallbackIcon: "img/Unit/428.png",
      cost: Object.freeze({ food: 0, wood: 170, gold: 100, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 170, Gold: 100, Stone: 0 }),
      trainTime: 35,
      TrainTime: 35
    })
  });

  // Unidades de Asedio
  const MISSING_SIEGE_UNITS = Object.freeze({
    422: Object.freeze({
      id: 422,
      ID: 422,
      internalName: "capped_ram",
      internal_name: "capped_ram",
      name: "Ariete cubierto",
      localizedName: "Ariete cubierto",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "imperial",
      icon: "73.png",
      cost: Object.freeze({ food: 0, wood: 160, gold: 75, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 160, Gold: 75, Stone: 0 }),
      trainTime: 36,
      TrainTime: 36
    }),
    548: Object.freeze({
      id: 548,
      ID: 548,
      internalName: "siege_ram",
      internal_name: "siege_ram",
      name: "Ariete de asedio",
      localizedName: "Ariete de asedio",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "imperial",
      icon: "73.png",
      cost: Object.freeze({ food: 0, wood: 160, gold: 75, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 160, Gold: 75, Stone: 0 }),
      trainTime: 36,
      TrainTime: 36
    }),
    550: Object.freeze({
      id: 550,
      ID: 550,
      internalName: "siege_onager",
      internal_name: "siege_onager",
      name: "Onagro de asedio",
      localizedName: "Onagro de asedio",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "imperial",
      icon: "550.png",
      pictureIndex: 101,
      iconPath: "img/Unit/550.png",
      unitIcon: "img/units/550.png",
      fallbackIcon: "img/Unit/101.png",
      cost: Object.freeze({ food: 0, wood: 160, gold: 135, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 160, Gold: 135, Stone: 0 }),
      trainTime: 46,
      TrainTime: 46
    }),
    1904: Object.freeze({
      id: 1904,
      ID: 1904,
      internalName: "rocket_cart",
      internal_name: "rocket_cart",
      name: "Carro cohete",
      localizedName: "Carro cohete",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "castle",
      icon: "1904.png",
      cost: Object.freeze({ food: 0, wood: 135, gold: 155, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 135, Gold: 155, Stone: 0 }),
      trainTime: 40,
      TrainTime: 40
    }),
    1907: Object.freeze({
      id: 1907,
      ID: 1907,
      internalName: "heavy_rocket_cart",
      internal_name: "heavy_rocket_cart",
      name: "Carro cohete pesado",
      localizedName: "Carro cohete pesado",
      category: "siege",
      unitClass: "siege",
      building: "siege_workshop",
      age: "imperial",
      icon: "1907.png",
      cost: Object.freeze({ food: 0, wood: 135, gold: 155, stone: 0 }),
      Cost: Object.freeze({ Food: 0, Wood: 135, Gold: 155, Stone: 0 }),
      trainTime: 40,
      TrainTime: 40
    }),
    ...SOUTH_ASIA_AND_3K_SIEGE
  });

  // Sobrescrituras y definiciones canónicas de unidades
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
    ...CANONICAL_UNIT_OVERRIDES,
    ...MISSING_SIEGE_UNITS,
    // Lanzapiedras empaquetado (PTREB - unidad entrenada en el Castillo)
    331: Object.freeze({
      id: 331,
      ID: 331,
      internal_name: 'PTREB',
      name: 'Lanzapiedras',
      localizedName: 'Lanzapiedras',
      building: 'castle',
      icon: '29.png',
      pictureIndex: 29,
      iconPath: 'img/Unit/29.png',
      unitIcon: 'img/units/331.png',
      fallbackIcon: 'img/Unit/29.png'
    }),
    // Lanzapiedras desplegado (TREBU - versión desempaquetada para asedio)
    42: Object.freeze({
      id: 42,
      ID: 42,
      internal_name: 'TREBU',
      name: 'Lanzapiedras',
      localizedName: 'Lanzapiedras',
      building: 'castle',
      icon: '29.png',
      pictureIndex: 29,
      iconPath: 'img/Unit/29.png',
      unitIcon: 'img/units/331.png',
      fallbackIcon: 'img/Unit/29.png'
    })
  });

  const CAMEL_UNITS_REGISTRY = Object.freeze({
    // Jinete de camello (Camel Rider)
    329: Object.freeze({
      id: 329,
      internal_name: 'CVLRY',
      name: 'Jinete de camello',
      classes: Object.freeze(['military', 'camel', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Jinete de camello pesado (Heavy Camel Rider)
    330: Object.freeze({
      id: 330,
      internal_name: 'HCLRY',
      name: 'Jinete de camello pesado',
      classes: Object.freeze(['military', 'camel', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Jinete de camello imperial (Imperial Camel Rider)
    207: Object.freeze({
      id: 207,
      internal_name: 'SHCLRY',
      name: 'Jinete de camello imperial',
      classes: Object.freeze(['military', 'camel', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Explorador a camello (Camel Scout)
    1755: Object.freeze({
      id: 1755,
      internal_name: 'CAMELSC',
      name: 'Explorador a camello',
      classes: Object.freeze(['military', 'camel', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Mameluco (Mameluke)
    282: Object.freeze({
      id: 282,
      internal_name: 'DERVI',
      name: 'Mameluco',
      classes: Object.freeze(['military', 'camel', 'unique_unit', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Mameluco de élite (Elite Mameluke)
    556: Object.freeze({
      id: 556,
      internal_name: 'UDERV',
      name: 'Mameluco de élite',
      classes: Object.freeze(['military', 'camel', 'unique_unit', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Camello llameante (Flaming Camel)
    1263: Object.freeze({
      id: 1263,
      internal_name: 'FCAMEL',
      name: 'Camello llameante',
      classes: Object.freeze(['military', 'camel', 'siege', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Camello de asedio (Siege Camel)
    1923: Object.freeze({
      id: 1923,
      internal_name: 'SIEGECAMEL',
      name: 'Camello de asedio',
      classes: Object.freeze(['military', 'camel', 'siege', 'cavalry_armor']),
      armorUpgradeType: 'cavalry',
      attackUpgradeType: 'melee',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: true,
      allowsInfantryArmor: false
    }),
    // Arquero en camello (Camel Archer) - Unidad a distancia: usa armadura de arqueros
    1007: Object.freeze({
      id: 1007,
      internal_name: 'CAMAR',
      name: 'Arquero en camello',
      classes: Object.freeze(['military', 'camel', 'archer', 'cavalry_archer', 'unique_unit', 'archer_armor']),
      armorUpgradeType: 'archer',
      attackUpgradeType: 'archer',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: false,
      allowsInfantryArmor: false
    }),
    // Arquero en camello de élite (Elite Camel Archer)
    1009: Object.freeze({
      id: 1009,
      internal_name: 'ECAMAR',
      name: 'Arquero en camello de élite',
      classes: Object.freeze(['military', 'camel', 'archer', 'cavalry_archer', 'unique_unit', 'archer_armor']),
      armorUpgradeType: 'archer',
      attackUpgradeType: 'archer',
      isMounted: true,
      isCamel: true,
      allowsCavalryArmor: false,
      allowsInfantryArmor: false
    })
  });

  // =========================================================================
  // FUNCIONES DE CLASIFICACIÓN TÁCTICA
  // =========================================================================

  /**
   * Determina si la entidad es una unidad de tipo camello.
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isCamelUnit(unitOrId) {
    if (unitOrId === null || unitOrId === undefined) return false;

    if (typeof unitOrId === 'number' || typeof unitOrId === 'string') {
      const id = Number(unitOrId);
      if (CAMEL_ID_SET.has(id)) return true;
    }

    if (typeof unitOrId === 'object') {
      const id = Number(unitOrId.id ?? unitOrId.ID ?? 0);
      if (CAMEL_ID_SET.has(id)) return true;

      const armours = unitOrId.Armours || unitOrId.armours || [];
      if (Array.isArray(armours)) {
        for (const a of armours) {
          const cls = typeof a === 'object' ? a.Class : Number(a);
          if (cls === CLASSES.CAMEL) return true;
        }
      }

      if (Array.isArray(unitOrId.classes)) {
        if (unitOrId.classes.includes('camel') || unitOrId.classes.includes('camello')) {
          return true;
        }
      }

      const name = String(unitOrId.internal_name || unitOrId.name || unitOrId.localizedName || '').toLowerCase();
      if (name.includes('camel') || name.includes('camello') || name.includes('dervi') || name.includes('mameluk')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determina si es un Arquero en camello (Camel Archer).
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isCamelArcherUnit(unitOrId) {
    if (!isCamelUnit(unitOrId)) return false;

    const id = typeof unitOrId === 'object' ? Number(unitOrId.id ?? unitOrId.ID ?? 0) : Number(unitOrId);
    if (id === 1007 || id === 1009) return true;

    if (typeof unitOrId === 'object') {
      const armours = unitOrId.Armours || unitOrId.armours || [];
      if (Array.isArray(armours)) {
        const hasArcher = armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === CLASSES.ARCHER);
        if (hasArcher) return true;
      }
      if (Array.isArray(unitOrId.classes) && unitOrId.classes.includes('archer')) {
        return true;
      }
      const name = String(unitOrId.internal_name || unitOrId.name || '').toLowerCase();
      if (name.includes('camar') || name.includes('archer')) return true;
    }

    return false;
  }

  /**
   * Determina si es un camello cuerpo a cuerpo (Camello, Jinete de camello pesado, Camello imperial, Mameluco).
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isMeleeCamelUnit(unitOrId) {
    return isCamelUnit(unitOrId) && !isCamelArcherUnit(unitOrId);
  }

  /**
   * Determina si es una unidad de la línea de Escorpiones (Escorpión #279, Escorpión pesado #542).
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isScorpionUnit(unitOrId) {
    if (!unitOrId) return false;
    const id = typeof unitOrId === 'object' ? Number(unitOrId.id ?? unitOrId.ID ?? 0) : Number(unitOrId);
    if (SCORPION_ID_SET.has(id)) return true;
    if (typeof unitOrId === 'object') {
      const internalName = String(unitOrId.internal_name || '').toUpperCase();
      if (internalName === 'SCBAL' || internalName === 'HWBAL') return true;
      const name = String(unitOrId.name || unitOrId.localizedName || '').toLowerCase();
      if (name.includes('scorpion') || name.includes('escorpión') || name.includes('escorpion')) return true;
    }
    return false;
  }

  /**
   * Determina si es una unidad de la línea de Carros de cohetes (Rocket Cart #1904, Heavy Rocket Cart #1907).
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isRocketCartUnit(unitOrId) {
    if (!unitOrId) return false;
    const id = typeof unitOrId === 'object' ? Number(unitOrId.id ?? unitOrId.ID ?? 0) : Number(unitOrId);
    if (ROCKET_CART_ID_SET.has(id)) return true;
    if (typeof unitOrId === 'object') {
      const internalName = String(unitOrId.internal_name || '').toUpperCase();
      if (internalName === 'RCKTCRT' || internalName === 'HRCKTCRT') return true;
      const name = String(unitOrId.name || unitOrId.localizedName || '').toLowerCase();
      if (name.includes('rocket_cart') || name.includes('carro de cohetes') || name.includes('carro_cohete')) return true;
    }
    return false;
  }

  /**
   * Determina si es una unidad de la línea Chu Ko Nu (Chu Ko Nu #73, Chu Ko Nu de élite #559).
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isChuKoNuUnit(unitOrId) {
    if (!unitOrId) return false;
    const id = typeof unitOrId === 'object' ? Number(unitOrId.id ?? unitOrId.ID ?? 0) : Number(unitOrId);
    if (CHU_KO_NU_ID_SET.has(id)) return true;
    if (typeof unitOrId === 'object') {
      const internalName = String(unitOrId.internal_name || '').toUpperCase();
      if (internalName === 'CHUKN' || internalName === 'ECHUKN') return true;
      const name = String(unitOrId.name || unitOrId.localizedName || '').toLowerCase();
      if (name.includes('chu ko nu') || name.includes('chuko')) return true;
    }
    return false;
  }

  /**
   * Determina si la entidad es un Lanzapiedras (Trebuchet empaquetado #331 o desplegado #42).
   * @param {Object|number} unitOrId
   * @returns {boolean}
   */
  function isTrebuchetUnit(unitOrId) {
    if (unitOrId === null || unitOrId === undefined) return false;
    const id = typeof unitOrId === 'object' ? Number(unitOrId.id ?? unitOrId.ID ?? 0) : Number(unitOrId);
    if (TREBUCHET_ID_SET.has(id)) return true;
    if (typeof unitOrId === 'object') {
      const internalName = String(unitOrId.internal_name || '').toUpperCase();
      if (internalName === 'PTREB' || internalName === 'TREBU') return true;
      const name = String(unitOrId.name || unitOrId.localizedName || '').toLowerCase();
      if (name.includes('trebuchet') || name.includes('lanzapiedras')) return true;
    }
    return false;
  }

  /**
   * Resuelve el sprite y ruta de icono oficial de una unidad.
   * Trebuchet (#331 y #42): Asocia inequívocamente al sprite 29.png en img/Unit/ y 331.png en img/units/.
   * Previene de forma absoluta la resolución hacia 42.png (Mangudai).
   *
   * @param {Object|number} unitOrId
   * @returns {{ icon: string, pictureIndex: number|null, src: string, fallback: string }}
   */
  function resolveUnitIcon(unitOrId) {
    const id = typeof unitOrId === 'object' && unitOrId !== null
      ? Number(unitOrId.id ?? unitOrId.ID ?? 0)
      : Number(unitOrId || 0);

    if (id === 42 || id === 331 || isTrebuchetUnit(unitOrId)) {
      return {
        icon: '29.png',
        pictureIndex: 29,
        src: 'img/units/331.png',
        fallback: 'img/Unit/29.png'
      };
    }

    return {
      icon: `${id}.png`,
      pictureIndex: null,
      src: `img/units/${id}.png`,
      fallback: `img/Unit/${id}.png`
    };
  }

  /**
   * Obtiene el tipo canónico de mejora de armadura de la herrería que le corresponde a la unidad:
   * - Camellos cuerpo a cuerpo: 'cavalry' (Armadura de caballería / Barding Armor)
   * - Arqueros y arquero a camello: 'archer'
   * - Infantería: 'infantry'
   * - Barcos y máquinas de asedio (incluyendo escorpiones): 'none'
   *
   * @param {Object|number} unitOrId
   * @returns {'cavalry'|'infantry'|'archer'|'none'}
   */
  function getUnitArmorUpgradeType(unitOrId) {
    if (isScorpionUnit(unitOrId) || isRocketCartUnit(unitOrId)) return 'none';
    if (isMeleeCamelUnit(unitOrId)) return 'cavalry';
    if (isCamelArcherUnit(unitOrId)) return 'archer';

    const id = typeof unitOrId === 'object' && unitOrId !== null
      ? Number(unitOrId.id ?? unitOrId.ID ?? 0)
      : Number(unitOrId || 0);

    if (CAMEL_UNITS_REGISTRY[id]) {
      return CAMEL_UNITS_REGISTRY[id].armorUpgradeType;
    }

    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const armours = unitOrId.Armours || unitOrId.armours || [];
      const hasCls = (cls) => armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === cls);

      if (hasCls(CLASSES.SHIP) || hasCls(CLASSES.SIEGE)) return 'none';
      if (hasCls(CLASSES.ARCHER)) return 'archer';
      if (hasCls(CLASSES.CAVALRY) || hasCls(CLASSES.WAR_ELEPHANT) || hasCls(CLASSES.CAMEL)) return 'cavalry';
      if (hasCls(CLASSES.INFANTRY) || hasCls(CLASSES.INFANTRY_CANONICAL)) return 'infantry';
    }

    return 'none';
  }

  /**
   * Obtiene el tipo canónico de mejora de ataque de la herrería:
   * - Unidades cuerpo a cuerpo (incluyendo camellos): 'melee' (Forja, Fundición, Alto Horno)
   * - Unidades a distancia: 'archer' (Flechas, Punzón, Braserío)
   * - Máquinas de asedio y escorpiones: 'none' (no reciben herrería en motor Genie)
   *
   * @param {Object|number} unitOrId
   * @returns {'melee'|'archer'|'none'}
   */
  function getUnitAttackUpgradeType(unitOrId) {
    if (isScorpionUnit(unitOrId) || isRocketCartUnit(unitOrId)) return 'none';
    if (isMeleeCamelUnit(unitOrId)) return 'melee';
    if (isCamelArcherUnit(unitOrId)) return 'archer';

    if (typeof unitOrId === 'object' && unitOrId !== null) {
      const armours = unitOrId.Armours || unitOrId.armours || [];
      const hasCls = (cls) => armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === cls);
      if (hasCls(CLASSES.SHIP) || hasCls(CLASSES.SIEGE)) return 'none';

      const attacks = unitOrId.Attacks || unitOrId.attacks || [];
      const hasMelee = attacks.some(a => (typeof a === 'object' ? a.Class : Number(a)) === CLASSES.MELEE && (a.Amount ?? a.amount ?? 0) > 0);
      const hasPierce = attacks.some(a => (typeof a === 'object' ? a.Class : Number(a)) === CLASSES.PIERCE && (a.Amount ?? a.amount ?? 0) > 0);

      if (hasCls(CLASSES.ARCHER) || (hasPierce && (unitOrId.Range ?? unitOrId.range ?? 0) > 0)) return 'archer';
      if (hasMelee) return 'melee';
    }

    return 'none';
  }

  /**
   * Devuelve la lista canónica de clases para una unidad, garantizando que los camellos
   * cuerpo a cuerpo porten 'cavalry_armor' y NUNCA porten identificadores de armadura de infantería.
   *
   * @param {Object} unit
   * @returns {string[]}
   */
  function getUnitClasses(unit) {
    if (!unit) return ['military'];

    const id = Number(unit.id ?? unit.ID ?? 0);
    if (CAMEL_UNITS_REGISTRY[id]) {
      return [...CAMEL_UNITS_REGISTRY[id].classes];
    }

    if (isCamelUnit(unit)) {
      if (isCamelArcherUnit(unit)) {
        return ['military', 'camel', 'archer', 'cavalry_archer', 'unique_unit', 'archer_armor'];
      }
      return ['military', 'camel', 'cavalry_armor'];
    }

    if (Array.isArray(unit.classes)) {
      return [...unit.classes];
    }

    const armours = unit.Armours || unit.armours || [];
    const hasCls = (cls) => armours.some(a => (typeof a === 'object' ? a.Class : Number(a)) === cls);
    const classes = ['military'];

    if (hasCls(CLASSES.INFANTRY)) classes.push('infantry');
    if (hasCls(CLASSES.ARCHER)) classes.push('archer');
    if (hasCls(CLASSES.CAVALRY)) classes.push('cavalry');
    if (hasCls(CLASSES.CAMEL)) classes.push('camel', 'cavalry_armor');
    if (hasCls(CLASSES.SIEGE)) classes.push('siege');
    if (hasCls(CLASSES.SHIP)) classes.push('ship');

    return classes;
  }

  /**
   * Enriquece de forma segura el objeto de unidad con metadata canónica.
   * @param {Object} unit
   * @returns {Object}
   */
  function patchUnit(unit) {
    if (!unit || typeof unit !== 'object') return unit;

    if (isCamelUnit(unit)) {
      unit.isCamel = true;
      unit.isMounted = true;
      unit.armorUpgradeType = isCamelArcherUnit(unit) ? 'archer' : 'cavalry';
      unit.attackUpgradeType = isCamelArcherUnit(unit) ? 'archer' : 'melee';

      const canonicalClasses = getUnitClasses(unit);
      unit.classes = canonicalClasses;

      // Asegurar que no contenga 'infantry' ni 'infantry_armor'
      if (Array.isArray(unit.classes)) {
        unit.classes = unit.classes.filter(c => c !== 'infantry' && c !== 'infantry_armor' && c !== 'infantry_armor_group');
      }
    }

    if (isTrebuchetUnit(unit)) {
      unit.icon = '29.png';
      unit.pictureIndex = 29;
      unit.iconPath = 'img/Unit/29.png';
      unit.unitIcon = 'img/units/331.png';
      unit.fallbackIcon = 'img/Unit/29.png';
    }

    return unit;
  }

  return {
    CLASSES,
    UNITS_DATA,
    MISSING_BARRACKS_UNITS,
    MISSING_ARCHERY_UNITS,
    MISSING_STABLE_UNITS,
    MISSING_SIEGE_UNITS,
    SOUTH_ASIA_AND_3K_SIEGE,
    CANONICAL_UNIT_OVERRIDES,
    TREBUCHET_UNIT_IDS,
    isTrebuchetUnit,
    resolveUnitIcon,
    CAMEL_UNIT_IDS,
    CAMEL_UNITS_REGISTRY,
    SCORPION_UNIT_IDS,
    ROCKET_CART_IDS,
    CHU_KO_NU_IDS,
    isCamelUnit,
    isMeleeCamelUnit,
    isCamelArcherUnit,
    isScorpionUnit,
    isRocketCartUnit,
    isChuKoNuUnit,
    getUnitArmorUpgradeType,
    getUnitAttackUpgradeType,
    getUnitClasses,
    patchUnit
  };
});
