import React, { useState, useEffect } from 'react';
import { Appointment, Hotel, MassageType, Masseur, PointOfSale } from '../types';
import { MASSAGE_TYPES, HOTELS, POINTS_OF_SALE } from '../constants';
import { X, Upload, Trash2 } from 'lucide-react';
import { addMinutes, format, parse, isSameDay } from 'date-fns';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appt: Appointment) => void;
  onDelete: (id: string) => void;
  existingAppointment?: Appointment | null;
  selectedDate?: Date;
  masseurs: Masseur[];
  existingAppointments: Appointment[]; // For conflict checking
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingAppointment,
  selectedDate,
  masseurs,
  existingAppointments,
}) => {
  const [formData, setFormData] = useState<Partial<Appointment>>({
    hotel: Hotel.VILAGE_INN,
    pointOfSale: PointOfSale.RECEPTION,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    status: 'pending'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);

      if (existingAppointment) {
        setFormData({ ...existingAppointment });
      } else {
        setFormData({
          clientName: '',
          apartment: '',
          phone: '',
          hotel: Hotel.VILAGE_INN,
          pointOfSale: PointOfSale.RECEPTION,
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          time: '09:00',
          massageTypeId: MASSAGE_TYPES[0].id,
          masseurId: masseurs.length > 0 ? masseurs[0].id : '',
          createdBy: 'funcionario@hotel.com', // Mock
          photoUrl: '',
          status: 'pending'
        });
      }
    }
  }, [isOpen, existingAppointment, selectedDate, masseurs]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTimeConflict = (
    date: string,
    time: string,
    massageTypeId: string,
    masseurId: string,
    currentId?: string
  ): boolean => {
    const type = MASSAGE_TYPES.find(t => t.id === massageTypeId);
    if (!type) return false;

    const newStart = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
    const newEnd = addMinutes(newStart, type.duration);

    // Filter appointments for the same masseur on the same day
    const conflicts = existingAppointments.filter(appt => {
        if (appt.masseurId !== masseurId) return false;
        if (appt.id === currentId) return false; // Don't check against self
        return isSameDay(parse(appt.date, 'yyyy-MM-dd', new Date()), newStart);
    });

    for (const appt of conflicts) {
      const existingType = MASSAGE_TYPES.find(t => t.id === appt.massageTypeId);
      if (!existingType) continue;

      const existStart = parse(`${appt.date} ${appt.time}`, 'yyyy-MM-dd HH:mm', new Date());
      const existEnd = addMinutes(existStart, existingType.duration);

      // Check overlap
      if (newStart < existEnd && newEnd > existStart) {
        return true; // Conflict found
      }
    }
    return false;
  };

  const isMasseurAvailableOnDay = (dateStr: string, masseurId: string): boolean => {
    const masseur = masseurs.find(m => m.id === masseurId);
    if (!masseur) return false;
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const dayOfWeek = date.getDay();
    return !masseur.unavailableWeekDays.includes(dayOfWeek);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.clientName || !formData.apartment || !formData.date || !formData.time || !formData.massageTypeId || !formData.masseurId || !formData.pointOfSale) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isMasseurAvailableOnDay(formData.date, formData.masseurId)) {
      setError('A massagista selecionada não atende neste dia da semana.');
      return;
    }

    if (validateTimeConflict(formData.date, formData.time, formData.massageTypeId, formData.masseurId, existingAppointment?.id)) {
      setError('Conflito de horário! Já existe um agendamento neste período para esta massagista.');
      return;
    }

    onSave({
      id: existingAppointment?.id || crypto.randomUUID(),
      createdAt: existingAppointment?.createdAt || new Date().toISOString(),
      status: existingAppointment?.status || 'pending',
      ...formData as Appointment
    });
  };

  const selectedMasseur = masseurs.find(m => m.id === formData.masseurId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            {existingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Cliente *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone / Contato</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Apartamento *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.apartment}
                onChange={e => setFormData({ ...formData, apartment: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hotel *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.hotel}
                onChange={e => setFormData({ ...formData, hotel: e.target.value as Hotel })}
              >
                {HOTELS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Massagista *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.masseurId}
                onChange={e => setFormData({ ...formData, masseurId: e.target.value })}
              >
                {masseurs.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Ponto de Venda *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.pointOfSale}
                onChange={e => setFormData({ ...formData, pointOfSale: e.target.value as PointOfSale })}
              >
                {POINTS_OF_SALE.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.massageTypeId}
                onChange={e => setFormData({ ...formData, massageTypeId: e.target.value })}
              >
                {MASSAGE_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.duration} min)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data *</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
              {selectedMasseur && formData.date && !isMasseurAvailableOnDay(formData.date, selectedMasseur.id) && (
                <p className="text-xs text-red-500 mt-1">Dia indisponível para {selectedMasseur.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Horário *</label>
              <input
                type="time"
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Anexo (Guia/Foto)</label>
             <div className="flex items-center space-x-4">
                <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Foto
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                {formData.photoUrl && (
                  <span className="text-sm text-green-600 truncate max-w-xs">Imagem carregada</span>
                )}
             </div>
             {formData.photoUrl && (
               <div className="mt-2">
                 <img src={formData.photoUrl} alt="Preview" className="h-20 w-auto rounded border" />
               </div>
             )}
          </div>

          <div className="flex justify-end items-center pt-4 border-t space-x-3">
                {existingAppointment && (
                <button
                    type="button"
                    onClick={() => onDelete(existingAppointment.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                </button>
                )}
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                Cancelar
                </button>
                <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 shadow-sm"
                >
                Salvar
                </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;