const assert = require('assert');

// 1. Verificar units.js
const units = require('../units.js');
assert(units.CANONICAL_UNIT_OVERRIDES, "CANONICAL_UNIT_OVERRIDES debe estar definido y exportado en units.js");

console.log("--- 1. Pruebas de Sobrescrituras Canónicas ---");
// 39
const u39 = units.CANONICAL_UNIT_OVERRIDES[39];
assert.strictEqual(u39.name, "Arquero a caballo");
assert.strictEqual(u39.trainTime, 34);
assert.strictEqual(u39.icon, "39.png");
console.log("✓ Unidad 39: Arquero a caballo verificado");

// 474
const u474 = units.CANONICAL_UNIT_OVERRIDES[474];
assert.strictEqual(u474.name, "Arquero a caballo pesado");
assert.strictEqual(u474.trainTime, 27);
assert.strictEqual(u474.icon, "474.png");
console.log("✓ Unidad 474: Arquero a caballo pesado verificado");

// 5
const u5 = units.CANONICAL_UNIT_OVERRIDES[5];
assert.strictEqual(u5.name, "Artillero manual");
assert.strictEqual(u5.trainTime, 34);
assert.strictEqual(u5.icon, "5.png");
assert.strictEqual(u5.cost.food, 45);
assert.strictEqual(u5.cost.gold, 50);
console.log("✓ Unidad 5: Artillero manual verificado");

// 1800
const u1800 = units.CANONICAL_UNIT_OVERRIDES[1800];
assert.strictEqual(u1800.name, "Trebuchet a tracción");
assert.strictEqual(u1800.icon, "428.png", "Icon must be 428.png");
assert.notStrictEqual(u1800.icon, "27.png");
console.log("✓ Unidad 1800: Trebuchet a tracción con icono 428.png verificado");

// 473 y 567
const u473 = units.CANONICAL_UNIT_OVERRIDES[473];
assert.strictEqual(u473.name, "Espadachín de dos manos");
const u567 = units.CANONICAL_UNIT_OVERRIDES[567];
assert.strictEqual(u567.name, "Campeón");
console.log("✓ Unidades 473 (Dos Manos) y 567 (Campeón) verificadas");

// 2. Línea Champi (4 edades)
console.log("\n--- 2. Pruebas de Línea Champi ---");
const u2550 = units.CANONICAL_UNIT_OVERRIDES[2550];
assert.strictEqual(u2550.name, "Explorador Champi");
assert.strictEqual(u2550.trainTime, 42);
assert.strictEqual(u2550.cost.food, 50);
assert.strictEqual(u2550.cost.gold, 25);

const u2588 = units.CANONICAL_UNIT_OVERRIDES[2588];
assert.strictEqual(u2588.name, "Corredor Champi");
assert.strictEqual(u2588.trainTime, 34);

const u2552 = units.CANONICAL_UNIT_OVERRIDES[2552];
assert.strictEqual(u2552.name, "Guerrero Champi");
assert.strictEqual(u2552.trainTime, 26);

const u2554 = units.CANONICAL_UNIT_OVERRIDES[2554];
assert.strictEqual(u2554.name, "Guerrero Champi de élite");
assert.strictEqual(u2554.trainTime, 21);
console.log("✓ Línea Champi completa de 4 edades verificada");

// 3. Unidades faltantes
console.log("\n--- 3. Pruebas de Unidades Faltantes por Edificio ---");
// Cuartel
assert(units.CANONICAL_UNIT_OVERRIDES[753], "Explorador águila presente");
assert(units.CANONICAL_UNIT_OVERRIDES[2582], "Guerrero Ibiraçema presente");
assert(units.CANONICAL_UNIT_OVERRIDES[2584], "Guerrero Ibiraçema de élite presente");
assert(units.CANONICAL_UNIT_OVERRIDES[2703], "Guardia Varego presente");
assert(units.CANONICAL_UNIT_OVERRIDES[2704], "Guardia Varego de élite presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1901], "Lancero Incendiario presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1903], "Lancero Incendiario de élite presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1699], "Milicia Flamenca presente");
console.log("✓ Unidades de Cuartel verificadas");

// Galería
assert(units.CANONICAL_UNIT_OVERRIDES[1010], "Genitour presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1012], "Genitour de élite presente");
assert(units.CANONICAL_UNIT_OVERRIDES[2700], "Ballestero montado presente");
assert(units.CANONICAL_UNIT_OVERRIDES[2701], "Ballestero montado pesado presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1155], "Guerrillero imperial presente");
console.log("✓ Unidades de Galería verificadas");

// Establo
assert(units.CANONICAL_UNIT_OVERRIDES[1372], "Lancero estepario de élite presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1134], "Elefante de batalla de élite presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1944], "Jinete de Hei Guang presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1946], "Jinete de Hei Guang pesado presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1751], "Jinete de Shrivamsha presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1753], "Jinete de Shrivamsha de élite presente");
console.log("✓ Unidades de Establo verificadas");

// Asedio
assert(units.CANONICAL_UNIT_OVERRIDES[550], "Onagro de asedio presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1904], "Carro cohete presente");
assert(units.CANONICAL_UNIT_OVERRIDES[1907], "Carro cohete pesado presente");
console.log("✓ Unidades de Asedio verificadas");

// 4. Disponibilidad por Civilización en availability.js
console.log("\n--- 4. Pruebas de Disponibilidad (availability.js) ---");
const availability = require('../availability.js');

// Mayas
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 569), false, "Mayas NO deben tener Paladín (569)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 38), false, "Mayas NO deben tener Jinete (38)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 283), false, "Mayas NO deben tener Caballero (283)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 567), false, "Mayas NO deben tener Campeón (567)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 473), true, "Mayas SÍ tienen Espadachín de dos manos (473)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 753), true, "Mayas SÍ tienen Explorador águila (753)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 751), true, "Mayas SÍ tienen Guerrero águila (751)");
assert.strictEqual(availability.isUnitAvailableForCiv('mayans', 4), true, "Mayas SÍ tienen Arquero (4)");
console.log("✓ Filtrado de Mayas en availability.js perfecto");

