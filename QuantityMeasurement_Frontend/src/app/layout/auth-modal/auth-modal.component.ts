import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, AfterViewInit {
  visible = false;
  activeTab: 'login' | 'register' = 'login';

  loginUser = ''; loginPass = ''; loginErr = '';
  regUser = ''; regEmail = ''; regPass = ''; regErr = '';
  showLoginPass = false; showRegPass = false;
  strengthPercent = 0; strengthColor = '';
  loading = false;

  constructor(
    private modalSvc: AuthModalService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.modalSvc.visible$.subscribe(v => {
      this.visible = v;
      if (v) setTimeout(() => this.initGoogle(), 400);
    });
  }

  ngAfterViewInit(): void {
    this.waitForGoogle();
  }

  waitForGoogle(): void {
    const g = (window as any).google;
    if (g?.accounts?.id) { this.initGoogle(); return; }
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      const g2 = (window as any).google;
      if (g2?.accounts?.id) { clearInterval(iv); this.initGoogle(); }
      else if (attempts > 25) clearInterval(iv);
    }, 200);
  }

  initGoogle(): void {
    const g = (window as any).google;
    if (!g?.accounts?.id) return;
    g.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (resp: any) => this.handleGoogle(resp),
      auto_select: false
    });
    const b1 = document.getElementById('googleSignInBtn');
    if (b1) g.accounts.id.renderButton(b1, { theme: 'filled_black', size: 'large', width: 280, text: 'signin_with', shape: 'pill', logo_alignment: 'left' });
    const b2 = document.getElementById('googleSignInBtn2');
    if (b2) g.accounts.id.renderButton(b2, { theme: 'filled_black', size: 'large', width: 280, text: 'signup_with', shape: 'pill', logo_alignment: 'left' });
  }

  handleGoogle(resp: any): void {
    this.auth.googleLogin(resp.credential).subscribe({
      next: profile => {
        this.toast.show(`🔵 Welcome ${profile.Username} (Google)`, 'success');
        this.onSuccess();
      },
      error: e => { this.loginErr = 'Google login failed: ' + (e.error?.Message || e.message); }
    });
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.loginErr = ''; this.regErr = '';
  }

  doLogin(): void {
    if (this.loading) return;
    this.loading = true; this.loginErr = '';
    this.auth.login(this.loginUser, this.loginPass).subscribe({
      next: profile => { this.toast.show(`⚡ Welcome ${profile.Username}`, 'success'); this.onSuccess(); this.loading = false; },
      error: e => { this.loginErr = e.error?.Message || e.message || 'Login failed'; this.loading = false; }
    });
  }

  doRegister(): void {
    if (this.loading) return;
    this.loading = true; this.regErr = '';
    this.auth.register(this.regUser, this.regEmail, this.regPass).subscribe({
      next: profile => { this.toast.show(`⚡ Welcome ${profile.Username}`, 'success'); this.onSuccess(); this.loading = false; },
      error: e => { this.regErr = e.error?.Message || e.message || 'Registration failed'; this.loading = false; }
    });
  }

  onSuccess(): void {
    const pending = this.modalSvc.getPendingNav();
    this.modalSvc.close();
    if (pending) this.router.navigate([pending]);
  }

  close(): void { this.modalSvc.close(); }

  toggleTheme(): void {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('qm_theme', next);
  }

  updateStrength(pw: string): void {
    let s = 0;
    if (pw.length >= 6) s++; if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    this.strengthPercent = (s / 5) * 100;
    this.strengthColor = s <= 1 ? 'linear-gradient(135deg,#ef4444,#f97316)' :
      s <= 2 ? 'linear-gradient(135deg,#f97316,#eab308)' :
      s <= 3 ? 'linear-gradient(135deg,#eab308,#10b981)' :
               'linear-gradient(135deg,#10b981,#06b6d4,#7c3aed)';
  }
}
