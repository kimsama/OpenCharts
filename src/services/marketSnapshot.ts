import { z } from "zod";

const MARKETS = ["US", "KR"] as const;
const QUERY_MARKETS = ["NAS", "NYS", "AMX", "KOSPI", "KOSDAQ"] as const;

const decimal = z
  .string()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)
  .refine((value) => Number.isFinite(Number(value)));
const nullableDecimal = decimal.nullable();
const volume = z
  .string()
  .regex(/^\d+$/)
  .refine((value) => Number.isFinite(Number(value)));
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isCalendarDate);
const timestamp = z
  .string()
  .datetime({ offset: true })
  .refine((value) => Number.isFinite(Date.parse(value)));

const identitySchema = z
  .object({
    account_id: z.string().uuid(),
    market: z.enum(MARKETS),
    query_market: z.enum(QUERY_MARKETS),
    symbol: z.string().min(1).max(12),
  })
  .strict();

const snapshotSchema = identitySchema
  .extend({
    currency: z.enum(["USD", "KRW"]),
    source: z.literal("kb"),
    acquired_at: timestamp,
    provider_as_of: timestamp.nullable(),
    provider_timezone: z.string().min(1).max(64).nullable(),
    delay: z
      .object({
        status: z.enum(["delayed", "realtime", "unknown"]),
        minutes: z.number().int().min(0).max(1_440).nullable(),
      })
      .strict(),
    quote: z
      .object({
        last: nullableDecimal,
        bid: nullableDecimal,
        ask: nullableDecimal,
      })
      .strict(),
    bars: z
      .array(
        z
          .object({
            date: dateOnly,
            open: decimal,
            high: decimal,
            low: decimal,
            close: decimal,
            volume: volume.nullable(),
          })
          .strict(),
      )
      .min(1)
      .max(250),
  })
  .strict();

const accountListSchema = z
  .object({
    accounts: z
      .array(
        z
          .object({
            id: z.string().uuid(),
            alias: z.string().min(1).max(128),
            status: z.enum(["active", "inactive"]),
            base_currency: z.string().min(3).max(8),
          })
          .strict(),
      )
      .max(100),
    common_base_currency: z.string().min(3).max(8).nullable(),
  })
  .strict();

export type MarketSnapshotIdentity = z.infer<typeof identitySchema>;
export type MarketSnapshot = z.infer<typeof snapshotSchema>;
export type MarketAccountList = z.infer<typeof accountListSchema>;

export class MarketSnapshotError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MarketSnapshotError";
  }
}

export function validateMarketSnapshot(
  value: unknown,
  expectedIdentity: MarketSnapshotIdentity,
): MarketSnapshot {
  const parsed = snapshotSchema.safeParse(value);
  if (!parsed.success) throw invalidSnapshot();
  const snapshot = parsed.data;
  if (
    snapshot.account_id !== expectedIdentity.account_id ||
    snapshot.market !== expectedIdentity.market ||
    snapshot.query_market !== expectedIdentity.query_market ||
    snapshot.symbol !== expectedIdentity.symbol ||
    (snapshot.market === "US" && snapshot.currency !== "USD") ||
    (snapshot.market === "KR" && snapshot.currency !== "KRW") ||
    !queryMarketMatches(snapshot.market, snapshot.query_market) ||
    !delayMatches(snapshot.delay.status, snapshot.delay.minutes) ||
    !barsAreValid(snapshot.bars)
  ) {
    throw invalidSnapshot();
  }
  return snapshot;
}

export async function fetchMarketAccounts(signal?: AbortSignal): Promise<MarketAccountList> {
  const value = await requestJson("/kb-api/accounts", signal);
  const parsed = accountListSchema.safeParse(value);
  if (!parsed.success) {
    throw new MarketSnapshotError("invalid_response", "The account list is invalid.");
  }
  return parsed.data;
}

export async function fetchMarketSnapshot(
  identity: MarketSnapshotIdentity,
  signal?: AbortSignal,
): Promise<MarketSnapshot> {
  const params = new URLSearchParams({
    market: identity.market,
    exchange: identity.query_market,
    symbol: identity.symbol,
  });
  const value = await requestJson(
    `/kb-api/accounts/${identity.account_id}/market-data/snapshot?${params}`,
    signal,
  );
  return validateMarketSnapshot(value, identity);
}

async function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
      redirect: "error",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new MarketSnapshotError("connection_failed", "The market data service is unavailable.");
  }

  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new MarketSnapshotError("invalid_response", "The market data response is invalid.");
  }
  if (!response.ok) throw apiError(value, response.status);
  return value;
}

function apiError(value: unknown, status: number): MarketSnapshotError {
  const error = z
    .object({
      error: z
        .object({
          code: z.string().min(1).max(64),
          message: z.string().min(1).max(256),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(value);
  if (error.success) {
    return new MarketSnapshotError(error.data.error.code, error.data.error.message);
  }
  return new MarketSnapshotError(
    `http_${status}`,
    status === 504 ? "The market data request timed out." : "The market data request failed.",
  );
}

function invalidSnapshot(): MarketSnapshotError {
  return new MarketSnapshotError("invalid_response", "The market snapshot is invalid.");
}

function queryMarketMatches(market: "US" | "KR", queryMarket: string): boolean {
  return market === "US"
    ? queryMarket === "NAS" || queryMarket === "NYS" || queryMarket === "AMX"
    : queryMarket === "KOSPI" || queryMarket === "KOSDAQ";
}

function delayMatches(status: string, minutes: number | null): boolean {
  if (status === "unknown") return minutes === null;
  if (status === "realtime") return minutes === null || minutes === 0;
  return minutes !== null && minutes > 0;
}

function barsAreValid(bars: MarketSnapshot["bars"]): boolean {
  let previousDate = "";
  for (const bar of bars) {
    const open = Number(bar.open);
    const high = Number(bar.high);
    const low = Number(bar.low);
    const close = Number(bar.close);
    if (
      bar.date <= previousDate ||
      high < Math.max(open, close, low) ||
      low > Math.min(open, close, high)
    ) {
      return false;
    }
    previousDate = bar.date;
  }
  return true;
}

function isCalendarDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
