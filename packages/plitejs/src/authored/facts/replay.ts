import {
  attachV4Steps,
  createInternalDocumentChange,
  type DocumentChange,
  getAttachedV4Steps,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getV4Steps,
  isUnboundV4DocumentChange,
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
  isElementNode,
  type JsonEditorValue,
  type JsonNode,
  type JsonToken,
  openToken,
  PreparedTokenSlice,
  tokenLength,
} from '../../core/change/tokens';
import {
  canonicalJsonKey,
  type PropertyModification,
} from '../../core/change/transform';
import { extractV4Between } from '../../core/change/v4/extract';
import type { V4PropDelta, V4Step } from '../../core/change/v4/types';
import {
  getRecordEntries,
  getRecordIds,
  getValueRecords,
  NO_RECORD_OPS,
  recordStoreToJson,
} from '../../core/record-store';
import {
  type CompiledEditorSchema,
  schemaSetValuedResolver,
} from '../../core/schema-compiler';
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
  isAuthoredSetValued,
  isKeyedSplit,
  isSplitEnd,
  type ReserveMember,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from '../tree/marks';
import { type SpareWrites, spareWritesChange } from '../tree/reserves';
import { sparesIn } from '../tree/spares';
import { settleAuthoredValue } from './admission';
import { isEditingChange } from './editing';
import { contentRootsOf, factsOf, type ReviewFacts } from './facts';
import {
  CONTEXTS,
  incarnationOf,
  LANDED,
  parseContext,
  parseReserve,
  parseVerdict,
  RESERVES,
  splitLinkOf,
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

const liveSplitsIn = (nodes: readonly JsonNode[]): ReadonlySet<string> => {
  const splits = new Set<string>();
  const visit = (node: JsonNode) => {
    if (typeof node.text === 'string') return;
    for (const mark of readAuthoredMarks(node)) {
      if (isKeyedSplit(mark)) splits.add(splitLinkOf(mark));
    }
    node.children?.forEach(visit);
  };

  nodes.forEach(visit);

  return splits;
};

const withoutDecidedEndsIn = (
  node: JsonNode,
  facts: ReviewFacts,
  liveSplits: ReadonlySet<string>
): Readonly<Record<string, unknown>> => {
  const members = readMembers(node);
  const kept =
    members.length === 0
      ? members
      : members.filter((member) => {
          if (!isSplitEnd(member)) return true;

          const incarnation = incarnationOf(member);

          return (
            !isEditingChange(member.change) &&
            (!facts.hasVerdict(incarnation) ||
              (!facts.hasVerdict(incarnation, 'accept') &&
                liveSplits.has(splitLinkOf(member))))
          );
        });
  const children = node.children?.map((child) =>
    typeof child.text === 'string'
      ? child
      : withoutDecidedEndsIn(child, facts, liveSplits)
  );
  const membersChanged = kept.length < members.length;
  const childrenChanged =
    children !== undefined &&
    children.some((child, index) => child !== node.children?.[index]);

  if (!membersChanged && !childrenChanged) return node;

  const next = membersChanged ? withMembers(node, kept) : node;

  return childrenChanged ? { ...next, children } : next;
};

/**
 * Whether a structure decision's plain rebase `rebased` lands on the same
 * document as replaying the decision at the head (`decided`), ignoring split
 * `end` markers whose split already holds a verdict and no longer stands, which
 * editor settlement drops on commit.
 */
export const sameSettledStructure = (
  rebased: JsonEditorValue,
  decided: JsonEditorValue
) => {
  if (sameDocument(rebased, decided)) return true;

  const facts = factsOf(rebased);

  if (!facts.hasVerdicts) return false;

  const strip = (nodes: readonly JsonNode[]) => {
    const liveSplits = liveSplitsIn(nodes);

    return nodes.map((node) => withoutDecidedEndsIn(node, facts, liveSplits));
  };
  const roots = rebased.roots
    ? Object.fromEntries(
        Object.entries(rebased.roots).map(([root, nodes]) => [
          root,
          strip(nodes),
        ])
      )
    : {};

  return jsonEqual(
    {
      children: strip(rebased.children),
      records: recordStoreToJson(getValueRecords(rebased)),
      roots,
    },
    documentOf(decided)
  );
};

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

export const holdsAuthoredRecords = (value: JsonEditorValue) => {
  const store = getValueRecords(value);

  return [...AUTHORED_RECORD_SETS].some(
    (set) => !getRecordEntries(store, set).next().done
  );
};

const nodeWritesAuthoredMarks = (node: JsonNode): boolean => {
  if (readMembers(node).length > 0) return true;

  return isElementNode(node) && node.children.some(nodeWritesAuthoredMarks);
};

const propDeltaWritesAuthoredMarks = (delta: V4PropDelta): boolean => {
  const added = delta.add?.[AUTHORED_MARKS_KEY];

  if (added && added.length > 0) return true;
  if (delta.set && Object.hasOwn(delta.set, AUTHORED_MARKS_KEY)) {
    return (
      readMembers({ [AUTHORED_MARKS_KEY]: delta.set[AUTHORED_MARKS_KEY] })
        .length > 0
    );
  }

  return false;
};

const v4StepsWriteAuthoredMarks = (steps: readonly V4Step[]): boolean =>
  steps.some((step) => {
    switch (step.op) {
      case 'insert_text': {
        return step.marks !== undefined && readMembers(step.marks).length > 0;
      }
      case 'format_text':
      case 'set_props': {
        return propDeltaWritesAuthoredMarks(step);
      }
      case 'insert_node':
      case 'wrap_inline': {
        return nodeWritesAuthoredMarks(step.node);
      }
      case 'split_node': {
        return step.props !== undefined && readMembers(step.props).length > 0;
      }
      default: {
        return false;
      }
    }
  });

export const writesAuthored = (change: DocumentChange) => {
  if (
    [...getInternalDocumentChangeRecords(change).keys()].some((set) =>
      AUTHORED_RECORD_SETS.has(set)
    )
  ) {
    return true;
  }

  if (isUnboundV4DocumentChange(change)) {
    const steps = getV4Steps(change);

    if (steps !== null) return v4StepsWriteAuthoredMarks(steps);
  }

  return [...getInternalDocumentChangeEntries(change)].some(([, rootChange]) =>
    writesMarks(rootChange.toJSON())
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
  const result = settled
    ? {
        ...decided,
        built: mappedBuiltSpans(decided.built, settled),
        change: decided.change.compose(settled),
        value: settled.apply(decided.value),
      }
    : decided;

  if (!result.change.empty && getAttachedV4Steps(result.change) === null) {
    try {
      attachV4Steps(
        result.change,
        extractV4Between(value, result.value, {
          isSetValued: schemaSetValuedResolver(schema),
        })
      );
    } catch {
      // ignore
    }
  }

  return result;
};

export const replayAt = (
  { after, before }: Pick<AuthoredStep, 'after' | 'before'>,
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

const membersWithin = (node: unknown): readonly AuthoredMember[] => {
  const { children } = node as { children?: unknown };

  return [
    ...readMembers(node),
    ...(Array.isArray(children) ? children.flatMap(membersWithin) : []),
  ];
};

export const contentMembersOf = (document: JsonEditorValue) =>
  [...contentRootsOf(document).values()].flatMap((nodes) =>
    nodes.slice().flatMap(membersWithin)
  );

export const claimBasesIn = (document: JsonEditorValue) => {
  const store = getValueRecords(document);

  return [
    ...contentMembersOf(document).flatMap((member) =>
      'author' in member ? [member] : []
    ),
    ...[...getRecordEntries(store, CONTEXTS)].flatMap(
      ([ctx, json]) => parseContext(ctx, json)?.member ?? []
    ),
    ...[...getRecordEntries(store, RESERVES)].flatMap(
      ([id, json]) => parseReserve(id, json) ?? []
    ),
  ];
};

// Rejecting an own change that still holds a claim in the result would
// delete its other letters too, so a withdrawal rejects only the ones the
// batch removes whole.
const changeHeldBy = (member: AuthoredMember) =>
  'author' in member && member.kind !== 'reserve' && member.kind !== 'end'
    ? [member.change]
    : [];

const changesHeldIn = (document: JsonEditorValue) => {
  const members = contentMembersOf(document);
  const liveContexts = new Set(
    members.flatMap((member) => ('ctx' in member ? [member.ctx] : []))
  );
  const store = getValueRecords(document);

  return new Set([
    ...members.flatMap(changeHeldBy),
    ...[...getRecordEntries(store, CONTEXTS)].flatMap(([ctx, json]) =>
      liveContexts.has(ctx)
        ? (parseContext(ctx, json)?.member.change ?? [])
        : []
    ),
  ]);
};

export const ownChangesRemovedBy = (
  { after, before }: Pick<AuthoredStep, 'after' | 'before'>,
  actor: string
): readonly string[] => {
  const kept = changesHeldIn(after);

  return [
    ...new Set(
      claimBasesIn(before).flatMap(({ author, change }) =>
        author === actor && !isEditingChange(change) && !kept.has(change)
          ? [change]
          : []
      )
    ),
  ];
};

export const replaysWithdrawal = (
  step: Pick<AuthoredStep, 'after' | 'before'>,
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

  const result =
    containers.length === 0
      ? kept
      : kept.compose(
          spareWritesChange({ containers, records: NO_RECORD_OPS }, indexes)
            .change,
          head
        );

  if (!result.empty && getAttachedV4Steps(result) === null) {
    try {
      attachV4Steps(
        result,
        extractV4Between(head, result.apply(head), {
          isSetValued: isAuthoredSetValued,
        })
      );
    } catch {
      // ignore
    }
  }

  return result;
};

const isBookkeepingMember = (member: AuthoredMember) =>
  member.kind === 'reserve' || member.kind === 'as';

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

  if (
    jsonEqual(was.filter(isBookkeepingMember), now.filter(isBookkeepingMember))
  ) {
    return modifications;
  }

  const keptWas = was.filter((member) => !isBookkeepingMember(member));
  const keptNow = now.filter((member) => !isBookkeepingMember(member));
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
