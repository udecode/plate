import { countCoreWork } from '../work';
import {
  assertDocumentRootKey,
  type DocumentChange,
  freezeReadonlyMap,
  getInternalDocumentRootChange,
  rootComposeRebuilds,
  valueRootIndex,
} from './document-change';
import type { DocumentIndex } from './document-index';
import { isRecord } from './json';
import { keptRunsOf, type RootChange } from './root-change';
import { type JsonEditorValue, type JsonToken, tokensEqual } from './tokens';

/**
 * The run of `length` tokens a change writes at output position `at` is its
 * input run at `from`. An open's properties may differ, because a property
 * set follows its element.
 */
export type Carry = readonly [at: number, from: number, length: number];

/**
 * The element whose open token a change writes at output position `at`
 * continues the input element whose open token sits at `of`.
 */
export type Heir = readonly [at: number, of: number];

/**
 * The input element whose open token sits at `at`, which a change drops, went
 * into the output element whose open token sits at `into`.
 */
export type Merge = readonly [at: number, into: number];

/** One root's facts, each table sorted by its first number. */
export type RootFacts = Readonly<{
  carries: readonly Carry[];
  heirs: readonly Heir[];
  merges: readonly Merge[];
}>;

/**
 * What a change says moved, split and joined, kept beside the change and
 * never in it. Facts are positions in each root's input and output token
 * sequences. Unknown facts claim nothing.
 *
 * @internal
 */
export type ChangeFacts =
  | Readonly<{ kind: 'recorded'; roots: ReadonlyMap<string, RootFacts> }>
  | Readonly<{ kind: 'unknown' }>;

type RecordedFacts = Extract<ChangeFacts, { kind: 'recorded' }>;

export type FactTable = keyof RootFacts;

export type FactFaultReason =
  | 'copy'
  | 'kept'
  | 'kind'
  | 'not-open'
  | 'outside'
  | 'overlap'
  | 'root';

export type FactFault = Readonly<{
  index: number;
  reason: FactFaultReason;
  root: string;
  table: FactTable;
}>;

export type RootFactsJson = Readonly<{
  carries?: readonly Carry[];
  heirs?: readonly Heir[];
  merges?: readonly Merge[];
}>;

export type ChangeFactsJson =
  | Readonly<{
      kind: 'recorded';
      roots: Readonly<Record<string, RootFactsJson>>;
    }>
  | Readonly<{ kind: 'unknown' }>;

export class FactsJsonError extends Error {
  override name = 'FactsJsonError';
}

const TABLES: readonly FactTable[] = ['carries', 'heirs', 'merges'];

const NO_ROOT_FACTS: RootFacts = Object.freeze({
  carries: Object.freeze([]),
  heirs: Object.freeze([]),
  merges: Object.freeze([]),
});

/** Recorded facts with no fact in any root, shared by every such change. */
export const NO_FACTS: RecordedFacts = Object.freeze({
  kind: 'recorded',
  roots: freezeReadonlyMap<string, RootFacts>([]),
});

export const UNKNOWN_FACTS: ChangeFacts = Object.freeze({ kind: 'unknown' });

const isEmptyRoot = (facts: RootFacts) =>
  facts.carries.length === 0 &&
  facts.heirs.length === 0 &&
  facts.merges.length === 0;

const byFirst = (left: readonly number[], right: readonly number[]) =>
  left[0] - right[0];

const continues = (last: Carry | undefined, [at, from]: Carry): last is Carry =>
  last !== undefined && last[0] + last[2] === at && last[1] + last[2] === from;

const sortedRootFacts = (
  carries: Carry[],
  heirs: Heir[],
  merges: Merge[]
): RootFacts => {
  const runs: Carry[] = [];

  for (const carry of carries.sort(byFirst)) {
    const last = runs.at(-1);

    if (continues(last, carry)) {
      runs[runs.length - 1] = [last[0], last[1], last[2] + carry[2]];
    } else {
      runs.push(carry);
    }
  }

  return {
    carries: runs,
    heirs: heirs.sort(byFirst),
    merges: merges.sort(byFirst),
  };
};

