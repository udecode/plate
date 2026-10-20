import type {
  AnyEditor,
  ContentSlice,
  EditorViewOptions,
  NodeKey,
} from '../interfaces/editor';
import type { EditorJsonValue } from '../interfaces/json';
import type { Location } from '../interfaces/location';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { AuthoredMark } from './tree/marks';

export type AuthoredChangeKind =
  | 'delete'
  | 'format'
  | 'insert'
  | 'mixed'
  | 'structure';

/** One pending change, read from the review marks it left in the document. */
export type AuthoredChange = Readonly<{
  authorId: string;
  createdAt: number;
  id: string;
  kind: AuthoredChangeKind;
  /**
   * Where the change's marks sit in the stored document, read on any view:
   * a preview shows the document another way, so they can name other
   * content there.
   */
  ranges: readonly Range[];
  /**
   * Differs whenever the change's marks differ, and with them what each kind
   * covers. An insertion, deletion or format change covers the content it
   * marks. A join, split, wrap or unwrap covers its element's own fields and
   * the order and shapes of the elements inside it, never their text, so
   * typing inside it keeps the revision. A join or a block split also covers
   * its index at each level inside its top-level block, so a block landing
   * among or leaving from the blocks before it, or before one of its
   * ancestors there, changes the revision. The index counts blocks, so
   * reordering, replacing or retyping the blocks before it keeps the
   * revision, although the block a decision merges its line into can change.
   * No other revision covers where the change sits, so an edit before it
   * keeps it.
   */
  revision: number;
}>;

/** One semantic part of a change, derived only when its details are read. */
export type AuthoredChangePart =
  | Readonly<{
      action: 'delete' | 'insert' | 'replace';
      after: ContentSlice | null;
      before: ContentSlice | null;
      kind: 'content';
      range: Range;
    }>
  | Readonly<{ action: 'join' | 'split'; at: Point; kind: 'boundary' }>
  | Readonly<{
      action: 'unwrap' | 'wrap';
      kind: 'enclosure';
      path: Path;
      type: string;
    }>
  | Readonly<{
      after: Readonly<Record<string, unknown>>;
      before: Readonly<Record<string, unknown>>;
      kind: 'properties';
      nodeKind: 'element' | 'text';
      path: Path;
    }>;

/** A change's parts, with ranges, points and paths in the stored document. */
export type AuthoredChangeDetails = Readonly<{
  change: AuthoredChange;
  parts: readonly AuthoredChangePart[];
}>;

/**
 * Adjacent pending changes by one author that one card shows, such as a
 * deletion and the insertion that replaces it. Its id is its oldest change by
 * `createdAt`, then id, so every peer and reload names it alike; the id
 * moves when the card splits or merges, or when that change leaves it.
 * `revision` changes when a change joins or leaves the card or a member's
 * revision changes.
 */
export type AuthoredChangeGroup = Readonly<{
  authorId: string;
  changeCount: number;
  createdAt: number;
  id: string;
  revision: number;
}>;

export type AuthoredQuery = Readonly<{
  /**
   * Only changes touching this place of the document the view shows. With
   * no preview that is the stored document. On a preview it is a node's key
   * or path of the shown document, such as a block or one of its texts,
   * which reads the changes on the stored content the node shows, with what
   * the preview hides inside it and the changes on each element around it
   * that the preview takes away. Content the preview hides between two texts
   * of a block reads on the block, never on either text. A key the preview
   * lacks reads nothing, and a point or a range throws `AuthoredPlaceError`.
   */
  at?: Location | NodeKey;
  authorId?: string;
  cursor?: string;
  /** Only the changes of the card holding this change. */
  group?: string;
  limit?: number;
}>;

export type AuthoredPage = Readonly<{
  cursor: string | null;
  items: readonly AuthoredChange[];
}>;

/**
 * What one commit changed in the review, shared by every listener of a view.
 */
export type AuthoredChangesDelta = Readonly<{
  /**
   * Top-level blocks of the view whose read of changes or cards may differ:
   * each one a change reached or left, including one the commit did not
   * write and one a change was moved wholly out of, and each one holding a
   * change whose card id changed. Under a preview they are the blocks it
   * shows.
   */
  blocks: readonly NodeKey[];
  /** Pending changes that began or whose revision changed. */
  changed: readonly string[];
  /** Cards whose summary changed, that began or that ended, by id. */
  groups: readonly string[];
  /** Changes no longer pending. */
  removed: readonly string[];
}>;

/**
 * The changes or cards to decide, as they were read. A card decides every
 * change it holds now, and reads as stale once its id or revision moved.
 */
export type AuthoredDecision =
  | Readonly<{
      action: 'accept' | 'reject';
      changes: readonly AuthoredChange[];
    }>
  | Readonly<{
      action: 'accept' | 'reject';
      groups: readonly AuthoredChangeGroup[];
    }>;

/**
 * `stale` names changes whose marks changed or went since they were read;
 * `blocked` names the changes the decision must take with it; `invalid` means
 * the schema refuses the decided document.
 */
export type AuthoredResult =
  | Readonly<{
      ids: readonly string[];
      status: 'applied' | 'invalid' | 'stale' | 'unchanged';
    }>
  | Readonly<{
      ids: readonly string[];
      status: 'blocked';
      with: readonly string[];
    }>;

export type AuthoredView = NonNullable<EditorViewOptions['authored']>;

export type AuthoredReview = Readonly<{
  /**
   * The accepted value of each property a pending suggestion formats, with
   * `undefined` where the accepted document has no such property.
   */
  accepted: Readonly<Record<string, EditorJsonValue | undefined>>;
  /**
   * Text an accepted deletion removed on another peer before this one typed
   * beside it; the editor removes it right after the commit that brought it.
   */
  hidden: boolean;
  /**
   * Its pending changes: its own and the insertions it sits inside, without
   * what a decision settled.
   */
  marks: readonly AuthoredMark[];
}>;

export type AuthoredOptions = Readonly<{
  /** Resolve the author once per recorded write; Suggesting requires one. */
  authorId: string | ((editor: AnyEditor) => string | null | undefined);
}>;

export type {
  AuthoredDocumentProjection,
  AuthoredProjectionDiagnostic,
  AuthoredProjectionRefusal,
} from '../core/authored-document-capability';
