/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, createSlateEditor } from 'platejs';

import { CodeBlockPlugin } from '../react/CodeBlockPlugin';

jsxt;

describe('clean up code block', () => {
  it('turn children of code block to code lines', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hp>line 1</hp>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>line 1</hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    const path = [0];
    const node = editor.api.node(path)?.[0];

    expect(node).toBeDefined();

    editor.tf.normalizeNode([node!, path]);

    expect(editor.children).toEqual(output.children);
  });
});
