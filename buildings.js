/**
 * BUILDINGS.JS - Base de Datos Arquitectónica y Registro Maestro de Edificios AoE2
 * Diseñado bajo la arquitectura de datos de Age of Empires II y AoE Database.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.BUILDING_REGISTRY = exports.BUILDING_REGISTRY;
    global.BUILDING_CATEGORIES = exports.BUILDING_CATEGORIES;
    global.CIV_BUILDING_AVAILABILITY = exports.CIV_BUILDING_AVAILABILITY;
    global.SPECIAL_REPLACEMENTS = exports.SPECIAL_REPLACEMENTS;
    global.BUILDING_BONUSES = exports.BUILDING_BONUSES;
    global.BUILDING_AGE_SCALING = exports.BUILDING_AGE_SCALING;
    global.VILLAGER_BUILD_ICONS = exports.VILLAGER_BUILD_ICONS;
    global.getBuildingIcon = exports.getBuildingIcon;
    global.getBuildingImageInfo = exports.getBuildingImageInfo;
    global.getBuildingByKey = exports.getBuildingByKey;
    global.getAllBuildings = exports.getAllBuildings;
    global.getBuildingsByCategory = exports.getBuildingsByCategory;
    global.getBuildingAvailability = exports.getBuildingAvailability;
    global.getBuildingBonuses = exports.getBuildingBonuses;
    global.getBuildingApplicableTechs = exports.getBuildingApplicableTechs;
    global.AoE2Buildings = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const BUILDING_CATEGORIES = {
    all: 'Todos',
    military: 'Militar',
    economic: 'Económico',
    defensive: 'Defensivo',
    religious_academic: 'Religioso / Académico'
  };

  // Objeto de reemplazos especiales vaciado: todas las estructuras no disponibles se tratan de forma estándar (available: false)
  const SPECIAL_REPLACEMENTS = {};

  // buildings.js - Mapeo canónico de iconos locales (img/Building/{filename})
  const VILLAGER_BUILD_ICONS = {
    // --- EDIFICIOS MILITARES Y PRODUCCIÓN ---
    "cuartel": "2.png",                        // Dos espadas cruzadas
    "barracks": "2.png",
    12: "2.png",

    "galería de tiro con arco": "0.png",       // Arco con flecha
    "galeria de tiro con arco": "0.png",
    "archery_range": "0.png",
    87: "0.png",

    "establo": "23.png",                       // Herradura
    "stable": "23.png",
    101: "23.png",

    "taller de maquinaria de asedio": "22.png",// Engranajes
    "taller de asedio": "22.png",
    "siege_workshop": "22.png",
    49: "22.png",

    "castillo": "7.png",                       // Castillo de piedra
    "castle": "7.png",
    82: "7.png",

    "krepost": "55.png",                       // Fortaleza de piedra (ID local 55)
    1251: "55.png",

    "donjon": "84.png",                        // Torre fortificada normanda (ID local 84)
    1665: "84.png",

    // --- DEFENSIVOS Y FORTIFICACIONES ---
    "torre de guardia": "79.png",
    "watch_tower": "79.png",
    79: "79.png",

    "torre de vigilancia": "26.png",
    "guard_tower": "26.png",
    234: "26.png",

    "torre del homenaje": "27.png",
    "keep": "27.png",
    235: "27.png",

    "torre de bombardeo": "38.png",
    "bombard_tower": "38.png",
    236: "38.png",

    "avanzada": "598.png",
    "puesto de avanzada": "598.png",
    "outpost": "598.png",
    598: "598.png",

    "muro de empalizada": "30.png",
    "palisade_wall": "30.png",
    72: "30.png",

    "puerta de empalizada": "36.png",
    "portón de madera": "36.png",
    "porton de madera": "36.png",
    "palisade_gate": "36.png",
    659: "36.png",
    792: "36.png",

    "muro de piedra": "31.png",
    "stone_wall": "31.png",
    117: "31.png",

    "muralla fortificada": "32.png",
    "fortified_wall": "32.png",
    155: "32.png",

    "puerta": "44.png",
    "puerta de piedra": "44.png",
    "gate": "44.png",
    487: "44.png",

    // --- ECONÓMICOS, GANADO Y LOGÍSTICA ---
    "pasturas": "96.png",                      // Prado con ganado vacuno
    "pastura": "96.png",
    "pasture": "96.png",
    "pastizal": "96.png",
    1889: "96.png",

    "casa": "34.png",                          // Cabaña
    "house": "34.png",
    70: "34.png",

    "molino": "19.png",                        // Molino de viento
    "mill": "19.png",
    68: "19.png",

    "folwark": "86.png",                       // Gavilla de trigo con horquilla
    1734: "86.png",

    "granja": "35.png",                        // Terreno de cultivo
    "farm": "35.png",
    50: "35.png",

    "campamento maderero": "40.png",           // Hacha
    "lumber_camp": "40.png",
    562: "40.png",

    "campamento minero": "39.png",             // Pico
    "mining_camp": "39.png",
    584: "39.png",

    "muelle": "13.png",                        // Ancla clásica
    "dock": "13.png",
    45: "13.png",

    "puerto": "56.png",                        // Ancla marítima reforzada
    "harbor": "56.png",
    1189: "56.png",

    "trampa para peces": "41.png",             // Red en el agua
    "fish_trap": "41.png",
    199: "41.png",

    // Centro Urbano (TC) -> 109.png
    "centro urbano": "109.png",
    "centro urbano (feudal)": "109.png",
    "town_center": "109.png",
    "town center": "109.png",
    "town_center_feudal": "109.png",
    109: "109.png",
    71: "109.png",

    "asentamiento": "98.png",                  // Estructura sudamericana unificada
    "settlement": "98.png",
    2556: "98.png",

    // --- DESARROLLO, RELIGIÓN Y COMERCIO ---
    // Herrería -> 4.png (bloques de metal / yunque)
    "herrería": "4.png",
    "herreria": "4.png",
    "blacksmith": "4.png",
    103: "4.png",

    "mercado": "16.png",                       // Balanza comercial
    "market": "16.png",
    84: "16.png",

    // Caravansarai -> 87.png
    "caravansarai": "87.png",
    "caravanserai": "87.png",
    "caravasar": "87.png",
    1754: "87.png",

    "monasterio": "10.png",                    // Manos en plegaria
    "monastery": "10.png",
    104: "10.png",
    30: "10.png",

    // Iglesia Fortificada -> 88.png
    "iglesia fortificada": "88.png",
    "fortified_church": "88.png",
    "fortified church": "88.png",
    1805: "88.png",
    1806: "88.png",

    "universidad": "33.png",                   // Libro rojo abierto
    "university": "33.png",
    209: "33.png",

    // Maravilla -> 37.png
    "maravilla": "37.png",
    "wonder": "37.png",
    276: "37.png",

    "feitoria": "107.png",
    "factoría": "107.png",
    "factoria": "107.png",
    1021: "107.png",

    // Carro de Mulas -> 89.png
    "carro de mulas": "89.png",
    "carreta de mulas": "89.png",
    "carro_mulas": "89.png",
    "mule cart": "89.png",
    "mule_cart": "89.png",
    1808: "89.png" // ID estándar Mule Cart
  };

  // Resuelve la imagen utilizando prioritariamente VILLAGER_BUILD_ICONS
  function getBuildingIcon(building) {
    if (!building) return "assets/icons/building_placeholder.svg";

    // Si se pasa un string o número (id o key), buscar el objeto en BUILDING_REGISTRY o state.data
    let bObj = building;
    if (typeof building === 'string' || typeof building === 'number') {
      if (typeof getBuildingByKey === 'function') {
        bObj = getBuildingByKey(building);
      } else if (typeof BUILDING_REGISTRY !== 'undefined') {
        bObj = BUILDING_REGISTRY[building];
      }
      if (!bObj && typeof window !== 'undefined' && window.state?.data?.data?.Building?.[building]) {
        bObj = window.state.data.data.Building[building];
      }
    }

    const norm = (t) => String(t || '').toLowerCase().trim();
    const strip = (t) => norm(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Búsqueda por ID numérico en VILLAGER_BUILD_ICONS
    const bId = bObj?.id !== undefined ? bObj.id : (bObj?.ID !== undefined ? bObj.ID : (typeof building === 'number' ? building : null));
    if (bId !== null && bId !== undefined && VILLAGER_BUILD_ICONS[bId]) {
      return `img/Building/${VILLAGER_BUILD_ICONS[bId]}`;
    }

    // 2. Búsqueda por key interna en VILLAGER_BUILD_ICONS
    const bKey = norm(bObj?.key || (typeof building === 'string' ? building : ''));
    if (bKey && VILLAGER_BUILD_ICONS[bKey]) {
      return `img/Building/${VILLAGER_BUILD_ICONS[bKey]}`;
    }

    // 3. Búsqueda por nombre en español o internal_name
    const rawName = norm(bObj?.name || bObj?.internal_name);
    if (rawName && VILLAGER_BUILD_ICONS[rawName]) {
      return `img/Building/${VILLAGER_BUILD_ICONS[rawName]}`;
    }

    // 4. Búsqueda sin acentos/tildes
    const cleanName = strip(rawName);
    const hit = Object.keys(VILLAGER_BUILD_ICONS).find(k => strip(k) === cleanName);
    if (hit) {
      return `img/Building/${VILLAGER_BUILD_ICONS[hit]}`;
    }

    // 5. Por IconID nativo del motor Genie si viene definido
    const iconId = bObj?.IconID !== undefined 
      ? bObj.IconID 
      : (bObj?.icon !== undefined ? bObj.icon : bObj?.GraphicID);
    if (iconId !== undefined && iconId !== null && iconId !== "") {
      return `img/Building/${iconId}.png`;
    }

    // 6. Fallback para asentamiento / settlement
    if (cleanName.includes("asentamiento") || cleanName.includes("settlement")) {
      return "img/Building/98.png";
    }

    return "assets/icons/building_placeholder.svg";
  }

  const BUILDING_REGISTRY = {
  "barracks": {
    "id": 12,
    "IconID": 88,
    "key": "barracks",
    "name": "Cuartel",
    "internal_name": "Barracks Age1",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar",
    "baseHp": 1200,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 175,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 50,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir cuarteles () Se utiliza para entrenar y mejorar unidades de infantería. Se necesita para la galería de tiro con arco y el establo. Mejoras: velocidad de producción (castillo); campo de visión (centro urbano); puntos de resistencia, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 74,
        "name": "Milicia",
        "age": 1,
        "cost": {
          "Food": 50,
          "Gold": 20
        }
      },
      {
        "id": 75,
        "name": "Hombre de armas",
        "age": 1,
        "cost": {
          "Food": 50,
          "Gold": 20
        }
      },
      {
        "id": 77,
        "name": "Soldado con espada larga",
        "age": 1,
        "cost": {
          "Food": 50,
          "Gold": 20
        }
      },
      {
        "id": 473,
        "name": "Espadachín de mandoble",
        "age": 1,
        "cost": {
          "Food": 50,
          "Gold": 20
        }
      },
      {
        "id": 567,
        "name": "Campeón",
        "age": 1,
        "cost": {
          "Food": 50,
          "Gold": 20
        }
      },
      {
        "id": 93,
        "name": "Lancero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      },
      {
        "id": 358,
        "name": "Piquero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      },
      {
        "id": 359,
        "name": "Alabardero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      }
    ],
    "techs": [
      {
        "id": 602,
        "name": "Incendiarismo",
        "cost": {
          "Food": 75,
          "Gold": 25
        }
      },
      {
        "id": 875,
        "name": "Gambesones",
        "cost": {
          "Food": 50,
          "Gold": 100
        }
      },
      {
        "id": 215,
        "name": "Escuderos",
        "cost": {
          "Food": 100
        }
      }
    ]
  },
  "dock": {
    "id": 45,
    "IconID": 56,
    "key": "dock",
    "name": "Muelle",
    "internal_name": "DOCK",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar / Naval",
    "baseHp": 1800,
    "baseAttack": 3,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 16,
        "Amount": 0,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      },
      {
        "Class": 3,
        "Amount": 3,
        "Name": "Antiproyectil (Pierce)"
      }
    ],
    "baseRange": 6,
    "minRange": 1,
    "los": 8,
    "reloadTime": 3,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 5,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 150,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 35,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir muelle () Sirve para entrenar y mejorar barcos, depositar comida de los buques de pesca y comerciar con otros jugadores por mar. Mejoras: campo de visión (centro urbano); ataque (herrero); ataque, PR, armadura, precisión, ataque a barcos (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 13,
        "name": "Pesquero",
        "age": 1,
        "cost": {
          "Wood": 75
        }
      },
      {
        "id": 545,
        "name": "Barco de transporte",
        "age": 1,
        "cost": {
          "Wood": 125
        }
      },
      {
        "id": 1103,
        "name": "Galera incendiaria",
        "age": 1,
        "cost": {
          "Gold": 45,
          "Wood": 75
        }
      },
      {
        "id": 529,
        "name": "Barco incendiario",
        "age": 1,
        "cost": {
          "Gold": 45,
          "Wood": 75
        }
      },
      {
        "id": 532,
        "name": "Barco incendiario rápido",
        "age": 1,
        "cost": {
          "Gold": 45,
          "Wood": 75
        }
      },
      {
        "id": 539,
        "name": "Galera",
        "age": 1,
        "cost": {
          "Gold": 30,
          "Wood": 90
        }
      },
      {
        "id": 21,
        "name": "Galera de guerra",
        "age": 1,
        "cost": {
          "Gold": 30,
          "Wood": 90
        }
      },
      {
        "id": 442,
        "name": "Galeón",
        "age": 1,
        "cost": {
          "Gold": 30,
          "Wood": 90
        }
      },
      {
        "id": 2626,
        "name": "Urca",
        "age": 1,
        "cost": {
          "Gold": 35,
          "Wood": 75
        }
      },
      {
        "id": 2627,
        "name": "Urca de guerra",
        "age": 1,
        "cost": {
          "Gold": 35,
          "Wood": 75
        }
      },
      {
        "id": 2628,
        "name": "Carracas",
        "age": 1,
        "cost": {
          "Gold": 35,
          "Wood": 75
        }
      },
      {
        "id": 1104,
        "name": "Balsa de demolición",
        "age": 1,
        "cost": {
          "Gold": 80,
          "Wood": 45
        }
      },
      {
        "id": 527,
        "name": "Buque de demolición",
        "age": 1,
        "cost": {
          "Gold": 80,
          "Wood": 45
        }
      },
      {
        "id": 528,
        "name": "Buque de dem. pesado",
        "age": 1,
        "cost": {
          "Gold": 80,
          "Wood": 45
        }
      },
      {
        "id": 17,
        "name": "Barca mercante",
        "age": 1,
        "cost": {
          "Gold": 50,
          "Wood": 100
        }
      },
      {
        "id": 420,
        "name": "Galeón artillado",
        "age": 1,
        "cost": {
          "Gold": 150,
          "Wood": 200
        }
      },
      {
        "id": 691,
        "name": "Galeón artillado de élite",
        "age": 1,
        "cost": {
          "Gold": 150,
          "Wood": 200
        }
      }
    ],
    "techs": [
      {
        "id": 199,
    "IconID": 41,
        "name": "Emplumado de flechas",
        "cost": {
          "Food": 100,
          "Gold": 50
        }
      },
      {
        "id": 906,
        "name": "Hilo de pesca",
        "cost": {
          "Food": 50,
          "Wood": 100
        }
      },
      {
        "id": 65,
        "name": "Red agallera",
        "cost": {
          "Food": 100,
          "Wood": 125
        }
      },
      {
        "id": 34,
        "name": "Barcos de guerra medianos",
        "cost": {
          "Gold": 100,
          "Wood": 150
        }
      },
      {
        "id": 35,
        "name": "Barcos de guerra pesados",
        "cost": {
          "Gold": 315,
          "Wood": 400
        }
      },
      {
        "id": 691,
        "name": "Fuertes en las colinas",
        "cost": {
          "Food": 250,
          "Gold": 250
        }
      },
      {
        "id": 831,
        "name": "Cuerpo de médicos",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      },
      {
        "id": 832,
        "name": "Acero wootz",
        "cost": {
          "Food": 650,
          "Gold": 550
        }
      },
      {
        "id": 1006,
        "name": "Armadura laminada",
        "cost": {
          "Food": 450,
          "Gold": 300
        }
      }
    ]
  },
  "siege_workshop": {
    "id": 49,
    "IconID": 89,
    "key": "siege_workshop",
    "name": "Taller de maquinaria de asedio",
    "internal_name": "SIWS",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar",
    "baseHp": 1500,
    "baseAttack": 0,
    "meleeArmor": 1,
    "pierceArmor": 8,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 8,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 200,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 40,
    "development": {
      "requiredBuilding": "Herrería",
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir taller de maquinaria de asedio () Sirve para construir y mejorar armas de asedio. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 1258,
        "name": "Ariete",
        "age": 1,
        "cost": {
          "Gold": 75,
          "Wood": 160
        }
      },
      {
        "id": 422,
        "name": "Ariete cubierto",
        "age": 1,
        "cost": {
          "Gold": 75,
          "Wood": 160
        }
      },
      {
        "id": 548,
        "name": "Ariete de asedio",
        "age": 1,
        "cost": {
          "Gold": 75,
          "Wood": 160
        }
      },
      {
        "id": 280,
        "name": "Mangana",
        "age": 1,
        "cost": {
          "Gold": 135,
          "Wood": 160
        }
      },
      {
        "id": 550,
        "name": "Onagro",
        "age": 1,
        "cost": {
          "Gold": 135,
          "Wood": 160
        }
      },
      {
        "id": 588,
        "name": "Onagro de asedio",
        "age": 1,
        "cost": {
          "Gold": 135,
          "Wood": 160
        }
      },
      {
        "id": 279,
        "name": "Escorpión",
        "age": 1,
        "cost": {
          "Gold": 75,
          "Wood": 75
        }
      },
      {
        "id": 542,
        "name": "Escorpión pesado",
        "age": 1,
        "cost": {
          "Gold": 75,
          "Wood": 75
        }
      },
      {
        "id": 1105,
        "name": "Torre de asedio",
        "age": 1,
        "cost": {
          "Gold": 120,
          "Wood": 100
        }
      },
      {
        "id": 36,
        "name": "Cañón de asedio",
        "age": 1,
        "cost": {
          "Gold": 225,
          "Wood": 225
        }
      }
    ],
    "techs": []
  },
  "farm": {
    "id": 50,
    "IconID": 35,
    "key": "farm",
    "name": "Granja",
    "internal_name": "FARM",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 480,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 0,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 0,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 1,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 60,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 15,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir granja () Fuente de comida renovable. Produce una cantidad limitada de comida hasta que se agota; luego debe reconstruirse. Una granja la trabaja un solo aldeano. Puedes cultivar granjas enemigas abandonadas. Los monjes enemigos no pueden convertirla. Mejoras: comida (molino).",
    "units": [],
    "techs": []
  },
  "mill": {
    "id": 68,
    "IconID": 19,
    "key": "mill",
    "name": "Molino",
    "internal_name": "MILL",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 600,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 100,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 35,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir molino () Sirve para depositar comida e investigar tecnologías agrícolas. Constrúyelo cerca de arbustos de recolección u otra fuente de comida para recoger comida más rápido. Se necesita para la granja y el mercado. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 14,
        "name": "Collera",
        "cost": {
          "Food": 75,
          "Wood": 75
        }
      },
      {
        "id": 13,
        "name": "Arado pesado",
        "cost": {
          "Food": 125,
          "Wood": 125
        }
      },
      {
        "id": 12,
        "name": "Rotación de cultivos",
        "cost": {
          "Food": 250,
          "Wood": 250
        }
      },
      {
        "id": 1014,
        "name": "Domesticación",
        "cost": {
          "Food": 50,
          "Wood": 100
        }
      },
      {
        "id": 1013,
        "name": "Pastoreo",
        "cost": {
          "Food": 100,
          "Wood": 150
        }
      },
      {
        "id": 1012,
        "name": "Trashumancia",
        "cost": {
          "Food": 175,
          "Wood": 325
        }
      }
    ]
  },
  "house": {
    "id": 70,
    "IconID": 34,
    "key": "house",
    "name": "Casa",
    "internal_name": "HOUS",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 550,
    "baseAttack": 0,
    "meleeArmor": -2,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": -2,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      },
      {
        "Class": 40,
        "Amount": 0,
        "Name": "Clase 40"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 2,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 5,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 25,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 25,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir casa () Cada una proporciona 5 habitantes. Tu población actual/admitida aparece en la parte superior de la pantalla. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": []
  },
  "town_center_feudal": {
    "id": 71,
    "IconID": 109,
    "key": "town_center_feudal",
    "name": "Centro urbano (Feudal)",
    "internal_name": "RTWC2",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico / Cívico",
    "baseHp": 2400,
    "baseAttack": 5,
    "meleeArmor": 4,
    "pierceArmor": 6,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 4,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 6,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 4,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 3,
        "Amount": 5,
        "Name": "Antiproyectil (Pierce)"
      }
    ],
    "baseRange": 6,
    "minRange": 0,
    "los": 8,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 15,
    "population": 5,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 275,
      "Food": 0,
      "Gold": 0,
      "Stone": 100
    },
    "buildTime": 100,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir centro urbano () Sirve para entrenar aldeanos, depositar recursos, avanzar a la siguiente edad e investigar tecnologías. Las unidades pueden guarnecerse en su interior para protegerse. Los soldados a distancia y los aldeanos proporcionan proyectiles adicionales. Brinda 5 de población. Los monjes enemigos no pueden convertirlo. Mejoras: campo de visión (centro urbano); PR, armadura, precisión (universidad); ataque (herrero).",
    "units": [],
    "techs": []
  },
  "palisade_wall": {
    "id": 72,
    "IconID": 30,
    "key": "palisade_wall",
    "name": "Muro de empalizada",
    "internal_name": "WALL",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 150,
    "baseAttack": 0,
    "meleeArmor": 2,
    "pierceArmor": 5,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 2,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 5,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 22,
        "Amount": 0,
        "Name": "Clase 22"
      },
      {
        "Class": 31,
        "Amount": 2,
        "Name": "Condottiero"
      },
      {
        "Class": 40,
        "Amount": 0,
        "Name": "Clase 40"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 2,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 3,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 7,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": "Muro de piedra"
    },
    "description": "Construir empalizada () Muro barato de madera fácil de construir. Ralentiza a tus enemigos y te advierte de su avance. Los monjes enemigos no pueden convertirla.",
    "units": [],
    "techs": []
  },
  "watch_tower": {
    "id": 79,
    "IconID": 79,
    "key": "watch_tower",
    "name": "Torre de guardia",
    "internal_name": "WCTW",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 850,
    "baseAttack": 5,
    "meleeArmor": 1,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 27,
        "Amount": 2,
        "Name": "Piqueros / Lanceros"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Edificios generales"
      },
      {
        "Class": 16,
        "Amount": 5,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 5,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      }
    ],
    "baseRange": 8,
    "minRange": 1,
    "los": 10,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 5,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 35,
      "Food": 0,
      "Gold": 0,
      "Stone": 125
    },
    "buildTime": 80,
    "development": {
      "requiredBuilding": "Cuartel",
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": "Torre de vigilancia"
    },
    "description": "Construir atalaya () Torre con ataque a distancia. Las unidades pueden guarecerse en su interior para protegerse. Los soldados a distancia y los aldeanos disparan proyectiles adicionales. Fuerte contra soldados a distancia. Débil contra unidades a corta distancia, especialmente arietes. Mejoras: campo de visión (centro urbano); ataque, alcance (herrero); ataque, PR, armadura, ataque a barcos, a torre de guardia (universidad).",
    "units": [],
    "techs": []
  },
  "castle": {
    "id": 82,
    "IconID": 7,
    "key": "castle",
    "name": "Castillo",
    "internal_name": "CSTL",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar / Defensivo",
    "baseHp": 4800,
    "baseAttack": 11,
    "meleeArmor": 8,
    "pierceArmor": 11,
    "buildingArmor": 8,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 26,
        "Amount": 0,
        "Name": "Castillos"
      },
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 8,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 8,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 11,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 8,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 27,
        "Amount": 2,
        "Name": "Piqueros / Lanceros"
      },
      {
        "Class": 16,
        "Amount": 0,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 11,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 17,
        "Amount": 0,
        "Name": "Arietes"
      },
      {
        "Class": 30,
        "Amount": 0,
        "Name": "Camellos"
      },
      {
        "Class": 1,
        "Amount": 0,
        "Name": "Infantería"
      }
    ],
    "baseRange": 8,
    "minRange": 1,
    "los": 11,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 4,
    "projectileSpeed": 7,
    "garrisonCapacity": 20,
    "population": 20,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 0,
      "Stone": 650
    },
    "buildTime": 200,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir castillo () Sirve para entrenar y mejorar a tus unidades únicas, construir trebuchets e investigar tecnologías. Ataca a los enemigos dentro del alcance de forma automática. Las unidades pueden guarnecerse en su interior para protegerse. Los soldados a distancia y los aldeanos proporcionan proyectiles adicionales. Otorga 20 de población. Los monjes enemigos no pueden convertirlo. Mejoras: campo de visión (centro urbano); ataque, alcance (herrero); ataque, PR, armadura, precisión, ataque a barcos (universidad); velocidad de producción (castillo).",
    "units": [
      {
        "id": 440,
        "name": "Petardo",
        "age": 1,
        "cost": {
          "Food": 65,
          "Gold": 20
        }
      },
      {
        "id": 331,
        "name": "Lanzapiedras",
        "age": 1,
        "cost": {
          "Gold": 200,
          "Wood": 200
        }
      }
    ],
    "techs": [
      {
        "id": 922,
        "name": "Flota cilicia",
        "cost": {
          "Gold": 300,
          "Wood": 350
        }
      },
      {
        "id": 921,
        "name": "Relicario",
        "cost": {
          "Food": 550,
          "Gold": 400
        }
      },
      {
        "id": 379,
        "name": "Ladronera",
        "cost": {
          "Food": 400,
          "Wood": 400
        }
      },
      {
        "id": 315,
        "name": "Leva",
        "cost": {
          "Food": 150,
          "Gold": 150
        }
      },
      {
        "id": 321,
        "name": "Zapadores",
        "cost": {
          "Food": 400,
          "Wood": 200
        }
      },
      {
        "id": 408,
        "name": "Espionaje y traición",
        "cost": {
          "Gold": 200
        }
      },
      {
        "id": 460,
        "name": "Átlatl",
        "cost": {
          "Food": 400,
          "Gold": 350
        }
      },
      {
        "id": 24,
        "name": "Guerras Floridas",
        "cost": {
          "Food": 450,
          "Gold": 750
        }
      },
      {
        "id": 833,
        "name": "Paiks",
        "cost": {
          "Gold": 275,
          "Wood": 375
        }
      },
      {
        "id": 834,
        "name": "Mahāyāna",
        "cost": {
          "Gold": 650,
          "Wood": 800
        }
      },
      {
        "id": 1007,
        "name": "Caballería ordo",
        "cost": {
          "Food": 600,
          "Gold": 300
        }
      },
      {
        "id": 578,
        "name": "Alcazabas",
        "cost": {
          "Food": 250,
          "Gold": 250
        }
      },
      {
        "id": 579,
        "name": "Camellos magrebíes",
        "cost": {
          "Food": 700,
          "Gold": 300
        }
      },
      {
        "id": 784,
        "name": "Tácticas de fuerte de carretas",
        "cost": {
          "Food": 300,
          "Gold": 300
        }
      },
      {
        "id": 785,
        "name": "Reformas husitas",
        "cost": {
          "Food": 500,
          "Gold": 450
        }
      },
      {
        "id": 8,
        "name": "Guardia urbana",
        "cost": {
          "Food": 75
        }
      },
      {
        "id": 3,
        "name": "Yeomen",
        "cost": {
          "Gold": 450,
          "Wood": 750
        }
      },
      {
        "id": 461,
        "name": "Warwolf",
        "cost": {
          "Gold": 400,
          "Wood": 800
        }
      },
      {
        "id": 685,
        "name": "Estribos",
        "cost": {
          "Food": 400,
          "Gold": 200
        }
      },
      {
        "id": 686,
        "name": "Bagains",
        "cost": {
          "Food": 900,
          "Gold": 450
        }
      },
      {
        "id": 754,
        "name": "Viñedos de Borgoña",
        "cost": {
          "Food": 400,
          "Gold": 300
        }
      },
      {
        "id": 755,
        "name": "Revolución flamenca",
        "cost": {
          "Food": 200,
          "Gold": 150
        }
      },
      {
        "id": 627,
        "name": "Caballería manipur",
        "cost": {
          "Food": 300,
          "Gold": 300
        }
      },
      {
        "id": 626,
        "name": "Howdah",
        "cost": {
          "Food": 400,
          "Wood": 300
        }
      },
      {
        "id": 464,
        "name": "Fuego griego",
        "cost": {
          "Food": 250,
          "Gold": 300
        }
      },
      {
        "id": 61,
        "name": "Logística",
        "cost": {
          "Food": 800,
          "Gold": 600
        }
      },
      {
        "id": 482,
        "name": "Bastión",
        "cost": {
          "Food": 250,
          "Gold": 200
        }
      },
      {
        "id": 5,
        "name": "Furor celta",
        "cost": {
          "Food": 750,
          "Gold": 450
        }
      },
      {
        "id": 462,
        "name": "Gran Muralla",
        "cost": {
          "Stone": 200,
          "Wood": 400
        }
      },
      {
        "id": 52,
        "name": "Cohetería",
        "cost": {
          "Food": 1100,
          "Gold": 900
        }
      },
      {
        "id": 689,
        "name": "Ganadería de la estepa",
        "cost": {
          "Food": 200,
          "Wood": 300
        }
      },
      {
        "id": 690,
        "name": "Mercenarios cumanos",
        "cost": {
          "Food": 650,
          "Gold": 400
        }
      },
      {
        "id": 1484,
        "name": "Hamask",
        "cost": {
          "Food": 250,
          "Gold": 450
        }
      },
      {
        "id": 1483,
        "name": "Furia Nórdica",
        "cost": {
          "Gold": 900,
          "Wood": 950
        }
      },
      {
        "id": 831,
        "name": "Cuerpo de médicos",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      },
      {
        "id": 832,
        "name": "Acero wootz",
        "cost": {
          "Food": 650,
          "Gold": 550
        }
      },
      {
        "id": 574,
        "name": "Centralización",
        "cost": {
          "Food": 300,
          "Gold": 300
        }
      },
      {
        "id": 575,
        "name": "Mecanismos de torsión",
        "cost": {
          "Food": 1000,
          "Gold": 600
        }
      },
      {
        "id": 1496,
        "name": "Compagnies d'ordonnance",
        "cost": {
          "Food": 400,
          "Gold": 250
        }
      },
      {
        "id": 493,
        "name": "Código caballeresco",
        "cost": {
          "Gold": 500,
          "Wood": 600
        }
      },
      {
        "id": 923,
        "name": "Torres esvanas",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      },
      {
        "id": 924,
        "name": "Caballería aznauri",
        "cost": {
          "Food": 550,
          "Gold": 250
        }
      },
      {
        "id": 16,
        "name": "Anarquía",
        "cost": {
          "Food": 450,
          "Gold": 250
        }
      },
      {
        "id": 457,
        "name": "Movilización",
        "cost": {
          "Gold": 600,
          "Wood": 400
        }
      },
      {
        "id": 835,
        "name": "Chatrias",
        "cost": {
          "Food": 500,
          "Gold": 450
        }
      },
      {
        "id": 836,
        "name": "Guardas fronterizos",
        "cost": {
          "Food": 800,
          "Gold": 700
        }
      },
      {
        "id": 506,
        "name": "Camino del Gran Tronco",
        "cost": {
          "Food": 250,
          "Wood": 200
        }
      },
      {
        "id": 507,
        "name": "Shatagni",
        "cost": {
          "Food": 500,
          "Gold": 650
        }
      },
      {
        "id": 757,
        "name": "Cota de malla",
        "cost": {
          "Food": 700,
          "Gold": 600
        }
      },
      {
        "id": 483,
        "name": "Razias",
        "cost": {
          "Gold": 200,
          "Wood": 300
        }
      },
      {
        "id": 21,
        "name": "Ateísmo",
        "cost": {
          "Food": 500,
          "Wood": 300
        }
      },
      {
        "id": 516,
        "name": "Hondero andino",
        "cost": {
          "Food": 200,
          "Gold": 300
        }
      },
      {
        "id": 517,
        "name": "Escudos de tela",
        "cost": {
          "Food": 600,
          "Gold": 600
        }
      },
      {
        "id": 499,
        "name": "Ruta de la Seda",
        "cost": {
          "Food": 250,
          "Gold": 250
        }
      },
      {
        "id": 902,
        "name": "Pirotecnia",
        "cost": {
          "Food": 650,
          "Gold": 500
        }
      },
      {
        "id": 484,
        "name": "Yasama",
        "cost": {
          "Food": 300,
          "Wood": 300
        }
      },
      {
        "id": 59,
        "name": "Kataparuto",
        "cost": {
          "Gold": 300,
          "Wood": 550
        }
      },
      {
        "id": 996,
        "name": "Bastiones fortificados",
        "cost": {
          "Food": 350,
          "Wood": 250
        }
      },
      {
        "id": 997,
        "name": "Bombas trueno",
        "cost": {
          "Food": 900,
          "Gold": 600
        }
      },
      {
        "id": 1006,
        "name": "Armadura laminada",
        "cost": {
          "Food": 450,
          "Gold": 300
        }
      },
      {
        "id": 622,
        "name": "Colmillos de acero",
        "cost": {
          "Gold": 450,
          "Wood": 300
        }
      },
      {
        "id": 623,
        "name": "Ballesta doble",
        "cost": {
          "Food": 700,
          "Gold": 400
        }
      },
      {
        "id": 486,
        "name": "Eupseong",
        "cost": {
          "Food": 300,
          "Wood": 300
        }
      },
      {
        "id": 445,
        "name": "Shinkichon",
        "cost": {
          "Food": 1100,
          "Gold": 800
        }
      },
      {
        "id": 691,
        "name": "Fuertes en las colinas",
        "cost": {
          "Food": 250,
          "Gold": 250
        }
      },
      {
        "id": 692,
        "name": "Escudos rectangulares",
        "cost": {
          "Food": 500,
          "Gold": 200
        }
      },
      {
        "id": 514,
        "name": "Ejército corviniano",
        "cost": {
          "Food": 200,
          "Gold": 300
        }
      },
      {
        "id": 515,
        "name": "Arco recurvo",
        "cost": {
          "Gold": 400,
          "Wood": 600
        }
      },
      {
        "id": 624,
        "name": "Talasocracia",
        "cost": {
          "Food": 300,
          "Gold": 300
        }
      },
      {
        "id": 625,
        "name": "Leva en masa",
        "cost": {
          "Food": 850,
          "Gold": 500
        }
      },
      {
        "id": 1013,
        "name": "Pastoreo",
        "cost": {
          "Food": 100,
          "Wood": 150
        }
      },
      {
        "id": 576,
        "name": "Gran asamblea",
        "cost": {
          "Food": 200,
          "Wood": 300
        }
      },
      {
        "id": 577,
        "name": "Farimba",
        "cost": {
          "Food": 650,
          "Gold": 400
        }
      },
      {
        "id": 1379,
        "name": "Malón",
        "cost": {
          "Food": 300,
          "Gold": 350
        }
      },
      {
        "id": 1380,
        "name": "Butalmapu",
        "cost": {
          "Food": 500,
          "Gold": 450
        }
      },
      {
        "id": 485,
        "name": "Lanzadores de hul'che",
        "cost": {
          "Food": 300,
          "Gold": 300
        }
      },
      {
        "id": 4,
        "name": "Holcanes",
        "cost": {
          "Food": 750,
          "Gold": 450
        }
      },
      {
        "id": 11,
        "name": "Almenas",
        "cost": {
          "Food": 600,
          "Stone": 400
        }
      },
      {
        "id": 487,
    "IconID": 34,
        "name": "Nómadas",
        "cost": {
          "Gold": 150,
          "Wood": 300
        }
      },
      {
        "id": 6,
        "name": "Instrucción militar",
        "cost": {
          "Gold": 450,
          "Wood": 500
        }
      },
      {
        "id": 1365,
        "name": "Herbología",
        "cost": {
          "Food": 300,
          "Gold": 350
        }
      },
      {
        "id": 1366,
        "name": "Huaracas",
        "cost": {
          "Gold": 350,
          "Wood": 450
        }
      },
      {
        "id": 488,
        "name": "Kamandaran",
        "cost": {
          "Food": 400,
          "Gold": 300
        }
      },
      {
        "id": 7,
        "name": "Ciudadelas",
        "cost": {
          "Gold": 300,
          "Wood": 600
        }
      },
      {
        "id": 782,
        "name": "Privilegios de Szlachta",
        "cost": {
          "Food": 500,
          "Gold": 300
        }
      },
      {
        "id": 783,
        "name": "Legado lequítico",
        "cost": {
          "Food": 750,
          "Gold": 550
        }
      },
      {
        "id": 1404,
        "name": "Circun navegación",
        "cost": {
          "Food": 250,
          "Wood": 150
        }
      },
      {
        "id": 573,
        "name": "Arcabuz",
        "cost": {
          "Food": 700,
          "Gold": 400
        }
      },
      {
        "id": 883,
        "name": "Balistas",
        "cost": {
          "Gold": 300,
          "Wood": 400
        }
      },
      {
        "id": 884,
        "name": "Comitatenses",
        "cost": {
          "Food": 700,
          "Gold": 800
        }
      },
      {
        "id": 28,
        "name": "Bimaristán",
        "cost": {
          "Gold": 200,
          "Wood": 300
        }
      },
      {
        "id": 454,
        "name": "Contrapesos",
        "cost": {
          "Food": 650,
          "Gold": 500
        }
      },
      {
        "id": 1491,
        "name": "Reclutamiento administrativo",
        "cost": {
          "Food": 350,
          "Gold": 200
        }
      },
      {
        "id": 1464,
        "name": "Muralla escudo",
        "cost": {
          "Food": 525,
          "Gold": 475
        }
      },
      {
        "id": 1070,
        "name": "Arsenal de la serpiente enroscada",
        "cost": {
          "Food": 350,
          "Gold": 300
        }
      },
      {
        "id": 1069,
        "name": "Cargador",
        "cost": {
          "Food": 650,
          "Gold": 750
        }
      },
      {
        "id": 756,
        "name": "Primera cruzada",
        "cost": {
          "Food": 400,
          "Gold": 300
        }
      },
      {
        "id": 455,
        "name": "Detinets",
        "cost": {
          "Gold": 200,
          "Wood": 400
        }
      },
      {
        "id": 513,
        "name": "Druzhina",
        "cost": {
          "Food": 900,
          "Gold": 500
        }
      },
      {
        "id": 492,
        "name": "Inquisición",
        "cost": {
          "Food": 100,
          "Gold": 300
        }
      },
      {
        "id": 440,
        "name": "Supremacía",
        "cost": {
          "Food": 400,
          "Gold": 250
        }
      },
      {
        "id": 687,
        "name": "Armadura de seda",
        "cost": {
          "Gold": 300,
          "Wood": 400
        }
      },
      {
        "id": 688,
        "name": "Tácticas de asedio timúridas",
        "cost": {
          "Gold": 400,
          "Wood": 500
        }
      },
      {
        "id": 489,
        "name": "Blindaje",
        "cost": {
          "Gold": 350,
          "Wood": 400
        }
      },
      {
        "id": 1392,
        "name": "Caciques",
        "cost": {
          "Food": 400,
          "Gold": 200
        }
      },
      {
        "id": 1393,
        "name": "Curare",
        "cost": {
          "Food": 650,
          "Gold": 600
        }
      },
      {
        "id": 46,
        "name": "Devoción",
        "cost": {
          "Food": 100,
          "Gold": 200
        }
      },
      {
        "id": 491,
        "name": "Sipahi",
        "cost": {
          "Food": 350,
          "Gold": 150
        }
      },
      {
        "id": 10,
        "name": "Artillería",
        "cost": {
          "Food": 600,
          "Gold": 650
        }
      },
      {
        "id": 1473,
        "name": "Legado de Vendel",
        "cost": {
          "Food": 500,
          "Gold": 300
        }
      },
      {
        "id": 1474,
        "name": "Gothikon",
        "cost": {
          "Food": 475,
          "Gold": 400
        }
      },
      {
        "id": 628,
        "name": "Chatras",
        "cost": {
          "Food": 250,
          "Gold": 250
        }
      },
      {
        "id": 629,
        "name": "Papel moneda",
        "cost": {
          "Food": 550,
          "Wood": 200
        }
      },
      {
        "id": 463,
        "name": "Hérsires",
        "cost": {
          "Food": 600,
          "Gold": 450
        }
      },
      {
        "id": 49,
        "name": "Bogsveigar",
        "cost": {
          "Food": 650,
          "Gold": 500
        }
      },
      {
        "id": 1061,
        "name": "Tuntian",
        "cost": {
          "Food": 250,
          "Wood": 300
        }
      },
      {
        "id": 1062,
        "name": "Armadura de Ming Guang",
        "cost": {
          "Food": 600,
          "Gold": 450
        }
      },
      {
        "id": 1080,
        "name": "Tácticas de los Acantilados Rojos",
        "cost": {
          "Food": 400,
          "Gold": 250
        }
      },
      {
        "id": 1081,
        "name": "Tigre sentado",
        "cost": {
          "Gold": 300,
          "Wood": 600
        }
      }
    ]
  },
  "market": {
    "id": 84,
    "IconID": 37,
    "key": "market",
    "name": "Mercado",
    "internal_name": "MRKT",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 1800,
    "baseAttack": 0,
    "meleeArmor": 1,
    "pierceArmor": 8,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 8,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 175,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 60,
    "development": {
      "requiredBuilding": "Molino",
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir mercado () Sirve para comprar y vender recursos, comerciar con otros jugadores por tierra e investigar tecnologías de comercio. Se necesita para enviar recursos a otros jugadores. La tarifa de mercado y los impuestos de los tributos son del 30 %. Mejoras: campo de visión (centro urbano), PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 128,
        "name": "Carreta de mercancías",
        "age": 1,
        "cost": {
          "Gold": 50,
          "Wood": 100
        }
      }
    ],
    "techs": [
      {
        "id": 48,
        "name": "Caravana",
        "cost": {
          "Food": 200,
          "Gold": 200
        }
      },
      {
        "id": 23,
        "name": "Acuñación",
        "cost": {
          "Food": 200,
          "Gold": 100
        }
      },
      {
        "id": 17,
        "name": "Banca",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      },
      {
        "id": 15,
        "name": "Gremios",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      }
    ]
  },
  "archery_range": {
    "id": 87,
    "IconID": 87,
    "key": "archery_range",
    "name": "Galería de tiro con arco",
    "internal_name": "ARRG",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar",
    "baseHp": 1500,
    "baseAttack": 0,
    "meleeArmor": 1,
    "pierceArmor": 8,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 8,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 175,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 50,
    "development": {
      "requiredBuilding": "Cuartel",
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir galería de tiro con arco () Se usa para entrenar y mejorar soldados a distancia. Mejoras: velocidad de producción (castillo), campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 4,
        "name": "Arquero",
        "age": 1,
        "cost": {
          "Gold": 45,
          "Wood": 25
        }
      },
      {
        "id": 24,
        "name": "Ballestero",
        "age": 1,
        "cost": {
          "Gold": 45,
          "Wood": 25
        }
      },
      {
        "id": 492,
        "name": "Arbalestero",
        "age": 1,
        "cost": {
          "Gold": 45,
          "Wood": 25
        }
      },
      {
        "id": 7,
        "name": "Hostigador",
        "age": 1,
        "cost": {
          "Food": 25,
          "Wood": 35
        }
      },
      {
        "id": 6,
        "name": "Hostigador de élite",
        "age": 1,
        "cost": {
          "Food": 25,
          "Wood": 35
        }
      },
      {
        "id": 5,
        "name": "Artillero manual",
        "age": 1,
        "cost": {
          "Food": 45,
          "Gold": 50
        }
      },
      {
        "id": 39,
        "name": "Arquero a caballo",
        "age": 1,
        "cost": {
          "Gold": 60,
          "Wood": 40
        }
      },
      {
        "id": 474,
        "name": "Arquero de caballería pesada",
        "age": 1,
        "cost": {
          "Gold": 60,
          "Wood": 40
        }
      }
    ],
    "techs": [
      {
        "id": 437,
        "name": "Dactilera",
        "cost": {
          "Food": 300,
          "Wood": 250
        }
      },
      {
        "id": 436,
        "name": "Tácticas de los partias",
        "cost": {
          "Food": 200,
          "Gold": 250
        }
      },
      {
        "id": 875,
        "name": "Gambesones",
        "cost": {
          "Food": 50,
          "Gold": 100
        }
      },
      {
        "id": 1012,
        "name": "Trashumancia",
        "cost": {
          "Food": 175,
          "Wood": 325
        }
      },
      {
        "id": 1452,
        "name": "Molinetes",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      }
    ]
  },
  "stable": {
    "id": 101,
    "IconID": 102,
    "key": "stable",
    "name": "Establo",
    "internal_name": "STBL",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar",
    "baseHp": 1500,
    "baseAttack": 0,
    "meleeArmor": 1,
    "pierceArmor": 8,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 8,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 175,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 50,
    "development": {
      "requiredBuilding": "Cuartel",
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir establo () Sirve para entrenar y mejorar a la caballería. Mejoras: velocidad de producción (castillo); campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 448,
        "name": "Caballería de exploración",
        "age": 1,
        "cost": {
          "Food": 80
        }
      },
      {
        "id": 546,
        "name": "Caballería ligera",
        "age": 1,
        "cost": {
          "Food": 80
        }
      },
      {
        "id": 441,
        "name": "Húsar",
        "age": 1,
        "cost": {
          "Food": 80
        }
      },
      {
        "id": 38,
        "name": "Caballero",
        "age": 1,
        "cost": {
          "Food": 60,
          "Gold": 75
        }
      },
      {
        "id": 283,
        "name": "Caballero",
        "age": 1,
        "cost": {
          "Food": 60,
          "Gold": 75
        }
      },
      {
        "id": 569,
        "name": "Paladín",
        "age": 1,
        "cost": {
          "Food": 60,
          "Gold": 75
        }
      }
    ],
    "techs": [
      {
        "id": 435,
        "name": "Pureza de sangre",
        "cost": {
          "Food": 150,
          "Gold": 100
        }
      },
      {
        "id": 39,
        "name": "Ganadería",
        "cost": {
          "Food": 150
        }
      }
    ]
  },
  "blacksmith": {
    "id": 103,
    "IconID": 4,
    "key": "blacksmith",
    "name": "Herrería",
    "internal_name": "BLAC",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "military",
    "categoryName": "Militar / Tecnológico",
    "baseHp": 1800,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 150,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 40,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir herrero () Se usa para investigar tecnologías que mejoran la armadura y ataque de las unidades. Necesario para construir el taller de maquinaria de asedio. Mejoras: campo de visión (centro urbano); puntos de resistencia, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 211,
        "name": "Arm. acolch. para arqueros",
        "cost": {
          "Food": 100
        }
      },
      {
        "id": 212,
        "name": "Arm. de cuero para arqueros",
        "cost": {
          "Food": 150,
          "Gold": 150
        }
      },
      {
        "id": 219,
        "name": "Arm. anillos para arqueros",
        "cost": {
          "Food": 250,
          "Gold": 250
        }
      },
      {
        "id": 199,
        "name": "Emplumado de flechas",
        "cost": {
          "Food": 100,
          "Gold": 50
        }
      },
      {
        "id": 200,
        "name": "Flecha de punzón",
        "cost": {
          "Food": 200,
          "Gold": 100
        }
      },
      {
        "id": 201,
        "name": "Brazal",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      },
      {
        "id": 67,
        "name": "Forja",
        "cost": {
          "Food": 150
        }
      },
      {
        "id": 68,
        "name": "Fundición de hierro",
        "cost": {
          "Food": 220,
          "Gold": 120
        }
      },
      {
        "id": 75,
        "name": "Alto horno",
        "cost": {
          "Food": 275,
          "Gold": 225
        }
      },
      {
        "id": 81,
        "name": "Arm. láminas de cab. pesada",
        "cost": {
          "Food": 150
        }
      },
      {
        "id": 82,
        "name": "Arm. cota de malla de cab.",
        "cost": {
          "Food": 250,
          "Gold": 150
        }
      },
      {
        "id": 80,
        "name": "Arm. placas de cab.",
        "cost": {
          "Food": 350,
          "Gold": 200
        }
      },
      {
        "id": 74,
        "name": "Armadura de láminas",
        "cost": {
          "Food": 100
        }
      },
      {
        "id": 76,
        "name": "Cota de malla",
        "cost": {
          "Food": 200,
          "Gold": 100
        }
      },
      {
        "id": 77,
        "name": "Arm. placas de malla",
        "cost": {
          "Food": 300,
          "Gold": 150
        }
      }
    ]
  },
  "monastery": {
    "id": 104,
    "IconID": 105,
    "key": "monastery",
    "name": "Monasterio",
    "internal_name": "CRCH",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "religious_academic",
    "categoryName": "Religioso / Académico",
    "baseHp": 2100,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 1,
    "cost": {
      "Wood": 175,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 40,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir Monasterio () Se utiliza para entrenar y mejorar monjes. Alberga reliquias para generar oro. Los monjes enemigos no pueden convertirlo. Mejoras: campo de visión (centro urbano); puntos de resistencia, armadura (universidad).",
    "units": [
      {
        "id": 125,
        "name": "Monje",
        "age": 1,
        "cost": {
          "Food": 0,
          "Gold": 100
        }
      }
    ],
    "techs": [
      {
        "id": 46,
        "name": "Devoción",
        "cost": {
          "Food": 100,
          "Gold": 200
        }
      },
      {
        "id": 45,
        "name": "Fe",
        "cost": {
          "Food": 550,
          "Gold": 750
        }
      },
      {
        "id": 316,
        "name": "Redención",
        "cost": {
          "Food": 0,
          "Gold": 475
        }
      },
      {
        "id": 233,
        "name": "Iluminación",
        "cost": {
          "Food": 0,
          "Gold": 120
        }
      },
      {
        "id": 319,
        "name": "Expiación",
        "cost": {
          "Food": 0,
          "Gold": 325
        }
      },
      {
        "id": 230,
        "name": "Letras de imprenta",
        "cost": {
          "Food": 0,
          "Gold": 200
        }
      },
      {
        "id": 441,
        "name": "Hierbas medicinales",
        "cost": {
          "Food": 0,
          "Gold": 200
        }
      },
      {
        "id": 438,
        "name": "Teocracia",
        "cost": {
          "Food": 0,
          "Gold": 200
        }
      },
      {
        "id": 439,
        "name": "Herejía",
        "cost": {
          "Food": 0,
          "Gold": 1000
        }
      },
      {
        "id": 231,
        "name": "Santidad",
        "cost": {
          "Food": 0,
          "Gold": 175
        }
      },
      {
        "id": 252,
        "name": "Fervor",
        "cost": {
          "Food": 0,
          "Gold": 140
        }
      }
    ]
  },
  "town_center": {
    "id": 109,
    "IconID": 109,
    "key": "town_center",
    "name": "Centro urbano",
    "internal_name": "RTWC",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico / Cívico",
    "baseHp": 2400,
    "baseAttack": 5,
    "meleeArmor": 3,
    "pierceArmor": 5,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 5,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 3,
        "Amount": 5,
        "Name": "Antiproyectil (Pierce)"
      }
    ],
    "baseRange": 6,
    "minRange": 0,
    "los": 8,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 15,
    "population": 5,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 275,
      "Food": 0,
      "Gold": 0,
      "Stone": 100
    },
    "buildTime": 100,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir centro urbano () Sirve para entrenar aldeanos, depositar recursos, avanzar a la siguiente edad e investigar tecnologías. Las unidades pueden guarnecerse en su interior para protegerse. Los soldados a distancia y los aldeanos proporcionan proyectiles adicionales. Brinda 5 de población. Los monjes enemigos no pueden convertirlo. Mejoras: campo de visión (centro urbano); PR, armadura, precisión (universidad); ataque (herrero).",
    "units": [
      {
        "id": 83,
        "name": "Aldeano",
        "age": 1,
        "cost": {
          "Food": 50
        }
      }
    ],
    "techs": [
      {
        "id": 8,
        "name": "Guardia urbana",
        "cost": {
          "Food": 75
        }
      },
      {
        "id": 280,
        "name": "Patrulla urbana",
        "cost": {
          "Food": 300,
          "Gold": 100
        }
      },
      {
        "id": 101,
        "name": "Edad Feudal",
        "cost": {
          "Food": 500
        }
      },
      {
        "id": 102,
        "name": "Edad de los Castillos",
        "cost": {
          "Food": 800,
          "Gold": 200
        }
      },
      {
        "id": 103,
        "name": "Edad Imperial",
        "cost": {
          "Food": 1000,
          "Gold": 800
        }
      },
      {
        "id": 22,
        "name": "Telar",
        "cost": {
          "Gold": 50
        }
      },
      {
        "id": 213,
        "name": "Carretilla",
        "cost": {
          "Food": 175,
          "Wood": 50
        }
      },
      {
        "id": 249,
        "name": "Carro de mano",
        "cost": {
          "Food": 300,
          "Wood": 200
        }
      }
    ]
  },
  "stone_wall": {
    "id": 117,
    "IconID": 31,
    "key": "stone_wall",
    "name": "Muro de piedra",
    "internal_name": "WALL2",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 1080,
    "baseAttack": 0,
    "meleeArmor": 8,
    "pierceArmor": 10,
    "buildingArmor": 16,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 16,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 8,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 22,
        "Amount": 0,
        "Name": "Clase 22"
      },
      {
        "Class": 31,
        "Amount": 8,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 2,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 0,
      "Stone": 5
    },
    "buildTime": 10,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": "Muro de empalizada",
      "nextUpgrade": "Muralla fortificada"
    },
    "description": "Construir muro de piedra () Muro de piedra difícil de atravesar sin armas de asedio. Ralentiza a tus enemigos y te advierte de su avance. Los monjes enemigos no pueden convertirlo. Mejoras: a muralla fortificada (universidad).",
    "units": [],
    "techs": []
  },
  "fortified_wall": {
    "id": 155,
    "IconID": 32,
    "key": "fortified_wall",
    "name": "Muralla fortificada",
    "internal_name": "WALL3",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 3000,
    "baseAttack": 0,
    "meleeArmor": 12,
    "pierceArmor": 12,
    "buildingArmor": 24,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 24,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 12,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 12,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 22,
        "Amount": 0,
        "Name": "Clase 22"
      },
      {
        "Class": 31,
        "Amount": 12,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 2,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 0,
      "Stone": 5
    },
    "buildTime": 10,
    "development": {
      "requiredBuilding": null,
      "requiredTech": "Muralla fortificada (Tecnología)",
      "upgradedFrom": "Muro de piedra",
      "nextUpgrade": null
    },
    "description": "Construir muralla fortificada () Muralla de piedra difícil de atravesar sin armas de asedio. Ralentiza a tus enemigos y te advierte de su avance. Los monjes enemigos no pueden convertirla.",
    "units": [],
    "techs": []
  },
  "fish_trap": {
    "id": 199,
    "IconID": 41,
    "key": "fish_trap",
    "name": "Trampa para peces",
    "internal_name": "FTRAP",
    "builderUnit": "Barco pesquero",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 250,
    "baseAttack": 0,
    "meleeArmor": 1,
    "pierceArmor": 1,
    "buildingArmor": 10,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 1,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 11,
        "Amount": 10,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 1,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 100,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 40,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir trampa para peces () Fuente renovable de comida. Similar a la granja, pero construida por los buques de pesca. Proporciona una cantidad limitada de comida antes de desaparecer, luego debe reconstruirse. Los monjes enemigos no pueden convertirlas.",
    "units": [],
    "techs": []
  },
  "university": {
    "id": 209,
    "IconID": 105,
    "key": "university",
    "name": "Universidad",
    "internal_name": "UNIV",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "religious_academic",
    "categoryName": "Religioso / Académico",
    "baseHp": 2100,
    "baseAttack": 0,
    "meleeArmor": 2,
    "pierceArmor": 9,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 2,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 9,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 2,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 200,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 60,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir universidad () Sirve para desarrollar tecnologías que mejoran unidades y edificios. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 50,
        "name": "Albañilería",
        "cost": {
          "Food": 150,
          "Wood": 175
        }
      },
      {
        "id": 51,
        "name": "Arquitectura",
        "cost": {
          "Food": 300,
          "Wood": 200
        }
      },
      {
        "id": 194,
        "name": "Muralla fortificada",
        "cost": {
          "Food": 200,
          "Wood": 100
        }
      },
      {
        "id": 47,
        "name": "Química",
        "cost": {
          "Food": 300,
          "Gold": 200
        }
      },
      {
        "id": 64,
        "name": "Torre de bombardeo",
        "cost": {
          "Food": 800,
          "Wood": 400
        }
      },
      {
        "id": 93,
        "name": "Balística",
        "cost": {
          "Gold": 175,
          "Wood": 300
        }
      },
      {
        "id": 377,
        "name": "Ingenieros de asedio",
        "cost": {
          "Food": 500,
          "Wood": 600
        }
      },
      {
        "id": 140,
        "name": "Torre de vigilancia",
        "cost": {
          "Food": 100,
          "Wood": 250
        }
      },
      {
        "id": 63,
        "name": "Fortaleza",
        "cost": {
          "Food": 500,
          "Wood": 350
        }
      },
      {
        "id": 380,
        "name": "Bala roja",
        "cost": {
          "Food": 350,
          "Gold": 100
        }
      },
      {
        "id": 608,
        "name": "Aspillera en cruz",
        "cost": {
          "Food": 250,
          "Wood": 250
        }
      },
      {
        "id": 322,
        "name": "Matacanes",
        "cost": {
          "Food": 200,
          "Stone": 100
        }
      },
      {
        "id": 374,
        "name": "Carenado",
        "cost": {
          "Food": 100,
          "Gold": 200
        }
      },
      {
        "id": 375,
        "name": "Dique seco",
        "cost": {
          "Food": 200,
          "Gold": 400
        }
      },
      {
        "id": 908,
        "name": "Construcción de cascos a tingladillo",
        "cost": {
          "Food": 150,
          "Wood": 100
        }
      },
      {
        "id": 907,
        "name": "Casco liso",
        "cost": {
          "Food": 350,
          "Wood": 200
        }
      },
      {
        "id": 909,
        "name": "Sifones",
        "cost": {
          "Food": 100,
          "Gold": 175
        }
      },
      {
        "id": 910,
        "name": "Incendiarias",
        "cost": {
          "Food": 200,
          "Gold": 325
        }
      },
      {
        "id": 373,
        "name": "Carpintero naval",
        "cost": {
          "Food": 1000,
          "Gold": 300
        }
      },
      {
        "id": 54,
        "name": "Grúa",
        "cost": {
          "Stone": 50,
          "Wood": 200
        }
      }
    ]
  },
  "guard_tower": {
    "id": 234,
    "IconID": 26,
    "key": "guard_tower",
    "name": "Torre de vigilancia",
    "internal_name": "WCTW2",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 1500,
    "baseAttack": 7,
    "meleeArmor": 2,
    "pierceArmor": 8,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 2,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 8,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 31,
        "Amount": 2,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 27,
        "Amount": 2,
        "Name": "Piqueros / Lanceros"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Edificios generales"
      },
      {
        "Class": 16,
        "Amount": 7,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      }
    ],
    "baseRange": 8,
    "minRange": 1,
    "los": 10,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 5,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 35,
      "Food": 0,
      "Gold": 0,
      "Stone": 125
    },
    "buildTime": 80,
    "development": {
      "requiredBuilding": "Universidad",
      "requiredTech": "Torre de vigilancia (Tecnología)",
      "upgradedFrom": "Torre de guardia",
      "nextUpgrade": "Torre del homenaje"
    },
    "description": "Construir torre de guardia () Torre con ataque a distancia. Las unidades pueden guarnecerse en su interior para protegerse. Los soldados a distancia y los aldeanos disparan proyectiles adicionales. Fuerte contra soldados a distancia. Débil contra unidades a corta distancia, especialmente arietes. Mejoras: campo de visión (centro urbano); ataque, alcance (herrero); ataque, PR, armadura, ataque a barcos, a fortaleza (universidad).",
    "units": [],
    "techs": []
  },
  "keep": {
    "id": 235,
    "IconID": 27,
    "key": "keep",
    "name": "Torre del homenaje",
    "internal_name": "WCTW3",
    "builderUnit": "Aldeano",
    "age": 4,
    "ageName": "Edad Imperial",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 2250,
    "baseAttack": 8,
    "meleeArmor": 3,
    "pierceArmor": 9,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 9,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 27,
        "Amount": 2,
        "Name": "Piqueros / Lanceros"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Edificios generales"
      },
      {
        "Class": 16,
        "Amount": 8,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 8,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      }
    ],
    "baseRange": 8,
    "minRange": 1,
    "los": 10,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 5,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 35,
      "Food": 0,
      "Gold": 0,
      "Stone": 125
    },
    "buildTime": 80,
    "development": {
      "requiredBuilding": "Universidad",
      "requiredTech": "Fortaleza / Homenaje (Tecnología)",
      "upgradedFrom": "Torre de vigilancia",
      "nextUpgrade": null
    },
    "description": "Construir fortaleza () Torre con ataque a distancia. Las unidades pueden guarnecerse en su interior para protegerse. Los soldados a distancia y los aldeanos disparan proyectiles adicionales. Fuerte contra soldados a distancia. Débil contra unidades a corta distancia, especialmente arietes. Mejoras: campo de visión (centro urbano); ataque, alcance (herrero); ataque, PR, armadura, ataque a barcos (universidad).",
    "units": [],
    "techs": []
  },
  "bombard_tower": {
    "id": 236,
    "IconID": 38,
    "key": "bombard_tower",
    "name": "Torre de bombardeo",
    "internal_name": "WCTW4",
    "builderUnit": "Aldeano",
    "age": 4,
    "ageName": "Edad Imperial",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 2220,
    "baseAttack": 120,
    "meleeArmor": 3,
    "pierceArmor": 9,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 9,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 23,
        "Amount": 0,
        "Name": "Clase 23"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 16,
        "Amount": 40,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 120,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      }
    ],
    "baseRange": 8,
    "minRange": 1,
    "los": 10,
    "reloadTime": 6,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 5,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 100,
      "Stone": 125
    },
    "buildTime": 80,
    "development": {
      "requiredBuilding": "Universidad",
      "requiredTech": "Química + Torre de bombardeo",
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir torre de bombarda () Torre de cañones con un potente ataque a distancia. Las unidades pueden guarnecerse en su interior para protegerse. Fuerte contra todo a distancia. Débil contra armas de asedio de largo alcance. Mejoras: campo de visión (centro urbano); ataque, alcance (herrero); PR, armadura, ataque a barcos (universidad).",
    "units": [],
    "techs": []
  },
  "wonder": {
    "id": 276,
    "IconID": 37,
    "key": "wonder",
    "name": "Maravilla",
    "internal_name": "WNDR",
    "builderUnit": "Aldeano",
    "age": 4,
    "ageName": "Edad Imperial",
    "class": "Edificio",
    "category": "religious_academic",
    "categoryName": "Cívico / Maravilla",
    "baseHp": 4800,
    "baseAttack": 0,
    "meleeArmor": 3,
    "pierceArmor": 10,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 0,
        "Amount": 0,
        "Name": "Clase 0"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 8,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 1000,
      "Food": 0,
      "Gold": 1000,
      "Stone": 1000
    },
    "buildTime": 3500,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir maravilla () Una maravilla del mundo que demuestra la superioridad de tu civilización. Una forma de ganar el juego es construyendo una maravilla que se mantenga durante un cierto período de tiempo. Los monjes enemigos no pueden convertirla. Mejoras: campo de visión (centro urbano); PR, armadura (universidad).",
    "units": [],
    "techs": []
  },
  "gate": {
    "id": 487,
    "IconID": 34,
    "key": "gate",
    "name": "Puerta",
    "internal_name": "GTAX2",
    "builderUnit": "Aldeano",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 1650,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 0,
    "buildingArmor": 20,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 20,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 0,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 22,
        "Amount": 0,
        "Name": "Clase 22"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 0,
      "Stone": 30
    },
    "buildTime": 70,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": "Portón de madera",
      "nextUpgrade": null
    },
    "description": "Construir puerta () Puerta robusta de piedra que se puede construir en las murallas existentes para permitir el movimiento de unidades aliadas. Se puede bloquear y desbloquear. Los monjes enemigos no pueden convertirla. Mejoras: a puerta fortificada (universidad).",
    "units": [],
    "techs": []
  },
  "lumber_camp": {
    "id": 562,
    "IconID": 56,
    "key": "lumber_camp",
    "name": "Campamento maderero",
    "internal_name": "SMIL",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 600,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 100,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 35,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir campamento maderero () Se usa para depositar madera e investigar tecnologías de recolección de madera. Constrúyelo cerca de los bosques para recolectar madera más rápido. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 202,
        "name": "Hacha de doble filo",
        "cost": {
          "Food": 100,
          "Wood": 50
        }
      },
      {
        "id": 203,
        "name": "Sierra de arco",
        "cost": {
          "Food": 150,
          "Wood": 100
        }
      },
      {
        "id": 221,
        "name": "Sierra a dos",
        "cost": {
          "Food": 300,
          "Wood": 200
        }
      }
    ]
  },
  "mining_camp": {
    "id": 584,
    "IconID": 53,
    "key": "mining_camp",
    "name": "Campamento minero",
    "internal_name": "MINE",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 600,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 100,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 35,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir campamento minero () Se usa para depositar piedra y oro e investigar tecnologías de minería. Constrúyelo cerca de minas de piedra u oro para recolectar estos recursos más rápido. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 55,
        "name": "Minería aurífera",
        "cost": {
          "Food": 100,
          "Wood": 75
        }
      },
      {
        "id": 182,
        "name": "Pozo minero aurífero",
        "cost": {
          "Food": 175,
          "Wood": 75
        }
      },
      {
        "id": 278,
        "name": "Explotación de canteras",
        "cost": {
          "Food": 100,
          "Wood": 75
        }
      },
      {
        "id": 279,
        "name": "Pozo de cantera",
        "cost": {
          "Food": 175,
          "Wood": 75
        }
      }
    ]
  },
  "outpost": {
    "id": 598,
    "IconID": 598,
    "key": "outpost",
    "name": "Puesto de avanzada",
    "internal_name": "WCTWX",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 500,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 0,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 0,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 25,
      "Food": 0,
      "Gold": 0,
      "Stone": 5
    },
    "buildTime": 15,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir puesto de avanzada () Torre de observación con gran campo de visión para detectar la actividad enemiga en los alrededores. No ataca y no puede guarnecer unidades en su interior. Mejoras: campo de visión (centro urbano); puntos de resistencia, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": []
  },
  "palisade_gate": {
    "id": 792,
    "IconID": 36,
    "key": "palisade_gate",
    "name": "Portón de madera",
    "internal_name": "PGTAX",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo",
    "baseHp": 240,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 0,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 0,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 22,
        "Amount": 0,
        "Name": "Clase 22"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 30,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 30,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": "Puerta"
    },
    "description": "Construir puerta de empalizada () Puerta frágil de madera que se puede construir en las murallas existentes para permitir el movimiento de unidades aliadas. Se puede bloquear y desbloquear. Los monjes enemigos no pueden convertirla.",
    "units": [],
    "techs": []
  },
  "feitoria": {
    "id": 1021,
    "IconID": 56,
    "key": "feitoria",
    "name": "Factoría",
    "internal_name": "FEITO",
    "builderUnit": "Aldeano",
    "age": 4,
    "ageName": "Edad Imperial",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico / Especial",
    "baseHp": 2700,
    "baseAttack": 0,
    "meleeArmor": 3,
    "pierceArmor": 10,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 350,
      "Stone": 300
    },
    "buildTime": 120,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir factoría () Edificio económico exclusivo de los portugueses. Genera recursos de madera, comida, oro y piedra de forma pasiva. Requiere 20 de población. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": []
  },
  "harbor": {
    "id": 1189,
    "IconID": 56,
    "key": "harbor",
    "name": "Puerto",
    "internal_name": "HARBOR",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo / Naval",
    "baseHp": 2000,
    "baseAttack": 3,
    "meleeArmor": 3,
    "pierceArmor": 10,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 16,
        "Amount": 3,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      },
      {
        "Class": 3,
        "Amount": 3,
        "Name": "Antiproyectil (Pierce)"
      }
    ],
    "baseRange": 7,
    "minRange": 1,
    "los": 10,
    "reloadTime": 3,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 150,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 35,
    "development": {
      "requiredBuilding": "Muelle",
      "requiredTech": "Talosocracia (Tecnología Única Malaya)",
      "upgradedFrom": "Muelle",
      "nextUpgrade": null
    },
    "description": "Construir puerto () Edificio exclusivo de los malayos que ataca automáticamente a los enemigos que están a su alcance. Se utiliza para construir y mejorar barcos, depositar alimentos de los buques de pesca y comerciar con otros jugadores por mar. Mejoras: campo de visión (centro urbano); ataque, alcance (herrero); ataque, PR, armadura, precisión, ataque a barcos (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": []
  },
  "krepost": {
    "id": 1251,
    "IconID": 107,
    "key": "krepost",
    "name": "Krepost",
    "internal_name": "KREPOST",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo / Militar",
    "baseHp": 2600,
    "baseAttack": 10,
    "meleeArmor": 8,
    "pierceArmor": 11,
    "buildingArmor": 8,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 26,
        "Amount": 0,
        "Name": "Castillos"
      },
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 8,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 8,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 11,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 8,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 27,
        "Amount": 2,
        "Name": "Piqueros / Lanceros"
      },
      {
        "Class": 16,
        "Amount": 0,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 17,
        "Amount": 0,
        "Name": "Arietes"
      },
      {
        "Class": 30,
        "Amount": 0,
        "Name": "Camellos"
      }
    ],
    "baseRange": 7,
    "minRange": 1,
    "los": 10,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 20,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 0,
      "Food": 0,
      "Gold": 0,
      "Stone": 350
    },
    "buildTime": 150,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir krepost () Fortificación exclusiva de los búlgaros que sirve para entrenar a tus unidades únicas. Las unidades pueden guarecerse en su interior para protegerse. Los soldados a distancia y los aldeanos disparan proyectiles adicionales. Brinda 20 de población. Los monjes enemigos no pueden convertirlo. Mejoras: velocidad de producción (castillo); campo de visión (centro urbano); PR, armadura, precisión (universidad); ataque, alcance (herrero).",
    "units": [
      {
        "id": 440,
        "name": "Petardo",
        "age": 1,
        "cost": {
          "Food": 65,
          "Gold": 20
        }
      }
    ],
    "techs": []
  },
  "donjon": {
    "id": 1665,
    "IconID": 107,
    "key": "donjon",
    "name": "Donjon",
    "internal_name": "DONJON",
    "builderUnit": "Aldeano / Serjeant",
    "age": 2,
    "ageName": "Edad Feudal",
    "class": "Edificio",
    "category": "defensive",
    "categoryName": "Defensivo / Militar",
    "baseHp": 625,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 6,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 6,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 27,
        "Amount": 0,
        "Name": "Piqueros / Lanceros"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Edificios generales"
      },
      {
        "Class": 16,
        "Amount": 0,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 0,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 30,
        "Amount": 0,
        "Name": "Camellos"
      }
    ],
    "baseRange": 0,
    "minRange": 1,
    "los": 10,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 50,
      "Food": 0,
      "Gold": 0,
      "Stone": 175
    },
    "buildTime": 125,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir torre del homenaje () Fortificación exclusiva de los sicilianos que sirve para entrenar unidades únicas y la línea de lanceros. Las unidades pueden guarnecerse en su interior para protegerse. Los soldados a distancia y los aldeanos disparan proyectiles adicionales. Desbloquea la galería de tiro con arco y el establo. Mejoras: puntos de resistencia, velocidad de producción (castillo); campo de visión (centro urbano); puntos de resistencia, armadura, precisión (universidad); ataque, alcance (herrero).",
    "units": [
      {
        "id": 1786,
        "name": "Lancero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      },
      {
        "id": 1787,
        "name": "Piquero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      },
      {
        "id": 1788,
        "name": "Alabardero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      }
    ],
    "techs": []
  },
  "folwark": {
    "id": 1734,
    "IconID": 19,
    "key": "folwark",
    "name": "Folwark",
    "internal_name": "FOLWARK1",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 1000,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 100,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 40,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construye folwark () Edificio exclusivo de los polacos. Sirve para depositar alimentos e investigar tecnologías agrícolas. Recoge inmediatamente el 10 % de la comida de las granjas cercanas recién construidas. Proporciona 5 de población. Construye cerca de arbustos u otra fuente de alimento para recoger comida más rápido. Mejoras: campo de visión (centro urbano); puntos de resistencia, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 14,
        "name": "Collera",
        "cost": {
          "Food": 75,
          "Wood": 75
        }
      },
      {
        "id": 13,
        "name": "Arado pesado",
        "cost": {
          "Food": 125,
          "Wood": 125
        }
      },
      {
        "id": 12,
        "name": "Rotación de cultivos",
        "cost": {
          "Food": 250,
          "Wood": 250
        }
      }
    ]
  },
  "caravanserai": {
    "id": 1754,
    "IconID": 87,
    "key": "caravanserai",
    "name": "Caravasar",
    "internal_name": "CARAVANSERAI",
    "builderUnit": "Aldeano",
    "age": 4,
    "ageName": "Edad Imperial",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico / Comercial",
    "baseHp": 2700,
    "baseAttack": 0,
    "meleeArmor": 3,
    "pierceArmor": 10,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 3,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 3,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 175,
      "Food": 0,
      "Gold": 0,
      "Stone": 50
    },
    "buildTime": 60,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir caravasar () Edificio económico único de los indostanos y los persas. Cura y aumenta la velocidad de las carretas de mercancías en un radio de 8 casillas. Mejoras: campo de visión (centro urbano); puntos de resistencia, armadura (universidad).",
    "units": [],
    "techs": []
  },
  "fortified_church": {
    "id": 1806,
    "IconID": 88,
    "key": "fortified_church",
    "name": "Iglesia fortificada",
    "internal_name": "FORTCRCH",
    "builderUnit": "Aldeano",
    "age": 3,
    "ageName": "Edad de los Castillos",
    "class": "Edificio",
    "category": "religious_academic",
    "categoryName": "Religioso / Defensivo",
    "baseHp": 2400,
    "hp": 2400,
    "baseAttack": 5,
    "attack": 5,
    "meleeArmor": 4,
    "pierceArmor": 10,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 4,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 10,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 13,
        "Amount": 0,
        "Name": "Defensa de piedra"
      },
      {
        "Class": 31,
        "Amount": 4,
        "Name": "Condottiero"
      }
    ],
    "attacks": [
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Edificios generales"
      },
      {
        "Class": 16,
        "Amount": 5,
        "Name": "Barcos / Galeras"
      },
      {
        "Class": 3,
        "Amount": 5,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 30,
        "Amount": 1,
        "Name": "Camellos"
      }
    ],
    "baseRange": 4,
    "range": 4,
    "minRange": 1,
    "los": 10,
    "lineOfSight": 10,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 1,
    "projectileSpeed": 7,
    "garrisonCapacity": 10,
    "population": 0,
    "workRate": 1,
    "healRate": 1,
    "cost": {
      "Wood": 200,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 50,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir iglesia fortificada () Monasterio exclusivo de los armenios y los georgianos. Se utiliza para entrenar y mejorar monjes. Alberga reliquias para generar oro. Los aldeanos y las unidades del monasterio pueden guarnecerse en su interior para protegerse. Los aldeanos y las reliquias proporcionan proyectiles adicionales. Los monjes enemigos no pueden convertirla. Mejoras: campo de visión (centro urbano); puntos de resistencia, armadura, precisión (universidad); ataque (herrería).",
    "units": [
      {
        "id": 125,
        "name": "Monje",
        "age": 1,
        "cost": {
          "Food": 0,
          "Gold": 100
        }
      }
    ],
    "techs": [
      {
        "id": 46,
        "name": "Devoción",
        "cost": {
          "Food": 100,
          "Gold": 200
        }
      },
      {
        "id": 45,
        "name": "Fe",
        "cost": {
          "Food": 550,
          "Gold": 750
        }
      },
      {
        "id": 316,
        "name": "Redención",
        "cost": {
          "Food": 0,
          "Gold": 475
        }
      },
      {
        "id": 233,
        "name": "Iluminación",
        "cost": {
          "Food": 0,
          "Gold": 120
        }
      },
      {
        "id": 319,
        "name": "Expiación",
        "cost": {
          "Food": 0,
          "Gold": 325
        }
      },
      {
        "id": 230,
        "name": "Letras de imprenta",
        "cost": {
          "Food": 0,
          "Gold": 200
        }
      },
      {
        "id": 441,
        "name": "Hierbas medicinales",
        "cost": {
          "Food": 0,
          "Gold": 200
        }
      },
      {
        "id": 438,
        "name": "Teocracia",
        "cost": {
          "Food": 0,
          "Gold": 200
        }
      },
      {
        "id": 439,
        "name": "Herejía",
        "cost": {
          "Food": 0,
          "Gold": 1000
        }
      },
      {
        "id": 231,
        "name": "Santidad",
        "cost": {
          "Food": 0,
          "Gold": 175
        }
      },
      {
        "id": 252,
        "name": "Fervor",
        "cost": {
          "Food": 0,
          "Gold": 140
        }
      }
    ]
  },
  "mule_cart": {
    "id": 1808,
    "IconID": 89,
    "key": "mule_cart",
    "name": "Carro de mulas",
    "internal_name": "MULECART",
    "builderUnit": "Centro urbano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico / Móvil",
    "baseHp": 300,
    "baseAttack": 0,
    "meleeArmor": 1,
    "pierceArmor": 2,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 1,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 2,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 1,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 4,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 80,
      "Food": 20,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 25,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir carro de mulas () Depósito móvil único de los armenios y georgianos. Se utiliza para almacenar madera, piedra, oro y caza. Puede ordenársele que se quede cerca de un recurso mientras se vacía. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [],
    "techs": [
      {
        "id": 55,
        "name": "Minería aurífera",
        "cost": {
          "Food": 100,
          "Wood": 75
        }
      },
      {
        "id": 182,
        "name": "Pozo minero aurífero",
        "cost": {
          "Food": 175,
          "Wood": 75
        }
      },
      {
        "id": 278,
        "name": "Explotación de canteras",
        "cost": {
          "Food": 100,
          "Wood": 75
        }
      },
      {
        "id": 279,
        "name": "Pozo de cantera",
        "cost": {
          "Food": 175,
          "Wood": 75
        }
      },
      {
        "id": 202,
        "name": "Hacha de doble filo",
        "cost": {
          "Food": 100,
          "Wood": 50
        }
      },
      {
        "id": 203,
        "name": "Sierra de arco",
        "cost": {
          "Food": 150,
          "Wood": 100
        }
      },
      {
        "id": 221,
        "name": "Sierra a dos",
        "cost": {
          "Food": 300,
          "Wood": 200
        }
      }
    ]
  },
  "pasture": {
    "id": 1889,
    "IconID": 35,
    "key": "pasture",
    "name": "Pastura",
    "internal_name": "PASTURE_BUILD",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 560,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 0,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 0,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 1,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 110,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 22,
    "development": {
      "requiredBuilding": null,
      "requiredTechnology": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Crear pastura () Fuente de comida renovable exclusiva de los kitán. Produce una cantidad limitada de comida hasta que debe reconstruirse. Solo dos aldeanos pueden trabajar en una pastura al mismo tiempo. Los monjes enemigos no pueden convertirla. Mejoras: comida (molino).",
    "units": [],
    "techs": []
  },
  "settlement": {
    "id": 2556,
    "key": "settlement",
    "name": "Asentamiento",
    "internal_name": "SETTL1",
    "builderUnit": "Aldeano",
    "age": 1,
    "ageName": "Alta Edad Media",
    "class": "Edificio",
    "category": "economic",
    "categoryName": "Económico",
    "baseHp": 1000,
    "baseAttack": 0,
    "meleeArmor": 0,
    "pierceArmor": 7,
    "buildingArmor": 0,
    "stoneArmor": 0,
    "armours": [
      {
        "Class": 21,
        "Amount": 0,
        "Name": "Edificios estándar"
      },
      {
        "Class": 11,
        "Amount": 0,
        "Name": "Todos los Edificios"
      },
      {
        "Class": 4,
        "Amount": 0,
        "Name": "Cuerpo a cuerpo (Melee)"
      },
      {
        "Class": 3,
        "Amount": 7,
        "Name": "Antiproyectil (Pierce)"
      },
      {
        "Class": 31,
        "Amount": 0,
        "Name": "Condottiero"
      }
    ],
    "attacks": [],
    "baseRange": 0,
    "minRange": 0,
    "los": 6,
    "reloadTime": 2,
    "attackDelay": 0,
    "accuracy": 100,
    "projectiles": 0,
    "projectileSpeed": 0,
    "garrisonCapacity": 0,
    "population": 0,
    "workRate": 1,
    "healRate": 0,
    "cost": {
      "Wood": 125,
      "Food": 0,
      "Gold": 0,
      "Stone": 0
    },
    "buildTime": 40,
    "development": {
      "requiredBuilding": null,
      "requiredTech": null,
      "upgradedFrom": null,
      "nextUpgrade": null
    },
    "description": "Construir asentamiento () Se usa para depositar todos los recursos e investigar tecnologías económicas. Otorga 5 de población. Constrúyelo cerca de recursos para recolectar más rápido. Se necesita para la granja y el mercado. Mejoras: campo de visión (centro urbano); PR, armadura (universidad); mayor resistencia a los monjes (monasterio).",
    "units": [
      {
        "id": 7,
        "name": "Hostigador",
        "age": 1,
        "cost": {
          "Food": 25,
          "Wood": 35
        }
      },
      {
        "id": 6,
        "name": "Hostigador de élite",
        "age": 1,
        "cost": {
          "Food": 25,
          "Wood": 35
        }
      },
      {
        "id": 93,
        "name": "Lancero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      },
      {
        "id": 358,
        "name": "Piquero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      },
      {
        "id": 359,
        "name": "Alabardero",
        "age": 1,
        "cost": {
          "Food": 35,
          "Wood": 25
        }
      }
    ],
    "techs": [
      {
        "id": 202,
        "name": "Hacha de doble filo",
        "cost": {
          "Food": 100,
          "Wood": 50
        }
      },
      {
        "id": 203,
        "name": "Sierra de arco",
        "cost": {
          "Food": 150,
          "Wood": 100
        }
      },
      {
        "id": 221,
        "name": "Sierra a dos",
        "cost": {
          "Food": 300,
          "Wood": 200
        }
      },
      {
        "id": 14,
        "name": "Collera",
        "cost": {
          "Food": 75,
          "Wood": 75
        }
      },
      {
        "id": 13,
        "name": "Arado pesado",
        "cost": {
          "Food": 125,
          "Wood": 125
        }
      },
      {
        "id": 12,
        "name": "Rotación de cultivos",
        "cost": {
          "Food": 250,
          "Wood": 250
        }
      },
      {
        "id": 55,
        "name": "Minería aurífera",
        "cost": {
          "Food": 100,
          "Wood": 75
        }
      },
      {
        "id": 182,
        "name": "Pozo minero aurífero",
        "cost": {
          "Food": 175,
          "Wood": 75
        }
      },
      {
        "id": 278,
        "name": "Explotación de canteras",
        "cost": {
          "Food": 100,
          "Wood": 75
        }
      },
      {
        "id": 279,
        "name": "Pozo de cantera",
        "cost": {
          "Food": 175,
          "Wood": 75
        }
      }
    ]
  }
};

  const CIV_BUILDING_AVAILABILITY = {
  "ARMENIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    1806,
    109,
    70,
    621,
    276,
    1808,
    84,
    68,
    68
  ],
  "AZTECS": [
    87,
    12,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BENGALIS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BERBERS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BOHEMIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BRITONS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BULGARIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    82,
    1251,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BURGUNDIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    50
  ],
  "BURMESE": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "BYZANTINES": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "CELTS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "CHINESE": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "CUMANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    72,
    792,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "DANES": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "DRAVIDIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "ETHIOPIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "FRANKS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "GEORGIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    1806,
    109,
    70,
    621,
    276,
    1808,
    84,
    68,
    68
  ],
  "GOTHS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    72,
    792,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "GURJARAS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "HINDUSTANIS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    1754,
    584,
    562,
    84,
    68,
    68
  ],
  "HUNS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "INCAS": [
    87,
    12,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    50,
    2556,
    84
  ],
  "ITALIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "JAPANESE": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "JURCHENS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "KHITANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    1889
  ],
  "KHMER": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    50
  ],
  "KOREANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "LITHUANIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "MAGYARS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "MALAY": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "MALIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "MAPUCHE": [
    87,
    12,
    49,
    103,
    45,
    209,
    598,
    79,
    236,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    50,
    2556,
    84
  ],
  "MAYANS": [
    87,
    12,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "MONGOLS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "MUISCA": [
    87,
    12,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    50,
    2556,
    84
  ],
  "PERSIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    1754,
    584,
    562,
    84,
    68,
    68
  ],
  "POLES": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    1734,
    1734
  ],
  "PORTUGUESE": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    1021,
    584,
    562,
    84,
    68,
    68
  ],
  "ROMANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "SARACENS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "SAXONS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "SHU": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "SICILIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    72,
    792,
    487,
    117,
    82,
    1665,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "SLAVS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "SPANISH": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "TATARS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "TEUTONS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "TUPI": [
    87,
    12,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    50,
    2556,
    84
  ],
  "TURKS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "VARANGIANS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "VIETNAMESE": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    236,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "VIKINGS": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "WEI": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    155,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ],
  "WU": [
    87,
    12,
    101,
    49,
    103,
    45,
    209,
    598,
    79,
    234,
    235,
    72,
    792,
    487,
    117,
    82,
    104,
    109,
    70,
    621,
    276,
    584,
    562,
    84,
    68,
    68
  ]
};

  const BUILDING_BONUSES = {
  "general": {
    "civBonuses": [
      {
        "civ": "Malienses",
        "desc": "Los edificios de madera cuestan un 15% menos de madera."
      },
      {
        "civ": "Españoles",
        "desc": "Los aldeanos construyen un 30% más rápido (excepto Maravillas)."
      },
      {
        "civ": "Bizantinos",
        "desc": "Los edificios tienen +10% / +20% / +30% / +40% de HP en Alta Edad Media / Feudal / Castillos / Imperial."
      },
      {
        "civ": "Georgianos",
        "desc": "Los edificios sufren un 15% menos de daño cuando son atacados desde una colina. Las reparaciones cuestan un 25% menos de recursos."
      },
      {
        "civ": "Romanos",
        "desc": "Los aldeanos construyen y reparan un 5% más rápido."
      },
      {
        "civ": "Incas",
        "desc": "Los edificios cuestan un 15% menos de piedra."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Georgianos",
        "desc": "Reparar edificios cuesta un 25% menos de recursos para todo el equipo."
      }
    ]
  },
  "blacksmith": {
    "civBonuses": [
      {
        "civ": "Bohemios",
        "desc": "La Herrería cuesta -100 de madera."
      },
      {
        "civ": "Búlgaros",
        "desc": "Las tecnologías de la Herrería se investigan instantáneamente o con gran bonificación de tiempo."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Búlgaros",
        "desc": "La Herrería trabaja un 80% más rápido para todo el equipo."
      }
    ]
  },
  "monastery": {
    "civBonuses": [
      {
        "civ": "Bohemios",
        "desc": "El Monasterio cuesta -100 de madera."
      },
      {
        "civ": "Bizantinos",
        "desc": "Los Monjes curan un 100% más rápido (Tasa de curación duplicada: 2.0 HP/s)."
      },
      {
        "civ": "Españoles",
        "desc": "Inquisición: Los monjes convierten un 25% más rápido y el Monasterio trabaja con mayor eficiencia."
      },
      {
        "civ": "Birmanos",
        "desc": "Las tecnologías del Monasterio son un 50% más baratas."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Lituanos",
        "desc": "Los Monasterios trabajan un 20% más rápido para todo el equipo."
      }
    ]
  },
  "university": {
    "civBonuses": [
      {
        "civ": "Chinos",
        "desc": "Las tecnologías de la Universidad cuestan -5% / -10% / -15% en Feudal / Castillos / Imperial."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Malienses",
        "desc": "Las Universidades investigan un 80% más rápido para todo el equipo."
      }
    ]
  },
  "castle": {
    "civBonuses": [
      {
        "civ": "Francos",
        "desc": "Los Castillos cuestan un 25% menos de piedra (488 piedra)."
      },
      {
        "civ": "Teutones",
        "desc": "Matacanes gratis. Almenas (Crenellations) otorga +3 de alcance al Castillo."
      },
      {
        "civ": "Búlgaros",
        "desc": "Disponen del Krepost como fortificación intermedia en la Edad de los Castillos."
      },
      {
        "civ": "Georgianos",
        "desc": "Torres esvanas (Corona de Castillos #923): Otorga +2 de ataque al Castillo."
      }
    ],
    "teamBonuses": []
  },
  "town_center": {
    "civBonuses": [
      {
        "civ": "Británicos",
        "desc": "Los Centros urbanos cuestan -50% de madera a partir de la Edad de los Castillos (138 madera)."
      },
      {
        "civ": "Persas",
        "desc": "Los Centros urbanos tienen el doble de HP (4800 HP) y trabajan un +10% / +15% / +20% más rápido en Feudal / Castillos / Imperial."
      },
      {
        "civ": "Teutones",
        "desc": "Los Centros urbanos tienen +2 de capacidad de guarnición y disparan flechas adicionales."
      },
      {
        "civ": "Tártaros",
        "desc": "Los Centros urbanos construidos generan 2 ovejas adicionales en la Edad de los Castillos."
      },
      {
        "civ": "Georgianos",
        "desc": "Torres esvanas (Corona de Castillos #923): Otorga +2 de ataque al Centro Urbano."
      }
    ],
    "teamBonuses": []
  },
  "dock": {
    "civBonuses": [
      {
        "civ": "Persas",
        "desc": "Los Muelles tienen el doble de HP (3600 HP) y trabajan +10% / +15% / +20% más rápido en Feudal / Castillos / Imperial."
      },
      {
        "civ": "Malayos",
        "desc": "Talosocracia mejora los Muelles a Puertos (Harbors) que atacan con flechas automáticas."
      },
      {
        "civ": "Georgianos",
        "desc": "Torres esvanas (Corona de Castillos #923): Otorga +2 de ataque al Muelle."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Vikingos",
        "desc": "Los Muelles cuestan un 15% menos de madera (128 madera) para todo el equipo."
      },
      {
        "civ": "Dravídicos",
        "desc": "Los Muelles proporcionan +5 de espacio de población para todo el equipo."
      }
    ]
  },
  "watch_tower": {
    "civBonuses": [
      {
        "civ": "Coreanos",
        "desc": "Las mejoras de torre son gratuitas. Las torres obtienen +1 de alcance en la Edad de los Castillos y +2 en la Edad Imperial."
      },
      {
        "civ": "Teutones",
        "desc": "Matacanes es gratuito. Las torres pueden guarnecer el doble de unidades (+5 capacidad, hasta 10 unidades)."
      },
      {
        "civ": "Chinos",
        "desc": "Gran Muralla otorga +30% de HP a muros y torres."
      },
      {
        "civ": "Japoneses",
        "desc": "Yasama hace que las torres disparen 2 flechas adicionales."
      },
      {
        "civ": "Incas",
        "desc": "Las torres cuestan un 15% menos de piedra."
      },
      {
        "civ": "Georgianos",
        "desc": "Torres esvanas (Corona de Castillos #923): Otorga +2 de ataque a las torres."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Teutones",
        "desc": "Las torres otorgan +2 de línea de visión a las unidades de todo el equipo."
      }
    ]
  },
  "guard_tower": {
    "civBonuses": [
      {
        "civ": "Coreanos",
        "desc": "Torre de vigilancia gratuita al avanzar a la Edad de los Castillos y +1 de alcance."
      },
      {
        "civ": "Teutones",
        "desc": "Matacanes es gratuito. Las torres pueden guarnecer el doble de unidades (+5 capacidad, hasta 10 unidades)."
      },
      {
        "civ": "Chinos",
        "desc": "Gran Muralla otorga +30% de HP a muros y torres."
      },
      {
        "civ": "Japoneses",
        "desc": "Yasama añade 2 flechas adicionales por descarga."
      },
      {
        "civ": "Incas",
        "desc": "Las torres cuestan un 15% menos de piedra."
      },
      {
        "civ": "Georgianos",
        "desc": "Torres esvanas (Corona de Castillos #923): Otorga +2 de ataque a las torres."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Teutones",
        "desc": "Las torres otorgan +2 de línea de visión a las unidades de todo el equipo."
      }
    ]
  },
  "keep": {
    "civBonuses": [
      {
        "civ": "Coreanos",
        "desc": "Homenaje gratuito al avanzar a la Edad Imperial y +2 de alcance."
      },
      {
        "civ": "Teutones",
        "desc": "Matacanes es gratuito. Las torres pueden guarnecer el doble de unidades (+5 capacidad, hasta 10 unidades)."
      },
      {
        "civ": "Chinos",
        "desc": "Gran Muralla otorga +30% de HP a muros y torres."
      },
      {
        "civ": "Japoneses",
        "desc": "Yasama añade 2 flechas adicionales por descarga."
      },
      {
        "civ": "Incas",
        "desc": "Las torres cuestan un 15% menos de piedra."
      },
      {
        "civ": "Georgianos",
        "desc": "Torres esvanas (Corona de Castillos #923): Otorga +2 de ataque a las torres."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Teutones",
        "desc": "Las torres otorgan +2 de línea de visión a las unidades de todo el equipo."
      }
    ]
  },
  "bombard_tower": {
    "civBonuses": [
      {
        "civ": "Turcos",
        "desc": "Química gratuita al avanzar a Imperial (desbloquea Torre de bombardeo automáticamente). Artillería otorga +2 de alcance (Alcance total 10)."
      },
      {
        "civ": "Teutones",
        "desc": "Matacanes es gratuito. Las torres pueden guarnecer el doble de unidades (+5 capacidad, hasta 10 unidades)."
      },
      {
        "civ": "Chinos",
        "desc": "Gran Muralla otorga +30% de HP a muros y torres."
      },
      {
        "civ": "Incas",
        "desc": "Las torres cuestan un 15% menos de piedra."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Teutones",
        "desc": "Las torres otorgan +2 de línea de visión a las unidades de todo el equipo."
      }
    ]
  },
  "mill": {
    "civBonuses": [
      {
        "civ": "Japoneses",
        "desc": "Los Molinos cuestan un 50% menos de madera (50 madera)."
      },
      {
        "civ": "Francos",
        "desc": "Las mejoras de granja en el Molino son automáticas y gratuitas."
      },
      {
        "civ": "Polacos",
        "desc": "Sustituido por el Folwark, que recoge automáticamente el 8% de las granjas circundantes."
      }
    ],
    "teamBonuses": []
  },
  "lumber_camp": {
    "civBonuses": [
      {
        "civ": "Japoneses",
        "desc": "Los Campamentos madereros cuestan un 50% menos de madera (50 madera)."
      },
      {
        "civ": "Birmanos",
        "desc": "Las tecnologías del campamento maderero son gratuitas."
      }
    ],
    "teamBonuses": []
  },
  "mining_camp": {
    "civBonuses": [
      {
        "civ": "Japoneses",
        "desc": "Los Campamentos mineros cuestan un 50% menos de madera (50 madera)."
      }
    ],
    "teamBonuses": []
  },
  "farm": {
    "civBonuses": [
      {
        "civ": "Teutones",
        "desc": "Las Granjas cuestan un 40% menos de madera (36 madera)."
      },
      {
        "civ": "Eslavos",
        "desc": "Las granjas producen un 10% más rápido."
      },
      {
        "civ": "Sicilianos",
        "desc": "Las tecnologías de granja proporcionan +125% de alimento adicional (+169 con Collar de caballo, +281 con Arado pesado, +394 con Rotación de cultivos)."
      },
      {
        "civ": "Mayas",
        "desc": "Los recursos duran un 15% más (las granjas rinden un 15% más de alimento)."
      },
      {
        "civ": "Romanos",
        "desc": "Los aldeanos trabajan un 5% más rápido en granjas."
      },
      {
        "civ": "Polacos",
        "desc": "El Folwark recolecta inmediatamente el 10% del alimento de las granjas adyacentes al completarse."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Chinos",
        "desc": "Las Granjas proporcionan un 10% más de alimento para todo el equipo."
      }
    ]
  },
  "fish_trap": {
    "civBonuses": [
      {
        "civ": "Malayos",
        "desc": "Las Trampas para peces cuestan un 33% menos de madera (67 madera) y proporcionan el triple de alimento (2130 de alimento)."
      },
      {
        "civ": "Japoneses",
        "desc": "Los barcos pesqueros y trampas para peces trabajan un 15% más rápido."
      }
    ],
    "teamBonuses": []
  },
  "pasture": {
    "civBonuses": [
      {
        "civ": "Kitán",
        "desc": "Estructura exclusiva que genera animales de pastoreo continuamente (140 de alimento por animal). Las mejoras económicas de pastoreo aumentan los animales producidos."
      }
    ],
    "teamBonuses": []
  },
  "barracks": {
    "civBonuses": [
      {
        "civ": "Godos",
        "desc": "Los Cuarteles trabajan un 20% más rápido en la Edad Feudal, 30% en Castillos y 40% en Imperial."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Godos",
        "desc": "Los Cuarteles trabajan un 20% más rápido para todo el equipo."
      }
    ]
  },
  "archery_range": {
    "civBonuses": [
      {
        "civ": "Británicos",
        "desc": "Las Galerías de tiro con arco trabajan un 20% más rápido."
      },
      {
        "civ": "Turcos",
        "desc": "Química gratuita al avanzar a Imperial."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Sarracenos",
        "desc": "Los arqueros a pie infligen +2 de daño contra edificios."
      }
    ]
  },
  "stable": {
    "civBonuses": [
      {
        "civ": "Hunos",
        "desc": "Los Establos trabajan un 20% más rápido."
      }
    ],
    "teamBonuses": [
      {
        "civ": "Hunos",
        "desc": "Los Establos trabajan un 20% más rápido para todo el equipo."
      }
    ]
  },
  "siege_workshop": {
    "civBonuses": [
      {
        "civ": "Celtas",
        "desc": "El Taller de maquinaria de asedio trabaja un 20% más rápido."
      },
      {
        "civ": "Eslavos",
        "desc": "Las armas de asedio son un 15% más baratas."
      }
    ],
    "teamBonuses": []
  },
  "donjon": {
    "civBonuses": [
      {
        "civ": "Sicilianos",
        "desc": "Estructura fortificada única que sustituye a la línea de torres. Permite entrenar Serjeants y guarnecer infantería y aldeanos."
      }
    ],
    "teamBonuses": []
  },
  "folwark": {
    "civBonuses": [
      {
        "civ": "Polacos",
        "desc": "Estructura única que sustituye al Molino. Recoge de inmediato el 10% del alimento de las granjas adyacentes al completarse y otorga +5 de población."
      }
    ],
    "teamBonuses": []
  },
  "settlement": {
    "civBonuses": [
      {
        "civ": "Civilizaciones Sudamericanas",
        "desc": "Estructura regional (Incas, Muiscas, Mapuches, Tupís) que combina depósito universal (alimento, madera, oro, piedra) y proporciona +5 de población."
      }
    ],
    "teamBonuses": []
  },
  "krepost": {
    "civBonuses": [
      {
        "civ": "Búlgaros",
        "desc": "Fortificación intermedia que cuesta un 50% menos de piedra que un Castillo (350 piedra) y permite entrenar y guarnecer Konniks."
      }
    ],
    "teamBonuses": []
  },
  "feitoria": {
    "civBonuses": [
      {
        "civ": "Portugueses",
        "desc": "Factoría económica única disponible en la Edad Imperial que genera oro, madera, comida y piedra continuamente sin aldeanos (ocupa 20 de población)."
      }
    ],
    "teamBonuses": []
  },
  "caravanserai": {
    "civBonuses": [
      {
        "civ": "Indostaníes",
        "desc": "Estructura comercial única que cura unidades aliadas y aumenta la velocidad de los carros de comercio un 10% en un radio cercano."
      },
      {
        "civ": "Persas",
        "desc": "Edificio comercial que mejora la resiliencia y velocidad de los convoyes de comercio aliados."
      }
    ],
    "teamBonuses": []
  },
  "fortified_church": {
    "civBonuses": [
      {
        "civ": "Armenios",
        "desc": "Estructura única que combina funciones de Monasterio y defensa, con capacidad para guarnecer y disparar proyectiles."
      },
      {
        "civ": "Georgianos",
        "desc": "Proporciona a los aldeanos en un radio de 9 casillas un +10% de velocidad de trabajo. Torres esvanas (Corona de Castillos #923) otorga +2 de ataque."
      }
    ],
    "teamBonuses": []
  },
  "mule_cart": {
    "civBonuses": [
      {
        "civ": "Armenios",
        "desc": "Campamento de depósito móvil que cuesta un 25% menos de madera y cuyas tecnologías económicas son un 40% más efectivas."
      },
      {
        "civ": "Georgianos",
        "desc": "Campamento de depósito móvil que acompaña activamente a los recolectores de madera, piedra, oro y comida."
      }
    ],
    "teamBonuses": []
  }
};

  const BUILDING_AGE_SCALING = {
    barracks: {
      1: { hp: 1200, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      2: { hp: 1500, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      3: { hp: 1800, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 5, garrisonCapacity: 10 }
    },
    dock: {
      1: { hp: 1800, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 6, garrisonCapacity: 10 },
      2: { hp: 1800, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 6, garrisonCapacity: 10 },
      3: { hp: 1800, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 6, garrisonCapacity: 10 },
      4: { hp: 1800, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 6, garrisonCapacity: 10 }
    },
    archery_range: {
      1: { hp: 1200, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      2: { hp: 1500, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      3: { hp: 1800, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 5, garrisonCapacity: 10 }
    },
    stable: {
      1: { hp: 1200, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      2: { hp: 1500, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      3: { hp: 1800, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 5, garrisonCapacity: 10 }
    },
    siege_workshop: {
      1: { hp: 1500, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      2: { hp: 1800, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      3: { hp: 2100, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 5, garrisonCapacity: 10 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 5, garrisonCapacity: 10 }
    },
    blacksmith: {
      1: { hp: 1800, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 6 },
      2: { hp: 1800, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 6 },
      3: { hp: 2100, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 6 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 6 }
    },
    market: {
      1: { hp: 1800, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 6 },
      2: { hp: 1800, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 6 },
      3: { hp: 2100, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 6 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 6 }
    },
    monastery: {
      1: { hp: 1800, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 6, garrisonCapacity: 10, healRate: 1.0 },
      2: { hp: 1800, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 6, garrisonCapacity: 10, healRate: 1.0 },
      3: { hp: 2100, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 6, garrisonCapacity: 10, healRate: 1.0 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 6, garrisonCapacity: 10, healRate: 1.0 }
    },
    university: {
      1: { hp: 1800, meleeArmor: 0, pierceArmor: 7, attack: 0, range: 0, los: 6 },
      2: { hp: 1800, meleeArmor: 1, pierceArmor: 8, attack: 0, range: 0, los: 6 },
      3: { hp: 2100, meleeArmor: 2, pierceArmor: 9, attack: 0, range: 0, los: 6 },
      4: { hp: 2100, meleeArmor: 3, pierceArmor: 10, attack: 0, range: 0, los: 6 }
    },
    town_center: {
      1: { hp: 2400, meleeArmor: 0, pierceArmor: 7, attack: 5, range: 6, los: 7, garrisonCapacity: 5 },
      2: { hp: 2400, meleeArmor: 1, pierceArmor: 8, attack: 5, range: 6, los: 8, garrisonCapacity: 15 },
      3: { hp: 2400, meleeArmor: 2, pierceArmor: 9, attack: 5, range: 6, los: 8, garrisonCapacity: 15 },
      4: { hp: 2400, meleeArmor: 3, pierceArmor: 10, attack: 5, range: 6, los: 8, garrisonCapacity: 15 }
    },
    town_center_feudal: {
      1: { hp: 2400, meleeArmor: 0, pierceArmor: 7, attack: 5, range: 6, los: 7, garrisonCapacity: 5 },
      2: { hp: 2400, meleeArmor: 1, pierceArmor: 8, attack: 5, range: 6, los: 8, garrisonCapacity: 15 },
      3: { hp: 2400, meleeArmor: 2, pierceArmor: 9, attack: 5, range: 6, los: 8, garrisonCapacity: 15 },
      4: { hp: 2400, meleeArmor: 3, pierceArmor: 10, attack: 5, range: 6, los: 8, garrisonCapacity: 15 }
    },
    house: {
      1: { hp: 550, meleeArmor: 0, pierceArmor: 7, los: 2, population: 5 },
      2: { hp: 750, meleeArmor: 1, pierceArmor: 8, los: 2, population: 5 },
      3: { hp: 900, meleeArmor: 2, pierceArmor: 9, los: 2, population: 5 },
      4: { hp: 900, meleeArmor: 3, pierceArmor: 10, los: 2, population: 5 }
    },
    mill: {
      1: { hp: 600, meleeArmor: 0, pierceArmor: 7, los: 5 },
      2: { hp: 800, meleeArmor: 1, pierceArmor: 8, los: 5 },
      3: { hp: 1000, meleeArmor: 2, pierceArmor: 9, los: 5 },
      4: { hp: 1000, meleeArmor: 3, pierceArmor: 10, los: 5 }
    },
    lumber_camp: {
      1: { hp: 600, meleeArmor: 0, pierceArmor: 7, los: 5 },
      2: { hp: 800, meleeArmor: 1, pierceArmor: 8, los: 5 },
      3: { hp: 1000, meleeArmor: 2, pierceArmor: 9, los: 5 },
      4: { hp: 1000, meleeArmor: 3, pierceArmor: 10, los: 5 }
    },
    mining_camp: {
      1: { hp: 600, meleeArmor: 0, pierceArmor: 7, los: 5 },
      2: { hp: 800, meleeArmor: 1, pierceArmor: 8, los: 5 },
      3: { hp: 1000, meleeArmor: 2, pierceArmor: 9, los: 5 },
      4: { hp: 1000, meleeArmor: 3, pierceArmor: 10, los: 5 }
    },
    folwark: {
      1: { hp: 700, meleeArmor: 0, pierceArmor: 7, los: 5 },
      2: { hp: 900, meleeArmor: 1, pierceArmor: 8, los: 5 },
      3: { hp: 1000, meleeArmor: 2, pierceArmor: 9, los: 5 },
      4: { hp: 1000, meleeArmor: 3, pierceArmor: 10, los: 5 }
    },
    settlement: {
      1: { hp: 800, meleeArmor: 0, pierceArmor: 7, los: 6, population: 5 },
      2: { hp: 1000, meleeArmor: 1, pierceArmor: 8, los: 6, population: 5 },
      3: { hp: 1200, meleeArmor: 2, pierceArmor: 9, los: 6, population: 5 },
      4: { hp: 1200, meleeArmor: 3, pierceArmor: 10, los: 6, population: 5 }
    },
    farm: {
      1: { hp: 480, meleeArmor: 0, pierceArmor: 0, los: 1 },
      2: { hp: 480, meleeArmor: 0, pierceArmor: 0, los: 1 },
      3: { hp: 480, meleeArmor: 0, pierceArmor: 0, los: 1 },
      4: { hp: 480, meleeArmor: 0, pierceArmor: 0, los: 1 }
    },
    fish_trap: {
      1: { hp: 250, meleeArmor: 1, pierceArmor: 1, los: 1 },
      2: { hp: 250, meleeArmor: 1, pierceArmor: 1, los: 1 },
      3: { hp: 250, meleeArmor: 1, pierceArmor: 1, los: 1 },
      4: { hp: 250, meleeArmor: 1, pierceArmor: 1, los: 1 }
    },
    outpost: {
      1: { hp: 500, meleeArmor: 0, pierceArmor: 0, los: 6 },
      2: { hp: 500, meleeArmor: 1, pierceArmor: 1, los: 8 },
      3: { hp: 500, meleeArmor: 2, pierceArmor: 2, los: 10 },
      4: { hp: 500, meleeArmor: 3, pierceArmor: 3, los: 12 }
    },
    palisade_wall: {
      1: { hp: 250, meleeArmor: 2, pierceArmor: 5, los: 2 },
      2: { hp: 250, meleeArmor: 2, pierceArmor: 5, los: 2 },
      3: { hp: 250, meleeArmor: 2, pierceArmor: 5, los: 2 },
      4: { hp: 250, meleeArmor: 2, pierceArmor: 5, los: 2 }
    },
    palisade_gate: {
      1: { hp: 400, meleeArmor: 2, pierceArmor: 5, los: 2 },
      2: { hp: 400, meleeArmor: 2, pierceArmor: 5, los: 2 },
      3: { hp: 400, meleeArmor: 2, pierceArmor: 5, los: 2 },
      4: { hp: 400, meleeArmor: 2, pierceArmor: 5, los: 2 }
    },
    stone_wall: {
      1: { hp: 1800, meleeArmor: 8, pierceArmor: 10, los: 2 },
      2: { hp: 1800, meleeArmor: 8, pierceArmor: 10, los: 2 },
      3: { hp: 1800, meleeArmor: 8, pierceArmor: 10, los: 2 },
      4: { hp: 1800, meleeArmor: 8, pierceArmor: 10, los: 2 }
    },
    fortified_wall: {
      1: { hp: 3000, meleeArmor: 12, pierceArmor: 12, los: 2 },
      2: { hp: 3000, meleeArmor: 12, pierceArmor: 12, los: 2 },
      3: { hp: 3000, meleeArmor: 12, pierceArmor: 12, los: 2 },
      4: { hp: 3000, meleeArmor: 12, pierceArmor: 12, los: 2 }
    },
    gate: {
      1: { hp: 2750, meleeArmor: 6, pierceArmor: 6, los: 2 },
      2: { hp: 2750, meleeArmor: 6, pierceArmor: 6, los: 2 },
      3: { hp: 4000, meleeArmor: 8, pierceArmor: 8, los: 2 },
      4: { hp: 5000, meleeArmor: 10, pierceArmor: 10, los: 2 }
    },
    watch_tower: {
      1: { hp: 1020, meleeArmor: 1, pierceArmor: 7, attack: 5, range: 8, los: 10, garrisonCapacity: 5 },
      2: { hp: 1020, meleeArmor: 1, pierceArmor: 7, attack: 5, range: 8, los: 10, garrisonCapacity: 5 },
      3: { hp: 1020, meleeArmor: 2, pierceArmor: 8, attack: 5, range: 8, los: 10, garrisonCapacity: 5 },
      4: { hp: 1020, meleeArmor: 3, pierceArmor: 9, attack: 5, range: 8, los: 10, garrisonCapacity: 5 }
    },
    guard_tower: {
      1: { hp: 1500, meleeArmor: 2, pierceArmor: 8, attack: 6, range: 8, los: 10, garrisonCapacity: 5 },
      2: { hp: 1500, meleeArmor: 2, pierceArmor: 8, attack: 6, range: 8, los: 10, garrisonCapacity: 5 },
      3: { hp: 1500, meleeArmor: 2, pierceArmor: 8, attack: 6, range: 8, los: 10, garrisonCapacity: 5 },
      4: { hp: 1500, meleeArmor: 3, pierceArmor: 9, attack: 6, range: 8, los: 10, garrisonCapacity: 5 }
    },
    keep: {
      1: { hp: 2250, meleeArmor: 3, pierceArmor: 9, attack: 7, range: 8, los: 11, garrisonCapacity: 5 },
      2: { hp: 2250, meleeArmor: 3, pierceArmor: 9, attack: 7, range: 8, los: 11, garrisonCapacity: 5 },
      3: { hp: 2250, meleeArmor: 3, pierceArmor: 9, attack: 7, range: 8, los: 11, garrisonCapacity: 5 },
      4: { hp: 2250, meleeArmor: 3, pierceArmor: 9, attack: 7, range: 8, los: 11, garrisonCapacity: 5 }
    },
    bombard_tower: {
      1: { hp: 2220, meleeArmor: 3, pierceArmor: 9, attack: 120, range: 8, minRange: 1, los: 10, garrisonCapacity: 5 },
      2: { hp: 2220, meleeArmor: 3, pierceArmor: 9, attack: 120, range: 8, minRange: 1, los: 10, garrisonCapacity: 5 },
      3: { hp: 2220, meleeArmor: 3, pierceArmor: 9, attack: 120, range: 8, minRange: 1, los: 10, garrisonCapacity: 5 },
      4: { hp: 2220, meleeArmor: 3, pierceArmor: 9, attack: 120, range: 8, minRange: 1, los: 10, garrisonCapacity: 5 }
    },
    donjon: {
      1: { hp: 1000, meleeArmor: 1, pierceArmor: 8, attack: 5, range: 8, los: 10, garrisonCapacity: 10 },
      2: { hp: 1000, meleeArmor: 1, pierceArmor: 8, attack: 5, range: 8, los: 10, garrisonCapacity: 10 },
      3: { hp: 1500, meleeArmor: 2, pierceArmor: 9, attack: 6, range: 8, los: 10, garrisonCapacity: 10 },
      4: { hp: 2250, meleeArmor: 3, pierceArmor: 10, attack: 7, range: 8, los: 11, garrisonCapacity: 10 }
    },
    castle: {
      1: { hp: 4800, meleeArmor: 8, pierceArmor: 11, attack: 11, range: 8, minRange: 1, los: 11, garrisonCapacity: 20 },
      2: { hp: 4800, meleeArmor: 8, pierceArmor: 11, attack: 11, range: 8, minRange: 1, los: 11, garrisonCapacity: 20 },
      3: { hp: 4800, meleeArmor: 8, pierceArmor: 11, attack: 11, range: 8, minRange: 1, los: 11, garrisonCapacity: 20 },
      4: { hp: 4800, meleeArmor: 8, pierceArmor: 11, attack: 11, range: 8, minRange: 1, los: 11, garrisonCapacity: 20 }
    },
    krepost: {
      1: { hp: 3000, meleeArmor: 6, pierceArmor: 9, attack: 9, range: 7, minRange: 1, los: 10, garrisonCapacity: 20 },
      2: { hp: 3000, meleeArmor: 6, pierceArmor: 9, attack: 9, range: 7, minRange: 1, los: 10, garrisonCapacity: 20 },
      3: { hp: 3000, meleeArmor: 6, pierceArmor: 9, attack: 9, range: 7, minRange: 1, los: 10, garrisonCapacity: 20 },
      4: { hp: 3000, meleeArmor: 6, pierceArmor: 9, attack: 9, range: 7, minRange: 1, los: 10, garrisonCapacity: 20 }
    },
    harbor: {
      1: { hp: 2200, meleeArmor: 3, pierceArmor: 9, attack: 6, range: 7, los: 10, garrisonCapacity: 10 },
      2: { hp: 2200, meleeArmor: 3, pierceArmor: 9, attack: 6, range: 7, los: 10, garrisonCapacity: 10 },
      3: { hp: 2200, meleeArmor: 3, pierceArmor: 9, attack: 6, range: 7, los: 10, garrisonCapacity: 10 },
      4: { hp: 2200, meleeArmor: 3, pierceArmor: 9, attack: 6, range: 7, los: 10, garrisonCapacity: 10 }
    },
    fortified_church: {
      1: { hp: 2400, meleeArmor: 4, pierceArmor: 10, attack: 5, range: 4, minRange: 1, los: 10, garrisonCapacity: 10, healRate: 1.0 },
      2: { hp: 2400, meleeArmor: 4, pierceArmor: 10, attack: 5, range: 4, minRange: 1, los: 10, garrisonCapacity: 10, healRate: 1.0 },
      3: { hp: 2400, meleeArmor: 4, pierceArmor: 10, attack: 5, range: 4, minRange: 1, los: 10, garrisonCapacity: 10, healRate: 1.0 },
      4: { hp: 2400, meleeArmor: 4, pierceArmor: 10, attack: 5, range: 4, minRange: 1, los: 10, garrisonCapacity: 10, healRate: 1.0 }
    },
    caravanserai: {
      1: { hp: 2700, meleeArmor: 3, pierceArmor: 10, los: 10 },
      2: { hp: 2700, meleeArmor: 3, pierceArmor: 10, los: 10 },
      3: { hp: 2700, meleeArmor: 3, pierceArmor: 10, los: 10 },
      4: { hp: 2700, meleeArmor: 3, pierceArmor: 10, los: 10 }
    },
    feitoria: {
      1: { hp: 5200, meleeArmor: 3, pierceArmor: 10, los: 10 },
      2: { hp: 5200, meleeArmor: 3, pierceArmor: 10, los: 10 },
      3: { hp: 5200, meleeArmor: 3, pierceArmor: 10, los: 10 },
      4: { hp: 5200, meleeArmor: 3, pierceArmor: 10, los: 10 }
    },
    wonder: {
      1: { hp: 10000, meleeArmor: 3, pierceArmor: 10, los: 8 },
      2: { hp: 10000, meleeArmor: 3, pierceArmor: 10, los: 8 },
      3: { hp: 10000, meleeArmor: 3, pierceArmor: 10, los: 8 },
      4: { hp: 10000, meleeArmor: 3, pierceArmor: 10, los: 8 }
    },
    mule_cart: {
      1: { hp: 80, meleeArmor: 0, pierceArmor: 0, los: 4 },
      2: { hp: 80, meleeArmor: 0, pierceArmor: 0, los: 4 },
      3: { hp: 80, meleeArmor: 0, pierceArmor: 0, los: 4 },
      4: { hp: 80, meleeArmor: 0, pierceArmor: 0, los: 4 }
    },
    pasture: {
      1: { hp: 560, meleeArmor: 0, pierceArmor: 0, los: 3 },
      2: { hp: 560, meleeArmor: 0, pierceArmor: 0, los: 3 },
      3: { hp: 560, meleeArmor: 0, pierceArmor: 0, los: 3 },
      4: { hp: 560, meleeArmor: 0, pierceArmor: 0, los: 3 }
    }
  };

  // Adjuntar ageScaling a cada edificio registrado
  Object.keys(BUILDING_REGISTRY).forEach(k => {
    if (BUILDING_AGE_SCALING[k]) {
      BUILDING_REGISTRY[k].ageScaling = BUILDING_AGE_SCALING[k];
    }
  });

  function getBuildingByKey(keyOrId) {
    if (!keyOrId) return null;
    if (typeof keyOrId === 'object' && keyOrId.key) return keyOrId;
    const str = String(keyOrId).toLowerCase().trim();
    if (BUILDING_REGISTRY[str]) return BUILDING_REGISTRY[str];
    const num = Number(keyOrId);
    if (!isNaN(num)) {
      return Object.values(BUILDING_REGISTRY).find(b => b.id === num) || null;
    }
    return Object.values(BUILDING_REGISTRY).find(b => b.key.toLowerCase() === str || b.internal_name.toLowerCase() === str || b.name.toLowerCase() === str) || null;
  }

  function getAllBuildings() {
    return Object.values(BUILDING_REGISTRY);
  }

  function getBuildingsByCategory(category) {
    if (!category || category === 'all') return getAllBuildings();
    return getAllBuildings().filter(b => b.category === category);
  }

  function getBuildingAvailability(buildingKeyOrId, civName = 'all') {
    // Si availability.js está disponible en el entorno global o Node, delegar en su lógica exhaustiva
    if (typeof window !== 'undefined' && window.availability && typeof window.availability.getBuildingAvailability === 'function') {
      return window.availability.getBuildingAvailability(buildingKeyOrId, civName);
    }
    if (typeof global !== 'undefined' && global.availability && typeof global.availability.getBuildingAvailability === 'function') {
      return global.availability.getBuildingAvailability(buildingKeyOrId, civName);
    }
    if (typeof require === 'function') {
      try {
        const avail = require('./availability.js');
        if (avail && typeof avail.getBuildingAvailability === 'function') {
          return avail.getBuildingAvailability(buildingKeyOrId, civName);
        }
      } catch (e) {}
    }

    const b = getBuildingByKey(buildingKeyOrId);
    const rawKey = b ? b.key : String(buildingKeyOrId || '').toLowerCase().trim();
    const normCiv = String(civName || 'all').toLowerCase().trim();

    // 1. Reemplazos especiales
    if (SPECIAL_REPLACEMENTS[rawKey] && SPECIAL_REPLACEMENTS[rawKey][normCiv]) {
      return SPECIAL_REPLACEMENTS[rawKey][normCiv];
    }

    // 1b. Exclusiones directas sudamericanas (Asentamiento reemplaza campamentos)
    const saCivs = ["muisca", "muiscas", "mapuche", "mapuches", "inca", "incas", "tupi", "tupis", "tupí", "tupís"];
    if (["mill", "molino", "68", "lumber_camp", "campamento_maderero", "562", "mining_camp", "campamento_minero", "584"].includes(rawKey) && saCivs.includes(normCiv)) {
      return { status: 'unavailable', text: 'No disponible' };
    }
    if (["asentamiento", "settlement", "2556"].includes(rawKey)) {
      const isAvail = saCivs.includes(normCiv);
      return { status: isAvail ? 'available' : 'unavailable', text: isAvail ? 'Disponible' : 'No disponible' };
    }

    // 2. Comprobar tabla canónica de Tech Tree
    if (normCiv !== 'all' && normCiv !== 'generic') {
      const upperCiv = normCiv.toUpperCase();
      const availableIds = CIV_BUILDING_AVAILABILITY[upperCiv]
        || CIV_BUILDING_AVAILABILITY[upperCiv.replace(/S$/, '')]
        || CIV_BUILDING_AVAILABILITY[upperCiv + 'S'];
      if (Array.isArray(availableIds) && b) {
        if (availableIds.includes(b.id)) {
          return { status: 'available', text: 'Disponible' };
        } else {
          return { status: 'unavailable', text: 'No disponible' };
        }
      }
    }

    return { status: 'available', text: 'Disponible' };
  }

  function isGeneralBonusRelevant(item, building, bKey) {
    if (!item || !item.civ) return false;
    const civNorm = item.civ.toLowerCase().trim();
    const woodCost = building?.cost?.wood ?? building?.cost?.Wood ?? 0;
    const stoneCost = building?.cost?.stone ?? building?.cost?.Stone ?? 0;
    const k = String(bKey || building?.key || '').toLowerCase().trim();

    // 1. Exclusividad de civilización: si la civilización del bono general no tiene acceso al edificio, descartar
    const exclusiveCivMap = {
      donjon: ['sicilians', 'sicilianos', 'sicil'],
      folwark: ['poles', 'polacos', 'pol'],
      krepost: ['bulgarians', 'búlgaros', 'bulgaros', 'bulgar'],
      feitoria: ['portuguese', 'portugueses', 'portug'],
      caravanserai: ['persians', 'persas', 'hindustanis', 'indostaníes', 'indostanies'],
      fortified_church: ['armenians', 'armenios', 'georgians', 'georgianos'],
      mule_cart: ['armenians', 'armenios', 'georgians', 'georgianos'],
      settlement: ['incas', 'inca', 'muisca', 'mapuche', 'tupi', 'tupí', 'tupis', 'tupís'],
      pasture: ['khitan', 'kitán', 'kitan', 'khitans'],
      harbor: ['malay', 'malayos']
    };

    for (const [exKey, allowedCivs] of Object.entries(exclusiveCivMap)) {
      if (k === exKey || k.includes(exKey)) {
        const allowed = allowedCivs.some(ac => civNorm.includes(ac) || ac.includes(civNorm));
        if (!allowed) return false;
      }
    }

    // Comprobación de disponibilidad canónica si getBuildingAvailability está disponible
    if (typeof getBuildingAvailability === 'function') {
      const avail = getBuildingAvailability(k, item.civ);
      if (avail && avail.status === 'unavailable') return false;
    }

    // 2. Discriminación por recurso
    // Incas: reducción de piedra -> solo si el edificio cuesta piedra (> 0)
    if (civNorm.includes('inca')) {
      if (stoneCost <= 0) return false;
    }

    // Malienses: reducción de madera -> solo si el edificio cuesta madera (> 0)
    if (civNorm.includes('malien') || civNorm.includes('mali')) {
      if (woodCost <= 0) return false;
    }

    // 3. Casos especiales
    // Maravillas: Españoles excluye maravillas
    if ((k === 'wonder' || k === 'maravilla') && (civNorm.includes('español') || civNorm.includes('spanish'))) {
      return false;
    }

    // Granjas y trampas: Georgianos reparación no aplica
    if (['farm', 'granja', 'fish_trap', 'trampa_para_peces'].includes(k) && item.desc && item.desc.toLowerCase().includes('reparar')) {
      return false;
    }

    return true;
  }

  function getBuildingBonuses(buildingKeyOrId, civName) {
    const b = getBuildingByKey(buildingKeyOrId);
    const key = b ? b.key : String(buildingKeyOrId);
    const normCiv = String(civName || '').toLowerCase().trim();

    const specific = BUILDING_BONUSES[key] || { civBonuses: [], teamBonuses: [] };
    const rawGeneral = BUILDING_BONUSES.general || { civBonuses: [], teamBonuses: [] };

    // Filtrar bonos generales según relevancia y disponibilidad para esta estructura
    const relevantGeneralCiv = (rawGeneral.civBonuses || []).filter(item => isGeneralBonusRelevant(item, b, key));
    const relevantGeneralTeam = (rawGeneral.teamBonuses || []).filter(item => isGeneralBonusRelevant(item, b, key));

    const filterList = (list) => {
      if (!normCiv || normCiv === 'all' || normCiv === 'generic' || normCiv === 'genérico') return list;
      return list.filter(item => {
        const itemCiv = item.civ.toLowerCase();
        return itemCiv.includes(normCiv) || normCiv.includes(itemCiv);
      });
    };

    return {
      civBonuses: [...filterList(specific.civBonuses), ...filterList(relevantGeneralCiv)],
      teamBonuses: [...filterList(specific.teamBonuses), ...filterList(relevantGeneralTeam)],
      allCivBonuses: [...specific.civBonuses, ...relevantGeneralCiv],
      allTeamBonuses: [...specific.teamBonuses, ...relevantGeneralTeam]
    };
  }

  function getBuildingImageInfo(bInput) {
    let building = bInput;
    if (bInput && typeof bInput === 'object') {
      building = bInput;
    } else if (bInput !== undefined && bInput !== null) {
      building = getBuildingByKey(bInput) || { name: String(bInput), internal_name: String(bInput) };
    }
    const iconPath = getBuildingIcon(building);
    return {
      id: building?.id || building?.ID || null,
      primarySrc: iconPath,
      fallbackSrc: 'assets/icons/building_placeholder.svg',
      candidates: [iconPath, 'img/Building/98.png', 'assets/icons/building_placeholder.svg']
    };
  }

  function getBuildingApplicableTechs(buildingKey) {
    if (typeof getBuildingTechList === 'function') {
      return getBuildingTechList(buildingKey);
    }
    if (typeof window !== 'undefined' && typeof window.getBuildingTechList === 'function') {
      return window.getBuildingTechList(buildingKey);
    }
    if (typeof require === 'function') {
      try {
        const upg = require('./buildingUpgrades.js');
        if (upg && typeof upg.getBuildingTechList === 'function') {
          return upg.getBuildingTechList(buildingKey);
        }
      } catch (e) {}
    }
    return [];
  }

  // Sincronizar imágenes, IDs canónicos y tecnologías aplicables en BUILDING_REGISTRY
  Object.keys(BUILDING_REGISTRY).forEach(k => {
    const b = BUILDING_REGISTRY[k];
    b.image = getBuildingIcon(b);
    b.canonicalId = b.id;
    b.imageInfo = getBuildingImageInfo(b);
    b.applicableTechs = getBuildingApplicableTechs(b.key);
  });

  return {
    BUILDING_CATEGORIES,
    SPECIAL_REPLACEMENTS,
    BUILDING_REGISTRY,
    CIV_BUILDING_AVAILABILITY,
    BUILDING_BONUSES,
    BUILDING_AGE_SCALING,
    VILLAGER_BUILD_ICONS,
    getBuildingIcon,
    getBuildingImageInfo,
    getBuildingByKey,
    getAllBuildings,
    getBuildingsByCategory,
    getBuildingAvailability,
    getBuildingBonuses,
    getBuildingApplicableTechs
  };
});
