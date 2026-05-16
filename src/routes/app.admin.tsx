import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { 
  Users, 
  BarChart3, 
  Database, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Search,
  ShieldCheck,
  MoreVertical,
  Activity,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export const Route = createFileRoute('/app/admin')({
  beforeLoad: ({ context }: any) => {
    // Simulação de verificação de role. No mundo real, viria do profile no Supabase.
    const isAdmin = localStorage.getItem('user_role') === 'admin' || true; // Force true for demo
    if (!isAdmin) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
  component: AdminDashboard,
});

// Mock Data para o Admin
const ADMIN_STATS = {
  totalTokens: 1254000,
  totalRequests: 8432,
  activeClients: 12,
  costEstimated: 125.40,
  growth: "+14.2%"
};

const CLIENT_CONSUMPTION = [
  { id: '1', nome: 'Eraser Ltda', sistema: 'Senior ERP', requests: 1240, tokens: 450000, status: 'Ativo' },
  { id: '2', nome: 'Empresa Alpha', sistema: 'Senior ERP', requests: 890, tokens: 210000, status: 'Ativo' },
  { id: '3', nome: 'Trader X', sistema: 'Nelogica', requests: 450, tokens: 120000, status: 'Ativo' },
  { id: '4', nome: 'Cliente B', sistema: 'SAP', requests: 120, tokens: 45000, status: 'Atenção' },
];

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-700">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-2xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Console do Administrador</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestão centralizada de tenants, consumo de IA e segurança.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-secondary/30 border border-border/40 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/50 transition-all">
            <Filter className="h-3.5 w-3.5" />
            Filtrar Período
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all">
            Relatório de Faturamento
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Uso Total API', value: '8.4k', sub: 'Requisições', icon: Activity, color: 'text-indigo-400' },
          { label: 'Consumo Tokens', value: '1.2M', sub: 'Estimados', icon: Cpu, color: 'text-emerald-400' },
          { label: 'Fatura Estimada', value: 'U$ 125', sub: 'Custo Google Cloud', icon: BarChart3, color: 'text-amber-400' },
          { label: 'Novos Usuários', value: '+42', sub: 'Últimos 30 dias', icon: TrendingUp, color: 'text-rose-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border border-border/40 bg-card/20 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="h-12 w-12" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
              <span className="text-[10px] text-muted-foreground font-medium">{stat.sub}</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded">
              <ArrowUpRight className="h-3 w-3" />
              {ADMIN_STATS.growth}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Tree Navigator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Hierarquia Solvix
            </h3>
          </div>
          
          <div className="glass-card border border-border/40 bg-card/10 rounded-2xl p-4 space-y-4">
            {/* Consultoria Segment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/5 text-xs font-bold text-indigo-400 border border-indigo-500/10">
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Consultoria</span>
              </div>
              <div className="pl-6 space-y-2">
                <div className="flex items-center gap-2 p-1.5 text-[11px] font-semibold text-foreground/80">
                  <ChevronDown className="h-3 w-3" />
                  <Database className="h-3.5 w-3.5 text-amber-400" />
                  <span>Senior ERP</span>
                </div>
                <div className="pl-6 space-y-1.5">
                  <div className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-indigo-500" />
                    Eraser Ltda
                  </div>
                  <div className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-indigo-500" />
                    Empresa Alpha
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Segment */}
            <div className="space-y-2 opacity-60">
              <div className="flex items-center gap-2 p-2 rounded-lg text-xs font-bold text-muted-foreground border border-transparent">
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Trading</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consumption Ranking Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Ranking de Consumo (Tenants)
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3 w-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="bg-secondary/20 border border-border/40 rounded-lg pl-8 pr-3 py-1.5 text-[10px] outline-none focus:border-indigo-500/50 w-48 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card border border-border/40 bg-card/10 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-secondary/30 border-b border-border/40 text-muted-foreground font-bold">
                  <th className="px-6 py-4 uppercase tracking-widest">Cliente / Tenant</th>
                  <th className="px-6 py-4 uppercase tracking-widest">Sistema</th>
                  <th className="px-4 py-4 text-center uppercase tracking-widest">Reqs</th>
                  <th className="px-6 py-4 text-center uppercase tracking-widest">Uso de Tokens</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {CLIENT_CONSUMPTION.map((client) => (
                  <tr key={client.id} className="hover:bg-indigo-500/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{client.nome}</div>
                      <div className="text-[10px] text-muted-foreground">ID: tenant-{client.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-secondary/50 border border-border/40 font-medium">
                        {client.sistema}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-indigo-400">
                      {client.requests}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${(client.tokens / 500000) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-muted-foreground">{Math.round(client.tokens / 1000)}k</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        client.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-400" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Gerenciamento de Usuários</p>
                <p className="text-muted-foreground">Existem 24 usuários cadastrados em sua rede.</p>
              </div>
            </div>
            <button className="text-[10px] font-bold text-indigo-400 hover:underline">Ver todos os usuários</button>
          </div>
        </div>

      </div>

    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
