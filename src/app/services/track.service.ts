import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Visit } from '../models/visit.model';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  apiURL = (environment as any).trackingApiUrl || 'https://visitor-tracking-api.vercel.app/api/visit';
  http = inject(HttpClient);

  public uniqueVisitors = signal<number>(0);
  private readonly SESSION_ID_KEY = 'visitor_session_id';

  constructor() {
    this.initSessionId();
  }

  private initSessionId(): string {
    if (typeof sessionStorage === 'undefined') return '';
    let sessionId = sessionStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  trackProjectVisit(projectName: string): Observable<Visit> {
    const sessionId = this.initSessionId();

    const payload = {
      projectName,
      path: typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
      referrer: typeof document !== 'undefined' ? document.referrer || 'Direct' : 'Direct',
      sessionId,
    };

    return this.http.post<Visit>(this.apiURL, payload).pipe(
      tap((res) => {
        if (res && typeof res.uniqueVisitors === 'number' && res.uniqueVisitors > 0) {
          this.uniqueVisitors.set(res.uniqueVisitors);
        }
      }),
      catchError((err) => {
        console.warn('[TrackService] Visit tracking notice:', err);
        return of({ message: 'Failed', projectName, uniqueVisitors: this.uniqueVisitors() } as Visit);
      })
    );
  }
}
