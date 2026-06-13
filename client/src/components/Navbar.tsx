import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, Eye, Menu, BookOpen } from "lucide-react";

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
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (onSearch) {
      onSearch(q);
    } else if (q) {
      // Navigate to dedicated search page
      navigate(`/busca?q=${encodeURIComponent(q)}`);
    }
    setSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchValue("");
    if (onSearch) onSearch("");
  };

  const handleCategoryClick = (id: string) => {
    onCategoryChange?.(id);
    setMenuOpen(false);
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {/* ── Main navbar ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          display: "flex", alignItems: "center",
          height: "52px", maxWidth: "1280px",
          margin: "0 auto", padding: "0 1rem", gap: "8px",
        }}>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#ffffff", padding: "4px", flexShrink: 0,
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/">
            <div style={{
              display: "flex", alignItems: "baseline", gap: 0,
              cursor: "pointer", flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "18px", fontWeight: 700, color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>Viés</span>
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "18px", fontWeight: 700, color: "#f39c12",
                letterSpacing: "-0.02em", marginLeft: "5px",
              }}>Brasil</span>
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
              }}>
                <BookOpen size={13} />
                Metodologia
              </span>
            </Link>
          </nav>

          {/* Spacer on mobile */}
          <div className="mobile-spacer" style={{ flex: 1 }} />

          {/* Search — desktop full, mobile icon toggle */}
          <div className="search-desktop" style={{ flexShrink: 0 }}>
            <form onSubmit={handleSearch} style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "6px", padding: "6px 12px", minWidth: "200px",
            }}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
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
              cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px", flexShrink: 0,
            }}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* Mobile search bar (expands below header) */}
        {searchOpen && (
          <div className="mobile-search-bar" style={{
            padding: "8px 1rem 10px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            <form onSubmit={handleSearch} style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "6px", padding: "8px 12px",
            }}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar notícias..."
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: "#ffffff", fontSize: "14px", width: "100%",
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
        )}
      </div>

      {/* ── Category tabs ────────────────────────────────────────────────────── */}
      <div style={{
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

      {/* ── Mobile menu overlay ──────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 52, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 99,
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            backgroundColor: "#1a1a1a", padding: "16px 0",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }} onClick={(e) => e.stopPropagation()}>
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <div style={{
                padding: "12px 20px", fontSize: "15px", fontWeight: 500,
                color: location === "/" ? "#ffffff" : "rgba(255,255,255,0.7)",
                fontFamily: "'Inter', sans-serif", cursor: "pointer",
                backgroundColor: location === "/" ? "rgba(255,255,255,0.06)" : "transparent",
              }}>Início</div>
            </Link>
            <Link href="/ponto-cego" onClick={() => setMenuOpen(false)}>
              <div style={{
                padding: "12px 20px", fontSize: "15px", fontWeight: 500,
                color: location === "/ponto-cego" ? "#f39c12" : "rgba(255,255,255,0.7)",
                fontFamily: "'Inter', sans-serif", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8,
              }}>
                <Eye size={15} />
                Ponto Cego
              </div>
            </Link>
            <Link href="/metodologia" onClick={() => setMenuOpen(false)}>
              <div style={{
                padding: "12px 20px", fontSize: "15px", fontWeight: 500,
                color: location === "/metodologia" ? "#ffffff" : "rgba(255,255,255,0.7)",
                fontFamily: "'Inter', sans-serif", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8,
              }}>
                <BookOpen size={15} />
                Metodologia
              </div>
            </Link>
            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "8px 0" }} />
            {CATEGORIES.map((cat) => (
              <div key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  padding: "11px 20px", fontSize: "14px", fontWeight: 400,
                  color: activeCategory === cat.id ? "#ffffff" : "rgba(255,255,255,0.55)",
                  fontFamily: "'Inter', sans-serif", cursor: "pointer",
                  backgroundColor: activeCategory === cat.id ? "rgba(255,255,255,0.06)" : "transparent",
                }}>
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
