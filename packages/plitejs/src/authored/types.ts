import type {
  AnyEditor,
  ContentSlice,
  EditorViewOptions,
  NodeKey,
} from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';

export type AuthoredStatus = 'accepted' | 'conflicted' | 'pending' | 'rejected';
export type AuthoredChangeKind =
  | 'delete'
  | 'format'
  | 'insert'
  | 'mixed'
  | 'structure';

/** A logical contribution; its immutable operations retain their original author. */
export type AuthoredChange = Readonly<{
  authorId: string;
  createdAt: number;
  dependencies: readonly string[];
  id: string;
  kind: AuthoredChangeKind;
  ranges: readonly Range[];
  revision: number;
  status: AuthoredStatus;
  updatedAt: number;
}>;

/** A focused authored-state publication for incremental presentation. */
export type AuthoredChangePublication = Readonly<{
  changeIds: readonly string[];
  documentChanged: boolean;
  nodeKeys: readonly NodeKey[];
}>;

export type AuthoredChangeLocation =
  | Readonly<{ index: number; kind: 'children'; path: Path }>
  | Readonly<{ kind: 'range'; range: Range }>;

export type AuthoredChangeContent = Readonly<{
  content: ContentSlice;
  location: AuthoredChangeLocation | null;
  root: string;
}>;

/** One semantic part of an authored change, derived only when its details are read. */
export type AuthoredChangePart =
  | Readonly<{
      action: 'delete' | 'insert' | 'move' | 'replace';
      after: AuthoredChangeContent | null;
      before: AuthoredChangeContent | null;
      kind: 'content';
    }>
  | Readonly<{
      action: 'join' | 'split';
      at: Point | null;
      kind: 'boundary';
      root: string;
    }>
  | Readonly<{
      after: Readonly<Record<string, unknown>>;
      before: Readonly<Record<string, unknown>>;
      kind: 'properties';
      nodeKind: 'element' | 'text';
      path: Path | null;
      root: string;
    }>
  | Readonly<{
      after: boolean;
      before: boolean;
      kind: 'root';
      root: string;
    }>;

export type AuthoredChangeReview = Readonly<{
  action: 'accept' | 'reject';
  active: boolean;
  authorId: string;
  changeIds: readonly string[];
  createdAt: number;
  id: string;
}> &
  (
    | Readonly<{
        kind: 'decision' | 'resolution';
        undoOf: null;
      }>
    | Readonly<{
        kind: 'undo';
        undoOf: string;
      }>
  );

/** A coherent change summary, semantic parts, and native review provenance. */
export type AuthoredChangeDetails = Readonly<{
  change: AuthoredChange;
  parts:
    | Readonly<{
        items: readonly AuthoredChangePart[];
        status: 'available';
      }>
    | Readonly<{
        reason: 'retention';
        status: 'unavailable';
      }>;
  reviews: readonly AuthoredChangeReview[];
}>;

export type AuthoredQuery = Readonly<{
  authorId?: string;
  cursor?: string;
  from?: number;
  limit?: number;
  status?: AuthoredStatus;
  to?: number;
}>;

export type AuthoredPage = Readonly<{
  cursor: string | null;
  items: readonly AuthoredChange[];
}>;

export type AuthoredSelection = Readonly<{
  changes: ReadonlyArray<
    Readonly<{
      heads: readonly string[];
      id: string;
      revision: number;
    }>
  >;
  documentId: string;
}>;

export type AuthoredOptions = Readonly<{
  /** Resolve the author ID once per transaction. Missing identity rejects writes. */
  authorId: string | ((editor: AnyEditor) => string | null | undefined);
  /** Retain closed content for historical reads and selective compensation. */
  retainHistory?: boolean;
}>;

export type AuthoredView = NonNullable<EditorViewOptions['authored']>;

export type AuthoredDecision = Readonly<{
  action: 'accept' | 'reject';
  selection: AuthoredSelection;
}>;

export type AuthoredResult =
  | Readonly<{ status: 'applied' | 'unchanged'; ids: readonly string[] }>
  | Readonly<{ status: 'stale'; ids: readonly string[] }>
  | Readonly<{
      status: 'blocked';
      dependencies: readonly string[];
      dependants: readonly string[];
      conflicts: readonly string[];
      ids: readonly string[];
    }>
  | Readonly<{ status: 'invalid'; reason: 'document' | 'selection' }>
  | Readonly<{
      status: 'unavailable';
      reason: 'retention';
      ids: readonly string[];
    }>;
