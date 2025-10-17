// State.js - All application state management

const exhibitors = [
    { id: 1, name: "ALBA LIGHTING", icon: "💡", stand: "11" },
    { id: 2, name: "AUTOPRO SYSTEMS", icon: "🔥", stand: "3-11" },
    { id: 3, name: "BIOENERGY INSTALLATIONS", icon: "🌿", stand: "1S-13" },
    { id: 4, name: "CIRCUPRO SOLUTIONS", icon: "♻️", stand: "5-12" },
    { id: 5, name: "ECOPOWER STORAGE", icon: "🔋", stand: "1-24" },
    { id: 6, name: "ECOSTREAM SOLUTIONS", icon: "🌳", stand: "1S-22" },
    { id: 7, name: "EL-VVS EXPERTS", icon: "✓", stand: "3-22" },
    { id: 8, name: "ELECFIX PRO", icon: "⚡", stand: "2-21" },
    { id: 9, name: "ENERGIAUTOMATIK", icon: "🔌", stand: "1-24" },
    { id: 10, name: "ENERGIOPTIME-RING", icon: "📊", stand: "1-23" },
    { id: 11, name: "ENERGISPAR VARME", icon: "🌡️", stand: "3-13" },
    { id: 12, name: "ENERGYFLOW SOLUTIONS", icon: "☀️", stand: "1S-11" },
    { id: 13, name: "GREEN TECH NORDIC", icon: "🌍", stand: "2-15" },
    { id: 14, name: "HEAT PUMP SOLUTIONS", icon: "🔆", stand: "4-18" },
    { id: 15, name: "SOLAR INNOVATIONS", icon: "🌤️", stand: "2-09" },
    { id: 16, name: "SMART GRID SYSTEMS", icon: "🔋", stand: "5-21" },
    { id: 17, name: "WIND ENERGY TECH", icon: "💨", stand: "3-07" },
    { id: 18, name: "ECO BUILDING MATERIALS", icon: "🏗️", stand: "4-12" },
    { id: 19, name: "CLIMATE CONTROL PRO", icon: "❄️", stand: "2-19" },
    { id: 20, name: "SUSTAINABLE HVAC", icon: "🌬️", stand: "5-08" },
];

const allSharedUsers = [
    { id: 1, name: "Maria Jensen", customName: null, color: "#e74c3c", favorites: [1, 3, 5, 9, 12, 15, 18] },
    { id: 2, name: "Peter Nielsen", customName: null, color: "#3498db", favorites: [2, 4, 6, 10] },
    { id: 3, name: "Anna Schmidt", customName: null, color: "#2ecc71", favorites: [1, 2, 7, 11, 16, 19, 8, 14, 20] },
    { id: 4, name: "Lars Andersen", customName: null, color: "#f39c12", favorites: [3, 13, 17] },
    { id: 5, name: "Sophie Hansen", customName: null, color: "#9b59b6", favorites: [4, 6, 8, 12, 15, 18, 10, 16] },
];

// Application State
let device1Favorites = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17]);
let device2Favorites = new Set([2, 4, 6, 8, 10, 12, 14, 16, 18]);
let sharedUsers = [...allSharedUsers];
let currentDevice = 1;
let myFavorites = device1Favorites;
let showMyFavorites = false;
let activeSharedUsers = new Set();
let isSyncGroup = true;
let syncDevices = [
    { id: 1, name: 'iPhone 13', isCurrent: true, isDevice1: true },
    { id: 2, name: 'Laptop', isCurrent: false, isDevice2: true },
    { id: 3, name: 'iPad', isCurrent: false }
];

// UI State
let showJoinSyncInput = false;
let showAddFavoritesInput = false;
let editingUserId = null;
let editingDeviceId = null;
let openSettingsMenuUserId = null;

// Global instances
let notyf;
let syncModal;
let tippyInstance;
let userIndicatorTippyInstances = [];
let settingsMenuTippyInstances = [];