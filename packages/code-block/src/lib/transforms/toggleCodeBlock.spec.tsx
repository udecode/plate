/** @jsx jsxt */

import type { BasePlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createBasePlateEditor } from 'platejs';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { toggleCodeBlock } from './toggleCodeBlock';

jsxt;

describe('toggle on', () => {
  it('turn a p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line 1
          <cursor />
        </hp>
        <hp>line 2</hp>
      </editor>
    ) as any as BasePlateEditor;

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
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    toggleCodeBlock(editor);

    expect(editor.children).toEqual(output.children);
  });

  it('turn a p with a selection to code block', () => {
    const input = (
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as any as BasePlateEditor;

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
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    toggleCodeBlock(editor);

    expect(editor.children).toEqual(output.children);
  });

  it('turn multiple p to a code block', () => {
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
    ) as any as BasePlateEditor;

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
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    toggleCodeBlock(editor);

    expect(editor.children).toEqual(output.children);
  });
});
