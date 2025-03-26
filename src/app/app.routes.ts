import { Routes } from '@angular/router';
import { EditExpenseComponent } from './expenses/edit-expense/edit-expense.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';
import { ExpenseResolverService } from './core/services/expense-resolver.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./users/user-details/user-details.component').then(
            (m) => m.UserDetailsComponent
          ),
      },
    ],
  },
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
    path: 'expenses',
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
      expense: ExpenseResolverService,
    },
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service.component').then(
        (m) => m.TermsOfServiceComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
