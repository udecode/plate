import {
  DocumentChange,
  rebaseDocumentChange,
} from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import {
  digestOf,
  measureMessage,
  SYNC_MAX_MESSAGE_BYTES,
  SYNC_PROTOCOL,
  SYNC_REBASE,
  type SyncEntry,
  type SyncJoinRefusal,
  type SyncReceipt,
  type SyncSubmit,
  sameDocument,
} from '../protocol';
import {
  type CrossAs,
  crossChain,
  type KeepAs,
  leaving,
  type ShownBatch,
  shownValue,
  withdrawn,
} from './chain';
import { MOVED, type SyncDecide } from './decision';
import {
  applyWrite,
  type KeptReason,
  mergeWrites,
  type OutboxRecord,
  type OutboxStore,
  type OutboxWrite,
  type SavedBatch,
} from './outbox';
import type { SyncEvent, SyncLink, SyncTransport } from './transport';

export type SyncStop =
  | Readonly<{ epoch: string; kind: 'epoch' }>
  | Readonly<{ kind: 'ahead' }>
  | Readonly<{ kind: 'invalid' }>
  | Readonly<{ kind: 'join'; reason: SyncJoinRefusal }>
  | Readonly<{ kind: 'schema' }>;

export type SyncClientState = Readonly<{
  joined: boolean;
  kept: ReadonlyArray<Readonly<{ reason: KeptReason; seq: number }>>;
  offline: boolean;
  saveFailed: boolean;
  stalled: boolean;
  stopped: SyncStop | null;
  unsent: number;
  version: number | null;
  writer: string;
}>;

type SentBatch = Extract<SavedBatch, { state: 'sent' }>;
type InFlight = Extract<SavedBatch, { state: 'sent' | 'withheld' }>;

const queueWrites = (
  store: OutboxStore,
  writer: string,
  saved: (ok: boolean) => void
) => {
  let pending: OutboxWrite | null = null;
  let queued = 0;
  let durable = 0;
  let writing = false;
  const waiting = new Map<number, () => void>();
  const idlers: Array<() => void> = [];

  const settled = () => {
    if (writing) return;
    for (const idle of idlers.splice(0)) idle();
  };

  const flush = () => {
    if (writing || !pending) return;

    const write = pending;
    const revision = queued;

    pending = null;
    writing = true;
    new Promise<void>((resolve) => {
      resolve(store.write(writer, write));
    }).then(
      () => {
        writing = false;
        durable = revision;
        for (const [at, resolve] of waiting) {
          if (at > durable) continue;
          waiting.delete(at);
          resolve();
        }
        saved(true);
        flush();
        settled();
      },
      () => {
        writing = false;
        if (pending) {
          pending = mergeWrites(write, pending);
          flush();
        } else {
          pending = write;
        }
        saved(false);
        settled();
      }
    );
  };

  return {
    add: (write: OutboxWrite) => {
      pending = pending ? mergeWrites(pending, write) : write;
      queued += 1;
      flush();

      return queued;
    },
    durable: (revision: number) =>
      revision <= durable
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            waiting.set(revision, resolve);
          }),
    retrySaves: () =>
      new Promise<void>((resolve) => {
        let tried = false;
        const idle = () => {
          if (writing) {
            idlers.push(idle);
          } else if (pending && !tried) {
            tried = true;
            flush();
            idlers.push(idle);
          } else {
            resolve();
          }
        };

        idle();
      }),
  };
};

const frameChangeOf = (frame: string) =>
  DocumentChange.fromJSON(JSON.parse(frame).change);

const replaced = (
  before: readonly SavedBatch[],
  after: readonly SavedBatch[]
) => after.filter((batch, index) => batch !== before[index]);

type Shown = 'exact' | 'rewritten';

const takenBackAt = (
  batch: ShownBatch,
  takeBack: DocumentChange,
  afterDecision: JsonEditorValue,
  beforeBatch: JsonEditorValue
): KeptReason | ShownBatch => {
  const rebase = rebaseDocumentChange(
    DocumentChange.between(afterDecision, beforeBatch),
    takeBack,
    afterDecision,
    SYNC_REBASE
  );

  return rebase.kind === 'pair'
    ? { ...batch, change: rebase.b.toJSON() }
    : MOVED;
};

