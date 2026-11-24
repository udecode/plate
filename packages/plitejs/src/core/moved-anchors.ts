import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import { type Range, RangeApi } from '../interfaces/range';
import { getDefined } from '../internal/get-defined';
import {
  type AnchorPlace,
  type AnchorStateListener,
  getMovableAnchors,
  placeAnchorsOnCommit,
} from './anchor-state';
import { mapInternalDocumentChangePosition } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { coversContent } from './change/range-content';
import { isEditorDraftView } from './document-recorder';
import { type DraftTrack, settleDraftTrack } from './draft-track';
import { getEditorRuntime, getEditorSchema } from './editor-runtime';
import { getTransactionSnapshot, withEditorRootChildren } from './public-state';

type TokenKind = 'text' | `${'block' | 'void'}-${'open' | 'close'}`;
type Token = readonly [at: number, kind: TokenKind, letter?: string];

export type MovedAnchors = Readonly<{
  anchors: ReadonlyArray<readonly [AnchorStateListener, number, number]>;
  from: number;
  root: string;
  struck: boolean;
  to: number;
  tokens: readonly Token[];
}>;

const SUSPENDED_PLACEMENT = new WeakMap<object, number>();

export const suspendMovePlacement = (editor: object) => {
  let bound = true;

  SUSPENDED_PLACEMENT.set(editor, (SUSPENDED_PLACEMENT.get(editor) ?? 0) + 1);

  return () => {
    if (!bound) return;
    bound = false;
    const left = getDefined(SUSPENDED_PLACEMENT.get(editor)) - 1;

    if (left > 0) SUSPENDED_PLACEMENT.set(editor, left);
    else SUSPENDED_PLACEMENT.delete(editor);
  };
};

const contentOf = (
  editor: Editor,
  index: DocumentIndex,
  from: number,
  to: number
) => {
  const tokens: Token[] = [];
  const { isVoid } = getEditorSchema(editor);

  for (const entry of index.nodeRangesTouching(from, to)) {
    if (entry.kind === 'text') {
      const { text } = index.node(entry.path) as { text: string };
      const end = Math.min(to, entry.contentTo);

      for (let at = Math.max(from, entry.contentFrom); at < end; at++) {
        tokens.push([at, 'text', text[at - entry.contentFrom]]);
      }
    } else {
      const node = index.node(entry.path) as Element;
      const kind = isVoid(node) ? 'void' : 'block';

      if (entry.from >= from && entry.from < to) {
        tokens.push([
          entry.from,
          `${kind}-open`,
          kind === 'void' ? node.type : undefined,
        ]);
      }
      if (entry.to > from && entry.to <= to) {
        tokens.push([entry.to - 1, `${kind}-close`]);
      }
    }
  }

  return tokens.sort((left, right) => left[0] - right[0]);
};

export const collectMovedAnchors = (
  editor: Editor,
  root: string,
  source: Range
): MovedAnchors | null => {
  const { builder } = getDefined(getTransactionSnapshot(editor));

  if (SUSPENDED_PLACEMENT.has(editor)) return null;

  const index = builder.getIndex(root);
  const schema = getEditorSchema(editor);
  const [from, to] = RangeApi.edges(source).map((point) =>
    index.positionAt(point)
  );
  const tokenHoldsContent = (at: number) =>
    index
      .nodeRangesTouching(at, at + 1)
      .some((entry) =>
        entry.kind === 'text'
          ? entry.contentFrom <= at && at < entry.contentTo
          : entry.from <= at &&
            at < entry.to &&
            schema.isVoid(index.node(entry.path) as Descendant)
      );
  let low = from;

  while (low > 0 && !tokenHoldsContent(low - 1)) low -= 1;

  const keys = withEditorRootChildren(editor, root, () =>
    index
      .nodeRangesTouching(Math.max(0, low - 1), Math.min(index.length, to + 1))
      .flatMap(({ path }) => getEditorRuntime(editor).getNodeKey(path) ?? [])
  );
  const kept: Array<readonly [AnchorStateListener, readonly number[]]> = [];

  for (const listener of getMovableAnchors(editor, keys)) {
    const span =
      listener.root === root &&
      listener.move?.span(
        index,
        builder.value as unknown as EditorDocumentValue
      );

    if (!span) continue;

    const first = Math.min(...span);
    const last = Math.max(...span);

    if (
      !coversContent(index, first, from, schema) &&
      !coversContent(index, to, last, schema) &&
      coversContent(index, Math.max(first, from), Math.min(last, to), schema)
    ) {
      kept.push([listener, span]);
    }
  }
  if (kept.length === 0) return null;

  const tokens = contentOf(editor, index, from, to);
  const tokensBefore = (position: number) => {
    let below = 0;
    let above = tokens.length;

    while (below < above) {
      const middle = (below + above) >> 1;

      if (tokens[middle][0] < position) below = middle + 1;
      else above = middle;
    }

    return below;
  };

  return {
    anchors: kept.map(
      ([listener, span]) =>
        [listener, tokensBefore(span[0]), tokensBefore(span[1])] as const
    ),
    from,
    root,
    struck: isEditorDraftView(editor),
    to,
    tokens,
  };
};

