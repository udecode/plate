import assert from 'node:assert/strict';
import { it } from 'node:test';

import {
  createEditor,
  createEditorView,
  editorCommands,
  NodeApi,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

import { records } from '../src/authored/record-tree';
import { authoredOperationEffect, authoredState } from '../src/authored/state';
import { createAuthoredFragmentView } from '../src/core/authored-fragment-view';
import * as retainedRuntime from '../src/core/authored-runtime';
import { evaluateCommandWithState } from '../src/core/command-registry';
import {
  applyTransactionSpec,
  getEditorStateView,
} from '../src/core/public-state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const markup = { intent: 'propose', projection: 'markup' } as const;
const setup = () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' }), history()],
    initialValue: [paragraph('Alpha bravo omega')],
  });
  const view = createEditorView(source, { authored: markup });
  view.update.text.delete({ at: { anchor: point(6), focus: point(11) } });
  const { id } = source.read.authored.changes().items[0];
  const retained = createAuthoredFragmentView(
    view,
    retainedRuntime.readAuthoredViewFragments(view, id)[0]
  );
  return { source, view, retained, id };
};

it('amends a deletion at its retained caret without changing either document projection', () => {
  const { source, view, retained, id } = setup();
  const result = retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.selection.set(point(2));
    tx.text.insert('X');
  });
  assert.equal(retained.read.text.string([]), 'brXavo');
  assert.equal(result?.changed, true);
  assert.equal(source.read.text.string([]), 'Alpha bravo omega');
  assert.equal(view.read.text.string([]), 'Alpha  omega');
  assert.deepEqual(
    source.read.authored.changes().items.map((item) => item.id),
    [id]
  );
  assert.equal(source.read.authored.change(id)?.kind, 'delete');
  const details = view.read.authored.details(id);
  assert.equal(details?.parts.status, 'available');
  assert.equal(
    details?.parts.status === 'available' &&
      details.parts.items.some(
        (part) =>
          part.kind === 'content' &&
          part.before?.content.content.map(NodeApi.string).join('') === 'brXavo'
      ),
    true
  );
});

it('evaluates installed semantic commands in retained coordinates', () => {
  const { source, retained } = setup();
  const result = retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.selection.set(point(2));
    const evaluated = evaluateCommandWithState(
      retained,
      editorCommands.insertText,
      getEditorStateView(source),
      { text: 'X' }
    ).result;
    if (evaluated) applyTransactionSpec(source, evaluated);
  });
  assert.equal(retained.read.text.string([]), 'brXavo');
  assert.deepEqual(result?.selection, {
    kind: 'text',
    anchor: point(3),
    focus: point(3),
  });
});

