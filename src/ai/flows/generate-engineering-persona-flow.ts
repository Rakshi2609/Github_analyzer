'use server';
/**
 * @fileOverview A Genkit flow that analyzes GitHub data to determine a developer's "engineering persona".
 *
 * - generateEngineeringPersona - A function that handles the engineering persona generation process.
 * - GenerateEngineeringPersonaInput - The input type for the generateEngineeringPersona function.
 * - GenerateEngineeringPersonaOutput - The return type for the generateEngineeringPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEngineeringPersonaInputSchema = z.object({
  githubScrapedData: z
    .string()
    .describe('Raw, scraped GitHub data for a user, including repositories, commit history, and READMEs.'),
});
export type GenerateEngineeringPersonaInput = z.infer<
  typeof GenerateEngineeringPersonaInputSchema
>;

const GenerateEngineeringPersonaOutputSchema = z.string().describe(
  "A single label representing the developer's primary engineering persona (e.g., 'The Systems Thinker', 'The Product Dev', 'The Refactorer')."
);
export type GenerateEngineeringPersonaOutput = z.infer<
  typeof GenerateEngineeringPersonaOutputSchema
>;

export async function generateEngineeringPersona(
  input: GenerateEngineeringPersonaInput
): Promise<GenerateEngineeringPersonaOutput> {
  return generateEngineeringPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEngineeringPersonaPrompt',
  input: {schema: GenerateEngineeringPersonaInputSchema},
  output: {schema: GenerateEngineeringPersonaOutputSchema},
  prompt: `ACT AS: A Senior Technical Recruiter and Lead System Architect.

TASK: Analyze the provided GitHub data for a user to determine their "Engineering DNA" and generate a single label for their primary engineering persona. Look beyond surface-level metrics (stars/followers) and evaluate the actual substance of their work.

ANALYSIS CRITERIA:
1. SIGNAL VS. NOISE: Distinguish between "Tutorial Hell" projects (boilerplate code) and "Original Problem Solving" (unique logic, custom algorithms, complex integrations).
2. ARCHITECTURAL MATURITY: Does the user use Design Patterns? Is the project structured for scalability (e.g., Separation of Concerns, Clean Architecture)?
3. DOCUMENTATION UX: Is the README written for users or just for show? Rate the "Time-to-Understand" the project.
4. CODE EVOLUTION: Look at the commit history. Is the user refining their code over time, or just pushing "final version" dumps?

Based on the following GitHub data, provide a single, concise label that best describes their overall engineering persona. Examples: 'The Systems Thinker', 'The Product Dev', 'The Refactorer', 'The Infrastructure Engineer', 'The Open Source Contributor', 'The Prototyper', 'The Detail-Oriented QA', 'The Algorithm Specialist'.

DATA INPUT:
{{{githubScrapedData}}}`,
});

const generateEngineeringPersonaFlow = ai.defineFlow(
  {
    name: 'generateEngineeringPersonaFlow',
    inputSchema: GenerateEngineeringPersonaInputSchema,
    outputSchema: GenerateEngineeringPersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
