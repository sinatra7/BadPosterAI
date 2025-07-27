'use server';
/**
 * @fileOverview An AI flow for detecting posture issues from an image.
 *
 * - detectPostureIssues - A function that handles the posture detection process.
 * - DetectPostureIssuesInput - The input type for the detectPostureIssues function.
 * - DetectPostureIssuesOutput - The return type for the detectPostureIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectPostureIssuesInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a person's posture, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectPostureIssuesInput = z.infer<typeof DetectPostureIssuesInputSchema>;

const DetectPostureIssuesOutputSchema = z.object({
  issues: z
    .array(z.string())
    .describe(
      'A list of detected posture issues. If no issues are found, return an empty array.'
    ),
});
export type DetectPostureIssuesOutput = z.infer<typeof DetectPostureIssuesOutputSchema>;

export async function detectPostureIssues(
  input: DetectPostureIssuesInput
): Promise<DetectPostureIssuesOutput> {
  return detectPostureIssuesFlow(input);
}

const possibleIssues = [
  'Knee Over Toe',
  'Hunched Back',
  'Slouching',
  'Forward Neck Tilt',
  'Uneven Shoulders',
  'Swayback',
  'Pelvic Tilt',
  'Rounded Shoulders',
];

const prompt = ai.definePrompt({
  name: 'detectPostureIssuesPrompt',
  input: {schema: DetectPostureIssuesInputSchema},
  output: {schema: DetectPostureIssuesOutputSchema},
  prompt: `You are a world-class physical therapist and posture expert. Your task is to analyze the provided image of a person and identify any posture problems.

Analyze the image carefully: {{media url=imageDataUri}}

Identify any issues from the following list. Only return issues from this list. If the posture is good, return an empty array for the issues.

Potential Issues:
${possibleIssues.map(issue => `- ${issue}`).join('\n')}

Respond with the list of identified issues.`,
});

const detectPostureIssuesFlow = ai.defineFlow(
  {
    name: 'detectPostureIssuesFlow',
    inputSchema: DetectPostureIssuesInputSchema,
    outputSchema: DetectPostureIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { issues: [] };
  }
);
