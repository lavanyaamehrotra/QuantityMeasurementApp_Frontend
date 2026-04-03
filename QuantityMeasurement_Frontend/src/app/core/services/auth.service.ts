import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { TokenService } from './token.service';
import { ToastService } from './toast.service';
import { ApiService } from './api.service';
import { UserProfile, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor(
    private api: ApiService,
    private token: TokenService,
    private toast: ToastService
  ) {}

  get isLoggedIn(): boolean {
    return this.token.isLoggedIn();
  }

  get currentProfile(): UserProfile | null {
    return this.profileSubject.getValue();
  }

  login(username: string, password: string): Observable<UserProfile> {
    return this.api.post<AuthResponse>('/users/login', { Username: username, Password: password }).pipe(
      tap(res => this.token.saveTokens(res.AccessToken, res.RefreshToken)),
      switchMap(() => this.api.get<UserProfile>('/users/profile')),
      tap(profile => this.profileSubject.next(profile))
    );
  }

  register(username: string, email: string, password: string): Observable<UserProfile> {
    return this.api.post<AuthResponse>('/users/register', { Username: username, Email: email, Password: password }).pipe(
      tap(res => this.token.saveTokens(res.AccessToken, res.RefreshToken)),
      switchMap(() => this.api.get<UserProfile>('/users/profile')),
      tap(profile => this.profileSubject.next(profile))
    );
  }

  googleLogin(idToken: string): Observable<UserProfile> {
    return this.api.post<AuthResponse>('/users/google-login', { IdToken: idToken }).pipe(
      tap(res => this.token.saveTokens(res.AccessToken, res.RefreshToken)),
      switchMap(() => this.api.get<UserProfile>('/users/profile')),
      tap(profile => this.profileSubject.next(profile))
    );
  }

  restoreSession(): void {
    if (!this.token.isLoggedIn()) return;
    this.api.get<UserProfile>('/users/profile').subscribe({
      next: profile => this.profileSubject.next(profile),
      error: () => { this.token.clearTokens(); this.profileSubject.next(null); }
    });
  }

  logout(): void {
    this.token.clearTokens();
    this.profileSubject.next(null);
    try {
      const g = (window as any).google;
      if (g?.accounts?.id) g.accounts.id.disableAutoSelect();
    } catch {}
  }

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/users/profile').pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }
}
