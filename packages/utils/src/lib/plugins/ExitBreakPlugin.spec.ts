import { createSlateEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { type ExitBreakConfig, ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('delegates insert to insertExitBreak', () => {
    const editor = createSlateEditor({
      plugins: [ExitBreakPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const insertExitBreakSpy = spyOn(editor.tf, 'insertExitBreak');

    editor.getTransforms<ExitBreakConfig>(ExitBreakPlugin).exitBreak.insert({});

    expect(insertExitBreakSpy).toHaveBeenCalledWith({});
  });

  it('delegates insertBefore with reverse set to true', () => {
    const editor = createSlateEditor({
      plugins: [ExitBreakPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const insertExitBreakSpy = spyOn(editor.tf, 'insertExitBreak');

    editor
      .getTransforms<ExitBreakConfig>(ExitBreakPlugin)
      .exitBreak.insertBefore({ match: () => true });

    expect(insertExitBreakSpy).toHaveBeenCalledWith({
      match: expect.any(Function),
      reverse: true,
    });
  });

  it('routes insert through the Slate v2 runtime transform', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor
      .getTransforms<ExitBreakConfig['transforms']>(ExitBreakPlugin)
      .exitBreak.insert({});

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'start' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
