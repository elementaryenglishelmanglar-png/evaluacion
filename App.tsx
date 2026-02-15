
import React, { useState, useEffect } from 'react';
import Overview from './components/Overview';
import MeetingReports from './components/Dashboard';
import EvaluationInput from './components/EvaluationInput';
import CompetencyLibrary from './components/CompetencyLibrary';
import StudentManager from './components/StudentManager';
import ComparativeAnalytics from './components/ComparativeAnalytics';
import SettingsManager from './components/SettingsManager';
import Login from './components/Login';
import { appStore } from './services/store';
import {
    LayoutDashboard,
    PenTool,
    FilePieChart,
    Settings,
    LogOut,
    Sprout, // Used for Manglar logo
    ListTree,
    UserPlus,
    ArrowRightLeft
} from 'lucide-react';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeView, setActiveView] = useState<'overview' | 'input' | 'reports' | 'library' | 'students' | 'compare' | 'settings'>('overview');

    // Auth Handler
    const handleLogin = () => {
        // Re-fetch user on login
        checkUser();
    };

    const handleLogout = async () => {
        await appStore.logout();
        setIsAuthenticated(false);
        // setUser(null); // If we had user state here
    };

    // User checking logic
    const checkUser = async () => {
        const currentUser = await appStore.getCurrentUser();
        if (currentUser) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        return currentUser;
    };

    // Initial check
    useEffect(() => {
        checkUser();
    }, []);

    // Pass user fetching down or use context in real app, 
    // but for now we'll rely on store state or re-fetch in components?
    // Actually App uses user.fullName in render. We need it in state.
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const u = await appStore.getCurrentUser();
            setUser(u);
        };
        if (isAuthenticated) loadUser();
    }, [isAuthenticated]);


    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    // Show loading if authenticated but no user data yet (prevents crash)
    if (isAuthenticated && !user) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 flex-shrink-0">
                <div className="h-24 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
                    <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-900/20">
                        <Sprout className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3 hidden lg:block">
                        <span className="block font-black text-white text-lg tracking-tight leading-none">Manglar</span>
                        <span className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Evaluación</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-2 px-2 lg:px-4">
                    <SidebarItem
                        icon={<LayoutDashboard />}
                        label="Visión General"
                        active={activeView === 'overview'}
                        onClick={() => setActiveView('overview')}
                    />
                    <SidebarItem
                        icon={<UserPlus />}
                        label="Matrícula"
                        active={activeView === 'students'}
                        onClick={() => setActiveView('students')}
                    />
                    <SidebarItem
                        icon={<PenTool />}
                        label="Evaluar Clase"
                        active={activeView === 'input'}
                        onClick={() => setActiveView('input')}
                    />
                    <SidebarItem
                        icon={<FilePieChart />}
                        label="Reportes Pedagógicos"
                        active={activeView === 'reports'}
                        onClick={() => setActiveView('reports')}
                    />
                    <SidebarItem
                        icon={<ArrowRightLeft />}
                        label="Comparativa Avanzada"
                        active={activeView === 'compare'}
                        onClick={() => setActiveView('compare')}
                    />
                    <SidebarItem
                        icon={<ListTree />}
                        label="Malla Curricular"
                        active={activeView === 'library'}
                        onClick={() => setActiveView('library')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => setActiveView('settings')}
                        className={`flex items-center gap-3 text-sm font-medium transition-colors w-full p-2 rounded-lg mb-2 ${activeView === 'settings' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-800'}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="hidden lg:block">Configuración</span>
                    </button>
                    <div className="mt-4 flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md border-2 border-slate-800">
                            {user?.fullName.charAt(0) || 'U'}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.role}</p>
                        </div>
                        <LogOut
                            onClick={handleLogout}
                            className="w-4 h-4 ml-auto hover:text-white cursor-pointer hidden lg:block text-slate-500 transition-colors"
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Mobile Bar (only visible on small) could go here */}

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {activeView === 'overview' && <Overview />}
                        {activeView === 'students' && <StudentManager />}
                        {activeView === 'input' && <EvaluationInput />}
                        {activeView === 'reports' && <MeetingReports />}
                        {activeView === 'compare' && <ComparativeAnalytics />}
                        {activeView === 'library' && <CompetencyLibrary />}
                        {activeView === 'settings' && <SettingsManager />}
                    </div>
                </div>
            </main>

        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
        >
            <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
            </span>
            <span className="font-medium text-sm hidden lg:block">{label}</span>
            {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full hidden lg:block opacity-20"></div>}
        </button>
    )
}
