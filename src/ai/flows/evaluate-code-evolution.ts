'use server';
/**
 * @fileOverview This file implements a Genkit flow to evaluate a developer's code evolution
 * patterns by analyzing their commit history. It assesses refinement, iterative development,
 * and commit frequency.
 *
 * - evaluateCodeEvolution - The main function to trigger the code evolution analysis.
 * - EvaluateCodeEvolutionInput - The input type for the analysis, containing commit history.
 * - EvaluateCodeEvolutionOutput - The output type, providing a structured assessment of code evolution.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateCodeEvolutionInputSchema = z.object({
  commitHistory: z
    .string()
    .describe(
      'A detailed history of commits for a user or repository, including commit messages, dates, and changes.'
    ),
});
export type EvaluateCodeEvolutionInput = z.infer<
  typeof EvaluateCodeEvolutionInputSchema
>;

const EvaluateCodeEvolutionOutputSchema = z.object({
  refinementPattern: z
    .string()
    .describe(
      'Describes the typical pattern of code changes, e.g., "small, incremental refinements", "large, infrequent feature drops", "mixed approach".'
    ),
  iterativeDevelopmentEvidence: z
    .string()
    .describe(
      'Evidence and assessment of whether the developer demonstrates iterative development practices.'
    ),
  commitFrequencySummary: z
    .string()
    .describe(
      'Summary of commit frequency and size, identifying trends like frequent small commits or infrequent large commits.'
    ),
  codeEvolutionScore: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'A score from 1 to 10 assessing the quality and maturity of the code evolution process.'
    ),
  overallAnalysis: z
    .string()
    .describe(
      'An overall analysis of the developer\'s approach to code evolution based on commit history.'
    ),
});
export type EvaluateCodeEvolutionOutput = z.infer<
  typeof EvaluateCodeEvolutionOutputSchema
>;

export async function evaluateCodeEvolution(
  input: EvaluateCodeEvolutionInput
): Promise<EvaluateCodeEvolutionOutput> {
  return evaluateCodeEvolutionFlow(input);
}

const evaluateCodeEvolutionPrompt = ai.definePrompt({
  name: 'evaluateCodeEvolutionPrompt',
  input: { schema: EvaluateCodeEvolutionInputSchema },
  output: { schema: EvaluateCodeEvolutionOutputSchema },
  prompt: `You are a Senior Technical Recruiter and Lead System Architect. Your task is to analyze a developer's commit history to understand their code refinement patterns and iterative development process.

Based on the provided commit history, produce a JSON object with the following fields:
- refinementPattern: A string describing the typical pattern of code changes, e.g., "small, incremental refinements", "large, infrequent feature drops", "mixed approach".
- iterativeDevelopmentEvidence: A string providing evidence and an assessment of whether the developer demonstrates iterative development practices.
- commitFrequencySummary: A string summarizing commit frequency and size, identifying trends like frequent small commits or infrequent large commits.
- codeEvolutionScore: A number from 1 to 10 assessing the quality and maturity of the code evolution process (1 being poor, 10 being excellent).
- overallAnalysis: An overall analysis of the developer's approach to code evolution based on the commit history.

Commit History:
{{{commitHistory}}}`,
});

const evaluateCodeEvolutionFlow = ai.defineFlow(
  {
    name: 'evaluateCodeEvolutionFlow',
    inputSchema: EvaluateCodeEvolutionInputSchema,
    outputSchema: EvaluateCodeEvolutionOutputSchema,
  },
  async (input) => {
    const { output } = await evaluateCodeEvolutionPrompt(input);
    return output!;
  }
);
