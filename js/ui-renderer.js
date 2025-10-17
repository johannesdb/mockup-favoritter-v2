// UI Renderer - Functions for rendering UI components

function renderExhibitors() {
    const grid = document.getElementById('exhibitorsGrid');
    let displayExhibitors = exhibitors;

    // Cleanup old tooltips
    userIndicatorTippyInstances.forEach(instance => instance.destroy());
    userIndicatorTippyInstances = [];

    console.log('renderExhibitors called');
    console.log('showMyFavorites:', showMyFavorites);
    console.log('activeSharedUsers:', Array.from(activeSharedUsers));

    // Filter logic
    if (showMyFavorites && activeSharedUsers.size > 0) {
        const othersUnion = new Set();
        activeSharedUsers.forEach(userId => {
            const user = sharedUsers.find(u => u.id === userId);
            if (user) {
                user.favorites.forEach(fav => othersUnion.add(fav));
            }
        });
        
        const intersection = new Set();
        myFavorites.forEach(fav => {
            if (othersUnion.has(fav)) {
                intersection.add(fav);
            }
        });
        
        displayExhibitors = exhibitors.filter(e => intersection.has(e.id));
        
    } else if (showMyFavorites) {
        displayExhibitors = exhibitors.filter(e => myFavorites.has(e.id));
        
    } else if (activeSharedUsers.size > 0) {
        const othersUnion = new Set();
        activeSharedUsers.forEach(userId => {
            const user = sharedUsers.find(u => u.id === userId);
            console.log('Found user:', user);
            if (user) {
                user.favorites.forEach(fav => othersUnion.add(fav));
            }
        });
        
        console.log('othersUnion:', Array.from(othersUnion));
        displayExhibitors = exhibitors.filter(e => othersUnion.has(e.id));
    }

    console.log('displayExhibitors count:', displayExhibitors.length);

    // Render each exhibitor card
    try {
        grid.innerHTML = displayExhibitors.map(exhibitor => {
            const usersWhoFavorited = sharedUsers.filter(user => 
                activeSharedUsers.has(user.id) && user.favorites.includes(exhibitor.id)
            );
            
            const isMyFavorite = myFavorites.has(exhibitor.id);

            console.log('Rendering exhibitor:', exhibitor.id, 'usersWhoFavorited:', usersWhoFavorited.length);

            return Templates.render('exhibitor-card', {
                ...exhibitor,
                usersWhoFavorited,
                isMyFavorite
            });
        }).join('');
    } catch (error) {
        console.error('Error rendering exhibitors:', error);
        console.error('Error stack:', error.stack);
    }

    // Setup tooltips for user indicators
    setTimeout(() => {
        document.querySelectorAll('.user-indicator').forEach(indicator => {
            const userName = indicator.dataset.userName;
            if (typeof tippy !== 'undefined') {
                const instance = tippy(indicator, {
                    content: userName,
                    placement: 'top',
                    arrow: true
                });
                userIndicatorTippyInstances.push(instance);
            }
        });
    }, 0);
}

function renderUsersDropdownContent() {
    const hasUsers = sharedUsers.length > 0;
    
    const userToggles = sharedUsers.map(user => {
        const displayName = user.customName || user.name;
        const isActive = activeSharedUsers.has(user.id);
        const isEditing = editingUserId === user.id;
        const favoritesCount = user.favorites.length;
        
        return Templates.render('user-toggle', {
            ...user,
            displayName,
            isActive,
            isEditing,
            favoritesCount
        });
    }).join('');
    
    return Templates.render('users-dropdown', {
        hasUsers,
        userToggles,
        showAddInput: showAddFavoritesInput
    });
}

function renderSyncModal() {
    let content = '';
    
    if (!isSyncGroup || syncDevices.length === 0) {
        content = Templates.render('sync-modal-empty', {
            showJoinInput: showJoinSyncInput
        });
    } else {
        const devicesWithCurrent = syncDevices.map(d => ({
            ...d,
            isCurrent: (currentDevice === 1 && d.isDevice1) || (currentDevice === 2 && d.isDevice2)
        }));
        
        const deviceItems = devicesWithCurrent.map(device => {
            return Templates.render('device-item', {
                ...device,
                isEditing: editingDeviceId === device.id
            });
        }).join('');
        
        const showLeaveButton = syncDevices.length > 1;
        const showDeleteButton = syncDevices.length === 1;
        
        content = Templates.render('sync-modal-active', {
            deviceItems,
            showLeaveButton,
            showDeleteButton
        });
    }
    
    syncModal.setContent(content);
    
    // Setup event listeners after render
    setTimeout(() => setupModalEventListeners(), 0);
}

function updateUsersButton() {
    const usersBtn = document.getElementById('usersBtn');
    const badge = document.getElementById('usersBadge');
    
    if (activeSharedUsers.size > 0) {
        usersBtn.classList.add('active');
        badge.textContent = activeSharedUsers.size;
        badge.classList.add('show');
    } else {
        usersBtn.classList.remove('active');
        badge.classList.remove('show');
    }
}

function updateSyncButton() {
    const syncBtn = document.getElementById('syncBtn');
    if (isSyncGroup && syncDevices.length > 0) {
        syncBtn.classList.add('active');
    } else {
        syncBtn.classList.remove('active');
    }
}