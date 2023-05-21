/** @jsx jsx */

import { createPlateUIEditor } from '@udecode/plate/src';
import { getNode, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createCodeBlockPlugin } from '@/nodes/code-block/src/createCodeBlockPlugin';

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

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    const path = [0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(input.children).toEqual(output.children);
  });
});
