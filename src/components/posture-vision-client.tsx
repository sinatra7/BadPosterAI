'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Camera, FileVideo, ListChecks, Play, Square, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AiCoach } from './ai-coach';
import { detectPostureIssues } from '@/ai/flows/detect-posture-issues';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from './ui/skeleton';

type Mode = 'webcam' | 'upload';

export function PostureVisionClient() {
  const [mode, setMode] = useState<Mode>('webcam');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedIssues, setDetectedIssues] = useState<string[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (mode !== 'webcam') {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setDetectedIssues([]);
        if (videoRef.current) {
          const videoUrl = URL.createObjectURL(file);
          videoRef.current.src = videoUrl;
          videoRef.current.onended = () => {
            URL.revokeObjectURL(videoUrl);
          };
        }
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid video file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAnalysis = async () => {
    if (mode === 'upload' && !videoFile) {
      toast({ title: "No Video", description: "Please upload a video file to start analysis." });
      return;
    }
    if (mode === 'webcam' && !hasCameraPermission) {
      toast({ title: "Camera Permission Needed", description: "Please allow camera access to start analysis.", variant: "destructive" });
      return;
    }

    if (!videoRef.current || videoRef.current.readyState < 2) {
      toast({ title: "Video Not Ready", description: "Please wait for the video to load.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setDetectedIssues([]);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx || canvas.width === 0 || canvas.height === 0) {
      toast({ title: "Error", description: "Could not capture video frame. Is your camera on?", variant: "destructive" });
      setIsAnalyzing(false);
      return;
    }
    
    videoRef.current.play(); // Ensure video is playing to capture a frame
    await new Promise(resolve => setTimeout(resolve, 100)); // Give it a moment to render the frame

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataUri = canvas.toDataURL('image/jpeg');

    if (mode === 'upload') {
      videoRef.current.pause();
    }

    try {
      const result = await detectPostureIssues({ imageDataUri });
      if (result.issues && result.issues.length > 0) {
        setDetectedIssues(result.issues);
      } else {
        toast({
          title: "Great Posture!",
          description: "Our AI didn't detect any major issues.",
        });
        setDetectedIssues([]);
      }
    } catch (error) {
      console.error('Error detecting posture issues:', error);
      toast({
        title: 'Analysis Failed',
        description: 'The AI could not analyze the image. Please try again with a clearer view.',
        variant: 'destructive',
      });
      setDetectedIssues([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Posture Analysis</CardTitle>
              <CardDescription>Upload a video or use your webcam to get real-time posture feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => {
                setMode(v as Mode);
                setDetectedIssues([]);
                setVideoFile(null);
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="webcam" disabled={isAnalyzing}><Camera className="mr-2" />Webcam</TabsTrigger>
                  <TabsTrigger value="upload" disabled={isAnalyzing}><FileVideo className="mr-2" />Upload</TabsTrigger>
                </TabsList>
                <div className="mt-4 p-4 border rounded-lg bg-background/50 relative aspect-video flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full rounded-md" playsInline muted autoPlay={mode === 'webcam'} loop={mode === 'upload'} />
                  {mode === 'webcam' && !hasCameraPermission && (
                     <Alert variant="destructive" className="absolute w-auto m-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access in your browser.
                        </AlertDescription>
                      </Alert>
                  )}
                  {!videoFile && mode === 'upload' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <FileVideo className="w-12 h-12 text-muted-foreground mb-2" />
                      <h3 className="font-semibold text-lg">Upload a video</h3>
                      <p className="text-muted-foreground text-sm">Select a video file to begin your analysis.</p>
                      <label htmlFor="video-upload" className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
                        Choose File
                      </label>
                      <input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button onClick={handleAnalysis} className="w-full" disabled={isAnalyzing || (mode === 'upload' && !videoFile) || (mode === 'webcam' && !hasCameraPermission)}>
                    {isAnalyzing ? <><LoaderCircle className="mr-2 animate-spin" />Analyzing...</> : <><Play className="mr-2" />Analyze Posture</>}
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-full">
                  <ListChecks className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline">Analysis Results</CardTitle>
                  <CardDescription>Detected posture issues from the analysis.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="min-h-[160px]">
              {isAnalyzing ? (
                 <div className="space-y-3 pt-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full" />
                 </div>
              ) : detectedIssues.length > 0 ? (
                <ul className="space-y-2">
                  {detectedIssues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm p-2 rounded-md bg-secondary/50">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Start the analysis to see results here.</p>
              )}
            </CardContent>
          </Card>
          <AiCoach issues={detectedIssues} />
        </div>
      </div>
    </div>
  );
}
