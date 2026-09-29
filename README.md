# 360 Ghar AI Property Search

A React + Vite prototype that uses natural-language queries to filter a small set of mock Gurgaon property listings. It also generates short AI explanations for selected listings.

## Run locally

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Configure an OpenRouter API key using the app's supported setup before trying AI-backed query parsing or summaries. There is no hosted public demo.

## How it works

- The frontend sends a natural-language query to an LLM and parses the response into property filters.
- The app scores the mock property dataset against those filters and displays matching cards.
- A selected card can request a short AI-generated match explanation.

## Limitations and security

This is a prototype over mock listings, not a live property inventory. Confirm all property facts independently. LLM requests are made from the browser; any key embedded in the app or entered at runtime is visible to the browser and should be treated as exposed. Do not publish a personal or unrestricted API key in a public frontend. A production version should use a server-side proxy with rate limits.
