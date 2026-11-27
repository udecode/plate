import {
  DocumentChange,
  invertEffect,
  mapEffect,
  type Editor,
  type EditorDocumentValue,
  type EditorSchemaIdentity,
  type Value,
} from '..';
import {
  type AnchorHistoryRecovery,
  mapAnchorHistoryRecovery,
} from '../core/anchor-state';
import { classifyDocumentChange } from '../core/change/builder';
import { landCarriedRuns } from '../core/change/carried-run';
import { crossRecord } from '../core/change/cross';
import {
  type ElementSchema,
  type FactedChange,
  skippedRejection,
  stepRejection,
} from '../core/change/cross-rule';
import {
  getInternalDocumentChangeRootKeys,
  isInternalTextOnlyDocumentChange,
  transformInternalDocumentChange,
  valueRoot,
  valueRootIndex,
} from '../core/change/document-change';
import { jsonEqual, type JsonRecord } from '../core/change/json';
import type { ChangeFacts } from '../core/change/record';
import type { KeptWrap } from '../core/change/root-change';
import { isElementNode, type JsonNode, nodeProps } from '../core/change/tokens';
import { getEditorRuntimeOwner, getEditorSchema } from '../core/editor-runtime';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { MAIN_ROOT_KEY } from '../core/public-root';
import { getEditorDocumentValue } from '../core/public-state';
import {
  areEditorSchemaIdentitiesEqual,
  propertyTargetsReadParents,
} from '../core/schema-compiler';
import { alike } from '../core/stored-element-id';
import { countCoreWork, readCoreWork } from '../core/work';
import type { AnyEditor } from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import type { Batch, History } from './history';
import { type HistoryCarets, mapHistoryCarets } from './history-carets';
import { resolveForgottenTop } from './history-forgotten';
import { groupRoots, type HistoryBatchGroup } from './history-merge-policy';
import {
  branchHasActiveTrack,
  createOrigin,
  type HistoryCommitSlice,
  type HistoryReplayOrigin,
  mergeOrigin,
  rebuildOriginOverAbove,
  stepBranchTracks as stepTracks,
} from './history-origin';
import {
  historyReplaySchemaOf,
  keepsUndoThrough,
  projectedHistoryReplay,
  recordHistoryReplay,
  mapHistoryReplay,
  mapHistorySelection,
  type HistoryReplay,
  type ReplayRules,
} from './history-replay';
import {
  mapSessionReplayEffects,
  placeSettledSessionEntry,
  resolveSessionSettlementBase,
  type SessionReplaySettlementInput,
  settleSessionBranches,
} from './history-session-replay';
import {
  additionalRoot,
  cloneFrozen,
  historyBatchStepId,
  historyFactsOf,
  historyProgramOf,
  historyStepId,
  historyStepOf,
  knownHistoryStepId,
  omitPrimarySelectionRoot,
  withHistoryFacts,
  withHistoryProgram,
  withHistoryStep,
  withHistoryStepId,
} from './history-step-id';
import {
  captureHistoryState as captureStore,
  type CrossingDrop,
  deleteHistoryStore,
  type DropSink,
  getStore as readHistoryStore,
  type HistoryStoreBase,
  NO_DROPS,
  publishStore,
  restoreHistoryState,
  setStore as writeHistoryStore,
  withDrops,
  withHistoryStateDraft,
  withPublishedHistoryState,
} from './history-store';

export {
  captureHistoryState,
  historyBatchStepId,
  historyFactsOf,
  historyProgramOf,
  historyStepId,
  knownHistoryStepId,
  restoreHistoryState,
  withHistoryFacts,
  withHistoryProgram,
  withHistoryStateDraft,
  withHistoryStepId,
  withPublishedHistoryState,
};
export type { HistoryCommitSlice, HistoryReplayOrigin };

export type HistoryStack = 'redos' | 'undos';

type PendingMapping<V extends Value> = Readonly<{
  /** The value `change` produced, so replay need not apply it again. */
  after: EditorDocumentValue<V>;
  change: DocumentChange;
  textOnly: boolean;
  anchors?: true;
  crossing?: ChangeFacts;
}>;

type MappingJournal<V extends Value> = Readonly<{
  entry: PendingMapping<V>;
  previous: MappingJournal<V> | null;
}>;

const stepBranchTracks = <V extends Value>(
  value: HistoryBranch<V> | null,
  commit: HistoryCommitSlice<V>,
  otherWriter: boolean
): HistoryBranch<V> | null =>
  stepTracks(value, commit, otherWriter, withKeptBranch);

export type HistoryBranch<V extends Value> = Readonly<{
  anchorCeiling: number;
  base: EditorDocumentValue<V>;
  batch: Batch<V>;
  carets: HistoryCarets | null;
  /**
   * A step on this branch carries a run, so each outside update maps on its
   * own and a read of history never changes where its letters go.
   */
  carries: boolean;
  depth: number;
  group: HistoryBatchGroup | null;
  hasActiveTrack: boolean;
  identity: object;
  mappings: MappingJournal<V> | null;
  next: HistoryBranch<V> | null;
  origin: HistoryReplayOrigin<V> | null;
  recovery: AnchorHistoryRecovery | null;
  replay: HistoryReplay<EditorDocumentValue<V>>;
  kept: KeptRedo<V> | null;
}>;

type KeptRedo<V extends Value> =
  | Readonly<{ branch: HistoryBranch<V>; kind: 'program' }>
  | Readonly<{ kind: 'fallback'; plain: HistoryBranch<V> }>
  | KeptWrapRedo<V>;

type KeptWrapRedo<V extends Value> = Readonly<{
  branch: HistoryBranch<V>;
  kind: 'wrap';
  wrap: KeptWrap;
}>;

type ResolvedHistoryEntry<V extends Value> = Readonly<{
  anchorCeiling: number;
  base: EditorDocumentValue<V>;
  batch: Batch<V>;
  carets: HistoryCarets | null;
  group: HistoryBatchGroup | null;
  identity: object;
  origin: HistoryReplayOrigin<V> | null;
  recovery: AnchorHistoryRecovery | null;
  kept: KeptRedo<V> | null;
  replay: HistoryReplay<EditorDocumentValue<V>>;
}>;

type PendingHistoryReplay<V extends Value> = Readonly<{
  activation: object;
  claimVersion: number;
  direction: 'redo' | 'undo';
  edited: boolean;
  entry: ResolvedHistoryEntry<V> | null;
  identity: object;
  phase: 'attached' | 'detached' | 'dropped';
  replayMappings: MappingJournal<V> | null;
  request: number;
  undoAnchor: object | null;
}>;

export type HistoryStore<V extends Value> = HistoryStoreBase<
  V,
  HistoryBranch<V>,
  PendingHistoryReplay<V>
>;

const KEPT_REDO_ATTEMPTS = new Map<
  number,
  Readonly<{ attempt: HistoryBranch<Value>; drops: readonly CrossingDrop[] }>
>();

export const getStore = <V extends Value>(editor: Editor<V>): HistoryStore<V> =>
  readHistoryStore<V, HistoryBranch<V>, PendingHistoryReplay<V>>(editor);

const captureHistoryState = <V extends Value = Value>(editor: AnyEditor) =>
  captureStore<V, HistoryBranch<V>, PendingHistoryReplay<V>>(editor);

export const setStore = <V extends Value>(
  editor: Editor<V>,
  store: HistoryStore<V>
) =>
  writeHistoryStore<V, HistoryBranch<V>, PendingHistoryReplay<V>>(
    editor,
    store
  );

export const publish = <V extends Value>(
  editor: Editor<V>,
  store: HistoryStore<V>,
  patch: Partial<Omit<HistoryStore<V>, 'revision' | 'snapshot'>>
) => publishStore(editor, store, patch);

const HISTORY_FALLBACKS = new WeakMap<
  Batch,
  Batch | null | (() => Batch | null)
>();

export const withHistoryFallback = <B extends Batch>(
  batch: B,
  fallback: Batch | null
): B => {
  HISTORY_FALLBACKS.set(batch, fallback);

  return batch;
};

