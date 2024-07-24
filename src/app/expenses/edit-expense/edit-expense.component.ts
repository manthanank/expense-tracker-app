import { Component, inject, OnInit } from '@angular/core';
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
export class EditExpenseComponent implements OnInit {
  expenseForm: FormGroup = new FormGroup({});
  categories: string[] = [
    'Groceries',
    'Leisure',
    'Electronics',
    'Utilities',
    'Clothing',
    'Health',
    'Others',
  ];
  error: string = '';
  expense: Expense = {} as Expense;
  route = inject(ActivatedRoute);
  expenseService = inject(ExpenseService);
  router = inject(Router);
  private unsubscribe$: Subject<void> = new Subject<void>();
  
  constructor() {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getExpense(id);

    this.expenseForm = new FormGroup({
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      amount: new FormControl('', [Validators.required, Validators.min(0)]),
      category: new FormControl('', Validators.required),
      date: new FormControl(
        new Date().toISOString().split('T')[0],
        Validators.required
      ),
    });
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

  getExpense(id: string | null) {
    this.expenseService.getExpenses({ id }).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res) => {
        // console.log(res);
        this.expense = res[0];
        this.expenseForm.patchValue({
          description: this.expense.description,
          amount: this.expense.amount,
          category: this.expense.category,
        });
        this.expenseForm.patchValue({
          date: this.formatDate(this.expense.date),
        });
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'An error occurred';
      },
    });
  }

  formatDate(date: string): string {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    // getMonth() returns month from 0-11; adding 1 to get 1-12
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const day = newDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    this.expenseService
      .updateExpense(this.expense._id, this.expenseForm.value)
      .subscribe({
        next: (res) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          this.error = err?.error?.message || 'An error occurred';
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
