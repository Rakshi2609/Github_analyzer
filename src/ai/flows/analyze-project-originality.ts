'use server';
/**
 * @fileOverview A Genkit flow for analyzing a GitHub project's originality,
 * distinguishing between original problem-solving and boilerplate code.
 *
 * - analyzeProjectOriginality - A function that handles the project originality analysis process.
 * - AnalyzeProjectOriginalityInput - The input type for the analyzeProjectOriginality function.
 * - AnalyzeProjectOriginalityOutput - The return type for the analyzeProjectOriginality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AnalyzeProjectOriginalityInputSchema = z.object({
  projectName: z.string().describe('The name of the GitHub project.'),
  projectDescription: z.string().describe('A brief description of the project, usually from its README or repository description.'),
  repoContentSummary: z.string().describe('A summary or truncated content of the repository, including key file structures, important code snippets, and relevant README sections, for analysis.'),
});
export type AnalyzeProjectOriginalityInput = z.infer<typeof AnalyzeProjectOriginalityInputSchema>;

// Output Schema
const AnalyzeProjectOriginalityOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis distinguishing between original problem-solving and boilerplate code.'),
  signalRating: z.enum(['High Signal', 'Medium Signal', 'Low Signal', 'Boilerplate/Tutorial']).describe('A rating indicating the level of original signal in the project.'),
  originalityScore: z.number().min(0).max(10).describe('A numerical score from 0 (pure boilerplate) to 10 (highly original solution).'),
});
export type AnalyzeProjectOriginalityOutput = z.infer<typeof AnalyzeProjectOriginalityOutputSchema>;

/**
 * Analyzes a GitHub project's content to distinguish between original problem-solving
 * and boilerplate code, providing an assessment of its 