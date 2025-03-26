import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { UserListComponent } from "../user-list/user-list.component";
import { UserDetailsComponent } from "../user-details/user-details.component";

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, RouterModule, UserListComponent, UserDetailsComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  adminService = inject(AdminService);
  
  // Users
  users: any[] = [];
  selectedUser: any = null;
  userExpenses: any[] = [];
  
  // UI state
  loading = {
    users: false,
    userDetails: false
  };
  
  // Modal state
  isModalOpen = false;
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading.users = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading.users = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.users = false;
      }
    });
  }
  
  selectUser(user: any): void {
    this.selectedUser = user;
    this.loadUserExpenses(user._id);
  }
  
  loadUserExpenses(userId: string): void {
    this.loading.userDetails = true;
    this.adminService.getUserExpenses(userId).subscribe({
      next: (data) => {
        this.userExpenses = data.expenses;
        this.loading.userDetails = false;
      },
      error: (error) => {
        console.error('Error loading user expenses:', error);
        this.loading.userDetails = false;
      }
    });
  }
  
  openUserDetailsModal(user: any): void {
    this.selectUser(user);
    this.isModalOpen = true;
    document.body.classList.add('overflow-hidden');
  }
  
  closeModal(): void {
    this.isModalOpen = false;
    document.body.classList.remove('overflow-hidden');
  }
  
  // Format helpers
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
