import { DocumentChange } from '../../core/change/document-change';
import {
  type SetValued,
  judgeSpan,
  viewOfChange,
} from '../../core/change/effect-ledger';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import type {
  AnyEditor,
  Editor,
  EditorUpdateTransaction,
  Value,
} from '../../interfaces/editor';
import {
  type SyncClientMessage,
  type SyncEntry,
  type SyncHello,
  type SyncReceipt,
  type SyncServerMessage,
  type SyncSubmit,
  type SyncSubmitRefusal,
  SYNC_PROTOCOL,
  digestOf,
  documentOf,
  rebaseOver,
  sameDocument,
  setValuedIn,
  schemaFingerprintOf,
} from '../protocol';
import { type MalformedSubmit, readClientMessage } from './client-message';
import {
  readSyncGrant,
  type SyncAuthored,
  type SyncCover,
  type SyncGrant,
  type SyncStep,
  type SyncTakeBack,
} from './grant';
import { ownersToBind, seedOwnersOf } from './owners';
import type { ChangeOwner, StoredEntry, SyncStorage } from './storage';
import {
  type LaterEntry,
  putAllIndexOf,
  putEntryAt,
  takeBack,
} from './take-back';

const IDLE_MS = 60_000;
const CHECKPOINT_EVERY = 256;
const TAKE_BACK_SCAN = 256;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const REMOTE = { tags: ['collaboration', 'history-skip'] } as const;

export type { SyncGrant } from './grant';

export type SyncRequest = Readonly<{ room: string; token: string }>;

/**
 * What a connection holds between two messages, as plain data, so a host
 * whose platform drops its memory can keep the connection alive across it.
 */
export type SyncConnectionSnapshot =
  | Readonly<{ kind: 'closed' }>
  | Readonly<{
      broadcast: boolean;
      grant: SyncGrant | null;
      joined: Readonly<{ epoch: string; schema: string }> | null;
      kind: 'open';
      sentThrough: number;
      welcomedEpoch: string | null;
    }>;

export type SyncConnection = Readonly<{
  close: () => void;
  /** Settles once the message is handled, and rejects when storage fails. */
  receive: (data: string) => Promise<void>;
  snapshot: () => SyncConnectionSnapshot;
}>;

/**
 * Connects a socket. A `restored` snapshot reinstates a connection the host
 * kept across a restart without a new hello: nothing is sent or authorized.
 */
export type SyncConnect = (
  send: (data: string) => void,
  request: SyncRequest,
  restored?: SyncConnectionSnapshot
) => SyncConnection;

export type SyncServerOptions<
  V extends Value,
  TPlugins extends readonly unknown[],
> = Readonly<{
  /** Null refuses the connection. */
  authorize: (
    request: SyncRequest
  ) => Promise<SyncGrant | null> | SyncGrant | null;
  authored: SyncAuthored;
  /** A fresh headless editor with the schema every tab of the room uses. */
  editor: () => Editor<V, TPlugins>;
  storage: SyncStorage;
  /**
   * `idle` unloads a room 60 s after its last message. `host` never unloads,
   * for a host whose platform drops the whole server when it idles.
   */
  unload?: 'host' | 'idle';
}>;

type Peer = {
  deliver: (message: SyncServerMessage) => void;
  welcomedEpoch: string | null;
  open: boolean;
  sentThrough: number;
};

type LoadedRoom = {
  editor: AnyEditor;
  epoch: string;
  floor: number;
  head: number;
  headEntry: SyncEntry | null;
  isSetValued: SetValued;
  name: string;
  schema: string;
  serving: boolean;
  value: JsonEditorValue;
};

type Slot = {
  idle?: ReturnType<typeof setTimeout>;
  peers: Set<Peer>;
  pendingTurns: number;
  room: LoadedRoom | null;
  turn: Promise<unknown>;
};

type Member = Readonly<{ epoch: string; grant: SyncGrant; schema: string }>;

declare const coveredByGrant: unique symbol;

type CoveredStep = SyncStep &
  Readonly<{
    [coveredByGrant]: true;
    owners: readonly ChangeOwner[];
    structure: boolean;
  }>;

