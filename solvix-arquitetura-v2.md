# Solvix — Arquitetura Correta da Plataforma

## Conceito Central

**Solvix** é a empresa.   
A plataforma atende múltiplos **segmentos de mercado**, cada um com suas **ferramentas**, e dentro de cada ferramenta, os **clientes** que a utilizam.

---

## 1. Hierarquia de Negócio

```
Solvix
├── Consultoria                     ← segmento
│   ├── Senior ERP                  ← ferramenta/sistema
│   │   ├── Empresa Xx              ← cliente que usa Senior
│   │   ├── Empresa X               ← outro cliente
│   │   └── Empresa Y
│   ├── Exemplo 2SAP
│   │   ├── Cliente A
│   │   └── Cliente B
│   └── Exemplo 3 TOTVS
│       └── Cliente C
└── Trading                         ← segmento
    └── Nelogica                    ← ferramenta/sistema
        ├── Trader X                ← cliente
        └── Trader Y
```

---

## 2. Estrutura de URLs da Aplicação

```
Solvix.com/                                      → Landing Solvix
Solvix.com/app/                                  → Login / acesso à plataforma
Solvix.com/app/dashboard/                        → Visão geral (todos segmentos/clientes)

Solvix.com/app/consultoria/                      → Hub de Consultoria Opção de cadastro da conuktoria 
Solvix.com/app/consultoria/senior/               → Hub Senior ERP
Solvix.com/app/consultoria/senior/eraser/        → Workspace do cliente Eraser
Solvix.com/app/consultoria/senior/eraser/projetos/
Solvix.com/app/consultoria/senior/eraser/projetos/:id
Solvix.com/app/consultoria/senior/eraser/ferramentas/lsp
Solvix.com/app/consultoria/senior/eraser/ferramentas/sql
Solvix.com/app/consultoria/senior/eraser/ferramentas/relatorio

Solvix.com/app/consultoria/sap/                  → Hub SAP
Solvix.com/app/consultoria/sap/:cliente/         → Workspace do cliente SAP

Solvix.com/app/trading/                          → Hub Trading
Solvix.com/app/trading/nelogica/                 → Hub Nelogica
Solvix.com/app/trading/nelogica/:cliente/        → Workspace do cliente

Solvix.com/p/:token                              → Convite público de projeto
```

---

## 3. Estrutura de Diretórios — Frontend

```
Solvix/                                  ← raiz do repositório
├── index.html                          ← Landing Solvix
├── assets/
│
└── src/
    ├── main.jsx
    ├── App.jsx                         ← Roteamento raiz
    │
    ├── pages/
    │   │
    │   ├── Landing.jsx                 ← Solvix.com/
    │   ├── Login.jsx
    │   │
    │   ├── app/
    │   │   ├── Dashboard.jsx           ← visão geral de tudo
    │   │   │
    │   │   ├── consultoria/
    │   │   │   ├── ConsultoriaHub.jsx  ← lista ferramentas disponíveis
    │   │   │   │
    │   │   │   ├── senior/
    │   │   │   │   ├── SeniorHub.jsx   ← lista clientes Senior
    │   │   │   │   └── cliente/
    │   │   │   │       ├── ClienteWorkspace.jsx   ← workspace do cliente
    │   │   │   │       ├── tabs/
    │   │   │   │       │   ├── Projetos.jsx
    │   │   │   │       │   ├── Chamados.jsx
    │   │   │   │       │   ├── Agenda.jsx
    │   │   │   │       │   └── Financeiro.jsx
    │   │   │   │       └── ferramentas/
    │   │   │   │           ├── FerramentasHub.jsx ← escolhe LSP/SQL/Relatório
    │   │   │   │           ├── LspGenerator.jsx
    │   │   │   │           ├── SqlGenerator.jsx
    │   │   │   │           ├── ReportGenerator.jsx
    │   │   │   │           └── ScriptHistory.jsx
    │   │   │   │
    │   │   │   ├── sap/                ← futuro
    │   │   │   │   └── SapHub.jsx
    │   │   │   │
    │   │   │   └── totvs/             ← futuro
    │   │   │       └── TotvsHub.jsx
    │   │   │
    │   │   └── trading/
    │   │       ├── TradingHub.jsx
    │   │       └── nelogica/
    │   │           ├── NelogicaHub.jsx
    │   │           └── cliente/
    │   │               └── ClienteWorkspace.jsx
    │   │
    │   └── convite/
    │       └── ConviteProjeto.jsx      ← /p/:token (público)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx             ← navegação adaptada ao segmento ativo
    │   │   ├── Breadcrumb.jsx          ← Solvix / Consultoria / Senior / Eraser
    │   │   └── AppShell.jsx
    │   └── ui/
    │       ├── ScriptViewer.jsx
    │       ├── SaveScriptBtn.jsx
    │       └── ...
    │
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useSegmento.js
    │   ├── useCliente.js
    │   ├── useProjeto.js
    │   └── useScripts.js
    │
    └── lib/
        ├── supabase.js
        ├── anthropic.js
        └── google-calendar.js
```

