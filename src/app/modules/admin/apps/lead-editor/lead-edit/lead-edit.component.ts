import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartType, ChartData, ChartConfiguration } from 'chart.js';

import { NgChartsConfiguration, BaseChartDirective } from 'ng2-charts';
import { LeadService } from './lead.service';
import { Lead, LeadSource, Ville, BulkAssignmentRule } from './lead.model';

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// Selection Model
class SelectionModel<T> {
  selected: T[] = [];

  isSelected(item: T): boolean {
    return this.selected.includes(item);
  }

  toggle(item: T): void {
    const index = this.selected.indexOf(item);
    if (index > -1) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(item);
    }
  }

  clear(): void {
    this.selected = [];
  }

  select(...items: T[]): void {
    items.forEach(item => {
      if (!this.selected.includes(item)) {
        this.selected.push(item);
      }
    });
  }

  deselect(...items: T[]): void {
    items.forEach(item => {
      const index = this.selected.indexOf(item);
      if (index > -1) {
        this.selected.splice(index, 1);
      }
    });
  }
}

@Component({
  selector: 'app-lead-edit',
  templateUrl: './lead-edit.component.html',
  styleUrls: ['./lead-edit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    BaseChartDirective,
  ]
})
export class LeadEditComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatTabGroup) tabgrp! : MatTabGroup;

  // Data
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  editingLead: Lead | null = null;

  // Filters
  searchQuery = '';
  selectedVille: string = 'ALL';
  selectedSource: string = 'ALL';
  selectedAssignee: string = 'ALL';

  // UI State
  currentTheme: 'light' | 'dark' = 'light';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  pageIndex = 0;
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Selection
  selectedLeads = new SelectionModel<Lead>();
  expandedElement: Lead | null = null;

  // Forms
  editForm: FormGroup;
  bulkAssignForm: FormGroup;
  showBulkAssignDialog = false;

  // Options & Lists
  villeOptions: string[] = [];
  sourceOptions: string[] = [];
  allAssignees: string[] = [];
  allColumns: string[] = [
    'select',
    'id',
    'name',
    'email',
    'phone',
    'ville',
    'jobTitle',
    'source',
    'assigned',
    'createdAt',
    'actions'
  ];
  visibleColumns: string[] = [
    'select',
    'id',
    'name',
    'email',
    'phone',
    'ville',
    'source',
    'assigned',
    'actions'
  ];

  // === Graphique par ville ===

  statistics: any = {};

barChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  plugins: {
    legend: { display: true },
    title: { display: true, text: 'Distribution par ville' }
  }
};

barChartData: ChartData<'bar'> = {
  labels: ['Casablanca', 'Rabat', 'Marrakech', 'Fès'],
  datasets: [
    { data: [12, 19, 5, 7], label: 'Nombre de leads' }
  ]
};

barChartType: ChartType = 'bar';

@ViewChild(BaseChartDirective) chart!: BaseChartDirective;

