import { useState } from 'react';
import { Link2, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ArticleInputProps {
  onExtract: (url: string, title: string, content: string) => Promise<void>;
  isLoading?: boolean;
}

export function ArticleInput({ onExtract, isLoading }: ArticleInputProps) {
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter an article URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch(
        `https://wtqloayzvoslgsgqjjin.supabase.co/functions/v1/extract-article`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to extract article');
      }

      toast.success('Article extracted successfully!');
      await onExtract(url, data.title, data.content);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to extract article');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
          <Link2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Paste Your Article URL</h2>
        <p className="text-muted-foreground">
          We'll extract the content and transform it into an engaging Reel script
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/your-article"
            className="pr-32 h-14 text-base"
            disabled={extracting || isLoading}
          />
          <Button
            type="submit"
            disabled={extracting || isLoading || !url.trim()}
            className="absolute right-2 top-2 h-10"
            variant="glow"
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Extract
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Supported sources: News articles, blog posts, Medium, Substack, and more
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['medium.com', 'substack.com', 'techcrunch.com', 'theverge.com'].map((domain) => (
            <span
              key={domain}
              className="px-3 py-1 bg-secondary rounded-full text-xs text-secondary-foreground"
            >
              {domain}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
