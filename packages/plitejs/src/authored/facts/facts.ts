import { type NodeList, rootNodesOf } from '../../core/change/document-index';
import { EditorMissingReferenceError } from '../../core/missing-reference';
import {
  getRecord,
  getRecordCount,
  getRecordEntries,
  getRecordSetVersion,
  getValueRecords,
  hasRecordWithPrefix,
  type RecordOps,
  type RecordStore,
} from '../../core/record-store';
import type { EditorDocumentRecords } from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import { countLedgerWork } from '../ledger/work';
import type { IsLanded } from '../tree/layers';
import {
  type AuthoredMark,
  AuthoredMarkError,
  type MarkBase,
  readAuthoredMarks,
  readRestsOn,
} from '../tree/marks';
import { isEditingChange } from './editing';
import {
  CONTEXTS,
  type ContextRecord,
  changeVerdictProbeOf,
  contextIdOf,
  contextRecordOf,
  incarnationOf,
  LANDED,
  parseContext,
  parseLanded,
  parseVerdict,
  type Verdict,
  VERDICTS,
  verdictProbeOf,
} from './records';

export type ReviewFacts = Readonly<{
  contexts: ContextLookup['contexts'];
  /** Whether a verdict names any incarnation of `change`. */
  decides: (change: string) => boolean;
  /** Whether any verdict is stored. */
  hasVerdicts: boolean;
  /** Whether a verdict, or one with `verdict`, names `incarnation`. */
  hasVerdict: (incarnation: string, verdict?: Verdict) => boolean;
  insertedIncarnations: () => Readonly<{
    has: (incarnation: string) => boolean;
  }>;
  landed: IsLanded;
}>;

/** Where context records are read from: a document's, or a recording's that adds to them. */
export type ContextLookup = Readonly<{
  contexts: Readonly<{
    get: (ctx: string) => ContextRecord | undefined;
    has: (ctx: string) => boolean;
  }>;
}>;

type Roots = Readonly<Record<string, readonly unknown[]>>;

type Value = Readonly<{
  children: readonly unknown[];
  records?: EditorDocumentRecords;
  roots?: Roots;
}>;

const EMPTY: readonly unknown[] = Object.freeze([]);

// Parsed contexts by id, each checked against its stored text before reuse.
// A context's id hashes its content, so one entry serves every version and
// document that holds it.
const PARSED = new Map<
  string,
  Readonly<{ json: string; record: ContextRecord }>
>();
const PARSED_LIMIT = 1 << 15;

const readContext = (
  store: RecordStore,
  ctx: string
): ContextRecord | undefined => {
  const json = getRecord(store, CONTEXTS, ctx);

  if (json === undefined) return undefined;

  const cached = PARSED.get(ctx);

  if (cached?.json === json) return cached.record;

  const record = parseContext(ctx, json);

  if (!record) {
    throw new AuthoredMarkError(`Review context ${ctx} is malformed.`, []);
  }
  if (PARSED.size >= PARSED_LIMIT) {
    PARSED.delete(PARSED.keys().next().value as string);
  }
  PARSED.set(ctx, { json, record });

  return record;
};

const missingBase = (ctx: string, base: string) =>
  new AuthoredMarkError(
    `Review context ${ctx} rests on missing context ${base}.`,
    [],
    { cause: new EditorMissingReferenceError(base) }
  );

const assertContentId = (record: ContextRecord) => {
  if (record.ctx !== contextIdOf(record.base, record.member)) {
    throw new AuthoredMarkError(
      `Review context ${record.ctx} does not match its content.`,
      []
    );
  }
};

// A content id makes a cycle a hash collision, and FNV-1a preimages can be
// computed, so a peer could forge one; every chain must reach a root context.
const assertChainEnds = (
  record: ContextRecord,
  get: (ctx: string) => ContextRecord | undefined,
  ended: Set<string>
) => {
  const walked = new Set<string>();
  let current: ContextRecord | undefined = record;

  while (current && !ended.has(current.ctx)) {
    if (walked.has(current.ctx)) {
      throw new AuthoredMarkError(
        `Review context ${record.ctx} rests on itself.`,
        []
      );
    }
    walked.add(current.ctx);
    if (current.base === null) break;

    const base = get(current.base);

    if (!base) throw missingBase(current.ctx, current.base);
    current = base;
  }
  for (const ctx of walked) ended.add(ctx);
};

