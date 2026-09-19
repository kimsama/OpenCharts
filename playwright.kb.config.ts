import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ocRoot = path.dirname(fileURLToPath(import.meta.url));
const kbRepo = requiredEnvironment("KB_REPO_DIR");
const frontendPort = 5193;
const backendPort = 8193;
const chrome = process.env.PLAYWRIGHT_CHROME_PATH?.trim();

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "test-results/native-kb/playwright",
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    browserName: "chromium",
    channel: chrome ? undefined : "chrome",
    launchOptions: chrome ? { executablePath: chrome } : undefined,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `"${path.join(kbRepo, ".venv", "Scripts", "python.exe")}" tests/market_snapshot_fixture_server.py`,
      cwd: kbRepo,
      env: {
        KB_MARKET_BACKEND_PORT: String(backendPort),
      },
      url: `http://127.0.0.1:${backendPort}/api/v1/accounts`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: `npm run dev -- --mode kb --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      cwd: ocRoot,
      env: {
        KB_MARKET_BACKEND_PORT: String(backendPort),
        VITE_POSTHOG_API_KEY: "connected-entry-isolation-test",
      },
      url: `http://127.0.0.1:${frontendPort}/`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set for the KB browser fixture`);
  return value;
}
