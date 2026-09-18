import { createAnchor } from '../core/anchor';
import {
  getAuthoredViewCommit,
  EMPTY_AUTHORED_FRAGMENT_SLOTS,
  registerAuthoredRuntime,
  type NativeAuthoredFragment,
  type NativeAuthoredRenderSegment,
} from '../core/authored-runtime';
import { ChangeDraft } from '../core/change/builder';
import { DocumentChange } from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import type { JsonEditorValue } from '../core/change/tokens';
import { createEditorCommit } from '../core/commit';
import {
  createEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../core/commit-publication';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorSchema,
} from '../core/editor-runtime';
import {
  getCompiledEditorSchemaFromApi,
  type InternalEditorSchemaApi,
} from '../core/editor-schema';
import { definePlugin } from '../core/plugin';
import { profileCoreDuration } from '../core/profiling';
import {
  getActiveEditorTransaction,
  getActiveDocumentChangeBuilder,
  getActiveTransactionDocumentChange,
  isBuildingTransactionSpec,
  setTransactionPublicationChange,
  setTransactionDocumentProjection,
  withEditorDocumentProjection,
  notifyEditorViewState,
  subscribeEditorViewState,
  getCurrentSelection,
  getCurrentSelectionRoot,
  setTransactionViewSelection,
  restoreTransactionSourceSelection,
  getEditorStateView,
  getEditorProjectionSnapshotIndex,
  inheritEditorProjectionIndexes,
  getLastCommit,
} from '../core/public-state';
import { createEditorEffect } from '../core/transaction-values';
import { txOnly, type TxOnlyMethod } from '../core/tx-only';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  Plugin,
  EditorUpdateTransaction,
  EditorCommit,
  EditorSnapshot,
  NodeKey,
  Selection,
  Value,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { PathApi, type Path } from '../interfaces/path';
import { RangeApi, type Range } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { seedNodeKeys } from '../utils/node-keys';
import {
  bindAuthoredDocumentRange,
  bindAuthoredDocumentPath,
  type AuthoredRangeProjection,
} from './anchors';
import {
  previewAuthoredDecision,
  prepareAuthoredDecision,
  inspectAuthoredSelection,
  prepareAuthoredRevert,
  projectAuthoredOperation,
  projectAuthoredSteps,
  projectAuthoredReviewUndo,
  type AuthoredProjection,
} from './decisions';
import {
  authoredFragmentIndexNodeKeys,
  authoredFragmentBucket,
  createAuthoredFragmentIndex,
  updateAuthoredFragmentIndex,
  type AuthoredFragmentIndex,
} from './fragment-index';
import { authoredHistoryEffect } from './history';
import {
  readAuthoredFragmentProjection,
  inheritAuthoredFragmentProjection,
  readAuthoredMarkupFragments,
} from './markup';
import { authoredOriginSpans, authoredPositionSpans } from './positions';
import {
  readAuthoredChange,
  readAuthoredChangeDetails,
  hasAuthoredReviewContent,
  validateAuthoredQuery,
} from './read';
import { readRecord, records } from './record-tree';
import { composeAuthoredRenderSegments } from './render';
import { protectAuthoredRetainedContent } from './retained';
import {
  captureAuthoredSelection,
  resolveAuthoredSelection,
  type AuthoredViewSelection,
} from './selection';
import {
  authoredOperationEffect,
  authoredState,
  compactAuthoredContent,
  emptyAuthoredState,
  equalAuthoredOperations,
  indexAuthoredState,
  hasAuthoredContent,
  materializeAuthoredEdit,
  readAuthoredOperationBatch,
  matchingAuthoredChanges,
  rememberLegacyAuthoredProjection,
  retainAuthoredContent,
  reduceAuthoredOperation,
  snapshotAuthoredOperationBatch,
  type AuthoredRecord,
  type AuthoredOperation,
  type AuthoredEdit,
  type AuthoredEditIdentity,
  type AuthoredReview,
  type AuthoredState,
} from './state';
import {
  captureAuthoredChange,
  authoredRootNodes,
  type AuthoredInsertion,
  AuthoredMappingConflictError,
  createAuthoredPositionRoots,
  mapAuthoredChange,
  type AuthoredPositionRoots,
  authoredEditOwner,
  partitionAuthoredTextEdit,
  partitionAuthoredStructuralEdit,
} from './steps';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangePublication,
  AuthoredDecision,
  AuthoredOptions,
  AuthoredPage,
  AuthoredQuery,
  AuthoredResult,
  AuthoredSelection,
  AuthoredStatus,
  AuthoredView,
} from './types';

type AuthoredRead = {
  view: () => AuthoredView;
  change: (id: string) => AuthoredChange | null;
  changes: (query?: AuthoredQuery) => AuthoredPage;
  changesAt: (range: Range) => readonly AuthoredChange[];
  /** Demand-read one immutable semantic and review snapshot without expanding change pages. */
  details: (id: string) => AuthoredChangeDetails | null;
  preview: (input: AuthoredDecision) => AuthoredResult;
  select: (query: {
    ids?: readonly string[];
    authorId?: string;
    status?: AuthoredStatus;
  }) => AuthoredSelection;
};

type AuthoredUpdate = {
  decide: (input: AuthoredDecision) => AuthoredResult;
  propose: TxOnlyMethod<(options?: { changeId?: string }) => string>;
  resolve: (input: AuthoredDecision) => AuthoredResult;
  /** Compensate retained accepted content. Applied ids identify the new contribution. */
  revert: (input: { selection: AuthoredSelection }) => AuthoredResult;
};

export type AuthoredPlugin = Plugin<{
  activate: true;
  api: {
    setView: (view: AuthoredView) => void;
    subscribeChanges: (
      listener: (publication: AuthoredChangePublication) => void
    ) => () => void;
  };
  effectTypes: true;
  name: 'authored';
  on: true;
  read: AuthoredRead;
  stateFields: true;
  update: AuthoredUpdate;
}>;

type AuthoredTransaction = {
  finishing: boolean;
  hydratedChanges: Set<string>;
  receiving: AuthoredState | null;
  insertions: Map<DocumentChange, AuthoredInsertion>;
  inputSelectionAllowed: boolean;
  rangeLifetime: { aborted: boolean };
  ranges: Array<{ release: () => void; settle: () => void }>;
  rangeProjection?: { change: DocumentChange; projection: AuthoredProjection };
  historyInverseSelection?: AuthoredViewSelection;
  historySelection?: AuthoredViewSelection;
  view: Editor | null;
  viewSelection: AuthoredViewSelection;
  viewSelectionBefore: Selection;
  viewSelectionRoot: string;
  automatic: boolean;
  actor: string | null;
  before: EditorDocumentValue;
  applyingDecision: boolean;
  changed: boolean;
  replacement:
    | { phase: 'loading' }
    | {
        phase: 'loaded';
        change: DocumentChange;
        projection: AuthoredProjection;
        state: AuthoredState;
      }
    | null;
  changeId: string | null;
  proposed: boolean;
  decision: Readonly<{
    acceptedChange: DocumentChange;
    projectedChange: DocumentChange;
    projection: AuthoredProjection;
  }> | null;
};

type AuthoredRuntime = {
  accepted: EditorDocumentValue;
  acceptedPositions: AuthoredPositionRoots;
  active: AuthoredTransaction | null;
  fragments: Map<string, Map<string, NativeAuthoredFragment>>;
  fragmentIndex: AuthoredFragmentIndex | null;
  options: AuthoredOptions;
  projected: EditorDocumentValue;
  projectedPositions: AuthoredPositionRoots;
  replica: string;
  source: Editor;
  subscribeChanges: (
    view: Editor,
    listener: (publication: AuthoredChangePublication) => void
  ) => () => void;
};

const RUNTIMES = new WeakMap<Editor, AuthoredRuntime>();
const VIEWS = new WeakMap<
  ReturnType<typeof getEditorRuntime>,
  { composition: { changeId: string | null } | null; policy: AuthoredView }
>();
const PENDING_VIEWS = new WeakMap<
  ReturnType<typeof getEditorRuntime>,
  AuthoredView
>();
const VIEW_SELECTIONS = new WeakMap<
  ReturnType<typeof getEditorRuntime>,
  AuthoredViewSelection
>();
const FRAGMENT_VIEWS = new WeakMap<
  object,
  Readonly<{
    documentId: string;
    fragment: NativeAuthoredFragment;
    parent: Editor;
    requireMarkupParent: boolean;
  }>
>();
const EMPTY_FRAGMENT_VALUE: EditorDocumentValue = Object.freeze({
  children: Object.freeze([]),
});
const DEFAULT_VIEW: AuthoredView = Object.freeze({
  intent: 'edit',
  projection: 'accepted',
});
const authoredViewState = (editor: Editor) => {
  const runtime = getEditorRuntime(editor);
  const existing = VIEWS.get(runtime);
  if (existing) return existing;
  const view = {
    composition: null,
    policy: Object.freeze({ ...DEFAULT_VIEW }),
  };
  VIEWS.set(runtime, view);
  return view;
};
const authoredView = (editor: Editor) => authoredViewState(editor).policy;

const receiveAuthoredProjection = (
  live: AuthoredRuntime,
  tx: EditorUpdateTransaction
): NonNullable<AuthoredTransaction['decision']> => {
  const active = getDefined(live.active);
  if (!active.receiving) {
    throw new Error('Missing authored receive transaction.');
  }
  if (active.decision) return active.decision;
  const schema: InternalEditorSchemaApi = getEditorSchema(live.source);
  let nextAccepted = live.accepted;
  let nextAcceptedPositions = live.acceptedPositions;
  let nextProjected = live.projected;
  let nextProjectedPositions = live.projectedPositions;
  let nextProjectedChange = DocumentChange.empty;
  const batches = tx.effects.all().flatMap((effect) => {
    const batch = readAuthoredOperationBatch(effect);
    return batch ? [batch] : [];
  });
  const nextState = tx.getField(authoredState);
  let replayState = active.receiving;
  let replayFrom = 0;
  let receivedAcceptedChange = DocumentChange.empty;
  const baseIndex = batches.findLastIndex((batch) => batch.checkpoint);
  const base = batches[baseIndex];
  if (base?.checkpoint) {
    if (
      base.documentId !== active.receiving.documentId &&
      active.receiving.operations
    ) {
      throw new Error('Authored operations belong to another document.');
    }
    replayState = base.checkpoint.state ?? emptyAuthoredState(base.documentId);
    for (const operation of base.operations) {
      replayState = reduceAuthoredOperation(replayState, operation);
    }
    if (!base.checkpoint.state) {
      replayState = snapshotEditorJsonValue(
        {
          ...replayState,
          acceptedPositions: base.checkpoint.positions,
        },
        'Authored checkpoint'
      );
    }
    const restored = restoreProjection(
      replayState,
      base.checkpoint.accepted as EditorDocumentValue,
      schema,
      live.source
    );
    schema.assertDocument(base.checkpoint.accepted);
    schema.assertDocument(restored.projected);
    nextAccepted = base.checkpoint.accepted;
    nextProjected = restored.projected;
    nextAcceptedPositions = restored.acceptedPositions;
    nextProjectedPositions = restored.projectedPositions;
    nextProjectedChange = DocumentChange.between(live.projected, nextProjected);
    receivedAcceptedChange = DocumentChange.between(
      live.accepted,
      nextAccepted
    );
    replayFrom = baseIndex + 1;
  } else if (nextState.documentId !== active.receiving.documentId) {
    throw new Error('Missing authored document checkpoint.');
  }
  for (const batch of batches.slice(replayFrom)) {
    const incoming = batch.operations.filter(
      (operation) => !readRecord(replayState.operations, operation.id)
    );
    if (incoming.length) {
      replayState = retainAuthoredContent(replayState, batch.retained);
    }
    for (const operation of incoming) {
      const reduced = reduceAuthoredOperation(replayState, operation);
      if (reduced === replayState) continue;
      const next = projectAuthoredOperation({
        editor: live.source,
        operation,
        previous: replayState,
        projection: {
          accepted: nextAccepted,
          acceptedPositions: nextAcceptedPositions,
          projected: nextProjected,
          projectedPositions: nextProjectedPositions,
        },
        schema,
        state: reduced,
      });
      receivedAcceptedChange = receivedAcceptedChange.compose(
        next.acceptedChange,
        live.accepted
      );
      nextProjectedChange = nextProjectedChange.compose(
        next.projectedChange,
        live.projected
      );
      ({
        accepted: nextAccepted,
        acceptedPositions: nextAcceptedPositions,
        projected: nextProjected,
        projectedPositions: nextProjectedPositions,
      } = next.projection);
      replayState = reduced;
    }
  }
  compactAuthoredTransaction(
    live,
    tx,
    batches.flatMap((batch) => [
      ...batch.operations.flatMap(authoredOperationChangeIds),
      ...batch.retained.map((operation) => operation.changeId),
    ])
  );
  active.decision = {
    acceptedChange: receivedAcceptedChange,
    projectedChange: nextProjectedChange,
    projection: {
      accepted: nextAccepted,
      acceptedPositions: nextAcceptedPositions,
      projected: nextProjected,
      projectedPositions: nextProjectedPositions,
    },
  };
  return active.decision;
};

