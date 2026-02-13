'use server';
/**
 * @fileOverview A Genkit flow for evaluating the clarity and user-friendliness
 * of a project's README documentation.
 *
 * - rateDocumentationClarity - A function that handles the documentation clarity assessment.
 * - RateDocumentationClarityInput - The input type for the rateDocumentationClarity function.
 * - RateDocumentationClarityOutput - The return type for the rateDocumentationClarity function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RateDocumentationClarityInputSchema = z.object({
  readmeContent: z
    .string()
    .describe('The full content of the project README file.'),
});
export type RateDocumentationClarityInput = z.infer<
  typeof RateDocumentationClarityInputSchema
>;

const RateDocumentationClarityOutputSchema = z.object({
  clarityRating: z
    .number()
    .min(1)
    .max(5)
    .describe('A numerical rating (1-5, 5 being best) for documentation clarity and user-friendliness.'),
  analysis: z
    .string()
    .describe(
      'A brief analysis explaining the clarity rating, covering content, organization, and overall user experience.'
    ),
  timeToUnderstandMinutes: z
    .number()
    .describe(
      'An estimated time in minutes for a new user to understand the project based on the README content.'
    ),
});
export type RateDocumentationClarityOutput = z.infer<
  typeof RateDocumentationClarityOutputSchema
>;

export async function rateDocumentationClarity(
  input: RateDocumentationClarityInput
): Promise<RateDocumentationClarityOutput> {
  return rateDocumentationClarityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rateDocumentationClarityPrompt',
  input: { schema: RateDocumentationClarityInputSchema },
  output: { schema: RateDocumentationClarityOutputSchema },
  prompt: `You are a Senior Technical Recruiter and Lead System Architect. Your task is to evaluate the clarity and user-friendliness of a project's README documentation.

Analyze the provided README content based on the following criteria:
- **Content Quality**: Is all necessary information present (installation, usage, features, etc.)?
- **Organization**: Is the README well-structured, easy to navigate, and logically organized?
- **Clarity and Conciseness**: Is the language clear, concise, and free of jargon? Is it easy to follow?
- **User-Friendliness**: Is it written with a new user in mind? Does it effectively onboard someone to the project?

Based on your assessment, provide:
1. A clarity rating from 1 to 5, where 1 is poor and 5 is excellent.
2. A brief analysis justifying the rating.
3. An estimated 'Time-to-Understand' the project in minutes, considering only the README content.

README Content:
{{{readmeContent}}}`,
});

const rateDocumentationClarityFlow = ai.defineFlow(
  {
    name: 'rateDocumentationClarityFlow',
    inputSchema: RateDocumentationClarityInputSchema,
    outputSchema: RateDocumentationClarityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
