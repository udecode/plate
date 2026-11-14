import type { DocumentChangeJson } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';

export type OutboxHead = Readonly<{
  actor: string;
  epoch: string | null;
  nextSeq: number;
  offline: boolean;
  opened: number;
  room: string;
  stopped: boolean;
  writer: string;
}>;

export type Confirmed = Readonly<{
  document: JsonEditorValue;
  version: number | null;
}>;

export type KeptReason =
  | Readonly<{ check: 'moved'; kind: 'decision' }>
  | Readonly<{ kind: 'conflict' }>
  | Readonly<{ kind: 'expired' }>
  | Readonly<{ kind: 'refused'; reason: string }>;

export type SavedBatch = Readonly<{ decision: boolean; seq: number }> &
  (
    | Readonly<{ change: DocumentChangeJson; state: 'saved' }>
    | Readonly<{ change: DocumentChangeJson; frame: string; state: 'sent' }>
    | Readonly<{ frame: string; state: 'withheld' }>
    | Readonly<{
        change: DocumentChangeJson;
        frame?: string;
        reason: KeptReason;
        state: 'kept';
      }>
  );

export type OutboxRecord = Readonly<{
  batches: readonly SavedBatch[];
  confirmed: Confirmed;
  head: OutboxHead;
}>;

export type OutboxWrite = Readonly<{
  confirmed?: Confirmed;
  drop?: readonly number[];
  head?: OutboxHead;
  put?: readonly SavedBatch[];
}>;

export type OutboxStore = Readonly<{
  list: (room: string) => Promise<readonly OutboxRecord[]>;
  load: (writer: string) => Promise<OutboxRecord | null>;
  write: (writer: string, write: OutboxWrite) => Promise<void>;
}>;

export const applyWrite = (
  record: OutboxRecord | null,
  write: OutboxWrite
): OutboxRecord => {
  const head = write.head ?? record?.head;
  const confirmed = write.confirmed ?? record?.confirmed;

  if (!head || !confirmed) {
    throw new Error('An outbox starts with its head and confirmed document.');
  }

  const dropped = new Set(write.drop);
  const batches = new Map(
    (record?.batches ?? [])
      .filter(({ seq }) => !dropped.has(seq))
      .map((batch) => [batch.seq, batch])
  );

  for (const batch of write.put ?? []) batches.set(batch.seq, batch);

  return {
    batches: [...batches.values()].sort((a, b) => a.seq - b.seq),
    confirmed,
    head,
  };
};

export const mergeWrites = (
  earlier: OutboxWrite,
  later: OutboxWrite
): OutboxWrite => {
  const dropped = new Set([...(earlier.drop ?? []), ...(later.drop ?? [])]);
  const put = new Map(
    [...(earlier.put ?? []), ...(later.put ?? [])].map((batch) => [
      batch.seq,
      batch,
    ])
  );

  for (const seq of dropped) put.delete(seq);

  return {
    confirmed: later.confirmed ?? earlier.confirmed,
    drop: [...dropped],
    head: later.head ?? earlier.head,
    put: [...put.values()],
  };
};
