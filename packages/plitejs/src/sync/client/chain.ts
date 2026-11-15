import {
  DocumentChange,
  rebaseDocumentChange,
} from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { SYNC_REBASE, sameDocument } from '../protocol';
import { MOVED } from './decision';
import { type KeptReason, provenanceOf, type SavedBatch } from './outbox';

export type ShownBatch = Extract<SavedBatch, { state: 'saved' | 'sent' }>;

export const isShown = (batch: SavedBatch): batch is ShownBatch =>
  batch.state === 'saved' || batch.state === 'sent';

export const shownValue = (
  confirmed: JsonEditorValue,
  batches: readonly SavedBatch[]
) =>
  batches
    .filter(isShown)
    .reduce(
      (value, batch) => DocumentChange.fromJSON(batch.change).apply(value),
      confirmed
    );

/** What a shown batch becomes when it leaves the chain. */
export const leaving = (
  batch: ShownBatch,
  reason: KeptReason | null
): SavedBatch => {
  if (batch.state === 'sent') {
    return reason
      ? { ...batch, reason, state: 'kept' }
      : { ...provenanceOf(batch), frame: batch.frame, state: 'withheld' };
  }

  return {
    ...provenanceOf(batch),
    change: batch.change,
    reason: reason ?? { kind: 'conflict' },
    state: 'kept',
  };
};

const stepOf = (batch: SavedBatch) => batch.decision?.step ?? null;

export const batchToTakeBack = (
  batches: readonly SavedBatch[],
  step: string
) => {
  const latest = batches.findLast((batch) => stepOf(batch) === step);

  return latest?.decision?.step && !latest.decision.superseded ? latest : null;
};

export const superseded = (
  tail: readonly SavedBatch[],
  settled: SavedBatch
): SavedBatch[] => {
  const step = stepOf(settled);

  return tail.flatMap((batch) =>
    step !== null &&
    batch.state === 'kept' &&
    batch.seq < settled.seq &&
    batch.decision?.step === step
      ? [{ ...batch, decision: { ...batch.decision, superseded: true } }]
      : []
  );
};

export type KeepAs = (batch: SavedBatch) => KeptReason | null;

/**
 * A shown batch after `carried` moved the document it applies at: the batch
 * rebuilt there, a reason to keep it, or null to rebase it.
 */
export type CrossAs = (
  batch: ShownBatch,
  before: JsonEditorValue,
  carried: DocumentChange
) => KeptReason | ShownBatch | null;

export const withdrawn = (
  batches: readonly SavedBatch[],
  keepAs: KeepAs = () => null
) =>
  batches.map((batch) =>
    isShown(batch) ? leaving(batch, keepAs(batch)) : batch
  );

export const crossChain = (
  change: DocumentChange,
  at: JsonEditorValue,
  batches: readonly SavedBatch[],
  crossAs: CrossAs = () => null
) => {
  let carried = change;
  let before = at;
  const next: SavedBatch[] = [];
  const out = new Set(
    batches.flatMap((batch) => (isShown(batch) ? [] : [batch.seq]))
  );

  for (const batch of batches) {
    if (!isShown(batch)) {
      next.push(batch);
      continue;
    }

    const own = DocumentChange.fromJSON(batch.change);
    const after = own.apply(before);
    const crossed =
      batch.state === 'saved' &&
      batch.takesBackSeq !== undefined &&
      out.has(batch.takesBackSeq)
        ? MOVED
        : crossAs(batch, before, carried);

    if (crossed && 'state' in crossed) {
      const rebuilt = DocumentChange.fromJSON(crossed.change);
      const moved = carried.apply(before);

      next.push(crossed);
      carried = sameDocument(rebuilt.apply(moved), after)
        ? DocumentChange.between(after, after)
        : own.invert(before).compose(carried, after).compose(rebuilt, after);
      before = after;
      continue;
    }

    const rebase = crossed
      ? null
      : rebaseDocumentChange(carried, own, before, SYNC_REBASE);

    if (rebase?.kind === 'pair') {
      next.push({ ...batch, change: rebase.b.toJSON() });
      carried = rebase.a;
    } else {
      next.push(leaving(batch, crossed));
      out.add(batch.seq);
      carried = own.invert(before).compose(carried, after);
    }
    before = after;
  }

  return { batches: next, carried };
};
