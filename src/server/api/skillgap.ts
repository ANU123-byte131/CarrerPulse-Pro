import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { authMiddleware } from './auth.js';

const router = Router();

export const ROLE_SKILLS: Record<string, { skill: string; required: number; category: string }[]> = {
  'Frontend Developer': [
    { skill: 'JavaScript', required: 90, category: 'Core' },
    { skill: 'TypeScript', required: 75, category: 'Core' },
    { skill: 'React', required: 85, category: 'Framework' },
    { skill: 'HTML/CSS', required: 80, category: 'Core' },
    { skill: 'Tailwind CSS', required: 65, category: 'Styling' },
    { skill: 'Git', required: 80, category: 'Tools' },
    { skill: 'REST APIs', required: 75, category: 'Integration' },
    { skill: 'Testing (Jest)', required: 60, category: 'Quality' },
    { skill: 'Next.js', required: 65, category: 'Framework' },
    { skill: 'Figma', required: 50, category: 'Design' },
  ],
  'Backend Developer': [
    { skill: 'Node.js / Python', required: 85, category: 'Core' },
    { skill: 'SQL / PostgreSQL', required: 80, category: 'Database' },
    { skill: 'REST API Design', required: 85, category: 'Architecture' },
    { skill: 'Docker', required: 70, category: 'DevOps' },
    { skill: 'Redis', required: 60, category: 'Database' },
    { skill: 'Git', required: 80, category: 'Tools' },
    { skill: 'AWS / Cloud', required: 65, category: 'Cloud' },
    { skill: 'Microservices', required: 60, category: 'Architecture' },
    { skill: 'Testing', required: 70, category: 'Quality' },
    { skill: 'Security', required: 65, category: 'Security' },
  ],
  'Full Stack Developer': [
    { skill: 'JavaScript / TypeScript', required: 85, category: 'Core' },
    { skill: 'React', required: 80, category: 'Frontend' },
    { skill: 'Node.js', required: 80, category: 'Backend' },
    { skill: 'SQL / MongoDB', required: 75, category: 'Database' },
    { skill: 'REST APIs', required: 80, category: 'Integration' },
    { skill: 'Docker', required: 65, category: 'DevOps' },
    { skill: 'Git', required: 85, category: 'Tools' },
    { skill: 'AWS / Cloud', required: 60, category: 'Cloud' },
    { skill: 'Testing', required: 65, category: 'Quality' },
    { skill: 'HTML/CSS', required: 75, category: 'Frontend' },
  ],
  'Data Scientist': [
    { skill: 'Python', required: 90, category: 'Core' },
    { skill: 'Machine Learning', required: 85, category: 'ML' },
    { skill: 'Pandas / NumPy', required: 85, category: 'Data' },
    { skill: 'SQL', required: 75, category: 'Database' },
    { skill: 'Scikit-learn', required: 80, category: 'ML' },
    { skill: 'Data Visualization', required: 70, category: 'Analysis' },
    { skill: 'Statistics', required: 80, category: 'Math' },
    { skill: 'TensorFlow / PyTorch', required: 65, category: 'Deep Learning' },
    { skill: 'Git', required: 70, category: 'Tools' },
    { skill: 'Communication', required: 75, category: 'Soft Skills' },
  ],
  'ML Engineer': [
    { skill: 'Python', required: 90, category: 'Core' },
    { skill: 'TensorFlow / PyTorch', required: 85, category: 'Deep Learning' },
    { skill: 'Machine Learning', required: 90, category: 'ML' },
    { skill: 'Docker / Kubernetes', required: 75, category: 'MLOps' },
    { skill: 'AWS / GCP', required: 70, category: 'Cloud' },
    { skill: 'MLOps / CI/CD', required: 70, category: 'MLOps' },
    { skill: 'SQL', required: 65, category: 'Database' },
    { skill: 'Git', required: 80, category: 'Tools' },
    { skill: 'Statistics', required: 80, category: 'Math' },
    { skill: 'Distributed Systems', required: 60, category: 'Systems' },
  ],
  'DevOps Engineer': [
    { skill: 'Docker', required: 90, category: 'Containers' },
    { skill: 'Kubernetes', required: 85, category: 'Orchestration' },
    { skill: 'AWS / Azure / GCP', required: 85, category: 'Cloud' },
    { skill: 'Terraform', required: 75, category: 'IaC' },
    { skill: 'CI/CD (Jenkins/GitHub Actions)', required: 85, category: 'Automation' },
    { skill: 'Linux / Bash', required: 80, category: 'OS' },
    { skill: 'Monitoring (Prometheus/Grafana)', required: 70, category: 'Observability' },
    { skill: 'Git', required: 85, category: 'Tools' },
    { skill: 'Networking', required: 70, category: 'Infrastructure' },
    { skill: 'Security', required: 65, category: 'Security' },
  ],
  'Product Manager': [
    { skill: 'Product Strategy', required: 85, category: 'Core' },
    { skill: 'Agile / Scrum', required: 80, category: 'Process' },
    { skill: 'Data Analysis', required: 75, category: 'Analytics' },
    { skill: 'User Research', required: 80, category: 'Research' },
    { skill: 'Roadmap Planning', required: 85, category: 'Planning' },
    { skill: 'Stakeholder Management', required: 80, category: 'Communication' },
    { skill: 'Figma / Prototyping', required: 65, category: 'Design' },
    { skill: 'SQL / Analytics Tools', required: 65, category: 'Data' },
    { skill: 'Communication', required: 90, category: 'Soft Skills' },
    { skill: 'Technical Understanding', required: 70, category: 'Technical' },
  ],
  'UI/UX Designer': [
    { skill: 'Figma', required: 90, category: 'Tools' },
    { skill: 'User Research', required: 85, category: 'Research' },
    { skill: 'Wireframing', required: 85, category: 'Design' },
    { skill: 'Prototyping', required: 80, category: 'Design' },
    { skill: 'Design Systems', required: 75, category: 'Systems' },
    { skill: 'HTML / CSS', required: 65, category: 'Technical' },
    { skill: 'Accessibility', required: 70, category: 'Standards' },
    { skill: 'Visual Design', required: 80, category: 'Design' },
    { skill: 'Usability Testing', required: 75, category: 'Research' },
    { skill: 'Communication', required: 80, category: 'Soft Skills' },
  ],
  'Mobile Developer': [
    { skill: 'Swift / Kotlin', required: 85, category: 'Core' },
    { skill: 'React Native / Flutter', required: 75, category: 'Cross-Platform' },
    { skill: 'REST APIs', required: 80, category: 'Integration' },
    { skill: 'Git', required: 80, category: 'Tools' },
    { skill: 'Testing', required: 70, category: 'Quality' },
    { skill: 'App Store Deployment', required: 65, category: 'Deployment' },
    { skill: 'UI/UX Principles', required: 70, category: 'Design' },
    { skill: 'Performance Optimization', required: 65, category: 'Performance' },
    { skill: 'Push Notifications', required: 60, category: 'Features' },
    { skill: 'CI/CD', required: 60, category: 'DevOps' },
  ],
  'Cloud Architect': [
    { skill: 'AWS / Azure / GCP', required: 90, category: 'Cloud' },
    { skill: 'Terraform / IaC', required: 85, category: 'IaC' },
    { skill: 'Kubernetes', required: 80, category: 'Orchestration' },
    { skill: 'Microservices', required: 80, category: 'Architecture' },
    { skill: 'Serverless', required: 75, category: 'Architecture' },
    { skill: 'Security / IAM', required: 85, category: 'Security' },
    { skill: 'Networking', required: 80, category: 'Infrastructure' },
    { skill: 'Cost Optimization', required: 70, category: 'FinOps' },
    { skill: 'Monitoring / Observability', required: 75, category: 'Operations' },
    { skill: 'System Design', required: 85, category: 'Architecture' },
  ],
};

