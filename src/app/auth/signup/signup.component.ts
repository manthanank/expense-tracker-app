import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
@Component({
    selector: 'app-signup',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup = new FormGroup({});
  error = signal<string>('');
  showPassword = signal<boolean>(false);

  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    this.signupForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService
        .signup({
          email: this.signupForm.value.email,
          password: this.signupForm.value.password,
        })
        .subscribe({
          next: (res) => {
            localStorage.setItem('token', res.token);
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error(err);
            this.error.set(err?.error?.message || 'An error occurred');
          },
        });
    }
  }
}
