import { countCoreWork } from '../work';
import {
  type DocumentChange,
  getInternalDocumentRootChange,
} from './document-change';
import type { DocumentIndex } from './document-index';

/**
 * Tokens a step landed that stood, one to one, somewhere else: `length`
 * tokens from `at` in the step's output. The source is a position in the
 * step's input, or, for a transfer that removed its source before landing, a
 * position in the document the transfer started from.
 *
 * @internal
 */
export type Relocation = Readonly<{
  at: number;
  length: number;
  root: string;
  source: number | Readonly<{ at: number; document: DocumentIndex }>;
}>;

/**
 * Where a token stood: a position in `document`, which holds `root` as it
 * was when the recording span began, or as a transfer found it.
 *
 * @internal
 */
export type FormerPlace = Readonly<{
  at: number;
  document: DocumentIndex;
  root: string;
}>;

/**
 * A value the canonical pass dropped from the node whose open token is `at`
 * in the pass's input, because the node carried it from `place`, or, in a
 * view, because its place cannot hold it; `place` is then null when the node
 * stood nowhere when the span began.
 *
 * @internal
 */
export type CarriedDrop = Readonly<{
  at: number;
  key: string;
  place: FormerPlace | null;
  root: string;
  value: unknown;
}>;

/** @internal */
export type LineageStep = Readonly<{
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  relocations?: readonly Relocation[];
}>;

// A treap of final-document runs keyed by where each run stands at the step
// the sweep has reached, with a lazy shift and a lazy moved mark, so one step
// costs its own sections times a logarithm, whatever the document's size.
type Piece = {
  final: number;
  image: number;
  left: Piece | null;
  length: number;
  moved: boolean;
  priority: number;
  right: Piece | null;
  shift: number;
  tagMoved: boolean;
};

const piece = (
  final: number,
  image: number,
  length: number,
  moved: boolean
): Piece => ({
  final,
  image,
  left: null,
  length,
  moved,
  priority: Math.random(),
  right: null,
  shift: 0,
  tagMoved: false,
});

const shiftPiece = (node: Piece, shift: number, moved: boolean) => {
  node.image += shift;
  node.shift += shift;
  if (moved) {
    node.moved = true;
    node.tagMoved = true;
  }
};

const push = (node: Piece) => {
  if (node.shift === 0 && !node.tagMoved) return;
  for (const child of [node.left, node.right]) {
    if (child) shiftPiece(child, node.shift, node.tagMoved);
  }
  node.shift = 0;
  node.tagMoved = false;
};

const merge = (left: Piece | null, right: Piece | null): Piece | null => {
  if (!left) return right;
  if (!right) return left;
  if (left.priority > right.priority) {
    push(left);
    left.right = merge(left.right, right);

    return left;
  }
  push(right);
  right.left = merge(left, right.left);

  return right;
};

/** Pieces whose image is below `key` go left; a piece across `key` is cut. */
const split = (
  node: Piece | null,
  key: number
): [Piece | null, Piece | null] => {
  if (!node) return [null, null];
  push(node);
  if (node.image < key && key < node.image + node.length) {
    const cut = key - node.image;
    const tail = piece(node.final + cut, key, node.length - cut, node.moved);
    const { left, right } = node;

    node.length = cut;
    node.left = null;
    node.right = null;

    return [merge(left, node), merge(tail, right)];
  }
  if (node.image < key) {
    const [left, right] = split(node.right, key);

    node.right = left;

    return [node, right];
  }
  const [left, right] = split(node.left, key);

  node.left = right;

  return [left, node];
};

const collect = (node: Piece | null, out: Piece[]) => {
  if (!node) return;
  push(node);
  collect(node.left, out);
  out.push(node);
  collect(node.right, out);
};

type Segment = Readonly<{
  from: number;
  /** The document a transfer's source stands in, which ends the sweep. */
  source: DocumentIndex | null;
  /** Null for tokens the step made. */
  shift: number | null;
  to: number;
  relocated: boolean;
}>;

/** Where each run of a step's output stood before it. */
const segmentsOf = (
  sections: readonly number[],
  relocations: readonly Relocation[],
  root: string
): Segment[] => {
  const segments: Segment[] = [];
  const runs = relocations.filter((run) => run.root === root);
  let before = 0;
  let after = 0;

  const add = (from: number, to: number, run: Relocation | null) => {
    if (from >= to) return;
    if (!run) {
      segments.push({ from, relocated: false, shift: null, source: null, to });
      return;
    }
    const { source } = run;

    segments.push({
      from,
      relocated: true,
      shift: (typeof source === 'number' ? source : source.at) - run.at,
      source: typeof source === 'number' ? null : source.document,
      to,
    });
  };

  for (let pair = 0; pair < sections.length; pair += 2) {
    const length = sections[pair];
    const inserted = sections[pair + 1];

    if (inserted < 0) {
      if (length > 0) {
        segments.push({
          from: after,
          relocated: false,
          shift: before - after,
          source: null,
          to: after + length,
        });
      }
      before += length;
      after += length;
      continue;
    }

    let at = after;
    const end = after + inserted;

    for (const run of runs) {
      if (run.at + run.length <= at || run.at >= end) continue;
      add(at, run.at, null);
      add(Math.max(at, run.at), Math.min(end, run.at + run.length), run);
      at = Math.min(end, run.at + run.length);
    }
    add(at, end, null);
    before += length;
    after = end;
  }

  return segments;
};

type Found = Readonly<{
  document: DocumentIndex | null;
  piece: Piece;
}>;

