import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
  type Request,
} from "@playwright/test";

const artifacts = path.resolve("test-results", "native-kb");

test("native US lookup is explicit and keeps local chart tools broker-free", async ({ page }) => {
  const evidence = observePage(page);
  const form = await openLookup(page);

  await form.getByLabel("종목 코드").fill("mu");
  await page.waitForTimeout(250);
  expect(evidence.snapshotRequests).toEqual([]);
  await form.getByRole("button", { name: "조회", exact: true }).click();

  await expect(page.getByRole("status")).toContainText("MU 조회 완료");
  await expect(page.getByText("시장 US", { exact: true })).toBeVisible();
  await expect(page.getByText("조회 시장 NAS", { exact: true })).toBeVisible();
  await expect(page.getByText("Last 127.2500", { exact: true })).toBeVisible();
  await expect(page.getByText("USD", { exact: true })).toBeVisible();
  await expect(page.getByText("15분 지연", { exact: true })).toBeVisible();
  expect(await page.locator("canvas").count()).toBeGreaterThanOrEqual(3);
  expect(evidence.snapshotRequests).toHaveLength(1);

  await page.getByRole("button", { name: "Indicators" }).click();
  await page.getByRole("button", { name: /Simple Moving Average/ }).click();
  await expect(page.getByRole("button", { name: /Indicators/ })).toContainText("1");

  await page.getByTitle("Chart Plugins").click();
  await page.getByRole("button", { name: /OHLCV Tooltip/ }).click();
  await expect(page.getByTitle("Chart Plugins")).toContainText("1");

  await page.getByTitle("Chart layout templates").click();
  await page.getByRole("button", { name: "Add template" }).click();
  await page.getByPlaceholder(/Template name/).fill("KB local view");
  await page.getByPlaceholder(/Template name/).press("Enter");
  await expect(page.getByTitle("Chart layout templates")).toContainText("KB local view");
  await page.mouse.click(20, 200);
  await expect(page.getByPlaceholder(/Template name/)).toHaveCount(0);
  await page.getByRole("button", { name: /Indicators/ }).click();
  await expect(page.getByRole("button", { name: /Simple Moving Average/ })).toHaveCount(0);

  expect(evidence.snapshotRequests).toHaveLength(1);
  expect(evidence.forbiddenRequests).toEqual([]);
  expect(evidence.consoleErrors).toEqual([]);
  expect(evidence.httpFailures).toEqual([]);
  await saveScreenshot(page, "native-market-us-desktop.png");
});

test("native drawings survive reload and stay isolated by the full market identity", async ({ page }) => {
  const evidence = observePage(page);
  await submitLookup(page, { symbol: "MU" });
  await expect(page.getByText("조회 시장 NAS", { exact: true })).toBeVisible();

  await page.getByTitle("Drawing Tools").click();
  await page.getByRole("button", { name: /Horizontal Line/ }).click();
  await clickChart(page, 0.55, 0.45);
  await expect(page.getByTitle("Object tree (drawings)")).toBeVisible();

  await page.getByTitle("Object tree (drawings)").click();
  const objectRow = page.getByRole("button", { name: /^Horizontal / }).locator("..");
  await expect(objectRow).toBeVisible();
  await objectRow.getByTitle("Lock").click();
  await expect(objectRow.getByTitle("Unlock")).toBeVisible();
  await objectRow.getByTitle("Delete").click();
  await expect(page.getByTitle("Object tree (drawings)")).toHaveCount(0);
  await page.keyboard.press("Control+z");
  await expect(page.getByTitle("Object tree (drawings)")).toBeVisible();
  await page.keyboard.press("Control+Shift+z");
  await expect(page.getByTitle("Object tree (drawings)")).toHaveCount(0);
  await page.keyboard.press("Control+z");
  await expect(page.getByTitle("Object tree (drawings)")).toBeVisible();

  await submitLookup(page, { symbol: "MU" });
  await expect(page.getByTitle("Object tree (drawings)")).toBeVisible();

  await submitLookup(page, { symbol: "MU", queryMarket: "NYS" });
  await expect(page.getByText("조회 시장 NYS", { exact: true })).toBeVisible();
  await expect(page.getByTitle("Object tree (drawings)")).toHaveCount(0);

  await submitLookup(page, { symbol: "MU", account: "ZZ Refusal fixture" });
  await expect(page.getByText("Last 127.2500", { exact: true })).toBeVisible();
  await expect(page.getByTitle("Object tree (drawings)")).toHaveCount(0);
  expect(evidence.snapshotRequests).toHaveLength(4);
  expect(evidence.forbiddenRequests).toEqual([]);
});

