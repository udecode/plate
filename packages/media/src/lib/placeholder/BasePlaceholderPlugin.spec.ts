import { createSlateEditor, KEYS } from 'platejs';

import { BasePlaceholderPlugin } from './BasePlaceholderPlugin';

describe('BasePlaceholderPlugin', () => {
  it.each([
    ['audioPlaceholder', KEYS.audio],
    ['filePlaceholder', KEYS.file],
    ['imagePlaceholder', KEYS.img],
    ['videoPlaceholder', KEYS.video],
  ] as const)('configures %s and inserts %s placeholders', (transform, mediaType) => {
    const editor = createSlateEditor({
      plugins: [BasePlaceholderPlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BasePlaceholderPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });

    editor.tf.insert[transform]({ at: [1] });

    expect(editor.children[1]).toMatchObject({
      mediaType,
      type: KEYS.placeholder,
    });
  });

  it('exposes an inferred placeholder transaction group', () => {
    const editor = createSlateEditor({
      plugins: [BasePlaceholderPlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update((tx) => tx.placeholder.insert(KEYS.img, { at: [1] }));

    expect(editor.children[1]).toMatchObject({
      mediaType: KEYS.img,
      type: KEYS.placeholder,
    });
  });
});
