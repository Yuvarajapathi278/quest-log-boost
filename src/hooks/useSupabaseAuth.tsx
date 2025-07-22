
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          
          // Use setTimeout to prevent blocking the auth flow
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              // Check if user profile exists
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (!profile && !profileError && mounted) {
                console.log('Creating user profile...');
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert([{
                    id: session.user.id,
                    username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User'
                  }]);
                
                if (insertError) console.error('Profile creation error:', insertError);
              }

              // Check if player stats exist
              const { data: stats, error: statsError } = await supabase
                .from('player_stats')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (!stats && !statsError && mounted) {
                console.log('Creating player stats...');
                const { error: insertError } = await supabase
                  .from('player_stats')
                  .insert([{
                    user_id: session.user.id,
                    total_xp: 0,
                    coins: 0,
                    level: 1,
                    streak: 0
                  }]);
                
                if (insertError) console.error('Stats creation error:', insertError);
              }
            } catch (error) {
              console.error('Error setting up user data:', error);
            }
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          console.log('User signed out');
        }
        
        // Always set loading to false after processing auth state change
        setLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No user');
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth listener...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed Out",
        description: "See you next time, warrior! 👋",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