---

## 4. Supabase — Modelo de Dados

### Hierarquia

```
auth.users
    └── segmentos           (consultoria, trading...)
          └── ferramentas   (senior, sap, nelogica...)
                └── clientes (eraser, empresa-x...)
                      └── projetos
                            ├── etapas
                            ├── telas_projeto
                            ├── chamados
                            ├── despesas
                            ├── briefings
                            └── scripts_tecnicos
```

### DDL

```sql
-- =============================================
-- SEGMENTOS (consultoria, trading, etc.)
-- =============================================
CREATE TABLE segmentos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES auth.users(id),
  nome         TEXT NOT NULL,           -- 'Consultoria', 'Trading'
  slug         TEXT NOT NULL,           -- 'consultoria', 'trading'
  icone        TEXT,
  ativo        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, slug)
);
ALTER TABLE segmentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_segmentos" ON segmentos USING (usuario_id = auth.uid());

-- =============================================
-- FERRAMENTAS (senior, sap, nelogica, etc.)
-- =============================================
CREATE TABLE ferramentas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segmento_id  UUID NOT NULL REFERENCES segmentos(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES auth.users(id),
  nome         TEXT NOT NULL,           -- 'Senior ERP', 'SAP', 'Nelogica'
  slug         TEXT NOT NULL,           -- 'senior', 'sap', 'nelogica'
  descricao    TEXT,
  icone        TEXT,
  cor          TEXT,                    -- cor de destaque no UI
  ativo        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(segmento_id, slug)
);
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_ferramentas" ON ferramentas USING (usuario_id = auth.uid());

-- =============================================
-- CLIENTES (Eraser, Empresa X, Trader Y...)
-- =============================================
CREATE TABLE clientes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta_id UUID NOT NULL REFERENCES ferramentas(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES auth.users(id),
  nome         TEXT NOT NULL,           -- 'Eraser'
  slug         TEXT NOT NULL,           -- 'eraser'
  empresa      TEXT,
  cnpj         TEXT,
  email        TEXT,
  telefone     TEXT,
  logo_url     TEXT,
  status       TEXT DEFAULT 'ativo',    -- ativo | inativo | prospect
  observacoes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ferramenta_id, slug)
);
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_clientes" ON clientes USING (usuario_id = auth.uid());

-- =============================================
-- PROJETOS
-- =============================================
CREATE TABLE projetos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES auth.users(id),
  nome         TEXT NOT NULL,
  descricao    TEXT,
  status       TEXT DEFAULT 'briefing', -- briefing | em_andamento | pausado | entregue | cancelado
  prioridade   TEXT DEFAULT 'normal',
  valor_hora   NUMERIC,
  prazo        DATE,
  link_convite TEXT UNIQUE,
  convite_ativo BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_projetos" ON projetos USING (usuario_id = auth.uid());

-- =============================================
-- ETAPAS
-- =============================================
CREATE TABLE etapas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  descricao    TEXT,
  status       TEXT DEFAULT 'pendente',
  ordem        INT,
  prazo        DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TELAS / PRINTS DO PROJETO
-- =============================================
CREATE TABLE telas_projeto (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  etapa_id     UUID REFERENCES etapas(id),
  nome         TEXT NOT NULL,
  descricao    TEXT,
  url_storage  TEXT NOT NULL,
  tipo         TEXT DEFAULT 'print',    -- print | mockup | diagrama
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAMADOS
-- =============================================
CREATE TABLE chamados (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES auth.users(id),
  titulo       TEXT NOT NULL,
  descricao    TEXT,
  tipo         TEXT DEFAULT 'desenvolvimento',
  status       TEXT DEFAULT 'aberto',
  horas_gastas NUMERIC DEFAULT 0,
  data_inicio  DATE,
  data_fim     DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DESPESAS
-- =============================================
CREATE TABLE despesas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao    TEXT NOT NULL,
  categoria    TEXT,
  valor        NUMERIC NOT NULL,
  data         DATE NOT NULL,
  comprovante_url TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BRIEFINGS
-- =============================================
CREATE TABLE briefings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  conteudo_form JSONB,
  conteudo_gerado TEXT,
  status       TEXT DEFAULT 'rascunho',
  versao       INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SCRIPTS TÉCNICOS (LSP, SQL, Relatório, etc.)
-- =============================================
CREATE TABLE scripts_tecnicos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID REFERENCES projetos(id) ON DELETE CASCADE,
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  ferramenta_id UUID REFERENCES ferramentas(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES auth.users(id),
  tipo         TEXT NOT NULL,           -- 'lsp' | 'sql' | 'relatorio' | 'importador'
  titulo       TEXT,
  modulo       TEXT,
  identificador TEXT,
  descricao    TEXT,
  conteudo     TEXT NOT NULL,
  metadata     JSONB,                   -- variaveis, funcoes, dicas, etc
  tags         TEXT[],
  favorito     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE scripts_tecnicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_scripts" ON scripts_tecnicos USING (usuario_id = auth.uid());

-- =============================================
-- CONVITES (página pública do projeto)
-- =============================================
CREATE TABLE convites_projeto (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  token        TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expira_em    TIMESTAMPTZ,
  mostrar_telas BOOLEAN DEFAULT TRUE,
  mostrar_scripts BOOLEAN DEFAULT FALSE,
  ativo        BOOLEAN DEFAULT TRUE,
  visualizacoes INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE POLICY "public_read_convite" ON convites_projeto
  FOR SELECT USING (ativo = TRUE);
```

