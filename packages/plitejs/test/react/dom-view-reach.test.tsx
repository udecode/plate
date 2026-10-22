import { act, render } from '@testing-library/react';
import { Activity, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  createEditor,
  Editable,
  EditorRoot,
  useDropIndicator,
  useEditorContext,
  useEditorEditableElement,
  useEditorScrollElementRef,
  useRootEditor,
} from '../../src/react';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const paragraphs = () => [paragraph('one'), paragraph('two')];

const caretAt = (offset: number) => ({
  anchor: { path: [0, 0], offset },
  focus: { path: [0, 0], offset },
});

const firstText = (element: HTMLElement) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node && !node.textContent) node = walker.nextNode();

  return node!;
};

const textNode = (element: HTMLElement, text: string) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node && node.textContent !== text) node = walker.nextNode();

  return node!;
};

const blockDrop = (target: Node) => {
  const source = createEditor({ initialValue: paragraphs() });
  const data = new Map<string, string>();
  const dataTransfer = {
    getData: (type: string) => data.get(type) ?? '',
    setData: (type: string, value: string) => {
      data.set(type, value);
    },
    get types() {
      return [...data.keys()];
    },
  };

  source.update((tx) =>
    tx.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    })
  );
  source.api.dom.clipboard.writeSelection(dataTransfer);

  return {
    clientX: 1,
    clientY: 1,
    dataTransfer,
    target,
  } as unknown as DragEvent;
};

const renderWrappedView = () => {
  const editor = createEditor({ initialValue: paragraphs() });
  let root: ReturnType<typeof useRootEditor> | undefined;
  const Capture = () => {
    root = useRootEditor();

    return null;
  };
  const rendered = render(
    <EditorRoot editor={editor}>
      <Capture />
      <div data-testid="wrap">
        <Editable aria-label="Main" />
      </div>
    </EditorRoot>
  );

  return {
    handles: [editor, root!],
    main: rendered.getByRole('textbox', { name: 'Main' }),
    wrap: rendered.getByTestId('wrap'),
  };
};

const renderMainView = () => {
  const editor = createEditor({
    initialValue: {
      children: [paragraph('main')],
      roots: { note: [paragraph('note text')] },
    },
  });
  let view: ReturnType<typeof useEditorContext> | undefined;
  const Capture = () => {
    view = useEditorContext();

    return null;
  };

  render(
    <EditorRoot editor={editor}>
      <Capture />
      <Editable aria-label="Main" />
    </EditorRoot>
  );

  return view!;
};

const renderViews = (labels: string[]) => {
  const editor = createEditor({ initialValue: paragraphs() });
  const views = new Map<string, ReturnType<typeof useRootEditor>>();
  const seen: Array<HTMLElement | null> = [];
  const View = ({ label }: { label: string }) => {
    views.set(label, useRootEditor());

    return null;
  };
  const AppEditable = () => {
    seen.push(useEditorEditableElement(editor));

    return null;
  };
  const rendered = render(
    <>
      <AppEditable />
      {labels.map((label) => (
        <EditorRoot editor={editor} key={label}>
          <View label={label} />
          <Editable aria-label={label} />
        </EditorRoot>
      ))}
    </>
  );

  return { editor, rendered, seen, views };
};

const renderRoots = (
  roots: Record<string, Array<ReturnType<typeof paragraph>>>
) => {
  const editor = createEditor({
    initialValue: { children: [paragraph('main')], roots },
  });
  const views = new Map<string, ReturnType<typeof useRootEditor>>();
  const seen: Array<HTMLElement | null> = [];
  const View = ({ root }: { root?: string }) => {
    views.set(root ?? 'main', useRootEditor(root));

    return null;
  };
  const AppEditable = () => {
    seen.push(useEditorEditableElement(editor));

    return null;
  };
  const rendered = render(
    <>
      <AppEditable />
      {[undefined, ...Object.keys(roots)].map((root) => (
        <EditorRoot editor={editor} key={root ?? 'main'}>
          <View root={root} />
          <Editable aria-label={root ?? 'main'} root={root} />
        </EditorRoot>
      ))}
    </>
  );

  return { editor, rendered, seen, views };
};

