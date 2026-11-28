import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import { type Range, RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import {
  type AnchorPlace,
  type AnchorStateListener,
  getMovableAnchors,
  getPublishedAnchorValue,
  placeAnchorsOnCommit,
} from './anchor-state';
import {
  type DocumentChange,
  getInternalDocumentChangeRanges,
  mapInternalDocumentChangePosition,
} from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { coversContent } from './change/range-content';
import { isEditorDraftView } from './document-recorder';
import { type DraftTrack, settleDraftTrack } from './draft-track';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorSchema,
} from './editor-runtime';
import { getCompiledEditorSchema } from './plugin-registry';
import {
  getTransactionLanding,
  getTransactionSnapshot,
  isInTransaction,
  withEditorRootChildren,
} from './public-state';
import { withTrackedPastes } from './slice-landing';
import { areEditorJsonValuesEqual } from './value-codec';

type TokenKind = 'text' | `${'block' | 'void'}-${'open' | 'close'}`;
type Properties = Readonly<Record<string, unknown>>;
type Token = readonly [
  at: number,
  kind: TokenKind,
  letter?: string,
  properties?: Properties,
];
type Unit = readonly [from: number, to: number, isVoid: boolean];
type Piece = readonly [from: number, to: number, inner: boolean];
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
  cut: boolean;
  from: number;
  remainders: readonly Remainder[];
  removes: readonly Unit[];
  root: string;
  struck: boolean;
  to: number;
  tokens: readonly Token[];
}>;

const SUSPENDED_PLACEMENT = new WeakMap<object, number>();

export const suspendMovePlacement = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  let bound = true;

  SUSPENDED_PLACEMENT.set(owner, (SUSPENDED_PLACEMENT.get(owner) ?? 0) + 1);

  return () => {
    if (!bound) return;
    bound = false;
    const left = getDefined(SUSPENDED_PLACEMENT.get(owner)) - 1;

    if (left > 0) SUSPENDED_PLACEMENT.set(owner, left);
    else SUSPENDED_PLACEMENT.delete(owner);
  };
};

const uncarriedKeys = (editor: Editor) => {
  const compiled = getCompiledEditorSchema(editor);

  return new Set([
    ...[...compiled.properties.byId.values()].flatMap(({ key, lifecycle }) =>
      typeof key === 'string' && (lifecycle.unique || lifecycle.copy === 'drop')
        ? [key]
        : []
    ),
    ...(typeof compiled.reservedElementId?.key === 'string'
      ? [compiled.reservedElementId.key]
      : []),
  ]);
};

const propertiesOf = (
  node: Descendant,
  uncarried: ReadonlySet<string>
): Properties =>
  Object.fromEntries(
    Object.entries(node).filter(
      ([key]) => key !== 'children' && key !== 'text' && !uncarried.has(key)
    )
  );

const contentOf = (
  editor: Editor,
  index: DocumentIndex,
  from: number,
  to: number,
  uncarried?: ReadonlySet<string>
) => {
  const tokens: Token[] = [];
  const { isVoid } = getEditorSchema(editor);

  for (const entry of index.nodeRangesTouching(from, to)) {
    if (entry.kind === 'text') {
      const node = index.node(entry.path) as Descendant & { text: string };
      const marks = uncarried && propertiesOf(node, uncarried);
      const end = Math.min(to, entry.contentTo);

      for (let at = Math.max(from, entry.contentFrom); at < end; at++) {
        const letter = node.text[at - entry.contentFrom];

        tokens.push(marks ? [at, 'text', letter, marks] : [at, 'text', letter]);
      }
    } else {
      const node = index.node(entry.path) as Element;
      const kind = isVoid(node) ? 'void' : 'block';

      if (entry.from >= from && entry.from < to) {
        const type = kind === 'void' ? node.type : undefined;

        tokens.push(
          uncarried
            ? [entry.from, `${kind}-open`, type, propertiesOf(node, uncarried)]
            : [entry.from, `${kind}-open`, type]
        );
      }
      if (entry.to > from && entry.to <= to) {
        tokens.push([entry.to - 1, `${kind}-close`]);
      }
    }
  }

  return tokens.sort((left, right) => left[0] - right[0]);
};

