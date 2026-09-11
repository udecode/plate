import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  DocumentChange,
  type EditorDocumentValue,
} from 'plitejs';
import { authored } from 'plitejs/authored';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const base = [paragraph('First'), paragraph('Second')];
const cases: ReadonlyArray<
  readonly [string, EditorDocumentValue, EditorDocumentValue]
> = [
  ['delete a block', { children: base }, { children: [base[1]] }],
  [
    'split a block',
    { children: base },
    { children: [paragraph('Fi'), paragraph('rst'), base[1]] },
  ],
  [
    'merge blocks',
    { children: base },
    { children: [paragraph('FirstSecond')] },
  ],
  [
    'wrap blocks',
    { children: base },
    { children: [{ type: 'quote', children: base }] },
  ],
  ['reorder blocks', { children: base }, { children: [base[1], base[0]] }],
  [
    'format different leaves',
    {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'First', bold: true }, { text: 'Second' }],
        },
      ],
    },
    {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'First', italic: true },
            { text: 'Second', bold: true },
          ],
        },
      ],
    },
  ],
  [
    'create a named root',
    { children: base },
    { children: base, roots: { note: [paragraph('Note')] } },
  ],
  [
    'delete a named root',
    { children: base, roots: { note: [paragraph('Note')] } },
    { children: base },
  ],
  [
    'empty a named root',
    { children: base, roots: { note: [paragraph('Note')] } },
    { children: base, roots: { note: [] } },
  ],
];

