/**
 * COMBAT.JS - Motor de Simulación de Duelo 1 vs 1 y Cálculo de Daño para Age of Empires II
 * Arquitectura modular para navegador y entorno Node.js
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.AoE2Combat = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // =========================================================================
  // CONSTANTES DEL MOTOR AOE2 & IDENTIFICADORES DE LÍNEA
  // =========================================================================

  // Duración del buff temporal del Guardia del Templo (Muiscas) en segundos
  const TEMPLE_GUARD_BUFF_DURATION = 5.0;
  const TEMPLE_GUARD_STACK_REDUCTION = 0.2;
  const TEMPLE_GUARD_MIN_RELOAD = 1.2;
  const TEMPLE_GUARD_IDS = new Set([2562, 2564, 2586, 2587]);

  // Carga perezosa de data/civ_bonuses.json para entorno Node.js cuando no se inyecta por opciones
  let DEFAULT_CIV_BONUSES = null;
  function getDefaultCivBonuses() {
    if (DEFAULT_CIV_BONUSES !== null) return DEFAULT_CIV_BONUSES;
    if (typeof require === 'function') {
      try {
        DEFAULT_CIV_BONUSES = require('./data/civ_bonuses.json');
        return DEFAULT_CIV_BONUSES;
      } catch (e) {
        DEFAULT_CIV_BONUSES = {};
      }
    } else {
      DEFAULT_CIV_BONUSES = {};
    }
    return DEFAULT_CIV_BONUSES;
  }

  // Mapeo canónico de clases del motor Genie
  const CLASSES = {
    PIERCE: 3,
    MELEE: 4,
    CAVALRY: 8,
    INFANTRY: 11,
    SIEGE: 13,
    ARCHER: 15,
    SHIP: 16,
    GUNPOWDER: 19,
    SIEGE_ALT: 20,
    CAMEL: 30,
    WAR_ELEPHANT: 5
  };

  // Línea de infantería de espada compatible con Aura de Centurión
  const SWORD_INFANTRY_IDS = new Set([74, 75, 77, 473, 567, 1793]); // Milicia, H. Armas, E. Larga, Dos Manos, Campeón, Legionario

  // Línea de caballeros y Leitis para stacks de reliquias lituanas
  const LITHUANIAN_RELIC_UNIT_IDS = new Set([38, 283, 569, 1234, 1236]); // Caballero, Jinete, Paladín, Leitis, Leitis de Élite

  // Guerrero Jaguar
  const JAGUAR_WARRIOR_IDS = new Set([725, 726]);

  // Caballería Tigresa
  const TIGER_CAVALRY_IDS = new Set([1949, 1951]);

  // Monaspa (estándar y de élite)
  const MONASPA_IDS = new Set([1747, 1749, 1803, 1805]);

  // Unidades con penetración de armadura
  const LEITIS_IDS = new Set([1234, 1236]);

  // Exclusiones de Dactilera
  const THUMB_RING_EXCLUDED_IDS = new Set([1126, 1128]); // Arambai y Arambai de Élite

  // Grupos específicos de Dactilera y Arqueros a pie
  const SKIRMISHER_GENITOUR_SLINGER_IDS = new Set([6, 7, 185, 1010, 1012, 1155]); // Guerrilleros, Cenitres, Honderos
  const CAV_ARCHER_WAR_CHARIOT_IDS = new Set([11, 39, 474, 561, 831, 832, 1007, 1009, 1231, 1233, 1759, 1761, 1944, 1946]);
  const CHU_KO_NU_IDS = new Set([73, 559]);
  const FOOT_ARCHER_BOGSVEIGAR_IDS = new Set([4, 24, 492]); // Arquero, Ballestero, Arbalestero

  // Unidades de pólvora terrestres
  const GUNPOWDER_IDS = new Set([5, 36, 46, 558, 771, 773, 1908, 1910]); // Artillero, Cañón asedio, Jenízaro, Conquistador, etc.

  // Clasificación de barcos (Clase 16 / Clase 22)
  const HULK_LINE_IDS = new Set([2626, 2627, 2628, 1948]); // Hulk, War Hulk, Carraca, Lou Chuan
  const GALLEY_LINE_IDS = new Set([539, 21, 442]); // Galera, Galera de guerra, Galeón
  const CARAVEL_LINE_IDS = new Set([1004, 1006]); // Carabela, Carabela de élite
  const LONGBOAT_LINE_IDS = new Set([250, 533]); // Drakkar, Drakkar de élite
  const FIRE_SHIP_IDS = new Set([1103, 529, 532, 1302]); // Galera incendiaria, Brulote, Brulote rápido, Barco dragón
  const FIRE_SHIP_EXCL_DRAGON_IDS = new Set([1103, 529, 532]);
  const DEMO_SHIP_IDS = new Set([1104, 527, 528]); // Balsa de demolición, Buque de demolición, Buque de demolición pesado
  const CANNON_GALLEON_IDS = new Set([420, 691]); // Galeón artillado, Galeón artillado de élite
  const DROMON_IDS = new Set([1795]);

  // Diccionario de nombres snake_case de data/civ_bonuses.json -> IDs numéricos de data.json
  const UNIT_SLUG_TO_IDS = {
    spearman: [93],
    pikeman: [358],
    halberdier: [359],
    skirmisher: [7],
    elite_skirmisher: [6],
    imperial_skirmisher: [1155],
    cavalry_archer: [39],
    heavy_cavalry_archer: [474],
    mangudai: [11],
    elite_mangudai: [561],
    scout_cavalry: [448],
    light_cavalry: [546],
    hussar: [441],
    winged_hussar: [1707],
    steppe_lancer: [1370],
    elite_steppe_lancer: [1372],
    knight: [38],
    cavalier: [283],
    paladin: [569, 1813],
    leitis: [1234],
    elite_leitis: [1236],
    battle_elephant: [1132],
    elite_battle_elephant: [1134],
    elephant_archer: [873],
    elite_elephant_archer: [875],
    armored_elephant: [1744],
    siege_elephant: [1746],
    camel_scout: [1755],
    camel_rider: [329],
    heavy_camel_rider: [330],
    imperial_camel_rider: [207],
    mameluke: [282],
    elite_mameluke: [556],
    condottiero: [882],
    slinger: [185],
    trebuchet: [42],
    trebuchet_packed: [331],
    fire_lancer: [1901, 1903],
    elite_fire_lancer: [1903],
    flncer: [1901],
    eflncer: [1903],
    iron_pagoda: [1908, 1910],
    elite_iron_pagoda: [1910],
    varangian_guard: [2703],
    elite_varangian_guard: [2704],
    mounted_crossbowman: [2700],
    heavy_mounted_crossbowman: [2701],
    champi_warrior: [2550, 2552, 2588],
    elite_champi_warrior: [2554],
    temple_guard: [2586, 2562],
    elite_temple_guard: [2587, 2564],
    guecha_warrior: [2562],
    elite_guecha_warrior: [2564],
    hei_guang_cavalry: [1952],
    elite_hei_guang_cavalry: [1954],
    xianbei_raider: [1944],
    elite_xianbei_raider: [1946],
    jian_swordsman: [1974],
    elite_jian_swordsman: [1978],
    galley: [539],
    war_galley: [21],
    galleon: [442],
    fire_galley: [1103],
    fire_ship: [529],
    fast_fire_ship: [532],
    dragon_ship: [1302],
    demolition_raft: [1104],
    demolition_ship: [527],
    heavy_demolition_ship: [528],
    longboat: [250],
    elite_longboat: [533],
    caravel: [1004],
    elite_caravel: [1006],
    turtle_ship: [831],
    elite_turtle_ship: [832],
    cannon_galleon: [420],
    elite_cannon_galleon: [691],
    dromon: [1795],
    thirisadai: [1750],
    lou_chuan: [1948],
    catapult_galleon: [2633],
    hulk: [2626],
    war_hulk: [2627],
    carrack: [2628]
  };

  // Requisito de Edad exacto (3 = Castillos [Plata], 4 = Imperial [Oro]) para tecnologías únicas del Castillo (Building 82)
  const TECH_AGE_MAP = {
    922: 3, 921: 4,   // Armenians
    460: 3, 24: 4,    // Aztecs
    833: 3, 834: 4,   // Bengalis
    578: 3, 579: 4,   // Berbers
    784: 3, 785: 4,   // Bohemians
    3: 3, 461: 4,     // Britons
    685: 3, 686: 4,   // Bulgarians
    754: 3, 755: 4,   // Burgundians
    626: 3, 627: 4,   // Burmese
    464: 3, 61: 4,    // Byzantines
    482: 3, 5: 4,     // Celts
    462: 3, 52: 4,    // Chinese
    689: 3, 690: 4,   // Cumans
    1484: 3, 1483: 4, // Danes
    831: 3, 832: 4,   // Dravidians
    574: 3, 575: 4,   // Ethiopians
    1496: 3, 493: 4,  // Franks
    923: 3, 924: 4,   // Georgians
    16: 3, 457: 4,    // Goths
    835: 3, 836: 4,   // Gurjaras
    506: 3, 507: 4,   // Hindustanis
    483: 3, 21: 4,    // Huns
    516: 3, 517: 4,   // Incas
    499: 3, 902: 4,   // Italians
    484: 3, 59: 4,    // Japanese
    996: 3, 997: 4,   // Jurchens
    1006: 3, 1007: 4, // Khitans
    622: 3, 623: 4,   // Khmer
    486: 3, 445: 4,   // Koreans
    691: 3, 692: 4,   // Lithuanians
    514: 3, 515: 4,   // Magyars
    624: 3, 625: 4,   // Malay
    576: 3, 577: 4,   // Malians
    1379: 3, 1380: 4, // Mapuche
    485: 3, 4: 4,     // Mayans
    487: 3, 6: 4,     // Mongols
    1365: 3, 1366: 4, // Muisca
    488: 3, 7: 4,     // Persians
    782: 3, 783: 4,   // Poles
    1404: 3, 573: 4,  // Portuguese
    883: 3, 884: 4,   // Romans
    28: 3, 454: 4,    // Saracens
    1491: 3, 1464: 4, // Saxons
    1070: 3, 1069: 4, // Shu
    756: 3, 757: 4,   // Sicilians
    455: 3, 513: 4,   // Slavs
    492: 3, 440: 4,   // Spanish
    687: 3, 688: 4,   // Tatars
    489: 3, 11: 4,    // Teutons
    1392: 3, 1393: 4, // Tupi
    491: 3, 10: 4,    // Turks
    1473: 3, 1474: 4, // Varangians
    628: 3, 629: 4,   // Vietnamese
    463: 3, 49: 4,    // Vikings (463: Caudillos [Castillos], 49: Bogsveigar [Imperial])
    1061: 3, 1062: 4, // Wei
    1080: 3, 1081: 4  // Wu
  };

  // Fallback por civilización cuando no se provee el árbol completo de data.json
  const CIV_UNIQUE_TECHS = {
    Armenians: { castle: 922, imperial: 921 },
    Aztecs: { castle: 460, imperial: 24 },
    Bengalis: { castle: 833, imperial: 834 },
    Berbers: { castle: 578, imperial: 579 },
    Bohemians: { castle: 784, imperial: 785 },
    Britons: { castle: 3, imperial: 461 },
    Bulgarians: { castle: 685, imperial: 686 },
    Burgundians: { castle: 754, imperial: 755 },
    Burmese: { castle: 626, imperial: 627 },
    Byzantines: { castle: 464, imperial: 61 },
    Celts: { castle: 482, imperial: 5 },
    Chinese: { castle: 462, imperial: 52 },
    Cumans: { castle: 689, imperial: 690 },
    Danes: { castle: 1484, imperial: 1483 },
    Dravidians: { castle: 831, imperial: 832 },
    Ethiopians: { castle: 574, imperial: 575 },
    Franks: { castle: 1496, imperial: 493 },
    Georgians: { castle: 923, imperial: 924 },
    Goths: { castle: 16, imperial: 457 },
    Gurjaras: { castle: 835, imperial: 836 },
    Hindustanis: { castle: 506, imperial: 507 },
    Huns: { castle: 483, imperial: 21 },
    Incas: { castle: 516, imperial: 517 },
    Italians: { castle: 499, imperial: 902 },
    Japanese: { castle: 484, imperial: 59 },
    Jurchens: { castle: 996, imperial: 997 },
    Yurchen: { castle: 996, imperial: 997 },
    Yurchens: { castle: 996, imperial: 997 },
    Khitans: { castle: 1006, imperial: 1007 },
    Khmer: { castle: 622, imperial: 623 },
    Koreans: { castle: 486, imperial: 445 },
    Lithuanians: { castle: 691, imperial: 692 },
    Magyars: { castle: 514, imperial: 515 },
    Malay: { castle: 624, imperial: 625 },
    Malians: { castle: 576, imperial: 577 },
    Mapuche: { castle: 1379, imperial: 1380 },
    Mayans: { castle: 485, imperial: 4 },
    Mongols: { castle: 487, imperial: 6 },
    Muisca: { castle: 1365, imperial: 1366 },
    Persians: { castle: 488, imperial: 7 },
    Poles: { castle: 782, imperial: 783 },
    Portuguese: { castle: 1404, imperial: 573 },
    Romans: { castle: 883, imperial: 884 },
    Saracens: { castle: 28, imperial: 454 },
    Saxons: { castle: 1491, imperial: 1464 },
    Shu: { castle: 1070, imperial: 1069 },
    Sicilians: { castle: 756, imperial: 757 },
    Slavs: { castle: 455, imperial: 513 },
    Spanish: { castle: 492, imperial: 440 },
    Tatars: { castle: 687, imperial: 688 },
    Teutons: { castle: 489, imperial: 11 },
    Tupi: { castle: 1392, imperial: 1393 },
    Turks: { castle: 491, imperial: 10 },
    Varangians: { castle: 1473, imperial: 1474 },
    Vietnamese: { castle: 628, imperial: 629 },
    Vikings: { castle: 463, imperial: 49 },
    Wei: { castle: 1061, imperial: 1062 },
    Wu: { castle: 1080, imperial: 1081 }
  };

  /**
   * Detecta sistemáticamente las dos Tecnologías Únicas de una civilización
   * cruzando civ.Tech con data.Tech (investigadas en el Castillo, Building === 82)
   * y clasificando estrictamente por requisito de Edad:
   * - Corona de Castillos (Plata): Age === 3
   * - Corona de Imperial (Oro): Age === 4
   */
  function resolveCivUniqueTechs(civKey, gameData) {
    if (!civKey || civKey === 'Generic') return null;

    if (gameData && gameData.civs && gameData.civs[civKey] && gameData.data && gameData.data.Tech) {
      const civTechIds = gameData.civs[civKey].Tech || [];
      const allTechs = gameData.data.Tech;
      let castleTechId = null;
      let imperialTechId = null;

      for (const rawId of civTechIds) {
        const tid = Number(rawId);
        const techObj = allTechs[tid];
        if (!techObj) continue;

        const isCastleUT = (techObj.Building === 82) || Object.prototype.hasOwnProperty.call(TECH_AGE_MAP, tid);
        if (!isCastleUT) continue;

        const reqAge = Number(techObj.Age !== undefined ? techObj.Age : TECH_AGE_MAP[tid]);
        if (reqAge === 3) {
          castleTechId = tid;
        } else if (reqAge === 4) {
          imperialTechId = tid;
        }
      }

      if (castleTechId || imperialTechId) {
        return { castle: castleTechId, imperial: imperialTechId };
      }
    }

    return CIV_UNIQUE_TECHS[civKey] || null;
  }

  // Detección de civilización Khitan / Kithan
  function isKhitanCiv(civName) {
    return ["khitan", "khitans", "kithan"].includes(String(civName || "").toLowerCase().trim());
  }

  // 1. Elegibilidad Lamellar Armor (Infantería + Skirmishers)
  function hasLamellarArmor(unit, civName, upgrades = {}) {
    if (!unit) return false;
    const civ = civName || unit.civName || unit.civ || "";
    if (!isKhitanCiv(civ)) return false;
    const hasTech = Boolean(
      upgrades?.uniqueCastleTech ||
      upgrades?.lamellarArmor ||
      upgrades?.castleCrown ||
      (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1006)) ||
      unit.hasLamellarArmor
    );
    if (!hasTech) return false;

    const armours = Array.isArray(unit.Armours) ? unit.Armours : (Array.isArray(unit._rawUnitData?.Armours) ? unit._rawUnitData.Armours : []);
    const isInfantry = armours.some(a => a.Class === 11 || a.Class === 1);
    const uid = Number(unit.ID ?? unit.id ?? 0);
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    const isSkirmisher = [6, 7, 1155].includes(uid) || name.includes("skirmisher") || name.includes("guerrillero");

    return isInfantry || isSkirmisher;
  }

  // 2. Elegibilidad Corona de Oro (Caballería + Camellos)
  function isMountedOrCamel(unit) {
    if (!unit) return false;
    const armours = Array.isArray(unit.Armours) ? unit.Armours : (Array.isArray(unit._rawUnitData?.Armours) ? unit._rawUnitData.Armours : []);
    const hasEligibleClass = armours.some(a => a.Class === 8 || a.Class === 30);
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    const keywords = [
      "cavalry", "caballeria", "scout", "jinete", "knight", "caballero", 
      "lancer", "hussar", "paladin", "tarkan", "cataphract", "keshik", 
      "boyar", "konnik", "monaspa", "shrivamsha", "iron_pagoda", "camel", "camello",
      "steppe_lancer", "hei_guang", "xianbei"
    ];
    return hasEligibleClass || keywords.some(k => name.includes(k));
  }

  // 3. Tasa de regeneración para Khitan (150% de su vida máxima por minuto -> HP/s)
  function getKhitanRegenRate(unit, civName, upgrades = {}) {
    if (!unit) return 0;
    const civ = civName || unit.civName || unit.civ || "";
    if (!isKhitanCiv(civ)) return 0;
    const hasTech = Boolean(
      upgrades?.uniqueImpTech ||
      upgrades?.khitanGoldCrown ||
      upgrades?.imperialCrown ||
      (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1007)) ||
      unit.hasKhitanRegen
    );
    if (!hasTech) return 0;
    if (!isMountedOrCamel(unit)) return 0;

    // 150% de su vida máxima por minuto -> HP/s
    const maxHP = Number(unit.maxHP || unit.HP || unit._rawUnitData?.HP || 1);
    return (maxHP * 1.50) / 60; // maxHP * 0.025
  }

  /**
   * Determina la tasa exacta de regeneración pasiva de HP por segundo de una unidad.
   * - Berserker (IDs 692 y 694): Innato 40 HP/min (~0.667 HP/s). Sin dependencia de Berserkergang.
   * - Caballería Georgiana: 2/8/12 HP/min en Feudal/Castillos/Imperial (~0.033 / ~0.133 / 0.200 HP/s).
   * - Camellos Bereberes con Camellos Magrebíes (ID 579 / 563): 15 HP/min (0.250 HP/s).
   * - Caballería y Camellos Khitans con Corona Imperial (ID 1007): 150% de HP máx/min.
   */
  function getUnitRegenRate(unit, civName, age, upgrades = {}) {
    if (!unit) return 0.0;
    const normCiv = String(civName || unit.civName || unit.civ || '').toLowerCase().trim();
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
    const uid = Number(unit.ID ?? unit.id ?? 0);
    const armours = Array.isArray(unit.Armours) ? unit.Armours : (Array.isArray(unit._rawUnitData?.Armours) ? unit._rawUnitData.Armours : []);

    // 1. Berserker (Innato: 40 HP/min tanto estándar como élite)
    const isBerserk = [692, 694].includes(uid) || name.includes('berserk') || name.includes('vbrsk');
    if (isBerserk) {
      return 40 / 60; // ~0.667 HP/s continuo
    }

    // 2. Caballería Georgiana (Escalado por Edad)
    const isGeorgian = ['georgians', 'georgianos'].includes(normCiv);
    const isMountedUnit = armours.some(a => a.Class === 8) ||
                          name.includes('cavalry') || name.includes('monaspa') ||
                          name.includes('knight') || name.includes('scout') ||
                          (typeof isMounted === 'function' && isMounted(unit));
    if (isGeorgian && isMountedUnit) {
      const activeAge = Number(upgrades?.selectedAge || upgrades?.age || age || unit.age || 3);
      if (activeAge === 2) return 2 / 60;   // 2 HP/min
      if (activeAge === 3) return 8 / 60;   // 8 HP/min
      if (activeAge >= 4) return 12 / 60;  // 12 HP/min
    }

    // 3. Bereberes con Camellos Magrebíes (ID 579 / 563)
    const isBerber = ['berbers', 'bereberes'].includes(normCiv);
    const isCamelUnit = armours.some(a => a.Class === 30) || name.includes('camel');
    const hasMaghrebi = Boolean(
      upgrades?.maghrebiCamels ||
      upgrades?.uniqueImpTech ||
      (isBerber && upgrades?.imperialCrown) ||
      (Array.isArray(upgrades?.activeUniqueTechs) && (upgrades.activeUniqueTechs.includes(579) || upgrades.activeUniqueTechs.includes(563))) ||
      unit.hasMaghrebiCamels
    );
    if (isBerber && isCamelUnit && hasMaghrebi) {
      return 15 / 60; // 15 HP/min (0.25 HP/s)
    }

    // 4. Khitans con Corona de Oro de Regeneración (Ordo Cavalry, ID 1007: 150% de HP máx/min a Caballería y Camellos)
    const khitanRegen = getKhitanRegenRate(unit, normCiv, upgrades);
    if (khitanRegen > 0) {
      return khitanRegen;
    }

    return 0.0;
  }

  /**
   * Determina el perfil de daño de veneno prolongado en el tiempo (DoT) de un atacante.
   * Daño verdadero (True damage) que ignora armaduras cuerpo a cuerpo y antiproyectil.
   * - Khitan Liu Dao (Innato, IDs 1920 y 1922): 9 HP en 5s (1.800 HP/s).
   * - Tupí Arbalesta con Corona de Oro Curare (ID 1393, unidad ID 492): 5 HP en 15s (~0.333 HP/s).
   * - Tupí Blackwood Archer con Corona de Oro Curare (ID 1393, unidades IDs 2579 y 2581): 2 HP en 15s (~0.133 HP/s).
   */
  function getPoisonProfile(attacker, civNameOrUpgrades, maybeUpgrades) {
    if (!attacker) return null;
    let civName = "";
    let upgrades = {};
    if (typeof civNameOrUpgrades === "string") {
      civName = civNameOrUpgrades;
      upgrades = maybeUpgrades || {};
    } else if (civNameOrUpgrades && typeof civNameOrUpgrades === "object") {
      upgrades = civNameOrUpgrades;
      civName = upgrades.civName || upgrades.civ || attacker.civName || attacker.civ || "";
    } else {
      upgrades = maybeUpgrades || {};
      civName = attacker.civName || attacker.civ || "";
    }

    const normCiv = String(civName || attacker.civName || attacker.civ || "").toLowerCase().trim();
    const uid = Number(attacker.ID ?? attacker.id ?? 0);
    const name = String(attacker.internal_name || attacker.name || attacker.localizedName || "").toLowerCase();

    // 1. Khitan Liu Dao (Innato: 9 HP / 5s = 1.8 HP/s)
    // Base (1920) y Élite (1922)
    if ([1920, 1922].includes(uid) || name.includes("liu dao") || name.includes("liaodao")) {
      return {
        totalDamage: 9,
        duration: 5,
        dps: 9 / 5, // 1.800 HP/s
        source: "Liu Dao (Khitan)"
      };
    }

    // 2. Tupí con Corona de Oro (Curare - ID 1393)
    const isTupi = ["tupi", "tupí", "tupis"].includes(normCiv);
    const hasCurare = isTupi && Boolean(
      upgrades?.tupiGoldCrown ||
      upgrades?.curare ||
      upgrades?.uniqueImpTech ||
      upgrades?.imperialCrown ||
      (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1393)) ||
      attacker.hasCurare
    );

    if (hasCurare) {
      // Tupí Arbalesta (ID 492)
      if (uid === 492 || name.includes("arbalester") || name.includes("arbalesta") || name.includes("acoar")) {
        return {
          totalDamage: 5,
          duration: 15,
          dps: 5 / 15, // ~0.333 HP/s
          source: "Arbalesta (Tupí Curare)"
        };
      }
      // Tupí Blackwood Archer (IDs 2579, 2581)
      if ([2579, 2581].includes(uid) || name.includes("blackwood") || name.includes("blckwood") || name.includes("madera negra")) {
        return {
          totalDamage: 2,
          duration: 15,
          dps: 2 / 15, // ~0.133 HP/s
          source: "Blackwood Archer (Tupí Curare)"
        };
      }
    }

    return null;
  }

  // =========================================================================
  // =========================================================================
  // INTEGRACIÓN BALÍSTICA (Genie Engine Master Ballistics Registry)
  // =========================================================================

  let ballisticsModule = null;
  if (typeof require === 'function') {
    try {
      ballisticsModule = require('./ballistics.js');
    } catch (e) {}
  }
  if (!ballisticsModule && typeof window !== 'undefined' && window.AoE2Ballistics) {
    ballisticsModule = window.AoE2Ballistics;
  }
  if (!ballisticsModule && typeof window !== 'undefined' && window.BALLISTICS_REGISTRY) {
    ballisticsModule = window;
  }

  const ROCKET_CART_IDS = new Set([1904, 1907]);

  function isRocketCartUnit(unit) {
    if (ballisticsModule && typeof ballisticsModule.isRocketCartUnit === 'function') {
      return ballisticsModule.isRocketCartUnit(unit);
    }
    if (!unit) return false;
    const uid = Number(unit.ID ?? unit.id ?? 0);
    if (ROCKET_CART_IDS.has(uid)) return true;
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
    return name.includes('rocket_cart') ||
           name.includes('rcktcrt') ||
           name.includes('hrcktcrt') ||
           name.includes('carro_cohete') ||
           name.includes('cohete') ||
           name.includes('rocket cart');
  }

  const FALLBACK_BALLISTICS_REGISTRY = {
    chu_ko_nu: {
      match: (name, id) => [73, 559].includes(id) || name.includes("chu_ko_nu"),
      getProfile: (unit) => {
        const isElite = unit.ID === 559 || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("echukonu");
        return {
          projectiles: isElite ? 5 : 3,
          secondaryDamage: 3,
          secondaryScalesWithChemistry: false,
          secondaryBonuses: [],
          ignoresArmor: false,
          minDamageFloor: 1
        };
      }
    },
    kipchak: {
      match: (name, id) => [1231, 1233].includes(id) || name.includes("kipchak"),
      getProfile: (unit) => {
        const isElite = unit.ID === 1233 || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("ekipchak");
        return {
          projectiles: isElite ? 4 : 3,
          secondaryDamage: 3,
          secondaryScalesWithChemistry: false,
          secondaryBonuses: [],
          ignoresArmor: false,
          minDamageFloor: 1
        };
      }
    },
    composite_bowman: {
      match: (name, id) => [1800, 1802].includes(id) || name.includes("composite_bowman") || name.includes("arco_compuesto"),
      getProfile: () => ({
        projectiles: 1,
        ignoresArmor: true,
        minDamageFloor: 1
      })
    },
    mayan_skirmisher: {
      match: (name, id, civ, upgrades) => {
        const isSkirm = [6, 7, 1155].includes(id) || name.includes("skirmisher") || name.includes("guerrillero");
        const isMayan = ["mayans", "mayas"].includes((civ || "").toLowerCase());
        return isSkirm && isMayan && Boolean(upgrades?.hulche || upgrades?.uniqueCastleTech || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(485)));
      },
      getProfile: () => ({
        projectiles: 2,
        secondaryDamage: 1,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [
          { Class: 4, Amount: 1 },
          { Class: 2, Amount: 1 }
        ],
        ignoresArmor: false,
        minDamageFloor: 1
      })
    },
    shu_arbalester: {
      match: (name, id, civ, upgrades) => {
        const uid = Number(id);
        const isArb = uid === 492 || [4, 24, 492].includes(uid) || name.includes("arbalester") || name.includes("arbalesta") || name.includes("acoar");
        const normCiv = String(civ || "").toLowerCase().trim();
        const isShu = ["shu"].includes(normCiv);
        const hasTech = Boolean(
          upgrades?.boltMagazine ||
          upgrades?.cargador ||
          upgrades?.shuCrown ||
          upgrades?.uniqueImpTech ||
          upgrades?.imperialCrown ||
          (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1069)) ||
          upgrades?.hasBoltMagazine
        );
        return isArb && isShu && hasTech;
      },
      getProfile: () => ({
        projectiles: 3, // 1 principal + 2 adicionales (total 3)
        secondaryDamage: 1, // 1 de ataque base por proyectil secundario
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [],
        ignoresArmor: false,
        minDamageFloor: 1,
        source: "Arbalesta del Shu (Cargador / Corona de Oro #1069)"
      })
    },
    organ_gun: {
      match: (name, id) => [1001, 1003].includes(id) || name.includes("organ_gun") || name.includes("salvas"),
      getProfile: (unit, civ, upgrades) => {
        const isElite = unit.ID === 1003 || (unit.name || "").toLowerCase().includes("elite");
        const chemBonus = upgrades?.chemistry ? 1 : 0;
        const baseDmg = (isElite ? 9 : 7) + chemBonus;
        return {
          projectiles: 5,
          secondaryDamage: baseDmg,
          secondaryScalesWithChemistry: true,
          secondaryBonuses: [
            { Class: 1, Amount: 1 },
            { Class: 8, Amount: 1 },
            { Class: 11, Amount: 1 }
          ],
          blastRadius: 0.5,
          ignoresArmor: false,
          minDamageFloor: 1
        };
      }
    },
    hussite_wagon: {
      match: (name, id) => [1704, 1706, 1709].includes(id) || name.includes("hussite_wagon") || name.includes("husita"),
      getProfile: (unit) => {
        const isElite = [1706, 1709].includes(unit.ID) || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("ehussite");
        return {
          projectiles: isElite ? 6 : 5,
          secondaryDamage: 4,
          secondaryScalesWithChemistry: false,
          secondaryBonuses: [],
          ignoresArmor: false,
          minDamageFloor: 1,
          absorbsProjectiles: 0.50
        };
      }
    },
    scorpion_khmer: {
      match: (name, id) => [279, 542].includes(id) || name.includes("scorpion") || name.includes("escorpion"),
      getProfile: (unit, civ, upgrades) => {
        const isKhmer = ["khmer", "jemeres"].includes((civ || "").toLowerCase());
        const hasDoubleCrossbow = isKhmer && (upgrades?.doubleCrossbow || upgrades?.uniqueImpTech || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(623)));
        if (!hasDoubleCrossbow) return { projectiles: 1, isPassThrough: true };

        const isHeavy = unit.ID === 542 || (unit.name || "").toLowerCase().includes("heavy");
        const chemBonus = upgrades?.chemistry ? 1 : 0;
        const baseDmg = (isHeavy ? 16 : 12) + chemBonus;
        return {
          projectiles: 2,
          secondaryDamage: baseDmg,
          secondaryScalesWithChemistry: true,
          secondaryBonuses: isHeavy ? [
            { Class: 5, Amount: 8 },
            { Class: 11, Amount: 4 },
            { Class: 20, Amount: 2 },
            { Class: 1, Amount: 1 }
          ] : [
            { Class: 5, Amount: 6 },
            { Class: 11, Amount: 2 },
            { Class: 20, Amount: 1 },
            { Class: 1, Amount: 1 }
          ],
          isPassThrough: true,
          ignoresArmor: false,
          minDamageFloor: 1
        };
      }
    },
    ballista_elephant_khmer: {
      match: (name, id) => [1120, 1122].includes(id) || name.includes("ballista_elephant") || name.includes("elefante_balista"),
      getProfile: (unit, civ, upgrades) => {
        const isKhmer = ["khmer", "jemeres"].includes((civ || "").toLowerCase());
        const hasDoubleCrossbow = isKhmer && (upgrades?.doubleCrossbow || upgrades?.uniqueImpTech || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(623)));
        if (!hasDoubleCrossbow) return { projectiles: 1, isPassThrough: true };

        const isElite = unit.ID === 1122 || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("eballis");
        const chemBonus = upgrades?.chemistry ? 1 : 0;
        const baseDmg = (isElite ? 9 : 8) + chemBonus;
        return {
          projectiles: 2,
          secondaryDamage: baseDmg,
          secondaryScalesWithChemistry: true,
          secondaryBonuses: [
            { Class: 11, Amount: 4 },
            { Class: 13, Amount: 3 },
            { Class: 20, Amount: 3 },
            { Class: 20, Amount: 2 }
          ],
          isPassThrough: true,
          ignoresArmor: false,
          minDamageFloor: 1
        };
      }
    },
    rocket_cart_line: {
      match: (name, id) => [1904, 1907].includes(id) || name.includes("rocket_cart") || name.includes("carro_cohete") || name.includes("cohete") || name.includes("rcktcrt"),
      getProfile: (unit, civ, upgrades) => {
        const uid = Number(unit?.ID ?? unit?.id ?? 0);
        const isElite = uid === 1907 || (unit?.name || "").toLowerCase().includes("elite") || (unit?.internal_name || "").toLowerCase().includes("hrcktcrt") || (unit?.localizedName || "").toLowerCase().includes("pesado");
        const normCiv = (civ || "").toLowerCase().trim();

        let count = isElite ? 10 : 8;
        const isKorean = ["koreans", "coreanos", "korean"].includes(normCiv);
        const hasKoreanTech = isKorean && (upgrades?.uniqueImpTech || upgrades?.shinkichon || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(445)) || unit?.hasShinkichon);
        if (hasKoreanTech) count = 16;

        const isJurchen = ["jurchen", "jurchens", "yurchen", "yurchens", "yurchenos", "jurchenos"].includes(normCiv);
        const hasJurchenTech = isJurchen && (upgrades?.uniqueCastleTech || upgrades?.uniqueImpTech || upgrades?.thunderclapBombs || upgrades?.bombasTrueno || (Array.isArray(upgrades?.activeUniqueTechs) && (upgrades.activeUniqueTechs.includes(997) || upgrades.activeUniqueTechs.includes(996))) || unit?.hasThunderclapBombs);

        return {
          isRocketCart: true,
          projectiles: count,
          baseDamage: isElite ? 6 : 5,
          bonusVsSiege: 4,
          bonusHeavySiege: 4,
          extraRange: hasKoreanTech ? 1 : 0,
          ignoresArmor: true,
          projectileImpact: hasJurchenTech ? { extraDamage: 4, aoe: 1.25 } : null,
          deathImpact: hasJurchenTech ? { damage: 15, aoe: 1.0 } : { damage: isElite ? 35 : 25, aoe: 1.5 }
        };
      }
    },
    thirisadai: {
      match: (name, id) => [1750].includes(id) || name.includes("thirisadai"),
      getProfile: () => ({
        projectiles: 5,
        secondaryDamage: 3,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [],
        ignoresArmor: false,
        minDamageFloor: 1
      })
    },
    longboat: {
      match: (name, id) => [250, 533].includes(id) || name.includes("longboat") || name.includes("drakkar"),
      getProfile: (unit) => {
        const isElite = unit.ID === 533 || (unit.name || "").toLowerCase().includes("elite");
        return {
          projectiles: isElite ? 5 : 4,
          secondaryDamage: 1,
          secondaryScalesWithChemistry: false,
          secondaryBonuses: [],
          ignoresArmor: false,
          minDamageFloor: 1
        };
      }
    },
    caravel: {
      match: (name, id) => [1004, 1006].includes(id) || name.includes("caravel") || name.includes("carabela"),
      getProfile: () => ({
        projectiles: 1,
        isPassThrough: true,
        ignoresArmor: false,
        minDamageFloor: 1
      })
    },
    lou_chuan: {
      match: (name, id) => [1948].includes(id) || name.includes("lou_chuan") || name.includes("lou chuan"),
      getProfile: () => ({
        projectiles: 4,
        secondaryDamage: 2,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [],
        ignoresArmor: false,
        minDamageFloor: 1
      })
    }
  };

  function getBallisticProfile(unit, civNameOrUpgrades, maybeUpgrades) {
    if (ballisticsModule && typeof ballisticsModule.getBallisticProfile === 'function') {
      return ballisticsModule.getBallisticProfile(unit, civNameOrUpgrades, maybeUpgrades);
    }
    if (!unit) return null;
    let civName = '';
    let upgrades = {};
    if (typeof civNameOrUpgrades === 'string') {
      civName = civNameOrUpgrades;
      upgrades = maybeUpgrades || {};
    } else if (civNameOrUpgrades && typeof civNameOrUpgrades === 'object') {
      upgrades = civNameOrUpgrades;
      civName = upgrades.civName || upgrades.civ || unit.civName || unit.civ || '';
    } else {
      upgrades = maybeUpgrades || {};
      civName = unit.civName || unit.civ || '';
    }

    const uid = Number(unit.ID ?? unit.id ?? 0);
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();

    const reg = (ballisticsModule && ballisticsModule.BALLISTICS_REGISTRY) || FALLBACK_BALLISTICS_REGISTRY;
    for (const key in reg) {
      const entry = reg[key];
      if (entry.match(name, uid, civName, upgrades)) {
        return entry.getProfile(unit, civName, upgrades);
      }
    }
    return null;
  }

  function calculateRocketCartDamage(attacker, defender, ballisticProfile, options = {}) {
    if (ballisticsModule && typeof ballisticsModule.calculateRocketCartDamage === 'function') {
      return ballisticsModule.calculateRocketCartDamage(attacker, defender, ballisticProfile, options);
    }
    const profile = ballisticProfile || getBallisticProfile(attacker, attacker.civName, options);
    if (!profile || !profile.isRocketCart) return 0;

    const armours = Array.isArray(defender?.Armours) ? defender.Armours : (Array.isArray(defender?._rawUnitData?.Armours) ? defender._rawUnitData.Armours : []);
    const hasClass = (c) => armours.some(a => a.Class === c);
    const defId = Number(defender?.ID ?? defender?.id ?? 0);
    const isHeavySiege = hasClass(20) || hasClass(37) || [1120, 1122, 1704, 1706, 279, 542, 280, 550, 588, 1904, 1907].includes(defId);

    const bonusDmg = isHeavySiege ? (profile.bonusVsSiege || 4) : 0;
    const extraExplosive = profile.projectileImpact ? (profile.projectileImpact.extraDamage || 0) : 0;
    const damagePerRocket = profile.baseDamage + bonusDmg + extraExplosive;

    let H = 1.0;
    const rawElevation = options.elevation || attacker.elevation || (attacker.options && attacker.options.elevation) || 'flat';
    if (rawElevation === 'high' || rawElevation === 'downhill') {
      H = 1.25;
    } else if (rawElevation === 'low' || rawElevation === 'uphill') {
      H = 0.75;
    }

    return Math.max(1, Math.floor(H * profile.projectiles * damagePerRocket));
  }

  // =========================================================================
  // SECCIÓN 1: MODELADO DE ENTIDAD Y LECTURA NATIVA (initCombatant)
  // =========================================================================

  /**
   * Instancia a un combatiente a partir de su objeto nativo en data.json
   * Parte siempre de los atributos base limpios (_rawUnitData) para evitar doble suma.
   * @param {Object} unitData - Objeto de unidad extraído de data.json (o combatiente previo)
   * @param {Object} options - Modificadores, tecnologías, stacks y civilización
   * @returns {Object} Combatiente listo para el cálculo y simulación
   */
  function initCombatant(unitData, options = {}) {
    if (!unitData) {
      throw new Error('initCombatant requiere un objeto unitData válido.');
    }

    // Extraer siempre la entidad base limpia para impedir que los modificadores se sumen dos veces
    const raw = unitData._rawUnitData || unitData;
    const effectiveOptions = (options && Object.keys(options).length > 0) ? options : (unitData.options || {});

    // 1. Clonación segura desde los valores base limpios
    const baseHP = Number(raw.HP) || 1;
    const baseAttack = Number(raw.Attack) || 0;
    const baseAccuracy = raw.Accuracy !== undefined
      ? Number(raw.Accuracy)
      : (raw.AccuracyPercent !== undefined ? Number(raw.AccuracyPercent) : 100);
    const baseLOS = Number(raw.LineOfSight) || 0;

    const rawElevation = effectiveOptions.elevation || unitData.elevation || 'flat';
    const normalizedElevation = (rawElevation === 'high' || rawElevation === 'downhill')
      ? 'high'
      : ((rawElevation === 'low' || rawElevation === 'uphill') ? 'low' : 'flat');

    const combatant = {
      _rawUnitData: {
        ID: Number(raw.ID),
        internal_name: raw.internal_name,
        localizedName: raw.localizedName,
        HP: baseHP,
        Attack: baseAttack,
        MeleeArmor: Number(raw.MeleeArmor) || 0,
        PierceArmor: Number(raw.PierceArmor) || 0,
        Range: Number(raw.Range) || 0,
        MinRange: Number(raw.MinRange) || 0,
        LineOfSight: baseLOS,
        Speed: Number(raw.Speed) || 1.0,
        ReloadTime: Number(raw.ReloadTime) || 2.0,
        Accuracy: baseAccuracy,
        AccuracyPercent: baseAccuracy,
        FrameDelay: Number(raw.FrameDelay) || 0,
        AttackDelaySeconds: raw.AttackDelaySeconds,
        MaxCharge: Number(raw.MaxCharge) || 0,
        RechargeRate: Number(raw.RechargeRate) || 0,
        RechargeDuration: raw.RechargeDuration,
        ChargeType: Number(raw.ChargeType) || 0,
        ChargeEvent: raw.ChargeEvent !== undefined ? Number(raw.ChargeEvent) : 0,
        Cost: { ...(raw.Cost || {}) },
        Attacks: (raw.Attacks || []).map(atk => ({ Amount: Number(atk.Amount), Class: Number(atk.Class) })),
        Armours: (raw.Armours || []).map(arm => ({ Amount: Number(arm.Amount), Class: Number(arm.Class) }))
      },
      ID: Number(raw.ID),
      internal_name: raw.internal_name || `Unit_${raw.ID}`,
      localizedName: raw.localizedName || raw.internal_name || `Unidad #${raw.ID}`,
      age: Number(raw.age || effectiveOptions.age || 3),
      baseHP: baseHP,
      HP: baseHP,
      baseAttack: baseAttack,
      Attack: baseAttack,
      MeleeArmor: Number(raw.MeleeArmor) || 0,
      PierceArmor: Number(raw.PierceArmor) || 0,
      Range: Number(raw.Range) || 0,
      MinRange: Number(raw.MinRange) || 0,
      LineOfSight: baseLOS,
      Speed: Number(raw.Speed) || 1.0,
      ReloadTime: Number(raw.ReloadTime) || 2.0,
      Accuracy: baseAccuracy,
      AccuracyPercent: baseAccuracy,
      FrameDelay: Number(raw.FrameDelay) || 0,
      AttackDelaySeconds: Number(raw.AttackDelaySeconds) || 0,
      MaxCharge: Number(raw.MaxCharge) || 0,
      RechargeRate: Number(raw.RechargeRate) || 0,
      ChargeType: Number(raw.ChargeType) || 0,
      ChargeEvent: raw.ChargeEvent !== undefined ? Number(raw.ChargeEvent) : 0,
      Cost: { ...(raw.Cost || {}) },
      Attacks: (raw.Attacks || []).map(atk => ({ Amount: Number(atk.Amount), Class: Number(atk.Class) })),
      Armours: (raw.Armours || []).map(arm => ({ Amount: Number(arm.Amount), Class: Number(arm.Class) })),
      civ: effectiveOptions.civName || effectiveOptions.civ || unitData.civName || unitData.civ || 'Generic',
      civName: effectiveOptions.civName || effectiveOptions.civ || unitData.civName || unitData.civ || 'Generic',
      elevation: normalizedElevation,
      options: { ...effectiveOptions, elevation: normalizedElevation }
    };

    // 2. Lectura de atributos nativos de carga
    if (raw.RechargeDuration !== undefined) {
      combatant.RechargeDuration = Number(raw.RechargeDuration);
    } else if (combatant.MaxCharge > 0 && combatant.RechargeRate > 0) {
      combatant.RechargeDuration = combatant.MaxCharge / combatant.RechargeRate;
    } else {
      combatant.RechargeDuration = 0;
    }

    // Clasificación de la mecánica de carga
    combatant.isOffensiveCharge = (
      combatant.ChargeType === 1 || 
      combatant.ChargeType === 3 || 
      combatant.internal_name.toUpperCase().includes('COUSTILLIER') || 
      combatant.internal_name.toUpperCase().includes('URUMI')
    );

    combatant.isDefensiveCharge = (
      combatant.ChargeType === 4 || 
      combatant.ChargeType === 5 || 
      combatant.internal_name.toUpperCase().includes('SHRIVAMSHA') || 
      combatant.internal_name.toUpperCase().includes('IRONPAG')
    );

    // Estado inicial de carga
    if (combatant.MaxCharge > 0) {
      combatant.currentCharge = combatant.MaxCharge;
      combatant.nextChargeReadyTime = 0;
    } else {
      combatant.currentCharge = 0;
      combatant.nextChargeReadyTime = 0;
    }

    // 3. Línea de tiempo (Estandarización: t = 0.00s para erradicar asimetría de arranque)
    const initialHP = (effectiveOptions.currentHP !== undefined) ? Number(effectiveOptions.currentHP) : combatant.HP;
    combatant.currentHP = initialHP;
    combatant.maxHP = combatant.HP;
    combatant.nextAttackTime = (effectiveOptions.useAttackDelay || effectiveOptions.useFrameDelay)
      ? Number(raw.AttackDelaySeconds !== undefined ? raw.AttackDelaySeconds : (raw.FrameDelay || 0))
      : 0.0;

    combatant.hasLamellarArmor = hasLamellarArmor(combatant, combatant.civName, effectiveOptions);
    combatant.hasKhitanRegen = Boolean(isKhitanCiv(combatant.civName) && (effectiveOptions.khitanGoldCrown || effectiveOptions.imperialCrown || (Array.isArray(effectiveOptions.activeUniqueTechs) && effectiveOptions.activeUniqueTechs.includes(1007))) && isMountedOrCamel(combatant));

    combatant.regenRate = getUnitRegenRate(combatant, combatant.civName, combatant.age, effectiveOptions);
    combatant.regenPerMin = combatant.regenRate * 60;

    combatant.hasCurare = Boolean(["tupi", "tupí", "tupis"].includes(String(combatant.civName).toLowerCase().trim()) && (effectiveOptions.tupiGoldCrown || effectiveOptions.curare || effectiveOptions.imperialCrown || (Array.isArray(effectiveOptions.activeUniqueTechs) && effectiveOptions.activeUniqueTechs.includes(1393))));
    combatant.poisonProfile = getPoisonProfile(combatant, combatant.civName, effectiveOptions);

    combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, effectiveOptions);
    if (combatant.ballisticProfile && combatant.ballisticProfile.extraRange) {
      combatant.Range += combatant.ballisticProfile.extraRange;
      combatant._extraRangeBallisticsApplied = true;
    }

    // Aplicar modificaciones estáticas previas al combate
    applyStaticModifiers(combatant, effectiveOptions);

    return combatant;
  }

  // =========================================================================
  // SECCIÓN 2: MODIFICADORES ESTÁTICOS, STACKS (0-4), CORONAS Y AURAS
  // =========================================================================

  /**
   * Aplica stacks, auras, mejoras de herrería, mejoras navales, coronas y tecnologías sobre el combatiente
   */
  function applyStaticModifiers(combatant, options) {
    const isShip = isShipUnit(combatant);
    const civName = options.civName || options.civ || combatant.civName || combatant.civ || 'Generic';
    combatant.civ = civName;
    combatant.civName = civName;

    // 0. Consumo dinámico de data/civ_bonuses.json según la edad seleccionada (selectedAge >= bonus.minAge)
    const civBonusesSource = options.civBonuses || getDefaultCivBonuses();
    if (civBonusesSource && civName && civName !== 'Generic') {
      applyCivBonusesFromJson(combatant, civBonusesSource, options);
    }

    // 1. Sliders de Stacks (Límite estricto 0 a 4)
    const rawStacks = Number(options.stacks !== undefined ? options.stacks : 0);
    const stacks = Math.min(4, Math.max(0, rawStacks));
    combatant.appliedStacks = stacks;

    if (!isShip) {
      const isLithuanianRelicUnit = LITHUANIAN_RELIC_UNIT_IDS.has(combatant.ID) &&
        (civName === 'Lithuanians' || LEITIS_IDS.has(combatant.ID) || combatant._relicAttackBonus);

      if (isLithuanianRelicUnit && stacks > 0) {
        // Lituanos: +1 de ataque cuerpo a cuerpo (Clase 4) por reliquia (máx. +4)
        addAttackAmount(combatant, CLASSES.MELEE, stacks);
      }

      if (JAGUAR_WARRIOR_IDS.has(combatant.ID) && stacks > 0) {
        // Guerrero Jaguar: +1 de ataque cuerpo a cuerpo (Clase 4) por baja/stack (máx. +4)
        addAttackAmount(combatant, CLASSES.MELEE, stacks);
      }

      if (TIGER_CAVALRY_IDS.has(combatant.ID) && stacks > 0) {
        // Caballería Tigresa: estrictamente +1 de ataque (Clase 4) y +10 HP por acumulación (máx. +4 atk y +40 HP)
        addAttackAmount(combatant, CLASSES.MELEE, stacks);
        combatant.HP += stacks * 10;
        combatant.currentHP = combatant.HP;
        combatant.maxHP = combatant.HP;
      }

      if (isMonaspa(combatant) && stacks > 0) {
        // Monaspa: +1 de ataque cuerpo a cuerpo (Clase 4) en grupo (máx. +4)
        addAttackAmount(combatant, CLASSES.MELEE, stacks);
      }

      // 2. Aura de Centurión (Toggle)
      if (options.centurionAura && SWORD_INFANTRY_IDS.has(combatant.ID)) {
        combatant.Speed = combatant.Speed * 1.15;
        combatant.ReloadTime = combatant.ReloadTime / 1.20;
        combatant.hasCenturionAura = true;
      }
    }

    // =====================================================================
    // 3. HERRERÍA: MELEE, FLECHAS Y ARMADURAS (GENIE ENGINE SEGREGADO)
    // =====================================================================
    const navalCat = getNavalCategory(combatant);
    const isScorpUnit = [279, 542].includes(combatant.ID) ||
      (combatant.internal_name && ['SCBAL', 'HWBAL'].includes(combatant.internal_name));
    const isSiegeUnit = hasArmourClass(combatant, CLASSES.SIEGE_WEAPONS) || isScorpUnit;

    // 3.1. Herrería Melee: Forja (+1), Fundición (+1 -> acum +2), Alto horno (+2 -> acum +4)
    const meleeLevel = Math.min(3, Math.max(0, Number(options.meleeSmithing || 0)));
    if (meleeLevel > 0) {
      // Regla Naval: Solo la Línea de Choque Melee (Hulk, War Hulk, Carraca, Lou Chuan) recibe Herrería Melee
      // Regla de Asedio: Ninguna máquina de asedio ni escorpión recibe herrería melee
      const canReceiveMeleeSmithing = !isSiegeUnit && (!isShip || navalCat === 'MELEE_SHIP');

      if (canReceiveMeleeSmithing) {
        const cleanAttacks = (combatant._rawUnitData && combatant._rawUnitData.Attacks) || [];
        const nativeMelee = cleanAttacks.find(a => a.Class === CLASSES.MELEE && a.Amount > 0);

        if (nativeMelee) {
          let meleeBonus = 0;
          if (meleeLevel === 1) meleeBonus = 1;
          else if (meleeLevel === 2) meleeBonus = 2;
          else if (meleeLevel === 3) meleeBonus = 4;

          // Multiplicador de mejoras de ataque melee desde civ_bonuses.json (ej. Khitans x2)
          if (combatant._meleeUpgradeMult) {
            meleeBonus = Math.round(meleeBonus * combatant._meleeUpgradeMult);
          }

          addAttackAmount(combatant, CLASSES.MELEE, meleeBonus);
        }
      }
    }

    // 3.2. Herrería Proyectiles: Flechas (+1), Punzón (+1 -> acum +2), Braserío (+1 -> acum +3)
    const pierceLevel = Math.min(3, Math.max(0, Number(options.pierceSmithing || 0)));
    if (pierceLevel > 0) {
      // Regla Naval: Solo la Línea de Proyectil recibe Herrería Flechas
      // Regla de Asedio: Los escorpiones y máquinas de asedio NO reciben herrería de flechas en Genie Engine
      const canReceivePierceSmithing = !isSiegeUnit && (isShip
        ? (navalCat === 'ARROW_SHIP')
        : (!isGunpowderUnit(combatant) && (combatant.Range > 0 || hasAttackClass(combatant, CLASSES.PIERCE))));

      if (canReceivePierceSmithing) {
        const pierceBonus = pierceLevel; // 1, 2, 3
        addAttackAmount(combatant, CLASSES.PIERCE, pierceBonus);

        // Herrería Flechas: +1 Atk / +1 Rango por nivel (+1 / +2 / +3 Rango)
        const canGainRange = (isShip && navalCat === 'ARROW_SHIP') ||
                             (!isShip && !isGunpowderUnit(combatant) && (hasArmourClass(combatant, CLASSES.ARCHER) || hasAttackClass(combatant, CLASSES.PIERCE)));
        if (canGainRange && combatant.Range > 0) {
          combatant.Range += pierceBonus;
        }
      }
    }

    // 3.3. Armaduras de Herrería (Infantería, Caballería y Arqueros Clase 15):
    // Nivel 1 (+1/+1), Nivel 2 (+2/+2), Nivel 3 (+3/+4)
    // REGLA DEFINITIVA: Ningún navío ni máquina de asedio/escorpión recibe armadura de la herrería.
    if (!isShip && !isSiegeUnit) {
      const isArch = hasArmourClass(combatant, CLASSES.ARCHER);
      const isInf = isInfantryUnit(combatant);
      const isCav = hasArmourClass(combatant, CLASSES.CAVALRY) ||
                    hasArmourClass(combatant, CLASSES.CAMEL) ||
                    hasArmourClass(combatant, CLASSES.WAR_ELEPHANT);

      let rawArmorLevel = 0;
      if (isArch && options.archerArmorUpgrade !== undefined) {
        // 1. Selector de Armadura de Arqueros (IDs 211, 212, 219) para unidades con Clase 15
        rawArmorLevel = Number(options.archerArmorUpgrade || 0);
      } else if (isInf && options.infantryArmorUpgrade !== undefined) {
        rawArmorLevel = Number(options.infantryArmorUpgrade || 0);
      } else if (isCav && !isArch && options.cavalryArmorUpgrade !== undefined) {
        rawArmorLevel = Number(options.cavalryArmorUpgrade || 0);
      } else if (options.armorUpgrade !== undefined) {
        rawArmorLevel = Number(options.armorUpgrade || 0);
      }

      const armorLevel = Math.min(3, Math.max(0, rawArmorLevel));
      if (armorLevel > 0) {
        let meleeArmorBonus = 0;
        let pierceArmorBonus = 0;

        if (armorLevel === 1) { meleeArmorBonus = 1; pierceArmorBonus = 1; }
        else if (armorLevel === 2) { meleeArmorBonus = 2; pierceArmorBonus = 2; }
        else if (armorLevel === 3) { meleeArmorBonus = 3; pierceArmorBonus = 4; }

        // Multiplicador de mejoras de armadura de infantería desde civ_bonuses.json (ej. Romanos x2)
        if (isInf && combatant._infArmorUpgradeMult) {
          meleeArmorBonus = Math.round(meleeArmorBonus * combatant._infArmorUpgradeMult);
          pierceArmorBonus = Math.round(pierceArmorBonus * combatant._infArmorUpgradeMult);
        }

        addArmourAmount(combatant, CLASSES.MELEE, meleeArmorBonus);
        addArmourAmount(combatant, CLASSES.PIERCE, pierceArmorBonus);
      }
    }

    if (!isShip) {
      // Pureza de sangre (ID 435 / 213): +20 HP a caballería (Varegos: +30 HP por bono pasivo de 50% de efectividad)
      if (options.bloodlines) {
        const isCavalry = hasArmourClass(combatant, CLASSES.CAVALRY) ||
                          hasArmourClass(combatant, CLASSES.CAMEL) ||
                          hasArmourClass(combatant, CLASSES.WAR_ELEPHANT) ||
                          hasArmourClass(combatant, 28);
        if (isCavalry) {
          const normCiv = String(civName || combatant.civName || combatant.civ || "").toLowerCase().trim();
          const isVarangian = ["varangian", "varangians", "varego", "varegos"].includes(normCiv);
          const baseBonus = isVarangian ? 30 : 20;
          const bloodlinesHP = combatant._bloodlinesMult ? Math.round(baseBonus * combatant._bloodlinesMult) : baseBonus;
          combatant.HP += bloodlinesHP;
          combatant.currentHP = combatant.HP;
          combatant.maxHP = combatant.HP;
        }
      }

      // Ganadería (Husbandry, ID 39): +10% velocidad si tiene armadura de Caballería (Clase 8)
      if (options.husbandry && hasArmourClass(combatant, CLASSES.CAVALRY)) {
        combatant.Speed = parseFloat((combatant.Speed * 1.10).toFixed(2));
      }

      // Escuderos (Squires, ID 215): +10% velocidad si tiene armadura de Infantería (Clase 11 o Clase 1)
      if (options.squires && isInfantryUnit(combatant)) {
        combatant.Speed = parseFloat((combatant.Speed * 1.10).toFixed(2));
      }

      // Gambesones (Gambesons, ID 875): +1 Pierce Armor a la línea de infantería elegible
      if (options.gambesons && isGambesonsUnit(combatant)) {
        combatant.PierceArmor = (combatant.PierceArmor || 0) + 1;
        const pArmour = combatant.Armours?.find(a => a.Class === CLASSES.PIERCE);
        if (pArmour) {
          pArmour.Amount += 1;
        } else if (Array.isArray(combatant.Armours)) {
          combatant.Armours.push({ Class: CLASSES.PIERCE, Amount: combatant.PierceArmor });
        }
      }

      // 2.1. Dactilera (Thumb Ring, ID 437):
      // NUNCA otorga daño de ataque (Attack / PierceAttack). Fija precisión en 100% y aplica escalado diferenciado de ReloadTime.
      if (options.thumbRing) {
        const isGunpowder = isGunpowderUnit(combatant);
        const isArambai = THUMB_RING_EXCLUDED_IDS.has(combatant.ID);
        const isEligibleArcher = hasArmourClass(combatant, CLASSES.ARCHER) || combatant.Range > 0 || hasAttackClass(combatant, CLASSES.PIERCE);

        if (!isGunpowder && !isArambai && isEligibleArcher) {
          combatant.Accuracy = 100;
          combatant.AccuracyPercent = 100;
          combatant.accuracy = 1.0;

          if (combatant.ID === 39 || combatant.ID === 474) {
            // Caso A (Arquero a caballo estándar - IDs 39 y 474): aceleración de +11% (de 2.00s pasa a 1.80s)
            combatant.ReloadTime = parseFloat((combatant.ReloadTime / 1.11).toFixed(2));
          } else if (SKIRMISHER_GENITOUR_SLINGER_IDS.has(combatant.ID)) {
            // Guerrilleros, Cenitres y Honderos: solo 100% precisión
            combatant.ReloadTime = parseFloat(combatant.ReloadTime.toFixed(2));
          } else if (isMountedCrossbowUnit(combatant) || combatant.ID === 2700 || combatant.ID === 2701) {
            // Ballestero montado y Ballestero montado pesado: reducción estándar de la línea de ballestas (+18% de cadencia)
            combatant.ReloadTime = parseFloat((combatant.ReloadTime / 1.18).toFixed(2));
          } else {
            // Caso B (Arquero a camello [1007, 1009], Mangudai [11, 561], Kipchak [1231, 1233],
            // Arqueros a pie [4, 24, 492] y unidades afines): aceleración de +18%
            // En unidades de 2.00s baja a 1.70s; en Mangudai baja de 1.68s a ~1.42s
            if (Math.abs(combatant.ReloadTime - 2.0) < 0.001) {
              combatant.ReloadTime = 1.70;
            } else {
              combatant.ReloadTime = parseFloat((combatant.ReloadTime / 1.18).toFixed(2));
            }
          }
        }
      }

      // 2.2. Táctica de los partos (Parthian Tactics, ID 436):
      // Aplica a Arqueros a caballo (poseen simultáneamente Clase 15 y Clase 8)
      if (options.parthianTactics && isCavalryArcherUnit(combatant)) {
        addArmourAmount(combatant, CLASSES.MELEE, 1);
        addArmourAmount(combatant, CLASSES.PIERCE, 2);
        // Suma +2 (o inserta { Amount: 2, Class: 27 }) contra la línea de lanceros (Clase 27)
        addAttackAmount(combatant, 27, 2);
        combatant.hasParthianTactics = true;
      }

      // 3. Cranequines (Cranequins, ID 1452):
      // Aplica a Ballesteros montados (+1 Range, +1 LineOfSight, +2 bonus vs Infantería Clase 11)
      if (options.cranequins && isMountedCrossbowUnit(combatant)) {
        combatant.Range = (combatant.Range || 0) + 1;
        combatant.LineOfSight = (combatant.LineOfSight || 0) + 1;

        const infBonusAtk = combatant.Attacks.find(a => a.Class === 11);
        if (infBonusAtk) {
          infBonusAtk.Amount += 2;
        } else {
          combatant.Attacks.push({ Amount: 2, Class: 11 });
        }
        combatant.hasCranequins = true;
      }

      // Química terrestre (Chemistry, ID 47)
      if (options.chemistry) {
        if (!isGunpowderUnit(combatant) && (combatant.Range > 0 || hasAttackClass(combatant, CLASSES.PIERCE))) {
          addAttackAmount(combatant, CLASSES.PIERCE, 1);
        }
      }
    } else {
      // =====================================================================
      // RAMA NAVAL DE LA UNIVERSIDAD (7 MEJORAS PARA BARCOS - CLASE 16)
      // =====================================================================

      // 1. Línea Defensiva de Casco (Armadura Pierce):
      // - Carenado (Careening, ID 374): +1 armadura antiproyectil
      if (options.careening) {
        addArmourAmount(combatant, CLASSES.PIERCE, 1);
        // - Dique seco (Dry Dock, ID 375): Requiere Carenado activo y suma +1 adicional (+2 Pierce total)
        if (options.dryDock) {
          addArmourAmount(combatant, CLASSES.PIERCE, 1);
        }
      }

      // 2. Línea de Navegación (Velocidad):
      // - Construcción con tingladillo (Clinker Construction, ID 908): +10% velocidad
      if (options.clinker) {
        combatant.Speed = parseFloat((combatant.Speed * 1.10).toFixed(2));
        // - Casco liso (Carvel Hull, ID 907 / 909): Requiere Tingladillo activo y añade +10% de velocidad acumulada adicional
        if (options.carvelHull) {
          combatant.Speed = parseFloat((combatant.Speed * 1.10).toFixed(2));
        }
      }

      // 3. Balística y Artillería:
      // - Balística (Ballistics, ID 93): Fija la puntería en 100% contra barcos en movimiento
      if (options.ballistics) {
        combatant.AccuracyPercent = 100;
        combatant.accuracy = 1.0;
        combatant.hasBallistics = true;
      }

      // - Química Naval (Chemistry, ID 47): Añade +1 de ataque Pierce si el barco dispara proyectiles perforantes
      //   (Galeras, Barcos Dragón, Carabelas, Drakkars, Thirisadai, etc.). Excluye barcos incendiarios y de demolición.
      if (options.navalChemistry || options.chemistry) {
        const isFireShipExclDragon = FIRE_SHIP_EXCL_DRAGON_IDS.has(combatant.ID);
        const isDemoShip = DEMO_SHIP_IDS.has(combatant.ID);
        const isDragonShip = combatant.ID === 1302;
        const firesPierceProjectiles = hasAttackClass(combatant, CLASSES.PIERCE) || isDragonShip || GALLEY_LINE_IDS.has(combatant.ID) || CARAVEL_LINE_IDS.has(combatant.ID) || LONGBOAT_LINE_IDS.has(combatant.ID);

        if (firesPierceProjectiles && !isFireShipExclDragon && !isDemoShip) {
          addAttackAmount(combatant, CLASSES.PIERCE, 1);
          // Para el Barco Dragón (cuyo ataque primario en data.json está en Clase 4), reflejar el +1 también en su ataque principal
          if (isDragonShip) {
            const meleeEntry = combatant.Attacks.find(a => a.Class === CLASSES.MELEE);
            if (meleeEntry) meleeEntry.Amount += 1;
          }
        }
      }

      // - Sifones / Incendiarias (ID 909 / 910): Aplica la bonificación de daño correspondiente a barcos incendiarios y dromones
      if (options.siphons || options.incendiaries) {
        if (FIRE_SHIP_IDS.has(combatant.ID)) {
          addAttackAmount(combatant, CLASSES.MELEE, 1);
          addAttackAmount(combatant, CLASSES.SHIP, 2);
          if (options.siphons) {
            combatant.MaxCharge = (combatant.MaxCharge || 0) + 15;
            combatant.currentCharge = combatant.MaxCharge;
            combatant.RechargeDuration = 20;
            combatant.isOffensiveCharge = true;
          }
        } else if (DROMON_IDS.has(combatant.ID)) {
          addAttackAmount(combatant, CLASSES.MELEE, 2);
          addAttackAmount(combatant, CLASSES.SHIP, 3);
        }
      }
    }

    // 3. Penetración nativa de Leitis
    if (LEITIS_IDS.has(combatant.ID)) {
      combatant.ignoresMeleeArmor = true;
    }

    // 4. Tecnologías Únicas Dinámicas (Coronas de Castillos e Imperial)
    applyUniqueTechBonuses(combatant, options);

    // 5. Sincronizar HP inicial al 100% tras todos los modificadores de vida (Pureza de sangre, bonos civ, coronas)
    combatant.currentHP = (options.currentHP !== undefined) ? Number(options.currentHP) : combatant.HP;
    combatant.maxHP = combatant.HP;

    // 6. Inicializar estado TTL para el Guardia del Templo (Muiscas)
    if (isTempleGuardUnit(combatant)) {
      combatant.isTempleGuard = true;
      combatant.baseReloadTime = combatant.ReloadTime;
      combatant.buffExpirations = [];
    }

    // 7. Sincronizar tasa de regeneración pasiva tras resolución de tecnologías y coronas
    combatant.regenRate = getUnitRegenRate(combatant, combatant.civName, combatant.age, options);
    combatant.regenPerMin = combatant.regenRate * 60;

    // 8. Sincronizar estado de Armadura Laminada (Lamellar Armor)
    if (hasLamellarArmor(combatant, combatant.civName, options)) {
      combatant.hasLamellarArmor = true;
    }

    // 9. Sincronizar perfil de veneno (Poison DoT)
    combatant.poisonProfile = getPoisonProfile(combatant, combatant.civName, options);

    // 10. Sincronizar perfil balístico (Carro de cohetes / Rocket Cart)
    combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, options);
    if (combatant.ballisticProfile && combatant.ballisticProfile.extraRange && !combatant._extraRangeBallisticsApplied) {
      combatant.Range += combatant.ballisticProfile.extraRange;
      combatant._extraRangeBallisticsApplied = true;
    }
  }

  /**
   * Evalúa si una Corona (Tecnología Única) tiene efecto directo sobre la unidad seleccionada en duelo 1v1.
   * Si no aplica a la unidad (p. ej. corona de arqueros teniendo un campeón, o corona económica/naval),
   * devuelve { applies: false, summary: '(Sin efecto sobre esta unidad)' }.
   */
  function checkUniqueTechRelevance(techId, unit) {
    if (!unit || !techId) {
      return { applies: false, summary: '(Sin efecto sobre esta unidad)' };
    }
    const tid = Number(techId);
    const uid = Number(unit.ID);

    switch (tid) {
      // Khitans - Corona de Castillos (Plata): Lamellar Armor (ID 1006)
      case 1006:
        if (hasLamellarArmor(unit, 'Khitans', { lamellarArmor: true })) {
          return { applies: true, summary: 'Refleja 25% del daño melee recibido' };
        }
        break;

      // Khitans - Corona de Imperial (Oro): Regeneración de Élite (ID 1007)
      case 1007:
        if (isMountedOrCamel(unit)) {
          return { applies: true, summary: 'Regeneración pasiva (150% HP máx/min)' };
        }
        break;

      // Berbers - Corona de Imperial (Oro): Camellos Magrebíes (ID 579 / 563)
      case 579:
      case 563:
        if (hasArmourClass(unit, CLASSES.CAMEL) || (unit.internal_name || unit.name || '').toLowerCase().includes('camel')) {
          return { applies: true, summary: 'Regeneración pasiva (15 HP/min)' };
        }
        break;

      // Vikings - Corona de Castillos (Plata): Caudillos (Chieftains, ID 463)
      case 463:
        if (isInfantryUnit(unit)) {
          return { applies: true, summary: '+5 ATQ vs caballería, +4 vs camellos' };
        }
        break;

      // Vikings - Corona de Imperial (Oro): Bogsveigar (ID 49)
      case 49:
        if ((FOOT_ARCHER_BOGSVEIGAR_IDS.has(uid) && !isInfantryUnit(unit) && !hasArmourClass(unit, CLASSES.CAVALRY)) || LONGBOAT_LINE_IDS.has(uid)) {
          return { applies: true, summary: LONGBOAT_LINE_IDS.has(uid) ? '+1 ATQ perforante a barcos dragón vikingos' : '+1 ATQ perforante a arqueros a pie' };
        }
        break;

      // Armenians - Corona de Castillos (Plata): Flota Cilicia (ID 922)
      case 922:
        if (GALLEY_LINE_IDS.has(uid) || DROMON_IDS.has(uid)) {
          return { applies: true, summary: '+1 alcance a galeras y dromones' };
        }
        break;

      // Byzantines - Corona de Castillos (Plata): Fuego Griego (ID 464)
      case 464:
        if (FIRE_SHIP_EXCL_DRAGON_IDS.has(uid)) {
          return { applies: true, summary: '+1 alcance a barcos incendiarios' };
        }
        break;

      // Koreans - Corona de Imperial (Oro): Shinkichon (ID 445)
      case 445:
        if ([831, 832].includes(uid) || isRocketCartUnit(unit)) {
          return { applies: true, summary: isRocketCartUnit(unit) ? '+1 alcance y ráfaga de 16 cohetes' : '+1 alcance a barcos tortuga' };
        }
        break;

      // Jurchens - Corona de Imperial (Oro): Bombas trueno (ID 997)
      case 997:
        if (isRocketCartUnit(unit)) {
          return { applies: true, summary: '+4 daño de impacto explosivo por cohete y explosión de 15 daño al morir' };
        }
        break;

      // Danes - Corona de Imperial (Oro): Furia Nórdica (ID 1483)
      case 1483:
        if ([280, 550, 588, 2633].includes(uid)) {
          return { applies: true, summary: '+1 alcance a mangoneles y galeones catapulta' };
        }
        break;

      // Aztecs - Corona de Castillos (Plata): Átlatl (ID 460)
      case 460:
        if ([6, 7, 1155].includes(uid)) {
          return { applies: true, summary: '+1 ATQ perforante y +1 alcance' };
        }
        break;

      // Aztecs - Corona de Imperial (Oro): Guerras Floridas (ID 24)
      case 24:
        if (isInfantryUnit(unit)) {
          return { applies: true, summary: '+4 ATQ cuerpo a cuerpo a infantería' };
        }
        break;

      // Dravidians - Corona de Imperial (Oro): Acero Wootz (ID 832)
      case 832:
        if (isInfantryUnit(unit) || hasArmourClass(unit, CLASSES.CAVALRY) || hasArmourClass(unit, CLASSES.CAMEL) || hasArmourClass(unit, CLASSES.WAR_ELEPHANT)) {
          return { applies: true, summary: 'Ataques ignoran armadura' };
        }
        break;

      // Armenians - Corona de Imperial (Oro): Relicario / Fereters (ID 921)
      case 921:
        if (isInfantryUnit(unit) && ![93, 358, 359].includes(uid)) {
          return { applies: true, summary: '+30 HP a infantería (exc. lanceros)' };
        }
        break;

      // Bengalis - Corona de Castillos (Plata): Paiks (ID 833)
      case 833:
        if (hasArmourClass(unit, CLASSES.WAR_ELEPHANT) || [1759, 1761].includes(uid)) {
          return { applies: true, summary: '+20% velocidad de ataque' };
        }
        break;

      // Bohemians - Corona de Castillos (Plata): Tácticas de fuerte de carretas (ID 784)
      case 784:
        if (isGunpowderUnit(unit)) {
          return { applies: true, summary: '+10% velocidad de movimiento' };
        }
        break;

      // Britons - Corona de Castillos (Plata): Yeomen (ID 3)
      case 3:
        if (hasArmourClass(unit, CLASSES.ARCHER) && !hasArmourClass(unit, CLASSES.CAVALRY) && !CAV_ARCHER_WAR_CHARIOT_IDS.has(uid) && !isGunpowderUnit(unit)) {
          return { applies: true, summary: '+1 alcance a arqueros a pie y guerrilleros' };
        }
        break;

      // Bulgarians - Corona de Castillos (Plata): Estribos (ID 685)
      case 685:
        if (hasArmourClass(unit, CLASSES.CAVALRY)) {
          return { applies: true, summary: '+33% velocidad de ataque en caballería' };
        }
        break;

      // Bulgarians - Corona de Imperial (Oro): Bagains (ID 686)
      case 686:
        if ([74, 75, 77, 473, 567].includes(uid)) {
          return { applies: true, summary: '+5 armadura cuerpo a cuerpo' };
        }
        break;

      // Burmese - Corona de Castillos (Plata): Howdah (ID 626)
      case 626:
        if (hasArmourClass(unit, CLASSES.WAR_ELEPHANT)) {
          return { applies: true, summary: '+1/+1 armadura a elefantes' };
        }
        break;

      // Burmese - Corona de Imperial (Oro): Caballería manipur (ID 627)
      case 627:
        if (hasArmourClass(unit, CLASSES.CAVALRY) || hasArmourClass(unit, CLASSES.WAR_ELEPHANT)) {
          return { applies: true, summary: '+4 ATQ vs arqueros (Clase 15)' };
        }
        break;

      // Celts - Corona de Imperial (Oro): Furor celta (ID 5)
      case 5:
        if (hasArmourClass(unit, CLASSES.SIEGE) || hasArmourClass(unit, CLASSES.SIEGE_ALT)) {
          return { applies: true, summary: '+40% HP a armas de asedio' };
        }
        break;

      // Chinese - Corona de Imperial (Oro): Cohetería (ID 52)
      // Rework actual: +25% de ataque a Escorpiones, Carros de cohetes y Lou Chuan. EXCLUYE Chu Ko Nu.
      case 52:
        if ([279, 542, 1904, 1907, 1948].includes(uid) || isRocketCartUnit(unit) || (unit && (unit.internal_name === 'SCBAL' || unit.internal_name === 'HWBAL'))) {
          return { applies: true, summary: '+25% de ataque' };
        }
        break;

      // Gurjaras - Corona de Imperial (Oro): Guardas fronterizos (ID 836)
      case 836:
        if (hasArmourClass(unit, CLASSES.CAMEL) || [873, 875].includes(uid)) {
          return { applies: true, summary: '+4 armadura cuerpo a cuerpo' };
        }
        break;

      // Hindustanis - Corona de Imperial (Oro): Shatagni (ID 507)
      case 507:
        if (uid === 5) {
          return { applies: true, summary: '+2 alcance a artilleros manuales' };
        }
        break;

      // Incas - Corona de Castillos (Plata): Hondero andino (ID 516)
      case 516:
        if ([6, 7, 185, 1155].includes(uid)) {
          return { applies: true, summary: uid === 185 ? '+1 ATQ y sin alcance mínimo' : 'Sin alcance mínimo' };
        }
        break;

      // Incas - Corona de Imperial (Oro): Escudos de tela (ID 517)
      case 517:
        if ([185, 751, 752, 753, 879, 881, 2586, 2587, 2588].includes(uid)) {
          return { applies: true, summary: '+1/+2 armadura' };
        }
        break;

      // Khmer - Corona de Castillos (Plata): Colmillos de acero (ID 622)
      case 622:
        if (hasArmourClass(unit, CLASSES.WAR_ELEPHANT)) {
          return { applies: true, summary: '+3 ATQ cuerpo a cuerpo' };
        }
        break;

      // Khmer - Corona de Imperial (Oro): Doble ballesta (ID 623)
      case 623:
        if ([279, 542, 1120, 1122].includes(uid) || (unit.internal_name || unit.name || '').toLowerCase().includes('scorpion') || (unit.internal_name || unit.name || '').toLowerCase().includes('ballista')) {
          return { applies: true, summary: 'Doble ballesta: dispara un segundo proyectil adicional' };
        }
        break;

      // Lithuanians - Corona de Imperial (Oro): Escudos rectangulares (ID 692)
      case 692:
        if ([6, 7, 93, 358, 359, 1155].includes(uid)) {
          return { applies: true, summary: '+2 armadura antiperforación' };
        }
        break;

      // Magyars - Corona de Imperial (Oro): Arco recurvo (ID 515)
      case 515:
        if ([39, 474].includes(uid)) {
          return { applies: true, summary: '+1 ATQ y +1 alcance' };
        }
        break;

      // Malians - Corona de Imperial (Oro): Farimba (ID 577)
      case 577:
        if ((hasArmourClass(unit, CLASSES.CAVALRY) || hasArmourClass(unit, CLASSES.CAMEL)) && (unit.Range || 0) <= 1) {
          return { applies: true, summary: '+5 ATQ cuerpo a cuerpo a caballería' };
        }
        break;

      // Mayans - Corona de Castillos (Plata): Hul'che (ID 485)
      case 485:
        if ([6, 7, 1155].includes(uid) || (unit.internal_name || unit.name || '').toLowerCase().includes('skirmisher') || (unit.localizedName || '').toLowerCase().includes('guerrillero')) {
          return { applies: true, summary: "Hul'che: dispara un segundo proyectil (+1 daño)" };
        }
        break;

      // Mayans - Corona de Imperial (Oro): Holcanes (ID 4)
      case 4:
        if ([751, 752, 753].includes(uid)) {
          return { applies: true, summary: '+40 HP a guerreros águila' };
        }
        break;

      // Mongols - Corona de Imperial (Oro): Instrucción militar (ID 6)
      case 6:
        if (hasArmourClass(unit, CLASSES.SIEGE) || hasArmourClass(unit, CLASSES.SIEGE_ALT)) {
          return { applies: true, summary: '+50% velocidad de movimiento' };
        }
        break;

      // Muisca - Corona de Castillos (Plata): Herbología (ID 1365)
      case 1365:
        if ([4, 24, 492, 2586, 2587, 2588].includes(uid)) {
          return { applies: true, summary: '+15% velocidad de movimiento' };
        }
        break;

      // Muisca - Corona de Imperial (Oro): Huaracas (ID 1366)
      case 1366:
        if (uid === 185) {
          return { applies: true, summary: '+1 alcance a honderos' };
        }
        break;

      // Romans - Corona de Castillos (Plata): Balistas (ID 883)
      case 883:
        if ([279, 542].includes(uid) || GALLEY_LINE_IDS.has(uid)) {
          return { applies: true, summary: GALLEY_LINE_IDS.has(uid) ? '+2 ATQ perforante a galeras' : '+33% velocidad de ataque a escorpiones' };
        }
        break;

      // Romans - Corona de Imperial (Oro): Comitatenses (ID 884)
      case 884:
        if (SWORD_INFANTRY_IDS.has(uid) || [38, 283, 569, 1790, 1792].includes(uid)) {
          return { applies: true, summary: '+5 ataque de carga (20s recarga)' };
        }
        break;

      // Sicilians - Corona de Imperial (Oro): Cota de malla / Hauberk (ID 757)
      case 757:
        if ([38, 283, 569].includes(uid)) {
          return { applies: true, summary: '+1/+2 armadura a línea de caballeros' };
        }
        break;

      // Spanish - Corona de Imperial (Oro): Supremacía (ID 440)
      case 440:
        if (uid === 83) {
          return { applies: true, summary: '+40 HP, +6 ATQ y +2/+2 armadura' };
        }
        break;

      // Tatars - Corona de Castillos (Plata): Armadura de seda (ID 687)
      case 687:
        if ([448, 546, 441, 1370, 1372, 39, 474].includes(uid)) {
          return { applies: true, summary: '+1/+1 armadura' };
        }
        break;

      // Teutons - Corona de Castillos (Plata): Blindaje / Ironclad (ID 489)
      case 489:
        if (hasArmourClass(unit, CLASSES.SIEGE) || hasArmourClass(unit, CLASSES.SIEGE_ALT)) {
          return { applies: true, summary: '+4 armadura cuerpo a cuerpo' };
        }
        break;

      // Tupi - Corona de Castillos (Plata): Caciques (ID 1392)
      case 1392:
        if ([185, 2586, 2587, 2588].includes(uid)) {
          return { applies: true, summary: '+25% velocidad de ataque' };
        }
        break;

      // Shu - Corona de Imperial (Oro): Cargador (ID 1069)
      case 1069:
        if (uid === 492 || [4, 24, 492].includes(uid) || (unit.internal_name || unit.name || '').toLowerCase().includes('arbalest') || (unit.internal_name || unit.name || '').toLowerCase().includes('arbalesta') || (unit.internal_name || unit.name || '').toLowerCase().includes('acoar')) {
          return { applies: true, summary: 'Ráfaga de 3 proyectiles (+2 secundarios de 1 ATQ)' };
        }
        if ([1948, 1962].includes(uid)) {
          return { applies: true, summary: '+2 proyectiles adicionales' };
        }
        break;

      // Tupi - Corona de Imperial (Oro): Curare (ID 1393)
      case 1393:
        if (uid === 492 || (unit.internal_name || unit.name || '').toLowerCase().includes('arbalest') || (unit.internal_name || unit.name || '').toLowerCase().includes('arbalesta') || (unit.internal_name || unit.name || '').toLowerCase().includes('acoar')) {
          return { applies: true, summary: 'Veneno DoT (5 HP en 15s)' };
        }
        if ([2579, 2581].includes(uid) || (unit.internal_name || unit.name || '').toLowerCase().includes('blackwood') || (unit.internal_name || unit.name || '').toLowerCase().includes('blckwood')) {
          return { applies: true, summary: 'Veneno DoT (2 HP en 15s)' };
        }
        break;

      // Turks - Corona de Castillos (Plata): Sipahi (ID 491)
      case 491:
        if ([39, 474, 1007, 1009, 1010, 1012].includes(uid)) {
          return { applies: true, summary: '+20 HP a arqueros montados' };
        }
        break;

      // Turks - Corona de Imperial (Oro): Artillería (ID 10)
      case 10:
        if ([36, 1709, 420, 691].includes(uid)) {
          return { applies: true, summary: '+2 alcance a cañones y galeones artillados' };
        }
        break;

      // Vietnamese - Corona de Castillos (Plata): Chatras (ID 628)
      case 628:
        if (hasArmourClass(unit, CLASSES.WAR_ELEPHANT)) {
          return { applies: true, summary: '+100 HP a elefantes de combate' };
        }
        break;

      // Wei - Corona de Imperial (Oro): Armadura de Ming Guang (ID 1062)
      case 1062:
        if (hasArmourClass(unit, CLASSES.CAVALRY) || hasArmourClass(unit, CLASSES.CAMEL) || hasArmourClass(unit, CLASSES.WAR_ELEPHANT)) {
          return { applies: true, summary: '+4 armadura cuerpo a cuerpo a caballería' };
        }
        break;

      default:
        break;
    }

    return { applies: false, summary: '(Sin efecto sobre esta unidad)' };
  }

  /**
   * Aplica las Coronas (Tecnologías Únicas de Castillos e Imperial) activas.
   * Si la corona activa no tiene efecto sobre la unidad seleccionada, no altera ninguna estadística.
   */
  function applyUniqueTechBonuses(combatant, options) {
    const activeTechs = new Set(Array.isArray(options.activeUniqueTechs) ? options.activeUniqueTechs.map(Number) : []);
    const civTechs = resolveCivUniqueTechs(combatant.civ, options.gameData);

    if (civTechs) {
      if (options.castleCrown && civTechs.castle) activeTechs.add(Number(civTechs.castle));
      if (options.imperialCrown && civTechs.imperial) activeTechs.add(Number(civTechs.imperial));
    }

    // Retrocompatibilidad directa con flags booleanos de coronas
    if (options.hasWootzSteel) {
      activeTechs.add(832);
    }
    if (options.rocketry || options.coheteria || options.chineseCrown) {
      activeTechs.add(52);
    }
    if (options.shinkichon || options.koreanCrown) {
      activeTechs.add(445);
    }
    if (options.thunderclapBombs || options.bombasTrueno || options.jurchenCrown) {
      activeTechs.add(997);
    }
    if (options.boltMagazine || options.cargador || options.shuCrown) {
      activeTechs.add(1069);
    }

    if (activeTechs.size === 0) return;

    // Filtrar estrictamente solo las coronas relevantes para la unidad seleccionada
    const relevantTechs = new Set();
    for (const tid of activeTechs) {
      if (checkUniqueTechRelevance(tid, combatant).applies || (tid === 832 && options.hasWootzSteel)) {
        relevantTechs.add(tid);
      }
    }

    if (relevantTechs.size === 0) return;

    // Khitans - 1006 (Corona de Castillos - Plata): Lamellar Armor
    if (relevantTechs.has(1006) || options.lamellarArmor) {
      if (hasLamellarArmor(combatant, combatant.civName, { ...options, lamellarArmor: true })) {
        combatant.hasLamellarArmor = true;
      }
    }

    // Khitans - 1007 (Corona de Imperial - Oro): Regeneración de Élite
    if (relevantTechs.has(1007) || options.khitanGoldCrown) {
      if (isMountedOrCamel(combatant)) {
        combatant.hasKhitanRegen = true;
      }
    }

    // Berbers - 579 / 563 (Corona de Imperial - Oro): Camellos Magrebíes
    if (relevantTechs.has(579) || relevantTechs.has(563)) {
      combatant.hasMaghrebiCamels = true;
    }

    // Vikings - 463 (Corona de Castillos - Plata): Caudillos (Chieftains)
    if (relevantTechs.has(463)) {
      addAttackAmount(combatant, CLASSES.CAVALRY, 5);
      addAttackAmount(combatant, CLASSES.CAMEL, 4);
    }

    // Vikings - 49 (Corona de Imperial - Oro): Bogsveigar
    if (relevantTechs.has(49)) {
      addAttackAmount(combatant, CLASSES.PIERCE, 1);
    }

    // Armenians - 922: Flota Cilicia (+1 rango galeras y dromones)
    if (relevantTechs.has(922)) {
      combatant.Range += 1;
    }

    // Byzantines - 464: Fuego Griego (+1 rango barcos incendiarios)
    if (relevantTechs.has(464)) {
      combatant.Range += 1;
    }

    // Koreans - 445: Shinkichon (+1 rango barcos tortuga y Carro de cohetes [16 cohetes])
    if (relevantTechs.has(445) || options.shinkichon || options.koreanCrown) {
      if (isRocketCartUnit(combatant)) {
        combatant.hasShinkichon = true;
        combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, { ...options, shinkichon: true, imperialCrown: true });
        if (!combatant._extraRangeBallisticsApplied && combatant.ballisticProfile?.extraRange) {
          combatant.Range += combatant.ballisticProfile.extraRange;
          combatant._extraRangeBallisticsApplied = true;
        }
      } else {
        combatant.Range += 1;
      }
    }

    // Jurchens - 997: Bombas trueno (Carro de cohetes +4 daño explosivo y explosión mortal de 15 daño)
    if (relevantTechs.has(997) || options.thunderclapBombs || options.bombasTrueno || (options.jurchenCrown && isRocketCartUnit(combatant))) {
      combatant.hasThunderclapBombs = true;
      combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, { ...options, thunderclapBombs: true, imperialCrown: true });
    }

    // Danes - 1483: Furia Nórdica (+1 rango mangoneles y galeones catapulta)
    if (relevantTechs.has(1483)) {
      combatant.Range += 1;
    }

    // Aztecs - 460: Átlatl (+1 ataque perforante y +1 rango a guerrilleros)
    if (relevantTechs.has(460)) {
      addAttackAmount(combatant, CLASSES.PIERCE, 1);
      combatant.Range += 1;
    }

    // Aztecs - 24: Guerras Floridas / Garland Wars (+4 ataque cuerpo a cuerpo a infantería)
    if (relevantTechs.has(24)) {
      addAttackAmount(combatant, CLASSES.MELEE, 4);
    }

    // Dravidians - 832: Acero Wootz (Infantería y caballería ignoran armadura)
    if (relevantTechs.has(832)) {
      combatant.ignoresAllArmor = true;
    }

    // Armenians - 921: Relicario (+30 HP a infantería excepto lanceros)
    if (relevantTechs.has(921)) {
      combatant.HP += 30;
      combatant.currentHP = combatant.HP;
      combatant.maxHP = combatant.HP;
    }

    // Bengalis - 833: Paiks (Rathas y elefantes atacan 20% más rápido)
    if (relevantTechs.has(833)) {
      combatant.ReloadTime = combatant.ReloadTime / 1.20;
    }

    // Bohemians - 784: Tácticas de fuerte de carretas (Pólvora +10% velocidad)
    if (relevantTechs.has(784)) {
      combatant.Speed = combatant.Speed * 1.10;
    }

    // Britons - 3: Yeomen (+1 alcance arqueros a pie y guerrilleros)
    if (relevantTechs.has(3)) {
      combatant.Range += 1;
    }

    // Bulgarians - 685: Estribos (Caballería ataca 33% más rápido)
    if (relevantTechs.has(685)) {
      combatant.ReloadTime = combatant.ReloadTime / 1.33;
    }

    // Bulgarians - 686: Bagains (Línea de milicia +5 armadura melee)
    if (relevantTechs.has(686)) {
      addArmourAmount(combatant, CLASSES.MELEE, 5);
    }

    // Burmese - 626: Howdah (Elefantes +1/+1 armadura)
    if (relevantTechs.has(626)) {
      addArmourAmount(combatant, CLASSES.MELEE, 1);
      addArmourAmount(combatant, CLASSES.PIERCE, 1);
    }

    // Burmese - 627: Caballería manipur (+4 ataque contra arqueros Clase 15)
    if (relevantTechs.has(627)) {
      addAttackAmount(combatant, CLASSES.ARCHER, 4);
    }

    // Celts - 5: Furor celta (+40% HP armas de asedio)
    if (relevantTechs.has(5)) {
      combatant.HP += Math.round(combatant.baseHP * 0.40);
      combatant.currentHP = combatant.HP;
      combatant.maxHP = combatant.HP;
    }

    // Chinese - 52: Cohetería (+25% ataque a Escorpiones, Carro de cohetes y Lou Chuan; EXCLUYE Chu Ko Nu)
    if (relevantTechs.has(52) || options.rocketry || options.coheteria || (options.chineseCrown && ([279, 542, 1904, 1907, 1948].includes(combatant.ID) || isRocketCartUnit(combatant)))) {
      const isScorp = [279, 542].includes(combatant.ID) || (combatant.internal_name && ['SCBAL', 'HWBAL'].includes(combatant.internal_name));
      const isRocketCart = [1904, 1907].includes(combatant.ID) || isRocketCartUnit(combatant);

      if (isScorp) {
        const bonusDmg = Math.round(combatant.baseAttack * 0.25);
        addAttackAmount(combatant, CLASSES.PIERCE, bonusDmg);
      } else if (isRocketCart) {
        combatant.hasRocketry = true;
        const bonusDmg = Math.round(combatant.baseAttack * 0.25);
        addAttackAmount(combatant, CLASSES.MELEE, bonusDmg);
      } else if (combatant.ID === 1948) {
        addAttackAmount(combatant, CLASSES.MELEE, Math.round(combatant.baseAttack * 0.25));
      }
    }

    // Gurjaras - 836: Guardas fronterizos (Camellos y arqueros en elefante +4 armadura melee)
    if (relevantTechs.has(836)) {
      addArmourAmount(combatant, CLASSES.MELEE, 4);
    }

    // Hindustanis - 507: Shatagni (+2 rango artilleros manuales)
    if (relevantTechs.has(507)) {
      combatant.Range += 2;
    }

    // Incas - 516: Hondero andino (+1 ataque honderos, 0 rango mínimo)
    if (relevantTechs.has(516)) {
      combatant.MinRange = 0;
      if (combatant.ID === 185) addAttackAmount(combatant, CLASSES.PIERCE, 1);
    }

    // Incas - 517: Escudos de tela (+1/+2 armadura a Kamayuks, Honderos y Águilas)
    if (relevantTechs.has(517)) {
      addArmourAmount(combatant, CLASSES.MELEE, 1);
      addArmourAmount(combatant, CLASSES.PIERCE, 2);
    }

    // Khmer - 622: Colmillos de acero (+3 ataque melee elefantes)
    if (relevantTechs.has(622)) {
      addAttackAmount(combatant, CLASSES.MELEE, 3);
    }

    // Khmer - 623: Doble ballesta (Dispara un proyectil adicional)
    if (relevantTechs.has(623) || options.doubleCrossbow) {
      combatant.hasDoubleCrossbow = true;
      combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, { ...options, doubleCrossbow: true, imperialCrown: true });
    }

    // Lithuanians - 692: Escudos rectangulares (+2 armadura pierce a lanceros y guerrilleros)
    if (relevantTechs.has(692)) {
      addArmourAmount(combatant, CLASSES.PIERCE, 2);
    }

    // Magyars - 515: Arco recurvo (+1 ataque y +1 rango a arqueros a caballo)
    if (relevantTechs.has(515)) {
      addAttackAmount(combatant, CLASSES.PIERCE, 1);
      combatant.Range += 1;
    }

    // Malians - 577: Farimba (+5 ataque melee a caballería)
    if (relevantTechs.has(577)) {
      addAttackAmount(combatant, CLASSES.MELEE, 5);
    }

    // Mayans - 485: Hul'che (Guerrilleros disparan un segundo proyectil)
    if (relevantTechs.has(485) || options.hulche) {
      combatant.hasHulche = true;
      combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, { ...options, hulche: true, castleCrown: true });
    }

    // Mayans - 4: Holcanes / El Dorado (+40 HP guerreros águila)
    if (relevantTechs.has(4)) {
      combatant.HP += 40;
      combatant.currentHP = combatant.HP;
      combatant.maxHP = combatant.HP;
    }

    // Mongols - 6: Instrucción militar (+50% velocidad asedio)
    if (relevantTechs.has(6)) {
      combatant.Speed = combatant.Speed * 1.50;
    }

    // Muisca - 1365: Herbología (+15% velocidad arqueros a pie y guerreros champi)
    if (relevantTechs.has(1365)) {
      combatant.Speed = combatant.Speed * 1.15;
    }

    // Muisca - 1366: Huaracas (+1 alcance honderos)
    if (relevantTechs.has(1366)) {
      combatant.Range += 1;
    }

    // Shu - 1069: Cargador / Bolt Magazine (Arbalesta del Shu dispara 2 proyectiles adicionales de 1 ATQ)
    if (relevantTechs.has(1069) || options.boltMagazine || options.cargador || (options.shuCrown && (combatant.ID === 492 || [4, 24, 492].includes(combatant.ID)))) {
      combatant.hasBoltMagazine = true;
      combatant.ballisticProfile = getBallisticProfile(combatant, combatant.civName, { ...options, boltMagazine: true, imperialCrown: true });
    }

    // Romans - 883: Balistas (Escorpiones atacan 33% más rápido; Galeras +2 ataque)
    if (relevantTechs.has(883)) {
      if (GALLEY_LINE_IDS.has(combatant.ID)) {
        addAttackAmount(combatant, CLASSES.PIERCE, 2);
      } else {
        combatant.ReloadTime = combatant.ReloadTime / 1.33;
      }
    }

    // Romans - 884: Comitatenses (+5 ataque de carga para milicia, caballeros y centuriones)
    if (relevantTechs.has(884)) {
      combatant.MaxCharge = 5;
      combatant.currentCharge = 5;
      combatant.RechargeDuration = 20;
      combatant.isOffensiveCharge = true;
    }

    // Sicilians - 757: Cota de malla (+1/+2 armadura línea de caballeros)
    if (relevantTechs.has(757)) {
      addArmourAmount(combatant, CLASSES.MELEE, 1);
      addArmourAmount(combatant, CLASSES.PIERCE, 2);
    }

    // Spanish - 440: Supremacía (+40 HP, +6 ataque, +2/+2 armadura a aldeanos)
    if (relevantTechs.has(440)) {
      combatant.HP += 40;
      combatant.currentHP = combatant.HP;
      combatant.maxHP = combatant.HP;
      addAttackAmount(combatant, CLASSES.MELEE, 6);
      addArmourAmount(combatant, CLASSES.MELEE, 2);
      addArmourAmount(combatant, CLASSES.PIERCE, 2);
    }

    // Tatars - 687: Armadura de seda (+1/+1 armadura caballería ligera, lanceros esteparios y arqueros a caballo)
    if (relevantTechs.has(687)) {
      addArmourAmount(combatant, CLASSES.MELEE, 1);
      addArmourAmount(combatant, CLASSES.PIERCE, 1);
    }

    // Teutons - 489: Blindaje (+4 armadura melee a asedio)
    if (relevantTechs.has(489)) {
      addArmourAmount(combatant, CLASSES.MELEE, 4);
    }

    // Tupi - 1392: Caciques (+25% velocidad de ataque champis y honderos)
    if (relevantTechs.has(1392)) {
      combatant.ReloadTime = combatant.ReloadTime / 1.25;
    }

    // Tupi - 1393: Curare (Veneno DoT para arqueros a pie)
    if (relevantTechs.has(1393) || options.tupiGoldCrown || options.curare) {
      combatant.hasCurare = true;
      const poison = getPoisonProfile(combatant, combatant.civName, { ...options, tupiGoldCrown: true });
      if (poison) {
        combatant.poisonProfile = poison;
      }
    }

    // Turks - 491: Sipahi (+20 HP arqueros montados)
    if (relevantTechs.has(491)) {
      combatant.HP += 20;
      combatant.currentHP = combatant.HP;
      combatant.maxHP = combatant.HP;
    }

    // Turks - 10: Artillería (+2 rango cañones de asedio y galeones artillados)
    if (relevantTechs.has(10)) {
      combatant.Range += 2;
    }

    // Vietnamese - 628: Chatras (+100 HP elefantes de combate)
    if (relevantTechs.has(628)) {
      combatant.HP += 100;
      combatant.currentHP = combatant.HP;
      combatant.maxHP = combatant.HP;
    }

    // Wei - 1062: Armadura de Ming Guang (+4 armadura melee a caballería)
    if (relevantTechs.has(1062)) {
      addArmourAmount(combatant, CLASSES.MELEE, 4);
    }
  }

  /**
   * 2. CONSUMO DINÁMICO DE data/civ_bonuses.json POR EDAD
   * Procesa programáticamente las bonificaciones de civ_bonuses[combatant.civName] || []
   * filtrando por selectedAge >= bonus.minAge y aplicando escalado por edad sobre la unidad clonada.
   */
  const AGE_STR_TO_NUM = {
    dark: 1,
    feudal: 2,
    castle: 3,
    imperial: 4
  };

  function doesUnitMatchSlugList(unit, slugList) {
    if (!Array.isArray(slugList) || slugList.length === 0) return false;
    const uid = Number(unit.ID);
    const uname = String(unit.internal_name || '').toLowerCase();
    for (const item of slugList) {
      if (typeof item === 'number' && item === uid) return true;
      const normSlug = String(item).toLowerCase();
      if (Number(normSlug) === uid) return true;
      if (uname === normSlug) return true;
      const mappedIds = UNIT_SLUG_TO_IDS[normSlug];
      if (mappedIds && mappedIds.includes(uid)) return true;
    }
    return false;
  }

  function doesUnitMatchTargetClass(unit, targetClass) {
    const c = Number(targetClass);
    if (c === 11) return isInfantryUnit(unit);
    if (c === 19) return isGunpowderUnit(unit);
    if (c === 13) return hasArmourClass(unit, CLASSES.SIEGE) || hasArmourClass(unit, CLASSES.SIEGE_ALT);
    if (c === 16) return isShipUnit(unit);
    if (c === 8) return hasArmourClass(unit, CLASSES.CAVALRY) || hasArmourClass(unit, CLASSES.CAMEL) || hasArmourClass(unit, CLASSES.WAR_ELEPHANT);
    return hasArmourClass(unit, c);
  }

  function resolveBonusMinAge(bonus) {
    if (bonus.minAge !== undefined) return Number(bonus.minAge);
    if (bonus.min_age !== undefined) {
      return AGE_STR_TO_NUM[String(bonus.min_age).toLowerCase()] || Number(bonus.min_age) || 1;
    }
    if (bonus.age_values && !Array.isArray(bonus.age_values)) {
      if (bonus.age_values.dark !== undefined) return 1;
      if (bonus.age_values.feudal !== undefined) return 2;
      if (bonus.age_values.castle !== undefined) return 3;
      if (bonus.age_values.imperial !== undefined) return 4;
    }
    return 1;
  }

  function resolveBonusValueForAge(bonus, selectedAge, minAge) {
    // 1. Escalado por array de edades (ej. [dark, feudal, castle, imperial] o desde minAge)
    const arr = Array.isArray(bonus.age_values)
      ? bonus.age_values
      : (Array.isArray(bonus.values) ? bonus.values : null);
    if (arr && arr.length > 0) {
      const idx = arr.length === 4
        ? Math.min(3, Math.max(0, selectedAge - 1))
        : Math.min(arr.length - 1, Math.max(0, selectedAge - (minAge || 1)));
      return arr[idx];
    }

    // 2. Escalado por diccionario de edades { dark, feudal, castle, imperial }
    if (bonus.age_values && typeof bonus.age_values === 'object') {
      if (selectedAge >= 4 && bonus.age_values.imperial !== undefined) return bonus.age_values.imperial;
      if (selectedAge >= 3 && bonus.age_values.castle !== undefined) return bonus.age_values.castle;
      if (selectedAge >= 2 && bonus.age_values.feudal !== undefined) return bonus.age_values.feudal;
      if (selectedAge >= 1 && bonus.age_values.dark !== undefined) return bonus.age_values.dark;
      return null;
    }

    // 3. Escalado por delta / multiplicador por nivel de edad
    if (bonus.delta_per_age !== undefined || bonus.deltaPerAge !== undefined) {
      const delta = Number(bonus.delta_per_age !== undefined ? bonus.delta_per_age : bonus.deltaPerAge);
      const baseVal = Number(bonus.value || 0);
      const ageSteps = Math.max(0, selectedAge - (minAge || 1));
      return baseVal + (ageSteps * delta);
    }

    return bonus.value;
  }

  function applyCivBonusesFromJson(combatant, civBonusesMap, options = {}) {
    if (!combatant || !civBonusesMap) return;
    const civName = combatant.civName || combatant.civ || options.civ;
    if (!civName || civName === 'Generic') return;

    const lowerCiv = String(civName).toLowerCase().trim();
    const isJurchen = ["yurchen", "jurchen", "jurchens"].includes(lowerCiv);

    let bonusesList = civBonusesMap[civName];
    if (!bonusesList || !Array.isArray(bonusesList)) {
      if (isJurchen) {
        bonusesList = civBonusesMap['Jurchens'] || civBonusesMap['Yurchen'] || civBonusesMap['Yurchens'] || civBonusesMap['Jurchen'] || [];
      } else {
        const matchKey = Object.keys(civBonusesMap).find(k => k.toLowerCase().trim() === lowerCiv);
        if (matchKey) {
          bonusesList = civBonusesMap[matchKey];
        }
      }
    }
    if (!Array.isArray(bonusesList) || bonusesList.length === 0) return;

    const isShip = isShipUnit(combatant);
    const selectedAge = Number(options.selectedAge || options.age || combatant.age || 4);

    for (const bonus of bonusesList) {
      // Si es unidad terrestre y hasCivBonuses está explícitamente desactivado en un preset estricto, omitir
      if (!isShip && options.hasCivBonuses === false) {
        continue;
      }

      const minAge = resolveBonusMinAge(bonus);
      if (selectedAge < minAge) continue;

      // Comprobar exclusiones de unidad
      if (bonus.exclude_units && doesUnitMatchSlugList(combatant, bonus.exclude_units)) {
        continue;
      }

      // Comprobar si la unidad califica por sus clases en unit.Armours o su ID / internal_name
      let matches = false;
      if (bonus.include_units && doesUnitMatchSlugList(combatant, bonus.include_units)) {
        matches = true;
      } else if (bonus.target_units && doesUnitMatchSlugList(combatant, bonus.target_units)) {
        matches = true;
      } else if (Array.isArray(bonus.unitIds) && bonus.unitIds.map(Number).includes(Number(combatant.ID))) {
        matches = true;
      } else if (bonus.target_class !== undefined && doesUnitMatchTargetClass(combatant, bonus.target_class)) {
        matches = true;
      } else if (Array.isArray(bonus.target_classes) && bonus.target_classes.some(tc => doesUnitMatchTargetClass(combatant, tc))) {
        matches = true;
      } else if (isJurchen && (Number(combatant.ID) === 1901 || Number(combatant.ID) === 1903) && bonus.id === 'jurchens_mounted_attack_rate') {
        matches = true;
      }

      if (!matches) continue;

      const val = resolveBonusValueForAge(bonus, selectedAge, minAge);
      if (val === null || val === undefined) continue;

      switch (bonus.stat) {
        case 'hp_multiplier': {
          const delta = Math.round(combatant.baseHP * (Number(val) - 1));
          combatant.HP += delta;
          combatant.currentHP = combatant.HP;
          combatant.maxHP = combatant.HP;
          break;
        }
        case 'hp_add': {
          combatant.HP += Number(val);
          combatant.currentHP = combatant.HP;
          combatant.maxHP = combatant.HP;
          break;
        }
        case 'speed_multiplier': {
          combatant.Speed = parseFloat((combatant.Speed * Number(val)).toFixed(2));
          break;
        }
        case 'attack_rate_multiplier': {
          combatant.ReloadTime = combatant.ReloadTime / Number(val);
          break;
        }
        case 'range_add': {
          combatant.Range = (combatant.Range || 0) + Number(val);
          break;
        }
        case 'armor_add': {
          const armClass = Number(bonus.armor_class || CLASSES.MELEE);
          addArmourAmount(combatant, armClass, Number(val));
          break;
        }
        case 'attack_add': {
          const atkClass = Number(bonus.attack_class || CLASSES.MELEE);
          if (atkClass === CLASSES.MELEE) {
            const cleanAttacks = (combatant._rawUnitData && combatant._rawUnitData.Attacks) || [];
            const nativeMelee = cleanAttacks.find(a => a.Class === CLASSES.MELEE && a.Amount > 0);
            if (!nativeMelee) break;
          }
          addAttackAmount(combatant, atkClass, Number(val));
          break;
        }
        case 'attack_multiplier': {
          const mainAtk = combatant.Attacks.find(a => a.Class === CLASSES.PIERCE || a.Class === CLASSES.MELEE);
          if (mainAtk) {
            mainAtk.Amount = Math.round(mainAtk.Amount * Number(val));
          }
          combatant.Attack = Math.round(combatant.Attack * Number(val));
          break;
        }
        case 'bonus_attack_add': {
          if (Array.isArray(bonus.vs_units) || Array.isArray(bonus.exclude_target_units)) {
            if (!combatant._conditionalBonusAttacks) combatant._conditionalBonusAttacks = [];
            combatant._conditionalBonusAttacks.push({
              amount: Number(val),
              vsClass: bonus.vs_class !== undefined ? Number(bonus.vs_class) : null,
              vsUnits: bonus.vs_units || null,
              excludeTargetUnits: bonus.exclude_target_units || null
            });
          } else if (bonus.vs_class !== undefined) {
            addAttackAmount(combatant, Number(bonus.vs_class), Number(val));
          }
          break;
        }
        case 'bonus_damage_multiplier': {
          combatant._bonusDamageMult = Number(val);
          break;
        }
        case 'bonus_damage_reduction_multiplier': {
          combatant._bonusDamageReductionMult = Number(val);
          break;
        }
        case 'elevation_damage_multiplier': {
          combatant._elevationDamageMult = Number(val);
          break;
        }
        case 'elevation_damage_reduction_multiplier': {
          combatant._elevationDamageReductionMult = Number(val);
          break;
        }
        case 'melee_attack_upgrades_multiplier': {
          combatant._meleeUpgradeMult = Number(val);
          break;
        }
        case 'infantry_armor_upgrades_multiplier': {
          combatant._infArmorUpgradeMult = Number(val);
          break;
        }
        case 'accuracy_multiplier': {
          combatant.AccuracyPercent = Math.min(100, Math.round((combatant.AccuracyPercent || 50) * Number(val)));
          break;
        }
        case 'attack_add_per_relic': {
          combatant._relicAttackBonus = Number(val);
          break;
        }
        default:
          break;
      }
    }
  }

  // =========================================================================
  // SECCIÓN 4: FÓRMULA DE DAÑO POR GOLPE (calculateNetDamage)
  // =========================================================================

  /**
   * Calcula el daño neto impacto a impacto según las reglas del motor AoE2
   * Fórmula canónica: D = Math.max(1, Math.floor(H * A * SumaDañosClase))
   * 
   * @param {Object} attacker - Combatiente que ataca
   * @param {Object} defender - Combatiente receptor
   * @param {Object} options - Parámetros de contexto (elevación, charges, etc.)
   * @returns {number} Daño neto entero infligido
   */
  function calculateNetDamage(attacker, defender, options = {}) {
    if (!attacker || !defender) return 0;

    // 0. Balística especial: Carro de cohetes (Rocket Cart)
    if (isRocketCartUnit(attacker) || (attacker.ballisticProfile && attacker.ballisticProfile.isRocketCart)) {
      return calculateRocketCartDamage(attacker, defender, attacker.ballisticProfile, options);
    }

    const atkCivBonuses = Boolean(options.hasCivBonuses ?? (attacker.options && attacker.options.hasCivBonuses));
    const defCivBonuses = Boolean(options.hasCivBonuses ?? (defender.options && defender.options.hasCivBonuses));

    // 1. Elevación (H)
    let H = 1.0;
    const rawElevation = options.elevation || attacker.elevation || (attacker.options && attacker.options.elevation) || 'flat';

    if (rawElevation === 'high' || rawElevation === 'downhill') {
      const isTatar = (attacker.civ === 'Tatars' || attacker.civName === 'Tatars');
      H = attacker._elevationDamageMult
        ? attacker._elevationDamageMult
        : ((atkCivBonuses && isTatar) ? 1.50 : 1.25);
    } else if (rawElevation === 'low' || rawElevation === 'uphill') {
      H = 0.75;
      const isGeorgian = (defender.civ === 'Georgians' || defender.civName === 'Georgians');
      if (defender._elevationDamageReductionMult) {
        H = H * defender._elevationDamageReductionMult;
      } else if (defCivBonuses && isGeorgian) {
        H = H * 0.85;
      }
    } else {
      H = 1.0;
    }

    // 2. Precisión (A)
    let A = 1.0;
    const isMelee = (attacker.Range === undefined || attacker.Range <= 1);
    if (isMelee) {
      A = 1.0;
    } else if ((attacker.options.thumbRing || attacker.options.ballistics || attacker.hasBallistics) && attacker.AccuracyPercent === 100) {
      A = 1.0;
    } else {
      A = (attacker.AccuracyPercent !== undefined ? attacker.AccuracyPercent : 100) / 100;
    }

    // 3. Mapeo de Armaduras del Defensor
    const defenderArmours = {};
    for (const arm of (defender.Armours || [])) {
      defenderArmours[arm.Class] = arm.Amount;
    }

    const bProfile = attacker.ballisticProfile || (typeof getBallisticProfile === 'function' ? getBallisticProfile(attacker, attacker.civName || options.civName, options) : null);

    // Penetración de Armadura
    if (attacker.ignoresAllArmor) {
      // Acero Wootz: ignora armadura Melee (4) y Pierce (3)
      defenderArmours[CLASSES.MELEE] = 0;
      defenderArmours[CLASSES.PIERCE] = 0;
    } else if (attacker.ignoresMeleeArmor) {
      // Leitis: ignora armadura Melee (4)
      defenderArmours[CLASSES.MELEE] = 0;
    } else if (attacker.ignoresPierceArmor || (bProfile && bProfile.ignoresArmor && !bProfile.isRocketCart)) {
      // Arquero de arco compuesto (Composite Bowman): ignora 100% armadura antiproyectil (Pierce 3)
      defenderArmours[CLASSES.PIERCE] = 0;
    }

    // 4. Suma de Daños de Clase
    let SumaDañosClase = 0;
    const isDefenderSiege = hasArmourClass(defender, CLASSES.SIEGE) || hasArmourClass(defender, CLASSES.SIEGE_ALT);
    const isDefenderSicilian = (defCivBonuses && defender.civ === 'Sicilians');

    // Preparar array de ataques (incluyendo posible carga ofensiva temporal)
    let attacksToEvaluate = attacker.Attacks;
    if (options.offensiveChargeBonus && options.offensiveChargeBonus > 0) {
      attacksToEvaluate = attacksToEvaluate.map(atk => {
        if (atk.Class === CLASSES.MELEE) {
          return { Amount: atk.Amount + options.offensiveChargeBonus, Class: atk.Class };
        }
        return atk;
      });
    }

    for (const atk of attacksToEvaluate) {
      // En AoE2, el daño o bonus solo aplica si el defensor tiene registrada dicha clase
      // Excepción: si el atacante tiene Cranequines ({ Amount: 2, Class: 11 } vs Infantería) y el defensor
      // es Infantería en data.json (donde Infantería usa Class 1 y no tiene Class 11), evaluar contra Class 1
      let hasMatchingArmor = defenderArmours.hasOwnProperty(atk.Class);
      let armorVal = hasMatchingArmor ? defenderArmours[atk.Class] : 0;

      if (!hasMatchingArmor && atk.Class === 11 && attacker.hasCranequins && isInfantryUnit(defender)) {
        hasMatchingArmor = true;
        armorVal = defenderArmours.hasOwnProperty(1) ? defenderArmours[1] : 0;
      }

      if (hasMatchingArmor) {
        let diff = Math.max(0, atk.Amount - armorVal);

        if (atk.Class !== CLASSES.PIERCE && atk.Class !== CLASSES.MELEE) {
          // Multiplicador de daño bonus del atacante (ej. Bohemios +25%, Gurjaras +20/30/40%)
          if (attacker._bonusDamageMult) {
            diff = diff * attacker._bonusDamageMult;
          }

          // Reducción de daño bonus del defensor (ej. Sicilianos -40%, Bengalíes -25%)
          if (defender._bonusDamageReductionMult && !isDefenderSiege) {
            diff = diff * defender._bonusDamageReductionMult;
          } else if (isDefenderSicilian && !isDefenderSiege) {
            diff = diff * 0.60;
          }
        }

        SumaDañosClase += diff;
      }
    }

    // Evaluar bonus de ataque condicionales desde civ_bonuses.json (vs_units / exclude_target_units)
    if (Array.isArray(attacker._conditionalBonusAttacks)) {
      for (const cond of attacker._conditionalBonusAttacks) {
        if (cond.excludeTargetUnits && doesUnitMatchSlugList(defender, cond.excludeTargetUnits)) {
          continue;
        }
        const matchesVsUnits = cond.vsUnits && doesUnitMatchSlugList(defender, cond.vsUnits);
        const matchesVsClass = cond.vsClass !== null && doesUnitMatchTargetClass(defender, cond.vsClass);
        if (matchesVsUnits || matchesVsClass) {
          let condDiff = cond.amount;
          if (attacker._bonusDamageMult) condDiff *= attacker._bonusDamageMult;
          if (defender._bonusDamageReductionMult && !isDefenderSiege) condDiff *= defender._bonusDamageReductionMult;
          SumaDañosClase += condDiff;
        }
      }
    }

    // Fórmula del motor: D_main = Math.max(minFloor, Math.floor(H * SumaDañosClase))
    const minFloor = (bProfile && bProfile.minDamageFloor !== undefined) ? bProfile.minDamageFloor : 1;
    const D_main = Math.max(minFloor, Math.floor(H * SumaDañosClase));

    // Balística multirráfaga: Proyectiles secundarios (Genie Engine)
    let D_secTotal = 0;
    if (bProfile && bProfile.projectiles > 1 && typeof bProfile.secondaryDamage === 'number') {
      const numSecondary = bProfile.projectiles - 1;
      const defPierce = (attacker.ignoresAllArmor || attacker.ignoresPierceArmor || (bProfile.ignoresArmor && !bProfile.isRocketCart))
        ? 0
        : (defenderArmours.hasOwnProperty(CLASSES.PIERCE) ? defenderArmours[CLASSES.PIERCE] : 0);

      let secBonusSum = 0;
      if (Array.isArray(bProfile.secondaryBonuses)) {
        for (const bonus of bProfile.secondaryBonuses) {
          let matches = false;
          if (bonus.Class === 1 && (hasArmourClass(defender, 1) || isInfantryUnit(defender))) {
            matches = true;
          } else if (bonus.Class === 4 && (hasArmourClass(defender, 15) || isArcherUnit(defender))) {
            matches = true;
          } else if (bonus.Class === 2 && (hasArmourClass(defender, 2) || hasArmourClass(defender, 27) || isSpearmanUnit(defender))) {
            matches = true;
          } else if (bonus.Class === 8 && (hasArmourClass(defender, 38) || isSkirmisherUnit(defender) || hasArmourClass(defender, 8))) {
            matches = true;
          } else if (bonus.Class === 11 && (hasArmourClass(defender, 11) || defender.isBuilding)) {
            matches = true;
          } else if (bonus.Class === 20 && (hasArmourClass(defender, 20) || hasArmourClass(defender, 13))) {
            matches = true;
          } else if (bonus.Class === 5 && (hasArmourClass(defender, 5) || hasArmourClass(defender, CLASSES.WAR_ELEPHANT))) {
            matches = true;
          } else if (bonus.Class === 13 && hasArmourClass(defender, 13)) {
            matches = true;
          } else if (bonus.Class !== 4 && hasArmourClass(defender, bonus.Class)) {
            matches = true;
          }

          if (matches) {
            let bVal = bonus.Amount;
            if (attacker._bonusDamageMult) bVal *= attacker._bonusDamageMult;
            if (defender._bonusDamageReductionMult && !isDefenderSiege) bVal *= defender._bonusDamageReductionMult;
            secBonusSum += bVal;
          }
        }
      }

      const secBaseDiff = Math.max(0, bProfile.secondaryDamage - defPierce);
      const singleSecDmg = Math.max(minFloor, Math.floor(H * (secBaseDiff + secBonusSum)));
      D_secTotal = numSecondary * singleSecDmg;
    }

    const D = D_main + D_secTotal;
    return D;
  }

  // =========================================================================
  // SECCIÓN 5: BUCLE DE SIMULACIÓN TEMPORAL & GUARDIA DEL TEMPLO (TTL)
  // =========================================================================

  /**
   * Identifica al Guardia del Templo (Muiscas, IDs 2562 y 2564 / 2586 y 2587 / internal_name)
   */
  function isTempleGuardUnit(unit) {
    if (!unit) return false;
    const uid = Number(unit.ID);
    const iname = String(unit.internal_name || '').toLowerCase();
    const lname = String(unit.localizedName || '').toLowerCase();
    return TEMPLE_GUARD_IDS.has(uid) ||
           iname.includes('temple guard') ||
           iname.includes('temple_guard') ||
           lname.includes('guardia del templo');
  }

  /**
   * 3. MECÁNICA DINÁMICA DEL GUARDIA DEL TEMPLO:
   *Crea el controlador de cadencia TTL para una instancia de Guardia del Templo.
   */
  function createTempleGuardController(unit) {
    const BASE_RELOAD = Number(unit.baseReloadTime || unit.ReloadTime || 2.0);
    const STACK_REDUCTION = TEMPLE_GUARD_STACK_REDUCTION;
    const MIN_RELOAD = TEMPLE_GUARD_MIN_RELOAD;
    let buffExpirations = Array.isArray(unit.buffExpirations) ? unit.buffExpirations : [];

    function getTempleGuardReload(currentTime) {
      // Purga los stacks vencidos
      buffExpirations = buffExpirations.filter(expTime => expTime > currentTime);
      unit.buffExpirations = buffExpirations;
      // Calcula el tiempo de recarga actual
      const activeStacks = buffExpirations.length;
      return Math.max(MIN_RELOAD, parseFloat((BASE_RELOAD - (activeStacks * STACK_REDUCTION)).toFixed(2)));
    }

    function onAttack(currentTime, log) {
      const previousReload = unit.ReloadTime;
      if (buffExpirations.length < 4) {
        buffExpirations.push(Number((currentTime + TEMPLE_GUARD_BUFF_DURATION).toFixed(4)));
      }
      const nextReload = getTempleGuardReload(currentTime);
      unit.ReloadTime = nextReload;
      unit.nextAttackTime = Number((currentTime + nextReload).toFixed(4));

      // Imprime en la crónica cuando la cadencia varíe o tenga stacks activos
      if (previousReload !== nextReload || buffExpirations.length > 0) {
        log.push({
          time: currentTime,
          text: `[${currentTime.toFixed(2)}s] ⚔ Guardia del templo asesta golpe. Stacks vigentes: ${buffExpirations.length}. Próximo ataque en ${nextReload}s.`
        });
      }
      return nextReload;
    }

    unit.getTempleGuardReload = getTempleGuardReload;
    return { getTempleGuardReload, onAttack };
  }

  /**
   * Calcula de forma aislada los requerimientos teóricos para que un combatiente
   * elimine por completo la vida inicial (100%) de su oponente:
   * - htk: Golpes totales necesarios (considerando carga en 1er golpe y daño sostenido)
   * - ttk: Tiempo exacto en segundos en el que asesta el último golpe letal ((htk - 1) * reload ajustado por animaciones/aceleraciones)
   */
  function calculateHTKandTTK(attacker, defender, options = {}) {
    if (!attacker || !defender) return { htk: 0, ttk: 0 };
    const maxHP = Number(defender.HP || defender.maxHP || 1);
    if (maxHP <= 0) return { htk: 0, ttk: 0 };

    const optsAtk = attacker.options || options.optA || options;
    const optsDef = defender.options || options.optB || options;
    const uAtk = initCombatant(attacker, optsAtk);
    const uDef = initCombatant(defender, optsDef);
    uDef.currentHP = maxHP;
    uDef.maxHP = maxHP;

    const dummyLog = [];
    const tgController = isTempleGuardUnit(uAtk) ? createTempleGuardController(uAtk) : null;

    let hits = 0;
    const useDelay = Boolean(options.useAttackDelay || options.useFrameDelay || (attacker.options && attacker.options.useAttackDelay));
    let currentTime = useDelay ? Number(uAtk.AttackDelaySeconds || 0) : 0.0;
    let lastTime = currentTime;
    const maxHits = 2000;
    const maxTime = 1200;

    while (uDef.currentHP > 0 && hits < maxHits && currentTime <= maxTime) {
      hits++;

      // 1. Reaplicación de cargas por tiempo
      updateChargeState(uAtk, currentTime, dummyLog, 'Atk');
      updateChargeState(uDef, currentTime, dummyLog, 'Def');

      // 2. Ejecutar impacto
      executeStrike(uAtk, uDef, currentTime, dummyLog, 'Atk', 'Def');

      if (uDef.currentHP <= 0) {
        return {
          htk: hits,
          ttk: Number(currentTime.toFixed(2))
        };
      }

      // 3. Cadencia y cálculo de tiempo al próximo golpe
      let nextReload = uAtk.ReloadTime;
      let nextTime = 0.0;
      if (tgController) {
        nextReload = tgController.onAttack(currentTime, dummyLog);
        nextTime = Number((currentTime + nextReload).toFixed(4));
      } else {
        nextTime = parseFloat((currentTime + uAtk.ReloadTime).toFixed(2));
      }

      // 4. Daño de veneno (DoT verdadero) y regeneración pasiva del defensor entre impactos
      if (uDef.poison && uDef.currentHP > 0) {
        const delta = nextTime - currentTime;
        const pStart = Math.max(currentTime, uDef.poison.appliedAt);
        const pEnd = Math.min(nextTime, uDef.poison.expiresAt);
        const pDelta = Math.max(0, pEnd - pStart);

        if (pDelta > 0) {
          const regenRate = uDef.regenRate || 0;
          const netDps = uDef.poison.dps - regenRate;

          // ¿El veneno drena toda la vida restante antes o durante este intervalo?
          if (netDps > 0) {
            const timeToDie = uDef.currentHP / netDps;
            if (timeToDie <= pDelta) {
              const fatalTime = currentTime + timeToDie;
              return {
                htk: hits,
                ttk: Number(fatalTime.toFixed(2))
              };
            }
          }

          // Si sobrevive este intervalo, aplicar daño neto y regeneración
          const pDmg = pDelta * uDef.poison.dps;
          const rDmg = delta * regenRate;
          uDef.currentHP = Math.min(uDef.maxHP, Math.max(0, uDef.currentHP - pDmg + rDmg));
          if (uDef.currentHP <= 0) {
            return {
              htk: hits,
              ttk: Number(nextTime.toFixed(2))
            };
          }
        }
        if (nextTime >= uDef.poison.expiresAt) {
          uDef.poison = null;
        }
      } else if (uDef.regenRate > 0 && uDef.currentHP > 0 && nextTime > currentTime) {
        const delta = nextTime - currentTime;
        uDef.currentHP = Math.min(uDef.maxHP, uDef.currentHP + (delta * uDef.regenRate));
      }

      currentTime = nextTime;
      lastTime = currentTime;
    }

    return {
      htk: hits,
      ttk: Number(currentTime.toFixed(2))
    };
  }

  /**
   * Ejecuta el duelo continuo segundo a segundo entre dos combatientes
   * @param {Object} combatantA - Primer combatiente
   * @param {Object} combatantB - Segundo combatiente
   * @param {Object} options - Parámetros globales de la simulación
   * @returns {Object} Informe exhaustivo con resultados y log de combate
   */
  function simulateDuel(combatantA, combatantB, options = {}) {
    // Clonación interna para que la simulación no altere el estado configurado en la UI
    const optsA = combatantA.options || options.optA || options;
    const optsB = combatantB.options || options.optB || options;
    const uA = initCombatant(combatantA, optsA);
    const uB = initCombatant(combatantB, optsB);

    // Estandarización del primer impacto (t = 0.00s) para erradicar asimetría en el arranque
    const useDelay = Boolean(options.useAttackDelay || options.useFrameDelay || optsA.useAttackDelay || optsB.useAttackDelay);
    let nextAttackTimeA = useDelay ? Number(uA.AttackDelaySeconds || 0) : 0.0;
    let nextAttackTimeB = useDelay ? Number(uB.AttackDelaySeconds || 0) : 0.0;
    uA.nextAttackTime = nextAttackTimeA;
    uB.nextAttackTime = nextAttackTimeB;

    const tgControllerA = isTempleGuardUnit(uA) ? createTempleGuardController(uA) : null;
    const tgControllerB = isTempleGuardUnit(uB) ? createTempleGuardController(uB) : null;

    const log = [];
    let currentTime = 0;
    let lastSimTime = 0.0;
    const maxTimeLimit = 600; // Límite de seguridad de 10 minutos para evitar bucles infinitos

    let firstStrikeDamageA = null;
    let firstStrikeDamageB = null;
    let firstStrikeAInfo = { usedCharge: false, blockedByShield: false };
    let firstStrikeBInfo = { usedCharge: false, blockedByShield: false };

    let hitsLandedA = 0;
    let hitsLandedB = 0;

    log.push({
      time: 0,
      text: `⚔️ Comienza el duelo: ${uA.localizedName} (${uA.civ}) vs ${uB.localizedName} (${uB.civ}).`
    });

    // Bucle continuo en segundos
    while (uA.currentHP > 0 && uB.currentHP > 0 && currentTime <= maxTimeLimit) {
      // Determinar el próximo momento de impacto o evento continuo en el timeline
      let nextTime = Math.min(uA.nextAttackTime, uB.nextAttackTime);

      // Comprobar eventos intermedios de veneno (fatalidad o expiración)
      if (uA.poison && uA.currentHP > 0 && uA.poison.expiresAt > lastSimTime) {
        const netDpsA = uA.poison.dps - (uA.regenRate || 0);
        if (netDpsA > 0) {
          const deathTimeA = lastSimTime + (uA.currentHP / netDpsA);
          if (deathTimeA <= uA.poison.expiresAt && deathTimeA < nextTime) {
            nextTime = deathTimeA;
          }
        }
        if (uA.poison.expiresAt > lastSimTime && uA.poison.expiresAt < nextTime) {
          nextTime = uA.poison.expiresAt;
        }
      }

      if (uB.poison && uB.currentHP > 0 && uB.poison.expiresAt > lastSimTime) {
        const netDpsB = uB.poison.dps - (uB.regenRate || 0);
        if (netDpsB > 0) {
          const deathTimeB = lastSimTime + (uB.currentHP / netDpsB);
          if (deathTimeB <= uB.poison.expiresAt && deathTimeB < nextTime) {
            nextTime = deathTimeB;
          }
        }
        if (uB.poison.expiresAt > lastSimTime && uB.poison.expiresAt < nextTime) {
          nextTime = uB.poison.expiresAt;
        }
      }

      currentTime = Number(nextTime.toFixed(4));

      if (currentTime > maxTimeLimit) {
        log.push({ time: currentTime, text: '⏱️ El combate ha superado el tiempo límite de simulación (Empate técnico).' });
        break;
      }

      // 0. Proceso de efectos continuos transcurridos en el intervalo deltaT
      const deltaT = currentTime - lastSimTime;
      if (deltaT > 0.0001) {
        // 0.1 Regeneración pasiva continua proporcional al tiempo transcurrido
        if (uA.currentHP > 0 && uA.regenRate > 0) {
          const regenAmount = deltaT * uA.regenRate;
          const oldHP = uA.currentHP;
          uA.currentHP = Math.min(uA.maxHP, uA.currentHP + regenAmount);
          if (uA.currentHP > oldHP && oldHP < uA.maxHP) {
            const displayHP = (uA.currentHP % 1 === 0) ? uA.currentHP : uA.currentHP.toFixed(1);
            log.push({
              time: currentTime,
              text: `✚ [${currentTime.toFixed(2)}s] ${uA.localizedName} (A) regenera +${regenAmount.toFixed(1)} HP (${displayHP}/${uA.maxHP} HP)`
            });
          }
        }
        if (uB.currentHP > 0 && uB.regenRate > 0) {
          const regenAmount = deltaT * uB.regenRate;
          const oldHP = uB.currentHP;
          uB.currentHP = Math.min(uB.maxHP, uB.currentHP + regenAmount);
          if (uB.currentHP > oldHP && oldHP < uB.maxHP) {
            const displayHP = (uB.currentHP % 1 === 0) ? uB.currentHP : uB.currentHP.toFixed(1);
            log.push({
              time: currentTime,
              text: `✚ [${currentTime.toFixed(2)}s] ${uB.localizedName} (B) regenera +${regenAmount.toFixed(1)} HP (${displayHP}/${uB.maxHP} HP)`
            });
          }
        }

        // 0.2 Daño verdadero de Veneno en el tiempo (Poison DoT)
        let fatalPoisonA = false;
        let fatalPoisonB = false;

        if (uA.poison && uA.currentHP > 0) {
          const pStart = Math.max(lastSimTime, uA.poison.appliedAt);
          const pEnd = Math.min(currentTime, uA.poison.expiresAt);
          const pDelta = Math.max(0, pEnd - pStart);
          if (pDelta > 0) {
            const poisonDmg = pDelta * uA.poison.dps;
            uA.currentHP = Math.max(0, uA.currentHP - poisonDmg);
            const displayHP = (uA.currentHP % 1 === 0) ? uA.currentHP : uA.currentHP.toFixed(1);
            if (uA.currentHP <= 0) {
              fatalPoisonA = true;
              log.push({
                time: currentTime,
                text: `🧪💀 [${currentTime.toFixed(2)}s] ¡El veneno resulta letal! ${uA.localizedName} (A) sucumbe al veneno.`
              });
              log.push({
                time: currentTime,
                text: `💀 [${currentTime.toFixed(2)}s] ${uA.localizedName} (A) ha sido derrotado.`
              });
              triggerDeathImpact(uA, uB, currentTime, log, 'A', 'B');
            } else {
              log.push({
                time: currentTime,
                text: `🧪 [${currentTime.toFixed(2)}s] ¡Efecto de veneno! ${uA.localizedName} (A) recibe ${poisonDmg.toFixed(1)} de daño de veneno (HP restante: ${displayHP}/${uA.maxHP})`
              });
            }
          }
          if (currentTime >= uA.poison.expiresAt) {
            uA.poison = null;
          }
        }

        if (uB.poison && uB.currentHP > 0) {
          const pStart = Math.max(lastSimTime, uB.poison.appliedAt);
          const pEnd = Math.min(currentTime, uB.poison.expiresAt);
          const pDelta = Math.max(0, pEnd - pStart);
          if (pDelta > 0) {
            const poisonDmg = pDelta * uB.poison.dps;
            uB.currentHP = Math.max(0, uB.currentHP - poisonDmg);
            const displayHP = (uB.currentHP % 1 === 0) ? uB.currentHP : uB.currentHP.toFixed(1);
            if (uB.currentHP <= 0) {
              fatalPoisonB = true;
              log.push({
                time: currentTime,
                text: `🧪💀 [${currentTime.toFixed(2)}s] ¡El veneno resulta letal! ${uB.localizedName} (B) sucumbe al veneno.`
              });
              log.push({
                time: currentTime,
                text: `💀 [${currentTime.toFixed(2)}s] ${uB.localizedName} (B) ha sido derrotado.`
              });
              triggerDeathImpact(uB, uA, currentTime, log, 'B', 'A');
            } else {
              log.push({
                time: currentTime,
                text: `🧪 [${currentTime.toFixed(2)}s] ¡Efecto de veneno! ${uB.localizedName} (B) recibe ${poisonDmg.toFixed(1)} de daño de veneno (HP restante: ${displayHP}/${uB.maxHP})`
              });
            }
          }
          if (currentTime >= uB.poison.expiresAt) {
            uB.poison = null;
          }
        }

        lastSimTime = currentTime;

        if (fatalPoisonA || fatalPoisonB) {
          break;
        }
      } else {
        lastSimTime = currentTime;
      }

      // 1. Reaplicación de Cargas por tiempo
      updateChargeState(uA, currentTime, log, 'A');
      updateChargeState(uB, currentTime, log, 'B');

      // 2. Determinar atacantes en este instante exacto
      const aStrikesNow = (Math.abs(uA.nextAttackTime - currentTime) < 0.0001);
      const bStrikesNow = (Math.abs(uB.nextAttackTime - currentTime) < 0.0001);

      // CASO 1: Ataque simultáneo (ej. t = 0.00s o cadencias coincidentes)
      // Ambos combatientes asestan su golpe simultáneamente antes de comprobar condiciones de muerte
      if (aStrikesNow && bStrikesNow && uA.currentHP > 0 && uB.currentHP > 0) {
        executeSimultaneousStrikes(uA, uB, currentTime, log, (strikeA, strikeB) => {
          hitsLandedA++;
          hitsLandedB++;
          if (firstStrikeDamageA === null) {
            firstStrikeDamageA = strikeA.damage;
            firstStrikeAInfo = strikeA;
          }
          if (firstStrikeDamageB === null) {
            firstStrikeDamageB = strikeB.damage;
            firstStrikeBInfo = strikeB;
          }
        });

        if (tgControllerA) {
          tgControllerA.onAttack(currentTime, log);
        } else {
          uA.nextAttackTime = parseFloat((uA.nextAttackTime + uA.ReloadTime).toFixed(2));
        }

        if (tgControllerB) {
          tgControllerB.onAttack(currentTime, log);
        } else {
          uB.nextAttackTime = parseFloat((uB.nextAttackTime + uB.ReloadTime).toFixed(2));
        }
      }
      // CASO 2: Solo el combatiente A asesta golpe
      else if (aStrikesNow && uA.currentHP > 0 && uB.currentHP > 0) {
        executeStrike(uA, uB, currentTime, log, 'A', 'B', (strikeData) => {
          hitsLandedA++;
          if (firstStrikeDamageA === null) {
            firstStrikeDamageA = strikeData.damage;
            firstStrikeAInfo = strikeData;
          }
        });
        if (tgControllerA) {
          tgControllerA.onAttack(currentTime, log);
        } else {
          uA.nextAttackTime = parseFloat((uA.nextAttackTime + uA.ReloadTime).toFixed(2));
        }
      }
      // CASO 3: Solo el combatiente B asesta golpe
      else if (bStrikesNow && uB.currentHP > 0 && uA.currentHP > 0) {
        executeStrike(uB, uA, currentTime, log, 'B', 'A', (strikeData) => {
          hitsLandedB++;
          if (firstStrikeDamageB === null) {
            firstStrikeDamageB = strikeData.damage;
            firstStrikeBInfo = strikeData;
          }
        });
        if (tgControllerB) {
          tgControllerB.onAttack(currentTime, log);
        } else {
          uB.nextAttackTime = parseFloat((uB.nextAttackTime + uB.ReloadTime).toFixed(2));
        }
      }
    }

    // =========================================================================
    // SECCIÓN 6: MÉTRICAS DE SALIDA Y RESPUESTA VISUAL
    // =========================================================================

    const winnerKey = uA.currentHP > 0 && uB.currentHP <= 0 ? 'A' : (uB.currentHP > 0 && uA.currentHP <= 0 ? 'B' : 'draw');
    const winnerUnit = winnerKey === 'A' ? uA : (winnerKey === 'B' ? uB : null);
    const loserUnit = winnerKey === 'A' ? uB : (winnerKey === 'B' ? uA : null);

    const finalHPA = Math.max(0, parseFloat(uA.currentHP.toFixed(1)));
    const finalHPB = Math.max(0, parseFloat(uB.currentHP.toFixed(1)));
    const remainingHP = winnerUnit ? Math.max(0, parseFloat(winnerUnit.currentHP.toFixed(1))) : 0;
    const maxHP = winnerUnit ? winnerUnit.maxHP : 1;
    const remainingHPPct = Math.round((remainingHP / maxHP) * 100);

    const hitsToKill = winnerKey === 'A' ? hitsLandedA : (winnerKey === 'B' ? hitsLandedB : 0);
    const timeToKill = Number(currentTime.toFixed(2));

    // Cálculos de requerimientos teóricos (HTK y TTK aislados contra 100% HP)
    const reqA = calculateHTKandTTK(uA, uB, options);
    const reqB = calculateHTKandTTK(uB, uA, options);

    // Cálculos de daño regular sostenido (sin cargas extraordinarias ni bloqueos)
    const regularDamageA = calculateNetDamage(uA, uB, { ...uA.options, offensiveChargeBonus: 0 });
    const regularDamageB = calculateNetDamage(uB, uA, { ...uB.options, offensiveChargeBonus: 0 });

    const dpsA = Number((regularDamageA / uA.ReloadTime).toFixed(2));
    const dpsB = Number((regularDamageB / uB.ReloadTime).toFixed(2));

    // Eficiencia de recursos (Coste militar invertido vs valor destruido)
    const costA = getUnitTotalCost(uA);
    const costB = getUnitTotalCost(uB);
    const resourceEfficiency = calculateResourceEfficiency(winnerKey, costA, costB, uA, uB);

    return {
      winner: winnerKey,
      duration: timeToKill,
      combatantA: {
        htk: reqA.htk,
        ttk: reqA.ttk,
        hitsLanded: hitsLandedA,
        remainingHP: finalHPA
      },
      combatantB: {
        htk: reqB.htk,
        ttk: reqB.ttk,
        hitsLanded: hitsLandedB,
        remainingHP: finalHPB
      },
      resourceRatio: resourceEfficiency.ratio,
      combatLog: log,
      winnerName: winnerUnit ? winnerUnit.localizedName : 'Empate',
      winnerCiv: winnerUnit ? winnerUnit.civ : '-',
      remainingHP: remainingHP,
      maxHP: maxHP,
      remainingHPPct: remainingHPPct,
      timeToKill: timeToKill,
      hitsToKill: hitsToKill,
      firstStrikeDamageA: firstStrikeDamageA !== null ? firstStrikeDamageA : regularDamageA,
      firstStrikeAInfo: firstStrikeAInfo,
      firstStrikeDamageB: firstStrikeDamageB !== null ? firstStrikeDamageB : regularDamageB,
      firstStrikeBInfo: firstStrikeBInfo,
      regularDamageA: regularDamageA,
      regularDamageB: regularDamageB,
      effectiveReloadA: uA.ReloadTime,
      effectiveReloadB: uB.ReloadTime,
      dpsA: dpsA,
      dpsB: dpsB,
      costA: costA,
      costB: costB,
      resourceEfficiency: resourceEfficiency,
      finalHPA: finalHPA,
      maxHPA: uA.maxHP,
      finalHPB: finalHPB,
      maxHPB: uB.maxHP,
      hitsLandedA: hitsLandedA,
      hitsLandedB: hitsLandedB,
      log: log
    };
  }

  const simulateCombat = simulateDuel;

  // =========================================================================
  // SUB-RUTINAS INTERNAS DE LA SIMULACIÓN
  // =========================================================================

  /**
   * Detonación tras la muerte del Carro de cohetes jurchen (Bombas trueno / Thunderclap Bombs)
   */
  function triggerDeathImpact(dyingUnit, opposingUnit, currentTime, log, dyingLabel, opposingLabel) {
    if (!dyingUnit || dyingUnit._deathImpactTriggered) return;
    const impact = dyingUnit.ballisticProfile?.deathImpact;
    if (!impact || !opposingUnit || opposingUnit.currentHP <= 0) return;

    dyingUnit._deathImpactTriggered = true;
    const boomDamage = Number(impact.damage || 15);
    opposingUnit.currentHP = Math.max(0, opposingUnit.currentHP - boomDamage);
    const oppHpDisplay = (opposingUnit.currentHP % 1 === 0) ? opposingUnit.currentHP : opposingUnit.currentHP.toFixed(1);

    const isJurchen = Boolean(dyingUnit.ballisticProfile?.projectileImpact || impact.damage === 15);
    const deathTitle = isJurchen ? '¡Detonación de Bombas trueno!' : '¡Detonación mortal por destrucción!';

    log.push({
      time: currentTime,
      text: `💥💣 [${currentTime.toFixed(2)}s] ${deathTitle} Al ser destruido, ${dyingUnit.localizedName} (${dyingLabel}) explota e inflige ${boomDamage} de daño a ${opposingUnit.localizedName} (${opposingLabel}). (HP restante: ${oppHpDisplay}/${opposingUnit.maxHP})`
    });

    if (opposingUnit.currentHP <= 0) {
      log.push({
        time: currentTime,
        text: `💀 [${currentTime.toFixed(2)}s] ${opposingUnit.localizedName} (${opposingLabel}) ha sido derrotado por la explosión letal.`
      });
    }
  }

  /**
   * Ejecuta un golpe individual gestionando cargas ofensivas y escudos defensivos
   */
  function executeStrike(attacker, defender, currentTime, log, atkLabel, defLabel, onComplete) {
    let offensiveBonus = 0;
    let usedCharge = false;
    let blockedByShield = false;

    // 1. Gestión de Carga Ofensiva (Coustillier, Urumi, etc.)
    if (attacker.currentCharge > 0 && attacker.isOffensiveCharge) {
      offensiveBonus = attacker.currentCharge;
      attacker.currentCharge = 0;
      attacker.nextChargeReadyTime = Number((currentTime + attacker.RechargeDuration).toFixed(4));
      usedCharge = true;
    }

    // 2. Gestión de Escudo Defensivo (Shrivamsha, Pagoda de Hierro)
    if (defender.currentCharge > 0 && defender.isDefensiveCharge) {
      defender.currentCharge = 0;
      defender.nextChargeReadyTime = Number((currentTime + defender.RechargeDuration).toFixed(4));
      blockedByShield = true;
    }

    let damage = 0;
    if (blockedByShield) {
      damage = 0;
      log.push({
        time: currentTime,
        text: `🛡️ [${currentTime.toFixed(2)}s] ${defender.localizedName} (${defLabel}) bloquea totalmente el golpe con su escudo de carga defensiva.`
      });
    } else {
      damage = calculateNetDamage(attacker, defender, {
        ...attacker.options,
        offensiveChargeBonus: offensiveBonus
      });
      defender.currentHP = Math.max(0, defender.currentHP - damage);

      const chargeText = usedCharge ? ` 💥 ¡Golpe con Carga Ofensiva (+${offensiveBonus})!` : '';
      const defHpDisplay = (defender.currentHP % 1 === 0) ? defender.currentHP : defender.currentHP.toFixed(1);

      const isRocket = attacker.ballisticProfile && attacker.ballisticProfile.isRocketCart;
      const isMultiProj = !isRocket && attacker.ballisticProfile && attacker.ballisticProfile.projectiles > 1;
      if (isRocket) {
        const projCount = attacker.ballisticProfile.projectiles;
        log.push({
          time: currentTime,
          text: `🚀 [${currentTime.toFixed(2)}s] ${attacker.localizedName} (${atkLabel}) descarga una salva de ${projCount} cohetes infligiendo ${damage} de daño puro a ${defender.localizedName} (${defLabel}).${chargeText} (HP restante: ${defHpDisplay}/${defender.maxHP})`
        });
      } else if (isMultiProj) {
        const projCount = attacker.ballisticProfile.projectiles;
        log.push({
          time: currentTime,
          text: `🏹 [${currentTime.toFixed(2)}s] ${attacker.localizedName} (${atkLabel}) dispara una ráfaga de ${projCount} proyectiles infligiendo ${damage} de daño a ${defender.localizedName} (${defLabel}).${chargeText} (HP restante: ${defHpDisplay}/${defender.maxHP})`
        });
      } else {
        log.push({
          time: currentTime,
          text: `🗡️ [${currentTime.toFixed(2)}s] ${attacker.localizedName} (${atkLabel}) inflige ${damage} de daño a ${defender.localizedName} (${defLabel}).${chargeText} (HP restante: ${defHpDisplay}/${defender.maxHP})`
        });
      }

      // Contagio o refresco de Veneno (Poison DoT)
      if (attacker.poisonProfile && defender.currentHP > 0) {
        defender.poison = {
          totalDamage: attacker.poisonProfile.totalDamage,
          duration: attacker.poisonProfile.duration,
          dps: attacker.poisonProfile.dps,
          appliedAt: currentTime,
          expiresAt: Number((currentTime + attacker.poisonProfile.duration).toFixed(4)),
          lastTickTime: currentTime,
          source: attacker.poisonProfile.source,
          attackerName: attacker.localizedName,
          atkLabel: atkLabel
        };
        log.push({
          time: currentTime,
          text: `🧪 [${currentTime.toFixed(2)}s] ¡${attacker.localizedName} (${atkLabel}) infecta con veneno a ${defender.localizedName} (${defLabel})! (${attacker.poisonProfile.totalDamage} HP en ${attacker.poisonProfile.duration}s)`
        });
      }

      // Reflejo de daño de Armadura Laminada (Lamellar Armor, Khitans)
      if (defender.hasLamellarArmor && damage > 0) {
        const isMeleeAtk = attacker.Attacks?.some(a => a.Class === CLASSES.MELEE && a.Amount > 0) || (attacker.Range <= 1 && !attacker.Attacks?.some(a => a.Class === CLASSES.PIERCE));
        if (isMeleeAtk) {
          const reflectedDamage = Math.max(1, Math.round(damage * 0.25));
          attacker.currentHP = Math.max(0, attacker.currentHP - reflectedDamage);
          const atkHpDisplay = (attacker.currentHP % 1 === 0) ? attacker.currentHP : attacker.currentHP.toFixed(1);
          log.push({
            time: currentTime,
            text: `🛡️⚡ [${currentTime.toFixed(2)}s] ¡Armadura Laminada (Lamellar Armor)! ${defender.localizedName} (${defLabel}) refleja ${reflectedDamage} de daño melee a ${attacker.localizedName} (${atkLabel}). (HP restante: ${atkHpDisplay}/${attacker.maxHP})`
          });

          if (attacker.currentHP <= 0) {
            log.push({
              time: currentTime,
              text: `💀 [${currentTime.toFixed(2)}s] ${attacker.localizedName} (${atkLabel}) ha sido derrotado por el daño reflejado.`
            });
            triggerDeathImpact(attacker, defender, currentTime, log, atkLabel, defLabel);
          }
        }
      }

      if (defender.currentHP <= 0) {
        log.push({
          time: currentTime,
          text: `💀 [${currentTime.toFixed(2)}s] ${defender.localizedName} (${defLabel}) ha sido derrotado.`
        });
        triggerDeathImpact(defender, attacker, currentTime, log, defLabel, atkLabel);
      }
    }

    if (onComplete) {
      onComplete({
        damage: damage,
        usedCharge: usedCharge,
        blockedByShield: blockedByShield
      });
    }
  }

  /**
   * Ejecuta dos golpes simultáneos en el mismo instante temporal (t) aplicando el daño de ambos
   * combatientes de manera simultánea antes de comprobar condiciones de muerte o victoria.
   */
  function executeSimultaneousStrikes(combatantA, combatantB, currentTime, log, onComplete) {
    let offBonusA = 0;
    let usedChargeA = false;
    let blockedByShieldB = false;

    let offBonusB = 0;
    let usedChargeB = false;
    let blockedByShieldA = false;

    // 1. Gestión de Carga Ofensiva de A
    if (combatantA.currentCharge > 0 && combatantA.isOffensiveCharge) {
      offBonusA = combatantA.currentCharge;
      combatantA.currentCharge = 0;
      combatantA.nextChargeReadyTime = Number((currentTime + combatantA.RechargeDuration).toFixed(4));
      usedChargeA = true;
    }

    // 2. Gestión de Escudo Defensivo de B contra el golpe de A
    if (combatantB.currentCharge > 0 && combatantB.isDefensiveCharge) {
      combatantB.currentCharge = 0;
      combatantB.nextChargeReadyTime = Number((currentTime + combatantB.RechargeDuration).toFixed(4));
      blockedByShieldB = true;
    }

    // 3. Gestión de Carga Ofensiva de B
    if (combatantB.currentCharge > 0 && combatantB.isOffensiveCharge) {
      offBonusB = combatantB.currentCharge;
      combatantB.currentCharge = 0;
      combatantB.nextChargeReadyTime = Number((currentTime + combatantB.RechargeDuration).toFixed(4));
      usedChargeB = true;
    }

    // 4. Gestión de Escudo Defensivo de A contra el golpe de B
    if (combatantA.currentCharge > 0 && combatantA.isDefensiveCharge) {
      combatantA.currentCharge = 0;
      combatantA.nextChargeReadyTime = Number((currentTime + combatantA.RechargeDuration).toFixed(4));
      blockedByShieldA = true;
    }

    // 5. Cálculo simultáneo del daño neto antes de aplicar sustracciones de HP
    let damageA = 0;
    if (blockedByShieldB) {
      damageA = 0;
      log.push({
        time: currentTime,
        text: `🛡️ [${currentTime.toFixed(2)}s] ${combatantB.localizedName} (B) bloquea totalmente el golpe con su escudo de carga defensiva.`
      });
    } else {
      damageA = calculateNetDamage(combatantA, combatantB, {
        ...combatantA.options,
        offensiveChargeBonus: offBonusA
      });
    }

    let damageB = 0;
    if (blockedByShieldA) {
      damageB = 0;
      log.push({
        time: currentTime,
        text: `🛡️ [${currentTime.toFixed(2)}s] ${combatantA.localizedName} (A) bloquea totalmente el golpe con su escudo de carga defensiva.`
      });
    } else {
      damageB = calculateNetDamage(combatantB, combatantA, {
        ...combatantB.options,
        offensiveChargeBonus: offBonusB
      });
    }

    // 6. Aplicación simultánea de daño
    combatantB.currentHP = Math.max(0, combatantB.currentHP - damageA);
    combatantA.currentHP = Math.max(0, combatantA.currentHP - damageB);

    if (!blockedByShieldB) {
      const chargeTextA = usedChargeA ? ` 💥 ¡Golpe con Carga Ofensiva (+${offBonusA})!` : '';
      const hpDisplayB = (combatantB.currentHP % 1 === 0) ? combatantB.currentHP : combatantB.currentHP.toFixed(1);
      const isRocketA = combatantA.ballisticProfile && combatantA.ballisticProfile.isRocketCart;
      const isMultiProjA = !isRocketA && combatantA.ballisticProfile && combatantA.ballisticProfile.projectiles > 1;
      if (isRocketA) {
        const projCountA = combatantA.ballisticProfile.projectiles;
        log.push({
          time: currentTime,
          text: `🚀 [${currentTime.toFixed(2)}s] ${combatantA.localizedName} (A) descarga una salva de ${projCountA} cohetes infligiendo ${damageA} de daño puro a ${combatantB.localizedName} (B).${chargeTextA} (HP restante: ${hpDisplayB}/${combatantB.maxHP})`
        });
      } else if (isMultiProjA) {
        const projCountA = combatantA.ballisticProfile.projectiles;
        log.push({
          time: currentTime,
          text: `🏹 [${currentTime.toFixed(2)}s] ${combatantA.localizedName} (A) dispara una ráfaga de ${projCountA} proyectiles infligiendo ${damageA} de daño a ${combatantB.localizedName} (B).${chargeTextA} (HP restante: ${hpDisplayB}/${combatantB.maxHP})`
        });
      } else {
        log.push({
          time: currentTime,
          text: `🗡️ [${currentTime.toFixed(2)}s] ${combatantA.localizedName} (A) inflige ${damageA} de daño a ${combatantB.localizedName} (B).${chargeTextA} (HP restante: ${hpDisplayB}/${combatantB.maxHP})`
        });
      }
    }

    if (!blockedByShieldA) {
      const chargeTextB = usedChargeB ? ` 💥 ¡Golpe con Carga Ofensiva (+${offBonusB})!` : '';
      const hpDisplayA = (combatantA.currentHP % 1 === 0) ? combatantA.currentHP : combatantA.currentHP.toFixed(1);
      const isRocketB = combatantB.ballisticProfile && combatantB.ballisticProfile.isRocketCart;
      const isMultiProjB = !isRocketB && combatantB.ballisticProfile && combatantB.ballisticProfile.projectiles > 1;
      if (isRocketB) {
        const projCountB = combatantB.ballisticProfile.projectiles;
        log.push({
          time: currentTime,
          text: `🚀 [${currentTime.toFixed(2)}s] ${combatantB.localizedName} (B) descarga una salva de ${projCountB} cohetes infligiendo ${damageB} de daño puro a ${combatantA.localizedName} (A).${chargeTextB} (HP restante: ${hpDisplayA}/${combatantA.maxHP})`
        });
      } else if (isMultiProjB) {
        const projCountB = combatantB.ballisticProfile.projectiles;
        log.push({
          time: currentTime,
          text: `🏹 [${currentTime.toFixed(2)}s] ${combatantB.localizedName} (B) dispara una ráfaga de ${projCountB} proyectiles infligiendo ${damageB} de daño a ${combatantA.localizedName} (A).${chargeTextB} (HP restante: ${hpDisplayA}/${combatantA.maxHP})`
        });
      } else {
        log.push({
          time: currentTime,
          text: `🗡️ [${currentTime.toFixed(2)}s] ${combatantB.localizedName} (B) inflige ${damageB} de daño a ${combatantA.localizedName} (A).${chargeTextB} (HP restante: ${hpDisplayA}/${combatantA.maxHP})`
        });
      }
    }

    // Reflejo de daño de Armadura Laminada (Lamellar Armor, Khitans) en golpes simultáneos
    if (combatantB.hasLamellarArmor && damageA > 0) {
      const isMeleeAtkA = combatantA.Attacks?.some(a => a.Class === CLASSES.MELEE && a.Amount > 0) || (combatantA.Range <= 1 && !combatantA.Attacks?.some(a => a.Class === CLASSES.PIERCE));
      if (isMeleeAtkA) {
        const refA = Math.max(1, Math.round(damageA * 0.25));
        combatantA.currentHP = Math.max(0, combatantA.currentHP - refA);
        const hpDisplayA = (combatantA.currentHP % 1 === 0) ? combatantA.currentHP : combatantA.currentHP.toFixed(1);
        log.push({
          time: currentTime,
          text: `🛡️⚡ [${currentTime.toFixed(2)}s] ¡Armadura Laminada (Lamellar Armor)! ${combatantB.localizedName} (B) refleja ${refA} de daño melee a ${combatantA.localizedName} (A). (HP restante: ${hpDisplayA}/${combatantA.maxHP})`
        });

        if (combatantA.currentHP <= 0) {
          log.push({
            time: currentTime,
            text: `💀 [${currentTime.toFixed(2)}s] ${combatantA.localizedName} (A) ha sido derrotado por el daño reflejado.`
          });
          triggerDeathImpact(combatantA, combatantB, currentTime, log, 'A', 'B');
        }
      }
    }

    if (combatantA.hasLamellarArmor && damageB > 0) {
      const isMeleeAtkB = combatantB.Attacks?.some(a => a.Class === CLASSES.MELEE && a.Amount > 0) || (combatantB.Range <= 1 && !combatantB.Attacks?.some(a => a.Class === CLASSES.PIERCE));
      if (isMeleeAtkB) {
        const refB = Math.max(1, Math.round(damageB * 0.25));
        combatantB.currentHP = Math.max(0, combatantB.currentHP - refB);
        const hpDisplayB = (combatantB.currentHP % 1 === 0) ? combatantB.currentHP : combatantB.currentHP.toFixed(1);
        log.push({
          time: currentTime,
          text: `🛡️⚡ [${currentTime.toFixed(2)}s] ¡Armadura Laminada (Lamellar Armor)! ${combatantA.localizedName} (A) refleja ${refB} de daño melee a ${combatantB.localizedName} (B). (HP restante: ${hpDisplayB}/${combatantB.maxHP})`
        });

        if (combatantB.currentHP <= 0) {
          log.push({
            time: currentTime,
            text: `💀 [${currentTime.toFixed(2)}s] ${combatantB.localizedName} (B) ha sido derrotado por el daño reflejado.`
          });
          triggerDeathImpact(combatantB, combatantA, currentTime, log, 'B', 'A');
        }
      }
    }

    // Infección o refresco de veneno en golpes simultáneos
    if (!blockedByShieldB && combatantA.poisonProfile && combatantB.currentHP > 0) {
      combatantB.poison = {
        totalDamage: combatantA.poisonProfile.totalDamage,
        duration: combatantA.poisonProfile.duration,
        dps: combatantA.poisonProfile.dps,
        appliedAt: currentTime,
        expiresAt: Number((currentTime + combatantA.poisonProfile.duration).toFixed(4)),
        lastTickTime: currentTime,
        source: combatantA.poisonProfile.source,
        attackerName: combatantA.localizedName,
        atkLabel: 'A'
      };
      log.push({
        time: currentTime,
        text: `🧪 [${currentTime.toFixed(2)}s] ¡${combatantA.localizedName} (A) infecta con veneno a ${combatantB.localizedName} (B)! (${combatantA.poisonProfile.totalDamage} HP en ${combatantA.poisonProfile.duration}s)`
      });
    }

    if (!blockedByShieldA && combatantB.poisonProfile && combatantA.currentHP > 0) {
      combatantA.poison = {
        totalDamage: combatantB.poisonProfile.totalDamage,
        duration: combatantB.poisonProfile.duration,
        dps: combatantB.poisonProfile.dps,
        appliedAt: currentTime,
        expiresAt: Number((currentTime + combatantB.poisonProfile.duration).toFixed(4)),
        lastTickTime: currentTime,
        source: combatantB.poisonProfile.source,
        attackerName: combatantB.localizedName,
        atkLabel: 'B'
      };
      log.push({
        time: currentTime,
        text: `🧪 [${currentTime.toFixed(2)}s] ¡${combatantB.localizedName} (B) infecta con veneno a ${combatantA.localizedName} (A)! (${combatantB.poisonProfile.totalDamage} HP en ${combatantB.poisonProfile.duration}s)`
      });
    }

    // 7. Notificación de bajas simultáneas tras registrar ambos impactos
    if (combatantB.currentHP <= 0 && !log.some(l => l.text.includes(combatantB.localizedName) && l.text.includes('ha sido derrotado'))) {
      log.push({
        time: currentTime,
        text: `💀 [${currentTime.toFixed(2)}s] ${combatantB.localizedName} (B) ha sido derrotado.`
      });
      triggerDeathImpact(combatantB, combatantA, currentTime, log, 'B', 'A');
    }
    if (combatantA.currentHP <= 0 && !log.some(l => l.text.includes(combatantA.localizedName) && l.text.includes('ha sido derrotado'))) {
      log.push({
        time: currentTime,
        text: `💀 [${currentTime.toFixed(2)}s] ${combatantA.localizedName} (A) ha sido derrotado.`
      });
      triggerDeathImpact(combatantA, combatantB, currentTime, log, 'A', 'B');
    }

    if (onComplete) {
      onComplete(
        { damage: damageA, usedCharge: usedChargeA, blockedByShield: blockedByShieldB },
        { damage: damageB, usedCharge: usedChargeB, blockedByShield: blockedByShieldA }
      );
    }
  }

  /**
   * Actualiza el temporizador de recarga de barra de carga
   */
  function updateChargeState(unit, currentTime, log, label) {
    if (unit.MaxCharge > 0 && unit.currentCharge === 0 && unit.nextChargeReadyTime > 0) {
      if (currentTime >= unit.nextChargeReadyTime) {
        unit.currentCharge = unit.MaxCharge;
        unit.nextChargeReadyTime = 0;
        log.push({
          time: currentTime,
          text: `✨ [${currentTime.toFixed(2)}s] ${unit.localizedName} (${label}) ha recargado su barra de carga al 100% (${unit.MaxCharge}).`
        });
      }
    }
  }

  /**
   * Calcula el coste militar total en recursos, integrando modificadores y descuentos de civilización.
   */
  function getUnitTotalCost(unit) {
    if (!unit) return 0;

    let calcFn = null;
    if (typeof calculateUnitCost === 'function') {
      calcFn = calculateUnitCost;
    } else if (typeof window !== 'undefined' && typeof window.calculateUnitCost === 'function') {
      calcFn = window.calculateUnitCost;
    } else if (typeof require === 'function') {
      try {
        const uMod = require('./unitModifiers.js');
        if (uMod && typeof uMod.calculateUnitCost === 'function') calcFn = uMod.calculateUnitCost;
      } catch (e) {}
    }

    if (calcFn) {
      const civ = unit.civ || unit.civName || unit.options?.civ || unit.options?.civName || 'generic';
      const age = unit.age || unit.options?.age || 'imperial';
      const activeTechs = unit.activeTechIds || unit.options?.activeUniqueTechs || unit.options?.activeTechs || [];
      const costSource = unit.Cost || unit.cost || unit._rawUnitData?.Cost || {};

      const res = calcFn(
        {
          id: unit.ID ?? unit.id,
          name: unit.localizedName ?? unit.name ?? unit.internal_name,
          classes: (unit.Armours || []).map(a => a.Class),
          cost: costSource
        },
        civ,
        age,
        activeTechs
      );
      if (res && typeof res.totalCost === 'number') {
        return res.totalCost;
      }
    }

    const cost = unit.Cost || unit.cost || unit._rawUnitData?.Cost || {};
    return (cost.Food || cost.food || 0) + (cost.Wood || cost.wood || 0) + (cost.Gold || cost.gold || 0) + (cost.Stone || cost.stone || 0);
  }

  /**
   * Calcula la relación de eficiencia de recursos entre los combatientes tras el combate
   */
  function calculateResourceEfficiency(winnerKey, costA, costB, uA, uB) {
    if (winnerKey === 'draw') {
      return { ratio: '1.00', costA, costB, desc: 'Equilibrio de recursos.' };
    }

    const winnerCost = winnerKey === 'A' ? costA : costB;
    const loserCost = winnerKey === 'A' ? costB : costA;
    const winner = winnerKey === 'A' ? uA : uB;
    const loser = winnerKey === 'A' ? uB : uA;

    const winnerMaxHP = winner.maxHP || winner.HP || 1;
    const winnerRemainingHP = Math.max(0, winner.currentHP !== undefined ? winner.currentHP : (winner.remainingHP || winnerMaxHP));
    const hpLostFraction = Math.max(0, (winnerMaxHP - winnerRemainingHP) / winnerMaxHP);
    const effectiveCostLostByWinner = Math.max(1, Math.round(winnerCost * hpLostFraction));

    // Ratio: valor destruido al oponente dividido por el costo sufrido por el ganador
    const efficiencyRatio = (loserCost / effectiveCostLostByWinner).toFixed(2);
    const winnerCiv = winner.civ || winner.civName || '';
    const loserCiv = loser.civ || loser.civName || '';

    return {
      ratio: efficiencyRatio,
      costA: costA,
      costB: costB,
      winnerCost: winnerCost,
      loserCost: loserCost,
      effectiveCostLostByWinner: effectiveCostLostByWinner,
      desc: `${winner.localizedName}${winnerCiv ? ` (${winnerCiv})` : ''} destruyó ${loserCost} recursos de ${loser.localizedName}${loserCiv ? ` (${loserCiv})` : ''} sufriendo un desgaste estimado de ${effectiveCostLostByWinner} recursos (Ratio: ${efficiencyRatio}x).`
    };
  }

  // =========================================================================
  // FUNCIONES DE APOYO Y CONSULTA
  // =========================================================================

  function hasArmourClass(unit, classId) {
    return (unit.Armours || []).some(arm => arm.Class === classId);
  }

  function hasAttackClass(unit, classId) {
    return (unit.Attacks || []).some(atk => atk.Class === classId);
  }

  function isInfantryUnit(unit) {
    // En data.json (Genie Engine), la clase de armadura de Infantería es Class 1
    // También soportamos Class 11 por compatibilidad con esquemas externos
    return hasArmourClass(unit, 1) ||
           hasArmourClass(unit, CLASSES.INFANTRY) ||
           SWORD_INFANTRY_IDS.has(unit.ID) ||
           JAGUAR_WARRIOR_IDS.has(unit.ID);
  }

  function isArcherUnit(unit) {
    if (!unit) return false;
    return hasArmourClass(unit, CLASSES.ARCHER) || hasArmourClass(unit, 15);
  }

  function isSpearmanUnit(unit) {
    if (!unit) return false;
    const uid = Number(unit.ID ?? unit.id);
    return hasArmourClass(unit, 27) || hasArmourClass(unit, 2) || [93, 358, 359, 1786, 1787].includes(uid);
  }

  function isSkirmisherUnit(unit) {
    if (!unit) return false;
    const uid = Number(unit.ID ?? unit.id);
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
    return hasArmourClass(unit, 38) || [6, 7, 1155, 185, 1010, 1012].includes(uid) || name.includes('skirmisher') || name.includes('guerrillero');
  }

  function addAttackAmount(unit, classId, amount) {
    const atk = unit.Attacks.find(a => a.Class === classId);
    if (atk) {
      atk.Amount += amount;
    } else {
      unit.Attacks.push({ Amount: amount, Class: classId });
    }
    if (classId === CLASSES.MELEE || (classId === CLASSES.PIERCE && unit.Range > 0)) {
      unit.Attack = (unit.Attack || 0) + amount;
    }
  }

  function addArmourAmount(unit, classId, amount) {
    const arm = unit.Armours.find(a => a.Class === classId);
    if (arm) {
      arm.Amount += amount;
    } else {
      unit.Armours.push({ Amount: amount, Class: classId });
    }
    if (classId === CLASSES.MELEE) {
      unit.MeleeArmor = (unit.MeleeArmor || 0) + amount;
    } else if (classId === CLASSES.PIERCE) {
      unit.PierceArmor = (unit.PierceArmor || 0) + amount;
    }
  }

  function isGunpowderUnit(unit) {
    // En el motor Genie de AoE2, la clase de armadura para Pólvora es 23 (Class 19 es Unidades Únicas)
    return hasArmourClass(unit, 23) ||
           GUNPOWDER_IDS.has(unit.ID);
  }

  function getNavalCategory(unit) {
    if (!unit) return null;
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
    const id = Number(unit.ID ?? unit.id);
    const armours = Array.isArray(unit.Armours) ? unit.Armours : [];

    const isShip = armours.some(a => a.Class === 22 || a.Class === 16) ||
                   name.includes('ship') || name.includes('galley') || name.includes('barco') || name.includes('hulk') ||
                   HULK_LINE_IDS.has(id) || GALLEY_LINE_IDS.has(id) || LONGBOAT_LINE_IDS.has(id) || CARAVEL_LINE_IDS.has(id) ||
                   FIRE_SHIP_IDS.has(id) || DEMO_SHIP_IDS.has(id) || CANNON_GALLEON_IDS.has(id) || DROMON_IDS.has(id);

    if (!isShip) return null;

    // 1. Línea de Hulk / Choque naval melee
    const isHulk = HULK_LINE_IDS.has(id) ||
                   name.includes('hulk') || name.includes('carrack') || name.includes('carraca') ||
                   name.includes('lou_chuan') || name.includes('louchuan');
    if (isHulk) return 'MELEE_SHIP';

    // 2. Barcos de flechas
    const isArrowShip = GALLEY_LINE_IDS.has(id) || LONGBOAT_LINE_IDS.has(id) || CARAVEL_LINE_IDS.has(id) ||
                        name.includes('galley') || name.includes('galera') || 
                        name.includes('galleon') || name.includes('galeon') || 
                        name.includes('longboat') || name.includes('drakkar') || 
                        name.includes('caravel') || name.includes('carabela') ||
                        name.includes('sgaly') || name.includes('warga');

    const isExcludedFromArrow = name.includes('fire') || name.includes('cannon') ||
                                name.includes('frgal') || name.includes('canga') ||
                                FIRE_SHIP_IDS.has(id) || CANNON_GALLEON_IDS.has(id) || DROMON_IDS.has(id);

    if (isArrowShip && !isExcludedFromArrow) return 'ARROW_SHIP';

    return 'OTHER_SHIP'; // Fire ships, Demolition, Dromon, Cannon Galleon
  }

  function isShipUnit(unit) {
    if (!unit) return false;
    return getNavalCategory(unit) !== null || hasArmourClass(unit, CLASSES.SHIP);
  }

  function isCavalryArcherUnit(unit) {
    if (!unit) return false;
    return hasArmourClass(unit, CLASSES.ARCHER) && hasArmourClass(unit, CLASSES.CAVALRY);
  }

  const MOUNTED_CROSSBOW_IDS = new Set([2700, 2701]);

  function isMountedCrossbowUnit(unit) {
    if (!unit) return false;
    const uid = Number(unit.ID);
    if (MOUNTED_CROSSBOW_IDS.has(uid)) return true;
    const uname = String(unit.internal_name || '').toUpperCase().replace(/\s+/g, '_');
    if (uname.includes('MNTXBOW') || uname.includes('MOUNTED_CROSSBOW')) return true;
    if (hasArmourClass(unit, CLASSES.ARCHER) && hasArmourClass(unit, CLASSES.CAVALRY) && uid !== 39 && uid !== 474) {
      return true;
    }
    return false;
  }

  function isGambesonsUnit(unit) {
    if (!unit) return false;
    const uid = Number(unit.ID ?? unit.id);
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    const isMilitiaLine = [74, 75, 77, 473, 567, 1793].includes(uid) || 
                          name.includes("militia") || name.includes("man_at_arms") || 
                          name.includes("long_swordsman") || name.includes("longswordsman") || name.includes("two_handed") || 
                          name.includes("champion") || name.includes("legionary") ||
                          name.includes("hombre de armas") || name.includes("campeon") || name.includes("legionario");
    const isFireLancer = [1901, 1903].includes(uid) || name.includes("fire_lancer") || name.includes("lancero incendiario");
    const isVarangian = [2700, 2701, 2703, 2704].includes(uid) || name.includes("varangian") || name.includes("varego");

    return isMilitiaLine || isFireLancer || isVarangian;
  }

  function isMonaspa(unit) {
    if (!unit) return false;
    const uid = Number(unit.ID ?? unit.id);
    if (MONASPA_IDS.has(uid)) return true;
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    return name.includes("monaspa");
  }

  // =========================================================================
  // EXPORTACIÓN DE LA API PÚBLICA
  // =========================================================================

  return {
    CLASSES: CLASSES,
    TEMPLE_GUARD_BUFF_DURATION: TEMPLE_GUARD_BUFF_DURATION,
    TECH_AGE_MAP: TECH_AGE_MAP,
    CIV_UNIQUE_TECHS: CIV_UNIQUE_TECHS,
    resolveCivUniqueTechs: resolveCivUniqueTechs,
    checkUniqueTechRelevance: checkUniqueTechRelevance,
    initCombatant: initCombatant,
    applyCivBonusesFromJson: applyCivBonusesFromJson,
    calculateNetDamage: calculateNetDamage,
    calculateHTKandTTK: calculateHTKandTTK,
    simulateCombat: simulateCombat,
    simulateDuel: simulateDuel,
    getUnitTotalCost: getUnitTotalCost,
    isGunpowderUnit: isGunpowderUnit,
    isInfantryUnit: isInfantryUnit,
    isArcherUnit: isArcherUnit,
    isSpearmanUnit: isSpearmanUnit,
    isSkirmisherUnit: isSkirmisherUnit,
    isGambesonsUnit: isGambesonsUnit,
    isMonaspa: isMonaspa,
    isShipUnit: isShipUnit,
    isCavalryArcherUnit: isCavalryArcherUnit,
    isMountedCrossbowUnit: isMountedCrossbowUnit,
    isTempleGuardUnit: isTempleGuardUnit,
    createTempleGuardController: createTempleGuardController,
    getNavalCategory: getNavalCategory,
    getUnitRegenRate: getUnitRegenRate,
    isKhitanCiv: isKhitanCiv,
    hasLamellarArmor: hasLamellarArmor,
    isMountedOrCamel: isMountedOrCamel,
    getKhitanRegenRate: getKhitanRegenRate,
    getPoisonProfile: getPoisonProfile,
    ROCKET_CART_IDS: ROCKET_CART_IDS,
    isRocketCartUnit: isRocketCartUnit,
    getBallisticProfile: getBallisticProfile,
    calculateRocketCartDamage: calculateRocketCartDamage
  };
});
