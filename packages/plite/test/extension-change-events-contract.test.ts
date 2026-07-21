import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineEditorExtension } from '@platejs/plite';

describe('extension change events', () => {
  it('notifies node changes from committed semantic intents', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'node-observer',
          onNodeChange(context) {
            events.push({
              kind: context.kind,
              node: context.node,
              path: context.path,
              previousPath: context.previousPath,
              prevNode: context.prevNode,
              root: context.root,
            });
          },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.nodes.set({ variant: 'lead' } as never, { at: [0] });

    assert.deepEqual(events, [
      {
        kind: 'update',
        node: {
          children: [{ text: 'hello' }],
          type: 'p',
          variant: 'lead',
        },
        path: [0],
        previousPath: [0],
        prevNode: {
          children: [{ text: 'hello' }],
          type: 'p',
        },
        root: undefined,
      },
    ]);
  });

  it('notifies text changes from committed semantic intents', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'text-observer',
          onTextChange(context) {
            events.push({
              node: context.node,
              path: context.path,
              previousPath: context.previousPath,
              prevText: context.prevText,
              root: context.root,
              text: context.text,
            });
          },
        }),
      ],
      initialSelection: {
        kind: 'text' as const,
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.text.insert('!');

    assert.deepEqual(events, [
      {
        node: {
          children: [{ text: 'hello!' }],
          type: 'p',
        },
        path: [0, 0],
        previousPath: [0, 0],
        prevText: 'hello',
        root: undefined,
        text: 'hello!',
      },
    ]);
  });
});
