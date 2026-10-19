import { authoredDocumentCapabilityPoint } from '../core/authored-document-capability';
import {
  getAuthoredUpdateView,
  registerAuthoredRuntime,
} from '../core/authored-runtime';
import { authoredVeto } from '../core/authored-veto';
import { type DraftStep, UNSCOPED_ORIGINS } from '../core/change/builder';
import {
  createInternalDocumentChange,
  DocumentChange,
  filterDocumentChangeRoots,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  valueRoot,
  valueRootIndex,
  withDocumentChangeRecords,
} from '../core/change/document-change';
import {
  DocumentIndex,
  rootIndexOf,
  rootNodesOf,
} from '../core/change/document-index';
import { jsonEqual } from '../core/change/json';
import { copyFields, setLazyRoot } from '../core/change/lazy-root';
import type { RootChange } from '../core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import {
  type CommandProjectionMap,
  type EditorFrameRecording,
  registerEditorCommandDocument,
} from '../core/command-document';
import { prepareCommandFrame } from '../core/command-frame';
import { registerEditorContent } from '../core/content';
import { documentAdmissionPoint } from '../core/document-admission';
import {
  registerEditorDocumentRecorder,
  registerEditorDraftGuard,
} from '../core/document-recorder';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  getEditorSchema,
  type InternalEditorRuntime,
} from '../core/editor-runtime';
import type { InternalEditorSchemaApi } from '../core/editor-schema';
import { definePlugin } from '../core/plugin';
import {
  getCompiledEditorSchema,
  getPluginContributions,
} from '../core/plugin-registry';
import {
  getActiveEditorUpdateId,
  getCurrentSelection,
  getCurrentSelectionRoot,
  getActiveEditorUpdateTags,
  notifyEditorViewState,
  subscribeEditorViewState,
  withEditorDocumentProjection,
} from '../core/public-state';
import {
  composeRecordOps,
  deriveValue,
  getValueRecords,
  NO_RECORD_OPS,
  recordOpsBetween,
  withValueRecords,
} from '../core/record-store';
import {
  EditorRefusalError,
  publishEditorRefusal,
  subscribeEditorRefusals,
} from '../core/refusal';
import { completeChildrenAt, emptyTextDrops } from '../core/representation';
import {
  changedRootsOf,
  orphanedValueRoots,
  rootsDeletedByName,
} from '../core/root-ownership';
import { EditorSchemaValidationError } from '../core/schema-validation';
import {
  type TxDeclaredMethod,
  txOnly,
  type TxOnlyMethod,
  txStored,
} from '../core/tx-only';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  NodeKey,
  Plugin,
  PluginDependencyReferenceFor,
  Selection,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Location } from '../interfaces/location';
import type { Descendant } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import {
  indexAuthoredChanges,
  type Occurrence,
  readAuthoredDetails,
} from './changes';
import {
  authoredAdmission,
  createDocumentMarksValidator,
} from './facts/admission';
import { carriedIn } from './facts/compact';
import { createDependencies, type Dependencies } from './facts/dependencies';
import { editingChangeOf, isEditingChange } from './facts/editing';
import {
  claimsOf,
  factsOf,
  isAccepted,
  isSettledDeletion,
  marksOf,
  type ReviewFacts,
  standingClaimsOf,
} from './facts/facts';
import {
  authoredRecords,
  type ContextRecord,
  incarnationOf,
  type LandedRecord,
  landedOf,
  putContexts,
  putLanded,
  putVerdicts,
  type VerdictRecord,
  withStore,
} from './facts/records';
import { projectAuthoredDocumentUnder, projectionRefusal } from './format';
import { createReviewLedger, getReviewLedger } from './ledger/ledger';
import { blockFactsOf } from './ledger/runs';
import {
  type AuthoredRefusal,
  constructsValues,
  GENERATED_VALUES_REFUSAL,
  proposalRefusal,
  unplaced,
  unrepresentable,
} from './refusal';
import {
  authoredResolveSchemaOf,
  ownershipResolveSchemaOf,
} from './resolve-schema';
import { characterAlignedChange, decidedContentChange } from './tree/alignment';
import { relinkCuts } from './tree/cuts';
import { acceptedValues, type FormatTag, type Standing } from './tree/layers';
import {
  type AuthoredMark,
  AuthoredMarkError,
  authoredMarksSchema,
  isAuthoredSetValued,
  readAuthoredMarks,
  readMembers,
} from './tree/marks';
import { recordAuthoredSteps } from './tree/record';
import { completeProposed } from './tree/record-completion';
import {
  type AuthoredResolveSchema,
  claimsBreakBefore,
  followsOf,
  projectAuthoredValue,
  isTextBlock,
  pastFollowers,
  resolveAuthoredChildren,
  resolveAuthoredValue,
} from './tree/resolve';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangeGroup,
  AuthoredChangesDelta,
  AuthoredDecision,
  AuthoredOptions,
  AuthoredPage,
  AuthoredQuery,
  AuthoredResult,
  AuthoredReview,
  AuthoredView,
} from './types';

type AuthoredRead = {
  view: () => AuthoredView;
  change: (id: string) => AuthoredChange | null;
  /**
   * Pending changes in document order, a page at a time. The cursor names the
   * next change and falls back to the last one read, and reads as stale when
   * both have left.
   */
  changes: (query?: AuthoredQuery) => AuthoredPage;
  details: (id: string) => AuthoredChangeDetails | null;
  /** The cards touching a place of the stored document, in document order. */
  groups: (
    query: Readonly<{ at: Location | NodeKey }>
  ) => readonly AuthoredChangeGroup[];
  /** The card holding a pending change. */
  groupOf: (changeId: string) => AuthoredChangeGroup | null;
  /** What review reads on a node of the stored document. */
  reviewOf: (node: unknown) => AuthoredReview;
};

type AuthoredUpdate = {
  /**
   * Accept or reject changes in this update, which records nothing. Several
   * decisions decide together, so changes that wait on each other can be
   * accepted and rejected in one call. A blocked result names the changes to
   * decide with them.
   */
  decide: TxDeclaredMethod<
    (
      decisions: AuthoredDecision | readonly AuthoredDecision[]
    ) => AuthoredResult
  >;
  /**
   * Take back this editor's author's own pending changes as if never
   * proposed: rejected with no verdict record and no held member. Another
   * author's change gives an invalid result.
   */
  withdraw: TxDeclaredMethod<
    (changes: readonly AuthoredChange[]) => AuthoredResult
  >;
  /** Record this update's writes under one change, whatever the intent. */
  propose: TxOnlyMethod<(options?: { changeId?: string }) => string>;
};

export type AuthoredPlugin = Plugin<{
  activate: true;
  api: {
    setView: (view: AuthoredView) => void;
    /**
     * Calls the listener once for each commit that changes the review, with
     * one frozen delta every listener of this view shares.
     */
    subscribeChanges: (
      listener: (delta: AuthoredChangesDelta) => void
    ) => () => void;
    /**
     * Calls the listener with each change the editor refused whole, after it
     * rolled back, and with each view switch it refused.
     */
    subscribeRefusals: (
      listener: (refusal: AuthoredRefusal) => void
    ) => () => void;
  };
  contributions: true;
  dependencies: readonly [PluginDependencyReferenceFor<typeof authoredRecords>];
  name: 'authored';
  read: AuthoredRead;
  schema: typeof authoredMarksSchema;
  update: AuthoredUpdate;
}>;

/** Deterministic ids, clock and starting intent for tests. */
export type AuthoredTestOptions = AuthoredOptions &
  Readonly<{
    createChangeId?: () => string;
    /** Ids for a change proposed again after its decision. */
    createIncarnationId?: () => string;
    createTagId?: () => string;
    intent?: 'edit' | 'propose';
    now?: () => number;
    /**
     * Record what Suggesting refuses, such as a change in a table, as content
     * loaded from elsewhere can hold it.
     */
    vetoes?: false;
  }>;

