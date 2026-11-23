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
        /**
         * The document after `entry`, saved as the checkpoint at its version
         * and time. Storage then drops the entries at or below the newest
         * checkpoint saved before `compactBefore`, keeping every receipt,
         * writer mark and change owner.
         */
        checkpoint?: Readonly<{
          compactBefore: number;
          document: JsonEditorValue;
        }>;
        entry: StoredEntry & Readonly<{ bytes: number }>;
        owners: readonly ChangeOwner[];
        receipt: StoredReceipt & Readonly<{ status: 'accepted' }>;
      }>
    | Readonly<{
        checkpoint?: undefined;
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
 * transaction, so a crash leaves the entry, the mark, the receipt, the owners
 * and the checkpoint all written or none of them. It never replaces a stored
 * owner.
 */
export type SyncStorage = Readonly<{
  /** The newest checkpoint at or below `version`. */
  checkpoint: (room: string, version: number) => Promise<Checkpoint | null>;
  /** The entries after `version`, oldest first. */
  entries: (room: string, version: number) => Promise<readonly StoredEntry[]>;
  /**
   * The stored room. A room storage has never held is created with a new
   * epoch, `schema`, its first checkpoint and the owners `owners` returns; a
   * stored room ignores `create` and never calls `owners`.
   */
  load: (
    room: string,
    create: Readonly<{
      checkpoint: Checkpoint;
      owners: () => readonly ChangeOwner[];
      schema: string;
    }>
  ) => Promise<StoredRoom>;
  /** The sum of the `bytes` stored with the entries after `version`. */
  logged: (room: string, version: number) => Promise<number>;
  mark: (room: string, writer: string) => Promise<WriterMark | null>;
  owners: (
    room: string,
    changes: readonly string[]
  ) => Promise<readonly ChangeOwner[]>;
  receipt: (room: string, key: ReceiptKey) => Promise<StoredReceipt | null>;
  /**
   * Stores `entry.bytes`, the UTF-8 length of the entry's change JSON as the
   * room measured it, and resolves to the room's floor once the settlement is
   * written.
   */
  settle: (room: string, settlement: Settlement) => Promise<number>;
}>;
