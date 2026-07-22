import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseEquationPlugin } from '../BaseEquationPlugin';
import { insertEquation } from './insertEquation';

describe('insertEquation', () => {
  it('inserts the default equation node shape at the cursor', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'hi' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) => insertEquation(tx, editor.getType(KEYS.equation)));

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        texExpression: '',
        type: KEYS.equation,
      },
    ]);
  });

  it('respects the configured node type and explicit insertion target', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseEquationPlugin.configure({
          type: 'custom-equation',
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'a' }, { text: 'b' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) =>
      insertEquation(tx, editor.getType(KEYS.equation), { at: [1] })
    );

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'ab' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        texExpression: '',
        type: 'custom-equation',
      },
    ]);
  });
});
