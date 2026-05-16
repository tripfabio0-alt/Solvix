import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-border mx-2" />
        <h1 className="text-sm font-medium text-muted-foreground">Consultoria Sênior</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-secondary/50 border border-border rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border-2 border-background" />
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold">Administrador</p>
              <p className="text-[10px] text-muted-foreground">Plano Enterprise</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 p-[2px]">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