const readAuthoredViewProjection = (
  live: AuthoredRuntime,
  view: Editor,
  coordinates: 'accepted' | 'input' | 'proposed' | 'view' = 'view'
): AuthoredRangeProjection => {
  const tx = getActiveEditorTransaction(live.source);
  const state = tx
    ? tx.getField(authoredState)
    : live.source.read.getField(authoredState);
  const fragment = FRAGMENT_VIEWS.get(getEditorRuntime(view));
  if (fragment && coordinates === 'view') {
    return (
      readBoundFragmentProjection(
        fragment,
        readAuthoredViewProjection(live, view, 'accepted'),
        readAuthoredViewProjection(live, view, 'proposed'),
        tx ? undefined : live
      ) ?? { positions: null, state, value: EMPTY_FRAGMENT_VALUE }
    );
  }
  let projection: AuthoredProjection = live;
  const { active } = live;
  if (tx && active) {
    if (active.replacement) {
      if (active.replacement.phase !== 'loaded') {
        throw new Error('Authored reads require a completed document load.');
      }
      ({ projection } = active.replacement);
    } else if (active.receiving) {
      ({ projection } = receiveAuthoredProjection(live, tx));
    } else if (active.decision) ({ projection } = active.decision);
    else {
      const change = getActiveTransactionDocumentChange(live.source);
      if (!change.empty) {
        if (active.rangeProjection?.change === change) {
          ({ projection } = active.rangeProjection);
        } else {
          const operationId = `${live.replica}:${
            (readRecord(state.vector, live.replica) ?? 0) + 1
          }`;
          const changeId = active.changeId ?? operationId;
          const captured = captureAuthoredChange({
            schema: getCompiledEditorSchemaFromApi(
              getEditorSchema(live.source)
            ),
            insertions: active.insertions,
            change,
            steps: getActiveDocumentChangeBuilder(live.source).steps,
            changeId,
            operationId,
            positions: active.proposed
              ? live.projectedPositions
              : live.acceptedPositions,
            value: active.proposed ? live.projected : live.accepted,
          });
          const { value } = getActiveDocumentChangeBuilder(live.source);
          if (active.proposed) {
            projection = {
              accepted: live.accepted,
              acceptedPositions: live.acceptedPositions,
              projected: value as EditorDocumentValue,
              projectedPositions: captured.positions,
            };
          } else if (live.acceptedPositions === live.projectedPositions) {
            projection = {
              accepted: value as EditorDocumentValue,
              acceptedPositions: captured.positions,
              projected: value as EditorDocumentValue,
              projectedPositions: captured.positions,
            };
          } else {
            const mapped = mapAuthoredChange({
              state,
              acceptedEdit: true,
              changeId,
              direction: 'forward',
              operationId,
              positions: live.projectedPositions,
              steps: captured.steps,
              value: live.projected,
            });
            projection = {
              accepted: value as EditorDocumentValue,
              acceptedPositions: captured.positions,
              projected: new ChangeDraft(live.projected).apply(mapped.change)
                .after as EditorDocumentValue,
              projectedPositions: mapped.positions,
            };
          }
          active.rangeProjection = { change, projection };
        }
      }
    }
  }
  const accepted =
    coordinates === 'accepted'
      ? true
      : coordinates === 'proposed'
        ? false
        : coordinates === 'input' && active
          ? !active.proposed
          : authoredView(view).projection === 'accepted';
  return {
    positions: accepted
      ? projection.acceptedPositions
      : projection.projectedPositions,
    state,
    value: accepted ? projection.accepted : projection.projected,
  };
};

const ensureViewSelection = (view: Editor) => {
  if (VIEW_SELECTIONS.has(getEditorRuntime(view))) return;
  const live = runtime(view);
  const captured = withEditorDocumentProjection(live.source, undefined, () =>
    captureAuthoredSelection(
      getCurrentSelection(live.source),
      getCurrentSelectionRoot(live.source),
      live.acceptedPositions,
      live.accepted as JsonEditorValue
    )
  );
  VIEW_SELECTIONS.set(getEditorRuntime(view), captured);
};

const readBoundFragmentProjection = (
  binding: NonNullable<ReturnType<typeof FRAGMENT_VIEWS.get>>,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection,
  live?: AuthoredRuntime
) => {
  if (binding.documentId !== proposed.state.documentId) {
    return null;
  }
  if (
    binding.requireMarkupParent &&
    authoredView(binding.parent).projection !== 'markup'
  ) {
    return null;
  }
  const current = readAuthoredMarkupFragments(
    binding.fragment.changeId,
    accepted,
    proposed
  ).find(
    (fragment) =>
      fragment.id === binding.fragment.id &&
      fragment.root === binding.fragment.root
  );
  if (current && live) {
    let fragments = live.fragments.get(current.changeId);
    if (!fragments) {
      fragments = new Map();
      live.fragments.set(current.changeId, fragments);
    }
    const previous = fragments.get(current.id);
    if (previous && previous !== current) {
      inheritAuthoredFragmentProjection(live.source, previous, current);
    }
    fragments.set(current.id, current);
  }
  return current
    ? readAuthoredFragmentProjection(current, proposed.state)
    : null;
};

const readViewSelection = (view: Editor, live: AuthoredRuntime) => {
  const captured = VIEW_SELECTIONS.get(getEditorRuntime(view)) ?? null;
  const accepted = authoredView(view).projection === 'accepted';
  const selection = resolveAuthoredSelection(
    captured,
    accepted ? live.acceptedPositions : live.projectedPositions,
    accepted ? live.accepted : live.projected,
    getEditorStateView(live.source).getField(authoredState)
  );
  return {
    selection,
    root: selection
      ? (SelectionApi.root(selection) ?? 'main')
      : (captured?.root ?? 'main'),
  };
};

const rangeUsesOnlyAcceptedContent = (
  live: AuthoredRuntime,
  view: Editor,
  range: Range
) => {
  if (RangeApi.isCollapsed(range)) return true;
  const root = range.anchor.root ?? 'main';
  if ((range.focus.root ?? 'main') !== root) return false;
  const projectedView = readAuthoredViewProjection(live, view, 'proposed');
  const acceptedView = readAuthoredViewProjection(live, view, 'accepted');
  const projected = readRecord(projectedView.positions, root);
  const accepted = readRecord(acceptedView.positions, root);
  if (!projected?.present || !accepted?.present) return false;
  const document = DocumentIndex.fromValue(
    authoredRootNodes(projectedView.value, root)
  );
  const offsets = [
    document.positionAt(range.anchor),
    document.positionAt(range.focus),
  ];
  const from = Math.min(...offsets);
  const to = Math.max(...offsets);

  return [...authoredPositionSpans(projected.positions, from, to)].every(
    ({ from: spanFrom, span, to: spanTo }) => {
      const selectedFrom = Math.max(from, spanFrom);
      const selectedTo = Math.min(to, spanTo);
      const originFrom = span.offset + selectedFrom - spanFrom;
      const originTo = span.offset + selectedTo - spanFrom;
      let coveredTo = originFrom;
      for (const currentSpan of authoredOriginSpans(
        accepted.positions,
        span.origin,
        { from: originFrom, to: originTo }
      )
        .map(({ span: acceptedSpan }) => ({
          from: Math.max(originFrom, acceptedSpan.offset),
          to: Math.min(originTo, acceptedSpan.offset + acceptedSpan.length),
        }))
        .sort((left, right) => left.from - right.from)) {
        if (currentSpan.from > coveredTo) return false;
        coveredTo = Math.max(coveredTo, currentSpan.to);
      }
      return coveredTo >= originTo;
    }
  );
};

const projectAcceptedRange = (
  live: AuthoredRuntime,
  view: Editor,
  range: Range
) => {
  if (!rangeUsesOnlyAcceptedContent(live, view, range)) return null;
  const options = {
    association: 'inward' as const,
    deletion: 'drop' as const,
    ...(range.anchor.root && range.anchor.root !== 'main'
      ? { root: range.anchor.root }
      : {}),
  };
  let projection = readAuthoredViewProjection(live, view, 'proposed');
  const source = bindAuthoredDocumentRange(
    { range },
    options,
    () => projection,
    () => false
  );
  projection = readAuthoredViewProjection(live, view, 'accepted');
  const accepted = source.resolve();
  if (!accepted) return null;
  const target = bindAuthoredDocumentRange(
    { range: accepted },
    options,
    () => projection,
    () => false
  );
  projection = readAuthoredViewProjection(live, view, 'proposed');

  return RangeApi.equals(target.resolve(), range) ? accepted : null;
};

const projectAcceptedPath = (
  live: AuthoredRuntime,
  view: Editor,
  path: Path,
  root: string
) => {
  const options = {
    association: 'forward' as const,
    deletion: 'drop' as const,
    ...(root === 'main' ? {} : { root }),
  };
  let projection = readAuthoredViewProjection(live, view, 'proposed');
  const source = bindAuthoredDocumentPath(
    path,
    options,
    () => projection,
    () => false
  );
  projection = readAuthoredViewProjection(live, view, 'accepted');
  const accepted = source.resolve();
  if (!accepted) return null;
  const target = bindAuthoredDocumentPath(
    accepted,
    options,
    () => projection,
    () => false
  );
  projection = readAuthoredViewProjection(live, view, 'proposed');

  return PathApi.equals(target.resolve() ?? [], path) ? accepted : null;
};

const projectAcceptedSelection = (
  live: AuthoredRuntime,
  view: Editor,
  selection: Selection
): Selection => {
  if (!selection) return null;
  if (RangeApi.isRange(selection)) {
    const range = projectAcceptedRange(live, view, selection);
    return range ? Object.freeze({ ...selection, ...range }) : null;
  }
  const root = selection.root ?? 'main';
  const paths = selection.paths.map((path) =>
    projectAcceptedPath(live, view, path, root)
  );
  if (paths.some((path) => !path)) return null;
  const accepted = paths.map((path) => getDefined(path));
  const anchorIndex = selection.paths.findIndex((path) =>
    PathApi.equals(path, selection.anchorPath)
  );
  const focusIndex = selection.paths.findIndex((path) =>
    PathApi.equals(path, selection.focusPath)
  );

  return SelectionApi.nodes([getDefined(accepted[0]), ...accepted.slice(1)], {
    anchorPath: getDefined(accepted[anchorIndex]),
    focusPath: getDefined(accepted[focusIndex]),
    ...(root === 'main' ? {} : { root }),
  });
};

const readAcceptedViewSelection = (view: Editor, live: AuthoredRuntime) => {
  const visible = readViewSelection(view, live);
  const selection = projectAcceptedSelection(live, view, visible.selection);
  if (visible.selection && !selection) return null;

  return {
    selection,
    root: selection ? (SelectionApi.root(selection) ?? 'main') : visible.root,
  };
};

