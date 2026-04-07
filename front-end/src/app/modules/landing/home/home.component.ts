import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface Activity {
  type: 'call' | 'note' | 'system' | 'email' | 'task' | 'event';
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
  title: string;
  time: string;
  description: string;
  user?: string;
}

@Component({
    selector: 'landing-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, RouterLink, MatIconModule],
})
export class LandingHomeComponent implements OnInit {
  // Infos de base
  leadRef = 'LD-2604-084';
  firstName = 'Hassan';
  lastName = 'El Amrani';
  initials = 'HE';
  
  // Métriques CRM
  leadScore = 85;
  leadSource = 'Campagne Facebook Ads';
  creationDate = '06 Avril 2026';
  lastContact = 'Aujourd\'hui, 09:30';
  
  // 1. Projet Immobilier
  intention = 'Acquisition Principale';
  budget = '1 200 000';
  propertyType = 'Appartement';
  propertyState = 'VEFA (Sur plan)'; // Nouvel attribut
  targetCity = 'Casablanca (Bouskoura)';
  
  // 2. Situation Financière
  estimatedIncome = '22 000';
  apport = '250 000';
  existingCredits = '1 500'; // Nouvel attribut (ex: crédit auto)
  
  // 3. Profil & Coordonnées
  phone = '06 61 23 45 67';
  email = 'h.elamrani@email.com';
  maritalStatus = 'Marié(e)'; // Nouvel attribut
  dependents = '2 enfants'; // Nouvel attribut
  jobStatus = 'Cadre Supérieur (Banque)'; 
  jobContract = 'CDI'; // Nouvel attribut
  jobSeniority = '5 ans'; // Nouvel attribut

  currentFilter: 'all' | 'notes' | 'calls' | 'emails' | 'tasks' = 'all';

  // Onglet actif
  composerTab: 'note' | 'call' | 'task' | 'event' | 'email' = 'note';
  
  // Champs du formulaire dynamique
  composerText = '';
  composerSubject = '';
  composerTo = this.email;
  composerDate = '';
  composerTime = '';

  activities: Activity[] = [];

  constructor() { }

  ngOnInit(): void {
    this.activities = [
      {
        type: 'call',
        icon: 'phone_missed',
        iconColorClass: 'text-amber-500',
        iconBgClass: 'bg-amber-100',
        title: 'Tentative d\'appel (1er contact)',
        time: 'Ce matin, 09:30',
        description: 'Pas de réponse, tombe sur répondeur. Un message vocal de présentation a été laissé pour convenir d\'un RDV téléphonique.',
        user: 'Youssef M.'
      },
      {
        type: 'system',
        icon: 'person_add_alt',
        iconColorClass: 'text-blue-500',
        iconBgClass: 'bg-blue-100',
        title: 'Lead attribué',
        time: 'Hier, 18:45',
        description: 'Attribué automatiquement à Youssef M. (Agence Casa Maarif) selon la zone géographique ciblée.',
        user: 'Système'
      }
    ];
  }

  setComposerTab(tab: 'note' | 'call' | 'task' | 'event' | 'email'): void {
    this.composerTab = tab;
    this.composerText = '';
    this.composerSubject = '';
    this.composerTo = this.email;
    this.composerDate = '';
    this.composerTime = '';
  }

  saveActivity(): void {
    if (!this.composerText.trim() && this.composerTab !== 'task' && this.composerTab !== 'event') return;

    let newActivity: Activity;

    switch(this.composerTab) {
      case 'call':
        newActivity = {
          type: 'call', icon: 'call', iconColorClass: 'text-teal-600', iconBgClass: 'bg-teal-100',
          title: 'Appel consigné', time: 'À l\'instant', description: this.composerText, user: 'Youssef M.'
        }; break;
      case 'task':
        newActivity = {
          type: 'task', icon: 'task_alt', iconColorClass: 'text-indigo-600', iconBgClass: 'bg-indigo-100',
          title: `Tâche créée : ${this.composerSubject || 'À faire'}`, time: 'À l\'instant', description: this.composerText || 'Aucune description', user: 'Youssef M.'
        }; break;
      case 'event':
        const dateTimeStr = (this.composerDate && this.composerTime) ? `le ${this.composerDate} à ${this.composerTime}` : 'Date à définir';
        newActivity = {
          type: 'event', icon: 'event', iconColorClass: 'text-pink-600', iconBgClass: 'bg-pink-100',
          title: `RDV Planifié : ${this.composerSubject || 'Réunion'}`, time: 'À l\'instant', 
          description: `Prévu ${dateTimeStr}. Détails : ${this.composerText || 'Aucun détail additionnel.'}`, user: 'Youssef M.'
        }; break;
      case 'email':
        newActivity = {
          type: 'email', icon: 'mail', iconColorClass: 'text-blue-600', iconBgClass: 'bg-blue-100',
          title: `Email envoyé à ${this.composerTo}`, time: 'À l\'instant', 
          description: `Objet : ${this.composerSubject || 'Sans objet'}\n\n${this.composerText}`, user: 'Youssef M.'
        }; break;
      default:
        newActivity = {
          type: 'note', icon: 'edit_note', iconColorClass: 'text-slate-600', iconBgClass: 'bg-slate-200',
          title: 'Note ajoutée', time: 'À l\'instant', description: this.composerText, user: 'Youssef M.'
        }; break;
    }

    this.activities.unshift(newActivity);
    
    this.composerText = '';
    this.composerSubject = '';
    this.composerDate = '';
    this.composerTime = '';
  }

  setFilter(filter: 'all' | 'notes' | 'calls' | 'emails' | 'tasks'): void {
    this.currentFilter = filter;
  }
}
