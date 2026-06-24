import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Descendant } from '@platejs/plite';

import {
  createReactEditor,
  Editable,
  Plite,
  usePliteRootChrome,
  usePliteRootEditor,
} from '../src';
import { createPliteProjectionGraph } from '../src/projection-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../src/view-selection';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const initialValue = () => ({
  children: [paragraph('body')],
  roots: { header: [paragraph('header')] },
});

const flushRootChromeFocus = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });

describe('usePliteRootChrome', () => {
  test('focuses the root end when no restorable selection exists', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header');
      headerEditor = usePliteRootEditor('header');

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <span>Header chrome</span>
          <Editable aria-label="Header editor" root="header" />
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
        <Editable aria-label="Main editor" />
      </Plite>
    );

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('header-chrome'));
      await flushRootChromeFocus();
    });

    expect(document.activeElement).toBe(screen.getByLabelText('Header editor'));
    expect(headerEditor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 6, path: [0, 0], root: 'header' },
      focus: { offset: 6, path: [0, 0], root: 'header' },
    });

    await act(async () => {
      fireEvent.mouseDown(screen.getByText('Header chrome'));
      await flushRootChromeFocus();
    });

    expect(document.activeElement).toBe(screen.getByLabelText('Header editor'));
    expect(headerEditor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 6, path: [0, 0], root: 'header' },
      focus: { offset: 6, path: [0, 0], root: 'header' },
    });
  });

  test('places selection at the root end when explicitly requested', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header', { selection: 'end' });
      headerEditor = usePliteRootEditor('header');

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <span>Header chrome</span>
          <Editable aria-label="Header editor" root="header" />
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
        <Editable aria-label="Main editor" />
      </Plite>
    );

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('header-chrome'));
      await flushRootChromeFocus();
    });

    expect(headerEditor.read((state) => state.selection.get()?.anchor)).toEqual(
      {
        offset: 6,
        path: [0, 0],
        root: 'header',
      }
    );
  });

  test('ignores native editable text and interactive descendants', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header');

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <button type="button">Header action</button>
          <div
            data-plite-node="element"
            data-testid="native-element-descendant"
          >
            Header paragraph
          </div>
          <span data-plite-string="" data-testid="native-text-descendant">
            Header text
          </span>
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
      </Plite>
    );

    await act(async () => {
      fireEvent.mouseDown(
        screen.getByRole('button', { name: 'Header action' })
      );
      await flushRootChromeFocus();
    });
    expect(editor.read((state) => state.selection.get())).toBeNull();

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('native-text-descendant'));
      await flushRootChromeFocus();
    });
    expect(editor.read((state) => state.selection.get())).toBeNull();

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('native-element-descendant'));
      await flushRootChromeFocus();
    });
    expect(editor.read((state) => state.selection.get())).toBeNull();
  });

  test('handles blank editable root clicks synchronously', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header', { selection: 'end' });
      headerEditor = usePliteRootEditor('header');

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <div
            data-plite-editor="true"
            data-plite-root="header"
            data-testid="blank-editor-surface"
          />
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
      </Plite>
    );

    fireEvent.mouseDown(screen.getByTestId('blank-editor-surface'));
    fireEvent.mouseUp(screen.getByTestId('blank-editor-surface'));
    await flushRootChromeFocus();

    expect(headerEditor.read((state) => state.selection.get()?.anchor)).toEqual(
      {
        offset: 6,
        path: [0, 0],
        root: 'header',
      }
    );
  });

  test('blank editable root clicks focus at the end without a restorable selection', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header');
      headerEditor = usePliteRootEditor('header');

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <div
            data-plite-editor="true"
            data-plite-root="header"
            data-testid="blank-editor-surface"
          />
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
      </Plite>
    );

    fireEvent.mouseDown(screen.getByTestId('blank-editor-surface'));
    fireEvent.mouseUp(screen.getByTestId('blank-editor-surface'));
    await flushRootChromeFocus();

    expect(headerEditor.read((state) => state.selection.get()?.anchor)).toEqual(
      {
        offset: 6,
        path: [0, 0],
        root: 'header',
      }
    );
  });

  test("restores a root's previous selection when chrome reactivates it", async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;
    let mainEditor!: ReturnType<typeof usePliteRootEditor>;

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header');
      headerEditor = usePliteRootEditor('header');
      mainEditor = usePliteRootEditor();

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <span>Header chrome</span>
          <Editable aria-label="Header editor" root="header" />
          <Editable aria-label="Main editor" />
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
      </Plite>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 3 });
      });
    });
    await act(async () => {
      mainEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 4 });
      });
    });

    await act(async () => {
      fireEvent.mouseDown(screen.getByText('Header chrome'));
      await flushRootChromeFocus();
    });

    expect(
      headerEditor.read((state) => state.selection.get()?.anchor.offset)
    ).toBe(3);
  });

  test('clears projected selections when chrome restores a root selection', async () => {
    const editor = createReactEditor({ initialValue: initialValue() });
    let headerEditor!: ReturnType<typeof usePliteRootEditor>;
    let mainEditor!: ReturnType<typeof usePliteRootEditor>;

    const HeaderChrome = () => {
      const chrome = usePliteRootChrome('header');
      headerEditor = usePliteRootEditor('header');
      mainEditor = usePliteRootEditor();

      return (
        <section data-testid="header-chrome" {...chrome.props}>
          <span>Header chrome</span>
          <Editable aria-label="Header editor" root="header" />
          <Editable aria-label="Main editor" />
        </section>
      );
    };

    render(
      <Plite editor={editor}>
        <HeaderChrome />
      </Plite>
    );

    await act(async () => {
      headerEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 3 });
      });
    });
    await act(async () => {
      mainEditor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 4 });
      });
    });

    const graph = createPliteProjectionGraph([
      { path: [0], root: 'header' },
      { path: [0], root: 'main' },
    ]);
    const staleSelection = createPliteViewSelection(graph, {
      anchor: { point: { path: [0, 0], root: 'header', offset: 1 } },
      focus: { point: { path: [0, 0], offset: 1 } },
    });

    writePliteViewSelection(headerEditor, staleSelection);
    expect(readPliteViewSelection(headerEditor)).toEqual(staleSelection);

    await act(async () => {
      fireEvent.mouseDown(screen.getByText('Header chrome'));
      await flushRootChromeFocus();
    });

    expect(readPliteViewSelection(headerEditor)).toBe(null);
    expect(
      headerEditor.read((state) => state.selection.get()?.anchor.offset)
    ).toBe(3);
  });
});
