import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, Plus, X, Loader2, CheckCircle2, Briefcase, GraduationCap, Code, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'Cloud Architect',
];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal', 'Staff'];

const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST APIs', 'GraphQL',
  'HTML/CSS', 'Tailwind CSS', 'Next.js', 'Vue.js', 'Angular',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'Terraform', 'Linux', 'Bash', 'Figma', 'Agile/Scrum',
];

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [targetRole, setTargetRole] = useState(profile?.targetRole || '');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'Entry Level');
  const [bio, setBio] = useState(profile?.bio || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState<string[]>(profile?.experience || []);
  const [newExp, setNewExp] = useState('');

  useEffect(() => {
    if (profile) {
      setTargetRole(profile.targetRole || '');
      setExperienceLevel(profile.experienceLevel || 'Entry Level');
      setBio(profile.bio || '');
      setEducation(profile.education || '');
      setSkills(profile.skills || []);
      setExperience(profile.experience || []);
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ targetRole, experienceLevel, bio, education, skills, experience });
      setSaved(true);
      toast.success('Profile saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function addSkill(skill: string) {
    const s = skill.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setNewSkill('');
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill));
  }

  function addExperience() {
    if (newExp.trim() && !experience.includes(newExp.trim())) {
      setExperience(prev => [...prev, newExp.trim()]);
      setNewExp('');
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Profile & Settings</h2>
          <p className="text-muted-foreground mt-1">Keep your profile updated for better AI recommendations.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {targetRole && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{targetRole}</Badge>}
                {experienceLevel && <Badge variant="secondary" className="text-xs">{experienceLevel}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="career">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="career" className="gap-2"><Target className="w-3.5 h-3.5" />Career Goals</TabsTrigger>
          <TabsTrigger value="skills" className="gap-2"><Code className="w-3.5 h-3.5" />Skills</TabsTrigger>
          <TabsTrigger value="experience" className="gap-2"><Briefcase className="w-3.5 h-3.5" />Experience</TabsTrigger>
          <TabsTrigger value="education" className="gap-2"><GraduationCap className="w-3.5 h-3.5" />Education</TabsTrigger>
        </TabsList>

        {/* Career Goals */}
        <TabsContent value="career" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Career Goals</CardTitle>
              <CardDescription>This helps us personalize your roadmap, skill gap analysis, and job matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select your target role..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {EXPERIENCE_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional Bio</Label>
                <Textarea
                  placeholder="Tell us about yourself, your background, and your career goals..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="bg-background border-border resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Your Skills</CardTitle>
              <CardDescription>Add your technical and professional skills for accurate skill gap analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Add skill */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g. React, Python, Docker)..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)}
                  className="bg-background border-border"
                />
                <Button onClick={() => addSkill(newSkill)} variant="outline" className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              {/* Current skills */}
              {skills.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{skills.length} skills added</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 gap-1.5 pr-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested skills */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Suggested skills — click to add:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(s => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Work Experience</CardTitle>
              <CardDescription>Add your work experience entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Frontend Developer at Acme Corp (2022-2024)"
                  value={newExp}
                  onChange={e => setNewExp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addExperience()}
                  className="bg-background border-border"
                />
                <Button onClick={addExperience} variant="outline" className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {experience.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No experience added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {experience.map((exp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-foreground flex-1">{exp}</p>
                      <button onClick={() => setExperience(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Education</CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Education Background</Label>
                <Textarea
                  placeholder="e.g. B.S. Computer Science, MIT (2020)&#10;AWS Certified Solutions Architect (2023)&#10;Google Data Analytics Certificate (2022)"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="bg-background border-border resize-none"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">List your degrees, certifications, and relevant courses</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Profile Saved!' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}
