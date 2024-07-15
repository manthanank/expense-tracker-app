import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  authService = inject(AuthService);
  router = inject(Router);

  constructor() {}

  onSubmit() {
    this.authService
      .signup({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          this.error = err?.error?.message || 'An error occurred';
        },
      });
  }
}
