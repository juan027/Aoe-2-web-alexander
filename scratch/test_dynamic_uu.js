const assert = require('assert');
const civs = require('../civilizations.js');
const units = require('../units.js');
const missingUnits = require('../data/units.js');
const us = require('../unitService.js');
const eco = require('../ecoCalculator.js');

console.log('=== TEST 1: MISSING UNITS REGISTRATION IN UNITS_DATA ===');
const missingBarracks = [567, 1910, 1911, 1901];
const missingArchery = [1902, 1920];
const missingSiege = [422, 548, 550, 1800];

missingBarracks.forEach(id => {
  assert(units.UNITS_DATA[id], `Unit ${id} must exist in units.UNITS_DATA`);
  assert.strictEqual(units.UNITS_DATA[id].building, 'barracks');
  console.log(`[PASS] Barracks unit ${id}: ${units.UNITS_DATA[id].name} (trainTime: ${units.UNITS_DATA[id].trainTime}s)`);
});

missingArchery.forEach(id => {
  assert(units.UNITS_DATA[id], `Unit ${id} must exist in units.UNITS_DATA`);
  assert.strictEqual(units.UNITS_DATA[id].building, 'archery_range');
  console.log(`[PASS] Archery unit ${id}: ${units.UNITS_DATA[id].name} (trainTime: ${units.UNITS_DATA[id].trainTime}s)`);
});

missingSiege.forEach(id => {
  assert(units.UNITS_DATA[id], `Unit ${id} must exist in units.UNITS_DATA`);
  assert.strictEqual(units.UNITS_DATA[id].building, 'siege_workshop');
  console.log(`[PASS] Siege unit ${id}: ${units.UNITS_DATA[id].name} (trainTime: ${units.UNITS_DATA[id].trainTime}s)`);
});

console.log('\n=== TEST 2: MAPUCHE DYNAMIC RESOLUTION IN ECO CALCULATOR ===');
eco.setCiv('mapuche');
const mapucheUnits = eco.getAvailableUnitsForCiv('mapuche');
const bolas1901 = mapucheUnits.find(u => u.id === 1901);
const bolas1902 = mapucheUnits.find(u => u.id === 1902);
const kona = mapucheUnits.find(u => u.id === 2566);

assert(bolas1901, 'Jinete con boleadoras (1901) must be available for Mapuche');
assert.strictEqual(bolas1901.category, 'range', 'Bolas rider must be in category range');
assert.strictEqual(bolas1901.building, 'Galería de Tiro con Arco', 'Bolas rider building must be Galería de Tiro con Arco');

assert(bolas1902, 'Elite Bolas rider (1902) must be available for Mapuche');
assert.strictEqual(bolas1902.category, 'range', 'Elite Bolas rider must be in category range');

assert(kona, 'Kona (2566) must be available for Mapuche');
assert.strictEqual(kona.category, 'castle', 'Kona must be in category castle');

// Check modal picker HTML under Range vs Castle
eco.getState().pickerFilter = 'range';
const rangeModalHtml = eco.renderUnitPickerModal();
assert(rangeModalHtml.includes('Jinete con boleadoras'), 'Range modal must show Jinete con boleadoras');
assert(!rangeModalHtml.includes('data-picker-id="2566"'), 'Range modal must NOT show Kona');

eco.getState().pickerFilter = 'castle';
const castleModalHtml = eco.renderUnitPickerModal();
assert(!castleModalHtml.includes('data-picker-id="1901"'), 'Castle modal must NOT show Jinete con boleadoras (1901)');
assert(!castleModalHtml.includes('data-picker-id="1902"'), 'Castle modal must NOT show Elite Jinete con boleadoras (1902)');
assert(castleModalHtml.includes('data-picker-id="2566"'), 'Castle modal must show Kona (2566)');
assert(castleModalHtml.includes('data-picker-id="331"'), 'Castle modal must show Lanzapiedras (331)');
console.log('[PASS] Mapuche Bolas Rider correctly assigned to Galería de Tiro con Arco, NOT Castillo.');

console.log('\n=== TEST 3: JURCHENS GRENADIER RESOLUTION ===');
eco.setCiv('jurchens');
const jurchenUnits = eco.getAvailableUnitsForCiv('jurchens');
const grenadier = jurchenUnits.find(u => u.id === 1920);
assert(grenadier, 'Grenadier (1920) must be available for Jurchens');
assert.strictEqual(grenadier.category, 'range', 'Grenadier must be in category range');
assert.strictEqual(grenadier.building, 'Galería de Tiro con Arco');
console.log('[PASS] Jurchen Grenadier correctly assigned to Galería de Tiro con Arco.');

console.log('\n=== TEST 4: GENERIC / REGIONAL / CHAMPA RESOLUTION ===');
eco.setCiv('generic');
const genericUnits = eco.getAvailableUnitsForCiv('generic');
const weiUnits = eco.getAvailableUnitsForCiv('wei');
const champa = genericUnits.find(u => u.id === 1910);
const eliteChampa = genericUnits.find(u => u.id === 1911);
const twoHanded = genericUnits.find(u => u.id === 567);
const tractionTreb = weiUnits.find(u => u.id === 1800);
const cappedRam = genericUnits.find(u => u.id === 422);

assert(champa, 'Guerrero Champa (1910) must be available');
assert.strictEqual(champa.category, 'barracks', 'Champa must be in barracks');
assert(eliteChampa, 'Elite Guerrero Champa (1911) must be available');
assert.strictEqual(eliteChampa.category, 'barracks', 'Elite Champa must be in barracks');

assert(twoHanded, 'Two-handed swordsman (567) must be in barracks');
assert.strictEqual(twoHanded.category, 'barracks');

assert(tractionTreb, 'Traction trebuchet (1800) must be in siege');
assert.strictEqual(tractionTreb.category, 'siege');

assert(cappedRam, 'Capped ram (422) must be in siege');
assert.strictEqual(cappedRam.category, 'siege');
console.log('[PASS] Champa, Two-handed swordsman, Traction Trebuchet, and Siege Rams verified.');

console.log('\n=== TEST 5: BRITONS UU RESOLUTION ===');
eco.setCiv('britons');
const britonUnits = eco.getAvailableUnitsForCiv('britons');
const longbow = britonUnits.find(u => u.id === 8);
assert(longbow, 'Britons must have Longbowman');
assert.strictEqual(longbow.category, 'castle');
assert(!britonUnits.some(u => u.id === 1901), 'Britons must NOT have Bolas Rider');
assert(!britonUnits.some(u => u.id === 1910), 'Britons must NOT have Champa Warrior');
console.log('[PASS] Britons UU dynamically loaded; other civ UUs excluded.');

console.log('\n>>> ALL 5 TESTS PASSED SUCCESSFULLY! <<<');
