/**
 * civModifiers.js
 * Módulo de bonificaciones militares de civilizaciones para combate terrestre 1v1 (Age of Empires II).
 *
 * Clases estándar según especificación:
 * - Clase 3: Pierce (Proyectil)
 * - Clase 4: Melee (Cuerpo a cuerpo)
 * - Clase 5: War Elephants (Elefantes)
 * - Clase 8: Caballería
 * - Clase 11: Infantería (soporta también Clase 1 de Genie Engine)
 * - Clase 12: Arqueros a caballo (Cavalry Archers)
 * - Clase 13 / 20: Armas de asedio (Siege)
 * - Clase 15: Arqueros
 * - Clase 23: Unidades de pólvora (Gunpowder)
 * - Clase 27: Lanceros (Spearmen)
 * - Clase 30: Camellos
 */

const UNIT_IDS = {
  SPEARMAN_LINE: [74, 93, 358, 359], // Línea de lanceros (incluye IDs de referencia [74, 93, 358, 359])
  MILITIA_LINE: [74, 75, 77, 473, 567, 1793],
  SCOUT_CAVALRY_LINE: [448, 546, 441, 1707],
  KNIGHT_LINE: [38, 283, 569, 1813],
  SKIRMISHER_LINE: [6, 7, 1155],
  STEPPE_LANCER_LINE: [1370, 1372],
  BATTLE_ELEPHANT_LINE: [1132, 1134],
  ELEPHANT_ARCHER_LINE: [873, 875],
  CONDOTTIERO: [882],
  SLINGER: [185],
  LEITIS: [1234, 1236],
  CHAMPI_WARRIOR: [2626, 2627, 2628],
  FIRE_LANCER: [1901, 1903, 1908, 1910, 1911],
  IRON_PAGODA: [1908, 1910],
  JIAN_SWORDSMAN: [1920, 1921],
  HEI_GUANG_CAVALRY: [1930, 1931],
  XIANBEI_RAIDER: [1944, 1946],
  VARANGIAN_GUARD: [2700, 2701]
};

// Helpers de detección de clase e ID
const hasArmourClass = (unit, classId) =>
  Boolean(unit.Armours?.some((a) => a.Class === classId));

const hasId = (unit, ids) => ids.includes(Number(unit.ID ?? unit.id));

const isCavalry = (unit) => hasArmourClass(unit, 8);
const isInfantry = (unit) => hasArmourClass(unit, 11) || hasArmourClass(unit, 1);
const isArcher = (unit) => hasArmourClass(unit, 15);
const isCamel = (unit) => hasArmourClass(unit, 30);
const isCavalryArcher = (unit) => hasArmourClass(unit, 12) || (isArcher(unit) && isCavalry(unit));
const isElephant = (unit) => hasArmourClass(unit, 5);
const isGunpowder = (unit) => hasArmourClass(unit, 23);
const isSiege = (unit) => hasArmourClass(unit, 13) || hasArmourClass(unit, 20);
const isSkirmisher = (unit) => hasId(unit, UNIT_IDS.SKIRMISHER_LINE);

const isFootArcher = (unit) =>
  isArcher(unit) && !isCavalryArcher(unit) && !isSkirmisher(unit) && !isGunpowder(unit) && !isElephant(unit);

const isMounted = (unit) =>
  isCavalry(unit) || isCamel(unit) || isCavalryArcher(unit) || isElephant(unit);

// Helpers de mutación segura sobre atributos base clonados
const addMeleeArmor = (unit, amount) => {
  unit.MeleeArmor = (unit.MeleeArmor ?? 0) + amount;
  if (Array.isArray(unit.Armours)) {
    const entry = unit.Armours.find((a) => a.Class === 4);
    if (entry) entry.Amount += amount;
    else unit.Armours.push({ Class: 4, Amount: amount });
  }
};

const addPierceArmor = (unit, amount) => {
  unit.PierceArmor = (unit.PierceArmor ?? 0) + amount;
  if (Array.isArray(unit.Armours)) {
    const entry = unit.Armours.find((a) => a.Class === 3);
    if (entry) entry.Amount += amount;
    else unit.Armours.push({ Class: 3, Amount: amount });
  }
};

const addAttackByClass = (unit, classId, amount) => {
  if ((classId === 4 && (unit.Range ?? 0) <= 1) || (classId === 3 && (unit.Range ?? 0) > 1)) {
    unit.Attack = (unit.Attack ?? 0) + amount;
  }
  if (Array.isArray(unit.Attacks)) {
    const entry = unit.Attacks.find((a) => a.Class === classId);
    if (entry) entry.Amount += amount;
    else unit.Attacks.push({ Class: classId, Amount: amount });
  }
};

