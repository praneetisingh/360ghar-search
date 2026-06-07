import { useState, useRef, useEffect } from "react";

export default function SearchBar({ query, setQuery, onSearch, onReset, status }) {
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN";
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setQuery(transcript);
        setListening(false);
        // Auto search after voice input
        setTimeout(() => onSearch(transcript), 100);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch(query);
    if (e.key === "Escape") onReset();
  };

  const isParsing = status === "parsing";

  return (
    <div className="search-bar-wrapper">
      <div className={`search-bar ${listening ? "listening" : ""} ${isParsing ? "parsing" : ""}`}>
        <div className="search-icon">
          {isParsing ? (
            <span className="parse-dots">
              <span /><span /><span />
            </span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your ideal home — 2BHK in Sector 50 under 80 lakhs, near a school…"
          disabled={isParsing}
          className="search-input"
          id="main-search-input"
        />

        {query && !isParsing && (
          <button className="clear-btn" onClick={onReset} aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {voiceSupported && (
          <button
            className={`voice-btn ${listening ? "active" : ""}`}
            onClick={handleVoice}
            aria-label={listening ? "Stop listening" : "Search by voice"}
            title={listening ? "Tap to stop" : "Search by voice"}
          >
            {listening ? (
              <span className="voice-wave">
                <span /><span /><span /><span /><span />
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </button>
        )}

        <button
          className="search-submit"
          onClick={() => onSearch(query)}
          disabled={isParsing || !query.trim()}
          id="search-submit-btn"
        >
          {isParsing ? "Parsing…" : "Search"}
        </button>
      </div>

      {listening && (
        <p className="voice-hint">Listening… speak now</p>
      )}

      <div className="search-examples">
        <span className="examples-label">Try:</span>
        {[
          "3BHK in Sector 57 near a school",
          "2BHK under 75 lakhs, good sunlight",
          "luxury 4BHK in Nirvana Country",
        ].map((ex) => (
          <button
            key={ex}
            className="example-chip"
            onClick={() => { setQuery(ex); onSearch(ex); }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
