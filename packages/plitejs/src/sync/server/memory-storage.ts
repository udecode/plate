import {
  type ChangeOwner,
  type Checkpoint,
  DELETED_IDS_MAX_BYTES,
  DELETED_IDS_MAX_ROWS,
  type DeletedIdRecord,
  deletedIdRecordBytes,
  type ReceiptKey,
  type ScopeRecord,
  type StoredEntry,
  type StoredReceipt,
  type StoredRoom,
  type SyncStorage,
  type SyncStorageInit,
  type SyncStorageLimits,
  type WriterMark,
} from './storage';

type StoredDeletedId = Readonly<{ bytes: number; record: DeletedIdRecord }>;

type MemoryRoom = {
  checkpoints: Checkpoint[];
  deletedIdBytes: number;
  deletedIds: Map<string, StoredDeletedId>;
  entries: Array<Readonly<{ bytes: number; entry: StoredEntry }>>;
  epoch: string;
  floor: number;
  marks: Map<string, WriterMark>;
  owners: Map<string, string | null>;
  receipts: Map<string, StoredReceipt>;
  schema: string;
  scopes: Map<string, ScopeRecord>;
};

const bindOwners = (room: MemoryRoom, owners: readonly ChangeOwner[]) => {
  for (const { author, change } of owners) {
    if (!room.owners.has(change)) room.owners.set(change, author);
  }
};

const bindScopes = (room: MemoryRoom, scopes: readonly ScopeRecord[]) => {
  for (const record of scopes) {
    const existing = room.scopes.get(record.scope);

    if (!existing) {
      room.scopes.set(record.scope, record);
    } else if (record.maxCounter > existing.maxCounter) {
      room.scopes.set(record.scope, {
        ...existing,
        maxCounter: record.maxCounter,
      });
    }
  }
};

const applyDeletedIds = (
  room: MemoryRoom,
  deletedIds: readonly DeletedIdRecord[],
  restoredIds: readonly string[],
  maxRows: number,
  maxBytes: number
) => {
  for (const id of restoredIds) {
    const existing = room.deletedIds.get(id);

    if (!existing) continue;
    room.deletedIdBytes -= existing.bytes;
    room.deletedIds.delete(id);
  }

  for (const record of deletedIds) {
    const existing = room.deletedIds.get(record.id);

    if (existing) room.deletedIdBytes -= existing.bytes;

    const bytes = deletedIdRecordBytes(record);

    room.deletedIds.set(record.id, { bytes, record });
    room.deletedIdBytes += bytes;
  }

  if (room.deletedIds.size <= maxRows && room.deletedIdBytes <= maxBytes) {
    return;
  }

  const ordered = [...room.deletedIds.values()].sort(
    (a, b) =>
      a.record.version - b.record.version ||
      (a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0)
  );

  for (const item of ordered) {
    if (room.deletedIds.size <= maxRows && room.deletedIdBytes <= maxBytes) {
      break;
    }
    room.deletedIds.delete(item.record.id);
    room.deletedIdBytes -= item.bytes;
  }
};

const compact = (room: MemoryRoom, before: number) => {
  const floor =
    room.checkpoints.findLast((checkpoint) => checkpoint.at < before)
      ?.version ?? room.floor;

  if (floor <= room.floor) return;

  room.floor = floor;
  room.entries = room.entries.filter(({ entry }) => entry.version > room.floor);
  room.checkpoints = room.checkpoints.filter(
    (checkpoint) => checkpoint.version >= room.floor
  );
  for (const [id, item] of room.deletedIds) {
    if (item.record.version <= room.floor) {
      room.deletedIdBytes -= item.bytes;
      room.deletedIds.delete(id);
    }
  }
};

const createRoom = ({
  checkpoint,
  owners,
  schema,
  scopes,
}: SyncStorageInit): MemoryRoom => {
  const room: MemoryRoom = {
    checkpoints: [checkpoint],
    deletedIdBytes: 0,
    deletedIds: new Map(),
    entries: [],
    epoch: crypto.randomUUID(),
    floor: checkpoint.version,
    marks: new Map(),
    owners: new Map(),
    receipts: new Map(),
    schema,
    scopes: new Map(),
  };

  bindOwners(room, owners());
  bindScopes(room, scopes?.() ?? []);

  return room;
};

const keyOf = ({ epoch, seq, writer }: ReceiptKey) =>
  JSON.stringify([epoch, writer, seq]);

const headOf = (room: MemoryRoom) =>
  room.entries.at(-1)?.entry.version ?? room.floor;

const asStorageCall = <T>(read: () => T) =>
  new Promise<T>((resolve) => {
    resolve(read());
  });

