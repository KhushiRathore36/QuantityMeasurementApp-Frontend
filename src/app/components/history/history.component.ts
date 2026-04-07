import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface HistoryItem {
  id: number;
  type: 'length' | 'weight' | 'volume' | 'temperature';
  operation: 'convert' | 'compare' | 'add' | 'subtract' | 'multiply' | 'divide';
  firstValue: number;
  firstUnit: string;
  secondValue: number;
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

  constructor(private router: Router) {
    this.loadHistory();
  }

  loadHistory(): void {
    const storedHistory = localStorage.getItem('quantity-history');
    this.allHistory = storedHistory ? JSON.parse(storedHistory) : [];
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredHistory = this.allHistory.filter((item) => {
      const typeMatch = this.typeFilter === 'all' || item.type === this.typeFilter;
      const operationMatch =
        this.operationFilter === 'all' || item.operation === this.operationFilter;
      return typeMatch && operationMatch;
    });
  }

  clearHistory(): void {
    localStorage.removeItem('quantity-history');
    this.allHistory = [];
    this.filteredHistory = [];
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}