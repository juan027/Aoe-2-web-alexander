/**
 * TECHTREE.JS - Módulo Interactivo del Árbol de Tecnologías (aoe2techtree style)
 * Soporta las 56 civilizaciones (oficiales y mod) con panel lateral de civilización sincronizado,
 * lienzo navegable con cuadrícula de 4 edades, conectores SVG y sistema de bloqueo canónico.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const exports = factory();
    global.techTreeModule = exports;
    global.openTechTree = exports.openTechTree;
    global.initTechTree = exports.initTechTree;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Constantes de dimensiones de cuadrícula
  const METRICS = {
    cellWidth: 80,       // Ancho por columna
    rowHeight: 96,       // Alto por fila (8 filas en total: 2 por edad)
    ageColWidth: 108,    // Ancho de la barra fija de edades a la izquierda
    canvasPaddingY: 10,  // Margen superior
    nodeWidth: 68,
    nodeHeight: 78
  };

  const BRANCH_OFFSETS = {
    archery: 0,
    barracks: 5,
    stable: 8,
    siege: 11,
    blacksmith: 15,
    dock: 20,
    university: 27,
    towers: 38,
    castle: 48,
    monastery: 53,
    economy: 61
  };

  // Estado interno del Tech Tree
  const state = {
    currentCiv: 'britons',
    zoomLevel: 1.0,
    data: null,
    strings: null,
    cachedTrees: {},
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    scrollStart: { x: 0, y: 0 },
    searchQuery: '',
    containerEl: null
  };

  /**
   * Resuelve el nombre del archivo en data/trees/<CIV>.json
   */
  function resolveTreeKey(civId) {
    if (!civId || civId === 'generic' || civId === 'all') return 'BRITONS';
    const norm = String(civId).toLowerCase().trim();
    if (norm === 'jurchen' || norm === 'jurchens' || norm === 'yurchen' || norm === 'yurchens') return 'JURCHENS';
    if (norm === 'muisca' || norm === 'muiscas') return 'MUISCA';
    if (norm === 'khitan' || norm === 'khitans' || norm === 'kitán') return 'KHITANS';
    
    let engCiv = norm;
    if (typeof SPANISH_TO_ENGLISH_CIVS !== 'undefined' && SPANISH_TO_ENGLISH_CIVS[norm]) {
      engCiv = SPANISH_TO_ENGLISH_CIVS[norm];
    } else if (typeof availability !== 'undefined' && availability.SPANISH_TO_ENGLISH_CIVS && availability.SPANISH_TO_ENGLISH_CIVS[norm]) {
      engCiv = availability.SPANISH_TO_ENGLISH_CIVS[norm];
    }
    return engCiv.toUpperCase();
  }

  /**
   * Carga data.json y strings.json en memoria si aún no están cargados
   */
  async function ensureDataLoaded() {
    if (!state.data) {
      if (typeof window !== 'undefined' && window.state && window.state.data) {
        state.data = window.state.data;
      } else if (typeof window !== 'undefined' && window.data) {
        state.data = window.data;
      } else {
        try {
          const res = await fetch('./data/data.json');
          state.data = await res.json();
        } catch (e) {
          console.warn('No se pudo cargar data.json directamente:', e);
        }
      }
    }

    if (!state.strings) {
      if (typeof window !== 'undefined' && window.state && window.state.strings) {
        state.strings = window.state.strings;
      } else if (typeof window !== 'undefined' && window.strings) {
        state.strings = window.strings;
      } else {
        try {
          const res = await fetch('./data/locales/es/strings.json').catch(() => fetch('./data/locales/es.json'));
          state.strings = await res.json();
        } catch (e) {
          console.warn('No se pudo cargar strings.json directamente:', e);
        }
      }
    }
  }

  /**
   * Carga el árbol JSON de la civilización activa
   */
  async function loadTreeData(civKey) {
    const treeFileKey = resolveTreeKey(civKey);
    if (state.cachedTrees[treeFileKey]) {
      return state.cachedTrees[treeFileKey];
    }

    try {
      const res = await fetch(`./data/trees/${treeFileKey}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      state.cachedTrees[treeFileKey] = json;
      return json;
    } catch (e) {
      console.error(`Error al cargar ./data/trees/${treeFileKey}.json:`, e);
      // Fallback a BRITONS si falla
      if (treeFileKey !== 'BRITONS') {
        return loadTreeData('britons');
      }
      return null;
    }
  }

  /**
   * Obtiene la cadena de descripción para una civilización
   */
  function getCivRawDescription(civId) {
    const norm = String(civId || 'britons').toLowerCase().trim();
    let strId = null;

    if (typeof CIV_STRING_MAP !== 'undefined' && CIV_STRING_MAP[norm]) {
      strId = CIV_STRING_MAP[norm];
    } else if (typeof window !== 'undefined' && window.CIV_STRING_MAP && window.CIV_STRING_MAP[norm]) {
      strId = window.CIV_STRING_MAP[norm];
    }

    if (!strId && state.data && state.data.civs) {
      const engCiv = resolveTreeKey(norm);
      const capCiv = engCiv.charAt(0) + engCiv.slice(1).toLowerCase();
      const civObj = state.data.civs[capCiv] || state.data.civs[engCiv] || state.data.civs[civId];
      if (civObj && civObj.help_string_id) {
        strId = String(civObj.help_string_id);
      }
    }

    if (strId && state.strings && state.strings[strId]) {
      return state.strings[strId];
    }
    return '';
  }

  /**
   * Renderiza el panel lateral de resumen de la civilización
   */
  function renderCivSidebar(civId) {
    const sidebarEl = document.getElementById('techtree-sidebar-content');
    if (!sidebarEl) return;

    const norm = String(civId || 'britons').toLowerCase().trim();
    const isGeneric = norm === 'generic' || norm === 'genérico' || norm === 'all';

    let civDisplayName = 'Genérico';
    let archetype = 'Árbol Tecnológico Completo';
    let bonuses = ['Visualización de todas las unidades, tecnologías y edificios sin restricciones.'];
    let uniqueUnits = ['Unidades estándar y regionales habilitadas'];
    let uniqueTechs = ['Todas las tecnologías disponibles'];
    let teamBonus = 'Explora la totalidad del árbol tecnológico de Age of Empires II.';

    // Resolver nombre legible
    if (typeof civilizationsModule !== 'undefined' && civilizationsModule.getCivById) {
      const cObj = civilizationsModule.getCivById(norm);
      if (cObj) civDisplayName = cObj.name;
    } else if (typeof CIVILIZATIONS !== 'undefined') {
      const cObj = CIVILIZATIONS.find(c => c.id === norm);
      if (cObj) civDisplayName = cObj.name;
    } else {
      civDisplayName = norm.charAt(0).toUpperCase() + norm.slice(1);
    }

    if (!isGeneric) {
      const rawString = getCivRawDescription(norm);
      let parserFn = null;
      if (typeof parseCivDescription === 'function') parserFn = parseCivDescription;
      else if (typeof window !== 'undefined' && typeof window.parseCivDescription === 'function') parserFn = window.parseCivDescription;

      if (parserFn && rawString) {
        const parsed = parserFn(rawString);
        if (parsed.archetype) archetype = parsed.archetype;
        if (parsed.bonuses && parsed.bonuses.length) bonuses = parsed.bonuses;
        if (parsed.uniqueUnits && parsed.uniqueUnits.length) uniqueUnits = parsed.uniqueUnits;
        if (parsed.uniqueTechs && parsed.uniqueTechs.length) uniqueTechs = parsed.uniqueTechs;
        if (parsed.teamBonus) teamBonus = parsed.teamBonus;
      }
    }

    // Ruta del escudo / emblema
    let emblemSrc = `./img/Civs/${norm}.png`;
    if (isGeneric) emblemSrc = './img/Civs/britons.png';

    sidebarEl.innerHTML = `
      <!-- Perfil de la Civilización -->
      <div class="techtree-civ-profile">
        <div class="techtree-civ-crest-frame">
          <img src="${emblemSrc}" alt="${civDisplayName}" class="techtree-civ-crest-img" onerror="this.src='./img/Civs/britons.png'">
        </div>
        <div class="techtree-civ-titles">
          <h3 class="techtree-civ-title">${civDisplayName}</h3>
          <span class="techtree-archetype-pill">${archetype}</span>
        </div>
      </div>

      <!-- Bonificaciones Pasivas -->
      <div class="techtree-section-card">
        <h4 class="techtree-section-title">⚔️ Bonificaciones</h4>
        <ul class="techtree-bonuses-list">
          ${bonuses.map(b => `
            <li class="techtree-bonus-item">
              <span class="techtree-bonus-bullet">◆</span>
              <span>${b}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Unidades Únicas -->
      <div class="techtree-section-card">
        <h4 class="techtree-section-title">🛡️ Unidades Únicas</h4>
        <div class="techtree-uu-list">
          ${uniqueUnits.map(uu => `
            <div class="techtree-meta-item">
              <strong>•</strong> ${uu}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tecnologías Únicas (Coronas) -->
      <div class="techtree-section-card">
        <h4 class="techtree-section-title">👑 Tecnologías Únicas</h4>
        <div class="techtree-ut-list">
          ${uniqueTechs.map((ut, idx) => `
            <div class="techtree-meta-item">
              <strong>${idx === 0 ? '👑 Castillos:' : '👑 Imperial:'}</strong> ${ut}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Bonificación de Equipo -->
      <div class="techtree-section-card team-card">
        <h4 class="techtree-section-title" style="color: #60a5fa; border-color: rgba(59, 130, 246, 0.4);">
          🤝 Bonificación de Equipo
        </h4>
        <p class="techtree-team-text">${teamBonus}</p>
      </div>
    `;
  }

  /**
   * Envoltorio tolerante a fallos: si la evaluación de disponibilidad lanza una excepción,
   * el nodo se considera disponible para no abortar el renderizado completo del árbol.
   */
  function isNodeAvailable(node, civId) {
    try {
      return isNodeAvailableUnsafe(node, civId);
    } catch (checkErr) {
      console.warn(`[TechTree] Fallo al evaluar availability para nodo ${node && node.use_type} ID ${node && node.node_id}:`, checkErr);
      return true;
    }
  }

  /**
   * Evalúa si un nodo está habilitado para la civilización activa
   */
  function isNodeAvailableUnsafe(node, civId) {
    const norm = String(civId || 'britons').toLowerCase().trim();
    if (norm === 'generic' || norm === 'genérico' || norm === 'all') return true;

    // Si en el archivo de árbol canónico está expresamente deshabilitado
    if (node.node_status === 'NotAvailable') return false;

    // Verificación contra availability.js
    // NOTA: availability.js hace buildingKey.toLowerCase(), por lo que el ID debe pasarse como string
    // (pasar un número lanzaba TypeError y congelaba el render en "Desplegando Árbol Tecnológico...").
    if (node.use_type === 'Building' || node.node_type === 'BuildingTech' || node.node_type === 'RegionalBuilding') {
      if (typeof isBuildingAvailableForCiv === 'function') {
        if (!isBuildingAvailableForCiv(String(node.node_id), norm)) return false;
      } else if (typeof window !== 'undefined' && typeof window.isBuildingAvailableForCiv === 'function') {
        if (!window.isBuildingAvailableForCiv(String(node.node_id), norm)) return false;
      }
    }

    if (node.node_type === 'Research' || node.node_type === 'Tech' || node.node_type === 'RegionalTech') {
      if (typeof isTechAvailableForCiv === 'function') {
        if (!isTechAvailableForCiv(norm, node.node_id)) return false;
      } else if (typeof window !== 'undefined' && typeof window.isTechAvailableForCiv === 'function') {
        if (!window.isTechAvailableForCiv(norm, node.node_id)) return false;
      }
    }

    // Verificación contra data.json civs
    if (state.data && state.data.civs) {
      const engCiv = resolveTreeKey(norm);
      const capCiv = engCiv.charAt(0) + engCiv.slice(1).toLowerCase();
      const civObj = state.data.civs[capCiv] || state.data.civs[engCiv] || state.data.civs[norm];
      if (civObj) {
        if (node.use_type === 'Building' && Array.isArray(civObj.Building)) {
          if (!civObj.Building.includes(node.node_id)) return false;
        }
        if (node.use_type === 'Unit' && Array.isArray(civObj.Unit)) {
          if (!civObj.Unit.includes(node.node_id)) return false;
        }
        if (node.use_type === 'Tech' && Array.isArray(civObj.Tech)) {
          if (!civObj.Tech.includes(node.node_id)) return false;
        }
      }
    }

    return true;
  }

  /**
   * Obtiene la ruta de imagen adecuada para un nodo del árbol
   */
  function getNodeImageSrc(node) {
    if (node.use_type === 'Building' || node.node_type === 'BuildingTech' || node.node_type === 'RegionalBuilding') {
      return `./img/Building/${node.picture_index}.png`;
    }
    if (node.id && node.id.startsWith('Tech_')) {
      return `./img/Tech/${node.picture_index}.png`;
    }
    if (node.id && node.id.startsWith('Unit_')) {
      return `./img/Unit/${node.picture_index}.png`;
    }
    if (['Research', 'Tech', 'RegionalTech', 'UniqueTech'].includes(node.node_type)) {
      return `./img/Tech/${node.picture_index}.png`;
    }
    return `./img/Unit/${node.picture_index}.png`;
  }

  /**
   * Obtiene el nombre traducido del nodo
   */
  function getNodeLocalizedName(node) {
    if (state.strings && node.name_string_id && state.strings[node.name_string_id]) {
      return state.strings[node.name_string_id];
    }
    return node.name || 'Desconocido';
  }

  /**
   * Dibuja los conectores SVG de dependencias (prerrequisitos)
   */
  function renderSvgConnectors(links, svgEl) {
    svgEl.innerHTML = '';
    const svgPaths = [];

    links.forEach(link => {
      const { x1, y1, x2, y2, isDisabled } = link;
      const midY = (y1 + y2) / 2;

      let d = '';
      if (Math.abs(x1 - x2) < 3) {
        // Línea vertical recta
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        // Curva suave ortogonal
        d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      }

      const cssClass = `techtree-link ${isDisabled ? 'link-disabled' : ''}`;
      svgPaths.push(`<path d="${d}" class="${cssClass}" />`);
    });

    svgEl.innerHTML = svgPaths.join('');
  }

  /**
   * Renderiza el lienzo completo del Tech Tree
   */
  /**
   * Renderiza el lienzo completo del Tech Tree con logging defensivo.
   * Cualquier excepción se registra en consola y se muestra en el viewport,
   * evitando que el placeholder "Desplegando Árbol Tecnológico..." quede congelado.
   */
  async function renderTreeCanvas(civId) {
    console.log(`[TechTree] Iniciando renderizado de árbol para: ${civId}`);
    try {
      await renderTreeCanvasUnsafe(civId);
      console.log(`[TechTree] Árbol renderizado con éxito para ${civId}`);
    } catch (err) {
      console.error('[TechTree Critical Error] Falló el despliegue del árbol:', err);
      const nodesLayerEl = document.getElementById('techtree-nodes-layer');
      if (nodesLayerEl) {
        nodesLayerEl.innerHTML = `<div style="color: #ff6b6b; font-weight: bold; padding: 40px;">Error al desplegar árbol: ${err && err.message ? err.message : err}</div>`;
      }
    }
  }

  async function renderTreeCanvasUnsafe(civId) {
    const canvasEl = document.getElementById('techtree-canvas');
    const nodesLayerEl = document.getElementById('techtree-nodes-layer');
    const svgLayerEl = document.getElementById('techtree-svg-layer');
    const bgLayersEl = document.getElementById('techtree-bg-layers');

    if (!canvasEl || !nodesLayerEl || !svgLayerEl) return;

    nodesLayerEl.innerHTML = '<div style="color: #ffd700; padding: 40px; font-size: 1.2rem;">⚔️ Desplegando Árbol Tecnológico...</div>';
    svgLayerEl.innerHTML = '';

    const treeData = await loadTreeData(civId);
    if (!treeData || !treeData.buildings) {
      nodesLayerEl.innerHTML = '<div style="color: #ef4444; padding: 40px;">Error al cargar datos del árbol.</div>';
      return;
    }

    // Mapa de unidades y tecnologías del árbol
    const unitTechMap = new Map();
    (treeData.units_techs || []).forEach(ut => unitTechMap.set(ut.id, ut));

    // Mapa de coordenadas de nodos para cálculo de conectores SVG
    // id -> { x, y, bottomY, topY, node, isDisabled }
    const nodeCoords = new Map();
    const linksToDraw = [];

    let xOffset = 0;
    const nodeElementsHtml = [];

    // Recorrido y colocación en cuadrícula de todos los bloques de edificios
    treeData.buildings.forEach(b => {
      const width = b.grid ? b.grid[0].length : 1;

      // 1. Colocar el Edificio en su fila (row = b.row)
      const bCol = xOffset;
      const bRow = b.row;
      const bLeft = METRICS.ageColWidth + bCol * METRICS.cellWidth + (METRICS.cellWidth - METRICS.nodeWidth) / 2;
      const bTop = METRICS.canvasPaddingY + bRow * METRICS.rowHeight + 8;
      const isBAvailable = isNodeAvailable(b, civId);

      const bName = getNodeLocalizedName(b);
      const bImg = getNodeImageSrc(b);
      const bKey = `Building_${b.node_id}`;

      nodeCoords.set(bKey, {
        centerX: bLeft + METRICS.nodeWidth / 2,
        topY: bTop,
        bottomY: bTop + METRICS.nodeHeight - 20,
        node: b,
        isDisabled: !isBAvailable
      });

      nodeElementsHtml.push(`
        <div class="techtree-node node-building ${isBAvailable ? '' : 'disabled'}"
             data-node-id="${b.node_id}"
             data-node-type="building"
             data-name="${bName.toLowerCase()}"
             style="left: ${bLeft}px; top: ${bTop}px;"
             tabindex="0"
             title="${bName}${isBAvailable ? '' : ' (Bloqueado)'}">
          <div class="node-icon-wrapper">
            <img src="${bImg}" alt="${bName}" class="node-icon" loading="lazy" onerror="this.src='./Building/0.png'">
            ${!isBAvailable ? '<div class="disabled-cross-badge">✕</div>' : ''}
          </div>
          <div class="node-name-label">${bName}</div>
        </div>
      `);

      // 2. Colocar Unidades y Tecnologías del grid de este edificio
      if (b.grid) {
        b.grid.forEach((rowArr, r) => {
          rowArr.forEach((cellId, c) => {
            if (!cellId) return;
            const ut = unitTechMap.get(cellId);
            if (!ut) return;

            const utCol = xOffset + c;
            const utRow = r;
            const utLeft = METRICS.ageColWidth + utCol * METRICS.cellWidth + (METRICS.cellWidth - METRICS.nodeWidth) / 2;
            const utTop = METRICS.canvasPaddingY + utRow * METRICS.rowHeight + 8;
            const isUtAvailable = isNodeAvailable(ut, civId);

            const utName = getNodeLocalizedName(ut);
            const utImg = getNodeImageSrc(ut);
            const isTech = cellId.startsWith('Tech_') || ['Research', 'Tech', 'RegionalTech', 'UniqueTech'].includes(ut.node_type);
            const isUnique = ut.node_type === 'UniqueTech' || ut.node_type === 'UniqueUnit';

            nodeCoords.set(cellId, {
              centerX: utLeft + METRICS.nodeWidth / 2,
              topY: utTop,
              bottomY: utTop + METRICS.nodeHeight - 20,
              node: ut,
              isDisabled: !isUtAvailable
            });

            nodeElementsHtml.push(`
              <div class="techtree-node ${isTech ? 'node-tech' : 'node-unit'} ${isUnique ? 'node-unique' : ''} ${isUtAvailable ? '' : 'disabled'}"
                   data-node-id="${ut.node_id}"
                   data-node-type="${isTech ? 'tech' : 'unit'}"
                   data-name="${utName.toLowerCase()}"
                   style="left: ${utLeft}px; top: ${utTop}px;"
                   tabindex="0"
                   title="${utName}${isUtAvailable ? '' : ' (Bloqueado)'}">
                <div class="node-icon-wrapper">
                  <img src="${utImg}" alt="${utName}" class="node-icon" loading="lazy" onerror="this.src='${isTech ? './img/Tech/0.png' : './img/Unit/1.png'}';">
                  ${!isUtAvailable ? '<div class="disabled-cross-badge">✕</div>' : ''}
                </div>
                <div class="node-name-label">${utName}</div>
              </div>
            `);
          });
        });
      }

      xOffset += width;
    });

    // Inyectar HTML de nodos
    nodesLayerEl.innerHTML = nodeElementsHtml.join('');

    // Ajustar dimensiones totales del canvas y capas
    const totalWidth = METRICS.ageColWidth + xOffset * METRICS.cellWidth + 60;
    const totalHeight = METRICS.canvasPaddingY + 8 * METRICS.rowHeight + 40;

    canvasEl.style.width = `${totalWidth}px`;
    canvasEl.style.height = `${totalHeight}px`;
    svgLayerEl.setAttribute('width', String(totalWidth));
    svgLayerEl.setAttribute('height', String(totalHeight));
    svgLayerEl.style.width = `${totalWidth}px`;
    svgLayerEl.style.height = `${totalHeight}px`;

    // 3. Generar líneas conectoras de prerrequisito (SVG Links)
    // Conexiones de Unidades y Tecnologías
    (treeData.units_techs || []).forEach(ut => {
      // Excluir Horse Collar (14): raíz tecnológica agrícola del Molino, sin prerrequisito tecnológico
      if (ut.node_id === 14) return;

      if (ut.link_id !== null && ut.link_id !== undefined && ut.link_id !== -1) {
        const childCoord = nodeCoords.get(ut.id);
        if (!childCoord) return;

        // Buscar nodo padre en units_techs del MISMO edificio únicamente (evita colisiones cruzadas entre edificios)
        const parentUt = (treeData.units_techs || []).find(p => p.node_id === ut.link_id && p.building_id === ut.building_id);

        let parentCoord = parentUt ? nodeCoords.get(parentUt.id) : null;
        if (!parentCoord && ut.link_id === ut.building_id) {
          // Si el link_id corresponde al edificio contenedor directo (ej. mejoras de edificio)
          parentCoord = nodeCoords.get(`Building_${ut.link_id}`);
        }

        if (parentCoord) {
          linksToDraw.push({
            x1: parentCoord.centerX,
            y1: parentCoord.bottomY,
            x2: childCoord.centerX,
            y2: childCoord.topY,
            isDisabled: childCoord.isDisabled || parentCoord.isDisabled
          });
        }
      }
    });

    // Conexiones de Edificios
    treeData.buildings.forEach(b => {
      // Reglas canónicas del motor Genie:
      // 1. Puesto de avanzada (598) es un nodo huérfano de visión sin descendencia.
      // 2. Torre de guardia (79) es la raíz de su línea de torres en Edad Feudal; no depende de Outpost (598).
      // 3. Universidad (209) es la raíz académica independiente en Edad de los Castillos; no depende de Granja (50) ni Molino (68).
      if (b.node_id === 598) return;
      if (b.node_id === 79 && b.link_id === 598) return;
      if (b.node_id === 209 && (b.link_id === 50 || b.link_id === 68)) return;

      if (b.link_id !== null && b.link_id !== undefined && b.link_id !== -1) {
        const childCoord = nodeCoords.get(`Building_${b.node_id}`);
        const parentCoord = nodeCoords.get(`Building_${b.link_id}`);
        if (childCoord && parentCoord) {
          linksToDraw.push({
            x1: parentCoord.centerX,
            y1: parentCoord.bottomY,
            x2: childCoord.centerX,
            y2: childCoord.topY,
            isDisabled: childCoord.isDisabled || parentCoord.isDisabled
          });
        }
      }
    });

    renderSvgConnectors(linksToDraw, svgLayerEl);

    // 4. Asignar Eventos de Clic en Nodos para abrir Modales Técnicos Deep Dive
    attachNodeClickEvents(nodesLayerEl, civId);
  }

  /**
   * Conecta los clics de cada nodo con su respectivo modal técnico
   */
  function attachNodeClickEvents(container, civId) {
    container.querySelectorAll('.techtree-node').forEach(nodeEl => {
      nodeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = Number(nodeEl.dataset.nodeId);
        const nodeType = nodeEl.dataset.nodeType;

        if (nodeType === 'building') {
          if (typeof openBuildingDeepDive === 'function') {
            openBuildingDeepDive(nodeId, civId);
          } else if (typeof window !== 'undefined' && typeof window.openBuildingDeepDive === 'function') {
            window.openBuildingDeepDive(nodeId, civId);
          }
        } else if (nodeType === 'unit') {
          if (typeof openUnitDeepDive === 'function') {
            openUnitDeepDive(nodeId, civId);
          } else if (typeof window !== 'undefined' && typeof window.openUnitDeepDive === 'function') {
            window.openUnitDeepDive(nodeId, civId);
          }
        } else if (nodeType === 'tech') {
          if (typeof openTechDeepDive === 'function') {
            openTechDeepDive(nodeId, civId);
          } else if (typeof window !== 'undefined' && typeof window.openTechDeepDive === 'function') {
            window.openTechDeepDive(nodeId, civId);
          }
        }
      });
    });
  }

  /**
   * Configura arrastre con el ratón (Pan) y zoom en el lienzo
   */
  function setupPanAndZoom(canvasWrapper, canvasEl) {
    if (!canvasWrapper || !canvasEl) return;

    // Pan con arrastre
    canvasWrapper.addEventListener('mousedown', (e) => {
      // Ignorar clics dentro de nodos
      if (e.target.closest('.techtree-node') || e.target.closest('.techtree-age-column')) return;
      state.isDragging = true;
      canvasWrapper.classList.add('is-dragging');
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.scrollStart = { x: canvasWrapper.scrollLeft, y: canvasWrapper.scrollTop };
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      canvasWrapper.scrollLeft = state.scrollStart.x - dx;
      canvasWrapper.scrollTop = state.scrollStart.y - dy;
    });

    window.addEventListener('mouseup', () => {
      if (state.isDragging) {
        state.isDragging = false;
        canvasWrapper.classList.remove('is-dragging');
      }
    });

    // Control de Zoom
    const applyZoom = (newZoom) => {
      state.zoomLevel = Math.max(0.6, Math.min(1.3, newZoom));
      canvasEl.style.transform = `scale(${state.zoomLevel})`;
      const zoomValEl = document.getElementById('techtree-zoom-value');
      if (zoomValEl) {
        zoomValEl.textContent = `${Math.round(state.zoomLevel * 100)}%`;
      }
    };

    const zoomInBtn = document.getElementById('techtree-zoom-in');
    const zoomOutBtn = document.getElementById('techtree-zoom-out');
    const zoomResetBtn = document.getElementById('techtree-zoom-reset');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => applyZoom(state.zoomLevel + 0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => applyZoom(state.zoomLevel - 0.1));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => applyZoom(1.0));
  }

  /**
   * Configura el filtrado en tiempo real en el lienzo
   */
  function setupSearchFilter() {
    const searchInput = document.getElementById('techtree-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const q = String(e.target.value || '').trim().toLowerCase();
      state.searchQuery = q;

      const nodes = document.querySelectorAll('.techtree-node');
      if (!q) {
        nodes.forEach(n => {
          n.classList.remove('highlighted', 'dimmed');
        });
        return;
      }

      nodes.forEach(n => {
        const name = n.dataset.name || '';
        if (name.includes(q)) {
          n.classList.add('highlighted');
          n.classList.remove('dimmed');
        } else {
          n.classList.remove('highlighted');
          n.classList.add('dimmed');
        }
      });
    });
  }

  /**
   * Configura los botones de salto rápido a ramas
   */
  function setupQuickJump(canvasWrapper) {
    document.querySelectorAll('[data-jump-branch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const branchKey = btn.dataset.jumpBranch;
        const colIndex = BRANCH_OFFSETS[branchKey];
        if (typeof colIndex === 'number' && canvasWrapper) {
          const targetX = colIndex * METRICS.cellWidth * state.zoomLevel;
          canvasWrapper.scrollTo({ left: targetX, behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Puebla el selector de civilizaciones
   */
  function populateCivDropdown(selectEl, selectedCiv) {
    if (!selectEl) return;
    selectEl.innerHTML = '';

    let civList = [];
    if (typeof civilizationsModule !== 'undefined' && civilizationsModule.CIVILIZATIONS) {
      civList = civilizationsModule.CIVILIZATIONS;
    } else if (typeof CIVILIZATIONS !== 'undefined') {
      civList = CIVILIZATIONS;
    }

    if (!civList.length) {
      // Fallback a lista básica
      civList = [
        { id: 'generic', name: 'Genérico' },
        { id: 'britons', name: 'Britanos' },
        { id: 'franks', name: 'Francos' }
      ];
    }

    civList.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === selectedCiv) opt.selected = true;
      selectEl.appendChild(opt);
    });

    selectEl.addEventListener('change', (e) => {
      openTechTree(e.target.value);
    });
  }

  /**
   * Inicializa o renderiza el árbol tecnológico para una civilización dada
   */
  async function openTechTree(civId = 'britons') {
    state.currentCiv = civId || 'britons';
    await ensureDataLoaded();

    const selectEl = document.getElementById('techtree-civ-select');
    if (selectEl) {
      selectEl.value = state.currentCiv;
    }

    // 1. Actualizar panel lateral izquierdo
    renderCivSidebar(state.currentCiv);

    // 2. Renderizar cuadrícula canónica del árbol
    await renderTreeCanvas(state.currentCiv);
  }

  /**
   * Inicializa completamente el módulo del Tech Tree en el DOM
   */
  async function initTechTree(initialCiv = 'britons') {
    await ensureDataLoaded();

    const canvasWrapper = document.getElementById('techtree-canvas-wrapper');
    const canvasEl = document.getElementById('techtree-canvas');
    const selectEl = document.getElementById('techtree-civ-select');

    populateCivDropdown(selectEl, initialCiv);
    setupPanAndZoom(canvasWrapper, canvasEl);
    setupSearchFilter();
    setupQuickJump(canvasWrapper);

    await openTechTree(initialCiv);
  }

  return {
    state,
    resolveTreeKey,
    parseCivDescription: typeof parseCivDescription === 'function' ? parseCivDescription : null,
    renderCivSidebar,
    renderTreeCanvas,
    openTechTree,
    initTechTree
  };
});
