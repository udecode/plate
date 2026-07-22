import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseDatePlugin } from '../BaseDatePlugin';
import { insertDate } from './insertDate';

describe('insertDate', () => {
  it('inserts the provided date node and trailing spacer at the cursor', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
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

    editor.update((tx) => {
      insertDate(tx, editor.getType(KEYS.date), {
        date: 'Mon Mar 23 2026',
      });
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'hi' },
          {
            children: [{ text: '' }],
            date: '2026-03-23',
            type: KEYS.date,
          },
          { text: ' ' },
        ],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('bound date.insert uses the configured node type', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin.configure({ type: 'custom-date' })],
      selection: {
        kind: 'text',
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

    editor.update.date.insert({ date: 'Mon Mar 23 2026' });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'x' },
        {
          date: '2026-03-23',
          type: 'custom-date',
        },
        { text: ' ' },
      ],
      type: KEYS.p,
    });
  });

  it('forwards explicit insertion options to insertNodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              date: '2025-01-01',
              type: KEYS.date,
            },
            { text: 'b' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update.date.insert({
      at: [0, 1],
      date: 'Mon Mar 23 2026',
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'a' },
          {
            children: [{ text: '' }],
            date: '2026-03-23',
            type: KEYS.date,
          },
          { text: ' ' },
          {
            children: [{ text: '' }],
            date: '2025-01-01',
            type: KEYS.date,
          },
          { text: 'b' },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('preserves non-normalizable input on the raw fallback field', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
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

    editor.update.date.insert({ date: 'sometime next week' });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'x' },
        {
          rawDate: 'sometime next week',
          type: KEYS.date,
        },
        { text: ' ' },
      ],
      type: KEYS.p,
    });
  });
});
