import { cn } from '@/lib/utils';
import { ProjectStatus } from '@/types/project';
import { Loader2, Check, X, FileText, Wand2, Film, Mic, Play } from 'lucide-react';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ReactNode; className: string }> = {
  draft: { 
    label: 'Draft', 
    icon: <FileText className="w-3 h-3" />, 
    className: 'status-draft' 
  },
  extracting: { 
    label: 'Extracting', 
    icon: <Loader2 className="w-3 h-3 animate-spin" />, 
    className: 'status-processing' 
  },
  scripting: { 
    label: 'Writing Script', 
    icon: <Wand2 className="w-3 h-3 animate-pulse" />, 
    className: 'status-processing' 
  },
  matching_clips: { 
    label: 'Finding Clips', 
    icon: <Film className="w-3 h-3 animate-pulse" />, 
    className: 'status-processing' 
  },
  generating_voice: { 
    label: 'Generating Voice', 
    icon: <Mic className="w-3 h-3 animate-pulse" />, 
    className: 'status-processing' 
  },
  rendering: { 
    label: 'Rendering', 
    icon: <Play className="w-3 h-3 animate-pulse" />, 
    className: 'status-processing' 
  },
  completed: { 
    label: 'Completed', 
    icon: <Check className="w-3 h-3" />, 
    className: 'status-completed' 
  },
  failed: { 
    label: 'Failed', 
    icon: <X className="w-3 h-3" />, 
    className: 'status-failed' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      config.className,
      className
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}
