import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  Segmento,
  Ferramenta,
  Cliente,
  Projeto,
  mockSegmentos,
  mockFerramentas,
  mockClientes,
  mockProjetos,
} from './mockData';

interface SegmentContextType {
  segmentos: Segmento[];
  ferramentas: Ferramenta[];
  clientes: Cliente[];
  projetos: Projeto[];

  activeSegment: Segmento | null;
  activeTool: Ferramenta | null;
  activeClient: Cliente | null;
  activeProject: Projeto | null;

  setActiveSegmentBySlug: (slug: string) => void;
  setActiveToolBySlug: (slug: string) => void;
  setActiveClientBySlug: (slug: string) => void;
  setActiveProjectById: (id: string) => void;

  addCliente: (cliente: Omit<Cliente, 'id'>) => Cliente;
  addProjeto: (projeto: Omit<Projeto, 'id'>) => Projeto;
}

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [projetos, setProjetos] = useState<Projeto[]>(mockProjetos);

  const [activeSegment, setActiveSegment] = useState<Segmento | null>(mockSegmentos[0]);
  const [activeTool, setActiveTool] = useState<Ferramenta | null>(null);
  const [activeClient, setActiveClient] = useState<Cliente | null>(null);
  const [activeProject, setActiveProject] = useState<Projeto | null>(null);

  // ── Stable callbacks — sem elas o useMemo(value) nunca estabiliza ──────────
  const setActiveSegmentBySlug = useCallback((slug: string) => {
    const found = mockSegmentos.find((s) => s.slug === slug);
    if (found) {
      setActiveSegment(found);
      setActiveTool(null);
      setActiveClient(null);
      setActiveProject(null);
    }
  }, []); // mockSegmentos é constante, sem deps dinâmicas

  const setActiveToolBySlug = useCallback(
    (slug: string) => {
      if (!activeSegment) return;
      const found = mockFerramentas.find(
        (f) => f.slug === slug && f.segmentoId === activeSegment.id
      );
      if (found) {
        setActiveTool(found);
        setActiveClient(null);
        setActiveProject(null);
      }
    },
    [activeSegment]
  );

  const setActiveClientBySlug = useCallback(
    (slug: string) => {
      if (!activeTool) return;
      const found = clientes.find((c) => c.slug === slug && c.ferramentaId === activeTool.id);
      if (found) {
        setActiveClient(found);
        setActiveProject(null);
      }
    },
    [activeTool, clientes]
  );

  const setActiveProjectById = useCallback(
    (id: string) => {
      if (!activeClient) return;
      const found = projetos.find((p) => p.id === id && p.clienteId === activeClient.id);
      if (found) setActiveProject(found);
    },
    [activeClient, projetos]
  );

  const addCliente = useCallback((newCli: Omit<Cliente, 'id'>): Cliente => {
    const created: Cliente = { ...newCli, id: `cli-${Date.now()}` };
    setClientes((prev) => [...prev, created]);
    return created;
  }, []);

  const addProjeto = useCallback((newProj: Omit<Projeto, 'id'>): Projeto => {
    const created: Projeto = { ...newProj, id: `proj-${Date.now()}` };
    setProjetos((prev) => [...prev, created]);
    return created;
  }, []);

  // ── Stable context value — só recria quando dados de verdade mudam ─────────
  const value = useMemo(
    () => ({
      segmentos: mockSegmentos,
      ferramentas: mockFerramentas,
      clientes,
      projetos,
      activeSegment,
      activeTool,
      activeClient,
      activeProject,
      setActiveSegmentBySlug,
      setActiveToolBySlug,
      setActiveClientBySlug,
      setActiveProjectById,
      addCliente,
      addProjeto,
    }),
    [
      clientes,
      projetos,
      activeSegment,
      activeTool,
      activeClient,
      activeProject,
      setActiveSegmentBySlug,
      setActiveToolBySlug,
      setActiveClientBySlug,
      setActiveProjectById,
      addCliente,
      addProjeto,
    ]
  );

  return <SegmentContext.Provider value={value}>{children}</SegmentContext.Provider>;
};

export const useSegment = () => {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegment must be used within a SegmentProvider');
  }
  return context;
};
