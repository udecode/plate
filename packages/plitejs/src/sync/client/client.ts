import { readAuthoredView } from '../../core/authored-runtime';
import {
  DocumentChange,
  withoutRetainedRecordSets,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getEditorLifetime } from '../../core/editor-lifetime';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { notifyObservers } from '../../core/lifecycle-error';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import {
  applyUnnamedDocumentChange,
  createEditorDocumentChangeBuilder,
  forgetEditorHistoryStep,
  isEditorHistoryRestore,
  isEditorPublishingCommit,
  mintEditorCommitHistoryStep,
  readEditorCommitHistoryStep,
  replaceEditorUndoStep,
} from '../../core/public-state';
import { publishEditorRefusal } from '../../core/refusal';
import { withoutUpdateTagContext } from '../../core/update-context';
import { REMOTE_UPDATE } from '../../core/update-policy';
import type { AnyEditor, EditorCommit } from '../../interfaces/editor';
import {
  documentOf,
  sameDocument,
  schemaFingerprintOf,
  setValuedIn,
} from '../protocol';
import { type Fits, shownValue } from './chain';
import {
  type ClaimedOutbox,
  claimOutboxes,
  lockOf,
  type SyncLocks,
  type SyncRelease,
} from './claim';
import { type SyncDecisionOf, syncDecider, syncJudge } from './decision';
import { type Landing, openLandingGate } from './landing';
import type {
  CommitDecision,
  OutboxRecord,
  OutboxStore,
  StepRebuild,
} from './outbox';
import {
  rebasedKept,
  refused,
  type SyncKeptAction,
  type SyncKeptResult,
} from './recovery';
import { type Clock, type SyncTransport, systemClock } from './transport';
import { createWriter, type SyncClientState } from './writer';

export type SyncClientDecisions = Readonly<{
  writesAuthored: (change: DocumentChange) => boolean;
  changesVerdicts: (change: DocumentChange) => boolean;
  decisionOf: SyncDecisionOf;
}>;

export type SyncClient = Readonly<{
  decide: (
    seq: number,
    action: SyncKeptAction,
    view: AnyEditor
  ) => Promise<SyncKeptResult>;
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
  let rewrote: Readonly<{
    asked: JsonEditorValue;
    shown: JsonEditorValue;
  }> | null = null;
  const showDocument = (document: JsonEditorValue) => {
    const current = documentOf(editor.read.value());

    if (
      rewrote &&
      sameDocument(rewrote.asked, document) &&
      sameDocument(rewrote.shown, current)
    ) {
      return 'rewritten';
    }

    const change = DocumentChange.between(current, document);

    if (change.empty) return 'exact';

    const shown = show(change, true);

    rewrote =
      shown === 'rewritten'
        ? { asked: document, shown: documentOf(editor.read.value()) }
        : null;

    return shown;
  };

  return { show, showDocument };
};

