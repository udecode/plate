import { authoredDocumentCapabilityPoint } from '../core/authored-document-capability';
import {
  getAuthoredUpdateView,
  registerAuthoredRuntime,
} from '../core/authored-runtime';
import { type AuthoredVeto, authoredVeto } from '../core/authored-veto';
import {
  createInternalDocumentChange,
  DocumentChange,
  filterDocumentChangeRoots,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRanges,
  getInternalDocumentRootChange,
  valueRoot,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import { deepFreeze, jsonEqual } from '../core/change/json';
import type { RootChange } from '../core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import {
  type EditorFrameRecording,
  registerEditorCommandDocument,
} from '../core/command-document';
import { createEditorCommit, getEditorCommitValue } from '../core/commit';
import { registerEditorContent } from '../core/content';
import { documentAdmissionPoint } from '../core/document-admission';
import {
  registerEditorDocumentRecorder,
  registerEditorDraftGuard,
} from '../core/document-recorder';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorSchema,
} from '../core/editor-runtime';
import type { InternalEditorSchemaApi } from '../core/editor-schema';
import { definePlugin } from '../core/plugin';
import {
  getCompiledEditorSchema,
  getPluginContributions,
} from '../core/plugin-registry';
import {
  getActiveEditorUpdateId,
  getActiveEditorUpdateTags,
  getEditorProjectionSnapshotIndex,
  hasEditorProjectionSnapshotIndex,
  inheritEditorProjectionIndexes,
  notifyEditorViewState,
  subscribeEditorViewState,
  withEditorDocumentProjection,
} from '../core/public-state';
import {
  EditorRefusalError,
  publishEditorRefusal,
  subscribeEditorRefusals,
} from '../core/refusal';
import { completeChildrenAt, emptyTextDrops } from '../core/representation';
import { EditorSchemaValidationError } from '../core/schema-validation';
import { txOnly, type TxOnlyMethod, txStored } from '../core/tx-only';
import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorSnapshot,
  Plugin,
  PluginDependencyReferenceFor,
  Selection,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { isMetadataRootKey } from '../internal/root-location';
import {
  type AuthoredChangeIndex,
  groupAuthoredChanges,
  indexAuthoredChanges,
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
  isSettledDeletion,
  marksOf,
  primeInsertions,
  type ReviewFacts,
} from './facts/facts';
import {
  appendRecords,
  authoredRecords,
  carryRecords,
  CONTEXTS_ROOT,
  type ContextRecord,
  contextElementOf,
  incarnationOf,
  verdictElementOf,
  VERDICTS_ROOT,
} from './facts/records';
import {
  type AuthoredLocationMap,
  authoredLocationMap,
  projectAuthoredDocument,
  projectionRefusal,
} from './format';
import {
  type AuthoredRefusal,
  constructsValues,
  GENERATED_VALUES_REFUSAL,
  proposalRefusal,
  unrepresentable,
} from './refusal';
import { authoredResolveSchemaOf } from './resolve-schema';
import {
  characterAlignedChange,
  createCommandProjector,
  structuralAcceptedChange,
} from './tree/command-projection';
import { relinkCuts } from './tree/cuts';
import { acceptedValues, type FormatTag } from './tree/layers';
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
  projectAuthoredValue,
  isTextBlock,
  resolveAuthoredChildren,
  resolveAuthoredValue,
} from './tree/resolve';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangeGroup,
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
  changes: (query?: AuthoredQuery) => AuthoredPage;
  changesAt: (range: Range) => readonly AuthoredChange[];
  details: (id: string) => AuthoredChangeDetails | null;
  /** Pending changes as cards show them, each with its palette rank. */
  groups: () => readonly AuthoredChangeGroup[];
  preview: (
    decisions: AuthoredDecision | readonly AuthoredDecision[]
  ) => AuthoredResult;
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
  decide: (
    decisions: AuthoredDecision | readonly AuthoredDecision[]
  ) => AuthoredResult;
  /** Record this update's writes under one change, whatever the intent. */
  propose: TxOnlyMethod<(options?: { changeId?: string }) => string>;
};

