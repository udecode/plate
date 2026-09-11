import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  NodeApi,
  SelectionApi,
  schema,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

import { authoredPositionSpans } from '../src/authored/positions';
import { records } from '../src/authored/record-tree';
import { readAuthoredRetainedContent } from '../src/authored/retained';
import { authoredState, type AuthoredState } from '../src/authored/state';
import { createAuthoredFragmentView } from '../src/core/authored-fragment-view';
import { readAuthoredViewFragments } from '../src/core/authored-runtime';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const markup = { intent: 'propose', projection: 'markup' } as const;
const point = (offset: number) => ({ path: [0, 0], offset });
const contents = (state: AuthoredState) =>
  [...records(state.operations)].flatMap(([, operation]) =>
    operation.kind === 'edit'
      ? operation.steps.flatMap((step) =>
          step.targets.flatMap((target) => {
            const retained = readAuthoredRetainedContent(target);
            return retained ? [{ retained, target }] : [];
          })
        )
      : []
  );

describe('native retained counterparts', () => {
  for (const affinity of ['backward', 'forward'] as const) {
    it(`preserves ${affinity} insertion at a retained boundary through history, reload and decisions`, () => {
      const editor = createEditor({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('A shared draft.')],
      });
      const view = createEditorView(editor, { authored: markup });
      view.update.text.delete({ at: { anchor: point(2), focus: point(8) } });
      const { id } = editor.read.authored.changes().items[0];
      view.update.selection.set(
        SelectionApi.text({ anchor: point(2), focus: point(2) }, { affinity })
      );
      view.update.text.insert('!');
      const expectedOffset = affinity === 'backward' ? 3 : 2;
      const check = () => {
        assert.equal(view.read.text.string([]), 'A ! draft.');
        assert.deepEqual(readAuthoredViewFragments(view, id)[0].placement, {
          kind: 'text',
          point: point(expectedOffset),
        });
      };
      check();
      view.update.history.undo();
      assert.equal(view.read.text.string([]), 'A  draft.');
      view.update.history.redo();
      check();
      view.update.text.insert('?');
      assert.deepEqual(readAuthoredViewFragments(view, id)[0].placement, {
        kind: 'text',
        point: point(affinity === 'backward' ? 4 : 2),
      });
      view.update.history.undo();
      check();
      const saved = JSON.stringify(editor.read.value());
      for (const action of ['accept', 'reject'] as const) {
        const loaded = createEditor({
          extensions: [history(), authored({ authorId: 'alice' })],
          initialValue: JSON.parse(saved),
        });
        const loadedView = createEditorView(loaded, { authored: markup });
        assert.deepEqual(
          readAuthoredViewFragments(loadedView, id)[0].placement,
          {
            kind: 'text',
            point: point(expectedOffset),
          }
        );
        const inserted = loaded.read.authored
          .changes()
          .items.filter((item) => item.id !== id);
        loaded.update.authored.decide({
          action: 'accept',
          selection: loaded.read.authored.select({
            ids: inserted.map((item) => item.id),
          }),
        });
        assert.equal(
          loaded.read.text.string([]),
          affinity === 'backward' ? 'A !shared draft.' : 'A shared! draft.'
        );
        loaded.update.authored.decide({
          action,
          selection: loaded.read.authored.select({ ids: [id] }),
        });
        assert.equal(
          loadedView.read.text.string([]),
          action === 'accept'
            ? 'A ! draft.'
            : affinity === 'backward'
              ? 'A !shared draft.'
              : 'A shared! draft.'
        );
      }
    });

    it(`captures a ${affinity} caret selected inside the insertion transaction`, () => {
      const editor = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: [paragraph('A shared draft.')],
      });
      const view = createEditorView(editor, { authored: markup });
      view.update.text.delete({ at: { anchor: point(2), focus: point(8) } });
      const { id } = editor.read.authored.changes().items[0];
      view.update((tx) => {
        tx.selection.set(
          SelectionApi.text({ anchor: point(2), focus: point(2) }, { affinity })
        );
        tx.text.insert('!');
        tx.text.insert('?');
      });
      assert.equal(view.read.text.string([]), 'A !? draft.');
      assert.deepEqual(readAuthoredViewFragments(view, id)[0].placement, {
        kind: 'text',
        point: point(affinity === 'backward' ? 4 : 2),
      });
    });
  }

  it('retains an inline deletion once when normalization joins adjacent text', () => {
    const links = defineEditorSchema('schema:authored-retained-inline', {
      id: 'authored-retained-inline',
      version: 1,
      unknown: 'preserve',
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      root: schema.content.not(schema.content.text()),
    });
    const editor = createEditor({
      extensions: [links, authored({ authorId: 'alice' })],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'A' },
            { type: 'link', children: [{ text: 'XYZ' }] },
            { text: 'B' },
          ],
        },
      ],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.remove({ at: [0, 1] });
    const { id } = editor.read.authored.changes().items[0];
    const check = (text: string) => {
      const fragments = readAuthoredViewFragments(view, id);
      assert.equal(fragments.length, 1);
      const [fragment] = fragments;
      assert.ok(fragment.kind !== 'properties');
      assert.equal(NodeApi.string(fragment.slice.content[0]), text);
      assert.deepEqual(view.read.children(), [paragraph('AB')]);
    };
    check('XYZ');
    editor.update.text.insert('!', { at: { path: [0, 1, 0], offset: 1 } });
    check('X!YZ');
  });

  it('publishes retained snapshots in version order when an earlier observer edits again', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after')],
    });
    const parent = createEditorView(source, { authored: markup });
    parent.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = source.read.authored.changes().items[0];
    const fragment = createAuthoredFragmentView(
      parent,
      readAuthoredViewFragments(parent, id)[0]
    );
    let nested = false;
    const stopSource = source.subscribeCommit((commit) => {
      if (nested || !commit.changed.has('text')) return;
      nested = true;
      source.update.text.insert('Y', { at: point(11) });
    });
    const before = source.read.runtime.snapshot().version;
    const seen: Array<{ text: string; version: number }> = [];
    const stop = fragment.subscribeCommit((commit) =>
      seen.push({
        text: NodeApi.string(commit.after.children[0]),
        version: commit.version,
      })
    );
    source.update.text.insert('X', { at: point(10) });
    assert.deepEqual(seen, [
      { text: 'midXdle', version: before + 1 },
      { text: 'midXYdle', version: before + 2 },
    ]);
    stop();
    stopSource();
  });

  it('routes fragment subscriptions to affected content and disposes independent registrations', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after'), paragraph('Unrelated')],
    });
    const parent = createEditorView(source, { authored: markup });
    parent.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = source.read.authored.changes().items[0];
    const fragment = createAuthoredFragmentView(
      parent,
      readAuthoredViewFragments(parent, id)[0]
    );
    let calls = 0;
    const listener = () => {
      calls += 1;
    };
    const first = fragment.subscribeCommit(listener);
    const second = fragment.subscribeCommit(listener);
    const snapshots: string[] = [];
    const snapshotSubscription = fragment.subscribe((snapshot) =>
      snapshots.push(NodeApi.string(snapshot.children[0]))
    );
    source.update.text.insert('!', { at: { path: [1, 0], offset: 3 } });
    assert.equal(calls, 0);
    assert.deepEqual(snapshots, []);
    first();
    first();
    source.update.text.insert('X', { at: point(10) });
    assert.equal(calls, 1);
    assert.deepEqual(snapshots, ['midXdle']);
    second();
    snapshotSubscription();
    const resumed = fragment.subscribeCommit(listener);
    second();
    source.update.text.insert('Y', { at: point(11) });
    assert.equal(calls, 2);
    resumed();
  });

  it('binds retained reads, keys and clipboard slices to the shared native owner', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = editor.read.authored.changes().items[0];
    const retained = createAuthoredFragmentView(
      view,
      readAuthoredViewFragments(view, id)[0]
    );
    assert.deepEqual(retained.read.children(), [paragraph('middle')]);
    assert.deepEqual(retained.read.nodes.get([0, 0]), [
      { text: 'middle' },
      [0, 0],
    ]);
    assert.deepEqual(retained.read.points.end([]), {
      ...point(6),
      root: 'main',
    });
    assert.deepEqual(
      retained.read.slice.get({
        at: {
          anchor: point(1),
          focus: point(5),
        },
      }).content,
      [paragraph('iddl')]
    );
    assert.deepEqual(retained.read.value(), editor.read.value());
    assert.notEqual(retained.key([0, 0]), view.key([0, 0]));
    assert.equal(retained.read.view.isReadOnly(), true);
    assert.throws(
      () => retained.update.text.insert('oops', { at: point(1) }),
      /read-only/
    );
    assert.throws(
      () => retained.api.authored.setView(markup),
      /parent markup view/
    );
    assert.deepEqual(view.read.children(), [paragraph('Before  after')]);
  });

  it('saves retained anchors in canonical origins across accepted edits and reload', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = editor.read.authored.changes().items[0];
    const retained = createAuthoredFragmentView(
      view,
      readAuthoredViewFragments(view, id)[0]
    );
    const retainedTextKey = retained.key([0, 0]);
    const anchor = retained.anchor(
      { anchor: point(1), focus: point(5) },
      { deletion: 'drop' }
    );
    const saved = retained.anchor.save(anchor);
    const acceptedAnchor = editor.anchor.restore(saved);
    assert.deepEqual(acceptedAnchor.resolve(), {
      anchor: point(8),
      focus: point(12),
    });
    assert.equal(view.anchor.restore(saved).resolve(), null);
    editor.update.text.insert('X', { at: point(10) });
    assert.deepEqual(retained.read.children(), [paragraph('midXdle')]);
    assert.equal(retained.key([0, 0]), retainedTextKey);
    assert.deepEqual(anchor.resolve(), { anchor: point(1), focus: point(6) });
    assert.deepEqual(acceptedAnchor.resolve(), {
      anchor: point(8),
      focus: point(13),
    });
    const restored = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    const restoredMarkup = createEditorView(restored, { authored: markup });
    const restoredFragment = createAuthoredFragmentView(
      restoredMarkup,
      readAuthoredViewFragments(restoredMarkup, id)[0]
    );
    assert.deepEqual(
      restoredFragment.anchor.restore(saved).resolve(),
      anchor.resolve()
    );
    anchor.release();
    acceptedAnchor.release();
  });

  it('publishes fragment-local snapshots and change coordinates at the canonical version', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = editor.read.authored.changes().items[0];
    const retained = createAuthoredFragmentView(
      view,
      readAuthoredViewFragments(view, id)[0]
    );
    const commits: Array<
      Parameters<Parameters<typeof retained.subscribeCommit>[0]>[0]
    > = [];
    let sourceVersion = 0;
    const unsubscribeSource = editor.subscribeCommit((commit) => {
      sourceVersion = commit.version;
    });
    const unsubscribe = retained.subscribeCommit((commit) =>
      commits.push(commit)
    );
    editor.update.text.insert('X', { at: point(10) });
    assert.equal(commits.length, 1);
    assert.deepEqual(commits[0].before.children, [paragraph('middle')]);
    assert.deepEqual(commits[0].after.children, [paragraph('midXdle')]);
    assert.deepEqual(
      commits[0].changes.apply({ children: commits[0].before.children })
        .children,
      commits[0].after.children
    );
    assert.equal(commits[0].version, sourceVersion);
    editor.update.authored.decide({
      action: 'reject',
      selection: editor.read.authored.select({ ids: [id] }),
    });
    assert.deepEqual(retained.read.children(), []);
    assert.deepEqual(commits[1].after.children, []);
    unsubscribe();
    unsubscribeSource();
  });

  it('retains named-root coordinates without conflating the primary document', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Primary')],
        roots: { caption: [paragraph('Caption')] },
      },
    });
    const view = createEditorView(editor, {
      authored: markup,
      root: 'caption',
    });
    view.update.text.delete({ at: { anchor: point(1), focus: point(6) } });
    const { id } = editor.read.authored.changes().items[0];
    const retained = createAuthoredFragmentView(
      view,
      readAuthoredViewFragments(view, id)[0]
    );
    assert.deepEqual(retained.read.children(), [paragraph('aptio')]);
    assert.equal(retained.read.view.root(), 'caption');
    const anchor = retained.anchor(
      { anchor: point(0), focus: point(5) },
      { deletion: 'drop' }
    );
    const saved = retained.anchor.save(anchor);
    assert.deepEqual(editor.anchor.restore(saved).resolve(), {
      anchor: { ...point(1), root: 'caption' },
      focus: { ...point(6), root: 'caption' },
    });
    assert.deepEqual(retained.read.value(), editor.read.value());
    anchor.release();
  });

  it('detaches retained views and anchors when their parent leaves markup', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Original')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(1), focus: point(5) } });
    const { id } = editor.read.authored.changes().items[0];
    const fragment = readAuthoredViewFragments(view, id)[0];
    const retained = createAuthoredFragmentView(view, fragment);
    const anchor = retained.anchor(
      { anchor: point(0), focus: point(4) },
      { deletion: 'drop' }
    );
    view.api.authored.setView({ intent: 'propose', projection: 'proposed' });
    assert.deepEqual(retained.read.children(), []);
    assert.equal(anchor.resolve(), null);
    assert.throws(
      () => createAuthoredFragmentView(view, fragment),
      /current markup fragment/
    );
    view.api.authored.setView(markup);
    assert.deepEqual(retained.read.children(), [paragraph('rigi')]);
    assert.deepEqual(anchor.resolve(), { anchor: point(0), focus: point(4) });
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [id] }),
    });
    assert.equal(anchor.resolve(), null);
    assert.throws(
      () => createAuthoredFragmentView(view, fragment),
      /current markup fragment/
    );
    anchor.release();
  });

  it('binds a retained range created during accepted editing and rolls it back on abort', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = editor.read.authored.changes().items[0];
    const retained = createAuthoredFragmentView(
      view,
      readAuthoredViewFragments(view, id)[0]
    );
    let anchor: ReturnType<typeof retained.anchor> | undefined;
    editor.update((tx) => {
      anchor = retained.anchor(
        { anchor: point(1), focus: point(5) },
        { deletion: 'drop' }
      );
      tx.text.insert('X', { at: point(10) });
      assert.deepEqual(anchor.resolve(), { anchor: point(1), focus: point(6) });
    });
    assert.deepEqual(anchor?.resolve(), { anchor: point(1), focus: point(6) });
    anchor?.release();
    const before = retained.read.children();
    assert.throws(
      () =>
        editor.update((tx) => {
          anchor = retained.anchor(
            { anchor: point(1), focus: point(6) },
            { deletion: 'drop' }
          );
          tx.text.insert('Y', { at: point(10) });
          assert.deepEqual(retained.read.children(), before);
          assert.deepEqual(anchor.resolve(), {
            anchor: point(1),
            focus: point(7),
          });
          throw new Error('Abort retained read');
        }),
      /Abort retained read/
    );
    assert.equal(anchor?.resolve(), null);
    assert.deepEqual(retained.read.children(), before);
    anchor?.release();
  });

  it('exposes removed content only to markup views and maps its current placement', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const { id } = editor.read.authored.changes().items[0];
    const fragments = readAuthoredViewFragments(view, id);
    assert.equal(readAuthoredViewFragments(view, id), fragments);
    const sibling = createEditorView(editor, { authored: markup });
    assert.equal(readAuthoredViewFragments(sibling, id), fragments);
    assert.equal(fragments.length, 1);
    const [fragment] = fragments;
    assert.equal(fragment.kind, 'delete');
    assert.deepEqual(fragment.placement, { kind: 'text', point: point(7) });
    if (fragment.kind === 'properties') assert.fail();
    assert.deepEqual(fragment.slice.content, [paragraph('middle')]);
    assert.deepEqual(fragment.range, { anchor: point(0), focus: point(6) });
    assert.deepEqual(readAuthoredViewFragments(editor, id), []);
    view.api.authored.setView({ intent: 'propose', projection: 'proposed' });
    assert.deepEqual(readAuthoredViewFragments(view, id), []);
    view.api.authored.setView(markup);
    assert.deepEqual(readAuthoredViewFragments(view, id), fragments);
    editor.update.text.insert('New ', { at: point(0) });
    assert.deepEqual(readAuthoredViewFragments(view, id)[0].placement, {
      kind: 'text',
      point: point(11),
    });
  });

  it('drops a retained deletion after undo and restores it after redo', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Original')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(2), focus: point(5) } });
    const { id } = editor.read.authored.changes().items[0];
    const fragments = readAuthoredViewFragments(view, id);
    assert.equal(fragments.length, 1);
    view.update.history.undo();
    assert.deepEqual(readAuthoredViewFragments(view, id), []);
    view.update.history.redo();
    assert.deepEqual(readAuthoredViewFragments(view, id), fragments);
  });

  it('omits deleted text introduced by the same proposal', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('AB')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.insert('X', { at: point(1) });
    const { id } = editor.read.authored.changes().items[0];
    view.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.delete({ at: { anchor: point(1), focus: point(3) } });
    });
    const [fragment] = readAuthoredViewFragments(view, id);
    assert.equal(fragment.kind, 'delete');
    if (fragment.kind === 'properties') assert.fail();
    assert.deepEqual(fragment.slice.content, [paragraph('B')]);
    assert.deepEqual(view.read.children(), [paragraph('A')]);
  });

  it('shows accepted edits made inside the pending removed content', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Start middle end')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(6), focus: point(12) } });
    const { id } = editor.read.authored.changes().items[0];
    editor.update.text.insert('X', { at: point(9) });
    const [fragment] = readAuthoredViewFragments(view, id);
    assert.equal(fragment.kind, 'delete');
    if (fragment.kind === 'properties') assert.fail();
    assert.deepEqual(fragment.slice.content, [paragraph('midXdle')]);
    assert.deepEqual(view.read.children(), [paragraph('Start  end')]);
  });

  it('clips a counterpart when its accepted content is partly or fully deleted', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Start middle end')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(6), focus: point(12) } });
    const { id } = editor.read.authored.changes().items[0];
    editor.update.text.delete({ at: { anchor: point(6), focus: point(9) } });
    const [fragment] = readAuthoredViewFragments(view, id);
    if (fragment.kind === 'properties') assert.fail();
    assert.deepEqual(fragment.slice.content, [paragraph('dle')]);
    editor.update.text.delete({ at: { anchor: point(6), focus: point(9) } });
    assert.deepEqual(readAuthoredViewFragments(view, id), []);
  });

  it('refreshes the accepted part of a deletion spanning another pending insertion', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('ABCD')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.insert('X', { at: point(1) });
    authorId = 'bob';
    view.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
    const { id } = editor.read.authored.changes({ authorId }).items[0];
    authorId = 'carol';
    editor.update.text.insert('Z', { at: point(2) });
    const text = readAuthoredViewFragments(view, id)
      .map((fragment) =>
        fragment.kind === 'properties'
          ? ''
          : fragment.slice.content.map((node) => NodeApi.string(node)).join('')
      )
      .join('');
    assert.equal(text, 'XBZC');
    assert.deepEqual(view.read.children(), [paragraph('AD')]);
  });

  it('combines property amendments and suppresses their complete undo', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Text')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.set({ bold: true }, { at: [0, 0] });
    const { id } = editor.read.authored.changes().items[0];
    view.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.nodes.set({ italic: true }, { at: [0, 0] });
    });
    const [fragment] = readAuthoredViewFragments(view, id);
    assert.equal(fragment.kind, 'properties');
    if (fragment.kind !== 'properties') assert.fail();
    assert.deepEqual(fragment.before, {});
    assert.deepEqual(fragment.after, { bold: true, italic: true });
    view.update.history.undo();
    view.update.history.undo();
    assert.deepEqual(readAuthoredViewFragments(view, id), []);
  });

  it('removes counterpart fragments after either review decision', () => {
    for (const action of ['accept', 'reject'] as const) {
      const editor = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: [paragraph('Original')],
      });
      const view = createEditorView(editor, { authored: markup });
      view.update.text.delete({ at: { anchor: point(0), focus: point(4) } });
      const { id } = editor.read.authored.changes().items[0];
      assert.equal(readAuthoredViewFragments(view, id).length, 1);
      editor.update.authored.decide({
        action,
        selection: editor.read.authored.select({ ids: [id] }),
      });
      assert.deepEqual(readAuthoredViewFragments(view, id), []);
    }
  });

  it('retains another authors proposed text across parent acceptance and reload', () => {
    let authorId = 'alice';
    const extension = authored({ authorId: () => authorId });
    const editor = createEditor({
      extensions: [extension],
      initialValue: [paragraph('Base')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.insert(' proposed', { at: point(4) });
    const parent = editor.read.authored.changes().items[0].id;
    authorId = 'bob';
    view.update.text.delete({ at: { anchor: point(5), focus: point(13) } });
    const child = editor.read.authored.changes({ authorId: 'bob' }).items[0].id;
    const fragments = readAuthoredViewFragments(view, child);
    assert.equal(fragments.length, 1);
    const [fragment] = fragments;
    if (fragment.kind === 'properties') assert.fail();
    assert.deepEqual(fragment.slice.content, [paragraph('proposed')]);
    assert.equal(fragment.authorId, 'bob');
    assert.equal(
      editor.update.authored.decide({
        action: 'accept',
        selection: editor.read.authored.select({ ids: [parent] }),
      }).status,
      'applied'
    );
    assert.deepEqual(readAuthoredViewFragments(view, child), fragments);
    const restored = createEditor({
      extensions: [extension],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    const reopened = createEditorView(restored, { authored: markup });
    assert.deepEqual(readAuthoredViewFragments(reopened, child), fragments);
  });

  it('retains only the still-deleted part after undoing an amendment', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('ABCDEF')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    const { id } = editor.read.authored.changes().items[0];
    view.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.delete({ at: { anchor: point(1), focus: point(3) } });
    });
    assert.equal(readAuthoredViewFragments(view, id).length, 2);
    view.update.history.undo();
    const fragments = readAuthoredViewFragments(view, id);
    assert.equal(fragments.length, 1);
    const [fragment] = fragments;
    if (fragment.kind === 'properties') assert.fail();
    assert.deepEqual(fragment.slice.content, [paragraph('B')]);
  });

  it('maps a removed row to its child boundary without making it an editable child', () => {
    const row = (text: string) => ({
      type: 'tr',
      children: [{ type: 'td', children: [paragraph(text)] }],
    });
    const initialValue = [
      { type: 'table', children: [row('First'), row('Second')] },
    ];
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.remove({ at: [0, 0] });
    const { id } = editor.read.authored.changes().items[0];
    const [fragment] = readAuthoredViewFragments(view, id);
    assert.deepEqual(fragment.placement, {
      kind: 'children',
      path: [0],
      index: 0,
    });
    assert.equal(view.read.children()[0].children.length, 1);
    assert.deepEqual(editor.read.value().children, initialValue);
  });

  it('keeps independent accepted formatting when showing a proposed property counterpart', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Text')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.set({ bold: true }, { at: [0, 0] });
    const { id } = editor.read.authored.changes().items[0];
    authorId = 'bob';
    editor.update.nodes.set({ italic: true }, { at: [0, 0] });
    const [fragment] = readAuthoredViewFragments(view, id);
    if (fragment.kind !== 'properties') assert.fail();
    assert.deepEqual(fragment.before, { italic: true });
    assert.deepEqual(fragment.after, { bold: true, italic: true });
  });

  it('retains only removed text with its original marks and open element context', () => {
    const initialValue = [
      {
        type: 'paragraph',
        align: 'center',
        children: [{ text: 'Before middle after', bold: true }],
      },
      paragraph('Unrelated content'),
    ];
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({
      at: { anchor: point(7), focus: point(13) },
    });
    const [{ retained }] = contents(editor.read.getField(authoredState));
    if (retained.kind === 'properties') assert.fail();
    const { positions: _positions, ...retainedContent } = retained;
    assert.deepEqual(retainedContent, {
      from: 2,
      kind: 'delete',
      slice: {
        content: [
          {
            type: 'paragraph',
            align: 'center',
            children: [{ text: 'middle', bold: true }],
          },
        ],
        openStart: 1,
        openEnd: 1,
      },
      to: 8,
    });
    assert.ok(Object.isFrozen(retained));
    assert.equal(JSON.stringify(retained).includes('Unrelated'), false);
    assert.deepEqual(editor.read.children(), initialValue);
    assert.equal(view.read.children()[0].children[0].text, 'Before  after');
  });

  it('retains a deleted row inside a standalone table fragment', () => {
    const row = (text: string) => ({
      type: 'tr',
      children: [{ type: 'td', children: [paragraph(text)] }],
    });
    const initialValue = [
      { type: 'table', children: [row('Removed'), row('Kept')] },
      paragraph('Following'),
    ];
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.remove({ at: [0, 0] });
    const [{ retained }] = contents(editor.read.getField(authoredState));
    assert.equal(retained.kind, 'delete');
    if (retained.kind === 'properties') assert.fail();
    assert.deepEqual(retained.slice, {
      content: [{ type: 'table', children: [row('Removed')] }],
      openStart: 1,
      openEnd: 1,
    });
    assert.equal(retained.from, 1);
    assert.deepEqual(view.read.children(), [
      { type: 'table', children: [row('Kept')] },
      paragraph('Following'),
    ]);
    assert.deepEqual(editor.read.value().children, initialValue);
  });

  it('retains removed content across differently formatted text boundaries', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Left', bold: true },
            { text: 'Right', italic: true },
          ],
        },
      ],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 1], offset: 3 },
      },
    });
    const removed = contents(editor.read.getField(authoredState)).filter(
      ({ retained }) => retained.kind === 'delete'
    );
    assert.ok(removed.length > 0);
    const text = removed.map(({ retained }) => JSON.stringify(retained));
    assert.ok(text.some((value) => value.includes('ft')));
    assert.ok(text.some((value) => value.includes('Rig')));
    assert.ok(text.some((value) => value.includes('"bold":true')));
    assert.ok(text.some((value) => value.includes('"italic":true')));
  });

  it('keeps the old properties without retaining the formatted node subtree', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('This content stays editable')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.set({ bold: true }, { at: [0, 0] });
    assert.deepEqual(
      contents(editor.read.getField(authoredState)).map(
        ({ retained }) => retained
      ),
      [{ kind: 'properties', nodeKind: 'text', properties: {} }]
    );
  });

  it('distinguishes an old placement from a deletion', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Moved'), paragraph('Stationary')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.move({ at: [0], to: [2] });
    const [{ retained }] = contents(editor.read.getField(authoredState));
    assert.equal(retained.kind, 'move');
    if (retained.kind === 'properties') assert.fail();
    assert.deepEqual(retained.slice.content, [paragraph('Moved')]);
    assert.equal(retained.slice.openStart, 0);
    assert.equal(retained.slice.openEnd, 0);
  });

  it('recovers the same counterpart from JSON without extending the stored operation', () => {
    const extension = authored({ authorId: 'alice' });
    const editor = createEditor({
      extensions: [history(), extension],
      initialValue: [paragraph('Original wording')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(0), focus: point(8) } });
    const saved = JSON.parse(JSON.stringify(editor.read.value()));
    const restored = createEditor({
      extensions: [history(), extension],
      initialValue: saved,
    });
    const original = contents(editor.read.getField(authoredState));
    const reopened = contents(restored.read.getField(authoredState));
    assert.equal(reopened.length, original.length);
    const comparable = (entries: typeof original) =>
      entries.map(({ retained, target }) => {
        if (retained.kind === 'properties') return { retained, target };
        const { positions, ...content } = retained;
        return {
          retained: content,
          spans: [...authoredPositionSpans(positions)],
          target,
        };
      });
    assert.deepEqual(comparable(reopened), comparable(original));
    assert.equal(JSON.stringify(saved).includes('openStart'), false);
    assert.notEqual(reopened[0].target, original[0].target);
    const restoredView = createEditorView(restored, { authored: markup });
    restoredView.update.text.insert('New ', { at: point(0) });
    assert.deepEqual(
      contents(restored.read.getField(authoredState))[0],
      reopened[0]
    );
  });

  it('retains the deleted named root and its root identity', () => {
    const before = {
      children: [paragraph('Main')],
      roots: { note: [paragraph('Footnote')] },
    };
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: before,
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.changes.apply(
        DocumentChange.between(before, { children: before.children })
      );
    });
    const [{ retained, target }] = contents(
      editor.read.getField(authoredState)
    );
    assert.equal(target.root, 'note');
    assert.equal(retained.kind, 'delete');
    if (retained.kind === 'properties') assert.fail();
    assert.deepEqual(retained.slice.content, [paragraph('Footnote')]);
  });

  it('publishes no counterpart from an aborted transaction', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Preserved')],
    });
    const view = createEditorView(editor, { authored: markup });
    assert.throws(() =>
      view.update((tx) => {
        tx.text.delete({ at: { anchor: point(0), focus: point(4) } });
        throw new Error('Abort');
      })
    );
    assert.deepEqual(contents(editor.read.getField(authoredState)), []);
    assert.deepEqual(editor.read.children(), [paragraph('Preserved')]);
  });
});
