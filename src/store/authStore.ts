import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'god_admin' | 'admin' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  role: Role;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  initialized: false,

  setSession: (session) => set({ session, user: session?.user || null }),

  initialize: async () => {
    // Check active session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user || null });

    if (session?.user) {
      // Fetch profile for role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        set({ profile });
      }
    }

    set({ initialized: true });

    // Listen to auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user || null });
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) set({ profile });
      } else {
        set({ profile: null });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  }
}));
