import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Plus, Search, Trash2, Edit2, TrendingUp, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type Status = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: Status;
  appliedDate: string;
  notes: string;
}

const STATUS_CONFIG: Record<Status, { color: string; bg: string; icon: any }> = {
  Applied: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Clock },
  Interviewing: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: TrendingUp },
  Offer: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle2 },
  Rejected: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({ jobTitle: '', company: '', status: 'Applied' as Status, notes: '' });

  useEffect(() => {
    fetchApps();
    fetchStats();
  }, []);

  async function fetchApps() {
    try {
      const res = await apiRequest('/api/applications');
      if (res.ok) setApps(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    const res = await apiRequest('/api/applications/stats');
    if (res.ok) setStats(await res.json());
  }

  async function handleAdd() {
    if (!form.jobTitle || !form.company) { toast.error('Job title and company are required'); return; }
    setSaving(true);
    try {
      const res = await apiRequest('/api/applications', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const newApp = await res.json();
      setApps(prev => [newApp, ...prev]);
      setShowAdd(false);
      setForm({ jobTitle: '', company: '', status: 'Applied', notes: '' });
      toast.success('Application added!');
      fetchStats();
    } catch {
      toast.error('Failed to add application');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editApp) return;
    setSaving(true);
    try {
      const res = await apiRequest(`/api/applications/${editApp.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: editApp.status, notes: editApp.notes, jobTitle: editApp.jobTitle, company: editApp.company }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setApps(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditApp(null);
      toast.success('Application updated!');
      fetchStats();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/applications/${id}`, { method: 'DELETE' });
      setApps(prev => prev.filter(a => a.id !== id));
      toast.success('Application removed');
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  }

  const filtered = apps.filter(a => {
    const matchSearch = a.jobTitle.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Application Tracker</h2>
          <p className="text-muted-foreground mt-1">Track every job application and monitor your pipeline.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Application
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Applied', value: stats.total, color: 'text-blue-400' },
            { label: 'Interviewing', value: stats.interviewing, color: 'text-yellow-400' },
            { label: 'Offers', value: stats.offers, color: 'text-green-400' },
            { label: 'Response Rate', value: `${stats.responseRate}%`, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interviewing">Interviewing</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="p-12 text-center">
            <Briefcase className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">{apps.length === 0 ? 'No applications yet' : 'No results found'}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {apps.length === 0 ? 'Start tracking your job applications to monitor your progress' : 'Try adjusting your search or filter'}
            </p>
            {apps.length === 0 && (
              <Button onClick={() => setShowAdd(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Your First Application
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((app, i) => {
              const cfg = STATUS_CONFIG[app.status];
              const Icon = cfg.icon;
              return (
                <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{app.jobTitle}</p>
                            <span className="text-muted-foreground text-sm">at</span>
                            <p className="text-sm text-foreground">{app.company}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={`text-xs border ${cfg.bg} ${cfg.color} gap-1`}>
                              <Icon className="w-3 h-3" />{app.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(app.appliedDate)}</span>
                            {app.notes && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{app.notes}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditApp(app)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(app.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input placeholder="e.g. Frontend Developer" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input placeholder="e.g. Google" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="bg-background border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Status }))}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {(['Applied', 'Interviewing', 'Offer', 'Rejected'] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea placeholder="Add any notes about this application..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-background border-border resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editApp} onOpenChange={() => setEditApp(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Application</DialogTitle>
          </DialogHeader>
          {editApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={editApp.jobTitle} onChange={e => setEditApp(a => a ? { ...a, jobTitle: e.target.value } : null)} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={editApp.company} onChange={e => setEditApp(a => a ? { ...a, company: e.target.value } : null)} className="bg-background border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editApp.status} onValueChange={v => setEditApp(a => a ? { ...a, status: v as Status } : null)}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(['Applied', 'Interviewing', 'Offer', 'Rejected'] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={editApp.notes} onChange={e => setEditApp(a => a ? { ...a, notes: e.target.value } : null)} className="bg-background border-border resize-none" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditApp(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
