import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { Meta } from '@angular/platform-browser';
import { TrackService } from './services/track.service';
import { Visit } from './models/visit.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'expense-tracker-app';

  visitorCount = signal<number>(0);
  isVisitorCountLoading = signal<boolean>(false);
  visitorCountError = signal<string | null>(null);

  meta = inject(Meta);
  trackService = inject(TrackService);

  constructor() {
    this.meta.addTag({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    });
    this.meta.addTag({
      name: 'icon',
      content: 'image/x-icon',
      href: 'favicon.ico',
    });
    this.meta.addTag({
      name: 'canonical',
      content: 'https://expense-tracker-app-manthanank.vercel.app/',
    });
    this.meta.addTag({ property: 'og:title', content: 'Expense Tracker App' });
    this.meta.addTag({ name: 'author', content: 'Manthan Ankolekar' });
    this.meta.addTag({
      name: 'keywords',
      content: 'angular, nodejs. express, mongodb',
    });
    this.meta.addTag({ name: 'robots', content: 'index, follow' });
    this.meta.addTag({
      property: 'og:description',
      content:
        'A simple expense tracker app, built with Angular. It helps you to track your expenses. You can add, edit, delete, and filter your expenses.',
    });
    this.meta.addTag({
      property: 'og:image',
      content: 'https://expense-tracker-app-manthanank.vercel.app/image.jpg',
    });
    this.meta.addTag({
      property: 'og:url',
      content: 'https://expense-tracker-app-manthanank.vercel.app/',
    });
  }

  ngOnInit(): void {
    this.trackVisit();
  }

  private trackVisit(): void {
    this.isVisitorCountLoading.set(true);
    this.visitorCountError.set(null);

    this.trackService.trackProjectVisit(this.title).subscribe({
      next: (response: Visit) => {
        this.visitorCount.set(response.uniqueVisitors);
        this.isVisitorCountLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Failed to track visit:', err);
        this.visitorCountError.set('Failed to load visitor count');
        this.isVisitorCountLoading.set(false);
      },
    });
  }
}
