const fs = require('fs');
const assert = require('assert');
const path = require('path');

const eco = require('../ecoCalculator.js');
const r = require('../ecoRates.js');
const md = require('../civModifiersData.js');
const us = require('../unitService.js');
const a = require('../availability.js');

console.log('--- TEST 1: Leva Tech Definition and Asset ---');
const conscriptionTech = eco.ECO_TECHS.find(t => t.key === 'conscription');
assert(conscriptionTech, 'conscription tech must be in ECO_TECHS');
assert.strictEqual(conscriptionTech.techId, 315, 'Conscription techId must be 315');
assert.strictEqual(conscriptionTech.picIndex, 91, 'Conscription picIndex must be 91');
assert.strictEqual(conscriptionTech.icon, 'img/Tech/91.png', 'Conscription icon must be img/Tech/91.png');
assert(fs.existsSync(path.join(__dirname, '..', 'img/Tech/91.png')), 'img/Tech/91.png must exist on disk');

assert(eco.MILITARY_TECH_DEF, 'MILITARY_TECH_DEF must be exported');
assert.strictEqual(eco.MILITARY_TECH_DEF.id, 315);
assert.strictEqual(eco.MILITARY_TECH_DEF.name, 'Leva (Conscription)');
assert.strictEqual(eco.MILITARY_TECH_DEF.icon, 'img/Tech/91.png');
assert.strictEqual(eco.MILITARY_TECH_DEF.age, 'imperial');
console.log('✓ Leva tech definition and asset verified');

console.log('\n--- TEST 2: Selective Conscription Work Rate ---');
const halberdier = eco.getCanonicalUnit(359);
const xbow = eco.getCanonicalUnit(24);
const paladin = eco.getCanonicalUnit(569);
const treb = eco.getCanonicalUnit(331);
const ram = eco.getCanonicalUnit(1258);
const onager = eco.getCanonicalUnit(550);
const tracTreb = eco.getCanonicalUnit(1800);
const vill = eco.getCanonicalUnit(83);

// Halberdier (Barracks): benefits from Conscription
const halbNoLeva = r.getUnitWorkRate(halberdier, 'generic', 'imperial', []);
const halbWithLeva = r.getUnitWorkRate(halberdier, 'generic', 'imperial', ['conscription']);
assert.strictEqual(halbNoLeva.conscriptionBonus, 0);
assert.strictEqual(halbWithLeva.conscriptionBonus, 0.3333);
assert.strictEqual(halbWithLeva.workRate, 1.3333);

// Crossbowman (Range): benefits from Conscription
const xbowWithLeva = r.getUnitWorkRate(xbow, 'generic', 'imperial', ['conscription']);
assert.strictEqual(xbowWithLeva.conscriptionBonus, 0.3333);

// Paladin (Stable): benefits from Conscription
const paladinWithLeva = r.getUnitWorkRate(paladin, 'generic', 'imperial', ['conscription']);
assert.strictEqual(paladinWithLeva.conscriptionBonus, 0.3333);

// Trebuchet (Castle): benefits from Conscription
const trebWithLeva = r.getUnitWorkRate(treb, 'generic', 'imperial', ['conscription']);
assert.strictEqual(trebWithLeva.conscriptionBonus, 0.3333);

// Siege Workshop units (Ram, Onager, Traction Treb) - MUST BE EXCLUDED (0 bonus)
const ramWithLeva = r.getUnitWorkRate(ram, 'generic', 'imperial', ['conscription']);
assert.strictEqual(ramWithLeva.conscriptionBonus, 0, 'Ram must NOT receive Conscription');
assert.strictEqual(ramWithLeva.workRate, 1.0);

const onagerWithLeva = r.getUnitWorkRate(onager, 'generic', 'imperial', ['conscription']);
assert.strictEqual(onagerWithLeva.conscriptionBonus, 0, 'Onager must NOT receive Conscription');

const tracTrebWithLeva = r.getUnitWorkRate(tracTreb, 'generic', 'imperial', ['conscription']);
assert.strictEqual(tracTrebWithLeva.conscriptionBonus, 0, 'Traction Trebuchet must NOT receive Conscription');

// Town Center Villager - MUST BE EXCLUDED (0 bonus)
const villWithLeva = r.getUnitWorkRate(vill, 'generic', 'imperial', ['conscription']);
assert.strictEqual(villWithLeva.conscriptionBonus, 0, 'Villager must NOT receive Conscription');
console.log('✓ Selective Conscription verified across all military and civil buildings');

