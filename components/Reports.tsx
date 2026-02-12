import React, { useState } from 'react';
import { Appointment, Masseur, Hotel } from '../types';
import { HOTELS, MASSAGE_TYPES } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, isWithinInterval, parse } from 'date-fns';
import { FileDown, Search } from 'lucide-react';

interface ReportsProps {
  appointments: Appointment[];
  masseurs: Masseur[];
  fixedMasseurId?: string; // If present, locks the report to this masseur
}

const Reports: React.FC<ReportsProps> = ({ appointments, masseurs, fixedMasseurId }) => {
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-01'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    masseurId: fixedMasseurId || '',
    hotel: ''
  });

  const generateReport = () => {
    // Filter Data
    const filtered = appointments.filter(a => {
        const appDate = parseISO(a.date);
        const start = parseISO(filters.startDate);
        const end = parseISO(filters.endDate);
        
        const inDateRange = appDate >= start && appDate <= end;
        
        const targetMasseur = fixedMasseurId || filters.masseurId;
        const matchMasseur = targetMasseur ? a.masseurId === targetMasseur : true;
        
        const matchHotel = filters.hotel ? a.hotel === filters.hotel : true;

        return inDateRange && matchMasseur && matchHotel;
    });

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate PDF
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Fechamento - Massagens", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Período: ${format(parseISO(filters.startDate), 'dd/MM/yyyy')} a ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`, 14, 30);
    
    const targetMasseurId = fixedMasseurId || filters.masseurId;
    if (targetMasseurId) {
        const mName = masseurs.find(m => m.id === targetMasseurId)?.name;
        doc.text(`Massagista: ${mName}`, 14, 36);
    }
    if (filters.hotel) {
        doc.text(`Hotel: ${filters.hotel}`, 14, 42);
    }

    const tableData = filtered.map(row => {
        const type = MASSAGE_TYPES.find(t => t.id === row.massageTypeId);
        const masseur = masseurs.find(m => m.id === row.masseurId);
        const status = row.status === 'done' ? ' (Conc.)' : '';
        return [
            format(parseISO(row.date), 'dd/MM/yyyy'),
            row.time,
            row.clientName,
            row.pointOfSale,
            type?.name || 'N/A',
            masseur?.name || 'N/A',
            `R$ ${type?.price.toFixed(2)}${status}`
        ];
    });

    autoTable(doc, {
        startY: 50,
        head: [['Data', 'Hora', 'Hóspede', 'PV', 'Tipo', 'Massagista', 'Valor']],
        body: tableData,
    });

    doc.save(`fechamento_massagens_${filters.startDate}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatório de Fechamento</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Data Início</label>
                <input 
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                    value={filters.startDate}
                    onChange={e => setFilters({...filters, startDate: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Data Fim</label>
                <input 
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                    value={filters.endDate}
                    onChange={e => setFilters({...filters, endDate: e.target.value})}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Massagista</label>
                <select 
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black disabled:bg-gray-100 disabled:text-gray-500"
                    value={fixedMasseurId || filters.masseurId}
                    onChange={e => setFilters({...filters, masseurId: e.target.value})}
                    disabled={!!fixedMasseurId}
                >
                    <option value="">Todas</option>
                    {masseurs.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Hotel</label>
                <select 
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-white text-black"
                    value={filters.hotel}
                    onChange={e => setFilters({...filters, hotel: e.target.value})}
                >
                    <option value="">Todos</option>
                    {HOTELS.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
            </div>
        </div>

        <button 
            onClick={generateReport}
            className="w-full flex justify-center items-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
        >
            <FileDown className="w-5 h-5 mr-2" />
            Gerar Relatório PDF
        </button>
      </div>
    </div>
  );
};

export default Reports;