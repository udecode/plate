/** @jsx jsx */

import { createEditorPlugins } from '@udecode/plate/src/utils/createEditorPlugins';
import { SPEditor, TDescendant } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createCodeBlockPlugin } from './createCodeBlockPlugin';

jsx;

const editorTest = (input: any, fragment: any, expected: any) => {
  const editor = createEditorPlugins({
    editor: input,
    plugins: [createParagraphPlugin(), createCodeBlockPlugin()],
  });

  editor.insertFragment(fragment);

  expect(editor.children).toEqual(expected.children);
};

describe('when pasting a code block', () => {
  describe('when selection outside of code block', () => {
    it('should paste only the fragment', () => {
      const input = ((
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
      ) as any) as SPEditor;

      const fragment = ((
        <fragment>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </fragment>
      ) as any) as TDescendant[];

      const expected = ((
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
      ) as any) as SPEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection in empty code line', () => {
    it('should replace the code line', () => {
      const input = ((
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
      ) as any) as SPEditor;

      const fragment = ((
        <fragment>
          <hcodeblock>
            <hcodeline>hello world</hcodeline>
          </hcodeblock>
        </fragment>
      ) as any) as TDescendant[];

      const expected = ((
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
            <hcodeline>hello world</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as SPEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection in non-empty code line', () => {
    it('should paste after the code line', () => {
      const input = ((
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
      ) as any) as SPEditor;

      const fragment = ((
        <fragment>
          <hcodeblock>
            <hcodeline>world</hcodeline>
          </hcodeblock>
        </fragment>
      ) as any) as TDescendant[];

      const expected = ((
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
            <hcodeline>hello</hcodeline>
            <hcodeline>world</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as SPEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('pasting non-code block elements', () => {
    it('should extract text and paste code line', () => {
      const input = ((
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
      ) as any) as SPEditor;

      const fragment = ((
        <fragment>
          <hp>world</hp>
        </fragment>
      ) as any) as TDescendant[];

      const expected = ((
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
            <hcodeline>hello</hcodeline>
            <hcodeline>world</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as SPEditor;

      editorTest(input, fragment, expected);
    });
  });
});
