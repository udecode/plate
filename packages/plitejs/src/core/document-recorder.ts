import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  EditorUpdateTag,
  Selection,
} from '../interfaces/editor';
import type { DraftStep } from './change/builder';
import type { DocumentChange } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
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
    change: DocumentChange;
    selection: Selection;
    selectionBefore: Selection;
    selectionBeforeRoot: string;
    selectionRoot: string;
    steps: readonly DraftStep[];
    tags: readonly EditorUpdateTag[];
  }>
) => Readonly<{
  /**
   * A change from the draft commands wrote to the committed draft that only
   * maps positions, so anchors made while commands ran follow the rewrite.
   */
  anchorChange?: (written: (root: string) => DocumentIndex) => DocumentChange;
  change: DocumentChange;
  indexedAfter?: ReadonlyMap<string, DocumentIndex>;
  selection: Selection;
}> | null;

/** @internal */
export type EditorDraftGuardPhase = 'plain' | 'recorded';

type DraftGuard = (written: EditorDocumentValue) => void;

const DOCUMENT_RECORDERS = new WeakMap<object, EditorDocumentRecorder>();
const DRAFT_GUARDS = new WeakMap<
  object,
  Record<EditorDraftGuardPhase, Set<DraftGuard>>
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
  phase: EditorDraftGuardPhase = 'recorded'
) => {
  const owner = getEditorRuntimeOwner(editor);
  const guards = DRAFT_GUARDS.get(owner) ?? {
    plain: new Set<DraftGuard>(),
    recorded: new Set<DraftGuard>(),
  };

  guards[phase].add(guard);
  DRAFT_GUARDS.set(owner, guards);

  return () => {
    guards[phase].delete(guard);
    if (
      guards.plain.size === 0 &&
      guards.recorded.size === 0 &&
      DRAFT_GUARDS.get(owner) === guards
    ) {
      DRAFT_GUARDS.delete(owner);
    }
  };
};

/** @internal */
export const runEditorDraftGuards = (
  editor: Editor,
  phase: EditorDraftGuardPhase,
  written: EditorDocumentValue
) => {
  for (const guard of [
    ...(DRAFT_GUARDS.get(getEditorRuntimeOwner(editor))?.[phase] ?? []),
  ]) {
    guard(written);
  }
};
