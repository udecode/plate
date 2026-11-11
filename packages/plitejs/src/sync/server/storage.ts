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

/** A satisfied batch settles with no entry. */
export type Settlement = Readonly<{
  entry?: StoredEntry;
  mark: WriterMark;
  receipt: StoredReceipt;
}>;

export type StoredRoom = Readonly<{
  epoch: string;
  /** Entries after `floor` are kept; compaction dropped the rest. */
  floor: number;
  head: number;
  schema: string;
}>;

/**
 * A room's durable state. `settle` is the one write a host maps to one
 * transaction, so a crash leaves the entry, the mark and the receipt all
 * written or none of them.
 */
export type SyncStorage = Readonly<{
  /** The newest checkpoint at or below `version`. */
  checkpoint: (room: string, version: number) => Promise<Checkpoint | null>;
  /**
   * Drops the entries at or below the newest checkpoint written before
   * `before`, keeping every receipt, and returns the new floor.
   */
  compact: (room: string, before: number) => Promise<number>;
  /** The entries after `version`, oldest first. */
  entries: (room: string, version: number) => Promise<readonly StoredEntry[]>;
  /**
   * The stored room. A room storage has never held is created with a new
   * epoch, `schema` and its first checkpoint.
   */
  load: (
    room: string,
    create: Readonly<{ checkpoint: Checkpoint; schema: string }>
  ) => Promise<StoredRoom>;
  mark: (room: string, writer: string) => Promise<WriterMark | null>;
  receipt: (room: string, key: ReceiptKey) => Promise<StoredReceipt | null>;
  saveCheckpoint: (room: string, checkpoint: Checkpoint) => Promise<void>;
  settle: (room: string, settlement: Settlement) => Promise<void>;
}>;
