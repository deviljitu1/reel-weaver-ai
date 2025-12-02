
-- Create projects table for storing reel generation projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  article_url TEXT,
  article_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'extracting', 'scripting', 'matching_clips', 'generating_voice', 'rendering', 'completed', 'failed')),
  voice_type TEXT DEFAULT 'alloy',
  voice_url TEXT,
  video_url TEXT,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create script_segments table for storing individual script lines
CREATE TABLE public.script_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  keywords TEXT,
  clip_url TEXT,
  clip_thumbnail TEXT,
  clip_duration NUMERIC DEFAULT 0,
  audio_start NUMERIC DEFAULT 0,
  audio_end NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, line_number)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_segments ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for script_segments
CREATE POLICY "Users can view segments of their projects" ON public.script_segments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (user_id = auth.uid() OR user_id IS NULL))
  );

CREATE POLICY "Users can create segments for their projects" ON public.script_segments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (user_id = auth.uid() OR user_id IS NULL))
  );

CREATE POLICY "Users can update segments of their projects" ON public.script_segments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (user_id = auth.uid() OR user_id IS NULL))
  );

CREATE POLICY "Users can delete segments of their projects" ON public.script_segments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (user_id = auth.uid() OR user_id IS NULL))
  );

-- Update timestamp trigger
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_script_segments_updated_at
  BEFORE UPDATE ON public.script_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_script_segments_project_id ON public.script_segments(project_id);
CREATE INDEX idx_script_segments_line_number ON public.script_segments(project_id, line_number);
