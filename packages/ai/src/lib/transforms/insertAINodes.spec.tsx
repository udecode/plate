/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import {
  BaseParagraphPlugin,
  type SlateEditor,
  createSlateEditor,
} from 'platejs';

import { insertAINodes } from './insertAINodes';

jsxt;

const createEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('insertAINodes', () => {
  it('does nothing without a selection or explicit target', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin],
      value: [{ type: 'p', children: [{ text: 'one' }] }],
    });
    const before = JSON.parse(JSON.stringify(editor.children));

    insertAINodes(editor, [{ text: ' AI' }]);

    expect(editor.children).toEqual(before);
    expect(editor.selection).toBeNull();
  });

  it('clones inserted nodes with ai metadata and collapses at the end', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;
    const editor = createEditor(input);

    insertAINodes(editor, [{ text: ' AI' }]);

    expect(editor.children).toEqual([
      {
        children: [{ text: 'one' }, { ai: true, text: ' AI' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
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
    ) as any as SlateEditor;
    const editor = createEditor(input);

    insertAINodes(editor, [{ text: ' AI' }], { target: [0, 0] });

    expect(editor.children).toEqual([
      {
        children: [{ text: 'first' }, { ai: true, text: ' AI' }],
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 1] },
      focus: { offset: 3, path: [0, 1] },
    });
  });
});
