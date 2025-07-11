// ================================
// 📁 src/components/navigation.js
// Composant de navigation principal - CORRIGÉ
// ================================

import config from '../core/config.js';
import appState from '../core/state.js';

export class NavigationComponent {
    constructor() {
        this.config = config;
        this.state = appState;
        
        console.log('🧭 NavigationComponent créé');
    }
    
    // ========================
    // 🚀 INITIALISATION
    // ========================
    
    initialize() {
        this.showMainMenu();
        console.log('✅ Navigation initialisée');
    }
    
    // ========================
    // 📱 NAVIGATION PRINCIPALE
    // ========================
    
    showMainMenu() {
        this.state.setState('main_menu');
        this.state.clearCurrentAction();
        this.state.clearSelectedEnterprise();
        
        this._showElement('mainMenu');
        this._hideElement('searchInterface');
        this._hideElement('conversationState');
        
        this.state.setStatus('Menu principal');
        
        console.log('🏠 Menu principal affiché');
    }
    
    showSearch() {
        this.state.setState('search');
        
        this._hideElement('mainMenu');
        this._showElement('searchInterface');
        this._hideElement('conversationState');
        
        // Focus sur le champ de recherche
        const searchInput = document.getElementById(this.config.getElementId('SEARCH_INPUT'));
        if (searchInput) {
            searchInput.focus();
        }
        
        this.state.setStatus('Recherche entreprise');
        
        console.log('🔍 Interface de recherche affichée');
    }
    
    showAction(actionType) {
        if (!this.config.isValidAction(actionType)) {
            console.error('❌ Action invalide:', actionType);
            return;
        }
        
        this.state.setState(`action_${actionType}`);
        this.state.setCurrentAction(actionType);
        
        this._hideElement('mainMenu');
        this._hideElement('searchInterface');
        
        this.showConversationState(actionType);
        
        this.state.setStatus(`Action: ${this.config.getActionLabel(actionType)}`);
        
        console.log('🎬 Action lancée:', actionType);
        return actionType;
    }
    
    // ========================
    // 🎭 GESTION ÉTAT CONVERSATIONNEL
    // ========================
    
    showConversationState(actionType) {
        const stateDiv = document.getElementById(this.config.getElementId('CONVERSATION_STATE'));
        const titleDiv = document.getElementById(this.config.getElementId('STATE_TITLE'));
        const contentDiv = document.getElementById(this.config.getElementId('STATE_CONTENT'));
        
        if (!stateDiv || !titleDiv || !contentDiv) {
            console.error('❌ Éléments UI manquants pour état conversationnel');
            return;
        }
        
        // Configuration du titre
        titleDiv.textContent = this.config.getActionLabel(actionType);
        
        // Génération du contenu selon l'action
        contentDiv.innerHTML = this._getContentForAction(actionType);
        
        // Affichage de l'état
        stateDiv.style.display = 'block';
        
        // Initialisation spécifique selon l'action
        this._initializeActionSpecific(actionType);
        
        console.log('🎭 État conversationnel affiché pour:', actionType);
    }
    
    _getContentForAction(actionType) {
        switch (actionType) {
            case this.config.actions.QUALIFICATION:
                return this._getQualificationContent();
                
            case this.config.actions.STATS:
                return this._getStatsContent();
                
            case this.config.actions.FACTURE:
                return this._getDocumentContent('facture');
                
            case this.config.actions.BON_COMMANDE:
                return this._getDocumentContent('bon_commande');
                
            case this.config.actions.NOUVELLE_ENTREPRISE:
                return this._getNewEnterpriseContent();
                
            case this.config.actions.ATTRIBUTION:
                return this._getAttributionContent();
                
            default:
                return this._getDefaultContent(actionType);
        }
    }
    
