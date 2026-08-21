import { createBaseEditor } from '@platejs/core';

import { BasePlaceholderPlugin } from './BasePlaceholderPlugin';

describe('BasePlaceholderPlugin', () => {
  it('configures block void placeholders', () => {
    const editor = createBaseEditor({
      plugins: [BasePlaceholderPlugin],
    });

    expect(
      editor.read.schema.element(BasePlaceholderPlugin)?.behavior.void
    ).toBe(true);
    expect(
      editor.read.schema.element(BasePlaceholderPlugin)?.behavior.voidKind
    ).toBe('block');
    expect(editor.read.schema.element(BasePlaceholderPlugin)?.groups).toContain(
      'block'
    );
  });

  it.each(['audio', 'file', 'image', 'video'])(
    'inserts a %s placeholder through the flat scoped update',
    (mediaType) => {
      const editor = createBaseEditor({
        plugins: [BasePlaceholderPlugin],
        initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
      });

      editor
        .plugin(BasePlaceholderPlugin)
        .update.insert({ mediaType }, { at: [1] });

      expect(editor.read.children()[1]).toMatchObject({
        mediaType,
        type: 'placeholder',
      });
    }
  );
});
