import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) throw new Error('Chave GEMINI_API_KEY não configurada.');

    const modelToUse = 'gemini-flash-latest';
    
    // Prompt ultra-especializado para Senior Sistemas
    const systemPrompt = `Você é um Arquiteto de Soluções Sênior especialista em ERP Senior (Sapiens/Vetorh).
Sua missão é entregar um MAPA DE SOLUÇÃO COMPLETO e PROFISSIONAL.

Sempre estruture sua resposta com as seguintes seções (use estas tags exatamente):

##EXPLICACOES##
Aqui você deve agir como consultor:
1. OBJETIVO: Resumo da solução.
2. PASSO A PASSO: Onde o usuário deve ir no sistema Senior (Nome da tela, caminho do menu).
3. CONFIGURAÇÃO: Qual Identificador de Regra (IR) ou Variável de Sistema deve ser usada.
4. MAPA TÉCNICO: Explicação lógica de como a solução funciona.

##CONTEUDO##
vTexto = "Olá Senior";
...`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nRequisição: ${prompt}` }] }]
      })
    });

    const data = await geminiRes.json();
    
    if (data.error) throw new Error(`Erro Google: ${data.error.message}`);

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA';
    return res.status(200).json({ resultado: responseText });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
