/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import { createLowlight } from 'lowlight';

import {
  createDataTransfer,
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '#platejs-test-internal';

import {
  BaseParagraphPlugin,
  type BasePluginInput,
  ContentSlice,
  createEditor,
  type CreateEditorOptions,
  DebugPlugin,
  defineBasePlugin,
  type Descendant,
  type InitialValue,
  type NodeEntry,
  PLUGINS,
  SelectionApi,
  type TextInsertFragmentOptions,
  type Value,
} from '../../../core';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { getPlateDecorationSources } from '../../../internal/plugin/getPlateDecorationSources';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  type CodeBlockElement,
} from './BaseCodeBlockPlugin';
import { CodeBlockRules } from './CodeBlockRules';

const createFixtureEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<CreateEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createEditor({
    ...options,
  });

describe('BaseCodeBlockPlugin', () => {
  it('indents the first empty line at offset zero', () => {
    const editor = createFixtureEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      initialValue: [{ type: 'codeBlock', children: [{ text: '\nalpha' }] }],
    });

    expect(editor.update.codeBlock.tab()).toBe(true);
    expect(editor.read.children()).toEqual([
      { type: 'codeBlock', children: [{ text: '  \nalpha' }] },
    ]);
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('injects the html query guard and binds the code block tx group', () => {
    const editorWithCodeBlock = createFixtureEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'codeBlock',
        },
      ],
    });
    const editorWithoutCodeBlock = createFixtureEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const html = new Map([['text/html', '<p>pasted</p>']]);

    expect(BaseCodeBlockPlugin.name).toBe('codeBlock');
    expect(BaseCodeBlockPlugin.name).toBe(PLUGINS.codeBlock);
    expect(BaseCodeHighlightPlugin.name).toBe('codeSyntax');
    expect(BaseCodeHighlightPlugin.name).toBe(PLUGINS.codeSyntax);
    expect(BaseCodeBlockPlugin.dependencies).toEqual([]);
    expect(BaseCodeHighlightPlugin.dependencies).toEqual([BaseCodeBlockPlugin]);
    expect(editorWithCodeBlock.read.schema.create(BaseCodeBlockPlugin)).toEqual(
      {
        children: [{ text: '' }],
        type: 'codeBlock',
      }
    );
    expect(
      editorWithCodeBlock.read.schema.getElementSlicePolicy({
        children: [{ text: '' }],
        type: 'codeBlock',
      })
    ).toEqual({ preserveContext: true, replaceWhenCovered: false });
    expect(
      editorWithCodeBlock.read.schema.element(BaseCodeBlockPlugin)?.groups
    ).toContain('block');
    expect(() =>
      editorWithCodeBlock.read.schema.assertDocument({
        children: [
          {
            children: [{ text: 'a' }, { text: 'b' }],
            type: 'codeBlock',
          },
        ],
      })
    ).toThrow(/at most 1|maximum.*1|cannot contain/i);

    expect(
      editorWithCodeBlock.api.dom.clipboard.insertData(createDataTransfer(html))
    ).toBe(false);
    expect(
      editorWithoutCodeBlock.api.dom.clipboard.insertData(
        createDataTransfer(html)
      )
    ).toBe(true);

    expect(editorWithCodeBlock.update.codeBlock.toggle).toEqual(
      expect.any(Function)
    );

    editorWithoutCodeBlock.plugin(BaseCodeBlockPlugin).update.insert();

    expect(editorWithoutCodeBlock.read.children().at(-1)).toEqual({
      children: [{ text: '' }],
      type: 'codeBlock',
    });
  });

  it('decodes and encodes one newline-bearing text through HTML', () => {
    const editor = createFixtureEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [{ text: 'const a = 1;\n\nconst b = 2;\n' }],
          language: 'typescript',
          type: 'codeBlock',
        },
      ],
    });
    const data = new DataTransfer();

    expect(
      editor.api.html.deserialize({
        element:
          '<pre><select>TypeScript</select>const a = 1;\n\nconst b = 2;</pre>',
      })
    ).toEqual([
      {
        children: [{ text: 'const a = 1;\n\nconst b = 2;' }],
        type: 'codeBlock',
      },
    ]);

    editor.api.dom.clipboard.writeSelection(data);

    const { body } = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    );
    const pre = body.querySelector('pre[data-language="typescript"]');

    if (!(pre instanceof HTMLElement)) {
      throw new TypeError('Expected an encoded code block.');
    }

    expect(pre.querySelector('code')?.textContent).toBe(
      'const a = 1;\n\nconst b = 2;\n'
    );
    expect(pre.dataset.codeTrailingNewlines).toBe('1');
    expect(editor.api.html.deserialize({ element: pre })).toEqual([
      ...editor.read.children(),
    ]);

    expect(
      editor.api.html.deserialize({
        element: '<pre>const a = 1;<br>const b = 2;</pre>',
      })
    ).toEqual([
      {
        children: [{ text: 'const a = 1;\nconst b = 2;' }],
        type: 'codeBlock',
      },
    ]);
  });

  it('keeps syntax highlighting absent when only code blocks are installed', () => {
    const editor = createFixtureEditor({
      plugins: [BaseCodeBlockPlugin],
    });

    expect(getPlateDecorationSources(editor)).toEqual([]);

    expect(() => editor.plugin(BaseCodeHighlightPlugin).name).toThrow(
      /not installed/i
    );
  });
});