test("KOSPI and KOSDAQ preserve null volume, quote gaps, and route labels", async ({ page }) => {
  const evidence = observePage(page);
  await submitLookup(page, { market: "KR", symbol: "005930" });

  await expect(page.getByText("시장 KR", { exact: true })).toBeVisible();
  await expect(page.getByText("조회 시장 KOSPI", { exact: true })).toBeVisible();
  await expect(page.getByText("Last 72500", { exact: true })).toBeVisible();
  await expect(page.getByText("KRW", { exact: true })).toBeVisible();
  await expect(page.getByText("지연 알 수 없음", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Bid /)).toHaveCount(0);
  await expect(page.getByText(/^Ask /)).toHaveCount(0);

  await page.getByRole("button", { name: "Indicators" }).click();
  await page.getByRole("button", { name: /Volume Weighted Avg Price/ }).click();
  await expect(page.getByText("VWAP unavailable · volume missing", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Indicators/ }).click();
  await saveScreenshot(page, "native-market-kr-desktop.png");

  await submitLookup(page, { market: "KR", queryMarket: "KOSDAQ", symbol: "247540" });
  await expect(page.getByText("조회 시장 KOSDAQ", { exact: true })).toBeVisible();
  await expect(page.getByText("Last 72500", { exact: true })).toBeVisible();
  expect(evidence.snapshotRequests).toHaveLength(2);
  expect(evidence.forbiddenRequests).toEqual([]);
  expect(evidence.consoleErrors).toEqual([]);
});

