import * as Tooltip from '@radix-ui/react-tooltip';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { schema } from 'platejs';
import {
  BoldPlugin,
  FontSizePlugin,
  Plate,
  PlateContent,
  PlateController,
  createEditor,
  definePlatePlugin,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useFocusedLast,
  useOptionalEditor,
  usePluginStore,
} from 'platejs/react';
import React from 'react';
import { createPortal } from 'react-dom';

import { SiteRegistryProvider } from '@/components/site-registry/provider';
import { Toolbar, ToolbarButton } from '@/components/site-registry/toolbar';
import { FontSizeToolbarButton } from '@/registry/components/editor/font-size-toolbar-button';
import {
  UndoToolbarButton,
  RedoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';

const CounterPlugin = definePlatePlugin('toolbarCounter', {
  initialState: { count: 3 },
});
const HolderPlugin = definePlatePlugin('toolbarRootHolder', {
  schema: {
    element: {
      blockContent: true,
      void: 'block',
      contentRoots: {
        body: {
          ownership: 'exclusive',
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
    },
  },
});
const makeModel = () =>
  createEditor({
    id: 'same',
    plugins: [BoldPlugin, FontSizePlugin, CounterPlugin, HolderPlugin],
    initialValue: {
      children: [
        { type: 'paragraph', children: [{ text: 'main' }] },
        {
          type: 'toolbarRootHolder',
          childRoots: { body: 'note' },
          children: [{ text: '' }],
        },
      ],
      roots: { note: [{ type: 'paragraph', children: [{ text: 'note' }] }] },
    },
  });
type CommandEditor = ReturnType<typeof useEditor>;
const selectAll = (editor: CommandEditor) =>
  editor.update.selection.set({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 4 },
  });

for (const base of ['base', 'radix'] as const) {
  test(`${base}: a real mark control and plugin selector bind to the exact named-root view`, async () => {
    const model = makeModel();
    let selected: CommandEditor | null = null;
    const views = new Map<string, CommandEditor>();
    function ViewProbe({
      editableRef,
    }: {
      editableRef: React.RefObject<HTMLDivElement | null>;
    }) {
      const editor = useEditor();
      React.useLayoutEffect(() => {
        const name = editableRef.current?.getAttribute('aria-label');
        if (name) views.set(name, editor);
      }, [editableRef, editor]);
      return (
        <output data-testid={`last-${editor.read.view.root()}`}>
          {String(useFocusedLast())}
        </output>
      );
    }
    const ProbePlugin = definePlatePlugin('toolbarProbe', {
      slots: { afterEditable: ViewProbe },
    });
    const editor = createEditor({
      ...{
        plugins: [
          BoldPlugin,
          FontSizePlugin,
          CounterPlugin,
          HolderPlugin,
          ProbePlugin,
        ],
      },
      initialValue: model.read.value(),
    });
    function Controls() {
      selected = useEditor();
      const count = usePluginStore(CounterPlugin, 'count');
      return (
        <>
          <output data-testid="count">{count}</output>
          <MarkToolbarButton plugin={BoldPlugin}>Bold</MarkToolbarButton>
        </>
      );
    }
    function Shared() {
      const current = useOptionalEditor();
      return <Toolbar>{current && <Controls />}</Toolbar>;
    }
    function App({
      readOnlyB = true,
      showA = true,
    }: {
      readOnlyB?: boolean;
      showA?: boolean;
    }) {
      return (
        <SiteRegistryProvider base={base}>
          <PlateController>
            <Plate editor={editor} suppressInstanceWarning>
              {showA && <PlateContent aria-label="a" root="note" />}
              <PlateContent aria-label="b" root="note" readOnly={readOnlyB} />
              <PlateContent aria-label="main" />
            </Plate>
            <Shared />
          </PlateController>
        </SiteRegistryProvider>
      );
    }
    const result = render(<App />);
    const a = views.get('a')!;
    const b = views.get('b')!;
    expect(a).toBeDefined();
    expect(a).not.toBe(b);
    act(() => {
      selectAll(a);
      result.getByRole('textbox', { name: 'a' }).focus();
    });
    expect(selected).toBe(a);
    fireEvent.click(result.getByRole('button', { name: 'Bold' }));
    expect(a.plugin(BoldPlugin).read.isActive()).toBe(true);
    expect(editor.read.children()[0].children[0]).toEqual({ text: 'main' });
    expect(document.activeElement).toBe(
      result.getByRole('textbox', { name: 'a' })
    );
    act(() => editor.plugin(CounterPlugin).store.set({ count: 9 }));
    expect(result.getByTestId('count').textContent).toBe('9');
    act(() => result.getByRole('textbox', { name: 'b' }).focus());
    expect(selected).toBe(b);
    await waitFor(() =>
      expect(
        result
          .getByRole('button', { name: 'Bold' })
          .matches(':disabled, [aria-disabled="true"]')
      ).toBe(true)
    );
    expect(() => b.plugin(BoldPlugin).update.toggle()).toThrow('read-only');
    await act(async () => result.rerender(<App readOnlyB={false} />));
    expect(views.get('b')).toBe(b);
    expect(b.read.view.isReadOnly()).toBe(false);
    fireEvent.click(result.getByRole('button', { name: 'Bold' }));
    expect(b.plugin(BoldPlugin).read.isActive()).toBe(false);
    expect(document.activeElement).toBe(
      result.getByRole('textbox', { name: 'b' })
    );
    await act(async () =>
      result.rerender(<App readOnlyB={false} showA={false} />)
    );
    expect(() => a.plugin(BoldPlugin).update.toggle()).toThrow('read-only');
    expect(b.read.view.isReadOnly()).toBe(false);
  });

  test(`${base}: an open toolbar portal keeps its target through focus, permission and mount changes`, async () => {
    const a = makeModel();
    const b = makeModel();
    const seen = new Map<string, CommandEditor>();
    let captured: CommandEditor | null = null;
    function Local({ name }: { name: string }) {
      const editor = useEditor();
      React.useLayoutEffect(() => {
        seen.set(name, editor);
      }, [editor, name]);
      return null;
    }
    function Interaction() {
      const [open, setOpen] = React.useState(false);
      captured = useEditor();
      const readOnly = useEditorReadOnly();
      const text = useEditorSelector((editor) => editor.read.text.string([]));
      return (
        <>
          <ToolbarButton
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            Open
          </ToolbarButton>
          <output data-testid="captured">
            {text}:{String(readOnly)}
          </output>
          {open &&
            createPortal(
              <div role="dialog">
                <MarkToolbarButton plugin={BoldPlugin}>
                  Portal bold
                </MarkToolbarButton>
                <button onClick={() => setOpen(false)} type="button">
                  Close
                </button>
              </div>,
              document.body
            )}
        </>
      );
    }
    function Shared() {
      return <Toolbar>{useOptionalEditor() && <Interaction />}</Toolbar>;
    }
    function App({
      showA = true,
      locked = false,
      replacement = a,
    }: {
      showA?: boolean;
      locked?: boolean;
      replacement?: typeof a;
    }) {
      return (
        <SiteRegistryProvider base={base}>
          <PlateController>
            {showA && (
              <Plate
                editor={replacement}
                readOnly={locked}
                suppressInstanceWarning
              >
                <PlateContent aria-label="a" />
                <Local name="a" />
              </Plate>
            )}
            <Plate editor={b} suppressInstanceWarning>
              <PlateContent aria-label="b" />
              <Local name="b" />
            </Plate>
            <Shared />
          </PlateController>
        </SiteRegistryProvider>
      );
    }
    const result = render(<App />);
    const original = seen.get('a')!;
    act(() => {
      selectAll(original);
      result.getByRole('textbox', { name: 'a' }).focus();
    });
    fireEvent.pointerDown(result.getByRole('button', { name: 'Open' }), {
      button: 0,
    });
    fireEvent.click(result.getByRole('button', { name: 'Open' }));
    act(() => result.getByRole('textbox', { name: 'b' }).focus());
    expect(captured).toBe(original);
    fireEvent.click(result.getByRole('button', { name: 'Portal bold' }));
    expect(original.plugin(BoldPlugin).read.isActive()).toBe(true);
    expect(b.read.children()[0].children[0]).toEqual({ text: 'main' });
    expect(document.activeElement).toBe(
      result.getByRole('textbox', { name: 'a' })
    );
    await act(async () => result.rerender(<App locked />));
    expect(captured).toBe(original);
    expect(
      result
        .getByRole('button', { name: 'Portal bold' })
        .matches(':disabled, [aria-disabled="true"]')
    ).toBe(true);
    await act(async () => result.rerender(<App replacement={makeModel()} />));
    expect(captured).toBe(original);
    expect(original.read.view.isReadOnly()).toBe(true);
    expect(() => original.update.text.insert('stale')).toThrow('read-only');
    expect(seen.get('a')).not.toBe(original);
    fireEvent.click(result.getByRole('button', { name: 'Close' }));
    expect(captured).not.toBe(original);
    result.rerender(<App showA={false} />);
    expect(captured).toBe(seen.get('b')!);
  });

  test(`${base}: a real font-size field commits to its opening editor on blur`, async () => {
    const a = makeModel();
    const b = makeModel();
    let current: CommandEditor | null = null;
    function Controls() {
      current = useEditor();
      return <FontSizeToolbarButton />;
    }
    function Shared() {
      return <Toolbar>{useOptionalEditor() && <Controls />}</Toolbar>;
    }
    const result = render(
      <SiteRegistryProvider base={base}>
        <PlateController>
          <Plate editor={a} suppressInstanceWarning>
            <PlateContent aria-label="a" />
          </Plate>
          <Plate editor={b} suppressInstanceWarning>
            <PlateContent aria-label="b" />
          </Plate>
          <Shared />
        </PlateController>
      </SiteRegistryProvider>
    );
    act(() => {
      selectAll(current!);
      result.getByRole('textbox', { name: 'a' }).focus();
    });
    const input = result.getByRole('textbox', { name: 'Font size' });
    act(() => input.focus());
    fireEvent.change(input, { target: { value: '24' } });
    act(() => result.getByRole('textbox', { name: 'b' }).focus());
    expect(a.read.children()[0].children[0]).toEqual({
      text: 'main',
      fontSize: '24px',
    });
    expect(b.read.children()[0].children[0]).toEqual({ text: 'main' });
  });

  test(`${base}: undo after Enter does not recommit a font-size field on blur`, async () => {
    const editor = makeModel();
    let current: CommandEditor | null = null;
    function Controls() {
      current = useEditor();
      return (
        <>
          <FontSizeToolbarButton />
          <UndoToolbarButton aria-label="Undo" />
        </>
      );
    }
    function Shared() {
      return <Toolbar>{useOptionalEditor() && <Controls />}</Toolbar>;
    }
    const result = render(
      <SiteRegistryProvider base={base}>
        <Tooltip.Provider>
          <PlateController>
            <Plate editor={editor}>
              <PlateContent aria-label="editor" />
            </Plate>
            <Shared />
          </PlateController>
        </Tooltip.Provider>
      </SiteRegistryProvider>
    );
    await act(async () => {
      result.getByRole('textbox', { name: 'editor' }).focus();
      selectAll(current!);
    });
    const input = result.getByRole('textbox', { name: 'Font size' });
    act(() => input.focus());
    fireEvent.change(input, { target: { value: '24' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(editor.read.children()[0].children[0]).toEqual({
      text: 'main',
      fontSize: '24px',
    });
    fireEvent.click(result.getByRole('button', { name: 'Undo' }));
    await waitFor(() =>
      expect(
        document.activeElement ===
          result.getByRole('textbox', { name: 'editor' })
      ).toBe(true)
    );
    expect(editor.read.children()[0].children[0]).toEqual({ text: 'main' });
  });
}

test('a shared mark control tolerates empty and heterogeneous controllers', () => {
  const a = makeModel();
  const b = createEditor({ id: 'same' });
  function App({ show = false }: { show?: boolean }) {
    return (
      <PlateController>
        {show && (
          <>
            <Plate editor={a} suppressInstanceWarning>
              <PlateContent aria-label="a" />
            </Plate>
            <Plate editor={b} suppressInstanceWarning>
              <PlateContent aria-label="b" />
            </Plate>
          </>
        )}
        <Toolbar>
          <MarkToolbarButton plugin={BoldPlugin}>Bold</MarkToolbarButton>
        </Toolbar>
      </PlateController>
    );
  }
  const result = render(<App />);
  expect(
    result
      .getByRole('button', { name: 'Bold' })
      .matches(':disabled, [aria-disabled="true"]')
  ).toBe(true);
  result.rerender(<App show />);
  expect(
    result
      .getByRole('button', { name: 'Bold' })
      .matches(':disabled, [aria-disabled="true"]')
  ).toBe(false);
  act(() => result.getByRole('textbox', { name: 'b' }).focus());
  expect(
    result
      .getByRole('button', { name: 'Bold' })
      .matches(':disabled, [aria-disabled="true"]')
  ).toBe(true);
  act(() => result.getByRole('textbox', { name: 'a' }).focus());
  expect(
    result
      .getByRole('button', { name: 'Bold' })
      .matches(':disabled, [aria-disabled="true"]')
  ).toBe(false);
});

test('shared undo and redo use the selected model history and restore the exact view', async () => {
  const a = makeModel();
  const b = makeModel();
  let selected: CommandEditor | null = null;
  function Controls() {
    selected = useEditor();
    return (
      <>
        <UndoToolbarButton aria-label="Undo" />
        <RedoToolbarButton aria-label="Redo" />
      </>
    );
  }
  function Shared() {
    return <Toolbar>{useOptionalEditor() && <Controls />}</Toolbar>;
  }
  const result = render(
    <Tooltip.Provider>
      <PlateController>
        <Plate editor={a} suppressInstanceWarning>
          <PlateContent aria-label="a" root="note" />
          <PlateContent aria-label="a-copy" root="note" />
        </Plate>
        <Plate editor={b} suppressInstanceWarning>
          <PlateContent aria-label="b" />
        </Plate>
        <Shared />
      </PlateController>
    </Tooltip.Provider>
  );
  await act(async () => {
    result.getByRole('textbox', { name: 'a' }).focus();
  });
  const original = selected!;
  await act(async () => {
    selectAll(original);
    original.plugin(BoldPlugin).update.toggle();
  });
  await act(async () =>
    result.getByRole('textbox', { name: 'a-copy' }).focus()
  );
  const sibling = selected!;
  expect(sibling).not.toBe(original);
  expect(sibling.plugin(BoldPlugin).read.isActive()).toBe(true);
  fireEvent.click(result.getByRole('button', { name: 'Undo' }));
  expect(sibling.plugin(BoldPlugin).read.isActive()).toBe(false);
  await waitFor(() =>
    expect(document.activeElement).toBe(
      result.getByRole('textbox', { name: 'a-copy' })
    )
  );
  fireEvent.click(result.getByRole('button', { name: 'Redo' }));
  expect(sibling.plugin(BoldPlugin).read.isActive()).toBe(true);
  await act(async () => result.getByRole('textbox', { name: 'b' }).focus());
  expect(
    result
      .getByRole('button', { name: 'Undo' })
      .matches(':disabled, [aria-disabled="true"]')
  ).toBe(true);
  expect(b.read.children()[0].children[0]).toEqual({ text: 'main' });
  expect(a.read.children()[0].children[0]).toEqual({ text: 'main' });
});
