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

    const modelToUse = 'gemini-2.0-flash'; // Modelo confirmado na sua chave
    
    // Lógica para sugestão de contexto técnico
    if (prompt.startsWith('[SUGERIR CONTEXTO]')) {
      const suggestPrompt = `Você é um Analista Senior Senior. 
Sugira Tabelas, Campos e Telas Senior (Sapiens) para o requisito abaixo. Seja curto.
Ex: Tabelas: E120PED | Campos: CodCli | Telas: F120GPD.
Requisito: ${prompt.replace('[SUGERIR CONTEXTO]', '')}`;

      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: suggestPrompt }] }]
          })
        });
        const data = await geminiRes.json();
        if (data.error) throw new Error(data.error.message);
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tabelas: \nCampos: ';
        return res.status(200).json({ resultado: responseText });
      } catch (e: any) {
        return res.status(500).json({ error: 'Erro ao sugerir contexto: ' + e.message });
      }
    }

    // Prompt ultra-especializado para Senior Sistemas (3 Fases)
    const systemPrompt = `Você é um Arquiteto de Soluções Sênior especialista em ERP Senior (Sapiens/Vetorh).
Sua missão é entregar uma solução SEMPRE dividida em 3 FASES.

É OBRIGATÓRIO que sua resposta contenha exatamente estas 3 tags em todas as interações:

##MAPA##
Forneça o ROADMAP ESTRUTURADO: 
1. Telas Envolvidas.
2. Identificadores de Regra (IR).
3. Passo a passo técnico de configuração.

##SQL##
Forneça o SCRIPT SQL. 
Se a solução não exigir SQL, você DEVE escrever: "Nenhum script SQL necessário para esta solução, pois a lógica é tratada via LSP."

##LSP##
Forneça a REGRA LSP. 
Se a solução não exigir LSP, você DEVE escrever: "Nenhuma regra LSP necessária para esta solução, pois a lógica é tratada via SQL/Processo Nativo."

REGRAS CRÍTICAS:
- NUNCA use blocos de código Markdown (\`\`\`) dentro ou fora das tags.
- Mantenha o texto limpo e profissional.
- Se o usuário usar [MODO SQL], foque a inteligência no SQL, mas mantenha o MAPA e a tag LSP vazia/com a mensagem padrão.`;

    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`, {
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
      return res.status(500).json({ error: 'Erro na Google API: ' + e.message });
    }

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
