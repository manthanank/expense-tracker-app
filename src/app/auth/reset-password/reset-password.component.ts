import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup({});
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  token: string;

  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  constructor() {
    this.token = this.route.snapshot.paramMap.get('token')!;
  }

  ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  // Add getter for password field
  get password() {
    return this.resetPasswordForm.get('password');
  }

  // Add getter for confirmPassword field  
  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((state) => !state);
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) return;

    const password = this.resetPasswordForm.value.password;
    const confirmPassword = this.resetPasswordForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.resetPasswordForm.setErrors({ passwordMismatch: true });
      return;
    }

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => console.error(err)
    });
  }
}
