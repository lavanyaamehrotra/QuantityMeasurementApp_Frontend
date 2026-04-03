import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { QuantityService } from '../../core/services/quantity.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { QuantityMeasurementDto } from '../../core/models';

type FilterType = 'me' | 'operation' | 'type' | 'errored';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  isLoggedIn = false;
  loading = false;
  records: QuantityMeasurementDto[] = [];
  filterType: FilterType = 'me';
  filterVal = 'CONVERT';
  countBadge = '';

  operations = ['CONVERT', 'COMPARE', 'ADD', 'SUBTRACT', 'DIVIDE'];
  measureTypes = ['LENGTH', 'WEIGHT', 'VOLUME', 'TEMPERATURE'];

  constructor(
    private auth: AuthService,
    private qty: QuantityService,
    private toast: ToastService,
    private authModal: AuthModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.profile$.subscribe(p => { this.isLoggedIn = !!p; });
    this.isLoggedIn = this.auth.isLoggedIn;
  }

  get showFilterVal(): boolean { return this.filterType === 'operation' || this.filterType === 'type'; }
  get showCountBtn(): boolean  { return this.filterType === 'operation'; }
  get filterOptions(): string[] { return this.filterType === 'type' ? this.measureTypes : this.operations; }

  onFilterTypeChange(): void { this.filterVal = this.filterOptions[0]; }

  openLogin(): void { this.authModal.open('/history'); }

  fetchHistory(): void {
    this.loading = true; this.records = [];
    const obs = this.filterType === 'me'        ? this.qty.getMyHistory() :
                this.filterType === 'errored'   ? this.qty.getErroredHistory() :
                this.filterType === 'operation' ? this.qty.getHistoryByOperation(this.filterVal) :
                                                  this.qty.getHistoryByType(this.filterVal);
    obs.subscribe({
      next: data => { this.records = data; this.loading = false; },
      error: e => {
        const msg = e.error?.Message || e.message || 'Failed to load history';
        this.toast.show(msg, 'error');
        this.loading = false;
        if (e.status === 401) { this.auth.logout(); this.authModal.open('/history'); }
      }
    });
  }

  fetchCount(): void {
    this.qty.getCountByOperation(this.filterVal).subscribe({
      next: res => {
        this.countBadge = `${this.filterVal}: ${res.count}`;
        setTimeout(() => this.countBadge = '', 4000);
      },
      error: e => this.toast.show(e.error?.Message || e.message, 'error')
    });
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleString();
  }
}
