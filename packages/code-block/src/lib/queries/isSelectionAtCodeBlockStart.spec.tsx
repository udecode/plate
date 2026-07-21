/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { isSelectionAtCodeBlockStart } from './isSelectionAtCodeBlockStart';

jsxt;

describe('isSelectionAtCodeBlockStart', () => {
  const run = (input: TestEditor) =>
    isSelectionAtCodeBlockStart(
      createBaseEditor({
        plugins: [BaseCodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      })
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
      ),
      title: 'returns false outside a code block',
    },
    {
      expected: false,
      input: (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ),
      title: 'returns false on a later code line',
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
      ),
      title: 'returns false when the cursor is not at the line start',
    },
    {
      expected: true,
      input: (
        <editor>
          <hcodeblock>
            <hcodeline>
              <cursor />
              line 1
            </hcodeline>
            <hcodeline>line 2</hcodeline>
          </hcodeblock>
        </editor>
      ),
      title: 'returns true at the start of the first code line',
    },
  ])('$title', ({ input, expected }) => {
    expect(run(input)).toBe(expected);
  });
});
