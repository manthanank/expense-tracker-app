import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Expense } from '../../core/models/expense.model';

@Component({
  selector: 'app-list-expenses',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './list-expenses.component.html',
  styleUrl: './list-expenses.component.scss',
})
export class ListExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  filter: string = '';
  startDate: string = '';
  endDate: string = '';
  error: string = '';
  errorMsg: string = '';
  showConfirmDialog = false;
  selectedExpenseId = '';
  isLoading = false;

  expenseService = inject(ExpenseService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.getExpenses();
  }

  getExpenses(params: any = {}) {
    this.isLoading = true;
    this.expenseService.getExpenses(params).subscribe({
      next: (res) => {
        this.expenses = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'An error occurred';
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
      params.endDate = new Date().toISOString().split('T')[0];
    } else if (this.filter === 'month') {
      params.startDate = this.getPastDate(30);
      params.endDate = new Date().toISOString().split('T')[0];
    } else if (this.filter === '3months') {
      params.startDate = this.getPastDate(90);
      params.endDate = new Date().toISOString().split('T')[0];
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

  showDeleteConfirm(expenseId: string) {
    this.selectedExpenseId = expenseId;
    this.showConfirmDialog = true;
  }

  deleteExpense(id: string) {
    this.expenseService.deleteExpense(id).subscribe({
      next: (res) => {
        this.getExpenses();
        this.showConfirmDialog = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'An error occurred';
      },
    });
  }
}
