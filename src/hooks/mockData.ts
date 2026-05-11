export interface Segmento {
  id: string;
  nome: string;
  slug: string;
  icone: string;
}

export interface Ferramenta {
  id: string;
  segmentoId: string;
  nome: string;
  slug: string;
  descricao: string;
  icone: string;
  cor: string;
}

export interface Cliente {
  id: string;
  ferramentaId: string;
  nome: string;
  slug: string;
  empresa: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  logoUrl?: string;
  status: 'ativo' | 'inativo' | 'prospect';
  observacoes?: string;
}

export interface Projeto {
  id: string;
  clienteId: string;
  nome: string;
  descricao: string;
  status: 'briefing' | 'em_andamento' | 'pausado' | 'entregue' | 'cancelado';
  prioridade: 'baixa' | 'normal' | 'alta';
  valorHora: number;
  prazo?: string;
}

export interface Chamado {
  id: string;
  projetoId: string;
  titulo: string;
  descricao: string;
  tipo: 'desenvolvimento' | 'suporte' | 'bug' | 'melhoria';
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  horasGastas: number;
  created_at: string;
}

export interface ScriptTecnico {
  id: string;
  projetoId?: string;
  clienteId?: string;
  ferramentaId?: string;
  tipo: 'lsp' | 'sql' | 'relatorio';
  titulo: string;
  modulo?: string;
  identificador?: string;
  descricao: string;
  conteudo: string;
  metadata?: any;
  favorito: boolean;
  created_at: string;
}

// Data Sets
export const mockSegmentos: Segmento[] = [
  { id: 'seg-1', nome: 'Consultoria', slug: 'consultoria', icone: '🏢' }
];

export const mockFerramentas: Ferramenta[] = [
  { id: 'fer-1', segmentoId: 'seg-1', nome: 'Senior ERP', slug: 'senior', descricao: 'Customizações LSP e integrações Senior Sapiens', icone: '🤖', cor: '#f59e0b' }
];

export const mockClientes: Cliente[] = [
  { id: 'cli-1', ferramentaId: 'fer-1', nome: 'Eraser Ltda', slug: 'eraser', empresa: 'Eraser S/A', cnpj: '12.345.678/0001-90', email: 'suporte@eraser.com', telefone: '(11) 98888-7777', status: 'ativo', observacoes: 'Cliente principal de customização de PCP e Manufatura' },
  { id: 'cli-2', ferramentaId: 'fer-1', nome: 'Empresa Alfa', slug: 'empresa-alfa', empresa: 'Alfa Industrial', cnpj: '98.765.432/0001-10', email: 'erp@alfa.ind.br', telefone: '(47) 3444-2222', status: 'ativo', observacoes: 'Usa módulo de mercado e finanças da Senior' }
];

export const mockProjetos: Projeto[] = [
  { id: 'proj-1', clienteId: 'cli-1', nome: 'Projeto Alpha PCP', descricao: 'Automatizar o apontamento de OPs e baixar componentes via LSP no Senior Sapiens', status: 'em_andamento', prioridade: 'alta', valorHora: 180, prazo: '2026-06-30' },
  { id: 'proj-2', clienteId: 'cli-1', nome: 'Upgrade ERP 12.1.2', descricao: 'Homologação e migração das regras personalizadas para a versão nova', status: 'briefing', prioridade: 'normal', valorHora: 150, prazo: '2026-08-15' },
  { id: 'proj-3', clienteId: 'cli-2', nome: 'Integração de Notas', descricao: 'Desenvolvimento de regras e rotinas para emissão de notas via API externa', status: 'em_andamento', prioridade: 'normal', valorHora: 160 }
];

export const mockChamados: Chamado[] = [
  { id: 'cham-1', projetoId: 'proj-1', titulo: 'Erro no fechamento do lote PCP', descricao: 'Ao tentar fechar o lote, a regra LSP trava acusando saldo insuficiente mesmo havendo estoque físico.', tipo: 'bug', status: 'em_andamento', horasGastas: 3.5, created_at: '2026-05-10T14:30:00Z' },
  { id: 'cham-2', projetoId: 'proj-1', titulo: 'Criar botão de recalcular estoque', descricao: 'Inserir novo botão na tela customizada de ordens de produção.', tipo: 'desenvolvimento', status: 'resolvido', horasGastas: 8, created_at: '2026-05-08T09:00:00Z' }
];

export const mockScriptsTecnicos: ScriptTecnico[] = [
  {
    id: 'scr-1',
    projetoId: 'proj-1',
    clienteId: 'cli-1',
    ferramentaId: 'fer-1',
    tipo: 'lsp',
    titulo: 'Apontamento automático de OP',
    modulo: 'PCP',
    identificador: 'PCP-000213009',
    descricao: 'Regra de processo para validar estoque antes de efetuar o apontamento da OP.',
    conteudo: `@ Regra de Processo LSP @
Definir Numero nSaldo;
Definir Numero nNecessidade;
Definir Alfa aComponente;

BuscaReg("E210EST", "CodPro", aComponente, nSaldo);
Se (nSaldo < nNecessidade)
  GeraLog("Estoque insuficiente para o componente: " + aComponente);
  Se(aRetorno<>"OK")
    GeraLog("Transação cancelada");
  FimSe;
FimSe;`,
    favorito: true,
    created_at: '2026-05-10T18:00:00Z'
  }
];
