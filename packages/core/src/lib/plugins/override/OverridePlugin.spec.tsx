import {
  deleteBackward,
  deleteForward,
  insertBreak,
} from '@platejs/plite/internal';
import { schema, property } from '@platejs/plite';

import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';

describe('OverridePlugin', () => {
  it('publishes a closed Plate schema for elements and text properties', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const TonePlugin = createBasePlugin({
      key: 'tone',
      schema: { mark: { property: property.string() } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, TonePlugin],
      value: [
        {
          children: [{ text: 'typed', tone: 'quiet' }],
          type: 'callout',
        },
      ],
    });

    expect(
      editor.read.schema.isBlock({
        children: [{ text: '' }],
        type: 'callout',
      })
    ).toBe(true);
    expect(() =>
      createBaseEditor({
        plugins: [CalloutPlugin],
        value: [{ children: [{ text: 'unknown' }], type: 'missing' }],
      })
    ).toThrow(/unknown editor element type "missing"/i);
    expect(() =>
      createBaseEditor({
        plugins: [TonePlugin],
        value: [{ children: [{ text: 'invalid', tone: true }], type: 'p' }],
      })
    ).toThrow(/text property "tone".*string/i);
  });

  it('selects a previous block void before deleting it', () => {
    const VoidPlugin = createBasePlugin({
      key: 'void',
      schema: { element: { void: 'block' } },
    });
    const editor = createBaseEditor({
      plugins: [VoidPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.value().children).toEqual([
      { children: [{ text: '' }], type: 'void' },
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('removes a selected block void without merging the next block into it', () => {
    const VoidPlugin = createBasePlugin({
      key: 'void',
      schema: { element: { void: 'block' } },
    });
    const editor = createBaseEditor({
      plugins: [VoidPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    deleteForward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('handles deleteExit through the OverridePlugin Plite extension', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      type: 'callout',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
      rules: {
        break: {
          emptyLineEnd: 'deleteExit',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'foo\n' }], type: 'callout' }],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'foo' }], type: 'callout' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('resets the empty block inserted at the start of a splitReset block', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      type: 'callout',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
      rules: { break: { splitReset: true } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'foo' }], type: 'callout' }],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'foo' }], type: 'callout' },
    ]);
  });

  it('preserves an empty merge target when its plugin disables removal', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      type: 'callout',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
      rules: { merge: { removeEmpty: false } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });

  it('preserves plugin-owned empty merge targets by default', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      type: 'callout',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const MergeAwarePlugin = createBasePlugin({
      key: 'merge-aware',
      rules: { merge: { removeEmpty: true } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, MergeAwarePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });
});
