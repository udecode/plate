import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BasePlaceholderPlugin } from './BasePlaceholderPlugin';

describe('BasePlaceholderPlugin', () => {
  it.each([
    ['audioPlaceholder', KEYS.audio],
    ['filePlaceholder', KEYS.file],
    ['imagePlaceholder', KEYS.img],
    ['videoPlaceholder', KEYS.video],
  ])('configures %s and inserts %s placeholders', (transform, mediaType) => {
    const editor = createBaseEditor({
      plugins: [BasePlaceholderPlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BasePlaceholderPlugin);

    expect(plugin.node).toMatchObject({
      element: { groups: ['block'], void: 'block' },
    });

    switch (transform) {
      case 'audioPlaceholder': {
        editor.update.placeholder.audioPlaceholder({ at: [1] });
        break;
      }
      case 'filePlaceholder': {
        editor.update.placeholder.filePlaceholder({ at: [1] });
        break;
      }
      case 'imagePlaceholder': {
        editor.update.placeholder.imagePlaceholder({ at: [1] });
        break;
      }
      case 'videoPlaceholder': {
        editor.update.placeholder.videoPlaceholder({ at: [1] });
        break;
      }
    }

    expect(editor.read.children()[1]).toMatchObject({
      mediaType,
      type: KEYS.placeholder,
    });
  });
});
