'use server';
/**
 * @fileOverview This file provides a Genkit flow for analyzing GitHub data to generate an engineering persona,
 * identify hiring signals and red flags, and suggest hire recommendations based on JD.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PillarScoreSchema = z.object({
  score: z.number().min(1).max(10),
  rating: z.string().describe('A short label like "High Maturity", "Refined", or "Needs Work"'),
  justification: z.string().describe('A brief explanation for the score.'),
});

const ProvideAnalysisSummaryAndRecommendationsInputSchema = z.object({
  githubData: z.string().describe('The scraped public GitHub data for a user, including repositories, commit histories, and READMEs.'),
  jobDescription: z.string().optional().describe('The description of the role the candidate is being evaluated for.'),
});
export type ProvideAnalysisSummaryAndRecommendationsInput = z.infer<typeof ProvideAnalysisSummaryAndRecommendationsInputSchema>;

const ProvideAnalysisSummaryAndRecommendationsOutputSchema = z.object({
  engineering_persona: z.string().describe('A concise label describing the user\'s engineering DNA (e.g., The Systems Thinker).'),
  role_recommendation: z.string().describe('A professional industry role recommendation (e.g., Senior Infrastructure Engineer).'),
  hiring_signals: z.array(z.string()).describe('Positive indicators for hiring.'),
  red_flags: z.array(z.string()).describe('Potential concerns or areas for improvement.'),
  technical_debt_score: z.string().regex(/^(?:10|[1-9])$/).describe('Score from 1-10 (as string) representing perceived technical debt.'),
  actionable_enhancement: z.string().describe('One high-impact change suggested.'),
  pillars: z.object({
    signal_vs_noise: PillarScoreSchema,
    architecture: PillarScoreSchema,
    doc_ux: PillarScoreSchema,
    code_evolution: PillarScoreSchema,
  }).describe('Breakdown of the four core engineering pillars.'),
  hire_recommendation: z.object({
    decision: z.enum(['Strong Hire', 'Consider', 'No Hire']).describe('Final recommendation.'),
    justification: z.string().describe('Detailed reasoning for the hiring decision relative to the job description.'),
    fit_score: z.number().min(0).max(100).describe('Percentage score (0-100) representing fit.'),
  }).optional(),
});
export type ProvideAnalysisSummaryAndRecommendationsOutput = z.infer<typeof ProvideAnalysisSummaryAndRecommendationsOutputSchema>;

export async function provideAnalysisSummaryAndRecommendations(input: ProvideAnalysisSummaryAndRecommendationsInput): Promise<ProvideAnalysisSummaryAndRecommendationsOutput> {
  return provideAnalysisSummaryAndRecommendationsFlow(input);
}

const analysisSummaryPrompt = ai.definePrompt({
  name: 'analysisSummaryPrompt',
  input: {schema: ProvideAnalysisSummaryAndRecommendationsInputSchema},
  output: {schema: ProvideAnalysisSummaryAndRecommendationsOutputSchema},
  system: `You are a Senior Technical Recruiter and Lead System Architect. 

CRITICAL INSTRUCTIONS:
1. STRICTLY IGNORE DSA/COMPETITIVE PROGRAMMING: Do not reward "LeetCode" style repositories. Focus on systems engineering, product building, and architectural depth.
2. PROFESSIONAL ROLE ONLY: Suggest a realistic industry role (e.g. "Cloud Native Architect", "Full-Stack Lead"). Avoid "Algorithm Specialist" or "Competitive Programmer".
3. JOB FIT: If a Job Description (JD) is provided, be extremely critical about how their actual code matches the tech stack and requirements in the JD.
4. EVIDENCE-BASED: Justify scores with specific patterns found in the provided READMEs or commit messages.`,
  prompt: `Analyze the following GitHub data. 

{{#if jobDescription}}
EVALUATE AGAINST THIS JOB DESCRIPTION:
{{{jobDescription}}}
{{/if}}

GitHub Scraped Data:
{{{githubData}}}

Provide a detailed JSON analysis. If a Job Description was provided, the hire_recommendation field MUST be filled.`,
});

const provideAnalysisSummaryAndRecommendationsFlow = ai.defineFlow(
  {
    name: 'provideAnalysisSummaryAndRecommendationsFlow',
    inputSchema: ProvideAnalysisSummaryAndRecommendationsInputSchema,
    outputSchema: ProvideAnalysisSummaryAndRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await analysisSummaryPrompt(input);
    return output!;
  }
);
