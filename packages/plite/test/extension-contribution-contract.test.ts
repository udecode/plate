import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorExtension,
  defineExtensionPoint,
  type EditorExtensionContribution,
} from '@platejs/plite';
import { getExtensionRegistry } from '@platejs/plite/internal';

describe('typed extension contributions', () => {
  it('aggregates descriptor-owned values in extension order', () => {
    const messages = defineExtensionPoint<string>('test:messages');
    const first = defineEditorExtension({
      name: 'first-message',
      contributions: [messages.of('first')],
    });
    const second = defineEditorExtension({
      name: 'second-message',
      contributions: [messages.of('second')],
    });
    const consumer = defineEditorExtension({
      api(_editor, context) {
        const values = context.getContributions(messages);

        return { consumer: { values: () => values } };
      },
      name: 'consumer',
    });
    const editor = createEditor({
      extensions: [first, second, consumer] as const,
    });

    assert.deepEqual(editor.getApi(consumer).values(), ['first', 'second']);
  });

  it('rejects structurally spoofed contributions without publishing them', () => {
    const messages = defineExtensionPoint<string>('test:messages');
    const editor = createEditor();
    const spoofed = {
      point: messages,
    } as EditorExtensionContribution<string>;

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            name: 'spoofed-output',
            contributions: [spoofed],
          })
        ),
      /was not created by its point/
    );
    assert.equal(
      getExtensionRegistry(editor).extensions.has('spoofed-output'),
      false
    );
  });

  it('rejects duplicate point ids with different descriptor identities', () => {
    const first = defineExtensionPoint<string>('test:duplicate-point');
    const second = defineExtensionPoint<string>('test:duplicate-point');
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'first-point',
          contributions: [first.of('first')],
        }),
      ],
    });

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            name: 'second-point',
            contributions: [second.of('second')],
          })
        ),
      /cannot install multiple descriptor identities/
    );
    assert.equal(
      getExtensionRegistry(editor).extensions.has('second-point'),
      false
    );
  });
});
