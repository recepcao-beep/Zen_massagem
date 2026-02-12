export interface MassageType {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Masseur {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  unavailableWeekDays: number[]; // 0=Sunday, 1=Monday, etc.
}

export enum Hotel {
  GOLDEN_PARK = 'Hotel Golden Park',
  VILAGE_INN = 'Vilage Inn',
  THERMAS_RESORT = 'Thermas Resort',
}

export enum PointOfSale {
  RECEPTION = 'Recepção',
  RESERVATION = 'Reserva',
}

export type AppointmentStatus = 'pending' | 'done';

export interface Appointment {
  id: string;
  clientId: string; // Just a placeholder, we use name in UI
  clientName: string;
  apartment: string;
  hotel: Hotel;
  phone?: string;
  massageTypeId: string;
  date: string; // ISO Date String YYYY-MM-DD
  time: string; // HH:mm
  masseurId: string;
  createdBy: string; // Email/User
  pointOfSale: PointOfSale; // New field
  status: AppointmentStatus; // New field
  photoUrl?: string; // Base64 or URL
  createdAt: string;
}

export type UserRole = 'admin' | 'receptionist' | 'masseur';

export interface User {
  name: string;
  role: UserRole;
  id?: string; // specific for masseur
}

export type ViewState = 'dashboard' | 'calendar' | 'reports' | 'settings' | 'masseur_tasks' | 'masseur_availability';

export interface ReportFilter {
  startDate: string;
  endDate: string;
  masseurId?: string;
  hotel?: Hotel;
}