import { encoding_for_model } from "js-tiktoken";

// This can use GPT-3.5/4 token encoding; adjust as needed.
const enc = encoding_for_model("gpt-3.5-turbo");
const MAX_TOKENS = 700;   // Safe for most embedding models.
const OVERLAP = 2;        // Number of overlapping sentences.

function splitIntoParagraphs(text) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

// Basic tokenizer using tiktoken
function countTokens(text) {
  return enc.encode(text).length;
}

export function chunkText(text) {
  const paragraphs = splitIntoParagraphs(text);
  const chunks = [];
  let chunk = "";
  let chunkTokens = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const pTokens = countTokens(p);

    if (chunkTokens + pTokens > MAX_TOKENS) {
      if (chunk) chunks.push(chunk.trim());
      // Overlap: start next chunk with last N sentences of previous
      const prevSentences = chunk.split(/\. /).slice(-OVERLAP).join('. ');
      chunk = prevSentences + '\n\n' + p;
      chunkTokens = countTokens(chunk);
    } else {
      chunk += '\n\n' + p;
      chunkTokens += pTokens;
    }
  }
  if (chunk.trim().length > 0) chunks.push(chunk.trim());
  return chunks;
}
