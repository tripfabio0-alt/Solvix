import React, { useState, useRef, useCallback, useMemo } from 'react';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import {
  ArrowLeft,
  Sparkles,
  Terminal,
  Code2,
  Copy,
  Check,
  Zap,
  Info,
  AlertTriangle,
  BookOpen,
  Variable,
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspGeneratorRoute,
});

// ─── Mock ────────────────────────────────────────────────────────────────────
const MOCK_RESPONSE = `
[TITULO] Regra de Validação de Pedido por Crédito
[SCRIPT]
@NOME: Regra_Validacao_Credito;
@DESCRICAO: Valida se o cliente tem saldo disponível no momento do fechamento.

Definir Cursor Cur_Credito;
Definir Numero vSaldo;
Definir Numero vPedido;

vPedido = Pedido.ValorTotal;

Cur_Credito.SQL "SELECT Saldo FROM Clientes WHERE Id = :IdCliente";
Cur_Credito.Abrir();
Se (Cur_Credito.Proximo()) {
  vSaldo = Cur_Credito.Saldo;
}
Cur_Credito.Fechar();

Se (vPedido > vSaldo) {
  Mensagem(Erro, "Cliente sem limite de crédito disponível!");
  Bloquear();
}
[VARIAVEIS]
vPedido: Valor total do pedido atual (Moeda)
vSaldo: Saldo de limite disponível no banco (Moeda)
Cur_Credito: Cursor para consulta de dados bancários (Cursor)
[FUNCOES]
Mensagem(): Exibe alerta para o usuário final
Bloquear(): Interrompe o processo de gravação do registro
[DICAS]
1. Certifique-se de que o campo Saldo está indexado no banco de dados.
2. Esta regra deve ser disparada no evento Ao Fechar Pedido.
3. Teste com pedidos de valor limite para validar o comportamento correto.
[ATENCAO]
Regras de bloqueio podem impactar o tempo de resposta se o banco estiver lento. Monitore a performance após o deploy.
`;

const EXAMPLES = [
  'Validar estoque ao faturar nota',
  'Bloquear pedido sem limite de crédito',
  'Log de alteração em campos sensíveis',
  'Cálculo de frete customizado',
];

// ─── Parser ───────────────────────────────────────────────────────────────────
type ParsedResult = {
  titulo: string;
  script: string;
  variaveis: { nome: string; descricao: string }[];
  funcoes: { nome: string; descricao: string }[];
  dicas: string[];
  atencao: string;
};

function parseResponse(raw: string): ParsedResult {
  const get = (tag: string, endTag: string) => {
    const parts = raw.split(`[${tag}]`);
    if (parts.length < 2) return '';
    return parts[1].split(`[${endTag}]`)[0].trim();
  };

  const mapPairs = (text: string) =>
    text
      .split('\n')
      .map((line) => {
        const idx = line.indexOf(':');
        if (idx === -1) return null;
        return { nome: line.slice(0, idx).trim(), descricao: line.slice(idx + 1).trim() };
      })
      .filter((x): x is { nome: string; descricao: string } => !!x?.nome);

  return {
    titulo: get('TITULO', 'SCRIPT'),
    script: get('SCRIPT', 'VARIAVEIS'),
    variaveis: mapPairs(get('VARIAVEIS', 'FUNCOES')),
    funcoes: mapPairs(get('FUNCOES', 'DICAS')),
    dicas: get('DICAS', 'ATENCAO')
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean),
    atencao: get('ATENCAO', '§END§') || raw.split('[ATENCAO]')[1]?.trim() || '',
  };
}

// ─── Syntax Highlight (pure function, no DOM side-effects) ───────────────────
const KEYWORD_RE = /^(Definir|Se|FimSe|Senao|Enquanto|FimEnquanto|Retornar|Para|FimPara)\b/i;
const FUNC_RE = /[A-Z][a-zA-Z]+\(/;
const STRING_RE = /"[^"]*"/;
const COMMENT_RE = /^@/;

