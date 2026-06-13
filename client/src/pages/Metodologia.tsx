import { Link } from "wouter";
import { ArrowLeft, BookOpen, Scale, Eye, BarChart2, RefreshCw, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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

const OUTLETS_BY_SPECTRUM = [
  {
    key: "esquerda",
    label: "Esquerda",
    description: "Veículos com linha editorial progressista, foco em movimentos sociais e crítica ao conservadorismo.",
    outlets: [
      { name: "Brasil de Fato", url: "https://www.brasildefato.com.br", desc: "Jornal popular ligado a movimentos sociais" },
      { name: "Carta Capital", url: "https://www.cartacapital.com.br", desc: "Revista de análise política com viés progressista" },
    ],
  },
  {
    key: "centro-esquerda",
    label: "Centro-Esquerda",
    description: "Veículos de grande circulação com linha editorial liberal-progressista, defesa da democracia e jornalismo investigativo.",
    outlets: [
      { name: "Folha de S.Paulo", url: "https://www.folha.uol.com.br", desc: "Um dos maiores jornais do Brasil, linha liberal-progressista" },
      { name: "O Globo", url: "https://oglobo.globo.com", desc: "Jornal carioca de grande circulação nacional" },
      { name: "Agência Pública", url: "https://apublica.org", desc: "Agência de jornalismo investigativo independente" },
    ],
  },
  {
    key: "centro",
    label: "Centro",
    description: "Veículos de cobertura ampla e generalista, com foco em notícias factuais e entretenimento.",
    outlets: [
      { name: "G1 / Globo News", url: "https://g1.globo.com", desc: "Portal de notícias do Grupo Globo, cobertura factual ampla" },
      { name: "UOL", url: "https://www.uol.com.br", desc: "Portal de internet com ampla cobertura jornalística" },
    ],
  },
  {
    key: "centro-direita",
    label: "Centro-Direita",
    description: "Veículos com linha editorial liberal-conservadora, defesa do mercado e reformas econômicas.",
    outlets: [
      { name: "Estadão", url: "https://www.estadao.com.br", desc: "O Estado de S. Paulo, jornal centenário com linha liberal-conservadora" },
      { name: "Veja", url: "https://veja.abril.com.br", desc: "Maior revista semanal do Brasil, linha liberal-conservadora" },
    ],
  },
  {
    key: "direita",
    label: "Direita",
    description: "Veículos com linha editorial conservadora, defesa de valores tradicionais e crítica ao progressismo.",
    outlets: [
      { name: "R7 / Record", url: "https://r7.com", desc: "Portal da TV Record, linha conservadora (sem RSS público — em processo de integração)" },
      { name: "Jovem Pan", url: "https://jovempan.com.br", desc: "Rádio e canal de TV com linha conservadora (em processo de integração)" },
    ],
  },
];

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
    icon: Eye,
    title: "5. Detecção de Ponto Cego",
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
                  {group.outlets.map((outlet) => (
                    <div key={outlet.name} style={{
                      display: "flex", alignItems: "flex-start", gap: "8px",
                      padding: "8px 12px",
                      backgroundColor: SPECTRUM_BG[group.key],
                      borderRadius: "4px",
                    }}>
                      <div style={{
                        width: "7px", height: "7px", borderRadius: "50%",
                        backgroundColor: SPECTRUM_COLORS[group.key],
                        flexShrink: 0, marginTop: "4px",
                      }} />
                      <div>
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
                        <p style={{
                          fontSize: "12px", color: "#888888",
                          fontFamily: "'Inter', sans-serif", margin: "2px 0 0",
                        }}>
                          {outlet.desc}
                        </p>
                      </div>
                    </div>
                  ))}
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
              a: "Monitoramos apenas veículos que disponibilizam feeds RSS públicos e acessíveis. Alguns veículos conservadores relevantes, como R7 e Jovem Pan, não possuem RSS público estável e por isso ainda não estão integrados. Isso pode criar uma sub-representação do espectro da direita nos dados atuais. Estamos trabalhando em alternativas de coleta para esses veículos.",
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
          ].map((item, i) => (
            <div key={i} style={{
              borderBottom: i < 4 ? "1px solid #f0ede8" : "none",
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
