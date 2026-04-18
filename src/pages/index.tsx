import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2, Zap } from 'lucide-react';

export default function IndexPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto">
          <Zap className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading CareerPulse Pro...</span>
        </div>
      </div>
    </div>
  );
}
