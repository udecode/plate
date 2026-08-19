import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineExtension,
  defineExtensionPoint,
  type EditorExtensionContribution,
} from '@platejs/plite';
import { getExtensionRegistry } from '@platejs/plite/internal';

describe('typed extension contributions', () => {
  it('aggregates descriptor-owned values in extension order', () => {
    const messages = defineExtensionPoint<string>('test:messages');
    const first = defineExtension('first-message', {
      contributions: [messages.of('first')],
    });
    const second = defineExtension('second-message', {
      contributions: [messages.of('second')],
    });
    const consumer = defineExtension('consumer', {
      api({ getContributions }) {
        const values = getContributions(messages);

        return { values: () => values };
      },
    });
    const editor = createEditor({
      extensions: [first, second, consumer] as const,
    });

    assert.deepEqual(editor.extension(consumer).api.values(), [
      'first',
      'second',
    ]);
  });

  it('keeps retained extension portals live across API recompilation', () => {
    const messages = defineExtensionPoint<string>('test:live-messages');
    const first = defineExtension('first-live-message', {
      contributions: [messages.of('first')],
    });
    const second = defineExtension('second-live-message', {
      contributions: [messages.of('second')],
    });
    const consumer = defineExtension('live-consumer', {
      api({ getContributions }) {
        const values = getContributions(messages);

        return { values: () => values };
      },
    });
    const editor = createEditor({ extensions: [first, consumer] });
    const view = createEditorView(editor);
    const portal = editor.extension(consumer);
    const viewPortal = view.extension(consumer);

    assert.deepEqual(portal.api.values(), ['first']);
    assert.equal(viewPortal.api, view.api['live-consumer']);
    const cleanup = editor.install(second);
    assert.deepEqual(portal.api.values(), ['first', 'second']);
    assert.deepEqual(viewPortal.api.values(), ['first', 'second']);
    assert.equal(viewPortal.api, view.api['live-consumer']);
    cleanup();
    assert.deepEqual(portal.api.values(), ['first']);
    assert.deepEqual(viewPortal.api.values(), ['first']);
  });

  it('rejects structurally spoofed contributions without publishing them', () => {
    const messages = defineExtensionPoint<string>('test:messages');
    const editor = createEditor();
    const spoofed = {
      point: messages,
    } as EditorExtensionContribution<string>;

    assert.throws(
      () =>
        editor.install(
          defineExtension('spoofed-output', {
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
        defineExtension('first-point', {
          contributions: [first.of('first')],
        }),
      ],
    });

    assert.throws(
      () =>
        editor.install(
          defineExtension('second-point', {
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
