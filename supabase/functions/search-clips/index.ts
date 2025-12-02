import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, perPage = 5 } = await req.json();
    
    if (!keywords) {
      throw new Error('Keywords are required');
    }

    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
    if (!PEXELS_API_KEY) {
      throw new Error('PEXELS_API_KEY is not configured');
    }

    console.log('Searching Pexels for:', keywords);

    const searchQuery = encodeURIComponent(keywords);
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${searchQuery}&per_page=${perPage}&orientation=portrait&size=medium`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error:', errorText);
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract relevant video info
    const clips = data.videos?.map((video: any) => {
      // Find the best quality file (prefer HD)
      const videoFile = video.video_files?.find((f: any) => f.quality === 'hd' && f.width >= 720) 
        || video.video_files?.[0];
      
      return {
        id: video.id,
        url: videoFile?.link || '',
        thumbnail: video.image || '',
        duration: video.duration || 0,
        width: videoFile?.width || 0,
        height: videoFile?.height || 0,
        user: video.user?.name || 'Unknown',
      };
    }) || [];

    console.log(`Found ${clips.length} clips for "${keywords}"`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        clips,
        total: data.total_results || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search clips error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, clips: [] }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
