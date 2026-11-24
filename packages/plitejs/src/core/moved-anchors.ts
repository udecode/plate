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
type Unit = readonly [from: number, to: number, isVoid: boolean];
type Remainder = Readonly<{
  content: readonly [from: number, to: number];
  listener: AnchorStateListener;
  reorders: boolean;
  span: readonly number[];
}>;

const contentUnits = (
  editor: Editor,
  index: DocumentIndex,
  from: number,
  to: number
) => {
  const { isVoid } = getEditorSchema(editor);
  const entries = index.nodeRangesTouching(from, to);
  const voids = entries.filter(
    (entry) =>
      entry.kind !== 'text' && isVoid(index.node(entry.path) as Element)
  );
  const units: Unit[] = [];

  for (const entry of entries) {
    if (entry.kind === 'text') {
      const start = Math.max(from, entry.contentFrom);
      const end = Math.min(to, entry.contentTo);

      if (
        start < end &&
        !voids.some((node) => node.from <= start && start < node.to)
      ) {
        units.push([start, end, false]);
      }
    } else if (voids.includes(entry) && from <= entry.from && entry.to <= to) {
      units.push([entry.from, entry.to, true]);
    }
  }

  return units;
};

const edgeTokens = (units: readonly Unit[]): readonly Token[] | null => {
  if (units.length === 0) return null;

  const first = units.reduce((left, right) =>
    right[0] < left[0] ? right : left
  );
  const last = units.reduce((left, right) =>
    right[1] > left[1] ? right : left
  );

  return [
    [first[0], first[2] ? 'void-open' : 'text'],
    [last[1] - 1, last[2] ? 'void-close' : 'text'],
  ];
};

export type MovedAnchors = Readonly<{
  anchors: ReadonlyArray<readonly [AnchorStateListener, number, number]>;
  from: number;
  remainders: readonly Remainder[];
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
  const struck = isEditorDraftView(editor);
  const kept: Array<readonly [AnchorStateListener, readonly number[]]> = [];
  const remainders: Remainder[] = [];
  let carried: readonly Unit[] | undefined;

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
    const leftOut = coversContent(index, first, from, schema);
    const rightOut = coversContent(index, to, last, schema);

    if (
      !coversContent(index, Math.max(first, from), Math.min(last, to), schema)
    ) {
      continue;
    }
    if (!leftOut && !rightOut) kept.push([listener, span]);
    else if (leftOut !== rightOut && (leftOut ? last < to : from < first)) {
      const [restFrom, restTo] = struck
        ? [first, last]
        : leftOut
          ? [first, from]
          : [to, last];
      const content = edgeTokens(contentUnits(editor, index, restFrom, restTo));

      carried ??= contentUnits(editor, index, from, to);
      if (content) {
        remainders.push({
          content: [content[0][0], content[1][0] + 1],
          listener,
          reorders: !carried.some(
            ([start, end]) => start < first || end > last
          ),
          span,
        });
      }
    }
  }
  if (kept.length === 0 && remainders.length === 0) return null;

  const tokens = kept.length > 0 ? contentOf(editor, index, from, to) : [];
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
    remainders,
    root,
    struck,
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

const placeBetween = (tokens: readonly Token[], count: number): AnchorPlace => {
  const kindPastBlockEdges = (start: number, step: number) => {
    let at = start;

    while (tokens[at]?.[1].startsWith('block')) at += step;

    return tokens[at]?.[1];
  };
  const before = tokens[count - 1];
  const next = tokens[count];

  return {
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
};

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

    const mapEdges = ([low, high]: readonly number[]) =>
      [low, high].map((position, end) =>
        mapInternalDocumentChangePosition(
          context.change,
          moved.root,
          position,
          end ? -1 : 1
        )
      );

    for (const { content, listener, reorders, span } of moved.remainders) {
      const edges = [Math.min(...span), Math.max(...span)];
      let [from, to] = mapEdges(content);

      if (from === null || to === null || from >= to) continue;
      if (reorders && !moved.struck) {
        const [low, high] = mapEdges(edges);

        if (
          low !== null &&
          high !== null &&
          low <= landFrom &&
          landTo <= high
        ) {
          from = Math.min(from, landFrom);
          to = Math.max(to, landTo);
        }
      } else if (!moved.struck && from < landFrom && landFrom < to) {
        to = landFrom;
      }

      const kept = edgeTokens(contentUnits(editor, after, from, to));

      if (!kept) continue;

      const ends = [placeBetween(kept, 0), placeBetween(kept, kept.length)];
      const [first, second] = span.map(
        (position) => ends[position === edges[0] ? 0 : 1]
      );

      place(listener, first, second);
    }
    if (moved.anchors.length === 0) return;

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

    const places = new Map<number, AnchorPlace>();
    const endPlace = (count: number) => {
      let known = places.get(count);

      if (!known) {
        known = placeBetween(landed, count);
        places.set(count, known);
      }

      return known;
    };

    for (const [listener, first, second] of moved.anchors) {
      place(listener, endPlace(first), endPlace(second));
    }
  });
