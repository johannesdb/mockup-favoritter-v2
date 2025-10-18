// Event Handlers - All event listeners and user interactions

function initializeTippy() {
    const usersBtn = document.getElementById('usersBtn');
    if (!usersBtn || typeof tippy === 'undefined') return;
    
    const contentEl = document.createElement('div');
    try {
        tippyInstance = tippy(usersBtn, {
            content: contentEl,
            theme: 'users-dropdown',
            trigger: 'click',
            interactive: true,
            allowHTML: true,
            placement: 'bottom-end',
            arrow: true,
            maxWidth: 400,
            onShow(instance) {
                const newContent = document.createElement('div');
                newContent.innerHTML = renderUsersDropdownContent();
                instance.setContent(newContent);
            },
            onShown(instance) {
                setupUsersToggleListeners();
            }
        });
    } catch (error) {
        console.error('Error initializing Tippy:', error);
    }
}

function setupUsersToggleListeners() {
    // Cleanup old settings menu instances
    settingsMenuTippyInstances.forEach(instance => instance.destroy());
    settingsMenuTippyInstances = [];
    
    // User toggle click (not settings button)
    document.querySelectorAll('.user-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Don't toggle if clicking settings button or in edit mode
            if (e.target.closest('.user-settings-btn') || 
                e.target.closest('.edit-name-form') ||
                editingUserId !== null) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const userId = parseInt(this.dataset.userId);
            console.log('Toggle clicked for user:', userId); // DEBUG
            
            if (!isNaN(userId)) {
                toggleUser(userId);
            }
        });
    });
    
    // Setup settings menu for each user
    document.querySelectorAll('.user-settings-btn').forEach(btn => {
        const userId = parseInt(btn.dataset.userId);
        
        // Stop propagation when clicking settings button
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
        });
        
        const menuContent = `
            <div class="settings-menu-item" data-action="rename" data-user-id="${userId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Omdøb
            </div>
            <div class="settings-menu-item delete" data-action="delete" data-user-id="${userId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Slet
            </div>
        `;
        
        const menuElement = document.createElement('div');
        menuElement.innerHTML = menuContent;
        
        const instance = tippy(btn, {
            content: menuElement,
            theme: 'settings-menu',
            trigger: 'click',
            interactive: true,
            allowHTML: true,
            placement: 'bottom-start',
            arrow: false,
            offset: [0, 4],
            onShown(instance) {
                // Setup menu item clicks
                instance.popper.querySelectorAll('.settings-menu-item').forEach(item => {
                    item.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const action = this.dataset.action;
                        const userId = parseInt(this.dataset.userId);
                        
                        if (action === 'rename') {
                            startEdit(userId);
                        } else if (action === 'delete') {
                            deleteSharedUser(userId);
                        }
                        
                        instance.hide();
                    });
                });
            }
        });
        
        settingsMenuTippyInstances.push(instance);
    });
    
    // Add favorites button
    const addFavBtn = document.getElementById('addFavoritesBtn');
    if (addFavBtn) {
        addFavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showAddFavoritesInput = !showAddFavoritesInput;
            if (tippyInstance) {
                const newContent = document.createElement('div');
                newContent.innerHTML = renderUsersDropdownContent();
                tippyInstance.setContent(newContent);
                setTimeout(() => {
                    setupUsersToggleListeners();
                    if (showAddFavoritesInput) {
                        const input = document.getElementById('favoritesNameInput');
                        if (input) input.focus();
                    }
                }, 0);
            }
        });
    }
    
    // Submit favorites link
    const submitBtn = document.getElementById('submitFavoritesLink');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const nameInput = document.getElementById('favoritesNameInput');
            const linkInput = document.getElementById('favoritesLinkInput');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const link = linkInput ? linkInput.value.trim() : '';
            
            if (name && link) {
                addFavoritesFromLink(link, name);
            } else if (!name) {
                notyf.error('Indtast venligst et navn');
            } else if (!link) {
                notyf.error('Indtast venligst et link');
            }
        });
    }
    
    // Cancel add favorites
    const cancelBtn = document.getElementById('cancelAddFavorites');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showAddFavoritesInput = false;
            if (tippyInstance) {
                const newContent = document.createElement('div');
                newContent.innerHTML = renderUsersDropdownContent();
                tippyInstance.setContent(newContent);
                setTimeout(() => setupUsersToggleListeners(), 0);
            }
        });
    }
}

