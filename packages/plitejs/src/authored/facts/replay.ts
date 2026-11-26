import {
  type DocumentChange,
  getInternalDocumentChangeRecords,
  mapInternalDocumentChangePosition,
  withDocumentChangeRecords,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import type { RootChangeJson } from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { canonicalJsonKey } from '../../core/change/transform';
import {
  getRecordIds,
  getValueRecords,
  NO_RECORD_OPS,
  recordStoreToJson,
} from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import {
  documentRootsOf,
  rootChildrenOf,
  visitElements,
} from '../../core/unique-values';
import type { EditorDocumentValue } from '../../interfaces/editor';
import { decisionReadOf, isStructureMark, type Occurrence } from '../changes';
import {
  type Decided,
  type DecisionRequest,
  type DecisionSite,
  decide,
  storedDecisionSiteOf,
} from '../decision';
import {
  AUTHORED_MARKS_KEY,
  type ReserveMember,
  readMembers,
} from '../tree/marks';
import { type SpareWrites, spareWritesChange } from '../tree/reserves';
import { sparesIn } from '../tree/spares';
import { settleAuthoredValue } from './admission';
import { isEditingChange } from './editing';
import {
  CONTEXTS,
  incarnationOf,
  LANDED,
  parseVerdict,
  RESERVES,
  type Verdict,
  VERDICTS,
} from './records';
import type { AuthoredStep } from './writes';

export type VerdictBatch = Readonly<{
  actions: ReadonlyMap<string, Verdict>;
  token: string;
}>;

export type VerdictDrops = Readonly<{ drops: readonly [string, ...string[]] }>;

type DecidedValue = Extract<Decided, Readonly<{ status: 'decided' }>>;

export type Replay = Readonly<{
  decided: DecidedValue;
  request: DecisionRequest;
  site: DecisionSite;
}>;

const documentOf = (value: JsonEditorValue) => ({
  children: value.children,
  records: recordStoreToJson(getValueRecords(value)),
  roots: value.roots ?? {},
});

export const sameDocument = (left: JsonEditorValue, right: JsonEditorValue) =>
  jsonEqual(documentOf(left), documentOf(right));

const AUTHORED_RECORD_SETS = new Set([CONTEXTS, LANDED, RESERVES, VERDICTS]);

const writesMarks = (ops: RootChangeJson) =>
  ops.some(
    ({ properties, replacement = [] }) =>
      replacement.some(
        (token) => token.kind === 'open' && readMembers(token.props).length > 0
      ) ||
      (properties?.operations ?? []).some(
        (operation) =>
          operation.key === AUTHORED_MARKS_KEY &&
          (operation.type === 'add'
            ? operation.values.length > 0
            : operation.type === 'set' &&
              readMembers({ [AUTHORED_MARKS_KEY]: operation.value }).length > 0)
      )
  );

export const writesAuthored = (change: DocumentChange) => {
  const { primary, roots = {} } = change.toJSON();

  return (
    [...getInternalDocumentChangeRecords(change).keys()].some((set) =>
      AUTHORED_RECORD_SETS.has(set)
    ) || [primary ?? [], ...Object.values(roots)].some(writesMarks)
  );
};

/**
 * `null` when the batch writes no verdict record, and the ids it drops when it
 * only drops them, as an undo does. `'unreadable'` when it both puts and drops
 * them, or names an Editing change, two tokens or two verdicts on one change.
 */
export const verdictBatchOf = (
  change: DocumentChange
): VerdictBatch | VerdictDrops | 'unreadable' | null => {
  const ops = getInternalDocumentChangeRecords(change).get(VERDICTS);

  if (!ops || ops.size === 0) return null;

  const [first, ...rest] = [...ops].flatMap(([id, json]) =>
    json === null ? [id] : []
  );

  if (first !== undefined) {
    return rest.length + 1 === ops.size
      ? { drops: [first, ...rest] }
      : 'unreadable';
  }

  const actions = new Map<string, Verdict>();
  const tokens = new Set<string>();

  for (const [id, json] of ops) {
    const record = json === null ? null : parseVerdict(id, json);
    const { change: decided } = record?.member ?? {};

    if (
      !record ||
      decided === undefined ||
      isEditingChange(decided) ||
      (actions.get(decided) ?? record.verdict) !== record.verdict
    ) {
      return 'unreadable';
    }
    actions.set(decided, record.verdict);
    tokens.add(record.decision);
  }

  const [token] = tokens;

  return tokens.size === 1 ? { actions, token } : 'unreadable';
};

const decides = (
  value: JsonEditorValue,
  request: DecisionRequest,
  site: DecisionSite,
  schema: CompiledEditorSchema
): DecidedValue | null => {
  const decided = decide(value, request, site);

  if (decided.status !== 'decided') return null;

  const settled = settleAuthoredValue(
    decided.value as EditorDocumentValue,
    schema,
    null
  );

  return settled
    ? {
        ...decided,
        change: decided.change.compose(settled),
        value: settled.apply(decided.value),
      }
    : decided;
};

export const replayAt = (
  { after, before }: AuthoredStep,
  requests: readonly DecisionRequest[],
  site: DecisionSite,
  schema: CompiledEditorSchema
): Replay | null => {
  for (const request of requests) {
    const decided = decides(before, request, site, schema);

    if (decided && sameDocument(decided.value, after)) {
      return { decided, request, site };
    }
  }

  return null;
};

const incarnationsOf = (list: readonly Occurrence[]) =>
  [...new Set(list.map(({ mark }) => incarnationOf(mark)))].sort();

const readsAlike = (was: readonly Occurrence[], now: readonly Occurrence[]) =>
  jsonEqual(incarnationsOf(was), incarnationsOf(now)) &&
  (was.length === 0 || decisionReadOf(was) === decisionReadOf(now));

export const decideAtHead = (
  { request, site }: Replay,
  head: JsonEditorValue,
  schema: CompiledEditorSchema
): DecidedValue | null => {
  const at = storedDecisionSiteOf(schema, head);

  return [...request.actions.keys()].every((id) =>
    readsAlike(site.book.occurrences(id), at.book.occurrences(id))
  )
    ? decides(head, request, at, schema)
    : null;
};

export const decidesStructure = ({ request, site }: Replay) =>
  [...request.actions.keys()].some((id) =>
    site.book.occurrences(id).some(({ mark }) => isStructureMark(mark))
  );

export const replaysWithdrawal = (
  step: AuthoredStep,
  changes: readonly string[],
  schema: CompiledEditorSchema
) => {
  const replay = replayAt(
    step,
    [
      {
        actions: new Map(changes.map((change) => [change, 'reject'] as const)),
        token: () => '',
        withdraws: true,
      },
    ],
    storedDecisionSiteOf(schema, step.before),
    schema
  );

  return replay && replay.decided.verdicts.length === 0 ? replay.decided : null;
};

const spareKeyOf = ({ built: _built, ...spare }: ReserveMember) =>
  canonicalJsonKey(spare);

const childrenAt = (value: JsonEditorValue, root: string) =>
  rootChildrenOf(value as EditorDocumentValue, root);

export const keepingGapSpares = (
  change: DocumentChange,
  base: JsonEditorValue,
  gap: readonly DocumentChange[],
  head: JsonEditorValue
) => {
  const storedAtBase = new Set(getRecordIds(getValueRecords(base), RESERVES));
  const records = getInternalDocumentChangeRecords(change);
  const drops = records.get(RESERVES);
  const keptDrop = ([id, json]: readonly [string, string | null]) =>
    json !== null || storedAtBase.has(id);
  const kept =
    drops && ![...drops].every(keptDrop)
      ? withDocumentChangeRecords(
          change,
          new Map([
            ...records,
            [RESERVES, new Map([...drops].filter(keptDrop))],
          ])
        )
      : change;
  const decided = kept.apply(head);
  const containers: Array<SpareWrites['containers'][number]> = [];
  const indexes = new Map<string, DocumentIndex>();

  for (const root of documentRootsOf(head as EditorDocumentValue)) {
    const holders: Array<
      Readonly<{ path: readonly number[]; spares: readonly ReserveMember[] }>
    > = [];

    visitElements(childrenAt(head, root), (node, path) => {
      const spares = sparesIn(node);

      if (spares.length > 0) holders.push({ path, spares });
    });
    if (holders.length === 0) continue;

    const baseIndex = DocumentIndex.fromValue(childrenAt(base, root));
    const seenAt = new Map<number, ReadonlySet<string>>();

    visitElements(childrenAt(base, root), (node, path) => {
      const spares = sparesIn(node);

      if (spares.length === 0) return;

      let at: number | null = baseIndex.nodeRange(path).from;

      for (const entry of gap) {
        at = mapInternalDocumentChangePosition(entry, root, at, 1, 'after');
        if (at === null) return;
      }
      seenAt.set(at, new Set(spares.map(spareKeyOf)));
    });

    const headIndex = DocumentIndex.fromValue(childrenAt(head, root));
    const index = DocumentIndex.fromValue(childrenAt(decided, root));

    for (const { path, spares } of holders) {
      const { from } = headIndex.nodeRange(path);
      const seen = seenAt.get(from);
      const added = spares.filter((spare) => !seen?.has(spareKeyOf(spare)));

      if (added.length === 0) continue;

      const to = mapInternalDocumentChangePosition(
        kept,
        root,
        from,
        1,
        'after'
      );
      const holder = to === null ? null : index.nodeStartingAt(to);

      if (!holder || holder.from !== to || holder.kind !== 'element') continue;

      const has = new Set(sparesIn(index.node(holder.path)).map(spareKeyOf));
      const missing = added.filter((spare) => !has.has(spareKeyOf(spare)));

      if (missing.length > 0) {
        containers.push({
          added: missing,
          path: holder.path,
          replaced: [],
          root,
        });
      }
    }
    indexes.set(root, index);
  }

  return containers.length === 0
    ? kept
    : kept.compose(
        spareWritesChange({ containers, records: NO_RECORD_OPS }, indexes)
          .change,
        head
      );
};