export const historyFallbackOf = <V extends Value>(
  batch: Batch<V>
): Batch<V> | null => {
  const fallback = HISTORY_FALLBACKS.get(batch) ?? null;

  if (typeof fallback !== 'function') return fallback;

  const mapped = fallback();

  HISTORY_FALLBACKS.set(batch, mapped);

  return mapped;
};

const outsideFallbackCount = <T>(run: () => T) => {
  const fallbacks = readCoreWork().carriedFallbacks;
  const result = run();

  countCoreWork(
    'carriedFallbacks',
    fallbacks - readCoreWork().carriedFallbacks
  );

  return result;
};

export const freezeHistoryBatch = <V extends Value>(
  batch: Batch<V>
): Batch<V> => {
  const { selectionAfterRoot, selectionBeforeRoot, ...value } = batch;
  const afterRoot = additionalRoot(selectionAfterRoot);
  const beforeRoot = additionalRoot(selectionBeforeRoot);
  const frozen = withHistoryProgram(
    Object.freeze({
      ...value,
      ...(batch.carried
        ? {
            carried: Object.freeze(
              batch.carried.map((run) => Object.freeze({ ...run }))
            ),
          }
        : {}),
      effects: Object.freeze(
        batch.effects.map((effect) => Object.freeze({ ...effect }))
      ),
      selectionAfter: cloneFrozen(
        omitPrimarySelectionRoot(batch.selectionAfter)
      ),
      ...(afterRoot ? { selectionAfterRoot: afterRoot } : {}),
      selectionBefore: cloneFrozen(
        omitPrimarySelectionRoot(batch.selectionBefore)
      ),
      ...(beforeRoot ? { selectionBeforeRoot: beforeRoot } : {}),
    }),
    historyProgramOf(batch)
  );
  const fallback = HISTORY_FALLBACKS.get(batch);
  const step = historyStepOf(batch);

  if (fallback !== undefined) HISTORY_FALLBACKS.set(frozen, fallback);
  if (step) withHistoryStep(frozen, step);

  return withHistoryFacts(frozen, historyFactsOf(batch));
};

const freezeBatch = freezeHistoryBatch;

/**
 * What a step's replay keeps beside its change: its carried runs, and the
 * take-back and rest a two-part step replays apart.
 */
const replayedOf = <V extends Value>(batch: Batch<V>) => ({
  carried: batch.carried,
  program: historyProgramOf(batch),
  parts:
    batch.rest && batch.unsettle
      ? { rest: batch.rest, unsettle: batch.unsettle }
      : undefined,
});

const branch = <V extends Value>(
  batch: Batch<V>,
  base: EditorDocumentValue<V>,
  replay: HistoryReplay<EditorDocumentValue<V>>,
  next: HistoryBranch<V> | null,
  mappings: MappingJournal<V> | null = null,
  group: HistoryBatchGroup | null = null,
  recovery: AnchorHistoryRecovery | null = null,
  anchorCeiling = 0,
  identity: object = {},
  carets: HistoryCarets | null = null,
  kept: KeptRedo<V> | null = null,
  origin: HistoryReplayOrigin<V> | null = Object.freeze({
    base,
    change: replay.change,
    outside: null,
    track: null,
  })
): HistoryBranch<V> =>
  Object.freeze({
    anchorCeiling,
    base,
    batch: withHistoryStep(
      withHistoryFacts(
        withHistoryProgram(
          freezeBatch({ ...batch, change: replay.change }),
          replay.program
        ),
        replay.change === batch.change ? historyFactsOf(batch) : undefined
      ),
      identity
    ),
    carets,
    carries: replay.carried !== undefined || (next?.carries ?? false),
    replay,
    depth: (next?.depth ?? 0) + 1,
    group,
    hasActiveTrack: branchHasActiveTrack(origin, next, kept),
    identity,
    kept,
    mappings,
    next,
    origin,
    recovery,
  });

const withKeptBranch = <V extends Value>(
  kept: KeptRedo<V> | null,
  change: (branch: HistoryBranch<V>) => HistoryBranch<V> | null
): KeptRedo<V> | null => {
  if (!kept) return null;
  if (kept.kind === 'fallback') {
    const plain = change(kept.plain);

    return plain === kept.plain
      ? kept
      : plain
        ? Object.freeze({ ...kept, plain })
        : null;
  }

  const mapped = change(kept.branch);

  return mapped === kept.branch
    ? kept
    : mapped
      ? Object.freeze({ ...kept, branch: mapped })
      : null;
};

const clipBranch = <V extends Value>(
  value: HistoryBranch<V> | null,
  maxDepth: number
): HistoryBranch<V> | null => {
  if (!value || maxDepth === 0) return null;
  if (value.depth <= maxDepth) return value;

  const kept: Array<HistoryBranch<V>> = [];
  let current: HistoryBranch<V> | null = value;

  while (current && kept.length < maxDepth) {
    kept.push(current);
    current = current.next;
  }

  let clipped: HistoryBranch<V> | null = null;
  for (let index = kept.length - 1; index >= 0; index -= 1) {
    const item = kept[index];

    clipped = branch(
      item.batch,
      item.base,
      item.replay,
      clipped,
      item.mappings,
      item.group,
      item.recovery,
      item.anchorCeiling,
      item.identity,
      item.carets,
      withKeptBranch(item.kept, (other) => clipBranch(other, maxDepth - index)),
      item.origin
    );
  }

  return clipped;
};

const pushBranch = <V extends Value>(
  value: HistoryBranch<V> | null,
  batchValue: Batch<V>,
  base: EditorDocumentValue<V>,
  replay: HistoryReplay<EditorDocumentValue<V>>,
  maxDepth: number,
  group: HistoryBatchGroup | null = null,
  recovery: AnchorHistoryRecovery | null = null,
  anchorCeiling = 0,
  identity: object = {},
  carets: HistoryCarets | null = null,
  origin?: HistoryReplayOrigin<V> | null
) =>
  branch(
    batchValue,
    base,
    replay,
    clipBranch(value, maxDepth - 1),
    null,
    group,
    recovery,
    anchorCeiling,
    identity,
    carets,
    null,
    origin
  );

export const addMapping = <V extends Value>(
  value: HistoryBranch<V> | null,
  entry: PendingMapping<V>
): HistoryBranch<V> | null => {
  if (!value) return null;
  countCoreWork('historyMappingNodes');

  const previous = value.mappings;
  const mappings =
    !value.carries && previous?.entry.textOnly && entry.textOnly
      ? Object.freeze({
          entry: Object.freeze({
            after: entry.after,
            change: previous.entry.change.compose(entry.change),
            textOnly: true,
          }),
          previous: previous.previous,
        })
      : Object.freeze({ entry, previous });

  return Object.freeze({
    ...value,
    kept: withKeptBranch(value.kept, (other) => addMapping(other, entry)),
    mappings,
  });
};

export const journalEntries = <V extends Value>(
  journal: MappingJournal<V>
): ReadonlyArray<PendingMapping<V>> => {
  const entries: Array<PendingMapping<V>> = [];

  for (
    let item: MappingJournal<V> | null = journal;
    item;
    item = item.previous
  ) {
    entries.push(item.entry);
  }

  return entries.reverse();
};

const retainMappedCompositionGroup = (
  group: HistoryBatchGroup | null
): HistoryBatchGroup | null => {
  if (group?.native?.composition === undefined) return null;

  const shared = {
    ...(group.closed ? { closed: group.closed } : {}),
    native: group.native,
    ...(group.scope ? { scope: group.scope } : {}),
  };

  return group.kind === 'effects'
    ? Object.freeze({ ...shared, kind: 'effects' })
    : Object.freeze({ ...shared, kind: 'document', roots: groupRoots(group) });
};

const yieldTo = <V extends Value>(
  change: DocumentChange,
  edit: DocumentChange,
  base: EditorDocumentValue<V>
) =>
  transformInternalDocumentChange(change, edit, base, {
    keepRecordWrites: true,
  }).a;

export const crossingDropCount = (editor: AnyEditor) =>
  captureHistoryState(editor)?.crossingDrops ?? 0;

const changedRootIndexes = (
  value: EditorDocumentValue,
  change: DocumentChange
) =>
  new Map(
    getInternalDocumentChangeRootKeys(change).map((root) => [
      root,
      valueRootIndex(value, root),
    ])
  );

