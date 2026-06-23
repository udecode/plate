import { createBasePlateEditor } from 'platejs';
import { KEYS } from 'platejs';
import { createPlateRuntimeEditor } from 'platejs/react';

import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';

describe('BaseInlineEquationPlugin', () => {
  it('configures inlineEquation as an inline void element and exposes tx.inlineEquation.insert', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseInlineEquationPlugin],
    });
    const plugin = editor.getPlugin(BaseInlineEquationPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });
    editor.update((tx) => {
      expect(typeof tx.inlineEquation.insert).toBe('function');
    });
  });

  it('moves into the inline equation from the left boundary', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
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
      plugins: [BaseInlineEquationPlugin],
      initialSelection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    editor.update((tx) => {
      tx.selection.move({ distance: 1, unit: 'character' });
    });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves into the inline equation from the right boundary', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
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
      plugins: [BaseInlineEquationPlugin],
      initialSelection: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
    });

    editor.update((tx) => {
      tx.selection.move({ distance: 1, reverse: true, unit: 'character' });
    });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('exposes an inferred inline equation transaction group', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseInlineEquationPlugin],
      value: [
        { children: [{ text: 'before' }, { text: 'after' }], type: KEYS.p },
      ],
    });

    editor.update((tx) => tx.inlineEquation.insert('a^2+b^2', { at: [0, 1] }));

    expect(editor.children[0]).toMatchObject({
      children: [
        { text: 'before' },
        {
          children: [{ text: '' }],
          texExpression: 'a^2+b^2',
          type: KEYS.inlineEquation,
        },
        { text: 'after' },
      ],
      type: KEYS.p,
    });
  });
});
