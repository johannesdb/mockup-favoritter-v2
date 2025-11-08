// PWA Mockup Interactive Demo

// State
let state = {
    pwaMode: true,
    offlineMode: false,
    installBanner: false,
    currentTab: 'tabUdstillere',
    notifSimulator: false,
    notifHistory: [],
    notifFilter: 'all'
};

// Notification Simulator
let notifSimulatorInterval = null;

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

    // Notification Simulator Toggle
    const notifSimulatorToggle = document.getElementById('notifSimulatorToggle');
    notifSimulatorToggle.addEventListener('change', (e) => {
        state.notifSimulator = e.target.checked;

        if (state.notifSimulator) {
            startNotificationSimulator();
            showToast('🔔 Notification Simulator startet');
        } else {
            stopNotificationSimulator();
            showToast('🔔 Notification Simulator stoppet');
        }
    });

    // Show Notification History Button
    const showNotifHistoryBtn = document.getElementById('showNotifHistoryBtn');
    showNotifHistoryBtn.addEventListener('click', () => {
        showNotificationHistory();
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

// ===== NOTIFICATION SIMULATOR =====

// Notification templates
const notificationTemplates = [
    {
        type: 'visitor',
        icon: '👥',
        templates: [
            { title: 'Maria Jensen', body: 'Har delt 5 favoritter med dig' },
            { title: 'Ny besøgende', body: 'Lars har favorit-markeret ALBA LIGHTING' },
            { title: 'Anna Schmidt', body: 'Har tilføjet 3 nye favoritter' },
            { title: 'Besøgende aktivitet', body: 'Sophie har delt en liste med 8 udstillere' }
        ]
    },
    {
        type: 'employee',
        icon: '💼',
        templates: [
            { title: 'Kollega deling', body: 'Peter har kommenteret på din favorit' },
            { title: 'Team opdatering', body: 'Din gruppe har nu 15 delte favoritter' },
            { title: 'Medarbejder', body: 'Maria har inviteret dig til et møde ved stand 11' }
        ]
    },
    {
        type: 'staff',
        icon: '🏢',
        templates: [
            { title: 'Vigtig besked', body: 'Messen åbner om 30 minutter' },
            { title: 'Arrangør', body: 'Ny keynote speaker annonceret - Se program' },
            { title: 'Event opdatering', body: 'Workshop i Hal 3 starter om 15 min' }
        ]
    },
    {
        type: 'system',
        icon: '⚙️',
        templates: [
            { title: 'Synkronisering', body: 'Dine favoritter er synkroniseret på tværs af enheder' },
            { title: 'App opdatering', body: 'Ny version tilgængelig - Opdater nu' },
            { title: 'Data backup', body: 'Dine data er sikkerhedskopieret' }
        ]
    }
];

// Start notification simulator
function startNotificationSimulator() {
    // Clear any existing interval
    stopNotificationSimulator();

    // Send first notification immediately
    sendRandomNotification();

    // Then send one every 10-60 seconds
    notifSimulatorInterval = setInterval(() => {
        sendRandomNotification();
    }, getRandomInterval(10000, 60000)); // 10-60 seconds

    console.log('📡 Notification Simulator started');
}

// Stop notification simulator
function stopNotificationSimulator() {
    if (notifSimulatorInterval) {
        clearInterval(notifSimulatorInterval);
        notifSimulatorInterval = null;
        console.log('📡 Notification Simulator stopped');
    }
}

// Send random notification
function sendRandomNotification() {
    // Pick random type
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    const notif = template.templates[Math.floor(Math.random() * template.templates.length)];

    // Create notification object
    const notification = {
        id: Date.now(),
        type: template.type,
        icon: template.icon,
        title: notif.title,
        body: notif.body,
        timestamp: Date.now(),
        shown: shouldShowNotification(template.type),
        read: false
    };

    // Add to history
    state.notifHistory.unshift(notification);

    // Log to console
    console.log(`📬 Notification ${notification.shown ? 'SHOWN' : 'FILTERED'}:`, {
        type: notification.type,
        title: notification.title,
        shown: notification.shown
    });

    // If should be shown, display toast
    if (notification.shown) {
        showNotificationToast(notification);
    }

    // Update history if modal is open
    if (document.getElementById('notifHistoryModal').style.display !== 'none') {
        renderNotificationHistory();
    }
}

// Check if notification should be shown based on preferences
function shouldShowNotification(type) {
    // Get preference for this type (from notification preferences)
    const checkbox = document.querySelector(`[name="notif-${type}"]`);
    return checkbox ? checkbox.checked : true;
}

// Show notification as toast
// Play notification sound using Web Audio API
function playNotificationSound() {
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create oscillator for a pleasant two-tone notification
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure sound - a pleasant "ding" sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // First tone
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Second tone (lower)

        // Volume envelope - fade in and out
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quick fade in
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2); // Fade out

        // Play the sound
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);

        console.log('🔔 Notification sound played');
    } catch (error) {
        console.log('Sound not available:', error.message);
    }
}

