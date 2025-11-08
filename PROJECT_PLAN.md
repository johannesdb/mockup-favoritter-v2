# Favorit Panel PWA - Komplet Projektplan

## 📋 Executive Summary

**Produkt:** Multi-tenant PWA widget til favorit-håndtering på events/messer
**Deployment:** CDN-hosted embeddable script
**Target:** Kunde websites (WordPress primært, men framework-agnostic)
**Use Case:** Besøgende på messer kan gemme favorit-udstillere, dele lister, synkronisere mellem enheder

---

## 🎯 Projekt Scope

### Primære Features
- ✅ Offline-first favorit-håndtering med Dexie
- ✅ Multi-device synkronisering (optional backend)
- ✅ Deling af favoritlister (URL-baseret)
- ✅ PWA installation med dynamisk manifest
- ✅ Multi-tenant support (fungerer på alle kunde-domæner)
- ✅ Push notifikationer
- ✅ WordPress integration (med WPML support)

### Sekundære Features
- ⚡ Install prompts/banners
- ⚡ QR code generator til installation
- ⚡ App shortcuts
- ⚡ Pull-to-refresh
- ⚡ Offline forms
- ⚡ Analytics/statistik
- ⚡ Accessibility (WCAG 2.1 AA)

---

## 🏗️ Arkitektur

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KUNDE'S WEBSITE                          │
│  (kunde-a.dk, kunde-b.dk, kunde-c.dk, ...)                 │
│                                                              │
│  <script src="https://cdn.favorit.app/v1/embed.js"></script>│
│  <script>                                                    │
│    FavoritPanel.init({                                       │
│      event: "energimessen-2024",                            │
│      apiUrl: "https://api.favorit.app",                     │
│      theme: { color: "#FF5733", logo: "/logo.png" },       │
│      i18n: "da",                                            │
│      features: ["share", "sync", "notifications"]          │
│    });                                                       │
│  </script>                                                   │
│  <div id="favorit-panel"></div>                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────┐
    │     CDN (cdn.favorit.app)                 │
    │  - embed.js (entry point)                 │
    │  - app.bundle.js (main app)               │
    │  - sw.js (service worker)                 │
    │  - styles.css                             │
    │  - icons/ (192, 512, maskable)            │
    └───────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────┐
    │  CLIENT SIDE (Browser)                     │
    │  ┌─────────────────────────────────┐      │
    │  │  Service Worker                 │      │
    │  │  - Asset caching                │      │
    │  │  - Offline support              │      │
    │  │  - Background sync              │      │
    │  │  - Push notifications           │      │
    │  └─────────────────────────────────┘      │
    │  ┌─────────────────────────────────┐      │
    │  │  Dexie (IndexedDB)              │      │
    │  │  DB: favorit_{customer}_{event} │      │
    │  │  - exhibitors                   │      │
    │  │  - favorites                    │      │
    │  │  - sharedUsers                  │      │
    │  │  - devices                      │      │
    │  │  - pendingSync                  │      │
    │  │  - userPreferences              │      │
    │  └─────────────────────────────────┘      │
    └───────────────────────────────────────────┘
                            ↓
    ┌───────────────────────────────────────────┐
    │  BACKEND API (api.favorit.app)            │
    │  (Optional - for synkronisering)          │
    │  ┌─────────────────────────────────┐      │
    │  │  REST/GraphQL API               │      │
    │  │  - POST /sync                   │      │
    │  │  - GET /shares/:id              │      │
    │  │  - POST /notifications/register │      │
    │  │  - GET /events/:id/exhibitors   │      │
    │  └─────────────────────────────────┘      │
    │  ┌─────────────────────────────────┐      │
    │  │  Database (Postgres/Mongo)      │      │
    │  │  - users                        │      │
    │  │  - favorites                    │      │
    │  │  - devices                      │      │
    │  │  - shares                       │      │
    │  │  - push_subscriptions           │      │
    │  └─────────────────────────────────┘      │
    │  ┌─────────────────────────────────┐      │
    │  │  Push Service                   │      │
    │  │  - Firebase Cloud Messaging     │      │
    │  │  - OneSignal (alternativ)       │      │
    │  └─────────────────────────────────┘      │
    └───────────────────────────────────────────┘
```

---

## 💾 Data Arkitektur

### Dexie Schema (Client-side)

```javascript
const db = new Dexie(`favorit_${customerId}_${eventId}`);

db.version(1).stores({
  // Udstiller data (fra kunde's JSON eller API)
  exhibitors: 'id, name, stand, category, tags',

  // Brugerens egne favoritter
  favorites: '++id, exhibitorId, userId, deviceId, timestamp, synced',

  // Delte favoritlister fra andre
  sharedUsers: 'shareId, userId, name, color, favorites, lastSync',

  // Enheder i sync-gruppe
  devices: 'deviceId, name, type, lastSeen, isCurrent',

  // Ændringer der venter på sync
  pendingSync: '++id, action, data, timestamp, retries, synced',

  // Bruger-indstillinger
  userPreferences: 'key, value',

  // Offline forms/notes
  offlineSubmissions: '++id, type, data, timestamp, submitted',

  // Analytics events (til senere upload)
  analyticsEvents: '++id, event, data, timestamp, sent'
});
```

### Backend Schema (Optional - for sync)

```sql
-- PostgreSQL schema