/** Storage that lives as long as the process, for tests and a Node host. */
export const memoryStorage = (limits: SyncStorageLimits = {}): SyncStorage => {
  const maxDeletedIdRows = limits.maxDeletedIdRows ?? DELETED_IDS_MAX_ROWS;
  const maxDeletedIdBytes = limits.maxDeletedIdBytes ?? DELETED_IDS_MAX_BYTES;
  const rooms = new Map<string, MemoryRoom>();
  const roomOf = (name: string) => {
    const room = rooms.get(name);

    if (!room) throw new Error(`No room ${name} is stored.`);

    return room;
  };
  const stored = (room: MemoryRoom): StoredRoom => ({
    epoch: room.epoch,
    floor: room.floor,
    head: headOf(room),
    schema: room.schema,
  });
  const after = (name: string, version: number) =>
    roomOf(name).entries.filter(({ entry }) => entry.version > version);

  return {
    checkpoint: (name, version) =>
      asStorageCall(
        () =>
          roomOf(name).checkpoints.findLast(
            (checkpoint) => checkpoint.version <= version
          ) ?? null
      ),
    checkpoints: (name, version) =>
      asStorageCall(() => {
        const { checkpoints } = roomOf(name);
        const newest = checkpoints.findLastIndex(
          (checkpoint) => checkpoint.version <= version
        );

        return checkpoints
          .slice(Math.max(newest, 0))
          .map((checkpoint) => checkpoint.version);
      }),
    deletedIds: (name, ids) =>
      asStorageCall(() => {
        const { deletedIds } = roomOf(name);

        return ids.flatMap((id) => {
          const item = deletedIds.get(id);

          return item ? [item.record] : [];
        });
      }),
    entries: (name, version) =>
      asStorageCall(() => after(name, version).map(({ entry }) => entry)),
    lastSeq: (name, writer) =>
      asStorageCall(() => {
        const room = roomOf(name);
        let max = 0;

        for (const receipt of room.receipts.values()) {
          if (
            receipt.key.epoch === room.epoch &&
            receipt.key.writer === writer &&
            receipt.key.seq > max
          ) {
            max = receipt.key.seq;
          }
        }

        return max;
      }),
    load: (name, create) =>
      asStorageCall(() => {
        let room = rooms.get(name);

        if (!room) {
          room = createRoom(create);
          rooms.set(name, room);
        }

        return stored(room);
      }),
    logged: (name, version) =>
      asStorageCall(() =>
        after(name, version).reduce((total, { bytes }) => total + bytes, 0)
      ),
    mark: (name, writer) =>
      asStorageCall(() => roomOf(name).marks.get(writer) ?? null),
    owners: (name, changes) =>
      asStorageCall(() => {
        const { owners } = roomOf(name);

        return changes.flatMap((change) => {
          const author = owners.get(change);

          return author === undefined ? [] : [{ author, change }];
        });
      }),
    reach: (name, limit) =>
      asStorageCall(() => {
        const room = roomOf(name);
        let total = 0;

        for (const { bytes, entry } of room.entries.toReversed()) {
          total += bytes;
          if (total > limit) return entry.version;
        }

        return room.floor;
      }),
    receipt: (name, key) =>
      asStorageCall(() => roomOf(name).receipts.get(keyOf(key)) ?? null),
    reset: (name, create) =>
      asStorageCall(() => {
        const room = createRoom(create);

        rooms.set(name, room);

        return stored(room);
      }),
    scopes: (name, scopeNames) =>
      asStorageCall(() => {
        const { scopes } = roomOf(name);

        return scopeNames.flatMap((scope) => {
          const record = scopes.get(scope);

          return record ? [record] : [];
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
        const room = roomOf(name);

        if (entry) {
          const { bytes, ...saved } = entry;

          room.entries.push({ bytes, entry: saved });
        }
        bindOwners(room, owners ?? []);
        bindScopes(room, scopes ?? []);
        if ((deletedIds?.length ?? 0) > 0 || (restoredIds?.length ?? 0) > 0) {
          applyDeletedIds(
            room,
            deletedIds ?? [],
            restoredIds ?? [],
            maxDeletedIdRows,
            maxDeletedIdBytes
          );
        }
        room.marks.set(mark.writer, mark);
        room.receipts.set(keyOf(receipt.key), receipt);
        if (entry && checkpoint) {
          room.checkpoints.push({
            at: entry.at,
            document: checkpoint.document,
            version: entry.version,
          });
          compact(room, checkpoint.compactBefore);
        }

        return room.floor;
      }),
  };
};
