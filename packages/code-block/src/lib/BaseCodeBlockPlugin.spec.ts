import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import { pipeDecorate } from '@platejs/core/static/internal';
import {
  type DecoratedRange,
  type Element,
  type NodeEntry,
  SelectionApi,
} from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import { KEYS, NODES } from '@platejs/utils';
import { createLowlight } from 'lowlight';

import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from './BaseCodeBlockPlugin';
import * as decorationsModule from './setCodeBlockToDecorations';

describe('BaseCodeBlockPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

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
          children: [{ children: [{ text: '' }], type: 'code_line' }],
          type: 'code_block',
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
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });
    const html = new Map([['text/html', '<p>pasted</p>']]);

    expect(BaseCodeBlockPlugin.key).toBe('codeBlock');
    expect(BaseCodeBlockPlugin.type).toBe(NODES.codeBlock);
    expect(BaseCodeLinePlugin.key).toBe('codeLine');
    expect(BaseCodeLinePlugin.type).toBe(NODES.codeLine);
    expect(BaseCodeHighlightPlugin.key).toBe('codeSyntax');
    expect(BaseCodeHighlightPlugin.type).toBe(NODES.codeSyntax);
    expect(BaseCodeBlockPlugin.dependencies).toEqual([BaseCodeLinePlugin]);
    expect(BaseCodeHighlightPlugin.dependencies).toEqual([BaseCodeBlockPlugin]);
    expect(
      editorWithCodeLine.read.schema.createAndFill(BaseCodeBlockPlugin)
    ).toEqual({
      children: [{ children: [{ text: '' }], type: NODES.codeLine }],
      type: NODES.codeBlock,
    });
    expect(
      editorWithCodeLine.read.schema.getElementSlicePolicy({
        children: [{ children: [{ text: '' }], type: NODES.codeLine }],
        type: NODES.codeBlock,
      })
    ).toEqual({ preserveContext: true, replaceWhenCovered: false });
    expect(
      createBaseEditor({
        plugins: [BaseCodeHighlightPlugin],
      }).read.schema.property(BaseCodeHighlightPlugin)
    ).toMatchObject({ value: { kind: 'boolean' } });
    expect(
      editorWithCodeLine.read.schema.element(BaseCodeBlockPlugin)?.groups
    ).toContain('block');
    expect(
      editorWithCodeLine.read.schema.element(BaseCodeLinePlugin)?.groups
    ).toContain('block');
    expect(() =>
      editorWithCodeLine.read.schema.validateDocument({
        children: [
          {
            children: [{ text: '' }],
            type: NODES.codeLine,
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);

    expect(
      editorWithCodeLine.api.clipboard.insertData(createDataTransfer(html))
    ).toBe(false);
    expect(
      editorWithoutCodeLine.api.clipboard.insertData(createDataTransfer(html))
    ).toBe(true);

    expect(editorWithCodeLine.update.codeBlock.toggle).toEqual(
      expect.any(Function)
    );

    editorWithoutCodeLine.plugin(BaseCodeBlockPlugin).update.insert();

    expect(editorWithoutCodeLine.read.children().at(-1)).toEqual({
      children: [{ children: [{ text: '' }], type: 'code_line' }],
      type: 'code_block',
    });
  });

  it('decodes and encodes code lines through the compiled HTML codec', () => {
    const point = { offset: 0, path: [0, 0, 0] };
    const editor = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [
            { children: [{ text: 'const a = 1;' }], type: NODES.codeLine },
            { children: [{ text: '' }], type: NODES.codeLine },
            { children: [{ text: 'const b = 2;' }], type: NODES.codeLine },
            { children: [{ text: '' }], type: NODES.codeLine },
          ],
          lang: 'typescript',
          type: NODES.codeBlock,
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
          { children: [{ text: 'const a = 1;' }], type: NODES.codeLine },
          { children: [{ text: '' }], type: NODES.codeLine },
          { children: [{ text: 'const b = 2;' }], type: NODES.codeLine },
        ],
        type: NODES.codeBlock,
      },
    ]);

    editor.api.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;
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

  it('initializes code-block decorations and returns cached code-line ranges', () => {
    const setDecorationsSpy = spyOn(
      decorationsModule,
      'setCodeBlockToDecorations'
    ).mockImplementation(() => {});
    const lowlight = createLowlight();
    const editor = createBaseEditor({
      plugins: [
        BaseCodeHighlightPlugin.configure({
          options: { lowlight },
        }),
      ],
    });
    const decorate = pipeDecorate(editor);

    if (!decorate) throw new Error('Expected code block decorate callback');
    const codeLine = {
      children: [{ text: 'x' }],
      type: editor.getType(KEYS.codeLine),
    };
    const codeBlock = {
      children: [codeLine],
      type: editor.getType(KEYS.codeBlock),
    };
    const ranges = [
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
    ] satisfies DecoratedRange[];

    expect(decorate([codeBlock, [0]])).toEqual([]);
    expect(setDecorationsSpy).toHaveBeenCalledWith(editor, [codeBlock, [0]]);

    decorationsModule.CODE_LINE_TO_DECORATIONS.set(codeLine, ranges);

    expect(decorate([codeLine, [0, 0]])).toEqual(ranges);
    expect(decorate([{ children: [], type: 'p' }, [1]])).toEqual([]);
  });

  it('keeps syntax highlighting absent when only code blocks are installed', () => {
    const setDecorationsSpy = spyOn(
      decorationsModule,
      'setCodeBlockToDecorations'
    ).mockImplementation(() => {});
    const editor = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
    });
    const entry: NodeEntry<Element> = [
      {
        children: [{ children: [{ text: 'x' }], type: NODES.codeLine }],
        type: NODES.codeBlock,
      },
      [0],
    ];

    pipeDecorate(editor)?.(entry);

    expect(() => editor.getPlugin(BaseCodeHighlightPlugin)).toThrow(
      /not installed/i
    );
    expect(setDecorationsSpy).not.toHaveBeenCalled();
  });

  it.each([
    {
      expectedDecorations: false,
      highlight: BaseCodeHighlightPlugin,
      name: 'null lowlight',
      priority: 100,
    },
    {
      expectedDecorations: true,
      highlight: BaseCodeHighlightPlugin.configure({
        options: { lowlight: createLowlight() },
      }),
      name: 'configured lowlight',
      priority: 100,
    },
    {
      expectedDecorations: true,
      highlight: BaseCodeHighlightPlugin.extend({
        priority: 200,
      }).configure({
        options: { lowlight: createLowlight() },
      }),
      name: 'same-key replacement',
      priority: 200,
    },
  ])('handles $name', ({ expectedDecorations, highlight, priority }) => {
    const setDecorationsSpy = spyOn(
      decorationsModule,
      'setCodeBlockToDecorations'
    ).mockImplementation(() => {});
    const editor = createBaseEditor({
      plugins: [BaseCodeBlockPlugin, highlight],
    });
    const decorate = pipeDecorate(editor);

    if (!decorate) throw new Error('Expected highlighting decorate callback');

    expect(editor.getPlugin(BaseCodeHighlightPlugin).priority).toBe(priority);

    decorate([
      {
        children: [{ children: [{ text: 'x' }], type: NODES.codeLine }],
        type: NODES.codeBlock,
      },
      [0],
    ]);

    expect(setDecorationsSpy).toHaveBeenCalledTimes(
      expectedDecorations ? 1 : 0
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

  it('refreshes cached decorations when the language changes without React', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeHighlightPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      initialValue: [
        {
          children: [
            { children: [{ text: 'const value = 1;' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });
    const codeLineEntry = editor.read.nodes.get<Element>([0, 0]);
    assert(codeLineEntry);
    const [codeLine] = codeLineEntry;

    decorationsModule.CODE_LINE_TO_DECORATIONS.set(codeLine, [
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
    ]);

    editor.update.nodes.set({ lang: 'typescript' }, { at: [0] });

    expect(decorationsModule.CODE_LINE_TO_DECORATIONS.get(codeLine)).toEqual(
      []
    );
    expect(editor.read.nodes.get([0])?.[0]).toMatchObject({
      lang: 'typescript',
    });
  });
});
