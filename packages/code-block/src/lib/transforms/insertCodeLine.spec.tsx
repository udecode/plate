/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, createEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { insertCodeLine } from './insertCodeLine';

jsxt;

describe('insert code line', () => {
  it('should insert code line below selected line', () => {
    const input = createEditor(
      (
        <editor>
          <hcodeblock>
            <hcodeline>
              line 1<cursor />
            </hcodeline>
            <hcodeline>line 2</hcodeline>
          </hcodeblock>
        </editor>
      ) as any
    );

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>line 1</hcodeline>
          <hcodeline>
            {'    '}
            <cursor />
          </hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    insertCodeLine(editor, 4);

    expect(editor.children).toEqual(output.children);
  });
});