// The record sets whose records each stand alone, checked one by one.
const PARSERS: ReadonlyArray<
  readonly [
    set: string,
    name: string,
    parse: (id: string, json: string) => unknown,
  ]
> = [
  [VERDICTS, 'verdict', parseVerdict],
  [LANDED, 'landed write', parseLanded],
];

const assertParsed = (
  name: string,
  parse: (id: string, json: string) => unknown,
  id: string,
  json: string
) => {
  if (!parse(id, json)) {
    throw new AuthoredMarkError(`Review ${name} ${id} is malformed.`, []);
  }
};

/**
 * Check the review records `ops` writes into `store`, the records after them.
 * A stored context was checked when it was written, so a chain walk stops at
 * the first context this write did not add.
 */
export const assertRecordWrites = (store: RecordStore, ops: RecordOps) => {
  const contexts = ops.get(CONTEXTS);

  if (contexts) {
    const written = new Map<string, ContextRecord>();

    for (const [ctx, json] of contexts) {
      if (json === null) continue;

      const record = parseContext(ctx, json);

      if (!record) {
        throw new AuthoredMarkError(`Review context ${ctx} is malformed.`, []);
      }
      written.set(ctx, record);
    }

    const ended = new Set<string>();
    const get = (ctx: string) => {
      const record = written.get(ctx);

      if (record) return record;
      if (getRecord(store, CONTEXTS, ctx) !== undefined) ended.add(ctx);

      return readContext(store, ctx);
    };

    for (const record of written.values()) {
      assertChainEnds(record, get, ended);
    }
    written.forEach(assertContentId);

    const dropped = new Set(
      [...contexts].flatMap(([ctx, json]) => (json === null ? [ctx] : []))
    );

    if (dropped.size > 0) {
      for (const [ctx] of getRecordEntries(store, CONTEXTS)) {
        const base = readContext(store, ctx)?.base;

        if (base != null && dropped.has(base)) {
          throw new AuthoredMarkError(
            `Review context ${base} was dropped while context ${ctx} rests on it.`,
            []
          );
        }
      }
    }
  }
  for (const [set, name, parse] of PARSERS) {
    for (const [id, json] of ops.get(set) ?? []) {
      if (json !== null) assertParsed(name, parse, id, json);
    }
  }
};

/** Check every review record `store` holds, as a load does once. */
export const assertRecordStore = (store: RecordStore) => {
  const ended = new Set<string>();
  const get = (ctx: string) => readContext(store, ctx);

  const records = [...getRecordEntries(store, CONTEXTS)].map(([ctx]) =>
    getRecordDefined(get(ctx))
  );

  for (const record of records) assertChainEnds(record, get, ended);
  records.forEach(assertContentId);
  for (const [set, name, parse] of PARSERS) {
    for (const [id, json] of getRecordEntries(store, set)) {
      assertParsed(name, parse, id, json);
    }
  }
};

const getRecordDefined = (record: ContextRecord | undefined) => {
  if (!record) throw new Error('A listed context has no record.');

  return record;
};

type RecordFacts = Omit<ReviewFacts, 'insertedIncarnations'>;

const RECORD_FACTS = new WeakMap<object, RecordFacts>();

const NO_RECORD_FACTS: RecordFacts = Object.freeze({
  contexts: Object.freeze({ get: () => undefined, has: () => false }),
  decides: () => {
    countLedgerWork('verdictLookups');

    return false;
  },
  hasVerdict: () => {
    countLedgerWork('verdictLookups');

    return false;
  },
  hasVerdicts: false,
  landed: () => false,
});

