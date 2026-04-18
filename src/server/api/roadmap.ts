import { Router, Request, Response } from 'express';
import { db, generateId } from './db.js';
import { authMiddleware } from './auth.js';

const router = Router();

const ROADMAP_TEMPLATES: Record<string, { week: number; title: string; skills: string[]; projects: string[] }[]> = {
  'Frontend Developer': [
    { week: 1, title: 'HTML & CSS Mastery', skills: ['HTML5 Semantics', 'CSS Flexbox', 'CSS Grid', 'Responsive Design'], projects: ['Build a responsive portfolio landing page'] },
    { week: 2, title: 'JavaScript Fundamentals', skills: ['ES6+ Features', 'DOM Manipulation', 'Async/Await', 'Fetch API'], projects: ['Build a weather app using a public API'] },
    { week: 3, title: 'React Core Concepts', skills: ['Components & Props', 'State & Hooks', 'React Router', 'Context API'], projects: ['Build a task management app with React'] },
    { week: 4, title: 'TypeScript & Advanced React', skills: ['TypeScript Basics', 'Generic Types', 'Custom Hooks', 'Performance Optimization'], projects: ['Convert your React app to TypeScript'] },
    { week: 5, title: 'State Management & APIs', skills: ['Redux Toolkit', 'React Query', 'REST API Integration', 'Error Handling'], projects: ['Build a full CRUD app with state management'] },
    { week: 6, title: 'Styling & UI Libraries', skills: ['Tailwind CSS', 'shadcn/ui', 'Animations', 'Dark Mode'], projects: ['Redesign your portfolio with Tailwind CSS'] },
    { week: 7, title: 'Testing & Quality', skills: ['Jest', 'React Testing Library', 'Cypress E2E', 'Code Review'], projects: ['Write tests for your existing projects'] },
    { week: 8, title: 'Deployment & Portfolio', skills: ['Vercel/Netlify', 'CI/CD Basics', 'SEO Optimization', 'Performance Audit'], projects: ['Deploy 3 projects and create a polished portfolio'] },
  ],
  'Backend Developer': [
    { week: 1, title: 'Node.js & Express Fundamentals', skills: ['Node.js Runtime', 'Express.js', 'Middleware', 'REST Principles'], projects: ['Build a basic REST API with CRUD operations'] },
    { week: 2, title: 'Database Design', skills: ['SQL Fundamentals', 'PostgreSQL', 'Database Modeling', 'Indexing'], projects: ['Design and implement a database schema'] },
    { week: 3, title: 'Authentication & Security', skills: ['JWT Authentication', 'OAuth 2.0', 'Password Hashing', 'Input Validation'], projects: ['Add auth to your REST API'] },
    { week: 4, title: 'Advanced Database & ORM', skills: ['Prisma/Drizzle ORM', 'Migrations', 'Redis Caching', 'Query Optimization'], projects: ['Add caching layer to your API'] },
    { week: 5, title: 'Microservices Architecture', skills: ['Service Design', 'Message Queues', 'API Gateway', 'Service Discovery'], projects: ['Split monolith into 2 microservices'] },
    { week: 6, title: 'Docker & Containerization', skills: ['Docker Basics', 'Docker Compose', 'Container Networking', 'Docker Hub'], projects: ['Containerize your application'] },
    { week: 7, title: 'Cloud & Deployment', skills: ['AWS EC2/Lambda', 'S3 Storage', 'RDS Database', 'Load Balancing'], projects: ['Deploy your app to AWS'] },
    { week: 8, title: 'Testing & Documentation', skills: ['Unit Testing', 'Integration Testing', 'API Documentation', 'Swagger/OpenAPI'], projects: ['Write comprehensive tests and API docs'] },
  ],
  'Full Stack Developer': [
    { week: 1, title: 'Frontend Foundations', skills: ['React', 'TypeScript', 'Tailwind CSS', 'Component Architecture'], projects: ['Build a responsive dashboard UI'] },
    { week: 2, title: 'Backend Foundations', skills: ['Node.js', 'Express', 'REST API Design', 'Middleware'], projects: ['Build a REST API with 5+ endpoints'] },
    { week: 3, title: 'Database Integration', skills: ['PostgreSQL', 'Prisma ORM', 'Data Modeling', 'CRUD Operations'], projects: ['Connect frontend to backend with database'] },
    { week: 4, title: 'Authentication System', skills: ['JWT', 'Protected Routes', 'User Sessions', 'Role-based Access'], projects: ['Add full auth system to your app'] },
    { week: 5, title: 'State Management & Real-time', skills: ['React Query', 'WebSockets', 'Optimistic Updates', 'Error Boundaries'], projects: ['Add real-time features to your app'] },
    { week: 6, title: 'DevOps Basics', skills: ['Docker', 'GitHub Actions', 'Environment Variables', 'Deployment'], projects: ['Set up CI/CD pipeline for your project'] },
    { week: 7, title: 'Testing & Quality', skills: ['Jest', 'Cypress', 'API Testing', 'Code Review'], projects: ['Achieve 70%+ test coverage'] },
    { week: 8, title: 'Portfolio & Job Prep', skills: ['System Design', 'Performance Optimization', 'Portfolio Polish', 'Interview Prep'], projects: ['Launch 2 full-stack projects publicly'] },
  ],
  'Data Scientist': [
    { week: 1, title: 'Python for Data Science', skills: ['Python Basics', 'NumPy', 'Pandas', 'Jupyter Notebooks'], projects: ['Analyze a public dataset with Pandas'] },
    { week: 2, title: 'Data Visualization', skills: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard Design'], projects: ['Create an interactive data dashboard'] },
    { week: 3, title: 'Statistics & Probability', skills: ['Descriptive Statistics', 'Hypothesis Testing', 'Probability Distributions', 'A/B Testing'], projects: ['Conduct a statistical analysis project'] },
    { week: 4, title: 'Machine Learning Basics', skills: ['Scikit-learn', 'Regression', 'Classification', 'Model Evaluation'], projects: ['Build a predictive model'] },
    { week: 5, title: 'Advanced ML Algorithms', skills: ['Random Forests', 'Gradient Boosting', 'SVM', 'Feature Engineering'], projects: ['Compete in a Kaggle competition'] },
    { week: 6, title: 'Deep Learning Intro', skills: ['Neural Networks', 'TensorFlow/Keras', 'CNNs', 'Transfer Learning'], projects: ['Build an image classification model'] },
    { week: 7, title: 'SQL & Data Engineering', skills: ['Advanced SQL', 'Data Pipelines', 'ETL Processes', 'BigQuery'], projects: ['Build an end-to-end data pipeline'] },
    { week: 8, title: 'Portfolio & Deployment', skills: ['Model Deployment', 'Flask/FastAPI', 'Streamlit', 'MLflow'], projects: ['Deploy a ML model as a web app'] },
  ],
  'DevOps Engineer': [
    { week: 1, title: 'Linux & Shell Scripting', skills: ['Linux Commands', 'Bash Scripting', 'File Systems', 'Process Management'], projects: ['Automate system tasks with bash scripts'] },
    { week: 2, title: 'Version Control & Git', skills: ['Advanced Git', 'Branching Strategies', 'Git Hooks', 'Code Review'], projects: ['Set up a Git workflow for a team project'] },
    { week: 3, title: 'Docker & Containers', skills: ['Docker Fundamentals', 'Dockerfile', 'Docker Compose', 'Container Security'], projects: ['Containerize a multi-service application'] },
    { week: 4, title: 'Kubernetes', skills: ['K8s Architecture', 'Pods & Deployments', 'Services & Ingress', 'Helm Charts'], projects: ['Deploy app to Kubernetes cluster'] },
    { week: 5, title: 'CI/CD Pipelines', skills: ['GitHub Actions', 'Jenkins', 'Pipeline Design', 'Automated Testing'], projects: ['Build a full CI/CD pipeline'] },
    { week: 6, title: 'Cloud Infrastructure (AWS)', skills: ['EC2', 'S3', 'VPC', 'IAM', 'RDS'], projects: ['Deploy a production-ready app on AWS'] },
    { week: 7, title: 'Infrastructure as Code', skills: ['Terraform', 'Ansible', 'CloudFormation', 'State Management'], projects: ['Provision infrastructure with Terraform'] },
    { week: 8, title: 'Monitoring & Observability', skills: ['Prometheus', 'Grafana', 'ELK Stack', 'Alerting'], projects: ['Set up full monitoring for your app'] },
  ],
};

// Fill missing roles with a generic template
const genericTemplate = ROADMAP_TEMPLATES['Full Stack Developer'];
['ML Engineer', 'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'Cloud Architect'].forEach(role => {
  if (!ROADMAP_TEMPLATES[role]) {
    ROADMAP_TEMPLATES[role] = genericTemplate;
  }
});

