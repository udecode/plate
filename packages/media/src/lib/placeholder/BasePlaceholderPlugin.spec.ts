import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

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

  it.each([
    KEYS.audio,
    KEYS.file,
    KEYS.img,
    KEYS.video,
  ])('inserts a %s placeholder through the flat scoped update', (mediaType) => {
    const editor = createBaseEditor({
      plugins: [BasePlaceholderPlugin],
      initialValue: [{ children: [{ text: 'one' }], type: KEYS.p }],
    });

    editor.plugin(BasePlaceholderPlugin).update.insert(mediaType, { at: [1] });

    expect(editor.read.children()[1]).toMatchObject({
      mediaType,
      type: KEYS.placeholder,
    });
  });

  it('supports grouped transaction insertion', () => {
    const editor = createBaseEditor({
      plugins: [BasePlaceholderPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update((tx) => {
      tx.placeholder.insert(KEYS.img, { at: [1] });
    });

    expect(editor.read.children()[1]).toEqual({
      children: [{ text: '' }],
      mediaType: KEYS.img,
      type: KEYS.placeholder,
    });
  });
});
