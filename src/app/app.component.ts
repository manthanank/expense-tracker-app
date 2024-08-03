import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'expense-tracker-app';

  meta = inject(Meta);

  constructor() {
    this.meta.addTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
    this.meta.addTag({ name: 'icon', content: 'image/x-icon', href: 'favicon.ico' });
    this.meta.addTag({ name: 'canonical', content: 'https://expense-tracker-app-manthanank.vercel.app/' });
    this.meta.addTag({ property: 'og:title', content: 'Expense Tracker App' });
    this.meta.addTag({ name: 'author', content: 'Manthan Ankolekar' });
    this.meta.addTag({ name: 'keywords', content: 'angular, nodejs. express, mongodb' });
    this.meta.addTag({ name: 'robots', content: 'index, follow' });
    this.meta.addTag({ property: 'og:description', content: 'A simple expense tracker app, built with Angular. It helps you to track your expenses. You can add, edit, delete, and filter your expenses.' });
    this.meta.addTag({ property: 'og:image', content: 'https://expense-tracker-app-manthanank.vercel.app/image.jpg' });
    this.meta.addTag({ property: 'og:url', content: 'https://expense-tracker-app-manthanank.vercel.app/' });
  }
}
