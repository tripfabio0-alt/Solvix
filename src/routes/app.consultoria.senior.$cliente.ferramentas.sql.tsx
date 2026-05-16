import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/sql')({
  component: SqlZeroRenderGenerator,
});

function SqlZeroRenderGenerator() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const text = inputRef.current?.value || "";
    if (!text.trim() || loading) return;
    
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/gerar-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `[MODO SQL] ${text}` }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const raw = data.resultado;
      const get = (tag: string) => {
        const s = raw.indexOf(`##${tag}##`);
        if (s === -1) return "";
        const after = s + tag.length + 4;
        const e = raw.indexOf(`##`, after);
        return (e === -1 ? raw.slice(after) : raw.slice(after, e)).trim();
      };

      setResult({
        conteudo: get("SQL_CURSOR"),
        nativo: get("SQL_NATIVO")
      });
    } catch (err: any) {
      setError(err.message || "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' },
    card: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    header: { background: '#161b22', padding: '15px 20px', borderBottom: '1px solid #30363d', fontSize: '11px', color: '#58a6ff', fontWeight: 'bold' as const, letterSpacing: '1px' },
    textarea: { width: '100%', minHeight: '160px', background: 'transparent', color: '#e6edf3', border: 'none', padding: '20px', outline: 'none', fontSize: '15px', resize: 'vertical' as const, fontFamily: 'monospace' },
    footer: { padding: '15px 20px', background: '#090c10', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'flex-end' },
    btn: { background: '#238636', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '12px' },
    codeBlock: { marginTop: '20px', background: '#010409', border: '1px solid #30363d', borderRadius: '8px', padding: '20px' }
  };

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ color: '#f0f6fc', fontSize: '20px', fontWeight: 600 }}>Gerador SQL Senior</h1>
        <p style={{ color: '#8b949e', fontSize: '12px' }}>Modo de Performance Isolada (Zero Lag)</p>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>CONSULTA SQL / CURSOR</div>
        <textarea
          ref={inputRef}
          defaultValue=""
          spellCheck={false}
          placeholder="Descreva a consulta... (Performance máxima ativada)"
          style={styles.textarea}
        />
        <div style={styles.footer}>
          <button onClick={generate} disabled={loading} style={{...styles.btn, background: loading ? '#1a4a25' : '#238636'}}>
            {loading ? "CONSTRUINDO..." : "GERAR SQL E CURSOR"}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#ff7b72', marginTop: '15px', fontSize: '13px', background: '#2a1211', padding: '10px', borderRadius: '6px' }}>{error}</div>}

      {result && (
        <div style={styles.codeBlock}>
           <div style={{ color: '#8b949e', fontSize: '11px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>CURSOR LSP GERADO</span>
            <button onClick={() => { navigator.clipboard.writeText(result.conteudo); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} style={{ color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer' }}>
              {copied ? "COPIADO!" : "COPIAR"}
            </button>
          </div>
          <pre style={{ margin: 0, color: '#79c0ff', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{result.conteudo}</pre>
        </div>
      )}
    </div>
  );
}
