export interface UserProfile {
  Id: string;
  Username: string;
  Email: string;
  Role: string;
}

export interface AuthResponse {
  AccessToken: string;
  RefreshToken: string;
}

export interface QuantityRequestDto {
  Value: number;
  Unit: string;
  MeasurementType: string;
}

export interface QuantityInputDto {
  ThisQuantityDTO: QuantityRequestDto;
  ThatQuantityDTO?: QuantityRequestDto;
}

export interface QuantityMeasurementDto {
  ThisValue?: number;
  ThisUnit?: string;
  ThisMeasurementType?: string;
  ThatValue?: number;
  ThatUnit?: string;
  ThatMeasurementType?: string;
  Operation: string;
  ResultString?: string;
  ResultValue?: number;
  ResultUnit?: string;
  ResultMeasurementType?: string;
  ErrorMessage?: string;
  IsError: boolean;
  Timestamp: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const UNIT_MAP: Record<string, string[]> = {
  LENGTH: ['FEET', 'INCH', 'YARD', 'CENTIMETER'],
  WEIGHT: ['KILOGRAM', 'GRAM', 'POUND'],
  VOLUME: ['LITRE', 'MILLILITRE', 'GALLON'],
  TEMPERATURE: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
};
