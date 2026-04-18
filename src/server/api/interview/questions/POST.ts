import type { Request, Response } from 'express';
import { getUserIdFromRequest } from '../../authUtils.js';

const QUESTION_BANK: Record<string, { technical: string[]; behavioral: string[] }> = {
  'Frontend Developer': {
    technical: [
      'Explain the difference between `var`, `let`, and `const` in JavaScript.',
      'What is the Virtual DOM in React and how does it improve performance?',
      'How does CSS specificity work? Explain with examples.',
      'What are React hooks? Explain `useState` and `useEffect` with use cases.',
      'What is the difference between `==` and `===` in JavaScript?',
      'Explain the concept of closures in JavaScript.',
      'What is event delegation and why is it useful?',
      'How would you optimize a slow-loading React application?',
      'What is the difference between `null` and `undefined` in JavaScript?',
      'Explain how async/await works and how it differs from Promises.',
    ],
    behavioral: [
      'Tell me about a time you had to debug a complex frontend issue. How did you approach it?',
      'Describe a project where you improved the user experience significantly.',
      'How do you stay up-to-date with the latest frontend technologies?',
      'Tell me about a time you had to work with a difficult designer or stakeholder.',
      'Describe a situation where you had to meet a tight deadline. How did you manage it?',
      'How do you approach cross-browser compatibility issues?',
      'Tell me about your most challenging frontend project.',
    ],
  },
  'Backend Developer': {
    technical: [
      'What is the difference between SQL and NoSQL databases? When would you use each?',
      'Explain RESTful API design principles.',
      'What is database indexing and how does it improve query performance?',
      'How do you handle authentication and authorization in a backend system?',
      'What is the N+1 query problem and how do you solve it?',
      'Explain the concept of database transactions and ACID properties.',
      'What are microservices and what are their advantages/disadvantages?',
      'How would you design a rate limiting system for an API?',
      'What is caching and when would you use Redis vs. in-memory caching?',
      'Explain the difference between horizontal and vertical scaling.',
    ],
    behavioral: [
      'Tell me about a time you had to optimize a slow database query.',
      'Describe a situation where you had to design a system from scratch.',
      'How do you approach code reviews? What do you look for?',
      'Tell me about a production incident you handled. What did you learn?',
      'Describe how you ensure the security of the APIs you build.',
      'How do you handle technical debt in your projects?',
      'Tell me about a time you had to make a difficult architectural decision.',
    ],
  },
  'Full Stack Developer': {
    technical: [
      'How would you design a scalable web application from scratch?',
      'Explain the difference between server-side rendering and client-side rendering.',
      'How do you handle state management in a large React application?',
      'What is CORS and how do you handle it in a full-stack application?',
      'Explain the concept of JWT authentication and its security considerations.',
      'How would you implement real-time features in a web application?',
      'What is the difference between REST and GraphQL? When would you use each?',
      'How do you approach database schema design for a new feature?',
      'What are Web Workers and when would you use them?',
      'Explain how you would implement a search feature with good performance.',
    ],
    behavioral: [
      'Tell me about a full-stack project you built from scratch.',
      'How do you prioritize between frontend and backend tasks?',
      'Describe a time you had to learn a new technology quickly for a project.',
      'Tell me about a time you improved the performance of an application.',
      'How do you handle disagreements with team members about technical decisions?',
      'Describe your approach to debugging a production issue.',
      'Tell me about a time you mentored a junior developer.',
    ],
  },
  'Data Scientist': {
    technical: [
      'Explain the bias-variance tradeoff in machine learning.',
      'What is cross-validation and why is it important?',
      'How do you handle missing data in a dataset?',
      'Explain the difference between supervised and unsupervised learning.',
      'What is regularization and why is it used?',
      'How would you detect and handle outliers in a dataset?',
      'Explain the concept of feature engineering.',
      'What is the difference between precision and recall?',
      'How do you evaluate a classification model?',
      'Explain gradient descent and its variants.',
    ],
    behavioral: [
      'Tell me about a data science project that had a real business impact.',
      'How do you communicate complex findings to non-technical stakeholders?',
      'Describe a time when your model performed poorly in production.',
      'How do you approach a new data science problem?',
      'Tell me about a time you had to work with messy, incomplete data.',
    ],
  },
  'DevOps Engineer': {
    technical: [
      'Explain the difference between Docker and virtual machines.',
      'What is Kubernetes and what problems does it solve?',
      'How would you design a CI/CD pipeline for a microservices application?',
      'What is Infrastructure as Code and what are its benefits?',
      'How do you monitor a production system? What metrics do you track?',
      'Explain the concept of blue-green deployment.',
      'What is a service mesh and when would you use one?',
      'How do you handle secrets management in a cloud environment?',
      'Explain the CAP theorem.',
      'How would you troubleshoot a slow application in production?',
    ],
    behavioral: [
      'Tell me about a production outage you handled. What was your process?',
      'How do you balance speed of deployment with stability?',
      'Describe a time you automated a manual process that saved significant time.',
      'How do you approach security in your infrastructure?',
      'Tell me about a time you had to migrate a system with zero downtime.',
    ],
  },
};

const genericQuestions = {
  technical: [
    'Describe your technical background and the technologies you work with most.',
    'How do you approach learning a new technology or framework?',
    'What is your experience with version control systems like Git?',
    'How do you ensure code quality in your projects?',
    'Describe your experience with agile development methodologies.',
    'How do you handle technical challenges you have not encountered before?',
    'What tools do you use for debugging and troubleshooting?',
  ],
  behavioral: [
    'Tell me about yourself and your career journey so far.',
    'What is your greatest professional achievement?',
    'How do you handle working under pressure or tight deadlines?',
    'Describe a time you had to collaborate with a difficult team member.',
    'Where do you see yourself in 5 years?',
    'Tell me about a time you failed and what you learned from it.',
    'How do you prioritize your work when you have multiple deadlines?',
  ],
};

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { role, type } = req.body;
  if (!role || !type) return res.status(400).json({ error: 'Role and type are required' });

  const bank = QUESTION_BANK[role] || genericQuestions;
  const questions = type === 'technical' ? bank.technical : bank.behavioral;
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  res.json({ questions: shuffled.slice(0, 5), role, type });
}
