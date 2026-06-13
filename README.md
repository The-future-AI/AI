# Notícias Brasil — Análise de Viés Político

Agregador de notícias brasileiras que mostra **como cada assunto é coberto pelo
espectro político** — inspirado no [Ground.news](https://ground.news), porém
construído para o ecossistema de mídia do Brasil e com recursos adicionais.

Para cada acontecimento, o sistema reúne o que diferentes veículos publicaram,
calcula a distribuição da cobertura em cinco faixas (esquerda → direita),
identifica **pontos cegos** (assuntos cobertos só por um lado) e exibe a
**credibilidade factual** e a **propriedade** de cada veículo.

## Por que é melhor que o Ground.news (para o Brasil)

- **Espectro de 5 faixas** (esquerda, centro-esquerda, centro, centro-direita,
  direita) em vez de 3 — granularidade maior para o cenário brasileiro.
- **Credibilidade factual separada do viés** — duas dimensões independentes,
  exibidas em cada veículo e em cada fonte de uma matéria.
- **Transparência de propriedade** — grupo controlador e ano de fundação de
  cada veículo, direto na página de metodologia.
- **17 veículos** cobrindo todo o espectro, com esforço deliberado de equilíbrio
  entre esquerda e direita.
- **100% em português**, com classificações adaptadas ao contexto nacional.
- **Comparação de manchetes** — "como cada lado titulou" o mesmo fato.

## Arquitetura

| Camada     | Tecnologia                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 19, Vite, Wouter, Tailwind v4, shadcn/ui          |
| API        | tRPC sobre Express                                       |
| Banco      | MySQL/TiDB via Drizzle ORM                               |
| Coleta     | Feeds RSS/Atom dos veículos (`server/scraper.ts`)        |
| Análise    | Agrupamento de tópicos por LLM + lógica de viés pura     |

### Pipeline de dados (`server/pipeline.ts`)

1. **Coleta** — lê os feeds RSS/Atom de cada veículo (`server/outlets.config.ts`).
2. **Categoria** — um LLM classifica a categoria temática de cada artigo.
3. **Espectro** — definido pela **classificação fixa do veículo** (modelo
   Ground.news), não pelo conteúdo do artigo.
4. **Agrupamento** — um LLM agrupa artigos que tratam do mesmo evento.
5. **Estatísticas e ponto cego** — `server/analysis.ts` calcula a distribuição,
   a inclinação líquida e detecta pontos cegos (lógica pura, com testes).

A configuração dos veículos — feeds, viés, factualidade, propriedade, fundação —
fica centralizada em **`server/outlets.config.ts`** (fonte única de verdade,
consumida pelo scraper, pelo seed e pelo frontend).

## Como rodar

Pré-requisitos: Node 20+, pnpm, e um banco MySQL/TiDB acessível.

```bash
pnpm install
cp .env.example .env          # preencha DATABASE_URL e as chaves
pnpm db:push                  # aplica as migrations
pnpm db:seed                  # popula os veículos (server/outlets.config.ts)
pnpm dev                      # http://localhost:3000
```

Outros scripts:

```bash
pnpm check    # checagem de tipos (tsc)
pnpm test     # testes (vitest)
pnpm build    # build de produção
pnpm start    # roda o build de produção
```

O pipeline de coleta roda automaticamente de hora em hora via
`POST /api/scheduled/news-pipeline` (endpoint protegido para o cron).

## Estrutura

```
client/            Aplicação React (páginas: Home, TopicDetail, PontoCego, Metodologia, Busca)
server/
  outlets.config.ts  Fonte única de verdade dos veículos (feeds + metadados)
  scraper.ts         Coleta de RSS/Atom
  pipeline.ts        Orquestração: coleta → classificação → agrupamento
  analysis.ts        Lógica pura de viés/ponto cego (testada)
  seed.ts            Popula a tabela de veículos
  db.ts              Consultas Drizzle
  routers.ts         Rotas tRPC
drizzle/           Schema e migrations
shared/            Tipos e constantes compartilhados
```

## Segurança

Segredos (banco, JWT, chaves de API) vêm de variáveis de ambiente — veja
`.env.example`. Nunca faça commit de credenciais reais.
