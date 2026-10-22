/** @jsx jsxt */

import { afterEach, describe, expect, it, setSystemTime } from 'bun:test';

import { jsxt } from '#platejs-test-internal';

import { createEditor, schema } from '../../../core';
import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

// Bun tests run in UTC when TZ is unset, and deleting TZ stops Bun from
// applying a later change, so restore a value instead.
const originalTimeZone = process.env.TZ ?? 'UTC';

const createInsertEditor = () =>
  createEditor({
    plugins: [BaseDatePlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
  });

describe('BaseDatePlugin', () => {
  afterEach(() => {
    setSystemTime();
    process.env.TZ = originalTimeZone;
  });

  it('requires a non-empty persisted value', () => {
    const editor = createEditor({ plugins: [BaseDatePlugin] });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [{ children: [{ text: '' }], type: 'date', value: '   ' }],
      })
    ).toThrow(/value.*validation/i);
  });

  it('configure date as void inline element', () => {
    const editor = createEditor({
      plugins: [BaseDatePlugin],
    });

    const element = { children: [{ text: '' }], type: 'date' };
    const dateElement = schema.handle.element(
      BaseDatePlugin,
      editor.plugin(BaseDatePlugin).schema.type
    );
    const value = schema.handle.property(dateElement, 'value');

    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(editor.read.schema.isInline(element)).toBe(true);
    expect(editor.read.schema.property(value)?.value.kind).toBe('string');
  });

  it('skips date elements during keyboard entry', () => {
    const editor = createEditor({
      plugins: [BaseDatePlugin],
    });

    const element = { children: [{ text: '' }], type: 'date' };

    expect(editor.read.schema.isObject(element)).toBe(false);
  });

  it('deleteBackward removes the adjacent date atom', () => {
    const editor = createEditor({
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
              value: '2024-01-01',
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
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next date atom', () => {
    const editor = createEditor({
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
              value: '2024-01-01',
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
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('crosses the date to the right without changing content', () => {
    const editor = createEditor({
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
              value: '2024-01-01',
              type: 'date',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const before = editor.read.value();

    editor.update.selection.move({ distance: 1, unit: 'character' });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    expect(editor.read.value()).toEqual(before);
  });

  it('crosses the date to the left without changing content', () => {
    const editor = createEditor({
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
              value: '2024-01-01',
              type: 'date',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const before = editor.read.value();

    editor.update.selection.move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(editor.read.value()).toEqual(before);
  });

  it('stores inserted text as typed with a trailing spacer', () => {
    const editor = createEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
    });

    editor.update.date.insert({ value: 'Mon Mar 23 2026' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'hi' },
          {
            children: [{ text: '' }],
            value: 'Mon Mar 23 2026',
            type: 'date',
          },
          { text: ' ' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('forwards explicit insertion options', () => {
    const editor = createEditor({
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
              value: '2025-01-01',
              type: 'date',
            },
            { text: 'b' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.date.insert({ value: 'Mon Mar 23 2026' }, { at: [0, 1] });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'a' },
          { value: 'Mon Mar 23 2026', type: 'date' },
          { text: ' ' },
          { value: '2025-01-01', type: 'date' },
          { text: 'b' },
        ],
      },
    ]);
  });

  it('preserves non-normalizable input on the raw fallback field', () => {
    const editor = createEditor({
      plugins: [BaseDatePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.update.date.insert({ value: 'sometime next week' });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'x' },
        { value: 'sometime next week', type: 'date' },
        { text: ' ' },
      ],
    });
  });

  it('inserts nothing for an invalid Date or blank text', () => {
    const editor = createInsertEditor();
    const before = editor.read.children();

    editor.update.date.insert({ value: new Date(Number.NaN) });
    editor.update.date.insert({ value: '   ' });

    expect(editor.read.children()).toEqual(before);
  });

  it('stores the local day when inserted without a value', () => {
    process.env.TZ = 'America/Los_Angeles';
    setSystemTime(new Date(2026, 2, 23, 23, 30));
    const editor = createInsertEditor();

    editor.update.date.insert();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'x' }, { value: '2026-03-23' }, { text: ' ' }],
    });
  });

  it('stores the supplied day rather than the clock', () => {
    setSystemTime(new Date(2026, 2, 23, 9));
    const editor = createInsertEditor();

    editor.update.date.insert({ value: new Date(2026, 2, 24, 12) });
    editor.update.date.insert({ value: '2026-03-24' });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'x' },
        { value: '2026-03-24' },
        { text: ' ' },
        { value: '2026-03-24' },
        { text: ' ' },
      ],
    });
  });
});
