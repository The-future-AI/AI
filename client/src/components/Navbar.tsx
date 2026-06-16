import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, Eye, Menu, BookOpen, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { id: "todos", label: "Início" },
  { id: "politica", label: "Política" },
  { id: "economia", label: "Economia" },
  { id: "internacional", label: "Internacional" },
  { id: "esporte", label: "Esporte" },
  { id: "tecnologia", label: "Tecnologia" },
];

interface NavbarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Navbar({
  activeCategory = "todos",
  onCategoryChange,
  onSearch,
  searchQuery: externalQuery = "",
}: NavbarProps) {
  const [searchValue, setSearchValue] = useState(externalQuery);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [location, navigate] = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (onSearch) {
      onSearch(q);
    } else if (q) {
      navigate(`/busca?q=${encodeURIComponent(q)}`);
    }
    setSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchValue("");
    if (onSearch) onSearch("");
  };

  const handleCategoryClick = (id: string) => {
    if (location !== "/") {
      navigate(`/?categoria=${id}`);
    } else {
      onCategoryChange?.(id);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 100 }}>
        {/* ── Main navbar ─────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            display: "flex", alignItems: "center",
            height: "52px", maxWidth: "1280px",
            margin: "0 auto", padding: "0 1rem", gap: "6px",
          }}>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="mobile-menu-btn"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ffffff", padding: "6px", flexShrink: 0,
                borderRadius: "6px",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <div style={{
                width: 18, height: 14, display: "flex",
                flexDirection: "column", justifyContent: "space-between",
                transition: "all 0.2s ease",
              }}>
                <span style={{
                  display: "block", height: 2, background: "#fff", borderRadius: 1,
                  transformOrigin: "left center",
                  transform: menuOpen ? "rotate(45deg) translate(2px, -1px)" : "none",
                  transition: "transform 0.2s ease",
                }} />
                <span style={{
                  display: "block", height: 2, background: "#fff", borderRadius: 1,
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? "translateX(-4px)" : "none",
                  transition: "opacity 0.15s ease, transform 0.2s ease",
                }} />
                <span style={{
                  display: "block", height: 2, background: "#fff", borderRadius: 1,
                  transformOrigin: "left center",
                  transform: menuOpen ? "rotate(-45deg) translate(2px, 1px)" : "none",
                  transition: "transform 0.2s ease",
                }} />
              </div>
            </button>

            {/* Logo */}
            <Link href="/">
              <div style={{
                display: "flex", alignItems: "baseline", gap: 0,
                cursor: "pointer", flexShrink: 0, userSelect: "none",
              }}>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "17px", fontWeight: 700, color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}>Contextual</span>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "17px", fontWeight: 700, color: "#f39c12",
                  letterSpacing: "-0.02em", marginLeft: "5px",
                }}>News</span>
              </div>
            </Link>

            {/* Nav links — desktop only */}
            <nav style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1, marginLeft: "16px" }}
              className="desktop-nav">
              <Link href="/">
                <span style={{
                  fontSize: "13px", fontWeight: 500,
                  color: location === "/" ? "#ffffff" : "rgba(255,255,255,0.55)",
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: location === "/" ? "rgba(255,255,255,0.08)" : "transparent",
                  whiteSpace: "nowrap", display: "block",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}>Início</span>
              </Link>
              <Link href="/ponto-cego">
                <span style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "13px", fontWeight: 500,
                  color: location === "/ponto-cego" ? "#f39c12" : "rgba(255,255,255,0.55)",
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: location === "/ponto-cego" ? "rgba(243,156,18,0.1)" : "transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}>
                  <Eye size={13} />
                  Ponto Cego
                </span>
              </Link>
              <Link href="/metodologia">
                <span style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "13px", fontWeight: 500,
                  color: location === "/metodologia" ? "#ffffff" : "rgba(255,255,255,0.55)",
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: location === "/metodologia" ? "rgba(255,255,255,0.08)" : "transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}>
                  <BookOpen size={13} />
                  Metodologia
                </span>
              </Link>
              <Link href="/planos">
                <span style={{
                  fontSize: "13px", fontWeight: 500,
                  color: location === "/planos" ? "#ffffff" : "rgba(255,255,255,0.55)",
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: location === "/planos" ? "rgba(255,255,255,0.08)" : "transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}>
                  Planos
                </span>
              </Link>
            </nav>

            {/* Spacer on mobile */}
            <div className="mobile-spacer" style={{ flex: 1 }} />

            {/* Search — desktop full, mobile icon toggle */}
            <div className="search-desktop" style={{ flexShrink: 0 }}>
              <form onSubmit={handleSearch} style={{
                display: "flex", alignItems: "center", gap: "8px",
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px", padding: "6px 12px", minWidth: "200px",
                transition: "border-color 0.15s ease, background 0.15s ease",
              }}
              onFocus={() => {}}
              >
                <Search size={14} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Buscar notícias..."
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "#ffffff", fontSize: "13px", width: "100%",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                {searchValue && (
                  <button type="button" onClick={clearSearch}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0, display: "flex" }}>
                    <X size={13} />
                  </button>
                )}
              </form>
            </div>

            {/* Search icon — mobile only */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="mobile-search-btn"
              style={{
                background: "none", border: "none",
                cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "6px",
                flexShrink: 0, borderRadius: "6px",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Mobile search bar */}
          <div style={{
            overflow: "hidden",
            maxHeight: searchOpen ? "60px" : "0",
            transition: "max-height 0.25s cubic-bezier(0.23,1,0.32,1)",
          }} className="mobile-search-bar">
            <form onSubmit={handleSearch} style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "rgba(255,255,255,0.08)",
              margin: "0 1rem 10px",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px", padding: "9px 14px",
            }}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }} />
              <input
                ref={mobileSearchRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar notícias..."
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: "#ffffff", fontSize: "15px", width: "100%",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              {searchValue && (
                <button type="button" onClick={clearSearch}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0, display: "flex" }}>
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ── Category tabs ────────────────────────────────────────────────── */}
        <div
          className="category-tabs-scroll"
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e3df",
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}>
          <div style={{
            display: "flex", alignItems: "center",
            maxWidth: "1280px", margin: "0 auto",
            padding: "0 1rem",
            minWidth: "max-content",
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`category-tab${activeCategory === cat.id ? " active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
            {/* Ponto Cego tab on mobile */}
            <Link href="/ponto-cego" className="mobile-pontocego-tab">
              <button className={`category-tab${location === "/ponto-cego" ? " active" : ""}`}
                id="pontocego-tab">
                <Eye size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                Ponto Cego
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile menu drawer ───────────────────────────────────────────────── */}
      {/* Overlay */}
      <div
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 98,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      />
      {/* Drawer */}
      <div
        className="mobile-menu-btn"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "min(280px, 85vw)",
          backgroundColor: "#1a1a1a",
          zIndex: 99,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.23,1,0.32,1)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "16px", fontWeight: 700, color: "#ffffff",
            }}>Contextual</span>
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "16px", fontWeight: 700, color: "#f39c12", marginLeft: "5px",
            }}>News</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main nav */}
        <div style={{ padding: "8px 0" }}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 20px", fontSize: "15px", fontWeight: 500,
              color: location === "/" ? "#ffffff" : "rgba(255,255,255,0.65)",
              fontFamily: "'Inter', sans-serif", cursor: "pointer",
              backgroundColor: location === "/" ? "rgba(255,255,255,0.06)" : "transparent",
              transition: "background 0.1s ease",
            }}>
              <span>Início</span>
              {location === "/" && <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
            </div>
          </Link>
          <Link href="/ponto-cego" onClick={() => setMenuOpen(false)}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 20px", fontSize: "15px", fontWeight: 500,
              color: location === "/ponto-cego" ? "#f39c12" : "rgba(255,255,255,0.65)",
              fontFamily: "'Inter', sans-serif", cursor: "pointer",
              backgroundColor: location === "/ponto-cego" ? "rgba(243,156,18,0.06)" : "transparent",
              transition: "background 0.1s ease",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={15} />
                Ponto Cego
              </span>
              {location === "/ponto-cego" && <ChevronRight size={14} style={{ color: "rgba(243,156,18,0.4)" }} />}
            </div>
          </Link>
          <Link href="/metodologia" onClick={() => setMenuOpen(false)}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 20px", fontSize: "15px", fontWeight: 500,
              color: location === "/metodologia" ? "#ffffff" : "rgba(255,255,255,0.65)",
              fontFamily: "'Inter', sans-serif", cursor: "pointer",
              backgroundColor: location === "/metodologia" ? "rgba(255,255,255,0.06)" : "transparent",
              transition: "background 0.1s ease",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={15} />
                Metodologia
              </span>
              {location === "/metodologia" && <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
            </div>
          </Link>
          <Link href="/planos" onClick={() => setMenuOpen(false)}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 20px", fontSize: "15px", fontWeight: 500,
              color: location === "/planos" ? "#ffffff" : "rgba(255,255,255,0.65)",
              fontFamily: "'Inter', sans-serif", cursor: "pointer",
              backgroundColor: location === "/planos" ? "rgba(255,255,255,0.06)" : "transparent",
              transition: "background 0.1s ease",
            }}>
              <span>Planos</span>
              {location === "/planos" && <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", margin: "4px 0" }} />

        {/* Categories */}
        <div style={{ padding: "8px 0" }}>
          <p style={{
            padding: "6px 20px 4px", fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif",
          }}>
            Categorias
          </p>
          {CATEGORIES.map((cat) => (
            <div key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 20px", fontSize: "14px", fontWeight: 400,
                color: activeCategory === cat.id ? "#ffffff" : "rgba(255,255,255,0.5)",
                fontFamily: "'Inter', sans-serif", cursor: "pointer",
                backgroundColor: activeCategory === cat.id ? "rgba(255,255,255,0.05)" : "transparent",
                transition: "background 0.1s ease",
              }}>
              <span>{cat.label}</span>
              {activeCategory === cat.id && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#f39c12" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
