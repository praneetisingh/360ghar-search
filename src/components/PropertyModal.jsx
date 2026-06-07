import { useState, useEffect, useRef } from "react";
import { generatePropertySummary } from "../services/openrouter";

export default function PropertyModal({ property, userQuery, onClose }) {
  const [summary, setSummary] = useState("");
  const [summaryStatus, setSummaryStatus] = useState("idle"); // idle | loading | done | error
  const backdropRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);

    // Trigger AI summary
    setSummaryStatus("loading");
    generatePropertySummary(userQuery, property)
      .then((text) => {
        setSummary(text);
        setSummaryStatus("done");
      })
      .catch(() => {
        setSummaryStatus("error");
      });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [property.id]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const priceDisplay =
    property.priceUnit === "Crores"
      ? `₹${property.price} Crore`
      : `₹${property.price} Lakhs`;

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Property details for ${property.title}`}
    >
      <div className="modal-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-image-wrap">
          <img src={property.image} alt={property.title} className="modal-image" />
          <div className="modal-badge-360">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            360° Tour Available
          </div>
        </div>

        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2 className="modal-title">{property.title}</h2>
              <p className="modal-subtitle">
                {property.sector} · {property.locality}, {property.city}
              </p>
            </div>
            <div className="modal-price-block">
              <span className="modal-price">{priceDisplay}</span>
              <span className="modal-per-sqft">
                ₹{Math.round(
                  ((property.priceUnit === "Crores" ? property.price * 100 : property.price) * 100000) /
                    property.area
                ).toLocaleString()}/sq ft
              </span>
            </div>
          </div>

          <div className="modal-specs-grid">
            {[
              { label: "Configuration", value: `${property.bhk} BHK` },
              { label: "Area", value: `${property.area.toLocaleString()} sq ft` },
              { label: "Floor", value: property.floor },
              { label: "Facing", value: property.facing },
              { label: "Age", value: property.age },
              { label: "Furnishing", value: property.furnished },
              { label: "Possession", value: property.possession },
            ].map(({ label, value }) => (
              <div key={label} className="spec-item">
                <span className="spec-label">{label}</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>

          <div className="modal-amenities">
            <h4 className="modal-section-title">Key Amenities</h4>
            <div className="amenity-list">
              {property.amenities.map((a, i) => (
                <span key={i} className="amenity-tag">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-ai-section">
            <div className="ai-section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              Why this matches your search
            </div>

            {summaryStatus === "loading" && (
              <div className="ai-loading">
                <div className="ai-loading-bar" />
                <div className="ai-loading-bar short" />
                <div className="ai-loading-bar medium" />
              </div>
            )}
            {summaryStatus === "done" && (
              <p className="ai-summary-text">{summary}</p>
            )}
            {summaryStatus === "error" && (
              <p className="ai-summary-error">
                {property.description}
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn-primary" id="contact-agent-btn">Contact Agent</button>
            <button className="btn-secondary" id="schedule-visit-btn">Schedule Visit</button>
            <button className="btn-ghost" id="share-property-btn" onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("property", property.id);
              navigator.clipboard.writeText(url.toString()).catch(() => {});
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