describe('authored structural decisions', () => {
  for (const [name, before, after] of cases)
    for (const action of ['accept', 'reject'] as const)
      it(`${action}: ${name} survives decision and reload`, () => {
        const extension = authored({ authorId: 'alice' });
        const editor = createEditor({
          extensions: [extension],
          initialValue: before,
        });
        editor.update((tx) => {
          tx.authored.propose();
          tx.changes.apply(DocumentChange.between(before, after));
        });
        const decision = {
          action,
          selection: editor.read.authored.select({ status: 'pending' }),
        };
        assert.equal(editor.read.authored.preview(decision).status, 'applied');
        assert.equal(editor.update.authored.decide(decision).status, 'applied');
        const expected = action === 'accept' ? after : before;
        assert.deepEqual(editor.read.children(), expected.children);
        assert.deepEqual(editor.read.value().roots ?? {}, expected.roots ?? {});
        const restored = createEditor({
          extensions: [extension],
          initialValue: JSON.parse(JSON.stringify(editor.read.value())),
        });
        restored.update((tx) => {
          tx.authored.propose();
          assert.deepEqual(tx.children(), expected.children);
          assert.deepEqual(tx.value().roots ?? {}, expected.roots ?? {});
        });
      });

  it('keeps independent property provenance after rejecting a different property', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Text')],
    });
    let bold = '';
    let italic = '';
    editor.update((tx) => {
      bold = tx.authored.propose();
      tx.nodes.set({ bold: true }, { at: [0, 0] });
    });
    authorId = 'bob';
    editor.update((tx) => {
      italic = tx.authored.propose();
      tx.nodes.set({ italic: true }, { at: [0, 0] });
    });
    assert.equal(
      editor.update.authored.decide({
        action: 'reject',
        selection: editor.read.authored.select({ ids: [bold] }),
      }).status,
      'applied'
    );
    authorId = 'carol';
    let third = '';
    editor.update((tx) => {
      third = tx.authored.propose();
      assert.deepEqual(tx.children(), [
        { type: 'paragraph', children: [{ text: 'Text', italic: true }] },
      ]);
      tx.nodes.set({ italic: false }, { at: [0, 0] });
    });
    assert.deepEqual(editor.read.authored.change(third)?.dependencies, [
      italic,
    ]);
  });

  for (const action of ['accept', 'reject'] as const)
    it(`preserves a later accepted scalar value when attempting to ${action} an older proposal`, () => {
      let authorId = 'alice';
      const editor = createEditor({
        extensions: [authored({ authorId: () => authorId })],
        initialValue: [paragraph('Text')],
      });
      let proposal = '';
      editor.update((tx) => {
        proposal = tx.authored.propose();
        tx.nodes.set({ tone: 'proposal' }, { at: [0] });
      });
      authorId = 'bob';
      editor.update.nodes.set({ tone: 'accepted' }, { at: [0] });
      const accepted = editor.read.authored.changes({ authorId: 'bob' })
        .items[0].id;
      const before = JSON.stringify(editor.read.value());
      const input = {
        action,
        selection: editor.read.authored.select({ ids: [proposal] }),
      };
      const expected =
        action === 'accept'
          ? {
              status: 'blocked',
              ids: [proposal],
              dependencies: [],
              dependants: [],
              conflicts: [accepted],
            }
          : { status: 'applied', ids: [proposal] };
      assert.deepEqual(editor.read.authored.preview(input), expected);
      assert.deepEqual(editor.update.authored.decide(input), expected);
      assert.deepEqual(editor.read.children(), [
        { ...paragraph('Text'), tone: 'accepted' },
      ]);
      if (action === 'accept')
        assert.equal(JSON.stringify(editor.read.value()), before);
      const restored = createEditor({
        extensions: [authored({ authorId: 'reviewer' })],
        initialValue: JSON.parse(JSON.stringify(editor.read.value())),
      });
      restored.update((tx) => {
        tx.authored.propose();
        assert.deepEqual(tx.children(), [
          { ...paragraph('Text'), tone: 'accepted' },
        ]);
      });
    });

  it('reviews distinct set members independently and tracks repeated member writes', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [{ ...paragraph('Text'), tags: [] }],
    });
    const proposeMember = (value: string, type: 'add' | 'remove') => {
      let identity = '';
      editor.update((tx) => {
        identity = tx.authored.propose();
        tx.changes.apply(
          DocumentChange.fromJSON({
            version: 3,
            primary: [
              {
                length: 1,
                properties: {
                  version: 1,
                  operations: [{ type, key: 'tags', values: [value] }],
                },
              },
              { length: 7 },
            ],
          })
        );
      });
      return identity;
    };
    const alice = proposeMember('a', 'add');
    authorId = 'bob';
    const bob = proposeMember('b', 'add');
    assert.deepEqual(editor.read.authored.change(bob)?.dependencies, []);
    editor.update.authored.decide({
      action: 'reject',
      selection: editor.read.authored.select({ ids: [alice] }),
    });
    authorId = 'carol';
    const carol = proposeMember('b', 'remove');
    assert.deepEqual(editor.read.authored.change(carol)?.dependencies, [bob]);
    assert.equal(
      editor.update.authored.decide({
        action: 'accept',
        selection: editor.read.authored.select({ ids: [bob] }),
      }).status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [
      { ...paragraph('Text'), tags: ['b'] },
    ]);
    const restored = createEditor({
      extensions: [authored({ authorId: 'reviewer' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Text')]);
    });
  });

  it('treats creation of an empty named root as a prerequisite for later content', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: base,
    });
    let root = '';
    editor.update((tx) => {
      root = tx.authored.propose();
      tx.changes.apply(
        DocumentChange.between(
          { children: base },
          { children: base, roots: { note: [] } }
        )
      );
    });
    authorId = 'bob';
    let child = '';
    editor.update((tx) => {
      child = tx.authored.propose();
      tx.changes.apply(
        DocumentChange.between(
          { children: base, roots: { note: [] } },
          { children: base, roots: { note: [paragraph('Note')] } }
        )
      );
    });
    assert.deepEqual(editor.read.authored.change(child)?.dependencies, [root]);
    assert.deepEqual(
      editor.update.authored.decide({
        action: 'reject',
        selection: editor.read.authored.select({ ids: [root] }),
      }),
      {
        status: 'blocked',
        ids: [root],
        dependencies: [],
        dependants: [child],
        conflicts: [],
      }
    );
    assert.equal(
      editor.update.authored.decide({
        action: 'reject',
        selection: editor.read.authored.select({ status: 'pending' }),
      }).status,
      'applied'
    );
    const restored = createEditor({
      extensions: [authored({ authorId: 'reviewer' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.value().roots ?? {}, {});
    });
  });

  for (const action of ['accept', 'reject'] as const)
    it(`preserves accepted edits inside content hidden by a proposed deletion on ${action}`, () => {
      let authorId = 'alice';
      const editor = createEditor({
        extensions: [authored({ authorId: () => authorId })],
        initialValue: base,
      });
      let deletion = '';
      editor.update((tx) => {
        deletion = tx.authored.propose();
        tx.nodes.remove({ at: [0] });
      });
      authorId = 'bob';
      editor.update.text.insert(' accepted', {
        at: { path: [0, 0], offset: 5 },
      });
      const bob = editor.read.authored.changes({ authorId: 'bob' }).items[0].id;
      const decision = {
        action,
        selection: editor.read.authored.select({ ids: [deletion] }),
      };
      const expected =
        action === 'accept'
          ? {
              status: 'blocked',
              ids: [deletion],
              dependencies: [],
              dependants: [],
              conflicts: [bob],
            }
          : { status: 'applied', ids: [deletion] };
      assert.deepEqual(editor.read.authored.preview(decision), expected);
      assert.deepEqual(editor.update.authored.decide(decision), expected);
      assert.deepEqual(editor.read.children(), [
        paragraph('First accepted'),
        base[1],
      ]);
      if (action === 'reject') {
        const restored = createEditor({
          extensions: [authored({ authorId: 'reviewer' })],
          initialValue: JSON.parse(JSON.stringify(editor.read.value())),
        });
        restored.update((tx) => {
          tx.authored.propose();
          assert.deepEqual(tx.children(), [
            paragraph('First accepted'),
            base[1],
          ]);
        });
      }
    });

  for (const action of ['accept', 'reject'] as const)
    it(`retains lifecycle dependencies when a deleted root name is reused: ${action}`, () => {
      let authorId = 'alice';
      const original = {
        children: base,
        roots: { note: [paragraph('Original')] },
      };
      const replacement = {
        children: base,
        roots: { note: [paragraph('Replacement')] },
      };
      const editor = createEditor({
        extensions: [authored({ authorId: () => authorId })],
        initialValue: original,
      });
      let first = '';
      editor.update((tx) => {
        first = tx.authored.propose();
        tx.changes.apply(DocumentChange.between(original, { children: base }));
      });
      authorId = 'bob';
      let second = '';
      editor.update((tx) => {
        second = tx.authored.propose();
        tx.changes.apply(
          DocumentChange.between({ children: base }, replacement)
        );
      });
      assert.deepEqual(editor.read.authored.change(second)?.dependencies, [
        first,
      ]);
      assert.equal(
        editor.update.authored.decide({
          action,
          selection: editor.read.authored.select({ status: 'pending' }),
        }).status,
        'applied'
      );
      const expected = action === 'accept' ? replacement : original;
      assert.deepEqual(editor.read.value().roots, expected.roots);
      const restored = createEditor({
        extensions: [authored({ authorId: 'reviewer' })],
        initialValue: JSON.parse(JSON.stringify(editor.read.value())),
      });
      restored.update((tx) => {
        tx.authored.propose();
        assert.deepEqual(tx.value().roots, expected.roots);
      });
    });

  it('keeps accepted operation identities when one transaction edits hidden and visible content', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: base,
    });
    let deletion = '';
    editor.update((tx) => {
      deletion = tx.authored.propose();
      tx.nodes.remove({ at: [0] });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.text.insert(' hidden', { at: { path: [0, 0], offset: 5 } });
      tx.text.insert(' shown', { at: { path: [1, 0], offset: 6 } });
    });
    const restored = createEditor({
      extensions: [authored({ authorId: 'reviewer' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Second shown')]);
    });
    assert.equal(
      restored.update.authored.decide({
        action: 'reject',
        selection: restored.read.authored.select({ ids: [deletion] }),
      }).status,
      'applied'
    );
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('First hidden'),
        paragraph('Second shown'),
      ]);
    });
  });

  it('refuses an accepted deletion that would consume a pending contribution', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: base,
    });
    let proposal = '';
    editor.update((tx) => {
      proposal = tx.authored.propose();
      tx.text.insert(' draft', { at: { path: [0, 0], offset: 2 } });
    });
    const before = JSON.stringify(editor.read.value());
    assert.throws(
      () => editor.update.nodes.remove({ at: [0] }),
      (error) => {
        assert.deepEqual(
          (error as { identities: readonly string[] }).identities,
          [proposal]
        );
        return true;
      }
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Fi draftrst'), base[1]]);
    });
  });

  it('deletes proposed text through the native text command and keeps accepted anchors separate', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('')],
    });
    const anchor = editor.anchor(
      { path: [0, 0], offset: 0 },
      { association: 'forward', deletion: 'nearest' }
    );
    let first = '';
    editor.update((tx) => {
      first = tx.authored.propose();
      tx.text.insert('seed', { at: { path: [0, 0], offset: 0 } });
    });
    let second = '';
    editor.update((tx) => {
      second = tx.authored.propose();
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
      tx.text.insert('S', { at: { path: [0, 0], offset: 0 } });
      assert.deepEqual(tx.children(), [paragraph('Seed')]);
    });
    assert.deepEqual(editor.read.authored.change(second)?.dependencies, [
      first,
    ]);
    assert.deepEqual(anchor.resolve(), { path: [0, 0], offset: 0 });
    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(
      editor.update.authored.decide({
        action: 'accept',
        selection: editor.read.authored.select({ status: 'pending' }),
      }).status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [paragraph('Seed')]);
    anchor.release();
    const restored = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.deepEqual(restored.read.children(), [paragraph('Seed')]);
  });
});
