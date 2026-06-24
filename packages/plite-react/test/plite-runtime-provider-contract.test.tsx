import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { type ReactNode, useLayoutEffect } from 'react';
import {
  createEditorView,
  type Descendant,
  defineEditorExtension,
  type Element,
} from '@platejs/plite';
import {
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_SELECTION,
} from '@platejs/plite-dom/internal';
import {
  createReactEditor,
  Editable,
  Plite,
  PliteRuntime,
  useEditor,
  useEditorFocused,
  useEditorState,
  usePliteActiveRoot,
  usePliteChildRoot,
  usePliteContentRoot,
  usePliteRootEditor,
  usePliteRootState,
  usePliteRuntime,
  usePliteRuntimeState,
} from '../src';
import { didSyncTextPathToDOM } from '../src/hooks/use-plite-node-ref';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const markedParagraph = (
  text: string,
  marks: Record<string, unknown>
): Descendant => ({
  type: 'paragraph',
  children: [{ text, ...marks }],
});

class FakeDataTransfer {
  private readonly data = new Map<string, string>();

  getData(type: string) {
    return this.data.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.data.set(type, value);
  }
}

const rootText = (state: { nodes: { children: () => Descendant[] } }) => {
  const [firstBlock] = state.nodes.children() as {
    children: { text: string }[];
  }[];

  return firstBlock?.children[0]?.text ?? '';
};

const initialValue = () => ({
  children: [paragraph('body')],
  roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
});

const editableIsland = defineEditorExtension({
  name: 'test-editable-island',
  elements: [{ type: 'editable-void', void: 'editable-island' }],
});

const contentRootExtension = defineEditorExtension({
  name: 'test-content-root',
  elements: [{ type: 'details-content', contentRoot: { slot: 'body' } }],
});

const createRuntimeWrapper =
  (value = initialValue()) =>
  ({ children }: { children: ReactNode }) => {
    const runtime = usePliteRuntime({ initialValue: value });

    return <PliteRuntime runtime={runtime}>{children}</PliteRuntime>;
  };

const createRootWrapper =
  (root?: string) =>
  ({ children }: { children: ReactNode }) => {
    const RuntimeWrapper = createRuntimeWrapper();

    return (
      <RuntimeWrapper>
        <Plite root={root}>{children}</Plite>
      </RuntimeWrapper>
    );
  };

