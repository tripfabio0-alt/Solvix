import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useSegment } from '../hooks/SegmentContext';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  FolderGit, 
  Code2, 
  Clock, 
  Plus, 
  ArrowRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export const Route = createFileRoute('/app/dashboard')({
  component: Dashboard,
});

export function Dashboard() {
  const { segmentos, ferramentas, clientes, projetos, setActiveSegmentBySlug } = useSegment();
  const navigate = useNavigate();

  // Active counts
  const totalClients = clientes.length;
  const totalProjects = projetos.length;
  const totalTools = ferramentas.length;

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-[#05050a] to-card/40 p-8 shadow-xl">
        <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Plataforma Solvix v2</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Olá, Admin Solvix
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Gerencie seus segmentos, configure ferramentas automatizadas por IA e impulsione a produtividade de seus clientes.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Clients Card */}
        <div className="rounded-xl border border-border/40 bg-card/10 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clientes Ativos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{totalClients}</span>
            <span className="text-[11px] font-bold text-emerald-400">+2 esta semana</span>
          </div>
        </div>

        {/* Projects Card */}
        <div className="rounded-xl border border-border/40 bg-card/10 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projetos em Andamento</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderGit className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{totalProjects}</span>
            <span className="text-[11px] font-bold text-indigo-400">80% de conclusão</span>
          </div>
        </div>

        {/* Tools Card */}
        <div className="rounded-xl border border-border/40 bg-card/10 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Ferramentas IA</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Code2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{totalTools}</span>
            <span className="text-[11px] font-bold text-muted-foreground">LSP, SQL & Relatório</span>
          </div>
        </div>

      </div>

      {/* Segments Nav Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Escolha o Segmento de Negócios</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Consultoria Segment */}
          <button
            onClick={() => {
              setActiveSegmentBySlug('consultoria');
              navigate({ to: '/app/consultoria/senior/eraser' });
            }}
            className="group relative flex flex-col items-start rounded-xl border border-border/40 bg-card/10 p-8 text-left backdrop-blur-md hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] transition-all duration-300"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 text-3xl group-hover:scale-110 transition-transform duration-300">
              🏢
            </div>
            <h3 className="text-xl font-bold mb-2">Segmento Consultoria</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Acesse ferramentas ERP como o Senior ERP, SAP e TOTVS. Automatize regras de processo LSP, SQL e relatórios.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1.5 transition-transform">
              <span>Abrir Consultoria Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>

          {/* Trading Segment */}
          <button
            onClick={() => {
              setActiveSegmentBySlug('trading');
              navigate({ to: '/app/dashboard' }); // In mock, stays in overview or dashboard
            }}
            className="group relative flex flex-col items-start rounded-xl border border-border/40 bg-card/10 p-8 text-left backdrop-blur-md hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-300"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-3xl group-hover:scale-110 transition-transform duration-300">
              📈
            </div>
            <h3 className="text-xl font-bold mb-2">Segmento Trading</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Gerencie setups e bots na Nelogica Profit, estratégias de trade automatizadas e feeds de dados em tempo real.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1.5 transition-transform">
              <span>Abrir Trading Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>

        </div>
      </div>

    </div>
  );
}
export default Dashboard;
