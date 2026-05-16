import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState, useRef, useMemo, memo } from 'react';
import { 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Info,
  Code2,
  Table as TableIcon,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/sql')({
  component: SqlGeneratorRoute,
});

const SYSTEM_PROMPT = `Você é um especialista em SQL Senior 2 do Gestão Empresarial | ERP (Senior Sistemas).
Gere blocos SQL no padrão Senior SQL 2, sempre encapsulados com cursores LSP (SQL_Criar, SQL_AbrirCursor, etc).

Responda EXATAMENTE neste formato com delimitadores. Nada fora dos blocos.

##TITULO##
Título curto da consulta
##MODULO##
Módulo Senior (ex: Mercado, Estoque, Manufatura, Financeiro, Controladoria)
##TABELAS##
Lista das tabelas principais usadas (ex: E085CLI - Clientes)
##DESCRICAO##
O que essa consulta retorna, em uma linha
##SQL_NATIVO##
O comando SQL puro (SELECT ... FROM ... WHERE ...)
##SQL_CURSOR##
O bloco LSP completo com SQL_Criar/SQL_AbrirCursor/SQL_Eof/SQL_Proximo/SQL_Destruir
##VARIAVEIS##
nome|Tipo|Descrição
##JOINS##
Descrição dos relacionamentos entre tabelas usados
##DICAS##
Dica 1 de uso
Dica 2 de uso
##ATENCAO##
Cuidado ou pré-requisito importante
##FIM##

Padrão obrigatório Senior SQL 2:
- SQL_Criar(xCursor);
- SQL_DefinirComando(xCursor, xSQL);
- Para parâmetros inteiros: SQL_DefinirInteiro(xCursor, ":param", valor);
- Para parâmetros texto: SQL_DefinirAlfa(xCursor, ":param", valor);
- SQL_AbrirCursor(xCursor);
- Enquanto (SQL_Eof(xCursor) = 0) { SQL_RetornarAlfa/Inteiro/Numero(xCursor,"campo",var); SQL_Proximo(xCursor); }
- SQL_FecharCursor(xCursor);
- SQL_Destruir(xCursor);
- Comentários com @ @
- Variáveis com Definir Alfa/Numero/Data
- Use Senior SQL 2 (sem funções nativas de banco como TO_DATE; use funções Senior como DataParaAlfa).`;

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
    variaveis: get("VARIAVEIS","JOINS").split("\n").filter(Boolean).map(l=>{const[n,t,...r]=l.split("|");return{nome:n?.trim(),tipo:t?.trim(),descricao:r.join("|").trim()};}).filter(v=>v.nome),
    joins: get("JOINS","DICAS"),
    dicas: get("DICAS","ATENCAO").split("\n").filter(Boolean).map(d=>d.trim()).filter(Boolean),
    atencao: get("ATENCAO","FIM"),
  };
}

const EXAMPLES = [
  "Buscar todos os pedidos em aberto de um cliente específico com valor total",
  "Listar produtos com estoque abaixo do mínimo por depósito",
  "Consultar NFs emitidas no mês com CNPJ do cliente e valor total",
  "Buscar movimentos financeiros em aberto por fornecedor",
];

const sqlColor = (line: string) => {
  const t = line.trim().toUpperCase();
  if (t.startsWith("@")) return "text-slate-500 italic";
  if (/^(SELECT|FROM|WHERE|JOIN|LEFT|INNER|AND|OR|ORDER|GROUP|HAVING|INSERT|UPDATE|DELETE|ON)\b/.test(t)) return "text-blue-400 font-bold";
  if (/^(SQL_CRIAR|SQL_DEFINIR|SQL_ABRIR|SQL_EOF|SQL_PROXIMO|SQL_FECHAR|SQL_DESTRUIR|SQL_RETORNAR)/i.test(t)) return "text-emerald-400 font-bold";
  if (/^(DEFINIR|ENQUANTO|SE|FIMSE|FIMENQUANTO)\b/i.test(t)) return "text-pink-400 font-bold";
  return "text-slate-300";
};

function SqlGeneratorRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/sql' });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("cursor");
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const generate = async () => {
    const currentInput = inputRef.current?.value || "";
    if (!currentInput.trim()) {
      setError("Por favor, descreva o que deseja consultar no banco.");
      return;
    }
    
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dvvjcewohzbtgtotlbbv.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      if (!SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error("Configuração ausente: VITE_SUPABASE_ANON_KEY não encontrada.");
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/anthropic-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620", 
          max_tokens: 4000, 
          system: SYSTEM_PROMPT, 
          messages: [{ role: "user", content: currentInput.trim() }]
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(`Erro ${res.status}: ${e?.error?.message || e?.message || res.statusText}`);
      }
      
      const data = await res.json();
      const raw = (data.content || []).map((c: any) => c.text || "").join("");
      
      if (!raw || !raw.includes("##TITULO##")) {
        throw new Error("A IA retornou uma resposta fora do formato esperado. Tente novamente.");
      }
      
      setResult(parseResponse(raw));
      setTab("cursor");
    } catch (err: any) {
      console.error("Erro na geração SQL:", err);
      setError(err.message || "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const handleExampleClick = (ex: string) => {
    if (inputRef.current) {
      inputRef.current.value = ex;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-2xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              SQL Builder Sapiens
              <span className="text-[10px] font-medium bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">Premium</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Gestão Empresarial | ERP · Cursores LSP & SQL Nativo</p>
          </div>
        </div>
        
        <Link 
          to="/app/consultoria/senior/$cliente" 
          params={{ cliente: cliente || 'eraser' }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao Workspace
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input & Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Input Card */}
          <div className="glass-card rounded-2xl border border-border/40 bg-card/30 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Requisição SQL</span>
              </div>
              <span className="text-[10px] text-muted-foreground/60">Ctrl + Enter para processar</span>
            </div>
            
            <textarea
              ref={inputRef}
              defaultValue=""
              onChange={() => {}} 
              spellCheck={false}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
              placeholder="Descreva em português o que você quer buscar no banco do Senior. Ex: Buscar todos os pedidos de venda em aberto de um cliente específico..."
              className="w-full min-h-[140px] bg-transparent border-none outline-none p-5 text-sm text-foreground placeholder:text-muted-foreground/30 leading-relaxed resize-none"
            />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t border-border/40 bg-secondary/10">
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(ex)}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-border/40 bg-background/50 text-muted-foreground hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  >
                    {ex.length > 30 ? ex.substring(0, 30) + '...' : ex}
                  </button>
                ))}
              </div>
              
              <button
                onClick={generate}
                disabled={loading}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
                  loading 
                    ? 'bg-blue-600/20 text-blue-400 cursor-not-allowed border border-blue-500/20' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    CONSTRUINDO...
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" className="h-3 w-3" />
                    GERAR SQL
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs text-rose-400 animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Result Area */}
          {result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Result Meta */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 border border-border/40 bg-card/20 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título</span>
                  <p className="text-sm font-semibold text-foreground">{result.titulo}</p>
                </div>
                <div className="glass-card p-4 border border-border/40 bg-card/20 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Módulo</span>
                  <p className="text-sm font-semibold text-blue-400">{result.modulo}</p>
                </div>
                <div className="glass-card p-4 border border-border/40 bg-card/20 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Impacto</span>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{result.descricao}</p>
                </div>
              </div>

              {/* Result Tabs & Code */}
              <div className="glass-card rounded-2xl border border-border/40 bg-[#0d1117] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-[#05050a]/60">
                  <div className="flex gap-4">
                    {[
                      { id: 'cursor', label: 'Cursor LSP', icon: Code2 },
                      { id: 'sql', label: 'SQL Nativo', icon: Database },
                      { id: 'vars', label: 'Variáveis', icon: Terminal }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all py-1 border-b-2 ${
                          tab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                  
                  {(tab === 'cursor' || tab === 'sql') && (
                    <button
                      onClick={() => copy(tab, tab === 'cursor' ? result.sql_cursor : result.sql_nativo)}
                      className="flex items-center gap-1.5 rounded-lg bg-secondary/50 border border-border/40 px-3 py-1.5 text-[10px] font-bold text-foreground hover:bg-secondary/80 transition-all"
                    >
                      {copied[tab] ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copied[tab] ? 'COPIADO' : 'COPIAR'}
                    </button>
                  )}
                </div>

                <div className="p-6 overflow-x-auto min-h-[300px]">
                  {tab === 'cursor' && (
                    <pre className="text-xs leading-relaxed font-mono">
                      {(result.sql_cursor || "").split('\n').map((line: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="w-8 text-right text-slate-700 select-none shrink-0">{i + 1}</span>
                          <span className={sqlColor(line)}>{line}</span>
                        </div>
                      ))}
                    </pre>
                  )}

                  {tab === 'sql' && (
                    <pre className="text-xs leading-relaxed font-mono">
                      {(result.sql_nativo || "").split('\n').map((line: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="w-8 text-right text-slate-700 select-none shrink-0">{i + 1}</span>
                          <span className={sqlColor(line)}>{line}</span>
                        </div>
                      ))}
                    </pre>
                  )}

                  {tab === 'vars' && (
                    <div className="space-y-4">
                      {result.variaveis?.length > 0 ? (
                        <div className="rounded-xl border border-border/40 overflow-hidden">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-secondary/20 text-muted-foreground">
                              <tr>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Variável</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Tipo</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Descrição</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {result.variaveis.map((v: any, i: number) => (
                                <tr key={i} className="hover:bg-secondary/10 transition-colors">
                                  <td className="px-4 py-3 font-mono text-emerald-400">{v.nome}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      v.tipo === 'Alfa' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                      v.tipo === 'Numero' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                      {v.tipo}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{v.descricao}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                          <Info className="h-8 w-8 opacity-20" />
                          <p className="text-xs">Nenhuma variável documentada para este bloco.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tips & Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Documentation Box */}
          <div className="glass-card rounded-2xl border border-border/40 bg-card/20 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Dicas de Consultoria</h3>
            </div>
            
            <div className="space-y-3">
              {result?.dicas && result.dicas.length > 0 ? (
                result.dicas.map((d: string, i: number) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/20 border border-border/30 group">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400">
                      {i + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                      {d}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/20">
                    <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                      Gere um SQL para ver dicas de otimização e boas práticas específicas para as tabelas Senior envolvidas.
                    </p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2 text-[10px] text-muted-foreground/60">
                      <ChevronRight className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                      <span>Use sempre prefixos corretos (E085, E120).</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-muted-foreground/60">
                      <ChevronRight className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                      <span>Evite funções nativas (TO_CHAR, etc) em LSP.</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Warning Box */}
          {result?.atencao && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 animate-in zoom-in-95">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-amber-500 tracking-widest uppercase">Atenção Técnica</h3>
              </div>
              <p className="text-xs leading-relaxed text-amber-200/70">{result.atencao}</p>
            </div>
          )}

          {/* Tables Summary */}
          {result?.tabelas && result.tabelas.length > 0 && (
            <div className="glass-card rounded-2xl border border-border/40 bg-card/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TableIcon className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Schema Detectado</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tabelas.map((t: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#05050a] border border-border/40 text-[10px] font-mono text-emerald-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Play({ className, fill }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