for (const parent of ['source', 'view'] as const) {
  for (const action of ['accept', 'reject'] as const) {
    it(`undoes and ${action}s retained amendments in a later paragraph through a markup ${parent}`, () => {
      const source = createEditor({
        plugins: [authored({ authorId: 'alice' }), history()],
        initialValue: [
          paragraph('Review and refine this sentence.'),
          paragraph('Keep this redundant phrase out of the final draft.'),
          paragraph('Try typing your own suggestion here.'),
        ],
      });
      const view =
        parent === 'source'
          ? source
          : createEditorView(source, { authored: markup });
      if (parent === 'source') source.api.authored.setView(markup);
      view.update.text.insert('collaboratively ', { at: point(7) });
      view.update.text.delete({
        at: {
          anchor: { path: [1, 0], offset: 10 },
          focus: { path: [1, 0], offset: 27 },
        },
      });
      const deletion = source.read.authored
        .changes()
        .items.find((item) => item.kind === 'delete');
      assert.ok(deletion);
      const retained = createAuthoredFragmentView(
        view,
        retainedRuntime.readAuthoredViewFragments(view, deletion.id)[0]
      );
      for (const [offset, text] of [
        [6, 'X'],
        [7, 'Y'],
      ] as const) {
        retainedRuntime.updateAuthoredFragment(
          retained,
          (tx) => {
            tx.selection.set(point(offset));
            tx.text.insert(text);
          },
          { tags: ['dom-text-input'] }
        );
      }
      const expected = (text: string) => [paragraph(text)];
      assert.deepEqual(
        retained.read.children(),
        expected('redundXYant phrase ')
      );
      retainedRuntime.updateAuthoredFragment(retained, (tx) => {
        tx.selection.set(point(8));
        tx.text.deleteBackward();
      });
      assert.deepEqual(
        retained.read.children(),
        expected('redundXant phrase ')
      );
      view.api.history.undo();
      assert.deepEqual(
        retained.read.children(),
        expected('redundXYant phrase ')
      );
      const restoredView = createAuthoredFragmentView(
        view,
        retainedRuntime.readAuthoredViewFragments(view, deletion.id)[0]
      );
      const restoredCaret = restoredView.anchor(point(8), {
        association: 'forward',
        deletion: 'nearest',
      });
      assert.deepEqual(restoredCaret.resolve(), point(8));
      restoredCaret.release();
      view.api.history.redo();
      assert.deepEqual(
        retained.read.children(),
        expected('redundXant phrase ')
      );
      retainedRuntime.updateAuthoredFragment(retained, (tx) => {
        tx.selection.set(point(7));
        tx.text.insert('Z');
      });
      retainedRuntime.updateAuthoredFragment(retained, (tx) => {
        tx.selection.set(point(8));
        tx.break.insert();
      });
      retainedRuntime.updateAuthoredFragment(retained, (tx) => {
        tx.selection.set({ path: [1, 0], offset: 0 });
        tx.text.insert('Q');
      });
      const amended = [paragraph('redundXZ'), paragraph('Qant phrase ')];
      assert.deepEqual(retained.read.children(), amended);
      const result = view.update.authored.decide({
        action,
        selection: view.read.authored.select({ ids: [deletion.id] }),
      });
      assert.equal(result.status, 'applied', JSON.stringify(result));
      assert.deepEqual(
        view.read.children()[1],
        paragraph(
          action === 'accept'
            ? 'Keep this out of the final draft.'
            : 'Keep this redundant phrase out of the final draft.'
        )
      );
      view.api.history.undo();
      assert.deepEqual(retained.read.children(), amended);
      view.api.history.redo();
      assert.deepEqual(
        retainedRuntime.readAuthoredViewFragments(view, deletion.id),
        []
      );
      assert.deepEqual(
        view.read.children()[1],
        paragraph(
          action === 'accept'
            ? 'Keep this out of the final draft.'
            : 'Keep this redundant phrase out of the final draft.'
        )
      );
    });
  }
}

it('refuses another author, stale fragments and readonly parents', () => {
  let authorId = 'alice';
  const source = createEditor({
    plugins: [authored({ authorId: () => authorId })],
    initialValue: [paragraph('bravo')],
  });
  const view = createEditorView(source, { authored: markup });
  view.update.text.delete({ at: { anchor: point(0), focus: point(5) } });
  const { id } = source.read.authored.changes().items[0];
  const fragment = retainedRuntime.readAuthoredViewFragments(view, id)[0];
  const retained = createAuthoredFragmentView(view, fragment);
  authorId = 'bob';
  assert.equal(
    retainedRuntime.updateAuthoredFragment(retained, (tx) =>
      tx.text.insert('X', { at: point(2) })
    ),
    null
  );
  authorId = 'alice';
  const readonly = createEditorView(source, {
    authored: markup,
    readOnly: true,
  });
  const readonlyFragment = createAuthoredFragmentView(
    readonly,
    retainedRuntime.readAuthoredViewFragments(readonly, id)[0]
  );
  assert.equal(
    retainedRuntime.updateAuthoredFragment(readonlyFragment, (tx) =>
      tx.text.insert('X', { at: point(2) })
    ),
    null
  );
  source.update.authored.decide({
    action: 'reject',
    selection: source.read.authored.select({ ids: [id] }),
  });
  assert.equal(
    retainedRuntime.updateAuthoredFragment(retained, (tx) =>
      tx.text.insert('X', { at: point(2) })
    ),
    null
  );
  assert.equal(source.read.text.string([]), 'bravo');
});

