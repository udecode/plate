import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { type Descendant, type Element, NodeApi } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';
import type { ReactNode } from 'react';

import {
  createEditor,
  Editable,
  EditorRoot,
  useEditorContext,
  useEditorHistory,
  useRootEditor,
} from '../../src/react';
import { applyEditableCommand } from '../../src/react/editable/mutation-controller';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const editorText = (editor: {
  read: <T>(
    fn: (state: { nodes: { children: () => readonly Descendant[] } }) => T
  ) => T;
}) =>
  editor.read((state) => {
    const [firstBlock] = state.nodes.children();

    return firstBlock ? NodeApi.string(firstBlock) : '';
  });

const editorChildren = (editor: {
  read: <T>(
    fn: (state: { nodes: { children: () => readonly Descendant[] } }) => T
  ) => T;
}) => editor.read((state) => state.nodes.children());

describe('useEditorHistory', () => {
  test('exposes undo and redo availability from the active root history', async () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('body')],
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EditorRoot editor={editor}>
        <Editable aria-label="History editor" />
        {children}
      </EditorRoot>
    );

    const { result } = renderHook(() => useEditorHistory(), { wrapper });

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
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('body')],
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EditorRoot editor={editor}>
        <Editable aria-label="History editor" />
        {children}
      </EditorRoot>
    );

    const { result } = renderHook(() => useEditorHistory(), { wrapper });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 4 });
        tx.text.insert('!');
      });
    });

    let undoResult: Awaited<ReturnType<typeof result.current.undo>> | undefined;
    await act(async () => {
      undoResult = await result.current.undo();
    });

    expect(undoResult).toEqual({ status: 'applied' });
    expect(editorText(editor)).toBe('body');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    await act(async () => {
      await result.current.redo();
    });

    expect(editorText(editor)).toBe('body!');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  for (const action of ['accept', 'reject'] as const) {
    test(`undoes and redoes an authored ${action} decision through the mounted controller`, async () => {
      const editor = createEditor({
        plugins: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('body')],
      });
      let changeId = '';
      let mountedEditor!: typeof editor;
      editor.update((tx) => {
        tx.history.skip();
        changeId = tx.authored.propose();
        tx.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
      });
      const Capture = () => {
        mountedEditor = useEditorContext() as typeof editor;
        return null;
      };
      const wrapper = ({ children }: { children: ReactNode }) => (
        <EditorRoot
          authored={{ intent: 'propose', projection: 'markup' }}
          editor={editor}
        >
          <Editable aria-label="History editor" />
          <Capture />
          {children}
        </EditorRoot>
      );
      const { result } = renderHook(() => useEditorHistory(), { wrapper });

      await act(async () => {
        mountedEditor.update.authored.decide({
          action,
          selection: mountedEditor.read.authored.select({ ids: [changeId] }),
        });
      });

      expect(editor.read.authored.change(changeId)?.status).toBe(
        action === 'accept' ? 'accepted' : 'rejected'
      );
      expect(result.current.canUndo).toBe(true);

      await act(async () => result.current.undo());

      expect(editor.read.authored.change(changeId)?.status).toBe('pending');
      expect(result.current.canRedo).toBe(true);

      await act(async () => result.current.redo());

      expect(editor.read.authored.change(changeId)?.status).toBe(
        action === 'accept' ? 'accepted' : 'rejected'
      );
      expect(result.current.canRedo).toBe(false);
    });
  }

  test('controller undo avoids normalizing the outer history transaction', async () => {
    const blockCount = 128;
    const initialValue = Array.from({ length: blockCount }, (_, index) =>
      paragraph(`block-${index}`)
    );
    const editor = createEditor({
      plugins: [history()],
      initialValue,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EditorRoot editor={editor}>
        <Editable aria-label="History editor" />
        {children}
      </EditorRoot>
    );

    const { result } = renderHook(() => useEditorHistory(), { wrapper });

    await act(async () => {
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            kind: 'text',
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

    const events: Array<{ id?: string | null }> = [];
    const previousProfiler = globalThis.__EDITOR_REACT_RENDER_PROFILER__;

    globalThis.__EDITOR_REACT_RENDER_PROFILER__ = {
      record(event: { id?: string | null }) {
        events.push(event);
      },
    };

    try {
      await act(async () => {
        result.current.undo();
      });
    } finally {
      globalThis.__EDITOR_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(events.map((event) => event.id)).not.toContain(
      'transaction-normalize'
    );
    expect(editorChildren(editor)).toEqual(initialValue);
  });

  test('fixed-root external shortcut preserves the input focus', async () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    let headerEditor!: ReturnType<typeof useRootEditor>;

    const TitleInput = () => {
      const innerHistory = useEditorHistory({
        focusPolicy: 'preserve',
        root: 'header',
      });
      headerEditor = useRootEditor('header');

      return (
        <input aria-label="Document title" onKeyDown={innerHistory.onKeyDown} />
      );
    };

    render(
      <EditorRoot editor={editor}>
        <TitleInput />
        <Editable aria-label="Header editor" root="header" />
      </EditorRoot>
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
    const editor = createEditor({
      plugins: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { shared: [paragraph('shared')] },
      },
    });
    let sharedEditor!: ReturnType<typeof useRootEditor>;

    const Controls = () => {
      const innerHistory2 = useEditorHistory({
        focusPolicy: 'restore-root',
        root: 'shared',
      });
      sharedEditor = useRootEditor('shared');

      return (
        <button onClick={innerHistory2.undo} type="button">
          Undo shared root
        </button>
      );
    };

    render(
      <EditorRoot editor={editor}>
        <Controls />
        <Editable aria-label="Shared first" root="shared" />
        <Editable aria-label="Shared second" root="shared" />
      </EditorRoot>
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
    const editor = createEditor({
      plugins: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    let headerEditor!: ReturnType<typeof useRootEditor>;

    const Probe = () => {
      headerEditor = useRootEditor('header');

      return null;
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EditorRoot editor={editor}>
        <Probe />
        <Editable aria-label="History editor" />
        {children}
      </EditorRoot>
    );

    const { result } = renderHook(() => useEditorHistory(), {
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