export type AuthoredPlugin = Plugin<{
  activate: true;
  api: {
    setView: (view: AuthoredView) => void;
    /** Calls the listener with the ids of changes a commit added, changed or removed. */
    subscribeChanges: (
      listener: (changeIds: readonly string[]) => void
    ) => () => void;
    /**
     * Calls the listener with each Suggesting change the editor refused
     * whole, after it rolled back, and with each view switch it refused.
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
      const mark = claimsOf(node, facts).find((item) => item.change === change);

      if (mark) return mark;

      const nested = find(
        (node as { children?: readonly unknown[] }).children ?? []
      );

      if (nested) return nested;
    }

    return null;
  };

  return find([
    ...value.children,
    ...Object.entries(value.roots ?? {}).flatMap(([root, children]) =>
      isMetadataRootKey(root) ? [] : children
    ),
  ]);
};

const positionOf = (value: JsonEditorValue, root: string, point: Point) =>
  DocumentIndex.fromValue(valueRoot(value, root)).positionAt(point);

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

  const { paths } = SelectionApi.nodes([first, ...rest]);
  const endpoint = (path: Path, fallback: Path) => {
    const mapped = mapPath(path);

    return mapped && paths.some((kept) => PathApi.equals(kept, mapped))
      ? mapped
      : fallback;
  };

  return SelectionApi.nodes(paths, {
    anchorPath: endpoint(selection.anchorPath, paths[0]),
    focusPath: endpoint(selection.focusPath, paths.at(-1) ?? paths[0]),
    ...(selection.root === undefined ? {} : { root: selection.root }),
  });
};

// Tests that count work turn the check off with PLITE_LAW_CHECK=0, because its
// projection reads every mark again.
const checksFramedLaw = () => {
  const env = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env;

  return env?.NODE_ENV === 'test' && env.PLITE_LAW_CHECK !== '0';
};

const assertFramedLaw = (
  input: EditorFrameRecording,
  schema: AuthoredResolveSchema
) => {
  const { frame, root, stored } = input;
  const written = contentOf(stored.value as JsonEditorValue);
  const accepted = contentOf(
    projectAuthoredValue(stored.value as JsonEditorValue, 'proposed', schema)
      .value
  );

  if (!jsonEqual(accepted, contentOf(frame.value as JsonEditorValue))) {
    throw new Error(
      `A framed recording does not accept to what its commands wrote: ${JSON.stringify(
        { accepted: accepted.children, wrote: frame.value.children }
      )}`
    );
  }
  if (frame.selection?.kind !== 'text' || stored.selection?.kind !== 'text') {
    return;
  }

  const change = structuralAcceptedChange(written, accepted);

  if (!change) return;

  const rootChange = getInternalDocumentRootChange(change, root);
  const index = DocumentIndex.fromValue(valueRoot(accepted, root));

  for (const edge of ['anchor', 'focus'] as const) {
    const position = positionOf(written, root, stored.selection[edge]);
    const mapped = rootChange?.mapPos(position, -1) ?? position;
    const expected = frame.selection[edge];

    // A caret at a struck leaf's edge maps between leaves, where it reads as
    // the end of one or the start of the next.
    if (
      !([-1, 1] as const).some((assoc) => {
        const point = index.pointAt(mapped, assoc);

        return point !== null && PointApi.equals(point, expected);
      })
    ) {
      throw new Error(
        `A framed recording does not accept to its commands' ${edge}.`
      );
    }
  }
};

// Every read of one stored document shares its index and projections. A
// read builds a new document envelope each time, so they key on its root
// arrays, which stay the same until the document changes.
const DOCUMENT_KEYS = new WeakMap<
  object,
  Readonly<{ key: object; roots: ReadonlyArray<[string, unknown]> }>
>();
const INDEXES = new WeakMap<object, AuthoredChangeIndex>();
const PROJECTIONS = new WeakMap<
  object,
  Partial<Record<'accepted' | 'proposed', JsonEditorValue>>
>();

const documentKeyOf = (value: JsonEditorValue) => {
  const roots = Object.entries(value.roots ?? {});
  const cached = DOCUMENT_KEYS.get(value.children);

  if (
    cached &&
    cached.roots.length === roots.length &&
    cached.roots.every(
      ([root, children], index) =>
        roots[index][0] === root && roots[index][1] === children
    )
  ) {
    return cached.key;
  }

  const key = {};

  DOCUMENT_KEYS.set(value.children, { key, roots });
  return key;
};

// Owners reading their stored document, which their own preview would
// otherwise project the review marks out of.
const STORED_READS = new WeakSet<Editor>();

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

const changeIndexOf = (value: JsonEditorValue) => {
  const key = documentKeyOf(value);
  let index = INDEXES.get(key);

  if (!index) {
    index = indexAuthoredChanges(value);
    INDEXES.set(key, index);
  }

  return index;
};

const projectionOf = (
  editor: Editor,
  value: JsonEditorValue,
  projection: 'accepted' | 'proposed'
) => {
  const key = documentKeyOf(value);
  const cached = PROJECTIONS.get(key) ?? {};
  const projected =
    cached[projection] ??
    deepFreeze(
      projectAuthoredValue(value, projection, authoredResolveSchemaOf(editor))
        .value
    );

  cached[projection] = projected;
  PROJECTIONS.set(key, cached);

  return projected;
};

type Outcome = 'accept' | 'reject';

/**
 * The change from a stored document to `decided`, the same document with each
 * pending change taken by `outcomeOf`. Accepting maps a position through the
 * merges, so a caret after a letter typed at a pending join stays after it,
 * and every kept letter keeps its place for anchors and the selection.
 */
const decidedChange = (
  value: JsonEditorValue,
  decided: JsonEditorValue,
  outcomeOf: (mark: AuthoredMark) => Outcome | undefined
) => {
  const facts = factsOf(value);
  const stored = contentOf(value);
  const target = contentOf(decided);
  const content =
    structuralAcceptedChange(stored, target) ??
    characterAlignedChange(stored, target, {
      joins: (node) =>
        marksOf(node, facts).some(
          (mark) =>
            (mark.kind === 'join' && outcomeOf(mark) === 'accept') ||
            (mark.kind === 'split' && outcomeOf(mark) === 'reject')
        ),
      removes: (node) =>
        marksOf(node, facts).some(
          (mark) =>
            (mark.kind === 'insert' && outcomeOf(mark) === 'reject') ||
            (mark.kind === 'delete' && outcomeOf(mark) === 'accept')
        ),
    }) ??
    DocumentChange.between(stored, target, {
      isSetValued: isAuthoredSetValued,
    });

  return [CONTEXTS_ROOT, VERDICTS_ROOT].reduce((change, root) => {
    const appended = appendRecords(
      value,
      root,
      (decided.roots?.[root] ?? []).slice(value.roots?.[root]?.length ?? 0)
    );

    return appended ? change.compose(appended) : change;
  }, content);
};

/** `value` without its metadata roots, which a decision only appends to. */
const contentOf = (value: JsonEditorValue): JsonEditorValue => {
  if (!value.roots) return value;

  const { roots, ...plain } = value;
  const content = Object.entries(roots).filter(
    ([root]) => !isMetadataRootKey(root)
  );

  return content.length === 0
    ? plain
    : { ...plain, roots: Object.fromEntries(content) };
};

const contentChangeOf = (change: DocumentChange) =>
  [
    ...change.createRoots,
    ...change.deleteRoots,
    ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
  ].some(isMetadataRootKey)
    ? filterDocumentChangeRoots(change, (root) => !isMetadataRootKey(root))
    : change;

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

  // A kept join or split on the run's first block lands on the one before it,
  // and one in the run lands past blocks whose deletion is settled.
  while (
    start > 0 &&
    (holdsOwnStructure(getDefined(siblings[start]), facts) ||
      (structural && isSettledDeletion(getDefined(siblings[start]), facts)))
  ) {
    start -= 1;
  }

  return {
    from: start,
    path,
    to: to < siblings.length && isTextBlock(siblings[to]) ? to + 1 : to,
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
    for (const [, , from, to] of getInternalDocumentChangeRanges(
      change,
      root
    )) {
      for (const { path } of index.nodeRangesTouching(from, to)) {
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
  const minted = dependencies.minted();
  const facts =
    minted.length === 0
      ? base
      : {
          ...base,
          contexts: new Map([
            ...base.contexts,
            ...minted.map((record) => [record.ctx, record] as const),
          ]),
        };
  const outcome = (id: string) => (isEditingChange(id) ? 'accept' : 'keep');
  const own = (kind: AuthoredMark['kind']) => (node: unknown) =>
    claimsOf(node, facts).some(
      (mark) => mark.kind === kind && isEditingChange(mark.change)
    );
  const settledBy = { joins: own('join'), removes: own('delete') };
  const changes = new Map<string, RootChange>();
  const accepted = new Map(indexes);

  for (const [root, index] of indexes) {
    const rootChange = getInternalDocumentRootChange(change, root);

    if (!rootChange) continue;

    // A run whose element the resolution would change resolves one level up.
    const resolveRun = (first: OwnRun) => {
      for (let run = first; ;) {
        const nodes = childrenOf(index, run.path).slice(run.from, run.to);

        if (run.path.length === 0) {
          return {
            nodes,
            result: resolveAuthoredChildren(nodes, outcome, null, root, {
              dependencies,
              facts,
            }).children,
            run,
          };
        }

        const shell: JsonNode = {
          ...nodePropsOf(index.node(run.path)),
          children: [...nodes],
        };
        const [only, ...rest] = resolveAuthoredChildren(
          [shell],
          outcome,
          null,
          root,
          { dependencies, facts }
        ).children;

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
        characterAlignedChange(stored, settled, settledBy) ??
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
      };
};

const incarnationsOf = (index: AuthoredChangeIndex, id: string) =>
  new Map(
    (index.occurrences.get(id) ?? []).map(({ mark }) => [
      incarnationOf(mark),
      mark,
    ])
  ).values();

const withVerdicts = (
  value: JsonEditorValue,
  verdicts: readonly JsonNode[]
): JsonEditorValue =>
  verdicts.length === 0
    ? value
    : ({
        ...value,
        roots: {
          ...value.roots,
          [VERDICTS_ROOT]: [
            ...(value.roots?.[VERDICTS_ROOT] ?? []),
            ...verdicts,
          ],
        },
      } as JsonEditorValue);

const PREVIEW_MAPS = new WeakMap<object, Map<string, AuthoredLocationMap>>();

const previewMapOf = (
  editor: Editor,
  value: JsonEditorValue,
  preview: 'accepted' | 'proposed',
  root: string
) => {
  const key = documentKeyOf(value);
  const maps = PREVIEW_MAPS.get(key) ?? new Map<string, AuthoredLocationMap>();
  let map = maps.get(`${preview}:${root}`);

  if (!map) {
    const projected = projectionOf(editor, value, preview);
    const outcome: Outcome = preview === 'proposed' ? 'accept' : 'reject';

    map = authoredLocationMap(
      value,
      projected,
      decidedChange(value, projected, () => outcome),
      root
    );
    maps.set(`${preview}:${root}`, map);
    PREVIEW_MAPS.set(key, maps);
  }

  return map;
};

const projectionSnapshot = (
  owner: Editor,
  value: EditorDocumentValue,
  version: number
): EditorSnapshot => {
  let index: EditorSnapshot['index'] | undefined;

  return Object.freeze({
    children: value.children,
    selection: null,
    version,
    get index() {
      return (index ??= getEditorProjectionSnapshotIndex(
        owner,
        value.children
      ));
    },
  });
};

const PREVIEW_COMMITS = new WeakMap<
  EditorCommit,
  Partial<Record<'accepted' | 'proposed', EditorCommit>>
>();

const carryProjection = (
  owner: Editor,
  before: JsonEditorValue,
  stored: JsonEditorValue,
  preview: 'accepted' | 'proposed'
) => {
  const key = documentKeyOf(stored);
  const changes = DocumentChange.between(
    before,
    projectionOf(owner, stored, preview)
  );
  const after = changes.empty ? before : changes.apply(before);

  PROJECTIONS.set(key, { ...PROJECTIONS.get(key), [preview]: after });
  if (!changes.empty) {
    inheritEditorProjectionIndexes(
      owner,
      before as EditorDocumentValue,
      after as EditorDocumentValue,
      changes
    );
  }

  return { after, changes };
};

const previewCommit = (
  owner: Editor,
  commit: EditorCommit,
  preview: 'accepted' | 'proposed'
) => {
  const cached = PREVIEW_COMMITS.get(commit) ?? {};

  if (cached[preview]) return cached[preview];

  const before = projectionOf(
    owner,
    getEditorCommitValue(commit, 'before'),
    preview
  );
  const { after, changes } = carryProjection(
    owner,
    before,
    getEditorCommitValue(commit),
    preview
  );

  const projected = createEditorCommit(
    {
      after: projectionSnapshot(
        owner,
        after as EditorDocumentValue,
        commit.version
      ),
      afterValue: after,
      annotations: commit.annotations,
      before: projectionSnapshot(
        owner,
        before as EditorDocumentValue,
        commit.previousVersion
      ),
      beforeValue: before,
      changes,
      dirtyStateKeys: commit.dirtyStateKeys,
      editor: owner,
      effects: commit.effects,
      replace: commit.changed.hasAny('replace'),
      selectionAfter: null,
      selectionAfterRoot: 'main',
      selectionBefore: null,
      selectionBeforeRoot: 'main',
      selectionChanged: false,
      tags: commit.tags,
    },
    { previousVersion: commit.previousVersion, version: commit.version }
  );

  cached[preview] = projected;
  PREVIEW_COMMITS.set(commit, cached);

  return projected;
};

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
    decisions: AuthoredDecision | readonly AuthoredDecision[]
  ):
    | Readonly<{ result: AuthoredResult }>
    | Readonly<{
        change: DocumentChange;
        result: AuthoredResult;
      }> => {
    const index = changeIndexOf(value);
    const actions = new Map<string, 'accept' | 'reject'>();
    let conflicting = false;

    for (const decision of [decisions].flat()) {
      for (const { id } of decision.changes) {
        conflicting ||=
          (actions.get(id) ?? decision.action) !== decision.action;
        actions.set(id, decision.action);
      }
    }

    const ids = [...actions.keys()];

    if (conflicting) return { result: { ids, status: 'invalid' } };

    const stale = [decisions]
      .flat()
      .flatMap((decision) => decision.changes)
      .filter(
        (change) => index.changes.get(change.id)?.revision !== change.revision
      );

    if (stale.length > 0) {
      return {
        result: {
          ids: [...new Set(stale.map((change) => change.id))],
          status: 'stale',
        },
      };
    }

    let resolution: ReturnType<typeof resolveAuthoredValue>;

    try {
      resolution = resolveAuthoredValue(
        value,
        (change) => actions.get(change) ?? 'keep',
        authoredResolveSchemaOf(editor),
        { holdsRejectedDeletions: true }
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

    const verdicts = [...actions].flatMap(([id, verdict]) =>
      [...incarnationsOf(index, id)].map(({ at, change, inc }) =>
        verdictElementOf({
          member: inc === undefined ? { at, change } : { at, change, inc },
          verdict,
        })
      )
    );
    const decidedValue = withVerdicts(resolution.value, verdicts);
    // A change whose inserted text the decision removes, such as text typed
    // inside a rejected insertion, goes only when it is decided too. An empty
    // block completion built holds nothing to lose.
    const remaining = changeIndexOf(decidedValue).changes;
    const taken = [...index.changes.keys()].filter(
      (id) =>
        !actions.has(id) &&
        !remaining.has(id) &&
        index.occurrences
          .get(id)
          ?.some(
            ({ mark, node }) =>
              mark.kind === 'insert' &&
              typeof node.text === 'string' &&
              node.text !== ''
          )
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

    const change = decidedChange(value, decidedValue, (mark) =>
      actions.get(mark.change)
    );

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
        project: (document, projection, schema) =>
          projectionRefusal(document, schema) ??
          projectAuthoredDocument(document, { projection }),
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
      subscribeChanges: (listener: (changeIds: readonly string[]) => void) => {
        let previous = changeIndexOf(storedValue(editor));

        return getEditorRuntime(editor).subscribe(() => {
          const next = changeIndexOf(storedValue(editor));

          if (next === previous) return;

          const changed = [
            ...new Set([...previous.changes.keys(), ...next.changes.keys()]),
          ].filter(
            (id) =>
              previous.changes.get(id)?.revision !==
              next.changes.get(id)?.revision
          );

          previous = next;
          if (changed.length > 0) listener(changed);
        });
      },
    }),
    read: ({ editor }) => ({
      view: () => viewOf(editor),
      change: (id: string) =>
        changeIndexOf(storedValue(editor)).changes.get(id) ?? null,
      changes: (query: AuthoredQuery = {}): AuthoredPage => {
        const limit = query.limit ?? 50;

        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
          throw new Error('Authored page limit must be between 1 and 200.');
        }

        const matching = changeIndexOf(storedValue(editor)).ordered.filter(
          (change) =>
            (query.authorId === undefined ||
              change.authorId === query.authorId) &&
            (query.from === undefined || change.createdAt >= query.from) &&
            (query.to === undefined || change.createdAt <= query.to)
        );
        const start = query.cursor
          ? matching.findIndex((change) => change.id === query.cursor) + 1
          : 0;

        if (query.cursor && start === 0) {
          throw new Error('Stale authored page cursor.');
        }

        const items = matching.slice(start, start + limit);

        return Object.freeze({
          cursor:
            start + limit < matching.length ? (items.at(-1)?.id ?? null) : null,
          items: Object.freeze(items),
        });
      },
      changesAt: (range: Range) =>
        Object.freeze(
          changeIndexOf(storedValue(editor)).ordered.filter((change) =>
            change.ranges.some(
              (candidate) => RangeApi.intersection(candidate, range) !== null
            )
          )
        ),
      details: (id: string) =>
        readAuthoredDetails(changeIndexOf(storedValue(editor)), id),
      groups: () => groupAuthoredChanges(changeIndexOf(storedValue(editor))),
      preview: (decisions: AuthoredDecision | readonly AuthoredDecision[]) =>
        decideOn(editor, storedValue(editor), decisions).result,
      reviewOf: (node: unknown): AuthoredReview => {
        const facts = factsOf(storedValue(editor));
        const marks = marksOf(node, facts);

        return Object.freeze({
          accepted: Object.freeze(
            acceptedValues(
              marks.filter((mark): mark is FormatTag => mark.kind === 'format')
            )
          ),
          hidden: isSettledDeletion(node, facts),
          marks,
        });
      },
    }),
    update: ({ editor, tx }) => ({
      decide: txStored(
        (
          decisions: AuthoredDecision | readonly AuthoredDecision[]
        ): AuthoredResult => {
          const decided = decideOn(editor, tx.value(), decisions);

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
        }
      ),
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
            factsOf(value).decidedChangeIds.has(changeId));

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
    }),
    activate: ({ beforePublish, editor, onCleanup }) => {
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
      const carryReadPreviewKeys = (commit: EditorCommit) => {
        if (commit.before.children === commit.after.children) return;

        const projected = PROJECTIONS.get(
          documentKeyOf(getEditorCommitValue(commit, 'before'))
        );

        for (const preview of ['accepted', 'proposed'] as const) {
          const before = projected?.[preview];

          if (
            before &&
            hasEditorProjectionSnapshotIndex(
              owner,
              (before as EditorDocumentValue).children
            )
          ) {
            previewCommit(owner, commit, preview);
          }
        }
      };

      onCleanup(getEditorRuntime(owner).subscribeCommit(carryReadPreviewKeys));

      onCleanup(
        registerAuthoredRuntime(owner, {
          mapToView: (view, root, value) => {
            const current = viewOf(view);

            if (!('preview' in current)) return value;

            const map = previewMapOf(
              owner,
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

            return 'preview' in current && !STORED_READS.has(owner)
              ? withEditorDocumentProjection(
                  owner,
                  projectionOf(
                    owner,
                    storedValue(owner),
                    current.preview
                  ) as EditorDocumentValue,
                  read,
                  { root: 'main', selection: null }
                )
              : read();
          },
          setView: (view, value) => {
            state.views.set(getEditorRuntime(view), value);
          },
          view: viewOf,
          viewCommit: (view, commit) => {
            const current = viewOf(view);

            return 'preview' in current
              ? previewCommit(owner, commit, current.preview)
              : commit;
          },
        })
      );

      const assertDocumentMarks = state.marks.validate;
      const passesThrough = () => {
        const update = getActiveEditorUpdateId(editor);

        return update !== null && state.passThrough.has(update);
      };

      beforePublish(() => {
        const value = editor.read.value();

        assertDocumentMarks(value);
        primeInsertions(value);
      });
      onCleanup(registerEditorDraftGuard(editor, assertDocumentMarks));
      // A node's own marks decide, so live text inside a struck block reads.
      onCleanup(
        registerEditorContent(editor, (reader, node) => !isStruck(reader, node))
      );
      // Commands decide on the document with every pending change accepted.
      const project = createCommandProjector(
        () => authoredResolveSchemaOf(editor),
        { isSetValued: isAuthoredSetValued }
      );
      onCleanup(
        registerEditorCommandDocument(editor, {
          checkRecorded: (input) => {
            if (checksFramedLaw()) {
              assertFramedLaw(input, authoredResolveSchemaOf(editor));
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

            const projected = project(value);

            return (
              projected && {
                carried: projected.carried && {
                  change: projected.carried.change,
                  from: projected.carried
                    .from as EditorDocumentValue['children'],
                },
                change: projected.change,
                value: projected.value as EditorDocumentValue,
              }
            );
          },
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
          const carried = carryRecords(before, after);
          const known = factsOf(carried.committed);

          if ('preview' in updateView) {
            throw new Error('A preview view takes no writes.');
          }

          // Editing records what Suggesting records, under the writer's
          // reserved change, and accepts it in the same commit.
          const editing = !forced && updateView.intent === 'edit';
          const writer = authorOf(editor);

          if (writer === null) {
            throw new Error('An author ID is required for authored writes.');
          }
          if (!editing && contentChange.deleteRoots.size > 0) {
            throw unrepresentable(
              'Suggesting cannot delete a named root; suggest deleting its content.'
            );
          }
          if (!editing) {
            // Vetoes keep a person's Suggesting out of blocks review marks
            // cannot hold yet; a proposal forced from Editing, such as an AI
            // preview, records as before.
            const vetoes =
              options.vetoes === false || updateView.intent !== 'propose'
                ? []
                : (getPluginContributions(
                    editor,
                    authoredVeto
                  ) as readonly AuthoredVeto[]);
            const refusal =
              (update && state.refused.get(update)) ??
              (constructsValues(getCompiledEditorSchema(editor))
                ? GENERATED_VALUES_REFUSAL
                : vetoes.length > 0
                  ? proposalRefusal(steps, input.before, vetoes)
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
          const recorded = recordAuthoredSteps({
            before,
            changeId,
            createRoots: contentChange.createRoots,
            createTagId,
            deleteRoots: contentChange.deleteRoots,
            dependencies,
            fill: (site, root) =>
              completeChildrenAt(editor, site.map(elementOf), [], root)
                .children,
            forcedChangeId: forced?.changeId ?? (editing ? changeId : null),
            framed: input.framed === true,
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
            keepsOnSplit: (props, path, root, key, draftRoot) =>
              Object.hasOwn(
                getEditorSchema(editor).elementPropertiesForSplitAt(
                  // Only the key's lifecycle matters, so an absent value
                  // stands in as `true`.
                  elementOf({ ...props, [key]: props[key] ?? true }),
                  [...path],
                  root,
                  draftRoot as readonly Descendant[]
                ),
                key
              ),
            now: at,
            oneText: (type) => {
              const content = getEditorSchema(editor).getElementContent(type);

              return content?.max === 1 && content.allowsText;
            },
            selectionBefore:
              selectionPosition === null
                ? null
                : {
                    position: selectionPosition,
                    root: input.selectionBeforeRoot,
                  },
            steps,
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

          // Withdrawing one's own insertion removes fragments outright, and
          // they can hold another author's cuts, which move to the fragments
          // that stay.
          const roots = [
            ...new Set([
              ...Object.keys(before.roots ?? {}),
              ...recorded.indexedAfter.keys(),
            ]),
          ].filter(
            (root) => root !== 'main' && !contentChange.deleteRoots.has(root)
          );
          const { roots: _beforeRoots, ...plain } = before;
          const valueOf = (indexes: ReadonlyMap<string, DocumentIndex>) =>
            ({
              ...plain,
              children: indexes.get('main')?.value ?? before.children,
              ...(roots.length > 0
                ? {
                    roots: Object.fromEntries(
                      roots.map((root) => [
                        root,
                        indexes.get(root)?.value ?? valueRoot(before, root),
                      ])
                    ),
                  }
                : {}),
            }) as JsonEditorValue;
          const written = valueOf(recorded.indexedAfter);
          const relink = relinkCuts(
            recorded.change,
            before,
            written,
            (root) =>
              recorded.indexedAfter.get(root) ??
              DocumentIndex.fromValue(valueRoot(written, root))
          );
          const change = relink
            ? recorded.change.compose(relink.change)
            : recorded.change;
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
                createTagId,
                dependencies,
                editor,
                indexes,
                mark: {
                  at,
                  author: writer,
                  change: forced?.changeId ?? changeId,
                  ...(forced?.inc === undefined ? {} : { inc: forced.inc }),
                },
              });
          const content = filled ? change.compose(filled.change) : change;
          const writtenIndexes = filled?.indexes ?? indexes;
          const accepted =
            editing && !writtenPlain
              ? acceptOwn(content, writtenIndexes, dependencies, known)
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
          // node ever points at a record its document lacks.
          const records = [
            appendRecords(before, CONTEXTS_ROOT, [
              ...(carried.records.get(CONTEXTS_ROOT) ?? []),
              ...restedOn(dependencies.minted(), later, indexedAfter).map(
                contextElementOf
              ),
            ]),
            appendRecords(
              before,
              VERDICTS_ROOT,
              carried.records.get(VERDICTS_ROOT) ?? []
            ),
          ];

          return {
            anchorChange: (plainAfter) =>
              [filled?.change, owned?.change].reduce(
                (anchor: DocumentChange, next) =>
                  next ? anchor.compose(next) : anchor,
                recorded.anchorChange(plainAfter)
              ),
            change: records.reduce(
              (change: DocumentChange, appended) =>
                appended ? change.compose(appended) : change,
              later
            ),
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
