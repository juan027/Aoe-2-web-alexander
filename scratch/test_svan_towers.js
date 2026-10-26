const assert = require('assert');
const { calculateBuildingStats } = require('../civModifiers.js');
const { getBuildingTechList } = require('../buildingUpgrades.js');
const { BUILDING_BONUSES } = require('../buildings.js');
const civEcoV2 = require('../civEcoBonuses-v2.js');
const CIV_ECONOMIC_BONUSES = civEcoV2.CIV_ECONOMIC_BONUSES || civEcoV2;

console.log('--- TEST 1: civEcoBonuses-v2.js Georgians entries ---');
const georgiansEco = CIV_ECONOMIC_BONUSES.georgians;
assert(georgiansEco, 'Georgians eco entry must exist');
const churchBonus = georgiansEco.bonuses.find(b => b.targetBuildings && b.targetBuildings.includes('fortified_church') && b.type === 'aura_work_rate');
assert(churchBonus, 'Fortified Church aura bonus must exist in civEcoBonuses-v2');
assert.strictEqual(churchBonus.radius, 9, 'Aura radius must be 9');
assert.strictEqual(churchBonus.value, 0.10, 'Aura value must be 0.10 (+10%)');

const svanTech = (georgiansEco.uniqueTechs || []).find(t => t.techId === 923 || t.id === 'svan_towers') ||
  (georgiansEco.bonuses || []).find(b => b.techId === 923 || b.id === 'svan_towers');
assert(svanTech, 'Svan Towers (ID 923) must exist in Georgians bonuses or uniqueTechs');
assert.strictEqual(svanTech.value, 2, 'Svan Towers attack bonus must be 2');
console.log('✔ TEST 1 PASSED: civEcoBonuses-v2 verified.');

console.log('--- TEST 2: BUILDING_BONUSES in buildings.js ---');
const arrowBuildings = ['town_center', 'watch_tower', 'guard_tower', 'keep', 'castle', 'dock', 'fortified_church'];
arrowBuildings.forEach(k => {
  const bData = BUILDING_BONUSES[k];
  assert(bData, `BUILDING_BONUSES must have key ${k}`);
  const gBonus = (bData.civBonuses || []).find(cb => cb.civ === 'Georgianos');
  assert(gBonus, `${k} must have a Georgian bonus in civBonuses`);
  if (k === 'fortified_church') {
    assert(gBonus.desc.includes('9 casillas') && gBonus.desc.includes('10%'), `fortified_church bonus must mention 9 tiles and 10% work rate: ${gBonus.desc}`);
  }
  if (k !== 'fortified_church' && k !== 'watch_tower') {
    assert(gBonus.desc.includes('Torres esvanas'), `${k} bonus must mention Torres esvanas: ${gBonus.desc}`);
  }
});
console.log('✔ TEST 2 PASSED: BUILDING_BONUSES verified.');

console.log('--- TEST 3: buildingUpgrades.js getBuildingTechList ---');
arrowBuildings.forEach(k => {
  const list = getBuildingTechList(k);
  assert(list.includes(923), `${k} must include tech 923 in getBuildingTechList`);
});
const nonEligible = ['barracks', 'market', 'mill', 'blacksmith'];
nonEligible.forEach(k => {
  const list = getBuildingTechList(k);
  assert(!list.includes(923), `${k} must NOT include tech 923 in getBuildingTechList`);
});
console.log('✔ TEST 3 PASSED: getBuildingTechList verified.');

console.log('--- TEST 4: calculateBuildingStats Svan Towers (+2 Attack) ---');
const baseBuildings = {
  town_center: { key: 'town_center', baseAttack: 5, baseRange: 6, projectiles: 1 },
  watch_tower: { key: 'watch_tower', baseAttack: 5, baseRange: 8, projectiles: 1 },
  guard_tower: { key: 'guard_tower', baseAttack: 6, baseRange: 8, projectiles: 1 },
  keep: { key: 'keep', baseAttack: 7, baseRange: 8, projectiles: 1 },
  castle: { key: 'castle', baseAttack: 11, baseRange: 8, projectiles: 5 },
  fortified_church: { key: 'fortified_church', baseAttack: 5, baseRange: 4, minRange: 1, projectiles: 1 },
  dock: { key: 'dock', baseAttack: 0, baseRange: 0, projectiles: 0 }
};

// Check without Svan Towers
Object.keys(baseBuildings).forEach(k => {
  const res = calculateBuildingStats(baseBuildings[k], 'Georgians', 3, { svanTowers: false });
  assert.strictEqual(res.attack, baseBuildings[k].baseAttack, `${k} attack without Svan Towers should be ${baseBuildings[k].baseAttack}`);
});

// Check WITH Svan Towers
Object.keys(baseBuildings).forEach(k => {
  const res = calculateBuildingStats(baseBuildings[k], 'Georgians', 3, { svanTowers: true });
  const expectedAttack = baseBuildings[k].baseAttack + 2;
  assert.strictEqual(res.attack, expectedAttack, `${k} attack with Svan Towers should be ${expectedAttack}, got ${res.attack}`);
  if (k === 'dock') {
    assert.strictEqual(res.range, 6, 'Dock with Svan Towers must have range 6');
    assert.strictEqual(res.projectiles, 1, 'Dock with Svan Towers must have 1 projectile');
  }
  assert(res.appliedBonuses.some(b => b.includes('Torres esvanas (+2 ataque)')), `${k} must log Torres esvanas (+2 ataque) in appliedBonuses`);
});

// Verify non-eligible buildings (e.g. barracks) do NOT receive Svan Towers attack
const barracksRes = calculateBuildingStats({ key: 'barracks', baseAttack: 0, baseRange: 0 }, 'Georgians', 3, { svanTowers: true });
assert.strictEqual(barracksRes.attack, 0, 'Barracks must not receive Svan Towers attack');

console.log('✔ TEST 4 PASSED: calculateBuildingStats Svan Towers verified.');

console.log('--- TEST 5: Georgian Fortified Church Aura ---');
const churchBuilding = { key: 'fortified_church', baseAttack: 5, baseRange: 4, minRange: 1, hp: 2400, healRate: 1.0 };

// Georgians
const geoChurch = calculateBuildingStats(churchBuilding, 'Georgians', 3, {});
assert(geoChurch.aura, 'Georgians Fortified Church must have aura object');
assert.strictEqual(geoChurch.aura.radius, 9, 'Aura radius must be 9');
assert.strictEqual(geoChurch.aura.value, 0.10, 'Aura value must be 0.10');
assert.strictEqual(geoChurch.aura.target, 'villager', 'Aura target must be villager');
assert.strictEqual(geoChurch.auraRadius, 9, 'auraRadius property must be 9');
assert.strictEqual(geoChurch.auraWorkRate, 0.10, 'auraWorkRate property must be 0.10');
assert(geoChurch.appliedBonuses.some(b => b.includes('Aura económica')), 'Must log Aura económica in appliedBonuses');

// Armenians
const armChurch = calculateBuildingStats(churchBuilding, 'Armenians', 3, {});
assert(!armChurch.aura, 'Armenians Fortified Church must NOT have aura object');
assert.strictEqual(armChurch.healRate, 1.0, 'Armenians Fortified Church healRate should be 1.0');

console.log('✔ TEST 5 PASSED: Georgian Fortified Church Aura verified.');
console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