-- Customers/Events
CREATE TABLE events (
  id UUID PRIMARY KEY,
  customer_domain VARCHAR(255),
  event_slug VARCHAR(255),
  name VARCHAR(255),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (anonymous eller authenticated)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  device_fingerprint VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  exhibitor_id VARCHAR(255),
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(user_id, exhibitor_id)
);

-- Shares (delte lister)
CREATE TABLE shares (
  id UUID PRIMARY KEY,
  share_token VARCHAR(255) UNIQUE,
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  name VARCHAR(255),
  favorites JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  endpoint TEXT UNIQUE,
  keys JSONB,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sync sessions (conflict resolution)
CREATE TABLE sync_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  device_id VARCHAR(255),
  sync_data JSONB,
  conflicts JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Tech Stack

### Client-Side
- **Framework:** Vanilla JavaScript (eller Svelte for kompakt builds)
- **Database:** Dexie.js (IndexedDB wrapper)
- **Service Worker:** Workbox 7.x
- **UI Components:** Web Components (Custom Elements)
- **Build:** Vite eller Rollup
- **CSS:** CSS Modules eller Tailwind CSS
- **Icons:** Web Awesome (existing) eller custom SVG sprite

### Backend (Optional)
- **Runtime:** Node.js (Bun/Deno alternativ)
- **Framework:** Fastify eller Hono (lightweight)
- **Database:** PostgreSQL + Drizzle ORM
- **Cache:** Redis (for sync coordination)
- **Push:** Firebase Cloud Messaging eller OneSignal
- **Auth:** JWT tokens + device fingerprinting
- **Deployment:** Docker + Kubernetes eller serverless (Cloudflare Workers)

### Infrastructure
- **CDN:** Cloudflare eller Fastly
- **Monitoring:** Sentry (errors) + Plausible (analytics)
- **CI/CD:** GitHub Actions
- **Hosting:**
  - CDN: Cloudflare Pages/Workers
  - API: Railway, Fly.io, eller AWS ECS
  - Database: Supabase eller Neon

---

## 📱 PWA Features - Detaljeret

### 1. Web App Manifest (Dynamisk)

**Challenge:** Skal genereres per kunde og per installationsside

**Solution:**
```javascript
// embed.js - genererer manifest on-the-fly
function generateManifest(config) {
  const manifest = {
    name: config.event.name || "Favoritter",
    short_name: config.event.shortName || "Favorit",
    description: config.event.description || "Gem dine favoritter",

    // Start URL = den side brugeren installerer fra
    start_url: `${window.location.pathname}${window.location.search}`,
    scope: config.scope || "/",

    display: "standalone",
    orientation: "portrait-primary",

    theme_color: config.theme?.color || "#007bff",
    background_color: config.theme?.backgroundColor || "#ffffff",

    categories: ["productivity", "utilities"],

    icons: [
      {
        src: config.theme?.icon192 || "https://cdn.favorit.app/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: config.theme?.icon512 || "https://cdn.favorit.app/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: config.theme?.iconMaskable || "https://cdn.favorit.app/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],

    // App shortcuts (iOS 15.4+, Android)
    shortcuts: [
      {
        name: "Mine Favoritter",
        short_name: "Favoritter",
        description: "Se dine gemte favoritter",
        url: "/favoritter",
        icons: [{ src: "/icons/heart.png", sizes: "96x96" }]
      },
      {
        name: "Del Liste",
        short_name: "Del",
        description: "Del din favoritliste",
        url: "/favoritter?action=share",
        icons: [{ src: "/icons/share.png", sizes: "96x96" }]
      },
      {
        name: "Scan QR",
        short_name: "Scan",
        description: "Scan QR kode",
        url: "/scan",
        icons: [{ src: "/icons/qr.png", sizes: "96x96" }]
      }
    ],

    screenshots: config.screenshots || []
  };

  // Inject som data URL
  const manifestJson = JSON.stringify(manifest);
  const manifestUrl = 'data:application/json;charset=utf-8,' +
    encodeURIComponent(manifestJson);

  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = manifestUrl;
  document.head.appendChild(link);
}
```

### 2. Apple Touch Icons & Splash Screens

**iOS kræver specifikke meta tags:**

```javascript
function setupAppleMetaTags(config) {
  const tags = [
    // App-capable
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: config.event.shortName },

    // Touch icon
    { rel: 'apple-touch-icon', href: config.theme?.icon180 || '/icon-180.png' },

    // Splash screens (forskellige skærmstørrelser)
    {
      rel: 'apple-touch-startup-image',
      href: '/splash/iphone5.png',
      media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
    },
    {
      rel: 'apple-touch-startup-image',
      href: '/splash/iphone6.png',
      media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
    },
    {
      rel: 'apple-touch-startup-image',
      href: '/splash/iphonex.png',
      media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
    },
    {
      rel: 'apple-touch-startup-image',
      href: '/splash/ipad.png',
      media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)'
    }
    // ... flere størrelser
  ];

  tags.forEach(tag => {
    const el = document.createElement(tag.rel ? 'link' : 'meta');
    Object.entries(tag).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    document.head.appendChild(el);
  });
}
```

**Alternativ: PWA Asset Generator**
```bash
# Generer alle icons + splash screens automatisk
npx pwa-asset-generator logo.svg ./icons \
  --icon-only \
  --background "#ffffff" \
  --splash-only
```

### 3. Install Prompt / Banner / CTA

**Strategi: Smart, ikke irriterende**

```javascript
class InstallPromptManager {
  constructor(config) {
    this.config = config;
    this.deferredPrompt = null;
    this.hasBeenPrompted = localStorage.getItem('favorit_install_prompted');
    this.isInstalled = this.checkIfInstalled();

    this.init();
  }

  checkIfInstalled() {
    // Check hvis allerede installeret
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  init() {
    if (this.isInstalled) {
      console.log('App already installed');
      return;
    }

    // Capture install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Vis install-knap/banner hvis relevant
      this.maybeShowInstallPrompt();
    });

    // Track installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.trackInstall();
      this.hideInstallPrompt();
    });
  }

  maybeShowInstallPrompt() {
    // Vent med at vise prompt
    const shouldShow = this.shouldShowPrompt();

    if (!shouldShow) return;

    // Valg 1: Diskret banner i bunden
    this.showBottomBanner();

    // Valg 2: Inline CTA i UI
    // this.showInlineCTA();

    // Valg 3: Modal (kun efter engagement)
    // this.showModal();
  }

  shouldShowPrompt() {
    // Intelligent logic
    const rules = {
      // Ikke hvis allerede prompted
      notPromptedBefore: !this.hasBeenPrompted,

      // Kun efter 30 sek på siden (engagement)
      timeOnSite: this.getTimeOnSite() > 30000,

      // Kun hvis bruger har favoritter (værdi vist)
      hasFavorites: this.getFavoriteCount() > 0,

      // Ikke mere end 1 gang per session
      notThisSession: !sessionStorage.getItem('favorit_prompted_this_session'),

      // Respekter "No thanks" i 30 dage
      notDismissedRecently: this.checkDismissalDate()
    };

    return Object.values(rules).every(Boolean);
  }

  showBottomBanner() {
    const banner = document.createElement('div');
    banner.className = 'favorit-install-banner';
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-icon">📱</div>
        <div class="banner-text">
          <strong>Installer appen</strong>
          <p>Få hurtigere adgang og brug offline</p>
        </div>
        <button class="banner-install-btn">Installer</button>
        <button class="banner-close-btn" aria-label="Luk">×</button>
      </div>
    `;

    banner.querySelector('.banner-install-btn').addEventListener('click', () => {
      this.promptInstall();
    });

    banner.querySelector('.banner-close-btn').addEventListener('click', () => {
      this.dismissPrompt();
      banner.remove();
    });

    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(() => {
      banner.classList.add('visible');
    });
  }

  async promptInstall() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();

    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted install');
    } else {
      console.log('User dismissed install');
      this.dismissPrompt();
    }

    this.deferredPrompt = null;
  }

  dismissPrompt() {
    localStorage.setItem('favorit_install_prompted', Date.now());
    sessionStorage.setItem('favorit_prompted_this_session', 'true');
  }

  checkDismissalDate() {
    const lastDismissed = localStorage.getItem('favorit_install_prompted');
    if (!lastDismissed) return true;

    const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
    return daysSince > 30; // Re-prompt efter 30 dage
  }

  // Analytics
  trackInstall() {
    if (this.config.analytics) {
      this.config.analytics.track('pwa_installed', {
        source: 'install_prompt'
      });
    }
  }

  getTimeOnSite() {
    return Date.now() - (window.favoritPanelLoadTime || Date.now());
  }

  getFavoriteCount() {
    // Check Dexie
    return window.favoritPanelFavoriteCount || 0;
  }
}
```

### 4. Push Notifikationer

**Valg mellem:**
- **Firebase Cloud Messaging (FCM)** - Gratis, Google-baseret
- **OneSignal** - Managed service, lettere setup
- **Web Push Protocol** - DIY, fuld kontrol

**Implementation med FCM:**

```javascript
// Client-side
class PushNotificationManager {
  constructor(config) {
    this.config = config;
    this.vapidPublicKey = config.pushVapidKey;
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      await this.subscribeUser();
    }

