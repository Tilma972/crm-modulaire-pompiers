// src/features/stats.js - Statistiques renouvellement 2026
// Version modulaire - Compatible avec architecture existante

import { config } from '../core/config.js';
import { state } from '../core/state.js';
import { apiService } from '../services/api.js';
import { telegramService } from '../services/telegram.js';

class StatsManager {
    constructor() {
        this.currentStats = null;
        this.chartInstance = null;
        this.isLoading = false;
        
        console.log('📊 StatsManager initialisé');
    }

    // Singleton pattern - comme les autres modules
    static getInstance() {
        if (!StatsManager.instance) {
            StatsManager.instance = new StatsManager();
        }
        return StatsManager.instance;
    }

    // ========================================================================
    // INTERFACE PRINCIPALE
    // ========================================================================

    getStatsContent() {
        return `
            <div class="stats-section">
                <h3>📊 Tableau de bord Renouvellement 2026</h3>
                
                <!-- MÉTRIQUES PRINCIPALES -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value" id="totalPartenaires2025">--</div>
                        <div class="metric-label">Partenaires 2025</div>
                    </div>
                    <div class="metric-card success">
                        <div class="metric-value" id="dejaRenouveles">--</div>
                        <div class="metric-label">Déjà renouvelés</div>
                    </div>
                    <div class="metric-card warning">
                        <div class="metric-value" id="enAttente">--</div>
                        <div class="metric-label">En attente</div>
                    </div>
                    <div class="metric-card info">
                        <div class="metric-value" id="tauxRenouvellement">--%</div>
                        <div class="metric-label">Taux renouvellement</div>
                    </div>
                </div>
                
                <!-- ACTIONS RAPIDES -->
                <div class="actions-section">
                    <h4>⚡ Actions rapides</h4>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="statsManager.lancerCampagneRenouvellement()">
                            📧 Lancer campagne renouvellement
                        </button>
                        <button class="btn btn-secondary" onclick="statsManager.exporterListeEnAttente()">
                            📥 Exporter liste en attente
                        </button>
                        <button class="btn btn-info" onclick="statsManager.actualiserStats()">
                            🔄 Actualiser les données
                        </button>
                    </div>
                </div>
                
                <!-- GRAPHIQUE ÉVOLUTION -->
                <div class="chart-section">
                    <h4>📈 Évolution des renouvellements</h4>
                    <div id="statsChart" class="chart-container">
                        <canvas id="renewalChart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <!-- RÉPARTITION PAR COMMUNE -->
                <div class="breakdown-section">
                    <h4>🗺️ Répartition par commune</h4>
                    <div id="communeBreakdown" class="commune-list">
                        Chargement...
                    </div>
                </div>
                
                <!-- ACTIONS RECOMMANDÉES -->
                <div class="recommendations-section">
                    <h4>💡 Actions recommandées</h4>
                    <div id="recommendedActions" class="recommendations-list">
                        Analyse en cours...
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================================================
    // CHARGEMENT DONNÉES API
    // ========================================================================

    async chargerStatsRenouvellement() {
        if (this.isLoading) {
            console.log('📊 Chargement déjà en cours...');
            return;
        }

        this.isLoading = true;
        this.updateStatus('🔄 Chargement des statistiques...');

        try {
            console.log('📊 Chargement stats renouvellement 2026...');
            
            // Utilisation du service API centralisé
            const response = await apiService.request('stats_renouvellement_2026', {});
            
            if (!response || response.error) {
                throw new Error(response?.error || 'Erreur lors du chargement des statistiques');
            }

            const statsData = response.data || response;
            console.log('📊 Données reçues:', statsData);

            // Validation des données
            if (!statsData || typeof statsData !== 'object') {
                throw new Error('Données statistiques invalides');
            }

            // Stockage dans l'état global
            this.currentStats = statsData;
            state.updateData('currentStats', statsData);
            
            // Mise à jour de l'interface
            this.updateMetricsDisplay(statsData);
            this.generateChart(statsData);
            this.displayCommuneBreakdown(statsData);
            this.displayRecommendedActions(statsData);
            
            this.updateStatus('✅ Statistiques chargées avec succès');
            telegramService.showHapticFeedback('success');
            
        } catch (error) {
            console.error('❌ Erreur chargement stats:', error);
            this.updateStatus('❌ Erreur chargement statistiques');
            this.showMessage(`Erreur: ${error.message}`, 'error');
            telegramService.showHapticFeedback('error');
            
            // Affichage de données factices pour le développement
            this.displayErrorFallback();
        } finally {
            this.isLoading = false;
        }
    }

    // ========================================================================
    // MISE À JOUR INTERFACE
    // ========================================================================

    updateMetricsDisplay(stats) {
        console.log('📊 Mise à jour métriques:', stats);
        
        try {
            // Extraction sécurisée des valeurs
            const totalPartenaires = parseInt(stats.total_partenaires_2025) || 0;
            const dejaRenouveles = parseInt(stats.deja_renouveles) || 0;
            const enAttente = parseInt(stats.en_attente) || 0;
            const tauxRenouvellement = parseFloat(stats.taux_renouvellement) || 0;
            
            // Mise à jour sécurisée des éléments DOM
            this.updateElementSafely('totalPartenaires2025', this.formatNumber(totalPartenaires));
            this.updateElementSafely('dejaRenouveles', this.formatNumber(dejaRenouveles));
            this.updateElementSafely('enAttente', this.formatNumber(enAttente));
            this.updateElementSafely('tauxRenouvellement', this.formatPercentage(tauxRenouvellement));
            
            console.log('📊 Métriques mises à jour');
            
        } catch (error) {
            console.error('❌ Erreur mise à jour métriques:', error);
        }
    }

    generateChart(stats) {
        try {
            const canvas = document.getElementById('renewalChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            
            // Nettoyage du canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Données pour le graphique
            const totalPartenaires = parseInt(stats.total_partenaires_2025) || 0;
            const dejaRenouveles = parseInt(stats.deja_renouveles) || 0;
            const enAttente = parseInt(stats.en_attente) || 0;
            
            if (totalPartenaires === 0) return;
            
            // Graphique en secteurs simple
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 80;
            
            const angleRenouveles = (dejaRenouveles / totalPartenaires) * 2 * Math.PI;
            const angleEnAttente = (enAttente / totalPartenaires) * 2 * Math.PI;
            
            // Secteur renouvelés (vert)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, angleRenouveles);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = '#28a745';
            ctx.fill();
            
            // Secteur en attente (orange)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, angleRenouveles, angleRenouveles + angleEnAttente);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = '#ffc107';
            ctx.fill();
            
            // Légende simple
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`Renouvelés: ${dejaRenouveles}`, 10, 20);
            ctx.fillText(`En attente: ${enAttente}`, 10, 40);
            
        } catch (error) {
            console.error('❌ Erreur génération graphique:', error);
        }
    }

    displayCommuneBreakdown(stats) {
        const container = document.getElementById('communeBreakdown');
        if (!container) return;

        try {
            const communes = stats.repartition_communes || [];
            
            if (communes.length === 0) {
                container.innerHTML = '<p class="text-muted">Aucune donnée par commune disponible</p>';
                return;
            }

            let html = '<div class="commune-grid">';
            communes.forEach(commune => {
                const taux = commune.taux_renouvellement || 0;
                const statusClass = taux > 70 ? 'success' : taux > 50 ? 'warning' : 'danger';
                
                html += `
                    <div class="commune-card ${statusClass}">
                        <div class="commune-name">${commune.nom}</div>
                        <div class="commune-stats">
                            <span class="total">${commune.total || 0}</span>
                            <span class="renewed">${commune.renouveles || 0}</span>
                            <span class="rate">${this.formatPercentage(taux)}</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Erreur affichage communes:', error);
            container.innerHTML = '<p class="text-danger">Erreur affichage données communes</p>';
        }
    }

    displayRecommendedActions(stats) {
        const container = document.getElementById('recommendedActions');
        if (!container) return;

        try {
            const totalPartenaires = parseInt(stats.total_partenaires_2025) || 0;
            const dejaRenouveles = parseInt(stats.deja_renouveles) || 0;
            const enAttente = parseInt(stats.en_attente) || 0;
            const tauxRenouvellement = (dejaRenouveles / totalPartenaires) * 100;
            
            let actions = [];
            
            if (tauxRenouvellement < 50) {
                actions.push({
                    icon: '🚨',
                    title: 'Taux critique - Action urgente',
                    description: 'Lancer immédiatement une campagne de relance personnalisée',
                    priority: 'high'
                });
            }
            
            if (enAttente > 20) {
                actions.push({
                    icon: '📞',
                    title: 'Relances téléphoniques',
                    description: `${enAttente} partenaires en attente nécessitent un contact direct`,
                    priority: 'medium'
                });
            }
            
            if (tauxRenouvellement > 80) {
                actions.push({
                    icon: '🎯',
                    title: 'Optimisation des offres',
                    description: 'Excellent taux! Analyser les meilleures pratiques pour les reproduire',
                    priority: 'low'
                });
            }
            
            if (actions.length === 0) {
                actions.push({
                    icon: '✅',
                    title: 'Situation stable',
                    description: 'Continuer le suivi régulier des renouvellements',
                    priority: 'low'
                });
            }
            
            let html = '<div class="recommendations-list">';
            actions.forEach(action => {
                html += `
                    <div class="recommendation-item priority-${action.priority}">
                        <div class="rec-icon">${action.icon}</div>
                        <div class="rec-content">
                            <div class="rec-title">${action.title}</div>
                            <div class="rec-description">${action.description}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Erreur affichage recommandations:', error);
            container.innerHTML = '<p class="text-danger">Erreur génération recommandations</p>';
        }
    }

    // ========================================================================
    // ACTIONS MÉTIER
    // ========================================================================

    async lancerCampagneRenouvellement() {
        if (!this.currentStats) {
            this.showMessage('Veuillez d\'abord charger les statistiques', 'warning');
            return;
        }

        try {
            this.updateStatus('📧 Lancement campagne en cours...');
            telegramService.showHapticFeedback('impact');

            const response = await apiService.request('lancer_campagne_renouvellement', {
                type: 'email_automatique',
                cible: 'en_attente',
                template: 'renouvellement_2026'
            });

            if (response && !response.error) {
                this.showMessage('✅ Campagne de renouvellement lancée avec succès!', 'success');
                telegramService.showHapticFeedback('success');
                
                // Rafraîchir les stats après l'action
                setTimeout(() => this.chargerStatsRenouvellement(), 2000);
            } else {
                throw new Error(response?.error || 'Erreur lors du lancement de la campagne');
            }

        } catch (error) {
            console.error('❌ Erreur campagne:', error);
            this.showMessage(`Erreur: ${error.message}`, 'error');
            telegramService.showHapticFeedback('error');
        }
    }

    async exporterListeEnAttente() {
        if (!this.currentStats) {
            this.showMessage('Veuillez d\'abord charger les statistiques', 'warning');
            return;
        }

        try {
            this.updateStatus('📥 Export en cours...');
            telegramService.showHapticFeedback('impact');

            const response = await apiService.request('exporter_liste_en_attente', {
                format: 'excel',
                filtres: {
                    statut: 'en_attente',
                    annee: 2025
                }
            });

            if (response && response.download_url) {
                // Créer un lien de téléchargement temporaire
                const link = document.createElement('a');
                link.href = response.download_url;
                link.download = `partenaires_en_attente_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                this.showMessage('✅ Export réalisé avec succès!', 'success');
                telegramService.showHapticFeedback('success');
            } else {
                throw new Error('URL de téléchargement non disponible');
            }

        } catch (error) {
            console.error('❌ Erreur export:', error);
            this.showMessage(`Erreur export: ${error.message}`, 'error');
            telegramService.showHapticFeedback('error');
        }
    }

    async actualiserStats() {
        await this.chargerStatsRenouvellement();
    }

    // ========================================================================
    // GESTION ERREURS ET FALLBACK
    // ========================================================================

    displayErrorFallback() {
        console.log('📊 Affichage données factices pour développement');
        
        const mockStats = {
            total_partenaires_2025: 150,
            deja_renouveles: 89,
            en_attente: 45,
            taux_renouvellement: 59.3,
            repartition_communes: [
                { nom: 'Amboise', total: 25, renouveles: 18, taux_renouvellement: 72 },
                { nom: 'Tours', total: 45, renouveles: 28, taux_renouvellement: 62 },
                { nom: 'Blois', total: 30, renouveles: 15, taux_renouvellement: 50 },
                { nom: 'Chinon', total: 20, renouveles: 12, taux_renouvellement: 60 },
                { nom: 'Loches', total: 18, renouveles: 11, taux_renouvellement: 61 },
                { nom: 'Montargis', total: 12, renouveles: 5, taux_renouvellement: 42 }
            ]
        };

        this.currentStats = mockStats;
        this.updateMetricsDisplay(mockStats);
        this.generateChart(mockStats);
        this.displayCommuneBreakdown(mockStats);
        this.displayRecommendedActions(mockStats);
        
        this.updateStatus('⚠️ Mode développement - Données factices');
    }

    // ========================================================================
    // UTILITAIRES
    // ========================================================================

    updateElementSafely(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`❌ Élément ${elementId} non trouvé`);
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    formatPercentage(num) {
        return `${Math.round(num * 100) / 100}%`;
    }

    updateStatus(message) {
        console.log(`📊 Status: ${message}`);
        state.updateData('currentStatus', message);
        
        // Notification Telegram si disponible
        telegramService.updateMainButton(message, false);
    }

    showMessage(message, type = 'info') {
        console.log(`📊 Message (${type}): ${message}`);
        
        // Utilisation du système de notification de l'état global
        state.updateData('lastMessage', { text: message, type, timestamp: Date.now() });
        
        // Affichage temporaire dans le DOM si possible
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            setTimeout(() => {
                if (statusElement.innerHTML.includes(message)) {
                    statusElement.innerHTML = '';
                }
            }, 5000);
        }
    }
}

// ========================================================================
// INITIALISATION ET EXPORT
// ========================================================================

// Instance singleton
const statsManager = StatsManager.getInstance();

// Export pour utilisation dans d'autres modules
export { statsManager, StatsManager };

// Exposition globale pour compatibilité onclick
window.statsManager = statsManager;

// Export par défaut
export default statsManager;

console.log('📊 Module stats.js chargé - Statistiques renouvellement 2026 prêtes');