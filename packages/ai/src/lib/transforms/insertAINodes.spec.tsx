/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type TestEditor } from '@platejs/test-utils';
import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseAIPlugin } from '../BaseAIPlugin';
import { insertAINodes } from './insertAINodes';

jsxt;

const createEditor = (input: TestEditor) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('insertAINodes', () => {
  it('does nothing without a selection or explicit target', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin],
      value: [{ type: 'p', children: [{ text: 'one' }] }],
    });
    const before = structuredClone(editor.read.children());

    editor.update((tx) => insertAINodes(editor, tx, [{ text: ' AI' }]));

    expect(editor.read.children()).toEqual(before);
    expect(editor.read.selection()).toBeNull();
  });

  it('clones inserted nodes with ai metadata and collapses at the end', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createEditor(input);

    editor.update((tx) => insertAINodes(editor, tx, [{ text: ' AI' }]));

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'one' }, { ai: true, text: ' AI' }],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 1] },
      focus: { offset: 3, path: [0, 1] },
    });
  });

  it('uses the explicit target instead of the current selection', () => {
    const input = (
      <editor>
        <hp>first</hp>
        <hp>
          second
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createEditor(input);

    editor.update((tx) =>
      insertAINodes(editor, tx, [{ text: ' AI' }], { target: [0, 0] })
    );

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'first' }, { ai: true, text: ' AI' }],
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 1] },
      focus: { offset: 3, path: [0, 1] },
    });
  });

  it('uses selection changes from the active transaction', () => {
    const input = (
      <editor>
        <hp>first</hp>
        <hp>
          second
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createEditor(input);

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      });
      tx.ai.insertNodes([{ text: ' AI' }]);
    });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'first' }, { ai: true, text: ' AI' }],
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        type: 'p',
      },
    ]);
  });
});