const crossOrDrop = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  replay: HistoryReplay<EditorDocumentValue<V>>,
  base: EditorDocumentValue<V>,
  facts: ChangeFacts | undefined,
  mapping: PendingMapping<V>,
  crossing: ChangeFacts
) => {
  countCoreWork('crossedSteps');
  try {
    if (!facts) {
      throw new Error('A crossing reached a step with no facts.');
    }

    const { followed, leftover } = crossRecord(
      base,
      { change: replay.change, facts },
      { change: mapping.change, facts: crossing }
    );

    const after = followed.change.apply(mapping.after);

    getEditorSchema(editor).checkDocumentChange({
      after,
      before: mapping.after,
      change: followed.change,
      indexedAfter: changedRootIndexes(after, followed.change),
      indexedBefore: changedRootIndexes(mapping.after, followed.change),
    });
    const change = classifyDocumentChange(
      mapping.after,
      after,
      followed.change
    );

    return {
      facts: followed.facts,
      kind: 'crossed' as const,
      keptWrap: null,
      projected: false,
      readBack: false,
      replay: recordHistoryReplay(
        historyReplaySchemaOf(editor),
        mapping.after,
        change,
        replay.direction,
        { after }
      ),
      rest: leftover.change,
      restFacts: leftover.facts,
    };
  } catch (error) {
    drops.push({
      cause: error,
      direction: replay.direction,
      editor,
    });

    return { kind: 'dropped' as const };
  }
};

const headAfterDrop = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V>,
  target: EditorDocumentValue<V>
) => {
  const { next } = value;
  const from = next?.mappings?.entry.after ?? next?.base;
  const correction =
    next && from
      ? DocumentChange.between(from, target, {
          isSetValued: historyReplaySchemaOf(editor).isSetValued,
        })
      : DocumentChange.empty;

  return {
    head: correction.empty
      ? next
      : addMapping(next, {
          after: target,
          change: correction,
          textOnly: isTextOnlyMapping(correction),
        }),
    keptWrap: null,
    projected: false,
    projectedAfterReadBack: false,
    readBack: false,
  };
};

const mapHead = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V>,
  { anchor, readBack: reads }: ReplayRules,
  count = Number.POSITIVE_INFINITY
) => {
  if (!value.mappings) {
    return {
      head: value,
      keptWrap: null,
      projected: false,
      projectedAfterReadBack: false,
      readBack: false,
    };
  }

  let keptWrap: KeptWrap | null = null;
  let readBack = false;
  let projected = false;
  let projectedAfterReadBack = false;
  let batchBase = value.base;
  let outside = value.origin ? value.origin.outside : null;
  let batchValue = value.batch;
  let { replay } = value;
  let { next } = value;
  let { carets, recovery } = value;
  let batchFacts = historyFactsOf(value.batch);
  const entries = journalEntries(value.mappings);

  for (const mapping of entries.slice(0, count)) {
    const nextBase = replay.record().after;
    const crossed = mapping.crossing
      ? crossOrDrop(
          editor,
          drops,
          replay,
          batchBase,
          batchFacts,
          mapping,
          mapping.crossing
        )
      : null;

    if (crossed?.kind === 'dropped') {
      return headAfterDrop(editor, value, (entries.at(-1) ?? mapping).after);
    }

    const mapped =
      crossed ??
      mapHistoryReplay(
        historyReplaySchemaOf(editor),
        replay,
        batchBase,
        mapping,
        {
          anchor: anchor && mapping.anchors === true,
          readBack: reads,
        }
      );

    batchFacts = crossed?.facts;
    keptWrap ??= mapped.keptWrap;
    projected ||= mapped.projected;
    projectedAfterReadBack ||= readBack && mapped.projected;
    readBack ||= mapped.readBack;
    const mappedBatchBase = mapping.after;
    const mappedNextBase = mapped.replay.record().after;
    ({ replay } = mapped);

    const batchEdge = {
      after: mappedBatchBase,
      before: batchBase,
      change: mapping.change,
      facts: mapping.crossing ?? null,
    };
    const nextEdge = {
      after: mappedNextBase,
      before: nextBase,
      change: mapped.rest,
      facts: crossed?.restFacts ?? null,
    };
    const sides =
      replay.direction === 'undo'
        ? { after: batchEdge, before: nextEdge }
        : { after: nextEdge, before: batchEdge };

    recovery = mapAnchorHistoryRecovery(recovery, 'after', sides.after);
    recovery = mapAnchorHistoryRecovery(recovery, 'before', sides.before);
    if (carets) carets = mapHistoryCarets(editor, carets, batchValue, sides);
    const {
      carried: _carried,
      rest: _rest,
      unsettle: _unmapped,
      ...mappedBatch
    } = batchValue;
    const parts = replay.parts && {
      rest: replay.parts.rest.change,
      unsettle: replay.parts.unsettle.change,
    };
    const unsettle =
      parts?.unsettle ??
      (batchValue.unsettle &&
        yieldTo(batchValue.unsettle, mapping.change, batchBase));

    batchValue = freezeBatch<V>({
      ...mappedBatch,
      ...(parts ?? (unsettle && !unsettle.empty ? { unsettle } : {})),
      ...(replay.carried ? { carried: replay.carried } : {}),
      change: replay.change,
      effects: batchValue.effects.flatMap((effect) => {
        const mappedEffect = mapEffect(effect, mapping.change);

        return mappedEffect ? [mappedEffect] : [];
      }),
      selectionAfter: mapHistorySelection(
        editor,
        batchValue.selectionAfter,
        sides.after.change,
        sides.after.before,
        sides.after.after,
        batchValue.selectionAfterRoot ?? MAIN_ROOT_KEY
      ),
      selectionBefore: mapHistorySelection(
        editor,
        batchValue.selectionBefore,
        sides.before.change,
        sides.before.before,
        sides.before.after,
        batchValue.selectionBeforeRoot ?? MAIN_ROOT_KEY
      ),
    });
    if (!mapped.rest.empty) {
      next = addMapping<V>(next, {
        after: mappedNextBase,
        change: mapped.rest,
        textOnly: false,
        ...(crossed ? { crossing: crossed.restFacts } : {}),
      });
    }
    if (value.origin) {
      outside = outside
        ? outside.compose(mapping.change, value.origin.base)
        : mapping.change;
    }
    batchBase = mappedBatchBase;
  }

  const later = entries.slice(count);
  const empty = batchValue.change.empty && batchValue.effects.length === 0;

  if (empty) {
    for (const mapping of later) next = addMapping(next, mapping);
  } else {
    countCoreWork('historyBranchRebuilds');
  }

  return {
    head: empty
      ? next
      : branch<V>(
          withHistoryFacts(batchValue, batchFacts),
          batchBase,
          replay,
          next,
          later.reduce<MappingJournal<V> | null>(
            (previous, entry) => Object.freeze({ entry, previous }),
            null
          ),
          retainMappedCompositionGroup(value.group),
          recovery,
          value.anchorCeiling,
          value.identity,
          carets,
          null,
          value.origin ? Object.freeze({ ...value.origin, outside }) : null
        ),
    keptWrap,
    projected,
    projectedAfterReadBack,
    readBack,
  };
};

const mapAnchored = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V>,
  readBack: boolean
) => {
  const drops: DropSink = [];

  try {
    return {
      ...mapHead(editor, drops, value, { anchor: true, readBack }),
      drops,
    };
  } catch {
    return null;
  }
};

const resolveProgramHead = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V>,
  readBack: boolean
) => {
  const attemptDrops: DropSink = [];
  const mapped = mapHead(editor, attemptDrops, value, {
    anchor: false,
    readBack,
  });
  const { head: attempt } = mapped;
  const fallbackReplay = projectedHistoryReplay(
    historyReplaySchemaOf(editor),
    value.replay,
    value.base
  );

  if (
    !attempt?.replay.program ||
    attempt.identity !== value.identity ||
    !fallbackReplay
  ) {
    drops.push(...attemptDrops);

    return mapped;
  }

  const fallbackDrops: DropSink = [];
  countCoreWork('historyBranchRebuilds');
  const { head: fallback } = mapHead(
    editor,
    fallbackDrops,
    branch<V>(
      value.batch,
      value.base,
      fallbackReplay,
      value.next,
      value.mappings,
      value.group,
      value.recovery,
      value.anchorCeiling,
      value.identity,
      value.carets,
      null,
      value.origin
    ),
    { anchor: false, readBack: false }
  );

  if (fallback?.identity !== value.identity) {
    drops.push(...attemptDrops);

    return mapped;
  }
  drops.push(...fallbackDrops);

  return {
    head: Object.freeze({
      ...fallback,
      kept: Object.freeze({ branch: attempt, kind: 'program' as const }),
    }),
    projected: mapped.projected,
    projectedAfterReadBack: mapped.projectedAfterReadBack,
    readBack: mapped.readBack,
  };
};