const placeCaret = async (
  views: Map<string, ReturnType<typeof useRootEditor>>,
  label: string,
  offset: number
) => {
  await act(async () => {
    views.get(label)!.update((tx) => tx.selection.set(caretAt(offset)));
  });
};

describe("the app's editor reaches a mounted view", () => {
  test('focus on the editor createEditor returns focuses its only view', async () => {
    const { editor, rendered } = renderViews(['Main']);

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(document.activeElement).toBe(
      rendered.getByRole('textbox', { name: 'Main' })
    );
  });

  test('focus follows the view that placed the caret last', async () => {
    const { editor, rendered, views } = renderViews(['A', 'B', 'C']);

    await placeCaret(views, 'A', 1);
    await placeCaret(views, 'C', 1);
    await placeCaret(views, 'B', 2);
    await act(async () => {
      editor.api.dom.focus();
    });

    expect(document.activeElement).toBe(
      rendered.getByRole('textbox', { name: 'B' })
    );
  });

  test('two views and no caret placed leave focus where it was', async () => {
    const { editor } = renderViews(['A', 'B']);

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(document.activeElement).toBe(document.body);
  });

  test("a value replace that clears the caret keeps the app's editor on the focused view", async () => {
    const { editor, rendered, seen, views } = renderViews(['A', 'B', 'C']);
    const b = rendered.getByRole('textbox', { name: 'B' });

    await act(async () => {
      b.focus();
      views.get('B')!.update((tx) => tx.selection.set(caretAt(1)));
    });
    await act(async () => {
      editor.update((tx) => tx.value.replace({ children: paragraphs() }));
    });

    expect([editor.api.dom.resolveDOMNode(editor), seen.at(-1)]).toEqual([
      b,
      b,
    ]);
  });

  test("the app's editor reaches a focused view inside a shadow root", async () => {
    const editor = createEditor({ initialValue: paragraphs() });
    const host = document.createElement('div');
    const container = document.createElement('div');

    document.body.append(host);
    host.attachShadow({ mode: 'open' }).append(container);
    render(
      <>
        <EditorRoot editor={editor}>
          <Editable aria-label="Light" />
        </EditorRoot>
        {createPortal(
          <EditorRoot editor={editor}>
            <Editable aria-label="Shadow" />
          </EditorRoot>,
          container
        )}
      </>
    );
    const shadowEditable = container.querySelector<HTMLElement>(
      '[aria-label="Shadow"]'
    )!;

    await act(async () => {
      shadowEditable.focus();
    });
    await act(async () => {
      editor.update((tx) => tx.value.replace({ children: paragraphs() }));
    });

    const reached = editor.api.dom.resolveDOMNode(editor);

    host.remove();
    expect(reached).toBe(shadowEditable);
  });

  test("a caret in a root no view shows leaves the app's editor unfocused", async () => {
    const editor = createEditor({
      initialValue: {
        children: paragraphs(),
        roots: { note: [paragraph('note')] },
      },
    });
    let note: ReturnType<typeof useRootEditor> | undefined;
    const Note = () => {
      note = useRootEditor('note');

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Note />
        <Editable aria-label="Main" />
      </EditorRoot>
    );
    await act(async () => {
      note!.update((tx) => tx.selection.set(caretAt(1)));
    });
    await act(async () => {
      editor.api.dom.focus();
    });

    expect(document.activeElement).toBe(document.body);
  });

  test("removing the caret's editable leaves the app's editor unfocused until another view takes the caret", async () => {
    const editor = createEditor({ initialValue: paragraphs() });
    const views = new Map<string, ReturnType<typeof useRootEditor>>();
    let showA: (show: boolean) => void = () => {};
    const View = ({ label }: { label: string }) => {
      views.set(label, useRootEditor());

      return null;
    };
    const ViewA = () => {
      const [show, setShow] = useState(true);
      showA = setShow;

      return (
        <EditorRoot editor={editor}>
          <View label="A" />
          {show && <Editable aria-label="A" />}
        </EditorRoot>
      );
    };
    const rendered = render(
      <>
        <ViewA />
        <EditorRoot editor={editor}>
          <View label="B" />
          <Editable aria-label="B" />
        </EditorRoot>
      </>
    );

    await placeCaret(views, 'A', 1);
    await act(async () => {
      showA(false);
    });
    await act(async () => {
      editor.api.dom.focus();
    });
    const stranded = document.activeElement;
    await placeCaret(views, 'B', 1);
    await act(async () => {
      editor.api.dom.focus();
    });

    expect([stranded, document.activeElement]).toEqual([
      document.body,
      rendered.getByRole('textbox', { name: 'B' }),
    ]);
  });

  test("a caret in a view that Activity hides leaves the app's editor unfocused", async () => {
    const editor = createEditor({ initialValue: paragraphs() });
    const views = new Map<string, ReturnType<typeof useRootEditor>>();
    let hide!: () => void;
    const View = ({ label }: { label: string }) => {
      views.set(label, useRootEditor());

      return null;
    };
    const Harness = () => {
      const [mode, setMode] = useState<'hidden' | 'visible'>('visible');
      hide = () => setMode('hidden');

      return (
        <>
          <Activity mode={mode}>
            <EditorRoot editor={editor}>
              <View label="A" />
              <Editable aria-label="A" />
            </EditorRoot>
          </Activity>
          <EditorRoot editor={editor}>
            <View label="B" />
            <Editable aria-label="B" />
          </EditorRoot>
        </>
      );
    };

    render(<Harness />);
    await placeCaret(views, 'A', 1);
    await act(async () => hide());
    await act(async () => {
      editor.api.dom.focus();
    });

    expect(document.activeElement).toBe(document.body);
  });

  test("the editable element hook on the app's editor reads the view once it mounts", () => {
    const { rendered, seen } = renderViews(['Main']);

    expect(seen.at(-1)).toBe(rendered.getByRole('textbox', { name: 'Main' }));
  });

  test("the editable element hook on the app's editor follows the caret to another view", async () => {
    const { rendered, seen, views } = renderViews(['A', 'B', 'C']);

    await placeCaret(views, 'A', 1);
    await placeCaret(views, 'C', 1);
    await placeCaret(views, 'B', 2);

    expect(seen.at(-1)).toBe(rendered.getByRole('textbox', { name: 'B' }));
  });

  test("the editable element hook on the app's editor follows a caret it places in another root", async () => {
    const { editor, rendered, seen } = renderRoots({
      note: [paragraph('note text')],
    });

    await act(async () => {
      editor.update((tx) =>
        tx.selection.set({
          anchor: { root: 'note', path: [0, 0], offset: 1 },
          focus: { root: 'note', path: [0, 0], offset: 1 },
        })
      );
    });

    expect(seen.at(-1)).toBe(rendered.getByRole('textbox', { name: 'note' }));
  });

  test("the app's editor reads a named root's editable while the caret sits in main", async () => {
    const { editor, rendered, views } = renderRoots({
      note: [paragraph('note text')],
    });

    await placeCaret(views, 'main', 1);

    expect(editor.api.dom.editable('note')).toBe(
      rendered.getByRole('textbox', { name: 'note' })
    );
  });

  test("the app's editor resolves itself to its view's editable", () => {
    const { editor, rendered } = renderViews(['Main']);

    expect(editor.api.dom.resolveDOMNode(editor)).toBe(
      rendered.getByRole('textbox', { name: 'Main' })
    );
  });

  test("a DOM node in another view belongs to the app's editor", async () => {
    const { editor, rendered, views } = renderViews(['A', 'B']);

    await placeCaret(views, 'A', 1);

    expect(
      editor.api.dom.hasDOMNode(rendered.getByRole('textbox', { name: 'B' }))
    ).toBe(true);
  });

  test("a root editor does not claim another view's DOM", () => {
    const { rendered, views } = renderViews(['A', 'B']);

    expect(
      views
        .get('B')!
        .api.dom.hasDOMNode(rendered.getByRole('textbox', { name: 'A' }))
    ).toBe(false);
  });

  test('a point in a named root resolves in the view that shows that root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('first'), paragraph('second')] },
      },
    });

    render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Note" root="note" />
      </EditorRoot>
    );

    expect(
      editor.api.dom.resolveDOMPoint({
        root: 'note',
        path: [1, 0],
        offset: 1,
      })?.[0].textContent
    ).toBe('second');
  });

  test('a point in a root no view shows fails closed where main has the same path', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('note text')] },
      },
    });
    const point = { root: 'note', path: [0, 0], offset: 1 };

    render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Main" />
      </EditorRoot>
    );
    editor.api.dom.resolveDOMPoint({ path: [0, 0], offset: 1 });

    expect(editor.api.dom.resolveDOMPoint(point)).toBeNull();
    expect(() => editor.api.dom.assertDOMPoint(point)).toThrow(
      'Cannot resolve DOM coordinates'
    );
  });

  test("a root editor's point in another root fails closed", () => {
    const { views } = renderRoots({ note: [paragraph('note text')] });

    expect(
      views
        .get('main')!
        .api.dom.resolveDOMPoint({ root: 'note', path: [0, 0], offset: 1 })
    ).toBeNull();
  });

  test("a DOM point in a named root round-trips through the app's editor", () => {
    const { editor, rendered } = renderRoots({
      note: [paragraph('note text')],
    });
    const noteText = firstText(rendered.getByRole('textbox', { name: 'note' }));
    const point = editor.api.dom.resolvePoint([noteText, 1], {
      exactMatch: true,
    });

    expect(editor.api.dom.resolveDOMPoint(point!)?.[0]).toBe(noteText);
  });

  test('a node of a named root resolves in the view that shows that root', async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('first'), paragraph('second')] },
      },
    });
    let note: ReturnType<typeof useRootEditor> | undefined;
    const Note = () => {
      note = useRootEditor('note');

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Note />
        <Editable aria-label="Main" />
        <Editable aria-label="Note" root="note" />
      </EditorRoot>
    );
    await act(async () => {
      editor.update((tx) => tx.selection.set(caretAt(1)));
    });

    expect(
      editor.api.dom.resolveDOMNode(
        note!.read((state) => state.nodes.get([0]))![0]
      )?.textContent
    ).toBe('first');
  });

  test("hasRange on the app's editor reads the range's root", () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('first'), paragraph('second')] },
      },
    });
    const at = { root: 'note', path: [1, 0], offset: 1 };

    expect(editor.api.dom.hasRange({ anchor: at, focus: at })).toBe(true);
  });

  test("a scroll container registered on the app's editor stays its scroll element", () => {
    const editor = createEditor({ initialValue: paragraphs() });
    const Scroller = () => (
      <div data-testid="scroller" ref={useEditorScrollElementRef(editor)}>
        <EditorRoot editor={editor}>
          <Editable aria-label="Main" />
        </EditorRoot>
      </div>
    );
    const rendered = render(<Scroller />);

    expect(editor.api.dom.scroll()).toBe(rendered.getByTestId('scroller'));
  });

  test("deselect on the app's editor clears its selection and the view's native one under a read-only view", async () => {
    const editor = createEditor({ initialValue: paragraphs() });
    const rendered = render(
      <EditorRoot editor={editor} readOnly>
        <Editable aria-label="Main" />
      </EditorRoot>
    );

    await act(async () => {
      editor.update((tx) => tx.selection.set(caretAt(1)));
    });
    document
      .getSelection()!
      .collapse(firstText(rendered.getByRole('textbox', { name: 'Main' })), 1);
    await act(async () => {
      editor.api.dom.deselect();
    });

    expect([
      editor.read((state) => state.selection()),
      document.getSelection()!.rangeCount,
    ]).toEqual([null, 0]);
  });

  test('a drag from a read-only root editor is copy-only and leaves the selection alone', () => {
    const editor = createEditor({ initialValue: paragraphs() });
    let reader: ReturnType<typeof useRootEditor> | undefined;
    const Reader = () => {
      reader = useRootEditor(undefined, { readOnly: true });

      return null;
    };
    const dataTransfer = {
      effectAllowed: 'uninitialized',
      setData: () => {},
      setDragImage: () => {},
    };

    render(
      <EditorRoot editor={editor}>
        <Reader />
        <Editable aria-label="Main" />
      </EditorRoot>
    );
    reader!.api.dom.drag.start(
      { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
      { node: editor.read((state) => state.nodes.get([0]))![0] as never }
    );

    expect([
      dataTransfer.effectAllowed,
      editor.read((state) => state.selection()),
    ]).toEqual(['copy', null]);
  });

  test("clearing a drop indicator from the app's editor clears the view that shows it", async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('note text')] },
      },
    });
    const indicators: unknown[] = [];
    let note: ReturnType<typeof useRootEditor> | undefined;
    const Note = () => {
      note = useRootEditor('note');

      return null;
    };
    const Indicator = () => {
      indicators.push(useDropIndicator());

      return null;
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <Editable aria-label="main" />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <Note />
          <Editable
            aria-label="note"
            renderElement={({ attributes, children }) => (
              <p {...attributes}>
                <Indicator />
                {children}
              </p>
            )}
            root="note"
          />
        </EditorRoot>
      </>
    );
    const key = note!.key([0])!;

    await act(async () => {
      editor.api.dom.drag.indicate({ key, side: 'start' });
    });
    const painted = indicators.at(-1);
    await act(async () => {
      editor.api.dom.drag.indicate(null);
    });

    expect([painted === null, indicators.at(-1)]).toEqual([false, null]);
  });
});

