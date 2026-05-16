import React, { useState, useCallback, memo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSegment } from '../../hooks/SegmentContext';
import {
  LogOut,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = memo(() => {
  const {
    segmentos,
    ferramentas,
    clientes,
    activeSegment,
    activeClient,
    setActiveSegmentBySlug,
    setActiveClientBySlug,
  } = useSegment();

  const navigate = useNavigate();

  const [expandedTool, setExpandedTool] = useState<string | null>('senior');

  const currentTools = ferramentas.filter((f) => f.segmentoId === activeSegment?.id);

  const toggleExpand = useCallback((toolSlug: string) => {
    setExpandedTool((prev) => (prev === toolSlug ? null : toolSlug));
  }, []);

  const handleClientClick = useCallback(
    (clientSlug: string) => {
      setActiveClientBySlug(clientSlug);
      // Redirecionamento forçado para a pasta independente (Bypass React)
      const toolUrl = expandedTool === 'senior-sql' ? '/gerador/sql.html' : '/gerador/';
      window.location.href = toolUrl;
    },
    [setActiveClientBySlug, expandedTool]
  );

  const handleSegmentClick = useCallback(
    (segSlug: string) => {
      setActiveSegmentBySlug(segSlug);
      navigate({ to: '/app/dashboard' });
    },
    [setActiveSegmentBySlug, navigate]
  );

  return (
    <aside className="fixed bottom-0 top-0 left-0 z-30 flex h-full w-[280px] flex-col border-r border-border/40 bg-card">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center border-b border-border/40 p-6">
        <Link to="/" className="group flex flex-col items-center gap-3">
          <img
            src="/Logo.png"
            alt="Solvix"
            className="h-[88px] w-[88px] object-contain transition-transform duration-500 group-hover:scale-110"
          />
          <span className="font-outfit text-2xl font-black tracking-[0.15em] text-foreground">
            SOLVIX PRO
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-1 p-4 bg-secondary/20 border-b border-border/40">
        {segmentos.map((seg) => {
          const isActive = activeSegment?.slug === seg.slug;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => handleSegmentClick(seg.slug)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg border text-[11px] font-bold tracking-wider uppercase transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              <span className="text-lg mb-1">{seg.icone}</span>
              <span>{seg.nome}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-3 block mb-2">
            Ferramentas &amp; Clientes
          </span>

          <ul className="space-y-1.5">
            {currentTools.map((tool) => {
              const isExpanded = expandedTool === tool.slug;
              const toolClients = clientes.filter((c) => c.ferramentaId === tool.id);

              return (
                <li key={tool.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleExpand(tool.slug)}
                    className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base" style={{ color: tool.cor }}>
                        {tool.icone}
                      </span>
                      <span>{tool.nome}</span>
                    </div>
                    {toolClients.length > 0 &&
                      (isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      ))}
                  </button>

                  {isExpanded && toolClients.length > 0 && (
                    <ul className="pl-6 pr-2 py-1 space-y-1 border-l border-border/30 ml-5">
                      {toolClients.map((client) => {
                        const isClientActive = activeClient?.slug === client.slug;
                        return (
                          <li key={client.id}>
                            <button
                              type="button"
                              onClick={() => handleClientClick(client.slug)}
                              className={`flex w-full items-center justify-between py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                                isClientActive
                                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                              }`}
                            >
                              <span>{client.nome}</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
            <li className="pt-2 mt-2 border-t border-border/20">
              <Link
                to="/app/admin"
                className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-indigo-400 hover:bg-indigo-600/10 transition-all border border-transparent hover:border-indigo-500/20"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Console Admin</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-4 border-t border-border/40 space-y-1">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da Sessão</span>
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
