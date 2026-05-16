import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspBrutalGenerator,
});

const SYSTEM_PROMPT = `Você é um Engenheiro de Software Sênior especialista em Senior Sistemas e linguagem LSP.
Gere regras LSP no padrão Senior 2.

Responda EXATAMENTE neste formato com delimitadores:
##TITULO##
##MODULO##
##TABELAS##
##DESCRICAO##
##CONTEUDO##
##VARIAVEIS##
##DICAS##
##ATENCAO##
##FIM##`;

function parseResponse(text: string) {
  const get = (tag: string, next: string) => {
    const s = text.indexOf(`##${tag}##`);
    if (s === -1) return "";
    const after = s + tag.length + 4;
    const e = text.indexOf(`##${next}##`, after);
    return (e === -1 ? text.slice(after) : text.slice(after, e)).trim();
  };
  return {
    titulo: get("TITULO","MODULO"),
    modulo: get("MODULO","TABELAS"),
    tabelas: get("TABELAS","DESCRICAO").split("\n").filter(Boolean),
    descricao: get("DESCRICAO","CONTEUDO"),
    conteudo: get("CONTEUDO","VARIAVEIS"),
    variaveis: get("VARIAVEIS","DICAS"),
    dicas: get("DICAS","ATENCAO").split("\n").filter(Boolean),
    atencao: get("ATENCAO","FIM"),
  };
}

function LspBrutalGenerator() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/gerar-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `[MODO LSP] ${input}` }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(parseResponse(data.resultado));
    } catch (err: any) {
      setError(err.message || "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.conteudo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estilos em linha para evitar conflitos de CSS
  const styles = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'monospace' },
    card: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '0', overflow: 'hidden' },
    header: { background: '#161b22', padding: '12px 16px', borderBottom: '1px solid #30363d', fontSize: '12px', color: '#8b949e', fontWeight: 'bold' as const },
    textarea: { width: '100%', minHeight: '120px', background: 'transparent', color: '#e6edf3', border: 'none', padding: '16px', outline: 'none', fontSize: '14px', resize: 'vertical' as const },
    footer: { padding: '12px 16px', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    btn: { background: '#238636', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold' as const, cursor: 'pointer' },
    resultBox: { marginTop: '20px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '20px' },
    code: { background: '#010409', padding: '16px', borderRadius: '6px', overflowX: 'auto' as const, color: '#d2a8ff', fontSize: '13px', lineHeight: '1.6' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#58a6ff', marginBottom: '20px', fontSize: '18px' }}>SENIOR · GERADOR DE REGRA LSP (LIGHT VERSION)</h2>
      
      <div style={styles.card}>
        <div style={styles.header}>▶ DESCREVA A LÓGICA DESEJADA</div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: Validar limite de crédito do cliente..."
          style={styles.textarea}
        />
        <div style={styles.footer}>
          <div style={{ fontSize: '11px', color: '#484f58' }}>Isolamento de performance ativado</div>
          <button onClick={generate} disabled={loading} style={{...styles.btn, opacity: loading ? 0.5 : 1}}>
            {loading ? "PROCESSANDO..." : "⚙ GERAR REGRA"}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#ff7b72', marginTop: '10px', fontSize: '12px' }}>{error}</div>}

      {result && (
        <div style={styles.resultBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#8b949e', fontSize: '12px' }}>CÓDIGO LSP GERADO</span>
            <button onClick={copy} style={{ background: '#30363d', color: '#c9d1d9', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>
              {copied ? "COPIADO!" : "COPIAR"}
            </button>
          </div>
          <pre style={styles.code}>{result.conteudo}</pre>
          
          <div style={{ marginTop: '15px', color: '#8b949e', fontSize: '11px' }}>
            <strong>TABELAS:</strong> {result.tabelas.join(", ")}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#484f58', fontSize: '12px' }}>
          Interface simplificada para evitar travamentos de mouse.
        </div>
      )}
    </div>
  );
}