describe('a handle answers only for views it reaches', () => {
  test("a view's editor answers null for a point in a root it does not show", () => {
    const view = renderMainView();

    expect(
      view.api.dom.resolveDOMPoint({ root: 'note', path: [0, 0], offset: 1 })
    ).toBeNull();
  });

  test("a view's editor throws on asserting a point in a root it does not show", () => {
    const view = renderMainView();

    expect(() =>
      view.api.dom.assertDOMPoint({ root: 'note', path: [0, 0], offset: 1 })
    ).toThrow('Cannot resolve DOM coordinates');
  });

  test("a view's editor answers null for a range in a root it does not show", () => {
    const view = renderMainView();
    const at = { root: 'note', path: [0, 0], offset: 1 };

    expect(view.api.dom.resolveDOMRange({ anchor: at, focus: at })).toBeNull();
  });

  test("a view's editor still resolves a bare point in its own root", () => {
    const view = renderMainView();

    expect(
      view.api.dom.resolveDOMPoint({ path: [0, 0], offset: 1 })?.[0].textContent
    ).toBe('main');
  });

  test("a named root's view editor resolves a point that names its root", () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('note text')] },
      },
    });
    let view: ReturnType<typeof useEditorContext> | undefined;
    const Capture = () => {
      view = useEditorContext();

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Editable
          aria-label="note"
          renderElement={({ attributes, children }) => (
            <p {...attributes}>
              <Capture />
              {children}
            </p>
          )}
          root="note"
        />
      </EditorRoot>
    );

    expect(
      [
        view!.api.dom.resolveDOMPoint({
          root: 'note',
          path: [0, 0],
          offset: 1,
        }),
        view!.api.dom.resolveDOMPoint({ path: [0, 0], offset: 1 }),
      ].map((domPoint) => domPoint?.[0].textContent)
    ).toEqual(['note text', 'note text']);
  });

  test("the app's editor answers null for another editor's text", async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('first'), paragraph('second')] },
      },
    });
    const other = createEditor({ initialValue: paragraphs() });
    let note: ReturnType<typeof useRootEditor> | undefined;
    const Note = () => {
      note = useRootEditor('note');

      return null;
    };
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Note />
          <Editable aria-label="Main" />
          <Editable aria-label="Note" root="note" />
        </EditorRoot>
        <EditorRoot editor={other}>
          <Editable aria-label="Other" />
        </EditorRoot>
      </>
    );

    await act(async () => {
      note!.update((tx) => tx.selection.set(caretAt(1)));
    });
    const two = textNode(
      rendered.getByRole('textbox', { name: 'Other' }),
      'two'
    );

    expect(
      editor.api.dom.resolvePoint([two, 1], { exactMatch: true })
    ).toBeNull();
  });

  test("the app's editor and a root editor resolve a range that ends past the editable", () => {
    const { handles, main, wrap } = renderWrappedView();
    const range = document.createRange();

    range.setStart(textNode(main, 'one'), 1);
    range.setEnd(wrap, 1);

    expect(
      handles.map((handle) =>
        handle.api.dom.resolveRange(range, { exactMatch: false })
      )
    ).toEqual(
      handles.map(() => ({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 3 },
      }))
    );
  });

  test("the app's editor and a root editor resolve a range that starts before the editable", () => {
    const { handles, main, wrap } = renderWrappedView();
    const range = document.createRange();

    range.setStart(wrap, 0);
    range.setEnd(textNode(main, 'two'), 2);

    expect(
      handles.map((handle) =>
        handle.api.dom.resolveRange(range, { exactMatch: false })
      )
    ).toEqual(
      handles.map(() => ({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 2 },
      }))
    );
  });

  test("a root editor answers null for a block drop over another view's text", () => {
    const { rendered, views } = renderViews(['A', 'B']);

    expect(
      views
        .get('B')!
        .api.dom.resolveEventRange(
          blockDrop(
            textNode(rendered.getByRole('textbox', { name: 'A' }), 'two')
          )
        )
    ).toBeNull();
  });

  test("a root editor resolves a block drop over its own view's text", () => {
    const { rendered, views } = renderViews(['A', 'B']);

    expect(
      views
        .get('B')!
        .api.dom.resolveEventRange(
          blockDrop(
            textNode(rendered.getByRole('textbox', { name: 'B' }), 'two')
          )
        )
    ).toEqual({
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: 3 },
    });
  });

  test('a read-only root editor paints no drop indicator', async () => {
    const editor = createEditor({ initialValue: paragraphs() });
    const indicators: unknown[] = [];
    let reader: ReturnType<typeof useRootEditor> | undefined;
    const Reader = () => {
      reader = useRootEditor(undefined, { readOnly: true });

      return null;
    };
    const Indicator = () => {
      indicators.push(useDropIndicator());

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Reader />
        <Editable
          aria-label="Main"
          renderElement={({ attributes, children }) => (
            <p {...attributes}>
              <Indicator />
              {children}
            </p>
          )}
        />
      </EditorRoot>
    );
    const key = reader!.key([0])!;

    await act(async () => {
      reader!.api.dom.drag.indicate({ key, side: 'start' });
    });

    expect(indicators.at(-1)).toBeNull();
  });
});