const crossFirstMapping = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V>
) => mapHead(editor, drops, value, { anchor: false, readBack: false }, 1).head;

const resolveHead = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V>
): HistoryBranch<V> | null => {
  if (!value.mappings) return value;
  if (journalEntries(value.mappings)[0]?.crossing) {
    return crossFirstMapping(editor, drops, value);
  }

  const earlier = value.kept?.kind === 'fallback' ? value.kept.plain : null;
  const current = earlier ? Object.freeze({ ...value, kept: null }) : value;
  const bestDrops: DropSink = [];
  const {
    head: best,
    projected,
    projectedAfterReadBack,
    readBack: shaped,
  } = resolveByRules(editor, bestDrops, current, true);

  if (projectedAfterReadBack || (earlier && projected)) {
    return resolveByRules(editor, drops, earlier ?? current, false).head;
  }
  if (
    current.replay.direction !== 'redo' ||
    !best ||
    best.kept ||
    best.identity !== value.identity ||
    (!earlier && !shaped)
  ) {
    drops.push(...bestDrops);

    return best;
  }

  const fallback = earlier ?? plainOf(editor, current);

  if (shaped) {
    try {
      editor.read.schema.assertDocument(best.replay.change.apply(best.base));
    } catch {
      return resolveByRules(editor, drops, fallback, false).head;
    }
  }
  drops.push(...bestDrops);

  return Object.freeze({
    ...best,
    kept: Object.freeze({ kind: 'fallback' as const, plain: fallback }),
  });
};

const plainOf = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V>
) => {
  const { head } = outsideFallbackCount(() =>
    resolveByRules(editor, [], value, false)
  );

  return head?.identity === value.identity ? head : value;
};

const plainFallback = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  shown: HistoryBranch<V>
) => {
  if (shown.kept?.kind !== 'fallback') return null;

  const { head: plain } = resolveByRules(
    editor,
    drops,
    shown.kept.plain,
    false
  );

  return plain &&
    plain.identity === shown.identity &&
    !jsonEqual(plain.replay.change.toJSON(), shown.replay.change.toJSON())
    ? plain
    : null;
};

const resolveByRules = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V>,
  readBack: boolean
): Readonly<{
  head: HistoryBranch<V> | null;
  projected: boolean;
  projectedAfterReadBack: boolean;
  readBack: boolean;
}> => {
  if (!value.mappings) {
    return {
      head: value,
      projected: false,
      projectedAfterReadBack: false,
      readBack: false,
    };
  }
  if (
    value.replay.program &&
    value.replay.direction === 'redo' &&
    !value.kept
  ) {
    return resolveProgramHead(editor, drops, value, readBack);
  }

  const anchorable =
    !value.kept &&
    value.replay.direction === 'redo' &&
    journalEntries(value.mappings).some(({ anchors }) => anchors);
  const anchored = value.kept
    ? mapAnchored(
        editor,
        value.kept.kind === 'fallback' ? value.kept.plain : value.kept.branch,
        readBack
      )
    : anchorable
      ? mapAnchored(editor, value, readBack)
      : null;

  if (anchorable && anchored && !anchored.keptWrap) {
    drops.push(...anchored.drops);

    return anchored;
  }

  const wrap = value.kept
    ? value.kept.kind === 'wrap'
      ? value.kept.wrap
      : null
    : anchored?.keptWrap;
  const attempt =
    anchored?.head?.identity === value.identity ? anchored.head : null;
  const kept: KeptRedo<V> | null =
    attempt && wrap
      ? Object.freeze({ branch: attempt, kind: 'wrap', wrap })
      : attempt?.replay.program
        ? Object.freeze({ branch: attempt, kind: 'program' })
        : null;
  const mapped = mapHead(editor, drops, value, {
    anchor: false,
    readBack: readBack && !kept,
  });
  const { head } = mapped;

  return kept && head?.identity === value.identity
    ? { ...mapped, head: Object.freeze({ ...head, kept }) }
    : mapped;
};

export const resolveTop = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null
): HistoryBranch<V> | null =>
  resolveForgottenTop(
    getStore(editor).forgottenStepIds,
    value,
    (entry) => resolveHead(editor, drops, entry),
    (entry, from, to) => mappedOnto(editor, entry, from, to)
  );

const resolveCanonicalTop = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null
): HistoryBranch<V> | null => {
  const head = resolveTop(editor, drops, value);

  if (!head) return null;

  const schema = historyReplaySchemaOf(editor);
  const target = head.replay.change.apply(head.base);
  const repair = schema.repairCanonical(head.base, head.replay.change, target);

  if (repair.empty) return head;

  const repaired = repair.apply(target);
  const change = head.replay.change.compose(repair);
  const rest = head.batch.rest?.compose(repair);
  const { carried: _carried, ...repairedBatch } = head.batch;
  const carried =
    head.batch.carried &&
    landCarriedRuns(head.batch.carried, [
      { after: repaired, before: target, change: repair },
    ]);
  const undo = head.replay.direction === 'undo';
  const unmoved = {
    after: head.base,
    before: head.base,
    change: DocumentChange.between(head.base, head.base),
  };
  const moved = { after: repaired, before: target, change: repair };
  const restored = (selection: Batch<V>['selectionBefore'], root?: string) =>
    mapHistorySelection(
      editor,
      selection,
      repair,
      target,
      repaired,
      root ?? MAIN_ROOT_KEY
    );

  countCoreWork('historyBranchRebuilds');

  return branch<V>(
    freezeBatch<V>(
      undo
        ? {
            ...repairedBatch,
            change,
            ...(rest ? { rest } : {}),
            ...(carried ? { carried } : {}),
            selectionBefore: restored(
              head.batch.selectionBefore,
              head.batch.selectionBeforeRoot
            ),
          }
        : {
            ...repairedBatch,
            change,
            ...(carried ? { carried } : {}),
            selectionAfter: restored(
              head.batch.selectionAfter,
              head.batch.selectionAfterRoot
            ),
          }
    ),
    head.base,
    recordHistoryReplay(schema, head.base, change, head.replay.direction, {
      carried,
      program: head.replay.program,
      parts:
        rest && head.batch.unsettle
          ? { rest, unsettle: head.batch.unsettle }
          : undefined,
    }),
    addMapping<V>(head.next, {
      after: repaired,
      change: repair,
      textOnly: isTextOnlyMapping(repair),
    }),
    null,
    head.group,
    mapAnchorHistoryRecovery(head.recovery, undo ? 'before' : 'after', {
      after: repaired,
      before: target,
      change: repair,
      facts: null,
    }),
    head.anchorCeiling,
    head.identity,
    head.carets &&
      mapHistoryCarets(
        editor,
        head.carets,
        head.batch,
        undo
          ? { after: unmoved, before: moved }
          : { after: moved, before: unmoved }
      ),
    head.kept,
    head.origin
  );
};

const shownBatches = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null
) => {
  const attempt: DropSink = [];

  try {
    const batches = listBatches(editor, attempt, value, 'program');

    drops.push(...attempt);

    return batches;
  } catch {
    return listBatches(editor, drops, value, 'main');
  }
};

