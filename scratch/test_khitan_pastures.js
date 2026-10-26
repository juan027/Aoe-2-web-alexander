const assert = require('assert');
const r = require('../ecoRates.js');
const eco = require('../ecoCalculator.js');

console.log('--- TEST 1: CIV_ECO_MODIFIERS.khitans Structure ---');
const khitansMod = r.CIV_ECO_MODIFIERS.khitans;
assert.ok(khitansMod, 'khitans modifier exists');
assert.strictEqual(khitansMod.usesPastures, true);
assert.ok(khitansMod.pasture, 'pasture config exists');
assert.strictEqual(khitansMod.pasture.baseCost, 110);
assert.strictEqual(khitansMod.pasture.baseCapacity, 345);
assert.strictEqual(khitansMod.pasture.shepherdsPerPasture, 2);
console.log('✓ CIV_ECO_MODIFIERS.khitans pasture parameters verified');

console.log('\n--- TEST 2: getPastureCapacity Calculation ---');
assert.strictEqual(typeof r.getPastureCapacity, 'function', 'getPastureCapacity is exported');
assert.strictEqual(r.getPastureCapacity([]), 345, 'Base capacity is 345');
assert.strictEqual(r.getPastureCapacity([14]), 460, 'Domesticación / Collera (14) adds +115 -> 460');
assert.strictEqual(r.getPastureCapacity([14, 13]), 690, 'Pastoreo / Arado pesado (13) adds +230 -> 690');
assert.strictEqual(r.getPastureCapacity([14, 13, 12]), 1035, 'Trashumancia / Rotación (12) adds +345 -> 1035');
assert.strictEqual(r.getPastureCapacity(['horse_collar', 'heavy_plow']), 690, 'String keys supported');
assert.strictEqual(r.getPastureCapacity(['domestication', 'pastoralism']), 690, 'Pasture tech keys supported');
console.log('✓ getPastureCapacity verified across all tech tiers');

console.log('\n--- TEST 3: getFarmMetrics for Khitans vs Generic ---');
const khitanMetrics = r.getFarmMetrics('khitans', [14, 13]);
assert.strictEqual(khitanMetrics.farmCost, 110, 'Pasture parcel cost is 110 wood');
assert.strictEqual(khitanMetrics.farmCapacity, 690, 'Pasture capacity is 690 with Domesticación+Pastoreo');
assert.strictEqual(khitanMetrics.usesPastures, true, 'usesPastures is true for Khitans');
assert.strictEqual(khitanMetrics.shepherdsPerPasture, 2);

const genericMetrics = r.getFarmMetrics('generic', [14, 13]);
assert.strictEqual(genericMetrics.farmCost, 60);
assert.strictEqual(genericMetrics.farmCapacity, 375, 'Standard farm with Collera+Arado is 175+75+125 = 375');
assert.strictEqual(genericMetrics.usesPastures, false);
console.log('✓ getFarmMetrics correctly distinguishes pastures from standard farms');

console.log('\n--- TEST 4: calculateFarmOverhead for Khitans ---');
// 10 pastores, gathering rate 23.33 (Khitan with wheelbarrow), pasture 690 food, 110 wood, wood gathering rate 23.4
const overhead = r.calculateFarmOverhead(10, 23.33, khitanMetrics, 23.4);
assert.strictEqual(overhead.usesPastures, true);
assert.strictEqual(overhead.farmCost, 110);
assert.strictEqual(overhead.farmCapacity, 690);
assert.strictEqual(overhead.shepherdsPerPasture, 2);
// Lifespan = 690 / (2 * 23.33) = 14.79 min
assert.strictEqual(overhead.farmLifespanMin, 14.79);
// Wood demand per pastor = (110 * 23.33) / 690 = 3.72
assert.strictEqual(overhead.woodDemandPerFarmerPerMin, 3.72);
assert.strictEqual(overhead.totalWoodDemandPerMin, 37.19);
assert.strictEqual(overhead.reseedLumberjacks, 2, 'Requires 2 reseed lumberjacks');
assert.strictEqual(overhead.activePlots, 5);

// Zero pastores case
const zeroOverhead = r.calculateFarmOverhead(0, 23.33, khitanMetrics, 23.4);
assert.strictEqual(zeroOverhead.reseedLumberjacks, 0);
assert.strictEqual(zeroOverhead.totalWoodDemandPerMin, 0);
console.log('✓ calculateFarmOverhead returns correct wood drain and reseed lumberjacks');

console.log('\n>>> ALL KHITAN PASTURE TESTS PASSED <<<');
