import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  FileText,
  Target,
  BarChart3,
  Map,
  MessageSquare,
  Briefcase,
  Bot,
  User,
  LogOut,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { to: '/job-match', icon: Target, label: 'Job Match' },
  { to: '/skill-gap', icon: BarChart3, label: 'Skill Gap' },
  { to: '/roadmap', icon: Map, label: 'Career Roadmap' },
  { to: '/interview', icon: MessageSquare, label: 'Interview Prep' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/coach', icon: Bot, label: 'AI Career Coach' },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-64 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-sidebar-foreground text-sm">CareerPulse</span>
          <span className="text-primary text-sm font-bold"> Pro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )
          }
        >
          <User className="w-4 h-4 shrink-0" />
          Profile
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 px-3"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </Button>
        <div className="px-3 pt-2">
          <p className="text-xs text-sidebar-foreground/40 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
