import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, CheckCircle2, XCircle, AlertCircle, Loader2,
  Zap, Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ResumeResult {
  id: string;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  missingKeywords: string[];
  createdAt: string;
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#6366f1' : '#f97316';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(225 13% 18%)" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' as const }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">ATS Score</span>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    apiRequest('/api/resume/latest')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setResult(d); })
      .finally(() => setFetching(false));
  }, []);

  async function handleAnalyze() {
    if (!content.trim()) { toast.error('Please paste your resume content first'); return; }
    setLoading(true);
    try {
      const res = await apiRequest('/api/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
      toast.success('Resume analyzed successfully!');
    } catch {
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const scoreLabel = result ? (result.atsScore >= 75 ? 'Excellent' : result.atsScore >= 50 ? 'Good' : 'Needs Work') : '';
  const scoreColor = result ? (result.atsScore >= 75 ? 'text-green-500' : result.atsScore >= 50 ? 'text-primary' : 'text-orange-500') : '';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Resume Analyzer</h2>
        <p className="text-muted-foreground mt-1">Paste your resume to get an ATS score, keyword analysis, and actionable improvements.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Paste Your Resume
            </CardTitle>
            <CardDescription>Copy and paste your resume text below for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your full resume content here...&#10;&#10;Include your contact info, summary, work experience, education, and skills sections for the most accurate analysis."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[320px] bg-background border-border text-sm font-mono resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{content.split(/\s+/).filter(Boolean).length} words</span>
              <Button onClick={handleAnalyze} disabled={loading || !content.trim()} className="gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Zap className="w-4 h-4" />Analyze Resume</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Score */}
        <div className="space-y-4">
          {fetching ? (
            <Card className="bg-card border-border"><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ) : result ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <ScoreRing score={result.atsScore} />
                    <p className={`text-lg font-bold mt-2 ${scoreColor}`}>{scoreLabel}</p>
                    <p className="text-xs text-muted-foreground">ATS Compatibility Score</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Keywords Found', value: result.keywords.length, color: 'text-green-500' },
                      { label: 'Missing Keywords', value: result.missingKeywords.length, color: 'text-orange-500' },
                      { label: 'Improvements', value: result.weaknesses.length, color: 'text-primary' },
                    ].map(s => (
                      <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Paste your resume and click Analyze to see your ATS score</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results Tabs */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Tabs defaultValue="strengths">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="strengths" className="gap-2"><CheckCircle2 className="w-3.5 h-3.5" />Strengths ({result.strengths.length})</TabsTrigger>
                <TabsTrigger value="weaknesses" className="gap-2"><XCircle className="w-3.5 h-3.5" />Improvements ({result.weaknesses.length})</TabsTrigger>
                <TabsTrigger value="keywords" className="gap-2"><Tag className="w-3.5 h-3.5" />Keywords</TabsTrigger>
                <TabsTrigger value="missing" className="gap-2"><AlertCircle className="w-3.5 h-3.5" />Missing</TabsTrigger>
              </TabsList>

              <TabsContent value="strengths" className="mt-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5 space-y-3">
                    {result.strengths.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{s}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weaknesses" className="mt-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5 space-y-3">
                    {result.weaknesses.map((w, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{w}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords" className="mt-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-3">These keywords were detected in your resume and will help with ATS matching:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map(kw => (
                        <Badge key={kw} variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20 capitalize">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="missing" className="mt-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-3">Add these keywords to your resume to improve your match rate for your target role:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map(kw => (
                        <Badge key={kw} variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20 capitalize">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
