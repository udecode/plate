import { createSlateEditor, KEYS } from 'platejs';

import { BaseEquationPlugin } from '../BaseEquationPlugin';
import { insertEquation } from './insertEquation';

describe('insertEquation', () => {
  it('inserts the default equation node shape at the cursor', () => {
    const editor = createSlateEditor({
      plugins: [BaseEquationPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hi' }],
          type: KEYS.p,
        },
      ],
    });

    insertEquation(editor);

    expect(editor.children).toMatchObject([
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
    const editor = createSlateEditor({
      plugins: [
        BaseEquationPlugin.configure({
          node: { type: 'custom-equation' },
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'a' }, { text: 'b' }],
          type: KEYS.p,
        },
      ],
    });

    insertEquation(editor, { at: [1] });

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'a' }, { text: 'b' }],
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
