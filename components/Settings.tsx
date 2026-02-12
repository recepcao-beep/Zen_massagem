import React, { useState } from 'react';
import { Masseur } from '../types';
import { WEEKDAYS } from '../constants';
import { Trash2, Plus, User, Database, CheckCircle, RefreshCw } from 'lucide-react';

interface SettingsProps {
  masseurs: Masseur[];
  onSaveMasseur: (masseur: Masseur) => void;
  onDeleteMasseur: (id: string) => void;
  onManualSync?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ masseurs, onSaveMasseur, onDeleteMasseur, onManualSync }) => {
  const [form, setForm] = useState<Partial<Masseur>>({
    name: '',
    startTime: '08:00',
    endTime: '18:00',
    unavailableWeekDays: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.startTime && form.endTime) {
      onSaveMasseur({
        id: editingId || crypto.randomUUID(),
        name: form.name,
        startTime: form.startTime,
        endTime: form.endTime,
        unavailableWeekDays: form.unavailableWeekDays || [],
      });
      // Reset
      setForm({ name: '', startTime: '08:00', endTime: '18:00', unavailableWeekDays: [] });
      setEditingId(null);
    }
  };

  const handleEdit = (m: Masseur) => {
    setForm({ ...m });
    setEditingId(m.id);
  };

  const toggleDay = (dayId: number) => {
    const current = form.unavailableWeekDays || [];
    if (current.includes(dayId)) {
      setForm({ ...form, unavailableWeekDays: current.filter(d => d !== dayId) });
    } else {
      setForm({ ...form, unavailableWeekDays: [...current, dayId] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* SECTION: Configuração de Massagistas */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Configuração de Massagistas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                <h3 className="font-semibold text-lg mb-4">{editingId ? 'Editar Massagista' : 'Nova Massagista'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input 
                            type="text" 
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-black"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Início</label>
                            <input 
                                type="time" 
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                                value={form.startTime}
                                onChange={e => setForm({...form, startTime: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fim</label>
                            <input 
                                type="time" 
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                                value={form.endTime}
                                onChange={e => setForm({...form, endTime: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dias Indisponíveis (Folga)</label>
                        <div className="flex flex-wrap gap-2">
                            {WEEKDAYS.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleDay(day.id)}
                                    className={`text-xs px-2 py-1 rounded border ${
                                        form.unavailableWeekDays?.includes(day.id)
                                        ? 'bg-red-100 text-red-700 border-red-200'
                                        : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {day.label.split('-')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full flex justify-center items-center px-4 py-3 bg-teal-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-teal-700">
                            {editingId ? 'Atualizar' : <><Plus className="w-4 h-4 mr-2" /> Adicionar</>}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={() => { setEditingId(null); setForm({ name: '', startTime: '08:00', endTime: '18:00', unavailableWeekDays: [] }); }}
                                className="w-full mt-2 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="md:col-span-2 space-y-4">
                {masseurs.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">
                        Nenhuma massagista cadastrada.
                    </div>
                )}
                {masseurs.map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="bg-teal-100 p-2 rounded-full">
                                <User className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{m.name}</h4>
                                <p className="text-sm text-gray-500">Horário: {m.startTime} - {m.endTime}</p>
                                <div className="text-xs text-red-500 mt-1">
                                    Folgas: {m.unavailableWeekDays.length > 0 
                                        ? m.unavailableWeekDays.map(d => WEEKDAYS.find(w => w.id === d)?.label.split('-')[0]).join(', ')
                                        : 'Nenhuma'}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto justify-end">
                            <button 
                                onClick={() => handleEdit(m)}
                                className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex-1 md:flex-none justify-center"
                            >
                                Editar
                            </button>
                            <button 
                                onClick={() => onDeleteMasseur(m.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded border border-red-100 md:border-none"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* SECTION: Status da Nuvem */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
            Status do Sistema
        </h2>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center w-full md:w-auto">
                <div className="bg-green-100 p-3 rounded-full mr-4 flex-shrink-0">
                    <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                        Banco de Dados Online
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                    </h3>
                    <p className="text-sm text-gray-500">
                        O sistema está conectado nativamente à planilha do Google.
                    </p>
                </div>
            </div>

            {onManualSync && (
                <button 
                    onClick={onManualSync}
                    className="w-full md:w-auto flex justify-center items-center px-4 py-3 md:py-2 border border-teal-200 rounded-md shadow-sm text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar Agora
                </button>
            )}
        </div>
      </div>

    </div>
  );
};

export default Settings;