/** @jsx jsx */

import { createCodeBlockPlugin } from '@/packages/code-block/src/createCodeBlockPlugin';
import { PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { insertEmptyCodeBlock } from './insertEmptyCodeBlock';

jsx;

describe('insert empty code block', () => {
  it('should insert empty code block on selected empty line', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    insertEmptyCodeBlock(editor, {
      insertNodesOptions: { select: true },
    });

    expect(input.children).toEqual(output.children);
  });

  it('should insert empty code block below selected non-empty line', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>test</hp>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    insertEmptyCodeBlock(editor, {
      insertNodesOptions: { select: true },
    });

    expect(input.children).toEqual(output.children);
  });

  it('should insert empty code block below expanded selection', () => {
    const input = (
      <editor>
        <hp>line 1</hp>
        <hp>
          line <anchor />2
        </hp>
        <hp>line 3</hp>
        <hp>
          line 4<focus />
        </hp>
        <hp>line 5</hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>line 1</hp>
        <hp>line 2</hp>
        <hp>line 3</hp>
        <hp>line 4</hp>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
        <hp>line 5</hp>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createCodeBlockPlugin()],
    });

    insertEmptyCodeBlock(editor, {
      insertNodesOptions: { select: true },
    });

    expect(input.children).toEqual(output.children);
  });
});
