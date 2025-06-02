
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const port = Number(Deno.env.get("PORT")) || 8080;

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  console.log(`Request: ${request.method} ${url.pathname}`);
  
  // Try to serve static files first
  try {
    const response = await serveDir(request, {
      fsRoot: "./dist",
      quiet: true,
    });
    
    // If file exists and is found, serve it
    if (response.status !== 404) {
      console.log(`Serving static file: ${url.pathname}`);
      return response;
    }
  } catch (error) {
    console.error("Error serving static file:", error);
  }
  
  // For all other routes (SPA fallback), serve index.html
  try {
    console.log(`SPA fallback for: ${url.pathname}`);
    const indexFile = await Deno.readFile("./dist/index.html");
    return new Response(indexFile, {
      status: 200,
      headers: { 
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache"
      },
    });
  } catch (error) {
    console.error("Error reading index.html:", error);
    return new Response("Application files not found. Please ensure the app is built correctly.", { 
      status: 404,
      headers: { "content-type": "text/plain" }
    });
  }
}

console.log(`Server starting on port ${port}`);
console.log(`Serving files from: ./dist`);

// Check if dist directory exists
try {
  const distInfo = await Deno.stat("./dist");
  console.log(`Dist directory exists: ${distInfo.isDirectory}`);
  
  // Check if index.html exists
  const indexInfo = await Deno.stat("./dist/index.html");
  console.log(`Index.html exists: ${indexInfo.isFile}`);
} catch (error) {
  console.error("Warning: Could not verify dist directory or index.html:", error.message);
  console.log("Make sure to run 'npm run build' before starting the server");
}

// Use modern Deno.serve API (compatible with Deno Deploy)
Deno.serve({ port }, handler);
