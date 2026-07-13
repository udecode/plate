import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseEquationPlugin } from './BaseEquationPlugin';

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes insert.equation', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
    });
    const plugin = editor.getPlugin(BaseEquationPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    editor.update((tx) => {
      expect(typeof tx.equation.insert).toBe('function');
    });
  });

  it('deleteBackward from the next block selects the equation instead of deleting through it', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          texExpression: 'x+1',
          type: KEYS.equation,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) => tx.text.deleteBackward({ unit: 'character' }));

    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
