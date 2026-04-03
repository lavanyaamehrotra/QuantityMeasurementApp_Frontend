import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { UserProfile } from '../../core/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isLoggedIn = false;
  loading = false;

  constructor(
    private auth: AuthService,
    private token: TokenService,
    private toast: ToastService,
    private authModal: AuthModalService
  ) {}

  ngOnInit(): void {
    this.auth.profile$.subscribe(p => {
      this.profile = p;
      this.isLoggedIn = !!p;
    });
    this.isLoggedIn = this.auth.isLoggedIn;
    this.profile = this.auth.currentProfile;
  }

  get avatarLetter(): string { return (this.profile?.Username || 'U')[0].toUpperCase(); }
  get tokenStatus(): string  { return this.token.isLoggedIn() ? '🟢 Active' : '🔴 Not signed in'; }

  openLogin(): void { this.authModal.open('/profile'); }

  refreshProfile(): void {
    this.loading = true;
    this.auth.getProfile().subscribe({
      next: p => { this.profile = p; this.toast.show('Profile refreshed', 'success'); this.loading = false; },
      error: e => { this.toast.show(e.error?.Message || e.message, 'error'); this.loading = false; }
    });
  }
}
