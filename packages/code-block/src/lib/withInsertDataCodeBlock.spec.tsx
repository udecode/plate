/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { createDataTransfer, jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

jsxt;

const BaseCommentParserPlugin = createBasePlugin({
  key: 'comment_parser',
  parser: {
    deserialize: () => [{ text: 'comment parser' }],
    format: 'text/plain',
  },
});

const createEditor = (input: TestEditor) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
    selection: input.selection,
    value: input.children,
  });

const createEditorWithParser = (input: TestEditor) =>
  createBaseEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseCodeBlockPlugin,
      BaseCommentParserPlugin,
    ],
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
    ) as TestEditor;

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
    ) as TestEditor;

    const editor = createEditor(input);

    editor.api.clipboard.insertData(fragment);

    expect(editor.read.children()).toEqual(expected.children);
  });

  it('creates a new code block from vscode metadata outside an existing code block', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

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
    ) as TestEditor;

    const editor = createEditor(input);

    editor.api.clipboard.insertData(data);

    expect(editor.read.children()).toEqual(expected.children);
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
    ) as TestEditor;

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
    ) as TestEditor;

    const editor = createEditor(input);

    editor.api.clipboard.insertData(data);

    expect(editor.read.children()).toEqual(expected.children);
  });

  it('keeps multiline comments as code when another text parser is present', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

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
    ) as TestEditor;

    const editor = createEditorWithParser(input);

    editor.api.clipboard.insertData(data);

    expect(editor.read.children()).toEqual(expected.children);
  });

  it('delegates mixed expanded selections instead of treating any code match as the active block', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            code
            <anchor />
          </hcodeline>
        </hcodeblock>
        <hp>
          <focus />
          outside
        </hp>
      </editor>
    ) as TestEditor;
    const deserialize = mock(() => [{ text: 'mixed parser' }]);
    const MixedSelectionParserPlugin = createBasePlugin({
      key: 'mixed_selection_parser',
      parser: {
        deserialize,
        format: 'text/plain',
      },
    });
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseCodeBlockPlugin,
        MixedSelectionParserPlugin,
      ],
      selection: input.selection,
      value: input.children,
    });
    const data = createDataTransfer(
      new Map([['text/plain', 'const a = 1;\nconst b = 2;']])
    );

    editor.api.clipboard.insertData(data);

    expect(deserialize).toHaveBeenCalledTimes(1);
  });
});
