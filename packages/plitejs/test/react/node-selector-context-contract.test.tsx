import { act, render, renderHook } from '@testing-library/react';
import { memo } from 'react';

import { type NodeKey, NodeApi } from '../../src';
import { createEditor, Plite, useNodeSelector } from '../../src/react';
import { ElementContext } from '../../src/react/context';

test('an explicit node selector ignores unrelated parent context changes', async () => {
  const editor = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ],
  });
  const firstKey = editor.key([0])!;
  const secondKey = editor.key([1])!;
  const rendered: string[] = [];
  const Explicit = memo(() => {
    const selectedNode = useNodeSelector(({ node }) => node, undefined, {
      nodeKey: firstKey,
    });
    const text = selectedNode ? NodeApi.string(selectedNode) : '';
    rendered.push(String(text));
    return <span data-testid="explicit">{String(text)}</span>;
  });
  const Inherited = memo(() => {
    const selectedPath = useNodeSelector(({ path }) => path);
    return <span data-testid="inherited">{selectedPath?.join(',')}</span>;
  });
  const tree = (useSecond: boolean) => (
    <Plite editor={editor}>
      <ElementContext
        value={{
          element: { type: 'paragraph', children: [{ text: 'context' }] },
          nodeKey: useSecond ? secondKey : firstKey,
          path: [useSecond ? 1 : 0],
        }}
      >
        <Explicit />
        <Inherited />
      </ElementContext>
    </Plite>
  );
  const mounted = render(tree(false));
  const initialCount = rendered.length;

  mounted.rerender(tree(true));

  expect(mounted.getByTestId('inherited')).toHaveTextContent('1');
  expect(mounted.getByTestId('explicit')).toHaveTextContent('first');
  expect(rendered).toHaveLength(initialCount);

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
    });
  });

  expect(mounted.getByTestId('explicit')).toHaveTextContent('first!');
  expect(rendered.length).toBeGreaterThan(initialCount);
  mounted.unmount();
});

test('a node selector can switch between explicit and inherited nodes', () => {
  const editor = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ],
  });
  const firstKey = editor.key([0])!;
  const secondKey = editor.key([1])!;
  const initialProps: { nodeKey: NodeKey | null | undefined } = {
    nodeKey: firstKey,
  };
  const { result, rerender } = renderHook(
    ({ nodeKey }: { nodeKey: NodeKey | null | undefined }) =>
      useNodeSelector(({ path }) => path, undefined, { nodeKey }),
    {
      initialProps,
      wrapper: ({ children }) => (
        <Plite editor={editor}>
          <ElementContext
            value={{
              element: { type: 'paragraph', children: [{ text: 'second' }] },
              nodeKey: secondKey,
              path: [1],
            }}
          >
            {children}
          </ElementContext>
        </Plite>
      ),
    }
  );

  expect(result.current).toEqual([0]);
  rerender({ nodeKey: null });
  expect(result.current).toEqual([1]);
  rerender({ nodeKey: firstKey });
  expect(result.current).toEqual([0]);
  rerender({ nodeKey: undefined });
  expect(result.current).toEqual([1]);
});
