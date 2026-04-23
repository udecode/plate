import { KEYS, createSlateEditor } from 'platejs';

import { BaseEquationPlugin } from './BaseEquationPlugin';

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes insert.equation', () => {
    const editor = createSlateEditor({
      plugins: [BaseEquationPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseEquationPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(typeof (editor as any).tf.insert.equation).toBe('function');
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
    } as any);

    editor.tf.deleteBackward('character');

    expect(editor.children).toHaveLength(2);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
