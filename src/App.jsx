import { useState } from "react";
import { useSearch } from "./hooks/useSearch";
import SearchBar from "./components/SearchBar";
import FilterChips from "./components/FilterChips";
import PropertyGrid from "./components/PropertyGrid";
import PropertyModal from "./components/PropertyModal";
import { properties } from "./data/properties";

export default function App() {
  const { query, setQuery, filters, results, status, errorMsg, noApiKey, search, reset } = useSearch();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiEntry, setShowApiEntry] = useState(false);

  const handleApiKeySave = () => {
    // Store in sessionStorage for runtime use
    sessionStorage.setItem("OPENROUTER_API_KEY", apiKeyInput);
    window.__OPENROUTER_KEY = apiKeyInput;
    setShowApiEntry(false);
    if (query) search(query);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-mark">
            <span className="logo-360">360</span>
            <span className="logo-ghar">Ghar</span>
            <span className="logo-dot" />
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-link">Properties</a>
            <a href="#" className="nav-link">VR Tours</a>
            <a href="#" className="nav-link">Agents</a>
          </nav>
          <div className="header-right">
            <span className="header-location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Gurgaon
            </span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-eyebrow">AI-Powered Property Search</div>
          <h1 className="hero-headline">
            Find your home<br />in plain language
          </h1>
          <p className="hero-sub">
            Describe what you're looking for. Our AI understands context, not just keywords.
          </p>

          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={search}
            onReset={reset}
            status={status}
          />

          {/* No API Key Notice */}
          {noApiKey && !showApiEntry && (
            <div className="api-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              OpenRouter API key not set.{" "}
              <button className="inline-link" onClick={() => setShowApiEntry(true)}>
                Enter key to enable AI search
              </button>
            </div>
          )}

          {showApiEntry && (
            <div className="api-key-entry">
              <p className="api-key-hint">
                Get a free key at{" "}
                <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
                  openrouter.ai
                </a>{" "}
                — no credit card needed.
              </p>
              <div className="api-key-row">
                <input
                  type="password"
                  placeholder="sk-or-v1-…"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="api-key-input"
                  id="api-key-input"
                  onKeyDown={(e) => e.key === "Enter" && handleApiKeySave()}
                />
                <button className="btn-primary small" onClick={handleApiKeySave}>
                  Save & Search
                </button>
              </div>
            </div>
          )}

          {status === "error" && errorMsg && (
            <p className="error-notice">{errorMsg}</p>
          )}
        </section>

        {/* Filter Pills */}
        {filters && <FilterChips filters={filters} />}

        {/* Results */}
        {status === "results" && results.length > 0 && (
          <PropertyGrid results={results} onSelect={setSelectedProperty} />
        )}

        {status === "results" && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏗</div>
            <h3>No properties matched</h3>
            <p>Try adjusting your search — broaden the location or budget range.</p>
            <button className="btn-secondary" onClick={reset}>Clear search</button>
          </div>
        )}

        {/* Idle / Landing state */}
        {status === "idle" && (
          <section className="landing-properties">
            <div className="landing-header">
              <p className="landing-label">Featured in Gurgaon</p>
            </div>
            <PropertyGrid
              results={properties.slice(0, 6).map((p) => ({ ...p, score: undefined, reasons: [] }))}
              onSelect={setSelectedProperty}
            />
          </section>
        )}
      </main>

      {/* Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          userQuery={query || "property in Gurgaon"}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">360 Ghar</span>
          <span className="footer-note">India's AI & VR Real Estate Platform · Gurgaon, NCR</span>
        </div>
      </footer>
    </div>
  );
}