function calculateUserSkillLevel(userSkills: string[], skillName: string): number {
  const lower = skillName.toLowerCase();
  const found = userSkills.some(s => s.toLowerCase().includes(lower) || lower.includes(s.toLowerCase()));
  if (found) return Math.floor(Math.random() * 20) + 65; // 65-85 if they have it
  return Math.floor(Math.random() * 25) + 10; // 10-35 if they don't
}

// GET /api/skillgap/:targetRole
router.get('/:targetRole', authMiddleware, (req: Request, res: Response) => {
  const { targetRole } = req.params;
  const decodedRole = decodeURIComponent(targetRole);
  const skills = ROLE_SKILLS[decodedRole];
  if (!skills) {
    return res.status(404).json({ error: 'Role not found', availableRoles: Object.keys(ROLE_SKILLS) });
  }
  res.json({ role: decodedRole, skills });
});

// POST /api/skillgap/calculate
router.post('/calculate', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { targetRole, userSkills: providedSkills } = req.body;

  const profile = db.profiles.find(p => p.userId === userId);
  const userSkills = providedSkills || profile?.skills || [];
  const role = targetRole || profile?.targetRole || 'Full Stack Developer';

  const roleSkills = ROLE_SKILLS[role] || ROLE_SKILLS['Full Stack Developer'];

  const skillAnalysis = roleSkills.map(rs => {
    const userLevel = calculateUserSkillLevel(userSkills, rs.skill);
    const gap = Math.max(0, rs.required - userLevel);
    const priority = gap > 40 ? 'High' : gap > 20 ? 'Medium' : 'Low';
    return {
      skill: rs.skill,
      userLevel,
      required: rs.required,
      gap,
      priority,
      category: rs.category,
    };
  });

  // Job Readiness Score
  const totalRequired = roleSkills.reduce((sum, s) => sum + s.required, 0);
  const totalUser = skillAnalysis.reduce((sum, s) => sum + Math.min(s.userLevel, s.required), 0);
  const jobReadinessScore = Math.round((totalUser / totalRequired) * 100);

  const missingSkills = skillAnalysis.filter(s => s.gap > 30);

  res.json({ role, skillAnalysis, jobReadinessScore, missingSkills });
});

export default router;