function lineClass(line: string): string {
  const t = line.trim();
  if (COMMENT_RE.test(t)) return 'text-slate-500 italic';
  if (KEYWORD_RE.test(t)) return 'text-amber-400 font-semibold';
  if (FUNC_RE.test(t)) return 'text-emerald-400';
  if (STRING_RE.test(t)) return 'text-sky-300';
  return 'text-slate-300';
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'script', label: 'Script', icon: Code2 },
  { id: 'variaveis', label: 'Variáveis', icon: Variable },
  { id: 'funcoes', label: 'Funções', icon: Zap },
  { id: 'ajuda', label: 'Atenção', icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Component ────────────────────────────────────────────────────────────────
function LspGeneratorRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/lsp' });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [tab, setTab] = useState<TabId>('script');
  const [copied, setCopied] = useState(false);

  // ── Actions ────────────────────────────────────────────────────────────────
  const generate = useCallback(() => {
    const val = inputRef.current?.value?.trim();
    if (!val) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(parseResponse(MOCK_RESPONSE));
      setLoading(false);
    }, 900);
  }, []);

  const handleCopy = useCallback(() => {
    if (!result?.script) return;
    navigator.clipboard.writeText(result.script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const setExample = useCallback((ex: string) => {
    if (inputRef.current) inputRef.current.value = ex;
  }, []);

  // ── Memoized highlighted script lines ────────────────────────────────────
  const highlightedLines = useMemo(() => {
    if (!result?.script) return [];
    return result.script.split('\n').map((line, i) => ({
      i,
      line,
      cls: lineClass(line),
    }));
  }, [result?.script]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/app/consultoria/senior/${cliente}`}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 flex-wrap">
              <Code2 className="text-amber-500 shrink-0" />
              <span>Gerador LSP</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                BETA v2.1
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Ambiente de desenvolvimento inteligente para o ERP Senior
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">

        {/* ── Left Panel: Input ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Input Card */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Requisitos da Regra
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] text-amber-500/70 font-semibold">IA Ativa</span>
              </div>
            </div>

            {/* Uncontrolled textarea — no value/onChange, no re-renders on keystroke */}
            <textarea
              ref={inputRef}
              placeholder="Ex: Criar regra que valide o estoque do componente antes de processar a OP..."
              className="w-full h-52 bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 outline-none resize-none font-sans leading-relaxed transition-all focus:bg-black/60 text-slate-200 placeholder:text-slate-600"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />

            {/* Example chips */}
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setExample(ex)}
                  className="text-[10px] font-semibold px-2.5 py-1 bg-white/5 border border-white/5 rounded-md hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400 transition-colors text-slate-400"
                >
                  + {ex}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,119,6,0.15)] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ANALISANDO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>COMPILAR LÓGICA</span>
                </>
              )}
            </button>
          </div>

          {/* Context info */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 items-start">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200/60 leading-relaxed">
              O gerador utiliza o contexto específico do cliente{' '}
              <span className="text-amber-400 font-bold uppercase">{cliente}</span> para sugerir
              nomes de tabelas e variáveis com base no histórico de projetos.
            </p>
          </div>
        </div>

        {/* ── Right Panel: Output ───────────────────────────────────────── */}
        <div className="bg-slate-900/20 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-[480px] shadow-2xl relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/[0.02] to-transparent" />

          {result ? (
            <div className="flex flex-col h-full relative z-10">

              {/* Tab Bar */}
              <div className="bg-slate-900/60 p-3 border-b border-white/10 flex justify-between items-center backdrop-blur-md gap-2">
                <div className="flex gap-1 overflow-x-auto">
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                        tab === id
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>

                {tab === 'script' && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold hover:bg-emerald-600/20 transition-all shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" /> COPIADO
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> COPIAR
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tab title */}
              {result.titulo && (
                <div className="px-5 pt-4 pb-2">
                  <p className="text-[11px] font-bold text-amber-400/70 uppercase tracking-widest">
                    {result.titulo}
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="p-5 overflow-auto flex-1 font-mono text-[11px] leading-5">

                {/* SCRIPT TAB */}
                {tab === 'script' && (
                  <div className="space-y-0.5">
                    {highlightedLines.map(({ i, line, cls }) => (
                      <div key={i} className="flex gap-3 hover:bg-white/[0.02] rounded px-1">
                        <span className="w-7 text-right text-slate-700 select-none shrink-0 pt-px">
                          {i + 1}
                        </span>
                        <span className={cls}>{line || '\u00a0'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* VARIABLES TAB */}
                {tab === 'variaveis' && (
                  <div className="grid gap-2.5 font-sans">
                    {result.variaveis.map((v, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-amber-500/20 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-amber-400 font-bold text-xs">{v.nome}</span>
                        </div>
                        <p className="text-slate-400 text-[10px] pl-3.5 leading-relaxed">
                          {v.descricao}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* FUNCTIONS TAB */}
                {tab === 'funcoes' && (
                  <div className="space-y-2.5 font-sans">
                    {result.funcoes.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white/[0.02] rounded-lg border border-white/5 flex gap-3"
                      >
                        <Zap className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-emerald-400 font-bold text-xs block mb-1">
                            {f.nome}
                          </span>
                          <p className="text-slate-400 text-[10px] leading-relaxed">{f.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TIPS/CAUTION TAB */}
                {tab === 'ajuda' && (
                  <div className="space-y-4 font-sans">
                    {result.dicas.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3" /> Dicas de Uso
                        </p>
                        {result.dicas.map((d, i) => (
                          <div
                            key={i}
                            className="flex gap-2.5 p-3 bg-white/[0.02] rounded-lg border border-white/5 text-slate-300 text-[10px] leading-relaxed"
                          >
                            <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                            {d.replace(/^\d+\.\s*/, '')}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.atencao && (
                      <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-lg flex gap-3">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-amber-200/70 text-[10px] leading-relaxed">
                          {result.atencao}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm p-12 text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 border border-white/5">
                <Terminal className="h-7 w-7 opacity-20" />
              </div>
              {loading ? (
                <>
                  <div className="h-6 w-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                  <p className="font-medium text-slate-500 not-italic">Compilando regra LSP...</p>
                  <p className="text-[10px] mt-2 opacity-50 max-w-[200px]">
                    A IA está analisando sua solicitação e gerando o código.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-500 not-italic">Terminal Solvix AI v2.1</p>
                  <p className="text-[10px] mt-2 opacity-50 max-w-[200px]">
                    Descreva a lógica desejada no painel ao lado para compilar a regra LSP.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
