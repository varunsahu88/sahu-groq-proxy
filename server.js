import express from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

// CORS (app has no cookies)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  next();
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing GROQ_API_KEY on server' });

    const prompt = String(req.body?.prompt || '').slice(0, 12000);
    if (!prompt.trim()) return res.status(400).json({ ok: false, error: 'Missing prompt' });

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 900,
        stream: false,
        messages: [
          {
            role: 'system',
            content:
              'You are a practical fitness coach. Reply in natural Hinglish. Be concise and specific. Use short bullets when useful. Avoid unsafe medical claims.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const raw = await r.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }

    if (!r.ok) {
      const msg = data?.error?.message || data?.error || data?.message || raw || `HTTP ${r.status}`;
      return res.status(502).json({ ok: false, error: String(msg).slice(0, 800) });
    }

    const text = data?.choices?.[0]?.message?.content || '';
    return res.json({ ok: true, text: String(text).trim(), provider: 'groq' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`groq-proxy listening on :${port}`);
});
