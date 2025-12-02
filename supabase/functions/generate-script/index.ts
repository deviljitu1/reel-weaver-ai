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
    const { content, title } = await req.json();
    
    if (!content) {
      throw new Error('Article content is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Generating script for article:', title);

    const prompt = `You are a viral short-form content creator. Analyze this article and create a powerful, engaging script for a 30-60 second Reel/TikTok video.

Article Title: ${title}

Article Content:
${content}

Create a script with exactly 5-8 short, punchy lines. Each line should be:
- Under 15 words
- Emotionally engaging and hook-driven
- Written in conversational, viral-style language
- Perfect for voiceover timing

Also extract 2-3 visual keywords per line for finding relevant stock footage.

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "segments": [
    {"line": "Your first punchy line here", "keywords": "keyword1, keyword2"},
    {"line": "Your second engaging line", "keywords": "keyword1, keyword2"}
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated');
    }

    console.log('Raw Gemini response:', generatedText);

    // Parse the JSON response
    let scriptData;
    try {
      // Clean up the response - remove any markdown formatting
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      scriptData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse script response');
      }
    }

    console.log('Generated script segments:', scriptData.segments?.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        segments: scriptData.segments || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate script error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
