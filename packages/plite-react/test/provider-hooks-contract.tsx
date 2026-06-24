import { readFileSync } from 'node:fs';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import _ from 'lodash';
import { Component, type ReactNode, useLayoutEffect } from 'react';
import {
  type EditorCommit,
  type Operation,
  type RuntimeId,
  TextApi,
} from '@platejs/plite';
import {
  getLastCommit as editorGetLastCommit,
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  isEditor as editorIsEditor,
  moveNodes as editorMoveNodes,
  replace as editorReplace,
} from '@platejs/plite/internal';
import {
  createReactEditor,
  Editable,
  Plite,
  useEditor,
  useEditorSelector,
  useEditorState,
  useElementPath,
  useNodeSelector,
  usePliteEditor,
  useTextSelector,
} from '../src';
import { NodeRuntimeIdContext } from '../src/context';
import {
  usePlaceholderValue,
  useRootRuntimeIds,
  useTopLevelSelectionIndex,
} from '../src/editable/root-selector-sources';
import {
  useMountedNodeRenderSelector,
  useMountedTextRenderSelector,
} from '../src/hooks/use-node-selector';
import { createPliteReactRenderCounter } from '../src/render-profiler';

const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];

class SelectorErrorBoundary extends Component<
  {
    children: ReactNode;
    onError: (error: Error) => void;
  },
  { error: Error | null }
> {
  state = { error: null };

  componentDidCatch(error: Error) {
    this.props.onError(error);
    this.setState({ error });
  }

  render() {
    return this.state.error ? (
      <span data-testid="selector-error">{this.state.error.message}</span>
    ) : (
      this.props.children
    );
  }
}

