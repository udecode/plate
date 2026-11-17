import type {
  ConflictRecords,
  DocumentChangeJson,
} from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';

export type OutboxHead = Readonly<{
  actor: string;
  adoptOnly?: true;
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

export const conflictOn = (records?: ConflictRecords): KeptReason =>
  records ? { kind: 'conflict', records } : { kind: 'conflict' };

export type KeptReason =
  | Readonly<{
      check: 'judge' | 'moved' | 'stale' | 'structure' | 'threw';
      kind: 'decision';
    }>
  | Readonly<{ kind: 'conflict'; records?: ConflictRecords }>
  | Readonly<{ kind: 'expired' }>
  | Readonly<{ kind: 'invalid' }>
  | Readonly<{ kind: 'judged'; verdict: 'contested' | 'lost' | 'unjudged' }>
  | Readonly<{ kind: 'refused'; reason: string }>
  | Readonly<{ kind: 'size' }>;

export type BatchOrigin = Readonly<{
  before: JsonEditorValue;
  change: DocumentChangeJson;
  since: readonly DocumentChangeJson[];
}>;

export type CommitDecision =
  | Readonly<{ kind: 'made'; step: null }>
  | Readonly<{ kind: 'made' | 'redo' | 'undo'; step: string }>;

export type Decision =
  | Extract<CommitDecision, { step: null }>
  | (Extract<CommitDecision, { step: string }> &
      Readonly<{ superseded?: true; unrebased: DocumentChangeJson }>);

export type StepRebuild =
  | Readonly<{
      base: JsonEditorValue;
      step: string;
      takeBack: DocumentChangeJson;
    }>
  | Readonly<{ forget: true; step: string }>;

export type SavedBatch = Readonly<{
  decision: Decision | null;
  mergedInto?: string;
  seq: number;
}> &
  (
    | Readonly<{
        change: DocumentChangeJson;
        origin?: BatchOrigin;
        state: 'saved';
        takesBackSeq?: number;
      }>
    | Readonly<{
        change: DocumentChangeJson;
        frame: string;
        origin?: BatchOrigin;
        state: 'sent';
      }>
    | Readonly<{
        frame: string;
        origin?: BatchOrigin;
        records?: ConflictRecords;
        state: 'withheld';
      }>
    | Readonly<{
        change: DocumentChangeJson;
        frame?: string;
        origin?: BatchOrigin;
        reason: KeptReason;
        state: 'kept';
      }>
  );

export type OutboxRecord = Readonly<{
  batches: readonly SavedBatch[];
  confirmed: Confirmed;
  head: OutboxHead;
  rebuilds: readonly StepRebuild[];
}>;

export type OutboxWrite = Readonly<{
  confirmed?: Confirmed;
  drop?: readonly number[];
  head?: OutboxHead;
  put?: readonly SavedBatch[];
  rebuilds?: readonly StepRebuild[];
}>;

export const provenanceOf = ({ decision, mergedInto, seq }: SavedBatch) => ({
  decision,
  ...(mergedInto === undefined ? {} : { mergedInto }),
  seq,
});

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
    rebuilds: write.rebuilds ?? record?.rebuilds ?? [],
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

  const rebuilds = later.rebuilds ?? earlier.rebuilds;

  return {
    confirmed: later.confirmed ?? earlier.confirmed,
    drop: [...dropped],
    head: later.head ?? earlier.head,
    put: [...put.values()],
    ...(rebuilds ? { rebuilds } : {}),
  };
};
