import { BaseParagraphPlugin, KEYS, createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from './BaseCodeBlockPlugin';
import * as decorationsModule from './setCodeBlockToDecorations';

const runCodeBlockToggleTx = (isActive: boolean) => {
  const editor = createSlateEditor({
    plugins: [BaseCodeBlockPlugin],
  } as any);
  const set = mock(() => {});
  const some = mock(() => isActive);
  const toArray = mock(() =>
    isActive
      ? [
          [
            {
              children: [
                { children: [{ text: 'line 1' }], type: KEYS.codeLine },
                { children: [{ text: 'line 2' }], type: KEYS.codeLine },
              ],
              type: KEYS.codeBlock,
            },
            [0],
          ],
        ]
      : []
  );
  const unwrap = mock(() => {});
  const wrap = mock(() => {});
  const [extension] = BaseCodeBlockPlugin.__txExtensions;
  const txGroups = extension({
    editor,
    plugin: BaseCodeBlockPlugin,
    type: editor.getType(KEYS.codeBlock),
  } as any);
  const commands = (txGroups.code_block as any)(
    {
      nodes: { set, some, toArray, unwrap, wrap },
    },
    editor
  ) as { toggle: () => void };

  commands.toggle();

  return { set, some, toArray, unwrap, wrap };
};

describe('BaseCodeBlockPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('injects the html query guard', () => {
    const editor = createSlateEditor({
      plugins: [BaseCodeBlockPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseCodeBlockPlugin);
    const query = plugin.inject.plugins?.[KEYS.html]?.parser?.query!;

    spyOn(editor.api, 'some')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(query({ editor } as any)).toBe(false);
    expect(query({ editor } as any)).toBe(true);
  });

  it('registers code block as a transaction wrapper toggle', () => {
    const inactive = runCodeBlockToggleTx(false);
    const active = runCodeBlockToggleTx(true);

    expect(inactive.set).toHaveBeenCalledWith({
      type: KEYS.codeLine,
    });
    expect(inactive.wrap).toHaveBeenCalledWith({
      children: [],
      type: KEYS.codeBlock,
    });

    expect(active.set).toHaveBeenCalledWith({ type: KEYS.p }, { at: [0, 0] });
    expect(active.set).toHaveBeenCalledWith({ type: KEYS.p }, { at: [0, 1] });
    expect(active.unwrap).toHaveBeenCalledWith({
      at: [0],
      match: expect.any(Function),
      split: true,
    });
    expect(active.wrap).not.toHaveBeenCalled();
  });

  it('exposes an inferred code block transaction group', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'snippet' }], type: KEYS.p }],
    });

    editor.update((tx) => tx.code_block.toggle());

    expect(editor.children).toEqual([
      {
        children: [
          {
            children: [{ text: 'snippet' }],
            type: KEYS.codeLine,
          },
        ],
        type: KEYS.codeBlock,
      },
    ]);

    editor.update((tx) => tx.code_block.toggle());

    expect(editor.children).toEqual([
      {
        children: [{ text: 'snippet' }],
        type: KEYS.p,
      },
    ]);
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
