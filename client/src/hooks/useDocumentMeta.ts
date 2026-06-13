import { useEffect } from "react";

const SITE_NAME = "Viés Brasil";
const DEFAULT_TITLE = "Viés Brasil — Veja todos os lados de cada notícia";
const DEFAULT_DESCRIPTION =
  "Agregador de notícias brasileiras com análise de viés político. Compare como esquerda, centro e direita cobrem os mesmos eventos.";

export interface DocumentMeta {
  /** Título da página (sem o sufixo do site, que é adicionado automaticamente). */
  title?: string;
  description?: string;
  /** Imagem para cards de compartilhamento (Open Graph / Twitter). */
  image?: string | null;
  /** "website" (padrão) ou "article" para páginas de notícia. */
  type?: "website" | "article";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Atualiza dinamicamente o título e as meta tags (description, Open Graph,
 * Twitter Card) conforme a página/tópico — melhora SEO e o preview ao
 * compartilhar links (item 4).
 *
 * Observação: scrapers que não executam JavaScript (ex.: WhatsApp/Facebook)
 * leem as tags estáticas do index.html. Para previews por tópico nesses
 * canais, seria necessário SSR/pré-renderização — este hook cobre o título da
 * aba e os buscadores que executam JS (como o Google).
 */
export function useDocumentMeta(meta: DocumentMeta) {
  const { title, description, image, type = "website" } = meta;
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description?.trim() || DEFAULT_DESCRIPTION;
    const url = window.location.href;

    document.title = fullTitle;
    upsertMeta("name", "description", desc);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", desc);
    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
      upsertMeta("name", "twitter:card", "summary_large_image");
    }
  }, [title, description, image, type]);
}
