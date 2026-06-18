import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Descendant } from '@platejs/slate';

import {
  createReactEditor,
  Editable,
  Slate,
  useSlateHistory,
  useSlateRootEditor,
} from '../src';
import { applyEditableCommand } from '../src/editable/mutation-controller';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const editorText = (editor: {
  read: <T>(fn: (state: { nodes: { children: () => Descendant[] } }) => T) => T;
}) =>
  editor.read((state) => {
    const [firstBlock] = state.nodes.children() as {
      children: { text: string }[];
    }[];

    return firstBlock?.children[0]?.text ?? '';
  });

const editorChildren = (editor: {
  read: <T>(fn: (state: { nodes: { children: () => Descendant[] } }) => T) => T;
}) => editor.read((state) => state.nodes.children());

describe('useSlateHistory', () => {
  test('exposes undo and redo availability from the active root history', async () => {
    const editor = createReactEditor({
      initialValue: [paragraph('body')],
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Slate editor={editor}>{children}</Slate>
    );

    const { result } = renderHook(() => useSlateHistory(), { wrapper });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.root).toBeUndefined();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 4 });
        tx.text.insert('!');
      });
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  test('undoes and redoes through the controller', async () => {
    const editor = createReactEditor({
      initialValue: [paragraph('body')],
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Slate editor={editor}>{children}</Slate>
    );

    const { result } = renderHook(() => useSlateHistory(), { wrapper });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 4 });
        tx.text.insert('!');
      });
    });

    await act(async () => {
      result.current.undo();
    });

    expect(editorText(editor)).toBe('body');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    await act(async () => {
      result.current.redo();
    });

    expect(editorText(editor)).toBe('body!');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  test('controller undo avoids normalizing the outer history transaction', async () => {
    const blockCount = 128;
    const initialValue = Array.from({ length: blockCount }, (_, index) =>
      paragraph(`block-${index}`)
    );
    const editor = createReactEditor({
      initialValue,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Slate editor={editor}>{children}</Slate>
    );

    const { result } = renderHook(() => useSlateHistory(), { wrapper });

    await act(async () => {
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: {
              path: [blockCount - 1, 0],
              offset: `block-${blockCount - 1}`.length,
            },
          },
        },
        editor,
      });
    });

    const events: { id?: string | null }[] = [];
    const previousProfiler = globalThis.__SLATE_REACT_RENDER_PROFILER__;

    globalThis.__SLATE_REACT_RENDER_PROFILER__ = {
      record(event: { id?: string | null }) {
        events.push(event);
      },
    };

    try {
      await act(async () => {
        result.current.undo();
      });
    } finally {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(events.map((event) => event.id)).not.toContain(
      'transaction-normalize'
    );
    expect(editorChildren(editor)).toEqual(initialValue);
  });

  test('fixed-root external shortcut preserves the input focus', async () => {
    const editor = createReactEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    let headerEditor!: ReturnType<typeof useSlateRootEditor>;

    const TitleInput = () => {
      const history = useSlateHistory({
        focusPolicy: 'preserve',
        root: 'header',
      });
      headerEditor = useSlateRootEditor('header');

      return (
        <input aria-label="Document title" onKeyDown={history.onKeyDown} />
      );
    };

    render(
      <Slate editor={editor}>
        <TitleInput />
      </Slate>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 6 });
        tx.text.insert('!');
      });
    });

    const input = screen.getByLabelText('Document title');
    input.focus();

    await act(async () => {
      fireEvent.keyDown(input, { code: 'KeyZ', ctrlKey: true, key: 'z' });
    });

    expect(editorText(headerEditor)).toBe('header');
    expect(document.activeElement).toBe(input);
  });

  test('restore-root focuses the active mounted copy of a shared root', async () => {
    const editor = createReactEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { shared: [paragraph('shared')] },
      },
    });
    let sharedEditor!: ReturnType<typeof useSlateRootEditor>;

    const Controls = () => {
      const history = useSlateHistory({
        focusPolicy: 'restore-root',
        root: 'shared',
      });
      sharedEditor = useSlateRootEditor('shared');

      return (
        <button onClick={history.undo} type="button">
          Undo shared root
        </button>
      );
    };

    render(
      <Slate editor={editor}>
        <Controls />
        <Editable aria-label="Shared first" root="shared" />
        <Editable aria-label="Shared second" root="shared" />
      </Slate>
    );

    const secondCopy = screen.getByLabelText('Shared second');

    await act(async () => {
      secondCopy.focus();
      fireEvent.focus(secondCopy);
    });

    await act(async () => {
      sharedEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 'shared'.length });
        tx.text.insert('!');
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Undo shared root' }));
    });

    expect(editorText(sharedEditor)).toBe('shared');
    await waitFor(() => {
      expect(document.activeElement).toBe(secondCopy);
    });
  });

  test('fixed-root availability follows sibling root history changes', async () => {
    const editor = createReactEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    let headerEditor!: ReturnType<typeof useSlateRootEditor>;

    const Probe = () => {
      headerEditor = useSlateRootEditor('header');

      return null;
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Slate editor={editor}>
        <Probe />
        {children}
      </Slate>
    );

    const { result } = renderHook(() => useSlateHistory(), {
      wrapper,
    });

    expect(result.current.canUndo).toBe(false);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 6 });
        tx.text.insert('!');
      });
    });

    expect(result.current.canUndo).toBe(true);
  });
});
