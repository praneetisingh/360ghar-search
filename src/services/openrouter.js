// OpenRouter API service
const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

function getApiKey() {
  return (
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    window.__OPENROUTER_KEY ||
    sessionStorage.getItem("OPENROUTER_API_KEY") ||
    ""
  );
}

// Parse natural language query into structured filters
export async function parseQuery(userQuery) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const systemPrompt = `You are a real estate query parser for an Indian property platform in Gurgaon, NCR.
Extract structured filters from natural language property search queries.
Return ONLY valid JSON with exactly these fields (use null if not mentioned):
{
  "location": string | null,
  "bhk": number | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "amenities": string[],
  "preferences": string[],
  "keywords": string[]
}
Price values should be in Lakhs (e.g. "80 lakhs" = 80, "1.5 crore" = 150).
Amenities examples: "school", "metro", "park", "hospital", "market", "gym", "pool".
Preferences examples: "sunlight", "vastu", "corner unit", "high floor", "gated", "furnished", "new construction".
Return only the JSON object, no explanation.`;

  const response = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://360ghar.com",
      "X-Title": "360 Ghar Property Search",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: 0.1,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";

  // Strip markdown code fences if model wraps them
  const cleaned = raw.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

// Generate a personalised property summary
export async function generatePropertySummary(userQuery, property) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const systemPrompt = `You are a helpful real estate consultant for 360 Ghar, a premium property platform in Gurgaon.
Write a warm, personalised 2–3 sentence summary (under 65 words) explaining why this specific property matches what the buyer was looking for.
Be specific — reference matching attributes by name. Do not use bullet points. Do not start with "This property". Write naturally, as if you know the buyer.`;

  const propertyDetails = `${property.bhk}BHK at ${property.title}, ${property.sector}, ₹${property.price} ${property.priceUnit}. Floor: ${property.floor}. Facing: ${property.facing}. Tags: ${property.tags.join(", ")}. Amenities: ${property.amenities.join(", ")}.`;

  const userMessage = `Buyer's search: "${userQuery}"\nProperty: ${propertyDetails}`;

  const response = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://360ghar.com",
      "X-Title": "360 Ghar Property Summary",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}
