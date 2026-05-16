import React, { useState, useMemo } from 'react';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useSegment } from '../hooks/SegmentContext';
import { 
  FolderGit, 
  MessageSquare, 
  Terminal, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock, 
  Calendar,
  ChevronRight
} from 'lucide-react';

export const Route = createFileRoute('/app/consultoria/senior/$cliente/')({
  component: ClienteWorkspaceRoute,
});

function ClienteWorkspaceRoute() {
  const { cliente } = useParams({ from: '/app/consultoria/senior/$cliente/' });
  const { clientes, projetos } = useSegment();

  const [activeTab, setActiveTab] = useState<'projetos' | 'chamados' | 'ferramentas'>('ferramentas');

  // Resolve activeClient directly from URL param — avoids context sync issues
  const activeClient = useMemo(
    () => clientes.find(c => c.slug === cliente) ?? null,
    [clientes, cliente]
  );

  if (!activeClient) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-xs text-muted-foreground">Carregando workspace do cliente...</p>
        </div>
      </div>
    );
  }

  // Filter client-specific projects
  const clientProjects = projetos.filter(p => p.clienteId === activeClient.id);

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Client Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-3xl font-bold text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{activeClient.nome}</h1>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                Ativo
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              CNPJ: {activeClient.cnpj || 'Sob demanda'} | {activeClient.email || 'contato@cliente.com'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-secondary/30 border border-border/40 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/50 transition-all">
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-border/40 gap-1 p-1 bg-secondary/10 rounded-lg max-w-md">
        {(['projetos', 'chamados', 'ferramentas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold capitalize rounded-md transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {tab === 'projetos' && <FolderGit className="h-3.5 w-3.5" />}
              {tab === 'chamados' && <MessageSquare className="h-3.5 w-3.5" />}
              {tab === 'ferramentas' && <Terminal className="h-3.5 w-3.5" />}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in duration-300">
        
        {/* PROJECTS TAB */}
        {activeTab === 'projetos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Projetos do Cliente</h3>
              <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all">
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Projeto</span>
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {clientProjects.length > 0 ? (
                clientProjects.map((p) => (
                  <div key={p.id} className="relative rounded-xl border border-border/40 bg-card/50 p-6 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-foreground">{p.nome}</h4>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'em_andamento' 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6 line-clamp-2">{p.descricao}</p>
                    
                    <div className="flex items-center justify-between border-t border-border/30 pt-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        R$ {p.valorHora}/hora
                      </span>
                      {p.prazo && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          Prazo: {p.prazo}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 border border-dashed border-border/40 rounded-xl">
                  <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TICKETS/CHAMADOS TAB */}
        {activeTab === 'chamados' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Chamados e Erros</h3>
              <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all">
                <Plus className="h-3.5 w-3.5" />
                <span>Abrir Chamado</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border/40 bg-card/50 p-6">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4 text-xs font-semibold text-muted-foreground">
                  <span className="w-1/2">Título / Descrição</span>
                  <span className="w-1/6 text-center">Tipo</span>
                  <span className="w-1/6 text-center">Status</span>
                  <span className="w-1/6 text-right">Horas Gastas</span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="w-1/2 space-y-1">
                      <p className="font-bold text-foreground">Regra LSP de PCP travando</p>
                      <p className="text-muted-foreground line-clamp-1">Ao fechar lote PCP, acusa saldo insuficiente mesmo havendo estoque físico.</p>
                    </div>
                    <span className="w-1/6 text-center">
                      <span className="inline-flex rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400 font-bold">Bug</span>
                    </span>
                    <span className="w-1/6 text-center">
                      <span className="inline-flex rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400 font-bold">Em Andamento</span>
                    </span>
                    <span className="w-1/6 text-right text-indigo-400 font-bold">3.5 horas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOOLS/FERRAMENTAS TAB */}
        {activeTab === 'ferramentas' && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-base font-bold text-foreground">Suíte de Inteligência Artificial</h3>
              <p className="text-xs text-muted-foreground">Selecione uma das ferramentas para gerar soluções automáticas integradas para o ERP do cliente.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              
              {/* LSP Generator Tile */}
              <Link
                to="/app/consultoria/senior/$cliente/ferramentas/lsp"
                params={{ cliente: cliente || 'eraser' }}
                className="group flex flex-col items-start rounded-xl border border-border/40 bg-card/50 p-6 text-left hover:border-indigo-500/40 hover:bg-indigo-500/[0.01] transition-all cursor-pointer"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-xl text-amber-500 group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <h4 className="font-bold mb-1.5 text-foreground group-hover:text-indigo-400 transition-colors">Gerador de Regra LSP</h4>
                <p className="text-xs text-muted-foreground mb-6 line-clamp-3">
                  Gerador inteligente de regras e processos na linguagem padrão Senior (LSP) com preenchimento automático de cabeçalhos.
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                  <span>Executar Gerador</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* SQL Builder Tile */}
              <Link
                to="/app/consultoria/senior/$cliente/ferramentas/sql"
                params={{ cliente: cliente || 'eraser' }}
                className="group flex flex-col items-start rounded-xl border border-border/40 bg-card/50 p-6 text-left hover:border-indigo-500/40 hover:bg-indigo-500/[0.01] transition-all cursor-pointer"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-xl text-blue-500 group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <h4 className="font-bold mb-1.5 text-foreground group-hover:text-indigo-400 transition-colors">SQL Builder Sapiens</h4>
                <p className="text-xs text-muted-foreground mb-6 line-clamp-3">
                  Construa e refine consultas SQL complexas otimizadas para o banco de dados Oracle/SQL Server da Senior.
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                  <span>Executar Gerador</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Report Creator Tile */}
              <button
                onClick={() => alert('Report Creator em desenvolvimento')}
                className="group flex flex-col items-start rounded-xl border border-border/40 bg-card/50 p-6 text-left hover:border-indigo-500/40 hover:bg-indigo-500/[0.01] transition-all cursor-pointer"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-xl text-rose-500 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h4 className="font-bold mb-1.5 text-foreground group-hover:text-indigo-400 transition-colors">Criador de Relatórios</h4>
                <p className="text-xs text-muted-foreground mb-6 line-clamp-3">
                  Monte estruturas de relatórios customizados, com variáveis integradas para o Gerador de Relatórios Senior.
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                  <span>Executar Gerador</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
export default ClienteWorkspaceRoute;
