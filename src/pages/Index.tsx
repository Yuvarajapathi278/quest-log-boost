
import { useAuth } from '@/hooks/useSupabaseAuth';
import { Auth } from '@/components/Auth';
import { TaskForgeWithSupabase } from '@/components/TaskForgeWithSupabase';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Index page - User:', user?.email, 'Loading:', loading);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Loading TaskForge...</p>
            <p className="text-sm text-muted-foreground">Initializing your adventure...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing auth page');
    return <Auth onAuthSuccess={() => console.log('Auth success callback')} />;
  }

  console.log('User authenticated, showing main app');
  return <TaskForgeWithSupabase />;
};

export default Index;
