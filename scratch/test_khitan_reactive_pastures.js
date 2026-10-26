const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- TEST: REACTIVE PASTURES (KHITANS) ---');

// 1. data/techs.js
const dataTechs = require('../data/techs.js');
assert(dataTechs.PASTURE_TECHS_DATA, 'PASTURE_TECHS_DATA should exist in data/techs.js');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[138].name, 'Domesticación');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[138].icon, '138.png');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[138].foodBonus, 115);

assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[137].name, 'Pastoreo');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[137].icon, '137.png');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[137].foodBonus, 230);

assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[136].name, 'Trashumancia');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[136].icon, '136.png');
assert.strictEqual(dataTechs.PASTURE_TECHS_DATA[136].foodBonus, 345);

assert(dataTechs.PASTURE_TECHS, 'PASTURE_TECHS should exist in data/techs.js');
console.log('✓ data/techs.js PASTURE_TECHS_DATA and PASTURE_TECHS verified');

// 2. techs.js
const techs = require('../techs.js');
assert(techs.PASTURE_TECHS_DATA, 'PASTURE_TECHS_DATA should exist in techs.js');
assert.strictEqual(techs.PASTURE_TECHS_DATA[138].icon, '138.png');
assert.strictEqual(techs.PASTURE_TECHS.domestication.name, 'Domesticación');
console.log('✓ techs.js PASTURE_TECHS_DATA verified');

// 3. Image assets
const requiredImages = [
  'img/Tech/138.png',
  'img/Tech/137.png',
  'img/Tech/136.png',
  'img/Techs/138.png',
  'img/Techs/137.png',
  'img/Techs/136.png',
  'img/Tech/domestication.png',
  'img/Tech/pastoralism.png',
  'img/Tech/transhumance.png'
];
for (const relPath of requiredImages) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  assert(fs.existsSync(fullPath), `Image ${relPath} should exist on disk`);
}
console.log('✓ Image assets (138.png, 137.png, 136.png) verified on disk');

// 4. ecoRates.js logic
const ecoRates = require('../ecoRates.js');
assert(ecoRates.CIV_ECO_MODIFIERS.khitans.usesPastures, 'Khitans should have usesPastures: true');
const khitanPasture = ecoRates.CIV_ECO_MODIFIERS.khitans.pasture;
assert.strictEqual(khitanPasture.baseCost, 110, 'Pasture base cost should be 110 wood');
assert.strictEqual(khitanPasture.baseCapacity, 345, 'Pasture base capacity should be 345 food');
assert.strictEqual(khitanPasture.shepherdsPerPasture, 2, 'Pasture shepherds per plot should be 2');

// Capacity escalation with new numeric IDs 138, 137, 136
const capBase = ecoRates.getPastureCapacity([]);
assert.strictEqual(capBase, 345, `Base pasture capacity should be 345, got ${capBase}`);

const capDom138 = ecoRates.getPastureCapacity([138]);
assert.strictEqual(capDom138, 460, `Capacity with ID 138 should be 460 (345+115), got ${capDom138}`);

const capPast137 = ecoRates.getPastureCapacity([138, 137]);
assert.strictEqual(capPast137, 690, `Capacity with ID 138+137 should be 690 (460+230), got ${capPast137}`);

const capTrans136 = ecoRates.getPastureCapacity([138, 137, 136]);
assert.strictEqual(capTrans136, 1035, `Capacity with ID 138+137+136 should be 1035 (690+345), got ${capTrans136}`);

const capStr = ecoRates.getPastureCapacity(['domestication', 'pastoralism', 'transhumance']);
assert.strictEqual(capStr, 1035);
console.log('✓ Pasture capacity tiers with IDs 138, 137, 136 verified: 345 -> 460 -> 690 -> 1035');

// getFarmMetrics for khitans
const metrics = ecoRates.getFarmMetrics('khitans', [138, 137]);
assert.strictEqual(metrics.farmCost, 110);
assert.strictEqual(metrics.farmCapacity, 690);
assert.strictEqual(metrics.usesPastures, true);
assert.strictEqual(metrics.shepherdsPerPasture, 2);
console.log('✓ getFarmMetrics for Khitans verified');

