import { useState } from 'react';
import { Mic, Play, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VOICE_OPTIONS } from '@/types/project';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  onGenerateVoice: () => Promise<void>;
  voiceUrl: string | null;
  isGenerating?: boolean;
  scriptText: string;
}

export function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  onGenerateVoice,
  voiceUrl,
  isGenerating,
  scriptText,
}: VoiceSelectorProps) {
  const [playing, setPlaying] = useState(false);

  const playVoice = () => {
    if (!voiceUrl) return;
    const audio = new Audio(voiceUrl);
    audio.play();
    setPlaying(true);
    audio.onended = () => setPlaying(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Voice Selection</h3>
          <p className="text-sm text-muted-foreground">Choose a voice for your Reel narration</p>
        </div>
        <Button onClick={onGenerateVoice} disabled={isGenerating || !scriptText} variant="glow">
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
          ) : (
            <><Mic className="w-4 h-4 mr-2" />Generate Voice</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {VOICE_OPTIONS.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onSelectVoice(voice.id)}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              selectedVoice === voice.id
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-border bg-secondary/50 hover:border-primary/50'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="font-medium">{voice.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{voice.description}</p>
          </button>
        ))}
      </div>

      {voiceUrl && (
        <div className="glass-card p-4 flex items-center gap-4">
          <Button onClick={playVoice} variant="outline" size="icon" disabled={playing}>
            <Play className={cn('w-5 h-5', playing && 'animate-pulse')} />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium">Voice Preview Ready</p>
            <p className="text-xs text-muted-foreground">Click play to listen</p>
          </div>
        </div>
      )}
    </div>
  );
}
