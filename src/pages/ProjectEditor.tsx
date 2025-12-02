import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StepIndicator } from '@/components/project/StepIndicator';
import { ScriptEditor } from '@/components/project/ScriptEditor';
import { TimelineEditor } from '@/components/project/TimelineEditor';
import { VoiceSelector } from '@/components/project/VoiceSelector';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/useProject';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const { project, segments, loading, updateProject, updateSegment, addSegments, reorderSegments, refetch } = useProject(id || null);
  const [currentStep, setCurrentStep] = useState('script');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  useEffect(() => {
    if (project?.status === 'scripting' && project.article_content && segments.length === 0) {
      generateScript();
    }
  }, [project?.id]);

  const generateScript = async () => {
    if (!project?.article_content) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('https://wtqloayzvoslgsgqjjin.supabase.co/functions/v1/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: project.article_content, title: project.title }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      const newSegments = data.segments.map((seg: any, idx: number) => ({
        project_id: project.id,
        line_number: idx + 1,
        text: seg.line,
        keywords: seg.keywords,
        clip_url: null,
        clip_thumbnail: null,
        clip_duration: 0,
        audio_start: 0,
        audio_end: 0,
      }));

      await addSegments(newSegments);
      await updateProject({ status: 'draft' });
      toast.success('Script generated!');
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setIsRegenerating(false);
    }
  };

  const autoMatchClips = async () => {
    setIsMatching(true);
    try {
      for (const segment of segments) {
        if (!segment.keywords) continue;
        const response = await fetch('https://wtqloayzvoslgsgqjjin.supabase.co/functions/v1/search-clips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: segment.keywords, perPage: 1 }),
        });
        const data = await response.json();
        if (data.success && data.clips.length > 0) {
          const clip = data.clips[0];
          await updateSegment(segment.id, {
            clip_url: clip.url,
            clip_thumbnail: clip.thumbnail,
            clip_duration: clip.duration,
          });
        }
      }
      toast.success('Clips matched!');
    } catch (error) {
      toast.error('Failed to match clips');
    } finally {
      setIsMatching(false);
    }
  };

  const generateVoice = async () => {
    if (!project || segments.length === 0) return;
    setIsGeneratingVoice(true);
    try {
      const fullScript = segments.map(s => s.text).join(' ');
      const response = await fetch('https://wtqloayzvoslgsgqjjin.supabase.co/functions/v1/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullScript, voiceType: project.voice_type }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      const voiceUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
      await updateProject({ voice_url: voiceUrl, duration: data.estimatedDuration });
      toast.success('Voiceover generated!');
    } catch (error) {
      toast.error('Failed to generate voice');
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const getCompletedSteps = () => {
    const completed: string[] = ['input'];
    if (segments.length > 0) completed.push('script');
    if (segments.some(s => s.clip_url)) completed.push('clips');
    if (project?.voice_url) completed.push('voice');
    return completed;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">{project.article_url}</p>
        </div>

        <StepIndicator currentStep={currentStep} completedSteps={getCompletedSteps()} />

        <div className="flex gap-2 justify-center mb-8">
          {['script', 'clips', 'voice'].map((step) => (
            <Button
              key={step}
              variant={currentStep === step ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStep(step)}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </Button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === 'script' && (
            <ScriptEditor
              segments={segments}
              articleContent={project.article_content}
              onUpdateSegment={updateSegment}
              onRegenerate={generateScript}
              onAddSegment={() => {
                const newSeg = {
                  project_id: project.id,
                  line_number: segments.length + 1,
                  text: '',
                  keywords: '',
                  clip_url: null,
                  clip_thumbnail: null,
                  clip_duration: 0,
                  audio_start: 0,
                  audio_end: 0,
                };
                supabase.from('script_segments').insert(newSeg).select().then(({ data }) => {
                  if (data) refetch();
                });
              }}
              onDeleteSegment={async (id) => {
                await supabase.from('script_segments').delete().eq('id', id);
                refetch();
              }}
              onReorder={reorderSegments}
              isRegenerating={isRegenerating}
            />
          )}

          {currentStep === 'clips' && (
            <TimelineEditor
              segments={segments}
              onUpdateSegment={updateSegment}
              onAutoMatchClips={autoMatchClips}
              isMatching={isMatching}
            />
          )}

          {currentStep === 'voice' && (
            <VoiceSelector
              selectedVoice={project.voice_type}
              onSelectVoice={(voice) => updateProject({ voice_type: voice })}
              onGenerateVoice={generateVoice}
              voiceUrl={project.voice_url}
              isGenerating={isGeneratingVoice}
              scriptText={segments.map(s => s.text).join(' ')}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
