import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Expense } from '../../core/models/expense.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-expense',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-expense.component.html',
  styleUrl: './edit-expense.component.scss',
})
export class EditExpenseComponent implements OnInit, OnDestroy {
  expenseForm: FormGroup;
  categories: string[] = [
    'Groceries',
    'Leisure',
    'Electronics',
    'Utilities',
    'Clothing',
    'Health',
    'Others',
  ];
  error = signal<string>('');
  expense = signal<Expense>({} as Expense);
  route = inject(ActivatedRoute);
  expenseService = inject(ExpenseService);
  router = inject(Router);
  private unsubscribe$ = new Subject<void>();

  constructor() {
    this.expenseForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.minLength(3)]),
      amount: new FormControl('', [Validators.required, Validators.min(0)]),
      category: new FormControl('', Validators.required),
      date: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
    });
  }

  ngOnInit() {
    this.route.data.subscribe(
      {
        next: (res) => {
          this.expense.set(res['expense']);
          this.expenseForm.patchValue({
            description: this.expense().description,
            amount: this.expense().amount,
            category: this.expense().category,
            date: this.formatDate(this.expense().date),
          });
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'An error occurred');
        },
      }
    );
  }

  get description() {
    return this.expenseForm.get('description');
  }

  get amount() {
    return this.expenseForm.get('amount');
  }

  get category() {
    return this.expenseForm.get('category');
  }

  get date() {
    return this.expenseForm.get('date');
  }

  formatDate(date: string): string {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const day = newDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  reset() {
    this.expenseForm.get('description')?.reset();
    this.expenseForm.get('amount')?.reset();
    this.expenseForm.get('category')?.reset();
  }

  onSubmit() {
    this.expenseService.updateExpense(this.expense()._id, this.expenseForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'An error occurred');
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
