/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

describe('BaseDatePlugin', () => {
  it('configure date as void inline element', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    const element = { children: [{ text: '' }], type: KEYS.date };
    const dateElement = editor.read.schema.handle(BaseDatePlugin);
    const date = schema.handle.property(dateElement, 'date');

    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(editor.read.schema.isInline(element)).toBe(true);
    expect(editor.read.schema.property(date)?.value.kind).toBe('string');
  });

  it('does not force date elements to opt out of keyboard entry', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    const element = { children: [{ text: '' }], type: KEYS.date };

    expect(editor.read.schema.isKeyboardSelectable(element)).toBe(true);
  });

  it('provides the date.insert transaction', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    expect(editor.update.date.insert).toBeDefined();
    expect(typeof editor.update.date.insert).toBe('function');
  });

  it('deleteBackward removes the adjacent date atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next date atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the date child so the inline void stays keyboard-accessible', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update.selection.move({ distance: 1, unit: 'character' });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the date child so the inline void stays keyboard-accessible', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update.selection.move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
