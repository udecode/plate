import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';

import { authoredTreeProof } from '../src/authored/tree/proof-plugin';

const AT = 1000;
const mark = (
  kind: 'delete' | 'insert' | 'join' | 'split' | 'wrap',
  author = 'bob',
  change = `${author}:1`
) => ({ at: AT, author, change, kind });
const paragraph = (...children: Array<Record<string, unknown>>) => ({
  type: 'paragraph',
  children,
});
const point = (offset: number, path = [0, 0]) => ({ offset, path });
/** A whole-block suggestion marks the block and every node inside it. */
const whole = (
  node: Record<string, unknown>,
  ...marks: Array<Record<string, unknown>>
): Record<string, unknown> => ({
  ...node,
  authored: [...((node.authored as unknown[] | undefined) ?? []), ...marks],
  ...(Array.isArray(node.children)
    ? {
        children: node.children.map((child: Record<string, unknown>) =>
          whole(child, ...marks)
        ),
      }
    : {}),
});
const Quotes = defineEditorSchema('record-quotes', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'record-quotes',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('quote')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});
const counter = (author: string) => {
  let count = 0;

  return () => {
    count += 1;

    return `${author}:${count}`;
  };
};

const editorFor = (
  initialValue: Array<Record<string, unknown>>,
  intent: 'edit' | 'propose',
  author = 'bob',
  plugins: readonly unknown[] = []
) =>
  createEditor({
    plugins: [
      ...(plugins as []),
      authoredTreeProof({
        authorId: author,
        createChangeId: counter(author),
        createTagId: counter(`${author}-tag`),
        intent,
        now: () => AT,
      }),
    ],
    initialValue,
  });
const suggesting = (
  initialValue: Array<Record<string, unknown>>,
  author = 'bob'
) => editorFor(initialValue, 'propose', author);
const editing = (
  initialValue: Array<Record<string, unknown>>,
  author = 'bob'
) => editorFor(initialValue, 'edit', author);

