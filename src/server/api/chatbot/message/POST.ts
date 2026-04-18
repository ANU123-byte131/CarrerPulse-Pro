import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

const RESPONSES: Record<string, string[]> = {
  resume: [
    "Your resume is your first impression — make it count! Key tips: (1) Keep it to 1-2 pages max, (2) Use strong action verbs like 'built', 'led', 'optimized', (3) Quantify achievements (e.g., 'Reduced load time by 40%'), (4) Tailor it for each job by mirroring the job description's language, (5) Ensure your contact info and LinkedIn are prominent.",
    "For ATS optimization, use standard section headings like 'Experience', 'Skills', and 'Education'. Avoid tables, graphics, or unusual fonts that ATS systems can't parse. Include keywords from the job description naturally throughout your resume.",
    "The most impactful resume improvement you can make is adding quantifiable achievements. Instead of 'Worked on React applications', write 'Built 3 React applications serving 10,000+ users, reducing page load time by 35%'. Numbers make you memorable.",
  ],
  interview: [
    "For technical interviews, practice the STAR method: Situation, Task, Action, Result. For coding interviews, think out loud — interviewers want to understand your problem-solving process, not just the answer. Practice on LeetCode focusing on arrays, strings, trees, and dynamic programming.",
    "Behavioral interviews test your soft skills. Prepare 5-7 strong stories from your experience that demonstrate leadership, problem-solving, teamwork, and handling failure. Each story should have a clear challenge, your specific actions, and measurable results.",
    "Before any interview: (1) Research the company's products, culture, and recent news, (2) Prepare 3-5 thoughtful questions to ask, (3) Review your own resume thoroughly, (4) Practice your 'Tell me about yourself' answer (keep it to 2 minutes), (5) Prepare examples of your best work.",
  ],
  skills: [
    "The most in-demand skills right now are: TypeScript, React/Next.js, Python, cloud platforms (AWS/GCP), Docker/Kubernetes, and system design. Focus on depth over breadth — being excellent at 3-4 technologies is better than being mediocre at 10.",
    "To learn new skills efficiently: (1) Build projects, not just tutorials, (2) Contribute to open source, (3) Teach others what you learn, (4) Set a 30-day challenge for each new skill, (5) Use spaced repetition for concepts. The best way to learn programming is to build something you actually care about.",
    "For career growth, focus on T-shaped skills: deep expertise in your core area plus broad knowledge across related fields. A frontend developer who understands backend, databases, and DevOps basics is far more valuable than one who only knows React.",
  ],
  salary: [
    "Salary negotiation tips: (1) Never give the first number — let them make an offer, (2) Research market rates on Glassdoor, Levels.fyi, and LinkedIn Salary, (3) Consider the full package (equity, benefits, PTO, remote work), (4) Always negotiate — 85% of employers have room to negotiate, (5) Use competing offers as leverage if you have them.",
    "When asked about salary expectations, say: 'I'm looking for a competitive offer in line with market rates for this role and my experience. Based on my research, I understand the range is $X-$Y. Can you share what budget you have for this position?' This keeps the conversation open.",
    "Entry-level tech salaries vary widely by location and company. In major US tech hubs, expect $80K-$120K for entry-level roles. Remote roles often pay similarly. Focus on total compensation: base salary + equity + bonus + benefits can add 30-50% to your base.",
  ],
  roadmap: [
    "A solid career roadmap has 3 phases: (1) Foundation (0-6 months): Master core skills, build 2-3 portfolio projects, (2) Growth (6-18 months): Land your first role, contribute to real projects, build your network, (3) Advancement (18+ months): Specialize, take on leadership, mentor others. Consistency beats intensity — 2 hours of focused learning daily beats 14-hour weekend sprints.",
    "For your career roadmap, prioritize projects over courses. Employers want to see what you've built. Aim for 3 portfolio projects that demonstrate: (1) A full-stack application, (2) A project solving a real problem, (3) A collaborative project (open source or team). Deploy everything publicly.",
    "Networking is 80% of job hunting. Start with: (1) LinkedIn — connect with people at companies you want to work at, (2) Local meetups and tech events, (3) Twitter/X tech community, (4) Contributing to open source projects. Warm referrals convert 5-10x better than cold applications.",
  ],
  job: [
    "Job search strategy: Apply to 5-10 quality applications per week rather than mass applying. Customize your resume and cover letter for each role. Track everything in a spreadsheet or job tracker. Follow up after 1 week if you haven't heard back. The average job search takes 3-6 months — stay consistent.",
    "The best job search channels in order of effectiveness: (1) Employee referrals — highest conversion rate, (2) LinkedIn — most active for tech roles, (3) Company career pages — shows genuine interest, (4) Job boards (Indeed, Glassdoor), (5) Recruiters — good for senior roles. Spend 60% of your time on networking and referrals.",
    "For your first tech job, consider: (1) Startups — faster learning, more responsibility, (2) Mid-size companies — good balance of structure and growth, (3) Big tech — great for learning processes and compensation. Don't overlook non-tech companies with tech teams — often less competitive and great for building experience.",
  ],
  default: [
    "I'm here to help with your career journey! I can assist with resume improvement, interview preparation, skill development, salary negotiation, and job search strategy. What specific challenge are you facing right now?",
    "Great question! Career development is a marathon, not a sprint. The key is consistent daily action: learn something new, build something, connect with someone in your field. What area would you like to focus on today?",
    "Based on your profile, I'd recommend focusing on strengthening your core technical skills and building a strong portfolio. Would you like specific advice on resume writing, interview prep, or skill development?",
  ],
};

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const lower = message.toLowerCase();
  let category = 'default';
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) category = 'resume';
  else if (lower.includes('interview') || lower.includes('question') || lower.includes('behavioral') || lower.includes('technical')) category = 'interview';
  else if (lower.includes('skill') || lower.includes('learn') || lower.includes('course') || lower.includes('technology')) category = 'skills';
  else if (lower.includes('salary') || lower.includes('pay') || lower.includes('compensation') || lower.includes('negotiate')) category = 'salary';
  else if (lower.includes('roadmap') || lower.includes('plan') || lower.includes('path') || lower.includes('career')) category = 'roadmap';
  else if (lower.includes('job') || lower.includes('apply') || lower.includes('search') || lower.includes('hire')) category = 'job';

  const responses = RESPONSES[category];
  let response = responses[Math.floor(Math.random() * responses.length)];

  const profile = db.profiles.find(p => p.userId === userId);
  if (profile?.targetRole && category === 'default') {
    response = `As someone targeting a ${profile.targetRole} role, ` + response.charAt(0).toLowerCase() + response.slice(1);
  }

  res.json({ response, timestamp: new Date().toISOString() });
}