---

## 5. Dados Iniciais (seed)

Ao Solvix conta, popular os segmentos e ferramentas padrão:

```sql
-- Função chamada após signup
CREATE OR REPLACE FUNCTION setup_usuario_inicial()
RETURNS TRIGGER AS $$
DECLARE
  seg_consultoria UUID;
  seg_trading UUID;
BEGIN
  -- Segmentos padrão
  INSERT INTO segmentos (usuario_id, nome, slug, icone)
  VALUES
    (NEW.id, 'Consultoria', 'consultoria', '🏢'),
    (NEW.id, 'Trading',     'trading',     '📈')
  RETURNING id INTO seg_consultoria;

  SELECT id INTO seg_consultoria FROM segmentos
    WHERE usuario_id = NEW.id AND slug = 'consultoria';
  SELECT id INTO seg_trading FROM segmentos
    WHERE usuario_id = NEW.id AND slug = 'trading';

  -- Ferramentas padrão em Consultoria
  INSERT INTO ferramentas (segmento_id, usuario_id, nome, slug, cor)
  VALUES
    (seg_consultoria, NEW.id, 'Senior ERP', 'senior',  '#f59e0b'),
    (seg_consultoria, NEW.id, 'SAP',        'sap',     '#0072c6'),
    (seg_consultoria, NEW.id, 'TOTVS',      'totvs',   '#e11d48');

  -- Ferramentas padrão em Trading
  INSERT INTO ferramentas (segmento_id, usuario_id, nome, slug, cor)
  VALUES
    (seg_trading, NEW.id, 'Nelogica', 'nelogica', '#22c55e');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION setup_usuario_inicial();
```

---

## 6. Fluxo de Navegação do Usuário

```
Login
  └── Dashboard
        ├── [card] Consultoria  →  ConsultoriaHub
        │     ├── [card] Senior ERP  →  SeniorHub
        │     │     ├── [card] Eraser  →  ClienteWorkspace
        │     │     │     ├── Projetos
        │     │     │     │     └── ProjetoDetalhe
        │     │     │     │           ├── Etapas
        │     │     │     │           ├── Chamados
        │     │     │     │           ├── Telas
        │     │     │     │           ├── Briefing
        │     │     │     │           ├── Financeiro
        │     │     │     │           └── Ferramentas
        │     │     │     │                 ├── LSP Generator
        │     │     │     │                 ├── SQL Generator
        │     │     │     │                 └── Relatório
        │     │     │     ├── Chamados (todos do cliente)
        │     │     │     └── Financeiro (resumo do cliente)
        │     │     └── [card] Empresa X  →  ClienteWorkspace
        │     └── [card] SAP  →  SapHub
        │           └── [card] Cliente A  →  ClienteWorkspace
        └── [card] Trading  →  TradingHub
              └── [card] Nelogica  →  NelogicaHub
                    └── [card] Trader X  →  ClienteWorkspace
```

---

## 7. Breadcrumb em todas as telas

```
Solvix / Consultoria / Senior ERP / Eraser / Projeto Alpha / Ferramentas / SQL
```

---

## 8. Próximos passos práticos

1. Solvix projeto no Supabase e rodar o DDL acima
2. Configurar Auth (email/senha + Google OAuth)
3. Solvix AppShell com Sidebar dinâmica (adapta ao segmento)
4. Implementar as telas na ordem:
   - Dashboard → ConsultoriaHub → SeniorHub → ClienteWorkspace
   - Depois: projetos, chamados, telas, financeiro
   - Por último: ferramentas (encaixar os 3 geradores já criados)

---

*Solvix · Arquitetura v2 · Maio 2026*
