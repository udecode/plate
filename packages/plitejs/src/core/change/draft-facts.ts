import { countCoreWork } from '../work';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
} from './document-change';
import {
  type Carry,
  type ChangeFacts,
  type Heir,
  type Merge,
  NO_FACTS,
  type RootFacts,
  recordedFacts,
  UNKNOWN_FACTS,
} from './record';
import type { RootChange } from './root-change';

const KEPT = 0;
const DROPPED = 1;
const FRESH = 2;
const CARRY = 3;
const HEIR = 4;

type Kind =
  | typeof CARRY
  | typeof DROPPED
  | typeof FRESH
  | typeof HEIR
  | typeof KEPT;

type Piece = {
  kind: Kind;
  length: number;
  source: number;
  merges: number[] | null;
  priority: number;
  left: Piece | null;
  right: Piece | null;
  outputTotal: number;
  inputTotal: number;
};

type Source = Readonly<{
  at: number;
  kind: Kind;
  length: number;
  source: number;
}>;

let xorshift = 0x25_45_f4_91;

const nextXorshift = () => {
  xorshift ^= xorshift << 13;
  xorshift ^= xorshift >>> 17;
  xorshift ^= xorshift << 5;

  return xorshift >>> 0;
};

const outOf = (piece: Piece) => (piece.kind === DROPPED ? 0 : piece.length);

const inputOf = (piece: Piece) =>
  piece.kind === KEPT || piece.kind === DROPPED ? piece.length : 0;

const update = (piece: Piece) => {
  piece.outputTotal =
    (piece.left?.outputTotal ?? 0) +
    outOf(piece) +
    (piece.right?.outputTotal ?? 0);
  piece.inputTotal =
    (piece.left?.inputTotal ?? 0) +
    inputOf(piece) +
    (piece.right?.inputTotal ?? 0);

  return piece;
};

const pieceOf = (kind: Kind, length: number, source = 0): Piece =>
  update({
    inputTotal: 0,
    kind,
    left: null,
    length,
    merges: null,
    outputTotal: 0,
    priority: nextXorshift(),
    right: null,
    source,
  });

const join = (left: Piece | null, right: Piece | null): Piece | null => {
  if (!left) return right;
  if (!right) return left;
  if (left.priority > right.priority) {
    left.right = join(left.right, right);

    return update(left);
  }
  right.left = join(left, right.left);

  return update(right);
};

const cutBefore = (
  piece: Piece | null,
  at: number
): [Piece | null, Piece | null] => {
  if (!piece) return [null, null];

  const before = piece.left?.outputTotal ?? 0;

  if (at <= before) {
    const [left, right] = cutBefore(piece.left, at);

    piece.left = null;

    return [left, join(right, update(piece))];
  }

  const own = outOf(piece);

  if (at >= before + own) {
    const [left, right] = cutBefore(piece.right, at - before - own);

    piece.right = null;

    return [join(update(piece), left), right];
  }

  const offset = at - before;
  const tail = pieceOf(
    piece.kind,
    piece.length - offset,
    piece.kind === CARRY ? piece.source + offset : piece.source
  );
  const right = join(tail, piece.right);

  piece.length = offset;
  piece.right = null;

  return [update(piece), right];
};

const piecesOf = (piece: Piece | null, into: Piece[] = []) => {
  if (piece) {
    piecesOf(piece.left, into);
    into.push(piece);
    piecesOf(piece.right, into);
  }

  return into;
};

const sourcesIn = (root: Piece | null, from: number, to: number) => {
  const found: Source[] = [];
  const visit = (piece: Piece | null, out: number, input: number) => {
    if (!piece || out >= to || out + piece.outputTotal <= from) return;
    visit(piece.left, out, input);

    const at = out + (piece.left?.outputTotal ?? 0);
    const before = input + (piece.left?.inputTotal ?? 0);
    const start = Math.max(from, at);
    const end = Math.min(to, at + outOf(piece));

    if (start < end && piece.kind !== FRESH) {
      found.push({
        at: start,
        kind: piece.kind,
        length: end - start,
        source:
          piece.kind === KEPT
            ? before + start - at
            : piece.kind === CARRY
              ? piece.source + start - at
              : piece.source,
      });
    }
    visit(piece.right, at + outOf(piece), before + inputOf(piece));
  };

  visit(root, 0, 0);

  return found;
};