const listBatches = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null,
  shows: 'main' | 'program'
) => {
  const batches: Array<Batch<V>> = [];
  let current = resolveTop(editor, drops, value);

  while (current) {
    const shown =
      shows === 'program' && current.kept?.kind === 'program'
        ? current.kept.branch
        : current;

    if (
      shown !== current &&
      !jsonEqual(current.replay.change.toJSON(), shown.replay.change.toJSON())
    ) {
      HISTORY_FALLBACKS.set(shown.batch, current.batch);
    }
    if (shown.kept?.kind === 'fallback') {
      const withFallback = shown;

      HISTORY_FALLBACKS.set(
        shown.batch,
        () =>
          outsideFallbackCount(() => plainFallback(editor, [], withFallback))
            ?.batch ?? null
      );
    }
    batches.push(shown.batch);
    current = resolveTop(editor, drops, shown.next);
  }

  return Object.freeze(batches.toReversed());
};

const resolvedEntryOf = <V extends Value>(
  current: HistoryBranch<V>
): ResolvedHistoryEntry<V> => ({
  anchorCeiling: current.anchorCeiling,
  base: current.base,
  batch: current.batch,
  carets: current.carets,
  group: current.group,
  identity: current.identity,
  kept: current.kept,
  origin: current.origin,
  recovery: current.recovery,
  replay: current.replay,
});

export const resolveAll = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null
) => {
  const newest: Array<ResolvedHistoryEntry<V>> = [];
  let current = value;

  while (current) {
    countCoreWork('historyBranchVisits');
    current = resolveTop(editor, drops, current);
    if (!current) break;
    newest.push(resolvedEntryOf(current));
    current = current.next;
  }

  const resolved = rebuildBranch(newest, Number.POSITIVE_INFINITY);

  return {
    batches: shownBatches(editor, drops, resolved),
    branch: resolved,
    entries: Object.freeze(newest),
  };
};

export const rebuildBranch = <V extends Value>(
  entries: ReadonlyArray<ResolvedHistoryEntry<V>>,
  maxDepth: number,
  tail: HistoryBranch<V> | null = null
) => {
  let value = tail;

  for (
    let index = Math.min(entries.length, maxDepth) - 1;
    index >= 0;
    index -= 1
  ) {
    const entry = entries[index];

    countCoreWork('historyBranchRebuilds');
    value = branch(
      entry.batch,
      entry.base,
      entry.replay,
      value,
      null,
      entry.group,
      entry.recovery,
      entry.anchorCeiling,
      entry.identity,
      entry.carets,
      withKeptBranch(entry.kept, (other) =>
        clipBranch(other, maxDepth - index)
      ),
      entry.origin
    );
  }

  return value;
};

const replacePendingReplay = <V extends Value>(
  editor: Editor<V>,
  store: HistoryStore<V>,
  pendingReplay: PendingHistoryReplay<V> | null,
  patch: Partial<Pick<HistoryStore<V>, 'redos' | 'undos'>> = {}
) => {
  setStore(
    editor,
    Object.freeze({
      ...store,
      ...patch,
      pendingReplay,
    })
  );
};

export const beginHistoryReplay = <V extends Value>(
  editor: Editor<V>,
  input: Readonly<{
    activation: object;
    claimVersion: number;
    direction: 'redo' | 'undo';
    identity: object;
    request: number;
    undoAnchor: object | null;
  }>
) => {
  const store = getStore(editor);

  if (store.pendingReplay) {
    throw new Error('History replay is already pending.');
  }

  replacePendingReplay(
    editor,
    store,
    Object.freeze({
      ...input,
      edited: false,
      entry: null,
      phase: 'attached',
      replayMappings: null,
    })
  );
};

export const readPendingHistoryReplay = (editor: Editor) =>
  getStore(editor).pendingReplay;

export const dropPendingHistoryReplayEntry = (editor: Editor) => {
  const store = getStore(editor);
  const pending = store.pendingReplay;

  if (!pending || pending.phase === 'dropped') return;

  replacePendingReplay(
    editor,
    store,
    Object.freeze({
      ...pending,
      entry: null,
      phase: 'dropped',
    })
  );
};

export const queuePendingHistoryReplayMapping = <V extends Value>(
  editor: Editor<V>,
  change: DocumentChange,
  after: EditorDocumentValue<V>
) => {
  if (change.empty) return;

  const store = getStore(editor);
  const pending = store.pendingReplay;

  if (!pending || pending.phase !== 'attached') return;

  replacePendingReplay(
    editor,
    store,
    Object.freeze({
      ...pending,
      replayMappings: Object.freeze({
        entry: Object.freeze({
          after,
          change,
          textOnly: isTextOnlyMapping(change),
        }),
        previous: pending.replayMappings,
      }),
    })
  );
};

export const markPendingHistoryReplayEdited = <V extends Value>(
  editor: Editor<V>
) => {
  const store = getStore(editor);
  const pending = store.pendingReplay;

  if (!pending) return false;
  if (pending.edited) return true;

  if (pending.direction !== 'redo' || pending.phase !== 'attached') {
    replacePendingReplay(
      editor,
      store,
      Object.freeze({ ...pending, edited: true })
    );
    return true;
  }

  const drops: DropSink = [];
  const redos = resolveAll(editor, drops, store.redos);
  const entry =
    redos.entries.find(
      (candidate) => candidate.identity === pending.identity
    ) ?? null;

  replacePendingReplay(
    editor,
    withDrops(store, drops),
    Object.freeze({
      ...pending,
      edited: true,
      entry,
      phase: entry ? 'detached' : 'dropped',
    }),
    { redos: redos.branch }
  );

  return true;
};

export const settlePendingHistoryReplay = <V extends Value>(
  editor: Editor<V>,
  input: SessionReplaySettlementInput<V>
) => {
  const store = getStore(editor);
  const pending = store.pendingReplay;

  if (!pending || pending.request !== input.request) {
    throw new Error('History replay settlement has no matching claim.');
  }

  if (input.status === 'blocked') {
    replacePendingReplay(editor, store, null);
    return null;
  }
  if (!input.change || !input.effects) {
    throw new Error('Applied history replay settlement requires a batch.');
  }

  const drops: DropSink = [];
  const listed = store.redoFreeze ? null : store.redos;
  const undos = resolveAll(editor, drops, store.undos);
  const redos = resolveAll(editor, drops, listed);
  const source = pending.direction === 'undo' ? undos.entries : redos.entries;
  const attached = source.find(
    (candidate) => candidate.identity === pending.identity
  );
  const claimed =
    pending.phase === 'detached' ? pending.entry : (attached ?? null);

  if (!claimed) {
    replacePendingReplay(editor, withDrops(store, drops), null, {
      redos: listed ? redos.branch : store.redos,
      undos: undos.branch,
    });
    return null;
  }

  const forward = input.forward ?? DocumentChange.empty;
  let nextUndos = [...undos.entries];
  let nextRedos = [...redos.entries];
  let insertionIndex: number | null = null;
  let replayBase = !forward.empty && input.after ? input.after : claimed.base;
  let replayEffects = mapSessionReplayEffects(
    input.effects,
    pending.replayMappings
      ? journalEntries(pending.replayMappings).map((m) => m.change)
      : []
  );

  if (pending.direction === 'undo') {
    nextUndos = nextUndos.filter((c) => c.identity !== pending.identity);
  } else {
    nextRedos = nextRedos.filter((c) => c.identity !== pending.identity);
    if (pending.edited) {
      insertionIndex = pending.undoAnchor
        ? nextUndos.findIndex((c) => c.identity === pending.undoAnchor)
        : nextUndos.length;

      if (insertionIndex >= 0 && insertionIndex < store.maxDepth) {
        const latestUndo = nextUndos.at(-1);
        const anchorBase =
          nextUndos[insertionIndex]?.base ??
          (latestUndo
            ? latestUndo.batch.change.apply(latestUndo.base)
            : claimed.base);
        ({ replayBase, replayEffects } = resolveSessionSettlementBase({
          anchorBase,
          claimedBase: claimed.base,
          forward,
          replayEffects,
        }));
      }
    }
  }

  const {
    carried: _carried,
    rest: _rest,
    unsettle: _unsettle,
    ...claimedBatch
  } = claimed.batch;
  const replayed = Object.freeze({
    ...claimed,
    base: replayBase,
    kept: null,
    origin:
      (pending.edited && replayBase !== claimed.base) ||
      pending.replayMappings !== null
        ? null
        : createOrigin(editor, replayBase, input.change),
    replay: recordHistoryReplay(
      historyReplaySchemaOf(editor),
      replayBase,
      input.change,
      pending.direction === 'undo' ? 'redo' : 'undo'
    ),
    batch: Object.freeze({
      ...claimedBatch,
      change: input.change,
      effects: replayEffects.toReversed().map(invertEffect),
    }),
  });

  placeSettledSessionEntry({
    direction: pending.direction,
    edited: pending.edited,
    insertionIndex,
    maxDepth: store.maxDepth,
    nextRedos,
    nextUndos,
    replayed,
  });

  const settled = settleSessionBranches({
    addMapping,
    after: input.after,
    direction: pending.direction,
    edited: pending.edited,
    forward,
    rebaseOnto: (b, current) => rebaseOnto(editor, drops, b, current),
    redos: rebuildBranch(nextRedos, store.maxDepth),
    undos: rebuildBranch(nextUndos, store.maxDepth),
  });
  publish(editor, withDrops(store, drops), {
    pendingReplay: null,
    redoFreeze: null,
    ...settled,
  });

  return claimed.identity;
};

