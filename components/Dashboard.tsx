
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { appStore } from '../services/store';
import { getGradeDistribution, getAdaptationStats, getGradeDistribution as getGradeDist, getGradesByAdaptationLevel } from '../services/calcService';
import { analyzeClassPatterns } from '../services/geminiService';
import { QualitativeGrade, ClassAnalysisResult, ChallengeLevel, AssessmentTerm, ActionPlan, ActionType, ActionStatus } from '../types';
import {
    BarChart3, Calendar, Users, TrendingUp, AlertCircle, CheckCircle2,
    Search, Filter, Download, ChevronDown, Plus, Brain, Target,
    ArrowRight, BookOpen, GraduationCap, Clock, FileText, ClipboardList,
    MoreHorizontal, ArrowUpRight, ArrowDownRight, Printer, Share2, Trash2,
    Loader2, Sparkles, CheckSquare, PlusCircle, CalendarDays, User, X, XCircle, PieChart as PieIcon
} from 'lucide-react';
import StudentHistory from './StudentHistory';

export default function MeetingReports() {
    const [context, setContext] = useState({
        grade: '6to Grado',
        subject: 'Lenguaje',
        term: AssessmentTerm.MONTH_1,
        lapse: 'I Lapso',
        year: ''
    });

    const [schoolYears, setSchoolYears] = useState<any[]>([]);

    useEffect(() => {
        const fetchYears = async () => {
            const years = await appStore.getSchoolYears();
            setSchoolYears(years);
            const active = years.find(y => y.isActive);
            if (active) setContext(prev => ({ ...prev, year: active.name }));
            else if (years.length > 0) setContext(prev => ({ ...prev, year: years[0].name }));
        };
        fetchYears();
    }, []);

    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<ClassAnalysisResult | null>(null);

    // Action Plan State
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionTarget, setActionTarget] = useState<{ id: string, name: string } | null>(null);
    const [actionDescription, setActionDescription] = useState('');
    const [actionType, setActionType] = useState<ActionType>('Refuerzo Académico');
    const [actionPriority, setActionPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');

    // Closing Action Modal State
    const [closingAction, setClosingAction] = useState<{ id: string, newStatus: ActionStatus } | null>(null);
    const [closureNote, setClosureNote] = useState('');

    const [refreshTrigger, setRefreshTrigger] = useState(0); // Simple way to force re-render when store updates

    // Student History Modal State
    const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

    // Data States
    const [records, setRecords] = useState<any[]>([]);
    const [actionPlans, setActionPlans] = useState<any[]>([]);
    const [interventionStats, setInterventionStats] = useState<any>({ distribution: [], successRate: 0, total: 0 });

    // Competency Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTargetRecordId, setAssignTargetRecordId] = useState<string | null>(null);
    const [availableCompetencies, setAvailableCompetencies] = useState<any[]>([]);
    const [selectedCompetenciesForAssign, setSelectedCompetenciesForAssign] = useState<string[]>([]);


    // Fetch Data Effect
    useEffect(() => {
        const fetchData = async () => {
            const r = await appStore.getRecordsByContext(context.grade, context.subject, context.term);
            const ap = await appStore.getActionPlans();
            const is = await appStore.getInterventionStats();
            setRecords(r);
            setActionPlans(ap);
            setInterventionStats(is);
        };
        fetchData();
    }, [context, refreshTrigger]); // Dependency on context and refreshTrigger

    // Computed Data for Charts (Derived from state)
    const gradeDist = getGradeDistribution(records);



    const adaptationStats = getAdaptationStats(records);

    // Advanced Breakdowns (Simplified for the side panel)
    const acPlusDist = getGradesByAdaptationLevel(records, ChallengeLevel.AC_PLUS).filter(d => d.count > 0);
    const acMinusDist = getGradesByAdaptationLevel(records, ChallengeLevel.AC_MINUS).filter(d => d.count > 0);

    // Totals for mini charts checks
    const acPlusCount = records.filter(r => r.challengeLevel === ChallengeLevel.AC_PLUS).length;
    const acMinusCount = records.filter(r => r.challengeLevel === ChallengeLevel.AC_MINUS).length;

    const handleAnalysis = async () => {
        setAnalyzing(true);
        const result = await analyzeClassPatterns(records);
        setAiResult(result);
        setAnalyzing(false);
    };

    const getBadgeColor = (grade: QualitativeGrade) => {
        switch (grade) {
            case QualitativeGrade.A: return 'bg-green-500 text-white'; // Verde
            case QualitativeGrade.B: return 'bg-sky-400 text-white'; // Azul Claro
            case QualitativeGrade.C: return 'bg-orange-500 text-white'; // Naranja
            case QualitativeGrade.D: return 'bg-red-500 text-white'; // Rojo
            case QualitativeGrade.E: return 'bg-slate-300 text-slate-700'; // Gris Claro
            case QualitativeGrade.SE: return 'bg-slate-600 text-white'; // Gris Oscuro
            default: return 'bg-slate-200 text-slate-500';
        }
    };

    const getStatusColor = (status: ActionStatus) => {
        switch (status) {
            case 'Exitosa': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Sin Éxito': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'En Progreso': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    // --- Actions Logic ---

    const openActionModal = (targetId: string, targetName: string, defaultDesc: string = '') => {
        setActionTarget({ id: targetId, name: targetName });
        setActionDescription(defaultDesc);
        setShowActionModal(true);
    };

    const handleCreateAction = () => {
        if (!actionTarget || !actionDescription) return;

        const newPlan: ActionPlan = {
            id: crypto.randomUUID(),
            targetId: actionTarget.id,
            targetName: actionTarget.name,
            description: actionDescription,
            type: actionType,
            status: 'Pendiente',
            priority: actionPriority,
            createdAt: new Date().toISOString().split('T')[0]
        };

        appStore.addActionPlan(newPlan);
        setShowActionModal(false);
        setRefreshTrigger(p => p + 1); // Refresh UI
        // Reset form
        setActionDescription('');
        setActionPriority('Media');
    };

    const initUpdateStatus = (id: string, newStatus: string) => {
        const status = newStatus as ActionStatus;

        // If closing the action, require observation
        if (status === 'Exitosa' || status === 'Sin Éxito') {
            setClosingAction({ id, newStatus: status });
            setClosureNote('');
        } else {
            // Just update normally for "En Progreso" or "Pendiente"
            appStore.updateActionPlanStatus(id, status);
            setRefreshTrigger(p => p + 1);
        }
    };

    const confirmClosure = () => {
        if (!closingAction) return;
        appStore.updateActionPlanStatus(closingAction.id, closingAction.newStatus, closureNote);
        setClosingAction(null);
        setClosureNote('');
        setRefreshTrigger(p => p + 1);
        setClosingAction(null);
        setClosureNote('');
        setRefreshTrigger(p => p + 1);
    };

    // --- Assignment Logic ---

    const openAssignModal = async (recordId: string) => {
        setAssignTargetRecordId(recordId);
        // Load competencies for current context (ALL GRADES for this subject)
        const comps = await appStore.getCompetencies(undefined, context.subject);
        // Filter out "Generic" ones if we don't want to assign to generic again
        setAvailableCompetencies(comps.filter(c => c.description !== 'Evaluación General (Sin Competencia Asignada)'));
        setSelectedCompetenciesForAssign([]);
        setShowAssignModal(true);
    };

    const toggleAssignCompetency = (compId: string) => {
        if (selectedCompetenciesForAssign.includes(compId)) {
            setSelectedCompetenciesForAssign(prev => prev.filter(id => id !== compId));
        } else {
            setSelectedCompetenciesForAssign(prev => [...prev, compId]);
        }
    };

    const handleConfirmAssign = async () => {
        if (!assignTargetRecordId || selectedCompetenciesForAssign.length === 0) return;

        const success = await appStore.assignRecordToCompetencies(assignTargetRecordId, selectedCompetenciesForAssign);
        if (success) {
            setRefreshTrigger(p => p + 1);
            setShowAssignModal(false);
            setAssignTargetRecordId(null);
        } else {
            alert('Error al asignar competencias. Intente nuevamente.');
        }
    };

    // --- Components ---

    const AdaptationDonut = ({ data, total }: { data: any[], total: number }) => {
        if (total === 0) return <div className="text-center text-slate-400 text-xs py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">Sin datos de adaptación</div>;

        return (
            <div className="flex items-center gap-4">
                <div className="h-32 w-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-slate-700">{total}</span>
                            <span className="text-[10px] text-slate-400 uppercase">Total</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                                <span className="text-slate-600 font-medium">{entry.name}</span>
                            </div>
                            <span className="font-bold text-slate-700">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // --- RENDER ---
    const GradeChart = ({ title, data, count }: { title: string, data: any[], count: number }) => {
        if (count === 0) return (
            <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">{title}</h5>
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                    Sin datos
                </div>
            </div>
        );

        return (
            <div>
                <div className="flex justify-between items-end mb-2">
                    <h5 className="text-xs font-bold text-slate-500 uppercase">{title}</h5>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Total: {count}</span>
                </div>
                <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 top-0 left-0 lg:left-64 bg-slate-50 flex flex-col z-10 animate-in fade-in duration-300">

            {/* STUDENT HISTORY SLIDE-OVER */}
            {viewingStudentId && (
                <StudentHistory
                    studentId={viewingStudentId}
                    onClose={() => setViewingStudentId(null)}
                />
            )}

            {/* ASSIGN COMPETENCY MODAL */}
            {showAssignModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <Target className="w-6 h-6 text-indigo-600" />
                                    Asignar Competencia
                                </h3>
                                <p className="text-slate-500">Seleccione una o varias competencias para esta evaluación.</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-rose-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 mb-6">
                            {availableCompetencies.length > 0 ? (
                                // Group by Grade Level
                                Object.entries(availableCompetencies.reduce((acc, comp) => {
                                    const grade = comp.gradeLevel || 'Sin Grado';
                                    if (!acc[grade]) acc[grade] = [];
                                    acc[grade].push(comp);
                                    return acc;
                                }, {} as Record<string, any[]>)).sort((a, b) => a[0].localeCompare(b[0])).map(([grade, comps]) => (
                                    <div key={grade}>
                                        <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">{grade}</h4>
                                        <div className="space-y-3">
                                            {(comps as any[]).map(comp => {
                                                const isSelected = selectedCompetenciesForAssign.includes(comp.id);
                                                return (
                                                    <button
                                                        key={comp.id}
                                                        onClick={() => toggleAssignCompetency(comp.id)}
                                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4
                                                    ${isSelected
                                                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-200'
                                                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                                                    ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                {comp.description}
                                                            </p>
                                                            <span className="text-xs text-slate-400 mt-1 block uppercase font-bold tracking-wider">{comp.type}</span>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-10">No hay competencias disponibles para {context.subject}.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmAssign}
                                disabled={selectedCompetenciesForAssign.length === 0}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:shadow-none"
                            >
                                Asignar ({selectedCompetenciesForAssign.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CLOSING ACTION MODAL */}
            {closingAction && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Cerrar Plan de Acción</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Estás marcando esta acción como <span className={`font-bold ${closingAction.newStatus === 'Exitosa' ? 'text-emerald-600' : 'text-rose-600'}`}>{closingAction.newStatus}</span>.
                            Por favor, añade una observación final para el historial pedagógico.
                        </p>

                        <textarea
                            className="w-full text-sm border-slate-200 rounded-lg p-3 bg-slate-50 h-32 focus:ring-indigo-500 mb-4"
                            placeholder="Ej. La reunión fue positiva, se acordaron nuevos horarios de estudio..."
                            value={closureNote}
                            onChange={(e) => setClosureNote(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setClosingAction(null)}
                                className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmClosure}
                                className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                            >
                                Confirmar Cierre
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION PLAN MODAL */}
            {showActionModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-indigo-600" />
                                Crear Plan de Intervención
                            </h3>
                            <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-rose-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                {actionTarget?.id === 'GROUP' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-xs text-indigo-400 uppercase font-bold">Objetivo</p>
                                <p className="text-sm font-bold text-indigo-900">{actionTarget?.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Acción</label>
                                <select
                                    value={actionType}
                                    onChange={(e) => setActionType(e.target.value as ActionType)}
                                    className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium focus:ring-indigo-500"
                                >
                                    <option>Refuerzo Académico</option>
                                    <option>Citación Representante</option>
                                    <option>Remisión Psicología</option>
                                    <option>Remisión a Psicopedagogía</option>
                                    <option>Adaptación Curricular</option>
                                    <option>Dinámica Grupal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridad</label>
                                <div className="flex gap-2">
                                    {['Baja', 'Media', 'Alta'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setActionPriority(p as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${actionPriority === p
                                                ? p === 'Alta' ? 'bg-rose-100 text-rose-700 border-rose-200' : p === 'Media' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-white text-slate-400 border-slate-200'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción de la Estrategia</label>
                                <textarea
                                    className="w-full text-sm border-slate-200 rounded-lg p-3 bg-white h-24 focus:ring-indigo-500"
                                    placeholder="Describa las acciones concretas a realizar..."
                                    value={actionDescription}
                                    onChange={(e) => setActionDescription(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleCreateAction}
                                disabled={!actionDescription}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                            >
                                Registrar Acción
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Top Bar: Filters & Actions */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-20 flex flex-col xl:flex-row justify-between items-center gap-4 shrink-0 h-auto xl:h-20">
                {/* ... (Existing top bar content preserved) ... */}
                <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 text-indigo-900 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                        <PieIcon className="w-5 h-5" />
                        <span className="font-bold text-sm whitespace-nowrap">Reporte Pedagógico</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>

                    <div className="flex gap-2 items-center">
                        <div className="flex items-center bg-transparent border-r border-slate-200 pr-4 mr-2">
                            <select
                                value={context.year}
                                onChange={(e) => setContext({ ...context, year: e.target.value })}
                                className="bg-transparent font-bold text-slate-700 border-none focus:ring-0 cursor-pointer text-lg p-0 pr-2"
                            >
                                {schoolYears.map(y => (
                                    <option key={y.id} value={y.name}>{y.name}</option>
                                ))}
                            </select>
                            <span className="text-slate-300 mx-1">/</span>
                            <select
                                value={context.lapse}
                                onChange={(e) => setContext({ ...context, lapse: e.target.value })}
                                className="bg-transparent font-bold text-slate-700 border-none focus:ring-0 cursor-pointer text-lg p-0"
                            >
                                <option value="I Lapso">I Lapso</option>
                                <option value="II Lapso">II Lapso</option>
                                <option value="III Lapso">III Lapso</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                            <select
                                value={context.grade}
                                onChange={(e) => setContext({ ...context, grade: e.target.value })}
                                className="bg-white border-0 text-sm font-medium rounded shadow-sm py-1.5 pl-3 pr-8 focus:ring-0 text-slate-700"
                            >
                                <option value="1er Grado">1er Grado</option>
                                <option value="2do Grado">2do Grado</option>
                                <option value="3er Grado">3er Grado</option>
                                <option value="4to Grado">4to Grado</option>
                                <option value="5to Grado">5to Grado</option>
                                <option value="6to Grado">6to Grado</option>
                            </select>
                            <select
                                value={context.subject}
                                onChange={(e) => setContext({ ...context, subject: e.target.value })}
                                className="bg-white border-0 text-sm font-medium rounded shadow-sm py-1.5 pl-3 pr-8 focus:ring-0 text-slate-700"
                            >
                                <option value="Lenguaje">Lenguaje</option>
                                <option value="Matemáticas">Matemáticas</option>
                                <option value="Inglés">Inglés</option>
                            </select>
                            <select
                                value={context.term}
                                onChange={(e) => setContext({ ...context, term: e.target.value as AssessmentTerm })}
                                className="bg-indigo-600 border-0 text-sm font-medium rounded shadow-sm py-1.5 pl-3 pr-8 focus:ring-0 text-white"
                            >
                                {Object.values(AssessmentTerm).map(t => (
                                    <option key={t} value={t} className="bg-white text-slate-700">{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full xl:w-auto justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartir Reporte</span>
                    </button>
                    <button
                        onClick={handleAnalysis}
                        disabled={analyzing || records.length === 0}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md disabled:opacity-70 whitespace-nowrap"
                    >
                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                        Generar Insights IA
                    </button>
                </div>
            </div>

            {/* 2. Main Workspace (Split View) */}
            <div className="flex-1 overflow-hidden p-6">
                <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Left Column: Student Matrix (Larger Area) */}
                    <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Registro de Evaluación</h3>
                                <p className="text-slate-400 text-sm">Vista detallada por estudiante e indicador</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                                    {records.length} Estudiantes
                                </span>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {records.length > 0 ? (
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Estudiante</th>
                                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nivel de Logro</th>
                                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Observación Docente</th>
                                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {records.map((r, i) => (
                                            <tr key={i} className="hover:bg-indigo-50/30 group transition-colors">
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-700 text-base">{r.studentName}</div>
                                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                        ID: {r.studentId.substring(0, 6)}...
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow-sm ring-2 ring-white ${getBadgeColor(r.grade)}`}>
                                                            {r.grade}
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.challengeLevel === ChallengeLevel.AC_PLUS
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : r.challengeLevel === ChallengeLevel.AC_MINUS
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                                            }`}>
                                                            {r.challengeLevel === ChallengeLevel.NORMAL ? 'Regular' : r.challengeLevel}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-5 align-middle">
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                                        {r.teacherObservation || <span className="text-slate-400 italic">Sin observación registrada.</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openActionModal(r.studentId, r.studentName || 'Estudiante')}
                                                            className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                                            title="Crear Plan de Acción"
                                                        >
                                                            <ClipboardList className="w-5 h-5" />
                                                        </button>
                                                        {(!r.indicatorId || r.competencies?.description === 'Evaluación General (Sin Competencia Asignada)' || !r.competencies) && (
                                                            <button
                                                                onClick={() => openAssignModal(r.id)}
                                                                className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                                                title="Asignar Competencia"
                                                            >
                                                                <Target className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setViewingStudentId(r.studentId)}
                                                            className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                                            title="Ver Historial Pedagógico"
                                                        >
                                                            <FileText className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('¿Estás seguro de que deseas eliminar esta evaluación?')) {
                                                                    const success = await appStore.deleteEvaluationRecord(r.id);
                                                                    if (success) {
                                                                        setRecords(prev => prev.filter(rec => rec.id !== r.id));
                                                                    } else {
                                                                        alert('Error al eliminar la evaluación');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-slate-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Eliminar Evaluación"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                                <Filter className="w-16 h-16 mb-4 opacity-10" />
                                <h4 className="text-lg font-bold text-slate-600">Sin registros encontrados</h4>
                                <p className="max-w-xs mt-2">No hay evaluaciones cargadas para este mensual y materia. Intenta cambiar los filtros superiores.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Analytics & Insights (Scrollable Side Panel) */}
                    <div className="xl:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1">

                        {/* Action Tracking Panel */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 shrink-0 order-first">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                    Bitácora de Intervención
                                </h4>
                                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                    {actionPlans.filter(p => p.status === 'Pendiente' || p.status === 'En Progreso').length} Activos
                                </span>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {actionPlans.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No hay planes activos.</p>}

                                {actionPlans.map(plan => (
                                    <div key={plan.id} className={`p-3 rounded-xl border transition-all ${plan.status === 'Exitosa' || plan.status === 'Sin Éxito' ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-2 h-2 rounded-full ${plan.priority === 'Alta' ? 'bg-rose-500' : plan.priority === 'Media' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{plan.type}</span>
                                                </div>
                                                <p className="text-sm font-bold leading-tight mb-1 text-slate-700">
                                                    {plan.targetName}
                                                </p>
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{plan.description}</p>

                                                {/* Status Selector - Updated to use initUpdateStatus */}
                                                <select
                                                    value={plan.status}
                                                    onChange={(e) => initUpdateStatus(plan.id, e.target.value)}
                                                    className={`text-[10px] font-bold border rounded px-2 py-1 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500 ${getStatusColor(plan.status)}`}
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="En Progreso">En Progreso</option>
                                                    <option value="Exitosa">Exitosa</option>
                                                    <option value="Sin Éxito">Sin Éxito</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {plan.createdAt}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Intervention Impact Metrics (Big Data) */}
                        <div className="bg-slate-900 rounded-2xl shadow-xl p-5 shrink-0 relative overflow-hidden text-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target className="w-24 h-24" />
                            </div>
                            <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Eficacia Global
                            </h4>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-24 h-24 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={interventionStats.distribution}
                                                innerRadius={25}
                                                outerRadius={40}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {interventionStats.distribution.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="font-bold text-lg">{interventionStats.total}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Tasa de Éxito</p>
                                        <p className="text-3xl font-bold text-emerald-400">{interventionStats.successRate}%</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 max-w-[120px]">Promedio general de todas las intervenciones.</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Grade Analysis */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 shrink-0">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                                Análisis de Rendimiento
                            </h4>

                            <div className="space-y-6">
                                <GradeChart title="General (Todo el Salón)" data={gradeDist} count={records.length} />
                                <div className="h-px bg-slate-100" />
                                <GradeChart title="Estudiantes Regulares" data={getGradesByAdaptationLevel(records, ChallengeLevel.NORMAL)} count={records.filter(r => r.challengeLevel === ChallengeLevel.NORMAL).length} />
                                <div className="h-px bg-slate-100" />
                                <GradeChart title="Adaptación Curricular (+)" data={getGradesByAdaptationLevel(records, ChallengeLevel.AC_PLUS)} count={records.filter(r => r.challengeLevel === ChallengeLevel.AC_PLUS).length} />
                                <div className="h-px bg-slate-100" />
                                <GradeChart title="Adaptación Curricular (-)" data={getGradesByAdaptationLevel(records, ChallengeLevel.AC_MINUS)} count={records.filter(r => r.challengeLevel === ChallengeLevel.AC_MINUS).length} />
                            </div>
                        </div>

                        {/* 2. AI Insights (Conditional) */}
                        {aiResult ? (
                            <div className="bg-indigo-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden shrink-0 animate-in slide-in-from-right-4 duration-500">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Sparkles className="w-32 h-32" />
                                </div>
                                <h4 className="font-bold text-lg flex items-center gap-2 mb-4 relative z-10">
                                    <Sparkles className="w-5 h-5 text-amber-300" />
                                    Análisis Pedagógico
                                </h4>
                                <div className="space-y-4 relative z-10">
                                    {aiResult.clusters.map((cluster, idx) => (
                                        <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-indigo-50 text-sm leading-tight pr-2">{cluster.difficulty}</span>
                                                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white whitespace-nowrap">{cluster.frequency} alum.</span>
                                            </div>
                                            <div className="h-px bg-white/10 w-full my-2"></div>
                                            <p className="text-xs text-indigo-200 leading-relaxed mb-3">
                                                <span className="font-semibold text-indigo-100">Sugerencia:</span> {cluster.suggestedActions}
                                            </p>
                                            <button
                                                onClick={() => openActionModal('GROUP', `Grupo: ${cluster.difficulty.substring(0, 20)}...`, cluster.suggestedActions)}
                                                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <PlusCircle className="w-3 h-3" />
                                                Crear Plan de Acción Grupal
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 text-center shrink-0">
                                <Sparkles className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
                                <h4 className="font-bold text-indigo-900">Inteligencia Artificial</h4>
                                <p className="text-sm text-indigo-600/80 mb-4 mt-1">Descubre patrones ocultos en las observaciones cualitativas.</p>
                                <button onClick={handleAnalysis} disabled={records.length === 0} className="text-xs font-bold bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors w-full">
                                    Analizar Grupo Ahora
                                </button>
                            </div>
                        )}

                        {/* 3. Adaptation Breakdown */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 shrink-0">
                            <h4 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                                Adaptaciones Curriculares
                                <span className="text-xs font-normal text-slate-400">Total: {records.length}</span>
                            </h4>

                            <AdaptationDonut data={adaptationStats} total={records.length} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
