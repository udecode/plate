/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

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
    ) as any as TestEditor;

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
    ) as any as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => {
      insertCodeLine(editor, tx, 4);
    });

    expect(editor.read.children()).toEqual(output.children);
  });
});
