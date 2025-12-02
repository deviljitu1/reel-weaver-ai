import { cn } from '@/lib/utils';
import { Check, FileText, Wand2, Film, Mic, Play } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { id: 'input', label: 'Article', icon: <FileText className="w-4 h-4" /> },
  { id: 'script', label: 'Script', icon: <Wand2 className="w-4 h-4" /> },
  { id: 'clips', label: 'Clips', icon: <Film className="w-4 h-4" /> },
  { id: 'voice', label: 'Voice', icon: <Mic className="w-4 h-4" /> },
  { id: 'export', label: 'Export', icon: <Play className="w-4 h-4" /> },
];

interface StepIndicatorProps {
  currentStep: string;
  completedSteps: string[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isPending = !isCompleted && !isCurrent;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'step-indicator',
                  isCompleted && 'completed',
                  isCurrent && 'active',
                  isPending && 'pending'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span className={cn(
                'text-xs font-medium',
                isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                'w-12 h-0.5 mx-2 rounded-full transition-colors',
                isCompleted ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
