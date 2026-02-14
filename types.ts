
// 1. MODELO DE DATOS (Arquitectura Relacional / TypeScript Mappings)

export enum QualitativeGrade {
  A = 'A', // 5
  B = 'B', // 4
  C = 'C', // 3
  D = 'D', // 2
  E = 'E', // 1
  SE = 'SE' // 0 (Riesgo de exclusión)
}

export enum ChallengeLevel {
  AC_PLUS = 'AC+', // 1.2
  NORMAL = 'Normal', // 1.0
  AC_MINUS = 'AC-' // 0.8
}

export enum AdaptationType {
  NONE = 'Ninguna',
  CONTENT = 'Contenido', // AC-: Easier topics
  FORM = 'Forma',       // AC-: More time, fewer questions
  ENRICHMENT = 'Superioridad' // AC+: Advanced topics
}

export enum AssessmentTerm {
  MONTH_1 = 'Mensual I',
  MONTH_2 = 'Mensual II',
  MONTH_3 = 'Mensual III',
  EXAM_1 = 'Examen Lapso I',
  EXAM_2 = 'Examen Lapso II',
  EXAM_3 = 'Examen Lapso III'
}

export interface Student {
  id: string;
  firstName: string; // Desglosado
  lastName: string;  // Desglosado
  name: string; // Full name for display convenience
  grade: string; // e.g., "5to Grado A"
  status: 'Active' | 'Withdrawn';
  photoUrl?: string;
  
  // Family Data
  motherName?: string;
  motherPhone?: string;
  fatherName?: string;
  fatherPhone?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Competency {
  id: string;
  subject: string; // "Lenguaje", "Matemáticas"
  gradeLevel: string; // "6to Grado"
  description: string; // "Identifica complementos circunstanciales..."
  type: 'Concept' | 'Procedural' | 'Attitude';
}

export interface Indicator {
  id: string;
  competencyId: string; // Parent FK
  description: string; // Specific observable behavior
  type: 'Cognitive' | 'Procedural' | 'Attitudinal';
}

export interface EvaluationRecord {
  id: string;
  studentId: string;
  studentName?: string; // Denormalized for display convenience
  indicatorId: string; // Linked to Competency ID now (Legacy support or direct link)
  month: string; // Stores the AssessmentTerm or Date
  
  // Matrix Core Data
  grade: QualitativeGrade;
  challengeLevel: ChallengeLevel;
  adaptationType: AdaptationType;
  teacherObservation: string;
  
  // Computed Data
  internalValue: number;    
  adaptationFactor: number; 
  finalScore: number;       
  
  timestamp: string;
}

// AI Analysis Types
export type ProblemCategory = 'Académico' | 'Conductual' | 'Emocional' | 'Asistencia';

export interface AICluster {
  difficulty: string; // "Dificultad en Morfosintaxis..."
  category: ProblemCategory;
  frequency: number;
  students: string[]; // List of student names
  suggestedActions: string; // Action plan
}

export interface ClassAnalysisResult {
  clusters: AICluster[];
  summary: string;
}

export interface TeacherInsight {
  sentiment: string;
  programFlaws: string[];
  summary: string;
}

// ACTION PLANS (New Entity for Intervention Tracking)
export type ActionType = 'Refuerzo Académico' | 'Citación Representante' | 'Remisión Psicología' | 'Remisión a Psicopedagogía' | 'Adaptación Curricular' | 'Dinámica Grupal';
// Updated Statuses for Big Data Tracking
export type ActionStatus = 'Pendiente' | 'En Progreso' | 'Exitosa' | 'Sin Éxito';

export interface ActionPlan {
  id: string;
  targetId: string; // Student ID or 'GROUP'
  targetName: string; // "Grupo General" or Student Name
  type: ActionType;
  description: string;
  status: ActionStatus;
  priority: 'Alta' | 'Media' | 'Baja';
  dueDate?: string;
  createdAt: string;
  closedAt?: string; // For duration metrics
  closureObservation?: string; // New: Notes upon completion (e.g., meeting outcomes)
}

// --- NEW SYSTEM ENTITIES ---

export interface SchoolYear {
  id: string;
  name: string; // "2025-2026"
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

// Only Admin role exists now
export type UserRole = 'Admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  email: string;
  lastLogin?: string;
}

// For UI State
export interface MeetingContextState {
  year: string;
  term: string;
  evaluation: string;
  grade: string;
  subject: string;
}
