# 360 Ghar — AI Property Search Assistant

A smart property search prototype for [360 Ghar](https://360ghar.com), built with React + Vite and powered by OpenRouter's free LLM tier.

## Live Demo

> Run locally with `npm run dev`

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your API key
cp .env.example .env.local
# Edit .env.local and paste your OpenRouter key

# 3. Start the dev server
npm run dev
```

**Don't have a key?** Get a free one at [openrouter.ai](https://openrouter.ai) — no credit card needed. You can also enter it in the app UI at runtime without touching any files.

---

## Features

| Feature | Description |
|---------|-------------|
| **Natural Language Search** | Type anything — "2BHK in Sector 50 under 80 lakhs near a school" — the LLM parses it into structured filters |
| **Parsed Filter Display** | Shows what the AI understood as labelled chips below the search bar |
| **Property Cards** | Ranked and scored against parsed filters, with match percentage bars and contextual match badges |
| **AI Property Summary** | Click any card → live LLM call generates a personalised 2–3 line explanation of why it matches your query |
| **Voice Input** | Microphone button uses the browser Web Speech API — speak your query hands-free |

---

## LLM Model

**Primary:** `google/gemma-3-27b-it:free`

Selected because it follows structured JSON output instructions reliably on the free tier and handles Indian real estate vocabulary (sector names, lakh/crore units, vastu, etc.) without hallucination.

---

## Architecture

```
src/
├── data/properties.js       — 10 mock properties across Gurgaon sectors
├── services/openrouter.js   — LLM API calls (parseQuery, generatePropertySummary)
├── hooks/useSearch.js       — Search state + filter-to-property scoring logic
└── components/
    ├── SearchBar.jsx         — Text input + voice button + example chips
    ├── FilterChips.jsx       — Parsed filter pills
    ├── PropertyGrid.jsx      — Grid layout
    ├── PropertyCard.jsx      — Card with match badge + score bar
    └── PropertyModal.jsx     — Detail view + live AI summary
```

All LLM calls are made directly from the frontend — no backend needed for this prototype.

---

## Prompt Design Notes

### Query Parsing Prompt

The system prompt instructs the model to return **only valid JSON** with exactly seven named fields. Key decisions:

- **Strict JSON-only output** — no explanation, no markdown fences in theory, but the parser strips code fences defensively because free models sometimes wrap output anyway.
- **Price normalisation instruction** — explicitly told to convert crores to lakhs (1 Cr = 100 L) so the scoring logic works on a single unit.
- **Separate `amenities` vs `preferences`** — amenities are physical nearby features (school, metro, park); preferences are apartment-level qualities (sunlight, vastu, corner unit). This split lets the scoring function weight them differently.
- **Low temperature (0.1)** — deterministic output matters more than creativity for parsing.

### Summary Generation Prompt

- **Persona anchoring** — "You are a helpful real estate consultant for 360 Ghar" grounds the tone as warm and conversational, not robotic.
- **Hard word limit** — "under 65 words" keeps it readable as a card insert. Without this, models over-explain.
- **Specificity instruction** — "reference matching attributes by name" prevents generic filler like "this property suits your needs". It forces the model to mention DPS, or Sector 50, or east-facing.
- **Higher temperature (0.7)** — summaries benefit from slightly varied phrasing across properties.

### What Didn't Work

- Asking for JSON + explanation in the same response → parsing became fragile. Strict JSON-only is cleaner.
- Using `keywords` as the primary match field → too loose. `bhk`, `location`, and `maxPrice` need to be explicit fields with heavy scoring weight.
- Using the model name without `:free` suffix → returns a model-not-found error on the free tier.

---

## Bonus Feature: Voice Input

The browser Web Speech API (`SpeechRecognition`) captures the user's spoken query and auto-triggers the search. The language is set to `en-IN` so it handles Indian English pronunciations of sector names and terms like "lakh", "crore", and "vastu" correctly. A waveform animation plays while listening to give clear visual feedback.

---

## Data

10 mock properties across: Sector 50, 43, 56, 57, 48, 62, 65, 82, 92, 108.  
BHK range: 1–4. Price range: ₹42L – ₹2.8Cr.  
All Gurgaon sector data, school distances, and amenities are realistic (though mock).
