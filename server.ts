
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const port = Number(Deno.env.get("PORT")) || 8080;

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Try to serve the requested file
  const response = await serveDir(request, {
    fsRoot: "./dist",
    quiet: true,
  });
  
  // If file not found and it's not an API route, serve index.html (SPA fallback)
  if (response.status === 404 && !url.pathname.startsWith("/api/")) {
    try {
      const indexFile = await Deno.readFile("./dist/index.html");
      return new Response(indexFile, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }
  
  return response;
}

console.log(`Server running on port ${port}`);
await serve(handler, { port });
