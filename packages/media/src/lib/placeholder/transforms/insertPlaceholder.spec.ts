import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BasePlaceholderPlugin } from '../BasePlaceholderPlugin';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertPlaceholder,
  insertVideoPlaceholder,
} from './insertPlaceholder';

describe('insertPlaceholder', () => {
  it('inserts a placeholder through the transaction boundary', () => {
    const editor = createBaseEditor({
      plugins: [BasePlaceholderPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update((tx) =>
      insertPlaceholder(tx, KEYS.img, KEYS.placeholder, { at: [1] })
    );

    expect(editor.read.children()[1]).toEqual({
      children: [{ text: '' }],
      mediaType: KEYS.img,
      type: KEYS.placeholder,
    });
  });

  it('uses the expected media type helpers', () => {
    const editor = createBaseEditor({
      plugins: [BasePlaceholderPlugin],
    });

    editor.update((tx) => {
      insertImagePlaceholder(tx, KEYS.placeholder, { at: [0] });
      insertVideoPlaceholder(tx, KEYS.placeholder, { at: [1] });
      insertAudioPlaceholder(tx, KEYS.placeholder, { at: [2] });
      insertFilePlaceholder(tx, KEYS.placeholder, { at: [3] });
    });

    expect(
      editor.read
        .children()
        .map((node) => ('mediaType' in node ? node.mediaType : undefined))
    ).toEqual([KEYS.img, KEYS.video, KEYS.audio, KEYS.file]);
  });
});
