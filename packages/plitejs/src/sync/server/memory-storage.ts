import type {
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
  entries: StoredEntry[];
  epoch: string;
  floor: number;
  marks: Map<string, WriterMark>;
  receipts: Map<string, StoredReceipt>;
  schema: string;
};

const keyOf = ({ epoch, seq, writer }: ReceiptKey) =>
  JSON.stringify([epoch, writer, seq]);

const headOf = (room: MemoryRoom) => room.entries.at(-1)?.version ?? room.floor;

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

  return {
    checkpoint: (name, version) =>
      asStorageCall(
        () =>
          roomOf(name).checkpoints.findLast(
            (checkpoint) => checkpoint.version <= version
          ) ?? null
      ),
    compact: (name, before) =>
      asStorageCall(() => {
        const room = roomOf(name);
        const floor =
          room.checkpoints.findLast((checkpoint) => checkpoint.at < before)
            ?.version ?? room.floor;

        room.floor = Math.max(room.floor, floor);
        room.entries = room.entries.filter(
          (entry) => entry.version > room.floor
        );
        room.checkpoints = room.checkpoints.filter(
          (checkpoint) => checkpoint.version >= room.floor
        );

        return room.floor;
      }),
    entries: (name, version) =>
      asStorageCall(() =>
        roomOf(name).entries.filter((entry) => entry.version > version)
      ),
    load: (name, { checkpoint, schema }) =>
      asStorageCall(() => {
        const room = rooms.get(name) ?? {
          checkpoints: [checkpoint],
          entries: [],
          epoch: crypto.randomUUID(),
          floor: checkpoint.version,
          marks: new Map(),
          receipts: new Map(),
          schema,
        };

        rooms.set(name, room);

        return stored(room);
      }),
    mark: (name, writer) =>
      asStorageCall(() => roomOf(name).marks.get(writer) ?? null),
    receipt: (name, key) =>
      asStorageCall(() => roomOf(name).receipts.get(keyOf(key)) ?? null),
    saveCheckpoint: (name, checkpoint) =>
      asStorageCall(() => {
        roomOf(name).checkpoints.push(checkpoint);
      }),
    settle: (name, { entry, mark, receipt }) =>
      asStorageCall(() => {
        const room = roomOf(name);

        if (entry) room.entries.push(entry);
        room.marks.set(mark.writer, mark);
        room.receipts.set(keyOf(receipt.key), receipt);
      }),
  };
};
