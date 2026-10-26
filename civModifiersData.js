/**
 * civModifiersData.js
 * Registro Maestro Centralizado y Tipificado de Modificadores de Civilización
 * para Age of Empires II: Definitive Edition (56 Civilizaciones).
 *
 * Consolida tres familias críticas de modificadores:
 * 1. Bonificaciones de Velocidad de Entrenamiento / Cadencia Militar (Work Rates)
 * 2. Descuentos Dinámicos de Recursos en Unidades (Unit Cost Discounts)
 * 3. Tasas de Recolección, Depósito y Retención Económica (Eco Gathering & Farm Reseeding)
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.CIV_DETAILED_MODIFIERS = exports.CIV_DETAILED_MODIFIERS;
    global.civModifiersData = exports;
    Object.assign(global, exports);
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // =========================================================================
  // 1. CLASIFICACIÓN Y MAPEO DE IDENTIFICADORES DE UNIDADES (Genie Engine)
  // =========================================================================
  const UNIT_TAGS = {
    // Línea de infantería
    militia_line: [74, 75, 77, 473, 567, 1793],
    spearman_line: [93, 358, 359],
    eagle_line: [751, 752, 753],

    // Línea de arquería
    archer_line: [4, 24, 492],
    skirmisher_line: [7, 6, 1155],
    cavalry_archer_line: [39, 474],
    slinger: [185],
    hand_cannoneer: [5],

    // Línea de caballería
    scout_cavalry_line: [448, 546, 441, 1707],
    knight_line: [38, 283, 569, 1813],
    camel_line: [329, 330, 207, 1263],
    battle_elephant_line: [1132, 1134],
    steppe_lancer_line: [1370, 1372],

    // Maquinaria de Asedio
    battering_ram_line: [1258, 548, 422],
    mangonel_line: [280, 550, 420],
    scorpion_line: [279, 542],
    bombard_cannon: [36, 1105],
    trebuchet: [42],
    siege_tower: [1105],

    // Unidades de pólvora
    gunpowder_units: [5, 36, 420, 691, 46, 557, 771, 773, 1001, 1003, 1704, 1706, 1795, 1911],

    // Civiles y apoyo
    villager: [83, 118, 293, 305],
    petard: [440],
    centurion: [1800, 1802],
    magyar_huszar: [869, 871],
    serjeant: [1658, 1659, 1660, 1661]
  };

  /**
   * Determina si una unidad pertenece a una etiqueta / categoría
   */
  function unitMatchesTag(unit, tag) {
    if (!unit) return false;
    const uId = Number(unit.ID ?? unit.id ?? 0);
    const uCategory = String(unit.category || '').toLowerCase();

    if (tag === 'military') {
      return ['barracks', 'range', 'stable', 'siege', 'castle'].includes(uCategory) && uId !== 83;
    }
    if (tag === 'barracks') return uCategory === 'barracks';
    if (tag === 'range' || tag === 'archery_range') return uCategory === 'range' || uCategory === 'archery_range';
    if (tag === 'stable') return uCategory === 'stable';
    if (tag === 'siege' || tag === 'siege_workshop') return uCategory === 'siege' || uCategory === 'siege_workshop';
    if (tag === 'town_center') return uCategory === 'town_center' || UNIT_TAGS.villager.includes(uId);
    if (tag === 'castle') return uCategory === 'castle';
    if (tag === 'dock') return uCategory === 'dock';

    if (tag === 'gunpowder') {
      return UNIT_TAGS.gunpowder_units.includes(uId) || uId === 5 || uId === 36;
    }

    if (UNIT_TAGS[tag] && UNIT_TAGS[tag].includes(uId)) {
      return true;
    }

    return false;
  }

  // =========================================================================
  // 2. REGISTRO MAESTRO DE MODIFICADORES DETALLADOS POR CIVILIZACIÓN (56 CIVS)
  // =========================================================================
  const CIV_DETAILED_MODIFIERS = Object.freeze({
    generic: {
      name: 'Genérico',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {}
    },

    // 1. Armenios
    armenians: {
      name: 'Armenios',
      workRates: { church_monks: 1.0 },
      unitDiscounts: {},
      ecoModifiers: { muleCartTechsMultiplier: 1.25 }
    },

    // 2. Aztecas: Unidades militares se entrenan un +15% más rápido
    aztecs: {
      name: 'Aztecas',
      workRates: { military: 0.15 },
      unitDiscounts: {},
      ecoModifiers: {
        villagerCarryBonus: 3,
        relicGoldYieldMultiplier: 1.33
      }
    },

    // 3. Bengalíes
    bengalis: {
      name: 'Bengalíes',
      workRates: { elephant_line_attack_rate: 0.20 },
      unitDiscounts: {},
      ecoModifiers: { townCenterBonusVillagersPerAge: 2 }
    },

    // 4. Bereberes: Establo -15% Castillos / -20% Imperial; Alcazabas +25% castillos
    berbers: {
      name: 'Bereberes',
      workRates: {
        uniqueTechKasbah: { castle: 0.25 }
      },
      unitDiscounts: {
        stable: { castle: 0.15, imperial: 0.20 }
      },
      ecoModifiers: { villagerSpeedBonus: 1.10 }
    },

    // 5. Birmanos: Mejoras de maderero gratis
    burmese: {
      name: 'Birmanos',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        freeEcoTechs: { feudal: ['double_bit_axe'], castle: ['bow_saw'], imperial: ['two_man_saw'] }
      }
    },

    // 6. Bizantinos: Camellos, guerrilleros y lanceros -25%
    byzantines: {
      name: 'Bizantinos',
      workRates: { monks_healing: 1.0 },
      unitDiscounts: {
        spearman_line: 0.25,
        skirmisher_line: 0.25,
        camel_line: 0.25
      },
      ecoModifiers: { imperialAgeDiscount: 0.33 }
    },

    // 7. Bohemios: Minería gratis
    bohemians: {
      name: 'Bohemios',
      workRates: { market: 0.80 },
      unitDiscounts: {},
      ecoModifiers: {
        freeEcoTechs: { feudal: ['gold_mining', 'stone_mining'], castle: ['gold_shaft_mining', 'stone_shaft_mining'] }
      }
    },

    // 8. Borgoñones: Mejoras económicas disponibles una edad antes y -33% comida
    burgundians: {
      name: 'Borgoñones',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { earlyEcoTechs: true, ecoTechFoodDiscount: 0.33 }
    },

    // 9. Britanos: Galerías +10% más rápido; pastores +25%
    britons: {
      name: 'Britanos',
      workRates: { archery_range: 0.10 },
      unitDiscounts: {},
      ecoModifiers: {
        gatherMultipliers: { sheep: 1.25 },
        townCenterWoodCostDiscount: { castle: 0.50, imperial: 0.50 }
      }
    },

    // 10. Búlgaros: Herreros trabajan +80% más rápido
    bulgarians: {
      name: 'Búlgaros',
      workRates: { blacksmith: 0.80 },
      unitDiscounts: {},
      ecoModifiers: { blacksmithFoodDiscount: 0.50 }
    },

    // 11. Celtas: Talleres de asedio +20% más rápido; leñadores +15%
    celts: {
      name: 'Celtas',
      workRates: { siege_workshop: 0.20 },
      unitDiscounts: {},
      ecoModifiers: {
        gatherMultipliers: { wood: 1.15 }
      }
    },

    // 12. Chinos: Comienzan con +3 aldeanos (-50 madera, -200 comida); tecnologías más baratas
    chinese: {
      name: 'Chinos',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        startExtraVillagers: 3,
        techDiscountByAge: { feudal: 0.05, castle: 0.10, imperial: 0.15 }
      }
    },

    // 13. Coreanos: Canteros +20% más rápido; unidades militares -20% madera
    koreans: {
      name: 'Coreanos',
      workRates: {},
      unitDiscounts: {
        militaryWoodDiscount: 0.20 // No aplica a asedio
      },
      ecoModifiers: {
        gatherMultipliers: { stone: 1.20 }
      }
    },

    // 14. Cumanos: Ganadería de la estepa (+100% velocidad en exploradores, lanceros esteparios y arqueros a caballo)
    cumans: {
      name: 'Cumanos',
      workRates: {
        uniqueTechSteppeHusbandry: {
          scout_cavalry_line: 1.00,
          steppe_lancer_line: 1.00,
          cavalry_archer_line: 1.00
        }
      },
      unitDiscounts: {},
      ecoModifiers: {
        secondFeudalTownCenter: true,
        militaryBuildingWoodDiscount: 75
      }
    },

    // 15. Daneses (Mod): +5% a toda la comida entregada
    danes: {
      name: 'Daneses',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        foodDropOffYield: 1.05
      }
    },

    // 16. Dravídicos: +200 madera por cambio de edad
    dravidians: {
      name: 'Dravídicos',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { bonusWoodPerAge: 200 }
    },

    // 17. Eslavos: Granjas +15% velocidad de recolección
    slavs: {
      name: 'Eslavos',
      workRates: {},
      unitDiscounts: { siege_workshop: 0.15 },
      ecoModifiers: { farmRateMultiplier: 1.15 }
    },

    // 18. Españoles: Constructores trabajan +30% más rápido
    spanish: {
      name: 'Españoles',
      workRates: { builders: 0.30 },
      unitDiscounts: {},
      ecoModifiers: { blacksmithGoldFree: true }
    },

    // 19. Etíopes: +100 alimento y +100 oro por cambio de edad
    ethiopians: {
      name: 'Etíopes',
      workRates: { archery_range_fire_rate: 0.18 },
      unitDiscounts: {},
      ecoModifiers: { advanceFoodGoldBonus: 100 }
    },

    // 20. Francos: Recolectores bayas +15%; mejoras granja gratis; Caballería (establos +40%)
    franks: {
      name: 'Francos',
      workRates: {
        uniqueTechChivalry: { stable: 0.40 }
      },
      unitDiscounts: {},
      ecoModifiers: {
        gatherMultipliers: { foraging: 1.15 },
        freeEcoTechs: { feudal: ['horse_collar'], castle: ['heavy_plow'], imperial: ['crop_rotation'] }
      }
    },

    // 21. Georgianos: Carro de mulas de inicio; iglesias fortificadas aumentan trabajo
    georgians: {
      name: 'Georgianos',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { startWithMuleCart: true }
    },

    // 22. Godos: Cuarteles +20%; Movilización +100%; Infantería -15/-20/-25/-30%
    goths: {
      name: 'Godos',
      workRates: {
        barracks: 0.20,
        uniqueTechPerfusion: { barracks: 1.00 }
      },
      unitDiscounts: {
        infantry: { dark: 0.15, feudal: 0.20, castle: 0.25, imperial: 0.30 }
      },
      ecoModifiers: {
        instantLoom: true,
        huntingCarryBonus: 15,
        huntingDurationMultiplier: 1.20
      }
    },

    // 23. Gurjaras: Camellos y elefantes entrenan +25% más rápido; Chatrias (-25% comida militar)
    gurjaras: {
      name: 'Gurjaras',
      workRates: {
        camel_line: 0.25,
        elephant_line: 0.25
      },
      unitDiscounts: {
        uniqueTechKshatriyas: { military_food: 0.25 }
      },
      ecoModifiers: { millLivestockGarrison: true }
    },

    // 24. Hindustanos: Aldeanos -8% / -13% / -18% / -23% según edad
    hindustanis: {
      name: 'Hindustaníes',
      workRates: { camel_line_attack_rate: 0.20 },
      unitDiscounts: {
        villager: { dark: 0.08, feudal: 0.13, castle: 0.18, imperial: 0.23 }
      },
      ecoModifiers: {}
    },

    // 25. Hunos: Establos +20% más rápido; arqueros a caballo -10% / -20%
    huns: {
      name: 'Hunos',
      workRates: { stable: 0.20 },
      unitDiscounts: {
        cavalry_archer_line: { castle: 0.10, imperial: 0.20 }
      },
      ecoModifiers: { noHousesNeeded: true }
    },

    // 26. Incas: Comida de unidades militares -15% / -20% / -25% / -30%
    incas: {
      name: 'Incas',
      workRates: {},
      unitDiscounts: {
        military_food: { dark: 0.15, feudal: 0.20, castle: 0.25, imperial: 0.30 }
      },
      ecoModifiers: { housePopTen: true }
    },

    // 27. Italianos: Pólvora -20%; barco de pesca -15%; avance edad -15%
    italians: {
      name: 'Italianos',
      workRates: {},
      unitDiscounts: {
        gunpowder_units: 0.20,
        fishing_ship: 0.15
      },
      ecoModifiers: { ageAdvanceDiscount: 0.15 }
    },

    // 28. Japoneses: Barcos de pesca +5/+10/+15/+20%; molinos y campamentos -50% madera
    japanese: {
      name: 'Japoneses',
      workRates: { fishing_ship: { dark: 0.05, feudal: 0.10, castle: 0.15, imperial: 0.20 } },
      unitDiscounts: {},
      ecoModifiers: { dropOffBuildingsWoodCostDiscount: 0.50 }
    },

    // 29. Jemeres: Granjas perfectas sin depósito intermedio
    khmer: {
      name: 'Jemeres',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { perfectFarmRate: true }
    },

    // 30. Jurchen (Mod): Dinámicas de asedio y caballería
    jurchens: {
      name: 'Jurchen',
      workRates: { mounted_units_attack_rate: 0.25 },
      unitDiscounts: {},
      ecoModifiers: { siegeTechWoodDiscount: 0.75 }
    },

    // 31. Khitanes (Mod): Guerrilleros, lanceros y scout entrenan +15% más rápido; Pasturas sin resiembra
    khitans: {
      name: 'Khitanes',
      workRates: {
        skirmisher_line: 0.15,
        spearman_line: 0.15,
        scout_cavalry_line: 0.15
      },
      unitDiscounts: {},
      ecoModifiers: {
        usesPastures: true,
        farmOverheadFree: true
      }
    },

    // 32. Lituanos: +150 comida de inicio; lanceros y guerrilleros +10% veloc. movimiento
    lithuanians: {
      name: 'Lituanos',
      workRates: { monastery: 0.20 },
      unitDiscounts: {},
      ecoModifiers: { startExtraFood: 150 }
    },

    // 33. Magiares: Arqueros a caballo +25% cadencia entrenamiento; Explorador -15%; Corviniano sin oro
    magyars: {
      name: 'Magiares',
      workRates: { cavalry_archer_line: 0.25 },
      unitDiscounts: {
        scout_cavalry_line: 0.15,
        uniqueTechCorvinianArmy: { magyar_huszar_no_gold: true }
      },
      ecoModifiers: { freeMeleeAttackTechs: true }
    },

    // 34. Malayos: Elefantes de combate -25% / -35%; avance edad +66% velocidad
    malay: {
      name: 'Malayos',
      workRates: {},
      unitDiscounts: {
        battle_elephant_line: { castle: 0.25, imperial: 0.35 }
      },
      ecoModifiers: { ageAdvanceSpeedMultiplier: 1.66 }
    },

    // 35. Malienses: +10% oro depositado; minería de oro gratis; edificios -15% madera
    malians: {
      name: 'Malienses',
      workRates: { university: 0.80 },
      unitDiscounts: {},
      ecoModifiers: {
        goldDropOffYield: 1.10,
        freeEcoTechs: { feudal: ['gold_mining'], castle: ['gold_shaft_mining'] },
        buildingWoodCostDiscount: 0.15
      }
    },

    // 36. Mapuches (Mod): +25% comida de arbustos/bayas depositada
    mapuche: {
      name: 'Mapuches',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        foragingDropOffYield: 1.25
      }
    },

    // 37. Mayas: Arqueros a pie -10% / -20% / -30%; recursos duran un 15% más
    mayans: {
      name: 'Mayas',
      workRates: {},
      unitDiscounts: {
        foot_archer: { feudal: 0.10, castle: 0.20, imperial: 0.30 }
      },
      ecoModifiers: {
        resourceDurationMultiplier: 1.15
      }
    },

    // 38. Mongoles: Cazadores trabajan +40% más rápido
    mongols: {
      name: 'Mongoles',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        gatherMultipliers: { hunting: 1.40 }
      }
    },

    // 39. Muiscas (Mod): Huaracas (+50% velocidad en soldados con honda); avance edad -50% oro
    muisca: {
      name: 'Muiscas',
      workRates: {
        uniqueTechHuaracas: { slinger: 0.50 }
      },
      unitDiscounts: {},
      ecoModifiers: {
        ageAdvanceGoldDiscount: 0.50,
        goldDepositDurationMultiplier: 1.15
      }
    },

    // 40. Persas: Centros Urbanos y Muelles trabajan +5%/+10%/+15%/+20%; Kamandaran (oro arquero a madera)
    persians: {
      name: 'Persas',
      workRates: {
        town_center: { dark: 0.05, feudal: 0.10, castle: 0.15, imperial: 0.20 },
        dock: { dark: 0.05, feudal: 0.10, castle: 0.15, imperial: 0.20 }
      },
      unitDiscounts: {
        uniqueTechKamandaran: { archer_line_gold_to_wood: true }
      },
      ecoModifiers: { startExtraWoodFood: 50 }
    },

    // 41. Polacos: Folwark recoge 10% comida inmediata; mineros de piedra generan oro
    poles: {
      name: 'Polacos',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { folwarkInstantYieldRatio: 0.10, stoneMinersGenerateGoldRatio: 0.50 }
    },

    // 42. Portugueses: Todas las unidades -20% de oro; tecnologías investigan +25% más rápido
    portuguese: {
      name: 'Portugueses',
      workRates: { technologies: 0.25 },
      unitDiscounts: {
        all_units_gold: 0.20
      },
      ecoModifiers: { feitoriaAvailable: true }
    },

    // 43. Romanos: Aldeanos recolectan +5%; Comitatenses (+50% velocidad en milicia, caballeros y centuriones)
    romans: {
      name: 'Romanos',
      workRates: {
        uniqueTechComitatenses: {
          militia_line: 0.50,
          knight_line: 0.50,
          centurion: 0.50
        }
      },
      unitDiscounts: {
        scorpion_line: { gold: 0.50 }
      },
      ecoModifiers: {
        globalGatherMultiplier: 1.05
      }
    },

    // 44. Sajones (Mod): Monjes entrenan +33% más rápido
    saxons: {
      name: 'Sajones',
      workRates: { monk: 0.33, repairers: 0.25 },
      unitDiscounts: {},
      ecoModifiers: {}
    },

    // 45. Sarracenos: Tarifa de mercado plana al 5%
    saracens: {
      name: 'Sarracenos',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { marketCommodityFee: 0.05 }
    },

    // 46. Shu (Mod): Leñadores generan +15% de comida secundaria
    shu: {
      name: 'Shu',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        woodcuttersGenerateFoodRatio: 0.15
      }
    },

    // 47. Sicilianos: Mejoras de granja añaden +125% comida; centros urbanos se construyen +100%
    sicilians: {
      name: 'Sicilianos',
      workRates: { town_center_builder: 1.00 },
      unitDiscounts: {},
      ecoModifiers: {
        farmCapacityBonusMultiplier: 1.25
      }
    },

    // 48. Tártaros: Animales de pastoreo contienen +50% comida
    tatars: {
      name: 'Tártaros',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { herdablesCapacityMultiplier: 1.50 }
    },

    // 49. Teutones: Granjas cuestan 36 de madera (-40%)
    teutons: {
      name: 'Teutones',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        farmWoodCost: 36
      }
    },

    // 50. Tupís (Mod): Bonos de recolección y alimentos silvestres
    tupi: {
      name: 'Tupís',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: { foragingBonus: 1.25 }
    },

    // 51. Turcos: Mineros de oro +25%; Unidades de pólvora entrenan +25% más rápido
    turks: {
      name: 'Turcos',
      workRates: {
        gunpowder: 0.25
      },
      unitDiscounts: {},
      ecoModifiers: {
        gatherMultipliers: { gold: 1.25 },
        freeChemistry: true
      }
    },

    // 52. Varegos (Mod): Bonos navales y guardias varegos
    varangians: {
      name: 'Varegos',
      workRates: { varangian_guard_attack: 0.25 },
      unitDiscounts: {},
      ecoModifiers: { varangianGoldGeneration: 0.50 }
    },

    // 53. Vietnamitas: Conscription (Leva) gratis en Imperial
    vietnamese: {
      name: 'Vietnamitas',
      workRates: {},
      unitDiscounts: {},
      ecoModifiers: {
        freeEcoTechsNoWood: true,
        freeMilitaryTechs: { imperial: ['conscription'] }
      }
    },

    // 54. Vikingos: Carretilla y Carro de mano gratis
    vikings: {
      name: 'Vikingos',
      workRates: {},
      unitDiscounts: { warships: { feudal: 0.15, castle: 0.15, imperial: 0.20 } },
      ecoModifiers: {
        freeEcoTechs: { feudal: ['wheelbarrow'], castle: ['hand_cart'] }
      }
    },

    // 55. Wei (Mod): Infantería y estructuras defensivas
    wei: {
      name: 'Wei',
      workRates: { barracks: 0.15 },
      unitDiscounts: {},
      ecoModifiers: {}
    },

    // 56. Wu (Mod): Construcción y arquería
    wu: {
      name: 'Wu',
      workRates: { archery_range: 0.15, house_builders: 1.00 },
      unitDiscounts: {},
      ecoModifiers: {}
    }
  });

  // Alias comunes
  const CIV_ALIASES = {
    muiscas: 'muisca',
    jurchen: 'jurchens',
    daneses: 'danes',
    varegos: 'varangians',
    sajones: 'saxons'
  };

  /**
   * Normaliza el identificador de civilización
   */
  function normalizeCivId(civId) {
    if (!civId) return 'generic';
    const norm = String(civId).toLowerCase().trim().replace(/[\s\-]+/g, '_');
    return CIV_ALIASES[norm] || norm;
  }

  // =========================================================================
  // 3. MOTOR DE RESOLUCIÓN DE CADENCIA DE TRABAJO (Work Rate) Y T_TRAIN
  // =========================================================================

  /**
   * Resuelve el modificador de velocidad de entrenamiento (Work Rate)
   * Fórmula canónica:
   * Work Rate = 1 + Sum(Bonos Civ) + (Leva ? 0.3333 : 0)
   *
   * @param {Object} unit Objeto de unidad ({ id, category, trainTime, ... })
   * @param {string} civId Identificador de civilización
   * @param {string} [age='castle'] 'dark' | 'feudal' | 'castle' | 'imperial'
   * @param {Array<string>|Set<string>} [activeTechs=[]] Lista de tecnologías activas (ej. 'conscription', 'perfusion')
   * @param {Object} [options={}] Opciones auxiliares
   * @returns {{ workRate: number, baseWorkRate: number, civBonus: number, conscriptionBonus: number, breakdown: string[] }}
   */
  function resolveCivWorkRate(unit, civId, age = 'castle', activeTechs = [], options = {}) {
    const cId = normalizeCivId(civId);
    const civData = CIV_DETAILED_MODIFIERS[cId] || CIV_DETAILED_MODIFIERS.generic;
    const wr = civData.workRates || {};

    const techsSet = activeTechs instanceof Set ? activeTechs : new Set(activeTechs || []);
    const isMilitary = unitMatchesTag(unit, 'military');
    const uCategory = String(unit.category || '').toLowerCase();
    const uId = Number(unit.ID ?? unit.id ?? 0);

    let civBonus = 0.0;
    const breakdown = [];

    // 1. Aztecas: Unidades militares se entrenan un +15% más rápido
    if (cId === 'aztecs' && isMilitary) {
      civBonus += 0.15;
      breakdown.push('Aztecas: +15% velocidad militar');
    }

    // 2. Godos: Cuarteles +20% (bono equipo) y Movilización/Perfusion +100%
    if (cId === 'goths' && uCategory === 'barracks') {
      civBonus += 0.20;
      breakdown.push('Godos: +20% cuarteles (bono equipo)');

      // Perfusion disponible en Imperial (o si está activada explícitamente)
      const hasPerfusion = techsSet.has('perfusion') || (age === 'imperial');
      if (hasPerfusion) {
        civBonus += 1.00;
        breakdown.push('Godos: +100% Movilización (Perfusion)');
      }
    }

    // 3. Hunos: Establos +20% más rápido
    if (cId === 'huns' && uCategory === 'stable') {
      civBonus += 0.20;
      breakdown.push('Hunos: +20% establos');
    }

    // 4. Britanos: Galerías de tiro con arco +10% más rápido (bono equipo)
    if (cId === 'britons' && (uCategory === 'range' || uCategory === 'archery_range')) {
      civBonus += 0.10;
      breakdown.push('Britanos: +10% galerías de tiro');
    }

    // 5. Celtas: Talleres de maquinaria de asedio +20% más rápido (bono equipo)
    if (cId === 'celts' && (uCategory === 'siege' || uCategory === 'siege_workshop')) {
      civBonus += 0.20;
      breakdown.push('Celtas: +20% talleres de asedio');
    }

    // 6. Turcos: Unidades de pólvora se entrenan un +25% más rápido
    if (cId === 'turks' && unitMatchesTag(unit, 'gunpowder')) {
      civBonus += 0.25;
      breakdown.push('Turcos: +25% unidades de pólvora');
    }

    // 7. Persas: Centros urbanos y muelles trabajan +5% / +10% / +15% / +20% según edad
    if (cId === 'persians') {
      if (uCategory === 'town_center' || UNIT_TAGS.villager.includes(uId)) {
        const rateMap = { dark: 0.05, feudal: 0.10, castle: 0.15, imperial: 0.20 };
        const tcRate = rateMap[age] || 0.15;
        civBonus += tcRate;
        breakdown.push(`Persas: +${Math.round(tcRate * 100)}% centros urbanos (${age})`);
      }
    }

    // 8. Romanos: Comitatenses (+50% velocidad en milicia, caballeros y centuriones)
    if (cId === 'romans') {
      const isComitatensesUnit = UNIT_TAGS.militia_line.includes(uId) ||
                                 UNIT_TAGS.knight_line.includes(uId) ||
                                 UNIT_TAGS.centurion.includes(uId);
      const hasComitatenses = techsSet.has('comitatenses') || (age === 'imperial');
      if (isComitatensesUnit && hasComitatenses) {
        civBonus += 0.50;
        breakdown.push('Romanos: +50% Comitatenses');
      }
    }

    // 9. Gurjaras: Unidades de camello y elefante entrenan un +25% más rápido
    if (cId === 'gurjaras') {
      const isCamelOrElephant = UNIT_TAGS.camel_line.includes(uId) ||
                                UNIT_TAGS.battle_elephant_line.includes(uId);
      if (isCamelOrElephant) {
        civBonus += 0.25;
        breakdown.push('Gurjaras: +25% camellos y elefantes');
      }
    }

    // 10. Khitanes (Mod): Guerrilleros, lanceros y scout entrenan +15% más rápido
    if (cId === 'khitans') {
      const isKhitanTrio = UNIT_TAGS.skirmisher_line.includes(uId) ||
                           UNIT_TAGS.spearman_line.includes(uId) ||
                           UNIT_TAGS.scout_cavalry_line.includes(uId);
      if (isKhitanTrio) {
        civBonus += 0.15;
        breakdown.push('Khitanes: +15% guerrilleros, lanceros y caballería ligera');
      }
    }

    // 11. Muiscas (Mod): Huaracas (+50% velocidad en honderos)
    if (cId === 'muisca') {
      const isSlinger = UNIT_TAGS.slinger.includes(uId) || (unit.name && unit.name.toLowerCase().includes('honda'));
      const hasHuaracas = techsSet.has('huaracas') || (age === 'castle' || age === 'imperial');
      if (isSlinger && hasHuaracas) {
        civBonus += 0.50;
        breakdown.push('Muiscas: +50% Huaracas (honderos)');
      }
    }

    // 12. Cumanos: Ganadería de la estepa (+100% velocidad en scout, steppe lancer y cavalry archer)
    if (cId === 'cumans') {
      const isSteppeUnit = UNIT_TAGS.scout_cavalry_line.includes(uId) ||
                           UNIT_TAGS.steppe_lancer_line.includes(uId) ||
                           UNIT_TAGS.cavalry_archer_line.includes(uId);
      const hasSteppeHusbandry = techsSet.has('steppe_husbandry') || (age === 'castle' || age === 'imperial');
      if (isSteppeUnit && hasSteppeHusbandry) {
        civBonus += 1.00;
        breakdown.push('Cumanos: +100% Ganadería de la estepa');
      }
    }

    // 13. Francos: Caballería (Chivalry) establos +40%
    if (cId === 'franks' && uCategory === 'stable') {
      const hasChivalry = techsSet.has('chivalry') || (age === 'castle' || age === 'imperial');
      if (hasChivalry) {
        civBonus += 0.40;
        breakdown.push('Francos: +40% Caballería (Chivalry)');
      }
    }

    // 14. Magiares: Arqueros a caballo +25% velocidad (bono equipo)
    if (cId === 'magyars' && UNIT_TAGS.cavalry_archer_line.includes(uId)) {
      civBonus += 0.25;
      breakdown.push('Magiares: +25% arqueros a caballo');
    }

    // 15. TECNOLOGÍA LEVA (Conscription): +33.33% velocidad de entrenamiento selectiva
    // Aplica a: Cuarteles, Galerías de tiro con arco, Establos, Castillos y Donjons
    // NO aplica a: Talleres de maquinaria de asedio, Centros urbanos, Muelles ni Monasterios
    let conscriptionBonus = 0.0;
    const bldLower = String(unit.building || '').toLowerCase();
    const isConscriptionBuilding = ['barracks', 'range', 'archery_range', 'stable', 'castle', 'donjon'].includes(uCategory) ||
                                   bldLower.includes('cuartel') || bldLower.includes('barracks') ||
                                   bldLower.includes('galer') || bldLower.includes('range') ||
                                   bldLower.includes('establo') || bldLower.includes('stable') ||
                                   bldLower.includes('castillo') || bldLower.includes('castle') ||
                                   bldLower.includes('donjon') || bldLower.includes('torreón') || bldLower.includes('torreon') ||
                                   [1658, 1659, 1660, 1661, 185, 331, 440].includes(uId);
    const isConscriptionExcluded = ['siege', 'siege_workshop', 'town_center', 'dock', 'monastery'].includes(uCategory) ||
                                   bldLower.includes('taller') || bldLower.includes('asedio') || bldLower.includes('workshop') ||
                                   bldLower.includes('centro') || bldLower.includes('muelle') || bldLower.includes('monasterio');
    const appliesConscription = isConscriptionBuilding && !isConscriptionExcluded;
    const hasConscription = techsSet.has('conscription') || (cId === 'vietnamese' && age === 'imperial');

    if (appliesConscription && hasConscription) {
      conscriptionBonus = 0.3333;
      breakdown.push(cId === 'vietnamese' ? 'Vietnamitas: Leva gratis (+33.3%)' : 'Leva (Conscription): +33.3%');
    }

    const baseWorkRate = 1.0;
    const totalWorkRate = Math.round((baseWorkRate + civBonus + conscriptionBonus) * 10000) / 10000;

    return {
      workRate: totalWorkRate,
      baseWorkRate,
      civBonus: Math.round(civBonus * 10000) / 10000,
      conscriptionBonus: Math.round(conscriptionBonus * 10000) / 10000,
      breakdown
    };
  }

  /**
   * Resuelve el tiempo de entrenamiento efectivo de una unidad:
   * T_train_efectivo = T_base / WorkRate
   */
  function resolveEffectiveTrainTime(unit, civId, age = 'castle', activeTechs = [], options = {}) {
    const rawTime = Number(unit.TrainTime ?? unit.trainTime ?? 25);
    const baseTrainTime = Math.max(1, rawTime);

    const wrData = resolveCivWorkRate(unit, civId, age, activeTechs, options);
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
   * Retorna los modificadores económicos de una civilización
   */
  function getCivEcoModifiers(civId) {
    const cId = normalizeCivId(civId);
    const civData = CIV_DETAILED_MODIFIERS[cId] || CIV_DETAILED_MODIFIERS.generic;
    return civData.ecoModifiers || {};
  }

  return {
    UNIT_TAGS,
    CIV_DETAILED_MODIFIERS,
    normalizeCivId,
    unitMatchesTag,
    resolveCivWorkRate,
    resolveEffectiveTrainTime,
    getCivEcoModifiers
  };
});