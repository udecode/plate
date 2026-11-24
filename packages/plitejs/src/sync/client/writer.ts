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
  hiddenPast,
  isShown,
  type KeepAs,
  leaving,
  shownAt,
  type ShownBatch,
  shownValue,
  superseded,
  takeBackGroups,
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

export type PreparedLand = Readonly<{
  drop: number;
  nextSeq: number;
  put: UnsentBatch;
}>;
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
) => {
  const was = new Map(before.map((batch) => [batch.seq, batch]));

  return after.filter((batch) => batch !== was.get(batch.seq));
};

/**
 * Steps a save leaves on the wrong history stack. Each batch of a step moves it
 * between the stacks, so once every batch of a step still on the device has
 * ended kept, an odd number of them leaves it out of place: a kept decision
 * alone leaves an undo that takes it back a second time, while a kept decision
 * and its kept undo leave a redo that applies it once.
 */
const misplacedSteps = (
  before: readonly SavedBatch[],
  after: readonly SavedBatch[]
): StepRebuild[] => {
  const now = new Map(after.map((batch) => [batch.seq, batch]));
  const merged = new Set(
    after.flatMap((batch) =>
      batch.state !== 'kept' && batch.mergedInto ? [batch.mergedInto] : []
    )
  );
  const steps = new Set(
    before.flatMap((batch) => {
      const step = batch.decision?.step;
      const state = now.get(batch.seq)?.state;

      return step &&
        batch.state !== 'kept' &&
        (state === undefined || state === 'kept')
        ? [step]
        : [];
    })
  );

  return [...steps].flatMap((step) => {
    const ofStep = after.filter((batch) => batch.decision?.step === step);

    return ofStep.length % 2 === 1 &&
      ofStep.every((batch) => batch.state === 'kept') &&
      !merged.has(step)
      ? [{ forget: true, step }]
      : [];
  });
};

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
  asOpened,
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
  asOpened: (document: JsonEditorValue) => JsonEditorValue;
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
    if (destroyed) return 0;

    const before = record.batches;

    record = applyWrite(record, write);

    const forgets = misplacedSteps(before, record.batches);

    if (forgets.length === 0) return writes.add(write);

    const rebuilds = [...record.rebuilds, ...forgets];

    record = { ...record, rebuilds };

    const queued = writes.add({ ...write, rebuilds });

    for (const entry of forgets) rebuild?.(entry);

    return queued;
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

  const caughtUp = () =>
    joined &&
    target !== null &&
    record.confirmed.version !== null &&
    record.confirmed.version >= target &&
    !record.head.offline;

  let savedFrame = inFlight()?.frame ?? null;
  let handedFrame = savedFrame;

  if (fresh) save({ confirmed: record.confirmed, head: record.head });

  const handOut = () => {
    if (joined && inFlight()?.frame === savedFrame) handedFrame = savedFrame;
  };

  const release = () => {
    const sent = inFlight();

    if (!sent || sent.frame !== savedFrame) return;
    if (measureMessage(sent.frame, SYNC_MAX_MESSAGE_BYTES) !== null) {
      link?.hold(sent.frame);
      handOut();
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

  const redecidedIn = (
    batches: readonly SavedBatch[],
    groups: ReadonlyMap<number, number>
  ): CrossAs => {
    const takenBack = new Set(
      batches.flatMap((batch) =>
        batch.state === 'saved' &&
        batch.takesBackSeq !== undefined &&
        !groups.has(batch.seq)
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
    at: JsonEditorValue,
    document: JsonEditorValue,
    crossing: (fitting?: Fits) => ReturnType<typeof crossChain>,
    keepAs?: KeepAs
  ) => {
    const shown = (crossed: ReturnType<typeof crossChain>) => {
      if (!crossed.carried.empty && show(crossed.carried) === 'rewritten') {
        drifted = true;
      }

      return {
        drop: crossed.dropped,
        put: replaced(batches, crossed.batches),
      };
    };

    try {
      return shown(crossing());
    } catch {
      try {
        return shown(crossing(fits));
      } catch {
        drifted = showDocument(document) === 'rewritten';

        return {
          drop: [],
          put: replaced(batches, withdrawn(batches, at, keepAs)),
        };
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
    const carried = DocumentChange.between(shown, document);
    const takesThisBack = (other: SavedBatch): other is UnsentBatch =>
      other.state === 'saved' && other.takesBackSeq === batch.seq;
    const roomTakeBack =
      batch.state === 'sent' && logged && tail.some(takesThisBack)
        ? takeBack(logged, before)
        : null;
    const groups = takeBackGroups(tail);
    const crossAs = redecidedIn(tail, groups);
    const crossed = crossOrWithdraw(
      tail,
      shown,
      document,
      (fitting) =>
        crossChain(carried, shown, tail, {
          cancels: groups,
          crossAs: (other, at, moved) =>
            roomTakeBack && takesThisBack(other)
              ? takenBackAt(other, roomTakeBack, document, moved.apply(at))
              : crossAs(other, at, moved),
          fits: fitting,
        }),
      movedDecision
    );
    const entry =
      rebuild && logged
        ? rebuildOf(
            batch,
            logged,
            before,
            document,
            tail.filter((other) => !crossed.drop.includes(other.seq))
          )
        : null;
    const ahead = new Map(
      tail.flatMap((other) =>
        other.seq < batch.seq && !isShown(other)
          ? [[other.seq, logged ? hiddenPast(other, logged) : other] as const]
          : []
      )
    );

    save({
      confirmed: { document, version },
      drop: [batch.seq, ...crossed.drop],
      put: [
        ...marks,
        ...crossed.put.filter((other) => !ahead.has(other.seq)),
        ...ahead.values(),
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
            ...(batch.origin ? { origin: batch.origin } : {}),
            reason: conflicted ? conflictOn(batch.records) : reason,
            state: 'kept',
          },
        ],
      });
    } else {
      const at = record.confirmed.document;
      const groups = takeBackGroups(record.batches);
      const crossAs = redecidedIn(record.batches, groups);
      const refused: CrossAs = (other, before, carried) =>
        other.seq === batch.seq ? reason : crossAs(other, before, carried);

      save(
        crossOrWithdraw(
          record.batches,
          at,
          at,
          (fitting) =>
            crossChain(DocumentChange.between(at, at), at, record.batches, {
              cancels: groups,
              crossAs: refused,
              fits: fitting,
            }),
          (other) => (other.seq === batch.seq ? reason : movedDecision(other))
        )
      );
      showExactly();
    }
    stalled = false;
    link?.hold(null);
  };

  const cross = (change: DocumentChange, version: number) => {
    const at = record.confirmed.document;
    const document = change.apply(at);
    const batches = withConflictsOfTeammate(record.batches, change);
    const groups = takeBackGroups(batches);
    const crossed = crossOrWithdraw(
      batches,
      at,
      document,
      (fitting) =>
        crossChain(change, at, batches, {
          cancels: groups,
          crossAs: redecidedIn(batches, groups),
          fits: fitting,
        }),
      movedDecision
    );

    save({
      confirmed: { document, version },
      drop: crossed.drop,
      put: [...replaced(record.batches, batches), ...crossed.put],
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
    if (
      sameDocument(document, record.confirmed.document) ||
      sameDocument(asOpened(document), record.confirmed.document)
    ) {
      save({ confirmed: { document, version } });
      showExactly();

      return;
    }

    const groups = takeBackGroups(record.batches);
    const positions = shownAt(record.batches, record.confirmed.document);
    const batches = record.batches.flatMap((batch): SavedBatch[] => {
      if (!isShown(batch)) return [batch];
      if (groups.has(batch.seq)) return [];

      return [
        leaving(
          batch,
          positions.get(batch.seq),
          batch.state === 'saved' ? { kind: 'expired' } : movedDecision(batch)
        ),
      ];
    });

    drifted = showDocument(document) === 'rewritten';
    save({
      confirmed: { document, version },
      drop: [...groups.keys()],
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

  const putBack = (sent: SentBatch) => {
    save({
      put: [
        {
          ...provenanceOf(sent),
          change: sent.change,
          ...(sent.origin ? { origin: sent.origin } : {}),
          state: 'saved',
          ...(sent.takesBackSeq === undefined
            ? {}
            : { takesBackSeq: sent.takesBackSeq }),
        },
      ],
    });
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
          ...(front.takesBackSeq === undefined
            ? {}
            : { takesBackSeq: front.takesBackSeq }),
        };

        await writes.durable(save({ put: [sent] }));

        const now = batchAt(seq);

        if (destroyed) return;
        if (now !== sent || savedLive.has(seq) !== live) {
          if (now?.state === 'sent') {
            putBack(now);
          } else if (now?.state === 'withheld') {
            keep(now, { kind: 'conflict' });
            changed();
          }
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
          stalled = false;
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
    handOut();
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
    close: () => {
      const sent = inFlight();

      if (sent && sent.frame !== handedFrame) {
        if (sent.state === 'sent') putBack(sent);
        else keep(sent, { kind: 'conflict' });
      }
      destroyed = true;
      savedLive.clear();
      link?.close();
      link = null;

      return writes.retrySaves();
    },
    discard: (seq: number) => {
      save({ drop: [seq] });
    },
    halt: () => stop({ kind: 'invalid' }),
    land: ({ drop, nextSeq, put }: PreparedLand) => {
      if (destroyed) return false;
      if (caughtUp()) savedLive.add(put.seq);
      save({
        drop: [drop],
        head: { ...record.head, nextSeq },
        put: [put],
        ...forgetRebuilds(),
      });

      return true;
    },
    outbox: () => record,
    prepareLand: (seq: number, change: DocumentChange): PreparedLand => {
      if (batchAt(seq)?.state !== 'kept') {
        throw new Error(`The outbox keeps no batch ${seq}.`);
      }

      const { nextSeq } = record.head;

      return {
        drop: seq,
        nextSeq: nextSeq + 1,
        put: {
          change: change.toJSON(),
          decision: null,
          seq: nextSeq,
          state: 'saved',
        },
      };
    },
    rebuilds: () => record.rebuilds,
    saveCommit: (
      change: DocumentChange,
      made: CommitDecision | null,
      merged: string | null
    ) => {
      if (destroyed) return;

      const { batches, confirmed, head } = record;
      const json = change.toJSON();

      if (caughtUp()) savedLive.add(head.nextSeq);
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
    },
    send: () => {
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
