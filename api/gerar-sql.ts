import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { prompt } = req.body;
    // NOVA CHAVE FORNECIDA PELO USUÁRIO
    const GEMINI_API_KEY = 'AIzaSyDpmRE7jQNmbBKn_FM9cyN8Yn4liWH56rA';
    
    const systemPrompt = `Você é um Arquiteto de Soluções Sênior especialista em ERP Senior (Sapiens/Vetorh).
Sua missão é entregar uma solução SEMPRE dividida em 3 FASES: ##MAPA##, ##SQL##, ##LSP##.
NUNCA use blocos de código Markdown.`;

    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nRequisição: ${prompt}` }] }]
        })
      });

      const data = await geminiRes.json();
      if (data.error) throw new Error(data.error.message);

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA';
      return res.status(200).json({ resultado: responseText });
    } catch (e: any) {
      return res.status(500).json({ error: 'Erro Técnico: ' + e.message });
    }

    // Se chegar aqui, todos falharam
    return res.status(500).json({ error: `Todos os modelos falharam. Último erro: ${lastError}` });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