const CIV_MILITARY_BONUSES = {
  // 120150 - Britons
  Britons: [
    {
      id: "britons_foot_archers_range",
      description: "Foot Archers +1/+2 range in Castle/Imperial Age",
      minAge: 3,
      appliesTo: (unit) => isFootArcher(unit),
      applyStats: (unit, age) => {
        const bonus = age >= 4 ? 2 : age >= 3 ? 1 : 0;
        unit.Range = (unit.Range ?? 0) + bonus;
      }
    }
  ],

  // 120151 - Franks
  Franks: [
    {
      id: "franks_mounted_hp",
      description: "Mounted Units +20% HP starting in Feudal Age",
      minAge: 2,
      appliesTo: (unit) => isMounted(unit),
      applyStats: (unit) => {
        const baseHP = unit.baseHP ?? unit.HP;
        unit.HP += Math.round(baseHP * 0.2);
      }
    }
  ],

  // 120153 - Teutons
  Teutons: [
    {
      id: "teutons_infantry_mounted_melee_armor",
      description: "Infantry and Mounted Units +1/+2 melee armor in Castle/Imperial Age",
      minAge: 3,
      appliesTo: (unit) => isInfantry(unit) || isMounted(unit),
      applyStats: (unit, age) => {
        const bonus = age >= 4 ? 2 : age >= 3 ? 1 : 0;
        addMeleeArmor(unit, bonus);
      }
    }
  ],

  // 120154 - Japanese
  Japanese: [
    {
      id: "japanese_infantry_attack_speed",
      description: "Infantry attacks +33% faster starting in Feudal Age",
      minAge: 2,
      appliesTo: (unit) => isInfantry(unit),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.33;
      }
    },
    {
      id: "japanese_cav_archers_vs_ranged",
      description: "Cavalry Archers +2 attack vs. Ranged Soldiers (except Skirmishers)",
      minAge: 1,
      appliesTo: (unit) => isCavalryArcher(unit),
      applyStats: (unit) => {
        addAttackByClass(unit, 15, 2);
      },
      onCalculateBonusDamage: (attacker, defender, rawBonus) => {
        if (isSkirmisher(defender)) {
          return Math.max(0, rawBonus - 2);
        }
        return rawBonus;
      }
    }
  ],

  // 120155 - Chinese
  Chinese: [
    {
      id: "chinese_fire_lancers_speed",
      description: "Fire Lancers and Fire Ships move +5/10% faster in Castle/Imperial Age",
      minAge: 3,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.FIRE_LANCER),
      applyStats: (unit, age) => {
        const mult = age >= 4 ? 1.1 : 1.05;
        unit.Speed = unit.Speed * mult;
      }
    }
  ],

  // 120157 - Persians
  Persians: [
    {
      id: "persians_knight_vs_ranged",
      description: "Knight-line +2 attack vs. Ranged Soldiers",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.KNIGHT_LINE),
      applyStats: (unit) => {
        addAttackByClass(unit, 15, 2);
      }
    }
  ],

  // 120158 - Saracens
  Saracens: [
    {
      id: "saracens_camel_hp",
      description: "Camel Units +25% HP",
      minAge: 1,
      appliesTo: (unit) => isCamel(unit),
      applyStats: (unit) => {
        const baseHP = unit.baseHP ?? unit.HP;
        unit.HP += Math.round(baseHP * 0.25);
      }
    }
  ],

  // 120159 - Turks
  Turks: [
    {
      id: "turks_scout_cavalry_pierce_armor",
      description: "Scout Cavalry-line +1 pierce armor and upgrades free",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.SCOUT_CAVALRY_LINE),
      applyStats: (unit) => {
        addPierceArmor(unit, 1);
      }
    },
    {
      id: "turks_gunpowder_hp",
      description: "Gunpowder Units +25% HP",
      minAge: 1,
      appliesTo: (unit) => isGunpowder(unit),
      applyStats: (unit) => {
        const baseHP = unit.baseHP ?? unit.HP;
        unit.HP += Math.round(baseHP * 0.25);
      }
    }
  ],

  // 120160 - Vikings
  Vikings: [
    {
      id: "vikings_infantry_hp",
      description: "Infantry +20% HP starting in Feudal Age",
      minAge: 2,
      appliesTo: (unit) => isInfantry(unit),
      applyStats: (unit) => {
        const baseHP = unit.baseHP ?? unit.HP;
        unit.HP += Math.round(baseHP * 0.2);
      }
    }
  ],

  // 120161 - Mongols
  Mongols: [
    {
      id: "mongols_cav_archers_attack_speed",
      description: "Cavalry Archers attack +25% faster",
      minAge: 1,
      appliesTo: (unit) => isCavalryArcher(unit),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.25;
      }
    },
    {
      id: "mongols_scout_steppe_lancer_hp",
      description: "Scout Cavalry-line and Steppe Lancers +20/30% HP in Castle/Imperial Age",
      minAge: 3,
      appliesTo: (unit) =>
        hasId(unit, [...UNIT_IDS.SCOUT_CAVALRY_LINE, ...UNIT_IDS.STEPPE_LANCER_LINE]),
      applyStats: (unit, age) => {
        const baseHP = unit.baseHP ?? unit.HP;
        const factor = age >= 4 ? 0.3 : 0.2;
        unit.HP += Math.round(baseHP * factor);
      }
    }
  ],

  // 120162 - Celts
  Celts: [
    {
      id: "celts_infantry_speed",
      description: "Infantry moves +5/10/15/20% faster in Dark/Feudal/Castle/Imperial Age",
      minAge: 1,
      appliesTo: (unit) => isInfantry(unit),
      applyStats: (unit, age) => {
        const multByAge = { 1: 1.05, 2: 1.1, 3: 1.15, 4: 1.2 };
        unit.Speed = unit.Speed * (multByAge[age] ?? 1.2);
      }
    },
    {
      id: "celts_siege_attack_speed",
      description: "Siege Weapons attack +25% faster",
      minAge: 1,
      appliesTo: (unit) => isSiege(unit),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.25;
      }
    }
  ],

  // 120163 - Spanish
  Spanish: [
    {
      id: "spanish_gunpowder_attack_speed",
      description: "Gunpowder Units attack +18% faster",
      minAge: 1,
      appliesTo: (unit) => isGunpowder(unit),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.18;
      }
    }
  ],

  // 120168 - Italians
  Italians: [
    {
      id: "italians_foot_archers_condottieri_armor",
      description: "Foot Archers and Condottieri +1 melee/+1 pierce armor",
      minAge: 1,
      appliesTo: (unit) => isFootArcher(unit) || hasId(unit, UNIT_IDS.CONDOTTIERO),
      applyStats: (unit) => {
        addMeleeArmor(unit, 1);
        addPierceArmor(unit, 1);
      }
    }
  ],

  // 120169 - Hindustanis
  Hindustanis: [
    {
      id: "hindustanis_camel_attack_speed",
      description: "Camel Riders attack +20% faster",
      minAge: 1,
      appliesTo: (unit) => isCamel(unit),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.2;
      }
    },
    {
      id: "hindustanis_gunpowder_armor",
      description: "Gunpowder Units +1 melee/+1 pierce armor",
      minAge: 1,
      appliesTo: (unit) => isGunpowder(unit),
      applyStats: (unit) => {
        addMeleeArmor(unit, 1);
        addPierceArmor(unit, 1);
      }
    }
  ],

  // 120174 - Ethiopians
  Ethiopians: [
    {
      id: "ethiopians_foot_archers_attack_speed",
      description: "Foot Archers attack +18% faster",
      minAge: 1,
      appliesTo: (unit) => isFootArcher(unit),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.18;
      }
    }
  ],

  // 120175 - Malians
  Malians: [
    {
      id: "malians_barracks_pierce_armor",
      description: "Barracks Units +1/+2/+3 pierce armor in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) => isInfantry(unit) && !hasArmourClass(unit, 19),
      applyStats: (unit, age) => {
        const bonus = age >= 4 ? 3 : age === 3 ? 2 : age === 2 ? 1 : 0;
        addPierceArmor(unit, bonus);
      }
    }
  ],

  // 120177 - Khmer
  Khmer: [
    {
      id: "khmer_battle_elephants_speed",
      description: "Battle Elephants move +10% faster",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.BATTLE_ELEPHANT_LINE) || isElephant(unit),
      applyStats: (unit) => {
        unit.Speed = unit.Speed * 1.1;
      }
    },
    {
      id: "khmer_scorpions_range",
      description: "Scorpions +1 range",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, [279, 542]),
      applyStats: (unit) => {
        unit.Range = (unit.Range ?? 0) + 1;
      }
    }
  ],

  // 120179 - Burmese
  Burmese: [
    {
      id: "burmese_infantry_attack",
      description: "Infantry +1/+2/+3 attack in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) => isInfantry(unit),
      applyStats: (unit, age) => {
        const bonus = age >= 4 ? 3 : age === 3 ? 2 : age === 2 ? 1 : 0;
        addAttackByClass(unit, 4, bonus);
      }
    },
    {
      id: "burmese_battle_elephants_armor",
      description: "Battle Elephants +1 melee/+1 pierce armor",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.BATTLE_ELEPHANT_LINE) || isElephant(unit),
      applyStats: (unit) => {
        addMeleeArmor(unit, 1);
        addPierceArmor(unit, 1);
      }
    }
  ],

  // 120180 - Vietnamese
  Vietnamese: [
    {
      id: "vietnamese_archers_skirmishers_hp",
      description: "Foot Archers and Skirmishers +20% HP",
      minAge: 1,
      appliesTo: (unit) => isFootArcher(unit) || isSkirmisher(unit),
      applyStats: (unit) => {
        const baseHP = unit.baseHP ?? unit.HP;
        unit.HP += Math.round(baseHP * 0.2);
      }
    }
  ],

  // 120183 - Cumans
  Cumans: [
    {
      id: "cumans_mounted_speed",
      description: "Mounted Units move +5/10/15% faster in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) => isMounted(unit),
      applyStats: (unit, age) => {
        const mult = age >= 4 ? 1.15 : age === 3 ? 1.1 : age === 2 ? 1.05 : 1.0;
        unit.Speed = unit.Speed * mult;
      }
    }
  ],

  // 120184 - Lithuanians
  Lithuanians: [
    {
      id: "lithuanians_spearman_skirmisher_speed",
      description: "Spearman-line and Skirmisher-line move +10% faster",
      minAge: 1,
      appliesTo: (unit) =>
        hasId(unit, [...UNIT_IDS.SPEARMAN_LINE, ...UNIT_IDS.SKIRMISHER_LINE]) ||
        hasArmourClass(unit, 27),
      applyStats: (unit) => {
        unit.Speed = unit.Speed * 1.1;
      }
    },
    {
      id: "lithuanians_relics_attack",
      description: "Each garrisoned Relic provides +1 attack to Knight-line and Leitis (maximum +4)",
      minAge: 3,
      appliesTo: (unit) => hasId(unit, [...UNIT_IDS.KNIGHT_LINE, ...UNIT_IDS.LEITIS]),
      applyStats: (unit) => {
        const relics = Math.min(4, Math.max(0, Number(unit.appliedStacks ?? unit.options?.stacks ?? 0)));
        if (relics > 0) {
          addAttackByClass(unit, 4, relics);
        }
      }
    }
  ],

  // 120185 - Burgundians
  Burgundians: [
    {
      id: "burgundians_gunpowder_attack",
      description: "Gunpowder Units +25% attack",
      minAge: 1,
      appliesTo: (unit) => isGunpowder(unit),
      applyStats: (unit) => {
        if (typeof unit.Attack === "number") {
          unit.Attack = Math.round(unit.Attack * 1.25);
        }
        if (Array.isArray(unit.Attacks)) {
          const mainAtk = unit.Attacks.find((a) => a.Class === 3 || a.Class === 4);
          if (mainAtk) mainAtk.Amount = Math.round(mainAtk.Amount * 1.25);
        }
      }
    }
  ],

  // 120186 - Sicilians
  Sicilians: [
    {
      id: "sicilians_bonus_damage_reduction",
      description: "Soldiers receive -40% bonus damage",
      minAge: 1,
      appliesTo: (unit) => !isSiege(unit),
      applyStats: () => {},
      onReceiveBonusDamage: (attacker, defender, rawBonus) => rawBonus * 0.6
    }
  ],

  // 120187 - Poles
  Poles: [
    {
      id: "poles_scout_vs_ranged",
      description: "Scout Cavalry-line +1 attack vs. Ranged Soldiers",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.SCOUT_CAVALRY_LINE),
      applyStats: (unit) => {
        addAttackByClass(unit, 15, 1);
      }
    }
  ],

  // 120188 - Bohemians
  Bohemians: [
    {
      id: "bohemians_spearman_bonus_damage",
      description: "Spearman-line deals +25% bonus damage",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.SPEARMAN_LINE) || hasArmourClass(unit, 27),
      applyStats: () => {},
      onCalculateBonusDamage: (attacker, defender, rawBonus) => rawBonus * 1.25
    }
  ],

  // 120189 - Dravidians
  Dravidians: [
    {
      id: "dravidians_skirm_ele_archer_attack_speed",
      description: "Skirmishers and Elephant Archers attack +25% faster",
      minAge: 1,
      appliesTo: (unit) =>
        isSkirmisher(unit) ||
        hasId(unit, UNIT_IDS.ELEPHANT_ARCHER_LINE) ||
        (isElephant(unit) && isArcher(unit)),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.25;
      }
    }
  ],

  // 120190 - Bengalis
  Bengalis: [
    {
      id: "bengalis_cavalry_vs_skirmishers",
      description: "Cavalry +2 attack vs. Skirmishers",
      minAge: 1,
      appliesTo: (unit) => isCavalry(unit),
      applyStats: () => {},
      onCalculateBonusDamage: (attacker, defender, rawBonus) =>
        isSkirmisher(defender) ? rawBonus + 2 : rawBonus
    },
    {
      id: "bengalis_elephant_bonus_reduction",
      description: "Elephant Units receive -25% bonus damage and are more resistant to conversion",
      minAge: 1,
      appliesTo: (unit) => isElephant(unit),
      applyStats: () => {},
      onReceiveBonusDamage: (attacker, defender, rawBonus) => rawBonus * 0.75
    }
  ],

  // 120191 - Gurjaras
  Gurjaras: [
    {
      id: "gurjaras_mounted_bonus_damage",
      description: "Mounted Units deal +20/30/40% bonus damage in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) => isMounted(unit),
      applyStats: (unit, age) => {
        unit._gurjaraBonusMult = age >= 4 ? 1.4 : age === 3 ? 1.3 : age === 2 ? 1.2 : 1.0;
      },
      onCalculateBonusDamage: (attacker, defender, rawBonus) =>
        rawBonus * (attacker._gurjaraBonusMult ?? 1.4)
    }
  ],

  // 120198 - Shu
  Shu: [
    {
      id: "shu_siege_speed",
      description: "Siege Weapons and Siege Warships move +10/15% faster in Castle/Imperial Age",
      minAge: 3,
      appliesTo: (unit) => isSiege(unit),
      applyStats: (unit, age) => {
        const mult = age >= 4 ? 1.15 : 1.1;
        unit.Speed = unit.Speed * mult;
      }
    }
  ],

  // 120199 - Wu
  Wu: [
    {
      id: "wu_jian_heiguang_attack",
      description: "Jian Swordsmen and Hei Guang Cavalry +2 attack in Imperial Age",
      minAge: 4,
      appliesTo: (unit) =>
        hasId(unit, [...UNIT_IDS.JIAN_SWORDSMAN, ...UNIT_IDS.HEI_GUANG_CAVALRY]),
      applyStats: (unit) => {
        addAttackByClass(unit, 4, 2);
      }
    }
  ],

  // 120200 - Wei
  Wei: [
    {
      id: "wei_heiguang_xianbei_hp",
      description: "Hei Guang Cavalry and Xianbei Raider +20/30% HP in Castle/Imperial Age",
      minAge: 3,
      appliesTo: (unit) =>
        hasId(unit, [...UNIT_IDS.HEI_GUANG_CAVALRY, ...UNIT_IDS.XIANBEI_RAIDER]),
      applyStats: (unit, age) => {
        const baseHP = unit.baseHP ?? unit.HP;
        const factor = age >= 4 ? 0.3 : 0.2;
        unit.HP += Math.round(baseHP * factor);
      }
    }
  ],

  // 120201 - Jurchens
  Jurchens: [
    {
      id: "jurchens_mounted_fire_lancer_attack_speed",
      description: "Mounted Units and Fire Lancers attack +25% faster starting in Feudal Age",
      minAge: 2,
      appliesTo: (unit) => isMounted(unit) || hasId(unit, UNIT_IDS.FIRE_LANCER),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.25;
      }
    }
  ],

  // 120202 - Khitans
  Khitans: [
    {
      id: "khitans_infantry_vs_ranged",
      description: "Infantry +2 attack vs. Ranged Soldiers",
      minAge: 1,
      appliesTo: (unit) => isInfantry(unit),
      applyStats: (unit) => {
        addAttackByClass(unit, 15, 2);
      }
    }
  ],

  // 120206 - Muisca
  Muisca: [
    {
      id: "muisca_champi_archery_melee_armor",
      description: "Champi Warriors and Archery Range Units +1/2/3 melee armor in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) =>
        hasId(unit, UNIT_IDS.CHAMPI_WARRIOR) ||
        (isArcher(unit) && !hasArmourClass(unit, 19)),
      applyStats: (unit, age) => {
        const bonus = age >= 4 ? 3 : age === 3 ? 2 : age === 2 ? 1 : 0;
        addMeleeArmor(unit, bonus);
      }
    }
  ],

  // 120207 - Mapuche
  Mapuche: [
    {
      id: "mapuche_infantry_slinger_skirm_hp",
      description: "Infantry, Slingers and Skirmishers +5/10/15 HP in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) =>
        isInfantry(unit) || isSkirmisher(unit) || hasId(unit, UNIT_IDS.SLINGER),
      applyStats: (unit, age) => {
        const bonus = age >= 4 ? 15 : age === 3 ? 10 : age === 2 ? 5 : 0;
        unit.HP += bonus;
      }
    }
  ],

  // 120210 - Varangians
  Varangians: [
    {
      id: "varangians_guard_attack_speed",
      description: "Varangian Guards attack +25% faster and generate +50% gold",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.VARANGIAN_GUARD),
      applyStats: (unit) => {
        unit.ReloadTime = unit.ReloadTime / 1.25;
      }
    },
    {
      id: "varangians_knight_vs_infantry",
      description: "Knight-line +1 attack vs. Infantry",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.KNIGHT_LINE),
      applyStats: (unit) => {
        addAttackByClass(unit, 11, 1);
      }
    },
    {
      id: "varangians_bloodlines",
      description: "Bloodlines is 50% more effective (+30 HP instead of +20 HP)",
      minAge: 2,
      appliesTo: (unit) => isMountedOrCamel(unit),
      applyStats: (unit) => {
        unit._bloodlinesMult = 1.5;
      }
    }
  ],

  // 120211 - Danes
  Danes: [
    {
      id: "danes_varangian_guard_speed",
      description: "Varangian Guards and Longships move +10% faster",
      minAge: 1,
      appliesTo: (unit) => hasId(unit, UNIT_IDS.VARANGIAN_GUARD),
      applyStats: (unit) => {
        unit.Speed = unit.Speed * 1.1;
      }
    }
  ],

  // 120212 - Georgians
  Georgians: [
    {
      id: "georgians_mounted_regen",
      description: "Cavalry regenerates 2/8/12 HP/min in Feudal/Castle/Imperial Age",
      minAge: 2,
      appliesTo: (unit) => isMounted(unit),
      applyStats: (unit, age) => {
        const regenPerMin = age >= 4 ? 12 : (age >= 3 ? 8 : 2);
        unit.regenRate = regenPerMin / 60;
        unit.regenPerMin = regenPerMin;
      }
    }
  ]
};