    return permission;
  }

  async subscribeUser() {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });

    // Send til backend
    await this.sendSubscriptionToBackend(subscription);

    return subscription;
  }

  async sendSubscriptionToBackend(subscription) {
    await fetch(`${this.config.apiUrl}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        userId: this.getUserId(),
        eventId: this.config.eventId
      })
    });
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Service Worker - receive push
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: data.data,
    actions: data.actions || [
      { action: 'open', title: 'Åbn' },
      { action: 'dismiss', title: 'Luk' }
    ],
    tag: data.tag || 'favorit-notification',
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Fokuser eksisterende vindue hvis muligt
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Ellers åbn nyt vindue
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

**Use cases for notifikationer:**
- "Maria har delt 5 favoritter med dig"
- "Din synkronisering er færdig"
- "Messen starter om 1 time - se dine favoritter"
- "Ny udstiller matcher dine interesser"

### 5. WPML Support (WordPress Multilingual)

**Challenge:** Flersproget support når embedded i WordPress

```javascript
// Detect WPML language
function detectWPMLLanguage() {
  // WPML bruger typisk:
  // 1. URL struktur: /da/page eller /?lang=da
  // 2. Cookies: wpml_browser_redirect_test
  // 3. HTML lang attribute

  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const pathLang = window.location.pathname.split('/')[1];
  const htmlLang = document.documentElement.lang;

  return urlLang || pathLang || htmlLang?.split('-')[0] || 'en';
}

// I18n system
class I18n {
  constructor(config) {
    this.locale = config.locale || detectWPMLLanguage();
    this.translations = {};
    this.fallbackLocale = 'en';
  }

  async loadTranslations() {
    try {
      const response = await fetch(
        `https://cdn.favorit.app/i18n/${this.locale}.json`
      );
      this.translations = await response.json();
    } catch (err) {
      console.warn(`Failed to load ${this.locale}, falling back to ${this.fallbackLocale}`);
      const response = await fetch(
        `https://cdn.favorit.app/i18n/${this.fallbackLocale}.json`
      );
      this.translations = await response.json();
    }
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;

    for (let k of keys) {
      value = value?.[k];
    }

    if (!value) return key;

    // Replace params: t('hello.name', { name: 'John' })
    return value.replace(/\{(\w+)\}/g, (_, param) => params[param] || '');
  }
}

// Translations: /i18n/da.json
{
  "favorites": {
    "title": "Mine Favoritter",
    "empty": "Du har ingen favoritter endnu",
    "add": "Tilføj til favoritter",
    "remove": "Fjern fra favoritter",
    "share": "Del liste",
    "count": "{count} favoritter"
  },
  "install": {
    "prompt": "Installer appen for offline adgang",
    "button": "Installer",
    "dismiss": "Ikke nu"
  },
  "sync": {
    "syncing": "Synkroniserer...",
    "success": "Synkroniseret",
    "error": "Fejl ved synkronisering"
  }
}

// Usage
const i18n = new I18n({ locale: 'da' });
await i18n.loadTranslations();

document.querySelector('.title').textContent = i18n.t('favorites.title');
document.querySelector('.count').textContent = i18n.t('favorites.count', { count: 5 });
```

### 6. Pull to Refresh

**Native-like oplevelse:**

```javascript
class PullToRefresh {
  constructor(container, onRefresh) {
    this.container = container;
    this.onRefresh = onRefresh;
    this.startY = 0;
    this.currentY = 0;
    this.pulling = false;
    this.threshold = 80; // px

    this.init();
  }

  init() {
    // Kun på mobile
    if (!this.isMobile()) return;

    this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
    this.container.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.handleEnd.bind(this));
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  handleStart(e) {
    // Kun hvis scrollet til top
    if (this.container.scrollTop === 0) {
      this.startY = e.touches[0].pageY;
      this.pulling = true;
    }
  }

  handleMove(e) {
    if (!this.pulling) return;

    this.currentY = e.touches[0].pageY;
    const distance = this.currentY - this.startY;

    if (distance > 0) {
      e.preventDefault(); // Prevent scroll

      // Visual feedback
      const pullDistance = Math.min(distance, this.threshold * 2);
      const rotation = (pullDistance / this.threshold) * 360;

      this.updateVisual(pullDistance, rotation);
    }
  }

  async handleEnd() {
    if (!this.pulling) return;

    const distance = this.currentY - this.startY;

    if (distance > this.threshold) {
      // Trigger refresh
      this.showRefreshing();
      await this.onRefresh();
      this.hideRefreshing();
    }

    this.resetVisual();
    this.pulling = false;
    this.startY = 0;
    this.currentY = 0;
  }

  updateVisual(distance, rotation) {
    const refreshIndicator = document.getElementById('refresh-indicator');
    if (!refreshIndicator) return;

    refreshIndicator.style.transform = `translateY(${distance}px) rotate(${rotation}deg)`;
    refreshIndicator.style.opacity = Math.min(distance / this.threshold, 1);
  }

  showRefreshing() {
    const indicator = document.getElementById('refresh-indicator');
    indicator.classList.add('refreshing');
  }

  hideRefreshing() {
    const indicator = document.getElementById('refresh-indicator');
    indicator.classList.remove('refreshing');
  }

  resetVisual() {
    const indicator = document.getElementById('refresh-indicator');
    indicator.style.transform = '';
    indicator.style.opacity = 0;
  }
}

// Usage
const pullToRefresh = new PullToRefresh(
  document.querySelector('.exhibitors-grid'),
  async () => {
    // Refresh logic
    await syncFavorites();
    await loadExhibitors();
  }
);
```

### 7. QR Code Generator (til installation)

**Use case:** Generer QR kode så brugere kan scanne og installere på anden enhed

```javascript
class QRCodeGenerator {
  constructor(config) {
    this.config = config;
  }

  async generateInstallQR() {
    // URL til installation-side
    const installUrl = `${window.location.origin}${window.location.pathname}?install=1`;

    // Brug QR code library (qrcode.js eller API)
    const qrDataUrl = await this.generateQRDataURL(installUrl);

    return qrDataUrl;
  }

  async generateShareQR(shareId) {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    return await this.generateQRDataURL(shareUrl);
  }

  async generateQRDataURL(text) {
    // Option 1: Client-side library
    if (typeof QRCode !== 'undefined') {
      const qr = new QRCode(document.createElement('div'), {
        text,
        width: 256,
        height: 256
      });
      return qr.toDataURL();
    }

    // Option 2: API service
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(text)}`;
    return apiUrl;

    // Option 3: Own backend
    // const response = await fetch(`${this.config.apiUrl}/qr/generate`, {
    //   method: 'POST',
    //   body: JSON.stringify({ text })
    // });
    // return response.blob();
  }

  showQRModal(qrDataUrl, title) {
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
      <div class="qr-modal-content">
        <button class="close-btn">×</button>
        <h2>${title}</h2>
        <img src="${qrDataUrl}" alt="QR Code" />
        <p>Scan med din telefon for at installere appen</p>
        <button class="download-btn">Download QR kode</button>
      </div>
    `;

    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.download-btn').addEventListener('click', () => {
      this.downloadQR(qrDataUrl, 'favorit-install-qr.png');
    });

    document.body.appendChild(modal);
  }

  downloadQR(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }
}

