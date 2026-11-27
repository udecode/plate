import { SelectionApi } from '..';
import type { CarryProgram } from '../core/change/carry-program';
import type { ChangeFacts } from '../core/change/record';
import { MAIN_ROOT_KEY } from '../core/public-root';
import type { Batch } from './history';

export const cloneFrozen = <T>(value: T): T => {
  const clone = structuredClone(value);
  const pending: object[] = clone && typeof clone === 'object' ? [clone] : [];
  const seen = new WeakSet<object>();

  while (pending.length > 0) {
    const item = pending.pop();

    if (!item || seen.has(item)) continue;
    seen.add(item);
    for (const nested of Object.values(item)) {
      if (nested && typeof nested === 'object') pending.push(nested);
    }
    Object.freeze(item);
  }

  return clone;
};

const omitPrimaryPointRoot = <T extends { readonly root?: string }>(
  point: T
) => {
  if (point.root !== MAIN_ROOT_KEY) return point;

  const { root: _root, ...rest } = point;

  return rest;
};

export const omitPrimarySelectionRoot = <T extends Batch['selectionAfter']>(
  selection: T
): T =>
  !selection || SelectionApi.isNode(selection)
    ? selection
    : {
        ...selection,
        anchor: omitPrimaryPointRoot(selection.anchor),
        focus: omitPrimaryPointRoot(selection.focus),
      };

export const additionalRoot = (root: string | undefined) =>
  root && root !== MAIN_ROOT_KEY ? root : undefined;

const STEP_IDS = new WeakMap<object, string>();
const HISTORY_STEPS = new WeakMap<Batch, object>();

const mintStepId = () =>
  btoa(String.fromCodePoint(...crypto.getRandomValues(new Uint8Array(16))))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

export const knownHistoryStepId = (step: object) => STEP_IDS.get(step);

export const historyStepId = (step: object) => {
  const known = STEP_IDS.get(step);

  if (known) return known;

  const id = mintStepId();

  STEP_IDS.set(step, id);

  return id;
};

export const withHistoryStep = <B extends Batch>(batch: B, step: object): B => {
  HISTORY_STEPS.set(batch, step);

  return batch;
};

export const historyStepOf = (batch: Batch) => HISTORY_STEPS.get(batch);

export const withHistoryStepId = <B extends Batch>(
  batch: B,
  id: string | undefined
): B => {
  if (id === undefined) return batch;

  const step = {};

  STEP_IDS.set(step, id);

  return withHistoryStep(batch, step);
};

export const historyBatchStepId = (batch: Batch) => {
  let step = HISTORY_STEPS.get(batch);

  if (!step) {
    step = {};
    withHistoryStep(batch, step);
  }

  return historyStepId(step);
};

const HISTORY_FACTS = new WeakMap<Batch, ChangeFacts>();

export const withHistoryFacts = <B extends Batch>(
  batch: B,
  facts: ChangeFacts | undefined
): B => {
  if (facts) HISTORY_FACTS.set(batch, facts);

  return batch;
};

export const historyFactsOf = (batch: Batch) => HISTORY_FACTS.get(batch);

const HISTORY_PROGRAMS = new WeakMap<Batch, CarryProgram>();

export const withHistoryProgram = <B extends Batch>(
  batch: B,
  program: CarryProgram | undefined
): B => {
  if (program) HISTORY_PROGRAMS.set(batch, program);

  return batch;
};

export const historyProgramOf = (batch: Batch) => HISTORY_PROGRAMS.get(batch);
