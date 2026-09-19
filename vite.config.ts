import { request as httpRequest } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const SNAPSHOT_PATH = new RegExp(`^/kb-api/accounts/(${UUID})/market-data/snapshot$`);
const MAX_RESPONSE_BYTES = 1_048_576;

export function kbReadProxy(backendPort: number): Plugin {
  if (!Number.isInteger(backendPort) || backendPort < 1 || backendPort > 65_535) {
    throw new Error("KB_MARKET_BACKEND_PORT must be a valid numeric port");
  }
  return {
    name: "kb-read-proxy",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const rawUrl = request.url ?? "";
        if (!rawUrl.startsWith("/kb-api")) {
          next();
          return;
        }
        const target = validateKbRead(request.method, rawUrl);
        if (!target.ok) {
          sendJson(response, target.status, { error: { code: target.code } });
          return;
        }

        const headers: Record<string, string> = { accept: "application/json" };
        if (typeof request.headers.origin === "string") {
          headers.origin = request.headers.origin;
        }
        const upstream = httpRequest(
          {
            host: "127.0.0.1",
            port: backendPort,
            method: "GET",
            path: target.path,
            headers,
          },
          (upstreamResponse) => {
            const status = upstreamResponse.statusCode ?? 502;
            if ((status >= 300 && status < 400) || upstreamResponse.headers.location) {
              upstreamResponse.resume();
              sendJson(response, 502, { error: { code: "upstream_redirect" } });
              return;
            }
            const contentType = upstreamResponse.headers["content-type"];
            if (typeof contentType !== "string" || !contentType.startsWith("application/json")) {
              upstreamResponse.resume();
              sendJson(response, 502, { error: { code: "invalid_upstream_response" } });
              return;
            }
            const chunks: Buffer[] = [];
            let bytes = 0;
            upstreamResponse.on("data", (chunk: Buffer) => {
              bytes += chunk.length;
              if (bytes > MAX_RESPONSE_BYTES) {
                upstreamResponse.destroy(new Error("KB response exceeded size limit"));
                return;
              }
              chunks.push(chunk);
            });
            upstreamResponse.on("end", () => {
              if (bytes > MAX_RESPONSE_BYTES || response.writableEnded) return;
              response.writeHead(status, {
                "cache-control": "no-store",
                "content-type": "application/json",
                "x-content-type-options": "nosniff",
              });
              response.end(Buffer.concat(chunks));
            });
            upstreamResponse.on("error", () => {
              if (!response.writableEnded) {
                sendJson(response, 502, { error: { code: "invalid_upstream_response" } });
              }
            });
          },
        );
        upstream.setTimeout(15_000, () => {
          upstream.destroy();
          if (!response.writableEnded) {
            sendJson(response, 504, { error: { code: "upstream_timeout" } });
          }
        });
        upstream.on("error", () => {
          if (!response.writableEnded) {
            sendJson(response, 502, { error: { code: "upstream_unavailable" } });
          }
        });
        request.on("aborted", () => upstream.destroy());
        upstream.end();
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "kb" ? [kbReadProxy(readBackendPort())] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@propsim/types": path.resolve(__dirname, "./src/vendor/types.ts"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router") ||
              id.includes("/@radix-ui/") ||
              id.includes("/@tanstack/") ||
              id.includes("/zustand/") ||
              id.includes("/scheduler/")
            ) {
              return "vendor-react";
            }
            if (id.includes("/lucide-react/")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
  server:
    mode === "kb"
      ? { port: 5173 }
      : {
          port: 5173,
          proxy: {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true,
            },
            "/ws": {
              target: "ws://localhost:3000",
              ws: true,
            },
          },
        },
}));

function validateKbRead(
  method: string | undefined,
  rawUrl: string,
): { ok: true; path: string } | { ok: false; status: number; code: string } {
  if (method !== "GET") return denied(405, "method_not_allowed");
  if (/%(?![0-9a-f]{2})/i.test(rawUrl)) return denied(400, "invalid_path");

  const queryStart = rawUrl.indexOf("?");
  const rawPath = queryStart === -1 ? rawUrl : rawUrl.slice(0, queryStart);
  const rawQuery = queryStart === -1 ? "" : rawUrl.slice(queryStart + 1);
  if (/%(?:2f|5c)/i.test(rawPath)) return denied(400, "invalid_path");

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return denied(400, "invalid_path");
  }
  if (
    decodedPath.includes("\\") ||
    decodedPath.includes("%") ||
    decodedPath.split("/").some((part) => part === "." || part === "..")
  ) {
    return denied(400, "invalid_path");
  }

  if (decodedPath === "/kb-api/accounts") {
    return rawQuery === ""
      ? { ok: true, path: "/api/v1/accounts" }
      : denied(400, "invalid_query");
  }

  const match = SNAPSHOT_PATH.exec(decodedPath);
  if (!match?.[1]) return denied(404, "path_not_allowed");
  const params = new URLSearchParams(rawQuery);
  const entries = [...params.entries()];
  const keys = ["market", "exchange", "symbol"];
  if (
    entries.length !== keys.length ||
    keys.some((key) => params.getAll(key).length !== 1) ||
    entries.some(([key]) => !keys.includes(key))
  ) {
    return denied(400, "invalid_query");
  }

  const market = params.get("market");
  const exchange = params.get("exchange");
  const symbol = params.get("symbol");
  const validUs =
    market === "US" &&
    (exchange === "NAS" || exchange === "NYS" || exchange === "AMX") &&
    symbol !== null &&
    /^[A-Z0-9][A-Z0-9.-]{0,11}$/.test(symbol);
  const validKr =
    market === "KR" &&
    (exchange === "KOSPI" || exchange === "KOSDAQ") &&
    symbol !== null &&
    /^\d{6}$/.test(symbol);
  if (!validUs && !validKr) return denied(400, "invalid_query");

  const canonicalQuery = new URLSearchParams({ market, exchange, symbol });
  return {
    ok: true,
    path: `/api/v1/accounts/${match[1]}/market-data/snapshot?${canonicalQuery}`,
  };
}

function denied(status: number, code: string) {
  return { ok: false as const, status, code };
}

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  value: object,
): void {
  if (response.writableEnded) return;
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

function readBackendPort(): number {
  const value = Number(process.env.KB_MARKET_BACKEND_PORT);
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error("KB_MARKET_BACKEND_PORT must be set to a valid numeric port in kb mode");
  }
  return value;
}
