/**
 * TECHS.JS - Motor Dinámico de Tecnologías AoE2 basado en data.json
 * Procesa tecnologías económicas, militares, herrería, monasterio, universidad, muelle y coronas únicas.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.BUILDING_TECH_ORIGIN = exports.BUILDING_TECH_ORIGIN;
    global.categorizeTech = exports.categorizeTech;
    global.TECH_CATEGORIES = exports.TECH_CATEGORIES;
    global.TECH_BUILDING_INFO = exports.TECH_BUILDING_INFO;
    global.TECH_METADATA = exports.TECH_METADATA;
    global.DEPRECATED_OR_AUTO_TECHS = exports.DEPRECATED_OR_AUTO_TECHS;
    global.isActionableTech = exports.isActionableTech;
    global.parseTechs = exports.parseTechs;
    global.getTechById = exports.getTechById;
    global.getTechsByBuilding = exports.getTechsByBuilding;
    global.getTechsByCiv = exports.getTechsByCiv;
    global.getTechsByCategory = exports.getTechsByCategory;
    global.getAllTechs = exports.getAllTechs;
    global.PASTURE_TECHS_DATA = exports.PASTURE_TECHS_DATA;
    global.PASTURE_TECHS = exports.PASTURE_TECHS;
    global.AoE2Techs = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Tecnologías de Pastoreo (Khitan)
  let dataTechsModule = null;
  if (typeof require === 'function') {
    try { dataTechsModule = require('./data/techs.js'); } catch (e) {}
  }
  const PASTURE_TECHS_DATA = (dataTechsModule && dataTechsModule.PASTURE_TECHS_DATA) || (typeof window !== 'undefined' && window.PASTURE_TECHS_DATA) || {
    138: { id: 138, internalName: "domestication", name: "Domesticación", age: "feudal", icon: "138.png", foodBonus: 115 },
    137: { id: 137, internalName: "pastoralism", name: "Pastoreo", age: "castle", icon: "137.png", foodBonus: 230 },
    136: { id: 136, internalName: "transhumance", name: "Trashumancia", age: "imperial", icon: "136.png", foodBonus: 345 }
  };
  const PASTURE_TECHS = (dataTechsModule && dataTechsModule.PASTURE_TECHS) || (typeof window !== 'undefined' && window.PASTURE_TECHS) || {
    domestication: PASTURE_TECHS_DATA[138],
    pastoralism: PASTURE_TECHS_DATA[137],
    transhumance: PASTURE_TECHS_DATA[136],
    138: PASTURE_TECHS_DATA[138],
    137: PASTURE_TECHS_DATA[137],
    136: PASTURE_TECHS_DATA[136],
    1950: PASTURE_TECHS_DATA[138],
    1951: PASTURE_TECHS_DATA[137],
    1952: PASTURE_TECHS_DATA[136]
  };

  // Tecnologías automáticas, obsoletas o sin panel de investigación en DE
  const DEPRECATED_OR_AUTO_TECHS = new Set([
    19,   // Cartografía (Cartography - visión compartida automática)
    90,   // Rastreo (Tracking - +2 LoS de infantería automático en Feudal)
    "cartography",
    "cartografia",
    "tracking",
    "rastreo"
  ]);

  // Validador de tecnologías activas y accionables
  function isActionableTech(techId, tech = {}) {
    const id = Number(techId);
    const rawName = (tech?.name || tech?.internal_name || "").toLowerCase().trim();

    // 1. Descartar si el ID numérico o el nombre coincide con la lista negra
    if (DEPRECATED_OR_AUTO_TECHS.has(id) || DEPRECATED_OR_AUTO_TECHS.has(rawName)) {
      return false;
    }

    // 2. Descartar tecnologías fantasma del motor (costo 0 y tiempo <= 1s sin efecto visual)
    const researchTime = tech.ResearchTime !== undefined ? tech.ResearchTime : (tech.researchTime !== undefined ? tech.researchTime : 0);
    const cost = tech.Cost || tech.cost || {};
    const isCostZero = Object.values(cost).every(v => Number(v) === 0);
    const isUnique = !!(tech.isUniqueTech || tech.isUnique || tech.category === 'unique_crown');

    if (
      (rawName.includes("cartograf") || rawName.includes("rastreo")) ||
      (researchTime <= 1 && isCostZero && !isUnique)
    ) {
      return false;
    }

    return true;
  }

  // Motor dinámico de tecnologías basado en data.json - Origen por Edificio
  const BUILDING_TECH_ORIGIN = {
    // Centro Urbano (TC)
    109: "town_center",
    71: "town_center",
    // Herrería
    103: "blacksmith",
    // Cuartel
    12: "barracks",
    // Galería de tiro con arco
    87: "archery_range",
    // Establo
    101: "stable",
    // Taller de maquinaria de asedio
    49: "siege_workshop",
    // Castillo (Coronas y soporte)
    82: "castle",
    // Monasterio
    30: "monastery",
    104: "monastery",
    1806: "monastery",
    // Universidad
    209: "university",
    // Muelle
    45: "dock",
    // Molino / Folwark / Pasturas
    68: "mill",
    1734: "folwark",
    96: "pasture",
    // Campamentos
    562: "lumber_camp",
    584: "mining_camp",
    // Mercado
    84: "market"
  };

  // Metadatos informativos de los edificios de origen
  const TECH_BUILDING_INFO = {
    town_center: { name: "Centro Urbano", icon: "img/Building/109.png", emoji: "🏛️" },
    blacksmith: { name: "Herrería", icon: "img/Building/4.png", emoji: "⚒️" },
    barracks: { name: "Cuartel", icon: "img/Building/2.png", emoji: "⚔️" },
    archery_range: { name: "Galería de Tiro con Arco", icon: "img/Building/0.png", emoji: "🏹" },
    stable: { name: "Establo", icon: "img/Building/23.png", emoji: "🐎" },
    siege_workshop: { name: "Taller de Asedio", icon: "img/Building/22.png", emoji: "⚙️" },
    castle: { name: "Castillo", icon: "img/Building/7.png", emoji: "🏰" },
    monastery: { name: "Monasterio", icon: "img/Building/30.png", emoji: "📜" },
    university: { name: "Universidad", icon: "img/Building/209.png", emoji: "🏛️" },
    dock: { name: "Muelle", icon: "img/Building/45.png", emoji: "⚓" },
    mill: { name: "Molino", icon: "img/Building/68.png", emoji: "🌾" },
    folwark: { name: "Folwark", icon: "img/Building/68.png", emoji: "🌾" },
    pasture: { name: "Pasturas", icon: "img/Building/96.png", emoji: "🐑" },
    lumber_camp: { name: "Campamento Maderero", icon: "img/Building/562.png", emoji: "🪵" },
    mining_camp: { name: "Campamento Minero", icon: "img/Building/584.png", emoji: "⛏️" },
    market: { name: "Mercado", icon: "img/Building/84.png", emoji: "⚖️" },
    general: { name: "General", icon: "img/Building/109.png", emoji: "⚙️" }
  };

  // Clasificación categórica por ID de tecnología
  function categorizeTech(techId, techData = {}) {
    const id = Number(techId);
    const buildingId = Number(techData.ResearchLocation || techData.Building || techData.building_id || techData.b || 0);
    const nodeType = techData.node_type || techData.t;

    // 1. Coronas Únicas (Castle UT & Imperial UT)
    if (techData.Civ !== undefined || buildingId === 82 || nodeType === 'UniqueTech') {
      return "unique_crown";
    }

    // 2. Herrería (103)
    if (buildingId === 103) return "blacksmith";

    // 3. Monasterio (30, 104, 1806)
    if (buildingId === 30 || buildingId === 104 || buildingId === 1806) return "monastery";

    // 4. Muelle y Tecnologías Navales (45 o Careening/Dry Dock/Shipwright/Gillnets)
    if (buildingId === 45 || [373, 374, 375, 65, 907, 908, 909, 910].includes(id)) return "dock";

    // 5. Universidad (209)
    if (buildingId === 209) return "university";

    // 6. Tecnologías Económicas y Desarrollo
    const ecoTechs = [
      22, 213, 249, // Telar (22), Carretilla (213), Carro de mano (249)
      8, 280, 281, // Guardia urbana (8), Patrulla urbana (280)
      14, 13, 12, // Collerón (14), Arado pesado (13), Rotación de cultivos (12)
      202, 203, 221, // Hacha de doble filo, Sierra de arco, Sierra para dos hombres
      55, 182, 278, 279, 220, // Minería de oro, Pozo de oro, Minería de piedra, Pozo de piedra
      17, 23, 15, 58 // Acuñación, Banca, Gremios
    ];
    if (ecoTechs.includes(id) || [68, 1734, 96, 562, 584, 84].includes(buildingId)) {
      return "economic";
    }

    // 7. Mejoras de Línea de Unidades (Unit Upgrades)
    const unitLineTechs = [
      207, 217, 98, 93, 100, // Infantería
      237, 2, // Arquería
      254, 255, 329, 330, 680, // Caballería
      257, 322, 279, // Asedio
      21, 23, 24, 25, 26 // Muelle
    ];
    if (nodeType === 'UnitUpgrade' || (unitLineTechs.includes(id) && !ecoTechs.includes(id))) {
      return "unit_upgrade";
    }

    // 8. Soporte Militar
    const militarySupportTechs = [
      435, 39, 457, 508, 65, 836, 875, // Pureza de sangre (435), Ganadería (39), Escuderos (457), Suministros (508), Leva (65), Gambesones (836/875)
      436, 437, // Anillo de pulgar, Tácticas partas
      50, 51, 379, 377, 602 // Albañilería, Arquitectura, Grúa, Ingenieros de asedio, Incendio
    ];
    if (militarySupportTechs.includes(id) || [12, 87, 101, 49].includes(buildingId)) {
      return "military_support";
    }

    return "general";
  }

  // Definición de Categorías con Metadatos Visuales
  const TECH_CATEGORIES = {
    all: { key: "all", label: "Todas", emoji: "📜", color: "#d4af37" },
    economic: { key: "economic", label: "Económicas", emoji: "🌾", color: "#3b7a42" },
    blacksmith: { key: "blacksmith", label: "Herrería", emoji: "⚒️", color: "#b8860b" },
    military_support: { key: "military_support", label: "Soporte Militar", emoji: "🛡️", color: "#8a3324" },
    unit_upgrade: { key: "unit_upgrade", label: "Mejoras de Línea", emoji: "🗡️", color: "#c0392b" },
    monastery: { key: "monastery", label: "Monasterio", emoji: "📜", color: "#8e44ad" },
    university: { key: "university", label: "Universidad", emoji: "🏛️", color: "#2980b9" },
    dock: { key: "dock", label: "Muelle", emoji: "⚓", color: "#16a085" },
    unique_crown: { key: "unique_crown", label: "Coronas Únicas", emoji: "👑", color: "#e67e22" },
    general: { key: "general", label: "General", emoji: "⚙️", color: "#7f8c8d" }
  };

  // Metadatos compactos pre-indexados para todas las tecnologías oficiales
  // { b: building_id, a: age_id, p: picture_index, n: name_string_id, h: help_string_id, t: node_type }
  const TECH_METADATA = {
  "3": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17419,
    "h": 107419,
    "t": "UniqueTech"
  },
  "4": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17420,
    "h": 107420,
    "t": "UniqueTech"
  },
  "5": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17421,
    "h": 107421,
    "t": "UniqueTech"
  },
  "6": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17422,
    "h": 107422,
    "t": "UniqueTech"
  },
  "7": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17423,
    "h": 107423,
    "t": "UniqueTech"
  },
  "8": {
    "b": 109,
    "a": 2,
    "p": 69,
    "n": 17008,
    "h": 107008,
    "t": "Research"
  },
  "10": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17425,
    "h": 107425,
    "t": "UniqueTech"
  },
  "11": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17426,
    "h": 107426,
    "t": "UniqueTech"
  },
  "12": {
    "b": 68,
    "a": 4,
    "p": 0,
    "n": 17012,
    "h": 107012,
    "t": "Research"
  },
  "13": {
    "b": 68,
    "a": 3,
    "p": 1,
    "n": 17013,
    "h": 107013,
    "t": "Research"
  },
  "14": {
    "b": 68,
    "a": 2,
    "p": 2,
    "n": 17014,
    "h": 107014,
    "t": "Research"
  },
  "15": {
    "b": 84,
    "a": 4,
    "p": 58,
    "n": 17015,
    "h": 107015,
    "t": "Research"
  },
  "16": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17427,
    "h": 107427,
    "t": "UniqueTech"
  },
  "17": {
    "b": 84,
    "a": 4,
    "p": 3,
    "n": 17017,
    "h": 107017,
    "t": "Research"
  },
  "21": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17428,
    "h": 107428,
    "t": "UniqueTech"
  },
  "22": {
    "b": 109,
    "a": 1,
    "p": 6,
    "n": 17022,
    "h": 107022,
    "t": "Research"
  },
  "23": {
    "b": 84,
    "a": 3,
    "p": 7,
    "n": 17023,
    "h": 107023,
    "t": "Research"
  },
  "24": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17429,
    "h": 107429,
    "t": "UniqueTech"
  },
  "28": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17451,
    "h": 107451,
    "t": "UniqueTech"
  },
  "34": {
    "b": 45,
    "a": 3,
    "p": 147,
    "n": 17034,
    "h": 107034,
    "t": "Research"
  },
  "35": {
    "b": 45,
    "a": 4,
    "p": 148,
    "n": 17035,
    "h": 107035,
    "t": "Research"
  },
  "39": {
    "b": 101,
    "a": 3,
    "p": 10,
    "n": 17039,
    "h": 107039,
    "t": "Research"
  },
  "45": {
    "b": 1806,
    "a": 4,
    "p": 11,
    "n": 17045,
    "h": 107045,
    "t": "Research"
  },
  "46": {
    "b": 1806,
    "a": 3,
    "p": 131,
    "n": 17462,
    "h": 107462,
    "t": "Research"
  },
  "47": {
    "b": 209,
    "a": 4,
    "p": 12,
    "n": 17047,
    "h": 107047,
    "t": "Research"
  },
  "48": {
    "b": 84,
    "a": 3,
    "p": 113,
    "n": 17410,
    "h": 107410,
    "t": "Research"
  },
  "49": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17431,
    "h": 107431,
    "t": "UniqueTech"
  },
  "50": {
    "b": 209,
    "a": 3,
    "p": 13,
    "n": 17050,
    "h": 107050,
    "t": "Research"
  },
  "51": {
    "b": 209,
    "a": 4,
    "p": 14,
    "n": 17051,
    "h": 107051,
    "t": "Research"
  },
  "52": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17432,
    "h": 107432,
    "t": "UniqueTech"
  },
  "54": {
    "b": 209,
    "a": 3,
    "p": 60,
    "n": 17054,
    "h": 107054,
    "t": "Research"
  },
  "55": {
    "b": 1808,
    "a": 2,
    "p": 15,
    "n": 17055,
    "h": 107055,
    "t": "Research"
  },
  "59": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17059,
    "h": 107059,
    "t": "UniqueTech"
  },
  "61": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17318,
    "h": 107318,
    "t": "UniqueTech"
  },
  "63": {
    "b": 209,
    "a": 4,
    "p": 16,
    "n": 17063,
    "h": 107063,
    "t": "Research"
  },
  "64": {
    "b": 209,
    "a": 4,
    "p": 47,
    "n": 17320,
    "h": 107320,
    "t": "Research"
  },
  "65": {
    "b": 45,
    "a": 3,
    "p": 41,
    "n": 17314,
    "h": 107314,
    "t": "Research"
  },
  "67": {
    "b": 103,
    "a": 2,
    "p": 17,
    "n": 17067,
    "h": 107067,
    "t": "Research"
  },
  "68": {
    "b": 103,
    "a": 3,
    "p": 18,
    "n": 17068,
    "h": 107068,
    "t": "Research"
  },
  "74": {
    "b": 103,
    "a": 2,
    "p": 63,
    "n": 17074,
    "h": 107074,
    "t": "Research"
  },
  "75": {
    "b": 103,
    "a": 4,
    "p": 21,
    "n": 17075,
    "h": 107075,
    "t": "Research"
  },
  "76": {
    "b": 103,
    "a": 3,
    "p": 22,
    "n": 17076,
    "h": 107076,
    "t": "Research"
  },
  "77": {
    "b": 103,
    "a": 4,
    "p": 64,
    "n": 17077,
    "h": 107077,
    "t": "Research"
  },
  "80": {
    "b": 103,
    "a": 4,
    "p": 65,
    "n": 17080,
    "h": 107080,
    "t": "Research"
  },
  "81": {
    "b": 103,
    "a": 2,
    "p": 66,
    "n": 17081,
    "h": 107081,
    "t": "Research"
  },
  "82": {
    "b": 103,
    "a": 3,
    "p": 23,
    "n": 17082,
    "h": 107082,
    "t": "Research"
  },
  "93": {
    "b": 209,
    "a": 3,
    "p": 25,
    "n": 17093,
    "h": 107093,
    "t": "Research"
  },
  "101": {
    "b": 109,
    "a": 1,
    "p": 30,
    "n": 17101,
    "h": 107101,
    "t": "Research"
  },
  "102": {
    "b": 109,
    "a": 2,
    "p": 31,
    "n": 17102,
    "h": 107102,
    "t": "Research"
  },
  "103": {
    "b": 109,
    "a": 3,
    "p": 32,
    "n": 17103,
    "h": 107103,
    "t": "Research"
  },
  "140": {
    "b": 209,
    "a": 3,
    "p": 76,
    "n": 17186,
    "h": 107186,
    "t": "Research"
  },
  "182": {
    "b": 1808,
    "a": 3,
    "p": 62,
    "n": 17180,
    "h": 107180,
    "t": "Research"
  },
  "194": {
    "b": 209,
    "a": 3,
    "p": 46,
    "n": 17163,
    "h": 107163,
    "t": "Research"
  },
  "199": {
    "b": 103,
    "a": 2,
    "p": 34,
    "n": 17172,
    "h": 107172,
    "t": "Research"
  },
  "200": {
    "b": 103,
    "a": 3,
    "p": 35,
    "n": 17150,
    "h": 107150,
    "t": "Research"
  },
  "201": {
    "b": 103,
    "a": 4,
    "p": 37,
    "n": 17151,
    "h": 107151,
    "t": "Research"
  },
  "202": {
    "b": 1808,
    "a": 2,
    "p": 70,
    "n": 17189,
    "h": 107189,
    "t": "Research"
  },
  "203": {
    "b": 1808,
    "a": 3,
    "p": 71,
    "n": 17190,
    "h": 107190,
    "t": "Research"
  },
  "211": {
    "b": 103,
    "a": 2,
    "p": 49,
    "n": 17208,
    "h": 107208,
    "t": "Research"
  },
  "212": {
    "b": 103,
    "a": 3,
    "p": 50,
    "n": 17209,
    "h": 107209,
    "t": "Research"
  },
  "213": {
    "b": 109,
    "a": 2,
    "p": 79,
    "n": 17211,
    "h": 107211,
    "t": "Research"
  },
  "215": {
    "b": 12,
    "a": 3,
    "p": 80,
    "n": 17210,
    "h": 107210,
    "t": "Research"
  },
  "219": {
    "b": 103,
    "a": 4,
    "p": 51,
    "n": 17216,
    "h": 107216,
    "t": "Research"
  },
  "221": {
    "b": 1808,
    "a": 4,
    "p": 81,
    "n": 17231,
    "h": 107231,
    "t": "Research"
  },
  "230": {
    "b": 1806,
    "a": 4,
    "p": 82,
    "n": 17222,
    "h": 107222,
    "t": "Research"
  },
  "231": {
    "b": 1806,
    "a": 3,
    "p": 83,
    "n": 17221,
    "h": 107221,
    "t": "Research"
  },
  "233": {
    "b": 1806,
    "a": 4,
    "p": 84,
    "n": 17220,
    "h": 107220,
    "t": "Research"
  },
  "249": {
    "b": 109,
    "a": 3,
    "p": 42,
    "n": 17246,
    "h": 107246,
    "t": "Research"
  },
  "252": {
    "b": 1806,
    "a": 3,
    "p": 73,
    "n": 17249,
    "h": 107249,
    "t": "Research"
  },
  "278": {
    "b": 1808,
    "a": 2,
    "p": 87,
    "n": 17276,
    "h": 107276,
    "t": "Research"
  },
  "279": {
    "b": 1808,
    "a": 3,
    "p": 88,
    "n": 17277,
    "h": 107277,
    "t": "Research"
  },
  "280": {
    "b": 109,
    "a": 3,
    "p": 89,
    "n": 17282,
    "h": 107282,
    "t": "Research"
  },
  "315": {
    "b": 82,
    "a": 4,
    "p": 91,
    "n": 17319,
    "h": 107319,
    "t": "Research"
  },
  "316": {
    "b": 1806,
    "a": 3,
    "p": 92,
    "n": 17315,
    "h": 107315,
    "t": "Research"
  },
  "319": {
    "b": 1806,
    "a": 3,
    "p": 93,
    "n": 17316,
    "h": 107316,
    "t": "Research"
  },
  "321": {
    "b": 82,
    "a": 4,
    "p": 5,
    "n": 17322,
    "h": 107322,
    "t": "Research"
  },
  "322": {
    "b": 209,
    "a": 3,
    "p": 61,
    "n": 17321,
    "h": 107321,
    "t": "Research"
  },
  "373": {
    "b": 45,
    "a": 4,
    "p": 97,
    "n": 17377,
    "h": 107377,
    "t": "Research"
  },
  "374": {
    "b": 45,
    "a": 3,
    "p": 98,
    "n": 17372,
    "h": 107372,
    "t": "Research"
  },
  "375": {
    "b": 45,
    "a": 4,
    "p": 99,
    "n": 17373,
    "h": 107373,
    "t": "Research"
  },
  "377": {
    "b": 209,
    "a": 4,
    "p": 101,
    "n": 17378,
    "h": 107378,
    "t": "Research"
  },
  "379": {
    "b": 82,
    "a": 4,
    "p": 103,
    "n": 17376,
    "h": 107376,
    "t": "Research"
  },
  "380": {
    "b": 209,
    "a": 3,
    "p": 104,
    "n": 17374,
    "h": 107374,
    "t": "Research"
  },
  "408": {
    "b": 82,
    "a": 4,
    "p": 19,
    "n": 17408,
    "h": 107408,
    "t": "Research"
  },
  "435": {
    "b": 101,
    "a": 2,
    "p": 110,
    "n": 17409,
    "h": 107409,
    "t": "Research"
  },
  "436": {
    "b": 87,
    "a": 4,
    "p": 111,
    "n": 17415,
    "h": 107415,
    "t": "Research"
  },
  "437": {
    "b": 87,
    "a": 3,
    "p": 112,
    "n": 17411,
    "h": 107411,
    "t": "Research"
  },
  "438": {
    "b": 1806,
    "a": 4,
    "p": 109,
    "n": 17416,
    "h": 107416,
    "t": "Research"
  },
  "439": {
    "b": 1806,
    "a": 3,
    "p": 108,
    "n": 17412,
    "h": 107412,
    "t": "Research"
  },
  "440": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17325,
    "h": 107325,
    "t": "UniqueTech"
  },
  "441": {
    "b": 1806,
    "a": 3,
    "p": 114,
    "n": 17435,
    "h": 107435,
    "t": "Research"
  },
  "445": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17438,
    "h": 107438,
    "t": "UniqueTech"
  },
  "454": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17447,
    "h": 107447,
    "t": "UniqueTech"
  },
  "455": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17448,
    "h": 107448,
    "t": "UniqueTech"
  },
  "457": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17439,
    "h": 107439,
    "t": "UniqueTech"
  },
  "460": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17326,
    "h": 107326,
    "t": "UniqueTech"
  },
  "461": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17327,
    "h": 107327,
    "t": "UniqueTech"
  },
  "462": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17368,
    "h": 107368,
    "t": "UniqueTech"
  },
  "463": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17312,
    "h": 107312,
    "t": "UniqueTech"
  },
  "464": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17313,
    "h": 107313,
    "t": "UniqueTech"
  },
  "482": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17369,
    "h": 107369,
    "t": "UniqueTech"
  },
  "483": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17370,
    "h": 107370,
    "t": "UniqueTech"
  },
  "484": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17371,
    "h": 107371,
    "t": "UniqueTech"
  },
  "485": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17379,
    "h": 107379,
    "t": "UniqueTech"
  },
  "486": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17380,
    "h": 107380,
    "t": "UniqueTech"
  },
  "487": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17280,
    "h": 107280,
    "t": "UniqueTech"
  },
  "488": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17281,
    "h": 107281,
    "t": "UniqueTech"
  },
  "489": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17283,
    "h": 107283,
    "t": "UniqueTech"
  },
  "491": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17285,
    "h": 107285,
    "t": "UniqueTech"
  },
  "492": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17286,
    "h": 107286,
    "t": "UniqueTech"
  },
  "493": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17287,
    "h": 107287,
    "t": "UniqueTech"
  },
  "499": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17273,
    "h": 107273,
    "t": "UniqueTech"
  },
  "506": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17270,
    "h": 107270,
    "t": "UniqueTech"
  },
  "507": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17271,
    "h": 107271,
    "t": "UniqueTech"
  },
  "513": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17269,
    "h": 107269,
    "t": "UniqueTech"
  },
  "514": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17275,
    "h": 107275,
    "t": "UniqueTech"
  },
  "515": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17274,
    "h": 107274,
    "t": "UniqueTech"
  },
  "516": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17266,
    "h": 107266,
    "t": "UniqueTech"
  },
  "517": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17267,
    "h": 107267,
    "t": "UniqueTech"
  },
  "573": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17251,
    "h": 107251,
    "t": "UniqueTech"
  },
  "574": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17252,
    "h": 107252,
    "t": "UniqueTech"
  },
  "575": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17253,
    "h": 107253,
    "t": "UniqueTech"
  },
  "576": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17254,
    "h": 107254,
    "t": "UniqueTech"
  },
  "577": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17255,
    "h": 107255,
    "t": "UniqueTech"
  },
  "578": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17256,
    "h": 107256,
    "t": "UniqueTech"
  },
  "579": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17257,
    "h": 107257,
    "t": "UniqueTech"
  },
  "602": {
    "b": 12,
    "a": 2,
    "p": 118,
    "n": 17258,
    "h": 107258,
    "t": "Research"
  },
  "608": {
    "b": 209,
    "a": 4,
    "p": 119,
    "n": 17278,
    "h": 107278,
    "t": "Research"
  },
  "622": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17291,
    "h": 107291,
    "t": "UniqueTech"
  },
  "623": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17292,
    "h": 107292,
    "t": "UniqueTech"
  },
  "624": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17293,
    "h": 107293,
    "t": "UniqueTech"
  },
  "625": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17294,
    "h": 107294,
    "t": "UniqueTech"
  },
  "626": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17295,
    "h": 107295,
    "t": "UniqueTech"
  },
  "627": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17296,
    "h": 107296,
    "t": "UniqueTech"
  },
  "628": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17297,
    "h": 107297,
    "t": "UniqueTech"
  },
  "629": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17298,
    "h": 107298,
    "t": "UniqueTech"
  },
  "685": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17307,
    "h": 107307,
    "t": "UniqueTech"
  },
  "686": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17308,
    "h": 107308,
    "t": "UniqueTech"
  },
  "687": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17309,
    "h": 107309,
    "t": "UniqueTech"
  },
  "688": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17310,
    "h": 107310,
    "t": "UniqueTech"
  },
  "689": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17311,
    "h": 107311,
    "t": "UniqueTech"
  },
  "690": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17398,
    "h": 107398,
    "t": "UniqueTech"
  },
  "691": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17399,
    "h": 107399,
    "t": "UniqueTech"
  },
  "692": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17400,
    "h": 107400,
    "t": "UniqueTech"
  },
  "754": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17342,
    "h": 107342,
    "t": "UniqueTech"
  },
  "755": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17343,
    "h": 107343,
    "t": "UniqueTech"
  },
  "756": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17344,
    "h": 107344,
    "t": "UniqueTech"
  },
  "757": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17345,
    "h": 107345,
    "t": "UniqueTech"
  },
  "782": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17348,
    "h": 107348,
    "t": "UniqueTech"
  },
  "783": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17349,
    "h": 107349,
    "t": "UniqueTech"
  },
  "784": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17350,
    "h": 107350,
    "t": "UniqueTech"
  },
  "785": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17351,
    "h": 107351,
    "t": "UniqueTech"
  },
  "831": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17357,
    "h": 107357,
    "t": "UniqueTech"
  },
  "832": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17358,
    "h": 107358,
    "t": "UniqueTech"
  },
  "833": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17359,
    "h": 107359,
    "t": "UniqueTech"
  },
  "834": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17360,
    "h": 107360,
    "t": "UniqueTech"
  },
  "835": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17361,
    "h": 107361,
    "t": "UniqueTech"
  },
  "836": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17362,
    "h": 107362,
    "t": "UniqueTech"
  },
  "875": {
    "b": 12,
    "a": 3,
    "p": 116,
    "n": 17450,
    "h": 107450,
    "t": "Research"
  },
  "883": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17444,
    "h": 107444,
    "t": "UniqueTech"
  },
  "884": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17445,
    "h": 107445,
    "t": "UniqueTech"
  },
  "902": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17084,
    "h": 107084,
    "t": "UniqueTech"
  },
  "906": {
    "b": 45,
    "a": 2,
    "p": 140,
    "n": 517005,
    "h": 607005,
    "t": "Research"
  },
  "907": {
    "b": 209,
    "a": 4,
    "p": 141,
    "n": 517004,
    "h": 607004,
    "t": "Research"
  },
  "908": {
    "b": 209,
    "a": 3,
    "p": 142,
    "n": 517003,
    "h": 607003,
    "t": "Research"
  },
  "909": {
    "b": 209,
    "a": 3,
    "p": 40,
    "n": 517006,
    "h": 607006,
    "t": "Research"
  },
  "910": {
    "b": 209,
    "a": 4,
    "p": 143,
    "n": 517007,
    "h": 607007,
    "t": "Research"
  },
  "921": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17406,
    "h": 107406,
    "t": "UniqueTech"
  },
  "922": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17407,
    "h": 107407,
    "t": "UniqueTech"
  },
  "923": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17440,
    "h": 107440,
    "t": "UniqueTech"
  },
  "924": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17441,
    "h": 107441,
    "t": "UniqueTech"
  },
  "996": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17466,
    "h": 107466,
    "t": "UniqueTech"
  },
  "997": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17467,
    "h": 107467,
    "t": "UniqueTech"
  },
  "1006": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17468,
    "h": 107468,
    "t": "UniqueTech"
  },
  "1007": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17469,
    "h": 107469,
    "t": "UniqueTech"
  },
  "1012": {
    "b": 68,
    "a": 4,
    "p": 136,
    "n": 17486,
    "h": 107486,
    "t": "Research"
  },
  "1013": {
    "b": 68,
    "a": 3,
    "p": 137,
    "n": 17485,
    "h": 107485,
    "t": "Research"
  },
  "1014": {
    "b": 68,
    "a": 2,
    "p": 138,
    "n": 17484,
    "h": 107484,
    "t": "Research"
  },
  "1061": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17473,
    "h": 107473,
    "t": "UniqueTech"
  },
  "1062": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17474,
    "h": 107474,
    "t": "UniqueTech"
  },
  "1069": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17476,
    "h": 107476,
    "t": "UniqueTech"
  },
  "1070": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17477,
    "h": 107477,
    "t": "UniqueTech"
  },
  "1080": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17480,
    "h": 107480,
    "t": "UniqueTech"
  },
  "1081": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17481,
    "h": 107481,
    "t": "UniqueTech"
  },
  "1365": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17491,
    "h": 107491,
    "t": "UniqueTech"
  },
  "1366": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17492,
    "h": 107492,
    "t": "UniqueTech"
  },
  "1379": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17495,
    "h": 107495,
    "t": "UniqueTech"
  },
  "1380": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 17496,
    "h": 107496,
    "t": "UniqueTech"
  },
  "1392": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 17499,
    "h": 107499,
    "t": "UniqueTech"
  },
  "1393": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 517000,
    "h": 607000,
    "t": "UniqueTech"
  },
  "1404": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 517023,
    "h": 607023,
    "t": "UniqueTech"
  },
  "1452": {
    "b": 87,
    "a": 4,
    "p": 56,
    "n": 517024,
    "h": 607024,
    "t": "RegionalTech"
  },
  "1464": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 517013,
    "h": 607013,
    "t": "UniqueTech"
  },
  "1473": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 517015,
    "h": 607015,
    "t": "UniqueTech"
  },
  "1474": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 517016,
    "h": 607016,
    "t": "UniqueTech"
  },
  "1483": {
    "b": 82,
    "a": 4,
    "p": 107,
    "n": 517018,
    "h": 607018,
    "t": "UniqueTech"
  },
  "1484": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 517019,
    "h": 607019,
    "t": "UniqueTech"
  },
  "1491": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 517020,
    "h": 607020,
    "t": "UniqueTech"
  },
  "1496": {
    "b": 82,
    "a": 3,
    "p": 33,
    "n": 517025,
    "h": 607025,
    "t": "UniqueTech"
  }
};

  // Registro en memoria de tecnologías procesadas
  let _parsedTechs = [];
  let _techsById = new Map();

  function cleanString(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '').replace(/‹DEFAULT›/g, '').replace(/‹.*?›/g, '').replace(/\n/g, ' ').trim();
  }

  /**
   * Resuelve el nombre en español utilizando el ID lingüístico oficial
   */
  function resolveTechSpanishName(tech, meta, strings = {}) {
    const s = strings;
    const langId = tech.LanguageNameId || (meta ? (meta.n - 10000) : null);

    // Excepción oficial DE para Viking Chieftains (ID 463)
    if (Number(tech.ID) === 463 && langId && s[langId + 21000]) {
      const boldMatch = s[langId + 21000].match(/<b>(.*?)<\/b>/i);
      if (boldMatch && boldMatch[1]) return cleanString(boldMatch[1]);
    }

    if (langId && s[langId]) return cleanString(s[langId]);
    if (meta && meta.n && s[meta.n]) return cleanString(s[meta.n]);
    if (langId && s[langId + 10000]) return cleanString(s[langId + 10000]);
    if (langId && s[langId + 9000]) return cleanString(s[langId + 9000]);
    if (langId && s[langId + 21000]) {
      const m = s[langId + 21000].match(/<b>(.*?)<\/b>/i);
      if (m && m[1]) return cleanString(m[1]);
    }
    if (meta && meta.name) return cleanString(meta.name);
    if (tech.internal_name) return tech.internal_name.replace(/_/g, ' ');
    return `Tecnología #${tech.ID || ''}`;
  }

  /**
   * Resuelve la descripción en español eliminando prefijos de UI
   */
  function resolveTechSpanishDescription(tech, meta, strings = {}) {
    const s = strings;
    const helpId = tech.LanguageHelpId || (meta ? meta.h : null);
    const langId = tech.LanguageNameId || (meta ? (meta.n - 10000) : null);

    let desc = '';
    if (helpId && s[helpId]) desc = s[helpId];
    else if (langId && s[langId + 21000]) desc = s[langId + 21000];
    else if (langId && s[langId + 100000]) desc = s[langId + 100000];

    desc = cleanString(desc);
    // Limpiar prefijo "Investigar X ()" si está presente
    desc = desc.replace(/^Investigar\s+.*?\(\s*\)\s*/i, '').trim();
    return desc;
  }

  /**
   * Parser e ingesta dinámica del nodo data.Tech y data.civs de data.json
   */
  function parseTechs(dataJson, stringsJson = {}) {
    if (!dataJson || !dataJson.data || !dataJson.data.Tech) {
      console.warn('parseTechs: dataJson o dataJson.data.Tech no disponible');
      return _parsedTechs;
    }

    const rawTechs = dataJson.data.Tech;
    const civsData = dataJson.civs || {};
    const strings = stringsJson || {};

    _parsedTechs = [];
    _techsById.clear();

    // Mapeo inverso de tecnologías por civilización
    const civTechMap = new Map(); // techId -> Set of civKeys
    const civCrownMap = new Map(); // civKey -> { castle: id, imperial: id }

    for (const [civKey, civObj] of Object.entries(civsData)) {
      const techList = civObj.Tech || [];
      techList.forEach(tId => {
        const numId = Number(tId);
        if (!civTechMap.has(numId)) civTechMap.set(numId, new Set());
        civTechMap.get(numId).add(civKey);
      });
    }

    // Identificar coronas para cada civ
    for (const [civKey, civObj] of Object.entries(civsData)) {
      const techList = civObj.Tech || [];
      let cCrown = null;
      let iCrown = null;
      for (const tId of techList) {
        const numId = Number(tId);
        const meta = TECH_METADATA[numId];
        const raw = rawTechs[numId];
        const bId = (meta && meta.b) || (raw && raw.Building);
        const age = (meta && meta.a) || (raw && raw.Age);
        const nodeType = meta ? meta.t : null;
        if (bId === 82 || nodeType === 'UniqueTech') {
          if (age === 3 && !cCrown) cCrown = numId;
          else if (age === 4 && !iCrown) iCrown = numId;
        }
      }
      civCrownMap.set(civKey, { castle: cCrown, imperial: iCrown });
    }

    // Procesar cada tecnología en data.Tech
    for (const [techIdStr, rawTech] of Object.entries(rawTechs)) {
      const id = Number(techIdStr);
      const meta = TECH_METADATA[id] || null;

      const buildingId = (meta && meta.b) || rawTech.Building || 109;
      const buildingKey = BUILDING_TECH_ORIGIN[buildingId] || "general";
      const buildingInfo = TECH_BUILDING_INFO[buildingKey] || TECH_BUILDING_INFO.general;

      const age = (meta && meta.a) || rawTech.Age || 1;
      const category = categorizeTech(id, Object.assign({}, rawTech, meta || {}));

      const name = resolveTechSpanishName(rawTech, meta, strings);
      const description = resolveTechSpanishDescription(rawTech, meta, strings);

      const pictureIndex = meta ? meta.p : id;
      const icon = `img/Tech/${pictureIndex}.png`;

      // Costes normalizados
      const cost = {
        Food: (rawTech.Cost && rawTech.Cost.Food) || 0,
        Wood: (rawTech.Cost && rawTech.Cost.Wood) || 0,
        Gold: (rawTech.Cost && rawTech.Cost.Gold) || 0,
        Stone: (rawTech.Cost && rawTech.Cost.Stone) || 0
      };

      const researchTime = rawTech.ResearchTime !== undefined ? rawTech.ResearchTime : 0;

      // Civilizaciones que tienen habilitada la tecnología
      const availableCivsSet = civTechMap.get(id) || new Set();
      const civs = Array.from(availableCivsSet);

      // Si es corona única, identificar la civ propietaria y tipo de corona
      let uniqueCiv = null;
      let crownType = null; // 'castle' (plata) o 'imperial' (oro)

      if (category === 'unique_crown') {
        for (const [civKey, crowns] of civCrownMap.entries()) {
          if (crowns.castle === id) {
            uniqueCiv = civKey;
            crownType = 'castle';
            break;
          } else if (crowns.imperial === id) {
            uniqueCiv = civKey;
            crownType = 'imperial';
            break;
          }
        }
      }

      const techObj = {
        id,
        internal_name: rawTech.internal_name || '',
        name,
        description,
        icon,
        pictureIndex,
        age,
        buildingId,
        buildingKey,
        buildingInfo,
        category,
        categoryInfo: TECH_CATEGORIES[category] || TECH_CATEGORIES.general,
        cost,
        researchTime,
        civs,
        isUnique: category === 'unique_crown',
        uniqueCiv,
        crownType,
        repeatable: !!rawTech.Repeatable
      };

      // Filtrar tecnologías automáticas u obsoletas (como Cartografía y Rastreo)
      if (!isActionableTech(id, techObj)) {
        continue;
      }

      _parsedTechs.push(techObj);
      _techsById.set(id, techObj);
    }

    // Ordenar de forma natural: por Edad (1 a 4), luego por Categoría y Nombre
    _parsedTechs.sort((a, b) => {
      if (a.age !== b.age) return a.age - b.age;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name, 'es');
    });

    return _parsedTechs;
  }

  function getAllTechs() {
    return _parsedTechs;
  }

  function getTechById(techId) {
    return _techsById.get(Number(techId)) || null;
  }

  function getTechsByBuilding(buildingKey) {
    const norm = (buildingKey || '').toLowerCase().trim();
    return _parsedTechs.filter(t => t.buildingKey === norm);
  }

  function getTechsByCategory(categoryKey) {
    if (!categoryKey || categoryKey === 'all') return _parsedTechs;
    const norm = categoryKey.toLowerCase().trim();
    return _parsedTechs.filter(t => t.category === norm);
  }

  function getTechsByCiv(civName) {
    if (!civName || civName === 'all' || civName === 'Generic') return _parsedTechs;
    const norm = civName.toLowerCase().trim();
    return _parsedTechs.filter(t => {
      return t.civs.some(c => c.toLowerCase().trim() === norm);
    });
  }

  return {
    DEPRECATED_OR_AUTO_TECHS,
    isActionableTech,
    BUILDING_TECH_ORIGIN,
    categorizeTech,
    TECH_CATEGORIES,
    TECH_BUILDING_INFO,
    TECH_METADATA,
    parseTechs,
    getTechById,
    getTechsByBuilding,
    getTechsByCiv,
    getTechsByCategory,
    getAllTechs,
    PASTURE_TECHS_DATA,
    PASTURE_TECHS
  };
});
