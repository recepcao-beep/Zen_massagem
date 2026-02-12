import { Appointment, Masseur, PointOfSale, Hotel } from '../types';
import { MASSAGE_TYPES } from '../constants';

// URL Nativa do Script Google
const API_URL = "https://script.google.com/macros/s/AKfycbxgUuvv3I1MmhxRYms3rVWx2feGU_A-axzGWs-DL7hD-PRo3Cq0mIF8yEjR8zJKLaLTdg/exec";

/**
 * Maps Appointment objects to Row Arrays for Sheets
 */
const mapAppointmentsToRows = (appointments: Appointment[], masseurs: Masseur[]) => {
  const rows = appointments.map(appt => {
    const massageType = MASSAGE_TYPES.find(t => t.id === appt.massageTypeId);
    const masseur = masseurs.find(m => m.id === appt.masseurId);

    return [
      appt.id,
      appt.date,
      appt.time,
      appt.clientName,
      appt.apartment,
      appt.hotel,
      appt.phone || '',
      massageType?.name || 'Desconhecido',
      massageType?.price || 0,
      masseur?.name || 'Desconhecida',
      appt.masseurId,
      appt.pointOfSale,
      appt.status === 'done' ? 'Concluída' : 'Pendente',
      appt.createdBy,
      appt.photoUrl ? 'Imagem Anexada' : '' 
    ];
  });
  return rows; // Return just the data, no headers, GAS handles writing
};

/**
 * Maps Masseur objects to Row Arrays for Sheets
 */
const mapMasseursToRows = (masseurs: Masseur[]) => {
  const rows = masseurs.map(m => [
    m.id,
    m.name,
    m.startTime,
    m.endTime,
    JSON.stringify(m.unavailableWeekDays)
  ]);
  return rows;
};

/**
 * Maps Sheet Rows back to Appointment Objects
 */
const mapRowsToAppointments = (rows: any[]): Appointment[] => {
  if (!rows || rows.length === 0) return []; 
  
  return rows.map(row => {
    const mTypeName = row[7];
    const mType = MASSAGE_TYPES.find(t => t.name === mTypeName);

    return {
      id: row[0],
      clientId: row[3] || 'guest',
      date: typeof row[1] === 'string' ? row[1] : new Date(row[1]).toISOString().split('T')[0], // Handle Date objects from GAS
      time: row[2],
      clientName: row[3],
      apartment: row[4],
      hotel: row[5] as Hotel,
      phone: row[6],
      massageTypeId: mType?.id || '1',
      masseurId: row[10],
      pointOfSale: row[11] as PointOfSale,
      status: row[12] === 'Concluída' ? 'done' : 'pending',
      createdBy: row[13],
      photoUrl: '',
      createdAt: new Date().toISOString()
    };
  });
};

/**
 * Maps Sheet Rows back to Masseur Objects
 */
const mapRowsToMasseurs = (rows: any[]): Masseur[] => {
  if (!rows || rows.length === 0) return [];
  return rows.map(row => ({
    id: row[0],
    name: row[1],
    startTime: row[2],
    endTime: row[3],
    unavailableWeekDays: JSON.parse(row[4] || '[]')
  }));
};

/**
 * Sync Data to Google Sheets via Web App URL
 */
export const syncToSheets = async (
  appointments: Appointment[], 
  masseurs: Masseur[]
) => {
  if (!API_URL) return false;
  
  try {
    const appointmentData = mapAppointmentsToRows(appointments, masseurs);
    const masseurData = mapMasseursToRows(masseurs);

    const payload = {
        appointments: appointmentData,
        masseurs: masseurData
    };

    // CRITICAL FIX: Use text/plain to avoid CORS Preflight (OPTIONS) request which GAS doesn't support.
    // This ensures the DELETE/UPDATE actually reaches the spreadsheet.
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result.status === 'success';

  } catch (error) {
    console.error("Error syncing to sheets:", error);
    return false;
  }
};

/**
 * Load Data from Google Sheets via Web App URL
 */
export const loadFromSheets = async () => {
  if (!API_URL) throw new Error("URL da API não configurada");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    return {
      appointments: mapRowsToAppointments(data.appointments),
      masseurs: mapRowsToMasseurs(data.masseurs)
    };
  } catch (error) {
    console.error("Error loading from sheets:", error);
    throw error;
  }
};