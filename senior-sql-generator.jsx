import { useState } from "react";

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

Prefixos de tabelas comuns do ERP Senior:
E085CLI = Clientes, E085FOR = Fornecedores, E075PRO = Produtos
E120NFS = NF Saída, E120IPD = Itens Pedido, E140MOV = Movimentos Financeiros
E001TNS = Transações, E012FAM = Família de Produtos
Use Senior SQL 2 (sem funções nativas de banco como TO_DATE; use funções Senior como DataParaAlfa).`;

function parseResponse(text) {
  const get = (tag, next) => {
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

export default function SQLGenerator() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("cursor");
  const [copied, setCopied] = useState({});

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: SYSTEM_PROMPT,
          messages:[{role:"user",content:input.trim()}]
        }),
      });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(`API ${res.status}: ${e?.error?.message||res.statusText}`); }
      const data = await res.json();
      const raw = (data.content||[]).map(c=>c.text||"").join("");
      if (!raw || !raw.includes("##TITULO##")) throw new Error("Formato inesperado. Tente novamente.");
      setResult(parseResponse(raw)); setTab("cursor");
    } catch(err) { setError(err.message||"Erro desconhecido."); }
    finally { setLoading(false); }
  };

  const copy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(p=>({...p,[key]:true}));
    setTimeout(()=>setCopied(p=>({...p,[key]:false})),2000);
  };

  const sqlColor = (line) => {
    const t = line.trim().toUpperCase();
    if (t.startsWith("@")) return "#64748b";
    if (/^(SELECT|FROM|WHERE|JOIN|LEFT|INNER|AND|OR|ORDER|GROUP|HAVING|INSERT|UPDATE|DELETE|ON)\b/.test(t)) return "#93c5fd";
    if (/^(SQL_CRIAR|SQL_DEFINIR|SQL_ABRIR|SQL_EOF|SQL_PROXIMO|SQL_FECHAR|SQL_DESTRUIR|SQL_RETORNAR)/i.test(t)) return "#86efac";
    if (/^(DEFINIR|ENQUANTO|SE|FIMSE|FIMENQUANTO)\b/i.test(t)) return "#f9a8d4";
    return "#cbd5e1";
  };

  const canGenerate = input.trim() && !loading;
  const TABS = [
    {k:"cursor",l:"🔗 CURSOR LSP"},
    {k:"sql",l:"📋 SQL NATIVO"},
    {k:"variaveis",l:"🔤 VARIÁVEIS"},
    {k:"ajuda",l:"💡 AJUDA"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#070a0f",fontFamily:"'Courier New',monospace",color:"#e2e8f0"}}>

      {/* Header */}
      <div style={{borderBottom:"1px solid #1a2744",background:"#040610",padding:"18px 32px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:"bold",color:"#fff"}}>SQL</div>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9",letterSpacing:"0.05em"}}>SENIOR · GERADOR DE SQL SENIOR 2</div>
          <div style={{fontSize:10,color:"#334155",letterSpacing:"0.08em"}}>GESTÃO EMPRESARIAL | ERP · CURSORES LSP</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c,opacity:.7}}/>)}
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px"}}>

        {/* Input */}
        <div style={{background:"#0d1117",border:"1px solid #1a2744",borderRadius:8,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"10px 16px",background:"#040610",borderBottom:"1px solid #1a2744",fontSize:11,color:"#334155",letterSpacing:"0.1em",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#3b82f6"}}>▶</span>
            DESCREVA O QUE DESEJA CONSULTAR NO BANCO DO SENIOR
            <span style={{marginLeft:"auto",color:"#1e293b"}}>Ctrl+Enter para gerar</span>
          </div>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))generate();}}
            placeholder="Ex: Quero buscar todos os pedidos de venda em aberto de um cliente, mostrando número do pedido, data, valor total e situação..."
            style={{width:"100%",minHeight:100,background:"transparent",border:"none",outline:"none",padding:16,color:"#cbd5e1",fontSize:13,fontFamily:"inherit",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}
          />
          <div style={{padding:"10px 16px",borderTop:"1px solid #1a2744",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {EXAMPLES.map(ex=>(
                <button key={ex} onClick={()=>setInput(ex)} style={{background:"#040610",border:"1px solid #1a2744",borderRadius:4,padding:"4px 10px",color:"#334155",fontSize:10,fontFamily:"inherit",cursor:"pointer",transition:"color .2s"}}
                  onMouseEnter={e=>e.target.style.color="#3b82f6"} onMouseLeave={e=>e.target.style.color="#334155"}>
                  {ex}
                </button>
              ))}
            </div>
            <button onClick={generate} disabled={!canGenerate} style={{background:!canGenerate?"#1a2744":"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:!canGenerate?"#334155":"#fff",border:"none",borderRadius:6,padding:"10px 28px",fontSize:12,fontFamily:"inherit",fontWeight:700,letterSpacing:"0.1em",cursor:!canGenerate?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {loading?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>GERANDO...</>:"⚙ GERAR SQL"}
            </button>
          </div>
        </div>

        {error && <div style={{background:"#1a0a0a",border:"1px solid #7f1d1d",borderRadius:6,padding:"12px 16px",color:"#fca5a5",fontSize:12,marginBottom:16,wordBreak:"break-word"}}>⚠ {error}</div>}

        {result && (
          <>
            {/* Meta */}
            <div style={{background:"#0d1117",border:"1px solid #1a2744",borderRadius:8,padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
              <div><div style={{fontSize:10,color:"#334155",letterSpacing:"0.1em",marginBottom:4}}>CONSULTA</div><div style={{fontSize:13,color:"#f1f5f9",fontWeight:600}}>{result.titulo}</div></div>
              <div><div style={{fontSize:10,color:"#334155",letterSpacing:"0.1em",marginBottom:4}}>MÓDULO</div><div style={{fontSize:13,color:"#3b82f6"}}>{result.modulo}</div></div>
              <div><div style={{fontSize:10,color:"#334155",letterSpacing:"0.1em",marginBottom:4}}>DESCRIÇÃO</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.4}}>{result.descricao}</div></div>
            </div>

            {/* Tabelas usadas */}
            {result.tabelas?.length > 0 && (
              <div style={{marginBottom:16,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:"#334155",letterSpacing:"0.1em"}}>TABELAS:</span>
                {result.tabelas.map((t,i)=>(
                  <span key={i} style={{background:"#0d1117",border:"1px solid #1a2744",borderRadius:4,padding:"3px 10px",fontSize:11,color:"#64748b",fontFamily:"monospace"}}>{t}</span>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{background:"#0d1117",border:"1px solid #1a2744",borderRadius:8,overflow:"hidden"}}>
              <div style={{display:"flex",borderBottom:"1px solid #1a2744",background:"#040610"}}>
                {TABS.map(t=>(
                  <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"10px 14px",background:"transparent",border:"none",borderBottom:tab===t.k?"2px solid #3b82f6":"2px solid transparent",color:tab===t.k?"#3b82f6":"#334155",fontSize:11,fontFamily:"inherit",cursor:"pointer",fontWeight:tab===t.k?700:400,letterSpacing:"0.05em"}}>
                    {t.l}
                  </button>
                ))}
              </div>

              {/* Cursor LSP */}
              {tab==="cursor" && (
                <div style={{position:"relative"}}>
                  <button onClick={()=>copy("cursor",result.sql_cursor)} style={{position:"absolute",top:12,right:12,background:copied.cursor?"#166534":"#1a2744",color:copied.cursor?"#86efac":"#64748b",border:`1px solid ${copied.cursor?"#166534":"#1e3a5f"}`,borderRadius:4,padding:"6px 12px",fontSize:10,fontFamily:"inherit",cursor:"pointer",zIndex:10}}>
                    {copied.cursor?"✓ COPIADO":"⎘ COPIAR"}
                  </button>
                  <pre style={{margin:0,padding:"20px 16px",fontSize:12,lineHeight:1.8,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                    {(result.sql_cursor||"").split("\n").map((line,i)=>(
                      <span key={i} style={{color:sqlColor(line),fontStyle:line.trim().startsWith("@")?"italic":"normal",display:"block"}}>
                        <span style={{color:"#1e293b",userSelect:"none",marginRight:12,fontSize:10}}>{String(i+1).padStart(2,"0")}</span>
                        {line}
                      </span>
                    ))}
                  </pre>
                </div>
              )}

              {/* SQL Nativo */}
              {tab==="sql" && (
                <div style={{position:"relative"}}>
                  <button onClick={()=>copy("sql",result.sql_nativo)} style={{position:"absolute",top:12,right:12,background:copied.sql?"#166534":"#1a2744",color:copied.sql?"#86efac":"#64748b",border:`1px solid ${copied.sql?"#166534":"#1e3a5f"}`,borderRadius:4,padding:"6px 12px",fontSize:10,fontFamily:"inherit",cursor:"pointer",zIndex:10}}>
                    {copied.sql?"✓ COPIADO":"⎘ COPIAR"}
                  </button>
                  <pre style={{margin:0,padding:"20px 16px",fontSize:12,lineHeight:1.8,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                    {(result.sql_nativo||"").split("\n").map((line,i)=>(
                      <span key={i} style={{color:sqlColor(line),display:"block"}}>
                        <span style={{color:"#1e293b",userSelect:"none",marginRight:12,fontSize:10}}>{String(i+1).padStart(2,"0")}</span>
                        {line}
                      </span>
                    ))}
                  </pre>
                  {result.joins && (
                    <div style={{margin:"0 16px 16px",padding:"12px 16px",background:"#040610",border:"1px solid #1a2744",borderRadius:6,fontSize:12,color:"#64748b",lineHeight:1.6}}>
                      <div style={{fontSize:10,color:"#334155",letterSpacing:"0.1em",marginBottom:8}}>RELACIONAMENTOS</div>
                      {result.joins}
                    </div>
                  )}
                </div>
              )}

              {/* Variáveis */}
              {tab==="variaveis" && (
                <div style={{padding:16}}>
                  {result.variaveis?.length>0?(
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr style={{borderBottom:"1px solid #1a2744"}}>{["VARIÁVEL","TIPO","DESCRIÇÃO"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#334155",fontSize:10,letterSpacing:"0.1em"}}>{h}</th>)}</tr></thead>
                      <tbody>{result.variaveis.map((v,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #070a0f"}}>
                          <td style={{padding:"10px 12px",color:"#86efac",fontFamily:"monospace"}}>{v.nome}</td>
                          <td style={{padding:"10px 12px"}}><span style={{background:v.tipo==="Alfa"?"#1e3a5f":v.tipo==="Numero"?"#1a3a1a":"#3a1a1a",color:v.tipo==="Alfa"?"#93c5fd":v.tipo==="Numero"?"#86efac":"#fca5a5",padding:"2px 8px",borderRadius:3,fontSize:10}}>{v.tipo}</span></td>
                          <td style={{padding:"10px 12px",color:"#64748b"}}>{v.descricao}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  ):<div style={{color:"#334155",fontSize:12,textAlign:"center",padding:24}}>Nenhuma variável documentada.</div>}
                </div>
              )}

              {/* Ajuda */}
              {tab==="ajuda" && (
                <div style={{padding:20}}>
                  {result.atencao&&<div style={{background:"#1c1200",border:"1px solid #78350f",borderRadius:6,padding:"12px 16px",marginBottom:20,display:"flex",gap:10}}><span>⚠</span><div><div style={{fontSize:10,color:"#f59e0b",letterSpacing:"0.1em",marginBottom:4}}>ATENÇÃO</div><div style={{fontSize:12,color:"#fcd34d",lineHeight:1.5}}>{result.atencao}</div></div></div>}
                  <div style={{fontSize:10,color:"#334155",letterSpacing:"0.1em",marginBottom:12}}>DICAS DE USO</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(result.dicas||[]).map((d,i)=>(
                      <div key={i} style={{background:"#040610",border:"1px solid #1a2744",borderRadius:6,padding:"12px 16px",fontSize:12,color:"#64748b",lineHeight:1.5,display:"flex",gap:10}}>
                        <span style={{color:"#3b82f6",minWidth:16}}>{i+1}.</span>{d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!result&&!loading&&!error&&(
          <div style={{textAlign:"center",padding:"48px 24px",color:"#1a2744"}}>
            <div style={{fontSize:36,marginBottom:12,opacity:.3}}>🗄</div>
            <div style={{fontSize:12,lineHeight:1.6,maxWidth:440,margin:"0 auto",color:"#334155"}}>
              Descreva em português o que você quer buscar no banco do Senior. O gerador irá produzir o <strong style={{color:"#3b82f6"}}>SQL nativo</strong> e o <strong style={{color:"#86efac"}}>bloco de cursor LSP</strong> pronto para colar no Editor de Regras.
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}textarea::placeholder{color:#1a2744;}*{box-sizing:border-box;}::-webkit-scrollbar{width:6px;height:6px;}::-webkit-scrollbar-track{background:#070a0f;}::-webkit-scrollbar-thumb{background:#1a2744;border-radius:3px;}`}</style>
    </div>
  );
}
