import { Router, Request, Response } from 'express';
import { db, generateId } from './db.js';
import { authMiddleware } from './auth.js';

const router = Router();

const ALL_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'vue', 'angular', 'nextjs', 'nuxt', 'svelte', 'redux', 'mobx', 'zustand',
  'nodejs', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails', 'laravel',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'sqlite',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd',
  'git', 'github', 'gitlab', 'linux', 'bash',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'figma', 'sketch',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'rest api', 'graphql', 'grpc', 'websocket', 'microservices', 'serverless',
  'agile', 'scrum', 'kanban', 'jira',
  'testing', 'jest', 'cypress', 'selenium', 'unit testing', 'tdd',
  'data structures', 'algorithms', 'system design', 'oop',
  'communication', 'leadership', 'teamwork', 'problem solving',
  'excel', 'tableau', 'power bi', 'looker', 'analytics',
];

function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return ALL_SKILLS.filter(skill => lower.includes(skill));
}

// POST /api/jobmatch/analyze
router.post('/analyze', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { jobDescription, resumeContent } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  const jdSkills = extractSkillsFromText(jobDescription);
  const resumeSkills = resumeContent ? extractSkillsFromText(resumeContent) : [];

  // Also check user profile skills
  const profile = db.profiles.find(p => p.userId === userId);
  const profileSkills = profile?.skills?.map(s => s.toLowerCase()) || [];
  const allUserSkills = [...new Set([...resumeSkills, ...profileSkills])];

  const matchedSkills = jdSkills.filter(skill => allUserSkills.includes(skill));
  const missingSkills = jdSkills.filter(skill => !allUserSkills.includes(skill));

  const matchScore = jdSkills.length > 0
    ? Math.round((matchedSkills.length / jdSkills.length) * 100)
    : 0;

  // Generate improvements
  const improvements: string[] = [];
  if (missingSkills.length > 0) {
    improvements.push(`Add these missing skills to your resume: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (matchScore < 50) {
    improvements.push('Your resume needs significant alignment with this job description');
    improvements.push('Consider taking online courses to fill the skill gaps');
  } else if (matchScore < 75) {
    improvements.push('Good foundation — focus on the missing skills to strengthen your application');
    improvements.push('Tailor your resume summary to mirror the job description language');
  } else {
    improvements.push('Strong match! Highlight your most relevant experience in your cover letter');
    improvements.push('Quantify your achievements to stand out from other candidates');
  }
  improvements.push('Use keywords from the job description verbatim in your resume');
  improvements.push('Ensure your experience section uses action verbs that match the JD');

  const jd = {
    id: generateId(),
    userId,
    content: jobDescription,
    requiredSkills: jdSkills,
    matchScore,
    missingSkills,
    createdAt: new Date().toISOString(),
  };
  const idx = db.jobDescriptions.findIndex(j => j.userId === userId);
  if (idx !== -1) db.jobDescriptions.splice(idx, 1);
  db.jobDescriptions.push(jd);

  res.json({ matchScore, matchedSkills, missingSkills, improvements, requiredSkills: jdSkills });
});

// GET /api/jobmatch/latest
router.get('/latest', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const jd = db.jobDescriptions.find(j => j.userId === userId);
  if (!jd) return res.status(404).json({ error: 'No job match found' });
  res.json(jd);
});

export default router;
