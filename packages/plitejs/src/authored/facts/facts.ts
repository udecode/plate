import { EditorMissingReferenceError } from '../../core/missing-reference';
import { isMetadataRootKey } from '../../internal/root-location';
import {
  type AuthoredMark,
  AuthoredMarkError,
  type MarkBase,
  readAuthoredMarks,
  readRestsOn,
} from '../tree/marks';
import { isEditingChange } from './editing';
import {
  CONTEXTS_ROOT,
  type ContextRecord,
  contextIdOf,
  contextRecordOf,
  incarnationOf,
  parseContextElement,
  parseVerdictElement,
  type Verdict,
  VERDICTS_ROOT,
} from './records';

export type ReviewFacts = Readonly<{
  contexts: ReadonlyMap<string, ContextRecord>;
  decidedChangeIds: ReadonlySet<string>;
  insertedIncarnations: () => Readonly<{
    has: (incarnation: string) => boolean;
  }>;
  verdicts: ReadonlyMap<string, ReadonlySet<Verdict>>;
}>;

/** Where context records are read from: a document's, or a recording's that adds to them. */
export type ContextLookup = Readonly<{
  contexts: Pick<ReadonlyMap<string, ContextRecord>, 'get' | 'has'>;
}>;

type Roots = Readonly<Record<string, readonly unknown[]>>;

type Value = Readonly<{ children: readonly unknown[]; roots?: Roots }>;

const EMPTY: readonly unknown[] = Object.freeze([]);

const PARSED_CONTEXTS = new WeakMap<object, ContextRecord>();

const parseContextAt = (node: unknown, index: number) => {
  const cached = PARSED_CONTEXTS.get(node as object);

  if (cached) return cached;

  const record = parseContextElement(node);

  if (!record) {
    throw new AuthoredMarkError(`A record in ${CONTEXTS_ROOT} is malformed.`, [
      index,
    ]);
  }
  PARSED_CONTEXTS.set(node as object, record);

  return record;
};

const HASHED = new WeakSet<ContextRecord>();

const assertContentId = (record: ContextRecord, index: number) => {
  if (HASHED.has(record)) return;
  if (record.ctx !== contextIdOf(record.base, record.member)) {
    throw new AuthoredMarkError(
      `Review context ${record.ctx} does not match its content.`,
      [index]
    );
  }
  HASHED.add(record);
};

// A content id makes a cycle a hash collision, and FNV-1a preimages can be
// computed, so a peer could forge one; every chain must reach a root context.
const assertChainsEnd = (
  records: readonly ContextRecord[],
  byId: ReadonlyMap<string, ContextRecord>
) => {
  const ended = new Set<string>();

  records.forEach((record, index) => {
    const walked = new Set<string>();
    let current: ContextRecord | undefined = record;

    while (current && !ended.has(current.ctx)) {
      if (walked.has(current.ctx)) {
        throw new AuthoredMarkError(
          `Review context ${record.ctx} rests on itself.`,
          [index]
        );
      }
      walked.add(current.ctx);
      if (current.base === null) break;

      const base = byId.get(current.base);

      if (!base) {
        throw new AuthoredMarkError(
          `Review context ${current.ctx} rests on missing context ${current.base}.`,
          [index]
        );
      }
      current = base;
    }
    for (const ctx of walked) ended.add(ctx);
  });
};

type RecordFacts = Omit<ReviewFacts, 'insertedIncarnations'>;

const buildRecordFacts = (
  contexts: readonly unknown[],
  verdicts: readonly unknown[]
): RecordFacts => {
  const records = contexts.map(parseContextAt);
  const byId = new Map(records.map((record) => [record.ctx, record]));

  assertChainsEnd(records, byId);
  // Each id hashes its record's content, so a duplicate id is an equal record.
  records.forEach(assertContentId);

  const byIncarnation = new Map<string, Set<Verdict>>();
  const decidedChangeIds = new Set<string>();

  verdicts.forEach((node, index) => {
    const record = parseVerdictElement(node);

    if (!record) {
      throw new AuthoredMarkError(
        `A record in ${VERDICTS_ROOT} is malformed.`,
        [index]
      );
    }

    const key = incarnationOf(record.member);
    const set = byIncarnation.get(key) ?? new Set();

    set.add(record.verdict);
    byIncarnation.set(key, set);
    decidedChangeIds.add(record.member.change);
  });

  return { contexts: byId, decidedChangeIds, verdicts: byIncarnation };
};

