import { useState, useEffect } from 'react';
import { useAuth, apiRequest } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Map, Loader2, CheckCircle2, RefreshCw, Code, Briefcase, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'Cloud Architect',
];

interface Phase {
  week: number;
  title: string;
  skills: string[];
  projects: string[];
  completed: boolean;
}

interface Roadmap {
  id: string;
  targetRole: string;
  phases: Phase[];
  createdAt: string;
}

export default function RoadmapPage() {
  const { profile } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedRole, setSelectedRole] = useState(profile?.targetRole || 'Full Stack Developer');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  useEffect(() => {
    if (profile?.targetRole) setSelectedRole(profile.targetRole);
    fetchRoadmap();
  }, []);

  async function fetchRoadmap() {
    setLoading(true);
    try {
      const res = await apiRequest('/api/roadmap/current');
      if (res.ok) setRoadmap(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function generateRoadmap() {
    setGenerating(true);
    try {
      const res = await apiRequest('/api/roadmap/generate', {
        method: 'POST',
        body: JSON.stringify({ targetRole: selectedRole }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRoadmap(data);
      setExpandedWeek(1);
      toast.success(`Roadmap generated for ${selectedRole}!`);
    } catch {
      toast.error('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  }

  async function toggleWeek(week: number, completed: boolean) {
    try {
      const res = await apiRequest('/api/roadmap/progress', {
        method: 'PATCH',
        body: JSON.stringify({ week, completed }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRoadmap(data);
      if (completed) toast.success(`Week ${week} completed! 🎉`);
    } catch {
      toast.error('Failed to update progress');
    }
  }

  const completedCount = roadmap?.phases.filter(p => p.completed).length || 0;
  const totalCount = roadmap?.phases.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Career Roadmap</h2>
          <p className="text-muted-foreground mt-1">Your personalized 8-week learning plan to land your target role.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-52 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={generateRoadmap} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Generate
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {roadmap && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{roadmap.targetRole} Roadmap</p>
                  <p className="text-xs text-muted-foreground">{completedCount} of {totalCount} weeks completed</p>
                </div>
                <div className="flex items-center gap-2">
                  {completedCount === totalCount && totalCount > 0 && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      <Trophy className="w-3 h-3 mr-1" /> Completed!
                    </Badge>
                  )}
                  <span className="text-2xl font-bold text-primary">{progressPct}%</span>
                </div>
              </div>
              <Progress value={progressPct} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Phases */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : roadmap ? (
        <div className="space-y-3">
          {roadmap.phases.map((phase, i) => (
            <motion.div key={phase.week} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`bg-card border-border transition-all ${phase.completed ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedWeek(expandedWeek === phase.week ? null : phase.week)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm border-2 ${
                    phase.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-muted border-border text-muted-foreground'
                  }`}>
                    {phase.completed ? <CheckCircle2 className="w-5 h-5" /> : phase.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Week {phase.week}: {phase.title}</p>
                      {phase.completed && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Done</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{phase.skills.length} skills · {phase.projects.length} project</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={phase.completed}
                        onCheckedChange={checked => toggleWeek(phase.week, !!checked)}
                        className="border-border data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </div>
                    {expandedWeek === phase.week ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedWeek === phase.week && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-border grid sm:grid-cols-2 gap-4 mt-0 pt-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-semibold text-foreground">Skills to Learn</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {phase.skills.map(s => (
                              <Badge key={s} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{s}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs font-semibold text-foreground">Project</span>
                          </div>
                          {phase.projects.map((p, pi) => (
                            <div key={pi} className="flex items-start gap-2 p-2 bg-accent/5 border border-accent/20 rounded-lg">
                              <Trophy className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                              <p className="text-xs text-foreground">{p}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="p-12 text-center">
            <Map className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">No roadmap yet</p>
            <p className="text-sm text-muted-foreground mb-4">Select your target role and generate a personalized 8-week learning plan</p>
            <Button onClick={generateRoadmap} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
              Generate My Roadmap
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
