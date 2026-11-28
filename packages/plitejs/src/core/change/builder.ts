import { getDefined } from '../../internal/get-defined';
import type { CompositionStamp } from '../composition-stamp';
import { getValueRecords, type RecordStore } from '../record-store';
import { countCoreWork } from '../work';
import {
  type CarriedRun,
  carriedRunOfMove,
  carriesRun,
  followCarriedRun,
  mapCarriedRunThrough,
  trimRunLeaves,
} from './carried-run';
import {
  classifyRootChange,
  classifyRootChangeWithRuntimeCandidates,
  type DocumentChangeRootClassification,
  type DocumentChangeRuntimeCandidate,
} from './classification';
import {
  applyDocumentChangeWithIndexes,
  attachLazyV4Steps,
  attachV4Steps,
  bindV4DocumentChange,
  copyV4StepsMetadata,
  createInternalDocumentChange,
  DocumentChange,
  freezeReadonlyMap,
  getAttachedV4Steps,
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRootKeys,
  getInternalDocumentRootChange,
  getV4RegisterSteps,
  isInternalRecordsOnlyChange,
  rootsComposeRebuilds,
  valueRootIndex,
} from './document-change';
import { DocumentIndex, rootNodesOf } from './document-index';
import { DraftFacts } from './draft-facts';
import {
  type EnclosureShell,
  unwrapNodeChange,
  wrapChildrenChange,
} from './enclosure';
import { jsonEqual, type JsonRecord } from './json';
import { visitRootNames } from './lazy-root';
import type { CarriedDrop, Relocation } from './lineage';
import {
  landMarks,
  type LetterSpan,
  mergeSpans,
  type NewLetters,
  textSpansIn,
} from './new-letters';
import {
  type Carry,
  type ChangeFacts,
  type Cut,
  factsWithout,
  type Heir,
  historyFollowsAllFacts,
  type Mend,
  type Merge,
  NO_FACTS,
  recordedFacts,
  UNKNOWN_FACTS,
} from './record';
import {
  keptRunsOf,
  RootChange,
  type DocumentSetPropertyResolver,
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  moveNodeChange,
  reconcileChildrenStep,
  removeNodeChange,
  removeTextChange,
  replaceChildrenChange,
  type ChildRun,
  replaceChildRunsChange,
  setNodeChange,
  setNodesChange,
  splitNodeChange,
} from './root-change';
import {
  type PreparedTokenSlice,
  isTextNode,
  type JsonEditorValue,
  type JsonNode,
  type JsonPoint,
} from './tokens';
import { applyV4Steps } from './v4/apply';
import {
  V4BuilderRecorder,
  type V4RecorderSnapshot,
} from './v4/builder-recorder';
import { extractV4Between } from './v4/extract';
import { countV4BuilderFallbackDiff, type V4Step } from './v4/types';

type SliceShape = 'letters' | 'nodes' | 'part';

const shapeOf = (slice: PreparedTokenSlice): SliceShape => {
  let depth = 0;
  let nodes = false;

  for (const token of slice.tokens) {
    if (token.kind === 'open') {
      depth += 1;
      nodes = true;
    }
    if (token.kind === 'close') depth -= 1;
    if (depth < 0) return 'part';
  }

  return depth !== 0 ? 'part' : nodes ? 'nodes' : 'letters';
};

const isLeafJoin = (slice: PreparedTokenSlice) => {
  const { tokens } = slice;

  return (
    tokens.length % 2 === 0 &&
    tokens.length > 0 &&
    tokens.every((token, index) =>
      index % 2 === 0
        ? token.kind === 'close' && token.nodeKind === 'text'
        : token.kind === 'open' && token.nodeKind === 'text'
    )
  );
};

type Unnamed = Readonly<{
  drops: boolean;
  merges: Merge[];
  nodes: boolean;
  writes: boolean;
}>;

const readUnnamed = (
  change: RootChange,
  before: () => DocumentIndex,
  joinsLeaves: boolean
): Unnamed | null => {
  const merges: Merge[] = [];
  const joinedInto = new Map<number, number>();
  let position = 0;
  let drops = false;
  let nodes = false;
  let writes = false;

  for (let pair = 0; pair < change.sections.length; pair += 2) {
    const removed = getDefined(change.sections[pair]);
    const inserted = getDefined(change.sections[pair + 1]);

    if (inserted >= 0) {
      const out = before().slice(position, position + removed);

      if (joinsLeaves && inserted === 0 && isLeafJoin(out)) {
        const left = getDefined(before().openContextAt(position).at(-1));
        const into =
          joinedInto.get(left.from) ?? getDefined(change.mapPos(left.from, 1));
        const at = position + removed - 1;

        joinedInto.set(at, into);
        merges.push([at, into]);
      } else {
        const written = change.data[pair >> 1] as PreparedTokenSlice | null;

        for (const side of inserted > 0 && written ? [out, written] : [out]) {
          const shape = shapeOf(side);

          if (shape === 'part') return null;
          nodes ||= shape === 'nodes';
        }
        drops ||= removed > 0;
        writes ||= inserted > 0;
      }
    }
    position += removed;
  }

  return { drops, merges, nodes, writes };
};

export type DocumentChangeStep = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  /**
   * Final nodes collected during classification, before publication.
   *
   * @internal
   */
  runtimeCandidates: ReadonlyMap<
    string,
    readonly DocumentChangeRuntimeCandidate[]
  >;
}>;

export type DocumentChangeConstructionPolicy = (
  input: Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    change: DocumentChange;
    indexedAfter: ReadonlyMap<string, DocumentIndex>;
    indexedBefore: ReadonlyMap<string, DocumentIndex>;
    /**
     * Present when the schema tracks places: the steps since the last
     * finalize, and where the pass records each value it drops because the
     * node carried it from a place that left it out. In a `view`, a draft a
     * recorder judges where it stores the content, the pass drops and records
     * every value its place cannot hold instead.
     */
    carried?: Readonly<{
      drops: CarriedDrop[];
      steps: readonly DraftStep[];
      view: boolean;
    }>;
    sinceValidated?: SinceValidated;
  }>,
  preparation?: object
) => DocumentChange;

/** @internal */
export type SinceValidated = Readonly<{
  before: JsonEditorValue;
  change: DocumentChange;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
}>;

/** @internal */
export type DraftStepOrigin =
  | 'canonical'
  | 'change'
  | 'insert-node'
  | 'merge'
  | 'migration'
  | 'move'
  | 'props'
  | 'remove-node'
  | 'replace'
  | 'root'
  | 'slice'
  | 'split'
  | 'text'
  | 'unwrap'
  | 'wrap';

// Canonical construction or a migration inside a scope is never the edit the
// scope names.
export const UNSCOPED_ORIGINS: ReadonlySet<DraftStepOrigin> = new Set([
  'canonical',
  'migration',
]);

const lettersBeyond = (letters: NewLetters, covered: NewLetters) => {
  const beyond = new Map<string, LetterSpan[]>();

  for (const [root, spans] of letters) {
    const held = mergeSpans(covered.get(root) ?? []);
    const rest: LetterSpan[] = [];
    let next = 0;

    for (const [from, to] of mergeSpans(spans)) {
      let start = from;

      while (next < held.length && held[next][1] <= start) next += 1;
      for (let at = next; at < held.length && held[at][0] < to; at += 1) {
        if (held[at][0] > start) rest.push([start, held[at][0]]);
        start = Math.max(start, held[at][1]);
      }
      if (start < to) rest.push([start, to]);
    }
    if (rest.length > 0) beyond.set(root, rest);
  }

  return beyond;
};

const isClassified = (change: DocumentChange) =>
  [...getInternalDocumentChangeEntries(change)].every(([root]) =>
    getInternalDocumentChangeClassification(change, root)
  );

const NO_INDEXES: ReadonlyMap<string, DocumentIndex> = freezeReadonlyMap(
  new Map()
);

const NO_RUNTIME_CANDIDATES: ReadonlyMap<
  string,
  readonly DocumentChangeRuntimeCandidate[]
> = freezeReadonlyMap(new Map());

/**
 * Whether a step comes from a plugin correction, whatever primitive wrote it.
 *
 * @internal
 */
const documentChangeFillsOnlyMissingElementIds = (
  change: DocumentChange,
  indexedBefore: ReadonlyMap<string, DocumentIndex>
): boolean => {
  if (change.createRoots.size > 0 || change.deleteRoots.size > 0) return false;
  if (getInternalDocumentChangeRecords(change).size > 0) return false;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const beforeIndex = indexedBefore.get(root);

    if (!beforeIndex) return false;
    let pos = 0;

    for (let i = 0; i < rootChange.sections.length; i += 2) {
      const length = getDefined(rootChange.sections[i]);
      const inserted = getDefined(rootChange.sections[i + 1]);

      if (inserted === -1) {
        pos += length;
        continue;
      }
      if (inserted !== -2) return false;

      const mods = rootChange.data[i >> 1] as
        | ReadonlyArray<Readonly<{ key: string }>>
        | undefined;

      if (!mods || !mods.every((mod) => mod.key === 'id')) return false;

      const token = beforeIndex.slice(pos, pos + 1).tokens[0];

      if (
        !token ||
        token.kind !== 'open' ||
        (typeof token.props.id === 'string' && token.props.id.length > 0)
      ) {
        return false;
      }
      pos += length;
    }
  }

  return true;
};

const rootChangeWritesElementId = (change: RootChange) => {
  for (let i = 0; i < change.sections.length; i += 2) {
    if (change.sections[i + 1] !== -2) continue;
    const mods = change.data[i >> 1] as
      | ReadonlyArray<Readonly<{ key: string }>>
      | undefined;

    if (mods?.some((mod) => mod.key === 'id')) return true;
  }

  return false;
};

const replaceRootWindowChange = (
  document: DocumentIndex,
  children: readonly JsonNode[]
) => {
  const beforeNodes = document.value;

  if (beforeNodes.length === children.length) {
    const runs: ChildRun[] = [];

    for (let i = 0; i < beforeNodes.length; i += 1) {
      if (jsonEqual(beforeNodes[i], children[i])) continue;
      runs.push({
        children: [getDefined(children[i])],
        index: i,
        path: [],
        removeCount: 1,
      });
    }

    if (runs.length > 0) return replaceChildRunsChange(document, runs);
  }

  const shorter = Math.min(beforeNodes.length, children.length);
  let prefix = 0;

  while (prefix < shorter && jsonEqual(beforeNodes[prefix], children[prefix])) {
    prefix += 1;
  }

  let suffix = 0;

  while (
    suffix < shorter - prefix &&
    jsonEqual(
      beforeNodes[beforeNodes.length - 1 - suffix],
      children[children.length - 1 - suffix]
    )
  ) {
    suffix += 1;
  }

  return replaceChildrenChange(
    document,
    [],
    prefix,
    beforeNodes.length - prefix - suffix,
    children.slice(prefix, children.length - suffix)
  );
};

