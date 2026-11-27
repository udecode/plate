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

/**
 * Durable allocation scope watermark. Once `writer` is bound (or `null` for an
 * initial-load scope), it never changes; `maxCounter` advances monotonically
 * and is never compacted.
 */
export type ScopeRecord = Readonly<{
  maxCounter: number;
  scope: string;
  writer: string | null;
}>;

/**
 * Durable record of a deleted or joined-away element ID, used to authorize
 * undo/take-back restores. Compacted at `version <= floor` and bounded by
 * `DELETED_IDS_MAX_ROWS` and `DELETED_IDS_MAX_BYTES`.
 */
export type DeletedIdRecord = Readonly<{
  deletedBy: string;
  id: string;
  kind: 'joined' | 'removed';
  nodeHash: string | null;
  targetId: string | null;
  version: number;
}>;

export type SyncStorageLimits = Readonly<{
  maxDeletedIdBytes?: number;
  maxDeletedIdRows?: number;
}>;

export const DELETED_IDS_MAX_ROWS = 64_000;
export const DELETED_IDS_MAX_BYTES = 4 * 1024 * 1024;

const utf8Encoder = new TextEncoder();

export const deletedIdRecordBytes = (record: DeletedIdRecord): number =>
  utf8Encoder.encode(record.id).length +
  record.kind.length +
  (record.nodeHash ? utf8Encoder.encode(record.nodeHash).length : 0) +
  (record.targetId ? utf8Encoder.encode(record.targetId).length : 0) +
  utf8Encoder.encode(record.deletedBy).length +
  64;

export type SyncStorageInit = Readonly<{
  checkpoint: Checkpoint;
  owners: () => readonly ChangeOwner[];
  schema: string;
  scopes?: () => readonly ScopeRecord[];
}>;

export type Settlement = Readonly<{ mark: WriterMark }> &
  (
    | Readonly<{
        /**
         * The document after `entry`, saved as the checkpoint at its version
         * and time. Storage then drops the entries and deleted IDs at or below
         * the newest checkpoint saved before `compactBefore`, keeping every
         * receipt, writer mark, change owner and allocation scope.
         */
        checkpoint?: Readonly<{
          compactBefore: number;
          document: JsonEditorValue;
        }>;
        deletedIds?: readonly DeletedIdRecord[];
        entry: StoredEntry & Readonly<{ bytes: number }>;
        owners: readonly ChangeOwner[];
        receipt: StoredReceipt & Readonly<{ status: 'accepted' }>;
        restoredIds?: readonly string[];
        scopes?: readonly ScopeRecord[];
      }>
    | Readonly<{
        checkpoint?: undefined;
        deletedIds?: undefined;
        entry?: undefined;
        owners?: undefined;
        receipt: StoredReceipt & Readonly<{ status: 'satisfied' }>;
        restoredIds?: undefined;
        scopes?: undefined;
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
 * transaction, so a crash leaves the entry, the mark, the receipt, the owners,
 * the scopes, the deleted IDs and the checkpoint all written or none of them.
 * It never replaces a stored owner or scope writer.
 */
export type SyncStorage = Readonly<{
  /** The newest checkpoint at or below `version`. */
  checkpoint: (room: string, version: number) => Promise<Checkpoint | null>;
  /**
   * The versions of the newest checkpoint at or below `version` and of every
   * later checkpoint, oldest first. It reads no document.
   */
  checkpoints: (room: string, version: number) => Promise<readonly number[]>;
  /** Stored deleted-ID records for `ids` that are still retained. */
  deletedIds: (
    room: string,
    ids: readonly string[]
  ) => Promise<readonly DeletedIdRecord[]>;
  /** The entries after `version`, oldest first. */
  entries: (room: string, version: number) => Promise<readonly StoredEntry[]>;
  /**
   * The highest settled `seq` for `writer` in the room's current epoch, or 0
   * when none is stored.
   */
  lastSeq: (room: string, writer: string) => Promise<number>;
  /**
   * The stored room. A room storage has never held is created with a new
   * epoch, `schema`, its first checkpoint, the owners `owners` returns and
   * the scopes `scopes` returns; a stored room ignores `create` and never
   * calls `owners` or `scopes`.
   */
  load: (room: string, create: SyncStorageInit) => Promise<StoredRoom>;
  /**
   * The sum of the `bytes` stored with the entries after `version`. It reads
   * every one of them, so a room asks it only from its newest checkpoint,
   * whose later entries the room's checkpoint rule keeps under its read bound.
   */
  logged: (room: string, version: number) => Promise<number>;
  mark: (room: string, writer: string) => Promise<WriterMark | null>;
  owners: (
    room: string,
    changes: readonly string[]
  ) => Promise<readonly ChangeOwner[]>;
  /**
   * The oldest version at or above the floor whose later entries hold at most
   * `limit` bytes, or the floor when every entry fits. It reads the entries'
   * `bytes` newest first and stops once their sum passes `limit`, so
   * `logged(version) <= limit` holds exactly when `version >= reach(limit)`.
   */
  reach: (room: string, limit: number) => Promise<number>;
  receipt: (room: string, key: ReceiptKey) => Promise<StoredReceipt | null>;
  /**
   * Atomically wipes the room's stored state and initializes a fresh epoch
   * with `create`. Used for beta schema/epoch resets.
   */
  reset: (room: string, create: SyncStorageInit) => Promise<StoredRoom>;
  /** Stored allocation scopes for `scopes`. */
  scopes: (
    room: string,
    scopes: readonly string[]
  ) => Promise<readonly ScopeRecord[]>;
  /**
   * Stores `entry.bytes`, the UTF-8 length of the entry's change JSON as the
   * room measured it, and resolves to the room's floor once the settlement is
   * written.
   */
  settle: (room: string, settlement: Settlement) => Promise<number>;
}>;
