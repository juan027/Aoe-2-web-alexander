const fs = require('fs');
const path = require('path');

// Mock browser globals for Node environment
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

// Import modules
const { BALLISTICS_REGISTRY, getBallisticProfile } = require('../ballistics.js');
const combatCode = fs.readFileSync(path.join(__dirname, '../combat.js'), 'utf8');

// Load combat.js in sandbox
const sandbox = {
  window: global,
  console,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Set,
  Map,
  getBallisticProfile,
  BALLISTICS_REGISTRY
};
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(combatCode, sandbox);

const AoE2Combat = sandbox.window.AoE2Combat;
const unitModifiers = require('../unitModifiers.js');

console.log('=== TEST 1: Ballistics Registry Match ===');
const shuArbalestUnit = {
  ID: 492,
  id: 492,
  name: 'Arbalester',
  localizedName: 'Arbalesta',
  internal_name: 'ACOAR',
  HP: 40,
  Attack: 6,
  ReloadTime: 2.0,
  Range: 5,
  Attacks: [{ Class: 3, Amount: 6 }],
  Armours: [{ Class: 4, Amount: 0 }, { Class: 3, Amount: 0 }, { Class: 15, Amount: 0 }]
};

const profileWithTech = getBallisticProfile(shuArbalestUnit, 'Shu', { imperialCrown: true });
console.log('Shu Arbalest with imperialCrown profile:', profileWithTech);
if (!profileWithTech || profileWithTech.projectiles !== 3 || profileWithTech.secondaryDamage !== 1) {
  console.error('FAIL: Expected 3 projectiles and 1 secondaryDamage for Shu Arbalest with crown');
  process.exit(1);
} else {
  console.log('PASS: Correctly resolved Shu Arbalest ballistic profile with 3 projectiles and 1 secondaryDamage');
}

const profileWithoutTech = getBallisticProfile(shuArbalestUnit, 'Shu', {});
console.log('Shu Arbalest without tech:', profileWithoutTech);
if (profileWithoutTech !== null) {
  console.error('FAIL: Expected null ballistic profile for Shu Arbalest without unique tech');
  process.exit(1);
} else {
  console.log('PASS: Non-upgraded Shu Arbalest returns null profile (standard 1 projectile)');
}

const genericArbalestProfile = getBallisticProfile(shuArbalestUnit, 'Britons', { imperialCrown: true });
console.log('Britons Arbalest with imperialCrown:', genericArbalestProfile);
if (genericArbalestProfile !== null) {
  console.error('FAIL: Britons Arbalest should not match Shu unique ballistic profile');
  process.exit(1);
} else {
  console.log('PASS: Other civilizations do not get Shu burst profile');
}

console.log('\n=== TEST 2: Unique Tech Relevance in Combat Engine ===');
const relevance1069 = AoE2Combat.checkUniqueTechRelevance(1069, shuArbalestUnit);
console.log('Tech 1069 relevance for Arbalester:', relevance1069);
if (!relevance1069.applies || !relevance1069.summary.includes('3 proyectiles')) {
  console.error('FAIL: Expected relevance for tech 1069 on Arbalesta');
  process.exit(1);
} else {
  console.log('PASS: Tech 1069 is marked relevant with summary:', relevance1069.summary);
}

const knightUnit = {
  ID: 38,
  id: 38,
  name: 'Knight',
  localizedName: 'Caballero',
  internal_name: 'KNGHT',
  Armours: [{ Class: 8, Amount: 0 }]
};
const relevanceKnight = AoE2Combat.checkUniqueTechRelevance(1069, knightUnit);
if (relevanceKnight.applies) {
  console.error('FAIL: Tech 1069 should not apply to Knight');
  process.exit(1);
} else {
  console.log('PASS: Tech 1069 does not apply to Knight');
}

console.log('\n=== TEST 3: initCombatant & Damage Computation in Combat Engine ===');
const targetPaladin = {
  ID: 569,
  id: 569,
  name: 'Paladin',
  localizedName: 'Paladín',
  internal_name: 'PALDN',
  HP: 160,
  Attack: 14,
  ReloadTime: 1.9,
  Armours: [{ Class: 4, Amount: 2 }, { Class: 3, Amount: 3 }, { Class: 8, Amount: 0 }]
};

