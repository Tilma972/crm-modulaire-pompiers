// app-transition.js - Version adaptée à tes modules existants
// Cette version s'adapte à tes fichiers créés

// ========================================================================
// IMPORTS ADAPTATIFS (avec gestion d'erreurs)
// ========================================================================

console.log('🚀 Démarrage app-transition.js');

// Variables de fallback pour éviter les erreurs
let config = {
    N8N_WEBHOOKS: {
        RECHERCHE_ENTREPRISE: 'https://n8n.dsolution-ia.fr/webhook/recherche_entreprise',
        GATEWAY_ENTITIES: 'https://n8n.dsolution-ia.fr/webhook/gateway_entities'
    },
    DEFAULT_USER: { first_name: 'Stève', id: 123456789 }
};

let loadedModules = {};

// ========================================================================
// CHARGEMENT ADAPTATIF DES MODULES
// ========================================================================

async function loadModulesAdaptive() {
    console.log('🔧 Chargement adaptatif des modules...');
    
    const moduleMap = [
        { 
            path: './src/core/config.js', 
            name: 'config',
            fallback: () => config 
        },
        { 
            path: './src/core/state.js', 
            name: 'state',
            fallback: () => ({
                updateData: (key, value) => console.log(`State: ${key} =`, value),
                subscribe: (key, callback) => console.log(`State subscribe: ${key}`),
                getData: () => ({}),
                initialize: () => console.log('✅ State fallback initialisé')
            })
        },
        { 
            path: './src/services/api.js', 
            name: 'apiService',
            fallback: () => ({
                initialize: async () => console.log('✅ API fallback initialisé'),
                request: async (url, data) => {
                    console.log('📡 API Request (fallback):', url, data);
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    return response.json();
                }
            })
        },
        { 
            path: './src/services/telegram.js', 
            name: 'telegramService',
            fallback: () => ({
                initialize: async () => console.log('✅ Telegram fallback initialisé'),
                showHapticFeedback: (type) => console.log(`📱 Haptic: ${type}`),
                updateMainButton: (text, enabled) => console.log(`📱 Button: ${text} (${enabled})`),
                showBackButton: (show, callback) => console.log(`📱 Back: ${show}`)
            })
        }
    ];
    
    for (const module of moduleMap) {
        try {
            console.log(`🔄 Chargement: ${module.path}`);
            const imported = await import(module.path);
            
            // Gestion adaptative selon le format d'export
            if (imported.default) {
                loadedModules[module.name] = imported.default;
            } else if (imported[module.name]) {
                loadedModules[module.name] = imported[module.name];
            } else if (module.name === 'config' && imported.AppConfig) {
                loadedModules[module.name] = imported.AppConfig.getInstance();
            } else {
                // Prendre le premier export nommé
                const firstExport = Object.values(imported)[0];
                loadedModules[module.name] = firstExport || module.fallback();
            }
            
            console.log(`✅ ${module.name} chargé`);
            
        } catch (error) {
            console.warn(`⚠️ ${module.name} fallback:`, error.message);
            loadedModules[module.name] = module.fallback();
        }
    }
    
    // Mise à jour des références globales
    config = loadedModules.config || config;
}

// ========================================================================
// VARIABLES D'ÉTAT GLOBALES
// ========================================================================

let currentState = 'main_menu';
let selectedEnterprise = null;
let currentAction = null;
let user = config.DEFAULT_USER;

// ========================================================================
// APP CLASSE PRINCIPALE
// ========================================================================

