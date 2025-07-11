// ================================
// 📁 src/features/qualification.js
// Logique de qualification prospects complète
// ================================

import config from '../core/config.js';
import appState from '../core/state.js';
import apiService from '../services/api.js';

export class QualificationFeature {
    constructor() {
        this.config = config;
        this.state = appState;
        this.api = apiService;
        
        // Compteurs et données des publications
        this.publicationCounter = 0;
        this.publicationsData = [];
        
        console.log('🎯 QualificationFeature créé');
    }
    
    // ========================
    // 🎨 GÉNÉRATION CONTENU HTML
    // ========================
    
    getQualificationContent() {
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        if (!selectedEnterprise) {
            return this._getNoEnterpriseSelectedHTML();
        }
        
        return `
            <div class="qualification-container">
                <!-- ENTREPRISE SÉLECTIONNÉE -->
                <div class="selected-enterprise-summary">
                    <h4>🏢 ${selectedEnterprise.nom_entreprise}</h4>
                    <p><strong>📍</strong> ${selectedEnterprise.commune || 'Commune non renseignée'}</p>
                    <button class="btn btn-link btn-sm" onclick="window.showSearch()">
                        🔄 Changer d'entreprise
                    </button>
                </div>
                
                <!-- AUTO-REMPLISSAGE STATUS -->
                <div id="autoFillStatus" class="auto-fill-status" style="display: none;">
                    <div class="auto-fill-message">
                        🤖 <strong>Auto-remplissage activé</strong> - Champs pré-remplis avec les données existantes
                    </div>
                </div>
                
                <!-- PARUTIONS CALENDRIER 2026 -->
                <div class="form-group">
                    <label class="form-label">
                        📅 Parutions calendrier 2026
                        <span class="form-help">Ajoutez une ou plusieurs parutions</span>
                    </label>
                    
                    <div id="publicationsList" class="publications-list">
                        <!-- Publications ajoutées dynamiquement -->
                    </div>
                    
                    <button type="button" class="btn btn-outline" onclick="window.addPublication()" id="addPublicationBtn">
                        ➕ Ajouter une parution
                    </button>
                    
                    <div class="price-display" id="priceDisplay">
                        <strong>Prix total : 0€</strong>
                        <div id="priceBreakdown" class="price-breakdown"></div>
                    </div>
                </div>
                
                <!-- OFFRES SPÉCIALES -->
                <div class="form-group" id="specialOffersSection" style="display: none;">
                    <label class="form-label">🎁 Offres spéciales disponibles</label>
                    <div id="availableOffers" class="offer-options">
                        <!-- Offres générées automatiquement -->
                    </div>
                </div>
                
                <!-- INFORMATIONS CONTACT -->
                <div class="form-section">
                    <h4>👤 Informations contact</h4>
                    
                    <div class="form-group">
                        <label class="form-label">Contact principal :</label>
                        <input type="text" class="form-input" id="interlocuteur" 
                               placeholder="Nom du contact">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email contact :</label>
                        <input type="email" class="form-input" id="emailContact" 
                               placeholder="email@exemple.com">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Téléphone :</label>
                        <input type="tel" class="form-input" id="telephoneContact" 
                               placeholder="06 12 34 56 78">
                    </div>
                </div>
                
                <!-- MODALITÉS COMMERCIALES -->
                <div class="form-section">
                    <h4>💰 Modalités commerciales</h4>
                    
                    <div class="form-group">
                        <label class="form-label">Mode de paiement :</label>
                        <select class="form-select" id="modePaiement">
                            <option value="Virement">Virement bancaire</option>
                            <option value="Cheque">Chèque</option>
                            <option value="Carte">Carte bancaire</option>
                            <option value="Especes">Espèces</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Commentaires :</label>
                        <textarea class="form-input" id="commentaires" rows="3" 
                                  placeholder="Informations supplémentaires, conditions particulières..."></textarea>
                    </div>
                </div>
                
                <!-- ACTIONS -->
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="window.showMainMenu()">
                        ← Annuler
                    </button>
                    <button class="btn btn-primary" onclick="window.createQualification()" disabled id="executeBtn">
                        ✅ Créer Qualification
                    </button>
                </div>
            </div>
        `;
    }
    
