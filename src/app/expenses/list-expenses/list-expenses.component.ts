import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-list-expenses',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './list-expenses.component.html',
  styleUrl: './list-expenses.component.scss',
})
export class ListExpensesComponent {
  expenses: any[] = [];
  filter: string = '';
  startDate: string = '';
  endDate: string = '';
  error: string = '';

  expenseService = inject(ExpenseService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.getExpenses();
  }

  getExpenses(params: any = {}) {
    this.expenseService.getExpenses(params).subscribe({
      next: (res) => {
        this.expenses = res;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'An error occurred';
      },
    });
  }

  onFilterChange(event: any) {
    this.filter = event.target.value;
    if (this.filter !== 'custom') {
      this.applyFilter();
    }
  }

  applyFilter() {
    const params: any = {};
    if (this.filter === 'week') {
      params.startDate = this.getPastDate(7);
    } else if (this.filter === 'month') {
      params.startDate = this.getPastDate(30);
    } else if (this.filter === '3months') {
      params.startDate = this.getPastDate(90);
    }
    this.getExpenses(params);
  }

  applyCustomFilter() {
    if (this.startDate && this.endDate) {
      const params = { startDate: this.startDate, endDate: this.endDate };
      this.getExpenses(params);
    }
  }

  getPastDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  editExpense(expense: any) {
    this.router.navigate(['/edit-expense', expense._id]);
  }

  deleteExpense(id: string) {
    this.expenseService.deleteExpense(id).subscribe({
      next: (res) => {
        this.getExpenses();
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'An error occurred';
      },
    });
  }
}
