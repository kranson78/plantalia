exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { imageBase64, mimeType } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: 'Przeanalizuj roślinę i odpowiedz TYLKO w JSON: {"plantName":"","plantNameLatin":"","overallHealth":"dobry","healthScore":80,"issues":[],"needs":[{"type":"water","urgent":false,"note":""},{"type":"light","urgent":false,"note":""},{"type":"nutrients","urgent":false,"note":""},{"type":"repot","urgent":false,"note":""}],"immediateAction":"","careAdvice":"","funFact":""}' }
        ]
      }]
    })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
};
