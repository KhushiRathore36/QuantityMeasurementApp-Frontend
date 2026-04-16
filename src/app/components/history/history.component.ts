
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface HistoryItem {
  id: number;
  type: 'length' | 'weight' | 'volume' | 'temperature';
  operation: 'convert' | 'compare' | 'add' | 'subtract' | 'multiply' | 'divide';
  firstValue: number;
  firstUnit: string;
  secondValue: number | null;
  secondUnit: string;
  resultText: string;
  createdAt: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  allHistory: HistoryItem[] = [];
  filteredHistory: HistoryItem[] = [];

  typeFilter: string = 'all';
  operationFilter: string = 'all';

  constructor(private router: Router, private auth: AuthService) {
    this.loadHistory();
  }

  // Sirf current logged-in user ki history
  private getHistoryKey(): string {
    const user = this.auth.getUser() || 'guest';
    return `quantity-history-${user}`;
  }

  loadHistory(): void {
    const key = this.getHistoryKey();
    const stored = localStorage.getItem(key);
    this.allHistory = stored ? JSON.parse(stored) : [];
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredHistory = this.allHistory.filter((item) => {
      const typeMatch = this.typeFilter === 'all' || item.type === this.typeFilter;
      const opMatch = this.operationFilter === 'all' || item.operation === this.operationFilter;
      return typeMatch && opMatch;
    });
  }

  clearHistory(): void {
    const key = this.getHistoryKey();
    localStorage.removeItem(key);
    this.allHistory = [];
    this.filteredHistory = [];
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}