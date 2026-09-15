import type * as Y from 'yjs';

import type { Range } from '../../index';

export type YjsInitialReadiness = Readonly<{
  doc: Y.Doc;
  getSnapshot: () => boolean;
  subscribe: (listener: () => void) => () => void;
}>;

export type YjsAdmissionStatus =
  | Readonly<{ state: 'waiting'; reason: 'load' | 'seed' }>
  | Readonly<{ state: 'ready' }>
  | Readonly<{ state: 'error'; cause: unknown }>;

export type YjsAwarenessChange = Readonly<{
  added: readonly number[];
  removed: readonly number[];
  updated: readonly number[];
}>;

export type YjsAwarenessState = Readonly<Record<string, unknown>>;

export type YjsAwarenessLike = Readonly<{
  doc: Y.Doc;
  getLocalState: () => YjsAwarenessState | null;
  getStates: () => ReadonlyMap<number, YjsAwarenessState>;
  off: (event: 'change', handler: (event: YjsAwarenessChange) => void) => void;
  on: (event: 'change', handler: (event: YjsAwarenessChange) => void) => void;
  setLocalStateField: (field: string, value: unknown) => void;
}>;

/** Private wire shape retained for the built-in awareness codec. */
export type YjsAwarenessSelection = Readonly<{
  anchor: unknown;
  focus: unknown;
  root: string;
}>;

export type YjsRemoteCursorData = Readonly<Record<string, unknown>>;

/** Runtime contract for cursor metadata received from other collaborators. */
export type YjsCursorDataSchema<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = Readonly<{
  validate: (value: unknown) => value is TCursorData;
}>;

export type YjsRemoteCursor<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = Readonly<{
  clientId: number;
  selection: Range | null;
  data?: TCursorData;
}>;

type YjsCursorDataOption<TCursorData extends YjsRemoteCursorData> = [
  YjsRemoteCursorData,
] extends [TCursorData]
  ?
      | Readonly<{ cursorData?: never }>
      | Readonly<{ cursorData: YjsCursorDataSchema<TCursorData> }>
  : Readonly<{ cursorData: YjsCursorDataSchema<TCursorData> }>;

export type YjsPluginOptions<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = Readonly<{
  awareness?: YjsAwarenessLike;
  doc: Y.Doc;
  initialReady: true | YjsInitialReadiness;
  rootName?: string;
  seed?: true;
  sharedEffectCompaction?: Readonly<{
    /** Stable host identity for the sole active compaction authority. */
    authorityId: string;
    threshold?: number;
  }>;
}> &
  YjsCursorDataOption<TCursorData>;

export type YjsBaseApi = Readonly<{
  admissionStatus: () => YjsAdmissionStatus;
  retryImport: () => void;
  subscribeAdmissionStatus: (listener: () => void) => () => void;
}>;

export type YjsPresenceApi<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = Readonly<{
  clearSelection: () => void;
  remoteCursor: (clientId: number) => YjsRemoteCursor<TCursorData> | null;
  remoteCursors: () => ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  setCursorData: (data: TCursorData | null) => void;
  subscribeRemoteCursors: (listener: () => void) => () => void;
  syncSelection: () => void;
}>;

export type YjsCompactionApi = Readonly<{
  retireSharedEffectPeer: (clientId: number) => void;
}>;

/** Package-private diagnostics used by native tests and the benchmark. */
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

export type YjsTraceEntry = Readonly<{
  canonicalStrategy?: 'compatible' | 'range';
  changedChildren?: number;
  changedRanges?: number;
  fallback?: YjsTraceFallback;
  importKind?: 'event-change' | 'full-diff-fallback' | 'snapshot-change';
  mode: YjsTraceMode;
  readTopLevelNodes?: number;
  root?: string;
  tokenLengthNodes?: number;
}>;
