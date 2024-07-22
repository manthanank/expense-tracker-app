import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Expense } from '../../core/models/expense.model';

@Component({
  selector: 'app-list-expenses',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './list-expenses.component.html',
  styleUrl: './list-expenses.component.scss',
})
export class ListExpensesComponent implements OnInit {
  filterForm: FormGroup = new FormGroup({});
  expenses: Expense[] = [];
  filter: string = '';
  startDate: string = '';
  endDate: string = '';
  error: string = '';
  errorMsg: string = '';
  showConfirmDialog = false;
  selectedExpenseId = '';
  isLoading = false;
  minDate: string = '';
  submitted: boolean = false;

  expenseService = inject(ExpenseService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.filterForm = new FormGroup({
      filter: new FormControl(''),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });
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

  onFilterChange() {
    const filterValue = this.filterForm.get('filter')?.value;
    this.filter = filterValue;
    if (this.filter !== 'custom') {
      this.applyFilter();
    }
    this.filterForm.get('startDate')?.reset();
    this.filterForm.get('endDate')?.reset();
    this.submitted = false;
  }

  applyFilter() {
    const params: any = {};
    const filterValue = this.filterForm.get('filter')?.value; // Use the form control value with optional chaining

    if (filterValue === 'week') {
      params.startDate = this.getPastDate(7);
      params.endDate = new Date().toISOString().split('T')[0];
    } else if (filterValue === 'month') {
      params.startDate = this.getPastDate(30);
      params.endDate = new Date().toISOString().split('T')[0];
    } else if (filterValue === '3months') {
      params.startDate = this.getPastDate(90);
      params.endDate = new Date().toISOString().split('T')[0];
    }
    this.getExpenses(params);
  }

  applyCustomFilter() {
    this.submitted = true;
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    const params: any = { startDate, endDate };
    if (startDate && endDate) {
      this.getExpenses(params);
    }
  }

  onStartDateChange() {
    this.minDate = this.filterForm.get('startDate')?.value;
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