// Usage
const qrGenerator = new QRCodeGenerator(config);

// Install QR
document.querySelector('.show-install-qr').addEventListener('click', async () => {
  const qrUrl = await qrGenerator.generateInstallQR();
  qrGenerator.showQRModal(qrUrl, 'Installer Favorit Panel');
});

// Share QR
document.querySelector('.share-qr-btn').addEventListener('click', async () => {
  const shareId = await createShare();
  const qrUrl = await qrGenerator.generateShareQR(shareId);
  qrGenerator.showQRModal(qrUrl, 'Del dine favoritter');
});
```

### 8. Navigation Bar & App Shortcuts

**Navigation bar i PWA:**

```javascript
// Brug <nav> element med sticky positioning
const createNavigationBar = () => {
  const nav = document.createElement('nav');
  nav.className = 'favorit-nav';
  nav.innerHTML = `
    <div class="nav-content">
      <a href="#udstillere" class="nav-item active">
        <svg><!-- home icon --></svg>
        <span>Udstillere</span>
      </a>
      <a href="#favoritter" class="nav-item">
        <svg><!-- heart icon --></svg>
        <span>Favoritter</span>
        <span class="badge" id="fav-count">0</span>
      </a>
      <a href="#delte" class="nav-item">
        <svg><!-- users icon --></svg>
        <span>Delte</span>
      </a>
      <a href="#indstillinger" class="nav-item">
        <svg><!-- settings icon --></svg>
        <span>Mere</span>
      </a>
    </div>
  `;

  return nav;
};

