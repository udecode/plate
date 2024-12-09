/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { insertEmptyCodeBlock } from './insertEmptyCodeBlock';

jsxt;

describe('insert empty code block', () => {
  it('should insert empty code block on selected empty line', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [CodeBlockPlugin],
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>test</hp>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [CodeBlockPlugin],
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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [CodeBlockPlugin],
    });

    insertEmptyCodeBlock(editor, {
      insertNodesOptions: { select: true },
    });

    expect(input.children).toEqual(output.children);
  });
});