console.log('\n--- TEST 3: Regional Civs (Muisca, Incas, Tupi, Sicilians) ---');
// Slinger (185)
const slinger = eco.getCanonicalUnit(185);
assert.strictEqual(slinger.name, 'Soldado con honda (Hondero)');
assert.strictEqual(slinger.category, 'range');
assert.strictEqual(slinger.building, 'Galería de Tiro con Arco');
assert.strictEqual(slinger.cost.Food, 50);
assert.strictEqual(slinger.cost.Wood, 25);
assert.strictEqual(slinger.cost.Gold || 0, 0);
assert.strictEqual(slinger.trainTime, 25);

// Muisca with Huaracas (+50% training speed on slinger)
const muiscaSlingerCastle = r.getUnitWorkRate(slinger, 'muisca', 'castle', []);
assert.strictEqual(muiscaSlingerCastle.civBonus, 0.5);
assert.strictEqual(muiscaSlingerCastle.workRate, 1.5);

// Muisca with Huaracas + Conscription (+50% + 33.33% = 1.8333)
const muiscaSlingerImp = r.getUnitWorkRate(slinger, 'muisca', 'imperial', ['conscription']);
assert.strictEqual(muiscaSlingerImp.civBonus, 0.5);
assert.strictEqual(muiscaSlingerImp.conscriptionBonus, 0.3333);
assert.strictEqual(muiscaSlingerImp.workRate, 1.8333);

// Incas Food Discount on Slinger (50 - 25% = 38 in Castle; 50 - 30% = 35 in Imperial)
const incaSlingerCastle = r.getDiscountedUnitCost(185, 'incas', 'castle');
assert.strictEqual(incaSlingerCastle.cost.food, 38);
assert.strictEqual(incaSlingerCastle.cost.wood, 25);
assert.strictEqual(incaSlingerCastle.cost.gold, 0);
const incaSlingerImp = r.getDiscountedUnitCost(185, 'incas', 'imperial');
assert.strictEqual(incaSlingerImp.cost.food, 35);
assert.strictEqual(incaSlingerImp.cost.wood, 25);
assert.strictEqual(incaSlingerImp.cost.gold, 0);

// Incas Food Discount on Champi (50 - 30% = 35 in Imperial)
const incaChampiImp = r.getDiscountedUnitCost(2554, 'incas', 'imperial');
assert.strictEqual(incaChampiImp.cost.food, 35);

// Sicilian Serjeant in Castle and Donjon
const serjCastle = eco.getCanonicalUnit(1658);
const serjDonjon = eco.getCanonicalUnit(1660);
const serjCastleWithLeva = r.getUnitWorkRate(serjCastle, 'sicilians', 'imperial', ['conscription']);
const serjDonjonWithLeva = r.getUnitWorkRate(serjDonjon, 'sicilians', 'imperial', ['conscription']);
assert.strictEqual(serjCastleWithLeva.conscriptionBonus, 0.3333);
assert.strictEqual(serjDonjonWithLeva.conscriptionBonus, 0.3333);

// Availability checks
assert.strictEqual(a.isUnitAvailableForCiv('Incas', 185), true);
assert.strictEqual(a.isUnitAvailableForCiv('Muisca', 185), true);
assert.strictEqual(a.isUnitAvailableForCiv('Tupi', 185), true);
assert.strictEqual(a.isUnitAvailableForCiv('Franks', 185), false);

assert.strictEqual(a.isUnitAvailableForCiv('Sicilians', 1658), true);
assert.strictEqual(a.isUnitAvailableForCiv('Sicilians', 1660), true);
assert.strictEqual(a.isUnitAvailableForCiv('Franks', 1658), false);

assert.strictEqual(a.isBuildingAvailableForCiv('1665', 'Sicilians'), true);
assert.strictEqual(a.isBuildingAvailableForCiv('79', 'Sicilians'), false);

assert.strictEqual(a.isBuildingAvailableForCiv('2556', 'Incas'), true);
assert.strictEqual(a.isBuildingAvailableForCiv('2556', 'Muisca'), true);
assert.strictEqual(a.isBuildingAvailableForCiv('2556', 'Tupi'), true);
assert.strictEqual(a.isBuildingAvailableForCiv('68', 'Incas'), false);

console.log('✓ Regional civs modifiers, units, and buildings verified');

console.log('\n========================================');
console.log('ALL LEVA & REGIONAL TESTS PASSED (100%)');
console.log('========================================');