type Admission =
  | Readonly<{
      headValue: JsonEditorValue;
      kind: 'admitted';
      published: DocumentChange;
    }>
  | Readonly<{ kind: 'refused'; reason: SyncSubmitRefusal }>;

const attempt = <T>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

const refusal = (
  { seq, writer }: Readonly<{ seq: number; writer: string }>,
  reason: SyncSubmitRefusal,
  version: number
): SyncReceipt => ({
  reason,
  seq,
  status: 'refused',
  type: 'receipt',
  version,
  writer,
});

const entryOf = ({ change, seq, version, writer }: StoredEntry): SyncEntry => ({
  change,
  seq,
  version,
  writer,
});

const valueOf = (editor: AnyEditor): JsonEditorValue =>
  documentOf(editor.read.value());

const servesSchema = (room: LoadedRoom, schema: string) =>
  room.serving && schema === room.schema;

/**
 * The authority for sync rooms. It admits each batch once, in log order, and
 * answers every retry from the receipt it stored with the entry.
 */
export const createSyncServer = <
  V extends Value,
  TPlugins extends readonly unknown[],
>({
  authorize,
  authored,
  editor: createRoomEditor,
  storage,
  unload: unloadAfter = 'idle',
}: SyncServerOptions<V, TPlugins>) => {
  const slots = new Map<string, Slot>();

  const load = async (name: string): Promise<LoadedRoom> => {
    const editor = createRoomEditor();
    const schema = await schemaFingerprintOf(editor);
    const document = valueOf(editor);
    const stored = await storage.load(name, {
      checkpoint: { at: Date.now(), document, version: 0 },
      owners: () =>
        seedOwnersOf(authored.claimsIn(document), authored.decidedIn(document)),
      schema,
    });
    const room: LoadedRoom = {
      editor,
      epoch: stored.epoch,
      floor: stored.floor,
      head: stored.head,
      headEntry: null,
      isSetValued: setValuedIn(editor),
      name,
      schema,
      serving: false,
      value: document,
    };

    if (stored.schema !== schema) return room;

    const { baseValue } = await storedHistory(name, room.head);

    room.value = baseValue;
    serveFromHead(room);

    return room;
  };

  const serveFromHead = (room: LoadedRoom) => {
    const { editor, value } = room;
    const change = DocumentChange.between(valueOf(editor), value);

    if (!change.empty) {
      editor.update(REMOTE, (tx) => {
        tx.changes.apply(change);
      });
    }
    room.serving = sameDocument(valueOf(editor), value);
  };

  const renewEditor = (room: LoadedRoom) => {
    room.editor = createRoomEditor();
    serveFromHead(room);
  };

  const storedHistory = async (name: string, base: number) => {
    const checkpoint = await storage.checkpoint(name, base);

    if (!checkpoint) {
      throw new Error(`Room ${name} has no checkpoint at ${base}.`);
    }

    let baseValue: JsonEditorValue = checkpoint.document;
    const gap: Array<Readonly<{ change: DocumentChange; writer: string }>> = [];

    for (const entry of await storage.entries(name, checkpoint.version)) {
      const change = DocumentChange.fromJSON(entry.change);

      if (entry.version <= base) baseValue = change.apply(baseValue);
      else gap.push({ change, writer: entry.writer });
    }

    return { baseValue, gap };
  };

  const historyOf = (room: LoadedRoom, base: number) =>
    base === room.head
      ? { baseValue: room.value, gap: [] }
      : storedHistory(room.name, base);

  const unload = (name: string, slot: Slot) => {
    slot.room = null;
    if (
      slots.get(name) === slot &&
      slot.peers.size === 0 &&
      slot.pendingTurns === 0
    ) {
      clearTimeout(slot.idle);
      slots.delete(name);
    }
  };

  const touch = (name: string, slot: Slot) => {
    if (unloadAfter === 'host') return;
    clearTimeout(slot.idle);
    slot.idle = setTimeout(() => {
      slot.turn = slot.turn.then(() => {
        unload(name, slot);
      });
    }, IDLE_MS);
  };

  const slotOf = (name: string) => {
    let slot = slots.get(name);

    if (!slot) {
      slot = {
        peers: new Set(),
        pendingTurns: 0,
        room: null,
        turn: Promise.resolve(),
      };
      slots.set(name, slot);
    }

    return slot;
  };

  const refuseOtherEpochs = (room: LoadedRoom, slot: Slot) => {
    for (const peer of slot.peers) {
      if (peer.welcomedEpoch === room.epoch) continue;
      slot.peers.delete(peer);
      peer.deliver({ epoch: room.epoch, reason: 'epoch', type: 'refused' });
    }
  };

  const inRoom = <T>(
    name: string,
    fn: (room: LoadedRoom, slot: Slot) => Promise<T> | T
  ): Promise<T> => {
    const slot = slotOf(name);

    touch(name, slot);
    slot.pendingTurns += 1;

    const run = slot.turn.then(async () => {
      try {
        slot.room ??= await load(name);
        refuseOtherEpochs(slot.room, slot);

        return await fn(slot.room, slot);
      } catch (error) {
        slot.room = null;
        throw error;
      } finally {
        slot.pendingTurns -= 1;
      }
    });

    slot.turn = run.catch(() => {});

    return run;
  };

  const coveredStepOf = async (
    room: LoadedRoom,
    step: SyncStep,
    grant: SyncGrant,
    cover: SyncCover | null,
    head: JsonEditorValue | undefined
  ): Promise<
    CoveredStep | Extract<SyncSubmitRefusal, 'grant' | 'invalid' | 'lost'>
  > => {
    if (!cover) return 'invalid';
    if (cover.kind === 'stale') return 'lost';
    if (cover.kind === 'refused' || cover.kind === 'takes-back') return 'grant';

    const before = head ?? step.before;
    const logged = cover.change;
    const own = logged
      ? attempt(() => ({
          after: logged.apply(before),
          before,
          change: logged,
        }))
      : step;

    if (!own) return 'invalid';

    const changes = [...new Set(cover.claims.map(({ change }) => change))];
    const bound =
      changes.length === 0 ? [] : await storage.owners(room.name, changes);
    const owners = ownersToBind(cover.claims, bound, grant.actor);

    return owners
      ? ({ ...own, owners, structure: cover.structure === true } as CoveredStep)
      : 'grant';
  };

  const withdrawsOwn = async (
    room: LoadedRoom,
    rejected: readonly string[] | null,
    actor: string
  ) => {
    if (!rejected) return false;

    const owners = await storage.owners(room.name, rejected);

    return rejected.every((change) =>
      owners.some((owner) => owner.change === change && owner.author === actor)
    );
  };

  const takenBackStepOf = async (
    room: LoadedRoom,
    cover: SyncTakeBack,
    batch: SyncStep,
    grant: SyncGrant,
    writer: string
  ): Promise<CoveredStep | Extract<SyncSubmitRefusal, 'grant' | 'lost'>> => {
    if (
      !grant.decide &&
      !(await withdrawsOwn(room, cover.rejected, grant.actor))
    ) {
      return 'grant';
    }

    const from = Math.max(room.floor, room.head - TAKE_BACK_SCAN);
    const { baseValue, gap } = await storedHistory(room.name, from);
    const index = putAllIndexOf(
      gap.map(({ change }) => change),
      cover.set,
      cover.verdicts
    );

    if (index === null || gap[index].writer !== writer) return 'grant';

    const entries: LaterEntry[] = [];
    let value = baseValue;

    for (const { change, writer: by } of gap) {
      const after = change.apply(value);

      entries.push({ after, before: value, change, writer: by });
      value = after;
    }

    const change = takeBack(
      putEntryAt(entries, index),
      room.value,
      getCompiledEditorSchema(room.editor)
    );

    if (!change) return 'lost';

    const after = attempt(() => change.apply(room.value));

    if (!after || !sameDocument(after, batch.after)) return 'grant';

    const changes = [...new Set(cover.claims.map((claim) => claim.change))];
    const bound =
      changes.length === 0 ? [] : await storage.owners(room.name, changes);
    const owners = ownersToBind(cover.claims, bound, grant.actor);

    return owners
      ? ({
          after,
          before: room.value,
          change,
          owners,
          structure: false,
        } as CoveredStep)
      : 'grant';
  };

  const admit = (
    room: LoadedRoom,
    { after: expected, change }: CoveredStep
  ): Admission => {
    let published: DocumentChange | undefined;
    const stop = room.editor.subscribeCommit((commit) => {
      published = commit.changes;
    });

    try {
      room.editor.update(REMOTE, (tx) => {
        tx.changes.apply(change);
      });
    } catch {
      renewEditor(room);

      return { kind: 'refused', reason: 'invalid' };
    } finally {
      stop();
    }

    const commit = published;
    const headValue = commit && attempt(() => commit.apply(room.value));

    if (
      !commit ||
      !headValue ||
      !sameDocument(headValue, expected) ||
      !sameDocument(valueOf(room.editor), expected)
    ) {
      renewEditor(room);

      return { kind: 'refused', reason: 'normalized' };
    }

    return { headValue, kind: 'admitted', published: commit };
  };

  const settleIn = async (
    room: LoadedRoom,
    member: Member,
    submit: SyncSubmit
  ): Promise<SyncReceipt> => {
    const { base, seq, writer } = submit;
    const refuse = (reason: SyncSubmitRefusal) =>
      refusal(submit, reason, room.head);

    if (!servesSchema(room, member.schema)) return refuse('schema');
    if (member.epoch !== room.epoch) {
      return {
        epoch: room.epoch,
        reason: 'epoch',
        seq,
        status: 'refused',
        type: 'receipt',
        version: room.head,
        writer,
      };
    }

    const digest = await digestOf(submit);

    if (digest !== submit.digest) return refuse('digest');

    const bound = await storage.mark(room.name, writer);

    if (bound && bound.actor !== member.grant.actor) return refuse('writer');

    const key = { epoch: room.epoch, seq, writer };
    const prior = await storage.receipt(room.name, key);

    if (prior) {
      if (prior.digest !== digest) return refuse('reused');

      return {
        ...(prior.published ? { published: prior.published } : {}),
        seq,
        status: 'duplicate',
        type: 'receipt',
        version: prior.version,
        writer,
      };
    }

    if (base > room.head) return refuse('ahead');
    if (base < room.floor) return refuse('expired');

    const change = attempt(() => DocumentChange.fromJSON(submit.change));

    if (!change) return refuse('invalid');

    const { baseValue, gap } = await historyOf(room, base);

    const own = attempt(() => ({
      after: change.apply(baseValue),
      before: baseValue,
      change,
    }));

    if (!own) return refuse('invalid');

    const skipsOwnEntry = gap.some((entry) => entry.writer === writer);

    if (skipsOwnEntry) return refuse('invalid');

    const accepted = gap.map((entry) => entry.change);
    const rebased = () => {
      const rebase = attempt(() => rebaseOver(accepted, change, baseValue));

      if (!rebase) return 'invalid';
      if (rebase.kind !== 'rebased') return rebase.kind;

      const moved = rebase.change;

      return (
        attempt(() => ({
          after: moved.apply(room.value),
          before: room.value,
          change: moved,
        })) ?? 'invalid'
      );
    };
    const head = gap.length > 0 ? room.value : undefined;
    const schema = getCompiledEditorSchema(room.editor);
    const cover = attempt(() =>
      authored.covers(own, member.grant, schema, head)
    );
    const judged =
      cover?.kind === 'at-head' || (cover?.kind === 'takes-back' && head)
        ? rebased()
        : own;

    if (typeof judged === 'string') return refuse(judged);

    const covered =
      cover?.kind === 'takes-back'
        ? await takenBackStepOf(room, cover, judged, member.grant, writer)
        : await coveredStepOf(
            room,
            judged,
            member.grant,
            cover?.kind === 'at-head'
              ? attempt(() => authored.covers(judged, member.grant, schema))
              : cover,
            head
          );

    if (typeof covered === 'string') return refuse(covered);
    if (covered.structure && gap.length > 0) {
      const step = rebased();

      if (
        typeof step === 'string' ||
        !sameDocument(step.after, covered.after)
      ) {
        return refuse('lost');
      }
    }

    const logged = covered.change;
    const mark = { actor: member.grant.actor, writer };
    const judge = () =>
      judgeSpan({
        accepted: accepted.map(viewOfChange),
        base: baseValue,
        head: room.head,
        isSetValued: room.isSetValued,
        merged: [viewOfChange(logged)],
        own: [viewOfChange(change)],
      }).kind;

    if (logged.empty) {
      if (judge() !== 'held') return refuse('lost');

      await storage.settle(room.name, {
        mark,
        receipt: { digest, key, status: 'satisfied', version: room.head },
      });

      return {
        seq,
        status: 'satisfied',
        type: 'receipt',
        version: room.head,
        writer,
      };
    }
    if (gap.length > 0) {
      const verdict = judge();

      if (verdict === 'lost' || verdict === 'unjudged') return refuse('lost');
    }

    const admission = admit(room, covered);

    if (admission.kind === 'refused') return refuse(admission.reason);

    const published = admission.published.toJSON();
    const rewritten =
      JSON.stringify(published) === JSON.stringify(submit.change)
        ? {}
        : { published };
    const version = room.head + 1;
    const at = Date.now();

    await storage.settle(room.name, {
      entry: { at, change: published, seq, version, writer },
      mark,
      owners: covered.owners,
      receipt: { digest, key, status: 'accepted', version, ...rewritten },
    });

    room.head = version;
    room.headEntry = { change: published, seq, version, writer };
    room.value = admission.headValue;

    if (version % CHECKPOINT_EVERY === 0) {
      await storage.saveCheckpoint(room.name, {
        at,
        document: documentOf(room.value),
        version,
      });
      room.floor = await storage.compact(room.name, at - RETENTION_MS);
    }

    return {
      ...rewritten,
      seq,
      status: 'accepted',
      type: 'receipt',
      version,
      writer,
    };
  };

  const catchUpOf = async (
    room: LoadedRoom,
    version: number | null
  ): Promise<SyncServerMessage | null> => {
    if (version === room.head) return null;
    if (version !== null && version >= room.floor && version < room.head) {
      const entries = await storage.entries(room.name, version);

      return { entries: entries.map(entryOf), from: version, type: 'entries' };
    }

    return {
      document: documentOf(room.value),
      type: 'snapshot',
      version: room.head,
    };
  };

  const bringUp = async (room: LoadedRoom, slot: Slot) => {
    for (const peer of slot.peers) {
      if (peer.sentThrough === room.head) continue;

      const missed =
        room.headEntry && peer.sentThrough === room.head - 1
          ? ({
              entries: [room.headEntry],
              from: peer.sentThrough,
              type: 'entries',
            } as const)
          : await catchUpOf(room, peer.sentThrough);

      if (!slot.peers.has(peer)) continue;

      peer.sentThrough = room.head;
      if (missed) peer.deliver(missed);
    }
  };

  const writeTurn = <T>(name: string, fn: (room: LoadedRoom) => Promise<T>) =>
    inRoom(name, async (room, slot) => {
      await bringUp(room, slot);

      const result = await fn(room);

      await bringUp(room, slot);

      return result;
    });

  const welcome = async (
    room: LoadedRoom,
    slot: Slot,
    peer: Peer,
    version: number | null
  ) => {
    const missed = await catchUpOf(room, version);

    if (peer.open) slot.peers.add(peer);
    peer.welcomedEpoch = room.epoch;
    peer.sentThrough = room.head;
    peer.deliver({
      epoch: room.epoch,
      schema: room.schema,
      type: 'welcome',
      version: room.head,
    });

    if (missed) peer.deliver(missed);

    return peer.open ? { epoch: room.epoch, schema: room.schema } : null;
  };

  const connect: SyncConnect = (send, request, restored) => {
    const kept = restored?.kind === 'open' ? restored : null;
    let joined = kept?.joined ?? null;
    let grant = kept?.grant ?? null;
    let queue: Promise<unknown> = Promise.resolve();

    const leaveBroadcast = () => slots.get(request.room)?.peers.delete(peer);

    const close = () => {
      peer.open = false;
      joined = null;
      leaveBroadcast();

      const slot = slots.get(request.room);

      if (slot && !slot.room) unload(request.room, slot);
    };

    const peer: Peer = {
      deliver: (message) => {
        if (!peer.open) return;
        try {
          send(JSON.stringify(message));
        } catch {
          close();
        }
      },
      welcomedEpoch: kept?.welcomedEpoch ?? null,
      open: restored?.kind !== 'closed',
      sentThrough: kept?.sentThrough ?? 0,
    };

    if (kept?.broadcast) slotOf(request.room).peers.add(peer);

    const hello = async (message: SyncHello) => {
      joined = null;
      leaveBroadcast();

      if (message.protocol !== SYNC_PROTOCOL) {
        peer.deliver({ reason: 'protocol', type: 'refused' });

        return;
      }
      if (message.room !== request.room) {
        peer.deliver({ reason: 'room', type: 'refused' });

        return;
      }
      grant = readSyncGrant(await authorize(request));

      if (grant === null) {
        peer.deliver({ reason: 'unauthorized', type: 'refused' });

        return;
      }

      await inRoom(request.room, async (room, slot) => {
        if (!servesSchema(room, message.schema)) {
          peer.deliver({ reason: 'schema', type: 'refused' });
        } else if (message.epoch !== null && message.epoch !== room.epoch) {
          peer.deliver({ epoch: room.epoch, reason: 'epoch', type: 'refused' });
        } else {
          joined = await welcome(room, slot, peer, message.version);
        }
      });
    };

    const submit = async (message: SyncSubmit) => {
      const member = joined && grant !== null ? { ...joined, grant } : null;

      if (!member) {
        peer.deliver(refusal(message, 'hello', 0));

        return;
      }

      await writeTurn(request.room, async (room) => {
        const receipt = await settleIn(room, member, message);

        if (
          receipt.status === 'accepted' &&
          peer.sentThrough === receipt.version - 1
        ) {
          peer.sentThrough = receipt.version;
        }
        peer.deliver(receipt);
      });
    };

    const handle = async (message: MalformedSubmit | SyncClientMessage) => {
      if (message.type === 'hello') await hello(message);
      else if (message.type === 'submit') await submit(message);
      else peer.deliver(refusal(message, 'invalid', peer.sentThrough));
    };

    return {
      close,
      receive: (data) => {
        const message = readClientMessage(data);
        const run = queue.then(() => (message ? handle(message) : undefined));

        queue = run.catch(() => {});

        return run.then(() => {});
      },
      snapshot: () =>
        peer.open
          ? {
              broadcast: slots.get(request.room)?.peers.has(peer) ?? false,
              grant,
              joined,
              kind: 'open',
              sentThrough: peer.sentThrough,
              welcomedEpoch: peer.welcomedEpoch,
            }
          : { kind: 'closed' },
    };
  };

  /**
   * Runs `fn` on the room editor at the head, then admits its change as a
   * batch of its own, so a server edit passes the same checks a tab's does.
   */
  const update = (
    name: string,
    grant: SyncGrant,
    fn: (tx: EditorUpdateTransaction<V, TPlugins>) => void
  ) =>
    writeTurn(name, async (room): Promise<SyncReceipt | null> => {
      const writer = `server:${crypto.randomUUID()}`;

      if (!room.serving) {
        return refusal({ seq: 1, writer }, 'schema', room.head);
      }

      const editor: Editor<V, TPlugins> = room.editor;
      let changes: DocumentChange | undefined;
      const stop = editor.subscribeCommit((commit) => {
        ({ changes } = commit);
      });

      try {
        editor.update(fn);
      } finally {
        stop();
      }

      if (!changes) return null;

      renewEditor(room);

      const submit = {
        base: room.head,
        change: changes.toJSON(),
        seq: 1,
        writer,
      };
      return settleIn(
        room,
        { epoch: room.epoch, grant, schema: room.schema },
        { ...submit, digest: await digestOf(submit), type: 'submit' }
      );
    });

  return { connect, update };
};