// Aliases para Yurchen / Jurchens / Jurchen
CIV_MILITARY_BONUSES.Yurchen = CIV_MILITARY_BONUSES.Jurchens;
CIV_MILITARY_BONUSES.Yurchens = CIV_MILITARY_BONUSES.Jurchens;
CIV_MILITARY_BONUSES.Jurchen = CIV_MILITARY_BONUSES.Jurchens;

// Aliases para Varegos / Varangians / Varangian
CIV_MILITARY_BONUSES.Varegos = CIV_MILITARY_BONUSES.Varangians;
CIV_MILITARY_BONUSES.Varego = CIV_MILITARY_BONUSES.Varangians;
CIV_MILITARY_BONUSES.Varangian = CIV_MILITARY_BONUSES.Varangians;

const isJurchenCiv = (civName) =>
  Boolean(civName && ["yurchen", "jurchen", "jurchens"].includes(String(civName).toLowerCase().trim()));

function isVarangianCiv(civName) {
  return ["varangian", "varangians", "varego", "varegos"].includes(String(civName || "").toLowerCase().trim());
}

function getCivMilitaryBonuses(civName) {
  if (!civName || civName === 'Generic') return [];
  const lower = String(civName).toLowerCase().trim();
  const isJurchen = ["yurchen", "jurchen", "jurchens"].includes(lower);
  if (isJurchen) {
    return CIV_MILITARY_BONUSES.Jurchens || CIV_MILITARY_BONUSES.Yurchen || [];
  }
  const isVarangian = ["varangian", "varangians", "varego", "varegos"].includes(lower);
  if (isVarangian) {
    return CIV_MILITARY_BONUSES.Varangians || [];
  }
  const direct = CIV_MILITARY_BONUSES[civName];
  if (direct) return direct;
  const match = Object.keys(CIV_MILITARY_BONUSES).find(k => k.toLowerCase().trim() === lower);
  return match ? CIV_MILITARY_BONUSES[match] : [];
}

function applyCivMilitaryBonuses(unit, civName, age = 4, upgrades = {}) {
  const bonuses = getCivMilitaryBonuses(civName);
  for (const bonus of bonuses) {
    if (age >= bonus.minAge && bonus.appliesTo(unit)) {
      bonus.applyStats(unit, age);
    }
  }

  // Aplicación de Pureza de Sangre (Bloodlines - ID 213)
  if (upgrades?.bloodlines && isMountedOrCamel(unit)) {
    const normCiv = (civName || "").toLowerCase().trim();
    const isVarangian = ["varangian", "varangians", "varego", "varegos"].includes(normCiv);

    // Bono Varego: 50% más efectiva (+30 HP en vez de +20 HP)
    const bloodlinesHp = isVarangian ? 30 : 20;

    unit.maxHP = (unit.maxHP !== undefined ? unit.maxHP : (unit.HP || 0)) + bloodlinesHp;
    unit.currentHP = unit.maxHP;
  }

  return unit;
}

// Aplicación de Pureza de Sangre (Bloodlines - ID 213)
function applyBloodlines(unit, civName, upgrades = {}) {
  if (!unit) return unit;
  if (upgrades?.bloodlines && isMountedOrCamel(unit)) {
    const normCiv = (civName || "").toLowerCase().trim();
    const isVarangian = ["varangian", "varangians", "varego", "varegos"].includes(normCiv);

    // Bono Varego: 50% más efectiva (+30 HP en vez de +20 HP)
    const bloodlinesHp = isVarangian ? 30 : 20;

    unit.maxHP = (unit.maxHP !== undefined ? unit.maxHP : (unit.HP || 0)) + bloodlinesHp;
    unit.currentHP = unit.maxHP;
  }
  return unit;
}

/**
 * Determina la tasa exacta de regeneración pasiva de HP por segundo de una unidad.
 * - Berserker (IDs 692 y 694): Innato 40 HP/min (~0.667 HP/s). Sin dependencia de Berserkergang.
 * - Caballería Georgiana: 2/8/12 HP/min en Feudal/Castillos/Imperial (~0.033 / ~0.133 / 0.200 HP/s).
 * - Camellos Bereberes con Camellos Magrebíes (ID 579 / 563): 15 HP/min (0.250 HP/s).
 */
function getUnitRegenRate(unit, civName, age, upgrades = {}) {
  if (!unit) return 0.0;
  const normCiv = String(civName || unit.civName || unit.civ || "").toLowerCase().trim();
  const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
  const uid = Number(unit.ID ?? unit.id ?? 0);
  const armours = Array.isArray(unit.Armours) ? unit.Armours : (Array.isArray(unit._rawUnitData?.Armours) ? unit._rawUnitData.Armours : []);

  // 1. Berserker (Innato: 40 HP/min tanto estándar como élite)
  const isBerserk = [692, 694].includes(uid) || name.includes("berserk") || name.includes("vbrsk");
  if (isBerserk) {
    return 40 / 60; // 0.667 HP/s continuo
  }

  // 2. Caballería Georgiana (Escalado por Edad)
  const isGeorgian = ["georgians", "georgianos"].includes(normCiv);
  const isMountedUnit = armours.some(a => a.Class === 8) || 
                        name.includes("cavalry") || name.includes("monaspa") || 
                        name.includes("knight") || name.includes("scout") ||
                        (typeof isMounted === 'function' && isMounted(unit));
  if (isGeorgian && isMountedUnit) {
    const activeAge = Number(age || unit.age || upgrades?.selectedAge || upgrades?.age || 3);
    if (activeAge === 2) return 2 / 60;   // 2 HP/min
    if (activeAge === 3) return 8 / 60;   // 8 HP/min
    if (activeAge >= 4) return 12 / 60;  // 12 HP/min
  }

  // 3. Bereberes con Camellos Magrebíes
  const isBerber = ["berbers", "bereberes"].includes(normCiv);
  const isCamelUnit = armours.some(a => a.Class === 30) || name.includes("camel") || (typeof isCamel === 'function' && isCamel(unit));
  const hasMaghrebi = Boolean(
    upgrades?.maghrebiCamels || 
    upgrades?.uniqueImpTech || 
    upgrades?.imperialCrown || 
    (Array.isArray(upgrades?.activeUniqueTechs) && (upgrades.activeUniqueTechs.includes(579) || upgrades.activeUniqueTechs.includes(563))) ||
    unit.hasMaghrebiCamels
  );
  if (isBerber && isCamelUnit && hasMaghrebi) {
    return 15 / 60; // 15 HP/min (0.25 HP/s)
  }

  // 4. Khitans con Corona de Oro de Regeneración (Ordo Cavalry, ID 1007: 150% de HP máx/min a Caballería y Camellos)
  const khitanRegen = getKhitanRegenRate(unit, normCiv, upgrades);
  if (khitanRegen > 0) {
    return khitanRegen;
  }

  return 0.0;
}

