// ================================
// 📁 src/components/search.js
// Composant de recherche d'entreprises
// ================================

import config from '../core/config.js';
import appState from '../core/state.js';
import apiService from '../services/api.js';

export class SearchComponent {
    constructor() {
        this.config = config;
        this.state = appState;
        this.api = apiService;
        this.searchConfig = this.config.getSearchConfig();
        
        console.log('🔍 SearchComponent créé');
    }
    
    // ========================
    // 🚀 INITIALISATION
    // ========================
    
    initialize() {
        this._setupEventListeners();
        console.log('✅ Search initialisé');
    }
    
    _setupEventListeners() {
        // Event listener pour le champ de recherche
        const searchInput = document.getElementById(this.config.getElementId('SEARCH_INPUT'));
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this._handleSearchInput(e.target.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._handleSearchInput(e.target.value, true);
                }
            });
        }
        
        // Observer les changements de résultats
        this.state.subscribe('searchResultsChanged', (data) => {
            this._updateSearchResultsDisplay(data.results, data.query);
        });
    }
    
    // ========================
    // 🔍 LOGIQUE DE RECHERCHE
    // ========================
    
    _handleSearchInput(query, forceSearch = false) {
        const trimmedQuery = query.trim();
        
        // Validation longueur minimale
        if (trimmedQuery.length < this.searchConfig.minLength && !forceSearch) {
            this._clearSearchResults();
            return;
        }
        
        // Éviter les recherches en doublon
        if (trimmedQuery === this.state.lastSearchQuery && !forceSearch) {
            return;
        }
        
        // Debounce pour éviter trop de requêtes
        this.state.clearTimeout('search');
        this.state.setTimeout('search', () => {
            this._performSearch(trimmedQuery);
        }, this.searchConfig.delay);
    }
    
    async _performSearch(query) {
        if (!query || query.length < this.searchConfig.minLength) {
            this._clearSearchResults();
            return;
        }
        
        try {
            this.state.setLoadingStatus(`Recherche "${query}"...`);
            this._showSearchLoading(true);
            
            // Appel API via le service
            const results = await this.api.searchEnterprises(query, {
                limit: this.searchConfig.maxResults
            });
            
            // Mise à jour de l'état
            this.state.setSearchResults(results, query);
            
            // Message de succès
            this.state.setSuccessStatus(`${results.length} entreprise(s) trouvée(s)`);
            
            console.log(`🔍 Recherche "${query}": ${results.length} résultats`);
            
        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            this.state.setErrorStatus(`Erreur recherche: ${error.message}`);
            this._showSearchError(error.message);
        } finally {
            this._showSearchLoading(false);
        }
    }
    
    // ========================
    // 🎨 AFFICHAGE DES RÉSULTATS
    // ========================
    
    _updateSearchResultsDisplay(results, query) {
        const resultsContainer = document.getElementById(this.config.getElementId('SEARCH_RESULTS'));
        if (!resultsContainer) {
            console.error('❌ Container résultats non trouvé');
            return;
        }
        
        resultsContainer.innerHTML = this._generateResultsHTML(results, query);
    }
    
    _generateResultsHTML(results, query) {
        if (!results || results.length === 0) {
            return this._getNoResultsHTML(query);
        }
        
        const resultsHTML = results.map(enterprise => 
            this._generateEnterpriseCard(enterprise)
        ).join('');
        
        return `
            <div class="search-results-header">
                <h3>🔍 Résultats de recherche (${results.length})</h3>
                <small>Recherche : "${query}"</small>
            </div>
            <div class="search-results-list">
                ${resultsHTML}
            </div>
        `;
    }
    
    _generateEnterpriseCard(enterprise) {
        const enterpriseId = enterprise.id;
        const nom = enterprise.nom_entreprise || 'Nom non renseigné';
        const commune = enterprise.commune || 'Commune non renseignée';
        const telephone = enterprise.telephone || 'Non renseigné';
        const email = enterprise.email || 'Non renseigné';
        const statut = enterprise.statut || 'Disponible';
        
        // Déterminer la couleur du statut
        const statutClass = this._getStatutClass(statut);
        
        // Icônes conditionnelles
        const hasEmail = email !== 'Non renseigné' ? '📧' : '📧❌';
        const hasPhone = telephone !== 'Non renseigné' ? '📞' : '📞❌';
        
        return `
            <div class="enterprise-card" onclick="window.selectEnterprise(${enterpriseId})" data-enterprise-id="${enterpriseId}">
                <div class="enterprise-card-header">
                    <h4 class="enterprise-name">${nom}</h4>
                    <span class="enterprise-status ${statutClass}">${statut}</span>
                </div>
                <div class="enterprise-details">
                    <div class="enterprise-location">
                        📍 ${commune}
                    </div>
                    <div class="enterprise-contact">
                        <span class="contact-info">
                            ${hasPhone} ${telephone}
                        </span>
                        <span class="contact-info">
                            ${hasEmail} ${email}
                        </span>
                    </div>
                </div>
                <div class="enterprise-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.selectEnterpriseForAction(${enterpriseId}, '${this.state.getCurrentAction() || 'qualification'}')">
                        ✅ Sélectionner
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.viewEnterpriseDetails(${enterpriseId})">
                        👁️ Détails
                    </button>
                </div>
            </div>
        `;
    }
    
    _getStatutClass(statut) {
        const statutMap = {
            'Disponible': 'status-available',
            'En cours': 'status-pending', 
            'Attribué': 'status-assigned',
            'Terminé': 'status-completed',
            'Non intéressé': 'status-declined'
        };
        
        return statutMap[statut] || 'status-unknown';
    }
    
    _getNoResultsHTML(query) {
        return `
            <div class="search-no-results">
                <div class="no-results-icon">🔍</div>
                <h3>Aucun résultat trouvé</h3>
                <p>Aucune entreprise ne correspond à "${query}"</p>
                <div class="no-results-suggestions">
                    <h4>💡 Suggestions :</h4>
                    <ul>
                        <li>Vérifiez l'orthographe</li>
                        <li>Essayez avec moins de mots</li>
                        <li>Utilisez des termes plus généraux</li>
                    </ul>
                </div>
                <div class="no-results-actions">
                    <button class="btn btn-primary" onclick="window.showAction('nouvelle_entreprise')">
                        ➕ Créer cette entreprise
                    </button>
                    <button class="btn btn-secondary" onclick="this._clearSearchAndFocus()">
                        🔄 Nouvelle recherche
                    </button>
                </div>
            </div>
        `;
    }
    
    // ========================
    // 🎨 ÉTATS D'AFFICHAGE
    // ========================
    
    _showSearchLoading(show) {
        const resultsContainer = document.getElementById(this.config.getElementId('SEARCH_RESULTS'));
        if (!resultsContainer) return;
        
        if (show) {
            resultsContainer.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <p>Recherche en cours...</p>
                </div>
            `;
        }
    }
    
    _showSearchError(errorMessage) {
        const resultsContainer = document.getElementById(this.config.getElementId('SEARCH_RESULTS'));
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="search-error">
                <div class="error-icon">❌</div>
                <h3>Erreur de recherche</h3>
                <p>${errorMessage}</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="this._retryLastSearch()">
                        🔄 Réessayer
                    </button>
                    <button class="btn btn-secondary" onclick="this._clearSearchResults()">
                        ❌ Effacer
                    </button>
                </div>
            </div>
        `;
    }
    
    _clearSearchResults() {
        const resultsContainer = document.getElementById(this.config.getElementId('SEARCH_RESULTS'));
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        this.state.clearSearchResults();
    }
    
    // ========================
    // 🎯 SÉLECTION D'ENTREPRISE
    // ========================
    
    selectEnterprise(enterpriseId) {
        const results = this.state.getSearchResults();
        const enterprise = results.find(e => e.id === enterpriseId);
        
        if (!enterprise) {
            console.error('❌ Entreprise non trouvée:', enterpriseId);
            return;
        }
        
        // Mettre à jour l'état global
        this.state.setSelectedEnterprise(enterprise);
        
        // Message de confirmation
        this.state.setSuccessStatus(`Entreprise sélectionnée: ${enterprise.nom_entreprise}`);
        
        // Afficher les actions possibles
        this._showEnterpriseSelected(enterprise);
        
        console.log('✅ Entreprise sélectionnée:', enterprise.nom_entreprise);
    }
    
    selectEnterpriseForAction(enterpriseId, actionType) {
        this.selectEnterprise(enterpriseId);
        
        // Rediriger vers l'action
        if (actionType && this.config.isValidAction(actionType)) {
            setTimeout(() => {
                if (typeof window.showAction === 'function') {
                    window.showAction(actionType);
                }
            }, 500);
        }
    }
    
    _showEnterpriseSelected(enterprise) {
        const resultsContainer = document.getElementById(this.config.getElementId('SEARCH_RESULTS'));
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="enterprise-selected">
                <div class="selection-header">
                    <h3>✅ Entreprise sélectionnée</h3>
                </div>
                
                <div class="selected-enterprise-card">
                    <h4>${enterprise.nom_entreprise}</h4>
                    <div class="enterprise-info">
                        <p><strong>📍 Commune :</strong> ${enterprise.commune || 'Non renseignée'}</p>
                        <p><strong>📞 Téléphone :</strong> ${enterprise.telephone || 'Non renseigné'}</p>
                        <p><strong>📧 Email :</strong> ${enterprise.email || 'Non renseigné'}</p>
                        <p><strong>👤 Contact :</strong> ${enterprise.interlocuteur || 'Non renseigné'}</p>
                        <p><strong>📊 Statut :</strong> ${enterprise.statut || 'Disponible'}</p>
                    </div>
                </div>
                
                <div class="available-actions">
                    <h4>🎯 Actions disponibles :</h4>
                    <div class="action-buttons-grid">
                        <button class="btn btn-primary" onclick="window.showAction('qualification')">
                            🎯 Qualification
                        </button>
                        <button class="btn btn-primary" onclick="window.showAction('facture')">
                            📄 Facture
                        </button>
                        <button class="btn btn-primary" onclick="window.showAction('bon_commande')">
                            📋 Bon de Commande
                        </button>
                        <button class="btn btn-secondary" onclick="window.showAction('attribution')">
                            👤 Attribution
                        </button>
                    </div>
                    
                    <div class="navigation-actions">
                        <button class="btn btn-outline" onclick="this._clearSelectionAndSearch()">
                            🔄 Changer d'entreprise
                        </button>
                        <button class="btn btn-outline" onclick="window.showMainMenu()">
                            🏠 Retour au menu
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ========================
    // 🔍 DÉTAILS D'ENTREPRISE
    // ========================
    
    async viewEnterpriseDetails(enterpriseId) {
        try {
            this.state.setLoadingStatus('Chargement détails...');
            
            // Récupérer les détails complets depuis l'API
            const enterpriseDetails = await this.api.call('ENTERPRISE_API', {
                operation: 'get',
                id: enterpriseId
            });
            
            if (enterpriseDetails.success && enterpriseDetails.data) {
                this._showEnterpriseDetails(enterpriseDetails.data);
            } else {
                throw new Error('Entreprise non trouvée');
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement détails:', error);
            this.state.setErrorStatus(`Erreur: ${error.message}`);
        }
    }
    
    _showEnterpriseDetails(enterprise) {
        const resultsContainer = document.getElementById(this.config.getElementId('SEARCH_RESULTS'));
        if (!resultsContainer) return;
        
        // Données historiques si disponibles
        const hasHistorical = enterprise.Client_2025 === 'Oui';
        const historicalHTML = hasHistorical ? this._generateHistoricalDataHTML(enterprise) : '';
        
        resultsContainer.innerHTML = `
            <div class="enterprise-details-view">
                <div class="details-header">
                    <h3>👁️ Détails de l'entreprise</h3>
                    <button class="btn btn-close" onclick="this._goBackToResults()">❌</button>
                </div>
                
                <div class="enterprise-full-details">
                    <div class="details-section">
                        <h4>🏢 Informations générales</h4>
                        <div class="details-grid">
                            <div class="detail-item">
                                <strong>Nom :</strong> ${enterprise.nom_entreprise || 'Non renseigné'}
                            </div>
                            <div class="detail-item">
                                <strong>Commune :</strong> ${enterprise.commune || 'Non renseignée'}
                            </div>
                            <div class="detail-item">
                                <strong>Adresse :</strong> ${enterprise.adresse || 'Non renseignée'}
                            </div>
                            <div class="detail-item">
                                <strong>Activité :</strong> ${enterprise.activite || 'Non renseignée'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h4>👤 Contact</h4>
                        <div class="details-grid">
                            <div class="detail-item">
                                <strong>Contact :</strong> ${enterprise.interlocuteur || 'Non renseigné'}
                            </div>
                            <div class="detail-item">
                                <strong>Téléphone :</strong> ${enterprise.telephone || 'Non renseigné'}
                            </div>
                            <div class="detail-item">
                                <strong>Portable :</strong> ${enterprise.portable || 'Non renseigné'}
                            </div>
                            <div class="detail-item">
                                <strong>Email :</strong> ${enterprise.email || 'Non renseigné'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h4>📊 Statut commercial</h4>
                        <div class="details-grid">
                            <div class="detail-item">
                                <strong>Statut :</strong> 
                                <span class="status-badge ${this._getStatutClass(enterprise.statut)}">${enterprise.statut || 'Disponible'}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Client 2025 :</strong> ${enterprise.client_2025 || 'Non'}
                            </div>
                            <div class="detail-item">
                                <strong>Prospecteur :</strong> ${enterprise.prospecteur_2024 || 'Non attribué'}
                            </div>
                        </div>
                    </div>
                    
                    ${historicalHTML}
                </div>
                
                <div class="details-actions">
                    <div class="primary-actions">
                        <button class="btn btn-primary" onclick="this.selectEnterpriseForAction(${enterprise.id}, 'qualification')">
                            🎯 Créer Qualification
                        </button>
                        <button class="btn btn-primary" onclick="this.selectEnterpriseForAction(${enterprise.id}, 'facture')">
                            📄 Générer Facture
                        </button>
                    </div>
                    
                    <div class="secondary-actions">
                        <button class="btn btn-secondary" onclick="this.selectEnterprise(${enterprise.id})">
                            ✅ Sélectionner cette entreprise
                        </button>
                        <button class="btn btn-outline" onclick="this._goBackToResults()">
                            ← Retour aux résultats
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    _generateHistoricalDataHTML(enterprise) {
        return `
            <div class="details-section">
                <h4>📈 Données historiques 2025</h4>
                <div class="historical-data">
                    <div class="detail-item">
                        <strong>Format encart :</strong> ${enterprise.format_encart_2025 || 'Non renseigné'}
                    </div>
                    <div class="detail-item">
                        <strong>Mois parution :</strong> ${enterprise.mois_parution_2025 || 'Non renseigné'}
                    </div>
                    <div class="detail-item">
                        <strong>Montant payé 2024 :</strong> ${enterprise.montant_payé_2024 || 'Non renseigné'}
                    </div>
                    <div class="detail-item">
                        <strong>Mode paiement :</strong> ${enterprise.mode_paiement_2024 || 'Non renseigné'}
                    </div>
                </div>
                <div class="historical-note">
                    💡 Ces données peuvent être utilisées pour l'auto-remplissage
                </div>
            </div>
        `;
    }
    
    // ========================
    // 🔄 ACTIONS UTILITAIRES
    // ========================
    
    _retryLastSearch() {
        const lastQuery = this.state.lastSearchQuery;
        if (lastQuery) {
            this._performSearch(lastQuery);
        }
    }
    
    _clearSearchAndFocus() {
        const searchInput = document.getElementById(this.config.getElementId('SEARCH_INPUT'));
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        this._clearSearchResults();
    }
    
    _clearSelectionAndSearch() {
        this.state.clearSelectedEnterprise();
        this._clearSearchAndFocus();
    }
    
    _goBackToResults() {
        const lastQuery = this.state.lastSearchQuery;
        const results = this.state.getSearchResults();
        
        if (lastQuery && results.length > 0) {
            this._updateSearchResultsDisplay(results, lastQuery);
        } else {
            this._clearSearchResults();
        }
    }
    
    // ========================
    // 🧹 NETTOYAGE
    // ========================
    
    cleanup() {
        this.state.clearTimeout('search');
        console.log('🧹 SearchComponent nettoyé');
    }
}

// ========================
// 🌍 INSTANCE SINGLETON
// ========================

let searchInstance = null;

export function getSearchComponent() {
    if (!searchInstance) {
        searchInstance = new SearchComponent();
    }
    return searchInstance;
}

// ========================
// 🌍 FONCTIONS GLOBALES (pour onclick)
// ========================

// Ces fonctions seront exposées globalement par app.js
export function selectEnterprise(enterpriseId) {
    const search = getSearchComponent();
    search.selectEnterprise(enterpriseId);
}

export function selectEnterpriseForAction(enterpriseId, actionType) {
    const search = getSearchComponent();
    search.selectEnterpriseForAction(enterpriseId, actionType);
}

export function viewEnterpriseDetails(enterpriseId) {
    const search = getSearchComponent();
    search.viewEnterpriseDetails(enterpriseId);
}

export default getSearchComponent();