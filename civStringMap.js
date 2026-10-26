/**
 * CIV_STRING_MAP
 * Mapeo de identificadores de civilización a IDs de strings de descripción oficial en strings.json.
 */
(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.CIV_STRING_MAP = exports.CIV_STRING_MAP;
    global.civStringMap = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const CIV_STRING_MAP = {
    britons: "120150",
    franks: "120151",
    goths: "120152",
    teutons: "120153",
    japanese: "120154",
    chinese: "120155",
    byzantines: "120156",
    persians: "120157",
    saracens: "120158",
    turks: "120159",
    vikings: "120160",
    mongols: "120161",
    celts: "120162",
    spanish: "120163",
    aztecs: "120164",
    mayans: "120165",
    huns: "120166",
    koreans: "120167",
    italians: "120168",
    hindustanis: "120169",
    incas: "120170",
    magyars: "120171",
    slavs: "120172",
    portuguese: "120173",
    ethiopians: "120174",
    malians: "120175",
    berbers: "120176",
    khmer: "120177",
    malay: "120178",
    burmese: "120179",
    vietnamese: "120180",
    bulgarians: "120181",
    tatars: "120182",
    cumans: "120183",
    lithuanians: "120184",
    burgundians: "120185",
    sicilians: "120186",
    poles: "120187",
    bohemians: "120188",
    dravidians: "120189",
    bengalis: "120190",
    gurjaras: "120191",
    romans: "120192",
    armenians: "120193",
    georgians: "120194",
    // Mod / Tres Reinos y América
    shu: "120198",
    wu: "120199",
    wei: "120200",
    jurchen: "120201",
    jurchens: "120201",
    khitans: "120202",
    muiscas: "120206",
    muisca: "120206",
    mapuche: "120207",
    tupi: "120208",
    saxons: "120209",
    sajones: "120209",
    varangians: "120210",
    varegos: "120210",
    danes: "120211",
    daneses: "120211"
  };

  return { CIV_STRING_MAP };
});
