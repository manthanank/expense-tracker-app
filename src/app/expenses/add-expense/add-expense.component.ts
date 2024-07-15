import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
})
export class AddExpenseComponent {
  description: string = '';
  amount: number = 0;
  category: string = '';
  date: string = '';
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

  onSubmit() {
    const expense = {
      description: this.description,
      amount: this.amount,
      category: this.category,
      date: new Date(this.date),
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
