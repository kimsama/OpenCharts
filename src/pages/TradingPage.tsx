import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsFeedConnected } from "../components/ConnectionIndicator.tsx";
import { MobileAccountBar, MobileTradingPanel } from "../components/MobileTradingPanel.tsx";
import {
  OrderConfirmDialog,
  OrderModifyDialog,
  PositionModifyDialog,
} from "../components/TradingDialogs.tsx";
import { NewsFeed as MarketNewsFeed } from "../components/TradingPowerFeatures.tsx";
import { TradingViewTechnicalAnalysis } from "../components/TradingViewWidgets.tsx";
import { useChartDrawings } from "../hooks/useChartDrawings.ts";
import {
  getChartPreferencesFromStorage,
  updateChartPreferences,
  useChartPreferences,
} from "../hooks/useChartPreferences.ts";
import { useTradeSound } from "../hooks/useTradeSound";
import type { IndicatorType } from "../lib/indicators.ts";
import { posthog } from "../lib/posthog";
import type { CreateJournalEntryInput, UpdateJournalEntryInput } from "../services/api/journal.ts";
import { api } from "../services/api.ts";
import {
  useAiTraderEnabled,
  useCandles,
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useJournalEntries,
  useOrders,
  usePositions,
  useSymbols,
  useUpdateJournalEntry,
} from "../services/queries.ts";
import type { Order, PlaceOrderInput, Position, Symbol } from "../services/schemas.ts";
import { useTradingStore } from "../services/store.tsx";
import { isKbMode } from "../services/runtimeMode.ts";
import {
  fetchMarketAccounts,
  fetchMarketSnapshot,
  MarketSnapshotError,
  type MarketAccountList,
  type MarketSnapshot,
  type MarketSnapshotIdentity,
} from "../services/marketSnapshot.ts";
import { toast } from "../services/toast.ts";
import { AiTraderPanel } from "./AiTraderPage.tsx";
import { BottomPanel } from "./trading/BottomPanel.tsx";
import { ChartPanel } from "./trading/ChartPanel.tsx";
import { ChartToolbar } from "./trading/ChartToolbar.tsx";
import {
  type DrawingTool,
  type MagnetMode,
  REPLAY_ENABLED,
  TIMEFRAMES,
  type Timeframe,
} from "./trading/constants.ts";
import { DOMPanel } from "./trading/DOMPanel.tsx";
import { MarketClosedBanner } from "./trading/MarketClosedBanner.tsx";
import { OrderPanel } from "./trading/OrderPanel.tsx";
import { ReplayScrubber } from "./trading/ReplayScrubber.tsx";
import { useReplayChartData } from "./trading/useReplayChartData.ts";
import { useReplayPlayback } from "./trading/useReplayPlayback.ts";
import {
  getPipDigits,
  snapshotBarsToNativeCandles,
  snapshotPriceDigits,
  type ManualDailyCandle,
} from "./trading/utils.ts";
import { WatchlistPanel } from "./trading/WatchlistPanel.tsx";

type ErrorWithMessage = { message?: string };

type ConfirmOrderState = {
  symbol: string;
  side: "BUY" | "SELL";
  type: string;
  quantity: number;
  price?: number;
  stopPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  _submit: () => Promise<unknown>;
} | null;

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as ErrorWithMessage).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Request failed";
}

