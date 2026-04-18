import type { Request, Response } from 'express';
import { db, generateId } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

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
  'excel', 'tableau', 'power bi', 'analytics',
];

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { jobDescription, resumeContent } = req.body;
  if (!jobDescription) return res.status(400).json({ error: 'Job description is required' });

  const lower = (text: string) => text.toLowerCase();
  const jdSkills = ALL_SKILLS.filter(s => lower(jobDescription).includes(s));
  const resumeSkills = resumeContent ? ALL_SKILLS.filter(s => lower(resumeContent).includes(s)) : [];

  const profile = db.profiles.find(p => p.userId === userId);
  const profileSkills = profile?.skills?.map(s => s.toLowerCase()) || [];
  const allUserSkills = [...new Set([...resumeSkills, ...profileSkills])];

  const matchedSkills = jdSkills.filter(s => allUserSkills.includes(s));
  const missingSkills = jdSkills.filter(s => !allUserSkills.includes(s));
  const matchScore = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;

  const improvements: string[] = [];
  if (missingSkills.length > 0) improvements.push(`Add these missing skills to your resume: ${missingSkills.slice(0, 3).join(', ')}`);
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
}
