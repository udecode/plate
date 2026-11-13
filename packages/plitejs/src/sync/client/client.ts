import { DocumentChange } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { notifyObservers } from '../../core/lifecycle-error';
import { REMOTE_UPDATE } from '../../core/update-policy';
import type { AnyEditor } from '../../interfaces/editor';
import { documentOf, schemaFingerprintOf } from '../protocol';
import { shownValue } from './chain';
import type { OutboxRecord, OutboxStore } from './outbox';
import { type Clock, type SyncTransport, systemClock } from './transport';
import { createWriter, type SyncClientState } from './writer';

export type SyncClientDecisions = Readonly<{
  changesVerdicts: (change: DocumentChange) => boolean;
}>;

export type SyncClient = Readonly<{
  destroy: () => void;
  setOnline: (online: boolean) => void;
  state: () => SyncClientState;
  subscribe: (listener: () => void) => () => void;
}>;

export const openSyncClient = async ({
  actor,
  clock = systemClock,
  decisions,
  editor,
  reopen,
  room,
  store,
  transport,
}: Readonly<{
  actor: string;
  clock?: Clock;
  decisions: SyncClientDecisions;
  editor: AnyEditor;
  reopen?: string;
  room: string;
  store: OutboxStore;
  transport: SyncTransport;
}>): Promise<SyncClient> => {
  const schema = await schemaFingerprintOf(editor);
  const saved = reopen ? await store.load(reopen) : null;
  const reopened =
    saved && saved.head.actor === actor && saved.head.room === room
      ? saved
      : null;
  const record: OutboxRecord = reopened ?? {
    batches: [],
    confirmed: { document: documentOf(editor.read.value()), version: null },
    head: {
      actor,
      epoch: null,
      nextSeq: 1,
      offline: false,
      opened: clock.now(),
      room,
      writer: crypto.randomUUID(),
    },
  };

  const listeners = new Set<() => void>();
  const show = (change: DocumentChange) => {
    editor.update(REMOTE_UPDATE, (tx) => {
      tx.changes.apply(change);
    });
  };
  const showDocument = (document: JsonEditorValue) => {
    const change = DocumentChange.between(
      documentOf(editor.read.value()),
      document
    );

    if (!change.empty) show(change);
  };

  showDocument(shownValue(record.confirmed.document, record.batches));

  const writer = createWriter({
    changed: () => {
      notifyObservers(editor, listeners, 'snapshot-listener', (listener) =>
        listener()
      );
    },
    fresh: !reopened,
    record,
    schema,
    show,
    showDocument,
    store,
    transport,
  });
  const stop = editor.subscribeCommit((commit) => {
    if (commit.tags.includes('collaboration') || commit.changes.empty) return;
    writer.saveCommit(
      commit.changes,
      decisions.changesVerdicts(commit.changes)
    );
  });

  writer.connect();

  return {
    destroy: () => {
      stop();
      writer.destroy();
    },
    setOnline: (online) => writer.setOffline(!online),
    state: writer.state,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
};
