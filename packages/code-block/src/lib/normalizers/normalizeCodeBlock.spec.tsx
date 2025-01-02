/** @jsx jsxt */

import {
  type SlateEditor,
  createTEditor,
  getNode,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';

jsxt;

describe('clean up code block', () => {
  it('should turn children of code block to code lines', () => {
    const input = createTEditor(
      (
        <editor>
          <hcodeblock>
            <hp>line 1</hp>
            <hcodeline>line 2</hcodeline>
          </hcodeblock>
        </editor>
      ) as any
    );

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>line 1</hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    const path = [0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(editor.children).toEqual(output.children);
  });
});