// Met à jour les données à partir des statistiques
updateChart(): void {
  if (!this.statistics.byVille) return;

  this.barChartData.labels = Object.keys(this.statistics.byVille).slice(0, 10);
  this.barChartData.datasets[0].data = Object.values(this.statistics.byVille)
    .slice(0, 10) as number[];

  // Si le chart existe déjà, déclenche la mise à jour
  if (this.chart) {
    this.chart.update();
  }
}

  // Statistics
  validationErrors: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { leadId: number },
    public dialogRef: MatDialogRef<LeadEditComponent>,
    private leadService: LeadService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      ville: ['', Validators.required],
      source: [''],
      jobTitle: [''],
      assignedTo: ['']
    });

    this.bulkAssignForm = this.fb.group({
      criteria: ['', Validators.required],
      value: ['', Validators.required],
      assignTo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initializeOptions();
    this.loadLeads();
    this.loadTheme();
  }

  initializeOptions(): void {
    this.villeOptions = Object.values(Ville);
    this.sourceOptions = Object.values(LeadSource);
  }

  loadLeads(): void {
    this.leadService.getLeadsByItem(this.data.leadId).subscribe({
      next: (leads) => {
        this.leads = leads || [];
        console.log('✅ Leads loaded:', this.leads.length, this.leads);
        this.applyFilters();
        this.updateStatistics();
        this.allAssignees = this.leadService.getAllAssignees(leads);
      },
      error: (err) => console.error('❌ Error loading leads:', err)
    });
  }

  openEditTab(){
    this.tabgrp!.selectedIndex = 2;
  }

  applyFilters(): void {
    let filtered = [...this.leads];

    // Search filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q)
      );
    }

    // Ville filter
    if (this.selectedVille !== 'ALL') {
      filtered = filtered.filter((l) => l.ville.toUpperCase() === this.selectedVille.toUpperCase());
      console.log(this.selectedVille);
    }

    // Source filter
    if (this.selectedSource !== 'ALL') {
      filtered = filtered.filter((l) => l.source === this.selectedSource);
    }

    // Assignee filter
    if (this.selectedAssignee !== 'ALL') {
      if (this.selectedAssignee === 'Unassigned') {
        filtered = filtered.filter((l) => !l.assignedTo);
      } else {
        filtered = filtered.filter((l) => l.assignedTo === this.selectedAssignee);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = (a as any)[this.sortColumn];
      let bVal: any = (b as any)[this.sortColumn];

      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredLeads = filtered;
    this.pageIndex = 0;
    console.log('🔍 Filtered leads:', this.filteredLeads.length);
  }

  updateStatistics(): void {
    this.statistics = this.leadService.calculateStatistics(this.leads);
  }

  // Filter Events
  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onVilleChange(ville: string): void {
    this.selectedVille = ville;
    this.applyFilters();
  }

  onSourceChange(source: string): void {
    this.selectedSource = source;
    this.applyFilters();
  }

  onAssigneeChange(assignee: string): void {
    this.selectedAssignee = assignee;
    this.applyFilters();
  }

  onSort(event: Sort): void {
    this.sortColumn = event.active;
    this.sortDirection = (event.direction as 'asc' | 'desc') || 'asc';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Table Methods
  getPagedLeads(): Lead[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredLeads.slice(start, end);
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedLeads.deselect(...this.getPagedLeads());
    } else {
      this.selectedLeads.select(...this.getPagedLeads());
    }
  }

  toggleSelection(lead: Lead): void {
    this.selectedLeads.toggle(lead);
  }

  isAllSelected(): boolean {
    const pagedLeads = this.getPagedLeads();
    return (
      pagedLeads.length > 0 &&
      pagedLeads.every((l) => this.selectedLeads.isSelected(l))
    );
  }

  hasBatchSelection(): boolean {
    return this.selectedLeads.selected.length > 0;
  }

  toggleColumn(col: string): void {
    if (this.visibleColumns.includes(col)) {
      this.visibleColumns = this.visibleColumns.filter((c) => c !== col);
    } else {
      this.visibleColumns.splice(this.allColumns.indexOf(col),0,col);
    }
  }

  toggleRowExpansion(lead: Lead): void {
    this.expandedElement = this.expandedElement === lead ? null : lead;
  }

  // Edit Methods
  openInlineEdit(lead: Lead): void {
    this.editingLead = { ...lead };
    this.editForm.patchValue(lead);
    this.validationErrors = [];
    this.openEditTab()
  }

  saveEdit(): void {
    if (this.editForm.valid && this.editingLead) {
      const errors = this.leadService.validateLead(this.editForm.value);
      if (errors.length > 0) {
        this.validationErrors = errors;
        return;
      }

      this.leadService.updateLead(this.editingLead.id, this.editForm.value).subscribe({
        next: () => {
          this.loadLeads();
          this.editingLead = null;
        },
        error: (err) => console.error('Error saving lead:', err)
      });
    }
  }

  cancelEdit(): void {
    this.editingLead = null;
    this.validationErrors = [];
  }

  deleteLead(lead: Lead): void {
    if (confirm(`Delete lead "${lead.name}"?`)) {
      this.leadService.deleteLead(lead.id).subscribe({
        next: () => this.loadLeads(),
        error: (err) => console.error('Error deleting lead:', err)
      });
    }
  }

  // Batch Operations
  batchDelete(): void {
    const count = this.selectedLeads.selected.length;
    if (confirm(`Delete ${count} leads?`)) {
      const ids = this.selectedLeads.selected.map((l) => l.id);
      console.log(ids);
      this.leadService.batchDelete(ids).subscribe({
        next: () => {
          this.loadLeads();
          this.selectedLeads.clear();
        },
        error: (err) => console.error('Error deleting leads:', err)
      });
    }
  }

  batchAssignSelected(): void {
    const assignee = prompt('Assign to:');
    if (assignee) {
      const ids = this.selectedLeads.selected.map((l) => l.id);
      this.leadService.batchAssign(ids, assignee).subscribe({
        next: () => {
          this.loadLeads();
          this.selectedLeads.clear();
        },
        error: (err) => console.error('Error assigning leads:', err)
      });
    }
  }

  openBulkAssignByCriteria(): void {
    this.showBulkAssignDialog = true;
  }

  closeBulkAssignDialog(): void {
    this.showBulkAssignDialog = false;
    this.bulkAssignForm.reset();
  }

  executeBulkAssignByCriteria(): void {
    if (this.bulkAssignForm.valid) {
      const rule: BulkAssignmentRule = this.bulkAssignForm.value;
      console.log(rule);
      this.leadService.bulkAssignByCriteria(rule).subscribe({
        next: (result) => {
          alert(`Assigned ${result.affected} leads`);
          this.loadLeads();
          this.closeBulkAssignDialog();
        },
        error: (err) => console.error('Error bulk assigning:', err)
      });
    }
  }

  exportToExcel(): void {
    const leadsToExport =
      this.selectedLeads.selected.length > 0
        ? this.selectedLeads.selected
        : this.filteredLeads;
    this.leadService.exportToExcel(leadsToExport);
  }

  // Format Methods
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getRelativeDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return `${Math.floor(diff / 30)}m ago`;
  }

  getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
      WEBSITE: '🌐 Website',
      PHONE: '☎️ Phone',
      EMAIL: '📧 Email',
      REFERRAL: '🤝 Referral',
      IMPORT: '📥 Import',
      SOCIAL: '📱 Social',
      TRADE_SHOW: '🎪 Trade Show',
      OTHER: '📌 Other'
    };
    return labels[source] || source;
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('lead-modal-theme', this.currentTheme);
  }

  loadTheme(): void {
    const saved = localStorage.getItem('lead-modal-theme');
    if (saved) {
      this.currentTheme = saved as 'light' | 'dark';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}