import { type EditorCommit, type NodeKey, TextApi } from '@platejs/plite';
import {
  getLastCommit as editorGetLastCommit,
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  isEditor as editorIsEditor,
  moveNodes as editorMoveNodes,
  replace as editorReplace,
} from '@platejs/plite/internal';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import _ from 'lodash';
import {
  Component,
  type ReactNode,
  startTransition,
  Suspense,
  useLayoutEffect,
} from 'react';

import {
  createReactEditor,
  Editable,
  Plite,
  type RenderElementProps,
  useEditor,
  useEditorSelector,
  useEditorState,
  useElementPath,
  useNodeSelector,
  usePliteEditor,
  useTextSelector,
} from '../src';
import { NodeKeyContext } from '../src/context';
import {
  usePlaceholderValue,
  useRootNodeKeys,
  useTopLevelSelectionIndex,
} from '../src/editable/root-selector-sources';
import { useGenericSelector } from '../src/hooks/use-generic-selector';
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
  test('usePliteEditor creates a React editor with initialized value', () => {
    const { result } = renderHook(() =>
      usePliteEditor({
        initialValue,
      })
    );

    expect(result.current.read((state) => state.value())).toEqual({
      children: initialValue,
    });
    expect(result.current.read((state) => state.lastCommit())).toBe(null);
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

  test('multiple Editable views preserve the constructor maxLength', () => {
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const editor = createReactEditor({
      initialSelection: selection,
      initialValue: [{ type: 'block', children: [{ text: '' }] }],
      maxLength: 3,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable />
        <Editable />
      </Plite>
    );

    act(() => {
      editor.update.text.insert('abcdef');
    });

    expect(editor.read.text.string([])).toBe('abc');

    rendered.rerender(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );

    rendered.unmount();

    act(() => {
      editor.update.text.insert('def');
    });

    expect(editor.read.text.string([])).toBe('abc');
  });

  test('Plite publishes editor commits from child mount layout effects', () => {
    const editor = createReactEditor({ initialValue });
    const onCommit = jest.fn();
    const onValueChange = jest.fn();
    const shouldUpdate = jest.fn(() => true);
    const selector = jest.fn((nextEditor: typeof editor) =>
      nextEditor.read((state) => {
        const [firstBlock] = state.nodes.children() as Array<{
          children: Array<{ text: string }>;
        }>;

        return firstBlock?.children[0]?.text ?? '';
      })
    );

    const ProbeAndCommit = () => {
      const mountedEditor = useEditor();
      const text = useEditorSelector(selector, {
        equalityFn: Object.is,
        shouldUpdate,
      });

      useLayoutEffect(() => {
        mountedEditor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      }, [mountedEditor]);

      return <span data-testid="selector-text">{text}</span>;
    };

    const rendered = render(
      <Plite editor={editor} onCommit={onCommit} onValueChange={onValueChange}>
        <Editable />
        <ProbeAndCommit />
      </Plite>
    );

    expect(rendered.getByTestId('selector-text')).toHaveTextContent('test!');
    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        commit: expect.anything(),
        editor,
        snapshot: expect.objectContaining({
          children: [{ type: 'block', children: [{ text: 'test!' }] }],
        }),
      })
    );
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        editor,
        value: [{ type: 'block', children: [{ text: 'test!' }] }],
      })
    );
    const publishedContext = onCommit.mock.calls.at(-1)?.[0];

    expect(publishedContext?.commit.changed.has('text')).toBe(true);
    expect(
      shouldUpdate.mock.calls.some(([change]) => change?.changed.has('text'))
    ).toBe(true);
  });

  test('useEditorSelector catches up when a changed filter misses a child layout commit', () => {
    const editor = createReactEditor({ initialValue });

    const CommitFromChildLayout = ({ text }: { text?: string }) => {
      useLayoutEffect(() => {
        if (!text) return;

        editor.update((tx) => {
          tx.text.insert(text, { at: { path: [0, 0], offset: 4 } });
        });
      }, [text]);

      return null;
    };
    const Probe = ({ allow, insert }: { allow: boolean; insert?: string }) => {
      const text = useEditorSelector(
        (nextEditor) => nextEditor.read.text.string([]),
        { shouldUpdate: () => allow }
      );

      return (
        <>
          <span data-testid="filtered-selector-text">{text}</span>
          <CommitFromChildLayout text={insert} />
        </>
      );
    };
    const rendered = render(
      <Plite editor={editor}>
        <Editable />
        <Probe allow={false} />
      </Plite>
    );

    rendered.rerender(
      <Plite editor={editor}>
        <Editable />
        <Probe allow insert="!" />
      </Plite>
    );

    expect(rendered.getByTestId('filtered-selector-text')).toHaveTextContent(
      'test!'
    );
  });

  test('abandoned selector renders do not publish their change filter', () => {
    const editor = createReactEditor({ initialValue });
    const suspended = new Promise<never>(() => {});
    const selector = jest.fn((nextEditor: typeof editor) =>
      nextEditor.read.text.string([])
    );

    const Probe = ({ abandoned }: { abandoned: boolean }) => {
      const text = useEditorSelector(selector, {
        shouldUpdate: () => abandoned,
      });

      if (abandoned) throw suspended;

      return <span data-testid="committed-filter-text">{text}</span>;
    };
    const tree = (abandoned: boolean) => (
      <Plite editor={editor}>
        <Editable />
        <Suspense fallback={<span>loading</span>}>
          <Probe abandoned={abandoned} />
        </Suspense>
      </Plite>
    );
    const rendered = render(tree(false));
    const committedSelectorCalls = selector.mock.calls.length;

    act(() => {
      startTransition(() => {
        rendered.rerender(tree(true));
      });
    });
    act(() => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(selector).toHaveBeenCalledTimes(committedSelectorCalls);
    expect(rendered.getByTestId('committed-filter-text')).toHaveTextContent(
      'test'
    );
  });

  test('useEditorSelector honors the equality function when selector identity changes', async () => {
    const editor = createReactEditor({ initialValue });
    const callback1 = jest.fn(() => []);
    const callback2 = jest.fn(() => []);

    const { result, rerender } = renderHook(
      ({ callback }) => useEditorSelector(callback, { equalityFn: _.isEqual }),
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

  test('abandoned renders do not replace the committed generic selector', () => {
    let source = 'test';
    let updateSelector = () => {
      throw new Error('selector is not committed');
    };
    const committedSelector = jest.fn(() => source);
    const abandonedSelector = jest.fn(() => `abandoned:${source}`);
    const preserveCommittedValue = (previous: string | null) =>
      previous !== null;
    const firstRenderValues: string[] = [];
    const suspended = new Promise<never>(() => {});

    const Selector = ({ abandoned }: { abandoned: boolean }) => {
      const [value, update] = useGenericSelector(
        abandoned ? abandonedSelector : committedSelector,
        preserveCommittedValue
      );

      firstRenderValues.push(value);
      useLayoutEffect(() => {
        updateSelector = update;
      }, [update]);
      if (abandoned) throw suspended;

      return <span data-testid="selector-value">{value}</span>;
    };
    const tree = (abandoned: boolean) => (
      <Suspense fallback={<span>loading</span>}>
        <Selector abandoned={abandoned} />
      </Suspense>
    );
    const rendered = render(tree(false));

    expect(firstRenderValues[0]).toBe('test');
    expect(rendered.getByTestId('selector-value')).toHaveTextContent('test');

    act(() => {
      startTransition(() => {
        rendered.rerender(tree(true));
      });
    });

    expect(abandonedSelector).toBeCalledTimes(1);

    act(() => {
      source = 'test!';
      updateSelector();
    });

    expect(abandonedSelector).toBeCalledTimes(1);
    expect(committedSelector).toBeCalledTimes(2);
    expect(rendered.getByTestId('selector-value')).toHaveTextContent('test');
  });

  test('abandoned provider renders keep committed change callbacks', () => {
    const committedEditor = createReactEditor({ initialValue });
    const abandonedEditor = createReactEditor({ initialValue });
    const committedOnCommit = jest.fn();
    const abandonedOnCommit = jest.fn();
    const suspended = new Promise<never>(() => {});

    const MaybeSuspend = ({ abandoned }: { abandoned: boolean }) => {
      if (abandoned) throw suspended;

      return null;
    };
    const tree = (abandoned: boolean) => (
      <Suspense fallback={<span>loading</span>}>
        <Plite
          editor={abandoned ? abandonedEditor : committedEditor}
          onCommit={abandoned ? abandonedOnCommit : committedOnCommit}
        >
          <MaybeSuspend abandoned={abandoned} />
          <Editable />
        </Plite>
      </Suspense>
    );
    const rendered = render(tree(false));

    act(() => {
      startTransition(() => {
        rendered.rerender(tree(true));
      });
    });

    act(() => {
      committedEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(committedOnCommit).toBeCalledTimes(1);
    expect(abandonedOnCommit).not.toBeCalled();
  });

  test('child layout commits after rerender use the newly committed provider callbacks', () => {
    const editor = createReactEditor({ initialValue });
    const previousOnCommit = jest.fn();
    const previousOnValueChange = jest.fn();
    const nextOnCommit = jest.fn();
    const nextOnValueChange = jest.fn();

    const CommitInLayout = ({ commit }: { commit: boolean }) => {
      const mountedEditor = useEditor();

      useLayoutEffect(() => {
        if (!commit) return;

        mountedEditor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      }, [commit, mountedEditor]);

      return null;
    };
    const tree = (
      commit: boolean,
      onCommit: typeof previousOnCommit,
      onValueChange: typeof previousOnValueChange
    ) => (
      <Plite editor={editor} onCommit={onCommit} onValueChange={onValueChange}>
        <CommitInLayout commit={commit} />
      </Plite>
    );
    const rendered = render(
      tree(false, previousOnCommit, previousOnValueChange)
    );

    rendered.rerender(tree(true, nextOnCommit, nextOnValueChange));

    expect(previousOnCommit).not.toBeCalled();
    expect(previousOnValueChange).not.toBeCalled();
    expect(nextOnCommit).toBeCalledTimes(1);
    expect(nextOnValueChange).toBeCalledTimes(1);
    expect(nextOnCommit.mock.calls[0]?.[0].commit.version).toBe(
      nextOnValueChange.mock.calls[0]?.[0].commit.version
    );
  });

  test('useEditorSelector replays subscription errors during render with context', async () => {
    const editor = createReactEditor({ initialValue });
    const initialVersion = editorGetLastCommit(editor)?.version ?? 0;
    const onError = jest.fn();
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const ThrowingSelector = () => {
      const version = useEditorSelector(
        (nextEditor) => {
          const nextVersion = editorGetLastCommit(nextEditor)?.version ?? 0;

          if (nextVersion > initialVersion) {
            throw new Error('selector exploded');
          }

          return nextVersion;
        },
        { equalityFn: Object.is }
      );

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

  test('useEditorSelector reads the latest canonical commit from the editor', async () => {
    const editor = createReactEditor({ initialValue });
    const seenEditors: Array<typeof editor> = [];
    const selector = jest.fn((nextEditor: typeof editor) => {
      seenEditors.push(nextEditor);

      return nextEditor.read((state) =>
        state.lastCommit()?.changed.has('text') ? 'text' : 'idle'
      );
    });

    const { result } = renderHook(
      () => useEditorSelector(selector, { equalityFn: Object.is }),
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

    expect(result.current).toBe('text');
    expect(seenEditors.every((seenEditor) => seenEditor === editor)).toBe(true);
  });

  test('deferred useEditorSelector coalesces to the latest canonical commit', async () => {
    const editor = createReactEditor({ initialValue });
    const selector = jest.fn(
      (nextEditor: typeof editor) =>
        nextEditor.read((state) => state.lastCommit()?.version) ?? 0
    );

    const { result } = renderHook(
      () =>
        useEditorSelector(selector, {
          deferred: true,
          equalityFn: Object.is,
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

    expect(result.current).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
      editor.update((tx) => {
        tx.text.insert('?', { at: { path: [0, 0], offset: 5 } });
      });
    });

    expect(result.current).toBe(editorGetLastCommit(editor)?.version);
    expect(selector).toBeCalledTimes(3);
  });

  test('deferred useEditorSelector cancels queued updates on unmount', async () => {
    const editor = createReactEditor({ initialValue });
    const selector = jest.fn(
      (nextEditor: typeof editor) =>
        nextEditor.read((state) => state.lastCommit()?.version) ?? 0
    );

    const rendered = renderHook(
      () =>
        useEditorSelector(selector, {
          deferred: true,
          equalityFn: Object.is,
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

    expect(rendered.result.current).toBe(0);
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
          useEditorSelector(selector, {
            deferred: true,
            equalityFn: Object.is,
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

    const targetNodeKey = editorGetSnapshot(editor).index.keyAt([1, 0]);
    const selector = jest.fn(() => editorGetLastCommit(editor)?.version ?? 0);
    const shouldUpdate = jest.fn((change?: EditorCommit) =>
      Boolean(change?.changed.hasNodeKey(targetNodeKey ?? '', 'selection'))
    );
    const initialVersion = editorGetLastCommit(editor)?.version ?? 0;

    const { result } = renderHook(
      () => useEditorSelector(selector, { shouldUpdate }),
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
    const blockNodeKey = snapshot.index.keyAt([0]);
    const textNodeKey = snapshot.index.keyAt([0, 0]);
    const selector = jest.fn((state) => state.selection());
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
    expect(seenChanges.at(-1)?.changed.nodeKeys('text')).toEqual([textNodeKey]);
    expect(seenChanges.at(-1)?.changed.nodeKeys('node')).toEqual([
      blockNodeKey,
      textNodeKey,
    ]);
    expect(seenChanges.at(-1)?.changed.topLevelRanges()).toEqual([[0, 0]]);
    expect(seenChanges.at(-1)?.changed.has('root-order')).toBe(false);
    expect(seenChanges.at(-1)?.changed.has('replace')).toBe(false);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [1, 0], offset: 1 });
      });
    });

    expect(selector).toBeCalledTimes(3);
    expect(result.current).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  test('runtime selector hooks skip unrelated node key commits', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const blockNodeKey = snapshot.index.keyAt([0]);
    const textNodeKey = snapshot.index.keyAt([0, 0]);

    if (!blockNodeKey || !textNodeKey) {
      throw new Error('Expected node keys for selector contract');
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
          nodeKey: blockNodeKey,
        }),
        text: useTextSelector(textSelector, undefined, {
          nodeKey: textNodeKey,
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

  test('runtime selector listeners do not fan out to unrelated node keys', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstBlockNodeKey = snapshot.index.keyAt([0]);
    const secondTextNodeKey = snapshot.index.keyAt([1, 0]);

    if (!firstBlockNodeKey || !secondTextNodeKey) {
      throw new Error('Expected node keys for listener fanout contract');
    }

    const selector = jest.fn(() => editorGetLastCommit(editor)?.version ?? 0);
    const shouldUpdate = jest.fn(() => true);
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      const { result } = renderHook(
        () =>
          useEditorSelector(selector, {
            nodeKey: firstBlockNodeKey,
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
              event.nodeKey === firstBlockNodeKey
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
        (event) => event.nodeKey === firstBlockNodeKey
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
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Expected node key for top-level split contract');
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
          nodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
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
    const siblingNodeKey = editorGetNodeKey(editor, [1]);

    if (!siblingNodeKey) {
      throw new Error('Expected node key for shifted split sibling contract');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey: siblingNodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
    expect(result.current).toBe('2');
  });

  test('runtime selector listeners update moved top-level runtime paths', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'first' }] },
        { type: 'block', children: [{ text: 'target' }] },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [1]);

    if (!nodeKey) {
      throw new Error('Expected node key for top-level move contract');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
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
    const nodeKey = editorGetNodeKey(editor, [0, 0]);

    if (!nodeKey) {
      throw new Error('Expected node key for nested-to-top-level move');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
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
    const sourceParentNodeKey = editorGetNodeKey(editor, [0]);

    if (!sourceParentNodeKey) {
      throw new Error('Expected source parent node key for nested move');
    }

    const selector = jest.fn(({ node }) =>
      node && 'children' in node ? node.children.length : null
    );

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey: sourceParentNodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
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
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Expected node key for top-level-to-nested move');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
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
    const destinationParentNodeKey = editorGetNodeKey(editor, [0]);

    if (!destinationParentNodeKey) {
      throw new Error('Expected destination parent node key for nested move');
    }

    const selector = jest.fn(({ node }) =>
      node && 'children' in node ? node.children.length : null
    );

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey: destinationParentNodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
    expect(result.current).toBe(2);
  });

  test('useElementPath updates on top-level root order changes', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Expected node key for element path contract');
    }

    const { result } = renderHook(() => useElementPath(), {
      wrapper: ({ children }) => (
        <Plite editor={editor}>
          <Editable />
          <NodeKeyContext value={nodeKey}>{children}</NodeKeyContext>
        </Plite>
      ),
    });

    expect(result.current).toEqual([0]);

    await act(async () => {
      editorMoveNodes(editor, { at: [0], to: [2] });
    });

    expect(editorGetPathByNodeKey(editor, nodeKey)).toEqual([1]);
    expect(result.current).toEqual([1]);
  });

  test('useElementPath resolves a newly inserted rendered element from the snapshot index', async () => {
    const editor = createReactEditor({
      initialValue: [
        { id: 'initial', type: 'block', children: [{ text: 'one' }] },
      ],
    });
    const PathElement = ({
      attributes,
      children,
      element,
    }: RenderElementProps) => {
      const path = useElementPath();
      const rawId = (element as { id?: unknown }).id;
      const id =
        typeof rawId === 'string' || typeof rawId === 'number'
          ? String(rawId)
          : 'unknown';

      return (
        <div {...attributes} data-testid={`path-${id}`}>
          <span>{path?.join('.') ?? 'missing'}</span>
          {children}
        </div>
      );
    };
    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={(props) => <PathElement {...props} />} />
      </Plite>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          {
            id: 'inserted',
            type: 'block',
            children: [{ text: 'two' }],
          },
          { at: [1] }
        );
      });
    });

    await waitFor(() =>
      expect(rendered.getByTestId('path-inserted').textContent).toBe('1two')
    );
  });

  test('useElementPath skips text-only commits', async () => {
    const value = Array.from({ length: 64 }, (_value, index) => ({
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const nodeKeys = value.map((_value, index) =>
      editorGetNodeKey(editor, [index])
    ) as NodeKey[];
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;

    const PathProbe = ({ nodeKey }: { nodeKey: NodeKey }) => {
      const path = useElementPath();

      return (
        <span data-testid={`path-${nodeKey}`}>{path?.join('.') ?? ''}</span>
      );
    };

    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    try {
      render(
        <Plite editor={editor}>
          <Editable />
          {nodeKeys.map((nodeKey) => (
            <NodeKeyContext key={nodeKey} value={nodeKey}>
              <PathProbe nodeKey={nodeKey} />
            </NodeKeyContext>
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
      expect(profile.byKey['selector:selector-root-node-keys-notify']).toBe(1);
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
    const trackedNodeKey = editorGetNodeKey(editor, [10]);
    const trackedTextNodeKey = editorGetNodeKey(editor, [10, 0]);
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    let rendered: ReturnType<typeof render> | null = null;

    if (!trackedNodeKey || !trackedTextNodeKey) {
      throw new Error('Expected node keys for shifted DOM path sync contract');
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
          `[data-plite-node="element"][data-plite-node-key="${trackedNodeKey}"]`
        );
      const getTrackedText = () =>
        rendered!.container.querySelector<HTMLElement>(
          `[data-plite-node="text"][data-plite-node-key="${trackedTextNodeKey}"]`
        );

      expect(getTrackedElement()?.getAttribute('data-plite-path')).toBe('10');
      expect(getTrackedText()?.getAttribute('data-plite-path')).toBe('10,0');

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
        expect(getTrackedText()?.getAttribute('data-plite-path')).toBe('11,0');
      });

      const profile = counter.snapshot();

      expect(
        profile.byKey['selector:selector-runtime-node-notify'] ?? 0
      ).toBeLessThanOrEqual(1);
      expect(profile.byKey['selector:selector-root-node-keys-notify']).toBe(1);
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('Editable move commits sync stable element and text DOM paths', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'moved' }] },
        { type: 'block', children: [{ text: 'sibling' }] },
      ],
    });
    const movedNodeKey = editorGetNodeKey(editor, [0]);
    const movedTextNodeKey = editorGetNodeKey(editor, [0, 0]);

    if (!movedNodeKey || !movedTextNodeKey) {
      throw new Error('Expected node keys for moved DOM path sync contract');
    }

    const rendered = render(
      <Plite editor={editor}>
        <Editable data-testid="move-dom-path-sync" />
      </Plite>
    );
    const getMovedElement = () =>
      rendered.container.querySelector<HTMLElement>(
        `[data-plite-node="element"][data-plite-node-key="${movedNodeKey}"]`
      );
    const getMovedText = () =>
      rendered.container.querySelector<HTMLElement>(
        `[data-plite-node="text"][data-plite-node-key="${movedTextNodeKey}"]`
      );

    expect(getMovedElement()?.getAttribute('data-plite-path')).toBe('0');
    expect(getMovedText()?.getAttribute('data-plite-path')).toBe('0,0');

    await act(async () => {
      editorMoveNodes(editor, { at: [0], to: [2] });
    });

    await waitFor(() => {
      expect(getMovedElement()?.getAttribute('data-plite-path')).toBe('1');
      expect(getMovedText()?.getAttribute('data-plite-path')).toBe('1,0');
    });
  });

  test('Editable does not rerender stable custom elements when sibling paths shift', async () => {
    const value = Array.from({ length: 40 }, (_value, index) => ({
      id: `line-${index}`,
      type: 'block',
      children: [{ text: `line ${index}` }],
    }));
    const editor = createReactEditor({ initialValue: value });
    const renderCounts = new Map<string, number>();

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, children, element }) => {
            const id = String((element as { id?: unknown }).id);

            renderCounts.set(id, (renderCounts.get(id) ?? 0) + 1);

            return <div {...attributes}>{children}</div>;
          }}
        />
      </Plite>
    );
    const trackedNodeKey = editorGetNodeKey(editor, [10]);

    if (!trackedNodeKey) {
      throw new Error('Expected node key for shifted custom-render contract');
    }

    const getTrackedElement = () =>
      rendered.container.querySelector<HTMLElement>(
        `[data-plite-node="element"][data-plite-node-key="${trackedNodeKey}"]`
      );
    const renderCountBeforeInsert = renderCounts.get('line-10');

    expect(getTrackedElement()?.getAttribute('data-plite-path')).toBe('10');

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          {
            id: 'inserted',
            type: 'block',
            children: [{ text: 'new line' }],
          } as never,
          { at: [0] }
        );
      });
    });

    await waitFor(() => {
      expect(getTrackedElement()?.getAttribute('data-plite-path')).toBe('11');
    });
    expect(renderCounts.get('line-10')).toBe(renderCountBeforeInsert);
    expect(renderCounts.get('inserted')).toBe(1);
  });

  test('runtime selector listeners update shifted siblings during top-level inserts', async () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'first' }] },
        { type: 'block', children: [{ text: 'tracked' }] },
      ],
    });
    const trackedNodeKey = editorGetNodeKey(editor, [1]);

    if (!trackedNodeKey) {
      throw new Error('Expected node key for shifted insert sibling contract');
    }

    const selector = jest.fn(({ path }) => path?.join('.') ?? null);

    const { result } = renderHook(
      () =>
        useNodeSelector(selector, undefined, {
          nodeKey: trackedNodeKey,
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

    expect(editorGetLastCommit(editor)?.changed.has('root-order')).toBe(true);
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
              kind: 'text',
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
      expect(profile.byKey['selector:selector-root-node-keys-notify']).toBe(1);
    } finally {
      rendered?.unmount();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  test('mounted render selectors skip synced typing but refresh historic text', async () => {
    const editor = createReactEditor();
    const counter = createPliteReactRenderCounter();
    const previousProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'one' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const blockNodeKey = snapshot.index.keyAt([0]);
    const textNodeKey = snapshot.index.keyAt([0, 0]);

    if (!blockNodeKey || !textNodeKey) {
      throw new Error('Expected node keys for mounted selector contract');
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
            nodeKey: blockNodeKey,
          }),
          text: useMountedTextRenderSelector(textSelector, undefined, {
            nodeKey: textNodeKey,
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

      const callsAfterSyncedText = {
        node: nodeSelector.mock.calls.length,
        text: textSelector.mock.calls.length,
      };

      await act(async () => {
        editor.update({ tags: 'historic' }, (tx) => {
          tx.text.insert('?', { at: { path: [0, 0], offset: 4 } });
        });
      });

      expect(result.current).toEqual({ nodeText: 'one!?', text: 'one!?' });
      expect(nodeSelector.mock.calls.length).toBeGreaterThan(
        callsAfterSyncedText.node
      );
      expect(textSelector.mock.calls.length).toBeGreaterThan(
        callsAfterSyncedText.text
      );

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.set({ tone: true } as never, { at: [0, 0] });
        });
      });

      expect(result.current.text).toBe('one!?');
      expect(textSelector.mock.calls.length).toBeGreaterThan(
        callsAfterMount.text
      );

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.set({ tone: 'block' } as never, { at: [0] });
        });
      });

      expect(result.current.nodeText).toBe('one!?');
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

    const textNodeKey = editorGetSnapshot(editor).index.keyAt([0, 0]);

    if (!textNodeKey) {
      throw new Error('Expected text node key for mounted selector contract');
    }

    const textSelector = jest.fn(({ text }) => text?.text ?? null);

    const { result } = renderHook(
      () =>
        useMountedTextRenderSelector(textSelector, undefined, {
          nodeKey: textNodeKey,
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
        topLevelNodeKeys: useRootNodeKeys(),
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
    expect(result.current.topLevelNodeKeys).toHaveLength(2);

    const initialRootNodeKeys = result.current.topLevelNodeKeys;

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [1, 0], offset: 0 });
      });
    });

    expect(result.current.selectedTopLevelIndex).toBe(1);
    expect(result.current.topLevelNodeKeys).toBe(initialRootNodeKeys);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [1, 0], offset: 3 } });
      });
    });

    expect(result.current.topLevelNodeKeys).toBe(initialRootNodeKeys);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          { type: 'block', children: [{ text: 'three' }] } as never,
          { at: [2] }
        );
      });
    });

    expect(result.current.topLevelNodeKeys).toHaveLength(3);
    expect(result.current.topLevelNodeKeys).not.toBe(initialRootNodeKeys);
  });

  test('root selector sources track broad selection index changes', async () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: Array.from({ length: 200 }, (_value, index) => ({
        type: 'block',
        children: [{ text: `block ${index}` }],
      })),
      selection: {
        kind: 'text',
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
          kind: 'text',
          anchor: { path: [50, 0], offset: 0 },
          focus: { path: [199, 0], offset: 'block 199'.length },
        });
      });
    });

    expect(
      editorGetLastCommit(editor)?.changed.nodeKeys('selection').length
    ).toBe(302);
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
            kind: 'text',
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
            kind: 'text',
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
