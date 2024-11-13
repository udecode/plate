/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { DeletePlugin } from './DeletePlugin';

jsxt;

describe('p (empty) + codeblock when selection not in code block', () => {
  it('should remove the p', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
        <hcodeblock>
          <hcodeline>test</hcodeline>
          <hcodeline>test2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>test</hcodeline>
          <hcodeline>test2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      editor: input,
      plugins: [DeletePlugin],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('p (not empty) + code block when selection not in code block', () => {
  it('should remove the p', () => {
    const input = (
      <editor>
        <hp>
          para
          <cursor />
        </hp>
        <hcodeblock>
          <hcodeline>test</hcodeline>
          <hcodeline>test2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const expected = (
      <editor>
        <hp>paratest</hp>
        <hcodeblock>
          <hcodeline>test2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      editor: input,
      plugins: [DeletePlugin],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});