type Forced = Readonly<{ at: number; changeId: string; inc?: string }>;

type AuthoredState = {
  /** Updates whose writes record under one change, by update id. */
  forced: WeakMap<object, Forced>;
  marks: ReturnType<typeof createDocumentMarksValidator>;
  /** Updates that decide changes and record nothing, by update id. */
  passThrough: WeakSet<object>;
  /** A view switch asked for mid-composition, by view runtime. */
  pending: WeakMap<object, AuthoredView>;
  /** Updates refused, by update id, so a refusal caught inside one holds. */
  refused: WeakMap<object, AuthoredRefusal>;
  views: WeakMap<object, AuthoredView>;
};

const STATES = new WeakMap<object, AuthoredState>();

const elementOf = (props: Readonly<Record<string, unknown>>): Element => ({
  ...props,
  children: [],
  type: String(props.type),
});

const isRefusal = (error: unknown) =>
  error instanceof EditorSchemaValidationError ||
  error instanceof AuthoredMarkError;

const isReplay = (tags: readonly string[]) =>
  tags.includes('historic') || tags.includes('collaboration');

const isStruck = (editor: Editor, node: unknown) => {
  if (!readAuthoredMarks(node).some((mark) => mark.kind === 'delete')) {
    return false;
  }

  const facts = factsOf(storedValue(editor));

  return (
    isSettledDeletion(node, facts) ||
    marksOf(node, facts).some((mark) => mark.kind === 'delete')
  );
};

const claimOf = (value: EditorDocumentValue, change: string) => {
  const facts = factsOf(value);
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

  return find([...value.children, ...Object.values(value.roots ?? {}).flat()]);
};

const positionOf = (value: JsonEditorValue, root: string, point: Point) =>
  valueRootIndex(value, root).positionAt(point);

type WrittenMap = Readonly<{
  after: JsonEditorValue;
  indexes: ReadonlyMap<string, DocumentIndex>;
  map: (
    root: string,
    position: number,
    assoc: -1 | 1
  ) => number | null | undefined;
  root: string;
}>;

const mapPoint = (point: Point, input: WrittenMap, assoc: -1 | 1): Point => {
  const index = input.indexes.get(input.root);

  if (!index) return point;

  const position = input.map(
    input.root,
    positionOf(input.after, input.root, point),
    assoc
  );
  const recorded =
    position === null || position === undefined
      ? null
      : index.pointAt(position, assoc);

  return recorded
    ? { ...point, offset: recorded.offset, path: [...recorded.path] }
    : point;
};

/** Map a selection on the written draft onto the document recorded from it. */
const mapSelection = (
  selection: Selection,
  input: WrittenMap,
  assoc: -1 | 1 = -1
): Selection => {
  if (selection?.kind === 'text') {
    return {
      ...selection,
      anchor: mapPoint(selection.anchor, input, assoc),
      focus: mapPoint(selection.focus, input, assoc),
    };
  }

  const index = input.indexes.get(input.root);

  if (selection?.kind !== 'node' || !index) return selection;

  const draft = DocumentIndex.fromValue(valueRoot(input.after, input.root));
  const mapPath = (path: Path) => {
    const position = input.map(input.root, draft.nodeRange(path).from, 1);
    const entry =
      position === null || position === undefined
        ? null
        : index.nodeStartingAt(position);

    return entry ? [...entry.path] : null;
  };
  const [first, ...rest] = selection.paths.flatMap((path) => {
    const mapped = mapPath(path);

    return mapped ? [mapped] : [];
  });

  if (!first) return null;

  const { paths } = SelectionApi.nodes([first, ...rest], { mode: 'block' });
  const endpoint = (path: Path, fallback: Path) => {
    const mapped = mapPath(path);

    return mapped && paths.some((kept) => PathApi.equals(kept, mapped))
      ? mapped
      : fallback;
  };

  return SelectionApi.nodes(paths, {
    anchorPath: endpoint(selection.anchorPath, paths[0]),
    focusPath: endpoint(selection.focusPath, paths.at(-1) ?? paths[0]),
    mode: selection.mode,
    ...(selection.root === undefined ? {} : { root: selection.root }),
  });
};

// Tests that count work turn the check off with PLITE_LAW_CHECK=0, because its
// projection reads every mark again. PLITE_LAW_CHECK=content checks the
// content and not the selection.
const framedLawCheck = () => {
  const env = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env;

  return env?.NODE_ENV === 'test' ? env.PLITE_LAW_CHECK : '0';
};

const assertFramedLaw = (
  input: EditorFrameRecording,
  schema: AuthoredResolveSchema,
  selection: boolean,
  mapAfter: () => CommandProjectionMap
) => {
  const { frame, root, stored } = input;
  const written = contentOf(stored.value);
  const accepted = contentOf(
    projectAuthoredValue(stored.value, 'proposed', schema).value
  );

  if (!jsonEqual(accepted, contentOf(frame.value))) {
    throw new Error(
      `A framed recording does not accept to what its commands wrote: ${JSON.stringify(
        { accepted: accepted.children, wrote: frame.value.children }
      )}`
    );
  }
  if (
    !selection ||
    frame.selection?.kind !== 'text' ||
    stored.selection?.kind !== 'text'
  ) {
    return;
  }

  const map = mapAfter();
  const index = DocumentIndex.fromValue(valueRoot(accepted, root));

  for (const edge of ['anchor', 'focus'] as const) {
    const position = positionOf(written, root, stored.selection[edge]);
    const expected = frame.selection[edge];

    // A caret at a struck leaf's edge maps between leaves, where it reads as
    // the end of one or the start of the next.
    if (
      !(['backward', 'forward'] as const).some((association) =>
        ([-1, 1] as const).some((assoc) => {
          const projected = map.toProjected(root, position, association);
          const point =
            projected === null ? null : index.pointAt(projected, assoc);

          return (
            point !== null &&
            point.offset === expected.offset &&
            PathApi.equals(point.path, expected.path)
          );
        })
      )
    ) {
      throw new Error(
        `A framed recording does not accept to its commands' ${edge}: ${JSON.stringify(
          {
            accepted: valueRoot(accepted, root),
            stored: stored.selection[edge],
            whereCommandsLeftIt: expected,
            written: valueRoot(written, root),
          }
        )}`
      );
    }
  }
};

// Owners reading their stored document, which their own preview would
// otherwise project the review marks out of.
const STORED_READS = new WeakSet<Editor>();

const NO_ROOTS: ReadonlySet<string> = new Set();

// One publisher per view runtime, so every listener of a view gets one delta
// per commit.
const PUBLISHERS = new WeakMap<
  InternalEditorRuntime,
  {
    ledger: ReturnType<typeof ledgerOf>;
    listeners: Set<(delta: AuthoredChangesDelta) => void>;
    stop: () => void;
  }
>();

const storedValue = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);

  if (STORED_READS.has(owner)) return owner.read.value() as JsonEditorValue;
  STORED_READS.add(owner);
  try {
    return owner.read.value() as JsonEditorValue;
  } finally {
    STORED_READS.delete(owner);
  }
};

// A cursor is the query it pages, the next change and the last one read.
const readCursor = (cursor: string): readonly [string, string, string] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(cursor);
  } catch {
    parsed = null;
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length !== 3 ||
    parsed.some((part) => typeof part !== 'string')
  ) {
    throw new Error('Stale authored page cursor.');
  }

  return parsed as [string, string, string];
};

const storedRead = <T>(editor: Editor, read: (owner: Editor) => T): T => {
  const owner = getEditorRuntimeOwner(editor);

  if (STORED_READS.has(owner)) return read(owner);
  STORED_READS.add(owner);
  try {
    return read(owner);
  } finally {
    STORED_READS.delete(owner);
  }
};

