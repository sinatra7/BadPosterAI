import { Bone } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Bone className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">Posture Vision</h1>
        </div>
      </div>
    </header>
  );
}
