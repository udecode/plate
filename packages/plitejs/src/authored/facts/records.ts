import { copyFields } from '../../core/change/lazy-root';
import { canonicalJsonKey } from '../../core/change/transform';
import type { ConstructionSlot } from '../../core/content-completion';
import { definePlugin } from '../../core/plugin';
import {
  canonicalRecordJson,
  getRecordEntries,
  NO_RECORD_OPS,
  type RecordOps,
  type RecordStore,
  withValueRecords,
} from '../../core/record-store';
import { hashSchemaIdentityString } from '../../core/schema-compiler';
import type { Element } from '../../interfaces/element';
import { isReserveNode, isReserveSlot, type MarkBase } from '../tree/marks';

export const CONTEXTS = 'authored-contexts';
export const LANDED = 'authored-landed';
export const RESERVES = 'authored-reserves';
export const VERDICTS = 'authored-verdicts';

/**
 * One incarnation's key, the JSON text of its change and its `inc`, or of its
 * change and its time when it has no `inc`. JSON keeps an `inc` apart from a
 * time and one change's key from another's.
 */
export const incarnationOf = ({
  at,
  change,
  inc,
}: Pick<MarkBase, 'at' | 'change' | 'inc'>) =>
  JSON.stringify(inc === undefined ? [change, at] : [change, inc]);

/** Immutable: rests on the members of `base`, then on `member`. */
export type ContextRecord = Readonly<{
  base: string | null;
  ctx: string;
  member: MarkBase;
}>;

export type Verdict = 'accept' | 'reject';

export type VerdictRecord = Readonly<{
  /** A token minted per decision, so two peers' decisions get two keys. */
  decision: string;
  member: Pick<MarkBase, 'at' | 'change' | 'inc'>;
  verdict: Verdict;
}>;

/**
 * A format write that stands after its tags leave the key: an Editing write
 * over pending tags, or a Suggesting write a decision accepted and removed.
 * It counts only while its member is accepted, so undoing a decision voids it.
 */
export type LandedRecord = Readonly<{
  member: Pick<MarkBase, 'at' | 'change' | 'inc'>;
  write: string;
}>;

export const landedOf = ({
  at,
  change,
  id,
  inc,
}: Pick<MarkBase, 'at' | 'change' | 'inc'> & { id: string }): LandedRecord =>
  Object.freeze({
    member: Object.freeze(
      inc === undefined ? { at, change } : { at, change, inc }
    ),
    write: id,
  });

export const memberOf = ({ at, author, change, inc }: MarkBase): MarkBase =>
  Object.freeze(
    inc === undefined ? { at, author, change } : { at, author, change, inc }
  );

/** A context's id hashes its content, so peers that mint one agree on it. */
export const contextIdOf = (base: string | null, member: MarkBase) =>
  `c:${hashSchemaIdentityString(canonicalJsonKey({ base, member: memberOf(member) }))}`;

export const contextRecordOf = (
  base: string | null,
  member: MarkBase
): ContextRecord =>
  Object.freeze({
    base,
    ctx: contextIdOf(base, member),
    member: memberOf(member),
  });

// A verdict's id is the JSON text of `["v", change, inc, at, verdict,
// decision]`, with `at` null when `inc` names the incarnation, so the text
// before its verdict names its incarnation and a prefix probe finds every
// verdict on one incarnation or one change.
const verdictPrefixOf = (
  change: string,
  inc: string | null,
  at: number | null
) => `${JSON.stringify(['v', change, inc, at]).slice(0, -1)},`;

export const verdictIdOf = ({ decision, member, verdict }: VerdictRecord) =>
  `${verdictPrefixOf(
    member.change,
    member.inc ?? null,
    member.inc === undefined ? member.at : null
  )}${JSON.stringify(verdict)},${JSON.stringify(decision)}]`;

export const verdictIncarnationOf = (id: string) => {
  const [, change, inc, at] = JSON.parse(id) as [
    string,
    string,
    string | null,
    number | null,
  ];

  return incarnationOf({
    at: at ?? 0,
    change,
    ...(inc === null ? {} : { inc }),
  });
};

