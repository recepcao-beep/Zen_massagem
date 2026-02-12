import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import Reports from './components/Reports';
import AppointmentModal from './components/AppointmentModal';
import LoginScreen from './components/LoginScreen';
import MasseurArea from './components/MasseurArea';

import { ViewState, Appointment, Masseur, User } from './types';
import * as storage from './utils/storage';
import { syncToSheets, loadFromSheets } from './utils/googleSheetsService';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MASSAGE_TYPES } from './constants';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [masseurs, setMasseurs] = useState<Masseur[]>([]);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // API State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Cleanup Prompt State
  const [showCleanupPrompt, setShowCleanupPrompt] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  // --- Initial Load & Mirroring ---
  useEffect(() => {
    // 1. Load Local Data first
    setAppointments(storage.getAppointments());
    setMasseurs(storage.getMasseurs());
    checkMonthlyCleanup();
    
    // 2. Auto-Connect to Cloud
    setSyncStatus('syncing');
    
    loadFromSheets()
        .then(data => {
            if (data.appointments.length > 0 || data.masseurs.length > 0) {
                setAppointments(data.appointments);
                setMasseurs(data.masseurs);
                storage.saveAllAppointments(data.appointments);
                storage.saveAllMasseurs(data.masseurs);
            }
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        })
        .catch(err => {
            console.error("Mirror failed:", err);
            setSyncStatus('error');
        });
  }, []);

  // --- Sync Helper ---
  const triggerSheetSync = async (newAppts: Appointment[], newMasseurs: Masseur[]) => {
      setSyncStatus('syncing');
      const success = await syncToSheets(newAppts, newMasseurs);
      if (success) {
          setSyncStatus('success');
          setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
          setSyncStatus('error');
      }
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    const success = await syncToSheets(appointments, masseurs);
    if(success) {
        alert("Sincronização realizada com sucesso!");
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
    } else {
        alert("Erro ao sincronizar. Verifique sua conexão com a internet.");
        setSyncStatus('error');
    }
  };

  // --- Login Handler ---
  const handleLogin = (user: User) => {
      setCurrentUser(user);
      if (user.role === 'admin') setCurrentView('dashboard');
      else if (user.role === 'receptionist') setCurrentView('calendar');
      else if (user.role === 'masseur') setCurrentView('masseur_tasks');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setIsMobileMenuOpen(false);
  };

  // --- View Navigation Wrapper ---
  const handleChangeView = (view: ViewState) => {
      setCurrentView(view);
      setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  // --- Monthly Cleanup Logic ---
  const checkMonthlyCleanup = () => {
    const lastAccess = storage.getLastAccessMonth();
    const currentMonthStr = format(new Date(), 'yyyy-MM');

    if (lastAccess && lastAccess !== currentMonthStr) {
      setShowCleanupPrompt(true);
    }
  };

  const handleCleanupDecision = (generateReport: boolean) => {
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const lastMonthDate = subMonths(new Date(), 1); 
    const cutoffDate = startOfMonth(new Date());

    if (generateReport) {
      const prevMonthStart = startOfMonth(lastMonthDate);
      const prevMonthEnd = endOfMonth(lastMonthDate);
      
      const allAppts = storage.getAppointments(); 
      const reportData = allAppts.filter(a => {
        const d = new Date(a.date);
        return d >= prevMonthStart && d <= prevMonthEnd;
      });

      if (reportData.length > 0) {
        const doc = new jsPDF();
        doc.text(`Backup Mensal Automático - ${format(lastMonthDate, 'MM/yyyy')}`, 14, 20);
        
        const tableBody = reportData.map(r => [
          r.clientName,
          r.apartment,
          r.phone || '-',
          MASSAGE_TYPES.find(t => t.id === r.massageTypeId)?.name || '',
          format(new Date(r.date), 'dd/MM/yyyy'),
          r.time,
          r.hotel
        ]);

        autoTable(doc, {
          startY: 30,
          head: [['Cliente', 'Apto', 'Tel', 'Tipo', 'Data', 'Hora', 'Hotel']],
          body: tableBody,
        });
        doc.save(`backup_massagens_${format(lastMonthDate, 'yyyy_MM')}.pdf`);
      } else {
        alert("Não houve agendamentos no mês anterior para gerar relatório.");
      }
      
      performCleanup(cutoffDate, currentMonthStr);

    } else {
      setShowCleanupConfirm(true);
      setShowCleanupPrompt(false);
    }
  };

  const performCleanup = (cutoffDate: Date, currentMonthStr: string) => {
    storage.bulkDeleteAppointmentsBeforeDate(cutoffDate);
    storage.setLastAccessMonth(currentMonthStr);
    const newAppts = storage.getAppointments();
    setAppointments(newAppts); 
    triggerSheetSync(newAppts, masseurs); 
    setShowCleanupPrompt(false);
    setShowCleanupConfirm(false);
  };

  // --- Appointment Handlers ---
  const handleSaveAppointment = (appt: Appointment) => {
    storage.saveAppointment(appt);
    const updatedList = storage.getAppointments();
    setAppointments(updatedList);
    triggerSheetSync(updatedList, masseurs);
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      storage.deleteAppointment(id);
      const updatedList = storage.getAppointments();
      setAppointments(updatedList);
      triggerSheetSync(updatedList, masseurs);
      setIsModalOpen(false);
      setEditingAppointment(null);
    }
  };

  const handleUpdateStatus = (id: string, status: 'pending' | 'done') => {
      const appt = appointments.find(a => a.id === id);
      if (appt) {
          handleSaveAppointment({ ...appt, status });
      }
  };

  const openNewAppointment = (date: Date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const openEditAppointment = (appt: Appointment) => {
    setEditingAppointment(appt);
    setIsModalOpen(true);
  };

  // --- Masseur Handlers ---
  const handleSaveMasseur = (m: Masseur) => {
    storage.saveMasseur(m);
    const updatedMasseurs = storage.getMasseurs();
    setMasseurs(updatedMasseurs);
    triggerSheetSync(storage.getAppointments(), updatedMasseurs);
  };

  const handleDeleteMasseur = (id: string) => {
    if (window.confirm('Excluir massagista?')) {
      storage.deleteMasseur(id);
      const updatedMasseurs = storage.getMasseurs();
      setMasseurs(updatedMasseurs);
      triggerSheetSync(storage.getAppointments(), updatedMasseurs);
    }
  };

  // --- RENDER ---

  if (!currentUser) {
      return <LoginScreen masseurs={masseurs} onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
                <Menu className="w-6 h-6" />
            </button>
            <span className="ml-3 font-bold text-gray-800 text-lg">ZenControl</span>
        </div>
        <div className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded">
            {currentUser.name.split(' ')[0]}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
      )}

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleChangeView} 
        userRole={currentUser.role}
        onLogout={handleLogout}
        userName={currentUser.name}
        isGoogleConnected={true} 
        syncStatus={syncStatus}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
        
        {currentUser.role === 'masseur' ? (
            currentUser.id ? (
                <MasseurArea 
                    currentView={currentView}
                    appointments={appointments}
                    currentMasseur={masseurs.find(m => m.id === currentUser.id!)!}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdateAvailability={handleSaveMasseur}
                    masseurs={masseurs}
                />
            ) : (
                <div>Erro: ID da massagista não encontrado. Faça login novamente.</div>
            )
        ) : (
            <>
                {currentView === 'dashboard' && <Dashboard appointments={appointments} />}
                
                {currentView === 'calendar' && (
                <CalendarView 
                    appointments={appointments}
                    masseurs={masseurs}
                    onAddEvent={openNewAppointment}
                    onEditEvent={openEditAppointment}
                />
                )}
                
                {currentView === 'reports' && (
                <Reports appointments={appointments} masseurs={masseurs} />
                )}

                {currentView === 'settings' && (
                <Settings 
                    masseurs={masseurs} 
                    onSaveMasseur={handleSaveMasseur} 
                    onDeleteMasseur={handleDeleteMasseur}
                    onManualSync={handleManualSync} 
                />
                )}
            </>
        )}
      </main>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        existingAppointment={editingAppointment}
        selectedDate={selectedDate}
        masseurs={masseurs}
        existingAppointments={appointments}
      />

      {/* Monthly Cleanup Modals */}
      {showCleanupPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Limpeza Mensal Automática</h3>
            <p className="text-gray-600 mb-6">
              O banco de dados das reservas do mês passado será apagado para manter o sistema rápido.
              <br/><br/>
              <strong>Deseja gerar a relação (backup PDF) dos agendamentos antes de apagar?</strong>
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => handleCleanupDecision(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Não
              </button>
              <button 
                onClick={() => handleCleanupDecision(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {showCleanupConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-600 mb-2">Atenção!</h3>
            <p className="text-gray-600 mb-6">
              Essa ação é <strong>irreversível</strong>. Os dados do mês passado serão perdidos para sempre.
              <br/><br/>
              Tem certeza de que não deseja a listagem?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setShowCleanupPrompt(true); setShowCleanupConfirm(false); }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Não (Voltar)
              </button>
              <button 
                onClick={() => performCleanup(startOfMonth(new Date()), format(new Date(), 'yyyy-MM'))}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sim (Apagar tudo)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;