import type { Request, Response } from 'express';
import { db, generateId } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

const TECH_KEYWORDS = [
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
];

const ROLE_KEYWORDS: Record<string, string[]> = {
  'Frontend Developer': ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux', 'nextjs', 'testing', 'git'],
  'Backend Developer': ['nodejs', 'python', 'java', 'sql', 'postgresql', 'redis', 'docker', 'rest api', 'microservices', 'git'],
  'Full Stack Developer': ['react', 'nodejs', 'javascript', 'typescript', 'sql', 'mongodb', 'docker', 'git', 'rest api', 'html'],
  'Data Scientist': ['python', 'machine learning', 'pandas', 'numpy', 'scikit-learn', 'sql', 'tensorflow'],
  'ML Engineer': ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'docker', 'kubernetes'],
  'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'linux', 'bash'],
  'Product Manager': ['agile', 'scrum', 'jira', 'figma', 'analytics'],
  'UI/UX Designer': ['figma', 'sketch', 'css', 'html'],
  'Mobile Developer': ['swift', 'kotlin', 'react', 'javascript', 'git', 'rest api'],
  'Cloud Architect': ['aws', 'azure', 'gcp', 'terraform', 'kubernetes', 'docker', 'microservices'],
};

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { content } = req.body;
  if (!content || content.trim().length < 10) {
    return res.status(400).json({ error: 'Resume content is required' });
  }

  const lower = content.toLowerCase();
  const foundKeywords = TECH_KEYWORDS.filter(kw => lower.includes(kw));

  let atsScore = 40;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(content);
  const hasSkillsSection = /skills|technologies|tech stack|competencies/i.test(content);
  const hasExperienceSection = /experience|work history|employment|projects/i.test(content);
  const hasEducationSection = /education|degree|university|college|bachelor|master/i.test(content);
  const hasSummary = /summary|objective|profile|about/i.test(content);

  if (hasEmail) atsScore += 5;
  if (hasPhone) atsScore += 5;
  if (hasSkillsSection) atsScore += 10;
  if (hasExperienceSection) atsScore += 10;
  if (hasEducationSection) atsScore += 3;
  if (hasSummary) atsScore += 2;
  atsScore += Math.min(20, Math.floor((foundKeywords.length / 5) * 4));
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) atsScore += 5;
  else if (wordCount >= 150) atsScore += 3;
  atsScore = Math.min(100, atsScore);

  const strengths: string[] = [];
  if (hasEmail && hasPhone) strengths.push('Contact information is complete and clearly visible');
  if (foundKeywords.length >= 10) strengths.push(`Strong technical keyword presence (${foundKeywords.length} skills detected)`);
  if (hasExperienceSection) strengths.push('Work experience section is well-structured');
  if (hasSkillsSection) strengths.push('Dedicated skills section improves ATS parsing');
  if (hasEducationSection) strengths.push('Education background is clearly presented');
  if (wordCount >= 300) strengths.push('Resume has good content depth and detail');
  if (hasSummary) strengths.push('Professional summary provides strong first impression');
  if (strengths.length === 0) strengths.push('Resume content has been successfully parsed');

  const weaknesses: string[] = [];
  if (!hasEmail) weaknesses.push('Missing email address — critical for ATS and recruiter contact');
  if (!hasPhone) weaknesses.push('Phone number not detected — add for complete contact info');
  if (!hasSkillsSection) weaknesses.push('No dedicated skills section — ATS systems may miss your abilities');
  if (!hasExperienceSection) weaknesses.push('Work experience section not clearly labeled');
  if (!hasSummary) weaknesses.push('Add a professional summary to make a strong first impression');
  if (wordCount < 200) weaknesses.push('Resume is too short — aim for 400-600 words for better ATS scoring');
  if (foundKeywords.length < 5) weaknesses.push('Low keyword density — add more relevant technical skills');
  if (!lower.includes('github') && !lower.includes('portfolio')) weaknesses.push('Add GitHub profile or portfolio link to showcase your work');
  if (!lower.includes('improved') && !lower.includes('increased') && !lower.includes('reduced')) {
    weaknesses.push('Use quantifiable achievements (e.g., "Improved performance by 40%")');
  }

  const profile = db.profiles.find(p => p.userId === userId);
  const targetRole = profile?.targetRole || '';
  let missingKeywords: string[] = [];
  if (targetRole && ROLE_KEYWORDS[targetRole]) {
    missingKeywords = ROLE_KEYWORDS[targetRole].filter(kw => !lower.includes(kw));
  } else {
    missingKeywords = ['git', 'agile', 'rest api', 'testing', 'docker'].filter(kw => !lower.includes(kw));
  }

  const resume = {
    id: generateId(),
    userId,
    content,
    atsScore,
    strengths,
    weaknesses,
    keywords: foundKeywords,
    missingKeywords,
    createdAt: new Date().toISOString(),
  };

  const idx = db.resumes.findIndex(r => r.userId === userId);
  if (idx !== -1) db.resumes.splice(idx, 1);
  db.resumes.push(resume);

  res.json(resume);
}