it('converges retained amendments from replicas without changing accepted content', () => {
  const { source, id } = setup();
  const saved = JSON.stringify(source.read.value());
  const peers = ['X', 'Y'].map((text) => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(saved),
    });
    const view = createEditorView(editor, { authored: markup });
    const fragment = createAuthoredFragmentView(
      view,
      retainedRuntime.readAuthoredViewFragments(view, id)[0]
    );
    retainedRuntime.updateAuthoredFragment(fragment, (tx) =>
      tx.text.insert(text, { at: point(2) })
    );
    const state = editor.read.getField(authoredState);
    const operation = [...records(state.operations)].find(
      ([, item]) => item.clock === state.clock
    )?.[1];
    assert.ok(operation);
    return { editor, fragment, operation, documentId: state.documentId };
  });
  for (const [index, peer] of peers.entries()) {
    peer.editor.update((tx) =>
      tx.effects.emit(authoredOperationEffect, {
        documentId: peer.documentId,
        checkpoint: null,
        operations: [peers[1 - index].operation],
        retained: [],
      })
    );
  }
  const text = peers.map(({ fragment }) => fragment.read.text.string([]));
  assert.equal(text[0], text[1]);
  assert.match(text[0], /^br(XY|YX)avo$/);
  for (const { editor } of peers) {
    assert.equal(editor.read.text.string([]), 'Alpha bravo omega');
  }
});

it('keeps retained typing, deletion and paragraph breaks through history and reload', () => {
  const { source, view, retained, id } = setup();
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.selection.set(point(2));
    tx.text.insert('XYZ');
    tx.text.deleteBackward();
    tx.break.insert();
  });
  const text = () => retained.read.children().map(NodeApi.string);
  assert.deepEqual(text(), ['brXY', 'avo']);
  view.api.history.undo();
  assert.deepEqual(text(), ['bravo']);
  view.api.history.redo();
  assert.deepEqual(text(), ['brXY', 'avo']);
  const saved = JSON.stringify(source.read.value());
  for (const action of ['accept', 'reject'] as const) {
    const loaded = createEditor({
      plugins: [authored({ authorId: 'alice' }), history()],
      initialValue: JSON.parse(saved),
    });
    const loadedView = createEditorView(loaded, { authored: markup });
    const fragment = retainedRuntime.readAuthoredViewFragments(
      loadedView,
      id
    )[0];
    assert.deepEqual(
      fragment.kind !== 'properties' &&
        fragment.slice.content.map(NodeApi.string),
      ['brXY', 'avo']
    );
    assert.equal(
      loaded.update.authored.decide({
        action,
        selection: loaded.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    assert.equal(
      loaded.read.text.string([]),
      action === 'accept' ? 'Alpha  omega' : 'Alpha bravo omega'
    );
    assert.deepEqual(
      retainedRuntime.readAuthoredViewFragments(loadedView, id),
      []
    );
  }
});

it('protects original deletion characters while replacing a selected range with an amendment', () => {
  const { source, view, retained, id } = setup();
  const protectedDelete = retainedRuntime.updateAuthoredFragment(
    retained,
    (tx) => {
      tx.selection.set(point(2));
      tx.text.deleteBackward();
    }
  );
  assert.equal(retained.read.text.string([]), 'bravo');
  assert.equal(protectedDelete?.changed, false);
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.text.delete({ at: { anchor: point(0), focus: point(5) } });
  });
  assert.equal(retained.read.text.string([]), 'bravo');
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.text.insert('Q', { at: { anchor: point(1), focus: point(3) } });
  });
  assert.equal(retained.read.text.string([]), 'bQravo');
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.text.delete({ at: { anchor: point(0), focus: point(6) } });
  });
  assert.equal(retained.read.text.string([]), 'bravo');
  assert.equal(source.read.text.string([]), 'Alpha bravo omega');
  assert.equal(view.read.text.string([]), 'Alpha  omega');
  assert.equal(source.read.authored.changes().items[0].id, id);
});
