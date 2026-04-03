import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { QuantityInputDto, QuantityMeasurementDto } from '../models';

@Injectable({ providedIn: 'root' })
export class QuantityService {
  constructor(private api: ApiService) {}

  convert(payload: QuantityInputDto): Observable<QuantityMeasurementDto> {
    return this.api.post<QuantityMeasurementDto>('/quantities/convert', payload);
  }
  compare(payload: QuantityInputDto): Observable<QuantityMeasurementDto> {
    return this.api.post<QuantityMeasurementDto>('/quantities/compare', payload);
  }
  add(payload: QuantityInputDto): Observable<QuantityMeasurementDto> {
    return this.api.post<QuantityMeasurementDto>('/quantities/add', payload);
  }
  subtract(payload: QuantityInputDto): Observable<QuantityMeasurementDto> {
    return this.api.post<QuantityMeasurementDto>('/quantities/subtract', payload);
  }
  divide(payload: QuantityInputDto): Observable<QuantityMeasurementDto> {
    return this.api.post<QuantityMeasurementDto>('/quantities/divide', payload);
  }

  getMyHistory(): Observable<QuantityMeasurementDto[]> {
    return this.api.get<QuantityMeasurementDto[]>('/quantities/history/me');
  }
  getErroredHistory(): Observable<QuantityMeasurementDto[]> {
    return this.api.get<QuantityMeasurementDto[]>('/quantities/history/errored');
  }
  getHistoryByOperation(op: string): Observable<QuantityMeasurementDto[]> {
    return this.api.get<QuantityMeasurementDto[]>(`/quantities/history/operation/${op}`);
  }
  getHistoryByType(type: string): Observable<QuantityMeasurementDto[]> {
    return this.api.get<QuantityMeasurementDto[]>(`/quantities/history/type/${type}`);
  }
  getCountByOperation(op: string): Observable<{ count: number }> {
    return this.api.get<{ count: number }>(`/quantities/count/${op}`);
  }
}
