export default function FilterChips({ filters }) {
  if (!filters) return null;

  const chips = [];

  if (filters.bhk) chips.push({ label: `${filters.bhk} BHK`, type: "primary" });
  if (filters.location) chips.push({ label: filters.location, type: "primary" });
  if (filters.maxPrice) chips.push({ label: `Under ₹${filters.maxPrice}L`, type: "primary" });
  if (filters.minPrice) chips.push({ label: `Above ₹${filters.minPrice}L`, type: "primary" });
  (filters.amenities || []).forEach((a) =>
    chips.push({ label: a.charAt(0).toUpperCase() + a.slice(1), type: "secondary" })
  );
  (filters.preferences || []).forEach((p) =>
    chips.push({ label: p.charAt(0).toUpperCase() + p.slice(1), type: "secondary" })
  );

  if (!chips.length) return null;

  return (
    <div className="filter-chips-row">
      <span className="filter-chips-label">Understood:</span>
      {chips.map((c, i) => (
        <span key={i} className={`filter-chip filter-chip--${c.type}`}>
          {c.label}
        </span>
      ))}
    </div>
  );
}