const setAuthoredView = (editor: Editor, value: AuthoredView) => {
  if (FRAGMENT_VIEWS.has(getEditorRuntime(editor))) {
    throw new Error('Retained content follows its parent markup view.');
  }
  const live = runtime(editor);
  if (
    !value ||
    (value.intent !== 'edit' && value.intent !== 'propose') ||
    !['accepted', 'proposed', 'markup'].includes(value.projection) ||
    (value.projection === 'accepted' && value.intent !== 'edit') ||
    (value.projection === 'proposed' && value.intent !== 'propose')
  ) {
    throw new Error(
      'Authored input requires edit/accepted/markup or propose/proposed/markup.'
    );
  }
  if (live.active) {
    throw new Error('Change authored view policy outside an editor update.');
  }
  if (editor.read.view.isComposing()) {
    PENDING_VIEWS.set(getEditorRuntime(editor), Object.freeze({ ...value }));
    return;
  }
  PENDING_VIEWS.delete(getEditorRuntime(editor));
  ensureViewSelection(editor);
  const previous = authoredView(editor);
  if (
    previous.intent === value.intent &&
    previous.projection === value.projection
  ) {
    return;
  }
  authoredViewState(editor).policy = Object.freeze({ ...value });
  notifyEditorViewState(editor, 'authored');
};

const projectionSnapshot = (
  source: Editor,
  value: EditorDocumentValue,
  version: number,
  selection: Selection
): EditorSnapshot => {
  let index: EditorSnapshot['index'] | undefined;
  return Object.freeze({
    children: value.children,
    selection,
    version,
    get index() {
      return (index ??= getEditorProjectionSnapshotIndex(
        source,
        value.children
      ));
    },
  });
};

const runtime = (editor: Editor): AuthoredRuntime => {
  const installed = RUNTIMES.get(getEditorRuntimeOwner(editor));
  if (!installed) throw new Error('Authored changes are not installed.');
  return installed;
};

const currentAuthoredFragmentIndex = (live: AuthoredRuntime) => {
  const state = live.source.read.getField(authoredState);
  return (live.fragmentIndex ??= createAuthoredFragmentIndex(
    live.source,
    {
      positions: live.acceptedPositions,
      state,
      value: live.accepted,
    },
    {
      positions: live.projectedPositions,
      state,
      value: live.projected,
    }
  ));
};

const actor = (state: AuthoredRuntime): string => {
  if (!state.active) {
    throw new Error('Authored writes require an active editor update.');
  }
  if (state.active.replacement) {
    throw new Error('Document replacement cannot mix with authored writes.');
  }
  if (state.active.actor) return state.active.actor;
  const identity =
    typeof state.options.authorId === 'function'
      ? state.options.authorId(state.source)
      : state.options.authorId;
  if (
    typeof identity !== 'string' ||
    !identity ||
    identity.includes('\u0000')
  ) {
    throw new Error('An authenticated author is required for authored writes.');
  }
  state.active.actor = identity;
  return identity;
};

const content = (value: EditorDocumentValue): EditorDocumentValue =>
  Object.freeze({
    children: value.children,
    ...(value.roots ? { roots: value.roots } : {}),
  });

const seedAuthoredProjectionNodeKeys = (
  editor: Editor,
  value: EditorDocumentValue
) => {
  seedNodeKeys(value.children, editor);
  for (const children of Object.values(value.roots ?? {})) {
    seedNodeKeys(children, editor);
  }
};

const restoreInitialProjection = (
  state: AuthoredState,
  value: EditorDocumentValue,
  schema: InternalEditorSchemaApi,
  editor: Editor
) => {
  if (
    !state.operations &&
    !state.acceptedPositions &&
    !state.projected &&
    !state.projectedPositions
  ) {
    const accepted = content(value);
    const positions = createAuthoredPositionRoots(accepted, state.documentId);

    return {
      acceptedPositions: positions,
      projected: accepted,
      projectedPositions: positions,
    };
  }

  return restoreProjection(state, value, schema, editor);
};

const restoreProjection = (
  state: AuthoredState,
  value: EditorDocumentValue,
  schema: InternalEditorSchemaApi,
  editor: Editor
) =>
  profileCoreDuration('authored-restore', () => {
    const accepted = content(value) as JsonEditorValue;
    if (!state.acceptedPositions && state.operations) {
      throw new Error('Missing authored accepted-position checkpoint.');
    }
    const acceptedPositions =
      state.acceptedPositions ??
      createAuthoredPositionRoots(accepted, state.documentId);
    const assertPositions = (
      positions: AuthoredPositionRoots,
      document: JsonEditorValue,
      label: string
    ) => {
      const present = new Set(['main', ...Object.keys(document.roots ?? {})]);
      for (const [root, current] of records(positions)) {
        if (current.present !== present.has(root)) {
          throw new Error(
            `Authored checkpoint does not match the ${label} document roots.`
          );
        }
        if (
          current.present &&
          (current.positions.root?.length ?? 0) !==
            DocumentIndex.fromValue(authoredRootNodes(document, root)).length
        ) {
          throw new Error(
            `Authored checkpoint does not match the ${label} content.`
          );
        }
        present.delete(root);
      }
      if (present.size) throw new Error(`Missing authored ${label} positions.`);
    };
    assertPositions(acceptedPositions, accepted, 'accepted');
    if (state.projectedPositions) {
      if (!state.projected) {
        throw new Error('Missing authored proposed checkpoint.');
      }
      const { projected } = state;
      schema.assertDocument(projected);
      assertPositions(state.projectedPositions, projected, 'projected');
      return {
        acceptedPositions,
        projected,
        projectedPositions: state.projectedPositions,
      };
    }
    const { projection } = projectAuthoredSteps({
      editor,
      projection: {
        accepted: accepted as EditorDocumentValue,
        acceptedPositions,
        projected: accepted as EditorDocumentValue,
        projectedPositions: acceptedPositions,
      },
      schema,
      state,
      projectionOnly: true,
      steps: [...records(state.operations)]
        .map(([, operation]) => operation)
        .filter(
          (operation): operation is AuthoredEdit =>
            operation.kind === 'edit' &&
            operation.proposal &&
            ['pending', 'conflicted'].includes(
              readRecord(state.changes, operation.changeId)?.status ?? ''
            )
        )
        .sort(
          (left, right) =>
            left.clock - right.clock || left.id.localeCompare(right.id)
        )
        .map((operation) => ({
          operation,
          direction: 'forward',
          target: 'projected',
        })),
    });
    const restored = {
      acceptedPositions,
      projected: projection.projected,
      projectedPositions: projection.projectedPositions,
    };
    schema.assertDocument(projection.projected);
    rememberLegacyAuthoredProjection(state, {
      projected: projection.projected,
      projectedPositions: projection.projectedPositions,
    });
    return restored;
  });

const emitAuthoredOperation = (
  live: AuthoredRuntime,
  tx: EditorUpdateTransaction,
  operation: AuthoredOperation
) => {
  const state = tx.getField(authoredState);
  const changeIds = authoredOperationChangeIds(operation);
  const retained = new Map<string, AuthoredEdit>();
  for (const changeId of changeIds) {
    const change = readRecord(state.changes, changeId);
    for (const [, id] of records(change?.operations ?? null)) {
      const selected = readRecord(state.operations, id);
      if (selected && hasAuthoredContent(selected)) {
        retained.set(id, materializeAuthoredEdit(selected));
      }
    }
  }
  if (operation.kind === 'edit' && operation.inverseOf) {
    const original = readRecord(state.operations, operation.inverseOf);
    if (original && hasAuthoredContent(original)) {
      retained.set(original.id, materializeAuthoredEdit(original));
    }
  }
  tx.effects.emit(
    authoredOperationEffect,
    snapshotAuthoredOperationBatch(
      {
        checkpoint: null,
        documentId: state.documentId,
        operations: [operation],
        retained: [...retained.values()],
      },
      'Authored operations'
    )
  );
  compactAuthoredTransaction(live, tx, [
    ...changeIds,
    ...(live.active?.hydratedChanges ?? []),
    ...[...retained.values()].map((entry) => entry.changeId),
  ]);
};

const authoredOperationChangeIds = (operation: AuthoredOperation) =>
  operation.kind === 'edit'
    ? [operation.changeId]
    : operation.selection.changes.map((change) => change.id);

const compactAuthoredTransaction = (
  live: AuthoredRuntime,
  tx: EditorUpdateTransaction,
  changeIds: Iterable<string>
) => {
  if (live.options.retainHistory) return;
  const previous = tx.getField(authoredState);
  const value = compactAuthoredContent(previous, new Set(changeIds));
  if (value === previous) return;
  tx.effects.emit(
    authoredState.effect,
    snapshotEditorJsonValue(
      { previousValue: previous, value },
      'Authored content retention'
    )
  );
};

const stageAuthoredProjection = (
  live: AuthoredRuntime,
  next: NonNullable<AuthoredTransaction['decision']>
) => {
  const { active } = live;
  if (!active) throw new Error('Missing authored transaction.');
  const prior = active.decision;
  active.decision = {
    acceptedChange: prior
      ? prior.acceptedChange.compose(next.acceptedChange, active.before)
      : next.acceptedChange,
    projectedChange: prior
      ? prior.projectedChange.compose(next.projectedChange, live.projected)
      : next.projectedChange,
    projection: next.projection,
  };
};

const prepareAuthoredReview = (live: AuthoredRuntime) => {
  const active = getDefined(live.active);
  if (active.automatic && !active.changed) {
    setTransactionPublicationChange(live.source, DocumentChange.empty);
    active.proposed = false;
    active.automatic = false;
  }
};

const undoAuthoredEdit = (
  live: AuthoredRuntime,
  tx: EditorUpdateTransaction,
  operation: AuthoredEdit
) => {
  const authorId = actor(live);
  const active = getDefined(live.active);
  prepareAuthoredReview(live);
  const state = tx.getField(authoredState);
  const record = readRecord(state.changes, operation.changeId);
  if (
    authorId !== operation.authorId ||
    !record ||
    (operation.proposal && record.status !== 'pending')
  ) {
    throw new AuthoredMappingConflictError([operation.changeId]);
  }
  if (active.proposed || (active.changed && !active.decision)) {
    throw new Error('Authored history must precede ordinary document writes.');
  }
  const before = active.decision?.projection ?? {
    accepted: live.accepted,
    acceptedPositions: live.acceptedPositions,
    projected: live.projected,
    projectedPositions: live.projectedPositions,
  };
  const value = operation.proposal ? before.projected : before.accepted;
  const positions = operation.proposal
    ? before.projectedPositions
    : before.acceptedPositions;
  const sequence = (readRecord(state.vector, live.replica) ?? 0) + 1;
  const id = `${live.replica}:${sequence}`;
  const changeId = operation.proposal
    ? operation.changeId
    : crypto.randomUUID();
  const schema = getEditorSchema(live.source);
  if (operation.retained) {
    const fragment = readAuthoredMarkupFragments(
      operation.changeId,
      {
        positions: before.acceptedPositions,
        state,
        value: before.accepted,
      },
      {
        positions: before.projectedPositions,
        state,
        value: before.projected,
      }
    ).find((item) => item.id === operation.retained);
    const projection =
      fragment && readAuthoredFragmentProjection(fragment, state);
    if (!projection) {
      throw new AuthoredMappingConflictError([operation.changeId]);
    }
    const captured = mapAuthoredChange({
      state,
      captureAs: { changeId, operationId: id },
      changeId,
      direction: 'inverse',
      operationId: operation.id,
      positions: projection.positions,
      steps: operation.steps,
      value: projection.value,
    });
    stageAuthoredProjection(live, {
      acceptedChange: DocumentChange.empty,
      projectedChange: DocumentChange.empty,
      projection: before,
    });
    emitAuthoredOperation(
      live,
      tx,
      snapshotEditorJsonValue(
        {
          authorId,
          changeId,
          clock: state.clock + 1,
          dependencies: captured.dependencies,
          id,
          inverseOf: operation.id,
          kind: 'edit',
          parents: state.frontier,
          proposal: true,
          retained: operation.retained,
          steps: captured.steps,
          replica: live.replica,
          seen: state.vector,
          sequence,
          time: Date.now(),
        },
        'Retained authored history compensation'
      )
    );
    return;
  }
  const mapped = mapAuthoredChange({
    state,
    captureAs: { changeId, operationId: id },
    properties: {
      editor: live.source,
      state,
      schema: getCompiledEditorSchemaFromApi(schema),
      isVisible: (edit) =>
        edit.id !== operation.id &&
        (operation.proposal
          ? readRecord(state.changes, edit.changeId)?.status !== 'rejected'
          : readRecord(state.changes, edit.changeId)?.status === 'accepted'),
    },
    accepted: operation.proposal
      ? {
          isAccepted: (identity) =>
            readRecord(state.changes, identity)?.status === 'accepted',
          positions: before.acceptedPositions,
          value: before.accepted,
        }
      : undefined,
    changeId: operation.changeId,
    direction: 'inverse',
    operationId: operation.id,
    positions,
    steps: operation.steps,
    value,
  });
  const captured = mapped;
  const apply = (change: DocumentChange, document: EditorDocumentValue) => {
    const step = new ChangeDraft(document).apply(change);
    schema.validateDocumentChange({
      before: document,
      after: step.after as EditorDocumentValue,
      change,
      indexedBefore: step.indexedBefore,
      indexedAfter: step.indexedAfter,
    });
    return step.after as EditorDocumentValue;
  };
  let acceptedChange = DocumentChange.empty;
  let projectedChange = mapped.change;
  let { accepted } = before;
  let { acceptedPositions } = before;
  let projectedPositions = captured.positions;
  if (!operation.proposal) {
    acceptedChange = mapped.change;
    accepted = apply(acceptedChange, accepted);
    acceptedPositions = captured.positions;
    if (before.acceptedPositions !== before.projectedPositions) {
      const projected = mapAuthoredChange({
        state,
        acceptedEdit: true,
        changeId,
        direction: 'forward',
        operationId: id,
        positions: before.projectedPositions,
        steps: captured.steps,
        value: before.projected,
      });
      projectedChange = projected.change;
      projectedPositions = projected.positions;
    }
  }
  const projected = apply(projectedChange, before.projected);
  const next: AuthoredEdit = snapshotEditorJsonValue(
    {
      authorId,
      changeId,
      clock: state.clock + 1,
      dependencies: captured.dependencies,
      id,
      inverseOf: operation.id,
      kind: 'edit',
      parents: state.frontier,
      proposal: operation.proposal,
      steps: captured.steps,
      replica: live.replica,
      seen: state.vector,
      sequence,
      time: Date.now(),
    },
    'Authored history compensation'
  );
  stageAuthoredProjection(live, {
    acceptedChange,
    projectedChange,
    projection: { accepted, acceptedPositions, projected, projectedPositions },
  });
  active.applyingDecision = true;
  try {
    tx.changes.apply(acceptedChange);
    emitAuthoredOperation(live, tx, next);
  } finally {
    active.applyingDecision = false;
  }
};

