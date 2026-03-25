import { createSlateEditor, KEYS } from 'platejs';

import { BaseDatePlugin } from '../BaseDatePlugin';
import { insertDate } from './insertDate';

describe('insertDate', () => {
  it('inserts the provided date node and trailing spacer at the cursor', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
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

    insertDate(editor, { date: 'Mon Mar 23 2026' });

    expect(editor.children).toMatchObject([
      {
        children: [
          { text: 'hi' },
          {
            children: [{ text: '' }],
            date: 'Mon Mar 23 2026',
            type: KEYS.date,
          },
          { text: ' ' },
        ],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('bound insert.date uses the configured node type', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin.configure({ node: { type: 'custom-date' } })],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: KEYS.p,
        },
      ],
    });

    editor.tf.insert.date({ date: 'Mon Mar 23 2026' });

    expect(editor.children[0]).toMatchObject({
      children: [
        { text: 'x' },
        {
          date: 'Mon Mar 23 2026',
          type: 'custom-date',
        },
        { text: ' ' },
      ],
      type: KEYS.p,
    });
  });

  it('forwards explicit insertion options to insertNodes', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
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

    insertDate(editor, {
      at: [0, 1],
      date: 'Mon Mar 23 2026',
    });

    expect(editor.children).toMatchObject([
      {
        children: [
          { text: 'a' },
          {
            children: [{ text: '' }],
            date: 'Mon Mar 23 2026',
            type: KEYS.date,
          },
          { text: ' b' },
        ],
        type: KEYS.p,
      },
    ]);
  });
});
