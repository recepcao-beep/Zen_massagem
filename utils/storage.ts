import { Appointment, Masseur } from '../types';

const KEYS = {
  APPOINTMENTS: 'zen_appointments',
  MASSEURS: 'zen_masseurs',
  LAST_ACCESS_MONTH: 'zen_last_access_month',
};

// --- Appointments ---
export const getAppointments = (): Appointment[] => {
  const data = localStorage.getItem(KEYS.APPOINTMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveAppointment = (appointment: Appointment): void => {
  const list = getAppointments();
  const index = list.findIndex(a => a.id === appointment.id);
  if (index >= 0) {
    list[index] = appointment;
  } else {
    list.push(appointment);
  }
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(list));
};

export const saveAllAppointments = (appointments: Appointment[]): void => {
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

export const deleteAppointment = (id: string): void => {
  const list = getAppointments();
  const newList = list.filter(a => a.id !== id);
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(newList));
};

export const bulkDeleteAppointmentsBeforeDate = (dateLimit: Date): Appointment[] => {
  const list = getAppointments();
  const kept = list.filter(a => new Date(a.date) >= dateLimit);
  const deleted = list.filter(a => new Date(a.date) < dateLimit);
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(kept));
  return deleted;
};

// --- Masseurs ---
export const getMasseurs = (): Masseur[] => {
  const data = localStorage.getItem(KEYS.MASSEURS);
  return data ? JSON.parse(data) : [];
};

export const saveMasseur = (masseur: Masseur): void => {
  const list = getMasseurs();
  const index = list.findIndex(m => m.id === masseur.id);
  if (index >= 0) {
    list[index] = masseur;
  } else {
    list.push(masseur);
  }
  localStorage.setItem(KEYS.MASSEURS, JSON.stringify(list));
};

export const saveAllMasseurs = (masseurs: Masseur[]): void => {
  localStorage.setItem(KEYS.MASSEURS, JSON.stringify(masseurs));
};

export const deleteMasseur = (id: string): void => {
  const list = getMasseurs();
  const newList = list.filter(m => m.id !== id);
  localStorage.setItem(KEYS.MASSEURS, JSON.stringify(newList));
};

// --- System ---
export const getLastAccessMonth = (): string | null => {
  return localStorage.getItem(KEYS.LAST_ACCESS_MONTH);
};

export const setLastAccessMonth = (monthStr: string): void => {
  localStorage.setItem(KEYS.LAST_ACCESS_MONTH, monthStr);
};