export const reconcileRootChangeWithoutIdMutation = (
  document: DocumentIndex,
  children: readonly JsonNode[]
): RootChange => {
  const reconciled = reconcileChildrenStep(
    document,
    [],
    0,
    document.value.length,
    children
  ).change;

  return rootChangeWritesElementId(reconciled)
    ? replaceRootWindowChange(document, children)
    : reconciled;
};

export type DraftStepSource = 'command' | 'correction';

/** @internal */
export type DraftStepMove = Readonly<{
  role: 'landing' | 'source';
}>;

/** @internal */
export type DraftStep = Readonly<{
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  change: DocumentChange;
  move: DraftStepMove | null;
  origin: DraftStepOrigin;
  source: DraftStepSource;
  /** Runs this step landed from another place, when the schema tracks places. */
  relocations?: readonly Relocation[];
  /** Runs this step carried into an earlier sibling across closing tokens. */
  carried?: readonly CarriedRun[];
  /** Values a canonical step dropped because their nodes carried them. */
  drops?: readonly CarriedDrop[];
  /** The composition whose claimed text write applied this step. */
  composition?: CompositionStamp;
  /** Letters this step's author wrote, in its after document. */
  letters?: NewLetters;
  fit?: Readonly<{ lookAlike?: RootChange; paste: object }>;
  facts: ChangeFacts;
}>;

/** @internal */
export type DraftCheckpoint = Readonly<{
  accumulatedHasRootLifecycle: boolean;
  canonical: boolean;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  letters: NewLetters;
  record: DraftFacts | null;
  sinceValidated: SinceValidated | null;
  spanStart: number;
  steps: readonly DraftStep[];
  v4: V4RecorderSnapshot;
  v4StepMark: number;
  validationPending: boolean;
}>;

/** @internal */
export type CompletedTextDeletion = Readonly<{
  fromBefore: number;
  pathBefore: readonly number[];
  root: string;
  toBefore: number;
}>;

export type PreparedDocumentChange = Readonly<{
  after: JsonEditorValue;
  authority: object;
  before: JsonEditorValue;
  canonical: boolean;
  change: DocumentChange;
  facts: ChangeFacts;
  steps: readonly DraftStep[];
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  indexes: ReadonlyMap<string, DocumentIndex>;
  revision?: object;
  runtimeCandidates: ReadonlyMap<
    string,
    readonly DocumentChangeRuntimeCandidate[]
  >;
  v4Steps: readonly V4Step[] | null;
}>;

export const PREPARED_DOCUMENT_CHANGES = new WeakMap<
  object,
  PreparedDocumentChange
>();

/** Builds and applies canonical document steps against one immutable draft. */
export class ChangeDraft {
  private accumulated: DocumentChange;
  private accumulatedHasRootLifecycle = false;
  private pendingAccumulated: DocumentChange[] = [];
  private pendingSinceValidated: DocumentChange[] = [];
  private readonly appliedSteps: DraftStep[] = [];
  private stepComposition: CompositionStamp | null = null;
  private stepMove: DraftStepMove | null = null;
  private keepsLetters = false;
  private marks: NewLetters = new Map();
  private record: DraftFacts | null = null;
  private stepOrigin: DraftStepOrigin | null = null;
  private stepSource: DraftStepSource = 'command';
  private readonly assertCanonical?: (
    value: JsonEditorValue,
    change: DocumentChange
  ) => void;
  private readonly adoptCanonicalBaseline?: (value: JsonEditorValue) => void;
  private canonical = true;
  private sinceValidated: SinceValidated | null = null;
  private validationPending = false;
  private readonly construct?: DocumentChangeConstructionPolicy;
  private current: JsonEditorValue;
  private readonly indexes = new Map<string, DocumentIndex>();
  private readonly isSetValued: DocumentSetPropertyResolver;
  private readonly indexConstructedRoot?: (
    input: Readonly<{
      after: DocumentIndex;
      before: DocumentIndex;
      change?: RootChange;
      root: string;
    }>
  ) => void;
  private readonly preparationRevision?: () => object;
  private readonly source: JsonEditorValue;
  private readonly sourceIndexes = new Map<string, DocumentIndex>();
  private readonly preparationAuthority: object;
  private readonly recordV4: boolean;
  private readonly trackChanges: boolean;
  readonly tracksPlaces: boolean;
  /** Whether a collaboration binding reads which letters are new or moved. */
  readonly tracksLetters: boolean;
  private readonly view?: () => boolean;
  /** The first step after the last finalize, where a recording span starts. */
  private spanStart = 0;
  private readonly runtimeCandidatesByChange = new WeakMap<
    DocumentChange,
    ReadonlyMap<string, readonly DocumentChangeRuntimeCandidate[]>
  >();
  private readonly validate?: (
    value: JsonEditorValue,
    change: DocumentChange
  ) => void;
  private readonly validateConstructed?: (
    input: Readonly<{
      after: JsonEditorValue;
      before: JsonEditorValue;
      change: DocumentChange;
      indexedAfter: ReadonlyMap<string, DocumentIndex>;
      indexedBefore: ReadonlyMap<string, DocumentIndex>;
    }>
  ) => void;
  private readonly checkConstructed?: (
    input: Parameters<DocumentChangeConstructionPolicy>[0]
  ) => void;
  private readonly validateRecordsOnlyChange?: (change: DocumentChange) => void;
  private readonly v4Recorder = new V4BuilderRecorder();
  private v4RecordedStepMark = 0;

  constructor(
    value: JsonEditorValue,
    options: Readonly<{
      adoptCanonicalBaseline?: (value: JsonEditorValue) => void;
      assertCanonical?: (
        value: JsonEditorValue,
        change: DocumentChange
      ) => void;
      construct?: DocumentChangeConstructionPolicy;
      indexConstructedRoot?: (
        input: Readonly<{
          after: DocumentIndex;
          before: DocumentIndex;
          change?: RootChange;
          root: string;
        }>
      ) => void;
      isSetValued?: DocumentSetPropertyResolver;
      preparationAuthority?: object;
      preparationRevision?: () => object;
      recordV4?: boolean;
      trackChanges?: boolean;
      tracksPlaces?: boolean;
      tracksLetters?: boolean;
      /** Whether the draft is a view a recorder judges; see `carried`. */
      view?: () => boolean;
      validate?: (value: JsonEditorValue, change: DocumentChange) => void;
      validateConstructed?: (
        input: Readonly<{
          after: JsonEditorValue;
          before: JsonEditorValue;
          change: DocumentChange;
          indexedAfter: ReadonlyMap<string, DocumentIndex>;
          indexedBefore: ReadonlyMap<string, DocumentIndex>;
        }>
      ) => void;
      checkConstructed?: (
        input: Parameters<DocumentChangeConstructionPolicy>[0]
      ) => void;
      validateRecordsOnlyChange?: (change: DocumentChange) => void;
    }> = {}
  ) {
    this.source = value;
    this.current = value;
    this.adoptCanonicalBaseline = options.adoptCanonicalBaseline;
    this.assertCanonical = options.assertCanonical;
    this.construct = options.construct;
    this.indexConstructedRoot = options.indexConstructedRoot;
    this.isSetValued = options.isSetValued ?? (() => false);
    this.preparationAuthority =
      options.preparationAuthority ?? Object.freeze({});
    this.preparationRevision = options.preparationRevision;
    this.recordV4 = options.recordV4 ?? true;
    if (!this.recordV4) this.v4Recorder.invalidate();
    this.trackChanges = options.trackChanges ?? true;
    this.tracksPlaces = options.tracksPlaces ?? false;
    this.tracksLetters = options.tracksLetters ?? false;
    this.view = options.view;
    this.validate = options.validate;
    this.validateConstructed = options.validateConstructed;
    this.checkConstructed = options.checkConstructed;
    this.validateRecordsOnlyChange = options.validateRecordsOnlyChange;
    this.accumulated = DocumentChange.empty;
  }

  get change() {
    const accumulated = this.getAccumulated();

    if (!accumulated.empty) {
      const { recorded } = this.v4Recorder;

      if (recorded) {
        attachV4Steps(accumulated, recorded);
      } else {
        attachLazyV4Steps(accumulated, this.source, this.current, {
          authoritative: true,
          isSetValued: this.isSetValued,
        });
      }
    }

    return accumulated;
  }

  private syncExternalV4Change(
    change: DocumentChange,
    indexedBefore: ReadonlyMap<string, DocumentIndex>,
    indexedAfter: ReadonlyMap<string, DocumentIndex>
  ) {
    if (!this.v4Recorder.active || change.empty) return;

    const attached = getAttachedV4Steps(change);

    if (attached) {
      this.v4Recorder.appendRaw(attached);
      return;
    }

    if (documentChangeFillsOnlyMissingElementIds(change, indexedBefore)) {
      this.v4Recorder.resolvePendingIds((root) => this.getIndex(root));
      return;
    }

    if (
      change.createRoots.size > 0 &&
      change.deleteRoots.size === 0 &&
      getInternalDocumentChangeRecords(change).size === 0 &&
      [...getInternalDocumentChangeEntries(change)].every(([root]) =>
        change.createRoots.has(root)
      )
    ) {
      for (const root of change.createRoots) {
        const afterIndex = indexedAfter.get(root) ?? this.getIndex(root);

        this.v4Recorder.recordCreateRoot(root, afterIndex.value);
      }
      return;
    }

    this.v4Recorder.invalidate();
  }

  /** Recorded semantic v4 steps for this draft when available. @internal */
  get v4Steps(): readonly V4Step[] | null {
    return this.v4Recorder.recorded;
  }

  private hasAccumulated() {
    return !this.accumulated.empty || this.pendingAccumulated.length > 0;
  }

