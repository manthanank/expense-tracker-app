import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Expense } from '../../core/models/expense.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-expenses',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './list-expenses.component.html',
  styleUrl: './list-expenses.component.scss',
})
export class ListExpensesComponent implements OnInit {
  filterForm: FormGroup;
  expenses = signal<Expense[]>([]);
  filter = signal<string>('');
  startDate = signal<string>('');
  endDate = signal<string>('');
  error = signal<string>('');
  errorMsg = signal<string>('');
  showConfirmDialog = signal<boolean>(false);
  selectedExpenseId = signal<string>('');
  isLoading = signal<boolean>(false);
  minDate = signal<string>('');
  totalAmount = signal<number>(0);
  private unsubscribe$: Subject<void> = new Subject<void>();

  expenseService = inject(ExpenseService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.filterForm = this.fb.group({
      filter: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.getExpenses();
  }

  getExpenses(params: any = {}) {
    this.isLoading.set(true);
    this.expenseService
      .getExpenses(params)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
          this.expenses.set(res.expenses);
          this.totalAmount.set(res.totalAmount);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          this.errorMsg.set(err?.error?.message || 'An error occurred');
        },
      });
  }

  onFilterChange() {
    const filterValue = this.filterForm.get('filter')?.value;
    this.filter.set(filterValue);
    if (this.filterForm.value !== 'custom') {
      this.applyFilter();
    }
    this.filterForm.get('startDate')?.reset();
    this.filterForm.get('endDate')?.reset();
  }

  applyFilter() {
    const params: any = {};
    const filterValue = this.filterForm.get('filter')?.value;

    if (filterValue === 'week') {
      params.startDate = this.getPastDate(7) + 'T00:00:00.000Z';
      params.endDate =
        new Date().toISOString().split('T')[0] + 'T23:59:59.999Z';
      params.period = 'week';
      this.getExpenses(params);
    } else if (filterValue === 'month') {
      params.startDate = this.getPastDate(30) + 'T00:00:00.000Z';
      params.endDate =
        new Date().toISOString().split('T')[0] + 'T23:59:59.999Z';
      params.period = 'month';
      this.getExpenses(params);
    } else if (filterValue === '3months') {
      params.startDate = this.getPastDate(90) + 'T00:00:00.000Z';
      params.endDate =
        new Date().toISOString().split('T')[0] + 'T23:59:59.999Z';
      params.period = '3months';
      this.getExpenses(params);
    } else if (filterValue === 'custom') {
      params.startDate = this.filterForm.get('startDate')?.value;
      params.endDate = this.filterForm.get('endDate')?.value;
      params.period = 'custom';
      this.expenses.set([]);
      this.totalAmount.set(0);
    } else {
      this.getExpenses(params);
    }
  }

  applyCustomFilter() {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    if (startDate && endDate) {
      const params = {
        startDate: new Date(startDate).toISOString(),
        endDate:
          new Date(endDate).toISOString().split('T')[0] + 'T23:59:59.999Z',
        period: 'custom',
      };
      this.getExpenses(params);
    }
  }

  resetCustomFilter() {
    this.filterForm.get('startDate')?.reset();
    this.filterForm.get('endDate')?.reset();
    this.expenses.set([]);
    this.totalAmount.set(0);
  }

  onStartDateChange() {
    this.minDate.set(this.filterForm.get('startDate')?.value);
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
    this.selectedExpenseId.set(expenseId);
    this.showConfirmDialog.set(true);
  }

  deleteExpense(id: string) {
    this.expenseService
      .deleteExpense(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.getExpenses();
          this.showConfirmDialog.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'An error occurred');
        },
      });
  }
}