class CRMAppTransition {
    constructor() {
        this.isInitialized = false;
        this.user = user;
        console.log('🚀 CRMAppTransition créé');
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initialisation transition...');
        this.updateLoadingStatus('Chargement des modules...');

        try {
            // 1. Charger les modules de façon adaptative
            await loadModulesAdaptive();
            await this.delay(300);
            
            // 2. Initialiser Telegram
            this.updateLoadingStatus('Configuration Telegram...');
            this.initializeTelegram();
            await this.delay(300);
            
            // 3. Initialiser les services chargés
            this.updateLoadingStatus('Initialisation services...');
            await this.initializeServices();
            await this.delay(300);
            
            // 4. Interface
            this.updateLoadingStatus('Préparation interface...');
            this.showMainMenu();
            await this.delay(300);
            
            // 5. Succès
            this.isInitialized = true;
            this.updateLoadingStatus('Prêt !');
            
            if (window.hideLoadingScreen) {
                window.hideLoadingScreen();
            }
            
            this.showMessage('🚀 CRM Transition initialisé avec succès !');
            
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.handleInitializationError(error);
        }
    }

    initializeTelegram() {
        console.log('📱 Initialisation Telegram');
        
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            try {
                tg.ready();
                tg.expand();
                this.user = tg.initDataUnsafe?.user || user;
                console.log('✅ Telegram utilisateur:', this.user.first_name);
            } catch (error) {
                console.warn('⚠️ Erreur Telegram:', error);
                this.user = user;
            }
        } else {
            console.log('🖥️ Mode standalone');
            this.user = user;
        }

