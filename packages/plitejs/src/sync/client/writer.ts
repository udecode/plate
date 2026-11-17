import {
  DocumentChange,
  type DocumentChangeJson,
  rebaseDocumentChange,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue } from '../../core/change/tokens';
import {
  digestOf,
  dispositionOf,
  measureMessage,
  SYNC_MAX_MESSAGE_BYTES,
  SYNC_PROTOCOL,
  SYNC_REBASE,
  type SyncEntry,
  type SyncJoinRefusal,
  type SyncReceipt,
  type SyncSubmit,
  type SyncVerdict,
  sameDocument,
} from '../protocol';
import {
  batchToTakeBack,
  type CrossAs,
  crossChain,
  type Fits,
  frameChangeOf,
  type KeepAs,
  leaving,
  type ShownBatch,
  shownValue,
  superseded,
  withConflictsOfTeammate,
  withdrawn,
} from './chain';
import { MOVED, type SyncDecide, type SyncJudge } from './decision';
import {
  applyWrite,
  type BatchOrigin,
  type CommitDecision,
  conflictOn,
  type KeptReason,
  mergeWrites,
  type OutboxRecord,
  type OutboxStore,
  type OutboxWrite,
  provenanceOf,
  type SavedBatch,
  type StepRebuild,
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
type UnsentBatch = Extract<SavedBatch, { state: 'saved' }>;
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

const replaced = (
  before: readonly SavedBatch[],
  after: readonly SavedBatch[]
) => after.filter((batch, index) => batch !== before[index]);

type Shown = 'exact' | 'rewritten';

const takenBackAt = (
  { origin: _replaced, ...batch }: UnsentBatch,
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
  fits,
  fresh,
  judge,
  rebuild,
  record: opened,
  schema,
  show,
  showDocument,
  store,
  takeBack,
  transport,
}: Readonly<{
  changed: () => void;
  decide: SyncDecide;
  fits: Fits;
  fresh: boolean;
  judge: SyncJudge;
  rebuild?: (entry: StepRebuild) => void;
  record: OutboxRecord;
  schema: string;
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
  const savedLive = new Set<number>();

  const writes = queueWrites(store, record.head.writer, (ok) => {
    if (destroyed || saveFailed === !ok) return;
    saveFailed = !ok;
    changed();
  });

  const save = (write: OutboxWrite) => {
    record = applyWrite(record, write);

    return writes.add(write);
  };

  const forgetRebuilds = () =>
    record.rebuilds.length > 0 ? { rebuilds: [] } : {};

  const inFlight = () =>
    record.batches.find(
      (batch): batch is InFlight =>
        batch.state === 'sent' || batch.state === 'withheld'
    );

  const batchAt = (seq: number) =>
    record.batches.find((batch) => batch.seq === seq);

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
    savedLive.clear();
    link?.close();
    link = null;
    if (reason.kind === 'epoch' || reason.kind === 'ahead') {
      save({ head: { ...record.head, stopped: true } });
    } else if (reason.kind === 'invalid') {
      save({ head: { ...record.head, adoptOnly: true } });
    }
  };

  const movedDecision: KeepAs = (batch) =>
    batch.decision !== null &&
    (batch.state === 'saved' ||
      (batch.state === 'sent' && batch.frame !== savedFrame))
      ? MOVED
      : null;

  const redecided: CrossAs = (batch, before, carried) => {
    if (carried.empty) return null;
    if (
      batch.state !== 'saved' ||
      batch.decision?.kind !== 'made' ||
      !batch.origin
    ) {
      return movedDecision(batch);
    }

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
      if (batch.decision && batch.decision.kind !== 'made') return null;
      if (takenBack.has(batch.seq)) return MOVED;

      return redecided(batch, before, carried);
    };
  };

  const crossOrWithdraw = (
    batches: readonly SavedBatch[],
    document: JsonEditorValue,
    crossing: (fitting?: Fits) => ReturnType<typeof crossChain>,
    keepAs?: KeepAs
  ) => {
    const shown = (crossed: ReturnType<typeof crossChain>) => {
      if (!crossed.carried.empty && show(crossed.carried) === 'rewritten') {
        drifted = true;
      }

      return replaced(batches, crossed.batches);
    };

    try {
      return shown(crossing());
    } catch {
      try {
        return shown(crossing(fits));
      } catch {
        drifted = showDocument(document) === 'rewritten';

        return replaced(batches, withdrawn(batches, keepAs));
      }
    }
  };

  const showExactly = () => {
    if (!drifted) return;
    drifted =
      showDocument(shownValue(record.confirmed.document, record.batches)) ===
      'rewritten';
  };

  const rebuildOf = (
    batch: InFlight,
    logged: DocumentChange,
    before: JsonEditorValue,
    document: JsonEditorValue,
    tail: readonly SavedBatch[]
  ): StepRebuild | null => {
    const { decision } = batch;

    if (
      !decision?.step ||
      decision.kind === 'undo' ||
      jsonEqual(logged.toJSON(), decision.unrebased)
    ) {
      return null;
    }

    const { step } = decision;
    const later = tail.some(
      (other) =>
        other.seq > batch.seq &&
        (other.decision?.step === step || other.mergedInto === step)
    );

    return later
      ? null
      : {
          base: document,
          step,
          takeBack: takeBack(logged, before).toJSON(),
        };
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
    const marks = superseded(record.batches, batch);
    const marked = new Map(marks.map((mark) => [mark.seq, mark]));
    const tail = record.batches.flatMap((other) =>
      other.seq === batch.seq ? [] : [marked.get(other.seq) ?? other]
    );
    const entry =
      rebuild && logged
        ? rebuildOf(batch, logged, before, document, tail)
        : null;
    const carried = DocumentChange.between(shown, document);
    const crossAs = redecidedIn(tail);
    const takesThisBack = (other: SavedBatch): other is UnsentBatch =>
      other.state === 'saved' && other.takesBackSeq === batch.seq;
    const roomTakeBack =
      batch.state === 'sent' && logged && tail.some(takesThisBack)
        ? takeBack(logged, before)
        : null;

    save({
      confirmed: { document, version },
      drop: [batch.seq],
      put: [
        ...marks,
        ...crossOrWithdraw(
          tail,
          document,
          (fitting) =>
            crossChain(carried, shown, tail, {
              crossAs: (other, at, moved) =>
                roomTakeBack && takesThisBack(other)
                  ? takenBackAt(other, roomTakeBack, document, moved.apply(at))
                  : crossAs(other, at, moved),
              fits: fitting,
            }),
          movedDecision
        ),
      ],
      ...(entry ? { rebuilds: [...record.rebuilds, entry] } : {}),
    });
    showExactly();
    if (entry) rebuild?.(entry);
    stalled = false;
    link?.hold(null);
  };

  const keep = (batch: InFlight | UnsentBatch, reason: KeptReason) => {
    if (batch.state === 'withheld') {
      const conflicted =
        reason.kind === 'conflict' ||
        (reason.kind === 'refused' &&
          (reason.reason === 'record' || reason.reason === 'root-lifecycle'));

      save({
        put: [
          {
            ...provenanceOf(batch),
            change: frameChangeOf(batch.frame).toJSON(),
            frame: batch.frame,
            reason: conflicted ? conflictOn(batch.records) : reason,
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
          (fitting) =>
            crossChain(DocumentChange.between(at, at), at, record.batches, {
              crossAs: refused,
              fits: fitting,
            }),
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
    const batches = withConflictsOfTeammate(record.batches, change);

    save({
      confirmed: { document, version },
      put: [
        ...replaced(record.batches, batches),
        ...crossOrWithdraw(
          batches,
          document,
          (fitting) =>
            crossChain(change, at, batches, {
              crossAs: redecidedIn(batches),
              fits: fitting,
            }),
          movedDecision
        ),
      ],
      ...forgetRebuilds(),
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
      ...forgetRebuilds(),
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

  const verdictOf = (
    origin: BatchOrigin,
    change: DocumentChangeJson
  ): SyncVerdict => {
    try {
      return judge(origin, DocumentChange.fromJSON(change));
    } catch {
      return 'unjudged';
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
        const { change, origin, seq } = front;
        const live = savedLive.has(seq);
        const verdict = origin?.since.length
          ? verdictOf(origin, change)
          : 'held';
        const disposition = dispositionOf(verdict, live ? 'live' : 'offline');

        if (disposition !== 'send') {
          try {
            keep(front, { kind: 'judged', verdict: disposition });
          } catch {
            stop({ kind: 'invalid' });
          }
          changed();
          continue;
        }

        const { writer } = record.head;
        const digest = await digestOf({ change, seq, writer });
        const still = sendable();

        if (
          still?.front !== front ||
          still.base !== base ||
          savedLive.has(seq) !== live
        ) {
          continue;
        }

        const submit: SyncSubmit = {
          base,
          change,
          digest,
          seq,
          type: 'submit',
          writer,
        };
        const sent: SentBatch = {
          ...provenanceOf(front),
          change,
          frame: JSON.stringify(submit),
          ...(origin ? { origin } : {}),
          state: 'sent',
        };

        await writes.durable(save({ put: [sent] }));

        const now = batchAt(seq);

        if (destroyed || now !== sent || savedLive.has(seq) !== live) {
          if (now?.state === 'sent') {
            save({
              put: [
                {
                  ...provenanceOf(now),
                  change: now.change,
                  ...(now.origin ? { origin: now.origin } : {}),
                  state: 'saved',
                  ...(front.takesBackSeq === undefined
                    ? {}
                    : { takesBackSeq: front.takesBackSeq }),
                },
              ],
            });
          } else if (now?.state === 'withheld' && !destroyed) {
            keep(now, { kind: 'conflict' });
            changed();
          }
          if (destroyed) return;
          continue;
        }
        savedFrame = sent.frame;
        release();
        changed();
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
          savedLive.clear();
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
      savedLive.clear();
      link?.close();
      link = null;
    },
    rebuilds: () => record.rebuilds,
    retrySaves: writes.retrySaves,
    saveCommit: (
      change: DocumentChange,
      made: CommitDecision | null,
      merged: string | null
    ) => {
      if (destroyed) return;

      const { batches, confirmed, head } = record;
      const json = change.toJSON();

      if (
        joined &&
        target !== null &&
        confirmed.version !== null &&
        confirmed.version >= target &&
        !head.offline
      ) {
        savedLive.add(head.nextSeq);
      }
      const mergedInto =
        merged !== null &&
        batches.some(
          (batch) => batch.state !== 'kept' && batch.decision?.step === merged
        )
          ? merged
          : undefined;
      const takesBackSeq =
        made?.step && made.kind !== 'made'
          ? batchToTakeBack(batches, made.step)?.seq
          : undefined;
      const origin =
        made?.kind === 'made'
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
            decision:
              made === null || made.step === null
                ? made
                : { ...made, unrebased: json },
            ...(mergedInto === undefined ? {} : { mergedInto }),
            ...(origin ? { origin } : {}),
            ...(takesBackSeq === undefined ? {} : { takesBackSeq }),
            seq: head.nextSeq,
            state: 'saved',
          },
        ],
        ...forgetRebuilds(),
      });
      changed();
      void freeze();
    },
    setOffline: (offline: boolean) => {
      if (destroyed) return;
      save({ head: { ...record.head, offline } });
      if (offline) {
        joined = false;
        savedLive.clear();
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
