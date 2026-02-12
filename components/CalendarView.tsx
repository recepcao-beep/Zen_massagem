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
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { getHotelColor, MASSAGE_TYPES } from '../constants';

interface CalendarViewProps {
  appointments: Appointment[];
  masseurs: Masseur[];
  onAddEvent: (date: Date) => void;
  onEditEvent: (appt: Appointment) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, masseurs, onAddEvent, onEditEvent }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date()); // New state for mobile selection
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

  // Get appointments for the specific selected day (for the list view)
  const selectedDayAppointments = filteredAppointments
    .filter(a => isSameDay(parseISO(a.date), selectedDay))
    .sort((a, b) => a.time.localeCompare(b.time));

  const isSelectedDayUnavailable = selectedMasseur 
    ? selectedMasseur.unavailableWeekDays.includes(selectedDay.getDay())
    : false;

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 capitalize order-1 md:order-none flex items-center">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto order-2 md:order-none">
            <select 
                className="w-full md:w-auto bg-white border border-gray-300 rounded-md py-2 px-4 focus:ring-teal-500 focus:border-teal-500 text-black text-sm"
                value={selectedMasseurId}
                onChange={(e) => setSelectedMasseurId(e.target.value)}
            >
                {masseurs.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
                {masseurs.length === 0 && <option value="">Nenhuma massagista</option>}
            </select>

            <div className="flex w-full md:w-auto justify-between md:justify-start gap-2">
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
                    className="hidden md:flex flex-1 md:flex-none justify-center items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Novo
                </button>
            </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg md:rounded-lg overflow-hidden shadow-sm">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, idx) => {
          const isUnavailable = selectedMasseur 
            ? selectedMasseur.unavailableWeekDays.includes(day.getDay())
            : false;
          
          const dayAppointments = filteredAppointments.filter(a => isSameDay(parseISO(a.date), day));
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toString()} 
              className={`
                min-h-[50px] md:min-h-[120px] 
                bg-white p-1 md:p-2 relative group 
                hover:bg-gray-50 transition-all cursor-pointer
                ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''} 
                ${isUnavailable ? 'bg-red-50 hover:bg-red-100' : ''}
                ${isSelected ? 'ring-2 ring-inset ring-teal-500 bg-teal-50' : ''}
              `}
              onClick={() => {
                  setSelectedDay(day); // Select day for list view
                  if (!isUnavailable && window.innerWidth >= 768) {
                      // On desktop, double click or explicit add logic handles modal, 
                      // but usually we rely on the "+" button appearing on hover.
                  }
              }} 
            >
              <div className="flex justify-between items-start">
                <span className={`
                    text-xs md:text-sm font-medium transition-all
                    ${isToday ? 'bg-teal-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}
                `}>
                  {format(day, 'd')}
                </span>
                
                {/* Desktop Plus Button */}
                {!isUnavailable && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddEvent(day); }}
                        className="hidden md:block opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full text-teal-600"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
              </div>

              {isUnavailable ? (
                  <div className="mt-1 md:mt-4 text-center text-[10px] md:text-xs text-red-400 font-medium">
                      <span className="hidden md:inline">Indisponível</span>
                      <span className="md:hidden">✕</span>
                  </div>
              ) : (
                <>
                    {/* DESKTOP VIEW: Detailed List inside cell */}
                    <div className="hidden md:block mt-1 space-y-1">
                        {dayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map(appt => {
                            const mType = MASSAGE_TYPES.find(t => t.id === appt.massageTypeId);
                            return (
                                <button
                                    key={appt.id}
                                    onClick={(e) => { e.stopPropagation(); onEditEvent(appt); }}
                                    className={`w-full text-left text-[10px] p-1 rounded border-l-2 mb-1 truncate shadow-sm transition-transform hover:scale-[1.02] ${getHotelColor(appt.hotel)}`}
                                >
                                    <span className="font-bold mr-1">{appt.time}</span>
                                    <span className="opacity-90">{mType?.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* MOBILE VIEW: Dots */}
                    <div className="md:hidden flex justify-center mt-1 flex-wrap gap-0.5 h-4 overflow-hidden">
                        {dayAppointments.slice(0, 4).map(appt => (
                             <div key={appt.id} className={`w-1.5 h-1.5 rounded-full ${getHotelColor(appt.hotel).replace('text-white', '').replace('border-', '')}`}></div>
                        ))}
                        {dayAppointments.length > 4 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                        )}
                    </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE ONLY: Selected Day Details List */}
      <div className="md:hidden bg-white border-x border-b border-gray-200 rounded-b-lg p-4 shadow-sm mb-20 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 capitalize">{format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}</h3>
                {isSelectedDayUnavailable ? (
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Dia Indisponível</span>
                ) : (
                    <span className="text-xs text-gray-500">{selectedDayAppointments.length} agendamentos</span>
                )}
              </div>
              
              {!isSelectedDayUnavailable && (
                <button 
                    onClick={() => onAddEvent(selectedDay)}
                    className="bg-teal-600 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                    <Plus className="w-6 h-6" />
                </button>
              )}
          </div>

          <div className="space-y-3">
              {selectedDayAppointments.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum agendamento para este dia.</p>
                  </div>
              ) : (
                  selectedDayAppointments.map(appt => {
                    const mType = MASSAGE_TYPES.find(t => t.id === appt.massageTypeId);
                    const isDone = appt.status === 'done';
                    return (
                        <div 
                            key={appt.id} 
                            onClick={() => onEditEvent(appt)}
                            className={`
                                relative bg-white border-l-4 rounded-r-lg p-3 shadow-sm border border-y-gray-100 border-r-gray-100 active:bg-gray-50
                                ${getHotelColor(appt.hotel).replace('bg-', 'border-l-')}
                                ${isDone ? 'opacity-60 grayscale-[0.5]' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{mType?.name}</h4>
                                    <div className="flex items-center text-xs text-gray-600 mb-1">
                                        <User className="w-3 h-3 mr-1" />
                                        {appt.clientName}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {appt.apartment} • {appt.hotel}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-gray-800 leading-none">{appt.time}</span>
                                    <span className="text-[10px] text-gray-400 mt-1 uppercase">{appt.status === 'done' ? 'Concluído' : 'Pendente'}</span>
                                </div>
                            </div>
                        </div>
                    );
                  })
              )}
          </div>
      </div>
    </div>
  );
};

export default CalendarView;