const whereStepPut = (position: number, facts: RootFacts) => {
  for (const [at, from, length] of facts.carries) {
    if (from <= position && position < from + length) {
      return at + position - from;
    }
  }
  for (const [at, into] of facts.merges) {
    if (at === position) return into;
  }

  return null;
};

class RootRuns {
  private root: Piece | null;

  constructor(root: Piece | null) {
    this.root = root;
  }

  static of(prefix: RootChange | undefined, length: number) {
    if (!prefix) return new RootRuns(pieceOf(KEPT, length));

    let root: Piece | null = null;

    for (let index = 0; index < prefix.sections.length; index += 2) {
      const removed = prefix.sections[index];
      const inserted = prefix.sections[index + 1];

      if (inserted < 0) {
        root = join(root, pieceOf(KEPT, removed));
        continue;
      }
      if (removed > 0) root = join(root, pieceOf(DROPPED, removed));
      if (inserted > 0) root = join(root, pieceOf(FRESH, inserted));
    }

    return new RootRuns(root);
  }

  clone() {
    const copy = (piece: Piece | null): Piece | null =>
      piece && {
        ...piece,
        left: copy(piece.left),
        merges: piece.merges && [...piece.merges],
        right: copy(piece.right),
      };

    return new RootRuns(copy(this.root));
  }

  add(change: RootChange, facts: RootFacts) {
    const carries: Carry[] = [];
    const heirs: Heir[] = [];
    const merges: Merge[] = [];

    for (const [at, from, length] of facts.carries) {
      countCoreWork('factPositions');
      for (const source of sourcesIn(this.root, from, from + length)) {
        const written = at + source.at - from;

        if (source.kind === HEIR) heirs.push([written, source.source]);
        else carries.push([written, source.source, source.length]);
      }
    }
    for (const [at, of] of facts.heirs) {
      countCoreWork('factPositions');
      const [source] = sourcesIn(this.root, of, of + 1);

      if (source) heirs.push([at, source.source]);
    }
    for (const [at, into] of facts.merges) {
      countCoreWork('factPositions');
      const [source] = sourcesIn(this.root, at, at + 1);

      if (source && source.kind !== HEIR) merges.push([source.source, into]);
    }

    merges.push(...this.replace(change, facts));
    for (const [at, from, length] of carries) {
      this.writeIfFresh(at, pieceOf(CARRY, length, from));
    }
    for (const [at, of] of heirs) this.writeIfFresh(at, pieceOf(HEIR, 1, of));
    for (const [from, into] of merges) this.attach(into, from);
  }

  private replace(change: RootChange, facts: RootFacts) {
    const merges: Merge[] = [];
    const replaced: Array<readonly [number, number, number]> = [];
    let input = 0;

    for (let index = 0; index < change.sections.length; index += 2) {
      const removed = change.sections[index];
      const inserted = change.sections[index + 1];

      if (inserted >= 0) replaced.push([input, removed, inserted]);
      input += removed;
    }

    for (let index = replaced.length - 1; index >= 0; index--) {
      const [from, removed, inserted] = replaced[index];
      const [left, rest] = cutBefore(this.root, from);
      const [middle, right] = cutBefore(rest, removed);
      let offset = 0;

      for (const piece of piecesOf(middle)) {
        if (piece.kind === CARRY || piece.kind === HEIR) {
          countCoreWork('factPositions');
        }
        for (const source of piece.merges ?? []) {
          countCoreWork('factPositions');
          const into = whereStepPut(from + offset, facts);

          if (into !== null) merges.push([source, into]);
        }
        offset += outOf(piece);
      }

      const dropped = middle?.inputTotal ?? 0;

      this.root = join(
        join(left, dropped > 0 ? pieceOf(DROPPED, dropped) : null),
        join(inserted > 0 ? pieceOf(FRESH, inserted) : null, right)
      );
    }

    return merges;
  }

