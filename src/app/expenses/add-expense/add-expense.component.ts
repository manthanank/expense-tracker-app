import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
})
export class AddExpenseComponent implements OnInit {
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

  expenseService = inject(ExpenseService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
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

  onSubmit() {
    const expense = {
      description: this.expenseForm.value.description,
      amount: this.expenseForm.value.amount,
      category: this.expenseForm.value.category,
      date: new Date(this.expenseForm.value.date).toISOString(),
    };
    this.expenseService.addExpense(expense).subscribe({
      next: (res) => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'An error occurred';
      },
    });
  }
}
