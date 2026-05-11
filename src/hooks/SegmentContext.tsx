import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const setRouteState = (segmentSlug: string, toolSlug: string, clientSlug?: string) => {
    const seg = mockSegmentos.find(s => s.slug === segmentSlug) || null;
    const tool = mockFerramentas.find(f => f.slug === toolSlug) || null;
    const client = clientSlug ? (clientes.find(c => c.slug === clientSlug) || null) : null;

    let updated = false;

    if (activeSegment?.id !== seg?.id) {
      setActiveSegment(seg);
      updated = true;
    }
    if (activeTool?.id !== tool?.id) {
      setActiveTool(tool);
      updated = true;
    }
    if (activeClient?.id !== client?.id) {
      setActiveClient(client);
      updated = true;
    }

    if (updated) {
      setActiveProject(null);
    }
  };

  const setActiveSegmentBySlug = (slug: string) => {
    const found = mockSegmentos.find(s => s.slug === slug);
    if (found) {
      setActiveSegment(found);
      setActiveTool(null);
      setActiveClient(null);
      setActiveProject(null);
    }
  };

  const setActiveToolBySlug = (slug: string) => {
    const found = mockFerramentas.find(f => f.slug === slug);
    if (found) {
      setActiveTool(found);
      setActiveClient(null);
      setActiveProject(null);
    }
  };

  const setActiveClientBySlug = (slug: string) => {
    const found = clientes.find(c => c.slug === slug);
    if (found) {
      setActiveClient(found);
      setActiveProject(null);
    }
  };

  const setActiveProjectById = (id: string) => {
    if (!activeClient) return;
    const found = projetos.find(p => p.id === id && p.clienteId === activeClient.id);
    if (found) {
      setActiveProject(found);
    }
  };

  const addCliente = (newCli: Omit<Cliente, 'id'>) => {
    const created: Cliente = {
      ...newCli,
      id: `cli-${Date.now()}`
    };
    setClientes(prev => [...prev, created]);
    return created;
  };

  const addProjeto = (newProj: Omit<Projeto, 'id'>) => {
    const created: Projeto = {
      ...newProj,
      id: `proj-${Date.now()}`
    };
    setProjetos(prev => [...prev, created]);
    return created;
  };

  return (
    <SegmentContext.Provider value={{
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
    }}>
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
