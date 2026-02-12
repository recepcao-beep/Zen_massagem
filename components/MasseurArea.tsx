import React, { useState } from 'react';
import { Appointment, Masseur, ViewState } from '../types';
import { MASSAGE_TYPES, WEEKDAYS, getHotelColor } from '../constants';
import { format, parseISO, isSameDay } from 'date-fns';
import { CheckCircle2, Circle, Clock, Save } from 'lucide-react';
import Reports from './Reports';

interface MasseurAreaProps {
  currentView: ViewState;
  appointments: Appointment[];
  currentMasseur: Masseur;
  onUpdateStatus: (appointmentId: string, status: 'pending' | 'done') => void;
  onUpdateAvailability: (masseur: Masseur) => void;
  masseurs: Masseur[]; // Needed for reports context
}

const MasseurArea: React.FC<MasseurAreaProps> = ({ 
  currentView, 
  appointments, 
  currentMasseur, 
  onUpdateStatus,
  onUpdateAvailability,
  masseurs
}) => {
  
  // --- Availability Logic ---
  const [form, setForm] = useState<Partial<Masseur>>({
    startTime: currentMasseur.startTime,
    endTime: currentMasseur.endTime,
    unavailableWeekDays: currentMasseur.unavailableWeekDays
  });

  const toggleDay = (dayId: number) => {
    const current = form.unavailableWeekDays || [];
    if (current.includes(dayId)) {
      setForm({ ...form, unavailableWeekDays: current.filter(d => d !== dayId) });
    } else {
      setForm({ ...form, unavailableWeekDays: [...current, dayId] });
    }
  };

  const handleSaveAvailability = () => {
    onUpdateAvailability({
        ...currentMasseur,
        startTime: form.startTime || currentMasseur.startTime,
        endTime: form.endTime || currentMasseur.endTime,
        unavailableWeekDays: form.unavailableWeekDays || []
    });
    alert('Disponibilidade atualizada com sucesso!');
  };

  // --- View Rendering ---

  if (currentView === 'reports') {
      return <Reports appointments={appointments} masseurs={masseurs} fixedMasseurId={currentMasseur.id} />;
  }

  if (currentView === 'masseur_availability') {
      return (
        <div className="max-w-2xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Minha Disponibilidade</h2>
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Início do Turno</label>
                        <input 
                            type="time" 
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                            value={form.startTime}
                            onChange={e => setForm({...form, startTime: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fim do Turno</label>
                        <input 
                            type="time" 
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                            value={form.endTime}
                            onChange={e => setForm({...form, endTime: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Folga (Não atendo)</label>
                    <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map(day => (
                            <button
                                key={day.id}
                                type="button"
                                onClick={() => toggleDay(day.id)}
                                className={`text-xs md:text-sm px-3 py-2 rounded border ${
                                    form.unavailableWeekDays?.includes(day.id)
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {day.label.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSaveAvailability}
                    className="w-full flex justify-center items-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
                >
                    <Save className="w-5 h-5 mr-2" />
                    Salvar Alterações
                </button>
            </div>
        </div>
      );
  }

  // Default: Tasks List
  // Sort: Today first, then future
  const myAppointments = appointments
    .filter(a => a.masseurId === currentMasseur.id)
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  const pendingCount = myAppointments.filter(a => a.status !== 'done').length;

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Minhas Tarefas</h2>
            <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-xs md:text-sm font-medium">
                {pendingCount} pendentes
            </div>
        </div>

        {myAppointments.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-lg border border-gray-200 text-gray-500">
                Nenhuma massagem agendada.
            </div>
        ) : (
            <div className="space-y-4">
                {myAppointments.map(appt => {
                     const mType = MASSAGE_TYPES.find(t => t.id === appt.massageTypeId);
                     const isDone = appt.status === 'done';
                     const isToday = isSameDay(parseISO(appt.date), new Date());

                     return (
                         <div key={appt.id} className={`bg-white border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-opacity ${isDone ? 'opacity-60 border-gray-100' : 'border-gray-200'} ${isToday && !isDone ? 'ring-2 ring-teal-500 ring-offset-2' : ''}`}>
                             <div className="flex-1 mb-4 md:mb-0">
                                 <div className="flex items-center space-x-3 mb-1">
                                     <div className={`text-xs font-bold px-2 py-1 rounded text-white ${getHotelColor(appt.hotel)}`}>
                                         {appt.hotel}
                                     </div>
                                     <div className="text-sm text-gray-500 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {format(parseISO(appt.date), 'dd/MM/yyyy')} às <strong className="ml-1 text-gray-800">{appt.time}</strong>
                                     </div>
                                 </div>
                                 <h4 className="text-lg font-bold text-gray-800">{mType?.name}</h4>
                                 <p className="text-gray-600 text-sm">Hóspede: {appt.clientName} (Apto: {appt.apartment})</p>
                                 <p className="text-xs text-gray-400 mt-1">PV: {appt.pointOfSale}</p>
                             </div>

                             <button 
                                onClick={() => onUpdateStatus(appt.id, isDone ? 'pending' : 'done')}
                                className={`w-full md:w-auto flex justify-center items-center px-4 py-3 md:py-2 rounded-lg font-medium transition-colors ${
                                    isDone 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                             >
                                 {isDone ? (
                                     <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Concluída
                                     </>
                                 ) : (
                                     <>
                                        <Circle className="w-5 h-5 mr-2" />
                                        Marcar como Feito
                                     </>
                                 )}
                             </button>
                         </div>
                     );
                })}
            </div>
        )}
    </div>
  );
};

export default MasseurArea;