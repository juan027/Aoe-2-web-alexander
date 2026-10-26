const assert = require('assert');
const fs = require('fs');
const path = require('path');

// 1. Data units check
const dataUnits = require('../data/units.js');
const rawSlinger = dataUnits.UNITS_DATA[185] || dataUnits.MISSING_ARCHERY_UNITS[185];
console.log('--- TEST 1: data/units.js ---');
assert.ok(rawSlinger, 'Unit 185 exists in data/units.js');
assert.strictEqual(rawSlinger.id, 185);
assert.strictEqual(rawSlinger.name, 'Soldado con honda (Hondero)');
assert.strictEqual(rawSlinger.cost.food, 50);
assert.strictEqual(rawSlinger.cost.wood, 25);
assert.strictEqual(rawSlinger.cost.gold, 0);
assert.strictEqual(rawSlinger.cost.stone, 0);
assert.strictEqual(rawSlinger.building, 'archery_range');
assert.strictEqual(rawSlinger.age, 'castle');
assert.strictEqual(rawSlinger.trainTime, 25);
assert.strictEqual(rawSlinger.icon, '18.png');
console.log('✓ data/units.js: 50 Food, 25 Wood, 0 Gold, 0 Stone, icon 18.png');

// 2. units.js check
const unitsModule = require('../units.js');
const unitsSlinger = unitsModule.UNITS_DATA[185];
console.log('\n--- TEST 2: units.js UNITS_DATA ---');
assert.ok(unitsSlinger, 'Unit 185 exists in units.js');
assert.strictEqual(unitsSlinger.cost.food, 50);
assert.strictEqual(unitsSlinger.cost.wood, 25);
assert.strictEqual(unitsSlinger.cost.gold, 0);
assert.strictEqual(unitsSlinger.cost.stone, 0);
assert.strictEqual(unitsSlinger.Cost.Food, 50);
assert.strictEqual(unitsSlinger.Cost.Wood, 25);
assert.strictEqual(unitsSlinger.Cost.Gold, 0);
assert.strictEqual(unitsSlinger.Cost.Stone, 0);
assert.strictEqual(unitsSlinger.icon, '18.png');
console.log('✓ units.js UNITS_DATA: 50 Food, 25 Wood, 0 Gold, 0 Stone');

// 3. unitService check
const unitService = require('../unitService.js');
console.log('\n--- TEST 3: unitService.getBaseUnitData ---');
const baseData = unitService.getBaseUnitData(185);
assert.ok(baseData, 'Unit 185 base data retrieved from unitService');
assert.strictEqual(baseData.cost.food, 50);
assert.strictEqual(baseData.cost.wood, 25);
assert.strictEqual(baseData.cost.gold, 0);
assert.strictEqual(baseData.cost.stone, 0);
assert.strictEqual(baseData.Cost.Food, 50);
assert.strictEqual(baseData.Cost.Wood, 25);
assert.strictEqual(baseData.Cost.Gold, 0);
assert.strictEqual(baseData.Cost.Stone, 0);
console.log('✓ unitService base data: 50 Food, 25 Wood, 0 Gold, 0 Stone');

// 4. ecoCalculator canonical unit and icon props
const eco = require('../ecoCalculator.js');
console.log('\n--- TEST 4: ecoCalculator canonical unit & icon props ---');
const canonicalSlinger = eco.getCanonicalUnit(185);
assert.ok(canonicalSlinger, 'Canonical slinger found');
assert.strictEqual(canonicalSlinger.name, 'Soldado con honda (Hondero)');
assert.strictEqual(canonicalSlinger.cost.Food, 50);
assert.strictEqual(canonicalSlinger.cost.Wood, 25);
assert.strictEqual(canonicalSlinger.cost.Gold || 0, 0);
assert.strictEqual(canonicalSlinger.cost.Stone || 0, 0);
assert.strictEqual(canonicalSlinger.building, 'Galería de Tiro con Arco');
assert.strictEqual(canonicalSlinger.icon, '18.png');

