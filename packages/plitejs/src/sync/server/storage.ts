import type { DocumentChangeJson } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import type { SyncEntry } from '../protocol';

export type StoredEntry = SyncEntry & Readonly<{ at: number }>;

/** The room's document after the entry at `version`, written at `at`. */
export type Checkpoint = Readonly<{
  at: number;
  document: JsonEditorValue;
  version: number;
}>;

export type ReceiptKey = Readonly<{
  epoch: string;
  seq: number;
  writer: string;
}>;

export type StoredReceipt = Readonly<{
  digest: string;
  key: ReceiptKey;
  /** The change the room appended, when its bytes differ from the batch. */
  published?: DocumentChangeJson;
  status: 'accepted' | 'satisfied';
  version: number;
}>;

/** Binds a writer to the actor whose batch it first settled. */
export type WriterMark = Readonly<{ actor: string; writer: string }>;

export type ChangeOwner = Readonly<{ author: string | null; change: string }>;

export type Settlement = Readonly<{ mark: WriterMark }> &
  (
    | Readonly<{
        entry: StoredEntry;
        owners: readonly ChangeOwner[];
        receipt: StoredReceipt & Readonly<{ status: 'accepted' }>;
      }>
    | Readonly<{
        entry?: undefined;
        owners?: undefined;
        receipt: StoredReceipt & Readonly<{ status: 'satisfied' }>;
      }>
  );

export type StoredRoom = Readonly<{
  epoch: string;
  /** Entries after `floor` are kept; compaction dropped the rest. */
  floor: number;
  head: number;
  schema: string;
}>;

/**
 * A room's durable state. `settle` is the one write a host maps to one
 * transaction, so a crash leaves the entry, the mark, the receipt and the
 * owners all written or none of them. It never replaces a stored owner.
 */
export type SyncStorage = Readonly<{
  /** The newest checkpoint at or below `version`. */
  checkpoint: (room: string, version: number) => Promise<Checkpoint | null>;
  /**
   * Drops the entries at or below the newest checkpoint written before
   * `before`, keeping every receipt, writer mark and change owner, and
   * returns the new floor.
   */
  compact: (room: string, before: number) => Promise<number>;
  /** The entries after `version`, oldest first. */
  entries: (room: string, version: number) => Promise<readonly StoredEntry[]>;
  /**
   * The stored room. A room storage has never held is created with a new
   * epoch, `schema`, its first checkpoint and `owners`; a stored room ignores
   * `create`.
   */
  load: (
    room: string,
    create: Readonly<{
      checkpoint: Checkpoint;
      owners: readonly ChangeOwner[];
      schema: string;
    }>
  ) => Promise<StoredRoom>;
  mark: (room: string, writer: string) => Promise<WriterMark | null>;
  owners: (
    room: string,
    changes: readonly string[]
  ) => Promise<readonly ChangeOwner[]>;
  receipt: (room: string, key: ReceiptKey) => Promise<StoredReceipt | null>;
  saveCheckpoint: (room: string, checkpoint: Checkpoint) => Promise<void>;
  settle: (room: string, settlement: Settlement) => Promise<void>;
}>;
