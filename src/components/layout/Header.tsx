import { Link, useLocation } from 'react-router-dom';
import { Film, Sparkles, Home, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">ReelForge</h1>
            <p className="text-xs text-muted-foreground">AI Article to Reels</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'secondary' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </Button>
          </Link>
          <Link to="/new">
            <Button variant="glow" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Reel</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