// Roots sort by key, so equal facts write equal JSON.
const recorded = (
  entries: Iterable<readonly [string, RootFacts]>
): RecordedFacts => {
  const roots = [...entries]
    .filter(([, facts]) => !isEmptyRoot(facts))
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));

  if (roots.length === 0) return NO_FACTS;
  countCoreWork('factAllocations');

  return { kind: 'recorded', roots: new Map(roots) };
};

/** @internal */
export const recordedFacts = (
  roots: Iterable<
    readonly [
      string,
      Readonly<{ carries: Carry[]; heirs: Heir[]; merges: Merge[] }>,
    ]
  >
): ChangeFacts =>
  recorded(
    [...roots].map(([root, { carries, heirs, merges }]) => [
      root,
      sortedRootFacts(carries, heirs, merges),
    ])
  );

/**
 * The facts of the inverse change. A carry swaps its ends, and heirs and
 * merges trade tables, because the inverse drops what the change wrote.
 *
 * @internal
 */
export const flipFacts = (facts: ChangeFacts): ChangeFacts =>
  facts.kind === 'unknown'
    ? facts
    : recorded(
        [...facts.roots].map(([root, { carries, heirs, merges }]) => [
          root,
          sortedRootFacts(
            carries.map(([at, from, length]) => [from, at, length]),
            [...merges],
            [...heirs]
          ),
        ])
      );

type Segment = Readonly<{
  kind: 'carry' | 'heir' | 'kept' | 'merge';
  length: number;
  other: number;
  start: number;
}>;

/** Segments of `segments` inside `from` to `to`, `other` shifted to match. */
const piecesOf = (segments: readonly Segment[], from: number, to: number) => {
  let low = 0;
  let high = segments.length;

  while (low < high) {
    const middle = (low + high) >> 1;
    const segment = segments[middle];

    if (segment.start + segment.length <= from) low = middle + 1;
    else high = middle;
  }

  const pieces: Segment[] = [];

  for (let index = low; index < segments.length; index++) {
    const segment = segments[index];

    if (segment.start >= to) break;

    const start = Math.max(from, segment.start);
    const end = Math.min(to, segment.start + segment.length);

    pieces.push({
      kind: segment.kind,
      length: end - start,
      other: segment.other + start - segment.start,
      start,
    });
  }

  return pieces;
};

const sortSegments = (segments: Segment[]) =>
  segments.sort((left, right) => left.start - right.start);

/** Where each output token of `change` came from, in output order. */
const sourcesOf = (change: RootChange, facts: RootFacts) =>
  sortSegments([
    ...keptRunsOf(change, 0, change.newLength).map((run): Segment => ({
      kind: 'kept',
      length: run.to - run.from,
      other: run.at,
      start: run.from,
    })),
    ...facts.carries.map(([at, from, length]): Segment => ({
      kind: 'carry',
      length,
      other: from,
      start: at,
    })),
    ...facts.heirs.map(([at, of]): Segment => ({
      kind: 'heir',
      length: 1,
      other: of,
      start: at,
    })),
  ]);

/** Where each input token of `change` went, in input order. */
const targetsOf = (change: RootChange, facts: RootFacts) =>
  sortSegments([
    ...keptRunsOf(change, 0, change.newLength).map((run): Segment => ({
      kind: 'kept',
      length: run.to - run.from,
      other: run.from,
      start: run.at,
    })),
    ...facts.carries.map(([at, from, length]): Segment => ({
      kind: 'carry',
      length,
      other: at,
      start: from,
    })),
    ...facts.merges.map(([at, into]): Segment => ({
      kind: 'merge',
      length: 1,
      other: into,
      start: at,
    })),
  ]);

