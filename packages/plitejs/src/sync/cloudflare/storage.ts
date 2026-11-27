import {
  type ChangeOwner,
  type Checkpoint,
  DELETED_IDS_MAX_BYTES,
  DELETED_IDS_MAX_ROWS,
  type DeletedIdRecord,
  deletedIdRecordBytes,
  type ScopeRecord,
  type StoredEntry,
  type StoredReceipt,
  type StoredRoom,
  type SyncStorage,
  type SyncStorageInit,
  type SyncStorageLimits,
} from '../server/storage';
import type { RoomStorage, SqlValue } from './platform';

// An entry's `bytes` comes before its `change`, so reading `bytes` reads no
// change's overflow pages.
const TABLES = `
CREATE TABLE IF NOT EXISTS room (id INTEGER PRIMARY KEY CHECK (id = 0), epoch TEXT NOT NULL, schema TEXT NOT NULL, floor INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS entries (version INTEGER PRIMARY KEY, at INTEGER NOT NULL, writer TEXT NOT NULL, seq INTEGER NOT NULL, bytes INTEGER NOT NULL, change TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS checkpoints (version INTEGER PRIMARY KEY, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS checkpoint_parts (version INTEGER NOT NULL, part INTEGER NOT NULL, bytes BLOB NOT NULL, PRIMARY KEY (version, part));
CREATE TABLE IF NOT EXISTS marks (writer TEXT PRIMARY KEY, actor TEXT NOT NULL) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS receipts (epoch TEXT NOT NULL, writer TEXT NOT NULL, seq INTEGER NOT NULL, digest TEXT NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, published TEXT, PRIMARY KEY (epoch, writer, seq)) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS owners (change TEXT PRIMARY KEY, author TEXT) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS scopes (scope TEXT PRIMARY KEY, writer TEXT, max_counter INTEGER NOT NULL) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS deleted_ids (id TEXT PRIMARY KEY, kind TEXT NOT NULL, node_hash TEXT, target_id TEXT, deleted_by TEXT NOT NULL, version INTEGER NOT NULL, bytes INTEGER NOT NULL) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS deleted_ids_version_id ON deleted_ids (version, id);
`;

/** A SQLite row holds at most 8 MB, so a document takes as many rows as it needs. */
const PART_BYTES = 2 * 1024 * 1024;

type Row = Record<string, SqlValue>;

const asStorageCall = <T>(read: () => T) =>
  new Promise<T>((resolve) => {
    resolve(read());
  });

const entryOf = (row: Row): StoredEntry => ({
  at: row.at as number,
  change: JSON.parse(row.change as string),
  seq: row.seq as number,
  version: row.version as number,
  writer: row.writer as string,
});

const receiptOf = (row: Row): StoredReceipt => ({
  digest: row.digest as string,
  key: {
    epoch: row.epoch as string,
    seq: row.seq as number,
    writer: row.writer as string,
  },
  ...(row.published === null
    ? {}
    : { published: JSON.parse(row.published as string) }),
  status: row.status as StoredReceipt['status'],
  version: row.version as number,
});

const deletedIdOf = (row: Row): DeletedIdRecord => ({
  deletedBy: row.deleted_by as string,
  id: row.id as string,
  kind: row.kind as DeletedIdRecord['kind'],
  nodeHash: row.node_hash as string | null,
  targetId: row.target_id as string | null,
  version: row.version as number,
});

const scopeOf = (row: Row): ScopeRecord => ({
  maxCounter: row.max_counter as number,
  scope: row.scope as string,
  writer: row.writer as string | null,
});