  private getAccumulated() {
    if (this.pendingAccumulated.length === 0) return this.accumulated;

    const list = this.accumulated.empty
      ? this.pendingAccumulated
      : [this.accumulated, ...this.pendingAccumulated];

    this.pendingAccumulated = [];
    this.accumulated = composeChangesBalanced(list, this.source);

    return this.accumulated;
  }

  private appendAccumulated(change: DocumentChange) {
    if (change.empty) return;

    if (hasRootLifecycle(change)) this.accumulatedHasRootLifecycle = true;
    this.pendingAccumulated.push(change);
  }

  private getSinceValidated() {
    if (!this.sinceValidated || this.pendingSinceValidated.length === 0) {
      return this.sinceValidated;
    }

    const { before, change, indexedBefore } = this.sinceValidated;
    const list = change.empty
      ? this.pendingSinceValidated
      : [change, ...this.pendingSinceValidated];

    this.pendingSinceValidated = [];
    this.sinceValidated = Object.freeze({
      before,
      change: composeChangesBalanced(list, before),
      indexedBefore,
    });

    return this.sinceValidated;
  }

  /** Canonical steps retain movement identity lost by composition. @internal */
  get steps(): readonly DocumentChange[] {
    return this.appliedSteps.map((step) => step.change);
  }

  /** @internal */
  get draftSteps(): readonly DraftStep[] {
    return this.appliedSteps;
  }

  /**
   * The runs the draft's steps carried, as the draft's change carries them.
   *
   * @internal
   */
  carriedRuns(): readonly CarriedRun[] {
    return carriedRunsOf(this.appliedSteps);
  }

  /** @internal */
  completedTextDeletion(): CompletedTextDeletion | null {
    const split =
      this.appliedSteps.findLastIndex((step) => step.origin !== 'canonical') +
      1;

    if (split === 0 || split === this.appliedSteps.length) return null;

    const own = this.appliedSteps.slice(0, split);

    if (
      own.some(
        ({ change }) =>
          change.createRoots.size > 0 || change.deleteRoots.size > 0
      )
    ) {
      return null;
    }

    const change = own.reduce<DocumentChange>(
      (composed, step) => composed.compose(step.change),
      DocumentChange.empty
    );
    const [root, ...otherRoots] = getInternalDocumentChangeRootKeys(change);

    if (!root || otherRoots.length > 0) return null;

    const before = own
      .find((step) => step.indexedBefore.has(root))
      ?.indexedBefore.get(root);

    if (!before) return null;

    const range = getInternalDocumentRootChange(change, root)?.pureDeletionOn(
      before
    );

    if (!range) return null;

    const leaf = before
      .nodeRangesTouching(range[0], range[1])
      .find(
        (node) =>
          node.kind === 'text' &&
          node.contentFrom === range[0] &&
          node.contentTo === range[1]
      );

    return leaf
      ? Object.freeze({
          fromBefore: range[0],
          pathBefore: leaf.path,
          root,
          toBefore: range[1],
        })
      : null;
  }

  /** @internal */
  get recordsRelocations() {
    return this.tracksPlaces || this.tracksLetters;
  }

  /** @internal */
  get marksLetters() {
    return this.tracksLetters && !this.keepsLetters;
  }

  /** The letters a user wrote, in the draft's current document. @internal */
  get newLetters(): NewLetters {
    return this.marks;
  }

  /** @internal */
  checkpoint(): DraftCheckpoint {
    return {
      accumulatedHasRootLifecycle: this.accumulatedHasRootLifecycle,
      canonical: this.canonical,
      change: this.getAccumulated(),
      indexedAfter: this.indexedAfter(),
      letters: this.marks,
      record: this.record?.clone() ?? null,
      sinceValidated: this.getSinceValidated(),
      spanStart: this.spanStart,
      steps: [...this.appliedSteps],
      v4: this.v4Recorder.snapshot(),
      v4StepMark: this.v4RecordedStepMark,
      validationPending: this.validationPending,
    };
  }

  /** @internal */
  resume(checkpoint: DraftCheckpoint): DocumentChangeStep | null {
    const step = checkpoint.change.empty
      ? null
      : this.apply(checkpoint.change, {
          indexedAfter: checkpoint.indexedAfter,
          v4Recorded: true,
        });

    this.accumulatedHasRootLifecycle = checkpoint.accumulatedHasRootLifecycle;
    this.appliedSteps.length = 0;
    this.appliedSteps.push(...checkpoint.steps);
    this.canonical = checkpoint.canonical;
    this.marks = checkpoint.letters;
    this.record = checkpoint.record?.clone() ?? null;
    this.sinceValidated = checkpoint.sinceValidated;
    this.pendingSinceValidated = [];
    this.spanStart = checkpoint.spanStart;
    this.validationPending = checkpoint.validationPending;
    this.v4Recorder.restore(checkpoint.v4);
    this.v4RecordedStepMark = checkpoint.v4StepMark;

    return step;
  }

  /** @internal */
  stepsSince(checkpoint: DraftCheckpoint | undefined): readonly DraftStep[] {
    return this.appliedSteps.slice(checkpoint?.steps.length ?? 0);
  }

  factsFor(change: DocumentChange): ChangeFacts {
    return sameRootChanges(change, this.getAccumulated())
      ? (this.record?.facts() ?? NO_FACTS)
      : UNKNOWN_FACTS;
  }

  /**
   * Facts of a change no command wrote. A change that opens or closes a node
   * apart from its other end reads unknown. Otherwise it claims nothing, until
   * history follows every recorded change. Then a change that drops and
   * writes, in one root or across roots, where either side holds a whole
   * node, reads unknown, because that pair may be a move, a split or a join no
   * fact connects. So does a change that touches no whole node when its
   * source says it touched nodes. With `joinsLeaves`, a section that joins two
   * text leaves writes their merge.
   *
   * @internal
   */
  unnamedFacts(
    change: DocumentChange,
    options: Readonly<{ joinsLeaves?: boolean; touchesNodes?: boolean }> = {}
  ): ChangeFacts {
    const all = historyFollowsAllFacts();
    const roots: Array<
      readonly [string, { carries: Carry[]; heirs: Heir[]; merges: Merge[] }]
    > = [];
    let drops = false;
    let nodes = false;
    let writes = false;

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const read = readUnnamed(
        rootChange,
        () => this.getIndex(root),
        all && options.joinsLeaves === true
      );

      if (!read) return UNKNOWN_FACTS;
      drops ||= read.drops;
      nodes ||= read.nodes;
      writes ||= read.writes;
      if (read.merges.length > 0) {
        roots.push([root, { carries: [], heirs: [], merges: read.merges }]);
      }
    }
    if (all && (nodes ? drops && writes : options.touchesNodes === true)) {
      return UNKNOWN_FACTS;
    }