const piecesOf = (
  editor: Editor,
  index: DocumentIndex,
  source: NodeSelection | Range
): readonly Piece[] => {
  if (!SelectionApi.isNode(source)) {
    const [from, to] = RangeApi.edges(source).map((point) =>
      index.positionAt(point)
    );

    return [[from, to, true]];
  }

  const { isVoid } = getEditorSchema(editor);

  return source.paths.map((path) => {
    const { from, to } = index.nodeRange(path);

    return isVoid(index.node(path) as Element)
      ? [from, to, false]
      : [from + 1, to - 1, true];
  });
};

const joinTokens = (
  editor: Editor,
  index: DocumentIndex,
  [, beforeTo, beforeInner]: Piece,
  [from, , inner]: Piece,
  uncarried?: ReadonlySet<string>
) => [
  ...(beforeInner
    ? contentOf(editor, index, beforeTo, beforeTo + 1, uncarried)
    : []),
  ...(inner ? contentOf(editor, index, from - 1, from, uncarried) : []),
];

const piecesContent = (
  editor: Editor,
  index: DocumentIndex,
  pieces: readonly Piece[],
  uncarried?: ReadonlySet<string>
) =>
  pieces.flatMap((piece, at) => [
    ...(at > 0
      ? joinTokens(editor, index, pieces[at - 1], piece, uncarried)
      : []),
    ...contentOf(editor, index, piece[0], piece[1], uncarried),
  ]);

const spansSkippedPiece = (
  pieces: readonly Piece[],
  heldFrom: number,
  heldTo: number,
  covers: (start: number, end: number) => boolean
) =>
  pieces.some(
    ([start], at) =>
      start > heldFrom && start <= heldTo && covers(pieces[at - 1][1], start)
  );

export const collectMovedAnchors = (
  editor: Editor,
  root: string,
  source: NodeSelection | Range,
  options: Readonly<{ cut?: true }> = {}
): MovedAnchors | null => {
  const { builder } = getDefined(getTransactionSnapshot(editor));

  if (SUSPENDED_PLACEMENT.has(getEditorRuntimeOwner(editor))) return null;

  const index = builder.getIndex(root);
  const schema = getEditorSchema(editor);
  const pieces = piecesOf(editor, index, source);
  const from = pieces[0][0];
  const to = getDefined(pieces.at(-1))[1];
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
  const struck = !options.cut && isEditorDraftView(editor);
  const kept: Array<readonly [AnchorStateListener, readonly number[]]> = [];
  const remainders: Remainder[] = [];
  let carried: readonly Unit[] | undefined;
  const moving = () =>
    (carried ??= pieces.flatMap(([start, end]) =>
      contentUnits(editor, index, start, end)
    ));

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
    const covers = (start: number, end: number) =>
      coversContent(index, Math.max(first, start), Math.min(last, end), schema);
    const held = pieces.filter(([start, end]) => covers(start, end));

    if (held.length === 0) continue;

    const heldFrom = held[0][0];
    const heldTo = getDefined(held.at(-1))[1];

    if (spansSkippedPiece(pieces, heldFrom, heldTo, covers)) continue;

    const leftOut = coversContent(index, first, heldFrom, schema);
    const rightOut = coversContent(index, heldTo, last, schema);

    if (!leftOut && !rightOut) kept.push([listener, span]);
    else if (
      leftOut !== rightOut &&
      (leftOut ? last < heldTo : heldFrom < first)
    ) {
      const [restFrom, restTo] = struck
        ? [first, last]
        : leftOut
          ? [first, heldFrom]
          : [heldTo, last];
      const content = edgeTokens(contentUnits(editor, index, restFrom, restTo));

      if (content) {
        remainders.push({
          content: [content[0][0], content[1][0] + 1],
          listener,
          reorders: !moving().some(
            ([start, end]) => start < first || end > last
          ),
          span,
        });
      }
    }
  }
  if (kept.length === 0 && remainders.length === 0) return null;

  const tokens =
    kept.length > 0 || options.cut
      ? piecesContent(
          editor,
          index,
          pieces,
          options.cut ? uncarriedKeys(editor) : undefined
        )
      : [];
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
    cut: !!options.cut,
    from,
    remainders,
    removes: options.cut ? moving() : [],
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

    const [struckFrom = null, struckTo = null] = moved.struck
      ? mapEdges([moved.from, moved.to])
      : [];
    const uncarried = moved.cut ? uncarriedKeys(editor) : undefined;
    const struckSource =
      struckFrom !== null && struckTo !== null
        ? [
            [struckFrom, Math.min(struckTo, landFrom)],
            [Math.max(struckFrom, landTo), struckTo],
          ]
            .filter(([start, end]) => start < end)
            .flatMap(([start, end]) =>
              contentOf(editor, after, start, end, uncarried)
            )
        : [];
    const matchingMoved = (tokens: Token[]) => {
      const kept = trimWrapperBlocks(tokens, moved.tokens);

      return kept.length === moved.tokens.length &&
        kept.every(
          ([, kind, letter, properties], at) =>
            kind === moved.tokens[at][1] &&
            letter === moved.tokens[at][2] &&
            areEditorJsonValuesEqual(properties, moved.tokens[at][3])
        )
        ? kept
        : undefined;
    };
    const landed = matchingMoved(
      struckSource.some(([, kind]) => !kind.startsWith('block'))
        ? struckSource
        : contentOf(editor, after, landFrom, landTo, uncarried)
    );

    if (!landed && moved.cut) return;

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