const combatantShuWithCrown = AoE2Combat.initCombatant(shuArbalestUnit, {
  civ: 'Shu',
  civName: 'Shu',
  selectedAge: 4,
  imperialCrown: true
});

console.log('Combatant hasBoltMagazine:', combatantShuWithCrown.hasBoltMagazine);
console.log('Combatant ballisticProfile:', combatantShuWithCrown.ballisticProfile);

const combatantTarget = AoE2Combat.initCombatant(targetPaladin, {
  civ: 'Generic',
  civName: 'Generic',
  selectedAge: 4
});

const damageWithCrown = AoE2Combat.calculateNetDamage(combatantShuWithCrown, combatantTarget);
console.log('Damage dealt by Shu Arbalest with crown vs Paladin (3 Pierce Armor):', damageWithCrown);
// Main attack: 6 Pierce - 3 Pierce Armor = 3 damage
// 2 Secondary projectiles: 1 Pierce atk vs 3 Armor -> max(0, 1 - 3) = 0 -> floor min 1 dmg each -> 1 * 2 = 2 damage
// Expected total = 3 + 2 = 5 damage
if (damageWithCrown !== 5) {
  console.error(`FAIL: Expected 5 damage (3 primary + 2 secondary), got ${damageWithCrown}`);
  process.exit(1);
} else {
  console.log('PASS: Damage correctly equals 5 (3 main + 2 secondary min-floor)');
}

const combatantShuWithoutCrown = AoE2Combat.initCombatant(shuArbalestUnit, {
  civ: 'Shu',
  civName: 'Shu',
  selectedAge: 4,
  imperialCrown: false
});
const damageWithoutCrown = AoE2Combat.calculateNetDamage(combatantShuWithoutCrown, combatantTarget);
console.log('Damage dealt without crown:', damageWithoutCrown);
if (damageWithoutCrown !== 3) {
  console.error(`FAIL: Expected 3 damage without crown, got ${damageWithoutCrown}`);
  process.exit(1);
} else {
  console.log('PASS: Standard Arbalest without crown deals exactly 3 damage (1 projectile)');
}

console.log('\n=== TEST 4: Duel Simulation Combat Log Output ===');
const simResult = AoE2Combat.simulateDuel(combatantShuWithCrown, combatantTarget, { maxDuration: 10 });
const salvoLog = simResult.log.find(entry => entry.text && entry.text.includes('ráfaga de 3 proyectiles'));
console.log('Sample Salvo Log:', salvoLog ? salvoLog.text : 'NOT FOUND');
if (!salvoLog) {
  console.error('FAIL: Combat log did not log "ráfaga de 3 proyectiles"');
  process.exit(1);
} else {
  console.log('PASS: Combat log correctly logged salvo burst with 3 projectiles!');
}

console.log('\n=== TEST 5: unitModifiers.calculateDynamicUnitStats ===');
const statsWithCrown = unitModifiers.calculateDynamicUnitStats(shuArbalestUnit, 'Shu', 'imperial', [1069]);
console.log('Stats with Tech 1069:', {
  projectiles: statsWithCrown.projectiles,
  secondaryProjectiles: statsWithCrown.secondaryProjectiles,
  isShuArbalest: statsWithCrown.isShuArbalest,
  hasShuImperialUniqueTech: statsWithCrown.hasShuImperialUniqueTech
});

if (statsWithCrown.projectiles !== 3 || !statsWithCrown.secondaryProjectiles || statsWithCrown.secondaryProjectiles.count !== 2) {
  console.error('FAIL: Expected calculateDynamicUnitStats to return 3 projectiles and 2 secondaryProjectiles');
  process.exit(1);
} else {
  console.log('PASS: calculateDynamicUnitStats returns correct projectile burst structure');
}

const statsWithoutCrown = unitModifiers.calculateDynamicUnitStats(shuArbalestUnit, 'Shu', 'imperial', []);
if (statsWithoutCrown.projectiles !== 1 || statsWithoutCrown.secondaryProjectiles !== null) {
  console.error('FAIL: Expected 1 projectile without unique tech');
  process.exit(1);
} else {
  console.log('PASS: calculateDynamicUnitStats without crown defaults to 1 projectile and null secondary');
}

console.log('\nALL TESTS PASSED SUCCESSFULLY! 🚀');
