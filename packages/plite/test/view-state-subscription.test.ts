import { describe, expect, test } from 'bun:test';

import { createEditor, setEditorReadOnly } from '@platejs/plite';
import {
  setEditorComposing,
  setEditorFocused,
  subscribeEditorViewState,
} from '@platejs/plite/internal';

const value = [{ children: [{ text: '' }], type: 'paragraph' }];

describe('editor view state subscription', () => {
  test('notifies read-only, composing, and focus changes', async () => {
    const editor = createEditor({ initialValue: value });
    let notifications = 0;

    const unsubscribe = subscribeEditorViewState(editor, () => {
      notifications += 1;
    });

    setEditorReadOnly(editor, true);
    setEditorComposing(editor, true);
    setEditorFocused(editor, true);

    await Promise.resolve();

    expect(notifications).toBe(3);
    expect(editor.read.view.isReadOnly()).toBe(true);
    expect(editor.read.view.isComposing()).toBe(true);
    expect(editor.read.view.isFocused()).toBe(true);

    setEditorReadOnly(editor, true);
    setEditorComposing(editor, true);
    setEditorFocused(editor, true);

    await Promise.resolve();

    expect(notifications).toBe(3);

    unsubscribe();
    setEditorReadOnly(editor, false);

    await Promise.resolve();

    expect(notifications).toBe(3);
  });
});
