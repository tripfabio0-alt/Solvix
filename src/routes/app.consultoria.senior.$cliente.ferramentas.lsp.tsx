import React, { useState, useRef } from 'react';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Sparkles, 
  Terminal, 
  Code2,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspGeneratorRoute,
});

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
1. Certifique-se de que o campo 'Saldo' está indexado.
2. Esta regra deve ser disparada no evento 'Ao Fechar Pedido'.
[ATENCAO]
Regras de bloqueio podem impactar o tempo de resposta se o banco estiver lento.
`;

const EXAMPLES = [
  "Validar estoque ao faturar nota",
  "Bloquear pedido sem limite de crédito",
  "Log de alteração em campos sensíveis",
  "Cálculo de frete customizado"
];

function LspGeneratorRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/lsp' });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState<'script' | 'variaveis' | 'funcoes' | 'ajuda'>('script');
  const [copied, setCopied] = useState(false);

  const parseResponse = (raw: string) => {
    const get = (tag: string, end: string) => {
      const parts = raw.split(`[${tag}]`);
      if (parts.length < 2) return '';
      return parts[1].split(`[${end}]`)[0].trim();
    };

    return {
      titulo: get('TITULO', 'SCRIPT'),
      script: get('SCRIPT', 'VARIAVEIS'),
      variaveis: get('VARIAVEIS', 'FUNCOES').split('\n').map(v => {
        const [nome, desc] = v.split(':');
        return { nome: nome?.trim(), descricao: desc?.trim() };
      }).filter(v => v.nome),
      funcoes: get('FUNCOES', 'DICAS').split('\n').map(f => {
        const [nome, desc] = f.split(':');
        return { nome: nome?.trim(), descricao: desc?.trim() };
      }).filter(f => f.nome),
      dicas: get('DICAS', 'ATENCAO').split('\n').map(d => d.trim()).filter(Boolean),
      atencao: get('ATENCAO', 'FIM') || raw.split('[ATENCAO]')[1]?.trim()
    };
  };

  const generate = () => {
    const val = inputRef.current?.value || '';
    if (!val.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    setTimeout(() => {
      setResult(parseResponse(MOCK_RESPONSE));
      setLoading(false);
    }, 800);
  };

  const handleCopy = () => {
    if (!result?.script) return;
    navigator.clipboard.writeText(result.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setExample = (ex: string) => {
    if (inputRef.current) {
      inputRef.current.value = ex;
    }
  };

  const highlightLsp = (code: string) => {
    return code.split('\n').map((line, i) => {
      const trimmed = line.trim();
      let color = 'text-slate-300';
      if (trimmed.startsWith('@')) color = 'text-slate-500 italic';
      else if (/^(Definir|Se|FimSe|Senao|Enquanto|FimEnquanto)\b/i.test(trimmed)) color = 'text-amber-400 font-bold';
      else if (/[A-Z][a-zA-Z]+\(/.test(trimmed)) color = 'text-emerald-400';
      else if (/"[^"]*"/.test(trimmed)) color = 'text-sky-300';
      
      return (
        <div key={i} className="flex gap-4">
          <span className="w-8 text-right text-slate-600 select-none text-[10px] pt-0.5">{i + 1}</span>
          <span className={color}>{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Link to={`/app/consultoria/senior/${cliente}`} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Code2 className="text-amber-500" /> Gerador LSP <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 ml-2">BETA v2.1</span>
            </h1>
            <p className="text-sm text-slate-400">Ambiente de desenvolvimento inteligente para o ERP Senior</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Requisitos da Regra</h2>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" title="IA Ativa" />
              </div>
            </div>
            
            <textarea
              ref={inputRef}
              placeholder="Ex: Criar regra que valide o estoque do componente antes de processar a OP..."
              className="w-full h-56 bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-amber-500/50 outline-none resize-none font-sans leading-relaxed transition-all focus:bg-black/60"
              spellCheck={false}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              {EXAMPLES.map(ex => (
                <button 
                  key={ex} 
                  onClick={() => setExample(ex)}
                  className="text-[10px] font-bold px-2 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:border-white/10 transition-colors text-slate-400"
                >
                  + {ex}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,119,6,0.15)] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ANALISANDO...
                </span>
              ) : (
                <><Sparkles className="h-4 w-4" /> COMPILAR LÓGICA</>
              )}
            </button>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 items-start">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200/60 leading-relaxed">
              O gerador utiliza o contexto específico do cliente <span className="text-amber-400 font-bold uppercase">{cliente}</span> para sugerir nomes de tabelas e variáveis com base no histórico de projetos.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/20 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-[500px] shadow-2xl relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/[0.02] to-transparent" />
          
          {result ? (
            <div className="flex flex-col h-full relative z-10">
              <div className="bg-slate-900/60 p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                <div className="flex gap-1">
                  {['script', 'variaveis', 'funcoes', 'ajuda'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTab(t as any)} 
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${tab === t ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {tab === 'script' && (
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold hover:bg-emerald-600/20 transition-all"
                  >
                    {copied ? <><Check className="h-3 w-3" /> COPIADO</> : <><Copy className="h-3 w-3" /> COPIAR</>}
                  </button>
                )}
              </div>
              
              <div className="p-6 overflow-auto flex-1 font-mono text-[11px]">
                {tab === 'script' && (
                  <div className="space-y-0.5">
                    {highlightLsp(result.script)}
                  </div>
                )}
                {tab === 'variaveis' && (
                  <div className="grid gap-3">
                    {result.variaveis.map((v: any, i: number) => (
                      <div key={i} className="group p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-amber-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span className="text-amber-500 font-bold text-xs">{v.nome}</span>
                        </div>
                        <p className="text-slate-400 pl-3.5">{v.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'funcoes' && (
                  <div className="space-y-3">
                    {result.funcoes.map((f: any, i: number) => (
                      <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 flex gap-3">
                        <Zap className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-emerald-400 font-bold block mb-1">{f.nome}</span>
                          <p className="text-slate-400 text-[10px] leading-relaxed">{f.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'ajuda' && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
                    <p className="text-amber-200/80 leading-relaxed italic">{result.atencao}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                <Terminal className="h-8 w-8 opacity-20" />
              </div>
              <p className="font-medium text-slate-500">Terminal Solvix AI v2.1</p>
              <p className="text-[10px] mt-2 opacity-50 max-w-[200px]">Descreva a lógica desejada no painel ao lado para compilar a regra LSP.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
