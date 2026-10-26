/**
 * data/techs.js
 * Catálogo Canónico de Tecnologías Específicas y Regionales para Age of Empires II: DE.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.PASTURE_TECHS_DATA = exports.PASTURE_TECHS_DATA;
    global.PASTURE_TECHS = exports.PASTURE_TECHS;
    global.dataTechs = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const PASTURE_TECHS_DATA = {
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
  };

  const PASTURE_TECHS = {
    domestication: PASTURE_TECHS_DATA[138],
    pastoralism: PASTURE_TECHS_DATA[137],
    transhumance: PASTURE_TECHS_DATA[136],
    138: PASTURE_TECHS_DATA[138],
    137: PASTURE_TECHS_DATA[137],
    136: PASTURE_TECHS_DATA[136],
    // Compatibilidad retroactiva
    1950: PASTURE_TECHS_DATA[138],
    1951: PASTURE_TECHS_DATA[137],
    1952: PASTURE_TECHS_DATA[136]
  };

  return {
    PASTURE_TECHS_DATA,
    PASTURE_TECHS
  };
});
