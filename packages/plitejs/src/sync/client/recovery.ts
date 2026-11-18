import { DocumentChange } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { rebaseOver, sameDocument } from '../protocol';
import { isShown, shownValue } from './chain';
import type { OutboxRecord, SavedBatch } from './outbox';

export type SyncKeptAction = 'apply' | 'discard';

export type SyncKeptRefusal =
  | 'blocked'
  | 'conflict'
  | 'decision'
  | 'failed'
  | 'gap'
  | 'missing'
  | 'rewritten'
  | 'stale'
  | 'stopped'
  | 'suggesting'
  | 'unchanged'
  | 'view';

export type SyncKeptResult =
  | Readonly<{ status: 'applied'; seq: number; threw?: true }>
  | Readonly<{ status: 'discarded' }>
  | Readonly<{ reason: SyncKeptRefusal; status: 'refused'; threw?: true }>;

export const refused = (
  reason: SyncKeptRefusal,
  threw = false
): SyncKeptResult => ({
  reason,
  status: 'refused',
  ...(threw ? { threw } : {}),
});

export const rebasedKept = (
  record: OutboxRecord,
  kept: Extract<SavedBatch, { state: 'kept' }>,
  writesAuthored: (change: DocumentChange) => boolean
):
  | Readonly<{
      authored: boolean;
      change: DocumentChange;
      draft: JsonEditorValue;
      view: JsonEditorValue;
    }>
  | Readonly<{ refused: SyncKeptRefusal }> => {
  const { origin, seq } = kept;

  if (!origin) return { refused: 'gap' };

  const later = record.batches.flatMap((batch) =>
    batch.seq > seq && isShown(batch) ? [batch.change] : []
  );
  let own: DocumentChange;

  try {
    own = DocumentChange.fromJSON(origin.change);

    const at = shownValue(
      record.confirmed.document,
      record.batches.filter((batch) => batch.seq < seq)
    );
    const reached = origin.since.reduce(
      (value, json) => DocumentChange.fromJSON(json).apply(value),
      origin.before
    );

    if (!sameDocument(reached, at)) return { refused: 'gap' };
  } catch {
    return { refused: 'gap' };
  }

  try {
    const rebase = rebaseOver(
      [...origin.since, ...later].map((json) => DocumentChange.fromJSON(json)),
      own,
      origin.before
    );

    if (rebase.kind !== 'rebased') return { refused: 'conflict' };

    const view = shownValue(record.confirmed.document, record.batches);

    return {
      authored: writesAuthored(own),
      change: rebase.change,
      draft: rebase.change.apply(view),
      view,
    };
  } catch {
    return { refused: 'conflict' };
  }
};
