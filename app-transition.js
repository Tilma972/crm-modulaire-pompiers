// app-transition.js - Version SANS test CORS initial pour débloquer l'app

console.log('🚀 Démarrage app-transition.js - Version Bypass CORS');

// ========================================================================
// CONFIGURATION API (identique)
// ========================================================================

const API_CONFIG = {
    BASE_URL: 'https://n8n.dsolution-ia.fr',
    ENDPOINTS: {
        RECHERCHE_ENTREPRISE: '/webhook/recherche_entreprise',
        GATEWAY_ENTITIES: '/webhook/gateway_entities'
    },
    FETCH_OPTIONS: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
    },
    TIMEOUT: 15000
};

// ========================================================================
// FETCH ROBUSTE (identique mais exposé globalement)
// ========================================================================

window.robustFetch = async function robustFetch(endpoint, payload) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    console.log(`📤 Requête vers: ${url}`);
    console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
        const fetchOptions = {
            ...API_CONFIG.FETCH_OPTIONS,
            body: JSON.stringify(payload),
            signal: controller.signal
        };
        
        console.log(`🔧 Options fetch:`, fetchOptions);
        
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response ok: ${response.ok}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP Error ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log(`📡 Response text (premiers 200 chars):`, responseText.substring(0, 200));
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(`✅ JSON parsé avec succès`);
        } catch (jsonError) {
            console.error(`❌ Erreur parsing JSON:`, jsonError);
            throw new Error(`Réponse JSON invalide: ${jsonError.message}`);
        }
        
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error(`Timeout après ${API_CONFIG.TIMEOUT}ms`);
        }
        
        if (error.message.includes('CORS')) {
            throw new Error(`Erreur CORS: ${error.message}`);
        }
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error(`Erreur réseau: ${error.message}`);
        }
        
        throw error;
    }
}

// ========================================================================
// CLASSE CRM APP - SANS TEST CORS INITIAL
// ========================================================================

