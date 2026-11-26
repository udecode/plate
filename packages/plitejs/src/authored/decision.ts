import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentRootChange,
  valueRoot,
  valueRootIndex,
  valueRootNodes,
  withDocumentChangeRecords,
} from '../core/change/document-change';
import type { DocumentIndex, NodeList } from '../core/change/document-index';
import { jsonEqual } from '../core/change/json';
import { copyRoots, setLazyRoot } from '../core/change/lazy-root';
import type { RootChange } from '../core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import {
  createDetachedEditorSchema,
  ElementGenerationMaskedError,
  type InternalEditorSchemaApi,
} from '../core/editor-schema';
import { rootsOwnedOnlyWithin } from '../core/element-owned-root-index';
import {
  deriveValue,
  getValueRecords,
  recordOpsBetween,
} from '../core/record-store';
import { partOf } from '../core/representation';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import { EditorSchemaValidationError } from '../core/schema-validation';
import { countCoreWork } from '../core/work';
import type { EditorDocumentValue } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { blockOccurrencesOf, type Occurrence } from './changes';
import { decisionWindowsOf, type SpareGuard } from './decision-window';
import { factsOf, marksOf, type ReviewFacts } from './facts/facts';
import {
  incarnationOf,
  putVerdicts,
  reserveNodesIn,
  type Verdict,
  type VerdictRecord,
} from './facts/records';
import { type BookView, ChangeBook } from './ledger/book';
import { rootOf } from './ledger/roots';
import { countLedgerWork } from './ledger/work';
import { detachedResolveSchemaOf } from './resolve-schema';
import { decidedContentChange, tokenLength } from './tree/alignment';
import { coverStoredValues } from './tree/holds';
import { type AuthoredMark, AuthoredMarkError } from './tree/marks';
import { completionBuilds, storesSpares } from './tree/reserves';
import {
  type AuthoredResolveSchema,
  completedJoinKeys,
  resolveAuthoredValue,
  resolveAuthoredWindows,
  windowPart,
} from './tree/resolve';

export type DecisionRequest = Readonly<{
  actions: ReadonlyMap<string, Verdict>;
  token: () => string;
  withdraws: boolean;
}>;

export type DecisionSite = Readonly<{
  book: Pick<BookView, 'idsIn' | 'members' | 'occurrences' | 'pendingInOrder'>;
  resolveSchema: AuthoredResolveSchema;
  spares: SpareGuard | null;
}>;

export type WindowedDecision = Readonly<{
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  value: JsonEditorValue;
}>;

export type BuiltSpans = ReadonlyMap<
  string,
  ReadonlyArray<readonly [number, number]>
>;

export type Decided =
  | Readonly<{ status: 'blocked'; with: readonly string[] }>
  | Readonly<{ status: 'invalid' }>
  | Readonly<{
      built: BuiltSpans;
      /** From `value` to the decided value, records included. */
      change: DocumentChange;
      decided: readonly string[];
      status: 'decided';
      value: JsonEditorValue;
      verdicts: readonly VerdictRecord[];
      windowed: WindowedDecision | null;
    }>;

const NO_BUILT_SPANS: BuiltSpans = new Map();

const collectBuiltSpans = (
  nodes: readonly JsonNode[],
  built: ReadonlySet<JsonNode>,
  start: number,
  spans: Array<readonly [number, number]>
) => {
  let offset = start;

  for (const node of nodes) {
    const length = tokenLength(node);

    if (built.has(node)) {
      spans.push([offset, offset + length]);
    } else if (typeof node.text !== 'string') {
      collectBuiltSpans(node.children ?? [], built, offset + 1, spans);
    }
    offset += length;
  }
};

const builtSpansOf = (
  value: JsonEditorValue,
  decided: WindowedDecision | null,
  windowed: ReturnType<typeof resolveAuthoredWindows>,
  whole: ReturnType<typeof resolveAuthoredValue> | null
): BuiltSpans => {
  const unstored = windowed ? windowed.unstored : whole?.unstored;

  if (!unstored || unstored.size === 0) return NO_BUILT_SPANS;

  const byRoot = new Map<string, Array<readonly [number, number]>>();
  const add = (root: string, nodes: readonly JsonNode[], start: number) => {
    const spans = byRoot.get(root) ?? [];

    collectBuiltSpans(nodes, unstored, start, spans);
    if (spans.length > 0) byRoot.set(root, spans);
  };

  if (windowed && decided) {
    for (const { after, from, root } of windowed.windows) {
      const index =
        decided.indexedAfter.get(root) ?? valueRootIndex(value, root);

      add(root, after, index.childPosition([], from));
    }
  } else if (whole) {
    add(MAIN_ROOT_KEY, whole.value.children, 0);
    for (const [root, children] of Object.entries(whole.value.roots ?? {})) {
      add(root, children, 0);
    }
  }

  return byRoot;
};

