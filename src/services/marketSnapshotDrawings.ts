import type { DrawingLine } from "../pages/trading/constants.ts";
import type { MarketSnapshotIdentity } from "./marketSnapshot.ts";

export type MarketSnapshotDrawingScope = MarketSnapshotIdentity;

const PREFIX = "kb_market_snapshot_drawings:";

function storageKey(scope: MarketSnapshotDrawingScope): string {
  return `${PREFIX}${encodeURIComponent(
    JSON.stringify(["kb", scope.account_id, scope.market, scope.query_market, scope.symbol]),
  )}`;
}

function read(scope: MarketSnapshotDrawingScope): DrawingLine[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(scope)) ?? "[]");
    return Array.isArray(value) ? (value as DrawingLine[]) : [];
  } catch {
    return [];
  }
}

function write(scope: MarketSnapshotDrawingScope, drawings: DrawingLine[]): void {
  localStorage.setItem(storageKey(scope), JSON.stringify(drawings));
}

export const marketSnapshotDrawings = {
  async list(scope: MarketSnapshotDrawingScope): Promise<DrawingLine[]> {
    return read(scope);
  },
  async save(scope: MarketSnapshotDrawingScope, drawing: DrawingLine): Promise<void> {
    write(scope, [...read(scope).filter((item) => item.id !== drawing.id), drawing]);
  },
  async remove(scope: MarketSnapshotDrawingScope, drawingId: string): Promise<void> {
    write(scope, read(scope).filter((item) => item.id !== drawingId));
  },
  async clear(scope: MarketSnapshotDrawingScope): Promise<void> {
    localStorage.removeItem(storageKey(scope));
  },
};