type Lineage = Readonly<{
  /** How many steps the sweep read, so a longer span sweeps again. */
  steps: number;
  base: DocumentIndex;
  /** Landed nodes by their open token in the final document. */
  landed: ReadonlyMap<number, Found>;
  /** Every piece, by its final position. */
  pieces: readonly Found[];
}>;

const lineages = new WeakMap<readonly LineageStep[], Map<string, Lineage>>();

/** The nodes that start inside `found`'s run of the final document. */
const indexLanded = (
  final: DocumentIndex,
  found: Found,
  landed: Map<number, Found>
) => {
  const { final: from, length } = found.piece;
  const to = from + length;
  let at = from;

  while (at < to) {
    countCoreWork('formerPlaceVisits');
    const entry = final.nodeStartingAt(at);

    if (entry?.from === at) {
      landed.set(at, found);
      at = entry.kind === 'text' ? entry.to : at + 1;
      continue;
    }

    const inside = final.openContextAt(at).at(-1);

    at = inside?.kind === 'text' ? Math.max(at + 1, inside.to) : at + 1;
  }
};

/**
 * One sweep backward over the span's steps for `root`: for every token of
 * the final document, where it stood when the span began, or where a
 * transfer took it from. Landed runs are hashed by their nodes' open tokens.
 */
const lineageOf = (
  steps: readonly LineageStep[],
  root: string
): Lineage | null => {
  const byRoot = lineages.get(steps) ?? new Map<string, Lineage>();
  const cached = byRoot.get(root);

  lineages.set(steps, byRoot);
  if (cached?.steps === steps.length) return cached;

  // Each tree's runs stand apart at the step reached. A split's new node
  // continues the open token its first half keeps, so two runs can stand on
  // one token; they then sweep on in separate trees.
  let trees: Piece[] = [];
  let final: DocumentIndex | null = null;
  let base: DocumentIndex | null = null;
  const settled: Found[] = [];

  for (let index = steps.length - 1; index >= 0; index -= 1) {
    countCoreWork('formerPlaceVisits');
    const step = steps[index];
    const change = getInternalDocumentRootChange(step.change, root);

    if (!change) continue;
    if (!final) {
      final = step.indexedAfter.get(root) ?? null;
      trees =
        change.newLength > 0 ? [piece(0, 0, change.newLength, false)] : [];
    }
    base = step.indexedBefore.get(root) ?? null;

    const chunks: Array<Readonly<{ end: number; start: number; tree: Piece }>> =
      [];
    const segments = segmentsOf(change.sections, step.relocations ?? [], root);

    for (const tree of trees) {
      let rest: Piece | null = tree;

      for (const segment of segments) {
        const [chunk, after] = split(rest, segment.to);

        rest = after;
        if (!chunk || segment.shift === null) continue;
        shiftPiece(chunk, segment.shift, segment.relocated);
        if (segment.source) {
          const done: Piece[] = [];

          collect(chunk, done);
          for (const item of done) {
            settled.push({ document: segment.source, piece: item });
          }
          continue;
        }
        chunks.push({
          end: segment.to + segment.shift,
          start: segment.from + segment.shift,
          tree: chunk,
        });
      }
    }
    chunks.sort((left, right) => left.start - right.start);

    const packed: Array<{ end: number; tree: Piece | null }> = [];

    for (const chunk of chunks) {
      const into = packed.find(({ end }) => end <= chunk.start);

      if (into) {
        into.tree = merge(into.tree, chunk.tree);
        into.end = chunk.end;
      } else {
        packed.push({ end: chunk.end, tree: chunk.tree });
      }
    }
    trees = packed.flatMap(({ tree }) => (tree ? [tree] : []));
  }

  if (!final || !base) return null;

  const swept: Piece[] = [];

  for (const tree of trees) collect(tree, swept);

  const pieces = [
    ...swept.map((item) => ({ document: null, piece: item })),
    ...settled,
  ].sort((left, right) => left.piece.final - right.piece.final);
  const landed = new Map<number, Found>();

  for (const found of pieces) {
    if (found.piece.moved) indexLanded(final, found, landed);
  }

  const lineage = { base, landed, pieces, steps: steps.length };

  byRoot.set(root, lineage);

  return lineage;
};

const placeIn = (lineage: Lineage, found: Found, at: number, root: string) => ({
  at: found.piece.image + at - found.piece.final,
  document: found.document ?? lineage.base,
  root,
});

/**
 * Where the token at `at`, in the document after the last of `steps`, stood
 * before the first of them. A landed token follows its relocation, a kept
 * token maps through its step, and a token some step made has no former
 * place, so the answer is null. `steps` is one recording span, and the
 * answer for a root no step changed is null, because nothing there moved.
 *
 * @internal
 */
export const formerPlace = (
  steps: readonly LineageStep[],
  root: string,
  at: number
): FormerPlace | null => {
  countCoreWork('formerPlaceCalls');
  const lineage = lineageOf(steps, root);

  if (!lineage) return null;

  countCoreWork('formerPlaceVisits');
  const landed = lineage.landed.get(at);

  if (landed) return placeIn(lineage, landed, at, root);

  const { pieces } = lineage;
  let low = 0;
  let high = pieces.length - 1;

  while (low <= high) {
    countCoreWork('formerPlaceVisits');
    const middle = (low + high) >> 1;
    const found = pieces[middle];
    const { final, length } = found.piece;

    if (final + length <= at) low = middle + 1;
    else if (final > at) high = middle - 1;
    else return placeIn(lineage, found, at, root);
  }

  return null;
};
