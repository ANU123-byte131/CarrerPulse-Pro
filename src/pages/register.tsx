import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const features = [
    'AI-powered resume analysis & ATS scoring',
    'Personalized career roadmap generator',
    'Interview prep with real-time feedback',
    'Job application tracker',
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      <div className="w-full max-w-4xl relative grid md:grid-cols-2 gap-8 items-center">
        {/* Left side */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground text-xl">CareerPulse</span>
              <span className="text-primary text-xl font-bold"> Pro</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Accelerate your<br />tech career today
            </h2>
            <p className="text-muted-foreground mt-3">
              Join thousands of developers who've landed their dream jobs using AI-powered career tools.
            </p>
          </div>
          <ul className="space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-6 md:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-xl">CareerPulse <span className="text-primary">Pro</span></span>
          </div>
          <Card className="bg-card border-border shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">Create your account</CardTitle>
              <CardDescription className="text-muted-foreground">Free forever — no credit card required</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Alex Johnson" value={name} onChange={e => setName(e.target.value)} required className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className="bg-background border-border" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Get Started Free'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
