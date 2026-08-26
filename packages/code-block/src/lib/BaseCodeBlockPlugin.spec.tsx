/** @jsx jsxt */

import assert from 'node:assert/strict';

import {
  type BaseEditorOptions,
  type BasePluginInput,
  createBaseEditor as createTypedBaseEditor,
  BaseParagraphPlugin,
  defineBasePlugin,
  DebugPlugin,
} from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import { pipeDecorate } from '@platejs/core/static/internal';
import {
  type Element,
  createEditor as createPliteEditor,
  type InitialValue,
  type NodeEntry,
  SelectionApi,
  ContentSlice,
  type Descendant,
  type TextInsertFragmentOptions,
  ElementApi,
  type Value,
} from '@platejs/plite';
import {
  createDataTransfer,
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';
import { createLowlight } from 'lowlight';

import {
  type CodeBlockElement,
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from './BaseCodeBlockPlugin';
import { CodeBlockRules } from './CodeBlockRules';

const createBaseEditorForFixture = <const P extends readonly BasePluginInput[]>(
  options: Omit<BaseEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createTypedBaseEditor({
    ...options,
    editor: createPliteEditor<Value>(),
  });

const createBaseEditor = createBaseEditorForFixture;

describe('BaseCodeBlockPlugin', () => {
  it('injects the html query guard and binds the code block tx group', () => {
    const editorWithCodeLine = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: '' }], type: 'codeLine' }],
          type: 'codeBlock',
        },
      ],
    });
    const editorWithoutCodeLine = createBaseEditor({
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
    expect(BaseCodeLinePlugin.name).toBe('codeLine');
    expect(BaseCodeLinePlugin.name).toBe(PLUGINS.codeLine);
    expect(BaseCodeHighlightPlugin.name).toBe('codeSyntax');
    expect(BaseCodeHighlightPlugin.name).toBe(PLUGINS.codeSyntax);
    expect(BaseCodeBlockPlugin.dependencies).toEqual([BaseCodeLinePlugin]);
    expect(BaseCodeHighlightPlugin.dependencies).toEqual([BaseCodeBlockPlugin]);
    expect(editorWithCodeLine.read.schema.create(BaseCodeBlockPlugin)).toEqual({
      children: [{ children: [{ text: '' }], type: 'codeLine' }],
      type: 'codeBlock',
    });
    expect(
      editorWithCodeLine.read.schema.getElementSlicePolicy({
        children: [{ children: [{ text: '' }], type: 'codeLine' }],
        type: 'codeBlock',
      })
    ).toEqual({ preserveContext: true, replaceWhenCovered: false });
    const highlightEditor = createBaseEditor({
      plugins: [BaseCodeHighlightPlugin],
    });

    expect(
      highlightEditor.read.schema.property({
        key: highlightEditor.plugin(BaseCodeHighlightPlugin).schema.key,
        placement: 'text',
      })
    ).toMatchObject({ value: { kind: 'boolean' } });
    expect(
      editorWithCodeLine.read.schema.element(BaseCodeBlockPlugin)?.groups
    ).toContain('block');
    expect(
      editorWithCodeLine.read.schema.element(BaseCodeLinePlugin)?.groups
    ).toContain('block');
    expect(() =>
      editorWithCodeLine.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            type: 'codeLine',
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);

    expect(
      editorWithCodeLine.api.dom.clipboard.insertData(createDataTransfer(html))
    ).toBe(false);
    expect(
      editorWithoutCodeLine.api.dom.clipboard.insertData(
        createDataTransfer(html)
      )
    ).toBe(true);

    expect(editorWithCodeLine.update.codeBlock.toggle).toEqual(
      expect.any(Function)
    );

    editorWithoutCodeLine.plugin(BaseCodeBlockPlugin).update.insert();

    expect(editorWithoutCodeLine.read.children().at(-1)).toEqual({
      children: [{ children: [{ text: '' }], type: 'codeLine' }],
      type: 'codeBlock',
    });
  });

  it('decodes and encodes code lines through the compiled HTML codec', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [
            { children: [{ text: 'const a = 1;' }], type: 'codeLine' },
            { children: [{ text: '' }], type: 'codeLine' },
            { children: [{ text: 'const b = 2;' }], type: 'codeLine' },
            { children: [{ text: '' }], type: 'codeLine' },
          ],
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
        children: [
          { children: [{ text: 'const a = 1;' }], type: 'codeLine' },
          { children: [{ text: '' }], type: 'codeLine' },
          { children: [{ text: 'const b = 2;' }], type: 'codeLine' },
        ],
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

    expect(
      Array.from(pre.querySelectorAll('code > span[data-code-line]')).map(
        (line) => line.textContent
      )
    ).toEqual(['const a = 1;', '', 'const b = 2;', '']);
    expect(
      Array.from(pre.querySelectorAll('code > span[data-code-line]')).map(
        (line) => ({
          display: (line as HTMLElement).style.display,
          minHeight: (line as HTMLElement).style.minHeight,
        })
      )
    ).toEqual([
      { display: 'block', minHeight: '1em' },
      { display: 'block', minHeight: '1em' },
      { display: 'block', minHeight: '1em' },
      { display: 'block', minHeight: '1em' },
    ]);
    expect(editor.api.html.deserialize({ element: pre })).toEqual([
      ...editor.read.children(),
    ]);
  });

  it('keeps syntax highlighting absent when only code blocks are installed', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
    });
    const entry: NodeEntry<Element> = [
      {
        children: [{ children: [{ text: 'x' }], type: 'codeLine' }],
        type: 'codeBlock',
      },
      [0],
    ];

    pipeDecorate(editor)?.(entry);

    expect(() => editor.plugin(BaseCodeHighlightPlugin).name).toThrow(
      /not installed/i
    );
  });

  it('rejects a disabled required code-line dependency', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          BaseCodeBlockPlugin,
          BaseCodeLinePlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(/codeBlock.*disabled.*codeLine|codeLine.*disabled.*codeBlock/i);
  });
});

