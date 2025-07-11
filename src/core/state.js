// ================================
// 📁 src/core/state.js
// Gestion d'état globale avec pattern Observer
// ================================

export class AppState {
    constructor() {
        // 🧭 État de navigation
        this.currentState = 'main_menu';
        this.stateHistory = [];
        this.maxHistoryLength = 10;
        
        // 🏢 Entreprise et action courantes
        this.selectedEnterprise = null;
        this.currentAction = null;
        
        // 🔍 Cache de recherche optimisé
        this.searchCache = new Map();
        this.currentSearchResults = [];
        this.lastSearchQuery = null;
        
        // 📅 Données des publications/parutions
        this.publications = [];
        this.publicationCounter = 0;
        
        // 🎯 Données de qualification
        this.qualificationData = null;
        this.selectedOffer = null;
        
        // 📊 Observateurs pour la réactivité
        this.observers = new Map();
        
        // ⏱️ Timeouts actifs
        this.activeTimeouts = new Map();
        
        // 📱 Données utilisateur Telegram
        this.user = null;
        
        console.log('🏗️ AppState initialisé');
    }
    
    // ========================
    // 🧭 GESTION DE NAVIGATION
    // ========================
    
    setState(newState) {
        const oldState = this.currentState;
        
        // Ajouter à l'historique
        this.stateHistory.push(oldState);
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
        
        this.currentState = newState;
        
        this.notifyObservers('stateChange', { 
            old: oldState, 
            new: newState,
            canGoBack: this.stateHistory.length > 0
        });
        
        console.log(`🧭 État changé: ${oldState} → ${newState}`);
    }
    
    getState() {
        return this.currentState;
    }
    
    goBack() {
        if (this.stateHistory.length > 0) {
            const previousState = this.stateHistory.pop();
            this.currentState = previousState;
            
            this.notifyObservers('stateChange', {
                old: this.currentState,
                new: previousState,
                isBack: true,
                canGoBack: this.stateHistory.length > 0
            });
            
            return previousState;
        }
        return null;
    }
    
    clearHistory() {
        this.stateHistory = [];
    }
    
    // ========================
    // 🏢 GESTION ENTREPRISE
    // ========================
    
    setSelectedEnterprise(enterprise) {
        const oldEnterprise = this.selectedEnterprise;
        this.selectedEnterprise = enterprise;
        
        this.notifyObservers('enterpriseSelected', {
            old: oldEnterprise,
            new: enterprise
        });
        
        console.log('🏢 Entreprise sélectionnée:', enterprise?.nom_entreprise || enterprise?.nom);
    }
    
    getSelectedEnterprise() {
        return this.selectedEnterprise;
    }
    
    clearSelectedEnterprise() {
        this.setSelectedEnterprise(null);
    }
    
    // ========================
    // 🎬 GESTION ACTIONS
    // ========================
    
    setCurrentAction(action) {
        const oldAction = this.currentAction;
        this.currentAction = action;
        
        this.notifyObservers('actionChanged', {
            old: oldAction,
            new: action
        });
        
        console.log('🎬 Action courante:', action);
    }
    
    getCurrentAction() {
        return this.currentAction;
    }
    
    clearCurrentAction() {
        this.setCurrentAction(null);
    }
    
    // ========================
    // 📊 GESTION STATUT
    // ========================
    
    setStatus(status, type = 'info') {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = status;
            
            // Style selon le type
            statusElement.className = `status-${type}`;
        }
        
