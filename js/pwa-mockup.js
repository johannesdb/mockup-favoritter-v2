// PWA Mockup Interactive Demo

// State
let state = {
    pwaMode: true,
    offlineMode: false,
    installBanner: false,
    currentTab: 'tabUdstillere'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupControls();
    setupNavigation();
    setupInteractions();
});

// Setup Mockup Controls
function setupControls() {
    const pwaToggle = document.getElementById('pwaToggle');
    const offlineToggle = document.getElementById('offlineToggle');
    const installBannerToggle = document.getElementById('installBannerToggle');

    // PWA Mode Toggle
    pwaToggle.addEventListener('change', (e) => {
        state.pwaMode = e.target.checked;
        const deviceFrame = document.getElementById('deviceFrame');

        if (state.pwaMode) {
            deviceFrame.classList.remove('no-frame');
        } else {
            deviceFrame.classList.add('no-frame');
        }
    });

    // Offline Mode Toggle
    offlineToggle.addEventListener('change', (e) => {
        state.offlineMode = e.target.checked;
        const offlineBanner = document.getElementById('offlineBanner');
        const onlineStatus = document.getElementById('onlineStatus');

        if (state.offlineMode) {
            offlineBanner.style.display = 'flex';
            onlineStatus.textContent = '📡❌';
        } else {
            offlineBanner.style.display = 'none';
            onlineStatus.textContent = '📡';
        }
    });

    // Install Banner Toggle
    installBannerToggle.addEventListener('change', (e) => {
        state.installBanner = e.target.checked;
        const installBanner = document.getElementById('installBanner');

        if (state.installBanner) {
            installBanner.style.display = 'block';
        } else {
            installBanner.style.display = 'none';
        }
    });
}

// Setup Tab Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);

            // Update active state
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        state.currentTab = tabId;
    }
}

// Setup Interactions
function setupInteractions() {
    // Install banner close
    const installBannerClose = document.querySelector('.install-btn-close');
    if (installBannerClose) {
        installBannerClose.addEventListener('click', () => {
            document.getElementById('installBanner').style.display = 'none';
            document.getElementById('installBannerToggle').checked = false;
            state.installBanner = false;
        });
    }

    // Install button
    const installBtn = document.querySelector('.install-btn-primary');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            showToast('App installeret! ✅');
            document.getElementById('installBanner').style.display = 'none';
            document.getElementById('installBannerToggle').checked = false;
            state.installBanner = false;
        });
    }

    // Favorite buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.card-favorite-btn')) {
            const btn = e.target.closest('.card-favorite-btn');
            btn.classList.toggle('favorited');

            if (btn.classList.contains('favorited')) {
                showToast('Tilføjet til favoritter ❤️');
                updateFavoriteCount(1);
            } else {
                showToast('Fjernet fra favoritter');
                updateFavoriteCount(-1);
            }
        }
    });

    // Favorite remove buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-remove')) {
            const item = e.target.closest('.favorite-item');
            item.style.opacity = '0';
            item.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                item.remove();
                showToast('Favorit fjernet');
                updateFavoriteCount(-1);
            }, 300);
        }
    });

    // Shared user toggles
    document.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-shared')) {
            const toggle = e.target.closest('.toggle-shared').querySelector('.toggle-indicator');
            toggle.classList.toggle('active');

            if (toggle.classList.contains('active')) {
                showToast('Delt liste aktiveret');
            } else {
                showToast('Delt liste deaktiveret');
            }
        }
    });

    // Share button
    const shareBtn = document.querySelector('.share-button');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            showShareDialog();
        });
    }

    // Settings action buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.settings-action-btn');
        if (btn) {
            const action = btn.closest('.settings-item').querySelector('h4').textContent;
            showToast(`${action} - Kommer snart`);
        }
    });

    // Notification preferences toggles
    setupNotificationPreferences();

    // Pull to refresh simulation
    let pullStart = 0;
    let pulling = false;
    const appContent = document.getElementById('appContent');
    const pullIndicator = document.getElementById('pullRefreshIndicator');

    appContent.addEventListener('touchstart', (e) => {
        if (appContent.scrollTop === 0) {
            pullStart = e.touches[0].clientY;
            pulling = true;
        }
    }, { passive: true });

    appContent.addEventListener('touchmove', (e) => {
        if (!pulling) return;

        const pullDistance = e.touches[0].clientY - pullStart;

        if (pullDistance > 0) {
            const opacity = Math.min(pullDistance / 80, 1);
            pullIndicator.style.opacity = opacity;

            if (pullDistance > 80) {
                pullIndicator.classList.add('visible');
            }
        }
    }, { passive: true });

    appContent.addEventListener('touchend', () => {
        if (pulling && pullIndicator.classList.contains('visible')) {
            // Simulate refresh
            setTimeout(() => {
                pullIndicator.classList.remove('visible');
                pullIndicator.style.opacity = 0;
                showToast('Opdateret ✓');
            }, 1000);
        } else {
            pullIndicator.style.opacity = 0;
        }

        pulling = false;
    });

    // Add share button click simulation
    const addShareBtn = document.querySelector('.add-share-btn');
    if (addShareBtn) {
        addShareBtn.addEventListener('click', () => {
            showToast('Scan QR kode eller indtast link');
        });
    }
}

