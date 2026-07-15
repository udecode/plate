import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getCollabStatePatches as editorGetCollabStatePatches,
  getLastCommit as editorGetLastCommit,
} from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  type Element,
  defineStateField,
  type EditorUpdatePolicy,
} from '@platejs/plite';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const documentTitle = defineStateField({
  key: 'document.title',
  collab: 'shared',
  history: 'push',
  initial: () => 'Untitled',
  persist: true,
});

const privateNote = defineStateField({
  key: 'document.private-note',
  collab: 'local',
  history: 'push',
  initial: () => '',
  persist: true,
});

const createDocumentStateEditor = () =>
  createEditor({
    extensions: [history(), documentTitle, privateNote] as const,
    initialValue: {
      children: [paragraph('body')],
      meta: {
        [documentTitle.key]: 'Q2 Plan',
        [privateNote.key]: '',
      },
    },
  });

const readTitle = (editor: ReturnType<typeof createDocumentStateEditor>) =>
  editor.read((state) => state.getField(documentTitle));

const historyUndoCount = (
  editor: ReturnType<typeof createDocumentStateEditor>
) => editor.read((state) => state.history.undos().length);

const remoteCollabTags = [
  'collaboration',
  'remote-import',
  'history-skip',
  'skip-dom-selection',
  'skip-selection-focus',
  'skip-scroll-into-view',
] as const;

const remoteCollabPolicy = {
  tags: remoteCollabTags,
} satisfies EditorUpdatePolicy;

describe('collab document meta contract', () => {
  it('replays shared state patches remotely without local undo history', () => {
    const source = createDocumentStateEditor();
    const remote = createDocumentStateEditor();

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });

    const sourceCommit = editorGetLastCommit(source);
    assert(sourceCommit);
    assert.deepEqual(sourceCommit.operations, []);
    assert.deepEqual(sourceCommit.statePatches, [
      {
        key: documentTitle.key,
        previousValue: 'Q2 Plan',
        value: 'Q3 Plan',
      },
    ]);
    assert.equal(historyUndoCount(source), 1);

    remote.update(remoteCollabPolicy, (tx) => {
      tx.operations.replay(sourceCommit.operations);
      tx.statePatches.replay(sourceCommit.statePatches);
    });

    const remoteCommit = editorGetLastCommit(remote);
    assert(remoteCommit);
    assert.equal(readTitle(remote), 'Q3 Plan');
    assert.deepEqual(remoteCommit.operations, []);
    assert.deepEqual(remoteCommit.statePatches, sourceCommit.statePatches);
    assert.deepEqual(remoteCommit.tags, remoteCollabTags);
    assert.equal(historyUndoCount(remote), 0);
    assert.deepEqual(
      remote.read((state) => state.value()),
      source.read((state) => state.value())
    );
  });

  it('exports only shared state patches for collaboration payloads', () => {
    const source = createDocumentStateEditor();

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
      tx.setField(privateNote, 'draft only');
    });

    const sourceCommit = editorGetLastCommit(source);
    assert(sourceCommit);
    assert.deepEqual(sourceCommit.statePatches, [
      {
        key: documentTitle.key,
        previousValue: 'Q2 Plan',
        value: 'Q3 Plan',
      },
      {
        key: privateNote.key,
        previousValue: '',
        value: 'draft only',
      },
    ]);
    assert.deepEqual(editorGetCollabStatePatches(source, sourceCommit), [
      {
        key: documentTitle.key,
        previousValue: 'Q2 Plan',
        value: 'Q3 Plan',
      },
    ]);
  });
});
