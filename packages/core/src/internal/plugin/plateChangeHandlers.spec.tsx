/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { property, schema, target } from '@platejs/plite';

jsxt;

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';

describe('plate change handlers', () => {
  it('dispatches node change handlers from Plite node change events', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = createBasePlugin({
      handlers: { onNodeChange },
      key: 'nodeObserver',
      schema: {
        properties: [
          schema.elementProperty('variant', property.string(), {
            target: target.type('p'),
          }),
        ],
      },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    editor.update.nodes.set({ variant: 'lead' } as any, { at: [0] });

    expect(onNodeChange).toHaveBeenCalledTimes(1);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello' }],
        type: 'p',
        variant: 'lead',
      },
      prevNode: {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    });
  });

  it('dispatches inserted and removed node payloads', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = createBasePlugin({
      handlers: { onNodeChange },
      key: 'nodeObserver',
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    editor.update.nodes.insert(
      { children: [{ text: 'inserted' }], type: 'p' },
      { at: [1] }
    );
    editor.update.nodes.remove({ at: [1] });

    expect(onNodeChange).toHaveBeenCalledTimes(2);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      kind: 'insert',
      node: {
        children: [{ text: 'inserted' }],
        type: 'p',
      },
      path: [1],
      previousPath: null,
      prevNode: null,
    });
    expect(onNodeChange.mock.calls[1]?.[0]).toMatchObject({
      kind: 'remove',
      node: null,
      path: [1],
      previousPath: [1],
      prevNode: {
        children: [{ text: 'inserted' }],
        type: 'p',
      },
    });
  });

  it('does not dispatch node handlers for text intents', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = createBasePlugin({
      handlers: { onNodeChange },
      key: 'nodeObserver',
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    editor.update.text.insert('!');

    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('dispatches text change handlers from Plite text change events', () => {
    const onTextChange = mock();
    const TextObserverPlugin = createBasePlugin({
      handlers: { onTextChange },
      key: 'textObserver',
    });
    const editor = createBaseEditor({
      plugins: [TextObserverPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onTextChange.mockClear();

    editor.update.text.insert('!');

    expect(onTextChange).toHaveBeenCalledTimes(1);
    expect(onTextChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello!' }],
        type: 'p',
      },
      prevText: 'hello',
      text: 'hello!',
    });
  });
});
