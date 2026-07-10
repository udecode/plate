import { createBaseEditor, createBasePlugin } from '@platejs/core';
import type { Selection, Value } from '@platejs/plite';

import { BaseCaptionPlugin } from './BaseCaptionPlugin';

const MediaPlugin = createBasePlugin({
  key: 'media',
  node: { isElement: true },
});

const createCaptionEditor = (value: Value, selection: Selection = null) =>
  createBaseEditor({
    plugins: [
      MediaPlugin,
      BaseCaptionPlugin.configure({
        options: {
          query: { allow: ['media'] },
        },
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
          options: {
            query: { allow: ['media'] },
          },
        }),
      ],
      selection: {
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
