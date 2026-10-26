/**
 * civUnitDiscounts.js
 * Registro Maestro de Descuentos en Coste de Unidades para Age of Empires II: DE
 * y Facciones del Mod (56 Civilizaciones Vigentes).
 *
 * Módulo auditable y estructurado con respaldo textual literal de strings oficiales.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(
      typeof require === 'function' ? (function () {
        try { return require('./civilizations.js'); } catch (e) { return null; }
      })() : null
    );
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory(global.civilizationsModule);
    global.CIV_UNIT_DISCOUNTS = exports.CIV_UNIT_DISCOUNTS;
    global.CIV_UNIT_COST_CONVERSIONS = exports.CIV_UNIT_COST_CONVERSIONS;
    global.UNIT_CLASSES = exports.UNIT_CLASSES;
    global.getCivUnitDiscounts = exports.getCivUnitDiscounts;
    global.calculateDiscountedCost = exports.calculateDiscountedCost;
    global.hasUnitDiscount = exports.hasUnitDiscount;
    global.civUnitDiscounts = exports;
    global.civUnitDiscountsModule = exports;
  }
})(typeof window !== 'undefined' ? window : this, function (civMod) {
  'use strict';

  // =========================================================================
  // CLASIFICACIÓN DE UNIDADES E IDENTIFICADORES CANÓNICOS (Genie Engine)
  // =========================================================================
  const UNIT_CLASSES = {
    villager: [83, 118, 293, 305],
    mule_cart: [1808],
    trade_units: [128, 204, 17], // Trade Cart, Trade Cog
    fishing_ship: [13],
    transport_ship: [545],

    // Líneas militares terrestres
    militia_line: [74, 75, 77, 473, 567, 1793], // Milicia hasta Campeón / Legionario
    spearman_line: [74, 93, 358, 359], // Lancero, Piquero, Alabardero
    scout_cavalry_line: [448, 546, 441, 1707], // Explorador, Caballería ligera, Husar, Husar alado
    knight_line: [38, 283, 569, 1813], // Caballero, Jinete, Paladín
    camel_rider_line: [329, 330, 207, 1263], // Camello, Camello pesado, Camello imperial
    battle_elephant_line: [1132, 1134], // Elefante de combate, Elefante de combate de élite
    steppe_lancer_line: [1370, 1372], // Lancero estepario, Lancero estepario de élite
    archer_line: [4, 24, 492], // Arquero, Ballestero, Arbalestero
    skirmisher_line: [6, 7, 1155], // Guerrillero, Guerrillero de élite, Guerrillero imperial
    cavalry_archer_line: [39, 474], // Arquero a caballo, Arquero a caballo pesado
    plumed_archer_line: [763, 765], // Arquero de plumas, Arquero de plumas de élite
    slinger: [185], // Soldado con honda / Hondero (Incas, Muiscas, Tupíes)
    huskarl_line: [41, 555, 759, 761], // Huscarle, Huscarle de élite (Castillo y Cuartel)
    condottiero: [882], // Condotiero
    mounted_crossbowman: [1850, 1852], // Ballestero a caballo (Francos UT)
    bolas_rider: [2569, 2571], // Jinete con boleadoras (Mapuches)

    // Unidades de asedio
    battering_ram_line: [1258, 548, 422], // Ariete, Ariete cubierto, Ariete de asedio
    mangonel_line: [280, 550, 420], // Mangonel, Onagro, Onagro de asedio
    scorpion_line: [279, 542], // Escorpión, Escorpión pesado
    bombard_cannon: [36, 1105], // Cañón de asedio, Houfnice
    siege_tower: [1105], // Torre de asedio
    armored_elephant_line: [1744, 1746], // Elefante acorazado / asedio (Dynasties of India)
    traction_trebuchet: [1800, 1942], // Trebuchet a tracción (Tres Reinos)

    // Buques de guerra
    warships: [
      21, 442, 539,   // Galera, Galera de guerra, Galeón
      529, 532, 1103, // Galera incendiaria, Barco incendiario, Barco incendiario rápido
      527, 528, 1104, // Balsa de demolición, Barco de demolición, Barco de demolición pesado
      250, 533,       // Drakkar, Drakkar de élite
      831, 832,       // Barco tortuga, Barco tortuga de élite
      1004, 1006,     // Carabela, Carabela de élite
      1750,           // Thirisadai
      1795,           // Dromon
      1948,           // Lou Chuan
      2626, 2627, 2628 // Hulk, War Hulk, Carrack
    ],

    // Unidades de pólvora terrestres y navales
    gunpowder_units: [
      5, 36, 420, 691, 46, 557, 771, 773, 1001, 1003, 1704, 1706, 1795, 1911
    ]
  };

  // Agrupaciones compuestas de clases
  UNIT_CLASSES.siege_weapons = [
    ...UNIT_CLASSES.battering_ram_line,
    ...UNIT_CLASSES.mangonel_line,
    ...UNIT_CLASSES.scorpion_line,
    ...UNIT_CLASSES.bombard_cannon,
    ...UNIT_CLASSES.siege_tower,
    ...UNIT_CLASSES.armored_elephant_line
  ];
  UNIT_CLASSES.siege_workshop_units = UNIT_CLASSES.siege_weapons;
  UNIT_CLASSES.stable_units = [
    ...UNIT_CLASSES.scout_cavalry_line,
    ...UNIT_CLASSES.knight_line,
    ...UNIT_CLASSES.camel_rider_line,
    ...UNIT_CLASSES.battle_elephant_line,
    ...UNIT_CLASSES.steppe_lancer_line
  ];
  UNIT_CLASSES.foot_archers = [
    ...UNIT_CLASSES.archer_line,
    ...UNIT_CLASSES.skirmisher_line,
    ...UNIT_CLASSES.plumed_archer_line,
    ...UNIT_CLASSES.slinger
  ];
  UNIT_CLASSES.infantry = [
    ...UNIT_CLASSES.militia_line,
    ...UNIT_CLASSES.spearman_line,
    ...UNIT_CLASSES.huskarl_line,
    751, 752, 753, 755, 757, // Línea de águilas
    ...UNIT_CLASSES.condottiero,
    185,       // Soldado con honda / Slinger
    2705, 2706 // Tropa del hogar
  ];

  // Jerarquía de pertenencia semántica de clases
  const CLASS_HIERARCHY = {
    siege_weapons: ['battering_ram_line', 'mangonel_line', 'scorpion_line', 'bombard_cannon', 'siege_tower', 'armored_elephant_line', 'traction_trebuchet'],
    siege_workshop_units: ['battering_ram_line', 'mangonel_line', 'scorpion_line', 'bombard_cannon', 'siege_tower', 'armored_elephant_line', 'traction_trebuchet'],
    stable_units: ['scout_cavalry_line', 'knight_line', 'camel_rider_line', 'battle_elephant_line', 'steppe_lancer_line'],
    foot_archers: ['archer_line', 'skirmisher_line', 'plumed_archer_line', 'composite_bowman'],
    infantry: ['militia_line', 'spearman_line', 'eagle_warrior_line', 'condottiero', 'slinger', 'huskarl_line', 'hearth_troop_line'],
    military_units: [
      'infantry', 'militia_line', 'spearman_line', 'archer_line', 'skirmisher_line',
      'cavalry_archer_line', 'foot_archers', 'scout_cavalry_line', 'knight_line',
      'camel_rider_line', 'battle_elephant_line', 'steppe_lancer_line', 'stable_units',
      'siege_weapons', 'siege_workshop_units', 'battering_ram_line', 'mangonel_line',
      'scorpion_line', 'bombard_cannon', 'warships', 'gunpowder_units', 'bolas_rider',
      'mounted_crossbowman', 'traction_trebuchet', 'lou_chuan'
    ]
  };

  // =========================================================================
  // CATÁLOGO COMPLETO DE BONIFICACIONES DE DESCUENTO EN UNIDADES (56 CIVS)
  // =========================================================================
  const CIV_UNIT_DISCOUNTS = {
    // -----------------------------------------------------------------------
    // Genérico (Base neutra sin bonificaciones)
    // -----------------------------------------------------------------------
    generic: [],

    // -----------------------------------------------------------------------
    // 1. Armenios (armenians)
    // -----------------------------------------------------------------------
    armenians: [
      {
        id: "armenians_mule_cart_discount",
        name: "Descuento en Carros de Mulas",
        type: "passive",
        targetClass: ["mule_cart"],
        targetUnits: UNIT_CLASSES.mule_cart,
        resource: "all",
        discountByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 },
        sourceDescription: "Los carros de mulas cuestan un 25 % menos",
        sourceDescriptionEn: "Mule Carts cost -25%"
      }
    ],

    // -----------------------------------------------------------------------
    // 2. Aztecas (aztecas) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    aztecs: [],

    // -----------------------------------------------------------------------
    // 3. Bengalíes (bengalis) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    bengalis: [],

    // -----------------------------------------------------------------------
    // 4. Bereberes (berbers)
    // -----------------------------------------------------------------------
    berbers: [
      {
        id: "berbers_stable_units_discount",
        name: "Descuento en Unidades de Establo",
        type: "passive",
        targetClass: [
          "stable_units",
          "scout_cavalry_line",
          "knight_line",
          "camel_rider_line",
          "battle_elephant_line",
          "steppe_lancer_line"
        ],
        targetUnits: [
          ...UNIT_CLASSES.scout_cavalry_line,
          ...UNIT_CLASSES.knight_line,
          ...UNIT_CLASSES.camel_rider_line,
          ...UNIT_CLASSES.battle_elephant_line,
          ...UNIT_CLASSES.steppe_lancer_line
        ],
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0.15, imperial: 0.20 },
        sourceDescription: "Las unidades de los establos cuestan un 15 % menos en la Edad de los Castillos y un 20 % menos en la Edad Imperial",
        sourceDescriptionEn: "Stable units cost -15% in Castle, -20% in Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 5. Birmanos (burmese) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    burmese: [],

    // -----------------------------------------------------------------------
    // 6. Bizantinos (byzantines)
    // -----------------------------------------------------------------------
    byzantines: [
      {
        id: "byzantines_trash_discount",
        name: "Descuento en Camellos, Guerrilleros y Lanceros",
        type: "passive",
        targetClass: ["camel_rider_line", "skirmisher_line", "spearman_line"],
        targetUnits: [
          ...UNIT_CLASSES.camel_rider_line,
          ...UNIT_CLASSES.skirmisher_line,
          ...UNIT_CLASSES.spearman_line
        ],
        resource: "all",
        discountByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 },
        sourceDescription: "Los jinetes de camello, los guerrilleros y los lanceros cuestan un 25 % menos",
        sourceDescriptionEn: "Camel Riders, Skirmishers, and Spearman-line cost -25%"
      }
    ],

    // -----------------------------------------------------------------------
    // 7. Bohemios (bohemians) - Sin descuento porcentual directo
    //    (Reformas husitas es conversión de coste oro -> comida)
    // -----------------------------------------------------------------------
    bohemians: [],

    // -----------------------------------------------------------------------
    // 8. Borgoñones (burgundians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    burgundians: [],

    // -----------------------------------------------------------------------
    // 9. Britanos (britons) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    britons: [],

    // -----------------------------------------------------------------------
    // 10. Búlgaros (bulgarians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    bulgarians: [],

    // -----------------------------------------------------------------------
    // 11. Celtas (celts) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    celts: [],

    // -----------------------------------------------------------------------
    // 12. Chinos (chinese) - Descuento en tecnologías, no en unidades
    // -----------------------------------------------------------------------
    chinese: [],

    // -----------------------------------------------------------------------
    // 13. Coreanos (koreans)
    // -----------------------------------------------------------------------
    koreans: [
      {
        id: "koreans_archers_infantry_wood_discount",
        name: "Descuento de Madera en Soldados a Distancia e Infantería",
        type: "passive",
        targetClass: [
          "archer_line",
          "skirmisher_line",
          "foot_archers",
          "infantry",
          "militia_line",
          "spearman_line"
        ],
        targetUnits: [
          ...UNIT_CLASSES.archer_line,
          ...UNIT_CLASSES.skirmisher_line,
          ...UNIT_CLASSES.militia_line,
          ...UNIT_CLASSES.spearman_line,
          185 // Soldado con honda / Slinger
        ],
        resource: "wood",
        discountByAge: { dark: 0.50, feudal: 0.50, castle: 0.50, imperial: 0.50 },
        sourceDescription: "Los soldados a distancia y la infantería cuestan un 50 % menos de madera",
        sourceDescriptionEn: "Archers and Infantry cost -50% wood"
      },
      {
        id: "koreans_warships_wood_discount",
        name: "Descuento de Madera en Barcos de Guerra",
        type: "passive",
        targetClass: ["warships"],
        targetUnits: UNIT_CLASSES.warships,
        resource: "wood",
        discountByAge: { dark: 0, feudal: 0.20, castle: 0.20, imperial: 0.20 },
        sourceDescription: "Los barcos de guerra cuestan un 20 % menos de madera",
        sourceDescriptionEn: "Warships cost -20% wood"
      }
    ],

    // -----------------------------------------------------------------------
    // 14. Cumanos (cumans) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    cumans: [],

    // -----------------------------------------------------------------------
    // 15. Daneses (danes) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    danes: [],

    // -----------------------------------------------------------------------
    // 16. Dravídicos (dravidians)
    // -----------------------------------------------------------------------
    dravidians: [
      {
        id: "dravidians_siege_wood_discount",
        name: "Descuento de Madera en Armas de Asedio",
        type: "passive",
        targetClass: ["siege_weapons", "siege_workshop_units"],
        targetUnits: [
          ...UNIT_CLASSES.battering_ram_line,
          ...UNIT_CLASSES.mangonel_line,
          ...UNIT_CLASSES.scorpion_line,
          ...UNIT_CLASSES.bombard_cannon,
          ...UNIT_CLASSES.siege_tower,
          ...UNIT_CLASSES.armored_elephant_line
        ],
        resource: "wood",
        discountByAge: { dark: 0.33, feudal: 0.33, castle: 0.33, imperial: 0.33 },
        sourceDescription: "Las armas de asedio cuestan un 33 % menos de madera",
        sourceDescriptionEn: "Siege weapons cost -33% wood"
      }
    ],

    // -----------------------------------------------------------------------
    // 17. Eslavos (slavs)
    // -----------------------------------------------------------------------
    slavs: [
      {
        id: "slavs_siege_workshop_discount",
        name: "Descuento en Unidades del Taller de Maquinaria de Asedio",
        type: "passive",
        targetClass: ["siege_workshop_units", "siege_weapons"],
        targetUnits: [
          ...UNIT_CLASSES.battering_ram_line,
          ...UNIT_CLASSES.mangonel_line,
          ...UNIT_CLASSES.scorpion_line,
          ...UNIT_CLASSES.bombard_cannon,
          ...UNIT_CLASSES.siege_tower
        ],
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0.15, imperial: 0.15 },
        sourceDescription: "Las unidades del taller de maquinaria de asedio son un 15 % más baratas",
        sourceDescriptionEn: "Siege Workshop Units cost -15%"
      }
    ],

    // -----------------------------------------------------------------------
    // 18. Españoles (spanish) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    spanish: [],

    // -----------------------------------------------------------------------
    // 19. Etíopes (ethiopians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    ethiopians: [],

    // -----------------------------------------------------------------------
    // 20. Francos (franks)
    // -----------------------------------------------------------------------
    franks: [
      {
        id: "franks_ordonnance_companies",
        name: "Compagnies d'ordonnance",
        type: "unique_tech",
        techId: 1496,
        techIds: [1496, 1999],
        targetClass: ["mounted_crossbowman"],
        targetUnits: UNIT_CLASSES.mounted_crossbowman,
        resource: "gold",
        discountByAge: { dark: 0, feudal: 0, castle: 0.40, imperial: 0.40 },
        sourceDescription: "Compagnies d'ordonnance (los ballesteros a caballo cuestan un 40 % menos de oro)",
        sourceDescriptionEn: "Ordonnance Companies (Mounted Crossbowmen cost -40% gold)"
      }
    ],

    // -----------------------------------------------------------------------
    // 21. Georgianos (georgians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    georgians: [],

    // -----------------------------------------------------------------------
    // 22. Godos (goths)
    // -----------------------------------------------------------------------
    goths: [
      {
        id: "goths_infantry_discount",
        name: "Descuento Escalonado en Infantería",
        type: "passive",
        targetClass: ["infantry", "militia_line", "spearman_line", "huskarl_line"],
        targetUnits: [
          ...UNIT_CLASSES.militia_line,
          ...UNIT_CLASSES.spearman_line,
          ...UNIT_CLASSES.huskarl_line,
          751, 752, 753, 755, 757, // Línea de águilas
          882       // Condottiero
        ],
        resource: "all",
        discountByAge: { dark: 0.20, feudal: 0.20, castle: 0.25, imperial: 0.35 },
        sourceDescription: "La infantería cuesta un 20/20/25/35 % menos en la Edad Oscura, la Edad Feudal, la Edad de los Castillos y la Edad Imperial, respectivamente",
        sourceDescriptionEn: "Infantry costs -20/20/25/35% in Dark/Feudal/Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 23. Gurjaras (gurjaras)
    // -----------------------------------------------------------------------
    gurjaras: [
      {
        id: "gurjaras_kshatriyas",
        name: "Chatrias (Kshatriyas)",
        type: "unique_tech",
        techId: 835,
        techIds: [835, 832],
        targetClass: ["military_units"],
        targetUnits: ["all_military"],
        resource: "food",
        discountByAge: { dark: 0, feudal: 0, castle: 0.25, imperial: 0.25 },
        sourceDescription: "Chatrias (las unidades militares cuestan un 25 % menos de comida)",
        sourceDescriptionEn: "Kshatriyas (Military units cost -25% food)"
      }
    ],

    // -----------------------------------------------------------------------
    // 24. Hindustaníes (hindustanis)
    // -----------------------------------------------------------------------
    hindustanis: [
      {
        id: "hindustanis_villager_discount",
        name: "Descuento Escalonado en Aldeanos",
        type: "passive",
        targetClass: ["villager"],
        targetUnits: UNIT_CLASSES.villager,
        resource: "all",
        discountByAge: { dark: 0.08, feudal: 0.13, castle: 0.18, imperial: 0.23 },
        sourceDescription: "Los aldeanos cuestan un 8/13/18/23% menos en la Edad Oscura/Edad Feudal/Edad de los Castillos/Edad Imperial",
        sourceDescriptionEn: "Villagers cost -8/13/18/23% in Dark/Feudal/Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 25. Hunos (huns)
    // -----------------------------------------------------------------------
    huns: [
      {
        id: "huns_cavalry_archer_discount",
        name: "Descuento en Arqueros a Caballo",
        type: "passive",
        targetClass: ["cavalry_archers", "cavalry_archer_line"],
        targetUnits: UNIT_CLASSES.cavalry_archer_line,
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0.10, imperial: 0.20 },
        sourceDescription: "Los arqueros a caballo cuestan un 10 % menos en la Edad de los Castillos y un 20 % menos en la Edad Imperial",
        sourceDescriptionEn: "Cavalry Archers cost -10/20% in Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 26. Incas (incas)
    // -----------------------------------------------------------------------
    incas: [
      {
        id: "incas_military_food_discount",
        name: "Descuento Escalonado de Comida en Unidades Militares",
        type: "passive",
        targetClass: ["military_units"],
        targetUnits: ["all_military"],
        resource: "food",
        discountByAge: { dark: 0.15, feudal: 0.20, castle: 0.25, imperial: 0.30 },
        sourceDescription: "El coste de comida de las unidades militares se reduce un 15 %/20 %/25 % y 30 % en la Edad Oscura, la Edad Feudal, la Edad de los Castillos y la Edad Imperial, respectivamente",
        sourceDescriptionEn: "Military units food cost -15/20/25/30% in Dark/Feudal/Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 27. Italianos (italians)
    // -----------------------------------------------------------------------
    italians: [
      {
        id: "italians_gunpowder_discount",
        name: "Descuento en Unidades de Pólvora",
        type: "passive",
        targetClass: ["gunpowder_units"],
        targetUnits: UNIT_CLASSES.gunpowder_units,
        resource: "all",
        discountByAge: { dark: 0.20, feudal: 0.20, castle: 0.20, imperial: 0.20 },
        sourceDescription: "Las unidades de pólvora cuestan un 20 % menos",
        sourceDescriptionEn: "Gunpowder Units cost -20%"
      },
      {
        id: "italians_fishing_ship_discount",
        name: "Descuento en Buques de Pesca",
        type: "passive",
        targetClass: ["fishing_ship"],
        targetUnits: UNIT_CLASSES.fishing_ship,
        resource: "all",
        discountByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 },
        sourceDescription: "Los buques de pesca cuestan un 15 % menos",
        sourceDescriptionEn: "Fishing Ships cost -15%"
      },
      {
        id: "italians_silk_road",
        name: "Ruta de la Seda",
        type: "unique_tech",
        techId: 499,
        targetClass: ["trade_units"],
        targetUnits: UNIT_CLASSES.trade_units,
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0, imperial: 0.50 },
        sourceDescription: "Ruta de la seda (las unidades mercantes cuestan un 50 % menos)",
        sourceDescriptionEn: "Silk Road (Trade units cost -50%)"
      }
    ],

    // -----------------------------------------------------------------------
    // 28. Japoneses (japanese) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    japanese: [],

    // -----------------------------------------------------------------------
    // 29. Jemeres (khmer) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    khmer: [],

    // -----------------------------------------------------------------------
    // 30. Jurchen (jurchens) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    jurchens: [],

    // -----------------------------------------------------------------------
    // 31. Khitanes (khitans) - Sin descuento en coste de unidades (descuento en mejora de arquero a caballo)
    // -----------------------------------------------------------------------
    khitans: [],

    // -----------------------------------------------------------------------
    // 32. Lituanos (lithuanians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    lithuanians: [],

    // -----------------------------------------------------------------------
    // 33. Magiares (magyars)
    // -----------------------------------------------------------------------
    magyars: [
      {
        id: "magyars_scout_cavalry_discount",
        name: "Descuento en la Línea de Caballería de Exploración",
        type: "passive",
        targetClass: ["scout_cavalry_line"],
        targetUnits: UNIT_CLASSES.scout_cavalry_line,
        resource: "all",
        discountByAge: { dark: 0, feudal: 0.15, castle: 0.15, imperial: 0.15 },
        sourceDescription: "La línea de caballería de exploración cuesta un 15 % menos",
        sourceDescriptionEn: "Scout Cavalry-line costs -15%"
      }
    ],

    // -----------------------------------------------------------------------
    // 34. Malayos (malay)
    // -----------------------------------------------------------------------
    malay: [
      {
        id: "malay_battle_elephants_discount",
        name: "Descuento en Elefantes de Combate",
        type: "passive",
        targetClass: ["battle_elephant_line"],
        targetUnits: UNIT_CLASSES.battle_elephant_line,
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0.25, imperial: 0.35 },
        sourceDescription: "Los elefantes de combate cuestan un 25/35 % menos en la Edad de los Castillos y en la Edad Imperial",
        sourceDescriptionEn: "Battle Elephants cost -25/35% in Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 35. Malienses (malians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    malians: [],

    // -----------------------------------------------------------------------
    // 36. Mapuches (mapuche)
    // -----------------------------------------------------------------------
    mapuche: [
      {
        id: "mapuche_butalmapu",
        name: "Butalmapu",
        type: "unique_tech",
        techId: 1380,
        techIds: [1380, 2051],
        targetClass: ["castle_unique_units", "bolas_rider"],
        targetUnits: [...UNIT_CLASSES.bolas_rider, "castle_unique_units"],
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0, imperial: 0.15 },
        sourceDescription: "Butalmapu (las unidades únicas de equipo del castillo y los jinetes con boleadoras cuestan un 15 % menos)",
        sourceDescriptionEn: "Butalmapu (Team Castle Unique Units and Bolas Riders cost -15%)"
      }
    ],

    // -----------------------------------------------------------------------
    // 37. Mayas (mayans)
    // -----------------------------------------------------------------------
    mayans: [
      {
        id: "mayans_foot_archers_discount",
        name: "Descuento Escalonado en Arqueros a Pie",
        type: "passive",
        targetClass: [
          "foot_archers",
          "archer_line",
          "skirmisher_line",
          "plumed_archer_line"
        ],
        targetUnits: [
          ...UNIT_CLASSES.archer_line,
          ...UNIT_CLASSES.skirmisher_line,
          ...UNIT_CLASSES.plumed_archer_line
        ],
        resource: "all",
        discountByAge: { dark: 0, feudal: 0.10, castle: 0.20, imperial: 0.30 },
        sourceDescription: "El coste de los arqueros a pie se reduce un 10 %/20 %/30 % en la Edad Feudal, la Edad de los Castillos y la Edad Imperial, respectivamente",
        sourceDescriptionEn: "Foot Archers cost -10/20/30% in Feudal/Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 38. Mongoles (mongols) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    mongols: [],

    // -----------------------------------------------------------------------
    // 39. Muiscas (muisca) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    muisca: [],

    // -----------------------------------------------------------------------
    // 40. Persas (persians) - Sin descuento porcentual directo
    //    (Kamandaran convierte coste oro -> madera en arqueros)
    // -----------------------------------------------------------------------
    persians: [],

    // -----------------------------------------------------------------------
    // 41. Polacos (poles)
    // -----------------------------------------------------------------------
    poles: [
      {
        id: "poles_szlachta_privileges",
        name: "Privilegios de Szlachta",
        type: "unique_tech",
        techId: 782,
        targetClass: ["knight_line"],
        targetUnits: UNIT_CLASSES.knight_line,
        resource: "gold",
        discountByAge: { dark: 0, feudal: 0, castle: 0.60, imperial: 0.60 },
        sourceDescription: "Privilegios de Szlachta (la línea de caballeros cuesta un 60 % menos de oro)",
        sourceDescriptionEn: "Szlachta Privileges (Knight-line costs -60% gold)"
      }
    ],

    // -----------------------------------------------------------------------
    // 42. Portugueses (portuguese)
    // -----------------------------------------------------------------------
    portuguese: [
      {
        id: "portuguese_all_units_gold_discount",
        name: "Descuento de Oro en Todas las Unidades",
        type: "passive",
        targetClass: ["all_units"],
        targetUnits: ["all"],
        resource: "gold",
        discountByAge: { dark: 0.20, feudal: 0.20, castle: 0.20, imperial: 0.20 },
        sourceDescription: "Todas las unidades cuestan un 20 % menos de oro",
        sourceDescriptionEn: "All units cost -20% gold"
      }
    ],

    // -----------------------------------------------------------------------
    // 43. Romanos (romans)
    // -----------------------------------------------------------------------
    romans: [
      {
        id: "romans_scorpions_gold_discount",
        name: "Descuento de Oro en Escorpiones",
        type: "passive",
        targetClass: ["scorpion_line"],
        targetUnits: UNIT_CLASSES.scorpion_line,
        resource: "gold",
        discountByAge: { dark: 0, feudal: 0, castle: 0.50, imperial: 0.50 },
        sourceDescription: "Los escorpiones cuestan un 50 % menos de oro",
        sourceDescriptionEn: "Scorpions cost -50% gold"
      }
    ],

    // -----------------------------------------------------------------------
    // 44. Sajones (saxons)
    // -----------------------------------------------------------------------
    saxons: [
      {
        id: "saxons_infantry_discount",
        name: "Descuento en Infantería por Centros Urbanos / Castillos",
        type: "passive",
        targetClass: ["infantry", "militia_line", "spearman_line"],
        targetUnits: [
          ...UNIT_CLASSES.militia_line,
          ...UNIT_CLASSES.spearman_line,
          2705, 2706 // Tropa del hogar / Elite Hearth Troop
        ],
        resource: "all",
        // Escala: 5% por centro urbano o castillo, hasta un máximo de 20%
        discountByAge: { dark: 0.05, feudal: 0.05, castle: 0.15, imperial: 0.20 },
        scalingRule: {
          perBuilding: 0.05,
          maxDiscount: 0.20,
          buildings: ["town_center", "castle"]
        },
        sourceDescription: "La infantería cuesta un 5 % menos por cada centro urbano o castillo que controles (hasta un máximo de un 20 % menos)",
        sourceDescriptionEn: "Foot Soldiers cost -5% per Town Center or Castle controlled (maximum -20%)"
      }
    ],

    // -----------------------------------------------------------------------
    // 45. Sarracenos (saracens) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    saracens: [],

    // -----------------------------------------------------------------------
    // 46. Shu (shu) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    shu: [],

    // -----------------------------------------------------------------------
    // 47. Sicilianos (sicilians)
    // -----------------------------------------------------------------------
    sicilians: [
      {
        id: "sicilians_transport_ships_discount",
        name: "Descuento en Barcos de Transporte",
        type: "team_bonus",
        targetClass: ["transport_ship"],
        targetUnits: UNIT_CLASSES.transport_ship,
        resource: "all",
        discountByAge: { dark: 0.50, feudal: 0.50, castle: 0.50, imperial: 0.50 },
        sourceDescription: "Los barcos de transporte ganan +5 de campo de visión y cuestan un 50 % menos",
        sourceDescriptionEn: "Transport Ships +5 line of sight and cost -50%"
      }
    ],

    // -----------------------------------------------------------------------
    // 48. Tártaros (tatars) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    tatars: [],

    // -----------------------------------------------------------------------
    // 49. Teutones (teutons) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    teutons: [],

    // -----------------------------------------------------------------------
    // 50. Tupís (tupi) - Reembolso por muerte (15%), no descuento de producción
    // -----------------------------------------------------------------------
    tupi: [],

    // -----------------------------------------------------------------------
    // 51. Turcos (turks) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    turks: [],

    // -----------------------------------------------------------------------
    // 52. Varegos (varangians) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    varangians: [],

    // -----------------------------------------------------------------------
    // 53. Vietnamitas (vietnamese) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    vietnamese: [],

    // -----------------------------------------------------------------------
    // 54. Vikingos (vikings)
    // -----------------------------------------------------------------------
    vikings: [
      {
        id: "vikings_warships_discount",
        name: "Descuento Escalonado en Barcos de Guerra",
        type: "passive",
        targetClass: ["warships"],
        targetUnits: UNIT_CLASSES.warships,
        resource: "all",
        discountByAge: { dark: 0, feudal: 0.10, castle: 0.15, imperial: 0.20 },
        sourceDescription: "Los barcos de guerra cuestan un 10/15/20 % menos en la Edad Feudal, la Edad de los Castillos y la Edad Imperial, respectivamente",
        sourceDescriptionEn: "Warships cost -10/15/20% in Feudal/Castle/Imperial Age"
      }
    ],

    // -----------------------------------------------------------------------
    // 55. Wei (wei)
    // -----------------------------------------------------------------------
    wei: [
      {
        id: "wei_mangonels_lou_chuan_discount",
        name: "Descuento en Mangoneles y Lou Chuan",
        type: "passive",
        targetClass: ["mangonel_line", "traction_trebuchet", "lou_chuan"],
        targetUnits: [
          ...UNIT_CLASSES.mangonel_line,
          1948 // Lou Chuan
        ],
        resource: "all",
        discountByAge: { dark: 0, feudal: 0, castle: 0.25, imperial: 0.25 },
        sourceDescription: "Los mangoneles y las unidades de Lou Chuan cuestan un 25 % menos",
        sourceDescriptionEn: "Traction Trebuchets and Lou Chuans cost -25%"
      }
    ],

    // -----------------------------------------------------------------------
    // 56. Wu (wu) - Sin descuento en coste de unidades
    // -----------------------------------------------------------------------
    wu: []
  };

  // =========================================================================
  // REGISTRO DE MECÁNICAS DE SUSTITUCIÓN DE RECURSOS (Cost Conversions)
  // Tecnologías que modifican el tipo de recurso en lugar de porcentaje directo
  // =========================================================================
  const CIV_UNIT_COST_CONVERSIONS = {
    bohemians_hussite_reforms: {
      civ: "bohemians",
      techName: "Reformas husitas",
      techNameEn: "Hussite Reforms",
      type: "unique_tech",
      targetUnits: ["monk", "missionary"],
      rule: "El coste de oro de los monjes se reemplaza por coste de comida",
      sourceDescription: "Reformas husitas (el coste de oro de los monjes y de las tecnologías del monasterio se reemplaza por comida)",
      sourceDescriptionEn: "Hussite Reforms (Monks and Monastery technologies gold cost is replaced by food cost)"
    },
    magyars_corvinian_army: {
      civ: "magyars",
      techName: "Ejército corviniano",
      techNameEn: "Corvinian Army",
      type: "unique_tech",
      targetUnits: [869, 871], // Huszar magiar / Huszar magiar de élite
      rule: "Los huszár magiares dejan de costar oro y pasan a costar comida adicional",
      sourceDescription: "Ejército corviniano (los huszár magiares dejan de costar oro y pasan a costar comida adicional)",
      sourceDescriptionEn: "Corvinian Army (Magyar Huszars cost no gold, but cost additional food)"
    },
    malay_forced_levy: {
      civ: "malay",
      techName: "Leva en masa",
      techNameEn: "Forced Levy",
      type: "unique_tech",
      targetUnits: UNIT_CLASSES.militia_line,
      rule: "La milicia y subsiguientes dejan de costar oro y cuestan comida adicional",
      sourceDescription: "Leva en masa (la milicia y subsiguientes dejan de costar oro y cuestan comida adicional)",
      sourceDescriptionEn: "Forced Levy (Militia-line gold cost is replaced by additional food cost)"
    },
    persians_kamandaran: {
      civ: "persians",
      techName: "Kamandaran",
      techNameEn: "Kamandaran",
      type: "unique_tech",
      targetUnits: UNIT_CLASSES.archer_line,
      rule: "El coste de oro de los arqueros se reemplaza por un coste adicional de madera",
      sourceDescription: "Kamandaran (el coste de oro de los arqueros se reemplaza por un coste adicional de madera)",
      sourceDescriptionEn: "Kamandaran (Archer-line gold cost replaced by additional wood cost)"
    }
  };

  // =========================================================================
  // AUDITORÍA PROGRAMÁTICA OBLIGATORIA (56 Civilizaciones)
  // =========================================================================
  const allKeys = Object.keys(CIV_UNIT_DISCOUNTS);
  const playableKeys = allKeys.filter(k => k !== 'generic');
  console.assert(
    playableKeys.length === 56,
    `[civUnitDiscounts] Discrepancia: se esperaban 56 civilizaciones, pero se registraron ${playableKeys.length}`
  );
  console.assert(
    !allKeys.includes('dutch'),
    '[civUnitDiscounts] Error: Entrada espuria "dutch" encontrada.'
  );

  // =========================================================================
  // FUNCIONES AUXILIARES DE NORMALIZACIÓN Y EMPAREJAMIENTO
  // =========================================================================

  /**
   * Normaliza la edad recibida a clave canónica ('dark', 'feudal', 'castle', 'imperial').
   */
  function normalizeAge(age) {
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
   * Normaliza el identificador de civilización a su ID canónico en minúsculas.
   */
  function normalizeCivId(civInput) {
    if (!civInput) return 'generic';
    if (typeof civInput === 'object' && civInput.id) {
      return String(civInput.id).toLowerCase().trim();
    }
    const lower = String(civInput).toLowerCase().trim().replace(/\s+/g, '_');
    if (CIV_UNIT_DISCOUNTS[lower]) return lower;

    // Búsqueda por nombre en el módulo oficial si está disponible
    if (civMod && typeof civMod.getCivByName === 'function') {
      const found = civMod.getCivByName(civInput);
      if (found && CIV_UNIT_DISCOUNTS[found.id]) return found.id;
    }
    return lower;
  }

  /**
   * Evalúa si una unidad coincide con la lista de clases o IDs objetivo de un descuento.
   */
  function unitMatchesDiscount(unitKeyOrClass, discount) {
    if (!unitKeyOrClass || !discount) return false;

    // Caso especial: bonos globales aplicables a todas las unidades ("all_units")
    if (discount.targetClass.includes("all_units") || discount.targetUnits.includes("all")) {
      return true;
    }

    // Extraer propiedades si se pasa un objeto
    let uId = null;
    let uClass = null;
    let uName = null;
    let isMilitary = true;

    if (typeof unitKeyOrClass === 'number') {
      uId = unitKeyOrClass;
    } else if (typeof unitKeyOrClass === 'string') {
      const num = Number(unitKeyOrClass);
      if (!isNaN(num) && num > 0) {
        uId = num;
      } else {
        uClass = unitKeyOrClass.toLowerCase().trim();
        uName = uClass;
      }
    } else if (typeof unitKeyOrClass === 'object') {
      uId = Number(unitKeyOrClass.id ?? unitKeyOrClass.ID);
      uClass = (unitKeyOrClass.class ?? unitKeyOrClass.category ?? '').toLowerCase();
      uName = (unitKeyOrClass.name ?? unitKeyOrClass.internal_name ?? '').toLowerCase();
      if (typeof unitKeyOrClass.isMilitary === 'boolean') {
        isMilitary = unitKeyOrClass.isMilitary;
      }
    }

    // Si el descuento aplica a todas las unidades militares (ej. Gurjaras, Incas)
    if (discount.targetClass.includes("military_units") || discount.targetUnits.includes("all_military")) {
      const nonMilitaryUnits = [
        ...UNIT_CLASSES.villager,
        ...UNIT_CLASSES.mule_cart,
        ...UNIT_CLASSES.trade_units,
        ...UNIT_CLASSES.fishing_ship,
        ...UNIT_CLASSES.transport_ship,
        125, // Monje base
        83, 118, 293, 305, 1808
      ];
      if (uId && nonMilitaryUnits.includes(uId)) return false;
      if (uClass && ['villager', 'mule_cart', 'trade', 'fishing_ship', 'economic'].includes(uClass)) return false;
      return isMilitary;
    }

    // Comprobación directa por ID numérico en targetUnits
    if (uId && Array.isArray(discount.targetUnits) && discount.targetUnits.includes(uId)) {
      return true;
    }

    // Comprobación por coincidencia de clase en targetClass y jerarquías
    if (uClass) {
      if (discount.targetClass.includes(uClass)) return true;

      // Jerarquía de clases (ej. mangonel_line pertenece a siege_weapons)
      for (const tClass of discount.targetClass) {
        if (CLASS_HIERARCHY[tClass] && CLASS_HIERARCHY[tClass].includes(uClass)) return true;
        if (CLASS_HIERARCHY[uClass] && CLASS_HIERARCHY[uClass].includes(tClass)) return true;
        if (uClass.includes(tClass) || tClass.includes(uClass)) return true;
      }

      // Si la clase provista tiene IDs definidos, comprobar intersección con targetUnits o UNIT_CLASSES[tClass]
      const uClassIds = UNIT_CLASSES[uClass];
      if (Array.isArray(uClassIds)) {
        if (Array.isArray(discount.targetUnits) && uClassIds.some(id => discount.targetUnits.includes(id))) {
          return true;
        }
        for (const tClass of discount.targetClass) {
          const tIds = UNIT_CLASSES[tClass];
          if (Array.isArray(tIds) && uClassIds.some(id => tIds.includes(id))) {
            return true;
          }
        }
      }
    }

    // Comprobación cruzada si se proveyó un ID y coincide con alguna de las clases registradas
    if (uId) {
      for (const tClass of discount.targetClass) {
        const classIds = UNIT_CLASSES[tClass];
        if (Array.isArray(classIds) && classIds.includes(uId)) return true;
      }
    }

    // Comprobación por nombre/slug si coincide con clases clave
    if (uName) {
      for (const tClass of discount.targetClass) {
        if (uName.includes(tClass) || tClass.includes(uName)) return true;
      }
    }

    return false;
  }

  // =========================================================================
  // MÉTODOS PRINCIPALES DE CONSULTA Y CÁLCULO
  // =========================================================================

  /**
   * Obtiene la lista de descuentos en unidades registrados para una civilización.
   * @param {string} civId - ID o nombre de la civilización.
   * @returns {Array} Arreglo de bonificaciones de descuento.
   */
  function getCivUnitDiscounts(civId) {
    const canonicalId = normalizeCivId(civId);
    return CIV_UNIT_DISCOUNTS[canonicalId] ? [...CIV_UNIT_DISCOUNTS[canonicalId]] : [];
  }

  /**
   * Comprueba si una civilización cuenta con al menos un descuento en coste de unidades.
   * @param {string} civId - ID o nombre de la civilización.
   * @returns {boolean}
   */
  function hasUnitDiscount(civId) {
    return getCivUnitDiscounts(civId).length > 0;
  }

  /**
   * Calcula el coste final con descuento aplicado para una unidad dada según civilización y edad.
   *
   * @param {Object} baseCost - Coste base { food, wood, gold, stone } (claves insensibles a mayúsculas).
   * @param {string} civId - ID o nombre de la civilización.
   * @param {number|string|Object} unitKeyOrClass - ID de la unidad, slug de clase o descriptor.
   * @param {string|number} age - Edad de juego ('dark', 'feudal', 'castle', 'imperial' o 1..4).
   * @param {Array|Object} [options] - Tecnologías activas o configuración contextual { activeTechs, townCenters, castles, round }.
   * @returns {Object} Desglose detallado del cálculo { cost, rawCost, totalSavings, discountsApplied }.
   */
  function calculateDiscountedCost(baseCost, civId, unitKeyOrClass, age, options = {}) {
    // Normalizar opciones
    let activeTechs = [];
    let townCenters = 1;
    let castles = 0;
    let shouldRound = true;

    if (Array.isArray(options)) {
      activeTechs = options;
    } else if (typeof options === 'object' && options !== null) {
      activeTechs = Array.isArray(options.activeTechs) ? options.activeTechs : [];
      if (typeof options.townCenters === 'number') townCenters = options.townCenters;
      if (typeof options.castles === 'number') castles = options.castles;
      if (typeof options.round === 'boolean') shouldRound = options.round;
    }

    // Normalizar costes base de entrada sin mutar el objeto original
    const rawCost = {
      food: Number(baseCost?.food ?? baseCost?.Food ?? 0),
      wood: Number(baseCost?.wood ?? baseCost?.Wood ?? 0),
      gold: Number(baseCost?.gold ?? baseCost?.Gold ?? 0),
      stone: Number(baseCost?.stone ?? baseCost?.Stone ?? 0)
    };

    const currentAge = normalizeAge(age);
    const discounts = getCivUnitDiscounts(civId);
    const discountsApplied = [];

    // Factores multiplicadores acumulados por recurso (inicialmente 1.0 = 100% de coste)
    const multipliers = { food: 1.0, wood: 1.0, gold: 1.0, stone: 1.0 };

    for (const discount of discounts) {
      if (!unitMatchesDiscount(unitKeyOrClass, discount)) {
        continue;
      }

      // Si es una tecnología única, verificar que esté en activeTechs
      if (discount.type === 'unique_tech') {
        const isResearched = activeTechs.some(t => {
          if (typeof t === 'number') {
            return discount.techId === t || (Array.isArray(discount.techIds) && discount.techIds.includes(t));
          }
          const str = String(t).toLowerCase();
          return str === discount.id || str === discount.name.toLowerCase();
        });
        if (!isResearched) continue;
      }

      // Determinar la tasa de descuento aplicable
      let rate = discount.discountByAge[currentAge] || 0;

      // Aplicar reglas de escalado dinámico si aplican (ej. Sajones)
      if (discount.scalingRule) {
        const totalBuildings = townCenters + castles;
        const calculatedRate = totalBuildings * discount.scalingRule.perBuilding;
        rate = Math.min(discount.scalingRule.maxDiscount, calculatedRate);
      }

      if (rate <= 0) continue;

      // Aplicar descuento al recurso objetivo
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
        rateApplied: rate,
        sourceDescription: discount.sourceDescription
      });
    }

    // Calcular costes reducidos finales
    const finalRaw = {
      food: rawCost.food * multipliers.food,
      wood: rawCost.wood * multipliers.wood,
      gold: rawCost.gold * multipliers.gold,
      stone: rawCost.stone * multipliers.stone
    };

    const cost = {
      food: shouldRound ? Math.round(finalRaw.food) : finalRaw.food,
      wood: shouldRound ? Math.round(finalRaw.wood) : finalRaw.wood,
      gold: shouldRound ? Math.round(finalRaw.gold) : finalRaw.gold,
      stone: shouldRound ? Math.round(finalRaw.stone) : finalRaw.stone
    };

    const totalSavings = {
      food: Math.max(0, rawCost.food - cost.food),
      wood: Math.max(0, rawCost.wood - cost.wood),
      gold: Math.max(0, rawCost.gold - cost.gold),
      stone: Math.max(0, rawCost.stone - cost.stone)
    };

    return {
      cost,
      rawCost: finalRaw,
      baseCost: rawCost,
      totalSavings,
      discountsApplied
    };
  }

  return {
    CIV_UNIT_DISCOUNTS,
    CIV_UNIT_COST_CONVERSIONS,
    UNIT_CLASSES,
    getCivUnitDiscounts,
    calculateDiscountedCost,
    hasUnitDiscount
  };
});
