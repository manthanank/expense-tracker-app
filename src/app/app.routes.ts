import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { EditExpenseComponent } from './expenses/edit-expense/edit-expense.component';
import { ListExpensesComponent } from './expenses/list-expenses/list-expenses.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: '', component: ListExpensesComponent, canActivate: [AuthGuard] },
  {
    path: 'add-expense',
    component: AddExpenseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-expense/:id',
    component: EditExpenseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  }
];
