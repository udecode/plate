import type { OutboxRecord, OutboxStore } from './outbox';
import type { Clock } from './transport';

export type SyncRelease = () => void;

/**
 * A lock per outbox, as Web Locks gives: it frees when its holder releases it
 * or the page that holds it goes away.
 */
export type SyncLocks = Readonly<{
  hold: (name: string, signal: AbortSignal) => Promise<SyncRelease | null>;
  holdIfFree: (name: string) => Promise<SyncRelease | null>;
}>;

export type ClaimedOutbox = Readonly<{
  record: OutboxRecord;
  release: SyncRelease;
}>;

const OWN_LOCK_WAIT = 2000;

export const lockOf = (writer: string) => `editor-sync:${writer}`;

const holdsUnsent = (record: OutboxRecord) =>
  record.batches.some(({ state }) => state !== 'kept');

export const claimOutboxes = async ({
  actor,
  clock,
  locks,
  reopen,
  room,
  store,
}: Readonly<{
  actor: string;
  clock: Clock;
  locks: SyncLocks;
  reopen?: string;
  room: string;
  store: OutboxStore;
}>) => {
  const claimed: ClaimedOutbox[] = [];
  const ours = (record: OutboxRecord | null): record is OutboxRecord =>
    record !== null &&
    !record.head.stopped &&
    record.head.actor === actor &&
    record.head.room === room;
  const claimAfterReload = async (
    writer: string,
    release: SyncRelease | null,
    keep: (record: OutboxRecord) => boolean
  ) => {
    if (!release) return;

    try {
      const record = await store.load(writer);

      if (ours(record) && keep(record)) claimed.push({ record, release });
      else release();
    } catch (error) {
      release();
      throw error;
    }
  };

  try {
    if (reopen) {
      const giveUp = new AbortController();
      const cancel = clock.wait(OWN_LOCK_WAIT, () => giveUp.abort());
      const release = await locks.hold(lockOf(reopen), giveUp.signal);

      cancel();
      await claimAfterReload(reopen, release, () => true);
    }

    const records = await store.list(room);
    const listed = records
      .filter((record) => ours(record) && holdsUnsent(record))
      .sort((a, b) => a.head.opened - b.head.opened);

    for (const { head } of listed) {
      await claimAfterReload(
        head.writer,
        await locks.holdIfFree(lockOf(head.writer)),
        holdsUnsent
      );
    }

    return claimed;
  } catch (error) {
    for (const { release } of claimed) release();
    throw error;
  }
};