// CSS for native feel
/*
.favorit-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: env(safe-area-inset-bottom) 0 0; /* iOS safe area */
  z-index: 1000;
}

/* iOS notch support */
@supports (padding: env(safe-area-inset-bottom)) {
  .favorit-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
*/
```

**App Shortcuts (manifest):**
```javascript
// Allerede vist tidligere i manifest
"shortcuts": [
  {
    "name": "Mine Favoritter",
    "url": "/favoritter",
    "icons": [{ "src": "/icons/heart-96.png", "sizes": "96x96" }]
  },
  {
    "name": "Scan QR",
    "url": "/scan",
    "icons": [{ "src": "/icons/qr-96.png", "sizes": "96x96" }]
  },
  {
    "name": "Statistik",
    "url": "/stats",
    "icons": [{ "src": "/icons/chart-96.png", "sizes": "96x96" }]
  }
]
```

### 9. Accessibility (WCAG 2.1 AA)

**Checklist:**

```javascript
class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
    this.setupColorContrast();
    this.setupReducedMotion();
  }

  setupKeyboardNavigation() {
    // Tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });

    // Escape to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTopModal();
      }
    });

    // Enter/Space på buttons
    document.querySelectorAll('[role="button"]').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  setupScreenReaderSupport() {
    // ARIA live regions for dynamisk content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);

    // Announce favorites count
    window.addEventListener('favoriteAdded', (e) => {
      this.announce(`${e.detail.name} tilføjet til favoritter`);
    });

    window.addEventListener('favoriteRemoved', (e) => {
      this.announce(`${e.detail.name} fjernet fra favoritter`);
    });
  }

  announce(message) {
    const liveRegion = document.getElementById('live-region');
    liveRegion.textContent = message;

    // Clear efter 1 sekund
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  setupFocusManagement() {
    // Focus trap i modals
    document.querySelectorAll('.modal').forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    });
  }

  setupColorContrast() {
    // Valider farvekontrast
    const validateContrast = (bg, fg) => {
      // Beregn contrast ratio (WCAG formula)
      // Skal være mindst 4.5:1 for normal tekst, 3:1 for stor tekst
      const ratio = this.calculateContrastRatio(bg, fg);
      return ratio >= 4.5;
    };

    // Hvis kunde's theme ikke opfylder WCAG, brug fallback
    if (!validateContrast(config.theme.backgroundColor, config.theme.textColor)) {
      console.warn('Theme colors do not meet WCAG contrast requirements');
      // Brug fallback colors
    }
  }

  setupReducedMotion() {
    // Respekter prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
      document.body.classList.add('reduced-motion');
    }

    prefersReducedMotion.addEventListener('change', () => {
      if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    });
  }

  calculateContrastRatio(bg, fg) {
    // Simplified - brug egentlig WCAG formula
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >>  8) & 0xff;
      const b = (rgb >>  0) & 0xff;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    const l1 = getLuminance(bg);
    const l2 = getLuminance(fg);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }
}

// CSS for accessibility
/*
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}

.keyboard-nav *:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
*/
```

### 10. Offline Forms

**Gem form data når offline, send når online:**

```javascript
class OfflineFormManager {
  constructor(db) {
    this.db = db;
    this.init();
  }

