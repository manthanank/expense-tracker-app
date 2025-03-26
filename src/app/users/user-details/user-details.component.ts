import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [NgClass],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  userId: string = '';
  user: any = null;
  userExpenses: any[] = [];

  loading = {
    user: false,
    expenses: false,
  };

  error: string | null = null;

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUserDetails();
      this.loadUserExpenses();
    } else {
      this.error = 'User ID not provided';
    }
  }

  loadUserDetails(): void {
    this.loading.user = true;
    this.adminService.getUserDetails(this.userId).subscribe({
      next: (data) => {
        this.user = data;
        this.loading.user = false;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.error = 'Failed to load user details';
        this.loading.user = false;
      },
    });
  }

  loadUserExpenses(): void {
    this.loading.expenses = true;
    this.adminService.getUserExpenses(this.userId).subscribe({
      next: (data) => {
        this.userExpenses = data.expenses;
        this.loading.expenses = false;
      },
      error: (error) => {
        console.error('Error loading user expenses:', error);
        this.error = 'Failed to load user expenses';
        this.loading.expenses = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }
}
