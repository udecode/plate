import { getTransientSuggestionKey } from '@platejs/suggestion';

import { AI_PREVIEW_KEY, beginAIPreview } from './aiStreamSnapshot';
import { undoAI } from './undoAI';

describe('undoAI', () => {
  it('does nothing when the latest undo batch is not tagged as ai', () => {
    const editor = {
      api: { some: mock(() => true) },
      history: { redos: { pop: mock(() => {}) }, undos: [{}] },
      undo: mock(() => {}),
    } as any;

    undoAI(editor);

    expect(editor.undo).not.toHaveBeenCalled();
    expect(editor.history.redos.pop).not.toHaveBeenCalled();
  });

  it('does nothing when there is no ai content left in the editor', () => {
    const editor = {
      api: { some: mock(() => false) },
      history: { redos: { pop: mock(() => {}) }, undos: [{ ai: true }] },
      undo: mock(() => {}),
    } as any;

    undoAI(editor);

    expect(editor.api.some).toHaveBeenCalledTimes(2);
    expect(editor.undo).not.toHaveBeenCalled();
    expect(editor.history.redos.pop).not.toHaveBeenCalled();
  });

  it('undoes the last ai batch when transient ai suggestions still exist', () => {
    const some = mock(
      ({ match }: { match: (node: Record<string, boolean>) => boolean }) =>
        match({ [getTransientSuggestionKey()]: true })
    );
    const editor = {
      api: { some },
      history: { redos: { pop: mock(() => {}) }, undos: [{ ai: true }] },
      undo: mock(() => {}),
    } as any;

    undoAI(editor);

    expect(some).toHaveBeenCalledTimes(2);
    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(editor.history.redos.pop).toHaveBeenCalledTimes(1);
  });

  it('cancels active preview before touching ai history', () => {
    const editor = {
      api: { some: mock(() => true) },
      children: [
        { children: [{ text: 'start' }], type: 'p' },
        { children: [{ text: 'untouched' }], type: 'p' },
      ],
      getPlugin: ({ key }: { key: string }) => ({
        key,
        node: { type: key },
      }),
      history: { redos: { pop: mock(() => {}) }, undos: [{ ai: true }] },
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      tf: {
        deselect: mock(() => {
          editor.selection = null;
        }),
        insertNodes: mock((nodes: any, options: any = {}) => {
          editor.children.splice(
            options.at?.[0] ?? editor.children.length,
            0,
            ...(Array.isArray(nodes) ? nodes : [nodes])
          );
        }),
        removeNodes: mock((options: any = {}) => {
          if (options.match) {
            editor.children = editor.children.filter(
              (node: any) => !options.match(node)
            );

            return;
          }

          editor.children.splice(options.at[0], 1);
        }),
        select: mock((selection: any) => {
          editor.selection = selection;
        }),
        withoutSaving: mock((fn: () => void) => {
          fn();
        }),
      },
      undo: mock(() => {}),
    } as any;

    beginAIPreview(editor, {
      originalBlocks: [{ children: [{ text: 'start' }], type: 'p' }],
    });
    editor.children = [
      {
        [AI_PREVIEW_KEY]: true,
        children: [{ text: 'preview' }],
        type: 'p',
      },
      { children: [{ text: '' }], type: 'aiChat' },
      { children: [{ text: 'untouched' }], type: 'p' },
    ];

    undoAI(editor);

    expect(editor.children).toEqual([
      { children: [{ text: 'start' }], type: 'p' },
      { children: [{ text: 'untouched' }], type: 'p' },
    ]);
    expect(editor.undo).not.toHaveBeenCalled();
    expect(editor.history.redos.pop).not.toHaveBeenCalled();
  });
});
