/** @jsx jsxt */

import {
  type BaseEditor,
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import {
  defineEditorExtension,
  DocumentChange,
  property,
  schema,
  target,
} from '@platejs/plite';
import { createDataTransfer, jsxt, type TestEditor } from '@platejs/test-utils';
import { NODES } from '@platejs/utils';
import { createLowlight } from 'lowlight';

import {
  CodeBlockPlugin,
  CodeHighlightPlugin,
  CodeLinePlugin,
} from './CodeBlockPlugin';
import { BaseCodeBlockPlugin } from '../lib/BaseCodeBlockPlugin';

jsxt;

const TestCodeBlockPropertyPlugin = createBasePlugin({
  key: 'testCodeBlockProperty',
  schema: {
    properties: [
      schema.elementProperty('foo', property.string(), {
        target: target.type(NODES.codeBlock),
      }),
    ],
  },
});

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
  it('replaces required Base dependencies with exact React descriptors', () => {
    expect(CodeBlockPlugin.dependencies).toEqual([CodeLinePlugin]);
    expect(CodeHighlightPlugin.dependencies).toEqual([CodeBlockPlugin]);
  });

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
              owns: [{ kind: 'schema' }],
              deserialize() {
                return [{ text: 'test' }];
              },
            },
          }),
        ],
        selection: input.selection,
        initialValue: input.children,
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
        initialValue: input.children,
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
        initialValue: input.children,
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
        CodeBlockPlugin,
        CodeHighlightPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      initialValue: input.children,
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
        CodeBlockPlugin,
        CodeHighlightPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      initialValue: input.children,
    });
    const refreshDecorations = mock();

    installRefreshDecorationsProbe(editor, refreshDecorations);

    editor.update.nodes.set({ lang: 'plaintext' }, { at: [0] });

    expect(refreshDecorations).toHaveBeenCalledTimes(1);
  });

  it('does not refresh decorations when highlighting is omitted', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, CodeBlockPlugin],
      initialValue: input.children,
    });
    const refreshDecorations = mock();

    installRefreshDecorationsProbe(editor, refreshDecorations);

    editor.update.nodes.set({ lang: 'json' }, { at: [0] });

    expect(refreshDecorations).not.toHaveBeenCalled();
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
        CodeBlockPlugin,
        CodeHighlightPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
        TestCodeBlockPropertyPlugin,
      ],
      initialValue: input.children,
    });
    const refreshDecorations = mock();

    installRefreshDecorationsProbe(editor, refreshDecorations);

    editor.update.nodes.set({ foo: 'bar' }, { at: [0] });

    expect(refreshDecorations).not.toHaveBeenCalled();
  });

  it('refreshes decorations for a classification-free language change', () => {
    const value = [
      {
        children: [{ children: [{ text: 'aa' }], type: 'code_line' }],
        lang: 'javascript',
        type: 'code_block',
      },
    ];
    const source = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      initialValue: value,
    });

    source.update.nodes.set({ lang: 'json' }, { at: [0] });

    const change = DocumentChange.fromJSON(
      source.read.lastCommit()!.changes.toJSON()
    );
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        CodeBlockPlugin,
        CodeHighlightPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      initialValue: value,
    });
    const refreshDecorations = mock();

    expect(change.primaryClassification).toBeNull();
    installRefreshDecorationsProbe(editor, refreshDecorations);
    editor.update((tx) => tx.changes.apply(change));

    expect(refreshDecorations).toHaveBeenCalledTimes(1);
  });
});
