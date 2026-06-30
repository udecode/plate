import type { Descendant, NodeOperation } from '@platejs/plite';

import { createBaseEditor } from '../editor';
import { type BasePlugin, createBasePlugin } from '../plugin';
import { pipeOnNodeChange } from './pipeOnNodeChange';

type OnNodeChange = NonNullable<
  NonNullable<BasePlugin['handlers']>['onNodeChange']
>;

const createNodeChangePlugin = (key: string, onNodeChange: OnNodeChange) =>
  createBasePlugin({
    handlers: { onNodeChange },
    key,
  });

const node: Descendant = { text: 'next' };
const prevNode: Descendant = { text: 'prev' };
const insertNodeOperation: NodeOperation = {
  node,
  path: [0],
  type: 'insert_node',
};

describe('pipeOnNodeChange', () => {
  it('skips handlers when the editor is read-only', () => {
    const onNodeChange = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createNodeChangePlugin('test', onNodeChange as unknown as OnNodeChange),
      ],
      readOnly: true,
    });

    onNodeChange.mockClear();

    expect(pipeOnNodeChange(editor, node, prevNode, insertNodeOperation)).toBe(
      false
    );
    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('continues until a handler returns true, then stops', () => {
    const first = mock(() => {});
    const second = mock(() => true);
    const third = mock(() => true);

    const editor = createBaseEditor({
      plugins: [
        createNodeChangePlugin('first', first as unknown as OnNodeChange),
        createNodeChangePlugin('second', second as unknown as OnNodeChange),
        createNodeChangePlugin('third', third as unknown as OnNodeChange),
      ],
    });

    first.mockClear();
    second.mockClear();
    third.mockClear();

    expect(pipeOnNodeChange(editor, node, prevNode, insertNodeOperation)).toBe(
      true
    );
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).not.toHaveBeenCalled();
    expect(second.mock.calls[0]?.[0]).toMatchObject({
      node,
      operation: insertNodeOperation,
      prevNode,
    });
  });
});