// The pending changes touching a place of the stored document, in document
// order: a node holds the changes with an occurrence inside it, and a point or
// a range the changes with a range that intersects it.
const placeIds = (
  editor: Editor,
  book: ReturnType<typeof changesOf>,
  at: Location | NodeKey
): string[] => {
  const viewRoot = getEditorRuntimeRoot(editor);

  if (typeof at === 'string' || PathApi.isPath(at)) {
    const path =
      typeof at === 'string'
        ? storedRead(editor, () => editor.read.nodes.path(at))
        : at;

    if (!path) return [];

    const first = getDefined(path[0]);

    return book.pendingInOrder(
      [...book.idsIn(viewRoot, first, first + 1)].filter((id) =>
        book
          .occurrences(id)
          .some(
            (occurrence) =>
              occurrence.root === viewRoot &&
              (PathApi.equals(occurrence.path, path) ||
                PathApi.isAncestor(path, occurrence.path))
          )
      )
    );
  }

  const inViewRoot = (point: Point) =>
    point.root === undefined ? { ...point, root: viewRoot } : point;
  const range = RangeApi.isRange(at)
    ? { ...at, anchor: inViewRoot(at.anchor), focus: inViewRoot(at.focus) }
    : { anchor: inViewRoot(at), focus: inViewRoot(at) };
  const [start, end] = RangeApi.edges(range);

  return book.pendingInOrder(
    [
      ...book.idsIn(
        start.root ?? viewRoot,
        getDefined(start.path[0]),
        getDefined(end.path[0]) + 1
      ),
    ].filter((id) =>
      getDefined(book.change(id)).ranges.some(
        (candidate) => RangeApi.intersection(candidate, range) !== null
      )
    )
  );
};

const ledgerOf = (editor: Editor) =>
  getDefined(getReviewLedger(getEditorRuntimeOwner(editor)));

const changesOf = (editor: Editor, value: JsonEditorValue) =>
  ledgerOf(editor).changes(value);

type Outcome = 'accept' | 'reject';

const decidedChange = (
  value: JsonEditorValue,
  decided: JsonEditorValue,
  actions: ReadonlyMap<string, Outcome>
) =>
  withDocumentChangeRecords(
    decidedContentChange(contentOf(value), contentOf(decided), {
      facts: factsOf(value),
      outcomes: actions,
    }),
    recordOpsBetween(getValueRecords(value), getValueRecords(decided))
  );

/** `value` without its records, which a decision only adds to. */
const contentOf = (value: JsonEditorValue): JsonEditorValue => {
  const { records: _records, ...plain } = value;

  return plain;
};

const contentChangeOf = (change: DocumentChange) =>
  withDocumentChangeRecords(change, NO_RECORD_OPS);

type OwnRun = Readonly<{ from: number; path: readonly number[]; to: number }>;

const nodePropsOf = ({
  children: _children,
  text: _text,
  ...props
}: JsonNode) => props;

/**
 * The deepest element whose children hold the range as whole blocks, so a
 * join or split in the range lands among the blocks beside it.
 */
const siteOf = (index: DocumentIndex, from: number, to: number) => {
  let site: readonly number[] = [];

  for (const range of index.openContextAt(from)) {
    if (
      range.kind !== 'element' ||
      range.contentFrom > from ||
      range.contentTo < to ||
      isTextBlock(index.node(range.path))
    ) {
      break;
    }
    site = range.path;
  }

  return site;
};

const childrenOf = (index: DocumentIndex, path: readonly number[]) =>
  (path.length === 0
    ? index.value
    : index.node(path).children) as readonly JsonNode[];

const holdsOwnStructure = (node: JsonNode, facts: ReviewFacts): boolean =>
  claimsOf(node, facts).some(
    (mark) =>
      (mark.kind === 'join' || mark.kind === 'split') &&
      isEditingChange(mark.change)
  ) || (node.children ?? []).some((child) => holdsOwnStructure(child, facts));

/** The pending joins Editing's claims in `node` say their blocks go with. */
const ownFollowed = (node: JsonNode, facts: ReviewFacts): string[] => [
  ...claimsOf(node, facts).flatMap((mark) => {
    const key = isEditingChange(mark.change) ? followsOf(mark) : undefined;

    return key ? [key] : [];
  }),
  ...(node.children ?? []).flatMap((child) => ownFollowed(child, facts)),
];

/**
 * The run around blocks `from` to `to` of the element at `path`: a
 * line on either side, where a join in the run or a pending join after it
 * lands, and before it whatever block a join or split in it lands on.
 */
const runAround = (
  index: DocumentIndex,
  path: readonly number[],
  from: number,
  to: number,
  facts: ReviewFacts
): OwnRun => {
  const siblings = childrenOf(index, path);
  const structural = siblings
    .slice(from, to)
    .some((node) => holdsOwnStructure(node, facts));
  let start =
    from > 0 && (structural || isTextBlock(siblings[from - 1]))
      ? from - 1
      : from;

  const landingPassesOver = (node: JsonNode) =>
    holdsOwnStructure(node, facts) ||
    (structural && isSettledDeletion(node, facts));

  while (start > 0 && landingPassesOver(getDefined(siblings[start]))) {
    start -= 1;
  }

  const end = pastFollowers(siblings, to, (node) => claimsOf(node, facts));

  return {
    from: start,
    path,
    to: end < siblings.length && isTextBlock(siblings[end]) ? end + 1 : end,
  };
};

const ownRuns = (
  index: DocumentIndex,
  change: RootChange,
  facts: ReviewFacts
) => {
  const sites = new Map<string, { path: readonly number[]; at: Set<number> }>();

  change.iterChangedRanges((_fromA, _toA, from, to) => {
    const path = siteOf(index, from, to);
    const key = path.join(',');
    const site = sites.get(key) ?? { at: new Set<number>(), path };

    for (const range of index.nodeRangesTouching(from, to)) {
      if (
        (to === from || (range.from < to && range.to > from)) &&
        range.path.length === path.length + 1 &&
        path.every((step, depth) => range.path[depth] === step)
      ) {
        site.at.add(range.path[path.length]);
      }
    }
    sites.set(key, site);
  });

  const runs: OwnRun[] = [];

  for (const { at, path } of sites.values()) {
    for (const child of [...at].toSorted((left, right) => left - right)) {
      const run = runAround(index, path, child, child + 1, facts);
      const last = runs.at(-1);

      if (last && last.path === path && run.from <= last.to) {
        runs[runs.length - 1] = {
          from: Math.min(last.from, run.from),
          path,
          to: Math.max(last.to, run.to),
        };
      } else {
        runs.push(run);
      }
    }
  }

  return runs;
};

/**
 * The contexts a recording minted that its written content rests on, directly
 * or through a kept context's base. Accepting one's own claims can leave a
 * minted context named by nothing, and only content the write changed can name
 * one it minted.
 */
const restedOn = (
  minted: readonly ContextRecord[],
  change: DocumentChange,
  indexes: ReadonlyMap<string, DocumentIndex>
) => {
  if (minted.length === 0) return minted;

  const named = new Set<string>();

  for (const [root, index] of indexes) {
    for (const range of getInternalDocumentChangeRanges(change, root)) {
      for (const { path } of index.nodeRangesTouching(range[2], range[3])) {
        for (const member of readMembers(index.node(path))) {
          if (member.kind === 'in') named.add(member.ctx);
        }
      }
    }
  }
  const bases = new Map(minted.map(({ base, ctx }) => [ctx, base]));

  for (const ctx of named) {
    const base = bases.get(ctx);

    if (base) named.add(base);
  }

  return minted.filter(({ ctx }) => named.has(ctx));
};

/**
 * Accept an Editing write's own claims in its commit, over runs of the
 * blocks the write touched. A join or split whose landing waits on another
 * pending change keeps its claim. Completion is left to the commit's
 * canonical pass, which fills in place as Editing does.
 */
