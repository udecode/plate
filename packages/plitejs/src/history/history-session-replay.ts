import {
  DocumentChange,
  type EditorDocumentValue,
  type EditorEffect,
  mapEffect,
  type Value,
} from '..';
import { countCoreWork } from '../core/work';

export type SessionReplaySettlementInput<V extends Value> = Readonly<{
  after?: EditorDocumentValue<V>;
  change?: DocumentChange;
  effects?: readonly EditorEffect[];
  forward?: DocumentChange;
  request: number;
  status: 'applied' | 'blocked';
}>;

export const mapSessionReplayEffects = (
  effects: readonly EditorEffect[],
  changes: readonly DocumentChange[]
): EditorEffect[] =>
  changes.reduce(
    (mapped, change) =>
      mapped.flatMap((effect) => {
        const next = mapEffect(effect, change);

        return next ? [next] : [];
      }),
    [...effects]
  );

export const resolveSessionSettlementBase = <V extends Value>({
  anchorBase,
  claimedBase,
  forward,
  replayEffects,
}: Readonly<{
  anchorBase: EditorDocumentValue<V>;
  claimedBase: EditorDocumentValue<V>;
  forward: DocumentChange;
  replayEffects: readonly EditorEffect[];
}>): Readonly<{
  replayBase: EditorDocumentValue<V>;
  replayEffects: EditorEffect[];
}> => {
  const correction = DocumentChange.between(claimedBase, anchorBase);
  const nextEffects = correction.empty
    ? [...replayEffects]
    : replayEffects.flatMap((effect) => {
        const mapped = mapEffect(effect, correction);

        return mapped ? [mapped] : [];
      });

  return {
    replayBase: forward.empty ? anchorBase : forward.apply(anchorBase),
    replayEffects: nextEffects,
  };
};

type ClaimStep = Readonly<{ identity: object; next: ClaimStep | null }>;

type WaitingClaim = Readonly<{
  direction: 'redo' | 'undo';
  phase: 'attached' | 'detached' | 'dropped';
  undosAtClaim: ClaimStep | 'trimmed' | null;
}>;

const CLAIM_STEPS = new WeakMap<ClaimStep, ReadonlySet<object>>();

const trimsWaitingRedo = (
  pending: WaitingClaim,
  undos: (ClaimStep & Readonly<{ depth: number }>) | null,
  maxDepth: number
) => {
  if (
    pending.direction !== 'redo' ||
    pending.phase !== 'detached' ||
    pending.undosAtClaim === 'trimmed' ||
    (undos?.depth ?? 0) < maxDepth
  ) {
    return false;
  }

  const claimed: ClaimStep | null = pending.undosAtClaim;
  let steps = claimed && CLAIM_STEPS.get(claimed);

  if (claimed && !steps) {
    const identities = new Set<object>();

    for (let step: ClaimStep | null = claimed; step; step = step.next) {
      identities.add(step.identity);
    }
    steps = identities;
    CLAIM_STEPS.set(claimed, identities);
  }
  for (let step: ClaimStep | null = undos; step; step = step.next) {
    if (steps?.has(step.identity)) return false;
    countCoreWork('historyBranchVisits');
  }

  return true;
};

export const trimmedRedoOf = <P extends WaitingClaim>(
  store: Readonly<{ maxDepth: number; pendingReplay: P | null }>,
  patch: Readonly<{
    maxDepth?: number;
    pendingReplay?: P | null;
    undos?: (ClaimStep & Readonly<{ depth: number }>) | null;
  }>
) => {
  const pending =
    patch.pendingReplay === undefined
      ? store.pendingReplay
      : patch.pendingReplay;

  return pending &&
    patch.undos !== undefined &&
    trimsWaitingRedo(pending, patch.undos, patch.maxDepth ?? store.maxDepth)
    ? {
        pendingReplay: Object.freeze({
          ...pending,
          undosAtClaim: 'trimmed' as const,
        }),
      }
    : {};
};

export const claimTimeIndex = (
  undos: ReadonlyArray<Readonly<{ identity: object }>>,
  undosAtClaim: ClaimStep | 'trimmed' | null
) => {
  if (undosAtClaim === 'trimmed') return -1;

  const indexes = new Map(undos.map((entry, index) => [entry.identity, index]));

  for (let step = undosAtClaim; step; step = step.next) {
    const index = indexes.get(step.identity);

    if (index !== undefined) return index;
    countCoreWork('historyBranchVisits');
  }

  return undos.length;
};

export const placeSettledSessionEntry = <
  E extends Readonly<{
    batch: Readonly<{
      change: DocumentChange;
      effects: readonly EditorEffect[];
    }>;
  }>,
>({
  direction,
  edited,
  effects,
  insertionIndex,
  maxDepth,
  nextRedos,
  nextUndos,
  replayed,
}: Readonly<{
  direction: 'redo' | 'undo';
  edited: boolean;
  effects: readonly EditorEffect[];
  insertionIndex: number | null;
  maxDepth: number;
  nextRedos: E[];
  nextUndos: E[];
  replayed: E;
}>): void => {
  if (
    effects.length > 0 &&
    replayed.batch.change.empty &&
    replayed.batch.effects.length === 0
  ) {
    return;
  }
  if (direction === 'undo') {
    if (!edited) nextRedos.unshift(replayed);
  } else if (!edited) {
    nextUndos.unshift(replayed);
  } else if (
    insertionIndex !== null &&
    insertionIndex >= 0 &&
    insertionIndex < maxDepth
  ) {
    nextUndos.splice(insertionIndex, 0, replayed);
  }
};

export const settleSessionBranches = <V extends Value, B>({
  addMapping,
  after,
  direction,
  edited,
  forward,
  rebaseOnto,
  redos,
  undos,
}: Readonly<{
  addMapping: (
    branch: B | null,
    mapping: Readonly<{
      after: EditorDocumentValue<V>;
      change: DocumentChange;
      textOnly: boolean;
    }>
  ) => B | null;
  after: EditorDocumentValue<V> | undefined;
  direction: 'redo' | 'undo';
  edited: boolean;
  forward: DocumentChange;
  rebaseOnto: (branch: B | null, current: EditorDocumentValue<V>) => B | null;
  redos: B | null;
  undos: B | null;
}>): Readonly<{ redos: B | null; undos: B | null }> => {
  if (forward.empty || !after) {
    return { redos, undos };
  }

  const mapping = { after, change: forward, textOnly: false };

  if (direction === 'undo') {
    return {
      redos,
      undos: edited ? addMapping(undos, mapping) : rebaseOnto(undos, after),
    };
  }

  return {
    redos: rebaseOnto(redos, after),
    undos: edited ? addMapping(undos, mapping) : undos,
  };
};
