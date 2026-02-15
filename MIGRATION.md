# Migración a Supabase - Guía de Implementación

## ✅ Completado

### 1. Configuración Inicial
- [x] Instalación de `@supabase/supabase-js`
- [x] Creación de cliente de Supabase (`services/supabase.ts`)
- [x] Configuración de variables de entorno (`.env.example`)
- [x] Scripts SQL para base de datos (`supabase/schema.sql`, `policies.sql`, `storage.sql`)

### 2. Servicio de Datos
- [x] Creación de `supabaseStore.ts` con todas las operaciones CRUD
- [x] Migración de métodos de autenticación
- [x] Migración de métodos de estudiantes
- [x] Migración de métodos de evaluaciones
- [x] Migración de métodos de competencias e indicadores
- [x] Migración de métodos de planes de acción
- [x] Migración de métodos de años escolares
- [x] Migración de métodos de estadísticas

## 📋 Pendiente

### 3. Actualización de Componentes
Los siguientes componentes necesitan ser actualizados para usar operaciones asíncronas:

- [ ] `App.tsx` - Verificación de sesión al inicio
- [ ] `components/Login.tsx` - Login asíncrono
- [ ] `components/StudentManager.tsx` - CRUD asíncrono de estudiantes
- [ ] `components/EvaluationInput.tsx` - Guardado asíncrono de evaluaciones
- [ ] `components/CompetencyLibrary.tsx` - CRUD asíncrono de competencias
- [ ] `components/Dashboard.tsx` - Carga asíncrona de datos
- [ ] `components/SettingsManager.tsx` - Gestión asíncrona de configuración
- [ ] `components/Overview.tsx` - Carga asíncrona de estadísticas
- [ ] `components/ComparativeAnalytics.tsx` - Análisis asíncrono

### 4. Configuración de Supabase (Manual)
Estos pasos deben realizarse en el panel de Supabase:

1. **Crear proyecto en Supabase**
   - Ir a https://supabase.com
   - Crear nuevo proyecto
   - Anotar URL y clave anon

2. **Ejecutar scripts SQL**
   - Ir a SQL Editor en Supabase
   - Ejecutar `supabase/schema.sql`
   - Ejecutar `supabase/policies.sql`

3. **Crear buckets de storage**
   - Ir a Storage
   - Crear bucket `student-photos` (privado)
   - Crear bucket `user-avatars` (público)
   - Ejecutar `supabase/storage.sql` para políticas

4. **Crear usuario admin**
   - Ir a Authentication > Users
   - Crear usuario con email y contraseña
   - Ejecutar SQL para insertar en tabla `users`:
     ```sql
     INSERT INTO users (id, username, full_name, role, email)
     VALUES (
       'id-del-usuario-auth',
       'admin',
       'Administrador Principal',
       'Admin',
       'admin@manglar.edu.ve'
     );
     ```

5. **Configurar variables de entorno**
   - Copiar `.env.example` a `.env`
   - Completar con credenciales de Supabase

## 🔄 Cambios Principales

### De Síncrono a Asíncrono

**Antes:**
```typescript
const students = appStore.getStudents();
```

**Después:**
```typescript
const students = await supabaseStore.getStudents();
```

### Manejo de Estados de Carga

Todos los componentes ahora necesitan:

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await supabaseStore.getSomeData();
    // Usar data
  } catch (err) {
    setError('Error cargando datos');
  } finally {
    setLoading(false);
  }
};
```

### Autenticación

**Antes:**
```typescript
const user = appStore.login(username, password);
```

**Después:**
```typescript
const user = await supabaseStore.login(email, password);
```

## 🚀 Próximos Pasos

1. **Actualizar componentes** - Convertir todas las operaciones a async/await
2. **Probar en desarrollo** - Verificar que todo funciona con Supabase
3. **Migrar datos existentes** - Si hay datos en localStorage, migrarlos a Supabase
4. **Desplegar** - Configurar variables de entorno en producción

## 📝 Notas Importantes

- **Sesiones persistentes**: Supabase Auth maneja automáticamente la persistencia de sesiones
- **RLS activado**: Todas las tablas tienen Row Level Security habilitado
- **Solo Admin puede escribir**: Las políticas permiten lectura a todos los autenticados, pero solo Admin puede escribir
- **Cascada en eliminaciones**: Al eliminar una competencia, se eliminan automáticamente sus indicadores
- **Triggers automáticos**: Los campos `updated_at` se actualizan automáticamente

## 🔧 Troubleshooting

### Error: "Missing credentials"
- Verificar que el archivo `.env` existe y tiene las credenciales correctas
- Verificar que las variables empiezan con `VITE_` (requerido por Vite)

### Error: "Row Level Security"
- Verificar que el usuario está autenticado
- Verificar que el usuario tiene rol 'Admin' en la tabla `users`
- Verificar que las políticas RLS están activas

### Error: "Foreign key constraint"
- Verificar que los IDs referenciados existen
- Verificar el orden de inserción (crear competencias antes de indicadores, etc.)
