import { getInternalDocumentRootChange } from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import {
  addSection,
  mapRootChangePositionBackward,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import type { ProjectionBreak } from '../../core/command-document';
import { countCoreWork } from '../../core/work';
import { getDefined } from '../../internal/get-defined';
import {
  acceptedChange,
  decidedContentChange,
  tokenLength,
} from '../tree/alignment';
import type { AuthoredResolution } from '../tree/resolve';
import type { RunContext, RunInput } from './runs';

export const deleting = (
  length: number,
  ranges: ReadonlyArray<readonly [number, number]>
) => {
  const sections: number[] = [];
  const data: Array<PreparedTokenSlice | null> = [];
  let at = 0;

  for (const [from, to] of ranges) {
    if (from > at) {
      sections.push(from - at, -1);
      data.push(null);
    }
    sections.push(to - from, 0);
    data.push(PreparedTokenSlice.empty);
    at = to;
  }
  if (length > at) {
    sections.push(length - at, -1);
    data.push(null);
  }

  return RootChange.fromSections(sections, data);
};

export const localChange = (
  kept: readonly JsonNode[],
  output: readonly JsonNode[],
  context: RunContext
): RootChange | null => {
  const stored = { children: kept } as JsonEditorValue;
  const decided = { children: output } as JsonEditorValue;
  const change =
    context.mode === 'proposed'
      ? acceptedChange(stored, decided, { isSetValued: context.isSetValued })
      : decidedContentChange(stored, decided, {
          facts: context.facts,
          outcomes: 'reject',
        });

  return change.empty
    ? null
    : (getInternalDocumentRootChange(change, 'main') ?? null);
};

export type RunOrder = Readonly<{
  breaks: readonly ProjectionBreak[];
  hull: RootChange;
  toProjected: (local: number, assoc: -1 | 1) => number;
  toStored: (local: number, assoc: -1 | 1) => number;
  hides: (local: number) => boolean;
  added: (local: number) => Readonly<{ from: number; to: number }> | null;
  edgeInsertion: (end: boolean) => number;
}>;

type Piece = Readonly<{ from: number; to: number }>;
type Segment = Piece & Readonly<{ at: number }>;

const hidden = (change: RootChange, position: number) => {
  let before = 0;

  for (let pair = 0; pair < change.sections.length; pair += 2) {
    countCoreWork('sectionsWalked');
    const length = getDefined(change.sections[pair]);

    if (
      getDefined(change.sections[pair + 1]) >= 0 &&
      before < position &&
      position < before + length
    ) {
      return true;
    }
    before += length;
    if (before > position) return false;
  }
  return false;
};

const permute = (
  segments: readonly Segment[],
  position: number,
  assoc: -1 | 1
) => {
  const segment = segments.find(({ from, to }) =>
    assoc < 0
      ? from < position && position <= to
      : from <= position && position < to
  );

  if (segment) return segment.at + position - segment.from;
  const edge = getDefined(assoc < 0 ? segments[0] : segments.at(-1));

  return edge.at + (assoc < 0 ? 0 : edge.to - edge.from);
};

/**
 * Maps a run whose resolver lands blocks out of stored order: the stored
 * pieces permuted into landing order, then the accepted change. Null when no
 * piece moves or a landing cannot be placed.
 */
export const runOrderOf = (
  input: RunInput,
  output: readonly JsonNode[],
  landed: AuthoredResolution['landed'],
  context: RunContext
): RunOrder | null => {
  if (landed.length === 0) return null;

  const ranges = new Map<unknown, Piece>();
  const collect = (nodes: readonly JsonNode[], start: number) => {
    let at = start;

    for (const node of nodes) {
      const to = at + tokenLength(node);

      ranges.set(node, { from: at, to });
      if (node.children) collect(node.children, at + 1);
      at = to;
    }
    return at;
  };
  const length = collect(input.kept, 0);
  const moves: Array<Readonly<{ node: Piece; after: Piece }>> = [];

  for (const landing of landed) {
    const node = ranges.get(landing.node);
    const after = ranges.get(landing.after);

    if (!node || !after || (node.from <= after.from && after.to <= node.to)) {
      return null;
    }
    if (
      moves.some((move) => move.node.from < node.to && node.from < move.node.to)
    ) {
      return null;
    }
    moves.push({ node, after });
  }

  let pieces: Piece[] = [{ from: 0, to: length }];
  const splitAt = (position: number) => {
    pieces = pieces.flatMap((piece) =>
      piece.from < position && position < piece.to
        ? [
            { from: piece.from, to: position },
            { from: position, to: piece.to },
          ]
        : [piece]
    );
  };

  for (const { node, after } of moves) {
    splitAt(node.from);
    splitAt(node.to);
    splitAt(after.to);
    const moving = pieces.filter(
      (piece) => node.from <= piece.from && piece.to <= node.to
    );

    pieces = pieces.filter(
      (piece) => !(node.from <= piece.from && piece.to <= node.to)
    );
    const anchor = pieces.findIndex((piece) => piece.to === after.to);

    if (anchor === -1) return null;
    pieces.splice(anchor + 1, 0, ...moving);
  }

  let at = 0;
  const segments = pieces.map((piece) => {
    const segment = { ...piece, at };

    at += piece.to - piece.from;
    return segment;
  });

  if (segments.every((segment) => segment.from === segment.at)) return null;
  const stored = DocumentIndex.fromValue(input.kept);
  const slices = segments.map(({ from, to }) => stored.slice(from, to));
  const permuted = DocumentIndex.fromTokens(PreparedTokenSlice.concat(slices));
  const accepted =
    localChange(permuted.value, output, context) ?? RootChange.empty(length);
  const sections: number[] = [];
  const data: SectionData[] = [];
  let cursor = 0;

  for (const [index, segment] of segments.entries()) {
    const moved = moves.some(
      ({ node }) => node.from <= segment.from && segment.to <= node.to
    );
    const size = segment.to - segment.from;

    if (moved) addSection(sections, data, 0, size, getDefined(slices[index]));
    else {
      addSection(
        sections,
        data,
        segment.from - cursor,
        0,
        PreparedTokenSlice.empty
      );
      addSection(sections, data, size, -1, null);
      cursor = segment.to;
    }
  }
  addSection(sections, data, length - cursor, 0, PreparedTokenSlice.empty);
  const sigmaHull = RootChange.fromSections(sections, data);
  const removal =
    input.ranges.length > 0 ? deleting(input.storedLength, input.ranges) : null;
  const hull = (removal ? removal.compose(sigmaHull) : sigmaHull).compose(
    accepted
  );
  const byStored = segments.toSorted((left, right) => left.from - right.from);
  const inverse = segments.map((segment) => ({
    from: segment.at,
    to: segment.at + segment.to - segment.from,
    at: segment.from,
  }));
  const cut = (position: number, assoc: -1 | 1) =>
    removal ? getDefined(removal.mapPos(position, assoc)) : position;
  const uncut = (position: number, assoc: -1 | 1) =>
    removal
      ? getDefined(mapRootChangePositionBackward(removal, position, assoc))
      : position;
  const breaks = segments
    .slice(1)
    .flatMap((right, index): ProjectionBreak[] => {
      const left = getDefined(segments[index]);

      return left.to === right.from
        ? []
        : [
            {
              at: getDefined(accepted.mapPos(right.at, -1)),
              before: uncut(left.to, -1),
              after: uncut(right.from, 1),
            },
          ];
    });

  return {
    breaks,
    hull,
    toProjected: (position, assoc) =>
      getDefined(
        accepted.mapPos(permute(byStored, cut(position, assoc), assoc), assoc)
      ),
    toStored: (position, assoc) =>
      uncut(
        permute(
          inverse,
          getDefined(mapRootChangePositionBackward(accepted, position, assoc)),
          assoc
        ),
        assoc
      ),
    hides: (position) =>
      (removal !== null && hidden(removal, position)) ||
      (hidden(accepted, permute(byStored, cut(position, -1), -1)) &&
        hidden(accepted, permute(byStored, cut(position, 1), 1))),
    added: (position) => {
      let after = 0;

      for (let pair = 0; pair < accepted.sections.length; pair += 2) {
        countCoreWork('sectionsWalked');
        const inserted = getDefined(accepted.sections[pair + 1]);
        const size =
          inserted < 0 ? getDefined(accepted.sections[pair]) : inserted;

        if (inserted > 0 && after < position && position < after + size) {
          return { from: after, to: after + size };
        }
        after += size;
        if (after > position) return null;
      }
      return null;
    },
    edgeInsertion: (end) => {
      const pair = end ? accepted.sections.length - 2 : 0;

      return pair >= 0 &&
        accepted.sections[pair] === 0 &&
        getDefined(accepted.sections[pair + 1]) > 0
        ? getDefined(accepted.sections[pair + 1])
        : 0;
    },
  };
};
