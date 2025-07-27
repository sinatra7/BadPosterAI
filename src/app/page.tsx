import { Header } from '@/components/header';
import { PostureVisionClient } from '@/components/posture-vision-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <PostureVisionClient />
      </main>
    </div>
  );
}
