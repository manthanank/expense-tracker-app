import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  visitorCount = input<number>(0);
  isVisitorCountLoading = input<boolean>(false);
  visitorCountError = input<string | null>(null);

  currentYear = new Date().getFullYear();
  authService = inject(AuthService);

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
