import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  definePlugin,
  definePluginPoint,
  type PluginContribution,
} from 'plitejs';

import { getPluginRegistry } from '../src/internal';

describe('typed plugin contributions', () => {
  it('aggregates descriptor-owned values in plugin order', () => {
    const messages = definePluginPoint<string>('test:messages');
    const first = definePlugin('first-message', {
      contributions: [messages.of('first')],
    });
    const second = definePlugin('second-message', {
      contributions: [messages.of('second')],
    });
    const consumer = definePlugin('consumer', {
      api({ getContributions }) {
        const values = getContributions(messages);

        return { values: () => values };
      },
    });
    const editor = createEditor({
      plugins: [first, second, consumer] as const,
    });

    assert.deepEqual(editor.plugin(consumer).api.values(), ['first', 'second']);
  });

  it('keeps retained plugin portals live across API recompilation', () => {
    const messages = definePluginPoint<string>('test:live-messages');
    const first = definePlugin('first-live-message', {
      contributions: [messages.of('first')],
    });
    const second = definePlugin('second-live-message', {
      contributions: [messages.of('second')],
    });
    const consumer = definePlugin('live-consumer', {
      api({ getContributions }) {
        const values = getContributions(messages);

        return { values: () => values };
      },
    });
    const editor = createEditor({ plugins: [first, consumer] });
    const view = createEditorView(editor);
    const portal = editor.plugin(consumer);
    const viewPortal = view.plugin(consumer);

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
    const messages = definePluginPoint<string>('test:messages');
    const editor = createEditor();
    const spoofed = {
      point: messages,
    } as PluginContribution<string>;

    assert.throws(
      () =>
        editor.install(
          definePlugin('spoofed-output', {
            contributions: [spoofed],
          })
        ),
      /was not created by its point/
    );
    assert.equal(
      getPluginRegistry(editor).plugins.has('spoofed-output'),
      false
    );
  });

  it('rejects duplicate point ids with different descriptor identities', () => {
    const first = definePluginPoint<string>('test:duplicate-point');
    const second = definePluginPoint<string>('test:duplicate-point');
    const editor = createEditor({
      plugins: [
        definePlugin('first-point', {
          contributions: [first.of('first')],
        }),
      ],
    });

    assert.throws(
      () =>
        editor.install(
          definePlugin('second-point', {
            contributions: [second.of('second')],
          })
        ),
      /cannot install multiple descriptor identities/
    );
    assert.equal(getPluginRegistry(editor).plugins.has('second-point'), false);
  });
});
