# PWA Mockup Guide

## 📱 Om Mockup'en

Dette er en interaktiv mockup der viser hvordan Favorit Panel ser ud og fungerer som en installeret Progressive Web App (PWA).

## 🚀 Åbn Mockup'en

Åbn filen `pwa-mockup.html` i din browser:

```bash
# Med live server
npx serve .

# Eller direkte
open pwa-mockup.html
```

## 🎮 Mockup Controls

I toppen af siden finder du tre toggle-knapper til at simulere forskellige tilstande:

### 📱 PWA Mode (standalone)
- **ON** = Appen vises i en iPhone device frame (som installeret app)
- **OFF** = Appen vises i fuld browser (responsive view)

### 📡 Offline Mode
- **ON** = Viser offline banner og ændrer online status ikon
- **OFF** = Normal online tilstand

### ⬇️ Install Banner
- **ON** = Viser install banner i toppen af appen
- **OFF** = Skjuler install banner

## 🗂️ Features Demonstreret

### 1. **Device Frame**
- iPhone-lignende device frame med notch
- Status bar med tid, signal, batteri
- Safe area support (iOS)

### 2. **App Header**
- App titel
- Søgeknap (funktionalitet kommer)
- Theme color (#667eea)

### 3. **Install Banner**
- Native-lignende install prompt
- Kan lukkes med × knap
- Primær "Installer" knap

### 4. **Bottom Navigation**
- 4 tabs: Udstillere, Favoritter, Delte, Mere
- Badge på Favoritter tab (antal)
- Smooth tab switching
- iOS/Android-lignende styling

### 5. **Pull to Refresh**
- Swipe ned fra toppen (på touch devices)
- Refresh spinner animation
- Toast notification når opdateret

### 6. **Offline Banner**
- Vises når offline mode er aktiveret
- Informerer om at ændringer gemmes automatisk
- Gul advarsel styling

## 📑 Tabs/Sider

### Udstillere Tab
- **Grid layout** med udstillerkort
- **Favorit knapper** på hvert kort
- **User indicators** viser hvem andre der har favorit-markeret
- **Interaktiv**: Klik på hjerte for at tilføje/fjerne favorit
- **Toast notifications** når favoritter ændres

### Favoritter Tab
- **Header** med "Del" knap
- **Favorit count** med hjerte ikon
- **Liste** af gemte favoritter
- **Fjern knapper** (× ikon)
- **Share dialog** når "Del" klikkes

### Delte Tab
- **Liste** af andre brugeres delte favoritter
- **User avatars** med farve-kodning
- **Toggle switches** for at aktivere/deaktivere hver liste
- **"Tilføj delt liste"** knap

### Indstillinger Tab (Mere)
Dette er den vigtigste del af mockup'en! Viser:

#### Notifikationer (NYT!)
- **Besøgende aktivitet** - Toggle switch (👥)
  - Når andre deler eller favorit-markerer
- **Medarbejder aktivitet** - Toggle switch (💼)
  - Når kollegaer deler eller kommenterer
- **Personale beskeder** - Toggle switch (🏢)
  - Vigtige meddelelser fra arrangøren
- **System notifikationer** - Toggle switch (⚙️)
  - App updates og synkronisering

#### Generelt
- **Installer app** - Action button
- **Sprog** - Language selector

#### Synkronisering
- **Synkroniser enheder** - Viser antal forbundne enheder
- **Eksporter data** - Download funktion

#### Data & Lagring
- **Lagringsbrug** - Visual progress bar (2.4 MB af 50 MB)
- **Ryd cache** - Frigør plads

#### Om
- **Version** - App version (1.0.0-beta)
- **Privatlivspolitik** - Link med chevron
- **Vilkår & betingelser** - Link med chevron

## 🔔 Notification Preferences Feature

### Sådan tester du:

1. **Åbn mockup'en** i browser (`pwa-mockup.html`)
2. **Klik på "Mere" tab** i bottom navigation (⚙️ ikon)
3. **Scroll til "Notifikationer" sektionen** (øverst)
4. **Toggle en af de 4 notification types:**
   - 👥 Besøgende aktivitet
   - 💼 Medarbejder aktivitet
   - 🏢 Personale beskeder
   - ⚙️ System notifikationer

5. **Se feedback:**
   - Toast notification vises med bekræftelse
   - Browser console logger server sync simulation
   - State opdateres i baggrunden

### Hvordan det virker i mockup:

```javascript
// Når toggle ændres:
1. Local state opdateres (ville være Dexie i rigtig app)
2. Toast notification vises til bruger
3. Console log simulerer server API call
4. State logges for debugging

// I rigtig app ville der også ske:
- Dexie database update
- HTTP PUT til /api/notifications/preferences
- Background sync hvis offline
```

### Implementation noter:

**Hybrid Model:**
- Server-side filtering (primær)
- Client-side fallback (backup)
- Optimistic UI updates
- Auto-sync mellem enheder

**Se også:** Arkitektur dokumentation i commit message for detaljer om server-side vs client-side filtrering.

## 🎨 Design Features

### Farver
- **Primary**: #667eea (lilla/blå)
- **Secondary**: #764ba2 (lilla)
- **Favorite**: #ff4757 (rød)
- **Success**: #00b894 (grøn)
- **Warning**: #fbbf24 (gul)

### Typografi
- **Font**: System font stack (iOS/Android native feel)
- **Sizes**: Responsive og mobile-optimized

### Interaktioner
- **Haptic feedback** (visual)
- **Smooth animations**
- **Touch-friendly** target sizes (min 44px)
- **Native-like** transitions

### Accessibility
- **ARIA labels** på knapper
- **Keyboard navigable** (tab, enter)
- **Screen reader friendly**
- **High contrast** mode ready
- **Reduced motion** support

## 📐 Responsive Design

```
Desktop (>768px):
- Device frame synlig
- Mockup controls i toppen

Mobile (<400px):
- Full screen app
- No device frame
- Mockup controls fixed top
```

## 🔧 Tekniske Detaljer

### HTML Struktur
```html
.device-frame
  .device-screen
    .status-bar          <!-- iOS/Android status bar -->
    .app-header          <!-- App titel + actions -->
    .install-banner      <!-- PWA install prompt -->
    .offline-banner      <!-- Offline notification -->
    .app-content         <!-- Main scrollable content -->
      .tab-content       <!-- Tab panels -->
    .bottom-nav          <!-- Bottom navigation -->
    .safe-area-bottom    <!-- iOS safe area -->
```

### CSS Features
- CSS Custom Properties (for theming)
- CSS Grid & Flexbox
- CSS Animations
- Media Queries
- `env(safe-area-inset-bottom)` for iOS

### JavaScript Features
- Event delegation
- Touch events (pull-to-refresh)
- State management
- Toast notifications
- Modal dialogs

## 🎯 Use Cases

### For Udvikling
- Visualiser PWA features før implementation
- Test UI/UX flows
- Demonstrer til stakeholders
- Reference for design decisions

### For Design
- Prototype PWA interface
- Test farver og spacing
- Validate navigation patterns
- Showcase native-like feel

### For Kunder
- Preview af færdig app
- Forståelse af PWA koncepter
- Feedback på design
- Buy-in for projektet

## 🚀 Næste Skridt

Denne mockup demonstrerer:

✅ PWA standalone mode
✅ Bottom navigation
✅ Install prompts
✅ Offline handling
✅ Pull-to-refresh
✅ Settings interface
✅ Data storage UI
✅ Multi-language ready
✅ Push notification toggles
✅ Device sync UI

### Mangler (implementeres i rigtig app):
- [ ] Rigtig service worker
- [ ] Dexie database integration
- [ ] Backend API calls
- [ ] Push notifications (FCM)
- [ ] QR code generation
- [ ] Real synkronisering
- [ ] WPML integration
- [ ] Analytics tracking

## 📝 Feedback

Brug mockup'en til at:
1. Teste brugerflows
2. Validere design valg
3. Identificere missing features
4. Prioritere udvikling
5. Kommunikere vision

## 🔗 Relaterede Filer

- `index.html` - Original favorit mockup
- `PROJECT_PLAN.md` - Komplet implementation plan
- `README.md` - Projekt overview

---

**Version:** 1.0
**Dato:** 2025-11-08
**Forfatter:** Claude + Johannes
