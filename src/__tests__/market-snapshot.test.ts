import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchMarketAccounts,
  fetchMarketSnapshot,
  validateMarketSnapshot,
  type MarketSnapshotIdentity,
} from "@/services/marketSnapshot";

const identity: MarketSnapshotIdentity = {
  account_id: "3f13f4c2-4dce-45ef-b8e4-b92e58f101d5",
  market: "KR",
  query_market: "KOSPI",
  symbol: "005930",
};

const snapshot = {
  ...identity,
  currency: "KRW",
  source: "kb",
  acquired_at: "2026-09-19T12:00:00Z",
  provider_as_of: null,
  provider_timezone: null,
  delay: { status: "unknown", minutes: null },
  quote: { last: "72500", bid: null, ask: null },
  bars: [
    {
      date: "2026-09-18",
      open: "73100",
      high: "74000",
      low: "72000",
      close: "72500",
      volume: null,
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("market snapshot contract", () => {
  it("preserves Korean leading zeros, decimal strings, and nullable fields", () => {
    expect(validateMarketSnapshot(snapshot, identity)).toEqual(snapshot);
  });

  it.each([
    ["account identity", { ...snapshot, account_id: "03f15d37-e5cf-4560-a1a1-3e2e1fd89524" }],
    ["market identity", { ...snapshot, market: "US" }],
    ["query-market identity", { ...snapshot, query_market: "KOSDAQ" }],
    ["symbol identity", { ...snapshot, symbol: "000660" }],
    ["market currency", { ...snapshot, currency: "USD" }],
    ["extra provider field", { ...snapshot, raw_account: "secret" }],
    ["invalid decimal", { ...snapshot, quote: { ...snapshot.quote, last: "NaN" } }],
    [
      "non-finite acquisition timestamp",
      { ...snapshot, acquired_at: "2026-09-19T12:00:00+99:99" },
    ],
    [
      "non-finite provider timestamp",
      { ...snapshot, provider_as_of: "2026-09-19T12:00:00+99:99" },
    ],
    [
      "invalid OHLC",
      {
        ...snapshot,
        bars: [{ ...snapshot.bars[0], high: "71000" }],
      },
    ],
    [
      "invalid calendar date",
      {
        ...snapshot,
        bars: [{ ...snapshot.bars[0], date: "2026-02-30" }],
      },
    ],
    [
      "non-finite volume",
      {
        ...snapshot,
        bars: [{ ...snapshot.bars[0], volume: "9".repeat(309) }],
      },
    ],
    [
      "duplicate trading date",
      {
        ...snapshot,
        bars: [snapshot.bars[0], { ...snapshot.bars[0] }],
      },
    ],
    ["empty series", { ...snapshot, bars: [] }],
  ])("rejects a malformed %s", (_label, payload) => {
    expect(() => validateMarketSnapshot(payload, identity)).toThrow(/market snapshot is invalid/i);
  });

  it("fetches only the fixed account listing and validates its safe projection", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accounts: [
            {
              id: identity.account_id,
              alias: "KB 계좌",
              status: "active",
              base_currency: "USD",
            },
          ],
          common_base_currency: "USD",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchMarketAccounts();

    expect(result.accounts[0]?.alias).toBe("KB 계좌");
    expect(fetchMock).toHaveBeenCalledWith(
      "/kb-api/accounts",
      expect.objectContaining({
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
      }),
    );
  });

  it("normalizes no identity fields and forwards the caller's abort signal", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(snapshot), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchMarketSnapshot(identity, controller.signal)).resolves.toEqual(snapshot);
    expect(fetchMock).toHaveBeenCalledWith(
      `/kb-api/accounts/${identity.account_id}/market-data/snapshot?market=KR&exchange=KOSPI&symbol=005930`,
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it("returns a bounded safe error without exposing a raw provider response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "provider_contract_unverified",
              message: "The market data contract is not verified.",
              raw_provider_body: "secret",
            },
          }),
          { status: 503, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    await expect(fetchMarketSnapshot(identity)).rejects.toMatchObject({
      code: "provider_contract_unverified",
      message: "The market data contract is not verified.",
    });
  });
});
