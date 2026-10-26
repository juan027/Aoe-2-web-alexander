/**
 * APP.JS - Age of Empires II Database & Competitive Calculator
 * SiegeEngineers/aoe2techtree Schema Implementation
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTES DEL MOTOR AOE2 & DICCIONARIOS COMPETITIVOS
  // =========================================================================

  // Mapeo precalculado de edades por ID de unidad (Genie Engine / aoe2techtree)
  // 1: Alta Edad Media (Dark), 2: Edad Feudal, 3: Edad de los Castillos, 4: Edad Imperial
  const UNIT_AGE_MAP = {
    "4":2,"5":4,"6":3,"7":2,"8":3,"11":3,"13":1,"17":2,"21":3,"24":3,"25":3,"36":4,"38":3,"39":3,"40":3,"41":3,"42":4,"46":3,"73":3,"74":1,"75":2,"77":3,"83":1,"93":2,"125":3,"128":2,"185":3,"207":4,"232":3,"239":3,"250":3,"279":3,"280":3,"281":3,"282":3,"283":4,"291":3,"329":3,"330":4,"331":4,"358":3,"359":4,"420":4,"422":4,"440":3,"441":4,"442":4,"448":2,"473":4,"474":4,"492":4,"527":3,"528":4,"529":3,"530":4,"531":4,"532":4,"533":4,"534":4,"539":2,"542":4,"545":1,"546":3,"548":4,"550":4,"553":4,"554":4,"555":4,"556":4,"557":4,"558":4,"559":4,"560":4,"561":4,"567":4,"569":4,"588":4,"691":4,"692":3,"694":4,"725":3,"726":4,"751":2,"752":4,"753":3,"755":3,"757":4,"759":3,"761":4,"763":3,"765":4,"771":3,"773":4,"775":3,"827":3,"829":4,"831":3,"832":4,"866":3,"868":4,"869":3,"871":4,"873":3,"875":4,"876":3,"878":4,"879":3,"881":4,"882":4,"886":3,"887":4,"1001":3,"1003":4,"1004":3,"1006":4,"1007":3,"1009":4,"1010":3,"1012":4,"1013":3,"1015":4,"1016":3,"1018":4,"1103":2,"1104":2,"1105":3,"1120":3,"1122":4,"1123":3,"1125":4,"1126":3,"1128":4,"1129":3,"1131":4,"1132":3,"1134":4,"1155":4,"1225":3,"1227":4,"1228":3,"1230":4,"1231":3,"1233":4,"1234":3,"1236":4,"1252":3,"1253":4,"1254":3,"1255":4,"1258":3,"1260":4,"1263":4,"1302":4,"1370":3,"1372":4,"1570":3,"1655":3,"1657":4,"1658":3,"1659":4,"1660":2,"1661":4,"1699":2,"1701":3,"1703":4,"1704":3,"1706":4,"1707":4,"1709":4,"1735":3,"1737":4,"1738":3,"1740":4,"1741":3,"1743":4,"1744":3,"1746":4,"1747":3,"1749":4,"1750":4,"1751":3,"1753":4,"1755":2,"1759":3,"1761":4,"1786":2,"1787":3,"1788":4,"1790":3,"1792":4,"1793":4,"1795":4,"1800":3,"1802":4,"1803":3,"1805":4,"1811":3,"1813":4,"1901":3,"1903":4,"1904":3,"1907":4,"1908":3,"1910":4,"1911":3,"1920":3,"1922":4,"1923":4,"1942":4,"1944":3,"1946":4,"1948":4,"1949":3,"1951":4,"1952":3,"1954":4,"1959":3,"1961":4,"1962":3,"1966":4,"1968":3,"1970":4,"1974":3,"1978":4,"1980":3,"2550":1,"2552":3,"2554":4,"2562":3,"2564":4,"2566":3,"2568":4,"2569":3,"2571":4,"2579":3,"2581":4,"2582":3,"2584":4,"2586":3,"2587":4,"2588":2,"2626":2,"2627":3,"2628":4,"2633":4,"2700":3,"2701":4,"2703":3,"2704":4,"2705":3,"2706":4,"2708":3,"2709":4,"2711":3,"2712":4
  };

  const AGE_NAMES = {
    1: { name: 'Alta Edad Media', short: 'Dark', color: '#7a6652' },
    2: { name: 'Edad Feudal', short: 'Feudal', color: '#3b7a42' },
    3: { name: 'Edad de los Castillos', short: 'Castillos', color: '#29689e' },
    4: { name: 'Edad Imperial', short: 'Imperial', color: '#9c2222' }
  };

  // Diccionario canónico de Clases de Armadura del motor de Age of Empires II
  const ARMOUR_CLASSES = {
    1: { name: 'Infantería', desc: 'Vulnerable a proyectiles y unidades anti-infantería como Catapultas y Jaguares.' },
    2: { name: 'Lanceros / Piqueros', desc: 'Vulnerable a bonificaciones específicas contra lanceros.' },
    3: { name: 'Armadura Proyectil Base', desc: 'Armadura base contra ataques a distancia (Pierce).' },
    4: { name: 'Armadura Melee Base', desc: 'Armadura base cuerpo a cuerpo.' },
    5: { name: 'Elefantes de Guerra', desc: 'Vulnerable a ataques masivos anti-elefante.' },
    8: { name: 'Caballería', desc: 'Vulnerable a piqueros, camellos y jinetes de bonificación.' },
    11: { name: 'Todos los Edificios', desc: 'Vulnerable a armas de asedio y unidades de demolición.' },
    13: { name: 'Defensas de Piedra', desc: 'Muros, torres de piedra y castillos.' },
    14: { name: 'Animales Depredadores', desc: 'Lobos, osos y fauna agresiva.' },
    15: { name: 'Arqueros', desc: 'Vulnerable a guerrilleros, caballería y mangoneles.' },
    16: { name: 'Barcos / Naves', desc: 'Vulnerable a barcos incendiarios y daño anti-naval.' },
    17: { name: 'Arietes', desc: 'Alta absorción de proyectiles pero débil a daño cuerpo a cuerpo.' },
    18: { name: 'Árboles', desc: 'Obstáculos forestales.' },
    19: { name: 'Unidades Únicas', desc: 'Vulnerable a unidades como el Samurái japonés.' },
    20: { name: 'Armas de Asedio', desc: 'Vulnerable a caballería ligera, águilas y daño concentrado.' },
    21: { name: 'Edificios Estándar', desc: 'Estructuras de madera comunes.' },
    22: { name: 'Muros y Puertas', desc: 'Fortificaciones perimetrales.' },
    23: { name: 'Unidades de Pólvora', desc: 'Vulnerable a tropas rápidas como el Condottiero italiano.' },
    25: { name: 'Monjes', desc: 'Vulnerable a caballería ligera y águilas.' },
    26: { name: 'Castillos', desc: 'Fortalezas imperiales de piedra.' },
    27: { name: 'Lanceros (Especial)', desc: 'Clase receptora de bonus específicos contra piqueros.' },
    28: { name: 'Arqueros a Caballo', desc: 'Vulnerable a guerrilleros y bonificaciones anti-caballería.' },
    29: { name: 'Guerreros Águila', desc: 'Vulnerable a espadachines y unidades anti-águila.' },
    30: { name: 'Camellos', desc: 'Vulnerable a piqueros y bonificaciones anti-camello.' },
    31: { name: 'Armadura Leitis', desc: 'Regla del motor: ataques de Leitis ignoran armaduras ordinarias.' },
    32: { name: 'Condottiero', desc: 'Infantería de asalto anti-pólvora.' },
    34: { name: 'Barcos Pesqueros', desc: 'Embarcaciones de recolección marina.' },
    35: { name: 'Mamelucos', desc: 'Caballería única con daño cuerpo a cuerpo a distancia.' },
    36: { name: 'Héroes y Reyes', desc: 'Unidades inmunes a conversión en campañas y regicida.' },
    37: { name: 'Carretas Husitas', desc: 'Escudos rodantes con absorción de proyectiles.' },
    38: { name: 'Dromones', desc: 'Unidades de artillería naval pesada.' },
    39: { name: 'Carros de Guerra', desc: 'Carros pesados de combate.' },
    41: { name: 'Jinetes Shrivamsha', desc: 'Escudo especial contra proyectiles.' },
    60: { name: 'Buques de Asedio', desc: 'Naves pesadas de demolición marítima.' }
  };

  // =========================================================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // =========================================================================
  const state = {
    data: null,
    strings: {},
    civBonuses: {},
    unitsList: [],
    civsList: [],
    selectedCiv: 'all',
    selectedAge: 'all',
    searchQuery: '',
    hideDisabled: false,
    selectedUnitId: null,
    selectedBuildingCat: 'all',
    selectedBuildingAge: 'all',
    selectedBuildingCiv: 'all',
    buildingSearchQuery: '',
    currentView: 'main-menu', // 'main-menu' | 'units' | 'duel' | 'buildings'
    duelInitialized: false,
    lastUnitDomain: { a: null, b: null }
  };

  // Elementos DOM
  const DOM = {
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingStatus: document.getElementById('loading-status'),
    mainMenuView: document.getElementById('main-menu-view'),
    unitsView: document.getElementById('units-view'),
    navHomeBtn: document.getElementById('nav-home-btn'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    unitsGrid: document.getElementById('units-grid'),
    noResultsMsg: document.getElementById('no-results-msg'),
    unitsCountDisplay: document.getElementById('units-count-display'),
    searchInput: document.getElementById('unit-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    civSelect: document.getElementById('civ-select'),
    ageButtons: document.querySelectorAll('.age-btn'),
    hideDisabledCheckbox: document.getElementById('hide-disabled-units'),
    inspectorPanel: document.getElementById('inspector-panel'),
    inspectorContent: document.getElementById('inspector-content'),
    closeInspectorMobile: document.getElementById('close-inspector-mobile'),
    modal: document.getElementById('medieval-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalOkBtn: document.getElementById('modal-ok-btn'),

    // Vista Catálogo de Edificios
    buildingsView: document.getElementById('buildings-view'),
    buildingsBackBtn: document.getElementById('buildings-back-to-menu-btn'),
    buildingSearchInput: document.getElementById('building-search-input'),
    clearBuildingSearchBtn: document.getElementById('clear-building-search-btn'),
    buildingCivSelect: document.getElementById('building-civ-select-catalog'),
    buildingCatButtons: document.querySelectorAll('.building-cat-btn'),
    buildingAgeButtons: document.querySelectorAll('.building-age-btn'),
    buildingsCountDisplay: document.getElementById('buildings-count-display'),
    buildingsGrid: document.getElementById('buildings-grid'),
    noBuildingsMsg: document.getElementById('no-buildings-msg'),

    // Vista Catálogo de Tecnologías
    techsView: document.getElementById('techs-view'),
    techsBackBtn: document.getElementById('techs-back-to-menu-btn'),

    // Vista Árbol de Tecnologías (Tech Tree)
    techtreeView: document.getElementById('techtree-view'),
    techtreeBackBtn: document.getElementById('techtree-back-to-menu-btn'),

    // Vista Calculadora Económica
    ecoView: document.getElementById('eco-view'),

    // Vista Duelo 1 vs 1
    duelView: document.getElementById('duel-view'),
    duelBackBtn: document.getElementById('duel-back-to-menu-btn'),
    btnSimulateDuel: document.getElementById('btn-simulate-duel'),
    btnToggleLog: document.getElementById('btn-toggle-log'),
    combatLogStream: document.getElementById('combat-log-stream'),
    victoryBanner: document.getElementById('victory-banner'),
    victoryTitle: document.getElementById('victory-title'),
    victoryMeta: document.getElementById('victory-meta'),
    thNameA: document.getElementById('th-name-a'),
    thNameB: document.getElementById('th-name-b'),
    resFirstA: document.getElementById('res-first-a'),
    resFirstB: document.getElementById('res-first-b'),
    resRegularA: document.getElementById('res-regular-a'),
    resRegularB: document.getElementById('res-regular-b'),
    resReloadA: document.getElementById('res-reload-a'),
    resReloadB: document.getElementById('res-reload-b'),
    resDpsA: document.getElementById('res-dps-a'),
    resDpsB: document.getElementById('res-dps-b'),
    resHtkA: document.getElementById('res-htk-a'),
    resHtkB: document.getElementById('res-htk-b'),
    resTtkA: document.getElementById('res-ttk-a'),
    resTtkB: document.getElementById('res-ttk-b'),
    resHitsA: document.getElementById('res-hits-a'),
    resHitsB: document.getElementById('res-hits-b'),
    resHpA: document.getElementById('res-hp-a'),
    resHpB: document.getElementById('res-hp-b'),
    metricHtk: document.getElementById('metric-htk'),
    metricTtk: document.getElementById('metric-ttk'),
    metricHtkA: document.getElementById('metric-htk-a'),
    metricHtkB: document.getElementById('metric-htk-b'),
    metricTtkA: document.getElementById('metric-ttk-a'),
    metricTtkB: document.getElementById('metric-ttk-b'),
    metricDuration: document.getElementById('metric-duration'),
    metricEfficiency: document.getElementById('metric-efficiency'),
    resourceEfficiencyDetail: document.getElementById('resource-efficiency-detail'),

    // Combatiente A
    combatantCostA: document.getElementById('combatant-cost-azul'),
    combatantCostAzul: document.getElementById('combatant-cost-azul'),
    duelCivA: document.getElementById('duel-civ-a'),
    duelAgeA: document.getElementById('duel-age-a'),
    duelUnitA: document.getElementById('duel-unit-a'),
    duelImgA: document.getElementById('duel-img-a'),
    duelImgFallbackA: document.getElementById('duel-img-fallback-a'),
    duelNameA: document.getElementById('duel-name-a'),
    duelMetaA: document.getElementById('duel-meta-a'),
    duelHpTextA: document.getElementById('duel-hp-text-a'),
    duelHpFillA: document.getElementById('duel-hp-fill-a'),
    duelHpBarTextA: document.getElementById('duel-hp-bar-text-a'),
    duelStatAtkA: document.getElementById('duel-stat-atk-a'),
    duelStatMeleeA: document.getElementById('duel-stat-melee-a'),
    duelStatPierceA: document.getElementById('duel-stat-pierce-a'),
    duelStatReloadA: document.getElementById('duel-stat-reload-a'),
    duelStatRangeA: document.getElementById('duel-stat-range-a'),
    duelStatSpeedA: document.getElementById('duel-stat-speed-a'),
    duelElevA: document.getElementById('duel-elev-a'),
    duelStacksA: document.getElementById('duel-stacks-a'),
    duelStacksValA: document.getElementById('duel-stacks-val-a'),
    duelStacksMetaA: document.getElementById('duel-stacks-meta-a'),
    blacksmithUpgradesContainerA: document.getElementById('blacksmith-upgrades-container-a'),
    landUpgradesContainerA: document.getElementById('land-upgrades-container-a'),
    navalUpgradesContainerA: document.getElementById('naval-upgrades-container-a'),
    duelSmithMeleeRowA: document.getElementById('duel-smith-melee-row-a'),
    duelSmithPierceRowA: document.getElementById('duel-smith-pierce-row-a'),
    duelArmorRowA: document.getElementById('duel-armor-row-a'),
    duelArmorCavRowA: document.getElementById('duel-armor-cav-row-a'),
    duelArmorArchRowA: document.getElementById('duel-armor-arch-row-a'),
    duelSmithMeleeA: document.getElementById('duel-smith-melee-a'),
    duelSmithPierceA: document.getElementById('duel-smith-pierce-a'),
    duelArmorA: document.getElementById('duel-armor-a'),
    duelArmorCavA: document.getElementById('duel-armor-cav-a'),
    duelArmorArchA: document.getElementById('duel-armor-arch-a'),
    duelBloodlinesA: document.getElementById('duel-bloodlines-a'),
    duelBloodlinesLabelA: document.getElementById('duel-bloodlines-label-a'),
    duelHusbandryA: document.getElementById('duel-husbandry-a'),
    duelSquiresA: document.getElementById('duel-squires-a'),
    duelGambesonsA: document.getElementById('duel-gambesons-a'),
    duelGambesonsLabelA: document.getElementById('duel-gambesons-label-a'),
    duelGambesonsChipA: document.getElementById('duel-gambesons-chip-a'),
    duelThumbRingA: document.getElementById('duel-thumb-ring-a'),
    duelParthianA: document.getElementById('duel-parthian-a'),
    duelCranequinsA: document.getElementById('duel-cranequins-a'),
    duelChemistryA: document.getElementById('duel-chemistry-a'),
    duelCenturionA: document.getElementById('duel-centurion-a'),
    duelCareeningA: document.getElementById('duel-careening-a'),
    duelDryDockA: document.getElementById('duel-dry-dock-a'),
    duelClinkerA: document.getElementById('duel-clinker-a'),
    duelCarvelA: document.getElementById('duel-carvel-a'),
    duelBallisticsA: document.getElementById('duel-ballistics-a'),
    duelNavalChemistryA: document.getElementById('duel-naval-chemistry-a'),
    duelSiphonsA: document.getElementById('duel-siphons-a'),
    uniqueTechsContainerA: document.getElementById('unique-techs-container'),

    // Combatiente B
    combatantCostB: document.getElementById('combatant-cost-rojo'),
    combatantCostRojo: document.getElementById('combatant-cost-rojo'),
    duelCivB: document.getElementById('duel-civ-b'),
    duelAgeB: document.getElementById('duel-age-b'),
    duelUnitB: document.getElementById('duel-unit-b'),
    duelImgB: document.getElementById('duel-img-b'),
    duelImgFallbackB: document.getElementById('duel-img-fallback-b'),
    duelNameB: document.getElementById('duel-name-b'),
    duelMetaB: document.getElementById('duel-meta-b'),
    duelHpTextB: document.getElementById('duel-hp-text-b'),
    duelHpFillB: document.getElementById('duel-hp-fill-b'),
    duelHpBarTextB: document.getElementById('duel-hp-bar-text-b'),
    duelStatAtkB: document.getElementById('duel-stat-atk-b'),
    duelStatMeleeB: document.getElementById('duel-stat-melee-b'),
    duelStatPierceB: document.getElementById('duel-stat-pierce-b'),
    duelStatReloadB: document.getElementById('duel-stat-reload-b'),
    duelStatRangeB: document.getElementById('duel-stat-range-b'),
    duelStatSpeedB: document.getElementById('duel-stat-speed-b'),
    duelElevB: document.getElementById('duel-elev-b'),
    duelStacksB: document.getElementById('duel-stacks-b'),
    duelStacksValB: document.getElementById('duel-stacks-val-b'),
    duelStacksMetaB: document.getElementById('duel-stacks-meta-b'),
    blacksmithUpgradesContainerB: document.getElementById('blacksmith-upgrades-container-b'),
    landUpgradesContainerB: document.getElementById('land-upgrades-container-b'),
    navalUpgradesContainerB: document.getElementById('naval-upgrades-container-b'),
    duelSmithMeleeRowB: document.getElementById('duel-smith-melee-row-b'),
    duelSmithPierceRowB: document.getElementById('duel-smith-pierce-row-b'),
    duelArmorRowB: document.getElementById('duel-armor-row-b'),
    duelArmorCavRowB: document.getElementById('duel-armor-cav-row-b'),
    duelArmorArchRowB: document.getElementById('duel-armor-arch-row-b'),
    duelSmithMeleeB: document.getElementById('duel-smith-melee-b'),
    duelSmithPierceB: document.getElementById('duel-smith-pierce-b'),
    duelArmorB: document.getElementById('duel-armor-b'),
    duelArmorCavB: document.getElementById('duel-armor-cav-b'),
    duelArmorArchB: document.getElementById('duel-armor-arch-b'),
    duelBloodlinesB: document.getElementById('duel-bloodlines-b'),
    duelBloodlinesLabelB: document.getElementById('duel-bloodlines-label-b'),
    duelHusbandryB: document.getElementById('duel-husbandry-b'),
    duelSquiresB: document.getElementById('duel-squires-b'),
    duelGambesonsB: document.getElementById('duel-gambesons-b'),
    duelGambesonsLabelB: document.getElementById('duel-gambesons-label-b'),
    duelGambesonsChipB: document.getElementById('duel-gambesons-chip-b'),
    duelThumbRingB: document.getElementById('duel-thumb-ring-b'),
    duelParthianB: document.getElementById('duel-parthian-b'),
    duelCranequinsB: document.getElementById('duel-cranequins-b'),
    duelChemistryB: document.getElementById('duel-chemistry-b'),
    duelCenturionB: document.getElementById('duel-centurion-b'),
    duelCareeningB: document.getElementById('duel-careening-b'),
    duelDryDockB: document.getElementById('duel-dry-dock-b'),
    duelClinkerB: document.getElementById('duel-clinker-b'),
    duelCarvelB: document.getElementById('duel-carvel-b'),
    duelBallisticsB: document.getElementById('duel-ballistics-b'),
    duelNavalChemistryB: document.getElementById('duel-naval-chemistry-b'),
    duelSiphonsB: document.getElementById('duel-siphons-b'),
    uniqueTechsContainerB: document.getElementById('unique-techs-container-b')
  };

  // =========================================================================
  // CARGA ASÍNCRONA DE DATOS
  // =========================================================================
  async function initializeApp() {
    try {
      updateLoadingStatus('Cargando base de datos de unidades y civilizaciones...');

      // Carga asíncrona de data.json, locales/es.json y civ_bonuses.json en memoria
      const [dataRes, stringsRes, civBonusesRes] = await Promise.all([
        fetch('./data/data.json'),
        fetch('./data/locales/es.json').catch(() => fetch('./data/locales/es/strings.json')),
        fetch('./data/civ_bonuses.json').catch(() => null)
      ]);

      if (!dataRes.ok) throw new Error(`Error al leer ./data/data.json: HTTP ${dataRes.status}`);
      if (!stringsRes.ok) throw new Error(`Error al leer ./data/locales/es.json: HTTP ${stringsRes.status}`);

      state.data = await dataRes.json();
      state.strings = await stringsRes.json();
      if (civBonusesRes && civBonusesRes.ok) {
        state.civBonuses = await civBonusesRes.json();
        if (state.civBonuses['Jurchens']) {
          state.civBonuses['Yurchen'] = state.civBonuses['Jurchens'];
          state.civBonuses['Yurchens'] = state.civBonuses['Jurchens'];
          state.civBonuses['Jurchen'] = state.civBonuses['Jurchens'];
        }
      }

      updateLoadingStatus('Indexando unidades y preparando compatibilidad de civilizaciones...');

      // Inicializar Fuente Única de Verdad (SSOT) de unidades
      if (window.unitService && typeof window.unitService.initUnitService === 'function') {
        window.unitService.initUnitService(state.data, state.strings);
      }

      processData();
      populateCivDropdown();
      initDuelArena();
      bindEvents();
      renderUnits();

      window.state = state;

      // Inicializar catálogo dinámico de tecnologías
      if (window.techCatalog && typeof window.techCatalog.initTechCatalog === 'function') {
        window.techCatalog.initTechCatalog(state.data, state.strings);
      }

      // Ocultar pantalla de carga
      DOM.loadingOverlay.classList.add('hidden');
      setTimeout(() => {
        DOM.loadingOverlay.style.display = 'none';
      }, 400);

    } catch (err) {
      console.error('Error inicializando la aplicación:', err);
      if (DOM.loadingStatus) {
        DOM.loadingStatus.innerHTML = `<span style="color:#e74c3c">Error al cargar datos:</span> ${err.message}`;
      }
    }
  }

  function updateLoadingStatus(msg) {
    if (DOM.loadingStatus) DOM.loadingStatus.textContent = msg;
  }

  // =========================================================================
  // PROCESAMIENTO E INDEXACIÓN EN MEMORIA
  // =========================================================================
  function processData() {
    const rawUnits = state.data.data.Unit;
    const allUnitIds = Object.keys(rawUnits).map(Number);

    // 1. Asegurar compatibilidad estricta con el esquema de civilizaciones:
    // Poblar el bloque disabled.units para cada civ leyendo los IDs que no están en civ.Unit
    for (const civKey in state.data.civs) {
      const civ = state.data.civs[civKey];
      if (!civ.disabled) civ.disabled = {};
      if (!civ.disabled.units) {
        const enabledUnits = new Set(civ.Unit || []);
        civ.disabled.units = allUnitIds.filter(id => !enabledUnits.has(id));
      }
    }

    // 2. Indexar array de unidades con sus nombres resueltos, edades y metadata
    state.unitsList = Object.entries(rawUnits).map(([idStr, u]) => {
      const id = Number(idStr);
      const name = resolveUnitName(u);
      const description = resolveUnitDescription(u);
      const age = UNIT_AGE_MAP[id] || 3; // Por defecto Castillos si no estuviese mapeado
      
      return {
        ...u,
        ID: id,
        localizedName: name,
        description: description,
        age: age
      };
    });

    // Ordenar alfabéticamente por nombre en español
    state.unitsList.sort((a, b) => a.localizedName.localeCompare(b.localizedName, 'es'));

    // 3. Sincronizar punteros de iconos nativos (IconID) de data.json hacia BUILDING_REGISTRY
    if (state.data?.data?.Building) {
      const reg = (typeof BUILDING_REGISTRY !== 'undefined') ? BUILDING_REGISTRY : (window.BUILDING_REGISTRY || {});
      Object.values(reg).forEach(b => {
        const rawBuilding = state.data.data.Building[b.id] || state.data.data.Building[String(b.id)];
        if (rawBuilding) {
          if (rawBuilding.IconID !== undefined) b.IconID = rawBuilding.IconID;
          if (rawBuilding.icon !== undefined) b.icon = rawBuilding.icon;
          if (rawBuilding.GraphicID !== undefined) b.GraphicID = rawBuilding.GraphicID;
        }
        b.image = getBuildingIcon(b);
      });
    }
  }

  // Resuelve la imagen utilizando prioritariamente VILLAGER_BUILD_ICONS
  function getBuildingIcon(building) {
    if (typeof window !== 'undefined' && window.AoE2Buildings?.getBuildingIcon && window.AoE2Buildings.getBuildingIcon !== getBuildingIcon) {
      return window.AoE2Buildings.getBuildingIcon(building);
    }
    if (!building) return "assets/icons/building_placeholder.svg";

    let bObj = building;
    if (typeof building === 'string' || typeof building === 'number') {
      if (typeof getBuildingByKey === 'function') {
        bObj = getBuildingByKey(building);
      } else if (typeof BUILDING_REGISTRY !== 'undefined') {
        bObj = BUILDING_REGISTRY[building];
      }
      if (!bObj && state?.data?.data?.Building?.[building]) {
        bObj = state.data.data.Building[building];
      }
    }

    const icons = (typeof window !== 'undefined' && window.VILLAGER_BUILD_ICONS) ? window.VILLAGER_BUILD_ICONS : null;
    if (icons) {
      const bId = bObj?.id !== undefined ? bObj.id : (bObj?.ID !== undefined ? bObj.ID : (typeof building === 'number' ? building : null));
      if (bId !== null && bId !== undefined && icons[bId]) return `img/Building/${icons[bId]}`;
      const bKey = String(bObj?.key || (typeof building === 'string' ? building : '')).toLowerCase().trim();
      if (bKey && icons[bKey]) return `img/Building/${icons[bKey]}`;
      const bName = String(bObj?.name || bObj?.internal_name || '').toLowerCase().trim();
      if (bName && icons[bName]) return `img/Building/${icons[bName]}`;
    }

    if (!bObj) return "assets/icons/building_placeholder.svg";

    // Extrae el ID de icono nativo del dataset Genie (IconID, icon o Icon)
    let iconId = bObj.IconID !== undefined 
      ? bObj.IconID 
      : (bObj.icon !== undefined ? bObj.icon : bObj.GraphicID);

    // Si no está directamente en el objeto, consultar en el dataset original de data.json
    if ((iconId === undefined || iconId === null || iconId === "") && state?.data?.data?.Building) {
      const rawGenie = state.data.data.Building[bObj.id || bObj.ID];
      if (rawGenie) {
        iconId = rawGenie.IconID !== undefined ? rawGenie.IconID : (rawGenie.icon !== undefined ? rawGenie.icon : rawGenie.GraphicID);
      }
    }

    // Si el objeto tiene su icono nativo definido, carga directamente ese archivo
    if (iconId !== undefined && iconId !== null && iconId !== "") {
      return `img/Building/${iconId}.png`;
    }

    // Fallback solo para edificios custom del mod que no vengan con IconID
    const rawName = (bObj.name || bObj.internal_name || "").toLowerCase();
    if (rawName.includes("asentamiento") || rawName.includes("settlement")) {
      return "img/Building/98.png";
    }

    return "assets/icons/building_placeholder.svg";
  }
  if (typeof window !== 'undefined') window.getBuildingIcon = getBuildingIcon;

  // Resolución de nombres con offset del motor AoE2
  function resolveUnitName(u) {
    if (!u) return 'Desconocido';
    const s = state.strings;
    if (s[u.LanguageNameId]) return cleanText(s[u.LanguageNameId]);
    if (s[u.LanguageNameId + 9000]) return cleanText(s[u.LanguageNameId + 9000]);
    if (u.internal_name) return u.internal_name.replace(/_/g, ' ');
    return `Unidad #${u.ID}`;
  }

  // Resolución de descripciones / texto de ayuda
  function resolveUnitDescription(u) {
    if (!u) return '';
    const s = state.strings;
    if (u.LanguageHelpId && s[u.LanguageHelpId]) return s[u.LanguageHelpId];
    if (s[u.LanguageNameId + 21000]) return s[u.LanguageNameId + 21000];
    return '';
  }

  function cleanText(text) {
    if (!text) return '';
    return text.replace(/<br\s*[\/]?>/gi, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Poblado del dropdown de Civilizaciones
  function populateCivDropdown() {
    const civEntries = Object.entries(state.data.civs).map(([key, civ]) => {
      const localizedCivName = state.strings[civ.name_string_id] || key;
      return { key, civ, name: localizedCivName };
    });

    // Ordenar alfabéticamente por nombre en español
    civEntries.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    state.civsList = civEntries;

    // Inyectar en el selector
    civEntries.forEach(({ key, name }) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = name;
      DOM.civSelect.appendChild(opt);

      if (DOM.buildingCivSelect) {
        const optB = document.createElement('option');
        optB.value = key;
        optB.textContent = name;
        DOM.buildingCivSelect.appendChild(optB);
      }
    });
  }

  // =========================================================================
  // CONTROL DE NAVEGACIÓN ENTRE VISTAS
  // =========================================================================
  function navigateToView(viewName) {
    // Redirigir cualquier referencia huérfana de civilizaciones al Árbol Tecnológico
    if (viewName === 'civs' || viewName === 'view-civs' || viewName === 'civilizations') {
      viewName = 'techtree';
    }

    if (viewName === 'units') {
      DOM.mainMenuView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.remove('active');
      DOM.unitsView.classList.add('active');
      DOM.navHomeBtn.style.display = 'inline-flex';
      state.currentView = 'units';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'buildings') {
      DOM.mainMenuView.classList.remove('active');
      DOM.unitsView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.add('active');
      DOM.navHomeBtn.style.display = 'inline-flex';
      state.currentView = 'buildings';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderBuildings();
    } else if (viewName === 'techs') {
      DOM.mainMenuView.classList.remove('active');
      DOM.unitsView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.add('active');
      DOM.navHomeBtn.style.display = 'inline-flex';
      state.currentView = 'techs';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.techCatalog && typeof window.techCatalog.renderCatalog === 'function') {
        window.techCatalog.renderCatalog();
      }
    } else if (viewName === 'techtree') {
      DOM.mainMenuView.classList.remove('active');
      DOM.unitsView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.add('active');
      DOM.navHomeBtn.style.display = 'inline-flex';
      state.currentView = 'techtree';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.techTreeModule) {
        const activeCiv = state.selectedCiv && state.selectedCiv !== 'all' ? state.selectedCiv : 'britons';
        if (!state.techtreeInitialized) {
          state.techtreeInitialized = true;
          window.techTreeModule.initTechTree(activeCiv).catch(err => {
            state.techtreeInitialized = false;
            console.error('[TechTree] Error al inicializar el árbol:', err);
          });
        } else {
          window.techTreeModule.openTechTree(activeCiv).catch(err => console.error('[TechTree] Error al abrir el árbol:', err));
        }
      }
    } else if (viewName === 'duel') {
      DOM.mainMenuView.classList.remove('active');
      DOM.unitsView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.add('active');
      DOM.navHomeBtn.style.display = 'inline-flex';
      state.currentView = 'duel';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (!state.duelInitialized) {
        initDuelArena();
      }
    } else if (viewName === 'eco') {
      DOM.mainMenuView.classList.remove('active');
      DOM.unitsView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.add('active');
      DOM.navHomeBtn.style.display = 'inline-flex';
      state.currentView = 'eco';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.ecoCalculator && typeof window.ecoCalculator.init === 'function') {
        window.ecoCalculator.init(DOM.ecoView);
      }
    } else {
      DOM.unitsView.classList.remove('active');
      if (DOM.duelView) DOM.duelView.classList.remove('active');
      if (DOM.buildingsView) DOM.buildingsView.classList.remove('active');
      if (DOM.techsView) DOM.techsView.classList.remove('active');
      if (DOM.techtreeView) DOM.techtreeView.classList.remove('active');
      if (DOM.ecoView) DOM.ecoView.classList.remove('active');
      DOM.mainMenuView.classList.add('active');
      DOM.navHomeBtn.style.display = 'none';
      state.currentView = 'main-menu';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined') {
      window.navigateToView = navigateToView;
    }
  }

  // =========================================================================
  // RENDERIZADO DINÁMICO DE UNIDADES Y FILTRADO EN TIEMPO REAL
  // =========================================================================
  function renderUnits() {
    const frag = document.createDocumentFragment();
    let visibleCount = 0;
    let availableCount = 0;

    // Obtener conjunto de unidades deshabilitadas según civilización seleccionada
    // leyendo estrictamente el bloque disabled.units de cada civ
    let disabledUnitIds = new Set();
    const isCivSelected = state.selectedCiv !== 'all' && state.data.civs[state.selectedCiv];
    
    if (isCivSelected) {
      const civObj = state.data.civs[state.selectedCiv];
      if (civObj.disabled && Array.isArray(civObj.disabled.units)) {
        disabledUnitIds = new Set(civObj.disabled.units);
      }
    }

    const query = state.searchQuery.trim().toLowerCase();

    state.unitsList.forEach(unit => {
      // 1. Filtro por Edad
      if (state.selectedAge !== 'all' && unit.age !== Number(state.selectedAge)) {
        return;
      }

      // 2. Filtro por Búsqueda de texto (nombre localizado e internal_name)
      if (query) {
        const matchName = unit.localizedName.toLowerCase().includes(query);
        const matchInternal = (unit.internal_name || '').toLowerCase().includes(query);
        if (!matchName && !matchInternal) return;
      }

      // 3. Verificación de disponibilidad por Civilización
      const isDisabledByCiv = isCivSelected && disabledUnitIds.has(unit.ID);

      // Si el usuario marcó ocultar unidades no disponibles, la filtramos completamente
      if (isDisabledByCiv && state.hideDisabled) {
        return;
      }

      visibleCount++;
      if (!isDisabledByCiv) availableCount++;

      // Crear tarjeta de unidad
      const card = createUnitCard(unit, isDisabledByCiv);
      frag.appendChild(card);
    });

    DOM.unitsGrid.innerHTML = '';
    DOM.unitsGrid.appendChild(frag);

    // Actualizar contadores
    updateCountDisplay(visibleCount, availableCount, isCivSelected);

    // Mensaje de estado vacío
    if (visibleCount === 0) {
      DOM.noResultsMsg.style.display = 'block';
    } else {
      DOM.noResultsMsg.style.display = 'none';
    }
  }

  function createUnitCard(unit, isDisabledByCiv) {
    const card = document.createElement('div');
    card.className = `unit-card bevel-raised ${isDisabledByCiv ? 'disabled-by-civ' : ''}`;
    if (state.selectedUnitId === unit.ID) {
      card.classList.add('selected');
    }
    card.dataset.unitId = unit.ID;

    // Ruta de la imagen siguiendo convención: ./img/units/{id}.png con fallback
    const imgSrc = `./img/units/${unit.ID}.png`;
    const fallbackSrc = `./img/Unit/${unit.ID}.png`;

    const ageInfo = AGE_NAMES[unit.age] || { short: 'Edad ?', color: '#666' };

    // Comprobación reactiva de descuentos por civilización activa
    let discountBadgeHTML = '';
    if (!isDisabledByCiv && state.selectedCiv && state.selectedCiv !== 'all' && typeof calculateUnitCost === 'function') {
      const ageKey = state.selectedAge === '1' ? 'dark' : (state.selectedAge === '2' ? 'feudal' : (state.selectedAge === '3' ? 'castle' : 'imperial'));
      const costRes = calculateUnitCost(
        {
          id: unit.ID,
          name: unit.localizedName,
          classes: (unit.Armours || []).map(a => a.Class),
          cost: unit.Cost
        },
        state.selectedCiv,
        ageKey
      );
      if (costRes && costRes.isDiscounted && costRes.totalSavings.total > 0) {
        discountBadgeHTML = `<span class="card-discount-badge" style="position:absolute; top:4px; left:4px; background:#2ecc71; color:#000; font-size:0.68rem; font-weight:bold; padding:1px 5px; border-radius:3px; z-index:2; box-shadow:0 1px 3px rgba(0,0,0,0.6);" title="Ahorro: -${costRes.totalSavings.total} recursos">-${costRes.discountPercent}%</span>`;
      }
    }

    card.innerHTML = `
      ${isDisabledByCiv ? '<span class="disabled-banner">No disponible</span>' : ''}
      ${discountBadgeHTML}
      <div class="unit-icon-frame">
        <img 
          src="${imgSrc}" 
          alt="${unit.localizedName}" 
          class="unit-icon" 
          loading="lazy" 
          onerror="if (!this.dataset.tried) { this.dataset.tried=1; this.src='${fallbackSrc}'; } else { this.style.display='none'; this.nextElementSibling.style.display='block'; }"
        >
        <span class="icon-fallback" style="display:none; font-size:1.8rem;">🛡️</span>
      </div>
      <span class="unit-name" title="${unit.localizedName}">${unit.localizedName}</span>
      <div class="unit-card-meta">
        <span class="card-age-badge" style="border-color:${ageInfo.color}">${ageInfo.short}</span>
        <span class="card-hp-badge">${unit.HP} HP</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectUnit(unit.ID);
    });

    return card;
  }

  function updateCountDisplay(visible, available, isCivSelected) {
    if (!DOM.unitsCountDisplay) return;
    if (isCivSelected) {
      DOM.unitsCountDisplay.textContent = `Mostrando ${visible} unidades (${available} disponibles)`;
    } else {
      DOM.unitsCountDisplay.textContent = `Mostrando ${visible} de ${state.unitsList.length} unidades`;
    }
  }

  // =========================================================================
  // CATÁLOGO ARQUITECTÓNICO DE EDIFICIOS & FICHA TÉCNICA DEEP DIVE
  // =========================================================================
  function renderBuildings() {
    if (!DOM.buildingsGrid) return;
    const frag = document.createDocumentFragment();

    let buildings = [];
    if (typeof getAllBuildings === 'function') {
      buildings = getAllBuildings();
    } else if (typeof window !== 'undefined' && typeof window.getAllBuildings === 'function') {
      buildings = window.getAllBuildings();
    } else if (typeof BUILDING_REGISTRY !== 'undefined') {
      buildings = Object.values(BUILDING_REGISTRY);
    } else if (typeof window !== 'undefined' && window.BUILDING_REGISTRY) {
      buildings = Object.values(window.BUILDING_REGISTRY);
    }

    let visibleCount = 0;
    let availableCount = 0;
    const query = state.buildingSearchQuery.trim().toLowerCase();
    const isCivSelected = state.selectedBuildingCiv !== 'all';

    buildings.forEach(b => {
      // 1. Filtro por Categoría
      if (state.selectedBuildingCat !== 'all' && b.category !== state.selectedBuildingCat) {
        return;
      }

      // 2. Filtro por Edad
      if (state.selectedBuildingAge !== 'all' && b.age !== Number(state.selectedBuildingAge)) {
        return;
      }

      // 3. Filtro por Búsqueda de texto
      if (query) {
        const matchName = (b.name || '').toLowerCase().includes(query);
        const matchInternal = (b.internalName || '').toLowerCase().includes(query);
        const matchKey = (b.key || '').toLowerCase().includes(query);
        if (!matchName && !matchInternal && !matchKey) return;
      }

      // 4. Disponibilidad por Civilización
      let availability = { status: 'available' };
      if (isCivSelected) {
        if (typeof getBuildingAvailability === 'function') {
          availability = getBuildingAvailability(b.key, state.selectedBuildingCiv);
        } else if (typeof window !== 'undefined' && typeof window.getBuildingAvailability === 'function') {
          availability = window.getBuildingAvailability(b.key, state.selectedBuildingCiv);
        }
      }

      visibleCount++;
      if (availability.status === 'available') availableCount++;

      const card = createBuildingCard(b, availability);
      frag.appendChild(card);
    });

    DOM.buildingsGrid.innerHTML = '';
    DOM.buildingsGrid.appendChild(frag);

    if (DOM.buildingsCountDisplay) {
      if (isCivSelected) {
        DOM.buildingsCountDisplay.textContent = `Mostrando ${visibleCount} edificios (${availableCount} disponibles para ${state.selectedBuildingCiv})`;
      } else {
        DOM.buildingsCountDisplay.textContent = `Mostrando ${visibleCount} de ${buildings.length} edificios`;
      }
    }

    if (DOM.noBuildingsMsg) {
      DOM.noBuildingsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  function createBuildingCard(b, availability) {
    const card = document.createElement('div');
    const isUnavailable = availability && (availability.status === 'unavailable' || availability.available === false);

    card.className = `unit-card bevel-raised ${isUnavailable ? 'disabled-by-civ' : ''}`;
    card.dataset.buildingKey = b.key;
    card.style.cursor = 'pointer';

    const imgSrc = getBuildingIcon(b);
    const fallbackSrc = 'img/Building/98.png';
    const ageInfo = AGE_NAMES[b.age] || { short: 'Edad ?', color: '#666' };

    const catLabels = {
      military: 'Militar',
      economic: 'Económico',
      defensive: 'Defensivo',
      religious_academic: 'Académico'
    };
    const catLabel = catLabels[b.category] || b.category;

    // Cost tags
    const costChips = [];
    if (b.cost?.Wood) costChips.push(`🪵${b.cost.Wood}`);
    if (b.cost?.Food) costChips.push(`🥩${b.cost.Food}`);
    if (b.cost?.Gold) costChips.push(`🪙${b.cost.Gold}`);
    if (b.cost?.Stone) costChips.push(`🪨${b.cost.Stone}`);
    const costText = costChips.join(' ') || 'Gratis';

    let bannerHTML = '';
    if (isUnavailable) {
      bannerHTML = '<span class="disabled-banner">No disponible</span>';
    }

    const activeAge = state.selectedBuildingAge !== 'all' ? Number(state.selectedBuildingAge) : b.age;
    const scaledHp = (b.ageScaling && b.ageScaling[activeAge]?.hp) || b.baseHp;

    card.innerHTML = `
      ${bannerHTML}
      <div class="unit-icon-frame">
        <img 
          src="${imgSrc}" 
          alt="${b.name}" 
          class="unit-icon" 
          loading="lazy" 
          onerror="if (!this.dataset.tried) { this.dataset.tried=1; this.src='${fallbackSrc}'; } else if (this.dataset.tried === '1') { this.dataset.tried=2; this.src='assets/icons/building_placeholder.svg'; } else { this.style.display='none'; this.nextElementSibling.style.display='block'; }"
        >
        <span class="icon-fallback" style="display:none; font-size:1.8rem;">🏰</span>
      </div>
      <span class="unit-name" title="${b.name}">${b.name}</span>
      <div class="unit-card-meta" style="flex-wrap: wrap; gap: 4px; justify-content: center;">
        <span class="card-age-badge" style="border-color:${ageInfo.color}">${ageInfo.short}</span>
        <span class="card-hp-badge">${scaledHp} HP</span>
        <span class="card-age-badge" style="border-color:#b8860b; color:#ffd700; font-size:0.65rem;">${catLabel}</span>
      </div>
      <div style="font-size:0.75rem; color:#d2bc90; margin-top:4px;">${costText}</div>
      <div style="font-size:0.7rem; color:#4ade80; margin-top:2px;">🔍 Deep Dive</div>
    `;

    card.addEventListener('click', () => {
      const civ = state.selectedBuildingCiv !== 'all' ? state.selectedBuildingCiv : null;
      const age = state.selectedBuildingAge !== 'all' ? Number(state.selectedBuildingAge) : null;
      if (typeof openBuildingDeepDive === 'function') {
        openBuildingDeepDive(b.key, civ, age);
      } else if (typeof window !== 'undefined' && typeof window.openBuildingDeepDive === 'function') {
        window.openBuildingDeepDive(b.key, civ, age);
      }
    });

    return card;
  }

  // =========================================================================
  // SELECCIÓN E INSPECTOR LATERAL
  // =========================================================================
  function selectUnit(unitId) {
    state.selectedUnitId = unitId;

    // Actualizar estilo seleccionado en las tarjetas
    document.querySelectorAll('.unit-card').forEach(c => {
      if (Number(c.dataset.unitId) === unitId) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    const unit = state.unitsList.find(u => u.ID === unitId);
    if (!unit) return;

    renderInspector(unit);

    // En pantallas móviles / tabletas, hacer scroll hacia el inspector
    if (window.innerWidth <= 1080) {
      DOM.inspectorPanel.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderInspector(unit) {
    const ageInfo = AGE_NAMES[unit.age] || { name: 'Edad Desconocida', color: '#555' };
    const imgSrc = `./img/units/${unit.ID}.png`;
    const fallbackSrc = `./img/Unit/${unit.ID}.png`;

    // 1. Cálculo dinámico de costes con discriminación de civilización y edad
    const activeCiv = (state.selectedCiv && state.selectedCiv !== 'all') ? state.selectedCiv : 'generic';
    const ageKey = state.selectedAge === '1' ? 'dark' : (state.selectedAge === '2' ? 'feudal' : (state.selectedAge === '3' ? 'castle' : 'imperial'));

    let costResult = null;
    if (typeof calculateUnitCost === 'function') {
      costResult = calculateUnitCost(
        {
          id: unit.ID,
          name: unit.localizedName,
          classes: (unit.Armours || []).map(a => a.Class),
          cost: unit.Cost
        },
        activeCiv,
        ageKey
      );
    }

    const rawCost = unit.Cost || {};
    const finalCost = costResult ? costResult.cost : {
      food: rawCost.Food || 0,
      wood: rawCost.Wood || 0,
      gold: rawCost.Gold || 0,
      stone: rawCost.Stone || 0
    };

    const costChips = [];
    const resources = [
      { key: 'food', label: 'Comida', icon: '🥩', base: rawCost.Food || 0, cur: finalCost.food, css: 'res-food' },
      { key: 'wood', label: 'Madera', icon: '🪵', base: rawCost.Wood || 0, cur: finalCost.wood, css: 'res-wood' },
      { key: 'gold', label: 'Oro', icon: '🪙', base: rawCost.Gold || 0, cur: finalCost.gold, css: 'res-gold' },
      { key: 'stone', label: 'Piedra', icon: '🪨', base: rawCost.Stone || 0, cur: finalCost.stone, css: 'res-stone' }
    ];

    resources.forEach(res => {
      if (res.base > 0 || res.cur > 0) {
        if (res.cur < res.base) {
          costChips.push(`
            <div class="resource-chip ${res.css}" title="Coste base: ${res.base} → Descuento: ${res.cur}">
              <span>${res.icon}</span>
              <span style="text-decoration:line-through; opacity:0.65; margin-right:3px;">${res.base}</span>
              <span style="color:#2ecc71; font-weight:bold;">${res.cur}</span>
              <span>${res.label}</span>
            </div>
          `);
        } else {
          costChips.push(`<div class="resource-chip ${res.css}">${res.icon} ${res.cur} ${res.label}</div>`);
        }
      }
    });

    if (costChips.length === 0) {
      costChips.push(`<div class="resource-chip" style="background:#222; color:#aaa;">Gratis / Sin coste</div>`);
    }

    // Banner de ahorro de civilización si aplica
    let savingsBannerHTML = '';
    if (costResult && costResult.isDiscounted && costResult.totalSavings.total > 0) {
      savingsBannerHTML = `
        <div class="cost-savings-callout" style="background:rgba(46,204,113,0.12); border-left:3px solid #2ecc71; padding:6px 10px; margin-top:6px; border-radius:0 4px 4px 0; font-size:0.8rem; color:#2ecc71;">
          <strong>🏷️ Descuento de ${costResult.civName}:</strong> Ahorro de -${costResult.totalSavings.total} recursos (-${costResult.discountPercent}%)
          ${costResult.discountsApplied.length > 0 ? `<div style="font-style:italic; font-size:0.75rem; margin-top:2px; color:#a8e6cf;">"${costResult.discountsApplied[0].sourceDescription}"</div>` : ''}
        </div>
      `;
    } else if (costResult && costResult.costConversionApplied) {
      savingsBannerHTML = `
        <div class="cost-savings-callout" style="background:rgba(52,152,219,0.12); border-left:3px solid #3498db; padding:6px 10px; margin-top:6px; border-radius:0 4px 4px 0; font-size:0.8rem; color:#74b9ff;">
          <strong>🔄 Conversión:</strong> ${costResult.costConversionApplied.rule}
        </div>
      `;
    }

    // 2. Desglose de Armaduras Ocultas del array Armours
    const armours = unit.Armours || [];
    let armoursHTML = '';
    
    if (armours.length > 0) {
      armoursHTML = armours.map(arm => {
        const classData = ARMOUR_CLASSES[arm.Class] || { 
          name: `Clase ${arm.Class}`, 
          desc: 'Clase especial del motor de AoE2.' 
        };

        let valClass = 'neutral';
        let valPrefix = '';
        if (arm.Amount > 0) {
          valClass = 'positive';
          valPrefix = '+';
        } else if (arm.Amount < 0) {
          valClass = 'negative';
        }

        return `
          <div class="armor-class-row" title="${classData.desc}">
            <div class="armor-class-info">
              <span class="armor-class-id">#${arm.Class}</span>
              <span class="armor-class-name">${classData.name}</span>
            </div>
            <span class="armor-class-val ${valClass}">${valPrefix}${arm.Amount}</span>
          </div>
        `;
      }).join('');
    } else {
      armoursHTML = '<p class="stat-row-label">No posee clases de armadura asignadas.</p>';
    }

    // 3. Desglose de Bonus de Ataque del array Attacks (si tiene)
    const attacks = unit.Attacks || [];
    // Filtrar ataques con bonificaciones especiales (excluyendo ataque base Melee/Pierce si es 0)
    const bonusAttacks = attacks.filter(atk => atk.Class !== 4 && atk.Class !== 3 && atk.Amount > 0);
    let attacksHTML = '';

    if (bonusAttacks.length > 0) {
      attacksHTML = `
        <div class="attack-bonuses-section">
          <h4 class="section-subhead">⚔️ Bonus de Ataque Especiales</h4>
          <div class="armor-class-list">
            ${bonusAttacks.map(atk => {
              const classData = ARMOUR_CLASSES[atk.Class] || { name: `Clase ${atk.Class}` };
              return `
                <div class="attack-bonus-row">
                  <span>vs ${classData.name}</span>
                  <span class="attack-bonus-amount">+${atk.Amount}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 4. Formateo de métricas secundarias
    const rangeText = unit.Range > 0 ? (unit.MinRange > 0 ? `${unit.MinRange} - ${unit.Range}` : `${unit.Range}`) : 'Cuerpo a cuerpo';
    const accuracyText = unit.AccuracyPercent ? `${unit.AccuracyPercent}%` : '100%';
    const speedText = unit.Speed ? `${unit.Speed.toFixed(2)} casillas/s` : '0';
    const reloadText = unit.ReloadTime ? `${unit.ReloadTime.toFixed(2)} s` : '-';
    const trainText = unit.TrainTime ? `${unit.TrainTime} s` : '-';
    const attackDelayText = unit.AttackDelaySeconds !== undefined ? `${unit.AttackDelaySeconds.toFixed(2)} s` : '-';
    const losText = unit.LineOfSight ? `${unit.LineOfSight}` : '-';

    DOM.inspectorContent.innerHTML = `
      <!-- Cabecera de la Unidad -->
      <div class="unit-hero">
        <div class="hero-portrait-frame">
          <img 
            src="${imgSrc}" 
            alt="${unit.localizedName}" 
            class="hero-portrait"
            onerror="if (!this.dataset.tried) { this.dataset.tried=1; this.src='${fallbackSrc}'; } else { this.style.display='none'; }"
          >
        </div>
        <div class="hero-info">
          <h3 class="hero-name">${unit.localizedName}</h3>
          <div class="hero-subinfo">
            <span class="hero-age-pill" style="background:${ageInfo.color}">${ageInfo.name}</span>
            <span class="hero-internal-id">ID #${unit.ID} • [${unit.internal_name || ''}]</span>
          </div>
        </div>
      </div>

      <!-- Costes de Producción -->
      <div class="cost-breakdown-bar">
        ${costChips.join('')}
      </div>
      ${savingsBannerHTML}

      <!-- Botón de Inspección Profunda (Deep Dive) -->
      <button 
        type="button" 
        class="btn-medieval deepdive-btn" 
        id="open-unit-deepdive-btn" 
        style="width:100%; margin:12px 0 16px 0; padding:9px 14px; font-size:0.9rem; background:linear-gradient(to bottom, #4a301b, #2b170a); border:1px solid #c79a55; color:#ffd700; cursor:pointer; border-radius:4px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:8px;"
      >
        🔬 Ficha Técnica Completa (Deep Dive)
      </button>

      <!-- Cuadrícula de Estadísticas Base Principales -->
      <div class="stats-primary-grid">
        <div class="stat-box">
          <span class="stat-label">Puntos de Vida</span>
          <span class="stat-value" style="color:#2ecc71;">${unit.HP}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Ataque Base</span>
          <span class="stat-value" style="color:#e67e22;">${unit.Attack !== undefined ? unit.Attack : '-'}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Armadura Melee</span>
          <span class="stat-value">${unit.MeleeArmor !== undefined ? unit.MeleeArmor : 0}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Armadura Pierce</span>
          <span class="stat-value">${unit.PierceArmor !== undefined ? unit.PierceArmor : 0}</span>
        </div>
      </div>

      <!-- Tabla de Atributos Secundarios de Combate -->
      <div class="secondary-stats-list">
        <div class="stat-row">
          <span class="stat-row-label">Alcance (Rango):</span>
          <span class="stat-row-value">${rangeText}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Velocidad de movimiento:</span>
          <span class="stat-row-value">${speedText}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Cadencia (Reload Time):</span>
          <span class="stat-row-value">${reloadText}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Retardo de disparo (Attack Delay):</span>
          <span class="stat-row-value">${attackDelayText}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Precisión de disparo:</span>
          <span class="stat-row-value">${accuracyText}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Tiempo de creación:</span>
          <span class="stat-row-value">${trainText}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Línea de visión (LOS):</span>
          <span class="stat-row-value">${losText}</span>
        </div>
        ${unit.GarrisonCapacity > 0 ? `
        <div class="stat-row">
          <span class="stat-row-label">Capacidad de guarnición:</span>
          <span class="stat-row-value">${unit.GarrisonCapacity} unidades</span>
        </div>
        ` : ''}
      </div>

      <!-- SECCIÓN COMPETITIVA: DESGLOSE DE ARMADURAS OCULTAS -->
      <div class="hidden-armors-section">
        <h4 class="section-subhead">
          🛡️ Desglose de Armaduras Ocultas
        </h4>
        <p class="tactical-note">
          <b>Nota Competitiva:</b> Las armaduras ocultas definen a qué clases de daño pertenece esta unidad. Si el valor es 0, recibe el 100% del daño adicional de las unidades enemigas especializadas contra esa clase.
        </p>
        <div class="armor-class-list">
          ${armoursHTML}
        </div>
      </div>

      <!-- SECCIÓN: BONUS DE ATAQUE ESPECIALES (si aplica) -->
      ${attacksHTML}

      <!-- Descripción Histórica / Ayuda oficial del juego -->
      ${unit.description ? `
      <div class="unit-help-box">
        ${unit.description.replace(/‹DEFAULT›/g, '').replace(/‹.*?›/g, '')}
      </div>
      ` : ''}
    `;

    // Vincular botón Deep Dive
    const ddBtn = DOM.inspectorContent.querySelector('#open-unit-deepdive-btn');
    if (ddBtn) {
      ddBtn.addEventListener('click', () => {
        if (typeof openUnitDeepDive === 'function') {
          openUnitDeepDive(unit, activeCiv, ageKey);
        } else if (typeof window !== 'undefined' && typeof window.openUnitDeepDive === 'function') {
          window.openUnitDeepDive(unit, activeCiv, ageKey);
        }
      });
    }
  }

  // =========================================================================
  // SECCIÓN: ARENA DE DUELO 1 VS 1 - CONTROLADOR DE SIMULACIÓN Y RESULTADOS
  // =========================================================================

  // Unidades de bonificación de equipo compartidas (excepciones válidas)
  const SHARED_TEAM_BONUS_UNITS = [
    882,  // Condotiero (Bonificación de equipo italiana)
    1010, // Cenit (Bonificación de equipo bereber)
    1012, // Cenit de élite (Bonificación de equipo bereber)
    1155  // Guerrillero imperial (Bonificación de equipo vietnamita)
  ];

  /**
   * Asigna el nombre oficial de una tecnología cruzando su LanguageNameId
   * en data.json con el diccionario localizado state.strings (es.json).
   */
  function resolveTechName(tech) {
    if (!tech) return 'Tecnología Única';
    const s = state.strings || {};

    // Para Viking Chieftains (ID 463, LanguageNameId 7312), el texto oficial DE en español
    // en strings[LanguageNameId + 21000] es "Investigar <b>Caudillos</b>"
    if (Number(tech.ID) === 463 && tech.LanguageNameId && s[tech.LanguageNameId + 21000]) {
      const boldMatch = s[tech.LanguageNameId + 21000].match(/<b>(.*?)<\/b>/i);
      if (boldMatch && boldMatch[1]) {
        return cleanText(boldMatch[1]);
      }
    }

    if (tech.LanguageNameId && s[tech.LanguageNameId]) return cleanText(s[tech.LanguageNameId]);
    if (tech.LanguageNameId && s[tech.LanguageNameId + 10000]) return cleanText(s[tech.LanguageNameId + 10000]);
    if (tech.LanguageNameId && s[tech.LanguageNameId + 9000]) return cleanText(s[tech.LanguageNameId + 9000]);
    if (tech.LanguageNameId && s[tech.LanguageNameId + 21000]) {
      const m = s[tech.LanguageNameId + 21000].match(/<b>(.*?)<\/b>/i);
      if (m && m[1]) return cleanText(m[1]);
    }
    if (tech.internal_name) return tech.internal_name.replace(/_/g, ' ');
    return `Tecnología #${tech.ID || ''}`;
  }

  function resolveTechDescription(tech) {
    if (!tech) return '';
    const s = state.strings || {};
    let desc = '';
    if (tech.LanguageHelpId && s[tech.LanguageHelpId]) {
      desc = s[tech.LanguageHelpId];
    } else if (tech.LanguageNameId && s[tech.LanguageNameId + 21000]) {
      desc = s[tech.LanguageNameId + 21000];
    }
    return cleanText(desc.replace(/‹DEFAULT›/g, '').replace(/‹.*?›/g, '').replace(/<\/?b>/gi, ''));
  }

  /**
   * Normaliza el identificador de la civilización para resolver indistintamente
   * grafías comunes como Yurchen, Jurchen o Jurchens hacia la clave interna del juego.
   */
  function normalizeCivKey(civName) {
    if (!civName || civName === 'Generic') return 'Generic';
    const lower = String(civName).toLowerCase().trim();
    if (["yurchen", "jurchen", "jurchens"].includes(lower)) {
      return 'Jurchens';
    }
    if (state.data && state.data.civs) {
      if (state.data.civs[civName]) return civName;
      const match = Object.keys(state.data.civs).find(k => k.toLowerCase().trim() === lower);
      if (match) return match;
    }
    return civName;
  }

  /**
   * Detecta de forma sistemática las dos Tecnologías Únicas de una civilización
   * cruzando state.data.civs[civKey].Tech con las tecnologías investigadas en el Castillo (Building === 82)
   * y clasificando estrictamente según su requisito de Edad:
   * - Corona de Castillos (Plata): Age === 3
   * - Corona de Imperial (Oro): Age === 4
   */
  function getCivUniqueTechsByAge(civKey) {
    const normKey = normalizeCivKey(civKey);
    if (!normKey || normKey === 'Generic' || !state.data || !state.data.civs || !state.data.civs[normKey]) {
      return null;
    }

    if (window.AoE2Combat && typeof window.AoE2Combat.resolveCivUniqueTechs === 'function') {
      return window.AoE2Combat.resolveCivUniqueTechs(normKey, state.data);
    }

    const civTechIds = state.data.civs[normKey].Tech || [];
    const allTechs = (state.data.data && state.data.data.Tech) ? state.data.data.Tech : {};
    let castleTechId = null;
    let imperialTechId = null;

    for (const rawId of civTechIds) {
      const tid = Number(rawId);
      const techObj = allTechs[tid];
      if (!techObj || techObj.Building !== 82) continue;

      if (Number(techObj.Age) === 3) {
        castleTechId = tid;
      } else if (Number(techObj.Age) === 4) {
        imperialTechId = tid;
      }
    }

    if (!castleTechId && !imperialTechId) return null;
    return { castle: castleTechId, imperial: imperialTechId };
  }

  /**
   * Obtiene la lista de unidades disponibles para una civilización específica
   * según el árbol tecnológico de data.json, manteniendo las unidades de
   * bonificación de equipo compartidas (Condotiero, Guerrillero imperial, Cenitres).
   */
  function getAvailableUnitsForCiv(civKey) {
    const normKey = normalizeCivKey(civKey);
    if (!normKey || normKey === 'Generic' || !state.data.civs[normKey]) {
      return state.unitsList;
    }

    const civObj = state.data.civs[normKey];
    const allowedSet = new Set(civObj.Unit || []);
    const civBuildings = new Set(civObj.Building || []);

    // Excepciones válidas: unidades de bonificación de equipo compartidas
    // 1. Condotiero (882): disponible para cualquier civ con Cuartel (12) en partida con aliado italiano
    if (civBuildings.has(12) || allowedSet.size > 0) {
      allowedSet.add(882);
    }
    // 2. Cenit (1010) y Cenit de élite (1012): disponibles si la civ tiene Galería de tiro con arco (87)
    if (civBuildings.has(87)) {
      allowedSet.add(1010);
      allowedSet.add(1012);
    }
    // 3. Guerrillero imperial (1155): disponible si la civ posee Guerrillero de élite (6)
    if (allowedSet.has(6)) {
      allowedSet.add(1155);
    }

    return state.unitsList.filter(u => allowedSet.has(u.ID));
  }

  /**
   * Obtiene la edad seleccionada (`selectedAge`) de un combatiente ('a' o 'b').
   * 1: Alta Edad Media, 2: Edad Feudal, 3: Edad de los Castillos, 4: Edad Imperial
   */
  function getSelectedAgeForSide(side) {
    const s = String(side || 'a').toUpperCase();
    const ageEl = DOM[`duelAge${s}`];
    const val = ageEl ? Number(ageEl.value) : 4;
    return (val >= 1 && val <= 4) ? val : 4;
  }

  /**
   * Filtra y repuebla el <select> de unidades de un combatiente para mostrar
   * únicamente las unidades habilitadas en la civilización seleccionada y disponibles
   * en `selectedAge` o inferior en el árbol tecnológico de esa civilización.
   */
  function populateDuelUnitSelect(side, preferredUnitId) {
    const s = side.toUpperCase();
    const selectEl = DOM[`duelUnit${s}`];
    const civEl = DOM[`duelCiv${s}`];
    if (!selectEl || !civEl) return;

    const civKey = civEl.value || 'Generic';
    const selectedAge = getSelectedAgeForSide(side);
    const currentUnitId = preferredUnitId !== undefined ? Number(preferredUnitId) : Number(selectEl.value);
    const availableUnits = getAvailableUnitsForCiv(civKey).filter(u => Number(u.age) <= selectedAge);

    selectEl.innerHTML = '';
    const frag = document.createDocumentFragment();

    availableUnits.forEach(u => {
      const ageLabel = AGE_NAMES[u.age] ? AGE_NAMES[u.age].short : `E.${u.age}`;
      const opt = document.createElement('option');
      opt.value = u.ID;
      opt.textContent = `${u.localizedName} (${ageLabel})`;
      frag.appendChild(opt);
    });

    selectEl.appendChild(frag);

    // Conservar la unidad seleccionada si está disponible en la civilización y edad actual;
    // de lo contrario elegir un reemplazo representativo de la civilización y edad
    const isStillValid = availableUnits.some(u => u.ID === currentUnitId);
    if (isStillValid) {
      selectEl.value = String(currentUnitId);
    } else if (availableUnits.length > 0) {
      const fallbackByAge = {
        4: [726, 725, 694, 692, 1951, 1949, 569, 283, 567, 492, 359, 4],
        3: [38, 725, 692, 1949, 24, 358, 77, 448, 75, 4, 93, 74],
        2: [448, 75, 4, 93, 7, 539, 1103, 74],
        1: [74, 83, 13, 545]
      };
      const priorityList = fallbackByAge[selectedAge] || fallbackByAge[4];
      const bestFallback = priorityList.find(id => availableUnits.some(u => u.ID === id));
      const sameAgeUnit = availableUnits.find(u => Number(u.age) === selectedAge);
      const chosenId = bestFallback !== undefined
        ? bestFallback
        : (sameAgeUnit ? sameAgeUnit.ID : availableUnits[0].ID);
      selectEl.value = String(chosenId);
    }
  }

  /**
   * Actualiza en tiempo real la nota de relevancia de cada Corona según la unidad seleccionada.
   * Si la corona no aplica a la unidad activa, muestra "(Sin efecto sobre esta unidad)".
   */
  function updateCrownRelevanceUI(side, unitDataOverride) {
    const s = side.toUpperCase();
    const container = DOM[`uniqueTechsContainer${s}`];
    const unitSelect = DOM[`duelUnit${s}`];
    if (!container || !unitSelect) return;

    const unitId = Number(unitSelect.value);
    const unitData = unitDataOverride || state.unitsList.find(u => u.ID === unitId);
    const rawTechs = (state.data && state.data.data && state.data.data.Tech) ? state.data.data.Tech : {};

    container.querySelectorAll('.crown-tech-chip').forEach(chip => {
      const cb = chip.querySelector('.unique-tech-checkbox');
      const hintEl = chip.querySelector('.crown-tech-hint');
      if (!cb || !hintEl) return;

      const techId = Number(cb.dataset.techId);
      const techObj = rawTechs[techId];
      const baseDesc = resolveTechDescription(techObj);

      const relevance = (window.AoE2Combat && typeof window.AoE2Combat.checkUniqueTechRelevance === 'function')
        ? window.AoE2Combat.checkUniqueTechRelevance(techId, unitData)
        : { applies: false, summary: '(Sin efecto sobre esta unidad)' };

      if (relevance.applies) {
        hintEl.textContent = `(${relevance.summary})`;
        hintEl.classList.remove('crown-hint-inactive');
        chip.classList.remove('crown-no-effect');
        chip.title = baseDesc || relevance.summary;
      } else {
        hintEl.textContent = '(Sin efecto sobre esta unidad)';
        hintEl.classList.add('crown-hint-inactive');
        chip.classList.add('crown-no-effect');
        chip.title = baseDesc
          ? `${baseDesc} — (Sin efecto sobre esta unidad)`
          : '(Sin efecto sobre esta unidad)';
      }
    });
  }

  /**
   * 3. BLOQUEO DINÁMICO DEL ÁRBOL TECNOLÓGICO Y CASCADA POR EDAD (syncTechTreeUI)
   * Valida la disponibilidad de tecnologías generales, navales, de herrería y coronas
   * comprobando si su ID numérico existe en state.data.civs[civName].Tech y si su edad
   * requerida no supera `selectedAge`.
   */
  const TECH_TREE_GENERAL_IDS = {
    bloodlines: 435,
    husbandry: 39,
    squires: 215,
    gambesons: 875,
    thumbRing: 437,
    parthianTactics: 436,
    cranequins: 1452,
    chemistry: 47,
    careening: 374,
    dryDock: 375,
    clinker: 908,
    carvelHull: 907,
    ballistics: 93,
    siphons: 909,
    incendiaries: 910
  };

  const TECH_TREE_BLACKSMITH_MAP = {
    melee: { 1: 67, 2: 68, 3: 75 },
    pierce: { 1: 199, 2: 200, 3: 201 },
    infArmor: { 1: 74, 2: 76, 3: 77 },
    cavArmor: { 1: 81, 2: 82, 3: 80 },
    archArmor: { 1: 211, 2: 212, 3: 219 }
  };

  // Mapeo canónico de edad mínima requerida por ID de tecnología
  const TECH_MIN_AGE_MAP = {
    // Herrería Nivel 1 (Edad Feudal = 2)
    67: 2, 199: 2, 74: 2, 81: 2, 211: 2,
    // Herrería Nivel 2 (Edad de los Castillos = 3)
    68: 3, 200: 3, 76: 3, 82: 3, 212: 3,
    // Herrería Nivel 3 (Edad Imperial = 4)
    75: 4, 201: 4, 77: 4, 80: 4, 219: 4,
    // Terrestres y Arquería Avanzada
    435: 2,  // Pureza de sangre (Feudal)
    39: 3,   // Ganadería (Castillos)
    215: 3,  // Escuderos (Castillos)
    875: 3,  // Gambesones (Castillos)
    437: 3,  // Dactilera / Thumb Ring (Castillos)
    436: 4,  // Táctica de los partos / Parthian Tactics (Imperial)
    1452: 3, // Cranequines / Cranequins (Castillos)
    47: 4,   // Química (Imperial)
    // Navales Universidad
    374: 3,  // Carenado (Castillos)
    375: 4,  // Dique seco (Imperial)
    908: 3,  // Construcción con tingladillo (Castillos)
    907: 4,  // Casco liso (Imperial)
    93: 3,   // Balística (Castillos)
    909: 3,  // Sifones (Castillos)
    910: 3,  // Incendiarias (Castillos)
    464: 3   // Fuego griego (Castillos)
  };

  function getTechRequiredAge(techId, el) {
    if (el && el.dataset) {
      if (el.dataset.minAge !== undefined) return Number(el.dataset.minAge);
      if (el.dataset.age !== undefined) return Number(el.dataset.age);
    }
    const tid = Number(techId);
    if (TECH_MIN_AGE_MAP[tid] !== undefined) return TECH_MIN_AGE_MAP[tid];
    const techObj = state.data && state.data.data && state.data.data.Tech
      ? state.data.data.Tech[tid]
      : null;
    if (techObj && Number.isFinite(Number(techObj.Age)) && Number(techObj.Age) > 0) {
      return Number(techObj.Age);
    }
    return 1;
  }

  function hasUnitArmourClass(unit, classId) {
    if (!unit || !Array.isArray(unit.Armours)) return false;
    return unit.Armours.some(a => Number(a.Class) === Number(classId));
  }

  const HULK_LINE_IDS = new Set([2626, 2627, 2628, 1948]); // Hulk, War Hulk, Carrack, Lou Chuan
  const ARROW_SHIP_IDS = new Set([539, 21, 442, 250, 533, 1004, 1006]); // Galera, Galera de guerra, Galeón, Drakkar, Carabela
  const FIRE_SHIP_IDS = new Set([1103, 529, 532, 1302]);
  const DEMO_SHIP_IDS = new Set([1104, 527, 528]);
  const CANNON_GALLEON_IDS = new Set([420, 691]);
  const DROMON_IDS = new Set([1795]);

  function getNavalCategory(unit) {
    if (!unit) return null;
    if (window.deepDive && typeof window.deepDive.getNavalCategory === 'function') {
      return window.deepDive.getNavalCategory(unit);
    }
    if (window.AoE2Combat && typeof window.AoE2Combat.getNavalCategory === 'function') {
      return window.AoE2Combat.getNavalCategory(unit);
    }
    const name = String(unit.internal_name || unit.name || unit.localizedName || '').toLowerCase();
    const id = Number(unit.ID ?? unit.id);
    const armours = Array.isArray(unit.Armours) ? unit.Armours : [];

    const isShip = armours.some(a => a.Class === 22 || a.Class === 16) ||
                   name.includes('ship') || name.includes('galley') || name.includes('barco') || name.includes('hulk') ||
                   HULK_LINE_IDS.has(id) || ARROW_SHIP_IDS.has(id) || FIRE_SHIP_IDS.has(id) || DEMO_SHIP_IDS.has(id) ||
                   CANNON_GALLEON_IDS.has(id) || DROMON_IDS.has(id);

    if (!isShip) return null;

    // 1. Línea de Hulk / Choque naval melee
    const isHulk = HULK_LINE_IDS.has(id) ||
                   name.includes('hulk') || name.includes('carrack') || name.includes('carraca') ||
                   name.includes('lou_chuan') || name.includes('louchuan');
    if (isHulk) return 'MELEE_SHIP';

    // 2. Barcos de flechas
    const isArrowShip = ARROW_SHIP_IDS.has(id) ||
                        name.includes('galley') || name.includes('galera') || 
                        name.includes('galleon') || name.includes('galeon') || 
                        name.includes('longboat') || name.includes('drakkar') || 
                        name.includes('caravel') || name.includes('carabela') ||
                        name.includes('sgaly') || name.includes('warga');

    const isExcluded = name.includes('fire') || name.includes('cannon') ||
                       name.includes('frgal') || name.includes('canga') ||
                       FIRE_SHIP_IDS.has(id) || CANNON_GALLEON_IDS.has(id) || DROMON_IDS.has(id);

    if (isArrowShip && !isExcluded) return 'ARROW_SHIP';

    return 'OTHER_SHIP';
  }
  window.getNavalCategory = getNavalCategory;

  function isUnitShip(unit) {
    if (!unit) return false;
    if (getNavalCategory(unit) !== null) return true;
    if (window.AoE2Combat && typeof window.AoE2Combat.isShipUnit === 'function') {
      return window.AoE2Combat.isShipUnit(unit);
    }
    return hasUnitArmourClass(unit, 16) || hasUnitArmourClass(unit, 22);
  }

  function isUnitCavalry(unit) {
    if (!unit) return false;
    if (typeof window.isCamelArcherUnit === 'function' && window.isCamelArcherUnit(unit)) {
      return false;
    }
    // Camellos cuerpo a cuerpo (Clase 30) son unidades montadas que reciben armadura de caballería
    return hasUnitArmourClass(unit, 8) || hasUnitArmourClass(unit, 30);
  }

  function isMountedOrCamel(unit) {
    if (!unit) return false;
    if (typeof window.isMountedOrCamel === 'function') {
      return window.isMountedOrCamel(unit);
    }
    const armours = Array.isArray(unit.Armours) ? unit.Armours : [];
    const hasEligibleClass = armours.some(a => a.Class === 8 || a.Class === 30);
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    const keywords = [
      "cavalry", "caballeria", "scout", "jinete", "knight", "caballero", 
      "lancer", "hussar", "paladin", "tarkan", "cataphract", "keshik", 
      "boyar", "konnik", "monaspa", "shrivamsha", "iron_pagoda", "camel", "camello",
      "steppe_lancer", "hei_guang", "xianbei"
    ];
    return hasEligibleClass || keywords.some(k => name.includes(k));
  }

  function isUnitInfantry(unit) {
    return hasUnitArmourClass(unit, 11) || hasUnitArmourClass(unit, 1);
  }

  function isUnitArcher(unit) {
    return hasUnitArmourClass(unit, 15);
  }

  function isUnitCavalryArcher(unit) {
    if (!unit) return false;
    if (window.AoE2Combat && typeof window.AoE2Combat.isCavalryArcherUnit === 'function') {
      return window.AoE2Combat.isCavalryArcherUnit(unit);
    }
    return hasUnitArmourClass(unit, 15) && hasUnitArmourClass(unit, 8);
  }

  function isUnitMountedCrossbow(unit) {
    if (!unit) return false;
    if (window.AoE2Combat && typeof window.AoE2Combat.isMountedCrossbowUnit === 'function') {
      return window.AoE2Combat.isMountedCrossbowUnit(unit);
    }
    const uid = Number(unit.ID);
    if (uid === 2700 || uid === 2701) return true;
    const uname = String(unit.internal_name || '').toUpperCase().replace(/\s+/g, '_');
    if (uname.includes('MNTXBOW') || uname.includes('MOUNTED_CROSSBOW')) return true;
    if (hasUnitArmourClass(unit, 15) && hasUnitArmourClass(unit, 8) && uid !== 39 && uid !== 474) {
      return true;
    }
    return false;
  }

  function isGambesonsUnit(unit) {
    if (!unit) return false;
    if (window.AoE2Combat && typeof window.AoE2Combat.isGambesonsUnit === 'function') {
      return window.AoE2Combat.isGambesonsUnit(unit);
    }
    const uid = Number(unit.ID ?? unit.id);
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    const isMilitiaLine = [74, 75, 77, 473, 567, 1793].includes(uid) || 
                          name.includes("militia") || name.includes("man_at_arms") || 
                          name.includes("long_swordsman") || name.includes("longswordsman") || name.includes("two_handed") || 
                          name.includes("champion") || name.includes("legionary") ||
                          name.includes("hombre de armas") || name.includes("campeon") || name.includes("legionario");
    const isFireLancer = [1901, 1903].includes(uid) || name.includes("fire_lancer") || name.includes("lancero incendiario");
    const isVarangian = [2700, 2701, 2703, 2704].includes(uid) || name.includes("varangian") || name.includes("varego");

    return isMilitiaLine || isFireLancer || isVarangian;
  }

  function isMonaspa(unit) {
    if (!unit) return false;
    if (window.AoE2Combat && typeof window.AoE2Combat.isMonaspa === 'function') {
      return window.AoE2Combat.isMonaspa(unit);
    }
    const uid = Number(unit.ID ?? unit.id);
    if (uid === 1747 || uid === 1749 || uid === 1803 || uid === 1805) return true;
    const name = String(unit.internal_name || unit.name || unit.localizedName || "").toLowerCase();
    return name.includes("monaspa");
  }

  function updateStacksMetaLabel(side, unit, civName) {
    const s = side.toUpperCase();
    const metaEl = DOM[`duelStacksMeta${s}`];
    if (!metaEl) return;

    const normCiv = normalizeCivKey(civName);
    const isLithuanianCiv = normCiv === 'Lithuanians';
    const isJaguar = [725, 726].includes(Number(unit?.ID));
    const isTiger = [1949, 1951].includes(Number(unit?.ID));
    const isMona = isMonaspa(unit);

    if (isMona) {
      metaEl.textContent = 'Monaspa (+1 Atk en grupo, máx +4)';
    } else if (isLithuanianCiv) {
      metaEl.textContent = 'Lituanos (+1 Atk por reliquia, máx +4)';
    } else if (isJaguar) {
      metaEl.textContent = 'Guerrero Jaguar (+1 Atk por baja, máx +4)';
    } else if (isTiger) {
      metaEl.textContent = 'Caballería Tigresa (+10 HP / +1 Atk por acumulación)';
    } else {
      metaEl.textContent = 'Lituanos (Reliquias) • Jaguar (+1 Atk) • Tigresa (+10 HP / +1 Atk)';
    }
  }

  /**
   * Limpia inmediatamente el panel de mejoras al cambiar entre una unidad terrestre y un barco
   * para no transferir bonos de armadura o velocidad residuales entre tipos de unidad distintos.
   */
  function resetUpgradesPanelForSide(side) {
    const s = side.toUpperCase();

    // Limpiar selectores terrestres de Herrería
    ['duelSmithMelee', 'duelSmithPierce', 'duelArmor', 'duelArmorCav', 'duelArmorArch'].forEach(prefix => {
      const el = DOM[`${prefix}${s}`];
      if (el) el.value = '0';
    });

    // Limpiar checkboxes terrestres
    [
      'duelBloodlines',
      'duelHusbandry',
      'duelSquires',
      'duelGambesons',
      'duelThumbRing',
      'duelParthian',
      'duelCranequins',
      'duelChemistry',
      'duelCenturion'
    ].forEach(prefix => {
      const el = DOM[`${prefix}${s}`];
      if (el) el.checked = false;
    });

    // Limpiar checkboxes navales de Universidad
    [
      'duelCareening',
      'duelDryDock',
      'duelClinker',
      'duelCarvel',
      'duelBallistics',
      'duelNavalChemistry',
      'duelSiphons'
    ].forEach(prefix => {
      const el = DOM[`${prefix}${s}`];
      if (el) el.checked = false;
    });
  }

  function setCheckboxAvailability(el, available) {
    if (!el) return;
    const parentChip = el.closest('.checkbox-chip') || el.closest('.crown-tech-chip');
    if (!available) {
      el.disabled = true;
      el.checked = false;
      el.classList.add('tech-locked');
      if (parentChip) parentChip.classList.add('tech-locked');
    } else {
      el.disabled = false;
      el.classList.remove('tech-locked');
      if (parentChip) parentChip.classList.remove('tech-locked');
    }
  }

  function syncUniqueTechCrownsAgeForSide(side) {
    const s = side.toUpperCase();
    const container = DOM[`uniqueTechsContainer${s}`];
    if (!container) return;
    const selectedAge = getSelectedAgeForSide(side);

    container.querySelectorAll('.unique-tech-checkbox').forEach(cb => {
      const reqAge = getTechRequiredAge(cb.dataset.techId, cb);
      const allowedByAge = selectedAge >= reqAge;
      setCheckboxAvailability(cb, allowedByAge);
    });
  }

  function syncTechTreeUI(sideOrCiv, explicitCivName) {
    if (!state.data || !state.data.civs) return;

    // Permitir invocación sin argumentos (sincroniza ambos lados 'a' y 'b')
    if (!sideOrCiv) {
      syncTechTreeUI('a');
      syncTechTreeUI('b');
      return;
    }

    // Determinar lado ('a' o 'b') y nombre de civilización
    let side = 'a';
    let civName = explicitCivName;
    const normArg = String(sideOrCiv).toLowerCase();

    if (normArg === 'a' || normArg === 'b') {
      side = normArg;
      const s = side.toUpperCase();
      civName = explicitCivName || (DOM[`duelCiv${s}`] ? DOM[`duelCiv${s}`].value : 'Generic');
    } else if (state.data.civs[sideOrCiv] || sideOrCiv === 'Generic') {
      // Si se invocó como syncTechTreeUI(civName)
      civName = sideOrCiv;
      if (DOM.duelCivA && DOM.duelCivA.value === civName) syncTechTreeForSide('a', civName);
      if (DOM.duelCivB && DOM.duelCivB.value === civName) syncTechTreeForSide('b', civName);
      if ((!DOM.duelCivA || DOM.duelCivA.value !== civName) && (!DOM.duelCivB || DOM.duelCivB.value !== civName)) {
        syncTechTreeForSide('a', civName);
      }
      return;
    }

    syncTechTreeForSide(side, civName);
  }

  function syncTechTreeForSide(side, civName) {
    const s = side.toUpperCase();
    const selectedAge = getSelectedAgeForSide(side);
    const normCiv = normalizeCivKey(civName);
    const isSpecificCiv = Boolean(normCiv && normCiv !== 'Generic' && state.data && state.data.civs && state.data.civs[normCiv]);
    const civTechSet = isSpecificCiv
      ? new Set((state.data.civs[normCiv].Tech || []).map(Number))
      : null;

    const hasTech = (techId) => {
      if (!isSpecificCiv || !civTechSet) return true;
      return civTechSet.has(Number(techId));
    };

    const isTechAllowedInAge = (techId, el) => {
      const reqAge = getTechRequiredAge(techId, el);
      return selectedAge >= reqAge;
    };

    // Bloquear/desmarcar coronas únicas cuya edad requerida supere selectedAge
    syncUniqueTechCrownsAgeForSide(side);

    const unitSelectEl = DOM[`duelUnit${s}`];
    const unitId = unitSelectEl ? Number(unitSelectEl.value) : 0;
    const rawUnits = (state.data && state.data.data && state.data.data.Unit) ? state.data.data.Unit : {};
    const unitObj = rawUnits[unitId] || state.unitsList.find(u => u.ID === unitId) || null;
    const navalCat = getNavalCategory(unitObj);
    const isShip = navalCat !== null || isUnitShip(unitObj);
    const currentDomain = isShip ? (navalCat || 'ship') : 'land';

    // 4. REACTIVIDAD Y VALIDACIÓN: Al cambiar entre dominio terrestre y barco (o familias navales), limpiar panel
    if (state.lastUnitDomain[side] !== null && state.lastUnitDomain[side] !== currentDomain) {
      resetUpgradesPanelForSide(side);
    }
    state.lastUnitDomain[side] = currentDomain;

    const landContainer = DOM[`landUpgradesContainer${s}`];
    const navalContainer = DOM[`navalUpgradesContainer${s}`];

    if (isShip) {
      // Ocultar mejoras terrestres y mostrar bloque de Tecnologías Navales de Universidad
      if (landContainer) landContainer.style.display = 'none';
      if (navalContainer) navalContainer.style.display = 'block';

      // Asegurar que ninguna mejora terrestre quede activa mientras es un barco
      [
        DOM[`duelBloodlines${s}`],
        DOM[`duelHusbandry${s}`],
        DOM[`duelSquires${s}`],
        DOM[`duelGambesons${s}`],
        DOM[`duelThumbRing${s}`],
        DOM[`duelParthian${s}`],
        DOM[`duelCranequins${s}`],
        DOM[`duelChemistry${s}`],
        DOM[`duelCenturion${s}`]
      ].forEach(el => setCheckboxAvailability(el, false));

      // 1. Línea Defensiva de Casco (Armadura Pierce):
      // - Carenado (Careening, ID 374, Castillos = 3)
      const careeningEl = DOM[`duelCareening${s}`];
      const careeningAvailable = hasTech(TECH_TREE_GENERAL_IDS.careening) && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.careening, careeningEl);
      setCheckboxAvailability(careeningEl, careeningAvailable);

      // - Dique seco (Dry Dock, ID 375, Imperial = 4): Requiere Carenado activo
      const dryDockEl = DOM[`duelDryDock${s}`];
      const dryDockAvailable = hasTech(TECH_TREE_GENERAL_IDS.dryDock)
        && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.dryDock, dryDockEl)
        && Boolean(careeningEl && careeningEl.checked && !careeningEl.disabled);
      setCheckboxAvailability(dryDockEl, dryDockAvailable);

      // 2. Línea de Navegación (Velocidad):
      // - Construcción con tingladillo (Clinker Construction, ID 908, Castillos = 3)
      const clinkerEl = DOM[`duelClinker${s}`];
      const clinkerAvailable = hasTech(TECH_TREE_GENERAL_IDS.clinker) && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.clinker, clinkerEl);
      setCheckboxAvailability(clinkerEl, clinkerAvailable);

      // - Casco liso (Carvel Hull, ID 907 / 909, Imperial = 4): Requiere Tingladillo activo
      const carvelEl = DOM[`duelCarvel${s}`];
      const carvelAvailable = (hasTech(TECH_TREE_GENERAL_IDS.carvelHull) || hasTech(909))
        && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.carvelHull, carvelEl)
        && Boolean(clinkerEl && clinkerEl.checked && !clinkerEl.disabled);
      setCheckboxAvailability(carvelEl, carvelAvailable);

      // 3. Balística y Artillería:
      // - Balística (Ballistics, ID 93, Castillos = 3)
      const ballisticsEl = DOM[`duelBallistics${s}`];
      setCheckboxAvailability(ballisticsEl, hasTech(TECH_TREE_GENERAL_IDS.ballistics) && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.ballistics, ballisticsEl));
      // - Química (Chemistry, ID 47, Imperial = 4)
      const navalChemEl = DOM[`duelNavalChemistry${s}`];
      setCheckboxAvailability(navalChemEl, hasTech(TECH_TREE_GENERAL_IDS.chemistry) && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.chemistry, navalChemEl));
      // - Sifones / Incendiarias (ID 909 / 910 / 464, Castillos = 3)
      const siphonsEl = DOM[`duelSiphons${s}`];
      const siphonsAvailable = (hasTech(TECH_TREE_GENERAL_IDS.siphons) || hasTech(TECH_TREE_GENERAL_IDS.incendiaries) || hasTech(464))
        && isTechAllowedInAge(TECH_TREE_GENERAL_IDS.siphons, siphonsEl);
      setCheckboxAvailability(siphonsEl, siphonsAvailable);
    } else {
      // Unidad Terrestre: Mostrar contenedor terrestre y ocultar/desactivar contenedor naval
      if (landContainer) landContainer.style.display = 'block';
      if (navalContainer) navalContainer.style.display = 'none';

      [
        DOM[`duelCareening${s}`],
        DOM[`duelDryDock${s}`],
        DOM[`duelClinker${s}`],
        DOM[`duelCarvel${s}`],
        DOM[`duelBallistics${s}`],
        DOM[`duelNavalChemistry${s}`],
        DOM[`duelSiphons${s}`]
      ].forEach(el => setCheckboxAvailability(el, false));

      // Aura Centurión requiere al menos Edad de los Castillos (3)
      const centurionEl = DOM[`duelCenturion${s}`];
      if (centurionEl) {
        const centurionAllowed = selectedAge >= Number(centurionEl.dataset.minAge || 3);
        setCheckboxAvailability(centurionEl, centurionAllowed);
      }

      // 1. Checkboxes generales terrestres: Pureza de sangre (435, Feudal), Química (47, Imperial)
      const generalCheckboxes = [
        { el: DOM[`duelBloodlines${s}`], id: TECH_TREE_GENERAL_IDS.bloodlines },
        { el: DOM[`duelChemistry${s}`], id: TECH_TREE_GENERAL_IDS.chemistry }
      ];

      generalCheckboxes.forEach(({ el, id }) => {
        if (!el) return;
        const techId = Number(el.dataset.techId || id);
        const available = hasTech(techId) && isTechAllowedInAge(techId, el);
        setCheckboxAvailability(el, available);
      });

      // Actualizar etiqueta de Pureza de sangre según civilización (Varegos: +30 HP)
      const currentCivKey = civName || normCiv || '';
      const isVarangianCiv = ['varangian', 'varangians', 'varego', 'varegos'].includes(String(currentCivKey).toLowerCase().trim());
      const bloodlinesLabel = DOM[`duelBloodlinesLabel${s}`];
      if (bloodlinesLabel) {
        bloodlinesLabel.textContent = isVarangianCiv
          ? 'Pureza de sangre (+30 HP Varegos)'
          : 'Pureza de sangre (+20 HP Cab.)';
      }

      // 1b. Mejoras de Movilidad Terrestre (Micro / Kiting):
      const husbandryEl = DOM[`duelHusbandry${s}`];
      if (husbandryEl) {
        const husbandryTechId = Number(husbandryEl.dataset.techId || TECH_TREE_GENERAL_IDS.husbandry);
        const canUseHusbandry = hasTech(husbandryTechId)
          && isTechAllowedInAge(husbandryTechId, husbandryEl)
          && isUnitCavalry(unitObj);
        setCheckboxAvailability(husbandryEl, canUseHusbandry);
      }

      const squiresEl = DOM[`duelSquires${s}`];
      if (squiresEl) {
        const squiresTechId = Number(squiresEl.dataset.techId || TECH_TREE_GENERAL_IDS.squires);
        const canUseSquires = hasTech(squiresTechId)
          && isTechAllowedInAge(squiresTechId, squiresEl)
          && isUnitInfantry(unitObj);
        setCheckboxAvailability(squiresEl, canUseSquires);
      }

      const gambesonsEl = DOM[`duelGambesons${s}`];
      const gambesonsLabel = DOM[`duelGambesonsLabel${s}`];
      if (gambesonsEl) {
        const gambesonsTechId = Number(gambesonsEl.dataset.techId || TECH_TREE_GENERAL_IDS.gambesons);
        const civHasGambesons = hasTech(gambesonsTechId);
        const ageAllowed = isTechAllowedInAge(gambesonsTechId, gambesonsEl);
        const unitQualifies = isGambesonsUnit(unitObj);

        const canUseGambesons = civHasGambesons && ageAllowed && unitQualifies;
        setCheckboxAvailability(gambesonsEl, canUseGambesons);

        if (gambesonsLabel) {
          if (!unitQualifies) {
            gambesonsLabel.textContent = 'Gambesones (Sin efecto sobre esta unidad)';
          } else {
            gambesonsLabel.textContent = 'Gambesones (+1 P. Arm.)';
          }
        }
      }

      const thumbRingEl = DOM[`duelThumbRing${s}`];
      if (thumbRingEl) {
        const thumbRingTechId = Number(thumbRingEl.dataset.techId || TECH_TREE_GENERAL_IDS.thumbRing);
        const canUseThumbRing = hasTech(thumbRingTechId)
          && isTechAllowedInAge(thumbRingTechId, thumbRingEl)
          && isUnitArcher(unitObj);
        setCheckboxAvailability(thumbRingEl, canUseThumbRing);
      }

      const parthianEl = DOM[`duelParthian${s}`];
      if (parthianEl) {
        const parthianTechId = Number(parthianEl.dataset.techId || TECH_TREE_GENERAL_IDS.parthianTactics);
        const canUseParthian = hasTech(parthianTechId)
          && isTechAllowedInAge(parthianTechId, parthianEl)
          && isUnitCavalryArcher(unitObj);
        setCheckboxAvailability(parthianEl, canUseParthian);
      }

      const cranequinsEl = DOM[`duelCranequins${s}`];
      if (cranequinsEl) {
        const cranequinsTechId = Number(cranequinsEl.dataset.techId || TECH_TREE_GENERAL_IDS.cranequins);
        const canUseCranequins = hasTech(cranequinsTechId)
          && isTechAllowedInAge(cranequinsTechId, cranequinsEl)
          && isUnitMountedCrossbow(unitObj);
        setCheckboxAvailability(cranequinsEl, canUseCranequins);
      }
    }

    // =========================================================================
    // 2. CONFIGURACIÓN INTEGRAL DE HERRERÍA (TERRESTRE & NAVAL GENIE ENGINE)
    // =========================================================================
    const bsContainer = DOM[`blacksmithUpgradesContainer${s}`];
    if (bsContainer) {
      if (isShip && (navalCat === 'OTHER_SHIP' || navalCat === null)) {
        bsContainer.style.display = 'none';
      } else {
        bsContainer.style.display = 'block';
      }
    }

    const nativeMelee = (unitObj && Array.isArray(unitObj.Attacks))
      ? unitObj.Attacks.find(a => a.Class === 4 && a.Amount > 0)
      : null;

    const blacksmithSelects = [
      { el: DOM[`duelSmithMelee${s}`], row: DOM[`duelSmithMeleeRow${s}`], map: TECH_TREE_BLACKSMITH_MAP.melee, type: 'melee' },
      { el: DOM[`duelSmithPierce${s}`], row: DOM[`duelSmithPierceRow${s}`], map: TECH_TREE_BLACKSMITH_MAP.pierce, type: 'pierce' },
      { el: DOM[`duelArmor${s}`], row: DOM[`duelArmorRow${s}`], map: TECH_TREE_BLACKSMITH_MAP.infArmor, type: 'infArmor' },
      { el: DOM[`duelArmorCav${s}`], row: DOM[`duelArmorCavRow${s}`], map: TECH_TREE_BLACKSMITH_MAP.cavArmor, type: 'cavArmor' },
      { el: DOM[`duelArmorArch${s}`], row: DOM[`duelArmorArchRow${s}`], map: TECH_TREE_BLACKSMITH_MAP.archArmor, type: 'archArmor' }
    ];

    blacksmithSelects.forEach(({ el, row, map, type }) => {
      if (!el) return;

      let isAllowed = false;

      if (isShip) {
        // Matriz de Herrería Naval (Genie Engine):
        // - MELEE_SHIP: Solo Herrería Melee (Forja, Fundición, Alto Horno)
        // - ARROW_SHIP: Solo Herrería Flechas (Sílex, Punzón, Braserío)
        // - OTHER_SHIP: Ninguna herrería
        // - Armaduras Herrería: Ningún navío en el juego recibe armadura de la herrería
        if (type === 'melee' && navalCat === 'MELEE_SHIP') {
          isAllowed = true;
        } else if (type === 'pierce' && navalCat === 'ARROW_SHIP') {
          isAllowed = true;
        } else {
          isAllowed = false;
        }
      } else {
        // Matriz de Herrería Terrestre:
        // Los escorpiones y máquinas de asedio NO reciben mejoras de herrería en el motor Genie
        const isScorpion = [279, 542].includes(unitId) ||
          (unitObj && ['SCBAL', 'HWBAL'].includes(unitObj.internal_name)) ||
          (unitObj && String(unitObj.name || unitObj.localizedName || '').toLowerCase().includes('escorp'));
        const isSiegeWeapon = hasUnitArmourClass(unitObj, 20) || isScorpion;

        if (isSiegeWeapon) {
          isAllowed = false;
        } else if (type === 'melee') {
          isAllowed = Boolean(nativeMelee);
        } else if (type === 'pierce') {
          isAllowed = true;
        } else if (type === 'infArmor') {
          // Armadura de infantería exclusiva para infantería (excluye caballería y camellos)
          isAllowed = isUnitInfantry(unitObj);
        } else if (type === 'cavArmor') {
          isAllowed = isUnitCavalry(unitObj);
        } else if (type === 'archArmor') {
          isAllowed = isUnitArcher(unitObj);
        }
      }

      if (row) {
        const isScorpOrSiege = [279, 542].includes(unitId) || hasUnitArmourClass(unitObj, 20);
        row.style.display = isAllowed ? '' : (isShip || isScorpOrSiege ? 'none' : '');
      }

      if (!isAllowed) {
        el.disabled = true;
        el.value = '0';
        el.classList.add('tech-locked');
        return;
      }

      el.disabled = false;
      el.classList.remove('tech-locked');
      const previousLevel = Number(el.value || 0);

      Array.from(el.options).forEach(opt => {
        const level = Number(opt.value || 0);
        const techId = Number(opt.dataset.techId || (map && map[level]) || 0);

        if (level === 0 || !techId) {
          opt.disabled = false;
          opt.classList.remove('tech-locked');
          return;
        }

        const reqAge = Number(opt.dataset.minAge || TECH_MIN_AGE_MAP[techId] || (level + 1));
        const available = hasTech(techId) && selectedAge >= reqAge;
        opt.disabled = !available;
        if (!available) {
          opt.classList.add('tech-locked');
        } else {
          opt.classList.remove('tech-locked');
        }
      });

      // Si la opción seleccionada quedó deshabilitada, degradar automáticamente al nivel legal máximo
      const currentSelectedOpt = Array.from(el.options).find(o => Number(o.value) === previousLevel);
      if (currentSelectedOpt && currentSelectedOpt.disabled) {
        let fallbackLevel = 0;
        Array.from(el.options).forEach(opt => {
          const lvl = Number(opt.value || 0);
          if (!opt.disabled && lvl <= previousLevel && lvl > fallbackLevel) {
            fallbackLevel = lvl;
          }
        });
        el.value = String(fallbackLevel);
      }
    });

    // Actualizar contextualización visual del slider de acumulaciones (0-4)
    updateStacksMetaLabel(side, unitObj, civName);
  }

  // Exponer globalmente para pruebas e inspección
  window.syncTechTreeUI = syncTechTreeUI;

  /**
   * Renderiza dinámicamente las dos Coronas (Castillos - Plata [Age === 3] e Imperial - Oro [Age === 4])
   * de la civilización activa en #unique-techs-container (o -b).
   */
  function renderUniqueTechsForSide(side, presetCrowns = {}) {
    const s = side.toUpperCase();
    const container = DOM[`uniqueTechsContainer${s}`];
    const civEl = DOM[`duelCiv${s}`];
    if (!container || !civEl) return;

    const civKey = civEl.value || 'Generic';
    const selectedAge = getSelectedAgeForSide(side);

    // Etiqueta dinámica de Pureza de sangre (+30 HP Varegos / +20 HP estándar)
    const isVarangianCiv = ['varangian', 'varangians', 'varego', 'varegos'].includes(String(civKey).toLowerCase().trim());
    const bloodlinesLabel = DOM[`duelBloodlinesLabel${s}`];
    if (bloodlinesLabel) {
      bloodlinesLabel.textContent = isVarangianCiv
        ? 'Pureza de sangre (+30 HP Varegos)'
        : 'Pureza de sangre (+20 HP Cab.)';
    }

    container.innerHTML = '';

    const civTechMap = getCivUniqueTechsByAge(civKey);

    if (!civTechMap || civKey === 'Generic') {
      container.innerHTML = `
        <div class="unique-techs-empty">
          Selecciona una civilización específica para habilitar sus Coronas de Castillos e Imperial.
        </div>
      `;
      return;
    }

    const rawTechs = (state.data && state.data.data && state.data.data.Tech) ? state.data.data.Tech : {};
    const crowns = [
      {
        tier: 'castle',
        reqAge: 3,
        ageLabel: 'Corona de Castillos (Plata)',
        crownClass: 'crown-silver',
        iconSrc: './img/Tech/33.png',
        techId: civTechMap.castle,
        checked: Boolean(presetCrowns.castleCrown) && selectedAge >= 3
      },
      {
        tier: 'imperial',
        reqAge: 4,
        ageLabel: 'Corona Imperial (Oro)',
        crownClass: 'crown-gold',
        iconSrc: './img/Tech/107.png',
        techId: civTechMap.imperial,
        checked: Boolean(presetCrowns.imperialCrown) && selectedAge >= 4
      }
    ];

    crowns.forEach(crown => {
      if (!crown.techId) return;
      const techObj = rawTechs[crown.techId] || { ID: crown.techId, Age: crown.reqAge, internal_name: `Tech #${crown.techId}` };
      const techName = resolveTechName(techObj);
      const techDesc = resolveTechDescription(techObj);

      const label = document.createElement('label');
      label.className = `tech-toggle-chip crown-tech-chip ${crown.crownClass}`;
      if (techDesc) label.title = techDesc;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'unique-tech-checkbox';
      checkbox.dataset.side = side;
      checkbox.dataset.tier = crown.tier;
      checkbox.dataset.age = String(crown.reqAge);
      checkbox.dataset.minAge = String(crown.reqAge);
      checkbox.dataset.techId = String(crown.techId);
      checkbox.checked = crown.checked;

      checkbox.addEventListener('change', () => {
        updateStats(side);
        runSimulation({ preserveCardHP: true });
      });

      const iconImg = document.createElement('img');
      iconImg.src = crown.iconSrc;
      iconImg.alt = crown.ageLabel;
      iconImg.className = 'crown-icon-img';
      iconImg.onerror = function () { this.style.display = 'none'; };

      const textWrap = document.createElement('span');
      textWrap.className = 'crown-tech-text';
      textWrap.innerHTML = `
        <span class="crown-badge-age">${crown.tier === 'castle' ? 'Castillos:' : 'Imperial:'}</span>
        <strong class="crown-tech-name">${techName}</strong>
        <small class="crown-tech-hint"></small>
      `;

      label.appendChild(checkbox);
      label.appendChild(iconImg);
      label.appendChild(textWrap);
      container.appendChild(label);

      // Bloquear si la edad requerida de la corona supera selectedAge
      setCheckboxAvailability(checkbox, selectedAge >= crown.reqAge);
    });

    updateCrownRelevanceUI(side);
  }

  const PRESET_CONFIGS = {
    'paladin-vs-halberdier': {
      a: { unitId: 569, civ: 'Franks', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: true, husbandry: true, squires: false, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' },
      b: { unitId: 359, civ: 'Generic', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: false, husbandry: false, squires: true, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' }
    },
    'leitis-vs-paladin': {
      a: { unitId: 1236, civ: 'Lithuanians', age: 4, stacks: 4, melee: 3, pierce: 0, armor: 3, bloodlines: true, husbandry: true, squires: false, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' },
      b: { unitId: 569, civ: 'Teutons', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: true, husbandry: false, squires: false, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' }
    },
    'coustillier-vs-champion': {
      a: { unitId: 1657, civ: 'Burgundians', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: true, husbandry: true, squires: false, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' },
      b: { unitId: 567, civ: 'Generic', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: false, husbandry: false, squires: true, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' }
    },
    'shrivamsha-vs-arbalester': {
      a: { unitId: 1753, civ: 'Gurjaras', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: true, husbandry: true, squires: false, thumbRing: false, chemistry: false, centurion: false, castleCrown: false, imperialCrown: false, elev: 'flat' },
      b: { unitId: 492, civ: 'Britons', age: 4, stacks: 0, melee: 0, pierce: 3, armor: 3, bloodlines: false, husbandry: false, squires: false, thumbRing: true, chemistry: true, centurion: false, castleCrown: true, imperialCrown: false, elev: 'flat' }
    },
    'chukonu-vs-champion': {
      a: { unitId: 559, civ: 'Chinese', age: 4, stacks: 0, melee: 0, pierce: 3, armor: 3, bloodlines: false, husbandry: false, squires: false, thumbRing: true, chemistry: true, centurion: false, castleCrown: false, imperialCrown: true, elev: 'flat' },
      b: { unitId: 567, civ: 'Generic', age: 4, stacks: 0, melee: 3, pierce: 0, armor: 3, bloodlines: false, husbandry: false, squires: true, thumbRing: false, chemistry: false, centurion: true, castleCrown: false, imperialCrown: false, elev: 'flat' }
    }
  };

  function initDuelArena() {
    if (state.duelInitialized || !DOM.duelCivA) return;

    // 1. Poblar selectores de civilizaciones
    DOM.duelCivA.innerHTML = '';
    DOM.duelCivB.innerHTML = '';

    const genericOptA = document.createElement('option');
    genericOptA.value = 'Generic';
    genericOptA.textContent = 'Genérico (Sin bonificación)';
    DOM.duelCivA.appendChild(genericOptA);

    const genericOptB = genericOptA.cloneNode(true);
    DOM.duelCivB.appendChild(genericOptB);

    state.civsList.forEach(({ key, name }) => {
      const optA = document.createElement('option');
      optA.value = key;
      optA.textContent = name;
      DOM.duelCivA.appendChild(optA);

      const optB = optA.cloneNode(true);
      DOM.duelCivB.appendChild(optB);
    });

    // 2. Seleccionar configuración inicial (Franks Paladin vs Generic Halberdier en Edad Imperial)
    DOM.duelCivA.value = 'Franks';
    DOM.duelCivB.value = 'Generic';
    if (DOM.duelAgeA) DOM.duelAgeA.value = '4';
    if (DOM.duelAgeB) DOM.duelAgeB.value = '4';

    // 3. Poblar selectores de unidades filtrados por civilización y edad activa
    populateDuelUnitSelect('a', 569); // Paladín
    populateDuelUnitSelect('b', 359); // Alabardero

    // 4. Sincronizar bloqueo dinámico del árbol tecnológico por civilización, unidad y edad
    syncTechTreeUI('a');
    syncTechTreeUI('b');

    // 5. Renderizar las coronas dinámicas de cada civilización
    renderUniqueTechsForSide('a');
    renderUniqueTechsForSide('b');

    // Inicializar sliders de stacks a 0
    if (DOM.duelStacksA && DOM.duelStacksValA) {
      DOM.duelStacksA.value = 0;
      DOM.duelStacksValA.textContent = '0';
    }
    if (DOM.duelStacksB && DOM.duelStacksValB) {
      DOM.duelStacksB.value = 0;
      DOM.duelStacksValB.textContent = '0';
    }

    // Actualizar tarjetas de combatientes y simulación inicial
    updateStats('a');
    updateStats('b');
    runSimulation({ preserveCardHP: true });

    state.duelInitialized = true;
  }

  function getCleanUnitById(unitId) {
    const id = Number(unitId);
    const indexedUnit = state.unitsList.find(u => u.ID === id);
    const rawUnit = (state.data && state.data.data && state.data.data.Unit)
      ? state.data.data.Unit[id]
      : null;

    if (!rawUnit && !indexedUnit) return null;
    const baseSource = rawUnit || indexedUnit;
    return {
      ...baseSource,
      ID: id,
      localizedName: indexedUnit ? indexedUnit.localizedName : resolveUnitName(baseSource),
      description: indexedUnit ? indexedUnit.description : resolveUnitDescription(baseSource),
      age: indexedUnit ? indexedUnit.age : (UNIT_AGE_MAP[id] || 4),
      Attacks: Array.isArray(baseSource.Attacks) ? baseSource.Attacks.map(a => ({ ...a })) : [],
      Armours: Array.isArray(baseSource.Armours) ? baseSource.Armours.map(a => ({ ...a })) : [],
      Cost: baseSource.Cost ? { ...baseSource.Cost } : {}
    };
  }

  function getFighterOptions(side) {
    const s = side.toUpperCase();
    const rawCiv = DOM[`duelCiv${s}`] ? DOM[`duelCiv${s}`].value : 'Generic';
    const civVal = normalizeCivKey(rawCiv);
    const selectedAge = getSelectedAgeForSide(side);

    const unitId = DOM[`duelUnit${s}`] ? Number(DOM[`duelUnit${s}`].value) : 0;
    const cleanUnit = getCleanUnitById(unitId);
    const unitObj = cleanUnit;
    const navalCat = getNavalCategory(cleanUnit);
    const isShip = navalCat !== null || isUnitShip(cleanUnit);
    const nativeMelee = cleanUnit?.Attacks?.find(a => a.Class === 4 && a.Amount > 0);

    const elevVal = DOM[`duelElev${s}`] ? DOM[`duelElev${s}`].value : 'flat';
    const stacksVal = DOM[`duelStacks${s}`] ? Number(DOM[`duelStacks${s}`].value) || 0 : 0;

    let meleeVal = 0;
    let pierceVal = 0;
    let infArmorVal = 0;
    let cavArmorVal = 0;
    let archArmorVal = 0;

    if (isShip) {
      // Reglas segregadas Genie Engine para navíos:
      // MELEE_SHIP: Sí recibe Herrería Melee
      if (navalCat === 'MELEE_SHIP' && DOM[`duelSmithMelee${s}`] && !DOM[`duelSmithMelee${s}`].disabled) {
        meleeVal = Number(DOM[`duelSmithMelee${s}`].value) || 0;
      }
      // ARROW_SHIP: Sí recibe Herrería Flechas (+1 Atk / +1 Rango por nivel)
      if (navalCat === 'ARROW_SHIP' && DOM[`duelSmithPierce${s}`] && !DOM[`duelSmithPierce${s}`].disabled) {
        pierceVal = Number(DOM[`duelSmithPierce${s}`].value) || 0;
      }
      // NINGÚN navío en el juego recibe armaduras de herrería
      infArmorVal = 0;
      cavArmorVal = 0;
      archArmorVal = 0;
    } else {
      const isScorp = [279, 542].includes(unitId) || (cleanUnit && ['SCBAL', 'HWBAL'].includes(cleanUnit.internal_name));
      const isSiegeWeapon = hasUnitArmourClass(cleanUnit, 20) || isScorp;
      if (isSiegeWeapon) {
        // En Genie Engine, las armas de asedio y escorpiones no reciben mejoras de herrería
        meleeVal = 0;
        pierceVal = 0;
        infArmorVal = 0;
        cavArmorVal = 0;
        archArmorVal = 0;
      } else {
        meleeVal = (nativeMelee && DOM[`duelSmithMelee${s}`] && !DOM[`duelSmithMelee${s}`].disabled)
          ? Number(DOM[`duelSmithMelee${s}`].value) || 0
          : 0;
        pierceVal = (DOM[`duelSmithPierce${s}`] && !DOM[`duelSmithPierce${s}`].disabled)
          ? Number(DOM[`duelSmithPierce${s}`].value) || 0
          : 0;
        infArmorVal = (DOM[`duelArmor${s}`] && !DOM[`duelArmor${s}`].disabled) ? Number(DOM[`duelArmor${s}`].value) || 0 : 0;
        cavArmorVal = (DOM[`duelArmorCav${s}`] && !DOM[`duelArmorCav${s}`].disabled) ? Number(DOM[`duelArmorCav${s}`].value) || 0 : 0;
        archArmorVal = (DOM[`duelArmorArch${s}`] && !DOM[`duelArmorArch${s}`].disabled) ? Number(DOM[`duelArmorArch${s}`].value) || 0 : 0;
      }
    }

    const isCheckedAndEnabled = (el) => Boolean(el && !el.disabled && el.checked);

    const bloodlinesVal = isCheckedAndEnabled(DOM[`duelBloodlines${s}`]);
    const husbandryVal = isCheckedAndEnabled(DOM[`duelHusbandry${s}`]);
    const squiresVal = isCheckedAndEnabled(DOM[`duelSquires${s}`]);
    const gambesonsVal = isCheckedAndEnabled(DOM[`duelGambesons${s}`]);
    const thumbRingVal = isCheckedAndEnabled(DOM[`duelThumbRing${s}`]);
    const parthianVal = isCheckedAndEnabled(DOM[`duelParthian${s}`]);
    const cranequinsVal = isCheckedAndEnabled(DOM[`duelCranequins${s}`]);
    const chemistryVal = isCheckedAndEnabled(DOM[`duelChemistry${s}`]);
    const centurionVal = isCheckedAndEnabled(DOM[`duelCenturion${s}`]);

    // Rama Naval de la Universidad (7 mejoras)
    const careeningVal = isCheckedAndEnabled(DOM[`duelCareening${s}`]);
    const dryDockVal = careeningVal && isCheckedAndEnabled(DOM[`duelDryDock${s}`]);
    const clinkerVal = isCheckedAndEnabled(DOM[`duelClinker${s}`]);
    const carvelHullVal = clinkerVal && isCheckedAndEnabled(DOM[`duelCarvel${s}`]);
    const ballisticsVal = isCheckedAndEnabled(DOM[`duelBallistics${s}`]);
    const navalChemistryVal = isCheckedAndEnabled(DOM[`duelNavalChemistry${s}`]);
    const siphonsVal = isCheckedAndEnabled(DOM[`duelSiphons${s}`]);

    // Leer coronas dinámicas seleccionadas en el contenedor de tecnologías únicas
    const container = DOM[`uniqueTechsContainer${s}`];
    let castleCrown = false;
    let imperialCrown = false;
    const activeUniqueTechs = [];

    if (container) {
      container.querySelectorAll('.unique-tech-checkbox').forEach(cb => {
        if (cb.checked && !cb.disabled) {
          if (cb.dataset.tier === 'castle') castleCrown = true;
          if (cb.dataset.tier === 'imperial') imperialCrown = true;
          if (cb.dataset.techId) activeUniqueTechs.push(Number(cb.dataset.techId));
        }
      });
    }

    const isBerber = ['berbers', 'bereberes'].includes(civVal.toLowerCase());
    const maghrebiCamels = isBerber && (imperialCrown || activeUniqueTechs.includes(579) || activeUniqueTechs.includes(563));

    const isKhitan = ['khitan', 'khitans', 'kithan'].includes(civVal.toLowerCase());
    const lamellarArmor = isKhitan && (castleCrown || activeUniqueTechs.includes(1006));
    const khitanGoldCrown = isKhitan && (imperialCrown || activeUniqueTechs.includes(1007));

    const isTupi = ['tupi', 'tupí', 'tupis'].includes(civVal.toLowerCase());
    const tupiGoldCrown = isTupi && (imperialCrown || activeUniqueTechs.includes(1393));

    const isKorean = ['koreans', 'coreanos', 'korean'].includes(civVal.toLowerCase());
    const shinkichon = isKorean && (imperialCrown || activeUniqueTechs.includes(445));

    const isJurchen = ['jurchen', 'jurchens', 'yurchen', 'yurchenos'].includes(civVal.toLowerCase());
    const thunderclapBombs = isJurchen && (imperialCrown || activeUniqueTechs.includes(997) || activeUniqueTechs.includes(996));

    const isMayan = ['mayans', 'mayas', 'mayan'].includes(civVal.toLowerCase());
    const hulche = isMayan && (castleCrown || activeUniqueTechs.includes(485));

    const isKhmer = ['khmer', 'khmers', 'jemeres'].includes(civVal.toLowerCase());
    const doubleCrossbow = isKhmer && (imperialCrown || activeUniqueTechs.includes(623));

    const isChinese = ['chinese', 'chinos', 'chino'].includes(civVal.toLowerCase());
    const rocketry = isChinese && (imperialCrown || activeUniqueTechs.includes(52));

    const isShu = ['shu'].includes(civVal.toLowerCase());
    const boltMagazine = isShu && (imperialCrown || activeUniqueTechs.includes(1069));

    return {
      civ: civVal,
      civName: civVal,
      age: selectedAge,
      selectedAge,
      elevation: elevVal,
      stacks: stacksVal,
      meleeSmithing: meleeVal,
      pierceSmithing: pierceVal,
      armorUpgrade: isUnitArcher(cleanUnit) ? archArmorVal : (isUnitCavalry(cleanUnit) ? cavArmorVal : infArmorVal),
      infantryArmorUpgrade: isUnitInfantry(cleanUnit) ? infArmorVal : 0,
      cavalryArmorUpgrade: isUnitCavalry(cleanUnit) ? cavArmorVal : 0,
      archerArmorUpgrade: archArmorVal,
      bloodlines: bloodlinesVal,
      husbandry: husbandryVal,
      squires: squiresVal,
      gambesons: gambesonsVal,
      thumbRing: thumbRingVal,
      parthianTactics: parthianVal,
      cranequins: cranequinsVal,
      chemistry: chemistryVal,
      centurionAura: centurionVal,
      careening: careeningVal,
      dryDock: dryDockVal,
      clinker: clinkerVal,
      carvelHull: carvelHullVal,
      ballistics: ballisticsVal,
      navalChemistry: navalChemistryVal,
      siphons: siphonsVal,
      incendiaries: siphonsVal,
      castleCrown,
      imperialCrown,
      uniqueCastleTech: castleCrown,
      uniqueImpTech: imperialCrown,
      hulche,
      doubleCrossbow,
      maghrebiCamels,
      lamellarArmor,
      khitanGoldCrown,
      tupiGoldCrown,
      curare: tupiGoldCrown,
      shinkichon,
      koreanCrown: shinkichon,
      thunderclapBombs,
      jurchenCrown: thunderclapBombs,
      rocketry,
      coheteria: rocketry,
      chineseCrown: rocketry,
      boltMagazine,
      cargador: boltMagazine,
      shuCrown: boltMagazine,
      activeUniqueTechs,
      hasWootzSteel: activeUniqueTechs.includes(832),
      hasCivBonuses: Boolean(civVal && civVal !== 'Generic'),
      civBonuses: state.civBonuses,
      gameData: state.data
    };
  }

  /**
   * 2. CONSUMO DINÁMICO DE data/civ_bonuses.json POR EDAD & ACTUALIZACIÓN DE ESTADÍSTICAS
   * Durante updateStats(combatant), tras aplicar los valores base de la unidad limpia desde
   * data.data.Unit[unitId], recorre programáticamente civ_bonuses[combatant.civName] || []
   * filtrando por selectedAge >= bonus.minAge y aplicando escalado por edad y mejoras activas.
   */
  function updateStats(sideOrCombatant) {
    if (!sideOrCombatant) {
      updateStats('a');
      updateStats('b');
      return;
    }

    // Soportar invocación programática pasando un objeto combatant directamente
    if (typeof sideOrCombatant === 'object' && sideOrCombatant !== null) {
      const rawTargetCiv = sideOrCombatant.civName || sideOrCombatant.civ || 'Generic';
      const targetCiv = normalizeCivKey(rawTargetCiv);
      const targetAge = Number(sideOrCombatant.selectedAge ?? sideOrCombatant.age ?? 4);
      const baseUnit = getCleanUnitById(sideOrCombatant.ID || sideOrCombatant.unitId);
      if (baseUnit && window.AoE2Combat) {
        return window.AoE2Combat.initCombatant(baseUnit, {
          ...sideOrCombatant,
          civ: targetCiv,
          civName: targetCiv,
          age: targetAge,
          selectedAge: targetAge,
          civBonuses: state.civBonuses,
          gameData: state.data
        });
      }
      return sideOrCombatant;
    }

    const side = String(sideOrCombatant).toLowerCase();
    const s = side.toUpperCase();
    if (!DOM[`duelUnit${s}`]) return;

    const unitId = Number(DOM[`duelUnit${s}`].value);
    const cleanUnit = getCleanUnitById(unitId);
    if (!cleanUnit || !window.AoE2Combat) return;

    const rawCivName = DOM[`duelCiv${s}`] ? DOM[`duelCiv${s}`].value : 'Generic';
    const civName = normalizeCivKey(rawCivName);

    // Validar visibilidad terrestre/naval, edad seleccionada y árbol tecnológico para la unidad seleccionada
    syncTechTreeForSide(side, civName);
    if (window.combatSimulator && typeof window.combatSimulator.updateModifiersAvailability === 'function') {
      window.combatSimulator.updateModifiersAvailability(cleanUnit, side, DOM);
    }

    // Actualizar en tiempo real el indicador de relevancia de las coronas para la unidad seleccionada
    updateCrownRelevanceUI(side, cleanUnit);

    const options = getFighterOptions(side);
    // Siempre instanciar partiendo de los valores base limpios desde data.data.Unit[unitId]
    const unit = window.AoE2Combat.initCombatant(cleanUnit, options);

    // Contextualizar dinámicamente la leyenda del control deslizante de acumulaciones (0-4)
    updateStacksMetaLabel(side, unit, civName);

    // 3. REPARACIÓN DEL HP INICIAL: tras aplicar los modificadores de vida (como Pureza de sangre +20 HP)
    unit.currentHP = unit.HP;
    unit.maxHP = unit.HP;

    // 4. Actualizar dinámicamente el icono/imagen de la unidad con fallback elegante
    const imgEl = DOM[`duelImg${s}`];
    const fallbackEl = DOM[`duelImgFallback${s}`];
    if (imgEl) {
      delete imgEl.dataset.triedFallback;
      imgEl.style.display = 'block';
      if (fallbackEl) fallbackEl.style.display = 'none';

      imgEl.onerror = function () {
        if (!this.dataset.triedFallback) {
          this.dataset.triedFallback = '1';
          this.src = `./img/Unit/${unit.ID}.png`;
        } else {
          this.onerror = null;
          this.src = './img/missing.svg';
        }
      };
      imgEl.src = `./img/units/${unit.ID}.png`;
      imgEl.alt = unit.localizedName;
    }

    // Nombre y metadata (mostrando edad activa del combatiente)
    if (DOM[`duelName${s}`]) DOM[`duelName${s}`].textContent = unit.localizedName;
    if (DOM[`duelMeta${s}`]) {
      const civObj = state.civsList.find(c => c.key === unit.civ || c.key === normalizeCivKey(unit.civ) || c.name.toLowerCase() === String(unit.civ).toLowerCase());
      const civLabel = civObj ? civObj.name : (unit.civ !== 'Generic' ? unit.civ : 'Genérico');
      const activeAge = options.selectedAge || cleanUnit.age;
      const ageLabel = AGE_NAMES[activeAge] ? AGE_NAMES[activeAge].name : `Edad ${activeAge}`;
      let regenLabel = '';
      if (unit.regenRate > 0) {
        const perMin = Math.round(unit.regenRate * 60);
        regenLabel = ` • ✚ ${perMin} HP/min`;
      }
      let poisonLabel = '';
      const poison = unit.poisonProfile || (typeof getPoisonProfile === 'function' ? getPoisonProfile(unit, options.civName || unit.civ, options) : (window.getPoisonProfile && window.getPoisonProfile(unit, options.civName || unit.civ, options)));
      if (poison) {
        poisonLabel = ` • 🧪 Veneno ${poison.totalDamage} HP/${poison.duration}s`;
      }
      let ballisticLabel = '';
      const ballistic = unit.ballisticProfile || (typeof getBallisticProfile === 'function' ? getBallisticProfile(unit, options.civName || unit.civ, options) : (window.AoE2Ballistics && window.AoE2Ballistics.getBallisticProfile(unit, options.civName || unit.civ, options)));
      if (ballistic) {
        if (ballistic.isRocketCart) {
          const extraDmg = ballistic.projectileImpact?.extraDamage ? `+${ballistic.projectileImpact.extraDamage}` : '';
          const deathTxt = ballistic.deathImpact ? ` • 💥 Detonación (${ballistic.deathImpact.damage} dmg)` : '';
          ballisticLabel = ` • 🚀 ${ballistic.projectiles} cohetes (${ballistic.baseDamage}${extraDmg} daño puro/c-u)${deathTxt}`;
        } else if (ballistic.projectiles > 1) {
          ballisticLabel = ` • 🏹 ${ballistic.projectiles} proyectiles`;
        } else if (ballistic.ignoresArmor) {
          ballisticLabel = ` • 🎯 Ignora 100% antiproyectil`;
        }
      }
      DOM[`duelMeta${s}`].textContent = `ID #${unit.ID} • ${civLabel} • ${ageLabel}${regenLabel}${poisonLabel}${ballisticLabel}`;
    }

    // 0. RENDERIZADO VISUAL DE COSTES DE RECURSOS EN LA TARJETA DEL COMBATIENTE
    const activeAgeKey = options.selectedAge === 1 ? 'dark' : (options.selectedAge === 2 ? 'feudal' : (options.selectedAge === 3 ? 'castle' : 'imperial'));
    if (typeof renderCombatantCost === 'function') {
      renderCombatantCost(side, cleanUnit, civName, activeAgeKey, options.activeUniqueTechs);
    } else if (typeof window !== 'undefined' && window.combatSimulator && typeof window.combatSimulator.renderCombatantCost === 'function') {
      window.combatSimulator.renderCombatantCost(side, cleanUnit, civName, activeAgeKey, options.activeUniqueTechs);
    } else if (typeof window !== 'undefined' && typeof window.renderCombatantCost === 'function') {
      window.renderCombatantCost(side, cleanUnit, civName, activeAgeKey, options.activeUniqueTechs);
    }

    // 1. ESTADO PRE-COMBATE EN updateStats():
    // Restaura visualmente las tarjetas al 100% de vida (Pre-combate)
    if (side === 'a') {
      const combatantA = unit;
      const barA = document.querySelector('.combatant-left .hp-bar-fill') || document.querySelector('#hpBarA') || DOM.duelHpFillA;
      const labelA = document.querySelector('.combatant-left .hp-label') || document.querySelector('#hpLabelA') || DOM.duelHpTextA;
      if (barA) {
        barA.style.transition = 'width 0.3s ease, background-color 0.3s ease';
        barA.style.width = '100%';
        barA.style.backgroundColor = '#22c55e';
        barA.textContent = '100%';
        barA.classList.remove('damaged', 'critical');
      }
      if (labelA) {
        labelA.textContent = `${combatantA.HP} / ${combatantA.HP} HP`;
      }
      if (DOM.duelHpBarTextA) {
        DOM.duelHpBarTextA.textContent = `${combatantA.HP} HP`;
      }
    } else if (side === 'b') {
      const combatantB = unit;
      const barB = document.querySelector('.combatant-right .hp-bar-fill') || document.querySelector('#hpBarB') || DOM.duelHpFillB;
      const labelB = document.querySelector('.combatant-right .hp-label') || document.querySelector('#hpLabelB') || DOM.duelHpTextB;
      if (barB) {
        barB.style.transition = 'width 0.3s ease, background-color 0.3s ease';
        barB.style.width = '100%';
        barB.style.backgroundColor = '#22c55e';
        barB.textContent = '100%';
        barB.classList.remove('damaged', 'critical');
      }
      if (labelB) {
        labelB.textContent = `${combatantB.HP} / ${combatantB.HP} HP`;
      }
      if (DOM.duelHpBarTextB) {
        DOM.duelHpBarTextB.textContent = `${combatantB.HP} HP`;
      }
    }

    // 2. ELIMINACIÓN TOTAL DEL ATAQUE MELEE FANTASMA (4 (M)):
    // Comprobar estrictamente si la unidad limpia posee ataque melee nativo (> 0)
    const nativeMelee = cleanUnit.Attacks?.find(a => a.Class === 4 && a.Amount > 0);
    if (!nativeMelee && Array.isArray(unit.Attacks)) {
      unit.Attacks = unit.Attacks.filter(a => a.Class !== 4);
    }

    const meleeAtk = nativeMelee ? (unit.Attacks || []).find(a => a.Class === 4 && a.Amount > 0) : null;
    const pierceAtk = (unit.Attacks || []).find(a => a.Class === 3 && a.Amount > 0);
    const totalPierce = pierceAtk ? pierceAtk.Amount : 0;

    let atkDisplay = `${unit.Attack}`;
    if (!nativeMelee && totalPierce > 0) {
      // Si la unidad no tiene daño cuerpo a cuerpo nativo, mostrar únicamente "${totalPierce} (P)"
      atkDisplay = `${totalPierce} (P)`;
    } else if (meleeAtk && meleeAtk.Amount > 0 && totalPierce > 0) {
      atkDisplay = `${meleeAtk.Amount} (M) / ${totalPierce} (P)`;
    } else if (meleeAtk && meleeAtk.Amount > 0) {
      atkDisplay = `${meleeAtk.Amount} (M)`;
    } else if (totalPierce > 0) {
      atkDisplay = `${totalPierce} (P)`;
    }
    if (DOM[`duelStatAtk${s}`]) DOM[`duelStatAtk${s}`].textContent = atkDisplay;

    const meleeArm = (unit.Armours || []).find(a => a.Class === 4);
    if (DOM[`duelStatMelee${s}`]) DOM[`duelStatMelee${s}`].textContent = meleeArm !== undefined ? meleeArm.Amount : unit.MeleeArmor;

    const pierceArm = (unit.Armours || []).find(a => a.Class === 3);
    if (DOM[`duelStatPierce${s}`]) DOM[`duelStatPierce${s}`].textContent = pierceArm !== undefined ? pierceArm.Amount : unit.PierceArmor;

    if (DOM[`duelStatReload${s}`]) DOM[`duelStatReload${s}`].textContent = `${unit.ReloadTime.toFixed(2)}s`;
    if (DOM[`duelStatRange${s}`]) DOM[`duelStatRange${s}`].textContent = unit.Range > 0 ? unit.Range : 'Melee';
    if (DOM[`duelStatSpeed${s}`]) DOM[`duelStatSpeed${s}`].textContent = unit.Speed.toFixed(2);
    return unit;
  }

  const updateFighterCard = updateStats;
  window.updateStats = updateStats;

  function updateHpBar(side, current, max) {
    const s = side.toUpperCase();
    const safeMax = Math.max(1, max);
    const safeCur = Math.max(0, current);
    const pct = Math.max(0, Math.min(100, Math.round((safeCur / safeMax) * 100)));

    if (DOM[`duelHpText${s}`]) {
      DOM[`duelHpText${s}`].textContent = `${safeCur} / ${safeMax}`;
    }
    if (DOM[`duelHpFill${s}`]) {
      DOM[`duelHpFill${s}`].style.width = `${pct}%`;
      DOM[`duelHpFill${s}`].classList.remove('damaged', 'critical');
      if (pct <= 25) {
        DOM[`duelHpFill${s}`].classList.add('critical');
      } else if (pct <= 60) {
        DOM[`duelHpFill${s}`].classList.add('damaged');
      }
    }
    if (DOM[`duelHpBarText${s}`]) {
      DOM[`duelHpBarText${s}`].textContent = `${safeMax} HP`;
    }
  }

  function renderCombatLog(log) {
    if (!DOM.combatLogStream) return;
    DOM.combatLogStream.innerHTML = '';

    if (!log || log.length === 0) {
      DOM.combatLogStream.innerHTML = '<div class="log-entry">Sin eventos registrados.</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    log.forEach(item => {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      if (item.text.includes('💥') || item.text.includes('asesta') || item.text.includes('derrotad') || item.text.includes('👑')) {
        entry.classList.add('log-entry-crit');
      }

      const timeSpan = document.createElement('span');
      timeSpan.className = 'log-time';
      timeSpan.textContent = `[${Number(item.time).toFixed(2)}s]`;

      const textSpan = document.createElement('span');
      textSpan.className = 'log-text';
      textSpan.textContent = ` ${item.text}`;

      entry.appendChild(timeSpan);
      entry.appendChild(textSpan);
      frag.appendChild(entry);
    });

    DOM.combatLogStream.appendChild(frag);
    DOM.combatLogStream.scrollTop = 0;
  }

  function runSimulation(simOpts = {}) {
    if (!window.AoE2Combat || !DOM.duelUnitA || !DOM.duelUnitB) return;

    const unitIdA = Number(DOM.duelUnitA.value);
    const unitIdB = Number(DOM.duelUnitB.value);
    const unitDataA = getCleanUnitById(unitIdA);
    const unitDataB = getCleanUnitById(unitIdB);

    if (!unitDataA || !unitDataB) return;

    const optA = getFighterOptions('a');
    const optB = getFighterOptions('b');

    const combatantA = window.AoE2Combat.initCombatant(unitDataA, optA);
    const combatantB = window.AoE2Combat.initCombatant(unitDataB, optB);

    // Garantizar que el HP inicial de ambos combatientes esté al 100% antes de simular
    combatantA.currentHP = combatantA.HP;
    combatantB.currentHP = combatantB.HP;

    const result = (window.AoE2Combat.simulateCombat || window.AoE2Combat.simulateDuel)(combatantA, combatantB);
    const sim = result;

    // 1. Desglose de daño
    if (DOM.thNameA) DOM.thNameA.textContent = combatantA.localizedName;
    if (DOM.thNameB) DOM.thNameB.textContent = combatantB.localizedName;

    let firstAExtra = '';
    if (sim.firstStrikeAInfo.usedCharge) firstAExtra += ' ⚡ (Carga)';
    if (sim.firstStrikeAInfo.blockedByShield) firstAExtra += ' 🛡️ (Bloqueado)';

    let firstBExtra = '';
    if (sim.firstStrikeBInfo.usedCharge) firstBExtra += ' ⚡ (Carga)';
    if (sim.firstStrikeBInfo.blockedByShield) firstBExtra += ' 🛡️ (Bloqueado)';

    if (DOM.resFirstA) DOM.resFirstA.textContent = `${sim.firstStrikeDamageA}${firstAExtra}`;
    if (DOM.resFirstB) DOM.resFirstB.textContent = `${sim.firstStrikeDamageB}${firstBExtra}`;

    if (DOM.resRegularA) DOM.resRegularA.textContent = `${sim.regularDamageA}`;
    if (DOM.resRegularB) DOM.resRegularB.textContent = `${sim.regularDamageB}`;

    if (DOM.resReloadA) DOM.resReloadA.textContent = `${combatantA.ReloadTime.toFixed(2)}s`;
    if (DOM.resReloadB) DOM.resReloadB.textContent = `${combatantB.ReloadTime.toFixed(2)}s`;

    if (DOM.resDpsA) DOM.resDpsA.textContent = `${sim.dpsA} / s`;
    if (DOM.resDpsB) DOM.resDpsB.textContent = `${sim.dpsB} / s`;

    const isPreCombat = Boolean(simOpts.preserveCardHP);

    // Métricas simétricas en la tabla de desglose
    if (DOM.resHtkA) DOM.resHtkA.textContent = `${sim.combatantA.htk} golpes`;
    if (DOM.resHtkB) DOM.resHtkB.textContent = `${sim.combatantB.htk} golpes`;

    if (DOM.resTtkA) DOM.resTtkA.textContent = `${sim.combatantA.ttk.toFixed(2)}s`;
    if (DOM.resTtkB) DOM.resTtkB.textContent = `${sim.combatantB.ttk.toFixed(2)}s`;

    if (!isPreCombat) {
      if (DOM.resHitsA) DOM.resHitsA.textContent = `${sim.combatantA.hitsLanded} / ${sim.combatantA.htk}`;
      if (DOM.resHitsB) DOM.resHitsB.textContent = `${sim.combatantB.hitsLanded} / ${sim.combatantB.htk}`;
      if (DOM.resHpA) DOM.resHpA.textContent = `${sim.combatantA.remainingHP} / ${combatantA.HP} HP`;
      if (DOM.resHpB) DOM.resHpB.textContent = `${sim.combatantB.remainingHP} / ${combatantB.HP} HP`;
    } else {
      if (DOM.resHitsA) DOM.resHitsA.textContent = `- / ${sim.combatantA.htk}`;
      if (DOM.resHitsB) DOM.resHitsB.textContent = `- / ${sim.combatantB.htk}`;
      if (DOM.resHpA) DOM.resHpA.textContent = `${combatantA.HP} / ${combatantA.HP} HP (100%)`;
      if (DOM.resHpB) DOM.resHpB.textContent = `${combatantB.HP} / ${combatantB.HP} HP (100%)`;
    }

    // 2. Tarjetas de métricas clave (HTK, TTK, Duración, Eficiencia)
    if (DOM.metricHtkA) DOM.metricHtkA.textContent = `${sim.combatantA.htk} golpes`;
    if (DOM.metricHtkB) DOM.metricHtkB.textContent = `${sim.combatantB.htk} golpes`;
    if (DOM.metricTtkA) DOM.metricTtkA.textContent = `${sim.combatantA.ttk.toFixed(2)}s`;
    if (DOM.metricTtkB) DOM.metricTtkB.textContent = `${sim.combatantB.ttk.toFixed(2)}s`;
    if (DOM.metricDuration) DOM.metricDuration.textContent = !isPreCombat ? `${sim.duration.toFixed(2)}s` : '-';

    if (DOM.metricHtk) DOM.metricHtk.textContent = `${sim.combatantA.htk} vs ${sim.combatantB.htk}`;
    if (DOM.metricTtk) DOM.metricTtk.textContent = !isPreCombat ? `${sim.duration.toFixed(2)}s` : '-';
    if (DOM.metricEfficiency) DOM.metricEfficiency.textContent = `${sim.resourceRatio}x`;
    if (DOM.resourceEfficiencyDetail) DOM.resourceEfficiencyDetail.textContent = sim.resourceEfficiency.desc;

    // 3. Resultados del enfrentamiento (Banner de Victoria)
    if (DOM.victoryTitle && DOM.victoryMeta) {
      if (isPreCombat) {
        DOM.victoryTitle.textContent = '👑 Vencedor: Pendiente de simulación';
        DOM.victoryMeta.textContent = 'Presiona "SIMULAR DUELO" para calcular el resultado del combate.';
        if (DOM.victoryBanner) DOM.victoryBanner.className = 'victory-ribbon-banner';
      } else {
        if (sim.winner === 'A') {
          DOM.victoryTitle.textContent = `👑 Vencedor: ${combatantA.localizedName} (Azul)`;
          DOM.victoryMeta.textContent = `Sobrevive con ${sim.combatantA.remainingHP} / ${combatantA.HP} HP (${Math.round((sim.combatantA.remainingHP / combatantA.HP) * 100)}%) tras asestar ${sim.combatantA.hitsLanded} de ${sim.combatantA.htk} golpes (TTK: ${sim.combatantA.ttk.toFixed(2)}s). Duración combate: ${sim.duration.toFixed(2)}s.`;
          if (DOM.victoryBanner) DOM.victoryBanner.className = 'victory-ribbon-banner victory-a';
        } else if (sim.winner === 'B') {
          DOM.victoryTitle.textContent = `👑 Vencedor: ${combatantB.localizedName} (Rojo)`;
          DOM.victoryMeta.textContent = `Sobrevive con ${sim.combatantB.remainingHP} / ${combatantB.HP} HP (${Math.round((sim.combatantB.remainingHP / combatantB.HP) * 100)}%) tras asestar ${sim.combatantB.hitsLanded} de ${sim.combatantB.htk} golpes (TTK: ${sim.combatantB.ttk.toFixed(2)}s). Duración combate: ${sim.duration.toFixed(2)}s.`;
          if (DOM.victoryBanner) DOM.victoryBanner.className = 'victory-ribbon-banner victory-b';
        } else {
          DOM.victoryTitle.textContent = `⚖️ Empate Técnico`;
          DOM.victoryMeta.textContent = `Ambos combatientes alcanzaron 0 HP o expiró el límite de tiempo. Duración combate: ${sim.duration.toFixed(2)}s.`;
          if (DOM.victoryBanner) DOM.victoryBanner.className = 'victory-ribbon-banner victory-draw';
        }
      }
    }

    // 4. Actualización Visual de Barras de Vida Post-Combate
    if (!isPreCombat) {
      // Actualización Combatiente 1 (Azul)
      const finalHpA = Math.max(0, result.combatantA.remainingHP);
      const maxHpA = combatantA.HP;
      const pctA = Math.max(0, Math.min(100, (finalHpA / maxHpA) * 100));

      const barA = document.querySelector('.combatant-left .hp-bar-fill') || document.querySelector('#hpBarA') || DOM.duelHpFillA;
      const labelA = document.querySelector('.combatant-left .hp-label') || document.querySelector('#hpLabelA') || DOM.duelHpTextA;

      if (barA) {
        barA.style.transition = 'width 0.5s ease-out, background-color 0.3s ease';
        barA.style.width = `${pctA}%`;
        barA.style.backgroundColor = pctA > 50 ? '#22c55e' : pctA > 20 ? '#f59e0b' : '#ef4444';
        barA.textContent = `${Math.round(pctA)}%`;
      }
      if (labelA) {
        labelA.textContent = `${finalHpA} / ${maxHpA} HP`;
      }
      if (DOM.duelHpBarTextA) {
        DOM.duelHpBarTextA.textContent = `${Math.round(pctA)}%`;
      }

      // Actualización Combatiente 2 (Rojo)
      const finalHpB = Math.max(0, result.combatantB.remainingHP);
      const maxHpB = combatantB.HP;
      const pctB = Math.max(0, Math.min(100, (finalHpB / maxHpB) * 100));

      const barB = document.querySelector('.combatant-right .hp-bar-fill') || document.querySelector('#hpBarB') || DOM.duelHpFillB;
      const labelB = document.querySelector('.combatant-right .hp-label') || document.querySelector('#hpLabelB') || DOM.duelHpTextB;

      if (barB) {
        barB.style.transition = 'width 0.5s ease-out, background-color 0.3s ease';
        barB.style.width = `${pctB}%`;
        barB.style.backgroundColor = pctB > 50 ? '#22c55e' : pctB > 20 ? '#f59e0b' : '#ef4444';
        barB.textContent = `${Math.round(pctB)}%`;
      }
      if (labelB) {
        labelB.textContent = `${finalHpB} / ${maxHpB} HP`;
      }
      if (DOM.duelHpBarTextB) {
        DOM.duelHpBarTextB.textContent = `${Math.round(pctB)}%`;
      }
    } else {
      // Estado pre-combate: restaurar barras al 100% de vida
      // Combatiente 1
      const barA = document.querySelector('.combatant-left .hp-bar-fill') || document.querySelector('#hpBarA') || DOM.duelHpFillA;
      const labelA = document.querySelector('.combatant-left .hp-label') || document.querySelector('#hpLabelA') || DOM.duelHpTextA;
      if (barA) {
        barA.style.transition = 'width 0.3s ease, background-color 0.3s ease';
        barA.style.width = '100%';
        barA.style.backgroundColor = '#22c55e';
        barA.textContent = '100%';
        barA.classList.remove('damaged', 'critical');
      }
      if (labelA) {
        labelA.textContent = `${combatantA.HP} / ${combatantA.HP} HP`;
      }
      if (DOM.duelHpBarTextA) {
        DOM.duelHpBarTextA.textContent = `${combatantA.HP} HP`;
      }

      // Combatiente 2
      const barB = document.querySelector('.combatant-right .hp-bar-fill') || document.querySelector('#hpBarB') || DOM.duelHpFillB;
      const labelB = document.querySelector('.combatant-right .hp-label') || document.querySelector('#hpLabelB') || DOM.duelHpTextB;
      if (barB) {
        barB.style.transition = 'width 0.3s ease, background-color 0.3s ease';
        barB.style.width = '100%';
        barB.style.backgroundColor = '#22c55e';
        barB.textContent = '100%';
        barB.classList.remove('damaged', 'critical');
      }
      if (labelB) {
        labelB.textContent = `${combatantB.HP} / ${combatantB.HP} HP`;
      }
      if (DOM.duelHpBarTextB) {
        DOM.duelHpBarTextB.textContent = `${combatantB.HP} HP`;
      }
    }

    // 5. Registro de combate
    if (!isPreCombat) {
      renderCombatLog(sim.combatLog || sim.log);
    } else {
      if (DOM.combatLogStream) {
        DOM.combatLogStream.innerHTML = '<div class="log-entry">Combatientes listos. Haz clic en "SIMULAR DUELO" para observar el combate.</div>';
      }
    }
  }

  const runDuelSimulation = runSimulation;
  window.runSimulation = runSimulation;

  function applyPreset(presetKey) {
    const config = PRESET_CONFIGS[presetKey];
    if (!config) return;

    // Configurar combatiente A
    if (DOM.duelCivA) DOM.duelCivA.value = config.a.civ;
    if (DOM.duelAgeA) DOM.duelAgeA.value = String(config.a.age || 4);
    populateDuelUnitSelect('a', config.a.unitId);

    if (DOM.duelStacksA) DOM.duelStacksA.value = config.a.stacks;
    if (DOM.duelStacksValA) DOM.duelStacksValA.textContent = config.a.stacks;
    if (DOM.duelSmithMeleeA) DOM.duelSmithMeleeA.value = config.a.melee;
    if (DOM.duelSmithPierceA) DOM.duelSmithPierceA.value = config.a.pierce;
    if (DOM.duelArmorA) DOM.duelArmorA.value = config.a.armor;
    if (DOM.duelArmorCavA) DOM.duelArmorCavA.value = config.a.armor;
    if (DOM.duelArmorArchA) DOM.duelArmorArchA.value = config.a.armor;
    if (DOM.duelBloodlinesA) DOM.duelBloodlinesA.checked = Boolean(config.a.bloodlines);
    if (DOM.duelHusbandryA) DOM.duelHusbandryA.checked = Boolean(config.a.husbandry);
    if (DOM.duelSquiresA) DOM.duelSquiresA.checked = Boolean(config.a.squires);
    if (DOM.duelGambesonsA) DOM.duelGambesonsA.checked = Boolean(config.a.gambesons);
    if (DOM.duelThumbRingA) DOM.duelThumbRingA.checked = Boolean(config.a.thumbRing);
    if (DOM.duelParthianA) DOM.duelParthianA.checked = Boolean(config.a.parthian);
    if (DOM.duelCranequinsA) DOM.duelCranequinsA.checked = Boolean(config.a.cranequins);
    if (DOM.duelChemistryA) DOM.duelChemistryA.checked = Boolean(config.a.chemistry);
    if (DOM.duelCenturionA) DOM.duelCenturionA.checked = Boolean(config.a.centurion);
    if (DOM.duelElevA) DOM.duelElevA.value = config.a.elev;

    syncTechTreeUI('a');
    renderUniqueTechsForSide('a', { castleCrown: config.a.castleCrown, imperialCrown: config.a.imperialCrown });

    // Configurar combatiente B
    if (DOM.duelCivB) DOM.duelCivB.value = config.b.civ;
    if (DOM.duelAgeB) DOM.duelAgeB.value = String(config.b.age || 4);
    populateDuelUnitSelect('b', config.b.unitId);

    if (DOM.duelStacksB) DOM.duelStacksB.value = config.b.stacks;
    if (DOM.duelStacksValB) DOM.duelStacksValB.textContent = config.b.stacks;
    if (DOM.duelSmithMeleeB) DOM.duelSmithMeleeB.value = config.b.melee;
    if (DOM.duelSmithPierceB) DOM.duelSmithPierceB.value = config.b.pierce;
    if (DOM.duelArmorB) DOM.duelArmorB.value = config.b.armor;
    if (DOM.duelArmorCavB) DOM.duelArmorCavB.value = config.b.armor;
    if (DOM.duelArmorArchB) DOM.duelArmorArchB.value = config.b.armor;
    if (DOM.duelBloodlinesB) DOM.duelBloodlinesB.checked = Boolean(config.b.bloodlines);
    if (DOM.duelHusbandryB) DOM.duelHusbandryB.checked = Boolean(config.b.husbandry);
    if (DOM.duelSquiresB) DOM.duelSquiresB.checked = Boolean(config.b.squires);
    if (DOM.duelGambesonsB) DOM.duelGambesonsB.checked = Boolean(config.b.gambesons);
    if (DOM.duelThumbRingB) DOM.duelThumbRingB.checked = Boolean(config.b.thumbRing);
    if (DOM.duelParthianB) DOM.duelParthianB.checked = Boolean(config.b.parthian);
    if (DOM.duelCranequinsB) DOM.duelCranequinsB.checked = Boolean(config.b.cranequins);
    if (DOM.duelChemistryB) DOM.duelChemistryB.checked = Boolean(config.b.chemistry);
    if (DOM.duelCenturionB) DOM.duelCenturionB.checked = Boolean(config.b.centurion);
    if (DOM.duelElevB) DOM.duelElevB.value = config.b.elev;

    syncTechTreeUI('b');
    renderUniqueTechsForSide('b', { castleCrown: config.b.castleCrown, imperialCrown: config.b.imperialCrown });

    // Actualizar tarjetas y ejecutar simulación
    updateStats('a');
    updateStats('b');
    runSimulation({ preserveCardHP: true });
  }

  // =========================================================================
  // GESTIÓN DE EVENTOS DE USUARIO
  // =========================================================================
  function bindEvents() {
    // 1. Navegación del Menú Principal
    document.querySelectorAll('[data-action="open-units"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToView('units');
      });
    });

    // Navegación a Arena de Duelo
    document.querySelectorAll('[data-action="open-duel"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToView('duel');
      });
    });

    // Navegación a Edificios
    document.querySelectorAll('[data-action="open-buildings"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToView('buildings');
      });
    });

    // Navegación a Tecnologías
    document.querySelectorAll('[data-action="open-techs"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToView('techs');
      });
    });

    // Navegación a Árbol de Tecnologías (Tech Tree)
    document.querySelectorAll('[data-action="open-techtree"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToView('techtree');
      });
    });

    // Navegación a Calculadora Económica
    document.querySelectorAll('[data-action="open-eco"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToView('eco');
      });
    });

    if (DOM.techtreeBackBtn) {
      DOM.techtreeBackBtn.addEventListener('click', () => navigateToView('main-menu'));
    }

    if (DOM.techsBackBtn) {
      DOM.techsBackBtn.addEventListener('click', () => navigateToView('main-menu'));
    }

    if (DOM.buildingsBackBtn) {
      DOM.buildingsBackBtn.addEventListener('click', () => navigateToView('main-menu'));
    }

    if (DOM.duelBackBtn) {
      DOM.duelBackBtn.addEventListener('click', () => navigateToView('main-menu'));
    }

    if (DOM.btnSimulateDuel) {
      DOM.btnSimulateDuel.addEventListener('click', () => runSimulation({ preserveCardHP: false }));
    }

    if (DOM.btnToggleLog) {
      DOM.btnToggleLog.addEventListener('click', () => {
        if (!DOM.combatLogStream) return;
        DOM.combatLogStream.style.display = DOM.combatLogStream.style.display === 'none' ? 'block' : 'none';
      });
    }

    // Presets rápidos
    document.querySelectorAll('.preset-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        if (presetKey) applyPreset(presetKey);
      });
    });

    // Sliders de acumulaciones (stacks) en tiempo real
    if (DOM.duelStacksA && DOM.duelStacksValA) {
      DOM.duelStacksA.addEventListener('input', (e) => {
        DOM.duelStacksValA.textContent = e.target.value;
        updateStats('a');
        runSimulation({ preserveCardHP: true });
      });
    }

    if (DOM.duelStacksB && DOM.duelStacksValB) {
      DOM.duelStacksB.addEventListener('input', (e) => {
        DOM.duelStacksValB.textContent = e.target.value;
        updateStats('b');
        runSimulation({ preserveCardHP: true });
      });
    }

    // Cambio de Civilización A: filtra unidades + sincroniza árbol tecnológico + actualiza coronas dinámicas + recalcula stats
    if (DOM.duelCivA) {
      DOM.duelCivA.addEventListener('change', () => {
        populateDuelUnitSelect('a');
        syncTechTreeUI('a');
        renderUniqueTechsForSide('a');
        updateStats('a');
        runSimulation({ preserveCardHP: true });
      });
    }

    // Cambio de Civilización B: filtra unidades + sincroniza árbol tecnológico + actualiza coronas dinámicas + recalcula stats
    if (DOM.duelCivB) {
      DOM.duelCivB.addEventListener('change', () => {
        populateDuelUnitSelect('b');
        syncTechTreeUI('b');
        renderUniqueTechsForSide('b');
        updateStats('b');
        runSimulation({ preserveCardHP: true });
      });
    }

    // Cambio de Edad A (filtrado en cascada de unidades + bloqueo/degradación de tecnologías + bonos de civ por edad + simulación)
    if (DOM.duelAgeA) {
      DOM.duelAgeA.addEventListener('change', () => {
        populateDuelUnitSelect('a');
        syncTechTreeUI('a');
        updateStats('a');
        runSimulation({ preserveCardHP: true });
      });
    }

    // Cambio de Edad B (filtrado en cascada de unidades + bloqueo/degradación de tecnologías + bonos de civ por edad + simulación)
    if (DOM.duelAgeB) {
      DOM.duelAgeB.addEventListener('change', () => {
        populateDuelUnitSelect('b');
        syncTechTreeUI('b');
        updateStats('b');
        runSimulation({ preserveCardHP: true });
      });
    }

    // Sincronización recíproca de Elevación / Colinas entre Combatiente A y Combatiente B
    function syncOppositeElevation(changedSide) {
      const srcEl = changedSide === 'a' ? DOM.duelElevA : DOM.duelElevB;
      const dstEl = changedSide === 'a' ? DOM.duelElevB : DOM.duelElevA;
      if (!srcEl || !dstEl) return;

      const val = srcEl.value;
      if (val === 'high') {
        dstEl.value = 'low';
      } else if (val === 'low') {
        dstEl.value = 'high';
      } else {
        dstEl.value = 'flat';
      }
    }

    if (DOM.duelElevA) {
      DOM.duelElevA.addEventListener('change', () => {
        syncOppositeElevation('a');
        updateStats('a');
        updateStats('b');
        runSimulation({ preserveCardHP: true });
      });
    }

    if (DOM.duelElevB) {
      DOM.duelElevB.addEventListener('change', () => {
        syncOppositeElevation('b');
        updateStats('a');
        updateStats('b');
        runSimulation({ preserveCardHP: true });
      });
    }

    // Controles tácticos, movilidad terrestre, arquería avanzada, rama naval y selección de unidad A
    const fighterAControls = [
      DOM.duelUnitA, DOM.duelSmithMeleeA,
      DOM.duelSmithPierceA, DOM.duelArmorA, DOM.duelArmorCavA, DOM.duelArmorArchA,
      DOM.duelBloodlinesA, DOM.duelHusbandryA, DOM.duelSquiresA, DOM.duelGambesonsA,
      DOM.duelThumbRingA, DOM.duelParthianA, DOM.duelCranequinsA, DOM.duelChemistryA, DOM.duelCenturionA,
      DOM.duelCareeningA, DOM.duelDryDockA, DOM.duelClinkerA, DOM.duelCarvelA,
      DOM.duelBallisticsA, DOM.duelNavalChemistryA, DOM.duelSiphonsA
    ];
    fighterAControls.forEach(ctrl => {
      if (ctrl) {
        ctrl.addEventListener('change', () => {
          updateStats('a');
          runSimulation({ preserveCardHP: true });
        });
      }
    });

    // Controles tácticos, movilidad terrestre, arquería avanzada, rama naval y selección de unidad B
    const fighterBControls = [
      DOM.duelUnitB, DOM.duelSmithMeleeB,
      DOM.duelSmithPierceB, DOM.duelArmorB, DOM.duelArmorCavB, DOM.duelArmorArchB,
      DOM.duelBloodlinesB, DOM.duelHusbandryB, DOM.duelSquiresB, DOM.duelGambesonsB,
      DOM.duelThumbRingB, DOM.duelParthianB, DOM.duelCranequinsB, DOM.duelChemistryB, DOM.duelCenturionB,
      DOM.duelCareeningB, DOM.duelDryDockB, DOM.duelClinkerB, DOM.duelCarvelB,
      DOM.duelBallisticsB, DOM.duelNavalChemistryB, DOM.duelSiphonsB
    ];
    fighterBControls.forEach(ctrl => {
      if (ctrl) {
        ctrl.addEventListener('change', () => {
          updateStats('b');
          runSimulation({ preserveCardHP: true });
        });
      }
    });

    // 2. Modales para módulos de la Fase 2
    document.querySelectorAll('[data-action="modal-feature"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.title || 'Módulo en Construcción';
        const msg = btn.dataset.msg || 'Este módulo estará disponible en la siguiente fase de desarrollo.';
        openModal(title, msg);
      });
    });

    // 3. Volver al menú
    DOM.navHomeBtn.addEventListener('click', () => navigateToView('main-menu'));
    DOM.backToMenuBtn.addEventListener('click', () => navigateToView('main-menu'));

    // 4. Buscador por texto en tiempo real
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderUnits();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.style.display = 'none';
      renderUnits();
      DOM.searchInput.focus();
    });

    // 5. Filtro de Civilización
    DOM.civSelect.addEventListener('change', (e) => {
      state.selectedCiv = e.target.value;
      renderUnits();
      if (typeof setModalCiv === 'function') {
        setModalCiv(e.target.value);
      } else if (typeof window !== 'undefined' && typeof window.setModalCiv === 'function') {
        window.setModalCiv(e.target.value);
      }
    });

    // 6. Filtro de Edad
    DOM.ageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.ageButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedAge = btn.dataset.age;
        renderUnits();
      });
    });

    // 7. Checkbox para ocultar unidades no disponibles
    DOM.hideDisabledCheckbox.addEventListener('change', (e) => {
      state.hideDisabled = e.target.checked;
      renderUnits();
    });

    // 7b. Controles y Filtros del Catálogo de Edificios
    if (DOM.buildingSearchInput) {
      DOM.buildingSearchInput.addEventListener('input', (e) => {
        state.buildingSearchQuery = e.target.value;
        if (DOM.clearBuildingSearchBtn) {
          DOM.clearBuildingSearchBtn.style.display = state.buildingSearchQuery ? 'block' : 'none';
        }
        renderBuildings();
      });
    }

    if (DOM.clearBuildingSearchBtn) {
      DOM.clearBuildingSearchBtn.addEventListener('click', () => {
        if (DOM.buildingSearchInput) DOM.buildingSearchInput.value = '';
        state.buildingSearchQuery = '';
        DOM.clearBuildingSearchBtn.style.display = 'none';
        renderBuildings();
        if (DOM.buildingSearchInput) DOM.buildingSearchInput.focus();
      });
    }

    if (DOM.buildingCivSelect) {
      DOM.buildingCivSelect.addEventListener('change', (e) => {
        state.selectedBuildingCiv = e.target.value;
        renderBuildings();
        if (typeof setModalCiv === 'function') {
          setModalCiv(e.target.value);
        } else if (typeof window !== 'undefined' && typeof window.setModalCiv === 'function') {
          window.setModalCiv(e.target.value);
        }
      });
    }

    DOM.buildingCatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.buildingCatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedBuildingCat = btn.dataset.buildingCat;
        renderBuildings();
      });
    });

    DOM.buildingAgeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.buildingAgeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedBuildingAge = btn.dataset.buildingAge;
        renderBuildings();
      });
    });

    // 8. Botón cerrar inspector en móvil
    DOM.closeInspectorMobile.addEventListener('click', () => {
      DOM.inspectorContent.innerHTML = `
        <div class="inspector-placeholder">
          <div class="placeholder-shield">🛡️</div>
          <h4 class="placeholder-title">Ninguna Unidad Seleccionada</h4>
          <p class="placeholder-text">Haz clic en cualquier unidad de la lista para inspeccionar sus atributos.</p>
        </div>
      `;
      state.selectedUnitId = null;
      document.querySelectorAll('.unit-card.selected').forEach(c => c.classList.remove('selected'));
    });

    // 9. Cierre del modal
    DOM.modalCloseBtn.addEventListener('click', closeModal);
    DOM.modalOkBtn.addEventListener('click', closeModal);
    DOM.modal.addEventListener('click', (e) => {
      if (e.target === DOM.modal) closeModal();
    });
  }

  function openModal(title, message) {
    DOM.modalTitle.textContent = title;
    DOM.modalMessage.textContent = message;
    DOM.modal.style.display = 'flex';
  }

  function closeModal() {
    DOM.modal.style.display = 'none';
  }

  // =========================================================================
  // ARRANQUE AUTOMÁTICO
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

})();
