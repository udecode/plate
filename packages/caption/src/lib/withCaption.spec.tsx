import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema, type Selection, type Value } from '@platejs/plite';

import { BaseCaptionPlugin } from './BaseCaptionPlugin';

const MediaPlugin = createBasePlugin({
  key: 'media',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', max: 1, min: 1 }),
    },
  },
});

const createCaptionEditor = (value: Value, selection: Selection = null) =>
  createBaseEditor({
    plugins: [
      MediaPlugin,
      BaseCaptionPlugin.configure({
        config: { targetPluginKeys: ['media'] },
      }),
    ],
    selection,
    value,
  });

const runShortcut = (
  editor: ReturnType<typeof createCaptionEditor>,
  name: string
) =>
  editor.runtime.shortcuts[`caption.${name}`]?.handler?.({
    editor,
    event: {
      key: name === 'focusCaptionForward' ? 'ArrowDown' : 'ArrowUp',
    } as KeyboardEvent,
    eventDetails: {},
  });

describe('withCaption', () => {
  it('targets caption data only to configured element types', () => {
    const editor = createCaptionEditor([
      {
        caption: [{ text: 'caption' }],
        children: [{ text: '' }],
        type: 'media',
      },
    ]);

    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            caption: [{ text: 'caption' }],
            children: [{ text: '' }],
            type: 'p',
          },
        ],
      })
    ).toThrow(/caption/);
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            caption: { text: 'not-an-array' },
            children: [{ text: '' }],
            type: 'media',
          },
        ],
      })
    ).toThrow(/plate\.caption\.content/);
  });

  it('rejects element-shaped caption descendants without a string type', () => {
    const editor = createCaptionEditor([
      {
        caption: [{ text: 'caption' }],
        children: [{ text: '' }],
        type: 'media',
      },
    ]);
    const elementShapedCaption: unknown = [{ children: [{ text: '' }] }];

    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            caption: elementShapedCaption,
            children: [{ text: '' }],
            type: 'media',
          },
        ],
      })
    ).toThrow(/plate\.caption\.content/);
  });

  it('stores focusEndPath when arrow-up moves into an allowed node with caption text', async () => {
    const editor = createCaptionEditor([
      {
        caption: [{ text: 'caption' }],
        children: [{ text: '' }],
        type: 'media',
      },
    ]);

    expect(runShortcut(editor, 'focusCaptionBackward')).toBe(false);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.plugin(BaseCaptionPlugin).getOption('focusEndPath')).toEqual([
      0,
    ]);
  });

  it('skips the delayed focus when the caption is empty', async () => {
    const editor = createCaptionEditor([
      {
        caption: [{ text: '' }],
        children: [{ text: '' }],
        type: 'media',
      },
    ]);

    expect(runShortcut(editor, 'focusCaptionBackward')).toBe(false);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      editor.plugin(BaseCaptionPlugin).getOption('focusEndPath')
    ).toBeNull();
  });

  it('moves focus into the caption when moving down from an allowed block', () => {
    const editor = createCaptionEditor(
      [
        {
          caption: [{ text: 'caption' }],
          children: [{ text: '' }],
          type: 'media',
        },
      ],
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      }
    );

    expect(runShortcut(editor, 'focusCaptionForward')).toBe(true);
    expect(editor.plugin(BaseCaptionPlugin).getOption('focusEndPath')).toEqual([
      0,
    ]);
  });

  it('still moves focus into an empty caption when moving down from an allowed block', () => {
    const editor = createCaptionEditor(
      [
        {
          caption: [{ text: '' }],
          children: [{ text: '' }],
          type: 'media',
        },
      ],
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      }
    );

    expect(runShortcut(editor, 'focusCaptionForward')).toBe(true);
    expect(editor.plugin(BaseCaptionPlugin).getOption('focusEndPath')).toEqual([
      0,
    ]);
  });

  it('falls through when moving down from a block that does not allow captions', () => {
    const editor = createBaseEditor({
      plugins: [
        MediaPlugin,
        BaseCaptionPlugin.configure({
          config: { targetPluginKeys: ['media'] },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'plain' }],
          type: 'p',
        },
      ],
    });

    expect(runShortcut(editor, 'focusCaptionForward')).toBe(false);
    expect(
      editor.plugin(BaseCaptionPlugin).getOption('focusEndPath')
    ).toBeNull();
  });
});
