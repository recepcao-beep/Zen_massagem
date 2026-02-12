import React, { useMemo } from 'react';
import { Appointment } from '../types';
import { format, isSameDay, parseISO, isBefore, startOfDay } from 'date-fns';
import { CheckCircle2, Clock, CalendarDays } from 'lucide-react';

interface DashboardProps {
  appointments: Appointment[];
}

const Dashboard: React.FC<DashboardProps> = ({ appointments }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    let done = 0;
    let todo = 0;
    let todayCount = 0;

    appointments.forEach((appt) => {
      const apptDate = parseISO(appt.date);
      const isApptToday = isSameDay(apptDate, today);

      if (isApptToday) {
        todayCount++;
      }

      // Logic for Done vs To Do (simplified based on date/time)
      // In a real app, this might be a status field. Here we infer from date/time.
      const apptDateTime = new Date(`${appt.date}T${appt.time}`);
      
      if (isBefore(apptDateTime, now)) {
        done++;
      } else {
        todo++;
      }
    });

    return { done, todo, todayCount };
  }, [appointments]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Painel Operacional</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Realizadas (Past) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Massagens Realizadas</p>
            <p className="text-3xl font-bold text-gray-800">{stats.done}</p>
          </div>
        </div>

        {/* Card 2: A Realizar (Future) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Massagens a Realizar</p>
            <p className="text-3xl font-bold text-gray-800">{stats.todo}</p>
          </div>
        </div>

        {/* Card 3: Hoje */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Agendadas para Hoje</p>
            <p className="text-3xl font-bold text-gray-800">{stats.todayCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong className="font-bold">Nota de Privacidade:</strong> Este painel exibe apenas indicadores operacionais. Valores financeiros e totais de faturamento não são exibidos nesta tela.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;