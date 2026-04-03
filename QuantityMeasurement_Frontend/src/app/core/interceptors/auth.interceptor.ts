import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private token: TokenService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const t = this.token.getToken();
    const authReq = t ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !req.url.includes('/users/refresh')) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const rt = this.token.getRefresh();
    if (!rt) return throwError(() => new Error('Unauthorized'));

    if (!this.refreshing) {
      this.refreshing = true;
      this.refreshSubject.next(null);
      return this.http.post<any>(`${environment.apiBase}/users/refresh`, { RefreshToken: rt }).pipe(
        switchMap(res => {
          this.refreshing = false;
          this.token.saveTokens(res.AccessToken, res.RefreshToken);
          this.refreshSubject.next(res.AccessToken);
          return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${res.AccessToken}` } }));
        }),
        catchError(e => {
          this.refreshing = false;
          this.token.clearTokens();
          return throwError(() => e);
        })
      );
    }

    return this.refreshSubject.pipe(
      filter(t => t !== null), take(1),
      switchMap(t => next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })))
    );
  }
}
