import assert from 'node:assert/strict';
import { it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  editorCommands,
  NodeApi,
  schema,
} from '../src';
import { authored } from '../src/authored';
import { records } from '../src/authored/record-tree';
import { authoredOperationEffect, authoredState } from '../src/authored/state';
import { createAuthoredFragmentView } from '../src/core/authored-fragment-view';
import * as retainedRuntime from '../src/core/authored-runtime';
import { evaluateCommandWithState } from '../src/core/command-registry';
import {
  applyTransactionSpec,
  getEditorStateView,
} from '../src/core/public-state';
import { history } from '../src/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const markup = { intent: 'propose', projection: 'markup' } as const;
const retainedText = (view: ReturnType<typeof createEditorView>, id: string) =>
  retainedRuntime
    .readAuthoredViewFragments(view, id)
    .flatMap((fragment) =>
      fragment.kind === 'properties' ? [] : fragment.slice.content
    )
    .map(NodeApi.string)
    .join('');
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

it('inserts independent proposed content at a retained caret', () => {
  const { source, view, retained, id } = setup();
  const result = retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.selection.set(point(2));
    tx.text.insert('X');
  });
  assert.equal(retainedText(view, id), 'bravo');
  assert.equal(result?.changed, true);
  assert.equal(source.read.text.string([]), 'Alpha bravo omega');
  assert.equal(view.read.text.string([]), 'Alpha X omega');
  assert.equal(
    source.read.authored.changes({ proposals: true }).items.length,
    2
  );
  assert.equal(result?.fragmentId, null);
  assert.equal(source.read.authored.change(id)?.kind, 'delete');
  const details = view.read.authored.details(id);
  assert.equal(details?.parts.status, 'available');
  assert.equal(
    details?.parts.status === 'available' &&
      details.parts.items
        .flatMap((part) =>
          part.kind === 'content' ? (part.before?.content.content ?? []) : []
        )
        .map(NodeApi.string)
        .join(''),
    'bravo'
  );
});

it('evaluates installed semantic commands in retained coordinates', () => {
  const { source, view, retained, id } = setup();
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
  assert.equal(retainedText(view, id), 'bravo');
  assert.equal(view.read.text.string([]), 'Alpha X omega');
  assert.equal(result?.fragmentId, null);
  assert.deepEqual(result?.selection, {
    affinity: 'backward',
    kind: 'text',
    anchor: point(7),
    focus: point(7),
  });
});

it('allows another author but refuses stale fragments and readonly parents', () => {
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
  const inserted = retainedRuntime.updateAuthoredFragment(retained, (tx) =>
    tx.text.insert('X', { at: point(2) })
  );
  assert.equal(inserted?.changed, true);
  assert.equal(view.read.text.string([]), 'X');
  assert.equal(
    source.read.authored.changes({ authorId: 'bob', proposals: true }).items
      .length,
    1
  );
  assert.equal(source.read.authored.change(id)?.revision, 1);
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
  assert.throws(
    () =>
      retainedRuntime.updateAuthoredFragment(retained, (tx) =>
        tx.text.insert('X', { at: point(2) })
      ),
    /stale retained target/
  );
  assert.equal(source.read.text.string([]), 'bravo');
});

it('converges independent retained input from replicas without changing accepted content', () => {
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
    return { editor, view, fragment, operation, documentId: state.documentId };
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
  const text = peers.map(({ view }) => view.read.text.string([]));
  assert.equal(text[0], text[1]);
  assert.match(text[0], /^Alpha (XY|YX) omega$/);
  for (const { editor, view } of peers) {
    assert.equal(retainedText(view, id), 'bravo');
    assert.equal(editor.read.text.string([]), 'Alpha bravo omega');
  }
});

