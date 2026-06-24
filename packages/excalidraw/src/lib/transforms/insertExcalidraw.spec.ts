import { KEYS } from 'platejs';

import { insertExcalidraw } from './insertExcalidraw';

describe('insertExcalidraw', () => {
  it('does nothing without a selection or parent entry', () => {
    const editor = {
      api: { parent: mock(() => null) },
      selection: null,
      update: mock(),
    } as any;

    insertExcalidraw(editor);

    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };
    insertExcalidraw(editor);

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('inserts a next block at the parent path and merges custom props', () => {
    const insertNodes = mock();
    const editor = {
      api: {
        parent: mock(() => [{ children: [{ text: '' }], type: 'p' }, [0]]),
      },
      getType: mock(() => KEYS.excalidraw),
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      update: mock((fn: any) => fn({ nodes: { insert: insertNodes } })),
    } as any;

    insertExcalidraw(
      editor,
      { data: { elements: [], state: { theme: 'dark' } as any } } as any,
      { select: true } as any
    );

    expect(insertNodes).toHaveBeenCalledWith(
      {
        children: [{ text: '' }],
        data: { elements: [], state: { theme: 'dark' } },
        type: KEYS.excalidraw,
      },
      { at: [1], select: true }
    );
  });
});
