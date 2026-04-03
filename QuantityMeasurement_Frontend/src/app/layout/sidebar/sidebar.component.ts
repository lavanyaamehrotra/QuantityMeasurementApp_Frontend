import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models';
import { AuthModalService } from '../../core/services/auth-modal.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  profile: UserProfile | null = null;

  constructor(
    public auth: AuthService,
    public router: Router,
    private authModal: AuthModalService
  ) {}

  ngOnInit(): void {
    this.auth.profile$.subscribe(p => this.profile = p);
  }

  get avatarLetter(): string {
    return (this.profile?.Username || 'U')[0].toUpperCase();
  }

  get isHistoryActive(): boolean {
    return this.router.url === '/history';
  }

  get isProfileActive(): boolean {
    return this.router.url === '/profile';
  }

  onNavHistory(): void {
    if (!this.auth.isLoggedIn) { this.authModal.open('/history'); return; }
    this.router.navigate(['/history']);
  }

  onNavProfile(): void {
    if (!this.auth.isLoggedIn) { this.authModal.open('/profile'); return; }
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/calculator']);
  }

  openAuthModal(): void {
    this.authModal.open(null);
  }
}