// Detección de civilización Khitan / Kithan
function isKhitanCiv(civName) {
  return ["khitan", "khitans", "kithan"].includes(String(civName || "").toLowerCase().trim());
}

// 1. Elegibilidad Lamellar Armor (Infantería + Skirmishers)
function hasLamellarArmor(unit, civName, upgrades = {}) {
  if (!unit) return false;
  const civ = civName || unit.civName || unit.civ || "";
  if (!isKhitanCiv(civ)) return false;
  const hasTech = Boolean(
    upgrades?.uniqueCastleTech ||
    upgrades?.lamellarArmor ||
    upgrades?.castleCrown ||
    (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1006)) ||
    unit.hasLamellarArmor
  );
  if (!hasTech) return false;

  const armours = Array.isArray(unit.Armours) ? unit.Armours : (Array.isArray(unit._rawUnitData?.Armours) ? unit._rawUnitData.Armours : []);
  const isInfantry = armours.some(a => a.Class === 11 || a.Class === 1);
  const uid = Number(unit.ID ?? unit.id ?? 0);
  const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
  const isSkirmisher = [6, 7, 1155].includes(uid) || name.includes("skirmisher") || name.includes("guerrillero");

  return isInfantry || isSkirmisher;
}

// 2. Elegibilidad Corona de Oro (Caballería + Camellos)
function isMountedOrCamel(unit) {
  if (!unit) return false;
  const armours = Array.isArray(unit.Armours) ? unit.Armours : (Array.isArray(unit._rawUnitData?.Armours) ? unit._rawUnitData.Armours : []);
  const hasEligibleClass = armours.some(a => a.Class === 8 || a.Class === 30);
  const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
  const keywords = [
    "cavalry", "caballeria", "scout", "jinete", "knight", "caballero", 
    "lancer", "hussar", "paladin", "tarkan", "cataphract", "keshik", 
    "boyar", "konnik", "monaspa", "shrivamsha", "iron_pagoda", "camel", "camello",
    "steppe_lancer", "hei_guang", "xianbei"
  ];
  return hasEligibleClass || keywords.some(k => name.includes(k));
}

// 3. Tasa de regeneración para Khitan (150% de su vida máxima por minuto -> HP/s)
function getKhitanRegenRate(unit, civName, upgrades = {}) {
  if (!unit) return 0;
  const civ = civName || unit.civName || unit.civ || "";
  if (!isKhitanCiv(civ)) return 0;
  const hasTech = Boolean(
    upgrades?.uniqueImpTech ||
    upgrades?.khitanGoldCrown ||
    upgrades?.imperialCrown ||
    (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1007)) ||
    unit.hasKhitanRegen
  );
  if (!hasTech) return 0;
  if (!isMountedOrCamel(unit)) return 0;

  // 150% de su vida máxima por minuto -> HP/s
  const maxHP = Number(unit.maxHP || unit.HP || unit._rawUnitData?.HP || 1);
  return (maxHP * 1.50) / 60; // maxHP * 0.025
}

/**
 * Determina el perfil de daño de veneno prolongado en el tiempo (DoT) de un atacante.
 * Daño verdadero (True damage) que ignora armaduras cuerpo a cuerpo y antiproyectil.
 * - Khitan Liu Dao (Innato, IDs 1920 y 1922): 9 HP en 5s (1.800 HP/s).
 * - Tupí Arbalesta con Corona de Oro Curare (ID 1393, unidad ID 492): 5 HP en 15s (~0.333 HP/s).
 * - Tupí Blackwood Archer con Corona de Oro Curare (ID 1393, unidades IDs 2579 y 2581): 2 HP en 15s (~0.133 HP/s).
 */
function getPoisonProfile(attacker, civNameOrUpgrades, maybeUpgrades) {
  if (!attacker) return null;
  let civName = "";
  let upgrades = {};
  if (typeof civNameOrUpgrades === "string") {
    civName = civNameOrUpgrades;
    upgrades = maybeUpgrades || {};
  } else if (civNameOrUpgrades && typeof civNameOrUpgrades === "object") {
    upgrades = civNameOrUpgrades;
    civName = upgrades.civName || upgrades.civ || attacker.civName || attacker.civ || "";
  } else {
    upgrades = maybeUpgrades || {};
    civName = attacker.civName || attacker.civ || "";
  }

  const normCiv = String(civName || attacker.civName || attacker.civ || "").toLowerCase().trim();
  const uid = Number(attacker.ID ?? attacker.id ?? 0);
  const name = String(attacker.internal_name || attacker.name || attacker.localizedName || "").toLowerCase();

  // 1. Khitan Liu Dao (Innato: 9 HP / 5s = 1.8 HP/s)
  // Base (1920) y Élite (1922)
  if ([1920, 1922].includes(uid) || name.includes("liu dao") || name.includes("liaodao")) {
    return {
      totalDamage: 9,
      duration: 5,
      dps: 9 / 5, // 1.800 HP/s
      source: "Liu Dao (Khitan)"
    };
  }

  // 2. Tupí con Corona de Oro (Curare - ID 1393)
  const isTupi = ["tupi", "tupí", "tupis"].includes(normCiv);
  const hasCurare = isTupi && Boolean(
    upgrades?.tupiGoldCrown ||
    upgrades?.curare ||
    upgrades?.uniqueImpTech ||
    upgrades?.imperialCrown ||
    (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1393)) ||
    attacker.hasCurare
  );

  if (hasCurare) {
    // Tupí Arbalesta (ID 492)
    if (uid === 492 || name.includes("arbalester") || name.includes("arbalesta") || name.includes("acoar")) {
      return {
        totalDamage: 5,
        duration: 15,
        dps: 5 / 15, // ~0.333 HP/s
        source: "Arbalesta (Tupí Curare)"
      };
    }
    // Tupí Blackwood Archer (IDs 2579, 2581)
    if ([2579, 2581].includes(uid) || name.includes("blackwood") || name.includes("blckwood") || name.includes("madera negra")) {
      return {
        totalDamage: 2,
        duration: 15,
        dps: 2 / 15, // ~0.133 HP/s
        source: "Blackwood Archer (Tupí Curare)"
      };
    }
  }

  return null;
}

// Identificadores de unidades de la línea de Carro de cohetes
const ROCKET_CART_IDS = new Set([1904, 1907]);

function isRocketCartUnit(unit) {
  if (!unit) return false;
  const uid = Number(unit.ID ?? unit.id ?? 0);
  if (ROCKET_CART_IDS.has(uid)) return true;
  const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
  return name.includes('rocket_cart') ||
         name.includes('rcktcrt') ||
         name.includes('hrcktcrt') ||
         name.includes('carro_cohete') ||
         name.includes('cohete') ||
         name.includes('rocket cart');
}

const BALLISTIC_PROFILES = {
  rocket_cart_line: {
    match: (name, id) => {
      const uid = Number(id);
      if (ROCKET_CART_IDS.has(uid)) return true;
      const n = String(name || '').toLowerCase();
      return n.includes('rocket_cart') ||
             n.includes('rcktcrt') ||
             n.includes('hrcktcrt') ||
             n.includes('carro_cohete') ||
             n.includes('cohete') ||
             n.includes('rocket cart');
    },
    getProfile: (unit, civName, upgrades = {}) => {
      const uid = Number(unit?.ID ?? unit?.id ?? 0);
      const name = String(unit?.internal_name || unit?.name || unit?.localizedName || '').toLowerCase();
      const isElite = [1907].includes(uid) ||
                      name.includes('elite') ||
                      name.includes('hrcktcrt') ||
                      name.includes('pesado') ||
                      name.includes('heavy');
      const normCiv = String(civName || unit?.civName || unit?.civ || '').toLowerCase().trim();

      // 1. Conteo de proyectiles base
      let totalProjectiles = isElite ? 10 : 8;
      const baseDamagePerRocket = isElite ? 6 : 5; // Daño puro garantizado

      // 2. Modificador Coreano (Corona / Tecnología única - Shinkichon ID 445)
      const isKorean = ['koreans', 'coreanos', 'korean'].includes(normCiv);
      const hasKoreanCrown = isKorean && Boolean(
        upgrades?.uniqueImpTech ||
        upgrades?.shinkichon ||
        upgrades?.koreanCrown ||
        upgrades?.imperialCrown ||
        (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(445)) ||
        unit?.hasShinkichon
      );
      if (hasKoreanCrown) {
        totalProjectiles = 16;
      }

      // 3. Modificador Yurchen / Jurchen (Tecnología de Explosiones - Bombas trueno ID 997)
      const isJurchen = ['jurchen', 'jurchens', 'yurchen', 'yurchens', 'yurchenos', 'jurchenos'].includes(normCiv);
      const hasJurchenTech = isJurchen && Boolean(
        upgrades?.uniqueCastleTech ||
        upgrades?.uniqueImpTech ||
        upgrades?.jurchenCrown ||
        upgrades?.thunderclapBombs ||
        upgrades?.bombasTrueno ||
        upgrades?.imperialCrown ||
        (Array.isArray(upgrades?.activeUniqueTechs) && (upgrades.activeUniqueTechs.includes(997) || upgrades.activeUniqueTechs.includes(996))) ||
        unit?.hasThunderclapBombs
      );

      return {
        isRocketCart: true,
        isElite: isElite,
        projectiles: totalProjectiles,
        baseDamage: baseDamagePerRocket,
        ignoresArmor: true,
        bonusVsSiege: 4,
        bonusHeavySiege: 4,
        extraRange: hasKoreanCrown ? 1 : 0,

        // Explosiones adicionales Yurchen
        projectileImpact: hasJurchenTech ? {
          extraDamage: 4,
          aoe: 1.25,
          delay: 2.0
        } : null,

        // Explosión al morir (Death impact)
        deathImpact: hasJurchenTech ? {
          damage: 15,
          aoe: 1.0
        } : {
          damage: isElite ? 35 : 25,
          aoe: 1.5
        }
      };
    }
  }
};

