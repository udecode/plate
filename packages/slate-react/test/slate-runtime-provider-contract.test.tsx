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
} from '@platejs/slate';
import {
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_SELECTION,
} from '@platejs/slate-dom/internal';
import {
  createReactEditor,
  Editable,
  Slate,
  SlateRuntime,
  useEditor,
  useEditorFocused,
  useEditorState,
  useSlateActiveRoot,
  useSlateChildRoot,
  useSlateContentRoot,
  useSlateRootEditor,
  useSlateRootState,
  useSlateRuntime,
  useSlateRuntimeState,
} from '../src';
import { didSyncTextPathToDOM } from '../src/hooks/use-slate-node-ref';

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
    const runtime = useSlateRuntime({ initialValue: value });

    return <SlateRuntime runtime={runtime}>{children}</SlateRuntime>;
  };

const createRootWrapper =
  (root?: string) =>
  ({ children }: { children: ReactNode }) => {
    const RuntimeWrapper = createRuntimeWrapper();

    return (
      <RuntimeWrapper>
        <Slate root={root}>{children}</Slate>
      </RuntimeWrapper>
    );
  };

describe('SlateRuntime provider contract', () => {
  test('useSlateChildRoot renders same-runtime rich island content', async () => {
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
    let childEditor!: ReturnType<typeof useSlateRootEditor>;

    const IslandBody = ({ element }: { element: Element }) => {
      const root = useSlateChildRoot(element, 'body');
      const text = useSlateRootState(root, rootText);

      childEditor = useSlateRootEditor(root);

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
      <Slate editor={editor}>
        <Editable
          aria-label="Outer editor"
          renderVoid={({ element }) => <IslandBody element={element} />}
        />
      </Slate>
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

  test('useSlateContentRoot resolves the schema slot and root chrome', async () => {
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
    let contentRootEditor!: ReturnType<typeof useSlateRootEditor>;

    const ContentRoot = ({ element }: { element: Element }) => {
      const { chrome, root } = useSlateContentRoot(element);
      const text = useSlateRootState(root, rootText);

      contentRootEditor = useSlateRootEditor(root);

      return (
        <div data-testid="content-root" {...chrome.props}>
          {root}:{text}
        </div>
      );
    };

    render(
      <Slate editor={editor}>
        <ContentRoot element={element} />
      </Slate>
    );

    await screen.findByText(`${childRoot}:about`);
    expect(screen.getByTestId('content-root')).toHaveAttribute(
      'data-slate-root-chrome',
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
      <Slate editor={editor}>
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
      </Slate>
    );

    await screen.findByLabelText('Details body');
    expect(screen.getByLabelText('Details body')).toHaveTextContent(
      'slot body'
    );
    expect(screen.getByTestId('details-slot')).toHaveAttribute(
      'data-slate-node',
      'element'
    );
  });

  test('Slate editor hosts multiple root-bound Editable surfaces', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useSlateRootEditor>;
    const headerValues: string[] = [];

    const Probe = () => {
      const activeRoot = useSlateActiveRoot();
      const headerText = useSlateRootState('header', rootText);

      headerEditor = useSlateRootEditor('header');
      headerValues.push(headerText);

      return <span data-testid="active-root">{activeRoot ?? 'primary'}</span>;
    };

    render(
      <Slate editor={editor}>
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
        <Editable aria-label="Footer editor" root="footer" />
      </Slate>
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

  test('Slate editor value callbacks ignore sibling root edits', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useSlateRootEditor>;
    const onChange = vi.fn();
    const onValueChange = vi.fn();

    const Probe = () => {
      headerEditor = useSlateRootEditor('header');

      return null;
    };

    render(
      <Slate editor={editor} onChange={onChange} onValueChange={onValueChange}>
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
      </Slate>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('new header'), { at: [1] });
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('Slate editor selection callbacks ignore sibling root selection and marks', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useSlateRootEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const Probe = () => {
      headerEditor = useSlateRootEditor('header');

      return null;
    };

    render(
      <Slate
        editor={editor}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
      >
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
      </Slate>
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

  test('useSlateActiveRoot rerenders only when the active root changes', async () => {
    let runtime!: ReturnType<typeof useSlateRuntime>;
    const activeRoots: (string | undefined)[] = [];

    const Probe = () => {
      const activeRoot = useSlateActiveRoot();

      activeRoots.push(activeRoot);

      return <span data-testid="active-root">{activeRoot ?? 'primary'}</span>;
    };

    const RuntimeViews = () => {
      runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Probe />
        </SlateRuntime>
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

  test('SlateRuntime with Slate defaults to the primary root and Slate root binds another root', () => {
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

  test('Slate root requires SlateRuntime and rejects editor plus root', () => {
    expect(() =>
      render(
        <Slate root="header">
          <span />
        </Slate>
      )
    ).toThrow(/SlateRuntime/);

    const editor = createReactEditor();
    const BadSlate = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate editor={editor} root="header">
            <span />
          </Slate>
        </SlateRuntime>
      );
    };

    expect(() => render(<BadSlate />)).toThrow(/editor.*root|root.*editor/i);
  });

  test('nested SlateRuntime providers isolate runtime selectors', () => {
    const OuterRuntime = createRuntimeWrapper({
      children: [paragraph('outer')],
    });
    const InnerRuntime = createRuntimeWrapper({
      children: [paragraph('inner')],
    });

    const { result } = renderHook(() => useSlateRuntimeState(rootText), {
      wrapper: ({ children }) => (
        <OuterRuntime>
          <InnerRuntime>{children}</InnerRuntime>
        </OuterRuntime>
      ),
    });

    expect(result.current).toBe('inner');
  });

  test('useSlateRootState reads a sibling root without prop-drilled editors', async () => {
    let runtime!: ReturnType<typeof useSlateRuntime>;
    const headerSelector = vi.fn(rootText);
    const RuntimeWrapper = ({ children }: { children: ReactNode }) => {
      runtime = useSlateRuntime({ initialValue: initialValue() });

      return <SlateRuntime runtime={runtime}>{children}</SlateRuntime>;
    };

    const { result } = renderHook(
      () => useSlateRootState('header', headerSelector),
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

  test('useSlateRootState clears selection when focus moves to another root', async () => {
    let runtime!: ReturnType<typeof useSlateRuntime>;
    const RuntimeWrapper = ({ children }: { children: ReactNode }) => {
      runtime = useSlateRuntime({ initialValue: initialValue() });

      return <SlateRuntime runtime={runtime}>{children}</SlateRuntime>;
    };

    const { result } = renderHook(
      () => useSlateRootState('header', (state) => state.selection.get()),
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

  test('useSlateRootState treats root as a dependency even with custom deps', () => {
    const selector = vi.fn(rootText);
    const RuntimeWrapper = createRuntimeWrapper();

    const { result, rerender } = renderHook(
      ({ root }) => useSlateRootState(root, selector, { deps: [selector] }),
      {
        initialProps: { root: 'header' },
        wrapper: RuntimeWrapper,
      }
    );

    expect(result.current).toBe('header');

    rerender({ root: 'footer' });

    expect(result.current).toBe('footer');
  });

  test('useSlateRuntimeState forwards operations to shouldUpdate filters', async () => {
    let runtime!: ReturnType<typeof useSlateRuntime>;
    const shouldUpdate = vi.fn(() => false);

    const Probe = () => {
      useSlateRuntimeState(rootText, { shouldUpdate });

      return null;
    };

    const RuntimeViews = () => {
      runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Probe />
        </SlateRuntime>
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

  test('useSlateRuntimeState catches commits made before runtime subscription starts', async () => {
    const observedValues: string[] = [];

    const Probe = () => {
      const text = useSlateRuntimeState(rootText);

      observedValues.push(text);

      return <span data-testid="runtime-text">{text}</span>;
    };

    const CommitBeforeProviderSubscription = () => {
      const runtime = useSlateRuntime();

      useLayoutEffect(() => {
        runtime.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      }, [runtime]);

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Probe />
          <CommitBeforeProviderSubscription />
        </SlateRuntime>
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
              <Slate readOnly root="header">
                {children}
              </Slate>
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

  test('read-only root Slate makes nested Editable read-only', () => {
    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate readOnly root="header">
            <Editable aria-label="Header editor" />
          </Slate>
        </SlateRuntime>
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

  test('root prop Editable inherits read-only from parent Slate', () => {
    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate readOnly>
            <Editable aria-label="Header editor" root="header" />
          </Slate>
        </SlateRuntime>
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

  test('explicit-editor Slate readOnly makes nested Editable read-only', () => {
    const editor = createReactEditor({ initialValue: [paragraph('body')] });

    render(
      <Slate editor={editor} readOnly>
        <Editable aria-label="Body editor" />
      </Slate>
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
      <Slate editor={editor} readOnly>
        <Editable aria-label="Body editor" />
      </Slate>
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
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
          </Slate>
        </SlateRuntime>
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
    let mainEditor!: ReturnType<typeof useSlateRuntime>['editor'];
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return <Editable aria-label="Header editor" />;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({
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
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
          </Slate>
        </SlateRuntime>
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

  test('useSlateRootState rerenders for mark-only commits in its root', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    const headerMarks = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const HeaderMarksProbe = () => {
      headerMarks(useSlateRootState('header', (state) => state.marks.get()));

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({
        initialValue: {
          children: [paragraph('body')],
          roots: {
            footer: [paragraph('footer')],
            header: [markedParagraph('header', { bold: true })],
          },
        },
      });

      return (
        <SlateRuntime runtime={runtime}>
          <HeaderMarksProbe />
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
        </SlateRuntime>
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
      const runtime = useSlateRuntime({ initialValue: initialValue() });
      const subscribe = vi.fn(runtime.subscribe);
      const instrumentedRuntime = { ...runtime, subscribe };

      return (
        <SlateRuntime runtime={instrumentedRuntime}>
          <Slate root="header">
            <span />
          </Slate>
          <Slate>
            <span />
          </Slate>
          <Slate root="footer">
            <span />
          </Slate>
        </SlateRuntime>
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

  test('sibling Slate roots receive distinct editor view objects', () => {
    const seen: unknown[] = [];
    const Probe = () => {
      const editor = useEditor();
      seen.push(editor);

      return null;
    };
    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <Probe />
          </Slate>
          <Slate>
            <Probe />
          </Slate>
          <Slate root="footer">
            <Probe />
          </Slate>
        </SlateRuntime>
      );
    };

    render(<RuntimeViews />);

    expect(new Set(seen)).toHaveLength(3);
  });

  test('root-bound Slate renders Editable from the selected root', () => {
    const HeaderEditable = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <Editable aria-label="Header editor" />
          </Slate>
        </SlateRuntime>
      );
    };

    render(<HeaderEditable />);

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header');
  });

  test('root-bound Slate exposes DOM APIs bound to the view editor', () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const HeaderEditable = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
        </SlateRuntime>
      );
    };

    render(<HeaderEditable />);

    expect(
      headerEditor.api.dom.hasDOMNode(screen.getByLabelText('Header editor'))
    ).toBe(true);
  });

  test('root-bound Slate clipboard API inserts into the selected root', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
          <Slate>
            <Editable aria-label="Main editor" />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate clipboard API uses runtime extension handlers', async () => {
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
      const runtime = useSlateRuntime({
        extensions: [clipboardExtension],
        initialValue: initialValue(),
      });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
          <Slate>
            <Editable aria-label="Main editor" />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate tracks focus per view editor', async () => {
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
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
          <Slate>
            <MainProbe />
            <Editable aria-label="Main editor" />
          </Slate>
        </SlateRuntime>
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

  test('single-editor Slate provider tracks focus per nested root view', async () => {
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
      <Slate editor={editor}>
        <Slate root="header">
          <HeaderProbe />
          <Editable aria-label="Header editor" />
        </Slate>
        <Slate>
          <MainProbe />
          <Editable aria-label="Main editor" />
        </Slate>
      </Slate>
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

  test('root-bound Slate focus preserves the view selection', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
          <Slate>
            <Editable aria-label="Main editor" />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate preserves change callbacks for the view root', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
            root="header"
          >
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate catches callbacks for commits before view subscription starts', async () => {
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
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate onValueChange={onValueChange} root="header">
            <CommitBeforeViewSubscription />
            <Editable aria-label="Header editor" />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate resets callback baselines when the root changes', async () => {
    let runtime!: ReturnType<typeof useSlateRuntime>;
    const onSelectionChange = vi.fn();

    const RuntimeViews = ({ root }: { root: 'footer' | 'header' }) => {
      runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate onSelectionChange={onSelectionChange} root={root}>
            <Editable aria-label={`${root} editor`} />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate skips value callbacks for sibling root edits', async () => {
    let mainEditor!: ReturnType<typeof useEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const MainProbe = () => {
      mainEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
            root="header"
          >
            <Editable aria-label="Header editor" />
          </Slate>
          <Slate>
            <MainProbe />
            <Editable aria-label="Main editor" />
          </Slate>
        </SlateRuntime>
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

  test('root-bound Slate skips value callbacks for sibling root structure edits', async () => {
    let headerEditor!: ReturnType<typeof useEditor>;
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditor();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useSlateRuntime({ initialValue: initialValue() });

      return (
        <SlateRuntime runtime={runtime}>
          <Slate root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </Slate>
          <Slate
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
          >
            <Editable aria-label="Main editor" />
          </Slate>
        </SlateRuntime>
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
