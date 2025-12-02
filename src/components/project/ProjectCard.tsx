import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Film, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { Project } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isProcessing = ['extracting', 'scripting', 'matching_clips', 'generating_voice', 'rendering'].includes(project.status);
  
  return (
    <Link to={`/project/${project.id}`}>
      <article className={cn(
        'glass-card p-5 group cursor-pointer animate-fade-in',
        isProcessing && 'pulse-glow'
      )}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.article_url && (
              <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                {new URL(project.article_url).hostname}
              </p>
            )}
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </div>
          
          <Button variant="ghost" size="sm" className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Open
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {project.status === 'completed' && project.video_url && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="aspect-[9/16] max-h-32 rounded-lg bg-secondary overflow-hidden">
              <video 
                src={project.video_url} 
                className="w-full h-full object-cover"
                muted
                preload="metadata"
              />
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}
