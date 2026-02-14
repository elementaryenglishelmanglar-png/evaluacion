
import React from 'react';
import { appStore } from '../services/store';
import { QualitativeGrade, EvaluationRecord, ActionPlan, ActionStatus } from '../types';
import { X, Activity, ClipboardList, TrendingUp, AlertTriangle, Calendar, FileText, CheckCircle2, XCircle, Clock, User, Target } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StudentHistoryProps {
    studentId: string;
    onClose: () => void;
}

export default function StudentHistory({ studentId, onClose }: StudentHistoryProps) {
    const student = appStore.getStudentById(studentId);
    const clinicalData = appStore.getStudentClinicalData(studentId);
    
    // Safety check
    if (!student) return null;

    const getGradeColor = (grade: QualitativeGrade) => {
        switch (grade) {
          case QualitativeGrade.A: return 'bg-green-100 text-green-700 border-green-200';
          case QualitativeGrade.B: return 'bg-sky-100 text-sky-700 border-sky-200';
          case QualitativeGrade.C: return 'bg-orange-100 text-orange-700 border-orange-200';
          case QualitativeGrade.D: return 'bg-red-100 text-red-700 border-red-200';
          case QualitativeGrade.E: return 'bg-slate-200 text-slate-600 border-slate-300';
          case QualitativeGrade.SE: return 'bg-slate-700 text-white border-slate-600';
          default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getActionColor = (status: ActionStatus) => {
        switch(status) {
            case 'Exitosa': return 'border-l-4 border-l-emerald-500 bg-emerald-50/50';
            case 'Sin Éxito': return 'border-l-4 border-l-rose-500 bg-rose-50/50';
            default: return 'border-l-4 border-l-blue-500 bg-blue-50/50';
        }
    };

    // Data for Efficacy Donut
    const efficacyData = [
        { name: 'Eficacia', value: clinicalData.stats.efficacyRate, fill: '#10b981' },
        { name: 'Resto', value: 100 - clinicalData.stats.efficacyRate, fill: '#e2e8f0' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end animate-in slide-in-from-right duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}></div>

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-4xl bg-slate-50 h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
                
                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-100 border-2 border-indigo-50 flex items-center justify-center text-3xl font-bold text-indigo-700 shadow-inner">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wide border border-slate-200">
                                    ID: {student.id.substring(0,8)}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100">
                                    {student.grade}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* LEFT PANEL: VITAL SIGNS (Individual Metrics) */}
                    <div className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
                        
                        {/* 1. Risk Status */}
                        <div className={`p-4 rounded-xl border ${clinicalData.stats.riskTrend === 'Alto Riesgo' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className={`w-5 h-5 ${clinicalData.stats.riskTrend === 'Alto Riesgo' ? 'text-rose-500' : 'text-emerald-500'}`} />
                                <span className={`font-bold text-sm uppercase ${clinicalData.stats.riskTrend === 'Alto Riesgo' ? 'text-rose-700' : 'text-emerald-700'}`}>
                                    Estado Académico
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${clinicalData.stats.riskTrend === 'Alto Riesgo' ? 'text-rose-800' : 'text-emerald-800'}`}>
                                {clinicalData.stats.riskTrend}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Basado en últimas 3 evaluaciones</p>
                        </div>

                        {/* 2. Intervention Efficacy (The requested feature) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <h4 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-500" />
                                Eficacia de Intervención
                            </h4>
                            <div className="h-40 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={efficacyData} 
                                            innerRadius={40} 
                                            outerRadius={60} 
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value" 
                                            stroke="none"
                                        >
                                            {efficacyData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-800">{clinicalData.stats.efficacyRate}%</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Éxito</span>
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    {clinicalData.stats.totalInterventions} Intervenciones Totales
                                </span>
                            </div>
                        </div>

                        {/* 3. Quick Stats */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Última Actualización</h4>
                            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {new Date(clinicalData.stats.lastUpdate).toLocaleDateString()}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT PANEL: CHRONOLOGICAL TIMELINE */}
                    <div className="flex-1 bg-slate-50 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-slate-400" />
                                Historial Clínico Pedagógico
                            </h3>

                            <div className="relative border-l-2 border-slate-200 pl-8 space-y-8">
                                {clinicalData.timeline.length === 0 && (
                                    <p className="text-slate-400 italic">No hay registros en el historial.</p>
                                )}

                                {clinicalData.timeline.map((event, idx) => {
                                    const isEval = event.type === 'EVALUATION';
                                    const data = event.data;
                                    
                                    return (
                                        <div key={idx} className="relative group">
                                            {/* Timeline Dot */}
                                            <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                                                ${isEval 
                                                    ? 'bg-indigo-500' // Eval dot
                                                    : 'bg-amber-500' // Intervention dot
                                                }`}
                                            ></div>

                                            {/* Date Label */}
                                            <span className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>

                                            {/* Card */}
                                            {isEval ? (
                                                // EVALUATION CARD
                                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span className="text-xs font-bold text-indigo-500 uppercase mb-1 block">Evaluación</span>
                                                            <h4 className="font-bold text-slate-800 text-lg">Lenguaje - I Lapso</h4>
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2 ${getGradeColor((data as EvaluationRecord).grade)}`}>
                                                            {(data as EvaluationRecord).grade}
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                                                        "{(data as EvaluationRecord).teacherObservation}"
                                                    </div>
                                                    {(data as EvaluationRecord).challengeLevel !== 'Normal' && (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Adaptación: {(data as EvaluationRecord).challengeLevel}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // INTERVENTION CARD
                                                <div className={`p-5 rounded-xl border shadow-sm ${getActionColor((data as ActionPlan).status)}`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span className="text-xs font-bold text-amber-600 uppercase mb-1 block flex items-center gap-1">
                                                                <ClipboardList className="w-3 h-3" /> Intervención
                                                            </span>
                                                            <h4 className="font-bold text-slate-800 text-lg">{(data as ActionPlan).type}</h4>
                                                        </div>
                                                        <div className={`px-2 py-1 rounded text-xs font-bold border uppercase
                                                            ${(data as ActionPlan).status === 'Exitosa' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                                              (data as ActionPlan).status === 'Sin Éxito' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                                                              'bg-blue-100 text-blue-700 border-blue-200'
                                                            }
                                                        `}>
                                                            {(data as ActionPlan).status}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-700 mb-3">
                                                        {(data as ActionPlan).description}
                                                    </p>

                                                    {/* NEW: Display Closure Observation */}
                                                    {(data as ActionPlan).closureObservation && (
                                                        <div className={`mt-3 p-3 rounded-lg border text-sm italic relative
                                                            ${(data as ActionPlan).status === 'Exitosa' ? 'bg-emerald-100/50 border-emerald-100 text-emerald-800' : 'bg-rose-100/50 border-rose-100 text-rose-800'}
                                                        `}>
                                                            <span className="not-italic font-bold text-xs uppercase block mb-1 opacity-70">Resolución:</span>
                                                            "{(data as ActionPlan).closureObservation}"
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-200/50 pt-3 mt-3">
                                                        <span className="font-bold">Prioridad: {(data as ActionPlan).priority}</span>
                                                        { (data as ActionPlan).closedAt && (
                                                            <span>Cerrado: {new Date((data as ActionPlan).closedAt!).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
