/** @jsx jsx */

import { createCodeBlockPlugin } from '@/packages/code-block/src/createCodeBlockPlugin';
import { PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { toggleCodeBlock } from './toggleCodeBlock';

jsx;

describe('toggle on', () => {
  it('should turn a p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line 1
          <cursor />
        </hp>
        <hp>line 2</hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line 1
            <cursor />
          </hcodeline>
        </hcodeblock>
        <hp>line 2</hp>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    toggleCodeBlock(editor);

    expect(input.children).toEqual(output.children);
  });

  it('should turn a p with a selection to code block', () => {
    const input = (
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            Planetas <anchor />
            mori in
            <focus /> gandavum!
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    toggleCodeBlock(editor);

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line <anchor />1
        </hp>
        <hp>line 2</hp>
        <hp>
          <focus />
          line 3
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line <anchor />1
          </hcodeline>
          <hcodeline>line 2</hcodeline>
          <hcodeline>
            <focus />
            line 3
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    toggleCodeBlock(editor);

    expect(input.children).toEqual(output.children);
  });
});