const composeRoot = (
  a: RootChange,
  aFacts: RootFacts,
  b: RootChange,
  bFacts: RootFacts
) => {
  const sources = sourcesOf(a, aFacts);
  const targets = targetsOf(b, bFacts);
  const carries: Carry[] = [];
  const heirs: Heir[] = [];
  const merges: Merge[] = [];

  for (const [at, from, length] of bFacts.carries) {
    for (const piece of piecesOf(sources, from, from + length)) {
      const written = at + piece.start - from;

      if (piece.kind === 'heir') heirs.push([written, piece.other]);
      else carries.push([written, piece.other, piece.length]);
    }
  }
  for (const [at, of] of bFacts.heirs) {
    const [piece] = piecesOf(sources, of, of + 1);

    if (piece) heirs.push([at, piece.other]);
  }
  for (const [at, from, length] of aFacts.carries) {
    for (const piece of piecesOf(targets, at, at + length)) {
      if (piece.kind === 'kept') {
        carries.push([piece.other, from + piece.start - at, piece.length]);
      }
    }
  }
  for (const [at, of] of aFacts.heirs) {
    const [piece] = piecesOf(targets, at, at + 1);

    if (piece?.kind === 'kept') heirs.push([piece.other, of]);
  }
  for (const [at, into] of aFacts.merges) {
    const [piece] = piecesOf(targets, into, into + 1);

    if (piece) merges.push([at, piece.other]);
  }
  for (const [at, into] of bFacts.merges) {
    const [piece] = piecesOf(sources, at, at + 1);

    if (piece && piece.kind !== 'heir') merges.push([piece.other, into]);
  }

  return sortedRootFacts(carries, heirs, merges);
};

/**
 * The facts of `a` then `b`. Each position maps through the other change, a
 * fact whose token one change wrote fresh or dropped loses that part, and a
 * carry splits where its pieces map differently.
 *
 * @internal
 */
export const composeFacts = (
  a: DocumentChange,
  aFacts: ChangeFacts,
  b: DocumentChange,
  bFacts: ChangeFacts
): ChangeFacts => {
  if (
    aFacts.kind === 'unknown' ||
    bFacts.kind === 'unknown' ||
    rootComposeRebuilds(a, b) !== undefined
  ) {
    return UNKNOWN_FACTS;
  }

  const roots = new Set([...aFacts.roots.keys(), ...bFacts.roots.keys()]);

  return recorded(
    [...roots].flatMap((root): Array<readonly [string, RootFacts]> => {
      const first = getInternalDocumentRootChange(a, root);
      const second = getInternalDocumentRootChange(b, root);
      const firstFacts = aFacts.roots.get(root);
      const secondFacts = bFacts.roots.get(root);

      if (!second) return firstFacts ? [[root, firstFacts]] : [];
      if (!first) return secondFacts ? [[root, secondFacts]] : [];

      return [
        [
          root,
          composeRoot(
            first,
            firstFacts ?? NO_ROOT_FACTS,
            second,
            secondFacts ?? NO_ROOT_FACTS
          ),
        ],
      ];
    })
  );
};

const inside = (position: number, length: number, size: number) =>
  Number.isSafeInteger(position) &&
  Number.isSafeInteger(length) &&
  position >= 0 &&
  length >= 1 &&
  position + length <= size;

const kindAt = (document: DocumentIndex, position: number) =>
  document.nodeStartingAt(position)?.kind;

const kindFault = (
  output: DocumentIndex,
  at: number,
  input: DocumentIndex,
  of: number
) => {
  const kind = kindAt(output, at);
  const source = kindAt(input, of);

  if (!kind || !source) return 'not-open';

  return kind === source ? null : 'kind';
};

const sameShape = (left: JsonToken, right: JsonToken) =>
  left.kind === 'open' && right.kind === 'open'
    ? left.nodeKind === right.nodeKind
    : tokensEqual(left, right);

const sameShapes = (
  input: DocumentIndex,
  from: number,
  output: DocumentIndex,
  at: number,
  length: number
) => {
  const source = input.slice(from, from + length).tokens;
  const copy = output.slice(at, at + length).tokens;

  return (
    source.length === copy.length &&
    source.every((token, index) => sameShape(token, copy[index]))
  );
};

type Claim = Readonly<{
  index: number;
  length: number;
  start: number;
  table: FactTable;
}>;

type Reasons = Record<FactTable, Array<FactFaultReason | null>>;

/** Marks `overlap` on each unfaulted claim that starts inside an earlier one. */
const markOverlaps = (claims: Claim[], reasons: Reasons) => {
  let end = 0;

  for (const claim of claims
    .filter(({ index, table }) => reasons[table][index] === null)
    .sort((left, right) => left.start - right.start)) {
    if (claim.start < end) reasons[claim.table][claim.index] = 'overlap';
    end = Math.max(end, claim.start + claim.length);
  }
};

