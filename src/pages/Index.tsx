
import { useAuth } from '@/hooks/useSupabaseAuth';
import { Auth } from '@/components/Auth';
import { TaskForgeWithSupabase } from '@/components/TaskForgeWithSupabase';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading TaskForge...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return <TaskForgeWithSupabase />;
};

export default Index;