const fromBatches = <V extends Value>(
  editor: Editor<V>,
  direction: 'undo' | 'redo',
  batches: ReadonlyArray<Batch<V>>,
  base: EditorDocumentValue<V>,
  maxDepth: number
) => {
  const entries: Array<{
    base: EditorDocumentValue<V>;
    batch: Batch<V>;
  }> = [];
  let currentBase = base;

  for (const batchValue of batches.slice(-maxDepth).toReversed()) {
    entries.push({ base: currentBase, batch: batchValue });
    currentBase = batchValue.change.apply(currentBase);
  }

  let value: HistoryBranch<V> | null = null;
  const replayOf = (batchValue: Batch<V>, from: EditorDocumentValue<V>) =>
    recordHistoryReplay(
      historyReplaySchemaOf(editor),
      from,
      batchValue.change,
      direction,
      replayedOf(batchValue)
    );

  for (const entry of entries.toReversed()) {
    const fallback =
      direction === 'redo' ? historyFallbackOf(entry.batch) : null;
    const identity = historyStepOf(entry.batch) ?? {};

    value = branch(
      entry.batch,
      entry.base,
      replayOf(entry.batch, entry.base),
      value,
      null,
      null,
      null,
      0,
      identity,
      null,
      fallback
        ? Object.freeze({
            kind: 'fallback' as const,
            plain: branch(
              fallback,
              entry.base,
              replayOf(fallback, entry.base),
              value,
              null,
              null,
              null,
              0,
              identity,
              null,
              null,
              null
            ),
          })
        : null,
      null
    );
  }

  return value;
};

/** Publish activation options and the live schema as one history revision. */
export const configureHistoryState = <V extends Value>(
  editor: Editor<V>,
  maxDepth: number,
  schema: EditorSchemaIdentity = editor.read.schema.identity()
) => {
  const store = getStore(editor);
  const schemaChanged = !areEditorSchemaIdentitiesEqual(store.schema, schema);

  if (store.maxDepth === maxDepth && !schemaChanged) return false;

  publish(editor, store, {
    maxDepth,
    redos: schemaChanged ? null : clipBranch(store.redos, maxDepth),
    schema,
    undos: schemaChanged ? null : clipBranch(store.undos, maxDepth),
  });

  return schemaChanged;
};

export const getWorkingHistory = <V extends Value>(
  editor: Editor<V>
): History<V> => {
  const store = getStore(editor);

  if (store.snapshot) return store.snapshot;

  const drops: DropSink = [];
  const redos = resolveAll(editor, drops, store.redos);
  const undos = resolveAll(editor, drops, store.undos);
  const snapshot = Object.freeze({
    redos: redos.batches,
    revision: store.revision,
    schema: store.schema,
    undos: undos.batches,
  });

  setStore(
    editor,
    withDrops(
      Object.freeze({
        ...store,
        redos: redos.branch,
        snapshot,
        undos: undos.branch,
      }),
      drops
    )
  );

  return snapshot;
};

export const getHistory = <V extends Value>(editor: Editor<V>): History<V> =>
  withPublishedHistoryState(editor, () => getWorkingHistory(editor));

const keptAttempt = <V extends Value>(stack: HistoryStack, request?: number) =>
  stack === 'redos' && request !== undefined
    ? (KEPT_REDO_ATTEMPTS.get(request) as
        | Readonly<{
            attempt: HistoryBranch<V>;
            drops: readonly CrossingDrop[];
          }>
        | undefined)
    : undefined;

const peekResolvedEntry = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack,
  resolve: typeof resolveTop,
  request?: number
) => {
  const store = getStore(editor);
  const kept = keptAttempt<V>(stack, request);
  const head = kept ? kept.attempt : store[stack];
  const drops: DropSink = [];
  const resolved = resolve(editor, drops, head);

  if (kept) {
    if (
      resolved &&
      (resolved !== head || drops.length > 0) &&
      request !== undefined
    ) {
      KEPT_REDO_ATTEMPTS.set(request, {
        attempt: resolved,
        drops: [...kept.drops, ...drops],
      });
    }
  } else if (resolved !== head || drops.length > 0) {
    setStore(
      editor,
      withDrops(
        Object.freeze({
          ...store,
          [stack]: resolved,
          snapshot: null,
        }),
        drops
      )
    );
  }

  return resolved
    ? Object.freeze({
        anchorCeiling: resolved.anchorCeiling,
        base: resolved.base,
        batch: resolved.batch,
        carets: resolved.carets,
        group: resolved.group,
        identity: resolved.identity,
        origin: resolved.origin,
        recovery: resolved.recovery,
        restores: resolved.replay.after,
      })
    : undefined;
};

export const peekHistoryEntry = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack,
  request?: number
) => peekResolvedEntry(editor, stack, resolveTop, request);

const topJoinsNothingOnceMapped = <V extends Value>(editor: Editor<V>) => {
  const head = getStore(editor).undos;
  const mapping = head?.mappings;

  return (
    !!head &&
    !!mapping &&
    !mapping.previous &&
    !mapping.entry.crossing &&
    !head.kept &&
    !retainMappedCompositionGroup(head.group) &&
    keepsUndoThrough(
      historyReplaySchemaOf(editor),
      head.replay,
      head.base,
      mapping.entry
    )
  );
};

export const peekJoinableUndoEntry = <V extends Value>(editor: Editor<V>) => {
  if (topJoinsNothingOnceMapped(editor)) return undefined;

  const drops = crossingDropCount(editor);
  const entry = peekResolvedEntry(editor, 'undos', resolveSurvivingTop);

  return crossingDropCount(editor) === drops ? entry : undefined;
};

export const peekHistoryReplayEntry = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack,
  request?: number
) => peekResolvedEntry(editor, stack, resolveCanonicalTop, request);

const unwrapsTo = (
  after: EditorDocumentValue,
  before: EditorDocumentValue,
  props: Readonly<JsonRecord>
) => {
  if (!jsonEqual(after.records, before.records)) return false;

  const roots = new Set([
    MAIN_ROOT_KEY,
    ...Object.keys(after.roots ?? {}),
    ...Object.keys(before.roots ?? {}),
  ]);
  const changed = [...roots].filter(
    (root) => !alike(valueRoot(after, root), valueRoot(before, root))
  );

  if (changed.length !== 1) return false;

  const [root] = changed;
  const equalFrom = (
    left: readonly JsonNode[],
    right: readonly JsonNode[],
    from: number,
    shift: number
  ) =>
    left.length - from === right.length - from - shift &&
    left
      .slice(from)
      .every((node, index) => alike(node, right[from + shift + index]));
  let left: readonly JsonNode[] = valueRoot(after, root);
  let right: readonly JsonNode[] = valueRoot(before, root);

  while (true) {
    let at = 0;

    while (at < left.length && alike(left[at], right[at])) at += 1;

    const element = left[at];
    const other = right[at];

    if (!element || !isElementNode(element)) return false;

    const held = element.children.length;

    if (
      alike(nodeProps(element), props) &&
      element.children.every((child, index) =>
        alike(child, right[at + index])
      ) &&
      equalFrom(left, right, at + 1, held - 1)
    ) {
      return true;
    }
    if (
      !other ||
      !isElementNode(other) ||
      !alike(nodeProps(element), nodeProps(other)) ||
      !equalFrom(left, right, at + 1, 0)
    ) {
      return false;
    }
    left = element.children;
    right = other.children;
  }
};

