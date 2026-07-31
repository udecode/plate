import type { Range } from '@platejs/plite';
import type * as Y from 'yjs';

export type YjsAwarenessChange = {
  readonly added: readonly number[];
  readonly removed: readonly number[];
  readonly updated: readonly number[];
};

export type YjsAwarenessState = Readonly<Record<string, unknown>>;

export type YjsAwarenessLike = {
  readonly clientID?: number;
  readonly doc?: { readonly clientID: number };
  readonly getLocalState: () => YjsAwarenessState | null;
  readonly getStates: () => ReadonlyMap<number, YjsAwarenessState>;
  readonly off?: (
    event: 'change',
    handler: (event: YjsAwarenessChange) => void
  ) => void;
  readonly on?: (
    event: 'change',
    handler: (event: YjsAwarenessChange) => void
  ) => void;
  readonly setLocalStateField: (field: string, value: unknown) => void;
};

export type YjsProviderStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | (string & {});

export type YjsProviderStatusPayload =
  | YjsProviderStatus
  | {
      readonly status: YjsProviderStatus;
    };

export type YjsProviderSyncedPayload =
  | boolean
  | {
      readonly state: boolean;
    }
  | {
      readonly synced: boolean;
    };

export type YjsProviderEvent = 'status' | 'sync' | 'synced';

export type YjsProviderStatusHandler = (
  status: YjsProviderStatusPayload
) => void;

export type YjsProviderSyncedHandler = (
  synced: YjsProviderSyncedPayload
) => void;

export type YjsProviderEventHandler =
  | YjsProviderStatusHandler
  | YjsProviderSyncedHandler;

export type YjsProviderLike = {
  readonly awareness?: YjsAwarenessLike;
  readonly connect?: () => Promise<unknown> | unknown;
  readonly destroy?: () => void;
  readonly disconnect?: () => Promise<unknown> | unknown;
  readonly doc?: Y.Doc;
  readonly off?: (
    event: YjsProviderEvent,
    handler: YjsProviderEventHandler
  ) => void;
  readonly on?: (
    event: YjsProviderEvent,
    handler: YjsProviderEventHandler
  ) => void;
  status?: YjsProviderStatus;
  synced?: boolean;
};

export type YjsAwarenessSelection = {
  readonly anchor: unknown;
  readonly focus: unknown;
  readonly root: string;
};

export type YjsRemoteCursorData = Readonly<Record<string, unknown>>;

export type YjsRemoteCursor<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clientId: number;
  readonly selection: Range | null;
  readonly data?: TCursorData;
};

export type YjsTraceMode = 'canonical-change' | 'remote-reconcile' | 'seed';

export type YjsTraceFallback =
  | 'canonical-change-mirror-mismatch'
  | 'canonical-change-projected-content'
  | 'remote-event-empty-root'
  | 'remote-event-invalid-delta'
  | 'remote-event-mirror-mismatch'
  | 'remote-event-projected-content'
  | 'remote-event-read-failed'
  | 'remote-event-root-attributes'
  | 'remote-event-unknown-target';

export type YjsTraceEntry = {
  readonly canonicalStrategy?: 'compatible' | 'range';
  /** Number of top-level children inserted or removed by canonical lowering. */
  readonly changedChildren?: number;
  readonly fallback?: YjsTraceFallback;
  /** Describes the import strategy used when Yjs state is read into Plite. */
  readonly importKind?:
    | 'event-change'
    | 'full-diff-fallback'
    | 'snapshot-change';
  readonly mode: YjsTraceMode;
  /** Named document root; omitted for the primary root. */
  readonly root?: string;
  /** Number of disjoint canonical ranges compiled from the Yjs event batch. */
  readonly changedRanges?: number;
  /** Number of top-level Yjs nodes decoded for the import. */
  readonly readTopLevelNodes?: number;
  /** Number of Plite nodes visited to refresh outbound token lengths. */
  readonly tokenLengthNodes?: number;
};

export type YjsSharedEffectCompactionOptions = Readonly<{
  /**
   * Stable host-owned identity for the authority that compacts this shared
   * document's effect log. A restarted authority reuses the same identity
   * even though its Y.Doc client generation changes.
   *
   * Exactly one active peer for this identity may compact the effect log.
   * A live recipient must acknowledge or be explicitly retired by this
   * authority before its targeted events become checkpoint-safe.
   */
  authorityId: string;
  /** Compact after this many checkpoint-safe events. */
  threshold?: number;
}>;

export type YjsExtensionOptions = {
  readonly autoSendSelection?: boolean;
  readonly awareness?: YjsAwarenessLike;
  readonly awarenessDataField?: string;
  readonly awarenessSelectionField?: string;
  readonly clientId?: number | string;
  readonly destroyProviderOnUnmount?: boolean;
  readonly doc?: Y.Doc;
  readonly provider?: YjsProviderLike;
  readonly rootName?: string;
  readonly seedProviderOnSync?: boolean;
  readonly sharedEffectCompaction?: YjsSharedEffectCompactionOptions;
};

export type YjsState = {
  readonly awarenessRevision: () => number;
  readonly clientId: () => number | string;
  readonly connected: () => boolean;
  readonly doc: () => Y.Doc;
  readonly paused: () => boolean;
  readonly providerRevision: () => number;
  readonly providerStatus: () => YjsProviderStatus | null;
  readonly providerSynced: () => boolean | null;
  readonly remoteCursor: <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >(
    clientId: number
  ) => YjsRemoteCursor<TCursorData> | null;
  readonly remoteCursors: <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >() => readonly YjsRemoteCursor<TCursorData>[];
  readonly root: () => Y.XmlElement;
  readonly subscribeAwareness: (listener: () => void) => () => void;
  readonly subscribeProvider: (listener: () => void) => () => void;
  readonly trace: () => readonly YjsTraceEntry[];
};

export type YjsTx = {
  readonly clearSelection: () => void;
  readonly clearTrace: () => void;
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly pause: () => void;
  readonly reconcile: () => void;
  readonly reconnect: () => void;
  readonly resume: () => void;
  /**
   * Permanently retire one crashed Y.Doc client generation from shared-effect
   * delivery. Compaction-authority only; a returning peer needs a fresh Y.Doc.
   */
  readonly retireSharedEffectPeer: (peerId: number | string) => void;
  readonly sendCursorData: (data: YjsRemoteCursorData | null) => void;
  readonly sendSelection: (
    range?: Range | null,
    data?: YjsRemoteCursorData | null
  ) => void;
};
