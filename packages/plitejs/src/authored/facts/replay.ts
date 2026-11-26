import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  mapInternalDocumentChangePosition,
  valueRootIndex,
  withDocumentChangeRecords,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  addSection,
  applyPropertyModifications,
  RootChange,
  type RootChangeJson,
  type SectionData,
  SectionIterator,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonToken,
  openToken,
  PreparedTokenSlice,
  tokenLength,
} from '../../core/change/tokens';
import {
  canonicalJsonKey,
  type PropertyModification,
} from '../../core/change/transform';
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
import type { SyncJudgeView } from '../../sync/server/grant';
import { decisionReadOf, isStructureMark, type Occurrence } from '../changes';
import {
  type BuiltSpans,
  type Decided,
  type DecisionRequest,
  type DecisionSite,
  decide,
  storedDecisionSiteOf,
} from '../decision';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMember,
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

const mappedBuiltSpans = (
  built: BuiltSpans,
  settled: DocumentChange
): BuiltSpans =>
  built.size === 0
    ? built
    : new Map(
        [...built].flatMap(([root, spans]) => {
          const next = spans.flatMap(([from, to]) => {
            const start = mapInternalDocumentChangePosition(
              settled,
              root,
              from,
              1,
              'after'
            );
            const end = mapInternalDocumentChangePosition(
              settled,
              root,
              to,
              -1,
              'after'
            );

            return start !== null && end !== null && start < end
              ? [[start, end] as const]
              : [];
          });

          return next.length > 0 ? [[root, next] as const] : [];
        })
      );

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
        built: mappedBuiltSpans(decided.built, settled),
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

const isReserveMember = (member: AuthoredMember) => member.kind === 'reserve';

const withoutSpareMods = (
  modifications: readonly PropertyModification[],
  beforeIndex: DocumentIndex,
  beforePos: number
): readonly PropertyModification[] => {
  const first = modifications.findIndex(
    (mod) => mod.key === AUTHORED_MARKS_KEY
  );

  if (first === -1) return modifications;

  const entry = beforeIndex.nodeStartingAt(beforePos);

  if (!entry || entry.from !== beforePos || entry.kind !== 'element') {
    return modifications;
  }

  const was = readMembers(beforeIndex.node(entry.path));
  const authoredMods = modifications.filter(
    (mod) => mod.key === AUTHORED_MARKS_KEY
  );
  const now = readMembers(
    applyPropertyModifications(
      was.length > 0 ? { [AUTHORED_MARKS_KEY]: was } : {},
      authoredMods
    )
  );

  if (jsonEqual(was.filter(isReserveMember), now.filter(isReserveMember))) {
    return modifications;
  }

  const keptWas = was.filter((member) => !isReserveMember(member));
  const keptNow = now.filter((member) => !isReserveMember(member));
  const removed = keptWas.filter(
    (member) => !keptNow.some((kept) => jsonEqual(member, kept))
  );
  const added = keptNow.filter(
    (member) => !keptWas.some((prior) => jsonEqual(prior, member))
  );
  const others = modifications.filter((mod) => mod.key !== AUTHORED_MARKS_KEY);

  return [
    ...others.slice(0, first),
    ...(removed.length > 0
      ? [{ key: AUTHORED_MARKS_KEY, type: 'remove' as const, values: removed }]
      : []),
    ...(added.length > 0
      ? [{ key: AUTHORED_MARKS_KEY, type: 'add' as const, values: added }]
      : []),
    ...others.slice(first),
  ];
};

const withoutBuiltMarks = (
  slice: PreparedTokenSlice,
  afterPos: number,
  spans: ReadonlyArray<readonly [number, number]> | undefined
): PreparedTokenSlice => {
  if (!spans?.length || slice.tokens.length === 0) return slice;

  let changed = false;
  let offset = afterPos;
  const tokens = slice.tokens.map((token: JsonToken): JsonToken => {
    const at = offset;

    offset += tokenLength(token);
    if (
      token.kind !== 'open' ||
      !(AUTHORED_MARKS_KEY in token.props) ||
      !spans.some(([from, to]) => at >= from && at < to)
    ) {
      return token;
    }
    changed = true;

    const { [AUTHORED_MARKS_KEY]: _authored, ...rest } = token.props;

    return openToken(token.nodeKind, rest);
  });

  return changed ? PreparedTokenSlice.fromTokens(tokens) : slice;
};

export const withoutDecisionBookkeeping = (
  change: DocumentChange,
  before: JsonEditorValue,
  built: BuiltSpans
): DocumentChange => {
  const entries = new Map<string, RootChange>();

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const beforeIndex = valueRootIndex(before, root);
    const spans = built.get(root);
    const sections: number[] = [];
    const data: SectionData[] = [];
    let beforePos = 0;
    let afterPos = 0;
    const it = new SectionIterator(rootChange.sections, rootChange.data);

    while (!it.done) {
      if (it.modifications) {
        const next = withoutSpareMods(it.modifications, beforeIndex, beforePos);

        addSection(
          sections,
          data,
          it.length,
          next.length === 0 ? -1 : -2,
          next.length === 0 ? null : next
        );
      } else if (it.keep) {
        addSection(sections, data, it.length, -1, null);
      } else {
        const slice = withoutBuiltMarks(it.slice, afterPos, spans);

        addSection(sections, data, it.length, slice.length, slice);
      }
      beforePos += it.length;
      afterPos += it.outputLength;
      it.next();
    }

    const rebuilt = RootChange.fromSections(sections, data);

    if (!rebuilt.empty) entries.set(root, rebuilt);
  }

  const records = getInternalDocumentChangeRecords(change);

  return withDocumentChangeRecords(
    createInternalDocumentChange(entries, {
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
    }),
    records.has(RESERVES)
      ? new Map([...records].filter(([set]) => set !== RESERVES))
      : records
  );
};

export const decisionJudgeView = (
  step: AuthoredStep,
  ownBuilt: BuiltSpans,
  head: JsonEditorValue,
  merged: DocumentChange,
  mergedBuilt: BuiltSpans
): SyncJudgeView => ({
  merged: withoutDecisionBookkeeping(merged, head, mergedBuilt),
  own: withoutDecisionBookkeeping(step.change, step.before, ownBuilt),
});