describe('plite-react provider hooks contract', () => {
  test('providers read operation counts without cloning operation payloads', () => {
    const pliteSource = readFileSync('src/components/plite.tsx', 'utf8');
    const runtimeSource = readFileSync(
      'src/hooks/use-plite-runtime.tsx',
      'utf8'
    );

    expect(pliteSource).toContain('getOperationCount(editor)');
    expect(runtimeSource).toContain('getOperationCount(runtime.editor)');
    expect(pliteSource).not.toContain('value.operations().length');
    expect(runtimeSource).not.toContain('value.operations().length');
  });

  test('usePliteEditor creates a React editor with initialized value', () => {
    const { result } = renderHook(() =>
      usePliteEditor({
        initialValue,
      })
    );

    expect(result.current.read((state) => state.value.get())).toEqual({
      children: initialValue,
    });
    expect(result.current.read((state) => state.value.operations())).toEqual(
      []
    );
    expect(result.current.read((state) => state.value.lastCommit())).toBe(null);
  });

  test('useEditor updates when the provider editor changes', () => {
    const editorA = createReactEditor({ initialValue });
    const editorB = createReactEditor({ initialValue });
    const seen: unknown[] = [];

    const ShowStaticEditor = () => {
      const editor = useEditor();
      seen.push(editor);
      return (
        <span data-testid="static-editor">
          {editor === editorB ? 'B' : 'A'}
        </span>
      );
    };

    const rendered = render(
      <Plite editor={editorA}>
        <Editable />
        <ShowStaticEditor />
      </Plite>
    );

    expect(rendered.getByTestId('static-editor')).toHaveTextContent('A');
    expect(seen.at(-1)).toBe(editorA);

    rendered.rerender(
      <Plite editor={editorB}>
        <Editable />
        <ShowStaticEditor />
      </Plite>
    );

    expect(rendered.getByTestId('static-editor')).toHaveTextContent('B');
    expect(seen.at(-1)).toBe(editorB);
  });

  test('Plite publishes editor commits from child mount layout effects', () => {
    const editor = createReactEditor({ initialValue });
    const onChange = jest.fn();
    const onValueChange = jest.fn();
    const shouldUpdate = jest.fn(() => true);
    const selector = jest.fn((nextEditor: typeof editor) =>
      nextEditor.read((state) => {
        const [firstBlock] = state.nodes.children() as {
          children: { text: string }[];
        }[];

        return firstBlock?.children[0]?.text ?? '';
      })
    );

    const ProbeAndCommit = () => {
      const mountedEditor = useEditor<typeof editor>();
      const text = useEditorSelector(selector, Object.is, { shouldUpdate });

      useLayoutEffect(() => {
        mountedEditor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      }, [mountedEditor]);

      return <span data-testid="selector-text">{text}</span>;
    };

    const rendered = render(
      <Plite editor={editor} onChange={onChange} onValueChange={onValueChange}>
        <Editable />
        <ProbeAndCommit />
      </Plite>
    );

    expect(rendered.getByTestId('selector-text')).toHaveTextContent('test!');
    expect(onChange).toHaveBeenCalledWith(
      [{ type: 'block', children: [{ text: 'test!' }] }],
      expect.objectContaining({
        operations: [expect.objectContaining({ type: 'insert_text' })],
        valueChanged: true,
      })
    );
    expect(onValueChange).toHaveBeenCalledWith(
      [{ type: 'block', children: [{ text: 'test!' }] }],
      expect.objectContaining({ valueChanged: true })
    );
    expect(
      shouldUpdate.mock.calls.some(([, change]) =>
        change?.operations.some((operation) => operation.type === 'insert_text')
      )
    ).toBe(true);
  });

  test('useEditorSelector honors the equality function when selector identity changes', async () => {
    const editor = createReactEditor({ initialValue });
    const callback1 = jest.fn(() => []);
    const callback2 = jest.fn(() => []);

    const { result, rerender } = renderHook(
      ({ callback }) => useEditorSelector(callback, _.isEqual),
      {
        initialProps: { callback: callback1 },
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(callback1).toBeCalledTimes(2);

    const firstResult = result.current;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(callback1).toBeCalledTimes(3);
    expect(firstResult).toBe(result.current);

    rerender({ callback: callback2 });

    expect(callback1).toBeCalledTimes(3);
    expect(callback2).toBeCalledTimes(1);
    expect(firstResult).toBe(result.current);
  });

  test('useEditorSelector replays subscription errors during render with context', async () => {
    const editor = createReactEditor({ initialValue });
    const initialVersion = editorGetLastCommit(editor)?.version ?? 0;
    const onError = jest.fn();
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const ThrowingSelector = () => {
      const version = useEditorSelector((nextEditor) => {
        const nextVersion = editorGetLastCommit(nextEditor)?.version ?? 0;

        if (nextVersion > initialVersion) {
          throw new Error('selector exploded');
        }

        return nextVersion;
      }, Object.is);

      return <span data-testid="selector-version">{version}</span>;
    };

    try {
      const rendered = render(
        <Plite editor={editor}>
          <Editable />
          <SelectorErrorBoundary onError={onError}>
            <ThrowingSelector />
          </SelectorErrorBoundary>
        </Plite>
      );

      expect(rendered.getByTestId('selector-version')).toHaveTextContent(
        String(initialVersion)
      );

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      });

      await waitFor(() => {
        expect(onError).toBeCalled();
      });

      const replayedError = onError.mock.calls.at(-1)?.[0] as Error;
      expect(replayedError.message).toContain('selector exploded');
      expect(replayedError.message).toContain(
        'The error may be correlated with this previous error'
      );
      expect(rendered.getByTestId('selector-error')).toHaveTextContent(
        'selector exploded'
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  test('useEditorSelector passes commit operations into selector updates', async () => {
    const editor = createReactEditor({ initialValue });
    const seenOperations: (readonly Operation[] | undefined)[] = [];
    const selector = jest.fn((_editor, operations?: readonly Operation[]) => {
      seenOperations.push(operations);

      return operations?.map((operation) => operation.type).join(',') ?? 'idle';
    });

    const { result } = renderHook(
      () => useEditorSelector(selector, Object.is),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('idle');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(result.current).toBe('insert_text');
    expect(seenOperations.at(-1)?.map((operation) => operation.type)).toEqual([
      'insert_text',
    ]);
  });

  test('deferred useEditorSelector passes commit operations into selector updates', async () => {
    const editor = createReactEditor({ initialValue });
    const seenOperations: (readonly Operation[] | undefined)[] = [];
    const selector = jest.fn((_editor, operations?: readonly Operation[]) => {
      seenOperations.push(operations);

      return operations?.map((operation) => operation.type).join(',') ?? 'idle';
    });

    const { result } = renderHook(
      () =>
        useEditorSelector(selector, Object.is, {
          deferred: true,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('idle');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
      editor.update((tx) => {
        tx.text.insert('?', { at: { path: [0, 0], offset: 5 } });
      });
    });

    expect(result.current).toBe('insert_text,insert_text');
    expect(seenOperations.at(-1)?.map((operation) => operation.type)).toEqual([
      'insert_text',
      'insert_text',
    ]);
  });

  test('deferred useEditorSelector cancels queued updates on unmount', async () => {
    const editor = createReactEditor({ initialValue });
    const selector = jest.fn(
      (_editor, operations?: readonly Operation[]) =>
        operations?.map((operation) => operation.type).join(',') ?? 'idle'
    );

    const rendered = renderHook(
      () =>
        useEditorSelector(selector, Object.is, {
          deferred: true,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(rendered.result.current).toBe('idle');
    expect(selector).toBeCalledTimes(2);

    act(() => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
      rendered.unmount();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(selector).toBeCalledTimes(2);
  });

  test('deferred editor selectors preserve profiler markers while coalescing renders', async () => {
    const editor = createReactEditor({ initialValue });
    const selector = jest.fn(() => editorGetLastCommit(editor)?.version ?? 0);
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      const { result } = renderHook(
        () =>
          useEditorSelector(selector, Object.is, {
            deferred: true,
            profileId: 'deferred-proof',
          }),
        {
          wrapper: ({ children }) => (
            <Plite editor={editor}>
              <Editable />
              {children}
            </Plite>
          ),
        }
      );

      expect(selector).toBeCalledTimes(2);
      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
        editor.update((tx) => {
          tx.text.insert('?', { at: { path: [0, 0], offset: 5 } });
        });

        expect(selector).toBeCalledTimes(2);
      });

      expect(selector).toBeCalledTimes(3);
      expect(result.current).toBe(editorGetLastCommit(editor)?.version);

      const profile = counter.snapshot();
      expect(profile.byKey['selector:selector-deferred-proof-check']).toBe(2);
      expect(profile.byKey['selector:selector-deferred-proof-notify']).toBe(2);
    } finally {
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('useEditorSelector passes commit facts to shouldUpdate', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });

    const targetRuntimeId = editorGetSnapshot(editor).index.pathToId['1.0'];
    const selector = jest.fn(() => editorGetLastCommit(editor)?.version ?? 0);
    const shouldUpdate = jest.fn(
      (_operations?: readonly Operation[], change?: EditorCommit) =>
        Boolean(
          change?.selectionImpactRuntimeIds?.includes(targetRuntimeId ?? '')
        )
    );
    const initialVersion = editorGetLastCommit(editor)?.version ?? 0;

    const { result } = renderHook(
      () => useEditorSelector(selector, undefined, { shouldUpdate }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(selector).toBeCalledTimes(2);
    expect(result.current).toBe(initialVersion);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 0 });
      });
    });

    expect(shouldUpdate).toBeCalled();
    expect(selector).toBeCalledTimes(2);
    expect(result.current).toBe(initialVersion);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [1, 0], offset: 0 });
      });
    });

    expect(selector).toBeCalledTimes(3);
    expect(result.current).toBe(editorGetLastCommit(editor)?.version);
  });

  test('useEditorState reads through editor.read and filters by commit facts', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const blockRuntimeId = snapshot.index.pathToId['0'];
    const textRuntimeId = snapshot.index.pathToId['0.0'];
    const selector = jest.fn((state) => state.selection.get());
    const seenChanges: EditorCommit[] = [];
    const shouldUpdate = jest.fn((change?: EditorCommit) => {
      if (change) {
        seenChanges.push(change);
      }

      return Boolean(change?.selectionChanged);
    });

    const { result } = renderHook(
      () => useEditorState(selector, { shouldUpdate }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(selector).toBeCalledTimes(2);
    expect(result.current).toBe(null);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
      });
    });

    expect(shouldUpdate).toBeCalled();
    expect(selector).toBeCalledTimes(2);
    expect(result.current).toBe(null);
    expect(seenChanges.at(-1)?.dirtyTextRuntimeIds).toEqual([textRuntimeId]);
    expect(seenChanges.at(-1)?.dirtyElementRuntimeIds).toEqual([
      blockRuntimeId,
    ]);
    expect(seenChanges.at(-1)?.dirtyTopLevelRuntimeIds).toEqual([
      blockRuntimeId,
    ]);
    expect(seenChanges.at(-1)?.dirtyTopLevelRanges).toEqual([[0, 0]]);
    expect(seenChanges.at(-1)?.rootRuntimeIdsChanged).toBe(false);
    expect(seenChanges.at(-1)?.topLevelOrderChanged).toBe(false);
    expect(seenChanges.at(-1)?.fullDocumentChanged).toBe(false);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [1, 0], offset: 1 });
      });
    });

    expect(selector).toBeCalledTimes(3);
    expect(result.current).toEqual({
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  test('runtime selector hooks skip unrelated runtime id commits', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const blockRuntimeId = snapshot.index.pathToId['0'];
    const textRuntimeId = snapshot.index.pathToId['0.0'];

    if (!blockRuntimeId || !textRuntimeId) {
      throw new Error('Expected runtime ids for selector contract');
    }

    const nodeSelector = jest.fn(({ node }) =>
      node && 'children' in node && 'text' in node.children[0]
        ? node.children[0].text
        : null
    );
    const textSelector = jest.fn(({ text }) => text?.text ?? null);

    const { result } = renderHook(
      () => ({
        nodeText: useNodeSelector(nodeSelector, undefined, {
          runtimeId: blockRuntimeId,
        }),
        text: useTextSelector(textSelector, undefined, {
          runtimeId: textRuntimeId,
        }),
      }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toEqual({ nodeText: 'one', text: 'one' });
    expect(nodeSelector).toBeCalledTimes(2);
    expect(textSelector).toBeCalledTimes(2);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [1, 0], offset: 3 } });
      });
    });

    expect(result.current).toEqual({ nodeText: 'one', text: 'one' });
    expect(nodeSelector).toBeCalledTimes(2);
    expect(textSelector).toBeCalledTimes(2);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
      });
    });

    expect(result.current).toEqual({ nodeText: 'one!', text: 'one!' });
    expect(nodeSelector).toBeCalledTimes(3);
    expect(textSelector).toBeCalledTimes(3);
  });

  test('runtime selector listeners do not fan out to unrelated runtime ids', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstBlockRuntimeId = snapshot.index.pathToId['0'];
    const secondTextRuntimeId = snapshot.index.pathToId['1.0'];

    if (!firstBlockRuntimeId || !secondTextRuntimeId) {
      throw new Error('Expected runtime ids for listener fanout contract');
    }

    const selector = jest.fn(() => editorGetLastCommit(editor)?.version ?? 0);
    const shouldUpdate = jest.fn(() => true);
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      const { result } = renderHook(
        () =>
          useEditorSelector(selector, undefined, {
            runtimeId: firstBlockRuntimeId,
            shouldUpdate,
          }),
        {
          wrapper: ({ children }) => (
            <Plite editor={editor}>
              <Editable />
              {children}
            </Plite>
          ),
        }
      );

      const initialVersion = result.current;
      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [1, 0], offset: 3 } });
        });
      });

      expect(result.current).toBe(initialVersion);
      expect(shouldUpdate).not.toBeCalled();
      expect(
        counter
          .snapshot()
          .events.filter(
            (event) =>
              event.id === 'selector-runtime-check' &&
              event.runtimeId === firstBlockRuntimeId
          )
      ).toHaveLength(0);

      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
        });
      });

      const profile = counter.snapshot();
      const targetSelectorEvents = profile.events.filter(
        (event) => event.runtimeId === firstBlockRuntimeId
      );

      expect(shouldUpdate).toBeCalledTimes(1);
      expect(result.current).toBe(editorGetLastCommit(editor)?.version);
      expect(
        targetSelectorEvents.filter(
          (event) => event.id === 'selector-runtime-check'
        )
      ).not.toHaveLength(0);
      expect(
        targetSelectorEvents.filter(
          (event) => event.id === 'selector-runtime-notify'
        )
      ).not.toHaveLength(0);
    } finally {
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('runtime selector listeners update touched nodes during top-level splits', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'block',
          children: [{ text: 'Hello ' }, { bold: true, text: 'world' }],
        },
      ],
    });
    const runtimeId = editorGetRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for top-level split contract');
    }

    const selector = jest.fn(({ node }) =>
      node && 'children' in node
        ? node.children
            .map((child) => (TextApi.isText(child) ? child.text : ''))
            .join('')
        : null
    );

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('Hello world');

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 1], offset: 0 });
      });
      editorInsertBreak(editor);
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe('Hello ');
  });

  test('runtime selector listeners update shifted siblings during top-level splits', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'block',
          children: [{ text: 'Hello world' }],
        },
        { type: 'block', children: [{ text: 'sibling' }] },
      ],
    });
    const siblingRuntimeId = editorGetRuntimeId(editor, [1]);

    if (!siblingRuntimeId) {
      throw new Error('Expected runtime id for shifted split sibling contract');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId: siblingRuntimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('1');

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 5 });
      });
      editorInsertBreak(editor);
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe('2');
  });

  test('runtime selector listeners update moved top-level runtime paths', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'first' }] },
        { type: 'block', children: [{ text: 'target' }] },
      ],
    });
    const runtimeId = editorGetRuntimeId(editor, [1]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for top-level move contract');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('1');

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [1], to: [0] });
      });
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe('0');
  });

  test('runtime selector listeners update runtime paths moved into a top-level position', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'block',
          children: [
            {
              type: 'block',
              children: [{ text: 'target' }],
            },
          ],
        },
        { type: 'block', children: [{ text: 'sibling' }] },
      ],
    });
    const runtimeId = editorGetRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for nested-to-top-level move');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('0.0');

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [0, 0], to: [1] });
      });
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe('1');
  });

  test('runtime selector listeners update source parents when nested nodes move into a top-level position', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'block',
          children: [
            {
              type: 'block',
              children: [{ text: 'target' }],
            },
            {
              type: 'block',
              children: [{ text: 'survivor' }],
            },
          ],
        },
        { type: 'block', children: [{ text: 'sibling' }] },
      ],
    });
    const sourceParentRuntimeId = editorGetRuntimeId(editor, [0]);

    if (!sourceParentRuntimeId) {
      throw new Error('Expected source parent runtime id for nested move');
    }

    const selector = jest.fn(({ node }) =>
      node && 'children' in node ? node.children.length : null
    );

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId: sourceParentRuntimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe(2);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [0, 0], to: [2] });
      });
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe(1);
  });

  test('runtime selector listeners update runtime paths moved out of a top-level position', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'target' }] },
        {
          type: 'block',
          children: [
            {
              type: 'block',
              children: [{ text: 'nested sibling' }],
            },
          ],
        },
      ],
    });
    const runtimeId = editorGetRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for top-level-to-nested move');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('0');

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [0], to: [1, 0] });
      });
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe('0.0');
  });

  test('runtime selector listeners update destination parents when top-level nodes move into nested positions', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'block',
          children: [
            {
              type: 'block',
              children: [{ text: 'nested sibling' }],
            },
          ],
        },
        { type: 'block', children: [{ text: 'middle' }] },
        { type: 'block', children: [{ text: 'target' }] },
      ],
    });
    const destinationParentRuntimeId = editorGetRuntimeId(editor, [0]);

    if (!destinationParentRuntimeId) {
      throw new Error('Expected destination parent runtime id for nested move');
    }

    const selector = jest.fn(({ node }) =>
      node && 'children' in node ? node.children.length : null
    );

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId: destinationParentRuntimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe(1);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [2], to: [0, 1] });
      });
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe(2);
  });

  test('useElementPath updates on top-level root order changes', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const runtimeId = editorGetRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for element path contract');
    }

    const { result } = renderHook(() => useElementPath(), {
      wrapper: ({ children }) => (
        <Plite editor={editor}>
          <Editable />
          <NodeRuntimeIdContext.Provider value={runtimeId}>
            {children}
          </NodeRuntimeIdContext.Provider>
        </Plite>
      ),
    });

    expect(result.current).toEqual([0]);

    await act(async () => {
      editorMoveNodes(editor, { at: [0], to: [2] });
    });

    expect(editorGetPathByRuntimeId(editor, runtimeId)).toEqual([1]);
    expect(result.current).toEqual([1]);
  });

  test('useElementPath skips text-only commits', async () => {
    const value = Array.from({ length: 64 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const runtimeIds = value.map((_value, index) =>
      editorGetRuntimeId(editor, [index])
    ) as RuntimeId[];
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;

    const PathProbe = ({ runtimeId }: { runtimeId: RuntimeId }) => {
      const path = useElementPath();

      return (
        <span data-testid={`path-${runtimeId}`}>{path?.join('.') ?? ''}</span>
      );
    };

    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      render(
        <Plite editor={editor}>
          <Editable />
          {runtimeIds.map((runtimeId) => (
            <NodeRuntimeIdContext.Provider key={runtimeId} value={runtimeId}>
              <PathProbe runtimeId={runtimeId} />
            </NodeRuntimeIdContext.Provider>
          ))}
        </Plite>
      );

      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 0 } });
        });
      });

      const elementPathChecks = counter
        .snapshot()
        .events.filter((event) => event.id === 'selector-element-path-check');
      const elementPathNotifies = counter
        .snapshot()
        .events.filter((event) => event.id === 'selector-element-path-notify');

      expect(elementPathChecks).toHaveLength(0);
      expect(elementPathNotifies).toHaveLength(0);
    } finally {
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('Editable keeps large staged root groups stable across local edits and parent rerenders', async () => {
    const value = Array.from({ length: 1001 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      rendered = render(
        <Plite editor={editor}>
          <Editable data-testid="grouped-root" domStrategy="staged" />
        </Plite>
      );

      expect(counter.snapshot().byKind.group).toBe(1);
      expect(
        rendered.container.querySelectorAll(
          '[data-plite-root-group-state="pending-mount"]'
        )
      ).toHaveLength(1);

      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [1000, 0], offset: 0 } });
        });
      });

      const editProfile = counter.snapshot();

      expect(
        editProfile.events.filter(
          (event) => event.kind === 'group' && event.id === '0-49'
        )
      ).toHaveLength(0);
      expect(editProfile.byKind.group ?? 0).toBeLessThanOrEqual(1);

      counter.reset();

      rendered.rerender(
        <Plite editor={editor}>
          <Editable data-testid="grouped-root-next" domStrategy="staged" />
        </Plite>
      );

      expect(counter.snapshot().byKind.group ?? 0).toBe(0);
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('Editable can explicitly use staged dom-strategy grouping', () => {
    const value = Array.from({ length: 1001 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      rendered = render(
        <Plite editor={editor}>
          <Editable data-testid="staged-root" domStrategy="staged" />
        </Plite>
      );

      expect(counter.snapshot().byKind.group).toBe(1);
      expect(
        rendered.container.querySelectorAll(
          '[data-plite-root-group-state="pending-mount"]'
        )
      ).toHaveLength(1);
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('Editable can disable automatic dom-strategy root grouping', () => {
    const value = Array.from({ length: 1001 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      rendered = render(
        <Plite editor={editor}>
          <Editable data-testid="ungrouped-root" domStrategy="full" />
        </Plite>
      );

      expect(counter.snapshot().byKind.group ?? 0).toBe(0);
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('Editable root-order commits do not fan out to every mounted runtime node', async () => {
    const value = Array.from({ length: 1001 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      rendered = render(
        <Plite editor={editor}>
          <Editable data-testid="root-order-fanout" />
        </Plite>
      );
      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.insert(
            { type: 'block', children: [{ text: 'new line' }] } as never,
            { at: [1001] }
          );
        });
      });

      const profile = counter.snapshot();

      expect(profile.byKey['selector:selector-runtime-node-check'] ?? 0).toBe(
        0
      );
      expect(
        profile.byKey['selector:selector-runtime-node-notify'] ?? 0
      ).toBeLessThanOrEqual(1);
      expect(profile.byKey['selector:selector-root-runtime-ids-notify']).toBe(
        1
      );
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('Editable prepends sync shifted DOM paths without mounted runtime-node notifications', async () => {
    const value = Array.from({ length: 40 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const trackedRuntimeId = editorGetRuntimeId(editor, [10]);
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;

    if (!trackedRuntimeId) {
      throw new Error('Expected runtime id for shifted DOM path sync contract');
    }

    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      rendered = render(
        <Plite editor={editor}>
          <Editable data-testid="root-order-dom-path-sync" />
        </Plite>
      );

      const getTrackedElement = () =>
        rendered!.container.querySelector<HTMLElement>(
          `[data-plite-node="element"][data-plite-runtime-id="${trackedRuntimeId}"]`
        );

      expect(getTrackedElement()?.getAttribute('data-plite-path')).toBe('10');

      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.insert(
            { type: 'block', children: [{ text: 'new line' }] } as never,
            { at: [0] }
          );
        });
      });

      await waitFor(() => {
        expect(getTrackedElement()?.getAttribute('data-plite-path')).toBe('11');
      });

      const profile = counter.snapshot();

      expect(
        profile.byKey['selector:selector-runtime-node-notify'] ?? 0
      ).toBeLessThanOrEqual(1);
      expect(profile.byKey['selector:selector-root-runtime-ids-notify']).toBe(
        1
      );
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('runtime selector listeners update shifted siblings during top-level inserts', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'first' }] },
        { type: 'block', children: [{ text: 'tracked' }] },
      ],
    });
    const trackedRuntimeId = editorGetRuntimeId(editor, [1]);

    if (!trackedRuntimeId) {
      throw new Error(
        'Expected runtime id for shifted insert sibling contract'
      );
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          runtimeId: trackedRuntimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('1');

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          { type: 'block', children: [{ text: 'inserted' }] } as never,
          { at: [0] }
        );
      });
    });

    expect(editorGetLastCommit(editor)?.topLevelOrderChanged).toBe(true);
    expect(result.current).toBe('2');
  });

  test('Editable full-document replacement does not fan out to stale mounted runtime nodes', async () => {
    const value = Array.from({ length: 1001 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      rendered = render(
        <Plite editor={editor}>
          <Editable data-testid="full-document-fanout" />
        </Plite>
      );
      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.value.replace({
            children: [{ type: 'block', children: [{ text: 'replacement' }] }],
            selection: {
              anchor: { path: [0, 0], offset: 11 },
              focus: { path: [0, 0], offset: 11 },
            },
          });
        });
      });

      const profile = counter.snapshot();

      expect(profile.byKey['selector:selector-runtime-node-check'] ?? 0).toBe(
        1
      );
      expect(profile.byKey['selector:selector-runtime-node-notify'] ?? 0).toBe(
        1
      );
      expect(profile.byKey['selector:selector-root-runtime-ids-notify']).toBe(
        1
      );
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('mounted render selector hooks skip synced text commits but catch the next node commit', async () => {
    const editor = createReactEditor();
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'one' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const blockRuntimeId = snapshot.index.pathToId['0'];
    const textRuntimeId = snapshot.index.pathToId['0.0'];

    if (!blockRuntimeId || !textRuntimeId) {
      throw new Error('Expected runtime ids for mounted selector contract');
    }

    const nodeSelector = jest.fn(({ node }) => {
      if (!node || editorIsEditor(node) || !('children' in node)) {
        return null;
      }

      const firstChild = node.children[0];

      return TextApi.isText(firstChild) ? firstChild.text : null;
    });
    const textSelector = jest.fn(({ text }) => text?.text ?? null);

    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      const { result } = renderHook(
        () => ({
          nodeText: useMountedNodeRenderSelector(nodeSelector, undefined, {
            runtimeId: blockRuntimeId,
          }),
          text: useMountedTextRenderSelector(textSelector, undefined, {
            runtimeId: textRuntimeId,
          }),
        }),
        {
          wrapper: ({ children }) => (
            <Plite editor={editor}>
              <Editable />
              {children}
            </Plite>
          ),
        }
      );

      expect(result.current).toEqual({ nodeText: 'one', text: 'one' });

      const callsAfterMount = {
        node: nodeSelector.mock.calls.length,
        text: textSelector.mock.calls.length,
      };

      counter.reset();

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
        });
      });

      const syncedTextProfile = counter.snapshot();

      expect(result.current).toEqual({ nodeText: 'one', text: 'one' });
      expect(nodeSelector).toBeCalledTimes(callsAfterMount.node);
      expect(textSelector).toBeCalledTimes(callsAfterMount.text);
      expect(
        syncedTextProfile.byKey['selector:selector-runtime-node-check'] ?? 0
      ).toBe(0);

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.set({ tone: true } as never, { at: [0, 0] });
        });
      });

      expect(result.current.text).toBe('one!');
      expect(textSelector.mock.calls.length).toBeGreaterThan(
        callsAfterMount.text
      );

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.set({ tone: 'block' } as never, { at: [0] });
        });
      });

      expect(result.current.nodeText).toBe('one!');
      expect(nodeSelector.mock.calls.length).toBeGreaterThan(
        callsAfterMount.node
      );
    } finally {
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('mounted render selector hooks update when DOM text sync is disabled', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'one' }] }],
      selection: null,
    });

    const textRuntimeId = editorGetSnapshot(editor).index.pathToId['0.0'];

    if (!textRuntimeId) {
      throw new Error('Expected text runtime id for mounted selector contract');
    }

    const textSelector = jest.fn(({ text }) => text?.text ?? null);

    const { result } = renderHook(
      () =>
        useMountedTextRenderSelector(textSelector, undefined, {
          runtimeId: textRuntimeId,
        }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable
              renderLeaf={({ attributes, children: leafChildren }) => (
                <span {...attributes} data-custom-leaf="true">
                  {leafChildren}
                </span>
              )}
            />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current).toBe('one');

    const callsAfterMount = textSelector.mock.calls.length;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
      });
    });

    expect(result.current).toBe('one!');
    expect(textSelector.mock.calls.length).toBeGreaterThan(callsAfterMount);
  });

  test('root selector sources track structural ids and selected top-level index', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    const { result } = renderHook(
      () => ({
        selectedTopLevelIndex: useTopLevelSelectionIndex(true),
        topLevelRuntimeIds: useRootRuntimeIds(),
      }),
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    expect(result.current.selectedTopLevelIndex).toBe(null);
    expect(result.current.topLevelRuntimeIds).toHaveLength(2);

    const initialRootRuntimeIds = result.current.topLevelRuntimeIds;

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [1, 0], offset: 0 });
      });
    });

    expect(result.current.selectedTopLevelIndex).toBe(1);
    expect(result.current.topLevelRuntimeIds).toBe(initialRootRuntimeIds);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [1, 0], offset: 3 } });
      });
    });

    expect(result.current.topLevelRuntimeIds).toBe(initialRootRuntimeIds);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          { type: 'block', children: [{ text: 'three' }] } as never,
          { at: [2] }
        );
      });
    });

    expect(result.current.topLevelRuntimeIds).toHaveLength(3);
    expect(result.current.topLevelRuntimeIds).not.toBe(initialRootRuntimeIds);
  });

  test('root selector sources track broad selection index changes', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: Array.from({ length: 200 }, (_value, index) => ({
        type: 'block',
        children: [{ text: `block ${index}` }],
      })),
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    const { result } = renderHook(() => useTopLevelSelectionIndex(true), {
      wrapper: ({ children }) => (
        <Plite editor={editor}>
          <Editable />
          {children}
        </Plite>
      ),
    });

    expect(result.current).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [50, 0], offset: 0 },
          focus: { path: [199, 0], offset: 'block 199'.length },
        });
      });
    });

    expect(editorGetLastCommit(editor)?.selectionImpactRuntimeIds).toBe(null);
    expect(result.current).toBe(50);
  });

  test('placeholder root source tracks empty editor state', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: '' }] }],
      selection: null,
    });

    const { result } = renderHook(() => usePlaceholderValue('Type something'), {
      wrapper: ({ children }) => (
        <Plite editor={editor}>
          <Editable />
          {children}
        </Plite>
      ),
    });

    await waitFor(() => expect(result.current).toBe('Type something'));

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('x', { at: { path: [0, 0], offset: 0 } });
      });
    });

    expect(result.current).toBeUndefined();

    await act(async () => {
      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      });
    });

    await waitFor(() => expect(result.current).toBe('Type something'));
  });

  test('placeholder root source tracks structural edits inside the first block', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: '' }] }],
      selection: null,
    });

    const { result } = renderHook(() => usePlaceholderValue('Type something'), {
      wrapper: ({ children }) => (
        <Plite editor={editor}>
          <Editable />
          {children}
        </Plite>
      ),
    });

    await waitFor(() => expect(result.current).toBe('Type something'));

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert({ text: 'x' } as never, { at: [0, 1] });
      });
    });

    expect(result.current).toBeUndefined();

    await act(async () => {
      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      });
    });

    await waitFor(() => expect(result.current).toBe('Type something'));
  });

  test('placeholder root source ignores selection-only commits', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: '' }] }],
      selection: null,
    });

    let renderCount = 0;
    const { result } = renderHook(
      () => {
        renderCount += 1;

        return usePlaceholderValue('Type something');
      },
      {
        wrapper: ({ children }) => (
          <Plite editor={editor}>
            <Editable />
            {children}
          </Plite>
        ),
      }
    );

    await waitFor(() => expect(result.current).toBe('Type something'));

    const renderCountAfterMount = renderCount;

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 0 });
      });
    });

    expect(result.current).toBe('Type something');
    expect(renderCount).toBe(renderCountAfterMount);
  });
});
