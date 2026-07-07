/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { BaseLinkPlugin } from '@platejs/link';
import { createDataTransfer, jsxt } from '@platejs/test-utils';
import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

jsxt;

const createEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
    selection: input.selection,
    value: input.children,
  });

const createEditorWithLink = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin, BaseLinkPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('when pasting text into a code block', () => {
  it('paste only the fragment', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <htext />
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const fragment = createDataTransfer(
      new Map([
        [
          'text/html',
          '<html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><pre style="background-color:#212121;color:#eeffff;font-family:\'MonoLisa 600 normal\',monospace;font-size:9.8pt;"><span style="color:#c792ea;font-style:italic;">const&#32;</span><span style="color:#a9b7c6;">a&#32;</span><span style="color:#89ddff;">=&#32;</span><span style="color:#c3e88d;">\'b\'</span><span style="color:#89ddff;">;<br></span><span style="color:#c792ea;font-style:italic;">const&#32;</span><span style="color:#a9b7c6;">c&#32;</span><span style="color:#89ddff;">=&#32;</span><span style="color:#c3e88d;">\'d\'</span><span style="color:#89ddff;">;</span></pre></body></html>',
        ],
        ['text/plain', 'const a = "b";\nconst c = "d";'],
      ])
    );

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>const a = "b";</hcodeline>
          <hcodeline>const c = "d";</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    editor.tf.insertData(fragment);

    expect(editor.children).toEqual(expected.children);
  });

  it('creates a new code block from vscode metadata outside an existing code block', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const data = createDataTransfer(
      new Map([
        ['text/plain', 'const a = "b";\nconst c = "d";'],
        ['vscode-editor-data', JSON.stringify({ mode: 'typescript' })],
      ])
    );

    const expected = (
      <editor>
        <hp>
          <htext />
        </hp>
        <hcodeblock lang="typescript">
          <hcodeline>const a = "b";</hcodeline>
          <hcodeline>
            const c = "d";
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    editor.tf.insertData(data);

    expect(editor.children).toEqual(expected.children);
  });

  it('inserts vscode lines into the current code block instead of nesting one', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const data = createDataTransfer(
      new Map([
        ['text/plain', 'const a = "b";\nconst c = "d";'],
        ['vscode-editor-data', JSON.stringify({ mode: 'typescript' })],
      ])
    );

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>const a = "b";</hcodeline>
          <hcodeline>
            const c = "d";
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    editor.tf.insertData(data);

    expect(editor.children).toEqual(expected.children);
  });

  it('keeps pasted // comments as plain code when link plugin is present', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const data = createDataTransfer(
      new Map([
        ['text/plain', '// this is a comment\nconsole.log("hello world");'],
      ])
    );

    const expected = (
      <editor>
        <hcodeblock>
          <hcodeline>// this is a comment</hcodeline>
          <hcodeline>
            console.log("hello world");
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditorWithLink(input);

    editor.tf.insertData(data);

    expect(editor.children).toEqual(expected.children);
  });
});