{
  const createFormatterEditor = (code: string, language: string) =>
    createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      initialValue: [
        {
          children: [{ children: [{ text: code }], type: 'codeLine' }],
          language,
          type: 'codeBlock',
        },
      ],
    });

  const getCodeBlock = (editor: ReturnType<typeof createFormatterEditor>) => {
    const entry = editor
      .plugin(BaseCodeBlockPlugin)
      .read.entry({ at: [0, 0, 0] });
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
        { children: [{ text: '{' }], type: 'codeLine' },
        { children: [{ text: '  "name": "plate",' }], type: 'codeLine' },
        { children: [{ text: '  "type": "editor"' }], type: 'codeLine' },
        { children: [{ text: '}' }], type: 'codeLine' },
      ]);
    });

    it('formats json into separate code lines', () => {
      const editor = createBaseEditor({
        plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
        initialValue: [
          {
            children: [
              {
                children: [{ text: '{"name":"plate","type":"editor"}' }],
                type: 'codeLine',
              },
            ],
            language: 'json',
            type: 'codeBlock',
          },
        ],
      });
      const element = getCodeBlock(editor);
      editor.update.codeBlock.format({ element });

      expect(getCodeBlock(editor).children).toEqual([
        { children: [{ text: '{' }], type: 'codeLine' },
        { children: [{ text: '  "name": "plate",' }], type: 'codeLine' },
        { children: [{ text: '  "type": "editor"' }], type: 'codeLine' },
        { children: [{ text: '}' }], type: 'codeLine' },
      ]);
    });
  });
}

jsxt;

