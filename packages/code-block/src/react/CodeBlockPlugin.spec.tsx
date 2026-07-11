/** @jsx jsxt */

import {
  type BaseEditor,
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { defineEditorExtension } from '@platejs/plite';
import { createDataTransfer, jsxt, type TestEditor } from '@platejs/test-utils';
import { createLowlight } from 'lowlight';

import { CodeBlockPlugin } from './CodeBlockPlugin';

jsxt;

const installRefreshDecorationsProbe = (
  editor: BaseEditor,
  refreshDecorations: () => void
) => {
  editor.extend(
    defineEditorExtension({
      api: {
        react: {
          refreshDecorations,
        },
      },
      name: 'test:react-refresh-decorations',
    })
  );
};

describe('CodeBlockPlugin', () => {
  describe('deserialization inside a code line', () => {
    it('disable all deserializers except the ast serializer', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          createBasePlugin({
            key: 'a',
            parser: {
              format: 'text/plain',
              deserialize() {
                return [{ text: 'test' }];
              },
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.api.clipboard.insertData(
        createDataTransfer(
          new Map([
            ['text/html', '<pre><code>test</code></pre>'],
            ['text/plain', '<pre><code>test</code></pre>'],
          ])
        )
      );

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('deserialization outside a code line', () => {
    it('does not affect deserialization', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.api.clipboard.insertData(
        createDataTransfer(
          new Map([['text/html', '<pre><code>test</code></pre>']])
        )
      );

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('normalization after deleting code lines', () => {
    it('normalizes inserted nodes into code lines', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>Line 1</hcodeline>
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>Line 3</hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              Line 1
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>Line 3</hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.text.deleteBackward();
      expect(editor.read.children()).toEqual(output.children);
    });
  });
});

describe('CodeBlockPlugin operations', () => {
  it('refreshes decorations when the language changes', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        CodeBlockPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      value: input.children,
    });
    const refreshDecorations = mock();

    installRefreshDecorationsProbe(editor, refreshDecorations);

    editor.update.nodes.set({ lang: 'json' }, { at: [0] });

    expect(refreshDecorations).toHaveBeenCalledTimes(1);
  });

  it('refreshes when the language changes to plaintext', () => {
    const input = (
      <editor>
        <hcodeblock lang="javascript">
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        CodeBlockPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      value: input.children,
    });
    const refreshDecorations = mock();

    installRefreshDecorationsProbe(editor, refreshDecorations);

    editor.update.nodes.set({ lang: 'plaintext' }, { at: [0] });

    expect(refreshDecorations).toHaveBeenCalledTimes(1);
  });

  it('does not refresh for unrelated code block properties', () => {
    const input = (
      <editor>
        <hcodeblock lang="javascript">
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        CodeBlockPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      value: input.children,
    });
    const refreshDecorations = mock();

    installRefreshDecorationsProbe(editor, refreshDecorations);

    editor.update.nodes.set({ foo: 'bar' }, { at: [0] });

    expect(refreshDecorations).not.toHaveBeenCalled();
  });
});
