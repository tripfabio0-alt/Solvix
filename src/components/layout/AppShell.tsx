import React, { memo } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { Bell, Search } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

// Header estático — sem estado, nunca re-renderiza sozinho
const AppHeader = memo(() => (
  <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-border/40 bg-[#05050a]/80 px-8 backdrop-blur-md">
    <Breadcrumb />
    <div className="flex items-center gap-4">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Pesquisar..."
          className="h-9 w-64 rounded-full border border-border/40 bg-secondary/20 pl-9 pr-4 text-xs outline-none focus:border-indigo-500/50 focus:bg-secondary/40 transition-all"
        />
      </div>
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-secondary/20 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
      </button>
      <div className="flex items-center gap-2.5 border-l border-border/30 pl-4">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold">Admin Solvix</span>
          <span className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase">
            Consultor Master
          </span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-bold text-xs">
          AS
        </div>
      </div>
    </div>
  </header>
));
AppHeader.displayName = 'AppHeader';

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#05050a] text-foreground font-sans">
      <Sidebar />
      <div className="pl-[280px] min-h-screen flex flex-col">
        <AppHeader />
        {/* main não é memo'd — children muda com a rota, isso é esperado */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AppShell;