export const verdictIncarnationsOf = (ids: Iterable<string>) => [
  ...new Set([...ids].map(verdictIncarnationOf)),
];

/** The id prefix of the verdicts on `incarnation`, or of one verdict on it. */
export const verdictProbeOf = (incarnation: string, verdict?: Verdict) => {
  const [change, which] = JSON.parse(incarnation) as [string, number | string];
  const prefix =
    typeof which === 'string'
      ? verdictPrefixOf(change, which, null)
      : verdictPrefixOf(change, null, which);

  return verdict === undefined
    ? prefix
    : `${prefix}${JSON.stringify(verdict)},`;
};

/** The id prefix of every verdict on any incarnation of `change`. */
export const changeVerdictProbeOf = (change: string) =>
  `["v",${JSON.stringify(change)},`;

const isRecordNode = (
  value: unknown
): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const parseMember = (node: unknown): MarkBase | null => {
  if (!isRecordNode(node)) return null;

  const { at, author, change, inc } = node;

  return typeof at === 'number' &&
    Number.isFinite(at) &&
    isText(author) &&
    isText(change) &&
    (inc === undefined || isText(inc))
    ? memberOf({ at, author, change, ...(inc === undefined ? {} : { inc }) })
    : null;
};

/** A stored context, whose id is its content hash. */
export const parseContext = (
  ctx: string,
  json: string
): ContextRecord | null => {
  const node: unknown = JSON.parse(json);

  if (!isRecordNode(node)) return null;

  const member = parseMember(node.member);
  const { base } = node;

  return member && (base === undefined || isText(base))
    ? Object.freeze({ base: base ?? null, ctx, member })
    : null;
};

/** A stored verdict, refused unless its id names its content. */
export const parseVerdict = (
  id: string,
  json: string
): VerdictRecord | null => {
  const node: unknown = JSON.parse(json);

  if (!isRecordNode(node)) return null;

  const { at, change, decision, inc, verdict } = node;

  if (
    typeof at !== 'number' ||
    !Number.isFinite(at) ||
    !isText(change) ||
    !isText(decision) ||
    (inc !== undefined && !isText(inc)) ||
    (verdict !== 'accept' && verdict !== 'reject')
  ) {
    return null;
  }

  const record: VerdictRecord = Object.freeze({
    decision,
    member: Object.freeze({
      at,
      change,
      ...(inc === undefined ? {} : { inc }),
    }),
    verdict,
  });

  return verdictIdOf(record) === id ? record : null;
};

/** A spare block of a root's own content, as a container member holds one. */
export type ReserveRecord = MarkBase &
  Readonly<{
    built?: true;
    node: Element;
    root: string;
    slot: ConstructionSlot;
  }>;

/**
 * The JSON text of `[root, change, inc, slot]`, with `p<index>` or
 * `m<ordinal>` naming the slot. A built spare's id adds the hash of its
 * node, so a later write's spare for the same slot under the same change
 * gets an id of its own.
 */
export const reserveIdOf = ({
  built,
  change,
  inc,
  node,
  root,
  slot,
}: Pick<
  ReserveRecord,
  'built' | 'change' | 'inc' | 'node' | 'root' | 'slot'
>) =>
  JSON.stringify([
    root,
    change,
    inc ?? null,
    'prefix' in slot ? `p${slot.prefix}` : `m${slot.min}`,
    ...(built ? [`b:${hashSchemaIdentityString(canonicalJsonKey(node))}`] : []),
  ]);

export const reserveRootOf = (id: string) => (JSON.parse(id) as [string])[0];

const RESERVE_FIELDS: ReadonlySet<string> = new Set([
  'at',
  'author',
  'built',
  'change',
  'inc',
  'node',
  'root',
  'slot',
]);

/** A stored spare, refused unless its id names its root, change and slot. */
export const parseReserve = (
  id: string,
  json: string
): ReserveRecord | null => {
  const node: unknown = JSON.parse(json);

  if (!isRecordNode(node)) return null;

  const { at, author, built, change, inc, root, slot } = node;

  if (
    typeof at !== 'number' ||
    !Number.isFinite(at) ||
    !isText(author) ||
    !isText(change) ||
    (inc !== undefined && !isText(inc)) ||
    (built !== undefined && built !== true) ||
    !isText(root) ||
    !isReserveSlot(slot) ||
    !isReserveNode(node.node) ||
    !Object.keys(node).every((field) => RESERVE_FIELDS.has(field))
  ) {
    return null;
  }

  const record = node as ReserveRecord;

  return reserveIdOf(record) === id ? record : null;
};

