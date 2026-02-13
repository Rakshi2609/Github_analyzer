'use server';
/**
 * @fileOverview Genkit flow for comparing up to 4 candidate engineering personas against a job description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CandidateSummarySchema = z.object({
  username: z.string(),
  persona: z.string(),
  fit_score: z.number(),
  top_signal: z.string(),
  main_red_flag: z.string(),
});

const CompareCandidatesInputSchema = z.object({
  jobDescription: z.string().optional().describe('The job description to compare candidates against. If not provided, comparison is based on general engineering quality.'),
  candidates: z.array(CandidateSummarySchema).max(4).describe('Summarized data for up to 4 candidates.'),
});
export type CompareCandidatesInput = z.infer<typeof CompareCandidatesInputSchema>;

const CompareCandidatesOutputSchema = z.object({
  ranking: z.array(z.object({
    username: z.string(),
    rank: z.number(),
    reasoning: z.string(),
  })).describe('Final ranked list of candidates.'),
  head_to_head: z.string().describe('A comparative analysis of the candidates\' strengths relative to each other.'),
  best_fit: z.string().describe('The username of the best candidate and why.'),
});
export type CompareCandidatesOutput = z.infer<typeof CompareCandidatesOutputSchema>;

export async function compareCandidates(input: CompareCandidatesInput): Promise<CompareCandidatesOutput> {
  return compareCandidatesFlow(input);
}

const comparisonPrompt = ai.definePrompt({
  name: 'comparisonPrompt',
  input: { schema: CompareCandidatesInputSchema },
  output: { schema: CompareCandidatesOutputSchema },
  prompt: `As a Lead Architect, compare these candidate profiles.

{{#if jobDescription}}
EVALUATE AGAINST THIS JOB DESCRIPTION:
{{{jobDescription}}}
{{else}}
No specific Job Description was provided. Compare candidates based on their overall engineering quality, architectural maturity, code evolution patterns, and general technical strengths.
{{/if}}

CANDIDATES:
{{#each candidates}}
- Candidate: {{username}}
  Persona: {{persona}}
  Current Fit Score: {{fit_score}}%
  Signal: {{top_signal}}
  Red Flag: {{main_red_flag}}
{{/each}}

Rank the candidates from best to worst {{#if jobDescription}}fit{{else}}overall engineering quality{{/if}} and provide a detailed head-to-head comparison highlighting who wins in which category (e.g., Architecture, Code Evolution).`,
});

const compareCandidatesFlow = ai.defineFlow(
  {
    name: 'compareCandidatesFlow',
    inputSchema: CompareCandidatesInputSchema,
    outputSchema: CompareCandidatesOutputSchema,
  },
  async (input) => {
    const { output } = await comparisonPrompt(input);
    return output!;
  }
);
