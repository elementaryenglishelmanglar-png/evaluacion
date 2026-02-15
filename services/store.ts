import { supabaseStore } from './supabaseStore';

// Export the Supabase store instance as the default appStore
// This allows all components to use the same import path but get the connected store
export const appStore = supabaseStore;
