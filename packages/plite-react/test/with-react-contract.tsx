import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEditor } from '@platejs/plite';
import {
  insertText as editorInsertText,
  replace as editorReplace,
} from '@platejs/plite/internal';
import { EDITOR_TO_PENDING_SELECTION } from '@platejs/plite-dom/internal';
import { react } from '../src/plugin/with-react';

const withNavigator = async (userAgent: string, run: () => Promise<void>) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userAgent },
  });

  try {
    await run();
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, 'navigator', descriptor);
    } else {
      (globalThis as { navigator?: Navigator }).navigator = undefined;
    }
  }
};

test('react() clears pending selection before Android insertText bridge calls', async () => {
  await withNavigator(
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36',
    async () => {
      const editor = createEditor({ extensions: [react()] });

      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 5 },
          focus: { path: [0, 0], offset: 5 },
        },
      });

      EDITOR_TO_PENDING_SELECTION.set(editor, {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      editor.update(() => {
        editorInsertText(editor, '!');
      });

      assert.equal(EDITOR_TO_PENDING_SELECTION.has(editor), false);
      assert.equal(
        (
          editor.read((state) => state.nodes.get([0, 0]))[0] as {
            text: string;
          }
        ).text,
        'alpha!'
      );
    }
  );
});
