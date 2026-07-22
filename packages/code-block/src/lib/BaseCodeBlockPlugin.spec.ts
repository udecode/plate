import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import { pipeDecorate } from '@platejs/core/static/internal';
import type { DecoratedRange, Element } from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import { KEYS, NODES } from '@platejs/utils';
import { createLowlight } from 'lowlight';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
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
    expect(BaseCodeSyntaxPlugin.key).toBe('codeSyntax');
    expect(BaseCodeSyntaxPlugin.type).toBe(NODES.codeSyntax);
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
      editorWithCodeLine.read.schema.property(BaseCodeSyntaxPlugin)
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

  it('initializes code-block decorations and returns cached code-line ranges', () => {
    const setDecorationsSpy = spyOn(
      decorationsModule,
      'setCodeBlockToDecorations'
    ).mockImplementation(() => {});
    const lowlight = createLowlight();
    const editor = createBaseEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          options: { lowlight },
        }),
        BaseCodeLinePlugin,
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

  it('refreshes cached decorations when the language changes without React', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
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
