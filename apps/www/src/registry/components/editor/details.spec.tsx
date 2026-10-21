import { afterAll, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

const plateReact = await import('platejs/react');
const { useViewStore } = plateReact;
const ViewName = React.createContext('');
const viewStoreCalls = mock((_view: string, _call: 'render' | 'select') => {});

const useCountedViewStore: typeof useViewStore = (plugin, selector) => {
  const view = React.useContext(ViewName);

  viewStoreCalls(view, 'render');

  return useViewStore(plugin, (state) => {
    viewStoreCalls(view, 'select');

    return selector(state);
  });
};

mock.module('platejs/react', () => ({
  ...plateReact,
  useViewStore: useCountedViewStore,
}));

const {
  createEditor,
  EditorContent,
  EditorRoot,
  useRootChrome,
  useRootEditor,
} = plateReact;
const { DetailsKit } = await import('./details');

type RootView = ReturnType<typeof useRootEditor>;

const wait = (ms = 50) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const createDetailsEditor = () =>
  createEditor({
    plugins: DetailsKit,
    initialValue: [
      {
        children: [
          { children: [{ text: 'First' }], type: 'summary' },
          { children: [{ text: 'First body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
      {
        children: [
          { children: [{ text: 'Second' }], type: 'summary' },
          { children: [{ text: 'Second body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ],
  });

const View = ({
  name,
  register,
}: {
  name: string;
  register: Map<string, RootView>;
}) => {
  const chrome = useRootChrome();
  register.set(name, useRootEditor());

  return (
    <ViewName.Provider value={name}>
      <section {...chrome.props} aria-label={`${name} view`}>
        <span>{name} chrome</span>
        <EditorContent aria-label={`${name} content`} />
      </section>
    </ViewName.Provider>
  );
};

const renderViews = ({ readOnlyB = false } = {}) => {
  const editor = createDetailsEditor();
  const views = new Map<string, RootView>();

  render(
    <>
      <EditorRoot editor={editor} suppressInstanceWarning>
        <View name="A" register={views} />
      </EditorRoot>
      <EditorRoot editor={editor} readOnly={readOnlyB} suppressInstanceWarning>
        <View name="B" register={views} />
      </EditorRoot>
    </>
  );

  return { a: views.get('A')!, b: views.get('B')! };
};

const firstToggle = (name: string) =>
  within(screen.getByRole('region', { name: `${name} view` })).getAllByRole(
    'button',
    { name: /details$/ }
  )[0];

const toggleFirst = async (name: string) => {
  await act(async () => {
    fireEvent.click(firstToggle(name));
  });
};

const caret = (view: RootView) =>
  view.read((state) => {
    const selection = state.selection();

    return selection
      ? [...selection.anchor.path, selection.anchor.offset].join('.')
      : null;
  });

const place = async (view: RootView, path: number[], offset: number) => {
  await act(async () => {
    view.update((tx) => tx.selection.set({ offset, path }));
  });
};

const pressChrome = async (name: string) => {
  await act(async () => {
    fireEvent.mouseDown(screen.getByText(`${name} chrome`));
    await wait();
  });
};

const clickText = async (name: string, text: string, offset: number) => {
  const content = screen.getByLabelText(`${name} content`);
  const target = within(content).getByText(text);
  const node = target.firstChild as Text;

  await act(async () => {
    fireEvent.mouseDown(target);
    content.focus();
    document.getSelection()!.setBaseAndExtent(node, offset, node, offset);
    document.dispatchEvent(new Event('selectionchange'));
    await wait(100);
    fireEvent.mouseUp(target);
    await wait();
  });
};

/** happy-dom keeps a range on a removed node, where a browser would move it. */
const nativeAnchorText = () => {
  const anchor = document.getSelection()?.anchorNode;

  return anchor?.isConnected ? anchor.textContent : null;
};

describe('Details registry components', () => {
  afterAll(() => {
    mock.restore();
  });

  it("collapses a section only in the view that toggled it, re-rendering only that view's block (R22)", async () => {
    renderViews();
    await toggleFirst('A');
    await toggleFirst('B');
    viewStoreCalls.mockClear();

    await toggleFirst('A');
    const count = (view: string, call: 'render' | 'select') =>
      viewStoreCalls.mock.calls.filter(
        ([callView, callKind]) => callView === view && callKind === call
      ).length;

    expect({
      aExpanded: firstToggle('A').getAttribute('aria-expanded'),
      aRenders: count('A', 'render'),
      bExpanded: firstToggle('B').getAttribute('aria-expanded'),
      bRenders: count('B', 'render'),
      bSelects: count('B', 'select'),
    }).toEqual({
      aExpanded: 'false',
      aRenders: 1,
      bExpanded: 'true',
      bRenders: 0,
      bSelects: 0,
    });
  });

  it("restores a view's resting caret out of a section that view collapsed (R23)", async () => {
    const { a, b } = renderViews();

    await toggleFirst('A');
    await place(a, [0, 1, 0], 3);
    await place(b, [2, 0], 2);
    await toggleFirst('A');
    await pressChrome('A');

    expect({
      caret: caret(a),
      native: nativeAnchorText(),
      nativeInA: screen
        .getByLabelText('A content')
        .contains(document.getSelection()?.anchorNode ?? null),
    }).toEqual({ caret: '0.0.0.5', native: 'First', nativeInA: true });
  });

  it('keeps the selection of a read-only view that closes the section holding its caret (R25)', async () => {
    const { b } = renderViews({ readOnlyB: true });

    await toggleFirst('B');
    await clickText('B', 'First body', 3);
    const clicked = caret(b);

    await toggleFirst('B');

    expect({
      caret: caret(b),
      clicked,
      native: nativeAnchorText(),
    }).toEqual({ caret: '0.1.0.3', clicked: '0.1.0.3', native: null });
  });

  it("keeps a read-only view's selection when a writable view closes that section (R25)", async () => {
    const { b } = renderViews({ readOnlyB: true });

    await toggleFirst('A');
    await toggleFirst('B');
    await clickText('B', 'First body', 3);
    await toggleFirst('A');

    expect({
      caret: caret(b),
      native: nativeAnchorText(),
    }).toEqual({ caret: '0.1.0.3', native: 'First body' });
  });

  it("keeps a writable view's caret in a section another view closes", async () => {
    const { b } = renderViews();

    await toggleFirst('A');
    await toggleFirst('B');
    await clickText('B', 'First body', 3);
    await toggleFirst('A');

    expect({
      caret: caret(b),
      native: nativeAnchorText(),
    }).toEqual({ caret: '0.1.0.3', native: 'First body' });
  });

  it('renders native Details and Summary tags without browser state', async () => {
    const { DetailsElementStatic, DetailsSummaryElementStatic } = await import(
      `./details-static?native=${Math.random().toString(36).slice(2)}`
    );
    const summary = ReactDOMServer.renderToStaticMarkup(
      <DetailsSummaryElementStatic
        attributes={{}}
        element={{ type: 'summary', children: [{ text: 'Summary' }] }}
      >
        Summary
      </DetailsSummaryElementStatic>
    );
    const details = ReactDOMServer.renderToStaticMarkup(
      <DetailsElementStatic
        attributes={{}}
        element={{
          children: [
            { children: [{ text: 'Summary' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        }}
        slots={
          {
            children: ({ from }: { from: number }) =>
              from === 0 ? <summary>Summary</summary> : <p>Body</p>,
          } as any
        }
      />
    );

    expect(summary.startsWith('<summary')).toBe(true);
    expect(summary.endsWith('>Summary</summary>')).toBe(true);
    expect(details.startsWith('<details')).toBe(true);
    expect(details).toContain('<summary>Summary</summary><p>Body</p>');
    expect(details).not.toContain(' open');
    expect(details).not.toContain(' name=');
  });
});