/** The node of every spare `store` holds for a root's own content. */
export const reserveNodesIn = (store: RecordStore): Element[] =>
  [...getRecordEntries(store, RESERVES)].map(
    ([, json]) => (JSON.parse(json) as ReserveRecord).node
  );

/** The node of every spare `store` holds for a root's own content that no build took. */
export const unbuiltReserveNodesIn = (store: RecordStore): Element[] =>
  [...getRecordEntries(store, RESERVES)].flatMap(([, json]) => {
    const record = JSON.parse(json) as ReserveRecord;

    return record.built ? [] : [record.node];
  });

/**
 * The ops that delete every spare record `store` holds for one of `roots`,
 * which a change removes, so no record outlives its root.
 */
export const reserveDropsOf = (
  store: RecordStore,
  roots: ReadonlySet<string>
): RecordOps => {
  if (roots.size === 0) return NO_RECORD_OPS;

  const drops = new Map<string, null>();

  for (const [id, json] of getRecordEntries(store, RESERVES)) {
    if (roots.has((JSON.parse(json) as ReserveRecord).root)) {
      drops.set(id, null);
    }
  }

  return drops.size === 0 ? NO_RECORD_OPS : new Map([[RESERVES, drops]]);
};

export const parseLanded = (
  write: string,
  json: string
): LandedRecord | null => {
  const node: unknown = JSON.parse(json);

  if (!isRecordNode(node)) return null;

  const { at, change, inc } = node;

  return write.length > 0 &&
    typeof at === 'number' &&
    Number.isFinite(at) &&
    isText(change) &&
    (inc === undefined || isText(inc))
    ? landedOf({ at, change, id: write, ...(inc === undefined ? {} : { inc }) })
    : null;
};

export const putLanded = (records: Iterable<LandedRecord>): RecordOps => {
  const writes = new Map<string, string>();

  for (const { member, write } of records) {
    writes.set(write, canonicalRecordJson(member));
  }

  return writes.size === 0 ? NO_RECORD_OPS : new Map([[LANDED, writes]]);
};

/** The puts that store `records` in the contexts set. */
export const putContexts = (records: Iterable<ContextRecord>): RecordOps => {
  const writes = new Map<string, string>();

  for (const { base, ctx, member } of records) {
    writes.set(
      ctx,
      canonicalRecordJson(base === null ? { member } : { base, member })
    );
  }

  return writes.size === 0 ? NO_RECORD_OPS : new Map([[CONTEXTS, writes]]);
};

/** The puts that store `records` in the verdicts set. */
export const putVerdicts = (records: Iterable<VerdictRecord>): RecordOps => {
  const writes = new Map<string, string>();

  for (const record of records) {
    const { decision, member, verdict } = record;

    writes.set(
      verdictIdOf(record),
      canonicalRecordJson({ ...member, decision, verdict })
    );
  }

  return writes.size === 0 ? NO_RECORD_OPS : new Map([[VERDICTS, writes]]);
};

/** `value` with its records replaced by `store`. */
export const withStore = <V extends object>(value: V, store: RecordStore): V =>
  withValueRecords(
    copyFields({}, value as Readonly<Record<string, unknown>>, [
      'records',
    ]) as V,
    store
  );

/**
 * The record sets that hold review contexts, verdicts, landed writes and the
 * spare blocks of a root's own content.
 * `authored()` depends on it, so a host that mirrors plugin dependencies,
 * such as Plate, names it. Undo carries a verdict or a landed write with the
 * commit that stored it.
 */
export const authoredRecords = definePlugin('authored-records', {
  schema: {
    records: {
      [CONTEXTS]: { history: 'retain' },
      [LANDED]: {},
      [RESERVES]: {},
      [VERDICTS]: {},
    },
  },
});
