import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  apiURL = 'https://visitor-tracking-api.vercel.app/api/visit';

  http = inject(HttpClient);

  constructor() {}

  trackProjectVisit(projectName: string) {
    this.http
      .post(this.apiURL, {
        projectName: projectName,
      })
      .subscribe({
        next: (res) => console.log(res),
        error: (err) => console.error(err),
      });
  }
}