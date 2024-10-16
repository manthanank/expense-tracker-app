import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Expense } from '../../core/models/expense.model';
import { Subject, takeUntil } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-list-expenses',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, ToastModule],
  templateUrl: './list-expenses.component.html',
  styleUrl: './list-expenses.component.scss',
  providers: [MessageService]
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

  private readonly DATE_FORMAT = 'T00:00:00.000Z';
  private readonly END_DATE_FORMAT = 'T23:59:59.999Z';

  expenseService = inject(ExpenseService);
  router = inject(Router);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);

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
    const params: any = {};

    switch (filterValue) {
      case 'week':
        this.setParams(params, 7, 'week');
        break;
      case 'month':
        this.setParams(params, 30, 'month');
        break;
      case '3months':
        this.setParams(params, 90, '3months');
        break;
      case '6months':
        this.setParams(params, 180, '6months');
        break;
      case 'custom':
        this.resetCustomFilter();
        return;
      default:
        this.getExpenses();
        return;
    }
    this.getExpenses(params);
  }

  private setParams(params: any, days: number, period: string) {
    params.startDate = this.getPastDate(days) + this.DATE_FORMAT;
    params.endDate = new Date().toISOString().split('T')[0] + this.END_DATE_FORMAT;
    params.period = period;
  }

  applyCustomFilter() {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    if (startDate && endDate) {
      const params = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString().split('T')[0] + this.END_DATE_FORMAT,
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
        next: () => {
          this.getExpenses();
          this.showConfirmDialog.set(false);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense deleted successfully' });
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'An error occurred');
        },
      });
  }
}