const keepsOnlyWrap = <V extends Value>(
  current: EditorDocumentValue<V>,
  head: HistoryBranch<V>,
  kept: KeptWrapRedo<V>
) => {
  try {
    return unwrapsTo(
      kept.branch.replay.change.apply(current),
      head.replay.change.apply(current),
      kept.wrap.props
    );
  } catch {
    return false;
  }
};

export const attachKeptHistoryRedo = <V extends Value>(
  editor: Editor<V>,
  request: number
) => {
  const state = getStore(editor);
  const head = state.redos;
  const kept = head?.kept;

  if (!head || !kept) return null;
  if (
    kept.kind === 'wrap' &&
    (head.next || !keepsOnlyWrap(getEditorDocumentValue(editor), head, kept))
  ) {
    setStore(
      editor,
      Object.freeze({ ...state, redos: Object.freeze({ ...head, kept: null }) })
    );

    return null;
  }

  const causes = DROPPED_HISTORY_CAUSES.get(editor)?.length ?? 0;

  KEPT_REDO_ATTEMPTS.set(request, {
    attempt:
      kept.kind === 'fallback'
        ? Object.freeze({ ...head, kept: null })
        : kept.branch,
    drops: NO_DROPS,
  });

  return {
    detach: () => {
      KEPT_REDO_ATTEMPTS.delete(request);
    },
    fallBack: () => {
      DROPPED_HISTORY_CAUSES.get(editor)?.splice(causes);

      const waiting = getStore(editor).redos;
      const drops: DropSink = [];
      const plain =
        waiting?.identity === head.identity &&
        plainFallback(editor, drops, waiting);

      if (plain) KEPT_REDO_ATTEMPTS.set(request, { attempt: plain, drops });

      return () => {
        KEPT_REDO_ATTEMPTS.delete(request);
      };
    },
  };
};

export const writeHistory = <V extends Value>(
  editor: Editor<V>,
  batchValue: Batch<V>,
  current: EditorDocumentValue<V>,
  options: Readonly<{
    anchorCeiling?: number;
    carets?: HistoryCarets | null;
    clearRedos?: boolean;
    commit?: HistoryCommitSlice<V>;
    group?: HistoryBatchGroup | null;
    recovery?: AnchorHistoryRecovery | null;
    restores?: EditorDocumentValue<V>;
  }> = {}
) => {
  const store = getStore(editor);
  const identity = {};
  const walkedUndos = options.commit
    ? stepBranchTracks(store.undos, options.commit, false)
    : store.undos;
  const walkedRedos =
    options.commit && !options.clearRedos
      ? stepBranchTracks(store.redos, options.commit, false)
      : store.redos;
  const origin = createOrigin(
    editor,
    current,
    batchValue.change,
    options.commit,
    options.restores
  );

  publish(editor, store, {
    redos: options.clearRedos ? null : walkedRedos,
    undos: pushBranch(
      walkedUndos,
      batchValue,
      current,
      recordHistoryReplay(
        historyReplaySchemaOf(editor),
        current,
        batchValue.change,
        'undo',
        { ...replayedOf(batchValue), after: options.restores }
      ),
      store.maxDepth,
      options.group ?? null,
      options.recovery ?? null,
      options.anchorCeiling ?? 0,
      identity,
      options.carets ?? null,
      origin
    ),
  });

  return identity;
};

export const replaceHistoryHead = <V extends Value>(
  editor: Editor<V>,
  batchValue: Batch<V>,
  current: EditorDocumentValue<V>,
  options: Readonly<{
    anchorCeiling?: number;
    carets?: HistoryCarets | null;
    clearRedos?: boolean;
    commit?: HistoryCommitSlice<V>;
    group?: HistoryBatchGroup | null;
    recovery?: AnchorHistoryRecovery | null;
    restores?: EditorDocumentValue<V>;
  }> = {}
) => {
  const store = getStore(editor);
  const drops: DropSink = [];
  const resolved = resolveTop(editor, drops, store.undos);

  if (!resolved) throw new Error('Missing undos history batch.');

  const walkedNext = options.commit
    ? stepBranchTracks(resolved.next, options.commit, false)
    : resolved.next;
  const walkedRedos =
    options.commit && !options.clearRedos
      ? stepBranchTracks(store.redos, options.commit, false)
      : store.redos;
  const mergedOrigin = mergeOrigin(
    editor,
    resolved.origin,
    current,
    batchValue.change,
    options.restores
  );

  publish(editor, withDrops(store, drops), {
    redos: options.clearRedos ? null : walkedRedos,
    undos: branch(
      batchValue,
      current,
      recordHistoryReplay(
        historyReplaySchemaOf(editor),
        current,
        batchValue.change,
        'undo',
        { ...replayedOf(batchValue), after: options.restores }
      ),
      walkedNext,
      null,
      options.group ?? null,
      options.recovery ?? null,
      options.anchorCeiling ?? resolved.anchorCeiling,
      resolved.identity,
      options.carets ?? null,
      null,
      mergedOrigin
    ),
  });
};

export const resolveDownTo = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null,
  id: string
) => {
  const above: Array<ResolvedHistoryEntry<V>> = [];
  const causes: unknown[] = [];
  let onto: EditorDocumentValue<V> | null = null;

  for (let entry = value; entry;) {
    const attemptDrops: DropSink = [];
    let current: HistoryBranch<V> | null = null;

    try {
      const top = resolveTop(editor, attemptDrops, entry);

      current =
        top && onto
          ? resolveTop(
              editor,
              attemptDrops,
              mappedOnto(editor, top, top.base, onto)
            )
          : top;
    } catch (error) {
      causes.push(error);
      onto =
        above.at(-1)?.replay.record().after ?? getEditorDocumentValue(editor);
      entry = entry.next;
      continue;
    }
    if (!current) break;

    drops.push(...attemptDrops);
    onto = null;
    if (knownHistoryStepId(current.identity) === id) {
      return {
        above,
        causes,
        entry: resolvedEntryOf(current),
        tail: current.next,
      };
    }
    above.push(resolvedEntryOf(current));
    entry = current.next;
  }

  return null;
};

export const replaceUndoStep = <V extends Value>(
  editor: Editor<V>,
  id: string,
  change: DocumentChange,
  matches: (base: EditorDocumentValue<V>) => boolean
) => {
  const store = getStore(editor);

  if (store.pendingReplay) return false;

  const drops: DropSink = [];
  const found = resolveDownTo(editor, drops, store.undos, id);

  if (!found || !matches(found.entry.base)) return false;

  const { above, entry, tail } = found;
  const {
    carried: _carried,
    rest: _rest,
    unsettle: _unsettle,
    ...plain
  } = entry.batch;
  const replay = recordHistoryReplay(
    historyReplaySchemaOf(editor),
    entry.base,
    change,
    'undo'
  );

  const rebuiltOrigin = rebuildOriginOverAbove(
    editor,
    entry.base,
    change,
    replay.record().after,
    above
  );

  publish(editor, withDrops(store, drops), {
    undos: rebuildBranch(
      [
        ...above,
        {
          ...entry,
          batch: { ...plain, change },
          kept: null,
          origin: rebuiltOrigin,
          replay,
        },
      ],
      store.maxDepth,
      mappedOnto(
        editor,
        tail,
        entry.replay.record().after,
        replay.record().after
      )
    ),
  });
  for (const cause of found.causes) recordDroppedCause(editor, cause);

  return true;
};

const DROPPED_HISTORY_CAUSES = new WeakMap<AnyEditor, unknown[]>();

export const recordDroppedCause = (editor: AnyEditor, cause: unknown) => {
  const causes = DROPPED_HISTORY_CAUSES.get(editor) ?? [];

  causes.push(cause);
  DROPPED_HISTORY_CAUSES.set(editor, causes);
  countCoreWork('carriedFallbacks');
};

export const takeDroppedHistoryCauses = (editor: AnyEditor) => {
  const causes = DROPPED_HISTORY_CAUSES.get(editor) ?? [];

  DROPPED_HISTORY_CAUSES.delete(editor);

  return causes;
};

