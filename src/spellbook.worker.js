import { chunkText } from "./chunker.js";
import { getEmbedding } from "./text-embedding.js";
import { spellSchema } from "./schema.js";

export async function handleUpload(request, env, ctx) {
  const body = await request.json();
  let { text, url, meta = {} } = body;

  // If url provided, fetch the raw text from it (basic fetch; extend for PDF/HTML as needed)
  if (!text && url) {
    if (url.endsWith(".pdf")) {
      throw new Error("PDF extraction should be handled upstream (use n8n or microservice).");
    } else {
      const resp = await fetch(url);
      text = await resp.text();
    }
  }
  if (!text) return new Response("No text provided.", { status: 400 });

  // Chunk the text
  const chunks = chunkText(text);

  // Embed and upsert each chunk
  let upserts = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await getEmbedding(chunk, env.OPENAI_API_KEY);

    // Metadata for each spell
    const spell = {
      id: `${meta.book_title || "unknown"}_${i}_${Date.now()}`,
      text: chunk,
      embedding,
      book_title: meta.book_title || "",
      author: meta.author || "",
      source_url: url || "",
      chunk_index: i,
      tags: meta.tags || [],
      format: meta.format || "plain"
    };

    // Validate (optional: using schema.js)
    if (!spellSchema(spell)) {
      return new Response(
        JSON.stringify({ error: "Schema validation failed", details: spell }),
        { status: 422 }
      );
    }

    // Upsert to Vectorize
    upserts.push(
      env.VECTORIZE.upsert([
        {
          id: spell.id,
          values: embedding,
          metadata: {
            text: chunk,
            book_title: spell.book_title,
            author: spell.author,
            source_url: spell.source_url,
            chunk_index: i,
            tags: spell.tags,
            format: spell.format
          }
        }
      ])
    );
  }

  await Promise.all(upserts);

  return new Response(JSON.stringify({ uploaded: chunks.length }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleSearch(request, env, ctx) {
  const body = await request.json();
  const { query, topK = 5 } = body;

  if (!query) return new Response("No query provided.", { status: 400 });

  const embedding = await getEmbedding(query, env.OPENAI_API_KEY);
  const results = await env.VECTORIZE.query({
    topK,
    vector: embedding,
    includeMetadata: true
  });

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}