type CutSession = Readonly<{
  id: string;
  moved: MovedAnchors;
  value: EditorDocumentValue;
}>;

const CUT_SESSIONS = new WeakMap<object, CutSession>();
const PASTES = new WeakMap<object, { moved: MovedAnchors | null }>();

const removesAll = (
  change: DocumentChange,
  root: string,
  units: readonly Unit[]
) => {
  const changed = getInternalDocumentChangeRanges(change, root);

  return units.every(([from, to]) =>
    changed.some(([start, end]) => start <= from && to <= end)
  );
};

export const armCutSession = (
  editor: Editor,
  id: string,
  moved: MovedAnchors,
  change: DocumentChange
) => {
  const owner = getEditorRuntimeOwner(editor);
  const value = getPublishedAnchorValue(owner);

  CUT_SESSIONS.delete(owner);
  if (!value || !removesAll(change, moved.root, moved.removes)) return false;
  CUT_SESSIONS.set(owner, { id, moved, value });

  return true;
};

export const endCutSession = (editor: Editor) => {
  CUT_SESSIONS.delete(getEditorRuntimeOwner(editor));
};

export const dispatchPaste = <T>(
  editor: Editor,
  readCutId: () => string | null,
  run: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);

  if (PASTES.has(owner)) return run();

  const session = CUT_SESSIONS.get(owner);
  const moved =
    session &&
    session.value === getPublishedAnchorValue(owner) &&
    session.id === readCutId()
      ? session.moved
      : null;

  CUT_SESSIONS.delete(owner);
  PASTES.set(owner, { moved });
  try {
    return moved ? withTrackedPastes(owner, run) : run();
  } finally {
    PASTES.delete(owner);
  }
};

const remaindersAt = (
  editor: Editor,
  index: DocumentIndex,
  value: EditorDocumentValue,
  remainders: readonly Remainder[]
): Remainder[] =>
  remainders.flatMap((remainder) => {
    const span = remainder.listener.move?.span(index, value);
    const content =
      span &&
      edgeTokens(
        contentUnits(editor, index, Math.min(...span), Math.max(...span))
      );

    return span && content
      ? [
          {
            ...remainder,
            content: [content[0][0], content[1][0] + 1] as const,
            span,
          },
        ]
      : [];
  });

const placePasted = <T>(
  editor: Editor,
  moved: MovedAnchors,
  apply: () => T
) => {
  const { builder } = getDefined(getTransactionSnapshot(editor));

  if (builder.draftSteps.length > 0) return apply();

  const remainders = remaindersAt(
    editor,
    builder.getIndex(moved.root),
    builder.value as EditorDocumentValue,
    moved.remainders
  );
  const before = getTransactionLanding(editor);
  const result = apply();
  const track = getTransactionLanding(editor);

  if (track && track !== before && track.root === moved.root) {
    placeMovedAnchors(editor, { ...moved, remainders }, track);
  }

  return result;
};

export const landPaste = <T>(editor: Editor, apply: () => T) => {
  const owner = getEditorRuntimeOwner(editor);
  const paste = PASTES.get(owner);
  const moved = paste?.moved;

  if (!paste || !moved) return apply();

  paste.moved = null;

  const place = () => placePasted(owner, moved, apply);

  return isInTransaction(owner) ? place() : editor.update(place);
};
