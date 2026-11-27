import type {
  Editor,
  EditorEffectHistoryReplayResult,
  HistorySettlement,
  Value,
} from '..';
import { getEditorRuntimeOwner } from '../core/editor-runtime';
import { enterEditorRead } from '../core/public-state';
import { countCoreWork } from '../core/work';
import type { AnyEditor } from '../interfaces/editor';
import type { Batch, History } from './history';
import { branchHasActiveTrack } from './history-origin';
import {
  addMapping,
  captureHistoryState,
  getHistory,
  type HistoryBranch,
  type HistoryStore,
  journalEntries,
  publish,
  resolveAll,
  resolveTop,
  setStore,
  withPublishedHistoryState,
} from './history-state';
import { type DropSink, withDrops } from './history-store';

/**
 * Where a session step's first write stands: `recording` until History
 * publishes the step, `running` until the write answers, then `confirmed` or
 * `withdrawn`.
 */
type FirstWriteState = 'confirmed' | 'recording' | 'running' | 'withdrawn';

export type FirstWriteOutcome =
  | Readonly<{ kind: 'applied' }>
  | Readonly<{ kind: 'blocked'; reason: string }>
  | Readonly<{ cause: unknown; kind: 'failed' }>;

export type FirstWrite = {
  readonly parsed: Promise<EditorEffectHistoryReplayResult>;
  identity: object | null;
  state: FirstWriteState;
  /** The waiting undo of the step, which a withdrawal settles `blocked`. */
  settleUndo: ((settlement: HistorySettlement) => void) | null;
};

type BlockedSettlement = Extract<HistorySettlement, { status: 'blocked' }>;

const FIRST_WRITES = new WeakMap<object, FirstWrite>();

/** Redo arrays a read handed out while redo was frozen, which encode as no redo. */
const FROZEN_REDOS = new WeakSet<readonly Batch[]>();
const RESOLVED_REDOS = new WeakSet<HistoryBranch<Value>>();
const ANCHORED_SPLICES = new WeakMap<
  HistoryBranch<Value>,
  Readonly<{ drops: DropSink; identity: object; splice: Splice | null }>
>();

/** Run app mappers as a read runs them, so a mapper cannot write. */
const inRead = <T>(editor: AnyEditor, fn: () => T): T => {
  const exitRead = enterEditorRead(getEditorRuntimeOwner(editor));

  try {
    return fn();
  } finally {
    exitRead();
  }
};

const MALFORMED_FIRST_WRITE =
  'A session step first write must resolve to an applied or blocked replay result.';

/** Read an app's answer once; a getter that throws makes it malformed. */
const parseFirstWrite = (result: unknown): EditorEffectHistoryReplayResult => {
  let parsed: EditorEffectHistoryReplayResult | null = null;

  try {
    if (typeof result === 'object' && result !== null && 'status' in result) {
      const { status } = result;

      if (status === 'applied' && 'value' in result) {
        parsed = Object.freeze({ status, value: result.value });
      } else if (status === 'blocked' && 'reason' in result) {
        const { reason } = result;

        if (typeof reason === 'string') {
          parsed = Object.freeze({ reason, status });
        }
      }
    }
  } catch (error) {
    throw new Error(MALFORMED_FIRST_WRITE, { cause: error });
  }
  if (!parsed) throw new Error(MALFORMED_FIRST_WRITE);

  return parsed;
};

/**
 * Observe a first write before anything can throw, so its rejection is never
 * unhandled, and hand each answer to `answer` once, in the answer's own
 * reaction, so an owner that answers later cannot settle first. The owner's
 * replay gets History's own promise, which a malformed answer rejects, so an
 * owner that skips on a rejection adds no second report.
 */