it('keeps retained typing, deletion and paragraph breaks through history and reload', async () => {
  const { source, view, retained, id } = setup();
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.selection.set(point(2));
    tx.text.insert('XYZ');
    tx.text.deleteBackward();
    tx.break.insert();
  });
  const text = () => view.read.children().map(NodeApi.string);
  assert.deepEqual(text(), ['Alpha XY', ' omega']);
  assert.equal(retainedText(view, id), 'bravo');
  const undoResult = await view.api.history.undo();
  assert.equal(undoResult.status, 'applied');
  assert.deepEqual(text(), ['Alpha  omega']);
  const redoResult = await view.api.history.redo();
  assert.equal(redoResult.status, 'applied');
  assert.deepEqual(text(), ['Alpha XY', ' omega']);
  const saved = JSON.stringify(source.read.value());
  for (const action of ['accept', 'reject'] as const) {
    const loaded = createEditor({
      plugins: [authored({ authorId: 'alice' }), history()],
      initialValue: JSON.parse(saved),
    });
    const loadedView = createEditorView(loaded, { authored: markup });
    assert.equal(retainedText(loadedView, id), 'bravo');
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
    assert.match(loadedView.read.text.string([]), /XY/);
    assert.deepEqual(
      retainedRuntime.readAuthoredViewFragments(loadedView, id),
      []
    );
  }
});

it('keeps repeated deletion inert and creates independent text for retained replacement', () => {
  const { source, view, retained, id } = setup();
  const protectedDelete = retainedRuntime.updateAuthoredFragment(
    retained,
    (tx) => {
      tx.selection.set(point(2));
      tx.text.deleteBackward();
    }
  );
  assert.equal(retainedText(view, id), 'bravo');
  assert.equal(protectedDelete?.changed, false);
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.text.delete({ at: { anchor: point(0), focus: point(5) } });
  });
  assert.equal(retainedText(view, id), 'bravo');
  retainedRuntime.updateAuthoredFragment(retained, (tx) => {
    tx.text.insert('Q', { at: { anchor: point(1), focus: point(3) } });
  });
  assert.equal(retainedText(view, id), 'bravo');
  assert.equal(view.read.text.string([]), 'Alpha Q omega');
  view.update.text.delete({ at: { anchor: point(6), focus: point(7) } });
  assert.equal(retainedText(view, id), 'bravo');
  assert.equal(source.read.text.string([]), 'Alpha bravo omega');
  assert.equal(view.read.text.string([]), 'Alpha  omega');
  assert.equal(source.read.authored.change(id)?.revision, 1);
});

it('keeps independent insertions at distinct retained positions in document order', async () => {
  let authorId = 'alice';
  const source = createEditor({
    plugins: [authored({ authorId: () => authorId }), history()],
    initialValue: [paragraph('mark text for removal')],
  });
  const view = createEditorView(source, { authored: markup });
  view.update.text.delete({ at: { anchor: point(0), focus: point(21) } });
  const { id } = source.read.authored.changes().items[0];
  authorId = 'bob';
  view.api.authored.setView({ intent: 'edit', projection: 'markup' });
  const first = retainedRuntime.readAuthoredViewFragments(view, id)[0];
  retainedRuntime.updateAuthoredFragment(
    createAuthoredFragmentView(view, first),
    (tx) => {
      tx.selection.set(point(1));
      tx.text.insert('1111');
    }
  );
  const second = retainedRuntime.readAuthoredViewFragments(view, id)[1];
  retainedRuntime.updateAuthoredFragment(
    createAuthoredFragmentView(view, second),
    (tx) => {
      tx.selection.set(point(3));
      tx.text.insert('2222');
    }
  );
  assert.equal(source.read.text.string([]), 'm1111ark2222 text for removal');
  assert.equal(view.read.text.string([]), '11112222');
  await view.api.history.undo();
  assert.equal(source.read.text.string([]), 'm1111ark text for removal');
  assert.equal(view.read.text.string([]), '1111');
  await view.api.history.redo();
  assert.equal(view.read.text.string([]), '11112222');
  const reopened = createEditor({
    plugins: [authored({ authorId: 'bob' })],
    initialValue: JSON.parse(JSON.stringify(source.read.value())),
  });
  const reopenedView = createEditorView(reopened, { authored: markup });
  assert.equal(reopenedView.read.text.string([]), '11112222');
  reopened.update.authored.decide({
    action: 'reject',
    selection: reopened.read.authored.select({ ids: [id] }),
  });
  assert.equal(reopened.read.text.string([]), 'm1111ark2222 text for removal');
});

