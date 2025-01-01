/** @jsx jsxt */

import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor, toggleWrapNodes } from '..';

jsxt;

describe('active', () => {
  const input = createTEditor(
    (
      <editor>
        <hcodeblock>
          <hp>
            test
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any
  );

  const output = createTEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  it('should be', () => {
    toggleWrapNodes(input, CodeBlockPlugin.key);

    expect(input.children).toEqual(output.children);
  });
});

describe('not active', () => {
  const input = createTEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  const output = createTEditor(
    (
      <editor>
        <hcodeblock>
          <hp>
            test
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any
  );

  it('should be', () => {
    toggleWrapNodes(input, CodeBlockPlugin.key);

    expect(input.children).toEqual(output.children);
  });
});
