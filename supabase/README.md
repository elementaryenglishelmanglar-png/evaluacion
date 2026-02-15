# Configuración de Supabase

Este directorio contiene los scripts SQL necesarios para configurar la base de datos de Supabase para la plataforma ManglarNet.

## Archivos

- **`schema.sql`** - Esquema completo de la base de datos (tablas, índices, triggers)
- **`policies.sql`** - Políticas de Row Level Security (RLS)
- **`storage.sql`** - Configuración de buckets de almacenamiento

## Instrucciones de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la clave anon/public

### 2. Ejecutar Scripts SQL

En el panel de Supabase, ve a **SQL Editor** y ejecuta los scripts en este orden:

1. **`schema.sql`** - Crea todas las tablas y estructuras
2. **`policies.sql`** - Configura las políticas de seguridad
3. **`storage.sql`** - Configura el almacenamiento de archivos

### 3. Crear Buckets de Storage

Ve a **Storage** en el panel de Supabase y crea los siguientes buckets:

- **`student-photos`**
  - Público: No
  - Tamaño máximo: 2MB
  - Tipos permitidos: image/jpeg, image/png, image/webp

- **`user-avatars`**
  - Público: Sí
  - Tamaño máximo: 1MB
  - Tipos permitidos: image/jpeg, image/png, image/webp

### 4. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` y agrega:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 5. Crear Usuario Admin

En **Authentication > Users**, crea un usuario admin:
- Email: admin@manglar.edu.ve
- Password: (tu contraseña segura)

Luego, en **SQL Editor**, ejecuta:

```sql
INSERT INTO users (id, username, full_name, role, email)
VALUES (
  'id-del-usuario-creado-en-auth',
  'admin',
  'Administrador Principal',
  'Admin',
  'admin@manglar.edu.ve'
);
```

## Verificación

Para verificar que todo está configurado correctamente:

1. Ve a **Table Editor** y verifica que todas las tablas existen
2. Ve a **Authentication > Policies** y verifica que las políticas están activas
3. Ve a **Storage** y verifica que los buckets existen

## Notas

- Las políticas RLS están configuradas para que solo usuarios con rol 'Admin' puedan escribir datos
- Todos los usuarios autenticados pueden leer datos
- Las sesiones se persisten automáticamente en localStorage
