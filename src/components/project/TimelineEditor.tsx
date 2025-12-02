import { useState } from 'react';
import { GripVertical, Search, Play, RefreshCw, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScriptSegment } from '@/types/project';
import { ClipSelector } from './ClipSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimelineEditorProps {
  segments: ScriptSegment[];
  onUpdateSegment: (id: string, updates: Partial<ScriptSegment>) => Promise<void>;
  onAutoMatchClips: () => Promise<void>;
  isMatching?: boolean;
}

export function TimelineEditor({
  segments,
  onUpdateSegment,
  onAutoMatchClips,
  isMatching,
}: TimelineEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clipsMatched = segments.filter(s => s.clip_url).length;
  const progress = segments.length > 0 ? (clipsMatched / segments.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Timeline Editor</h3>
          <p className="text-sm text-muted-foreground">
            {clipsMatched} of {segments.length} clips matched
          </p>
        </div>
        <Button
          onClick={onAutoMatchClips}
          disabled={isMatching || segments.length === 0}
          variant="glow"
        >
          {isMatching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Matching...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto-Match All
            </>
          )}
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className={cn(
              'timeline-segment overflow-hidden transition-all duration-300',
              expandedId === segment.id && 'active'
            )}
          >
            <div
              className="flex items-center gap-4 p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === segment.id ? null : segment.id)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>

              {/* Clip thumbnail or placeholder */}
              <div className="w-16 h-12 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                {segment.clip_thumbnail ? (
                  <img
                    src={segment.clip_thumbnail}
                    alt={`Clip ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Image className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{segment.text}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {segment.keywords || 'No keywords'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {segment.clip_duration > 0 && (
                  <span className="px-2 py-1 bg-secondary rounded text-xs">
                    {segment.clip_duration}s
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expandedId === segment.id ? null : segment.id);
                  }}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Expanded clip selector */}
            {expandedId === segment.id && (
              <div className="px-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
                <ClipSelector
                  segment={segment}
                  onSelectClip={async (url, thumbnail, duration) => {
                    await onUpdateSegment(segment.id, {
                      clip_url: url,
                      clip_thumbnail: thumbnail,
                      clip_duration: duration,
                    });
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No segments to match. Create a script first.
          </p>
        </div>
      )}
    </div>
  );
}
