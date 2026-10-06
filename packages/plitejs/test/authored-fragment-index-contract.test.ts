import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView, NodeApi } from '../src';
import { authored } from '../src/authored';
import { createAuthoredFragmentView } from '../src/core/authored-fragment-view';
import {
  type NativeAuthoredRenderSegment,
  readAuthoredViewFragments,
  readAuthoredViewFragmentSlots,
  readAuthoredViewRenderSegments,
  subscribeAuthoredViewFragmentSlots,
  updateAuthoredFragment,
} from '../src/core/authored-runtime';
import { history } from '../src/history';
import { createContentRootViewBoundaryGraph } from '../src/react/editable/content-root-owners';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const renderedText = (view: ReturnType<typeof createEditorView>) => {
  const graph = createContentRootViewBoundaryGraph(view, []);
  const seen = new Set<object>();
  const values: string[] = [];
  for (const node of graph.nodes) {
    const run = graph.textRunsByNode.get(node.key)?.run;
    if (run && !seen.has(run)) {
      seen.add(run);
      values.push(run.value);
    }
  }
  return values;
};
const markup = { intent: 'propose', projection: 'markup' } as const;
const point = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('native authored fragment collection', () => {
  it("coalesces another author's render segment after canceling text typed inside it", () => {
    let authorId = 'charlie';
    const editor = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('ABC')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.insert('overlapping', { at: point(1) });
    const charlie = editor.read.authored.changes({ authorId }).items[0];

    authorId = 'alice';
    view.update.selection.set(point(5));
    for (const character of 'xyz') view.update.text.insert(character);
    view.update.text.deleteBackward();
    view.update.text.deleteBackward();
    view.update.text.deleteBackward();

    const segments: NativeAuthoredRenderSegment[] = [];
    const collect = (segment: NativeAuthoredRenderSegment) => {
      if (segment.kind === 'element') segment.children.forEach(collect);
      else if (segment.changeId === charlie.id) segments.push(segment);
    };
    readAuthoredViewRenderSegments(
      view,
      view.read.children(),
      'main',
      [0]
    ).forEach(collect);

    assert.deepEqual(
      segments.map((segment) => ({
        end: segment.kind === 'text' ? segment.end : null,
        start: segment.kind === 'text' ? segment.start : null,
        text:
          segment.kind === 'text' && NodeApi.isText(segment.node)
            ? segment.node.text.slice(segment.start, segment.end)
            : '',
      })),
      [{ end: 12, start: 1, text: 'overlapping' }]
    );
  });

  for (const parent of ['source', 'view'] as const) {
    it(`continues a later paragraph after retained history and Enter through the ${parent}`, async () => {
      const editor = createEditor({
        plugins: [authored({ authorId: 'alice' }), history()],
        initialValue: [
          paragraph('Review and refine this sentence.'),
          paragraph('Keep this redundant phrase out of the final draft.'),
          paragraph('Try typing your own suggestion here.'),
        ],
      });
      const view =
        parent === 'source'
          ? editor
          : createEditorView(editor, { authored: markup });
      if (parent === 'source') editor.api.authored.setView(markup);
      view.update.text.insert('collaboratively ', { at: point(7) });
      view.update.text.delete({
        at: { anchor: point(10, 1), focus: point(27, 1) },
      });
      const deletion = editor.read.authored
        .changes()
        .items.find((change) => change.kind === 'delete');
      assert.ok(deletion);
      const retained = createAuthoredFragmentView(
        view,
        readAuthoredViewFragments(view, deletion.id)[0]
      );
      const inserted = updateAuthoredFragment(
        retained,
        (tx) => {
          tx.selection.set(point(6));
          tx.text.insert('X');
        },
        { tags: ['dom-text-input'] }
      );
      assert.equal(inserted?.fragmentId, null);
      assert.ok(inserted?.selection);
      view.update.selection.set(inserted.selection);
      view.update.text.insert('Y');
      view.update((tx) => {
        tx.history.newBatch();
        tx.text.deleteBackward();
      });
      await view.api.history.undo();
      await view.api.history.redo();
      view.update.text.insert('Z');
      view.update.break.insert();
      const blocks = () => renderedText(view).slice(1, 3);
      assert.deepEqual(blocks(), [
        'Keep this redundXZ',
        'ant phrase out of the final draft.',
      ]);
      view.update.text.insert('Q');
      assert.deepEqual(blocks(), [
        'Keep this redundXZ',
        'Qant phrase out of the final draft.',
      ]);
      assert.equal(NodeApi.string(view.read.children()[1]), 'Keep this XZ');
      const accepted = createEditorView(editor, {
        authored: { intent: 'edit', projection: 'accepted' },
      });
      assert.equal(
        NodeApi.string(accepted.read.children()[1]),
        'Keep this redundant phrase out of the final draft.'
      );
    });
  }

  for (const offset of [0, 2, 5]) {
    it(`continues live text after a retained paragraph break at offset ${offset}`, async () => {
      const editor = createEditor({
        plugins: [authored({ authorId: 'alice' }), history()],
        initialValue: [paragraph('Alpha bravo omega')],
      });
      const view = createEditorView(editor, { authored: markup });
      view.update.text.delete({ at: { anchor: point(6), focus: point(11) } });
      const { id } = editor.read.authored.changes().items[0];
      const retained = createAuthoredFragmentView(
        view,
        readAuthoredViewFragments(view, id)[0]
      );
      const inserted = updateAuthoredFragment(retained, (tx) => {
        tx.selection.set(point(offset));
        tx.text.insert('YZ');
        tx.break.insert();
      });
      assert.equal(inserted?.fragmentId, null);
      assert.ok(inserted?.selection);
      view.update.selection.set(inserted.selection);
      const blocks = () => renderedText(view);
      const expected = [
        `Alpha ${'bravo'.slice(0, offset)}YZ`,
        `${'bravo'.slice(offset)} omega`,
      ];
      assert.deepEqual(blocks(), expected);
      assert.equal(editor.read.text.string([]), 'Alpha bravo omega');
      assert.deepEqual(view.read.children().map(NodeApi.string), [
        'Alpha YZ',
        ' omega',
      ]);
      await view.api.history.undo();
      assert.deepEqual(blocks(), ['Alpha bravo omega']);
      await view.api.history.redo();
      assert.deepEqual(blocks(), expected);
      view.update.text.insert('X');
      assert.deepEqual(blocks(), [expected[0], `X${expected[1]}`]);
      assert.equal(editor.read.text.string([]), 'Alpha bravo omega');
      assert.deepEqual(view.read.children().map(NodeApi.string), [
        'Alpha YZ',
        'X omega',
      ]);
    });
  }

  it('notifies exact-view subscribers when markup visibility changes', async () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('ABC')],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    const key = view.key([0, 0]);
    assert.ok(key);
    await Promise.resolve();
    const seen: number[] = [];
    const stop = subscribeAuthoredViewFragmentSlots(view, key, () =>
      seen.push(readAuthoredViewFragmentSlots(view, key).length)
    );
    assert.deepEqual(readAuthoredViewFragmentSlots(view, key), []);
    view.api.authored.setView(markup);
    await Promise.resolve();
    view.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    await Promise.resolve();
    view.api.authored.setView(markup);
    await Promise.resolve();
    assert.deepEqual(seen, [1, 0, 1]);
    stop();
    stop();
    view.api.authored.setView({ intent: 'propose', projection: 'proposed' });
    await Promise.resolve();
    assert.deepEqual(seen, [1, 0, 1]);
  });

  for (const deletionOrder of ['BC', 'CB']) {
    it(`orders adjacent text deletions by content after deleting ${deletionOrder}`, () => {
      let authorId = 'alice';
      const editor = createEditor({
        plugins: [authored({ authorId: () => authorId })],
        initialValue: [paragraph('ABBCCD')],
      });
      const view = createEditorView(editor, { authored: markup });
      const key = view.key([0, 0]);
      assert.ok(key);
      readAuthoredViewFragmentSlots(view, key);
      for (const letter of deletionOrder) {
        authorId = letter;
        const offset = NodeApi.string(view.read.children()[0]).indexOf(letter);
        view.update.text.delete({
          at: { anchor: point(offset), focus: point(offset + 2) },
        });
      }
      const labels = () =>
        readAuthoredViewFragmentSlots(view, key).map((slot) => {
          const fragment = readAuthoredViewFragments(view, slot.changeId).find(
            (current) => current.id === slot.id
          );
          assert.ok(fragment && fragment.kind !== 'properties');
          return fragment.slice.content.map(NodeApi.string).join('');
        });
      assert.deepEqual(labels(), ['BB', 'CC']);
      authorId = 'accepted';
      editor.update.text.insert('!', { at: point(2) });
      assert.deepEqual(labels(), ['B', 'B', 'CC']);
      assert.equal(view.read.text.string([]), 'A!D');
    });

    it(`orders retained proposals from different origins after deleting ${deletionOrder}`, () => {
      let authorId = 'insert-c';
      const editor = createEditor({
        plugins: [authored({ authorId: () => authorId })],
        initialValue: [paragraph('AD')],
      });
      const view = createEditorView(editor, { authored: markup });
      view.update.text.insert('C', { at: point(1) });
      authorId = 'insert-b';
      view.update.text.insert('B', { at: point(1) });
      for (const letter of deletionOrder) {
        authorId = `delete-${letter}`;
        const offset = NodeApi.string(view.read.children()[0]).indexOf(letter);
        view.update.text.delete({
          at: { anchor: point(offset), focus: point(offset + 1) },
        });
      }
      const restored = createEditor({
        plugins: [authored({ authorId: 'reloaded' })],
        initialValue: editor.read.value(),
      });
      for (const current of [
        view,
        createEditorView(restored, { authored: markup }),
      ]) {
        const key = current.key([0, 0]);
        assert.ok(key);
        const labels = readAuthoredViewFragmentSlots(current, key).map(
          (slot) => {
            const fragment = readAuthoredViewFragments(
              current,
              slot.changeId
            ).find((currentFragment) => currentFragment.id === slot.id);
            assert.ok(fragment && fragment.kind !== 'properties');
            return fragment.slice.content.map(NodeApi.string).join('');
          }
        );
        assert.deepEqual(labels, ['B', 'C']);
      }
    });

    it(`orders adjacent deleted blocks after deleting ${deletionOrder}`, () => {
      let authorId = 'alice';
      const editor = createEditor({
        plugins: [authored({ authorId: () => authorId })],
        initialValue: ['A', 'B', 'C', 'D'].map(paragraph),
      });
      const view = createEditorView(editor, { authored: markup });
      const key = view.key([3]);
      assert.ok(key);
      readAuthoredViewFragmentSlots(view, key);
      for (const letter of deletionOrder) {
        authorId = letter;
        const index = view.read
          .children()
          .findIndex((node) => NodeApi.string(node) === letter);
        view.update.nodes.remove({ at: [index] });
      }
      const labels = readAuthoredViewFragmentSlots(view, key).map((slot) => {
        assert.equal(slot.side, 'before');
        const fragment = readAuthoredViewFragments(view, slot.changeId).find(
          (current) => current.id === slot.id
        );
        assert.ok(fragment && fragment.kind !== 'properties');
        return fragment.slice.content.map(NodeApi.string).join('');
      });
      assert.deepEqual(labels, ['B', 'C']);
    });
  }

  it('shares stable text slots across views and refreshes hidden accepted edits', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before middle after'), paragraph('Unrelated')],
    });
    const view = createEditorView(editor, { authored: markup });
    const other = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
    const key = view.key([0, 0]);
    assert.ok(key);
    const slots = readAuthoredViewFragmentSlots(view, key);
    assert.equal(slots.length, 1);
    assert.equal(slots[0].side, 'text');
    assert.equal(readAuthoredViewFragmentSlots(other, key), slots);
    assert.deepEqual(readAuthoredViewFragmentSlots(editor, key), []);
    let calls = 0;
    const stop = subscribeAuthoredViewFragmentSlots(view, key, () => {
      calls += 1;
    });
    editor.update.text.insert('!', { at: point(2, 1) });
    assert.equal(calls, 0);
    assert.equal(readAuthoredViewFragmentSlots(view, key), slots);
    view.update.text.insert('>', { at: point(0) });
    assert.equal(calls, 0);
    assert.equal(readAuthoredViewFragmentSlots(view, key), slots);
    assert.deepEqual(
      readAuthoredViewFragments(view, slots[0].changeId)[0].placement,
      {
        kind: 'text',
        point: point(8),
      }
    );
    editor.update.text.delete({ at: { anchor: point(12), focus: point(13) } });
    assert.equal(calls, 1);
    let [fragment] = readAuthoredViewFragments(view, slots[0].changeId);
    assert.notEqual(fragment.kind, 'properties');
    if (fragment.kind === 'properties') assert.fail();
    assert.equal(NodeApi.string(fragment.slice.content[0]), 'middl');
    editor.update.text.delete({ at: { anchor: point(11), focus: point(12) } });
    assert.equal(calls, 2);
    [fragment] = readAuthoredViewFragments(view, slots[0].changeId);
    if (fragment.kind === 'properties') assert.fail();
    assert.equal(NodeApi.string(fragment.slice.content[0]), 'midd');
    stop();
  });

  it('docks structural fragments to a sibling key through unrelated prepends', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [
        paragraph('First'),
        paragraph('Deleted'),
        paragraph('Last'),
      ],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.remove({ at: [1] });
    const key = view.key([1]);
    assert.ok(key);
    const slots = readAuthoredViewFragmentSlots(view, key);
    assert.equal(slots.length, 1);
    assert.equal(slots[0].side, 'before');
    let calls = 0;
    const stop = subscribeAuthoredViewFragmentSlots(view, key, () => {
      calls += 1;
    });
    editor.update.nodes.insert(paragraph('Prepended'), { at: [0] });
    assert.equal(view.key([2]), key);
    assert.equal(readAuthoredViewFragmentSlots(view, key), slots);
    assert.equal(calls, 0);
    assert.deepEqual(
      readAuthoredViewFragments(view, slots[0].changeId)[0].placement,
      {
        kind: 'children',
        path: [],
        index: 2,
      }
    );
    view.update.nodes.remove({ at: [2] });
    assert.equal(calls, 1);
    assert.deepEqual(readAuthoredViewFragmentSlots(view, key), []);
    const previous = view.key([1]);
    assert.ok(previous);
    assert.ok(
      readAuthoredViewFragmentSlots(view, previous).some(
        (slot) => slot.changeId === slots[0].changeId && slot.side === 'after'
      )
    );
    stop();
  });

  it('publishes decision slots atomically and restores them on review undo', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('ABC')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    const key = view.key([0, 0]);
    assert.ok(key);
    const [{ changeId }] = readAuthoredViewFragmentSlots(view, key);
    const seen: Array<{ count: number; status: string | undefined }> = [];
    const stop = subscribeAuthoredViewFragmentSlots(view, key, () =>
      seen.push({
        count: readAuthoredViewFragmentSlots(view, key).length,
        status: editor.read.authored.change(changeId)?.status,
      })
    );
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [changeId] }),
    });
    assert.deepEqual(seen, [{ count: 0, status: 'accepted' }]);
    editor.api.history.undo();
    assert.deepEqual(seen, [
      { count: 0, status: 'accepted' },
      { count: 1, status: 'pending' },
    ]);
    stop();
  });

  it('moves retained text back to its split leaf after undoing a rejection', async () => {
    let authorId = 'bob';
    const editor = createEditor({
      plugins: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Before remove after')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update((tx) => {
      tx.history.skip();
      tx.text.delete({ at: { anchor: point(7), focus: point(13) } });
    });
    authorId = 'alice';
    let id = '';
    view.update((tx) => {
      tx.history.skip();
      id = tx.authored.propose();
      tx.nodes.insert([{ text: 'proposal', bold: true }], { at: point(3) });
    });
    const dockingPaths = () =>
      [...NodeApi.texts(view)]
        .filter(
          ([, path]) =>
            readAuthoredViewFragmentSlots(view, view.key(path)).length > 0
        )
        .map(([, path]) => path);
    assert.deepEqual(dockingPaths(), [[0, 2]]);
    assert.equal(
      view.update.authored.decide({
        action: 'reject',
        selection: view.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(dockingPaths(), [[0, 0]]);
    assert.deepEqual(await view.api.history.undo(), { status: 'applied' });
    assert.deepEqual(dockingPaths(), [[0, 2]]);
    assert.deepEqual(await view.api.history.redo(), { status: 'applied' });
    assert.deepEqual(dockingPaths(), [[0, 0]]);
  });

  it('preserves the committed collection after an aborted proposal', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('ABCDE')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    const key = view.key([0, 0]);
    assert.ok(key);
    const slots = readAuthoredViewFragmentSlots(view, key);
    let calls = 0;
    const stop = subscribeAuthoredViewFragmentSlots(view, key, () => {
      calls += 1;
    });
    assert.throws(
      () =>
        view.update((tx) => {
          tx.text.delete({ at: { anchor: point(1), focus: point(2) } });
          assert.equal(readAuthoredViewFragmentSlots(view, key), slots);
          throw new Error('abort');
        }),
      /abort/
    );
    assert.equal(readAuthoredViewFragmentSlots(view, key), slots);
    assert.equal(calls, 0);
    stop();
  });

  it('keeps retained row slots inside their named root', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Main')],
        roots: { notes: [paragraph('A'), paragraph('B')] },
      },
    });
    const view = createEditorView(editor, { authored: markup, root: 'notes' });
    view.update.nodes.remove({ at: [0] });
    const key = view.key([0]);
    assert.ok(key);
    assert.equal(readAuthoredViewFragmentSlots(view, key).length, 1);
    const main = createEditorView(editor, { authored: markup });
    assert.deepEqual(readAuthoredViewFragmentSlots(main, key), []);
  });

  it('keeps a root slot when its last proposed child is deleted', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Only')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.nodes.remove({ at: [0] });
    const slots = readAuthoredViewFragmentSlots(view);
    assert.equal(slots.length, 1);
    assert.equal(slots[0].side, 'children');
    let calls = 0;
    const stop = subscribeAuthoredViewFragmentSlots(view, undefined, () => {
      calls += 1;
    });
    view.update.nodes.insert(paragraph('After'), { at: [0] });
    assert.equal(calls, 1);
    assert.deepEqual(readAuthoredViewFragmentSlots(view), []);
    const key = view.key([0]);
    assert.ok(key);
    assert.equal(readAuthoredViewFragmentSlots(view, key).length, 1);
    view.update.nodes.insert(paragraph('Before'), { at: [0] });
    const nextKey = view.key([0]);
    assert.ok(nextKey);
    assert.deepEqual(readAuthoredViewFragmentSlots(view, key), []);
    assert.equal(readAuthoredViewFragmentSlots(view, nextKey).length, 1);
    stop();
  });

  it('refreshes retained context properties without invalidating unrelated blocks', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [
        paragraph('Before middle after'),
        paragraph('Before middle after'),
      ],
    });
    const view = createEditorView(editor, { authored: markup });
    for (let block = 0; block < 2; block++) {
      view.update((tx) => {
        tx.authored.propose();
        tx.text.delete({
          at: { anchor: point(7, block), focus: point(13, block) },
        });
      });
    }
    const first = view.key([0, 0]);
    const second = view.key([1, 0]);
    assert.ok(first);
    assert.ok(second);
    const before = readAuthoredViewFragmentSlots(view, first);
    const unrelated = readAuthoredViewFragmentSlots(view, second);
    editor.update.nodes.set({ align: 'center' }, { at: [0] });
    assert.notEqual(readAuthoredViewFragmentSlots(view, first), before);
    assert.equal(readAuthoredViewFragmentSlots(view, second), unrelated);
    const [fragment] = readAuthoredViewFragments(view, before[0].changeId);
    if (fragment.kind === 'properties') assert.fail();
    assert.equal(fragment.slice.content[0].align, 'center');
  });

  it('rebuilds from a saved replacement and notifies removed docking nodes', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('ABCDE')],
    });
    const view = createEditorView(editor, { authored: markup });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    const key = view.key([0, 0]);
    assert.ok(key);
    const slots = readAuthoredViewFragmentSlots(view, key);
    const saved = JSON.parse(JSON.stringify(editor.read.value()));
    let calls = 0;
    const stop = subscribeAuthoredViewFragmentSlots(view, key, () => {
      calls += 1;
    });
    editor.update.value.replace({ children: [paragraph('Different')] });
    assert.equal(calls, 1);
    assert.deepEqual(readAuthoredViewFragmentSlots(view, key), []);
    editor.update.value.replace(saved);
    const restoredKey = view.key([0, 0]);
    assert.ok(restoredKey);
    const restored = readAuthoredViewFragmentSlots(view, restoredKey);
    assert.deepEqual(restored, slots);
    stop();
  });

  it('reads only the affected retained payload among independent proposals', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: Array.from({ length: 201 }, () =>
        paragraph('Before middle after')
      ),
    });
    const view = createEditorView(editor, { authored: markup });
    for (let block = 0; block < 200; block++) {
      view.update((tx) => {
        tx.authored.propose();
        tx.text.delete({
          at: { anchor: point(7, block), focus: point(13, block) },
        });
      });
    }
    const keys = Array.from({ length: 200 }, (_, block) => {
      const key = view.key([block, 0]);
      assert.ok(key);
      return key;
    });
    const slots = keys.map((key) => readAuthoredViewFragmentSlots(view, key));
    const scope = globalThis as typeof globalThis & {
      __EDITOR_REACT_RENDER_PROFILER__?: {
        acceptsCoreDuration: (id: string) => boolean;
        record: (event: { id: string }) => void;
      };
    };
    const previous = scope.__EDITOR_REACT_RENDER_PROFILER__;
    let reads = 0;
    scope.__EDITOR_REACT_RENDER_PROFILER__ = {
      acceptsCoreDuration: (id) => id === 'authored-markup',
      record: () => {
        reads += 1;
      },
    };
    try {
      editor.update.text.insert('!', { at: point(1, 200) });
      assert.equal(reads, 0);
      editor.update.text.insert('X', { at: point(10, 100) });
      assert.equal(reads, 1);
      keys.forEach((key, block) => {
        const current = readAuthoredViewFragmentSlots(view, key);
        if (block === 100) assert.notEqual(current, slots[block]);
        else assert.equal(current, slots[block]);
      });
    } finally {
      scope.__EDITOR_REACT_RENDER_PROFILER__ = previous;
    }
  });
});
