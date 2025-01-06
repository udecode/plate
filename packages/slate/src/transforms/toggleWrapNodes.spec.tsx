/** @jsx jsxt */

import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor, toggleWrapNodes } from '..';

jsxt;

describe('active', () => {
  const input = createEditor(
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

  const output = createEditor(
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
  const input = createEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  const output = createEditor(
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