    _getNoEnterpriseSelectedHTML() {
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
    
    // ========================
    // 🚀 INITIALISATION
    // ========================
    
    initialize() {
        // Reset des compteurs
        this.publicationCounter = 0;
        this.publicationsData = [];
        
        // Initialiser avec une première parution
        setTimeout(() => {
            this.addPublication();
            this._setupAutoFill();
        }, 100);
        
        console.log('✅ Qualification initialisée');
    }
    
    _setupAutoFill() {
        const selectedEnterprise = this.state.getSelectedEnterprise();
        if (!selectedEnterprise) return;
        
        // Auto-remplissage intelligent basé sur les données entreprise
        this._autoFillContactFields(selectedEnterprise);
        this._autoFillFormatPreferences(selectedEnterprise);
        this._autoFillPaymentPreferences(selectedEnterprise);
        this._showAutoFillStatus();
    }
    
    _autoFillContactFields(enterprise) {
        const fields = [
            { id: 'interlocuteur', value: enterprise.interlocuteur, label: 'Contact existant' },
            { id: 'emailContact', value: enterprise.email, label: 'Email existant' },
            { id: 'telephoneContact', value: enterprise.telephone || enterprise.portable, label: 'Téléphone existant' }
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && field.value) {
                element.value = field.value;
                this._highlightAutoFilled(element, field.label);
            }
        });
    }
    
    _autoFillFormatPreferences(enterprise) {
        // Pré-sélectionner le format basé sur l'historique
        const historicalFormat = enterprise.format_encart_2025;
        if (historicalFormat) {
            const mappedFormat = this.config.mapBaserowFormat(historicalFormat);
            
            setTimeout(() => {
                const firstFormatSelect = document.querySelector('.publication-format');
                if (firstFormatSelect) {
                    firstFormatSelect.value = mappedFormat;
                    this._highlightAutoFilled(firstFormatSelect, `Format utilisé en 2025`);
                    this._updatePublicationPrice(1); // Premier publication
                }
            }, 200);
        }
    }
    
    _autoFillPaymentPreferences(enterprise) {
        const historicalPayment = enterprise.mode_paiement_2024;
        if (historicalPayment) {
            const paiementSelect = document.getElementById('modePaiement');
            if (paiementSelect) {
                const mappedMode = this.config.mapBaserowPayment(historicalPayment);
                paiementSelect.value = mappedMode;
                this._highlightAutoFilled(paiementSelect, `Mode utilisé en 2024`);
            }
        }
    }
    
    _highlightAutoFilled(element, message) {
        element.style.border = '2px solid #fbbf24';
        element.style.backgroundColor = '#fff3cd';
        
        // Ajouter tooltip informatif
        const tooltip = document.createElement('div');
        tooltip.className = 'auto-fill-tooltip';
        tooltip.innerHTML = `💡 ${message}`;
        element.parentNode.appendChild(tooltip);
    }
    
    _showAutoFillStatus() {
        const statusDiv = document.getElementById('autoFillStatus');
        if (statusDiv) {
            statusDiv.style.display = 'block';
        }
    }
    
    // ========================
    // 📅 GESTION DES PUBLICATIONS
    // ========================
    
    addPublication() {
        this.publicationCounter++;
        const publicationsList = document.getElementById('publicationsList');
        
        if (!publicationsList) {
            console.error('❌ Container publications non trouvé');
            return;
        }
        
        const publicationDiv = document.createElement('div');
        publicationDiv.className = 'publication-item';
        publicationDiv.id = `publication-${this.publicationCounter}`;
        
        publicationDiv.innerHTML = this._generatePublicationHTML(this.publicationCounter);
        
        publicationsList.appendChild(publicationDiv);
        
        // Mise à jour des calculs et offres
        this._updateTotalPrice();
        this._checkSpecialOffers();
        
        // Auto-focus sur le premier champ
        const moisSelect = document.getElementById(`mois-${this.publicationCounter}`);
        if (moisSelect) {
            moisSelect.focus();
        }
        
        console.log('📅 Publication ajoutée:', this.publicationCounter);
    }
    
    _generatePublicationHTML(id) {
        const monthOptions = this.config.getMonthOptions()
            .map(month => `<option value="${month.value}">${month.label}</option>`)
            .join('');
            
        const formatOptions = this.config.getFormatOptions()
            .map(format => `<option value="${format.value}" data-price="${this.config.getFormatPrice(format.value)}">${format.label}</option>`)
            .join('');
        
        return `
            <div class="publication-header">
                <span class="publication-title">📅 Parution ${id}</span>
                <button type="button" class="btn-remove" onclick="window.removePublication(${id})">
                    🗑️ Supprimer
                </button>
            </div>
            
            <div class="publication-fields">
                <div class="form-field">
                    <label>Mois :</label>
                    <select class="form-select publication-mois" id="mois-${id}" 
                            onchange="window.updatePublicationPrice(${id})">
                        <option value="">Sélectionner...</option>
                        ${monthOptions}
                    </select>
                </div>
                
                <div class="form-field">
                    <label>Format :</label>
                    <select class="form-select publication-format" id="format-${id}" 
                            onchange="window.updatePublicationPrice(${id})">
                        <option value="">Sélectionner...</option>
                        ${formatOptions}
                    </select>
                </div>
                
                <div class="form-field">
                    <label>Prix (€) :</label>
                    <input type="number" class="form-input publication-prix" id="prix-${id}" 
                           min="0" step="10" placeholder="0" 
                           onchange="window.updatePublicationPrice(${id})">
                </div>
                
                <div class="form-field">
                    <label>Type :</label>
                    <select class="form-select publication-type" id="type-${id}" 
                            onchange="window.updatePublicationPrice(${id})">
                        <option value="payant">💰 Payant</option>
                        <option value="offert">🎁 Offert</option>
                    </select>
                </div>
            </div>
            
            <div class="publication-summary" id="summary-${id}">
                Complétez les champs ci-dessus
            </div>
        `;
    }
    
    removePublication(id) {
        const publicationDiv = document.getElementById(`publication-${id}`);
        if (publicationDiv) {
            publicationDiv.remove();
            this._updateTotalPrice();
            this._checkSpecialOffers();
            this._renumberPublications();
            
            console.log('🗑️ Publication supprimée:', id);
        }
    }
    
    updatePublicationPrice(id) {
        const moisSelect = document.getElementById(`mois-${id}`);
        const formatSelect = document.getElementById(`format-${id}`);
        const prixInput = document.getElementById(`prix-${id}`);
        const typeSelect = document.getElementById(`type-${id}`);
        
        if (!moisSelect || !formatSelect || !prixInput || !typeSelect) {
            console.warn('⚠️ Éléments publication manquants pour ID:', id);
            return;
        }
        
        const format = formatSelect.value;
        const type = typeSelect.value;
        
        // Auto-calcul du prix selon le format
        if (format && format !== 'SPECIAL') {
            const basePrice = this.config.getFormatPrice(format);
            
            if (type === 'payant') {
                prixInput.value = basePrice;
            } else {
                prixInput.value = 0;
            }
        }
        
        // Mise à jour du résumé de cette publication
        this._updatePublicationSummary(id);
        
        // Recalculer le total global
        this._updateTotalPrice();
        
        // Vérifier les offres spéciales
        this._checkSpecialOffers();
        
        console.log('💰 Prix publication mis à jour:', id);
    }
    
    _updatePublicationSummary(id) {
        const mois = document.getElementById(`mois-${id}`)?.value || '';
        const format = document.getElementById(`format-${id}`)?.value || '';
        const prix = parseInt(document.getElementById(`prix-${id}`)?.value || 0);
        const type = document.getElementById(`type-${id}`)?.value || 'payant';
        const summaryDiv = document.getElementById(`summary-${id}`);
        
        if (!summaryDiv) return;
        
        if (mois && format) {
            const typeIcon = type === 'offert' ? '🎁' : '💰';
            const priceText = type === 'offert' ? 'Offert' : `${prix}€`;
            
            summaryDiv.innerHTML = `
                <div class="publication-summary-content ${type}">
                    ${typeIcon} <strong>${mois} ${format}</strong> - ${priceText}
                </div>
            `;
            summaryDiv.className = `publication-summary ${type}`;
        } else {
            summaryDiv.innerHTML = 'Complétez les champs ci-dessus';
            summaryDiv.className = 'publication-summary';
        }
    }
    
    // ========================
    // 💰 CALCULS DE PRIX
    // ========================
    
    _collectPublicationsData() {
        const publications = [];
        const publicationItems = document.querySelectorAll('.publication-item');
        
        publicationItems.forEach((item, index) => {
            const id = item.id.split('-')[1];
            const mois = document.getElementById(`mois-${id}`)?.value;
            const format = document.getElementById(`format-${id}`)?.value;
            const prix = parseInt(document.getElementById(`prix-${id}`)?.value || 0);
            const type = document.getElementById(`type-${id}`)?.value;
            
            if (mois && format) {
                publications.push({
                    mois: mois,
                    format: format,
                    prix: prix,
                    type: type,
                    ordre: index + 1
                });
            }
        });
        
        return publications;
    }
    
    _calculateTotalPrice(publications) {
        const payantes = publications.filter(p => p.type === 'payant');
        const offertes = publications.filter(p => p.type === 'offert');
        
        const montantPayant = payantes.reduce((total, pub) => total + pub.prix, 0);
        const montantOffert = offertes.reduce((total, pub) => total + pub.prix, 0);
        
        return {
            total: montantPayant,
            payant: montantPayant,
            offert: montantOffert,
            publications_payantes: payantes.length,
            publications_offertes: offertes.length
        };
    }
    
    _updateTotalPrice() {
        const publications = this._collectPublicationsData();
        const pricing = this._calculateTotalPrice(publications);
        
        const priceDisplay = document.getElementById('priceDisplay');
        const breakdownDiv = document.getElementById('priceBreakdown');
        
        if (!priceDisplay || !breakdownDiv) return;
        
        // Affichage principal
        priceDisplay.innerHTML = `<strong>Prix total : ${pricing.total}€</strong>`;
        
        // Détail
        let breakdown = [];
        if (pricing.publications_payantes > 0) {
            breakdown.push(`${pricing.publications_payantes} parution(s) payante(s) : ${pricing.payant}€`);
        }
        if (pricing.publications_offertes > 0) {
            breakdown.push(`${pricing.publications_offertes} parution(s) offerte(s) : 🎁 Incluses`);
        }
        
        breakdownDiv.innerHTML = breakdown.join(' • ');
        
        // Activation/désactivation du bouton
        this._updateExecuteButton(publications.length > 0);
        
        // Sauvegarder les données pour usage global
        this.publicationsData = publications;
    }
    
    _updateExecuteButton(hasPublications) {
        const executeBtn = document.getElementById('executeBtn');
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        if (executeBtn) {
            executeBtn.disabled = !hasPublications || !selectedEnterprise;
        }
    }
    
    // ========================
    // 🎁 SYSTÈME D'OFFRES SPÉCIALES
    // ========================
    
    _checkSpecialOffers() {
        const publications = this._collectPublicationsData();
        const specialOffersSection = document.getElementById('specialOffersSection');
        const availableOffers = document.getElementById('availableOffers');
        
        if (!publications.length || !specialOffersSection || !availableOffers) {
            if (specialOffersSection) specialOffersSection.style.display = 'none';
            return;
        }
        
        const offers = this._generateSpecialOffers(publications);
        
        if (offers.length > 0) {
            specialOffersSection.style.display = 'block';
            availableOffers.innerHTML = offers.map(offer => this._createOfferHTML(offer)).join('');
        } else {
            specialOffersSection.style.display = 'none';
        }
    }
    
    _generateSpecialOffers(publications) {
        const offers = [];
        const payantes = publications.filter(p => p.type === 'payant');
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        // Offre 3+1 gratuit
        if (payantes.length >= 3) {
            offers.push({
                type: '3plus1',
                title: '🎁 Offre 3+1 : 4ème parution offerte',
                description: 'Ajoutez une 4ème parution gratuite !',
                action: 'offerFreeFourthPublication',
                savings: this.config.getFormatPrice('6X4') // 350€ par défaut
            });
        }
        
        // Offre fidélité (si client existant)
        if (selectedEnterprise && selectedEnterprise.Client_2025 === 'Oui') {
            const totalAmount = this._calculateTotalPrice(publications).total;
            offers.push({
                type: 'fidelite',
                title: '💎 Réduction fidélité -10%',
                description: 'Client fidèle : -10% sur le total',
                action: 'applyLoyaltyDiscount',
                savings: Math.round(totalAmount * 0.1)
            });
        }
        
        // Offre format mixte
        const formats = [...new Set(payantes.map(p => p.format))];
        if (formats.length >= 2) {
            offers.push({
                type: 'mixte',
                title: '🎨 Offre formats mixtes',
                description: 'Optimisation tarifaire détectée !',
                action: 'optimizeMixedFormats',
                savings: 50
            });
        }
        
        return offers;
    }
    
    _createOfferHTML(offer) {
        return `
            <div class="special-offer" onclick="window.${offer.action}()">
                <div class="offer-header">
                    <strong>${offer.title}</strong>
                    <span class="offer-savings">Économie: ${offer.savings}€</span>
                </div>
                <div class="offer-description">${offer.description}</div>
            </div>
        `;
    }
    
    // ========================
    // 🎁 ACTIONS D'OFFRES
    // ========================
    
    offerFreeFourthPublication() {
        if (confirm('Ajouter une 4ème parution gratuite ?')) {
            this.addPublication();
            const newId = this.publicationCounter;
            
            // Pré-remplir comme offerte
            setTimeout(() => {
                const typeSelect = document.getElementById(`type-${newId}`);
                const formatSelect = document.getElementById(`format-${newId}`);
                const prixInput = document.getElementById(`prix-${newId}`);
                
                if (typeSelect) typeSelect.value = 'offert';
                if (formatSelect) formatSelect.value = '6X4';
                if (prixInput) prixInput.value = 0;
                
                this.updatePublicationPrice(newId);
            }, 100);
            
            this.state.setSuccessStatus('🎁 4ème parution offerte ajoutée !');
        }
    }
    
    applyLoyaltyDiscount() {
        if (confirm('Appliquer la réduction fidélité de 10% ?')) {
            const publications = this._collectPublicationsData();
            
            publications.forEach((pub, index) => {
                if (pub.type === 'payant') {
                    const publicationItems = document.querySelectorAll('.publication-item');
                    const id = publicationItems[index].id.split('-')[1];
                    const prixInput = document.getElementById(`prix-${id}`);
                    
                    if (prixInput) {
                        const newPrice = Math.round(pub.prix * 0.9);
                        prixInput.value = newPrice;
                        this.updatePublicationPrice(id);
                    }
                }
            });
            
            this.state.setSuccessStatus('✅ Réduction fidélité appliquée !');
        }
    }
    
    optimizeMixedFormats() {
        this.state.setStatus('🎨 Optimisation formats mixtes disponible - Contactez l\'équipe commerciale');
    }
    
    // ========================
    // 💾 CRÉATION QUALIFICATION
    // ========================
    
    async createQualification() {
        const selectedEnterprise = this.state.getSelectedEnterprise();
        
        if (!selectedEnterprise) {
            this.state.setErrorStatus('Veuillez sélectionner une entreprise');
            return;
        }
        
        const publications = this._collectPublicationsData();
        
        if (publications.length === 0) {
            this.state.setErrorStatus('Veuillez ajouter au moins une parution');
            return;
        }
        
        // Validation des champs obligatoires
        const hasIncompletePublication = publications.some(pub => !pub.mois || !pub.format);
        if (hasIncompletePublication) {
            this.state.setErrorStatus('Veuillez compléter toutes les parutions');
            return;
        }
        
        // Récupération des données du formulaire
        const qualificationData = this._collectFormData(selectedEnterprise, publications);
        
        try {
            this.state.setLoadingStatus('🎯 Création qualification...');
            
            // Appel API via le service
            const result = await this.api.createQualification(qualificationData);
            
            if (result.success) {
                this._handleQualificationSuccess(result, publications);
            } else {
                throw new Error(result.error?.message || 'Erreur création qualification');
            }
            
        } catch (error) {
            console.error('❌ Erreur création qualification:', error);
            this.state.setErrorStatus(`Erreur: ${error.message}`);
        }
    }
    
    _collectFormData(enterprise, publications) {
        const modePaiement = document.getElementById('modePaiement')?.value || 'Virement';
        const interlocuteur = document.getElementById('interlocuteur')?.value || '';
        const emailContact = document.getElementById('emailContact')?.value || '';
        const telephoneContact = document.getElementById('telephoneContact')?.value || '';
        const commentaires = document.getElementById('commentaires')?.value || '';
        
        const pricing = this._calculateTotalPrice(publications);
        
        return {
            enterprise_id: enterprise.id,
            enterprise_name: enterprise.nom_entreprise,
            enterprise_adresse: enterprise.adresse || '',
            enterprise_commune: enterprise.commune || '',
            enterprise_telephone: enterprise.telephone || '',
            
            // Publications détaillées
            publications: publications,
            mode_paiement: modePaiement,
            interlocuteur: interlocuteur,
            email_contact: emailContact,
            telephone_contact: telephoneContact,
            commentaires: commentaires,
            
            // Métriques
            nombre_parutions: publications.length,
            prix_total: pricing.total,
            montant_payant: pricing.payant,
            montant_offert: pricing.offert,
            has_multiple_publications: publications.length > 1,
            has_free_publications: pricing.publications_offertes > 0,
            
            // Métadonnées
            offre_type: pricing.publications_offertes > 0 ? 'avec_gratuites' : 'standard',
            user_id: this.state.getUser()?.id,
            timestamp: new Date().toISOString()
        };
    }
    
    _handleQualificationSuccess(result, publications) {
        const pricing = this._calculateTotalPrice(publications);
        const summary = this._generateQualificationSummary(publications, pricing);
        
        this.state.setSuccessStatus('✅ Qualification créée avec succès !');
        
        // Afficher le résumé
        this._showQualificationSuccess(result, summary);
        
        // Sauvegarder dans l'état global
        this.state.setQualificationData(result.data || {});
        
        console.log('✅ Qualification créée:', result);
    }
    
    _generateQualificationSummary(publications, pricing) {
        const payantes = publications.filter(p => p.type === 'payant');
        const offertes = publications.filter(p => p.type === 'offert');
        
        let summary = `📊 RÉSUMÉ :\n`;
        summary += `• ${publications.length} parution(s) au total\n`;
        
        if (payantes.length > 0) {
            summary += `• ${payantes.length} payante(s) : ${pricing.payant}€\n`;
            summary += `  ${payantes.map(p => `${p.mois} ${p.format}`).join(', ')}\n`;
        }
        
        if (offertes.length > 0) {
            summary += `• ${offertes.length} offerte(s) 🎁\n`;
            summary += `  ${offertes.map(p => `${p.mois} ${p.format}`).join(', ')}\n`;
        }
        
        return summary;
    }
    
    _showQualificationSuccess(result, summary) {
        const contentDiv = document.getElementById('stateContent');
        if (!contentDiv) return;
        
        contentDiv.innerHTML = `
            <div class="qualification-success">
                <div class="success-header">
                    <h3>✅ Qualification créée avec succès !</h3>
                </div>
                
                <div class="qualification-summary">
                    <h4>📋 Résumé de la qualification</h4>
                    <pre>${summary}</pre>
                </div>
                
                <div class="next-steps">
                    <h4>🎯 Prochaines étapes disponibles :</h4>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="window.generateDocument('facture')">
                            📄 Générer Facture
                        </button>
                        <button class="btn btn-primary" onclick="window.generateDocument('bon_commande')">
                            📋 Générer Bon de Commande
                        </button>
                        <button class="btn btn-secondary" onclick="window.showMainMenu()">
                            🏠 Retour au menu
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ========================
    // 🧹 NETTOYAGE
    // ========================
    
    cleanup() {
        this.publicationCounter = 0;
        this.publicationsData = [];
        console.log('🧹 QualificationFeature nettoyé');
    }
}

// ========================
// 🌍 INSTANCE SINGLETON
// ========================

let qualificationInstance = null;

export function getQualificationFeature() {
    if (!qualificationInstance) {
        qualificationInstance = new QualificationFeature();
    }
    return qualificationInstance;
}

// ========================
// 🌍 FONCTIONS GLOBALES (pour onclick)
// ========================

export function getQualificationContent() {
    const qualification = getQualificationFeature();
    return qualification.getQualificationContent();
}

export function initializePublications() {
    const qualification = getQualificationFeature();
    qualification.initialize();
}

export function addPublication() {
    const qualification = getQualificationFeature();
    qualification.addPublication();
}

export function removePublication(id) {
    const qualification = getQualificationFeature();
    qualification.removePublication(id);
}

export function updatePublicationPrice(id) {
    const qualification = getQualificationFeature();
    qualification.updatePublicationPrice(id);
}

export function createQualification() {
    const qualification = getQualificationFeature();
    qualification.createQualification();
}

export function offerFreeFourthPublication() {
    const qualification = getQualificationFeature();
    qualification.offerFreeFourthPublication();
}

export function applyLoyaltyDiscount() {
    const qualification = getQualificationFeature();
    qualification.applyLoyaltyDiscount();
}

export function optimizeMixedFormats() {
    const qualification = getQualificationFeature();
    qualification.optimizeMixedFormats();
}

export default getQualificationFeature();