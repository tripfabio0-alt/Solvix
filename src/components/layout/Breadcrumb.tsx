import React from 'react';
import { Link } from '@tanstack/react-router';
import { useSegment } from '../../hooks/SegmentContext';
import { ChevronRight, Home, Server, Users, FolderKanban } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const { activeSegment, activeTool, activeClient, activeProject } = useSegment();

  return (
    <nav className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/20 px-4 py-2.5 text-xs font-medium backdrop-blur-md">
      <Link
        to="/app/dashboard"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Solvix</span>
      </Link>

      {activeSegment && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <Link
            to="/app/dashboard"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{activeSegment.nome}</span>
          </Link>
        </>
      )}

      {activeTool && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="flex items-center gap-1 text-muted-foreground">
            <Server className="h-3 w-3" style={{ color: activeTool.cor }} />
            <span>{activeTool.nome}</span>
          </span>
        </>
      )}

      {activeClient && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3 text-indigo-400" />
            <span>{activeClient.nome}</span>
          </span>
        </>
      )}

      {activeProject && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 text-indigo-400/80" />
          <span className="flex items-center gap-1 text-foreground font-semibold">
            <FolderKanban className="h-3 w-3 text-indigo-400 animate-pulse" />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {activeProject.nome}
            </span>
          </span>
        </>
      )}
    </nav>
  );
};
export default Breadcrumb;
