export async function getEmbedding(text, openaiKey) {
  // You may want to cache, batch, or throttle in production.
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002" // Or your preferred embedding model
    })
  });
  if (!res.ok) throw new Error("Embedding fetch failed: " + (await res.text()));
  const data = await res.json();
  return data.data[0].embedding;
}
