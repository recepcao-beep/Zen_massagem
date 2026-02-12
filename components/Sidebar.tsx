import React from 'react';
import { ViewState, UserRole } from '../types';
import { LayoutDashboard, Calendar, FileText, Settings, Flower2, LogOut, CheckSquare, Clock, Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userRole: UserRole;
  onLogout: () => void;
  userName?: string;
  isGoogleConnected?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error' | 'success';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, onLogout, userName, isGoogleConnected, syncStatus }) => {
  
  // Define items based on role
  let menuItems: { id: string, label: string, icon: any }[] = [];

  if (userRole === 'admin') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'calendar', label: 'Agenda', icon: Calendar },
      { id: 'reports', label: 'Fechamento', icon: FileText },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ];
  } else if (userRole === 'receptionist') {
    menuItems = [
      { id: 'calendar', label: 'Agenda', icon: Calendar },
    ];
  } else if (userRole === 'masseur') {
    menuItems = [
      { id: 'masseur_tasks', label: 'Minhas Massagens', icon: CheckSquare },
      { id: 'masseur_availability', label: 'Minha Disponibilidade', icon: Clock },
      { id: 'reports', label: 'Fechamento', icon: FileText },
    ];
  }

  const getSyncIcon = () => {
      if (!isGoogleConnected) return <CloudOff className="w-4 h-4 text-gray-400" />;
      if (syncStatus === 'syncing') return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      if (syncStatus === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      if (syncStatus === 'error') return <CloudOff className="w-4 h-4 text-red-500" />;
      return <Cloud className="w-4 h-4 text-teal-600" />;
  };

  const getSyncLabel = () => {
      if (!isGoogleConnected) return 'Offline';
      if (syncStatus === 'syncing') return 'Sincronizando...';
      if (syncStatus === 'success') return 'Sincronizado';
      if (syncStatus === 'error') return 'Erro Sync';
      return 'Conectado';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-20">
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <Flower2 className="w-8 h-8 text-teal-600 mr-3" />
        <span className="text-xl font-bold text-gray-800 tracking-tight">ZenControl</span>
      </div>

      {userName && (
        <div className="px-6 py-4 border-b border-gray-50">
           <p className="text-xs text-gray-500 uppercase font-semibold">Olá,</p>
           <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
        </div>
      )}

      <nav className="flex-1 py-4 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sync Status Indicator */}
      <div className="px-6 py-2">
         <div className="flex items-center space-x-2 text-xs font-medium bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
            {getSyncIcon()}
            <span className={`
                ${!isGoogleConnected ? 'text-gray-400' : ''}
                ${syncStatus === 'syncing' ? 'text-blue-600' : ''}
                ${syncStatus === 'success' ? 'text-green-600' : ''}
                ${syncStatus === 'error' ? 'text-red-600' : ''}
                ${syncStatus === 'idle' && isGoogleConnected ? 'text-teal-700' : ''}
            `}>
                {getSyncLabel()}
            </span>
         </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;