function getBallisticProfile(unit, civNameOrUpgrades, maybeUpgrades) {
  if (!unit) return null;
  let civName = '';
  let upgrades = {};
  if (typeof civNameOrUpgrades === 'string') {
    civName = civNameOrUpgrades;
    upgrades = maybeUpgrades || {};
  } else if (civNameOrUpgrades && typeof civNameOrUpgrades === 'object') {
    upgrades = civNameOrUpgrades;
    civName = upgrades.civName || upgrades.civ || unit.civName || unit.civ || '';
  } else {
    upgrades = maybeUpgrades || {};
    civName = unit.civName || unit.civ || '';
  }

  const uid = Number(unit.ID ?? unit.id ?? 0);
  const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();

  for (const key of Object.keys(BALLISTIC_PROFILES)) {
    const line = BALLISTIC_PROFILES[key];
    if (line.match(name, uid)) {
      return line.getProfile(unit, civName, upgrades);
    }
  }
  return null;
}

/**
 * civModifiers.js - Modificadores de producción y costo de alimentos
 * Calcula el rendimiento dinámico de recursos para Granjas, Trampas para peces y Pasturas
 */
function calculateEconomicYield(buildingKey, civName, upgrades = {}) {
  const normKey = (buildingKey || "").toLowerCase().trim();
  const normCiv = (civName || "").toLowerCase().trim();

  // 1. GRANJA (FARM)
  if (["granja", "farm"].includes(normKey)) {
    let baseFood = 175;
    let upgradeFood = 0;

    // Multiplicador de efectividad de mejoras de granja (Sicilianos: +125% -> factor 2.25)
    const isSicilian = ["sicilians", "sicilianos"].includes(normCiv);
    const upgradeMultiplier = isSicilian ? 2.25 : 1.0;

    if (upgrades.horse_collar || upgrades.horseCollar) upgradeFood += Math.round(75 * upgradeMultiplier);
    if (upgrades.heavy_plow || upgrades.heavyPlow)   upgradeFood += Math.round(125 * upgradeMultiplier);
    if (upgrades.crop_rotation || upgrades.cropRotation) upgradeFood += Math.round(175 * upgradeMultiplier);

    let totalFood = baseFood + upgradeFood;

    // Bonos porcentuales sobre la capacidad total
    if (["chinese", "chinos"].includes(normCiv)) {
      totalFood = Math.round(totalFood * 1.10); // Granjas proporcionan +10% de alimento
    } else if (["mayans", "mayas"].includes(normCiv)) {
      totalFood = Math.round(totalFood * 1.15); // Recursos duran 15% más
    }

    return {
      resourceType: "Alimento",
      amount: totalFood,
      label: `${totalFood} Alimento`,
      details: isSicilian ? `(+125% efectividad de mejoras sicilianas)` : ""
    };
  }

  // 2. TRAMPA PARA PECES (FISH TRAP)
  if (["trampa para peces", "fish_trap"].includes(normKey)) {
    let totalFood = 710;
    const isMalay = ["malay", "malayos"].includes(normCiv);

    if (isMalay) {
      totalFood = 710 * 3; // Malayos: El triple de alimento (2130)
    }

    return {
      resourceType: "Alimento",
      amount: totalFood,
      label: `${totalFood} Alimento`,
      details: isMalay ? "(3x alimento por bono malayo)" : ""
    };
  }

  // 3. PASTURAS (KHITAN)
  if (["pasturas", "pastura", "pasture"].includes(normKey)) {
    const FOOD_PER_ANIMAL = 140; // 140 de comida por cada animal
    let animals = 0;

    if (upgrades.domestication) animals += 1;
    if (upgrades.pastoralism)   animals += 2;
    if (upgrades.transhumance)  animals += 3;

    const totalFoodBonus = animals * FOOD_PER_ANIMAL;

    return {
      resourceType: "Animales / Carne",
      amount: totalFoodBonus,
      animalsCount: animals,
      label: animals > 0 
        ? `+${animals} Animales (+${totalFoodBonus} Alimento)` 
        : "Generación continua (140 Alimento/animal)"
    };
  }

  return null;
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const copy = {};
  for (const k of Object.keys(obj)) {
    copy[k] = deepClone(obj[k]);
  }
  return copy;
}

function resolveCivEcoKey(civ) {
  if (!civ) return 'generic';
  let resolved = civ;
  if (typeof resolveCivKey === 'function') {
    resolved = resolveCivKey(civ);
  } else if (typeof window !== 'undefined' && typeof window.resolveCivKey === 'function') {
    resolved = window.resolveCivKey(civ);
  } else if (typeof require === 'function') {
    try {
      const av = require('./availability.js');
      if (av && typeof av.resolveCivKey === 'function') resolved = av.resolveCivKey(civ);
    } catch (e) {}
  }
  return String(resolved || civ).toLowerCase().trim().replace(/\s+/g, '_');
}

function getCivEcoBonusesData(civName) {
  let db = null;
  if (typeof CIV_ECONOMIC_BONUSES !== 'undefined') db = CIV_ECONOMIC_BONUSES;
  else if (typeof window !== 'undefined' && window.CIV_ECONOMIC_BONUSES) db = window.CIV_ECONOMIC_BONUSES;
  else if (typeof require === 'function') {
    try {
      const mod = require('./civEcoBonuses-v2.js');
      db = mod.CIV_ECONOMIC_BONUSES || mod;
    } catch (e) {}
  }
  if (!db) return null;

  const raw = String(civName || '').toLowerCase().trim();
  if (!raw || raw === 'all' || raw === 'generic' || raw === 'genérico') return null;

  const key = resolveCivEcoKey(civName);
  if (db[key]) return db[key];
  if (db[raw]) return db[raw];

  const singular = key.endsWith('s') ? key.slice(0, -1) : key;
  const plural = key + 's';
  if (db[singular]) return db[singular];
  if (db[plural]) return db[plural];

  for (const [k, data] of Object.entries(db)) {
    if (data.civ && (data.civ.toLowerCase() === key || data.civ.toLowerCase() === raw)) {
      return data;
    }
  }

  return null;
}

function matchBuildingEcoTarget(target, bKey, building) {
  const t = String(target || '').toLowerCase().trim();
  const k = String(bKey || '').toLowerCase().trim();
  const cat = String(building?.category || '').toLowerCase();
  const name = String(building?.name || '').toLowerCase();

  if (t === 'buildings' || t === 'all_buildings') return true;
  if (t === 'buildings_except_farms') return !['farm', 'pasture', 'fish_trap', 'granja', 'pastura', 'trampa_para_peces'].includes(k);
  if (t === 'town_center' || t === 'town_centers') return ['town_center', 'town_center_feudal', 'rtwc', 'rtwc2'].includes(k) || name.includes('centro urbano');
  if (t === 'town_center_and_dock') return ['town_center', 'town_center_feudal', 'rtwc', 'rtwc2', 'dock', 'harbor', 'dock_floating'].includes(k) || name.includes('centro urbano') || name.includes('muelle') || name.includes('puerto');
  if (t === 'drop_off_buildings') return ['mill', 'lumber_camp', 'mining_camp', 'settlement', 'asentamiento', 'folwark', 'mule_cart'].includes(k);
  if (t === 'farm') return ['farm', 'pasture', 'granja', 'pastura'].includes(k);
  if (t === 'pasture') return ['pasture', 'pastura'].includes(k);
  if (t === 'settlement') return ['settlement', 'asentamiento'].includes(k) || name.includes('asentamiento');
  if (t === 'house_and_settlement') return ['house', 'settlement', 'casa', 'asentamiento'].includes(k);
  if (t === 'house') return ['house', 'casa'].includes(k);
  if (t === 'dock') return ['dock', 'harbor', 'puerto', 'dock_floating'].includes(k);
  if (t === 'fish_trap') return ['fish_trap', 'trampa_para_peces'].includes(k);
  if (t === 'watch_tower' || t === 'towers' || t === 'tower') return ['watch_tower', 'guard_tower', 'keep', 'bombard_tower', 'donjon', 'outpost'].includes(k) || k.includes('tower');
  if (t === 'tower_and_castle' || t === 'castle_and_tower') return ['watch_tower', 'guard_tower', 'keep', 'bombard_tower', 'donjon', 'castle', 'krepost'].includes(k) || k.includes('tower') || k.includes('castle');
  if (t === 'military_buildings' || t === 'military_buildings_and_docks') return ['barracks', 'archery_range', 'stable', 'siege_workshop', 'castle', 'donjon', 'krepost', 'dock', 'harbor'].includes(k) || cat === 'military';
  if (t === 'blacksmith') return ['blacksmith', 'blac'].includes(k) || name.includes('herrería');
  if (t === 'blacksmith_and_university') return ['blacksmith', 'university', 'blac', 'univ'].includes(k) || name.includes('herrería') || name.includes('universidad');
  if (t === 'university') return ['university', 'univ'].includes(k) || name.includes('universidad');
  if (t === 'monastery') return ['monastery', 'fortified_church', 'crch'].includes(k) || name.includes('monasterio') || name.includes('iglesia');
  if (t === 'market') return ['market'].includes(k) || name.includes('mercado');
  if (t === 'mule_cart') return ['mule_cart', 'carro_mulas', 'carro_de_mulas'].includes(k);
  if (t === 'fortified_church') return ['fortified_church', 'iglesia_fortificada'].includes(k);
  if (t === 'folwark') return ['folwark', 'mill'].includes(k);
  if (t === 'feitoria') return ['feitoria', 'factoria'].includes(k);
  if (t === 'caravanserai') return ['caravanserai', 'caravansarai'].includes(k);
  if (t === 'builder') return true;

  return k === t || k.includes(t) || t.includes(k);
}