  private writeIfFresh(at: number, piece: Piece) {
    const [left, rest] = cutBefore(this.root, at);
    const [middle, right] = cutBefore(rest, piece.length);
    const claimed = piecesOf(middle);
    const fits =
      (middle?.outputTotal ?? 0) === piece.length &&
      claimed.every(
        (each) => (each.kind === FRESH || each.kind === DROPPED) && !each.merges
      );

    if (!fits) {
      this.root = join(join(left, middle), right);

      return;
    }

    const dropped = middle?.inputTotal ?? 0;

    this.root = join(
      join(left, dropped > 0 ? pieceOf(DROPPED, dropped) : null),
      join(piece, right)
    );
  }

  private attach(into: number, source: number) {
    const [left, rest] = cutBefore(this.root, into);
    const [middle, right] = cutBefore(rest, 1);
    const target = piecesOf(middle).find((piece) => outOf(piece) === 1);

    if (target) target.merges = [...(target.merges ?? []), source];
    this.root = join(join(left, middle), right);
  }

  tables() {
    const carries: Carry[] = [];
    const heirs: Heir[] = [];
    const merges: Merge[] = [];
    let at = 0;

    for (const piece of piecesOf(this.root)) {
      if (piece.kind === CARRY) carries.push([at, piece.source, piece.length]);
      if (piece.kind === HEIR) heirs.push([at, piece.source]);
      for (const source of piece.merges ?? []) merges.push([source, at]);
      at += outOf(piece);
    }

    return { carries, heirs, merges };
  }
}

type Recorded = Extract<ChangeFacts, { kind: 'recorded' }>;

const startsEachRoot = (
  change: DocumentChange,
  prefixOf: (root: string) => RootChange | undefined
) => {
  for (const [root] of getInternalDocumentChangeEntries(change)) {
    if (prefixOf(root)) return false;
  }

  return true;
};

/** @internal */
export class DraftFacts {
  private known = true;
  private readonly roots = new Map<string, RootRuns>();
  private composed: ChangeFacts | null = NO_FACTS;
  private first: Readonly<{
    change: DocumentChange;
    facts: Recorded;
  }> | null = null;

  constructor() {
    countCoreWork('factAllocations');
  }

  get unknown() {
    return !this.known;
  }

  clone() {
    const copy = new DraftFacts();

    copy.known = this.known;
    copy.composed = this.composed;
    copy.first = this.first;
    for (const [root, record] of this.roots) {
      copy.roots.set(root, record.clone());
    }

    return copy;
  }

  forget() {
    this.known = false;
    this.roots.clear();
    this.composed = UNKNOWN_FACTS;
    this.first = null;
  }

  add(
    change: DocumentChange,
    facts: ChangeFacts,
    prefixOf: (root: string) => RootChange | undefined
  ) {
    if (!this.known) return;
    if (facts.kind === 'unknown') {
      this.forget();
      return;
    }
    if (
      this.roots.size === 0 &&
      !this.first &&
      startsEachRoot(change, prefixOf)
    ) {
      this.first = { change, facts };
      this.composed = facts;
      return;
    }
    if (this.first) {
      const { first } = this;

      this.first = null;
      this.fold(first.change, first.facts, () => undefined);
    }
    this.fold(change, facts, prefixOf);
  }

  private fold(
    change: DocumentChange,
    facts: Recorded,
    prefixOf: (root: string) => RootChange | undefined
  ) {
    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const rootFacts = facts.roots.get(root);
      let record = this.roots.get(root);

      if (!record && !rootFacts) continue;
      if (!record) {
        record = RootRuns.of(prefixOf(root), rootChange.length);
        this.roots.set(root, record);
      }
      record.add(
        rootChange,
        rootFacts ?? { carries: [], heirs: [], merges: [] }
      );
      this.composed = null;
    }
  }

  facts(): ChangeFacts {
    this.composed ??= recordedFacts(
      [...this.roots].map(([root, record]) => [root, record.tables()] as const)
    );

    return this.composed;
  }
}
