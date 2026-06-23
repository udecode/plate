import { KEYS, createSlateEditor } from 'platejs';

import { BaseEquationPlugin } from './BaseEquationPlugin';

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes tx.equation.insert', () => {
    const editor = createSlateEditor({
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
    const editor = createSlateEditor({
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

    editor.update((tx) => {
      tx.text.deleteBackward({ unit: 'character' });
    });

    expect(editor.children).toHaveLength(2);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('exposes an inferred equation transaction group', () => {
    const editor = createSlateEditor({
      plugins: [BaseEquationPlugin],
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update((tx) => tx.equation.insert({ at: [1] }));

    expect(editor.children[1]).toMatchObject({
      children: [{ text: '' }],
      texExpression: '',
      type: KEYS.equation,
    });
  });
});
