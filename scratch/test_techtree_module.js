const assert = require('assert');
const fs = require('fs');

console.log('=== TEST 1: civTextParser & CIV_STRING_MAP ===');
const { parseCivDescription } = require('../civTextParser.js');
const { CIV_STRING_MAP } = require('../civStringMap.js');
const strings = JSON.parse(fs.readFileSync('data/locales/es/strings.json', 'utf8'));

assert(typeof parseCivDescription === 'function', 'parseCivDescription must be a function');
assert(CIV_STRING_MAP && typeof CIV_STRING_MAP === 'object', 'CIV_STRING_MAP must exist');

let parsedCount = 0;
Object.entries(CIV_STRING_MAP).forEach(([civ, strId]) => {
  const rawStr = strings[strId];
  assert(rawStr, `String ID ${strId} must exist for civ ${civ}`);
  const parsed = parseCivDescription(rawStr);
  assert(parsed.archetype, `Archetype must not be empty for ${civ}`);
  assert(parsed.bonuses && parsed.bonuses.length > 0, `Bonuses must not be empty for ${civ}`);
  assert(parsed.uniqueUnits && parsed.uniqueUnits.length > 0, `Unique units must not be empty for ${civ}`);
  assert(parsed.uniqueTechs && parsed.uniqueTechs.length > 0, `Unique techs must not be empty for ${civ}`);
  assert(parsed.teamBonus, `Team bonus must not be empty for ${civ}`);
  parsedCount++;
});
console.log(`✔ TEST 1 PASSED: Successfully parsed all ${parsedCount} civilizations in CIV_STRING_MAP.`);

console.log('=== TEST 2: Tech Tree file resolution & zero collisions across all 56 civs ===');
const techTreeModule = require('../techTree.js');
const treeFiles = fs.readdirSync('data/trees');
assert.strictEqual(treeFiles.length, 56, 'Must have exactly 56 tree files in data/trees');

const civs = require('../civilizations.js').CIVILIZATIONS;
civs.forEach(c => {
  const key = techTreeModule.resolveTreeKey(c.id);
  const filePath = `data/trees/${key}.json`;
  assert(fs.existsSync(filePath), `Tree file ${filePath} must exist for civ ${c.id}`);
  
  const treeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert(Array.isArray(treeData.buildings), `Tree must have buildings array in ${key}`);
  assert(Array.isArray(treeData.units_techs), `Tree must have units_techs array in ${key}`);

  // Test zero collisions layout
  let xOffset = 0;
  const posSet = new Set();
  treeData.buildings.forEach(b => {
    const w = b.grid ? b.grid[0].length : 1;
    const bPos = `${b.row},${xOffset}`;
    assert(!posSet.has(bPos), `Collision at building ${bPos} in ${key}`);
    posSet.add(bPos);

    if (b.grid) {
      b.grid.forEach((rowArr, r) => {
        rowArr.forEach((cellId, c) => {
          if (cellId) {
            const pos = `${r},${xOffset + c}`;
            assert(!posSet.has(pos), `Collision at ${cellId} pos ${pos} in ${key}`);
            posSet.add(pos);
          }
        });
      });
    }
    xOffset += w;
  });
});
console.log('✔ TEST 2 PASSED: All 56 civs resolve tree files and have 0 grid layout collisions.');

console.log('=== TEST 3: Link Prerequisite Integrity ===');
const sampleTree = JSON.parse(fs.readFileSync('data/trees/BRITONS.json', 'utf8'));
const unitTechMap = new Map();
sampleTree.units_techs.forEach(u => unitTechMap.set(u.id, u));

let linkCount = 0;
sampleTree.units_techs.forEach(u => {
  if (u.link_id !== null && u.link_id !== undefined && u.link_id !== -1) {
    const parentUt = sampleTree.units_techs.find(p => p.node_id === u.link_id && p.building_id === u.building_id) ||
                     sampleTree.units_techs.find(p => p.node_id === u.link_id);
    const parentB = sampleTree.buildings.find(pb => pb.node_id === u.link_id);
    assert(parentUt || parentB, `Parent with id ${u.link_id} must exist for ${u.name}`);
    linkCount++;
  }
});
console.log(`✔ TEST 3 PASSED: Verified ${linkCount} prerequisite links in Britons tree.`);

console.log('=== TEST 4: Index.html & App.js Integration ===');
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('techTree.css'), 'index.html must include techTree.css');
assert(indexHtml.includes('civStringMap.js'), 'index.html must include civStringMap.js');
assert(indexHtml.includes('civTextParser.js'), 'index.html must include civTextParser.js');
assert(indexHtml.includes('techTree.js'), 'index.html must include techTree.js');
assert(indexHtml.includes('id="techtree-view"'), 'index.html must have techtree-view');
assert(indexHtml.includes('data-action="open-techtree"'), 'index.html must have open-techtree button');
assert(indexHtml.includes('id="techtree-sidebar-content"'), 'index.html must have techtree-sidebar-content');
assert(indexHtml.includes('id="techtree-canvas"'), 'index.html must have techtree-canvas');

const appJs = fs.readFileSync('app.js', 'utf8');
assert(appJs.includes('techtreeView:'), 'app.js DOM must include techtreeView');
assert(appJs.includes('viewName === \'techtree\''), 'app.js navigateToView must handle techtree');
assert(appJs.includes('open-techtree'), 'app.js must bind open-techtree click');

console.log('✔ TEST 4 PASSED: index.html and app.js integration verified.');
console.log('\n🎉 ALL 4 TESTS PASSED WITH 100% SUCCESS! 🎉');
