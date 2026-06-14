/**
 * Fonte única de verdade dos veículos de comunicação acompanhados.
 *
 * Tanto o seed do banco (`server/seed.ts`) quanto o scraper (`server/scraper.ts`)
 * leem este arquivo, evitando divergência entre a lista exibida na Metodologia,
 * os feeds RSS coletados e os metadados de transparência (propriedade,
 * credibilidade factual, ano de fundação).
 *
 * SOBRE A CLASSIFICAÇÃO (importante — ver página de Metodologia):
 * `spectrum` (posição no espectro político) e `factuality` (rigor factual /
 * grau de separação entre fato e opinião) são classificações DO VEÍCULO, não de
 * artigos individuais — mesmo modelo do Ground.news. São uma SIMPLIFICAÇÃO
 * ANALÍTICA e CONTESTÁVEL. Onde há cobertura, apoiam-se em referências públicas:
 *   - Manchetômetro / LEMEP-IESP-UERJ — análise de valências de O Globo,
 *     Estadão e Folha (metodologia pública e citável).
 *   - Media Bias/Fact Check — cobertura parcial de veículos brasileiros.
 *   - Reuters Institute Digital News Report (Brasil) — confiança e audiência.
 *   - Literatura acadêmica de comunicação política brasileira.
 * Para veículos não cobertos por essas fontes, a classificação segue critérios
 * editoriais documentados na Metodologia e é revisada periodicamente. O campo
 * `factuality` descreve o PESO RELATIVO de opinião vs. apuração factual — não é
 * uma acusação de desinformação contra nenhum veículo.
 */

export type Spectrum =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita";

export type Factuality = "muito-alta" | "alta" | "mista" | "baixa";

export interface OutletConfig {
  name: string;
  slug: string;
  url: string;
  spectrum: Spectrum;
  factuality: Factuality;
  ownership: string;
  foundedYear: number;
  description: string;
  /** Feeds RSS/Atom do veículo. Vazio = sem feed público estável. */
  feeds: string[];
}

