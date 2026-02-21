
import { supabase } from './supabase';
import {
    EvaluationRecord,
    Student,
    Indicator,
    QualitativeGrade,
    ChallengeLevel,
    AdaptationType,
    Competency,
    ActionPlan,
    ActionStatus,
    SchoolYear,
    User,
    StudentLog,
    StudentActionType
} from '../types';

/**
 * Supabase Store - Reemplazo del store en memoria
 * Todas las operaciones son asíncronas y se comunican con Supabase
 */
class SupabaseStore {

    // =====================================================
    // AUTENTICACIÓN
    // =====================================================

    async login(email: string, password: string): Promise<User | null> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error('Error en login:', error.message);
                return null;
            }

            if (!data.user) return null;

            // Actualizar last_login
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id);

            // Obtener datos completos del usuario
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (userError || !userData) {
                console.error('Error obteniendo datos de usuario:', userError?.message);
                return null;
            }

            return {
                id: userData.id,
                username: userData.username,
                fullName: userData.full_name,
                role: userData.role,
                avatarUrl: userData.avatar_url,
                email: userData.email,
                lastLogin: userData.last_login,
            };
        } catch (error) {
            console.error('Error inesperado en login:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return null;

            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error || !userData) return null;

            return {
                id: userData.id,
                username: userData.username,
                fullName: userData.full_name,
                role: userData.role,
                avatarUrl: userData.avatar_url,
                email: userData.email,
                lastLogin: userData.last_login,
            };
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            return null;
        }
    }

    async signUp(email: string, password: string, userData: { username: string; fullName: string }): Promise<User | null> {
        try {
            // Crear usuario en Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error || !data.user) {
                console.error('Error en registro:', error?.message);
                return null;
            }

            // Insertar datos adicionales en tabla users
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: data.user.id,
                    username: userData.username,
                    full_name: userData.fullName,
                    email,
                    role: 'Admin',
                });

            if (insertError) {
                console.error('Error insertando datos de usuario:', insertError.message);
                return null;
            }

            return {
                id: data.user.id,
                username: userData.username,
                fullName: userData.fullName,
                role: 'Admin',
                email,
            };
        } catch (error) {
            console.error('Error inesperado en registro:', error);
            return null;
        }
    }

    // =====================================================
    // GESTIÓN DE AÑOS ESCOLARES
    // =====================================================

    async getSchoolYears(): Promise<SchoolYear[]> {
        const { data, error } = await supabase
            .from('school_years')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Error obteniendo años escolares:', error.message);
            return [];
        }

        return (data || []).map(year => ({
            id: year.id,
            name: year.name,
            startDate: year.start_date,
            endDate: year.end_date,
            isActive: year.is_active,
            isClosed: year.is_closed,
        }));
    }

    async addSchoolYear(year: Omit<SchoolYear, 'id'>): Promise<SchoolYear | null> {
        try {
            // Si el año es activo, desactivar los demás
            if (year.isActive) {
                await supabase
                    .from('school_years')
                    .update({ is_active: false })
                    .neq('id', '00000000-0000-0000-0000-000000000000'); // Actualizar todos
            }

            const { data, error } = await supabase
                .from('school_years')
                .insert({
                    name: year.name,
                    start_date: year.startDate,
                    end_date: year.endDate,
                    is_active: year.isActive,
                    is_closed: year.isClosed,
                })
                .select()
                .single();

            if (error) {
                console.error('Error agregando año escolar:', error.message);
                return null;
            }

            return {
                id: data.id,
                name: data.name,
                startDate: data.start_date,
                endDate: data.end_date,
                isActive: data.is_active,
                isClosed: data.is_closed,
            };
        } catch (error) {
            console.error('Error inesperado agregando año escolar:', error);
            return null;
        }
    }

    // =====================================================
    // GESTIÓN DE USUARIOS
    // =====================================================

    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('full_name');

        if (error) {
            console.error('Error obteniendo usuarios:', error.message);
            return [];
        }

        return (data || []).map(user => ({
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            email: user.email,
            lastLogin: user.last_login,
        }));
    }

    async addUser(user: Omit<User, 'id'>): Promise<User | null> {
        // Nota: Para agregar usuarios, primero deben crearse en Supabase Auth
        // Este método solo agrega la entrada en la tabla users
        console.warn('Para agregar usuarios, usa signUp() en su lugar');
        return null;
    }

    // =====================================================
    // GESTIÓN DE ESTUDIANTES
    // =====================================================

    async getStudents(): Promise<Student[]> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('status', 'Active')
            .order('last_name');

        if (error) {
            console.error('Error obteniendo estudiantes:', error.message);
            return [];
        }

        return (data || []).map(student => ({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            name: `${student.first_name} ${student.last_name}`,
            grade: student.grade,
            status: student.status,
            photoUrl: student.photo_url,
            motherName: student.mother_name,
            motherPhone: student.mother_phone,
            fatherName: student.father_name,
            fatherPhone: student.father_phone,
            englishLevel: student.english_level,
        }));
    }

    async getStudentsByGrade(grade: string): Promise<Student[]> {
        let query = supabase
            .from('students')
            .select('*')
            .eq('status', 'Active')
            .order('last_name');

        if (grade.startsWith('Inglés: ')) {
            const level = grade.split(': ')[1].trim();
            query = query.in('grade', ['5to Grado', '6to Grado']).eq('english_level', level);
        } else {
            query = query.eq('grade', grade);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error obteniendo estudiantes por grado:', error.message);
            return [];
        }

        return (data || []).map(student => ({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            name: `${student.first_name} ${student.last_name}`,
            grade: student.grade,
            status: student.status,
            photoUrl: student.photo_url,
            motherName: student.mother_name,
            motherPhone: student.mother_phone,
            fatherName: student.father_name,
            fatherPhone: student.father_phone,
            englishLevel: student.english_level,
        }));
    }

    async getStudentCountsByGrade(): Promise<Record<string, number>> {
        const counts: Record<string, number> = {
            '1er Grado': 0,
            '2do Grado': 0,
            '3er Grado': 0,
            '4to Grado': 0,
            '5to Grado': 0,
            '6to Grado': 0,
        };

        const students = await this.getStudents();
        students.forEach(s => {
            if (counts[s.grade] !== undefined) counts[s.grade]++;
        });

        return counts;
    }

    async getStudentById(id: string): Promise<Student | null> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error obteniendo estudiante:', error?.message);
            return null;
        }

        return {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            name: `${data.first_name} ${data.last_name}`,
            grade: data.grade,
            status: data.status,
            photoUrl: data.photo_url,
            motherName: data.mother_name,
            motherPhone: data.mother_phone,
            fatherName: data.father_name,
            fatherPhone: data.father_phone,
            englishLevel: data.english_level,
        };
    }

    async addStudent(student: Omit<Student, 'id' | 'name'>): Promise<Student | null> {
        const { data, error } = await supabase
            .from('students')
            .insert({
                first_name: student.firstName,
                last_name: student.lastName,
                grade: student.grade,
                status: student.status || 'Active',
                photo_url: student.photoUrl,
                mother_name: student.motherName,
                mother_phone: student.motherPhone,
                father_name: student.fatherName,
                father_phone: student.fatherPhone,
                english_level: student.englishLevel,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error agregando estudiante:', error?.message);
            return null;
        }

        const newStudent = {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            name: `${data.first_name} ${data.last_name}`,
            grade: data.grade,
            status: data.status,
            photoUrl: data.photo_url,
            motherName: data.mother_name,
            motherPhone: data.mother_phone,
            fatherName: data.father_name,
            fatherPhone: data.father_phone,
            englishLevel: data.english_level,
        };

        // Log action
        await this.logStudentAction({
            studentId: newStudent.id,
            actionType: 'REGISTRO',
            details: { grade: newStudent.grade },
            performedAt: new Date().toISOString()
        });

        return newStudent;
    }

    async updateStudent(id: string, updates: Partial<Student>): Promise<boolean> {
        const { error } = await supabase
            .from('students')
            .update({
                first_name: updates.firstName,
                last_name: updates.lastName,
                grade: updates.grade,
                status: updates.status,
                photo_url: updates.photoUrl,
                mother_name: updates.motherName,
                mother_phone: updates.motherPhone,
                father_name: updates.fatherName,
                father_phone: updates.fatherPhone,
                english_level: updates.englishLevel,
            })
            .eq('id', id);

        if (error) {
            console.error('Error actualizando estudiante:', error.message);
            return false;
        }

        await this.logStudentAction({
            studentId: id,
            actionType: 'EDICION',
            details: updates,
            performedAt: new Date().toISOString()
        });

        return true;
    }

    async deleteStudent(id: string): Promise<boolean> {
        // En lugar de borrar físicamente, cambiamos estado a 'Withdrawn' (Retirado) para mantener historial
        // O si se prefiere borrar: .delete().eq('id', id)

        // Opción 1: Soft Delete (Recomendado para integridad)
        /*
        const { error } = await supabase
            .from('students')
            .update({ status: 'Withdrawn' })
            .eq('id', id);
        */

        // Opción 2: Hard Delete (Si el usuario pidió "eliminar")
        // Como hay FKs con cascade en logs y records, se borrará todo.
        // Pero para "delete", el usuario suele esperar que desaparezca.

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando estudiante:', error.message);
            return false;
        }

        return true;
    }

    // =====================================================
    // LOG DE ACCIONES
    // =====================================================

    async logStudentAction(log: Omit<StudentLog, 'id'>): Promise<void> {
        const { error } = await supabase
            .from('student_logs')
            .insert({
                student_id: log.studentId,
                action_type: log.actionType,
                details: log.details,
                performed_at: log.performedAt
            });

        if (error) {
            console.error('Error registrando log:', error.message);
        }
    }

    async getStudentLogs(studentId: string): Promise<StudentLog[]> {
        const { data, error } = await supabase
            .from('student_logs')
            .select('*')
            .eq('student_id', studentId)
            .order('performed_at', { ascending: false });

        if (error) {
            console.error('Error obteniendo logs:', error.message);
            return [];
        }

        return (data || []).map(log => ({
            id: log.id,
            studentId: log.student_id,
            actionType: log.action_type as StudentActionType,
            details: log.details,
            performedAt: log.performed_at
        }));
    }

    // =====================================================
    // GESTIÓN DE COMPETENCIAS E INDICADORES
    // =====================================================

    async getCompetencies(grade?: string, subject?: string): Promise<Competency[]> {
        let query = supabase
            .from('competencies')
            .select('*')
            .order('description', { ascending: true }); // Order alphabetically by description

        if (grade) {
            query = query.eq('grade_level', grade);
        }

        if (subject) {
            query = query.eq('subject', subject);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error obteniendo competencias:', error.message);
            return [];
        }

        return (data || []).map(comp => ({
            id: comp.id,
            subject: comp.subject,
            gradeLevel: comp.grade_level,
            description: comp.description,
            type: comp.type,
        }));
    }

    async addCompetency(comp: Omit<Competency, 'id'>): Promise<Competency | null> {
        const { data, error } = await supabase
            .from('competencies')
            .insert({
                subject: comp.subject,
                grade_level: comp.gradeLevel,
                description: comp.description,
                type: comp.type,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error agregando competencia:', error?.message);
            return null;
        }

        return {
            id: data.id,
            subject: data.subject,
            gradeLevel: data.grade_level,
            description: data.description,
            type: data.type,
        };
    }

    async deleteCompetency(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('competencies')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando competencia:', error.message);
            return false;
        }

        return true;
    }

    async getIndicators(competencyId: string): Promise<Indicator[]> {
        const { data, error } = await supabase
            .from('indicators')
            .select('*')
            .eq('competency_id', competencyId);

        if (error) {
            console.error('Error obteniendo indicadores:', error.message);
            return [];
        }

        return (data || []).map(ind => ({
            id: ind.id,
            competencyId: ind.competency_id,
            description: ind.description,
            type: ind.type,
        }));
    }

    async addIndicator(ind: Omit<Indicator, 'id'>): Promise<Indicator | null> {
        const { data, error } = await supabase
            .from('indicators')
            .insert({
                competency_id: ind.competencyId,
                description: ind.description,
                type: ind.type,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error agregando indicador:', error?.message);
            return null;
        }

        return {
            id: data.id,
            competencyId: data.competency_id,
            description: data.description,
            type: data.type,
        };
    }

    async deleteIndicator(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('indicators')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando indicador:', error.message);
            return false;
        }

        return true;
    }

    // =====================================================
    // GESTIÓN DE COMPETENCIAS GENÉRICAS
    // =====================================================

    async ensureGenericCompetency(grade: string, subject: string): Promise<Competency> {
        // 1. Buscar si ya existe la competencia genérica para este grado/materia
        const { data: existing, error } = await supabase
            .from('competencies')
            .select('*')
            .eq('grade_level', grade)
            .eq('subject', subject)
            .eq('description', 'Evaluación General (Sin Competencia Asignada)')
            .maybeSingle();

        if (existing) {
            return {
                id: existing.id,
                subject: existing.subject,
                gradeLevel: existing.grade_level,
                description: existing.description,
                type: existing.type as any,
            };
        }

        // 2. Si no existe, crearla
        const { data: newComp, error: createError } = await supabase
            .from('competencies')
            .insert({
                subject: subject,
                grade_level: grade,
                description: 'Evaluación General (Sin Competencia Asignada)',
                type: 'Concept', // Usamos un tipo válido en la BD
            })
            .select()
            .single();

        if (createError || !newComp) {
            console.error('Error creando competencia genérica:', createError?.message);
            throw new Error('No se pudo crear la competencia genérica');
        }

        return {
            id: newComp.id,
            subject: newComp.subject,
            gradeLevel: newComp.grade_level,
            description: newComp.description,
            type: newComp.type as any,
        };
    }

    async assignRecordToCompetencies(recordId: string, competencyIds: string[]): Promise<boolean> {
        if (competencyIds.length === 0) return false;

        // 1. Obtener el registro original
        const { data: originalRecord, error: fetchError } = await supabase
            .from('evaluation_records')
            .select('*')
            .eq('id', recordId)
            .single();

        if (fetchError || !originalRecord) {
            console.error('Error obteniendo registro original:', fetchError?.message);
            return false;
        }

        // 2. Actualizar el registro original con la primera competencia
        const firstCompId = competencyIds[0];
        const updates = {
            indicator_id: firstCompId,
            // Podríamos recalcular internal_value si dependiera del tipo de competencia, pero asumimos igual
        };

        const { error: updateError } = await supabase
            .from('evaluation_records')
            .update(updates)
            .eq('id', recordId);

        if (updateError) {
            console.error('Error actualizando registro original:', updateError.message);
            return false;
        }

        // 3. Si hay más competencias, crear copias del registro
        if (competencyIds.length > 1) {
            // Need to fetch details for the other competencies to verify compatibility? No, user action implies it.

            // Prepare records to insert
            // Note: We need UUIDs for new records if the DB doesn't auto-generate or if we use the store locally.
            // Supabase auto-generates if we omit ID.

            const newRecords = competencyIds.slice(1).map(compId => ({
                student_id: originalRecord.student_id,
                indicator_id: compId,
                month: originalRecord.month,
                grade: originalRecord.grade,
                challenge_level: originalRecord.challenge_level,
                adaptation_type: originalRecord.adaptation_type,
                teacher_observation: originalRecord.teacher_observation,
                internal_value: originalRecord.internal_value,
                adaptation_factor: originalRecord.adaptation_factor,
                final_score: originalRecord.final_score,
                timestamp: new Date().toISOString() // Nuevo timestamp
            }));

            const { error: insertError } = await supabase
                .from('evaluation_records')
                .insert(newRecords);

            if (insertError) {
                console.error('Error creando copias de registros:', insertError.message);
                // Return true anyway because the primary assignment worked
                return true;
            }
        }

        return true;
    }

    // =====================================================
    // GESTIÓN DE EVALUACIONES
    // =====================================================

    async getAllRecords(): Promise<EvaluationRecord[]> {
        const { data, error } = await supabase
            .from('evaluation_records')
            .select(`
        *,
        students:student_id (first_name, last_name, grade),
        competencies:indicator_id (subject)
      `)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error obteniendo registros:', error.message);
            return [];
        }

        return (data || []).map(record => ({
            id: record.id,
            studentId: record.student_id,
            studentName: record.students
                ? `${record.students.first_name} ${record.students.last_name}`
                : undefined,
            studentGrade: record.students?.grade,
            indicatorId: record.indicator_id,
            month: record.month,
            grade: record.grade as QualitativeGrade,
            challengeLevel: record.challenge_level as ChallengeLevel,
            adaptationType: record.adaptation_type as AdaptationType,
            teacherObservation: record.teacher_observation,
            internalValue: Number(record.internal_value),
            adaptationFactor: Number(record.adaptation_factor),
            finalScore: Number(record.final_score),
            timestamp: record.timestamp,
            subject: record.competencies?.subject,
        }));
    }

    async getRecordsByContext(grade: string, subject: string, term: string, lapse?: string, schoolYear?: string): Promise<EvaluationRecord[]> {
        // Esta query es más compleja porque necesita filtrar por grado del estudiante y materia de la competencia
        let query = supabase
            .from('evaluation_records')
            .select(`
        *,
        students:student_id (first_name, last_name, grade, english_level),
        competencies:indicator_id (subject, description, type)
      `)
            .eq('month', term);

        if (lapse) query = query.eq('lapse', lapse);
        if (schoolYear) query = query.eq('school_year', schoolYear);

        const { data, error } = await query;

        if (error) {
            console.error('Error obteniendo registros por contexto:', error.message);
            return [];
        }

        // Filtrar en el cliente (idealmente se haría en el servidor con una vista o función)
        const filtered = (data || []).filter(record => {
            const studentGrade = record.students?.grade;
            const competencySubject = record.competencies?.subject;

            if (grade.startsWith('Inglés: ')) {
                const level = grade.split(':')[1].trim();
                return ['5to Grado', '6to Grado'].includes(studentGrade) &&
                    record.students?.english_level === level &&
                    competencySubject === subject;
            }

            return studentGrade === grade && competencySubject === subject;
        });

        return filtered.map(record => ({
            id: record.id,
            studentId: record.student_id,
            studentName: record.students
                ? `${record.students.first_name} ${record.students.last_name}`
                : undefined,
            indicatorId: record.indicator_id,
            month: record.month,
            lapse: record.lapse,
            schoolYear: record.school_year,
            grade: record.grade as QualitativeGrade,
            challengeLevel: record.challenge_level as ChallengeLevel,
            adaptationType: record.adaptation_type as AdaptationType,
            teacherObservation: record.teacher_observation,
            internalValue: Number(record.internal_value),
            adaptationFactor: Number(record.adaptation_factor),
            finalScore: Number(record.final_score),
            timestamp: record.timestamp,
            competencies: record.competencies ? {
                id: record.indicator_id,
                subject: record.competencies.subject,
                description: record.competencies.description,
                type: record.competencies.type,
                gradeLevel: '' // Not fetched but not needed for this check
            } : undefined
        }));
    }

    async addRecord(record: Omit<EvaluationRecord, 'id'>): Promise<EvaluationRecord | null> {
        const { data, error } = await supabase
            .from('evaluation_records')
            .insert({
                student_id: record.studentId,
                indicator_id: record.indicatorId,
                month: record.month,
                lapse: record.lapse,
                school_year: record.schoolYear,
                grade: record.grade,
                challenge_level: record.challengeLevel,
                adaptation_type: record.adaptationType,
                teacher_observation: record.teacherObservation,
                internal_value: record.internalValue,
                adaptation_factor: record.adaptationFactor,
                final_score: record.finalScore,
                timestamp: record.timestamp,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error agregando registro:', error?.message);
            return null;
        }

        return {
            id: data.id,
            studentId: data.student_id,
            indicatorId: data.indicator_id,
            month: data.month,
            lapse: data.lapse,
            schoolYear: data.school_year,
            grade: data.grade as QualitativeGrade,
            challengeLevel: data.challenge_level as ChallengeLevel,
            adaptationType: data.adaptation_type as AdaptationType,
            teacherObservation: data.teacher_observation,
            internalValue: Number(data.internal_value),
            adaptationFactor: Number(data.adaptation_factor),
            finalScore: Number(data.final_score),
            timestamp: data.timestamp,
        };
    }

    async deleteEvaluationRecord(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('evaluation_records')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando registro:', error.message);
            return false;
        }

        return true;
    }

    async deleteAllEvaluationRecords(): Promise<boolean> {
        const { error } = await supabase
            .from('evaluation_records')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows (id is never 0 uuid)

        if (error) {
            console.error('Error eliminando todos los registros:', error.message);
            return false;
        }

        return true;
    }

    // =====================================================
    // GESTIÓN DE PLANES DE ACCIÓN
    // =====================================================

    async getActionPlans(): Promise<ActionPlan[]> {
        const { data, error } = await supabase
            .from('action_plans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error obteniendo planes de acción:', error.message);
            return [];
        }

        return (data || []).map(plan => ({
            id: plan.id,
            targetId: plan.target_id,
            targetName: plan.target_name,
            type: plan.type,
            description: plan.description,
            status: plan.status as ActionStatus,
            priority: plan.priority,
            dueDate: plan.due_date,
            createdAt: plan.created_at,
            closedAt: plan.closed_at,
            closureObservation: plan.closure_observation,
        }));
    }

    async addActionPlan(plan: Omit<ActionPlan, 'id'>): Promise<ActionPlan | null> {
        const { data, error } = await supabase
            .from('action_plans')
            .insert({
                target_id: plan.targetId,
                target_name: plan.targetName,
                type: plan.type,
                description: plan.description,
                status: plan.status,
                priority: plan.priority,
                due_date: plan.dueDate,
                created_at: plan.createdAt,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error agregando plan de acción:', error?.message);
            return null;
        }

        return {
            id: data.id,
            targetId: data.target_id,
            targetName: data.target_name,
            type: data.type,
            description: data.description,
            status: data.status as ActionStatus,
            priority: data.priority,
            dueDate: data.due_date,
            createdAt: data.created_at,
            closedAt: data.closed_at,
            closureObservation: data.closure_observation,
        };
    }

    async updateActionPlanStatus(
        id: string,
        newStatus: ActionStatus,
        observation?: string
    ): Promise<boolean> {
        const updateData: any = {
            status: newStatus,
            closure_observation: observation,
        };

        if (newStatus === 'Exitosa' || newStatus === 'Sin Éxito') {
            updateData.closed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('action_plans')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error actualizando plan de acción:', error.message);
            return false;
        }

        return true;
    }

    // =====================================================
    // ESTADÍSTICAS Y ANÁLISIS
    // =====================================================

    async getStats() {
        const records = await this.getAllRecords();
        const total = records.length;
        const atRisk = records.filter(r =>
            [QualitativeGrade.E, QualitativeGrade.SE].includes(r.grade)
        ).length;
        const adapted = records.filter(r => r.challengeLevel !== ChallengeLevel.NORMAL).length;
        const avg = total > 0 ? (records.reduce((acc, curr) => acc + curr.finalScore, 0) / total) : 0;

        return {
            totalEvaluations: total,
            studentsAtRisk: atRisk,
            activeAdaptations: adapted,
            averageScore: avg.toFixed(2),
        };
    }

    async getInterventionStats() {
        const plans = await this.getActionPlans();
        const total = plans.length;

        if (total === 0) return { distribution: [], successRate: 0, total };

        const counts = { 'Pendiente': 0, 'En Progreso': 0, 'Exitosa': 0, 'Sin Éxito': 0 };
        plans.forEach(p => {
            if (counts[p.status] !== undefined) counts[p.status]++;
        });

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

    async getStudentClinicalData(studentId: string) {
        const records = await this.getAllRecords();
        const plans = await this.getActionPlans();
        const logs = await this.getStudentLogs(studentId);

        const evals = records
            .filter(r => r.studentId === studentId)
            .map(e => ({ type: 'EVALUATION' as const, date: e.timestamp, data: e }));

        const interventions = plans
            .filter(p => p.targetId === studentId)
            .map(p => ({ type: 'INTERVENTION' as const, date: p.createdAt, data: p }));

        const systemLogs = logs.map(l => ({ type: 'LOG' as const, date: l.performedAt, data: l }));

        const timeline = [...evals, ...interventions, ...systemLogs]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const closedInterventions = interventions.filter(
            i => i.data.status === 'Exitosa' || i.data.status === 'Sin Éxito'
        );
        const successful = closedInterventions.filter(i => i.data.status === 'Exitosa').length;
        const efficacyRate = closedInterventions.length > 0
            ? Math.round((successful / closedInterventions.length) * 100)
            : 0;

        const recentGrades = evals.slice(0, 3).map(e => e.data.internalValue);
        const riskTrend = recentGrades.length > 0
            ? (recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length) < 3
                ? 'Alto Riesgo'
                : 'Estable'
            : 'Sin Datos';

        return {
            timeline,
            stats: {
                efficacyRate,
                totalInterventions: interventions.length,
                riskTrend,
                evaluationsCount: evals.length,
                lastUpdate: timeline[0]?.date || new Date().toISOString(),
            },
        };
    }

    async getRecentActivity() {
        const records = await this.getAllRecords();
        return records.slice(0, 5);
    }

    // =====================================================
    // DATOS SIMULADOS (Para comparativas históricas)
    // =====================================================

    async getSimulatedHistoricalData(
        baseContext: { grade: string; subject: string },
        variance: 'worse' | 'better' | 'similar'
    ) {
        const baseRecords = await this.getAllRecords();

        if (baseRecords.length === 0) return [];

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
                challengeLevel: Math.random() > 0.8 ? ChallengeLevel.AC_MINUS : ChallengeLevel.NORMAL,
            };
        });
    }
}

export const supabaseStore = new SupabaseStore();