export const observeFirstWrite = (
  promise: Promise<EditorEffectHistoryReplayResult>,
  answer: (write: FirstWrite, outcome: FirstWriteOutcome) => void
): FirstWrite => {
  const fail = (cause: unknown): never => {
    answer(write, { cause, kind: 'failed' });
    throw cause;
  };
  const parsed = promise.then((result) => {
    let value: EditorEffectHistoryReplayResult;

    try {
      value = parseFirstWrite(result);
    } catch (error) {
      return fail(error);
    }
    answer(
      write,
      value.status === 'blocked'
        ? { kind: 'blocked', reason: value.reason }
        : { kind: 'applied' }
    );

    return value;
  }, fail);
  const write: FirstWrite = {
    identity: null,
    parsed,
    settleUndo: null,
    state: 'recording',
  };

  parsed.catch(() => {});

  return write;
};

export const startFirstWrite = (write: FirstWrite, identity: object) => {
  if (write.state !== 'recording') return;
  write.identity = identity;
  write.state = 'running';
  FIRST_WRITES.set(identity, write);
};

export const firstWriteOf = (identity: object) => FIRST_WRITES.get(identity);

export const endFirstWrite = (
  write: FirstWrite,
  end: 'confirmed' | 'withdrawn',
  undo: BlockedSettlement | null = null
) => {
  if (write.state !== 'running') return;
  write.state = end;
  if (end === 'withdrawn' && write.identity) {
    FIRST_WRITES.delete(write.identity);
  }
  const waiting = write.settleUndo;

  write.settleUndo = null;
  if (undo) waiting?.(undo);
};

export const releaseFirstWrite = (identity: object) => {
  const write = FIRST_WRITES.get(identity);

  if (!write) return;
  endFirstWrite(write, 'confirmed');
  FIRST_WRITES.delete(identity);
};

export const isRedoFrozen = (editor: AnyEditor) =>
  !!captureHistoryState(editor)?.redoFreeze;

/**
 * Drop a redo list the step froze, with its freeze, as the step's record
 * dropped it at the base.
 */
export const dropFrozenRedos = (editor: AnyEditor, identity: object) => {
  const store = captureHistoryState(editor);

  if (store?.redoFreeze?.steps.includes(identity)) {
    publish(editor, store, { redos: null });
  }
};

const mapFrozenRedos = (
  editor: AnyEditor,
  drops: DropSink,
  store: HistoryStore<Value>
) => {
  const frozenDrops: DropSink = [];

  try {
    const { branch } = resolveAll(editor, frozenDrops, store.redos);

    drops.push(...frozenDrops);

    return { branch };
  } catch {
    return null;
  }
};

/**
 * Resolve a frozen redo list whole, as a read does, and answer whether an
 * entry survives, so `redo()` answers the same with or without a read first.
 * A list whose entry cannot map drops with its freeze.
 */
export const resolveFrozenRedo = (editor: AnyEditor) =>
  withPublishedHistoryState(editor, () => {
    const store = captureHistoryState(editor);

    if (!store?.redoFreeze) return false;
    if (store.snapshot) return store.snapshot.redos.length > 0;
    if (store.redos && RESOLVED_REDOS.has(store.redos)) return true;

    const drops: DropSink = [];
    const resolved = inRead(editor, () => mapFrozenRedos(editor, drops, store));

    if (!resolved) {
      publish(editor, store, { redos: null });
      return false;
    }
    if (resolved.branch) RESOLVED_REDOS.add(resolved.branch);
    setStore(
      editor,
      withDrops(
        Object.freeze({ ...store, redos: resolved.branch, snapshot: null }),
        drops
      )
    );

    return resolved.branch !== null;
  });

export const joinRedoFreeze = (editor: AnyEditor, identity: object) => {
  const store = captureHistoryState(editor);

  if (!store?.redos) return;
  setStore(
    editor,
    Object.freeze({
      ...store,
      redoFreeze: Object.freeze({
        steps: Object.freeze([...(store.redoFreeze?.steps ?? []), identity]),
      }),
      snapshot: null,
    })
  );
};

