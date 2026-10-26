const assert = require('assert');
const r = require('../ecoRates.js');
const eco = require('../ecoCalculator.js');
const avail = require('../availability.js');
const us = require('../unitService.js');
const dataUnits = require('../data/units.js');
const unitsModule = require('../units.js');

console.log('--- TEST 1: Goth Infantry IDs & Exported Constants ---');
assert.ok(r.GOTH_INFANTRY_IDS instanceof Set, 'GOTH_INFANTRY_IDS is a Set');
assert.ok(r.GOTH_INFANTRY_IDS.has(41), 'Has Huskarl (41)');
assert.ok(r.GOTH_INFANTRY_IDS.has(555), 'Has Elite Huskarl (555)');
assert.ok(r.GOTH_INFANTRY_IDS.has(759), 'Has Barracks Huskarl (759)');
assert.ok(r.GOTH_INFANTRY_IDS.has(761), 'Has Elite Barracks Huskarl (761)');
assert.ok(r.GOTH_INFANTRY_IDS.has(882), 'Has Condottiero (882)');
assert.ok(r.GOTH_INFANTRY_IDS.has(567), 'Has Champion (567)');
assert.ok(r.GOTH_INFANTRY_IDS.has(473), 'Has Two-handed swordsman (473)');
assert.ok(r.GOTH_INFANTRY_IDS.has(359), 'Has Halberdier (359)');
console.log('✓ GOTH_INFANTRY_IDS verified');

console.log('\n--- TEST 2: Goth Huskarl Discounts in Castle & Imperial Ages ---');
// Huskarl base: 75 Food, 35 Gold
// Castle (-25%): 75 * 0.75 = 56.25 -> 56 Food, 35 * 0.75 = 26.25 -> 26 Gold
const hCastle = r.getDiscountedUnitCost(41, 'goths', 'castle');
assert.strictEqual(hCastle.isDiscounted, true);
assert.strictEqual(hCastle.cost.food, 56);
assert.strictEqual(hCastle.cost.gold, 26);
assert.strictEqual(hCastle.food, 56);
assert.strictEqual(hCastle.gold, 26);

// Huskarl Imperial (-35%): 75 * 0.65 = 48.75 -> 49 Food, 35 * 0.65 = 22.75 -> 23 Gold
const hImp = r.getDiscountedUnitCost(41, 'goths', 'imperial');
assert.strictEqual(hImp.isDiscounted, true);
assert.strictEqual(hImp.cost.food, 49);
assert.strictEqual(hImp.cost.gold, 23);

// Elite Huskarl (555) in Imperial
const eliteHuskarlImp = r.getDiscountedUnitCost(555, 'goths', 'imperial');
assert.strictEqual(eliteHuskarlImp.isDiscounted, true);
assert.strictEqual(eliteHuskarlImp.cost.food, 49);
assert.strictEqual(eliteHuskarlImp.cost.gold, 23);

// Barracks Huskarl via Anarchy (759, 761)
const bHuskarlCastle = r.getDiscountedUnitCost(759, 'goths', 'castle');
assert.strictEqual(bHuskarlCastle.isDiscounted, true);
assert.strictEqual(bHuskarlCastle.cost.food, 56);
assert.strictEqual(bHuskarlCastle.cost.gold, 26);

const bHuskarlImp = r.getDiscountedUnitCost(761, 'goths', 'imperial');
assert.strictEqual(bHuskarlImp.isDiscounted, true);
assert.strictEqual(bHuskarlImp.cost.food, 49);
assert.strictEqual(bHuskarlImp.cost.gold, 23);

// Condottiero (882) with Italian ally in Imperial: 50 Food -> 33, 35 Gold -> 23
const condoGoth = r.getDiscountedUnitCost(882, 'goths', 'imperial');
assert.strictEqual(condoGoth.isDiscounted, true);
assert.strictEqual(condoGoth.cost.food, 33);
assert.strictEqual(condoGoth.cost.gold, 23);
console.log('✓ All Goth infantry discounts verified (Castle -25%, Imperial -35%)');

console.log('\n--- TEST 3: Polymorphic getDiscountedUnitCost Calls ---');
const polyRes = r.getDiscountedUnitCost(41, { food: 75, gold: 35 }, 'goths', 'castle');
assert.strictEqual(polyRes.isDiscounted, true);
assert.strictEqual(polyRes.cost.food, 56);
assert.strictEqual(polyRes.cost.gold, 26);
assert.strictEqual(polyRes.food, 56);
assert.strictEqual(polyRes.gold, 26);
console.log('✓ Polymorphic signature verified');