export const createWriter = ({
  changed,
  decide,
  fresh,
  record: opened,
  schema,
  settledDecision,
  show,
  showDocument,
  store,
  takeBack,
  transport,
}: Readonly<{
  changed: () => void;
  decide: SyncDecide;
  fresh: boolean;
  record: OutboxRecord;
  schema: string;
  settledDecision?: (
    seq: number,
    logged: DocumentChange | null,
    before: JsonEditorValue
  ) => void;
  show: (change: DocumentChange) => Shown;
  showDocument: (document: JsonEditorValue) => Shown;
  store: OutboxStore;
  takeBack: (logged: DocumentChange, before: JsonEditorValue) => DocumentChange;
  transport: SyncTransport;
}>) => {
  let record = opened;
  let link: SyncLink | null = null;
  let joined = false;
  let target: number | null = null;
  let freezing = false;
  let saveFailed = false;
  let stalled = false;
  let stopped: SyncStop | null = null;
  let destroyed = false;
  let drifted = false;

  const writes = queueWrites(store, record.head.writer, (ok) => {
    if (destroyed || saveFailed === !ok) return;
    saveFailed = !ok;
    changed();
  });

  const save = (write: OutboxWrite) => {
    record = applyWrite(record, write);

    return writes.add(write);
  };

  const inFlight = () =>
    record.batches.find(
      (batch): batch is InFlight =>
        batch.state === 'sent' || batch.state === 'withheld'
    );

  let savedFrame = inFlight()?.frame ?? null;

  if (fresh) save({ confirmed: record.confirmed, head: record.head });

  const release = () => {
    const sent = inFlight();

    if (!sent || sent.frame !== savedFrame) return;
    if (measureMessage(sent.frame, SYNC_MAX_MESSAGE_BYTES) !== null) {
      link?.hold(sent.frame);
    } else {
      keep(sent, { kind: 'size' });
      changed();
    }
  };

  const stop = (reason: SyncStop) => {
    stopped = reason;
    joined = false;
    link?.close();
    link = null;
    if (reason.kind === 'epoch' || reason.kind === 'ahead') {
      save({ head: { ...record.head, stopped: true } });
    }
  };

  const movedDecision: KeepAs = (batch) =>
    batch.decision &&
    (batch.state === 'saved' ||
      (batch.state === 'sent' && batch.frame !== savedFrame))
      ? MOVED
      : null;

  const redecided: CrossAs = (batch, before, carried) => {
    if (carried.empty) return null;
    if (batch.state !== 'saved' || !batch.origin) return movedDecision(batch);

    const origin = {
      ...batch.origin,
      since: [...batch.origin.since, carried.toJSON()],
    };
    const decided = decide(origin, carried.apply(before));

    return decided instanceof DocumentChange
      ? { ...batch, change: decided.toJSON(), origin }
      : decided;
  };

  const redecidedIn = (batches: readonly SavedBatch[]): CrossAs => {
    const takenBack = new Set(
      batches.flatMap((batch) =>
        batch.state === 'saved' && batch.takesBackSeq !== undefined
          ? [batch.takesBackSeq]
          : []
      )
    );

    return (batch, before, carried) => {
      if (carried.empty || batch.state !== 'saved') {
        return redecided(batch, before, carried);
      }
      if (batch.takesBackSeq !== undefined) return null;
      if (takenBack.has(batch.seq)) return MOVED;

      return redecided(batch, before, carried);
    };
  };

  const crossOrWithdraw = (
    batches: readonly SavedBatch[],
    document: JsonEditorValue,
    crossing: () => ReturnType<typeof crossChain>,
    keepAs?: KeepAs
  ) => {
    try {
      const crossed = crossing();

      if (!crossed.carried.empty && show(crossed.carried) === 'rewritten') {
        drifted = true;
      }

      return replaced(batches, crossed.batches);
    } catch {
      drifted = showDocument(document) === 'rewritten';

      return replaced(batches, withdrawn(batches, keepAs));
    }
  };

  const showExactly = () => {
    if (!drifted) return;
    drifted =
      showDocument(shownValue(record.confirmed.document, record.batches)) ===
      'rewritten';
  };

  const settle = (
    batch: InFlight,
    logged: DocumentChange | null,
    version: number
  ) => {
    const before = record.confirmed.document;
    const shown =
      batch.state === 'sent'
        ? DocumentChange.fromJSON(batch.change).apply(before)
        : before;
    const document = logged ? logged.apply(before) : before;
    const tail = record.batches.filter(({ seq }) => seq !== batch.seq);
    const carried = DocumentChange.between(shown, document);
    const crossAs = redecidedIn(tail);
    const takesThisBack = (other: SavedBatch) =>
      other.state === 'saved' && other.takesBackSeq === batch.seq;
    const roomTakeBack =
      batch.state === 'sent' && logged && tail.some(takesThisBack)
        ? takeBack(logged, before)
        : null;

    save({
      confirmed: { document, version },
      drop: [batch.seq],
      put: crossOrWithdraw(
        tail,
        document,
        () =>
          crossChain(carried, shown, tail, (other, at, moved) =>
            roomTakeBack && takesThisBack(other)
              ? takenBackAt(other, roomTakeBack, document, moved.apply(at))
              : crossAs(other, at, moved)
          ),
        movedDecision
      ),
    });
    showExactly();
    if (batch.decision) settledDecision?.(batch.seq, logged, before);
    stalled = false;
    link?.hold(null);
  };

  const keep = (batch: InFlight, reason: KeptReason) => {
    if (batch.state === 'withheld') {
      save({
        put: [
          {
            change: frameChangeOf(batch.frame).toJSON(),
            decision: batch.decision,
            frame: batch.frame,
            reason,
            seq: batch.seq,
            state: 'kept',
          },
        ],
      });
    } else {
      const at = record.confirmed.document;
      const crossAs = redecidedIn(record.batches);
      const refused: CrossAs = (other, before, carried) =>
        other.seq === batch.seq ? reason : crossAs(other, before, carried);

      save({
        put: crossOrWithdraw(
          record.batches,
          at,
          () =>
            crossChain(
              DocumentChange.between(at, at),
              at,
              record.batches,
              refused
            ),
          (other) => (other.seq === batch.seq ? reason : movedDecision(other))
        ),
      });
      showExactly();
    }
    stalled = false;
    link?.hold(null);
  };

  const cross = (change: DocumentChange, version: number) => {
    const at = record.confirmed.document;
    const document = change.apply(at);

    save({
      confirmed: { document, version },
      put: crossOrWithdraw(
        record.batches,
        document,
        () =>
          crossChain(change, at, record.batches, redecidedIn(record.batches)),
        movedDecision
      ),
    });
    showExactly();
  };

  const install = (entries: readonly SyncEntry[]) => {
    for (const entry of entries) {
      const { version } = record.confirmed;

      if (version !== null && entry.version <= version) continue;
      if (version === null || entry.version !== version + 1) {
        link?.rejoin();

        return;
      }

      const change = DocumentChange.fromJSON(entry.change);
      const sent = inFlight();

      if (entry.writer === record.head.writer && sent?.seq === entry.seq) {
        settle(sent, change, entry.version);
      } else cross(change, entry.version);
    }
  };

  const installSnapshot = (document: JsonEditorValue, version: number) => {
    if (sameDocument(document, record.confirmed.document)) {
      save({ confirmed: { document, version } });
      showExactly();

      return;
    }

    const batches = record.batches.map((batch): SavedBatch => {
      if (batch.state === 'saved') return leaving(batch, { kind: 'expired' });
      if (batch.state === 'sent') return leaving(batch, movedDecision(batch));

      return batch;
    });

    drifted = showDocument(document) === 'rewritten';
    save({
      confirmed: { document, version },
      put: replaced(record.batches, batches),
    });
  };

  const answer = (receipt: SyncReceipt) => {
    const batch = inFlight();
    const { version } = record.confirmed;

    if (
      !batch ||
      version === null ||
      receipt.writer !== record.head.writer ||
      receipt.seq !== batch.seq
    ) {
      return;
    }

    if (receipt.status === 'refused') {
      if (receipt.reason === 'hello') {
        joined = false;
        link?.rejoin();
      } else if (receipt.reason === 'epoch') {
        stop({ epoch: receipt.epoch, kind: 'epoch' });
      } else if (receipt.reason === 'ahead' || receipt.reason === 'schema') {
        stop({ kind: receipt.reason });
      } else if (receipt.reason === 'size') {
        keep(batch, { kind: 'size' });
      } else {
        keep(batch, { kind: 'refused', reason: receipt.reason });
      }
    } else if (receipt.version > version + 1) {
      link?.rejoin();
    } else if (receipt.status === 'satisfied' || receipt.version <= version) {
      settle(batch, null, version);
    } else {
      settle(
        batch,
        receipt.published
          ? DocumentChange.fromJSON(receipt.published)
          : frameChangeOf(batch.frame),
        receipt.version
      );
    }
  };

  const sendable = () => {
    const front = record.batches.find((batch) => batch.state !== 'kept');
    const base = record.confirmed.version;

    return destroyed ||
      stopped ||
      !link ||
      !joined ||
      stalled ||
      record.head.offline ||
      target === null ||
      base === null ||
      base < target ||
      front?.state !== 'saved'
      ? null
      : { base, front };
  };

  const freeze = async () => {
    if (freezing) return;
    freezing = true;
    try {
      for (let next = sendable(); next; next = sendable()) {
        const { base, front } = next;
        const { change, decision, seq } = front;
        const { writer } = record.head;
        const digest = await digestOf({ change, seq, writer });
        const still = sendable();

        if (still?.front !== front || still.base !== base) continue;

        const submit: SyncSubmit = {
          base,
          change,
          digest,
          seq,
          type: 'submit',
          writer,
        };
        const sent: SentBatch = {
          change,
          decision,
          frame: JSON.stringify(submit),
          seq,
          state: 'sent',
        };

        await writes.durable(save({ put: [sent] }));
        if (destroyed) return;
        savedFrame = sent.frame;
        changed();
        release();
      }
    } finally {
      freezing = false;
    }
  };

  const receive = (event: SyncEvent) => {
    if (destroyed || stopped) return;
    try {
      switch (event.type) {
        case 'closed': {
          joined = false;
          stalled = false;
          break;
        }
        case 'entries': {
          install(event.entries);
          break;
        }
        case 'receipt': {
          answer(event);
          break;
        }
        case 'refused': {
          stop(
            event.reason === 'epoch'
              ? { epoch: event.epoch, kind: 'epoch' }
              : { kind: 'join', reason: event.reason }
          );
          break;
        }
        case 'snapshot': {
          installSnapshot(event.document, event.version);
          break;
        }
        case 'unanswered': {
          stalled = true;
          break;
        }
        case 'welcome': {
          const { version } = record.confirmed;

          if (version !== null && event.version < version) {
            stop({ kind: 'ahead' });
            break;
          }
          joined = true;
          target = event.version;
          if (record.head.epoch === null) {
            save({ head: { ...record.head, epoch: event.epoch } });
          }
          break;
        }
      }
    } catch {
      stop({ kind: 'invalid' });
    }
    changed();
    void freeze();
  };

  const connect = () => {
    if (link || stopped || destroyed || record.head.offline) return;
    stalled = false;
    link = transport.connect({
      hello: () => ({
        epoch: record.head.epoch,
        protocol: SYNC_PROTOCOL,
        room: record.head.room,
        schema,
        type: 'hello',
        version: record.confirmed.version,
      }),
      receive,
    });
    release();
  };

  return {
    connect,
    destroy: () => {
      destroyed = true;
      link?.close();
      link = null;
    },
    retrySaves: writes.retrySaves,
    saveCommit: (
      change: DocumentChange,
      decision: boolean,
      takesBackSeq?: number
    ) => {
      if (destroyed) return null;

      const { batches, confirmed, head } = record;
      const json = change.toJSON();
      const origin =
        decision && takesBackSeq === undefined
          ? {
              before: shownValue(confirmed.document, batches),
              change: json,
              since: [],
            }
          : undefined;

      save({
        head: { ...head, nextSeq: head.nextSeq + 1 },
        put: [
          {
            change: json,
            decision,
            ...(origin ? { origin } : {}),
            ...(takesBackSeq === undefined ? {} : { takesBackSeq }),
            seq: head.nextSeq,
            state: 'saved',
          },
        ],
      });
      changed();
      void freeze();

      return head.nextSeq;
    },
    setOffline: (offline: boolean) => {
      if (destroyed) return;
      save({ head: { ...record.head, offline } });
      if (offline) {
        joined = false;
        link?.close();
        link = null;
      } else {
        connect();
      }
      changed();
    },
    state: (): SyncClientState => ({
      joined,
      kept: record.batches.flatMap((batch) =>
        batch.state === 'kept' ? [{ reason: batch.reason, seq: batch.seq }] : []
      ),
      offline: record.head.offline,
      saveFailed,
      stalled,
      stopped,
      unsent: record.batches.filter((batch) => batch.state !== 'kept').length,
      version: record.confirmed.version,
      writer: record.head.writer,
    }),
  };
};
