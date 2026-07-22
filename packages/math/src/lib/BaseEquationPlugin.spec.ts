import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseEquationPlugin } from './BaseEquationPlugin';

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes insert.equation', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
    });
    const element = { children: [{ text: '' }], type: KEYS.equation };

    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(editor.read.schema.property(BaseEquationPlugin)?.value.kind).toBe(
      'string'
    );
    editor.update((tx) => {
      expect(typeof tx.equation.insert).toBe('function');
    });
  });

  it('deleteBackward from the next block selects the equation instead of deleting through it', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
      selection: {
        kind: 'text',
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

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