export const readHistory = <V extends Value>(editor: Editor<V>): History<V> =>
  withPublishedHistoryState(editor, () => {
    // A frozen list resolves on its own first, so only its own entries can
    // drop it; an undo entry that cannot map throws as at the base.
    if (isRedoFrozen(editor)) resolveFrozenRedo(editor);

    const history = getHistory(editor);

    if (isRedoFrozen(editor) && history.redos.length > 0) {
      FROZEN_REDOS.add(history.redos);
    }

    return history;
  });

export const withoutFrozenRedos = <H extends Pick<History, 'redos'>>(
  history: H
): H => (FROZEN_REDOS.has(history.redos) ? { ...history, redos: [] } : history);

type Splice = Readonly<{
  below: HistoryBranch<Value> | null;
  undos: HistoryBranch<Value> | null;
}>;

const SPLICES = new WeakMap<
  HistoryBranch<Value>,
  Readonly<{ identity: object; splice: Splice | null }>
>();

const relink = (
  step: HistoryBranch<Value>,
  next: HistoryBranch<Value> | null
): HistoryBranch<Value> => {
  countCoreWork('historyBranchRebuilds');

  return Object.freeze({
    ...step,
    carries: step.replay.carried !== undefined || (next?.carries ?? false),
    depth: (next?.depth ?? 0) + 1,
    hasActiveTrack: branchHasActiveTrack(step.origin, next, step.kept),
    next,
  });
};

type Resolve = (
  step: HistoryBranch<Value> | null
) => HistoryBranch<Value> | null;

/**
 * Take one step out of the undo list. The steps above keep their entries and
 * the step's mapping journal moves to the step below, which a session step's
 * empty change lets pass unchanged. With `resolve`, each step resolves before
 * the walk passes it, so a step a mapping removed is not found, and so does
 * the step below. A raw walk is shared by a settlement's check and its commit.
 */
const spliceStep = (
  undos: HistoryBranch<Value> | null,
  identity: object,
  resolve: Resolve | null = null
): Splice | null => {
  if (!undos) return null;

  const cached = resolve ? undefined : SPLICES.get(undos);

  if (cached?.identity === identity) return cached.splice;

  const advance = resolve ?? ((next) => next);
  const above: Array<HistoryBranch<Value>> = [];
  let step = advance(undos);

  for (; step; step = advance(step.next)) {
    countCoreWork('historyBranchVisits');
    if (step.identity === identity) break;
    above.push(step);
  }

  let splice: Splice | null = null;

  if (step) {
    let below = resolve ? resolve(step.next) : step.next;

    if (step.mappings) {
      for (const entry of journalEntries(step.mappings)) {
        below = addMapping(below, entry);
      }
    }

    let next = below;

    for (let index = above.length - 1; index >= 0; index -= 1) {
      next = relink(above[index], next);
    }
    splice = Object.freeze({ below, undos: next });
  }
  if (!resolve) SPLICES.set(undos, Object.freeze({ identity, splice }));

  return splice;
};

/**
 * Splice the step a waiting redo lands above. The list resolves down to the
 * step and the step below it, as a read resolves them, so the redo's anchor
 * lands on a step that survives whether or not a read ran first. A settlement's
 * check and its commit share one walk.
 */
const spliceAnchor = (
  editor: AnyEditor,
  drops: DropSink,
  undos: HistoryBranch<Value> | null,
  identity: object
) => {
  if (!undos) return null;

  const cached = ANCHORED_SPLICES.get(undos);

  if (cached?.identity === identity) {
    drops.push(...cached.drops);

    return cached.splice;
  }

  const resolvedDrops: DropSink = [];
  let splice: Splice | null;

  try {
    splice = spliceStep(undos, identity, (step) =>
      resolveTop(editor, resolvedDrops, step)
    );
  } catch {
    return spliceStep(undos, identity);
  }

  const kept = splice ? resolvedDrops : [];

  ANCHORED_SPLICES.set(undos, Object.freeze({ drops: kept, identity, splice }));
  drops.push(...kept);

  return splice;
};

