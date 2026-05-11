import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSegment } from '../../hooks/SegmentContext';
import logo from '../../assets/logo.png';
import { 
  Building2, 
  TrendingUp, 
  Settings, 
  LogOut, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    segmentos, 
    ferramentas, 
    clientes, 
    activeSegment, 
    activeTool, 
    activeClient,
    setActiveSegmentBySlug,
    setActiveToolBySlug,
    setActiveClientBySlug
  } = useSegment();

  const navigate = useNavigate();
  const [expandedTool, setExpandedTool] = useState<string | null>('senior');

  // Filter tools for active segment
  const currentTools = ferramentas.filter(f => f.segmentoId === activeSegment?.id);

  const toggleTool = (toolSlug: string) => {
    setActiveToolBySlug(toolSlug);
    setExpandedTool(expandedTool === toolSlug ? null : toolSlug);
  };

  return (
    <aside className="fixed bottom-0 top-0 left-0 z-30 flex h-full w-[280px] flex-col border-r border-border/40 bg-card/10 backdrop-blur-xl transition-all duration-300">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center border-b border-border/40 p-6">
        <Link to="/" className="group flex flex-col items-center gap-1">
          <img 
            src={logo} 
            alt="Solvix logo" 
            className="h-[170px] w-[170px] object-contain transition-transform duration-500 group-hover:scale-105" 
          />
        </Link>
      </div>



      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-3 block mb-2">
            Ferramentas & Clientes
          </span>
          
          <ul className="space-y-1.5">
            {currentTools.map((tool) => {
              const isSelected = activeTool?.slug === tool.slug;
              const isExpanded = expandedTool === tool.slug;
              const toolClients = clientes.filter(c => c.ferramentaId === tool.id);

              return (
                <li key={tool.id} className="space-y-1">
                  <button
                    onClick={() => toggleTool(tool.slug)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-secondary/60 text-foreground' 
                        : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base" style={{ color: tool.cor }}>{tool.icone}</span>
                      <span>{tool.nome}</span>
                    </div>
                    {toolClients.length > 0 && (
                      isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Collapsible Clients List */}
                  {isExpanded && toolClients.length > 0 && (
                    <ul className="pl-6 pr-2 py-1 space-y-1 border-l border-border/30 ml-5">
                      {toolClients.map((client) => {
                        const isClientActive = activeClient?.slug === client.slug;
                        return (
                          <li key={client.id}>
                            <button
                              onClick={() => {
                                setActiveClientBySlug(client.slug);
                                navigate({ 
                                  to: '/app/consultoria/senior/$cliente', 
                                  params: { cliente: client.slug } 
                                });
                              }}
                              className={`flex w-full items-center justify-between py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                                isClientActive 
                                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                              }`}
                            >
                              <span>{client.nome}</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-border/40 space-y-1">
        <a 
          href="/" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Site Principal</span>
        </a>
        <button 
          onClick={() => {
            localStorage.removeItem('google_authenticated');
            window.location.href = '/';
          }}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da Sessão</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
