import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { authMiddleware } from './auth.js';
import { ROLE_SKILLS } from './skillgap.js';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = db.users.find(u => u.id === userId);
  const profile = db.profiles.find(p => p.userId === userId);
  const resume = db.resumes.find(r => r.userId === userId);
  const apps = db.applications.filter(a => a.userId === userId);
  const roadmap = db.roadmaps.find(r => r.userId === userId);

  // Application stats
  const total = apps.length;
  const interviewing = apps.filter(a => a.status === 'Interviewing').length;
  const offers = apps.filter(a => a.status === 'Offer').length;
  const rejected = apps.filter(a => a.status === 'Rejected').length;
  const responseRate = total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0;

  // Job Readiness Score
  const targetRole = profile?.targetRole || 'Full Stack Developer';
  const userSkills = profile?.skills || [];
  const roleSkills = ROLE_SKILLS[targetRole] || ROLE_SKILLS['Full Stack Developer'];

  let jobReadinessScore = 0;
  if (userSkills.length > 0 && roleSkills.length > 0) {
    const matched = roleSkills.filter(rs =>
      userSkills.some(us => us.toLowerCase().includes(rs.skill.toLowerCase().split('/')[0].trim()))
    );
    jobReadinessScore = Math.round((matched.length / roleSkills.length) * 100);
    // Boost if resume analyzed
    if (resume) jobReadinessScore = Math.min(100, jobReadinessScore + 10);
  } else if (resume) {
    jobReadinessScore = Math.round(resume.atsScore * 0.7);
  }

  // Skill progress (top 6 skills for target role)
  const skillProgress = roleSkills.slice(0, 6).map(rs => {
    const hasSkill = userSkills.some(us =>
      us.toLowerCase().includes(rs.skill.toLowerCase().split('/')[0].trim())
    );
    return {
      skill: rs.skill,
      userLevel: hasSkill ? Math.floor(Math.random() * 20) + 65 : Math.floor(Math.random() * 25) + 15,
      required: rs.required,
    };
  });

  // Recent activity
  const recentActivity: { action: string; time: string; type: string }[] = [];
  if (resume) {
    recentActivity.push({ action: `Resume analyzed — ATS Score: ${resume.atsScore}`, time: resume.createdAt, type: 'resume' });
  }
  apps.slice(-3).forEach(app => {
    recentActivity.push({ action: `Applied to ${app.jobTitle} at ${app.company}`, time: app.appliedDate, type: 'application' });
  });
  if (roadmap) {
    const completedWeeks = roadmap.phases.filter(p => p.completed).length;
    if (completedWeeks > 0) {
      recentActivity.push({ action: `Completed Week ${completedWeeks} of career roadmap`, time: roadmap.createdAt, type: 'roadmap' });
    }
  }
  recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Days active
  const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysActive = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

  // Skills learned (skills in profile)
  const skillsLearned = userSkills.length;

  res.json({
    resumeScore: resume?.atsScore || 0,
    jobReadinessScore,
    applicationStats: { total, interviewing, offers, rejected, responseRate },
    skillProgress,
    recentActivity: recentActivity.slice(0, 5),
    targetRole,
    daysActive,
    skillsLearned,
    userName: user?.name || 'User',
  });
});

export default router;
