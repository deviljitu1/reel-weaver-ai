import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ScriptSegment, ProjectStatus } from '@/types/project';
import { toast } from 'sonner';

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData as Project);

      const { data: segmentsData, error: segmentsError } = await supabase
        .from('script_segments')
        .select('*')
        .eq('project_id', projectId)
        .order('line_number', { ascending: true });

      if (segmentsError) throw segmentsError;
      setSegments(segmentsData as ScriptSegment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const updateProject = async (updates: Partial<Project>) => {
    if (!projectId) return;
    
    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to update project');
      return;
    }

    setProject(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateStatus = async (status: ProjectStatus) => {
    await updateProject({ status });
  };

  const updateSegment = async (segmentId: string, updates: Partial<ScriptSegment>) => {
    const { error } = await supabase
      .from('script_segments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', segmentId);

    if (error) {
      toast.error('Failed to update segment');
      return;
    }

    setSegments(prev => 
      prev.map(seg => seg.id === segmentId ? { ...seg, ...updates } : seg)
    );
  };

  const addSegments = async (newSegments: Omit<ScriptSegment, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (!projectId) return;

    // Delete existing segments
    await supabase
      .from('script_segments')
      .delete()
      .eq('project_id', projectId);

    // Insert new segments
    const { data, error } = await supabase
      .from('script_segments')
      .insert(newSegments)
      .select();

    if (error) {
      toast.error('Failed to save segments');
      return;
    }

    setSegments(data as ScriptSegment[]);
  };

  const reorderSegments = async (fromIndex: number, toIndex: number) => {
    const newSegments = [...segments];
    const [removed] = newSegments.splice(fromIndex, 1);
    newSegments.splice(toIndex, 0, removed);

    // Update line numbers
    const updates = newSegments.map((seg, idx) => ({
      id: seg.id,
      line_number: idx + 1,
    }));

    // Optimistic update
    setSegments(newSegments.map((seg, idx) => ({ ...seg, line_number: idx + 1 })));

    // Persist to database
    for (const update of updates) {
      await supabase
        .from('script_segments')
        .update({ line_number: update.line_number })
        .eq('id', update.id);
    }
  };

  return {
    project,
    segments,
    loading,
    error,
    updateProject,
    updateStatus,
    updateSegment,
    addSegments,
    reorderSegments,
    refetch: fetchProject,
  };
}
