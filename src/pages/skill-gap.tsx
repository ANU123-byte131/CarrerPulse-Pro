import { useState, useEffect } from 'react';
import { useAuth, apiRequest } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'Cloud Architect',
];

interface SkillItem {
  skill: string;
  userLevel: number;
  required: number;
  gap: number;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

interface SkillGapResult {
  role: string;
  skillAnalysis: SkillItem[];
  jobReadinessScore: number;
  missingSkills: SkillItem[];
}

function SkillBar({ skill, userLevel, required, gap, priority, delay }: SkillItem & { delay: number }) {
  const pct = Math.min(100, Math.round((userLevel / required) * 100));
  const priorityColor = priority === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/20' : priority === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20';
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-primary' : 'bg-orange-500';

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{skill}</span>
          <Badge className={`text-xs border ${priorityColor} px-1.5 py-0`}>{priority}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{userLevel}% / {required}% needed</span>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: 'easeOut' as const }}
        />
        {/* Required marker */}
        <div className="absolute top-0 right-0 h-full w-0.5 bg-white/20" />
      </div>
      {gap > 0 && (
        <p className="text-xs text-muted-foreground">Gap: {gap}% — {gap > 40 ? 'Focus here first' : gap > 20 ? 'Needs improvement' : 'Almost there!'}</p>
      )}
    </motion.div>
  );
}

export default function SkillGapPage() {
  const { profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState(profile?.targetRole || 'Full Stack Developer');
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.targetRole) setSelectedRole(profile.targetRole);
  }, [profile]);

  async function handleCalculate() {
    setLoading(true);
    try {
      const res = await apiRequest('/api/skillgap/calculate', {
        method: 'POST',
        body: JSON.stringify({ targetRole: selectedRole }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error('Failed to calculate skill gap');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleCalculate();
  }, []);

  const categories = result ? [...new Set(result.skillAnalysis.map(s => s.category))] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Skill Gap Analysis</h2>
          <p className="text-muted-foreground mt-1">See exactly where you stand vs. your target role requirements.</p>
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
          <Button onClick={handleCalculate} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Analyze
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : result ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skill Bars */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Skills vs. {result.role} Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {result.skillAnalysis.map((skill, i) => (
                  <SkillBar key={skill.skill} {...skill} delay={i * 0.05} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel */}
          <div className="space-y-4">
            {/* Readiness Score */}
            <Card className="bg-card border-border">
              <CardContent className="p-5 text-center">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(225 13% 18%)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={result.jobReadinessScore >= 70 ? '#22c55e' : result.jobReadinessScore >= 45 ? '#6366f1' : '#f97316'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 - (result.jobReadinessScore / 100) * 2 * Math.PI * 42 }}
                      transition={{ duration: 1.2, ease: 'easeOut' as const }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{result.jobReadinessScore}%</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">Job Readiness</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.jobReadinessScore >= 70 ? 'Ready to apply!' : result.jobReadinessScore >= 45 ? 'Getting close' : 'Keep learning'}
                </p>
              </CardContent>
            </Card>

            {/* Priority Gaps */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" /> High Priority Gaps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.missingSkills.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">No critical gaps!</span>
                  </div>
                ) : (
                  result.missingSkills.slice(0, 5).map(s => (
                    <div key={s.skill} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <span className="text-xs text-foreground font-medium">{s.skill}</span>
                      <span className="text-xs text-red-400">-{s.gap}%</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">By Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map(cat => {
                  const catSkills = result.skillAnalysis.filter(s => s.category === cat);
                  const avgPct = Math.round(catSkills.reduce((sum, s) => sum + Math.min(100, (s.userLevel / s.required) * 100), 0) / catSkills.length);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{cat}</span>
                        <span className="text-foreground font-medium">{avgPct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${avgPct >= 80 ? 'bg-green-500' : avgPct >= 50 ? 'bg-primary' : 'bg-orange-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${avgPct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