const acceptOwn = (
  change: DocumentChange,
  indexes: ReadonlyMap<string, DocumentIndex>,
  dependencies: Dependencies,
  base: ReviewFacts
) => {
  const minted = new Map(
    dependencies.minted().map((record) => [record.ctx, record] as const)
  );
  const facts: ReviewFacts =
    minted.size === 0
      ? base
      : {
          ...base,
          contexts: {
            get: (ctx) => minted.get(ctx) ?? base.contexts.get(ctx),
            has: (ctx) => minted.has(ctx) || base.contexts.has(ctx),
          },
        };
  const outcome = (id: string) => (isEditingChange(id) ? 'accept' : 'keep');
  // An own mark the resolution keeps pending, such as a deletion inside a
  // line another author's pending join holds, settles nothing.
  const settledBy = (result: readonly JsonNode[]) => {
    const kept = new Set<unknown>();
    const visit = (node: JsonNode) => {
      for (const member of readMembers(node)) kept.add(member);
      node.children?.forEach(visit);
    };

    result.forEach(visit);

    const own = (kind: AuthoredMark['kind']) => (node: unknown) =>
      claimsOf(node, facts).some(
        (mark) =>
          mark.kind === kind && isEditingChange(mark.change) && !kept.has(mark)
      );

    return { joins: own('join'), removes: own('delete') };
  };
  const changes = new Map<string, RootChange>();
  const accepted = new Map(indexes);
  const landed: LandedRecord[] = [];
  const resolveOwn = (nodes: readonly JsonNode[], root: string) => {
    const resolution = resolveAuthoredChildren(nodes, outcome, null, root, {
      dependencies,
      facts,
      stores: true,
    });

    landed.push(...resolution.landed);

    return resolution.children;
  };

  for (const [root, index] of indexes) {
    const rootChange = getInternalDocumentRootChange(change, root);

    if (!rootChange) continue;

    // A run whose element the resolution would change resolves one level up,
    // and one holding a block that goes with a pending join reaches the
    // join's line, so its resolution sees whether that join waits.
    const resolveRun = (first: OwnRun) => {
      for (let run = first; ;) {
        const siblings = childrenOf(index, run.path);
        const keys = new Set(
          siblings
            .slice(run.from, run.to)
            .flatMap((node) => ownFollowed(node, facts))
        );

        if (keys.size > 0) {
          const lines = siblings.flatMap((node, at) =>
            blockFactsOf(node).joins.some((key) => keys.has(key)) ? [at] : []
          );

          if (lines.length === 0 && run.path.length > 0) {
            const at = getDefined(run.path.at(-1));

            run = runAround(index, run.path.slice(0, -1), at, at + 1, facts);
            continue;
          }
          run = {
            ...run,
            from: Math.min(run.from, ...lines),
            to: Math.max(run.to, ...lines.map((at) => at + 1)),
          };
        }

        const nodes = siblings.slice(run.from, run.to);

        if (run.path.length === 0) {
          return { nodes, result: resolveOwn(nodes, root), run };
        }

        const shell: JsonNode = {
          ...nodePropsOf(index.node(run.path)),
          children: [...nodes],
        };
        const [only, ...rest] = resolveOwn([shell], root);

        // A join or split on the element's first remaining block can land
        // outside it.
        const leading = nodes.find((node) => !isSettledDeletion(node, facts));

        if (
          only &&
          rest.length === 0 &&
          jsonEqual(nodePropsOf(only), nodePropsOf(shell)) &&
          !(run.from === 0 && leading && holdsOwnStructure(leading, facts))
        ) {
          return { nodes, result: only.children ?? [], run };
        }

        const at = getDefined(run.path.at(-1));

        run = runAround(index, run.path.slice(0, -1), at, at + 1, facts);
      }
    };
    let runs = ownRuns(index, rootChange, facts);
    let spans: Array<
      ReturnType<typeof resolveRun> & Readonly<{ from: number; to: number }>
    > = [];

    // Runs that overlap once resolved, such as one a resolution moved up a
    // level, merge and resolve again. Runs at different levels only nest.
    for (let merged = true; merged; runs = spans.map((span) => span.run)) {
      merged = false;
      spans = [];
      for (const span of runs
        .map(resolveRun)
        .map((entry) => ({
          ...entry,
          from: index.childPosition(entry.run.path, entry.run.from),
          to: index.childPosition(entry.run.path, entry.run.to),
        }))
        .toSorted(
          (left, right) => left.from - right.from || right.to - left.to
        )) {
        const last = spans.at(-1);

        if (!last || span.from >= last.to) {
          spans.push(span);
        } else if (span.to > last.to) {
          spans[spans.length - 1] = {
            ...last,
            run: { ...last.run, to: span.run.to },
            to: span.to,
          };
          merged = true;
        }
      }
    }

    let current = index;
    let composed: RootChange | null = null;

    for (const { from, nodes, result } of spans.toReversed()) {
      if (jsonEqual(result, nodes)) continue;

      const stored = { children: nodes } as JsonEditorValue;
      const settled = { children: result } as JsonEditorValue;
      const aligned =
        characterAlignedChange(stored, settled, settledBy(result)) ??
        DocumentChange.between(stored, settled, {
          isSetValued: isAuthoredSetValued,
        });
      const step = getDefined(
        getInternalDocumentRootChange(aligned, 'main')
      ).embed(current.length, from);

      current = step.apply(current);
      composed = composed ? composed.compose(step) : step;
    }

    if (composed) {
      changes.set(root, composed);
      accepted.set(root, current);
    }
  }

  return changes.size === 0
    ? null
    : {
        change: createInternalDocumentChange(changes),
        indexes: accepted,
        landed,
      };
};

const writtenNamedRoots = (steps: readonly DraftStep[]) => {
  const written = new Set<string>();

  for (const step of steps) {
    if (UNSCOPED_ORIGINS.has(step.origin)) continue;
    for (const [root] of getInternalDocumentChangeEntries(step.change)) {
      if (root !== 'main') written.add(root);
    }
  }

  return written;
};

const insertionsInDroppedRoots = (
  value: JsonEditorValue,
  decided: JsonEditorValue
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
    if (Object.hasOwn(decided.roots ?? {}, root)) continue;
    for (const child of children) visit(child, false);
  }

  return stranded;
};

const incarnationsOf = (occurrences: readonly Occurrence[]) =>
  new Map(occurrences.map(({ mark }) => [incarnationOf(mark), mark])).values();

const withVerdicts = (
  value: JsonEditorValue,
  verdicts: readonly VerdictRecord[]
): JsonEditorValue =>
  verdicts.length === 0 ? value : deriveValue(value, {}, putVerdicts(verdicts));

/**
 * The `authored` plugin with deterministic ids, clock and starting intent,
 * for tests.
 */