// Muiscas / Incas (Champi line reemplaza milicia)
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 74), false, "Muiscas NO deben tener Miliciano estándar");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 75), false, "Muiscas NO deben tener Hombre de armas estándar");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 473), false, "Muiscas NO deben tener Espadachín de dos manos estándar");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 567), false, "Muiscas NO deben tener Campeón estándar");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 2550), true, "Muiscas SÍ tienen Explorador Champi (2550)");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 2588), true, "Muiscas SÍ tienen Corredor Champi (2588)");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 2552), true, "Muiscas SÍ tienen Guerrero Champi (2552)");
assert.strictEqual(availability.isUnitAvailableForCiv('muisca', 2554), true, "Muiscas SÍ tienen Guerrero Champi de élite (2554)");

assert.strictEqual(availability.isUnitAvailableForCiv('incas', 74), false, "Incas NO deben tener Miliciano estándar");
assert.strictEqual(availability.isUnitAvailableForCiv('incas', 2550), true, "Incas SÍ tienen Explorador Champi (2550)");
console.log("✓ Reemplazo de Milicia por Champi en Muiscas e Incas verificado");

// Francos
assert.strictEqual(availability.isUnitAvailableForCiv('franks', 569), true, "Francos SÍ tienen Paladín");
assert.strictEqual(availability.isUnitAvailableForCiv('franks', 567), true, "Francos SÍ tienen Campeón");
assert.strictEqual(availability.isUnitAvailableForCiv('franks', 2550), false, "Francos NO tienen Champi");
console.log("✓ Francos verificados");

// 5. Calculadora Económica (ecoCalculator.js)
console.log("\n--- 5. Pruebas de ecoCalculator.js ---");
const eco = require('../ecoCalculator.js');

// Available units para Mayas
const mayanUnits = eco.getAvailableUnitsForCiv('mayans');
const mayanIds = new Set(mayanUnits.map(u => u.id));

assert(!mayanIds.has(569), "Paladín no debe estar en unidades disponibles de Mayas en ecoCalculator");
assert(!mayanIds.has(38), "Jinete no debe estar en unidades disponibles de Mayas en ecoCalculator");
assert(!mayanIds.has(283), "Caballero no debe estar en unidades disponibles de Mayas en ecoCalculator");
assert(!mayanIds.has(567), "Campeón no debe estar en unidades disponibles de Mayas en ecoCalculator");
assert(mayanIds.has(473), "Espadachín de dos manos sí debe estar en unidades de Mayas en ecoCalculator");
assert(mayanIds.has(4), "Arquero sí debe estar en unidades de Mayas en ecoCalculator");
assert(mayanIds.has(753), "Explorador águila sí debe estar en unidades de Mayas en ecoCalculator");
console.log("✓ Mayas en ecoCalculator.getAvailableUnitsForCiv sin Paladín, Jinete ni Campeón");

// Available units para Muiscas
const muiscaUnits = eco.getAvailableUnitsForCiv('muisca');
const muiscaIds = new Set(muiscaUnits.map(u => u.id));

assert(!muiscaIds.has(74), "Miliciano no debe estar en Muiscas");
assert(!muiscaIds.has(567), "Campeón no debe estar en Muiscas");
assert(muiscaIds.has(2550), "Explorador Champi sí debe estar en Muiscas");
assert(muiscaIds.has(2588), "Corredor Champi sí debe estar en Muiscas");
assert(muiscaIds.has(2552), "Guerrero Champi sí debe estar en Muiscas");
assert(muiscaIds.has(2554), "Guerrero Champi de élite sí debe estar en Muiscas");
console.log("✓ Muiscas en ecoCalculator tiene la línea Champi y no la milicia estándar");

// Nombres e Iconos resueltos por getCanonicalUnit
const resolved39 = eco.getCanonicalUnit(39);
assert.strictEqual(resolved39.name, "Arquero a caballo");
assert.strictEqual(resolved39.trainTime, 34);

const resolved474 = eco.getCanonicalUnit(474);
assert.strictEqual(resolved474.name, "Arquero a caballo pesado");
assert.strictEqual(resolved474.trainTime, 27);

const resolved5 = eco.getCanonicalUnit(5);
assert.strictEqual(resolved5.name, "Artillero manual");
assert.strictEqual(resolved5.trainTime, 34);

const resolved1800 = eco.getCanonicalUnit(1800);
assert.strictEqual(resolved1800.name, "Trebuchet a tracción");
assert.strictEqual(resolved1800.icon, "428.png");

const icon1800 = eco.getUnitIconProps(1800);
assert.strictEqual(icon1800.src, "img/units/428.png");
assert.strictEqual(icon1800.fallback, "img/Unit/428.png");
console.log("✓ getCanonicalUnit y getUnitIconProps resuelven nombres e iconos oficiales");

console.log("\nTODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK).");
