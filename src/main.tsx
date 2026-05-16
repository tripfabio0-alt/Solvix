import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

const router = getRouter();

// Utilitário de emergência para limpar cache/login se travar
(window as any).solvixReset = () => {
  localStorage.clear();
  window.location.href = '/';
};

// ── MODO TURBO ATÔMICO ──────────────────────────────────────────────────────
// Se estiver em uma ferramenta, ejetamos o React e o Roteador pesado.
// Renderizamos uma versão "Pura" (Vanilla) para garantir performance zero-lag.
if (window.location.pathname.includes('/ferramentas/lsp') || window.location.pathname.includes('/ferramentas/sql')) {
  const isSql = window.location.pathname.includes('/ferramentas/sql');
  document.body.innerHTML = `
    <div style="background:#05050a; min-height:100vh; color:white; font-family:sans-serif; padding:40px; display:flex; flex-direction:column; align-items:center;">
      <div style="width:100%; max-width:800px; display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
        <h1 style="font-size:24px;">Gerador ${isSql ? 'SQL' : 'LSP'} (Modo Ultra)</h1>
        <a href="/app/dashboard" style="color:#8b949e; text-decoration:none; border:1px solid #333; padding:8px 16px; border-radius:6px; font-size:13px;">← Voltar ao Site</a>
      </div>
      <div style="width:100%; max-width:800px; background:#0d1117; border:1px solid #30363d; border-radius:12px; padding:20px;">
        <textarea id="ai-input" placeholder="Digite sua lógica... (Zero React / Zero Lag)" style="width:100%; height:300px; background:transparent; color:white; border:none; outline:none; font-size:16px; font-family:monospace; resize:vertical;"></textarea>
        <div style="display:flex; justify-content:flex-end; padding-top:20px; border-top:1px solid #30363d;">
          <button id="ai-btn" style="background:#238636; color:white; border:none; padding:12px 30px; border-radius:6px; font-weight:bold; cursor:pointer;">${isSql ? 'GERAR SQL' : 'GERAR CÓDIGO SENIOR'}</button>
        </div>
      </div>
      <div id="ai-result" style="width:100%; max-width:800px; margin-top:20px;"></div>
    </div>
  `;

  const btn = document.getElementById('ai-btn');
  const input = document.getElementById('ai-input') as HTMLTextAreaElement;
  const result = document.getElementById('ai-result');

  btn?.addEventListener('click', async () => {
    if (!input.value.trim()) return;
    btn.innerText = "GERANDO...";
    btn.style.opacity = "0.5";
    try {
      const res = await fetch("/api/gerar-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: (isSql ? "[MODO SQL] " : "[MODO LSP] ") + input.value }),
      });
      const data = await res.json();
      const raw = data.resultado;
      const get = (tag: string) => {
        const s = raw.indexOf("##" + tag + "##");
        if (s === -1) return "";
        const after = s + tag.length + 4;
        const e = raw.indexOf("##", after);
        return (e === -1 ? raw.slice(after) : raw.slice(after, e)).trim();
      };
      const content = isSql ? get("SQL_CURSOR") : get("CONTEUDO");
      if (result) {
        result.innerHTML = `
          <div style="background:#010409; border:1px solid #30363d; border-radius:8px; padding:20px;">
            <div style="color:#8b949e; font-size:11px; margin-bottom:10px;">RESULTADO GERADO</div>
            <pre style="color:${isSql ? '#79c0ff' : '#d2a8ff'}; font-size:14px; white-space:pre-wrap; line-height:1.6;">${content}</pre>
          </div>
        `;
      }
    } catch (e) {
      alert("Erro na conexão");
    } finally {
      btn.innerText = isSql ? "GERAR SQL" : "GERAR CÓDIGO SENIOR";
      btn.style.opacity = "1";
    }
  });
} else {
  // Caso contrário, carrega o site normal com React
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
  )
}
