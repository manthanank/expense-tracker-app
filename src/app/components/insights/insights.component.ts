import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InsightService } from '../../core/services/insight.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
})
export class InsightsComponent implements OnInit {
  insightService = inject(InsightService);
  fb = inject(FormBuilder);

  insights = signal<any>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  filterForm: FormGroup;
  categories = [
    'All Categories',
    'Groceries',
    'Leisure',
    'Electronics',
    'Utilities',
    'Clothing',
    'Health',
    'Others',
  ];

  constructor() {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      category: ['All Categories'],
    });
  }

  ngOnInit(): void {
    this.getInsights();
  }

  getInsights(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters: any = {};
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    const category = this.filterForm.get('category')?.value;

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    if (category && category !== 'All Categories') {
      filters.category = category;
    }

    this.insightService.getAIInsights(filters).subscribe({
      next: (data) => {
        this.insights.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading insights:', err);
        this.error.set(
          err?.error?.message || 'An error occurred while loading insights'
        );
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.getInsights();
  }

  resetFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      category: 'All Categories',
    });
    this.getInsights();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  // Helper methods to handle the simplified response structure
  getMonthlySpendingData(): any[] {
    if (!this.insights() || !this.insights().insights?.trends) {
      return [];
    }
    return this.insights().insights.trends;
  }

  getMonthSpendingPercentage(monthData: any): string {
    if (!this.insights() || !this.insights().insights?.trends) {
      return '0%';
    }

    const trends = this.insights().insights.trends;
    const maxAmount = Math.max(...trends.map((t: any) => t.amount));
    
    if (!maxAmount) return '0%';
    return (monthData.amount / maxAmount) * 100 + '%';
  }

  getCategoryPercentage(category: any): string {
    if (!this.insights() || !this.insights().insights?.topCategories || this.insights().insights.topCategories.length === 0) {
      return '0%';
    }

    const topCategories = this.insights().insights.topCategories;
    const maxAmount = topCategories[0].amount;
    
    if (!maxAmount) return '0%';
    return (category.amount / maxAmount) * 100 + '%';
  }

  getSuggestions(): string[] {
    if (!this.insights() || !this.insights().insights?.suggestions) {
      return [];
    }
    return this.insights().insights.suggestions;
  }

  getBudgetHealth(): string {
    if (!this.insights() || !this.insights().insights?.budgetHealth) {
      return '';
    }
    return this.insights().insights.budgetHealth;
  }
}