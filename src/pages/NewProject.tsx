import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ArticleInput } from '@/components/project/ArticleInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function NewProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleExtract = async (url: string, title: string, content: string) => {
    setLoading(true);
    try {
      // Create new project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title,
          article_url: url,
          article_content: content,
          status: 'scripting',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created! Generating script...');
      navigate(`/project/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Create New Reel</h1>
            <p className="text-muted-foreground">
              Start by pasting an article URL to transform into viral content
            </p>
          </div>
          <ArticleInput onExtract={handleExtract} isLoading={loading} />
        </div>
      </div>
    </Layout>
  );
}
