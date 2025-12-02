import { useState } from 'react';
import { Wand2, Save, GripVertical, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScriptSegment } from '@/types/project';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScriptEditorProps {
  segments: ScriptSegment[];
  articleContent: string | null;
  onUpdateSegment: (id: string, updates: Partial<ScriptSegment>) => Promise<void>;
  onRegenerate: () => Promise<void>;
  onAddSegment: () => void;
  onDeleteSegment: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isRegenerating?: boolean;
}

export function ScriptEditor({
  segments,
  articleContent,
  onUpdateSegment,
  onRegenerate,
  onAddSegment,
  onDeleteSegment,
  onReorder,
  isRegenerating,
}: ScriptEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Script Editor</h3>
          <p className="text-sm text-muted-foreground">
            {segments.length} segments • Drag to reorder
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={!articleContent || isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={onAddSegment}>
            <Plus className="w-4 h-4 mr-2" />
            Add Line
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'timeline-segment p-4',
              draggedIndex === index && 'opacity-50',
              editingId === segment.id && 'active'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-2 pt-1">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <Textarea
                  value={segment.text}
                  onChange={(e) => {
                    onUpdateSegment(segment.id, { text: e.target.value });
                  }}
                  onFocus={() => setEditingId(segment.id)}
                  onBlur={() => setEditingId(null)}
                  placeholder="Enter script line..."
                  className="min-h-[60px] resize-none"
                />
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={segment.keywords || ''}
                      onChange={(e) => onUpdateSegment(segment.id, { keywords: e.target.value })}
                      placeholder="Keywords for clips (e.g., technology, innovation)"
                      className="text-sm h-9"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteSegment(segment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Wand2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No script segments yet. Click "Regenerate" to create from article or "Add Line" to start manually.
          </p>
        </div>
      )}
    </div>
  );
}
