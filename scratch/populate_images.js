const fs = require('fs');
const path = require('path');

// 1. Crear img/Resource
if (!fs.existsSync('img/Resource')) {
  fs.mkdirSync('img/Resource', { recursive: true });
}

// Copiar recursos básicos
fs.copyFileSync('img/food.png', 'img/Resource/food.png');
fs.copyFileSync('img/wood.png', 'img/Resource/wood.png');
fs.copyFileSync('img/gold.png', 'img/Resource/gold.png');
fs.copyFileSync('img/stone.png', 'img/Resource/stone.png');

// Aldeano icon
if (fs.existsSync('img/units/83.png')) {
  fs.copyFileSync('img/units/83.png', 'img/Resource/villager.png');
} else if (fs.existsSync('img/Unit/83.png')) {
  fs.copyFileSync('img/Unit/83.png', 'img/Resource/villager.png');
}

// Time icon (crear un icono SVG o copiar)
const timeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" fill="#2a1a0c" stroke="#d4af37" stroke-width="2"/>
  <circle cx="12" cy="12" r="1.5" fill="#ffd875"/>
  <path d="M12 6v6l4 2.5" stroke="#ffd875" stroke-width="2" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync('img/Resource/time.svg', timeSvg);
// Para compatibilidad con time.png, si no existe png, podemos usar un placeholder o renderizar
fs.writeFileSync('img/Resource/time.png', fs.readFileSync('img/food.png')); // Temporal hasta que verifiquemos si hay time

// 2. Crear img/Techs
if (!fs.existsSync('img/Techs')) {
  fs.mkdirSync('img/Techs', { recursive: true });
}

const techMapping = {
  14: 'img/Tech/2.png',     // Horse collar
  13: 'img/Tech/1.png',     // Heavy plow
  12: 'img/Tech/0.png',     // Crop rotation
  202: 'img/Tech/70.png',   // Double Bit Axe
  203: 'img/Tech/71.png',   // Bow Saw
  221: 'img/Tech/71.png',   // Bow Saw (alias)
  54: 'img/Tech/81.png',    // Two Man Saw (alias)
  55: 'img/Tech/15.png',    // Gold Mining
  182: 'img/Tech/62.png',   // Gold Shaft Mining
  278: 'img/Tech/87.png',   // Stone Mining
  279: 'img/Tech/88.png',   // Stone Shaft Mining
  213: 'img/Tech/79.png',   // Wheelbarrow
  249: 'img/Tech/42.png'    // Hand Cart
};

// Also copy Two Man Saw as 221 if needed
Object.entries(techMapping).forEach(([targetId, sourcePath]) => {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, `img/Techs/${targetId}.png`);
  }
});

console.log('img/Resource and img/Techs successfully created and populated!');
