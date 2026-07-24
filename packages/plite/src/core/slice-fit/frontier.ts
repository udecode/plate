import type { ContentSlice, Element } from '../../interfaces';
import { prepareContentSliceVariant } from '../content-slice';
import type { CanonicalFitPreparation } from '../representation';
import type { PreparedTokenSlice } from '../change/tokens';
import { profileCoreDuration } from '../profiling';

export type SliceBoundaryCandidate = Readonly<{
  cost: number;
  from: number;
  to: number;
}>;

export type SliceVariant = Readonly<{
  cost: number;
  slice: ContentSlice;
}>;

export type SliceVariantFamily = Readonly<{
  baseOpenEnd: number;
  baseOpenStart: number;
  contentCost: number;
  index: number;
  maxOpenEnd: number;
  maxOpenStart: number;
  priority: number;
  source: ContentSlice;
}>;

type SliceFitCandidateBase = Readonly<{
  cost: number;
  from: number;
  preparation?: CanonicalFitPreparation;
  selectionAssociation?: -1 | 1;
  to: number;
}>;

type PreparedOpenBlockFitCandidate = Readonly<{
  fullInsert: PreparedTokenSlice;
  prefix: string;
  semanticInsert: PreparedTokenSlice;
  sourceBlocks: readonly Element[];
  suffix: string;
  targetPath: readonly number[];
}>;

export type MaterializedSliceFitCandidate = SliceFitCandidateBase &
  Readonly<{
    insert: PreparedTokenSlice;
    runtimeCandidatePaths?: readonly (readonly number[])[];
    semanticChange?: Readonly<{
      from: number;
      insert: PreparedTokenSlice;
      to: number;
    }>;
    selectionOffset: number;
    trustedCanonical?: true;
  }>;

export type SliceFitCandidate = SliceFitCandidateBase &
  (
    | Readonly<{
        insert: PreparedTokenSlice;
        selectionOffset: number;
      }>
    | Readonly<{
        preparedOpenBlock: PreparedOpenBlockFitCandidate;
      }>
  );

type SliceFitFrontierState = Readonly<{
  boundary: SliceBoundaryCandidate | null;
  boundaryIndex: number;
  cost: number;
  family: SliceVariantFamily;
  kind: 'local' | 'structural';
  openEnd: number;
  openStart: number;
  serial: number;
}>;

export type SliceFitSeed = Readonly<{
  boundary: SliceBoundaryCandidate | null;
  boundaryIndex: number;
  family: SliceVariantFamily;
  kind: SliceFitFrontierState['kind'];
  openEnd: number;
  openStart: number;
}>;

type PreparedSliceFitCandidate = Readonly<{
  state: SliceFitFrontierState;
  variant: SliceVariant;
}>;

const getSliceVariantCost = (
  family: SliceVariantFamily,
  openStart: number,
  openEnd: number
) =>
  family.contentCost +
  Math.abs(openStart - family.baseOpenStart) * 2 +
  Math.abs(openEnd - family.baseOpenEnd) * 2;

