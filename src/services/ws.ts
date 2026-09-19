/**
 * Runtime WebSocket client.
 *
 * Demo modules are loaded only after a demo-mode call. KB mode exposes the same
 * inert public surface without evaluating or starting the demo bus/feed.
 */
import { isKbMode } from "./runtimeMode";

export type ConnectionState = "connected" | "connecting" | "reconnecting" | "disconnected";
export type WsHandler = (event: unknown) => void;

class RuntimeWsClient {
  private _state: ConnectionState = "disconnected";
  private stateListeners = new Set<(s: ConnectionState) => void>();
  private generation = 0;

  get state(): ConnectionState {
    return this._state;
  }

  private setState(next: ConnectionState): void {
    this._state = next;
    for (const cb of this.stateListeners) cb(next);
  }

  connect(_token?: string): void {
    if (isKbMode) return;
    const generation = ++this.generation;
    this.setState("connecting");
    void import("./demo/feed.ts").then(({ startDemoFeed }) => {
      if (generation !== this.generation || this._state === "disconnected") return;
      startDemoFeed();
      setTimeout(() => {
        if (generation === this.generation && this._state !== "disconnected") {
          this.setState("connected");
        }
      }, 0);
    });
  }

  disconnect(): void {
    this.generation += 1;
    this.setState("disconnected");
  }

  reauthenticate(_token: string): void {
    // No auth in demo mode — nothing to refresh.
  }

  subscribe(channel: string, handler: WsHandler): () => void {
    if (isKbMode) return () => undefined;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void import("./demo/bus.ts").then(({ subscribeChannel }) => {
      if (active) unsubscribe = subscribeChannel(channel, handler);
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }

  subscribeAccounts(_accountIds: string[]): void {
    // All account events already flow through the "account" channel.
  }

  setSymbolInterest(_symbols: string[]): void {
    // The demo feed streams every symbol; nothing to gate.
  }

  onStateChange(cb: (s: ConnectionState) => void): () => void {
    this.stateListeners.add(cb);
    cb(this._state);
    return () => {
      this.stateListeners.delete(cb);
    };
  }

  /** Allow the engine/feed to push events through the same client (parity helper). */
  emit(channel: string, event: unknown): void {
    if (isKbMode) return;
    void import("./demo/bus.ts").then(({ publish }) => publish(channel, event));
  }
}

export const wsClient = new RuntimeWsClient();
