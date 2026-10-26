// ballistics.js - Motor Balístico de Precisión Genie Engine

export const BALLISTICS_REGISTRY = {
  // ==========================================
  // 1. INFANTERÍA / CABALLERÍA DE ARQUEROS
  // ==========================================
  chu_ko_nu: {
    match: (name, id) => [73, 559].includes(id) || name.includes("chu_ko_nu"),
    getProfile: (unit) => {
      const isElite = unit.ID === 559 || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("echukonu");
      return {
        projectiles: isElite ? 5 : 3, // Base: 1+2 | Élite: 1+4
        secondaryDamage: 3,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [], // 0 vs piqueros/arietes
        ignoresArmor: false,
        minDamageFloor: 1
      };
    }
  },

  kipchak: {
    match: (name, id) => [1231, 1233].includes(id) || name.includes("kipchak"),
    getProfile: (unit) => {
      const isElite = unit.ID === 1233 || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("ekipchak");
      return {
        projectiles: isElite ? 4 : 3, // Base: 1+2 | Élite: 1+3
        secondaryDamage: 3,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [],
        ignoresArmor: false,
        minDamageFloor: 1
      };
    }
  },

  composite_bowman: {
    match: (name, id) => [1800, 1802].includes(id) || name.includes("composite_bowman") || name.includes("arco_compuesto"),
    getProfile: () => ({
      projectiles: 1,
      ignoresArmor: true, // Ignora 100% Pierce Armor
      minDamageFloor: 1
    })
  },

  mayan_skirmisher: {
    match: (name, id, civ, upgrades) => {
      const isSkirm = [6, 7, 1155].includes(id) || name.includes("skirmisher") || name.includes("guerrillero");
      const isMayan = ["mayans", "mayas"].includes((civ || "").toLowerCase());
      return isSkirm && isMayan && Boolean(upgrades?.hulche || upgrades?.uniqueCastleTech || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(485)));
    },
    getProfile: () => ({
      projectiles: 2, // 1 principal + 1 secundario
      secondaryDamage: 1,
      secondaryScalesWithChemistry: false,
      secondaryBonuses: [
        { Class: 4, Amount: 1 }, // +1 vs Arqueros
        { Class: 2, Amount: 1 }  // +1 vs Piqueros
      ],
      ignoresArmor: false,
      minDamageFloor: 1
    })
  },

  shu_arbalester: {
    match: (name, id, civ, upgrades) => {
      const uid = Number(id);
      const isArb = uid === 492 || [4, 24, 492].includes(uid) || name.includes("arbalester") || name.includes("arbalesta") || name.includes("acoar");
      const normCiv = String(civ || "").toLowerCase().trim();
      const isShu = ["shu"].includes(normCiv);
      const hasTech = Boolean(
        upgrades?.boltMagazine ||
        upgrades?.cargador ||
        upgrades?.shuCrown ||
        upgrades?.uniqueImpTech ||
        upgrades?.imperialCrown ||
        (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(1069)) ||
        upgrades?.hasBoltMagazine
      );
      return isArb && isShu && hasTech;
    },
    getProfile: () => ({
      projectiles: 3, // 1 principal + 2 proyectiles adicionales (total 3)
      secondaryDamage: 1, // 1 de ataque base para proyectiles secundarios
      secondaryScalesWithChemistry: false,
      secondaryBonuses: [],
      ignoresArmor: false,
      minDamageFloor: 1,
      source: "Arbalesta del Shu (Cargador / Corona de Oro #1069)"
    })
  },

  // ==========================================
  // 2. MAQUINARIA DE ASEDIO
  // ==========================================
  organ_gun: {
    match: (name, id) => [1001, 1003].includes(id) || name.includes("organ_gun") || name.includes("salvas"),
    getProfile: (unit, civ, upgrades) => {
      const isElite = unit.ID === 1003 || (unit.name || "").toLowerCase().includes("elite");
      const chemBonus = upgrades?.chemistry ? 1 : 0;
      const baseDmg = (isElite ? 9 : 7) + chemBonus;

      return {
        projectiles: 5, // 1 principal + 4 secundarios
        secondaryDamage: baseDmg,
        secondaryScalesWithChemistry: true,
        secondaryBonuses: [
          { Class: 1, Amount: 1 },  // +1 vs Infantería
          { Class: 8, Amount: 1 },  // +1 vs Guerrilleros
          { Class: 11, Amount: 1 }  // +1 vs Edificios
        ],
        blastRadius: 0.5,
        ignoresArmor: false,
        minDamageFloor: 1
      };
    }
  },

  hussite_wagon: {
    match: (name, id) => [1704, 1706, 1709].includes(id) || name.includes("hussite_wagon") || name.includes("husita"),
    getProfile: (unit) => {
      const isElite = [1706, 1709].includes(unit.ID) || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("ehussite");
      return {
        projectiles: isElite ? 6 : 5, // Base: 1+4 | Élite: 1+5
        secondaryDamage: 4,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [],
        ignoresArmor: false,
        minDamageFloor: 1,
        absorbsProjectiles: 0.50
      };
    }
  },

  scorpion_khmer: {
    match: (name, id) => [279, 542].includes(id) || name.includes("scorpion") || name.includes("escorpion"),
    getProfile: (unit, civ, upgrades) => {
      const isKhmer = ["khmer", "jemeres"].includes((civ || "").toLowerCase());
      const hasDoubleCrossbow = isKhmer && (upgrades?.doubleCrossbow || upgrades?.uniqueImpTech || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(623)));
      if (!hasDoubleCrossbow) return { projectiles: 1, isPassThrough: true };

      const isHeavy = unit.ID === 542 || (unit.name || "").toLowerCase().includes("heavy");
      const chemBonus = upgrades?.chemistry ? 1 : 0;
      const baseDmg = (isHeavy ? 16 : 12) + chemBonus;

      return {
        projectiles: 2, // Clona el proyectil principal
        secondaryDamage: baseDmg,
        secondaryScalesWithChemistry: true,
        secondaryBonuses: isHeavy ? [
          { Class: 5, Amount: 8 },  // +8 Elefantes
          { Class: 11, Amount: 4 }, // +4 Edificios
          { Class: 20, Amount: 2 }, // +2 Arietes
          { Class: 1, Amount: 1 }   // +1 Infantería
        ] : [
          { Class: 5, Amount: 6 },  // +6 Elefantes
          { Class: 11, Amount: 2 }, // +2 Edificios
          { Class: 20, Amount: 1 }, // +1 Arietes
          { Class: 1, Amount: 1 }   // +1 Infantería
        ],
        isPassThrough: true,
        ignoresArmor: false,
        minDamageFloor: 1
      };
    }
  },

  ballista_elephant_khmer: {
    match: (name, id) => [1120, 1122].includes(id) || name.includes("ballista_elephant") || name.includes("elefante_balista"),
    getProfile: (unit, civ, upgrades) => {
      const isKhmer = ["khmer", "jemeres"].includes((civ || "").toLowerCase());
      const hasDoubleCrossbow = isKhmer && (upgrades?.doubleCrossbow || upgrades?.uniqueImpTech || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(623)));
      if (!hasDoubleCrossbow) return { projectiles: 1, isPassThrough: true };

      const isElite = unit.ID === 1122 || (unit.name || "").toLowerCase().includes("elite") || (unit.internal_name || "").toLowerCase().includes("eballis");
      const chemBonus = upgrades?.chemistry ? 1 : 0;
      const baseDmg = (isElite ? 9 : 8) + chemBonus;

      return {
        projectiles: 2,
        secondaryDamage: baseDmg,
        secondaryScalesWithChemistry: true,
        secondaryBonuses: [
          { Class: 11, Amount: 4 }, // +4 Edificios
          { Class: 13, Amount: 3 }, // +3 Defensas de piedra
          { Class: 20, Amount: 3 }, // +3 Asedio
          { Class: 20, Amount: 2 }  // +2 Arietes
        ],
        isPassThrough: true,
        ignoresArmor: false,
        minDamageFloor: 1
      };
    }
  },

  rocket_cart_line: {
    match: (name, id) => [1904, 1907].includes(id) || name.includes("rocket_cart") || name.includes("carro_cohete") || name.includes("cohete") || name.includes("rcktcrt"),
    getProfile: (unit, civ, upgrades) => {
      const uid = Number(unit?.ID ?? unit?.id ?? 0);
      const isElite = uid === 1907 || (unit?.name || "").toLowerCase().includes("elite") || (unit?.internal_name || "").toLowerCase().includes("hrcktcrt") || (unit?.localizedName || "").toLowerCase().includes("pesado");
      const normCiv = (civ || "").toLowerCase().trim();

      // Conteos de cohetes
      let count = isElite ? 10 : 8;
      const isKorean = ["koreans", "coreanos", "korean"].includes(normCiv);
      const hasKoreanTech = isKorean && (upgrades?.uniqueImpTech || upgrades?.shinkichon || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(445)) || unit?.hasShinkichon);
      if (hasKoreanTech) count = 16;

      const isJurchen = ["jurchen", "jurchens", "yurchen", "yurchens", "yurchenos", "jurchenos"].includes(normCiv);
      const hasJurchenTech = isJurchen && (upgrades?.uniqueCastleTech || upgrades?.uniqueImpTech || upgrades?.thunderclapBombs || upgrades?.bombasTrueno || (Array.isArray(upgrades?.activeUniqueTechs) && (upgrades.activeUniqueTechs.includes(997) || upgrades.activeUniqueTechs.includes(996))) || unit?.hasThunderclapBombs);

      const isChinese = ["chinese", "chinos", "chino"].includes(normCiv);
      const hasChineseTech = isChinese && (upgrades?.uniqueImpTech || upgrades?.rocketry || upgrades?.coheteria || (Array.isArray(upgrades?.activeUniqueTechs) && upgrades.activeUniqueTechs.includes(52)) || unit?.hasRocketry);
      const rawBaseDmg = isElite ? 6 : 5;
      const rocketryExtra = hasChineseTech ? Math.round(rawBaseDmg * 0.25) : 0;

      return {
        isRocketCart: true,
        projectiles: count,
        baseDamage: rawBaseDmg + rocketryExtra,
        bonusVsSiege: 4,
        bonusHeavySiege: 4,
        extraRange: hasKoreanTech ? 1 : 0,
        ignoresArmor: true, // Daño puro
        projectileImpact: hasJurchenTech ? { extraDamage: 4, aoe: 1.25 } : null,
        deathImpact: hasJurchenTech ? { damage: 15, aoe: 1.0 } : { damage: isElite ? 35 : 25, aoe: 1.5 }
      };
    }
  },

  // ==========================================
  // 3. UNIDADES NAVALES
  // ==========================================
  thirisadai: {
    match: (name, id) => [1750].includes(id) || name.includes("thirisadai"),
    getProfile: () => ({
      projectiles: 5, // 1 principal + 4 secundarios
      secondaryDamage: 3,
      secondaryScalesWithChemistry: false,
      secondaryBonuses: [],
      ignoresArmor: false,
      minDamageFloor: 1
    })
  },

  longboat: {
    match: (name, id) => [250, 533].includes(id) || name.includes("longboat") || name.includes("drakkar"),
    getProfile: (unit) => {
      const isElite = unit.ID === 533 || (unit.name || "").toLowerCase().includes("elite");
      return {
        projectiles: isElite ? 5 : 4, // Base: 1+3 | Élite: 1+4
        secondaryDamage: 1,
        secondaryScalesWithChemistry: false,
        secondaryBonuses: [],
        ignoresArmor: false,
        minDamageFloor: 1
      };
    }
  },

  caravel: {
    match: (name, id) => [1004, 1006].includes(id) || name.includes("caravel") || name.includes("carabela"),
    getProfile: () => ({
      projectiles: 1,
      isPassThrough: true,
      ignoresArmor: false,
      minDamageFloor: 1
    })
  },

  lou_chuan: {
    match: (name, id) => [1948].includes(id) || name.includes("lou_chuan") || name.includes("lou chuan"),
    getProfile: () => ({
      projectiles: 4, // 1 principal + 3 secundarios
      secondaryDamage: 2,
      secondaryScalesWithChemistry: false,
      secondaryBonuses: [],
      ignoresArmor: false,
      minDamageFloor: 1
    })
  }
};

