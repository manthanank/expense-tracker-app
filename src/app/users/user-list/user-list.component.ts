import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  adminService = inject(AdminService);
  router = inject(Router);
  fb = inject(FormBuilder);

  // Add Math as a property so it can be accessed in the template
  Math = Math;

  users: any[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  pageSize = 10;

  // Search
  searchForm: FormGroup;

  constructor() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // Subscribe to search input changes with debounce
    this.searchForm
      .get('searchTerm')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.currentPage = 1; // Reset to first page on new search
        this.loadUsers(this.currentPage, this.pageSize, term);
      });
  }

  loadUsers(page = 1, limit = 10, search = ''): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAllUsers(page, limit, search).subscribe({
      next: (data) => {
        this.users = data.users;
        this.totalUsers = data.pagination.total;
        this.totalPages = data.pagination.pages;
        this.currentPage = data.pagination.page;
        this.pageSize = data.pagination.limit;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      },
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadUsers(
        this.currentPage + 1,
        this.pageSize,
        this.searchForm.get('searchTerm')?.value
      );
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadUsers(
        this.currentPage - 1,
        this.pageSize,
        this.searchForm.get('searchTerm')?.value
      );
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadUsers(
        page,
        this.pageSize,
        this.searchForm.get('searchTerm')?.value
      );
    }
  }

  viewUserDetails(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Helper method to generate page numbers for pagination
  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];

    if (this.totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // Add ellipsis if current page is > 3
      if (this.currentPage > 3) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }

      // Add pages around current page
      const startPage = Math.max(2, this.currentPage - 1);
      const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if current page < totalPages - 2
      if (this.currentPage < this.totalPages - 2) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }

      // Always include last page
      pageNumbers.push(this.totalPages);
    }

    return pageNumbers;
  }
}
