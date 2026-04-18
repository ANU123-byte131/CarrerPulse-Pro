import { useState } from 'react';
import { apiRequest } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Loader2, CheckCircle2, XCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  improvements: string[];
  requiredSkills: string[];
}

function MatchGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#6366f1' : '#f97316';
  const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Good Match' : 'Weak Match';
  return (
    <div className="text-center space-y-3">
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(225 13% 18%)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 54}
            initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 54 - (score / 100) * 2 * Math.PI * 54 }}
            transition={{ duration: 1.2, ease: 'easeOut' as const }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground">{score}%</span>
          <span className="text-xs text-muted-foreground">Match</span>
        </div>
      </div>
      <Badge style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }} className="border text-sm px-3 py-1">{label}</Badge>
    </div>
  );
}

export default function JobMatchPage() {
  const [jobDesc, setJobDesc] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!jobDesc.trim()) { toast.error('Please paste a job description'); return; }
    setLoading(true);
    try {
      const res = await apiRequest('/api/jobmatch/analyze', {
        method: 'POST',
        body: JSON.stringify({ jobDescription: jobDesc, resumeContent }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
      toast.success('Job match analysis complete!');
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Job Match Analyzer</h2>
        <p className="text-muted-foreground mt-1">Paste a job description to see how well your skills match and what you need to improve.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Job Description
              </CardTitle>
              <CardDescription>Paste the full job posting you want to apply for</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here...&#10;&#10;Include requirements, responsibilities, and qualifications for the most accurate analysis."
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                className="min-h-[200px] bg-background border-border text-sm resize-none"
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Your Resume (Optional)</CardTitle>
              <CardDescription>Paste your resume for a more accurate match — otherwise we use your profile skills</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your resume here (optional)..."
                value={resumeContent}
                onChange={e => setResumeContent(e.target.value)}
                className="min-h-[140px] bg-background border-border text-sm resize-none"
              />
            </CardContent>
          </Card>

          <Button onClick={handleAnalyze} disabled={loading || !jobDesc.trim()} className="w-full gap-2" size="lg">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing Match...</> : <><Target className="w-4 h-4" />Analyze Job Match</>}
          </Button>
        </div>

        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <MatchGauge score={result.matchScore} />
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {[
                        { label: 'Required Skills', value: result.requiredSkills.length, color: 'text-foreground' },
                        { label: 'You Have', value: result.matchedSkills.length, color: 'text-green-500' },
                        { label: 'Missing', value: result.missingSkills.length, color: 'text-orange-500' },
                      ].map(s => (
                        <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Matched Skills */}
                {result.matchedSkills.length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-4 h-4" /> Skills You Have ({result.matchedSkills.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {result.matchedSkills.map(s => (
                          <Badge key={s} className="bg-green-500/10 text-green-400 border-green-500/20 capitalize">{s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Missing Skills */}
                {result.missingSkills.length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-500">
                        <XCircle className="w-4 h-4" /> Skills to Learn ({result.missingSkills.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map(s => (
                          <Badge key={s} className="bg-orange-500/10 text-orange-400 border-orange-500/20 capitalize">{s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Improvements */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <Lightbulb className="w-4 h-4" /> Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {result.improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{imp}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-card border-border border-dashed h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Target className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Paste a job description and click Analyze to see your match score</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