describe('authored review tree recording', () => {
  it('records typed text as an insertion in Suggesting', () => {
    const editor = suggesting([paragraph({ text: 'keep tail' })]);

    editor.update((tx) => {
      tx.text.insert('new ', { at: point(5) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'keep ' },
        { text: 'new ', authored: [mark('insert')] },
        { text: 'tail' }
      ),
    ]);
  });

  it('keeps deleted text in place under a delete mark in Suggesting', () => {
    const editor = suggesting([paragraph({ text: 'keep gone tail' })]);

    editor.update((tx) => {
      tx.text.delete({ at: { anchor: point(5), focus: point(10) } });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'keep ' },
        { text: 'gone ', authored: [mark('delete')] },
        { text: 'tail' }
      ),
    ]);
  });

  it('records a replacement as struck text followed by the new text', () => {
    const editor = suggesting([paragraph({ text: 'keep gone tail' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(5), focus: point(10) });
      tx.text.insert('NEW ');
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'keep ' },
        { text: 'gone ', authored: [mark('delete')] },
        { text: 'NEW ', authored: [mark('insert')] },
        { text: 'tail' }
      ),
    ]);
  });

  it('removes one’s own pending insertion for real when deleting it', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'mine', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(1, [0, 1]), focus: point(3, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'me', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);
  });

  it('leaves already struck text unchanged when deleting it again', () => {
    const struck = [
      paragraph(
        { text: 'a' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'b' }
      ),
    ];
    const editor = suggesting(struck);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(0, [0, 1]), focus: point(4, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), struck);
  });

  it('amends one’s own pending insertion when typing inside it', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'mine', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 1]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'miXne', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);
  });

  it('amends one’s own pending insertion when typing at its end', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'mine', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(4, [0, 1]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'mineX', authored: [mark('insert')] },
        { text: 'b' }
      ),
    ]);
  });

  it('gives Suggesting text inside another author’s insertion both insert marks', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 1]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'he', authored: [mark('insert', 'alice')] },
        { text: 'X', authored: [mark('insert', 'alice'), mark('insert')] },
        { text: 'rs', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);
  });

  it('keeps Suggesting text at either edge of another author’s insertion out of it', () => {
    for (const offset of [0, 4]) {
      const editor = suggesting([
        paragraph(
          { text: 'a' },
          { text: 'hers', authored: [mark('insert', 'alice')] },
          { text: 'b' }
        ),
      ]);

      editor.update((tx) => {
        tx.text.insert('X', { at: point(offset, [0, 1]) });
      });

      const children = editor.read.children() as Array<{
        children: Array<{ authored?: unknown; text: string }>;
      }>;
      const typed = children[0].children.find((leaf) => leaf.text === 'X');

      assert.deepEqual(typed?.authored, [mark('insert')], `edge ${offset}`);
    }
  });

  it('joins Editing text typed inside another author’s insertion to that insertion', () => {
    const editor = editing([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [0, 1]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'heXrs', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);
  });

  it('keeps Editing text at either edge of another author’s insertion plain', () => {
    for (const offset of [0, 4]) {
      const editor = editing([
        paragraph(
          { text: 'a' },
          { text: 'hers', authored: [mark('insert', 'alice')] },
          { text: 'b' }
        ),
      ]);

      editor.update((tx) => {
        tx.text.insert('X', { at: point(offset, [0, 1]) });
      });

      const text = JSON.stringify(editor.read.children());

      assert.ok(
        !text.includes('"text":"Xhers"') && !text.includes('"text":"hersX"'),
        `edge ${offset}: ${text}`
      );
    }
  });

  it('splits a deletion around text typed inside struck text, in both modes', () => {
    for (const intent of ['edit', 'propose'] as const) {
      const editor = editorFor(
        [
          paragraph(
            { text: 'a' },
            { text: 'gone', authored: [mark('delete', 'alice')] },
            { text: 'b' }
          ),
        ],
        intent
      );

      editor.update((tx) => {
        tx.text.insert('X', { at: point(2, [0, 1]) });
      });

      assert.deepEqual(
        editor.read.children(),
        [
          paragraph(
            { text: 'a' },
            { text: 'go', authored: [mark('delete', 'alice')] },
            intent === 'edit'
              ? { text: 'X' }
              : { text: 'X', authored: [mark('insert')] },
            { text: 'ne', authored: [mark('delete', 'alice')] },
            { text: 'b' }
          ),
        ],
        intent
      );
    }
  });

  it('removes struck text for real when Editing deletes it', () => {
    const editor = editing([
      paragraph(
        { text: 'a' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(0, [0, 1]), focus: point(4, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'ab' })]);
  });

  it('records Enter in Suggesting as a split mark on the new block', () => {
    const editor = suggesting([paragraph({ text: 'abcd' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(2), focus: point(2) });
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ]);
  });

  it('records Backspace at a block start in Suggesting as a join mark', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(0, [1, 0]) });
      tx.text.deleteBackward();
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('join')] },
    ]);
  });

  it('withdraws one’s own pending split for real on Backspace', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      { ...paragraph({ text: 'cd' }), authored: [mark('split')] },
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0, [1, 0]), focus: point(0, [1, 0]) });
      tx.text.deleteBackward();
    });

    assert.deepEqual(editor.read.children(), [paragraph({ text: 'abcd' })]);
  });

  it('records a Suggesting format change as one tag with the value it replaced', () => {
    const Bold = defineEditorSchema('bold-schema', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'bold-schema',
      properties: [schema.textProperty('bold', property.boolean())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor([paragraph({ text: 'word' })], 'propose', 'bob', [
      Bold,
    ]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(0), focus: point(4) });
      tx.marks.add('bold', true);
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({
        authored: [
          {
            at: AT,
            author: 'bob',
            change: 'bob:1',
            id: 'bob-tag:1',
            key: 'bold',
            kind: 'format',
          },
        ],
        bold: true,
        text: 'word',
      }),
    ]);
  });

  it('records pasted content, whose copy dropped its review marks, as one insertion', () => {
    const source = editing([
      paragraph({ text: 'pasted', authored: [mark('delete', 'eve', 'eve:9')] }),
    ]);

    // Projected copy reads this content slice.
    const copied = source.read.slice.get({
      at: { anchor: point(0), focus: point(6) },
    }).content;
    const editor = suggesting([paragraph({ text: 'ab' })]);

    editor.update((tx) => {
      tx.nodes.insert(copied, { at: [1] });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      whole(paragraph({ text: 'pasted' }), mark('insert')),
    ]);
  });

  it('strikes a whole removed block and every text in it', () => {
    const editor = suggesting([
      paragraph({ text: 'ab' }),
      paragraph({ text: 'cd' }),
    ]);

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }),
      whole(paragraph({ text: 'cd' }), mark('delete')),
    ]);
  });

  it('passes undo through unrecorded, restoring the document before a suggested deletion', () => {
    const initial = [paragraph({ text: 'keep gone tail' })];
    const editor = editorFor(initial, 'propose', 'bob', [history()]);

    editor.update((tx) => {
      tx.text.delete({ at: { anchor: point(5), focus: point(10) } });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), initial);
  });

  it('keeps Editing text typed inside a struck block through accepting the deletion', () => {
    const editor = editing([
      paragraph({ text: 'keep' }),
      whole(paragraph({ text: 'gone' }), mark('delete', 'alice')),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [1, 0]) });
    });
    editor.api.authoredTree.decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'keep' }),
      paragraph({ text: 'X' }),
    ]);
  });

  it('records Suggesting text typed inside a struck block outside the deletion', () => {
    const editor = suggesting([
      whole(paragraph({ text: 'gone' }), mark('delete', 'alice')),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2) });
    });

    assert.deepEqual(editor.read.children(), [
      {
        ...paragraph(
          { text: 'go', authored: [mark('delete', 'alice')] },
          { text: 'X', authored: [mark('insert')] },
          { text: 'ne', authored: [mark('delete', 'alice')] }
        ),
        authored: [mark('delete', 'alice')],
      },
    ]);
  });

  it('marks Suggesting text typed inside one’s own pending block with that block’s change', () => {
    const editor = suggesting([
      paragraph({ text: 'keep' }),
      { ...paragraph({ text: 'mine' }), authored: [mark('insert')] },
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(2, [1, 0]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'keep' }),
      {
        ...paragraph(
          { text: 'mi' },
          { text: 'X', authored: [mark('insert')] },
          { text: 'ne' }
        ),
        authored: [mark('insert')],
      },
    ]);
  });

  it('leaves text typed inside one’s own pending one-text block unsplit', () => {
    const Code = defineEditorSchema('own-code-schema', {
      elements: {
        code: {
          content: schema.content.text({ default: 'text', max: 1, min: 1 }),
        },
        paragraph: { content: schema.content.text() },
      },
      id: 'own-code-schema',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = editorFor(
      [
        {
          type: 'code',
          authored: [mark('insert')],
          children: [{ text: 'let a' }],
        },
      ],
      'propose',
      'bob',
      [Code]
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: point(3) });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'code',
        authored: [mark('insert')],
        children: [{ text: 'letX a' }],
      },
    ]);
  });

  it('stacks a delete mark over another author’s insertion when Suggesting deletes it', () => {
    const editor = suggesting([
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice')] },
        { text: 'b' }
      ),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point(0, [0, 1]), focus: point(4, [0, 1]) },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'hers', authored: [mark('insert', 'alice'), mark('delete')] },
        { text: 'b' }
      ),
    ]);
  });

  it('grows one’s own pending deletion on repeated Backspace instead of adding a suggestion', () => {
    const editor = suggesting([paragraph({ text: 'abcd' })]);

    for (let step = 0; step < 2; step += 1) {
      editor.update((tx) => {
        tx.selection.set({ anchor: point(4 - step), focus: point(4 - step) });
        tx.text.deleteBackward();
      });
    }

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'ab' }, { text: 'cd', authored: [mark('delete')] }),
    ]);
  });

  it('steps Backspace over struck text in Suggesting without changing it', () => {
    const initial = [
      paragraph(
        { text: 'ab' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'cd' }
      ),
    ];
    const editor = suggesting(initial);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(4, [0, 1]), focus: point(4, [0, 1]) });
      tx.text.deleteBackward();
    });

    assert.deepEqual(editor.read.children(), initial);
    assert.deepEqual(editor.read.selection()?.anchor, point(3, [0, 1]));
  });

  it('steps Delete over struck text in Suggesting without changing it', () => {
    const initial = [
      paragraph(
        { text: 'ab' },
        { text: 'gone', authored: [mark('delete', 'alice')] },
        { text: 'cd' }
      ),
    ];
    const editor = suggesting(initial);

    // The caret exists before the keystroke, as in a browser.
    editor.update((tx) => {
      tx.selection.set({ anchor: point(1, [0, 1]), focus: point(1, [0, 1]) });
    });
    editor.update((tx) => tx.text.deleteForward());

    assert.deepEqual(editor.read.children(), initial);
    assert.deepEqual(editor.read.selection()?.anchor, point(2, [0, 1]));
  });

  it('leaves the caret before a backward-selected range that Suggesting strikes', () => {
    const editor = suggesting([paragraph({ text: 'abcd' })]);

    editor.update((tx) => {
      tx.selection.set({ anchor: point(3, [0, 0]), focus: point(1, [0, 0]) });
    });
    editor.update((tx) => tx.text.delete());

    assert.deepEqual(editor.read.selection()?.anchor, point(1, [0, 0]));
  });

  it('refuses a Suggesting edit whose review form breaks a one-text element', () => {
    const Code = defineEditorSchema('code-schema', {
      elements: {
        code: {
          content: schema.content.text({ default: 'text', max: 1, min: 1 }),
        },
        paragraph: { content: schema.content.text() },
      },
      id: 'code-schema',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const initial = [{ type: 'code', children: [{ text: 'let a' }] }];
    const editor = editorFor(initial, 'propose', 'bob', [Code]);

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('X', { at: point(3) });
        }),
      /allows at most 1 children/
    );
    assert.deepEqual(editor.read.children(), initial);
  });

  it('gives each session of one author its own change ids', () => {
    const first = createEditor({
      plugins: [
        authoredTreeProof({
          authorId: 'alice',
          intent: 'propose',
          now: () => 1,
        }),
      ],
      initialValue: [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
    });

    first.update((tx) => tx.text.insert('x', { at: point(2) }));

    const second = createEditor({
      plugins: [
        authoredTreeProof({
          authorId: 'alice',
          intent: 'propose',
          now: () => 2,
        }),
      ],
      initialValue: first.read.children() as Array<Record<string, unknown>>,
    });

    second.update((tx) => tx.text.insert('y', { at: point(2, [1, 0]) }));

    const [x, y] = (
      second.read.children() as Array<{
        children: Array<{ authored?: Array<{ at: number; change: string }> }>;
      }>
    ).map((block) => block.children[1]?.authored?.[0]);

    assert.deepEqual([x?.at, y?.at], [1, 2]);
    assert.notEqual(x?.change, y?.change);
  });

  it('keeps one forced change’s time across its transactions', () => {
    let clock = 1;
    const editor = createEditor({
      plugins: [authoredTreeProof({ authorId: 'bob', now: () => clock })],
      initialValue: [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
    });

    editor.api.authoredTree.propose('ai:1', () => {
      editor.update((tx) => tx.text.insert('X', { at: point(1) }));
      clock = 2;
      editor.update((tx) => tx.text.insert('Y', { at: point(1, [1, 0]) }));
    });

    const forced = { at: 1, author: 'bob', change: 'ai:1', kind: 'insert' };

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        { text: 'X', authored: [forced] },
        { text: 'b' }
      ),
      paragraph(
        { text: 'c' },
        { text: 'Y', authored: [forced] },
        { text: 'd' }
      ),
    ]);
  });

  it('keeps a named root selected by the transaction that edits it', () => {
    const editor = createEditor({
      plugins: [authoredTreeProof({ authorId: 'bob', now: () => AT })],
      initialValue: {
        children: [paragraph({ text: 'body' })],
        roots: { header: [paragraph({ text: 'head' })] },
      },
    });

    editor.update((tx) => {
      const caret = { offset: 1, path: [0, 0], root: 'header' };

      tx.selection.set({ anchor: caret, focus: caret });
      tx.text.insert('X');
    });
    editor.update((tx) => tx.text.insert('Y'));

    assert.deepEqual(editor.read.value(), {
      children: [paragraph({ text: 'body' })],
      roots: { header: [paragraph({ text: 'hXYead' })] },
    });
  });

  it('records two edits of one transaction inside a struck block', () => {
    const editor = editing([
      whole(paragraph({ text: 'abcd' }), mark('delete', 'alice')),
    ]);

    editor.update((tx) => {
      tx.text.insert('X', { at: point(1) });
      tx.text.insert('Y', { at: point(3) });
    });

    const struck = { authored: [mark('delete', 'alice')] };

    assert.deepEqual(editor.read.children(), [
      {
        ...paragraph(
          { ...struck, text: 'a' },
          { text: 'X' },
          { ...struck, text: 'b' },
          { text: 'Y' },
          { ...struck, text: 'cd' }
        ),
        ...struck,
      },
    ]);
  });

  it('keeps another author’s pending insertion inside a block that a move carries, in both modes', () => {
    const alices = paragraph({
      text: 'X',
      authored: [mark('insert', 'alice')],
    });
    const plain = editing([
      paragraph({ text: 'a' }),
      alices,
      paragraph({ text: 'c' }),
    ]);
    const suggested = suggesting([
      paragraph({ text: 'a' }),
      alices,
      paragraph({ text: 'c' }),
    ]);

    for (const editor of [plain, suggested]) {
      editor.update((tx) => tx.nodes.move({ at: [1], to: [2] }));
    }
    assert.deepEqual(plain.read.children(), [
      paragraph({ text: 'a' }),
      paragraph({ text: 'c' }),
      alices,
    ]);
    suggested.api.authoredTree.decide({ action: 'accept', changes: ['bob:1'] });
    assert.deepEqual(suggested.read.children(), plain.read.children());
  });

  it('keeps another author’s marks on content one transaction moves and types into, in Editing', () => {
    const editor = editorFor(
      [
        paragraph({ text: 'a' }),
        paragraph({ text: 'ab', authored: [mark('insert', 'alice')] }),
        paragraph({ text: 'c' }),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [2] });
      tx.text.insert('X', { at: point(1, [2, 0]) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph({ text: 'a' }),
      paragraph({ text: 'c' }),
      paragraph({ text: 'aXb', authored: [mark('insert', 'alice')] }),
    ]);
  });

  it('keeps another author’s marks on content one transaction wraps and formats, in Editing', () => {
    const editor = editorFor(
      [paragraph({ text: 'X', authored: [mark('insert', 'alice')] })],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] });
      tx.nodes.set({ bold: true }, { at: [0, 0, 0] });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'quote',
        children: [
          paragraph({
            text: 'X',
            bold: true,
            authored: [mark('insert', 'alice')],
          }),
        ],
      },
    ]);
  });

  it('keeps Editing text typed in two children of a struck block through accepting the deletion', () => {
    const editor = editorFor(
      [
        whole(
          {
            type: 'quote',
            children: [paragraph({ text: 'ab' }), paragraph({ text: 'cd' })],
          },
          mark('delete', 'alice')
        ),
        paragraph({ text: 'tail' }),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.text.insert('X', { at: point(1, [0, 0, 0]) });
      tx.text.insert('Y', { at: point(1, [0, 1, 0]) });
    });
    editor.api.authoredTree.decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'quote',
        children: [paragraph({ text: 'X' }), paragraph({ text: 'Y' })],
      },
      paragraph({ text: 'tail' }),
    ]);
  });

  it('records Editing that removes one child of a struck block and types in another', () => {
    const editor = editorFor(
      [
        whole(
          {
            type: 'quote',
            children: [paragraph({ text: 'a' }), paragraph({ text: 'bc' })],
          },
          mark('delete', 'alice')
        ),
      ],
      'edit',
      'bob',
      [Quotes]
    );

    editor.update((tx) => {
      tx.nodes.remove({ at: [0, 0] });
      tx.text.insert('X', { at: point(1, [0, 0, 0]) });
    });
    editor.api.authoredTree.decide({ action: 'accept', changes: ['alice:1'] });

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [paragraph({ text: 'X' })] },
    ]);
  });

  it('records a wrap in Suggesting as a wrap mark and keeps the wrapped suggestions', () => {
    const alices = paragraph({
      text: 'X',
      authored: [mark('insert', 'alice')],
    });
    const editor = editorFor([alices], 'propose', 'bob', [Quotes]);

    editor.update((tx) =>
      tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] })
    );

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', authored: [mark('wrap')], children: [alices] },
    ]);
    editor.api.authoredTree.decide({ action: 'reject', changes: ['bob:1'] });
    assert.deepEqual(editor.read.children(), [alices]);
  });
});

