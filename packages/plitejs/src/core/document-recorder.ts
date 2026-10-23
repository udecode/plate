import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  EditorUpdateTag,
  Selection,
} from '../interfaces/editor';
import type { DraftStep } from './change/builder';
import type { DocumentChange } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import type { CommandProjection } from './command-document';
import { getEditorRuntimeOwner } from './editor-runtime';

/**
 * Rewrites a transaction's canonical change before the recorded draft guards
 * run. It sees the document and selection before the transaction, every draft
 * step with the edit that made it, the composed change, and the selection
 * after it. It returns the change and the selection in `selectionRoot` to
 * commit instead, with the indexes it built for the committed document when it
 * has them, or `null` to keep the transaction.
 *
 * @internal
 */
export type EditorDocumentRecorder = (
  input: Readonly<{
    after: EditorDocumentValue;
    before: EditorDocumentValue;
    /** Views' bookmarks in `after`, each in its own root. */
    bookmarks: ReadonlyArray<Readonly<{ root: string; selection: Selection }>>;
    /** From `before`, or in a command frame from the projected document. */
    change: DocumentChange;
    /**
     * The projection of `before` a command frame's commands wrote the steps
     * on, which hides content they never saw.
     */
    projection?: CommandProjection;
    selection: Selection;
    selectionBefore: Selection;
    selectionBeforeRoot: string;
    selectionRoot: string;
    steps: readonly DraftStep[];
    tags: readonly EditorUpdateTag[];
    /** One identity per update, shared by every recording in it. */
    update: object;
  }>
) => Readonly<{
  /**
   * A change from the draft commands wrote to the committed draft that only
   * maps positions, so anchors made while commands ran follow the rewrite.
   */
  anchorChange?: (written: (root: string) => DocumentIndex) => DocumentChange;
  /** The input bookmarks in the committed draft, in order; omitted, unmoved. */
  bookmarks?: readonly Selection[];
  change: DocumentChange;
  indexedAfter?: ReadonlyMap<string, DocumentIndex>;
  /**
   * Maps a position in the draft commands wrote to the committed draft, as a
   * node's edge maps, so a node the commands inserted keeps its key.
   */
  mapPosition?: (root: string, position: number, assoc: -1 | 1) => number;
  selection: Selection;
}> | null;

/** @internal */
export type EditorDraftGuardPhase = 'plain' | 'recorded';

export type PositionMap = (
  root: string,
  position: number,
  assoc: -1 | 1
) => number | null;

/**
 * A command frame's draft: `mapPosition` maps a position of `stored` to what
 * the frame wrote.
 */
export type DraftGuardFrame = Readonly<{
  mapPosition: PositionMap;
  stored: EditorDocumentValue;
}>;

type DraftGuard = (
  written: EditorDocumentValue,
  frame?: DraftGuardFrame
) => void;

const DOCUMENT_RECORDERS = new WeakMap<object, EditorDocumentRecorder>();
const DRAFT_GUARDS = new WeakMap<
  object,
  Record<EditorDraftGuardPhase, Set<DraftGuard>> & {
    transaction: Set<() => void>;
  }
>();

/** @internal */
export const registerEditorDocumentRecorder = (
  editor: Editor,
  recorder: EditorDocumentRecorder
) => {
  const owner = getEditorRuntimeOwner(editor);

  if (DOCUMENT_RECORDERS.has(owner)) {
    throw new Error('An editor accepts one document recorder.');
  }
  DOCUMENT_RECORDERS.set(owner, recorder);

  return () => {
    if (DOCUMENT_RECORDERS.get(owner) === recorder) {
      DOCUMENT_RECORDERS.delete(owner);
    }
  };
};

/** @internal */
export const getEditorDocumentRecorder = (editor: Editor) =>
  DOCUMENT_RECORDERS.get(getEditorRuntimeOwner(editor));

const DRAFT_VIEWS = new WeakMap<object, () => boolean>();

/**
 * Register whether the active update's plain draft is a view the recorder
 * judges, such as a proposal, which is never stored, so its canonical pass
 * drops what its places cannot hold instead of refusing it.
 *
 * @internal
 */
export const registerEditorDraftView = (
  editor: Editor,
  isView: () => boolean
) => {
  const owner = getEditorRuntimeOwner(editor);

  DRAFT_VIEWS.set(owner, isView);

  return () => {
    if (DRAFT_VIEWS.get(owner) === isView) DRAFT_VIEWS.delete(owner);
  };
};

/** @internal */
export const isEditorDraftView = (editor: Editor) =>
  DRAFT_VIEWS.get(getEditorRuntimeOwner(editor))?.() ?? false;

/**
 * Register an internal guard over a transaction's draft. A `recorded` guard,
 * the default, sees the draft the transaction commits, in the projection the
 * update wrote, before authored publication reduces it to accepted content. A
 * `plain` guard sees the draft commands wrote, before a recorder rewrites it.
 *
 * @internal
 */
export const registerEditorDraftGuard = (
  editor: Editor,
  guard: DraftGuard,
  phase: EditorDraftGuardPhase = 'recorded',
  lifetime: 'release' | 'transaction' = 'release'
) => {
  const owner = getEditorRuntimeOwner(editor);
  const guards = DRAFT_GUARDS.get(owner) ?? {
    plain: new Set<DraftGuard>(),
    recorded: new Set<DraftGuard>(),
    transaction: new Set<() => void>(),
  };
  const release = () => {
    guards[phase].delete(guard);
    guards.transaction.delete(release);
    if (
      guards.plain.size === 0 &&
      guards.recorded.size === 0 &&
      DRAFT_GUARDS.get(owner) === guards
    ) {
      DRAFT_GUARDS.delete(owner);
    }
  };

  guards[phase].add(guard);
  if (lifetime === 'transaction') guards.transaction.add(release);
  DRAFT_GUARDS.set(owner, guards);

  return release;
};

/** @internal */
export const endEditorTransactionDraftGuards = (editor: Editor) => {
  for (const release of [
    ...(DRAFT_GUARDS.get(getEditorRuntimeOwner(editor))?.transaction ?? []),
  ]) {
    release();
  }
};

/** @internal */
export const runEditorDraftGuards = (
  editor: Editor,
  phase: EditorDraftGuardPhase,
  written: EditorDocumentValue,
  frame?: DraftGuardFrame
) => {
  for (const guard of [
    ...(DRAFT_GUARDS.get(getEditorRuntimeOwner(editor))?.[phase] ?? []),
  ]) {
    guard(written, frame);
  }
};