const iconProps = eco.getUnitIconProps(185);
assert.strictEqual(iconProps.src, 'img/units/185.png');
assert.strictEqual(iconProps.fallback, 'img/Unit/18.png');
console.log('✓ ecoCalculator canonical unit & icon props verified');

// 5. Assets check
console.log('\n--- TEST 5: Sprite Assets ---');
assert.ok(fs.existsSync(path.join(__dirname, '../img/Unit/18.png')), 'img/Unit/18.png exists');
assert.ok(fs.existsSync(path.join(__dirname, '../img/units/185.png')), 'img/units/185.png exists');
console.log('✓ Assets verified: img/Unit/18.png and img/units/185.png');

// 6. Discount & Gatherer demand calculations
const r = require('../ecoRates.js');
console.log('\n--- TEST 6: Discounted costs and villager allocation ---');
const incasCastle = r.getDiscountedUnitCost(185, 'incas', 'castle');
assert.strictEqual(incasCastle.cost.food, 38, 'Incas Castle: 50 * 0.75 = 37.5 -> 38 Food');
assert.strictEqual(incasCastle.cost.wood, 25, 'Incas Castle: 25 Wood');
assert.strictEqual(incasCastle.cost.gold, 0, 'Incas Castle: 0 Gold (no gold miner required)');

const incasImp = r.getDiscountedUnitCost(185, 'incas', 'imperial');
assert.strictEqual(incasImp.cost.food, 35, 'Incas Imperial: 50 * 0.70 = 35 Food');
assert.strictEqual(incasImp.cost.wood, 25, 'Incas Imperial: 25 Wood');
assert.strictEqual(incasImp.cost.gold, 0, 'Incas Imperial: 0 Gold');

const muiscaCastle = r.getDiscountedUnitCost(185, 'muisca', 'castle');
assert.strictEqual(muiscaCastle.cost.food, 50, 'Muisca: 50 Food');
assert.strictEqual(muiscaCastle.cost.wood, 25, 'Muisca: 25 Wood');
assert.strictEqual(muiscaCastle.cost.gold, 0, 'Muisca: 0 Gold');

// Check production requirements (1 building, train time 25s)
// Base: 50 food, 25 wood, 0 gold
const prodInca = r.calculateContinuousProduction({
  unit: canonicalSlinger,
  buildingsCount: 1,
  civId: 'incas',
  age: 'castle'
});
assert.strictEqual(prodInca.demandPerMin.gold, 0, 'Zero gold demand for Incas');
assert.strictEqual(prodInca.villagers.gold, 0, 'Zero gold villagers required for Incas');
assert.strictEqual(prodInca.effectiveCost.food, 38, 'Discounted 38 food for Incas Castle');
assert.strictEqual(prodInca.effectiveCost.wood, 25, '25 wood for Incas');
assert.strictEqual(prodInca.effectiveCost.gold, 0, '0 gold for Incas');

const prodMuisca = r.calculateContinuousProduction({
  unit: canonicalSlinger,
  buildingsCount: 1,
  civId: 'muisca',
  age: 'castle'
});
assert.strictEqual(prodMuisca.demandPerMin.gold, 0, 'Zero gold demand for Muisca');
assert.strictEqual(prodMuisca.villagers.gold, 0, 'Zero gold villagers required for Muisca');
assert.strictEqual(prodMuisca.effectiveCost.food, 50, '50 food for Muisca');
assert.strictEqual(prodMuisca.effectiveCost.wood, 25, '25 wood for Muisca');
assert.strictEqual(prodMuisca.effectiveCost.gold, 0, '0 gold for Muisca');
console.log('✓ Continuous production requirement calculations verified (0 gold villagers needed, exact food/wood drain)');

console.log('\n=============================================');
console.log('ALL SLINGER COST & MECHANICS TESTS PASSED (100%)');
console.log('=============================================');
