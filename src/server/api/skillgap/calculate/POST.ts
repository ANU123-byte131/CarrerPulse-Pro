import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';
import { ROLE_SKILLS } from '../../skillgapData.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { targetRole, userSkills: providedSkills } = req.body;
  const profile = db.profiles.find(p => p.userId === userId);
  const userSkills: string[] = providedSkills || profile?.skills || [];
  const role = targetRole || profile?.targetRole || 'Full Stack Developer';
  const roleSkills = ROLE_SKILLS[role] || ROLE_SKILLS['Full Stack Developer'];

  const skillAnalysis = roleSkills.map(rs => {
    const hasSkill = userSkills.some(us =>
      us.toLowerCase().includes(rs.skill.toLowerCase().split('/')[0].trim()) ||
      rs.skill.toLowerCase().includes(us.toLowerCase())
    );
    const userLevel = hasSkill ? Math.floor(Math.random() * 20) + 65 : Math.floor(Math.random() * 25) + 10;
    const gap = Math.max(0, rs.required - userLevel);
    const priority = gap > 40 ? 'High' : gap > 20 ? 'Medium' : 'Low';
    return { skill: rs.skill, userLevel, required: rs.required, gap, priority, category: rs.category };
  });

  const totalRequired = roleSkills.reduce((sum, s) => sum + s.required, 0);
  const totalUser = skillAnalysis.reduce((sum, s) => sum + Math.min(s.userLevel, s.required), 0);
  const jobReadinessScore = Math.round((totalUser / totalRequired) * 100);
  const missingSkills = skillAnalysis.filter(s => s.gap > 30);

  res.json({ role, skillAnalysis, jobReadinessScore, missingSkills });
}
