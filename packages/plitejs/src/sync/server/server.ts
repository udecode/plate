import {
  DocumentChange,
  type DocumentChangeJson,
  getV4Steps,
} from '../../core/change/document-change';
import type { DocumentSetPropertyResolver } from '../../core/change/root-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonNode,
} from '../../core/change/tokens';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import { applyDocumentChange } from '../../core/public-state';
import { parseScopedElementId } from '../../core/reserved-element-id';
import { bindSharedRoom } from '../../core/shared-room';
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
  SYNC_MAX_BEFORE_WELCOME_BYTES,
  SYNC_MAX_MESSAGE_BYTES,
  SYNC_PROTOCOL,
  digestOf,
  dispositionOf,
  documentOf,
  judgeV4DecisionSpan,
  measureMessage,
  rebaseOver,
  sameDocument,
  setValuedIn,
  schemaFingerprintOf,
} from '../protocol';
import { type MalformedSubmit, readClientMessage } from './client-message';
import {
  type ChangeClaim,
  readSyncGrant,
  type SyncAuthored,
  type SyncCover,
  type SyncGrant,
  type SyncJudgeView,
  type SyncStep,
  type SyncTakeBack,
} from './grant';
import { ownersToBind, seedOwnersOf } from './owners';
import type {
  ChangeOwner,
  Checkpoint,
  ScopeRecord,
  StoredEntry,
  StoredRoom,
  SyncStorage,
} from './storage';
import { checkV4Admission } from './v4-admission';
import {
  type LaterEntry,
  v4OwnTakeBack,
  v4PutAllIndexOf,
  v4PutEntryAt,
  v4TakeBack,
} from './v4-take-back';

const IDLE_MS = 60_000;
const CHECKPOINT_EVERY = 256;
const CHECKPOINT_BYTES = SYNC_MAX_MESSAGE_BYTES;
const READ_BYTES = CHECKPOINT_BYTES + SYNC_MAX_MESSAGE_BYTES;
const TAKE_BACK_SCAN = 256;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_WAITING = 8;
const MAX_REFUSED = MAX_WAITING;
const MAX_WAITING_BYTES =
  SYNC_MAX_MESSAGE_BYTES + SYNC_MAX_BEFORE_WELCOME_BYTES;

const REMOTE = { tags: ['collaboration', 'history-skip'] } as const;
const SERVER_WRITER = 'server';

const seedScopesOf = (document: JsonEditorValue): readonly ScopeRecord[] => {
  const seen = new Map<string, number>();
  const visit = (nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (typeof node.id === 'string') {
        const parsed = parseScopedElementId(node.id);

        if (parsed) {
          const prior = seen.get(parsed.scope);

          if (prior === undefined || parsed.counter > prior) {
            seen.set(parsed.scope, parsed.counter);
          }
        }
      }
      visit(node.children);
    }
  };

  visit(document.children);
  if (document.roots) {
    for (const nodes of Object.values(document.roots)) {
      visit(nodes);
    }
  }

  return [...seen.entries()].map(([scope, maxCounter]) => ({
    maxCounter,
    scope,
    writer: null,
  }));
};

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
      refused: number;
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
  /**
   * Optional checkpoint interval in entries (default 256).
   */
  checkpointEvery?: number;
  /**
   * The most bytes of change JSON the room logs in one entry, at most and by
   * default `SYNC_MAX_MESSAGE_BYTES`.
   */
  maxChangeBytes?: number;
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
  checkpointed: number;
  editor: AnyEditor;
  epoch: string;
  floor: number;
  head: number;
  headEntry: SyncEntry | null;
  isSetValued: DocumentSetPropertyResolver;
  logged: number;
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
    judge?: SyncJudgeView;
    matchesRebased?: (
      rebased: JsonEditorValue,
      decided: JsonEditorValue
    ) => boolean;
    owners: readonly ChangeOwner[];
    structure: boolean;
  }>;