const runOf = (tokens: readonly Token[], kind: TokenKind, last: boolean) => {
  let count = 0;

  while (tokens.at(last ? -1 - count : count)?.[1] === kind) count += 1;

  return count;
};

const trimWrapperBlocks = (tokens: Token[], moved: readonly Token[]) =>
  tokens.slice(
    Math.max(
      0,
      runOf(tokens, 'block-open', false) - runOf(moved, 'block-open', false)
    ),
    tokens.length -
      Math.max(
        0,
        runOf(tokens, 'block-close', true) - runOf(moved, 'block-close', true)
      )
  );

export const placeMovedAnchors = (
  editor: Editor,
  moved: MovedAnchors,
  track: DraftTrack
) =>
  placeAnchorsOnCommit(editor, (context, place) => {
    const spans = settleDraftTrack(track);

    if (!spans?.length) return;

    const after = context.afterRoot(moved.root);
    const landFrom = spans[0].from;
    const landTo = getDefined(spans.at(-1)).to;
    const [from, to] = [moved.from, moved.to].map((position, end) =>
      mapInternalDocumentChangePosition(
        context.change,
        moved.root,
        position,
        end ? -1 : 1
      )
    );
    const struckSource =
      moved.struck && from !== null && to !== null
        ? [
            [from, Math.min(to, landFrom)],
            [Math.max(from, landTo), to],
          ]
            .filter(([start, end]) => start < end)
            .flatMap(([start, end]) => contentOf(editor, after, start, end))
        : [];
    const matchingMoved = (tokens: Token[]) => {
      const kept = trimWrapperBlocks(tokens, moved.tokens);

      return kept.length === moved.tokens.length &&
        kept.every(
          ([, kind, letter], at) =>
            kind === moved.tokens[at][1] && letter === moved.tokens[at][2]
        )
        ? kept
        : undefined;
    };
    const landed = matchingMoved(
      struckSource.some(([, kind]) => !kind.startsWith('block'))
        ? struckSource
        : contentOf(editor, after, landFrom, landTo)
    );

    if (!landed) return;

    const kindPastBlockEdges = (start: number, step: number) => {
      let at = start;

      while (landed[at]?.[1].startsWith('block')) at += step;

      return landed[at]?.[1];
    };
    const places = new Map<number, AnchorPlace>();
    const endPlace = (count: number): AnchorPlace => {
      const known = places.get(count);

      if (known) return known;

      const before = landed[count - 1];
      const next = landed[count];
      const anchorPlace: AnchorPlace = {
        backward: before
          ? [
              before[0] + 1,
              kindPastBlockEdges(count - 1, -1) === 'void-close' ? 1 : -1,
            ]
          : [next[0], -1],
        forward: next
          ? [next[0], kindPastBlockEdges(count, 1) === 'void-open' ? -1 : 1]
          : [before[0] + 1, 1],
      };

      places.set(count, anchorPlace);

      return anchorPlace;
    };

    for (const [listener, first, second] of moved.anchors) {
      place(listener, endPlace(first), endPlace(second));
    }
  });