        // Mise à jour UI
        const userNameEl = document.getElementById('userName');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (userNameEl) userNameEl.textContent = this.user.first_name;
        if (userAvatarEl) userAvatarEl.textContent = this.user.first_name.charAt(0).toUpperCase();
    }

    async initializeServices() {
        console.log('🔧 Initialisation services...');
        
        if (loadedModules.apiService?.initialize) {
            await loadedModules.apiService.initialize();
        }
        
        if (loadedModules.telegramService?.initialize) {
            await loadedModules.telegramService.initialize();
        }
        
        if (loadedModules.state?.initialize) {
            loadedModules.state.initialize();
        }
    }

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    showMainMenu() {
        currentState = 'main_menu';
        currentAction = null;
        selectedEnterprise = null;
        
        console.log('🏠 Menu principal');
        
        const content = `
            <div class="main-menu">
                <h1>🏠 Menu Principal</h1>
                <p>CRM Modulaire - Version Transition</p>
                
                <div class="menu-grid">
                    <div class="menu-item" onclick="appTransition.showSearch()">
                        <div class="icon">🔍</div>
                        <div class="title">Recherche</div>
                        <div class="subtitle">Entreprises</div>
                    </div>
                    
                    <div class="menu-item" onclick="appTransition.showAction('qualification')">
                        <div class="icon">💼</div>
                        <div class="title">Qualification</div>
                        <div class="subtitle">Prospects</div>
                    </div>
                    
                    <div class="menu-item" onclick="appTransition.showAction('stats')">
                        <div class="icon">📊</div>
                        <div class="title">Statistiques</div>
                        <div class="subtitle">Renouvellement 2026</div>
                    </div>
                    
                    <div class="menu-item" onclick="appTransition.showAction('nouvelle_entreprise')">
                        <div class="icon">🏢</div>
                        <div class="title">Nouvelle</div>
                        <div class="subtitle">Entreprise</div>
                    </div>
                </div>
                
                <div class="user-info" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>👤 Utilisateur:</strong> ${this.user.first_name}</p>
                    <p><strong>🔧 Mode:</strong> Transition</p>
                    <p><strong>📊 Modules:</strong> ${Object.keys(loadedModules).length} chargés</p>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    showSearch() {
        currentState = 'search';
        console.log('🔍 Recherche');
        
        const content = `
            <div class="search-interface">
                <h2>🔍 Recherche Entreprises</h2>
                
                <div class="search-container">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="Tapez le nom de l'entreprise..."
                           oninput="appTransition.handleSearch()"
                           class="form-control">
                </div>
                
                <div id="searchResults" class="search-results" style="display: none;"></div>
                
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="appTransition.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
        
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.focus();
        }, 100);
    }

    showAction(actionType) {
        currentAction = actionType;
        console.log(`📍 Action: ${actionType}`);
        
        const content = `
            <div class="action-interface">
                <h2>${this.getActionIcon(actionType)} ${this.getActionLabel(actionType)}</h2>
                
                <div class="action-content">
                    ${this.getActionContent(actionType)}
                </div>
                
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="appTransition.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    // ========================================================================
    // RECHERCHE
    // ========================================================================

    async handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            this.displaySearchResults([]);
            return;
        }

        try {
            this.updateStatus('🔍 Recherche en cours...');
            
            const apiService = loadedModules.apiService;
            let response;
            
            if (apiService?.request) {
                response = await apiService.request(config.N8N_WEBHOOKS.RECHERCHE_ENTREPRISE, {
                    operation: 'getMany',
                    search: query,
                    limit: 10
                });
            } else {
                // Fallback direct
                response = await fetch(config.N8N_WEBHOOKS.RECHERCHE_ENTREPRISE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        operation: 'getMany',
                        search: query,
                        limit: 10
                    })
                }).then(r => r.json());
            }

            const enterprises = response?.data || [];
            console.log(`📊 ${enterprises.length} entreprises trouvées`);

            this.displaySearchResults(enterprises);
            this.updateStatus(`${enterprises.length} résultat(s) trouvé(s)`);

        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            this.updateStatus('❌ Erreur de recherche (normal en local - CORS)');
            this.displaySearchResults([]);
        }
    }

    displaySearchResults(results) {
        const resultsDiv = document.getElementById('searchResults');
        if (!resultsDiv) return;

        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="search-result-item">Aucun résultat trouvé</div>';
        } else {
            resultsDiv.innerHTML = results.map((result, index) => `
                <div class="search-result-item" onclick="appTransition.selectEnterprise(${index})">
                    <div class="result-name">${result.nom_entreprise || 'Entreprise'}</div>
                    <div class="result-details">📍 ${result.commune || 'Commune'} • 👤 ${result.interlocuteur || 'Contact'}</div>
                </div>
            `).join('');
            
            window.currentSearchResults = results;
        }

        resultsDiv.style.display = 'block';
    }

    selectEnterprise(index) {
        const enterprise = window.currentSearchResults?.[index];
        if (!enterprise) return;
        
        selectedEnterprise = enterprise;
        console.log('🎯 Entreprise sélectionnée:', enterprise.nom_entreprise);
        this.showMessage(`Entreprise sélectionnée: ${enterprise.nom_entreprise}`);
    }

    // ========================================================================
    // UTILITAIRES
    // ========================================================================

    getActionIcon(actionType) {
        const icons = {
            'qualification': '💼',
            'stats': '📊',
            'nouvelle_entreprise': '🏢',
            'facture': '📄',
            'bon_commande': '📋'
        };
        return icons[actionType] || '⚡';
    }

    getActionLabel(actionType) {
        const labels = {
            'qualification': 'Qualification Prospect',
            'stats': 'Statistiques Renouvellement',
            'nouvelle_entreprise': 'Nouvelle Entreprise',
            'facture': 'Génération Facture',
            'bon_commande': 'Bon de Commande'
        };
        return labels[actionType] || actionType;
    }

    getActionContent(actionType) {
        switch(actionType) {
            case 'stats':
                return `
                    <p>📊 Interface des statistiques de renouvellement 2026.</p>
                    <button class="btn btn-primary" onclick="appTransition.loadStats()">
                        📈 Charger les statistiques
                    </button>
                `;
            case 'qualification':
                return `
                    <p>💼 Interface de qualification des prospects.</p>
                    <p>⚠️ Sélectionnez d'abord une entreprise via la recherche.</p>
                `;
            case 'nouvelle_entreprise':
                return `
                    <p>🏢 Création d'une nouvelle entreprise.</p>
                    <button class="btn btn-primary" onclick="appTransition.showNewEnterpriseForm()">
                        ➕ Créer une entreprise
                    </button>
                `;
            default:
                return `<p>⚡ Fonctionnalité ${actionType} en développement.</p>`;
        }
    }

    async loadStats() {
        try {
            this.updateStatus('📊 Chargement statistiques...');
            
            const apiService = loadedModules.apiService;
            let response;
            
            if (apiService?.request) {
                response = await apiService.request('stats_renouvellement_2026', {});
            } else {
                response = await fetch(config.N8N_WEBHOOKS.GATEWAY_ENTITIES, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'stats_renouvellement_2026',
                        data: {}
                    })
                }).then(r => r.json());
            }
            
            this.showMessage('📊 Statistiques chargées (voir console)');
            console.log('📊 Stats:', response);
            
        } catch (error) {
            console.error('❌ Erreur stats:', error);
            this.showMessage('❌ Erreur stats (normal en local - CORS)');
        }
    }

    showNewEnterpriseForm() {
        const content = `
            <div class="nouvelle-entreprise-form">
                <h3>🏢 Nouvelle Entreprise</h3>
                
                <form onsubmit="appTransition.createEnterprise(event)">
                    <div class="form-group">
                        <label>Nom de l'entreprise *</label>
                        <input type="text" id="nomEntreprise" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Commune</label>
                        <input type="text" id="communeEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label>Contact</label>
                        <input type="text" id="contactEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-buttons">
                        <button type="submit" class="btn btn-primary">✅ Créer</button>
                        <button type="button" class="btn btn-secondary" onclick="appTransition.showAction('nouvelle_entreprise')">← Retour</button>
                    </div>
                </form>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    async createEnterprise(event) {
        event.preventDefault();
        
        const formData = {
            nom_entreprise: document.getElementById('nomEntreprise').value,
            commune: document.getElementById('communeEntreprise').value,
            contact: document.getElementById('contactEntreprise').value
        };
        
        console.log('🏢 Création entreprise:', formData);
        this.showMessage('✅ Entreprise créée (simulation)');
    }

    updateMainContent(htmlContent) {
        const container = document.getElementById('mainContent') || document.getElementById('app');
        if (container) {
            container.innerHTML = htmlContent;
        }
    }

    updateLoadingStatus(message) {
        console.log(`📝 Status: ${message}`);
        const statusEl = document.getElementById('loadingStatus');
        if (statusEl) statusEl.textContent = message;
        
        if (loadedModules.state?.updateData) {
            loadedModules.state.updateData('currentStatus', message);
        }
    }

    updateStatus(message) {
        console.log(`📊 Status: ${message}`);
        const statusElement = document.getElementById('statusText');
        if (statusElement) statusElement.textContent = message;
    }

    showMessage(message) {
        console.log(`📢 Message: ${message}`);
        
        if (window.Telegram?.WebApp?.showAlert) {
            try {
                window.Telegram.WebApp.showAlert(message);
                return;
            } catch (error) {
                console.warn('Telegram alert non supporté');
            }
        }
        
        alert(message);
    }

    handleInitializationError(error) {
        console.error('❌ Erreur critique:', error);
        this.updateLoadingStatus('Erreur: ' + error.message);
        this.showMessage('❌ Erreur: ' + error.message);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================================================
    // DEBUG
    // ========================================================================

    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            currentState: currentState,
            selectedEnterprise: selectedEnterprise,
            user: this.user,
            loadedModules: Object.keys(loadedModules),
            config: config
        };
    }
}

// ========================================================================
// INITIALISATION
// ========================================================================

const appTransition = new CRMAppTransition();

// Exposition globale
window.appTransition = appTransition;
window.showMainMenu = () => appTransition.showMainMenu();
window.showSearch = () => appTransition.showSearch();
window.showAction = (action) => appTransition.showAction(action);

// Variables globales pour compatibilité
window.selectedEnterprise = selectedEnterprise;
window.currentAction = currentAction;

// Démarrage
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM ready - Démarrage transition');
        if (window.updateLoadingStatus) {
            window.updateLoadingStatus('Démarrage transition...');
        }
        appTransition.initialize();
    });
} else {
    console.log('📄 DOM déjà prêt - Démarrage transition immédiat');
    appTransition.initialize();
}

export default appTransition;
console.log('🚀 app-transition.js chargé');