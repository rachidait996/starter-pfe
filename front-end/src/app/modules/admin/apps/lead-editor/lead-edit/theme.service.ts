import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  primary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$ = this.themeSubject.asObservable();

  private readonly LIGHT_THEME: ThemeConfig = {
    primary: '#3b82f6',
    accent: '#8b5cf6',
    background: '#ffffff',
    text: '#1a1a1a',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  private readonly DARK_THEME: ThemeConfig = {
    primary: '#60a5fa',
    accent: '#a78bfa',
    background: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171'
  };

  constructor() {
    this.loadThemePreference();
  }

  private loadThemePreference(): void {
    const saved = localStorage.getItem('lead-modal-theme') as Theme;
    if (saved) {
      this.setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem('lead-modal-theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const current = this.themeSubject.value;
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  getThemeConfig(): ThemeConfig {
    return this.themeSubject.value === 'light' ? this.LIGHT_THEME : this.DARK_THEME;
  }

  private applyTheme(theme: Theme): void {
    const config = theme === 'light' ? this.LIGHT_THEME : this.DARK_THEME;
    const root = document.documentElement;

    Object.entries(config).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    root.setAttribute('data-theme', theme);
  }
}