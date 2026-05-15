import React, { useState, useRef, useEffect } from 'react';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useSegment } from '../hooks/SegmentContext';
import { 
  Terminal, 
  Sparkles, 
  Upload, 
  Trash, 
  Copy, 
  Check, 
  ArrowLeft,
  FileCode,
  Layers,
  HelpCircle,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspGeneratorRoute,
});

const MOCK_RESPONSE = `
##TITULO##
Validação de Limite de Crédito de Cliente
##MODULO##
Mercado (Vendas)
##IDENTIFICADOR##
VEN-000492810
##DESCRICAO##
Bloqueia o faturamento de pedidos se o saldo devedor do cliente somado ao valor do pedido exceder o limite autorizado.
##SCRIPT##
@ Regra de Processo LSP - Validação de Limite de Crédito @
Definir Numero nLimiteCredito;
Definir Numero nSaldoDevedor;
Definir Numero nValorPedido;
Definir Alfa aCliente;
Definir Alfa aRetorno;

@ Busca informações financeiras do cliente @
BuscaReg("E085CLI", "CodCli", aCliente, nLimiteCredito);
BuscaReg("E156FIN", "SldDev", aCliente, nSaldoDevedor);

Se ((nSaldoDevedor + nValorPedido) > nLimiteCredito)
  aRetorno = "Limite de Crédito Excedido!";
  GeraLog("Cliente " + aCliente + " bloqueado por falta de limite disponível.");
  Mensagem(Erro, aRetorno);
  Se (aRetorno <> "OK")
    GeraLog("Pedido bloqueado com sucesso");
  FimSe;
FimSe;
##VARIAVEIS##
nLimiteCredito|Numero|Valor total do limite de crédito autorizado na ficha cadastral
nSaldoDevedor|Numero|Saldo acumulado de títulos em aberto e faturamentos pendentes
nValorPedido|Numero|Valor líquido total do pedido de venda atual
aCliente|Alfa|Código identificador único do cliente no ERP
aRetorno|Alfa|Mensagem de resposta de validação de erro ou sucesso
##FUNCOES##
BuscaReg|Consulta registros específicos em tabelas internas do Senior Sapiens ERP.
GeraLog|Gera registros detalhados no log de execução para auditoria de processos.
Mensagem|Dispara alertas modais de sucesso, aviso ou interrupção (Erro) no terminal do usuário.
##DICAS##
Sempre homologue as regras no ambiente de Testes antes de aplicar em Produção.
Certifique-se de associar a regra ao evento de Processo adequado (ex: evento 120 - Gravar Pedido).
Use a função GeraLog() para mapear o fluxo de variáveis durante a depuração de falhas.
##ATENCAO##
O excesso de regras associadas a eventos críticos de gravação (tabela E120PED) pode impactar o tempo de gravação de pedidos em faturamentos de grande volume.
##FIM##
`;

function parseResponse(text: string) {
  const get = (tag: string, next: string) => {
    const start = text.indexOf(`##${tag}##`);
    if (start === -1) return '';
    const after = start + tag.length + 4;
    const end = text.indexOf(`##${next}##`, after);
    return (end === -1 ? text.slice(after) : text.slice(after, end)).trim();
  };
  return {
    titulo: get('TITULO', 'MODULO'),
    modulo: get('MODULO', 'IDENTIFICADOR'),
    identificador: get('IDENTIFICADOR', 'DESCRICAO'),
    descricao: get('DESCRICAO', 'SCRIPT'),
    script: get('SCRIPT', 'VARIAVEIS'),
    variaveis: get('VARIAVEIS', 'FUNCOES')
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        const [n, t, ...r] = l.split('|');
        return { nome: n?.trim(), tipo: t?.trim(), descricao: r.join('|').trim() };
      })
      .filter((v) => v.nome),
    funcoes: get('FUNCOES', 'DICAS')
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        const [n, ...r] = l.split('|');
        return { nome: n?.trim(), descricao: r.join('|').trim() };
      })
      .filter((f) => f.nome),
    dicas: get('DICAS', 'ATENCAO')
      .split('\n')
      .filter(Boolean)
      .map((d) => d.trim())
      .filter(Boolean),
    atencao: get('ATENCAO', 'FIM'),
  };
}

function LspGeneratorRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/lsp' });

  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ preview: string; name: string; size: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'script' | 'variaveis' | 'funcoes' | 'ajuda'>('script');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage({
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB'
    });
    setMode('image');
  };

  const generate = () => {
    if (!input.trim() && !image) return;
    setLoading(true);
    setError('');
    setResult(null);

    // AI Generation simulation
    setTimeout(() => {
      try {
        setResult(parseResponse(MOCK_RESPONSE));
        setTab('script');
      } catch (err: any) {
        setError(err.message || 'Erro ao processar a regra LSP.');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const copyCode = () => {
    if (!result?.script) return;
    navigator.clipboard.writeText(result.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineColor = (line: string) => {
    const t = line.trim();
    if (t.startsWith('@')) return 'text-slate-500 italic';
    if (/^(Definir|Se|FimSe|Enquanto|FimEnquanto)\b/i.test(t)) return 'text-sky-300 font-bold';
    if (/^[A-Z][a-zA-Z]+\(/.test(t)) return 'text-emerald-300';
    return 'text-slate-300';
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header and Go Back */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/consultoria/senior/${cliente}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 bg-secondary/20 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">🤖</span>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">Gerador de Regra LSP</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Desenvolva regras de processo otimizadas para o ERP Senior.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-secondary/15 p-1 rounded-lg border border-border/30">
          <button
            onClick={() => setMode('text')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === 'text' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-muted-foreground'
            }`}
          >
            ✏️ Requisito Texto
          </button>
          <button
            onClick={() => setMode('image')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === 'image' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-muted-foreground'
            }`}
          >
            🖼️ Print de Tela
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        
        {/* Left Input Configuration Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Definição do Requisito</h3>
            
            {/* File drag zone */}
            {mode === 'image' && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => !image && fileRef.current?.click()}
                className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-amber-500 bg-amber-500/[0.02]' : 'border-border/60 hover:border-amber-500/50 bg-secondary/5'
                }`}
              >
                {image ? (
                  <div className="relative w-full">
                    <img src={image.preview} alt="Upload" className="max-h-40 mx-auto rounded-lg object-contain bg-black" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-2 right-2 flex items-center gap-1 rounded bg-rose-950/80 border border-rose-500/30 px-2 py-1 text-[10px] text-rose-300 font-bold hover:bg-rose-900"
                    >
                      <Trash className="h-3 w-3" />
                      <span>Remover</span>
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-3">{image.name} ({image.size})</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary/30 text-muted-foreground group-hover:scale-110 transition-all">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold">Arraste a captura de tela aqui</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG, JPEG até 5MB</p>
                  </div>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Descrição da Lógica do Negócio</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
                placeholder={
                  mode === 'image' 
                    ? 'Ex: Quero validar se a quantidade de faturamento na tela é maior que zero...' 
                    : 'Ex: Quero bloquear o pedido de venda se o cliente estiver inadimplente...'
                }
                className="w-full h-32 rounded-lg border border-border/40 bg-secondary/10 px-4 py-3 text-xs text-foreground outline-none focus:border-amber-500/40 focus:bg-secondary/20 resize-none leading-relaxed"
              />
            </div>

            {/* Presets */}
            {mode === 'text' && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block">Exemplos Rápidos</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Bloquear faturamento por limite de crédito',
                    'Logar alterações de preços críticos',
                    'Alerta de estoque mínimo PCP'
                  ].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setInput(ex)}
                      className="text-[10px] font-medium border border-border/30 bg-secondary/25 px-2.5 py-1 rounded hover:bg-secondary/40 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading || (!input.trim() && !image)}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                loading || (!input.trim() && !image)
                  ? 'bg-secondary/20 text-muted-foreground border border-border/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Analisando Regras com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Gerar Código LSP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Block Column */}
        <div className="md:col-span-7">
          {result ? (
            <div className="space-y-6">
              
              {/* Header Info Banner */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/40 bg-card/50 p-5">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Título da Regra</span>
                  <span className="text-xs font-bold text-foreground">{result.titulo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Módulo</span>
                  <span className="text-xs font-bold text-amber-400">{result.modulo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Identificador</span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">{result.identificador}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Descrição</span>
                  <span className="text-xs text-slate-400 line-clamp-1">{result.descricao}</span>
                </div>
              </div>
 
              {/* Tabs Output Selector */}
              <div className="rounded-xl border border-border/40 bg-[#0f111a]/95 overflow-hidden">
                <div className="flex border-b border-border/30 bg-card/10 px-4 gap-1">
                  {[
                    { id: 'script', label: '📄 SCRIPT LSP' },
                    { id: 'variaveis', label: '🔤 VARIÁVEIS' },
                    { id: 'funcoes', label: '⚙️ FUNÇÕES' },
                    { id: 'ajuda', label: '💡 RECOMENDAÇÕES' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id as any)}
                      className={`px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                        tab === t.id
                          ? 'border-amber-500 text-amber-500'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Script Display */}
                {tab === 'script' && (
                  <div className="relative p-6 font-mono text-xs overflow-x-auto max-h-[400px]">
                    <button
                      onClick={copyCode}
                      className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all ${
                        copied 
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' 
                          : 'bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    <pre className="space-y-1.5 pr-20">
                      {result.script.split('\n').map((line: string, i: number) => (
                        <div key={i} className="flex items-start">
                          <span className="text-[10px] text-slate-600 select-none w-8 mr-4 text-right">{i + 1}</span>
                          <span className={getLineColor(line)}>{line}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                )}

                {/* Variables Display */}
                {tab === 'variaveis' && (
                  <div className="p-6">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground">
                          <th className="py-2.5 font-bold uppercase tracking-wider">Variável</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-center">Tipo</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.variaveis.map((v: any, i: number) => (
                          <tr key={i} className="border-b border-border/20 font-medium">
                            <td className="py-3 text-emerald-400 font-mono font-bold">{v.nome}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.tipo === 'Alfa' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {v.tipo}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground">{v.descricao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Functions Display */}
                {tab === 'funcoes' && (
                  <div className="p-6 space-y-4">
                    {result.funcoes.map((f: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-secondary/10">
                        <span className="text-amber-500 font-bold font-mono text-xs">{f.nome}()</span>
                        <p className="text-muted-foreground text-xs leading-relaxed">{f.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations Display */}
                {tab === 'ajuda' && (
                  <div className="p-6 space-y-6">
                    {result.atencao && (
                      <div className="flex gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.02]">
                        <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block mb-1">Ponto de Atenção</span>
                          <p className="text-xs text-rose-300/90 leading-relaxed">{result.atencao}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Dicas de Homologação</span>
                      {result.dicas.map((d: string, i: number) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/30 bg-secondary/5 text-xs text-muted-foreground leading-relaxed">
                          <span className="text-amber-500 font-bold">{i + 1}.</span>
                          <p>{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-border/40 rounded-xl h-[450px] p-6 text-center backdrop-blur-md">
              <Terminal className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <h4 className="font-bold text-foreground mb-1">Aguardando Parâmetros</h4>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Insira as diretrizes do negócio ou faça o upload de uma imagem no painel lateral e clique em <strong className="text-amber-500">Gerar Código</strong>.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
export default LspGeneratorRoute;
