const buildingsModule = require('../buildings.js');
const civModifiers = require('../civModifiers.js');
const buildingUpgrades = require('../buildingUpgrades.js');

const { getBuildingByKey, BUILDING_REGISTRY, BUILDING_AGE_SCALING } = buildingsModule;
const { calculateBuildingStats } = civModifiers;
const { getBuildingTechList } = buildingUpgrades;

console.log('=== TEST 1: Fortified Church Base Attributes in BUILDING_REGISTRY ===');
const fc = getBuildingByKey('fortified_church');
if (!fc) {
  console.error('FAIL: fortified_church not found in BUILDING_REGISTRY');
  process.exit(1);
}

console.log('Fortified Church raw data:', {
  id: fc.id,
  IconID: fc.IconID,
  range: fc.range,
  baseRange: fc.baseRange,
  minRange: fc.minRange,
  los: fc.los,
  baseAttack: fc.baseAttack,
  baseHp: fc.baseHp,
  meleeArmor: fc.meleeArmor,
  pierceArmor: fc.pierceArmor
});

if (fc.baseRange !== 4 || fc.minRange !== 1 || fc.los !== 10) {
  console.error(`FAIL: Expected baseRange: 4, minRange: 1, los: 10, got baseRange: ${fc.baseRange}, minRange: ${fc.minRange}, los: ${fc.los}`);
  process.exit(1);
} else {
  console.log('PASS: Base attributes correctly set in BUILDING_REGISTRY');
}

console.log('\n=== TEST 2: Base Stats Calculation in civModifiers ===');
const baseStats = calculateBuildingStats('fortified_church', 'armenians', 3, {});
console.log('Calculated Base Stats (Castle Age):', {
  range: baseStats.range,
  minRange: baseStats.minRange,
  los: baseStats.los,
  attack: baseStats.attack,
  hp: baseStats.hp,
  meleeArmor: baseStats.meleeArmor,
  pierceArmor: baseStats.pierceArmor
});

if (baseStats.range !== 4 || baseStats.minRange !== 1 || baseStats.los !== 10 || baseStats.attack !== 5) {
  console.error(`FAIL: Expected range: 4, minRange: 1, los: 10, attack: 5. Got range: ${baseStats.range}, minRange: ${baseStats.minRange}, los: ${baseStats.los}, attack: ${baseStats.attack}`);
  process.exit(1);
} else {
  console.log('PASS: Initial calculated stats match canonical specs (Range: 4, MinRange: 1, LoS: 10, Attack: 5)');
}

console.log('\n=== TEST 3: Applicable Technologies Linking ===');
const applicableTechs = getBuildingTechList('fortified_church');
console.log('Applicable Techs for Fortified Church:', applicableTechs);
const requiredTechs = [199, 200, 201, 47, 93]; // Fletching, Bodkin, Bracer, Chemistry, Ballistics
const missingTechs = requiredTechs.filter(t => !applicableTechs.includes(t));
if (missingTechs.length > 0) {
  console.error('FAIL: Missing required projectile techs in applicable list:', missingTechs);
  process.exit(1);
} else {
  console.log('PASS: All projectile technologies (199, 200, 201, 47, 93) are applicable to Fortified Church');
}

console.log('\n=== TEST 4: Step-by-Step Attack Upgrades Scaling & Range Anchoring ===');
// Step 4.1: Fletching (+1 Atk, Range stays 4)
const statsFletching = calculateBuildingStats('fortified_church', 'armenians', 3, { fletching: true });
console.log(`With Fletching -> Attack: ${statsFletching.attack} (Expected 6), Range: ${statsFletching.range} (Expected 4)`);
if (statsFletching.attack !== 6 || statsFletching.range !== 4) {
  console.error('FAIL: Fletching should give +1 attack while range remains 4');
  process.exit(1);
}