  init() {
    // Intercept alle form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.favorit-form')) {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      }
    });

    // Listen for online event
    window.addEventListener('online', () => {
      this.processPendingForms();
    });
  }

  async handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (navigator.onLine) {
      // Online - send med det samme
      await this.submitForm(data);
    } else {
      // Offline - gem til senere
      await this.saveForLater(data, form.action);
      this.showOfflineNotice();
    }
  }

  async saveForLater(data, action) {
    await this.db.offlineSubmissions.add({
      type: 'form',
      action,
      data,
      timestamp: Date.now(),
      submitted: false
    });
  }

  async processPendingForms() {
    const pending = await this.db.offlineSubmissions
      .where('submitted').equals(false)
      .toArray();

    for (const submission of pending) {
      try {
        await this.submitForm(submission.data, submission.action);

        // Mark som sendt
        await this.db.offlineSubmissions.update(submission.id, {
          submitted: true
        });
      } catch (err) {
        console.error('Failed to submit form:', err);
        // Prøv igen senere
      }
    }

    if (pending.length > 0) {
      this.showSyncSuccessNotice(pending.length);
    }
  }

  async submitForm(data, action) {
    const response = await fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    return response.json();
  }

  showOfflineNotice() {
    // Toast notification
    notyf.error('Du er offline. Din besked gemmes og sendes når du er online igen.');
  }

  showSyncSuccessNotice(count) {
    notyf.success(`${count} gemte beskeder er nu sendt`);
  }
}

// Example form
/*
<form class="favorit-form" action="/api/feedback">
  <label>
    Navn
    <input type="text" name="name" required />
  </label>
  <label>
    Besked
    <textarea name="message" required></textarea>
  </label>
  <button type="submit">Send</button>

  <!-- Offline indicator -->
  <div class="offline-indicator" style="display: none;">
    <svg><!-- offline icon --></svg>
    Du er offline. Beskeden sendes når du får forbindelse.
  </div>
</form>
*/
```

---

## 📊 Analytics & Stats

**Offline-first analytics:**

```javascript
class AnalyticsManager {
  constructor(db, config) {
    this.db = db;
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  async track(event, properties = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      sent: false
    };

    // Gem lokalt
    await this.db.analyticsEvents.add(eventData);

    // Send hvis online
    if (navigator.onLine) {
      await this.flush();
    }
  }

