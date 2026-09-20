import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  schema,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const at = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('authored local history', () => {
  it('undoes and redoes a compound structural edit from a markup view', async () => {
    const cell = (text: string) => ({
      type: 'cell',
      children: [paragraph(text)],
    });
    const row = (...texts: string[]) => ({
      type: 'row',
      children: texts.map(cell),
    });
    const source = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [
        {
          type: 'table',
          children: [row('a', 'b'), row('c', 'd')],
        },
      ],
    });
    const view = createEditorView(source, {
      authored: { intent: 'edit', projection: 'markup' },
    });
    const before = structuredClone(view.read.children());

    view.update((tx) => {
      tx.nodes.insert(cell(''), { at: [0, 0, 2] });
      tx.nodes.insert(cell(''), { at: [0, 1, 2] });
      tx.nodes.insert(row('', '', ''), { at: [0, 2] });
      tx.nodes.replaceChildren([paragraph('x')], { at: [0, 1, 1] });
      tx.nodes.replaceChildren([paragraph('y')], { at: [0, 1, 2] });
      tx.nodes.replaceChildren([paragraph('z')], { at: [0, 2, 1] });
      tx.nodes.replaceChildren([paragraph('w')], { at: [0, 2, 2] });
    });
    const after = structuredClone(view.read.children());

    assert.notDeepEqual(after, before);
    assert.equal(view.read.history().undos.length, 1);
    const undo = await view.api.history.undo();
    assert.equal(undo.status, 'applied');
    assert.deepEqual(view.read.children(), before);
    const redo = await view.api.history.redo();
    assert.equal(redo.status, 'applied');
    assert.deepEqual(view.read.children(), after);
  });

  it('replays a proposal, acceptance and dependent accepted typing', async () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.authored.decide({
        action: 'accept',
        selection: editor.read.authored.select({ ids: [id] }),
      });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('!', { at: at(10) });
    });

    for (let step = 0; step < 3; step++) {
      const result = await editor.api.history.undo();
      assert.equal(result.status, 'applied');
    }
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    for (let step = 0; step < 3; step++) {
      const result = await editor.api.history.redo();
      assert.equal(result.status, 'applied');
    }
    assert.deepEqual(editor.read.children(), [paragraph('Base draft!')]);
    const reopened = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.deepEqual(reopened.read.children(), editor.read.children());
  });

  for (const pending of [false, true]) {
    it(`replays ${pending ? 'pending' : 'accepted'} property undo and redo without losing writer ownership`, () => {
      const source = createEditor({
        plugins: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('Text')],
      });
      const view = pending
        ? createEditorView(source, {
            authored: { intent: 'propose', projection: 'proposed' },
          })
        : source;
      view.update.nodes.set({ bold: true }, { at: [0, 0] });
      view.api.history.undo();
      assert.deepEqual(view.read.children(), [paragraph('Text')]);
      view.api.history.redo();
      assert.deepEqual(view.read.children(), [
        { type: 'paragraph', children: [{ text: 'Text', bold: true }] },
      ]);
      const reopened = createEditor({
        plugins: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const restored = pending
        ? createEditorView(reopened, {
            authored: { intent: 'propose', projection: 'proposed' },
          })
        : reopened;
      assert.deepEqual(restored.read.children(), view.read.children());
    });
  }

  it('restores each prior status when an accept batch includes an accepted member', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    let a = '';
    let b = '';
    editor.update((tx) => {
      a = tx.authored.propose();
      tx.text.insert(' one', { at: at(1) });
    });
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a] }),
    });
    editor.update((tx) => {
      b = tx.authored.propose();
      tx.text.insert(' two', { at: at(1, 1) });
    });
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a, b] }),
    });
    editor.api.history.undo();
    assert.equal(editor.read.authored.change(a)?.status, 'accepted');
    assert.equal(editor.read.authored.change(b)?.status, 'pending');
    assert.deepEqual(editor.read.children(), [
      paragraph('A one'),
      paragraph('B'),
    ]);
    editor.api.history.redo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A one'),
      paragraph('B two'),
    ]);
  });

  it('preserves a dependent pending edit when undoing its parents acceptance', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let a = '';
    let b = '';
    editor.update((tx) => {
      a = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      b = tx.authored.propose();
      tx.text.insert('B', { at: at(6) });
    });
    authorId = 'alice';
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a] }),
    });
    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    assert.equal(editor.read.authored.change(a)?.status, 'pending');
    assert.equal(editor.read.authored.change(b)?.status, 'pending');
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base dBraft')]);
    });
  });

  it('blocks acceptance undo after a dependent contribution is accepted', async () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let a = '';
    let b = '';
    editor.update((tx) => {
      a = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      b = tx.authored.propose();
      tx.text.insert('B', { at: at(6) });
    });
    authorId = 'alice';
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a] }),
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      tx.authored.decide({
        action: 'accept',
        selection: tx.authored.select({ ids: [b] }),
      });
    });
    authorId = 'alice';
    const before = editor.read.value();
    const batches = editor.read.history().undos.length;
    const result = await editor.api.history.undo();

    assert.deepEqual(result, { status: 'blocked', conflicts: [b] });
    assert.equal(
      result.status === 'blocked' && Object.isFrozen(result.conflicts),
      true
    );
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history().undos.length, batches);
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`undoes and redoes ${action} with retained reviewer operations`, () => {
      const editor = createEditor({
        plugins: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('Base')],
      });
      let id = '';
      editor.update((tx) => {
        id = tx.authored.propose();
        tx.text.insert(' draft', { at: at(4) });
      });
      assert.equal(
        editor.update.authored.decide({
          action,
          selection: editor.read.authored.select({ ids: [id] }),
        }).status,
        'applied'
      );
      assert.equal(
        editor.read.authored.change(id)?.status,
        action === 'accept' ? 'accepted' : 'rejected'
      );
      editor.api.history.undo();
      assert.equal(editor.read.authored.change(id)?.status, 'pending');
      assert.deepEqual(editor.read.children(), [paragraph('Base')]);
      editor.update((tx) => {
        tx.authored.propose({ changeId: id });
        assert.deepEqual(tx.children(), [paragraph('Base draft')]);
      });
      const restored = createEditor({
        plugins: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(editor.read.value())),
      });
      assert.equal(restored.read.authored.change(id)?.status, 'pending');
      restored.update((tx) => {
        tx.authored.propose({ changeId: id });
        assert.deepEqual(tx.children(), [paragraph('Base draft')]);
      });
      editor.api.history.redo();
      assert.equal(
        editor.read.authored.change(id)?.status,
        action === 'accept' ? 'accepted' : 'rejected'
      );
      assert.deepEqual(editor.read.children(), [
        paragraph(action === 'accept' ? 'Base draft' : 'Base'),
      ]);
      assert.equal(editor.read.authored.change(id)?.revision, 4);
    });
  }

  for (const action of ['accept', 'reject'] as const) {
    it(`undoes and redoes a markup-view ${action} decision spanning inline boundaries`, async () => {
      const inline = defineEditorSchema('authored-history-review-inline', {
        elements: {
          link: {
            content: schema.content.text({ default: 'text', min: 1 }),
            inline: true,
          },
        },
        id: 'authored-history-review-inline',
        root: schema.content.not(schema.content.text()),
        unknown: 'preserve',
        version: 1,
      });
      const editor = createEditor({
        plugins: [inline, history(), authored({ authorId: 'alice' })],
        initialValue: [
          {
            type: 'paragraph',
            children: [{ text: 'Use  here' }],
          },
        ],
      });
      let id = '';

      editor.update((tx) => {
        tx.history.skip();
        id = tx.authored.propose();
        tx.nodes.insert(
          [
            {
              type: 'link',
              url: '/docs',
              children: [{ text: 'suggestions' }],
            },
            { text: ' like this' },
          ],
          { at: { path: [0, 0], offset: 4 } }
        );
      });

      const view = createEditorView(editor, {
        authored: { intent: 'propose', projection: 'markup' },
      });
      assert.equal(
        view.update.authored.decide({
          action,
          selection: view.read.authored.select({ ids: [id] }),
        }).status,
        'applied'
      );
      assert.deepEqual(await view.api.history.undo(), { status: 'applied' });
      assert.equal(view.read.authored.change(id)?.status, 'pending');
      assert.deepEqual(await view.api.history.redo(), { status: 'applied' });
      assert.equal(
        view.read.authored.change(id)?.status,
        action === 'accept' ? 'accepted' : 'rejected'
      );
    });
  }

  it('undoes one amendment and redoes it under the same pending identity', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: at(10) });
    });
    assert.equal(editor.read.history().undos.length, 2);
    editor.api.history.undo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft')]);
    });
    assert.equal(editor.read.authored.change(id)?.status, 'pending');
    assert.equal(editor.read.authored.changes().items.length, 1);
    editor.api.history.redo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft!')]);
    });
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    const restored = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.equal(
      restored.update.authored.decide({
        action: 'accept',
        selection: restored.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(restored.read.children(), [paragraph('Base draft!')]);
  });

  it('undoes accepted text while preserving a later independent author', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [
        authored({ authorId: () => authorId, retainHistory: true }),
        history(),
      ],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    editor.update.text.insert(' alice', { at: at(1) });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      tx.text.insert(' bob', { at: at(1, 1) });
    });
    authorId = 'alice';
    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B bob'),
    ]);
    editor.api.history.redo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A alice'),
      paragraph('B bob'),
    ]);
    assert.equal(
      editor.read.authored.changes({ authorId: 'bob' }).items.length,
      1
    );
  });

  it('rejects nested undo without consuming its history batch', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    const before = editor.read.value();
    assert.throws(
      () =>
        editor.update(() => {
          editor.api.history.undo();
        }),
      /update/i
    );
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 0);

    let caught: unknown;
    editor.update(() => {
      try {
        editor.api.history.undo();
      } catch (error) {
        caught = error;
      }
    });

    assert.match(String(caught), /editor\.update/);
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 0);
  });

  it('captures a review decision and accepted suffix as one reversible batch', async () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';

    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    const beforeActionDepth = editor.read.history().undos.length;

    editor.update((tx) => {
      tx.history.newBatch();
      const result = tx.authored.decide({
        action: 'reject',
        selection: tx.authored.select({ ids: [id] }),
      });

      assert.equal(result.status, 'applied');
      tx.text.insert(' final', { at: at(4) });
    });

    assert.deepEqual(editor.read.children(), [paragraph('Base final')]);
    assert.equal(editor.read.authored.change(id)?.status, 'rejected');
    assert.equal(editor.read.history().undos.length, beforeActionDepth + 1);

    assert.deepEqual(await editor.api.history.undo(), { status: 'applied' });
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    assert.equal(editor.read.authored.change(id)?.status, 'pending');

    assert.deepEqual(await editor.api.history.redo(), { status: 'applied' });
    assert.deepEqual(editor.read.children(), [paragraph('Base final')]);
    assert.equal(editor.read.authored.change(id)?.status, 'rejected');
  });

  it('captures a review decision and structural replacement suffix', async () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base'), paragraph('Tail')],
    });
    let id = '';

    editor.update((tx) => {
      id = tx.authored.propose();
      tx.nodes.replaceChildren([paragraph('Draft')], {
        at: [],
        count: 1,
        index: 0,
      });
    });
    const beforeActionDepth = editor.read.history().undos.length;

    editor.update((tx) => {
      tx.history.newBatch();
      const result = tx.authored.decide({
        action: 'reject',
        selection: tx.authored.select({ ids: [id] }),
      });

      assert.equal(result.status, 'applied');
      tx.nodes.replaceChildren([paragraph('Final')], {
        at: [],
        count: 1,
        index: 0,
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('Final'),
      paragraph('Tail'),
    ]);
    assert.equal(editor.read.authored.change(id)?.status, 'rejected');
    assert.equal(editor.read.history().undos.length, beforeActionDepth + 1);

    assert.deepEqual(await editor.api.history.undo(), { status: 'applied' });
    assert.deepEqual(editor.read.children(), [
      paragraph('Base'),
      paragraph('Tail'),
    ]);
    assert.equal(editor.read.authored.change(id)?.status, 'pending');

    assert.deepEqual(await editor.api.history.redo(), { status: 'applied' });
    assert.deepEqual(editor.read.children(), [
      paragraph('Final'),
      paragraph('Tail'),
    ]);
    assert.equal(editor.read.authored.change(id)?.status, 'rejected');
  });

  it('rejects another review decision after an accepted suffix', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const ids: string[] = [];

    for (const text of [' one', ' two']) {
      editor.update((tx) => {
        ids.push(tx.authored.propose());
        tx.text.insert(text, { at: at(4) });
      });
    }
    const before = editor.read.value();
    const beforeHistory = editor.read.history();

    assert.throws(() => {
      editor.update((tx) => {
        tx.authored.decide({
          action: 'reject',
          selection: tx.authored.select({ ids: [ids[0]] }),
        });
        tx.text.insert(' accepted', { at: at(4) });
        tx.authored.decide({
          action: 'reject',
          selection: tx.authored.select({ ids: [ids[1]] }),
        });
      });
    }, /cannot follow ordinary document writes/);

    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(editor.read.history(), beforeHistory);
  });

  it('keeps merged amendments reversible and rejection atomic after undo', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.history.merge();
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: at(10) });
    });
    assert.equal(editor.read.history().undos.length, 1);
    editor.api.history.undo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
    editor.api.history.redo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft!')]);
    });
    assert.equal(
      editor.update.authored.decide({
        action: 'reject',
        selection: editor.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
  });

  it('does not merge explicit history across distinct proposal identities', () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });

    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' one', { at: at(4) });
    });
    editor.update((tx) => {
      tx.history.merge();
      tx.authored.propose();
      tx.text.insert(' two', { at: at(4) });
    });

    assert.equal(editor.read.history().undos.length, 2);
    assert.equal(
      editor.read.authored.changes({ status: 'pending' }).items.length,
      2
    );
  });

  it('refuses to erase a dependent foreign proposal during undo', async () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.text.insert('B', { at: at(6) });
    });
    authorId = 'alice';
    const before = editor.read.value();
    const result = await editor.api.history.undo();

    assert.equal(result.status, 'blocked');
    assert.equal(
      result.status === 'blocked' && Object.isFrozen(result.conflicts),
      true
    );
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 0);
  });

  it('replays successive unmerged undo and redo without creating review decisions', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' }), history()],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: at(10) });
    });
    editor.api.history.undo();
    editor.api.history.undo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
    editor.api.history.redo();
    editor.api.history.redo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft!')]);
    });
    assert.equal(editor.read.authored.change(id)?.status, 'pending');
    assert.equal(editor.read.authored.change(id)?.revision, 6);
  });
});
