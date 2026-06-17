# Notícias Brasil - Viés Político | TODO

## Database & Backend
- [x] Schema: tabelas articles, topics, media_outlets, scrape_jobs
- [x] Migration SQL aplicada via webdev_execute_sql
- [x] Query helpers em server/db.ts
- [x] Scraper para G1, Folha, O Globo, UOL, Estadão, R7, Carta Capital, Veja, Brasil de Fato
- [x] Pipeline LLM: classificação política de artigos (5 espectros)
- [x] Pipeline LLM: agrupamento de artigos por tópico/evento
- [x] tRPC router: topics.list (com filtros por categoria, espectro)
- [x] tRPC router: topics.byId (detalhes do tópico com todos os artigos)
- [x] tRPC router: topics.blindspot (Ponto Cego)
- [x] tRPC router: scraper.run (trigger manual)
- [x] tRPC router: articles.search

## Frontend
- [x] Design system: cores verde/amarelo/azul Brasil, tipografia elegante
- [x] Navbar com categorias PT-BR e busca
- [x] Home page: feed de tópicos com barra de espectro político
- [x] Card de tópico com percentual por espectro (Esquerda/Centro-Esquerda/Centro/Centro-Direita/Direita)
- [x] Seção "Ponto Cego" na home
- [x] Página de detalhe do tópico com artigos por espectro
- [x] Página de busca (integrada na home)
- [x] Filtros por categoria (Política, Economia, Internacional, Esporte, Tecnologia)
- [x] Loading skeletons e estados vazios elegantes
- [x] Design responsivo

## Cron & Automação
- [x] Cron job horário: handler /api/scheduled/news-pipeline implementado
- [x] Logs de execução do scraper (tabela scrape_jobs)

## Testes
- [x] Vitest para pipeline de classificação (12 testes passando)
- [x] Vitest para agrupamento de tópicos

## Melhorias Pós-Deploy
- [x] Handler /api/scheduled/news-pipeline implementado e pronto para deploy
- [x] Percentuais numéricos exibidos nos cards (showCoverage + showLabels)

