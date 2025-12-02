import { useState } from 'react';
import { Search, RefreshCw, Play, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoClip, ScriptSegment } from '@/types/project';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClipSelectorProps {
  segment: ScriptSegment;
  onSelectClip: (clipUrl: string, thumbnail: string, duration: number) => Promise<void>;
}

export function ClipSelector({ segment, onSelectClip }: ClipSelectorProps) {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(segment.keywords || '');
  const [selectedClipId, setSelectedClipId] = useState<number | null>(null);

  const searchClips = async () => {
    if (!searchQuery.trim()) {
      toast.error('Enter keywords to search');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://wtqloayzvoslgsgqjjin.supabase.co/functions/v1/search-clips`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: searchQuery, perPage: 8 }),
        }
      );

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search clips');
      }

      setClips(data.clips);
      if (data.clips.length === 0) {
        toast.info('No clips found. Try different keywords.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to search clips');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClip = async (clip: VideoClip) => {
    setSelectedClipId(clip.id);
    await onSelectClip(clip.url, clip.thumbnail, clip.duration);
    toast.success('Clip selected');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search keywords..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && searchClips()}
        />
        <Button onClick={searchClips} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {segment.clip_thumbnail && (
        <div className="relative rounded-lg overflow-hidden border border-primary bg-secondary">
          <img
            src={segment.clip_thumbnail}
            alt="Current clip"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
            Current
          </span>
        </div>
      )}

      {clips.length > 0 && (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
          {clips.map((clip) => (
            <button
              key={clip.id}
              onClick={() => handleSelectClip(clip)}
              className={cn(
                'relative rounded-lg overflow-hidden border transition-all hover:border-primary group',
                selectedClipId === clip.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'
              )}
            >
              <img
                src={clip.thumbnail}
                alt={`Clip ${clip.id}`}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
                {clip.duration}s
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
