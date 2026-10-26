/**
 * CIVTEXTPARSER.JS - Parser de Cadenas Descriptivas de Civilizaciones para Age of Empires II: DE
 * Extrae arquetipo, bonificaciones pasivas, unidades únicas, tecnologías únicas (coronas) y bono de equipo.
 */
(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.parseCivDescription = exports.parseCivDescription;
    global.civTextParser = exports;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  /**
   * Procesa la cadena cruda con tags HTML de strings.json y devuelve un objeto limpio.
   * @param {string} rawString 
   * @returns {{ archetype: string, bonuses: string[], uniqueUnits: string[], uniqueTechs: string[], teamBonus: string }}
   */
  function parseCivDescription(rawString) {
    if (!rawString) return { archetype: '', bonuses: [], uniqueUnits: [], uniqueTechs: [], teamBonus: '' };

    const clean = String(rawString).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Arquetipo: Primera línea antes de los primeros saltos <br>
    const firstBr = clean.indexOf('<br>');
    const archetype = (firstBr !== -1 ? clean.substring(0, firstBr) : clean.split('\n')[0])
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();

    // Helper para aislar secciones entre expresiones regulares
    const sliceSection = (startRegex, endRegex) => {
      const startMatch = clean.match(startRegex);
      if (!startMatch) return '';
      const startIndex = startMatch.index + startMatch[0].length;
      const rest = clean.substring(startIndex);
      const endMatch = rest.match(endRegex);
      return (endMatch ? rest.substring(0, endMatch.index) : rest).trim();
    };

    // 2. Bonos pasivos: Entre el arquetipo y "Unidad(es) única(s):"
    const rawBonuses = sliceSection(/Civilización[^\n<]+(?:<br>|\n)+/i, /<\s*b\s*>\s*(?:•\s*)?Unidad(?:es)? única(?:s)?:\s*<\s*\/b\s*>/i);
    const bonuses = rawBonuses
      .split(/<br>|\n/)
      .map(line => line.replace(/^[•\-\s]+/, '').replace(/<\/?[^>]+(>|$)/g, '').trim())
      .filter(line => line.length > 0);

    // 3. Unidades Únicas: Entre "Unidad única" y "Tecnologías únicas"
    const rawUU = sliceSection(/<\s*b\s*>\s*(?:•\s*)?Unidad(?:es)? única(?:s)?:\s*<\s*\/b\s*>\s*(?:<br>|\n)*/i, /<\s*b\s*>\s*(?:•\s*)?T(?:ecnología|écnica)s? únicas?:\s*<\s*\/b\s*>/i);
    const uniqueUnits = rawUU
      .split(/<br>|\n/)
      .map(line => line.replace(/^[•\-\s]+/, '').replace(/<\/?[^>]+(>|$)/g, '').trim())
      .filter(line => line.length > 0);

    // 4. Tecnologías Únicas: Entre "Tecnologías únicas" y "Bonificación de equipo"
    const rawTechs = sliceSection(/<\s*b\s*>\s*(?:•\s*)?T(?:ecnología|écnica)s? únicas?:\s*<\s*\/b\s*>\s*(?:<br>|\n)*/i, /<\s*b\s*>\s*(?:•\s*)?Bonificación (?:de|para el) equipo:\s*<\s*\/b\s*>/i);
    const uniqueTechs = rawTechs
      .split(/<br>|\n/)
      .map(line => line.replace(/^[•\-\s]+/, '').replace(/<\/?[^>]+(>|$)/g, '').trim())
      .filter(line => line.length > 0);

    // 5. Bono de Equipo
    const teamMatch = clean.match(/<\s*b\s*>\s*(?:•\s*)?Bonificación (?:de|para el) equipo:\s*<\s*\/b\s*>/i);
    let teamBonus = '';
    if (teamMatch) {
      const idx = teamMatch.index + teamMatch[0].length;
      teamBonus = clean.substring(idx).replace(/<br>|\n/g, ' ').replace(/<\/?[^>]+(>|$)/g, '').trim();
    }

    return { archetype, bonuses, uniqueUnits, uniqueTechs, teamBonus };
  }

  return { parseCivDescription };
});
