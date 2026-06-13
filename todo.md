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
