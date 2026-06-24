/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type BasePlateEditor, createBasePlateEditor } from 'platejs';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { insertCodeLine } from './insertCodeLine';

jsxt;

describe('insert code line', () => {
  it('insert code line below selected line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line 1<cursor />
          </hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as BasePlateEditor;

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
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    insertCodeLine(editor, 4);

    expect(editor.children).toEqual(output.children);
  });
});
