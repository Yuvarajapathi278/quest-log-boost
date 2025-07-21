
import { useAuth } from '@/hooks/useSupabaseAuth';
import { Auth } from '@/components/Auth';
import { TaskForgeWithSupabase } from '@/components/TaskForgeWithSupabase';

const Index = () => {
  const { user, loading } = useAuth();

  console.log('Index page - User:', user?.email, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading TaskForge...</p>
          <p className="text-sm text-muted-foreground mt-2">Initializing your adventure...</p>
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
