
import { EvaluationRecord, QualitativeGrade, ChallengeLevel } from '../types';

export const getGradeDistribution = (records: EvaluationRecord[]) => {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, SE: 0 };
  
  records.forEach(r => {
    if (r.grade === QualitativeGrade.A) counts.A++;
    else if (r.grade === QualitativeGrade.B) counts.B++;
    else if (r.grade === QualitativeGrade.C) counts.C++;
    else if (r.grade === QualitativeGrade.D) counts.D++;
    else if (r.grade === QualitativeGrade.E) counts.E++;
    else if (r.grade === QualitativeGrade.SE) counts.SE++;
  });

  // Only return categories that have values > 0 to clean up charts, or keep all for consistency
  return [
    { name: 'A', count: counts.A, fill: '#22c55e' }, // Verde (Green-500)
    { name: 'B', count: counts.B, fill: '#38bdf8' }, // Azul Claro (Sky-400)
    { name: 'C', count: counts.C, fill: '#f97316' }, // Naranja (Orange-500)
    { name: 'D', count: counts.D, fill: '#ef4444' }, // Rojo (Red-500)
    { name: 'E', count: counts.E, fill: '#cbd5e1' }, // Gris Claro (Slate-300)
    { name: 'SE', count: counts.SE, fill: '#475569' }, // Gris Oscuro (Slate-600)
  ];
};

export const getAdaptationStats = (records: EvaluationRecord[]) => {
  const total = records.length;
  const normal = records.filter(r => r.challengeLevel === ChallengeLevel.NORMAL).length;
  const acPlus = records.filter(r => r.challengeLevel === ChallengeLevel.AC_PLUS).length;
  const acMinus = records.filter(r => r.challengeLevel === ChallengeLevel.AC_MINUS).length;

  return [
    { name: 'Reg', value: normal, fill: '#3b82f6' }, // Blue
    { name: 'AC+', value: acPlus, fill: '#6366f1' }, // Indigo
    { name: 'AC-', value: acMinus, fill: '#a855f7' }, // Purple
  ].filter(item => item.value > 0);
};

export const getGradesByAdaptationLevel = (records: EvaluationRecord[], level: ChallengeLevel) => {
    const filtered = records.filter(r => r.challengeLevel === level);
    return getGradeDistribution(filtered);
}

export const getGlobalPercentage = (records: EvaluationRecord[]) => {
    const dist = getGradeDistribution(records);
    const total = records.length;
    return dist.filter(d => d.count > 0).map(d => ({
        name: d.name,
        value: d.count,
        percentage: ((d.count / total) * 100).toFixed(1),
        fill: d.fill
    }));
};

// Existing exports (stubs to prevent breakage if used elsewhere)
export const getNumericGrade = () => 0;
export const getAdaptationFactor = () => 1;
export const calculateEvaluationMetrics = (grade: QualitativeGrade, level: ChallengeLevel) => {
    let internalValue = 0;
    // Updated Logic: A=5, B=4, C=3, D=2, E=1, SE=0
    switch (grade) {
        case QualitativeGrade.A: internalValue = 5; break;
        case QualitativeGrade.B: internalValue = 4; break;
        case QualitativeGrade.C: internalValue = 3; break;
        case QualitativeGrade.D: internalValue = 2; break;
        case QualitativeGrade.E: internalValue = 1; break;
        case QualitativeGrade.SE: internalValue = 0; break;
        default: internalValue = 0;
    }

    let adaptationFactor = 1;
    switch (level) {
        case ChallengeLevel.AC_PLUS: adaptationFactor = 1.2; break;
        case ChallengeLevel.AC_MINUS: adaptationFactor = 0.8; break;
        default: adaptationFactor = 1;
    }

    return { 
        internalValue, 
        adaptationFactor, 
        finalScore: internalValue * adaptationFactor
    };
};
export const detectRisks = () => [];
export const getRadarData = () => [];
export const getSubjectHealth = () => [];
export const getImprovementGroups = () => [];
