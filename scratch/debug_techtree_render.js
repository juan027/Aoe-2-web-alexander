// Arnés de depuración: ejecuta renderTreeCanvas con un DOM simulado para las 56 civs.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
process.chdir(root);

function makeEl(id) {
  return {
    id, innerHTML: '', style: {}, dataset: {}, attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    querySelectorAll() { return []; },
    addEventListener() {}, classList: { add() {}, remove() {} }
  };
}
const els = {};
['techtree-canvas', 'techtree-nodes-layer', 'techtree-svg-layer', 'techtree-bg-layers', 'techtree-civ-select', 'techtree-sidebar-content']
  .forEach(id => els[id] = makeEl(id));
global.document = {
  getElementById: id => els[id] || null,
  querySelectorAll: () => [],
  createElement: () => makeEl('x')
};
global.window = global;
global.fetch = async (url) => {
  const file = path.join(root, url.replace(/^\.\//, ''));
  if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
};

const data = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
const strings = JSON.parse(fs.readFileSync('data/locales/es/strings.json', 'utf8'));
const avail = require('../availability.js');
global.isBuildingAvailableForCiv = avail.isBuildingAvailableForCiv;
global.isTechAvailableForCiv = avail.isTechAvailableForCiv;
global.state = { data, strings };
global.CIV_STRING_MAP = require('../civStringMap.js').CIV_STRING_MAP;
global.parseCivDescription = require('../civTextParser.js').parseCivDescription;
global.CIVILIZATIONS = require('../civilizations.js').CIVILIZATIONS;

const tt = require('../techTree.js');
tt.state.data = data;
tt.state.strings = strings;

(async () => {
  let failed = 0;
  for (const c of global.CIVILIZATIONS) {
    els['techtree-nodes-layer'].innerHTML = '';
    try {
      await tt.renderTreeCanvas(c.id);
      const html = els['techtree-nodes-layer'].innerHTML;
      if (html.includes('Desplegando') || !html.includes('techtree-node')) {
        console.log('STUCK', c.id, html.slice(0, 80));
        failed++;
      }
    } catch (e) {
      console.log('THROW', c.id, e.stack.split('\n').slice(0, 3).join(' | '));
      failed++;
    }
  }
  console.log('civs con fallo:', failed, '/', global.CIVILIZATIONS.length);
})();
