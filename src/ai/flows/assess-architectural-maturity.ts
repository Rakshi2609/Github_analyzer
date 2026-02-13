'use server';
/**
 * @fileOverview A Genkit flow to assess the architectural maturity of a GitHub project.
 *
 * - assessArchitecturalMaturity - A function that handles the architectural maturity assessment process.
 * - AssessArchitecturalMaturityInput - The input type for the assessArchitecturalMaturity function.
 * - AssessArchitecturalMaturityOutput - The return type for the assessArchitecturalMaturity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessArchitecturalMaturityInputSchema = z.object({
  repoDescription: z
    .string()
    .describe(
      'A detailed description of the GitHub repository, including its purpose, technologies used, and a summary of its file structure and key code snippets relevant for architectural analysis.'
    ),
});
export type AssessArchitecturalMaturityInput = z.infer<
  typeof AssessArchitecturalMaturityInputSchema
>;

const AssessArchitecturalMaturityOutputSchema = z.object({
  architecturalMaturityScore: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe(
      'A score from 1 to 10 assessing the overall architectural maturity of the project. 1 being very low, 10 being excellent.'
    ),
  designPatternsIdentified: z
    .array(z.string())
    .describe(
      'A list of design patterns identified in the project architecture (e.g., MVC, Repository, Singleton, Factory, Dependency Injection).')
    .optional(),
  scalabilityAssessment: z
    .string()
    .describe(
      'An assessment of the project\'s structure for scalability, highlighting strengths and weaknesses (e.g., clear separation of concerns, modularity, or lack thereof).'
    ),
  maintainabilityAssessment: z
    .string()
    .describe(
      'An assessment of the project\'s structure for maintainability, highlighting ease of understanding and modification.'
    ),
  architecturalMaturitySummary: z
    .string()
    .describe(
      'A concise summary of the architectural maturity, highlighting key findings.'
    ),
  hiringSignals: z
    .array(z.string())
    .describe(
      'Specific positive hiring signals related to architectural maturity found in the project.'
    ),
  redFlags: z
    .array(z.string())
    .describe(
      'Specific red flags related to architectural maturity found in the project.'
    ),
  enhancementSuggestion: z
    .string()
    .describe(
      'One specific, high-impact architectural enhancement suggestion for the project.'
    ),
});
export type AssessArchitecturalMaturityOutput = z.infer<
  typeof AssessArchitecturalMaturityOutputSchema
>;

export async function assessArchitecturalMaturity(
  input: AssessArchitecturalMaturityInput
): Promise<AssessArchitecturalMaturityOutput> {
  return assessArchitecturalMaturityFlow(input);
}

const architecturalMaturityPrompt = ai.definePrompt({
  name: 'architecturalMaturityPrompt',
  input: {schema: AssessArchitecturalMaturityInputSchema},
  output: {schema: AssessArchitecturalMaturityOutputSchema},
  prompt: `You are a Senior Technical Recruiter and Lead System Architect analyzing GitHub project data to determine the "Engineering DNA" of a candidate, specifically focusing on Architectural Maturity.

Your task is to assess the provided project description for the following criteria:
- **Architectural Maturity:** Does the project demonstrate mature architectural thinking?
- **Design Patterns:** Does the user effectively apply established design patterns?
- **Scalability:** Is the project structured for scalability (e.g., Separation of Concerns, Modularity, Layered Architecture, Microservices principles)?
- **Maintainability:** Is the project easy to understand, modify, and extend due to its structure and adherence to good practices (e.g., Clean Architecture, SOLID principles)?

Analyze the following GitHub repository description:

Repository Description:
{{{repoDescription}}}

Based on your analysis, provide a detailed assessment in JSON format according to the output schema. Ensure you identify specific design patterns, provide clear assessments for scalability and maintainability, summarize the overall maturity, list specific hiring signals and red flags related to architecture, and suggest one high-impact architectural enhancement.`,
});

const assessArchitecturalMaturityFlow = ai.defineFlow(
  {
    name: 'assessArchitecturalMaturityFlow',
    inputSchema: AssessArchitecturalMaturityInputSchema,
    outputSchema: AssessArchitecturalMaturityOutputSchema,
  },
  async (input) => {
    const {output} = await architecturalMaturityPrompt(input);
    if (!output) {
      throw new Error('Failed to get architectural maturity assessment.');
    }
    return output;
  }
);