function calculateBuildingStats(baseBuilding, civId, age = 3, activeTechs = {}) {
  let reg = null;
  if (typeof BUILDING_REGISTRY !== 'undefined') reg = BUILDING_REGISTRY;
  else if (typeof window !== 'undefined' && window.BUILDING_REGISTRY) reg = window.BUILDING_REGISTRY;
  else if (typeof require === 'function') {
    try { reg = require('./buildings.js').BUILDING_REGISTRY; } catch (e) {}
  }
  reg = reg || {};

  let raw = null;
  if (typeof baseBuilding === 'object' && baseBuilding !== null) {
    raw = baseBuilding;
  } else if (reg[baseBuilding]) {
    raw = reg[baseBuilding];
  } else if (typeof getBuildingByKey === 'function') {
    raw = getBuildingByKey(baseBuilding);
  } else if (typeof window !== 'undefined' && typeof window.getBuildingByKey === 'function') {
    raw = window.getBuildingByKey(baseBuilding);
  }

  if (!raw) {
    const num = Number(baseBuilding);
    raw = Object.values(reg).find(b => b.id === num || b.key === String(baseBuilding).toLowerCase());
    if (!raw) raw = { baseHp: 1000, armours: [], attacks: [], baseRange: 0, minRange: 0, los: 6, baseAttack: 0, reloadTime: 2.0, cost: {}, buildTime: 40 };
  }

  // Deep clone to ensure total immutability
  const base = deepClone(raw);

  const civName = String(civId || '').trim();
  const normCiv = resolveCivEcoKey(civName);
  const bKey = (base.key || String(baseBuilding || '')).toLowerCase().trim();

  let currentAge = 3;
  if (typeof age === 'number') currentAge = Math.min(4, Math.max(1, age));
  else if (typeof age === 'string') {
    const a = age.toLowerCase();
    if (a.includes('dark') || a === '1') currentAge = 1;
    else if (a.includes('feudal') || a === '2') currentAge = 2;
    else if (a.includes('castle') || a === '3') currentAge = 3;
    else if (a.includes('imperial') || a === '4') currentAge = 4;
  }
  const ageKey = ['dark', 'feudal', 'castle', 'imperial'][currentAge - 1];

  // 1. ESCALADO POR EDAD BASE MAESTRO
  let ageScale = null;
  if (base.ageScaling && base.ageScaling[currentAge]) {
    ageScale = base.ageScaling[currentAge];
  } else if (typeof BUILDING_AGE_SCALING !== 'undefined' && BUILDING_AGE_SCALING[bKey]) {
    ageScale = BUILDING_AGE_SCALING[bKey][currentAge];
  } else if (typeof window !== 'undefined' && window.BUILDING_AGE_SCALING && window.BUILDING_AGE_SCALING[bKey]) {
    ageScale = window.BUILDING_AGE_SCALING[bKey][currentAge];
  } else if (typeof require === 'function') {
    try {
      const bMod = require('./buildings.js');
      if (bMod.BUILDING_AGE_SCALING && bMod.BUILDING_AGE_SCALING[bKey]) {
        ageScale = bMod.BUILDING_AGE_SCALING[bKey][currentAge];
      }
    } catch (e) {}
  }

  const baseCost = {
    wood: base.cost?.wood ?? base.cost?.Wood ?? 0,
    food: base.cost?.food ?? base.cost?.Food ?? 0,
    gold: base.cost?.gold ?? base.cost?.Gold ?? 0,
    stone: base.cost?.stone ?? base.cost?.Stone ?? 0
  };

  const initialHp = (ageScale && ageScale.hp !== undefined) ? ageScale.hp : (base.baseHp || 1000);
  const initialMeleeArmor = (ageScale && ageScale.meleeArmor !== undefined) ? ageScale.meleeArmor : (base.armours?.find(a => a.Class === 4)?.Amount || base.meleeArmor || 0);
  const initialPierceArmor = (ageScale && ageScale.pierceArmor !== undefined) ? ageScale.pierceArmor : (base.armours?.find(a => a.Class === 3)?.Amount || base.pierceArmor || 0);
  const initialBuildingArmor = base.armours?.find(a => a.Class === 11)?.Amount || base.buildingArmor || 0;
  const initialStoneArmor = base.armours?.find(a => a.Class === 13)?.Amount || base.stoneArmor || 0;
  const initialRange = (ageScale && ageScale.range !== undefined) ? ageScale.range : (base.baseRange || 0);
  const initialMinRange = (ageScale && ageScale.minRange !== undefined) ? ageScale.minRange : (base.minRange || 0);
  const initialLos = (ageScale && ageScale.los !== undefined) ? ageScale.los : (base.los || 6);
  const initialAttack = (ageScale && ageScale.attack !== undefined) ? ageScale.attack : (base.baseAttack || 0);
  const initialReloadTime = base.reloadTime || 0;
  const initialProjectiles = base.projectiles || (((ageScale?.attack || base.baseAttack) > 0) ? 1 : 0);
  const initialAccuracy = base.accuracy || 100;
  const initialGarrison = (ageScale && ageScale.garrisonCapacity !== undefined) ? ageScale.garrisonCapacity : (base.garrisonCapacity || 0);
  const initialPopulation = (ageScale && ageScale.population !== undefined) ? ageScale.population : (base.population || 0);
  const initialHealRate = (ageScale && ageScale.healRate !== undefined) ? ageScale.healRate : (base.healRate || 0);
  const initialBuildTime = base.buildTime || 40;

  let stats = {
    hp: initialHp,
    meleeArmor: initialMeleeArmor,
    pierceArmor: initialPierceArmor,
    buildingArmor: initialBuildingArmor,
    stoneArmor: initialStoneArmor,
    range: initialRange,
    minRange: initialMinRange,
    los: initialLos,
    attack: initialAttack,
    reloadTime: initialReloadTime,
    projectiles: initialProjectiles,
    accuracy: initialAccuracy,
    garrisonCapacity: initialGarrison,
    population: initialPopulation,
    workRate: 1.0,
    healRate: initialHealRate,
    cost: {
      wood: baseCost.wood,
      food: baseCost.food,
      gold: baseCost.gold,
      stone: baseCost.stone,
      Wood: baseCost.wood,
      Food: baseCost.food,
      Gold: baseCost.gold,
      Stone: baseCost.stone
    },
    buildTime: initialBuildTime,
    baseStats: {
      hp: initialHp,
      meleeArmor: initialMeleeArmor,
      pierceArmor: initialPierceArmor,
      buildingArmor: initialBuildingArmor,
      stoneArmor: initialStoneArmor,
      range: initialRange,
      minRange: initialMinRange,
      los: initialLos,
      attack: initialAttack,
      reloadTime: initialReloadTime,
      projectiles: initialProjectiles,
      accuracy: initialAccuracy,
      garrisonCapacity: initialGarrison,
      population: initialPopulation,
      workRate: 1.0,
      healRate: initialHealRate,
      cost: { ...baseCost, Wood: baseCost.wood, Food: baseCost.food, Gold: baseCost.gold, Stone: baseCost.stone },
      buildTime: initialBuildTime
    },
    appliedBonuses: []
  };

  const selectedUpgrades = activeTechs || {};

  // 2. MEJORAS DE INVESTIGACIÓN (Filtradas por tecnologías aplicables)
  let applicableTechs = null;
  if (typeof getBuildingTechList === 'function') {
    applicableTechs = getBuildingTechList(bKey);
  } else if (typeof window !== 'undefined' && typeof window.getBuildingTechList === 'function') {
    applicableTechs = window.getBuildingTechList(bKey);
  } else if (typeof require === 'function') {
    try {
      const upg = require('./buildingUpgrades.js');
      if (upg && typeof upg.getBuildingTechList === 'function') {
        applicableTechs = upg.getBuildingTechList(bKey);
      }
    } catch (e) {}
  }

  const isTechApplicable = (techId) => (!applicableTechs || applicableTechs.includes(techId));

  if (selectedUpgrades.masonry && isTechApplicable(50)) {
    stats.hp *= 1.10;
    stats.meleeArmor += 1;
    stats.pierceArmor += 1;
    stats.buildingArmor += 3;
  }
  if (selectedUpgrades.architecture && isTechApplicable(51)) {
    stats.hp *= 1.10;
    stats.meleeArmor += 1;
    stats.pierceArmor += 1;
    stats.buildingArmor += 3;
  }
  if (selectedUpgrades.treadmillCrane && isTechApplicable(379)) {
    stats.buildTime = Math.round(stats.buildTime / 1.20);
  }

  const canShoot = (stats.attack > 0 || ['castle', 'watch_tower', 'guard_tower', 'keep', 'bombard_tower', 'town_center', 'town_center_feudal', 'harbor', 'donjon', 'krepost', 'fortified_church'].includes(bKey));

  if (selectedUpgrades.murderHoles && (canShoot || stats.minRange > 0) && (isTechApplicable(51) || isTechApplicable(322))) {
    stats.minRange = 0;
  }

  const isFortifiedChurch = (bKey === 'fortified_church' || bKey === 'iglesia_fortificada' || bKey === 'fortcrch' || bKey === '1806' || bKey === '88');

  if (canShoot) {
    if (selectedUpgrades.fletching && isTechApplicable(199)) {
      stats.attack = (stats.attack || 0) + 1;
      if (!isFortifiedChurch) stats.range = (stats.range || 0) + 1;
    }
    if (selectedUpgrades.bodkinArrow && isTechApplicable(200)) {
      stats.attack = (stats.attack || 0) + 1;
      if (!isFortifiedChurch) stats.range = (stats.range || 0) + 1;
    }
    if (selectedUpgrades.bracer && isTechApplicable(201)) {
      stats.attack = (stats.attack || 0) + 1;
      if (!isFortifiedChurch) stats.range = (stats.range || 0) + 1;
    }
    if (selectedUpgrades.chemistry && isTechApplicable(47)) {
      stats.attack = (stats.attack || 0) + 1;
    }
    if (selectedUpgrades.ballistics && isTechApplicable(93)) {
      stats.accuracy = 100;
    }
    if ((selectedUpgrades.arrowslits || selectedUpgrades.saeteras || selectedUpgrades['234']) && isTechApplicable(234)) {
      let arrowslitsBonus = 0;
      if (bKey === 'watch_tower' || bKey === 'wctw') arrowslitsBonus = 1;
      else if (bKey === 'guard_tower' || bKey === 'wctw2') arrowslitsBonus = 2;
      else if (bKey === 'keep' || bKey === 'wctw3') arrowslitsBonus = 3;
      else if (bKey === 'donjon') arrowslitsBonus = (currentAge >= 4 ? 3 : 2);

      if (arrowslitsBonus > 0) {
        stats.attack = (stats.attack || 0) + arrowslitsBonus;
        if (!stats.appliedBonuses.includes(`Saeteras (+${arrowslitsBonus} ataque)`)) {
          stats.appliedBonuses.push(`Saeteras (+${arrowslitsBonus} ataque)`);
        }
      }
    }
  }

  if (selectedUpgrades.conscription && (isTechApplicable(315) || isTechApplicable(65)) && ['barracks', 'archery_range', 'stable', 'castle', 'donjon'].includes(bKey)) {
    stats.workRate *= 1.33;
  }

  if (['dock', 'harbor'].includes(bKey)) {
    if (selectedUpgrades.shipwright && (isTechApplicable(65) || isTechApplicable(373))) {
      stats.buildTime = Math.round(stats.buildTime * 0.65);
    }
    if (selectedUpgrades.dryDock && isTechApplicable(374)) {
      stats.workRate *= 1.15;
    }
  }

  if (selectedUpgrades.townWatch) stats.los += 4;
  if (selectedUpgrades.townPatrol) stats.los += 4;
  if (selectedUpgrades.greekFire && (bKey === 'harbor' || bKey === 'dock')) stats.range += 1;
  if (selectedUpgrades.greatWall && (bKey.includes('wall') || bKey.includes('tower') || bKey === 'gate')) stats.hp *= 1.30;
  if (selectedUpgrades.yasama && (bKey.includes('tower') || bKey === 'donjon')) stats.projectiles = (stats.projectiles || 1) + 2;

  // Torres esvanas (Svan Towers - ID 923 - Georgianos)
  const isSvanEligible = [
    'town_center', 'town_center_feudal', 'rtwc', 'rtwc2',
    'watch_tower', 'guard_tower', 'keep', 'wctw', 'wctw2', 'wctw3',
    'castle', 'cstl',
    'fortified_church', 'fortcrch',
    'dock', 'harbor', 'puerto'
  ].some(k => bKey === k || bKey.includes(k));

  const hasSvanTowers = Boolean(
    selectedUpgrades.svanTowers ||
    selectedUpgrades.svan_towers ||
    selectedUpgrades.torresEsvanas ||
    selectedUpgrades['923'] ||
    (["georgians", "georgianos"].includes(normCiv) && (selectedUpgrades.castleCrown || selectedUpgrades.uniqueCastleTech))
  );

  if (isSvanEligible && hasSvanTowers && isTechApplicable(923)) {
    stats.attack = (stats.attack || 0) + 2;
    if (!stats.projectiles || stats.projectiles <= 0) stats.projectiles = 1;
    if ((bKey === 'dock' || bKey === 'harbor') && (!stats.range || stats.range <= 0)) {
      stats.range = 6;
    }
    if (!stats.appliedBonuses.includes('Torres esvanas (+2 ataque)')) {
      stats.appliedBonuses.push('Torres esvanas (+2 ataque)');
    }
  }

  // 3. CONSULTA REACTIVA A civEcoBonuses-v2.js
  const civEco = getCivEcoBonusesData(civName);
  if (civEco && Array.isArray(civEco.bonuses)) {
    for (const b of civEco.bonuses) {
      for (const mod of (b.modifiers || [])) {
        if (!mod.valuesByAge) continue;
        const val = mod.valuesByAge[ageKey] ?? mod.valuesByAge.all ?? 0;
        if (val === 0 && mod.mode !== 'set') continue;

        const target = mod.target;
        if (!matchBuildingEcoTarget(target, bKey, base)) continue;

        let applied = false;
        switch (mod.stat) {
          case 'wood_cost':
            if (mod.mode === 'multiply') {
              const mult = Math.max(0, 1 + val);
              stats.cost.wood = Math.round(stats.cost.wood * mult);
              stats.cost.Wood = stats.cost.wood;
              applied = true;
            } else if (mod.mode === 'add') {
              stats.cost.wood = Math.max(0, Math.round(stats.cost.wood + val));
              stats.cost.Wood = stats.cost.wood;
              applied = true;
            }
            break;
          case 'stone_cost':
            if (mod.mode === 'multiply') {
              const mult = Math.max(0, 1 + val);
              stats.cost.stone = Math.round(stats.cost.stone * mult);
              stats.cost.Stone = stats.cost.stone;
              applied = true;
            } else if (mod.mode === 'add') {
              stats.cost.stone = Math.max(0, Math.round(stats.cost.stone + val));
              stats.cost.Stone = stats.cost.stone;
              applied = true;
            }
            break;
          case 'food_cost':
            if (mod.mode === 'multiply') {
              const mult = Math.max(0, 1 + val);
              stats.cost.food = Math.round(stats.cost.food * mult);
              stats.cost.Food = stats.cost.food;
              applied = true;
            } else if (mod.mode === 'add') {
              stats.cost.food = Math.max(0, Math.round(stats.cost.food + val));
              stats.cost.Food = stats.cost.food;
              applied = true;
            }
            break;
          case 'gold_cost':
            if (mod.mode === 'multiply') {
              const mult = Math.max(0, 1 + val);
              stats.cost.gold = Math.round(stats.cost.gold * mult);
              stats.cost.Gold = stats.cost.gold;
              applied = true;
            } else if (mod.mode === 'add') {
              stats.cost.gold = Math.max(0, Math.round(stats.cost.gold + val));
              stats.cost.Gold = stats.cost.gold;
              applied = true;
            }
            break;
          case 'cost':
            if (mod.mode === 'multiply') {
              const mult = Math.max(0, 1 + val);
              stats.cost.wood = Math.round(stats.cost.wood * mult);
              stats.cost.Wood = stats.cost.wood;
              stats.cost.food = Math.round(stats.cost.food * mult);
              stats.cost.Food = stats.cost.food;
              stats.cost.gold = Math.round(stats.cost.gold * mult);
              stats.cost.Gold = stats.cost.gold;
              stats.cost.stone = Math.round(stats.cost.stone * mult);
              stats.cost.Stone = stats.cost.stone;
              applied = true;
            }
            break;
          case 'hp':
            if (mod.mode === 'multiply') {
              stats.hp = Math.round(stats.hp * (1 + val));
              applied = true;
            } else if (mod.mode === 'add') {
              stats.hp = Math.round(stats.hp + val);
              applied = true;
            }
            break;
          case 'build_speed':
            if (mod.mode === 'multiply') {
              if (!(target === 'builder' && ['wonder', 'wndr'].includes(bKey))) {
                stats.buildTime = Math.round(stats.buildTime / (1 + val));
                applied = true;
              }
            }
            break;
          case 'work_rate':
            if (mod.mode === 'multiply') {
              stats.workRate = stats.workRate * (1 + val);
              applied = true;
            }
            break;
          case 'garrison_capacity':
            if (mod.mode === 'add') {
              stats.garrisonCapacity = (stats.garrisonCapacity || 0) + val;
              applied = true;
            } else if (mod.mode === 'set') {
              stats.garrisonCapacity = val;
              applied = true;
            }
            break;
          case 'population_provided':
          case 'population':
            if (mod.mode === 'add') {
              stats.population = (stats.population || 0) + val;
              applied = true;
            } else if (mod.mode === 'set') {
              stats.population = val;
              applied = true;
            }
            break;
          case 'line_of_sight':
            if (mod.mode === 'add') {
              stats.los = (stats.los || 0) + val;
              applied = true;
            }
            break;
          case 'range':
            if (mod.mode === 'add') {
              stats.range = (stats.range || 0) + val;
              applied = true;
            }
            break;
        }

        if (applied && b.text && !stats.appliedBonuses.includes(b.text)) {
          stats.appliedBonuses.push(b.text);
        }
      }
    }
  }

  // 4. CORONAS Y REGLAS REGIONALES ESPECÍFICAS

  // Asentamiento Sudamericano (Incas, Muisca, Mapuche, Tupí)
  if (bKey === 'settlement' || bKey === 'asentamiento') {
    if (['muisca'].includes(normCiv)) {
      stats.healRate = Math.max(stats.healRate || 0, 1.0); // Muisca sana unidades cercanas
    }
  }

  // Carro de Mulas (Armenios y Georgianos)
  if (bKey === 'mule_cart' || bKey === 'carro_mulas' || bKey === 'carro_de_mulas') {
    if (["armenians", "armenios"].includes(normCiv)) {
      stats.workRate = 1.25;
    }
  }

  // Iglesia Fortificada (Armenios y Georgianos)
  if (bKey === 'fortified_church' || bKey === 'iglesia_fortificada' || bKey === 'fortcrch') {
    stats.healRate = stats.healRate || 1.0;
    if (["georgians", "georgianos"].includes(normCiv)) {
      stats.aura = {
        type: 'aura_work_rate',
        target: 'villager',
        radius: 9,
        value: 0.10,
        label: '+10% velocidad de trabajo a aldeanos',
        description: 'Proporciona a los aldeanos en un radio de 9 casillas un +10% de velocidad de trabajo.'
      };
      stats.auraRadius = 9;
      stats.auraWorkRate = 0.10;
      if (!stats.appliedBonuses.includes('Aura económica (+10% velocidad de trabajo a aldeanos en radio 9)')) {
        stats.appliedBonuses.push('Aura económica (+10% velocidad de trabajo a aldeanos en radio 9)');
      }
    }
  }

  // Caravansarai (Persas e Indostaníes)
  if (bKey === 'caravanserai' || bKey === 'caravansarai') {
    stats.healRate = 2.0;
    stats.workRate = 1.33;
  }

  // Feitoria (Portugueses)
  if (bKey === 'feitoria' || bKey === 'factoria') {
    stats.population = -20;
  }

  // Teutones: Matacanes gratis, Almenas (Crenellations) y doble guarnición en torres (+5)
  if (["teutons", "teutones"].includes(normCiv)) {
    stats.minRange = 0;
    if (['watch_tower', 'guard_tower', 'keep', 'bombard_tower', 'wctw', 'wctw2', 'wctw3', 'wctw4'].includes(bKey)) {
      stats.garrisonCapacity = Math.max(stats.garrisonCapacity || 5, 10);
    }
    if ((bKey === "castle" || bKey === "cstl") && (selectedUpgrades.crenellations || selectedUpgrades.uniqueImpTech)) {
      stats.range += 3;
    }
  }

  // Coreanos: Torres +1 alcance en Castillos, +2 en Imperial
  if (["koreans", "coreanos", "korean"].includes(normCiv)) {
    if (['watch_tower', 'guard_tower', 'keep', 'wctw', 'wctw2', 'wctw3'].includes(bKey)) {
      if (stats.range === stats.baseStats.range) {
        if (currentAge === 3) stats.range += 1;
        else if (currentAge === 4) stats.range += 2;
      }
    }
  }

  // Dravídicos: Muelles proporcionan +5 de población (Team Bonus)
  if (["dravidians", "dravídicos", "dravidicos"].includes(normCiv)) {
    if (['dock', 'harbor', 'puerto', 'dock_floating'].includes(bKey)) {
      if (stats.population === stats.baseStats.population) {
        stats.population = (stats.population || 0) + 5;
      }
    }
  }

  // Turcos: Artillería (+2 rango a Torres de Bombardeo)
  if (["turks", "turcos"].includes(normCiv) && (bKey === "bombard_tower" || bKey === "wctw4")) {
    if (selectedUpgrades.artillery || selectedUpgrades.uniqueImpTech) {
      stats.range += 2;
    }
  }

  // Monasterio e Iglesias: Inquisición española
  if (bKey === "monastery" || bKey === "crch" || bKey === "fortified_church") {
    stats.healRate = stats.healRate || 1.0;
    if (["spanish", "españoles"].includes(normCiv) && selectedUpgrades.inquisition) {
      stats.workRate *= 1.25;
    }
  }

  // 5. RENDIMIENTO ECONÓMICO Y BONIFICACIONES DE ALIMENTO (Granjas, Trampas, Pasturas)
  const economicYield = calculateEconomicYield(bKey, normCiv, selectedUpgrades);
  if (economicYield) {
    stats.economicYield = economicYield;
  }

  // Redondeo canónico de AoE2 DE
  stats.hp = Math.round(stats.hp);
  stats.buildTime = Math.max(1, Math.round(stats.buildTime));
  stats.cost.wood = Math.max(0, Math.round(stats.cost.wood));
  stats.cost.food = Math.max(0, Math.round(stats.cost.food));
  stats.cost.gold = Math.max(0, Math.round(stats.cost.gold));
  stats.cost.stone = Math.max(0, Math.round(stats.cost.stone));
  stats.cost.Wood = stats.cost.wood;
  stats.cost.Food = stats.cost.food;
  stats.cost.Gold = stats.cost.gold;
  stats.cost.Stone = stats.cost.stone;

  return stats;
}

