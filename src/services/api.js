// ================================
// 📁 src/services/api.js
// Service API centralisé pour tous les appels vers N8N
// ================================

import config from '../core/config.js';
import appState from '../core/state.js';

export class ApiService {
    constructor() {
        this.config = config;
        this.state = appState;
        this.defaultTimeout = this.config.ui.timeouts.API_TIMEOUT;
        this.retryDelay = this.config.ui.timeouts.RETRY_DELAY;
        this.maxRetries = 3;
        
        console.log('🌐 ApiService initialisé');
    }
    
    // ========================
    // 🔧 MÉTHODE PRINCIPALE D'APPEL API
    // ========================
    
    async call(webhookName, data, options = {}) {
        const url = this.config.getWebhookUrl(webhookName);
        const timeout = options.timeout || this.defaultTimeout;
        const retries = options.retries !== undefined ? options.retries : this.maxRetries;
        
        let lastError;
        
        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                console.log(`📤 API ${webhookName} (tentative ${attempt}):`, { url, data });
                
                const result = await this._makeRequest(url, data, timeout);
                
                console.log(`📥 API ${webhookName} succès:`, result);
                return result;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ API ${webhookName} échec tentative ${attempt}:`, error.message);
                
                // Si c'est la dernière tentative ou une erreur non-retry-able
                if (attempt > retries || !this._shouldRetry(error)) {
                    break;
                }
                
                // Attendre avant la prochaine tentative
                await this._delay(this.retryDelay * attempt);
            }
        }
        
        console.error(`❌ API ${webhookName} échec final:`, lastError);
        throw lastError;
    }
    
    async _makeRequest(url, data, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            // Validation de base de la réponse
            if (result.success === false && result.error) {
                throw new Error(result.error.message || result.error);
            }
            
            return result;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`Timeout après ${timeout}ms`);
            }
            
            throw error;
        }
    }
    
    _shouldRetry(error) {
        // Retry pour les erreurs réseau, timeouts, et erreurs serveur 5xx
        return error.message.includes('Timeout') ||
               error.message.includes('fetch') ||
               error.message.includes('network') ||
               (error.message.includes('HTTP 5'));
    }
    
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ========================
    // 🔍 API RECHERCHE ENTREPRISES
    // ========================
    
    async searchEnterprises(query, options = {}) {
        const cacheKey = this.config.createCacheKey('search', { query });
        
        // Vérifier le cache d'abord
        if (!options.forceRefresh) {
            const cached = this.state.getCacheItem(cacheKey);
            if (cached) {
                console.log('💾 Résultats depuis cache pour:', query);
                return cached;
            }
        }
        
        try {
            this.state.setLoadingStatus(`Recherche "${query}"...`);
            
            const result = await this.call('ENTERPRISE_API', {
                action: 'search',
                query: query.trim(),
                limit: options.limit || this.config.ui.limits.MAX_SEARCH_RESULTS
            });
            
            // Valider et nettoyer les résultats
            const enterprises = this._validateSearchResults(result);
            
            // Mettre en cache
            this.state.setCacheItem(cacheKey, enterprises, this.config.ui.limits.CACHE_TTL);
            
            this.state.setSuccessStatus(`${enterprises.length} entreprise(s) trouvée(s)`);
            
            return enterprises;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur recherche: ${error.message}`);
            throw error;
        }
    }
    
    _validateSearchResults(result) {
        if (!result || !Array.isArray(result.data)) {
            throw new Error('Format de réponse invalide');
        }
        
        return result.data.map(enterprise => ({
            ...enterprise,
            // Normalisation des champs
            nom_entreprise: enterprise.nom_entreprise || enterprise.nom || 'Nom manquant',
            commune: enterprise.commune || enterprise.ville || '',
            telephone: enterprise.telephone || enterprise.tel || '',
            adresse: enterprise.adresse || enterprise.address || '',
            // Préserver les données originales pour l'auto-remplissage
            _original: enterprise
        }));
    }
    
    // ========================
    // 🎯 API QUALIFICATIONS
    // ========================
    
    async createQualification(qualificationData) {
        try {
            this.state.setLoadingStatus('Création qualification...');
            
            const payload = {
                action: 'qualification',
                data: {
                    ...qualificationData,
                    user_id: this.state.getUser()?.id,
                    timestamp: new Date().toISOString()
                }
            };
            
            const result = await this.call('GATEWAY_ENTITIES', payload);
            
            this.state.setSuccessStatus('Qualification créée avec succès');
            
            // Sauvegarder dans l'état
            this.state.setQualificationData(result.data || qualificationData);
            
            return result;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur création qualification: ${error.message}`);
            throw error;
        }
    }
    
    async searchQualifications(enterpriseId) {
        try {
            const cacheKey = this.config.createCacheKey('qualification', { enterpriseId });
            const cached = this.state.getCacheItem(cacheKey);
            
            if (cached) {
                return cached;
            }
            
            const result = await this.call('QUALIFICATION_API', {
                action: 'search',
                enterprise_id: enterpriseId
            });
            
            const qualifications = result.data || [];
            
            // Cache pour 5 minutes
            this.state.setCacheItem(cacheKey, qualifications, 300000);
            
            return qualifications;
            
        } catch (error) {
            console.warn('⚠️ Erreur recherche qualifications:', error);
            return []; // Retourner tableau vide en cas d'erreur
        }
    }
    
    // ========================
    // 📄 API GÉNÉRATION DOCUMENTS
    // ========================
    
    async generateDocument(documentData, documentType) {
        try {
            this.state.setLoadingStatus(`Génération ${this.config.getActionLabel(documentType)}...`);
            
            const payload = {
                action: documentType,
                data: {
                    ...documentData,
                    document_type: documentType,
                    numero_document: this.config.generateDocumentNumber(documentType),
                    user_id: this.state.getUser()?.id,
                    timestamp: new Date().toISOString()
                }
            };
            
            const result = await this.call('GATEWAY_ENTITIES', payload);
            
            this.state.setSuccessStatus(`${this.config.getActionLabel(documentType)} généré`);
            
            return result;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur génération: ${error.message}`);
            throw error;
        }
    }
    
    async generateFromQualification(qualification, documentType) {
        // Transformer les données de qualification en données de document
        const documentData = this._transformQualificationToDocument(qualification, documentType);
        return this.generateDocument(documentData, documentType);
    }
    
    _transformQualificationToDocument(qualification, documentType) {
        const baseData = {
            enterprise_id: qualification.enterprise_id,
            enterprise_name: qualification.enterprise_name,
            enterprise_adresse: qualification.enterprise_adresse,
            enterprise_commune: qualification.enterprise_commune,
            enterprise_telephone: qualification.enterprise_telephone,
            
            interlocuteur: qualification.interlocuteur,
            email_contact: qualification.email_contact,
            telephone_contact: qualification.telephone_contact,
            mode_paiement: qualification.mode_paiement
        };
        
        // Transformation spécifique selon le type de document
        if (qualification.publications && qualification.publications.length > 1) {
            // Publications multiples
            const publicationsPayantes = qualification.publications.filter(p => p.type === 'payant');
            const publicationsOffertes = qualification.publications.filter(p => p.type === 'offert');
            
            return {
                ...baseData,
                document_type: documentType,
                is_multi_publications: true,
                
                publications: qualification.publications,
                description_ligne1: `${publicationsPayantes.length} insertion(s) publicitaire(s) - Calendrier 2026`,
                description_ligne2: publicationsOffertes.length > 0 ? 
                    `+ ${publicationsOffertes.length} parution(s) offerte(s)` : null,
                
                montant_payant: qualification.prix_total,
                montant_offert: qualification.montant_offert || 0,
                has_free_publications: publicationsOffertes.length > 0,
                total_publications: qualification.publications.length
            };
        } else {
            // Publication simple
            const publication = qualification.publications[0];
            
            return {
                ...baseData,
                document_type: documentType,
                is_multi_publications: false,
                
                format_encart: publication.format,
                mois_parution: publication.mois,
                prix_unitaire: publication.prix,
                description_ligne1: `Insertion publicitaire ${publication.format} - ${publication.mois} 2026`,
                
                montant_payant: publication.prix,
                montant_offert: 0,
                has_free_publications: false,
                total_publications: 1
            };
        }
    }
    
    // ========================
    // 📊 API STATISTIQUES
    // ========================
    
    async getStats(statsType = 'renouvellement') {
        try {
            const cacheKey = this.config.createCacheKey('stats', { type: statsType });
            const cached = this.state.getCacheItem(cacheKey);
            
            if (cached) {
                return cached;
            }
            
            this.state.setLoadingStatus('Chargement statistiques...');
            
            const result = await this.call('GATEWAY_ENTITIES', {
                action: 'stats',
                type: statsType
            });
            
            // Cache pour 10 minutes
            this.state.setCacheItem(cacheKey, result.data, 600000);
            
            this.state.setSuccessStatus('Statistiques chargées');
            
            return result.data;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur statistiques: ${error.message}`);
            throw error;
        }
    }
    
    // ========================
    // 📧 API EMAIL
    // ========================
    
    async sendDocumentByEmail(documentData, emailOptions) {
        try {
            this.state.setLoadingStatus('Envoi email...');
            
            const payload = {
                action: 'send_email',
                document: documentData,
                email: emailOptions,
                user_id: this.state.getUser()?.id
            };
            
            const result = await this.call('EMAIL_WORKFLOW', payload);
            
            this.state.setSuccessStatus('Email envoyé avec succès');
            
            return result;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur envoi email: ${error.message}`);
            throw error;
        }
    }
    
    // ========================
    // 🏢 API NOUVELLE ENTREPRISE
    // ========================
    
    async createEnterprise(enterpriseData) {
        try {
            this.state.setLoadingStatus('Création entreprise...');
            
            const payload = {
                action: 'create_enterprise',
                data: {
                    ...enterpriseData,
                    created_by: this.state.getUser()?.id,
                    created_at: new Date().toISOString()
                }
            };
            
            const result = await this.call('FORM_ENTREPRISE', payload);
            
            this.state.setSuccessStatus('Entreprise créée avec succès');
            
            // Invalider le cache de recherche
            this.state.clearCache();
            
            return result;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur création entreprise: ${error.message}`);
            throw error;
        }
    }
    
    // ========================
    // 🤖 API AGENT IA
    // ========================
    
    async callAgentOrchestrator(query) {
        try {
            this.state.setLoadingStatus('Analyse IA en cours...');
            
            const payload = {
                query: query,
                context: {
                    selected_enterprise: this.state.getSelectedEnterprise(),
                    current_action: this.state.getCurrentAction(),
                    publications: this.state.getPublications(),
                    user: this.state.getUser()
                }
            };
            
            const result = await this.call('AGENT_CRM', payload);
            
            this.state.setSuccessStatus('Analyse IA terminée');
            
            return result;
            
        } catch (error) {
            this.state.setErrorStatus(`Erreur analyse IA: ${error.message}`);
            throw error;
        }
    }
    
    // ========================
    // 🔧 UTILITAIRES API
    // ========================
    
    async healthCheck() {
        const results = {};
        
        for (const [name, url] of Object.entries(this.config.webhooks)) {
            try {
                const start = Date.now();
                await fetch(url, { method: 'HEAD' });
                results[name] = {
                    status: 'ok',
                    responseTime: Date.now() - start
                };
            } catch (error) {
                results[name] = {
                    status: 'error',
                    error: error.message
                };
            }
        }
        
        return results;
    }
    
    getApiStats() {
        return {
            cacheStats: this.state.getCacheStats(),
            configuration: {
                timeout: this.defaultTimeout,
                retries: this.maxRetries,
                retryDelay: this.retryDelay
            }
        };
    }
    
    // ========================
    // 🧪 MÉTHODES DE TEST
    // ========================
    
    async testConnection() {
        try {
            const result = await this.call('ENTERPRISE_API', {
                action: 'test',
                timestamp: new Date().toISOString()
            }, { retries: 1, timeout: 5000 });
            
            console.log('✅ Test connexion API réussi:', result);
            return true;
        } catch (error) {
            console.error('❌ Test connexion API échoué:', error);
            return false;
        }
    }
}

// ========================
// 🌍 INSTANCE SINGLETON
// ========================

let apiInstance = null;

export function getApiService() {
    if (!apiInstance) {
        apiInstance = new ApiService();
    }
    return apiInstance;
}

export default getApiService();