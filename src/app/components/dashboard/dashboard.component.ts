import {
  Component,
  OnInit,
  inject,
  HostListener,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, NgxChartsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  adminService = inject(AdminService);
  elementRef = inject(ElementRef);

  // Stats
  stats: any = {};

  // Charts data
  categoryChartData: any[] = [];

  // UI state
  loading = {
    stats: false,
  };

  // Chart dimensions
  containerWidth = 700;
  containerHeight = 400;

  // Chart options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Category';
  showYAxisLabel = true;
  yAxisLabel = 'Amount';
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#5AA454',
      '#A10A28',
      '#C7B42C',
      '#AAAAAA',
      '#8A2BE2',
      '#FF5733',
      '#4682B4',
    ],
  };

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Set chart container dimensions based on the container size
    this.updateChartDimensions();
  }

  @HostListener('window:resize')
  updateChartDimensions() {
    const chartContainer =
      this.elementRef.nativeElement.querySelector('.chart-container');
    if (chartContainer) {
      this.containerWidth = chartContainer.clientWidth;
      this.containerHeight = Math.min(
        400,
        Math.max(300, this.containerWidth * 0.5)
      );
    }
  }

  @HostListener('window:resize')
  onResize() {
    // Force chart redraw on window resize
    this.categoryChartData = [...this.categoryChartData];
  }

  loadStats(): void {
    this.loading.stats = true;
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;

        // Transform category distribution for chart
        this.categoryChartData = this.stats.categoryDistribution.map(
          (item: any) => {
            return {
              name: item._id,
              value: item.total,
            };
          }
        );

        this.loading.stats = false;
        // Update chart dimensions after data is loaded
        setTimeout(() => this.updateChartDimensions(), 0);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading.stats = false;
      },
    });
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