type Admission =
  | Readonly<{
      bytes: number;
      headValue: JsonEditorValue;
      kind: 'admitted';
      published: DocumentChangeJson;
      text: string;
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
  checkpointEvery = CHECKPOINT_EVERY,
  editor: createEditor,
  maxChangeBytes = SYNC_MAX_MESSAGE_BYTES,
  storage,
  unload: unloadAfter = 'idle',
}: SyncServerOptions<V, TPlugins>) => {
  if (
    !Number.isSafeInteger(maxChangeBytes) ||
    maxChangeBytes <= 0 ||
    maxChangeBytes > SYNC_MAX_MESSAGE_BYTES
  ) {
    throw new RangeError(
      `maxChangeBytes must be a whole number from 1 to ${SYNC_MAX_MESSAGE_BYTES}.`
    );
  }

  const createRoomEditor = () => {
    const editor = createEditor();

    bindSharedRoom(editor);

    return editor;
  };
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
      scopes: () => seedScopesOf(document),
    });
    const room: LoadedRoom = {
      checkpointed: stored.floor,
      editor,
      epoch: stored.epoch,
      floor: stored.floor,
      head: stored.head,
      headEntry: null,
      isSetValued: setValuedIn(editor),
      logged: 0,
      name,
      schema,
      serving: false,
      value: document,
    };

    if (stored.schema !== schema) return room;

    const checkpoint = await checkpointAt(name, room.head);
    const { baseValue } = await replay(name, checkpoint, room.head);

    room.value = baseValue;
    room.checkpointed = checkpoint.version;
    room.logged = await storage.logged(name, checkpoint.version);
    serveFromHead(room);

    return room;
  };

  const serveFromHead = (room: LoadedRoom) => {
    const { editor, value } = room;
    const change = DocumentChange.between(valueOf(editor), value);

    if (!change.empty) {
      editor.update(REMOTE, () => {
        applyDocumentChange(getEditorRuntimeOwner(editor), change);
      });
    }
    room.serving = sameDocument(valueOf(editor), value);
  };

  const renewEditor = (room: LoadedRoom) => {
    room.editor = createRoomEditor();
    serveFromHead(room);
  };

  const checkpointAt = async (name: string, version: number) => {
    const checkpoint = await storage.checkpoint(name, version);

    if (!checkpoint) {
      throw new Error(`Room ${name} has no checkpoint at ${version}.`);
    }

    return checkpoint;
  };

  const replay = async (name: string, checkpoint: Checkpoint, base: number) => {
    let baseValue: JsonEditorValue = checkpoint.document;
    const gap: Array<Readonly<{ change: DocumentChange; writer: string }>> = [];

    for (const entry of await storage.entries(name, checkpoint.version)) {
      const change = DocumentChange.fromJSON(entry.change);

      if (entry.version <= base) baseValue = change.apply(baseValue);
      else gap.push({ change, writer: entry.writer });
    }

    return { baseValue, gap };
  };

  const storedHistory = async (room: LoadedRoom, base: number) => {
    if (
      base < room.floor ||
      base < (await storage.reach(room.name, READ_BYTES))
    ) {
      return null;
    }

    const [at] = await storage.checkpoints(room.name, base);

    if (at === undefined) return null;

    return replay(room.name, await checkpointAt(room.name, at), base);
  };

  const historyOf = (room: LoadedRoom, base: number) =>
    base === room.head
      ? { baseValue: room.value, gap: [] }
      : storedHistory(room, base);

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
      ? ({
          ...own,
          ...(cover.judge ? { judge: cover.judge } : {}),
          ...(cover.matchesRebased
            ? { matchesRebased: cover.matchesRebased }
            : {}),
          owners,
          structure: cover.structure === true,
        } as CoveredStep)
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

  const recentEntries = async (room: LoadedRoom) => {
    const from = Math.max(room.floor, room.head - TAKE_BACK_SCAN);
    const [reach, checkpoints] = await Promise.all([
      storage.reach(room.name, READ_BYTES),
      storage.checkpoints(room.name, from),
    ]);
    const at = checkpoints.find((version) => version >= reach);

    if (at === undefined) return null;

    const { baseValue, gap } = await replay(
      room.name,
      await checkpointAt(room.name, at),
      Math.max(at, from)
    );
    const entries: LaterEntry[] = [];
    let value = baseValue;

    for (const { change, writer } of gap) {
      const after = change.apply(value);

      entries.push({ after, before: value, change, writer });
      value = after;
    }

    return entries;
  };

  const takenBackStep = async (
    room: LoadedRoom,
    change: DocumentChange,
    after: JsonEditorValue,
    claims: readonly ChangeClaim[],
    actor: string
  ): Promise<CoveredStep | 'grant'> => {
    const changes = [...new Set(claims.map((claim) => claim.change))];
    const bound =
      changes.length === 0 ? [] : await storage.owners(room.name, changes);
    const owners = ownersToBind(claims, bound, actor);

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

    const entries = await recentEntries(room);

    if (!entries) return 'grant';

    const index = v4PutAllIndexOf(
      entries.map(({ change }) => change),
      cover.set,
      cover.verdicts
    );

    if (index === null || entries[index].writer !== writer) return 'grant';

    const change = v4TakeBack(
      v4PutEntryAt(entries, index),
      room.value,
      getCompiledEditorSchema(room.editor)
    );

    if (!change) return 'lost';

    const after = attempt(() => change.apply(room.value));

    if (!after || !sameDocument(after, batch.after)) return 'grant';

    return takenBackStep(room, change, after, cover.claims, grant.actor);
  };

  const ownTakenBackStepOf = async (
    room: LoadedRoom,
    batch: SyncStep,
    grant: SyncGrant,
    writer: string
  ): Promise<CoveredStep | 'grant'> => {
    const entries = await recentEntries(room);
    const change =
      entries &&
      v4OwnTakeBack(
        entries,
        writer,
        grant,
        authored.covers,
        room.value,
        batch.after,
        getCompiledEditorSchema(room.editor)
      );

    const after = change && attempt(() => change.apply(room.value));

    if (!change || !after) return 'grant';

    const held = new Set(
      authored.claimsIn(room.value).map((claim) => claim.change)
    );

    return takenBackStep(
      room,
      change,
      after,
      authored.claimsIn(batch.after).filter((claim) => !held.has(claim.change)),
      grant.actor
    );
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
      room.editor.update(REMOTE, () => {
        applyDocumentChange(getEditorRuntimeOwner(room.editor), change);
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

    const json = commit.toJSON();
    const text = JSON.stringify(json);
    const bytes = measureMessage(text, maxChangeBytes);

    if (bytes === null) {
      renewEditor(room);

      return { kind: 'refused', reason: 'size' };
    }

    return { bytes, headValue, kind: 'admitted', published: json, text };
  };

  const settleIn = async (
    room: LoadedRoom,
    member: Member,
    submit: SyncSubmit,
    source: 'peer' | 'server' = 'peer'
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

    if (source === 'peer' && writer === SERVER_WRITER) return refuse('writer');

    const writerMark = await storage.mark(room.name, writer);

    if (
      source === 'peer' &&
      writerMark &&
      writerMark.actor !== member.grant.actor
    ) {
      return refuse('writer');
    }

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

    const history = await historyOf(room, base);

    if (!history) return refuse('expired');

    const { baseValue, gap } = history;
    const own = attempt(() => ({
      after: change.apply(baseValue),
      before: baseValue,
      change,
    }));

    if (!own) return refuse('invalid');

    const skipsOwnEntry = gap.some((entry) => entry.writer === writer);

    if (skipsOwnEntry) return refuse('invalid');

    const accepted = gap.map((entry) => entry.change);
    let rebasedSatisfied = false;
    const rebased = () => {
      const rebase = attempt(() => rebaseOver(accepted, change, baseValue));

      if (!rebase) return 'invalid';
      if (rebase.kind === 'v4-escalation') return 'lost';
      if (rebase.kind !== 'rebased') return rebase.kind;

      rebasedSatisfied = rebase.satisfied;

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
      authored.covers(
        own,
        member.grant,
        schema,
        head && { gap: accepted, value: head }
      )
    );
    const judged =
      cover?.kind === 'at-head' || (cover?.kind === 'takes-back' && head)
        ? rebased()
        : own;

    if (typeof judged === 'string') return refuse(judged);

    const judgedCover =
      cover?.kind === 'at-head'
        ? attempt(() => authored.covers(judged, member.grant, schema))
        : cover;
    const isTakeBack =
      judgedCover?.kind === 'takes-back' ||
      (judgedCover?.kind === 'refused' && judgedCover.why.kind === 'uncovered');
    const covered =
      judgedCover?.kind === 'takes-back'
        ? await takenBackStepOf(room, judgedCover, judged, member.grant, writer)
        : judgedCover?.kind === 'refused' &&
            judgedCover.why.kind === 'uncovered'
          ? await ownTakenBackStepOf(room, judged, member.grant, writer)
          : await coveredStepOf(room, judged, member.grant, judgedCover, head);

    if (typeof covered === 'string') return refuse(covered);
    if (covered.structure && gap.length > 0) {
      const step = rebased();
      const matches = covered.matchesRebased ?? sameDocument;

      if (typeof step === 'string' || !matches(step.after, covered.after)) {
        return refuse('lost');
      }
    }

    const logged = covered.change;
    const mark =
      source === 'server'
        ? { actor: SERVER_WRITER, writer: SERVER_WRITER }
        : { actor: member.grant.actor, writer };
    const judgeDecision = () => {
      const ownChange = covered.judge?.own ?? change;
      const mergedChange = covered.judge?.merged ?? logged;

      return judgeV4DecisionSpan({
        accepted,
        base: baseValue,
        isSetValued: room.isSetValued,
        merged: mergedChange,
        own: ownChange,
      });
    };

    if (logged.empty) {
      const emptyHeld = covered.judge
        ? judgeDecision() === 'held'
        : gap.length === 0 || change.empty || rebasedSatisfied;

      if (!emptyHeld) return refuse('lost');

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
    if (
      gap.length > 0 &&
      covered.judge &&
      dispositionOf(judgeDecision(), 'live') !== 'send'
    ) {
      return refuse('lost');
    }

    const admission = admit(room, covered);

    if (admission.kind === 'refused') return refuse(admission.reason);

    const { bytes, headValue, published } = admission;
    const version = room.head + 1;
    const v4Check = await checkV4Admission({
      after: headValue,
      before: room.value,
      grant: member.grant,
      isRoomDecisionReplay: covered.judge !== undefined,
      isTakeBack,
      roomName: room.name,
      source,
      steps: getV4Steps(logged) ?? published.steps ?? [],
      storage,
      version,
      writer,
    });

    if (!v4Check.ok) {
      renewEditor(room);

      return refuse(v4Check.reason);
    }

    const rewritten =
      admission.text === JSON.stringify(submit.change) ? {} : { published };
    const at = Date.now();
    const due =
      version - room.checkpointed >= checkpointEvery ||
      room.logged + bytes >= CHECKPOINT_BYTES;

    room.floor = await storage.settle(room.name, {
      ...(due
        ? {
            checkpoint: {
              compactBefore: at - RETENTION_MS,
              document: documentOf(headValue),
            },
          }
        : {}),
      ...(v4Check.deletedIds.length > 0
        ? { deletedIds: v4Check.deletedIds }
        : {}),
      entry: { at, bytes, change: published, seq, version, writer },
      mark,
      owners: covered.owners,
      receipt: { digest, key, status: 'accepted', version, ...rewritten },
      ...(v4Check.restoredIds.length > 0
        ? { restoredIds: v4Check.restoredIds }
        : {}),
      ...(v4Check.scopes.length > 0 ? { scopes: v4Check.scopes } : {}),
    });

    room.head = version;
    room.headEntry = { change: published, seq, version, writer };
    room.value = headValue;
    room.checkpointed = due ? version : room.checkpointed;
    room.logged = due ? 0 : room.logged + bytes;

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
    if (
      version !== null &&
      version >= room.floor &&
      version < room.head &&
      version >= (await storage.reach(room.name, READ_BYTES))
    ) {
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
    let refused = kept?.refused ?? 0;
    let queue: Promise<unknown> = Promise.resolve();
    const waiting: Array<Readonly<{ bytes: number; data: string }>> = [];
    let waitingBytes = 0;

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
      refused = 0;
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

      if (!member || refused >= MAX_REFUSED) {
        peer.deliver(refusal(message, 'hello', 0));

        return;
      }

      await writeTurn(request.room, async (room) => {
        const receipt = await settleIn(room, member, message);

        if (receipt.status === 'refused') refused += 1;
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
        const bytes = measureMessage(
          data,
          peer.welcomedEpoch === null
            ? SYNC_MAX_BEFORE_WELCOME_BYTES
            : SYNC_MAX_MESSAGE_BYTES
        );

        if (bytes === null) {
          peer.deliver({ reason: 'size', type: 'refused' });

          return Promise.resolve();
        }
        if (
          waiting.length === MAX_WAITING ||
          waitingBytes + bytes > MAX_WAITING_BYTES ||
          waiting.some((other) => other.data === data)
        ) {
          return Promise.resolve();
        }

        waiting.push({ bytes, data });
        waitingBytes += bytes;

        const run = queue.then(() => {
          waiting.shift();
          waitingBytes -= bytes;

          const message = readClientMessage(data);

          return message ? handle(message) : undefined;
        });

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
              refused,
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
      const writer = SERVER_WRITER;
      const seq = (await storage.lastSeq(room.name, writer)) + 1;

      if (!room.serving) {
        return refusal({ seq, writer }, 'schema', room.head);
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
        seq,
        writer,
      };
      return settleIn(
        room,
        { epoch: room.epoch, grant, schema: room.schema },
        { ...submit, digest: await digestOf(submit), type: 'submit' },
        'server'
      );
    });

  /**
   * Atomically resets a room's stored epoch and history to the current
   * schema's initial document, refusing any peers still attached to the prior
   * epoch so they reconnect cleanly.
   */
  const resetEpoch = (name: string): Promise<StoredRoom> => {
    const slot = slotOf(name);

    touch(name, slot);
    slot.pendingTurns += 1;

    const run = slot.turn.then(async () => {
      try {
        const editor = createRoomEditor();
        const schema = await schemaFingerprintOf(editor);
        const document = valueOf(editor);
        const stored = await storage.reset(name, {
          checkpoint: { at: Date.now(), document, version: 0 },
          owners: () =>
            seedOwnersOf(
              authored.claimsIn(document),
              authored.decidedIn(document)
            ),
          schema,
          scopes: () => seedScopesOf(document),
        });
        const room: LoadedRoom = {
          checkpointed: stored.floor,
          editor,
          epoch: stored.epoch,
          floor: stored.floor,
          head: stored.head,
          headEntry: null,
          isSetValued: setValuedIn(editor),
          logged: 0,
          name,
          schema,
          serving: false,
          value: document,
        };

        serveFromHead(room);
        slot.room = room;
        refuseOtherEpochs(room, slot);

        return stored;
      } catch (error) {
        slot.room = null;
        throw error;
      } finally {
        slot.pendingTurns -= 1;
        if (slot.pendingTurns === 0 && !slot.room && slot.peers.size === 0) {
          unload(name, slot);
        }
      }
    });

    slot.turn = run.catch(() => {});

    return run;
  };

  return { connect, resetEpoch, update };
};