export const OUTLETS: OutletConfig[] = [
  // ─── Esquerda ──────────────────────────────────────────────────────────────
  {
    name: "Brasil de Fato",
    slug: "brasildefato",
    url: "https://www.brasildefato.com.br",
    spectrum: "esquerda",
    factuality: "mista",
    ownership: "Editora Brasil de Fato (ligada a movimentos sociais)",
    foundedYear: 2003,
    description: "Jornal popular ligado a movimentos sociais, foco em luta de classes e reforma agrária.",
    feeds: [
      "https://www.brasildefato.com.br/rss2.xml",
      "https://www.brasildefato.com.br/rss.xml",
    ],
  },
  {
    name: "Carta Capital",
    slug: "cartacapital",
    url: "https://www.cartacapital.com.br",
    spectrum: "esquerda",
    factuality: "alta",
    ownership: "Editora Confiança",
    foundedYear: 1994,
    description: "Revista semanal de análise política com viés progressista.",
    feeds: [
      "https://www.cartacapital.com.br/feed/",
      "https://www.cartacapital.com.br/politica/feed/",
    ],
  },
  {
    name: "The Intercept Brasil",
    slug: "intercept",
    url: "https://www.intercept.com.br",
    spectrum: "esquerda",
    factuality: "alta",
    ownership: "First Look Media",
    foundedYear: 2016,
    description: "Jornalismo investigativo independente com foco em accountability e direitos.",
    feeds: ["https://www.intercept.com.br/feed/"],
  },

  // ─── Centro-Esquerda ─────────────────────────────────────────────────────────
  {
    name: "Folha de S.Paulo",
    slug: "folha",
    url: "https://www.folha.uol.com.br",
    spectrum: "centro-esquerda",
    factuality: "alta",
    ownership: "Grupo Folha",
    foundedYear: 1921,
    description: "Um dos maiores jornais do Brasil, linha liberal-progressista e jornalismo de apartidarismo declarado.",
    feeds: [
      "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml",
      "https://feeds.folha.uol.com.br/poder/rss091.xml",
      "https://feeds.folha.uol.com.br/mercado/rss091.xml",
      "https://feeds.folha.uol.com.br/mundo/rss091.xml",
    ],
  },
  {
    name: "O Globo",
    slug: "oglobo",
    url: "https://oglobo.globo.com",
    spectrum: "centro-esquerda",
    factuality: "alta",
    ownership: "Grupo Globo (Família Marinho)",
    foundedYear: 1925,
    description: "Jornal carioca de grande circulação nacional, linha liberal.",
    feeds: [
      "https://oglobo.globo.com/rss.xml",
      "https://oglobo.globo.com/politica/rss.xml",
      "https://oglobo.globo.com/economia/rss.xml",
    ],
  },
  {
    name: "Agência Pública",
    slug: "apublica",
    url: "https://apublica.org",
    spectrum: "centro-esquerda",
    factuality: "alta",
    ownership: "Associação Pública de Jornalismo (sem fins lucrativos)",
    foundedYear: 2011,
    description: "Agência de jornalismo investigativo independente, premiada internacionalmente.",
    feeds: ["https://apublica.org/feed/"],
  },
  {
    name: "Nexo Jornal",
    slug: "nexo",
    url: "https://www.nexojornal.com.br",
    spectrum: "centro-esquerda",
    factuality: "muito-alta",
    ownership: "Nexo Jornal Ltda.",
    foundedYear: 2015,
    description: "Jornal digital de análise contextualizada, sem publicidade, focado em dados.",
    feeds: ["https://www.nexojornal.com.br/rss.xml"],
  },

  // ─── Centro ──────────────────────────────────────────────────────────────────
  {
    name: "G1",
    slug: "g1",
    url: "https://g1.globo.com",
    spectrum: "centro",
    factuality: "alta",
    ownership: "Grupo Globo (Família Marinho)",
    foundedYear: 2006,
    description: "Portal de notícias do Grupo Globo, cobertura factual ampla e generalista.",
    feeds: [
      "https://g1.globo.com/rss/g1/",
      "https://g1.globo.com/rss/g1/politica/",
      "https://g1.globo.com/rss/g1/economia/",
      "https://g1.globo.com/rss/g1/mundo/",
    ],
  },
  {
    name: "UOL",
    slug: "uol",
    url: "https://www.uol.com.br",
    spectrum: "centro",
    factuality: "alta",
    ownership: "Grupo UOL (Grupo Folha)",
    foundedYear: 1996,
    description: "Maior portal de conteúdo do Brasil, ampla cobertura jornalística.",
    feeds: [
      "https://rss.uol.com.br/feed/noticias.xml",
      "https://rss.uol.com.br/feed/economia.xml",
    ],
  },
  {
    name: "BBC News Brasil",
    slug: "bbcbrasil",
    url: "https://www.bbc.com/portuguese",
    spectrum: "centro",
    factuality: "muito-alta",
    ownership: "BBC (serviço público britânico)",
    foundedYear: 2005,
    description: "Serviço em português da BBC, padrão internacional de apuração e imparcialidade.",
    feeds: ["https://feeds.bbci.co.uk/portuguese/rss.xml"],
  },
  {
    name: "Metrópoles",
    slug: "metropoles",
    url: "https://www.metropoles.com",
    spectrum: "centro",
    factuality: "alta",
    ownership: "Grupo Ímã (Mediabras)",
    foundedYear: 2015,
    description: "Portal de Brasília com forte cobertura de bastidores políticos e factual.",
    feeds: ["https://www.metropoles.com/feed"],
  },

  // ─── Centro-Direita ──────────────────────────────────────────────────────────
  {
    name: "Estadão",
    slug: "estadao",
    url: "https://www.estadao.com.br",
    spectrum: "centro-direita",
    factuality: "alta",
    ownership: "Grupo Estado (Família Mesquita)",
    foundedYear: 1875,
    description: "O Estado de S. Paulo, jornal centenário com linha liberal-conservadora.",
    feeds: [
      "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/politica/",
      "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/economia/",
      "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/brasil/",
      "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/internacional/",
    ],
  },
  {
    name: "Veja",
    slug: "veja",
    url: "https://veja.abril.com.br",
    spectrum: "centro-direita",
    factuality: "mista",
    ownership: "Grupo Abril",
    foundedYear: 1968,
    description: "Maior revista semanal do Brasil, linha liberal-conservadora.",
    feeds: [
      "https://veja.abril.com.br/feed/",
      "https://veja.abril.com.br/politica/feed/",
    ],
  },
  {
    name: "Poder360",
    slug: "poder360",
    url: "https://www.poder360.com.br",
    spectrum: "centro-direita",
    factuality: "alta",
    ownership: "DrClick Comunicação",
    foundedYear: 2015,
    description: "Site de jornalismo político e econômico orientado a dados e documentos oficiais.",
    feeds: ["https://www.poder360.com.br/feed/"],
  },

  // ─── Direita ─────────────────────────────────────────────────────────────────
  {
    name: "R7",
    slug: "r7",
    url: "https://noticias.r7.com",
    spectrum: "direita",
    factuality: "mista",
    ownership: "Grupo Record (Igreja Universal do Reino de Deus)",
    foundedYear: 2009,
    description: "Portal de notícias da TV Record, linha conservadora.",
    feeds: [
      "https://noticias.r7.com/feed.xml",
      "https://noticias.r7.com/brasil/feed.xml",
    ],
  },
  {
    name: "Gazeta do Povo",
    slug: "gazetadopovo",
    url: "https://www.gazetadopovo.com.br",
    spectrum: "direita",
    factuality: "mista",
    ownership: "Grupo Paranaense de Comunicação (GRPCOM)",
    foundedYear: 1919,
    description: "Jornal paranaense de alcance nacional, linha conservadora e liberal na economia.",
    feeds: ["https://www.gazetadopovo.com.br/feed/rss/republica.xml"],
  },
  {
    name: "Jovem Pan",
    slug: "jovempan",
    url: "https://jovempan.com.br",
    spectrum: "direita",
    factuality: "mista",
    ownership: "Grupo Jovem Pan",
    foundedYear: 1942,
    description: "Rádio e canal de notícias com forte linha conservadora e opinativa.",
    feeds: ["https://jovempan.com.br/feed"],
  },
];

/** Mapa slug → feeds, consumido pelo scraper. */
export const RSS_FEEDS: Record<string, string[]> = Object.fromEntries(
  OUTLETS.map((o) => [o.slug, o.feeds]),
);
