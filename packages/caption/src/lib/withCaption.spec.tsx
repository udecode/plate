import { createSlateEditor, createSlatePlugin } from 'platejs';

import { BaseCaptionPlugin } from './BaseCaptionPlugin';

const MediaPlugin = createSlatePlugin({
  key: 'media',
  node: { isElement: true },
});

const createCaptionEditor = (value: any, selection: any = null) =>
  createSlateEditor({
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

describe('withCaption', () => {
  const originalSetTimeout = globalThis.setTimeout;

  beforeEach(() => {
    globalThis.setTimeout = ((fn: () => void) => {
      fn();

      return 0 as any;
    }) as typeof setTimeout;
  });

  afterEach(() => {
    globalThis.setTimeout = originalSetTimeout;
  });

  it('stores focusEndPath when arrow-up moves into an allowed node with caption text', () => {
    const editor = createCaptionEditor([
      {
        caption: [{ text: 'caption' }],
        children: [{ text: '' }],
        type: 'media',
      },
    ]);

    editor.dom.currentKeyboardEvent = { key: 'ArrowUp', which: 38 } as any;
    (editor as any).apply({
      newProperties: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      properties: null,
      type: 'set_selection',
    } as any);

    expect(editor.getOption(BaseCaptionPlugin, 'focusEndPath')).toEqual([0]);
  });

  it('skips the delayed focus when the caption is empty', () => {
    const editor = createCaptionEditor([
      {
        caption: [{ text: '' }],
        children: [{ text: '' }],
        type: 'media',
      },
    ]);

    editor.dom.currentKeyboardEvent = { key: 'ArrowUp', which: 38 } as any;
    (editor as any).apply({
      newProperties: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      properties: null,
      type: 'set_selection',
    } as any);

    expect(editor.getOption(BaseCaptionPlugin, 'focusEndPath')).toBeNull();
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

    expect(editor.tf.moveLine({ reverse: false })).toBe(true);
    expect(editor.getOption(BaseCaptionPlugin, 'focusEndPath')).toEqual([0]);
  });
});