const recordFactsOf = (store: RecordStore): RecordFacts => {
  if (
    getRecordSetVersion(store, CONTEXTS) === null &&
    getRecordSetVersion(store, LANDED) === null &&
    getRecordSetVersion(store, VERDICTS) === null
  ) {
    return NO_RECORD_FACTS;
  }

  let facts = RECORD_FACTS.get(store);

  if (!facts) {
    const hasVerdict = (incarnation: string, verdict?: Verdict) => {
      countLedgerWork('verdictLookups');

      return hasRecordWithPrefix(
        store,
        VERDICTS,
        verdictProbeOf(incarnation, verdict)
      );
    };

    facts = Object.freeze({
      contexts: Object.freeze({
        get: (ctx: string) => readContext(store, ctx),
        has: (ctx: string) => getRecord(store, CONTEXTS, ctx) !== undefined,
      }),
      decides: (change: string) => {
        countLedgerWork('verdictLookups');

        return hasRecordWithPrefix(
          store,
          VERDICTS,
          changeVerdictProbeOf(change)
        );
      },
      hasVerdict,
      hasVerdicts: getRecordCount(store, VERDICTS) > 0,
      landed: (write: string) => {
        const json = getRecord(store, LANDED, write);
        const member =
          json === undefined ? null : parseLanded(write, json)?.member;

        return (
          !!member &&
          (isEditingChange(member.change) ||
            hasVerdict(incarnationOf(member), 'accept'))
        );
      },
    });
    RECORD_FACTS.set(store, facts);
  }

  return facts;
};

export const contentRootsOf = <T>(
  value: Readonly<{
    children: readonly T[];
    roots?: Readonly<Record<string, readonly T[]>>;
  }>
) =>
  new Map<string, NodeList<T>>([
    ['main', rootNodesOf(value, 'children')],
    ...Object.entries(value.roots ?? {}),
  ]);

const contentOf = (value: Value) => [...contentRootsOf(value).values()];

const carriedInsertions = (
  node: unknown,
  lookup: ContextLookup,
  carry: (incarnation: string) => void
) => {
  if ((node as { text?: unknown }).text === '') return;

  const contexts = readRestsOn(node);
  const carried = contexts.length === 0 ? null : new Set<string>();
  const once = (incarnation: string) => {
    if (carried?.has(incarnation)) return;
    carried?.add(incarnation);
    carry(incarnation);
  };

  for (const mark of readAuthoredMarks(node)) {
    if (mark.kind === 'insert') once(incarnationOf(mark));
  }
  for (const { ctx } of contexts) {
    for (const member of membersIn(lookup, ctx)) once(incarnationOf(member));
  }
};

const DOCUMENT_FACTS = new WeakMap<
  NodeList<unknown>,
  Readonly<{
    content: ReadonlyArray<NodeList<unknown>>;
    facts: ReviewFacts;
    records: RecordFacts;
  }>
>();

export const factsOf = (value: Value): ReviewFacts => {
  const records = recordFactsOf(getValueRecords(value));
  const content = contentOf(value);
  const main = getDefined(content[0]);
  const cached = DOCUMENT_FACTS.get(main);

  if (
    cached &&
    cached.content.length === content.length &&
    cached.content.every((children, index) => children === content[index]) &&
    cached.records === records
  ) {
    return cached.facts;
  }

  countLedgerWork('documentFacts');

  let inserted: NodesPerIncarnation | null = null;
  // Admission keeps each admitted document's counts, so this reads them
  // instead of the document.
  const facts: ReviewFacts = Object.freeze({
    ...records,
    insertedIncarnations: () => (inserted ??= insertionsOf(value).counts),
  });

  DOCUMENT_FACTS.set(main, { content, facts, records });

  return facts;
};

export const NO_FACTS: ReviewFacts = factsOf({ children: EMPTY });

export type NodesPerIncarnation = ReadonlyMap<string, number>;

type Insertions = Readonly<{
  counts: NodesPerIncarnation;
  roots: ReadonlyMap<string, NodeList<unknown>>;
}>;

const NONE: NodesPerIncarnation = new Map();
const SUMMARIES = new WeakMap<object, NodesPerIncarnation>();
const INSERTIONS = new WeakMap<NodeList<unknown>, Insertions>();