        this.notifyObservers('statusChanged', { status, type });
        console.log(`📊 Status [${type}]:`, status);
    }
    
    setLoadingStatus(message) {
        this.setStatus(`🔄 ${message}`, 'loading');
    }
    
    setSuccessStatus(message) {
        this.setStatus(`✅ ${message}`, 'success');
    }
    
    setErrorStatus(message) {
        this.setStatus(`❌ ${message}`, 'error');
    }
    
    // ========================
    // 🔍 GESTION CACHE DE RECHERCHE
    // ========================
    
    setCacheItem(key, value, ttl = 300000) { // 5 minutes par défaut
        this.searchCache.set(key, {
            value,
            expires: Date.now() + ttl,
            created: Date.now()
        });
        
        // Nettoyage automatique du cache
        this.cleanExpiredCache();
    }
    
    getCacheItem(key) {
        const item = this.searchCache.get(key);
        
        if (item && item.expires > Date.now()) {
            console.log('💾 Cache hit:', key);
            return item.value;
        }
        
        if (item) {
            this.searchCache.delete(key);
            console.log('🗑️ Cache expiré supprimé:', key);
        }
        
        return null;
    }
    
    clearCache() {
        this.searchCache.clear();
        console.log('🧹 Cache vidé');
    }
    
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, item] of this.searchCache.entries()) {
            if (item.expires <= now) {
                this.searchCache.delete(key);
            }
        }
    }
    
    getCacheStats() {
        const total = this.searchCache.size;
        const expired = Array.from(this.searchCache.values())
            .filter(item => item.expires <= Date.now()).length;
        
        return { total, expired, active: total - expired };
    }
    
    // ========================
    // 🔍 GESTION RÉSULTATS DE RECHERCHE
    // ========================
    
    setSearchResults(results, query) {
        this.currentSearchResults = results;
        this.lastSearchQuery = query;
        
        this.notifyObservers('searchResultsChanged', {
            results,
            query,
            count: results.length
        });
        
        console.log(`🔍 ${results.length} résultats pour "${query}"`);
    }
    
    getSearchResults() {
        return this.currentSearchResults;
    }
    
    clearSearchResults() {
        this.setSearchResults([], null);
    }
    
    // ========================
    // 📅 GESTION PUBLICATIONS
    // ========================
    
    setPublications(publications) {
        this.publications = publications;
        
        this.notifyObservers('publicationsChanged', {
            publications,
            count: publications.length
        });
        
        console.log(`📅 ${publications.length} publication(s) configurée(s)`);
    }
    
    getPublications() {
        return this.publications;
    }
    
    addPublication(publication) {
        this.publications.push(publication);
        this.notifyObservers('publicationAdded', publication);
    }
    
    removePublication(index) {
        if (index >= 0 && index < this.publications.length) {
            const removed = this.publications.splice(index, 1)[0];
            this.notifyObservers('publicationRemoved', { publication: removed, index });
            return removed;
        }
        return null;
    }
    
    updatePublication(index, publication) {
        if (index >= 0 && index < this.publications.length) {
            const old = this.publications[index];
            this.publications[index] = publication;
            this.notifyObservers('publicationUpdated', { old, new: publication, index });
        }
    }
    
    clearPublications() {
        this.publications = [];
        this.publicationCounter = 0;
        this.notifyObservers('publicationsCleared', {});
    }
    
    incrementPublicationCounter() {
        return ++this.publicationCounter;
    }
    
    // ========================
    // 🎯 GESTION QUALIFICATION
    // ========================
    
    setQualificationData(data) {
        this.qualificationData = data;
        this.notifyObservers('qualificationChanged', data);
    }
    
    getQualificationData() {
        return this.qualificationData;
    }
    
    clearQualificationData() {
        this.setQualificationData(null);
    }
    
    setSelectedOffer(offer) {
        this.selectedOffer = offer;
        this.notifyObservers('offerSelected', offer);
    }
    
    getSelectedOffer() {
        return this.selectedOffer;
    }
    
    // ========================
    // 📱 GESTION UTILISATEUR
    // ========================
    
    setUser(user) {
        this.user = user;
        this.notifyObservers('userChanged', user);
    }
    
    getUser() {
        return this.user;
    }
    
    // ========================
    // ⏱️ GESTION TIMEOUTS
    // ========================
    
    setTimeout(name, callback, delay) {
        // Nettoyer timeout existant
        this.clearTimeout(name);
        
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(name);
            callback();
        }, delay);
        
        this.activeTimeouts.set(name, timeoutId);
        return timeoutId;
    }
    
    clearTimeout(name) {
        const timeoutId = this.activeTimeouts.get(name);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.activeTimeouts.delete(name);
        }
    }
    
    clearAllTimeouts() {
        for (const timeoutId of this.activeTimeouts.values()) {
            clearTimeout(timeoutId);
        }
        this.activeTimeouts.clear();
    }
    
    // ========================
    // 📊 PATTERN OBSERVER
    // ========================
    
    subscribe(event, callback, options = {}) {
        if (!this.observers.has(event)) {
            this.observers.set(event, []);
        }
        
        const observer = {
            callback,
            once: options.once || false,
            id: options.id || Date.now() + Math.random()
        };
        
        this.observers.get(event).push(observer);
        
        console.log(`👁️ Observer ajouté pour "${event}"`);
        return observer.id;
    }
    
    unsubscribe(event, callbackOrId) {
        if (!this.observers.has(event)) return false;
        
        const observers = this.observers.get(event);
        const index = observers.findIndex(obs => 
            obs.callback === callbackOrId || obs.id === callbackOrId
        );
        
        if (index !== -1) {
            observers.splice(index, 1);
            console.log(`👁️ Observer supprimé pour "${event}"`);
            return true;
        }
        
        return false;
    }
    
    notifyObservers(event, data) {
        if (!this.observers.has(event)) return;
        
        const observers = this.observers.get(event);
        const toRemove = [];
        
        observers.forEach((observer, index) => {
            try {
                observer.callback(data);
                
                // Supprimer les observers "once"
                if (observer.once) {
                    toRemove.push(index);
                }
            } catch (error) {
                console.error(`❌ Erreur observer "${event}":`, error);
            }
        });
        
        // Supprimer les observers "once" en ordre inverse
        toRemove.reverse().forEach(index => {
            observers.splice(index, 1);
        });
    }
    
    // ========================
    // 🧹 NETTOYAGE ET RESET
    // ========================
    
    reset() {
        this.currentState = 'main_menu';
        this.stateHistory = [];
        this.selectedEnterprise = null;
        this.currentAction = null;
        this.clearSearchResults();
        this.clearPublications();
        this.clearQualificationData();
        this.selectedOffer = null;
        
        console.log('🔄 AppState réinitialisé');
    }
    
    cleanup() {
        this.clearCache();
        this.clearAllTimeouts();
        this.observers.clear();
        
        console.log('🧹 AppState nettoyé');
    }
    
    // ========================
    // 📊 DIAGNOSTICS
    // ========================
    
    getStateSnapshot() {
        return {
            currentState: this.currentState,
            hasSelectedEnterprise: !!this.selectedEnterprise,
            currentAction: this.currentAction,
            searchResultsCount: this.currentSearchResults.length,
            publicationsCount: this.publications.length,
            hasQualificationData: !!this.qualificationData,
            cacheStats: this.getCacheStats(),
            observersCount: Array.from(this.observers.values())
                .reduce((total, obs) => total + obs.length, 0),
            activeTimeoutsCount: this.activeTimeouts.size
        };
    }
    
    printDiagnostic() {
        console.group('📊 Diagnostic AppState');
        console.table(this.getStateSnapshot());
        console.groupEnd();
    }
}

// 🌍 Instance singleton
let stateInstance = null;

export function getAppState() {
    if (!stateInstance) {
        stateInstance = new AppState();
    }
    return stateInstance;
}

export default getAppState();