export const isRefusal = (error: unknown) =>
  error instanceof EditorSchemaValidationError ||
  error instanceof AuthoredMarkError ||
  error instanceof ElementGenerationMaskedError;

const claimIn = (
  blocks: readonly unknown[],
  facts: ReviewFacts,
  change: string
) => {
  const find = (nodes: readonly unknown[]): AuthoredMark | null => {
    for (const node of nodes) {
      const mark = marksOf(node, facts).find((item) => item.change === change);

      if (mark) return mark;

      const nested = find(
        (node as { children?: readonly unknown[] }).children ?? []
      );

      if (nested) return nested;
    }

    return null;
  };

  return find(blocks);
};

export const claimOf = (
  value: EditorDocumentValue | JsonEditorValue,
  change: string
) =>
  claimIn(
    [...value.children, ...Object.values(value.roots ?? {}).flat()],
    factsOf(value),
    change
  );

export const spareGuardOver = (
  compiled: CompiledEditorSchema,
  schema: Pick<InternalEditorSchemaApi, 'getElementContent' | 'getRootContent'>,
  value: JsonEditorValue
): SpareGuard | null =>
  storesSpares(compiled)
    ? {
        stored: reserveNodesIn(getValueRecords(value)).length > 0,
        typeBuildsGenerated: (type) =>
          completionBuilds(compiled, schema.getElementContent(type)),
        windowBuildsGenerated: (window) =>
          completionBuilds(
            compiled,
            partOf(
              schema.getRootContent(window.root, value as EditorDocumentValue),
              windowPart(window)
            ) ?? null
          ),
      }
    : null;

export const storedDecisionSiteOf = (
  schema: CompiledEditorSchema,
  value: JsonEditorValue
): DecisionSite => {
  const detached = createDetachedEditorSchema(
    schema,
    value as EditorDocumentValue
  );

  return {
    book: new ChangeBook((node) => node).sync(value),
    resolveSchema: detachedResolveSchemaOf(schema, detached),
    spares: spareGuardOver(schema, detached, value),
  };
};

const windowedValue = (
  value: JsonEditorValue,
  { records, windows }: NonNullable<ReturnType<typeof resolveAuthoredWindows>>,
  actions: ReadonlyMap<string, Verdict>,
  schema: CompiledEditorSchema
): WindowedDecision => {
  const facts = factsOf(value);
  const changes = new Map<string, RootChange>();

  for (const { after, before, from, root } of windows) {
    const index = valueRootIndex(value, root);
    const local = getInternalDocumentRootChange(
      decidedContentChange(
        { children: before },
        { children: after },
        { facts, outcomes: actions, schema }
      ),
      'main'
    );

    if (local && !local.empty) {
      changes.set(
        root,
        local.embed(index.length, index.childPosition([], from))
      );
    }
  }

  const roots = value.roots && copyRoots({}, value.roots);
  const decided = deriveValue(
    value,
    roots ? { roots: roots as JsonEditorValue['roots'] } : {},
    records
  );

  const indexedAfter = new Map<string, DocumentIndex>();
  const indexedBefore = new Map<string, DocumentIndex>();

  for (const [root, change] of changes) {
    const before = valueRootIndex(value, root);
    const after = change.apply(before);

    indexedBefore.set(root, before);
    indexedAfter.set(root, after);
    if (root === MAIN_ROOT_KEY) setLazyRoot(decided, 'children', after);
    else setLazyRoot(getDefined(roots), root, after);
  }

  return {
    change: createInternalDocumentChange(changes),
    indexedAfter,
    indexedBefore,
    value: decided,
  };
};