describe('isCodeBlockEmpty', () => {
  const run = (input: TestEditor) =>
    createBaseEditor({
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
            <hcodeline>
              <htext />
            </hcodeline>
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
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
            <hcodeline>
              <htext />
            </hcodeline>
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
            <hcodeline>
              test
              <cursor />
            </hcodeline>
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
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
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

  const createEditor = ({ input }: { input: TestEditor }) =>
    createBaseEditor({
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
              <hcodeline>
                {'    '}before
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>{'    '}before</hcodeline>
              <hcodeline>
                {'    '}
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createEditor({ input });

        editor.update.break.insert();

        expect(editor.read.children()).toEqual(output.children);
      });

      it('replaces an expanded selection with a code-local line split', () => {
        const input = (
          <editor>
            <hcodeblock>
              <hcodeline>
                ab
                <anchor />
                cd
                <focus />
                ef
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>ab</hcodeline>
              <hcodeline>
                <cursor />
                ef
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createEditor({ input });

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
              <hcodeline>
                {'  '}
                <cursor />
                {'  '}before
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>{'  '}</hcodeline>
              <hcodeline>
                {'  '}
                <cursor />
                {'  '}before
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const editor = createEditor({ input });

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
            <hcodeline>
              <cursor />
              aa
            </hcodeline>
            <hcodeline>bb</hcodeline>
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

      const editor = createEditor({ input });

      editor.update.codeBlock.resetBlock();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('deleteBackward', () => {
    it('keeps deleteBackward local at the start of a non-empty first code line', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <cursor />
              aa
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

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
            <hcodeline>aa</hcodeline>
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              aa
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

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
            <hcodeline>
              <cursor />
            </hcodeline>
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

      const editor = createEditor({ input });

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
            <hcodeline>
              be
              <anchor />
              fo
              <focus />
              re
            </hcodeline>
            <hcodeline>after</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

      editor.update.codeBlock.selectAll();

      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      });
    });

    it('falls through after the whole code block is selected', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <anchor />
              before
            </hcodeline>
            <hcodeline>
              after
              <focus />
            </hcodeline>
          </hcodeblock>
          <hp>outside</hp>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

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
            <hcodeline>
              <anchor />
              aa
            </hcodeline>
            <hcodeline>
              bb
              <focus />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'  '}
              aa
            </hcodeline>
            <hcodeline>
              {'  '}
              bb
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

      expect(editor.update.codeBlock.tab({ reverse: false })).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
    });

    it('outdents every selected code line when reversed', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <anchor />
              {'  '}aa
            </hcodeline>
            <hcodeline>
              {'  '}bb
              <focus />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>aa</hcodeline>
            <hcodeline>bb</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

      expect(editor.update.codeBlock.tab({ reverse: true })).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
    });

    it('inserts spaces at a collapsed cursor after code text', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              aa
              <cursor />
              bb
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              aa{'  '}
              <cursor />
              bb
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

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
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createEditor({ input });

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
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createEditor({ input });

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
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;
      const editor = createEditor({ input });

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
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>line 5</hp>
        </editor>
      ) as TestEditor;
      const editor = createEditor({ input });

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

    const editor = createBaseEditor({
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
          <hcodeblock>
            <hcodeline>code</hcodeline>
          </hcodeblock>
        </editor>
      ).children
    );
  });

  it('replaces the fence paragraph instead of leaving the first two backticks behind', () => {
    const editor = createBaseEditor({
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
        children: [
          {
            children: [{ text: '' }],
            type: 'codeLine',
          },
        ],
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

    const editor = createBaseEditor({
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
        children: [
          {
            children: [{ text: '' }],
            type: 'codeLine',
          },
        ],
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

  const createEditor = (input: TestEditor) =>
    createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

  const createEditorWithParser = (input: TestEditor) =>
    createBaseEditor({
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
            <hcodeline>const a = "b";</hcodeline>
            <hcodeline>
              const c = "d";
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor(input);
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => (commits += 1) - 1);

      editor.api.dom.clipboard.insertData(data);
      unsubscribe();

      expect(editor.read.children()).toEqual(expected.children);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(expected.selection!)
      );
      expect(commits).toBe(1);
      expect(editor.read.history.undos()).toHaveLength(1);
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

      editor.api.dom.clipboard.insertData(data);

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
            <hcodeline>{'// this is a comment'}</hcodeline>
            <hcodeline>
              console.log("hello world");
              <cursor />
            </hcodeline>
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
      const editor = createBaseEditor({
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
    const editor = createBaseEditor({
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
              <hcodeblock>
                <hcodeline>helloworld</hcodeline>
                <hcodeline>!</hcodeline>
              </hcodeblock>
            </editor>
          ).children
        );
        expect(editor.read.selection()).toEqual({
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

const getCodeLine = (codeBlock: CodeBlockElement, index = 0) => {
  const codeLine = codeBlock.children[index];

  if (!ElementApi.isElement(codeLine)) {
    throw new Error(`Expected code line at index ${index}`);
  }

  return codeLine;
};

const createHighlightEditor = () =>
  createBaseEditor({
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
  [codeBlock, path]: NodeEntry<CodeBlockElement>
) => {
  const decorate = pipeDecorate(innerEditor);

  decorate?.([codeBlock, path]);

  return new Map(
    codeBlock.children.flatMap((line, index) =>
      ElementApi.isElement(line)
        ? [[line, decorate?.([line, path.concat(index)]) ?? []] as const]
        : []
    )
  );
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
  it('returns empty decorations for plaintext language', () => {
    // Create a code block with plaintext
    const codeBlock: CodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'codeLine' }],
      language: 'plaintext',
      type: 'codeBlock',
    };

    const blockPath = [0];
    const result = getDecorations(editor, [codeBlock, blockPath]);

    // Should have one entry for the code line
    expect(result.size).toBe(1);

    // The decorations for the line should be empty
    const lineDecorations = result.get(getCodeLine(codeBlock));
    expect(lineDecorations).toEqual([]);

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
      children: [{ children: [{ text: 'const x = 1;' }], type: 'codeLine' }],
      language: 'javascript',
      type: 'codeBlock',
    };

    const blockPath = [0];
    const result = getDecorations(editor, [codeBlock, blockPath]);

    // Should have one entry for the code line
    expect(result.size).toBe(1);

    // Get decorations for the line
    const lineDecorations = result.get(getCodeLine(codeBlock));
    expect(lineDecorations).toHaveLength(4);

    // Check first decoration (const)
    expect(lineDecorations?.[0]).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0] },
      className: 'token keyword',
      focus: { offset: 5, path: [0, 0, 0] },
    });

    // Check second decoration (space)
    expect(lineDecorations?.[1]).toMatchObject({
      anchor: { offset: 5, path: [0, 0, 0] },
      className: '',
      focus: { offset: 10, path: [0, 0, 0] },
    });

    // Check third decoration (number)
    expect(lineDecorations?.[2]).toMatchObject({
      anchor: { offset: 10, path: [0, 0, 0] },
      className: 'token number',
      focus: { offset: 11, path: [0, 0, 0] },
    });

    // Check fourth decoration (semicolon)
    expect(lineDecorations?.[3]).toMatchObject({
      anchor: { offset: 11, path: [0, 0, 0] },
      className: '',
      focus: { offset: 12, path: [0, 0, 0] },
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
      children: [
        {
          children: [{ text: '# Python class with type hints' }],
          type: 'codeLine',
        },
      ],
      language: 'python',
      type: 'codeBlock',
    };

    const result = getDecorations(editor, [codeBlock, [0]]);

    expect(result.get(getCodeLine(codeBlock))?.[0]).toMatchObject({
      className: 'hljs-comment',
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
      children: [{ children: [{ text: 'const x = 1;' }], type: 'codeLine' }],
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
      children: [{ children: [{ text: 'const x = 1;' }], type: 'codeLine' }],
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
      children: [
        { children: [{ text: 'function test() {' }], type: 'codeLine' },
        { children: [{ text: '  return true;' }], type: 'codeLine' },
        { children: [{ text: '}' }], type: 'codeLine' },
      ],
      language: 'javascript',
      type: 'codeBlock',
    };

    const blockPath = [0];
    const result = getDecorations(editor, [codeBlock, blockPath]);

    // Should have three entries for the code lines
    expect(result.size).toBe(3);

    // First line should have 2 decorations
    const line1Decorations = result.get(getCodeLine(codeBlock));
    expect(line1Decorations).toHaveLength(2);

    // Second line should have 3 decorations (spaces, return keyword, and rest of line)
    const line2Decorations = result.get(getCodeLine(codeBlock, 1));
    expect(line2Decorations).toHaveLength(3);
    expect(line2Decorations?.[0]).toMatchObject({
      anchor: { offset: 0, path: [0, 1, 0] },
      className: '',
      focus: { offset: 2, path: [0, 1, 0] },
    });
    expect(line2Decorations?.[1]).toMatchObject({
      anchor: { offset: 2, path: [0, 1, 0] },
      className: 'token keyword',
      focus: { offset: 8, path: [0, 1, 0] },
    });
    expect(line2Decorations?.[2]).toMatchObject({
      anchor: { offset: 8, path: [0, 1, 0] },
      className: '',
      focus: { offset: 14, path: [0, 1, 0] },
    });

    // Third line should have 1 decoration
    const line3Decorations = result.get(getCodeLine(codeBlock, 2));
    expect(line3Decorations).toHaveLength(1);
  });

  it('warns and falls back to plaintext when a registered language fails to highlight', () => {
    const error = new Error('boom');
    mockHighlight.mockImplementation(() => {
      throw error;
    });

    const codeBlock: CodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'codeLine' }],
      language: 'javascript',
      type: 'codeBlock',
    };

    const result = getDecorations(editor, [codeBlock, [0]]);

    expect(result.get(getCodeLine(codeBlock))).toEqual([]);
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
      children: [{ children: [{ text: 'SELECT 1' }], type: 'codeLine' }],
      language: 'sql',
      type: 'codeBlock',
    };

    const result = getDecorations(editor, [codeBlock, [0]]);

    expect(result.get(getCodeLine(codeBlock))).toEqual([]);
    expect(editor.plugin(DebugPlugin).api.error).not.toHaveBeenCalled();
    expect(editor.plugin(DebugPlugin).api.warn).toHaveBeenCalledWith(
      'Language "sql" is not registered. Falling back to plaintext'
    );
  });
});
