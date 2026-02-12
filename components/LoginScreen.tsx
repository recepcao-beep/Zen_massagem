import React, { useState } from 'react';
import { User, UserRole, Masseur } from '../types';
import { Flower2, UserCog, UserCheck, Users, Lock, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  masseurs: Masseur[];
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ masseurs, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedMasseurId, setSelectedMasseurId] = useState<string>('');
  
  // Admin Password State
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleMasseurLogin = () => {
    if (!selectedMasseurId) return;
    const m = masseurs.find(m => m.id === selectedMasseurId);
    if (m) {
        onLogin({ name: m.name, role: 'masseur', id: m.id });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Vilage#2027') {
      onLogin({ name: 'Administrador', role: 'admin' });
    } else {
      setError('Senha incorreta.');
    }
  };

  const resetState = () => {
    setSelectedRole(null);
    setAdminPassword('');
    setError('');
    setSelectedMasseurId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-teal-50 p-4 rounded-full">
                <Flower2 className="w-12 h-12 text-teal-600" />
            </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ZenControl</h1>
        
        {!selectedRole ? (
            <>
                <p className="text-gray-500 mb-8">Selecione seu perfil de acesso</p>
                <div className="space-y-4">
                    <button 
                        onClick={() => setSelectedRole('admin')}
                        className="w-full flex items-center p-4 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all group"
                    >
                        <div className="bg-gray-100 p-3 rounded-full group-hover:bg-white">
                            <UserCog className="w-6 h-6 text-gray-600 group-hover:text-teal-600" />
                        </div>
                        <div className="ml-4 text-left">
                            <p className="font-bold text-gray-800">Administrador</p>
                            <p className="text-xs text-gray-500">Acesso total ao sistema</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => onLogin({ name: 'Recepção', role: 'receptionist' })}
                        className="w-full flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="bg-gray-100 p-3 rounded-full group-hover:bg-white">
                            <UserCheck className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div className="ml-4 text-left">
                            <p className="font-bold text-gray-800">Recepcionista</p>
                            <p className="text-xs text-gray-500">Apenas agenda</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setSelectedRole('masseur')}
                        className="w-full flex items-center p-4 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all group"
                    >
                        <div className="bg-gray-100 p-3 rounded-full group-hover:bg-white">
                            <Users className="w-6 h-6 text-gray-600 group-hover:text-pink-600" />
                        </div>
                        <div className="ml-4 text-left">
                            <p className="font-bold text-gray-800">Massagista</p>
                            <p className="text-xs text-gray-500">Tarefas e disponibilidade</p>
                        </div>
                    </button>
                </div>
            </>
        ) : selectedRole === 'masseur' ? (
            // Masseur Selection
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <p className="text-gray-500 mb-6">Identifique-se</p>
                <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quem é você?</label>
                    <select 
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={selectedMasseurId}
                        onChange={(e) => setSelectedMasseurId(e.target.value)}
                    >
                        <option value="">Selecione seu nome...</option>
                        {masseurs.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleMasseurLogin}
                    disabled={!selectedMasseurId}
                    className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Entrar
                </button>

                <button 
                    onClick={resetState}
                    className="w-full py-2 text-gray-500 text-sm hover:text-gray-800 flex items-center justify-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </button>
            </div>
        ) : (
            // Admin Password Screen
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <p className="text-gray-500 mb-6">Área Restrita</p>
                
                <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha de Administrador</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            autoFocus
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Digite a senha"
                            value={adminPassword}
                            onChange={(e) => { setAdminPassword(e.target.value); setError(''); }}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <button 
                    type="submit"
                    className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                >
                    Acessar
                </button>

                <button 
                    type="button"
                    onClick={resetState}
                    className="w-full py-2 text-gray-500 text-sm hover:text-gray-800 flex items-center justify-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </button>
            </form>
        )}

        <p className="mt-8 text-xs text-gray-400">ZenControl System v1.1</p>
      </div>
    </div>
  );
};

export default LoginScreen;