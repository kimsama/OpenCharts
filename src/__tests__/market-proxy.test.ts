// @vitest-environment node

import { createServer as createNodeServer, request as nodeRequest, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer as createViteServer, type ViteDevServer } from "vite";

import { kbReadProxy } from "../../vite.config";

const accountId = "3f13f4c2-4dce-45ef-b8e4-b92e58f101d5";

type RecordedRequest = {
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  url?: string;
};

describe("KB read proxy", () => {
  let upstream: Server;
  let frontend: Server;
  let vite: ViteDevServer;
  let origin = "";
  const upstreamRequests: RecordedRequest[] = [];

  beforeAll(async () => {
    upstream = createNodeServer((request, response) => {
      upstreamRequests.push({
        headers: request.headers,
        method: request.method,
        url: request.url,
      });
      if (request.url?.includes("symbol=REDIRECT")) {
        response.writeHead(302, { location: "http://example.invalid/private" });
        response.end();
        return;
      }
      response.writeHead(200, {
        "content-type": "application/json",
        "set-cookie": "session=must-not-escape",
      });
      response.end(JSON.stringify({ ok: true }));
    });
    await listen(upstream);
    const upstreamPort = (upstream.address() as AddressInfo).port;

    vite = await createViteServer({
      configFile: false,
      logLevel: "silent",
      plugins: [kbReadProxy(upstreamPort)],
      server: { middlewareMode: true },
    });
    frontend = createNodeServer(vite.middlewares);
    await listen(frontend);
    origin = `http://127.0.0.1:${(frontend.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await vite.close();
    await close(frontend);
    await close(upstream);
  });

  it("forwards only exact GET reads to the fixed loopback target", async () => {
    const response = await rawRequest(
      origin,
      `/kb-api/accounts/${accountId}/market-data/snapshot?market=KR&exchange=KOSPI&symbol=005930`,
      {
        headers: {
          accept: "application/json",
          authorization: "Bearer must-not-forward",
          cookie: "session=must-not-forward",
          origin: "http://127.0.0.1:5191",
          "x-private": "must-not-forward",
        },
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["set-cookie"]).toBeUndefined();
    const forwarded = upstreamRequests.at(-1);
    expect(forwarded?.url).toBe(
      `/api/v1/accounts/${accountId}/market-data/snapshot?market=KR&exchange=KOSPI&symbol=005930`,
    );
    expect(forwarded?.headers.origin).toBe("http://127.0.0.1:5191");
    expect(forwarded?.headers.authorization).toBeUndefined();
    expect(forwarded?.headers.cookie).toBeUndefined();
    expect(forwarded?.headers["x-private"]).toBeUndefined();
  });

  it.each([
    ["non-GET method", "/kb-api/accounts", { method: "POST" }],
    ["query on account list", "/kb-api/accounts?market=US", {}],
    ["unknown path", "/kb-api/accounts/not-a-uuid/market-data/snapshot", {}],
    [
      "duplicate query",
      `/kb-api/accounts/${accountId}/market-data/snapshot?market=US&market=KR&exchange=NAS&symbol=MU`,
      {},
    ],
    [
      "extra query",
      `/kb-api/accounts/${accountId}/market-data/snapshot?market=US&exchange=NAS&symbol=MU&path=/orders`,
      {},
    ],
    [
      "cross-market exchange",
      `/kb-api/accounts/${accountId}/market-data/snapshot?market=KR&exchange=NAS&symbol=005930`,
      {},
    ],
    [
      "encoded slash",
      `/kb-api/accounts/${accountId}%2Fmarket-data/snapshot?market=US&exchange=NAS&symbol=MU`,
      {},
    ],
    ["encoded traversal", "/kb-api/accounts/%2e%2e/private", {}],
    ["malformed escape", "/kb-api/accounts/%ZZ", {}],
  ])("rejects %s before upstream I/O", async (_label, path, options) => {
    const before = upstreamRequests.length;
    const response = await rawRequest(origin, path, options);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(upstreamRequests).toHaveLength(before);
  });

  it("rejects upstream redirects without exposing Location", async () => {
    const response = await rawRequest(
      origin,
      `/kb-api/accounts/${accountId}/market-data/snapshot?market=US&exchange=NAS&symbol=REDIRECT`,
    );

    expect(response.status).toBe(502);
    expect(response.headers.location).toBeUndefined();
  });
});

function listen(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function rawRequest(
  origin: string,
  path: string,
  options: { method?: string; headers?: Record<string, string> } = {},
): Promise<{ status: number; headers: Record<string, string | string[] | undefined> }> {
  const url = new URL(origin);
  return new Promise((resolve, reject) => {
    const request = nodeRequest(
      {
        hostname: url.hostname,
        port: url.port,
        method: options.method ?? "GET",
        path,
        headers: options.headers,
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({ status: response.statusCode ?? 0, headers: response.headers });
        });
      },
    );
    request.once("error", reject);
    request.end();
  });
}