for (const action of ['accept', 'reject'] as const) {
  it(`keeps an undone Editing deletion of retained text under the proposal, then ${action}s it`, async () => {
    let authorId = 'alice';
    const source = createEditor({
      plugins: [authored({ authorId: () => authorId }), history()],
      initialValue: [paragraph('Alpha bravo omega')],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.text.delete({ at: { anchor: point(6), focus: point(11) } });
    const { id } = source.read.authored.changes().items[0];
    authorId = 'bob';
    view.api.authored.setView({ intent: 'edit', projection: 'markup' });
    retainedRuntime.updateAuthoredFragment(
      createAuthoredFragmentView(
        view,
        retainedRuntime.readAuthoredViewFragments(view, id)[0]
      ),
      (tx) => {
        tx.text.delete({ at: { anchor: point(4), focus: point(5) } });
      }
    );
    assert.equal(retainedText(view, id), 'brav');

    await view.api.history.undo();
    assert.equal(source.read.text.string([]), 'Alpha bravo omega');
    assert.equal(view.read.text.string([]), 'Alpha  omega');
    assert.equal(retainedText(view, id), 'bravo');

    authorId = 'carol';
    source.update.authored.decide({
      action,
      selection: source.read.authored.select({ ids: [id] }),
    });
    const expected = action === 'accept' ? 'Alpha  omega' : 'Alpha bravo omega';
    assert.equal(source.read.text.string([]), expected);
    assert.equal(view.read.text.string([]), expected);
  });
}

for (const [label, from, expected] of [
  ['last', 4, 'Alpha brav omega'],
  ['middle', 2, 'Alpha brvo omega'],
] as const) {
  it(`undoes accepting a deletion after Editing removed its ${label} struck character`, async () => {
    let authorId = 'alice';
    const source = createEditor({
      plugins: [authored({ authorId: () => authorId }), history()],
      initialValue: [paragraph('Alpha bravo omega')],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.text.delete({ at: { anchor: point(6), focus: point(11) } });
    const { id } = source.read.authored.changes().items[0];
    authorId = 'bob';
    view.api.authored.setView({ intent: 'edit', projection: 'markup' });
    retainedRuntime.updateAuthoredFragment(
      createAuthoredFragmentView(
        view,
        retainedRuntime.readAuthoredViewFragments(view, id)[0]
      ),
      (tx) => {
        tx.text.delete({ at: { anchor: point(from), focus: point(from + 1) } });
      }
    );

    authorId = 'carol';
    const decide = (action: 'accept' | 'reject') =>
      source.update.authored.decide({
        action,
        selection: source.read.authored.select({ ids: [id] }),
      }).status;
    assert.equal(decide('accept'), 'applied');
    assert.equal(source.read.text.string([]), 'Alpha  omega');
    await source.api.history.undo();
    assert.equal(source.read.authored.change(id)?.status, 'pending');
    assert.equal(source.read.text.string([]), expected);
    assert.equal(decide('reject'), 'applied');
    assert.equal(source.read.text.string([]), expected);
  });
}

const editingAroundStruckText = () => {
  let authorId = 'bob';
  const source = createEditor({
    plugins: [authored({ authorId: () => authorId }), history()],
    initialValue: [paragraph('to mark text for removal. Discuss')],
  });
  const view = createEditorView(source, { authored: markup });
  view.update.text.delete({ at: { anchor: point(3), focus: point(24) } });
  const { id } = source.read.authored.changes().items[0];
  authorId = 'alice';
  view.api.authored.setView({ intent: 'edit', projection: 'markup' });
  const placed = () =>
    retainedRuntime
      .readAuthoredViewFragments(view, id)
      .map((fragment) => [
        fragment.kind === 'properties'
          ? ''
          : fragment.slice.content.map(NodeApi.string).join(''),
        fragment.placement?.kind === 'text'
          ? fragment.placement.point.offset
          : -1,
      ]);
  // Types `text` inside the struck run at `at`, one key at a time: the first
  // key splits the run, the rest follow it as live text.
  const typeInside = (run: string, at: number, text: string) => {
    const fragment = retainedRuntime
      .readAuthoredViewFragments(view, id)
      .find(
        (entry) =>
          entry.kind !== 'properties' &&
          entry.slice.content.map(NodeApi.string).join('') === run
      );
    assert.ok(fragment);
    const live =
      fragment.placement?.kind === 'text' ? fragment.placement.point.offset : 0;
    retainedRuntime.updateAuthoredFragment(
      createAuthoredFragmentView(view, fragment),
      (tx) => {
        tx.selection.set(point(at));
        tx.text.insert(text[0]);
      }
    );
    [...text.slice(1)].forEach((character, index) => {
      view.update.text.insert(character, { at: point(live + index + 1) });
    });
  };
  typeInside('mark text for removal', 4, '111');
  typeInside(' text for removal', 10, '2222');
  typeInside('removal', 2, '222');
  assert.equal(view.read.text.string([]), 'to 1112222222. Discuss');
  return { placed, view };
};

it('keeps struck runs in place when Editing deletes the first key typed inside them', () => {
  const { placed, view } = editingAroundStruckText();
  view.update.text.delete({ at: { anchor: point(10), focus: point(11) } });
  assert.deepEqual(placed(), [
    ['mark', 3],
    [' text for ', 6],
    ['re', 10],
    ['moval', 12],
  ]);
});

it('keeps struck runs in place when Editing deletes the live text after the last run', () => {
  const { placed, view } = editingAroundStruckText();
  view.update.text.delete({ at: { anchor: point(10), focus: point(15) } });
  assert.equal(view.read.text.string([]), 'to 1112222Discuss');
  assert.deepEqual(placed(), [
    ['mark', 3],
    [' text for ', 6],
    ['removal', 10],
  ]);
});

it('types into struck text whose open ancestor needs more children than the run holds', () => {
  const columns = defineEditorSchema('schema:retained-columns', {
    elements: {
      column: {
        content: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      columnGroup: {
        content: schema.content.types(['column'], {
          default: { type: 'column' },
          min: 2,
        }),
      },
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    },
    id: 'retained-columns',
    root: schema.content.types(['paragraph', 'columnGroup'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const column = (text: string) => ({
    type: 'column',
    children: [paragraph(text)],
  });
  const source = createEditor({
    plugins: [columns, authored({ authorId: 'alice' })],
    initialValue: [
      {
        type: 'columnGroup',
        children: [column('First column'), column('Two')],
      },
    ],
  });
  const view = createEditorView(source, { authored: markup });
  const at = (offset: number) => ({ path: [0, 0, 0, 0], offset });
  view.update.text.delete({ at: { anchor: at(6), focus: at(10) } });
  const { id } = source.read.authored.changes().items[0];
  retainedRuntime.updateAuthoredFragment(
    createAuthoredFragmentView(
      view,
      retainedRuntime.readAuthoredViewFragments(view, id)[0]
    ),
    (tx) => {
      tx.selection.set(at(2));
      tx.text.insert('X');
    }
  );
  assert.equal(view.read.text.string([0, 0]), 'First Xmn');
  assert.equal(source.read.text.string([0, 0]), 'First column');
});

it('keeps struck text after the text a Suggesting replace types over it', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Generate content')],
  });
  const view = createEditorView(source, { authored: markup });
  view.update.text.delete({ at: { anchor: point(2), focus: point(6) } });
  view.update((tx) => {
    tx.selection.set({ anchor: point(0), focus: point(4) });
    tx.text.insert('K');
  });
  assert.equal(view.read.text.string([]), 'K content');
  assert.deepEqual(
    source.read.authored
      .changes({ proposals: true })
      .items.flatMap(({ id }) =>
        retainedRuntime.readAuthoredViewFragments(view, id)
      )
      .flatMap((fragment) =>
        fragment.kind === 'properties' || fragment.placement?.kind !== 'text'
          ? []
          : [fragment.placement.point.offset]
      ),
    [1, 1, 1]
  );
});
