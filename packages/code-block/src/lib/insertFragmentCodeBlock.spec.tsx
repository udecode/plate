/** @jsx jsxt */

import type { SlateEditor, TDescendant } from '@udecode/plate-common';

import { BaseParagraphPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { CodeBlockPlugin } from '../react/CodeBlockPlugin';

jsxt;

const editorTest = (input: any, fragment: any, expected: any) => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [BaseParagraphPlugin, CodeBlockPlugin],
  });

  editor.insertFragment(fragment);

  expect(editor.children).toEqual(expected.children);
};

describe('pasting a code block', () => {
  describe('when selection outside of code block', () => {
    it('should paste the code block', () => {
      const input = (
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
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </fragment>
      ) as any as TDescendant[];

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
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection inside of code block', () => {
    it('should insert code lines as a fragment', () => {
      const input = (
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
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hcodeblock>
            <hcodeline>world</hcodeline>
            <hcodeline>!</hcodeline>
          </hcodeblock>
        </fragment>
      ) as any as TDescendant[];

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
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });
  });
});

describe('pasting non-code block elements', () => {
  it('should extract text and insert as code lines', () => {
    const input = (
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
    ) as any as SlateEditor;

    const fragment = (
      <fragment>
        <hp>world</hp>
        <hp>!</hp>
      </fragment>
    ) as any as TDescendant[];

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
    ) as any as SlateEditor;

    editorTest(input, fragment, expected);
  });
});
