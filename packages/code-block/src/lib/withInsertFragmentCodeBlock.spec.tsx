/** @jsx jsxt */

import type { Descendant } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { BaseParagraphPlugin, createEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { CodeBlockPlugin } from '../react/CodeBlockPlugin';

jsxt;

const editorTest = (input: any, fragment: any, expected: any) => {
  const editor = createPlateEditor({
    plugins: [BaseParagraphPlugin, CodeBlockPlugin],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.insertFragment(fragment);

  // biome-ignore lint/suspicious/noMisplacedAssertion: helper function called inside tests
  expect(editor.children).toEqual(expected.children);
};

describe('pasting a code block', () => {
  describe('when selection outside of code block', () => {
    it('should paste the code block', () => {
      const input = createEditor(
        (
          <editor>
            <hcodeblock>
              <hcodeline>
                <htext />
              </hcodeline>
            </hcodeblock>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      const fragment = (
        <fragment>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection inside of code block', () => {
    it('should insert code lines as a fragment', () => {
      const input = createEditor(
        (
          <editor>
            <hcodeblock>
              <hcodeline>
                <htext />
              </hcodeline>
              <hcodeline>
                hello
                <cursor />
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as any
      );

      const fragment = (
        <fragment>
          <hcodeblock>
            <hcodeline>world</hcodeline>
            <hcodeline>!</hcodeline>
          </hcodeblock>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
            <hcodeline>helloworld</hcodeline>
            <hcodeline>!</hcodeline>
          </hcodeblock>
        </editor>
      ) as any;

      editorTest(input, fragment, expected);
    });
  });
});

describe('pasting non-code block elements', () => {
  it('should extract text and insert as code lines', () => {
    const input = createEditor(
      (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
            <hcodeline>
              hello
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any
    );

    const fragment = (
      <fragment>
        <hp>world</hp>
        <hp>!</hp>
      </fragment>
    ) as any as Descendant[];

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <htext />
          </hcodeline>
          <hcodeline>helloworld</hcodeline>
          <hcodeline>!</hcodeline>
        </hcodeblock>
      </editor>
    ) as any;

    editorTest(input, fragment, expected);
  });
});
