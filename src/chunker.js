// src/chunker.js

const MAX_CHUNK_LENGTH = 1800;      // ~700 tokens; tweak as needed
const CHUNK_OVERLAP = 200;          // chars of overlap between chunks

// Split text into paragraphs (by blank lines)
function splitIntoParagraphs(text) {
  return text
    .replace(/\r\n/g, '\n') // Normalize newlines
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean);
}

// Main chunker: merges paragraphs up to length, with overlap between chunks
export function chunkText(text) {
  const paragraphs = splitIntoParagraphs(text);
  const chunks = [];
  let chunk = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];

    // If adding this paragraph exceeds limit, finalize the current chunk
    if ((chunk + '\n\n' + para).length > MAX_CHUNK_LENGTH) {
      if (chunk) {
        chunks.push(chunk.trim());
        // Start next chunk with overlap from previous
        chunk = chunk.slice(-CHUNK_OVERLAP) + '\n\n' + para;
      } else {
        // Paragraph itself is longer than max, just split at max length
        let start = 0;
        while (start < para.length) {
          const subChunk = para.slice(start, start + MAX_CHUNK_LENGTH);
          chunks.push(subChunk.trim());
          start += MAX_CHUNK_LENGTH - CHUNK_OVERLAP; // overlap
        }
        chunk = '';
      }
    } else {
      chunk += (chunk ? '\n\n' : '') + para;
    }
  }
  if (chunk.trim().length > 0) {
    chunks.push(chunk.trim());
  }
  return chunks;
}
