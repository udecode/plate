import { createBaseEditor } from '@platejs/core';
import type { DecoratedRange, Element } from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';
import { createLowlight } from 'lowlight';

import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from './BaseCodeBlockPlugin';
import * as decorationsModule from './setCodeBlockToDecorations';

describe('BaseCodeBlockPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('injects the html query guard and binds the code block tx group', () => {
    const editorWithCodeLine = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: '' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });
    const plugin = editorWithCodeLine.getPlugin(BaseCodeBlockPlugin);
    const query = plugin.inject.plugins?.[KEYS.html]?.parser?.query!;
    const editorWithoutCodeLine = createBaseEditor({
      plugins: [BaseCodeBlockPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const parserOptions = {
      data: '',
      dataTransfer: createDataTransfer(new Map()),
      mimeType: 'text/html',
    };

    expect(
      query({
        ...editorWithCodeLine.plugin(BaseCodeBlockPlugin),
        ...parserOptions,
      })
    ).toBe(false);
    expect(
      query({
        ...editorWithoutCodeLine.plugin(BaseCodeBlockPlugin),
        ...parserOptions,
      })
    ).toBe(true);

    expect(editorWithCodeLine.update.code_block.toggle).toEqual(
      expect.any(Function)
    );
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
    const plugin = editor.getPlugin(BaseCodeBlockPlugin);
    const context = editor.plugin(BaseCodeBlockPlugin);
    const decorate = plugin.decorate;

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

    expect(
      decorate({
        ...context,
        entry: [codeBlock, [0]],
      })
    ).toEqual([]);
    expect(setDecorationsSpy).toHaveBeenCalledWith(editor, [codeBlock, [0]]);

    decorationsModule.CODE_LINE_TO_DECORATIONS.set(codeLine, ranges);

    expect(
      decorate({
        ...context,
        entry: [codeLine, [0, 0]],
      })
    ).toEqual(ranges);
    expect(
      decorate({
        ...context,
        entry: [{ children: [], type: 'p' }, [1]],
      })
    ).toEqual([]);
  });

  it('clears cached decorations when the language changes without React', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          options: { lowlight: createLowlight() },
        }),
      ],
      value: [
        {
          children: [
            { children: [{ text: 'const value = 1;' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });
    const codeLine = editor.read.nodes.get<Element>([0, 0], {
      required: true,
    })[0];

    decorationsModule.CODE_LINE_TO_DECORATIONS.set(codeLine, []);

    editor.update.nodes.set({ lang: 'typescript' }, { at: [0] });

    expect(
      decorationsModule.CODE_LINE_TO_DECORATIONS.get(codeLine)
    ).toBeUndefined();
    expect(editor.read.nodes.get([0])?.[0]).toMatchObject({
      lang: 'typescript',
    });
  });
});
