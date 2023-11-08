/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createDeletePlugin } from './createDeletePlugin';

jsx;

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
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>test</hcodeline>
          <hcodeline>test2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createDeletePlugin()],
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
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>paratest</hp>
        <hcodeblock>
          <hcodeline>test2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createDeletePlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});
