const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.window.addEventListener = () => {};
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

const deepDiveCode = fs.readFileSync(path.join(__dirname, '../unitDeepDive.js'), 'utf8');

// Load unitDeepDive into vm sandbox
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
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(deepDiveCode, sandbox);

// Let's test renderStatsTab and renderUpgradesTab by invoking openUnitDeepDive and checking rendered modal
let mockModalHtml = '';
sandbox.window.DOM = {};
sandbox.document.getElementById = (id) => {
  if (id === 'unit-deep-dive-modal') {
    return {
      style: {},
      set innerHTML(val) { mockModalHtml = val; },
      get innerHTML() { return mockModalHtml; },
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
  return null;
};

const arbalest = {
  ID: 492,
  id: 492,
  name: 'Arbalester',
  localizedName: 'Arbalesta',
  internal_name: 'ACOAR',
  HP: 40,
  Attack: 6,
  ReloadTime: 2.0,
  Range: 5,
  Attacks: [{ Class: 3, Amount: 6 }],
  Armours: [{ Class: 4, Amount: 0 }, { Class: 3, Amount: 0 }]
};

// Test openUnitDeepDive with Shu
sandbox.window.AoE2UnitDeepDive.openUnitDeepDive(arbalest, 'shu', 'imperial');

// Let's inspect the active tab change to stats
// In state, activeTab can be set
console.log('Testing openUnitDeepDive for Shu Arbalest...');
console.log('Snippet of modal HTML:', mockModalHtml.substring(0, 500));
if (mockModalHtml.includes('Arbalesta') && mockModalHtml.toLowerCase().includes('shu')) {
  console.log('PASS: Deep dive modal header rendered correctly for Shu Arbalesta');
} else {
  console.error('FAIL: Deep dive modal missing Arbalesta or Shu');
  process.exit(1);
}

console.log('ALL DEEP DIVE CHECKS PASSED! 🎯');
