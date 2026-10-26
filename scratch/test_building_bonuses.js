const fs = require('fs');
const path = require('path');

// 1. Load modules
const buildingsModule = require('../buildings.js');
const civModifiers = require('../civModifiers.js');
const buildingUpgrades = require('../buildingUpgrades.js');
const civEcoModule = require('../civEcoBonuses-v2.js');

const { getBuildingBonuses, getBuildingByKey, BUILDING_BONUSES } = buildingsModule;
const { calculateBuildingStats } = civModifiers;
const { getBuildingTechList } = buildingUpgrades;
const { CIV_ECONOMIC_BONUSES } = civEcoModule;

console.log('=== TEST 1: Reclassification of Passive vs Team Bonuses ===');

// Check Farm bonuses
const farmBonuses = getBuildingBonuses('farm', 'all');
console.log('Farm Civ Bonuses count:', farmBonuses.allCivBonuses.length);
console.log('Farm Team Bonuses count:', farmBonuses.allTeamBonuses.length);

const chineseInFarmCiv = farmBonuses.allCivBonuses.find(b => b.civ === 'Chinos');
const chineseInFarmTeam = farmBonuses.allTeamBonuses.find(b => b.civ === 'Chinos');

if (chineseInFarmCiv) {
  console.error('FAIL: Chinese bonus should NOT be in Farm civBonuses!');
  process.exit(1);
} else if (!chineseInFarmTeam) {
  console.error('FAIL: Chinese bonus MUST be in Farm teamBonuses!');
  process.exit(1);
} else {
  console.log('PASS: Chinese farm bonus is correctly classified exclusively as Team Bonus:', chineseInFarmTeam.desc);
}

// Check Dock bonuses
const dockBonuses = getBuildingBonuses('dock', 'all');
const vikingsInDockCiv = dockBonuses.allCivBonuses.find(b => b.civ === 'Vikingos');
const vikingsInDockTeam = dockBonuses.allTeamBonuses.find(b => b.civ === 'Vikingos');

if (vikingsInDockCiv) {
  console.error('FAIL: Vikings bonus should NOT be in Dock civBonuses!');
  process.exit(1);
} else if (!vikingsInDockTeam) {
  console.error('FAIL: Vikings bonus MUST be in Dock teamBonuses!');
  process.exit(1);
} else {
  console.log('PASS: Vikings dock discount is correctly classified exclusively as Team Bonus:', vikingsInDockTeam.desc);
}

console.log('\n=== TEST 2: Missing Team Bonuses (Dravidians in Dock) ===');
const dravidiansInDockTeam = dockBonuses.allTeamBonuses.find(b => b.civ === 'Dravídicos');
if (!dravidiansInDockTeam) {
  console.error('FAIL: Dravidians team bonus is missing from Dock teamBonuses!');
  process.exit(1);
} else {
  console.log('PASS: Dravidians dock team bonus is present:', dravidiansInDockTeam.desc);
}

// Also check Dravidians in civEcoBonuses-v2
const dravidianEco = CIV_ECONOMIC_BONUSES.dravidians.bonuses.find(b => b.targetBuildings && b.targetBuildings.includes('dock'));
if (!dravidianEco || !dravidianEco.isTeamBonus) {
  console.error('FAIL: Dravidians dock bonus missing or not isTeamBonus: true in civEcoBonuses-v2.js');
  process.exit(1);
} else {
  console.log('PASS: Dravidians dock bonus in civEcoBonuses-v2 has isTeamBonus: true and targetBuildings: ["dock"]');
}

console.log('\n=== TEST 3: Towers & Defensive Structures Audit ===');
const watchTowerBonuses = getBuildingBonuses('watch_tower', 'all');
const koreansWT = watchTowerBonuses.allCivBonuses.find(b => b.civ === 'Coreanos');
const teutonsWTCiv = watchTowerBonuses.allCivBonuses.find(b => b.civ === 'Teutones');
const teutonsWTTeam = watchTowerBonuses.allTeamBonuses.find(b => b.civ === 'Teutones');
const japaneseWT = watchTowerBonuses.allCivBonuses.find(b => b.civ === 'Japoneses');
const chineseWT = watchTowerBonuses.allCivBonuses.find(b => b.civ === 'Chinos');

if (!koreansWT || !teutonsWTCiv || !teutonsWTTeam || !japaneseWT || !chineseWT) {
  console.error('FAIL: Missing civ bonus for Koreans, Teutons, Japanese or Chinese on Watch Tower!');
  process.exit(1);
} else {
  console.log('PASS: Watch Tower includes Coreanos, Teutones (Civ & Team), Japoneses, and Chinos');
}

const bbtBonuses = getBuildingBonuses('bombard_tower', 'all');
const turksBBT = bbtBonuses.allCivBonuses.find(b => b.civ === 'Turcos');
if (!turksBBT || !turksBBT.desc.includes('Química') || !turksBBT.desc.includes('Artillería')) {
  console.error('FAIL: Turks bonus on Bombard Tower incomplete or missing!');
  process.exit(1);
} else {
  console.log('PASS: Bombard Tower includes Turks (Química + Artillería):', turksBBT.desc);
}

// Arrowslits in buildingUpgrades
const towerTechs = getBuildingTechList('watch_tower');
if (!towerTechs.includes(234)) {
  console.error('FAIL: Arrowslits (Tech ID 234) is missing from defensive_ranged tech list in buildingUpgrades.js');
  process.exit(1);
} else {
  console.log('PASS: Arrowslits (Tech ID 234) is included in defensive_ranged tech list');
}