export function TradingPage() {
  const hasTrackedFirstTrade = useRef(false);

  const handleFirstTrade = useCallback(() => {
    if (!hasTrackedFirstTrade.current) {
      hasTrackedFirstTrade.current = true;
      posthog.capture("funnel.trade.first_executed", { sessionId: posthog.get_session_id?.() });
    }
  }, []);

  const {
    selectedSymbol,
    setSelectedSymbol,
    ticks,
    updateTick,
    activeAccountId,
    symbols: _storeSymbols,
    replayVersion,
    isReplaying,
  } = useTradingStore();
  // Chart timeframe persistence (#8)
  const [timeframe, setTimeframe] = useState<Timeframe>(() => {
    if (isKbMode) return "1d";
    const saved = localStorage.getItem(`tf_${selectedSymbol}`);
    return saved && TIMEFRAMES.includes(saved as Timeframe) ? (saved as Timeframe) : "15m";
  });
  const handleTimeframeChange = useCallback(
    (tf: Timeframe) => {
      if (isKbMode) return;
      setTimeframe(tf);
      localStorage.setItem(`tf_${selectedSymbol}`, tf);
    },
    [selectedSymbol],
  );
  // Restore timeframe when symbol changes
  useEffect(() => {
    if (isKbMode) {
      setTimeframe("1d");
      return;
    }
    const saved = localStorage.getItem(`tf_${selectedSymbol}`);
    if (saved && TIMEFRAMES.includes(saved as Timeframe)) setTimeframe(saved as Timeframe);
  }, [selectedSymbol]);

  const [activeIndicators, setActiveIndicators] = useState<IndicatorType[]>([]);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>("none");
  const [kbSubmittedIdentity, setKbSubmittedIdentity] =
    useState<MarketSnapshotIdentity | null>(null);
  const {
    drawings,
    addDrawing,
    updateDrawing,
    removeDrawing,
    clearDrawings,
    undo: undoDrawing,
    redo: redoDrawing,
  } = useChartDrawings(
    selectedSymbol,
    timeframe,
    isKbMode ? kbSubmittedIdentity : undefined,
  );
  const [activePlugins, setActivePlugins] = useState<string[]>(
    () => getChartPreferencesFromStorage().activePlugins,
  );
  const handleTogglePlugin = useCallback(
    (id: string) => {
      const next = activePlugins.includes(id)
        ? activePlugins.filter((plugin) => plugin !== id)
        : [...activePlugins, id];
      setActivePlugins(next);
      updateChartPreferences({ activePlugins: next });
    },
    [activePlugins],
  );
  // Template load — replace the whole plugin list at once.
  const handleSetPlugins = useCallback((ids: string[]) => {
    setActivePlugins(ids);
    updateChartPreferences({ activePlugins: ids });
  }, []);
  const [bottomTab, setBottomTab] = useState<
    "positions" | "orders" | "history" | "journal" | "calendar" | "news" | "ai-trader"
  >("positions");
  const { data: aiTraderEnabled } = useAiTraderEnabled();
  const [rightPanel, setRightPanel] = useState<
    "order" | "dom" | "watchlist" | "news" | "ai-trader" | "tv-analysis"
  >("order");
  const [showRightPanel, setShowRightPanel] = useState(true);

  // ── Vertical resize: chart vs bottom panel ──
  const [bottomPanelHeight, setBottomPanelHeight] = useState(() => {
    const saved = localStorage.getItem("bottomPanelHeight");
    return saved ? parseInt(saved, 10) : 220;
  });
  const resizingRef = useRef(false);
  const resizeStartY = useRef(0);
  const resizeStartH = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      resizingRef.current = true;
      const clientY = "touches" in e ? e.touches[0]!.clientY : e.clientY;
      resizeStartY.current = clientY;
      resizeStartH.current = bottomPanelHeight;

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!resizingRef.current) return;
        const y = "touches" in ev ? ev.touches[0]!.clientY : (ev as MouseEvent).clientY;
        const delta = resizeStartY.current - y;
        const newH = Math.max(100, Math.min(600, resizeStartH.current + delta));
        setBottomPanelHeight(newH);
      };
      const onUp = () => {
        resizingRef.current = false;
        setBottomPanelHeight((h) => {
          localStorage.setItem("bottomPanelHeight", String(h));
          return h;
        });
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    },
    [bottomPanelHeight],
  );

  // (#4) One-click trading mode
  const [oneClick, setOneClick] = useState(
    () => localStorage.getItem("oneClickTrading") === "true",
  );

  // Trade sound effect
  const { muted: soundMuted, toggleMute: toggleSoundMute, playTradeSound } = useTradeSound();
  const toggleOneClick = useCallback(() => {
    setOneClick((prev) => {
      const v = !prev;
      localStorage.setItem("oneClickTrading", String(v));
      return v;
    });
  }, []);

  // (#6) Position modify dialog
  const [modifyingPosition, setModifyingPosition] = useState<Position | null>(null);

  // (#30) Order modify dialog
  const [modifyingOrder, setModifyingOrder] = useState<Order | null>(null);

  // (#7) Order confirmation dialog
  const [confirmOrder, setConfirmOrder] = useState<ConfirmOrderState>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const queryClient = useQueryClient();
  const { data: symbols = [] } = useSymbols();
  const isFeedConnected = useIsFeedConnected();
  const [kbAccounts, setKbAccounts] = useState<MarketAccountList["accounts"]>([]);
  const [kbAccountId, setKbAccountId] = useState("");
  const [kbMarket, setKbMarket] = useState<MarketSnapshotIdentity["market"]>("US");
  const [kbQueryMarket, setKbQueryMarket] =
    useState<MarketSnapshotIdentity["query_market"]>("NAS");
  const [kbTicker, setKbTicker] = useState("");
  const [kbSnapshot, setKbSnapshot] = useState<MarketSnapshot | null>(null);
  const [kbCandles, setKbCandles] = useState<ManualDailyCandle[]>([]);
  const [kbPipDigits, setKbPipDigits] = useState(0);
  const [kbStatus, setKbStatus] = useState("");
  const [kbError, setKbError] = useState("");
  const [kbPending, setKbPending] = useState(false);
  const kbRequestSequence = useRef(0);
  const kbRequestController = useRef<AbortController | null>(null);
  const kbPendingKey = useRef("");

  useEffect(() => {
    if (!isKbMode) return;
    const controller = new AbortController();
    fetchMarketAccounts(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setKbAccounts(value.accounts);
        setKbAccountId(value.accounts.find((account) => account.status === "active")?.id ?? "");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setKbError(kbErrorText(error));
      });
    return () => controller.abort();
  }, []);

  useEffect(
    () => () => {
      kbRequestSequence.current += 1;
      kbRequestController.current?.abort();
    },
    [],
  );

  const invalidateKbResult = useCallback(() => {
    kbRequestSequence.current += 1;
    kbRequestController.current?.abort();
    kbRequestController.current = null;
    kbPendingKey.current = "";
    setKbSnapshot(null);
    setKbCandles([]);
    setKbPipDigits(0);
    setKbSubmittedIdentity(null);
    setKbStatus("");
    setKbError("");
    setKbPending(false);
    setSelectedSymbol("");
  }, [setSelectedSymbol]);

  const submitKbSnapshot = useCallback(async () => {
    const symbol = kbTicker.trim().toUpperCase();
    const validationError = validateKbInput(kbAccountId, kbMarket, kbQueryMarket, symbol);
    if (validationError) {
      invalidateKbResult();
      setKbError(validationError);
      return;
    }
    const identity: MarketSnapshotIdentity = {
      account_id: kbAccountId,
      market: kbMarket,
      query_market: kbQueryMarket,
      symbol,
    };
    const key = kbIdentityKey(identity);
    if (kbPendingKey.current === key) return;
    kbRequestController.current?.abort();
    const controller = new AbortController();
    const sequence = kbRequestSequence.current + 1;
    kbRequestSequence.current = sequence;
    kbRequestController.current = controller;
    kbPendingKey.current = key;
    setKbSnapshot(null);
    setKbCandles([]);
    setKbPipDigits(0);
    setKbSubmittedIdentity(null);
    setKbError("");
    setKbStatus(`${symbol} 조회 중`);
    setKbPending(true);
    setSelectedSymbol(symbol);
    setTimeframe("1d");
    try {
      const snapshot = await fetchMarketSnapshot(identity, controller.signal);
      if (kbRequestSequence.current !== sequence) return;
      const nativeCandles = snapshotBarsToNativeCandles(snapshot.bars);
      const priceDigits = snapshotPriceDigits([
        snapshot.quote.last,
        snapshot.quote.bid,
        snapshot.quote.ask,
        ...snapshot.bars.flatMap((bar) => [bar.open, bar.high, bar.low, bar.close]),
      ]);
      setKbCandles(nativeCandles);
      setKbPipDigits(priceDigits);
      setKbSnapshot(snapshot);
      setKbSubmittedIdentity(identity);
      setKbStatus(`${symbol} 조회 완료`);
    } catch (error) {
      if (kbRequestSequence.current !== sequence || controller.signal.aborted) return;
      setKbError(kbErrorText(error));
      setKbStatus("");
    } finally {
      if (kbRequestSequence.current === sequence) {
        setKbPending(false);
        kbPendingKey.current = "";
        kbRequestController.current = null;
      }
    }
  }, [
    kbTicker,
    kbAccountId,
    kbMarket,
    kbQueryMarket,
    invalidateKbResult,
    setSelectedSymbol,
  ]);


  // Prime the active symbol with a fresh server-side snapshot immediately on
  // symbol switch so bid/ask appears without waiting for the next WS tick.
  useEffect(() => {
    if (isKbMode) return;
    let cancelled = false;
    void api
      .getTick(selectedSymbol)
      .then((tick) => {
        if (cancelled || !tick) return;
        updateTick(
          selectedSymbol,
          Number(tick.bid),
          Number(tick.ask),
          typeof tick.timestamp === "number" ? tick.timestamp : Date.now(),
        );
      })
      .catch(() => {
        // Ignore snapshot misses; WS stream remains authoritative.
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSymbol, updateTick]);

  // Handler for chart drag-to-edit SL/TP levels
  const handleChartModifyPosition = useCallback(
    async (positionId: string, mods: { takeProfit?: number | null; stopLoss?: number | null }) => {
      if (!isFeedConnected) {
        toast.warning(
          "No Data Feed",
          "Cannot modify positions while disconnected from the data feed",
        );
        if (activeAccountId)
          queryClient.invalidateQueries({
            queryKey: ["positions", activeAccountId],
          });
        return;
      }
      try {
        await api.modifyPosition(positionId, mods);
        const field = mods.takeProfit !== undefined ? "TP" : "SL";
        const price = mods.takeProfit !== undefined ? mods.takeProfit : mods.stopLoss;
        toast.success(`${field} Updated`, `${field} set to ${price}`);
        if (activeAccountId) {
          queryClient.invalidateQueries({
            queryKey: ["positions", activeAccountId],
          });
        }
      } catch (err: unknown) {
        toast.error("Modify Failed", getErrorMessage(err));
        // Refetch to revert price line to original value
        if (activeAccountId) {
          queryClient.invalidateQueries({
            queryKey: ["positions", activeAccountId],
          });
        }
      }
    },
    [activeAccountId, queryClient, isFeedConnected],
  );

  // Chart context-menu quick orders (Buy/Sell limit/stop at the clicked price).
  // Always routes through the confirm dialog so a stray right-click can never
  // place an order directly.
  const handleQuickOrder = useCallback(
    (side: "BUY" | "SELL", type: "LIMIT" | "STOP", price: number) => {
      if (isKbMode) return;
      if (!activeAccountId) {
        toast.warning("No Account", "Select an account before placing orders");
        return;
      }
      const input: PlaceOrderInput = {
        accountId: activeAccountId,
        symbol: selectedSymbol,
        side,
        type,
        quantity: 1,
        ...(type === "LIMIT" ? { price } : { stopPrice: price }),
      };
      setConfirmOrder({
        symbol: selectedSymbol,
        side,
        type,
        quantity: 1,
        price: type === "LIMIT" ? price : undefined,
        stopPrice: type === "STOP" ? price : undefined,
        _submit: () => api.placeOrder(input),
      });
    },
    [activeAccountId, selectedSymbol],
  );

  const handleClearIndicators = useCallback(() => {
    setActiveIndicators([]);
  }, []);

  // Deep-history target used after the initial fast render completes.
  const deepCandleLimit = useMemo(() => {
    switch (timeframe) {
      case "1m":
        return 3_000;
      case "5m":
        return 5_000;
      case "15m":
        return 12_000;
      case "30m":
        return 8_000;
      case "1h":
        return 8_760;
      case "4h":
        return 2_500;
      case "1d":
        return 1_000;
      case "1w":
        return 520;
      default:
        return 5_000;
    }
  }, [timeframe]);
  // First paint: viewport-sized so the initial fetch is as small as possible.
  // Mobile (<768px) needs fewer bars to fill the screen; desktop gets more.
  // The deep-history fetch fires 400ms later and loads a full year of data.
  const firstPaintCandleLimit = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return isMobile ? 500 : 400;
  }, []);
  const [candleLimit, setCandleLimit] = useState(firstPaintCandleLimit);
  useEffect(() => {
    if (isKbMode) return;
    setCandleLimit(firstPaintCandleLimit);
    // Wait long enough for the first-paint response to arrive and render
    // before firing the heavier deep-history request. 400 ms is a reasonable
    // budget for a cached/warm DB response; users on fast connections will
    // see data before the deep load starts, avoiding visible re-draws.
    const timer = window.setTimeout(() => {
      setCandleLimit(deepCandleLimit);
    }, 400);
    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedSymbol, timeframe, firstPaintCandleLimit, deepCandleLimit]);
  const { data: candles = [] } = useCandles(selectedSymbol, timeframe, candleLimit, replayVersion);
  // Replay: sliced 1m buffer + trade-event markers; null when not replaying.
  // While replayCandles is set, the live tick/candle feed is suppressed below
  // so real-time data can't paint over the playback.
  const { replayCandles, replayTradeEvents } = useReplayChartData(activeAccountId);
  const chartPrefs = useChartPreferences();
  const cycleMagnetMode = useCallback(() => {
    const order: MagnetMode[] = ["none", "weak", "strong"];
    const next = order[(order.indexOf(chartPrefs.magnetMode) + 1) % order.length] ?? "none";
    updateChartPreferences({ magnetMode: next });
  }, [chartPrefs.magnetMode]);
  useReplayPlayback(activeAccountId ?? "");
  const { data: positions = [] } = usePositions(activeAccountId);
  const { data: orders = [] } = useOrders(activeAccountId);
  const chartPositions = chartPrefs.overlayPositionsOnChart ? positions : [];
  const chartOrders = chartPrefs.overlayPositionsOnChart ? orders : [];
  const positionPnl = useMemo(
    () => positions.reduce((sum, position) => sum + (position.unrealizedPnl || 0), 0),
    [positions],
  );

  // (#26) Trade journal
  const { data: journalData, isLoading: journalLoading } = useJournalEntries(activeAccountId);
  const createJournal = useCreateJournalEntry();
  const updateJournal = useUpdateJournalEntry();
  const deleteJournal = useDeleteJournalEntry();

  // Get account data for risk display
  const account = useTradingStore((s) => s.accounts.find((a) => a.id === activeAccountId));

  const tick = ticks[selectedSymbol];
  const symbolInfo = symbols.find((s) => s.name === selectedSymbol) as Symbol | undefined;
  const liveCandleUpdates = useTradingStore((s) => s.liveCandleUpdates);
  const liveCandle = liveCandleUpdates[`${selectedSymbol}:${timeframe}`];
  const pipDigits = useMemo(
    () => getPipDigits(symbolInfo, selectedSymbol),
    [symbolInfo, selectedSymbol],
  );

  const isDark = !document.documentElement.classList.contains("light");

  // Mobile trading state
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Mobile Account Bar (small screens only) ────── */}
      <div className="md:hidden">
        {isKbMode ? (
          <div className="border-b border-border bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            KB read-only mode · Portfolio unavailable
          </div>
        ) : (
          <MobileAccountBar
            balance={account?.balance ?? 0}
            equity={account?.equity ?? account?.balance ?? 0}
            margin={account?.margin ?? 0}
            pnl={positionPnl}
          />
        )}
      </div>

      {/* ── Top Toolbar ──────────────────────────────────── */}
      <ChartToolbar
        selectedSymbol={selectedSymbol}
        symbols={symbols}
        onSymbolChange={setSelectedSymbol}
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        activeIndicators={activeIndicators}
        onToggleIndicator={(type) =>
          setActiveIndicators((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
          )
        }
        showIndicatorMenu={showIndicatorMenu}
        onToggleIndicatorMenu={() => setShowIndicatorMenu((v) => !v)}
        drawingTool={drawingTool}
        onDrawingTool={setDrawingTool}
        drawings={drawings}
        onClearDrawings={clearDrawings}
        rightPanel={rightPanel}
        onRightPanel={setRightPanel}
        showRightPanel={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel((v) => !v)}
        tick={isKbMode ? undefined : tick}
        symbolInfo={isKbMode ? undefined : symbolInfo}
        aiTraderEnabled={isKbMode ? false : (aiTraderEnabled?.enabled ?? false)}
        isReplaying={isReplaying}
        replayAccountId={isKbMode ? null : activeAccountId}
        activePlugins={activePlugins}
        onTogglePlugin={handleTogglePlugin}
        onSetIndicators={setActiveIndicators}
        onSetPlugins={handleSetPlugins}
        magnetMode={chartPrefs.magnetMode}
        onCycleMagnet={cycleMagnetMode}
        stayInDrawingMode={chartPrefs.stayInDrawingMode}
        onToggleStayInDrawingMode={() =>
          updateChartPreferences({ stayInDrawingMode: !chartPrefs.stayInDrawingMode })
        }
        kbManual={
          isKbMode
            ? {
                accounts: kbAccounts,
                accountId: kbAccountId,
                market: kbMarket,
                queryMarket: kbQueryMarket,
                ticker: kbTicker,
                pending: kbPending,
                status: kbStatus,
                error: kbError,
                onAccountChange: (value) => {
                  invalidateKbResult();
                  setKbAccountId(value);
                },
                onMarketChange: (value) => {
                  invalidateKbResult();
                  setKbMarket(value);
                  setKbQueryMarket(value === "US" ? "NAS" : "KOSPI");
                  setKbTicker("");
                },
                onQueryMarketChange: (value) => {
                  invalidateKbResult();
                  setKbQueryMarket(value);
                },
                onTickerChange: setKbTicker,
                onSubmit: () => void submitKbSnapshot(),
              }
            : undefined
        }
      />

      {!isKbMode && <MarketClosedBanner symbolInfo={symbolInfo} />}

      {/* ── Main Layout ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Chart + Bottom Panel */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chart Area */}
          <div className="flex-1 min-h-[200px] relative">
            <ChartPanel
              candles={isKbMode ? kbCandles : (replayCandles ?? candles)}
              selectedSymbol={selectedSymbol}
              timeframe={replayCandles ? "1m" : timeframe}
              isDark={isDark}
              activeIndicators={activeIndicators}
              drawingTool={drawingTool}
              drawings={drawings}
              onAddDrawing={addDrawing}
              onUpdateDrawing={updateDrawing}
              onRemoveDrawing={removeDrawing}
              onDrawingComplete={() => setDrawingTool("none")}
              onDrawingToolSelect={setDrawingTool}
              onUndoDrawing={undoDrawing}
              onRedoDrawing={redoDrawing}
              magnetMode={chartPrefs.magnetMode}
              stayInDrawingMode={chartPrefs.stayInDrawingMode}
              positions={isKbMode ? [] : chartPositions}
              orders={isKbMode ? [] : chartOrders}
              tick={isKbMode || replayCandles ? undefined : tick}
              liveCandle={isKbMode || replayCandles ? undefined : liveCandle}
              pipDigits={isKbMode ? kbPipDigits : pipDigits}
              symbolInfo={symbolInfo}
              onModifyPosition={isKbMode ? undefined : handleChartModifyPosition}
              replayTradeEvents={replayTradeEvents}
              isReplaying={isReplaying}
              dataMode={isKbMode ? "manual-daily" : "streaming"}
              dataIdentityKey={kbSnapshot ? kbIdentityKey(kbSnapshot) : undefined}
              manualSnapshot={isKbMode ? kbSnapshot : undefined}
              activePlugins={activePlugins}
              onTogglePlugin={handleTogglePlugin}
              accountEquity={isKbMode ? 0 : (account?.equity ?? account?.balance ?? 0)}
              accountId={isKbMode ? null : activeAccountId}
              onQuickOrder={isKbMode ? undefined : handleQuickOrder}
              onClearDrawings={clearDrawings}
              onClearIndicators={handleClearIndicators}
            />
          </div>

          {/* Replay timeline scrubber — disabled until the feature is QA'd */}
          {REPLAY_ENABLED && isReplaying && activeAccountId != null && (
            <ReplayScrubber accountId={activeAccountId} />
          )}

          {/* ── Resize Handle ── */}
          <div
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className="hidden md:flex h-1.5 cursor-row-resize items-center justify-center hover:bg-primary/20 active:bg-primary/30 transition-colors group border-t border-border bg-secondary/40 touch-none"
          >
            <div className="w-8 h-0.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
          </div>

          {/* Bottom Panel (Positions / Orders / Journal / Calendar / News) */}
          {isKbMode ? (
            <ReadOnlyUnavailable
              height={bottomPanelHeight}
              title="Trading activity unavailable"
              detail="Positions, orders and journal activity are disabled in KB read-only mode."
            />
          ) : (
          <BottomPanel
            tab={bottomTab}
            onTabChange={setBottomTab}
            positions={positions}
            orders={orders}
            accountId={activeAccountId}
            onModifyPosition={setModifyingPosition}
            onModifyOrder={setModifyingOrder}
            onSelectPositionSymbol={setSelectedSymbol}
            onSelectOrderSymbol={setSelectedSymbol}
            aiTraderEnabled={aiTraderEnabled?.enabled ?? false}
            height={bottomPanelHeight}
            isFeedConnected={isFeedConnected}
            journalEntries={journalData?.entries || []}
            journalLoading={journalLoading}
            onCreateJournal={(data: CreateJournalEntryInput) =>
              createJournal.mutate(data, {
                onSuccess: () => toast.success("Journal", "Entry saved"),
                onError: (err: unknown) =>
                  toast.error("Journal", getErrorMessage(err) || "Failed to save"),
              })
            }
            onUpdateJournal={(id: string, data: UpdateJournalEntryInput) =>
              updateJournal.mutate(
                { id, accountId: activeAccountId!, ...data },
                {
                  onSuccess: () => toast.success("Journal", "Entry updated"),
                  onError: (err: unknown) =>
                    toast.error("Journal", getErrorMessage(err) || "Failed to update"),
                },
              )
            }
            onDeleteJournal={(id: string) =>
              deleteJournal.mutate(
                { id, accountId: activeAccountId! },
                {
                  onSuccess: () => toast.success("Journal", "Entry deleted"),
                  onError: (err: unknown) =>
                    toast.error("Journal", getErrorMessage(err) || "Failed to delete"),
                },
              )
            }
          />
          )}
        </div>

        {/* Right Panel */}
        {showRightPanel && (
          <div className="hidden md:flex w-full md:w-[280px] xl:w-[320px] border-t md:border-t-0 md:border-l border-border flex-col bg-card overflow-hidden shrink-0 md:max-h-none">
            {isKbMode ? (
              <ReadOnlyUnavailable
                title="Panel unavailable"
                detail="Order entry, market depth, portfolio and AI trading are disabled in KB read-only mode."
              />
            ) : rightPanel === "order" ? (
              <OrderPanel
                symbol={selectedSymbol}
                symbolInfo={symbolInfo}
                tick={tick}
                accountId={activeAccountId}
                oneClick={oneClick}
                onToggleOneClick={toggleOneClick}
                onConfirmOrder={setConfirmOrder}
                accountBalance={account?.balance}
                isFeedConnected={isFeedConnected}
                soundMuted={soundMuted}
                onToggleMute={toggleSoundMute}
                onOrderSuccess={() => {
                  playTradeSound();
                  handleFirstTrade();
                }}
              />
            ) : null}
            {!isKbMode && rightPanel === "dom" && <DOMPanel symbol={selectedSymbol} tick={tick} />}
            {!isKbMode && rightPanel === "watchlist" && (
              <WatchlistPanel
                symbols={symbols}
                ticks={ticks}
                selectedSymbol={selectedSymbol}
                onSelect={setSelectedSymbol}
                oneClick={oneClick}
                accountId={activeAccountId}
                isFeedConnected={isFeedConnected}
              />
            )}
            {!isKbMode && rightPanel === "news" && (
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <MarketNewsFeed symbol={selectedSymbol} />
              </div>
            )}
            {!isKbMode && rightPanel === "ai-trader" && (
              <div className="flex-1 overflow-hidden">
                <AiTraderPanel accountId={activeAccountId} />
              </div>
            )}
            {!isKbMode && rightPanel === "tv-analysis" && (
              <div className="flex-1 overflow-hidden">
                <TradingViewTechnicalAnalysis
                  symbol={selectedSymbol}
                  theme={isDark ? "dark" : "light"}
                  interval={timeframe}
                  width="100%"
                  height="100%"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile Trading Panel (small screens only) ──── */}
      {!isKbMode && <div className="md:hidden">
        {!mobilePanelOpen && (
          <button
            onClick={() => setMobilePanelOpen(true)}
            className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-2xl font-bold">$</span>
          </button>
        )}
        {mobilePanelOpen && (
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto bg-card border-t border-border rounded-t-2xl shadow-2xl safe-area-bottom">
            <div className="flex justify-center py-1">
              <button
                onClick={() => setMobilePanelOpen(false)}
                className="w-10 h-1.5 rounded-full bg-muted-foreground/30"
              />
            </div>
            <MobileTradingPanel
              symbol={selectedSymbol}
              bid={tick?.bid}
              ask={tick?.ask}
              positions={positions || []}
              onPlaceOrder={(order) => {
                if (oneClick) {
                  api
                    .placeOrder({ ...order, accountId: activeAccountId! } as PlaceOrderInput)
                    .catch(() => {});
                  setMobilePanelOpen(false);
                  return;
                }
                setConfirmOrder({
                  ...order,
                  _submit: () =>
                    api.placeOrder({ ...order, accountId: activeAccountId! } as PlaceOrderInput),
                });
                setMobilePanelOpen(false);
              }}
            />
          </div>
        )}
      </div>}

      {/* Dialogs */}
      {!isKbMode && <>
      <PositionModifyDialog
        position={modifyingPosition}
        onClose={() => setModifyingPosition(null)}
        onSaved={() => setModifyingPosition(null)}
        tick={tick}
        isFeedConnected={isFeedConnected}
      />
      <OrderModifyDialog
        order={modifyingOrder}
        onClose={() => setModifyingOrder(null)}
        onSaved={() => setModifyingOrder(null)}
        tick={tick}
      />
      <OrderConfirmDialog
        isOpen={!!confirmOrder}
        order={confirmOrder}
        onConfirm={() => {
          if (confirmOrder?._submit) {
            setConfirmLoading(true);
            confirmOrder
              ._submit()
              .then(() => {
                playTradeSound();
                handleFirstTrade();
              })
              .finally(() => {
                setConfirmLoading(false);
                setConfirmOrder(null);
              });
          }
        }}
        onCancel={() => setConfirmOrder(null)}
        tick={tick}
        symbolInfo={symbolInfo}
        loading={confirmLoading}
      />
      </>}
    </div>
  );
}

function ReadOnlyUnavailable({
  title,
  detail,
  height,
}: {
  title: string;
  detail: string;
  height?: number;
}) {
  return (
    <section
      className="flex min-h-24 flex-1 flex-col items-center justify-center gap-1 border-border bg-card px-4 text-center"
      style={height === undefined ? undefined : { height }}
      aria-label={title}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-md text-xs text-muted-foreground">{detail}</p>
    </section>
  );
}

function kbIdentityKey(identity: MarketSnapshotIdentity): string {
  return `${identity.account_id}:${identity.market}:${identity.query_market}:${identity.symbol}`;
}

function validateKbInput(
  accountId: string,
  market: MarketSnapshotIdentity["market"],
  queryMarket: MarketSnapshotIdentity["query_market"],
  symbol: string,
): string {
  if (!accountId) return "조회할 계좌를 선택해 주세요.";
  const routeMatches =
    market === "US"
      ? queryMarket === "NAS" || queryMarket === "NYS" || queryMarket === "AMX"
      : queryMarket === "KOSPI" || queryMarket === "KOSDAQ";
  if (!routeMatches) return "조회 시장을 다시 선택해 주세요.";
  if (market === "KR" && !/^\d{6}$/.test(symbol)) {
    return "국내 종목 코드는 앞자리 0을 포함한 6자리 숫자여야 합니다.";
  }
  if (market === "US" && !/^[A-Z0-9][A-Z0-9.-]{0,11}$/.test(symbol)) {
    return "미국 종목 코드를 1~12자의 영문, 숫자, 점 또는 하이픈으로 입력해 주세요.";
  }
  return "";
}

function kbErrorText(error: unknown): string {
  if (error instanceof MarketSnapshotError) {
    if (error.code === "provider_contract_unverified") return "선택한 시장은 아직 활성화되지 않았습니다.";
    if (error.code === "no_data") return "해당 종목의 시장 데이터가 없습니다.";
    if (error.code === "provider_timeout") return "시장 데이터 제공자가 응답하지 않았습니다.";
    return error.message;
  }
  return "시장 데이터를 불러오지 못했습니다.";
}
