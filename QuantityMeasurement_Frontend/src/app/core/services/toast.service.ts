import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts$ = new BehaviorSubject<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info'): void {
    const id = ++this.counter;
    const current = this.toasts$.getValue();
    this.toasts$.next([...current, { id, message, type }]);
    setTimeout(() => this.remove(id), 3200);
  }

  remove(id: number): void {
    this.toasts$.next(this.toasts$.getValue().filter(t => t.id !== id));
  }
}
