import { useState } from 'react';
import { useAuth, apiRequest } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Loader2, ChevronRight, CheckCircle2, RotateCcw, Lightbulb, TrendingUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'Cloud Architect',
];

interface Question {
  text: string;
  answer: string;
  feedback: string;
  sampleAnswer: string;
  confidenceScore: number;
  evaluated: boolean;
}

export default function InterviewPage() {
  const { profile } = useAuth();
  const [role, setRole] = useState(profile?.targetRole || 'Full Stack Developer');
  const [type, setType] = useState<'technical' | 'behavioral'>('technical');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  async function startSession() {
    setLoading(true);
    try {
      const res = await apiRequest('/api/interview/questions', {
        method: 'POST',
        body: JSON.stringify({ role, type }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setQuestions(data.questions.map((q: string) => ({
        text: q, answer: '', feedback: '', sampleAnswer: '', confidenceScore: 0, evaluated: false,
      })));
      setCurrentIdx(0);
      setSessionStarted(true);
      setSessionComplete(false);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  async function evaluateAnswer() {
    const q = questions[currentIdx];
    if (!q.answer.trim()) { toast.error('Please write your answer first'); return; }
    setEvaluating(true);
    try {
      const res = await apiRequest('/api/interview/evaluate', {
        method: 'POST',
        body: JSON.stringify({ question: q.text, answer: q.answer }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const updated = [...questions];
      updated[currentIdx] = { ...q, feedback: data.feedback, sampleAnswer: data.sampleAnswer, confidenceScore: data.confidenceScore, evaluated: true };
      setQuestions(updated);
    } catch {
      toast.error('Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSessionComplete(true);
    }
  }

  function resetSession() {
    setSessionStarted(false);
    setSessionComplete(false);
    setQuestions([]);
    setCurrentIdx(0);
  }

  const avgScore = questions.filter(q => q.evaluated).length > 0
    ? Math.round(questions.filter(q => q.evaluated).reduce((sum, q) => sum + q.confidenceScore, 0) / questions.filter(q => q.evaluated).length)
    : 0;

  const currentQ = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + (currentQ?.evaluated ? 1 : 0)) / questions.length) * 100 : 0;

  if (sessionComplete) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h3>
              <p className="text-muted-foreground mb-6">You answered {questions.length} {type} questions for {role}</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">{avgScore}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Avg Confidence</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-500">{questions.filter(q => q.confidenceScore >= 70).length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Strong Answers</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-orange-500">{questions.filter(q => q.confidenceScore < 50).length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Need Practice</div>
                </div>
              </div>

              <div className="space-y-3 text-left mb-8">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      q.confidenceScore >= 70 ? 'bg-green-500/20 text-green-400' : q.confidenceScore >= 50 ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-400'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{q.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Confidence: {q.confidenceScore}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={resetSession} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> New Session
                </Button>
                <Button onClick={startSession} className="gap-2">
                  <MessageSquare className="w-4 h-4" /> Same Role Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interview Prep</h2>
          <p className="text-muted-foreground mt-1">Practice with real interview questions and get AI-powered feedback on your answers.</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Configure Your Session</CardTitle>
            <CardDescription>Choose your target role and interview type to get relevant questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Interview Type</label>
                <Select value={type} onValueChange={v => setType(v as any)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="technical">Technical Questions</SelectItem>
                    <SelectItem value="behavioral">Behavioral Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: MessageSquare, label: '5 Questions', desc: 'Curated for your role' },
                { icon: Lightbulb, label: 'AI Feedback', desc: 'Instant evaluation' },
                { icon: TrendingUp, label: 'Confidence Score', desc: 'Track improvement' },
              ].map(f => (
                <div key={f.label} className="p-3 bg-muted/30 rounded-xl text-center">
                  <f.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>

            <Button onClick={startSession} disabled={loading} className="w-full gap-2" size="lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Loading Questions...</> : <><MessageSquare className="w-4 h-4" />Start Interview Session</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{role} — {type === 'technical' ? 'Technical' : 'Behavioral'} Interview</h2>
          <p className="text-xs text-muted-foreground">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSession} className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      <Progress value={progress} className="h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-5">
              {/* Question */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{currentIdx + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{currentQ?.text}</p>
                </div>
              </div>

              {/* Answer */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Answer</label>
                <Textarea
                  placeholder="Type your answer here... Be specific, use examples, and structure your response clearly."
                  value={currentQ?.answer || ''}
                  onChange={e => {
                    const updated = [...questions];
                    updated[currentIdx] = { ...updated[currentIdx], answer: e.target.value };
                    setQuestions(updated);
                  }}
                  disabled={currentQ?.evaluated}
                  className="min-h-[140px] bg-background border-border text-sm resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{currentQ?.answer.split(/\s+/).filter(Boolean).length || 0} words</span>
                  {!currentQ?.evaluated && (
                    <Button onClick={evaluateAnswer} disabled={evaluating || !currentQ?.answer.trim()} size="sm" className="gap-2">
                      {evaluating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Evaluating...</> : <><Star className="w-3.5 h-3.5" />Get Feedback</>}
                    </Button>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {currentQ?.evaluated && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <span className="text-sm font-medium text-foreground">Confidence Score</span>
                      <div className="flex items-center gap-3">
                        <Progress value={currentQ.confidenceScore} className="w-24 h-2" />
                        <span className={`text-sm font-bold ${currentQ.confidenceScore >= 70 ? 'text-green-500' : currentQ.confidenceScore >= 50 ? 'text-primary' : 'text-orange-500'}`}>
                          {currentQ.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    <Tabs defaultValue="feedback">
                      <TabsList className="bg-muted border border-border">
                        <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                        <TabsTrigger value="sample">Sample Answer</TabsTrigger>
                      </TabsList>
                      <TabsContent value="feedback" className="mt-3">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground leading-relaxed">{currentQ.feedback}</p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="sample" className="mt-3">
                        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground leading-relaxed">{currentQ.sampleAnswer}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button onClick={nextQuestion} className="w-full gap-2">
                      {currentIdx < questions.length - 1 ? <><ChevronRight className="w-4 h-4" />Next Question</> : <><CheckCircle2 className="w-4 h-4" />Finish Session</>}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
