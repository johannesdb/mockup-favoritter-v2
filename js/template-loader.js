// Template Loader - Loads and compiles Handlebars templates

const Templates = {
    compiled: {},
    
    async load(name) {
        try {
            const response = await fetch(`templates/${name}.hbs`);
            const template = await response.text();
            this.compiled[name] = Handlebars.compile(template);
            return this.compiled[name];
        } catch (error) {
            console.error(`Error loading template ${name}:`, error);
            return null;
        }
    },
    
    async loadAll() {
        const templateNames = [
            'device-item',
            'exhibitor-card',
            'sync-modal-active',
            'sync-modal-empty',
            'user-toggle',
            'users-dropdown',
        ];
        
        await Promise.all(templateNames.map(name => this.load(name)));
    },
    
    render(name, data) {
        if (this.compiled[name]) {
            return this.compiled[name](data);
        }
        console.error(`Template ${name} not found`);
        return '';
    }
};

// Handlebars helpers
Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

Handlebars.registerHelper('includes', function(array, value) {
    return array && array.includes(value);
});

Handlebars.registerHelper('initials', function(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
});

// NEW: Helper to get display name (customName or name)
Handlebars.registerHelper('displayName', function(user) {
    return user.customName || user.name;
});