import {
  type ChangeSection,
  type ChangeView,
  type Entry,
  isCarrier,
  type LedgerValue,
  type Streams,
} from './effect-ledger';
import { encodeNodes, type JsonNode, type JsonToken } from './tokens';

/**
 * A sparse copy of a span's base: every token one of its chains touches, every
 * element a chain wraps in a container it inserts, since a rule compares the
 * blocks two wraps hold, the open and close of each ancestor of a kept token,
 * and, of each run the chains leave untouched, its first and last items, its
 * first and last items that hold a carrier and its first and last items that
 * hold a letter, each gap between them replaced by a skip of its width.
 * Positions and ids stay the base's.
 */
export type Window = Readonly<{
  /** Base positions the window leaves out. */
  skipped: number;
  streams: Streams;
  /** Base tokens the window holds. */
  tokens: number;
}>;

export type Span = Readonly<{
  accepted: readonly ChangeView[];
  merged: readonly ChangeView[];
  own: readonly ChangeView[];
}>;

const LETTER = 0;
const OPEN = 1;
const CLOSE = 2;

type Root = Readonly<{
  closeOf: Int32Array;
  /** Whether a change cut the document at each boundary before a position. */
  cut: Uint8Array;
  /** Whether a change wrapped each position in a container it inserted. */
  enclosed: Uint8Array;
  first: number;
  json: readonly JsonToken[];
  kind: Uint8Array;
  startOf: Int32Array;
  tokenAt: Int32Array;
  touched: Uint8Array;
  width: number;
}>;

const rootOf = (nodes: readonly JsonNode[], first: number): Root => {
  const json = encodeNodes(nodes).slice.tokens;
  let width = 0;
  for (const token of json) {
    width += token.kind === 'text' ? token.text.length : 1;
  }
  const kind = new Uint8Array(width);
  const closeOf = new Int32Array(width);
  const tokenAt = new Int32Array(width);
  const startOf = new Int32Array(json.length);
  const opens: number[] = [];
  let at = 0;
  for (const [index, token] of json.entries()) {
    startOf[index] = at;
    if (token.kind === 'text') {
      tokenAt.fill(index, at, at + token.text.length);
      at += token.text.length;
      continue;
    }
    tokenAt[at] = index;
    if (token.kind === 'open') {
      kind[at] = OPEN;
      opens.push(at);
    } else {
      kind[at] = CLOSE;
      closeOf[opens.pop() as number] = at;
    }
    at += 1;
  }
  return {
    closeOf,
    cut: new Uint8Array(width + 1),
    enclosed: new Uint8Array(width),
    first,
    json,
    kind,
    startOf,
    tokenAt,
    touched: new Uint8Array(width),
    width,
  };
};

type Piece =
  | Readonly<{ born: number }>
  | Readonly<{ from: number; to: number }>;
const lengthOf = (piece: Piece) =>
  'born' in piece ? piece.born : piece.to - piece.from;
const widthOf = (tokens: readonly JsonToken[]) =>
  tokens.reduce(
    (sum, token) => sum + (token.kind === 'text' ? token.text.length : 1),
    0
  );

// The opens an insert leaves unclosed and the closes it adds for opens before
// it: a wrap's start inserts one open, its end one close, and a split both.
const unmatchedOf = (tokens: readonly JsonToken[]) => {
  let depth = 0;
  let lowest = 0;
  for (const token of tokens) {
    if (token.kind === 'open') depth += 1;
    else if (token.kind === 'close') depth -= 1;
    lowest = Math.min(lowest, depth);
  }
  return { closes: -lowest, opens: depth - lowest };
};

const touch = (root: Root | undefined, from: number, to: number) => {
  if (root === undefined) return;
  root.touched.fill(1, from, to);
  root.cut[from] = 1;
  root.cut[to] = 1;
};

