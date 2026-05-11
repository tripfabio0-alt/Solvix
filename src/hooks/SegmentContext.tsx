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
}

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [projetos, setProjetos] = useState<Projeto[]>(mockProjetos);
  
  const [activeSegment, setActiveSegment] = useState<Segmento | null>(mockSegmentos[0]);
  const [activeTool, setActiveTool] = useState<Ferramenta | null>(null);
  const [activeClient, setActiveClient] = useState<Cliente | null>(null);
  const [activeProject, setActiveProject] = useState<Projeto | null>(null);

  const setActiveSegmentBySlug = (slug: string) => {
    const found = mockSegmentos.find(s => s.slug === slug);
    if (found) {
      setActiveSegment(found);
      // Reset dependent selections
      setActiveTool(null);
      setActiveClient(null);
      setActiveProject(null);
    }
  };

  const setActiveToolBySlug = (slug: string) => {
    if (!activeSegment) return;
    const found = mockFerramentas.find(f => f.slug === slug && f.segmentoId === activeSegment.id);
    if (found) {
      setActiveTool(found);
      setActiveClient(null);
      setActiveProject(null);
    }
  };

  const setActiveClientBySlug = (slug: string) => {
    if (!activeTool) return;
    const found = clientes.find(c => c.slug === slug && c.ferramentaId === activeTool.id);
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
      addProjeto
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