export function getBallisticProfile(unit, civNameOrUpgrades, maybeUpgrades) {
  if (!unit) return null;
  let civName = "";
  let upgrades = {};
  if (typeof civNameOrUpgrades === "string") {
    civName = civNameOrUpgrades;
    upgrades = maybeUpgrades || {};
  } else if (civNameOrUpgrades && typeof civNameOrUpgrades === "object") {
    upgrades = civNameOrUpgrades;
    civName = upgrades.civName || upgrades.civ || unit.civName || unit.civ || "";
  } else {
    upgrades = maybeUpgrades || {};
    civName = unit.civName || unit.civ || "";
  }

  const name = (unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
  const id = Number(unit.ID ?? unit.id ?? 0);

  for (const key in BALLISTICS_REGISTRY) {
    const entry = BALLISTICS_REGISTRY[key];
    if (entry.match(name, id, civName, upgrades)) {
      return entry.getProfile(unit, civName, upgrades);
    }
  }
  return null;
}

export function calculateRocketCartDamage(attacker, defender, ballisticProfile, options = {}) {
  const profile = ballisticProfile || getBallisticProfile(attacker, attacker?.civName, options);
  if (!profile) return 0;

  const armours = Array.isArray(defender?.Armours) ? defender.Armours : (Array.isArray(defender?._rawUnitData?.Armours) ? defender._rawUnitData.Armours : []);
  const hasClass = (c) => armours.some(a => a.Class === c);
  const defId = Number(defender?.ID ?? defender?.id ?? 0);
  const isHeavySiege = hasClass(20) || hasClass(37) || [1120, 1122, 1704, 1706, 279, 542, 280, 550, 588, 1904, 1907].includes(defId);

  const bonusDmg = isHeavySiege ? (profile.bonusVsSiege || 4) : 0;
  const extraExplosive = profile.projectileImpact ? (profile.projectileImpact.extraDamage || 0) : 0;
  const damagePerRocket = profile.baseDamage + bonusDmg + extraExplosive;

  let H = 1.0;
  const rawElevation = options.elevation || attacker?.elevation || (attacker?.options && attacker.options.elevation) || 'flat';
  if (rawElevation === 'high' || rawElevation === 'downhill') {
    H = 1.25;
  } else if (rawElevation === 'low' || rawElevation === 'uphill') {
    H = 0.75;
  }

  return Math.max(1, Math.floor(H * profile.projectiles * damagePerRocket));
}

// Compatibilidad universal con entorno de navegador (global) y Node.js
if (typeof window !== 'undefined') {
  window.BALLISTICS_REGISTRY = BALLISTICS_REGISTRY;
  window.getBallisticProfile = getBallisticProfile;
  window.calculateRocketCartDamage = calculateRocketCartDamage;
  window.AoE2Ballistics = {
    BALLISTICS_REGISTRY,
    getBallisticProfile,
    calculateRocketCartDamage
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BALLISTICS_REGISTRY,
    getBallisticProfile,
    calculateRocketCartDamage
  };
}
