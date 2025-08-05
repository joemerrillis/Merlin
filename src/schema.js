export function spellSchema(obj) {
  return (
    typeof obj.id === "string" &&
    typeof obj.text === "string" &&
    Array.isArray(obj.embedding) &&
    typeof obj.chunk_index === "number"
  );
}
