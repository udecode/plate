import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  createEditorView,
  type Descendant,
  definePlugin,
  defineEditorSchema,
  definePluginSlot,
  definePluginPoint,
  type Element,
  type EditorCommit,
  type InitialValue,
  type Value,
  NodeApi,
  schema,
} from 'plitejs';
import { domCommands } from 'plitejs/dom';
import {
  createContext,
  type ReactNode,
  useContext,
  useLayoutEffect,
} from 'react';

import { getPluginContributions } from '../../src/core/plugin';
import {
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_SELECTION,
} from '../../src/dom/internal';
import {
  createEditor,
  Editable,
  EditorRoot as ProductEditorRoot,
  useEditorContext,
  useEditorFocused,
  useEditorSelector,
  useEditorState,
  useActiveRoot,
  useChildRoot,
  useContentRoot,
  useRootEditor,
  useRootState,
  useEditor,
  useRuntimeState,
} from '../../src/react';
import { getMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { didSyncTextPathToDOM } from '../../src/react/hooks/use-plite-node-ref';
import {
  PliteRuntimeProvider,
  useMountedEditorRuntimeOwner,
} from '../../src/react/hooks/use-plite-runtime';

const TestEditorContext = createContext<ReturnType<
  typeof useEditor<any, any>
> | null>(null);

const useTestEditor = <
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  options?: Parameters<typeof useEditor<V, TPlugins>>[0]
) => {
  const inheritedEditor = useContext(TestEditorContext);
  const createdEditor = useEditor<V, TPlugins>(options);
  const editor =
    inheritedEditor && options === undefined
      ? (inheritedEditor as unknown as typeof createdEditor)
      : createdEditor;

  return Object.assign(editor, { editor });
};

const TestProvider = <
  V extends Value,
  const TPlugins extends readonly unknown[],
>({
  children,
  runtime,
}: {
  children: ReactNode;
  runtime: ReturnType<typeof useTestEditor<V, TPlugins>>;
}) => {
  useMountedEditorRuntimeOwner('EditorRoot', runtime.editor);

  return (
    <TestEditorContext
      value={
        runtime.editor as unknown as ReturnType<typeof useEditor<any, any>>
      }
    >
      <PliteRuntimeProvider editor={runtime.editor}>
        {children}
      </PliteRuntimeProvider>
    </TestEditorContext>
  );
};

