import React, { useState } from 'react';
import { Appointment, Masseur } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getHotelColor, MASSAGE_TYPES } from '../constants';

interface CalendarViewProps {
  appointments: Appointment[];
  masseurs: Masseur[];
  onAddEvent: (date: Date) => void;
  onEditEvent: (appt: Appointment) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, masseurs, onAddEvent, onEditEvent }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMasseurId, setSelectedMasseurId] = useState<string>(masseurs.length > 0 ? masseurs[0].id : '');

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Filter appointments by selected Masseur
  const filteredAppointments = appointments.filter(a => {
    if (!selectedMasseurId) return true;
    return a.masseurId === selectedMasseurId;
  });

  const selectedMasseur = masseurs.find(m => m.id === selectedMasseurId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <div className="flex items-center space-x-4">
            <select 
                className="bg-white border border-gray-300 rounded-md py-2 px-4 focus:ring-teal-500 focus:border-teal-500 text-black"
                value={selectedMasseurId}
                onChange={(e) => setSelectedMasseurId(e.target.value)}
            >
                {masseurs.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
                {masseurs.length === 0 && <option value="">Nenhuma massagista cadastrada</option>}
            </select>

            <div className="flex bg-white rounded-md shadow-sm">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-50 border-r border-gray-200">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-50">
                <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            
            <button 
                onClick={() => onAddEvent(new Date())}
                className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 shadow-sm"
            >
                <Plus className="w-5 h-5 mr-1" />
                Novo
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-1">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, idx) => {
          const isUnavailable = selectedMasseur 
            ? selectedMasseur.unavailableWeekDays.includes(day.getDay())
            : false;
          
          const dayAppointments = filteredAppointments.filter(a => isSameDay(parseISO(a.date), day))
                                     .sort((a, b) => a.time.localeCompare(b.time));

          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[120px] bg-white p-2 relative group hover:bg-gray-50 transition-colors ${
                 !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
              } ${isUnavailable ? 'bg-red-50 hover:bg-red-100' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
                {!isUnavailable && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddEvent(day); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full text-teal-600"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
              </div>

              {isUnavailable ? (
                  <div className="mt-4 text-center text-xs text-red-400 font-medium">
                      Indisponível
                  </div>
              ) : (
                <div className="mt-1 space-y-1">
                    {dayAppointments.map(appt => {
                        const mType = MASSAGE_TYPES.find(t => t.id === appt.massageTypeId);
                        return (
                            <button
                                key={appt.id}
                                onClick={(e) => { e.stopPropagation(); onEditEvent(appt); }}
                                className={`w-full text-left text-xs p-1 rounded border-l-2 mb-1 truncate shadow-sm transition-transform hover:scale-[1.02] ${getHotelColor(appt.hotel)}`}
                            >
                                <span className="font-bold mr-1">{appt.time}</span>
                                <span className="opacity-90">{mType?.name}</span>
                                <div className="text-[10px] opacity-75 truncate">{appt.apartment} - {appt.clientName}</div>
                            </button>
                        );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;