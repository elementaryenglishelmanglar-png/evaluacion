
import React, { useState, useEffect } from 'react';
import { QualitativeGrade, ChallengeLevel, AdaptationType, Student, Indicator, EvaluationRecord, TeacherInsight } from '../types';
import { calculateEvaluationMetrics } from '../services/calcService';
import { analyzeObservation } from '../services/geminiService';
import { Loader2, BrainCircuit, AlertTriangle, ChevronRight, Info } from 'lucide-react';

interface EvaluationFormProps {
  students: Student[];
  indicator: Indicator;
  onSave: (record: EvaluationRecord) => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ students, indicator, onSave }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [grade, setGrade] = useState<QualitativeGrade | null>(null);
  const [level, setLevel] = useState<ChallengeLevel>(ChallengeLevel.NORMAL);
  const [adaptationType, setAdaptationType] = useState<AdaptationType>(AdaptationType.NONE);
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<TeacherInsight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Reset form when student changes
  useEffect(() => {
    setGrade(null);
    setLevel(ChallengeLevel.NORMAL);
    setAdaptationType(AdaptationType.NONE);
    setObservation('');
    setError(null);
    setInsight(null);
  }, [selectedStudentId]);

  // Update Adaptation Type default when Level changes
  useEffect(() => {
    if (level === ChallengeLevel.NORMAL) {
      setAdaptationType(AdaptationType.NONE);
    } else if (level === ChallengeLevel.AC_MINUS) {
      setAdaptationType(AdaptationType.CONTENT); // Default to content, but allow change
    } else if (level === ChallengeLevel.AC_PLUS) {
      setAdaptationType(AdaptationType.ENRICHMENT);
    }
  }, [level]);

  const handleAnalysis = async () => {
    if (!observation) return;
    setAnalyzing(true);
    const result = await analyzeObservation(observation);
    setInsight(result);
    setAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!grade) {
      setError('Debes seleccionar una nota cualitativa.');
      return;
    }

    // Validation Logic: Obligatory observation if grade < C (D, E, SE) or level is AC-
    const isLowGrade = [QualitativeGrade.C, QualitativeGrade.D, QualitativeGrade.E, QualitativeGrade.SE].includes(grade);
    const isAdaptedLow = level === ChallengeLevel.AC_MINUS;

    if ((isLowGrade || isAdaptedLow) && observation.length < 5) {
      setError('Para notas bajas o adaptaciones, añade una breve observación.');
      return;
    }

    const metrics = calculateEvaluationMetrics(grade, level);

    const record: EvaluationRecord = {
      id: crypto.randomUUID(),
      studentId: selectedStudentId,
      indicatorId: indicator.id,
      month: new Date().toISOString().slice(0, 7), // current YYYY-MM
      grade,
      challengeLevel: level,
      adaptationType: adaptationType,
      teacherObservation: observation,
      ...metrics,
      timestamp: new Date().toISOString()
    };

    onSave(record);
    // Reset
    setGrade(null); 
    setObservation('');
    setInsight(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto border border-gray-100">
      <div className="mb-6 border-b pb-4">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg text-sm">Evaluación por Competencias</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Indicador: <span className="font-semibold text-gray-800">{indicator.description}</span></p>
            </div>
            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded text-xs font-semibold">
                {indicator.competencyType}
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Selector */}
        <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                {students.find(s => s.id === selectedStudentId)?.name.charAt(0)}
            </div>
            <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estudiante</label>
                <select 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-lg font-medium border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-600 bg-transparent py-2"
                >
                    {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.grade}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* The Matrix UI - Decomposed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. Grade Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                1. Nivel de Logro
                <Info className="w-4 h-4 text-gray-400" />
            </label>
            <div className="grid grid-cols-4 gap-3">
              {Object.values(QualitativeGrade).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`py-3 text-lg font-bold rounded-lg border-2 transition-all ${
                    grade === g 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform -translate-y-1' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">A (Excelencia) - SE (Sin Evidencia)</p>
          </div>

          {/* 2. Challenge & Adaptation */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">2. Tipo de Adaptación</label>
            
            {/* Main Level */}
            <div className="flex gap-2 mb-4">
              {Object.values(ChallengeLevel).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    level === l 
                      ? 'bg-white shadow text-indigo-700 ring-2 ring-indigo-500' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Adaptation Details (If not normal) */}
            {level !== ChallengeLevel.NORMAL && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Tipo de Ajuste</label>
                    <div className="space-y-2">
                        {[AdaptationType.CONTENT, AdaptationType.FORM, AdaptationType.ENRICHMENT].map(type => {
                             // Only show relevant types
                             if (level === ChallengeLevel.AC_MINUS && type === AdaptationType.ENRICHMENT) return null;
                             if (level === ChallengeLevel.AC_PLUS && type !== AdaptationType.ENRICHMENT) return null;

                             return (
                                <label key={type} className={`flex items-center gap-3 p-2 rounded cursor-pointer border ${adaptationType === type ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent'}`}>
                                    <input 
                                        type="radio" 
                                        name="adaptType" 
                                        checked={adaptationType === type} 
                                        onChange={() => setAdaptationType(type)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">{type}</span>
                                </label>
                             );
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Dynamic Score Preview */}
        {grade && (
           <div className="bg-indigo-900 text-white p-4 rounded-lg flex justify-between items-center shadow-inner">
             <div className="flex flex-col">
                <span className="text-indigo-200 text-xs uppercase tracking-wider">Índice de Logro Real</span>
                <span className="text-2xl font-bold">{calculateEvaluationMetrics(grade, level).finalScore.toFixed(2)} <span className="text-sm font-normal text-indigo-300">/ 6.00</span></span>
             </div>
             <ChevronRight className="w-6 h-6 text-indigo-400" />
           </div>
        )}

        {/* Observation & NLP */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             3. Narrativa (Contexto Pedagógico)
             <span className="text-red-500 ml-1">
               {([QualitativeGrade.C, QualitativeGrade.D, QualitativeGrade.E, QualitativeGrade.SE].includes(grade!) || level === ChallengeLevel.AC_MINUS) ? '*' : ''}
             </span>
           </label>
           <div className="relative">
             <textarea
               value={observation}
               onChange={(e) => setObservation(e.target.value)}
               rows={2}
               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
               placeholder={level === ChallengeLevel.AC_MINUS ? "Justifique la adaptación: ¿Fue reducción de temas o aumento de tiempo?" : "Describa brevemente el desempeño..."}
             />
             <button
                type="button"
                onClick={handleAnalysis}
                disabled={!observation || analyzing}
                className="absolute bottom-2 right-2 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
             >
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                Analizar
             </button>
           </div>
           
           {/* Insight Display */}
           {insight && (
             <div className="mt-3 bg-white p-3 rounded-md border-l-4 border-purple-500 shadow-sm text-sm">
                <p className="font-semibold text-gray-900">Análisis IA:</p>
                <p className="text-gray-600">{insight.sentiment} - {insight.summary}</p>
             </div>
           )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg flex justify-center items-center gap-2"
        >
          Guardar Evaluación
        </button>
      </form>
    </div>
  );
};

export default EvaluationForm;
