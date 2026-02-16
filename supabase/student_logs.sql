-- TABLA: student_logs
-- Bitácora de acciones sobre estudiantes
CREATE TABLE IF NOT EXISTS student_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'REGISTRO', 'EDICION', 'ELIMINACION', 'PROMOCION', 'RETIRO'
  details JSONB, -- Detalles sobre los cambios
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_logs_student ON student_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON student_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_logs_date ON student_logs(performed_at DESC);

-- Comentario
COMMENT ON TABLE student_logs IS 'Historial de acciones y cambios en el expediente del estudiante';
