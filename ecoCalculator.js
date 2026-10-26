/**
 * ecoCalculator.js
 * Interfaz técnica de la Calculadora Económica para Age of Empires II: DE.
 *
 * Mejoras críticas implementadas:
 * 1. Erradicación total de emojis por assets e iconografía oficial (img/Resource/ y img/Techs/)
 * 2. Monitor explícito de ratios individuales (R_v) y fórmula aritmética visible: (Demanda / Ratio = Aldeanos)
 * 3. Conexión reactiva con descuentos dinámicos de civilización (Godos, Mayas, Bizantinos, Portugueses, etc.)
 * 4. Botonera canónica de tecnologías económicas (44x44px) con estados Activo, Inactivo y Bloqueado por edad
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    let importedRates = null;
    let importedDiscounts = null;
    try { importedRates = require('./ecoRates.js'); } catch (e) {}
    try { importedDiscounts = require('./civUnitDiscounts.js'); } catch (e) {}
    module.exports = factory(importedRates, importedDiscounts);
  } else if (typeof define === 'function' && define.amd) {
    define(['./ecoRates', './civUnitDiscounts'], factory);
  } else {
    global.ecoCalculator = factory(global.ecoRates, global.civUnitDiscounts || global.civUnitDiscountsModule);
  }
})(typeof window !== 'undefined' ? window : this, function (importedRates, importedDiscounts) {
  'use strict';

  // Referencia al motor de tasas
  const ratesEngine = importedRates ||
    (typeof ecoRates !== 'undefined' ? ecoRates : (typeof window !== 'undefined' && window.ecoRates ? window.ecoRates : null));

  // =========================================================================
  // CATÁLOGO DE 56 CIVILIZACIONES
  // =========================================================================
  const CIVS_56 = [
    { id: 'armenians', name: 'Armenios' },
    { id: 'aztecs', name: 'Aztecas' },
    { id: 'bengalis', name: 'Bengalíes' },
    { id: 'berbers', name: 'Bereberes' },
    { id: 'bohemians', name: 'Bohemios' },
    { id: 'britons', name: 'Britanos' },
    { id: 'bulgarians', name: 'Búlgaros' },
    { id: 'burgundians', name: 'Borgoñones' },
    { id: 'burmese', name: 'Birmanos' },
    { id: 'byzantines', name: 'Bizantinos' },
    { id: 'celts', name: 'Celtas' },
    { id: 'chinese', name: 'Chinos' },
    { id: 'cumans', name: 'Cumanos' },
    { id: 'danes', name: 'Daneses' },
    { id: 'dravidians', name: 'Dravídicos' },
    { id: 'ethiopians', name: 'Etíopes' },
    { id: 'franks', name: 'Francos' },
    { id: 'georgians', name: 'Georgianos' },
    { id: 'goths', name: 'Godos' },
    { id: 'gurjaras', name: 'Gurjaras' },
    { id: 'hindustanis', name: 'Hindustaníes' },
    { id: 'huns', name: 'Hunos' },
    { id: 'incas', name: 'Incas' },
    { id: 'italians', name: 'Italianos' },
    { id: 'japanese', name: 'Japoneses' },
    { id: 'jurchens', name: 'Jurchen' },
    { id: 'khitans', name: 'Khitanes' },
    { id: 'khmer', name: 'Jemeres' },
    { id: 'koreans', name: 'Coreanos' },
    { id: 'lithuanians', name: 'Lituanos' },
    { id: 'magyars', name: 'Magiares' },
    { id: 'malay', name: 'Malayos' },
    { id: 'malians', name: 'Malienses' },
    { id: 'mapuche', name: 'Mapuches' },
    { id: 'mayans', name: 'Mayas' },
    { id: 'mongols', name: 'Mongoles' },
    { id: 'muisca', name: 'Muiscas' },
    { id: 'persians', name: 'Persas' },
    { id: 'poles', name: 'Polacos' },
    { id: 'portuguese', name: 'Portugueses' },
    { id: 'romans', name: 'Romanos' },
    { id: 'saracens', name: 'Sarracenos' },
    { id: 'saxons', name: 'Sajones' },
    { id: 'shu', name: 'Shu' },
    { id: 'sicilians', name: 'Sicilianos' },
    { id: 'slavs', name: 'Eslavos' },
    { id: 'spanish', name: 'Españoles' },
    { id: 'tatars', name: 'Tártaros' },
    { id: 'teutons', name: 'Teutones' },
    { id: 'tupi', name: 'Tupíes' },
    { id: 'turks', name: 'Turcos' },
    { id: 'varangians', name: 'Varegos' },
    { id: 'vietnamese', name: 'Vietnamitas' },
    { id: 'vikings', name: 'Vikingos' },
    { id: 'wei', name: 'Wei' },
    { id: 'wu', name: 'Wu' }
  ].sort((a, b) => a.name.localeCompare(b.name, 'es'));

  // Ranking numérico de edades
  const AGE_RANK = Object.freeze({
    dark: 1,
    feudal: 2,
    castle: 3,
    imperial: 4
  });

  // =========================================================================
  // BOTONERA CANÓNICA DE TECNOLOGÍAS ECONÓMICAS
  // =========================================================================
  const ECO_TECHS = [
    // Granjas (Molino)
    { key: 'horse_collar', techId: 14, picIndex: 2, name: 'Collar de caballo', minAge: 'feudal', ageName: 'Edad Feudal', cluster: 'Granjas', desc: '+75 Capacidad granja (+169 Sicilianos)' },
    { key: 'heavy_plow', techId: 13, picIndex: 1, name: 'Arado pesado', minAge: 'castle', ageName: 'Edad de los Castillos', cluster: 'Granjas', desc: '+125 Capacidad granja (+281 Sicilianos)' },
    { key: 'crop_rotation', techId: 12, picIndex: 0, name: 'Rotación de cultivos', minAge: 'imperial', ageName: 'Edad Imperial', cluster: 'Granjas', desc: '+175 Capacidad granja (+394 Sicilianos)' },

    // Madera (Campamento Maderero)
    { key: 'double_bit_axe', techId: 202, picIndex: 70, name: 'Hacha de doble filo', minAge: 'feudal', ageName: 'Edad Feudal', cluster: 'Madera', desc: 'Leñadores +20% velocidad de recolección' },
    { key: 'bow_saw', techId: 203, picIndex: 71, name: 'Sierra de arco', minAge: 'castle', ageName: 'Edad de los Castillos', cluster: 'Madera', desc: 'Leñadores +20% velocidad de recolección' },
    { key: 'two_man_saw', techId: 221, picIndex: 81, name: 'Sierra para dos hombres', minAge: 'imperial', ageName: 'Edad Imperial', cluster: 'Madera', desc: 'Leñadores +10% velocidad de recolección' },

    // Minería (Campamento Minero)
    { key: 'gold_mining', techId: 55, picIndex: 15, name: 'Minería aurífera', minAge: 'feudal', ageName: 'Edad Feudal', cluster: 'Minería', desc: 'Mineros de oro +15% velocidad de recolección' },
    { key: 'gold_shaft_mining', techId: 182, picIndex: 62, name: 'Pozo minero aurífero', minAge: 'castle', ageName: 'Edad de los Castillos', cluster: 'Minería', desc: 'Mineros de oro +15% velocidad de recolección' },
    { key: 'stone_mining', techId: 278, picIndex: 87, name: 'Explotación de canteras', minAge: 'feudal', ageName: 'Edad Feudal', cluster: 'Minería', desc: 'Canteros +15% velocidad de recolección' },
    { key: 'stone_shaft_mining', techId: 279, picIndex: 88, name: 'Pozo de cantera', minAge: 'castle', ageName: 'Edad de los Castillos', cluster: 'Minería', desc: 'Canteros +15% velocidad de recolección' },

    // Logística (Centro Urbano)
    { key: 'wheelbarrow', techId: 213, picIndex: 79, name: 'Carretilla', minAge: 'feudal', ageName: 'Edad Feudal', cluster: 'Logística', desc: 'Velocidad aldeano +10%, Granjas +13%, otros +5%' },
    { key: 'hand_cart', techId: 249, picIndex: 42, name: 'Carro de mano', minAge: 'castle', ageName: 'Edad de los Castillos', cluster: 'Logística', desc: 'Velocidad aldeano +10%, Granjas +12%, otros +5%' },

    // Militar (Castillo / Edificios Militares)
    { key: 'conscription', techId: 315, picIndex: 91, icon: 'img/Tech/91.png', name: 'Leva (Conscription)', minAge: 'imperial', ageName: 'Edad Imperial', cluster: 'Militar', desc: 'Cuarteles, Galerías de tiro con arco, Establos y Castillos entrenan unidades un +33.3% más rápido (Work Rate +0.3333)' }
  ];

  // Pasturas (Khitanes - Sustituto de Molino)
  const PASTURE_TECHS_DATA = Object.freeze({
    138: {
      id: 138,
      internalName: "domestication",
      name: "Domesticación",
      age: "feudal",
      icon: "138.png", // Mano alimentando al carnero
      foodBonus: 115
    },
    137: {
      id: 137,
      internalName: "pastoralism",
      name: "Pastoreo",
      age: "castle",
      icon: "137.png", // Cayado de pastor
      foodBonus: 230
    },
    136: {
      id: 136,
      internalName: "transhumance",
      name: "Trashumancia",
      age: "imperial",
      icon: "136.png", // Rebaño en cercado
      foodBonus: 345
    }
  });

  const PASTURE_ECO_TECHS = [
    { key: 'domestication', altKey: 'horse_collar', techId: 138, picIndex: 138, icon: 'img/Tech/138.png', name: 'Domesticación', minAge: 'feudal', ageName: 'Edad Feudal', cluster: 'Pasturas', desc: '+115 Capacidad pastura (Total: 460)' },
    { key: 'pastoralism', altKey: 'heavy_plow', techId: 137, picIndex: 137, icon: 'img/Tech/137.png', name: 'Pastoreo', minAge: 'castle', ageName: 'Edad de los Castillos', cluster: 'Pasturas', desc: '+230 Capacidad pastura (Total: 690)' },
    { key: 'transhumance', altKey: 'crop_rotation', techId: 136, picIndex: 136, icon: 'img/Tech/136.png', name: 'Trashumancia', minAge: 'imperial', ageName: 'Edad Imperial', cluster: 'Pasturas', desc: '+345 Capacidad pastura (Total: 1035)' }
  ];

  const MILITARY_TECH_DEF = Object.freeze({
    id: 315,
    name: "Leva (Conscription)",
    icon: "img/Tech/91.png",
    age: "imperial"
  });

  // =========================================================================
  // CATÁLOGO DE UNIDADES POR EDIFICIO MILITAR (con iconos oficiales)
  // =========================================================================
  const CANONICAL_UNITS = [
    // Cuartel (Barracks - Infantería)
    { id: 74, name: 'Miliciano', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 50, Gold: 20 }, trainTime: 21 },
    { id: 75, name: 'Hombre de armas', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 50, Gold: 20 }, trainTime: 21 },
    { id: 77, name: 'Espadachín de espada larga', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 50, Gold: 20 }, trainTime: 21 },
    { id: 473, name: 'Espadachín de dos manos', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '11.png', cost: { Food: 50, Gold: 20 }, trainTime: 21 },
    { id: 567, name: 'Campeón', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '11.png', cost: { Food: 50, Gold: 20 }, trainTime: 21 },
    { id: 753, name: 'Explorador águila', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '753.png', cost: { Food: 20, Gold: 50 }, trainTime: 35 },
    { id: 751, name: 'Guerrero águila', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 20, Gold: 50 }, trainTime: 35 },
    { id: 752, name: 'Guerrero águila de élite', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 20, Gold: 50 }, trainTime: 20 },
    { id: 93, name: 'Lancero', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 35, Wood: 25 }, trainTime: 22 },
    { id: 358, name: 'Piquero', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 35, Wood: 25 }, trainTime: 22 },
    { id: 359, name: 'Alabardero', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, cost: { Food: 35, Wood: 25 }, trainTime: 22 },
    // Línea Champi (4 edades)
    { id: 2550, name: 'Explorador Champi', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2550.png', cost: { Food: 50, Gold: 25 }, trainTime: 42 },
    { id: 2588, name: 'Corredor Champi', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2588.png', cost: { Food: 50, Gold: 25 }, trainTime: 34 },
    { id: 2552, name: 'Guerrero Champi', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2552.png', cost: { Food: 50, Gold: 25 }, trainTime: 26 },
    { id: 2554, name: 'Guerrero Champi de élite', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2554.png', cost: { Food: 50, Gold: 25 }, trainTime: 21 },
    // Unidades adicionales de Cuartel
    { id: 1910, name: 'Guerrero Champa', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '1910.png', cost: { Food: 65, Gold: 30 }, trainTime: 16 },
    { id: 1911, name: 'Guerrero Champa de élite', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '1910.png', cost: { Food: 65, Gold: 30 }, trainTime: 14 },
    { id: 2582, name: 'Guerrero Ibiraçema', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2582.png', cost: { Food: 30, Gold: 60 }, trainTime: 24 },
    { id: 2584, name: 'Guerrero Ibiraçema de élite', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2584.png', cost: { Food: 30, Gold: 60 }, trainTime: 24 },
    { id: 2703, name: 'Guardia Varego', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2703.png', cost: { Food: 65, Gold: 45 }, trainTime: 30 },
    { id: 2704, name: 'Guardia Varego de élite', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '2704.png', cost: { Food: 65, Gold: 45 }, trainTime: 30 },
    { id: 1901, name: 'Lancero Incendiario', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '1901.png', cost: { Wood: 45, Gold: 45 }, trainTime: 17 },
    { id: 1903, name: 'Lancero Incendiario de élite', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '1903.png', cost: { Wood: 45, Gold: 45 }, trainTime: 17 },
    { id: 1699, name: 'Milicia Flamenca', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '1699.png', cost: { Food: 35, Gold: 25 }, trainTime: 16 },
    { id: 882, name: 'Condotiero', category: 'barracks', unitClass: 'infantry', building: 'Cuartel', bldIconId: 2, icon: '882.png', cost: { Food: 50, Gold: 35 }, trainTime: 18, age: 'imperial' },

    // Galería de Tiro con Arco (Archery Range)
    { id: 4, name: 'Arquero', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, cost: { Wood: 25, Gold: 45 }, trainTime: 35 },
    { id: 24, name: 'Ballestero', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, cost: { Wood: 25, Gold: 45 }, trainTime: 27 },
    { id: 492, name: 'Arbalestero', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, cost: { Wood: 25, Gold: 45 }, trainTime: 27 },
    { id: 7, name: 'Guerrillero', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, cost: { Food: 25, Wood: 35 }, trainTime: 26 },
    { id: 6, name: 'Guerrillero de élite', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, cost: { Food: 25, Wood: 35 }, trainTime: 22 },
    { id: 1155, name: 'Guerrillero imperial', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '1155.png', cost: { Food: 25, Wood: 35 }, trainTime: 22 },
    { id: 39, name: 'Arquero a caballo', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '39.png', cost: { Wood: 40, Gold: 60 }, trainTime: 34 },
    { id: 474, name: 'Arquero a caballo pesado', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '474.png', cost: { Wood: 40, Gold: 60 }, trainTime: 27 },
    { id: 5, name: 'Artillero manual', category: 'range', unitClass: 'gunpowder', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '5.png', cost: { Food: 45, Gold: 50 }, trainTime: 34 },
    { id: 1010, name: 'Genitour', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '1010.png', cost: { Food: 40, Wood: 35 }, trainTime: 25 },
    { id: 1012, name: 'Genitour de élite', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '1012.png', cost: { Food: 40, Wood: 35 }, trainTime: 23 },
    { id: 2700, name: 'Ballestero montado', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '2700.png', cost: { Wood: 40, Gold: 65 }, trainTime: 40 },
    { id: 2701, name: 'Ballestero montado pesado', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '2701.png', cost: { Wood: 40, Gold: 65 }, trainTime: 30 },
    { id: 2569, name: 'Jinete con boleadoras', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '2569.png', cost: { Food: 55, Gold: 60 }, trainTime: 21 },
    { id: 2571, name: 'Jinete con boleadoras de élite', category: 'range', unitClass: 'cavalry_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '2571.png', cost: { Food: 55, Gold: 60 }, trainTime: 19 },
    { id: 1920, name: 'Granadero', category: 'range', unitClass: 'gunpowder', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '1920.png', cost: { Wood: 60, Gold: 50 }, trainTime: 24 },
    { id: 185, name: 'Soldado con honda (Hondero)', category: 'range', unitClass: 'foot_archer', building: 'Galería de Tiro con Arco', bldIconId: 0, icon: '18.png', cost: { Food: 50, Wood: 25 }, trainTime: 25, age: 'castle' },

    // Establo (Stable - Caballería)
    { id: 448, name: 'Explorador', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 80 }, trainTime: 30 },
    { id: 546, name: 'Caballería ligera', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 80 }, trainTime: 30 },
    { id: 441, name: 'Húsar', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 80 }, trainTime: 30 },
    { id: 38, name: 'Jinete', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 60, Gold: 75 }, trainTime: 30 },
    { id: 283, name: 'Caballero', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 60, Gold: 75 }, trainTime: 30 },
    { id: 569, name: 'Paladín', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 60, Gold: 75 }, trainTime: 30 },
    { id: 329, name: 'Camello', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 55, Gold: 60 }, trainTime: 22 },
    { id: 330, name: 'Jinete de camello pesado', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 55, Gold: 60 }, trainTime: 22 },
    { id: 1132, name: 'Elefante de batalla', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 100, Gold: 70 }, trainTime: 24 },
    { id: 1134, name: 'Elefante de batalla de élite', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, icon: '1134.png', cost: { Food: 100, Gold: 70 }, trainTime: 24 },
    { id: 1370, name: 'Jinete estepario', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, cost: { Food: 70, Gold: 40 }, trainTime: 24 },
    { id: 1372, name: 'Lancero estepario de élite', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, icon: '1372.png', cost: { Food: 70, Gold: 40 }, trainTime: 20 },
    { id: 1944, name: 'Jinete de Hei Guang', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, icon: '1944.png', cost: { Food: 65, Gold: 65 }, trainTime: 28 },
    { id: 1946, name: 'Jinete de Hei Guang pesado', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, icon: '1946.png', cost: { Food: 65, Gold: 65 }, trainTime: 28 },
    { id: 1751, name: 'Jinete de Shrivamsha', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, icon: '1751.png', cost: { Food: 70, Gold: 30 }, trainTime: 20 },
    { id: 1753, name: 'Jinete de Shrivamsha de élite', category: 'stable', unitClass: 'cavalry', building: 'Establo', bldIconId: 23, icon: '1753.png', cost: { Food: 70, Gold: 30 }, trainTime: 20 },

    // Taller de Asedio (Siege Workshop)
    { id: 1258, name: 'Ariete', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, cost: { Wood: 160, Gold: 75 }, trainTime: 36 },
    { id: 422, name: 'Ariete cubierto', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '73.png', cost: { Wood: 160, Gold: 75 }, trainTime: 36 },
    { id: 548, name: 'Ariete de asedio', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '73.png', cost: { Wood: 160, Gold: 75 }, trainTime: 36 },
    { id: 1744, name: 'Elefante acorazado', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '1744.png', cost: { Food: 130, Gold: 95 }, trainTime: 36, age: 'castle' },
    { id: 1746, name: 'Elefante de asedio', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '1746.png', cost: { Food: 130, Gold: 95 }, trainTime: 36, age: 'imperial' },
    { id: 280, name: 'Manganel', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, cost: { Wood: 160, Gold: 135 }, trainTime: 46 },
    { id: 550, name: 'Onagro de asedio', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '550.png', cost: { Wood: 160, Gold: 135 }, trainTime: 46 },
    { id: 279, name: 'Escorpión', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, cost: { Wood: 75, Gold: 75 }, trainTime: 30 },
    { id: 542, name: 'Escorpión pesado', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, cost: { Wood: 75, Gold: 75 }, trainTime: 30 },
    { id: 36, name: 'Cañón de asedio', category: 'siege', unitClass: 'gunpowder', building: 'Taller de Asedio', bldIconId: 22, cost: { Wood: 225, Gold: 225 }, trainTime: 56 },
    { id: 1800, name: 'Trebuchet a tracción', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '428.png', cost: { Wood: 170, Gold: 100 }, trainTime: 35, age: 'castle' },
    { id: 1904, name: 'Carro cohete', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '1904.png', cost: { Wood: 135, Gold: 155 }, trainTime: 40 },
    { id: 1907, name: 'Carro cohete pesado', category: 'siege', unitClass: 'siege', building: 'Taller de Asedio', bldIconId: 22, icon: '1907.png', cost: { Wood: 135, Gold: 155 }, trainTime: 40 },

    // Centro Urbano (Town Center)
    { id: 83, name: 'Aldeano', category: 'town_center', unitClass: 'villager', building: 'Centro Urbano', bldIconId: 109, cost: { Food: 50 }, trainTime: 25 },

    // Castillo (Castle)
    { id: 440, name: 'Petardo', category: 'castle', unitClass: 'petard', building: 'Castillo', bldIconId: 7, cost: { Food: 65, Gold: 20 }, trainTime: 25 },
    { id: 331, name: 'Lanzapiedras (Trebuchet)', category: 'castle', unitClass: 'siege', building: 'Castillo', bldIconId: 7, icon: '29.png', cost: { Wood: 200, Gold: 200 }, trainTime: 50 }
  ];

  function getUnitServiceApi() {
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

  function getCivBuildingMeta(bld) {
    const b = String(bld || '').toLowerCase();
    if (b.includes('barracks') || b.includes('cuartel')) {
      return { category: 'barracks', building: 'Cuartel', bldIconId: 2, unitClass: 'infantry' };
    }
    if (b.includes('range') || b.includes('archery') || b.includes('galería') || b.includes('galeria')) {
      return { category: 'range', building: 'Galería de Tiro con Arco', bldIconId: 0, unitClass: 'foot_archer' };
    }
    if (b.includes('stable') || b.includes('establo')) {
      return { category: 'stable', building: 'Establo', bldIconId: 23, unitClass: 'cavalry' };
    }
    if (b.includes('siege') || b.includes('asedio') || b.includes('workshop')) {
      return { category: 'siege', building: 'Taller de Asedio', bldIconId: 22, unitClass: 'siege' };
    }
    if (b.includes('town_center') || b.includes('centro')) {
      return { category: 'town_center', building: 'Centro Urbano', bldIconId: 109, unitClass: 'villager' };
    }
    if (b.includes('donjon') || b.includes('torreón') || b.includes('torreon')) {
      return { category: 'castle', building: 'Torreón (Donjon)', bldIconId: 1665, unitClass: 'infantry' };
    }
    return { category: 'castle', building: 'Castillo', bldIconId: 7, unitClass: 'siege' };
  }

  function getAvailableUnitsForCiv(civId) {
    syncCanonicalUnitsWithService();
    const cId = String(civId || 'generic').toLowerCase();

    // Resolver módulo de disponibilidad de unidades
    const isAvailFn = (typeof availability !== 'undefined' && typeof availability.isUnitAvailableForCiv === 'function')
      ? availability.isUnitAvailableForCiv
      : (typeof window !== 'undefined' && window.availability && typeof window.availability.isUnitAvailableForCiv === 'function')
        ? window.availability.isUnitAvailableForCiv
        : (typeof require === 'function' ? (function () { try { return require('./availability.js').isUnitAvailableForCiv; } catch (e) { return null; } })() : null);

    // 1. Filtrar unidades canónicas universales vs regionales/específicas
    const baseFiltered = CANONICAL_UNITS.filter(u => {
      if (cId === 'generic') {
        // En genérico mostramos el árbol clásico excluyendo reemplazos regionales específicos
        if ([2550, 2588, 2552, 2554].includes(u.id)) return false; // Champi exclusivo de Sudamericanas
        if ([2569, 2571, 1901, 1903, 1904, 1907, 1920, 1944, 1946, 2582, 2584, 2700, 2701, 2703, 2704, 1744, 1746, 1800, 185].includes(u.id)) return false;
        return true;
      }
      if (isAvailFn) {
        return isAvailFn(cId, u.id);
      }
      return true;
    });

    const activeUnits = baseFiltered.map(u => ({ ...u }));
    const seenIds = new Set(activeUnits.map(u => u.id));

    // 2. Resolver dinámicamente las Unidades Únicas de la civilización activa
    let civData = null;
    if (cId !== 'generic') {
      if (typeof civilizationsModule !== 'undefined' && civilizationsModule.CIVILIZATIONS_DATA) {
        civData = civilizationsModule.CIVILIZATIONS_DATA[cId];
      } else if (typeof window !== 'undefined' && window.CIVILIZATIONS_DATA) {
        civData = window.CIVILIZATIONS_DATA[cId];
      } else if (typeof require === 'function') {
        try {
          const c = require('./civilizations.js');
          if (c && c.CIVILIZATIONS_DATA) civData = c.CIVILIZATIONS_DATA[cId];
        } catch (e) {}
      }
    }

    if (civData && Array.isArray(civData.uniqueUnits)) {
      const us = getUnitServiceApi();
      const classApi = (typeof window !== 'undefined' ? window.unitClassification : null) || (typeof require === 'function' ? (function () { try { return require('./unitClassification.js'); } catch (e) { return null; } })() : null);
      civData.uniqueUnits.forEach(uu => {
        const meta = getCivBuildingMeta(uu.building);
        const base = us ? us.getBaseUnitData(uu.id) : null;
        const resolvedClass = uu.unitClass || (classApi && classApi.isInfantry(uu.id) ? 'infantry' : (classApi && classApi.isCavalry(uu.id) ? 'cavalry' : (classApi && classApi.isFootArcher(uu.id) ? 'foot_archer' : meta.unitClass)));
        const unitEntry = {
          id: uu.id,
          name: uu.name,
          internalName: uu.internalName || uu.internal_name,
          category: meta.category,
          unitClass: resolvedClass,
          building: meta.building,
          bldIconId: meta.bldIconId,
          icon: uu.icon || (base && base.icon) || `${uu.id}.png`,
          cost: (base && base.Cost) ? { ...base.Cost } : (uu.cost ? { ...uu.cost } : { Food: 0, Wood: 0, Gold: 0, Stone: 0 }),
          trainTime: (base && base.trainTime) || uu.trainTime || 25,
          age: uu.age || 'castle'
        };

        if (seenIds.has(uu.id)) {
          const idx = activeUnits.findIndex(u => u.id === uu.id);
          if (idx !== -1) {
            activeUnits[idx] = { ...activeUnits[idx], ...unitEntry };
          }
        } else {
          seenIds.add(uu.id);
          activeUnits.push(unitEntry);
        }
      });
    }

    return activeUnits;
  }

  function syncCanonicalUnitsWithService() {
    const us = getUnitServiceApi();
    if (!us) return;
    for (let i = 0; i < CANONICAL_UNITS.length; i++) {
      const u = CANONICAL_UNITS[i];
      const base = us.getBaseUnitData(u.id);
      if (base) {
        u.cost = { ...base.Cost };
        u.trainTime = base.trainTime;
      }
    }
  }

  function getCanonicalUnit(unitId) {
    syncCanonicalUnitsWithService();
    // Normalizar ID del Trebuchet si se consulta como 42 (desempaquetado) al 331 canónico (Castillo)
    const effectiveId = (unitId === 42) ? 331 : unitId;
    const allCivUnits = getAvailableUnitsForCiv(state.civId);
    let defaultEntry = allCivUnits.find(u => u.id === effectiveId) || CANONICAL_UNITS.find(u => u.id === effectiveId);
    if (!defaultEntry && unitId === 42) {
      defaultEntry = allCivUnits.find(u => u.id === 331) || CANONICAL_UNITS.find(u => u.id === 331);
    }
    const us = getUnitServiceApi();
    if (us) {
      const base = us.getBaseUnitData(effectiveId);
      if (base) {
        const meta = base.building ? getCivBuildingMeta(base.building) : null;
        const resolvedName = (defaultEntry && defaultEntry.name) || base.name || `Unidad #${effectiveId}`;
        const resolvedIcon = (effectiveId === 331 || effectiveId === 42)
          ? '29.png'
          : (effectiveId === 1800 || effectiveId === 1942
            ? '428.png'
            : ((defaultEntry && defaultEntry.icon) || base.icon || `${effectiveId}.png`));

        return {
          ...(defaultEntry || {}),
          id: effectiveId,
          name: resolvedName,
          category: defaultEntry ? defaultEntry.category : (meta ? meta.category : 'general'),
          unitClass: defaultEntry ? defaultEntry.unitClass : (meta ? meta.unitClass : 'general'),
          building: defaultEntry ? defaultEntry.building : (meta ? meta.building : 'Edificio'),
          bldIconId: defaultEntry ? defaultEntry.bldIconId : (meta ? meta.bldIconId : 0),
          icon: resolvedIcon,
          cost: { ...base.Cost },
          Cost: { ...base.Cost },
          trainTime: base.trainTime,
          TrainTime: base.trainTime
        };
      }
    }
    return defaultEntry || CANONICAL_UNITS[0];
  }

  /**
   * Resuelve el sprite y fallback de icono para una unidad en la Calculadora Económica.
   * Trebuchet (#331 y #42): utiliza de forma estricta 331.png en img/units/ y 29.png en img/Unit/.
   * NUNCA debe enlazar a img/Unit/42.png (que corresponde al Mangudai).
   *
   * @param {Object|number} unitOrId
   * @returns {{ src: string, fallback: string }}
   */
  function getUnitIconProps(unitOrId) {
    const id = typeof unitOrId === 'object' && unitOrId !== null
      ? Number(unitOrId.id || unitOrId.ID || 0)
      : Number(unitOrId || 0);

    if (id === 42 || id === 331) {
      return {
        src: 'img/units/331.png',
        fallback: 'img/Unit/29.png'
      };
    }

    if (id === 1800 || id === 1942) {
      return {
        src: 'img/units/428.png',
        fallback: 'img/Unit/428.png'
      };
    }

    if (id === 1744) {
      return {
        src: 'img/units/1744.png',
        fallback: 'img/Unit/1744.png'
      };
    }

    if (id === 1746) {
      return {
        src: 'img/units/1746.png',
        fallback: 'img/Unit/1746.png'
      };
    }

    if (id === 185) {
      return {
        src: 'img/units/185.png',
        fallback: 'img/Unit/18.png'
      };
    }

    if (id === 882) {
      return {
        src: 'img/units/882.png',
        fallback: 'img/Unit/882.png'
      };
    }

    if (id === 1010) {
      return {
        src: 'img/units/1010.png',
        fallback: 'img/Unit/1010.png'
      };
    }

    if (id === 1012) {
      return {
        src: 'img/units/1012.png',
        fallback: 'img/Unit/1012.png'
      };
    }

    if (id === 1155) {
      return {
        src: 'img/units/1155.png',
        fallback: 'img/Unit/1155.png'
      };
    }

    let icon = null;
    if (typeof unitOrId === 'object' && unitOrId.icon) {
      icon = unitOrId.icon;
    } else {
      const us = getUnitServiceApi();
      if (us && typeof us.getBaseUnitData === 'function') {
        const base = us.getBaseUnitData(id);
        if (base && base.icon) icon = base.icon;
      }
    }
    if (!icon) icon = `${id}.png`;

    return {
      src: `img/units/${id}.png`,
      fallback: `img/Unit/${icon}`
    };
  }

  // Presets tácticos populares
  const PRESETS = {
    cross_castle: {
      name: '2 Galerías: Ballesteros (Castillo)',
      civ: 'britons',
      age: 'castle',
      techs: ['double_bit_axe', 'bow_saw', 'wheelbarrow'],
      queue: [{ id: 24, count: 2 }]
    },
    knights_castle: {
      name: '2 Establos: Jinetes (Castillo)',
      civ: 'franks',
      age: 'castle',
      techs: ['horse_collar', 'heavy_plow', 'double_bit_axe', 'wheelbarrow', 'gold_mining'],
      queue: [{ id: 38, count: 2 }]
    },
    scout_rush: {
      name: 'Scout Rush (1 Establo, Feudal)',
      civ: 'magyars',
      age: 'feudal',
      techs: ['horse_collar', 'double_bit_axe'],
      queue: [{ id: 448, count: 1 }]
    },
    trash_arbalest_imp: {
      name: '1 Cuartel Alabarderos + 2 Galerías Arbalesteros (Imp)',
      civ: 'generic',
      age: 'imperial',
      techs: ['horse_collar', 'heavy_plow', 'crop_rotation', 'double_bit_axe', 'bow_saw', 'two_man_saw', 'wheelbarrow', 'hand_cart', 'gold_mining', 'gold_shaft_mining'],
      queue: [{ id: 359, count: 1 }, { id: 492, count: 2 }]
    },
    eco_boom: {
      name: 'Boom Económico (3 Centros Urbanos)',
      civ: 'generic',
      age: 'castle',
      techs: ['horse_collar', 'heavy_plow', 'double_bit_axe', 'bow_saw', 'wheelbarrow'],
      queue: [{ id: 83, count: 3 }]
    }
  };

  // =========================================================================
  // ESTADO DEL MÓDULO
  // =========================================================================
  const state = {
    civId: 'generic',
    selectedAge: 'castle',
    activeEcoTechs: new Set(['horse_collar', 'double_bit_axe', 'wheelbarrow']),
    foodSource: 'farming',
    farmEfficiencyMode: 'realistic',
    queue: [
      { id: 24, count: 2 } // Por defecto: 2 Galerías Ballesteros
    ],
    showPickerModal: false,
    pickerFilter: 'all'
  };

  /**
   * Sincroniza mejoras automáticas y bloquea tecnologías según la edad
   */
  function syncAgeAndCivTechs() {
    const currentAgeRank = AGE_RANK[state.selectedAge] || 3;

    // Desactivar tecnologías que requieran una edad superior a la actual (estándar y pasturas)
    [...ECO_TECHS, ...PASTURE_ECO_TECHS].forEach(t => {
      const minRank = AGE_RANK[t.minAge] || 2;
      if (currentAgeRank < minRank) {
        state.activeEcoTechs.delete(t.key);
        if (t.altKey) state.activeEcoTechs.delete(t.altKey);
      }
    });

    // Activar tecnologías gratuitas por civ
    const engine = ratesEngine;
    if (engine && engine.CIV_ECO_MODIFIERS) {
      const civMod = engine.CIV_ECO_MODIFIERS[state.civId.toLowerCase()];
      if (civMod && civMod.freeTechs) {
        const age = state.selectedAge;
        const addTechs = (list) => {
          if (Array.isArray(list)) list.forEach(k => state.activeEcoTechs.add(k));
        };
        if (civMod.freeTechs.feudal && currentAgeRank >= AGE_RANK.feudal) addTechs(civMod.freeTechs.feudal);
        if (civMod.freeTechs.castle && currentAgeRank >= AGE_RANK.castle) addTechs(civMod.freeTechs.castle);
        if (civMod.freeTechs.imperial && currentAgeRank >= AGE_RANK.imperial) addTechs(civMod.freeTechs.imperial);
      }
    }

    // Vietnamitas: Leva gratis en Edad Imperial
    if (state.civId.toLowerCase() === 'vietnamese' && currentAgeRank >= AGE_RANK.imperial) {
      state.activeEcoTechs.add('conscription');
    }
  }

  /**
   * Inicializa la interfaz
   */
  function init(containerEl) {
    if (!containerEl) return;
    syncAgeAndCivTechs();
    render(containerEl);
  }

  /**
   * Renderizado reactivo principal
   */
  function render(containerEl) {
    const engine = ratesEngine || (typeof window !== 'undefined' ? window.ecoRates : null);
    if (!engine) {
      containerEl.innerHTML = '<div style="padding: 20px; color: red;">Error: Motor ecoRates.js no disponible.</div>';
      return;
    }

    const activeTechsArr = Array.from(state.activeEcoTechs);
    const currentAgeRank = AGE_RANK[state.selectedAge] || 3;

    // Cálculos individuales y acumulativos
    let totalFoodVills = 0;
    let totalWoodDirectVills = 0;
    let totalWoodReseedVills = 0;
    let totalGoldVills = 0;
    let totalStoneVills = 0;

    let totalDemandFood = 0;
    let totalDemandWood = 0;
    let totalDemandGold = 0;
    let totalDemandStone = 0;
    let totalShuSecondaryFood = 0;

    const queueCalculations = state.queue.map(item => {
      if (item.id === 42) item.id = 331;
      const unitObj = getCanonicalUnit(item.id);
      const prod = engine.calculateContinuousProduction({
        unit: unitObj,
        buildingsCount: item.count,
        civId: state.civId,
        age: state.selectedAge,
        activeEcoTechs: activeTechsArr,
        foodSource: state.foodSource,
        farmEfficiencyMode: state.farmEfficiencyMode
      });

      totalFoodVills += prod.villagers.food;
      totalWoodDirectVills += prod.villagers.woodDirect;
      totalGoldVills += prod.villagers.gold;
      totalStoneVills += prod.villagers.stone;

      totalDemandFood += prod.demandPerMin.food;
      totalDemandWood += prod.demandPerMin.wood;
      totalDemandGold += prod.demandPerMin.gold;
      totalDemandStone += prod.demandPerMin.stone;
      totalShuSecondaryFood += (prod.shuSecondaryFoodPerMin || 0);

      return { item, unit: unitObj, prod };
    });

    // Métrica 1: Sobrecoste de Resiembra de Granjas
    const farmMetrics = engine.getFarmMetrics(state.civId, activeTechsArr);
    const gatherRates = engine.getGatherRates(state.civId, activeTechsArr, {
      foodSource: state.foodSource,
      farmEfficiencyMode: state.farmEfficiencyMode
    });

    let farmOverhead = null;
    if (totalFoodVills > 0 && state.foodSource === 'farming') {
      farmOverhead = engine.calculateFarmOverhead(
        totalFoodVills,
        gatherRates.food,
        farmMetrics,
        gatherRates.wood
      );
      totalWoodReseedVills = farmOverhead.reseedLumberjacks;
    }

    const totalWoodVills = totalWoodDirectVills + totalWoodReseedVills;
    const grandTotalVills = totalFoodVills + totalWoodVills + totalGoldVills + totalStoneVills;

    const isKhitanPastures = state.civId === 'khitans' && state.foodSource === 'farming';
    const foodWorkerLabel = {
      farming: isKhitanPastures ? '1 Pastor Khitan:' : '1 Granjero:',
      sheep: '1 Pastor:',
      foraging: '1 Recolector:',
      hunting: '1 Cazador:',
      shore_fish: '1 Pescador:'
    }[state.foodSource] || '1 Granjero:';

    const foodWorkerNoun = {
      farming: isKhitanPastures ? 'Pastores Khitan' : 'Granjeros',
      sheep: 'Pastores',
      foraging: 'Recolectores',
      hunting: 'Cazadores',
      shore_fish: 'Pescadores'
    }[state.foodSource] || 'Granjeros';

    // Generar marcado HTML
    containerEl.innerHTML = `
      <div class="eco-container">
        <!-- Tablero de Encabezado y Filtros -->
        <div class="eco-header-board">
          <div class="eco-header-top">
            <div class="eco-title-group">
              <h2 class="eco-main-title">
                <img src="img/Resource/gold.png" class="res-icon-lg" alt="" onerror="this.src='img/gold.png';" />
                CALCULADORA ECONÓMICA DE PRODUCCIÓN CONTINUA
              </h2>
              <p class="eco-sub-title">
                Simulación macroeconómica de ratios de recolección en tiempo real, sobrecoste de resiembra de granjas y tiempo de trabajo de aldeano (VT).
              </p>
            </div>
            <button id="eco-back-btn" class="wood-btn" style="padding: 6px 14px; font-size: 0.85rem;">
              ❮ Volver al Menú
            </button>
          </div>

          <!-- MONITOR TELEMETRÍA (HUD): RATIOS POR 1 SOLO ALDEANO EN TIEMPO REAL -->
          <div class="eco-rates-hud">
            <div class="rate-pill">
              <img src="img/Resource/food.png" class="res-icon" alt="Alimento" onerror="this.src='img/food.png';" />
              <span>${foodWorkerLabel}</span>
              <strong id="hud-rate-food">${gatherRates.food}</strong> <small>alim/min</small>
            </div>
            <div class="rate-pill">
              <img src="img/Resource/wood.png" class="res-icon" alt="Madera" onerror="this.src='img/wood.png';" />
              <span>1 Leñador:</span>
              <strong id="hud-rate-wood">${gatherRates.wood}</strong> <small>mad/min</small>
            </div>
            <div class="rate-pill">
              <img src="img/Resource/gold.png" class="res-icon" alt="Oro" onerror="this.src='img/gold.png';" />
              <span>1 Minero Oro:</span>
              <strong id="hud-rate-gold">${gatherRates.gold}</strong> <small>oro/min</small>
            </div>
            <div class="rate-pill">
              <img src="img/Resource/stone.png" class="res-icon" alt="Piedra" onerror="this.src='img/stone.png';" />
              <span>1 Cantero:</span>
              <strong id="hud-rate-stone">${gatherRates.stone}</strong> <small>pie/min</small>
            </div>
          </div>

          <!-- Barra de Parámetros Globales (Civ, Edad, Granjas) -->
          <div class="eco-controls-bar">
            <!-- Selector de Civilización (56 civs) -->
            <div class="eco-control-group">
              <label class="eco-control-label" for="eco-civ-select">Civilización:</label>
              <select id="eco-civ-select" class="eco-select">
                <option value="generic" ${state.civId === 'generic' ? 'selected' : ''}>Genérico (Sin bonos)</option>
                ${CIVS_56.map(c => `<option value="${c.id}" ${state.civId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <!-- Selector de Edad -->
            <div class="eco-control-group">
              <label class="eco-control-label" for="eco-age-select">Edad:</label>
              <select id="eco-age-select" class="eco-select">
                <option value="dark" ${state.selectedAge === 'dark' ? 'selected' : ''}>Alta Edad Media</option>
                <option value="feudal" ${state.selectedAge === 'feudal' ? 'selected' : ''}>Edad Feudal</option>
                <option value="castle" ${state.selectedAge === 'castle' ? 'selected' : ''}>Edad de los Castillos</option>
                <option value="imperial" ${state.selectedAge === 'imperial' ? 'selected' : ''}>Edad Imperial</option>
              </select>
            </div>

            <!-- Selector de Fuente de Alimento -->
            <div class="eco-control-group">
              <label class="eco-control-label" for="eco-food-source-select">Alimento:</label>
              <select id="eco-food-source-select" class="eco-select">
                <option value="farming" ${state.foodSource === 'farming' ? 'selected' : ''}>Granjas / Pasturas</option>
                <option value="sheep" ${state.foodSource === 'sheep' ? 'selected' : ''}>Pastoreo (Ovejas)</option>
                <option value="foraging" ${state.foodSource === 'foraging' ? 'selected' : ''}>Recolección (Bayas)</option>
                <option value="hunting" ${state.foodSource === 'hunting' ? 'selected' : ''}>Caza (Jabalí / Ciervos)</option>
                <option value="shore_fish" ${state.foodSource === 'shore_fish' ? 'selected' : ''}>Pesca de Costa</option>
              </select>
            </div>

            <!-- Modo de Eficiencia de Granjas -->
            ${state.foodSource === 'farming' ? `
              <div class="eco-control-group">
                <label class="eco-control-label" for="eco-farm-mode-select">Eficiencia Granja:</label>
                <select id="eco-farm-mode-select" class="eco-select">
                  <option value="realistic" ${state.farmEfficiencyMode === 'realistic' ? 'selected' : ''}>Promedio Realista (50/50)</option>
                  <option value="ideal" ${state.farmEfficiencyMode === 'ideal' ? 'selected' : ''}>Ideal (1.er Anillo - 8 granjas)</option>
                  <option value="ring2" ${state.farmEfficiencyMode === 'ring2' ? 'selected' : ''}>2.º Anillo (Segunda capa)</option>
                </select>
              </div>
            ` : ''}

            <!-- Aviso contextual de bonificación -->
            ${renderCivNotice(state.civId, gatherRates)}
          </div>

          <!-- REDISEÑO: BOTONERA DE CASILLAS DE TECNOLOGÍAS ECONÓMICAS (44x44px) -->
          <div class="eco-techs-section">
            <div class="eco-techs-title-bar">
              <span class="eco-techs-title">Tecnologías Económicas Investigadas:</span>
              <span style="font-size: 0.74rem; color: #a49170;">Haz clic en una casilla para investigar o desactivar mejoras</span>
            </div>

            <div class="eco-techs-categories-grid">
              ${renderTechClusters(currentAgeRank)}
            </div>
          </div>

          <!-- Barra de Presets Rápidos -->
          <div class="eco-presets-bar">
            <span style="font-size: 0.78rem; color: #b59d78; font-weight: 600;">Composiciones Rápidas:</span>
            ${Object.entries(PRESETS).map(([k, p]) => `
              <button class="eco-preset-btn" data-preset="${k}">${p.name}</button>
            `).join('')}
            <button id="eco-clear-btn" class="eco-preset-btn" style="border-color: #8a3b2e; color: #ff9e9e;">
              Limpiar
            </button>
          </div>
        </div>

        <!-- Disposición Principal de 2 Columnas -->
        <div class="eco-main-layout">
          <!-- Columna Izquierda: Cola de Unidades y VT -->
          <div class="eco-queue-panel">
            <div class="eco-panel-title">
              <span>Producción Militar Continua</span>
              <button id="eco-open-picker-btn" class="eco-add-btn">
                <span style="font-weight: bold; font-size: 1.1rem; line-height: 1;">+</span> Añadir Unidad
              </button>
            </div>

            <div class="eco-queue-list">
              ${queueCalculations.length === 0 ? `
                <div style="padding: 30px; text-align: center; color: #8e7a5c; font-style: italic;">
                  No hay unidades en producción. Haz clic en "Añadir Unidad" o elige una composición rápida superior.
                </div>
              ` : queueCalculations.map(({ item, unit, prod }) => `
                <div class="eco-unit-row" data-unit-id="${unit.id}">
                  <div class="eco-unit-top-line">
                    <div class="eco-unit-identity">
                      <div class="eco-unit-icon-frame">
                        <img src="${getUnitIconProps(unit.id).src}" alt="${unit.name}" onerror="this.src='${getUnitIconProps(unit.id).fallback}'; this.onerror=null;">
                      </div>
                      <div class="eco-unit-name-box">
                        <span class="eco-unit-name">
                          ${unit.name}
                          ${prod.isDiscounted ? `<span class="eco-discount-tag">Descuento aplicado</span>` : ''}
                        </span>
                        <span class="eco-unit-bld-tag">
                          <img src="img/Building/${unit.bldIconId}.png" class="res-icon-xs" alt="" onerror="this.style.display='none';" />
                          ${unit.building} • ${prod.effectiveTrainTime || prod.trainTime}s creación${prod.workRate > 1.0 ? ` <small style="opacity: 0.75;">(base ${prod.baseTrainTime}s)</small>` : ''}
                        </span>
                      </div>
                    </div>

                    <!-- Stepper de Edificios de Producción -->
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div class="eco-stepper-box">
                        <button class="eco-step-btn btn-dec" data-id="${unit.id}">-</button>
                        <span class="eco-step-val">${item.count}</span>
                        <button class="eco-step-btn btn-inc" data-id="${unit.id}">+</button>
                        <span class="eco-step-label">${unit.building}</span>
                      </div>
                      <button class="eco-remove-btn" data-id="${unit.id}" title="Eliminar de producción">✕</button>
                    </div>
                  </div>

                  <!-- Métricas de Coste y TIEMPO DE TRABAJO DE ALDEANO (VT) -->
                  <div class="eco-unit-metrics-bar">
                    <div class="eco-costs-group">
                      ${renderCostPills(prod.effectiveCostInfo)}
                    </div>

                    <!-- Métrica Canónica: Villager Work Time (VT) -->
                    <div class="eco-vt-metric-badge" title="Tiempo de trabajo recolector neto necesario para costear 1 unidad frente al ciclo de 25s de un aldeano.">
                      <img src="img/Resource/villager.png" class="res-icon" alt="" onerror="this.src='img/Unit/83.png';" />
                      <span class="vt-label">VT:</span>
                      <span>${prod.vtMetrics.totalSeconds}s</span>
                      <span class="vt-cycles">${prod.vtMetrics.villagerCycles}x Aldeano (25s)</span>
                    </div>

                    <div style="font-size: 0.78rem; color: #a49170; display: flex; align-items: center; gap: 6px;">
                      ${prod.workRate > 1.0 ? `
                        <span class="eco-workrate-badge" title="${(prod.workRateBreakdown || []).join(' • ')}">
                          ⚡ +${Math.round((prod.workRate - 1) * 100)}% veloc.
                        </span>
                      ` : ''}
                      <span>${prod.unitsPerMinute} u/min</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Columna Derecha: Dashboard Macroeconómico con FÓRMULAS ARITMÉTICAS VISIBLES -->
          <div class="eco-results-panel">
            <!-- Tarjeta Total de Aldeanos Requeridos -->
            <div class="eco-total-vills-card">
              <div class="eco-total-vills-label">
                <img src="img/Resource/villager.png" class="res-icon" alt="" onerror="this.src='img/Unit/83.png';" />
                Aldeanos Requeridos en Producción
              </div>
              <div class="eco-total-vills-number">${Math.ceil(grandTotalVills)}</div>
              <div class="eco-total-vills-sub">
                ${Math.round(grandTotalVills * 10) / 10} aldeanos netos calculados
              </div>
            </div>

            <!-- Desglose por Recurso con FÓRMULA EXPLÍCITA: (Demanda / Ratio = Aldeanos) -->
            <div class="eco-resource-breakdown">
              <!-- Alimento -->
              <div class="eco-res-card food">
                <div class="eco-res-header">
                  <span class="eco-res-name">
                    <img src="img/Resource/food.png" class="res-icon" alt="Alimento" onerror="this.src='img/food.png';" />
                    Alimento
                  </span>
                  <span class="eco-res-vills">${Math.ceil(totalFoodVills)}</span>
                </div>
                <!-- Fórmula Aritmética Visible -->
                <div class="eco-arithmetic-formula">
                  <span class="math-fraction">
                    <span class="math-num">${Math.round(totalDemandFood)} alim/min</span>
                    <span class="math-denom">${gatherRates.food} alim/min/ald</span>
                  </span>
                  <span class="math-equals">=</span>
                  <span class="math-result">
                    ${gatherRates.food > 0 ? (totalDemandFood / gatherRates.food).toFixed(1) : 0} &rarr; <strong>${Math.ceil(totalFoodVills)} ${foodWorkerNoun}</strong>
                  </span>
                </div>
                ${totalShuSecondaryFood > 0 ? `
                  <div style="color: #8bc34a; font-size: 0.72rem; margin-top: 2px;">
                    +${Math.round(totalShuSecondaryFood)} alim/min generada por leñadores Shu
                  </div>
                ` : ''}
              </div>

              <!-- Madera (Directa + Resiembra) -->
              <div class="eco-res-card wood">
                <div class="eco-res-header">
                  <span class="eco-res-name">
                    <img src="img/Resource/wood.png" class="res-icon" alt="Madera" onerror="this.src='img/wood.png';" />
                    Madera Total
                  </span>
                  <span class="eco-res-vills">${Math.ceil(totalWoodVills)}</span>
                </div>
                <!-- Fórmula Aritmética Visible Madera Directa -->
                <div class="eco-arithmetic-formula">
                  <span class="math-fraction">
                    <span class="math-num">${Math.round(totalDemandWood)} mad/min</span>
                    <span class="math-denom">${gatherRates.wood} mad/min/ald</span>
                  </span>
                  <span class="math-equals">=</span>
                  <span class="math-result">
                    ${gatherRates.wood > 0 ? (totalDemandWood / gatherRates.wood).toFixed(1) : 0} &rarr; <strong>${Math.ceil(totalWoodDirectVills)} directos</strong>
                  </span>
                </div>
                <!-- Resiembra si aplica -->
                ${totalWoodReseedVills > 0 ? `
                  <div class="eco-arithmetic-formula" style="border-left: 2px solid #ff9800; margin-top: 2px;">
                    <span style="color: #ffb74d;">+ Resiembra:</span>
                    <span class="math-fraction">
                      <span class="math-num">${farmOverhead.totalWoodDemandPerMin} mad/min</span>
                      <span class="math-denom">${gatherRates.wood} mad/min/ald</span>
                    </span>
                    <span class="math-equals">=</span>
                    <span class="math-result">
                      ${(farmOverhead.totalWoodDemandPerMin / gatherRates.wood).toFixed(1)} &rarr; <strong>${totalWoodReseedVills} resiembra</strong>
                    </span>
                  </div>
                ` : ''}
              </div>

              <!-- Oro -->
              <div class="eco-res-card gold">
                <div class="eco-res-header">
                  <span class="eco-res-name">
                    <img src="img/Resource/gold.png" class="res-icon" alt="Oro" onerror="this.src='img/gold.png';" />
                    Oro
                  </span>
                  <span class="eco-res-vills">${Math.ceil(totalGoldVills)}</span>
                </div>
                <!-- Fórmula Aritmética Visible Oro -->
                <div class="eco-arithmetic-formula">
                  <span class="math-fraction">
                    <span class="math-num">${Math.round(totalDemandGold)} oro/min</span>
                    <span class="math-denom">${gatherRates.gold} oro/min/ald</span>
                  </span>
                  <span class="math-equals">=</span>
                  <span class="math-result">
                    ${gatherRates.gold > 0 ? (totalDemandGold / gatherRates.gold).toFixed(1) : 0} &rarr; <strong>${Math.ceil(totalGoldVills)} Mineros</strong>
                  </span>
                </div>
              </div>

              <!-- Piedra -->
              <div class="eco-res-card stone">
                <div class="eco-res-header">
                  <span class="eco-res-name">
                    <img src="img/Resource/stone.png" class="res-icon" alt="Piedra" onerror="this.src='img/stone.png';" />
                    Piedra
                  </span>
                  <span class="eco-res-vills">${Math.ceil(totalStoneVills)}</span>
                </div>
                <!-- Fórmula Aritmética Visible Piedra -->
                <div class="eco-arithmetic-formula">
                  <span class="math-fraction">
                    <span class="math-num">${Math.round(totalDemandStone)} pie/min</span>
                    <span class="math-denom">${gatherRates.stone} pie/min/ald</span>
                  </span>
                  <span class="math-equals">=</span>
                  <span class="math-result">
                    ${gatherRates.stone > 0 ? (totalDemandStone / gatherRates.stone).toFixed(1) : 0} &rarr; <strong>${Math.ceil(totalStoneVills)} Canteros</strong>
                  </span>
                </div>
              </div>
            </div>

            <!-- Métrica Canónica: SOBRECOSTE DE RESIEMBRA DE GRANJAS -->
            ${renderFarmOverheadCard(farmOverhead, totalFoodVills, totalWoodDirectVills, totalWoodReseedVills, state.civId)}
          </div>
        </div>

        <!-- Modal Picker de Selección de Unidades -->
        ${state.showPickerModal ? renderUnitPickerModal() : ''}
      </div>
    `;

    // Asignar listeners interactivos
    attachEventListeners(containerEl);
  }

  /**
   * Renderiza los grupos de tecnologías en casillas cuadradas de 44x44px.
   * Si la civilización es Khitans, sustituye dinámicamente las mejoras de Granjas
   * (Collar, Arado, Rotación) por las mejoras de Pasturas (Domesticación, Pastoreo, Trashumancia).
   */
  function renderTechClusters(currentAgeRank) {
    const isPastures = state.civId.toLowerCase() === 'khitans';
    const clusters = [
      isPastures ? 'Pasturas' : 'Granjas',
      'Madera',
      'Minería',
      'Logística',
      'Militar'
    ];

    return clusters.map(cat => {
      const techsInCat = (cat === 'Pasturas')
        ? PASTURE_ECO_TECHS
        : ECO_TECHS.filter(t => t.cluster === cat);

      return `
        <div class="eco-tech-cat-cluster">
          <span class="eco-cat-label">${cat}:</span>
          ${techsInCat.map(t => {
            const minRank = AGE_RANK[t.minAge] || 2;
            const isLocked = currentAgeRank < minRank;
            const isActive = !isLocked && (state.activeEcoTechs.has(t.key) || (t.altKey && state.activeEcoTechs.has(t.altKey)));
            const statusClass = isLocked ? 'locked' : (isActive ? 'active' : 'inactive');

            const tooltip = `${t.name} (${t.ageName})\n${t.desc}${isLocked ? ' • [Bloqueada por edad]' : ''}`;
            const iconSrc = t.icon || `img/Tech/${t.picIndex}.png`;
            const fallbackSrc = `img/Tech/${t.picIndex}.png`;

            return `
              <div class="eco-tech-tile ${statusClass}" data-tech-key="${t.key}" data-alt-key="${t.altKey || ''}" data-tech-id="${t.techId}" title="${tooltip}">
                <img src="${iconSrc}" alt="${t.name}" onerror="this.onerror=null; this.src='${fallbackSrc}';" />
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  }

  /**
   * Renderiza las píldoras de coste mostrando tachado el valor original si hay descuento
   */
  function renderCostPills(costInfo) {
    if (!costInfo) return '';
    const { cost, baseCost, isDiscounted } = costInfo;
    const parts = [];

    const formatPill = (type, resName, curVal, baseVal) => {
      if (!curVal && !baseVal) return '';
      const hasDiscount = isDiscounted && curVal < baseVal;
      return `
        <span class="eco-cost-pill ${type}">
          <img src="img/Resource/${type}.png" class="res-icon" alt="${resName}" onerror="this.src='img/${type}.png';" />
          ${hasDiscount ? `<del class="base-cost">${baseVal}</del>` : ''}
          <span>${curVal}</span>
        </span>
      `;
    };

    if (cost.food || baseCost.food) parts.push(formatPill('food', 'Alimento', cost.food, baseCost.food));
    if (cost.wood || baseCost.wood) parts.push(formatPill('wood', 'Madera', cost.wood, baseCost.wood));
    if (cost.gold || baseCost.gold) parts.push(formatPill('gold', 'Oro', cost.gold, baseCost.gold));
    if (cost.stone || baseCost.stone) parts.push(formatPill('stone', 'Piedra', cost.stone, baseCost.stone));

    return parts.join('');
  }

  /**
   * Renderiza la tarjeta de Sobrecoste de Resiembra de Granjas
   */
  function renderFarmOverheadCard(overhead, foodVills, woodDirect, woodReseed, civId) {
    const isKhitansCiv = civId.toLowerCase() === 'khitans';
    if (!overhead || foodVills === 0) {
      return `
        <div class="eco-farm-overhead-card" style="opacity: 0.6;">
          <div class="eco-farm-overhead-header">
            <span class="eco-farm-overhead-title">
              <img src="img/Resource/food.png" class="res-icon" alt="" onerror="this.src='img/food.png';" />
              ${isKhitansCiv ? 'Sobrecoste de Resiembra de Pasturas' : 'Sobrecoste de Resiembra de Granjas'}
            </span>
            <span style="font-size: 0.78rem; color: #888;">${isKhitansCiv ? 'Sin pastores activos' : 'Sin granjeros activos'}</span>
          </div>
          <div style="font-size: 0.8rem; color: #a49170; font-style: italic;">
            Asigna unidades que consuman alimento para calcular el gasto de madera en resiembra.
          </div>
        </div>
      `;
    }

    const { farmCapacity, farmCost, farmLifespanMin, woodDemandPerFarmerPerMin, totalWoodDemandPerMin, reseedLumberjacks, usesPastures } = overhead;

    const totalWoodLumberjacks = woodDirect + reseedLumberjacks;
    const directPct = totalWoodLumberjacks > 0 ? Math.round((woodDirect / totalWoodLumberjacks) * 100) : 0;
    const reseedPct = 100 - directPct;

    const isTeutons = civId.toLowerCase() === 'teutons';
    const isSicilians = civId.toLowerCase() === 'sicilians';
    const isMayans = civId.toLowerCase() === 'mayans';
    const isKhitans = usesPastures || isKhitansCiv;

    const cardTitle = isKhitans ? 'Sobrecoste de Resiembra de Pasturas' : 'Sobrecoste de Resiembra de Granjas';
    const capLabel = isKhitans ? 'Capacidad de Pastura (F_cap):' : 'Capacidad de Granja (F_cap):';
    const costLabel = isKhitans ? 'Coste por Pastura (C_pasture):' : 'Coste por Granja (C_farm):';
    const wearLabel = isKhitans ? 'Desgaste por Pastor:' : 'Desgaste por Granjero:';
    const capBonusText = isKhitans ? '(Pastura Khitan)' : isMayans ? '(+15% Maya)' : isSicilians ? '(+125% Siciliano)' : '';

    return `
      <div class="eco-farm-overhead-card" ${isKhitans ? 'style="border-color: #8bc34a;"' : ''}>
        <div class="eco-farm-overhead-header">
          <span class="eco-farm-overhead-title">
            <img src="img/Resource/wood.png" class="res-icon" alt="" onerror="this.src='img/wood.png';" />
            ${cardTitle}
          </span>
          <span class="eco-reseed-badge">+${reseedLumberjacks} Leñadores</span>
        </div>

        <div class="eco-overhead-stats-grid">
          <div class="eco-stat-item">
            <span class="stat-lbl">${capLabel}</span>
            <span class="stat-val highlight">
              ${farmCapacity} Alimento ${capBonusText}
            </span>
          </div>

          <div class="eco-stat-item">
            <span class="stat-lbl">${costLabel}</span>
            <span class="stat-val">${farmCost} Madera ${isTeutons ? '(-40% Teutón)' : ''}</span>
          </div>

          <div class="eco-stat-item">
            <span class="stat-lbl">${isKhitans ? 'Vida Útil (T_pasture):' : 'Vida Útil (T_farm):'}</span>
            <span class="stat-val">${farmLifespanMin} min ${isKhitans ? '<small style="display:block; color:#8bc34a; font-size:0.71rem;">(Extracción doble: 2 pastores/parcela)</small>' : ''}</span>
          </div>

          <div class="eco-stat-item">
            <span class="stat-lbl">${wearLabel}</span>
            <span class="stat-val">${woodDemandPerFarmerPerMin} mad/min</span>
          </div>

          ${isKhitans ? `
            <div class="eco-stat-item">
              <span class="stat-lbl">Parcelas Activas:</span>
              <span class="stat-val highlight">${overhead.activePlots ?? (Math.round((foodVills / 2) * 10) / 10)} <small>(${overhead.ceilActivePlots ?? Math.ceil(foodVills / 2)} parcelas)</small></span>
            </div>
          ` : ''}
        </div>

        <!-- Barra de distribución de madera: Directa vs Resiembra -->
        <div class="eco-wood-reseed-split">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem;">
            <span>Madera Unidades: ${Math.round(woodDirect * 10) / 10} (${directPct}%)</span>
            <span style="color: #ffb74d;">Resiembra: ${reseedLumberjacks} ald (${reseedPct}%)</span>
          </div>
          <div class="eco-split-bar">
            <div class="eco-split-fill-direct" style="width: ${directPct}%;"></div>
            <div class="eco-split-fill-reseed" style="width: ${reseedPct}%;"></div>
          </div>
          <div style="font-size: 0.73rem; color: #a49170;">
            Gasto total en resiembra: <strong>${totalWoodDemandPerMin} madera/min</strong>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el modal picker de unidades
   */
  function renderUnitPickerModal() {
    syncCanonicalUnitsWithService();
    const filter = state.pickerFilter || 'all';
    const allCivUnits = getAvailableUnitsForCiv(state.civId);
    const filteredUnits = filter === 'all'
      ? allCivUnits
      : allCivUnits.filter(u => u.category === filter);

    return `
      <div class="eco-picker-modal" id="eco-picker-modal-backdrop">
        <div class="eco-picker-content">
          <div class="eco-picker-header">
            <h3>Seleccionar Unidad para Producción Continua</h3>
            <button id="eco-picker-close-btn" class="eco-remove-btn" style="font-size: 1.4rem;">✕</button>
          </div>

          <!-- Pestañas de filtrado por edificio militar -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 16px; background: rgba(0,0,0,0.3); border-bottom: 1px solid #5a3d1c;">
            <button class="eco-preset-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
            <button class="eco-preset-btn ${filter === 'barracks' ? 'active' : ''}" data-filter="barracks">Cuartel</button>
            <button class="eco-preset-btn ${filter === 'range' ? 'active' : ''}" data-filter="range">Galería</button>
            <button class="eco-preset-btn ${filter === 'stable' ? 'active' : ''}" data-filter="stable">Establo</button>
            <button class="eco-preset-btn ${filter === 'siege' ? 'active' : ''}" data-filter="siege">Asedio</button>
            <button class="eco-preset-btn ${filter === 'castle' ? 'active' : ''}" data-filter="castle">Castillo</button>
            <button class="eco-preset-btn ${filter === 'town_center' ? 'active' : ''}" data-filter="town_center">Centro Urbano</button>
          </div>

          <div class="eco-picker-grid">
            ${filteredUnits.map(u => `
              <div class="eco-picker-card" data-picker-id="${u.id}">
                <img src="${getUnitIconProps(u).src}" alt="${u.name}" onerror="this.src='${getUnitIconProps(u).fallback}'; this.onerror=null;">
                <span>${u.name}</span>
                <span style="font-size: 0.72rem; color: #b59d78;">${u.building}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Aviso contextual según la civilización activa
   */
  function renderCivNotice(civId, gatherRates) {
    const c = String(civId || '').toLowerCase();
    let text = '';
    if (c === 'khmer') text = 'Jemeres: Granjas sin pérdida por trayecto (Tasa ideal 100%).';
    else if (c === 'khitans') text = 'Khitanes: Usan Pasturas (Coste 110 madera, reserva base 345 alimento, +115/+230/+345 por mejora, 2 pastores por parcela).';
    else if (c === 'shu') text = 'Shu: Leñadores generan +15% de alimento secundario.';
    else if (c === 'teutons') text = 'Teutones: Granjas cuestan solo 36 de madera (-40%).';
    else if (c === 'sicilians') text = 'Sicilianos: Mejoras de granja rinden +125% adicional (+169, +281, +394).';
    else if (c === 'slavs') text = 'Eslavos: Granjas trabajan un +15% más rápido.';
    else if (c === 'romans') text = 'Romanos: Aldeanos recolectan un +5% más rápido en todas las tareas.';
    else if (c === 'danes') text = 'Daneses: Aldeanos entregan un +5% más de alimento depositado.';
    else if (c === 'aztecs') text = 'Aztecas: Aldeanos transportan +3 recursos (+6.5% granjas, +5.5% madera/oro/piedra, +6% caza/bayas).';
    else if (c === 'celts') text = 'Celtas: Leñadores trabajan +15% más rápido.';
    else if (c === 'franks') text = 'Francos: Mejoras de granja gratis y bayas +15%.';
    else if (c === 'vikings') text = 'Vikingos: Carretilla y Carro de mano gratuitos.';
    else if (c === 'burmese') text = 'Birmanos: Mejoras de maderero gratuitas.';
    else if (c === 'bohemians') text = 'Bohemios: Tecnologías de minería gratuitas.';
    else if (c === 'turks') text = 'Turcos: Mineros de oro trabajan +25% más rápido.';
    else if (c === 'koreans') text = 'Coreanos: Mineros de piedra trabajan +20% más rápido.';
    else if (c === 'mayans') text = 'Mayas: Recursos duran +15% y arqueros con descuento.';
    else if (c === 'goths') text = 'Godos: Infantería con descuento progresivo.';
    else if (c === 'byzantines') text = 'Bizantinos: Camellos, guerrilleros y lanceros -25%.';
    else if (c === 'portuguese') text = 'Portugueses: Todas las unidades cuestan -20% de oro.';
    else if (c === 'hindustanis') text = 'Hindustaníes: Aldeanos con descuento progresivo.';
    else if (c === 'incas') text = 'Incas: Unidades militares cuestan -15% / -20% / -25% / -30% de alimento según la edad; usan Asentamientos.';
    else if (c === 'muisca') text = 'Muiscas: Honderos se entrenan +50% más rápido (Huaracas); usan Asentamientos.';
    else if (c === 'tupi') text = 'Tupíes: Infantería Ibirapema veloz; usan Asentamientos.';

    if (!text) return '';
    return `<div style="font-size: 0.8rem; color: #ffd875; background: rgba(212, 175, 55, 0.12); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.3);">${text}</div>`;
  }

  /**
   * Enlaza todos los listeners interactivos
   */
  function attachEventListeners(containerEl) {
    // 1. Volver al menú
    const backBtn = containerEl.querySelector('#eco-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined' && typeof window.navigateToView === 'function') {
          window.navigateToView('main-menu');
        } else {
          const mainMenuView = document.getElementById('main-menu-view');
          const ecoView = document.getElementById('eco-view');
          if (ecoView) ecoView.classList.remove('active');
          if (mainMenuView) mainMenuView.classList.add('active');
        }
      });
    }

    // 2. Cambio de Civilización
    const civSelect = containerEl.querySelector('#eco-civ-select');
    if (civSelect) {
      civSelect.addEventListener('change', (e) => {
        state.civId = e.target.value;
        syncAgeAndCivTechs();
        render(containerEl);
      });
    }

    // 3. Cambio de Edad
    const ageSelect = containerEl.querySelector('#eco-age-select');
    if (ageSelect) {
      ageSelect.addEventListener('change', (e) => {
        state.selectedAge = e.target.value;
        syncAgeAndCivTechs();
        render(containerEl);
      });
    }

    // 4. Cambio de Fuente de Alimento
    const foodSourceSelect = containerEl.querySelector('#eco-food-source-select');
    if (foodSourceSelect) {
      foodSourceSelect.addEventListener('change', (e) => {
        state.foodSource = e.target.value;
        render(containerEl);
      });
    }

    // 5. Cambio de Modo de Eficiencia de Granjas
    const farmModeSelect = containerEl.querySelector('#eco-farm-mode-select');
    if (farmModeSelect) {
      farmModeSelect.addEventListener('change', (e) => {
        state.farmEfficiencyMode = e.target.value;
        render(containerEl);
      });
    }

    // 6. Clic en Casillas de Tecnologías Económicas (44x44px)
    containerEl.querySelectorAll('.eco-tech-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        if (tile.classList.contains('locked')) {
          return; // No editable si está bloqueada por edad
        }
        const key = tile.dataset.techKey;
        const altKey = tile.dataset.altKey;
        const isCurrentlyActive = state.activeEcoTechs.has(key) || (altKey && state.activeEcoTechs.has(altKey));
        if (isCurrentlyActive) {
          state.activeEcoTechs.delete(key);
          if (altKey) state.activeEcoTechs.delete(altKey);
        } else {
          state.activeEcoTechs.add(key);
          if (altKey) state.activeEcoTechs.add(altKey);
        }
        render(containerEl);
      });
    });

    // 7. Presets Rápidos
    containerEl.querySelectorAll('.eco-preset-btn[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        const p = PRESETS[presetKey];
        if (!p) return;

        state.civId = p.civ || 'generic';
        state.selectedAge = p.age || 'castle';
        state.activeEcoTechs = new Set(p.techs || []);
        state.queue = JSON.parse(JSON.stringify(p.queue || []));
        syncAgeAndCivTechs();
        render(containerEl);
      });
    });

    // 8. Limpiar cola
    const clearBtn = containerEl.querySelector('#eco-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.queue = [];
        render(containerEl);
      });
    }

    // 9. Modificación de Steppers (+ / -)
    containerEl.querySelectorAll('.eco-step-btn.btn-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const item = state.queue.find(q => q.id === id);
        if (item) {
          item.count++;
          render(containerEl);
        }
      });
    });

    containerEl.querySelectorAll('.eco-step-btn.btn-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const item = state.queue.find(q => q.id === id);
        if (item) {
          if (item.count > 1) {
            item.count--;
          } else {
            state.queue = state.queue.filter(q => q.id !== id);
          }
          render(containerEl);
        }
      });
    });

    // 10. Eliminar unidad de la cola
    containerEl.querySelectorAll('.eco-remove-btn[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        state.queue = state.queue.filter(q => q.id !== id);
        render(containerEl);
      });
    });

    // 11. Modal Picker de Selección de Unidades
    const openPickerBtn = containerEl.querySelector('#eco-open-picker-btn');
    if (openPickerBtn) {
      openPickerBtn.addEventListener('click', () => {
        state.showPickerModal = true;
        render(containerEl);
      });
    }

    const closePickerBtn = containerEl.querySelector('#eco-picker-close-btn');
    if (closePickerBtn) {
      closePickerBtn.addEventListener('click', () => {
        state.showPickerModal = false;
        render(containerEl);
      });
    }

    const pickerBackdrop = containerEl.querySelector('#eco-picker-modal-backdrop');
    if (pickerBackdrop) {
      pickerBackdrop.addEventListener('click', (e) => {
        if (e.target === pickerBackdrop) {
          state.showPickerModal = false;
          render(containerEl);
        }
      });
    }

    // Filtros de categoría en el modal picker
    containerEl.querySelectorAll('.eco-picker-content [data-filter]').forEach(fBtn => {
      fBtn.addEventListener('click', () => {
        state.pickerFilter = fBtn.dataset.filter;
        render(containerEl);
      });
    });

    // Selección de unidad en el modal
    containerEl.querySelectorAll('.eco-picker-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.pickerId);
        const existing = state.queue.find(q => q.id === id);
        if (existing) {
          existing.count++;
        } else {
          state.queue.push({ id, count: 1 });
        }
        state.showPickerModal = false;
        render(containerEl);
      });
    });
  }

  return {
    init,
    render,
    CANONICAL_UNITS,
    MILITARY_TECH_DEF,
    CIVS_56,
    ECO_TECHS,
    PASTURE_ECO_TECHS,
    PASTURE_TECHS_DATA,
    PRESETS,
    getCanonicalUnit,
    getAvailableUnitsForCiv,
    getUnitIconProps,
    renderUnitPickerModal,
    getState: () => state,
    setCiv: (civId) => { state.civId = civId; syncAgeAndCivTechs(); },
    setAge: (age) => { state.selectedAge = age; syncAgeAndCivTechs(); },
    setFoodSource: (source) => { state.foodSource = source; }
  };
});
