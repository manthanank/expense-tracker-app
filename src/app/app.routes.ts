import { Routes } from '@angular/router';
import { EditExpenseComponent } from './expenses/edit-expense/edit-expense.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';
import { ExpenseResolverService } from './core/services/expense-resolver.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./expenses/list-expenses/list-expenses.component').then(
        (m) => m.ListExpensesComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'add-expense',
    component: AddExpenseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-expense/:id',
    component: EditExpenseComponent,
    canActivate: [AuthGuard],
    resolve: {
      expense: ExpenseResolverService
    }
  },
  {
    path: '**',
    redirectTo: '',
  },
];
