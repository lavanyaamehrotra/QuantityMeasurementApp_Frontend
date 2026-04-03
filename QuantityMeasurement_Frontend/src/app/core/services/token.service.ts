import { Injectable } from '@angular/core';

const TOKEN_KEY = 'qm_token';
const REFRESH_KEY = 'qm_refresh';

@Injectable({ providedIn: 'root' })
export class TokenService {
  saveTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getRefresh(): string | null {
    return sessionStorage.getItem(REFRESH_KEY);
  }

  clearTokens(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
