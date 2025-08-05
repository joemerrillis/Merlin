# Merlin Spellbook

A Cloudflare Worker + Vectorize-powered knowledge ingestion and search API.  
Supports uploading and chunking books, essays, and more (plain/markdown/HTML).  
Add PDF/other format extraction as a pre-processing step (n8n or Node.js microservice).

## Endpoints

- `POST /spellbook/upload` — `{ text, url, meta }`
- `POST /spellbook/search` — `{ query, topK }`

## Notes
- For PDFs, extract text in n8n before calling `/upload`.
- You can extend chunking/metadata logic per format.
- OpenAI API key required for embeddings.
- Add Gemini/local model support easily in `text-embedding.js`.
