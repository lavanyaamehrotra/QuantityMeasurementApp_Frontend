import { Component, OnInit } from '@angular/core';
import { QuantityService } from '../../core/services/quantity.service';
import { TokenService } from '../../core/services/token.service';
import { ToastService } from '../../core/services/toast.service';
import { UNIT_MAP, QuantityMeasurementDto } from '../../core/models';

type MeasurementType = 'LENGTH' | 'WEIGHT' | 'VOLUME' | 'TEMPERATURE';
type Operation = 'convert' | 'compare' | 'add' | 'subtract' | 'divide';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent {
  measurementTypes: MeasurementType[] = ['LENGTH', 'WEIGHT', 'VOLUME', 'TEMPERATURE'];
  operations: { key: Operation; label: string; desc: string }[] = [
    { key: 'convert',  label: '⇄ CONVERT',  desc: 'Transform from one unit to another. E.g. 10 km → miles' },
    { key: 'compare',  label: '⚖ COMPARE',  desc: 'Find which of two measurements is larger or smaller.' },
    { key: 'add',      label: '➕ ADD',      desc: 'Sum two measurements, auto-converting to a common unit.' },
    { key: 'subtract', label: '− SUBTRACT', desc: 'Subtract one measurement from another.' },
    { key: 'divide',   label: '➗ DIVIDE',   desc: 'Divide the first measurement by the second.' },
  ];

  selectedType: MeasurementType = 'LENGTH';
  selectedOp: Operation = 'convert';

  // Convert mode
  val1 = ''; unit1 = ''; unit2 = '';
  // Dual mode
  val1Dual = ''; unit1Dual = ''; val2Dual = ''; unit2Dual = '';

  resultText = '— waiting —';
  resultMeta = '';
  loading = false;

  get units(): string[] { return UNIT_MAP[this.selectedType] || []; }
  get isConvert(): boolean { return this.selectedOp === 'convert'; }

  constructor(
    private qty: QuantityService,
    private token: TokenService,
    private toast: ToastService
  ) {}

  setType(type: MeasurementType): void {
    this.selectedType = type;
    this.unit1 = ''; this.unit2 = ''; this.unit1Dual = ''; this.unit2Dual = '';
  }

  setOp(op: Operation): void {
    this.selectedOp = op;
    this.resultText = '— waiting —';
    this.resultMeta = '';
  }

  calculate(): void {
    if (this.loading) return;
    try {
      const type = this.selectedType;
      let v1: number, u1: string, v2: number, u2: string;

      if (this.isConvert) {
        v1 = parseFloat(this.val1);
        u1 = this.unit1; u2 = this.unit2; v2 = 0;
        if (isNaN(v1)) throw new Error('Value is required');
        if (!u1) throw new Error('From unit is required');
        if (!u2) throw new Error('To unit is required');
        if (u1 === u2) throw new Error('From and To units must be different');
      } else {
        v1 = parseFloat(this.val1Dual); u1 = this.unit1Dual;
        v2 = parseFloat(this.val2Dual); u2 = this.unit2Dual;
        if (isNaN(v1)) throw new Error('Value 1 is required');
        if (isNaN(v2)) throw new Error('Value 2 is required');
        if (!u1 || !u2) throw new Error('Both units are required');
      }

      const payload = {
        ThisQuantityDTO: { Value: v1, Unit: u1, MeasurementType: type },
        ThatQuantityDTO: { Value: v2, Unit: u2, MeasurementType: type },
      };

      this.loading = true;
      const call = this.selectedOp === 'convert' ? this.qty.convert(payload) :
                   this.selectedOp === 'compare'  ? this.qty.compare(payload) :
                   this.selectedOp === 'add'       ? this.qty.add(payload) :
                   this.selectedOp === 'subtract'  ? this.qty.subtract(payload) :
                                                     this.qty.divide(payload);
      call.subscribe({
        next: result => { this.renderResult(result); this.loading = false; },
        error: e => {
          const msg = e.error?.Message || e.message || 'Request failed';
          this.toast.show(msg, 'error');
          this.resultText = `❗ ${msg}`;
          this.loading = false;
        }
      });
    } catch (e: any) {
      this.toast.show(e.message, 'error');
      this.resultText = `❗ ${e.message}`;
    }
  }

  renderResult(result: QuantityMeasurementDto): void {
    if (result.IsError) {
      this.resultText = `⚠️ ERROR: ${result.ErrorMessage}`;
    } else if (result.Operation === 'COMPARE') {
      this.resultText = result.ResultString === 'true' ? '✅ EQUAL' : '❌ NOT EQUAL';
    } else {
      this.resultText = `${Number(result.ResultValue).toFixed(5)} ${result.ResultUnit || ''}`;
    }
    this.resultMeta = `🕒 ${new Date().toLocaleTimeString()} | ${result.Operation}`;
  }
}
