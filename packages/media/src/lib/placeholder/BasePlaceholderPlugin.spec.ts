import { createSlateEditor, KEYS } from 'platejs';

import { BasePlaceholderPlugin } from './BasePlaceholderPlugin';

describe('BasePlaceholderPlugin', () => {
  it.each([
    ['audioPlaceholder', KEYS.audio],
    ['filePlaceholder', KEYS.file],
    ['imagePlaceholder', KEYS.img],
    ['videoPlaceholder', KEYS.video],
  ])('configures %s and inserts %s placeholders', (transform, mediaType) => {
    const editor = createSlateEditor({
      plugins: [BasePlaceholderPlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
    const plugin = editor.getPlugin(BasePlaceholderPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });

    (editor.tf as any).insert[transform]({ at: [1] });

    expect(editor.children[1]).toMatchObject({
      mediaType,
      type: KEYS.placeholder,
    });
  });
});
