
import React, { useState } from 'react';
import { appStore } from '../services/store';
import { SchoolYear, User, UserRole } from '../types';
import { Calendar, Users, Plus, CheckCircle2, Circle, Shield, User as UserIcon, Trash2, KeyRound } from 'lucide-react';

export default function SettingsManager() {
    const [activeTab, setActiveTab] = useState<'years' | 'users'>('years');
    const [refresh, setRefresh] = useState(0);

    const forceUpdate = () => setRefresh(prev => prev + 1);

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="bg-slate-800 p-2 rounded-lg text-white">
                                <Shield className="w-6 h-6" />
                            </div>
                            Configuración del Sistema
                        </h2>
                        <p className="text-slate-500 mt-1">Gestión de periodos académicos y control de acceso</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6 bg-slate-50 gap-6">
                
                {/* Tab Switcher */}
                <div className="flex justify-center">
                    <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
                        <button 
                            onClick={() => setActiveTab('years')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                activeTab === 'years' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            <Calendar className="w-4 h-4" /> Años Escolares
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                activeTab === 'users' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            <Users className="w-4 h-4" /> Usuarios (Admin)
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {activeTab === 'years' ? (
                        <SchoolYearsPanel onUpdate={forceUpdate} />
                    ) : (
                        <UsersPanel onUpdate={forceUpdate} />
                    )}
                </div>
            </div>
        </div>
    );
}

function SchoolYearsPanel({ onUpdate }: { onUpdate: () => void }) {
    const years = appStore.getSchoolYears();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newName || !startDate || !endDate) return;

        appStore.addSchoolYear({
            id: crypto.randomUUID(),
            name: newName,
            startDate,
            endDate,
            isActive: false, // Default to inactive unless manually switched
            isClosed: false
        });
        
        setIsAdding(false);
        setNewName('');
        setStartDate('');
        setEndDate('');
        onUpdate();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700 text-lg">Historial de Periodos</h3>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> Nuevo Año
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {isAdding && (
                    <form onSubmit={handleAdd} className="mb-6 bg-indigo-50 border border-indigo-100 p-6 rounded-xl animate-in slide-in-from-top-2">
                        <h4 className="font-bold text-indigo-900 mb-4 text-sm uppercase">Registrar Nuevo Ciclo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nombre (Etiqueta)</label>
                                <input 
                                    className="w-full text-sm border-slate-300 rounded-lg p-2" 
                                    placeholder="Ej. 2026-2027" 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Inicio</label>
                                <input 
                                    type="date" 
                                    className="w-full text-sm border-slate-300 rounded-lg p-2"
                                    value={startDate} 
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Fin</label>
                                <input 
                                    type="date" 
                                    className="w-full text-sm border-slate-300 rounded-lg p-2"
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 text-sm font-medium hover:text-slate-800">Cancelar</button>
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">Guardar Ciclo</button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {years.map(year => (
                        <div key={year.id} className={`p-4 rounded-xl border flex items-center justify-between ${year.isActive ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-100' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${year.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{year.name}</h4>
                                    <p className="text-xs text-slate-500">
                                        Del <span className="font-semibold">{year.startDate}</span> al <span className="font-semibold">{year.endDate}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {year.isActive ? (
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        <CheckCircle2 className="w-4 h-4" /> Activo
                                    </span>
                                ) : (
                                    <button className="text-slate-400 hover:text-indigo-600 font-medium text-sm flex items-center gap-1 group transition-colors">
                                        <Circle className="w-4 h-4 group-hover:fill-indigo-600" /> Activar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function UsersPanel({ onUpdate }: { onUpdate: () => void }) {
    const users = appStore.getUsers();
    const [isAdding, setIsAdding] = useState(false);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    // Role is always Admin

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(!fullName || !username) return;

        appStore.addUser({
            id: crypto.randomUUID(),
            fullName,
            username,
            email,
            role: 'Admin',
        });

        setIsAdding(false);
        setFullName('');
        setUsername('');
        setEmail('');
        onUpdate();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700 text-lg">Directorio de Administradores</h3>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> Nuevo Admin
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {isAdding && (
                    <form onSubmit={handleAdd} className="mb-6 bg-slate-100 border border-slate-200 p-6 rounded-xl animate-in slide-in-from-top-2">
                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase">Nuevo Administrador</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nombre Completo</label>
                                <input className="w-full text-sm border-slate-300 rounded-lg p-2" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ej. Pedro Pérez" autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Usuario (Login)</label>
                                <input className="w-full text-sm border-slate-300 rounded-lg p-2" value={username} onChange={e => setUsername(e.target.value)} placeholder="Ej. pperez" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                <input className="w-full text-sm border-slate-300 rounded-lg p-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@manglar.edu.ve" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <KeyRound className="w-3 h-3" /> Contraseña por defecto: <strong>123456</strong>
                            </span>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 text-sm font-medium hover:text-slate-800">Cancelar</button>
                                <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-slate-900">Crear Admin</button>
                            </div>
                        </div>
                    </form>
                )}

                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Permisos</th>
                            <th className="p-4">Email</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{u.fullName}</p>
                                            <p className="text-xs text-slate-400">@{u.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded uppercase border bg-slate-800 text-white border-slate-900">
                                        Administrador
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-600">{u.email}</td>
                                <td className="p-4 text-right">
                                    <button className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
