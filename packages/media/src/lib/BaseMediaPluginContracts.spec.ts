import { createSlateEditor, KEYS } from 'platejs';

import { BaseAudioPlugin } from './BaseAudioPlugin';
import { BaseFilePlugin } from './BaseFilePlugin';
import { BaseVideoPlugin } from './BaseVideoPlugin';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';

describe('Base media plugin contracts', () => {
  it('configures file nodes as void elements', () => {
    const editor = createSlateEditor({
      plugins: [BaseFilePlugin],
    } as any);

    expect(editor.getPlugin({ key: KEYS.file }).node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
  });

  it('configures audio nodes as void elements', () => {
    const editor = createSlateEditor({
      plugins: [BaseAudioPlugin],
    } as any);

    expect(editor.getPlugin({ key: KEYS.audio }).node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
  });

  it('configures video nodes as void elements with width and height passthrough', () => {
    const editor = createSlateEditor({
      plugins: [BaseVideoPlugin],
    } as any);

    expect(editor.getPlugin({ key: KEYS.video }).node).toMatchObject({
      dangerouslyAllowAttributes: ['width', 'height'],
      isElement: true,
      isVoid: true,
    });
  });

  it.each([
    ['file', BaseFilePlugin, KEYS.file],
    ['audio', BaseAudioPlugin, KEYS.audio],
    ['video', BaseVideoPlugin, KEYS.video],
    ['img', BaseImagePlugin, KEYS.img],
    ['media_embed', BaseMediaEmbedPlugin, KEYS.mediaEmbed],
  ])('deleteBackward from the next block selects the %s node instead of deleting through it', (_label, plugin, type) => {
    const editor = createSlateEditor({
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
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.deleteBackward('character');

    expect(editor.children).toHaveLength(2);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