    return roots.length > 0 ? recordedFacts(roots) : NO_FACTS;
  }

  private landedAsUnknown(facts: ChangeFacts) {
    return this.stepMove?.role === 'landing' ? UNKNOWN_FACTS : facts;
  }

  private recordFacts(
    getPrefix: () => DocumentChange,
    change: DocumentChange,
    facts: ChangeFacts
  ) {
    if (this.record?.unknown) return;
    if (facts.kind === 'unknown') {
      (this.record ??= new DraftFacts()).forget();
      return;
    }

    const lifecycle =
      this.accumulatedHasRootLifecycle || hasRootLifecycle(change);

    if (!this.record && facts.roots.size === 0 && !lifecycle) return;

    const prefix = getPrefix();
    const rebuilt = hasRootLifecycle(prefix, change)
      ? rootsComposeRebuilds(prefix, change)
      : new Set<string>();

    if (rebuilt.size > 0 && historyFollowsAllFacts()) {
      (this.record ??= new DraftFacts()).forget();
      return;
    }
    if (rebuilt.size > 0) (this.record ??= new DraftFacts()).drop(rebuilt);
    if (!this.record && facts.roots.size === 0) return;

    (this.record ??= new DraftFacts()).add(
      change,
      factsWithout(facts, rebuilt),
      (root) => getInternalDocumentRootChange(prefix, root)
    );
  }

  /**
   * Start a recording span after the steps applied so far, such as a recorded
   * change, which already decided every value it carried.
   *
   * @internal
   */
  beginSpan() {
    this.spanStart = this.appliedSteps.length;
  }

  private originOf(origin: DraftStepOrigin | undefined): DraftStepOrigin {
    return origin && UNSCOPED_ORIGINS.has(origin)
      ? origin
      : (this.stepOrigin ?? origin ?? 'change');
  }

  /** Label the steps `run` applies, such as a wrap built as a replacement. @internal */
  withOrigin<T>(origin: DraftStepOrigin, run: () => T): T {
    const previous = this.stepOrigin;

    this.stepOrigin = origin;
    try {
      return run();
    } finally {
      this.stepOrigin = previous;
    }
  }

  /** @internal */
  withSource<T>(source: DraftStepSource, run: () => T): T {
    const previous = this.stepSource;

    this.stepSource = source;
    try {
      return run();
    } finally {
      this.stepSource = previous;
    }
  }

  /** Tag the steps `run` applies as a composition's claimed write. @internal */
  withComposition<T>(stamp: CompositionStamp, run: () => T): T {
    const previous = this.stepComposition;

    this.stepComposition = stamp;
    try {
      return run();
    } finally {
      this.stepComposition = previous;
    }
  }

  private composed(step: DraftStep): DraftStep {
    return this.stepComposition && !step.composition
      ? { ...step, composition: this.stepComposition }
      : step;
  }

  private land(step: DraftStep) {
    if (this.marks.size === 0 && !step.letters) {
      this.appliedSteps.push(step);
      return;
    }

    const marks = landMarks(this.marks, step);
    const unlanded = step.letters && lettersBeyond(step.letters, marks);

    for (const [root, spans] of unlanded ?? []) {
      marks.set(root, mergeSpans([...(marks.get(root) ?? []), ...spans]));
    }
    this.appliedSteps.push(unlanded ? { ...step, letters: unlanded } : step);
    this.marks = marks;
  }

  /**
   * Leave the letters `run` writes unmarked, because it read them from the
   * document, so they keep their identity in a binding.
   *
   * @internal
   */
  withKeptLetters<T>(run: () => T): T {
    const previous = this.keepsLetters;

    this.keepsLetters = true;
    try {
      return run();
    } finally {
      this.keepsLetters = previous;
    }
  }

  /**
   * Mark the text between the positions `from` and `to` as written by the
   * last step, when that step came after the draft's first `since` steps.
   *
   * @internal
   */
  markLetters(since: number, root: string, from: number, to: number) {
    const last = this.appliedSteps.length - 1;
    const step = this.appliedSteps[last];

    if (!this.marksLetters || last < since) return;
    const spans = textSpansIn(this.getIndex(root), from, to);

    if (spans.length === 0) return;

    const marks = new Map(this.marks);

    marks.set(root, mergeSpans([...(marks.get(root) ?? []), ...spans]));
    this.marks = marks;
    this.appliedSteps[last] = {
      ...step,
      letters: new Map(step.letters).set(
        root,
        mergeSpans([...(step.letters?.get(root) ?? []), ...spans])
      ),
    };
  }

  /** @internal */
  withMove<T>(move: DraftStepMove, run: () => T): T {
    const previous = this.stepMove;

    this.stepMove = move;
    try {
      return run();
    } finally {
      this.stepMove = previous;
    }
  }

  get value() {
    return this.current;
  }

  /**
   * Reuse the builder's canonical indexes for publication.
   *
   * @internal
   */
  indexedAfter(change: DocumentChange = this.getAccumulated()) {
    const result = new Map<string, DocumentIndex>();

    for (const [root] of getInternalDocumentChangeEntries(change)) {
      if (!change.deleteRoots.has(root)) result.set(root, this.getIndex(root));
    }
    for (const root of change.createRoots) {
      result.set(root, this.getIndex(root));
    }

    return result;
  }

  /**
   * Fork the current draft while sharing its immutable indexes.
   *
   * @internal
   */
  fork(options: Readonly<{ validation?: 'defer-to-parent' | 'inherit' }> = {}) {
    const fork = new ChangeDraft(this.current, {
      assertCanonical: this.assertCanonical,
      adoptCanonicalBaseline: this.adoptCanonicalBaseline,
      construct: this.construct,
      indexConstructedRoot: this.indexConstructedRoot,
      isSetValued: this.isSetValued,
      preparationAuthority: this.preparationAuthority,
      preparationRevision: this.preparationRevision,
      recordV4: this.recordV4,
      trackChanges: this.trackChanges,
      tracksPlaces: this.tracksPlaces,
      tracksLetters: this.tracksLetters,
      view: this.view,
      checkConstructed: this.checkConstructed,
      ...(options.validation === 'defer-to-parent'
        ? {}
        : {
            validate: this.validate,
            validateConstructed: this.validateConstructed,
            validateRecordsOnlyChange: this.validateRecordsOnlyChange,
          }),
    });

    for (const [root, index] of this.indexes) {
      fork.indexes.set(root, index);
      fork.sourceIndexes.set(root, index);
    }
    fork.canonical = this.canonical;
    fork.validationPending = this.validationPending;
    return fork;
  }

  check() {
    if (!this.getAccumulated().empty) {
      this.checkConstructed?.(this.validationInput());
    }
  }

  /**
   * Require the parent transaction to validate an adopted canonical draft.
   *
   * @internal
   */
  requireValidation() {
    if (this.hasAccumulated()) this.validationPending = true;
  }

  /**
   * Capture the finalized draft behind an opaque token.
   *
   * @internal
   */
  prepare(
    change: DocumentChange = this.classify(),
    options: Readonly<{ classify?: boolean }> = {}
  ): object {
    if (!this.canonical) {
      throw new Error('Cannot prepare a non-canonical document draft.');
    }
    const classifiedChange =
      options.classify === false ? change : this.classify(change);
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();

    for (const [root] of getInternalDocumentChangeEntries(classifiedChange)) {
      indexedBefore.set(root, this.getSourceIndex(root));
      indexedAfter.set(
        root,
        classifiedChange.deleteRoots.has(root)
          ? DocumentIndex.fromValue([])
          : this.getIndex(root)
      );
    }

    const recordedV4 = this.v4Recorder.recorded;

    if (!classifiedChange.empty) {
      if (recordedV4) {
        attachV4Steps(classifiedChange, recordedV4);
      } else {
        attachLazyV4Steps(classifiedChange, this.source, this.current, {
          authoritative: true,
          isSetValued: this.isSetValued,
        });
      }
    }

    const token = Object.freeze({});

    PREPARED_DOCUMENT_CHANGES.set(
      token,
      Object.freeze({
        after: this.current,
        authority: this.preparationAuthority,
        before: this.source,
        canonical: this.canonical,
        change: classifiedChange,
        facts: this.factsFor(classifiedChange),
        steps: Object.freeze([...this.appliedSteps]),
        indexedAfter,
        indexedBefore,
        indexes: new Map(this.indexes),
        revision: this.preparationRevision?.(),
        runtimeCandidates:
          this.runtimeCandidatesByChange.get(classifiedChange) ?? new Map(),
        v4Steps: recordedV4,
      })
    );

    return token;
  }

  /**
   * Adopt a trusted prepared fork without replaying its changes.
   *
   * @internal
   */
  adopt(prepared: object): DocumentChangeStep | null {
    const payload = PREPARED_DOCUMENT_CHANGES.get(prepared);

    if (
      !payload ||
      payload.authority !== this.preparationAuthority ||
      payload.before !== this.current ||
      !payload.canonical ||
      payload.revision !== this.preparationRevision?.()
    ) {
      return null;
    }

    const before = this.current;
    const wasEmpty = !this.hasAccumulated();

    if (!payload.change.empty) {
      this.recordFacts(
        () => this.getAccumulated(),
        payload.change,
        this.landedAsUnknown(payload.facts)
      );
    }

    for (const [root, index] of payload.indexes) {
      this.indexes.set(root, index);
    }
    for (const root of payload.change.deleteRoots) {
      this.indexes.delete(root);
    }

    this.appendAccumulated(payload.change);
    this.composeSinceValidated(payload.change);
    for (const step of payload.steps) {
      if (!this.stepMove || step.move) {
        this.land(this.composed(step));
        continue;
      }
      const { letters, ...rest } = step;
      const moved = {
        ...rest,
        facts: this.landedAsUnknown(rest.facts),
        move: this.stepMove,
      };
      // A move fits its landing in a prepared fork, whose paste path marks
      // the landed letters as new. A move carries only letters read from the
      // document, so its landing keeps no marks.
      const landing = this.stepMove.role === 'landing';

      this.land(
        this.composed(letters && !landing ? { ...moved, letters } : moved)
      );
    }
    if (wasEmpty) {
      this.runtimeCandidatesByChange.set(
        payload.change,
        payload.runtimeCandidates
      );
    }
    if (this.v4Recorder.active) {
      if (payload.v4Steps !== null) {
        this.v4Recorder.appendRaw(payload.v4Steps);
      } else {
        this.v4Recorder.invalidate();
      }
    }
    this.v4RecordedStepMark = this.v4Recorder.stepCount;
    this.current = payload.after;

    return Object.freeze({
      after: payload.after,
      before,
      change: payload.change,
      indexedAfter: payload.indexedAfter,
      indexedBefore: payload.indexedBefore,
      runtimeCandidates: payload.runtimeCandidates,
    });
  }

  /** Classify a transaction-wide change against cached source/current indexes. */
  classify(change: DocumentChange = this.getAccumulated()) {
    const cachedRuntimeCandidates = this.runtimeCandidatesByChange.get(change);

    if (cachedRuntimeCandidates && isClassified(change)) return change;

    const classifications = new Map<string, DocumentChangeRootClassification>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const classified = classifyRootChangeWithRuntimeCandidates(
        rootChange,
        this.getSourceIndex(root),
        this.getIndex(root)
      );

      classifications.set(root, classified.classification);
      runtimeCandidates.set(root, classified.runtimeCandidates);
    }

    const classifiedChange = createInternalDocumentChange(
      new Map(getInternalDocumentChangeEntries(change)),
      {
        classifications,
        createRoots: change.createRoots,
        deleteRoots: change.deleteRoots,
        records: getInternalDocumentChangeRecords(change),
      }
    );

    this.runtimeCandidatesByChange.set(
      classifiedChange,
      freezeReadonlyMap(runtimeCandidates)
    );
    const attachedSteps =
      getAttachedV4Steps(change) ??
      (change === this.accumulated ? this.v4Recorder.recorded : null);

    if (!classifiedChange.empty) {
      if (attachedSteps) {
        attachV4Steps(classifiedChange, attachedSteps);
      } else {
        copyV4StepsMetadata(change, classifiedChange);
        if (change === this.accumulated) {
          attachLazyV4Steps(classifiedChange, this.source, this.current, {
            authoritative: true,
            isSetValued: this.isSetValued,
          });
        }
      }
    }

    return classifiedChange;
  }

  apply(
    change: DocumentChange,
    options: Readonly<{
      carried?: readonly CarriedRun[];
      classify?: boolean;
      drops?: readonly CarriedDrop[];
      facts?: ChangeFacts;
      fit?: DraftStep['fit'];
      indexedAfter?: ReadonlyMap<string, DocumentIndex>;
      letters?: NewLetters;
      origin?: DraftStepOrigin;
      relocations?: readonly Relocation[];
      v4Recorded?: boolean;
    }> = {}
  ): DocumentChangeStep {
    const before = this.current;
    const classifications = new Map<string, DocumentChangeRootClassification>();
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const beforeRoot = this.getIndex(root);
      const after =
        options.indexedAfter?.get(root) ?? rootChange.apply(beforeRoot);

      if (after.length !== rootChange.newLength) {
        throw new Error(
          `Indexed result for root "${root}" does not match change length.`
        );
      }

      this.indexConstructedRoot?.({
        after,
        before: beforeRoot,
        change: rootChange,
        root,
      });

      if (options.classify !== false) {
        const classified = classifyRootChangeWithRuntimeCandidates(
          rootChange,
          beforeRoot,
          after
        );

        classifications.set(root, classified.classification);
        runtimeCandidates.set(root, classified.runtimeCandidates);
      } else {
        runtimeCandidates.set(root, Object.freeze([]));
      }
      indexedBefore.set(root, beforeRoot);
      indexedAfter.set(root, after);
    }

    const classifiedChange = createInternalDocumentChange(
      new Map(getInternalDocumentChangeEntries(change)),
      {
        classifications,
        createRoots: change.createRoots,
        deleteRoots: change.deleteRoots,
        records: getInternalDocumentChangeRecords(change),
      }
    );
    const attachedSteps = getAttachedV4Steps(change);

    copyV4StepsMetadata(change, classifiedChange);
    const frozenRuntimeCandidates = freezeReadonlyMap(runtimeCandidates);

    if (options.classify !== false) {
      this.runtimeCandidatesByChange.set(
        classifiedChange,
        frozenRuntimeCandidates
      );
    }

    const current = applyDocumentChangeWithIndexes(
      classifiedChange,
      this.current,
      indexedAfter
    );

    if (!attachedSteps && !classifiedChange.empty) {
      const recorded = options.v4Recorded ? this.v4Recorder.recorded : null;
      const recordedSlice =
        recorded && recorded.length > this.v4RecordedStepMark
          ? recorded.slice(this.v4RecordedStepMark)
          : null;

      if (recordedSlice) {
        attachV4Steps(classifiedChange, recordedSlice);
      } else {
        attachLazyV4Steps(classifiedChange, before, current, {
          isSetValued: this.isSetValued,
        });
      }
    }

    for (const [root, after] of indexedAfter) {
      this.indexes.set(root, after);
    }

    for (const root of change.createRoots) {
      if (!this.indexes.has(root)) {
        const after = valueRootIndex(current, root);
        const beforeRoot = this.getSourceIndex(root);

        this.indexes.set(root, after);
        indexedAfter.set(root, after);
        indexedBefore.set(root, beforeRoot);
        this.indexConstructedRoot?.({ after, before: beforeRoot, root });
      }
    }
    for (const root of change.deleteRoots) {
      this.indexes.delete(root);
    }

    const carried = options.carried?.filter((run) => {
      const rootChange = getInternalDocumentRootChange(
        classifiedChange,
        run.root
      );
      const beforeRoot = indexedBefore.get(run.root);
      const afterRoot = indexedAfter.get(run.root);

      return (
        !!rootChange &&
        !!beforeRoot &&
        !!afterRoot &&
        carriesRun(rootChange, beforeRoot, afterRoot, run)
      );
    });

    if (this.trackChanges) {
      const facts = this.landedAsUnknown(options.facts ?? UNKNOWN_FACTS);

      if (!classifiedChange.empty) {
        this.recordFacts(() => this.getAccumulated(), classifiedChange, facts);
      }
      this.appendAccumulated(classifiedChange);
      this.composeSinceValidated(classifiedChange);
      if (!classifiedChange.empty) {
        const relocations = this.recordsRelocations
          ? options.relocations
          : undefined;

        this.land(
          this.composed({
            indexedAfter,
            indexedBefore,
            change: classifiedChange,
            move: this.stepMove,
            origin: this.originOf(options.origin),
            source: this.stepSource,
            ...(relocations?.length ? { relocations } : {}),
            ...(carried?.length ? { carried } : {}),
            ...(options.drops?.length ? { drops: options.drops } : {}),
            ...(options.letters ? { letters: options.letters } : {}),
            ...(options.fit ? { fit: options.fit } : {}),
            facts,
          })
        );
        countCoreWork('relocations', relocations?.length ?? 0);
      }
    }
    this.canonical = false;
    this.current = current;
    if (!options.v4Recorded) {
      this.syncExternalV4Change(change, indexedBefore, indexedAfter);
    }
    this.v4RecordedStepMark = this.v4Recorder.stepCount;

    return Object.freeze({
      after: current,
      before,
      change: classifiedChange,
      indexedAfter,
      indexedBefore,
      runtimeCandidates: frozenRuntimeCandidates,
    });
  }

  applyCanonical(
    change: DocumentChange,
    facts: ChangeFacts = UNKNOWN_FACTS
  ): DocumentChangeStep {
    if (
      this.validateRecordsOnlyChange &&
      this.canonical &&
      !this.validationPending &&
      isInternalRecordsOnlyChange(change)
    ) {
      this.validateRecordsOnlyChange(change);

      return this.applyRecords(change, facts);
    }
    if (!this.validate && !this.validateConstructed && !this.assertCanonical) {
      const step = this.apply(change, { facts });

      this.standValidated();

      return step;
    }

    // A rejected change must not mutate this builder or its owner indexes.
    const candidateBuilder = new ChangeDraft(this.current, {
      isSetValued: this.isSetValued,
    });
    const candidate = candidateBuilder.apply(change);
    const currentAccumulated = this.getAccumulated();
    const accumulated = currentAccumulated.empty
      ? candidate.change
      : currentAccumulated.compose(candidate.change, this.source);

    if (this.validateConstructed) {
      // Earlier draft steps may be unvalidated; retain the transaction baseline.
      const indexedAfter = candidateBuilder.indexedAfter(accumulated);
      const indexedBefore = new Map<string, DocumentIndex>();

      for (const root of indexedAfter.keys()) {
        indexedBefore.set(root, this.getSourceIndex(root));
      }
      if (
        this.validate &&
        this.hasUnindexedRootChange(candidate.after, indexedAfter)
      ) {
        this.validate(candidate.after, accumulated);
      } else {
        this.validateConstructed({
          after: candidate.after,
          before: this.source,
          change: accumulated,
          indexedAfter,
          indexedBefore,
        });
      }
    } else {
      this.validate?.(candidate.after, accumulated);
    }
    this.assertCanonical?.(candidate.after, accumulated);

    const step = this.applyTrustedCanonical(candidate.change, {
      facts,
      indexedAfter: candidate.indexedAfter,
      recordsAfter: getValueRecords(candidate.after),
      runtimeCandidates: candidate.runtimeCandidates,
    });

    return step;
  }

  applyRecordChange(
    change: DocumentChange,
    facts: ChangeFacts = UNKNOWN_FACTS
  ): DocumentChangeStep {
    const bound = bindV4DocumentChange(change, this.current);

    if (
      isInternalRecordsOnlyChange(bound) &&
      (this.validateRecordsOnlyChange || !this.canonical)
    ) {
      this.validateRecordsOnlyChange?.(bound);

      return this.applyRecords(bound, facts);
    }

    return this.applyCanonical(bound, facts);
  }

  applyPropertyWrites(change: DocumentChange): DocumentChangeStep {
    if (!this.canonical || this.validationPending) return this.apply(change);

    const candidate = new ChangeDraft(this.current, {
      isSetValued: this.isSetValued,
      trackChanges: false,
    }).apply(change);

    this.validateConstructed?.({
      after: candidate.after,
      before: this.current,
      change: candidate.change,
      indexedAfter: candidate.indexedAfter,
      indexedBefore: candidate.indexedBefore,
    });

    return this.applyTrustedCanonical(candidate.change, {
      indexedAfter: candidate.indexedAfter,
      recordsAfter: getValueRecords(candidate.after),
      runtimeCandidates: candidate.runtimeCandidates,
      validated: this.validateConstructed !== undefined,
    });
  }

  private applyRecords(
    change: DocumentChange,
    facts: ChangeFacts
  ): DocumentChangeStep {
    const before = this.current;
    const current = applyDocumentChangeWithIndexes(change, before, NO_INDEXES);
    const registerSteps = getV4RegisterSteps(change);

    if (registerSteps.length > 0) {
      this.v4Recorder.appendRaw(registerSteps);
    }

    this.appendAccumulated(change);
    this.composeSinceValidated(change);
    this.land(
      this.composed({
        indexedAfter: NO_INDEXES,
        indexedBefore: NO_INDEXES,
        change,
        move: this.stepMove,
        origin: this.originOf(undefined),
        source: this.stepSource,
        facts: this.landedAsUnknown(facts),
      })
    );
    this.runtimeCandidatesByChange.set(change, NO_RUNTIME_CANDIDATES);
    this.current = current;

    return Object.freeze({
      after: current,
      before,
      change,
      indexedAfter: NO_INDEXES,
      indexedBefore: NO_INDEXES,
      runtimeCandidates: NO_RUNTIME_CANDIDATES,
    });
  }

  /**
   * Apply a schema-fitted canonical change without revalidation.
   *
   * A fitter that already constructed the exact immutable target indexes may
   * supply them to avoid replaying the same change. Length and root lifecycle
   * checks still bind every supplied index to this builder's current draft.
   *
   * @internal
   */
  applyTrustedCanonical(
    change: DocumentChange,
    options: Readonly<{
      facts?: ChangeFacts;
      fit?: DraftStep['fit'];
      indexedAfter?: ReadonlyMap<string, DocumentIndex>;
      origin?: DraftStepOrigin;
      recordsAfter?: RecordStore;
      runtimeCandidates?: ReadonlyMap<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >;
      validated?: boolean;
    }> = {}
  ): DocumentChangeStep {
    const facts = this.landedAsUnknown(options.facts ?? UNKNOWN_FACTS);

    if (!options.indexedAfter) {
      const step = this.apply(change, {
        classify: false,
        facts,
        fit: options.fit,
        origin: options.origin,
      });

      this.runtimeCandidatesByChange.set(step.change, step.runtimeCandidates);
      this.standValidated();

      return step;
    }

    const before = this.current;
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();
    const entries = new Map(getInternalDocumentChangeEntries(change));

    for (const [root, rootChange] of entries) {
      const beforeRoot = this.getIndex(root);
      const afterRoot = options.indexedAfter.get(root);

      if (change.deleteRoots.has(root)) {
        if (!afterRoot) {
          throw new Error(
            `Missing trusted indexed result for deleted root "${root}".`
          );
        }
        if (
          rootChange.length !== beforeRoot.length ||
          rootChange.newLength !== 0 ||
          afterRoot.length !== 0
        ) {
          throw new Error(
            `Trusted deletion for root "${root}" does not match change lengths.`
          );
        }

        indexedBefore.set(root, beforeRoot);
        indexedAfter.set(root, afterRoot);
        this.indexConstructedRoot?.({
          after: afterRoot,
          before: beforeRoot,
          change: rootChange,
          root,
        });
        runtimeCandidates.set(
          root,
          options.runtimeCandidates?.get(root) ?? Object.freeze([])
        );
        continue;
      }

      if (!afterRoot) {
        throw new Error(
          `Missing trusted indexed result for changed root "${root}".`
        );
      }
      if (
        rootChange.length !== beforeRoot.length ||
        rootChange.newLength !== afterRoot.length
      ) {
        throw new Error(
          `Trusted indexed result for root "${root}" does not match change lengths.`
        );
      }

      indexedBefore.set(root, beforeRoot);
      indexedAfter.set(root, afterRoot);
      this.indexConstructedRoot?.({
        after: afterRoot,
        before: beforeRoot,
        change: rootChange,
        root,
      });
      runtimeCandidates.set(
        root,
        options.runtimeCandidates?.get(root) ?? Object.freeze([])
      );
    }

    for (const root of change.createRoots) {
      if (root === 'main' || Object.hasOwn(this.current.roots ?? {}, root)) {
        throw new Error(`Cannot create editor root ${root}.`);
      }

      const rootChange = entries.get(root);
      const afterRoot =
        options.indexedAfter.get(root) ?? DocumentIndex.fromValue([]);

      if (
        (rootChange && rootChange.newLength !== afterRoot.length) ||
        (!rootChange && afterRoot.length !== 0)
      ) {
        throw new Error(
          `Trusted indexed result for created root "${root}" does not match its change.`
        );
      }

      indexedBefore.set(root, this.getSourceIndex(root));
      indexedAfter.set(root, afterRoot);
      this.indexConstructedRoot?.({
        after: afterRoot,
        before: this.getSourceIndex(root),
        change: rootChange,
        root,
      });
      runtimeCandidates.set(
        root,
        options.runtimeCandidates?.get(root) ?? Object.freeze([])
      );
    }

    for (const root of change.deleteRoots) {
      if (root === 'main' || !Object.hasOwn(this.current.roots ?? {}, root)) {
        throw new Error(`Cannot delete editor root ${root}.`);
      }
      indexedBefore.set(root, this.getIndex(root));
    }

    for (const root of options.indexedAfter.keys()) {
      if (!entries.has(root) && !change.createRoots.has(root)) {
        throw new Error(
          `Trusted indexed result targets unchanged root "${root}".`
        );
      }
    }

    const classifications = new Map<string, DocumentChangeRootClassification>();

    for (const [root] of entries) {
      const classification = getInternalDocumentChangeClassification(
        change,
        root
      );

      if (classification) classifications.set(root, classification);
    }

    const canonicalChange = createInternalDocumentChange(entries, {
      classifications,
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    });

    copyV4StepsMetadata(change, canonicalChange);
    const frozenRuntimeCandidates = freezeReadonlyMap(runtimeCandidates);
    const current = applyDocumentChangeWithIndexes(
      canonicalChange,
      this.current,
      indexedAfter,
      options.recordsAfter
    );

    for (const [root, afterRoot] of indexedAfter) {
      this.indexes.set(root, afterRoot);
    }
    for (const root of change.deleteRoots) {
      this.indexes.delete(root);
    }

    if (!canonicalChange.empty) {
      this.recordFacts(() => this.getAccumulated(), canonicalChange, facts);
    }
    this.appendAccumulated(canonicalChange);
    this.composeSinceValidated(canonicalChange);
    if (!canonicalChange.empty) {
      this.land(
        this.composed({
          indexedAfter,
          indexedBefore,
          change: canonicalChange,
          move: this.stepMove,
          origin: this.originOf(options.origin),
          source: this.stepSource,
          ...(options.fit ? { fit: options.fit } : {}),
          facts,
        })
      );
    }
    this.runtimeCandidatesByChange.set(
      canonicalChange,
      frozenRuntimeCandidates
    );
    if (change !== canonicalChange) {
      this.runtimeCandidatesByChange.set(change, frozenRuntimeCandidates);
    }
    this.syncExternalV4Change(change, indexedBefore, indexedAfter);

    this.current = current;
    this.standValidated();
    if (!options.validated) this.adoptCanonicalBaseline?.(current);

    return Object.freeze({
      after: current,
      before,
      change: canonicalChange,
      indexedAfter,
      indexedBefore,
      runtimeCandidates: frozenRuntimeCandidates,
    });
  }

  /**
   * Construct and, unless `options.validate` is `false`, validate the canonical
   * result of the accumulated draft. Primitive edits may temporarily produce
   * non-canonical structure; only the transaction boundary is a publishable
   * document.
   */
  finalize(
    preparation?: object,
    options: Readonly<{
      classify?: boolean;
      origin?: DraftStepOrigin;
      validate?: boolean;
    }> = {}
  ): DocumentChangeStep | null {
    if (
      this.canonical &&
      (options.validate === false || !this.validationPending)
    ) {
      return null;
    }

    let constructionChange: DocumentChange | undefined;
    const drops: CarriedDrop[] = [];

    if (!this.canonical && this.construct) {
      const steps = this.appliedSteps.slice(this.spanStart);
      const sinceValidated = this.getSinceValidated();
      const input = sinceValidated
        ? { ...this.validationInput(), sinceValidated }
        : this.validationInput();

      constructionChange = this.construct(
        this.tracksPlaces
          ? {
              ...input,
              carried: {
                drops,
                steps,
                view: steps.length > 0 && (this.view?.() ?? false),
              },
            }
          : input,
        preparation
      );
    }
    const classified = isClassified(this.getAccumulated());
    const step =
      constructionChange && !constructionChange.empty
        ? this.apply(constructionChange, {
            ...options,
            drops,
            facts: this.unnamedFacts(constructionChange, {
              joinsLeaves: true,
            }),
            origin: options.origin ?? 'canonical',
            v4Recorded: true,
          })
        : null;

    this.spanStart = this.appliedSteps.length;

    if (this.v4Recorder.active) {
      if (!step) {
        this.v4Recorder.resolvePendingIds((root) => this.getIndex(root));
      } else if (
        constructionChange &&
        documentChangeFillsOnlyMissingElementIds(
          constructionChange,
          step.indexedBefore
        )
      ) {
        this.v4Recorder.resolvePendingIds((root) => this.getIndex(root));
      } else {
        const hadPending = this.v4Recorder.hasPending;

        this.v4Recorder.resolvePendingIds((root) => this.getIndex(root));
        const attachedConstruction = constructionChange
          ? getAttachedV4Steps(constructionChange)
          : null;

        if (attachedConstruction && !hadPending) {
          this.v4Recorder.appendRaw(attachedConstruction);
        } else {
          try {
            const recordedSoFar = hadPending ? this.v4Recorder.recorded : null;
            const repairBefore = recordedSoFar
              ? applyV4Steps(this.source, recordedSoFar)
              : step.before;
            const repairSteps = extractV4Between(repairBefore, step.after, {
              ...(recordedSoFar
                ? {}
                : {
                    indexedAfter: step.indexedAfter,
                    indexedBefore: step.indexedBefore,
                  }),
              isSetValued: this.isSetValued,
            });

            if (repairSteps.length > 0) {
              countV4BuilderFallbackDiff();
              this.v4Recorder.appendRaw(repairSteps);
            }
          } catch {
            this.v4Recorder.invalidate();
          }
        }
      }
      this.v4RecordedStepMark = this.v4Recorder.stepCount;
    }

    // Composing the correction drops the classification of each root both
    // changes write, because their paths read in two documents, and a commit
    // without one reads its roots whole to answer what changed.
    let accumulated = this.getAccumulated();

    if (
      step &&
      classified &&
      options.classify !== false &&
      !accumulated.empty
    ) {
      accumulated = this.classify(accumulated);
      this.accumulated = accumulated;
    }

    if (accumulated.empty) {
      this.current = this.source;
      this.record = null;
      this.appliedSteps.length = 0;
      this.marks = new Map();
      this.spanStart = 0;
      this.accumulatedHasRootLifecycle = false;
      if (this.recordV4) this.v4Recorder.resetTo([]);
      this.v4RecordedStepMark = 0;
      this.indexes.clear();
      for (const [root, index] of this.sourceIndexes) {
        this.indexes.set(root, index);
      }
      this.standValidated();
      this.validationPending = false;

      if (!step) return null;
      const indexedAfter = new Map(step.indexedAfter);
      const runtimeCandidates = new Map<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >();

      for (const [root, rootChange] of getInternalDocumentChangeEntries(
        step.change
      )) {
        const sourceIndex = this.getSourceIndex(root);

        indexedAfter.set(root, sourceIndex);
        if (options.classify !== false) {
          runtimeCandidates.set(
            root,
            classifyRootChangeWithRuntimeCandidates(
              rootChange,
              getDefined(step.indexedBefore.get(root)),
              sourceIndex
            ).runtimeCandidates
          );
        }
      }

      return Object.freeze({
        ...step,
        after: this.source,
        indexedAfter,
        runtimeCandidates: freezeReadonlyMap(runtimeCandidates),
      });
    }

    if (options.validate !== false) {
      if (this.validateConstructed) {
        const input = this.validationInput();

        if (
          this.validate &&
          this.hasUnindexedRootChange(input.after, input.indexedAfter)
        ) {
          this.validate(this.current, accumulated);
        } else {
          this.validateConstructed(input);
        }
      } else {
        this.validate?.(this.current, accumulated);
      }
      this.standValidated();
      this.validationPending = false;
    } else {
      this.canonical = true;
      this.validationPending = true;
    }

    return step;
  }

  private standValidated() {
    this.canonical = true;
    this.pendingSinceValidated = [];
    this.sinceValidated = this.getAccumulated().empty
      ? null
      : Object.freeze({
          before: this.current,
          change: DocumentChange.empty,
          indexedBefore: new Map(this.indexes),
        });
  }

  private composeSinceValidated(change: DocumentChange) {
    if (!this.sinceValidated || change.empty) return;

    this.pendingSinceValidated.push(change);
  }

  createRoots(entries: ReadonlyArray<readonly [string, readonly JsonNode[]]>) {
    if (entries.length === 0) {
      return this.applyConstructed(DocumentChange.empty, 'root');
    }

    const rootChanges = new Map<string, RootChange>();
    const createRoots = new Set<string>();

    for (const [root, children] of entries) {
      if (
        root === 'main' ||
        Object.hasOwn(this.current.roots ?? {}, root) ||
        createRoots.has(root)
      ) {
        throw new Error(`Cannot create editor root ${root}.`);
      }

      const document = DocumentIndex.fromValue([]);
      const rootChange = replaceChildrenChange(document, [], 0, 0, children);

      this.v4Recorder.recordCreateRoot(root, children);
      createRoots.add(root);
      if (!rootChange.empty) rootChanges.set(root, rootChange);
    }

    return this.applyConstructed(
      createInternalDocumentChange(rootChanges, {
        createRoots: [...createRoots],
      }),
      'root'
    );
  }

  deleteRoots(roots: readonly string[]) {
    if (roots.length === 0) {
      return this.applyConstructed(DocumentChange.empty, 'root');
    }

    const rootChanges = new Map<string, RootChange>();
    const deleteRoots = new Set<string>();

    for (const root of roots) {
      if (
        root === 'main' ||
        !Object.hasOwn(this.current.roots ?? {}, root) ||
        deleteRoots.has(root)
      ) {
        throw new Error(`Cannot delete editor root ${root}.`);
      }

      const document = this.getIndex(root);
      const rootChange = replaceChildrenChange(
        document,
        [],
        0,
        document.value.length,
        []
      );

      this.v4Recorder.recordDeleteRoot(root, () => document.value);
      deleteRoots.add(root);
      if (!rootChange.empty) rootChanges.set(root, rootChange);
    }

    return this.applyConstructed(
      createInternalDocumentChange(rootChanges, {
        deleteRoots: [...deleteRoots],
      }),
      'root'
    );
  }

  createRoot(root: string, children: readonly JsonNode[]) {
    return this.createRoots([[root, children]]);
  }

  deleteRoot(root: string) {
    return this.deleteRoots([root]);
  }

  insertNode(root: string, path: readonly number[], node: JsonNode) {
    const document = this.getIndex(root);

    this.v4Recorder.recordInsertNode(document, root, path, node);

    return this.applyRoot(
      root,
      'insert-node',
      insertNodeChange(document, path, node),
      document.withInsertedNode(path, node)
    );
  }

  insertText(
    root: string,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    const document = this.getIndex(root);
    const from = this.marksLetters
      ? document.positionAt({ path, offset })
      : null;

    this.v4Recorder.recordInsertText(document, path, offset, text);

    return this.applyRoot(
      root,
      'text',
      insertTextChange(document, path, offset, text),
      document.withText(path, offset, offset, text),
      undefined,
      from === null ? undefined : [[from, from + text.length]]
    );
  }

  mergeNode(root: string, path: readonly number[]) {
    const document = this.getIndex(root);
    const change = mergeNodeChange(document, path);
    const previous = [...path.slice(0, -1), getDefined(path.at(-1)) - 1];
    const { from } = document.nodeRange(path);
    const merge: Merge = [from, document.nodeRange(previous).from];
    const mends: Mend[] =
      historyFollowsAllFacts() && !isTextNode(document.node(path))
        ? [[from - 1]]
        : [];

    this.v4Recorder.recordMergeNode(document, path);

    return this.applyRoot(
      root,
      'merge',
      change,
      undefined,
      undefined,
      undefined,
      undefined,
      { carries: [], heirs: [], mends, merges: [merge] }
    );
  }

  moveNode(
    root: string,
    path: readonly number[],
    newPath: readonly number[],
    options: Readonly<{ preservesRepresentation?: boolean }> = {}
  ) {
    const document = this.getIndex(root);
    const wasCanonical = this.canonical;
    const change = moveNodeChange(document, path, newPath);
    const moved = this.movedRun(root, document, path, change);

    this.v4Recorder.recordMoveNode(document, root, path, newPath);

    const step = this.applyRoot(
      root,
      'move',
      change,
      undefined,
      this.recordsRelocations ? moved : undefined,
      undefined,
      carriedRunOfMove(root, document, document.nodeRange(path), change),
      {
        carries: moved.flatMap(({ at, length, source }): Carry[] =>
          typeof source === 'number' ? [[at, source, length]] : []
        ),
        heirs: [],
        merges: [],
      }
    );

    if (wasCanonical && options.preservesRepresentation) {
      this.canonical = true;
      this.validationPending = true;
    }

    return step;
  }

  removeNode(root: string, path: readonly number[]) {
    const document = this.getIndex(root);

    this.v4Recorder.recordRemoveNode(document, path);

    return this.applyRoot(
      root,
      'remove-node',
      removeNodeChange(document, path),
      document.withRemovedNode(path)
    );
  }

  removeText(
    root: string,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    const document = this.getIndex(root);
    const node = document.node(path);

    if (
      !isTextNode(node) ||
      node.text.slice(offset, offset + text.length) !== text
    ) {
      throw new Error(`Removed text does not match the draft at [${path}].`);
    }

    this.v4Recorder.recordRemoveText(document, path, offset, text);

    return this.applyRoot(
      root,
      'text',
      removeTextChange(document, path, offset, text)
    );
  }

  replaceChildren(
    root: string,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ) {
    const document = this.getIndex(root);
    const after = document.withSplicedNodes(path, index, removeCount, children);

    this.v4Recorder.recordReplaceChildren(
      document,
      root,
      path,
      index,
      removeCount,
      children
    );

    return this.applyRoot(
      root,
      'replace',
      replaceChildrenChange(document, path, index, removeCount, children),
      after,
      this.recordsRelocations
        ? this.reusedRuns(
            root,
            document,
            after,
            path,
            index,
            removeCount,
            children
          )
        : undefined
    );
  }

  /** Enclose children of `path` in `wrapper`, keeping their tokens. */
  wrapChildren(
    root: string,
    path: readonly number[],
    index: number,
    count: number,
    wrapper: EnclosureShell
  ) {
    const document = this.getIndex(root);
    const children =
      path.length === 0
        ? document.nodes.slice(index, index + count)
        : (document.node(path).children ?? []).slice(index, index + count);

    this.v4Recorder.recordWrapChildren(
      document,
      root,
      path,
      index,
      count,
      wrapper
    );

    return this.applyRoot(
      root,
      'wrap',
      wrapChildrenChange(document, path, index, count, wrapper),
      document.withSplicedNodes(path, index, count, [{ ...wrapper, children }])
    );
  }

  /** Remove the element at `path`, keeping its children's tokens in place. */
  unwrapNode(root: string, path: readonly number[]) {
    const document = this.getIndex(root);

    this.v4Recorder.recordUnwrapNode(document, root, path);

    return this.applyRoot(
      root,
      'unwrap',
      unwrapNodeChange(document, path),
      document.withSplicedNodes(
        path.slice(0, -1),
        getDefined(path.at(-1)),
        1,
        document.node(path).children ?? []
      )
    );
  }

  replaceChildRuns(root: string, runs: readonly ChildRun[]) {
    this.v4Recorder.invalidate();

    return this.applyRoot(
      root,
      'replace',
      replaceChildRunsChange(this.getIndex(root), runs)
    );
  }

  replaceRoot(root: string, children: readonly JsonNode[]) {
    if (root !== 'main' && !Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot replace editor root ${root}.`);
    }

    const document = this.getIndex(root);

    this.v4Recorder.invalidate();

    return this.applyDiff(
      root,
      'replace',
      reconcileRootChangeWithoutIdMutation(document, children)
    );
  }

  replaceSlice(
    root: string,
    from: JsonPoint,
    to: JsonPoint,
    insert: PreparedTokenSlice
  ) {
    const document = this.getIndex(root);
    const fromPosition = document.positionAt(from);
    const toPosition = document.positionAt(to);

    if (toPosition < fromPosition) {
      throw new RangeError('A slice replacement range must be forward.');
    }

    this.v4Recorder.invalidate();

    return this.applyDiff(
      root,
      'slice',
      RootChange.create(document, {
        from: fromPosition,
        insert,
        to: toPosition,
      })
    );
  }

  setNode(
    root: string,
    path: readonly number[],
    newProperties: JsonRecord,
    properties: JsonRecord = {}
  ) {
    const document = this.getIndex(root);

    this.v4Recorder.recordSetNode(
      document,
      root,
      path,
      newProperties,
      properties,
      this.isSetValued
    );

    return this.applyRoot(
      root,
      'props',
      setNodeChange(
        document,
        path,
        newProperties,
        properties,
        this.isSetValued,
        root === 'main' ? null : root
      )
    );
  }

  setNodes(
    root: string,
    updates: ReadonlyArray<
      Readonly<{
        newProperties: JsonRecord;
        path: readonly number[];
        properties: JsonRecord;
      }>
    >
  ) {
    const document = this.getIndex(root);

    for (const update of updates) {
      this.v4Recorder.recordSetNode(
        document,
        root,
        update.path,
        update.newProperties,
        update.properties,
        this.isSetValued
      );
    }

    return this.applyRoot(
      root,
      'props',
      setNodesChange(
        document,
        updates,
        this.isSetValued,
        root === 'main' ? null : root
      )
    );
  }

  splitNode(
    root: string,
    path: readonly number[],
    position: number,
    properties: JsonRecord
  ) {
    const document = this.getIndex(root);
    const change = splitNodeChange(document, path, position, properties);
    const heir = this.splitHeir(document, path, position);
    const cuts: Cut[] =
      historyFollowsAllFacts() && !isTextNode(document.node(path))
        ? [[heir[0] - 1]]
        : [];

    this.v4Recorder.recordSplitNode(document, root, path, position, properties);

    return this.applyRoot(
      root,
      'split',
      change,
      undefined,
      this.tracksPlaces
        ? [{ at: heir[0], length: 1, root, source: heir[1] }]
        : undefined,
      undefined,
      undefined,
      { carries: [], cuts, heirs: [heir], merges: [] }
    );
  }

  /** The moved subtree lands as one run whose source is its old range. */
  private movedRun(
    root: string,
    document: DocumentIndex,
    path: readonly number[],
    change: RootChange
  ): readonly Relocation[] {
    const { from, to } = document.nodeRange(path);
    const length = to - from;
    let after = 0;

    for (let pair = 0; pair < change.sections.length; pair += 2) {
      const removed = change.sections[pair];
      const inserted = change.sections[pair + 1];

      if (removed === 0 && inserted === length) {
        return [{ at: after, length, root, source: from }];
      }
      after += inserted < 0 ? removed : inserted;
    }

    return [];
  }

  /**
   * One run per inserted node that is, by reference, one removed child or a
   * child of one, and appears once. It looks one level deep on each side, so
   * a wrap or an unwrap matches.
   */
  private reusedRuns(
    root: string,
    document: DocumentIndex,
    after: DocumentIndex,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ): readonly Relocation[] {
    const siblings =
      path.length === 0
        ? document.nodes.slice(index, index + removeCount)
        : (document.node(path).children ?? []).slice(
            index,
            index + removeCount
          );
    const removed = new Map<object, readonly number[]>();
    const seen = new Map<object, number>();
    const matches: Array<Readonly<{ node: object; to: readonly number[] }>> =
      [];
    const match = (node: object, to: readonly number[]) => {
      matches.push({ node, to });
      seen.set(node, (seen.get(node) ?? 0) + 1);
    };

    siblings.forEach((node, offset) => {
      const at = [...path, index + offset];

      removed.set(node, at);
      node.children?.forEach((child, childIndex) => {
        removed.set(child, [...at, childIndex]);
      });
    });
    children.forEach((node, offset) => {
      const at = [...path, index + offset];

      if (removed.has(node)) {
        match(node, at);
        return;
      }
      node.children?.forEach((child, childIndex) => {
        if (removed.has(child)) match(child, [...at, childIndex]);
      });
    });

    return matches.flatMap(({ node, to }) => {
      if (seen.get(node) !== 1) return [];
      const source = document.nodeRange(getDefined(removed.get(node)));
      const landed = after.nodeRange(to);

      return [
        {
          at: landed.from,
          length: landed.to - landed.from,
          root,
          source: source.from,
        },
      ];
    });
  }

  /** The new node's open token continues the split node's. */
  private splitHeir(
    document: DocumentIndex,
    path: readonly number[],
    position: number
  ): Heir {
    const node = document.node(path);
    const boundary = isTextNode(node)
      ? document.positionAt({ offset: position, path: [...path] })
      : document.childPosition(path, position);

    return [boundary + 1, document.nodeRange(path).from];
  }

  private applyRoot(
    root: string,
    origin: DraftStepOrigin,
    change: RootChange,
    indexedAfter?: DocumentIndex,
    relocations?: readonly Relocation[],
    letters?: readonly LetterSpan[],
    carried?: readonly CarriedRun[],
    facts?: Readonly<{
      carries: Carry[];
      cuts?: Cut[];
      heirs: Heir[];
      mends?: Mend[];
      merges: Merge[];
    }>
  ) {
    return this.apply(
      createInternalDocumentChange(
        change.empty ? new Map() : new Map([[root, change]])
      ),
      {
        carried,
        facts: facts ? recordedFacts([[root, facts]]) : NO_FACTS,
        indexedAfter: indexedAfter
          ? new Map([[root, indexedAfter]])
          : undefined,
        letters:
          letters?.length && this.marksLetters
            ? new Map([[root, letters]])
            : undefined,
        origin,
        relocations,
        v4Recorded: true,
      }
    );
  }

  private applyDiff(root: string, origin: DraftStepOrigin, change: RootChange) {
    const documentChange = createInternalDocumentChange(
      change.empty ? new Map() : new Map([[root, change]])
    );

    return this.apply(documentChange, {
      facts: this.unnamedFacts(documentChange),
      origin,
      v4Recorded: true,
    });
  }

  private applyConstructed(
    change: DocumentChange,
    origin: DraftStepOrigin,
    indexedAfter?: ReadonlyMap<string, DocumentIndex>
  ): DocumentChangeStep {
    return this.apply(change, {
      facts: NO_FACTS,
      indexedAfter,
      origin,
      v4Recorded: true,
    });
  }

  getIndex(root: string) {
    let document = this.indexes.get(root);

    if (!document) {
      document = valueRootIndex(this.current, root);
      this.indexes.set(root, document);
    }

    return document;
  }

  private validationInput() {
    const accumulated = this.getAccumulated();
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();
    const touchedRoots = new Set([
      ...[...getInternalDocumentChangeEntries(accumulated)].map(
        ([root]) => root
      ),
      ...accumulated.createRoots,
    ]);

    for (const root of touchedRoots) {
      if (!accumulated.deleteRoots.has(root)) {
        indexedAfter.set(root, this.getIndex(root));
      }
      indexedBefore.set(root, this.getSourceIndex(root));
    }

    return {
      after: this.current,
      before: this.source,
      change: accumulated,
      indexedAfter,
      indexedBefore,
    };
  }

  private hasUnindexedRootChange(
    after: JsonEditorValue,
    indexedAfter: ReadonlyMap<string, DocumentIndex>
  ) {
    return (
      (rootNodesOf(after, 'children') !==
        rootNodesOf(this.source, 'children') &&
        !indexedAfter.has('main')) ||
      visitRootNames(after.roots).some(
        (root) =>
          rootNodesOf(after.roots ?? {}, root) !==
            rootNodesOf(this.source.roots ?? {}, root) &&
          !indexedAfter.has(root)
      )
    );
  }

  private getSourceIndex(root: string) {
    let document = this.sourceIndexes.get(root);

    if (!document) {
      document = valueRootIndex(this.source, root);
      this.sourceIndexes.set(root, document);
    }

    return document;
  }
}

const hasRootLifecycle = (...changes: readonly DocumentChange[]) =>
  changes.some(
    (change) => change.createRoots.size > 0 || change.deleteRoots.size > 0
  );

// Root lifecycle transitions need sequential composition with the source value;
// otherwise composition is associative and pairwise reduction avoids O(N^2)
// section copying across large multi-step transactions.
const composeChangesBalanced = (
  changes: readonly DocumentChange[],
  source: JsonEditorValue
): DocumentChange => {
  if (changes.length === 0) return DocumentChange.empty;
  if (changes.length === 1) return getDefined(changes[0]);
  if (hasRootLifecycle(...changes)) {
    let composed = getDefined(changes[0]);

    for (let index = 1; index < changes.length; index++) {
      composed = composed.compose(getDefined(changes[index]), source);
    }

    return composed;
  }

  let current = changes;

  while (current.length > 1) {
    const next: DocumentChange[] = [];

    for (let index = 0; index < current.length; index += 2) {
      const left = getDefined(current[index]);

      next.push(
        index + 1 < current.length
          ? left.compose(getDefined(current[index + 1]))
          : left
      );
    }
    current = next;
  }

  return getDefined(current[0]);
};

const sameRootChanges = (left: DocumentChange, right: DocumentChange) => {
  if (left === right) return true;

  const leftRoots = new Map(getInternalDocumentChangeEntries(left));
  const rightRoots = [...getInternalDocumentChangeEntries(right)];

  return (
    leftRoots.size === rightRoots.length &&
    rightRoots.every(([root, change]) => leftRoots.get(root) === change) &&
    sameSet(left.createRoots, right.createRoots) &&
    sameSet(left.deleteRoots, right.deleteRoots)
  );
};

const sameSet = (left: ReadonlySet<string>, right: ReadonlySet<string>) =>
  left.size === right.size && [...left].every((item) => right.has(item));

/** @internal */
export const carriedRunsOf = (
  steps: readonly DraftStep[]
): readonly CarriedRun[] => {
  if (!steps.some((step) => step.carried)) return [];

  const rootChange = (step: DraftStep, root: string) =>
    getInternalDocumentRootChange(step.change, root) ?? null;
  const drafts = new Map<string, Array<RootChange | null>>();
  const draftBefore = (root: string, step: number) => {
    const composed = drafts.get(root) ?? [null];

    drafts.set(root, composed);
    while (composed.length <= step) {
      const last = composed.at(-1) ?? null;
      const change = rootChange(steps[composed.length - 1], root);

      composed.push(last && change ? last.compose(change) : (last ?? change));
    }

    return composed[step];
  };
  let runs: Array<Readonly<{ carriedAt: number; run: CarriedRun }>> = [];
  const dropRewrittenLeaves = (
    run: CarriedRun | null,
    carriedAt: number,
    after: DocumentIndex | undefined
  ) =>
    run && after && run.length !== run.landed
      ? trimRunLeaves(
          run,
          getDefined(steps[carriedAt].indexedBefore.get(run.root)),
          after
        )
      : run;

  for (const [index, step] of steps.entries()) {
    runs = runs.flatMap(({ carriedAt, run }) => {
      if (step.change.deleteRoots.has(run.root)) return [];

      const change = rootChange(step, run.root);

      if (!change) return [{ carriedAt, run }];

      const before = step.indexedBefore.get(run.root);
      const after = step.indexedAfter.get(run.root);
      const mapped = dropRewrittenLeaves(
        before && after
          ? followCarriedRun(run, change, before, after)
          : mapCarriedRunThrough(run, change),
        carriedAt,
        after
      );

      return mapped ? [{ carriedAt, run: mapped }] : [];
    });
    for (const carried of step.carried ?? []) {
      const run = dropRewrittenLeaves(
        carried,
        index,
        step.indexedAfter.get(carried.root)
      );

      if (run) runs.push({ carriedAt: index, run });
    }
  }

  return runs.flatMap(({ carriedAt, run }) => {
    const end = run.source + run.length;
    const draft = draftBefore(run.root, carriedAt);
    const kept = draft
      ? keptRunsOf(draft, run.source, end)
      : [{ at: run.source, from: run.source, to: end }];

    if (
      kept.length !== 1 ||
      kept[0].from !== run.source ||
      kept[0].to !== end
    ) {
      return [];
    }

    const traced = { ...run, source: kept[0].at };
    const change = draftBefore(run.root, steps.length);
    const before = steps
      .find((step) => step.indexedBefore.has(run.root))
      ?.indexedBefore.get(run.root);
    const after = steps
      .findLast((step) => step.indexedAfter.has(run.root))
      ?.indexedAfter.get(run.root);

    return change &&
      before &&
      after &&
      carriesRun(change, before, after, traced)
      ? [traced]
      : [];
  });
};

export const classifyDocumentChange = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  change: DocumentChange
) => {
  const bound = bindV4DocumentChange(change, before);
  const classifications = new Map(
    getInternalDocumentChangeClassificationEntries(bound)
  );

  for (const [root, rootChange] of getInternalDocumentChangeEntries(bound)) {
    classifications.set(
      root,
      classifyRootChange(
        rootChange,
        valueRootIndex(before, root),
        valueRootIndex(after, root)
      )
    );
  }

  const classified = createInternalDocumentChange(
    new Map(getInternalDocumentChangeEntries(bound)),
    {
      classifications,
      createRoots: bound.createRoots,
      deleteRoots: bound.deleteRoots,
      records: getInternalDocumentChangeRecords(bound),
    }
  );
  if (!classified.empty) {
    copyV4StepsMetadata(bound, classified);
  }

  return classified;
};
