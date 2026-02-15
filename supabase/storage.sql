-- =====================================================
-- MANGLARNET - SUPABASE STORAGE CONFIGURATION
-- =====================================================
-- Configuración de buckets y políticas de almacenamiento
-- =====================================================

-- NOTA: Los buckets se crean desde la interfaz de Supabase
-- o mediante la API. Este archivo documenta la configuración.

-- =====================================================
-- BUCKET: student-photos
-- =====================================================
-- Fotos de estudiantes
-- Configuración:
--   - Público: No
--   - Tamaño máximo: 2MB
--   - Tipos permitidos: image/jpeg, image/png, image/webp
--   - Ruta: student-photos/{student-id}/{filename}

-- Crear bucket (ejecutar en consola de Supabase o mediante código)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('student-photos', 'student-photos', false);

-- Políticas de acceso para student-photos
CREATE POLICY "Usuarios autenticados pueden ver fotos de estudiantes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'student-photos');

CREATE POLICY "Solo admins pueden subir fotos de estudiantes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'student-photos' 
    AND (SELECT is_admin())
  );

CREATE POLICY "Solo admins pueden actualizar fotos de estudiantes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'student-photos' 
    AND (SELECT is_admin())
  );

CREATE POLICY "Solo admins pueden eliminar fotos de estudiantes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'student-photos' 
    AND (SELECT is_admin())
  );

-- =====================================================
-- BUCKET: user-avatars
-- =====================================================
-- Avatares de usuarios
-- Configuración:
--   - Público: Sí
--   - Tamaño máximo: 1MB
--   - Tipos permitidos: image/jpeg, image/png, image/webp
--   - Ruta: user-avatars/{user-id}/{filename}

-- Crear bucket (ejecutar en consola de Supabase o mediante código)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('user-avatars', 'user-avatars', true);

-- Políticas de acceso para user-avatars
CREATE POLICY "Todos pueden ver avatares"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'user-avatars');

CREATE POLICY "Usuarios pueden subir su propio avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios pueden actualizar su propio avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios pueden eliminar su propio avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================
-- 
-- Para crear los buckets desde código TypeScript:
-- 
-- import { supabase } from './supabase';
-- 
-- // Crear bucket de fotos de estudiantes
-- await supabase.storage.createBucket('student-photos', {
--   public: false,
--   fileSizeLimit: 2097152, // 2MB
--   allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
-- });
-- 
-- // Crear bucket de avatares
-- await supabase.storage.createBucket('user-avatars', {
--   public: true,
--   fileSizeLimit: 1048576, // 1MB
--   allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
-- });
