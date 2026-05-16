import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState, useRef, memo } from 'react';
import { 
  Database, 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Info,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/sql')({
  component: SqlGeminiGenerator,
});

const SYSTEM_PROMPT = `Você é um Engenheiro de Software especialista em Senior Sistemas e SQL Senior 2.
Gere consultas SQL nativas e Cursores LSP integrados.

Responda EXATAMENTE neste formato com delimitadores:

##TITULO##
Título curto da consulta
##MODULO##
Módulo (ex: Financeiro, Mercado)
##TABELAS##
Tabelas envolvidas (ex: E070EMP, E085CLI)
##DESCRICAO##
O que a consulta retorna
##SQL_NATIVO##
O SQL puro
##SQL_CURSOR##
O bloco LSP completo com SQL_Criar, SQL_DefinirComando, SQL_AbrirCursor, etc.
##VARIAVEIS##
Tabela de variáveis usadas
##JOINS##
Explicação dos joins
##DICAS##
Dicas de otimização
##ATENCAO##
Alerta importante
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
    tabelas: get("TABELAS","DESCRICAO").split("\n").filter(Boolean).map(t=>t.trim()),
    descricao: get("DESCRICAO","SQL_NATIVO"),
    sql_nativo: get("SQL_NATIVO","SQL_CURSOR"),
    sql_cursor: get("SQL_CURSOR","VARIAVEIS"),
    variaveis: get("VARIAVEIS","JOINS"),
    joins: get("JOINS","DICAS"),
    dicas: get("DICAS","ATENCAO").split("\n").filter(Boolean).map(d=>d.trim()),
    atencao: get("ATENCAO","FIM"),
  };
}

function SqlGeminiGenerator() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/sql' });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("cursor");
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const generate = async () => {
    const prompt = inputRef.current?.value || "";
    if (!prompt.trim()) {
      setError("Por favor, descreva a consulta que deseja gerar.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dvvjcewohzbtgtotlbbv.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      const res = await fetch(`${SUPABASE_URL}/functions/v1/gerar-sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: `[MODO SQL] ${prompt}` }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(parseResponse(data.resultado));
      setTab("cursor");
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Gemini.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Gemini Header */}
      <div className="flex items-center gap-4 py-4 border-b border-blue-500/10">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
          G
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-foreground uppercase">Senior · Gerador de SQL Senior 2 (Gemini Direct)</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Gestão Empresarial | ERP · Cursores LSP via Google AI Studio</p>
        </div>
        <div className="ml-auto flex gap-1.5 opacity-40">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 p-1 overflow-hidden shadow-2xl">
        <div className="bg-[#040610] p-4 flex items-center gap-2 text-[10px] font-bold text-blue-400 border-b border-blue-500/20">
          <ChevronRight className="h-3 w-3" />
          <span>DESCREVA O QUE DESEJA CONSULTAR NO BANCO DO SENIOR</span>
        </div>
        <textarea
          ref={inputRef}
          className="w-full min-h-[120px] bg-transparent border-none outline-none p-5 text-sm text-foreground placeholder:text-slate-700 leading-relaxed resize-none font-mono"
          placeholder="Ex: Quero buscar todos os pedidos de venda em aberto de um cliente específico com valor total..."
        />
        <div className="p-4 flex items-center justify-between bg-secondary/10 border-t border-blue-500/10">
          <div className="flex gap-2">
            <button onClick={() => inputRef.current!.value = "Listar produtos com estoque abaixo do mínimo"} className="text-[9px] px-2 py-1 rounded bg-secondary/20 text-muted-foreground hover:text-blue-400 transition-colors">Ex: Estoque Mínimo</button>
            <button onClick={() => inputRef.current!.value = "Consultar NFs emitidas no mês"} className="text-[9px] px-2 py-1 rounded bg-secondary/20 text-muted-foreground hover:text-blue-400 transition-colors">Ex: Notas Fiscais</button>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="generate-btn bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            {loading ? <Zap className="h-3.5 w-3.5 animate-pulse" /> : <Play fill="currentColor" className="h-3.5 w-3.5" />}
            {loading ? 'CONSTRUINDO...' : 'GERAR SQL'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-lg text-xs text-rose-400 flex items-center gap-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Results Section */}
      {result ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Result Header Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#0d1117] border border-blue-500/20 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Consulta</span>
              <p className="text-xs font-bold text-foreground mt-1">{result.titulo}</p>
            </div>
            <div className="bg-[#0d1117] border border-blue-500/20 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Módulo</span>
              <p className="text-xs font-bold text-blue-400 mt-1">{result.modulo}</p>
            </div>
            <div className="bg-[#0d1117] border border-blue-500/20 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Descrição</span>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{result.descricao}</p>
            </div>
          </div>

          {/* Tables Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tabelas:</span>
            <div className="flex gap-2">
              {result.tabelas.map((t: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-blue-500/10 bg-blue-500/5 text-slate-400 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Code Tabs Area */}
          <div className="bg-[#0d1117] border border-blue-500/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#040610] border-b border-blue-500/20 px-6 py-3 flex items-center justify-between">
              <div className="flex gap-6">
                <button 
                  onClick={() => setTab('cursor')}
                  className={`text-[10px] font-bold tracking-widest uppercase transition-all pb-1 border-b-2 ${tab === 'cursor' ? 'border-blue-400 text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  🔗 CURSOR LSP
                </button>
                <button 
                  onClick={() => setTab('sql')}
                  className={`text-[10px] font-bold tracking-widest uppercase transition-all pb-1 border-b-2 ${tab === 'sql' ? 'border-blue-400 text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  📋 SQL NATIVO
                </button>
              </div>
              <button 
                onClick={() => copy(tab, tab === 'cursor' ? result.sql_cursor : result.sql_nativo)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold transition-all ${copied[tab] ? 'bg-emerald-500 text-white' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
              >
                {copied[tab] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied[tab] ? 'COPIADO' : 'COPIAR'}
              </button>
            </div>
            
            <div className="p-6 overflow-x-auto bg-[#070a0f] min-h-[250px]">
              <pre className="text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                {tab === 'cursor' ? result.sql_cursor : result.sql_nativo}
              </pre>
            </div>

            {tab === 'sql' && result.joins && (
              <div className="p-4 bg-[#040610] border-t border-blue-500/10">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Relacionamentos</div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-mono">{result.joins}</p>
              </div>
            )}
          </div>

          {/* Help & Warning Area */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Atenção Técnica</span>
              </div>
              <p className="text-[11px] text-amber-200/60 leading-relaxed">{result.atencao}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Lightbulb className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dicas de Otimização</span>
              </div>
              <div className="space-y-2">
                {result.dicas.map((tip: string, i: number) => (
                  <div key={i} className="bg-secondary/10 border border-border/40 p-3 rounded-lg flex gap-3 group hover:border-blue-500/30 transition-all">
                    <span className="text-blue-400 font-bold text-[10px]">{i + 1}</span>
                    <p className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="py-20 text-center space-y-4 opacity-30">
          <Database className="h-12 w-12 mx-auto text-blue-500" />
          <p className="text-xs max-w-[300px] mx-auto leading-relaxed">
            Descreva o que deseja buscar no banco do Senior. O Gemini processará o SQL 2 nativo e o Cursor LSP correspondente.
          </p>
        </div>
      )}
    </div>
  );
}
