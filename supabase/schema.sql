-- =====================================================
-- MANGLARNET EVALUATION PLATFORM - SUPABASE SCHEMA
-- =====================================================
-- Este script crea todas las tablas necesarias para la
-- plataforma de evaluación ManglarNet
-- =====================================================

-- 1. TABLA: users
-- Usuarios del sistema (sincronizada con Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Admin')),
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: school_years
-- Años escolares del sistema
CREATE TABLE IF NOT EXISTS school_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- "2025-2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- 3. TABLA: students
-- Estudiantes matriculados
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT NOT NULL, -- "1er Grado", "2do Grado", etc.
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Withdrawn')),
  photo_url TEXT,
  
  -- Datos familiares
  mother_name TEXT,
  mother_phone TEXT,
  father_name TEXT,
  father_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por grado
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_last_name ON students(last_name);

-- 4. TABLA: subjects
-- Materias del currículo
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: competencies
-- Competencias curriculares
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL, -- "Lenguaje", "Matemáticas"
  grade_level TEXT NOT NULL, -- "6to Grado"
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Concept', 'Procedural', 'Attitude')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_competencies_subject_grade ON competencies(subject, grade_level);

-- 6. TABLA: indicators
-- Indicadores de evaluación (hijos de competencias)
CREATE TABLE IF NOT EXISTS indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Cognitive', 'Procedural', 'Attitudinal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por competencia
CREATE INDEX IF NOT EXISTS idx_indicators_competency ON indicators(competency_id);

-- 7. TABLA: evaluation_records
-- Registros de evaluación de estudiantes
CREATE TABLE IF NOT EXISTS evaluation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- "Mensual I", "Examen Lapso I", etc.
  
  -- Datos de la matriz de evaluación
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'SE')),
  challenge_level TEXT NOT NULL CHECK (challenge_level IN ('AC+', 'Normal', 'AC-')),
  adaptation_type TEXT NOT NULL CHECK (adaptation_type IN ('Ninguna', 'Contenido', 'Forma', 'Superioridad')),
  teacher_observation TEXT NOT NULL,
  
  -- Valores calculados
  internal_value NUMERIC(3,1) NOT NULL, -- 0-5
  adaptation_factor NUMERIC(3,1) NOT NULL, -- 0.8, 1.0, 1.2
  final_score NUMERIC(3,2) NOT NULL, -- Score final
  
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas y reportes
CREATE INDEX IF NOT EXISTS idx_eval_student ON evaluation_records(student_id);
CREATE INDEX IF NOT EXISTS idx_eval_indicator ON evaluation_records(indicator_id);
CREATE INDEX IF NOT EXISTS idx_eval_month ON evaluation_records(month);
CREATE INDEX IF NOT EXISTS idx_eval_timestamp ON evaluation_records(timestamp DESC);

-- 8. TABLA: action_plans
-- Planes de acción e intervenciones
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id TEXT NOT NULL, -- Student ID o 'GROUP'
  target_name TEXT NOT NULL, -- Nombre del estudiante o "Grupo General"
  type TEXT NOT NULL CHECK (type IN (
    'Refuerzo Académico',
    'Citación Representante',
    'Remisión Psicología',
    'Remisión a Psicopedagogía',
    'Adaptación Curricular',
    'Dinámica Grupal'
  )),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Progreso', 'Exitosa', 'Sin Éxito')),
  priority TEXT NOT NULL CHECK (priority IN ('Alta', 'Media', 'Baja')),
  due_date DATE,
  closure_observation TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_action_target ON action_plans(target_id);
CREATE INDEX IF NOT EXISTS idx_action_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_created ON action_plans(created_at DESC);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_years_updated_at BEFORE UPDATE ON school_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON indicators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON action_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES (OPCIONAL)
-- =====================================================

-- Insertar materias básicas
INSERT INTO subjects (name) VALUES 
  ('Lenguaje'),
  ('Matemáticas'),
  ('Ciencias Naturales'),
  ('Ciencias Sociales'),
  ('Educación Física'),
  ('Arte')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE users IS 'Usuarios del sistema, sincronizados con Supabase Auth';
COMMENT ON TABLE school_years IS 'Años escolares del sistema educativo';
COMMENT ON TABLE students IS 'Estudiantes matriculados en la institución';
COMMENT ON TABLE subjects IS 'Materias del currículo educativo';
COMMENT ON TABLE competencies IS 'Competencias curriculares por materia y grado';
COMMENT ON TABLE indicators IS 'Indicadores específicos de evaluación';
COMMENT ON TABLE evaluation_records IS 'Registros de evaluación de estudiantes';
COMMENT ON TABLE action_plans IS 'Planes de acción e intervenciones pedagógicas';