  async flush() {
    const pending = await this.db.analyticsEvents
      .where('sent').equals(false)
      .limit(100)
      .toArray();

    if (pending.length === 0) return;

    try {
      await fetch(`${this.config.apiUrl}/analytics/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: pending })
      });

      // Mark som sendt
      const ids = pending.map(e => e.id);
      await this.db.analyticsEvents.bulkUpdate(
        ids.map(id => [id, { sent: true }])
      );
    } catch (err) {
      console.error('Analytics flush failed:', err);
    }
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods
  pageView() {
    this.track('page_view', {
      path: window.location.pathname,
      title: document.title
    });
  }

  favoriteAdded(exhibitorId) {
    this.track('favorite_added', { exhibitorId });
  }

  favoriteRemoved(exhibitorId) {
    this.track('favorite_removed', { exhibitorId });
  }

  shareCreated(shareId) {
    this.track('share_created', { shareId });
  }

  pwaInstalled() {
    this.track('pwa_installed');
  }
}

// Usage
const analytics = new AnalyticsManager(db, config);

// Auto-track page views
analytics.pageView();

// Track interactions
document.querySelector('.favorite-btn').addEventListener('click', () => {
  analytics.favoriteAdded(exhibitorId);
});
```

---

## 🚀 Implementation Faser

### **Fase 0: Setup & Infrastructure** (1-2 uger)

**Mål:** Grundlæggende arkitektur og dev environment

- [ ] Setup monorepo struktur
- [ ] Configure build system (Vite/Rollup)
- [ ] Setup CDN deployment (Cloudflare Pages)
- [ ] Basic CI/CD pipeline (GitHub Actions)
- [ ] Development environment med hot reload
- [ ] Dexie database schema
- [ ] TypeScript types (optional)

**Deliverables:**
```
/favorit-panel/
├── packages/
│   ├── client/          # Main app
│   ├── service-worker/  # SW logic
│   └── shared/          # Shared types/utils
├── scripts/
│   └── deploy.sh
├── .github/workflows/
│   └── deploy.yml
└── package.json
```

---

### **Fase 1: Core Favoritter (MVP)** (2-3 uger)

**Mål:** Fungerende favorit-system offline-first

- [ ] Embed script (`embed.js`)
- [ ] Dexie setup og schema
- [ ] UI components (favorit cards, toggle, liste)
- [ ] Offline-first favorit CRUD
- [ ] LocalStorage fallback for IE11
- [ ] Basic styling (mobile-first)
- [ ] Demo page til test

**Deliverables:**
- Fungerende favorit-system
- Persisterer i Dexie
- Fungerer offline
- Deployable via `<script>` tag

---

### **Fase 2: PWA Foundation** (2 uger)

**Mål:** Basic PWA capabilities

- [ ] Dynamisk manifest generation
- [ ] Service Worker med Workbox
- [ ] Asset caching (app shell)
- [ ] Offline fallback page
- [ ] Install detection
- [ ] Apple meta tags + touch icons
- [ ] Splash screens (automated)

**Deliverables:**
- Installerbar PWA
- Fungerer offline
- Passes Lighthouse PWA audit

---

### **Fase 3: Deling & Synkronisering** (2-3 uger)

**Mål:** Multi-device og deling

- [ ] Share URL generation (base64 encoded data)
- [ ] Import fra share URL
- [ ] QR code generator
- [ ] Backend API setup (optional)
- [ ] Device fingerprinting
- [ ] Sync logic (conflict resolution)
- [ ] Background sync (Service Worker)

**Deliverables:**
- Del favoritlister via URL
- Synkroniser mellem enheder
- QR kode til deling

---

### **Fase 4: Install Prompts & Onboarding** (1 uge)

**Mål:** Øge installation rate

- [ ] `beforeinstallprompt` handler
- [ ] Smart prompt timing logic
- [ ] Bottom banner UI
- [ ] Inline CTA komponenter
- [ ] Dismiss tracking
- [ ] Install analytics
- [ ] iOS install instructions

**Deliverables:**
- Native install prompts
- iOS install guide modal
- A/B testable prompts

---

### **Fase 5: Push Notifikationer** (2 uger)

**Mål:** Re-engagement via push

- [ ] Firebase Cloud Messaging setup
- [ ] Push subscription flow
- [ ] Permission request UI
- [ ] Backend push API
- [ ] Notification click handlers
- [ ] Notification templates
- [ ] Opt-out mechanism

**Use cases:**
- "Maria har delt favoritter"
- "Synkronisering færdig"
- "Messe starter snart"

**Deliverables:**
- Fungerende push system
- Admin interface til at sende notifikationer

---

### **Fase 6: WordPress Integration & WPML** (1-2 uger)

**Mål:** Seamless WordPress integration

- [ ] WordPress plugin wrapper
- [ ] Shortcode support: `[favorit_panel]`
- [ ] Gutenberg block
- [ ] WPML language detection
- [ ] I18n system (multi-language)
- [ ] Translation files (da, en, de, sv)
- [ ] Settings page i WP admin
- [ ] Theme color detection

**Deliverables:**
- WordPress plugin (zip)
- WPML compatible
- Admin settings interface

---

### **Fase 7: UX Enhancements** (2 uger)

**Mål:** Native app-like feel

- [ ] Pull-to-refresh
- [ ] Navigation bar (bottom)
- [ ] App shortcuts (manifest)
- [ ] Smooth animations
- [ ] Haptic feedback (mobile)
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error states

**Deliverables:**
- Poleret UX
- Native-like interactions
- Reduced motion support

---

### **Fase 8: Accessibility** (1 uge)

**Mål:** WCAG 2.1 AA compliance

- [ ] Keyboard navigation
- [ ] Screen reader support (ARIA)
- [ ] Focus management
- [ ] Color contrast validation
- [ ] Text scaling support
- [ ] Skip links
- [ ] Live regions
- [ ] Accessibility audit

**Deliverables:**
- WCAG 2.1 AA compliant
- Lighthouse accessibility score 100

---

### **Fase 9: Offline Forms & Advanced Features** (1-2 uger)

**Mål:** Full offline capabilities

- [ ] Offline form handling
- [ ] Background sync for forms
- [ ] Note-taking feature
- [ ] Offline search
- [ ] Export to PDF/CSV
- [ ] Print styles
- [ ] Batch operations

**Deliverables:**
- Fuld offline functionality
- Data export options

---

### **Fase 10: Analytics & Monitoring** (1 uge)

**Mål:** Data-driven improvements

- [ ] Offline-first analytics
- [ ] Event tracking
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User flow analysis
- [ ] A/B testing framework
- [ ] Dashboard (admin)

**Deliverables:**
- Analytics dashboard
- Error monitoring
- Performance insights

---

### **Fase 11: Testing & Optimization** (2 uger)

**Mål:** Production-ready quality

- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Bundle size optimization
- [ ] Lighthouse audit (100/100)
- [ ] Load testing

**Deliverables:**
- >80% test coverage
- Lighthouse score 90+
- <100KB initial bundle

---

### **Fase 12: Documentation & Launch** (1 uge)

**Mål:** Launch-ready

- [ ] Developer documentation
- [ ] Integration guide
- [ ] API documentation
- [ ] User guide (end-users)
- [ ] Video tutorials
- [ ] Migration guide
- [ ] Troubleshooting guide
- [ ] Launch checklist

**Deliverables:**
- Complete documentation
- Launch-ready product
- Marketing materials

---

## 📦 Tech Stack Summary

### Client-Side
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | Vanilla JS eller Svelte | Small bundle, fast, embeddable |
| **Database** | Dexie.js | Best IndexedDB wrapper |
| **Service Worker** | Workbox 7 | Battle-tested, maintained by Google |
| **Build** | Vite | Fast, modern, great DX |
| **Styling** | CSS Modules | Scoped, no conflicts |
| **Testing** | Vitest + Playwright | Fast, modern |

### Backend (Optional)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Runtime** | Node.js 20+ | Mature, ecosystem |
| **Framework** | Fastify | Fast, low overhead |
| **Database** | PostgreSQL | Reliable, feature-rich |
| **ORM** | Drizzle | Type-safe, performant |
| **Cache** | Redis | Sync coordination |
| **Push** | FCM | Free, reliable |

### Infrastructure
| Component | Service | Rationale |
|-----------|---------|-----------|
| **CDN** | Cloudflare | Global, fast, cheap |
| **API Hosting** | Fly.io | Edge compute, global |
| **Database** | Neon | Serverless Postgres |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Plausible | Privacy-friendly |
| **CI/CD** | GitHub Actions | Free, integrated |

---

## 🎨 Design Considerations

### Multi-Tenant Theming

```javascript
// Customer configuration
{
  theme: {
    // Primary colors
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    accentColor: '#28a745',

    // Text
    textColor: '#212529',
    textColorLight: '#6c757d',

    // Backgrounds
    backgroundColor: '#ffffff',
    backgroundColorDark: '#f8f9fa',

    // Borders
    borderRadius: '8px',
    borderColor: '#dee2e6',

    // Fonts
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    fontSize: '16px',

    // Custom logo
    logo: 'https://kunde.dk/logo.svg',

    // Icons
    icon192: 'https://kunde.dk/icon-192.png',
    icon512: 'https://kunde.dk/icon-512.png',
    iconMaskable: 'https://kunde.dk/maskable-512.png'
  }
}
```

### CSS Architecture

```
/styles/
├── reset.css              # CSS reset
├── variables.css          # CSS custom properties (themed)
├── components/
│   ├── button.css
│   ├── card.css
│   ├── modal.css
│   ├── nav.css
│   └── ...
├── layouts/
│   ├── grid.css
│   └── container.css
└── utilities/
    ├── spacing.css
    ├── typography.css
    └── accessibility.css
```

**Theming via CSS variables:**
```css
:root {
  --primary-color: var(--customer-primary, #007bff);
  --text-color: var(--customer-text, #212529);
  /* ... */
}

/* Customer overrides injected dynamically */
.favorit-panel {
  --customer-primary: #FF5733;
  --customer-text: #1a1a1a;
}
```

---

## 🔒 Security Considerations

### Content Security Policy

```javascript
// Recommended CSP for customers
const csp = `
  default-src 'self';
  script-src 'self' https://cdn.favorit.app;
  style-src 'self' https://cdn.favorit.app 'unsafe-inline';
  img-src 'self' https://cdn.favorit.app data:;
  connect-src 'self' https://api.favorit.app;
  font-src 'self' https://cdn.favorit.app;
  worker-src 'self';
  manifest-src 'self' data:;
`;
```

### Data Privacy

- [ ] GDPR compliance
- [ ] Cookie consent (hvis påkrævet)
- [ ] Data retention policies
- [ ] User data export
- [ ] Right to be forgotten
- [ ] Privacy policy

### XSS Prevention

```javascript
// Sanitize user input
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Use textContent, ikke innerHTML
element.textContent = userInput;

// Eller brug DOMPurify for komplekse cases
```

---

## 📈 Success Metrics

### Installation
- Install prompt impression rate
- Install conversion rate
- Install-to-usage retention (D1, D7, D30)

### Engagement
- Active users (DAU, WAU, MAU)
- Favorites per user (avg)
- Share rate
- Return visit frequency

### Performance
- Time to Interactive (TTI) <3s
- First Contentful Paint (FCP) <1.5s
- Lighthouse PWA score 100
- Offline success rate >95%

### Technical
- Service Worker registration success rate
- Sync success rate
- Push notification delivery rate
- Error rate <1%

---

## 🚧 Potential Challenges

### 1. **iOS Safari Limitations**
- Service Worker support (iOS 11.3+, men bugs)
- No push notifications på iOS (endnu)
- Add to Home Screen UI er skjult

**Mitigation:**
- Graceful degradation
- Custom install instructions for iOS
- Use Web Push API når/hvis supported

### 2. **Storage Quotas**
- IndexedDB quotas varierer (50MB-100MB+)
- Kan blive slettet ved lav storage

**Mitigation:**
- Persistent storage API: `navigator.storage.persist()`
- Monitor quota: `navigator.storage.estimate()`
- Prioritize kritisk data

### 3. **Cross-Domain Issues**
- Service Worker kun på same-origin
- Cookie sync challenges

**Mitigation:**
- Host SW på kunde's domain (via proxy)
- Alternativt: `<iframe>` for SW registration

### 4. **WordPress Plugin Conflicts**
- Andre plugins kan overskrive SW
- CSS conflicts

**Mitigation:**
- Namespace alt CSS (`.favorit-*`)
- Coordinate med WP PWA plugin hvis installeret
- Shadow DOM for fuld isolation

---

## 📚 Resources & References

### Documentation
- [Google PWA Docs](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Dexie.js Guide](https://dexie.org/docs/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)

### Testing
- [Playwright](https://playwright.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [BrowserStack](https://www.browserstack.com/) (cross-browser)

---

## 🎯 Next Steps

1. **Review & prioritize** features based on customer needs
2. **Setup development environment** (Fase 0)
3. **Build MVP** (Fase 1-2) for initial customer testing
4. **Iterate** based on feedback
5. **Scale** to additional features

---

## 📞 Support & Maintenance

### SLA
- Critical bugs: <4 hours
- High priority: <24 hours
- Medium: <3 days
- Low: <1 week

### Versioning
- Follow SemVer (major.minor.patch)
- Maintain changelog
- Support previous major version for 6 months

### Updates
- Auto-update service worker (silent)
- Breaking changes require migration guide
- Deprecation warnings 3 months before removal

---

**Projektplan version:** 1.0
**Senest opdateret:** 2025-11-08
**Forfatter:** Claude + Johannes

