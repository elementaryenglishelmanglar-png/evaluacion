
import React, { useState, useEffect } from 'react';
import { appStore } from '../services/store';
import { getGradeDistribution } from '../services/calcService';
import { QualitativeGrade, ChallengeLevel, AssessmentTerm } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Users, AlertOctagon, BookOpen, Calendar, Layers } from 'lucide-react';

export default function ComparativeAnalytics() {
    // Context A (Reference / Current)
    const [contextA, setContextA] = useState({
        year: '2025-2026',
        grade: '6to Grado',
        subject: 'Lenguaje',
        lapse: 'I Lapso',
        term: AssessmentTerm.MONTH_1
    });

    // Context B (Comparison / Past)
    const [contextB, setContextB] = useState({
        year: '2024-2025',
        grade: '6to Grado',
        subject: 'Lenguaje',
        lapse: 'I Lapso',
        term: AssessmentTerm.MONTH_1
    });

    // Data State
    const [dataA, setDataA] = useState<any[]>([]);
    const [dataB, setDataB] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const dA = await appStore.getRecordsByContext(contextA.grade, contextA.subject, contextA.term);
            setDataA(dA);

            // Simulator
            const variance = contextB.year === '2025-2026' ? 'similar' : 'worse';
            const dB = await appStore.getSimulatedHistoricalData(contextB, variance);
            setDataB(dB);
        };
        fetchData();
    }, [contextA, contextB]);

    // --- METRICS CALCULATION ---
    const calculateMetrics = (records: any[]) => {
        const total = records.length;
        const avg = total > 0 ? records.reduce((acc, r) => acc + r.finalScore, 0) / total : 0;
        const atRisk = records.filter((r: any) => [QualitativeGrade.E, QualitativeGrade.SE].includes(r.grade)).length;
        const adaptations = records.filter((r: any) => r.challengeLevel !== ChallengeLevel.NORMAL).length;
        const acPlus = records.filter((r: any) => r.challengeLevel === ChallengeLevel.AC_PLUS).length;
        const acMinus = records.filter((r: any) => r.challengeLevel === ChallengeLevel.AC_MINUS).length;

        return { total, avg, atRisk, adaptations, acPlus, acMinus };
    };

    const metricsA = calculateMetrics(dataA);
    const metricsB = calculateMetrics(dataB);

    // Calculate Deltas (A - B)
    const deltaAvg = metricsA.avg - metricsB.avg;
    const deltaRisk = metricsA.atRisk - metricsB.atRisk;

    // Helper to convert numeric score to qualitative letter for display
    const getLetterScore = (score: number) => {
        if (score >= 4.5) return 'A';
        if (score >= 3.5) return 'B';
        if (score >= 2.5) return 'C';
        if (score >= 1.5) return 'D';
        if (score >= 0.5) return 'E';
        return 'SE';
    };

    // --- CHART DATA PREPARATION ---
    const distA = getGradeDistribution(dataA);
    const distB = getGradeDistribution(dataB);

    // Merge for Bar Chart
    const chartData = distA.map((item, index) => ({
        name: item.name,
        [contextA.year]: item.count,
        [contextB.year]: distB[index].count
    }));

    const getDeltaColor = (val: number, inverse = false) => {
        if (val === 0) return 'text-slate-400 bg-slate-100';
        if (val > 0) return inverse ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50';
        return inverse ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
    };

    const getDeltaIcon = (val: number) => {
        if (val === 0) return <Minus className="w-3 h-3" />;
        if (val > 0) return <ArrowUp className="w-3 h-3" />;
        return <ArrowDown className="w-3 h-3" />;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        Comparativa Avanzada
                    </h2>
                    <p className="text-slate-500 mt-1">Benchmarking longitudinal entre cohortes académicas</p>
                </div>
            </div>

            {/* 1. CONTEXT SELECTORS (Split View) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Cohort A (Left) */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-indigo-50/30">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Cohorte Base (A)</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Año Escolar</label>
                                <select
                                    value={contextA.year}
                                    onChange={(e) => setContextA({ ...contextA, year: e.target.value })}
                                    className="w-full text-sm font-bold border-slate-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option>2025-2026</option>
                                    <option>2024-2025</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Grado</label>
                                <select
                                    value={contextA.grade}
                                    onChange={(e) => setContextA({ ...contextA, grade: e.target.value })}
                                    className="w-full text-sm font-bold border-slate-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="6to Grado">6to Grado</option>
                                    <option value="5to Grado">5to Grado</option>
                                    <option value="4to Grado">4to Grado</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Materia</label>
                                <select
                                    value={contextA.subject}
                                    onChange={(e) => setContextA({ ...contextA, subject: e.target.value })}
                                    className="w-full text-xs font-bold border-slate-200 rounded-lg focus:ring-indigo-500 py-2"
                                >
                                    <option>Lenguaje</option>
                                    <option>Matemáticas</option>
                                    <option>Inglés</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Lapso</label>
                                <select
                                    value={contextA.lapse}
                                    onChange={(e) => setContextA({ ...contextA, lapse: e.target.value })}
                                    className="w-full text-xs font-bold border-slate-200 rounded-lg focus:ring-indigo-500 py-2"
                                >
                                    <option>I Lapso</option>
                                    <option>II Lapso</option>
                                    <option>III Lapso</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> Evaluación</label>
                                <select
                                    value={contextA.term}
                                    onChange={(e) => setContextA({ ...contextA, term: e.target.value as AssessmentTerm })}
                                    className="w-full text-xs font-bold border-slate-200 rounded-lg focus:ring-indigo-500 py-2"
                                >
                                    {Object.values(AssessmentTerm).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cohort B (Right) */}
                <div className="p-6 bg-amber-50/30">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Cohorte Comparativa (B)</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Año Escolar</label>
                                <select
                                    value={contextB.year}
                                    onChange={(e) => setContextB({ ...contextB, year: e.target.value })}
                                    className="w-full text-sm font-bold border-slate-200 rounded-lg focus:ring-amber-500"
                                >
                                    <option>2024-2025</option>
                                    <option>2023-2024</option>
                                    <option>2025-2026</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Grado</label>
                                <select
                                    value={contextB.grade}
                                    onChange={(e) => setContextB({ ...contextB, grade: e.target.value })}
                                    className="w-full text-sm font-bold border-slate-200 rounded-lg focus:ring-amber-500"
                                >
                                    <option value="6to Grado">6to Grado</option>
                                    <option value="5to Grado">5to Grado</option>
                                    <option value="4to Grado">4to Grado</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Materia</label>
                                <select
                                    value={contextB.subject}
                                    onChange={(e) => setContextB({ ...contextB, subject: e.target.value })}
                                    className="w-full text-xs font-bold border-slate-200 rounded-lg focus:ring-amber-500 py-2"
                                >
                                    <option>Lenguaje</option>
                                    <option>Matemáticas</option>
                                    <option>Inglés</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Lapso</label>
                                <select
                                    value={contextB.lapse}
                                    onChange={(e) => setContextB({ ...contextB, lapse: e.target.value })}
                                    className="w-full text-xs font-bold border-slate-200 rounded-lg focus:ring-amber-500 py-2"
                                >
                                    <option>I Lapso</option>
                                    <option>II Lapso</option>
                                    <option>III Lapso</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> Evaluación</label>
                                <select
                                    value={contextB.term}
                                    onChange={(e) => setContextB({ ...contextB, term: e.target.value as AssessmentTerm })}
                                    className="w-full text-xs font-bold border-slate-200 rounded-lg focus:ring-amber-500 py-2"
                                >
                                    {Object.values(AssessmentTerm).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. GAP ANALYSIS (KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* KPI 1: Performance Gap (Updated with Letters) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Brecha de Rendimiento</p>
                            <div className="flex items-baseline gap-3 mt-1">
                                <h4 className="text-4xl font-black text-slate-800">
                                    {getLetterScore(metricsA.avg)}
                                </h4>
                                <span className={`text-lg font-bold ${deltaAvg > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {deltaAvg > 0 ? '+' : ''}{deltaAvg.toFixed(2)} pts
                                </span>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getDeltaColor(deltaAvg)}`}>
                            {getDeltaIcon(deltaAvg)}
                            {metricsB.avg > 0 ? Math.abs((deltaAvg / metricsB.avg) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                        <div>
                            <span className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Cohorte A</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                                {getLetterScore(metricsA.avg)} <span className="text-slate-400 font-normal">({metricsA.avg.toFixed(2)})</span>
                            </span>
                        </div>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div>
                            <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Cohorte B</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                                {getLetterScore(metricsB.avg)} <span className="text-slate-400 font-normal">({metricsB.avg.toFixed(2)})</span>
                            </span>
                        </div>
                    </div>
                    <TrendingUp className="absolute right-4 bottom-4 w-16 h-16 text-slate-50 opacity-50" />
                </div>

                {/* KPI 2: Risk Reduction */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Casos de Riesgo</p>
                            <h4 className="text-2xl font-black text-slate-800 mt-1">
                                {deltaRisk > 0 ? '+' : ''}{deltaRisk} Est.
                            </h4>
                        </div>
                        {/* Inverse logic: Negative delta is GOOD for risk */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getDeltaColor(deltaRisk, true)}`}>
                            {getDeltaIcon(deltaRisk)}
                            {deltaRisk !== 0 ? 'Cambio' : 'Sin cambio'}
                        </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                        <div>
                            <span className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Cohorte A</span>
                            <span className="font-bold text-slate-700">{metricsA.atRisk}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div>
                            <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Cohorte B</span>
                            <span className="font-bold text-slate-700">{metricsB.atRisk}</span>
                        </div>
                    </div>
                    <AlertOctagon className="absolute right-4 bottom-4 w-16 h-16 text-slate-50 opacity-50" />
                </div>

                {/* KPI 3: Inclusion Breakdown (Updated) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Índice de Inclusión (AC)</p>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="space-y-4 mt-2">
                        {/* Row A */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Cohorte A</span>
                                <span className="text-xs font-bold text-slate-700">{((metricsA.adaptations / (metricsA.total || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex gap-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="bg-indigo-500" style={{ width: `${(metricsA.acPlus / (metricsA.total || 1)) * 100}%` }} title="AC+"></div>
                                <div className="bg-purple-500" style={{ width: `${(metricsA.acMinus / (metricsA.total || 1)) * 100}%` }} title="AC-"></div>
                            </div>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[10px] text-slate-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> AC+: {metricsA.acPlus}</span>
                                <span className="text-[10px] text-slate-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> AC-: {metricsA.acMinus}</span>
                            </div>
                        </div>

                        {/* Row B */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-amber-600 uppercase">Cohorte B</span>
                                <span className="text-xs font-bold text-slate-700">{((metricsB.adaptations / (metricsB.total || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex gap-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="bg-amber-500" style={{ width: `${(metricsB.acPlus / (metricsB.total || 1)) * 100}%` }} title="AC+"></div>
                                <div className="bg-orange-500" style={{ width: `${(metricsB.acMinus / (metricsB.total || 1)) * 100}%` }} title="AC-"></div>
                            </div>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[10px] text-slate-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> AC+: {metricsB.acPlus}</span>
                                <span className="text-[10px] text-slate-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> AC-: {metricsB.acMinus}</span>
                            </div>
                        </div>
                    </div>

                    <Users className="absolute right-4 bottom-4 w-16 h-16 text-slate-50 opacity-50 pointer-events-none" />
                </div>

            </div>

            {/* 3. VISUALIZATION (Main Chart) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución Comparativa de Calificaciones</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey={contextA.year} name={`Cohorte A (${contextA.year})`} fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey={contextB.year} name={`Cohorte B (${contextB.year})`} fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Análisis de Brecha</h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-sm text-slate-700 mb-2">Conclusión Automática</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {deltaAvg >= 0
                                    ? <span>Se observa una mejora del <span className="font-bold text-emerald-600">{metricsB.avg > 0 ? Math.abs((deltaAvg / metricsB.avg) * 100).toFixed(1) : 0}%</span> en el rendimiento promedio.</span>
                                    : <span>Se observa una disminución del <span className="font-bold text-rose-500">{metricsB.avg > 0 ? Math.abs((deltaAvg / metricsB.avg) * 100).toFixed(1) : 0}%</span> en el rendimiento promedio.</span>
                                }
                                {' '}
                                {deltaRisk < 0
                                    ? 'La reducción de estudiantes en riesgo sugiere que las estrategias de intervención temprana están funcionando.'
                                    : deltaRisk > 0
                                        ? 'El aumento de casos de riesgo requiere revisión inmediata de las estrategias de nivelación.'
                                        : 'La cantidad de casos de riesgo se mantiene estable.'
                                }
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-sm text-slate-700 mb-2">Foco de Atención</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {metricsA.acPlus > metricsB.acPlus
                                    ? 'Se ha detectado un incremento en estudiantes de alto rendimiento (AC+), sugiriendo la necesidad de programas de enriquecimiento.'
                                    : 'La distribución sugiere mantener el foco en consolidar el grupo promedio hacia niveles superiores.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
