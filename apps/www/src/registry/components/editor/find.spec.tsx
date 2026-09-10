import { describe, expect, it, spyOn } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import { NodeApi } from 'platejs';
import { BaseFindPlugin } from 'platejs/find';
import {
  LinkPlugin,
  Plate,
  PlateContent,
  createEditor,
  definePlatePlugin,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { DOMEditor } from '../../../../../../packages/platejs/src/dom/plite-dom.internal';
import { FindKit, useFind } from './find';

const value = [
  {
    type: 'paragraph',
    children: [
      { text: 'hello ' },
      {
        type: 'link',
        children: [{ text: 'world' }],
        url: 'https://platejs.org',
      },
      { text: ' again' },
    ],
  },
  { type: 'paragraph', children: [{ text: 'hello outside' }] },
];

const setup = () => {
  let commands: ReturnType<typeof useFind> | undefined;
  const Capture = () => {
    commands = useFind();
    return null;
  };
  const editor = createEditor({
    plugins: [
      LinkPlugin,
      ...FindKit,
      definePlatePlugin('controls', { slots: { beforeEditable: Capture } }),
    ],
    initialValue: value,
  });
  const view = render(
    <Plate editor={editor}>
      <PlateContent aria-label="Editor" />
    </Plate>
  );
  if (!commands) throw new Error('Find commands did not mount');
  const setInputQuery = (query: string) =>
    fireEvent.change(view.getByRole('searchbox'), { target: { value: query } });
  return {
    editor,
    find: editor.plugin(BaseFindPlugin),
    ui: commands,
    setInputQuery,
    view,
  };
};

describe('FindKit', () => {
  it.each(['one provider', 'two providers'])(
    'opens only the requested view with %s',
    async (layout) => {
      const editor = createEditor({
        plugins: [LinkPlugin, ...FindKit],
        initialValue: value,
      });
      const first = <PlateContent aria-label="first editor" />;
      const second = <PlateContent aria-label="second editor" />;
      const view = render(
        layout === 'one provider' ? (
          <Plate editor={editor}>
            {first}
            {second}
          </Plate>
        ) : (
          <>
            <Plate editor={editor}>{first}</Plate>
            <Plate editor={editor}>{second}</Plate>
          </>
        )
      );

      fireEvent.keyDown(view.getByRole('textbox', { name: 'first editor' }), {
        key: 'f',
        ctrlKey: true,
      });
      await waitFor(() => expect(view.getAllByRole('search')).toHaveLength(1));
      expect(document.activeElement).toBe(view.getByRole('searchbox'));
      fireEvent.keyDown(view.getByRole('searchbox'), { key: 'Escape' });
      await waitFor(() =>
        expect(document.activeElement).toBe(
          view.getByRole('textbox', { name: 'first editor' })
        )
      );
    }
  );
  it.each([1, 2, 5])(
    'mounting %i command controls preserves search and avoids result subscriptions',
    async (count) => {
      let renders = 0;
      let mountControls = (_count: number) => {};
      const FindButton = () => {
        const { open } = useFind();
        renders += 1;
        return (
          <button onClick={() => open()} type="button">
            Find
          </button>
        );
      };
      const Controls = () => {
        const [controls, setControls] = React.useState(0);
        mountControls = setControls;
        return (
          <>
            {Array.from({ length: controls }, (_, index) => (
              <FindButton key={index} />
            ))}
          </>
        );
      };
      const editor = createEditor({
        plugins: [
          LinkPlugin,
          ...FindKit,
          definePlatePlugin('controls', {
            slots: { beforeEditable: Controls },
          }),
        ],
        initialValue: value,
      });
      const view = render(
        <Plate editor={editor}>
          <PlateContent aria-label="Editor" />
        </Plate>
      );
      const find = editor.plugin(BaseFindPlugin);
      act(() => find.api.search('world'));
      act(() => mountControls(count));
      expect(find.store.get('query')).toBe('world');
      expect(find.store.get('count')).toBe(1);
      const before = renders;
      act(() => find.api.search('hello'));
      act(() => find.api.move(1));
      expect(renders).toBe(before);
      expect(find.store.get('count')).toBe(2);
      expect(find.store.get('activeIndex')).toBe(1);
      fireEvent.click(view.getAllByRole('button', { name: 'Find' })[0]);
      expect(view.getAllByRole('search')).toHaveLength(1);
      expect((view.getByRole('searchbox') as HTMLInputElement).value).toBe(
        'hello'
      );
      await waitFor(() =>
        expect(document.activeElement).toBe(view.getByRole('searchbox'))
      );
      expect(renders).toBe(before);
    }
  );

  it('closing before deferred search commits cannot restore the query', async () => {
    const { find, ui, setInputQuery, view } = setup();
    act(() => ui.open('hello'));
    await waitFor(() => expect(find.store.get('count')).toBe(2));

    await act(async () => {
      setInputQuery('world');
      ui.close();
    });
    expect(find.store.get('query')).toBe('');
    expect(find.store.get('count')).toBe(0);
    expect(view.queryByRole('search')).toBeNull();
    act(() => ui.open());
    await view.findByRole('searchbox', { name: 'Find text' });
    expect(find.store.get('count')).toBe(0);
  });

  it('shares committed results without scrolling inactive views or clearing search on detach', async () => {
    const OpenFind = () => {
      const { open } = useFind();
      return (
        <button onClick={() => open()} type="button">
          Find
        </button>
      );
    };
    const editor = createEditor({
      plugins: [
        LinkPlugin,
        ...FindKit,
        definePlatePlugin('controls', { slots: { beforeEditable: OpenFind } }),
      ],
      initialValue: value,
    });
    const find = editor.plugin(BaseFindPlugin);
    const Views = ({ first = true }: { first?: boolean }) => (
      <>
        {first && (
          <section aria-label="first view">
            <Plate editor={editor}>
              <PlateContent aria-label="first editor" />
            </Plate>
          </section>
        )}
        <section aria-label="second view">
          <Plate editor={editor}>
            <PlateContent aria-label="second editor" />
          </Plate>
        </section>
      </>
    );
    const view = render(<Views />);
    const first = within(view.getByRole('region', { name: 'first view' }));
    const second = within(view.getByRole('region', { name: 'second view' }));
    const scroll = spyOn(DOMEditor, 'scrollIntoView').mockReturnValue(() => {});
    const search = spyOn(NodeApi, 'findTextRanges');
    try {
      fireEvent.click(first.getByRole('button', { name: 'Find' }));
      fireEvent.change(first.getByRole('searchbox'), {
        target: { value: 'hello' },
      });
      await waitFor(() => expect(find.store.get('count')).toBe(2));
      expect(scroll).toHaveBeenCalledTimes(1);
      expect(second.queryByRole('search')).toBeNull();
      const searches = search.mock.calls.length;
      fireEvent.click(second.getByRole('button', { name: 'Find' }));
      const input = second.getByRole('searchbox');
      expect((input as HTMLInputElement).value).toBe('hello');
      expect(document.activeElement).toBe(input);
      expect(search).toHaveBeenCalledTimes(searches);
      const scrolls = scroll.mock.calls.length;
      fireEvent.change(input, { target: { value: 'world' } });
      await waitFor(() => expect(find.store.get('query')).toBe('world'));
      expect(first.getByRole('searchbox')).toHaveProperty('value', 'world');
      expect(scroll).toHaveBeenCalledTimes(scrolls + 1);
      view.rerender(<Views first={false} />);
      expect(find.store.get('query')).toBe('world');
      expect(find.store.get('count')).toBe(1);
      expect(document.activeElement).toBe(input);
      fireEvent.keyDown(second.getByRole('textbox'), {
        key: 'f',
        ctrlKey: true,
      });
      expect(document.activeElement).toBe(input);
      fireEvent.keyDown(input, { key: 'Escape' });
      await waitFor(() =>
        expect(document.activeElement).toBe(second.getByRole('textbox'))
      );
    } finally {
      view.unmount();
      search.mockRestore();
      scroll.mockRestore();
    }
  });

  it('opens read-only search and seeds it from the current selection', async () => {
    const editor = createEditor({
      plugins: [LinkPlugin, ...FindKit],
      initialValue: value,
    });
    const view = render(
      <Plate editor={editor}>
        <PlateContent aria-label="Editor" readOnly />
      </Plate>
    );
    act(() =>
      editor.update.selection.set({
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 5 },
      })
    );
    const editable = view.getByRole('textbox', { name: 'Editor' });
    fireEvent.keyDown(editable, { key: 'f', ctrlKey: true, isComposing: true });
    expect(view.queryByRole('search')).toBeNull();
    fireEvent.keyDown(editable, { key: 'f', ctrlKey: true });
    const input = await view.findByRole('searchbox');
    await waitFor(() =>
      expect((input as HTMLInputElement).value).toBe('world')
    );
    expect(editor.plugin(BaseFindPlugin).store.get('count')).toBe(1);
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(editable));
  });

  it('keeps nested providers and Strict Mode mounts independent', async () => {
    const inner = createEditor({
      plugins: [LinkPlugin, ...FindKit],
      initialValue: value,
    });
    const NestedView = () => (
      <section aria-label="nested view">
        <Plate editor={inner}>
          <PlateContent aria-label="nested editor" />
        </Plate>
      </section>
    );
    const outer = createEditor({
      plugins: [
        LinkPlugin,
        ...FindKit,
        definePlatePlugin('nested', { slots: { beforeEditable: NestedView } }),
      ],
      initialValue: value,
    });
    const view = render(
      <React.StrictMode>
        <Plate editor={outer}>
          <PlateContent aria-label="outer editor" />
        </Plate>
      </React.StrictMode>
    );
    const nested = within(view.getByRole('region', { name: 'nested view' }));
    fireEvent.keyDown(nested.getByRole('textbox'), { key: 'f', ctrlKey: true });
    const input = await nested.findByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    await waitFor(() =>
      expect(inner.plugin(BaseFindPlugin).store.get('count')).toBe(2)
    );
    expect(outer.plugin(BaseFindPlugin).store.get('query')).toBe('');
    expect(view.getAllByRole('search')).toHaveLength(1);
    expect(document.activeElement).toBe(input);
  });

  it('selects and focuses a result from a custom command control', async () => {
    const SelectMatch = () => {
      const mountedEditor = useEditor();
      return (
        <button
          type="button"
          onClick={() => {
            if (mountedEditor.plugin(BaseFindPlugin).update.select()) {
              mountedEditor.api.dom.focus();
            }
          }}
        >
          Select match
        </button>
      );
    };
    const editor = createEditor({
      plugins: [
        LinkPlugin,
        ...FindKit,
        definePlatePlugin('controls', {
          slots: { beforeEditable: SelectMatch },
        }),
      ],
      initialValue: value,
    });
    const find = editor.plugin(BaseFindPlugin);
    const view = render(
      <Plate editor={editor}>
        <PlateContent aria-label="Editor" />
      </Plate>
    );
    act(() => find.api.search('world'));
    await waitFor(() => expect(find.store.get('count')).toBe(1));
    fireEvent.click(view.getByRole('button', { name: 'Select match' }));
    expect(editor.read.selection()).toEqual({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 5 },
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        view.getByRole('textbox', { name: 'Editor' })
      )
    );
  });

  it.each(['first', 'second'])(
    'returns focus to the %s mounted view when its bar closes',
    async (name) => {
      const editor = createEditor({
        plugins: [LinkPlugin, ...FindKit],
        initialValue: value,
      });
      const view = render(
        <>
          <section aria-label="first view">
            <Plate editor={editor}>
              <PlateContent aria-label="first editor" />
            </Plate>
          </section>
          <section aria-label="second view">
            <Plate editor={editor}>
              <PlateContent aria-label="second editor" />
            </Plate>
          </section>
        </>
      );
      const owner = within(view.getByRole('region', { name: `${name} view` }));
      fireEvent.keyDown(
        owner.getByRole('textbox', { name: `${name} editor` }),
        { key: 'f', ctrlKey: true }
      );
      const input = await owner.findByRole('searchbox', { name: 'Find text' });
      expect(document.activeElement).toBe(input);
      fireEvent.keyDown(input, { key: 'Escape' });
      await waitFor(() => expect(view.queryByRole('search')).toBeNull());
      await waitFor(() =>
        expect(
          document.activeElement ===
            owner.getByRole('textbox', { name: `${name} editor` })
        ).toBe(true)
      );
    }
  );

  it('scrolls the complete active range and retires replaced, closed and unmounted requests', async () => {
    const { editor, find, ui, setInputQuery, view } = setup();
    const initialSelection = editor.read.selection();
    const requests: Array<{ cancelled: boolean }> = [];
    const scroll = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(() => {
      const request = { cancelled: false };
      requests.push(request);
      return () => {
        request.cancelled = true;
      };
    });

    try {
      act(() => ui.open('hello world again'));
      await waitFor(() => expect(find.store.get('count')).toBe(1));
      await waitFor(() => expect(scroll).toHaveBeenCalledTimes(1));
      expect(scroll.mock.calls[0]?.[1]).toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 6 },
      });
      expect(scroll.mock.calls[0]?.[2]).toEqual({
        block: 'nearest',
        inline: 'nearest',
        scrollMode: 'if-needed',
      });
      expect(editor.read.selection()).toEqual(initialSelection);

      act(() => {
        setInputQuery('hello');
      });
      await waitFor(() => expect(find.store.get('count')).toBe(2));
      expect(requests[0]?.cancelled).toBe(true);
      const firstMatchRequest = requests.at(-1);
      act(() => find.api.move(1));
      await waitFor(() => expect(firstMatchRequest?.cancelled).toBe(true));
      const secondMatchRequest = requests.at(-1);
      expect(scroll.mock.calls.at(-1)?.[1]).toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 5 },
      });

      act(() => ui.close());
      await waitFor(() => expect(secondMatchRequest?.cancelled).toBe(true));
      act(() => ui.open('hello'));
      await waitFor(() => expect(find.store.get('count')).toBe(2));
      const reopenedRequest = requests.at(-1);
      expect(reopenedRequest?.cancelled).toBe(false);
      view.unmount();
      expect(reopenedRequest?.cancelled).toBe(true);
    } finally {
      view.unmount();
      scroll.mockRestore();
    }
  });
  it('opens with an empty query before any search has run', async () => {
    const { find, ui, view } = setup();
    expect(find.store.get('query')).toBe('');
    expect(view.queryByRole('search')).toBeNull();
    act(() => ui.open());
    await view.findByRole('searchbox', { name: 'Find text' });
    expect(find.store.get('count')).toBe(0);
  });

  it('leaves composition confirmation to the input method', async () => {
    const { find, ui, view } = setup();
    act(() => ui.open('hello'));
    await waitFor(() => expect(find.store.get('count')).toBe(2));
    const input = view.getByRole('searchbox', { name: 'Find text' });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(find.store.get('activeIndex')).toBe(0);
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(find.store.get('activeIndex')).toBe(0);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(find.store.get('activeIndex')).toBe(1);
  });

  it('reports search failures and clears them after a successful query', () => {
    const editor = createEditor({
      plugins: [LinkPlugin, ...FindKit],
      initialValue: value,
    });
    const { api, store } = editor.plugin(BaseFindPlugin);
    const find = spyOn(NodeApi, 'findTextRanges').mockImplementationOnce(() => {
      throw new Error('Search unavailable');
    });

    try {
      api.search('hello');
      expect(store.get('error')).toEqual(new Error('Search unavailable'));
      expect(store.get('count')).toBe(0);
      api.search('world');
      expect(store.get('error')).toBeNull();
      expect(store.get('count')).toBe(1);
    } finally {
      find.mockRestore();
    }
  });

  it('keeps indexed results stable through navigation and selection commits', async () => {
    const { editor, find, ui, view } = setup();

    act(() => ui.open('hello'));
    await waitFor(() => expect(find.store.get('count')).toBe(2));
    const search = spyOn(NodeApi, 'findTextRanges');

    try {
      act(() => find.api.move(1));
      expect(search).not.toHaveBeenCalled();
      expect(find.store.get('activeIndex')).toBe(1);
      await waitFor(() =>
        expect(
          view.container.querySelectorAll('[data-find-active]')
        ).toHaveLength(1)
      );

      act(() => {
        find.update.select();
      });
      expect(search).not.toHaveBeenCalled();
      expect(editor.read.selection()?.anchor.path).toEqual([1, 0]);

      act(() => ui.close());
      await waitFor(() =>
        expect(
          view.container.querySelectorAll('[data-find-match]')
        ).toHaveLength(0)
      );
      expect(find.store.get('count')).toBe(0);
      expect(find.store.get('query')).toBe('');
    } finally {
      search.mockRestore();
    }
  });

  it('finds through inline descendants without persisting match state', async () => {
    const { editor, find, ui, view } = setup();
    const before = editor.read.children();

    act(() => ui.open('hello world again'));

    await waitFor(() => expect(find.store.get('count')).toBe(1));
    expect(
      Array.from(view.container.querySelectorAll('[data-find-match]'))
        .map((element) => element.textContent)
        .join('')
    ).toBe('hello world again');
    expect(editor.read.children()).toEqual(before);
    expect(find.store.get('activeIndex')).toBe(0);
    let committed = false;

    act(() => {
      committed = find.update.select();
    });
    expect(committed).toBe(true);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 6, path: [0, 2] },
    });
  });

  it('wraps navigation and rescans only after document commits', async () => {
    const { editor, find, ui } = setup();

    act(() => ui.open('hello'));
    await waitFor(() => expect(find.store.get('count')).toBe(2));

    act(() => find.api.move(-1));
    expect(find.store.get('activeIndex')).toBe(1);
    act(() => find.api.move(1));
    expect(find.store.get('activeIndex')).toBe(0);

    act(() => {
      editor.update.text.insert(' hello', {
        at: { offset: 13, path: [1, 0] },
      });
    });
    await waitFor(() => expect(find.store.get('count')).toBe(3));
  });

  it('owns an accessible find bar and returns focus on Escape', async () => {
    const { find, ui, view } = setup();

    act(() => ui.open('hello'));

    const search = await view.findByRole('search', {
      name: 'Find in document',
    });
    const input = view.getByRole('searchbox', { name: 'Find text' });

    await waitFor(() => expect(find.store.get('count')).toBe(2));
    expect(document.activeElement).toBe(input);
    expect(search.getAttribute('aria-busy')).toBe('false');
    expect(view.getByText('1 of 2')).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(find.store.get('activeIndex')).toBe(1);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(find.store.get('activeIndex')).toBe(0);
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => expect(view.queryByRole('search')).toBeNull());
    await waitFor(() =>
      expect(
        document.activeElement === view.getByRole('textbox', { name: 'Editor' })
      ).toBe(true)
    );
  });
});
