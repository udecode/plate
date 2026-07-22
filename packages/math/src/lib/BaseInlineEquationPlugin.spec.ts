import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';

describe('BaseInlineEquationPlugin', () => {
  it('uses a camelCase plugin identity without changing serialized nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
    });
    const plugin = editor.getPlugin(BaseInlineEquationPlugin);
    const element = {
      children: [{ text: '' }],
      type: NODES.inlineEquation,
    };

    expect(plugin.key).toBe('inlineEquation');
    expect(plugin.type).toBe(NODES.inlineEquation);
    expect(editor.read.schema.isInline(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property(BaseInlineEquationPlugin)?.value.kind
    ).toBe('string');
    expect(editor.getType(KEYS.inlineEquation)).toBe(NODES.inlineEquation);

    editor.update((tx) => {
      expect(typeof tx.inlineEquation.insert).toBe('function');
    });
  });

  it('moves into the inline equation from the left boundary', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              texExpression: 'x+1',
              type: NODES.inlineEquation,
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
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves into the inline equation from the right boundary', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              texExpression: 'x+1',
              type: NODES.inlineEquation,
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
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
