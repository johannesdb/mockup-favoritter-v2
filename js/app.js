// App.js - Main initialization

async function init() {
    // Initialize global instances
    notyf = new Notyf({ duration: 3000, position: { x: 'right', y: 'bottom' } });
    syncModal = new tingle.modal({ closeMethods: ['overlay', 'button', 'escape'], closeLabel: "Luk" });
    
    // Load all Handlebars templates
    await Templates.loadAll();
    
    // Initial render
    renderExhibitors();
    
    // Setup event listeners
    setupMainEventListeners();
    initializeTippy();
    
    // Update UI state
    updateUsersButton();
    updateSyncButton();
    
    // Check for share URL parameter
    checkShareParameter();
}

// Start app when DOM is ready
window.addEventListener('DOMContentLoaded', init);