import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, category } = await req.json();

    if (!title || !description || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, description, category' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Classifying issue priority for:', { title, category });

    const prompt = `Analyze this civic issue and classify its priority based on safety, urgency, and community impact:

Title: ${title}
Description: ${description}
Category: ${category}

Classify as:
- HIGH: Critical issues that risk safety, health, or urgent infrastructure damage (water main breaks, gas leaks, fallen power lines, major road hazards, fire safety issues)
- MEDIUM: Problems that disrupt normal functioning but are not life-threatening (potholes, broken streetlights, traffic signal issues, moderate water leaks)
- LOW: Minor inconveniences or aesthetic issues (graffiti, litter, minor tree maintenance, noise complaints)

Respond with only: HIGH, MEDIUM, or LOW`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          { role: 'system', content: 'You are an expert civic issue classifier. Respond only with the priority level.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to classify priority', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const priorityText = data.choices[0].message.content.trim().toUpperCase();
    
    // Map to numeric priority (1=Low, 2=Medium, 3=High)
    let priority = 2; // Default to Medium
    if (priorityText === 'HIGH') priority = 3;
    else if (priorityText === 'LOW') priority = 1;

    console.log('Classified priority:', priorityText, '-> numeric:', priority);

    return new Response(JSON.stringify({ 
      priority, 
      priorityText,
      reasoning: `Classified as ${priorityText} priority based on safety and urgency assessment`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in classify-issue-priority function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});