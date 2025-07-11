// ================================
// 📁 src/core/config.js
// Configuration centralisée de l'application CRM
// ================================

export class AppConfig {
    constructor() {
        // 🌐 Configuration des webhooks N8N
        this.webhooks = {
            AGENT_CRM: 'https://n8n.dsolution-ia.fr/webhook/crm_agent',
            ENTERPRISE_API: 'https://n8n.dsolution-ia.fr/webhook/recherche_entreprise',
            GATEWAY_ENTITIES: 'https://n8n.dsolution-ia.fr/webhook/gateway_entities'            
        };
        
        // 🎨 Configuration de l'interface utilisateur
        this.ui = {
            elements: {
                MAIN_MENU: 'mainMenu',
                SEARCH_INTERFACE: 'searchInterface',
                CONVERSATION_STATE: 'conversationState',
                SEARCH_INPUT: 'searchInput',
                SEARCH_RESULTS: 'searchResults',
                STATE_TITLE: 'stateTitle',
                STATE_CONTENT: 'stateContent',
                STATUS_TEXT: 'statusText',
                USER_NAME: 'userName',
                USER_AVATAR: 'userAvatar'
            },
            
            timeouts: {
                SEARCH_DELAY: 300,
                API_TIMEOUT: 10000,
                RETRY_DELAY: 1000
            },
            
            limits: {
                SEARCH_MIN_LENGTH: 2,
                MAX_SEARCH_RESULTS: 20,
                CACHE_TTL: 300000 // 5 minutes
            }
        };
        
        // 🎯 Configuration des actions disponibles
        this.actions = {
            FACTURE: 'facture',
            BON_COMMANDE: 'bon_commande',
            FORMULAIRE: 'formulaire',
            STATS: 'stats',
            NOUVELLE_ENTREPRISE: 'nouvelle_entreprise',
            QUALIFICATION: 'qualification',
            ATTRIBUTION: 'attribution',
            INTELLIGENCE: 'intelligence'
        };
        
        // 📋 Configuration des formats et tarifs
        this.formats = {
            // Mapping des ID Baserow vers formats affichage
            mapping: {
                2984058: '6X4',
                2984059: '6X8',
                2984060: '12X4'
            },
            
            // Prix par format
            prices: {
                '6X4': 350,
                '6X8': 500,
                '12X4': 500,
                'SPECIAL': 0
            },
            
            // Labels d'affichage
            labels: {
                '6X4': '6X4 - 350€',
                '6X8': '6X8 - 500€',
                '12X4': '12X4 - 500€',
                'SPECIAL': 'Format spécial (prix à définir)'
            }
        };
        
        // 💳 Configuration des modes de paiement
        this.payments = {
            mapping: {
                2984072: 'Cheque',
                2984073: 'Virement'
            },
            
            options: [
                { value: 'Virement', label: 'Virement bancaire' },
                { value: 'Cheque', label: 'Chèque' },
                { value: 'Carte', label: 'Carte bancaire' },
                { value: 'Especes', label: 'Espèces' }
            ]
        };
        
        // 📅 Configuration des mois de parution
        this.months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        // 🎁 Configuration du système d'offres
        this.offers = {
            types: {
                THREE_PLUS_ONE: '3plus1',
                LOYALTY: 'fidelite',
                MIXED_FORMATS: 'mixte'
            },
            
            conditions: {
                min_publications_for_free: 3,
                loyalty_discount_rate: 0.1,
                mixed_formats_saving: 50
            }
        };
        
        // 📊 Configuration des statistiques
        this.stats = {
            metrics: [
                'totalPartenaires2025',
                'dejaRenouveles', 
                'enAttente',
                'tauxRenouvellement'
            ],
            
            chartColors: {
                renewed: '#28a745',
                pending: '#ffc107',
                new: '#007bff'
            }
        };
    }
    
    // ========================
    // 🔧 MÉTHODES D'ACCÈS
    // ========================
    
    getWebhookUrl(name) {
        const url = this.webhooks[name];
        if (!url) {
            throw new Error(`Webhook ${name} non configuré`);
        }
        return url;
    }
    
    getElementId(name) {
        const id = this.ui.elements[name];
        if (!id) {
            throw new Error(`Element UI ${name} non configuré`);
        }
        return id;
    }
    
    getFormatPrice(format) {
        return this.formats.prices[format] || 350;
    }
    
    getFormatLabel(format) {
        return this.formats.labels[format] || format;
    }
    
    mapBaserowFormat(baserowId) {
        return this.formats.mapping[baserowId] || '6X4';
    }
    
    mapBaserowPayment(baserowId) {
        return this.payments.mapping[baserowId] || 'Virement';
    }
    
    getActionLabel(actionType) {
        const labels = {
            [this.actions.FACTURE]: '📄 Génération Facture',
            [this.actions.BON_COMMANDE]: '📋 Bon de Commande',
            [this.actions.FORMULAIRE]: '📝 Envoi Formulaire',
            [this.actions.STATS]: '📊 Statistiques Express',
            [this.actions.NOUVELLE_ENTREPRISE]: '➕ Nouvelle Entreprise',
            [this.actions.QUALIFICATION]: '🎯 Qualification Prospect',
            [this.actions.ATTRIBUTION]: '👤 Attribution Prospecteur',
            [this.actions.INTELLIGENCE]: '🧠 Intelligence IA'
        };
        return labels[actionType] || actionType;
    }
    
    getMonthOptions() {
        return this.months.map(month => ({
            value: month,
            label: `${month} 2026`
        }));
    }
    
    getFormatOptions() {
        return Object.entries(this.formats.labels).map(([value, label]) => ({
            value,
            label
        }));
    }
    
    getPaymentOptions() {
        return this.payments.options;
    }
    
    // ========================
    // 🎯 VALIDATION
    // ========================
    
    isValidAction(actionType) {
        return Object.values(this.actions).includes(actionType);
    }
    
    isValidFormat(format) {
        return Object.keys(this.formats.prices).includes(format);
    }
    
    isValidPaymentMode(mode) {
        return this.payments.options.some(option => option.value === mode);
    }
    
    // ========================
    // 🔧 UTILITAIRES
    // ========================
    
    generateDocumentNumber(type) {
        const prefix = type === 'facture' ? 'FA' : 'BC';
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = String(date.getTime()).slice(-6);
        
        return `${prefix}-${year}-${month}${day}-${time}`;
    }
    
    createCacheKey(prefix, params) {
        return `${prefix}_${JSON.stringify(params)}`;
    }
    
    // ========================
    // 📊 CONFIGURATION AVANCÉE
    // ========================
    
    getOfferConditions() {
        return this.offers.conditions;
    }
    
    getStatsConfig() {
        return this.stats;
    }
    
    getSearchConfig() {
        return {
            minLength: this.ui.limits.SEARCH_MIN_LENGTH,
            maxResults: this.ui.limits.MAX_SEARCH_RESULTS,
            delay: this.ui.timeouts.SEARCH_DELAY,
            cacheTTL: this.ui.limits.CACHE_TTL
        };
    }
    
    // ========================
    // 🌍 SINGLETON PATTERN
    // ========================
    
    static getInstance() {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }
}

// 🌍 Export par défaut de l'instance singleton
export default AppConfig.getInstance();