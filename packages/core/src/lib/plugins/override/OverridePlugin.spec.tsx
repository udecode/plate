import { createEditor, schema, property, type Value } from '@platejs/plite';
import {
  deleteBackward,
  deleteForward,
  insertBreak,
} from '@platejs/plite/internal';

import { createBaseEditor } from '../../editor';
import { defineBasePlugin } from '../../plugin';
import { BaseParagraphPlugin } from '../paragraph';

describe('OverridePlugin', () => {
  it('publishes a closed Plate schema for elements and text properties', () => {
    const CalloutPlugin = defineBasePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const TonePlugin = defineBasePlugin('tone', {
      schema: { mark: { property: property.string() } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, TonePlugin],
      initialValue: [
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
        editor: createEditor<Value>(),
        plugins: [CalloutPlugin],
        initialValue: [{ children: [{ text: 'unknown' }], type: 'missing' }],
      })
    ).toThrow(/unknown editor element type "missing"/i);
    expect(() =>
      createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [TonePlugin],
        initialValue: [
          { children: [{ text: 'invalid', tone: true }], type: 'paragraph' },
        ],
      })
    ).toThrow(/text property "tone".*string/i);
  });

  it('selects a previous block void before deleting it', () => {
    const VoidPlugin = defineBasePlugin('void', {
      schema: { element: { void: 'block' } },
    });
    const editor = createBaseEditor({
      plugins: [VoidPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.value().children).toEqual([
      { children: [{ text: '' }], type: 'void' },
      { children: [{ text: 'after' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('removes a selected block void without merging the next block into it', () => {
    const VoidPlugin = defineBasePlugin('void', {
      schema: { element: { void: 'block' } },
    });
    const editor = createBaseEditor({
      plugins: [VoidPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteForward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('handles deleteExit through OverridePlugin command policy', () => {
    const CalloutPlugin = defineBasePlugin('callout', {
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
      initialValue: [{ children: [{ text: 'foo\n' }], type: 'callout' }],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'foo' }], type: 'callout' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('exits a structural application root with one undoable root sibling', () => {
    const CalloutPlugin = defineBasePlugin('structuralExitCallout', {
      schema: { element: schema.element.textBlock() },
      rules: { break: { emptyLineEnd: 'deleteExit' } },
    });
    const SectionPlugin = defineBasePlugin('structuralExitSection', {
      schema: {
        element: {
          content: schema.content.elements(
            [BaseParagraphPlugin, CalloutPlugin],
            { min: 1 }
          ),
        },
      },
    });
    const initialValue = [
      {
        children: [
          { children: [{ text: 'foo\n' }], type: 'structuralExitCallout' },
        ],
        type: 'structuralExitSection',
      },
    ];
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 1 }),
      },
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue,
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'foo' }], type: 'structuralExitCallout' },
        ],
        type: 'structuralExitSection',
      },
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        type: 'structuralExitSection',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });

    editor.update((tx) => tx.history.undo());

    expect(editor.read.children()).toEqual(initialValue);
  });

  it('leaves document-start deletion inside nested blocks to their owner', () => {
    const WrapperPlugin = defineBasePlugin('wrapper', {
      schema: {
        element: {
          content: schema.content.open({
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [WrapperPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
          type: 'wrapper',
        },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
        type: 'wrapper',
      },
    ]);
  });

  it('resets the empty block inserted at the start of a splitReset block', () => {
    const CalloutPlugin = defineBasePlugin('callout', {
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
      initialValue: [{ children: [{ text: 'foo' }], type: 'callout' }],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'foo' }], type: 'callout' },
    ]);
  });

  it('resets a nested block to its parent content default', () => {
    const CalloutPlugin = defineBasePlugin('nestedResetCallout', {
      schema: { element: schema.element.textBlock() },
      rules: { break: { splitReset: true } },
    });
    const SectionPlugin = defineBasePlugin('nestedResetSection', {
      schema: {
        element: {
          content: schema.content.elements(
            [BaseParagraphPlugin, CalloutPlugin],
            { min: 1 }
          ),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 1 }),
      },
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'foo' }], type: 'nestedResetCallout' },
          ],
          type: 'nestedResetSection',
        },
      ],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'paragraph' },
          {
            children: [{ text: 'foo' }],
            type: 'nestedResetCallout',
          },
        ],
        type: 'nestedResetSection',
      },
    ]);
  });

  it('preserves an empty merge target when its plugin disables removal', () => {
    const CalloutPlugin = defineBasePlugin('callout', {
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
      initialValue: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });

  it('preserves plugin-owned empty merge targets by default', () => {
    const CalloutPlugin = defineBasePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const MergeAwarePlugin = defineBasePlugin('mergeAware', {
      rules: { merge: { removeEmpty: true } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, MergeAwarePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });
});
