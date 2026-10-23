/** @jsxRuntime classic */
/** @jsx jsxt */

import {
  createDataTransfer,
  jsxt,
  type TestEditor,
} from '#platejs-test-internal';

import {
  type CreateEditorOptions,
  type BasePluginInput,
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  ContentSlice,
  type InitialValue,
  type Value,
} from '../../../core';
import { CodeBlockPlugin } from './CodeBlockPlugin';

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

  describe('CodeBlockPlugin', () => {
    describe('deserialization inside a code block', () => {
      it('inserts pasted plain text literally instead of a document decoder slice', () => {
        const input = (
          <editor>
            <hcodeblock>
              <htext />
              <cursor />
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>test</hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createFixtureEditor({
          plugins: [
            BaseParagraphPlugin,
            CodeBlockPlugin,
            definePlugin('a', {
              dataTransferFormats: [
                {
                  mimeType: 'text/plain',
                  scope: 'document',
                  decode: () => ContentSlice.closed([{ text: 'decoded' }]),
                },
              ],
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        editor.api.dom.clipboard.insertData(
          createDataTransfer(new Map([['text/plain', 'test']]))
        );

        expect(editor.read.children()).toEqual(output.children);
      });

      it('inserts the text of pasted markup whose plain text repeats the HTML', () => {
        const input = (
          <editor>
            <hcodeblock>
              <htext />
              <cursor />
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>test</hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createFixtureEditor({
          plugins: [BaseParagraphPlugin, CodeBlockPlugin],
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

    describe('deserialization outside a code block', () => {
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
            <hcodeblock>test</hcodeblock>
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

    describe('deleting a physical line break', () => {
      it('keeps one text node', () => {
        const input = (
          <editor>
            <hcodeblock>
              Line 1{'\n'}
              <cursor />
            </hcodeblock>
            <hp>Line 3</hp>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              Line 1
              <cursor />
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
          line 1
          <cursor />
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
          Planetas <anchor />
          mori in
          <focus /> gandavum!
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
          line <anchor />1{'\n'}line 2{'\n'}
          <focus />
          line 3
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
          one
          <cursor />
          {'\n'}two
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
      tx.selection.set(input.selection ?? null);
      tx.codeBlock.toggle();
    });

    expect(editor.read.children()[0]).toMatchObject({ type: 'codeBlock' });
  });
});