function showNotificationToast(notification) {
    // Play notification sound
    playNotificationSound();

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        max-width: 320px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid #667eea;
    `;

    toast.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
            <div style="font-size: 24px;">${notification.icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #333; margin-bottom: 4px;">
                    ${notification.title}
                </div>
                <div style="font-size: 13px; color: #666; line-height: 1.4;">
                    ${notification.body}
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
            ">×</button>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Get random interval between min and max
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== NOTIFICATION HISTORY =====

// Show notification history modal
function showNotificationHistory() {
    const modal = document.getElementById('notifHistoryModal');
    modal.style.display = 'flex';
    renderNotificationHistory();
}

// Hide notification history modal
function hideNotificationHistory() {
    const modal = document.getElementById('notifHistoryModal');
    modal.style.display = 'none';
}

// Render notification history
function renderNotificationHistory() {
    const listEl = document.getElementById('notifHistoryList');
    const filter = state.notifFilter;

    // Filter notifications
    let filtered = state.notifHistory;
    if (filter === 'shown') {
        filtered = state.notifHistory.filter(n => n.shown);
    } else if (filter === 'filtered') {
        filtered = state.notifHistory.filter(n => !n.shown);
    }

    // Update stats
    const total = state.notifHistory.length;
    const shown = state.notifHistory.filter(n => n.shown).length;
    const filteredCount = state.notifHistory.filter(n => !n.shown).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statShown').textContent = shown;
    document.getElementById('statFiltered').textContent = filteredCount;

    // Render list
    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="empty-history">
                <div class="empty-icon">📭</div>
                <p>${filter === 'all' ? 'Ingen notifikationer endnu' : `Ingen ${filter === 'shown' ? 'viste' : 'filtrerede'} notifikationer`}</p>
                <small>Aktiver "Notification Simulator" for at se demo</small>
            </div>
        `;
        return;
    }

    // Group notifications by day
    const grouped = {
        'I dag': [],
        'I går': [],
        'Ældre': []
    };

    filtered.forEach(notif => {
        const category = getDayCategory(notif.timestamp);
        grouped[category].push(notif);
    });

    // Render grouped notifications
    let html = '';
    ['I dag', 'I går', 'Ældre'].forEach(dayCategory => {
        if (grouped[dayCategory].length > 0) {
            html += `<div class="day-group-header">${dayCategory}</div>`;
            html += grouped[dayCategory].map(notif => {
                const timeAgo = getTimeAgo(notif.timestamp);
                return `
                    <div class="notif-item ${notif.shown ? 'shown' : 'filtered'} ${notif.read ? 'read' : 'unread'}">
                        <div class="notif-item-header">
                            <div class="notif-icon">${notif.icon}</div>
                            <div class="notif-meta">
                                <div class="notif-type">${notif.type}</div>
                                <div class="notif-time">${timeAgo}</div>
                            </div>
                            <span class="notif-status ${notif.shown ? 'shown' : 'filtered'}">
                                ${notif.shown ? 'VIST' : 'FILTRERET'}
                            </span>
                        </div>
                        <div class="notif-title">${notif.title}</div>
                        <div class="notif-body">${notif.body}</div>
                        ${!notif.read ? '<div class="unread-indicator"></div>' : ''}
                    </div>
                `;
            }).join('');
        }
    });

    listEl.innerHTML = html;
}

// Get day category for grouping
function getDayCategory(timestamp) {
    const notifDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to midnight for comparison
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (notifDay.getTime() === todayDay.getTime()) return 'I dag';
    if (notifDay.getTime() === yesterdayDay.getTime()) return 'I går';
    return 'Ældre';
}

// Get time ago string
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s siden`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m siden`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}t siden`;
    return `${Math.floor(seconds / 86400)}d siden`;
}

// Setup notification history interactions
document.addEventListener('DOMContentLoaded', () => {
    // Close modal
    document.getElementById('closeNotifHistoryBtn').addEventListener('click', hideNotificationHistory);
    document.querySelector('.notif-history-overlay').addEventListener('click', hideNotificationHistory);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            state.notifFilter = filter;

            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render
            renderNotificationHistory();
        });
    });

    // Clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Er du sikker på du vil rydde historikken?')) {
            state.notifHistory = [];
            renderNotificationHistory();
            showToast('Historik ryddet');
        }
    });

    // Mark all as read
    document.getElementById('markAllReadBtn').addEventListener('click', () => {
        const unreadCount = state.notifHistory.filter(n => !n.read).length;
        if (unreadCount === 0) {
            showToast('Alle notifikationer er allerede læst', 'info');
            return;
        }

        state.notifHistory.forEach(n => n.read = true);
        renderNotificationHistory();
        showToast(`${unreadCount} notifikation${unreadCount !== 1 ? 'er' : ''} markeret som læst`, 'success');
    });
});

// Add animation CSS for notification toast
const notifStyle = document.createElement('style');
notifStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notifStyle);
