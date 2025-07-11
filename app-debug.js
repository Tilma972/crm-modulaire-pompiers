// app-debug.js - Version debug standalone SANS modules
// Pour identifier où ça bloque

console.log('🔍 DEBUG - Démarrage app-debug.js');

// ========================================================================
// FONCTIONS DE DEBUG
// ========================================================================

function updateLoadingStatus(message) {
    console.log('📝 Status:', message);
    const statusEl = document.getElementById('loadingStatus');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

function hideLoadingScreen() {
    console.log('🎯 Masquage écran de chargement');
    const loadingScreen = document.getElementById('loadingScreen');
    const app = document.getElementById('app');
    
    if (loadingScreen && app) {
        loadingScreen.style.display = 'none';
        app.classList.remove('app-hidden');
        console.log('✅ Écran de chargement masqué');
    } else {
        console.error('❌ Éléments non trouvés:', { loadingScreen: !!loadingScreen, app: !!app });
    }
}

function showMessage(message) {
    console.log('📢 Message:', message);
    alert(message);
}

// ========================================================================
// CONFIGURATION BASIQUE
// ========================================================================

const config = {
    N8N_WEBHOOKS: {
        RECHERCHE_ENTREPRISE: 'https://n8n.dsolution-ia.fr/webhook/recherche_entreprise',
        GATEWAY_ENTITIES: 'https://n8n.dsolution-ia.fr/webhook/gateway_entities'
    }
};

// ========================================================================
// VARIABLES D'ÉTAT
// ========================================================================

let currentState = 'main_menu';
let selectedEnterprise = null;
let currentAction = null;
let user = { first_name: 'Stève', id: 123456789 };

// ========================================================================
// APP CLASSE SIMPLIFIÉE
// ========================================================================

class CRMAppDebug {
    constructor() {
        this.isInitialized = false;
        console.log('🚀 CRMAppDebug créé');
    }

    async initialize() {
        console.log('🔧 Début initialisation...');
        updateLoadingStatus('Démarrage initialisation...');

        try {
            // Étape 1
            console.log('📝 Étape 1: Configuration...');
            updateLoadingStatus('Configuration...');
            await this.delay(500);

            // Étape 2  
            console.log('📝 Étape 2: Utilisateur...');
            updateLoadingStatus('Configuration utilisateur...');
            this.initializeUser();
            await this.delay(500);

            // Étape 3
            console.log('📝 Étape 3: Interface...');
            updateLoadingStatus('Préparation interface...');
            this.showMainMenu();
            await this.delay(500);

            // Étape 4
            console.log('📝 Étape 4: Finalisation...');
            updateLoadingStatus('Finalisation...');
            this.isInitialized = true;
            await this.delay(500);

            // Succès !
            console.log('✅ Initialisation terminée');
            updateLoadingStatus('Prêt !');
            hideLoadingScreen();
            showMessage('🚀 Debug: CRM initialisé avec succès !');

        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            updateLoadingStatus('Erreur: ' + error.message);
            showMessage('❌ Erreur: ' + error.message);
        }
    }

    initializeUser() {
        console.log('👤 Initialisation utilisateur');
        
        // Essayer Telegram
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            console.log('📱 Telegram WebApp détecté');
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
        
        if (userNameEl) {
            userNameEl.textContent = this.user.first_name;
            console.log('✅ Nom utilisateur mis à jour');
        } else {
            console.warn('⚠️ userName element non trouvé');
        }
        
        if (userAvatarEl) {
            userAvatarEl.textContent = this.user.first_name.charAt(0).toUpperCase();
            console.log('✅ Avatar utilisateur mis à jour');
        } else {
            console.warn('⚠️ userAvatar element non trouvé');
        }
    }

    showMainMenu() {
        console.log('🏠 Affichage menu principal');
        
        const content = `
            <div class="main-menu">
                <h1>🏠 Menu Principal DEBUG</h1>
                <p>CRM Modulaire - Version Debug</p>
                
                <div class="menu-grid">
                    <div class="menu-item" onclick="debugApp.testFunction('search')">
                        <div class="icon">🔍</div>
                        <div class="title">Test Recherche</div>
                        <div class="subtitle">Debug</div>
                    </div>
                    
                    <div class="menu-item" onclick="debugApp.testFunction('api')">
                        <div class="icon">🌐</div>
                        <div class="title">Test API</div>
                        <div class="subtitle">Debug</div>
                    </div>
                    
                    <div class="menu-item" onclick="debugApp.testFunction('form')">
                        <div class="icon">📝</div>
                        <div class="title">Test Formulaire</div>
                        <div class="subtitle">Debug</div>
                    </div>
                    
                    <div class="menu-item" onclick="debugApp.showDebugInfo()">
                        <div class="icon">🔧</div>
                        <div class="title">Debug Info</div>
                        <div class="subtitle">État</div>
                    </div>
                </div>
                
                <div class="debug-info">
                    <h3>📊 État Debug</h3>
                    <p><strong>Initialisé:</strong> ${this.isInitialized ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Utilisateur:</strong> ${this.user.first_name}</p>
                    <p><strong>État:</strong> ${currentState}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    testFunction(type) {
        console.log('🧪 Test fonction:', type);
        showMessage(`🧪 Test ${type} exécuté avec succès !`);
        
        if (type === 'api') {
            this.testAPI();
        } else if (type === 'form') {
            this.showTestForm();
        } else {
            console.log('✅ Test basique OK');
        }
    }

    async testAPI() {
        console.log('🌐 Test API...');
        updateLoadingStatus('Test API en cours...');
        
        try {
            const payload = {
                operation: 'getMany',
                search: 'test',
                limit: 3
            };

            console.log('📤 Payload test:', payload);
            
            const response = await fetch(config.N8N_WEBHOOKS.RECHERCHE_ENTREPRISE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Success:', data);
                showMessage('✅ API fonctionne ! Données reçues.');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Erreur API:', error);
            showMessage('❌ Erreur API: ' + error.message);
        }
        
        updateLoadingStatus('Test API terminé');
    }

    showTestForm() {
        console.log('📝 Affichage formulaire test');
        
        const content = `
            <div class="test-form">
                <h2>📝 Formulaire Test</h2>
                
                <form onsubmit="debugApp.submitTestForm(event)">
                    <div class="form-group">
                        <label for="testInput">Test Input:</label>
                        <input type="text" id="testInput" class="form-control" value="Test value">
                    </div>
                    
                    <div class="form-buttons">
                        <button type="submit" class="btn btn-primary">✅ Tester</button>
                        <button type="button" class="btn btn-secondary" onclick="debugApp.showMainMenu()">← Retour</button>
                    </div>
                </form>
                
                <div class="debug-output">
                    <h3>📊 Debug Output</h3>
                    <pre id="debugOutput">Aucun test exécuté</pre>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    submitTestForm(event) {
        event.preventDefault();
        console.log('📝 Soumission formulaire test');
        
        const testInput = document.getElementById('testInput').value;
        const output = {
            timestamp: new Date().toISOString(),
            input: testInput,
            user: this.user,
            state: currentState
        };
        
        const outputEl = document.getElementById('debugOutput');
        if (outputEl) {
            outputEl.textContent = JSON.stringify(output, null, 2);
        }
        
        showMessage('✅ Formulaire test soumis !');
    }

    showDebugInfo() {
        console.log('🔧 Affichage debug info');
        
        const debugInfo = {
            app: {
                initialized: this.isInitialized,
                currentState: currentState,
                selectedEnterprise: selectedEnterprise,
                currentAction: currentAction
            },
            user: this.user,
            config: config,
            dom: {
                app: !!document.getElementById('app'),
                mainContent: !!document.getElementById('mainContent'),
                loadingScreen: !!document.getElementById('loadingScreen'),
                userName: !!document.getElementById('userName')
            },
            browser: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        };
        
        console.log('📊 Debug Info:', debugInfo);
        
        const content = `
            <div class="debug-info-page">
                <h2>🔧 Informations Debug</h2>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto; font-size: 12px;">${JSON.stringify(debugInfo, null, 2)}</pre>
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="debugApp.showMainMenu()">← Retour menu</button>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    updateMainContent(htmlContent) {
        console.log('🔄 Mise à jour contenu');
        const container = document.getElementById('mainContent') || document.getElementById('app');
        
        if (container) {
            container.innerHTML = htmlContent;
            console.log('✅ Contenu mis à jour');
        } else {
            console.error('❌ Container non trouvé');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ========================================================================
// INITIALISATION
// ========================================================================

console.log('🎯 Création instance debug app');
const debugApp = new CRMAppDebug();

// Exposition globale
window.debugApp = debugApp;

// Démarrage
console.log('🚀 Démarrage debug app');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM ready - Démarrage debug');
        debugApp.initialize();
    });
} else {
    console.log('📄 DOM déjà prêt - Démarrage immédiat debug');
    debugApp.initialize();
}

console.log('🔍 app-debug.js chargé complètement');