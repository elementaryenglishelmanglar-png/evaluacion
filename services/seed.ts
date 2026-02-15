import { supabase } from '../services/supabase';
import { QualitativeGrade, ChallengeLevel } from '../types';

export const seedData = async () => {
    console.log('🌱 Starting seed...');

    const { error: authError } = await supabase.auth.getUser();
    if (authError) {
        console.error('❌ Must be logged in to seed data');
        return;
    }

    // 1. Students
    const students = [
        { id: 's1', first_name: 'Ana', last_name: 'García', grade: '6to Grado' },
        { id: 's2', first_name: 'Carlos', last_name: 'Rodríguez', grade: '6to Grado' },
        { id: 's3', first_name: 'María', last_name: 'Pérez', grade: '6to Grado' },
        { id: 's4', first_name: 'Juan', last_name: 'López', grade: '5to Grado' },
        { id: 's5', first_name: 'Luisa', last_name: 'Martínez', grade: '5to Grado' },
    ];

    for (const s of students) {
        const { error } = await supabase.from('students').upsert(s, { onConflict: 'id' });
        if (error) console.error('Error seeding student:', error);
    }

    // 2. Competencies
    const competencies = [
        { id: 'c1', subject: 'Lenguaje', grade_level: '6to Grado', description: 'Comprensión Lectora', order_index: 1 },
        { id: 'c2', subject: 'Matemáticas', grade_level: '6to Grado', description: 'Resolución de Problemas', order_index: 2 },
    ];

    for (const c of competencies) {
        const { error } = await supabase.from('competencies').upsert(c, { onConflict: 'id' });
        if (error) console.error('Error seeding competency:', error);
    }

    console.log('✅ Seed complete!');
};
