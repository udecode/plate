/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

jsxt;

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';

describe('plate change handlers', () => {
  it('dispatches node change handlers from Plite node change events', () => {
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

    editor.update.nodes.set({ variant: 'lead' } as any, { at: [0] });

    expect(onNodeChange).toHaveBeenCalledTimes(1);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello' }],
        type: 'p',
        variant: 'lead',
      },
      operation: {
        path: [0],
        type: 'set_node',
      },
      prevNode: {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    });
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
      operation: {
        offset: 5,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
      prevText: 'hello',
      text: 'hello!',
    });
  });
});