const insertionsInDroppedRoots = (
  value: JsonEditorValue,
  decided: JsonEditorValue,
  rootsTaken: () => ReadonlySet<string>
) => {
  const facts = factsOf(value);
  const stranded = new Set<string>();
  const visit = (node: JsonNode, struck: boolean) => {
    const marks = marksOf(node, facts);
    const covered = struck || marks.some((mark) => mark.kind === 'delete');

    if (typeof node.text === 'string') {
      if (covered || node.text === '') return;
      for (const mark of marks) {
        if (mark.kind === 'insert') stranded.add(mark.change);
      }
      return;
    }
    for (const child of node.children ?? []) visit(child, covered);
  };

  for (const [root, children] of Object.entries(value.roots ?? {})) {
    if (Object.hasOwn(decided.roots ?? {}, root) || rootsTaken().has(root)) {
      continue;
    }
    for (const child of children) visit(child, false);
  }

  return stranded;
};

type ReplacedRange = readonly [
  from: number,
  to: number,
  afterFrom: number,
  afterTo: number,
];

const replacedRanges = (
  before: readonly JsonNode[],
  after: readonly JsonNode[],
  resolvedOf: (original: JsonNode) => JsonNode | null
) => {
  const ranges: ReplacedRange[] = [];
  let positions: Map<JsonNode, number> | undefined;
  const leftAlone = (from: number, afterAt: number) => {
    const node = after[afterAt];

    if (before[from] === node) return true;
    positions ??= new Map(
      before.flatMap((original, index) => {
        const resolved = resolvedOf(original);

        return resolved ? [[resolved, index] as const] : [];
      })
    );

    countLedgerWork('pairedBlocks');

    return positions.get(node) === from && jsonEqual(before[from], node);
  };
  let from = 0;
  let afterFrom = 0;

  while (from < before.length || afterFrom < after.length) {
    if (from < before.length && leftAlone(from, afterFrom)) {
      from += 1;
      afterFrom += 1;
      continue;
    }

    let afterTo = afterFrom;
    let to = before.length;

    for (; afterTo < after.length; afterTo += 1) {
      const at = positions?.get(after[afterTo]) ?? -1;

      if (at >= from && leftAlone(at, afterTo)) {
        to = at;
        break;
      }
    }

    ranges.push([from, to, afterFrom, afterTo]);
    from = to;
    afterFrom = afterTo;
  }

  return ranges;
};

type DecidedRun = Readonly<{
  after: readonly JsonNode[];
  before: readonly JsonNode[];
  from: number;
  root: string;
}>;

const decidedRunsOf = (value: JsonEditorValue, decided: JsonEditorValue) => {
  const runs: DecidedRun[] = [];
  const dropped: string[] = [];

  for (const root of ['main', ...Object.keys(value.roots ?? {})]) {
    if (root !== 'main' && !Object.hasOwn(decided.roots ?? {}, root)) {
      dropped.push(root);
    } else {
      runs.push({
        after: valueRoot(decided, root),
        before: valueRoot(value, root),
        from: 0,
        root,
      });
    }
  }

  return { dropped, runs };
};

const remainsAfter = (
  value: JsonEditorValue,
  decided: JsonEditorValue,
  {
    dropped,
    runs,
  }: Readonly<{ dropped: readonly string[]; runs: readonly DecidedRun[] }>,
  book: DecisionSite['book'],
  resolvedIn: (root: string) => ((original: JsonNode) => JsonNode | null) | null
) => {
  const facts = factsOf(decided);
  const replaced = new Map<string, ReplacedRange[]>();
  const kept = new Set<string>();
  const candidates = new Set<string>();

  for (const root of dropped) {
    for (const id of book.idsIn(root, 0, rootOf(value, root).size)) {
      candidates.add(id);
    }
  }
  for (const { after, before, from: offset, root } of runs) {
    const ranges = replacedRanges(
      before,
      after,
      resolvedIn(root) ?? (() => null)
    );
    const shifted = replaced.get(root) ?? [];

    replaced.set(root, shifted);
    for (const [from, to, afterFrom, afterTo] of ranges) {
      countLedgerWork('strandedBlocks', to - from + afterTo - afterFrom);
      for (const id of book.idsIn(root, from + offset, to + offset)) {
        candidates.add(id);
      }
      for (const block of after.slice(afterFrom, afterTo)) {
        for (const id of blockOccurrencesOf(block, (node) =>
          marksOf(node, facts)
        ).occurrences.keys()) {
          kept.add(id);
        }
      }
      shifted.push([from + offset, to + offset, afterFrom, afterTo]);
    }
  }

  const remains = (id: string) =>
    kept.has(id) ||
    book.occurrences(id).some(({ node, path, root }) => {
      const ranges =
        replaced.get(root) ?? (dropped.includes(root) ? undefined : []);

      return (
        ranges !== undefined &&
        !ranges.some(([from, to]) => path[0] >= from && path[0] < to) &&
        marksOf(node, facts).some((mark) => mark.change === id)
      );
    });

  return { candidates, remains };
};

