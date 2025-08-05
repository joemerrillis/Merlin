import { handleUpload, handleSearch } from "./spellbook.worker.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/spellbook/upload" && request.method === "POST") {
        return await handleUpload(request, env, ctx);
      }
      if (url.pathname === "/spellbook/search" && request.method === "POST") {
        return await handleSearch(request, env, ctx);
      }
      return new Response("Not found", { status: 404 });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message, stack: err.stack }),
        { status: 500 }
      );
    }
  },
};
