import type { DocumentChange, EditorDocumentValue } from '..';
import { getEditorRuntimeOwner } from '../core/editor-runtime';
import { MAIN_ROOT_KEY } from '../core/public-root';
import { buildSnapshotIndex } from '../core/snapshot-index';
import {
  type Carets,
  changedBookmarks,
  type EdgeCaret,
  getBookmark,
  type HistoryCaretView,
  type KeyLens,
  resolveBookmark,
  rootChildrenOf,
  sameCarets,
} from '../core/view-carets';
import type { ViewPresentation } from '../core/view-presentation';
import type { AnyEditor } from '../interfaces/editor';
import type { Batch } from './history';
import { mapHistorySelection } from './history-replay';

type KeyedEdge = Readonly<{
  carets: Carets;
  /** The document the edge's bookmarks are keyed in. */
  value: EditorDocumentValue;
}>;

/**
 * Every view's caret at a batch's edges. A batch keeps the committed books by
 * reference until history first maps it, which puts the carets it changed in
 * path form, as it keeps its selections.
 */
export type HistoryCarets =
  | Readonly<{ after: KeyedEdge; before: KeyedEdge; kind: 'keyed' }>
  | Readonly<{ kind: 'mapped'; views: readonly HistoryCaretView[] }>;

type Side = 'after' | 'before';

export const keyedHistoryCarets = (
  carets: Readonly<{ after: Carets; before: Carets }>,
  before: EditorDocumentValue,
  after: EditorDocumentValue
): HistoryCarets => ({
  after: { carets: carets.after, value: after },
  before: { carets: carets.before, value: before },
  kind: 'keyed',
});

const edgeSelection = (batch: Batch, side: Side) =>
  side === 'after'
    ? {
        root: batch.selectionAfterRoot ?? MAIN_ROOT_KEY,
        value: batch.selectionAfter,
      }
    : {
        root: batch.selectionBeforeRoot ?? MAIN_ROOT_KEY,
        value: batch.selectionBefore,
      };

export const historyCaretViews = (
  editor: AnyEditor,
  carets: HistoryCarets,
  batch: Batch
): readonly HistoryCaretView[] => {
  if (carets.kind === 'mapped') return carets.views;

  const owner = getEditorRuntimeOwner(editor);
  const lenses = new Map<string, KeyLens>();
  const lens = (side: Side, root: string) => {
    const key = `${side}:${root}`;
    let found = lenses.get(key);

    if (!found) {
      found = buildSnapshotIndex(
        owner,
        rootChildrenOf(() => carets[side].value, root)()
      );
      lenses.set(key, found);
    }

    return found;
  };
  const caretAt = (
    side: Side,
    presentation: ViewPresentation,
    root: string
  ): EdgeCaret | null => {
    const { book, generation, owner: holder } = carets[side].carets;

    if (holder?.presentation === presentation && holder.root === root) {
      const selection = edgeSelection(batch, side);

      return {
        generation,
        selection: selection.root === root ? selection.value : null,
      };
    }

    const bookmark = getBookmark(book, presentation, root);

    return bookmark
      ? {
          generation: bookmark.generation,
          selection: resolveBookmark(lens(side, root), bookmark),
        }
      : null;
  };
  const views = new Map<ViewPresentation, Set<string>>();
  const add = (presentation: ViewPresentation, root: string) => {
    views.set(presentation, (views.get(presentation) ?? new Set()).add(root));
  };

  for (const [presentation, root] of changedBookmarks(
    carets.after.carets.book,
    carets.before.carets.book
  )) {
    add(presentation, root);
  }
  for (const side of ['before', 'after'] as const) {
    const holder = carets[side].carets.owner;

    if (holder) add(holder.presentation, holder.root);
  }

  return [...views].flatMap(([presentation, roots]) =>
    [...roots].map((root) => ({
      after: caretAt('after', presentation, root),
      before: caretAt('before', presentation, root),
      presentation,
      root,
    }))
  );
};

type EdgeMapping = Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
}>;

const mapEdge = (
  editor: AnyEditor,
  edge: EdgeCaret | null,
  root: string,
  mapping: () => EdgeMapping
): EdgeCaret | null => {
  if (!edge?.selection) return edge;

  const { after, before, change } = mapping();

  return {
    ...edge,
    selection: mapHistorySelection(
      editor,
      edge.selection,
      change,
      before,
      after,
      root
    ),
  };
};

export const mapHistoryCarets = (
  editor: AnyEditor,
  carets: HistoryCarets,
  batch: Batch,
  mappings: Readonly<Record<Side, EdgeMapping>>
): HistoryCarets => ({
  kind: 'mapped',
  views: historyCaretViews(editor, carets, batch).map((view) => ({
    ...view,
    after: mapEdge(editor, view.after, view.root, () => mappings.after),
    before: mapEdge(editor, view.before, view.root, () => mappings.before),
  })),
});

const once = <T>(read: () => T) => {
  let value: { current: T } | undefined;

  return () => (value ??= { current: read() }).current;
};

/**
 * The carets of a batch that merges `next` into `previous`: the first edge of
 * `previous` and the last of `next`. A view only one of them changed gets its
 * other edge mapped through the commit it sat out.
 */
export const mergeHistoryCarets = (
  editor: AnyEditor,
  previous: Readonly<{
    batch: Batch;
    carets: HistoryCarets | null;
    /** Maps a caret after `previous` to before it. */
    undo: () => EdgeMapping;
  }>,
  next: Readonly<{
    batch: Batch;
    carets: HistoryCarets | null;
    /** Maps a caret before `next` to after it. */
    redo: () => EdgeMapping;
  }>
): HistoryCarets | null => {
  if (!previous.carets || !next.carets) return null;
  if (previous.carets.kind === 'keyed' && next.carets.kind === 'keyed') {
    const nothingPlacedBetween = sameCarets(
      previous.carets.after.carets,
      next.carets.before.carets
    );

    if (nothingPlacedBetween) {
      return {
        after: next.carets.after,
        before: previous.carets.before,
        kind: 'keyed',
      };
    }
  }

  const undo = once(previous.undo);
  const redo = once(next.redo);
  const earlier = new Map<ViewPresentation, Map<string, HistoryCaretView>>();

  for (const view of historyCaretViews(
    editor,
    previous.carets,
    previous.batch
  )) {
    earlier.set(
      view.presentation,
      (earlier.get(view.presentation) ?? new Map()).set(view.root, view)
    );
  }

  const views: HistoryCaretView[] = [];

  for (const view of historyCaretViews(editor, next.carets, next.batch)) {
    const first = earlier.get(view.presentation)?.get(view.root);
    const placedBetween =
      (first?.after?.generation ?? null) !== (view.before?.generation ?? null);

    earlier.get(view.presentation)?.delete(view.root);
    views.push({
      ...view,
      before:
        first && !placedBetween
          ? first.before
          : mapEdge(editor, view.before, view.root, undo),
    });
  }
  for (const byRoot of earlier.values()) {
    for (const view of byRoot.values()) {
      views.push({
        ...view,
        after: mapEdge(editor, view.after, view.root, redo),
      });
    }
  }

  return { kind: 'mapped', views };
};
