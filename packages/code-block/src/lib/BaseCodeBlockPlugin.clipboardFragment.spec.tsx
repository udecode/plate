/** @jsx jsxt */

import type { Descendant, TextInsertFragmentOptions } from '@platejs/plite';

import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { CodeBlockPlugin } from '../react/CodeBlockPlugin';

jsxt;

const editorTest = (
  input: TestEditor,
  fragment: Descendant[],
  expected: TestEditor,
  options?: TextInsertFragmentOptions
) => {
  const editor = createBaseEditor({
    plugins: [BaseParagraphPlugin, CodeBlockPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.update.fragment.replace(fragment, options);

  expect(editor.read.children()).toEqual(expected.children);
};

describe('pasting a code block', () => {
  describe('when selection outside of code block', () => {
    it('paste the code block', () => {
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
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hcodeblock>
            <hcodeline>
              <htext />
            </hcodeline>
          </hcodeblock>
        </fragment>
      ) as Descendant[];

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
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection inside of code block', () => {
    it('insert code lines as a fragment', () => {
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
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hcodeblock>
            <hcodeline>world</hcodeline>
            <hcodeline>!</hcodeline>
          </hcodeblock>
        </fragment>
      ) as Descendant[];

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
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('selects the fitted insertion end and records one undo step', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              hello
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createBaseEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      const fragment = (
        <fragment>
          <hp>world</hp>
          <hp>!</hp>
        </fragment>
      ) as Descendant[];

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hcodeblock>
              <hcodeline>helloworld</hcodeline>
              <hcodeline>!</hcodeline>
            </hcodeblock>
          </editor>
        ).children
      );
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      });
      expect(editor.read.history.undos()).toHaveLength(1);

      editor.update.history.undo();

      expect(editor.read.children()).toEqual(input.children);
    });
  });

  it('uses an explicit code-block target when the selection is outside', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>hello</hcodeline>
        </hcodeblock>
        <hp>
          outside
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const fragment = (
      <fragment>
        <hp>world</hp>
        <hp>!</hp>
      </fragment>
    ) as Descendant[];

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>helloworld</hcodeline>
          <hcodeline>!</hcodeline>
        </hcodeblock>
        <hp>outside</hp>
      </editor>
    ) as TestEditor;

    editorTest(input, fragment, expected, {
      at: { offset: 5, path: [0, 0, 0] },
    });
  });

  it('uses an explicit non-code target when the selection is in code', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            hello
            <cursor />
          </hcodeline>
        </hcodeblock>
        <hp>outside</hp>
      </editor>
    ) as TestEditor;

    const fragment = (
      <fragment>
        <hp>world</hp>
      </fragment>
    ) as Descendant[];

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>hello</hcodeline>
        </hcodeblock>
        <hp>outworldside</hp>
      </editor>
    ) as TestEditor;

    editorTest(input, fragment, expected, {
      at: { offset: 3, path: [1, 0] },
    });
  });
});

describe('pasting non-code block elements', () => {
  it('extract text and insert as code lines', () => {
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
    ) as TestEditor;

    const fragment = (
      <fragment>
        <hp>world</hp>
        <hp>!</hp>
      </fragment>
    ) as Descendant[];

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
    ) as TestEditor;

    editorTest(input, fragment, expected);
  });
});
