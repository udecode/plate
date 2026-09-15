import { act, render, renderHook } from '@testing-library/react';
import { memo } from 'react';

import { type NodeKey, NodeApi } from '../../src';
import { createEditor, EditorRoot, useNodeSelector } from '../../src/react';
import { ElementContext } from '../../src/react/context';
import { useEditorSelectorContext } from '../../src/react/hooks/use-editor-selector';

test('queries only registered path dependencies and retires queued callbacks', () => {
  const editor = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ],
  });
  const first = editor.key([0])!;
  const second = editor.key([1])!;
  editor.update.nodes.insert(
    { type: 'paragraph', children: [{ text: 'inserted' }] },
    { at: [1] }
  );
  const actual = editor.read.lastCommit()!;
  const nodeKeysAll = vi.fn(actual.changed.nodeKeysAll);
  const hasNodeKey = vi.fn(actual.changed.hasNodeKey);
  const commit = {
    ...actual,
    changed: { ...actual.changed, nodeKeysAll, hasNodeKey },
  };
  const hook = renderHook(useEditorSelectorContext);
  act(() => hook.result.current.onChange(commit));
  expect(nodeKeysAll).not.toHaveBeenCalled();
  expect(hasNodeKey).not.toHaveBeenCalled();

  const listener = vi.fn();
  const deferred = vi.fn();
  const unsubscribe = hook.result.current.selectorContext.addEventListener(
    listener,
    {
      nodeKeys: [first, second],
      runtimeEventSource: 'path',
      includeRootOrderChanges: true,
    }
  );
  const retire = hook.result.current.selectorContext.addEventListener(
    deferred,
    {
      deferred: true,
      nodeKey: second,
      runtimeEventSource: 'path',
    }
  );
  act(() => hook.result.current.onChange(commit));
  expect(nodeKeysAll).not.toHaveBeenCalled();
  expect(new Set(hasNodeKey.mock.calls.map(([key]) => key))).toEqual(
    new Set([first, second])
  );
  expect(listener).toHaveBeenCalledExactlyOnceWith(commit);
  retire();
  act(() => hook.result.current.selectorContext.flushDeferred());
  expect(deferred).not.toHaveBeenCalled();

  hasNodeKey.mockClear();
  editor.update.text.insert('!', { at: { path: [2, 0], offset: 6 } });
  const text = editor.read.lastCommit()!;
  act(() =>
    hook.result.current.onChange({
      ...text,
      changed: { ...text.changed, nodeKeysAll, hasNodeKey },
    })
  );
  expect(nodeKeysAll).not.toHaveBeenCalled();
  expect(hasNodeKey).not.toHaveBeenCalled();
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  hook.unmount();
});

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
    <EditorRoot editor={editor}>
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
    </EditorRoot>
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
        <EditorRoot editor={editor}>
          <ElementContext
            value={{
              element: { type: 'paragraph', children: [{ text: 'second' }] },
              nodeKey: secondKey,
              path: [1],
            }}
          >
            {children}
          </ElementContext>
        </EditorRoot>
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
