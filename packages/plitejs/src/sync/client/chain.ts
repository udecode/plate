import {
  DocumentChange,
  rebaseDocumentChange,
} from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { SYNC_REBASE } from '../protocol';
import type { KeptReason, SavedBatch } from './outbox';

type ShownBatch = Extract<SavedBatch, { state: 'saved' | 'sent' }>;

const isShown = (batch: SavedBatch): batch is ShownBatch =>
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
const leaving = (batch: ShownBatch, reason: KeptReason | null): SavedBatch => {
  const { decision, seq } = batch;

  if (batch.state === 'sent') {
    return reason
      ? { ...batch, reason, state: 'kept' }
      : { decision, frame: batch.frame, seq, state: 'withheld' };
  }

  return { ...batch, reason: reason ?? { kind: 'conflict' }, state: 'kept' };
};

export type KeepAs = (batch: SavedBatch) => KeptReason | null;

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
  keepAs: KeepAs = () => null
) => {
  let carried = change;
  let before = at;
  const next: SavedBatch[] = [];

  for (const batch of batches) {
    if (!isShown(batch)) {
      next.push(batch);
      continue;
    }

    const own = DocumentChange.fromJSON(batch.change);
    const after = own.apply(before);
    const reason = keepAs(batch);
    const rebase = reason
      ? null
      : rebaseDocumentChange(carried, own, before, SYNC_REBASE);

    if (rebase?.kind === 'pair') {
      next.push({ ...batch, change: rebase.b.toJSON() });
      carried = rebase.a;
    } else {
      next.push(leaving(batch, reason));
      carried = own.invert(before).compose(carried, after);
    }
    before = after;
  }

  return { batches: next, carried };
};
