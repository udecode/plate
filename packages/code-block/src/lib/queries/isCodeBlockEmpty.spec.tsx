/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, createSlateEditor } from 'platejs';

import { isCodeBlockEmpty } from './isCodeBlockEmpty';

jsxt;

describe('isCodeBlockEmpty', () => {
  const run = (input: SlateEditor) =>
    isCodeBlockEmpty(
      createSlateEditor({ selection: input.selection, value: input.children })
    );

  it.each([
    {
      expected: false,
      input: (
        <editor>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor,
      title: 'returns false outside a code block',
    },
    {
      expected: false,
      input: (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor,
      title: 'returns false for a multi-line code block',
    },
    {
      expected: false,
      input: (
        <editor>
          <hcodeblock>
            <hcodeline>
              test
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor,
      title: 'returns false for a non-empty code line',
    },
    {
      expected: true,
      input: (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor,
      title: 'returns true for a single empty code line',
    },
  ])('$title', ({ input, expected }) => {
    expect(run(input)).toBe(expected);
  });
});
