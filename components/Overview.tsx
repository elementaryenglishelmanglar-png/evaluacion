
import React, { useEffect, useState } from 'react';
import { appStore } from '../services/store';
import { Users, AlertOctagon, TrendingUp, Activity, ArrowUpRight, Calendar, User, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { seedData } from '../services/seed';

export default function Overview() {
  const [stats, setStats] = useState<any>({ totalEvaluations: 0, studentsAtRisk: 0, activeAdaptations: 0, averageScore: "0.00" });
  const [recent, setRecent] = useState<any[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (confirm('¿Estás seguro? Esto creará datos de prueba.')) {
      setIsSeeding(true);
      await seedData();
      alert('Datos cargados. Recarga la página.');
      setIsSeeding(false);
    }
  };


  // Force refresh for demo purposes when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const s = await appStore.getStats();
      const r = await appStore.getRecentActivity();
      const c = await appStore.getStudentCountsByGrade();
      setStats(s);
      setRecent(r);
      setStudentCounts(c);
    };

    fetchData(); // Initial fetch

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // Increased interval to 5s to reduce API load
    return () => clearInterval(interval);
  }, []);

  // Mock data for the trend chart
  const trendData = [
    { name: 'Sep', score: 3.2 },
    { name: 'Oct', score: 3.5 },
    { name: 'Nov', score: 3.1 },
    { name: 'Dic', score: 3.8 },
    { name: 'Ene', score: 4.1 },
    { name: 'Feb', score: 4.0 },
    { name: 'Mar', score: Number(stats.averageScore) },
  ];

  const getBubbleColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-sky-400 text-white';
      case 'C': return 'bg-orange-500 text-white';
      case 'D': return 'bg-red-500 text-white';
      case 'E': return 'bg-slate-300 text-slate-700';
      case 'SE': return 'bg-slate-600 text-white';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  // Helper to convert numeric score to qualitative letter for display
  const getLetterScore = (score: number) => {
    if (score >= 4.5) return 'A';
    if (score >= 3.5) return 'B';
    if (score >= 2.5) return 'C';
    if (score >= 1.5) return 'D';
    if (score >= 0.5) return 'E';
    return 'SE';
  };

  const gradesConfig = [
    { id: '1er Grado', color: 'bg-[#00E535]', label: '1er Grado' }, // Vibrant Green
    { id: '2do Grado', color: 'bg-[#8AC7FF]', label: '2do Grado' }, // Light Blue
    { id: '3er Grado', color: 'bg-[#E500E5]', label: '3er Grado' }, // Magenta
    { id: '4to Grado', color: 'bg-[#60A5FA]', label: '4to Grado' }, // Sky Blue
    { id: '5to Grado', color: 'bg-[#3B82F6]', label: '5to Grado' }, // Royal Blue
    { id: '6to Grado', color: 'bg-[#00E5E5]', label: '6to Grado' }, // Cyan
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
          <p className="text-slate-500 text-lg">Resumen ejecutivo del rendimiento escolar y matrícula.</p>
          {stats.totalEvaluations === 0 && (
            <button onClick={handleSeed} disabled={isSeeding} className="mt-2 text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md font-bold hover:bg-indigo-200">
              {isSeeding ? 'Cargando...' : '🌱 Cargar Datos de Prueba'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <span>Marzo 2025</span>
        </div>
      </div>

      {/* 2. GRADE ENROLLMENT MATRIX (Vibrant Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {gradesConfig.map((grade) => (
          <div
            key={grade.id}
            className={`${grade.color} rounded-2xl p-5 text-white shadow-lg shadow-black/5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="relative z-10">
              <h3 className="text-5xl font-black tracking-tighter mb-1">
                {studentCounts[grade.id] || 0}
              </h3>
              <p className="font-bold text-sm opacity-90 uppercase tracking-wide">{grade.label}</p>
            </div>
            {/* Decorative Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-50 transition-opacity">
              <UserCheck className="w-12 h-12" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. KPI Secondary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Evaluaciones Totales</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{stats.totalEvaluations}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Estudiantes en Riesgo</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{stats.studentsAtRisk}</span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full ml-2 overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${(stats.studentsAtRisk / stats.totalEvaluations) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Adaptaciones (AC)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{stats.activeAdaptations}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Activas</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 - PROMEDIO GLOBAL UPDATED */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Promedio Global</p>
            <div className="flex items-baseline gap-2">
              {/* Show Letter Big */}
              <span className="text-3xl font-black text-indigo-600">{getLetterScore(Number(stats.averageScore))}</span>
              {/* Show Number Small */}
              <span className="text-sm font-bold text-slate-400">({stats.averageScore})</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Main Chart - YAXIS UPDATED */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Tendencia de Rendimiento Académico</h3>
            <button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors">
              Ver Informe Completo
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                  domain={[0, 5.5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickFormatter={getLetterScore}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  formatter={(value: number) => [
                    <span className="flex items-center gap-2">
                      <span className="text-indigo-600 text-lg">{getLetterScore(value)}</span>
                      <span className="text-xs text-slate-400 font-normal">({value})</span>
                    </span>,
                    "Nivel"
                  ]}
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Actividad Reciente</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[320px]">
            {recent.map((record) => (
              <div key={record.id} className="flex gap-4 items-start group">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110 ${getBubbleColor(record.grade)}`}>
                  {record.grade}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-800 truncate">{record.studentName}</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {new Date(record.timestamp).getDate()}/{new Date(record.timestamp).getMonth() + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Lenguaje • 6to Grado</p>
                  {record.teacherObservation.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
                      "{record.teacherObservation}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm text-indigo-600 font-bold bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            Ver Todo el Historial
          </button>
        </div>

      </div>
    </div>
  );
}
