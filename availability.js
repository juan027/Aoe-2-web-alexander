/**
 * AVAILABILITY.JS - Módulo de Disponibilidad y Excepciones de Edificios por Civilización
 * Implementación segura de verificación de TechTree, reemplazos únicos y filtros por civilización.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.SOUTH_AMERICAN_CIVS = exports.SOUTH_AMERICAN_CIVS;
    global.MULE_CART_CIVS = exports.MULE_CART_CIVS;
    global.CARAVANSERAI_CIVS = exports.CARAVANSERAI_CIVS;
    global.PASTURE_CIVS = exports.PASTURE_CIVS;
    global.isBuildingAvailableForCiv = exports.isBuildingAvailableForCiv;
    global.getBuildingAvailability = exports.getBuildingAvailability;
    global.checkCivTechTreeAccess = exports.checkCivTechTreeAccess;
    global.isTechAvailableForCiv = exports.isTechAvailableForCiv;
    global.isUnitAvailableForCiv = exports.isUnitAvailableForCiv;
    global.resolveCivKey = exports.resolveCivKey;
    global.SPANISH_TO_ENGLISH_CIVS = exports.SPANISH_TO_ENGLISH_CIVS;
    global.ALL_CIVS = exports.ALL_CIVS;
    global.availability = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Lista canónica de civilizaciones
  const ALL_CIVS = [
    "Aztecs", "Bengalis", "Berbers", "Bohemians", "Britons", "Bulgarians", "Burgundians",
    "Burmese", "Byzantines", "Celts", "Chinese", "Cumans", "Danes", "Dravidians", "Ethiopians",
    "Franks", "Georgians", "Goths", "Gurjaras", "Huns", "Incas", "Hindustanis", "Italians",
    "Japanese", "Jurchens", "Khmer", "Khitans", "Koreans", "Lithuanians", "Magyars", "Malay",
    "Malians", "Mapuche", "Mayans", "Mongols", "Muisca", "Persians", "Poles", "Portuguese",
    "Romans", "Saracens", "Saxons", "Shu", "Sicilians", "Slavs", "Spanish", "Tatars",
    "Teutons", "Tupi", "Turks", "Varangians", "Vietnamese", "Vikings", "Wei", "Wu", "Armenians"
  ];

  // Civilizaciones regionales y configuraciones estrictas
  const SOUTH_AMERICAN_CIVS = ["muisca", "muiscas", "mapuche", "mapuches", "inca", "incas", "tupi", "tupis", "tupí", "tupís"];
  const MULE_CART_CIVS = ["armenians", "armenios", "georgians", "georgianos"];
  const CARAVANSERAI_CIVS = ["persians", "persas", "hindustanis", "indostanies", "indostanos"];
  const PASTURE_CIVS = ["khitan", "kithan", "kitanes", "khitans", "khitanes"];

  const SPANISH_TO_ENGLISH_CIVS = {
    "genérico": "Generic",
    "generic": "Generic",
    "britanos": "Britons",
    "borgoñones": "Burgundians",
    "borgoñeses": "Burgundians",
    "celtas": "Celts",
    "españoles": "Spanish",
    "francos": "Franks",
    "godos": "Goths",
    "italianos": "Italians",
    "portugueses": "Portuguese",
    "romanos": "Romans",
    "sicilianos": "Sicilians",
    "teutones": "Teutons",
    "vikingos": "Vikings",
    "armenios": "Armenians",
    "bohemios": "Bohemians",
    "búlgaros": "Bulgarians",
    "eslavos": "Slavs",
    "georgianos": "Georgians",
    "lituanos": "Lithuanians",
    "magiares": "Magyars",
    "polacos": "Poles",
    "varegos": "Varangians",
    "bereberes": "Berbers",
    "bizantinos": "Byzantines",
    "etiopías": "Ethiopians",
    "etiopes": "Ethiopians",
    "etíopes": "Ethiopians",
    "malienses": "Malians",
    "malíes": "Malians",
    "persas": "Persians",
    "sarracenos": "Saracens",
    "turcos": "Turks",
    "bengala": "Bengalis",
    "bengalíes": "Bengalis",
    "bengalis": "Bengalis",
    "bengali": "Bengalis",
    "dravídicos": "Dravidians",
    "dravidicos": "Dravidians",
    "dravidians": "Dravidians",
    "dravidian": "Dravidians",
    "gurjaras": "Gurjaras",
    "gurjara": "Gurjaras",
    "hindustaníes": "Hindustanis",
    "indostanos": "Hindustanis",
    "indostaníes": "Hindustanis",
    "indostanies": "Hindustanis",
    "hindustanis": "Hindustanis",
    "hindustani": "Hindustanis",
    "hunos": "Huns",
    "khitanes": "Khitans",
    "kitán": "Khitans",
    "mongoles": "Mongols",
    "tártaros": "Tatars",
    "birmanos": "Burmese",
    "chinos": "Chinese",
    "coreanos": "Koreans",
    "cumanos": "Cumans",
    "daneses": "Danes",
    "japoneses": "Japanese",
    "jemeres": "Khmer",
    "jurchen": "Jurchens",
    "yurchen": "Jurchens",
    "malayos": "Malay",
    "vietnamitas": "Vietnamese",
    "aztecas": "Aztecs",
    "incas": "Incas",
    "inca": "Incas",
    "mapuches": "Mapuche",
    "mayas": "Mayans",
    "maya": "Mayans",
    "muiscas": "Muisca",
    "sajones": "Saxons",
    "anglosajones": "Saxons",
    "shu": "Shu",
    "tupí": "Tupi",
    "tupís": "Tupi",
    "tupi": "Tupi",
    "wei": "Wei",
    "wu": "Wu"
  };

  function resolveCivKey(civName) {
    if (!civName) return "Generic";
    const norm = String(civName).toLowerCase().trim();
    if (SPANISH_TO_ENGLISH_CIVS[norm]) return SPANISH_TO_ENGLISH_CIVS[norm];
    const match = ALL_CIVS.find(c => c.toLowerCase() === norm);
    if (match) return match;
    return civName;
  }

  function checkCivTechTreeAccess(civNameOrKey, buildingKeyOrId) {
    const civKey = resolveCivKey(civNameOrKey);
    if (typeof window !== 'undefined' && window.state && window.state.data && window.state.data.civs) {
      const civObj = window.state.data.civs[civKey] || window.state.data.civs[civNameOrKey];
      if (civObj && civObj.disabled && Array.isArray(civObj.disabled.buildings)) {
        const bId = Number(buildingKeyOrId);
        if (Number.isFinite(bId) && civObj.disabled.buildings.includes(bId)) {
          return false;
        }
      }
    }
    return true;
  }

  function isBuildingAvailableForCiv(buildingKey, civName) {
    const normCiv = (civName || "").toLowerCase().trim();
    const resolvedCiv = resolveCivKey(normCiv).toLowerCase().trim();
    const normKey = (buildingKey?.key || buildingKey || "").toLowerCase().trim();

    const isSouthAmerican = SOUTH_AMERICAN_CIVS.includes(normCiv) || SOUTH_AMERICAN_CIVS.includes(resolvedCiv);
    const isCaucasian = MULE_CART_CIVS.includes(normCiv) || MULE_CART_CIVS.includes(resolvedCiv);
    const isPolish = ["poles", "polacos"].includes(normCiv) || ["poles", "polacos"].includes(resolvedCiv);
    const isSicilian = ["sicilians", "sicilianos"].includes(normCiv) || ["sicilians", "sicilianos"].includes(resolvedCiv);
    const isKhitan = PASTURE_CIVS.includes(normCiv) || PASTURE_CIVS.includes(resolvedCiv);
    const isMalay = ["malay", "malayos"].includes(normCiv) || ["malay", "malayos"].includes(resolvedCiv);
    const isBulgarian = ["bulgarians", "búlgaros", "bulgaros"].includes(normCiv) || ["bulgarians", "búlgaros", "bulgaros"].includes(resolvedCiv);
    const isPortuguese = ["portuguese", "portugueses"].includes(normCiv) || ["portuguese", "portugueses"].includes(resolvedCiv);
    const isCaravanseraiCiv = CARAVANSERAI_CIVS.includes(normCiv) || CARAVANSERAI_CIVS.includes(resolvedCiv);

    // 1. Asentamiento: Exclusivo de Muisca, Mapuche, Inca y Tupí
    if (["asentamiento", "settlement", "2556"].includes(normKey)) {
      return isSouthAmerican;
    }

    // 2. Molino: Bloqueado para Sudamericanas y Polacos (Polacos usan Folwark)
    if (["mill", "molino", "68"].includes(normKey)) {
      if (isSouthAmerican || isPolish) return false;
    }

    // 3. Campamento maderero y Campamento minero: Bloqueados para Sudamericanas y Caucásicas (Carro de mulas)
    if (["lumber_camp", "campamento_maderero", "562", "mining_camp", "campamento_minero", "584"].includes(normKey)) {
      if (isSouthAmerican || isCaucasian) return false;
    }

    // 4. Monasterio: Bloqueado para Caucásicas (solo Iglesia fortificada)
    if (["monastery", "monasterio", "30", "104"].includes(normKey)) {
      if (isCaucasian) return false;
    }

    // 5. Carro de mulas: Exclusivo de Armenios y Georgianos
    if (["mule_cart", "carro_de_mulas", "carro_mulas", "carreta_de_mulas", "1808"].includes(normKey)) {
      return isCaucasian;
    }

    // 6. Iglesia fortificada: Exclusivo de Armenios y Georgianos
    if (["fortified_church", "iglesia_fortificada", "1806", "1805"].includes(normKey)) {
      return isCaucasian;
    }

    // 7. Folwark: Exclusivo de Polacos
    if (["folwark", "1734"].includes(normKey)) {
      return isPolish;
    }

    // 8. Donjon: Exclusivo de Sicilianos
    if (["donjon", "1665"].includes(normKey)) {
      return isSicilian;
    }

    // 9. Torres normales: Bloqueadas para Sicilianos (usan Donjon)
    if (["watch_tower", "torre_de_guardia", "torre_guardia", "79", "guard_tower", "torre_de_vigilancia", "234", "keep", "torre_del_homenaje", "235"].includes(normKey)) {
      if (isSicilian) return false;
    }

    // 10. Granja: Bloqueada para Khitanes (usan Pasturas)
    if (["farm", "granja", "50"].includes(normKey)) {
      if (isKhitan) return false;
    }

    // 11. Pasturas: Exclusivo de Khitanes
    if (["pasture", "pasturas", "pastura", "pastizal", "1889"].includes(normKey)) {
      return isKhitan;
    }

    // 12. Caravansarai: Exclusivo de Persas e Indostaníes
    if (["caravansarai", "caravanserai", "caravasar", "1754"].includes(normKey)) {
      return isCaravanseraiCiv;
    }

    // 13. Harbor / Puerto: Exclusivo de Malayos
    if (["harbor", "puerto", "1189"].includes(normKey)) {
      return isMalay;
    }

    // 14. Krepost: Exclusivo de Búlgaros
    if (["krepost", "1251"].includes(normKey)) {
      return isBulgarian;
    }

    // 15. Feitoria: Exclusivo de Portugueses
    if (["feitoria", "factoria", "factoría", "1021"].includes(normKey)) {
      return isPortuguese;
    }

    // Comprobar TechTree canónico
    return checkCivTechTreeAccess(normCiv, normKey);
  }

  /**
   * Consulta segura de disponibilidad de edificios para una o todas las civilizaciones.
   * Si targetCiv === 'all', retorna array con el estado de todas las civilizaciones.
   * Si targetCiv es una civilización específica, retorna el objeto de disponibilidad de esa civilización.
   */
  function getBuildingAvailability(buildingKey, targetCiv = "all") {
    const rawKey = String(buildingKey?.key || buildingKey || "").toLowerCase().trim();
    const civList = (typeof window !== 'undefined' && window.ALL_CIVS) || ALL_CIVS;

    function evaluateForCiv(civ) {
      const civKey = (typeof civ === "string" ? civ : civ?.key || civ?.name || civ?.internal_name || "").toLowerCase().trim();
      const resolvedCiv = resolveCivKey(civKey).toLowerCase().trim();
      const civDisplay = typeof civ === "string" ? civ : (civ?.name || civKey);

      const isSouthAmerican = SOUTH_AMERICAN_CIVS.includes(civKey) || SOUTH_AMERICAN_CIVS.includes(resolvedCiv);
      const isCaucasian = MULE_CART_CIVS.includes(civKey) || MULE_CART_CIVS.includes(resolvedCiv);
      const isPolish = ["poles", "polacos"].includes(civKey) || ["poles", "polacos"].includes(resolvedCiv);
      const isSicilian = ["sicilians", "sicilianos"].includes(civKey) || ["sicilians", "sicilianos"].includes(resolvedCiv);
      const isKhitan = PASTURE_CIVS.includes(civKey) || PASTURE_CIVS.includes(resolvedCiv);
      const isMalay = ["malay", "malayos"].includes(civKey) || ["malay", "malayos"].includes(resolvedCiv);
      const isBulgarian = ["bulgarians", "búlgaros", "bulgaros"].includes(civKey) || ["bulgarians", "búlgaros", "bulgaros"].includes(resolvedCiv);
      const isPortuguese = ["portuguese", "portugueses"].includes(civKey) || ["portuguese", "portugueses"].includes(resolvedCiv);
      const isCaravanseraiCiv = CARAVANSERAI_CIVS.includes(civKey) || CARAVANSERAI_CIVS.includes(resolvedCiv);

      // Helper estricto sin estados de reemplazo: solo available o unavailable
      const avail = (isAllowed) => ({
        civ: civDisplay,
        status: isAllowed ? "available" : "unavailable",
        available: Boolean(isAllowed),
        text: isAllowed ? "Disponible" : "No disponible"
      });

      // 1. Asentamiento: Exclusivo de Muisca, Mapuche, Inca y Tupí
      if (["asentamiento", "settlement", "2556"].includes(rawKey)) {
        return avail(isSouthAmerican);
      }

      // 2. Molino: Bloqueado para Sudamericanas y Polacos
      if (["mill", "molino", "68"].includes(rawKey)) {
        if (isSouthAmerican || isPolish) return avail(false);
      }

      // 3. Campamentos maderero y minero: Bloqueados para Sudamericanas y Caucásicas
      if (["lumber_camp", "campamento_maderero", "562", "mining_camp", "campamento_minero", "584"].includes(rawKey)) {
        if (isSouthAmerican || isCaucasian) return avail(false);
      }

      // 4. Monasterio: Bloqueado para Caucásicas
      if (["monastery", "monasterio", "30", "104"].includes(rawKey)) {
        if (isCaucasian) return avail(false);
      }

      // 5. Carro de mulas: Exclusivo de Armenios y Georgianos
      if (["mule_cart", "carro_de_mulas", "carro_mulas", "carreta_de_mulas", "1808"].includes(rawKey)) {
        return avail(isCaucasian);
      }

      // 6. Iglesia fortificada: Exclusivo de Armenios y Georgianos
      if (["fortified_church", "iglesia_fortificada", "1806", "1805"].includes(rawKey)) {
        return avail(isCaucasian);
      }

      // 7. Folwark: Exclusivo de Polacos
      if (["folwark", "1734"].includes(rawKey)) {
        return avail(isPolish);
      }

      // 8. Donjon: Exclusivo de Sicilianos
      if (["donjon", "1665"].includes(rawKey)) {
        return avail(isSicilian);
      }

      // 9. Torres de guardia y variantes: Bloqueadas para Sicilianos
      if (["watch_tower", "torre_de_guardia", "torre_guardia", "79", "guard_tower", "torre_de_vigilancia", "234", "keep", "torre_del_homenaje", "235"].includes(rawKey)) {
        if (isSicilian) return avail(false);
      }

      // 10. Granja: Bloqueada para Khitanes
      if (["farm", "granja", "50"].includes(rawKey)) {
        if (isKhitan) return avail(false);
      }

      // 11. Pasturas: Exclusivo de Khitanes
      if (["pasture", "pasturas", "pastura", "pastizal", "1889"].includes(rawKey)) {
        return avail(isKhitan);
      }

      // 12. Caravansarai: Exclusivo de Persas e Indostaníes
      if (["caravansarai", "caravanserai", "caravasar", "1754"].includes(rawKey)) {
        return avail(isCaravanseraiCiv);
      }

      // 13. Harbor / Puerto: Exclusivo de Malayos
      if (["harbor", "puerto", "1189"].includes(rawKey)) {
        return avail(isMalay);
      }

      // 14. Krepost: Exclusivo de Búlgaros
      if (["krepost", "1251"].includes(rawKey)) {
        return avail(isBulgarian);
      }

      // 15. Feitoria: Exclusivo de Portugueses
      if (["feitoria", "factoria", "factoría", "1021"].includes(rawKey)) {
        return avail(isPortuguese);
      }

      // 16. Verificación general en TechTree
      const isTechTreeAllowed = typeof checkCivTechTreeAccess === "function" 
        ? checkCivTechTreeAccess(civKey, rawKey) 
        : (typeof window !== "undefined" && typeof window.checkCivTechTreeAccess === "function" ? window.checkCivTechTreeAccess(civKey, rawKey) : true);

      return avail(isTechTreeAllowed);
    }

    if (targetCiv && targetCiv !== "all") {
      return evaluateForCiv(targetCiv);
    }

    return civList.map(civ => evaluateForCiv(civ));
  }

  function isTechAvailableForCiv(civName, techId) {
    const civKey = resolveCivKey(civName);
    if (!civKey || civKey === "Generic" || civKey === "all" || civKey === "generic") return true;
    const numId = Number(techId);

    // Identificadores simbólicos (ej. tecnologías de pastoreo Khitan)
    if (!Number.isFinite(numId)) {
      if (["domestication", "pastoralism", "transhumance"].includes(String(techId).toLowerCase())) {
        return PASTURE_CIVS.includes(String(civName).toLowerCase().trim()) || PASTURE_CIVS.includes(civKey.toLowerCase());
      }
      return true;
    }

    let civsData = null;
    if (typeof window !== "undefined") {
      if (window.state && window.state.data && window.state.data.civs) civsData = window.state.data.civs;
      else if (window.data && window.data.civs) civsData = window.data.civs;
    }
    if (!civsData && typeof require === "function") {
      try { civsData = require('./data/data.json').civs; } catch (e) {}
    }

    if (civsData) {
      const civObj = civsData[civKey] || civsData[civName];
      if (civObj && Array.isArray(civObj.Tech)) {
        return civObj.Tech.includes(numId);
      }
    }
    return true;
  }

  /**
   * Determina si una unidad específica está disponible para una civilización dada
   * respetando rigurosamente el árbol tecnológico de Genie Engine (data.json),
   * bloqueando caballería en civilizaciones mesoamericanas/sudamericanas,
   * reemplazando la milicia estándar por la línea Champi en civilizaciones andinas,
   * y filtrando mejoras avanzadas (ej. Paladín, Campeón) según las exclusiones oficiales.
   *
   * @param {string} civName - Nombre o ID de la civilización (español o inglés)
   * @param {number|string} unitId - ID numérico de la unidad
   * @returns {boolean}
   */
  function isUnitAvailableForCiv(civName, unitId) {
    if (!civName) return true;
    const normCiv = String(civName).toLowerCase().trim();
    if (normCiv === "generic" || normCiv === "genérico" || normCiv === "all") return true;

    const numId = Number(unitId);
    if (!Number.isFinite(numId)) return true;

    // Normalizar ID del Trebuchet (42 -> 331)
    const effectiveId = (numId === 42) ? 331 : numId;

    const civKey = resolveCivKey(normCiv);
    const resolvedNorm = civKey.toLowerCase().trim();

    const THREE_KINGDOMS_CIVS = ["wu", "shu", "wei"];
    const isThreeKingdoms = THREE_KINGDOMS_CIVS.includes(resolvedNorm) || THREE_KINGDOMS_CIVS.includes(normCiv);

    const SOUTH_ASIAN_CIVS = [
      "hindustanis", "hindustani", "hindustaníes", "indostanos", "indostanies",
      "bengalis", "bengali", "bengala", "bengalíes",
      "dravidians", "dravidian", "dravídicos", "dravidicos",
      "gurjaras", "gurjara"
    ];
    const isSouthAsian = SOUTH_ASIAN_CIVS.includes(resolvedNorm) || SOUTH_ASIAN_CIVS.includes(normCiv);

    // 1. Lanzapiedras convencional (Counterweight Trebuchet - 331 / 42) en Castillo:
    // Bloqueado estrictamente para los Tres Reinos (Wu, Shu, Wei).
    // Para las demás civilizaciones está disponible universalmente.
    if (effectiveId === 331) {
      if (isThreeKingdoms) return false;
      return true;
    }

    // 2. Trebuchet a tracción (1800 / 1942) en Taller de Asedio:
    // Disponible para Wu, Shu, Wei, Jurchen, Khitans y Armenios. Bloqueado para el resto.
    if (effectiveId === 1800 || effectiveId === 1942) {
      const TRACTION_TREB_CIVS = ["wu", "shu", "wei", "jurchens", "jurchen", "khitans", "armenians"];
      return TRACTION_TREB_CIVS.includes(resolvedNorm) || TRACTION_TREB_CIVS.includes(normCiv);
    }

    // 3. Elefante acorazado (1744) y Elefante de asedio (1746):
    // Exclusivo de civilizaciones del Sur de Asia (Hindustaníes, Bengalíes, Dravídicos, Gurjaras).
    if (effectiveId === 1744 || effectiveId === 1746) {
      return isSouthAsian;
    }

    // 4. Arietes estándar (1258, 422, 548):
    // Bloqueados para civilizaciones del Sur de Asia (reemplazados por la línea de elefantes de asedio).
    if (effectiveId === 1258 || effectiveId === 422 || effectiveId === 548) {
      if (isSouthAsian) return false;
    }

    // 5. Unidades de Bonificación de Equipo (Team Bonus):
    // - Condotiero (882): Otorgado por aliado italiano en Imperial
    // - Genitour (1010) y Genitour de élite (1012): Otorgados por aliado bereber en Castillos/Imperial
    // - Guerrillero imperial (1155): Otorgado por aliado vietnamita en Imperial
    // Disponibles para todas las civilizaciones en producción continua/juego en equipo
    const TEAM_BONUS_UNITS = [882, 1010, 1012, 1155];
    if (TEAM_BONUS_UNITS.includes(effectiveId)) {
      return true;
    }

    // 6. Otras unidades universales siempre disponibles
    if (effectiveId === 83 || effectiveId === 440) {
      return true;
    }

    // 1. Consultar el dataset canónico de civilizaciones (data.json) si está disponible
    let civsData = null;
    if (typeof window !== "undefined") {
      if (window.state && window.state.data && window.state.data.civs) civsData = window.state.data.civs;
      else if (window.data && window.data.civs) civsData = window.data.civs;
    }
    if (!civsData && typeof require === "function") {
      try { civsData = require('./data/data.json').civs; } catch (e) {}
    }

    if (civsData) {
      let civObj = civsData[civKey] || civsData[normCiv] || civsData[resolvedNorm];
      if (!civObj) {
        const matchingKey = Object.keys(civsData).find(k => k.toLowerCase() === normCiv || k.toLowerCase() === resolvedNorm);
        if (matchingKey) civObj = civsData[matchingKey];
      }
      if (civObj && Array.isArray(civObj.Unit)) {
        // En data.json, civObj.Unit contiene la lista exacta de unidades permitidas para la civilización
        if (civObj.Unit.includes(effectiveId)) {
          return true;
        }
        // Soporte de alias para Mapuche (si se consulta 1901 o 1902 pero en data.json está 2569/2571)
        if (effectiveId === 1901 && civObj.Unit.includes(2569) && ["mapuche", "mapuches"].includes(resolvedNorm)) {
          return true;
        }
        if (effectiveId === 1902 && civObj.Unit.includes(2571) && ["mapuche", "mapuches"].includes(resolvedNorm)) {
          return true;
        }
        return false;
      }
    }

    // 2. Reglas canónicas estrictas de filtrado (Fallback cuando data.json aún no carga o en entornos aislados)
    const isMeso = ["mayans", "maya", "aztecs", "aztecas", "incas", "inca"].includes(resolvedNorm);
    const isSouthAmerican = SOUTH_AMERICAN_CIVS.includes(normCiv) || SOUTH_AMERICAN_CIVS.includes(resolvedNorm);
    const isAndeanChampi = ["muisca", "muiscas", "incas", "inca", "mapuche", "mapuches", "tupi", "tupis", "tupí", "tupís"].includes(resolvedNorm);

    // Caballería bloqueada para civilizaciones mesoamericanas y sudamericanas
    const CAVALRY_IDS = [38, 283, 569, 448, 546, 441, 329, 330, 1132, 1134, 1370, 1372, 1751, 1753, 1944, 1946];
    if (CAVALRY_IDS.includes(effectiveId)) {
      if (isMeso || isSouthAmerican) return false;
    }

    // Paladín (569) exclusivo de 10 civilizaciones
    if (effectiveId === 569) {
      const PALADIN_ALLOWED = ["burgundians", "byzantines", "celts", "cumans", "franks", "huns", "lithuanians", "magyars", "spanish", "teutons"];
      return PALADIN_ALLOWED.includes(resolvedNorm);
    }

    // Campeón (567) bloqueado para civilizaciones sin acceso
    if (effectiveId === 567) {
      const NO_CHAMPION = ["bulgarians", "ethiopians", "gurjaras", "huns", "incas", "jurchens", "khmer", "malay", "mapuche", "mayans", "muisca", "persians", "romans", "tatars", "tupi", "varangians", "wei"];
      if (NO_CHAMPION.includes(resolvedNorm)) return false;
    }

    // Línea de milicia estándar (74, 75, 77, 473, 567) reemplazada por Champi en civilizaciones andinas / sudamericanas
    const STANDARD_MILITIA = [74, 75, 77, 473, 567];
    if (STANDARD_MILITIA.includes(effectiveId) && isAndeanChampi) {
      return false;
    }

    // Línea Champi (2550, 2588, 2552, 2554) exclusiva de civilizaciones andinas / sudamericanas
    const CHAMPI_LINE = [2550, 2588, 2552, 2554];
    if (CHAMPI_LINE.includes(effectiveId)) {
      return isAndeanChampi;
    }

    // Línea Águila (753, 751, 752) exclusiva de civilizaciones mesoamericanas
    const EAGLE_LINE = [753, 751, 752];
    if (EAGLE_LINE.includes(effectiveId)) {
      return isMeso;
    }

    // Trebuchet a tracción (1800)
    if (effectiveId === 1800) {
      return ["jurchens", "jurchen", "khitans", "shu", "wei", "wu", "armenians"].includes(resolvedNorm);
    }

    // Granadero (1920)
    if (effectiveId === 1920) {
      return ["jurchens", "jurchen"].includes(resolvedNorm);
    }

    // Lancero incendiario (1901, 1903)
    if (effectiveId === 1901 || effectiveId === 1903) {
      return ["chinese", "jurchens", "jurchen", "khitans", "koreans", "vietnamese"].includes(resolvedNorm);
    }

    // Ballestero montado (2700, 2701)
    if (effectiveId === 2700 || effectiveId === 2701) {
      return ["danes", "saxons", "varangians"].includes(resolvedNorm);
    }

    // Guardia Varego (2703, 2704)
    if (effectiveId === 2703 || effectiveId === 2704) {
      return ["varangians"].includes(resolvedNorm);
    }

    // Hondero (185)
    if (effectiveId === 185) {
      return ["incas", "inca", "muisca", "muiscas", "mapuche", "mapuches", "tupi", "tupis", "tupí", "tupís"].includes(resolvedNorm);
    }

    // Serjeant (1658, 1659, 1660, 1661)
    if ([1658, 1659, 1660, 1661].includes(effectiveId)) {
      return ["sicilians", "sicilianos"].includes(resolvedNorm);
    }

    // Kamayuk (879, 881)
    if (effectiveId === 879 || effectiveId === 881) {
      return ["incas", "inca"].includes(resolvedNorm);
    }

    // Unidades de Muiscas: Guerrero guecha (2562, 2564) y Guardia del templo (2586, 2587)
    if ([2562, 2564, 2586, 2587].includes(effectiveId)) {
      return ["muisca", "muiscas"].includes(resolvedNorm);
    }

    // Arquero de los bosques (2579, 2581) y Guerrero Ibiraçema / Ibirapema (2582, 2584)
    if ([2579, 2581, 2582, 2584].includes(effectiveId)) {
      return ["tupi", "tupis", "tupí", "tupís"].includes(resolvedNorm);
    }

    // Jinete con boleadoras (2569, 2571)
    if (effectiveId === 2569 || effectiveId === 2571) {
      return ["mapuche"].includes(resolvedNorm);
    }

    // Milicia Flamenca (1699)
    if (effectiveId === 1699) {
      return ["burgundians"].includes(resolvedNorm);
    }

    // Elefante de batalla (1132, 1134)
    if (effectiveId === 1132 || effectiveId === 1134) {
      return ["bengalis", "burmese", "khmer", "malay", "vietnamese"].includes(resolvedNorm);
    }

    // Jinete de Hei Guang (1944, 1946)
    if (effectiveId === 1944 || effectiveId === 1946) {
      return ["shu", "wei", "wu"].includes(resolvedNorm);
    }

    // Jinete de Shrivamsha (1751, 1753)
    if (effectiveId === 1751 || effectiveId === 1753) {
      return ["gurjaras"].includes(resolvedNorm);
    }

    // Unidades de Bonificación de Equipo (Team Bonus: Genitour 1010/1012, Guerrillero imperial 1155, Condotiero 882)
    if ([882, 1010, 1012, 1155].includes(effectiveId)) {
      return true;
    }

    // Carro cohete (1904, 1907)
    if (effectiveId === 1904 || effectiveId === 1907) {
      return ["jurchens", "jurchen", "khitans", "koreans", "chinese"].includes(resolvedNorm);
    }

    return true;
  }

  return {
    ALL_CIVS,
    SOUTH_AMERICAN_CIVS,
    MULE_CART_CIVS,
    CARAVANSERAI_CIVS,
    PASTURE_CIVS,
    SPANISH_TO_ENGLISH_CIVS,
    resolveCivKey,
    southAmericanCivs: SOUTH_AMERICAN_CIVS,
    checkCivTechTreeAccess,
    isBuildingAvailableForCiv,
    isTechAvailableForCiv,
    isUnitAvailableForCiv,
    getBuildingAvailability
  };
});
