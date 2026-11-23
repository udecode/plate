import type {
  ChangeOwner,
  Checkpoint,
  ReceiptKey,
  StoredEntry,
  StoredReceipt,
  StoredRoom,
  SyncStorage,
  WriterMark,
} from './storage';

type MemoryRoom = {
  checkpoints: Checkpoint[];
  entries: Array<Readonly<{ bytes: number; entry: StoredEntry }>>;
  epoch: string;
  floor: number;
  marks: Map<string, WriterMark>;
  owners: Map<string, string | null>;
  receipts: Map<string, StoredReceipt>;
  schema: string;
};

const bindOwners = (room: MemoryRoom, owners: readonly ChangeOwner[]) => {
  for (const { author, change } of owners) {
    if (!room.owners.has(change)) room.owners.set(change, author);
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
export const memoryStorage = (): SyncStorage => {
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
    entries: (name, version) =>
      asStorageCall(() => after(name, version).map(({ entry }) => entry)),
    load: (name, { checkpoint, owners, schema }) =>
      asStorageCall(() => {
        let room = rooms.get(name);

        if (!room) {
          room = {
            checkpoints: [checkpoint],
            entries: [],
            epoch: crypto.randomUUID(),
            floor: checkpoint.version,
            marks: new Map(),
            owners: new Map(),
            receipts: new Map(),
            schema,
          };
          bindOwners(room, owners());
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
    settle: (name, { checkpoint, entry, mark, owners, receipt }) =>
      asStorageCall(() => {
        const room = roomOf(name);

        if (entry) {
          const { bytes, ...saved } = entry;

          room.entries.push({ bytes, entry: saved });
        }
        bindOwners(room, owners ?? []);
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
