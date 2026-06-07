import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ results, onSelect }) {
  return (
    <section className="property-grid-section">
      <div className="grid-header">
        <p className="grid-count">
          {results.length} {results.length === 1 ? "property" : "properties"} found
        </p>
      </div>
      <div className="property-grid">
        {results.map((p, i) => (
          <PropertyCard
            key={p.id}
            property={p}
            onSelect={onSelect}
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </section>
  );
}