describe('authored review tree recording laws', () => {
  const leafArbitrary = fc.record({
    marked: fc.constantFrom('none', 'insert', 'delete'),
    text: fc.constantFrom('ab', 'cde', 'f'),
  });
  const documentArbitrary = fc.array(
    fc.array(leafArbitrary, { maxLength: 3, minLength: 1 }),
    { maxLength: 3, minLength: 1 }
  );
  const editArbitrary = fc.record({
    block: fc.nat(),
    focusBlock: fc.nat(),
    focusLeaf: fc.nat(),
    focusOffset: fc.nat(),
    intent: fc.constantFrom('edit' as const, 'propose' as const),
    kind: fc.constantFrom('insert', 'delete', 'break', 'backspace'),
    leaf: fc.nat(),
    offset: fc.nat(),
  });

  it('restores the document before any recorded edit on undo', () => {
    fc.assert(
      fc.property(documentArbitrary, editArbitrary, (blocks, edit) => {
        // Equal neighbouring leaves merge, as the canonical representation has it.
        const leavesOf = (leaves: (typeof blocks)[number]) => {
          const out: Array<Record<string, unknown>> = [];

          leaves.forEach((leaf, index) => {
            const next =
              leaf.marked === 'none'
                ? {
                    text: leaf.text,
                    ...(index % 2 === 1 ? { bold: true } : {}),
                  }
                : {
                    authored: [
                      mark(leaf.marked as 'delete' | 'insert', 'alice'),
                    ],
                    text: leaf.text,
                  };
            const previous = out.at(-1);
            const { text: _previousText, ...previousProps } = previous ?? {};
            const { text: _nextText, ...nextProps } = next;

            if (
              previous &&
              JSON.stringify(previousProps) === JSON.stringify(nextProps)
            ) {
              out[out.length - 1] = {
                ...previous,
                text: String(previous.text) + String(next.text),
              };
            } else {
              out.push(next);
            }
          });

          return out;
        };
        const initial = blocks.map((leaves) => paragraph(...leavesOf(leaves)));
        let editor;

        try {
          editor = editorFor(initial, edit.intent, 'bob', [history()]);
        } catch {
          return;
        }

        const before = editor.read.children();
        const at = (blockIndex: number, leafIndex: number, offset: number) => {
          const block = before[blockIndex % before.length] as {
            children: Array<{ text: string }>;
          };
          const leaf = leafIndex % block.children.length;

          return {
            offset: offset % (block.children[leaf].text.length + 1),
            path: [blockIndex % before.length, leaf],
          };
        };
        const anchor = at(edit.block, edit.leaf, edit.offset);
        const focus = at(edit.focusBlock, edit.focusLeaf, edit.focusOffset);

        editor.update((tx) => {
          if (edit.kind === 'insert') {
            tx.text.insert('Z', { at: anchor });
          } else if (edit.kind === 'delete') {
            tx.text.delete({ at: { anchor, focus } });
          } else {
            tx.selection.set({ anchor, focus: anchor });
            if (edit.kind === 'break') tx.break.insert();
            else tx.text.deleteBackward();
          }
        });
        if (JSON.stringify(editor.read.children()) === JSON.stringify(before)) {
          return;
        }
        editor.api.history.undo();
        assert.deepEqual(editor.read.children(), before);
      }),
      { numRuns: 400 }
    );
  });

  // S7 of docs/plans/2026-10-10-authored-values.md.
  it('keeps one default child in a struck quote whose block children a suggestion all withdraws', () => {
    const own = [mark('insert', 'bob', 'bob:0')];
    const editor = editorFor(
      [
        paragraph({ text: 'ab' }),
        {
          type: 'quote',
          children: [
            { ...paragraph({ authored: own, text: 'cd' }), authored: own },
            { ...paragraph({ authored: own, text: 'ef' }), authored: own },
          ],
        },
        paragraph({ text: 'gh' }),
      ],
      'propose',
      'bob',
      [Quotes]
    );

    editor.update((tx) =>
      tx.text.delete({
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [2, 0] },
        },
      })
    );
    const quote = (
      editor.read.children() as Array<Record<string, unknown>>
    )[1] as {
      children: Array<{ children: Array<{ text: string }>; type: string }>;
      type: string;
    };

    assert.deepEqual(
      quote.children.map((child) => ({
        texts: child.children.map((leaf) => leaf.text),
        type: child.type,
      })),
      [{ texts: [''], type: 'paragraph' }]
    );
  });
  it('removes a struck quote with its default child when its removal is accepted', () => {
    const own = [mark('insert', 'bob', 'bob:0')];
    const bob = editorFor(
      [
        paragraph({ text: 'ab' }),
        {
          type: 'quote',
          children: [
            { ...paragraph({ authored: own, text: 'cd' }), authored: own },
          ],
        },
      ],
      'propose',
      'bob',
      [Quotes]
    );

    bob.update((tx) => tx.nodes.remove({ at: [1] }));
    const judge = editorFor(bob.read.children() as never, 'edit', 'zed', [
      Quotes,
    ]);

    judge.api.authoredTree.decide({
      action: 'accept',
      changes: ['bob:0', 'bob:1'],
    });

    assert.deepEqual(judge.read.children(), [paragraph({ text: 'ab' })]);
  });

  it('fills a block-only default child down to a text when a struck element loses its children', () => {
    const Grid = defineEditorSchema('record-grid', {
      elements: {
        cell: { content: schema.content.text() },
        group: { content: schema.content.type('row', { min: 1 }) },
        paragraph: { content: schema.content.text() },
        row: { content: schema.content.type('cell', { min: 0 }) },
      },
      id: 'record-grid',
      root: schema.content.any(
        [schema.content.type('paragraph'), schema.content.type('group')],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    });
    const own = [mark('insert', 'bob', 'bob:0')];
    const bob = editorFor(
      [
        paragraph({ text: 'a' }),
        {
          type: 'group',
          children: [
            {
              type: 'row',
              authored: own,
              children: [
                {
                  type: 'cell',
                  authored: own,
                  children: [{ authored: own, text: 'x' }],
                },
              ],
            },
          ],
        },
      ],
      'propose',
      'bob',
      [Grid]
    );

    bob.update((tx) => tx.nodes.remove({ at: [1] }));

    const shapeOf = (node: {
      children?: readonly unknown[];
      text?: string;
      type?: string;
    }): unknown =>
      node.children
        ? {
            [node.type!]: node.children.map((child) => shapeOf(child as never)),
          }
        : node.text;

    assert.deepEqual(shapeOf(bob.read.children()[1]), {
      group: [{ row: [{ cell: [''] }] }],
    });
  });

  it('keeps the pending tag of a split-kept property that depends on an ancestor the same transaction moves', () => {
    const Aligned = defineEditorSchema('record-aligned', {
      elements: {
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
      },
      id: 'record-aligned',
      properties: [
        schema.elementProperty('align', property.string(), {
          target: target.and(
            target.type('paragraph'),
            target.parent(target.type('quote'))
          ),
        }),
      ],
      root: schema.content.any(
        [schema.content.type('paragraph'), schema.content.type('quote')],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    });
    const tag = {
      at: AT,
      author: 'alice',
      change: 'alice:1',
      id: 'align-1',
      key: 'align',
      kind: 'format',
    };
    const bob = editorFor(
      [
        {
          type: 'quote',
          children: [
            {
              ...paragraph({ text: 'abcd' }),
              align: 'center',
              authored: [tag],
            },
          ],
        },
      ],
      'propose',
      'bob',
      [Aligned]
    );

    bob.update((tx) => {
      tx.nodes.split({
        always: true,
        at: point(2, [0, 0, 0]),
        match: (node) => (node as { type?: string }).type === 'paragraph',
      });
      tx.nodes.insert(paragraph({ text: 'top' }), { at: [0] });
    });

    assert.deepEqual(
      (
        bob.read.children()[1] as {
          children: Array<{ authored?: Array<{ change: string }> }>;
        }
      ).children[1].authored?.map((item) => item.change),
      ['alice:1', 'bob:1']
    );
  });
  it('rejects a struck quote another author inserted, with its default child, when every change is rejected', () => {
    const carol = [mark('insert', 'carol', 'carol:0')];
    const alice = [mark('insert', 'alice', 'alice:0')];
    const start = [
      paragraph({ text: 'ab' }),
      {
        type: 'quote',
        authored: carol,
        children: [
          { ...paragraph({ authored: carol, text: 'p1' }), authored: carol },
          { ...paragraph({ authored: alice, text: 'p2' }), authored: alice },
        ],
      },
    ];
    const carolEditor = editorFor(start, 'propose', 'carol', [Quotes]);

    carolEditor.update((tx) => tx.nodes.remove({ at: [1, 0] }));
    const aliceEditor = editorFor(
      carolEditor.read.children() as never,
      'propose',
      'alice',
      [Quotes]
    );

    aliceEditor.update((tx) => tx.nodes.remove({ at: [1] }));
    const judge = editorFor(
      aliceEditor.read.children() as never,
      'edit',
      'zed',
      [Quotes]
    );

    judge.api.authoredTree.decide({
      action: 'reject',
      changes: ['carol:0', 'alice:0', 'alice:1'],
    });

    assert.deepEqual(judge.read.children(), [paragraph({ text: 'ab' })]);
  });
});
