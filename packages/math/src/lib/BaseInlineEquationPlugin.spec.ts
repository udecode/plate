import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';

describe('BaseInlineEquationPlugin', () => {
  it('configures inlineEquation as an inline void element and exposes insert.inlineEquation', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
    });
    const plugin = editor.getPlugin(BaseInlineEquationPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });
    editor.update((tx) => {
      expect(typeof tx.inline_equation.insert).toBe('function');
    });
  });

  it('moves into the inline equation from the left boundary', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              texExpression: 'x+1',
              type: KEYS.inlineEquation,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) =>
      tx.selection.move({ distance: 1, unit: 'character' })
    );

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves into the inline equation from the right boundary', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              texExpression: 'x+1',
              type: KEYS.inlineEquation,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) =>
      tx.selection.move({ distance: 1, reverse: true, unit: 'character' })
    );

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
