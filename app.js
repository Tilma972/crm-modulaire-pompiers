// app.js - Version finale complète
// Restauration COMPLÈTE de toutes les fonctionnalités du backup

// ========================================================================
// IMPORTS DES MODULES
// ========================================================================

// Core modules
import { config } from './src/core/config.js';
import { state } from './src/core/state.js';

// Services
import { apiService } from './src/services/api.js';
import { telegramService } from './src/services/telegram.js';

// Components
import { navigationManager } from './src/components/navigation.js';
import { searchManager } from './src/components/search.js';

// Features
import { qualificationManager } from './src/features/qualification.js';
import { statsManager } from './src/features/stats.js';

// ========================================================================
// VARIABLES D'ÉTAT GLOBALES (comme dans le backup)
// ========================================================================

let currentState = 'main_menu';
let selectedEnterprise = null;
let currentAction = null;
let searchTimeout = null;

// Cache de recherche et optimisation
const searchCache = {};
let lastSearchQuery = null;

// Variables pour système d'offres (restaurées du backup)
window.selectedOffer = null;
window.qualificationData = null;

// Publications multiples
let publicationCounter = 0;
let publicationsData = [];

// ========================================================================
// CLASSE PRINCIPALE APPLICATION
// ========================================================================

class CRMApp {
    constructor() {
        this.isInitialized = false;
        this.user = null;
        
        console.log('🚀 CRMApp initialisé');
    }

