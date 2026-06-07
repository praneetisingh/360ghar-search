export default function PropertyCard({ property, onSelect, style }) {
  const priceDisplay =
    property.priceUnit === "Crores"
      ? `₹${property.price} Cr`
      : `₹${property.price} L`;

  const matchPercent = Math.min(100, Math.max(10, Math.round((property.score / 120) * 100)));

  return (
    <article
      className="property-card"
      style={style}
      onClick={() => onSelect(property)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(property)}
      aria-label={`${property.bhk}BHK at ${property.title}, ${property.sector}`}
    >
      <div className="card-image-wrap">
        <img
          src={property.image}
          alt={`${property.title} interior`}
          className="card-image"
          loading="lazy"
        />
        <div className="card-badge-360">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          360°
        </div>
        <div className="card-possession">{property.possession}</div>
      </div>

      <div className="card-body">
        <div className="card-top-row">
          <div>
            <h3 className="card-title">{property.title}</h3>
            <p className="card-location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {property.sector}, {property.city}
            </p>
          </div>
          <div className="card-price-block">
            <span className="card-price">{priceDisplay}</span>
          </div>
        </div>

        <div className="card-specs">
          <span className="spec-pill">{property.bhk} BHK</span>
          <span className="spec-pill">{property.area.toLocaleString()} sq ft</span>
          <span className="spec-pill">{property.facing}-facing</span>
          <span className="spec-pill">{property.floor}</span>
        </div>

        {property.reasons && property.reasons.length > 0 && (
          <div className="card-match-row">
            {property.reasons.map((r, i) => (
              <span key={i} className="match-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                {r}
              </span>
            ))}
          </div>
        )}

        {property.score !== undefined && (
          <div className="card-match-score">
            <div className="match-bar-bg">
              <div className="match-bar-fill" style={{ width: `${matchPercent}%` }} />
            </div>
            <span className="match-pct">{matchPercent}% match</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-furnished">{property.furnished}</span>
        <button className="card-cta" tabIndex={-1}>View Details →</button>
      </div>
    </article>
  );
}
