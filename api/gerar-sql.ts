import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { prompt } = req.body;
    
    // USANDO VARIÁVEL DE AMBIENTE (SEGURANÇA)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Configuração Pendente: A chave GEMINI_API_KEY não foi encontrada nas Variáveis de Ambiente da Vercel.' });
    }
    
    // 1. DESCOBERTA AUTOMÁTICA DE MODELOS
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const listData = await listRes.json();

    if (listData.error) {
      throw new Error(`Erro ao listar modelos: ${listData.error.message}`);
    }

    const availableModels = listData.models
      ?.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
      ?.map((m: any) => m.name);

    if (!availableModels || availableModels.length === 0) {
      throw new Error('Nenhum modelo de geração encontrado para esta chave.');
    }

    const modelToUse = availableModels.find((n: string) => n.includes('flash')) || availableModels[0];

    let systemPrompt = `Você é um Arquiteto de Soluções Sênior especialista em ERP Senior (Sapiens/Vetorh).
Sua missão é entregar uma solução SEMPRE dividida em 3 FASES: ##MAPA##, ##SQL##, ##LSP##.
NUNCA use blocos de código Markdown.`;

    if (prompt.startsWith('[SUGERIR CONTEXTO]')) {
      systemPrompt = `Você é um Analista de Sistemas Senior ERP Senior. 
Ao receber um requisito, responda APENAS os dados técnicos necessários para a implementação no formato:
TELAS: [Nomes das Telas]
TABELAS: [Nomes das Tabelas]
CAMPOS: [Nomes dos Campos]
NUNCA use introduções, saudações ou explicações. Seja 100% técnico e direto.`;
    }

    // 2. GERAÇÃO DE CONTEÚDO
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
