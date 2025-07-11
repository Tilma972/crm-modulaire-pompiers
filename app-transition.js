// app-transition.js - Version corrigée avec gestion CORS robuste

console.log('🚀 Démarrage app-transition.js - Version CORS Fixed');

// ========================================================================
// CONFIGURATION CENTRALISÉE AVEC GESTION CORS
// ========================================================================

const API_CONFIG = {
    BASE_URL: 'https://n8n.dsolution-ia.fr',
    ENDPOINTS: {
        RECHERCHE_ENTREPRISE: '/webhook/recherche_entreprise',
        GATEWAY_ENTITIES: '/webhook/gateway_entities'
    },
    // Configuration fetch avec CORS robuste
    FETCH_OPTIONS: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        },
        mode: 'cors',
        credentials: 'omit'  // Pas de cookies cross-origin
    },
    TIMEOUT: 15000  // 15 secondes timeout
};

// ========================================================================
// FETCH ROBUSTE AVEC GESTION D'ERREURS DÉTAILLÉE
// ========================================================================

async function robustFetch(endpoint, payload) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    console.log(`📤 Requête vers: ${url}`);
    console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
    
    // Créer AbortController pour timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
        // Options fetch complètes
        const fetchOptions = {
            ...API_CONFIG.FETCH_OPTIONS,
            body: JSON.stringify(payload),
            signal: controller.signal
        };
        
        console.log(`🔧 Options fetch:`, fetchOptions);
        
        // Exécution de la requête
        const response = await fetch(url, fetchOptions);
        
        // Nettoyer le timeout
        clearTimeout(timeoutId);
        
        // Logging détaillé de la réponse
        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response ok: ${response.ok}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        // Vérifier le status HTTP
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP Error ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}\nDétails: ${errorText}`);
        }
        
        // Lire le contenu comme text d'abord pour débugger
        const responseText = await response.text();
        console.log(`📡 Response text (premiers 500 chars):`, responseText.substring(0, 500));
        
        // Parser le JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(`✅ JSON parsé avec succès`);
            console.log(`📊 Data structure:`, Object.keys(data || {}));
        } catch (jsonError) {
            console.error(`❌ Erreur parsing JSON:`, jsonError);
            console.error(`❌ Response text complet:`, responseText);
            throw new Error(`Réponse JSON invalide: ${jsonError.message}`);
        }
        
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Gestion détaillée des erreurs
        if (error.name === 'AbortError') {
            console.error(`⏱️ Timeout après ${API_CONFIG.TIMEOUT}ms`);
            throw new Error(`Timeout de la requête (${API_CONFIG.TIMEOUT}ms)`);
        }
        
        if (error.message.includes('CORS')) {
            console.error(`🌐 Erreur CORS détectée:`, error);
            throw new Error(`Erreur CORS: Vérifiez la configuration du serveur N8N`);
        }
        
        if (error.message.includes('Failed to fetch')) {
            console.error(`🔌 Erreur réseau:`, error);
            throw new Error(`Erreur réseau: Impossible de joindre le serveur N8N`);
        }
        
        console.error(`❌ Erreur générique:`, error);
        throw error;
    }
}

// ========================================================================
// FONCTION DE TEST CORS
// ========================================================================

async function testCorsConfiguration() {
    console.log('🧪 Test de configuration CORS...');
    
    try {
        // Test simple avec payload minimal
        const testPayload = {
            operation: 'getMany',
            search: 'test',
            limit: 1
        };
        
        const result = await robustFetch(API_CONFIG.ENDPOINTS.RECHERCHE_ENTREPRISE, testPayload);
        console.log('✅ Test CORS réussi:', result);
        return true;
        
    } catch (error) {
        console.error('❌ Test CORS échoué:', error.message);
        return false;
    }
}

// ========================================================================
// CLASSE CRM APP AVEC CORRECTION CORS
// ========================================================================

class CRMAppTransition {
    constructor() {
        this.isInitialized = false;
        this.user = { first_name: 'Stève', id: 123456789 };
        this.corsTestedOk = false;
        console.log('🚀 CRMAppTransition créé avec gestion CORS');
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initialisation avec test CORS...');
        this.updateLoadingStatus('Test de connexion...');

        try {
            // 1. Test CORS en premier
            this.corsTestedOk = await testCorsConfiguration();
            if (!this.corsTestedOk) {
                throw new Error('Configuration CORS défaillante');
            }
            
            // 2. Continuer l'initialisation normale
            await this.delay(300);
            this.updateLoadingStatus('Configuration Telegram...');
            this.initializeTelegram();
            
            await this.delay(300);
            this.updateLoadingStatus('Préparation interface...');
            this.showMainMenu();
            
            await this.delay(300);
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
                this.user = tg.initDataUnsafe?.user || this.user;
                console.log('✅ Telegram utilisateur:', this.user.first_name);
            } catch (error) {
                console.warn('⚠️ Erreur Telegram:', error);
                this.user = { first_name: 'Stève', id: 123456789 };
            }
        } else {
            console.log('🖥️ Mode standalone');
            this.user = { first_name: 'Stève', id: 123456789 };
        }

        // Mise à jour UI
        const userNameEl = document.getElementById('userName');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (userNameEl) userNameEl.textContent = this.user.first_name;
        if (userAvatarEl) userAvatarEl.textContent = this.user.first_name.charAt(0).toUpperCase();
    }

    // ========================================================================
    // NAVIGATION (IDENTIQUE)
    // ========================================================================

    showMainMenu() {
        console.log('🏠 Menu principal');
        
        const content = `
            <div class="main-menu">
                <h1>🏠 Menu Principal</h1>
                <p>CRM Modulaire - Version CORS Fixed</p>
                
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
                    
                    <div class="menu-item" onclick="appTransition.testCors()">
                        <div class="icon">🧪</div>
                        <div class="title">Test CORS</div>
                        <div class="subtitle">Diagnostic</div>
                    </div>
                </div>
                
                <div class="user-info" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>👤 Utilisateur:</strong> ${this.user.first_name}</p>
                    <p><strong>🔧 Mode:</strong> CORS Fixed</p>
                    <p><strong>🌐 CORS:</strong> ${this.corsTestedOk ? '✅ OK' : '❌ KO'}</p>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    showSearch() {
        console.log('🔍 Recherche');
        
        const content = `
            <div class="search-interface">
                <h2>🔍 Recherche Entreprises - Version CORS Fixed</h2>
                
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
                    <button class="btn btn-info" onclick="appTransition.testCors()">
                        🧪 Test CORS
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

    // ========================================================================
    // RECHERCHE AVEC GESTION CORS ROBUSTE
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
            
            const payload = {
                operation: 'getMany',
                search: query,
                limit: 10
            };
            
            console.log('📤 Recherche avec payload:', payload);
            
            // Utilisation de robustFetch
            const data = await robustFetch(API_CONFIG.ENDPOINTS.RECHERCHE_ENTREPRISE, payload);
            
            // Extraction des données avec logging détaillé
            let enterprises = [];
            console.log('🔍 Structure de data:', Object.keys(data || {}));
            
            if (data) {
                if (data.data && Array.isArray(data.data)) {
                    enterprises = data.data;
                    console.log('✅ Trouvé data.data avec', enterprises.length, 'éléments');
                } else if (data.results && Array.isArray(data.results)) {
                    enterprises = data.results;
                    console.log('✅ Trouvé data.results avec', enterprises.length, 'éléments');
                } else if (Array.isArray(data)) {
                    enterprises = data;
                    console.log('✅ Data est directement un array avec', enterprises.length, 'éléments');
                } else {
                    console.warn('⚠️ Structure de données non reconnue:', data);
                    enterprises = [];
                }
            }
            
            console.log(`📊 ${enterprises.length} entreprises trouvées`);
            
            if (enterprises.length > 0) {
                console.log('📊 Première entreprise:', enterprises[0]);
            }

            this.displaySearchResults(enterprises);
            this.updateStatus(`✅ ${enterprises.length} résultat(s) trouvé(s)`);

        } catch (error) {
            console.error('❌ Erreur complète:', error);
            console.error('❌ Stack trace:', error.stack);
            this.updateStatus('❌ ' + error.message);
            this.displaySearchResults([]);
        }
    }

    // ========================================================================
    // FONCTION DE TEST CORS PUBLIQUE
    // ========================================================================

    async testCors() {
        this.updateStatus('🧪 Test CORS en cours...');
        
        try {
            const success = await testCorsConfiguration();
            
            if (success) {
                this.showMessage('✅ Test CORS réussi ! La configuration est correcte.');
                this.updateStatus('✅ CORS OK');
                this.corsTestedOk = true;
            } else {
                this.showMessage('❌ Test CORS échoué. Vérifiez la configuration N8N.');
                this.updateStatus('❌ CORS KO');
                this.corsTestedOk = false;
            }
            
        } catch (error) {
            console.error('❌ Erreur test CORS:', error);
            this.showMessage('❌ Erreur test CORS: ' + error.message);
            this.updateStatus('❌ CORS Error');
        }
    }

    // ========================================================================
    // FONCTIONS UTILITAIRES (IDENTIQUES À L'ORIGINAL)
    // ========================================================================

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
        
        console.log('🎯 Entreprise sélectionnée:', enterprise.nom_entreprise);
        this.showMessage(`Entreprise sélectionnée: ${enterprise.nom_entreprise}`);
    }

    showAction(actionType) {
        console.log(`📍 Action: ${actionType}`);
        const content = `<div class="action-content"><h2>⚡ ${actionType}</h2><p>Fonctionnalité en développement.</p></div>`;
        this.updateMainContent(content);
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

    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            corsTestedOk: this.corsTestedOk,
            user: this.user,
            apiConfig: API_CONFIG
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

// Démarrage
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM ready - Démarrage transition CORS Fixed');
        if (window.updateLoadingStatus) {
            window.updateLoadingStatus('Démarrage transition...');
        }
        appTransition.initialize();
    });
} else {
    console.log('📄 DOM déjà prêt - Démarrage transition CORS Fixed immédiat');
    appTransition.initialize();
}

export default appTransition;
console.log('🚀 app-transition.js CORS Fixed chargé');