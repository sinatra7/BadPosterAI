'use server';

/**
 * @fileOverview A posture recommendation AI agent.
 *
 * - postureRecommendations - A function that handles the posture recommendation process.
 * - PostureRecommendationsInput - The input type for the postureRecommendations function.
 * - PostureRecommendationsOutput - The return type for the postureRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PostureRecommendationsInputSchema = z.object({
  postureIssues: z
    .string()
    .describe('The posture issues detected, e.g., "Slouching", "Knee over toe", "Hunched back".'),
});
export type PostureRecommendationsInput = z.infer<typeof PostureRecommendationsInputSchema>;

const PostureRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Personalized recommendations on how to improve posture.'),
});
export type PostureRecommendationsOutput = z.infer<typeof PostureRecommendationsOutputSchema>;

export async function postureRecommendations(input: PostureRecommendationsInput): Promise<PostureRecommendationsOutput> {
  return postureRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'postureRecommendationsPrompt',
  input: {schema: PostureRecommendationsInputSchema},
  output: {schema: PostureRecommendationsOutputSchema},
  prompt: `You are a personal AI posture coach. You will receive information about posture issues and give personalized recommendations on how to correct posture.

Posture issues: {{{postureIssues}}}

Give a single, concise, and simple tip to improve posture. Keep it under 20 words.`,
});

const postureRecommendationsFlow = ai.defineFlow(
  {
    name: 'postureRecommendationsFlow',
    inputSchema: PostureRecommendationsInputSchema,
    outputSchema: PostureRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
