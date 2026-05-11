import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const setRouteState = useCallback((segmentSlug: string, toolSlug: string, clientSlug?: string) => {
    const seg = mockSegmentos.find(s => s.slug === segmentSlug) || null;
    const tool = mockFerramentas.find(f => f.slug === toolSlug) || null;

    let updated = false;

    setActiveSegment(prev => {
      if (prev?.id !== seg?.id) {
        updated = true;
        return seg;
      }
      return prev;
    });

    setActiveTool(prev => {
      if (prev?.id !== tool?.id) {
        updated = true;
        return tool;
      }
      return prev;
    });

    if (clientSlug) {
      setClientes(prevClientes => {
        const client = prevClientes.find(c => c.slug === clientSlug) || null;
        setActiveClient(prev => {
          if (prev?.id !== client?.id) {
            updated = true;
            return client;
          }
          return prev;
        });
        return prevClientes;
      });
    } else {
      setActiveClient(prev => {
        if (prev !== null) {
          updated = true;
          return null;
        }
        return prev;
      });
    }

    if (updated) {
      setActiveProject(null);
    }
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
    setClientes(prevClientes => {
      const found = prevClientes.find(c => c.slug === slug) || null;
      setActiveClient(prev => prev?.id === found?.id ? prev : found);
      return prevClientes;
    });
    setActiveProject(null);
  }, []);

  const setActiveProjectById = useCallback((id: string) => {
    setProjetos(prevProjetos => {
      setActiveClient(activeCli => {
        if (!activeCli) return activeCli;
        const found = prevProjetos.find(p => p.id === id && p.clienteId === activeCli.id) || null;
        setActiveProject(prev => prev?.id === found?.id ? prev : found);
        return activeCli;
      });
      return prevProjetos;
    });
  }, []);

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
