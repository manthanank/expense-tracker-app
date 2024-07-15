import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-expense',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './edit-expense.component.html',
  styleUrl: './edit-expense.component.scss',
})
export class EditExpenseComponent {
  expense: any = { description: '', amount: 0, category: '', date: '' };
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

  route = inject(ActivatedRoute);
  expenseService = inject(ExpenseService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getExpense(id);
  }

  getExpense(id: string | null) {
    this.expenseService.getExpenses({ id }).subscribe({
      next: (res) => {
        this.expense = res[0];
        this.expense.date = this.formatDate(this.expense.date);
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'An error occurred';
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Converts to "yyyy-MM-dd" format
  }

  onSubmit() {
    this.expenseService
      .updateExpense(this.expense._id, this.expense)
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
}