const undoAuthoredReview = (
  live: AuthoredRuntime,
  tx: EditorUpdateTransaction,
  operation: AuthoredReview
) => {
  const authorId = actor(live);
  const active = getDefined(live.active);
  prepareAuthoredReview(live);
  if (authorId !== operation.authorId) {
    throw new AuthoredMappingConflictError(
      operation.selection.changes.map((change) => change.id)
    );
  }
  if (active.proposed || (active.changed && !active.decision)) {
    throw new Error('Authored history must precede ordinary document writes.');
  }
  const state = tx.getField(authoredState);
  const before = active.decision?.projection ?? {
    accepted: live.accepted,
    acceptedPositions: live.acceptedPositions,
    projected: live.projected,
    projectedPositions: live.projectedPositions,
  };
  const prepared = projectAuthoredReviewUndo({
    editor: live.source,
    operation,
    projection: before,
    schema: getEditorSchema(live.source),
    state,
  });
  const sequence = (readRecord(state.vector, live.replica) ?? 0) + 1;
  const next: AuthoredReview = snapshotEditorJsonValue(
    {
      action: operation.action,
      authorId,
      clock: state.clock + 1,
      id: `${live.replica}:${sequence}`,
      kind: 'undo',
      parents: state.frontier,
      replica: live.replica,
      seen: state.vector,
      sequence,
      time: Date.now(),
      undoOf: operation.id,
      selection: {
        documentId: state.documentId,
        changes: operation.selection.changes.map(({ id }) => {
          const change = getDefined(readRecord(state.changes, id));
          return { id, revision: change.revision, heads: change.heads };
        }),
      },
    },
    'Authored review compensation'
  );
  stageAuthoredProjection(live, prepared);
  active.applyingDecision = true;
  try {
    tx.changes.apply(prepared.acceptedChange);
    emitAuthoredOperation(live, tx, next);
  } finally {
    active.applyingDecision = false;
  }
};

