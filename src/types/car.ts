
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type Fuel = 'GASOLINE' | 'DIESEL' | 'ELECTRIC';
export type AutoCategory = 'SMALL' | 'COMPACT' | 'SUV' | 'LUXURY' | 'VAN';

export interface Location {
  id: number;
  name: string;
  adresse?: string | null;
  stadt?: string | null;
  plz?: string | null;
}

export interface Car {
  id: number;
  marke: string;
  modell: string;
  kennzeichen: string;
  verfuegbar: boolean;
  preisProTag: number;    // camelCase laut Backend
  category: AutoCategory;
  location?: Location | null;
  transmission: Transmission;
  fuel: Fuel;
  seatCount: number;      // camelCase laut Backend
}