// calculateFarmOverhead with double extraction
const overhead = ecoRates.calculateFarmOverhead(10, 21.61, { farmCost: 110, farmCapacity: 345, usesPastures: true, shepherdsPerPasture: 2 }, 23.4);
assert.strictEqual(overhead.usesPastures, true);
assert.strictEqual(overhead.shepherdsPerPasture, 2);
assert.strictEqual(overhead.farmCapacity, 345);
assert.strictEqual(overhead.farmCost, 110);

// Lifespan T_pasture = 345 / (2 * 21.61) = 7.98 min
const expectedLifespan = Math.round((345 / (2 * 21.61)) * 100) / 100;
assert.strictEqual(overhead.farmLifespanMin, expectedLifespan);

// Active plots = 10 / 2 = 5
assert.strictEqual(overhead.activePlots, 5);
assert.strictEqual(overhead.ceilActivePlots, 5);
console.log('✓ calculateFarmOverhead double extraction math verified');

// 5. ecoCalculator.js UI & Reactive rendering
const ecoCalc = require('../ecoCalculator.js');
assert(Array.isArray(ecoCalc.PASTURE_ECO_TECHS), 'ecoCalculator should export PASTURE_ECO_TECHS');
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS.length, 3);
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[0].key, 'domestication');
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[0].techId, 138);
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[0].icon, 'img/Tech/138.png');

assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[1].key, 'pastoralism');
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[1].techId, 137);
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[1].icon, 'img/Tech/137.png');

assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[2].key, 'transhumance');
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[2].techId, 136);
assert.strictEqual(ecoCalc.PASTURE_ECO_TECHS[2].icon, 'img/Tech/136.png');

// Setup mock DOM for ecoCalc.render()
function createMockElement() {
  const el = {
    innerHTML: '',
    children: [],
    querySelector: (sel) => null,
    querySelectorAll: (sel) => []
  };
  return el;
}

const mockContainer = createMockElement();

// Test Generic / Frank rendering: Granjas cluster
ecoCalc.setCiv('franks');
ecoCalc.setAge('castle');
ecoCalc.render(mockContainer);

assert(mockContainer.innerHTML.includes('Granjas:'), 'Non-Khitan should render Granjas cluster');
assert(mockContainer.innerHTML.includes('data-tech-key="horse_collar"'), 'Non-Khitan should have horse_collar');
assert(mockContainer.innerHTML.includes('data-tech-key="heavy_plow"'), 'Non-Khitan should have heavy_plow');
assert(!mockContainer.innerHTML.includes('data-tech-key="domestication"'), 'Non-Khitan should not have domestication');
console.log('✓ Non-Khitan civ renders standard Granjas cluster');

// Test Khitans rendering: Pasturas cluster with 138.png, 137.png, 136.png
ecoCalc.setCiv('khitans');
ecoCalc.setAge('castle');
ecoCalc.getState().queue = [{ id: 38, count: 2 }]; // 2 Establos Jinetes (consumen alimento)
ecoCalc.render(mockContainer);

assert(mockContainer.innerHTML.includes('Pasturas:'), 'Khitan civ should render Pasturas cluster');
assert(mockContainer.innerHTML.includes('data-tech-key="domestication"'), 'Khitan civ should have domestication');
assert(mockContainer.innerHTML.includes('data-tech-key="pastoralism"'), 'Khitan civ should have pastoralism');
assert(mockContainer.innerHTML.includes('data-tech-key="transhumance"'), 'Khitan civ should have transhumance');
assert(mockContainer.innerHTML.includes('img/Tech/138.png'), 'Domesticación should use 138.png');
assert(mockContainer.innerHTML.includes('img/Tech/137.png'), 'Pastoreo should use 137.png');
assert(mockContainer.innerHTML.includes('img/Tech/136.png'), 'Trashumancia should use 136.png');
assert(mockContainer.innerHTML.includes('Sobrecoste de Resiembra de Pasturas'), 'Card should show Pasturas title');
assert(mockContainer.innerHTML.includes('Extracción doble: 2 pastores/parcela'), 'Card should show double extraction note');
console.log('✓ Khitan civ renders dynamic Pasturas cluster with official 138.png, 137.png, 136.png icons');

console.log('\n>>> ALL REACTIVE PASTURE TESTS PASSED SUCCESSFULLY! <<<');
