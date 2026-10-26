const units = require('../units.js');
const us = require('../unitService.js');
const eco = require('../ecoCalculator.js');

console.log('--- TEST QUEUE RENDER ---');
const state = eco.getState();
state.queue = [{ id: 331, count: 2 }];

// Mock minimal DOM container
const dummyContainer = {
  innerHTML: '',
  querySelector: () => null,
  querySelectorAll: () => []
};

eco.render(dummyContainer);

const hasMangudaiInQueue = dummyContainer.innerHTML.includes('img/Unit/42.png') || dummyContainer.innerHTML.includes('img/units/42.png');
console.log('Queue HTML contains 42.png?', hasMangudaiInQueue);

const queueRowMatch = dummyContainer.innerHTML.match(/eco-unit-row[\s\S]*?eco-unit-identity[\s\S]*?<\/div>/);
console.log('Queue identity row:\n', queueRowMatch ? queueRowMatch[0] : 'Not found');

// Also test backward compatibility with queue using id: 42
state.queue = [{ id: 42, count: 1 }];
eco.render(dummyContainer);
const hasMangudaiInLegacyQueue = dummyContainer.innerHTML.includes('img/Unit/42.png') || dummyContainer.innerHTML.includes('img/units/42.png');
console.log('Legacy queue (id: 42) contains 42.png?', hasMangudaiInLegacyQueue);
console.log('Legacy queue item normalized id:', state.queue[0].id);