{
  const createFormatterEditor = (code: string, language: string) =>
    createFixtureEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      initialValue: [
        {
          children: [{ text: code }],
          language,
          type: 'codeBlock',
        },
      ],
    });

  const getCodeBlock = (editor: ReturnType<typeof createFormatterEditor>) => {
    const entry = editor.plugin(BaseCodeBlockPlugin).read.entry({ at: [0, 0] });
    assert.ok(entry?.codeBlock);

    return entry.codeBlock[0];
  };

  describe('formatter', () => {
    it('does nothing when the block language is unsupported', () => {
      const editor = createFormatterEditor('{"name":"plate"}', 'javascript');
      const before = editor.read.children();
      const element = getCodeBlock(editor);

      editor.update.codeBlock.format({ element });

      expect(editor.read.children()).toEqual(before);
    });

    it('does nothing when the code is invalid for the language', () => {
      const editor = createFormatterEditor('{name:"plate"}', 'json');
      const before = editor.read.children();
      const element = getCodeBlock(editor);

      editor.update.codeBlock.format({ element });

      expect(editor.read.children()).toEqual(before);
    });

    it('formats valid json code blocks in place', () => {
      const editor = createFormatterEditor(
        '{"name":"plate","type":"editor"}',
        'json'
      );
      const element = getCodeBlock(editor);

      editor.update.codeBlock.format({ element });

      expect(getCodeBlock(editor).children).toEqual([
        { text: '{\n  "name": "plate",\n  "type": "editor"\n}' },
      ]);
    });

    it('formats json into separate code lines', () => {
      const editor = createFixtureEditor({
        plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
        initialValue: [
          {
            children: [{ text: '{"name":"plate","type":"editor"}' }],
            language: 'json',
            type: 'codeBlock',
          },
        ],
      });
      const element = getCodeBlock(editor);
      editor.update.codeBlock.format({ element });

      expect(getCodeBlock(editor).children).toEqual([
        { text: '{\n  "name": "plate",\n  "type": "editor"\n}' },
      ]);
    });
  });
}

jsxt;

describe('isCodeBlockEmpty', () => {
  const run = (input: TestEditor) =>
    createFixtureEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    }).read.codeBlock.isEmpty();

  it.each([
    {
      expected: false,
      input: (
        <editor>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hcodeblock>
            <htext />
          </hcodeblock>
        </editor>
      ),
      title: 'returns false outside a code block',
    },
    {
      expected: false,
      input: (
        <editor>
          <hcodeblock>
            <cursor />
            {'\n'}
          </hcodeblock>
        </editor>
      ),
      title: 'returns false for a multi-line code block',
    },
    {
      expected: false,
      input: (
        <editor>
          <hcodeblock>
            test
            <cursor />
          </hcodeblock>
        </editor>
      ),
      title: 'returns false for a non-empty code line',
    },
    {
      expected: true,
      input: (
        <editor>
          <hcodeblock>
            <htext />
            <cursor />
          </hcodeblock>
        </editor>
      ),
      title: 'returns true for a single empty code line',
    },
  ])('$title', ({ input, expected }) => {
    expect(run(input)).toBe(expected);
  });
});

