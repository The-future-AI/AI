import { Link } from "wouter";
import { ArrowLeft, BookOpen, Scale, Eye, BarChart2, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { OUTLETS, type Spectrum, type Factuality } from "../../../server/outlets.config";

const SPECTRUM_COLORS: Record<string, string> = {
  esquerda: "#c0392b",
  "centro-esquerda": "#e05c3a",
  centro: "#888888",
  "centro-direita": "#2980b9",
  direita: "#1565c0",
};

const SPECTRUM_BG: Record<string, string> = {
  esquerda: "#fdf0ee",
  "centro-esquerda": "#fef3ef",
  centro: "#f5f5f5",
  "centro-direita": "#e8f4fd",
  direita: "#e3f0ff",
};

const SPECTRUM_META: { key: Spectrum; label: string; description: string }[] = [
  { key: "esquerda", label: "Esquerda", description: "Veículos com linha editorial progressista, foco em movimentos sociais e crítica ao conservadorismo." },
  { key: "centro-esquerda", label: "Centro-Esquerda", description: "Veículos de grande circulação com linha liberal-progressista, defesa da democracia e jornalismo investigativo." },
  { key: "centro", label: "Centro", description: "Veículos de cobertura ampla e generalista, com foco em notícias factuais." },
  { key: "centro-direita", label: "Centro-Direita", description: "Veículos com linha liberal-conservadora, defesa do mercado e reformas econômicas." },
  { key: "direita", label: "Direita", description: "Veículos com linha editorial conservadora, defesa de valores tradicionais e crítica ao progressismo." },
];

const FACTUALITY_LABELS: Record<Factuality, string> = {
  "muito-alta": "Factualidade muito alta",
  alta: "Factualidade alta",
  mista: "Factualidade mista",
  baixa: "Factualidade baixa",
};

const FACTUALITY_COLORS: Record<Factuality, { fg: string; bg: string }> = {
  "muito-alta": { fg: "#1b7a43", bg: "#e7f6ec" },
  alta: { fg: "#2a7d6f", bg: "#e6f5f1" },
  mista: { fg: "#a07000", bg: "#fff7e0" },
  baixa: { fg: "#b03030", bg: "#fdecec" },
};

const OUTLETS_BY_SPECTRUM = SPECTRUM_META.map((meta) => ({
  ...meta,
  outlets: OUTLETS.filter((o) => o.spectrum === meta.key),
}));

const METHODOLOGY_STEPS = [
  {
    icon: RefreshCw,
    title: "1. Coleta Automática",
    description: "A cada hora, o sistema coleta automaticamente os feeds RSS dos principais veículos de comunicação brasileiros. São capturadas as manchetes, resumos e metadados de cada publicação.",
  },
  {
    icon: BarChart2,
    title: "2. Classificação por Veículo",
    description: "Cada veículo de comunicação possui uma classificação política fixa, baseada em análises acadêmicas e jornalísticas amplamente reconhecidas. A classificação é do veículo, não do artigo individual.",
  },
  {
    icon: Scale,
    title: "3. Agrupamento por Tópico",
    description: "Um modelo de linguagem (LLM) analisa os títulos e resumos para identificar quais artigos tratam do mesmo evento ou assunto, agrupando-os em tópicos. Artigos sobre o mesmo fato, mas de veículos diferentes, são reunidos.",
  },
  {
    icon: BarChart2,
    title: "4. Cálculo dos Percentuais",
    description: "Para cada tópico, calculamos a proporção de cobertura por espectro político. Se 3 veículos cobriram um assunto — 1 de esquerda, 1 de centro e 1 de direita — cada espectro recebe 33%. Os percentuais refletem quem cobriu, não o conteúdo.",
  },
  {
    icon: ShieldCheck,
    title: "5. Credibilidade Factual",
    description: "Além do viés político, cada veículo recebe uma nota de credibilidade factual (muito alta, alta, mista ou baixa), que mede o rigor da apuração — independentemente da posição política. Viés e factualidade são duas dimensões distintas.",
  },
  {
    icon: Eye,
    title: "6. Detecção de Ponto Cego",
    description: "Um tópico é marcado como \"Ponto Cego\" quando 70% ou mais da cobertura vem de um único lado do espectro político. Isso indica que o assunto foi ignorado pelo outro lado, criando uma \"bolha informacional\".",
  },
];

export default function Metodologia() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
      <Navbar />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 1.5rem 60px" }}>

        {/* Back button */}
        <Link href="/">
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "13px", color: "#888888", backgroundColor: "transparent",
            border: "none", cursor: "pointer", marginBottom: "24px", padding: 0,
            fontFamily: "'Inter', sans-serif", transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#888888"; }}
          >
            <ArrowLeft size={14} />
            Voltar ao feed
          </button>
        </Link>

        {/* Header */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "clamp(20px, 5vw, 36px)",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <BookOpen size={20} style={{ color: "#888888" }} />
            <span style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
            }}>
              Transparência
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(22px, 5vw, 32px)",
            fontWeight: 700, lineHeight: 1.2, color: "#111111", marginBottom: "14px",
          }}>
            Nossa Metodologia
          </h1>

          <p style={{
            fontSize: "15px", color: "#555555", lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif", marginBottom: "12px",
          }}>
            O Viés Brasil é uma ferramenta de análise de cobertura jornalística, não um árbitro da verdade. Nosso objetivo é mostrar <strong>quais veículos cobriram cada assunto</strong> e <strong>como essa cobertura se distribui pelo espectro político</strong>, permitindo que você leia as notícias com mais consciência sobre as perspectivas que está consumindo.
          </p>

          <p style={{
            fontSize: "15px", color: "#555555", lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif",
          }}>
            A classificação política dos veículos é baseada em análises acadêmicas, pesquisas de percepção de audiência e avaliações editoriais amplamente reconhecidas no campo do jornalismo brasileiro. Reconhecemos que qualquer classificação é uma simplificação — o espectro político é complexo e os veículos evoluem ao longo do tempo.
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{
          display: "flex", gap: "12px",
          backgroundColor: "#fffbea", border: "1px solid #f0c040",
          borderRadius: "6px", padding: "14px 18px", marginBottom: "20px",
        }}>
          <AlertCircle size={18} style={{ color: "#d4a017", flexShrink: 0, marginTop: "1px" }} />
          <div>
            <h3 style={{
              fontSize: "13px", fontWeight: 700, color: "#a07000",
              fontFamily: "'Inter', sans-serif", marginBottom: "4px",
            }}>
              Importante
            </h3>
            <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
              A classificação política dos veículos é uma <strong>simplificação analítica</strong>. Cada veículo publica conteúdos variados e pode divergir de sua classificação geral em assuntos específicos. Use esta ferramenta como ponto de partida para uma leitura mais crítica, não como verdade absoluta.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "clamp(16px, 4vw, 28px)",
          marginBottom: "20px",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px",
          }}>
            Como Funciona
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {METHODOLOGY_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} style={{ display: "flex", gap: "14px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    backgroundColor: "#f5f5f5", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={16} style={{ color: "#555555" }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "14px", fontWeight: 700, color: "#111111",
                      fontFamily: "'Inter', sans-serif", marginBottom: "5px",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: "13.5px", color: "#666666", lineHeight: 1.6,
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outlets by spectrum */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "clamp(16px, 4vw, 28px)",
          marginBottom: "20px",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "6px",
          }}>
            Classificação dos Veículos
          </h2>
          <p style={{
            fontSize: "13.5px", color: "#888888", fontFamily: "'Inter', sans-serif",
            marginBottom: "20px", lineHeight: 1.5,
          }}>
            Cada veículo monitorado recebe uma classificação fixa no espectro político. Veja abaixo como cada um foi classificado e o critério utilizado.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {OUTLETS_BY_SPECTRUM.map((group) => (
              <div key={group.key} style={{
                borderLeft: `4px solid ${SPECTRUM_COLORS[group.key]}`,
                paddingLeft: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "3px",
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: SPECTRUM_COLORS[group.key],
                    backgroundColor: SPECTRUM_BG[group.key],
                    border: `1px solid ${SPECTRUM_COLORS[group.key]}40`,
                  }}>
                    {group.label}
                  </span>
                </div>
                <p style={{
                  fontSize: "13px", color: "#666666", fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.5, marginBottom: "10px",
                }}>
                  {group.description}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {group.outlets.map((outlet) => {
                    const fact = FACTUALITY_COLORS[outlet.factuality];
                    return (
                      <div key={outlet.name} style={{
                        display: "flex", alignItems: "flex-start", gap: "8px",
                        padding: "10px 12px",
                        backgroundColor: SPECTRUM_BG[group.key],
                        borderRadius: "4px",
                      }}>
                        <div style={{
                          width: "7px", height: "7px", borderRadius: "50%",
                          backgroundColor: SPECTRUM_COLORS[group.key],
                          flexShrink: 0, marginTop: "5px",
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                            <a
                              href={outlet.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "13px", fontWeight: 600,
                                color: "#111111", fontFamily: "'Inter', sans-serif",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = "underline"; }}
                              onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = "none"; }}
                            >
                              {outlet.name}
                            </a>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "3px",
                              padding: "1px 7px", borderRadius: "3px",
                              fontSize: "10px", fontWeight: 700,
                              fontFamily: "'Inter', sans-serif",
                              color: fact.fg, backgroundColor: fact.bg,
                            }}>
                              <ShieldCheck size={10} />
                              {FACTUALITY_LABELS[outlet.factuality]}
                            </span>
                          </div>
                          <p style={{
                            fontSize: "12px", color: "#888888",
                            fontFamily: "'Inter', sans-serif", margin: "3px 0 0",
                          }}>
                            {outlet.description}
                          </p>
                          <p style={{
                            fontSize: "11.5px", color: "#aaaaaa",
                            fontFamily: "'Inter', sans-serif", margin: "3px 0 0",
                          }}>
                            Propriedade: {outlet.ownership} · Fundado em {outlet.foundedYear}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ponto Cego explanation */}
        <div style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "6px",
          padding: "clamp(16px, 4vw, 28px)",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Eye size={16} style={{ color: "#f39c12" }} />
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "20px", fontWeight: 700, color: "#ffffff",
            }}>
              O que é o Ponto Cego?
            </h2>
          </div>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif", marginBottom: "12px",
          }}>
            O <strong style={{ color: "#f39c12" }}>Ponto Cego</strong> (ou <em>Blindspot</em>, como chamado pelo Ground.news) identifica notícias que foram cobertas predominantemente por um lado do espectro político, sendo ignoradas pelo outro.
          </p>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif", marginBottom: "12px",
          }}>
            Um tópico é marcado como Ponto Cego quando <strong style={{ color: "#f39c12" }}>70% ou mais</strong> da cobertura vem de um único lado (esquerda ou direita). Isso pode indicar:
          </p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {[
              "Uma notícia que beneficia um lado e é ignorada pelo outro",
              "Um assunto que não é considerado relevante por parte da mídia",
              "Uma divergência genuína sobre o que é notícia",
            ].map((item) => (
              <li key={item} style={{
                fontSize: "13.5px", color: "rgba(255,255,255,0.65)",
                fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: "6px",
              }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "clamp(16px, 4vw, 28px)",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "20px",
          }}>
            Perguntas Frequentes
          </h2>

          {[
            {
              q: "Por que alguns veículos não aparecem?",
              a: "Monitoramos veículos que disponibilizam feeds RSS públicos. A cobertura abrange hoje 17 veículos em todo o espectro — de Brasil de Fato e The Intercept à esquerda até Gazeta do Povo e Jovem Pan à direita —, buscando equilíbrio entre os lados. Sugestões de novos veículos com RSS público são bem-vindas.",
            },
            {
              q: "Qual a diferença entre viés e credibilidade factual?",
              a: "São duas medidas independentes. O viés indica a posição editorial no espectro político (esquerda a direita). A credibilidade factual indica o rigor da apuração — um veículo pode ter viés acentuado e ainda assim alta factualidade, e vice-versa. Por isso exibimos as duas separadamente na classificação dos veículos.",
            },
            {
              q: "Com que frequência as notícias são atualizadas?",
              a: "O sistema coleta e processa novas notícias automaticamente a cada hora. O horário da última atualização é exibido no topo do feed principal.",
            },
            {
              q: "Como é feito o agrupamento de notícias por tópico?",
              a: "Utilizamos um modelo de linguagem (LLM) para identificar artigos que tratam do mesmo evento ou assunto. O modelo analisa títulos e resumos para determinar quais artigos pertencem ao mesmo tópico.",
            },
            {
              q: "Posso sugerir novos veículos para monitoramento?",
              a: "Sim! Estamos sempre expandindo nossa cobertura. Se você conhece um veículo com RSS público que deveria ser incluído, entre em contato conosco.",
            },
            {
              q: "A classificação política é definitiva?",
              a: "Não. A classificação é uma simplificação analítica baseada na linha editorial predominante de cada veículo. Veículos publicam conteúdos variados e podem divergir de sua classificação geral. Revisamos as classificações periodicamente.",
            },
          ].map((item, i, arr) => (
            <div key={i} style={{
              borderBottom: i < arr.length - 1 ? "1px solid #f0ede8" : "none",
              paddingBottom: "16px",
              marginBottom: "16px",
            }}>
              <h3 style={{
                fontSize: "14px", fontWeight: 700, color: "#111111",
                fontFamily: "'Inter', sans-serif", marginBottom: "6px",
              }}>
                {item.q}
              </h3>
              <p style={{
                fontSize: "13.5px", color: "#666666", lineHeight: 1.6,
                fontFamily: "'Inter', sans-serif",
              }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