describe("the app's editor's DOM capability answers in a named root's view", () => {
  const renderNoteBesideMain = async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('note text')] },
      },
    });
    let note: ReturnType<typeof useEditorContext> | undefined;
    const Capture = () => {
      note = useEditorContext();

      return null;
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <Editable aria-label="main" />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <Editable
            aria-label="note"
            renderElement={({ attributes, children }) => (
              <p {...attributes}>
                <Capture />
                {children}
              </p>
            )}
            root="note"
          />
        </EditorRoot>
      </>
    );
    await act(async () => {
      editor.update((tx) => tx.selection.set(caretAt(1)));
    });

    return { dom: editor.api.dom, note: note! };
  };
  const at = { root: 'note', path: [0, 0], offset: 1 };

  test('resolveDOMPoint paints in the note view', async () => {
    const { dom } = await renderNoteBesideMain();
    const domPoint = dom.resolveDOMPoint(at);

    expect([domPoint?.[0].textContent, domPoint?.[1]]).toEqual([
      'note text',
      1,
    ]);
  });

  test('assertDOMPoint paints in the note view', async () => {
    const { dom } = await renderNoteBesideMain();

    expect(dom.assertDOMPoint(at)[0].textContent).toBe('note text');
  });

  test('resolveDOMRange paints in the note view', async () => {
    const { dom } = await renderNoteBesideMain();

    expect(
      dom.resolveDOMRange({ anchor: at, focus: at })?.startContainer.textContent
    ).toBe('note text');
  });

  test('assertDOMRange paints in the note view', async () => {
    const { dom } = await renderNoteBesideMain();

    expect(
      dom.assertDOMRange({ anchor: at, focus: at }).startContainer.textContent
    ).toBe('note text');
  });

  test('drag.start drags a note block from the note view', async () => {
    const { dom, note } = await renderNoteBesideMain();
    const dataTransfer = {
      effectAllowed: 'uninitialized',
      setData: () => {},
      setDragImage: () => {},
    };
    let started: ReturnType<typeof dom.drag.start> | undefined;

    await act(async () => {
      started = dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: note.read((state) => state.nodes.get([0]))![0] as never }
      );
    });

    expect([started?.previews.length, dataTransfer.effectAllowed]).toEqual([
      1,
      'copyMove',
    ]);
  });
});