describe('PliteRuntime provider contract', () => {
  test('usePliteChildRoot renders same-runtime rich island content', async () => {
    const childRoot = 'island-a:body';
    const editor = createReactEditor({
      extensions: [editableIsland],
      initialValue: {
        children: [
          {
            type: 'editable-void',
            childRoots: { body: childRoot },
            children: [{ text: '' }],
          },
        ],
        roots: { [childRoot]: [paragraph('about')] },
      },
    });
    let childEditor!: ReturnType<typeof usePliteRootEditor>;

    const IslandBody = ({ element }: { element: Element }) => {
      const root = usePliteChildRoot(element, 'body');
      const text = usePliteRootState(root, rootText);

      childEditor = usePliteRootEditor(root);

      return (
        <div>
          <span data-testid="island-body-status">
            {root}:{text}
          </span>
          <Editable aria-label="Island body" root={root} />
        </div>
      );
    };

    render(
      <Plite editor={editor}>
        <Editable
          aria-label="Outer editor"
          renderVoid={({ element }) => <IslandBody element={element} />}
        />
      </Plite>
    );

    expect(screen.getByTestId('island-body-status')).toHaveTextContent(
      `${childRoot}:about`
    );
    expect(screen.getByLabelText('Island body')).toHaveTextContent('about');

    await act(async () => {
      childEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
      });
    });

    expect(screen.getByTestId('island-body-status')).toHaveTextContent(
      `${childRoot}:about!`
    );
    expect(editor.read((state) => state.value.root())).toMatchObject([
      {
        childRoots: { body: childRoot },
        type: 'editable-void',
      },
    ]);
  });

  test('usePliteContentRoot resolves the schema slot and root chrome', async () => {
    const childRoot = 'details-a:body';
    const element = {
      type: 'details-content',
      childRoots: { body: childRoot },
      children: [{ text: '' }],
    } satisfies Element & { childRoots: Record<string, string> };
    const editor = createReactEditor({
      extensions: [contentRootExtension],
      initialValue: {
        children: [element],
        roots: { [childRoot]: [paragraph('about')] },
      },
    });
    let contentRootEditor!: ReturnType<typeof usePliteRootEditor>;

    const ContentRoot = ({ element }: { element: Element }) => {
      const { chrome, root } = usePliteContentRoot(element);
      const text = usePliteRootState(root, rootText);

      contentRootEditor = usePliteRootEditor(root);

      return (
        <div data-testid="content-root" {...chrome.props}>
          {root}:{text}
        </div>
      );
    };

    render(
      <Plite editor={editor}>
        <ContentRoot element={element} />
      </Plite>
    );

    await screen.findByText(`${childRoot}:about`);
    expect(screen.getByTestId('content-root')).toHaveAttribute(
      'data-plite-root-chrome',
      childRoot
    );
    expect(contentRootEditor.root).toBe(childRoot);
  });

  test('renderElement contentRoot slot mounts same-runtime root content', async () => {
    const childRoot = 'details-slot:body';
    const element = {
      type: 'details-content',
      childRoots: { body: childRoot },
      children: [{ text: '' }],
    } satisfies Element & { childRoots: Record<string, string> };
    const editor = createReactEditor({
      extensions: [contentRootExtension],
      initialValue: {
        children: [element],
        roots: { [childRoot]: [paragraph('slot body')] },
      },
    });

    render(
      <Plite editor={editor}>
        <Editable
          aria-label="Outer editor"
          renderElement={(props) =>
            props.element.type === 'details-content' ? (
              <section {...props.attributes} data-testid="details-slot">
                {props.slots.contentRoot('body', {
                  ariaLabel: 'Details body',
                })}
              </section>
            ) : (
              <p {...props.attributes}>{props.children}</p>
            )
          }
        />
      </Plite>
    );

    await screen.findByLabelText('Details body');
    expect(screen.getByLabelText('Details body')).toHaveTextContent(
      'slot body'
    );
    expect(screen.getByTestId('details-slot')).toHaveAttribute(
      'data-plite-node',
      'element'
    );
  });

  test('Plite editor hosts multiple root-bound Editable surfaces', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;
    const headerValues: string[] = [];

    const Probe = () => {
      const activeRoot = usePliteActiveRoot();
      const headerText = usePliteRootState('header', rootText);

      headerEditor = usePliteRootEditor('header');
      headerValues.push(headerText);

      return <span data-testid="active-root">{activeRoot ?? 'primary'}</span>;
    };

    render(
      <Plite editor={editor}>
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
        <Editable aria-label="Footer editor" root="footer" />
      </Plite>
    );

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header');
    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body');
    expect(screen.getByLabelText('Footer editor')).toHaveTextContent('footer');
    expect(screen.getByTestId('active-root')).toHaveTextContent('primary');

    const renderCountAfterMount = headerValues.length;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body!');
    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header');
    expect(headerValues).toHaveLength(renderCountAfterMount);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
    });

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header!');
    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body!');
    expect(headerValues.at(-1)).toBe('header!');
  });

  test('Plite editor value callbacks ignore sibling root edits', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;
    const onChange = vi.fn();
    const onValueChange = vi.fn();

    const Probe = () => {
      headerEditor = usePliteRootEditor('header');

      return null;
    };

    render(
      <Plite editor={editor} onChange={onChange} onValueChange={onValueChange}>
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
      </Plite>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('new header'), { at: [1] });
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('Plite editor selection callbacks ignore sibling root selection and marks', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const Probe = () => {
      headerEditor = usePliteRootEditor('header');

      return null;
    };

    render(
      <Plite
        editor={editor}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
      >
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
      </Plite>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();

    await act(async () => {
      headerEditor.update((tx) => {
        tx.marks.add('bold', true);
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    const expectedSelection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    expect(onChange).toHaveBeenCalledWith(
      [paragraph('body')],
      expect.objectContaining({
        selection: expectedSelection,
        selectionChanged: true,
        valueChanged: false,
      })
    );
    expect(onSelectionChange).toHaveBeenCalledWith(
      expectedSelection,
      expect.objectContaining({ selectionChanged: true })
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('usePliteActiveRoot rerenders only when the active root changes', async () => {
    let runtime!: ReturnType<typeof usePliteRuntime>;
    const activeRoots: (string | undefined)[] = [];

    const Probe = () => {
      const activeRoot = usePliteActiveRoot();

      activeRoots.push(activeRoot);

      return <span data-testid="active-root">{activeRoot ?? 'primary'}</span>;
    };

    const RuntimeViews = () => {
      runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Probe />
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    expect(screen.getByTestId('active-root')).toHaveTextContent('primary');
    const renderCountAfterMount = activeRoots.length;

    await act(async () => {
      runtime.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    expect(activeRoots).toHaveLength(renderCountAfterMount);

    await act(async () => {
      createEditorView(runtime, { root: 'header' }).update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('active-root')).toHaveTextContent('header');
    });
    expect(activeRoots.at(-1)).toBe('header');
  });

  test('PliteRuntime with Plite defaults to the primary root and Plite root binds another root', () => {
    const main = renderHook(
      () => ({
        root: useEditorState((state) => state.view.root()),
        text: useEditorState(rootText),
      }),
      { wrapper: createRootWrapper() }
    );

    expect(main.result.current).toEqual({ root: 'main', text: 'body' });

    const header = renderHook(
      () => ({
        root: useEditorState((state) => state.view.root()),
        text: useEditorState(rootText),
      }),
      { wrapper: createRootWrapper('header') }
    );

    expect(header.result.current).toEqual({
      root: 'header',
      text: 'header',
    });
  });

  test('Plite root requires PliteRuntime and rejects editor plus root', () => {
    expect(() =>
      render(
        <Plite root="header">
          <span />
        </Plite>
      )
    ).toThrow(/PliteRuntime/);

    const editor = createReactEditor();
    const BadPlite = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite editor={editor} root="header">
            <span />
          </Plite>
        </PliteRuntime>
      );
    };

    expect(() => render(<BadPlite />)).toThrow(/editor.*root|root.*editor/i);
  });

  test('nested PliteRuntime providers isolate runtime selectors', () => {
    const OuterRuntime = createRuntimeWrapper({
      children: [paragraph('outer')],
    });
    const InnerRuntime = createRuntimeWrapper({
      children: [paragraph('inner')],
    });

    const { result } = renderHook(() => usePliteRuntimeState(rootText), {
      wrapper: ({ children }) => (
        <OuterRuntime>
          <InnerRuntime>{children}</InnerRuntime>
        </OuterRuntime>
      ),
    });

    expect(result.current).toBe('inner');
  });

  test('usePliteRootState reads a sibling root without prop-drilled editors', async () => {
    let runtime!: ReturnType<typeof usePliteRuntime>;
    const headerSelector = vi.fn(rootText);
    const RuntimeWrapper = ({ children }: { children: ReactNode }) => {
      runtime = usePliteRuntime({ initialValue: initialValue() });

      return <PliteRuntime runtime={runtime}>{children}</PliteRuntime>;
    };

    const { result } = renderHook(
      () => usePliteRootState('header', headerSelector),
      { wrapper: RuntimeWrapper }
    );

    expect(result.current).toBe('header');
    const headerSelectorCount = headerSelector.mock.calls.length;

    await act(async () => {
      runtime.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(runtime.read(rootText)).toBe('body!');
    expect(result.current).toBe('header');
    expect(headerSelector).toHaveBeenCalledTimes(headerSelectorCount);
  });

  test('usePliteRootState clears selection when focus moves to another root', async () => {
    let runtime!: ReturnType<typeof usePliteRuntime>;
    const RuntimeWrapper = ({ children }: { children: ReactNode }) => {
      runtime = usePliteRuntime({ initialValue: initialValue() });

      return <PliteRuntime runtime={runtime}>{children}</PliteRuntime>;
    };

    const { result } = renderHook(
      () => usePliteRootState('header', (state) => state.selection.get()),
      { wrapper: RuntimeWrapper }
    );

    await act(async () => {
      runtime.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 6, root: 'header' },
          focus: { path: [0, 0], offset: 6, root: 'header' },
        });
      });
    });

    expect(result.current).toEqual({
      anchor: { path: [0, 0], offset: 6, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    });

    await act(async () => {
      createEditorView(runtime).update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        });
      });
    });

    expect(result.current).toBeNull();
  });

  test('usePliteRootState treats root as a dependency even with custom deps', () => {
    const selector = vi.fn(rootText);
    const RuntimeWrapper = createRuntimeWrapper();

    const { result, rerender } = renderHook(
      ({ root }) => usePliteRootState(root, selector, { deps: [selector] }),
      {
        initialProps: { root: 'header' },
        wrapper: RuntimeWrapper,
      }
    );

    expect(result.current).toBe('header');

    rerender({ root: 'footer' });

    expect(result.current).toBe('footer');
  });

  test('usePliteRuntimeState forwards operations to shouldUpdate filters', async () => {
    let runtime!: ReturnType<typeof usePliteRuntime>;
    const shouldUpdate = vi.fn(() => false);

    const Probe = () => {
      usePliteRuntimeState(rootText, { shouldUpdate });

      return null;
    };

    const RuntimeViews = () => {
      runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Probe />
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      runtime.update((tx) => {
        tx.nodes.insert(paragraph('new'), { at: [1] });
      });
    });

    expect(shouldUpdate).toHaveBeenCalled();
    expect(shouldUpdate.mock.calls.at(-1)).toEqual([
      expect.objectContaining({ childrenChanged: true }),
      expect.arrayContaining([
        expect.objectContaining({ type: 'insert_node' }),
      ]),
    ]);
  });

  test('usePliteRuntimeState catches commits made before runtime subscription starts', async () => {
    const observedValues: string[] = [];

    const Probe = () => {
      const text = usePliteRuntimeState(rootText);

      observedValues.push(text);

      return <span data-testid="runtime-text">{text}</span>;
    };

    const CommitBeforeProviderSubscription = () => {
      const runtime = usePliteRuntime();

      useLayoutEffect(() => {
        runtime.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      }, [runtime]);

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Probe />
          <CommitBeforeProviderSubscription />
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await waitFor(() => {
      expect(screen.getByTestId('runtime-text')).toHaveTextContent('body!');
    });
    expect(observedValues).toContain('body!');
  });

  test('read-only root view rejects writes while sibling root remains writable', async () => {
    const { result } = renderHook(
      () => {
        const editor = useEditor();
        const text = useEditorState(rootText);

        return { editor, text };
      },
      {
        wrapper: ({ children }) => {
          const RuntimeWrapper = createRuntimeWrapper();

          return (
            <RuntimeWrapper>
              <Plite readOnly root="header">
                {children}
              </Plite>
            </RuntimeWrapper>
          );
        },
      }
    );

    expect(result.current.text).toBe('header');
    expect(() =>
      result.current.editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      })
    ).toThrow(/read-only editor view/);

    const main = renderHook(
      () => {
        const editor = useEditor();
        const text = useEditorState(rootText);

        return { editor, text };
      },
      { wrapper: createRootWrapper() }
    );

    await act(async () => {
      main.result.current.editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(main.result.current.text).toBe('body!');
  });

  test('read-only root Plite makes nested Editable read-only', () => {
    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite readOnly root="header">
            <Editable aria-label="Header editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    expect(screen.getByLabelText('Header editor')).toHaveAttribute(
      'contenteditable',
      'true'
    );
    expect(screen.getByLabelText('Header editor')).toHaveAttribute(
      'aria-readonly',
      'true'
    );
  });

  test('root prop Editable inherits read-only from parent Plite', () => {
    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite readOnly>
            <Editable aria-label="Header editor" root="header" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    expect(screen.getByLabelText('Header editor')).toHaveAttribute(
      'contenteditable',
      'true'
    );
    expect(screen.getByLabelText('Header editor')).toHaveAttribute(
      'aria-readonly',
      'true'
    );
  });

  test('explicit-editor Plite readOnly makes nested Editable read-only', () => {
    const editor = createReactEditor({ initialValue: [paragraph('body')] });

    render(
      <Plite editor={editor} readOnly>
        <Editable aria-label="Body editor" />
      </Plite>
    );

    expect(screen.getByLabelText('Body editor')).toHaveAttribute(
      'contenteditable',
      'true'
    );
    expect(screen.getByLabelText('Body editor')).toHaveAttribute(
      'aria-readonly',
      'true'
    );
  });

  test('read-only outside pointer does not clear model selection without root-owned DOM state', () => {
    const editor = createReactEditor({ initialValue: [paragraph('body')] });

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    render(
      <Plite editor={editor} readOnly>
        <Editable aria-label="Body editor" />
      </Plite>
    );

    screen.getByLabelText('Body editor').blur();
    window.getSelection()?.removeAllRanges();

    const update = vi.spyOn(editor, 'update');

    try {
      if (window.PointerEvent) {
        fireEvent.pointerDown(document.body);
      } else {
        fireEvent.mouseDown(document.body);
      }

      expect(update).not.toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    } finally {
      update.mockRestore();
    }
  });

  test('runtime root text sync uses mounted root view editors', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return <Editable aria-label="Header editor" />;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await waitFor(() => {
      expect(screen.getByLabelText('Header editor')).toHaveTextContent(
        'header'
      );
    });

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
    });

    await waitFor(() => {
      expect(didSyncTextPathToDOM(headerEditor, [0, 0])).toBe(true);
    });
    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header!');
  });

  test('runtime root pending native state transforms on mounted root view editors', async () => {
    let mainEditor!: ReturnType<typeof usePliteRuntime>['editor'];
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return <Editable aria-label="Header editor" />;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({
        initialValue: {
          children: [paragraph('body')],
          roots: {
            footer: [paragraph('footer')],
            header: [paragraph('header'), paragraph('pending')],
          },
        },
      });

      mainEditor = runtime.editor;

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await waitFor(() => {
      expect(screen.getByLabelText('Header editor')).toHaveTextContent(
        'headerpending'
      );
    });

    EDITOR_TO_PENDING_DIFFS.set(headerEditor, [
      {
        diff: { end: 2, start: 1, text: 'x' },
        id: 1,
        path: [1, 0],
      },
    ]);
    EDITOR_TO_PENDING_SELECTION.set(headerEditor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
    EDITOR_TO_PENDING_ACTION.set(headerEditor, {
      at: { path: [1, 0], offset: 1 },
      run: vi.fn(),
    });

    await act(async () => {
      mainEditor.update((tx) => {
        tx.nodes.insert(paragraph('new main'), { at: [0] });
      });
    });

    expect(EDITOR_TO_PENDING_DIFFS.get(headerEditor)).toEqual([
      {
        diff: { end: 2, start: 1, text: 'x' },
        id: 1,
        path: [1, 0],
      },
    ]);
    expect(EDITOR_TO_PENDING_SELECTION.get(headerEditor)).toEqual({
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
    expect(EDITOR_TO_PENDING_ACTION.get(headerEditor)?.at).toEqual({
      path: [1, 0],
      offset: 1,
    });

    await act(async () => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('new header'), { at: [0] });
      });
    });

    expect(EDITOR_TO_PENDING_DIFFS.get(headerEditor)).toEqual([
      {
        diff: { end: 2, start: 1, text: 'x' },
        id: 1,
        path: [2, 0],
      },
    ]);
    expect(EDITOR_TO_PENDING_SELECTION.get(headerEditor)).toEqual({
      anchor: { path: [2, 0], offset: 1 },
      focus: { path: [2, 0], offset: 1 },
    });
    expect(EDITOR_TO_PENDING_ACTION.get(headerEditor)?.at).toEqual({
      path: [2, 0],
      offset: 1,
    });
  });

  test('usePliteRootState rerenders for mark-only commits in its root', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    const headerMarks = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const HeaderMarksProbe = () => {
      headerMarks(usePliteRootState('header', (state) => state.marks.get()));

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({
        initialValue: {
          children: [paragraph('body')],
          roots: {
            footer: [paragraph('footer')],
            header: [markedParagraph('header', { bold: true })],
          },
        },
      });

      return (
        <PliteRuntime runtime={runtime}>
          <HeaderMarksProbe />
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 3 },
        });
      });
    });
    await waitFor(() => {
      expect(headerMarks).toHaveBeenLastCalledWith({ bold: true });
    });

    const callCount = headerMarks.mock.calls.length;

    await act(async () => {
      headerEditor.update((tx) => {
        tx.marks.add('italic', true);
      });
    });

    await waitFor(() => {
      expect(headerMarks.mock.calls.length).toBeGreaterThan(callCount);
      expect(headerMarks).toHaveBeenLastCalledWith({
        bold: true,
        italic: true,
      });
    });
  });

  test('runtime views share one document subscription and focus listener pair', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });
      const subscribe = vi.fn(runtime.subscribe);
      const instrumentedRuntime = { ...runtime, subscribe };

      return (
        <PliteRuntime runtime={instrumentedRuntime}>
          <Plite root="header">
            <span />
          </Plite>
          <Plite>
            <span />
          </Plite>
          <Plite root="footer">
            <span />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    expect(
      addEventListener.mock.calls.filter(([event]) => event === 'focusin')
    ).toHaveLength(1);
    expect(
      addEventListener.mock.calls.filter(([event]) => event === 'focusout')
    ).toHaveLength(1);
  });

  test('sibling Plite roots receive distinct editor view objects', () => {
    const seen: unknown[] = [];
    const Probe = () => {
      const editor = useEditor();
      seen.push(editor);

      return null;
    };
    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <Probe />
          </Plite>
          <Plite>
            <Probe />
          </Plite>
          <Plite root="footer">
            <Probe />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    expect(new Set(seen)).toHaveLength(3);
  });

  test('root-bound Plite renders Editable from the selected root', () => {
    const HeaderEditable = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <Editable aria-label="Header editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<HeaderEditable />);

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header');
  });

  test('root-bound Plite exposes DOM APIs bound to the view editor', () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const HeaderEditable = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<HeaderEditable />);

    expect(
      headerEditor.api.dom.hasDOMNode(screen.getByLabelText('Header editor'))
    ).toBe(true);
  });

  test('root-bound Plite clipboard API inserts into the selected root', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
          <Plite>
            <Editable aria-label="Main editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    const clipboard = new FakeDataTransfer();
    clipboard.setData('text/plain', '!');

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 6 });
      });
    });
    await act(async () => {
      headerEditor.update(() => {
        headerEditor.api.clipboard.insertData(
          clipboard as unknown as DataTransfer
        );
      });
    });

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header!');
    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body');
  });

  test('root-bound Plite clipboard API uses runtime extension handlers', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    let insertCount = 0;

    const clipboardExtension = defineEditorExtension({
      name: 'custom-clipboard',
      clipboard: {
        insertData() {
          insertCount++;

          return true;
        },
      },
    });

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({
        extensions: [clipboardExtension],
        initialValue: initialValue(),
      });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
          <Plite>
            <Editable aria-label="Main editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    const clipboard = new FakeDataTransfer();
    clipboard.setData('text/plain', '!');

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 6 });
      });
    });
    await act(async () => {
      headerEditor.update(() => {
        headerEditor.api.clipboard.insertData(
          clipboard as unknown as DataTransfer
        );
      });
    });

    expect(insertCount).toBe(1);
    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header');
    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body');
  });

  test('root-bound Plite tracks focus per view editor', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return (
        <span data-testid="header-focused">{`${useEditorFocused()}`}</span>
      );
    };

    const MainProbe = () => (
      <span data-testid="main-focused">{`${useEditorFocused()}`}</span>
    );

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
          <Plite>
            <MainProbe />
            <Editable aria-label="Main editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.api.dom.focus({ retries: 1 });
      fireEvent.focusIn(screen.getByLabelText('Header editor'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('header-focused')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('main-focused')).toHaveTextContent('false');
  });

  test('single-editor Plite provider tracks focus per nested root view', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return (
        <span data-testid="header-focused">{`${useEditorFocused()}`}</span>
      );
    };

    const MainProbe = () => (
      <span data-testid="main-focused">{`${useEditorFocused()}`}</span>
    );

    render(
      <Plite editor={editor}>
        <Plite root="header">
          <HeaderProbe />
          <Editable aria-label="Header editor" />
        </Plite>
        <Plite>
          <MainProbe />
          <Editable aria-label="Main editor" />
        </Plite>
      </Plite>
    );

    await act(async () => {
      headerEditor.api.dom.focus({ retries: 1 });
      fireEvent.focusIn(screen.getByLabelText('Header editor'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('header-focused')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('main-focused')).toHaveTextContent('false');
  });

  test('root-bound Plite focus preserves the view selection', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
          <Plite>
            <Editable aria-label="Main editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    const expectedSelection = {
      anchor: { path: [0, 0], offset: 6, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    };

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 6 });
      });
    });

    await act(async () => {
      headerEditor.api.dom.focus({ retries: 1 });
      fireEvent.focusIn(screen.getByLabelText('Header editor'));
    });

    expect(headerEditor.read((state) => state.selection.get())).toEqual(
      expectedSelection
    );
  });

  test('root-bound Plite preserves change callbacks for the view root', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
            root="header"
          >
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
    });

    const expectedValue = [paragraph('header!')];

    expect(onChange).toHaveBeenCalledWith(
      expectedValue,
      expect.objectContaining({
        value: expectedValue,
        valueChanged: true,
      })
    );
    expect(onValueChange).toHaveBeenCalledWith(
      expectedValue,
      expect.objectContaining({ valueChanged: true })
    );
    expect(onSelectionChange).not.toHaveBeenCalled();

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 7 });
      });
    });

    const expectedSelection = {
      anchor: { path: [0, 0], offset: 7, root: 'header' },
      focus: { path: [0, 0], offset: 7, root: 'header' },
    };

    expect(onSelectionChange).toHaveBeenCalledWith(
      expectedSelection,
      expect.objectContaining({ selectionChanged: true })
    );
  });

  test('root-bound Plite catches callbacks for commits before view subscription starts', async () => {
    const onValueChange = vi.fn();

    const CommitBeforeViewSubscription = () => {
      const editor = useEditor();

      useLayoutEffect(() => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
        });
      }, [editor]);

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite onValueChange={onValueChange} root="header">
            <CommitBeforeViewSubscription />
            <Editable aria-label="Header editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    const expectedValue = [paragraph('header!')];

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith(
        expectedValue,
        expect.objectContaining({
          value: expectedValue,
          valueChanged: true,
        })
      );
    });
  });

  test('root-bound Plite resets callback baselines when the root changes', async () => {
    let runtime!: ReturnType<typeof usePliteRuntime>;
    const onSelectionChange = vi.fn();

    const RuntimeViews = ({ root }: { root: 'footer' | 'header' }) => {
      runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite onSelectionChange={onSelectionChange} root={root}>
            <Editable aria-label={`${root} editor`} />
          </Plite>
        </PliteRuntime>
      );
    };

    const rendered = render(<RuntimeViews root="header" />);
    const headerEditor = createEditorView(runtime, { root: 'header' });

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 1 });
      });
    });

    onSelectionChange.mockClear();
    rendered.rerender(<RuntimeViews root="footer" />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  test('root-bound Plite skips value callbacks for sibling root edits', async () => {
    let mainEditor!: ReturnType<typeof useEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const MainProbe = () => {
      mainEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
            root="header"
          >
            <Editable aria-label="Header editor" />
          </Plite>
          <Plite>
            <MainProbe />
            <Editable aria-label="Main editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      mainEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  test('root-bound Plite skips value callbacks for sibling root structure edits', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = usePliteRuntime({ initialValue: initialValue() });

      return (
        <PliteRuntime runtime={runtime}>
          <Plite root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Plite>
          <Plite
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
          >
            <Editable aria-label="Main editor" />
          </Plite>
        </PliteRuntime>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('new header'), { at: [1] });
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