{
  jsxt;

  const createTestEditor = ({ input }: { input: TestEditor }) =>
    createFixtureEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

  describe('insert break', () => {
    describe('when cursor is inside code line', () => {
      it('insert a new code line with same indentation', () => {
        const input = (
          <editor>
            <hcodeblock>
              {'    '}before
              <cursor />
              after
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              {'    '}before{'\n'}
              {'    '}
              <cursor />
              after
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createTestEditor({ input });

        editor.update.break.insert();

        expect(editor.read.children()).toEqual(output.children);
      });

      it('replaces an expanded selection with a code-local line split', () => {
        const input = (
          <editor>
            <hcodeblock>
              ab
              <anchor />
              cd
              <focus />
              ef
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              ab{'\n'}
              <cursor />
              ef
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createTestEditor({ input });

        editor.update.break.insert();

        expect(editor.read.children()).toEqual(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      });

      it('preserves the indentation level when splitting inside whitespace', () => {
        const input = (
          <editor>
            <hcodeblock>
              {'  '}
              <cursor />
              {'  '}before
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              {'  '}
              {'\n'}
              {'  '}
              <cursor />
              {'  '}before
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createTestEditor({ input });

        editor.update.break.insert();

        expect(editor.read.children()).toEqual(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      });
    });
  });

  describe('resetBlock', () => {
    it('unwraps a code block into paragraphs', () => {
      const input = (
        <editor>
          <hcodeblock>
            <cursor />
            aa
            {'\n'}bb
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>
            <cursor />
            aa
          </hp>
          <hp>bb</hp>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      editor.update.codeBlock.resetBlock();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('deleteBackward', () => {
    it('keeps deleteBackward local at the start of a non-empty first code line', () => {
      const input = (
        <editor>
          <hcodeblock>
            <cursor />
            aa
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(input.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(input.selection)
      );
    });

    it('merges an empty non-first code line into the previous line', () => {
      const input = (
        <editor>
          <hcodeblock>
            aa{'\n'}
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            aa
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(output.selection)
      );
    });

    it('unwraps an empty code block to a plain paragraph', () => {
      const input = (
        <editor>
          <hcodeblock>
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(output.selection)
      );
    });
  });

  describe('selectAll', () => {
    it('expands the selection to the whole code block', () => {
      const input = (
        <editor>
          <hcodeblock>
            be
            <anchor />
            fo
            <focus />
            re
            {'\n'}after
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      editor.update.codeBlock.selectAll();

      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 12, path: [0, 0] },
      });
    });

    it('falls through after the whole code block is selected', () => {
      const input = (
        <editor>
          <hcodeblock>
            <anchor />
            before
            {'\n'}
            after
            <focus />
          </hcodeblock>
          <hp>outside</hp>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      expect(
        getPlateRuntime(editor).shortcuts['codeBlock.selectAll']?.keys
      ).toBe('mod+a');
      expect(editor.update.codeBlock.selectAll()).toBe(false);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(input.selection)
      );
    });
  });

  describe('tab', () => {
    it('indents every selected code line', () => {
      const input = (
        <editor>
          <hcodeblock>
            <anchor />
            aa
            {'\n'}
            bb
            <focus />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            {'  '}
            aa
            {'\n'}
            {'  '}
            bb
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      expect(editor.update.codeBlock.tab({ reverse: false })).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
    });

    it('outdents every selected code line when reversed', () => {
      const input = (
        <editor>
          <hcodeblock>
            <anchor />
            {'  '}aa
            {'\n'}
            {'  '}bb
            <focus />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>aa{'\n'}bb</hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      expect(editor.update.codeBlock.tab({ reverse: true })).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
    });

    it('inserts spaces at a collapsed cursor after code text', () => {
      const input = (
        <editor>
          <hcodeblock>
            aa
            <cursor />
            bb
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            aa{'  '}
            <cursor />
            bb
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor({ input });

      expect(editor.update.codeBlock.tab()).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(output.selection)
      );
    });
  });

  describe('insert', () => {
    it('inserts an empty code block on a selected empty line', () => {
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
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createTestEditor({ input });

      editor.update.codeBlock.insert();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('inserts an empty code block below a selected non-empty line', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <hp>test</hp>
          <hcodeblock>
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createTestEditor({ input });

      editor.update.codeBlock.insert();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('converts the inserted block when targeting an explicit block', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <hp>test</hp>
          <hcodeblock>
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createTestEditor({ input });

      editor.update.codeBlock.insert({}, { at: [0], select: false });

      expect(editor.read.children()).toEqual(output.children);
    });

    it('inserts an empty code block below an expanded selection', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            line <anchor />2
          </hp>
          <hp>line 3</hp>
          <hp>
            line 4<focus />
          </hp>
          <hp>line 5</hp>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <hp>line 1</hp>
          <hp>line 2</hp>
          <hp>line 3</hp>
          <hp>line 4</hp>
          <hcodeblock>
            <cursor />
          </hcodeblock>
          <hp>line 5</hp>
        </editor>
      ) as TestEditor;
      const editor = createTestEditor({ input });

      editor.update.codeBlock.insert();

      expect(editor.read.children()).toEqual(output.children);
    });
  });
}

jsxt;

describe('BaseCodeBlockPlugin input rules', () => {
  it('promotes triple backticks when the markdown group is enabled', () => {
    const input = (
      <editor>
        <hp>
          ``
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createFixtureEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert('`');
    editor.update.text.insert('code');

    expect(editor.read.children()).toEqual(
      (
        <editor>
          <hcodeblock>code</hcodeblock>
        </editor>
      ).children
    );
  });

  it('replaces the fence paragraph instead of leaving the first two backticks behind', () => {
    const editor = createFixtureEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '``' }], type: 'paragraph' }],
    });

    editor.update.text.insert('`');

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'codeBlock',
      },
    ]);
  });

  it('promotes a ``` paragraph on Enter when configured with on: break', () => {
    const input = (
      <editor>
        <hp>
          ```
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createFixtureEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'break' })],
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'codeBlock',
      },
    ]);
  });
});

{
  jsxt;

  const BaseCommentCodecPlugin = defineBasePlugin('commentParser', {
    codecs: ({ defineCodecs }) =>
      defineCodecs({
        'text/plain': {
          scope: 'document',
          decode: () => ContentSlice.closed([{ text: 'comment parser' }]),
        },
      }),
  });

  const createTestEditor = (input: TestEditor) =>
    createFixtureEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

  const createEditorWithParser = (input: TestEditor) =>
    createFixtureEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseCodeBlockPlugin,
        BaseCommentCodecPlugin,
      ],
      selection: input.selection,
      initialValue: input.children,
    });

  describe('when pasting text into a code block', () => {
    it('paste only the fragment', () => {
      const input = (
        <editor>
          <hcodeblock>
            <htext />
            <cursor />
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
          <hcodeblock>const a = "b";{'\n'}const c = "d";</hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor(input);

      editor.api.dom.clipboard.insertData(fragment);

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
          <hcodeblock language="typescript">
            const a = "b";{'\n'}
            const c = "d";
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor(input);
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => (commits += 1) - 1);

      editor.api.dom.clipboard.insertData(data);
      unsubscribe();

      expect(editor.read.children()).toEqual(expected.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(expected.selection)
      );
      expect(commits).toBe(1);
      expect(editor.read.history.undos()).toHaveLength(1);
    });

    it('inserts vscode lines into the current code block instead of nesting one', () => {
      const input = (
        <editor>
          <hcodeblock>
            <cursor />
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
            const a = "b";{'\n'}
            const c = "d";
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createTestEditor(input);

      editor.api.dom.clipboard.insertData(data);

      expect(editor.read.children()).toEqual(expected.children);
    });

    it('keeps multiline comments as code when another text parser is present', () => {
      const input = (
        <editor>
          <hcodeblock>
            <cursor />
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
            {'// this is a comment'}
            {'\n'}
            console.log("hello world");
            <cursor />
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditorWithParser(input);

      editor.api.dom.clipboard.insertData(data);

      expect(editor.read.children()).toEqual(expected.children);
    });

    it('delegates mixed expanded selections instead of treating any code match as the active block', () => {
      const input = (
        <editor>
          <hcodeblock>
            code
            <anchor />
          </hcodeblock>
          <hp>
            <focus />
            outside
          </hp>
        </editor>
      ) as TestEditor;
      const deserialize = mock(() => [{ text: 'mixed parser' }]);
      const MixedSelectionCodecPlugin = defineBasePlugin(
        'mixedSelectionParser',
        {
          codecs: ({ defineCodecs }) =>
            defineCodecs({
              'text/plain': {
                scope: 'document',
                decode: () => ContentSlice.closed(deserialize()),
              },
            }),
        }
      );
      const editor = createFixtureEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseCodeBlockPlugin,
          MixedSelectionCodecPlugin,
        ],
        selection: input.selection,
        initialValue: input.children,
      });
      const data = createDataTransfer(
        new Map([['text/plain', 'const a = 1;\nconst b = 2;']])
      );

      editor.api.dom.clipboard.insertData(data);

      expect(deserialize).toHaveBeenCalledTimes(1);
    });
  });
}

{
  jsxt;

  const editorTest = (
    input: TestEditor,
    fragment: Descendant[],
    expected: TestEditor,
    options?: TextInsertFragmentOptions
  ) => {
    const editor = createFixtureEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
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
              <htext />
            </hcodeblock>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hcodeblock>
              <htext />
            </hcodeblock>
          </fragment>
        ) as Descendant[];

        const expected = (
          <editor>
            <hcodeblock>
              <htext />
            </hcodeblock>
            <hcodeblock>
              <htext />
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
              {'\n'}
              hello
              <cursor />
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hcodeblock>world{'\n'}!</hcodeblock>
          </fragment>
        ) as Descendant[];

        const expected = (
          <editor>
            <hcodeblock>
              {'\n'}helloworld{'\n'}!
            </hcodeblock>
          </editor>
        ) as TestEditor;

        editorTest(input, fragment, expected);
      });

      it('selects the fitted insertion end and records one undo step', () => {
        const input = (
          <editor>
            <hcodeblock>
              hello
              <cursor />
            </hcodeblock>
          </editor>
        ) as TestEditor;
        const editor = createFixtureEditor({
          plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
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
              <hcodeblock>helloworld{'\n'}!</hcodeblock>
            </editor>
          ).children
        );
        expect(editor.read.selection()).toEqual({
          anchor: { offset: 12, path: [0, 0] },
          focus: { offset: 12, path: [0, 0] },
        });
        expect(editor.read.history.undos()).toHaveLength(1);

        editor.update.history.undo();

        expect(editor.read.children()).toEqual(input.children);
      });
    });

    it('uses an explicit code-block target when the selection is outside', () => {
      const input = (
        <editor>
          <hcodeblock>hello</hcodeblock>
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
          <hcodeblock>helloworld{'\n'}!</hcodeblock>
          <hp>outside</hp>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected, {
        at: { offset: 5, path: [0, 0] },
      });
    });

    it('uses an explicit non-code target when the selection is in code', () => {
      const input = (
        <editor>
          <hcodeblock>
            hello
            <cursor />
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
          <hcodeblock>hello</hcodeblock>
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
            {'\n'}
            hello
            <cursor />
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
            {'\n'}helloworld{'\n'}!
          </hcodeblock>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });
  });
}

const mockLowlight = createLowlight();
const mockHighlight = spyOn(mockLowlight, 'highlight');
const mockHighlightAuto = spyOn(mockLowlight, 'highlightAuto');
const mockListLanguages = spyOn(mockLowlight, 'listLanguages');
const mockRegister = spyOn(mockLowlight, 'register');
const mockRegisterAlias = spyOn(mockLowlight, 'registerAlias');

type HighlightResult = ReturnType<typeof mockLowlight.highlight>;

const highlightText = (value: string, className?: string[]) =>
  className
    ? {
        children: [{ type: 'text' as const, value }],
        properties: { className },
        tagName: 'span',
        type: 'element' as const,
      }
    : { type: 'text' as const, value };

const highlightResult = (
  ...children: HighlightResult['children']
): HighlightResult => ({ children, type: 'root' });

const createHighlightEditor = () =>
  createFixtureEditor({
    plugins: [
      BaseCodeHighlightPlugin.configure({
        initialState: {
          defaultLanguage: 'javascript',
          lowlight: mockLowlight,
        },
      }),
    ],
  });

let editor: ReturnType<typeof createHighlightEditor>;

const getDecorations = (
  innerEditor: ReturnType<typeof createHighlightEditor>,
  [codeBlock]: NodeEntry<CodeBlockElement>
) => {
  innerEditor.update.value.replace({
    children: [codeBlock],
    selection: null,
  });
  const sources = getPlateDecorationSources(innerEditor);
  const decorate = (entry: NodeEntry) =>
    sources.flatMap((source) => source.read({ editor: innerEditor, entry }));
  const text = innerEditor.read.nodes.get([0, 0]);

  if (!text) throw new Error('Expected code block text');

  return decorate(text);
};

beforeEach(() => {
  // Reset mocks
  mockHighlight.mockReset();
  mockHighlightAuto.mockReset();
  mockListLanguages.mockReset();
  mockRegister.mockReset();
  mockRegisterAlias.mockReset();
  mockListLanguages.mockReturnValue(['javascript', 'typescript']);

  editor = createHighlightEditor();
  spyOn(editor.plugin(DebugPlugin).api, 'error');
  spyOn(editor.plugin(DebugPlugin).api, 'warn');
});

describe('codeBlockToDecorations', () => {
  it.each([
    { operation: 'insert', nextIndex: 2 },
    { operation: 'remove', nextIndex: 0 },
    { operation: 'move', nextIndex: 0 },
  ])(
    'keeps cached syntax on its block after $operation',
    ({ operation, nextIndex }) => {
      mockHighlight.mockReturnValue(
        highlightResult(highlightText('const', ['token', 'keyword']))
      );
      editor.update.value.replace({
        children: [
          { type: 'paragraph', children: [{ text: 'plain before' }] },
          {
            type: 'codeBlock',
            language: 'javascript',
            children: [{ text: 'const value = 1;' }],
          },
          { type: 'paragraph', children: [{ text: 'plain after' }] },
        ],
        selection: null,
      });
      const [source] = getPlateDecorationSources(editor);
      const before = source.read({
        editor,
        entry: editor.read.nodes.get([1, 0])!,
      });

      if (operation === 'insert') {
        editor.update.nodes.insert(
          { type: 'paragraph', children: [{ text: 'inserted' }] },
          { at: [0] }
        );
      } else if (operation === 'remove') {
        editor.update.nodes.remove({ at: [0] });
      } else {
        editor.update.nodes.move({ at: [1], to: [0] });
      }

      const after = source.read({
        editor,
        entry: editor.read.nodes.get([nextIndex, 0])!,
      });

      expect(after).toHaveLength(1);
      expect(after[0]).toMatchObject({
        attributes: { className: 'token keyword' },
        range: {
          anchor: { offset: 0, path: [nextIndex, 0] },
          focus: { offset: 5, path: [nextIndex, 0] },
        },
      });
      expect(before[0]).toMatchObject({
        range: { anchor: { path: [1, 0] }, focus: { path: [1, 0] } },
      });
      expect(mockHighlight).toHaveBeenCalledTimes(1);
    }
  );

  it('reads current language for every changed block while retaining sibling syntax', () => {
    mockHighlight.mockReturnValue(
      highlightResult(highlightText('const', ['token', 'keyword']))
    );
    const fixtureEditor = createFixtureEditor({
      plugins: [
        BaseCodeHighlightPlugin.configure({
          initialState: {
            defaultLanguage: 'javascript',
            lowlight: mockLowlight,
          },
        }),
      ],
      initialValue: ['first', 'second', 'third'].map((name) => ({
        children: [{ text: `const ${name} = 1;` }],
        language: 'javascript',
        type: 'codeBlock',
      })),
    });
    const [source] = getPlateDecorationSources(fixtureEditor);
    const read = (index: number) =>
      source.read({
        editor: fixtureEditor,
        entry: fixtureEditor.read.nodes.get([index, 0])!,
      });
    read(0);
    read(1);
    const sibling = read(2);

    fixtureEditor.update((tx) => {
      tx.nodes.set(
        { language: 'plaintext' },
        {
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 17, path: [1, 0] },
          },
          type: 'codeBlock',
        }
      );
    });
    expect(read(0)).toEqual([]);
    expect(read(1)).toEqual([]);
    expect(read(2)).toBe(sibling);
    expect(mockHighlight).toHaveBeenCalledTimes(3);
    fixtureEditor.update.nodes.set({ language: 'typescript' }, { at: [0] });
    expect(read(0)).toHaveLength(1);
    expect(mockHighlight).toHaveBeenLastCalledWith(
      'typescript',
      'const first = 1;'
    );
    expect(read(2)).toBe(sibling);
    expect(mockHighlight).toHaveBeenCalledTimes(4);
  });

  it('releases parser output after the last observer leaves', () => {
    mockHighlight.mockReturnValue(
      highlightResult(highlightText('const', ['token', 'keyword']))
    );
    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'const value = 1;' }],
          language: 'javascript',
          type: 'codeBlock',
        },
      ],
      selection: null,
    });
    const [source] = getPlateDecorationSources(editor);
    const read = () =>
      source.read({ editor, entry: editor.read.nodes.get([0, 0])! });
    const unmountFirst = source.observe?.({ refresh: () => {} });
    const unmountSecond = source.observe?.({ refresh: () => {} });
    const before = read();

    unmountFirst?.();
    expect(read()).toBe(before);
    expect(mockHighlight).toHaveBeenCalledTimes(1);
    unmountSecond?.();
    const unmountAgain = source.observe?.({ refresh: () => {} });
    expect(read()).not.toBe(before);
    expect(mockHighlight).toHaveBeenCalledTimes(2);
    unmountAgain?.();
  });

  it('retains current token identities and immutable ranges through a text edit', () => {
    mockHighlight
      .mockReturnValueOnce(
        highlightResult(
          highlightText('const', ['keyword']),
          highlightText(' x = '),
          highlightText('1', ['number']),
          highlightText('; '),
          highlightText('true', ['literal'])
        )
      )
      .mockReturnValueOnce(
        highlightResult(
          highlightText('const', ['keyword']),
          highlightText(' x = '),
          highlightText('12', ['number']),
          highlightText('; '),
          highlightText('true', ['literal'])
        )
      );
    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'const x = 1; true' }],
          language: 'javascript',
          type: 'codeBlock',
        },
      ],
      selection: null,
    });
    const [source] = getPlateDecorationSources(editor);
    const before = source.read({
      editor,
      entry: editor.read.nodes.get([0, 0])!,
    });
    editor.update.text.insert('2', { at: { path: [0, 0], offset: 11 } });
    const after = source.read({
      editor,
      entry: editor.read.nodes.get([0, 0])!,
    });

    expect(mockHighlight).toHaveBeenCalledTimes(2);
    expect(after[0]).toBe(before[0]);
    expect(after[1].range.focus.offset).toBe(12);
    expect(after[2].key).toBe(before[2].key);
    expect(after[2].range.anchor.offset).toBe(14);
    expect(before[2].range.anchor.offset).toBe(13);
    expect(
      after.every(
        (decoration) =>
          Object.isFrozen(decoration) &&
          Object.isFrozen(decoration.range) &&
          Object.isFrozen(decoration.range.anchor) &&
          Object.isFrozen(decoration.range.anchor.path) &&
          Object.isFrozen(decoration.attributes)
      )
    ).toBe(true);
    expect(source.read({ editor, entry: editor.read.nodes.get([0, 0])! })).toBe(
      after
    );
    expect(mockHighlight).toHaveBeenCalledTimes(2);
  });

  it('evicts a removed block and reads a replacement highlighter without an observer', () => {
    mockHighlight.mockReturnValue(
      highlightResult(highlightText('const', ['keyword']))
    );
    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'const x = 1;' }],
          language: 'javascript',
          type: 'codeBlock',
        },
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      selection: null,
    });
    const [source] = getPlateDecorationSources(editor);
    const read = () =>
      source.read({ editor, entry: editor.read.nodes.get([0, 0])! });
    read();
    editor.update.nodes.remove({ at: [0] });
    editor.update.history.undo();
    read();
    expect(mockHighlight).toHaveBeenCalledTimes(2);
    const highlight = mock(() =>
      highlightResult(highlightText('const', ['replacement']))
    );

    editor
      .plugin(BaseCodeHighlightPlugin)
      .store.set({ lowlight: { ...mockLowlight, highlight } });
    expect(read()[0].attributes.className).toBe('replacement');
    expect(highlight).toHaveBeenCalledTimes(1);
  });

  it('returns empty decorations for plaintext language', () => {
    // Create a code block with plaintext
    const codeBlock: CodeBlockElement = {
      children: [{ text: 'const x = 1;' }],
      language: 'plaintext',
      type: 'codeBlock',
    };

    const blockPath = [0];
    const result = getDecorations(editor, [codeBlock, blockPath]);

    expect(result).toEqual([]);

    // Lowlight highlight should not be called
    expect(mockHighlight).not.toHaveBeenCalled();
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('returns decorations for specified language', () => {
    // Mock highlight result
    mockHighlight.mockReturnValue(
      highlightResult(
        highlightText('const', ['token', 'keyword']),
        highlightText(' x = '),
        highlightText('1', ['token', 'number']),
        highlightText(';')
      )
    );

    // Create a code block with JavaScript
    const codeBlock: CodeBlockElement = {
      children: [{ text: 'const x = 1;' }],
      language: 'javascript',
      type: 'codeBlock',
    };

    const blockPath = [0];
    const result = getDecorations(editor, [codeBlock, blockPath]);

    expect(result).toHaveLength(2);

    // Check first decoration (const)
    expect(result[0]).toMatchObject({
      attributes: { className: 'token keyword' },
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
    });

    // Check second decoration (number)
    expect(result[1]).toMatchObject({
      attributes: { className: 'token number' },
      range: {
        anchor: { offset: 10, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
    });

    // Lowlight highlight should be called with correct params
    expect(mockHighlight).toHaveBeenCalledWith('javascript', 'const x = 1;');
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('patches python grammar before highlighting', () => {
    mockHighlight.mockReturnValue(
      highlightResult(
        highlightText('# Python class with type hints', ['hljs-comment'])
      )
    );

    const codeBlock: CodeBlockElement = {
      children: [{ text: '# Python class with type hints' }],
      language: 'python',
      type: 'codeBlock',
    };

    const result = getDecorations(editor, [codeBlock, [0]]);

    expect(result[0]).toMatchObject({
      attributes: { className: 'hljs-comment', 'data-code-block-syntax': '' },
    });
    expect(mockRegister).toHaveBeenCalledWith('python', expect.any(Function));
    expect(mockRegisterAlias).toHaveBeenCalledWith('python', [
      'py',
      'gyp',
      'ipython',
    ]);
    expect(mockHighlight).toHaveBeenCalledWith(
      'python',
      '# Python class with type hints'
    );
  });

  it('use auto detection when language is "auto"', () => {
    // Mock highlight auto result
    mockHighlightAuto.mockReturnValue(
      highlightResult(highlightText('const x = 1;'))
    );

    // Create a code block with auto language
    const codeBlock: CodeBlockElement = {
      children: [{ text: 'const x = 1;' }],
      language: 'auto',
      type: 'codeBlock',
    };

    const blockPath = [0];
    getDecorations(editor, [codeBlock, blockPath]);

    // Lowlight highlightAuto should be called with correct params
    expect(mockHighlightAuto).toHaveBeenCalledWith('const x = 1;');
    expect(mockHighlight).not.toHaveBeenCalled();
  });

  it('use default language when no language is specified', () => {
    // Mock highlight result
    mockHighlight.mockReturnValue(
      highlightResult(highlightText('const x = 1;'))
    );

    // Create a code block with no language
    const codeBlock: CodeBlockElement = {
      children: [{ text: 'const x = 1;' }],
      type: 'codeBlock',
    };

    const blockPath = [0];
    getDecorations(editor, [codeBlock, blockPath]);

    // Lowlight highlight should be called with default language
    expect(mockHighlight).toHaveBeenCalledWith('javascript', 'const x = 1;');
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('handle multiline code blocks', () => {
    // Mock highlight result for multiline code
    mockHighlight.mockReturnValue(
      highlightResult(
        highlightText('function', ['token', 'keyword']),
        highlightText(' test() {\n  '),
        highlightText('return', ['token', 'keyword']),
        highlightText(' true;\n}')
      )
    );

    // Create a multiline code block
    const codeBlock: CodeBlockElement = {
      children: [{ text: 'function test() {\n  return true;\n}' }],
      language: 'javascript',
      type: 'codeBlock',
    };

    const blockPath = [0];
    const result = getDecorations(editor, [codeBlock, blockPath]);

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      attributes: { className: 'token keyword' },
      range: {
        anchor: { offset: 20, path: [0, 0] },
        focus: { offset: 26, path: [0, 0] },
      },
    });
  });

  it('warns and falls back to plaintext when a registered language fails to highlight', () => {
    const error = new Error('boom');
    mockHighlight.mockImplementation(() => {
      throw error;
    });

    const codeBlock: CodeBlockElement = {
      children: [{ text: 'const x = 1;' }],
      language: 'javascript',
      type: 'codeBlock',
    };

    const result = getDecorations(editor, [codeBlock, [0]]);

    expect(result).toEqual([]);
    expect(editor.plugin(DebugPlugin).api.error).not.toHaveBeenCalled();
    expect(editor.plugin(DebugPlugin).api.warn).toHaveBeenCalledWith(
      'Could not highlight with Highlight.js for language "javascript". Falling back to plaintext',
      'CODE_HIGHLIGHT',
      error
    );
  });

  it('warns and falls back to plaintext for unregistered languages', () => {
    const error = new Error('missing');
    mockListLanguages.mockReturnValue(['javascript']);
    mockHighlight.mockImplementation(() => {
      throw error;
    });

    const codeBlock: CodeBlockElement = {
      children: [{ text: 'SELECT 1' }],
      language: 'sql',
      type: 'codeBlock',
    };

    const result = getDecorations(editor, [codeBlock, [0]]);

    expect(result).toEqual([]);
    expect(editor.plugin(DebugPlugin).api.error).not.toHaveBeenCalled();
    expect(editor.plugin(DebugPlugin).api.warn).toHaveBeenCalledWith(
      'Language "sql" is not registered. Falling back to plaintext'
    );
  });
});
