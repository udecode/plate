import { KEYS, createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from './BaseCodeBlockPlugin';
import * as decorationsModule from './setCodeBlockToDecorations';

describe('BaseCodeBlockPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('injects the html query guard and binds the toggle transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseCodeBlockPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseCodeBlockPlugin);
    const query = plugin.inject.plugins?.[KEYS.html]?.parser?.query!;
    const toggleBlockSpy = spyOn(editor.tf, 'toggleBlock');

    spyOn(editor.api, 'some')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(query({ editor } as any)).toBe(false);
    expect(query({ editor } as any)).toBe(true);

    (editor.getTransforms(BaseCodeBlockPlugin) as any).code_block.toggle();

    expect(toggleBlockSpy).toHaveBeenCalledWith(editor.getType(KEYS.codeBlock));
  });

  it('initializes code-block decorations and returns cached code-line ranges', () => {
    const setDecorationsSpy = spyOn(
      decorationsModule,
      'setCodeBlockToDecorations'
    ).mockImplementation(() => {});
    const editor = createSlateEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          options: { lowlight: {} as any },
        }),
        BaseCodeLinePlugin,
      ],
    } as any);
    const plugin = editor.getPlugin(BaseCodeBlockPlugin) as any;
    const codeLine = {
      children: [{ text: 'x' }],
      type: editor.getType(KEYS.codeLine),
    } as any;
    const codeBlock = {
      children: [codeLine],
      type: editor.getType(KEYS.codeBlock),
    } as any;
    const ranges = [
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
    ] as any;

    expect(
      plugin.decorate({
        editor,
        entry: [codeBlock, [0]],
        getOptions: () => ({ lowlight: {} }),
        type: editor.getType(KEYS.codeBlock),
      })
    ).toEqual([]);
    expect(setDecorationsSpy).toHaveBeenCalledWith(editor, [codeBlock, [0]]);

    decorationsModule.CODE_LINE_TO_DECORATIONS.set(codeLine, ranges);

    expect(
      plugin.decorate({
        editor,
        entry: [codeLine, [0, 0]],
        getOptions: () => ({ lowlight: {} }),
        type: editor.getType(KEYS.codeBlock),
      })
    ).toEqual(ranges);
    expect(
      plugin.decorate({
        editor,
        entry: [{ children: [], type: 'p' }, [1]],
        getOptions: () => ({ lowlight: null }),
        type: editor.getType(KEYS.codeBlock),
      })
    ).toEqual([]);
  });
});