const incarnationsOf = (occurrences: readonly Occurrence[]) =>
  new Map(occurrences.map(({ mark }) => [incarnationOf(mark), mark])).values();

const withVerdicts = (
  value: JsonEditorValue,
  verdicts: readonly VerdictRecord[]
): JsonEditorValue =>
  verdicts.length === 0 ? value : deriveValue(value, {}, putVerdicts(verdicts));

const insideTaken = (
  value: JsonEditorValue,
  root: string,
  path: readonly number[],
  takenWhole: ReadonlySet<unknown>
) => {
  let nodes: Pick<NodeList, 'at'> = valueRootNodes(value, root);

  for (const at of path) {
    const node = nodes.at(at);

    if (!node) return false;
    if (takenWhole.has(node)) return true;
    nodes = node.children ?? [];
  }

  return false;
};

const takenWithoutVerdict = (
  value: JsonEditorValue,
  actions: ReadonlyMap<string, Verdict>,
  takenWhole: ReadonlySet<unknown>,
  ownership: CompiledEditorSchema
) => {
  if (takenWhole.size === 0) return () => false;

  const facts = factsOf(value);
  const removes = (mark: AuthoredMark) => {
    const verdict = actions.get(mark.change);

    return (
      (mark.kind === 'delete' && verdict === 'accept') ||
      (mark.kind === 'insert' && verdict === 'reject')
    );
  };
  const removedByMark = (node: unknown) =>
    takenWhole.has(node) && marksOf(node, facts).some(removes);
  const partsOn = ({ path, root }: Occurrence) => {
    let nodes: Pick<NodeList, 'at'> = valueRootNodes(value, root);
    let taken = false;

    for (const at of path) {
      const node = nodes.at(at);

      if (!node) break;
      if (removedByMark(node)) return { remover: node, taken: true };
      taken ||= takenWhole.has(node);
      nodes = node.children ?? [];
    }

    return { remover: null, taken };
  };
  let goneRoots: ReadonlySet<string> | undefined;

  return (change: string, occurrences: readonly Occurrence[]) =>
    occurrences.length > 0 &&
    occurrences.every((occurrence) => {
      if (occurrence.root !== MAIN_ROOT_KEY) {
        goneRoots ??= rootsOwnedOnlyWithin(ownership, value, (node) =>
          takenWhole.has(node)
        );
        if (goneRoots.has(occurrence.root)) return true;
      }
      const { remover, taken } = partsOn(occurrence);

      return remover
        ? !marksOf(remover, facts).some(
            (mark) => mark.change === change && removes(mark)
          )
        : taken;
    });
};