function setupModalEventListeners() {
    const copyBtn = document.getElementById('copySyncUrlBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => notyf.success('Link kopieret!'));
    
    const leaveBtn = document.getElementById('leaveSyncBtn');
    if (leaveBtn) leaveBtn.addEventListener('click', leaveSync);
    
    const deleteBtn = document.getElementById('deleteSyncBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', cancelSyncGroup);
    
    const createBtn = document.getElementById('createSyncBtn');
    if (createBtn) createBtn.addEventListener('click', createSyncGroup);
    
    const joinBtn = document.getElementById('joinSyncBtn');
    if (joinBtn) joinBtn.addEventListener('click', () => {
        showJoinSyncInput = !showJoinSyncInput;
        renderSyncModal();
    });
    
    const submitBtn = document.getElementById('submitSyncLink');
    if (submitBtn) submitBtn.addEventListener('click', () => {
        const input = document.getElementById('syncLinkInput');
        if (input && input.value.trim()) joinSyncGroup(input.value.trim());
    });
    
    const cancelBtn = document.getElementById('cancelJoinSync');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        showJoinSyncInput = false;
        renderSyncModal();
    });
}

function setupMainEventListeners() {
    // Favorite button
    document.getElementById('favoriteBtn').addEventListener('click', function() {
        showMyFavorites = !showMyFavorites;
        this.classList.toggle('active');
        renderExhibitors();
    });

    // Device tabs
    document.querySelectorAll('.device-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const deviceNum = parseInt(this.dataset.device);
            currentDevice = deviceNum;
            myFavorites = currentDevice === 1 ? device1Favorites : device2Favorites;
            showMyFavorites = false;
            document.getElementById('favoriteBtn').classList.remove('active');
            document.querySelectorAll('.device-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderExhibitors();
        });
    });

    // Demo toggle
    document.getElementById('demoToggle').addEventListener('click', function() {
        if (this.textContent.includes('Ingen')) {
            isSyncGroup = false;
            syncDevices = [];
            this.textContent = 'Skift til "Med andres favoritter"';
            document.getElementById('demoStatus').textContent = 'Ingen synkronisering';
        } else {
            isSyncGroup = true;
            syncDevices = [
                { id: 1, name: 'iPhone 13', isCurrent: true, isDevice1: true },
                { id: 2, name: 'Laptop', isCurrent: false, isDevice2: true },
                { id: 3, name: 'iPad', isCurrent: false }
            ];
            this.textContent = 'Skift til "Ingen andres favoritter"';
            document.getElementById('demoStatus').textContent = '3 enheder synkroniseret';
        }
        updateSyncButton();
    });

    // Sync button
    document.getElementById('syncBtn').addEventListener('click', function() {
        renderSyncModal();
        syncModal.open();
    });
}

// Action functions
function toggleFavorite(id) {
    if (currentDevice === 1) {
        device1Favorites.has(id) ? device1Favorites.delete(id) : device1Favorites.add(id);
    } else {
        device2Favorites.has(id) ? device2Favorites.delete(id) : device2Favorites.add(id);
    }
    myFavorites = currentDevice === 1 ? device1Favorites : device2Favorites;
    renderExhibitors();
}

function toggleUser(userId) {
    if (activeSharedUsers.has(userId)) {
        activeSharedUsers.delete(userId);
    } else {
        activeSharedUsers.add(userId);
    }
    
    updateUsersButton();
    
    if (tippyInstance) {
        const newContent = document.createElement('div');
        newContent.innerHTML = renderUsersDropdownContent();
        tippyInstance.setContent(newContent);
        setTimeout(() => setupUsersToggleListeners(), 0);
    }
    
    renderExhibitors();
}

function addFavoritesFromLink(link, name) {
    const newUser = {
        id: Date.now(),
        name: name,
        customName: null,
        color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'][sharedUsers.length % 5],
        favorites: [1, 5, 8, 12]
    };
    
    sharedUsers.push(newUser);
    allSharedUsers.push(newUser);
    showAddFavoritesInput = false;
    notyf.success(`"${name}" tilføjet!`);
    
    if (tippyInstance) {
        const newContent = document.createElement('div');
        newContent.innerHTML = renderUsersDropdownContent();
        tippyInstance.setContent(newContent);
        setTimeout(() => setupUsersToggleListeners(), 0);
    }
}