## Correções Mobile & Cores (Sprint 2)
- [x] Navbar responsiva — menu hamburguer no mobile, tabs horizontais com scroll
- [x] Home.tsx responsiva — 1 coluna no mobile, sidebar abaixo do feed
- [x] TopicCard responsiva — featured card sem overflow, grid card compacto
- [x] TopicDetail responsiva — 5 caixas de espectro em grid 2-3 colunas no mobile
- [x] PontoCego responsiva — layout de lista no mobile
- [x] Corrigir cores do espectro: Esquerda=#c0392b, C-Esquerda=#e05c3a, Centro=#888888, C-Direita=#2980b9, Direita=#1565c0
- [x] Fundo geral cinza claro (#f0efed), texto preto (#111), cards brancos (#fff)

## Refatoração Central — 5 Espectros por Notícia (Sprint 3)
- [x] Pipeline: calcular leftPct/centerLeftPct/centerPct/centerRightPct/rightPct por tópico baseado nos veículos que cobriram
- [x] Pipeline: armazenar lista de veículos por espectro (ex: "Esquerda: Brasil de Fato, Carta Capital")
- [x] Frontend: cada card mostra barra com 5 segmentos coloridos + percentuais de TODOS os 5 espectros
- [x] Frontend: card mostra quais mídias cobriram por espectro (como Ground.news)
- [x] Frontend: abas Política/Economia/Internacional/Esporte/Tecnologia filtram notícias corretamente
- [x] Frontend: página de detalhe mostra artigos agrupados por espectro com nome do veículo e link
- [x] Reprocessar todos os tópicos existentes com nova lógica de percentuais

## Melhorias para Superar o Ground.news (Sprint 4)
- [x] Comparação de manchetes: seção "Como cada lado titulou" na página de detalhe do tópico
- [x] Página "Sobre a Metodologia": transparência sobre classificação dos veículos e cálculo de percentuais
- [x] Busca com filtro por espectro político na página de busca
- [x] Fundo cinza claro puro (#f2f2f2) — já implementado
- [x] Link "Metodologia" adicionado ao navbar (desktop e mobile)
- [x] Busca no navbar navega para /busca com query na URL
- [x] Corrigir FAQ de Metodologia: R7/Jovem Pan sem RSS público estável (sub-representação da direita)

## Commit 276f0cf — Logos, Acessibilidade, Tokens, SEO (Sprint 5)
- [x] OutletLogo.tsx — favicon de cada veículo com fallback de inicial colorida
- [x] spectrum.ts — fonte única de verdade para SPECTRUM_COLORS, SPECTRUM_LABELS, SPECTRUM_ABBR, SPECTRUM_BG, SPECTRUM_TEXT, getDominantSpectrum, outletLogo
- [x] useDocumentMeta.ts — hook para título e meta tags OG/Twitter dinâmicos por página
- [x] SpectrumBar.tsx — importa de spectrum.ts, aria-label acessível, abreviações E/CE/C/CD/D nas barras
- [x] TopicCard.tsx — usa spectrum.ts centralizado, OutletLogo nos veículos
- [x] Home.tsx — OutletLogo na lista de mídias, useDocumentMeta, lê OUTLETS de outlets.config.ts
- [x] TopicDetail.tsx — OutletLogo por fonte, useDocumentMeta com título do tópico
- [x] Busca.tsx — usa spectrum.ts centralizado, useDocumentMeta
- [x] PontoCego.tsx — useDocumentMeta com título e descrição da página
- [x] Metodologia.tsx — usa spectrum.ts centralizado, OutletLogo nos veículos
- [x] index.html — meta tags OG/Twitter estáticas (og:title, og:description, twitter:card, etc.)

## Commits c72be04 + 4584486 + 4b648e5 + 5800fb5 + Rename (Sprint 6)
- [x] c72be04: Metodologia — citar fontes públicas (Manchetômetro, MBFC, Reuters Institute), suavizar linguagem, seção "Fontes e Referências"
- [x] 4584486: Remover classificação de factualidade da interface e dos dados (redução de exposição jurídica)
- [x] 4b648e5: Recriar factuality como atribuição a terceiros (MBFC) com FactualityBadge e link para perfil MBFC
- [x] 5800fb5: ShareButtons.tsx + NewsletterSignup.tsx + tabela newsletter_subscribers + mutation newsletter.subscribe
- [x] Renomear app de "Viés Brasil" para "Contextual News" (Navbar, useDocumentMeta, index.html, Metodologia)

## Mobile-First Redesign (Sprint 7)
- [x] Navbar mobile: hamburger menu elegante, busca colapsável, logo compacto
- [x] Categorias: scroll horizontal no mobile sem quebra de linha
- [x] TopicCard mobile: badges compactos em 2 linhas, thumbnail proporcional
- [x] Tooltip nos logos dos veículos (nome + espectro ao hover/tap)
- [x] Home mobile: coluna única, sidebar oculta por padrão com botão "Ver mais"
- [x] Seletor de ordenação do feed (Mais recente / Mais fontes / Maior divergência)

## Redesign TopicDetail — Layout Jornalístico (Sprint 8)
- [ ] Procedure tRPC `topics.getStructuredAnalysis` que gera via LLM: fatos comuns, diferenças de enquadramento, contexto
- [ ] TopicDetail: seção "O que aconteceu" (resumo neutro)
- [ ] TopicDetail: seção "Reportado por" (logos + nomes dos veículos)
- [ ] TopicDetail: seção "Fatos em comum" (lista de bullets)
- [ ] TopicDetail: seção "Diferenças de enquadramento" (bullets por fonte)
- [ ] TopicDetail: seção "Fontes originais" (links diretos para os artigos)
- [ ] TopicDetail: seção "Contexto" (background, leis, casos anteriores)
- [ ] Cache da análise no banco (coluna structured_analysis JSON) para não reprocessar a cada visita

## Requisitos Pré-Lançamento — Metodologia Expandida (Sprint 8b)
- [ ] Seleção de fontes: por que esses 17 veículos foram escolhidos
- [ ] Inclinação política: como é determinada (IA + fontes de referência)
- [ ] Papel da IA: o que faz e o que não faz
- [ ] Revisão humana: quando há intervenção manual
- [ ] Correções: formulário/e-mail para solicitar correções
- [ ] Declaração de neutralidade

## Roadmap Completo MVP (Sprint 9)
- [ ] Story page: redesign TopicDetail com summary, source list, source comparison, framing notes, timeline, links originais
- [ ] Source profile page (/veiculo/:slug): description, ownership, country, coverage topics, reliability notes, editorial tendency, articles indexed
- [ ] Subscription page (/planos): Free / Student / Pro / Organisation
- [ ] Admin panel (/admin): moderar bad clusters, bad summaries, wrong source metadata, sensitive stories, legal complaints
- [ ] Metodologia expandida: source selection, political leaning, factuality, AI role, human review, corrections, neutrality statement

## Sprint 9 — Páginas Novas e Expansão (Implementado)
- [x] TopicDetail: reescrito com layout jornalístico de 7 seções (O que aconteceu, Reportado por, Fatos em comum, Diferenças de enquadramento, Fontes originais, Contexto, Análise de espectro)
- [x] tRPC procedure `topics.getStructuredAnalysis` — análise estruturada via LLM com cache no banco
- [x] Página /veiculo/:slug — perfil completo do veículo (logo, espectro, propriedade, feeds RSS, artigos recentes)
- [x] tRPC procedure `outlets.bySlug` — dados do veículo + artigos recentes
- [x] Página /planos — 4 tiers: Gratuito, Estudante, Pro, Organização (planos pagos "em breve")
- [x] Página /admin — painel protegido por auth: tabs Tópicos, Veículos, Scraper
- [x] Navbar: link "Planos" adicionado (desktop e mobile)
- [x] Metodologia: nomes dos veículos agora são links para /veiculo/:slug
- [x] App.tsx: rotas /veiculo/:slug, /planos, /admin adicionadas

## Sprint 10 — Produção Ready (Implementado)
- [x] Aplicar migrações SQL 0005-0007 (category, region, language, paywall, subscriptions, entities)
- [x] Seed 46 outlets no banco de dados (corrigir isMain check no seed.ts)
- [x] Desativar 7 outlets legados (slugs duplicados de versões anteriores)
- [x] Banco agora tem exatamente 46 outlets ativos (canônicos do outlets.config.ts)
- [x] Criar página /eleicoes — feed eleitoral com entidades (candidatos, partidos, instituições) e cobertura por espectro
- [x] Adicionar link "Eleições 2026" no Navbar desktop e mobile (ícone Vote, cor roxa)
- [x] App.tsx: rota /eleicoes adicionada
- [x] Texto "17 veículos" na Metodologia agora dinâmico via OUTLETS.length (46)
- [x] Zero erros TypeScript — build limpo
- [x] 26 testes passando (pipeline, analysis, auth)
