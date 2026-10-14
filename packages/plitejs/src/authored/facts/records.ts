import { createInternalDocumentChange } from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { RootChange } from '../../core/change/root-change';
import {
  encodeNodes,
  type JsonEditorValue,
  type JsonNode,
} from '../../core/change/tokens';
import { canonicalJsonKey } from '../../core/change/transform';
import { definePlugin } from '../../core/plugin';
import { hashSchemaIdentityString } from '../../core/schema-compiler';
import { property, schema } from '../../core/schema-definition';
import type { MarkBase } from '../tree/marks';

export const CONTEXTS_ROOT = '$authored-contexts';
export const VERDICTS_ROOT = '$authored-verdicts';

const CONTEXT_TYPE = 'authored-context';
const VERDICT_TYPE = 'authored-verdict';

export const incarnationOf = ({
  at,
  change,
  inc,
}: Pick<MarkBase, 'at' | 'change' | 'inc'>) => inc ?? `${change}@${at}`;

/** Immutable: rests on the members of `base`, then on `member`. */
export type ContextRecord = Readonly<{
  base: string | null;
  ctx: string;
  member: MarkBase;
}>;

export type Verdict = 'accept' | 'reject';

export type VerdictRecord = Readonly<{
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

export const contextElementOf = ({ base, ctx, member }: ContextRecord) => ({
  ...member,
  ...(base === null ? {} : { base }),
  children: [{ text: '' }],
  ctx,
  type: CONTEXT_TYPE,
});

export const verdictElementOf = ({ member, verdict }: VerdictRecord) => ({
  at: member.at,
  change: member.change,
  ...(member.inc === undefined ? {} : { inc: member.inc }),
  children: [{ text: '' }],
  type: VERDICT_TYPE,
  verdict,
});

const isRecordNode = (
  value: unknown
): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const parseMember = (
  node: Readonly<Record<string, unknown>>
): MarkBase | null => {
  const { at, author, change, inc } = node;

  return typeof at === 'number' &&
    Number.isFinite(at) &&
    isText(author) &&
    isText(change) &&
    (inc === undefined || isText(inc))
    ? memberOf({ at, author, change, ...(inc === undefined ? {} : { inc }) })
    : null;
};

export const parseContextElement = (node: unknown): ContextRecord | null => {
  if (!isRecordNode(node) || node.type !== CONTEXT_TYPE) return null;

  const member = parseMember(node);
  const { base, ctx } = node;

  return member && isText(ctx) && (base === undefined || isText(base))
    ? Object.freeze({ base: base ?? null, ctx, member })
    : null;
};

export const parseVerdictElement = (node: unknown): VerdictRecord | null => {
  if (!isRecordNode(node) || node.type !== VERDICT_TYPE) return null;

  const { at, change, inc, verdict } = node;

  return typeof at === 'number' &&
    Number.isFinite(at) &&
    isText(change) &&
    (inc === undefined || isText(inc)) &&
    (verdict === 'accept' || verdict === 'reject')
    ? Object.freeze({
        member: Object.freeze({
          at,
          change,
          ...(inc === undefined ? {} : { inc }),
        }),
        verdict,
      })
    : null;
};

const record = schema.content.text({ default: 'text', min: 1 });

/**
 * The roots that hold review contexts and verdicts. `authored()` depends on
 * it, so a host that mirrors plugin dependencies, such as Plate, names it.
 */
export const authoredRecords = definePlugin('authored-records', {
  schema: {
    elements: {
      'authored-context': {
        content: record,
        properties: {
          at: property.number({ required: true }),
          author: property.string({ required: true }),
          base: property.string(),
          change: property.string({ required: true }),
          ctx: property.string({ required: true }),
          inc: property.string(),
        },
      },
      'authored-verdict': {
        content: record,
        properties: {
          at: property.number({ required: true }),
          change: property.string({ required: true }),
          inc: property.string(),
          verdict: property.enum(['accept', 'reject'], { required: true }),
        },
      },
    },
    roots: {
      [CONTEXTS_ROOT]: {
        content: schema.content.type(CONTEXT_TYPE),
        history: 'retain',
      },
      [VERDICTS_ROOT]: schema.content.type(VERDICT_TYPE),
    },
  },
});

export const appendRecords = (
  value: JsonEditorValue,
  root: string,
  records: readonly JsonNode[]
) => {
  if (records.length === 0) return null;

  const existing = value.roots?.[root];
  const index = DocumentIndex.fromValue(existing ?? []);

  return createInternalDocumentChange(
    new Map([
      [
        root,
        RootChange.create(index, {
          from: index.childPosition([], existing?.length ?? 0),
          insert: encodeNodes(records).slice,
        }),
      ],
    ]),
    existing ? {} : { createRoots: [root] }
  );
};

export const carryRecords = (
  before: JsonEditorValue,
  after: JsonEditorValue
) => {
  const records = new Map<string, readonly JsonNode[]>();
  let committed = before;

  for (const root of [CONTEXTS_ROOT, VERDICTS_ROOT]) {
    const stored = before.roots?.[root] ?? [];
    const held = after.roots?.[root] ?? [];

    if (held === stored) continue;

    const keys = new Set(stored.map(canonicalJsonKey));
    const carried = held.filter(
      (record) => !keys.has(canonicalJsonKey(record))
    );

    if (carried.length === 0) continue;
    records.set(root, carried);
    committed = {
      ...committed,
      roots: { ...committed.roots, [root]: [...stored, ...carried] },
    };
  }

  return { committed, records };
};
