export type ProjectStatus = 
  | 'draft' 
  | 'extracting' 
  | 'scripting' 
  | 'matching_clips' 
  | 'generating_voice' 
  | 'rendering' 
  | 'completed' 
  | 'failed';

export interface Project {
  id: string;
  user_id: string | null;
  title: string;
  article_url: string | null;
  article_content: string | null;
  status: ProjectStatus;
  voice_type: string;
  voice_url: string | null;
  video_url: string | null;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface ScriptSegment {
  id: string;
  project_id: string;
  line_number: number;
  text: string;
  keywords: string | null;
  clip_url: string | null;
  clip_thumbnail: string | null;
  clip_duration: number;
  audio_start: number;
  audio_end: number;
  created_at: string;
  updated_at: string;
}

export interface VideoClip {
  id: number;
  url: string;
  thumbnail: string;
  duration: number;
  width: number;
  height: number;
  user: string;
}

export const VOICE_OPTIONS = [
  { id: 'aria', name: 'Aria', description: 'Warm & conversational' },
  { id: 'roger', name: 'Roger', description: 'Professional & clear' },
  { id: 'sarah', name: 'Sarah', description: 'Energetic & youthful' },
  { id: 'laura', name: 'Laura', description: 'Soft & soothing' },
  { id: 'charlie', name: 'Charlie', description: 'Friendly & casual' },
  { id: 'george', name: 'George', description: 'Deep & authoritative' },
  { id: 'liam', name: 'Liam', description: 'British & refined' },
  { id: 'charlotte', name: 'Charlotte', description: 'Elegant & clear' },
  { id: 'brian', name: 'Brian', description: 'American narrator' },
] as const;
