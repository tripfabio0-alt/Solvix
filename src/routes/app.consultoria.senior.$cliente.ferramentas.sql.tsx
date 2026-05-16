import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/sql')({
  component: SqlBrutalGenerator,
});

const SYSTEM_PROMPT = `Você é um Engenheiro de Software especialista em Senior Sistemas e SQL Senior 2.
Gere consultas SQL nativas e Cursores LSP.

Responda EXATAMENTE neste formato com delimitadores:
##TITULO##
##MODULO##
##TABELAS##
##DESCRICAO##
##SQL_NATIVO##
##SQL_CURSOR##
##VARIAVEIS##
##JOINS##
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
    descricao: get("DESCRICAO","SQL_NATIVO"),
    sql_nativo: get("SQL_NATIVO","SQL_CURSOR"),
    sql_cursor: get("SQL_CURSOR","VARIAVEIS"),
    variaveis: get("VARIAVEIS","JOINS"),
    joins: get("JOINS","DICAS"),
    dicas: get("DICAS","ATENCAO").split("\n").filter(Boolean),
    atencao: get("ATENCAO","FIM"),
  };
}

function SqlBrutalGenerator() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("cursor");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/gerar-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `[MODO SQL] ${input}` }),
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

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styles = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'monospace' },
    card: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '0', overflow: 'hidden' },
    header: { background: '#161b22', padding: '12px 16px', borderBottom: '1px solid #30363d', fontSize: '12px', color: '#8b949e', fontWeight: 'bold' as const },
    textarea: { width: '100%', minHeight: '120px', background: 'transparent', color: '#e6edf3', border: 'none', padding: '16px', outline: 'none', fontSize: '14px', resize: 'vertical' as const },
    footer: { padding: '12px 16px', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    btn: { background: '#238636', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold' as const, cursor: 'pointer' },
    resultBox: { marginTop: '20px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '0', overflow: 'hidden' },
    tabs: { display: 'flex', background: '#161b22', borderBottom: '1px solid #30363d' },
    tabBtn: (active: boolean) => ({ padding: '10px 20px', background: active ? '#0d1117' : 'transparent', color: active ? '#58a6ff' : '#8b949e', border: 'none', borderBottom: active ? '2px solid #58a6ff' : 'none', cursor: 'pointer', fontSize: '11px' }),
    code: { background: '#010409', padding: '20px', margin: '0', overflowX: 'auto' as const, color: '#79c0ff', fontSize: '13px', lineHeight: '1.6' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#58a6ff', marginBottom: '20px', fontSize: '18px' }}>SENIOR · GERADOR DE SQL SENIOR 2 (LIGHT VERSION)</h2>
      
      <div style={styles.card}>
        <div style={styles.header}>▶ CONSULTA SQL ERP</div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: Buscar pedidos em aberto..."
          style={styles.textarea}
        />
        <div style={styles.footer}>
          <div style={{ fontSize: '11px', color: '#484f58' }}>Performance isolada ativada</div>
          <button onClick={generate} disabled={loading} style={{...styles.btn, opacity: loading ? 0.5 : 1}}>
            {loading ? "GERANDO..." : "⚙ GERAR SQL"}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#ff7b72', marginTop: '10px', fontSize: '12px' }}>{error}</div>}

      {result && (
        <div style={styles.resultBox}>
          <div style={styles.tabs}>
            <button onClick={() => setTab("cursor")} style={styles.tabBtn(tab === "cursor")}>CURSOR LSP</button>
            <button onClick={() => setTab("sql")} style={styles.tabBtn(tab === "sql")}>SQL NATIVO</button>
            <button 
              onClick={() => copy(tab === "cursor" ? result.sql_cursor : result.sql_nativo)} 
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#58a6ff', fontSize: '10px', cursor: 'pointer', padding: '0 15px' }}
            >
              {copied ? "COPIADO!" : "COPIAR"}
            </button>
          </div>
          <pre style={styles.code}>{tab === "cursor" ? result.sql_cursor : result.sql_nativo}</pre>
        </div>
      )}
    </div>
  );
}