/** Install native attribution and retained proposals on one editor. */
export const authored = (options: AuthoredOptions): AuthoredPlugin =>
  definePlugin('authored', {
    api: ({ editor }) => ({
      setView: (value: AuthoredView) => setAuthoredView(editor, value),
      subscribeChanges: (
        listener: (publication: AuthoredChangePublication) => void
      ) => runtime(editor).subscribeChanges(editor, listener),
    }),
    stateFields: [authoredState],
    effectTypes: [authoredOperationEffect, authoredHistoryEffect],
    activate({ editor, onCleanup }) {
      const source = getEditorRuntimeOwner(editor);
      const existing = RUNTIMES.get(source);
      const initialState = editor.read.getField(authoredState);
      const initialValue = editor.read.value();
      const schema: InternalEditorSchemaApi = getEditorSchema(source);
      const changeListeners = new Map<
        Editor,
        Set<(publication: AuthoredChangePublication) => void>
      >();
      const live: AuthoredRuntime = {
        accepted: content(initialValue),
        active: null,
        fragmentIndex: null,
        fragments: new Map(),
        ...restoreInitialProjection(initialState, initialValue, schema, source),
        options,
        replica: crypto.randomUUID(),
        source,
        subscribeChanges(view, listener) {
          if (getEditorRuntimeOwner(view) !== source) {
            throw new Error(
              'Authored change subscriptions require this editor.'
            );
          }
          const listeners = changeListeners.get(view) ?? new Set();
          listeners.add(listener);
          changeListeners.set(view, listeners);
          fragmentIndex();
          observeFragments();
          return () => {
            if (!listeners.delete(listener)) return;
            if (!listeners.size) changeListeners.delete(view);
            releaseFragmentObservation();
          };
        },
      };
      seedAuthoredProjectionNodeKeys(source, live.projected);
      indexAuthoredState(editor.read.getField(authoredState));
      RUNTIMES.set(source, live);
      const renderScopes = new Map<
        string,
        {
          accepted: AuthoredRangeProjection;
          proposed: AuthoredRangeProjection;
          children: readonly Descendant[];
          segments: readonly NativeAuthoredRenderSegment[];
        }
      >();
      const fragmentListeners = new Map<string, Set<() => void>>();
      const fragmentViewListeners = new Map<
        string,
        Set<(commit: EditorCommit) => void>
      >();
      const fragmentPublications = new WeakMap<
        EditorCommit,
        {
          affected: ReadonlySet<string>;
          changed: ReadonlySet<string>;
          nodeKeys: ReadonlySet<NodeKey>;
        }
      >();
      let stopFragmentListener: (() => void) | undefined;
      const observeFragments = () => {
        if (stopFragmentListener) return;
        const queue = createEditorCommitPublicationQueue(
          getLastCommit(source)?.version ?? 0
        );
        stopFragmentListener = source.subscribeCommit((commit, snapshot) => {
          publishEditorCommitInVersionOrder(
            queue,
            commit,
            snapshot,
            (published) => {
              const publication = fragmentPublications.get(published);
              for (const id of publication?.affected ?? []) {
                for (const listener of [
                  ...(fragmentViewListeners.get(id) ?? []),
                ]) {
                  listener(published);
                }
              }
              for (const bucket of publication?.changed ?? []) {
                for (const listener of [
                  ...(fragmentListeners.get(bucket) ?? []),
                ]) {
                  listener();
                }
              }
              if (publication) {
                const changePublication = Object.freeze({
                  changeIds: Object.freeze([...publication.affected]),
                  documentChanged: published.changed.hasAny('document'),
                  nodeKeys: Object.freeze([...publication.nodeKeys]),
                });
                for (const listeners of [...changeListeners.values()]) {
                  for (const listener of [...listeners]) {
                    listener(changePublication);
                  }
                }
              }
            }
          );
        });
      };
      const releaseFragmentObservation = () => {
        if (
          fragmentListeners.size ||
          fragmentViewListeners.size ||
          changeListeners.size
        ) {
          return;
        }
        stopFragmentListener?.();
        stopFragmentListener = undefined;
        renderScopes.clear();
      };
      const fragmentIndex = () => currentAuthoredFragmentIndex(live);
      const projections = new WeakMap<
        EditorCommit,
        {
          acceptedBefore: EditorDocumentValue;
          acceptedAfter: EditorDocumentValue;
          acceptedPositionsBefore: AuthoredPositionRoots;
          acceptedPositionsAfter: AuthoredPositionRoots;
          projectedPositionsBefore: AuthoredPositionRoots;
          projectedPositionsAfter: AuthoredPositionRoots;
          state: AuthoredState;
          stateBefore: AuthoredState;
          proposed: boolean;
          historySelectionBefore: AuthoredViewSelection;
          view: Editor | null;
          viewSelectionBefore: AuthoredViewSelection;
          viewSelectionAfter: AuthoredViewSelection;
          before: EditorDocumentValue;
          after: EditorDocumentValue;
          change: DocumentChange;
          commits: WeakMap<Editor, EditorCommit>;
        }
      >();
      const cleanup = registerAuthoredRuntime(source, {
        subscribeFragment(view, listener) {
          const binding = FRAGMENT_VIEWS.get(getEditorRuntime(view));
          if (!binding) return undefined;
          const { changeId } = binding.fragment;
          const listeners = fragmentViewListeners.get(changeId) ?? new Set();
          const notify: typeof listener = (commit) => listener(commit);
          listeners.add(notify);
          fragmentViewListeners.set(changeId, listeners);
          fragmentIndex();
          observeFragments();
          return () => {
            if (!listeners.delete(notify)) return;
            if (!listeners.size) fragmentViewListeners.delete(changeId);
            releaseFragmentObservation();
          };
        },
        view: authoredView,
        fragmentVersion(view) {
          return !FRAGMENT_VIEWS.has(getEditorRuntime(view)) &&
            authoredView(view).projection === 'markup' &&
            fragmentIndex().buckets
            ? source.read.getField(authoredState)
            : null;
        },
        fragmentSlots(view, nodeKey, root) {
          if (
            FRAGMENT_VIEWS.has(getEditorRuntime(view)) ||
            authoredView(view).projection !== 'markup'
          ) {
            return EMPTY_AUTHORED_FRAGMENT_SLOTS;
          }
          return (
            readRecord(
              fragmentIndex().buckets,
              authoredFragmentBucket(
                root ?? view.read.view.root() ?? 'main',
                nodeKey
              )
            )?.slots ?? EMPTY_AUTHORED_FRAGMENT_SLOTS
          );
        },
        renderSegments(view, children, root, scope) {
          const accepted = readAuthoredViewProjection(live, view, 'accepted');
          const proposed = readAuthoredViewProjection(live, view, 'proposed');
          const key = JSON.stringify([root, scope]);
          const previous = renderScopes.get(key);
          if (
            previous?.children === children &&
            previous.accepted.positions === accepted.positions &&
            previous.proposed.positions === proposed.positions &&
            previous.proposed.state === proposed.state
          ) {
            return previous.segments;
          }
          const segments = profileCoreDuration('authored-render-scope', () =>
            composeAuthoredRenderSegments(
              view,
              children,
              root,
              scope,
              accepted,
              proposed
            )
          );
          renderScopes.set(key, { accepted, proposed, children, segments });
          return segments;
        },
        subscribeFragmentSlots(view, nodeKey, listener) {
          if (FRAGMENT_VIEWS.has(getEditorRuntime(view))) return () => {};
          const bucket = authoredFragmentBucket(
            view.read.view.root() ?? 'main',
            nodeKey
          );
          const notify = () => listener();
          let listeners: Set<() => void> | null = null;
          const detach = () => {
            if (!listeners) return;
            listeners.delete(notify);
            if (!listeners.size) fragmentListeners.delete(bucket);
            listeners = null;
            releaseFragmentObservation();
          };
          const bind = () => {
            if (authoredView(view).projection !== 'markup') {
              detach();
            } else if (!listeners) {
              listeners = fragmentListeners.get(bucket) ?? new Set();
              listeners.add(notify);
              fragmentListeners.set(bucket, listeners);
              fragmentIndex();
              observeFragments();
            }
          };
          bind();
          const stopView = subscribeEditorViewState(view, (change) => {
            if (change !== 'authored') return;
            bind();
            notify();
          });
          return () => {
            stopView();
            detach();
          };
        },
        fragmentView(view) {
          return FRAGMENT_VIEWS.get(getEditorRuntime(view)) ?? null;
        },
        updateFragment(view, update, updateOptions) {
          const binding = FRAGMENT_VIEWS.get(getEditorRuntime(view));
          if (
            !binding ||
            binding.fragment.kind !== 'delete' ||
            binding.parent.read.view.isReadOnly() ||
            authoredView(binding.parent).intent !== 'propose'
          ) {
            return null;
          }
          const state = source.read.getField(authoredState);
          const change = readRecord(state.changes, binding.fragment.changeId);
          const projection = readBoundFragmentProjection(
            binding,
            readAuthoredViewProjection(live, binding.parent, 'accepted'),
            readAuthoredViewProjection(live, binding.parent, 'proposed'),
            live
          );
          if (!projection || change?.status !== 'pending') return null;
          const authorId =
            typeof live.options.authorId === 'function'
              ? live.options.authorId(source)
              : live.options.authorId;
          if (!authorId || authorId !== change.authorId) return null;
          schema.assertDocument(projection.value as EditorDocumentValue);
          const spec = view.read((current) => current.transaction(update));
          const changes = protectAuthoredRetainedContent(
            spec.changes,
            projection,
            change.id
          );
          const result = {
            changed: !changes.empty,
            fragmentId: binding.fragment.id,
            selection: spec.selection?.value ?? null,
          };
          if (changes.empty) return result;
          source.update(
            { tags: [...(updateOptions?.tags ?? []), ...spec.tags] },
            (tx) => {
              prepareAuthoredReview(live);
              const active = getDefined(live.active);
              const current = tx.getField(authoredState);
              const sequence =
                (readRecord(current.vector, live.replica) ?? 0) + 1;
              const id = `${live.replica}:${sequence}`;
              const captured = captureAuthoredChange({
                schema: getCompiledEditorSchemaFromApi(schema),
                state: current,
                change: changes,
                changeId: change.id,
                operationId: id,
                positions: projection.positions,
                value: projection.value,
              });
              active.view = binding.parent;
              stageAuthoredProjection(live, {
                acceptedChange: DocumentChange.empty,
                projectedChange: DocumentChange.empty,
                projection: {
                  accepted: live.accepted,
                  acceptedPositions: live.acceptedPositions,
                  projected: live.projected,
                  projectedPositions: live.projectedPositions,
                },
              });
              emitAuthoredOperation(
                live,
                tx,
                snapshotEditorJsonValue(
                  {
                    authorId,
                    changeId: change.id,
                    clock: current.clock + 1,
                    dependencies: captured.dependencies,
                    id,
                    inverseOf: null,
                    kind: 'edit',
                    parents: current.frontier,
                    proposal: true,
                    retained: binding.fragment.id,
                    steps: captured.steps,
                    replica: live.replica,
                    seen: current.vector,
                    sequence,
                    time: Date.now(),
                  },
                  'Retained authored edit'
                )
              );
            }
          );
          return result;
        },
        bindFragment(view, parent, fragment, requireMarkupParent) {
          const projected = readAuthoredViewProjection(
            live,
            parent,
            'proposed'
          );
          if (
            getEditorRuntimeOwner(parent) !== source ||
            getEditorRuntimeOwner(view) !== source ||
            !view.read.view.isReadOnly() ||
            FRAGMENT_VIEWS.has(getEditorRuntime(parent)) ||
            authoredView(parent).projection !== 'markup' ||
            fragment.kind === 'properties' ||
            !readAuthoredMarkupFragments(
              fragment.changeId,
              readAuthoredViewProjection(live, parent, 'accepted'),
              projected
            ).includes(fragment)
          ) {
            throw new Error(
              'Retained content requires a current markup fragment.'
            );
          }
          FRAGMENT_VIEWS.set(getEditorRuntime(view), {
            documentId: projected.state.documentId,
            fragment,
            parent,
            requireMarkupParent,
          });
          VIEW_SELECTIONS.delete(getEditorRuntime(view));
          authoredViewState(view).policy = Object.freeze({
            intent: 'propose',
            projection: 'markup',
          });
        },
        path(view, path, anchorOptions) {
          if (isBuildingTransactionSpec(source) || live.active?.replacement) {
            return undefined;
          }
          const active = getActiveEditorTransaction(source)
            ? live.active
            : null;
          const lifetime = active?.rangeLifetime;
          const tracked =
            active && !FRAGMENT_VIEWS.has(getEditorRuntime(view))
              ? createAnchor(view, path, anchorOptions, 'transaction')
              : null;
          let settled = false;
          const binding = bindAuthoredDocumentPath(
            path,
            anchorOptions,
            () => {
              const current = RUNTIMES.get(source);
              return current
                ? readAuthoredViewProjection(
                    current,
                    view,
                    tracked && !settled && view === source ? 'input' : 'view'
                  )
                : null;
            },
            () => lifetime?.aborted ?? false,
            tracked
              ? () => (settled ? undefined : tracked.resolve())
              : undefined
          );
          if (active && tracked) {
            active.ranges.push({
              release: () => tracked.release(),
              settle() {
                binding.settle();
                settled = true;
              },
            });
          }
          return binding;
        },
        range(view, input) {
          if (isBuildingTransactionSpec(source) || live.active?.replacement) {
            return undefined;
          }
          const active = getActiveEditorTransaction(source)
            ? live.active
            : null;
          const lifetime = active?.rangeLifetime;
          const tracked =
            active &&
            'range' in input &&
            !FRAGMENT_VIEWS.has(getEditorRuntime(view))
              ? createAnchor(view, input.range, input.options, 'transaction')
              : null;
          let settled = false;
          const binding = bindAuthoredDocumentRange(
            input,
            input.options,
            () => {
              const current = RUNTIMES.get(source);
              return current
                ? readAuthoredViewProjection(
                    current,
                    view,
                    input.projection ??
                      (tracked && !settled && view === source
                        ? 'input'
                        : 'view')
                  )
                : null;
            },
            () => lifetime?.aborted ?? false,
            tracked
              ? () => (settled ? undefined : tracked.resolve())
              : undefined
          );
          if (active && tracked) {
            active.ranges.push({
              release: () => tracked.release(),
              settle() {
                binding.serialize();
                settled = true;
              },
            });
          }
          return binding;
        },
        compositionChanged(view, composing) {
          if (!composing && view.read.view.isComposing()) return;
          const viewRuntime = getEditorRuntime(view);
          const pending = PENDING_VIEWS.get(viewRuntime);
          if (!composing && pending) setAuthoredView(view, pending);
          const state = authoredViewState(view);
          state.composition = composing ? { changeId: null } : null;
          state.policy = Object.freeze({ ...state.policy });
        },
        fragments(view, changeId) {
          if (
            FRAGMENT_VIEWS.has(getEditorRuntime(view)) ||
            authoredView(view).projection !== 'markup'
          ) {
            return [];
          }
          return readAuthoredMarkupFragments(
            changeId,
            readAuthoredViewProjection(live, view, 'accepted'),
            readAuthoredViewProjection(live, view, 'proposed')
          );
        },
        historyEffect: authoredHistoryEffect,
        operationEffect: authoredOperationEffect,
        inputView: (commit) => projections.get(commit)?.view ?? null,
        inputProjection: (commit) =>
          projections.get(commit)?.proposed ? 'proposed' : 'accepted',
        inputPath(view, path, root) {
          const policy = authoredView(view);
          const projected =
            policy.intent === 'edit' && policy.projection === 'markup'
              ? projectAcceptedPath(live, view, path, root)
              : path;
          if (projected && live.active?.view === view) {
            live.active.inputSelectionAllowed = true;
          }

          return projected;
        },
        inputRange(view, range) {
          const policy = authoredView(view);
          const projected =
            policy.intent === 'edit' && policy.projection === 'markup'
              ? projectAcceptedRange(live, view, range)
              : range;
          if (projected && live.active?.view === view) {
            live.active.inputSelectionAllowed = true;
          }

          return projected;
        },
        inputSelectionAllowed(view) {
          const policy = authoredView(view);
          if (policy.intent !== 'edit' || policy.projection !== 'markup') {
            return true;
          }
          if (live.active?.view === view) {
            return live.active.inputSelectionAllowed;
          }

          return readAcceptedViewSelection(view, live) !== null;
        },
        projectedChange: (commit) =>
          projections.get(commit)?.change ?? commit.changes,
        beforeValue(commit) {
          const projection = projections.get(commit);
          if (
            !projection ||
            editor.read.getField(authoredState) !== projection.state
          ) {
            return undefined;
          }
          return {
            ...projection.acceptedBefore,
            meta: {
              ...editor.read.value().meta,
              [authoredState.key]: authoredState.serialize(
                projection.stateBefore
              ),
            },
          };
        },
        readView(view, read) {
          const fragment = FRAGMENT_VIEWS.get(getEditorRuntime(view));
          if (fragment) {
            const projection = readAuthoredViewProjection(live, view);
            return withEditorDocumentProjection(
              source,
              projection.value as EditorDocumentValue,
              read,
              { root: fragment.fragment.root, selection: null }
            );
          }
          const scopedSelection = VIEW_SELECTIONS.has(getEditorRuntime(view))
            ? readViewSelection(view, live)
            : undefined;
          return withEditorDocumentProjection(
            source,
            authoredView(view).projection === 'accepted'
              ? live.accepted
              : live.projected,
            read,
            scopedSelection
          );
        },
        setView: setAuthoredView,
        replace(apply) {
          const active = getDefined(live.active);
          if (active.changed || active.decision || active.replacement) {
            throw new Error(
              'Document replacement requires its own editor update.'
            );
          }
          active.replacement = { phase: 'loading' };
          const result = apply();
          const state = getDefined(getActiveEditorTransaction(source)).getField(
            authoredState
          );
          const value = getActiveDocumentChangeBuilder(source)
            .value as EditorDocumentValue;
          const projection = {
            accepted: content(value),
            ...restoreProjection(state, value, schema, source),
          };
          schema.assertDocument(projection.projected);
          active.replacement = {
            phase: 'loaded',
            change: getActiveTransactionDocumentChange(source),
            projection,
            state,
          };
          return result;
        },
        updateView(view) {
          if (FRAGMENT_VIEWS.has(getEditorRuntime(view))) {
            throw new Error('Cannot update retained content.');
          }
          const active = getDefined(live.active);
          let inputSelection: ReturnType<typeof readViewSelection> | null =
            null;
          if (VIEW_SELECTIONS.has(getEditorRuntime(view))) {
            active.view = view;
            active.viewSelection =
              VIEW_SELECTIONS.get(getEditorRuntime(view)) ?? null;
            const selection = readViewSelection(view, live);
            const acceptedSelection =
              authoredView(view).intent === 'edit' &&
              authoredView(view).projection !== 'accepted'
                ? readAcceptedViewSelection(view, live)
                : selection;
            active.inputSelectionAllowed = acceptedSelection !== null;
            inputSelection = acceptedSelection;
            active.viewSelectionBefore = selection.selection;
            active.viewSelectionRoot = selection.root;
          }
          if (authoredView(view).intent === 'propose') {
            setTransactionDocumentProjection(source, live.projected);
            active.proposed = true;
            active.automatic = true;
          }
          if (active.view && inputSelection) {
            setTransactionViewSelection(
              source,
              inputSelection.selection,
              inputSelection.root
            );
          }
        },
        viewCommit(view, commit) {
          if (view === source && !VIEW_SELECTIONS.has(getEditorRuntime(view))) {
            return commit;
          }
          const projection = projections.get(commit);
          if (!projection) return commit;
          const cached = projection.commits.get(view);
          if (cached) return cached;
          const accepted = authoredView(view).projection === 'accepted';
          const fragment = FRAGMENT_VIEWS.get(getEditorRuntime(view));
          const fragmentValue = (phase: 'before' | 'after') => {
            if (!fragment) return null;
            const isBefore = phase === 'before';
            const state = isBefore ? projection.stateBefore : projection.state;
            return (
              (readBoundFragmentProjection(
                fragment,
                {
                  positions: isBefore
                    ? projection.acceptedPositionsBefore
                    : projection.acceptedPositionsAfter,
                  state,
                  value: isBefore
                    ? projection.acceptedBefore
                    : projection.acceptedAfter,
                },
                {
                  positions: isBefore
                    ? projection.projectedPositionsBefore
                    : projection.projectedPositionsAfter,
                  state,
                  value: isBefore ? projection.before : projection.after,
                },
                isBefore || live.projected !== projection.after
                  ? undefined
                  : live
              )?.value as EditorDocumentValue | undefined) ??
              EMPTY_FRAGMENT_VALUE
            );
          };
          const before =
            fragmentValue('before') ??
            (accepted ? projection.acceptedBefore : projection.before);
          const after =
            fragmentValue('after') ??
            (accepted ? projection.acceptedAfter : projection.after);
          const isOriginatingView =
            projection.view !== null &&
            getEditorRuntime(projection.view) === getEditorRuntime(view);
          const capturedBefore = fragment
            ? null
            : isOriginatingView
              ? projection.viewSelectionBefore
              : (VIEW_SELECTIONS.get(getEditorRuntime(view)) ?? null);
          const capturedAfter = isOriginatingView
            ? projection.viewSelectionAfter
            : capturedBefore;
          const selectionBefore = resolveAuthoredSelection(
            capturedBefore,
            accepted
              ? projection.acceptedPositionsBefore
              : projection.projectedPositionsBefore,
            before as JsonEditorValue,
            projection.state
          );
          const selectionAfter = resolveAuthoredSelection(
            capturedAfter,
            accepted
              ? projection.acceptedPositionsAfter
              : projection.projectedPositionsAfter,
            after as JsonEditorValue,
            projection.state
          );
          const projectedCommit = createEditorCommit(
            {
              annotations: commit.annotations,
              after: projectionSnapshot(
                source,
                after,
                commit.version,
                selectionAfter
              ),
              afterValue: after,
              before: projectionSnapshot(
                source,
                before,
                commit.previousVersion,
                selectionBefore
              ),
              beforeValue: before,
              changes: fragment
                ? DocumentChange.between(
                    before as JsonEditorValue,
                    after as JsonEditorValue
                  )
                : accepted
                  ? commit.changes
                  : projection.change,
              dirtyStateKeys: commit.dirtyStateKeys,
              editor: source,
              effects: commit.effects,
              replace: commit.changed.hasAny('replace'),
              selectionAfter,
              selectionAfterRoot: selectionAfter
                ? (SelectionApi.root(selectionAfter) ?? 'main')
                : (capturedAfter?.root ?? 'main'),
              selectionBefore,
              selectionBeforeRoot: selectionBefore
                ? (SelectionApi.root(selectionBefore) ?? 'main')
                : (capturedBefore?.root ?? 'main'),
              selectionChanged:
                !SelectionApi.equals(selectionBefore, selectionAfter) ||
                capturedBefore?.root !== capturedAfter?.root,
              tags: commit.tags,
            },
            { version: commit.version, previousVersion: commit.previousVersion }
          );
          projection.commits.set(view, projectedCommit);
          return projectedCommit;
        },
        mergeHistory(current, previous) {
          let scope: AuthoredEditIdentity | undefined;
          if (!current.length || !previous.length) return false;
          const snapshot = editor.read.getField(authoredState);
          return [...current, ...previous].every((effect) => {
            if (effect.type !== authoredHistoryEffect) return false;
            const operation = readRecord(snapshot.operations, effect.value.id);
            if (!operation || operation.kind !== 'edit') return false;
            scope ??= operation;
            return (
              operation.authorId === scope.authorId &&
              operation.proposal === scope.proposal &&
              operation.retained === scope.retained
            );
          });
        },
        history(commit) {
          if (
            !commit.effects.some(
              (effect) => effect.type === authoredOperationEffect
            )
          ) {
            return undefined;
          }
          const projection = projections.get(commit);
          const effects = commit.effects.flatMap((effect) => {
            const batch = readAuthoredOperationBatch(effect);
            return batch
              ? batch.operations.map((operation) => {
                  const retained =
                    operation.kind === 'edit'
                      ? hasAuthoredContent(operation)
                        ? [materializeAuthoredEdit(operation)]
                        : batch.retained.filter(
                            (entry) => entry.id === operation.id
                          )
                      : batch.retained;
                  return createEditorEffect(authoredHistoryEffect, {
                    id: operation.id,
                    retained,
                    ...(projection
                      ? {
                          selection: projection.historySelectionBefore,
                          inverseSelection: projection.viewSelectionAfter,
                        }
                      : {}),
                  });
                })
              : effect.type.history === 'push'
                ? [effect]
                : [];
          });
          const view = projection?.view ?? source;
          return {
            effects,
            grouping: {
              commit: getAuthoredViewCommit(view, commit),
              scope: authoredView(view),
            },
          };
        },
        initialize() {
          const state = editor.read.getField(authoredState);
          const value = editor.read.value();
          if (
            state === initialState &&
            value.children === initialValue.children &&
            value.roots === initialValue.roots
          ) {
            return;
          }
          const next = restoreInitialProjection(state, value, schema, source);
          Object.assign(live, next);
          live.accepted = content(value);
          seedAuthoredProjectionNodeKeys(source, live.projected);
          indexAuthoredState(state);
        },
        beforeEffect(effect) {
          if (effect.type === authoredHistoryEffect) {
            if (isBuildingTransactionSpec(source)) return true;
            const tx = getActiveEditorTransaction(source);
            const before = tx?.getField(authoredState);
            const active = getDefined(live.active);
            if (before) {
              for (const retained of effect.value.retained) {
                const previous = readRecord(before.operations, retained.id);
                if (previous && !hasAuthoredContent(previous)) {
                  active.hydratedChanges.add(retained.changeId);
                }
              }
            }
            const hydrated =
              before && retainAuthoredContent(before, effect.value.retained);
            if (tx && before && hydrated && hydrated !== before) {
              tx.effects.emit(
                authoredState.effect,
                snapshotEditorJsonValue(
                  {
                    previousValue: before,
                    value: hydrated,
                  },
                  'Authored History content'
                )
              );
            }
            const operation =
              tx &&
              readRecord(
                tx.getField(authoredState).operations,
                effect.value.id
              );
            if (!tx || !operation) {
              throw new Error(
                'Authored history requires a retained operation.'
              );
            }
            if (operation.kind === 'edit' && !hasAuthoredContent(operation)) {
              throw new Error(
                'Authored history requires retained edit content.'
              );
            }
            if (operation.kind === 'edit') {
              undoAuthoredEdit(live, tx, materializeAuthoredEdit(operation));
            } else undoAuthoredReview(live, tx, operation);
            if (Object.hasOwn(effect.value, 'selection')) {
              getDefined(live.active).historySelection = effect.value.selection;
              if (
                !active.view &&
                operation.kind === 'edit' &&
                !operation.proposal
              ) {
                const { projection } = getDefined(active.decision);
                tx.selection.set(
                  resolveAuthoredSelection(
                    effect.value.selection,
                    projection.acceptedPositions,
                    projection.accepted as JsonEditorValue,
                    tx.getField(authoredState)
                  )
                );
              }
            }
            if (
              active.historyInverseSelection === undefined &&
              Object.hasOwn(effect.value, 'inverseSelection')
            ) {
              active.historyInverseSelection = effect.value.inverseSelection;
            }
            return false;
          }
          if (effect.type !== authoredOperationEffect) return true;
          if (live.active?.replacement) {
            throw new Error(
              'Document replacement cannot mix with authored operations.'
            );
          }
          const value: unknown = effect.value;
          if (
            !value ||
            typeof value !== 'object' ||
            !('checkpoint' in value) ||
            !('documentId' in value) ||
            !('operations' in value) ||
            !Array.isArray(value.operations)
          ) {
            return true;
          }
          const current =
            getActiveEditorTransaction(source)?.getField(authoredState) ??
            editor.read.getField(authoredState);
          let changed =
            value.documentId !== current.documentId ||
            value.checkpoint !== null;
          for (const operation of value.operations) {
            if (
              !operation ||
              typeof operation !== 'object' ||
              typeof operation.id !== 'string'
            ) {
              return true;
            }
            const previous = readRecord(current.operations, operation.id);
            if (!previous) changed = true;
            else if (
              !equalAuthoredOperations(previous, operation as AuthoredOperation)
            ) {
              throw new Error('Authored operation identity collision.');
            } else if (
              hasAuthoredContent(previous) &&
              'kind' in operation &&
              operation.kind === 'edit' &&
              'content' in operation
            ) {
              changed = true;
            } else if (
              live.options.retainHistory &&
              'checkpoint' in value &&
              value.checkpoint &&
              !hasAuthoredContent(previous) &&
              'kind' in operation &&
              operation.kind === 'edit' &&
              'steps' in operation
            ) {
              changed = true;
            }
          }
          const { active } = live;
          if (
            changed &&
            active &&
            !active.finishing &&
            (!active.decision || active.receiving) &&
            !isBuildingTransactionSpec(source)
          ) {
            if (active.changed || active.proposed) {
              throw new Error(
                'Received authored operations cannot mix with ordinary writes.'
              );
            }
            if (!active.receiving) {
              setTransactionDocumentProjection(source, live.accepted);
              active.receiving = current;
            }
            active.decision = null;
          }
          return changed;
        },
        begin() {
          const acceptedBefore = content(editor.read.value());
          const stateBefore = editor.read.getField(authoredState);
          const active: AuthoredTransaction = {
            finishing: false,
            hydratedChanges: new Set(),
            receiving: null,
            insertions: new Map(),
            inputSelectionAllowed: true,
            rangeLifetime: { aborted: false },
            ranges: [],
            view: null,
            viewSelection: null,
            viewSelectionBefore: null,
            viewSelectionRoot: 'main',
            automatic: false,
            actor: null,
            before: acceptedBefore,
            applyingDecision: false,
            changed: false,
            replacement: null,
            decision: null,
            changeId: null,
            proposed: false,
          };
          let nextProjected = live.projected;
          let nextState = stateBefore;
          let nextAccepted = live.accepted;
          let nextViewSelection = active.viewSelection;
          let nextProjectedChange = DocumentChange.empty;
          let nextAcceptedPositions = live.acceptedPositions;
          let nextProjectedPositions = live.projectedPositions;
          let compositionCapture: {
            composition: { changeId: string | null };
            changeId: string;
          } | null = null;
          let nextFragments: {
            affected: ReadonlySet<string>;
            index: AuthoredFragmentIndex;
            changed: ReadonlySet<string>;
            nodeKeys: ReadonlySet<NodeKey>;
          } | null = null;
          live.active = active;
          return {
            finish(input) {
              active.finishing = true;
              const { after, before, change, tx } = input;
              const viewSelection = getCurrentSelection(source);
              const viewSelectionRoot = getCurrentSelectionRoot(source);
              let acceptedChange =
                active.decision?.acceptedChange ??
                (active.proposed ? DocumentChange.empty : change);
              const finishContent = () => {
                if (active.replacement) {
                  if (
                    active.replacement.phase !== 'loaded' ||
                    change !== active.replacement.change ||
                    tx.getField(authoredState) !== active.replacement.state
                  ) {
                    throw new Error(
                      'Document replacement cannot mix with ordinary writes.'
                    );
                  }
                  nextState = active.replacement.state;
                  const next = active.replacement.projection;
                  nextAccepted = next.accepted;
                  nextProjected = next.projected;
                  nextAcceptedPositions = next.acceptedPositions;
                  nextProjectedPositions = next.projectedPositions;
                  nextProjectedChange = DocumentChange.between(
                    live.projected,
                    nextProjected
                  );
                  acceptedChange = DocumentChange.between(
                    live.accepted,
                    nextAccepted
                  );
                  if (active.proposed) {
                    setTransactionPublicationChange(source, acceptedChange);
                    setTransactionViewSelection(
                      source,
                      viewSelection,
                      viewSelectionRoot
                    );
                  }
                  indexAuthoredState(nextState);
                  return;
                }
                if (active.receiving) {
                  if (!change.empty) {
                    throw new Error(
                      'Received authored operations cannot mix with ordinary writes.'
                    );
                  }
                  const next = receiveAuthoredProjection(live, tx);
                  ({ acceptedChange } = next);
                  setTransactionPublicationChange(source, acceptedChange);
                }
                if (active.decision) {
                  nextState = tx.getField(authoredState);
                  const next = active.decision;
                  nextProjected = next.projection.projected;
                  nextAcceptedPositions = next.projection.acceptedPositions;
                  nextProjectedPositions = next.projection.projectedPositions;
                  nextProjectedChange = next.projectedChange;
                  nextAccepted = next.projection.accepted;
                  return;
                }
                if (change.empty) {
                  if (active.proposed) {
                    setTransactionPublicationChange(
                      source,
                      DocumentChange.empty
                    );
                  }
                  return;
                }
                const authorId = actor(live);
                const state = tx.getField(authoredState);
                const sequence =
                  (readRecord(state.vector, live.replica) ?? 0) + 1;
                const operationId = `${live.replica}:${sequence}`;
                const editingOwner = active.automatic
                  ? authoredEditOwner(
                      change,
                      live.projectedPositions,
                      state,
                      authorId,
                      active.insertions.size === 0
                    )
                  : null;
                const owned = editingOwner
                  ? readRecord(state.changes, editingOwner)
                  : null;
                const composition = active.automatic
                  ? authoredViewState(active.view ?? source).composition
                  : null;
                const compositionChange = composition?.changeId
                  ? readRecord(state.changes, composition.changeId)
                  : null;
                const changeId =
                  active.changeId ??
                  (compositionChange?.authorId === authorId &&
                  compositionChange.status === 'pending'
                    ? compositionChange.id
                    : owned?.authorId === authorId && owned.status === 'pending'
                      ? owned.id
                      : crypto.randomUUID());
                if (composition) compositionCapture = { composition, changeId };
                const partitions =
                  active.automatic &&
                  active.proposed &&
                  !active.changeId &&
                  !composition
                    ? (partitionAuthoredTextEdit(
                        change,
                        live.projectedPositions,
                        state,
                        authorId,
                        before
                      ) ??
                      partitionAuthoredStructuralEdit(
                        change,
                        live.projectedPositions,
                        state,
                        authorId,
                        before
                      ))
                    : null;
                const publish = (
                  id: string,
                  captured: ReturnType<typeof captureAuthoredChange>
                ) => {
                  const publicationState = tx.getField(authoredState);
                  const publicationSequence =
                    (readRecord(publicationState.vector, live.replica) ?? 0) +
                    1;
                  emitAuthoredOperation(
                    live,
                    tx,
                    snapshotEditorJsonValue(
                      {
                        authorId,
                        changeId: id,
                        clock: publicationState.clock + 1,
                        dependencies: captured.dependencies,
                        id: `${live.replica}:${publicationSequence}`,
                        inverseOf: null,
                        kind: 'edit',
                        parents: publicationState.frontier,
                        proposal: active.proposed,
                        steps: captured.steps,
                        replica: live.replica,
                        seen: publicationState.vector,
                        sequence: publicationSequence,
                        time: Date.now(),
                      },
                      'Authored operation'
                    )
                  );
                };
                const captured = partitions
                  ? (() => {
                      const draft = new ChangeDraft(before);
                      let positions = live.projectedPositions;
                      let result:
                        | ReturnType<typeof captureAuthoredChange>
                        | undefined;
                      for (const partition of partitions) {
                        const current = tx.getField(authoredState);
                        const partSequence =
                          (readRecord(current.vector, live.replica) ?? 0) + 1;
                        const id = partition.changeId ?? changeId;
                        result = captureAuthoredChange({
                          schema: getCompiledEditorSchemaFromApi(schema),
                          state: current,
                          change: partition.change,
                          changeId: id,
                          operationId: `${live.replica}:${partSequence}`,
                          positions,
                          value: draft.value,
                        });
                        publish(id, result);
                        ({ positions } = result);
                        draft.apply(partition.change, { classify: false });
                      }
                      return getDefined(result);
                    })()
                  : captureAuthoredChange({
                      schema: getCompiledEditorSchemaFromApi(schema),
                      state,
                      insertions: active.insertions,
                      change,
                      steps: input.steps,
                      changeId,
                      operationId,
                      positions: active.proposed
                        ? live.projectedPositions
                        : live.acceptedPositions,
                      value: before,
                    });
                if (!partitions) publish(changeId, captured);
                nextState = tx.getField(authoredState);
                let projectedChange = change;
                const sharedPositions =
                  live.acceptedPositions === live.projectedPositions;
                if (active.proposed) {
                  nextProjectedPositions = captured.positions;
                  nextProjected = after;
                } else {
                  nextAccepted = after;
                  nextAcceptedPositions = captured.positions;
                  if (sharedPositions) {
                    nextProjectedPositions = captured.positions;
                    nextProjected = after;
                  } else {
                    const projection = mapAuthoredChange({
                      state,
                      properties: {
                        editor: source,
                        state: nextState,
                        schema: getCompiledEditorSchemaFromApi(schema),
                        isVisible: (edit) =>
                          readRecord(nextState.changes, edit.changeId)
                            ?.status !== 'rejected',
                      },
                      acceptedEdit: true,
                      changeId,
                      direction: 'forward',
                      operationId,
                      positions: live.projectedPositions,
                      steps: captured.steps,
                      value: live.projected,
                    });
                    projectedChange = projection.change;
                    nextProjectedPositions = projection.positions;
                    const step = new ChangeDraft(live.projected).apply(
                      projectedChange
                    );
                    nextProjected = step.after as EditorDocumentValue;
                    schema.validateDocumentChange({
                      before: live.projected,
                      after: nextProjected,
                      change: projectedChange,
                      indexedAfter: step.indexedAfter,
                      indexedBefore: step.indexedBefore,
                    });
                  }
                }
                nextProjectedChange = projectedChange;
                nextState = tx.getField(authoredState);
                if (active.proposed) {
                  setTransactionPublicationChange(source, DocumentChange.empty);
                }
              };
              for (const range of active.ranges) range.settle();
              finishContent();
              if (
                nextState !== stateBefore ||
                nextAccepted !== live.accepted ||
                nextProjected !== live.projected
              ) {
                nextState = snapshotEditorJsonValue(
                  {
                    ...nextState,
                    acceptedPositions: nextState.operations
                      ? nextAcceptedPositions
                      : null,
                    projected: nextState.operations
                      ? (nextProjected as JsonEditorValue)
                      : null,
                    projectedPositions: nextState.operations
                      ? nextProjectedPositions
                      : null,
                  },
                  'Authored checkpoint'
                );
                tx.effects.emit(
                  authoredState.effect,
                  snapshotEditorJsonValue(
                    {
                      previousValue: tx.getField(authoredState),
                      value: nextState,
                    },
                    'Authored checkpoint publication'
                  )
                );
              }
              inheritEditorProjectionIndexes(
                source,
                live.projected,
                nextProjected,
                nextProjectedChange
              );
              if (
                live.accepted !== live.projected ||
                nextAccepted !== nextProjected
              ) {
                inheritEditorProjectionIndexes(
                  source,
                  live.accepted,
                  nextAccepted,
                  acceptedChange
                );
              }
              if (active.view) {
                nextViewSelection = active.replacement
                  ? captureAuthoredSelection(
                      viewSelection,
                      viewSelectionRoot,
                      nextAcceptedPositions,
                      nextAccepted as JsonEditorValue
                    )
                  : active.historySelection !== undefined
                    ? active.historySelection
                    : active.decision || !input.selectionWritten
                      ? active.viewSelection
                      : captureAuthoredSelection(
                          viewSelection,
                          viewSelectionRoot,
                          active.proposed
                            ? nextProjectedPositions
                            : nextAcceptedPositions,
                          (active.proposed
                            ? nextProjected
                            : nextAccepted) as JsonEditorValue
                        );
                const selectionAfter = resolveAuthoredSelection(
                  nextViewSelection,
                  authoredView(active.view).projection === 'accepted'
                    ? nextAcceptedPositions
                    : nextProjectedPositions,
                  (authoredView(active.view).projection === 'accepted'
                    ? nextAccepted
                    : nextProjected) as JsonEditorValue,
                  nextState
                );
                if (!active.replacement) {
                  restoreTransactionSourceSelection(
                    source,
                    !SelectionApi.equals(
                      active.viewSelectionBefore,
                      selectionAfter
                    ) ||
                      active.viewSelectionRoot !==
                        (selectionAfter
                          ? (SelectionApi.root(selectionAfter) ?? 'main')
                          : (nextViewSelection?.root ?? 'main'))
                  );
                }
              }
              if (live.fragmentIndex) {
                const accepted = {
                  positions: nextAcceptedPositions,
                  state: nextState,
                  value: nextAccepted as JsonEditorValue,
                };
                const proposed = {
                  positions: nextProjectedPositions,
                  state: nextState,
                  value: nextProjected as JsonEditorValue,
                };
                if (active.replacement) {
                  const index = createAuthoredFragmentIndex(
                    source,
                    accepted,
                    proposed
                  );
                  nextFragments = {
                    affected: new Set(
                      [
                        ...records(live.fragmentIndex.changes),
                        ...records(index.changes),
                      ].map(([key]) => key)
                    ),
                    index,
                    changed: new Set(
                      [
                        ...records(live.fragmentIndex.buckets),
                        ...records(index.buckets),
                      ].map(([key]) => key)
                    ),
                    nodeKeys: new Set([
                      ...authoredFragmentIndexNodeKeys(live.fragmentIndex),
                      ...authoredFragmentIndexNodeKeys(index),
                    ]),
                  };
                } else {
                  nextFragments = updateAuthoredFragmentIndex(
                    source,
                    live.fragmentIndex,
                    stateBefore,
                    accepted,
                    proposed,
                    tx.effects
                      .all()
                      .flatMap(
                        (effect) =>
                          readAuthoredOperationBatch(effect)?.operations ?? []
                      )
                  );
                }
              }
            },
            publish(commit) {
              if (
                nextState !== stateBefore ||
                nextAccepted !== live.accepted ||
                nextProjected !== live.projected
              ) {
                renderScopes.clear();
              }
              if (compositionCapture) {
                compositionCapture.composition.changeId =
                  compositionCapture.changeId;
              }
              if (nextFragments) {
                live.fragmentIndex = nextFragments.index;
                fragmentPublications.set(commit, nextFragments);
              }
              if (active.replacement) live.fragments.clear();
              for (const operation of commit.effects.flatMap(
                (effect) => readAuthoredOperationBatch(effect)?.operations ?? []
              )) {
                if (operation.kind === 'edit') continue;
                for (const { id } of operation.selection.changes) {
                  const status = readRecord(nextState.changes, id)?.status;
                  if (status !== 'pending' && status !== 'conflicted') {
                    live.fragments.delete(id);
                  }
                }
              }
              projections.set(commit, {
                before: live.projected,
                after: nextProjected,
                change: nextProjectedChange,
                acceptedBefore: live.accepted,
                acceptedAfter: nextAccepted,
                acceptedPositionsBefore: live.acceptedPositions,
                acceptedPositionsAfter: nextAcceptedPositions,
                projectedPositionsBefore: live.projectedPositions,
                projectedPositionsAfter: nextProjectedPositions,
                state: nextState,
                stateBefore,
                proposed: active.proposed,
                historySelectionBefore:
                  active.historyInverseSelection !== undefined
                    ? active.historyInverseSelection
                    : active.view
                      ? active.viewSelection
                      : captureAuthoredSelection(
                          commit.selectionBefore,
                          commit.selectionBeforeRoot ?? 'main',
                          live.acceptedPositions,
                          live.accepted as JsonEditorValue
                        ),
                view: active.view,
                viewSelectionBefore: active.viewSelection,
                viewSelectionAfter: active.view
                  ? nextViewSelection
                  : captureAuthoredSelection(
                      commit.selectionAfter,
                      commit.selectionAfterRoot ?? 'main',
                      nextAcceptedPositions,
                      nextAccepted as JsonEditorValue
                    ),
                commits: new WeakMap(),
              });
              if (active.view) {
                VIEW_SELECTIONS.set(
                  getEditorRuntime(active.view),
                  nextViewSelection
                );
              }
              live.accepted = nextAccepted;
              live.acceptedPositions = nextAcceptedPositions;
              live.projectedPositions = nextProjectedPositions;
              live.projected = nextProjected;
            },
            close(_commit, failed) {
              active.rangeLifetime.aborted = failed;
              for (const range of active.ranges) range.release();
              live.active = null;
            },
          };
        },
      });
      onCleanup(({ reason }) => {
        stopFragmentListener?.();
        changeListeners.clear();
        renderScopes.clear();
        cleanup(reason === 'rollback');
        if (RUNTIMES.get(source) !== live) return;
        if (reason === 'rollback' && existing) RUNTIMES.set(source, existing);
        else RUNTIMES.delete(source);
      });
    },
    on: {
      transactionChange({
        editor,
        before,
        change,
        selectionBefore,
        selectionBeforeRoot,
      }) {
        const live = runtime(editor);
        if (live.active?.replacement) {
          if (live.active.replacement.phase === 'loaded') {
            throw new Error(
              'Document replacement cannot mix with ordinary writes.'
            );
          }
          return;
        }
        if (live.active?.receiving) {
          throw new Error(
            'Received authored operations cannot mix with ordinary writes.'
          );
        }
        if (live.active && !live.active.inputSelectionAllowed) {
          throw new Error(
            'Editing cannot change pending authored content. Switch to Suggesting to modify the proposal.'
          );
        }
        actor(live);
        if (live.active) {
          if (
            live.active.view &&
            authoredView(live.active.view).projection === 'markup' &&
            SelectionApi.isText(selectionBefore) &&
            selectionBefore.affinity &&
            RangeApi.isCollapsed(selectionBefore)
          ) {
            const root = selectionBeforeRoot ?? 'main';
            live.active.insertions.set(change, {
              association:
                selectionBefore.affinity === 'backward' ? 'left' : 'right',
              position: DocumentIndex.fromValue(
                authoredRootNodes(before as JsonEditorValue, root)
              ).positionAt(selectionBefore.anchor),
              root,
            });
          }
          if (live.active.decision && !live.active.applyingDecision) {
            throw new Error(
              'Review decisions cannot mix with ordinary document writes.'
            );
          }
          live.active.changed = true;
        }
      },
    },
    read({ editor, state }) {
      const publicChange = (change: AuthoredRecord) => {
        const current = readAuthoredViewProjection(runtime(editor), editor);
        return readAuthoredChange(
          change,
          current.state,
          current.positions,
          current.value
        );
      };
      return {
        view: () => authoredView(editor),
        change(identity) {
          const value = readRecord(
            state.getField(authoredState).changes,
            identity
          );
          return value ? publicChange(value) : null;
        },
        changes(query = {}) {
          validateAuthoredQuery(query);
          const limit = query.limit ?? 50;
          if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
            throw new Error('Authored page limit must be between 1 and 200.');
          }
          const snapshot = state.getField(authoredState);
          const prefix = `${snapshot.documentId}:${snapshot.clock}:`;
          if (query.cursor && !query.cursor.startsWith(prefix)) {
            throw new Error('Stale authored page cursor.');
          }
          const items: AuthoredChange[] = [];
          let lastKey: string | null = null;
          for (const { key, change } of matchingAuthoredChanges(
            snapshot,
            query,
            query.cursor?.slice(prefix.length)
          )) {
            if (items.length === limit) {
              return Object.freeze({
                items: Object.freeze(items),
                cursor: prefix + lastKey,
              });
            }
            items.push(publicChange(change));
            lastKey = key;
          }
          return Object.freeze({ items: Object.freeze(items), cursor: null });
        },
        changesAt(range) {
          if (!RangeApi.isRange(range)) {
            throw new Error('Authored range query requires a range.');
          }
          const [start, end] = RangeApi.edges(range);
          const root = start.root ?? 'main';
          if ((end.root ?? 'main') !== root) return Object.freeze([]);
          const live = runtime(editor);
          const current = readAuthoredViewProjection(live, editor);
          const identities = new Set<string>();
          if (
            getActiveEditorTransaction(live.source) ||
            FRAGMENT_VIEWS.has(getEditorRuntime(editor))
          ) {
            for (const status of ['pending', 'conflicted'] as const) {
              for (const { change } of matchingAuthoredChanges(current.state, {
                status,
              })) {
                identities.add(change.id);
              }
            }
          } else {
            const children = authoredRootNodes(current.value, root) as Value;
            const index = getEditorProjectionSnapshotIndex(editor, children);
            const { locations } = currentAuthoredFragmentIndex(live);
            const [firstChild = 0] = start.path;
            const [lastChild = firstChild] = end.path;
            for (let child = firstChild; child <= lastChild; child++) {
              const key = index.keyAt([child]);
              if (!key) continue;
              for (const [identity] of records(
                readRecord(locations, authoredFragmentBucket(root, key))
              )) {
                identities.add(identity);
              }
            }
          }
          const candidates = [...identities]
            .flatMap((identity) => {
              const change = readRecord(current.state.changes, identity);
              return change ? [change] : [];
            })
            .sort(
              (left, right) =>
                (left.status === right.status
                  ? 0
                  : left.status === 'pending'
                    ? -1
                    : 1) ||
                left.createdAt - right.createdAt ||
                (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
            );
          const items: AuthoredChange[] = [];
          for (const change of candidates) {
            if (
              !hasAuthoredReviewContent(
                change,
                readAuthoredViewProjection(live, editor, 'accepted'),
                readAuthoredViewProjection(live, editor, 'proposed')
              )
            ) {
              continue;
            }
            const item = readAuthoredChange(
              change,
              current.state,
              current.positions,
              current.value
            );
            if (
              item.ranges.some(
                (candidate) => RangeApi.intersection(candidate, range) !== null
              )
            ) {
              items.push(item);
            }
          }
          return Object.freeze(items);
        },
        details(identity) {
          const live = runtime(editor);
          const current = readAuthoredViewProjection(live, editor);
          const proposed = readAuthoredViewProjection(live, editor, 'proposed');
          const value = readRecord(current.state.changes, identity);
          if (!value) return null;

          return readAuthoredChangeDetails(
            value,
            current,
            proposed,
            readAuthoredViewProjection(live, editor, 'accepted')
          );
        },
        preview(input) {
          const snapshot = state.getField(authoredState);
          const result = previewAuthoredDecision(snapshot, input);
          if (result.status === 'applied') {
            const live = runtime(editor);
            const prepared = prepareAuthoredDecision({
              editor: live.source,
              decision: input,
              projection: {
                accepted: content(state.value()),
                acceptedPositions: live.acceptedPositions,
                projected: live.projected,
                projectedPositions: live.projectedPositions,
              },
              schema: getEditorSchema(live.source),
              state: snapshot,
            });
            if (prepared.status !== 'ready') return prepared;
          }
          return result;
        },
        select(query) {
          validateAuthoredQuery(query);
          if (
            query.ids !== undefined &&
            (!Array.isArray(query.ids as unknown) ||
              query.ids.some((id) => typeof id !== 'string' || !id) ||
              query.authorId !== undefined)
          ) {
            throw new Error(
              'Authored selection requires change IDs or an author filter.'
            );
          }
          const snapshot = state.getField(authoredState);
          const selected = query.ids
            ? [...new Set(query.ids)].map((identity) => {
                const change = readRecord(snapshot.changes, identity);
                if (!change) {
                  throw new Error(`Unknown authored change ${identity}.`);
                }
                return change;
              })
            : [...matchingAuthoredChanges(snapshot, query)].map(
                ({ change }) => change
              );
          return Object.freeze({
            changes: Object.freeze(
              selected.map((change) =>
                Object.freeze({
                  heads: change.heads,
                  id: change.id,
                  revision: change.revision,
                })
              )
            ),
            documentId: snapshot.documentId,
          });
        },
      } satisfies AuthoredRead;
    },
    update({ editor, tx }) {
      const decide = (
        input: AuthoredDecision,
        resolve: boolean
      ): AuthoredResult => {
        const state = tx.getField(authoredState);
        const result = previewAuthoredDecision(state, input, resolve);
        if (result.status !== 'applied') return result;
        const live = runtime(editor);
        const authorId = actor(live);
        const { active } = live;
        if (!active) {
          throw new Error('Authored decisions require an active transaction.');
        }
        prepareAuthoredReview(live);
        if (active.proposed || (active.changed && !active.decision)) {
          throw new Error(
            'Review decisions must precede ordinary document writes.'
          );
        }
        const before = active.decision?.projection ?? {
          accepted: live.accepted,
          acceptedPositions: live.acceptedPositions,
          projected: live.projected,
          projectedPositions: live.projectedPositions,
        };
        const prepared = prepareAuthoredDecision({
          editor: live.source,
          decision: input,
          projection: before,
          schema: getEditorSchema(live.source),
          state,
        });
        if (prepared.status !== 'ready') return prepared;
        const sequence = (readRecord(state.vector, live.replica) ?? 0) + 1;
        stageAuthoredProjection(live, prepared);
        active.applyingDecision = true;
        try {
          tx.changes.apply(prepared.acceptedChange);
          emitAuthoredOperation(
            live,
            tx,
            snapshotEditorJsonValue(
              {
                action: input.action,
                authorId,
                clock: state.clock + 1,
                id: `${live.replica}:${sequence}`,
                kind: resolve ? 'resolve' : 'decide',
                undoOf: null,
                parents: state.frontier,
                replica: live.replica,
                seen: state.vector,
                selection: input.selection,
                sequence,
                time: Date.now(),
              },
              'Authored decision'
            )
          );
        } finally {
          active.applyingDecision = false;
        }
        return result;
      };
      return {
        decide: (input) => decide(input, false),
        resolve: (input) => decide(input, true),
        revert(input) {
          const snapshot = tx.getField(authoredState);
          const inspected = inspectAuthoredSelection(
            snapshot,
            input?.selection
          );
          if (inspected.status !== 'ready') return inspected;
          if (!inspected.ids.length) return { status: 'unchanged', ids: [] };
          const live = runtime(editor);
          if (!live.options.retainHistory) {
            return snapshotEditorJsonValue(
              {
                status: 'unavailable',
                reason: 'retention',
                ids: inspected.ids,
              },
              'Authored revert result'
            );
          }
          if (
            inspected.changes.some((change) =>
              [...records(change.operations)].some(([, id]) => {
                const operation = readRecord(snapshot.operations, id);
                return !operation || !hasAuthoredContent(operation);
              })
            )
          ) {
            return snapshotEditorJsonValue(
              {
                status: 'unavailable',
                reason: 'retention',
                ids: inspected.ids,
              },
              'Authored revert result'
            );
          }
          const active = getDefined(live.active);
          if (active.changed || active.decision) {
            throw new Error(
              'Authored revert must precede ordinary document writes.'
            );
          }
          const prepared = prepareAuthoredRevert({
            editor: live.source,
            selection: input.selection,
            projection: {
              accepted: active.before,
              acceptedPositions: live.acceptedPositions,
              projected: live.projected,
              projectedPositions: live.projectedPositions,
            },
            schema: getEditorSchema(live.source),
            state: snapshot,
            target: active.proposed ? 'projected' : 'accepted',
          });
          if (prepared.status !== 'ready') return prepared;
          if (prepared.change.empty) {
            return snapshotEditorJsonValue(
              { status: 'unchanged', ids: inspected.ids },
              'Authored revert result'
            );
          }
          actor(live);
          active.changeId ??= crypto.randomUUID();
          tx.changes.apply(prepared.change);
          return snapshotEditorJsonValue(
            { status: 'applied', ids: [active.changeId] },
            'Authored revert result'
          );
        },
        propose: txOnly((input = {}) => {
          const live = runtime(editor);
          const authorId = actor(live);
          if (!live.active) {
            throw new Error(
              'Authored proposals require an active transaction.'
            );
          }
          const identity = input.changeId ?? crypto.randomUUID();
          if (input.changeId) {
            const change = readRecord(
              tx.getField(authoredState).changes,
              identity
            );
            if (
              change &&
              (change.status !== 'pending' || change.authorId !== authorId)
            ) {
              throw new Error(
                'Only the original author may amend a pending change.'
              );
            }
          }
          if (!live.active.automatic || live.active.changed) {
            setTransactionDocumentProjection(live.source, live.projected);
          }
          live.active.changeId = identity;
          live.active.proposed = true;
          live.active.automatic = false;
          return identity;
        }),
      } satisfies AuthoredUpdate;
    },
  });