// Returns the root's pieces after the change, without folding.
const markChange = (
  pieces: readonly Piece[],
  sections: readonly ChangeSection[],
  root: Root | undefined
) => {
  const out: Piece[] = [];
  let at = 0;
  let into = 0;
  // The base ranges retained since the change's first insert that opened a
  // container, and how many of them a later closing insert marked enclosed.
  // Marking every range between them, whatever else the change does there,
  // keeps more than a wrap holds and never less.
  let opened: Array<readonly [number, number]> | undefined;
  let marked = 0;
  const site = () => {
    if (root === undefined) return;
    const piece = pieces[at];
    if (into > 0) {
      if ('from' in piece) root.cut[piece.from + into] = 1;
      return;
    }
    if (piece !== undefined && 'from' in piece) root.cut[piece.from] = 1;
    const prior = pieces[at - 1];
    if (prior !== undefined && 'to' in prior) root.cut[prior.to] = 1;
  };
  const take = (length: number, writes: boolean, keeps: boolean) => {
    for (let left = length; left > 0 && at < pieces.length;) {
      const piece = pieces[at];
      const width = Math.min(lengthOf(piece) - into, left);
      if ('born' in piece) {
        if (keeps) out.push({ born: width });
      } else {
        const from = piece.from + into;
        if (keeps) out.push({ from, to: from + width });
        if (keeps && !writes) opened?.push([from, from + width]);
        if (writes) touch(root, from, from + width);
      }
      into += width;
      left -= width;
      if (into === lengthOf(piece)) {
        at += 1;
        into = 0;
      }
    }
  };
  for (const section of sections) {
    if (section.kind === 'retain') take(section.length, false, true);
    else if (section.kind === 'props') take(1, true, true);
    else {
      const { closes, opens } = unmatchedOf(section.insert);
      if (closes > 0 && opened !== undefined && root) {
        for (const [from, to] of opened.slice(marked)) {
          root.enclosed.fill(1, from, to);
        }
        marked = opened.length;
      }
      if (opens > 0) opened ??= [];
      site();
      take(section.length, true, false);
      const width = widthOf(section.insert);
      if (width > 0) out.push({ born: width });
      site();
    }
  }
  if (into > 0) {
    const piece = pieces[at];
    out.push(
      'born' in piece
        ? { born: piece.born - into }
        : { from: piece.from + into, to: piece.to }
    );
    at += 1;
  }
  for (; at < pieces.length; at += 1) out.push(pieces[at]);
  return out;
};

const mark = (
  roots: ReadonlyMap<string, Root>,
  views: readonly ChangeView[],
  from: ReadonlyMap<string, readonly Piece[]>
) => {
  const pieces = new Map(from);
  for (const view of views) {
    for (const [name, sections] of view.roots) {
      pieces.set(
        name,
        markChange(pieces.get(name) ?? [], sections, roots.get(name))
      );
    }
    for (const name of view.createRoots) {
      if (!pieces.has(name)) pieces.set(name, []);
    }
    for (const name of view.deleteRoots) {
      for (const piece of pieces.get(name) ?? []) {
        if ('from' in piece) touch(roots.get(name), piece.from, piece.to);
      }
      pieces.delete(name);
    }
  }
  return pieces;
};

