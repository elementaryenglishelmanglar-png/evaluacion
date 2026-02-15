import { createClient } from '@supabase/supabase-js';

// Obtener credenciales desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las credenciales de Supabase. Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Tipos de base de datos (generados automáticamente desde el esquema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          role: 'Admin';
          avatar_url: string | null;
          email: string;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          role?: 'Admin';
          avatar_url?: string | null;
          email: string;
          last_login?: string | null;
        };
        Update: {
          username?: string;
          full_name?: string;
          role?: 'Admin';
          avatar_url?: string | null;
          email?: string;
          last_login?: string | null;
        };
      };
      school_years: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          is_closed?: boolean;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          is_closed?: boolean;
        };
      };
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          grade: string;
          status: 'Active' | 'Withdrawn';
          photo_url: string | null;
          mother_name: string | null;
          mother_phone: string | null;
          father_name: string | null;
          father_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          grade: string;
          status?: 'Active' | 'Withdrawn';
          photo_url?: string | null;
          mother_name?: string | null;
          mother_phone?: string | null;
          father_name?: string | null;
          father_phone?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          grade?: string;
          status?: 'Active' | 'Withdrawn';
          photo_url?: string | null;
          mother_name?: string | null;
          mother_phone?: string | null;
          father_name?: string | null;
          father_phone?: string | null;
        };
      };
      // ... (otros tipos se pueden agregar según sea necesario)
    };
  };
};
