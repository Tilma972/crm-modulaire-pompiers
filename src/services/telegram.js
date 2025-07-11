// ================================
// 📁 src/services/telegram.js
// Service pour l'intégration Telegram WebApp
// ================================

import appState from '../core/state.js';

export class TelegramService {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.state = appState;
        this.isInitialized = false;
        this.user = null;
        
        console.log('📱 TelegramService créé');
    }
    
    // ========================
    // 🚀 INITIALISATION
    // ========================
    
    async initialize() {
        try {
            if (!this.tg) {
                console.warn('⚠️ Telegram WebApp non disponible, mode développement');
                this._initializeFallback();
                return;
            }
            
            // Configuration Telegram WebApp
            this.tg.ready();
            this.tg.expand();
            
            // Récupération des données utilisateur
            this.user = this._extractUserData();
            this.state.setUser(this.user);
            
            // Configuration de l'interface
            this._configureTelegramUI();
            
            // Event listeners Telegram
            this._setupTelegramEvents();
            
            this.isInitialized = true;
            
            console.log('✅ Telegram WebApp initialisé:', this.user);
            
        } catch (error) {
            console.error('❌ Erreur initialisation Telegram:', error);
            this._initializeFallback();
        }
    }
    
    _extractUserData() {
        const telegramUser = this.tg.initDataUnsafe?.user;
        
        if (telegramUser) {
            return {
                id: telegramUser.id,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                language_code: telegramUser.language_code,
                is_premium: telegramUser.is_premium || false,
                avatar: telegramUser.first_name?.charAt(0).toUpperCase() || '👤'
            };
        }
        
        return this._getFallbackUser();
    }
    
    _getFallbackUser() {
        return {
            id: 123456789,
            first_name: 'Stève',
            last_name: '',
            username: 'steve_dev',
            language_code: 'fr',
            is_premium: false,
            avatar: 'S'
        };
    }
    
    _initializeFallback() {
        this.user = this._getFallbackUser();
        this.state.setUser(this.user);
        this.isInitialized = true;
        
        console.log('🔧 Mode développement, utilisateur par défaut:', this.user);
    }
    
    // ========================
    // 🎨 CONFIGURATION UI TELEGRAM
    // ========================
    
    _configureTelegramUI() {
        if (!this.tg) return;
        
        try {
            // Couleurs du thème
            const theme = this.tg.themeParams;
            if (theme) {
                this._applyTelegramTheme(theme);
            }
            
            // Configuration des boutons
            this._setupMainButton();
            this._setupBackButton();
            
            // Configuration de la barre de titre
            if (this.tg.setHeaderColor) {
                this.tg.setHeaderColor('#2196F3');
            }
            
        } catch (error) {
            console.warn('⚠️ Erreur configuration UI Telegram:', error);
        }
    }
    
    _applyTelegramTheme(theme) {
        const root = document.documentElement;
        
        // Variables CSS depuis le thème Telegram
        if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
        if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
        if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
        if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
        
        console.log('🎨 Thème Telegram appliqué:', theme);
    }
    
    _setupMainButton() {
        if (!this.tg.MainButton) return;
        
        // Observer les changements d'état pour adapter le bouton principal
        this.state.subscribe('stateChange', (data) => {
            this._updateMainButton(data.new);
        });
        
        this.state.subscribe('enterpriseSelected', (data) => {
            if (data.new) {
                this._showMainButtonForEnterprise();
            } else {
                this._hideMainButton();
            }
        });
    }
    
    _updateMainButton(currentState) {
        if (!this.tg.MainButton) return;
        
        switch (currentState) {
            case 'search':
                this.tg.MainButton.setText('🔍 Rechercher');
                this.tg.MainButton.show();
                break;
                
            case 'action_qualification':
                this.tg.MainButton.setText('💾 Sauvegarder');
                this.tg.MainButton.show();
                break;
                
            case 'action_facture':
            case 'action_bon_commande':
                this.tg.MainButton.setText('📄 Générer');
                this.tg.MainButton.show();
                break;
                
            default:
                this.tg.MainButton.hide();
        }
    }
    
    _showMainButtonForEnterprise() {
        if (!this.tg.MainButton) return;
        
        const action = this.state.getCurrentAction();
        if (action) {
            this.tg.MainButton.setText(`✅ Exécuter ${action}`);
            this.tg.MainButton.show();
        }
    }
    
    _hideMainButton() {
        if (this.tg.MainButton) {
            this.tg.MainButton.hide();
        }
    }
    
    _setupBackButton() {
        if (!this.tg.BackButton) return;
        
        // Observer les changements d'état pour le bouton retour
        this.state.subscribe('stateChange', (data) => {
            if (data.canGoBack && data.new !== 'main_menu') {
                this.tg.BackButton.show();
            } else {
                this.tg.BackButton.hide();
            }
        });
        
        // Handler du bouton retour
        this.tg.BackButton.onClick(() => {
            const previousState = this.state.goBack();
            if (previousState) {
                // Navigation sera gérée par le NavigationComponent
                window.dispatchEvent(new CustomEvent('telegram-back-button', {
                    detail: { previousState }
                }));
            }
        });
    }
    
    // ========================
    // 📱 EVENT LISTENERS TELEGRAM
    // ========================
    
    _setupTelegramEvents() {
        if (!this.tg) return;
        
        // Event du bouton principal
        if (this.tg.MainButton) {
            this.tg.MainButton.onClick(() => {
                this._handleMainButtonClick();
            });
        }
        
        // Events de viewport
        if (this.tg.onEvent) {
            this.tg.onEvent('viewportChanged', (data) => {
                console.log('📱 Viewport changé:', data);
                this._handleViewportChange(data);
            });
            
            this.tg.onEvent('themeChanged', (data) => {
                console.log('🎨 Thème changé:', data);
                this._applyTelegramTheme(data.theme_params);
            });
        }
        
        // Event de fermeture
        window.addEventListener('beforeunload', () => {
            if (this.tg.close) {
                this.tg.close();
            }
        });
    }
    
    _handleMainButtonClick() {
        const currentState = this.state.getState();
        const currentAction = this.state.getCurrentAction();
        
        // Émettre un événement personnalisé pour que les composants réagissent
        window.dispatchEvent(new CustomEvent('telegram-main-button-click', {
            detail: {
                state: currentState,
                action: currentAction,
                enterprise: this.state.getSelectedEnterprise()
            }
        }));
    }
    
    _handleViewportChange(data) {
        // Adapter l'interface selon les changements de viewport
        const event = new CustomEvent('telegram-viewport-change', {
            detail: data
        });
        window.dispatchEvent(event);
    }
    
    // ========================
    // 💬 MESSAGES ET ALERTES
    // ========================
    
    showMessage(message, type = 'info') {
        // Essayer d'utiliser les alertes natives Telegram d'abord
        if (this.tg && this.tg.showAlert && typeof this.tg.showAlert === 'function') {
            try {
                this.tg.showAlert(message);
                return;
            } catch (error) {
                console.warn('⚠️ tg.showAlert non supporté:', error);
            }
        }
        
        // Fallback vers les méthodes standard
        this._showFallbackMessage(message, type);
    }
    
    _showFallbackMessage(message, type) {
        // Mettre à jour le statut
        this.state.setStatus(message, type);
        
        // Log dans la console
        console.log(`📱 Message [${type}]:`, message);
        
        // Alertes pour les erreurs critiques
        if (type === 'error' || message.includes('Erreur') || message.includes('❌')) {
            setTimeout(() => alert(message), 100);
        }
    }
    
    showConfirm(message, callback) {
        if (this.tg && this.tg.showConfirm && typeof this.tg.showConfirm === 'function') {
            try {
                this.tg.showConfirm(message, callback);
                return;
            } catch (error) {
                console.warn('⚠️ tg.showConfirm non supporté:', error);
            }
        }
        
        // Fallback
        const result = confirm(message);
        if (callback) callback(result);
    }
    
    showPopup(params) {
        if (this.tg && this.tg.showPopup && typeof this.tg.showPopup === 'function') {
            try {
                this.tg.showPopup(params);
                return;
            } catch (error) {
                console.warn('⚠️ tg.showPopup non supporté:', error);
            }
        }
        
        // Fallback simple
        this.showMessage(params.message || 'Information', 'info');
    }
    
    // ========================
    // 🔗 HAPTIC FEEDBACK
    // ========================
    
    hapticFeedback(type = 'impact') {
        if (this.tg && this.tg.HapticFeedback) {
            try {
                switch (type) {
                    case 'light':
                        this.tg.HapticFeedback.impactOccurred('light');
                        break;
                    case 'medium':
                        this.tg.HapticFeedback.impactOccurred('medium');
                        break;
                    case 'heavy':
                        this.tg.HapticFeedback.impactOccurred('heavy');
                        break;
                    case 'success':
                        this.tg.HapticFeedback.notificationOccurred('success');
                        break;
                    case 'warning':
                        this.tg.HapticFeedback.notificationOccurred('warning');
                        break;
                    case 'error':
                        this.tg.HapticFeedback.notificationOccurred('error');
                        break;
                    default:
                        this.tg.HapticFeedback.impactOccurred('light');
                }
            } catch (error) {
                console.warn('⚠️ Haptic feedback non supporté:', error);
            }
        }
    }
    
    // ========================
    // 📊 DONNÉES ET UTILITAIRES
    // ========================
    
    getUser() {
        return this.user;
    }
    
    isReady() {
        return this.isInitialized;
    }
    
    getVersion() {
        return this.tg?.version || 'Non disponible';
    }
    
    getPlatform() {
        return this.tg?.platform || 'unknown';
    }
    
    getViewportHeight() {
        return this.tg?.viewportHeight || window.innerHeight;
    }
    
    getViewportStableHeight() {
        return this.tg?.viewportStableHeight || window.innerHeight;
    }
    
    isExpanded() {
        return this.tg?.isExpanded || false;
    }
    
    getThemeParams() {
        return this.tg?.themeParams || {};
    }
    
    // ========================
    // 🧪 MÉTHODES DE TEST
    // ========================
    
    testTelegramFeatures() {
        const features = {
            webApp: !!this.tg,
            version: this.getVersion(),
            platform: this.getPlatform(),
            user: !!this.user,
            mainButton: !!(this.tg && this.tg.MainButton),
            backButton: !!(this.tg && this.tg.BackButton),
            hapticFeedback: !!(this.tg && this.tg.HapticFeedback),
            showAlert: !!(this.tg && this.tg.showAlert),
            showConfirm: !!(this.tg && this.tg.showConfirm),
            showPopup: !!(this.tg && this.tg.showPopup),
            themeParams: !!(this.tg && this.tg.themeParams)
        };
        
        console.group('📱 Test Telegram WebApp Features');
        console.table(features);
        console.groupEnd();
        
        return features;
    }
    
    // ========================
    // 🧹 NETTOYAGE
    // ========================
    
    cleanup() {
        if (this.tg) {
            try {
                if (this.tg.MainButton) this.tg.MainButton.hide();
                if (this.tg.BackButton) this.tg.BackButton.hide();
            } catch (error) {
                console.warn('⚠️ Erreur nettoyage Telegram:', error);
            }
        }
    }
}

// ========================
// 🌍 INSTANCE SINGLETON
// ========================

let telegramInstance = null;

export function getTelegramService() {
    if (!telegramInstance) {
        telegramInstance = new TelegramService();
    }
    return telegramInstance;
}

// ========================
// 🔧 FONCTIONS UTILITAIRES GLOBALES
// ========================

export function showTelegramMessage(message, type = 'info') {
    const telegram = getTelegramService();
    telegram.showMessage(message, type);
}

export function getTelegramUser() {
    const telegram = getTelegramService();
    return telegram.getUser();
}

export function hapticFeedback(type = 'light') {
    const telegram = getTelegramService();
    telegram.hapticFeedback(type);
}

export default getTelegramService();