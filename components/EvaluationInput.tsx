
import React, { useState, useEffect } from 'react';
import { QualitativeGrade, ChallengeLevel, AdaptationType, EvaluationRecord, AssessmentTerm, Competency } from '../types';
import { appStore } from '../services/store';
import { calculateEvaluationMetrics } from '../services/calcService';
import { Save, User, CheckCircle2, ChevronRight, BookOpen, Calendar, GraduationCap, ArrowRight, Check, Search, Filter, Layers, CheckSquare } from 'lucide-react';

export default function EvaluationInput() {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // STEP 1: Context
    const [year, setYear] = useState('');
    const [schoolYears, setSchoolYears] = useState<any[]>([]);

    useEffect(() => {
        const fetchYears = async () => {
            const years = await appStore.getSchoolYears();
            setSchoolYears(years);
            const active = years.find(y => y.isActive);
            if (active) setYear(active.name);
            else if (years.length > 0) setYear(years[0].name);
        };
        fetchYears();
    }, []);

    // ... (rest of state)

    // ... (inside render)

    const [lapse, setLapse] = useState('I Lapso');
    const [grade, setGrade] = useState('1er Grado');
    const [subject, setSubject] = useState('Lenguaje');
    const [term, setTerm] = useState<AssessmentTerm>(AssessmentTerm.MONTH_1);

    // STEP 2: Competency (Multi-selection)
    const [availableCompetencies, setAvailableCompetencies] = useState<Competency[]>([]);
    const [selectedCompetencies, setSelectedCompetencies] = useState<Competency[]>([]);
    const [activeCompIndex, setActiveCompIndex] = useState(0); // To toggle between selected competencies in Step 3

    // STEP 3: Grading
    const [students, setStudents] = useState<any[]>([]);

    // Fetch students on mount
    useEffect(() => {
        const fetchStudents = async () => {
            const s = await appStore.getStudents();
            setStudents(s);
        };
        fetchStudents();
    }, []);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State for current student
    const [gradeInput, setGradeInput] = useState<QualitativeGrade | null>(null);
    const [levelInput, setLevelInput] = useState<ChallengeLevel>(ChallengeLevel.NORMAL);
    const [observationInput, setObservationInput] = useState('');
    const [savedRecords, setSavedRecords] = useState<string[]>([]); // Array of Student IDs that have been graded
    const [justSaved, setJustSaved] = useState(false);

    // Computed for Step 3
    const activeCompetency = selectedCompetencies[activeCompIndex];

    // --- Helpers ---

    const translateType = (type: string) => {
        const map: Record<string, string> = {
            'Concept': 'Conceptual',
            'Procedural': 'Procedimental',
            'Attitude': 'Actitudinal',
            'Cognitive': 'Cognitivo',
            'Attitudinal': 'Actitudinal'
        };
        return map[type] || type;
    };

    const getTypeColor = (type: string) => {
        const t = translateType(type);
        if (t === 'Conceptual' || t === 'Cognitivo') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (t === 'Procedimental') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        return 'bg-purple-100 text-purple-700 border-purple-200';
    };

    const getGradeColorClasses = (g: QualitativeGrade, isSelected: boolean) => {
        if (!isSelected) return 'bg-slate-50 text-slate-500 hover:bg-white hover:shadow-md hover:scale-105 border border-transparent hover:border-slate-100';

        // Selected States
        switch (g) {
            case QualitativeGrade.A: return 'bg-green-500 text-white shadow-xl ring-4 ring-green-100 scale-105';
            case QualitativeGrade.B: return 'bg-sky-400 text-white shadow-xl ring-4 ring-sky-100 scale-105';
            case QualitativeGrade.C: return 'bg-orange-500 text-white shadow-xl ring-4 ring-orange-100 scale-105';
            case QualitativeGrade.D: return 'bg-red-500 text-white shadow-xl ring-4 ring-red-100 scale-105';
            case QualitativeGrade.E: return 'bg-slate-300 text-slate-700 shadow-xl ring-4 ring-slate-100 scale-105';
            case QualitativeGrade.SE: return 'bg-slate-600 text-white shadow-xl ring-4 ring-slate-200 scale-105';
            default: return 'bg-indigo-600 text-white';
        }
    };

    // --- Handlers ---

    const handleContextSubmit = async () => {
        const comps = await appStore.getCompetencies(grade, subject);
        setAvailableCompetencies(comps);
        setSelectedCompetencies([]); // Reset selections on context change
        setStep(2);
    };

    const toggleCompetency = (comp: Competency) => {
        if (selectedCompetencies.find(c => c.id === comp.id)) {
            setSelectedCompetencies(selectedCompetencies.filter(c => c.id !== comp.id));
        } else {
            setSelectedCompetencies([...selectedCompetencies, comp]);
        }
    };

    const handleConfirmCompetencies = () => {
        if (selectedCompetencies.length === 0) return;
        setActiveCompIndex(0);
        setStep(3);
        if (students.length > 0 && !selectedStudentId) setSelectedStudentId(students[0].id);
    };

    const handleSaveStudent = async () => {
        if (!gradeInput || !selectedStudentId || !activeCompetency) return;

        const student = students.find(s => s.id === selectedStudentId);
        const metrics = calculateEvaluationMetrics(gradeInput, levelInput);

        const record: EvaluationRecord = {
            id: crypto.randomUUID(),
            studentId: selectedStudentId,
            studentName: student?.name,
            indicatorId: activeCompetency.id,
            month: term,
            grade: gradeInput,
            challengeLevel: levelInput,
            adaptationType: AdaptationType.NONE,
            teacherObservation: observationInput,
            ...metrics,
            timestamp: new Date().toISOString()
        };

        await appStore.addRecord(record);

        setSavedRecords([...savedRecords, selectedStudentId]);
        setJustSaved(true);

        setGradeInput(null);
        setLevelInput(ChallengeLevel.NORMAL);
        setObservationInput('');

        // Advance Logic
        const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const currentIndex = filteredStudents.findIndex(s => s.id === selectedStudentId);

        if (currentIndex < filteredStudents.length - 1) {
            setTimeout(() => {
                setJustSaved(false);
                setSelectedStudentId(filteredStudents[currentIndex + 1].id);
            }, 600);
        } else {
            setTimeout(() => setJustSaved(false), 1500);
        }
    };

    const getProgress = () => {
        return Math.round((savedRecords.length / students.length) * 100);
    };

    const getFilteredStudents = () => {
        return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // --- RENDERERS ---

    if (step === 1) {
        return (
            <div className="h-full flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-4xl">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                        <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">Configurar Evaluación</h2>
                            <p className="text-slate-500 text-lg">Paso 1: Define el contexto académico</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Row 1: Year and Lapse */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Año Escolar</label>
                                <select
                                    value={year} onChange={(e) => setYear(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                >
                                    {schoolYears.length > 0 ? (
                                        schoolYears.map(y => (
                                            <option key={y.id} value={y.name}>{y.name}</option>
                                        ))
                                    ) : (
                                        <option>Cargando...</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Lapso</label>
                                <select
                                    value={lapse} onChange={(e) => setLapse(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                >
                                    <option value="I Lapso">I Lapso</option>
                                    <option value="II Lapso">II Lapso</option>
                                    <option value="III Lapso">III Lapso</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Grade and Term */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Grado / Curso</label>
                                <select
                                    value={grade} onChange={(e) => setGrade(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                >
                                    <option value="1er Grado">1er Grado</option>
                                    <option value="2do Grado">2do Grado</option>
                                    <option value="3er Grado">3er Grado</option>
                                    <option value="4to Grado">4to Grado</option>
                                    <option value="5to Grado">5to Grado</option>
                                    <option value="6to Grado">6to Grado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Momento de Evaluación</label>
                                <select
                                    value={term} onChange={(e) => setTerm(e.target.value as AssessmentTerm)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                >
                                    {Object.values(AssessmentTerm).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Subject */}
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-3">Materia</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['Lenguaje', 'Matemáticas', 'Inglés'].map(subj => (
                                    <button
                                        key={subj}
                                        onClick={() => setSubject(subj)}
                                        className={`py-4 rounded-xl border-2 font-bold text-lg transition-all ${subject === subj ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform -translate-y-1' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
                                    >
                                        {subj}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleContextSubmit}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1"
                        >
                            Continuar
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 2) {
        return (
            <div className="h-full flex flex-col pt-6 px-6 animate-in fade-in slide-in-from-right-4">
                <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-indigo-600 text-sm font-bold flex items-center gap-1 w-fit">
                            ← Volver al Contexto
                        </button>
                        {selectedCompetencies.length > 0 && (
                            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm border border-indigo-100 animate-in fade-in">
                                {selectedCompetencies.length} seleccionada{selectedCompetencies.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">Seleccionar Competencias</h2>
                                <p className="text-slate-500 text-lg">{grade} • {subject} • {lapse} - {term}</p>
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm mb-4">Seleccione una o varias competencias para incluir en esta sesión de evaluación.</p>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {availableCompetencies.length > 0 ? availableCompetencies.map(comp => {
                                const isSelected = selectedCompetencies.some(c => c.id === comp.id);
                                return (
                                    <button
                                        key={comp.id}
                                        onClick={() => toggleCompetency(comp)}
                                        className={`w-full text-left p-6 rounded-xl border transition-all group shadow-sm flex items-start gap-4 relative
                                        ${isSelected
                                                ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-200'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                                        ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`font-bold text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {comp.description}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-lg border ${getTypeColor(comp.type)}`}>
                                                    {translateType(comp.type)}
                                                </span>
                                                <span className="text-xs text-slate-400">ID: {comp.id}</span>
                                            </div>
                                        </div>
                                    </button>
                                )
                            }) : (
                                <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                    <p className="text-lg">No se encontraron competencias cargadas para este criterio.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleConfirmCompetencies}
                                disabled={selectedCompetencies.length === 0}
                                className="bg-indigo-600 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 disabled:shadow-none disabled:transform-none"
                            >
                                Comenzar Evaluación
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // STEP 3: Grading Interface - EXPANDED LAYOUT
    return (
        <div className="fixed inset-0 top-0 left-0 lg:left-64 bg-slate-50 flex flex-col z-10 animate-in fade-in duration-300">

            {/* 1. Header Bar (Compact with Tabs) */}
            <div className="bg-white border-b border-slate-200 shadow-sm z-20 flex flex-col shrink-0">
                <div className="px-6 py-2 flex justify-between items-center h-14">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <div className="border-l border-slate-200 pl-4 hidden md:block">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>{grade}</span> • <span>{subject}</span> • <span className="text-indigo-600">{term}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Progreso del Grupo</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-lg font-bold text-indigo-600">{getProgress()}%</span>
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${getProgress()}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Competency Tabs */}
                {selectedCompetencies.length > 0 && (
                    <div className="px-6 flex gap-1 overflow-x-auto scrollbar-hide bg-slate-50 border-t border-slate-100">
                        {selectedCompetencies.map((comp, idx) => (
                            <button
                                key={comp.id}
                                onClick={() => setActiveCompIndex(idx)}
                                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap max-w-xs truncate
                            ${idx === activeCompIndex
                                        ? 'border-indigo-600 text-indigo-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                {idx + 1}. {comp.description}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                {/* 2. Left Sidebar: Student List (Expanded) */}
                <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar estudiante..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-sm pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3 px-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">{getFilteredStudents().length} Estudiantes</span>
                            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Filtrar
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {getFilteredStudents().map(s => {
                            const isGraded = savedRecords.includes(s.id);
                            const isSelected = selectedStudentId === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStudentId(s.id)}
                                    className={`w-full text-left px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-all flex items-center justify-between relative group
                            ${isSelected ? 'bg-indigo-50/60' : ''}
                        `}
                                >
                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-md'}`}>
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{s.name.split(',')[0]}</p>
                                            <p className="text-xs text-slate-400">{s.name.split(',')[1]}</p>
                                        </div>
                                    </div>
                                    {isGraded && (
                                        <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 3. Main Work Area (Split Layout) */}
                <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">

                    {/* Success Overlay */}
                    {justSaved && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
                            <div className="bg-emerald-500 p-6 rounded-full mb-6 shadow-2xl shadow-emerald-200 transform scale-110">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">¡Calificación Guardada!</h2>
                        </div>
                    )}

                    {selectedStudentId ? (
                        <div className="flex flex-col h-full">

                            {/* Student Header */}
                            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-5 shrink-0">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl shadow-inner">
                                    {students.find(s => s.id === selectedStudentId)?.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{students.find(s => s.id === selectedStudentId)?.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wide">Activo</span>
                                        <span className="text-slate-400 text-sm">•</span>
                                        <span className="text-slate-500 text-sm">Evaluando: <span className="text-indigo-600 font-bold">{translateType(activeCompetency?.type || '')}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Form Area */}
                            <div className="flex-1 overflow-y-auto p-6 xl:p-8">
                                <div className="max-w-7xl mx-auto h-full grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">

                                    {/* Column 1: Controls (Matrix) */}
                                    <div className="flex flex-col gap-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
                                            <div className="flex justify-between items-center mb-5">
                                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">1</span>
                                                    Nivel de Logro
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4">
                                                {Object.values(QualitativeGrade).map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => setGradeInput(g)}
                                                        className={`aspect-square rounded-2xl font-bold text-2xl flex flex-col items-center justify-center transition-all duration-200 
                                                    ${getGradeColorClasses(g, gradeInput === g)}
                                                `}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-5">
                                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">2</span>
                                                Tipo de Adaptación
                                            </label>
                                            <div className="flex gap-4">
                                                {Object.values(ChallengeLevel).map(l => (
                                                    <button
                                                        key={l}
                                                        onClick={() => setLevelInput(l)}
                                                        className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold transition-all ${levelInput === l
                                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                                            }`}
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Observation (Full Height) */}
                                    <div className="flex flex-col h-full min-h-[300px]">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">3</span>
                                                Observación Pedagógica
                                            </label>
                                            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-3 text-sm text-indigo-800 italic">
                                                "{activeCompetency?.description}"
                                            </div>
                                            <textarea
                                                value={observationInput}
                                                onChange={(e) => setObservationInput(e.target.value)}
                                                placeholder="Ingrese detalles cualitativos del desempeño. El análisis de IA procesará este texto..."
                                                className="w-full flex-1 bg-slate-50 border-0 rounded-xl p-5 focus:ring-2 focus:ring-indigo-500 text-slate-700 resize-none text-base leading-relaxed"
                                            ></textarea>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Sticky Footer Action Bar */}
                            <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 flex justify-end shrink-0">
                                <div className="max-w-7xl w-full mx-auto flex justify-end gap-4">
                                    <div className="mr-auto hidden lg:flex items-center gap-4 text-sm text-slate-500">
                                        <span>Nota: <strong>{gradeInput || '-'}</strong></span>
                                        <span>Adaptación: <strong>{levelInput}</strong></span>
                                    </div>
                                    <button
                                        onClick={handleSaveStudent}
                                        disabled={!gradeInput}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 transform active:scale-95"
                                    >
                                        <Save className="w-5 h-5" />
                                        Guardar y Siguiente
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                <User className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">Comienza a evaluar</h3>
                            <p className="max-w-xs text-center">Selecciona un estudiante de la lista izquierda para desplegar la matriz de evaluación.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
