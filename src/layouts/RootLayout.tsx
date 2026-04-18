import { type ReactElement } from 'react';
import { useAuth } from '@/lib/auth';
import AppHeader from '@/layouts/parts/Header';
import AppSidebar from '@/layouts/parts/Sidebar';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    // Public layout (login/register) — no sidebar
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
