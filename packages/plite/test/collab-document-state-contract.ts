import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getCollabEffects as editorGetCollabEffects,
  getLastCommit as editorGetLastCommit,
} from '@platejs/plite/internal';

import { history } from '@platejs/plite-history';

import {
  createEditor,
  defineExtension,
  type Element,
  defineStateField,
  type EditorUpdatePolicy,
  valueCodecs,
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
  persist: valueCodecs.string,
});

const privateNote = defineStateField({
  key: 'document.private-note',
  collab: 'local',
  history: 'push',
  initial: () => '',
  persist: valueCodecs.string,
});

const documentStateExtension = defineExtension('document-state', {
  stateFields: [documentTitle, privateNote],
});

const createDocumentStateEditor = () =>
  createEditor({
    extensions: [history(), documentStateExtension] as const,
    initialValue: {
      children: [paragraph('body')],
      meta: {
        [documentTitle.key]: documentTitle.serialize('Q2 Plan'),
        [privateNote.key]: privateNote.serialize(''),
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
  it('replays shared effects remotely without local undo history', () => {
    const source = createDocumentStateEditor();
    const remote = createDocumentStateEditor();

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });

    const sourceCommit = editorGetLastCommit(source);
    assert(sourceCommit);
    assert.equal(sourceCommit.changes.empty, true);
    assert.deepEqual(sourceCommit.effects, [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q2 Plan', value: 'Q3 Plan' },
      },
    ]);
    assert.equal(historyUndoCount(source), 1);

    remote.update(remoteCollabPolicy, (tx) => {
      tx.changes.apply(sourceCommit.changes);
      for (const effect of editorGetCollabEffects(source, sourceCommit)) {
        tx.effects.emit(effect.type, effect.value);
      }
    });

    const remoteCommit = editorGetLastCommit(remote);
    assert(remoteCommit);
    assert.equal(readTitle(remote), 'Q3 Plan');
    assert.equal(remoteCommit.changes.empty, true);
    assert.deepEqual(remoteCommit.effects, sourceCommit.effects);
    assert.deepEqual(remoteCommit.tags, remoteCollabTags);
    assert.equal(historyUndoCount(remote), 0);
    assert.deepEqual(
      remote.read((state) => state.value()),
      source.read((state) => state.value())
    );
  });

  it('exports only shared effects for collaboration payloads', () => {
    const source = createDocumentStateEditor();

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
      tx.setField(privateNote, 'draft only');
    });

    const sourceCommit = editorGetLastCommit(source);
    assert(sourceCommit);
    assert.deepEqual(sourceCommit.effects, [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q2 Plan', value: 'Q3 Plan' },
      },
      {
        type: privateNote.effect,
        value: { previousValue: '', value: 'draft only' },
      },
    ]);
    assert.deepEqual(editorGetCollabEffects(source, sourceCommit), [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q2 Plan', value: 'Q3 Plan' },
      },
    ]);
  });
});
