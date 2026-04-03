import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private visibleSubject = new BehaviorSubject<boolean>(false);
  private pendingNavSubject = new BehaviorSubject<string | null>(null);

  visible$ = this.visibleSubject.asObservable();
  pendingNav$ = this.pendingNavSubject.asObservable();

  open(returnTo: string | null = null): void {
    this.pendingNavSubject.next(returnTo);
    this.visibleSubject.next(true);
  }

  close(): void {
    this.visibleSubject.next(false);
    this.pendingNavSubject.next(null);
  }

  getPendingNav(): string | null {
    return this.pendingNavSubject.getValue();
  }
}