test("late failures, malformed data, empty data, and unsafe reads cannot leave stale charts", async ({
  page,
}) => {
  const evidence = observePage(page);
  await submitLookup(page, { symbol: "MU" });
  await expect(page.getByText("Last 127.2500", { exact: true })).toBeVisible();

  const invalid = await openLookup(page);
  await invalid.locator("select").nth(1).selectOption("KR");
  await invalid.getByLabel("종목 코드").fill("5930");
  await invalid.getByRole("button", { name: "조회", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("6자리");
  await expect(page.getByText("Last 127.2500", { exact: true })).toHaveCount(0);

  await submitLookup(page, { market: "US", symbol: "EMPTY", expectSuccess: false });
  await expect(page.getByRole("alert")).toContainText("시장 데이터가 없습니다");
  await expect(page.getByText("Last 127.2500", { exact: true })).toHaveCount(0);

  for (const [account, symbol, message] of [
    ["ZZ Malformed fixture", "MALFORMED", "invalid response"],
    ["ZZ Refusal fixture", "REFUSED", "rejected the request"],
  ] as const) {
    await submitLookup(page, { account, symbol });
    await expect(page.getByRole("alert")).toContainText(message);
    await expect(page.getByText(/^Last /)).toHaveCount(0);
  }

  const timeoutForm = await openLookup(page);
  await timeoutForm.getByLabel("계좌").selectOption({ label: "ZZ Timeout fixture" });
  await timeoutForm.getByLabel("종목 코드").fill("TIMEOUT");
  await timeoutForm.getByRole("button", { name: "조회", exact: true }).click();
  const latestForm = await openLookup(page);
  await latestForm.getByLabel("계좌").selectOption({ label: "Snapshot account" });
  await latestForm.getByLabel("종목 코드").fill("MU");
  await latestForm.getByRole("button", { name: "조회", exact: true }).click();
  await expect(page.getByText("Last 127.2500", { exact: true })).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByRole("alert")).toHaveCount(0);

  const denied = await page.evaluate(async () => {
    const method = await fetch("/kb-api/accounts", { method: "POST" });
    const duplicate = await fetch(
      "/kb-api/accounts/3f13f4c2-4dce-45ef-b8e4-b92e58f101d5/market-data/snapshot?market=US&market=KR&exchange=NAS&symbol=MU",
    );
    const trading = await fetch("/kb-api/orders");
    return [method.status, duplicate.status, trading.status];
  });
  expect(denied).toEqual([405, 400, 404]);
  expect(evidence.forbiddenRequests.filter((url) => !url.includes("/kb-api/orders"))).toEqual([]);
});

test("native mobile shell is accessible and remains isolated through focus and polling windows", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 1144 });
  const evidence = observePage(page);
  await page.goto("/");

  await expect(page.getByText("KB read-only mode · Portfolio unavailable")).toBeVisible();
  await expect(page.getByText("Trading activity unavailable")).toBeVisible();
  await expect(page.getByRole("button", { name: /Buy|Sell|Place order/i })).toHaveCount(0);
  await page.getByRole("button", { name: "조회 종목" }).focus();
  await page.keyboard.press("Enter");
  const form = page.locator("form:visible");
  await expect(form.getByLabel("계좌")).not.toHaveValue("");
  const mobileTicker = form.getByLabel("종목 코드");
  await expect(mobileTicker).toBeFocused();
  await saveScreenshot(page, "native-market-mobile-controls-390.png");
  await form.locator("select").nth(1).selectOption("KR");
  await mobileTicker.type("005930");
  await mobileTicker.press("Enter");
  await expect(page.getByText("조회 시장 KOSPI", { exact: true })).toBeVisible();
  await expectManualHeaderClearOfTools(page);

  await clickChart(page, 0.45, 0.55, "right");
  await expect(page.getByText(/Buy (Limit|Stop)|Sell (Limit|Stop)/)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await dragChartRight(page);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const snapshotsBeforeTimers = evidence.snapshotRequests.length;
  await page.waitForTimeout(31_000);
  expect(evidence.snapshotRequests).toHaveLength(snapshotsBeforeTimers);
  expect(evidence.forbiddenRequests).toEqual([]);
  expect(evidence.consoleErrors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await saveScreenshot(page, "native-market-kr-mobile-390.png");
  await writeEvidence(evidence);
});

test("native tooltip keeps DST boundary trading dates in Seoul and New York", async ({ browser }) => {
  for (const timezoneId of ["Asia/Seoul", "America/New_York"] as const) {
    const context = await browser.newContext({ timezoneId, viewport: { width: 1440, height: 900 } });
    await captureCanvasText(context);
    const page = await context.newPage();
    const evidence = observePage(page);
    try {
      await submitLookup(page, { symbol: "MU" });
      expect((await page.getByTitle("Chart Plugins").innerText()).trim()).toBe("");
      const axisText = await readCanvasText(page);
      expect(axisText).toContain("2026-02-05");
      expect(axisText).toContain("2026-03-05");
      const dates = ["2026-03-06", "2026-03-09"];
      await clearCanvasText(page);
      const nativePositions = await exposeNativeCrosshairDates(page, dates);
      const nativeCrosshairText = await readCanvasText(page);
      for (const date of dates) expect(nativeCrosshairText).toContain(date);
      expect(Object.keys(nativePositions).sort()).toEqual([...dates].sort());

      await clearCanvasText(page);
      await page.getByTitle("Chart Plugins").click();
      await page.getByRole("button", { name: /OHLCV Tooltip/ }).click();
      await page.getByRole("button", { name: /^Delta Tooltip/ }).click();
      await expect(page.getByTitle("Chart Plugins")).toContainText("2");
      const positions = await exposeTradingDates(page, dates);
      await clearCanvasText(page);
      const deltaText = await exerciseDeltaTooltip(
        page,
        positions,
        timezoneId === "Asia/Seoul"
          ? "native-market-dates-seoul.png"
          : "native-market-dates-new-york.png",
      );
      for (const date of dates) expect(deltaText).toContain(date);
      expect(deltaText.some((text) => text.endsWith("%"))).toBe(true);
      expect(evidence.forbiddenRequests).toEqual([]);
      expect(evidence.consoleErrors).toEqual([]);
    } finally {
      await context.close();
    }
  }
});

