import { MassageType, Hotel, PointOfSale } from './types';

export const MASSAGE_TYPES: MassageType[] = [
  { id: '1', name: 'Massagem Relaxante + Aromaterapia', price: 150, duration: 50 },
  { id: '2', name: 'Gomagem Corporal', price: 150, duration: 50 },
  { id: '3', name: 'Massagem com Velas', price: 200, duration: 50 },
  { id: '4', name: 'Drenagem Linfática', price: 150, duration: 50 },
  { id: '5', name: 'Ventosa Terapia', price: 140, duration: 50 },
  { id: '6', name: 'Hidratação + Massagem Facial', price: 120, duration: 40 },
  { id: '7', name: 'Pedras Quentes', price: 200, duration: 50 },
  { id: '8', name: 'Escalda Pés', price: 80, duration: 30 },
  { id: '9', name: 'Massagem Divertida (Kids)', price: 60, duration: 30 },
  { id: '10', name: 'Combo 01', price: 250, duration: 80 }, // 1h20
  { id: '11', name: 'Combo 02', price: 250, duration: 90 }, // 1h30
  { id: '12', name: 'Combo 03', price: 150, duration: 40 },
];

export const HOTELS = [
  Hotel.GOLDEN_PARK,
  Hotel.VILAGE_INN,
  Hotel.THERMAS_RESORT,
];

export const POINTS_OF_SALE = [
  PointOfSale.RECEPTION,
  PointOfSale.RESERVATION,
];

export const WEEKDAYS = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
];

// Helper to get color based on hotel
export const getHotelColor = (hotel: Hotel): string => {
  switch (hotel) {
    case Hotel.GOLDEN_PARK:
      return 'bg-yellow-500 border-yellow-600 text-white';
    case Hotel.VILAGE_INN:
      return 'bg-blue-500 border-blue-600 text-white';
    case Hotel.THERMAS_RESORT:
      return 'bg-green-800 border-green-900 text-white';
    default:
      return 'bg-gray-500 border-gray-600 text-white';
  }
};