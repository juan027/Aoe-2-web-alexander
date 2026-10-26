const assert = require('assert');
const fs = require('fs');
const path = require('path');

const availability = require('../availability.js');
const ecoCalculator = require('../ecoCalculator.js');
const unitsModule = require('../units.js');
const dataUnitsModule = require('../data/units.js');
const unitService = require('../unitService.js');

console.log('--- TEST 1: SOUTH_ASIA_AND_3K_SIEGE export in units.js and data/units.js ---');
assert(unitsModule.SOUTH_ASIA_AND_3K_SIEGE, 'SOUTH_ASIA_AND_3K_SIEGE must be exported in units.js');
assert(dataUnitsModule.SOUTH_ASIA_AND_3K_SIEGE, 'SOUTH_ASIA_AND_3K_SIEGE must be exported in data/units.js');

[1744, 1746, 1800].forEach(id => {
  const u = unitsModule.SOUTH_ASIA_AND_3K_SIEGE[id];
  assert(u, `Unit ${id} must exist in SOUTH_ASIA_AND_3K_SIEGE`);
  assert.strictEqual(u.building, 'siege_workshop', `Unit ${id} building must be siege_workshop`);
});
console.log('✓ SOUTH_ASIA_AND_3K_SIEGE is defined and valid in both modules');

console.log('\n--- TEST 2: Availability rules for South Asian civilizations ---');
const southAsianCivs = ['Bengalis', 'bengalíes', 'Hindustanis', 'hindustaníes', 'Dravidians', 'dravídicos', 'Gurjaras', 'gurjara'];
southAsianCivs.forEach(civ => {
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1744), true, `${civ} must have access to Armored Elephant (1744)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1746), true, `${civ} must have access to Siege Elephant (1746)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1258), false, `${civ} must NOT have access to Battering Ram (1258)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 422), false, `${civ} must NOT have access to Capped Ram (422)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 548), false, `${civ} must NOT have access to Siege Ram (548)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 331), true, `${civ} must have access to Castle Trebuchet (331)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1800), false, `${civ} must NOT have access to Traction Trebuchet (1800)`);
});
console.log('✓ South Asian civs correctly receive 1744/1746 and block 1258/422/548/1800');

console.log('\n--- TEST 3: Availability rules for Three Kingdoms civilizations (Wu, Shu, Wei) ---');
const threeKingdomsCivs = ['Wei', 'wei', 'Shu', 'shu', 'Wu', 'wu'];
threeKingdomsCivs.forEach(civ => {
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1800), true, `${civ} must have access to Traction Trebuchet (1800)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1942), true, `${civ} must have access to Traction Trebuchet alias (1942)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 331), false, `${civ} must NOT have access to Counterweight Trebuchet (331)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 42), false, `${civ} must NOT have access to Trebuchet (42)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1744), false, `${civ} must NOT have access to Armored Elephant (1744)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1746), false, `${civ} must NOT have access to Siege Elephant (1746)`);
});
console.log('✓ Three Kingdoms civs correctly receive 1800 in Workshop and block 331 in Castle');

console.log('\n--- TEST 4: Availability rules for Standard civilizations & Generic ---');
const standardCivs = ['Franks', 'Britons', 'Spanish', 'Teutons'];
standardCivs.forEach(civ => {
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 331), true, `${civ} must have access to Castle Trebuchet (331)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1800), false, `${civ} must NOT have access to Traction Trebuchet (1800)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1744), false, `${civ} must NOT have access to Armored Elephant (1744)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1746), false, `${civ} must NOT have access to Siege Elephant (1746)`);
  assert.strictEqual(availability.isUnitAvailableForCiv(civ, 1258), true, `${civ} must have access to Battering Ram (1258)`);
});

const genericUnits = ecoCalculator.getAvailableUnitsForCiv('generic').map(u => u.id);
assert(!genericUnits.includes(1744), 'Generic must NOT include Armored Elephant');
assert(!genericUnits.includes(1746), 'Generic must NOT include Siege Elephant');
assert(!genericUnits.includes(1800), 'Generic must NOT include Traction Trebuchet');
assert(genericUnits.includes(331), 'Generic must include Castle Trebuchet (331)');
assert(genericUnits.includes(1258), 'Generic must include Battering Ram (1258)');
console.log('✓ Standard and Generic civs resolve cleanly');

