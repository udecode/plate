import {
  DocumentChange,
  type EditorDocumentValue,
  type EditorEffect,
  mapEffect,
  type Value,
} from '..';

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

export const placeSettledSessionEntry = <E>({
  direction,
  edited,
  insertionIndex,
  maxDepth,
  nextRedos,
  nextUndos,
  replayed,
}: Readonly<{
  direction: 'redo' | 'undo';
  edited: boolean;
  insertionIndex: number | null;
  maxDepth: number;
  nextRedos: E[];
  nextUndos: E[];
  replayed: E;
}>): void => {
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
