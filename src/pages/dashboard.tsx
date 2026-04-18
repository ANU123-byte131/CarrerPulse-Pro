import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, apiRequest } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, Target, BarChart3, Map, MessageSquare, Briefcase, Bot,
  TrendingUp, Award, Clock, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardData {
  resumeScore: number;
  jobReadinessScore: number;
  applicationStats: { total: number; interviewing: number; offers: number; rejected: number; responseRate: number };
  skillProgress: { skill: string; userLevel: number; required: number }[];
  recentActivity: { action: string; time: string; type: string }[];
  targetRole: string;
  daysActive: number;
  skillsLearned: number;
  userName: string;
}

const quickActions = [
  { to: '/resume', icon: FileText, label: 'Analyze Resume', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { to: '/job-match', icon: Target, label: 'Match a Job', color: 'text-green-500', bg: 'bg-green-500/10' },
  { to: '/interview', icon: MessageSquare, label: 'Practice Interview', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { to: '/roadmap', icon: Map, label: 'View Roadmap', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { to: '/skill-gap', icon: BarChart3, label: 'Check Skill Gap', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { to: '/coach', icon: Bot, label: 'Ask AI Coach', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/dashboard/summary')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-foreground">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          {data?.targetRole ? `Targeting: ${data.targetRole}` : 'Set your target role in Profile to get personalized insights'}
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Resume Score', value: loading ? null : `${data?.resumeScore || 0}%`, icon: FileText, color: 'text-blue-500', sub: 'ATS compatibility' },
          { label: 'Job Readiness', value: loading ? null : `${data?.jobReadinessScore || 0}%`, icon: TrendingUp, color: 'text-green-500', sub: 'vs target role' },
          { label: 'Applications', value: loading ? null : `${data?.applicationStats.total || 0}`, icon: Briefcase, color: 'text-purple-500', sub: `${data?.applicationStats.responseRate || 0}% response rate` },
          { label: 'Days Active', value: loading ? null : `${data?.daysActive || 1}`, icon: Award, color: 'text-orange-500', sub: `${data?.skillsLearned || 0} skills tracked` },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill Progress */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Skill Progress for {data?.targetRole || 'Your Target Role'}</CardTitle>
                <Link to="/skill-gap">
                  <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">
                    Full Analysis <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : data?.skillProgress.length ? (
                data.skillProgress.map(skill => {
                  const pct = Math.min(100, Math.round((skill.userLevel / skill.required) * 100));
                  return (
                    <div key={skill.skill}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground font-medium">{skill.skill}</span>
                        <span className="text-muted-foreground">{skill.userLevel}% / {skill.required}% required</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-primary' : 'bg-orange-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Set your target role in Profile to see skill progress</p>
                  <Link to="/profile"><Button variant="outline" size="sm" className="mt-3">Set Target Role</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : data?.recentActivity.length ? (
              data.recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    act.type === 'resume' ? 'bg-blue-500/10' : act.type === 'application' ? 'bg-purple-500/10' : 'bg-green-500/10'
                  }`}>
                    {act.type === 'resume' ? <FileText className="w-3.5 h-3.5 text-blue-500" /> :
                     act.type === 'application' ? <Briefcase className="w-3.5 h-3.5 text-purple-500" /> :
                     <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">{act.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(act.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet. Start by analyzing your resume!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.to} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Link to={action.to}>
                <Card className="bg-card border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Application Stats */}
      {data && data.applicationStats.total > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Application Pipeline</CardTitle>
              <Link to="/applications"><Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">View All <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Applied', value: data.applicationStats.total, color: 'bg-blue-500' },
                { label: 'Interviewing', value: data.applicationStats.interviewing, color: 'bg-yellow-500' },
                { label: 'Offers', value: data.applicationStats.offers, color: 'bg-green-500' },
                { label: 'Rejected', value: data.applicationStats.rejected, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-2`} />
                  <div className="text-xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