// POST /api/roadmap/generate
router.post('/generate', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { targetRole, currentSkills } = req.body;

  const profile = db.profiles.find(p => p.userId === userId);
  const role = targetRole || profile?.targetRole || 'Full Stack Developer';
  const skills = currentSkills || profile?.skills || [];

  const template = ROADMAP_TEMPLATES[role] || ROADMAP_TEMPLATES['Full Stack Developer'];

  // Customize phases based on missing skills
  const phases = template.map((phase, idx) => ({
    ...phase,
    completed: false,
  }));

  const roadmap = {
    id: generateId(),
    userId,
    targetRole: role,
    phases,
    createdAt: new Date().toISOString(),
  };

  const idx = db.roadmaps.findIndex(r => r.userId === userId);
  if (idx !== -1) db.roadmaps.splice(idx, 1);
  db.roadmaps.push(roadmap);

  res.json(roadmap);
});

// GET /api/roadmap/current
router.get('/current', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const roadmap = db.roadmaps.find(r => r.userId === userId);
  if (!roadmap) return res.status(404).json({ error: 'No roadmap found' });
  res.json(roadmap);
});

// PATCH /api/roadmap/progress
router.patch('/progress', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { week, completed } = req.body;
  const roadmap = db.roadmaps.find(r => r.userId === userId);
  if (!roadmap) return res.status(404).json({ error: 'No roadmap found' });
  const phase = roadmap.phases.find(p => p.week === week);
  if (phase) phase.completed = completed;
  res.json(roadmap);
});

export default router;