type Settlement = Readonly<{
  endsUndo: boolean;
  patch: Partial<HistoryStore<Value>>;
  thaws: boolean;
  splice: Splice | null;
}>;

const settlementOf = (
  editor: AnyEditor,
  drops: DropSink,
  store: HistoryStore<Value>,
  identity: object,
  end: 'confirmed' | 'withdrawn'
): Settlement | null => {
  const frozen = store.redoFreeze?.steps.includes(identity) ?? false;

  if (end === 'confirmed') {
    return frozen
      ? {
          endsUndo: false,
          patch: { redoFreeze: null, redos: null },
          thaws: false,
          splice: null,
        }
      : null;
  }

  const pending = store.pendingReplay;
  const splice =
    pending?.undoAnchor === identity
      ? spliceAnchor(editor, drops, store.undos, identity)
      : spliceStep(store.undos, identity);
  // A claim that a replace, a restore or a schema change dropped stays with
  // its owner, whose answer settles the caller once.
  const endsUndo =
    pending?.direction === 'undo' &&
    pending.phase !== 'dropped' &&
    pending.identity === identity;
  // An anchor moves only with its splice; one already resolved away stays,
  // as at the base.
  const anchored = !!splice && pending?.undoAnchor === identity;

  if (!frozen && !splice && !endsUndo && !anchored) return null;

  const steps =
    store.redoFreeze?.steps.filter((step) => step !== identity) ?? [];

  return {
    endsUndo,
    patch: {
      ...(splice ? { undos: splice.undos } : {}),
      ...(frozen
        ? {
            redoFreeze:
              steps.length > 0
                ? Object.freeze({ steps: Object.freeze(steps) })
                : null,
          }
        : {}),
      pendingReplay:
        pending && endsUndo
          ? null
          : pending && anchored
            ? Object.freeze({
                ...pending,
                undoAnchor: splice?.below?.identity ?? null,
              })
            : pending,
    },
    thaws: frozen && steps.length === 0,
    splice,
  };
};

/**
 * Whether a first write's end changes a list, the freeze or a waiting undo,
 * so its settlement needs a commit.
 */
export const firstWriteChanges = (
  editor: AnyEditor,
  identity: object,
  end: 'confirmed' | 'withdrawn'
) =>
  withPublishedHistoryState(editor, () => {
    const store = captureHistoryState(editor);

    return (
      !!store &&
      inRead(editor, () => settlementOf(editor, [], store, identity, end)) !==
        null
    );
  });

/**
 * Settle a first write's end in the commit's store draft. A confirmation
 * clears a redo list the step froze; a withdrawal splices the step out of
 * undo and leaves the freeze, and the last frozen step resolves the redo it
 * releases, dropping a list whose entry cannot map. It moves `revision` only
 * when a list changes, and answers whether it ended the step's waiting undo.
 */
export const settleFirstWrite = (
  editor: AnyEditor,
  identity: object,
  end: 'confirmed' | 'withdrawn'
) => {
  const store = captureHistoryState(editor);
  const drops: DropSink = [];
  const settlement = store && settlementOf(editor, drops, store, identity, end);

  if (!store || !settlement) return false;

  const redos = settlement.thaws
    ? (mapFrozenRedos(editor, drops, store)?.branch ?? null)
    : settlement.patch.redos === undefined
      ? store.redos
      : settlement.patch.redos;

  const next = withDrops(
    Object.freeze({ ...store, ...settlement.patch, redos }),
    drops
  );

  if (settlement.splice || (store.redos && !redos)) {
    publish(editor, next, {});
  } else {
    setStore(editor, Object.freeze({ ...next, snapshot: null }));
  }

  return settlement.endsUndo;
};
