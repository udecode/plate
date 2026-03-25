import { createSlateEditor, KEYS } from 'platejs';

import { BaseInlineEquationPlugin } from '../BaseInlineEquationPlugin';
import { insertInlineEquation } from './insertInlineEquation';

describe('insertInlineEquation', () => {
  it('uses the selected text as the default tex expression', () => {
    const editor = createSlateEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'abc' }],
          type: KEYS.p,
        },
      ],
    });

    insertInlineEquation(editor);

    expect(editor.children).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            texExpression: 'abc',
            type: KEYS.inlineEquation,
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('prefers the provided tex expression and configured node type', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseInlineEquationPlugin.configure({
          node: { type: 'custom-inline-equation' },
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }, { text: 'y' }],
          type: KEYS.p,
        },
      ],
    });

    insertInlineEquation(editor, 'x^2', { at: [0, 1] });

    expect(editor.children).toMatchObject([
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
