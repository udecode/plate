/** @jsx jsx */

import { createPlateEditor, getNode, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createCodeBlockPlugin } from '../createCodeBlockPlugin';

jsx;

describe('clean up code block', () => {
  it('should turn children of code block to code lines', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hp>line 1</hp>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>line 1</hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    const path = [0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(input.children).toEqual(output.children);
  });
});