/** One deterministic candidate-order owner shared by document and detached fits. */
const createSliceFitFrontier = (
  inputSlice: ContentSlice,
  preferOpenVariants: boolean,
  exactFrom?: number
) => {
  const compare = (
    left: SliceFitFrontierState,
    right: SliceFitFrontierState
  ) => {
    if (left.kind !== right.kind) return left.kind === 'local' ? -1 : 1;
    if (left.family.priority !== right.family.priority) {
      return left.family.priority - right.family.priority;
    }
    if (left.cost !== right.cost) return left.cost - right.cost;
    if (left.boundaryIndex !== right.boundaryIndex) {
      return left.boundaryIndex - right.boundaryIndex;
    }
    if (left.family.index !== right.family.index) {
      return left.family.index - right.family.index;
    }

    const leftOpen = left.openStart + left.openEnd;
    const rightOpen = right.openStart + right.openEnd;

    if (left.kind === 'local' && preferOpenVariants && leftOpen !== rightOpen) {
      return rightOpen - leftOpen;
    }

    const leftDistance =
      Math.abs(left.openStart - inputSlice.openStart) +
      Math.abs(left.openEnd - inputSlice.openEnd);
    const rightDistance =
      Math.abs(right.openStart - inputSlice.openStart) +
      Math.abs(right.openEnd - inputSlice.openEnd);

    return (
      leftDistance - rightDistance ||
      left.openStart - right.openStart ||
      left.openEnd - right.openEnd ||
      left.serial - right.serial
    );
  };
  const states: SliceFitFrontierState[] = [];
  const visited = new Set<string>();
  let serial = 0;

  const enqueue = (
    kind: SliceFitFrontierState['kind'],
    family: SliceVariantFamily,
    boundary: SliceBoundaryCandidate | null,
    boundaryIndex: number,
    openStart: number,
    openEnd: number
  ) => {
    if (
      openStart < 0 ||
      openEnd < 0 ||
      openStart > family.maxOpenStart ||
      openEnd > family.maxOpenEnd
    ) {
      return;
    }

    const key = `${kind}:${boundaryIndex}:${family.index}:${openStart}:${openEnd}`;

    if (visited.has(key)) return;
    visited.add(key);

    const variantCost = getSliceVariantCost(family, openStart, openEnd);
    const cost =
      kind === 'local'
        ? variantCost - (preferOpenVariants ? (openStart + openEnd) * 4 : 0)
        : variantCost +
          (boundary?.cost ?? 0) -
          (inputSlice.content.length === 0 &&
          boundary &&
          exactFrom !== undefined &&
          boundary.from < exactFrom
            ? 4
            : 0);
    const state = Object.freeze({
      boundary,
      boundaryIndex,
      cost,
      family,
      kind,
      openEnd,
      openStart,
      serial: serial++,
    });
    let index = states.length;

    states.push(state);
    while (index > 0) {
      const parent = (index - 1) >> 1;

      if (compare(states[parent]!, state) <= 0) break;
      states[index] = states[parent]!;
      index = parent;
    }
    states[index] = state;
  };
  const pop = () => {
    const first = states[0];
    const last = states.pop();

    if (!first || !last || states.length === 0) return first ?? null;

    let index = 0;

    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;

      if (left >= states.length) break;

      const next =
        right < states.length && compare(states[right]!, states[left]!) < 0
          ? right
          : left;

      if (compare(states[next]!, last) >= 0) break;

      states[index] = states[next]!;
      index = next;
    }

    states[index] = last;

    return first;
  };

  return Object.freeze({ enqueue, pop });
};

export const selectSliceFitCandidate = (
  input: Readonly<{
    candidates: (
      prepared: PreparedSliceFitCandidate
    ) => readonly SliceFitCandidate[];
    exactFrom?: number;
    inputSlice: ContentSlice;
    preferOpenVariants: boolean;
    seeds: readonly SliceFitSeed[];
  }>
): SliceFitCandidate | null => {
  const frontier = createSliceFitFrontier(
    input.inputSlice,
    input.preferOpenVariants,
    input.exactFrom
  );

  for (const seed of input.seeds) {
    frontier.enqueue(
      seed.kind,
      seed.family,
      seed.boundary,
      seed.boundaryIndex,
      seed.openStart,
      seed.openEnd
    );
  }

  while (true) {
    const state = frontier.pop();

    if (!state) return null;
    const directions =
      state.kind === 'local' && input.preferOpenVariants
        ? ([
            [-1, 0],
            [0, -1],
          ] as const)
        : ([
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ] as const);

    for (const [startDelta, endDelta] of directions) {
      frontier.enqueue(
        state.kind,
        state.family,
        state.boundary,
        state.boundaryIndex,
        state.openStart + startDelta,
        state.openEnd + endDelta
      );
    }

    const prepared = Object.freeze({
      state,
      variant: profileCoreDuration(
        'slice-fit-variant-materialize',
        (): SliceVariant => ({
          cost: getSliceVariantCost(
            state.family,
            state.openStart,
            state.openEnd
          ),
          slice: prepareContentSliceVariant(
            state.family.source,
            state.openStart,
            state.openEnd
          ),
        })
      ),
    });

    const candidates = input.candidates(prepared);

    if (candidates.length > 0) return candidates[0]!;
  }
};