const streamOf = (root: Root) => {
  const { closeOf, cut, enclosed, kind, touched, width } = root;
  const touchedBefore = new Int32Array(width + 1);
  const enclosedOpensBefore = new Int32Array(width + 1);
  const lettersBefore = new Int32Array(width + 1);
  const carriersBefore = new Int32Array(width + 1);
  const cutsBefore = new Int32Array(width + 2);
  for (let at = 0; at < width; at += 1) {
    touchedBefore[at + 1] = touchedBefore[at] + touched[at];
    enclosedOpensBefore[at + 1] =
      enclosedOpensBefore[at] + (kind[at] === OPEN ? enclosed[at] : 0);
    lettersBefore[at + 1] = lettersBefore[at] + (kind[at] === LETTER ? 1 : 0);
    const token = root.json[root.tokenAt[at]];
    carriersBefore[at + 1] =
      carriersBefore[at] + (token.kind === 'text' || isCarrier(token) ? 1 : 0);
  }
  for (let at = 0; at <= width; at += 1) {
    cutsBefore[at + 1] = cutsBefore[at] + cut[at];
  }
  const endOf = (at: number) => (kind[at] === LETTER ? at : closeOf[at]);
  const holds = (before: Int32Array) => (at: number) =>
    before[endOf(at) + 1] > before[at];
  const holdsLetter = holds(lettersBefore);
  const holdsCarrier = holds(carriersBefore);
  const hot = (at: number) => {
    const end = endOf(at);
    return (
      touchedBefore[end + 1] > touchedBefore[at] ||
      enclosedOpensBefore[end + 1] > enclosedOpensBefore[at] ||
      cutsBefore[end + 1] > cutsBefore[at + 1]
    );
  };
  const entries: Entry[] = [];
  let tokens = 0;
  let skipped = 0;
  const keep = (at: number) => {
    const index = root.tokenAt[at];
    const token = root.json[index];
    const id = `base:${root.first + at}`;
    entries.push(
      token.kind === 'text'
        ? {
            ch: token.text[at - root.startOf[index]],
            id,
            kind: 'letter',
            nodeKind: 'text',
          }
        : token.kind === 'open'
          ? { id, kind: 'open', nodeKind: token.nodeKind, props: token.props }
          : { id, kind: 'close', nodeKind: token.nodeKind }
    );
    tokens += 1;
  };
  const skip = (from: number, to: number) => {
    skipped += to - from;
    entries.push({ kind: 'skip', width: to - from });
  };
  const level = (from: number, to: number) => {
    let run: number[] = [];
    // A rule about an untouched token speaks of its run's edge carriers or
    // edge letters, which an edge item such as an empty text does not hold.
    const flush = () => {
      if (run.length === 0) return;
      const kept = [
        ...new Set([
          0,
          run.findIndex(holdsCarrier),
          run.findIndex(holdsLetter),
          run.findLastIndex(holdsLetter),
          run.findLastIndex(holdsCarrier),
          run.length - 1,
        ]),
      ]
        .filter((index) => index >= 0)
        .sort((a, b) => a - b);
      for (const [nth, index] of kept.entries()) {
        item(run[index]);
        const next = kept[nth + 1];
        if (next !== undefined && next > index + 1) {
          skip(run[index + 1], endOf(run[next - 1]) + 1);
        }
      }
      run = [];
    };
    for (let at = from; at < to; at = endOf(at) + 1) {
      if (hot(at)) {
        flush();
        item(at);
      } else {
        if (cut[at] === 1) flush();
        run.push(at);
      }
    }
    flush();
  };
  const item = (at: number) => {
    keep(at);
    if (kind[at] !== OPEN) return;
    level(at + 1, closeOf[at]);
    keep(closeOf[at]);
  };
  level(0, width);
  return { entries, skipped, tokens };
};

/**
 * Builds the window of a span's base from the base value and the span's
 * changes alone. A change that lands inside or beside a skipped run makes the
 * fold throw, so a window that left out what a chain touches fails closed.
 */
export const windowOf = (base: LedgerValue, span: Span): Window => {
  const roots = new Map<string, Root>();
  let first = 0;
  for (const [name, nodes] of [
    ['main', base.children] as const,
    ...Object.entries(base.roots ?? {}),
  ]) {
    const root = rootOf(nodes, first);
    roots.set(name, root);
    first += root.width;
  }
  const start = new Map(
    [...roots].map(([name, root]): [string, readonly Piece[]] => [
      name,
      root.width === 0 ? [] : [{ from: 0, to: root.width }],
    ])
  );
  mark(roots, span.merged, mark(roots, span.accepted, start));
  mark(roots, span.own, start);
  const streams = new Map<string, readonly Entry[]>();
  let tokens = 0;
  let skipped = 0;
  for (const [name, root] of roots) {
    const stream = streamOf(root);
    streams.set(name, stream.entries);
    tokens += stream.tokens;
    skipped += stream.skipped;
  }
  return { skipped, streams, tokens };
};
