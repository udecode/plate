import assert from 'node:assert/strict';

import { createEditor } from '@platejs/plite';
import { dom } from '@platejs/plite-dom';
import {
  DOMRootRuntime,
  EDITOR_TO_PENDING_SELECTION,
} from '@platejs/plite-dom/internal';
import {
  insertText as editorInsertText,
  replace as editorReplace,
} from '@platejs/plite/internal';
import { test } from 'vitest';

import { react } from '../src/plugin/with-react';

test('react clears pending selection before mounted-root Android insertText bridge calls', () => {
  const editor = createEditor({ extensions: [react({ dom: dom() })] });
  const runtime = new DOMRootRuntime({
    adapter: {},
    editor,
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => false,
    isComposing: () => false,
    onRepair: () => {},
    resolvePath: () => null,
    testRootFacts: { platform: 'android' },
  });
  const root = document.createElement('div');

  document.body.append(root);
  runtime.setRoot(root);
  runtime.connect();

  try {
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
  } finally {
    runtime.destroy();
    root.remove();
  }
});
