import type { Range, Value } from '@platejs/plite';
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
};

export type YjsRemoteCursorData = Readonly<Record<string, unknown>>;

export type YjsRemoteCursor<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clientId: number;
  readonly selection: Range | null;
  readonly data?: TCursorData;
};

export type YjsTraceMode =
  | 'operation'
  | 'remote-reconcile'
  | 'seed'
  | 'traceable-fallback';

export type YjsTraceFallback =
  | 'empty-text-merge-elided'
  | 'incompatible-structural-merge-elided'
  | 'missing-move-destination-elided'
  | 'missing-move-source-elided'
  | 'replace-children-virtual-removal'
  | 'replace-fragment-scoped-replace-identity-risk'
  | 'text-merge-preserve-yjs-boundary'
  | 'virtual-merge-ref'
  | 'virtual-move-parent-remove'
  | 'virtual-move-placeholder'
  | 'virtual-move-ref'
  | 'virtual-unwrap-ref'
  | 'virtual-unwrap-wrapper-remove';

export type YjsTraceEntry = {
  readonly fallback?: YjsTraceFallback;
  /** Number of top-level Plite children read from Yjs during a full import. */
  readonly importedChildren?: number;
  /** Describes the import strategy used when Yjs state is read into Plite. */
  readonly importKind?: 'full-read-replace';
  readonly mode: YjsTraceMode;
  readonly operationType?: string;
};

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
  readonly redo: () => void;
  readonly resume: () => void;
  readonly sendCursorData: (data: YjsRemoteCursorData | null) => void;
  readonly sendSelection: (
    range?: Range | null,
    data?: YjsRemoteCursorData | null
  ) => void;
  readonly undo: () => void;
};

declare module '@platejs/plite' {
  interface EditorStateExtensionGroups<V extends Value = Value> {
    yjs: YjsState;
  }

  interface EditorTxExtensionGroups<V extends Value = Value> {
    yjs: YjsTx;
  }
}