const TestRoot = ({ editor, ...props }: any) => {
  const inheritedEditor = useContext(TestEditorContext);
  const resolvedEditor = editor ?? inheritedEditor;

  if (!resolvedEditor) throw new Error('Expected a test editor.');

  return (
    <TestEditorContext value={resolvedEditor}>
      <ProductEditorRoot {...props} editor={resolvedEditor} />
    </TestEditorContext>
  );
};

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const markedParagraph = (
  text: string,
  marks: Record<string, unknown>
): Element => ({
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

const rootText = (state: {
  nodes: { children: () => readonly Descendant[] };
}) => {
  const [firstBlock] = state.nodes.children();

  return firstBlock ? NodeApi.string(firstBlock) : '';
};

const initialValue = (): InitialValue => ({
  children: [paragraph('body')],
  roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
});

const formCard = defineEditorSchema('schema:test-form-card', {
  elements: {
    'editable-void': {
      contentRoots: {
        body: schema.content.not(schema.content.text()),
      },
      void: 'block',
    },
  },
  id: 'test-form-card',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const contentRootPlugin = defineEditorSchema('schema:test-content-root', {
  elements: {
    'details-content': {
      content: schema.content.open(),
      contentRoots: {
        body: schema.content.not(schema.content.text()),
      },
    },
  },
  id: 'test-content-root',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const createProviderWrapper =
  (value: InitialValue = initialValue()) =>
  ({ children }: { children: ReactNode }) => {
    const runtime = useTestEditor({ initialValue: value });

    return <TestProvider runtime={runtime}>{children}</TestProvider>;
  };

const createRootWrapper =
  (root?: string) =>
  ({ children }: { children: ReactNode }) => {
    const ProviderWrapper = createProviderWrapper();

    return (
      <ProviderWrapper>
        <TestRoot root={root}>{children}</TestRoot>
      </ProviderWrapper>
    );
  };

describe('EditorRoot provider contract', () => {
  test('rejects replacing a mounted runtime owner', () => {
    const runtimeA = renderHook(() =>
      useTestEditor({ initialValue: [paragraph('A')] })
    ).result.current;
    const runtimeB = renderHook(() =>
      useTestEditor({ initialValue: [paragraph('B')] })
    ).result.current;
    const rendered = render(
      <TestProvider runtime={runtimeA}>
        <span>runtime</span>
      </TestProvider>
    );

    expect(() =>
      rendered.rerender(
        <TestProvider runtime={runtimeB}>
          <span>runtime</span>
        </TestProvider>
      )
    ).toThrow(
      '[EditorRoot] Cannot replace the editor runtime of a mounted provider. Remount <EditorRoot> with a different React key.'
    );
  });

  test('provides a replacement runtime after a keyed remount', () => {
    const runtimeA = renderHook(() =>
      useTestEditor({ initialValue: [paragraph('A')] })
    ).result.current;
    const runtimeB = renderHook(() =>
      useTestEditor({ initialValue: [paragraph('B')] })
    ).result.current;
    const Probe = () => (
      <span data-testid="runtime-value">{useRuntimeState(rootText)}</span>
    );
    const rendered = render(
      <TestProvider key="runtime-a" runtime={runtimeA}>
        <Probe />
      </TestProvider>
    );

    expect(rendered.getByTestId('runtime-value')).toHaveTextContent('A');

    rendered.rerender(
      <TestProvider key="runtime-b" runtime={runtimeB}>
        <Probe />
      </TestProvider>
    );

    expect(rendered.getByTestId('runtime-value')).toHaveTextContent('B');
  });

  test('publishes one React runtime revision for slot reconfiguration', async () => {
    const mode = definePluginPoint<string>('react-runtime-configuration-mode');
    const slot = definePluginSlot('react-runtime-configuration-mode');
    const plugin = (value: string) =>
      definePlugin(`react-runtime-configuration-mode-${value}`, {
        contributions: [mode.of(value)],
      });
    const editor = createEditor({
      plugins: [slot.of(plugin('read'))] as const,
      initialValue: [paragraph('body')],
    });
    const renders: string[] = [];
    const Probe = () => {
      const value = useEditorState(
        () => getPluginContributions(editor, mode).at(-1) ?? 'missing'
      );

      renders.push(value);

      return <span data-testid="configuration-mode">{value}</span>;
    };

    render(
      <TestRoot editor={editor}>
        <Probe />
      </TestRoot>
    );

    expect(screen.getByTestId('configuration-mode')).toHaveTextContent('read');

    await act(async () => {
      editor.update((tx) => {
        tx.plugins.reconfigure(slot, plugin('write'));
      });
    });

    expect(screen.getByTestId('configuration-mode')).toHaveTextContent('write');
    expect(renders.at(-1)).toBe('write');
  });

  test('usePliteChildRoot renders same-runtime rich island content', async () => {
    const childRoot = 'island-a:body';
    const editor = createEditor({
      plugins: [formCard],
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
    let childEditor!: ReturnType<typeof useRootEditor>;

    const IslandBody = ({ element }: { element: Element }) => {
      const root = useChildRoot(element, 'body');
      const text = useRootState(root, rootText);

      childEditor = useRootEditor(root);

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
      <TestRoot editor={editor}>
        <Editable
          aria-label="Outer editor"
          renderVoid={({ element }) => <IslandBody element={element} />}
        />
      </TestRoot>
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
    expect(editor.read((state) => state.children())).toMatchObject([
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
    const editor = createEditor({
      plugins: [contentRootPlugin],
      initialValue: {
        children: [element],
        roots: { [childRoot]: [paragraph('about')] },
      },
    });
    let contentRootEditor!: ReturnType<typeof useRootEditor>;

    const ContentRoot = ({ element: innerElement }: { element: Element }) => {
      const { chrome, root } = useContentRoot(innerElement);
      const text = useRootState(root, rootText);

      contentRootEditor = useRootEditor(root);

      return (
        <div data-testid="content-root" {...chrome.props}>
          {root}:{text}
        </div>
      );
    };

    render(
      <TestRoot editor={editor}>
        <ContentRoot element={element} />
      </TestRoot>
    );

    await screen.findByText(`${childRoot}:about`);
    expect(screen.getByTestId('content-root')).toHaveAttribute(
      'data-editor-root-chrome',
      childRoot
    );
    expect(contentRootEditor.root).toBe(childRoot);
  });

  test('usePliteContentRoot requires a slot for multi-slot elements', () => {
    const bodyRoot = 'details-multi:body';
    const captionRoot = 'details-multi:caption';
    const multiSlotSchema = defineEditorSchema(
      'schema:test-content-root-multi-slot',
      {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
          'details-content': {
            content: schema.content.open(),
            contentRoots: {
              body: schema.content.type('paragraph'),
              caption: schema.content.type('paragraph'),
            },
          },
        },
        id: 'test-content-root-multi-slot',
        root: schema.content.type('details-content'),
        unknown: 'reject',
        version: 1,
      }
    );
    const element = {
      type: 'details-content',
      childRoots: { body: bodyRoot, caption: captionRoot },
      children: [{ text: '' }],
    } satisfies Element & { childRoots: Record<string, string> };
    const editor = createEditor({
      plugins: [multiSlotSchema],
      initialValue: {
        children: [element],
        roots: {
          [bodyRoot]: [paragraph('body')],
          [captionRoot]: [paragraph('caption')],
        },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestRoot editor={editor}>{children}</TestRoot>
    );

    expect(() =>
      renderHook(() => useContentRoot(element), { wrapper })
    ).toThrow(/pass options\.slot/);

    const { result } = renderHook(
      () => useContentRoot(element, { slot: 'caption' }),
      { wrapper }
    );

    expect(result.current.root).toBe(captionRoot);
  });

  test('renderElement contentRoot slot mounts same-runtime root content', async () => {
    const childRoot = 'details-slot:body';
    const element = {
      type: 'details-content',
      childRoots: { body: childRoot },
      children: [{ text: '' }],
    } satisfies Element & { childRoots: Record<string, string> };
    const editor = createEditor({
      plugins: [contentRootPlugin],
      initialValue: {
        children: [element],
        roots: { [childRoot]: [paragraph('slot body')] },
      },
    });

    render(
      <TestRoot editor={editor}>
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
      </TestRoot>
    );

    await screen.findByLabelText('Details body');
    expect(screen.getByLabelText('Details body')).toHaveTextContent(
      'slot body'
    );
    expect(screen.getByTestId('details-slot')).toHaveAttribute(
      'data-editor-node',
      'element'
    );
  });

  test('Plite editor hosts multiple root-bound Editable surfaces', async () => {
    const editor = createEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useRootEditor>;
    const headerValues: string[] = [];

    const Probe = () => {
      const activeRoot = useActiveRoot();
      const headerText = useRootState('header', rootText);

      headerEditor = useRootEditor('header');
      headerValues.push(headerText);

      return <span data-testid="active-root">{activeRoot ?? 'primary'}</span>;
    };

    render(
      <TestRoot editor={editor}>
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
        <Editable aria-label="Footer editor" root="footer" />
      </TestRoot>
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

  test('Plite onCommit observes sibling root edits while value callbacks ignore them', async () => {
    const editor = createEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useRootEditor>;
    let mountedEditor!: ReturnType<typeof useEditorContext>;
    const onCommit = vi.fn();
    const onValueChange = vi.fn();

    const Probe = () => {
      mountedEditor = useEditorContext();
      headerEditor = useRootEditor('header');

      return null;
    };

    render(
      <TestRoot
        editor={editor}
        onCommit={onCommit}
        onValueChange={onValueChange}
      >
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
      </TestRoot>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('new header'), { at: [1] });
      });
    });

    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({ editor: mountedEditor })
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test.each(['direct', 'runtime'] as const)(
    'Plite %s callbacks publish nested commits in version order with paired snapshots',
    async (mode) => {
      const { result } = renderHook(() =>
        useTestEditor({ initialValue: [paragraph('body')] })
      );
      const { editor } = result.current;
      const onCommit = vi.fn();
      const onValueChange = vi.fn();
      const outerVersion = editor.read.runtime.snapshot().version + 1;
      let nested = false;

      editor.subscribeCommit((commit) => {
        if (nested || !commit.changed.has('text')) return;

        nested = true;
        editor.update((tx) => {
          tx.text.insert('?', { at: { path: [0, 0], offset: 5 } });
        });
      });

      render(
        mode === 'direct' ? (
          <TestRoot
            editor={editor}
            onCommit={onCommit}
            onValueChange={onValueChange}
          >
            <span />
          </TestRoot>
        ) : (
          <TestProvider runtime={result.current}>
            <TestRoot onCommit={onCommit} onValueChange={onValueChange}>
              <span />
            </TestRoot>
          </TestProvider>
        )
      );

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      });

      expect(onCommit).toHaveBeenCalledTimes(2);
      expect(onValueChange).toHaveBeenCalledTimes(2);

      expect(
        onCommit.mock.calls.map(([context]) => context.commit.version)
      ).toEqual([outerVersion, outerVersion + 1]);
      expect(
        onValueChange.mock.calls.map(([context]) => context.commit.version)
      ).toEqual([outerVersion, outerVersion + 1]);
      expect(
        [
          ...onCommit.mock.calls.map(([context], index) => ({
            kind: 'commit',
            order: onCommit.mock.invocationCallOrder[index],
            version: context.commit.version,
          })),
          ...onValueChange.mock.calls.map(([context], index) => ({
            kind: 'value',
            order: onValueChange.mock.invocationCallOrder[index],
            version: context.commit.version,
          })),
        ]
          .sort((a, b) => a.order - b.order)
          .map(({ kind, version }) => `${kind}:${version}`)
      ).toEqual([
        `commit:${outerVersion}`,
        `value:${outerVersion}`,
        `commit:${outerVersion + 1}`,
        `value:${outerVersion + 1}`,
      ]);

      for (const [context] of onCommit.mock.calls) {
        expect(context.snapshot.version).toBe(context.commit.version);
      }
      for (const [context] of onValueChange.mock.calls) {
        expect(context.snapshot.version).toBe(context.commit.version);
        expect(context.value).toBe(context.snapshot.children);
      }

      const outerCommit = onValueChange.mock.calls
        .map(([context]) => context)
        .find((context) => context.commit.version === outerVersion);

      expect(outerCommit).toEqual(
        expect.objectContaining({
          snapshot: expect.objectContaining({
            children: [paragraph('body!')],
            version: outerVersion,
          }),
          value: [paragraph('body!')],
        })
      );
    }
  );

  test('Plite onCommit observes sibling commits while selection callbacks stay root-scoped', async () => {
    const editor = createEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useRootEditor>;
    let mountedEditor!: ReturnType<typeof useEditorContext>;
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const Probe = () => {
      mountedEditor = useEditorContext();
      headerEditor = useRootEditor('header');

      return null;
    };

    render(
      <TestRoot
        editor={editor}
        onCommit={onCommit}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
      >
        <Probe />
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Main editor" />
      </TestRoot>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();

    await act(async () => {
      headerEditor.update((tx) => {
        tx.marks.add('bold', true);
      });
    });

    expect(onCommit).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    const expectedSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    expect(onCommit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        editor: mountedEditor,
        snapshot: expect.objectContaining({ selection: expectedSelection }),
      })
    );
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: mountedEditor,
        selection: expectedSelection,
        snapshot: expect.objectContaining({ selection: expectedSelection }),
      })
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('usePliteActiveRoot rerenders only when the active root changes', async () => {
    let runtime!: ReturnType<typeof useTestEditor>;
    const activeRoots: Array<string | undefined> = [];

    const Probe = () => {
      const activeRoot = useActiveRoot();

      activeRoots.push(activeRoot);

      return <span data-testid="active-root">{activeRoot ?? 'primary'}</span>;
    };

    const RuntimeViews = () => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <Probe />
        </TestProvider>
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
      createEditorView(runtime.editor, { root: 'header' }).update((tx) => {
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

    expect(main.result.current).toEqual({ root: undefined, text: 'body' });

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

  test('EditorRoot requires an editor and accepts an explicit root', () => {
    expect(() =>
      render(
        <ProductEditorRoot {...({ root: 'header' } as any)}>
          <span />
        </ProductEditorRoot>
      )
    ).toThrow(/editor is invalid/);

    const editor = createEditor({ initialValue: initialValue() });
    const rendered = render(
      <ProductEditorRoot editor={editor} root="header">
        <Editable aria-label="Header editor" />
      </ProductEditorRoot>
    );

    expect(rendered.getByLabelText('Header editor')).toHaveTextContent(
      'header'
    );
  });

  test('nested PliteRuntime providers isolate runtime selectors', () => {
    const OuterProvider = createProviderWrapper({
      children: [paragraph('outer')],
    });
    const InnerProvider = createProviderWrapper({
      children: [paragraph('inner')],
    });

    const { result } = renderHook(() => useRuntimeState(rootText), {
      wrapper: ({ children }) => (
        <OuterProvider>
          <InnerProvider>{children}</InnerProvider>
        </OuterProvider>
      ),
    });

    expect(result.current).toBe('inner');
  });

  test('usePliteRootState reads a sibling root without prop-drilled editors', async () => {
    let runtime!: ReturnType<typeof useTestEditor>;
    const headerSelector = vi.fn(rootText);
    const ProviderWrapper = ({ children }: { children: ReactNode }) => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return <TestProvider runtime={runtime}>{children}</TestProvider>;
    };

    const { result } = renderHook(
      () => useRootState('header', headerSelector),
      { wrapper: ProviderWrapper }
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
    let runtime!: ReturnType<typeof useTestEditor>;
    const ProviderWrapper = ({ children }: { children: ReactNode }) => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return <TestProvider runtime={runtime}>{children}</TestProvider>;
    };

    const { result } = renderHook(
      () => useRootState('header', (state) => state.selection()),
      { wrapper: ProviderWrapper }
    );

    await act(async () => {
      runtime.update((tx) => {
        tx.selection.set({
          kind: 'text',
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
      createEditorView(runtime.editor).update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        });
      });
    });

    expect(result.current).toBeNull();
  });

  test('usePliteRootState observes root changes with an inline selector', () => {
    const selector = vi.fn(rootText);
    const ProviderWrapper = createProviderWrapper();

    const { result, rerender } = renderHook(
      ({ root }) => useRootState(root, selector),
      {
        initialProps: { root: 'header' },
        wrapper: ProviderWrapper,
      }
    );

    expect(result.current).toBe('header');

    rerender({ root: 'footer' });

    expect(result.current).toBe('footer');
  });

  test('root changes cancel deferred selector work from the previous view', async () => {
    let runtime!: ReturnType<typeof useTestEditor>;
    const selectRootText = (editor: ReturnType<typeof createEditor>) =>
      editor.read(rootText);
    const selector = vi.fn(selectRootText);

    const Probe = () => (
      <span data-testid="deferred-root-value">
        {useEditorSelector(selector, { deferred: true })}
      </span>
    );
    const RuntimeViews = ({ root }: { root: 'footer' | 'header' }) => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root={root}>
            <Probe />
          </TestRoot>
        </TestProvider>
      );
    };

    const rendered = render(<RuntimeViews root="header" />);
    const headerEditor = createEditorView(runtime.editor, { root: 'header' });

    expect(rendered.getByTestId('deferred-root-value')).toHaveTextContent(
      'header'
    );

    act(() => {
      headerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
      rendered.rerender(<RuntimeViews root="footer" />);
    });

    const callsAfterRootChange = selector.mock.calls.length;

    expect(rendered.getByTestId('deferred-root-value')).toHaveTextContent(
      'footer'
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(selector).toHaveBeenCalledTimes(callsAfterRootChange);

    const footerEditor = createEditorView(runtime.editor, { root: 'footer' });
    const callsBeforeFooterCommit = selector.mock.calls.length;

    act(() => {
      footerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(rendered.getByTestId('deferred-root-value')).toHaveTextContent(
      'footer!'
    );
    expect(selector).toHaveBeenCalledTimes(callsBeforeFooterCommit + 1);
  });

  test('usePliteRuntimeState forwards commits to shouldUpdate filters', async () => {
    let runtime!: ReturnType<typeof useTestEditor>;
    const shouldUpdate = vi.fn<(change?: EditorCommit) => boolean>(() => false);

    const Probe = () => {
      useRuntimeState(rootText, { shouldUpdate });

      return null;
    };

    const RuntimeViews = () => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <Probe />
        </TestProvider>
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
      expect.objectContaining({
        changed: expect.objectContaining({
          has: expect.any(Function),
        }),
      }),
    ]);
    expect(shouldUpdate.mock.calls.at(-1)?.[0]?.changed.has('document')).toBe(
      true
    );
  });

  test('runtime selectors catch up when changed filters miss a child layout commit', () => {
    let runtime!: ReturnType<typeof useTestEditor>;

    const CommitFromChildLayout = ({ text }: { text?: string }) => {
      useLayoutEffect(() => {
        if (!text) return;

        runtime.update((tx) => {
          tx.text.insert(text, { at: { path: [0, 0], offset: 4 } });
        });
      }, [text]);

      return null;
    };
    const Probe = ({ allow, insert }: { allow: boolean; insert?: string }) => {
      const runtimeText = useRuntimeState(rootText, {
        shouldUpdate: () => allow,
      });
      const primaryRootText = useRootState(undefined, rootText, {
        shouldUpdate: () => allow,
      });

      return (
        <>
          <span data-testid="runtime-filter-text">{runtimeText}</span>
          <span data-testid="root-filter-text">{primaryRootText}</span>
          <CommitFromChildLayout text={insert} />
        </>
      );
    };
    const RuntimeViews = ({
      allow,
      insert,
    }: {
      allow: boolean;
      insert?: string;
    }) => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <Probe allow={allow} insert={insert} />
        </TestProvider>
      );
    };
    const rendered = render(<RuntimeViews allow={false} />);

    rendered.rerender(<RuntimeViews allow insert="!" />);

    expect(rendered.getByTestId('runtime-filter-text')).toHaveTextContent(
      'body!'
    );
    expect(rendered.getByTestId('root-filter-text')).toHaveTextContent('body!');
  });

  test('usePliteRuntimeState catches commits made before runtime subscription starts', async () => {
    const observedValues: string[] = [];

    const Probe = () => {
      const text = useRuntimeState(rootText);

      observedValues.push(text);

      return <span data-testid="runtime-text">{text}</span>;
    };

    const CommitBeforeProviderSubscription = () => {
      const runtime = useTestEditor();

      useLayoutEffect(() => {
        runtime.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      }, [runtime]);

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <Probe />
          <CommitBeforeProviderSubscription />
        </TestProvider>
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
        const editor = useEditorContext();
        const text = useEditorState(rootText);

        return { editor, text };
      },
      {
        wrapper: ({ children }) => {
          const ProviderWrapper = createProviderWrapper();

          return (
            <ProviderWrapper>
              <TestRoot readOnly root="header">
                {children}
              </TestRoot>
            </ProviderWrapper>
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
        const editor = useEditorContext();
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

  test('mounted command views retain identity across permission changes and reject stale writes after unmount', () => {
    const editor = createEditor({ initialValue: initialValue() });
    let view: ReturnType<typeof useEditorContext> | undefined;
    const Capture = () => {
      view = useEditorContext();
      return <Editable aria-label="view" />;
    };
    const App = ({ readOnly = false }: { readOnly?: boolean }) => (
      <TestRoot editor={editor}>
        <TestRoot readOnly={readOnly}>
          <Capture />
        </TestRoot>
      </TestRoot>
    );
    const result = render(<App />);
    const captured = view!;
    const { insert } = captured.update.text;
    result.rerender(<App readOnly />);
    expect(view).toBe(captured);
    expect(captured.read.view.isReadOnly()).toBe(true);
    expect(() => insert('!', { at: { path: [0, 0], offset: 4 } })).toThrow(
      /read-only/
    );
    result.rerender(<App />);
    expect(view).toBe(captured);
    act(() => insert('!', { at: { path: [0, 0], offset: 4 } }));
    expect(editor.read.text.string([])).toBe('body!');
    result.unmount();
    expect(() => insert('!', { at: { path: [0, 0], offset: 4 } })).toThrow(
      /read-only/
    );
  });

  test('read-only root Plite makes nested Editable read-only', () => {
    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot readOnly root="header">
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
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
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot readOnly>
            <Editable aria-label="Header editor" root="header" />
          </TestRoot>
        </TestProvider>
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
    const editor = createEditor({ initialValue: [paragraph('body')] });

    render(
      <TestRoot editor={editor} readOnly>
        <Editable aria-label="Body editor" />
      </TestRoot>
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
    const editor = createEditor({ initialValue: [paragraph('body')] });

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    render(
      <TestRoot editor={editor} readOnly>
        <Editable aria-label="Body editor" />
      </TestRoot>
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
      expect(editor.read((state) => state.selection())).toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    } finally {
      update.mockRestore();
    }
  });

  for (const event of ['selectionchange', 'mousedown']) {
    test(`read-only sibling preserves the writable view selection after ${event}`, async () => {
      const editor = createEditor({ initialValue: [paragraph('body')] });

      render(
        <TestRoot editor={editor}>
          <Editable aria-label="Writable view" />
          <TestRoot editor={editor} readOnly>
            <Editable aria-label="Read-only sibling" />
          </TestRoot>
        </TestRoot>
      );

      const writable = screen.getByLabelText('Writable view');
      const text = document
        .createTreeWalker(writable, NodeFilter.SHOW_TEXT)
        .nextNode()!;
      const selection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };

      await act(async () => {
        writable.focus();
        editor.update.selection.set(selection);
        const range = document.createRange();
        range.setStart(text, 1);
        range.collapse(true);
        window.getSelection()!.removeAllRanges();
        window.getSelection()!.addRange(range);
        if (event === 'mousedown') fireEvent.mouseDown(writable);
        else fireEvent(document, new Event('selectionchange'));
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 200);
        });
      });

      expect(editor.read.selection()).toEqual(selection);
      expect(window.getSelection()?.anchorNode).toBe(text);
      expect(window.getSelection()?.anchorOffset).toBe(1);
      expect(document.activeElement).toBe(writable);
    });
  }

  test('leaving a read-only editor clears its selection while preserving an independent editor', async () => {
    const previous = createEditor({ initialValue: [paragraph('previous')] });
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    previous.update.selection.set(selection);

    render(
      <>
        <TestRoot editor={previous} readOnly>
          <Editable aria-label="Previous editor" />
        </TestRoot>
        <TestRoot editor={editor}>
          <Editable aria-label="Independent editor" />
        </TestRoot>
      </>
    );

    const writable = screen.getByLabelText('Independent editor');
    const text = document
      .createTreeWalker(writable, NodeFilter.SHOW_TEXT)
      .nextNode()!;
    await act(async () => {
      writable.focus();
      editor.update.selection.set(selection);
      const range = document.createRange();
      range.setStart(text, 1);
      range.collapse(true);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      fireEvent.mouseDown(writable);
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 200);
      });
    });

    expect(previous.read.selection()).toBeNull();
    expect(editor.read.selection()).toEqual(selection);
    expect(document.activeElement).toBe(writable);
  });

  test('runtime root text sync uses mounted root view editors', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return <Editable aria-label="Header editor" />;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
          </TestRoot>
        </TestProvider>
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

  test('runtime text sync leaves composing DOM under native ownership', async () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    let mountedEditor!: ReturnType<typeof useEditorContext>;
    const CaptureEditor = () => {
      mountedEditor = useEditorContext();

      return null;
    };

    render(
      <TestRoot editor={editor}>
        <CaptureEditor />
        <Editable aria-label="Body editor" />
      </TestRoot>
    );

    const runtime = getMountedEditableDOMRuntime(mountedEditor)!;
    act(() => runtime.setComposing(true));

    try {
      const textHost = screen
        .getByLabelText('Body editor')
        .querySelector<HTMLElement>('[data-editor-node="text"]');
      const textNode =
        textHost &&
        document.createTreeWalker(textHost, NodeFilter.SHOW_TEXT).nextNode();

      expect(textNode?.nodeType).toBe(Node.TEXT_NODE);
      textNode!.nodeValue = 'body!';
      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
        });
      });

      expect(didSyncTextPathToDOM(mountedEditor, [0, 0])).toBe(false);
      expect(screen.getByLabelText('Body editor')).toHaveTextContent('body!');
    } finally {
      act(() => runtime.setComposing(false));
    }
  });

  test('runtime root pending native state transforms on mounted root view editors', async () => {
    let mainEditor!: ReturnType<typeof useTestEditor>['editor'];
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return <Editable aria-label="Header editor" />;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor<Value>({
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
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
          </TestRoot>
        </TestProvider>
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
    let headerEditor!: ReturnType<typeof useEditorContext>;
    const headerMarks = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const HeaderMarksProbe = () => {
      headerMarks(useRootState('header', (state) => state.marks()));

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor<Value>({
        initialValue: {
          children: [paragraph('body')],
          roots: {
            footer: [paragraph('footer')],
            header: [markedParagraph('header', { bold: true })],
          },
        },
      });

      return (
        <TestProvider runtime={runtime}>
          <HeaderMarksProbe />
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({
          kind: 'text',
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

  test('runtime views do not install document focus listeners', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <span />
          </TestRoot>
          <TestRoot>
            <span />
          </TestRoot>
          <TestRoot root="footer">
            <span />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    expect(
      addEventListener.mock.calls.filter(([event]) => event === 'focusin')
    ).toHaveLength(0);
    expect(
      addEventListener.mock.calls.filter(([event]) => event === 'focusout')
    ).toHaveLength(0);
  });

  test('sibling Plite roots receive distinct editor view objects', () => {
    const seen: unknown[] = [];
    const Probe = () => {
      const editor = useEditorContext();
      seen.push(editor);

      return null;
    };
    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <Probe />
          </TestRoot>
          <TestRoot>
            <Probe />
          </TestRoot>
          <TestRoot root="footer">
            <Probe />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    expect(new Set(seen)).toHaveLength(3);
  });

  test('root-bound Plite renders Editable from the selected root', () => {
    const HeaderEditable = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<HeaderEditable />);

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header');
  });

  test('root-bound Plite exposes DOM APIs bound to the view editor', () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const HeaderEditable = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<HeaderEditable />);

    expect(
      headerEditor.api.dom.hasDOMNode(screen.getByLabelText('Header editor'))
    ).toBe(true);
  });

  test('root-bound Plite clipboard API inserts into the selected root', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
          <TestRoot>
            <Editable aria-label="Main editor" />
          </TestRoot>
        </TestProvider>
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
      headerEditor.api.dom.clipboard.insertData(
        clipboard as unknown as DataTransfer
      );
    });

    expect(screen.getByLabelText('Header editor')).toHaveTextContent('header!');
    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body');
  });

  test('root-bound Plite clipboard API uses runtime plugin handlers', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;
    const clipboardPlugin = definePlugin('custom-clipboard', {
      commands: ({ handle }) => [
        handle(domCommands.insertData, ({ state }) =>
          state.transaction((tx) => {
            tx.text.insert('handled');
          })
        ),
      ],
    });

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({
        plugins: [clipboardPlugin],
        initialValue: initialValue(),
      });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
          <TestRoot>
            <Editable aria-label="Main editor" />
          </TestRoot>
        </TestProvider>
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
        headerEditor.api.dom.clipboard.insertData(
          clipboard as unknown as DataTransfer
        );
      });
    });

    expect(screen.getByLabelText('Header editor')).toHaveTextContent(
      'headerhandled'
    );
    expect(screen.getByLabelText('Main editor')).toHaveTextContent('body');
  });

  test('root-bound Plite tracks focus per view editor', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return (
        <span data-testid="header-focused">{`${useEditorFocused()}`}</span>
      );
    };

    const MainProbe = () => (
      <span data-testid="main-focused">{`${useEditorFocused()}`}</span>
    );

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
          <TestRoot>
            <MainProbe />
            <Editable aria-label="Main editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    const headerRoot = screen.getByLabelText('Header editor');

    await act(async () => {
      headerRoot.focus();
      headerEditor.api.dom.focus({ retries: 1 });
    });

    expect(document.activeElement).toBe(headerRoot);
    expect(headerEditor.api.dom.isFocused()).toBe(true);
    await waitFor(() => {
      expect(screen.getByTestId('header-focused')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('main-focused')).toHaveTextContent('false');
  });

  test('single-editor Plite provider tracks focus per nested root view', async () => {
    const editor = createEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return (
        <span data-testid="header-focused">{`${useEditorFocused()}`}</span>
      );
    };

    const MainProbe = () => (
      <span data-testid="main-focused">{`${useEditorFocused()}`}</span>
    );

    render(
      <TestRoot editor={editor}>
        <TestRoot root="header">
          <HeaderProbe />
          <Editable aria-label="Header editor" />
        </TestRoot>
        <TestRoot>
          <MainProbe />
          <Editable aria-label="Main editor" />
        </TestRoot>
      </TestRoot>
    );

    const headerRoot = screen.getByLabelText('Header editor');

    await act(async () => {
      headerRoot.focus();
      headerEditor.api.dom.focus({ retries: 1 });
    });

    expect(document.activeElement).toBe(headerRoot);
    expect(headerEditor.api.dom.isFocused()).toBe(true);
    await waitFor(() => {
      expect(screen.getByTestId('header-focused')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('main-focused')).toHaveTextContent('false');
  });

  test('root-bound Plite focus preserves the view selection', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
          <TestRoot>
            <Editable aria-label="Main editor" />
          </TestRoot>
        </TestProvider>
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

    expect(headerEditor.read((state) => state.selection())).toEqual(
      expectedSelection
    );
  });

  test('root-bound Plite preserves change callbacks for the view root', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot
            onCommit={onCommit}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
            root="header"
          >
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
    });

    const expectedValue = [paragraph('header!')];

    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: headerEditor,
        snapshot: expect.objectContaining({ children: expectedValue }),
      })
    );
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ editor: headerEditor, value: expectedValue })
    );
    expect(onSelectionChange).not.toHaveBeenCalled();

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 7 });
      });
    });

    const expectedSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 7, root: 'header' },
      focus: { path: [0, 0], offset: 7, root: 'header' },
    };

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: headerEditor,
        selection: expectedSelection,
      })
    );
  });

  test('root-bound Plite catches callbacks for commits before view subscription starts', async () => {
    const onValueChange = vi.fn();

    const CommitBeforeViewSubscription = () => {
      const editor = useEditorContext();

      useLayoutEffect(() => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
        });
      }, [editor]);

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot onValueChange={onValueChange} root="header">
            <CommitBeforeViewSubscription />
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    const expectedValue = [paragraph('header!')];

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith(
        expect.objectContaining({
          editor: expect.any(Object),
          value: expectedValue,
        })
      );
    });
  });

  test('root-bound child layout commits after rerender use the newly committed callbacks', () => {
    const previousOnCommit = vi.fn();
    const previousOnValueChange = vi.fn();
    const nextOnCommit = vi.fn();
    const nextOnValueChange = vi.fn();

    const CommitInLayout = ({ commit }: { commit: boolean }) => {
      const editor = useEditorContext();

      useLayoutEffect(() => {
        if (!commit) return;

        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
        });
      }, [commit, editor]);

      return null;
    };
    const RuntimeViews = ({
      commit,
      onCommit,
      onValueChange,
    }: {
      commit: boolean;
      onCommit: typeof previousOnCommit;
      onValueChange: typeof previousOnValueChange;
    }) => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot
            onCommit={onCommit}
            onValueChange={onValueChange}
            root="header"
          >
            <CommitInLayout commit={commit} />
          </TestRoot>
        </TestProvider>
      );
    };
    const rendered = render(
      <RuntimeViews
        commit={false}
        onCommit={previousOnCommit}
        onValueChange={previousOnValueChange}
      />
    );

    rendered.rerender(
      <RuntimeViews
        commit
        onCommit={nextOnCommit}
        onValueChange={nextOnValueChange}
      />
    );

    expect(previousOnCommit).not.toHaveBeenCalled();
    expect(previousOnValueChange).not.toHaveBeenCalled();
    expect(nextOnCommit).toHaveBeenCalledTimes(1);
    expect(nextOnValueChange).toHaveBeenCalledTimes(1);
    expect(nextOnCommit.mock.calls[0]?.[0].commit.version).toBe(
      nextOnValueChange.mock.calls[0]?.[0].commit.version
    );
  });

  test('root-bound Plite does not replay commits from before callback activation', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;
    const onCommit = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };
    const RuntimeViews = ({ observe }: { observe: boolean }) => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot onCommit={observe ? onCommit : undefined} root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
        </TestProvider>
      );
    };
    const rendered = render(<RuntimeViews observe={false} />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      });
    });

    rendered.rerender(<RuntimeViews observe />);
    expect(onCommit).not.toHaveBeenCalled();

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('?', { at: { path: [0, 0], offset: 7 } });
      });
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({ editor: headerEditor })
    );
  });

  test('root-bound Plite resets callback baselines when the root changes', async () => {
    let runtime!: ReturnType<typeof useTestEditor>;
    const onSelectionChange = vi.fn();

    const RuntimeViews = ({ root }: { root: 'footer' | 'header' }) => {
      runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot onSelectionChange={onSelectionChange} root={root}>
            <Editable aria-label={`${root} editor`} />
          </TestRoot>
        </TestProvider>
      );
    };

    const rendered = render(<RuntimeViews root="header" />);
    const headerEditor = createEditorView(runtime.editor, { root: 'header' });

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
    let mainEditor!: ReturnType<typeof useEditorContext>;
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const MainProbe = () => {
      mainEditor = useEditorContext();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot
            onCommit={onCommit}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
            root="header"
          >
            <Editable aria-label="Header editor" />
          </TestRoot>
          <TestRoot>
            <MainProbe />
            <Editable aria-label="Main editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      mainEditor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  test('root-bound Plite skips value callbacks for sibling root structure edits', async () => {
    let headerEditor!: ReturnType<typeof useEditorContext>;
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    const HeaderProbe = () => {
      headerEditor = useEditorContext();

      return null;
    };

    const RuntimeViews = () => {
      const runtime = useTestEditor({ initialValue: initialValue() });

      return (
        <TestProvider runtime={runtime}>
          <TestRoot root="header">
            <HeaderProbe />
            <Editable aria-label="Header editor" />
          </TestRoot>
          <TestRoot
            onCommit={onCommit}
            onSelectionChange={onSelectionChange}
            onValueChange={onValueChange}
          >
            <Editable aria-label="Main editor" />
          </TestRoot>
        </TestProvider>
      );
    };

    render(<RuntimeViews />);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('new header'), { at: [1] });
      });
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
