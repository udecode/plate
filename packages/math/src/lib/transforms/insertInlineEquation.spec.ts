import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseInlineEquationPlugin } from '../BaseInlineEquationPlugin';
import { insertInlineEquation } from './insertInlineEquation';

describe('insertInlineEquation', () => {
  it('uses the selected text as the default tex expression', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'abc' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) =>
      insertInlineEquation(tx, editor.getType(KEYS.inlineEquation))
    );

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            texExpression: 'abc',
            type: NODES.inlineEquation,
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('prefers the provided tex expression and configured node type', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseInlineEquationPlugin.configure({
          type: 'custom-inline-equation',
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'x' }, { text: 'y' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) =>
      insertInlineEquation(tx, editor.getType(KEYS.inlineEquation), {
        at: { offset: 1, path: [0, 0] },
        texExpression: 'x^2',
      })
    );

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: '' }],
            texExpression: 'x^2',
            type: 'custom-inline-equation',
          },
          { text: 'y' },
        ],
        type: KEYS.p,
      },
    ]);
  });
});