const resolveSurvivingTop = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null
) => {
  for (let entry = value; entry; entry = entry.next) {
    const attemptDrops: DropSink = [];

    try {
      const head = resolveTop(editor, attemptDrops, entry);

      drops.push(...attemptDrops);

      return head;
    } catch (error) {
      recordDroppedCause(editor, error);
    }
  }

  return null;
};

export const mappedOnto = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V> | null,
  from: EditorDocumentValue<V>,
  to: EditorDocumentValue<V>
) => {
  if (!value) return null;

  const change = DocumentChange.between(from, to, {
    isSetValued: historyReplaySchemaOf(editor).isSetValued,
  });

  return change.empty
    ? value
    : addMapping(value, {
        after: to,
        change,
        textOnly: isTextOnlyMapping(change),
      });
};

export const rebaseOnto = <V extends Value>(
  editor: Editor<V>,
  drops: DropSink,
  value: HistoryBranch<V> | null,
  current: EditorDocumentValue<V>
) => {
  const head = resolveSurvivingTop(editor, drops, value);

  return head && mappedOnto(editor, head, head.base, current);
};

export const dropHistoryHead = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack,
  current: EditorDocumentValue<V>
) => {
  const store = getStore(editor);
  const value = store[stack];

  if (!value) return;

  const drops: DropSink = [];
  const result = rebaseOnto(editor, drops, value.next, current);

  publish(editor, withDrops(store, drops), { [stack]: result });
};

export const completeHistoryAction = <V extends Value>(
  editor: Editor<V>,
  source: HistoryStack,
  destination: HistoryStack,
  batchValue: Batch<V>,
  current: EditorDocumentValue<V>,
  olderStepsMapping:
    | Readonly<{
        after: EditorDocumentValue<V>;
        change: DocumentChange;
      }>
    | undefined,
  request: number,
  commit?: HistoryCommitSlice<V>
) => {
  const store = getStore(editor);
  const kept = keptAttempt<V>(source, request);
  const drops: DropSink = [...(kept?.drops ?? [])];
  const resolved = resolveTop(
    editor,
    drops,
    kept ? kept.attempt : store[source]
  );

  KEPT_REDO_ATTEMPTS.delete(request);
  if (!resolved) throw new Error(`Missing ${source} history batch.`);

  const walkedNextSource = commit
    ? stepBranchTracks(resolved.next, commit, false)
    : resolved.next;
  const nextSource = rebaseOnto(editor, drops, walkedNextSource, current);
  const empty = batchValue.change.empty && batchValue.effects.length === 0;
  const thaws = destination === 'redos' && !empty && !!store.redoFreeze;
  const listed = thaws ? null : store[destination];
  const walkedDest = commit ? stepBranchTracks(listed, commit, false) : listed;
  const older = olderStepsMapping
    ? addMapping(walkedDest, { ...olderStepsMapping, textOnly: false })
    : walkedDest;
  const pushedOrigin = createOrigin(editor, current, batchValue.change, commit);

  publish(editor, withDrops(store, drops), {
    ...(thaws ? { redoFreeze: null } : {}),
    [destination]: empty
      ? older
      : pushBranch(
          older,
          batchValue,
          current,
          recordHistoryReplay(
            historyReplaySchemaOf(editor),
            current,
            batchValue.change,
            destination === 'undos' ? 'undo' : 'redo',
            replayedOf(batchValue)
          ),
          store.maxDepth,
          resolved.group,
          resolved.recovery,
          resolved.anchorCeiling,
          resolved.identity,
          resolved.carets,
          pushedOrigin
        ),
    [source]: nextSource,
  });
};

const isTextOnlyMapping = (change: DocumentChange) =>
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  isInternalTextOnlyDocumentChange(change);

const ELEMENT_SCHEMAS = new WeakMap<object, ElementSchema>();

export const historyElementSchemaOf = (editor: AnyEditor) => {
  const read = getEditorSchema(editor);
  const known = ELEMENT_SCHEMAS.get(read);

  if (known) return known;

  const owner = getEditorRuntimeOwner(editor);
  const contentOf = (element: JsonNode) =>
    typeof element.type === 'string'
      ? read.getElementContent(element.type)
      : null;
  const schema: ElementSchema = {
    content: (element) => contentOf(element) ?? 'unknown',
    isInline: (element) =>
      ElementApi.isElement(element) && read.isInline(element),
    ownsContentRoot: (element) =>
      typeof element.type === 'string' &&
      (getCompiledEditorSchema(owner).elements.byType.get(element.type)
        ?.contentRoots.size ?? 0) > 0,
    propertiesReadParents: () =>
      propertyTargetsReadParents(getCompiledEditorSchema(owner)),
    rootContent: (document, root) =>
      read.getRootContent(root, document as EditorDocumentValue) ?? 'unknown',
  };

  ELEMENT_SCHEMAS.set(read, schema);

  return schema;
};

const holdsCarry = (facts: ChangeFacts) =>
  facts.kind === 'recorded' &&
  [...facts.roots.values()].some(({ carries }) => carries.length > 0);

const waitsOnNothing = <V extends Value>({
  batch,
  kept,
  mappings,
  replay,
}: HistoryBranch<V>) =>
  !mappings &&
  !kept &&
  !replay.program &&
  !replay.carried &&
  !replay.parts &&
  !replay.exact &&
  !batch.unsettle;

const crossesEveryStep = <V extends Value>(
  value: HistoryBranch<V> | null,
  schema: ElementSchema
) => {
  for (let entry = value; entry; entry = entry.next) {
    const facts = historyFactsOf(entry.batch);

    if (
      !facts ||
      !waitsOnNothing(entry) ||
      stepRejection(
        entry.base,
        { change: entry.replay.change, facts },
        schema
      ) !== null
    ) {
      return false;
    }
  }

  return true;
};

const admits = <V extends Value>(
  editor: Editor<V>,
  store: HistoryStore<V>,
  skipped: FactedChange,
  before: EditorDocumentValue<V>
) => {
  if (!holdsCarry(skipped.facts) || store.pendingReplay) return false;

  const schema = historyElementSchemaOf(editor);

  return (
    skippedRejection(before, skipped, schema) === null &&
    crossesEveryStep(store.undos, schema) &&
    crossesEveryStep(store.redos, schema)
  );
};

export const queueHistoryMapping = <V extends Value>(
  editor: Editor<V>,
  change: DocumentChange,
  after: EditorDocumentValue<V>,
  skipped: Readonly<{
    before: EditorDocumentValue<V>;
    facts: ChangeFacts;
    otherWriter?: boolean;
  }>
) => {
  if (change.empty) return;

  const store = getStore(editor);
  const crosses = admits(
    editor,
    store,
    { change, facts: skipped.facts },
    skipped.before
  );

  if (crosses) countCoreWork('admittedChanges');

  const mapping = Object.freeze({
    after,
    anchors: true as const,
    change,
    textOnly: isTextOnlyMapping(change),
    ...(crosses ? { crossing: skipped.facts } : {}),
  });
  const commit: HistoryCommitSlice<V> = {
    after,
    before: skipped.before,
    change,
  };
  const otherWriter = skipped.otherWriter ?? true;
  const walkedRedos = stepBranchTracks(store.redos, commit, otherWriter);
  const walkedUndos = stepBranchTracks(store.undos, commit, otherWriter);

  publish(editor, store, {
    redos: addMapping(walkedRedos, mapping),
    undos: addMapping(walkedUndos, mapping),
  });
};

export const clearHistoryState = (editor: Editor) => {
  deleteHistoryStore(editor);
};

export const replaceHistoryState = <V extends Value>(
  editor: Editor<V>,
  value: Pick<History<V>, 'redos' | 'schema' | 'undos'>,
  current: EditorDocumentValue<V> = editor.read.value()
) => {
  const store = getStore(editor);
  const next = Object.freeze({
    ...store,
    redoFreeze: null,
    redos: fromBatches(editor, 'redo', value.redos, current, store.maxDepth),
    revision: store.revision + 1,
    schema: value.schema,
    snapshot: null,
    undos: fromBatches(editor, 'undo', value.undos, current, store.maxDepth),
  });

  setStore(editor, next);

  return getWorkingHistory(editor);
};
