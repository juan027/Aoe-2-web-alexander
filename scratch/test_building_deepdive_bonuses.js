const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser globals
global.window = global;
global.document = {
  head: { appendChild: () => {} },
  body: { classList: { add: () => {}, remove: () => {} } },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, style: {} })
};
global.window.addEventListener = () => {};

// Load dependencies in sandbox
const buildingsCode = fs.readFileSync(path.join(__dirname, '../buildings.js'), 'utf8');
const buildingUpgradesCode = fs.readFileSync(path.join(__dirname, '../buildingUpgrades.js'), 'utf8');
const civModifiersCode = fs.readFileSync(path.join(__dirname, '../civModifiers.js'), 'utf8');
const buildingDeepDiveCode = fs.readFileSync(path.join(__dirname, '../buildingDeepDive.js'), 'utf8');

const sandbox = {
  window: global,
  document: global.document,
  console,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Set,
  Map
};

vm.createContext(sandbox);
vm.runInContext(buildingsCode, sandbox);
vm.runInContext(buildingUpgradesCode, sandbox);
vm.runInContext(civModifiersCode, sandbox);
vm.runInContext(buildingDeepDiveCode, sandbox);

let mockModalHtml = '';
sandbox.document.getElementById = (id) => {
  if (id === 'building-deep-dive-modal') {
    return {
      style: {},
      set innerHTML(val) { mockModalHtml = val; },
      get innerHTML() { return mockModalHtml; },
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    };
  }
  return null;
};

const AoE2BuildingDeepDive = sandbox.window.AoE2BuildingDeepDive;

console.log('=== TEST DEEP DIVE MODAL FOR FARM ===');
AoE2BuildingDeepDive.openBuildingDeepDive('farm', 'Chinos', 4);
// Inspect rendered HTML
if (mockModalHtml.includes('Granja') || mockModalHtml.includes('farm')) {
  console.log('PASS: Farm deep dive rendered');
} else {
  console.error('FAIL: Farm deep dive did not render properly');
  process.exit(1);
}

console.log('=== TEST DEEP DIVE MODAL FOR DOCK ===');
AoE2BuildingDeepDive.openBuildingDeepDive('dock', 'Vikingos', 4);
if (mockModalHtml.includes('Muelle') || mockModalHtml.includes('dock')) {
  console.log('PASS: Dock deep dive rendered for Vikings');
} else {
  console.error('FAIL: Dock deep dive did not render properly');
  process.exit(1);
}

console.log('=== TEST DEEP DIVE MODAL FOR WATCH TOWER ===');
AoE2BuildingDeepDive.openBuildingDeepDive('watch_tower', 'Coreanos', 4);
if (mockModalHtml.includes('Torre') || mockModalHtml.includes('watch_tower')) {
  console.log('PASS: Watch Tower deep dive rendered for Koreans');
} else {
  console.error('FAIL: Watch Tower deep dive did not render properly');
  process.exit(1);
}

console.log('ALL DEEP DIVE UI TESTS PASSED! 🎯');
