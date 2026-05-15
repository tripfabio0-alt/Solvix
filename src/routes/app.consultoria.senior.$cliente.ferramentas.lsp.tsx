import React, { useState, useRef } from 'react';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Plus, 
  Trash, 
  ShieldAlert,
  ChevronRight,
  Code2
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

function LspGeneratorRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/lsp' });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState<'script' | 'variaveis' | 'funcoes' | 'ajuda'>('script');
  const [mode, setMode] = useState<'text' | 'image'>('text');

  const generate = () => {
    const val = inputRef.current?.value || '';
    if (!val.trim() && !image) return;
    setLoading(true);
    
    // Simulação local para evitar travamento de API
    setTimeout(() => {
      setResult(parseResponse(MOCK_RESPONSE));
      setLoading(false);
    }, 800);
  };

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
      }),
      funcoes: get('FUNCOES', 'DICAS').split('\n').map(f => {
        const [nome, desc] = f.split(':');
        return { nome: nome?.trim(), descricao: desc?.trim() };
      }),
      dicas: get('DICAS', 'ATENCAO').split('\n').map(d => d.trim()).filter(Boolean),
      atencao: get('ATENCAO', 'FIM') || raw.split('[ATENCAO]')[1]?.trim()
    };
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
              <Code2 className="text-amber-500" /> Gerador LSP
            </h1>
            <p className="text-sm text-slate-400">Cliente: <span className="text-amber-500 font-bold uppercase">{cliente}</span></p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
          <button onClick={() => setMode('text')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${mode === 'text' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>TEXTO</button>
          <button onClick={() => setMode('image')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${mode === 'image' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>IMAGEM</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900/40 p-6 rounded-xl border border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Configuração</h2>
          
          <textarea
            ref={inputRef}
            placeholder="Descreva a regra que você precisa..."
            className="w-full h-48 bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-amber-500/50 outline-none resize-none"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'PROCESSANDO...' : <><Sparkles className="h-4 w-4" /> GERAR REGRA</>}
          </button>
        </div>

        <div className="bg-slate-900/20 rounded-xl border border-white/5 overflow-hidden">
          {result ? (
            <div className="flex flex-col h-full">
              <div className="bg-slate-900/60 p-4 border-b border-white/10 flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-amber-500">{tab}</span>
                <div className="flex gap-2">
                  {['script', 'variaveis', 'funcoes', 'ajuda'].map(t => (
                    <button key={t} onClick={() => setTab(t as any)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tab === t ? 'bg-white/10 text-white' : 'text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="p-6 overflow-auto">
                {tab === 'script' && <pre className="text-xs font-mono text-emerald-400 leading-relaxed">{result.script}</pre>}
                {tab === 'variaveis' && (
                  <div className="space-y-2">
                    {result.variaveis.map((v: any, i: number) => (
                      <div key={i} className="text-xs p-2 bg-white/5 rounded">
                        <span className="text-amber-500 font-bold">{v.nome}</span>: {v.descricao}
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'ajuda' && <p className="text-xs text-slate-300 leading-relaxed">{result.atencao}</p>}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 italic text-sm">
              Aguardando definição...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