function getBuildingAgeScaling(buildingKey, age = 3) {
  const bKey = String(buildingKey || '').toLowerCase().trim();
  const currentAge = Math.min(4, Math.max(1, Number(age) || 3));
  if (typeof BUILDING_AGE_SCALING !== 'undefined' && BUILDING_AGE_SCALING[bKey]) {
    return BUILDING_AGE_SCALING[bKey][currentAge];
  }
  if (typeof window !== 'undefined' && window.BUILDING_AGE_SCALING && window.BUILDING_AGE_SCALING[bKey]) {
    return window.BUILDING_AGE_SCALING[bKey][currentAge];
  }
  if (typeof require === 'function') {
    try {
      const bMod = require('./buildings.js');
      if (bMod.BUILDING_AGE_SCALING && bMod.BUILDING_AGE_SCALING[bKey]) {
        return bMod.BUILDING_AGE_SCALING[bKey][currentAge];
      }
    } catch (e) {}
  }
  return null;
}

/**
 * civModifiers.js - Modificadores y Bonificaciones de Tecnologías por Civilización
 * Calcula el coste y tiempo dinámico de investigación aplicando descuentos oficiales.
 */
function calculateTechCost(techId, civName, age, baseCost = {}, baseResearchTime = 0, category = '') {
  const normCiv = (civName || '').toLowerCase().trim();
  const id = Number(techId);
  const cost = {
    Food: baseCost.Food || 0,
    Wood: baseCost.Wood || 0,
    Gold: baseCost.Gold || 0,
    Stone: baseCost.Stone || 0
  };
  let time = Number(baseResearchTime) || 0;
  const bonuses = [];

  // 1. Chinos: Tecnologías cuestan -10% en Feudal, -15% en Castillos, -20% en Imperial
  if (['chinese', 'chinos'].includes(normCiv)) {
    const ageNum = Number(age) || 3;
    let factor = 1.0;
    if (ageNum === 2) factor = 0.90;
    else if (ageNum === 3) factor = 0.85;
    else if (ageNum >= 4) factor = 0.80;

    if (factor < 1.0) {
      const pct = Math.round((1 - factor) * 100);
      cost.Food = Math.round(cost.Food * factor);
      cost.Wood = Math.round(cost.Wood * factor);
      cost.Gold = Math.round(cost.Gold * factor);
      cost.Stone = Math.round(cost.Stone * factor);
      bonuses.push(`Chinos: Tecnologías cuestan -${pct}%`);
    }
  }

  // 2. Búlgaros: -50% Alimento en mejoras de herrería
  if (['bulgarians', 'búlgaros', 'bulgarian'].includes(normCiv) && (category === 'blacksmith' || [103].includes(category))) {
    cost.Food = Math.round(cost.Food * 0.5);
    bonuses.push('Búlgaros: -50% Alimento en mejoras de herrería');
  }

  // 3. Españoles: Las tecnologías de herrería no cuestan oro
  if (['spanish', 'españoles', 'espanoles'].includes(normCiv) && (category === 'blacksmith' || [103].includes(category))) {
    cost.Gold = 0;
    bonuses.push('Españoles: Las tecnologías de herrería no cuestan oro');
  }

  // 4. Bizantinos: Guardia urbana (8) y Patrulla urbana (280) gratis
  if (['byzantines', 'bizantinos'].includes(normCiv) && [8, 280].includes(id)) {
    cost.Food = 0; cost.Wood = 0; cost.Gold = 0; cost.Stone = 0; time = 0;
    bonuses.push('Bizantinos: Guardia y Patrulla urbana gratis e instantáneas');
  }

  // 5. Turcos: Química (47) gratis
  if (['turks', 'turcos'].includes(normCiv) && id === 47) {
    cost.Food = 0; cost.Wood = 0; cost.Gold = 0; cost.Stone = 0; time = 0;
    bonuses.push('Turcos: Química gratis e instantánea');
  }

  // 6. Francos: Mejoras de molino (14, 13, 12) gratis
  if (['franks', 'francos'].includes(normCiv) && [14, 13, 12].includes(id)) {
    cost.Food = 0; cost.Wood = 0; cost.Gold = 0; cost.Stone = 0; time = 0;
    bonuses.push('Francos: Mejoras de granja gratis al avanzar de edad');
  }

  // 7. Birmanos: Mejoras de maderero (202, 203, 221) gratis
  if (['burmese', 'birmanos'].includes(normCiv) && [202, 203, 221].includes(id)) {
    cost.Food = 0; cost.Wood = 0; cost.Gold = 0; cost.Stone = 0; time = 0;
    bonuses.push('Birmanos: Mejoras de campamento maderero gratis');
  }

  // 8. Tártaros: Anillo de pulgar (437) y Tácticas partas (436) gratis
  if (['tatars', 'tártaros'].includes(normCiv) && [437, 436].includes(id)) {
    cost.Food = 0; cost.Wood = 0; cost.Gold = 0; cost.Stone = 0; time = 0;
    bonuses.push('Tártaros: Anillo de pulgar y Tácticas partas gratis');
  }

  // 9. Italianos: Tecnologías de muelle -33%, Avance de edad -15%
  if (['italians', 'italianos'].includes(normCiv)) {
    if (category === 'dock' || [373, 374, 375, 65, 907, 908, 909, 910].includes(id)) {
      cost.Food = Math.round(cost.Food * 0.67);
      cost.Wood = Math.round(cost.Wood * 0.67);
      cost.Gold = Math.round(cost.Gold * 0.67);
      bonuses.push('Italianos: Tecnologías de muelle -33% más baratas');
    } else if ([101, 102, 103].includes(id)) {
      cost.Food = Math.round(cost.Food * 0.85);
      cost.Gold = Math.round(cost.Gold * 0.85);
      bonuses.push('Italianos: Avance de edad -15% más barato');
    }
  }

  // 10. Portugueses: +25% velocidad de investigación en todas las tecnologías
  if (['portuguese', 'portugueses'].includes(normCiv) && time > 0) {
    time = Math.round(time / 1.25);
    bonuses.push('Portugueses: Tecnologías se investigan 25% más rápido');
  }

  return { cost, researchTime: time, bonuses };
}

