# Favorit Panel Mockup v2

## 📁 Filstruktur

```
/
├── index.html                  # Hovedfil med HTML struktur
├── css/
│   └── styles.css             # Al styling inkl. ny settings menu
├── js/
│   ├── state.js               # State management (variabler)
│   ├── template-loader.js     # Handlebars template loader
│   ├── ui-renderer.js         # UI rendering funktioner
│   ├── event-handlers.js      # Event listeners og actions
│   └── app.js                 # Initialization
└── templates/
    ├── exhibitor-card.hbs     # Udstiller kort
    ├── user-toggle.hbs        # Bruger toggle i dropdown
    ├── users-dropdown.hbs     # Andres favoritter dropdown
    ├── sync-modal-empty.hbs   # Sync modal (tom)
    ├── sync-modal-active.hbs  # Sync modal (aktiv)
    └── device-item.hbs        # Enhed i sync liste
```

## ✨ Nye Features

### 1. **Settings Menu**

- ⚙️ Settings ikon på hver bruger (erstatter hover-blyant)
- Dropdown menu med “Omdøb” og “Slet” funktioner
- Mobil-venlig - ingen hover-effekter

### 2. **Slet Deling**

- Slet en delt favorit-liste helt
- Confirmation dialog før sletning
- Opdaterer automatisk UI

### 3. **Navngivning ved Tilføjelse**

- Navnefelt når man tilføjer link
- Obligatorisk at angive navn
- Bedre UX

### 4. **Auto-navngivning ved URL**

- Når man åbner `?share=abc123` URL
- Åbner automatisk dropdown
- Navnefelt er klar til input
- Link er pre-udfyldt

### 5. **Opdelt Kodebase**

- Modulær struktur
- Lettere at vedligeholde
- Handlebars templates i separate filer

## 🚀 Installation

1. Clone repo
1. Åbn `index.html` i browser (eller brug GitHub Pages)
1. Alle eksterne dependencies loades fra CDN

## 🔧 Udvikling

Alle filer kan redigeres direkte. Refresh browser for at se ændringer.

### Tilføj ny template:

1. Opret `.hbs` fil i `templates/`
1. Tilføj navn til `templateNames` array i `template-loader.js`
1. Brug med `Templates.render('navn', data)`

## 📝 Ændringer fra v1

- ❌ Fjernet hover-blyant på bruger-navne
- ✅ Tilføjet settings menu med dropdown
- ✅ Tilføjet slet-funktion for delinger
- ✅ Tilføjet navnefelt ved link-tilføjelse
- ✅ Auto-åbn dropdown ved `?share` URL parameter
- ✅ Opdelt monolitisk JS i moduler
- ✅ Flyttet HTML til Handlebars templates
- ✅ Forbedret mobil-oplevelse

## 🐛 Bug Fixes

- Mobil toggle reagerer nu korrekt på første klik
- Settings funktioner er altid tilgængelige (ikke kun på hover)