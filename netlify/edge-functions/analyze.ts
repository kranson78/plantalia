const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const ANALYSIS_PROMPT =
  'Przeanalizuj roślinę i odpowiedz TYLKO w JSON: {"plantName":"","plantNameLatin":"","overallHealth":"dobry","healthScore":80,"issues":[],"needs":[{"type":"water","urgent":false,"note":""},{"type":"light","urgent":false,"note":""},{"type":"nutrients","urgent":false,"note":""},{"type":"repot","urgent":false,"note":""}],"immediateAction":"","careAdvice":"","funFact":""}';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: 'Brak ANTHROPIC_API_KEY' } }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let imageBase64: string;
  let mimeType: string;
  try {
    const body = await request.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType ?? 'image/jpeg';
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Nieprawidłowy JSON' } }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