// Notification Preferences Management
function setupNotificationPreferences() {
    // Initialize notification preferences state (would be in Dexie in real app)
    const notificationPrefs = {
        visitor: true,
        employee: true,
        staff: true,
        system: true
    };

    // Get all notification toggles
    const notifToggles = document.querySelectorAll('[name^="notif-"]');

    notifToggles.forEach(toggle => {
        // Set initial state from preferences
        const type = toggle.name.replace('notif-', '');
        toggle.checked = notificationPrefs[type];

        // Handle changes
        toggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;

            // Update state (in real app: save to Dexie + sync to server)
            notificationPrefs[type] = enabled;

            // Show feedback with appropriate message
            const messages = {
                visitor: {
                    on: '👥 Besøgende notifikationer aktiveret',
                    off: '👥 Besøgende notifikationer deaktiveret'
                },
                employee: {
                    on: '💼 Medarbejder notifikationer aktiveret',
                    off: '💼 Medarbejder notifikationer deaktiveret'
                },
                staff: {
                    on: '🏢 Personale beskeder aktiveret',
                    off: '🏢 Personale beskeder deaktiveret'
                },
                system: {
                    on: '⚙️ System notifikationer aktiveret',
                    off: '⚙️ System notifikationer deaktiveret'
                }
            };

            const message = messages[type]?.[enabled ? 'on' : 'off'] ||
                           `Notifikationer ${enabled ? 'aktiveret' : 'deaktiveret'}`;

            showToast(message);

            // Simulate server sync (in real app)
            if (enabled) {
                console.log(`✓ Server: ${type} notifications enabled for user`);
            } else {
                console.log(`✗ Server: ${type} notifications disabled for user`);
            }

            // Log the current state
            console.log('Notification Preferences:', notificationPrefs);
        });
    });
}

// Helper Functions
function updateFavoriteCount(delta) {
    const badge = document.querySelector('.nav-badge');
    if (badge) {
        const current = parseInt(badge.textContent) || 0;
        const newCount = Math.max(0, current + delta);
        badge.textContent = newCount;

        if (newCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'block';
        }
    }
}

function showToast(message) {
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: toastIn 0.3s ease;
        backdrop-filter: blur(10px);
    `;

    // Add to device screen
    const deviceScreen = document.querySelector('.device-screen');
    deviceScreen.appendChild(toast);

    // Remove after 2 seconds
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function showShareDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'share-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: flex-end;
        animation: fadeIn 0.2s ease;
    `;

    dialog.innerHTML = `
        <div style="
            background: white;
            width: 100%;
            border-radius: 20px 20px 0 0;
            padding: 24px;
            animation: slideUp 0.3s ease;
        ">
            <div style="
                width: 40px;
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                margin: 0 auto 20px;
            "></div>
            <h3 style="font-size: 18px; margin-bottom: 16px; text-align: center;">Del dine favoritter</h3>
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <button class="share-option" data-type="qr" style="
                    flex: 1;
                    padding: 16px;
                    background: #f5f5f5;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                ">
                    📱 QR Kode
                </button>
                <button class="share-option" data-type="link" style="
                    flex: 1;
                    padding: 16px;
                    background: #f5f5f5;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                ">
                    🔗 Kopier link
                </button>
            </div>
            <button class="cancel-share" style="
                width: 100%;
                padding: 14px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
            ">Annuller</button>
        </div>
    `;

    document.querySelector('.device-screen').appendChild(dialog);

    // Handle clicks
    dialog.addEventListener('click', (e) => {
        if (e.target.classList.contains('share-dialog') || e.target.classList.contains('cancel-share')) {
            dialog.remove();
        }

        if (e.target.closest('.share-option')) {
            const type = e.target.closest('.share-option').dataset.type;
            if (type === 'qr') {
                showToast('QR kode genereret');
            } else {
                showToast('Link kopieret til udklipsholder');
            }
            dialog.remove();
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes toastIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes toastOut {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }

    @keyframes slideUp {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