// Step 4.2: Bodkin Arrow (+1 Atk, Range stays 4)
const statsBodkin = calculateBuildingStats('fortified_church', 'armenians', 3, { fletching: true, bodkinArrow: true });
console.log(`With Bodkin -> Attack: ${statsBodkin.attack} (Expected 7), Range: ${statsBodkin.range} (Expected 4)`);
if (statsBodkin.attack !== 7 || statsBodkin.range !== 4) {
  console.error('FAIL: Bodkin should give +1 attack while range remains 4');
  process.exit(1);
}

// Step 4.3: Bracer (+1 Atk, Range stays 4)
const statsBracer = calculateBuildingStats('fortified_church', 'armenians', 4, { fletching: true, bodkinArrow: true, bracer: true });
console.log(`With Bracer -> Attack: ${statsBracer.attack} (Expected 8), Range: ${statsBracer.range} (Expected 4)`);
if (statsBracer.attack !== 8 || statsBracer.range !== 4) {
  console.error('FAIL: Bracer should give +1 attack while range remains 4');
  process.exit(1);
}

// Step 4.4: Chemistry (+1 Atk, Range stays 4)
const statsChemistry = calculateBuildingStats('fortified_church', 'armenians', 4, { fletching: true, bodkinArrow: true, bracer: true, chemistry: true });
console.log(`With Chemistry -> Attack: ${statsChemistry.attack} (Expected 9), Range: ${statsChemistry.range} (Expected 4)`);
if (statsChemistry.attack !== 9 || statsChemistry.range !== 4) {
  console.error('FAIL: Chemistry should give +1 attack for a total max of 9 while range remains 4');
  process.exit(1);
} else {
  console.log('PASS: Attack scaled correctly from 5 to 9 without increasing range from 4!');
}

// Step 4.5: Murder Holes (Eliminates minRange)
const statsMurder = calculateBuildingStats('fortified_church', 'armenians', 3, { murderHoles: true });
console.log(`With Murder Holes -> MinRange: ${statsMurder.minRange} (Expected 0), Range: ${statsMurder.range} (Expected 4)`);
if (statsMurder.minRange !== 0 || statsMurder.range !== 4) {
  console.error('FAIL: Murder Holes should set minRange to 0 while keeping range at 4');
  process.exit(1);
} else {
  console.log('PASS: Murder Holes correctly eliminates minimum range');
}

console.log('\n=== TEST 5: Preservation of Armor Matrix ===');
console.log('Armours matrix for Fortified Church:', fc.armours);
const statsMasonry = calculateBuildingStats('fortified_church', 'armenians', 3, { masonry: true });
console.log(`With Masonry -> HP: ${statsMasonry.hp} (Base 2400 * 1.1 = 2640), Melee: ${statsMasonry.meleeArmor} (Base 4 + 1 = 5), Pierce: ${statsMasonry.pierceArmor} (Base 10 + 1 = 11)`);
if (statsMasonry.hp !== 2640 || statsMasonry.meleeArmor !== 5 || statsMasonry.pierceArmor !== 11) {
  console.error('FAIL: Masonry calculation altered or inconsistent with base armors');
  process.exit(1);
} else {
  console.log('PASS: Armor matrix and reactive upgrades preserved completely intact');
}

console.log('\n=== TEST 6: Normal Defensive Structure Range Comparison ===');
// For a Watch Tower, Fletching DOES increase range
const wtBase = calculateBuildingStats('watch_tower', 'generic', 2, {});
const wtFletching = calculateBuildingStats('watch_tower', 'generic', 2, { fletching: true });
console.log(`Watch Tower with Fletching -> Attack: ${wtFletching.attack} (Base ${wtBase.attack}), Range: ${wtFletching.range} (Base ${wtBase.range})`);
if (wtFletching.range !== wtBase.range + 1) {
  console.error('FAIL: Watch Tower range should increase with Fletching');
  process.exit(1);
} else {
  console.log('PASS: Regular defensive structures still gain range normally, isolating the rule to Fortified Church');
}

console.log('\nALL 6 VERIFICATION SUITES PASSED WITH 100% SUCCESS! 🚀');