const RECORD_FACTS = new WeakMap<
  readonly unknown[],
  WeakMap<readonly unknown[], RecordFacts>
>();

const recordFactsOf = (roots: Roots | undefined) => {
  const contexts = roots?.[CONTEXTS_ROOT] ?? EMPTY;
  const verdicts = roots?.[VERDICTS_ROOT] ?? EMPTY;
  let byVerdicts = RECORD_FACTS.get(contexts);

  if (!byVerdicts) {
    byVerdicts = new WeakMap();
    RECORD_FACTS.set(contexts, byVerdicts);
  }

  let facts = byVerdicts.get(verdicts);

  if (!facts) {
    facts = buildRecordFacts(contexts, verdicts);
    byVerdicts.set(verdicts, facts);
  }

  return facts;
};

export const contentRootsOf = <T>(
  value: Readonly<{
    children: readonly T[];
    roots?: Readonly<Record<string, readonly T[]>>;
  }>
) =>
  new Map<string, readonly T[]>([
    ['main', value.children],
    ...Object.entries(value.roots ?? {}).filter(
      ([root]) => !isMetadataRootKey(root)
    ),
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

const insertedIncarnationsIn = (
  records: RecordFacts,
  content: ReadonlyArray<readonly unknown[]>
) => {
  const inserting = new Set<string>();
  const visit = (nodes: readonly unknown[]) => {
    for (const node of nodes) {
      carriedInsertions(node, records, (incarnation) =>
        inserting.add(incarnation)
      );

      const { children } = node as { children?: unknown };

      if (Array.isArray(children)) visit(children);
    }
  };

  content.forEach(visit);

  return inserting;
};

const DOCUMENT_FACTS = new WeakMap<
  readonly unknown[],
  Readonly<{ content: ReadonlyArray<readonly unknown[]>; facts: ReviewFacts }>
>();

export const factsOf = (value: Value): ReviewFacts => {
  const records = recordFactsOf(value.roots);
  const content = contentOf(value);
  const cached = DOCUMENT_FACTS.get(value.children);

  if (
    cached &&
    cached.content.length === content.length &&
    cached.content.every((children, index) => children === content[index]) &&
    cached.facts.contexts === records.contexts &&
    cached.facts.verdicts === records.verdicts
  ) {
    return cached.facts;
  }

  let inserted: ReadonlySet<string> | null = null;
  const facts: ReviewFacts = Object.freeze({
    ...records,
    insertedIncarnations: () =>
      (inserted ??= insertedIncarnationsIn(records, content)),
  });

  DOCUMENT_FACTS.set(value.children, { content, facts });

  return facts;
};

export const NO_FACTS: ReviewFacts = factsOf({ children: EMPTY });

export type NodesPerIncarnation = ReadonlyMap<string, number>;

type Insertions = Readonly<{
  counts: NodesPerIncarnation;
  roots: ReadonlyMap<string, readonly unknown[]>;
}>;

const NONE: NodesPerIncarnation = new Map();
const SUMMARIES = new WeakMap<object, NodesPerIncarnation>();
const INSERTIONS = new WeakMap<readonly unknown[], Insertions>();

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
  const cached = INSERTIONS.get(value.children);

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
    for (const node of nodes) {
      addCounts(counts, insertionsIn(node, facts), 1);
    }
  }

  return rememberInsertions(value, counts);
};

export const rememberInsertions = (
  value: Value,
  counts: NodesPerIncarnation
): Insertions => {
  const insertions = { counts, roots: contentRootsOf(value) };

  INSERTIONS.set(value.children, insertions);

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

    if (!facts.contexts.has(record.ctx)) records.push(record);
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
  const verdicts = facts.verdicts.get(key);

  if (!verdicts) return 'pending';
  if (verdicts.has('accept')) return 'accept';

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

  return facts.verdicts.size === 0 &&
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

  return facts.verdicts.size === 0
    ? claims
    : claims.filter((mark) => outcomeOf(facts, mark) !== 'reject');
};

export const isAccepted = (facts: ReviewFacts, mark: AuthoredMark) =>
  isEditingChange(mark.change) ||
  (facts.verdicts.size > 0 && outcomeOf(facts, mark) === 'accept');

export const isSettledDeletion = (node: unknown, facts: ReviewFacts) =>
  readAuthoredMarks(node).some(
    (mark) => mark.kind === 'delete' && isAccepted(facts, mark)
  );
