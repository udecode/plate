import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getCollabStatePatches as editorGetCollabStatePatches,
  getLastCommit as editorGetLastCommit,
} from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  type Descendant,
  defineStateField,
  type EditorUpdateOptions,
} from '../src';

const paragraph = (text: string): Descendant => ({
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
    extensions: [history(), documentTitle, privateNote],
    initialValue: {
      children: [paragraph('body')],
      state: {
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

const remoteCollabOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve' },
  },
  tag: ['collaboration', 'remote-import'],
} satisfies EditorUpdateOptions;

describe('collab document state contract', () => {
  it('replays shared state patches remotely without local undo history', () => {
    const source = createDocumentStateEditor();
    const remote = createDocumentStateEditor();

    source.update(
      (tx) => {
        tx.setField(documentTitle, 'Q3 Plan');
      },
      { tag: ['local-edit', 'collab-export'] }
    );

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

    remote.update((tx) => {
      tx.operations.replay(sourceCommit.operations);
      tx.statePatches.replay(sourceCommit.statePatches);
    }, remoteCollabOptions);

    const remoteCommit = editorGetLastCommit(remote);
    assert(remoteCommit);
    assert.equal(readTitle(remote), 'Q3 Plan');
    assert.deepEqual(remoteCommit.operations, []);
    assert.deepEqual(remoteCommit.statePatches, sourceCommit.statePatches);
    assert.deepEqual(remoteCommit.tags, ['collaboration', 'remote-import']);
    assert.deepEqual(remoteCommit.metadata, remoteCollabOptions.metadata);
    assert.equal(historyUndoCount(remote), 0);
    assert.deepEqual(
      remote.read((state) => state.value.get()),
      source.read((state) => state.value.get())
    );
  });

  it('exports only shared state patches for collaboration payloads', () => {
    const source = createDocumentStateEditor();

    source.update(
      (tx) => {
        tx.setField(documentTitle, 'Q3 Plan');
        tx.setField(privateNote, 'draft only');
      },
      { tag: ['local-edit', 'collab-export'] }
    );

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
