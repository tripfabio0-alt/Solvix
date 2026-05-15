import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { 
  Segmento, 
  Ferramenta, 
  Cliente, 
  Projeto, 
  mockSegmentos, 
  mockFerramentas, 
  mockClientes, 
  mockProjetos 
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
  setRouteState: (segmentSlug: string, toolSlug: string, clientSlug?: string) => void;
}

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [projetos, setProjetos] = useState<Projeto[]>(mockProjetos);
  
  const [activeSegment, setActiveSegment] = useState<Segmento | null>(mockSegmentos[0]);
  const [activeTool, setActiveTool] = useState<Ferramenta | null>(null);
  const [activeClient, setActiveClient] = useState<Cliente | null>(null);
  const [activeProject, setActiveProject] = useState<Projeto | null>(null);

  // Use refs to keep latest state accessible inside stable callbacks
  const clientesRef = useRef(clientes);
  clientesRef.current = clientes;
  const projetosRef = useRef(projetos);
  projetosRef.current = projetos;
  const activeClientRef = useRef(activeClient);
  activeClientRef.current = activeClient;

  // All callbacks use refs so their references NEVER change between renders
  const setRouteState = useCallback((segmentSlug: string, toolSlug: string, clientSlug?: string) => {
    const seg = mockSegmentos.find(s => s.slug === segmentSlug) || null;
    const tool = mockFerramentas.find(f => f.slug === toolSlug) || null;
    const client = clientSlug ? (clientesRef.current.find(c => c.slug === clientSlug) || null) : null;

    setActiveSegment(prev => prev?.id === seg?.id ? prev : seg);
    setActiveTool(prev => prev?.id === tool?.id ? prev : tool);
    setActiveClient(prev => prev?.id === client?.id ? prev : client);
    setActiveProject(prev => prev === null ? prev : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveSegmentBySlug = useCallback((slug: string) => {
    const found = mockSegmentos.find(s => s.slug === slug) || null;
    setActiveSegment(prev => prev?.id === found?.id ? prev : found);
    setActiveTool(null);
    setActiveClient(null);
    setActiveProject(null);
  }, []);

  const setActiveToolBySlug = useCallback((slug: string) => {
    const found = mockFerramentas.find(f => f.slug === slug) || null;
    setActiveTool(prev => prev?.id === found?.id ? prev : found);
    setActiveClient(null);
    setActiveProject(null);
  }, []);

  const setActiveClientBySlug = useCallback((slug: string) => {
    const found = clientesRef.current.find(c => c.slug === slug) || null;
    setActiveClient(prev => prev?.id === found?.id ? prev : found);
    setActiveProject(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveProjectById = useCallback((id: string) => {
    const activeCli = activeClientRef.current;
    if (!activeCli) return;
    const found = projetosRef.current.find(p => p.id === id && p.clienteId === activeCli.id) || null;
    setActiveProject(prev => prev?.id === found?.id ? prev : found);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCliente = useCallback((newCli: Omit<Cliente, 'id'>) => {
    const created: Cliente = {
      ...newCli,
      id: `cli-${Date.now()}`
    };
    setClientes(prev => [...prev, created]);
    return created;
  }, []);

  const addProjeto = useCallback((newProj: Omit<Projeto, 'id'>) => {
    const created: Projeto = {
      ...newProj,
      id: `proj-${Date.now()}`
    };
    setProjetos(prev => [...prev, created]);
    return created;
  }, []);

  const contextValue = React.useMemo(() => ({
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
    setRouteState
  }), [
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
    setRouteState
  ]);

  return (
    <SegmentContext.Provider value={contextValue}>
      {children}
    </SegmentContext.Provider>
  );
};

export const useSegment = () => {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegment must be used within a SegmentProvider');
  }
  return context;
};
