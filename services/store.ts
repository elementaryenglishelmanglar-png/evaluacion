
import { EvaluationRecord, Student, Indicator, QualitativeGrade, ChallengeLevel, AdaptationType, Competency, ActionPlan, ActionStatus, SchoolYear, User } from '../types';

// Simulated Database State - INICIALIZADO EN BLANCO
class Store {
  private records: EvaluationRecord[] = [];
  private competencies: Competency[] = [];
  private indicators: Indicator[] = [];
  private actionPlans: ActionPlan[] = [];

  // Años Escolares (Vacío, para configurar en Ajustes)
  private schoolYears: SchoolYear[] = [];

  // USUARIO ADMIN POR DEFECTO (Necesario para el primer Login)
  private users: User[] = [
      { id: 'u1', username: 'admin', fullName: 'Administrador Principal', role: 'Admin', email: 'admin@manglar.edu.ve' },
  ];

  private currentUser: User | null = null; // Session State

  // Matrícula de Estudiantes (Vacía)
  private students: Student[] = [];

  // --- AUTHENTICATION ---
  login(username: string, password: string):User | null {
      // Validate credentials. Default password for everyone is "123456" for this prototype.
      const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (user && password === '123456') {
          this.currentUser = user;
          return user;
      }
      return null;
  }

  logout() {
      this.currentUser = null;
  }

  getCurrentUser() {
      return this.currentUser;
  }

  // --- SYSTEM MANAGEMENT ---
  getSchoolYears() {
      return this.schoolYears;
  }

  addSchoolYear(year: SchoolYear) {
      // If setting as active, deactivate others
      if(year.isActive) {
          this.schoolYears.forEach(y => y.isActive = false);
      }
      this.schoolYears = [year, ...this.schoolYears];
  }

  getUsers() {
      return this.users;
  }

  addUser(user: User) {
      this.users = [...this.users, user];
  }

  // ... (Rest of existing methods preserved) ...
  getAllRecords() {
    return this.records;
  }

  getRecordsByContext(grade: string, subject: string, term: string) {
    return this.records.filter(record => {
      if (record.month !== term) return false;
      const student = this.students.find(s => s.id === record.studentId);
      if (!student || student.grade !== grade) return false;
      const competency = this.competencies.find(c => c.id === record.indicatorId);
      if (!competency || competency.subject !== subject) return false;
      return true;
    });
  }

  getSimulatedHistoricalData(baseContext: {grade: string, subject: string}, variance: 'worse' | 'better' | 'similar') {
      const baseRecords = this.records; 
      // If no data, return empty
      if(baseRecords.length === 0) return [];

      return baseRecords.map(r => {
          let scoreModifier = 0;
          if (variance === 'worse') scoreModifier = -1.5;
          if (variance === 'better') scoreModifier = 0.8;
          if (variance === 'similar') scoreModifier = (Math.random() - 0.5);

          let newScore = Math.max(0, Math.min(6, r.finalScore + scoreModifier));
          let newGrade = QualitativeGrade.E;
          if (newScore > 4.5) newGrade = QualitativeGrade.A;
          else if (newScore > 3.5) newGrade = QualitativeGrade.B;
          else if (newScore > 2.5) newGrade = QualitativeGrade.C;
          else if (newScore > 1.5) newGrade = QualitativeGrade.D;

          return {
              ...r,
              id: `hist-${r.id}`,
              finalScore: newScore,
              grade: newGrade,
              challengeLevel: Math.random() > 0.8 ? ChallengeLevel.AC_MINUS : ChallengeLevel.NORMAL
          };
      });
  }

  getStudents() {
    return this.students;
  }
  
  getStudentsByGrade(grade: string) {
      return this.students.filter(s => s.grade === grade).sort((a,b) => a.lastName.localeCompare(b.lastName));
  }

  getStudentCountsByGrade() {
      const counts: Record<string, number> = {
          '1er Grado': 0, '2do Grado': 0, '3er Grado': 0, '4to Grado': 0, '5to Grado': 0, '6to Grado': 0
      };
      this.students.forEach(s => {
          if (counts[s.grade] !== undefined) counts[s.grade]++;
      });
      return counts;
  }
  
  getStudentById(id: string) {
      return this.students.find(s => s.id === id);
  }