const checkRoot = (
  change: RootChange,
  facts: RootFacts,
  input: DocumentIndex
) => {
  if (input.length !== change.length) {
    throw new Error('Cannot check facts against a mismatched document.');
  }

  const output = change.apply(input);
  const keptOutput = sourcesOf(change, NO_ROOT_FACTS);
  const keptInput = targetsOf(change, NO_ROOT_FACTS);
  const liveInput = targetsOf(change, {
    ...NO_ROOT_FACTS,
    carries: facts.carries,
  });
  const writes = (at: number, length: number) =>
    piecesOf(keptOutput, at, at + length).length === 0;
  const drops = (from: number, length: number) =>
    piecesOf(keptInput, from, from + length).length === 0;
  const reasons: Reasons = {
    carries: facts.carries.map(([at, from, length]) => {
      if (
        !inside(at, length, change.newLength) ||
        !inside(from, length, change.length)
      ) {
        return 'outside';
      }
      if (!writes(at, length) || !drops(from, length)) return 'kept';

      return sameShapes(input, from, output, at, length) ? null : 'copy';
    }),
    heirs: facts.heirs.map(([at, of]) => {
      if (!inside(at, 1, change.newLength) || !inside(of, 1, change.length)) {
        return 'outside';
      }
      if (!writes(at, 1)) return 'kept';

      return kindFault(output, at, input, of);
    }),
    merges: facts.merges.map(([at, into]) => {
      if (!inside(at, 1, change.length) || !inside(into, 1, change.newLength)) {
        return 'outside';
      }
      if (piecesOf(liveInput, at, at + 1).length > 0) return 'kept';

      return kindFault(output, into, input, at);
    }),
  };

  markOverlaps(
    [
      ...facts.carries.map(([at, , length], index): Claim => ({
        index,
        length,
        start: at,
        table: 'carries',
      })),
      ...facts.heirs.map(([at], index): Claim => ({
        index,
        length: 1,
        start: at,
        table: 'heirs',
      })),
    ],
    reasons
  );
  markOverlaps(
    [
      ...facts.carries.map(([, from, length], index): Claim => ({
        index,
        length,
        start: from,
        table: 'carries',
      })),
      ...facts.merges.map(([at], index): Claim => ({
        index,
        length: 1,
        start: at,
        table: 'merges',
      })),
    ],
    reasons
  );

  return TABLES.flatMap((table) =>
    reasons[table].flatMap((reason, index) =>
      reason === null ? [] : [[table, index, reason] as const]
    )
  );
};

/**
 * The facts a change cannot hold against the value it applies to: a position
 * outside its sequence, a fact on a token the change keeps, an heir or merge
 * that names no open token or joins an element and a text, a carry whose copy
 * differs from its source in more than its opens' properties, two facts that
 * claim one token, or facts on a root the change does not write.
 *
 * @internal
 */
export const checkFacts = (
  change: DocumentChange,
  facts: ChangeFacts,
  before: JsonEditorValue
): readonly FactFault[] => {
  if (facts.kind === 'unknown') return [];

  return [...facts.roots].flatMap(([root, rootFacts]) => {
    const rootChange = getInternalDocumentRootChange(change, root);
    const faults =
      !rootChange || change.deleteRoots.has(root)
        ? TABLES.flatMap((table) =>
            rootFacts[table].map((_, index) => [table, index, 'root'] as const)
          )
        : checkRoot(rootChange, rootFacts, valueRootIndex(before, root));

    return faults.map(([table, index, reason]) =>
      Object.freeze({ index, reason, root, table })
    );
  });
};

/** @internal */
export const factsToJSON = (facts: ChangeFacts): ChangeFactsJson => {
  if (facts.kind === 'unknown') return { kind: 'unknown' };

  const canonical = recorded(
    [...facts.roots].map(([root, { carries, heirs, merges }]) => [
      root,
      sortedRootFacts([...carries], [...heirs], [...merges]),
    ])
  );

  return {
    kind: 'recorded',
    roots: Object.fromEntries(
      [...canonical.roots].map(([root, rootFacts]) => [
        root,
        Object.fromEntries(
          TABLES.filter((table) => rootFacts[table].length > 0).map((table) => [
            table,
            rootFacts[table].map((fact) => [...fact]),
          ])
        ),
      ])
    ),
  };
};