export const decide = (
  value: JsonEditorValue,
  { actions, token, withdraws }: DecisionRequest,
  { book, resolveSchema, spares }: DecisionSite
): Decided => {
  const ids = [...actions.keys()];
  const outcome = (change: string) => actions.get(change) ?? 'keep';
  const deciding = {
    authors: new Set(
      ids.flatMap((id) => book.occurrences(id).map(({ mark }) => mark.author))
    ),
    changes: new Set(
      ids.flatMap((id) => [id, ...book.members(id).map((entry) => entry.id)])
    ),
  };
  const resolveOptions = { deciding, stores: true, withdraws };
  const windows = decisionWindowsOf(
    value,
    ids,
    (id) => book.occurrences(id),
    spares
  );
  let windowed: ReturnType<typeof resolveAuthoredWindows> = null;
  let whole: ReturnType<typeof resolveAuthoredValue> | null = null;

  try {
    for (const { from, to } of windows ?? []) {
      countCoreWork('decisionBlocks', to - from);
    }
    windowed =
      windows &&
      resolveAuthoredWindows(
        value,
        windows,
        outcome,
        resolveSchema,
        resolveOptions
      );
    if (!windowed) {
      const blocks = [
        ...value.children,
        ...Object.values(value.roots ?? {}).flat(),
      ];

      countCoreWork('decisionBlocks', blocks.length);
      coverStoredValues(resolveSchema.ownership, blocks);
      whole = resolveAuthoredValue(
        value,
        outcome,
        resolveSchema,
        resolveOptions
      );
    }
  } catch (error) {
    if (isRefusal(error)) return { status: 'invalid' };
    throw error;
  }

  const resolution = windowed ?? getDefined(whole);

  const blockers = resolution.blockers.filter((change) => !actions.has(change));

  if (blockers.length > 0) return { status: 'blocked', with: blockers };
  if (resolution.unplaceable) return { status: 'invalid' };

  const decision = token();
  const facts = windowed && factsOf(value);
  const markStaysStored = (id: string) =>
    windowed
      ? windowed.windows.some(
          ({ after }) => claimIn(after, getDefined(facts), id) !== null
        )
      : !!claimOf(getDefined(whole).value, id);
  const taken = takenWithoutVerdict(
    value,
    actions,
    resolution.takenWhole,
    resolveSchema.ownership
  );
  const verdicts = [...actions]
    .filter(
      ([id]) =>
        (!withdraws || markStaysStored(id)) && !taken(id, book.occurrences(id))
    )
    .flatMap(([id, verdict]) =>
      [...incarnationsOf(book.occurrences(id))].map(
        ({ at, change, inc }): VerdictRecord => ({
          decision,
          member: inc === undefined ? { at, change } : { at, change, inc },
          verdict,
        })
      )
    );
  const completed = completedJoinKeys(
    [...actions].flatMap(([id, action]) =>
      action === 'accept' ? book.occurrences(id) : []
    ),
    resolution.resolvedOf
  );
  const decided =
    windowed &&
    windowedValue(value, windowed, actions, resolveSchema.ownership);
  const written = verdicts.map((record) =>
    record.verdict === 'accept'
      ? {
          ...record,
          completed: completed.get(incarnationOf(record.member)) ?? [],
        }
      : record
  );
  const decidedValue = withVerdicts(
    decided ? decided.value : getDefined(whole).value,
    written
  );
  const { candidates, remains } = remainsAfter(
    value,
    decidedValue,
    windowed
      ? { dropped: [], runs: windowed.windows }
      : decidedRunsOf(value, decidedValue),
    book,
    resolution.resolvedIn
  );
  let takenRoots: ReadonlySet<string> | undefined;
  const rootsTaken = () => {
    takenRoots ??= rootsOwnedOnlyWithin(
      resolveSchema.ownership,
      value,
      (node) => resolution.takenWhole.has(node)
    );

    return takenRoots;
  };
  const inDroppedRoots = windowed
    ? new Set<string>()
    : insertionsInDroppedRoots(value, decidedValue, rootsTaken);
  const losesText = ({
    mark,
    node,
    path,
    root,
  }: ReturnType<typeof book.occurrences>[number]) =>
    mark.kind === 'insert' &&
    typeof node.text === 'string' &&
    node.text !== '' &&
    !insideTaken(value, root, path, resolution.takenWhole) &&
    (root === MAIN_ROOT_KEY || !rootsTaken().has(root));
  const decidersLosingText = book
    .pendingInOrder(new Set([...candidates, ...inDroppedRoots]))
    .filter(
      (id) =>
        !actions.has(id) &&
        book
          .occurrences(id)
          .some(({ mark }) => deciding.authors.has(mark.author)) &&
        (inDroppedRoots.has(id) ||
          (!remains(id) && book.occurrences(id).some(losesText)))
    );

  if (decidersLosingText.length > 0) {
    return { status: 'blocked', with: decidersLosingText };
  }

  const records = recordOpsBetween(
    getValueRecords(value),
    getValueRecords(decidedValue)
  );

  return {
    built: builtSpansOf(value, decided, windowed, whole),
    change: withDocumentChangeRecords(
      decided
        ? decided.change
        : decidedContentChange(value, decidedValue, {
            facts: factsOf(value),
            outcomes: actions,
            schema: resolveSchema.ownership,
          }),
      records
    ),
    decided: [
      ...new Set([...resolution.decided, ...ids.filter((id) => !remains(id))]),
    ],
    status: 'decided',
    value: decidedValue,
    verdicts: written,
    windowed: decided,
  };
};
