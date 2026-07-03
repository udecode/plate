import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineEditorExtension } from '@platejs/plite';

describe('extension change events', () => {
  it('notifies node changes from committed node operations', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'node-observer',
          onNodeChange(context) {
            events.push({
              node: context.node,
              operation: context.operation,
              prevNode: context.prevNode,
            });
          },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.nodes.set({ variant: 'lead' } as never, { at: [0] });

    assert.deepEqual(events, [
      {
        node: {
          children: [{ text: 'hello' }],
          type: 'p',
          variant: 'lead',
        },
        operation: {
          newProperties: { variant: 'lead' },
          path: [0],
          properties: {},
          type: 'set_node',
        },
        prevNode: {
          children: [{ text: 'hello' }],
          type: 'p',
        },
      },
    ]);
  });

  it('notifies text changes from committed text operations', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'text-observer',
          onTextChange(context) {
            events.push({
              node: context.node,
              operation: context.operation,
              prevText: context.prevText,
              text: context.text,
            });
          },
        }),
      ],
      initialSelection: {
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
        operation: {
          offset: 5,
          path: [0, 0],
          text: '!',
          type: 'insert_text',
        },
        prevText: 'hello',
        text: 'hello!',
      },
    ]);
  });
});