const noticeOutsideUpdate = (editor: AnyEditor, tell: () => void) => {
  let pending = false;
  let closed = false;
  const flush = () => {
    if (!pending) return;
    pending = false;
    withoutUpdateTagContext(editor, tell);
  };

  return {
    close: () => {
      closed = true;
      pending = false;
    },
    flush,
    flushOutermost: () => {
      if (!isEditorPublishingCommit(editor)) flush();
    },
    mark: () => {
      if (pending || closed) return;
      pending = true;
      queueMicrotask(flush);
    },
  };
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
  let destroyed = false;
  const notice = noticeOutsideUpdate(editor, () => {
    writerChanged();
    writer.send();
  });
  const changed = () => {
    if (destroyed) return;
    if (isEditorPublishingCommit(editor)) {
      notice.mark();
      return;
    }
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
  const rebuild = (entry: StepRebuild) => {
    if ('forget' in entry) {
      forgetEditorHistoryStep(editor, entry.step);
    } else {
      const blocks = blocksOf(entry.base);

      replaceEditorUndoStep(
        editor,
        entry.step,
        DocumentChange.fromJSON(entry.takeBack),
        (stepBase) => jsonEqual(blocksOf(stepBase), blocks)
      );
    }
  };

  const draining = new Map<Writer, SyncRelease>();
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
  const writerChanged = () => {
    gateDrainsOnEditor();
    changed();
  };
  const writer = createWriter({
    changed: writerChanged,
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

  const save = (commit: EditorCommit) => {
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
    notice.mark();
  };
  const gate = openLandingGate({
    capture: (commit, change) => {
      const rebuilds = isEditorHistoryRestore(editor, commit)
        ? writer.rebuilds()
        : [];

      if (change.empty && rebuilds.length === 0) return undefined;

      return () => {
        if (!change.empty) save(commit);
        for (const entry of rebuilds) rebuild(entry);
      };
    },
    editor,
    install: (prepared) => {
      if (!writer.land(prepared)) return false;
      notice.mark();

      return true;
    },
    keptAt: (seq) => writer.outbox().batches.find((batch) => batch.seq === seq),
    prepare: writer.prepareLand,
    stop: () => {
      notice.mark();
      writer.halt();
    },
  });
  const stop = editor.subscribeCommit(notice.flushOutermost);

  const teardown = () => {
    stop();
    gate.release();
    finish(writer, release);
    finishDrains();
  };
  let landing = false;
  const landNow = (next: Landing, view: AnyEditor) => {
    landing = true;
    try {
      return gate.land(next, view);
    } finally {
      landing = false;
      if (destroyed) teardown();
    }
  };

  const viewOf = (view: AnyEditor) =>
    getEditorRuntimeOwner(view) === getEditorRuntimeOwner(editor) &&
    getEditorLifetime(view) !== 'destroyed';

  const proposing = (view: AnyEditor) => {
    const authored = readAuthoredView(view);

    return (
      authored !== undefined &&
      'intent' in authored &&
      authored.intent === 'propose'
    );
  };

  const decideNow = (
    seq: number,
    action: SyncKeptAction,
    view: AnyEditor
  ): SyncKeptResult => {
    const kept = writer.outbox().batches.find((batch) => batch.seq === seq);

    if (destroyed || writer.state().stopped) return refused('stopped');
    if (kept?.state !== 'kept') return refused('missing');
    if (!viewOf(view)) return refused('view');
    if (action === 'discard') {
      writer.discard(seq);
      notice.mark();

      return { status: 'discarded' };
    }
    if (kept.decision) return refused('decision');
    if (proposing(view)) return refused('suggesting');

    const rebased = rebasedKept(
      writer.outbox(),
      kept,
      decisions.writesAuthored
    );

    if ('refused' in rebased) return refused(rebased.refused);
    if (rebased.authored) return refused('suggesting');
    if (sameDocument(rebased.draft, rebased.view)) return refused('unchanged');
    if (!sameDocument(editor.read.value(), rebased.view)) {
      return refused('stale');
    }

    const { landedSeq, refusal, thrown, verdict } = landNow(
      {
        change: rebased.change,
        draft: rebased.draft,
        head: rebased.view,
        kept,
        seq,
      },
      view
    );

    if (landedSeq !== undefined) {
      return {
        seq: landedSeq,
        status: 'applied',
        ...(thrown ? { threw: true } : {}),
      };
    }
    if (
      verdict === 'failed' ||
      verdict === 'rewritten' ||
      verdict === 'stopped'
    ) {
      return refused(verdict);
    }
    if (verdict === null && refusal === undefined && !thrown) {
      return refused('rewritten');
    }
    if (refusal !== undefined) {
      try {
        publishEditorRefusal(editor, refusal);
      } catch {
        return refused('blocked', true);
      }
    }

    return refused('blocked', thrown !== null);
  };

  let deciding: Promise<unknown> = Promise.resolve();

  writer.connect();

  return {
    decide: (seq, action, view) => {
      const decided = deciding.then(() => {
        try {
          return decideNow(seq, action, view);
        } finally {
          notice.flush();
        }
      });

      deciding = decided.catch(() => {});

      return decided;
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      notice.close();
      if (!landing) teardown();
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
