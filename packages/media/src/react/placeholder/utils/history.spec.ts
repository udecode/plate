import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { updateUploadHistory } from './history';

describe('placeholder upload history', () => {
  it('rewrites placeholder insert history with the uploaded node payload', () => {
    const editor = createBaseEditor();

    editor.update.nodes.insert({
      id: 'placeholder-1',
      children: [{ text: '' }],
      type: KEYS.placeholder,
    });

    updateUploadHistory(editor, {
      id: 'media-1',
      children: [{ text: '' }],
      placeholderId: 'placeholder-1',
      type: 'img',
    });

    const operation = editor.read.history.undos()[0]?.operations[0];

    expect(operation).toMatchObject({
      type: 'insert_node',
      node: {
        children: [{ text: '' }],
        id: 'media-1',
        placeholderId: 'placeholder-1',
        type: 'img',
      },
    });
  });

  it('is a no-op when no matching placeholder history batch exists', () => {
    const emptyEditor = createBaseEditor();
    const otherEditor = createBaseEditor();

    otherEditor.update.nodes.insert({
      id: 'other-placeholder',
      children: [{ text: '' }],
      type: KEYS.placeholder,
    });

    for (const editor of [emptyEditor, otherEditor]) {
      expect(() =>
        updateUploadHistory(editor, {
          id: 'media-1',
          children: [{ text: '' }],
          placeholderId: 'placeholder-1',
          type: 'img',
        })
      ).not.toThrow();
    }

    expect(emptyEditor.read.history.undos()).toEqual([]);
    expect(otherEditor.read.history.undos()[0]?.operations[0]).toMatchObject({
      node: { id: 'other-placeholder' },
    });
  });
});
