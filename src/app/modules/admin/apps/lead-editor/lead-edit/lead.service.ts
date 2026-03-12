import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Lead, LeadSource, Ville, BulkAssignmentRule } from './lead.model';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = 'http://localhost:8080/api/leads';
  private leadsSubject = new BehaviorSubject<Lead[]>([]);

  constructor(private http: HttpClient) {}

  // Get all leads for an item
  getLeadsByItem(itemId: number): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.apiUrl}/item/${itemId}`);
  }

  // Get single lead
  getLead(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  // Create lead
  

  // Update lead
  updateLead(id: number, lead: Partial<Lead>): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/${id}`, lead);
  }

  // Delete lead
  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Batch delete
  batchDelete(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batch/delete`,  ids );
  }

  // Batch assign
  batchAssign(ids: number[], assignedTo: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batch/assign`, { ids, assignedTo });
  }

  // Bulk assign by criteria (ville or source)
  bulkAssignByCriteria(rule: BulkAssignmentRule): Observable<{ affected: number }> {
    return this.http.post<{ affected: number }>(`${this.apiUrl}/bulk-assign`, rule);
  }

  // Validate email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate phone
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Validate lead
  validateLead(lead: Lead): string[] {
    const errors: string[] = [];

    if (!lead.name || lead.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!lead.email || !this.validateEmail(lead.email)) {
      errors.push('Valid email is required');
    }

    if (!lead.phone || !this.validatePhone(lead.phone)) {
      errors.push('Valid phone is required (10-15 digits)');
    }

    if (!lead.ville) {
      errors.push('City is required');
    }

    return errors;
  }

  // Export to Excel
  exportToExcel(leads: Lead[], filename: string = 'leads.xlsx'): void {
    const ws_data = leads.map(lead => ({
      ID: lead.id,
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      City: lead.ville,
      'Job Title': lead.jobTitle || '',
      Source: lead.source,
      'Assigned To': lead.assignedTo || 'Unassigned',
      'Created Date': new Date(lead.createdAt).toLocaleDateString(),
      'Email Verified': lead.emailVerified ? 'Yes' : 'No',
      'Phone Verified': lead.phoneVerified ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');

    // Auto-size columns
    const colWidths = [8, 20, 30, 15, 15, 20, 15, 20, 15, 15, 15];
    ws['!cols'] = colWidths.map(width => ({ wch: width }));

    XLSX.writeFile(wb, filename);
  }

  // Get statistics
  calculateStatistics(leads: Lead[]): any {
    const stats = {
      total: leads.length,
      assigned: leads.filter(l => l.assignedTo).length,
      unassigned: leads.filter(l => !l.assignedTo).length,
      duplicates: leads.filter(l => l.isDuplicate).length,
      byVille: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      byAssignee: {} as Record<string, number>
    };

    leads.forEach(lead => {
      if (lead.ville) {
      const villeKey = lead.ville.toUpperCase();
      stats.byVille[villeKey] = (stats.byVille[villeKey] || 0) + 1;
    }

      // By Source
      if (lead.source) {
        stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;
      }

      // By Assignee
      if (lead.assignedTo) {
        stats.byAssignee[lead.assignedTo] = (stats.byAssignee[lead.assignedTo] || 0) + 1;
      }
    });

    return stats;
  }

  // Get all assignees from leads
  getAllAssignees(leads: Lead[]): string[] {
    return [...new Set(leads.filter(l => l.assignedTo).map(l => l.assignedTo))];
  }
}