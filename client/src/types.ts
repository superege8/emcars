export type Fuel = "BENZIN" | "DIESEL" | "EL" | "HYBRID" | "PLUGIN_HYBRID";
export type Transmission = "MANUEL" | "AUTOMATIK";
export type CarStatus = "DRAFT" | "FOR_SALE" | "RESERVED" | "SOLD";

export interface CarImage {
  id: string;
  url: string;
  order: number;
}

export interface Car {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  price: number;
  mileage: number;
  registration?: string | null;
  registrationPublic: boolean;
  vin?: string;
  fuel: Fuel;
  transmission: Transmission;
  horsepower?: number | null;
  color?: string | null;
  description: string;
  equipment: string[];
  status: CarStatus;
  images: CarImage[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterOption {
  value: string;
  count: number;
}

export interface FilterOptions {
  makes: FilterOption[];
  models: FilterOption[];
  fuels: FilterOption[];
  transmissions: FilterOption[];
  priceRange: [number, number];
  yearRange: [number, number];
  kmRange: [number, number];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
