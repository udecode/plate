/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';
import { schema } from '@platejs/plite';

import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

describe('BaseDatePlugin', () => {
  it('configure date as void inline element', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    const element = { children: [{ text: '' }], type: 'date' };
    const dateElement = schema.handle.element(
      BaseDatePlugin,
      editor.plugin(BaseDatePlugin).schema.type
    );
    const date = schema.handle.property(dateElement, 'date');

    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(editor.read.schema.isInline(element)).toBe(true);
    expect(editor.read.schema.property(date)?.value.kind).toBe('string');
  });

  it('does not force date elements to opt out of keyboard entry', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    const element = { children: [{ text: '' }], type: 'date' };

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
              type: 'date',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
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
              type: 'date',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
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
              type: 'date',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
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
              type: 'date',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
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

  it('inserts a canonical date node and trailing spacer', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
    });

    editor.update.date.insert({ date: 'Mon Mar 23 2026' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'hi' },
          {
            children: [{ text: '' }],
            date: '2026-03-23',
            type: 'date',
          },
          { text: ' ' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('forwards explicit insertion options', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              date: '2025-01-01',
              type: 'date',
            },
            { text: 'b' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.date.insert({ date: 'Mon Mar 23 2026' }, { at: [0, 1] });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'a' },
          { date: '2026-03-23', type: 'date' },
          { text: ' ' },
          { date: '2025-01-01', type: 'date' },
          { text: 'b' },
        ],
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
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.update.date.insert({ date: 'sometime next week' });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'x' },
        { rawDate: 'sometime next week', type: 'date' },
        { text: ' ' },
      ],
    });
  });
});