type Lookup = {
  account?: string;
  expectSuccess?: boolean;
  market?: "US" | "KR";
  queryMarket?: "NAS" | "NYS" | "AMX" | "KOSPI" | "KOSDAQ";
  symbol: string;
};

type BrowserEvidence = {
  consoleErrors: string[];
  forbiddenRequests: string[];
  httpFailures: Array<{ path: string; status: number }>;
  snapshotRequests: string[];
};

async function openLookup(page: Page): Promise<Locator> {
  if (new URL(page.url()).pathname !== "/") await page.goto("/");
  const symbol = page.getByRole("button", { name: /^(조회 종목|[A-Z0-9.-]+)$/ }).first();
  await expect(symbol).toBeVisible();
  await symbol.click();
  const form = page.locator("form:visible");
  await expect(form).toBeVisible();
  await expect(form.getByLabel("계좌")).not.toHaveValue("");
  return form;
}

async function submitLookup(page: Page, lookup: Lookup): Promise<void> {
  const form = await openLookup(page);
  if (lookup.account) await form.locator("select").nth(0).selectOption({ label: lookup.account });
  if (lookup.market) await form.locator("select").nth(1).selectOption(lookup.market);
  if (lookup.queryMarket) await form.locator("select").nth(2).selectOption(lookup.queryMarket);
  await form.getByLabel("종목 코드").fill(lookup.symbol);
  await form.getByRole("button", { name: "조회", exact: true }).click();
  if (lookup.expectSuccess !== false && (!lookup.account || lookup.account === "Snapshot account")) {
    await expect(page.getByRole("status")).toContainText(`${lookup.symbol.toUpperCase()} 조회 완료`);
  }
}

function observePage(page: Page): BrowserEvidence {
  const evidence: BrowserEvidence = {
    consoleErrors: [],
    forbiddenRequests: [],
    httpFailures: [],
    snapshotRequests: [],
  };
  page.on("console", (message) => {
    if (message.type() === "error") evidence.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => evidence.consoleErrors.push(error.message));
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/market-data/snapshot")) evidence.snapshotRequests.push(url);
    if (isForbiddenRequest(request)) evidence.forbiddenRequests.push(url);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      evidence.httpFailures.push({ path: new URL(response.url()).pathname, status: response.status() });
    }
  });
  return evidence;
}

function isForbiddenRequest(request: Request): boolean {
  if (!["fetch", "xhr", "websocket", "eventsource", "ping"].includes(request.resourceType())) {
    return false;
  }
  const url = new URL(request.url());
  if (url.pathname === "/kb-api/accounts") return false;
  if (/^\/kb-api\/accounts\/[0-9a-f-]+\/market-data\/snapshot$/.test(url.pathname)) return false;
  return true;
}

async function chartBox(page: Page) {
  await expect(page.locator("canvas").first()).toBeVisible();
  const boxes = await page.locator("canvas").evaluateAll((canvases) =>
    canvases
      .map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })
      .filter((box) => box.width > 0 && box.height > 0)
      .sort((left, right) => right.width * right.height - left.width * left.height),
  );
  const box = boxes[0];
  if (!box) throw new Error("Native chart canvas has no layout box");
  return box;
}

async function clickChart(
  page: Page,
  xRatio: number,
  yRatio: number,
  button: "left" | "right" = "left",
): Promise<void> {
  const box = await chartBox(page);
  await page.mouse.click(box.x + box.width * xRatio, box.y + box.height * yRatio, { button });
}

async function dragChartRight(page: Page): Promise<void> {
  const box = await chartBox(page);
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 8 });
  await page.mouse.up();
}

type ChartPoint = { x: number; y: number };

async function exposeTradingDates(page: Page, dates: string[]): Promise<Record<string, ChartPoint>> {
  const box = await chartBox(page);
  const seen = new Set<string>();
  const positions: Record<string, ChartPoint> = {};
  for (const yRatio of [0.25, 0.45, 0.65]) {
    for (let step = 0; step <= 200 && seen.size < dates.length; step += 1) {
      const point = {
        x: box.x + (box.width * step) / 200,
        y: box.y + box.height * yRatio,
      };
      await page.mouse.move(point.x, point.y);
      const text = await page.locator("body").innerText();
      for (const date of dates) {
        if (text.includes(date)) {
          seen.add(date);
          positions[date] = point;
        }
      }
    }
  }
  expect([...seen].sort()).toEqual([...dates].sort());
  return positions;
}

