import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-social-auth',
  imports: [],
  templateUrl: './social-auth.component.html',
  styleUrl: './social-auth.component.scss'
})
export class SocialAuthComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Get query parameters from the URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const expiresIn = +params['expiresIn'];
      const email = params['email'];
      const userId = params['userId'];
      const role = params['role'];

      if (token && email) {
        // Store user data and token
        const userData = {
          id: userId,
          email: email,
          role: role || 'user'
        };
        
        // Use the auth service to handle the authentication
        this.authService.handleSocialAuth(token, expiresIn, userData);
        
        // Redirect to expenses page
        this.router.navigate(['/expenses']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}