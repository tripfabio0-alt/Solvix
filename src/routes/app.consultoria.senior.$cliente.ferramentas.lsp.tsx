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
  Code2,
  Image as ImageIcon,
  X,
  Type
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/ferramentas/lsp')({
  component: LspGeneratorRoute,
});

const SUPABASE_URL = 'https://dvvjcewohzbtgtotlbbv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_r4QQOZU3uyKdKw9sZxQ9UQ_2R0JFmdo';

const SYSTEM_PROMPT = `Você é um especialista em regras LSP do Senior Gestão Empresarial ERP.
Quando receber uma imagem de tela do sistema Senior, analise os campos, botões e contexto visível para entender o que precisa ser customizado.
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
    const start = text.indexOf(`##${tag}##`);
    if (start === -1) return "";
    const after = start + tag.length + 4;
    const end = text.indexOf(`##${next}##`, after);
    return (end === -1 ? text.slice(after) : text.slice(after, end)).trim();
  };
  
  return {
    titulo: get("TITULO", "MODULO"),
    modulo: get("MODULO", "IDENTIFICADOR"),
    identificador: get("IDENTIFICADOR", "DESCRICAO"),
    descricao: get("DESCRICAO", "SCRIPT"),
    script: get("SCRIPT", "VARIAVEIS"),
    variaveis: get("VARIAVEIS", "FUNCOES").split("\n").filter(Boolean).map(l => {
      const [n, t, ...r] = l.split("|");
      return { nome: n?.trim(), tipo: t?.trim(), descricao: r.join("|").trim() };
    }).filter(v => v.nome),
    funcoes: get("FUNCOES", "DICAS").split("\n").filter(Boolean).map(l => {
      const [n, ...r] = l.split("|");
      return { nome: n?.trim(), descricao: r.join("|").trim() };
    }).filter(f => f.nome),
    dicas: get("DICAS", "ATENCAO").split("\n").filter(Boolean).map(d => d.trim()).filter(Boolean),
    atencao: get("ATENCAO", "FIM"),
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function LspGeneratorRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/ferramentas/lsp' });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState('script');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [image, setImage] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const base64 = await fileToBase64(file);
    setImage({ file, base64, preview: URL.createObjectURL(file), mediaType: file.type });
    setMode("image");
  };

  const generate = async () => {
    const val = inputRef.current?.value || '';
    if (!val.trim() && !image) return;
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let parts = [];
      if (val.trim()) {
        parts.push({ text: val.trim() });
      } else {
        parts.push({ text: "Analise esta tela do Senior e gere a regra LSP adequada conforme o contexto visível." });
      }

      if (mode === "image" && image) {
        parts.push({
          inlineData: {
            mimeType: image.mediaType,
            data: image.base64
          }
        });
      }

      const payload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: parts }]
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro na API (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || "Erro retornado pela API");
      }

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!raw) throw new Error("O Gemini retornou uma resposta vazia.");
      if (!raw.includes("##TITULO##")) throw new Error("Formato de resposta inesperado. Tente novamente.");

      setResult(parseResponse(raw));
      setTab('script');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro inesperado.");
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

  const getLineColor = (line: string) => {
    const t = line.trim();
    if (t.startsWith("@")) return "text-slate-500 italic";
    if (/^(Definir|Se|FimSe|Enquanto|FimEnquanto|ParaCada|FimParaCada)\b/i.test(t)) return "text-blue-400 font-bold";
    if (/^[A-Z][a-zA-Z]+\(/.test(t)) return "text-emerald-400";
    return "text-slate-300";
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
          <button 
            onClick={() => setMode('text')} 
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${mode === 'text' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Type className="h-3 w-3" /> TEXTO
          </button>
          <button 
            onClick={() => setMode('image')} 
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${mode === 'image' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ImageIcon className="h-3 w-3" /> IMAGEM
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900/40 p-6 rounded-xl border border-white/5 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Configuração</h2>
            {mode === 'image' && (
              <button 
                onClick={() => fileRef.current?.click()}
                className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 transition-colors"
              >
                {image ? "TROCAR PRINT" : "SELECIONAR PRINT"}
              </button>
            )}
          </div>
          
          {mode === 'image' && (
            <div 
              className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${image ? 'border-amber-500/50' : 'border-white/10 hover:border-amber-500/30 cursor-pointer'}`}
              onClick={() => !image && fileRef.current?.click()}
            >
              {image ? (
                <div className="relative group">
                  <img src={image.preview} alt="Print Senior" className="w-full max-h-64 object-contain bg-black/40" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute top-2 right-2 p-1 bg-red-900/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[10px] text-slate-400 flex justify-between">
                    <span>{image.file.name}</span>
                    <span>{(image.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                  <p className="text-xs">Arraste ou clique para enviar um print da tela</p>
                </div>
              )}
            </div>
          )}
          
          <input 
            ref={fileRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
          />

          <textarea
            ref={inputRef}
            placeholder={mode === 'image' ? "O que você deseja fazer nesta tela? (Ex: Bloquear campo X se Y)" : "Descreva a regra que você precisa..."}
            className="w-full h-48 bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-amber-500/50 outline-none resize-none font-sans"
            spellCheck={false}
          />

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-xs text-red-400 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || (!image && mode === 'image' && !inputRef.current?.value)}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20"
          >
            {loading ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> PROCESSANDO...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> {mode === 'image' ? 'ANALISAR E GERAR' : 'GERAR REGRA'}</>
            )}
          </button>
        </div>

        <div className="bg-slate-900/20 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-[500px]">
          {result ? (
            <div className="flex flex-col h-full">
              <div className="bg-slate-900/60 p-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Título</span>
                    <div className="text-xs text-white font-bold truncate">{result.titulo}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Identificador</span>
                    <div className="text-xs text-amber-500 font-mono truncate">{result.identificador}</div>
                  </div>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['script', 'variaveis', 'funcoes', 'ajuda'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTab(t)} 
                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${tab === t ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                    >
                      {t === 'script' ? '📄 SCRIPT' : t === 'variaveis' ? '🔤 VARIÁVEIS' : t === 'funcoes' ? '⚙ FUNÇÕES' : '💡 DICAS'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto bg-black/20">
                {tab === 'script' && (
                  <div className="relative group">
                    <button 
                      onClick={copy}
                      className={`absolute top-0 right-0 p-2 rounded-md transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/10'}`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <pre className="text-xs font-mono leading-relaxed space-y-1">
                      {result.script?.split('\n').map((line: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-slate-700 w-4 text-right shrink-0 select-none">{i + 1}</span>
                          <span className={getLineColor(line)}>{line}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                )}
                {tab === 'variaveis' && (
                  <div className="space-y-2">
                    {result.variaveis?.length > 0 ? result.variaveis.map((v: any, i: number) => (
                      <div key={i} className="text-xs p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-amber-500 font-mono font-bold">{v.nome}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded border border-blue-900/50">{v.tipo}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] leading-relaxed">{v.descricao}</div>
                      </div>
                    )) : <div className="text-center py-12 text-slate-600 italic text-sm">Nenhuma variável documentada.</div>}
                  </div>
                )}
                {tab === 'funcoes' && (
                  <div className="space-y-2">
                    {result.funcoes?.length > 0 ? result.funcoes.map((f: any, i: number) => (
                      <div key={i} className="text-xs p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="text-emerald-400 font-mono font-bold mb-1">{f.nome}()</div>
                        <div className="text-slate-400 text-[11px] leading-relaxed">{f.descricao}</div>
                      </div>
                    )) : <div className="text-center py-12 text-slate-600 italic text-sm">Nenhuma função especial utilizada.</div>}
                  </div>
                )}
                {tab === 'ajuda' && (
                  <div className="space-y-6">
                    {result.atencao && (
                      <div className="p-4 bg-amber-900/20 border border-amber-900/50 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                          <ShieldAlert className="h-4 w-4" /> Atenção Crítica
                        </div>
                        <p className="text-xs text-amber-200/80 leading-relaxed">{result.atencao}</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dicas de Implementação</h3>
                      {result.dicas?.map((d: string, i: number) => (
                        <div key={i} className="flex gap-3 text-xs text-slate-300 items-start">
                          <div className="h-5 w-5 rounded bg-white/5 flex items-center justify-center shrink-0 text-amber-500 font-bold text-[10px]">{i + 1}</div>
                          <p className="leading-relaxed">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Terminal className="h-8 w-8 opacity-20" />
              </div>
              <p className="italic text-sm">Aguardando definição dos requisitos...</p>
              <p className="text-[10px] mt-2 opacity-50">Descreva a regra ou envie um print da tela Senior para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