async function exposeNativeCrosshairDates(
  page: Page,
  dates: string[],
): Promise<Record<string, ChartPoint>> {
  const box = await chartBox(page);
  const positions: Record<string, ChartPoint> = {};
  for (const yRatio of [0.25, 0.45, 0.65]) {
    for (let step = 0; step <= 200 && Object.keys(positions).length < dates.length; step += 1) {
      const point = {
        x: box.x + (box.width * step) / 200,
        y: box.y + box.height * yRatio,
      };
      await page.mouse.move(point.x, point.y);
      const canvasText = await readCanvasText(page);
      for (const date of dates) {
        if (canvasText.includes(date) && !positions[date]) positions[date] = point;
      }
    }
  }
  expect(Object.keys(positions).sort()).toEqual([...dates].sort());
  return positions;
}

async function captureCanvasText(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    const canvasText: string[] = [];
    Object.defineProperty(window, "__nativeCanvasText", { value: canvasText });
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) {
      canvasText.push(String(text));
      if (canvasText.length > 10_000) canvasText.shift();
      return maxWidth === undefined
        ? originalFillText.call(this, text, x, y)
        : originalFillText.call(this, text, x, y, maxWidth);
    };
  });
}

async function readCanvasText(page: Page): Promise<string[]> {
  return page.evaluate(
    () => [...(window as unknown as { __nativeCanvasText: string[] }).__nativeCanvasText],
  );
}

async function clearCanvasText(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __nativeCanvasText: string[] }).__nativeCanvasText.length = 0;
  });
}

async function exerciseDeltaTooltip(
  page: Page,
  positions: Record<string, ChartPoint>,
  screenshotName: string,
): Promise<string[]> {
  const start = positions["2026-03-06"];
  const end = positions["2026-03-09"];
  if (!start || !end) throw new Error("DST boundary chart coordinates were not observed");
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 12 });
    await page.waitForTimeout(100);
    await saveScreenshot(page, screenshotName);
    return await readCanvasText(page);
  } finally {
    await page.mouse.up();
  }
}

async function expectManualHeaderClearOfTools(page: Page): Promise<void> {
  const provenance = page.getByText("시장 KR", { exact: true }).locator("..");
  const rail = page.getByTitle("Drag to move").locator("..");
  const acquired = page.getByText(/^수집 /);
  const [provenanceBox, railBox, acquiredBox, plotBox] = await Promise.all([
    provenance.boundingBox(),
    rail.boundingBox(),
    acquired.boundingBox(),
    chartBox(page),
  ]);
  if (!provenanceBox || !railBox || !acquiredBox) {
    throw new Error("Native mobile provenance geometry is unavailable");
  }
  expect(provenanceBox.x).toBeGreaterThanOrEqual(railBox.x + railBox.width);
  expect(provenanceBox.x + provenanceBox.width).toBeLessThanOrEqual(plotBox.x + plotBox.width);
  expect(acquiredBox.x).toBeGreaterThanOrEqual(provenanceBox.x);
  expect(acquiredBox.x + acquiredBox.width).toBeLessThanOrEqual(plotBox.x + plotBox.width);
}

async function saveScreenshot(page: Page, name: string): Promise<void> {
  await mkdir(artifacts, { recursive: true });
  await page.screenshot({ path: path.join(artifacts, name), fullPage: true });
}

async function writeEvidence(evidence: BrowserEvidence): Promise<void> {
  await mkdir(artifacts, { recursive: true });
  await writeFile(
    path.join(artifacts, "native-market-isolation.json"),
    `${JSON.stringify(
      {
        consoleErrors: evidence.consoleErrors,
        forbiddenRequests: evidence.forbiddenRequests,
        httpFailures: evidence.httpFailures,
        snapshotRequestCount: evidence.snapshotRequests.length,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}