    _getQualificationContent() {
        // Utiliser la fonction globale si disponible, sinon fallback
        if (typeof window.getQualificationContent === 'function') {
            return window.getQualificationContent();
        }
        
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        if (!selectedEnterprise) {
            return `
                <div class="qualification-no-enterprise">
                    <div class="info-message">
                        <h3>⚠️ Aucune entreprise sélectionnée</h3>
                        <p>Pour créer une qualification, vous devez d'abord sélectionner une entreprise.</p>
                        
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="window.showSearch()">
                                🔍 Rechercher une entreprise
                            </button>
                            <button class="btn btn-secondary" onclick="window.showMainMenu()">
                                ← Retour au menu
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="qualification-placeholder">
                <h3>🎯 Qualification - ${selectedEnterprise.nom_entreprise}</h3>
                <p>Module qualification en cours de chargement...</p>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="window.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
        `;
    }
    
    _getStatsContent() {
        return `
            <div class="stats-content">
                <h3>📊 Statistiques Express</h3>
                <div class="stats-loading">
                    <p>Chargement des statistiques...</p>
                    <div class="loading-spinner"></div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="window.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
        `;
    }
    
    _getDocumentContent(documentType) {
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        if (!selectedEnterprise) {
            return `
                <div class="document-no-enterprise">
                    <div class="info-message">
                        <h3>⚠️ Aucune entreprise sélectionnée</h3>
                        <p>Pour générer un ${documentType}, vous devez d'abord sélectionner une entreprise.</p>
                        
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="window.showSearch()">
                                🔍 Rechercher une entreprise
                            </button>
                            <button class="btn btn-secondary" onclick="window.showMainMenu()">
                                ← Retour au menu
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const documentLabel = this.config.getActionLabel(documentType);
        
        return `
            <div class="document-content">
                <div class="document-header">
                    <h3>${documentType === 'facture' ? '📄' : '📋'} ${documentLabel}</h3>
                    <h4>🏢 ${selectedEnterprise.nom_entreprise}</h4>
                </div>
                
                <div class="enterprise-summary">
                    <p><strong>📍 Commune :</strong> ${selectedEnterprise.commune || 'Non renseignée'}</p>
                    <p><strong>👤 Contact :</strong> ${selectedEnterprise.interlocuteur || 'Non renseigné'}</p>
                    <p><strong>📞 Téléphone :</strong> ${selectedEnterprise.telephone || 'Non renseigné'}</p>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="window.generateDocument('${documentType}')">
                        📄 Générer ${documentLabel}
                    </button>
                    <button class="btn btn-secondary" onclick="window.showSearch()">
                        🔄 Changer d'entreprise
                    </button>
                    <button class="btn btn-secondary" onclick="window.showMainMenu()">
                        ← Retour au menu
                    </button>
                </div>
            </div>
        `;
    }
    
    _getNewEnterpriseContent() {
        return `
            <div class="new-enterprise-content">
                <div class="form-header">
                    <h3>➕ Nouvelle Entreprise</h3>
                </div>
                
                <form class="enterprise-form" onsubmit="return window.createNewEnterprise(event)">
                    <div class="form-group">
                        <label>Nom de l'entreprise *</label>
                        <input type="text" id="newEnterpriseName" required 
                               placeholder="Nom de l'entreprise">
                    </div>
                    
                    <div class="form-group">
                        <label>Commune</label>
                        <input type="text" id="newEnterpriseCommune" 
                               placeholder="Ville">
                    </div>
                    
                    <div class="form-group">
                        <label>Adresse</label>
                        <input type="text" id="newEnterpriseAdresse" 
                               placeholder="Adresse complète">
                    </div>
                    
                    <div class="form-group">
                        <label>Contact</label>
                        <input type="text" id="newEnterpriseContact" 
                               placeholder="Nom du contact">
                    </div>
                    
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="newEnterpriseEmail" 
                               placeholder="email@exemple.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Téléphone</label>
                        <input type="tel" id="newEnterpriseTelephone" 
                               placeholder="06 12 34 56 78">
                    </div>
                    
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-primary">
                            ✅ Créer l'entreprise
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="window.showMainMenu()">
                            ← Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    _getAttributionContent() {
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        if (!selectedEnterprise) {
            return `
                <div class="attribution-no-enterprise">
                    <div class="info-message">
                        <h3>⚠️ Aucune entreprise sélectionnée</h3>
                        <p>Pour attribuer un prospecteur, vous devez d'abord sélectionner une entreprise.</p>
                        
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="window.showSearch()">
                                🔍 Rechercher une entreprise
                            </button>
                            <button class="btn btn-secondary" onclick="window.showMainMenu()">
                                ← Retour au menu
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="attribution-content">
                <div class="attribution-header">
                    <h3>👤 Attribution Prospecteur</h3>
                    <h4>🏢 ${selectedEnterprise.nom_entreprise}</h4>
                </div>
                
                <form onsubmit="return window.assignProspecteur(event)">
                    <div class="form-group">
                        <label>Prospecteur *</label>
                        <select id="prospecteurSelect" required>
                            <option value="">Choisir un prospecteur...</option>
                            <option value="steve">Stève</option>
                            <option value="michel">Michel</option>
                            <option value="patrick">Patrick</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Date limite</label>
                        <input type="date" id="dateLimite">
                    </div>
                    
                    <div class="form-group">
                        <label>Commentaires</label>
                        <textarea id="commentairesAttribution" rows="3" 
                                  placeholder="Instructions spécifiques..."></textarea>
                    </div>
                    
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-primary">
                            ✅ Assigner
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="window.showMainMenu()">
                            ← Retour
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    _getDefaultContent(actionType) {
        return `
            <div class="default-content">
                <div class="default-header">
                    <h3>⚙️ ${this.config.getActionLabel(actionType)}</h3>
                </div>
                <div class="default-body">
                    <p>Fonctionnalité en cours de développement...</p>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="window.showMainMenu()">
                            ← Retour au menu
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    _initializeActionSpecific(actionType) {
        switch (actionType) {
            case this.config.actions.QUALIFICATION:
                // Initialiser les publications si la fonction existe
                if (typeof window.initializePublications === 'function') {
                    setTimeout(() => {
                        window.initializePublications();
                    }, 100);
                }
                break;
                
            case this.config.actions.STATS:
                // Charger les statistiques si la fonction existe
                if (typeof window.chargerStatsRenouvellement === 'function') {
                    setTimeout(() => {
                        window.chargerStatsRenouvellement();
                    }, 100);
                }
                break;
        }
    }
    
    // ========================
    // 🛠️ UTILITAIRES UI
    // ========================
    
    _showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
            element.style.display = 'block';
        }
    }
    
    _hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
            element.style.display = 'none';
        }
    }
    
    // ========================
    // 🧹 NETTOYAGE
    // ========================
    
    cleanup() {
        // Nettoyer les event listeners si nécessaire
        console.log('🧹 NavigationComponent nettoyé');
    }
}

// ========================
// 🌍 INSTANCE SINGLETON
// ========================

let navigationInstance = null;

export function getNavigationComponent() {
    if (!navigationInstance) {
        navigationInstance = new NavigationComponent();
    }
    return navigationInstance;
}

export default getNavigationComponent();