class CRMAppTransition {
    constructor() {
        this.isInitialized = false;
        this.user = { first_name: 'Stève', id: 123456789 };
        console.log('🚀 CRMAppTransition créé - Mode Bypass CORS');
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initialisation SANS test CORS...');
        
        try {
            // ✅ SUPPRIMÉ : Test CORS initial
            // ✅ DIRECTEMENT : Initialisation normale
            
            this.updateLoadingStatus('Configuration Telegram...');
            this.initializeTelegram();
            await this.delay(300);
            
            this.updateLoadingStatus('Préparation interface...');
            this.showMainMenu();
            await this.delay(300);
            
            this.isInitialized = true;
            this.updateLoadingStatus('Prêt !');
            
            // ✅ DÉMASQUER L'APP
            if (window.hideLoadingScreen) {
                window.hideLoadingScreen();
            }
            
            this.showMessage('🚀 CRM initialisé avec succès !');
            console.log('✅ Initialisation terminée avec succès');
            
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
    // NAVIGATION
    // ========================================================================

    showMainMenu() {
        console.log('🏠 Menu principal');
        
        const content = `
            <div class="main-menu">
                <h1>🏠 Menu Principal</h1>
                <p>CRM Modulaire - Version Bypass CORS</p>
                
                <div class="menu-grid">
                    <div class="menu-item" onclick="appTransition.showSearch()">
                        <div class="icon">🔍</div>
                        <div class="title">Recherche</div>
                        <div class="subtitle">Entreprises</div>
                    </div>
                    
                    <div class="menu-item" onclick="appTransition.testCorsManual()">
                        <div class="icon">🧪</div>
                        <div class="title">Test CORS</div>
                        <div class="subtitle">Diagnostic</div>
                    </div>
                    
                    <div class="menu-item" onclick="appTransition.showAction('stats')">
                        <div class="icon">📊</div>
                        <div class="title">Statistiques</div>
                        <div class="subtitle">Renouvellement 2026</div>
                    </div>
                    
                    <div class="menu-item" onclick="appTransition.showAction('qualification')">
                        <div class="icon">💼</div>
                        <div class="title">Qualification</div>
                        <div class="subtitle">Prospects</div>
                    </div>
                </div>
                
                <div class="user-info" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>👤 Utilisateur:</strong> ${this.user.first_name}</p>
                    <p><strong>🔧 Mode:</strong> Bypass CORS</p>
                    <p><strong>🌐 Status:</strong> ✅ App démarrée</p>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    showSearch() {
        console.log('🔍 Interface de recherche');
        
        const content = `
            <div class="search-interface">
                <h2>🔍 Recherche Entreprises</h2>
                
                <div class="search-container">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="Tapez le nom de l'entreprise..."
                           oninput="appTransition.handleSearch()"
                           style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 8px; font-size: 16px;">
                </div>
                
                <div id="searchResults" class="search-results" style="margin-top: 20px;"></div>
                
                <div class="form-buttons" style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="appTransition.showMainMenu()" style="padding: 10px 20px; margin: 5px;">
                        ← Retour au menu
                    </button>
                    <button class="btn btn-info" onclick="appTransition.testCorsManual()" style="padding: 10px 20px; margin: 5px;">
                        🧪 Test CORS
                    </button>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
        
        // Focus sur l'input
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                console.log('✅ Focus sur searchInput');
            } else {
                console.error('❌ searchInput non trouvé après création');
            }
        }, 100);
    }

    // ========================================================================
    // RECHERCHE AVEC DEBUG
    // ========================================================================

    async handleSearch() {
        console.log("🚀 handleSearch() APPELÉE !");
        
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) {
            console.error("❌ searchInput pas trouvé !");
            return;
        }

        const query = searchInput.value.trim();
        console.log("🔍 Query:", query);
        
        if (query.length < 2) {
            console.log("⚠️ Query trop courte");
            this.displaySearchResults([]);
            return;
        }

        try {
            console.log("📤 AVANT robustFetch");
            this.updateStatus('🔍 Recherche en cours...');
            
            const payload = {
                operation: 'getMany',
                search: query,
                limit: 10
            };
            
            console.log('📤 Payload:', payload);
            console.log("🔥 APPEL robustFetch MAINTENANT");
            
            const data = await window.robustFetch(API_CONFIG.ENDPOINTS.RECHERCHE_ENTREPRISE, payload);
            console.log("✅ robustFetch TERMINÉ", data);
            
            // Extraction des données
            let enterprises = [];
            if (data && data.data && Array.isArray(data.data)) {
                enterprises = data.data;
            } else if (data && Array.isArray(data)) {
                enterprises = data;
            }
            
            console.log(`📊 ${enterprises.length} entreprises trouvées`);
            this.displaySearchResults(enterprises);
            this.updateStatus(`✅ ${enterprises.length} résultat(s) trouvé(s)`);

        } catch (error) {
            console.error('❌ Erreur handleSearch:', error);
            this.updateStatus('❌ ' + error.message);
            this.displaySearchResults([]);
        }
    }

    // ========================================================================
    // TEST CORS MANUEL
    // ========================================================================

    async testCorsManual() {
        console.log('🧪 Test CORS manuel...');
        this.updateStatus('🧪 Test CORS en cours...');
        
        try {
            const testPayload = {
                operation: 'getMany',
                search: 'test',
                limit: 1
            };
            
            const result = await window.robustFetch(API_CONFIG.ENDPOINTS.RECHERCHE_ENTREPRISE, testPayload);
            console.log('✅ Test CORS réussi:', result);
            this.showMessage('✅ Test CORS réussi ! N8N fonctionne.');
            this.updateStatus('✅ CORS OK');
            
        } catch (error) {
            console.error('❌ Test CORS échoué:', error);
            this.showMessage('❌ Test CORS échoué: ' + error.message);
            this.updateStatus('❌ CORS KO');
        }
    }

    // ========================================================================
    // UTILITAIRES (identiques)
    // ========================================================================

    displaySearchResults(results) {
        const resultsDiv = document.getElementById('searchResults');
        if (!resultsDiv) {
            console.error('❌ searchResults div non trouvé');
            return;
        }

        if (results.length === 0) {
            resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Aucun résultat trouvé</div>';
        } else {
            resultsDiv.innerHTML = results.map((result, index) => `
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; cursor: pointer;" onclick="appTransition.selectEnterprise(${index})">
                    <div style="font-weight: bold; color: #0088cc; margin-bottom: 5px;">${result.nom_entreprise || 'Entreprise'}</div>
                    <div style="color: #666; font-size: 14px;">📍 ${result.commune || 'Commune'} • 👤 ${result.interlocuteur || 'Contact'}</div>
                    <div style="color: #666; font-size: 12px;">📞 ${result.telephone || 'Tel'} • 📧 ${result.email || 'Email'}</div>
                </div>
            `).join('');
            
            window.currentSearchResults = results;
        }
    }

    selectEnterprise(index) {
        const enterprise = window.currentSearchResults?.[index];
        if (!enterprise) return;
        
        console.log('🎯 Entreprise sélectionnée:', enterprise.nom_entreprise);
        this.showMessage(`Entreprise sélectionnée: ${enterprise.nom_entreprise}`);
    }

    showAction(actionType) {
        console.log(`📍 Action: ${actionType}`);
        const content = `
            <div class="action-content" style="padding: 20px; text-align: center;">
                <h2>⚡ ${actionType}</h2>
                <p>Fonctionnalité en développement.</p>
                <button onclick="appTransition.showMainMenu()" style="padding: 10px 20px; margin: 20px;">🏠 Retour au menu</button>
            </div>
        `;
        this.updateMainContent(content);
    }

    updateMainContent(htmlContent) {
        const container = document.getElementById('mainContent') || document.getElementById('app');
        if (container) {
            container.innerHTML = htmlContent;
            console.log('✅ Contenu mis à jour');
        } else {
            console.error('❌ Container principal non trouvé');
        }
    }

    updateLoadingStatus(message) {
        console.log(`📝 Loading: ${message}`);
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
        
        // ✅ DÉMASQUER L'APP MÊME EN CAS D'ERREUR
        if (window.hideLoadingScreen) {
            window.hideLoadingScreen();
        }
        
        // Afficher une interface d'erreur
        const errorContent = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #dc3545;">❌ Erreur d'initialisation</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin: 20px;">🔄 Recharger</button>
            </div>
        `;
        this.updateMainContent(errorContent);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

// Démarrage
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM ready - Démarrage bypass CORS');
        appTransition.initialize();
    });
} else {
    console.log('📄 DOM déjà prêt - Démarrage bypass CORS immédiat');
    appTransition.initialize();
}

export default appTransition;
console.log('🚀 app-transition.js Bypass CORS chargé');