console.log('\n--- TEST 4: Team Bonus Units Availability ---');
const testCivs = ['franks', 'goths', 'mayans', 'britons', 'italians', 'berbers', 'vietnamese'];
testCivs.forEach(civ => {
  assert.strictEqual(avail.isUnitAvailableForCiv(civ, 882), true, `${civ} must have Condottiero (882)`);
  assert.strictEqual(avail.isUnitAvailableForCiv(civ, 1010), true, `${civ} must have Genitour (1010)`);
  assert.strictEqual(avail.isUnitAvailableForCiv(civ, 1012), true, `${civ} must have Elite Genitour (1012)`);
  assert.strictEqual(avail.isUnitAvailableForCiv(civ, 1155), true, `${civ} must have Imperial Skirmisher (1155)`);
});
console.log('✓ Team bonus units (882, 1010, 1012, 1155) available across all civilizations');

console.log('\n--- TEST 5: ecoCalculator getAvailableUnitsForCiv includes Team Units ---');
const gothUnits = eco.getAvailableUnitsForCiv('goths');
assert.ok(gothUnits.some(u => u.id === 882), 'Goths have Condottiero (882)');
assert.ok(gothUnits.some(u => u.id === 1010), 'Goths have Genitour (1010)');
assert.ok(gothUnits.some(u => u.id === 1012), 'Goths have Elite Genitour (1012)');
assert.ok(gothUnits.some(u => u.id === 1155), 'Goths have Imperial Skirmisher (1155)');
assert.ok(gothUnits.some(u => u.id === 41), 'Goths have Castle Huskarl (41)');
assert.ok(gothUnits.some(u => u.id === 555), 'Goths have Castle Elite Huskarl (555)');
assert.ok(gothUnits.some(u => u.id === 759), 'Goths have Barracks Huskarl (759)');
assert.ok(gothUnits.some(u => u.id === 761), 'Goths have Barracks Elite Huskarl (761)');

// Check Condottiero properties
const condoUnit = gothUnits.find(u => u.id === 882);
assert.strictEqual(condoUnit.building, 'Cuartel');
assert.strictEqual(condoUnit.category, 'barracks');
assert.strictEqual(condoUnit.unitClass, 'infantry');

// Check Castle Huskarl has infantry unitClass
const castleHuskarl = gothUnits.find(u => u.id === 41);
assert.strictEqual(castleHuskarl.building, 'Castillo');
assert.strictEqual(castleHuskarl.unitClass, 'infantry');
assert.strictEqual(castleHuskarl.cost.Food, 75);
assert.strictEqual(castleHuskarl.cost.Gold, 35);
console.log('✓ ecoCalculator available units cleanly resolved');

console.log('\n--- TEST 6: Continuous Production Calculation for Huskarl ---');
const prodCastle = r.calculateContinuousProduction({
  unit: castleHuskarl,
  buildingsCount: 1,
  civId: 'goths',
  age: 'castle'
});
assert.strictEqual(prodCastle.isDiscounted, true, 'Castle Huskarl is marked discounted');
assert.strictEqual(prodCastle.effectiveCost.food, 56, 'Effective food is 56');
assert.strictEqual(prodCastle.effectiveCost.gold, 26, 'Effective gold is 26');
assert.strictEqual(prodCastle.baseCost.food, 75, 'Base food is 75');
assert.strictEqual(prodCastle.baseCost.gold, 35, 'Base gold is 35');
assert.strictEqual(prodCastle.demandPerMin.food, 258.5);
assert.strictEqual(prodCastle.demandPerMin.gold, 120);

console.log('\n--- TEST 7: Icon Props Verification ---');
assert.strictEqual(eco.getUnitIconProps(882).src, 'img/units/882.png');
assert.strictEqual(eco.getUnitIconProps(882).fallback, 'img/Unit/882.png');
assert.strictEqual(eco.getUnitIconProps(1010).src, 'img/units/1010.png');
assert.strictEqual(eco.getUnitIconProps(1010).fallback, 'img/Unit/1010.png');
assert.strictEqual(eco.getUnitIconProps(1012).src, 'img/units/1012.png');
assert.strictEqual(eco.getUnitIconProps(1012).fallback, 'img/Unit/1012.png');
assert.strictEqual(eco.getUnitIconProps(1155).src, 'img/units/1155.png');
assert.strictEqual(eco.getUnitIconProps(1155).fallback, 'img/Unit/1155.png');
console.log('✓ Icon props verified for all team bonus units');

console.log('\n======================================================');
console.log('ALL GOTH DISCOUNT & TEAM BONUS TESTS PASSED (100% OK)');
console.log('======================================================');
