// In-memory database for CareerPulse Pro

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  education: string;
  skills: string[];
  experience: string[];
  targetRole: string;
  bio: string;
  experienceLevel: string;
}

export interface Resume {
  id: string;
  userId: string;
  content: string;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  missingKeywords: string[];
  createdAt: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  content: string;
  requiredSkills: string[];
  matchScore: number;
  missingSkills: string[];
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  appliedDate: string;
  notes: string;
}

export interface RoadmapPhase {
  week: number;
  title: string;
  skills: string[];
  projects: string[];
  completed: boolean;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  phases: RoadmapPhase[];
  createdAt: string;
}

export interface InterviewQuestion {
  q: string;
  userAnswer: string;
  feedback: string;
  sampleAnswer: string;
  confidenceScore: number;
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: string;
  questions: InterviewQuestion[];
  createdAt: string;
}

// In-memory stores
export const db = {
  users: [] as User[],
  profiles: [] as Profile[],
  resumes: [] as Resume[],
  jobDescriptions: [] as JobDescription[],
  applications: [] as Application[],
  roadmaps: [] as Roadmap[],
  interviews: [] as Interview[],
};

// Helper to generate IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
