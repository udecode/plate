import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseAudioPlugin } from './BaseAudioPlugin';
import { BaseFilePlugin } from './BaseFilePlugin';
import { BaseVideoPlugin } from './BaseVideoPlugin';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';

describe('Base media plugin contracts', () => {
  it('configures file nodes as void elements', () => {
    const editor = createBaseEditor({
      plugins: [BaseFilePlugin],
    });

    expect(editor.getPlugin({ key: KEYS.file }).node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
  });

  it('configures audio nodes as void elements', () => {
    const editor = createBaseEditor({
      plugins: [BaseAudioPlugin],
    });

    expect(editor.getPlugin({ key: KEYS.audio }).node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
  });

  it('configures video nodes as void elements with width and height passthrough', () => {
    const editor = createBaseEditor({
      plugins: [BaseVideoPlugin],
    });

    expect(editor.getPlugin({ key: KEYS.video }).node).toMatchObject({
      dangerouslyAllowAttributes: ['width', 'height'],
      isElement: true,
      isVoid: true,
    });
  });

  it('selects every media void when deleting backward from the next block', () => {
    const rows = [
      [BaseFilePlugin, KEYS.file],
      [BaseAudioPlugin, KEYS.audio],
      [BaseVideoPlugin, KEYS.video],
      [BaseImagePlugin, KEYS.img],
      [BaseMediaEmbedPlugin, KEYS.mediaEmbed],
    ] as const;

    for (const [plugin, type] of rows) {
      const editor = createBaseEditor({
        plugins: [plugin],
        selection: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        value: [
          {
            children: [{ text: '' }],
            type,
            ...(type === KEYS.mediaEmbed || type === KEYS.img
              ? { url: 'https://platejs.org/example' }
              : {}),
          },
          { children: [{ text: 'after' }], type: KEYS.p },
        ],
      });

      editor.update.text.deleteBackward({ unit: 'character' });

      expect(editor.read.children()).toHaveLength(2);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    }
  });
});