/** Storage for the one room a Durable Object holds, in its SQLite database. */
export const sqliteStorage = (
  room: string,
  storage: RoomStorage,
  limits: SyncStorageLimits = {}
): SyncStorage => {
  const maxDeletedIdRows = limits.maxDeletedIdRows ?? DELETED_IDS_MAX_ROWS;
  const maxDeletedIdBytes = limits.maxDeletedIdBytes ?? DELETED_IDS_MAX_BYTES;
  const { sql } = storage;
  const rows = (query: string, ...bindings: SqlValue[]) =>
    sql.exec(query, ...bindings).toArray();
  const own = (name: string) => {
    if (name !== room) {
      throw new Error(`This object holds room ${room}, not room ${name}.`);
    }
  };
  const bindOwners = (owners: readonly ChangeOwner[]) => {
    for (const { author, change } of owners) {
      sql.exec(
        'INSERT INTO owners (change, author) VALUES (?, ?) ON CONFLICT DO NOTHING',
        change,
        author
      );
    }
  };
  const bindScopes = (scopes: readonly ScopeRecord[]) => {
    for (const { maxCounter, scope, writer } of scopes) {
      sql.exec(
        'INSERT INTO scopes (scope, writer, max_counter) VALUES (?, ?, ?) ON CONFLICT(scope) DO UPDATE SET max_counter = MAX(scopes.max_counter, excluded.max_counter)',
        scope,
        writer,
        maxCounter
      );
    }
  };
  const applyDeletedIds = (
    deletedIds: readonly DeletedIdRecord[],
    restoredIds: readonly string[]
  ) => {
    for (const id of restoredIds) {
      sql.exec('DELETE FROM deleted_ids WHERE id = ?', id);
    }
    for (const record of deletedIds) {
      sql.exec(
        'INSERT OR REPLACE INTO deleted_ids (id, kind, node_hash, target_id, deleted_by, version, bytes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        record.id,
        record.kind,
        record.nodeHash,
        record.targetId,
        record.deletedBy,
        record.version,
        deletedIdRecordBytes(record)
      );
    }

    const [{ count, total }] = rows(
      'SELECT COUNT(*) AS count, COALESCE(SUM(bytes), 0) AS total FROM deleted_ids'
    );
    let remainingRows = count as number;
    let remainingBytes = total as number;

    if (
      remainingRows <= maxDeletedIdRows &&
      remainingBytes <= maxDeletedIdBytes
    ) {
      return;
    }

    const evicted: string[] = [];

    for (const row of sql.exec(
      'SELECT id, bytes FROM deleted_ids ORDER BY version ASC, id ASC'
    )) {
      if (
        remainingRows <= maxDeletedIdRows &&
        remainingBytes <= maxDeletedIdBytes
      ) {
        break;
      }
      evicted.push(row.id as string);
      remainingRows -= 1;
      remainingBytes -= row.bytes as number;
    }

    for (const id of evicted) {
      sql.exec('DELETE FROM deleted_ids WHERE id = ?', id);
    }
  };
  const writeCheckpoint = ({ at, document, version }: Checkpoint) => {
    const bytes = new TextEncoder().encode(JSON.stringify(document));

    sql.exec(
      'INSERT OR REPLACE INTO checkpoints (version, at) VALUES (?, ?)',
      version,
      at
    );
    sql.exec('DELETE FROM checkpoint_parts WHERE version = ?', version);
    for (let start = 0; start < bytes.length; start += PART_BYTES) {
      sql.exec(
        'INSERT INTO checkpoint_parts (version, part, bytes) VALUES (?, ?, ?)',
        version,
        start / PART_BYTES,
        bytes.slice(start, start + PART_BYTES).buffer
      );
    }
  };
  const initRoom = ({
    checkpoint,
    owners,
    schema,
    scopes,
  }: SyncStorageInit) => {
    sql.exec(
      'INSERT INTO room (id, epoch, schema, floor) VALUES (0, ?, ?, ?)',
      crypto.randomUUID(),
      schema,
      checkpoint.version
    );
    writeCheckpoint(checkpoint);
    bindOwners(owners());
    bindScopes(scopes?.() ?? []);
  };
  const floorOf = () => rows('SELECT floor FROM room')[0].floor as number;
  const compact = (before: number) => {
    const [{ version }] = rows(
      'SELECT MAX(version) AS version FROM checkpoints WHERE at < ?',
      before
    );
    const current = floorOf();
    const floor = Math.max(current, (version as number | null) ?? 0);

    if (floor === current) return;

    sql.exec('UPDATE room SET floor = ?', floor);
    sql.exec('DELETE FROM entries WHERE version <= ?', floor);
    sql.exec('DELETE FROM checkpoints WHERE version < ?', floor);
    sql.exec('DELETE FROM checkpoint_parts WHERE version < ?', floor);
    sql.exec('DELETE FROM deleted_ids WHERE version <= ?', floor);
  };
  const checkpointOf = (row: Row): Checkpoint => {
    const decoder = new TextDecoder();
    let text = '';

    for (const part of rows(
      'SELECT bytes FROM checkpoint_parts WHERE version = ? ORDER BY part',
      row.version
    )) {
      text += decoder.decode(new Uint8Array(part.bytes as ArrayBuffer), {
        stream: true,
      });
    }

    return {
      at: row.at as number,
      document: JSON.parse(text + decoder.decode()),
      version: row.version as number,
    };
  };
  const stored = (): StoredRoom | null => {
    const [row] = rows('SELECT epoch, schema, floor FROM room');

    if (!row) return null;

    const [{ head }] = rows('SELECT MAX(version) AS head FROM entries');

    return {
      epoch: row.epoch as string,
      floor: row.floor as number,
      head: (head as number | null) ?? (row.floor as number),
      schema: row.schema as string,
    };
  };

  sql.exec(TABLES);

  return {
    checkpoint: (name, version) =>
      asStorageCall(() => {
        own(name);

        const [row] = rows(
          'SELECT version, at FROM checkpoints WHERE version <= ? ORDER BY version DESC LIMIT 1',
          version
        );

        return row ? checkpointOf(row) : null;
      }),
    checkpoints: (name, version) =>
      asStorageCall(() => {
        own(name);

        return rows(
          'SELECT version FROM checkpoints WHERE version >= (SELECT COALESCE(MAX(version), ?) FROM checkpoints WHERE version <= ?) ORDER BY version',
          version,
          version
        ).map((row) => row.version as number);
      }),
    deletedIds: (name, ids) =>
      asStorageCall(() => {
        own(name);

        return ids.flatMap((id) => {
          const [row] = rows(
            'SELECT id, kind, node_hash, target_id, deleted_by, version FROM deleted_ids WHERE id = ?',
            id
          );

          return row ? [deletedIdOf(row)] : [];
        });
      }),
    entries: (name, version) =>
      asStorageCall(() => {
        own(name);

        return rows(
          'SELECT version, at, writer, seq, change FROM entries WHERE version > ? ORDER BY version',
          version
        ).map(entryOf);
      }),
    lastSeq: (name, writer) =>
      asStorageCall(() => {
        own(name);

        const [roomRow] = rows('SELECT epoch FROM room');

        if (!roomRow) return 0;

        const [{ seq }] = rows(
          'SELECT COALESCE(MAX(seq), 0) AS seq FROM receipts WHERE epoch = ? AND writer = ?',
          roomRow.epoch,
          writer
        );

        return seq as number;
      }),
    load: (name, create) =>
      asStorageCall(() => {
        own(name);

        const existing = stored();

        if (existing) return existing;

        storage.transactionSync(() => {
          initRoom(create);
        });

        return stored() as StoredRoom;
      }),
    logged: (name, version) =>
      asStorageCall(() => {
        own(name);

        return rows(
          'SELECT COALESCE(SUM(bytes), 0) AS bytes FROM entries WHERE version > ?',
          version
        )[0].bytes as number;
      }),
    mark: (name, writer) =>
      asStorageCall(() => {
        own(name);

        const [row] = rows(
          'SELECT writer, actor FROM marks WHERE writer = ?',
          writer
        );

        return row
          ? { actor: row.actor as string, writer: row.writer as string }
          : null;
      }),
    owners: (name, changes) =>
      asStorageCall(() => {
        own(name);

        return changes.flatMap((change) => {
          const [row] = rows(
            'SELECT author FROM owners WHERE change = ?',
            change
          );

          return row ? [{ author: row.author as string | null, change }] : [];
        });
      }),
    reach: (name, limit) =>
      asStorageCall(() => {
        own(name);

        let total = 0;

        for (const row of sql.exec(
          'SELECT version, bytes FROM entries ORDER BY version DESC'
        )) {
          total += row.bytes as number;
          if (total > limit) return row.version as number;
        }

        return floorOf();
      }),
    receipt: (name, { epoch, seq, writer }) =>
      asStorageCall(() => {
        own(name);

        const [row] = rows(
          'SELECT * FROM receipts WHERE epoch = ? AND writer = ? AND seq = ?',
          epoch,
          writer,
          seq
        );

        return row ? receiptOf(row) : null;
      }),
    reset: (name, create) =>
      asStorageCall(() => {
        own(name);

        storage.transactionSync(() => {
          sql.exec('DELETE FROM room');
          sql.exec('DELETE FROM entries');
          sql.exec('DELETE FROM checkpoints');
          sql.exec('DELETE FROM checkpoint_parts');
          sql.exec('DELETE FROM marks');
          sql.exec('DELETE FROM receipts');
          sql.exec('DELETE FROM owners');
          sql.exec('DELETE FROM scopes');
          sql.exec('DELETE FROM deleted_ids');
          initRoom(create);
        });

        return stored() as StoredRoom;
      }),
    scopes: (name, scopeNames) =>
      asStorageCall(() => {
        own(name);

        return scopeNames.flatMap((scope) => {
          const [row] = rows(
            'SELECT scope, writer, max_counter FROM scopes WHERE scope = ?',
            scope
          );

          return row ? [scopeOf(row)] : [];
        });
      }),
    settle: (
      name,
      {
        checkpoint,
        deletedIds,
        entry,
        mark,
        owners,
        receipt,
        restoredIds,
        scopes,
      }
    ) =>
      asStorageCall(() => {
        own(name);

        return storage.transactionSync(() => {
          if (entry) {
            sql.exec(
              'INSERT INTO entries (version, at, writer, seq, bytes, change) VALUES (?, ?, ?, ?, ?, ?)',
              entry.version,
              entry.at,
              entry.writer,
              entry.seq,
              entry.bytes,
              JSON.stringify(entry.change)
            );
          }
          bindOwners(owners ?? []);
          bindScopes(scopes ?? []);
          if ((deletedIds?.length ?? 0) > 0 || (restoredIds?.length ?? 0) > 0) {
            applyDeletedIds(deletedIds ?? [], restoredIds ?? []);
          }
          sql.exec(
            'INSERT OR REPLACE INTO marks (writer, actor) VALUES (?, ?)',
            mark.writer,
            mark.actor
          );
          sql.exec(
            'INSERT OR REPLACE INTO receipts (epoch, writer, seq, digest, status, version, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
            receipt.key.epoch,
            receipt.key.writer,
            receipt.key.seq,
            receipt.digest,
            receipt.status,
            receipt.version,
            receipt.published ? JSON.stringify(receipt.published) : null
          );
          if (entry && checkpoint) {
            writeCheckpoint({
              at: entry.at,
              document: checkpoint.document,
              version: entry.version,
            });
            compact(checkpoint.compactBefore);
          }

          return floorOf();
        });
      }),
  };
};
