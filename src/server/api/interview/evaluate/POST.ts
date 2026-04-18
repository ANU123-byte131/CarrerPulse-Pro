import type { Request, Response } from 'express';
import { getUserIdFromRequest } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { question, answer } = req.body;
  if (!question || answer === undefined) return res.status(400).json({ error: 'Question and answer are required' });

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasKeywords = ['because', 'example', 'when', 'how', 'result', 'approach', 'solution', 'implemented', 'achieved', 'improved'].some(kw => answer.toLowerCase().includes(kw));
  const hasStructure = answer.includes('.') && wordCount > 20;
  const hasNumbers = /\d+/.test(answer);

  let confidenceScore = 25;
  if (wordCount >= 30) confidenceScore += 15;
  if (wordCount >= 60) confidenceScore += 15;
  if (wordCount >= 100) confidenceScore += 10;
  if (hasKeywords) confidenceScore += 15;
  if (hasStructure) confidenceScore += 10;
  if (hasNumbers) confidenceScore += 10;
  confidenceScore = Math.min(95, confidenceScore);

  let feedback = '';
  if (wordCount < 10) {
    feedback = 'Your answer is too brief. Interviewers expect detailed responses with examples. Try to elaborate more on your thought process and provide concrete examples from your experience. Aim for at least 3-4 sentences.';
  } else if (wordCount < 40) {
    feedback = 'Good start, but your answer could be more comprehensive. Add specific examples, explain your reasoning, and quantify results where possible. The STAR method (Situation, Task, Action, Result) works well for behavioral questions.';
  } else if (!hasKeywords) {
    feedback = 'Your answer has good length but could be more structured. Use transition words like "because", "for example", "as a result" to make your reasoning clearer. Concrete examples significantly strengthen your answers.';
  } else if (!hasNumbers) {
    feedback = 'Strong answer with good structure! To make it even better, add quantifiable metrics (e.g., "improved performance by 40%", "reduced load time from 3s to 0.8s"). Numbers make your achievements memorable and credible.';
  } else {
    feedback = 'Excellent answer! You provided good detail, structure, and quantifiable results. This is exactly what interviewers want to hear. Make sure to practice delivering this answer confidently and concisely in a real interview setting.';
  }

  const sampleAnswer = `A strong answer would: (1) Directly address the question with a clear, confident opening statement, (2) Provide a specific example from your experience using the STAR method (Situation, Task, Action, Result), (3) Quantify your impact with numbers where possible (e.g., "reduced load time by 40%", "led a team of 5"), (4) Connect your experience to the role you're applying for, and (5) End with a forward-looking statement about what you learned or how you'd apply this in the future.`;

  res.json({ feedback, sampleAnswer, confidenceScore });
}