  getCompetencies(grade: string, subject: string): Competency[] {
      return this.competencies.filter(c => c.subject === subject && c.gradeLevel === grade);
  }

  getIndicators(competencyId: string): Indicator[] {
      return this.indicators.filter(i => i.competencyId === competencyId);
  }

  getActionPlans(): ActionPlan[] {
      return this.actionPlans;
  }

  getStats() {
    const total = this.records.length;
    const atRisk = this.records.filter(r => 
      [QualitativeGrade.E, QualitativeGrade.SE].includes(r.grade)
    ).length;
    const adapted = this.records.filter(r => r.challengeLevel !== ChallengeLevel.NORMAL).length;
    const avg = total > 0 ? (this.records.reduce((acc, curr) => acc + curr.finalScore, 0) / total) : 0;

    return {
      totalEvaluations: total,
      studentsAtRisk: atRisk,
      activeAdaptations: adapted,
      averageScore: avg.toFixed(2)
    };
  }

  getInterventionStats() {
      const total = this.actionPlans.length;
      if (total === 0) return { distribution: [], successRate: 0, total };

      const counts = { 'Pendiente': 0, 'En Progreso': 0, 'Exitosa': 0, 'Sin Éxito': 0 };
      this.actionPlans.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });

      const distribution = [
          { name: 'Exitosa', value: counts['Exitosa'], fill: '#10b981' }, 
          { name: 'Sin Éxito', value: counts['Sin Éxito'], fill: '#ef4444' }, 
          { name: 'En Progreso', value: counts['En Progreso'], fill: '#3b82f6' }, 
          { name: 'Pendiente', value: counts['Pendiente'], fill: '#94a3b8' },
      ].filter(d => d.value > 0);

      const closed = counts['Exitosa'] + counts['Sin Éxito'];
      const successRate = closed > 0 ? Math.round((counts['Exitosa'] / closed) * 100) : 0;

      return { distribution, successRate, total };
  }

  getStudentClinicalData(studentId: string) {
      const evals = this.records.filter(r => r.studentId === studentId).map(e => ({ type: 'EVALUATION' as const, date: e.timestamp, data: e }));
      const interventions = this.actionPlans.filter(p => p.targetId === studentId).map(p => ({ type: 'INTERVENTION' as const, date: p.createdAt, data: p }));
      const timeline = [...evals, ...interventions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const closedInterventions = interventions.filter(i => i.data.status === 'Exitosa' || i.data.status === 'Sin Éxito');
      const successful = closedInterventions.filter(i => i.data.status === 'Exitosa').length;
      const efficacyRate = closedInterventions.length > 0 ? Math.round((successful / closedInterventions.length) * 100) : 0;
      
      const recentGrades = evals.slice(0, 3).map(e => e.data.internalValue);
      const riskTrend = recentGrades.length > 0 ? (recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length) < 3 ? 'Alto Riesgo' : 'Estable' : 'Sin Datos';

      return { timeline, stats: { efficacyRate, totalInterventions: interventions.length, riskTrend, lastUpdate: timeline[0]?.date || new Date().toISOString() } };
  }

  getRecentActivity() {
    return [...this.records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }

  addRecord(record: EvaluationRecord) { this.records.push(record); }
  addCompetency(comp: Competency) { this.competencies.push(comp); }
  deleteCompetency(id: string) {
      this.competencies = this.competencies.filter(c => c.id !== id);
      this.indicators = this.indicators.filter(i => i.competencyId !== id);
  }
  addIndicator(ind: Indicator) { this.indicators.push(ind); }
  deleteIndicator(id: string) { this.indicators = this.indicators.filter(i => i.id !== id); }
  addActionPlan(plan: ActionPlan) { this.actionPlans = [plan, ...this.actionPlans]; }
  addStudent(student: Student) { this.students = [...this.students, student]; }
  updateActionPlanStatus(id: string, newStatus: ActionStatus, observation?: string) {
      this.actionPlans = this.actionPlans.map(p => {
          if(p.id === id) {
              return { ...p, status: newStatus, closureObservation: observation, closedAt: (newStatus === 'Exitosa' || newStatus === 'Sin Éxito') ? new Date().toISOString() : undefined };
          }
          return p;
      });
  }
}

export const appStore = new Store();
