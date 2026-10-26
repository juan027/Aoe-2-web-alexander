/**
 * buildingUpgrades.js - Mapeo estricto de tecnologías por tipo de edificio
 * Vinculación dinámica de tecnologías aplicables a estructuras AoE2
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.BUILDING_APPLICABLE_TECHS = exports.BUILDING_APPLICABLE_TECHS;
    global.getBuildingTechList = exports.getBuildingTechList;
    global.AoE2BuildingUpgrades = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Mapeo estricto de tecnologías por tipo de edificio
  const BUILDING_APPLICABLE_TECHS = {
    // Granjas: Exclusivamente línea de agricultura
    farm: [14, 13, 12], // Collerón (14), Arado pesado (13), Rotación de cultivos (12)

    // Pasturas (Khitan): Exclusivamente línea de pastoreo
    pasture: ["domestication", "pastoralism", "transhumance"],

    // Defensivos con ataque (Castillo, Torres, Donjon, Krepost, Centro Urbano)
    defensive_ranged: [
      199, 200, 201, // Flecha emplumada, Punta de flecha, Braserío
      93,            // Balística
      47,            // Química
      322,           // Matacanes
      234,           // Saeteras (Arrowslits)
      923,           // Torres esvanas (Svan Towers - Georgianos)
      50, 51, 379    // Albañilería, Arquitectura, Grúa
    ],

    // Estructuras militares y civiles pasivas (Cuartel, Establo, Casa, etc.)
    passive_structural: [
      50,  // Albañilería (+10% HP, +1/+1 armadura)
      51,  // Arquitectura (+10% HP, +1/+1 armadura)
      379, // Grúa (+20% velocidad de construcción)
      65   // Leva / Conscripción (en cuartel, arquería, establo, taller)
    ],

    // Muelle y Puerto
    dock: [
      373, // Carenado
      374, // Dique seco
      65,  // Constructor naval
      50,  // Albañilería
      923  // Torres esvanas (Svan Towers - Georgianos)
    ]
  };

  function getBuildingTechList(buildingKey) {
    const norm = (buildingKey || "").toLowerCase().trim();

    if (["granja", "farm"].includes(norm)) return BUILDING_APPLICABLE_TECHS.farm;
    if (["pasturas", "pastura", "pasture"].includes(norm)) return BUILDING_APPLICABLE_TECHS.pasture;
    if (["muelle", "dock", "puerto", "harbor"].includes(norm)) return BUILDING_APPLICABLE_TECHS.dock;
    
    if (["castillo", "castle", "torre", "tower", "keep", "homenaje", "bombard_tower", "centro urbano", "town_center", "donjon", "krepost", "fortified_church", "iglesia_fortificada", "fortcrch"].some(k => norm.includes(k))) {
      return BUILDING_APPLICABLE_TECHS.defensive_ranged;
    }

    return BUILDING_APPLICABLE_TECHS.passive_structural;
  }

  return {
    BUILDING_APPLICABLE_TECHS,
    getBuildingTechList
  };
});
