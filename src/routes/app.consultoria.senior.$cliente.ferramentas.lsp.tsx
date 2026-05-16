import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState, useRef, memo } from 'react';
import { 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Info,
  Database,
  Lightbulb,
  Sparkles,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspGeminiGenerator,
});

const SYSTEM_PROMPT = `Você é um Engenheiro de Software Sênior especialista em Senior Sistemas e linguagem LSP (Lógica de Sistemas de Pessoal/Processos).
Sua tarefa é gerar regras e processos LSP no padrão Senior 2, otimizados e comentados.

Responda EXATAMENTE neste formato com delimitadores:

##TITULO##
Nome curto da regra
##MODULO##
Módulo Senior (ex: PCP, Compras, Mercado, Financeiro)
##TABELAS##
Tabelas envolvidas (ex: E070EMP, E120PED)
##DESCRICAO##
O que a regra faz em uma linha
##CONTEUDO##
O código LSP completo (Definir Numero, Definir Alfa, etc)
##VARIAVEIS##
lista de variáveis usadas e tipos
##DICAS##
3 dicas de performance para esta regra
##ATENCAO##
Pré-requisito ou cuidado importante
##FIM##

Regras de Ouro LSP:
- Comentários usam @ @
- Definir as variáveis no topo.
- Use nomes claros.
- Sempre valide nulos e erros de banco.`;

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
    descricao: get("DESCRICAO","CONTEUDO"),
    conteudo: get("CONTEUDO","VARIAVEIS"),
    variaveis: get("VARIAVEIS","DICAS"),
    dicas: get("DICAS","ATENCAO").split("\n").filter(Boolean).map(d=>d.trim()),
    atencao: get("ATENCAO","FIM"),
  };
}

function LspGeminiGenerator() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/lsp' });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const prompt = inputRef.current?.value || "";
    if (!prompt.trim()) {
      setError("Por favor, descreva a regra que deseja gerar.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dvvjcewohzbtgtotlbbv.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      // Chamando a nova Edge Function do Gemini que criamos
      const res = await fetch(`${SUPABASE_URL}/functions/v1/gerar-sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: `[MODO LSP] ${prompt}` }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(parseResponse(data.resultado));
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Gemini.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.conteudo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Gemini Header */}
      <div className="flex items-center gap-4 py-4 border-b border-indigo-500/10">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
          G
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-foreground uppercase">Senior · Gerador de Regra LSP (Gemini Direct)</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Gestão Empresarial | ERP · Cursores LSP via Google AI Studio</p>
        </div>
        <div className="ml-auto flex gap-1.5 opacity-40">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-1 overflow-hidden shadow-2xl">
        <div className="bg-[#040610] p-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400 border-b border-indigo-500/20">
          <ChevronRight className="h-3 w-3" />
          <span>DESCREVA A LÓGICA OU REGRA DE PROCESSO DESEJADA</span>
        </div>
        <textarea
          ref={inputRef}
          className="w-full min-h-[120px] bg-transparent border-none outline-none p-5 text-sm text-foreground placeholder:text-slate-700 leading-relaxed resize-none font-mono"
          placeholder="Ex: Criar uma regra para validar se o cliente tem limite de crédito antes de fechar o pedido..."
        />
        <div className="p-4 flex items-center justify-between bg-secondary/10 border-t border-indigo-500/10">
          <div className="flex gap-2">
            <button onClick={() => inputRef.current!.value = "Validar estoque de componentes no PCP"} className="text-[9px] px-2 py-1 rounded bg-secondary/20 text-muted-foreground hover:text-indigo-400 transition-colors">Ex: Validar PCP</button>
            <button onClick={() => inputRef.current!.value = "Bloquear pedido se cliente inadimplente"} className="text-[9px] px-2 py-1 rounded bg-secondary/20 text-muted-foreground hover:text-indigo-400 transition-colors">Ex: Bloqueio Crédito</button>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="generate-btn bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            {loading ? <Zap className="h-3.5 w-3.5 animate-pulse" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? 'GERANDO...' : 'GERAR REGRA LSP'}
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
            <div className="bg-[#0d1117] border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Consulta</span>
              <p className="text-xs font-bold text-foreground mt-1">{result.titulo}</p>
            </div>
            <div className="bg-[#0d1117] border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Módulo</span>
              <p className="text-xs font-bold text-blue-400 mt-1">{result.modulo}</p>
            </div>
            <div className="bg-[#0d1117] border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Descrição</span>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{result.descricao}</p>
            </div>
          </div>

          {/* Tables Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tabelas:</span>
            <div className="flex gap-2">
              {result.tabelas.map((t: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-indigo-500/10 bg-indigo-500/5 text-slate-400 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Code Tabs Area */}
          <div className="bg-[#0d1117] border border-indigo-500/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#040610] border-b border-indigo-500/20 px-6 py-3 flex items-center justify-between">
              <div className="flex gap-6">
                <button className="text-[10px] font-bold text-blue-400 border-b-2 border-blue-400 pb-1 flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5" />
                  CÓDIGO LSP
                </button>
                <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground pb-1 flex items-center gap-2">
                  <Database className="h-3.5 w-3.5" />
                  MATE-DADOS
                </button>
              </div>
              <button 
                onClick={copy}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'}`}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'COPIADO' : 'COPIAR'}
              </button>
            </div>
            
            <div className="p-6 overflow-x-auto bg-[#070a0f]">
              <pre className="text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                {result.conteudo}
              </pre>
            </div>
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
                <span className="text-[10px] font-bold uppercase tracking-widest">Dicas de Performance</span>
              </div>
              <div className="space-y-2">
                {result.dicas.map((tip: string, i: number) => (
                  <div key={i} className="bg-secondary/10 border border-border/40 p-3 rounded-lg flex gap-3 group hover:border-indigo-500/30 transition-all">
                    <span className="text-indigo-400 font-bold text-[10px]">{i + 1}</span>
                    <p className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="py-20 text-center space-y-4 opacity-30">
          <Database className="h-12 w-12 mx-auto text-indigo-500" />
          <p className="text-xs max-w-[300px] mx-auto leading-relaxed">
            Descreva a regra em português para o Gemini processar a lógica e gerar o código LSP compatível com Senior 2.
          </p>
        </div>
      )}
    </div>
  );
}
