/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

jsxt;

describe('isCodeBlockEmpty', () => {
  const run = (input: TestEditor) =>
    createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    }).read.codeBlock.isEmpty();

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
              <cursor />
            </hcodeline>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </editor>
      ),
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
      ),
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
      ),
      title: 'returns true for a single empty code line',
    },
  ])('$title', ({ input, expected }) => {
    expect(run(input)).toBe(expected);
  });
});

describe('isSelectionAtCodeBlockStart', () => {
  const run = (input: TestEditor) =>
    createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    }).read.codeBlock.isAtStart();

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
