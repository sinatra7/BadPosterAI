'use client';

import { useState } from 'react';
import { postureRecommendations } from '@/ai/flows/posture-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface AiCoachProps {
  issues: string[];
}

export function AiCoach({ issues }: AiCoachProps) {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (issues.length === 0) {
      toast({
        title: 'No issues detected',
        description: 'Analyze your posture first to get recommendations.',
      });
      return;
    }

    setIsLoading(true);
    setRecommendations(null);

    try {
      const postureIssues = issues.join(', ');
      const result = await postureRecommendations({ postureIssues });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Error',
        description: 'Could not get recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline">AI Posture Coach</CardTitle>
            <CardDescription>Get personalized tips to improve your posture.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : recommendations ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-card-foreground">
            <p>{recommendations}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            After your analysis is complete, click the button below to get AI-powered advice on correcting the detected issues.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetRecommendations} disabled={isLoading || issues.length === 0} className="w-full bg-accent hover:bg-accent/90">
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Get AI Recommendations'}
        </Button>
      </CardFooter>
    </Card>
  );
}
