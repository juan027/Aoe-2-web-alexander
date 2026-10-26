const assert = require('assert');

// 1. Test buildingUpgrades.js
const { BUILDING_APPLICABLE_TECHS, getBuildingTechList } = require('../buildingUpgrades.js');

assert(BUILDING_APPLICABLE_TECHS.farm.length === 3, 'farm should have 3 techs');
assert.deepStrictEqual(getBuildingTechList('granja'), [14, 13, 12]);
assert.deepStrictEqual(getBuildingTechList('farm'), [14, 13, 12]);
assert.deepStrictEqual(getBuildingTechList('pasture'), ["domestication", "pastoralism", "transhumance"]);
assert.deepStrictEqual(getBuildingTechList('pasturas'), ["domestication", "pastoralism", "transhumance"]);
assert.deepStrictEqual(getBuildingTechList('dock'), [373, 374, 65, 50]);
assert.deepStrictEqual(getBuildingTechList('puerto'), [373, 374, 65, 50]);
assert.deepStrictEqual(getBuildingTechList('castle'), BUILDING_APPLICABLE_TECHS.defensive_ranged);
assert.deepStrictEqual(getBuildingTechList('watch_tower'), BUILDING_APPLICABLE_TECHS.defensive_ranged);
assert.deepStrictEqual(getBuildingTechList('town_center'), BUILDING_APPLICABLE_TECHS.defensive_ranged);
assert.deepStrictEqual(getBuildingTechList('barracks'), BUILDING_APPLICABLE_TECHS.passive_structural);
assert.deepStrictEqual(getBuildingTechList('house'), BUILDING_APPLICABLE_TECHS.passive_structural);
console.log('✓ buildingUpgrades.js: Mapeo y getBuildingTechList verificados correctamente.');

// 2. Test buildings.js integration
const buildings = require('../buildings.js');
const farm = buildings.getBuildingByKey('farm');
const castle = buildings.getBuildingByKey('castle');
assert.deepStrictEqual(farm.applicableTechs, [14, 13, 12]);
assert.deepStrictEqual(castle.applicableTechs, BUILDING_APPLICABLE_TECHS.defensive_ranged);
console.log('✓ buildings.js: applicableTechs poblado en BUILDING_REGISTRY verificado.');

// 3. Test civModifiers.js calculation exclusion
const civMod = require('../civModifiers.js');
const farmBaseStats = civMod.calculateBuildingStats('farm', 'Generic', 3, {});
const farmWithIllegalUpgrades = civMod.calculateBuildingStats('farm', 'Generic', 3, {
  masonry: true,
  architecture: true,
  fletching: true,
  murderHoles: true
});
// Farm HP must NOT be boosted by masonry or architecture
assert.strictEqual(farmWithIllegalUpgrades.hp, farmBaseStats.hp, 'Farm HP should not be boosted by masonry');
assert.strictEqual(farmWithIllegalUpgrades.attack, 0, 'Farm should not get attack from fletching');
console.log('✓ civModifiers.js: Granjas excluyen correctamente albañilería y flechas.');

// Castle with masonry and fletching SHOULD get boosted
const castleBaseStats = civMod.calculateBuildingStats('castle', 'Generic', 3, {});
const castleUpgraded = civMod.calculateBuildingStats('castle', 'Generic', 3, {
  masonry: true,
  fletching: true
});
assert(castleUpgraded.hp > castleBaseStats.hp, 'Castle should receive HP boost from masonry');
assert.strictEqual(castleUpgraded.attack, castleBaseStats.attack + 1, 'Castle should receive +1 attack from fletching');
console.log('✓ civModifiers.js: Castillos reciben correctamente albañilería y flechas.');

// Barracks with conscription
const barracksBase = civMod.calculateBuildingStats('barracks', 'Generic', 3, {});
const barracksConscripted = civMod.calculateBuildingStats('barracks', 'Generic', 3, {
  conscription: true,
  fletching: true
});
assert(barracksConscripted.workRate > barracksBase.workRate, 'Barracks should get boosted workRate from conscription');
assert.strictEqual(barracksConscripted.attack, 0, 'Barracks should not receive attack from fletching');
console.log('✓ civModifiers.js: Cuarteles reciben conscripción y excluyen flechas.');

// 4. Test availability.js
const avail = require('../availability.js');
assert.strictEqual(avail.isTechAvailableForCiv('Generic', 435), true);
assert.strictEqual(avail.isTechAvailableForCiv('Khitan', 'domestication'), true);
assert.strictEqual(avail.isTechAvailableForCiv('Franks', 'domestication'), false);
console.log('✓ availability.js: isTechAvailableForCiv verificado.');

console.log('\n🌟 ¡Todas las pruebas de integración pasaron con éxito!');
