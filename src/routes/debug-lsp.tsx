import { useState, useRef } from "react";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/debug-lsp')({
  component: DebugLspPage,
});

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

function fileToBase64(file: File): Promise<string> {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res((r.result as string).split(",")[1]);
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}

function DebugLspPage() {
  const [input,setInput]=useState("");
  const [image,setImage]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<any>(null);
  const [error,setError]=useState("");
  const [tab,setTab]=useState("script");
  const [copied,setCopied]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const [mode,setMode]=useState("text");
  const fileRef=useRef<HTMLInputElement>(null);

  const handleFile=async(file: File)=>{
    if(!file||!file.type.startsWith("image/"))return;
    const base64=await fileToBase64(file);
    setImage({file,base64,preview:URL.createObjectURL(file),mediaType:file.type});
    setMode("image");
  };

  const generate=async()=>{
    if(!input.trim()&&!image)return;
    setLoading(true);setError("");setResult(null);
    try{
      let messages;
      if(mode==="image"&&image){
        const content=[{type:"image",source:{type:"base64",media_type:image.mediaType,data:image.base64}},{type:"text",text:input.trim()||"Analise esta tela do Senior e gere a regra LSP adequada conforme o contexto visível."}];
        messages=[{role:"user",content}];
      }else{
        messages=[{role:"user",content:input.trim()}];
      }
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages}),
      });
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(`API ${res.status}: ${e?.error?.message||res.statusText}`);}
      const data=await res.json();
      const raw=(data.content||[]).map((c: any)=>c.text||"").join("");
      if(!raw)throw new Error("Resposta vazia.");
      if(!raw.includes("##TITULO##"))throw new Error("Formato inesperado. Tente novamente.");
      setResult(parseResponse(raw));setTab("script");
    }catch(err: any){setError(err.message||"Erro desconhecido.");}
    finally{setLoading(false);}
  };

  const copy=()=>{if(!result?.script)return;navigator.clipboard.writeText(result.script);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const lc=(line: string)=>{const t=line.trim();if(t.startsWith("@"))return"#64748b";if(/^(Definir|Se|FimSe|Enquanto|FimEnquanto|ParaCada|FimParaCada)\b/i.test(t))return"#93c5fd";if(/^[A-Z][a-zA-Z]+\(/.test(t))return"#86efac";return"#cbd5e1";};
  const ok=(input.trim()||image)&&!loading;

  return(
    <div style={{minHeight:"100vh",background:"#0f1117",fontFamily:"'Courier New',monospace",color:"#e2e8f0"}}>

      {/* Header */}
      <div style={{borderBottom:"1px solid #1e293b",background:"#0a0d14",padding:"18px 32px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#f59e0b,#d97706)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:"bold",color:"#000"}}>S</div>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9",letterSpacing:"0.05em"}}>DEBUG · GERADOR DE REGRAS LSP</div>
          <div style={{fontSize:10,color:"#64748b",letterSpacing:"0.08em"}}>MODO ISOLADO · SEM CONTEXTO GLOBAL</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c,opacity:.7}}/>)}
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 24px"}}>

        {/* Mode Toggle */}
        <div style={{display:"flex",gap:4,marginBottom:16,background:"#0a0d14",border:"1px solid #1e293b",borderRadius:6,padding:4,width:"fit-content"}}>
          {[{k:"text",i:"✏",l:"TEXTO"},{k:"image",i:"🖼",l:"PRINT DE TELA"}].map(m=>(
            <button key={m.k} onClick={()=>setMode(m.k as any)} style={{padding:"7px 16px",borderRadius:4,border:"none",background:mode===m.k?"#1e293b":"transparent",color:mode===m.k?"#f59e0b":"#475569",fontSize:11,fontFamily:"inherit",letterSpacing:"0.08em",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontWeight:mode===m.k?700:400}}>
              {m.i} {m.l}
            </button>
          ))}
        </div>

        {/* Input Card */}
        <div style={{background:"#13171f",border:"1px solid #1e293b",borderRadius:8,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"10px 16px",background:"#0f1117",borderBottom:"1px solid #1e293b",fontSize:11,color:"#475569",letterSpacing:"0.1em",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#f59e0b"}}>▶</span>
            {mode==="image"?"UPLOAD DO PRINT + DESCRIÇÃO DO QUE DESEJA":"DESCREVA SUA NECESSIDADE"}
            <span style={{marginLeft:"auto",color:"#334155"}}>Ctrl+Enter para gerar</span>
          </div>

          {/* Drop Zone */}
          {mode==="image"&&(
            <div
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);}}
              onClick={()=>!image&&fileRef.current?.click()}
              style={{margin:16,borderRadius:6,border:`2px dashed ${dragOver?"#f59e0b":"#1e293b"}`,background:dragOver?"#1c1200":"#0f1117",transition:"all .2s",cursor:image?"default":"pointer",overflow:"hidden"}}
            >
              {image?(
                <div style={{position:"relative"}}>
                  <img src={image.preview} alt="" style={{width:"100%",maxHeight:240,objectFit:"contain",display:"block",background:"#000"}}/>
                  <button onClick={e=>{e.stopPropagation();setImage(null);}} style={{position:"absolute",top:8,right:8,background:"#1a0a0a",border:"1px solid #7f1d1d",borderRadius:4,color:"#fca5a5",fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>✕ REMOVER</button>
                  <div style={{padding:"6px 12px",background:"#0a0d14",borderTop:"1px solid #1e293b",fontSize:11,color:"#475569"}}>📎 {image.file.name} · {(image.file.size/1024).toFixed(0)} KB</div>
                </div>
              ):(
                <div style={{padding:28,textAlign:"center",color:"#334155"}}>
                  <div style={{fontSize:28,marginBottom:8}}>🖼</div>
                  <div style={{fontSize:12,marginBottom:4,color:"#475569"}}>Arraste um print da tela Senior aqui</div>
                  <div style={{fontSize:11}}>ou clique para selecionar · PNG, JPG, JPEG</div>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0] && handleFile(e.target.files[0])}/>

          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))generate();}}
            spellCheck={false}
            placeholder={mode==="image"?"Ex: Quero validar o campo Qtde antes de salvar, bloqueando se for zero...":"Ex: Quero uma regra que ao apontar uma OP verifique se o operador tem permissão e registre um log..."}
            style={{width:"100%",minHeight:90,background:"transparent",border:"none",borderTop:"1px solid #1e293b",outline:"none",padding:16,color:"#cbd5e1",fontSize:13,fontFamily:"inherit",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}
          />

          <div style={{padding:"10px 16px",borderTop:"1px solid #1e293b",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {mode==="text"&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Validar operador ao apontar OP","Bloquear pedido sem estoque","Log de alteração de quantidade"].map(ex=>(
                  <button key={ex} onClick={()=>setInput(ex)} style={{background:"#0f1117",border:"1px solid #1e293b",borderRadius:4,padding:"4px 10px",color:"#475569",fontSize:10,fontFamily:"inherit",cursor:"pointer"}}>{ex}</button>
                ))}
              </div>
            )}
            {mode==="image"&&(
              <button onClick={()=>fileRef.current?.click()} style={{background:"#0f1117",border:"1px solid #1e293b",borderRadius:4,padding:"6px 12px",color:"#475569",fontSize:11,fontFamily:"inherit",cursor:"pointer"}}>
                📎 {image?"TROCAR IMAGEM":"SELECIONAR IMAGEM"}
              </button>
            )}
            <button onClick={generate} disabled={!ok} style={{background:!ok?"#1e293b":"linear-gradient(135deg,#f59e0b,#d97706)",color:!ok?"#475569":"#000",border:"none",borderRadius:6,padding:"10px 24px",fontSize:12,fontFamily:"inherit",fontWeight:700,letterSpacing:"0.1em",cursor:!ok?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
              {loading?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>GERANDO...</>:mode==="image"?"🖼 ANALISAR E GERAR":"⚡ GERAR REGRA"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error&&<div style={{background:"#1a0a0a",border:"1px solid #7f1d1d",borderRadius:6,padding:"12px 16px",color:"#fca5a5",fontSize:12,marginBottom:16,wordBreak:"break-word"}}>⚠ {error}</div>}

        {/* Result */}
        {result&&(
          <>
            <div style={{background:"#13171f",border:"1px solid #1e293b",borderRadius:8,padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[{label:"TÍTULO",value:result.titulo,color:"#f1f5f9"},{label:"MÓDULO",value:result.modulo,color:"#f59e0b"},{label:"IDENTIFICADOR",value:result.identificador,color:"#94a3b8"},{label:"DESCRIÇÃO",value:result.descricao,color:"#94a3b8"}].map(({label,value,color})=>(
                <div key={label}><div style={{fontSize:10,color:"#475569",letterSpacing:"0.1em",marginBottom:4}}>{label}</div><div style={{fontSize:13,color,lineHeight:1.4}}>{value}</div></div>
              ))}
            </div>
            <div style={{background:"#13171f",border:"1px solid #1e293b",borderRadius:8,overflow:"hidden"}}>
              <div style={{display:"flex",borderBottom:"1px solid #1e293b",background:"#0f1117"}}>
                {[{k:"script",l:"📄 SCRIPT LSP"},{k:"variaveis",l:"🔤 VARIÁVEIS"},{k:"funcoes",l:"⚙ FUNÇÕES"},{k:"ajuda",l:"💡 AJUDA"}].map(t=>(
                  <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"10px 14px",background:"transparent",border:"none",borderBottom:tab===t.k?"2px solid #f59e0b":"2px solid transparent",color:tab===t.k?"#f59e0b":"#475569",fontSize:11,fontFamily:"inherit",cursor:"pointer",fontWeight:tab===t.k?700:400}}>{t.l}</button>
                ))}
              </div>
              {tab==="script"&&(
                <div style={{position:"relative"}}>
                  <button onClick={copy} style={{position:"absolute",top:12,right:12,background:copied?"#166534":"#1e293b",color:copied?"#86efac":"#94a3b8",border:`1px solid ${copied?"#166534":"#334155"}`,borderRadius:4,padding:"6px 12px",fontSize:10,fontFamily:"inherit",cursor:"pointer",zIndex:10}}>{copied?"✓ COPIADO":"⎘ COPIAR"}</button>
                  <pre style={{margin:0,padding:"20px 16px",fontSize:12,lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                    {(result.script||"").split("\n").map((line: string,i: number)=>(
                      <span key={i} style={{color:lc(line),fontStyle:line.trim().startsWith("@")?"italic":"normal",display:"block"}}>
                        <span style={{color:"#334155",userSelect:"none",marginRight:12,fontSize:10}}>{String(i+1).padStart(2,"0")}</span>{line}
                      </span>
                    ))}
                  </pre>
                </div>
              )}
              {tab==="variaveis"&&(
                <div style={{padding:16}}>
                  {result.variaveis?.length>0?(
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr style={{borderBottom:"1px solid #1e293b"}}>{["VARIÁVEL","TIPO","DESCRIÇÃO"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#475569",fontSize:10,letterSpacing:"0.1em"}}>{h}</th>)}</tr></thead>
                      <tbody>{result.variaveis.map((v: any,i: number)=>(
                        <tr key={i} style={{borderBottom:"1px solid #0f1117"}}>
                          <td style={{padding:"10px 12px",color:"#86efac",fontFamily:"monospace"}}>{v.nome}</td>
                          <td style={{padding:"10px 12px"}}><span style={{background:v.tipo==="Alfa"?"#1e3a5f":v.tipo==="Numero"?"#1a3a1a":"#3a1a1a",color:v.tipo==="Alfa"?"#93c5fd":v.tipo==="Numero"?"#86efac":"#fca5a5",padding:"2px 8px",borderRadius:3,fontSize:10}}>{v.tipo}</span></td>
                          <td style={{padding:"10px 12px",color:"#94a3b8"}}>{v.descricao}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  ):<div style={{color:"#475569",fontSize:12,textAlign:"center",padding:24}}>Nenhuma variável documentada.</div>}
                </div>
              )}
              {tab==="funcoes"&&(
                <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
                  {(result.funcoes||[]).map((f: any,i: number)=>(
                    <div key={i} style={{background:"#0f1117",border:"1px solid #1e293b",borderRadius:6,padding:"12px 16px",display:"flex",gap:16}}>
                      <span style={{color:"#f59e0b",fontSize:12,fontFamily:"monospace",minWidth:180,fontWeight:600}}>{f.nome}()</span>
                      <span style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{f.descricao}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab==="ajuda"&&(
                <div style={{padding:20}}>
                  {result.atencao&&<div style={{background:"#1c1200",border:"1px solid #78350f",borderRadius:6,padding:"12px 16px",marginBottom:20,display:"flex",gap:10}}><span>⚠</span><div><div style={{fontSize:10,color:"#f59e0b",letterSpacing:"0.1em",marginBottom:4}}>ATENÇÃO</div><div style={{fontSize:12,color:"#fcd34d",lineHeight:1.5}}>{result.atencao}</div></div></div>}
                  <div style={{fontSize:10,color:"#475569",letterSpacing:"0.1em",marginBottom:12}}>DICAS DE USO</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(result.dicas||[]).map((d: string,i: number)=>(
                      <div key={i} style={{background:"#0f1117",border:"1px solid #1e293b",borderRadius:6,padding:"12px 16px",fontSize:12,color:"#94a3b8",lineHeight:1.5,display:"flex",gap:10}}>
                        <span style={{color:"#f59e0b",minWidth:16}}>{i+1}.</span>{d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!result&&!loading&&!error&&(
          <div style={{textAlign:"center",padding:"40px 24px"}}>
            <div style={{fontSize:32,marginBottom:12,opacity:.2}}>{mode==="image"?"🖼":"⌨"}</div>
            <div style={{fontSize:12,lineHeight:1.6,maxWidth:420,margin:"0 auto",color:"#475569"}}>
              {mode==="image"
                ?"Faça upload de um print da tela do Senior e descreva o que deseja customizar. O sistema irá analisar os campos visíveis e gerar a regra LSP automaticamente."
                :<>Digite uma descrição ou mude para <strong style={{color:"#f59e0b"}}>PRINT DE TELA</strong> para gerar regras a partir de capturas de tela do Senior.</>}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
