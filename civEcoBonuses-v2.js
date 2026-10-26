// civEcoBonuses-v2.js - Base de datos extraída de bonos económicos con modificadores por edad
(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    global.CIV_ECONOMIC_BONUSES = exports.CIV_ECONOMIC_BONUSES;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  const CIV_ECONOMIC_BONUSES = {
  "britons": {
    id: "120150",
    civ: "Britons",
    bonuses: [
      {
        text: "Shepherds work +25% faster",
        category: "farming",
        targets: ["shepherd", "villager", "sheep"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "shepherd", mode: "multiply", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      },
      {
        text: "Town Centers cost -50% wood starting in Castle Age",
        category: "buildings",
        targets: ["town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "town_center", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: -0.50, imperial: -0.50 } }
        ]
      }
    ]
  },
  "franks": {
    id: "120151",
    civ: "Franks",
    bonuses: [
      {
        text: "Foragers work +15% faster",
        category: "farming",
        targets: ["forager", "villager", "forage_bush"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "forager", mode: "multiply", valuesByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 } }
        ]
      },
      {
        text: "Mill technologies free",
        category: "eco_techs",
        targets: ["mill", "horse_collar", "heavy_plow", "crop_rotation"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "mill_technologies", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      }
    ]
  },
  "goths": {
    id: "120152",
    civ: "Goths",
    bonuses: [
      {
        text: "Loom is researched instantly",
        category: "eco_techs",
        targets: ["loom", "villager", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "research_time", target: "loom", mode: "set", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Hunters carry +15; hunted animals last +20% longer",
        category: "farming",
        targets: ["hunter", "villager", "hunt"],
        isTeamBonus: false,
        modifiers: [
          { stat: "carry_capacity", target: "hunter", mode: "add", valuesByAge: { dark: 15, feudal: 15, castle: 15, imperial: 15 } },
          { stat: "resource_amount", target: "hunt", mode: "multiply", valuesByAge: { dark: 0.20, feudal: 0.20, castle: 0.20, imperial: 0.20 } }
        ]
      },
      {
        text: "+10 population space in Imperial Age",
        category: "buildings",
        targets: ["population"],
        isTeamBonus: false,
        modifiers: [
          { stat: "max_population", target: "civilization", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 10 } }
        ]
      }
    ]
  },
  "teutons": {
    id: "120153",
    civ: "Teutons",
    bonuses: [
      {
        text: "Farms cost -40%",
        category: "farming",
        targets: ["farm"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "farm", mode: "multiply", valuesByAge: { dark: -0.40, feudal: -0.40, castle: -0.40, imperial: -0.40 } }
        ]
      },
      {
        text: "Town Centers +10 garrison capacity; Towers +5 garrison capacity. Murder Holes is free",
        description: "Matacanes es gratuito. Las torres pueden guarnecer el doble de unidades (+5 capacidad).",
        category: "buildings",
        targets: ["town_center", "watch_tower", "guard_tower", "keep", "bombard_tower", "tower"],
        targetBuildings: ["watch_tower", "guard_tower", "keep", "bombard_tower"],
        isTeamBonus: false,
        modifiers: [
          { stat: "garrison_capacity", target: "town_center", mode: "add", valuesByAge: { dark: 10, feudal: 10, castle: 10, imperial: 10 } },
          { stat: "garrison_capacity", target: "tower", mode: "add", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } }
        ]
      }
    ]
  },
  "japanese": {
    id: "120154",
    civ: "Japanese",
    bonuses: [
      {
        text: "Mills, Lumber- and Mining Camps cost -50%",
        category: "buildings",
        targets: ["mill", "lumber_camp", "mining_camp"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "drop_off_buildings", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: -0.50 } }
        ]
      },
      {
        text: "Fishing Ships work +5/10/15/20% faster in Dark/Feudal/Castle/Imperial Age; +100% HP",
        category: "farming",
        targets: ["fishing_ship", "fish_trap"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "fishing_ship", mode: "multiply", valuesByAge: { dark: 0.05, feudal: 0.10, castle: 0.15, imperial: 0.20 } },
          { stat: "hp", target: "fishing_ship", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } }
        ]
      }
    ]
  },
  "chinese": {
    id: "120155",
    civ: "Chinese",
    bonuses: [
      {
        text: "Start with +3 Villagers, but -50 wood and -200 food",
        category: "starting_resources",
        targets: ["villager", "wood", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_villagers", target: "villager", mode: "add", valuesByAge: { dark: 3, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_wood", target: "wood", mode: "add", valuesByAge: { dark: -50, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_food", target: "food", mode: "add", valuesByAge: { dark: -200, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Technologies cost -5/10/15% in Feudal/Castle/Imperial Age",
        category: "eco_techs",
        targets: ["technologies"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "technologies", mode: "multiply", valuesByAge: { dark: 0, feudal: -0.05, castle: -0.10, imperial: -0.15 } }
        ]
      },
      {
        text: "Town Centers +7 line of sight and provide +15 population space",
        category: "buildings",
        targets: ["town_center", "population"],
        isTeamBonus: false,
        modifiers: [
          { stat: "line_of_sight", target: "town_center", mode: "add", valuesByAge: { dark: 7, feudal: 7, castle: 7, imperial: 7 } },
          { stat: "population_provided", target: "town_center", mode: "set", valuesByAge: { dark: 15, feudal: 15, castle: 15, imperial: 15 } }
        ]
      },
      {
        text: "Farms +10% food",
        description: "Las granjas proporcionan un 10% más de alimento.",
        category: "farming",
        targets: ["farm"],
        targetBuildings: ["farm"],
        isTeamBonus: true,
        effect: { type: 'foodCapacityMultiplier', value: 1.10 },
        modifiers: [
          { stat: "resource_amount", target: "farm", mode: "multiply", valuesByAge: { dark: 0.10, feudal: 0.10, castle: 0.10, imperial: 0.10 } }
        ]
      }
    ]
  },
  "byzantines": {
    id: "120156",
    civ: "Byzantines",
    bonuses: [
      {
        text: "Buildings +10/20/30/40% HP in Dark/Feudal/Castle/Imperial Age",
        category: "buildings",
        targets: ["buildings"],
        isTeamBonus: false,
        modifiers: [
          { stat: "hp", target: "buildings", mode: "multiply", valuesByAge: { dark: 0.10, feudal: 0.20, castle: 0.30, imperial: 0.40 } }
        ]
      },
      {
        text: "Town Watch, Town Patrol free",
        category: "eco_techs",
        targets: ["town_watch", "town_patrol", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "town_watch_line", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Advancing to Imperial Age costs -33%",
        category: "eco_techs",
        targets: ["imperial_age", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "imperial_age", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: -0.33, imperial: -0.33 } }
        ]
      }
    ]
  },
  "persians": {
    id: "120157",
    civ: "Persians",
    bonuses: [
      {
        text: "Start with +50 wood and +50 food",
        category: "starting_resources",
        targets: ["wood", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_wood", target: "wood", mode: "add", valuesByAge: { dark: 50, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_food", target: "food", mode: "add", valuesByAge: { dark: 50, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Town Centers and Docks +100% HP and work +5/10/15/20% faster in Dark/Feudal/Castle/Imperial Age",
        category: "buildings",
        targets: ["town_center", "dock", "villager", "fishing_ship"],
        isTeamBonus: false,
        modifiers: [
          { stat: "hp", target: "town_center_and_dock", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } },
          { stat: "work_rate", target: "town_center_and_dock", mode: "multiply", valuesByAge: { dark: 0.05, feudal: 0.10, castle: 0.15, imperial: 0.20 } }
        ]
      },
      {
        text: "Can build Caravanserai in Imperial Age",
        category: "trade",
        targets: ["caravanserai", "trade_cart"],
        isTeamBonus: false,
        modifiers: [
          { stat: "unlock_building", target: "caravanserai", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 1 } }
        ]
      }
    ]
  },
  "saracens": {
    id: "120158",
    civ: "Saracens",
    bonuses: [
      {
        text: "Market trading fee only 5%; Markets cost -100 wood",
        category: "trade",
        targets: ["market"],
        isTeamBonus: false,
        modifiers: [
          { stat: "market_fee", target: "market", mode: "set", valuesByAge: { dark: 0.05, feudal: 0.05, castle: 0.05, imperial: 0.05 } },
          { stat: "wood_cost", target: "market", mode: "add", valuesByAge: { dark: -100, feudal: -100, castle: -100, imperial: -100 } }
        ]
      },
      {
        text: "Transport Ships +100% HP, +20 carry capacity",
        category: "buildings",
        targets: ["transport_ship"],
        isTeamBonus: false,
        modifiers: [
          { stat: "hp", target: "transport_ship", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } },
          { stat: "garrison_capacity", target: "transport_ship", mode: "add", valuesByAge: { dark: 20, feudal: 20, castle: 20, imperial: 20 } }
        ]
      }
    ]
  },
  "turks": {
    id: "120159",
    civ: "Turks",
    bonuses: [
      {
        text: "Gold miners work +25% faster",
        category: "mining",
        targets: ["gold_miner", "villager", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "gold_miner", mode: "multiply", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      }
    ]
  },
  "vikings": {
    id: "120160",
    civ: "Vikings",
    bonuses: [
      {
        text: "Wheelbarrow, Hand Cart free",
        category: "eco_techs",
        targets: ["wheelbarrow", "hand_cart", "villager", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "wheelbarrow_line", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Docks cost -15%",
        description: "Los muelles cuestan un 15% menos de madera (128 de madera).",
        category: "buildings",
        targets: ["dock"],
        targetBuildings: ["dock"],
        isTeamBonus: true,
        effect: { type: 'costMultiplier', resource: 'wood', value: 0.85 },
        modifiers: [
          { stat: "wood_cost", target: "dock", mode: "multiply", valuesByAge: { dark: -0.15, feudal: -0.15, castle: -0.15, imperial: -0.15 } }
        ]
      }
    ]
  },
  "mongols": {
    id: "120161",
    civ: "Mongols",
    bonuses: [
      {
        text: "Hunters work +40% faster",
        category: "farming",
        targets: ["hunter", "villager", "hunt"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "hunter", mode: "multiply", valuesByAge: { dark: 0.40, feudal: 0.40, castle: 0.40, imperial: 0.40 } }
        ]
      },
      {
        text: "Nomads (Lost Houses do not decrease population space)",
        category: "buildings",
        targets: ["house", "population"],
        isTeamBonus: false,
        modifiers: [
          { stat: "retain_pop_on_destroy", target: "house", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "celts": {
    id: "120162",
    civ: "Celts",
    bonuses: [
      {
        text: "Lumberjacks work +15% faster",
        category: "wood",
        targets: ["lumberjack", "villager", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "lumberjack", mode: "multiply", valuesByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 } }
        ]
      },
      {
        text: "Livestock animals within Celt unit line of sight cannot be stolen",
        category: "farming",
        targets: ["sheep", "livestock"],
        isTeamBonus: false,
        modifiers: [
          { stat: "herdable_conversion_immunity", target: "livestock", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "spanish": {
    id: "120163",
    civ: "Spanish",
    bonuses: [
      {
        text: "Builders work +30% faster",
        category: "buildings",
        targets: ["builder", "villager", "buildings"],
        isTeamBonus: false,
        modifiers: [
          { stat: "build_speed", target: "builder", mode: "multiply", valuesByAge: { dark: 0.30, feudal: 0.30, castle: 0.30, imperial: 0.30 } }
        ]
      },
      {
        text: "Receive +20 gold for each technology researched",
        category: "starting_resources",
        targets: ["gold", "technologies"],
        isTeamBonus: false,
        modifiers: [
          { stat: "gold_on_tech_research", target: "technologies", mode: "add", valuesByAge: { dark: 20, feudal: 20, castle: 20, imperial: 20 } }
        ]
      },
      {
        text: "Blacksmith upgrades cost no gold",
        category: "eco_techs",
        targets: ["blacksmith", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "gold_cost", target: "blacksmith_technologies", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Supremacy (Villagers +40 HP, +6 attack, +2 melee/+2 pierce armor)",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "hp", target: "villager", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 40 } },
          { stat: "attack", target: "villager", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 6 } },
          { stat: "melee_armor", target: "villager", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 2 } },
          { stat: "pierce_armor", target: "villager", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 2 } }
        ]
      },
      {
        text: "Trade Units generate +25% gold",
        category: "trade",
        targets: ["trade_cart", "trade_cog", "gold"],
        isTeamBonus: true,
        modifiers: [
          { stat: "gold_generation", target: "trade_units", mode: "multiply", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      }
    ]
  },
  "aztecs": {
    id: "120164",
    civ: "Aztecs",
    bonuses: [
      {
        text: "Start with +50 gold",
        category: "starting_resources",
        targets: ["gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_gold", target: "gold", mode: "add", valuesByAge: { dark: 50, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Villagers carry +3",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "carry_capacity", target: "villager", mode: "add", valuesByAge: { dark: 3, feudal: 3, castle: 3, imperial: 3 } }
        ]
      },
      {
        text: "Relics generate +33% gold",
        category: "starting_resources",
        targets: ["relic", "gold"],
        isTeamBonus: true,
        modifiers: [
          { stat: "gold_generation", target: "relic", mode: "multiply", valuesByAge: { dark: 0.33, feudal: 0.33, castle: 0.33, imperial: 0.33 } }
        ]
      }
    ]
  },
  "mayans": {
    id: "120165",
    civ: "Mayans",
    bonuses: [
      {
        text: "Start with +1 Villager, but -50 food",
        category: "starting_resources",
        targets: ["villager", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_villagers", target: "villager", mode: "add", valuesByAge: { dark: 1, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_food", target: "food", mode: "add", valuesByAge: { dark: -50, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Resources last +15% longer",
        category: "gathering_general",
        targets: ["wood", "food", "gold", "stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "resource_yield", target: "natural_resources", mode: "multiply", valuesByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 } }
        ]
      },
      {
        text: "Walls cost -50%",
        category: "buildings",
        targets: ["palisade_wall", "stone_wall"],
        isTeamBonus: true,
        modifiers: [
          { stat: "cost", target: "walls", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: -0.50 } }
        ]
      }
    ]
  },
  "huns": {
    id: "120166",
    civ: "Huns",
    bonuses: [
      {
        text: "Do not need houses, but start with -100 wood",
        category: "starting_resources",
        targets: ["house", "population", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "no_house_required", target: "population", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } },
          { stat: "starting_wood", target: "wood", mode: "add", valuesByAge: { dark: -100, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "On Nomadic maps, the first Town Center spawns a scouting Horse",
        category: "buildings",
        targets: ["town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "spawn_scouting_horse_nomad", target: "town_center", mode: "add", valuesByAge: { dark: 1, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Atheism (Enemy Relics generate -50% resources; Wonder and Relic victory takes +100 years)",
        category: "starting_resources",
        targets: ["relic"],
        isTeamBonus: false,
        modifiers: [
          { stat: "enemy_relic_generation", target: "relic", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: -0.50 } }
        ]
      }
    ]
  },
  "koreans": {
    id: "120167",
    civ: "Koreans",
    bonuses: [
      {
        text: "Stone miners work +20% faster",
        category: "mining",
        targets: ["stone_miner", "villager", "stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "stone_miner", mode: "multiply", valuesByAge: { dark: 0.20, feudal: 0.20, castle: 0.20, imperial: 0.20 } }
        ]
      },
      {
        text: "Villagers +3 line of sight",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: true,
        modifiers: [
          { stat: "line_of_sight", target: "villager", mode: "add", valuesByAge: { dark: 3, feudal: 3, castle: 3, imperial: 3 } }
        ]
      },
      {
        text: "Tower upgrades are free. Towers +1 range in Castle Age, +2 in Imperial Age",
        description: "Las mejoras de torre son gratuitas. Las torres obtienen +1 de alcance en la Edad de los Castillos y +2 en la Edad Imperial.",
        category: "buildings",
        targets: ["watch_tower", "guard_tower", "keep", "tower"],
        targetBuildings: ["watch_tower", "guard_tower", "keep"],
        isTeamBonus: false,
        modifiers: [
          { stat: "range", target: "tower", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 1, imperial: 2 } }
        ]
      }
    ]
  },
  "italians": {
    id: "120168",
    civ: "Italians",
    bonuses: [
      {
        text: "Advancing to the next Age costs -15%",
        category: "eco_techs",
        targets: ["feudal_age", "castle_age", "imperial_age", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "age_up", mode: "multiply", valuesByAge: { dark: -0.15, feudal: -0.15, castle: -0.15, imperial: 0 } }
        ]
      },
      {
        text: "Dock and University technologies cost -25%",
        category: "eco_techs",
        targets: ["dock", "university"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "dock_and_university_technologies", mode: "multiply", valuesByAge: { dark: -0.25, feudal: -0.25, castle: -0.25, imperial: -0.25 } }
        ]
      },
      {
        text: "Fishing Ships cost -15%",
        category: "farming",
        targets: ["fishing_ship", "dock"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "fishing_ship", mode: "multiply", valuesByAge: { dark: -0.15, feudal: -0.15, castle: -0.15, imperial: -0.15 } }
        ]
      },
      {
        text: "Silk Road (Trade Units cost -50%)",
        category: "trade",
        targets: ["trade_cart", "trade_cog"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "trade_units", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: -0.50 } }
        ]
      }
    ]
  },
  "hindustanis": {
    id: "120169",
    civ: "Hindustanis",
    bonuses: [
      {
        text: "Villagers cost -8/13/18/23% in Dark/Feudal/Castle/Imperial Age",
        category: "gathering_general",
        targets: ["villager", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "food_cost", target: "villager", mode: "multiply", valuesByAge: { dark: -0.08, feudal: -0.13, castle: -0.18, imperial: -0.23 } }
        ]
      },
      {
        text: "Can build Caravanserai in Imperial Age",
        category: "trade",
        targets: ["caravanserai", "trade_cart"],
        isTeamBonus: false,
        modifiers: [
          { stat: "unlock_building", target: "caravanserai", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 1 } }
        ]
      },
      {
        text: "Grand Trunk Road (All gold income +10% faster; Market trading fee reduced to 10%)",
        category: "trade",
        targets: ["gold", "gold_miner", "trade_cart", "trade_cog", "relic", "market"],
        isTeamBonus: false,
        modifiers: [
          { stat: "gold_income_rate", target: "all_gold_sources", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: 0.10, imperial: 0.10 } },
          { stat: "market_fee", target: "market", mode: "set", valuesByAge: { dark: 0.30, feudal: 0.30, castle: 0.10, imperial: 0.10 } }
        ]
      }
    ]
  },
  "incas": {
    id: "120170",
    civ: "Incas",
    bonuses: [
      {
        text: "Houses and Settlements provide +5 population space",
        category: "buildings",
        targets: ["house", "settlement", "population"],
        isTeamBonus: false,
        modifiers: [
          { stat: "population_provided", target: "house_and_settlement", mode: "add", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } }
        ]
      },
      {
        text: "Buildings cost -15% stone",
        category: "buildings",
        targets: ["town_center", "castle", "watch_tower", "stone_wall"],
        isTeamBonus: false,
        modifiers: [
          { stat: "stone_cost", target: "buildings", mode: "multiply", valuesByAge: { dark: -0.15, feudal: -0.15, castle: -0.15, imperial: -0.15 } }
        ]
      },
      {
        text: "Villagers affected by Infantry Blacksmith upgrades starting in Castle Age",
        category: "gathering_general",
        targets: ["villager", "blacksmith"],
        isTeamBonus: false,
        modifiers: [
          { stat: "apply_infantry_blacksmith", target: "villager", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 1, imperial: 1 } }
        ]
      },
      {
        text: "Start with a free Llama",
        category: "starting_resources",
        targets: ["llama", "sheep", "food"],
        isTeamBonus: true,
        modifiers: [
          { stat: "starting_herdables", target: "llama", mode: "add", valuesByAge: { dark: 1, feudal: 0, castle: 0, imperial: 0 } }
        ]
      }
    ]
  },
  "magyars": {
    id: "120171",
    civ: "Magyars",
    bonuses: [
      {
        text: "Villagers defeat wolves with one strike",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "one_shot_predators", target: "villager", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "slavs": {
    id: "120172",
    civ: "Slavs",
    bonuses: [
      {
        text: "Farmers work +15% faster",
        category: "farming",
        targets: ["farmer", "villager", "farm"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "farmer", mode: "multiply", valuesByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 } }
        ]
      },
      {
        text: "Detinets (Replaces 40% of Castle and Watch Tower-line stone cost with additional wood cost)",
        category: "buildings",
        targets: ["castle", "watch_tower", "stone", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "stone_to_wood_cost_ratio", target: "castle_and_tower", mode: "set", valuesByAge: { dark: 0, feudal: 0, castle: 0.40, imperial: 0.40 } }
        ]
      },
      {
        text: "Military buildings (except Castles) provide +5 population space",
        category: "buildings",
        targets: ["barracks", "archery_range", "stable", "siege_workshop", "population"],
        isTeamBonus: true,
        modifiers: [
          { stat: "population_provided", target: "military_buildings", mode: "add", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } }
        ]
      }
    ]
  },
  "portuguese": {
    id: "120173",
    civ: "Portuguese",
    bonuses: [
      {
        text: "Foragers generate wood in addition to food",
        category: "farming",
        targets: ["forager", "villager", "forage_bush", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "secondary_wood_ratio", target: "forager", mode: "set", valuesByAge: { dark: 0.33, feudal: 0.33, castle: 0.33, imperial: 0.33 } }
        ]
      },
      {
        text: "All units cost -20% gold",
        category: "gathering_general",
        targets: ["gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "gold_cost", target: "all_units", mode: "multiply", valuesByAge: { dark: -0.20, feudal: -0.20, castle: -0.20, imperial: -0.20 } }
        ]
      },
      {
        text: "Can build Feitoria in Imperial Age",
        category: "starting_resources",
        targets: ["feitoria", "food", "wood", "gold", "stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "unlock_building", target: "feitoria", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 1 } }
        ]
      },
      {
        text: "Technologies research +25% faster",
        category: "eco_techs",
        targets: ["technologies"],
        isTeamBonus: true,
        modifiers: [
          { stat: "research_speed", target: "technologies", mode: "multiply", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      }
    ]
  },
  "ethiopians": {
    id: "120174",
    civ: "Ethiopians",
    bonuses: [
      {
        text: "Receive +100 gold and +100 food when advancing to the next Age",
        category: "starting_resources",
        targets: ["gold", "food", "feudal_age", "castle_age", "imperial_age"],
        isTeamBonus: false,
        modifiers: [
          { stat: "food_on_age_up", target: "food", mode: "add", valuesByAge: { dark: 0, feudal: 100, castle: 100, imperial: 100 } },
          { stat: "gold_on_age_up", target: "gold", mode: "add", valuesByAge: { dark: 0, feudal: 100, castle: 100, imperial: 100 } }
        ]
      },
      {
        text: "Outposts +3 line of sight and cost no stone",
        category: "buildings",
        targets: ["outpost", "stone"],
        isTeamBonus: true,
        modifiers: [
          { stat: "line_of_sight", target: "outpost", mode: "add", valuesByAge: { dark: 3, feudal: 3, castle: 3, imperial: 3 } },
          { stat: "stone_cost", target: "outpost", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      }
    ]
  },
  "malians": {
    id: "120175",
    civ: "Malians",
    bonuses: [
      {
        text: "Buildings cost -15% wood",
        category: "buildings",
        targets: ["buildings", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "buildings_except_farms", mode: "multiply", valuesByAge: { dark: -0.15, feudal: -0.15, castle: -0.15, imperial: -0.15 } }
        ]
      },
      {
        text: "Villagers drop off +10% more gold",
        category: "mining",
        targets: ["gold_miner", "villager", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "drop_off_multiplier", target: "gold_miner", mode: "multiply", valuesByAge: { dark: 0.10, feudal: 0.10, castle: 0.10, imperial: 0.10 } }
        ]
      },
      {
        text: "Universities work +80% faster",
        category: "eco_techs",
        targets: ["university"],
        isTeamBonus: true,
        modifiers: [
          { stat: "work_rate", target: "university", mode: "multiply", valuesByAge: { dark: 0.80, feudal: 0.80, castle: 0.80, imperial: 0.80 } }
        ]
      }
    ]
  },
  "berbers": {
    id: "120176",
    civ: "Berbers",
    bonuses: [
      {
        text: "Villagers move +5% faster in Dark Age, +10% faster starting in Feudal Age",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "move_speed", target: "villager", mode: "multiply", valuesByAge: { dark: 0.05, feudal: 0.10, castle: 0.10, imperial: 0.10 } }
        ]
      },
      {
        text: "Ships move +10% faster",
        category: "farming",
        targets: ["fishing_ship", "trade_cog", "transport_ship"],
        isTeamBonus: false,
        modifiers: [
          { stat: "move_speed", target: "ships", mode: "multiply", valuesByAge: { dark: 0.10, feudal: 0.10, castle: 0.10, imperial: 0.10 } }
        ]
      }
    ]
  },
  "khmer": {
    id: "120177",
    civ: "Khmer",
    bonuses: [
      {
        text: "No buildings required to advance to the next Age or to unlock other buildings",
        category: "buildings",
        targets: ["buildings", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "no_building_prerequisites", target: "buildings_and_ages", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      },
      {
        text: "Farmers don't require Mills or Town Centers to drop off food",
        category: "farming",
        targets: ["farmer", "villager", "farm", "mill", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "instant_drop_off", target: "farmer", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      },
      {
        text: "Villagers can garrison in Houses",
        category: "buildings",
        targets: ["villager", "house"],
        isTeamBonus: false,
        modifiers: [
          { stat: "garrison_capacity", target: "house", mode: "set", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } }
        ]
      }
    ]
  },
  "malay": {
    id: "120178",
    civ: "Malay",
    bonuses: [
      {
        text: "Advancing to the next Age is +66% faster",
        category: "eco_techs",
        targets: ["feudal_age", "castle_age", "imperial_age", "town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "research_speed", target: "age_up", mode: "multiply", valuesByAge: { dark: 0.66, feudal: 0.66, castle: 0.66, imperial: 0 } }
        ]
      },
      {
        text: "Fish Traps cost -33% and provide +200% food",
        category: "farming",
        targets: ["fish_trap", "fishing_ship"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "fish_trap", mode: "multiply", valuesByAge: { dark: -0.33, feudal: -0.33, castle: -0.33, imperial: -0.33 } },
          { stat: "resource_amount", target: "fish_trap", mode: "multiply", valuesByAge: { dark: 2.0, feudal: 2.0, castle: 2.0, imperial: 2.0 } }
        ]
      },
      {
        text: "Docks +6 line of sight",
        category: "buildings",
        targets: ["dock"],
        isTeamBonus: true,
        modifiers: [
          { stat: "line_of_sight", target: "dock", mode: "add", valuesByAge: { dark: 6, feudal: 6, castle: 6, imperial: 6 } }
        ]
      }
    ]
  },
  "burmese": {
    id: "120179",
    civ: "Burmese",
    bonuses: [
      {
        text: "Lumber Camp technologies free",
        category: "eco_techs",
        targets: ["lumber_camp", "double_bit_axe", "bow_saw", "two_man_saw"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "lumber_camp_technologies", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Monastery technologies cost -50%",
        category: "eco_techs",
        targets: ["monastery"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "monastery_technologies", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: -0.50 } }
        ]
      },
      {
        text: "Relics visible on the map at the start of the game",
        category: "starting_resources",
        targets: ["relic"],
        isTeamBonus: true,
        modifiers: [
          { stat: "reveal_on_map", target: "relic", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "vietnamese": {
    id: "120180",
    civ: "Vietnamese",
    bonuses: [
      {
        text: "Economic upgrades cost no wood and research +100% faster",
        category: "eco_techs",
        targets: ["mill", "lumber_camp", "mining_camp", "market", "town_center", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "economic_technologies", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } },
          { stat: "research_speed", target: "economic_technologies", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } }
        ]
      },
      {
        text: "Paper Money (Lumberjacks slowly generate gold in addition to wood)",
        category: "wood",
        targets: ["lumberjack", "villager", "wood", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "secondary_gold_rate", target: "lumberjack", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 0.019 } }
        ]
      }
    ]
  },
  "bulgarians": {
    id: "120181",
    civ: "Bulgarians",
    bonuses: [
      {
        text: "Blacksmith and Siege Workshop technologies cost -50% food",
        category: "eco_techs",
        targets: ["blacksmith", "siege_workshop", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "food_cost", target: "blacksmith_and_siege_technologies", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: -0.50 } }
        ]
      },
      {
        text: "Town Centers cost -50% stone",
        category: "buildings",
        targets: ["town_center", "stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "stone_cost", target: "town_center", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: -0.50 } }
        ]
      },
      {
        text: "Blacksmiths work +80% faster",
        category: "eco_techs",
        targets: ["blacksmith"],
        isTeamBonus: true,
        modifiers: [
          { stat: "work_rate", target: "blacksmith", mode: "multiply", valuesByAge: { dark: 0.80, feudal: 0.80, castle: 0.80, imperial: 0.80 } }
        ]
      }
    ]
  },
  "tatars": {
    id: "120182",
    civ: "Tatars",
    bonuses: [
      {
        text: "Livestock animals last +50% longer",
        category: "farming",
        targets: ["shepherd", "villager", "sheep", "livestock"],
        isTeamBonus: false,
        modifiers: [
          { stat: "resource_amount", target: "livestock", mode: "multiply", valuesByAge: { dark: 0.50, feudal: 0.50, castle: 0.50, imperial: 0.50 } }
        ]
      },
      {
        text: "New Town Centers spawn 2 Sheep starting in Castle Age",
        category: "farming",
        targets: ["town_center", "sheep"],
        isTeamBonus: false,
        modifiers: [
          { stat: "spawn_sheep_on_tc_build", target: "town_center", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 2, imperial: 2 } }
        ]
      }
    ]
  },
  "cumans": {
    id: "120183",
    civ: "Cumans",
    bonuses: [
      {
        text: "One additional Town Center can be built in Feudal Age",
        category: "buildings",
        targets: ["town_center"],
        isTeamBonus: false,
        modifiers: [
          { stat: "additional_tc_limit", target: "town_center", mode: "add", valuesByAge: { dark: 0, feudal: 1, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Archery Ranges and Stables cost -75 wood",
        category: "buildings",
        targets: ["archery_range", "stable", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "archery_range_and_stable", mode: "add", valuesByAge: { dark: -75, feudal: -75, castle: -75, imperial: -75 } }
        ]
      },
      {
        text: "Palisade Walls +33% HP",
        category: "buildings",
        targets: ["palisade_wall"],
        isTeamBonus: true,
        modifiers: [
          { stat: "hp", target: "palisade_wall", mode: "multiply", valuesByAge: { dark: 0.33, feudal: 0.33, castle: 0.33, imperial: 0.33 } }
        ]
      }
    ]
  },
  "lithuanians": {
    id: "120184",
    civ: "Lithuanians",
    bonuses: [
      {
        text: "Each Town Center provides +100 food",
        category: "starting_resources",
        targets: ["town_center", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "food_on_tc_completion", target: "town_center", mode: "add", valuesByAge: { dark: 100, feudal: 100, castle: 100, imperial: 100 } }
        ]
      },
      {
        text: "Monasteries work +20% faster",
        category: "eco_techs",
        targets: ["monastery"],
        isTeamBonus: true,
        modifiers: [
          { stat: "work_rate", target: "monastery", mode: "multiply", valuesByAge: { dark: 0.20, feudal: 0.20, castle: 0.20, imperial: 0.20 } }
        ]
      }
    ]
  },
  "burgundians": {
    id: "120185",
    civ: "Burgundians",
    bonuses: [
      {
        text: "Economic upgrades available one age earlier and cost -40% food",
        category: "eco_techs",
        targets: ["mill", "lumber_camp", "mining_camp", "market", "town_center", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "age_requirement_offset", target: "economic_technologies", mode: "add", valuesByAge: { dark: -1, feudal: -1, castle: -1, imperial: 0 } },
          { stat: "food_cost", target: "economic_technologies", mode: "multiply", valuesByAge: { dark: -0.40, feudal: -0.40, castle: -0.40, imperial: -0.40 } }
        ]
      },
      {
        text: "Burgundian Vineyards (Farmers slowly generate gold in addition to food)",
        category: "farming",
        targets: ["farmer", "villager", "farm", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "secondary_gold_rate", target: "farmer", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 0.017, imperial: 0.017 } }
        ]
      },
      {
        text: "Flemish Revolution (All existing Villagers are transformed to Flemish Militia)",
        category: "gathering_general",
        targets: ["villager", "flemish_militia"],
        isTeamBonus: false,
        modifiers: [
          { stat: "transform_villagers", target: "villager", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 1 } }
        ]
      },
      {
        text: "Relics generate food in addition to gold",
        category: "starting_resources",
        targets: ["relic", "food", "gold"],
        isTeamBonus: true,
        modifiers: [
          { stat: "food_generation_per_min", target: "relic", mode: "add", valuesByAge: { dark: 30, feudal: 30, castle: 30, imperial: 30 } }
        ]
      }
    ]
  },
  "sicilians": {
    id: "120186",
    civ: "Sicilians",
    bonuses: [
      {
        text: "Start with +100 stone",
        category: "starting_resources",
        targets: ["stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_stone", target: "stone", mode: "add", valuesByAge: { dark: 100, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Farm upgrades provide +125% additional food",
        category: "farming",
        targets: ["farm", "mill", "horse_collar", "heavy_plow", "crop_rotation"],
        isTeamBonus: false,
        modifiers: [
          { stat: "upgrade_bonus_food_multiplier", target: "mill_technologies", mode: "multiply", valuesByAge: { dark: 1.25, feudal: 1.25, castle: 1.25, imperial: 1.25 } }
        ]
      },
      {
        text: "Fortifications built +50% faster; Town Centers built +100% faster",
        category: "buildings",
        targets: ["town_center", "castle", "donjon", "villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "build_speed", target: "fortifications", mode: "multiply", valuesByAge: { dark: 0.50, feudal: 0.50, castle: 0.50, imperial: 0.50 } },
          { stat: "build_speed", target: "town_center", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } }
        ]
      },
      {
        text: "Transport Ships +5 line of sight and cost -50%",
        category: "buildings",
        targets: ["transport_ship"],
        isTeamBonus: true,
        modifiers: [
          { stat: "line_of_sight", target: "transport_ship", mode: "add", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } },
          { stat: "wood_cost", target: "transport_ship", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: -0.50 } }
        ]
      }
    ]
  },
  "poles": {
    id: "120187",
    civ: "Poles",
    bonuses: [
      {
        text: "Folwark replaces Mill",
        category: "farming",
        targets: ["folwark", "mill", "farm"],
        isTeamBonus: false,
        modifiers: [
          { stat: "instant_farm_food_ratio", target: "folwark", mode: "set", valuesByAge: { dark: 0.08, feudal: 0.08, castle: 0.08, imperial: 0.08 } }
        ]
      },
      {
        text: "Villagers regenerate 10/15/20 HP in Feudal/Castle/Imperial Age",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "hp_regen_per_min", target: "villager", mode: "set", valuesByAge: { dark: 0, feudal: 10, castle: 15, imperial: 20 } }
        ]
      },
      {
        text: "Stone Miners generate gold in addition to stone",
        category: "mining",
        targets: ["stone_miner", "villager", "stone", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "secondary_gold_ratio", target: "stone_miner", mode: "set", valuesByAge: { dark: 0.33, feudal: 0.33, castle: 0.33, imperial: 0.33 } }
        ]
      }
    ]
  },
  "bohemians": {
    id: "120188",
    civ: "Bohemians",
    bonuses: [
      {
        text: "Mining Camp technologies free",
        category: "eco_techs",
        targets: ["mining_camp", "gold_mining", "stone_mining", "gold_shaft_mining", "stone_shaft_mining"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "mining_camp_technologies", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Blacksmiths and Universities cost -100 wood",
        category: "buildings",
        targets: ["blacksmith", "university", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "blacksmith_and_university", mode: "add", valuesByAge: { dark: -100, feudal: -100, castle: -100, imperial: -100 } }
        ]
      },
      {
        text: "Fervor and Sanctity affect Villagers",
        category: "gathering_general",
        targets: ["villager", "fervor", "sanctity", "monastery"],
        isTeamBonus: false,
        modifiers: [
          { stat: "apply_fervor_and_sanctity", target: "villager", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 1, imperial: 1 } }
        ]
      },
      {
        text: "Hussite Reforms (Monks and Monastery technologies gold cost is replaced by food cost)",
        category: "eco_techs",
        targets: ["monk", "monastery", "gold", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "replace_gold_with_food", target: "monk_and_monastery_techs", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 1 } }
        ]
      },
      {
        text: "Markets work +80% faster",
        category: "trade",
        targets: ["market", "trade_cart"],
        isTeamBonus: true,
        modifiers: [
          { stat: "work_rate", target: "market", mode: "multiply", valuesByAge: { dark: 0.80, feudal: 0.80, castle: 0.80, imperial: 0.80 } }
        ]
      }
    ]
  },
  "dravidians": {
    id: "120189",
    civ: "Dravidians",
    bonuses: [
      {
        text: "Fishermen and Fishing Ships carry +15",
        category: "farming",
        targets: ["fisherman", "villager", "fishing_ship"],
        isTeamBonus: false,
        modifiers: [
          { stat: "carry_capacity", target: "fisherman_and_fishing_ship", mode: "add", valuesByAge: { dark: 15, feudal: 15, castle: 15, imperial: 15 } }
        ]
      },
      {
        text: "Receive +200 wood when advancing to the next Age",
        category: "starting_resources",
        targets: ["wood", "feudal_age", "castle_age", "imperial_age"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_on_age_up", target: "wood", mode: "add", valuesByAge: { dark: 0, feudal: 200, castle: 200, imperial: 200 } }
        ]
      },
      {
        text: "Docks provide +5 population space",
        description: "Los muelles proporcionan +5 de población.",
        category: "buildings",
        targets: ["dock", "population"],
        targetBuildings: ["dock"],
        isTeamBonus: true,
        effect: { type: 'populationAddition', value: 5 },
        modifiers: [
          { stat: "population_provided", target: "dock", mode: "add", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } }
        ]
      }
    ]
  },
  "bengalis": {
    id: "120190",
    civ: "Bengalis",
    bonuses: [
      {
        text: "Town Centers spawn 2 Villagers when the next Age is reached",
        category: "gathering_general",
        targets: ["town_center", "villager", "feudal_age", "castle_age", "imperial_age"],
        isTeamBonus: false,
        modifiers: [
          { stat: "villagers_per_tc_on_age_up", target: "town_center", mode: "add", valuesByAge: { dark: 0, feudal: 2, castle: 2, imperial: 2 } }
        ]
      },
      {
        text: "Ships regenerate 15 HP per minute",
        category: "farming",
        targets: ["fishing_ship", "trade_cog", "transport_ship"],
        isTeamBonus: false,
        modifiers: [
          { stat: "hp_regen_per_min", target: "ships", mode: "add", valuesByAge: { dark: 15, feudal: 15, castle: 15, imperial: 15 } }
        ]
      },
      {
        text: "Mahayana (Villagers and Monks take -10% population space)",
        category: "gathering_general",
        targets: ["villager", "monk", "population"],
        isTeamBonus: false,
        modifiers: [
          { stat: "population_space_used", target: "villager_and_monk", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: -0.10 } }
        ]
      },
      {
        text: "Trade Units generate +10% food in addition to gold",
        category: "trade",
        targets: ["trade_cart", "trade_cog", "food", "gold"],
        isTeamBonus: true,
        modifiers: [
          { stat: "secondary_food_ratio", target: "trade_units", mode: "set", valuesByAge: { dark: 0.10, feudal: 0.10, castle: 0.10, imperial: 0.10 } }
        ]
      }
    ]
  },
  "gurjaras": {
    id: "120191",
    civ: "Gurjaras",
    bonuses: [
      {
        text: "Start with 2 Forage Bushes",
        category: "starting_resources",
        targets: ["forage_bush", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_forage_bushes", target: "forage_bush", mode: "add", valuesByAge: { dark: 2, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Can garrison livestock in Mills to passively produce food",
        category: "farming",
        targets: ["mill", "sheep", "livestock", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "livestock_mill_garrison", target: "mill", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "romans": {
    id: "120192",
    civ: "Romans",
    bonuses: [
      {
        text: "Villagers gather, build, and repair +5% faster",
        category: "gathering_general",
        targets: ["villager"],
        isTeamBonus: false,
        modifiers: [
          { stat: "work_rate", target: "villager", mode: "multiply", valuesByAge: { dark: 0.05, feudal: 0.05, castle: 0.05, imperial: 0.05 } }
        ]
      }
    ]
  },
  "armenians": {
    id: "120193",
    civ: "Armenians",
    bonuses: [
      {
        text: "Mule Carts cost -25%",
        category: "buildings",
        targets: ["mule_cart"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "mule_cart", mode: "multiply", valuesByAge: { dark: -0.25, feudal: -0.25, castle: -0.25, imperial: -0.25 } }
        ]
      },
      {
        text: "Mule Cart technology effects +40%",
        category: "eco_techs",
        targets: ["mule_cart", "double_bit_axe", "bow_saw", "two_man_saw", "gold_mining", "stone_mining", "gold_shaft_mining", "stone_shaft_mining"],
        isTeamBonus: false,
        modifiers: [
          { stat: "tech_effect_multiplier", target: "mule_cart_technologies", mode: "multiply", valuesByAge: { dark: 0.40, feudal: 0.40, castle: 0.40, imperial: 0.40 } }
        ]
      },
      {
        text: "First Fortified Church receives a free Relic",
        category: "starting_resources",
        targets: ["fortified_church", "relic", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "free_relic_on_first_church", target: "fortified_church", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "georgians": {
    id: "120194",
    civ: "Georgians",
    bonuses: [
      {
        text: "Start with a Mule Cart",
        category: "starting_resources",
        targets: ["mule_cart"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_mule_carts", target: "mule_cart", mode: "add", valuesByAge: { dark: 1, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Fortified Churches provide Villagers in a 9 tiles radius with +10% work rate",
        description: "Proporciona a los aldeanos en un radio de 9 casillas un +10% de velocidad de trabajo.",
        category: "gathering_general",
        targetBuildings: ["fortified_church"],
        targets: ["fortified_church", "villager"],
        type: "aura_work_rate",
        radius: 9,
        value: 0.10,
        isTeamBonus: false,
        modifiers: [
          { stat: "aura_work_rate", target: "villager", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: 0.10, imperial: 0.10 } }
        ]
      },
      {
        id: "svan_towers",
        techId: 923,
        name: "Torres esvanas",
        age: "castle",
        text: "Svan Towers: Arrow-shooting buildings gain +2 attack",
        description: "Centros urbanos, torres, castillos, iglesias fortificadas y muelles obtienen +2 de ataque.",
        category: "buildings",
        targetBuildings: ["town_center", "watch_tower", "guard_tower", "keep", "castle", "fortified_church", "dock"],
        targets: ["town_center", "watch_tower", "guard_tower", "keep", "castle", "fortified_church", "dock"],
        type: "attack_addition",
        value: 2,
        isTeamBonus: false,
        modifiers: [
          { stat: "attack", target: "arrow_firing_buildings", mode: "add", valuesByAge: { dark: 0, feudal: 0, castle: 2, imperial: 2 } }
        ]
      },
      {
        text: "Building repairs cost -25%",
        category: "buildings",
        targets: ["buildings", "villager"],
        isTeamBonus: true,
        modifiers: [
          { stat: "repair_cost", target: "buildings", mode: "multiply", valuesByAge: { dark: -0.25, feudal: -0.25, castle: -0.25, imperial: -0.25 } }
        ]
      }
    ]
  },
  "shu": {
    id: "120198",
    civ: "Shu",
    bonuses: [
      {
        text: "Lumberjacks generate food in addition to wood",
        category: "wood",
        targets: ["lumberjack", "villager", "wood", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "secondary_food_ratio", target: "lumberjack", mode: "set", valuesByAge: { dark: 0.10, feudal: 0.10, castle: 0.10, imperial: 0.10 } }
        ]
      }
    ]
  },
  "wu": {
    id: "120199",
    civ: "Wu",
    bonuses: [
      {
        text: "Military production buildings and Docks provide +55 food when built",
        category: "starting_resources",
        targets: ["barracks", "archery_range", "stable", "siege_workshop", "dock", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "food_on_building_completion", target: "military_buildings_and_docks", mode: "add", valuesByAge: { dark: 55, feudal: 55, castle: 55, imperial: 55 } }
        ]
      },
      {
        text: "Careening, Dry Dock free",
        category: "eco_techs",
        targets: ["careening", "dry_dock", "dock"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "careening_line", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Houses built +100% faster",
        category: "buildings",
        targets: ["house", "villager"],
        isTeamBonus: true,
        modifiers: [
          { stat: "build_speed", target: "house", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } }
        ]
      }
    ]
  },
  "wei": {
    id: "120200",
    civ: "Wei",
    bonuses: [
      {
        text: "Receive one free Villager for each economic upgrade researched",
        category: "gathering_general",
        targets: ["villager", "eco_techs"],
        isTeamBonus: false,
        modifiers: [
          { stat: "free_villager_per_eco_tech", target: "economic_technologies", mode: "add", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      },
      {
        text: "Tuntian (Soldiers passively produce food)",
        category: "farming",
        targets: ["food", "military_units"],
        isTeamBonus: false,
        modifiers: [
          { stat: "passive_food_per_soldier", target: "military_units", mode: "flag", valuesByAge: { dark: 0, feudal: 0, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "jurchens": {
    id: "120201",
    civ: "Jurchens",
    bonuses: [
      {
        text: "Meat of hunted and livestock animals doesn't decay",
        category: "farming",
        targets: ["hunt", "sheep", "livestock", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "meat_decay_rate", target: "hunt_and_livestock", mode: "set", valuesByAge: { dark: 0, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Siege and Fortification upgrades cost -75% wood and research +100% faster",
        category: "eco_techs",
        targets: ["university", "wood"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "siege_and_fortification_upgrades", mode: "multiply", valuesByAge: { dark: -0.75, feudal: -0.75, castle: -0.75, imperial: -0.75 } },
          { stat: "research_speed", target: "siege_and_fortification_upgrades", mode: "multiply", valuesByAge: { dark: 1.0, feudal: 1.0, castle: 1.0, imperial: 1.0 } }
        ]
      }
    ]
  },
  "khitans": {
    id: "120202",
    civ: "Khitans",
    bonuses: [
      {
        text: "Pastures replace Farms",
        category: "farming",
        targets: ["pasture", "farm"],
        isTeamBonus: false,
        modifiers: [
          { stat: "replace_farm_with_pasture", target: "farm", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      }
    ]
  },
  "muisca": {
    id: "120206",
    civ: "Muisca",
    bonuses: [
      {
        text: "Advancing to the next Age costs -50% gold",
        category: "eco_techs",
        targets: ["castle_age", "imperial_age", "town_center", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "gold_cost", target: "age_up", mode: "multiply", valuesByAge: { dark: -0.50, feudal: -0.50, castle: -0.50, imperial: 0 } }
        ]
      },
      {
        text: "Settlements cost -33% and heal nearby units",
        category: "buildings",
        targets: ["settlement"],
        isTeamBonus: false,
        modifiers: [
          { stat: "wood_cost", target: "settlement", mode: "multiply", valuesByAge: { dark: -0.33, feudal: -0.33, castle: -0.33, imperial: -0.33 } }
        ]
      },
      {
        text: "Caravan, Guilds free",
        category: "trade",
        targets: ["caravan", "guilds", "market", "trade_cart", "trade_cog"],
        isTeamBonus: false,
        modifiers: [
          { stat: "cost", target: "caravan_and_guilds", mode: "multiply", valuesByAge: { dark: -1.0, feudal: -1.0, castle: -1.0, imperial: -1.0 } }
        ]
      },
      {
        text: "Natural gold sources last +15% longer",
        category: "mining",
        targets: ["gold", "gold_miner"],
        isTeamBonus: true,
        modifiers: [
          { stat: "resource_yield", target: "gold_mine", mode: "multiply", valuesByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 } }
        ]
      }
    ]
  },
  "mapuche": {
    id: "120207",
    civ: "Mapuche",
    bonuses: [
      {
        text: "Foragers drop off +25% food",
        category: "farming",
        targets: ["forager", "villager", "forage_bush", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "drop_off_multiplier", target: "forager", mode: "multiply", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      },
      {
        text: "Mounted Units generate +3 gold when defeating military units",
        category: "starting_resources",
        targets: ["gold", "cavalry"],
        isTeamBonus: false,
        modifiers: [
          { stat: "gold_per_kill", target: "mounted_units", mode: "add", valuesByAge: { dark: 3, feudal: 3, castle: 3, imperial: 3 } }
        ]
      }
    ]
  },
  "tupi": {
    id: "120208",
    civ: "Tupi",
    bonuses: [
      {
        text: "Start with +25 of each resource",
        category: "starting_resources",
        targets: ["wood", "food", "gold", "stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "starting_wood", target: "wood", mode: "add", valuesByAge: { dark: 25, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_food", target: "food", mode: "add", valuesByAge: { dark: 25, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_gold", target: "gold", mode: "add", valuesByAge: { dark: 25, feudal: 0, castle: 0, imperial: 0 } },
          { stat: "starting_stone", target: "stone", mode: "add", valuesByAge: { dark: 25, feudal: 0, castle: 0, imperial: 0 } }
        ]
      },
      {
        text: "Villagers can garrison in Settlements",
        category: "buildings",
        targets: ["villager", "settlement"],
        isTeamBonus: false,
        modifiers: [
          { stat: "garrison_capacity", target: "settlement", mode: "set", valuesByAge: { dark: 5, feudal: 5, castle: 5, imperial: 5 } }
        ]
      },
      {
        text: "Fallen units return 15% of their cost",
        category: "starting_resources",
        targets: ["food", "wood", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "refund_on_death_ratio", target: "military_units", mode: "set", valuesByAge: { dark: 0.15, feudal: 0.15, castle: 0.15, imperial: 0.15 } }
        ]
      },
      {
        text: "Towers and Castles provide +10 population space",
        category: "buildings",
        targets: ["watch_tower", "castle", "population"],
        isTeamBonus: true,
        modifiers: [
          { stat: "population_provided", target: "tower_and_castle", mode: "add", valuesByAge: { dark: 10, feudal: 10, castle: 10, imperial: 10 } }
        ]
      }
    ]
  },
  "anglo_saxons": {
    id: "120209",
    civ: "Anglo-Saxons",
    bonuses: [
      {
        text: "Mills, Lumber- and Mining Camps provide +35 food and +10 stone when built",
        category: "starting_resources",
        targets: ["mill", "lumber_camp", "mining_camp", "food", "stone"],
        isTeamBonus: false,
        modifiers: [
          { stat: "food_on_building_completion", target: "drop_off_buildings", mode: "add", valuesByAge: { dark: 35, feudal: 35, castle: 35, imperial: 35 } },
          { stat: "stone_on_building_completion", target: "drop_off_buildings", mode: "add", valuesByAge: { dark: 10, feudal: 10, castle: 10, imperial: 10 } }
        ]
      },
      {
        text: "Repairers work +25% faster",
        category: "buildings",
        targets: ["repairer", "villager", "buildings"],
        isTeamBonus: true,
        modifiers: [
          { stat: "repair_speed", target: "repairer", mode: "multiply", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      }
    ]
  },
  "swedes": {
    id: "120210",
    civ: "Swedes",
    bonuses: [
      {
        text: "Shepherding, fishing, and hunting also generate gold",
        category: "farming",
        targets: ["shepherd", "fisherman", "fishing_ship", "hunter", "villager", "gold"],
        isTeamBonus: false,
        modifiers: [
          { stat: "secondary_gold_generation", target: "shepherd_fisher_hunter", mode: "flag", valuesByAge: { dark: 1, feudal: 1, castle: 1, imperial: 1 } }
        ]
      },
      {
        text: "Bloodlines and Caravan effects +50%",
        category: "trade",
        targets: ["caravan", "trade_cart", "trade_cog", "market"],
        isTeamBonus: false,
        modifiers: [
          { stat: "tech_effect_multiplier", target: "caravan", mode: "multiply", valuesByAge: { dark: 0, feudal: 0, castle: 0.50, imperial: 0.50 } }
        ]
      }
    ]
  },
  "danes": {
    id: "120211",
    civ: "Danes",
    bonuses: [
      {
        text: "Fishing Ships and Villagers drop off +5% food",
        category: "farming",
        targets: ["fishing_ship", "villager", "food"],
        isTeamBonus: false,
        modifiers: [
          { stat: "drop_off_multiplier", target: "food_gatherers", mode: "multiply", valuesByAge: { dark: 0.05, feudal: 0.05, castle: 0.05, imperial: 0.05 } }
        ]
      },
      {
        text: "Loot 25% of the resource cost of each destroyed building",
        category: "starting_resources",
        targets: ["wood", "stone", "gold", "food", "buildings"],
        isTeamBonus: false,
        modifiers: [
          { stat: "loot_building_cost_ratio", target: "enemy_buildings", mode: "set", valuesByAge: { dark: 0.25, feudal: 0.25, castle: 0.25, imperial: 0.25 } }
        ]
      }
    ]
  }
};

  return { CIV_ECONOMIC_BONUSES };
});