function startEdit(userId) {
    editingUserId = userId;
    
    if (tippyInstance) {
        const newContent = document.createElement('div');
        newContent.innerHTML = renderUsersDropdownContent();
        tippyInstance.setContent(newContent);
        setTimeout(() => {
            setupUsersToggleListeners();
            const input = document.getElementById(`editInput_${userId}`);
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    }
}

function saveName(userId) {
    const input = document.getElementById(`editInput_${userId}`);
    if (input) {
        const newName = input.value.trim();
        if (newName) {
            const userIndex = sharedUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                sharedUsers[userIndex].customName = newName;
            }
            const allUserIndex = allSharedUsers.findIndex(u => u.id === userId);
            if (allUserIndex !== -1) {
                allSharedUsers[allUserIndex].customName = newName;
            }
            notyf.success('Navn opdateret!');
        }
    }
    cancelEdit();
}

function cancelEdit() {
    editingUserId = null;
    if (tippyInstance) {
        const newContent = document.createElement('div');
        newContent.innerHTML = renderUsersDropdownContent();
        tippyInstance.setContent(newContent);
        setTimeout(() => setupUsersToggleListeners(), 0);
    }
}

function deleteSharedUser(userId) {
    const user = sharedUsers.find(u => u.id === userId);
    const userName = user ? (user.customName || user.name) : 'denne deling';
    
    if (confirm(`Er du sikker på at du vil slette "${userName}"?`)) {
        // Remove from active users
        activeSharedUsers.delete(userId);
        
        // Remove from shared users
        sharedUsers = sharedUsers.filter(u => u.id !== userId);
        
        notyf.success(`"${userName}" slettet`);
        
        updateUsersButton();
        
        if (tippyInstance) {
            const newContent = document.createElement('div');
            newContent.innerHTML = renderUsersDropdownContent();
            tippyInstance.setContent(newContent);
            setTimeout(() => setupUsersToggleListeners(), 0);
        }
        
        renderExhibitors();
    }
}

function leaveSync() {
    if (confirm('Er du sikker på at du vil forlade sync-gruppen?')) {
        syncDevices = syncDevices.filter(d => 
            currentDevice === 1 ? !d.isDevice1 : !d.isDevice2
        );
        if (syncDevices.length === 0) isSyncGroup = false;
        updateSyncButton();
        renderSyncModal();
        notyf.success('Du har forladt sync-gruppen');
    }
}

function cancelSyncGroup() {
    syncDevices = [];
    isSyncGroup = false;
    updateSyncButton();
    renderSyncModal();
    notyf.success('Sync-gruppe annulleret');
}

function createSyncGroup() {
    syncDevices = [{
        id: Date.now(),
        name: currentDevice === 1 ? 'iPhone 13' : 'Laptop',
        isCurrent: true,
        isDevice1: currentDevice === 1,
        isDevice2: currentDevice === 2
    }];
    isSyncGroup = true;
    showJoinSyncInput = false;
    updateSyncButton();
    renderSyncModal();
    notyf.success('Sync-gruppe oprettet!');
}

function joinSyncGroup(link) {
    const thisDevice = {
        id: Date.now(),
        name: currentDevice === 1 ? 'iPhone 13' : 'Laptop',
        isCurrent: true,
        isDevice1: currentDevice === 1,
        isDevice2: currentDevice === 2
    };
    
    syncDevices = [
        { id: Date.now() + 1, name: 'iPad Pro', isCurrent: false },
        { id: Date.now() + 2, name: 'MacBook', isCurrent: false },
        thisDevice
    ];
    
    isSyncGroup = true;
    showJoinSyncInput = false;
    updateSyncButton();
    renderSyncModal();
    notyf.success('Tilsluttet sync-gruppe!');
    setTimeout(() => notyf.success('Favoritter sammenlagt!'), 2000);
}

function startDeviceEdit(event, deviceId) {
    event.preventDefault();
    event.stopPropagation();
    editingDeviceId = deviceId;
    renderSyncModal();
    
    setTimeout(() => {
        const input = document.getElementById(`deviceInput_${deviceId}`);
        if (input) {
            input.focus();
            input.select();
        }
    }, 0);
}

function saveDeviceName(deviceId) {
    const input = document.getElementById(`deviceInput_${deviceId}`);
    if (input) {
        const newName = input.value.trim();
        if (newName) {
            const deviceIndex = syncDevices.findIndex(d => d.id === deviceId);
            if (deviceIndex !== -1) {
                syncDevices[deviceIndex].name = newName;
            }
            notyf.success('Enhedsnavn opdateret!');
        }
    }
    cancelDeviceEdit();
}

function cancelDeviceEdit() {
    editingDeviceId = null;
    renderSyncModal();
}

// Check for share URL parameter on load
function checkShareParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    
    if (shareId) {
        // Auto-open the users dropdown with add form visible
        showAddFavoritesInput = true;
        
        setTimeout(() => {
            const usersBtn = document.getElementById('usersBtn');
            if (usersBtn && tippyInstance) {
                tippyInstance.show();
                
                setTimeout(() => {
                    const nameInput = document.getElementById('favoritesNameInput');
                    const linkInput = document.getElementById('favoritesLinkInput');
                    
                    if (linkInput) {
                        linkInput.value = window.location.href;
                    }
                    
                    if (nameInput) {
                        nameInput.focus();
                    }
                }, 100);
            }
        }, 500);
    }
}

// Global functions (called from HTML/templates)
window.toggleFavorite = toggleFavorite;
window.saveName = saveName;
window.cancelEdit = cancelEdit;
window.startDeviceEdit = startDeviceEdit;
window.saveDeviceName = saveDeviceName;
window.cancelDeviceEdit = cancelDeviceEdit;