    // Initialisation complète de l'application
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ App déjà initialisée');
            return;
        }

        try {
            console.log('🔧 Initialisation CRM modulaire...');
            
            // 1. Initialisation Telegram
            this.initializeTelegram();
            
            // 2. Configuration et état global
            await this.initializeCore();
            
            // 3. Services essentiels
            await this.initializeServices();
            
            // 4. Composants UI
            await this.initializeComponents();
            
            // 5. Features métier
            await this.initializeFeatures();
            
            // 6. Navigation initiale
            await this.setupInitialView();
            
            // 7. Événements et listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ CRM modulaire initialisé avec succès');
            
            // Masquer l'écran de chargement
            if (window.hideLoadingScreen) {
                window.hideLoadingScreen();
            }
            
            // Notification de succès
            telegramService.showHapticFeedback('success');
            this.showMessage('🚀 CRM chargé avec succès!', 'success');
            
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.handleInitializationError(error);
        }
    }

    // ========================================================================
    // INITIALISATION TELEGRAM (comme dans le backup)
    // ========================================================================

    initializeTelegram() {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Données utilisateur depuis Telegram
            this.user = tg.initDataUnsafe?.user || {
                first_name: 'Stève',
                id: 123456789
            };
            
            // Initialisation UI utilisateur
            const userNameEl = document.getElementById('userName');
            const userAvatarEl = document.getElementById('userAvatar');
            
            if (userNameEl) userNameEl.textContent = this.user.first_name;
            if (userAvatarEl) userAvatarEl.textContent = this.user.first_name.charAt(0).toUpperCase();
            
            console.log('📱 Telegram WebApp initialisé pour:', this.user.first_name);
        } else {
            console.log('⚠️ Telegram WebApp non disponible, mode standalone');
            this.user = { first_name: 'Stève', id: 123456789 };
        }
    }

    // ========================================================================
    // INITIALISATION PAR MODULES
    // ========================================================================

    async initializeCore() {
        console.log('🔧 Initialisation core modules...');
        
        config.initialize();
        state.initialize();
        
        state.subscribe('currentView', (newView) => {
            currentState = newView;
            console.log(`📍 Vue changée: ${newView}`);
        });
        
        console.log('✅ Core modules initialisés');
    }

    async initializeServices() {
        console.log('🔧 Initialisation services...');
        
        await apiService.initialize();
        await telegramService.initialize();
        
        console.log('✅ Services initialisés');
    }

    async initializeComponents() {
        console.log('🔧 Initialisation composants...');
        
        navigationManager.initialize();
        searchManager.initialize();
        
        console.log('✅ Composants initialisés');
    }

    async initializeFeatures() {
        console.log('🔧 Initialisation features...');
        
        qualificationManager.initialize();
        statsManager.initialize();
        
        console.log('✅ Features initialisées');
    }

    async setupInitialView() {
        console.log('🔧 Configuration vue initiale...');
        this.showMainMenu();
        state.updateData('currentView', 'menu');
        state.updateData('appReady', true);
    }

    setupEventListeners() {
        console.log('🔧 Configuration listeners...');
        
        window.addEventListener('error', (event) => {
            console.error('❌ Erreur globale:', event.error);
            this.handleGlobalError(event.error);
        });
        
        window.addEventListener('online', () => {
            console.log('🌐 Connexion rétablie');
            this.showMessage('🌐 Connexion rétablie', 'success');
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Connexion perdue');
            this.showMessage('📴 Mode hors ligne', 'warning');
        });
        
        console.log('✅ Listeners configurés');
    }

    // ========================================================================
    // NAVIGATION PRINCIPALE (restaurée du backup)
    // ========================================================================

    showMainMenu() {
        currentState = 'main_menu';
        currentAction = null;
        selectedEnterprise = null;
        window.selectedOffer = null;
        window.qualificationData = null;
        
        console.log('📍 Affichage menu principal');
        
        try {
            const content = this.getMainMenuContent();
            this.updateMainContent(content);
            
            state.updateData('currentView', 'menu');
            telegramService.updateMainButton('🏠 Menu Principal', false);
            telegramService.showBackButton(false);
            
        } catch (error) {
            console.error('❌ Erreur affichage menu:', error);
            this.showErrorContent('Erreur chargement menu principal');
        }
    }

    getMainMenuContent() {
        return `
            <div class="main-menu">
                <h1>🏠 Menu Principal</h1>
                <p>CRM Modulaire - Calendrier 2026</p>
                
                <div class="menu-grid">
                    <div class="menu-item" onclick="app.showSearch()">
                        <div class="icon">🔍</div>
                        <div class="title">Recherche</div>
                        <div class="subtitle">Entreprises</div>
                    </div>
                    
                    <div class="menu-item" onclick="app.showAction('qualification')">
                        <div class="icon">💼</div>
                        <div class="title">Qualification</div>
                        <div class="subtitle">Prospects</div>
                    </div>
                    
                    <div class="menu-item" onclick="app.showAction('stats')">
                        <div class="icon">📊</div>
                        <div class="title">Statistiques</div>
                        <div class="subtitle">Renouvellement 2026</div>
                    </div>
                    
                    <div class="menu-item" onclick="app.showAction('nouvelle_entreprise')">
                        <div class="icon">🏢</div>
                        <div class="title">Nouvelle</div>
                        <div class="subtitle">Entreprise</div>
                    </div>
                </div>
                
                <div class="user-info">
                    <p>👤 Connecté en tant que: <strong>${this.user?.first_name || 'Utilisateur'}</strong></p>
                </div>
            </div>
        `;
    }

    showSearch() {
        currentState = 'search';
        console.log('📍 Affichage recherche');
        
        try {
            const content = searchManager.getSearchContent();
            this.updateMainContent(content);
            
            state.updateData('currentView', 'search');
            telegramService.updateMainButton('🔍 Rechercher', false);
            telegramService.showBackButton(true, () => this.showMainMenu());
            
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }, 100);
            
        } catch (error) {
            console.error('❌ Erreur affichage recherche:', error);
            this.showErrorContent('Erreur chargement recherche');
        }
    }

    // ========================================================================
    // GESTION DES ACTIONS (logique complète du backup)
    // ========================================================================

    showAction(actionType) {
        currentAction = actionType;
        console.log(`📍 Action: ${actionType}`);
        
        // Actions spéciales sans sélection d'entreprise
        if (actionType === 'stats') {
            this.showStats();
            return;
        }
        
        if (actionType === 'nouvelle_entreprise') {
            this.showNouvelleEntreprise();
            return;
        }
        
        // Actions nécessitant une recherche d'entreprise
        if (actionType === 'qualification' || actionType === 'facture' || actionType === 'bon_commande') {
            this.showSearchForAction(actionType);
            return;
        }
        
        console.warn(`⚠️ Action inconnue: ${actionType}`);
        this.showMainMenu();
    }

    showSearchForAction(actionType) {
        currentAction = actionType;
        currentState = 'search_for_action';
        
        console.log(`🔍 Recherche pour action: ${actionType}`);
        
        const content = `
            <div class="search-for-action">
                <h2>🔍 ${this.getActionLabel(actionType)}</h2>
                <p>Recherchez et sélectionnez une entreprise :</p>
                
                <div class="search-container">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="Tapez le nom de l'entreprise..."
                           oninput="app.handleSearch()"
                           class="form-control">
                </div>
                
                <div id="enterpriseResults" class="search-results" style="display: none;"></div>
                
                <div class="action-buttons">
                    <button id="executeBtn" 
                            class="btn btn-primary" 
                            onclick="app.executeSelectedAction()" 
                            disabled>
                        ⚡ ${this.getActionLabel(actionType)}
                    </button>
                </div>
                
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="app.showMainMenu()">
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

    showStats() {
        console.log('📍 Affichage statistiques');
        
        try {
            const content = statsManager.getStatsContent();
            this.updateMainContent(content);
            
            state.updateData('currentView', 'stats');
            telegramService.updateMainButton('📊 Statistiques', false);
            telegramService.showBackButton(true, () => this.showMainMenu());
            
            setTimeout(() => {
                statsManager.chargerStatsRenouvellement();
            }, 100);
            
        } catch (error) {
            console.error('❌ Erreur affichage stats:', error);
            this.showErrorContent('Erreur chargement statistiques');
        }
    }

    showNouvelleEntreprise() {
        console.log('📍 Nouvelle entreprise');
        
        const content = `
            <div class="nouvelle-entreprise">
                <h2>🏢 Nouvelle Entreprise</h2>
                <p>Création d'une nouvelle entreprise avec validation automatique.</p>
                
                <form id="nouvelleEntrepriseForm" onsubmit="app.createNewEnterprise(event)">
                    <div class="form-group">
                        <label for="nomEntreprise">Nom de l'entreprise *</label>
                        <input type="text" id="nomEntreprise" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="adresseEntreprise">Adresse</label>
                        <input type="text" id="adresseEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="communeEntreprise">Commune</label>
                        <input type="text" id="communeEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="telephoneEntreprise">Téléphone</label>
                        <input type="tel" id="telephoneEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="emailEntreprise">Email</label>
                        <input type="email" id="emailEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="interlocuteurEntreprise">Interlocuteur</label>
                        <input type="text" id="interlocuteurEntreprise" class="form-control">
                    </div>
                    
                    <div class="form-buttons">
                        <button type="submit" class="btn btn-primary">
                            ✅ Créer l'entreprise
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="app.showMainMenu()">
                            ← Retour au menu
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.updateMainContent(content);
        state.updateData('currentView', 'nouvelle_entreprise');
    }

    // ========================================================================
    // RECHERCHE ET SÉLECTION (logique complète du backup)
    // ========================================================================

    async handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.trim();
        
        // Annuler la recherche précédente
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (query.length < 2) {
            this.displayEnterpriseResults([]);
            return;
        }

        // Délai pour éviter trop de requêtes
        searchTimeout = setTimeout(async () => {
            await this.searchEnterprisesForAction(query);
        }, 300);
    }

    async searchEnterprisesForAction(query) {
        try {
            this.updateStatus('🔍 Recherche en cours...');
            
            // ✅ PAYLOAD STRINGIFIÉ comme demandé
            const payload = {
                operation: 'getMany',
                search: query,
                limit: 10
            };

            console.log('📤 Payload recherche (avant stringify):', payload);
            
            const response = await fetch(config.N8N_WEBHOOKS.RECHERCHE_ENTREPRISE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // ✅ STRINGIFIÉ
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const enterprises = data.data || [];

            console.log(`📊 ${enterprises.length} entreprises trouvées`);

            // Mise en cache
            searchCache[query] = enterprises;
            
            // Affichage des résultats
            this.displayEnterpriseResults(enterprises);
            this.updateStatus(`${enterprises.length} résultat(s) trouvé(s)`);

        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            this.updateStatus('❌ Erreur de recherche');
            this.displayEnterpriseResults([]);
        }
    }

    displayEnterpriseResults(results) {
        const resultsDiv = document.getElementById('enterpriseResults');
        if (!resultsDiv) return;

        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="search-result-item">Aucun résultat trouvé</div>';
            const executeBtn = document.getElementById('executeBtn');
            if (executeBtn) executeBtn.disabled = true;
        } else {
            resultsDiv.innerHTML = results.map((result, index) => `
                <div class="search-result-item" onclick="app.selectEnterpriseForAction(${index})">
                    <div class="result-name">${result.nom_entreprise}</div>
                    <div class="result-details">📍 ${result.commune} • 👤 ${result.interlocuteur || 'Pas de contact'}</div>
                    <div class="result-extra">📧 ${result.email || 'Pas d\'email'} • 📞 ${result.telephone || 'Pas de téléphone'}</div>
                </div>
            `).join('');
            
            // Stocker les résultats pour récupération complète
            window.currentSearchResults = results;
            const executeBtn = document.getElementById('executeBtn');
            if (executeBtn) executeBtn.disabled = false;
        }

        resultsDiv.style.display = 'block';
    }

    selectEnterpriseForAction(resultIndex) {
        console.log('🎯 Sélection entreprise index:', resultIndex);
        
        const fullEnterprise = window.currentSearchResults[resultIndex];
        
        if (!fullEnterprise) {
            console.error('❌ Impossible de récupérer les données complètes de l\'entreprise');
            return;
        }
        
        console.log('📊 Données complètes entreprise:', fullEnterprise);
        
        // Stockage complet avec tous les champs (comme dans le backup)
        selectedEnterprise = {
            // ID et nom (obligatoires)
            id: fullEnterprise.id,
            name: fullEnterprise.nom_entreprise,
            nom_entreprise: fullEnterprise.nom_entreprise,
            
            // Données adresse complètes
            adresse: fullEnterprise.adresse || fullEnterprise.adresse_complete || '',
            commune: fullEnterprise.commune || fullEnterprise.ville || '',
            code_postal: fullEnterprise.code_postal || '',
            
            // Données contact
            telephone: fullEnterprise.telephone || fullEnterprise.Telephone || '',
            portable: fullEnterprise.portable || '',
            email: fullEnterprise.email || '',
            email_contact: fullEnterprise.email_contact || fullEnterprise.email || '',
            interlocuteur: fullEnterprise.interlocuteur || '',
            
            // Données commerciales
            activite: fullEnterprise.activite || fullEntreprise.Activitée || '',
            statut: fullEntreprise.statut || fullEnterprise.Statut_Prospection?.value || 'Disponible',
            
            // Données historiques 2025
            format_encart_2025: fullEntreprise.format_encart_2025?.value || fullEntreprise.format_encart_2025 || '',
            mois_parution_2025: fullEnterprise.mois_parution_2025 || '',
            client_2025: fullEntreprise.Client_2025 || fullEntreprise.client_2025 || '',
            montant_payé_2024: fullEntreprise.montant_payé_2024 || '',
            mode_paiement_2024: fullEntreprise.mode_paiement_2024?.value || fullEntreprise.mode_paiement_2024 || '',
            prospecteur_2024: fullEntreprise.prospecteur_2024?.value || fullEntreprise.prospecteur_2024 || '',
            
            // Métadonnées
            commentaires: fullEntreprise.commentaires || ''
        };
        
        this.updateStatus(`Entreprise sélectionnée: ${selectedEnterprise.name}`);
        this.showMessage(`Entreprise sélectionnée: ${selectedEnterprise.name}`);
        
        // Mettre en évidence la sélection
        document.querySelectorAll('.search-result-item').forEach((item, idx) => {
            if (idx === resultIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // ========================================================================
    // EXÉCUTION DES ACTIONS (logique centrale du backup)
    // ========================================================================

    async executeSelectedAction() {
        console.log('⚡ Exécution action:', currentAction);
        console.log('1. selectedEnterprise:', selectedEnterprise);
        console.log('2. currentAction:', currentAction);

        if (!selectedEnterprise || !currentAction) {
            console.error('🚨 VALIDATION ÉCHEC');
            
            if (!selectedEnterprise && !currentAction) {
                this.updateStatus('❌ Entreprise ET action manquantes');
                this.showMessage('DEBUG: Entreprise ET action manquantes');
            } else if (!selectedEnterprise) {
                this.updateStatus('❌ Entreprise manquante');
                this.showMessage('DEBUG: Entreprise manquante - Avez-vous bien cliqué sur une entreprise dans la liste ?');
            } else if (!currentAction) {
                this.updateStatus('❌ Action manquante');
                this.showMessage('DEBUG: Action manquante - currentAction vaut: ' + currentAction);
            }
            return;
        }

        console.log('✅ Validation OK, continuation...');
        this.updateStatus('⚡ Exécution en cours...');

        try {
            // LOGIQUE DIFFÉRENCIÉE PAR ACTION (comme dans le backup)
            if (currentAction === 'facture') {
                // Pour les factures : obligation d'avoir une qualification
                const qualification = await this.searchQualificationForEnterprise(selectedEnterprise.id);
                
                if (qualification) {
                    this.showQualificationValidationDialog(qualification, currentAction);
                } else {
                    this.showCreateQualificationFirst(currentAction);
                }
                return;
                
            } else if (currentAction === 'bon_commande') {
                // BON DE COMMANDE - Pas d'obligation de qualification
                await this.handleBonCommandeDirect();
                return;
                
            } else if (currentAction === 'qualification') {
                // Affichage du formulaire de qualification
                await this.showQualificationForm();
                return;
                
            } else {
                // Actions génériques
                await this.executeGenericAction();
            }

        } catch (error) {
            console.error('❌ Erreur exécution action:', error);
            this.showMessage(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur d\'exécution');
        }
    }

    // ========================================================================
    // GESTION BON DE COMMANDE (logique du backup)
    // ========================================================================

    async handleBonCommandeDirect() {
        console.log('📋 Bon de commande direct pour:', selectedEnterprise.name);
        
        // Analyse du type client (comme dans le backup)
        const clientType = this.analyzeClientType(selectedEnterprise);
        
        // ✅ PAYLOAD STRINGIFIÉ avec toutes les données
        const payload = {
            action: 'bon_commande',
            data: {
                // Données de base
                enterprise_id: selectedEnterprise.id,
                enterprise_name: selectedEntreprise.name,
                nom_entreprise: selectedEntreprise.name,
                
                // Contact
                contact_nom: selectedEntreprise.interlocuteur || 'Contact Entreprise',
                email_contact: selectedEntreprise.email_contact || selectedEntreprise.email,
                telephone: selectedEntreprise.telephone || selectedEnterprise.portable,
                
                // Adresse
                adresse: selectedEntreprise.adresse,
                commune: selectedEntreprise.commune,
                
                // Type de client
                client_type: clientType.type,
                is_renewal: clientType.is_renewal,
                
                // Données historiques pour renouvellement
                format_2025: clientType.historical_data.format_2025,
                mois_2025: clientType.historical_data.mois_2025,
                montant_2025: clientType.historical_data.montant_2025,
                mode_paiement_2025: clientType.historical_data.mode_paiement_2025,
                
                // Métadonnées
                user_id: this.user.id,
                source: 'mini_crm_direct',
                timestamp: new Date().toISOString()
            }
        };
        
        console.log(`🎯 ${clientType.type.toUpperCase()} détecté:`, clientType);
        console.log('📤 Payload bon commande (avant stringify):', payload);
        
        this.updateStatus(`📧 Envoi email ${clientType.type}...`);
        
        const response = await fetch(config.N8N_WEBHOOKS.GATEWAY_ENTITIES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // ✅ STRINGIFIÉ
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Affichage résultat
        const messageType = clientType.is_renewal ? 
            `✅ Email de renouvellement envoyé à ${selectedEntreprise.name}` :
            `✅ Email nouveau client envoyé à ${selectedEntreprise.name}`;
        
        this.showMessage(messageType);
        this.updateStatus('✅ Bon de commande traité');
        
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    }

    // ========================================================================
    // ANALYSE TYPE CLIENT (logique du backup)
    // ========================================================================

    analyzeClientType(enterprise) {
        const isClient2025 = enterprise.client_2025 === 'Oui' || 
                           enterprise.Client_2025 === 'Oui' ||
                           enterprise.format_encart_2025;
        
        const hasHistoricalData = enterprise.format_encart_2025 || 
                                enterprise.mois_parution_2025 ||
                                enterprise.montant_payé_2024;
        
        const clientType = {
            type: isClient2025 ? 'renouvellement' : 'nouveau',
            is_renewal: isClient2025,
            confidence: hasHistoricalData ? 'high' : 'medium',
            historical_data: {
                format_2025: enterprise.format_encart_2025 || '',
                mois_2025: enterprise.mois_parution_2025 || '',
                montant_2025: enterprise.montant_payé_2024 || '',
                mode_paiement_2025: enterprise.mode_paiement_2024 || ''
            }
        };
        
        console.log('🔍 Analyse client:', {
            nom: enterprise.name,
            type: clientType.type,
            client_2025: enterprise.client_2025,
            format_2025: enterprise.format_encart_2025
        });
        
        return clientType;
    }

    // ========================================================================
    // GESTION FACTURES (logique du backup)
    // ========================================================================

    async searchQualificationForEnterprise(enterpriseId) {
        try {
            this.updateStatus('🔄 Recherche qualification...');
            
            // ✅ PAYLOAD STRINGIFIÉ
            const payload = {
                action: 'recherche_qualification',
                data: {
                    enterprise_id: parseInt(enterpriseId)
                }
            };

            console.log('📤 Payload recherche qualification (avant stringify):', payload);

            const response = await fetch(config.N8N_WEBHOOKS.GATEWAY_ENTITIES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // ✅ STRINGIFIÉ
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('🔍 Réponse qualification:', result);
            
            if (result && result.success && result.data) {
                this.updateStatus('✅ Qualification trouvée');
                return result.data;
            } else {
                this.updateStatus('⚠️ Aucune qualification trouvée');
                return null;
            }

        } catch (error) {
            console.error('❌ Erreur recherche qualification:', error);
            this.updateStatus('❌ Erreur recherche qualification');
            return null;
        }
    }

    showQualificationValidationDialog(qualification, action) {
        console.log('📋 Affichage dialogue validation qualification');
        
        const content = `
            <div class="qualification-validation">
                <h2>📋 Validation Qualification</h2>
                <p>Qualification trouvée pour <strong>${selectedEntreprise.name}</strong></p>
                
                <div class="qualification-summary">
                    <h3>📊 Résumé de la qualification</h3>
                    <div class="qualification-details">
                        <div class="detail-row">
                            <span class="label">Entreprise:</span>
                            <span class="value">${qualification.nom_entreprise || selectedEntreprise.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Contact:</span>
                            <span class="value">${qualification.interlocuteur || selectedEntreprise.interlocuteur}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Publications:</span>
                            <span class="value">${qualification.publications?.length || 0} parution(s)</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Montant total:</span>
                            <span class="value">${qualification.montant_total || 0}€</span>
                        </div>
                    </div>
                </div>
                
                <div class="validation-options">
                    <h3>⚡ Actions disponibles</h3>
                    
                    ${action === 'facture' ? `
                        <div class="payment-options">
                            <h4>💰 Statut paiement</h4>
                            <label class="payment-option">
                                <input type="radio" name="paymentStatus" value="payee" checked>
                                <span>✅ Facture payée (sans échéance)</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="paymentStatus" value="non_payee">
                                <span>⏰ Facture non payée (avec échéance)</span>
                            </label>
                            
                            <div id="paidFields" class="payment-details">
                                <div class="form-group">
                                    <label for="referencePaiement">Référence paiement:</label>
                                    <input type="text" id="referencePaiement" class="form-control" 
                                           placeholder="Ex: VIREMENT-2025-001">
                                </div>
                                <div class="form-group">
                                    <label for="datePaiement">Date de paiement:</label>
                                    <input type="date" id="datePaiement" class="form-control" 
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="app.generateFactureFromQualification()">
                                📄 Générer la facture
                            </button>
                        </div>
                    ` : `
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="app.generateDocumentFromQualification('${action}')">
                                📋 Générer ${this.getActionLabel(action)}
                            </button>
                        </div>
                    `}
                </div>
                
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="app.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
            
            <script>
                // Gestion affichage champs paiement
                document.querySelectorAll('input[name="paymentStatus"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        const paidFields = document.getElementById('paidFields');
                        if (this.value === 'payee') {
                            paidFields.style.display = 'block';
                        } else {
                            paidFields.style.display = 'none';
                        }
                    });
                });
            </script>
        `;
        
        this.updateMainContent(content);
        window.qualificationData = qualification;
    }

    showCreateQualificationFirst(action) {
        console.log('📝 Demande création qualification d\'abord');
        
        const content = `
            <div class="create-qualification-first">
                <h2>📝 Qualification Requise</h2>
                <div class="info-message">
                    <div class="message-icon">⚠️</div>
                    <div class="message-content">
                        <h3>Qualification manquante</h3>
                        <p>Pour générer une <strong>${this.getActionLabel(action)}</strong>, vous devez d'abord créer une qualification pour cette entreprise.</p>
                        <p><strong>${selectedEnterprise.name}</strong> n'a pas encore de qualification enregistrée.</p>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="app.createQualificationFirst()">
                        📝 Créer la qualification
                    </button>
                    <button class="btn btn-secondary" onclick="app.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
        `;
        
        this.updateMainContent(content);
    }

    // ========================================================================
    // GÉNÉRATION DOCUMENTS (logique du backup)
    // ========================================================================

    async generateFactureFromQualification() {
        const paymentStatus = document.querySelector('input[name="paymentStatus"]:checked')?.value;
        const referencePaiement = document.getElementById('referencePaiement')?.value || '';
        const datePaiement = document.getElementById('datePaiement')?.value || '';
        
        const estPayee = paymentStatus === 'payee';
        
        console.log('📄 Génération facture:', { estPayee, referencePaiement, datePaiement });
        
        try {
            this.updateStatus('📄 Génération facture en cours...');
            
            // ✅ PAYLOAD STRINGIFIÉ complet
            const payload = {
                action: 'facture',
                data: {
                    qualification_id: window.qualificationData.id,
                    enterprise_id: selectedEntreprise.id,
                    nom_entreprise: selectedEntreprise.name,
                    
                    // Données de facturation
                    est_payee: estPayee,
                    reference_paiement: estPayee ? referencePaiement : '',
                    date_paiement: estPayee ? datePaiement : '',
                    
                    // Données qualification
                    publications: window.qualificationData.publications || [],
                    montant_total: window.qualificationData.montant_total || 0,
                    
                    // Métadonnées
                    user_id: this.user.id,
                    timestamp: new Date().toISOString()
                }
            };

            console.log('📤 Payload facture (avant stringify):', payload);

            const response = await fetch(config.N8N_WEBHOOKS.GATEWAY_ENTITIES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // ✅ STRINGIFIÉ
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result && result.success) {
                this.showMessage('✅ Facture générée avec succès!');
                this.updateStatus('✅ Facture générée');
                
                setTimeout(() => {
                    this.showMainMenu();
                }, 2000);
            } else {
                throw new Error(result?.error || 'Erreur génération facture');
            }

        } catch (error) {
            console.error('❌ Erreur génération facture:', error);
            this.showMessage(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur génération facture');
        }
    }

    async generateDocumentFromQualification(documentType) {
        console.log('📋 Génération document:', documentType);
        
        try {
            this.updateStatus(`📋 Génération ${documentType} en cours...`);
            
            // ✅ PAYLOAD STRINGIFIÉ
            const payload = {
                action: documentType,
                data: {
                    qualification_id: window.qualificationData.id,
                    enterprise_id: selectedEntreprise.id,
                    nom_entreprise: selectedEntreprise.name,
                    
                    // Données qualification
                    publications: window.qualificationData.publications || [],
                    montant_total: window.qualificationData.montant_total || 0,
                    
                    // Métadonnées
                    user_id: this.user.id,
                    timestamp: new Date().toISOString()
                }
            };

            console.log('📤 Payload document (avant stringify):', payload);

            const response = await fetch(config.N8N_WEBHOOKS.GATEWAY_ENTITIES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // ✅ STRINGIFIÉ
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result && result.success) {
                this.showMessage(`✅ ${this.getActionLabel(documentType)} généré avec succès!`);
                this.updateStatus('✅ Document généré');
                
                setTimeout(() => {
                    this.showMainMenu();
                }, 2000);
            } else {
                throw new Error(result?.error || 'Erreur génération document');
            }

        } catch (error) {
            console.error('❌ Erreur génération document:', error);
            this.showMessage(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur génération document');
        }
    }

    // ========================================================================
    // QUALIFICATION (intégration avec le module)
    // ========================================================================

    async showQualificationForm() {
        console.log('📝 Affichage formulaire qualification');
        
        try {
            const content = qualificationManager.getQualificationContent();
            this.updateMainContent(content);
            
            state.updateData('currentView', 'qualification');
            telegramService.updateMainButton('💼 Qualification', false);
            telegramService.showBackButton(true, () => this.showMainMenu());
            
            // Charger la qualification existante si disponible
            if (selectedEntreprise?.id) {
                await qualificationManager.loadQualificationData(selectedEntreprise.id);
            }
            
        } catch (error) {
            console.error('❌ Erreur affichage qualification:', error);
            this.showErrorContent('Erreur chargement qualification');
        }
    }

    async createQualificationFirst() {
        console.log('📝 Création qualification d\'abord');
        await this.showQualificationForm();
    }

    // ========================================================================
    // NOUVELLE ENTREPRISE (logique du backup)
    // ========================================================================

    async createNewEnterprise(event) {
        event.preventDefault();
        
        const formData = {
            nom_entreprise: document.getElementById('nomEntreprise').value.trim(),
            adresse: document.getElementById('adresseEntreprise').value.trim(),
            commune: document.getElementById('communeEntreprise').value.trim(),
            telephone: document.getElementById('telephoneEntreprise').value.trim(),
            email: document.getElementById('emailEntreprise').value.trim(),
            interlocuteur: document.getElementById('interlocuteurEntreprise').value.trim()
        };
        
        // Validation
        if (!formData.nom_entreprise) {
            this.showMessage('❌ Le nom de l\'entreprise est obligatoire');
            return;
        }
        
        try {
            this.updateStatus('🏢 Création entreprise en cours...');
            
            // ✅ PAYLOAD STRINGIFIÉ
            const payload = {
                action: 'nouvelle_entreprise',
                data: {
                    ...formData,
                    user_id: this.user.id,
                    source: 'mini_crm_creation',
                    timestamp: new Date().toISOString()
                }
            };

            console.log('📤 Payload nouvelle entreprise (avant stringify):', payload);

            const response = await fetch(config.N8N_WEBHOOKS.GATEWAY_ENTITIES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // ✅ STRINGIFIÉ
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result && result.success) {
                this.showMessage('✅ Entreprise créée avec succès!');
                this.updateStatus('✅ Entreprise créée');
                
                setTimeout(() => {
                    this.showMainMenu();
                }, 2000);
            } else {
                throw new Error(result?.error || 'Erreur création entreprise');
            }

        } catch (error) {
            console.error('❌ Erreur création entreprise:', error);
            this.showMessage(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur création entreprise');
        }
    }

    // ========================================================================
    // UTILITAIRES (du backup)
    // ========================================================================

    getActionLabel(actionType) {
        const labels = {
            'facture': '📄 Générer Facture',
            'bon_commande': '📋 Bon de Commande', 
            'qualification': '🎯 Qualification Prospect',
            'stats': '📊 Statistiques Renouvellement',
            'nouvelle_entreprise': '🏢 Nouvelle Entreprise'
        };
        return labels[actionType] || actionType;
    }

    updateStatus(message) {
        console.log(`📊 Status: ${message}`);
        state.updateData('currentStatus', message);
        
        // Mise à jour de l'élément DOM si présent
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = message;
        }
        
        // Notification Telegram si disponible
        telegramService.updateMainButton(message, false);
    }

    showMessage(message, type = 'info') {
        console.log(`📢 Message (${type}): ${message}`);
        
        // Alternative pour tg.showAlert compatible avec toutes les versions Telegram
        if (window.Telegram?.WebApp?.showAlert && typeof window.Telegram.WebApp.showAlert === 'function') {
            try {
                window.Telegram.WebApp.showAlert(message);
                return;
            } catch (error) {
                console.warn('tg.showAlert non supporté:', error);
            }
        }

        // Utilisation du système global de messages
        state.updateData('lastMessage', { text: message, type, timestamp: Date.now() });
        
        // Affichage temporaire dans le DOM
        this.showToastMessage(message, type);
        
        // Fallback alert pour les messages d'erreur
        if (message.includes('Erreur') || message.includes('❌')) {
            alert(message);
        }
    }

    showToastMessage(message, type = 'info') {
        const toastDiv = document.createElement('div');
        toastDiv.className = `message-toast ${type}`;
        toastDiv.textContent = message;
        toastDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            padding: 10px 15px; border-radius: 5px; color: white;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toastDiv);
        
        setTimeout(() => {
            if (document.body.contains(toastDiv)) {
                toastDiv.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(toastDiv)) {
                        document.body.removeChild(toastDiv);
                    }
                }, 300);
            }
        }, 4000);
    }

    // ========================================================================
    // GESTION CONTENU ET ERREURS
    // ========================================================================

    updateMainContent(htmlContent) {
        const container = document.getElementById('mainContent') || document.getElementById('app') || document.body;
        
        try {
            container.innerHTML = htmlContent;
            console.log('✅ Contenu mis à jour');
            
        } catch (error) {
            console.error('❌ Erreur mise à jour contenu:', error);
            this.showErrorContent('Erreur affichage interface');
        }
    }

    showErrorContent(message) {
        const errorHtml = `
            <div class="error-container">
                <h3>❌ Erreur</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="app.showMainMenu()">
                    🏠 Retour menu principal
                </button>
            </div>
        `;
        
        const container = document.getElementById('mainContent') || document.getElementById('app') || document.body;
        container.innerHTML = errorHtml;
    }

    handleInitializationError(error) {
        console.error('❌ Erreur critique initialisation:', error);
        
        const errorHtml = `
            <div class="init-error">
                <h2>❌ Erreur d'initialisation</h2>
                <p>Impossible de charger l'application CRM.</p>
                <p><strong>Erreur:</strong> ${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    🔄 Recharger la page
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
        
        if (window.Telegram?.WebApp?.showHapticFeedback) {
            window.Telegram.WebApp.showHapticFeedback('error');
        }
    }

    handleGlobalError(error) {
        console.error('❌ Erreur globale capturée:', error);
        this.showMessage(`Erreur: ${error.message}`, 'error');
        
        if (window.Telegram?.WebApp?.showHapticFeedback) {
            window.Telegram.WebApp.showHapticFeedback('error');
        }
    }

    // ========================================================================
    // MÉTHODES UTILITAIRES PUBLIQUES
    // ========================================================================

    getAppState() {
        return {
            initialized: this.isInitialized,
            currentState: currentState,
            currentAction: currentAction,
            selectedEnterprise: selectedEnterprise,
            user: this.user
        };
    }

    async restart() {
        console.log('🔄 Redémarrage application...');
        this.isInitialized = false;
        await this.initialize();
    }

    getDebugInfo() {
        return {
            app: this.getAppState(),
            modules: {
                config: config.getAll?.() || 'Non disponible',
                state: state.getData?.() || 'Non disponible'
            },
            cache: {
                searchCache: Object.keys(searchCache),
                publicationsData: publicationsData
            }
        };
    }
}

// ========================================================================
// INITIALISATION ET DÉMARRAGE
// ========================================================================

// Instance globale de l'application
const app = new CRMApp();

// ========================================================================
// EXPOSITION GLOBALE DES FONCTIONS (compatibilité onclick)
// ========================================================================

// Fonctions principales de navigation
window.app = app;
window.showMainMenu = () => app.showMainMenu();
window.showSearch = () => app.showSearch();
window.showAction = (action) => app.showAction(action);

// Fonctions de recherche et sélection
window.handleSearch = () => app.handleSearch();
window.selectEnterpriseForAction = (index) => app.selectEnterpriseForAction(index);
window.executeSelectedAction = () => app.executeSelectedAction();

// Fonctions de qualification
window.createQualificationFirst = () => app.createQualificationFirst();
window.generateFactureFromQualification = () => app.generateFactureFromQualification();
window.generateDocumentFromQualification = (type) => app.generateDocumentFromQualification(type);

// Fonctions de création
window.createNewEnterprise = (event) => app.createNewEntreprise(event);

// Variables globales (compatibilité backup)
window.selectedEnterprise = selectedEnterprise;
window.currentAction = currentAction;
window.searchCache = searchCache;

// Exposition des gestionnaires pour les modules
window.navigationManager = navigationManager;
window.searchManager = searchManager;
window.qualificationManager = qualificationManager;
window.statsManager = statsManager;

// Fonctions utilitaires Telegram
window.getTelegramUser = () => app.user;

// ========================================================================
// DÉMARRAGE AUTOMATIQUE
// ========================================================================

// Démarrage automatique quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM ready - Démarrage CRM...');
        if (window.updateLoadingStatus) {
            window.updateLoadingStatus('Initialisation modules...');
        }
        app.initialize();
    });
} else {
    console.log('📄 DOM déjà prêt - Démarrage immédiat...');
    app.initialize();
}

// Export pour usage en tant que module
export default app;
export { app, CRMApp };

console.log('🚀 app.js complet chargé - CRM modulaire avec TOUTES les fonctionnalités du backup');