export const addCounts = (
  counts: Map<string, number>,
  added: NodesPerIncarnation,
  sign: 1 | -1,
  flipped?: Set<string>
) => {
  for (const [incarnation, count] of added) {
    const was = counts.get(incarnation) ?? 0;
    const now = was + sign * count;

    if (flipped && was > 0 !== now > 0) flipped.add(incarnation);
    if (now === 0) counts.delete(incarnation);
    else counts.set(incarnation, now);
  }
};

export const insertionsIn = (
  node: unknown,
  facts: ReviewFacts
): NodesPerIncarnation => {
  if (typeof node !== 'object' || node === null) return NONE;

  const cached = SUMMARIES.get(node);

  if (cached) return cached;

  const counts = new Map<string, number>();
  const { children } = node as { children?: unknown };

  carriedInsertions(node, facts, (incarnation) =>
    counts.set(incarnation, (counts.get(incarnation) ?? 0) + 1)
  );
  if (Array.isArray(children)) {
    countLedgerWork('summaryChildren', children.length);
    for (const child of children) {
      addCounts(counts, insertionsIn(child, facts), 1);
    }
  }

  const summary = counts.size === 0 ? NONE : counts;

  SUMMARIES.set(node, summary);

  return summary;
};

export const insertionsOf = (value: Value): Insertions => {
  const roots = contentRootsOf(value);
  const cached = INSERTIONS.get(getDefined(roots.get('main')));

  if (
    cached &&
    cached.roots.size === roots.size &&
    [...roots].every(([root, nodes]) => cached.roots.get(root) === nodes)
  ) {
    return cached;
  }

  const facts = factsOf(value);
  const counts = new Map<string, number>();

  for (const nodes of roots.values()) {
    nodes.forEach((node) => {
      addCounts(counts, insertionsIn(node, facts), 1);
    });
  }

  return rememberInsertions(value, counts);
};

export const rememberInsertions = (
  value: Value,
  counts: NodesPerIncarnation
): Insertions => {
  const insertions = { counts, roots: contentRootsOf(value) };

  INSERTIONS.set(getDefined(insertions.roots.get('main')), insertions);

  return insertions;
};

export const primeInsertions = (value: Value) => {
  insertionsOf(value);
};

const MEMBERS = new WeakMap<ContextRecord, readonly MarkBase[]>();

/** The members `ctx` lists, outer to inner. */
export const membersOf = (
  facts: ReviewFacts,
  ctx: string
): readonly MarkBase[] => membersIn(facts, ctx);

const membersIn = (facts: ContextLookup, ctx: string): readonly MarkBase[] => {
  const record = facts.contexts.get(ctx);

  if (!record) {
    throw new AuthoredMarkError(`Review context ${ctx} is missing.`, [], {
      cause: new EditorMissingReferenceError(ctx),
    });
  }

  let members = MEMBERS.get(record);

  if (!members) {
    const chain: MarkBase[] = [];

    for (
      let current: ContextRecord | undefined = record;
      current;
      current =
        current.base === null ? undefined : facts.contexts.get(current.base)
    ) {
      countLedgerWork('contextHops');
      chain.push(current.member);
    }
    members = Object.freeze(chain.reverse());
    MEMBERS.set(record, members);
  }

  return members;
};

/** The context that lists `members`, outer to inner, and the records to add for it. */
export const contextFor = (
  facts: ContextLookup,
  members: readonly MarkBase[]
): Readonly<{ ctx: string | null; records: readonly ContextRecord[] }> => {
  const records: ContextRecord[] = [];
  let ctx: string | null = null;

  for (const member of members) {
    const record = contextRecordOf(ctx, member);

    if (!facts.contexts.has(record.ctx)) {
      countLedgerWork('contextsMinted');
      records.push(record);
    }
    ({ ctx } = record);
  }

  return { ctx, records };
};

const SETTLED_BY_REJECT: ReadonlySet<AuthoredMark['kind']> = new Set([
  'delete',
  'format',
]);

