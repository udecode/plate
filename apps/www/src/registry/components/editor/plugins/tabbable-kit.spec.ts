import { createPlateEditor } from '@platejs/core/react';

import { TabbableKit } from './tabbable-kit';

const createEditor = (offset: number) =>
  createPlateEditor({
    plugins: [TabbableKit],
    selection: {
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    value: [
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
    ],
  });

describe('TabbableKit', () => {
  it('disables tab handling at the current block edges', () => {
    for (const offset of [0, 3]) {
      const editor = createEditor(offset);

      expect(
        editor.plugin(TabbableKit).getOption('query')?.(
          new KeyboardEvent('keydown')
        )
      ).toBe(false);
    }
  });

  it('allows tab handling inside a plain block', () => {
    const editor = createEditor(1);

    expect(editor.read.selection.isAtBlockStart()).toBe(false);
    expect(editor.read.selection.isAtBlockEnd()).toBe(false);
    expect(
      editor.plugin(TabbableKit).getOption('query')?.(
        new KeyboardEvent('keydown')
      )
    ).toBe(true);
  });
});
