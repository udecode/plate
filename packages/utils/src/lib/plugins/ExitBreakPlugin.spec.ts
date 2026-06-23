import { createPlateEditor } from '@platejs/core/react';

import { ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('inserts an exit block after the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      runtime: 'plite',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update((tx) => tx.exitBreak.insert({}));

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('inserts an exit block before the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      runtime: 'plite',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor.update((tx) => tx.exitBreak.insertBefore({ match: () => true }));

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'start' }], type: 'p' },
    ]);
  });

  it('routes insert through the Plite runtime transform', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      runtime: 'plite',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor.update((tx) => tx.exitBreak.insert({}));

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'start' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
