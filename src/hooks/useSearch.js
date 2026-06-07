import { useState, useCallback } from "react";
import { parseQuery } from "../services/openrouter";
import { properties } from "../data/properties";

const TAG_KEYWORD_MAP = {
  school: ["school", "dps", "euro", "lotus", "shiv nadar"],
  metro: ["metro", "rapid metro", "huda"],
  park: ["park", "green", "garden"],
  hospital: ["hospital", "medanta", "fortis"],
  sunlight: ["sunlight", "sun", "light", "bright", "sunny"],
  vastu: ["vastu"],
  "corner-unit": ["corner", "corner unit"],
  "high-floor": ["high floor", "top floor"],
  gated: ["gated", "society", "gated society"],
  "new-construction": ["new", "new construction", "fresh", "brand new"],
  furnished: ["furnished", "fully furnished", "semi-furnished"],
};

function scoreProperty(property, filters) {
  let score = 0;
  const reasons = [];

  if (filters.bhk && property.bhk === filters.bhk) {
    score += 40;
    reasons.push(`${property.bhk}BHK as requested`);
  }

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    const propLoc = `${property.sector} ${property.locality}`.toLowerCase();
    if (propLoc.includes(loc) || loc.includes(property.sector.toLowerCase().replace("sector ", ""))) {
      score += 35;
      reasons.push(`in ${property.sector}`);
    }
  }

  const priceInLakhs =
    property.priceUnit === "Crores" ? property.price * 100 : property.price;

  if (filters.maxPrice && priceInLakhs <= filters.maxPrice) {
    score += 25;
    reasons.push(`within ₹${filters.maxPrice}L budget`);
  } else if (filters.maxPrice && priceInLakhs > filters.maxPrice) {
    score -= 30;
  }

  if (filters.minPrice && priceInLakhs >= filters.minPrice) {
    score += 5;
  }

  // Amenity matching
  const allAmenityText = [...property.amenities, ...property.tags].join(" ").toLowerCase();
  (filters.amenities || []).forEach((amenity) => {
    const keywords = TAG_KEYWORD_MAP[amenity] || [amenity];
    if (keywords.some((kw) => allAmenityText.includes(kw))) {
      score += 15;
      if (amenity === "school") reasons.push("school nearby");
      else if (amenity === "metro") reasons.push("metro access");
      else if (amenity === "park") reasons.push("park-facing");
      else if (amenity === "hospital") reasons.push("hospital close");
    }
  });

  // Preference matching
  (filters.preferences || []).forEach((pref) => {
    const prefLower = pref.toLowerCase();
    const keywords = TAG_KEYWORD_MAP[prefLower] || [prefLower];
    if (keywords.some((kw) => allAmenityText.includes(kw) || property.facing?.toLowerCase().includes(kw))) {
      score += 12;
      if (prefLower === "sunlight" || prefLower.includes("sun")) reasons.push("great sunlight");
      else if (prefLower === "vastu") reasons.push("vastu compliant");
      else if (prefLower.includes("corner")) reasons.push("corner unit");
    }
  });

  // Keyword fallback
  (filters.keywords || []).forEach((kw) => {
    if (allAmenityText.includes(kw.toLowerCase())) {
      score += 8;
    }
  });

  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(null);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | parsing | results | error
  const [errorMsg, setErrorMsg] = useState("");
  const [noApiKey, setNoApiKey] = useState(false);

  const search = useCallback(async (rawQuery) => {
    if (!rawQuery.trim()) return;
    setStatus("parsing");
    setErrorMsg("");
    setNoApiKey(false);

    try {
      const parsed = await parseQuery(rawQuery);
      setFilters(parsed);

      const scored = properties.map((p) => {
        const { score, reasons } = scoreProperty(p, parsed);
        return { ...p, score, reasons };
      });

      const sorted = scored
        .filter((p) => p.score >= 0)
        .sort((a, b) => b.score - a.score);

      setResults(sorted);
      setStatus("results");
    } catch (err) {
      if (err.message === "NO_API_KEY") {
        setNoApiKey(true);
        setStatus("error");
      } else {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setFilters(null);
    setResults([]);
    setStatus("idle");
    setErrorMsg("");
    setNoApiKey(false);
  }, []);

  return { query, setQuery, filters, results, status, errorMsg, noApiKey, search, reset };
}