// Arrowslits attack calculation in civModifiers
const wtStatsBase = calculateBuildingStats('watch_tower', 'generic', 4, {});
const wtStatsArrowslits = calculateBuildingStats('watch_tower', 'generic', 4, { arrowslits: true });
console.log(`Watch Tower Base Attack: ${wtStatsBase.attack}, with Arrowslits: ${wtStatsArrowslits.attack}`);
if (wtStatsArrowslits.attack !== wtStatsBase.attack + 1) {
  console.error('FAIL: Watch Tower did not gain +1 attack from Arrowslits');
  process.exit(1);
}

const keepStatsBase = calculateBuildingStats('keep', 'generic', 4, {});
const keepStatsArrowslits = calculateBuildingStats('keep', 'generic', 4, { arrowslits: true });
console.log(`Keep Base Attack: ${keepStatsBase.attack}, with Arrowslits: ${keepStatsArrowslits.attack}`);
if (keepStatsArrowslits.attack !== keepStatsBase.attack + 3) {
  console.error('FAIL: Keep did not gain +3 attack from Arrowslits');
  process.exit(1);
} else {
  console.log('PASS: Arrowslits adds correct scaled attack (+1 Watch Tower, +3 Keep)');
}

// Koreans Tower Range Scaling in civModifiers
const koreanWTFeudal = calculateBuildingStats('watch_tower', 'koreans', 2, {});
const koreanWTCastle = calculateBuildingStats('watch_tower', 'koreans', 3, {});
const koreanWTImp = calculateBuildingStats('watch_tower', 'koreans', 4, {});
console.log(`Korean WT Range -> Feudal: ${koreanWTFeudal.range}, Castle: ${koreanWTCastle.range}, Imperial: ${koreanWTImp.range}`);
if (koreanWTCastle.range !== koreanWTFeudal.range + 1 || koreanWTImp.range !== koreanWTFeudal.range + 2) {
  console.error('FAIL: Koreans towers did not gain +1 range in Castle and +2 in Imperial');
  process.exit(1);
} else {
  console.log('PASS: Koreans towers gain +1 range in Castle and +2 in Imperial');
}

// Teutons Tower Garrison Capacity & Murder Holes in civModifiers
const teutonWT = calculateBuildingStats('watch_tower', 'teutons', 2, {});
console.log(`Teutons Watch Tower -> Garrison: ${teutonWT.garrisonCapacity}, Min Range: ${teutonWT.minRange}`);
if (teutonWT.garrisonCapacity < 10 || teutonWT.minRange !== 0) {
  console.error('FAIL: Teutons tower should have 10 garrison and 0 minRange (Murder Holes free)');
  process.exit(1);
} else {
  console.log('PASS: Teutons towers have 10 garrison capacity and 0 minRange');
}

console.log('\n=== TEST 4: Universal Bonus Spam Filtering ===');

// Test 4A: Farm (Costs 60 Wood, 0 Stone)
// Incas (-15% stone) must NOT be present!
// Georgians (Repair team bonus) must NOT be present!
const incasInFarm = farmBonuses.allCivBonuses.find(b => b.civ === 'Incas');
const georgiansRepairInFarm = farmBonuses.allTeamBonuses.find(b => b.civ === 'Georgianos' && b.desc.includes('Reparar'));
if (incasInFarm) {
  console.error('FAIL: Incas stone discount is present on Farm (which costs 0 stone)!');
  process.exit(1);
} else {
  console.log('PASS: Incas stone discount is correctly filtered out from Farm');
}
if (georgiansRepairInFarm) {
  console.error('FAIL: Georgians repair team bonus is present on Farm (which cannot be repaired)!');
  process.exit(1);
} else {
  console.log('PASS: Georgians repair bonus is correctly filtered out from Farm');
}

// Test 4B: Dock (Costs 150 Wood, 0 Stone)
const incasInDock = dockBonuses.allCivBonuses.find(b => b.civ === 'Incas');
if (incasInDock) {
  console.error('FAIL: Incas stone discount is present on Dock (which costs 0 stone)!');
  process.exit(1);
} else {
  console.log('PASS: Incas stone discount is correctly filtered out from Dock');
}

// Test 4C: Donjon (Exclusive to Sicilians)
// Other civs (Malians, Spanish, Byzantines, Georgians, Romans, Incas) MUST NOT be present!
const donjonBonuses = getBuildingBonuses('donjon', 'all');
console.log('Donjon Civ Bonuses:', donjonBonuses.allCivBonuses.map(b => b.civ));
const nonSicilianInDonjon = donjonBonuses.allCivBonuses.filter(b => !b.civ.toLowerCase().includes('sicil'));
if (nonSicilianInDonjon.length > 0 || donjonBonuses.allCivBonuses.length === 0) {
  console.error('FAIL: Donjon should contain only Sicilian bonus, got:', donjonBonuses.allCivBonuses);
  process.exit(1);
} else {
  console.log('PASS: Donjon only contains Sicilian bonuses; universal spam completely filtered out!');
}

// Test 4D: Folwark (Exclusive to Poles)
const folwarkBonuses = getBuildingBonuses('folwark', 'all');
console.log('Folwark Civ Bonuses:', folwarkBonuses.allCivBonuses.map(b => b.civ));
const nonPolishInFolwark = folwarkBonuses.allCivBonuses.filter(b => !b.civ.toLowerCase().includes('pol'));
if (nonPolishInFolwark.length > 0 || folwarkBonuses.allCivBonuses.length === 0) {
  console.error('FAIL: Folwark should contain only Polish bonus, got:', folwarkBonuses.allCivBonuses);
  process.exit(1);
} else {
  console.log('PASS: Folwark only contains Polish bonuses; universal spam completely filtered out!');
}

console.log('\nALL 4 REQUIREMENT AUDIT TESTS PASSED WITH 100% SUCCESS! 🚀');
