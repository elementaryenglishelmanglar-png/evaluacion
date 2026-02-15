-- =====================================================
-- MANGLARNET - ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Políticas de seguridad para todas las tablas
-- =====================================================

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIÓN HELPER: Verificar si el usuario es Admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA: users
-- =====================================================

-- Usuarios autenticados pueden ver todos los usuarios
CREATE POLICY "Usuarios autenticados pueden ver usuarios"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden insertar usuarios
CREATE POLICY "Solo admins pueden crear usuarios"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Usuarios pueden actualizar su propio perfil, admins pueden actualizar cualquiera
CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Solo admins pueden eliminar usuarios"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: school_years
-- =====================================================

CREATE POLICY "Todos pueden ver años escolares"
  ON school_years FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear años escolares"
  ON school_years FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar años escolares"
  ON school_years FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar años escolares"
  ON school_years FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: students
-- =====================================================

CREATE POLICY "Todos pueden ver estudiantes"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear estudiantes"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar estudiantes"
  ON students FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar estudiantes"
  ON students FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: subjects
-- =====================================================

CREATE POLICY "Todos pueden ver materias"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear materias"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar materias"
  ON subjects FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar materias"
  ON subjects FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: competencies
-- =====================================================

CREATE POLICY "Todos pueden ver competencias"
  ON competencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear competencias"
  ON competencies FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar competencias"
  ON competencies FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar competencias"
  ON competencies FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: indicators
-- =====================================================

CREATE POLICY "Todos pueden ver indicadores"
  ON indicators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear indicadores"
  ON indicators FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar indicadores"
  ON indicators FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar indicadores"
  ON indicators FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: evaluation_records
-- =====================================================

CREATE POLICY "Todos pueden ver evaluaciones"
  ON evaluation_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear evaluaciones"
  ON evaluation_records FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar evaluaciones"
  ON evaluation_records FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar evaluaciones"
  ON evaluation_records FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA: action_plans
-- =====================================================

CREATE POLICY "Todos pueden ver planes de acción"
  ON action_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden crear planes de acción"
  ON action_plans FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden actualizar planes de acción"
  ON action_plans FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Solo admins pueden eliminar planes de acción"
  ON action_plans FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario actual tiene rol de Admin';