const refuse = (message: string): never => {
  throw new FactsJsonError(message);
};

const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

const isPosition = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const readCarry = (fact: readonly unknown[]): Carry | null => {
  const [at, from, length] = fact;

  return fact.length === 3 &&
    isPosition(at) &&
    isPosition(from) &&
    isPosition(length) &&
    length >= 1
    ? ([at, from, length] as const)
    : null;
};

const readPair = (fact: readonly unknown[]): Heir | Merge | null => {
  const [at, other] = fact;

  return fact.length === 2 && isPosition(at) && isPosition(other)
    ? ([at, other] as const)
    : null;
};

const readTable = <T extends readonly number[]>(
  value: unknown,
  label: string,
  read: (fact: readonly unknown[]) => T | null,
  end: (fact: T) => number
): readonly T[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length === 0) {
    return refuse(`Facts table ${label} must be a non-empty array.`);
  }

  let after = 0;
  const facts: T[] = [];

  for (const [index, item] of value.entries()) {
    const fact = Array.isArray(item) ? read(item) : null;

    if (!fact) return refuse(`Fact ${label}[${index}] is malformed.`);
    if (fact[0] < after) {
      return refuse(`Fact ${label}[${index}] is out of order or overlaps.`);
    }
    after = end(fact);
    facts.push(fact);
  }

  return facts;
};

// Refuses a carry that continues the one before it, which `sortedRootFacts`
// would have joined, so each set of carries has one JSON form, and sources that
// overlap, which `flipFacts` would turn into outputs this reader refuses.
const readCarries = (value: unknown, label: string) => {
  const carries = readTable(
    value,
    label,
    readCarry,
    ([at, , length]) => at + length
  );
  const bySource = [...carries].sort(([, left], [, right]) => left - right);

  for (const [index, carry] of carries.entries()) {
    if (continues(carries[index - 1], carry)) {
      refuse(`Fact ${label}[${index}] continues the one before it.`);
    }
  }
  for (const [index, [, from]] of bySource.entries()) {
    const last = bySource[index - 1];

    if (last && last[1] + last[2] > from) {
      refuse(`Facts ${label} overlap at their sources.`);
    }
  }

  return carries;
};

/**
 * Read facts JSON, refusing a malformed one with a `FactsJsonError`. Whether
 * the facts fit a change is `checkFacts`'s question.
 *
 * @internal
 */
export const factsFromJSON = (json: unknown): ChangeFacts => {
  if (!isRecord(json)) return refuse('Facts JSON must be an object.');
  if (json.kind === 'unknown') {
    return hasOnlyKeys(json, ['kind'])
      ? UNKNOWN_FACTS
      : refuse('Unknown facts hold no other field.');
  }
  if (json.kind !== 'recorded' || !hasOnlyKeys(json, ['kind', 'roots'])) {
    return refuse('Facts JSON must be recorded or unknown.');
  }
  if (!isRecord(json.roots)) return refuse('Facts roots must be an object.');

  return recorded(
    Object.entries(json.roots).map(([root, value]) => {
      try {
        assertDocumentRootKey(root);
      } catch {
        return refuse(`Invalid facts root ${root}.`);
      }
      if (
        !isRecord(value) ||
        Object.keys(value).length === 0 ||
        !hasOnlyKeys(value, TABLES)
      ) {
        return refuse(`Facts of root ${root} must hold one or more tables.`);
      }

      const facts: RootFacts = {
        carries: readCarries(value.carries, `${root}.carries`),
        heirs: readTable(
          value.heirs,
          `${root}.heirs`,
          readPair,
          ([at]) => at + 1
        ),
        merges: readTable(
          value.merges,
          `${root}.merges`,
          readPair,
          ([at]) => at + 1
        ),
      };

      return [root, facts] as const;
    })
  );
};