console.log('\n--- TEST 5: ecoCalculator unit lists per civilization ---');
// Bengalis
const bengalisUnits = ecoCalculator.getAvailableUnitsForCiv('Bengalis');
const bengaliIds = bengalisUnits.map(u => u.id);
assert(bengaliIds.includes(1744), 'Bengalis must include Armored Elephant (1744)');
assert(bengaliIds.includes(1746), 'Bengalis must include Siege Elephant (1746)');
assert(!bengaliIds.includes(1258), 'Bengalis must NOT include Ram (1258)');
assert(!bengaliIds.includes(422), 'Bengalis must NOT include Capped Ram (422)');
assert(!bengaliIds.includes(548), 'Bengalis must NOT include Siege Ram (548)');
assert(bengaliIds.includes(331), 'Bengalis must include Castle Trebuchet (331)');
assert(!bengaliIds.includes(1800), 'Bengalis must NOT include Traction Trebuchet (1800)');

const armEle = bengalisUnits.find(u => u.id === 1744);
assert.strictEqual(armEle.building, 'Taller de Asedio');
assert.strictEqual(armEle.cost.Food, 130);
assert.strictEqual(armEle.cost.Gold, 95);
assert.strictEqual(armEle.trainTime, 36);

const siegeEle = bengalisUnits.find(u => u.id === 1746);
assert.strictEqual(siegeEle.building, 'Taller de Asedio');
assert.strictEqual(siegeEle.cost.Food, 130);
assert.strictEqual(siegeEle.cost.Gold, 95);
assert.strictEqual(siegeEle.trainTime, 36);

// Wei
const weiUnits = ecoCalculator.getAvailableUnitsForCiv('Wei');
const weiIds = weiUnits.map(u => u.id);
assert(weiIds.includes(1800), 'Wei must include Traction Trebuchet (1800)');
assert(!weiIds.includes(331), 'Wei must NOT include Castle Trebuchet (331)');
const tracTreb = weiUnits.find(u => u.id === 1800);
assert.strictEqual(tracTreb.building, 'Taller de Asedio');
assert.strictEqual(tracTreb.cost.Wood, 170);
assert.strictEqual(tracTreb.cost.Gold, 100);
assert.strictEqual(tracTreb.trainTime, 35);

console.log('✓ ecoCalculator.getAvailableUnitsForCiv produces exact building and cost data');

console.log('\n--- TEST 6: Icon sprites and fallback integrity ---');
const trebIcon = ecoCalculator.getUnitIconProps(331);
assert.strictEqual(trebIcon.src, 'img/units/331.png');
assert.strictEqual(trebIcon.fallback, 'img/Unit/29.png');

const tracIcon = ecoCalculator.getUnitIconProps(1800);
assert.strictEqual(tracIcon.src, 'img/units/428.png');
assert.strictEqual(tracIcon.fallback, 'img/Unit/428.png');

const ele1744Icon = ecoCalculator.getUnitIconProps(1744);
assert.strictEqual(ele1744Icon.src, 'img/units/1744.png');
assert.strictEqual(ele1744Icon.fallback, 'img/Unit/1744.png');

const ele1746Icon = ecoCalculator.getUnitIconProps(1746);
assert.strictEqual(ele1746Icon.src, 'img/units/1746.png');
assert.strictEqual(ele1746Icon.fallback, 'img/Unit/1746.png');

// Verify files actually exist on disk
[
  'img/units/331.png',
  'img/Unit/29.png',
  'img/units/428.png',
  'img/Unit/428.png',
  'img/units/1744.png',
  'img/Unit/1744.png',
  'img/units/1746.png',
  'img/Unit/1746.png'
].forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  assert(fs.existsSync(fullPath), `Asset file ${relPath} must exist on disk`);
});
console.log('✓ All unit icons and fallback image assets exist on disk');

console.log('\n========================================');
console.log('ALL SIEGE SUBSTITUTION TESTS PASSED!');
console.log('========================================');