export const createAuthoredPlugin = (
  options: AuthoredTestOptions
): AuthoredPlugin => {
  const createChangeId = options.createChangeId ?? (() => crypto.randomUUID());
  // Every saved tag, cut and `over` link carries an id, so ids stay short: a
  // format tag's only has to differ from the other tags on its key, and a
  // cut's from the other cuts in the document.
  const createTagId =
    options.createTagId ??
    (() => crypto.randomUUID().replaceAll('-', '').slice(0, 12));
  const now = options.now ?? Date.now;
  const incarnationToken = crypto.randomUUID().slice(0, 8);
  let incarnations = 0;
  // Two peers can propose one decided id again in the same millisecond, so a
  // new incarnation names the runtime that minted it.
  const createIncarnationId =
    options.createIncarnationId ??
    (() => {
      incarnations += 1;

      return `${incarnationToken}:${incarnations}`;
    });
  const authorOf = (editor: Editor) =>
    (typeof options.authorId === 'function'
      ? options.authorId(editor)
      : options.authorId) ?? null;
  const stateOf = (editor: Editor) => {
    const state = STATES.get(getEditorRuntimeOwner(editor));

    if (!state) throw new Error('Authored changes are not installed.');

    return state;
  };
  // A view that never chose one follows its editor's.
  const viewOf = (editor: Editor): AuthoredView => {
    const { views } = stateOf(editor);

    return (
      views.get(getEditorRuntime(editor)) ??
      views.get(getEditorRuntime(getEditorRuntimeOwner(editor))) ?? {
        intent: 'edit',
      }
    );
  };
  const decideOn = (
    editor: Editor,
    value: JsonEditorValue,
    decisions: AuthoredDecision | readonly AuthoredDecision[],
    withdraws = false
  ):
    | Readonly<{ result: AuthoredResult }>
    | Readonly<{
        change: DocumentChange;
        result: AuthoredResult;
      }> => {
    const book = changesOf(editor, value);
    const actions = new Map<string, 'accept' | 'reject'>();
    let conflicting = false;

    const stale = new Set<string>();

    for (const decision of [decisions].flat()) {
      for (const read of 'groups' in decision
        ? decision.groups
        : decision.changes) {
        const current =
          'groups' in decision ? book.groupOf(read.id) : book.change(read.id);

        if (current?.id !== read.id || current.revision !== read.revision) {
          stale.add(read.id);
        }
      }
    }
    if (stale.size > 0) {
      return { result: { ids: [...stale], status: 'stale' } };
    }
    for (const decision of [decisions].flat()) {
      const decided =
        'groups' in decision
          ? decision.groups.flatMap((group) =>
              book.members(group.id).map((entry) => entry.id)
            )
          : decision.changes.map((change) => change.id);

      for (const id of decided) {
        conflicting ||=
          (actions.get(id) ?? decision.action) !== decision.action;
        actions.set(id, decision.action);
      }
    }

    const ids = [...actions.keys()];

    if (conflicting) return { result: { ids, status: 'invalid' } };

    let resolution: ReturnType<typeof resolveAuthoredValue>;

    try {
      resolution = resolveAuthoredValue(
        value,
        (change) => actions.get(change) ?? 'keep',
        authoredResolveSchemaOf(editor),
        { stores: true, withdraws }
      );
    } catch (error) {
      if (isRefusal(error)) return { result: { ids, status: 'invalid' } };
      throw error;
    }

    const blockers = resolution.blockers.filter(
      (change) => !actions.has(change)
    );

    if (blockers.length > 0) {
      return { result: { ids, status: 'blocked', with: blockers } };
    }
    if (resolution.unplaceable) return { result: { ids, status: 'invalid' } };

    // One token per decision, so a peer's decision on the same incarnation
    // gets its own key and an undo drops only this one.
    const decision = createIncarnationId();
    const verdicts = withdraws
      ? []
      : [...actions].flatMap(([id, verdict]) =>
          [...incarnationsOf(book.occurrences(id))].map(
            ({ at, change, inc }): VerdictRecord => ({
              decision,
              member: inc === undefined ? { at, change } : { at, change, inc },
              verdict,
            })
          )
        );
    const decidedValue = withVerdicts(resolution.value, verdicts);
    // A change whose inserted text the decision removes, such as text typed
    // inside a rejected insertion, goes only when it is decided too. An empty
    // block completion built holds nothing to lose.
    const remaining = indexAuthoredChanges(decidedValue).changes;
    const inDroppedRoots = insertionsInDroppedRoots(value, decidedValue);
    const taken = [...book.idsFrom({})].filter(
      (id) =>
        !actions.has(id) &&
        (inDroppedRoots.has(id) ||
          (!remaining.has(id) &&
            book
              .occurrences(id)
              .some(
                ({ mark, node }) =>
                  mark.kind === 'insert' &&
                  typeof node.text === 'string' &&
                  node.text !== ''
              )))
    );

    if (taken.length > 0) {
      return { result: { ids, status: 'blocked', with: taken } };
    }
    const schema: InternalEditorSchemaApi = getEditorSchema(editor);

    try {
      schema.assertDocument(decidedValue);
    } catch (error) {
      if (isRefusal(error)) return { result: { ids, status: 'invalid' } };
      throw error;
    }

    const change = decidedChange(value, decidedValue, actions);

    return change.empty
      ? { result: { ids: [], status: 'unchanged' } }
      : {
          change,
          result: {
            ids: [
              ...new Set([
                ...resolution.decided,
                ...ids.filter((id) => !remaining.has(id)),
              ]),
            ],
            status: 'applied',
          },
        };
  };

  return definePlugin('authored', {
    dependencies: [authoredRecords],
    schema: authoredMarksSchema,
    contributions: [
      documentAdmissionPoint.of(authoredAdmission),
      authoredDocumentCapabilityPoint.of({
        claimsBreakBefore,
        project: (document, projection, schema) =>
          projectionRefusal(document, schema) ??
          projectAuthoredDocumentUnder(
            document,
            projection,
            ownershipResolveSchemaOf(schema)
          ),
      }),
    ],
    api: ({ editor }) => ({
      setView: (view: AuthoredView) => {
        const runtime = getEditorRuntime(editor);
        const state = stateOf(editor);
        const apply = (next: AuthoredView) => {
          state.pending.delete(runtime);
          state.views.set(runtime, next);
          notifyEditorViewState(editor, 'authored');
        };

        // Suggesting, and previews that decide changes, would mint values a
        // generating schema makes differently each time.
        if (
          ('preview' in view || view.intent === 'propose') &&
          constructsValues(getCompiledEditorSchema(editor))
        ) {
          publishEditorRefusal(editor, GENERATED_VALUES_REFUSAL);
          return;
        }
        if (!editor.read.view.isComposing()) {
          apply(view);
          return;
        }

        // Composed text records under the intent its composition began in.
        const waiting = state.pending.has(runtime);

        state.pending.set(runtime, view);
        if (waiting) return;

        const stop = subscribeEditorViewState(editor, () => {
          const next = state.pending.get(runtime);

          if (editor.read.view.isComposing()) return;
          stop();
          if (next) apply(next);
        });
      },
      subscribeRefusals: (listener: (refusal: AuthoredRefusal) => void) =>
        subscribeEditorRefusals(editor, (refusal) =>
          listener(refusal as AuthoredRefusal)
        ),
      subscribeChanges: (listener: (delta: AuthoredChangesDelta) => void) => {
        const runtime = getEditorRuntime(editor);
        let publisher = PUBLISHERS.get(runtime);

        if (!publisher) {
          const ledger = ledgerOf(editor);
          const listeners = new Set<(delta: AuthoredChangesDelta) => void>();

          ledger.subscribe(storedValue(editor));

          let delivered = ledger.publish(storedValue(editor));
          const stop = runtime.subscribe(() => {
            const delta = ledger.publish(storedValue(editor));

            if (delta === delivered) return;
            delivered = delta;

            const root = editor.read.view.root() ?? 'main';
            const blocks = delta.blocks.flatMap((block) => {
              const key = block.root === root ? editor.key([block.rank]) : null;

              return key ? [key] : [];
            });

            if (
              blocks.length === 0 &&
              delta.changed.length === 0 &&
              delta.groups.length === 0 &&
              delta.removed.length === 0
            ) {
              return;
            }

            const view: AuthoredChangesDelta = Object.freeze({
              blocks: Object.freeze(blocks),
              changed: delta.changed,
              groups: delta.groups,
              removed: delta.removed,
            });

            for (const each of [...listeners]) each(view);
          });

          publisher = { ledger, listeners, stop };
          PUBLISHERS.set(runtime, publisher);
        }

        const { ledger, listeners, stop } = publisher;

        listeners.add(listener);

        return () => {
          if (!listeners.delete(listener) || listeners.size > 0) return;
          stop();
          ledger.unsubscribe();
          PUBLISHERS.delete(runtime);
        };
      },
    }),
    read: ({ editor }) => ({
      view: () => viewOf(editor),
      change: (id: string) => changesOf(editor, storedValue(editor)).change(id),
      changes: (query: AuthoredQuery = {}): AuthoredPage => {
        const limit = query.limit ?? 50;

        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
          throw new Error('Authored page limit must be between 1 and 200.');
        }

        const book = changesOf(editor, storedValue(editor));
        const { cursor: _cursor, limit: _limit, ...rest } = query;
        const fingerprint = JSON.stringify(rest);
        const card =
          query.group === undefined ? null : book.groupOf(query.group)?.id;
        const at =
          query.at === undefined
            ? null
            : placeIds(editor, book, query.at).filter(
                (id) => card === null || book.groupOf(id)?.id === card
              );
        const matches = (id: string) => {
          const change = getDefined(book.change(id));

          return (
            query.authorId === undefined || change.authorId === query.authorId
          );
        };
        let start: string | null = null;
        let after = false;

        if (query.cursor !== undefined) {
          const [text, next, last] = readCursor(query.cursor);

          if (text !== fingerprint) {
            throw new Error('Stale authored page cursor.');
          }
          if (book.has(next) && (!at || at.includes(next))) {
            start = next;
          } else if (book.has(last) && (!at || at.includes(last))) {
            start = last;
            after = true;
          } else {
            throw new Error('Stale authored page cursor.');
          }
        }

        const ids = at
          ? at.slice(start === null ? 0 : at.indexOf(start) + (after ? 1 : 0))
          : book.idsFrom({ after, group: query.group, start });
        const items: AuthoredChange[] = [];
        let next: string | null = null;

        for (const id of ids) {
          if (!matches(id)) continue;
          if (items.length === limit) {
            next = id;
            break;
          }
          items.push(getDefined(book.change(id)));
        }

        return Object.freeze({
          cursor:
            next === null
              ? null
              : JSON.stringify([
                  fingerprint,
                  next,
                  getDefined(items.at(-1)).id,
                ]),
          items: Object.freeze(items),
        });
      },
      details: (id: string) => {
        const book = changesOf(editor, storedValue(editor));

        return readAuthoredDetails(
          {
            changes: { get: (change) => book.change(change) ?? undefined },
            occurrences: { get: (change) => book.occurrences(change) },
          },
          id
        );
      },
      groupOf: (changeId: string) =>
        changesOf(editor, storedValue(editor)).groupOf(changeId),
      groups: ({ at }: Readonly<{ at: Location | NodeKey }>) => {
        const book = changesOf(editor, storedValue(editor));
        const cards = new Map<string, AuthoredChangeGroup>();

        for (const id of placeIds(editor, book, at)) {
          const card = getDefined(book.groupOf(id));

          if (!cards.has(card.id)) cards.set(card.id, card);
        }

        return Object.freeze([...cards.values()]);
      },
      reviewOf: (node: unknown): AuthoredReview => {
        const facts = factsOf(storedValue(editor));
        const marks = marksOf(node, facts);

        return Object.freeze({
          accepted: Object.freeze(
            acceptedValues(
              node as Readonly<Record<string, unknown>>,
              standingClaimsOf(node, facts, facts).filter(
                (mark): mark is FormatTag => mark.kind === 'format'
              ),
              {
                accepted: (member) => isAccepted(facts, member),
                landed: facts.landed,
              }
            )
          ),
          hidden: isSettledDeletion(node, facts),
          marks,
        });
      },
    }),
    update: ({ editor, tx }) => {
      const apply = (decided: ReturnType<typeof decideOn>): AuthoredResult => {
        if (!('change' in decided)) return decided.result;

        const update = getActiveEditorUpdateId(editor);

        if (update) stateOf(editor).passThrough.add(update);
        try {
          tx.changes.apply(decided.change);
        } catch (error) {
          if (isRefusal(error)) {
            return { ids: decided.result.ids, status: 'invalid' };
          }
          throw error;
        }

        return decided.result;
      };

      return {
        decide: txStored(
          (decisions: AuthoredDecision | readonly AuthoredDecision[]) =>
            apply(decideOn(editor, tx.value(), decisions))
        ),
        withdraw: txStored((changes: readonly AuthoredChange[]) => {
          const author = authorOf(editor);

          if (changes.some((change) => change.authorId !== author)) {
            return {
              ids: changes.map((change) => change.id),
              status: 'invalid',
            } satisfies AuthoredResult;
          }

          return apply(
            decideOn(editor, tx.value(), { action: 'reject', changes }, true)
          );
        }),
        propose: txOnly((input: { changeId?: string } = {}) => {
          const state = stateOf(editor);
          const update = getActiveEditorUpdateId(editor);

          if (!update) {
            throw new Error('Authored proposals require an active update.');
          }

          if (input.changeId !== undefined && isEditingChange(input.changeId)) {
            throw new Error(
              `Authored change ids starting with ${editingChangeOf('')} are reserved for Editing.`
            );
          }

          const changeId = input.changeId ?? createChangeId();
          const value = tx.value();
          const claim = claimOf(value, changeId);
          const decided =
            !claim &&
            (state.marks.authorOf(changeId) !== null ||
              factsOf(value).decides(changeId));

          // A pending change takes more writes; an id decided before starts a
          // new incarnation, so its old claims and verdicts never touch it.
          state.forced.set(
            update,
            claim
              ? { at: claim.at, changeId, inc: claim.inc }
              : {
                  at: now(),
                  changeId,
                  inc: decided ? createIncarnationId() : undefined,
                }
          );

          return changeId;
        }),
      };
    },
    activate: ({ afterPublish, beforePublish, editor, onCleanup }) => {
      const owner = getEditorRuntimeOwner(editor);
      const state: AuthoredState = {
        forced: new WeakMap(),
        marks: createDocumentMarksValidator(),
        passThrough: new WeakSet(),
        pending: new WeakMap(),
        refused: new WeakMap(),
        views: new WeakMap(),
      };

      if (options.intent) {
        state.views.set(getEditorRuntime(owner), { intent: options.intent });
      }
      STATES.set(owner, state);
      onCleanup(() => STATES.delete(owner));
      const ledger = createReviewLedger(
        owner,
        () => authoredResolveSchemaOf(editor),
        state.marks
      );

      onCleanup(
        getEditorRuntime(owner).subscribeCommit((commit) => {
          if (
            rootNodesOf(commit.before, 'children') !==
            rootNodesOf(commit.after, 'children')
          ) {
            ledger.carry(commit);
          }
        })
      );

      onCleanup(
        registerAuthoredRuntime(owner, {
          mapFromView: (view, root, target) => {
            const current = viewOf(view);

            if (!('preview' in current)) return target;

            const shown = PointApi.isPoint(target)
              ? SelectionApi.text({ anchor: target, focus: target })
              : RangeApi.isRange(target)
                ? SelectionApi.text(target)
                : null;

            try {
              return (
                shown &&
                ledger.storedSelection(
                  storedValue(owner),
                  current.preview,
                  shown,
                  root
                )
              );
            } catch {
              // A point the shown document no longer holds selects nothing.
              return null;
            }
          },
          mapToView: (view, root, value) => {
            const current = viewOf(view);

            if (!('preview' in current)) return value;

            const map = ledger.locationMap(
              storedValue(owner),
              current.preview,
              root
            );

            try {
              if (PathApi.isPath(value)) return map.path(value) as typeof value;
              if (PointApi.isPoint(value)) {
                return map.point(value, -1) as typeof value;
              }

              return map.range(value) as typeof value;
            } catch {
              // A location the stored document no longer holds reads nothing.
              return null;
            }
          },
          readView: (view, read) => {
            const current = viewOf(view);

            if (!('preview' in current) || STORED_READS.has(owner)) {
              return read();
            }

            const stored = storedValue(owner);
            let shown: { root: string; selection: Selection } | undefined;
            const selected = () => {
              if (shown) return shown;

              const { root, selection } = withEditorDocumentProjection(
                owner,
                undefined,
                () => ({
                  root: getCurrentSelectionRoot(owner),
                  selection: getCurrentSelection(owner),
                })
              );

              shown = {
                root,
                selection: ledger.previewSelection(
                  stored,
                  current.preview,
                  selection,
                  root
                ),
              };

              return shown;
            };

            return withEditorDocumentProjection(
              owner,
              ledger.preview(stored, current.preview) as EditorDocumentValue,
              read,
              {
                get root() {
                  return selected().root;
                },
                get selection() {
                  return selected().selection;
                },
              }
            );
          },
          setView: (view, value) => {
            state.views.set(getEditorRuntime(view), value);
          },
          view: viewOf,
          viewCommit: (view, commit) => {
            const current = viewOf(view);

            return 'preview' in current
              ? ledger.previewCommit(commit, current.preview)
              : commit;
          },
        })
      );

      const passesThrough = () => {
        const update = getActiveEditorUpdateId(editor);

        return update !== null && state.passThrough.has(update);
      };

      let framed = false;

      beforePublish(() => {
        ({ framed } = ledger.prepare(editor.read.value()));
      });
      afterPublish(() => {
        if (framed) prepareCommandFrame(editor);
      });
      onCleanup(
        registerEditorDraftGuard(editor, (value) => ledger.check(value))
      );
      // A node's own marks decide, so live text inside a struck block reads.
      onCleanup(
        registerEditorContent(editor, (reader, node) => !isStruck(reader, node))
      );
      // Commands decide on the document with every pending change accepted.
      onCleanup(
        registerEditorCommandDocument(editor, {
          recorded: (input) => {
            ledger.recorded(input);

            const check = framedLawCheck();

            if (check !== '0') {
              assertFramedLaw(
                input,
                authoredResolveSchemaOf(editor),
                check !== 'content',
                () => ledger.projectionMap(input.stored.value, 'proposed')
              );
            }
          },
          project: (value) => {
            // A decision and a replay write the stored document as given, so
            // their corrections decide on it too.
            if (
              passesThrough() ||
              isReplay(getActiveEditorUpdateTags(editor))
            ) {
              return null;
            }

            return ledger.frame(value);
          },
          unplaced,
        })
      );
      // Every frame of one update records under the same change.
      const minted = new WeakMap<object, { at: number; changeId: string }>();
      onCleanup(
        registerEditorDocumentRecorder(editor, (input) => {
          if (isReplay(input.tags)) return null;
          // A decision records nothing, but a fragment it or its corrections
          // remove hands its cuts to its neighbours.
          if (passesThrough()) {
            const relink = relinkCuts(
              input.change,
              input.before,
              input.after,
              (root) => DocumentIndex.fromValue(valueRoot(input.after, root))
            );

            return relink
              ? {
                  change: input.change.compose(relink.change),
                  selection: input.selection,
                }
              : null;
          }

          const update = getActiveEditorUpdateId(editor);
          const forced = update ? (state.forced.get(update) ?? null) : null;
          const updateView = viewOf(getAuthoredUpdateView(editor));
          const before = input.before as JsonEditorValue;
          const after = input.after as JsonEditorValue;
          const contentChange = contentChangeOf(input.change);
          const steps = input.steps.map((step) => {
            const change = contentChangeOf(step.change);

            return change === step.change ? step : { ...step, change };
          });
          const contentSteps = steps.filter((step) => step.origin !== 'root');
          const ownRecords = getInternalDocumentChangeRecords(input.change);
          const known = factsOf(withStore(before, getValueRecords(after)));

          if ('preview' in updateView) {
            throw new Error('A preview view does not take this write.');
          }
          if (!input.projection) {
            const written = writtenNamedRoots(contentSteps);

            if (written.size > 0) {
              const dropped = ledger.dropped(before);

              if ([...written].some((root) => dropped.has(root))) {
                throw unplaced();
              }
            }
          }

          // Editing records what Suggesting records, under the writer's
          // reserved change, and accepts it in the same commit.
          const editing = !forced && updateView.intent === 'edit';
          const writer = authorOf(editor);

          if (writer === null) {
            throw new Error('An author ID is required for authored writes.');
          }
          const byName =
            contentChange.deleteRoots.size > 0
              ? new Set(
                  rootsDeletedByName(
                    getCompiledEditorSchema(editor),
                    input.projection?.value ?? before,
                    after,
                    changedRootsOf(contentChange),
                    contentChange.deleteRoots
                  )
                )
              : NO_ROOTS;

          if (!editing && byName.size > 0) {
            throw unrepresentable(
              'Suggesting cannot delete a named root; suggest deleting its content.'
            );
          }
          const followed: ReadonlySet<string> =
            byName.size === 0
              ? contentChange.deleteRoots
              : new Set(
                  [...contentChange.deleteRoots].filter(
                    (root) => !byName.has(root)
                  )
                );
          // Neither net set names these roots, yet the recorder can keep their
          // owner, such as a struck paragraph whose pending retype makes it the
          // pasted card, so each records as created and follows its owner.
          const createdThenDeleted = new Set(
            steps.flatMap((step) =>
              [...step.change.createRoots].filter(
                (root) =>
                  !contentChange.createRoots.has(root) && !before.roots?.[root]
              )
            )
          );
          const createRoots =
            createdThenDeleted.size === 0
              ? contentChange.createRoots
              : new Set([...contentChange.createRoots, ...createdThenDeleted]);
          const withdrawable =
            createdThenDeleted.size === 0
              ? followed
              : new Set([...followed, ...createdThenDeleted]);

          if (!editing) {
            // Vetoes keep a person's Suggesting out of blocks review marks
            // cannot hold yet; a proposal forced from Editing, such as an AI
            // preview, records as before.
            const vetoes =
              options.vetoes === false || updateView.intent !== 'propose'
                ? []
                : getPluginContributions(editor, authoredVeto);
            const refusal =
              (update && state.refused.get(update)) ??
              (constructsValues(getCompiledEditorSchema(editor))
                ? GENERATED_VALUES_REFUSAL
                : vetoes.length > 0
                  ? proposalRefusal(contentSteps, vetoes)
                  : null);

            if (refusal) {
              if (update) state.refused.set(update, refusal);
              throw new EditorRefusalError(refusal, refusal.message);
            }
          }

          const focusBefore =
            input.selectionBefore?.kind === 'text' &&
            PointApi.equals(
              input.selectionBefore.anchor,
              input.selectionBefore.focus
            )
              ? input.selectionBefore.focus
              : null;
          const selectionPosition = focusBefore
            ? positionOf(before, input.selectionBeforeRoot, focusBefore)
            : null;
          const minting = minted.get(input.update) ?? {
            at: forced?.at ?? now(),
            changeId: editing ? editingChangeOf(writer) : createChangeId(),
          };

          minted.set(input.update, minting);
          const { at, changeId } = minting;
          const dependencies = createDependencies(known, carriedIn(after));
          let commitWrite: string | undefined;
          const commitWriteId = () => (commitWrite ??= createTagId());
          // An Editing commit's own write lands with it.
          const landedHere = (write: string) =>
            (editing && write === commitWrite) || known.landed(write);
          const standing: Standing = {
            accepted: (member) => isAccepted(known, member),
            landed: landedHere,
          };
          const recorded = recordAuthoredSteps({
            before,
            changeId,
            createRoots,
            createTagId,
            deleteRoots: byName,
            dependencies,
            fill: (site, root) =>
              completeChildrenAt(editor, site.map(elementOf), [], root)
                .children,
            followed,
            forcedChangeId: forced?.changeId ?? (editing ? changeId : null),
            projection: input.projection,
            inc: forced?.inc ?? null,
            isInline: (props) =>
              getEditorSchema(editor).isInline(elementOf(props)),
            emptyTextKeeps: (key, value, parents, root) => {
              const [parent, ...ancestors] = parents.map(elementOf);

              return !emptyTextDrops(getEditorSchema(editor), {
                ancestors,
                parent,
                root,
              })?.(key, value);
            },
            keepsOnSplit: ({ continuation, path, reviewDraft, source }, root) =>
              getEditorSchema(editor).elementSplitKeepsAt(
                elementOf(source),
                elementOf(continuation),
                {
                  children: reviewDraft as readonly Descendant[],
                  path: [...path],
                  root,
                }
              ),
            now: at,
            oneText: (type) => {
              const content = getEditorSchema(editor).getElementContent(type);

              return content?.max === 1 && content.allowsText;
            },
            ownedRoots: (props) => {
              const schema: InternalEditorSchemaApi = getEditorSchema(editor);

              return schema
                .getElementOwnedRoots(props as Element)
                .map(({ ownership, root }) => ({
                  exclusive: ownership === 'exclusive',
                  root,
                }));
            },
            selectionBefore:
              selectionPosition === null
                ? null
                : {
                    position: selectionPosition,
                    root: input.selectionBeforeRoot,
                  },
            standing,
            steps,
            commitWriteId,
            writer,
          });
          // Map only through the recorded change: the recorder slot's finalize
          // then applies the canonical pass and maps the selection through it.
          const map = {
            after,
            indexes: recorded.indexedAfter,
            map: recorded.mapPosition,
            root: input.selectionRoot,
          };
          const selection = mapSelection(input.selection, map);

          const kept = [
            ...new Set([
              ...Object.keys(before.roots ?? {}),
              ...recorded.indexedAfter.keys(),
            ]),
          ].filter((root) => root !== 'main' && !byName.has(root));
          const beforeRecords = getValueRecords(before);
          const valueWith = (
            roots: readonly string[],
            indexes: ReadonlyMap<string, DocumentIndex>
          ) => {
            const next = copyFields({}, before, ['records', 'roots']);

            setLazyRoot(
              next,
              'children',
              indexes.get('main') ?? rootIndexOf(before, 'children')
            );
            if (roots.length > 0) {
              next.roots = Object.fromEntries(
                roots.map((root) => [
                  root,
                  indexes.get(root)?.value ?? valueRoot(before, root),
                ])
              );
            }

            return withValueRecords(next, beforeRecords) as typeof before;
          };
          const withdrawn =
            withdrawable.size > 0
              ? orphanedValueRoots(
                  getCompiledEditorSchema(editor),
                  before,
                  valueWith(kept, recorded.indexedAfter),
                  changedRootsOf(recorded.change),
                  createdThenDeleted
                ).filter((root) => withdrawable.has(root))
              : [];
          const roots =
            withdrawn.length > 0
              ? kept.filter((root) => !withdrawn.includes(root))
              : kept;
          const valueOf = (indexes: ReadonlyMap<string, DocumentIndex>) =>
            valueWith(roots, indexes);
          const unborn = withdrawn.filter((root) =>
            createdThenDeleted.has(root)
          );
          const deleted = withdrawn.filter(
            (root) => !createdThenDeleted.has(root)
          );
          const born =
            unborn.length > 0
              ? filterDocumentChangeRoots(
                  recorded.change,
                  (root) => !unborn.includes(root)
                )
              : recorded.change;
          const recordedChange =
            deleted.length > 0
              ? born.compose(
                  createInternalDocumentChange(new Map(), {
                    deleteRoots: deleted,
                  })
                )
              : born;
          const written = valueOf(recorded.indexedAfter);
          const relink = relinkCuts(
            recordedChange,
            before,
            written,
            (root) =>
              recorded.indexedAfter.get(root) ??
              DocumentIndex.fromValue(valueRoot(written, root))
          );
          const change = relink
            ? recordedChange.compose(relink.change)
            : recordedChange;
          const indexes = relink
            ? new Map([...recorded.indexedAfter, ...relink.indexes])
            : recorded.indexedAfter;
          const writtenPlain = editing && recorded.writtenPlain;
          const filled = writtenPlain
            ? null
            : completeProposed({
                after: valueOf(indexes),
                before,
                change,
                dependencies,
                editor,
                indexes,
                mark: {
                  at,
                  author: writer,
                  change: forced?.changeId ?? changeId,
                  ...(forced?.inc === undefined ? {} : { inc: forced.inc }),
                },
                standing,
                commitWriteId,
              });
          const content = filled ? change.compose(filled.change) : change;
          const writtenIndexes = filled?.indexes ?? indexes;
          const accepted =
            editing && !writtenPlain
              ? acceptOwn(content, writtenIndexes, dependencies, {
                  ...known,
                  landed: landedHere,
                })
              : null;
          // Accepting removes fragments outright, whose cuts move to the
          // fragments that stay.
          const relinkedOwn =
            accepted &&
            relinkCuts(
              accepted.change,
              valueOf(writtenIndexes),
              valueOf(accepted.indexes),
              (root) =>
                accepted.indexes.get(root) ??
                DocumentIndex.fromValue(
                  valueRoot(valueOf(accepted.indexes), root)
                ),
              (root) =>
                writtenIndexes.get(root) ??
                DocumentIndex.fromValue(valueRoot(before, root))
            );
          const owned =
            accepted && relinkedOwn
              ? {
                  change: accepted.change.compose(relinkedOwn.change),
                  indexes: new Map([
                    ...accepted.indexes,
                    ...relinkedOwn.indexes,
                  ]),
                  landed: accepted.landed,
                }
              : accepted;
          const through =
            (changes: ReadonlyArray<DocumentChange | undefined>) =>
            (root: string, position: number, assoc: -1 | 1) =>
              changes.reduce(
                (mapped, later) =>
                  (later &&
                    getInternalDocumentRootChange(later, root)?.mapPos(
                      mapped,
                      assoc
                    )) ??
                  mapped,
                position
              );
          const mapPosition = (root: string, position: number, assoc: -1 | 1) =>
            through([relink?.change, filled?.change, owned?.change])(
              root,
              recorded.mapPosition(root, position, assoc, false),
              assoc
            );
          const filledSelection = filled
            ? mapSelection(selection, {
                after: valueOf(indexes),
                indexes: filled.indexes,
                map: through([filled.change]),
                root: input.selectionRoot,
              })
            : selection;

          const later = owned ? content.compose(owned.change) : content;
          const indexedAfter = owned?.indexes ?? writtenIndexes;
          // The context records the writes rest on go with them, so no
          // node ever points at a record its document lacks. An Editing
          // format write over pending tags lands with its commit, so a tag
          // over it reads it after it leaves the key, until an undo takes
          // both back.
          const records = [
            putContexts(restedOn(dependencies.minted(), later, indexedAfter)),
            putLanded([
              ...(editing && commitWrite !== undefined
                ? [landedOf({ at, change: changeId, id: commitWrite })]
                : []),
              ...(owned?.landed ?? []),
            ]),
          ].reduce(composeRecordOps, ownRecords);

          return {
            anchorChange: (plainAfter) =>
              [filled?.change, owned?.change].reduce(
                (anchor: DocumentChange, next) =>
                  next ? anchor.compose(next) : anchor,
                recorded.anchorChange(plainAfter)
              ),
            change: withDocumentChangeRecords(later, records),
            indexedAfter,
            mapPosition,
            // A caret where accepting removes the writer's struck run stays on
            // the line after it, as in the frame.
            selection: owned
              ? mapSelection(
                  filledSelection,
                  {
                    after: valueOf(writtenIndexes),
                    indexes: owned.indexes,
                    map: through([owned.change]),
                    root: input.selectionRoot,
                  },
                  1
                )
              : filledSelection,
          };
        })
      );
    },
  });
};

/** Suggestions recorded as review marks in the document. */
export const authored = (options: AuthoredOptions): AuthoredPlugin =>
  createAuthoredPlugin({ authorId: options.authorId });
