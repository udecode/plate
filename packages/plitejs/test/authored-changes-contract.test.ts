import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  defineExtensionSlot,
  DocumentChange,
  type EditorCommit,
} from 'plitejs';
import { authored } from 'plitejs/authored';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('native authored changes', () => {
  it('publishes one retained proposal without changing accepted content', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Accepted')],
    });
    const commits: EditorCommit[] = [];
    editor.subscribeCommit((commit) => commits.push(commit));
    let changeId = '';
    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' proposed', { at: point(8) });
      tx.text.insert('!', { at: point(17) });
      assert.deepEqual(tx.children(), [paragraph('Accepted proposed!')]);
    });
    assert.deepEqual(editor.read.children(), [paragraph('Accepted')]);
    assert.deepEqual(editor.read.value().children, [paragraph('Accepted')]);
    assert.equal(commits.length, 1);
    assert.equal(commits[0].changes.empty, true);
    assert.equal(commits[0].changed.has('document'), false);
    assert.deepEqual(commits[0].dirtyStateKeys, ['authored']);
    assert.equal(editor.read.authored.changes().items.length, 1);
    assert.equal(editor.read.authored.change(changeId)?.authorId, 'alice');
    assert.equal(editor.read.authored.change(changeId)?.status, 'pending');
    assert.equal(editor.read.authored.change(changeId)?.revision, 1);
    assert.equal(Object.isFrozen(editor.read.authored.change(changeId)), true);
    assert.ok(editor.read.value().meta?.authored);
  });

  it('reloads a proposal and amends the same logical contribution', () => {
    const extension = authored({ authorId: 'alice' });
    const editor = createEditor({
      extensions: [extension],
      initialValue: [paragraph('Base')],
    });
    let changeId = '';
    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const restored = createEditor({
      extensions: [extension],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      assert.equal(tx.authored.propose({ changeId }), changeId);
      assert.deepEqual(tx.children(), [paragraph('Base draft')]);
      tx.text.insert('!', { at: point(10) });
    });
    assert.deepEqual(restored.read.children(), [paragraph('Base')]);
    assert.equal(restored.read.authored.changes().items.length, 1);
    assert.equal(restored.read.authored.change(changeId)?.revision, 2);
  });

  it('captures direct canonical writes with one transaction identity', () => {
    let identity = 'alice';
    let identityReads = 0;
    const editor = createEditor({
      extensions: [
        authored({
          authorId: () => {
            identityReads++;
            return identity;
          },
          retainHistory: true,
        }),
      ],
      initialValue: [paragraph('Before')],
    });
    const change = DocumentChange.between(editor.read.value(), {
      children: [paragraph('After')],
    });
    editor.update((tx) => {
      tx.changes.apply(change);
      identity = 'bob';
      tx.text.insert('!', { at: point(5) });
    });
    assert.equal(identityReads, 1);
    assert.deepEqual(editor.read.children(), [paragraph('After!')]);
    assert.equal(editor.read.authored.changes().items[0].authorId, 'alice');
    assert.equal(editor.read.authored.changes().items[0].status, 'accepted');
  });

  it('rolls back missing identity, late intent and aborted proposal state', () => {
    let identity: string | null = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => identity })],
      initialValue: [paragraph('Base')],
    });
    const before = JSON.stringify(editor.read.value());
    let commits = 0;
    editor.subscribeCommit(() => commits++);
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.authored.propose();
          tx.text.insert(' lost', { at: point(4) });
          throw new Error('abort');
        }),
      /abort/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert(' lost', { at: point(4) });
          tx.authored.propose();
        }),
      /before the first document mutation/
    );
    identity = null;
    assert.throws(
      () => editor.update.text.insert('lost', { at: point(4) }),
      /author is required/
    );
    assert.throws(
      () => editor.update((tx) => tx.authored.propose()),
      /author is required/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    assert.equal(commits, 0);
    identity = 'alice';
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base')]);
      tx.text.insert(' saved', { at: point(4) });
    });
    assert.equal(editor.read.authored.changes().items.length, 1);
  });

  it('preserves independent accepted edits through proposal reload', () => {
    const extension = authored({ authorId: 'alice', retainHistory: true });
    const editor = createEditor({
      extensions: [extension],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(1) });
    });
    editor.update.text.insert(' accepted', { at: point(1, 1) });
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B accepted'),
    ]);
    const restored = createEditor({
      extensions: [extension],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('A draft'),
        paragraph('B accepted'),
      ]);
      tx.text.insert('!', { at: point(6) });
    });
    assert.deepEqual(restored.read.children(), [
      paragraph('A'),
      paragraph('B accepted'),
    ]);
  });

  it('derives text and container dependencies while leaving adjacent edits independent', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let parent = '';
    editor.update((tx) => {
      parent = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    authorId = 'bob';
    let child = '';
    editor.update((tx) => {
      child = tx.authored.propose();
      tx.text.insert('B', { at: point(7) });
    });
    assert.deepEqual(editor.read.authored.change(child)?.dependencies, [
      parent,
    ]);
    let adjacent = '';
    editor.update((tx) => {
      adjacent = tx.authored.propose();
      tx.text.insert('!', { at: point(11) });
    });
    assert.deepEqual(editor.read.authored.change(adjacent)?.dependencies, []);
    authorId = 'alice';
    let container = '';
    editor.update((tx) => {
      container = tx.authored.propose();
      tx.nodes.insert(paragraph('Parent'), { at: [1] });
    });
    authorId = 'bob';
    let nested = '';
    editor.update((tx) => {
      nested = tx.authored.propose();
      tx.text.insert(' child', { at: point(6, 1) });
    });
    assert.deepEqual(editor.read.authored.change(nested)?.dependencies, [
      container,
    ]);
    const restored = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.deepEqual(restored.read.authored.change(child)?.dependencies, [
      parent,
    ]);
    assert.deepEqual(restored.read.authored.change(nested)?.dependencies, [
      container,
    ]);
  });

  it('tracks conflicting property writes without depending on unrelated properties', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let format = '';
    editor.update((tx) => {
      format = tx.authored.propose();
      tx.nodes.set({ bold: true }, { at: [0, 0] });
    });
    authorId = 'bob';
    let independent = '';
    editor.update((tx) => {
      independent = tx.authored.propose();
      tx.nodes.set({ italic: true }, { at: [0, 0] });
    });
    assert.deepEqual(
      editor.read.authored.change(independent)?.dependencies,
      []
    );
    let dependent = '';
    editor.update((tx) => {
      dependent = tx.authored.propose();
      tx.nodes.set({ bold: false }, { at: [0, 0] });
    });
    assert.deepEqual(editor.read.authored.change(dependent)?.dependencies, [
      format,
    ]);
  });

  it('blocks incomplete decisions and accepts a parent without accepting its child', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let parent = '';
    editor.update((tx) => {
      parent = tx.authored.propose();
      tx.nodes.insert(paragraph('Parent'), { at: [1] });
    });
    authorId = 'bob';
    let child = '';
    editor.update((tx) => {
      child = tx.authored.propose();
      tx.text.insert(' child', { at: point(6, 1) });
    });
    const snapshot = JSON.stringify(editor.read.value());
    const parentSelection = editor.read.authored.select({ ids: [parent] });
    const childSelection = editor.read.authored.select({ ids: [child] });
    assert.deepEqual(
      editor.update.authored.decide({
        action: 'accept',
        selection: childSelection,
      }),
      {
        status: 'blocked',
        ids: [child],
        dependencies: [parent],
        dependants: [],
        conflicts: [],
      }
    );
    assert.deepEqual(
      editor.update.authored.decide({
        action: 'reject',
        selection: parentSelection,
      }),
      {
        status: 'blocked',
        ids: [parent],
        dependencies: [],
        dependants: [child],
        conflicts: [],
      }
    );
    assert.equal(JSON.stringify(editor.read.value()), snapshot);
    assert.equal(
      editor.read.authored.preview({
        action: 'accept',
        selection: parentSelection,
      }).status,
      'applied'
    );
    assert.equal(JSON.stringify(editor.read.value()), snapshot);
    authorId = 'reviewer';
    assert.equal(
      editor.update.authored.decide({
        action: 'accept',
        selection: parentSelection,
      }).status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('Base'),
      paragraph('Parent'),
    ]);
    assert.equal(editor.read.authored.change(parent)?.authorId, 'alice');
    assert.equal(editor.read.authored.change(parent)?.status, 'accepted');
    assert.equal(editor.read.authored.change(child)?.status, 'pending');
    const restored = createEditor({
      extensions: [authored({ authorId: 'reviewer' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('Base'),
        paragraph('Parent child'),
      ]);
    });
    assert.equal(
      restored.update.authored.decide({
        action: 'reject',
        selection: restored.read.authored.select({ ids: [child] }),
      }).status,
      'applied'
    );
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base'), paragraph('Parent')]);
    });
  });

  it('rejects a complete dependent batch and preserves an independent accepted edit', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    let parent = '';
    editor.update((tx) => {
      parent = tx.authored.propose();
      tx.text.insert(' draft', { at: point(1) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' child', { at: point(4) });
    });
    editor.update.text.insert(' accepted', { at: point(1, 1) });
    const selected = editor.read.authored.select({ status: 'pending' });
    assert.equal(selected.changes.length, 2);
    let commits = 0;
    editor.subscribeCommit(() => commits++);
    assert.equal(
      editor.update.authored.decide({ selection: selected, action: 'reject' })
        .status,
      'applied'
    );
    assert.equal(commits, 1);
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B accepted'),
    ]);
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('A'),
        paragraph('B accepted'),
      ]);
    });
    assert.equal(editor.read.authored.change(parent)?.status, 'rejected');
    const restored = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('A'),
        paragraph('B accepted'),
      ]);
    });
  });

  it('binds author batches to exact revisions and leaves later changes outside the selection', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let first = '';
    editor.update((tx) => {
      first = tx.authored.propose();
      tx.text.insert(' first', { at: point(4) });
    });
    const stale = editor.read.authored.select({
      authorId: 'alice',
      status: 'pending',
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: first });
      tx.text.insert('!', { at: point(10) });
    });
    assert.deepEqual(
      editor.update.authored.decide({ selection: stale, action: 'accept' }),
      { status: 'stale', ids: [first] }
    );
    const frozen = editor.read.authored.select({
      authorId: 'alice',
      status: 'pending',
    });
    let second = '';
    editor.update((tx) => {
      second = tx.authored.propose();
      tx.nodes.insert(paragraph('Second'), { at: [1] });
    });
    assert.equal(
      editor.update.authored.decide({ selection: frozen, action: 'accept' })
        .status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [paragraph('Base first!')]);
    assert.equal(editor.read.authored.change(second)?.status, 'pending');
    assert.deepEqual(
      editor.update.authored.decide({
        selection: editor.read.authored.select({ ids: [] }),
        action: 'reject',
      }),
      { status: 'unchanged', ids: [] }
    );
  });

  it('rolls back a decided batch when the surrounding transaction fails', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const before = JSON.stringify(editor.read.value());
    const selection = editor.read.authored.select({ status: 'pending' });
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.authored.decide({ selection, action: 'accept' });
          throw new Error('abort decision');
        }),
      /abort decision/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base draft')]);
    });
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.authored.decide({ selection, action: 'accept' });
          tx.text.insert(' untracked', { at: point(10) });
        }),
      /cannot mix/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
  });

  it('ignores duplicate authored delivery and rejects identity reuse with another payload', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const commits: EditorCommit[] = [];
    editor.subscribeCommit((commit) => commits.push(commit));
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const effect = commits[0].effects.find(
      (effect) => effect.type.key === 'authored.operation'
    );
    assert.ok(effect);
    const before = JSON.stringify(editor.read.value());
    editor.update((tx) => tx.effects.emit(effect.type, effect.value));
    assert.equal(commits.length, 1);
    assert.equal(JSON.stringify(editor.read.value()), before);
    const changed = JSON.parse(JSON.stringify(effect.value));
    changed.authorId = 'bob';
    assert.throws(
      () => editor.update((tx) => tx.effects.emit(effect.type, changed)),
      /identity collision/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    assert.equal(commits.length, 1);
  });

  it('resolves display ranges through independent edits and decisions', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let identity = '';
    editor.update((tx) => {
      identity = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    assert.deepEqual(editor.read.authored.change(identity)?.ranges, [
      { anchor: point(4), focus: point(4) },
    ]);
    editor.update.text.insert('Before ', { at: point(0) });
    assert.deepEqual(editor.read.authored.change(identity)?.ranges, [
      { anchor: point(11), focus: point(11) },
    ]);
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [identity] }),
    });
    assert.deepEqual(editor.read.authored.change(identity)?.ranges, [
      { anchor: point(11), focus: point(17) },
    ]);
  });

  it('preserves attribution through replacement, rollback and removal', () => {
    const slot = defineExtensionSlot('author');
    const editor = createEditor({
      extensions: [slot.of(authored({ authorId: 'alice' }))],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert('a', { at: point(4) });
    editor.update.extensions.reconfigure(slot, authored({ authorId: 'bob' }));
    editor.update.text.insert('b', { at: point(5) });
    assert.deepEqual(
      editor.read.authored.changes().items.map((change) => change.authorId),
      ['alice', 'bob']
    );
    const before = JSON.stringify(editor.read.value());
    assert.throws(
      () =>
        editor.update.extensions.reconfigure(slot, [
          authored({ authorId: 'charlie' }),
          defineExtension('broken', {
            activate() {
              throw new Error('broken activation');
            },
          }),
        ]),
      /broken activation/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    editor.update.text.insert('c', { at: point(6) });
    assert.equal(editor.read.authored.changes().items.at(-1)?.authorId, 'bob');
    editor.update.extensions.reconfigure(slot, []);
    assert.throws(
      () => editor.update.text.insert('lost', { at: point(7) }),
      /authored/i
    );
    assert.deepEqual(editor.read.children(), [paragraph('Baseabc')]);
  });

  it('rejects corrupted checkpoint summaries and unknown payload versions', () => {
    const extension = authored({ authorId: 'alice' });
    const editor = createEditor({
      extensions: [extension],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const saved = JSON.stringify(editor.read.value());
    for (const [path, replacement] of [
      [['meta', 'authored', 'version'], 2],
      [['meta', 'authored', 'value', 'clock'], 200],
      [
        ['meta', 'authored', 'value', 'changes', 'entries', 0, 1, 'status'],
        'accepted',
      ],
      [
        [
          'meta',
          'authored',
          'value',
          'operations',
          'entries',
          0,
          1,
          'authorId',
        ],
        'bob',
      ],
      [['meta', 'authored', 'value', 'frontier'], []],
      [['meta', 'authored', 'value', 'order'], null],
      [['meta', 'authored', 'value', 'extra'], true],
    ] as const) {
      const value = JSON.parse(saved);
      let target = value;
      for (const key of path.slice(0, -1)) target = Reflect.get(target, key);
      Reflect.set(target, path[path.length - 1], replacement);
      assert.throws(() =>
        createEditor({ extensions: [extension], initialValue: value })
      );
    }
    assert.equal(JSON.stringify(editor.read.value()), saved);
  });

  it('rejects a causal vector that drops an ancestor observed by its parent', () => {
    let editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    for (let index = 0; index < 3; index++) {
      if (index)
        editor = createEditor({
          extensions: [authored({ authorId: 'alice' })],
          initialValue: JSON.parse(JSON.stringify(editor.read.value())),
        });
      editor.update((tx) => {
        tx.authored.propose();
        tx.nodes.insert(paragraph(`Proposal ${index}`), { at: [index + 1] });
      });
    }
    const saved = JSON.parse(JSON.stringify(editor.read.value()));
    const operations = saved.meta.authored.value.operations.entries.map(
      (
        entry: readonly [
          string,
          { clock: number; replica: string; seen: unknown },
        ]
      ) => entry[1]
    );
    const parent = operations.find(
      (operation: { clock: number }) => operation.clock === 2
    );
    const child = operations.find(
      (operation: { clock: number }) => operation.clock === 3
    );
    child.seen = {
      kind: 'leaf',
      first: parent.replica,
      height: 1,
      count: 1,
      entries: [[parent.replica, 1]],
    };
    assert.throws(
      () =>
        createEditor({
          extensions: [authored({ authorId: 'alice' })],
          initialValue: saved,
        }),
      /causal|prerequisite|observation/i
    );
  });
});