function getTechCivBonuses(techId, civName, category = '') {
  const res = calculateTechCost(techId, civName, 4, { Food: 100, Wood: 100, Gold: 100 }, 60, category);
  return res.bonuses || [];
}

const civModifiersExport = {
  UNIT_IDS,
  CIV_MILITARY_BONUSES,
  isJurchenCiv,
  isVarangianCiv,
  applyBloodlines,
  getCivMilitaryBonuses,
  applyCivMilitaryBonuses,
  isKhitanCiv,
  hasLamellarArmor,
  isMountedOrCamel,
  getKhitanRegenRate,
  getUnitRegenRate,
  getPoisonProfile,
  isRocketCartUnit,
  getBallisticProfile,
  BALLISTIC_PROFILES,
  calculateBuildingStats,
  calculateEconomicYield,
  getBuildingAgeScaling,
  calculateTechCost,
  getTechCivBonuses,
  getCivEcoBonusesData,
  matchBuildingEcoTarget,
  deepClone
};

if (typeof window !== 'undefined') {
  window.UNIT_IDS = UNIT_IDS;
  window.CIV_MILITARY_BONUSES = CIV_MILITARY_BONUSES;
  window.isJurchenCiv = isJurchenCiv;
  window.isVarangianCiv = isVarangianCiv;
  window.applyBloodlines = applyBloodlines;
  window.getCivMilitaryBonuses = getCivMilitaryBonuses;
  window.applyCivMilitaryBonuses = applyCivMilitaryBonuses;
  window.isKhitanCiv = isKhitanCiv;
  window.hasLamellarArmor = hasLamellarArmor;
  window.isMountedOrCamel = isMountedOrCamel;
  window.getKhitanRegenRate = getKhitanRegenRate;
  window.getUnitRegenRate = getUnitRegenRate;
  window.getPoisonProfile = getPoisonProfile;
  window.isRocketCartUnit = isRocketCartUnit;
  window.getBallisticProfile = getBallisticProfile;
  window.BALLISTIC_PROFILES = BALLISTIC_PROFILES;
  window.calculateBuildingStats = calculateBuildingStats;
  window.calculateEconomicYield = calculateEconomicYield;
  window.getBuildingAgeScaling = getBuildingAgeScaling;
  window.calculateTechCost = calculateTechCost;
  window.getTechCivBonuses = getTechCivBonuses;
  window.getCivEcoBonusesData = getCivEcoBonusesData;
  window.matchBuildingEcoTarget = matchBuildingEcoTarget;
  window.deepClone = deepClone;
  window.civModifiers = civModifiersExport;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = civModifiersExport;
}


