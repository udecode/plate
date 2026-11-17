import {
  DocumentChange,
  withoutRetainedRecordSets,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { notifyObservers } from '../../core/lifecycle-error';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import {
  applyUnnamedDocumentChange,
  createEditorDocumentChangeBuilder,
  isEditorHistoryRestore,
  mintEditorCommitHistoryStep,
  readEditorCommitHistoryStep,
  replaceEditorUndoStep,
} from '../../core/public-state';
import { REMOTE_UPDATE } from '../../core/update-policy';
import type { AnyEditor } from '../../interfaces/editor';
import { documentOf, schemaFingerprintOf, setValuedIn } from '../protocol';
import { type Fits, shownValue } from './chain';
import {
  type ClaimedOutbox,
  claimOutboxes,
  lockOf,
  type SyncLocks,
  type SyncRelease,
} from './claim';
import { type SyncDecisionOf, syncDecider, syncJudge } from './decision';
import type {
  CommitDecision,
  OutboxRecord,
  OutboxStore,
  StepRebuild,
} from './outbox';
import { type Clock, type SyncTransport, systemClock } from './transport';
import { createWriter, type SyncClientState } from './writer';

export type SyncClientDecisions = Readonly<{
  changesVerdicts: (change: DocumentChange) => boolean;
  decisionOf: SyncDecisionOf;
}>;

export type SyncClient = Readonly<{
  destroy: () => void;
  setOnline: (online: boolean) => void;
  state: () => SyncClientState & Readonly<{ draining: number }>;
  subscribe: (listener: () => void) => () => void;
}>;

type Writer = ReturnType<typeof createWriter>;

type ClientOptions = Readonly<{
  actor: string;
  clock?: Clock;
  decisions: SyncClientDecisions;
  editor: AnyEditor;
  locks: SyncLocks;
  reopen?: string;
  room: string;
  store: OutboxStore;
  transport: SyncTransport;
}>;

const fitsIn =
  (editor: AnyEditor): Fits =>
  (before, change) => {
    try {
      editor.read.schema.assertDocument(before);
      createEditorDocumentChangeBuilder(editor, before).applyCanonical(change);

      return true;
    } catch {
      return false;
    }
  };

const blocksOf = (value: JsonEditorValue) => {
  const { records: _records, ...blocks } = documentOf(value);

  return blocks;
};

const showsIn = (editor: AnyEditor) => {
  const show = (change: DocumentChange, diffed = false) => {
    const committed: DocumentChange[] = [];
    const stop = editor.subscribeCommit((commit) => {
      committed.push(commit.changes);
    });

    try {
      editor.update(REMOTE_UPDATE, (tx) => {
        if (diffed) tx.changes.apply(change);
        else applyUnnamedDocumentChange(getEditorRuntimeOwner(editor), change);
      });
    } finally {
      stop();
    }

    return committed.length === 1 &&
      jsonEqual(committed[0].toJSON(), change.toJSON())
      ? 'exact'
      : 'rewritten';
  };
  const showDocument = (document: JsonEditorValue) => {
    const change = DocumentChange.between(
      documentOf(editor.read.value()),
      document
    );

    return change.empty ? 'exact' : show(change, true);
  };

  return { show, showDocument };
};

const startClient = (
  {
    actor,
    clock = systemClock,
    decisions,
    editor,
    room,
    store,
    transport,
  }: ClientOptions,
  {
    adopted,
    opened,
    release,
    schema,
    writerId,
  }: Readonly<{
    adopted: readonly ClaimedOutbox[];
    opened: OutboxRecord | null;
    release: SyncRelease;
    schema: string;
    writerId: string;
  }>
): SyncClient => {
  const record: OutboxRecord = opened ?? {
    batches: [],
    confirmed: { document: documentOf(editor.read.value()), version: null },
    head: {
      actor,
      epoch: null,
      nextSeq: 1,
      offline: false,
      opened: clock.now(),
      room,
      stopped: false,
      writer: writerId,
    },
    rebuilds: [],
  };

  const listeners = new Set<() => void>();
  const changed = () => {
    notifyObservers(editor, listeners, 'snapshot-listener', (listener) =>
      listener()
    );
  };
  const { show, showDocument } = showsIn(editor);
  const judge = syncJudge(setValuedIn(editor));
  const decide = syncDecider(
    (step) =>
      decisions.decisionOf(step, actor, getCompiledEditorSchema(editor)),
    judge
  );
  const fits = fitsIn(editor);
  const roomTakeBackOf = (logged: DocumentChange, before: JsonEditorValue) =>
    withoutRetainedRecordSets(
      logged.invert(before),
      getCompiledEditorSchema(editor).recordSets
    );
  const rebuild = ({ base, step, takeBack }: StepRebuild) => {
    const blocks = blocksOf(base);

    replaceEditorUndoStep(
      editor,
      step,
      DocumentChange.fromJSON(takeBack),
      (stepBase) => jsonEqual(blocksOf(stepBase), blocks)
    );
  };

  const draining = new Map<Writer, SyncRelease>();
  let destroyed = false;
  const finish = (done: Writer, free: SyncRelease) => {
    done.destroy();
    void done.retrySaves().then(free);
  };
  const finishDrains = () => {
    for (const [other, free] of draining) finish(other, free);
    draining.clear();
  };
  const gateDrainsOnEditor = () => {
    for (const other of draining.keys()) {
      const { joined, offline, stopped } = writer.state();

      if (stopped) {
        finishDrains();
        return;
      }
      if (!joined || offline) return;
      if (other.state().offline) other.setOffline(false);
      else other.connect();
    }
  };
  const writer = createWriter({
    changed: () => {
      gateDrainsOnEditor();
      changed();
    },
    decide,
    fits,
    fresh: !opened,
    judge,
    rebuild,
    record,
    schema,
    show,
    showDocument,
    store,
    takeBack: roomTakeBackOf,
    transport,
  });

  for (const claimed of adopted) {
    const other: Writer = createWriter({
      changed: () => {
        const { stopped, unsent } = other.state();

        if (draining.has(other) && (stopped || unsent === 0)) {
          draining.delete(other);
          finish(other, claimed.release);
        }
        changed();
      },
      decide,
      fits,
      fresh: false,
      judge,
      record: claimed.record,
      schema,
      show: () => 'exact',
      showDocument: () => 'exact',
      store,
      takeBack: roomTakeBackOf,
      transport,
    });

    draining.set(other, claimed.release);
  }

  for (const entry of writer.rebuilds()) rebuild(entry);

  const stop = editor.subscribeCommit((commit) => {
    if (isEditorHistoryRestore(editor, commit)) {
      for (const entry of writer.rebuilds()) rebuild(entry);
    }
    if (commit.tags.includes('collaboration') || commit.changes.empty) return;

    const verdicts = decisions.changesVerdicts(commit.changes);
    const step = (
      verdicts ? mintEditorCommitHistoryStep : readEditorCommitHistoryStep
    )(editor, commit);
    const decision: CommitDecision | null = !verdicts
      ? null
      : !step || step.how === 'merge'
        ? { kind: 'made', step: null }
        : { kind: step.how === 'push' ? 'made' : step.how, step: step.id };

    writer.saveCommit(
      commit.changes,
      decision,
      step?.how === 'merge' ? step.id : null
    );
  });

  writer.connect();

  return {
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      stop();
      finish(writer, release);
      finishDrains();
    },
    setOnline: (online) => {
      writer.setOffline(!online);
      if (online) return;
      for (const other of draining.keys()) other.setOffline(true);
    },
    state: () => ({ ...writer.state(), draining: draining.size }),
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
};

export const openSyncClient = async (
  options: ClientOptions
): Promise<SyncClient> => {
  const {
    actor,
    clock = systemClock,
    editor,
    locks,
    reopen,
    room,
    store,
  } = options;
  const claiming = claimOutboxes({ actor, clock, locks, reopen, room, store });
  const [schema, claimed] = await Promise.all([
    schemaFingerprintOf(editor),
    claiming,
  ]).catch(async (error: unknown) => {
    for (const { release } of await claiming.catch(() => [])) release();
    throw error;
  });
  const held = claimed.map(({ release }) => release);

  try {
    const { showDocument } = showsIn(editor);
    const shows = ({ record }: ClaimedOutbox) => {
      try {
        showDocument(shownValue(record.confirmed.document, record.batches));

        return true;
      } catch {
        return false;
      }
    };
    const [oldest] = claimed;
    const opened =
      oldest && !oldest.record.head.adoptOnly && shows(oldest)
        ? oldest
        : undefined;
    const adopted = claimed.filter((claim) => claim !== opened);
    const writerId = opened?.record.head.writer ?? crypto.randomUUID();
    const release =
      opened?.release ?? (await locks.holdIfFree(lockOf(writerId)));

    if (!release) throw new Error('A new outbox found its lock taken.');
    if (!opened) held.push(release);

    return startClient(options, {
      adopted,
      opened: opened?.record ?? null,
      release,
      schema,
      writerId,
    });
  } catch (error) {
    for (const free of held) free();
    throw error;
  }
};
