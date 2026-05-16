import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { prompt } = req.body;
    const GEMINI_API_KEY = 'AIzaSyDpmRE7jQNmbBKn_FM9cyN8Yn4liWH56rA';
    
    // 1. DESCOBERTA AUTOMÁTICA DE MODELOS
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const listData = await listRes.json();

    if (listData.error) {
      throw new Error(`Erro ao listar modelos: ${listData.error.message}`);
    }

    // Filtra modelos que suportam geração de conteúdo
    const availableModels = listData.models
      ?.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
      ?.map((m: any) => m.name);

    if (!availableModels || availableModels.length === 0) {
      throw new Error('Nenhum modelo de geração encontrado para esta chave.');
    }

    // Tenta usar o melhor disponível (preferência por flash para velocidade)
    const modelToUse = availableModels.find((n: string) => n.includes('flash')) || availableModels[0];

    const systemPrompt = `Você é um Arquiteto de Soluções Sênior especialista em ERP Senior (Sapiens/Vetorh).
Sua missão é entregar uma solução SEMPRE dividida em 3 FASES: ##MAPA##, ##SQL##, ##LSP##.
NUNCA use blocos de código Markdown.`;

    // 2. GERAÇÃO DE CONTEÚDO COM O MODELO DESCOBERTO
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nRequisição: ${prompt}` }] }]
      })
    });

    const data = await geminiRes.json();
    if (data.error) throw new Error(data.error.message);

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA';
    return res.status(200).json({ resultado: responseText, modelo: modelToUse });

  } catch (err: any) {
    return res.status(500).json({ error: 'Erro de Autoconfiguração: ' + err.message });
  }
}
