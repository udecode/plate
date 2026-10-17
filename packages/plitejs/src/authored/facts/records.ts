import { copyFields } from '../../core/change/lazy-root';
import { canonicalJsonKey } from '../../core/change/transform';
import { definePlugin } from '../../core/plugin';
import {
  canonicalRecordJson,
  NO_RECORD_OPS,
  type RecordOps,
  type RecordStore,
  withValueRecords,
} from '../../core/record-store';
import { hashSchemaIdentityString } from '../../core/schema-compiler';
import type { MarkBase } from '../tree/marks';

export const CONTEXTS = 'authored-contexts';
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
 * The record sets that hold review contexts and verdicts. `authored()`
 * depends on it, so a host that mirrors plugin dependencies, such as Plate,
 * names it.
 */
export const authoredRecords = definePlugin('authored-records', {
  schema: {
    records: { [CONTEXTS]: { history: 'retain' }, [VERDICTS]: {} },
  },
});
