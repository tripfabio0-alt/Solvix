import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from "react";

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspGeneratorRoute,
});

const SYSTEM_PROMPT = `Você é um especialista em regras LSP do Senior Gestão Empresarial ERP.
Responda EXATAMENTE neste formato com os delimitadores abaixo. Não adicione nada fora dos blocos.

##TITULO##
Título curto da regra
##MODULO##
Módulo (ex: Manufatura, PCP, Mercado)
##IDENTIFICADOR##
Ex: PCP-000XXXXX01
##DESCRICAO##
Descrição funcional de uma linha
##SCRIPT##
@ Script LSP completo com comentários @
Definir Alfa aVariavel;
##VARIAVEIS##
nome|Tipo|Descrição
##FUNCOES##
NomeFuncao|O que faz
##DICAS##
Dica 1
Dica 2
##ATENCAO##
Ponto crítico
##FIM##

Sintaxe LSP Senior: Definir Alfa/Numero/Data; @ comentário @; Se()...FimSe; Enquanto()...FimEnquanto; GeraLog(); Mensagem(); BuscaReg(); GravaReg(); ApontarOPs(); GerarOP(); BaixarComponentes(); Se(aRetorno<>"OK") GeraLog(aRetorno); FimSe;`;

function parseResponse(text: string) {
  const get = (tag: string, next: string) => {
    const start = text.indexOf("##" + tag + "##");
    if (start === -1) return "";
    const after = start + tag.length + 4;
    const end = text.indexOf("##" + next + "##", after);
    return (end === -1 ? text.slice(after) : text.slice(after, end)).trim();
  };
  return {
    titulo: get("TITULO","MODULO"),
    modulo: get("MODULO","IDENTIFICADOR"),
    identificador: get("IDENTIFICADOR","DESCRICAO"),
    descricao: get("DESCRICAO","SCRIPT"),
    script: get("SCRIPT","VARIAVEIS"),
    variaveis: get("VARIAVEIS","FUNCOES").split("\n").filter(Boolean).map(l=>{const [n,t,...r]=l.split("|");return{nome:n?.trim(),tipo:t?.trim(),descricao:r.join("|").trim()};}).filter(v=>v.nome),
    funcoes: get("FUNCOES","DICAS").split("\n").filter(Boolean).map(l=>{const [n,...r]=l.split("|");return{nome:n?.trim(),descricao:r.join("|").trim()};}).filter(f=>f.nome),
    dicas: get("DICAS","ATENCAO").split("\n").filter(Boolean).map(d=>d.trim()).filter(Boolean),
    atencao: get("ATENCAO","FIM"),
  };
}

function LspGeneratorRoute() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("script");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const currentInput = inputRef.current?.value || "";
    if (!currentInput.trim()) return;
    
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const messages = [{ role: "user", content: currentInput.trim() }];
      const SUPABASE_URL = 'https://dvvjcewohzbtgtotlbbv.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-anon-key-jwt-aqui';

      const res = await fetch(SUPABASE_URL + "/functions/v1/anthropic-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + SUPABASE_ANON_KEY,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages
        }),
      });
      
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error("API " + res.status + ": " + (e?.error?.message || res.statusText));
      }
      
      const data = await res.json();
      const raw = (data.content || []).map((c: any) => c.text || "").join("");
      
      if (!raw) throw new Error("Resposta vazia.");
      if (!raw.includes("##TITULO##")) throw new Error("Formato inesperado. Tente novamente.");
      
      setResult(parseResponse(raw));
      setTab("script");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result?.script) return;
    navigator.clipboard.writeText(result.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const lc = (line: string) => {
    const t = line.trim();
    if (t.startsWith("@")) return "#64748b";
    if (/^(Definir|Se|FimSe|Enquanto|FimEnquanto|ParaCada|FimParaCada)\b/i.test(t)) return "#93c5fd";
    if (/^[A-Z][a-zA-Z]+\(/.test(t)) return "#86efac";
    return "#cbd5e1";
  };
  
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Gerador de LSP</h1>
      
      <div style={{ marginBottom: 24 }}>
        <textarea
          ref={inputRef}
          rows={10}
          placeholder="Digite sua necessidade..."
          style={{ width: "100%", padding: 16, fontSize: 14, fontFamily: "monospace", border: "1px solid #333", borderRadius: 8, background: "#111", color: "#fff" }}
        />
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button 
            onClick={generate} 
            disabled={loading}
            style={{ padding: "10px 24px", background: "#f59e0b", color: "#000", border: "none", borderRadius: 6, fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "GERANDO..." : "GERAR REGRA"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#3a1a1a", border: "1px solid #7f1d1d", color: "#fca5a5", borderRadius: 6, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: "#13171f", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
          <h2 style={{ fontSize: 18, color: "#f1f5f9", marginBottom: 8 }}>{result.titulo}</h2>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>{result.descricao}</p>
          
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 16, position: "relative" }}>
            <button onClick={copy} style={{ position: "absolute", top: 16, right: 0, padding: "6px 12px", background: copied ? "#166534" : "#1e293b", color: copied ? "#86efac" : "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {copied ? "COPIADO" : "COPIAR SCRIPT"}
            </button>
            <pre style={{ overflowX: "auto", fontSize: 12, lineHeight: 1.6, padding: 16, background: "#0a0c10", borderRadius: 6, marginTop: 16 }}>
              {(result.script || "").split("\n").map((line: string, i: number) => (
                <div key={i} style={{ color: lc(line) }}>{line}</div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
