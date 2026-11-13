import type {
  ChangeOwner,
  Checkpoint,
  StoredEntry,
  StoredReceipt,
  StoredRoom,
  SyncStorage,
} from '../server/storage';
import type { RoomStorage, SqlValue } from './platform';

const TABLES = `
CREATE TABLE IF NOT EXISTS room (id INTEGER PRIMARY KEY CHECK (id = 0), epoch TEXT NOT NULL, schema TEXT NOT NULL, floor INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS entries (version INTEGER PRIMARY KEY, at INTEGER NOT NULL, writer TEXT NOT NULL, seq INTEGER NOT NULL, change TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS checkpoints (version INTEGER PRIMARY KEY, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS checkpoint_parts (version INTEGER NOT NULL, part INTEGER NOT NULL, bytes BLOB NOT NULL, PRIMARY KEY (version, part));
CREATE TABLE IF NOT EXISTS marks (writer TEXT PRIMARY KEY, actor TEXT NOT NULL) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS receipts (epoch TEXT NOT NULL, writer TEXT NOT NULL, seq INTEGER NOT NULL, digest TEXT NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, published TEXT, PRIMARY KEY (epoch, writer, seq)) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS owners (change TEXT PRIMARY KEY, author TEXT) WITHOUT ROWID;
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

/** Storage for the one room a Durable Object holds, in its SQLite database. */
export const sqliteStorage = (
  room: string,
  storage: RoomStorage
): SyncStorage => {
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
    compact: (name, before) =>
      asStorageCall(() => {
        own(name);

        return storage.transactionSync(() => {
          const [{ floor }] = rows('SELECT floor FROM room');
          const [{ version }] = rows(
            'SELECT MAX(version) AS version FROM checkpoints WHERE at < ?',
            before
          );
          const next = Math.max(
            floor as number,
            (version as number | null) ?? (floor as number)
          );

          sql.exec('UPDATE room SET floor = ?', next);
          sql.exec('DELETE FROM entries WHERE version <= ?', next);
          sql.exec('DELETE FROM checkpoints WHERE version < ?', next);
          sql.exec('DELETE FROM checkpoint_parts WHERE version < ?', next);

          return next;
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
    load: (name, { checkpoint, owners, schema }) =>
      asStorageCall(() => {
        own(name);

        const existing = stored();

        if (existing) return existing;

        storage.transactionSync(() => {
          sql.exec(
            'INSERT INTO room (id, epoch, schema, floor) VALUES (0, ?, ?, ?)',
            crypto.randomUUID(),
            schema,
            checkpoint.version
          );
          writeCheckpoint(checkpoint);
          bindOwners(owners());
        });

        return stored() as StoredRoom;
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
    saveCheckpoint: (name, checkpoint) =>
      asStorageCall(() => {
        own(name);
        storage.transactionSync(() => writeCheckpoint(checkpoint));
      }),
    settle: (name, { entry, mark, owners, receipt }) =>
      asStorageCall(() => {
        own(name);
        storage.transactionSync(() => {
          if (entry) {
            sql.exec(
              'INSERT INTO entries (version, at, writer, seq, change) VALUES (?, ?, ?, ?, ?)',
              entry.version,
              entry.at,
              entry.writer,
              entry.seq,
              JSON.stringify(entry.change)
            );
          }
          bindOwners(owners ?? []);
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
        });
      }),
  };
};