export const outcomeOf = (
  facts: ReviewFacts,
  mark: AuthoredMark
): 'accept' | 'pending' | 'reject' => {
  if (isEditingChange(mark.change)) return 'accept';

  const key = incarnationOf(mark);

  if (!facts.hasVerdict(key)) return 'pending';
  if (facts.hasVerdict(key, 'accept')) return 'accept';

  const replacementPending = facts.insertedIncarnations().has(key);

  return SETTLED_BY_REJECT.has(mark.kind) && !replacementPending
    ? 'reject'
    : 'pending';
};

const INSERTS = new WeakMap<MarkBase, AuthoredMark>();

const insertOf = (member: MarkBase): AuthoredMark => {
  let mark = INSERTS.get(member);

  if (!mark) {
    mark = Object.freeze({ ...member, kind: 'insert' as const });
    INSERTS.set(member, mark);
  }

  return mark;
};

const NO_CLAIMS: readonly AuthoredMark[] = Object.freeze([]);

/** The members of a node's context it holds no own insertion of. */
export const contextClaimsOf = (
  node: unknown,
  facts: ContextLookup
): readonly AuthoredMark[] => {
  const claims = readAuthoredMarks(node);
  const contexts = readRestsOn(node);

  if (contexts.length === 0) return NO_CLAIMS;

  const inserted = new Set(
    claims.flatMap((mark) =>
      mark.kind === 'insert' ? [incarnationOf(mark)] : []
    )
  );
  const members = contexts.flatMap(({ ctx }) =>
    membersIn(facts, ctx).filter((member) => {
      const key = incarnationOf(member);

      if (inserted.has(key)) return false;
      inserted.add(key);

      return true;
    })
  );

  return members.map(insertOf);
};

const CLAIMS = new WeakMap<
  object,
  Readonly<{ claims: readonly AuthoredMark[]; records: readonly unknown[] }>
>();

/** A node's claims, its context's members first as insertions, decided or not. */
export const claimsOf = (
  node: unknown,
  facts: ContextLookup
): readonly AuthoredMark[] => {
  const contexts = readRestsOn(node);

  if (contexts.length === 0) return readAuthoredMarks(node);

  const records = contexts.map(({ ctx }) => facts.contexts.get(ctx));
  const cached = CLAIMS.get(node as object);

  if (
    cached &&
    cached.records.length === records.length &&
    cached.records.every((record, index) => record === records[index])
  ) {
    return cached.claims;
  }

  const claims = Object.freeze([
    ...contextClaimsOf(node, facts),
    ...readAuthoredMarks(node),
  ]);

  CLAIMS.set(node as object, { claims, records });

  return claims;
};

export const marksOf = (
  node: unknown,
  facts: ReviewFacts
): readonly AuthoredMark[] => {
  const claims = claimsOf(node, facts);

  return !facts.hasVerdicts &&
    !claims.some((mark) => isEditingChange(mark.change))
    ? claims
    : claims.filter((mark) => outcomeOf(facts, mark) === 'pending');
};

/**
 * A node's claims a decision still acts on: the pending ones and the accepted
 * ones still stored, which are Editing's claims and structure whose landing
 * waited. Only a rejection settles a claim away.
 */
export const standingClaimsOf = (
  node: unknown,
  facts: ReviewFacts,
  lookup: ContextLookup
): readonly AuthoredMark[] => {
  const claims = claimsOf(node, lookup);

  return !facts.hasVerdicts
    ? claims
    : claims.filter((mark) => outcomeOf(facts, mark) !== 'reject');
};

export const isAccepted = (
  facts: ReviewFacts,
  member: Pick<MarkBase, 'at' | 'change' | 'inc'>
) =>
  isEditingChange(member.change) ||
  (facts.hasVerdicts && facts.hasVerdict(incarnationOf(member), 'accept'));

export const isSettledDeletion = (node: unknown, facts: ReviewFacts) =>
  readAuthoredMarks(node).some(
    (mark) => mark.kind === 'delete' && isAccepted(facts, mark)
  );
