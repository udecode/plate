/** @jsx jsxt */

import { createLowlight } from 'lowlight';

import {
  createDataTransfer,
  jsxt,
  type TestEditor,
} from '#platejs-test-internal';

import {
  type Editor,
  type CreateEditorOptions,
  type BasePluginInput,
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  ContentSlice,
  defineExtension,
  DocumentChange,
  property,
  schema,
  target,
  type InitialValue,
  type Value,
} from '../../../core';
import { BaseCodeBlockPlugin } from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import {
  CodeBlockPlugin,
  CodeHighlightPlugin,
  CodeLinePlugin,
} from './CodeBlockPlugin';

const createFixtureEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<CreateEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createEditor({
    ...options,
  });

{
  jsxt;

  const TestCodeBlockPropertyPlugin = defineBasePlugin(
    'testCodeBlockProperty',
    {
      schema: {
        properties: {
          foo: schema.elementProperty(property.string(), {
            target: target.element(BaseCodeBlockPlugin),
          }),
        },
      },
    }
  );

  const installRefreshDecorationsProbe = (
    editor: Editor,
    refreshDecorations: () => void
  ) => {
    editor.install(
      defineExtension('react', {
        api: () => ({
          refreshDecorations,
        }),
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

        const editor = createFixtureEditor({
          plugins: [
            BaseParagraphPlugin,
            CodeBlockPlugin,
            defineBasePlugin('a', {
              codecs: ({ defineCodecs }) =>
                defineCodecs({
                  'text/plain': {
                    scope: 'document',
                    decode() {
                      return ContentSlice.closed([{ text: 'test' }]);
                    },
                  },
                }),
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        editor.api.dom.clipboard.insertData(
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

        const editor = createFixtureEditor({
          plugins: [BaseParagraphPlugin, CodeBlockPlugin],
          selection: input.selection,
          initialValue: input.children,
        });

        editor.api.dom.clipboard.insertData(
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

        const editor = createFixtureEditor({
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
      const editor = createFixtureEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          CodeHighlightPlugin.configure({
            initialState: { lowlight: createLowlight() },
          }),
        ],
        initialValue: input.children,
      });
      const refreshDecorations = mock();

      installRefreshDecorationsProbe(editor, refreshDecorations);

      editor.update.nodes.set({ language: 'json' }, { at: [0] });

      expect(refreshDecorations).toHaveBeenCalledTimes(1);
    });

    it('refreshes when the language changes to plaintext', () => {
      const input = (
        <editor>
          <hcodeblock language="javascript">
            <hcodeline>aa</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createFixtureEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          CodeHighlightPlugin.configure({
            initialState: { lowlight: createLowlight() },
          }),
        ],
        initialValue: input.children,
      });
      const refreshDecorations = mock();

      installRefreshDecorationsProbe(editor, refreshDecorations);

      editor.update.nodes.set({ language: 'plaintext' }, { at: [0] });

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
      const editor = createFixtureEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        initialValue: input.children,
      });
      const refreshDecorations = mock();

      installRefreshDecorationsProbe(editor, refreshDecorations);

      editor.update.nodes.set({ language: 'json' }, { at: [0] });

      expect(refreshDecorations).not.toHaveBeenCalled();
    });

    it('does not refresh for unrelated code block properties', () => {
      const input = (
        <editor>
          <hcodeblock language="javascript">
            <hcodeline>aa</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createFixtureEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          CodeHighlightPlugin.configure({
            initialState: { lowlight: createLowlight() },
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
          children: [{ children: [{ text: 'aa' }], type: 'codeLine' }],
          language: 'javascript',
          type: 'codeBlock',
        },
      ];
      const source = createFixtureEditor({
        plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
        initialValue: value,
      });

      source.update.nodes.set({ language: 'json' }, { at: [0] });

      const change = DocumentChange.fromJSON(
        source.read.lastCommit()!.changes.toJSON()
      );
      const editor = createFixtureEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          CodeHighlightPlugin.configure({
            initialState: { lowlight: createLowlight() },
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
}

jsxt;

describe('toggle code block', () => {
  it('turn a p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line 1
          <cursor />
        </hp>
        <hp>line 2</hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line 1
            <cursor />
          </hcodeline>
        </hcodeblock>
        <hp>line 2</hp>
      </editor>
    ) as TestEditor;

    const editor = createFixtureEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('turn a p with a selection to code block', () => {
    const input = (
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            Planetas <anchor />
            mori in
            <focus /> gandavum!
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createFixtureEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('turn multiple p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line <anchor />1
        </hp>
        <hp>line 2</hp>
        <hp>
          <focus />
          line 3
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line <anchor />1
          </hcodeline>
          <hcodeline>line 2</hcodeline>
          <hcodeline>
            <focus />
            line 3
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createFixtureEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('turn a code block into paragraphs', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            one
            <cursor />
          </hcodeline>
          <hcodeline>two</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const output = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
        <hp>two</hp>
      </editor>
    ) as TestEditor;
    const editor = createFixtureEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('uses a selection written earlier in the same transaction', () => {
    const input = (
      <editor>
        <hp>
          line 1
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createFixtureEditor({
      plugins: [CodeBlockPlugin],
      initialValue: input.children,
    });

    editor.update((tx) => {
      tx.selection.set(input.selection);
      tx.codeBlock.toggle();
    });

    expect(editor.read.children()[0]).toMatchObject({ type: 'codeBlock' });
  });
});
