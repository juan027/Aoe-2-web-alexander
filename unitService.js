/**
 * unitService.js
 * Fuente Única de Verdad (Single Source of Truth - SSOT) para Datos Base de Unidades en Age of Empires II: DE.
 *
 * Centraliza la lectura de costes base, tiempos de creación y metadatos canónicos desde data/data.json
 * y data/locales/es/strings.json (con offset oficial de strings +9000).
 *
 * Compatible de manera universal con entornos de navegador (window.unitService) y Node.js (CommonJS).
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.unitService = exports;
    global.getBaseUnitData = exports.getBaseUnitData;
    global.getUnitBaseCost = exports.getUnitBaseCost;
    global.getUnitBaseTrainTime = exports.getUnitBaseTrainTime;
    global.resolveUnitIcon = exports.resolveUnitIcon;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Cache interna de unidades normalizadas
  const _unitsCache = new Map();
  let _rawUnits = null;
  let _rawStrings = null;
  let _isInitialized = false;

  /**
   * Limpia etiquetas HTML (<br>, <b>, etc.) y normaliza espacios en blanco
   */
  function cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/<br\s*[\/]?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\r?\n|\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Resuelve el nombre en español canónico de la unidad con los offsets oficiales del Genie Engine (+9000)
   */
  function resolveUnitName(rawUnit, unitId) {
    if (!rawUnit) return `Unidad #${unitId}`;
    const s = _rawStrings;
    if (s && typeof s === 'object') {
      const langId = rawUnit.LanguageNameId;
      if (typeof langId === 'number' && langId > 0) {
        if (s[langId]) {
          const cleaned = cleanText(s[langId]);
          if (cleaned) return cleaned;
        }
        if (s[langId + 9000]) {
          const cleaned = cleanText(s[langId + 9000]);
          if (cleaned) return cleaned;
        }
      }
    }
    if (rawUnit.internal_name) {
      return rawUnit.internal_name.replace(/_/g, ' ');
    }
    return `Unidad #${unitId}`;
  }

  /**
   * Obtiene datos estáticos registrados en UNITS_DATA si existen
   */
  function getStaticUnitData(unitId) {
    if (typeof window !== 'undefined' && window.UNITS_DATA && window.UNITS_DATA[unitId]) {
      return window.UNITS_DATA[unitId];
    }
    if (typeof require === 'function') {
      try {
        const u = require('./data/units.js');
        if (u && u.UNITS_DATA && u.UNITS_DATA[unitId]) return u.UNITS_DATA[unitId];
      } catch (e) {}
      try {
        const u = require('./units.js');
        if (u && u.UNITS_DATA && u.UNITS_DATA[unitId]) return u.UNITS_DATA[unitId];
      } catch (e) {}
    }
    return null;
  }

  /**
   * Normaliza una unidad del dataset maestro data.json a una estructura inmutable y limpia
   */
  function normalizeUnitData(id, rawUnit) {
    const unitId = Number(id);
    const staticData = getStaticUnitData(unitId);

    const isTrebuchet = (unitId === 42 || unitId === 331 || (rawUnit && (rawUnit.internal_name === 'TREBU' || rawUnit.internal_name === 'PTREB')));
    const isTractionTrebuchet = (unitId === 1800 || unitId === 1942 || (rawUnit && rawUnit.internal_name === 'TRTREB'));
    let icon = isTrebuchet ? '29.png' : (isTractionTrebuchet ? '428.png' : `${unitId}.png`);
    if (staticData && staticData.icon) icon = staticData.icon;
    const pictureIndex = isTrebuchet ? 29 : (isTractionTrebuchet ? 428 : (rawUnit && (rawUnit.picture_index ?? rawUnit.pictureIndex ?? null)));

    if (!rawUnit || typeof rawUnit !== 'object') {
      if (staticData) {
        const sCost = staticData.cost || staticData.Cost || {};
        const sFood = Math.max(0, Number(sCost.Food ?? sCost.food ?? 0));
        const sWood = Math.max(0, Number(sCost.Wood ?? sCost.wood ?? 0));
        const sGold = Math.max(0, Number(sCost.Gold ?? sCost.gold ?? 0));
        const sStone = Math.max(0, Number(sCost.Stone ?? sCost.stone ?? 0));
        const sTime = Math.max(1, Number(staticData.trainTime ?? staticData.TrainTime ?? 25));
        const sName = staticData.name || staticData.localizedName || `Unidad #${unitId}`;
        const sInternal = staticData.internalName || staticData.internal_name || '';

        return Object.freeze({
          id: unitId,
          ID: unitId,
          name: sName,
          localizedName: sName,
          internalName: sInternal,
          internal_name: sInternal,
          building: staticData.building || '',
          age: staticData.age || '',
          icon: icon,
          pictureIndex: pictureIndex,
          iconPath: isTrebuchet ? 'img/Unit/29.png' : (isTractionTrebuchet ? 'img/Unit/428.png' : `img/units/${unitId}.png`),
          unitIcon: isTrebuchet ? 'img/units/331.png' : (isTractionTrebuchet ? 'img/units/428.png' : `img/units/${unitId}.png`),
          fallbackIcon: isTrebuchet ? 'img/Unit/29.png' : (isTractionTrebuchet ? 'img/Unit/428.png' : `img/Unit/${icon}`),
          cost: Object.freeze({ food: sFood, wood: sWood, gold: sGold, stone: sStone }),
          Cost: Object.freeze({ Food: sFood, Wood: sWood, Gold: sGold, Stone: sStone }),
          trainTime: sTime,
          TrainTime: sTime,
          hp: staticData.hp || 0,
          raw: null
        });
      }

      return Object.freeze({
        id: unitId,
        ID: unitId,
        name: `Unidad #${unitId}`,
        localizedName: `Unidad #${unitId}`,
        internalName: '',
        internal_name: '',
        icon: icon,
        pictureIndex: pictureIndex,
        iconPath: isTrebuchet ? 'img/Unit/29.png' : `img/units/${unitId}.png`,
        unitIcon: isTrebuchet ? 'img/units/331.png' : `img/units/${unitId}.png`,
        fallbackIcon: isTrebuchet ? 'img/Unit/29.png' : `img/Unit/${unitId}.png`,
        cost: Object.freeze({ food: 0, wood: 0, gold: 0, stone: 0 }),
        Cost: Object.freeze({ Food: 0, Wood: 0, Gold: 0, Stone: 0 }),
        trainTime: 25,
        TrainTime: 25,
        hp: 0,
        raw: null
      });
    }

    const rawCost = (staticData && (staticData.cost || staticData.Cost)) || rawUnit.Cost || rawUnit.cost || {};
    const food = Math.max(0, Number(rawCost.Food ?? rawCost.food ?? 0));
    const wood = Math.max(0, Number(rawCost.Wood ?? rawCost.wood ?? 0));
    const gold = Math.max(0, Number(rawCost.Gold ?? rawCost.gold ?? 0));
    const stone = Math.max(0, Number(rawCost.Stone ?? rawCost.stone ?? 0));

    const rawTime = (staticData && (staticData.TrainTime ?? staticData.trainTime)) ?? rawUnit.TrainTime ?? rawUnit.trainTime ?? 25;
    const trainTime = Math.max(1, Number(rawTime) || 25);
    const hp = Number(rawUnit.HP ?? rawUnit.hp ?? 0);
    const name = (staticData && staticData.name) || resolveUnitName(rawUnit, unitId);
    const internalName = (staticData && (staticData.internalName || staticData.internal_name)) || rawUnit.internal_name || '';

    return Object.freeze({
      id: unitId,
      ID: unitId,
      name: name,
      localizedName: name,
      internalName: internalName,
      internal_name: internalName,
      building: (staticData && staticData.building) || rawUnit.building || '',
      age: (staticData && staticData.age) || rawUnit.age || '',
      icon: icon,
      pictureIndex: pictureIndex,
      iconPath: isTrebuchet ? 'img/Unit/29.png' : (isTractionTrebuchet ? 'img/Unit/428.png' : `img/units/${unitId}.png`),
      unitIcon: isTrebuchet ? 'img/units/331.png' : (isTractionTrebuchet ? 'img/units/428.png' : `img/units/${unitId}.png`),
      fallbackIcon: isTrebuchet ? 'img/Unit/29.png' : (isTractionTrebuchet ? 'img/Unit/428.png' : `img/Unit/${icon}`),
      cost: Object.freeze({
        food,
        wood,
        gold,
        stone
      }),
      Cost: Object.freeze({
        Food: food,
        Wood: wood,
        Gold: gold,
        Stone: stone
      }),
      trainTime,
      TrainTime: trainTime,
      hp,
      raw: rawUnit
    });
  }

  /**
   * Intento automático de inicialización en Node.js mediante fs.readFileSync
   */
  function autoInitNode() {
    if (_isInitialized) return;
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = require('fs');
        const path = require('path');

        // Búsqueda en rutas relativas probables
        const candidateDataPaths = [
          path.resolve(__dirname, 'data/data.json'),
          path.resolve(process.cwd(), 'data/data.json'),
          path.resolve(__dirname, '../data/data.json')
        ];
        const candidateStringPaths = [
          path.resolve(__dirname, 'data/locales/es/strings.json'),
          path.resolve(process.cwd(), 'data/locales/es/strings.json'),
          path.resolve(__dirname, 'data/locales/es.json'),
          path.resolve(process.cwd(), 'data/locales/es.json')
        ];

        let dataJson = null;
        for (const p of candidateDataPaths) {
          if (fs.existsSync(p)) {
            dataJson = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          }
        }

        let stringsJson = null;
        for (const sp of candidateStringPaths) {
          if (fs.existsSync(sp)) {
            stringsJson = JSON.parse(fs.readFileSync(sp, 'utf8'));
            break;
          }
        }

        if (dataJson) {
          initUnitService(dataJson, stringsJson || {});
        }
      } catch (err) {
        // En caso de entorno restringido
      }
    }
  }

  /**
   * Intento automático de inicialización en Navegador si window.state ya está disponible
   */
  function autoInitBrowser() {
    if (_isInitialized) return;
    if (typeof window !== 'undefined' && window.state && window.state.data && window.state.data.data && window.state.data.data.Unit) {
      initUnitService(window.state.data, window.state.strings || {});
    }
  }

  /**
   * Inicializa el servicio con los datasets maestros de data.json y strings.json
   * @param {Object} dataObj - El objeto JSON completo o el subobjeto { data: { Unit: ... } }
   * @param {Object} [stringsObj={}] - Diccionario de textos en español (LanguageNameId -> string)
   */
  function initUnitService(dataObj, stringsObj = {}) {
    if (!dataObj) return false;

    _rawUnits = dataObj.data?.Unit || dataObj.Unit || dataObj;
    _rawStrings = stringsObj || {};
    _unitsCache.clear();

    if (_rawUnits && typeof _rawUnits === 'object') {
      for (const [idStr, u] of Object.entries(_rawUnits)) {
        const id = Number(idStr);
        if (!isNaN(id)) {
          _unitsCache.set(id, normalizeUnitData(id, u));
        }
      }
      _isInitialized = true;
      return true;
    }

    return false;
  }

  /**
   * Extrae el ID numérico de una unidad o valor dado
   */
  function extractUnitId(unitOrId) {
    if (typeof unitOrId === 'number') return unitOrId;
    if (typeof unitOrId === 'string') {
      const parsed = parseInt(unitOrId, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (unitOrId && typeof unitOrId === 'object') {
      const id = unitOrId.id ?? unitOrId.ID;
      if (typeof id === 'number') return id;
      if (typeof id === 'string') return parseInt(id, 10) || 0;
    }
    return 0;
  }

  /**
   * Asegura que el servicio esté inicializado antes de responder consultas
   */
  function ensureReady() {
    if (!_isInitialized) {
      autoInitNode();
      if (!_isInitialized) {
        autoInitBrowser();
      }
    }
  }

  /**
   * Obtiene la estructura canónica completa de una unidad por ID
   * @param {number|string|Object} unitOrId - ID o descriptor de la unidad
   * @returns {Object} Unidad normalizada con { id, name, cost, Cost, trainTime, TrainTime, hp, raw }
   */
  function getBaseUnitData(unitOrId) {
    ensureReady();
    const id = extractUnitId(unitOrId);
    if (!id) {
      return normalizeUnitData(0, null);
    }

    if (_unitsCache.has(id)) {
      return _unitsCache.get(id);
    }

    // Si aún no está en cache pero _rawUnits está disponible
    if (_rawUnits && _rawUnits[id]) {
      const normalized = normalizeUnitData(id, _rawUnits[id]);
      _unitsCache.set(id, normalized);
      return normalized;
    }

    // Si el objeto pasado ya contiene datos de coste/tiempo válidos, normalizarlos
    if (unitOrId && typeof unitOrId === 'object' && (unitOrId.cost || unitOrId.Cost || unitOrId.TrainTime || unitOrId.trainTime)) {
      return normalizeUnitData(id, unitOrId);
    }

    return normalizeUnitData(id, null);
  }

  /**
   * Obtiene los costes base { food, wood, gold, stone } garantizados de una unidad
   * @param {number|string|Object} unitOrId
   * @returns {{ food: number, wood: number, gold: number, stone: number }}
   */
  function getUnitBaseCost(unitOrId) {
    const data = getBaseUnitData(unitOrId);
    return data.cost;
  }

  /**
   * Obtiene el tiempo base de entrenamiento en segundos de una unidad
   * @param {number|string|Object} unitOrId
   * @returns {number}
   */
  function getUnitBaseTrainTime(unitOrId) {
    const data = getBaseUnitData(unitOrId);
    return data.trainTime;
  }

  /**
   * Devuelve un array con todas las unidades registradas canónicamente
   * @returns {Array<Object>}
   */
  function getAllUnits() {
    ensureReady();
    return Array.from(_unitsCache.values());
  }

  /**
   * Verifica si una unidad está registrada en el dataset canónico
   * @param {number|string|Object} unitOrId
   * @returns {boolean}
   */
  function hasUnit(unitOrId) {
    ensureReady();
    const id = extractUnitId(unitOrId);
    if (getStaticUnitData(id)) return true;
    return _unitsCache.has(id) || (_rawUnits !== null && !!_rawUnits[id]);
  }

  /**
   * Consulta si el servicio está debidamente inicializado con datos maestros
   * @returns {boolean}
   */
  function isUnitServiceReady() {
    ensureReady();
    return _isInitialized;
  }

  /**
   * Resuelve los datos de icono oficiales para una unidad.
   * Trebuchet (#331 y #42): utiliza de forma estricta 29.png y 331.png, evitando 42.png (Mangudai).
   * @param {number|string|Object} unitOrId
   * @returns {{ icon: string, pictureIndex: number|null, src: string, fallback: string }}
   */
  function resolveUnitIcon(unitOrId) {
    const id = extractUnitId(unitOrId);
    if (id === 42 || id === 331) {
      return {
        icon: '29.png',
        pictureIndex: 29,
        src: 'img/units/331.png',
        fallback: 'img/Unit/29.png'
      };
    }
    if (id === 1800 || id === 1942) {
      return {
        icon: '428.png',
        pictureIndex: 428,
        src: 'img/units/428.png',
        fallback: 'img/Unit/428.png'
      };
    }
    return {
      icon: `${id}.png`,
      pictureIndex: null,
      src: `img/units/${id}.png`,
      fallback: `img/Unit/${id}.png`
    };
  }

  // Ejecución inicial automática
  ensureReady();

  return {
    initUnitService,
    getBaseUnitData,
    getUnitBaseCost,
    getUnitBaseTrainTime,
    getAllUnits,
    hasUnit,
    extractUnitId,
    resolveUnitIcon,
    isUnitServiceReady
  };
});
