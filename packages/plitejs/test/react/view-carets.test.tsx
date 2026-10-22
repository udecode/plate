import { act, fireEvent, render, screen, within } from '@testing-library/react';
import {
  createEditorView,
  defineCommand,
  defineEditorSchema,
  definePlugin,
  editorCommands,
  RangeApi,
  schema,
  TextApi,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  Activity,
  Children,
  type ComponentProps,
  type ReactNode,
  StrictMode,
  startTransition,
  useState,
} from 'react';
import { createPortal, flushSync } from 'react-dom';
import { vi } from 'vitest';

import {
  getCaretOwner,
  getCommittedCarets,
  getPlacementGeneration,
} from '../../src/core/view-carets';
import * as domInternal from '../../src/dom/internal';
import { IS_NODE_MAP_DIRTY } from '../../src/dom/internal';
import { FOCUS_SETTLE_TIMEOUT } from '../../src/dom/plugin/dom-editor';
import { markDOMSyncMutationTarget } from '../../src/dom/plugin/dom-sync-mutation-ownership';
import { getViewPresentation } from '../../src/editor-runtime-view';
import { evaluateCommand } from '../../src/internal';
import { createEstimatedPageLayoutEngine } from '../../src/pagination';
import { PagedEditable } from '../../src/pagination/react';
import {
  createEditor,
  type DecorationSource,
  Editable,
  EditorElement,
  EditorRoot,
  useCommand,
  useEditorContext,
  useEditorHistory,
  useRootChrome,
  useRootEditor,
} from '../../src/react';
import { DOMCoverageBoundaryRange } from '../../src/react/components/dom-coverage-boundary';
import { WindowedEditable } from '../../src/react/components/windowed-editable.internal';
import { applyContentRootNavigation } from '../../src/react/editable/content-root-navigation';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import * as mouseUpReplay from '../../src/react/editable/root-interaction-dom-selection-replay';
import { subscribeSource } from '../../src/react/editable/runtime-editor-api';
import { focusPliteEditableAfterEventFrame } from '../../src/react/hooks/focus-plite-editable';
import {
  createMainRootPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../../src/react/view-selection';
import { VirtualizedEditable } from '../../src/react/virtualized';

type RootView = ReturnType<typeof useRootEditor>;

const wait = (ms = 50) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createViewsEditor = () =>
  createEditor({
    initialValue: {
      children: [paragraph('hello world')],
      roots: { note: [paragraph('note text')] },
    },
    plugins: [history()],
  });

const createRegistry = () => {
  const views = new Map<string, RootView>();

  return {
    owner: (editor: RootView) => {
      const current = getCaretOwner(editor);

      if (!current) return null;
      for (const [name, view] of views) {
        if (getViewPresentation(view) === current.presentation) {
          return `${name}:${current.root ?? 'main'}`;
        }
      }

      return 'unknown';
    },
    views,
  };
};

const caret = (view: RootView) =>
  view.read((state) => {
    const selection = state.selection();

    return selection
      ? `${[...selection.anchor.path, selection.anchor.offset].join('.')}${
          RangeApi.isCollapsed(selection)
            ? ''
            : `-${[...selection.focus.path, selection.focus.offset].join('.')}`
        }`
      : null;
  });

const bookmarkCount = (view: RootView) =>
  [...getCommittedCarets(view).book.marks.values()].reduce(
    (count, roots) => count + roots.size,
    0
  );

const place = async (view: RootView, offset: number, path = [0, 0]) => {
  await act(async () => {
    view.update((tx) => tx.selection.set({ path, offset }));
  });
};

const nextFrame = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 16);
  });

const afterFocusCommitExports = async () => {
  await wait(20);
  await nextFrame();
};

const pressChrome = async (name: string) => {
  await act(async () => {
    fireEvent.mouseDown(screen.getByText(`${name} chrome`));
    await wait();
  });
};

const pressChromeThen = async (name: string, between: () => void) => {
  await act(async () => {
    fireEvent.mouseDown(screen.getByText(`${name} chrome`));
    await nextFrame();
    between();
    await wait(100);
  });
};

const mountedView = (label: string) =>
  findMountedEditableDOMRuntime(screen.getByLabelText(label))!.editor;

const nativeCaret = () => {
  const selection = document.getSelection();
  const node = selection?.anchorNode;

  if (!node) return null;
  const element = node instanceof Element ? node : node.parentElement;
  const label = element?.closest('[aria-label]')?.getAttribute('aria-label');

  return `${label}:${node.textContent}@${selection.anchorOffset}${
    selection.isCollapsed ? '' : `-${selection.focusOffset}`
  }`;
};

const textNodeOf = (element: HTMLElement) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if ((node as Text).data.replace(/﻿/g, '')) return node as Text;
  }

  throw new Error('Expected a text node');
};

const clickText = async (label: string, offset: number) => {
  const editable = screen.getByLabelText(label);
  const text = textNodeOf(editable);
  const target = text.parentElement!;

  await act(async () => {
    fireEvent.mouseDown(target);
    editable.focus();
    document.getSelection()!.setBaseAndExtent(text, offset, text, offset);
    document.dispatchEvent(new Event('selectionchange'));
    await wait(100);
    fireEvent.mouseUp(target);
    await wait();
  });
};

const selectNative = (label: string, offset: number) => {
  const text = textNodeOf(screen.getByLabelText(label));

  document.getSelection()!.setBaseAndExtent(text, offset, text, offset);
  document.dispatchEvent(new Event('selectionchange'));
};

const View = ({
  children,
  editable,
  name,
  register,
}: {
  children?: ReactNode;
  editable?: ComponentProps<typeof Editable>;
  name: string;
  register: Map<string, RootView>;
}) => {
  const chrome = useRootChrome();
  register.set(name, useRootEditor());

  return (
    <section {...chrome.props}>
      <span>{name} chrome</span>
      <Editable {...editable} aria-label={`${name} editor`} />
      {children}
    </section>
  );
};

const renderTwoRoots = (
  editor = createViewsEditor(),
  {
    editableB,
    readOnlyB = false,
  }: { editableB?: ComponentProps<typeof Editable>; readOnlyB?: boolean } = {}
) => {
  const registry = createRegistry();
  const rendered = render(
    <>
      <EditorRoot editor={editor}>
        <View name="A" register={registry.views} />
      </EditorRoot>
      <EditorRoot editor={editor} readOnly={readOnlyB}>
        <View editable={editableB} name="B" register={registry.views} />
      </EditorRoot>
      <button type="button">Toolbar</button>
    </>
  );

  return {
    a: registry.views.get('A')!,
    b: registry.views.get('B')!,
    editor,
    registry,
    rendered,
  };
};

describe('views of one editor', () => {
  test('chrome restores the view its own caret, moved by edits made in the other view (R1)', async () => {
    const { a, b, editor } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      b.update((tx) =>
        tx.text.insert('XY', { at: { path: [0, 0], offset: 0 } })
      );
    });
    const undos = editor.read.history().undos.length;

    await pressChrome('A');

    expect([caret(a), editor.read.history().undos.length]).toEqual([
      '0.0.3',
      undos,
    ]);
  });

  test('restores carets through a read-only view that takes the caret by a click (R1)', async () => {
    const { a, b, registry } = renderTwoRoots(undefined, { readOnlyB: true });
    const observed: unknown[] = [];

    await place(a, 1);
    await clickText('B editor', 8);
    observed.push(registry.owner(a), caret(b));
    await pressChrome('A');
    observed.push(registry.owner(a), caret(a));
    await pressChrome('B');
    observed.push(registry.owner(a), caret(b));

    expect(observed).toEqual([
      'B:main',
      '0.0.8',
      'A:main',
      '0.0.1',
      'B:main',
      '0.0.8',
    ]);
  });

  test('typing after a chrome restore, with focus moved away and back, lands at the restored caret (R8)', async () => {
    const { a, b, editor, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await pressChromeThen('A', () => {
      screen.getByRole('button', { name: 'Toolbar' }).focus();
      screen.getByLabelText('A editor').focus();
      fireEvent(
        screen.getByLabelText('A editor'),
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data: 'Q',
          inputType: 'insertText',
        })
      );
    });

    expect([editor.read.text.string([]), registry.owner(a), caret(a)]).toEqual([
      'hQello world',
      'A:main',
      '0.0.2',
    ]);
  });

  test.each([
    ['a command bound with restore-root focus', 'command'],
    ["the view's own editor", 'view'],
    ['the base editor', 'base'],
  ])(
    'a placement through %s after the restore keeps its spot (R8)',
    async (_name, through) => {
      const registry = createRegistry();
      const editor = createViewsEditor();
      let select!: ReturnType<typeof useCommand<typeof editorCommands.select>>;
      const Toolbar = () => {
        select = useCommand(editorCommands.select, { focus: 'restore-root' });
        return null;
      };

      render(
        <>
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views}>
              <Toolbar />
            </View>
          </EditorRoot>
          <EditorRoot editor={editor}>
            <View name="B" register={registry.views} />
          </EditorRoot>
        </>
      );
      const a = registry.views.get('A')!;
      const b = registry.views.get('B')!;
      const target = { path: [0, 0], offset: 6 };

      await place(a, 1);
      await place(b, 8);
      await pressChromeThen('A', () => {
        if (through === 'command') select({ target });
        else if (through === 'view') a.update((tx) => tx.selection.set(target));
        else editor.update((tx) => tx.selection.set(target));
      });

      expect(caret(a)).toBe('0.0.6');
    }
  );

  test('a placement in the same tick as a focus restore that waits for a render keeps its spot (R8)', async () => {
    const { a, b } = renderTwoRoots();

    await place(b, 8);
    await place(a, 1);
    act(() => {
      a.update((tx) => tx.nodes.insert(paragraph('new'), { at: [0] }));
      screen.getByLabelText('B editor').focus();
      b.update((tx) => tx.selection.set({ path: [1, 0], offset: 2 }));
    });
    await act(async () => {
      await wait();
    });

    expect(caret(b)).toBe('1.0.2');
  });

  test('focusing an Editable without a click restores its own caret (R10)', async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });

    expect([
      registry.owner(a),
      caret(a),
      document.activeElement === screen.getByLabelText('A editor'),
    ]).toEqual(['A:main', '0.0.1', true]);
  });

  test('the first focus of a view with no bookmark takes the live caret it shows, so typing there after another view places lands at it', async () => {
    const { a, editor, registry } = renderTwoRoots();

    await place(a, 3);
    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    const focused = registry.owner(a);

    await place(a, 8);
    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect([focused, editor.read.text.string([])]).toEqual([
      'B:main',
      'helQlo world',
    ]);
  });

  test('focusing an Editable without a click after a press in it was released outside restores its own caret (R10)', async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 1);
    await act(async () => {
      fireEvent.mouseDown(
        textNodeOf(screen.getByLabelText('A editor')).parentElement!
      );
      fireEvent.mouseUp(document.body);
      await wait();
    });
    await place(b, 8);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
  });

  test("a click into a parked view publishes only the click's own caret", async () => {
    const { a, b, editor, registry } = renderTwoRoots();
    const published: unknown[] = [];

    await place(b, 8);
    await place(a, 1);
    const stop = subscribeSource(editor, 'commit', () => {
      published.push([registry.owner(a), caret(b)]);
    });

    await clickText('B editor', 3);
    stop();

    expect(published).toEqual([['B:main', '0.0.3']]);
  });

  test("a held press into a parked view publishes only the click's own caret", async () => {
    const { a, b, editor, registry } = renderTwoRoots();
    const editable = screen.getByLabelText('B editor');
    const text = textNodeOf(editable);
    const published: unknown[] = [];

    await place(b, 8);
    await place(a, 1);
    const stop = subscribeSource(editor, 'commit', () => {
      published.push([registry.owner(a), caret(b)]);
    });

    await act(async () => {
      fireEvent.mouseDown(text.parentElement!);
      editable.focus();
      for (let task = 0; task < 5; task += 1) await wait(0);
      document.getSelection()!.setBaseAndExtent(text, 3, text, 3);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
      fireEvent.mouseUp(text.parentElement!);
      await wait();
    });
    stop();

    expect(published).toEqual([['B:main', '0.0.3']]);
  });

  test('focusing an Editable without a click after a window blur ended a press in it restores its own caret', async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      fireEvent.mouseDown(
        textNodeOf(screen.getByLabelText('A editor')).parentElement!
      );
      window.dispatchEvent(new Event('blur'));
      await wait();
    });
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
  });

  test("a page's document-capture pointerdown that focuses a parked view and prevents the press does not restore that view's bookmark", async () => {
    const { a, b, editor, registry } = renderTwoRoots();
    const editable = screen.getByLabelText('B editor');
    const marquee = (event: Event) => {
      if (event.target !== editable) return;
      editable.focus();
      event.preventDefault();
      event.stopPropagation();
    };
    const published: unknown[] = [];

    await place(b, 8);
    await place(a, 1);
    const stop = subscribeSource(editor, 'commit', () => {
      published.push([registry.owner(a), caret(b)]);
    });

    document.addEventListener('pointerdown', marquee, true);
    try {
      await act(async () => {
        // jsdom has no PointerEvent, so this dispatches a plain Event named pointerdown.
        fireEvent.pointerDown(editable);
        await wait();
      });
    } finally {
      document.removeEventListener('pointerdown', marquee, true);
      stop();
    }

    expect([
      published,
      registry.owner(a),
      caret(b),
      nativeCaret() === 'B editor:hello world@8',
      document.activeElement === editable,
    ]).toEqual([[], 'A:main', '0.0.1', true, true]);
  });

  test("a prevented press into a parked view whose own mouseup handler focuses it publishes only that handler's caret", async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    const PlacingView = () => {
      const view = useRootEditor();

      registry.views.set('A', view);

      return (
        <div onMouseDownCapture={(event) => event.preventDefault()}>
          <Editable
            aria-label="A editor"
            onMouseUpCapture={(event) => {
              event.currentTarget.focus();
              view.update((tx) =>
                tx.selection.set({ path: [0, 0], offset: 3 })
              );
            }}
          />
        </div>
      );
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <PlacingView />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <View name="B" register={registry.views} />
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;
    const target = textNodeOf(screen.getByLabelText('A editor')).parentElement!;
    const published: unknown[] = [];

    await place(a, 1);
    await place(registry.views.get('B')!, 8);
    const stop = subscribeSource(editor, 'commit', () => {
      published.push([registry.owner(a), caret(a)]);
    });

    await act(async () => {
      fireEvent.mouseDown(target);
      for (let task = 0; task < 5; task += 1) await wait(0);
      fireEvent.pointerUp(target);
      fireEvent.mouseUp(target);
      await wait();
    });
    stop();

    expect(published).toEqual([['A:main', '0.0.3']]);
  });

  test("a main view's focus inside a note view's update gives that view the caret in main", async () => {
    const editor = createViewsEditor();

    render(
      <>
        <EditorRoot editor={editor}>
          <Editable aria-label="A editor" root="note" />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <Editable aria-label="B editor" />
        </EditorRoot>
      </>
    );
    const a = mountedView('A editor');
    const b = mountedView('B editor');

    await act(async () => {
      a.update(() => {
        b.api.dom.focus();
      });
    });
    const owner = getCaretOwner(b);
    const selection = editor.read.selection();

    expect([
      owner?.presentation === getViewPresentation(b),
      owner && (owner.root ?? 'main'),
      selection && (selection.anchor.root ?? 'main'),
    ]).toEqual([true, 'main', 'main']);
  });

  test('a placement a commit listener makes during a chrome restore keeps the caret and focus', async () => {
    const { a, b, editor, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    const focusedBefore = document.activeElement;
    let placedB = false;
    const stop = subscribeSource(editor, 'commit', () => {
      if (placedB || registry.owner(a) !== 'A:main') return;
      placedB = true;
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 5 }));
    });

    await pressChrome('A');
    stop();

    expect([
      placedB,
      registry.owner(a),
      caret(b),
      document.activeElement === focusedBefore,
    ]).toEqual([true, 'B:main', '0.0.5', true]);
  });

  test('focusing a parked view in the batch that inserts before its caret restores the caret where the insert moved it', async () => {
    const { a, b } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    act(() => {
      b.update((tx) => tx.nodes.set({ checked: true } as never, { at: [0] }));
      screen.getByLabelText('A editor').focus();
      b.update((tx) => tx.nodes.insert(paragraph('new'), { at: [0] }));
    });
    await act(async () => {
      await wait();
    });

    expect(caret(a)).toBe('1.0.1');
  });

  test("a focus requested inside another view's update after an insert restores the parked caret where the insert moved it", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(b, 8);
    await place(a, 1);
    await act(async () => {
      a.update((tx) => {
        tx.nodes.insert(paragraph('new'), { at: [0] });
        b.api.dom.focus();
      });
      await wait();
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '1.0.8']);
  });

  test("a focus requested inside another view's update after its placement restores the parked caret", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(b, 8);
    await place(a, 1);
    await act(async () => {
      a.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 3 });
        b.api.dom.focus();
      });
      await wait();
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.8']);
  });

  test("a chrome press inside another view's update after its placement restores and focuses the parked view", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(b, 8);
    await place(a, 1);
    await act(async () => {
      a.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 3 });
        fireEvent.mouseDown(screen.getByText('B chrome'));
      });
      await wait();
    });

    expect([
      registry.owner(a),
      caret(b),
      document.activeElement === screen.getByLabelText('B editor'),
    ]).toEqual(['B:main', '0.0.8', true]);
  });

  test("a focus requested inside another view's update that rolls back after its placement restores the parked caret", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(b, 8);
    await place(a, 1);
    await act(async () => {
      expect(() =>
        a.update((tx) => {
          tx.selection.set({ path: [0, 0], offset: 3 });
          b.api.dom.focus();
          throw new Error('after focus');
        })
      ).toThrow('after focus');
      await wait();
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.8']);
  });

  test('a placement later in the update that requested a focus keeps the caret', async () => {
    const { a, registry } = renderTwoRoots();

    await place(a, 1);
    await act(async () => {
      a.update((tx) => {
        mountedView('B editor').api.dom.focus();
        tx.selection.set({ path: [0, 0], offset: 4 });
      });
      await wait(100);
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.4']);
  });

  test('a chrome restore of a parked view focuses it with one placement', async () => {
    const { a, b, editor, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    let commits = 0;
    const stop = subscribeSource(editor, 'commit', () => {
      commits += 1;
    });
    const placements = getPlacementGeneration(a);

    await pressChrome('A');
    stop();

    expect([
      commits,
      getPlacementGeneration(a) - placements,
      registry.owner(a),
      caret(a),
      document.activeElement === screen.getByLabelText('A editor'),
    ]).toEqual([1, 1, 'A:main', '0.0.1', true]);
  });

  test("a focus retry after another view's newer placement leaves that placement's native caret", async () => {
    const { a, b, registry } = renderTwoRoots();

    // Only a focused view exports its caret, so A keeps DOM focus throughout.
    act(() => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      fireEvent.mouseDown(screen.getByText('B chrome'));
      a.update((tx) => tx.selection.set({ path: [0, 0], offset: 4 }));
      await nextFrame();
      await wait(100);
    });

    expect([
      registry.owner(a),
      caret(a),
      nativeCaret(),
      document.activeElement === screen.getByLabelText('A editor'),
    ]).toEqual(['A:main', '0.0.4', 'A editor:hello world@4', true]);
  });

  test("a focus retry that waits for a dirty DOM leaves another view's newer placement and focus", async () => {
    const { a, b, registry } = renderTwoRoots();

    await clickText('B editor', 8);
    await place(a, 1);
    const view = mountedView('A editor');

    await act(async () => {
      IS_NODE_MAP_DIRTY.set(view, true);
      view.api.dom.focus();
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
      IS_NODE_MAP_DIRTY.set(view, false);
      await wait(100);
    });

    expect([
      registry.owner(a),
      caret(b),
      document.activeElement === screen.getByLabelText('B editor'),
    ]).toEqual(['B:main', '0.0.6', true]);
  });

  test("a dirty-DOM focus retry requested inside an update that rolls back leaves another view's later placement and focus", async () => {
    const { a, b, registry } = renderTwoRoots();

    await clickText('B editor', 8);
    await place(a, 1);
    const view = mountedView('A editor');

    await act(async () => {
      IS_NODE_MAP_DIRTY.set(view, true);
      expect(() =>
        a.update((tx) => {
          tx.selection.set({ path: [0, 0], offset: 3 });
          tx.selection.set({ path: [0, 0], offset: 4 });
          view.api.dom.focus();
          throw new Error('after focus');
        })
      ).toThrow('after focus');
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
      IS_NODE_MAP_DIRTY.set(view, false);
      await wait(100);
    });

    expect([
      registry.owner(a),
      caret(b),
      document.activeElement === screen.getByLabelText('B editor'),
    ]).toEqual(['B:main', '0.0.6', true]);
  });

  test("a chrome press inside an update that rolls back leaves the other view's later placement", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(b, 8);
    await place(a, 1);
    await act(async () => {
      expect(() =>
        a.update((tx) => {
          tx.selection.set({ path: [0, 0], offset: 3 });
          tx.selection.set({ path: [0, 0], offset: 4 });
          fireEvent.mouseDown(screen.getByText('B chrome'));
          throw new Error('after press');
        })
      ).toThrow('after press');
      a.update((tx) => tx.selection.set({ path: [0, 0], offset: 5 }));
      await wait();
    });

    expect([registry.owner(a), caret(a), caret(b)]).toEqual([
      'A:main',
      '0.0.5',
      '0.0.5',
    ]);
  });

  test('a chrome restore after an update that placed and rolled back focuses the restored view', async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    act(() => {
      expect(() =>
        b.update((tx) => {
          tx.selection.set({ path: [0, 0], offset: 3 });
          throw new Error('after placement');
        })
      ).toThrow('after placement');
    });
    await pressChrome('A');

    expect([
      registry.owner(a),
      caret(a),
      document.activeElement === screen.getByLabelText('A editor'),
    ]).toEqual(['A:main', '0.0.1', true]);
  });

  test("a restore by focus shows the restored caret, not the view's old expanded selection", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 1);
    act(() => {
      writePliteViewSelection(
        a,
        createMainRootPliteViewSelection({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        })
      );
    });
    await place(b, 8);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });

    expect([
      registry.owner(a),
      caret(a),
      nativeCaret(),
      readPliteViewSelection(a),
    ]).toEqual(['A:main', '0.0.1', 'A editor:hello world@1', null]);
  });

  test('undo run through another view makes it the owner (R11)', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    let undoHistory!: ReturnType<typeof useEditorHistory>;
    const History = () => {
      undoHistory = useEditorHistory();
      return null;
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <View name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <View name="B" register={registry.views}>
            <History />
          </View>
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;
    const b = registry.views.get('B')!;

    await place(b, 8);
    await act(async () => {
      b.update((tx) => tx.text.insert('!'));
    });
    await place(a, 1);
    const before = registry.owner(a);

    await act(async () => {
      undoHistory.undo();
      await wait();
    });

    expect([before, registry.owner(a)]).toEqual(['A:main', 'B:main']);
  });

  test('unmounting the owning view clears the owner and frees its anchors (R12)', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    const Harness = ({ showB }: { showB: boolean }) => (
      <>
        <EditorRoot editor={editor}>
          <View name="A" register={registry.views} />
        </EditorRoot>
        {showB ? (
          <EditorRoot editor={editor}>
            <View name="B" register={registry.views} />
          </EditorRoot>
        ) : null}
      </>
    );
    const rendered = render(<Harness showB />);
    const a = registry.views.get('A')!;
    const b = registry.views.get('B')!;
    const startingBookmarks = bookmarkCount(a);

    await place(a, 1);
    await place(b, 8);
    rendered.rerender(<Harness showB={false} />);
    const afterUnmount = registry.owner(a);

    await pressChrome('A');
    await act(async () => {
      await wait(100);
    });

    expect([
      afterUnmount,
      caret(a),
      registry.owner(a),
      bookmarkCount(a),
    ]).toEqual([null, '0.0.1', 'A:main', startingBookmarks]);
  });

  test('a resting caret survives StrictMode and an Activity hide and show (R12)', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    let setMode!: (mode: 'hidden' | 'visible') => void;
    const Harness = () => {
      const [mode, set] = useState<'hidden' | 'visible'>('visible');
      setMode = set;

      return (
        <StrictMode>
          <Activity mode={mode}>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
          </Activity>
          <EditorRoot editor={editor}>
            <View name="B" register={registry.views} />
          </EditorRoot>
        </StrictMode>
      );
    };

    render(<Harness />);
    await place(registry.views.get('A')!, 1);
    await place(registry.views.get('B')!, 8);
    await act(async () => setMode('hidden'));
    await act(async () => setMode('visible'));
    await pressChrome('A');

    expect(caret(registry.views.get('A')!)).toBe('0.0.1');
  });

  test("giving an EditorRoot another editor releases the old editor's resting carets (R12)", async () => {
    const registry = createRegistry();
    const first = createViewsEditor();
    const second = createViewsEditor();
    const Harness = ({ editor }: { editor: typeof first }) => (
      <>
        <EditorRoot editor={editor}>
          <View name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={first}>
          <View name="B" register={registry.views} />
        </EditorRoot>
      </>
    );
    const rendered = render(<Harness editor={first} />);

    const b = registry.views.get('B')!;

    await place(b, 8);
    const startingBookmarks = bookmarkCount(b);

    await place(registry.views.get('A')!, 1);
    await place(b, 5);
    const parkedBookmarks = bookmarkCount(b);

    rendered.rerender(<Harness editor={second} />);

    expect([parkedBookmarks, bookmarkCount(b)]).toEqual([
      startingBookmarks + 1,
      startingBookmarks,
    ]);
  });

  test("header and main Editables under one EditorRoot restore the header's caret (R27)", async () => {
    const editor = createViewsEditor();
    let note!: RootView;
    let main!: RootView;
    const Chrome = () => {
      const chrome = useRootChrome('note');
      note = useRootEditor('note');
      main = useRootEditor();

      return (
        <section {...chrome.props}>
          <span>note chrome</span>
          <Editable aria-label="note editor" root="note" />
        </section>
      );
    };

    render(
      <EditorRoot editor={editor}>
        <Chrome />
        <Editable aria-label="main editor" />
      </EditorRoot>
    );

    await place(note, 3);
    await place(main, 5);
    await pressChrome('note');

    expect([caret(note), document.activeElement]).toEqual([
      '0.0.3',
      screen.getByLabelText('note editor'),
    ]);
  });

  test('chrome restores the caret after Escape clears the selection (R28)', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    const EscapeView = () => {
      const chrome = useRootChrome();
      const view = useRootEditor();
      registry.views.set('A', view);

      return (
        <section {...chrome.props}>
          <span>A chrome</span>
          <Editable
            aria-label="A editor"
            onKeyDown={(event) => {
              if (event.key === 'Escape') view.api.dom.deselect();
            }}
          />
        </section>
      );
    };

    render(
      <EditorRoot editor={editor}>
        <EscapeView />
      </EditorRoot>
    );
    const a = registry.views.get('A')!;

    await place(a, 4);
    await act(async () => {
      fireEvent.keyDown(screen.getByLabelText('A editor'), { key: 'Escape' });
    });
    const cleared = caret(a);

    await pressChrome('A');

    expect([cleared, caret(a)]).toEqual([null, '0.0.4']);
  });

  test('chrome restores the caret after an outside press clears a read-only selection (R28)', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();

    render(
      <>
        <EditorRoot editor={editor} readOnly>
          <View name="A" register={registry.views} />
        </EditorRoot>
        <p>Outside text</p>
      </>
    );
    const a = registry.views.get('A')!;

    await clickText('A editor', 4);
    const placed = caret(a);

    await act(async () => {
      const outside = screen.getByText('Outside text');
      const text = outside.firstChild as Text;

      fireEvent.mouseDown(outside);
      document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
      fireEvent.mouseUp(outside);
    });
    const cleared = caret(a);

    await pressChrome('A');

    expect([placed, cleared, caret(a)]).toEqual(['0.0.4', null, '0.0.4']);
  });
});

const expectOwnCarets = async (a: RootView, b: RootView, path = [0, 0]) => {
  await place(a, 1, path);
  await place(b, 8, path);
  await act(async () => {
    b.update((tx) => tx.text.insert('XY', { at: { path, offset: 0 } }));
  });
  await pressChrome('A');
  const restoredA = caret(a);

  await pressChrome('B');

  expect([restoredA, caret(b)]).toEqual([
    [...path, 3].join('.'),
    [...path, 10].join('.'),
  ]);
};

describe('nested and configured roots (R9)', () => {
  test.each([
    ['the editor', 'editor', undefined],
    ['the editor', 'editor', 'note'],
    ['useEditorContext()', 'context', undefined],
    ['useEditorContext()', 'context', 'note'],
  ] as const)(
    'roots nested in one EditorRoot and given %s keep their own carets on %s',
    async (_name, source, root) => {
      const editor = createViewsEditor();
      const views = new Map<string, RootView>();
      const NestedView = ({ name }: { name: string }) => {
        const chrome = useRootChrome(root);
        views.set(name, useRootEditor(root));

        return (
          <section {...chrome.props}>
            <span>{name} chrome</span>
            <Editable aria-label={`${name} editor`} root={root} />
          </section>
        );
      };
      const Nested = ({ name }: { name: string }) => {
        const context = useEditorContext();

        return (
          <EditorRoot editor={source === 'editor' ? editor : context}>
            <NestedView name={name} />
          </EditorRoot>
        );
      };

      render(
        <EditorRoot editor={editor}>
          <Nested name="A" />
          <Nested name="B" />
        </EditorRoot>
      );

      await expectOwnCarets(views.get('A')!, views.get('B')!);
    }
  );

  test('one configured view mounted by two roots gives two views', async () => {
    const configured = createEditorView(createViewsEditor());
    const registry = createRegistry();

    render(
      <>
        <EditorRoot editor={configured}>
          <View name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={configured}>
          <View name="B" register={registry.views} />
        </EditorRoot>
      </>
    );

    await expectOwnCarets(registry.views.get('A')!, registry.views.get('B')!);
  });
});

const pageEngine = createEstimatedPageLayoutEngine();

const surfaces = {
  Editable: ({ label }: { label: string }) => (
    <Editable aria-label={label} root="note" />
  ),
  PagedEditable: ({ label }: { label: string }) => (
    <PagedEditable
      aria-label={label}
      engine={pageEngine}
      page={{ margins: 72, preset: 'letter' }}
      root="note"
    />
  ),
  VirtualizedEditable: ({ label }: { label: string }) => (
    <VirtualizedEditable
      aria-label={label}
      estimatedBlockSize={32}
      root="note"
    />
  ),
  WindowedEditable: ({ label }: { label: string }) => (
    <WindowedEditable
      aria-label={label}
      mountedTopLevelIndexes={[0]}
      root="note"
      scrollToPath={() => false}
      totalSize={32}
    />
  ),
};

describe('roots Plite mounts for its own surfaces (R26)', () => {
  test.each(Object.keys(surfaces) as Array<keyof typeof surfaces>)(
    'a %s rendered with root= keeps its surface caret under chrome outside it',
    async (surface) => {
      const Surface = surfaces[surface];
      const editor = createViewsEditor();
      const views = new Map<string, RootView>();
      const SurfaceView = ({ name }: { name: string }) => {
        const chrome = useRootChrome('note');
        views.set(name, useRootEditor('note'));

        return (
          <section {...chrome.props}>
            <span>{name} chrome</span>
            <Surface label={`${name} editor`} />
          </section>
        );
      };

      render(
        <>
          <EditorRoot editor={editor}>
            <SurfaceView name="A" />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <SurfaceView name="B" />
          </EditorRoot>
        </>
      );

      await expectOwnCarets(views.get('A')!, views.get('B')!);
      expect(document.activeElement).toBe(screen.getByLabelText('B editor'));
    }
  );

  test('an element-owned content root keeps its surface caret', async () => {
    const editor = createContentRootEditor();
    const views = new Map<string, RootView>();

    render(
      <>
        <EditorRoot editor={editor}>
          <ContentRootView name="A" register={views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <ContentRootView name="B" register={views} />
        </EditorRoot>
      </>
    );

    await expectOwnCarets(views.get('A body')!, views.get('B body')!);
  });
});

const BODY_ROOT = 'details-slot:body';

const contentRootSchema = defineEditorSchema('schema:test-view-carets', {
  elements: {
    'details-content': {
      content: schema.content.open(),
      contentRoots: { body: schema.content.not(schema.content.text()) },
    },
  },
  id: 'test-view-carets',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const createContentRootEditor = () =>
  createEditor({
    initialValue: {
      children: [
        paragraph('above'),
        {
          type: 'details-content',
          childRoots: { body: BODY_ROOT },
          children: [{ text: '' }],
        },
      ],
      roots: { [BODY_ROOT]: [paragraph('body text here')] },
    },
    plugins: [contentRootSchema, history()],
  });

const ContentRootView = ({
  name,
  register,
}: {
  name: string;
  register: Map<string, RootView>;
}) => {
  const bodyChrome = useRootChrome(BODY_ROOT);
  register.set(name, useRootEditor());
  register.set(`${name} body`, useRootEditor(BODY_ROOT));

  return (
    <>
      <div {...bodyChrome.props}>
        <span>{name} chrome</span>
      </div>
      <Editable
        aria-label={`${name} editor`}
        renderElement={(props) =>
          props.element.type === 'details-content' ? (
            <section {...props.attributes}>
              {props.slots.contentRoot('body', {
                ariaLabel: `${name} body`,
              })}
            </section>
          ) : (
            <p {...props.attributes}>{props.children}</p>
          )
        }
      />
    </>
  );
};

describe('content roots rendered by two views (R29)', () => {
  test("arrow-key navigation lands in the view's own copy and history stays there", async () => {
    const editor = createContentRootEditor();
    const registry = createRegistry();
    const { views } = registry;
    let undoHistory!: ReturnType<typeof useEditorHistory>;
    const History = () => {
      undoHistory = useEditorHistory({ root: BODY_ROOT });
      return null;
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <ContentRootView name="A" register={views} />
          <History />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <ContentRootView name="B" register={views} />
        </EditorRoot>
      </>
    );
    const a = views.get('A')!;
    const aBody = views.get('A body')!;

    await place(views.get('B body')!, 4);
    await place(a, 5);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      fireEvent.keyDown(screen.getByLabelText('A editor'), {
        key: 'ArrowRight',
      });
      await wait();
    });
    const landed = [caret(aBody), registry.owner(a)];

    await act(async () => {
      aBody.update((tx) => tx.text.insert('!'));
    });
    await act(async () => {
      undoHistory.undo();
      await wait(100);
    });

    expect([...landed, caret(aBody), registry.owner(a)]).toEqual([
      '0.0.0',
      `A:${BODY_ROOT}`,
      '0.0.0',
      `A:${BODY_ROOT}`,
    ]);
  });

  const renderContentRootViews = () => {
    const editor = createContentRootEditor();
    const registry = createRegistry();

    render(
      <>
        <EditorRoot editor={editor}>
          <ContentRootView name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <ContentRootView name="B" register={registry.views} />
        </EditorRoot>
      </>
    );

    return {
      a: registry.views.get('A')!,
      b: registry.views.get('B')!,
      editor,
      registry,
    };
  };

  const selectAcrossRootsInA = async (beforeImport = () => {}) => {
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      document.dispatchEvent(new Event('selectionchange'));
      await afterFocusCommitExports();
      document
        .getSelection()!
        .setBaseAndExtent(
          textNodeOf(screen.getByLabelText('A editor')),
          1,
          textNodeOf(screen.getByLabelText('A body')),
          4
        );
      document.dispatchEvent(new Event('selectionchange'));
      beforeImport();
      await wait(150);
    });
  };

  test('a selection across content roots with no newer placement claims the caret at its anchor', async () => {
    const { a, b, registry } = renderContentRootViews();

    await place(b, 2);
    await selectAcrossRootsInA();

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
  });

  test('navigation without keyed lookups takes the registered view of the same surface', async () => {
    const editor = createContentRootEditor();
    const views = new Map<string, RootView>();
    const content = new Map<string, ReturnType<typeof useEditorContext>>();
    const Capture = ({ name }: { name: string }) => {
      content.set(name, useEditorContext());
      return null;
    };
    const focused: unknown[] = [];

    render(
      <>
        <EditorRoot editor={editor}>
          <ContentRootView name="A" register={views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <ContentRootView name="B" register={views} />
          <Capture name="B" />
        </EditorRoot>
      </>
    );
    const b = content.get('B')!;

    await place(views.get('B')!, 5);
    await act(async () => {
      applyContentRootNavigation({
        editor: b,
        event: {
          key: 'ArrowRight',
          nativeEvent: new KeyboardEvent('keydown', { key: 'ArrowRight' }),
          preventDefault: () => {},
        } as never,
        focusEditor: (target) => {
          focused.push(target.api.dom.editable()?.getAttribute('aria-label'));
        },
        isRTL: false,
        selection: b.read((state) => state.selection()),
      });
      await wait();
    });

    expect([...new Set(focused)]).toEqual(['B body']);
  });

  test('a selection across content roots queued before a newer equal placement in another view claims nothing', async () => {
    const { b, registry } = renderContentRootViews();

    await place(b, 2);
    await selectAcrossRootsInA(() =>
      b.update({ tags: 'skip-dom-selection' }, (tx) =>
        tx.selection.set({ path: [0, 0], offset: 2 })
      )
    );

    expect([registry.owner(b), caret(b)]).toEqual(['B:main', '0.0.2']);
  });

  test('a selection across content roots that a newer placement in another view overtakes still types at its anchor', async () => {
    const { b, editor } = renderContentRootViews();

    await place(b, 2);
    await selectAcrossRootsInA(() =>
      b.update({ tags: 'skip-dom-selection' }, (tx) =>
        tx.selection.set({ path: [0, 0], offset: 4 })
      )
    );
    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(editor.read.text.string([0])).toBe('aQbove');
  });
});

const sectionValue = () => [
  {
    type: 'section',
    children: [
      { type: 'summary', children: [{ text: 'Summary' }] },
      paragraph('Hidden alpha'),
    ],
  },
  paragraph('Visible beta'),
];

const typeInto = (label: string, data: string) => {
  fireEvent(
    screen.getByLabelText(label),
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data,
      inputType: 'insertText',
    })
  );
};

const SectionView = ({
  closed,
  hidesTitle = false,
  materialize = false,
  name,
  register,
  root,
}: {
  closed: boolean;
  hidesTitle?: boolean;
  materialize?: boolean;
  name: string;
  register: Map<string, RootView>;
  root?: string;
}) => {
  register.set(name, useRootEditor(root));

  return (
    <Editable
      aria-label={`${name} editor`}
      root={root}
      renderElement={({ children, element }) => {
        if (element.type !== 'section' || !closed) {
          return <EditorElement>{children}</EditorElement>;
        }
        const nodes = Children.toArray(children);
        const from = hidesTitle ? 0 : 1;

        return (
          <EditorElement>
            {nodes.slice(0, from)}
            <DOMCoverageBoundaryRange
              boundaryId={`${name}-body`}
              content={nodes.slice(from)}
              from={from}
              reason={materialize ? 'app-hidden' : 'app-collapse'}
              selectionPolicy={materialize ? 'materialize' : 'skip'}
              to={nodes.length - 1}
            >
              Collapsed body
            </DOMCoverageBoundaryRange>
          </EditorElement>
        );
      }}
    />
  );
};

const renderSections = () => {
  const editor = createEditor({ initialValue: sectionValue() });
  const registry = createRegistry();

  render(
    <>
      <EditorRoot editor={editor}>
        <SectionView closed={false} name="A" register={registry.views} />
      </EditorRoot>
      <EditorRoot editor={editor}>
        <SectionView closed name="B" register={registry.views} />
      </EditorRoot>
    </>
  );

  return {
    a: registry.views.get('A')!,
    b: registry.views.get('B')!,
    editor,
    registry,
  };
};

const ClosableSectionView = ({
  closers,
  flush = false,
  hidesTitle,
  name,
  register,
  root,
}: {
  closers: Map<string, () => void>;
  flush?: boolean;
  hidesTitle?: boolean;
  name: string;
  register: Map<string, RootView>;
  root?: string;
}) => {
  const [closed, setClosed] = useState(false);
  closers.set(name, () =>
    flush ? flushSync(() => setClosed(true)) : setClosed(true)
  );

  return (
    <SectionView
      closed={closed}
      hidesTitle={hidesTitle}
      name={name}
      register={register}
      root={root}
    />
  );
};

describe('claims from native input (R30)', () => {
  test("the echo of Plite's DOM export in a surface that does not hold the caret leaves the owner alone", async () => {
    const { a, b, registry } = renderTwoRoots();
    const bEditable = screen.getByLabelText('B editor');

    await place(b, 8);
    await act(async () => {
      bEditable.focus();
      await wait();
    });
    await place(a, 1);
    await act(async () => {
      await wait(50);
    });
    const exported = document.getSelection()!.anchorOffset;

    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
    });

    expect([exported, registry.owner(a), caret(a)]).toEqual([
      8,
      'A:main',
      '0.0.1',
    ]);
  });

  test('selecting where the live caret already sits claims it for that view', async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await clickText('A editor', 8);

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.8']);
  });

  const focusBThenPlaceA = async (a: RootView, offset: number) => {
    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    await place(a, offset);
  };

  test("after another view's export, its echo leaves the owner and a native selection in this view claims", async () => {
    const { a, b, registry } = renderTwoRoots();
    const owners: unknown[] = [];

    await focusBThenPlaceA(a, 3);
    owners.push(registry.owner(a));
    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait();
    });
    owners.push(registry.owner(a));
    await act(async () => {
      selectNative('B editor', 7);
      await wait(150);
    });
    owners.push(registry.owner(a), caret(b));

    expect(owners).toEqual(['A:main', 'A:main', 'B:main', '0.0.7']);
  });

  test("a gesture inside the throttle window after an export's echo claims the caret for its view", async () => {
    const { a, b, registry } = renderTwoRoots();
    const target = textNodeOf(screen.getByLabelText('B editor')).parentElement!;

    await focusBThenPlaceA(a, 3);
    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      fireEvent.mouseDown(target);
      selectNative('B editor', 7);
      await wait(150);
      fireEvent.mouseUp(target);
      await wait();
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
  });

  test("a gesture queued before another editor's export that writes no DOM selection claims the caret for its view", async () => {
    const { a, b, registry } = renderTwoRoots();
    const other = createViewsEditor();
    const target = textNodeOf(screen.getByLabelText('B editor')).parentElement!;

    render(
      <EditorRoot editor={other}>
        <Editable aria-label="Other editor" />
      </EditorRoot>
    );
    await focusBThenPlaceA(a, 1);
    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      fireEvent.mouseDown(target);
      selectNative('B editor', 7);
      other.update((tx) =>
        tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
      );
      await wait(150);
      fireEvent.mouseUp(target);
      await wait();
    });

    expect([registry.owner(a), caret(b), nativeCaret()]).toEqual([
      'B:main',
      '0.0.7',
      'B editor:hello world@7',
    ]);
  });

  test('a selection queued before a newer placement in another view does not clear that caret when its import finds no DOM selection', async () => {
    const { a, registry } = renderTwoRoots();

    await focusBThenPlaceA(a, 1);
    await act(async () => {
      await wait(150);
    });
    const getSelection = vi.spyOn(document, 'getSelection');

    try {
      await act(async () => {
        selectNative('B editor', 7);
        a.update((tx) => tx.selection.set({ path: [0, 0], offset: 4 }));
        getSelection.mockReturnValue(null);
        await wait(150);
      });
    } finally {
      getSelection.mockRestore();
    }

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.4']);
  });

  test("a read-only view's selection that leaves it with no newer placement clears its caret", async () => {
    const { b } = renderTwoRoots(undefined, { readOnlyB: true });
    const outside = screen.getByText('Toolbar').firstChild as Text;

    await clickText('B editor', 8);
    const clicked = caret(b);

    await act(async () => {
      document.getSelection()!.setBaseAndExtent(outside, 2, outside, 2);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(150);
    });

    expect([clicked, caret(b)]).toEqual(['0.0.8', null]);
  });

  test("a read-only view's selection that leaves it, queued before a newer placement in another view, does not clear that caret", async () => {
    const { a, b, registry } = renderTwoRoots(undefined, { readOnlyB: true });
    const outside = screen.getByText('Toolbar').firstChild as Text;

    await clickText('B editor', 8);
    const clicked = [registry.owner(a), caret(b)];

    await act(async () => {
      document.getSelection()!.setBaseAndExtent(outside, 2, outside, 2);
      document.dispatchEvent(new Event('selectionchange'));
      a.update((tx) => tx.selection.set({ path: [0, 0], offset: 2 }));
      await wait(150);
    });

    expect([...clicked, registry.owner(a), caret(a)]).toEqual([
      'B:main',
      '0.0.8',
      'A:main',
      '0.0.2',
    ]);
  });

  test("a press outside a read-only view keeps another view's caret", async () => {
    const { a, registry } = renderTwoRoots(undefined, { readOnlyB: true });
    const toolbar = screen.getByRole('button', { name: 'Toolbar' });
    const text = toolbar.firstChild as Text;

    await clickText('A editor', 4);
    await act(async () => {
      fireEvent.mouseDown(toolbar);
      document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(150);
      fireEvent.mouseUp(toolbar);
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.4']);
  });

  test("a read-only view's selection that leaves it after another view placed the caret keeps that caret", async () => {
    const { a, b, registry } = renderTwoRoots(undefined, { readOnlyB: true });
    const outside = screen.getByText('Toolbar').firstChild as Text;

    await clickText('B editor', 8);
    const clicked = [registry.owner(a), caret(b)];

    await act(async () => {
      a.update({ tags: 'skip-dom-selection' }, (tx) =>
        tx.selection.set({ path: [0, 0], offset: 2 })
      );
    });
    await act(async () => {
      document.getSelection()!.setBaseAndExtent(outside, 2, outside, 2);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(150);
    });

    expect([...clicked, registry.owner(a), caret(a)]).toEqual([
      'B:main',
      '0.0.8',
      'A:main',
      '0.0.2',
    ]);
  });

  test("a read-only view's selection that leaves it after the caret's owner unmounted clears the caret", async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    const Harness = ({ showA }: { showA: boolean }) => (
      <>
        {showA ? (
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views} />
          </EditorRoot>
        ) : null}
        <EditorRoot editor={editor} readOnly>
          <View name="B" register={registry.views} />
        </EditorRoot>
        <p>Outside text</p>
      </>
    );
    const rendered = render(<Harness showA />);
    const b = registry.views.get('B')!;
    const outside = screen.getByText('Outside text').firstChild as Text;

    await clickText('B editor', 8);
    await act(async () => {
      registry.views
        .get('A')!
        .update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
    });
    rendered.rerender(<Harness showA={false} />);
    const unowned = [getCaretOwner(b), caret(b)];

    await act(async () => {
      document.getSelection()!.setBaseAndExtent(outside, 2, outside, 2);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(150);
    });

    expect([...unowned, caret(b)]).toEqual([null, '0.0.2', null]);
  });

  const renderReadOnlyBlurView = (onBlur?: (a: RootView) => void) => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    const ReadOnlyView = () => {
      registry.views.set('B', useRootEditor());

      return (
        <Editable
          aria-label="B editor"
          onBlur={() => onBlur?.(registry.views.get('A')!)}
        />
      );
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <View name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={editor} readOnly>
          <ReadOnlyView />
        </EditorRoot>
        <p>Outside block</p>
      </>
    );

    return {
      a: registry.views.get('A')!,
      b: registry.views.get('B')!,
      registry,
    };
  };

  const pressOutsideBlock = async () => {
    await act(async () => {
      fireEvent.mouseDown(screen.getByText('Outside block'));
      await wait(50);
      fireEvent.mouseUp(screen.getByText('Outside block'));
    });
  };

  test("a press outside a read-only view whose blur handler places another view's caret keeps that caret", async () => {
    const { a, registry } = renderReadOnlyBlurView((other) =>
      other.update({ tags: 'skip-dom-selection' }, (tx) =>
        tx.selection.set({ path: [0, 0], offset: 2 })
      )
    );

    await clickText('B editor', 4);
    const clicked = registry.owner(a);

    await pressOutsideBlock();

    expect([clicked, registry.owner(a), caret(a)]).toEqual([
      'B:main',
      'A:main',
      '0.0.2',
    ]);
  });

  test('a press outside a focused read-only view that holds the caret clears it', async () => {
    const { b } = renderReadOnlyBlurView();

    await clickText('B editor', 4);
    const clicked = caret(b);

    await pressOutsideBlock();

    expect([clicked, caret(b)]).toEqual(['0.0.4', null]);
  });

  test('a click whose selection a newer placement in another view overtakes still types at the click', async () => {
    const { b, editor } = renderTwoRoots();
    const editable = screen.getByLabelText('A editor');
    const target = textNodeOf(editable).parentElement!;

    await place(b, 8);
    await act(async () => {
      fireEvent.mouseDown(target);
      editable.focus();
      document.dispatchEvent(new Event('selectionchange'));
      selectNative('A editor', 3);
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
      await wait(150);
      fireEvent.mouseUp(target);
      await wait();
    });
    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(editor.read.text.string([])).toBe('helQlo world');
  });

  test('typing in a focused view that lost the caret to code brings back its own caret, then types there', async () => {
    const { a, editor, registry } = renderTwoRoots();

    await clickText('B editor', 8);
    await place(a, 1);
    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect([editor.read.text.string([]), registry.owner(a)]).toEqual([
      'hello woQrld',
      'B:main',
    ]);
  });

  test('a selection queued before its own view places a newer caret, then another view takes it, types at the newer caret', async () => {
    const { a, b, editor } = renderTwoRoots();

    await place(a, 5);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      selectNative('A editor', 3);
      a.update((tx) => tx.selection.set({ path: [0, 0], offset: 7 }));
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 9 }));
      await wait(150);
    });
    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(editor.read.text.string([])).toBe('hello wQorld');
  });

  test("a placement in another view right after a caret key the model handles keeps the caret through that key's selection repair", async () => {
    const { a, b, registry } = renderTwoRoots();

    await place(a, 0);
    await act(async () => {
      const editable = screen.getByLabelText('A editor');

      editable.focus();
      fireEvent.keyDown(editable, { key: 'ArrowUp' });
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 4 }));
      await wait(150);
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.4']);
  });

  test('typing in a view that hides the caret moves it out of the hidden body first', async () => {
    const { a, editor, registry } = renderSections();

    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      screen.getByLabelText('B editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect([
      editor.read.text.string([0, 0]),
      editor.read.text.string([0, 1]),
      registry.owner(a),
    ]).toEqual(['SummaryQ', 'Hidden alpha', 'B:main']);
  });

  test('a caret key in a view holding a caret in a body it hides moves the caret out of that body first', async () => {
    const { b } = renderSections();

    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    await place(b, 3, [0, 1, 0]);
    await act(async () => {
      fireEvent.keyDown(screen.getByLabelText('B editor'), {
        key: 'ArrowLeft',
      });
      await wait();
    });

    expect(caret(b)).toBe('0.0.0.6');
  });

  test('typing in the view holding a caret in a body it hides moves the caret out of that body first', async () => {
    const { b, editor } = renderSections();

    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    await place(b, 3, [0, 1, 0]);
    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect([
      editor.read.text.string([0, 0]),
      editor.read.text.string([0, 1]),
    ]).toEqual(['SummaryQ', 'Hidden alpha']);
  });

  test('typing in a view holding a caret in a body it hides inside another block moves the caret out of that body first', async () => {
    const editor = createEditor({
      initialValue: [
        { type: 'quote', children: sectionValue() },
        paragraph('Outside'),
      ],
    });
    const registry = createRegistry();

    render(
      <EditorRoot editor={editor}>
        <SectionView closed name="B" register={registry.views} />
      </EditorRoot>
    );
    const b = registry.views.get('B')!;

    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    await place(b, 3, [0, 0, 1, 0]);
    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect([
      editor.read.text.string([0, 0, 0]),
      editor.read.text.string([0, 0, 1]),
    ]).toEqual(['SummaryQ', 'Hidden alpha']);
  });

  test('closing a section that hides everything before the caret leaves the caret where it is', async () => {
    const editor = createEditor({ initialValue: sectionValue() });
    const registry = createRegistry();
    const closers = new Map<string, () => void>();

    render(
      <EditorRoot editor={editor}>
        <ClosableSectionView
          closers={closers}
          hidesTitle
          name="A"
          register={registry.views}
        />
      </EditorRoot>
    );
    const a = registry.views.get('A')!;

    await act(async () => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      closers.get('A')!();
      await wait();
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.1.0.3']);
  });

  test("a view focused while another root's caret sits at a path its own section hides leaves that caret", async () => {
    const editor = createEditor({
      initialValue: {
        children: sectionValue(),
        roots: { note: sectionValue() },
      },
    });
    const registry = createRegistry();
    const NoteView = () => {
      registry.views.set('B', useRootEditor('note'));

      return <Editable aria-label="B editor" root="note" />;
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <SectionView closed name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <NoteView />
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;
    const b = registry.views.get('B')!;

    await place(b, 3, [0, 1, 0]);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:note', '0.1.0.3']);
  });

  const hideParkedCaretOfFocusedNoteView = async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main text')],
        roots: { note: sectionValue() },
      },
    });
    const registry = createRegistry();
    const closers = new Map<string, () => void>();

    render(
      <>
        <EditorRoot editor={editor}>
          <ClosableSectionView
            closers={closers}
            name="A"
            register={registry.views}
            root="note"
          />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <View name="B" register={registry.views} />
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;

    await act(async () => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await place(registry.views.get('B')!, 2);
    await act(async () => {
      closers.get('A')!();
      await wait();
    });

    return { a, editor, registry };
  };

  test('a focused named-root view whose parked caret sits in a body it then hides shows that caret at the end of the title before any key', async () => {
    await hideParkedCaretOfFocusedNoteView();

    expect(nativeCaret()).toBe('A editor:Summary@7');
  });

  test('typing in a named-root view whose parked caret sits in a body it then hides moves that caret to the end of the title first', async () => {
    const { a, editor, registry } = await hideParkedCaretOfFocusedNoteView();

    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });
    const note = createEditorView(editor, { root: 'note' });

    expect([
      registry.owner(a),
      caret(a),
      note.read.text.string([0, 0]),
      note.read.text.string([0, 1]),
    ]).toEqual(['A:note', '0.0.0.8', 'SummaryQ', 'Hidden alpha']);
  });

  test('a view focused without a click while the live caret sits in a body it hides takes the caret at the end of the title', async () => {
    const { a, editor, registry } = renderSections();

    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    const focused = [
      registry.owner(a),
      caret(a),
      nativeCaret(),
      document.activeElement === screen.getByLabelText('B editor'),
    ];

    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect(focused).toEqual(['B:main', '0.0.0.7', 'B editor:Summary@7', true]);
    expect([
      editor.read.text.string([0, 0]),
      editor.read.text.string([0, 1]),
    ]).toEqual(['SummaryQ', 'Hidden alpha']);
  });

  test('the view holding the caret moves it out of a body it closed in an update that then threw', async () => {
    const editor = createEditor({ initialValue: sectionValue() });
    const registry = createRegistry();
    const closers = new Map<string, () => void>();

    render(
      <EditorRoot editor={editor}>
        <ClosableSectionView
          closers={closers}
          flush
          name="A"
          register={registry.views}
        />
      </EditorRoot>
    );
    const a = registry.views.get('A')!;

    await act(async () => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      expect(() =>
        a.update((tx) => {
          tx.selection.set({ path: [0, 0, 0], offset: 7 });
          closers.get('A')!();
          throw new Error('after close');
        })
      ).toThrow('after close');
    });
    const closed = [caret(a), nativeCaret()];

    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(closed).toEqual(['0.0.0.7', 'A editor:Summary@7']);
    expect([
      editor.read.text.string([0, 0]),
      editor.read.text.string([0, 1]),
    ]).toEqual(['SummaryQ', 'Hidden alpha']);
  });

  test("the view holding the caret moves it out of a body it closed inside another view's update that placed and then threw", async () => {
    const editor = createEditor({ initialValue: sectionValue() });
    const registry = createRegistry();
    const closers = new Map<string, () => void>();

    render(
      <>
        <EditorRoot editor={editor}>
          <ClosableSectionView
            closers={closers}
            flush
            name="A"
            register={registry.views}
          />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <SectionView closed={false} name="B" register={registry.views} />
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;
    const b = registry.views.get('B')!;

    await act(async () => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      expect(() =>
        b.update((tx) => {
          tx.selection.set({ path: [1, 0], offset: 2 });
          closers.get('A')!();
          throw new Error('after close');
        })
      ).toThrow('after close');
    });
    const closed = [registry.owner(a), caret(a), nativeCaret()];

    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(closed).toEqual(['A:main', '0.0.0.7', 'A editor:Summary@7']);
    expect([
      editor.read.text.string([0, 0]),
      editor.read.text.string([0, 1]),
    ]).toEqual(['SummaryQ', 'Hidden alpha']);
  });

  test('the view holding the caret moves it out of a body it closed while a command built a spec it then discarded', async () => {
    const closers = new Map<string, () => void>();
    const editor = createEditor({
      initialValue: sectionValue(),
      plugins: [
        definePlugin('closing-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertBreak, ({ state }) => {
              closers.get('A')!();

              return state.transaction(() => {});
            }),
          ],
        }),
      ],
    });
    const registry = createRegistry();

    render(
      <EditorRoot editor={editor}>
        <ClosableSectionView
          closers={closers}
          flush
          name="A"
          register={registry.views}
        />
      </EditorRoot>
    );
    const a = registry.views.get('A')!;

    await act(async () => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      evaluateCommand(a, editorCommands.insertBreak);
      await wait();
    });

    expect([caret(a), nativeCaret()]).toEqual([
      '0.0.0.7',
      'A editor:Summary@7',
    ]);
  });

  test("another view moving the caret's block into a body the holder hides moves the caret to the end of the title", async () => {
    const { a, b, registry } = renderSections();

    await act(async () => {
      screen.getByLabelText('B editor').focus();
    });
    await place(b, 3, [1, 0]);
    await act(async () => {
      a.update((tx) => tx.nodes.move({ at: [1], to: [0, 2] }));
      await wait();
    });

    expect([registry.owner(a), caret(b), nativeCaret()]).toEqual([
      'B:main',
      '0.0.0.7',
      'B editor:Summary@7',
    ]);
  });

  const renderRoutedBody = () => {
    const editor = createContentRootEditor();
    const registry = createRegistry();
    const NestedBody = () => {
      registry.views.set('nested', useRootEditor(BODY_ROOT));

      return <Editable aria-label="nested body" root={BODY_ROOT} />;
    };
    const OuterView = () => {
      registry.views.set('A', useRootEditor());

      return (
        <Editable
          aria-label="A editor"
          renderElement={(props) =>
            props.element.type === 'details-content' ? (
              <section {...props.attributes}>
                <div contentEditable={false}>
                  <EditorRoot editor={editor}>
                    <NestedBody />
                  </EditorRoot>
                </div>
              </section>
            ) : (
              <p {...props.attributes}>{props.children}</p>
            )
          }
        />
      );
    };

    render(
      <EditorRoot editor={editor}>
        <OuterView />
      </EditorRoot>
    );

    return { a: registry.views.get('A')!, editor, registry };
  };

  test('input in a view whose selection sits in a root it mounts only under another view lands there through this view', async () => {
    const { a, editor, registry } = renderRoutedBody();
    const text = textNodeOf(screen.getByLabelText('nested body'));

    await place(registry.views.get('nested')!, 4);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      document.getSelection()!.setBaseAndExtent(text, 4, text, 4);
      typeInto('A editor', 'Q');
      await wait();
    });

    expect([
      createEditorView(editor, { root: BODY_ROOT }).read.text.string([]),
      registry.owner(a),
    ]).toEqual(['bodyQ text here', `A:${BODY_ROOT}`]);
  });

  test('each key typed through a view into a root it mounts under another view makes one commit, and only the first key places', async () => {
    const { a, editor, registry } = renderRoutedBody();
    const perKey: number[][] = [];
    let commits = 0;

    await place(registry.views.get('nested')!, 4);
    const stop = subscribeSource(editor, 'commit', () => {
      commits += 1;
    });

    for (const [index, key] of ['X', 'Y', 'Z'].entries()) {
      const commitsBefore = commits;
      const placementsBefore = getPlacementGeneration(a);

      await act(async () => {
        if (index === 0) screen.getByLabelText('A editor').focus();
        const text = textNodeOf(screen.getByLabelText('nested body'));

        document
          .getSelection()!
          .setBaseAndExtent(text, 4 + index, text, 4 + index);
        typeInto('A editor', key);
        await wait();
      });
      perKey.push([
        commits - commitsBefore,
        getPlacementGeneration(a) - placementsBefore,
      ]);
    }
    stop();

    expect([
      createEditorView(editor, { root: BODY_ROOT }).read.text.string([]),
      perKey,
    ]).toEqual([
      'bodyXYZ text here',
      [
        [1, 1],
        [1, 0],
        [1, 0],
      ],
    ]);
  });

  test("repeated echoes of another view's export leave the owner", async () => {
    const { a, registry } = renderTwoRoots();
    const owners: unknown[] = [];

    await focusBThenPlaceA(a, 3);
    for (let event = 0; event < 3; event += 1) {
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait();
      });
      owners.push(registry.owner(a));
    }

    expect([...owners, caret(a)]).toEqual([
      'A:main',
      'A:main',
      'A:main',
      '0.0.3',
    ]);
  });

  test("a native selection with no gesture long after another view's export claims the caret for its view", async () => {
    const { a, b, registry } = renderTwoRoots();

    await focusBThenPlaceA(a, 3);
    await act(async () => {
      await wait(500);
    });
    await act(async () => {
      selectNative('B editor', 7);
      await wait(150);
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
  });

  test('a gesture queued before an export that places nothing does not claim the exported caret', async () => {
    const { a, registry } = renderTwoRoots();
    const target = textNodeOf(screen.getByLabelText('B editor')).parentElement!;

    await focusBThenPlaceA(a, 1);
    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      fireEvent.mouseDown(target);
      selectNative('B editor', 7);
      a.update((tx) =>
        tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
      );
      await wait(150);
      fireEvent.mouseUp(target);
      await wait();
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
  });

  test('an equal gesture queued before a newer equal placement in another view claims nothing', async () => {
    const { a, registry } = renderTwoRoots();
    const target = textNodeOf(screen.getByLabelText('B editor')).parentElement!;

    await focusBThenPlaceA(a, 5);
    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      fireEvent.mouseDown(target);
      selectNative('B editor', 5);
      a.update((tx) => tx.selection.set({ path: [0, 0], offset: 5 }));
      await wait(150);
      fireEvent.mouseUp(target);
      await wait();
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.5']);
  });

  test('a selection a DOM repair sets equal to the live caret in a view with no gesture claims nothing', async () => {
    const { a, registry } = renderTwoRoots();

    await focusBThenPlaceA(a, 3);
    await act(async () => {
      document.dispatchEvent(new Event('selectionchange'));
      await wait(150);
    });
    await act(async () => {
      selectNative('B editor', 3);
      await wait(150);
    });

    expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
  });

  test('a touch whose selection a newer placement in another view overtakes still types at the touch', async () => {
    const { b, editor } = renderTwoRoots();
    const editable = screen.getByLabelText('A editor');
    const target = textNodeOf(editable).parentElement!;

    await place(b, 8);
    await act(async () => {
      editable.focus();
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      fireEvent.touchStart(target);
      selectNative('A editor', 3);
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
      await wait(150);
    });
    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(editor.read.text.string([])).toBe('helQlo world');
  });

  test('a selection queued in a view with an older bookmark, then overtaken by a newer placement in another view, types at the selection', async () => {
    const { a, b, editor } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      selectNative('A editor', 3);
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
      await wait(150);
    });
    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(editor.read.text.string([])).toBe('helQlo world');
  });

  test('a focused view that keeps a selection a newer placement in another view overtook shows it before its next key', async () => {
    const { a, b } = renderTwoRoots();

    await place(a, 1);
    await place(b, 8);
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      document.dispatchEvent(new Event('selectionchange'));
      await wait(20);
      selectNative('A editor', 3);
      b.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
      await wait(150);
    });

    expect(nativeCaret()).toBe('A editor:hello world@3');
  });

  test('a selection that disappears right after a queued selection clears the caret', async () => {
    const { a, b } = renderTwoRoots();

    await focusBThenPlaceA(a, 1);
    const getSelection = vi.spyOn(document, 'getSelection');

    try {
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        selectNative('B editor', 7);
        getSelection.mockReturnValue(null);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
    } finally {
      getSelection.mockRestore();
    }

    expect(caret(b)).toBe(null);
  });

  test('a click queued before code places its own view and then another view, released after both, types at the newer caret', async () => {
    const { a, b, editor } = renderTwoRoots();
    const editable = screen.getByLabelText('A editor');
    const target = textNodeOf(editable).parentElement!;

    await place(a, 5);
    await act(async () => {
      fireEvent.mouseDown(target);
      editable.focus();
      selectNative('A editor', 3);
      a.update({ tags: 'skip-dom-selection' }, (tx) =>
        tx.selection.set({ path: [0, 0], offset: 7 })
      );
      b.update({ tags: 'skip-dom-selection' }, (tx) =>
        tx.selection.set({ path: [0, 0], offset: 9 })
      );
      await wait(150);
      fireEvent.mouseUp(target);
      await wait();
    });
    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect(editor.read.text.string([])).toBe('hello wQorld');
  });

  test('in a shadow root, a press whose selection an edit in another view moves does not claim the caret on release', async () => {
    const host = document.createElement('div');

    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');

    shadow.append(container);
    // JSDOM keeps no Selection inside a shadow tree, so the shadow root gets
    // one over a live Range, and the document's reports the host as a browser
    // retargets it.
    let live: Range | null = null;
    let backward = false;
    const edge = (end: boolean) =>
      live && (end ? live.endContainer : live.startContainer);
    const edgeOffset = (end: boolean) =>
      live ? (end ? live.endOffset : live.startOffset) : 0;
    const inner = {
      get anchorNode() {
        return edge(backward);
      },
      get anchorOffset() {
        return edgeOffset(backward);
      },
      get focusNode() {
        return edge(!backward);
      },
      get focusOffset() {
        return edgeOffset(!backward);
      },
      get isCollapsed() {
        return !live || live.collapsed;
      },
      get rangeCount() {
        return live ? 1 : 0;
      },
      get type() {
        if (!live) return 'None';

        return live.collapsed ? 'Caret' : 'Range';
      },
      addRange(range: Range) {
        live = range.cloneRange();
        backward = false;
      },
      collapse(node: Node | null, offset = 0) {
        if (node) inner.setBaseAndExtent(node, offset, node, offset);
        else inner.removeAllRanges();
      },
      containsNode: () => false,
      extend(node: Node, offset = 0) {
        inner.setBaseAndExtent(
          inner.anchorNode!,
          inner.anchorOffset,
          node,
          offset
        );
      },
      getRangeAt: () => live!.cloneRange(),
      removeAllRanges() {
        live = null;
      },
      removeRange() {
        live = null;
      },
      setBaseAndExtent(
        anchorNode: Node,
        anchorOffset: number,
        focusNode: Node,
        focusOffset: number
      ) {
        const range = document.createRange();

        range.setStart(anchorNode, anchorOffset);
        range.setEnd(focusNode, focusOffset);
        backward =
          range.collapsed &&
          (anchorNode !== focusNode || anchorOffset !== focusOffset);
        if (backward) {
          range.setStart(focusNode, focusOffset);
          range.setEnd(anchorNode, anchorOffset);
        }
        live = range;
      },
      toString: () => '',
    };
    const retargeted = {
      anchorNode: host,
      anchorOffset: 0,
      focusNode: host,
      focusOffset: 0,
      isCollapsed: true,
      rangeCount: 1,
      type: 'Caret',
      addRange: inner.addRange,
      collapse: inner.collapse,
      containsNode: inner.containsNode,
      extend: inner.extend,
      getRangeAt: inner.getRangeAt,
      removeAllRanges: inner.removeAllRanges,
      removeRange: inner.removeRange,
      setBaseAndExtent: inner.setBaseAndExtent,
      toString: inner.toString,
    };

    Object.setPrototypeOf(inner, Selection.prototype);
    Object.setPrototypeOf(retargeted, Selection.prototype);
    Object.defineProperty(shadow, 'getSelection', { value: () => inner });
    const getSelection = vi
      .spyOn(document, 'getSelection')
      .mockReturnValue(retargeted as unknown as Selection);

    try {
      const editor = createViewsEditor();
      const registry = createRegistry();

      render(
        <>
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views} />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <View name="B" register={registry.views} />
          </EditorRoot>
        </>,
        { container }
      );
      const a = registry.views.get('A')!;
      const bEditable = within(container).getByLabelText('B editor');

      await act(async () => {
        bEditable.focus();
        await wait();
      });
      await place(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        const bText = textNodeOf(bEditable);

        document.dispatchEvent(new Event('selectionchange'));
        await wait(5);
        fireEvent.mouseDown(bText.parentElement!);
        inner.setBaseAndExtent(bText, 7, bText, 7);
        document.dispatchEvent(new Event('selectionchange'));
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 0 } })
        );
        await wait(150);
        fireEvent.mouseUp(bText.parentElement!);
        await wait();
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.2']);
    } finally {
      getSelection.mockRestore();
      host.remove();
    }
  });

  describe('imports a native selection for the view it belongs to (import plan)', () => {
    const toolbarFocusThenView = async (label: string) => {
      await act(async () => {
        screen.getByRole('button', { name: 'Toolbar' }).focus();
        await wait();
      });
      await act(async () => {
        screen.getByLabelText(label).focus();
        await wait();
      });
    };

    const createTwoParagraphEditor = () =>
      createEditor({
        initialValue: {
          children: [paragraph('hello world'), paragraph('second line')],
          roots: { note: [paragraph('note text')] },
        },
        plugins: [history()],
      });

    const renderContentRoots = () => {
      const editor = createContentRootEditor();
      const registry = createRegistry();

      render(
        <>
          <EditorRoot editor={editor}>
            <ContentRootView name="A" register={registry.views} />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <ContentRootView name="B" register={registry.views} />
          </EditorRoot>
        </>
      );

      return {
        a: registry.views.get('A')!,
        b: registry.views.get('B')!,
        editor,
        registry,
      };
    };

    const selectAcrossRoots = () =>
      document
        .getSelection()!
        .setBaseAndExtent(
          textNodeOf(screen.getByLabelText('A editor')),
          1,
          textNodeOf(screen.getByLabelText('A body')),
          4
        );

    const queueCrossRootSelectInA = async (beforeImport = () => {}) => {
      await act(async () => {
        screen.getByLabelText('A editor').focus();
        document.dispatchEvent(new Event('selectionchange'));
        await afterFocusCommitExports();
        selectAcrossRoots();
        document.dispatchEvent(new Event('selectionchange'));
        beforeImport();
        await wait(150);
      });
    };

    // JSDOM keeps no Selection inside a shadow tree, so each shadow root gets
    // one over a live Range, and the document's reports the host of the tree
    // that holds it, as a browser retargets it.
    const createShadowSelection = () => {
      let live: Range | null = null;
      let backward = false;
      const edge = (end: boolean) =>
        live && (end ? live.endContainer : live.startContainer);
      const edgeOffset = (end: boolean) =>
        live ? (end ? live.endOffset : live.startOffset) : 0;
      const selection = {
        get anchorNode() {
          return edge(backward);
        },
        get anchorOffset() {
          return edgeOffset(backward);
        },
        get focusNode() {
          return edge(!backward);
        },
        get focusOffset() {
          return edgeOffset(!backward);
        },
        get isCollapsed() {
          return !live || live.collapsed;
        },
        get rangeCount() {
          return live ? 1 : 0;
        },
        get type() {
          if (!live) return 'None';

          return live.collapsed ? 'Caret' : 'Range';
        },
        addRange(range: Range) {
          live = range.cloneRange();
          backward = false;
        },
        collapse(node: Node | null, offset = 0) {
          if (node) selection.setBaseAndExtent(node, offset, node, offset);
          else selection.removeAllRanges();
        },
        containsNode: () => false,
        extend(node: Node, offset = 0) {
          selection.setBaseAndExtent(
            selection.anchorNode!,
            selection.anchorOffset,
            node,
            offset
          );
        },
        getRangeAt: () => live!.cloneRange(),
        removeAllRanges() {
          live = null;
        },
        removeRange() {
          live = null;
        },
        setBaseAndExtent(
          anchorNode: Node,
          anchorOffset: number,
          focusNode: Node,
          focusOffset: number
        ) {
          const range = document.createRange();

          range.setStart(anchorNode, anchorOffset);
          range.setEnd(focusNode, focusOffset);
          backward =
            range.collapsed &&
            (anchorNode !== focusNode || anchorOffset !== focusOffset);
          if (backward) {
            range.setStart(focusNode, focusOffset);
            range.setEnd(anchorNode, anchorOffset);
          }
          live = range;
        },
        toString: () => '',
      };

      Object.setPrototypeOf(selection, Selection.prototype);

      return selection;
    };

    // Safari's shadow roots have no getSelection, so with `webKit` a read of
    // the tree's selection reports the host, as the document's does.
    const mountShadowTrees = (count: number, { webKit = false } = {}) => {
      const trees = Array.from({ length: count }, () => {
        const host = document.createElement('div');

        document.body.append(host);
        const shadow = host.attachShadow({ mode: 'open' });
        const container = document.createElement('div');
        const selection = createShadowSelection();

        shadow.append(container);
        if (!webKit) {
          Object.defineProperty(shadow, 'getSelection', {
            value: () => selection,
          });
        }

        return { container, host, selection, shadow };
      });
      let active = trees[0];
      const treeOf = (node: Node | null) =>
        trees.find((tree) => node && tree.shadow.contains(node)) ?? active;
      const retargeted = {
        get anchorNode() {
          return active.host;
        },
        anchorOffset: 0,
        get focusNode() {
          return active.host;
        },
        focusOffset: 0,
        isCollapsed: true,
        rangeCount: 1,
        type: 'Caret',
        addRange(range: Range) {
          active = treeOf(range.startContainer);
          active.selection.addRange(range);
        },
        collapse(node: Node | null, offset?: number) {
          if (node) active = treeOf(node);
          active.selection.collapse(node, offset);
        },
        containsNode: () => false,
        extend(node: Node, offset?: number) {
          active.selection.extend(node, offset);
        },
        getRangeAt: () => active.selection.getRangeAt(),
        removeAllRanges() {
          active.selection.removeAllRanges();
        },
        removeRange() {
          active.selection.removeRange();
        },
        setBaseAndExtent(
          anchorNode: Node,
          anchorOffset: number,
          focusNode: Node,
          focusOffset: number
        ) {
          active = treeOf(anchorNode);
          active.selection.setBaseAndExtent(
            anchorNode,
            anchorOffset,
            focusNode,
            focusOffset
          );
        },
        toString: () => '',
      };

      Object.setPrototypeOf(retargeted, Selection.prototype);
      const getSelection = vi
        .spyOn(document, 'getSelection')
        .mockReturnValue(retargeted as unknown as Selection);

      return {
        select: (text: Text, offset: number) => {
          active = treeOf(text);
          active.selection.setBaseAndExtent(text, offset, text, offset);
        },
        restore: () => {
          getSelection.mockRestore();
          for (const tree of trees) tree.host.remove();
        },
        trees,
      };
    };

    // WebKit answers execCommand('indent') with a beforeinput on the focused
    // editing host whose target range is the shadow tree's selection.
    const forceWebKitShadowProbe = (
      tree: ReturnType<typeof mountShadowTrees>['trees'][number]
    ) => {
      Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: () => {
          let target = document.activeElement;

          while (target?.shadowRoot?.activeElement) {
            target = target.shadowRoot.activeElement;
          }
          const range =
            tree.selection.rangeCount > 0 ? tree.selection.getRangeAt() : null;
          const event = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            composed: true,
            inputType: 'formatIndent',
          });

          Object.defineProperty(event, 'getTargetRanges', {
            value: () => (range ? [range] : []),
          });
          target?.dispatchEvent(event);

          return true;
        },
      });
      const webKit = vi
        .spyOn(domInternal, 'isWebKitDOMHost')
        .mockReturnValue(true);

      return () => {
        webKit.mockRestore();
        Reflect.deleteProperty(document, 'execCommand');
      };
    };

    const secondLineInB = () =>
      textNodeOf(
        within(screen.getByLabelText('B editor')).getByText('second line')
      );

    // In jsdom a focused view's DOM-commit export rewrites its selection
    // before the event, so B claims its selection, focus leaves both views,
    // and A takes the caret without exporting it over B's selection.
    const leaveSelectionInBWithFocusOutside = async (
      a: RootView,
      node: Node,
      offset: number,
      aCaret = { path: [0, 0], offset: 3 }
    ) => {
      const target = node.parentElement!;

      await act(async () => {
        fireEvent.mouseDown(target);
        screen.getByLabelText('B editor').focus();
        document.getSelection()!.setBaseAndExtent(node, offset, node, offset);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(target);
        await wait();
      });
      await act(async () => {
        screen.getByRole('button', { name: 'Toolbar' }).focus();
        await wait();
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set(aCaret)
        );
        await wait(150);
      });
    };

    test('R1: after an export that writes no selection, B claims its own selection', async () => {
      const { a, b, registry } = renderTwoRoots();

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        a.update((tx) => tx.nodes.set({ checked: true } as never, { at: [0] }));
        await wait(20);
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test('R2: a native select with no press, then two placements, then typing types at the newer placement in that view', async () => {
      const { a, b, editor } = renderTwoRoots();

      await place(a, 5);
      await act(async () => {
        screen.getByLabelText('A editor').focus();
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        selectNative('A editor', 3);
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 7 })
        );
        b.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 9 })
        );
        await wait(150);
      });
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });

      expect(editor.read.text.string([])).toBe('hello wQorld');
    });

    test('R3: a press, a select at the exported point and a release after an echo claim for B', async () => {
      const { a, b, registry } = renderTwoRoots();
      const target = textNodeOf(
        screen.getByLabelText('B editor')
      ).parentElement!;

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(target);
        selectNative('B editor', 3);
        await wait(150);
        fireEvent.mouseUp(target);
        await wait();
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.3']);
    });

    test('R4: a press, a select that fires no event and a release claim for B', async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(20);
        fireEvent.mouseUp(text.parentElement!);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R5: a press whose selection another view's insert moves, reported right after the insert, leaves A the caret", async () => {
      const { a, registry } = renderTwoRoots();
      const target = textNodeOf(
        screen.getByLabelText('B editor')
      ).parentElement!;

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.mouseDown(target);
        selectNative('B editor', 7);
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
        );
        // The insert's DOM write lands in a microtask; a browser reports the
        // moved selection in a later task, before the next frame.
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(target);
        await wait();
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
    });

    test('R6: a selection, a newer placement, then the selection disappearing leaves A the caret', async () => {
      const { a, registry } = renderTwoRoots();

      await focusBThenPlaceA(a, 1);
      const getSelection = vi.spyOn(document, 'getSelection');

      try {
        await act(async () => {
          selectNative('B editor', 7);
          a.update((tx) => tx.selection.set({ path: [0, 0], offset: 4 }));
          getSelection.mockReturnValue(null);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
      } finally {
        getSelection.mockRestore();
      }

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.4']);
    });

    test('R7: a cross-root select during a press, then a placement, then the release leaves B the caret', async () => {
      const { b, registry } = renderContentRoots();
      const editable = screen.getByLabelText('A editor');
      const target = textNodeOf(editable).parentElement!;

      await place(b, 2);
      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        selectAcrossRoots();
        document.dispatchEvent(new Event('selectionchange'));
        b.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(b), caret(b)]).toEqual(['B:main', '0.0.2']);
    });

    test("R8: a cross-root select, a placement in its view, then one in another, types at its view's placement", async () => {
      const { a, b, editor } = renderContentRoots();

      await place(a, 3);
      await queueCrossRootSelectInA(() => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 4 })
        );
        b.update((tx) => tx.selection.set({ path: [0, 0], offset: 2 }));
      });
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });

      expect(editor.read.text.string([0])).toBe('abovQe');
    });

    test("R9: in a shadow root, repeated echoes of another view's export leave the owner", async () => {
      const shadow = mountShadowTrees(1);

      try {
        const registry = createRegistry();
        const editor = createViewsEditor();
        const { container } = shadow.trees[0];

        render(
          <>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
            <EditorRoot editor={editor}>
              <View name="B" register={registry.views} />
            </EditorRoot>
          </>,
          { container }
        );
        const a = registry.views.get('A')!;
        const owners: unknown[] = [];

        await act(async () => {
          within(container).getByLabelText('B editor').focus();
          await wait();
        });
        await place(a, 3);
        for (let event = 0; event < 3; event += 1) {
          await act(async () => {
            document.dispatchEvent(new Event('selectionchange'));
            await wait();
          });
          owners.push(registry.owner(a));
        }

        expect([...owners, caret(a)]).toEqual([
          'A:main',
          'A:main',
          'A:main',
          '0.0.3',
        ]);
      } finally {
        shadow.restore();
      }
    });

    test('R11: an event, then a selection with no event, then an event leave A the caret, then claim it for B', async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const owners: unknown[] = [];

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(150);
      });
      owners.push(registry.owner(a));
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      owners.push(registry.owner(a), caret(b));

      expect(owners).toEqual(['A:main', 'B:main', '0.0.7']);
    });

    test("R12: a press in B whose event arrives after A's placement claims nothing, and B types at the press", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const observed: unknown[] = [];

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        a.update((tx) => tx.selection.set({ path: [0, 0], offset: 1 }));
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });
      observed.push(registry.owner(a), caret(a));
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A:main', '0.0.1', 'hello wQorld']);
    });

    test("R13: a press in B whose unreported selection another view's text commit moves claims nothing on its event and release", async () => {
      const { a, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
    });

    test('R14: a drag in B whose selection moves, then a text commit in another paragraph that leaves it there, claims the new point', async () => {
      const { a, b, registry } = renderTwoRoots(createTwoParagraphEditor());
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [1, 0], offset: 11 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R15: with focus outside both views, another view's text commit that collapses B's selection claims nothing", async () => {
      const { a, registry } = renderTwoRoots(createTwoParagraphEditor());

      // B's selection sits in another block than A's caret, because the
      // importer drops a point that lands before the live caret in its block.
      await leaveSelectionInBWithFocusOutside(a, secondLineInB(), 7);
      await act(async () => {
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [1, 0], offset: 11 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
    });

    test("R16: two Editables of one view in separate shadow trees, beside a peer view, each claim from their own tree's selection", async () => {
      const shadow = mountShadowTrees(3);

      try {
        const registry = createRegistry();
        const editor = createViewsEditor();
        const [mainTree, noteTree, peerTree] = shadow.trees;
        let note!: RootView;
        const NoteEditable = () => {
          note = useRootEditor('note');

          return createPortal(
            <Editable aria-label="V note" root="note" />,
            noteTree.container
          );
        };

        render(
          <EditorRoot editor={editor}>
            <View name="V" register={registry.views}>
              <NoteEditable />
            </View>
          </EditorRoot>,
          { container: mainTree.container }
        );
        render(
          <EditorRoot editor={editor}>
            <View name="P" register={registry.views} />
          </EditorRoot>,
          { container: peerTree.container }
        );
        const p = registry.views.get('P')!;

        await act(async () => {
          within(mainTree.container).getByLabelText('V editor').focus();
          await wait();
        });
        await place(p, 3);
        await act(async () => {
          await wait(500);
        });
        await act(async () => {
          shadow.select(
            textNodeOf(within(noteTree.container).getByLabelText('V note')),
            2
          );
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });

        expect([registry.owner(p), caret(note)]).toEqual(['V:note', '0.0.2']);
      } finally {
        shadow.restore();
      }
    });

    test('R17: a Firefox mouseup redraw after an equal placement in another view leaves the selection the browser collapsed and A the caret', async () => {
      // jsdom is no engine, and engine facts are cached per realm.
      const geckoReplay = vi
        .spyOn(mouseUpReplay, 'needsMouseUpDOMSelectionReplay')
        .mockReturnValue(true);

      try {
        const { a, registry } = renderTwoRoots();
        const editable = screen.getByLabelText('B editor');
        const text = textNodeOf(editable);

        await place(a, 1);
        await act(async () => {
          fireEvent.mouseDown(text.parentElement!, {
            clientX: 10,
            clientY: 10,
          });
          editable.focus();
          document.getSelection()!.setBaseAndExtent(text, 2, text, 7);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
          fireEvent.mouseUp(text.parentElement!, { clientX: 60, clientY: 10 });
          a.update((tx) =>
            tx.selection.set({
              anchor: { path: [0, 0], offset: 2 },
              focus: { path: [0, 0], offset: 7 },
            })
          );
          document.getSelection()!.collapse(text, 7);
          await wait(150);
        });

        expect([registry.owner(a), caret(a), nativeCaret()]).toEqual([
          'A:main',
          '0.0.2-0.0.7',
          'B editor:hello world@7',
        ]);
      } finally {
        geckoReplay.mockRestore();
      }
    });

    test('R18: a real removeAllRanges in another view and then in the holder leaves every caret', async () => {
      const { a, registry } = renderTwoRoots();
      const observed: unknown[] = [];

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        document.getSelection()!.removeAllRanges();
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      observed.push(registry.owner(a), caret(a));
      await clickText('A editor', 5);
      await act(async () => {
        document.getSelection()!.removeAllRanges();
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      observed.push(registry.owner(a), caret(a));

      expect(observed).toEqual(['A:main', '0.0.3', 'A:main', '0.0.5']);
    });

    test('R19: on a WebKit shadow host, an echo and a disappearing selection in a view that does not hold the caret claim and clear nothing', async () => {
      const shadow = mountShadowTrees(1);
      const tree = shadow.trees[0];

      const restoreWebKit = forceWebKitShadowProbe(tree);

      try {
        const registry = createRegistry();
        const editor = createViewsEditor();

        render(
          <>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
            <EditorRoot editor={editor}>
              <View name="B" register={registry.views} />
            </EditorRoot>
          </>,
          { container: tree.container }
        );
        const a = registry.views.get('A')!;
        const observed: unknown[] = [];

        await act(async () => {
          within(tree.container).getByLabelText('B editor').focus();
          await wait();
        });
        await place(a, 3);
        await act(async () => {
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
        observed.push(registry.owner(a), caret(a));
        await act(async () => {
          // WebKit's clear site runs when the document has no active element.
          const activeElement = vi
            .spyOn(document, 'activeElement', 'get')
            .mockReturnValue(null);

          try {
            document.dispatchEvent(new Event('selectionchange'));
            await wait(150);
          } finally {
            activeElement.mockRestore();
          }
        });
        observed.push(registry.owner(a), caret(a));

        expect(observed).toEqual(['A:main', '0.0.3', 'A:main', '0.0.3']);
      } finally {
        restoreWebKit();
        shadow.restore();
      }
    });

    test("R20: after a press that another view's insert drops, a key typed in B lands where B's DOM shows the caret", async () => {
      const { a, editor } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const target = textNodeOf(editable).parentElement!;

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.mouseDown(target);
        selectNative('B editor', 7);
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
        );
        await wait(150);
        fireEvent.mouseUp(target);
        await wait();
      });
      const selection = document.getSelection()!;
      const shown =
        selection.anchorNode === textNodeOf(editable)
          ? selection.anchorOffset
          : -1;

      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });

      expect(editor.read.text.string([]).indexOf('Q')).toBe(shown);
    });

    test("R22: with focus outside both views, A deleting the paragraph that holds B's selection claims nothing on its event", async () => {
      const { a, registry } = renderTwoRoots(createTwoParagraphEditor());

      await leaveSelectionInBWithFocusOutside(a, secondLineInB(), 7);
      await act(async () => {
        a.update((tx) => tx.nodes.remove({ at: [1] }));
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
    });

    test("R23: a press in B whose unreported selection the page's mouseup handler moves by an edit through A claims nothing at the release", async () => {
      const { a, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;
      // A browser runs microtasks when each listener returns, so the edit's
      // DOM write lands before the next listener; a dispatch from script runs
      // none until the whole dispatch ends.
      const editThroughA = () => {
        const queued: VoidFunction[] = [];
        const microtasks = vi
          .spyOn(globalThis, 'queueMicrotask')
          .mockImplementation((run) => {
            queued.push(run);
          });

        try {
          a.update((tx) =>
            tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
          );
        } finally {
          microtasks.mockRestore();
        }
        for (const run of queued) run();
      };

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(20);
      });
      // The page listens on the document in the capture phase, so its handler
      // runs before the Editable's own mouseup handling.
      document.addEventListener('mouseup', editThroughA, {
        capture: true,
        once: true,
      });
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
    });

    test("R24: with focus outside both views, a decoration change that replaces the leaf holding B's selection claims nothing on its event", async () => {
      const editor = createTwoParagraphEditor();
      const registry = createRegistry();
      const decoration = { on: false, refresh: () => {} };
      const source: DecorationSource<typeof editor> = {
        id: 'replaces-b-leaf',
        observe: ({ refresh }) => {
          decoration.refresh = () => refresh({ nodeKeys: 'all' });

          return () => {
            decoration.refresh = () => {};
          };
        },
        read: ({ entry: [node, path] }) =>
          decoration.on && TextApi.isText(node)
            ? [
                {
                  key: `leaf-${path.join('.')}`,
                  attributes: { 'data-replaced-leaf': 'hello' },
                  range: {
                    anchor: { path, offset: 0 },
                    focus: { path, offset: 5 },
                  },
                },
              ]
            : [],
      };

      render(
        <>
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views} />
          </EditorRoot>
          <EditorRoot decorations={[source]} editor={editor}>
            <View name="B" register={registry.views} />
          </EditorRoot>
          <button type="button">Toolbar</button>
        </>
      );
      const a = registry.views.get('A')!;

      // B's selection sits in another block than A's caret, because the
      // importer drops a point that lands before the live caret in its block.
      await leaveSelectionInBWithFocusOutside(a, secondLineInB(), 7);
      await act(async () => {
        decoration.on = true;
        decoration.refresh();
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
    });

    // B's selection sits at offset 2 of its Editable element, between its
    // second and third blocks, and moves there from the click with no event,
    // so B's bookmark stays at the click. A's caret stays in the first block,
    // because an import into the block that holds A's caret claims nothing
    // even with no edit.
    const editAroundBlockBoundaryInB = async (edit: (a: RootView) => void) => {
      const { a, registry } = renderTwoRoots(
        createEditor({
          initialValue: {
            children: [
              paragraph('hello world'),
              paragraph('second line'),
              paragraph('third line'),
            ],
            roots: { note: [paragraph('note text')] },
          },
          plugins: [history()],
        })
      );
      const editable = screen.getByLabelText('B editor');

      await leaveSelectionInBWithFocusOutside(a, secondLineInB(), 7);
      await act(async () => {
        document.getSelection()!.setBaseAndExtent(editable, 2, editable, 2);
        edit(a);
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      return [registry.owner(a), caret(a)];
    };

    test.each([
      ['inserts a block before it', 'insert'],
      ['removes a block before it', 'remove'],
    ] as const)(
      "R25: with focus outside both views and B's selection at an offset in its Editable element, A %s, and B claims nothing on its event",
      async (_, edit) => {
        expect(
          await editAroundBlockBoundaryInB((a) =>
            a.update((tx) =>
              edit === 'insert'
                ? tx.nodes.insert(paragraph('new block'), { at: [1] })
                : tx.nodes.remove({ at: [1] })
            )
          )
        ).toEqual(['A:main', '0.0.3']);
      }
    );

    test("R26: after R4's claim, A's placement with its export skipped, then B's queued event and a throttled import leave A the caret", async () => {
      const { a, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(20);
        fireEvent.mouseUp(text.parentElement!);
        await wait(150);
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
    });

    test("R27: a drag in B whose first event was decided, overtaken by A's placement and then decided twice more a throttle interval apart, claims nothing at the release and leaves B the drag's last point to type at", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const observed: unknown[] = [];
      const dragTo = async (focus: number) => {
        document.getSelection()!.setBaseAndExtent(text, 2, text, focus);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      };

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        await dragTo(2);
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await dragTo(5);
        await dragTo(7);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });
      observed.push(registry.owner(a), caret(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A:main', '0.0.1', 'heQorld']);
    });

    test('R28: on a WebKit shadow host, a press and select in B while A holds the caret claims for B at the selection through the probe import', async () => {
      const shadow = mountShadowTrees(1, { webKit: true });
      const tree = shadow.trees[0];

      const restoreWebKit = forceWebKitShadowProbe(tree);

      try {
        const registry = createRegistry();
        const editor = createViewsEditor();

        render(
          <>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
            <EditorRoot editor={editor}>
              <View name="B" register={registry.views} />
            </EditorRoot>
          </>,
          { container: tree.container }
        );
        const a = registry.views.get('A')!;
        const b = registry.views.get('B')!;
        const editable = within(tree.container).getByLabelText('B editor');
        const text = textNodeOf(editable);

        await act(async () => {
          editable.focus();
          await wait();
        });
        await place(a, 3);
        await act(async () => {
          await wait(150);
        });
        await act(async () => {
          fireEvent.mouseDown(text.parentElement!);
          shadow.select(text, 7);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
          fireEvent.mouseUp(text.parentElement!);
          await wait();
        });

        expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
      } finally {
        restoreWebKit();
        shadow.restore();
      }
    });

    test('on a WebKit shadow host, a press and select in B while A holds the caret, released and settled before its first selectionchange, claims for B at the selection through the probe import', async () => {
      const shadow = mountShadowTrees(1, { webKit: true });
      const tree = shadow.trees[0];

      const restoreWebKit = forceWebKitShadowProbe(tree);

      try {
        const registry = createRegistry();
        const editor = createViewsEditor();

        render(
          <>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
            <EditorRoot editor={editor}>
              <View name="B" register={registry.views} />
            </EditorRoot>
          </>,
          { container: tree.container }
        );
        const a = registry.views.get('A')!;
        const b = registry.views.get('B')!;
        const editable = within(tree.container).getByLabelText('B editor');
        const text = textNodeOf(editable);

        await act(async () => {
          editable.focus();
          await wait();
        });
        await place(a, 3);
        await act(async () => {
          await wait(150);
        });
        await act(async () => {
          fireEvent.mouseDown(text.parentElement!);
          shadow.select(text, 7);
          fireEvent.mouseUp(text.parentElement!);
          await wait();
        });
        await act(async () => {
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });

        expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
      } finally {
        restoreWebKit();
        shadow.restore();
      }
    });

    test("R29: a drag in B past its last event claims the drag's last point from the queued event, and the mouseup's waiting import writes nothing", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const observed: unknown[] = [];

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        document.getSelection()!.setBaseAndExtent(text, 2, text, 7);
        fireEvent.mouseUp(text.parentElement!);
        await wait(0);
        observed.push(nativeCaret());
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      observed.push(registry.owner(a), caret(b));

      expect(observed).toEqual([
        'B editor:hello world@2-7',
        'B:main',
        '0.0.2-0.0.7',
      ]);
    });

    test("R30: after another view's export into B, a native selection in B, then a visual-point query in B before its event, claims that selection for B", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const observed: unknown[] = [];

      // jsdom has no Selection.modify, and the query returns before probing
      // without it.
      Object.defineProperty(Selection.prototype, 'modify', {
        configurable: true,
        value(this: Selection, _alter: string, direction: 'left' | 'right') {
          this.collapse(
            this.focusNode,
            this.focusOffset + (direction === 'right' ? 1 : -1)
          );
        },
      });

      try {
        await focusBThenPlaceA(a, 3);
        await act(async () => {
          await wait(150);
        });
        await act(async () => {
          document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
          observed.push(
            b.api.dom.resolveVisualPoint(
              { path: [0, 0], offset: 7 },
              { direction: 'right', unit: 'character' }
            )?.point
          );
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
      } finally {
        Reflect.deleteProperty(Selection.prototype, 'modify');
      }
      observed.push(registry.owner(a), caret(b));

      expect(observed).toEqual([
        { path: [0, 0], offset: 8 },
        'B:main',
        '0.0.7',
      ]);
    });

    test("R31: a press in B that claimed, then A's insert before it during the press, leaves B the moved caret on release, shown in B's DOM", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        a.update((tx) =>
          tx.text.insert('xx', { at: { path: [0, 0], offset: 0 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });

      expect([registry.owner(a), caret(b), nativeCaret()]).toEqual([
        'B:main',
        '0.0.9',
        'B editor:xxhello world@9',
      ]);
    });

    test("R32: with focus outside both views, A moving the block that holds B's selection claims nothing on its event", async () => {
      const { a, registry } = renderTwoRoots(
        createEditor({
          initialValue: {
            children: [
              paragraph('hello world'),
              paragraph('second line'),
              paragraph('third line'),
            ],
            roots: { note: [paragraph('note text')] },
          },
          plugins: [history()],
        })
      );

      // React keeps the later sibling in place and moves the earlier block, so
      // the move takes out the second block, which holds B's selection. A's
      // caret stays in the first block, because the importer drops a point
      // that lands before the live caret in its block.
      await leaveSelectionInBWithFocusOutside(a, secondLineInB(), 7);
      await act(async () => {
        a.update((tx) => tx.nodes.move({ at: [1], to: [2] }));
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
    });

    test("R33: with focus outside both views, A typing the first character of the empty paragraph that holds B's selection claims nothing on its event", async () => {
      const { a, registry } = renderTwoRoots(
        createEditor({
          initialValue: {
            children: [paragraph('hello world'), paragraph('')],
            roots: { note: [paragraph('note text')] },
          },
          plugins: [history()],
        })
      );
      const zeroWidth = screen
        .getByLabelText('B editor')
        .querySelector('[data-editor-zero-width]')!;

      await leaveSelectionInBWithFocusOutside(
        a,
        zeroWidth.firstChild ?? zeroWidth,
        0
      );
      await act(async () => {
        a.update((tx) =>
          tx.text.insert('x', { at: { path: [1, 0], offset: 0 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
    });

    test("R34: a released caret key in B whose event was decided, then A's placement, lets a later native selection with no gesture in B claim", async () => {
      const { a, b, registry } = renderTwoRoots(createTwoParagraphEditor());
      const editable = screen.getByLabelText('B editor');
      const second = secondLineInB();

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.keyDown(editable, { key: 'ArrowDown' });
        document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.keyUp(editable, { key: 'ArrowDown' });
        await wait();
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });
      await act(async () => {
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R35: with focus outside both views, a press in B at offset 0 of a text node that A's text sync then rewrites claims offset 0", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await place(a, 1);
      await act(async () => {
        screen.getByRole('button', { name: 'Toolbar' }).focus();
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 0, text, 0);
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.0']);
    });

    test("R36: a press in B whose unreported selection at 7 the page's mouseup handler leaves in place by appending to its text node claims 7", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(20);
      });
      document.addEventListener('mouseup', () => text.appendData('!'), {
        capture: true,
        once: true,
      });
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R37: a press inside B's own expanded selection that A's placement overtakes, which the browser collapses to the click after mouseup, leaves A the caret and B the click to type at", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;
      const observed: unknown[] = [];

      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 9);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(target);
        await wait(150);
      });
      observed.push(registry.owner(a));
      // jsdom lays out nothing, so the selection's one rect covers the press
      // at (0, 0).
      Object.defineProperty(Range.prototype, 'getClientRects', {
        configurable: true,
        value: () => [{ bottom: 20, left: 0, right: 100, top: 0 }],
      });
      try {
        await act(async () => {
          fireEvent.mouseDown(target);
          a.update({ tags: 'skip-dom-selection' }, (tx) =>
            tx.selection.set({ path: [0, 0], offset: 1 })
          );
          fireEvent.mouseUp(target);
          document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
      } finally {
        Reflect.deleteProperty(Range.prototype, 'getClientRects');
      }
      observed.push(registry.owner(a), caret(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['B:main', 'A:main', '0.0.1', 'helloQ world']);
    });

    test("R37 with the browser's collapse reported after the next frame leaves A the caret and B the click to type at", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;
      const observed: unknown[] = [];

      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 9);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(target);
        await wait(150);
      });
      observed.push(registry.owner(a));
      Object.defineProperty(Range.prototype, 'getClientRects', {
        configurable: true,
        value: () => [{ bottom: 20, left: 0, right: 100, top: 0 }],
      });
      try {
        await act(async () => {
          fireEvent.mouseDown(target);
          a.update({ tags: 'skip-dom-selection' }, (tx) =>
            tx.selection.set({ path: [0, 0], offset: 1 })
          );
          fireEvent.mouseUp(target);
          document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
          await nextFrame();
          await wait(20);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
      } finally {
        Reflect.deleteProperty(Range.prototype, 'getClientRects');
      }
      observed.push(registry.owner(a), caret(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['B:main', 'A:main', '0.0.1', 'helloQ world']);
    });

    test("a press in B whose own mousedown places the press point keeps its drag's imports, and B types over the drag", async () => {
      const { a, b, editor, registry } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;
      const observed: unknown[] = [];

      await place(a, 1);
      // jsdom has no caret-from-point API, so the root's mousedown collapse to
      // the press point is stood in for by a capture listener on an ancestor.
      editable.closest('section')!.addEventListener(
        'mousedown',
        () => {
          b.update((tx) => tx.selection.set({ path: [0, 0], offset: 2 }));
        },
        { capture: true, once: true }
      );
      await act(async () => {
        fireEvent.pointerDown(target);
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 7);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.pointerUp(target);
        fireEvent.mouseUp(target);
        await wait(150);
      });
      observed.push(registry.owner(a));
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['B:main', 'heQorld']);
    });

    test("focusing B through its editor while A holds the caret shows B's bookmark, not A's caret", async () => {
      const { a, b } = renderTwoRoots();

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(b, 7);
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });
      await act(async () => {
        mountedView('B editor').api.dom.focus();
        await wait(150);
      });

      expect(nativeCaret()).toBe('B editor:hello world@7');
    });

    test("a focused B that re-renders without a commit while A holds the caret keeps showing B's bookmark, not A's caret", async () => {
      const registry = createRegistry();
      const editor = createViewsEditor();
      const B = ({ round }: { round: number }) => {
        registry.views.set('B', useRootEditor());

        return <Editable aria-label="B editor" data-round={round} />;
      };
      const Harness = ({ round }: { round: number }) => (
        <>
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views} />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <B round={round} />
          </EditorRoot>
        </>
      );
      const rendered = render(<Harness round={0} />);
      const a = registry.views.get('A')!;
      const b = registry.views.get('B')!;

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(b, 7);
      await place(a, 1);
      const beforeRender = nativeCaret();
      await act(async () => {
        rendered.rerender(<Harness round={1} />);
        await wait(150);
      });

      expect([registry.owner(a), beforeRender, nativeCaret()]).toEqual([
        'A:main',
        'B editor:hello world@7',
        'B editor:hello world@7',
      ]);
    });

    test("R37 with the browser's collapse never reported, judged by the release's own import, leaves A the caret and B the click to type at", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;
      const observed: unknown[] = [];

      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 9);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(target);
        await wait(150);
      });
      Object.defineProperty(Range.prototype, 'getClientRects', {
        configurable: true,
        value: () => [{ bottom: 20, left: 0, right: 100, top: 0 }],
      });
      try {
        await act(async () => {
          fireEvent.mouseDown(target);
          a.update({ tags: 'skip-dom-selection' }, (tx) =>
            tx.selection.set({ path: [0, 0], offset: 1 })
          );
          fireEvent.mouseUp(target);
          document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
          await wait(150);
        });
      } finally {
        Reflect.deleteProperty(Range.prototype, 'getClientRects');
      }
      observed.push(registry.owner(a), caret(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A:main', '0.0.1', 'helloQ world']);
    });

    test('R37 with a focus request on B still settling when the press opens leaves A the caret and B the click to type at', async () => {
      const settleAfterReleaseBeforeItsFrame = FOCUS_SETTLE_TIMEOUT - 8;
      const { a, editor, registry } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;
      const observed: unknown[] = [];

      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 9);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(target);
        await wait(150);
      });
      Object.defineProperty(Range.prototype, 'getClientRects', {
        configurable: true,
        value: () => [{ bottom: 20, left: 0, right: 100, top: 0 }],
      });
      try {
        await act(async () => {
          domInternal.DOMEditor.focus(mountedView('B editor'));
          await wait(settleAfterReleaseBeforeItsFrame);
          fireEvent.mouseDown(target);
          a.update({ tags: 'skip-dom-selection' }, (tx) =>
            tx.selection.set({ path: [0, 0], offset: 1 })
          );
          fireEvent.mouseUp(target);
          document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
          await wait(150);
        });
      } finally {
        Reflect.deleteProperty(Range.prototype, 'getClientRects');
      }
      observed.push(registry.owner(a), caret(a), nativeCaret());
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual([
        'A:main',
        '0.0.1',
        'B editor:hello world@5',
        'helloQ world',
      ]);
    });

    test("a frame focus request on B still settling when a press inside B's expanded selection opens leaves B the click the browser collapses to after a frame", async () => {
      const { b } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;

      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 9);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(target);
        await wait(150);
      });
      Object.defineProperty(Range.prototype, 'getClientRects', {
        configurable: true,
        value: () => [{ bottom: 20, left: 0, right: 100, top: 0 }],
      });
      try {
        await act(async () => {
          focusPliteEditableAfterEventFrame(mountedView('B editor'));
          fireEvent.mouseDown(target);
          fireEvent.mouseUp(target);
          document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
          await nextFrame();
          await wait(20);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
      } finally {
        Reflect.deleteProperty(Range.prototype, 'getClientRects');
      }

      expect([caret(b), nativeCaret()]).toEqual([
        '0.0.5',
        'B editor:hello world@5',
      ]);
    });

    test("a command that changes nothing, run with focus restored on a focused B while A holds the caret, shows B's bookmark, not A's caret", async () => {
      const registry = createRegistry();
      const editor = createViewsEditor();
      const unchanged = defineCommand('test.unchanged', { build: () => false });
      let run!: () => void;
      const Toolbar = () => {
        const dispatch = useCommand(unchanged, { focus: 'restore-root' });

        run = () => {
          dispatch();
        };
        return null;
      };

      render(
        <>
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views} />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <View name="B" register={registry.views}>
              <Toolbar />
            </View>
          </EditorRoot>
        </>
      );
      const a = registry.views.get('A')!;

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(registry.views.get('B')!, 7);
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });
      await act(async () => {
        run();
        await wait(150);
      });

      expect(nativeCaret()).toBe('B editor:hello world@7');
    });

    test("a Shift release during a mouse drag in B that an import judged leaves the drag's gesture open, so the drag's next selection after A places claims nothing", async () => {
      const { a, registry } = renderTwoRoots();
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 2, text, 4);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.keyUp(editable, { key: 'Shift' });
        await nextFrame();
        await wait(20);
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });
      await act(async () => {
        document.getSelection()!.setBaseAndExtent(text, 2, text, 6);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect(registry.owner(a)).toBe('A:main');
    });

    test("a caret key that B's own key handler prevents without moving the selection, once released and settled, lets a later native selection with no gesture in B claim after A places", async () => {
      const { a, b, registry } = renderTwoRoots(createViewsEditor(), {
        editableB: {
          onKeyDown: (event) => {
            event.preventDefault();
          },
        },
      });
      const editable = screen.getByLabelText('B editor');

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.keyDown(editable, { key: 'ArrowRight' });
        fireEvent.keyUp(editable, { key: 'ArrowRight' });
        await nextFrame();
        await wait(20);
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
        await wait(150);
      });
      await act(async () => {
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("a press from outside B released in B, after B's prevented caret key settled with nothing read, claims the selection it leaves in B after A places", async () => {
      const { a, b, registry } = renderTwoRoots(createViewsEditor(), {
        editableB: {
          onKeyDown: (event) => {
            event.preventDefault();
          },
        },
      });
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.keyDown(editable, { key: 'ArrowRight' });
        fireEvent.keyUp(editable, { key: 'ArrowRight' });
        await nextFrame();
        await wait(20);
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(screen.getByText('Toolbar'));
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        fireEvent.mouseUp(text.parentElement!);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("a Command caret key in B whose only keyup is Command's, as macOS sends, releases its gesture, so a later native selection with no gesture in B claims after A places", async () => {
      const { a, b, registry } = renderTwoRoots(createViewsEditor(), {
        editableB: {
          onKeyDown: (event) => {
            event.preventDefault();
          },
        },
      });
      const editable = screen.getByLabelText('B editor');

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.keyDown(editable, { key: 'ArrowRight', metaKey: true });
        fireEvent.keyUp(editable, { key: 'Meta' });
        await nextFrame();
        await wait(20);
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
        await wait(150);
      });
      await act(async () => {
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("a press in B that a page's capture handler prevents, placing nothing, once released and settled, lets a later native selection with no gesture in B claim after A places", async () => {
      const { a, b, registry } = renderTwoRoots();
      const target = textNodeOf(
        screen.getByLabelText('B editor')
      ).parentElement!;

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      document.addEventListener(
        'mousedown',
        (event) => {
          event.preventDefault();
        },
        { capture: true, once: true }
      );
      await act(async () => {
        fireEvent.pointerDown(target);
        fireEvent.mouseDown(target);
        fireEvent.pointerUp(target);
        fireEvent.mouseUp(target);
        await nextFrame();
        await wait(20);
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
        await wait(150);
      });
      await act(async () => {
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("a press in B whose page capture handler places A with its export skipped leaves A the caret when B's selection from that press arrives", async () => {
      let placeA = () => {};
      const { a, registry } = renderTwoRoots(createViewsEditor(), {
        editableB: {
          onMouseDownCapture: () => {
            placeA();
          },
        },
      });
      const editable = screen.getByLabelText('B editor');
      const text = textNodeOf(editable);
      const target = text.parentElement!;

      placeA = () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 2 })
        );
      };
      await place(a, 1);
      await act(async () => {
        fireEvent.pointerDown(target);
        fireEvent.mouseDown(target);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.pointerUp(target);
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.2']);
    });

    test("a press in B whose unreported selection at 4 the page's mouseup handler moves to 5 by inserting a repeated character before it claims nothing", async () => {
      const { a, registry } = renderTwoRoots(createTwoParagraphEditor());
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(a, 1, [1, 0]);
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 4, text, 4);
        await wait(20);
      });
      document.addEventListener('mouseup', () => text.insertData(2, 'l'), {
        capture: true,
        once: true,
      });
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '1.0.1']);
    });

    test("a press in B whose unreported selection at 5 the page's mouseup handler keeps at 5 by deleting text after it claims at 5", async () => {
      const { a, b, registry } = renderTwoRoots(createTwoParagraphEditor());
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(a, 1, [1, 0]);
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
        await wait(20);
      });
      document.addEventListener('mouseup', () => text.deleteData(5, 4), {
        capture: true,
        once: true,
      });
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.5']);
    });

    test("a press in B whose unreported selection at 7 the page's mouseup handler keeps at 7 by replacing one character before it with one claims at 7", async () => {
      const { a, b, registry } = renderTwoRoots(createTwoParagraphEditor());
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(a, 1, [1, 0]);
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(20);
      });
      document.addEventListener('mouseup', () => text.replaceData(1, 1, 'a'), {
        capture: true,
        once: true,
      });
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("a press in B whose unreported selection at 7 the page's mouseup handler moves to 0 by rewriting its whole text node claims nothing", async () => {
      const { a, registry } = renderTwoRoots(createTwoParagraphEditor());
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;

      await act(async () => {
        screen.getByLabelText('B editor').focus();
        await wait();
      });
      await place(a, 1, [1, 0]);
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        await wait(20);
      });
      let rewritten: number | null = null;

      document.addEventListener(
        'mouseup',
        () => {
          text.nodeValue = `${text.data}!`;
          rewritten = document.getSelection()!.anchorOffset;
        },
        { capture: true, once: true }
      );
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([rewritten, registry.owner(a), caret(a)]).toEqual([
        0,
        'A:main',
        '1.0.1',
      ]);
    });

    test("a text write in B after the Editable whose write began the note's turn unmounted is judged against B's own read, so B's caret at the start of the written text claims", async () => {
      const registry = createRegistry();
      const editor = createViewsEditor();
      const Harness = ({ withA }: { withA: boolean }) => (
        <>
          {withA && (
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
          )}
          <EditorRoot editor={editor}>
            <View name="B" register={registry.views} />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <View name="C" register={registry.views} />
          </EditorRoot>
          <button type="button">Toolbar</button>
        </>
      );
      const rendered = render(<Harness withA />);
      const b = registry.views.get('B')!;
      const c = registry.views.get('C')!;
      const textInB = textNodeOf(screen.getByLabelText('B editor'));

      await place(c, 1);
      await act(async () => {
        screen.getByRole('button', { name: 'Toolbar' }).focus();
        await wait(150);
      });
      act(() => {
        markDOMSyncMutationTarget(
          textNodeOf(screen.getByLabelText('A editor')),
          'characterData'
        );
        rendered.rerender(<Harness withA={false} />);
      });
      await act(async () => {
        document.getSelection()!.setBaseAndExtent(textInB, 0, textInB, 0);
        c.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(b), caret(b)]).toEqual(['B:main', '0.0.0']);
    });

    test("R38: a touch in B that A's placement overtakes, whose caret the browser's compatibility mouse events place after touchend, leaves A the caret and B the tap to type at", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;
      const observed: unknown[] = [];

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.touchStart(target);
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 4 })
        );
        fireEvent.touchEnd(target);
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        document.dispatchEvent(new Event('selectionchange'));
        fireEvent.mouseUp(target);
        await wait(150);
      });
      observed.push(registry.owner(a), caret(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A:main', '0.0.4', 'hello wQorld']);
    });

    test("R39: a drag in B that claimed at its first event, then code placing A and B, then the drag moving on with no event, keeps B's placed caret through the mouseup's import", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 2, text, 4);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        b.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 9 })
        );
        document.getSelection()!.setBaseAndExtent(text, 2, text, 7);
        fireEvent.mouseUp(text.parentElement!);
        await wait();
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.9']);
    });

    test("R40: a press in B that claimed at its first import, then the page's mouseup handler editing through A, leaves B the caret it claimed, moved by the edit", async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const target = text.parentElement!;
      // A browser runs microtasks when each listener returns, so the edit's
      // DOM write lands before the next listener; a dispatch from script runs
      // none until the whole dispatch ends.
      const editThroughA = () => {
        const queued: VoidFunction[] = [];
        const microtasks = vi
          .spyOn(globalThis, 'queueMicrotask')
          .mockImplementation((run) => {
            queued.push(run);
          });

        try {
          a.update((tx) =>
            tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
          );
        } finally {
          microtasks.mockRestore();
        }
        for (const run of queued) run();
      };

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(target);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      document.addEventListener('mouseup', editThroughA, {
        capture: true,
        once: true,
      });
      await act(async () => {
        fireEvent.mouseUp(target);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R41: on a WebKit shadow host, a drag in B that A's placement overtakes, then two probe imports a throttle interval apart, leaves B the last probed point to type at", async () => {
      const shadow = mountShadowTrees(1);
      const tree = shadow.trees[0];
      const restoreWebKit = forceWebKitShadowProbe(tree);

      try {
        const registry = createRegistry();
        const editor = createViewsEditor();

        render(
          <>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
            <EditorRoot editor={editor}>
              <View name="B" register={registry.views} />
            </EditorRoot>
            <button type="button">Toolbar</button>
          </>,
          { container: tree.container }
        );
        const a = registry.views.get('A')!;
        const editable = within(tree.container).getByLabelText('B editor');
        const text = textNodeOf(editable);
        const observed: unknown[] = [];
        const dragTo = async (focus: number) => {
          tree.selection.setBaseAndExtent(text, 2, text, focus);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        };

        await act(async () => {
          editable.focus();
          await wait();
        });
        await place(a, 1);
        await act(async () => {
          await wait(150);
        });
        await act(async () => {
          fireEvent.mouseDown(text.parentElement!);
          await dragTo(2);
          a.update({ tags: 'skip-dom-selection' }, (tx) =>
            tx.selection.set({ path: [0, 0], offset: 1 })
          );
          await dragTo(5);
          await dragTo(7);
          fireEvent.mouseUp(text.parentElement!);
          await wait();
        });
        observed.push(registry.owner(a), caret(a));
        await act(async () => {
          within(tree.container)
            .getByRole('button', { name: 'Toolbar' })
            .focus();
          await wait();
        });
        await act(async () => {
          editable.focus();
          await wait();
        });
        await act(async () => {
          fireEvent(
            editable,
            new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              data: 'Q',
              inputType: 'insertText',
            })
          );
          await wait();
        });
        observed.push(editor.read.text.string([]));

        expect(observed).toEqual(['A:main', '0.0.1', 'heQorld']);
      } finally {
        restoreWebKit();
        shadow.restore();
      }
    });

    test('R42: a caret key in B whose event was decided, released by the window losing focus before its keyup, then A placing, lets a later native selection with no gesture in B claim', async () => {
      const { a, b, registry } = renderTwoRoots(createTwoParagraphEditor());
      const editable = screen.getByLabelText('B editor');
      const second = secondLineInB();

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.keyDown(editable, { key: 'ArrowDown' });
        document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.blur(window);
        await wait();
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });
      await act(async () => {
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test.each([
      ['the window losing focus', 'blur'],
      ['a dragend', 'dragend'],
    ] as const)(
      'R43 and R44: a drag in B that claimed at its first event, ended by %s with no mouseup, then A placing, lets a later native selection with no gesture in B claim',
      async (_, release) => {
        const { a, b, registry } = renderTwoRoots();
        const text = textNodeOf(screen.getByLabelText('B editor'));

        await focusBThenPlaceA(a, 1);
        await act(async () => {
          await wait(150);
        });
        await act(async () => {
          fireEvent.mouseDown(text.parentElement!);
          document.getSelection()!.setBaseAndExtent(text, 2, text, 4);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
          if (release === 'blur') fireEvent.blur(window);
          else fireEvent.dragEnd(text.parentElement!);
          await wait();
        });
        await act(async () => {
          a.update({ tags: 'skip-dom-selection' }, (tx) =>
            tx.selection.set({ path: [0, 0], offset: 1 })
          );
          await wait(150);
        });
        await act(async () => {
          selectNative('B editor', 7);
          await wait(150);
        });

        expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
      }
    );

    test('a drag in B that claimed at its first event, released over the page outside B, then A placing, lets a later native selection with no gesture in B claim', async () => {
      const { a, b, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 2, text, 4);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
        fireEvent.mouseUp(document.body);
        await wait();
      });
      await act(async () => {
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });
      await act(async () => {
        selectNative('B editor', 7);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R45: after case 2's keep, a change that commits in the kept view before its next key leaves its DOM showing its bookmark, and the key lands there", async () => {
      const { a, b, editor } = renderContentRoots();
      const observed: unknown[] = [];

      await place(b, 2);
      await queueCrossRootSelectInA(() =>
        b.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 4 })
        )
      );
      await act(async () => {
        a.update((tx) => tx.nodes.set({ checked: true } as never, { at: [0] }));
        await wait();
      });
      observed.push(nativeCaret());
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([0]));

      expect(observed).toEqual(['A editor:above@1', 'aQbove']);
    });

    test('R46: typing in the holder after a DOM repair writes its selection, with another view mounted, lands as in a lone editor', async () => {
      const typeThroughRepair = async (withPeer: boolean) => {
        const editor = createViewsEditor();
        const registry = createRegistry();
        const { unmount } = render(
          <>
            <EditorRoot editor={editor}>
              <View name="A" register={registry.views} />
            </EditorRoot>
            {withPeer ? (
              <EditorRoot editor={editor}>
                <View name="B" register={registry.views} />
              </EditorRoot>
            ) : null}
          </>
        );
        const a = registry.views.get('A')!;

        await clickText('A editor', 5);
        await act(async () => {
          typeInto('A editor', 'X');
          await wait(0);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
        await act(async () => {
          typeInto('A editor', 'Y');
          await wait();
        });
        const typed = [editor.read.text.string([]), caret(a), nativeCaret()];

        unmount();

        return typed;
      };

      const withPeer = await typeThroughRepair(true);

      expect(withPeer).toEqual(await typeThroughRepair(false));
    });

    test("R47: with focus on a button outside both views, B's edit that rewrites the holder A's text node leaves A's caret where the edit mapped it", async () => {
      const { a, b, registry } = renderTwoRoots();

      await clickText('A editor', 7);
      await act(async () => {
        screen.getByRole('button', { name: 'Toolbar' }).focus();
        await wait(150);
      });
      await act(async () => {
        b.update((tx) =>
          tx.text.insert('xx', { at: { path: [0, 0], offset: 0 } })
        );
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.9']);
    });

    test("R48: a drag in B past its last event, then A placing between the release and the queued event, leaves A the caret and B the drag's last point to type at", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));
      const observed: unknown[] = [];

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        document.getSelection()!.setBaseAndExtent(text, 2, text, 7);
        fireEvent.mouseUp(text.parentElement!);
        await wait(0);
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 4 })
        );
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      observed.push(registry.owner(a), caret(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A:main', '0.0.4', 'heQorld']);
    });

    test('R49: a caret key pressed twice in B in one throttle window and released before the trailing event, then A placing, leaves A the caret', async () => {
      const { a, registry } = renderTwoRoots(
        createEditor({
          initialValue: {
            children: [
              paragraph('hello world'),
              paragraph('second line'),
              paragraph('third line'),
            ],
            roots: { note: [paragraph('note text')] },
          },
          plugins: [history()],
        })
      );
      const editable = screen.getByLabelText('B editor');
      const second = secondLineInB();
      const third = textNodeOf(within(editable).getByText('third line'));

      await focusBThenPlaceA(a, 1);
      await act(async () => {
        await wait(150);
      });
      // Plite moves the caret itself at the document's last line, and the
      // browser moves it above that line.
      await act(async () => {
        fireEvent.keyDown(editable, { key: 'ArrowDown' });
        document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
        document.dispatchEvent(new Event('selectionchange'));
        fireEvent.keyDown(editable, { key: 'ArrowDown', repeat: true });
        document.getSelection()!.setBaseAndExtent(third, 1, third, 1);
        document.dispatchEvent(new Event('selectionchange'));
        fireEvent.keyUp(editable, { key: 'ArrowDown' });
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        );
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.1']);
    });

    test("R50: with focus outside both views, a Firefox mouseup redraw after a decision vetoed the drag's later points, which A's block insert moved, with no placement, leaves the selection the browser collapsed", async () => {
      // jsdom is no engine, and engine facts are cached per realm.
      const geckoReplay = vi
        .spyOn(mouseUpReplay, 'needsMouseUpDOMSelectionReplay')
        .mockReturnValue(true);

      try {
        const { a, registry } = renderTwoRoots(createTwoParagraphEditor());
        const editable = screen.getByLabelText('B editor');
        const text = textNodeOf(editable);
        const selection = document.getSelection()!;

        await place(a, 1);
        await act(async () => {
          screen.getByRole('button', { name: 'Toolbar' }).focus();
          await wait(150);
        });
        await act(async () => {
          fireEvent.mouseDown(text.parentElement!, {
            clientX: 10,
            clientY: 10,
          });
          selection.setBaseAndExtent(text, 2, text, 4);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
        });
        const claimed = registry.owner(a);

        await act(async () => {
          // The drag runs on past both blocks, and A's insert before them
          // moves its end while the selection stays expanded.
          selection.setBaseAndExtent(editable, 0, editable, 2);
          a.update((tx) =>
            tx.nodes.insert(paragraph('new block'), { at: [0] })
          );
          await wait(0);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(150);
          fireEvent.mouseUp(text.parentElement!, { clientX: 60, clientY: 10 });
          selection.collapse(editable, 3);
          await wait(150);
        });

        expect([
          claimed,
          selection.anchorNode === editable,
          selection.anchorOffset,
          selection.isCollapsed,
        ]).toEqual(['B:main', true, 3, true]);
      } finally {
        geckoReplay.mockRestore();
      }
    });

    test("R51: with focus outside both views and B's selection at an offset in its Editable element, A inserting a block after that offset lets B claim on its event", async () => {
      expect(
        await editAroundBlockBoundaryInB((a) =>
          a.update((tx) => tx.nodes.insert(paragraph('new block'), { at: [3] }))
        )
      ).toEqual(['B:main', '2.0.0']);
    });

    // B's focus brings both views into the listener, so the selection in A
    // keeps both throttles busy and the selection in B reaches A first.
    const selectInBAfterA = async (beforeDecisions = () => {}) => {
      await act(async () => {
        selectNative('A editor', 3);
        await wait(20);
        selectNative('B editor', 7);
        beforeDecisions();
        await wait(150);
      });
    };

    test('R52: with A holding the caret and notified first, a native selection with no gesture in B claims', async () => {
      const { a, b, registry } = renderTwoRoots();

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        await wait(150);
      });
      await selectInBAfterA();

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R53: R52 with a placement in A's view between the arrival and both decisions leaves A the caret, and B's next key types at the selection", async () => {
      const { a, editor, registry } = renderTwoRoots();
      const observed: unknown[] = [];

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        await wait(150);
      });
      await selectInBAfterA(() =>
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 1 })
        )
      );
      observed.push(registry.owner(a));
      await toolbarFocusThenView('B editor');
      await act(async () => {
        typeInto('B editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A:main', 'hello wQorld']);
    });

    test('R54: a click in B within 80 ms of a DOM-commit export into it claims', async () => {
      const { a, b, registry } = renderTwoRoots();

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        a.update((tx) =>
          tx.text.insert('!', { at: { path: [0, 0], offset: 11 } })
        );
      });
      await act(async () => {
        const text = textNodeOf(screen.getByLabelText('B editor'));

        fireEvent.mouseDown(text.parentElement!);
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.mouseUp(text.parentElement!);
        await wait(150);
      });

      expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.0.7']);
    });

    test("R55: with focus on a button outside both views, B's edit that merges away the block holding the holder A's caret leaves A's caret where the edit mapped it", async () => {
      const { a, b, registry } = renderTwoRoots(
        createEditor({
          initialValue: {
            children: [
              paragraph('hello world'),
              paragraph('second line'),
              paragraph('third line'),
            ],
            roots: { note: [paragraph('note text')] },
          },
          plugins: [history()],
        })
      );
      const editable = screen.getByLabelText('A editor');
      const third = textNodeOf(within(editable).getByText('third line'));

      // A plain removal maps A's caret to the point its removed DOM collapses
      // to, so only a merge shows whether the note covered A.
      await act(async () => {
        fireEvent.mouseDown(third.parentElement!);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(third, 7, third, 7);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
        fireEvent.mouseUp(third.parentElement!);
        await wait();
      });
      await act(async () => {
        screen.getByRole('button', { name: 'Toolbar' }).focus();
        await wait(150);
      });
      await act(async () => {
        b.update((tx) => tx.nodes.merge({ at: [2] }));
        await wait(0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '1.0.18']);
    });

    test("swapped case 11, before the press's first decision: a click queued before code places another view at 9 and then its own view at 7 types at its own view's caret, shown in its DOM", async () => {
      const { a, b, editor } = renderTwoRoots();
      const editable = screen.getByLabelText('A editor');
      const target = textNodeOf(editable).parentElement!;
      const observed: unknown[] = [];

      await place(a, 5);
      await act(async () => {
        editable.focus();
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.mouseDown(target);
        selectNative('A editor', 3);
        b.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 9 })
        );
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 7 })
        );
        await wait(150);
        fireEvent.mouseUp(target);
        await wait();
      });
      observed.push(nativeCaret());
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A editor:hello world@7', 'hello wQorld']);
    });

    test("swapped case 11, after the press's first decision: a click that code then places another view at 9 and then its own view at 7 types at its own view's caret, shown in its DOM", async () => {
      const { a, b, editor } = renderTwoRoots();
      const editable = screen.getByLabelText('A editor');
      const target = textNodeOf(editable).parentElement!;
      const observed: unknown[] = [];

      await place(a, 5);
      await act(async () => {
        await wait(150);
      });
      await act(async () => {
        fireEvent.mouseDown(target);
        editable.focus();
        selectNative('A editor', 3);
        b.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 9 })
        );
        a.update({ tags: 'skip-dom-selection' }, (tx) =>
          tx.selection.set({ path: [0, 0], offset: 7 })
        );
        await wait(150);
        fireEvent.mouseUp(target);
        await wait();
      });
      observed.push(nativeCaret());
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });
      observed.push(editor.read.text.string([]));

      expect(observed).toEqual(['A editor:hello world@7', 'hello wQorld']);
    });

    test('a commit listener that places during an expanded import keeps its placement', async () => {
      const { a, b, editor, registry } = renderContentRoots();
      let placedB = false;

      await place(b, 2);
      const stop = subscribeSource(editor, 'commit', () => {
        if (placedB || registry.owner(a) !== 'A:main') return;
        placedB = true;
        b.update((tx) => tx.selection.set({ path: [0, 0], offset: 4 }));
      });

      try {
        await queueCrossRootSelectInA();
      } finally {
        stop();
      }

      expect([placedB, registry.owner(a), caret(b)]).toEqual([
        true,
        'B:main',
        '0.0.4',
      ]);
      expect(readPliteViewSelection(a)).toBeNull();
    });

    test('a kept gesture whose text changed since arrival leaves its view no bookmark', async () => {
      const { b, editor } = renderTwoRoots();
      const editable = screen.getByLabelText('A editor');
      const target = textNodeOf(editable).parentElement!;

      await place(b, 8);
      await act(async () => {
        editable.focus();
        document.dispatchEvent(new Event('selectionchange'));
        await wait(20);
        fireEvent.touchStart(target);
        selectNative('A editor', 3);
        b.update((tx) => {
          tx.text.insert('xx', { at: { path: [0, 0], offset: 0 } });
          tx.selection.set({ path: [0, 0], offset: 8 });
        });
        await wait(150);
      });
      await toolbarFocusThenView('A editor');
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });

      expect(editor.read.text.string([])).toBe('xxhello woQrld');
    });

    test('a kept gesture inside an open update leaves its view no bookmark', async () => {
      const { a, b, editor } = renderTwoRoots();
      const editable = screen.getByLabelText('A editor');
      const text = textNodeOf(editable);

      await place(a, 8);
      await place(b, 8);
      await act(async () => {
        fireEvent.mouseDown(text.parentElement!);
        editable.focus();
        document.getSelection()!.setBaseAndExtent(text, 3, text, 3);
        // A committed update replaces the carets a keep inside it wrote, so
        // only a rollback keeps them.
        expect(() =>
          b.update((tx) => {
            tx.selection.set({ path: [0, 0], offset: 6 });
            fireEvent.mouseUp(text.parentElement!);
            throw new Error('roll back');
          })
        ).toThrow('roll back');
        await wait(150);
      });
      await toolbarFocusThenView('A editor');
      await act(async () => {
        typeInto('A editor', 'Q');
        await wait();
      });

      expect(editor.read.text.string([])).toBe('hello woQrld');
    });

    test('a beforeinput fallback import in a view that does not hold the caret types where base types', async () => {
      const { a, editor, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });
      await act(async () => {
        document.getSelection()!.setBaseAndExtent(text, 7, text, 7);
        typeInto('B editor', 'Q');
        await wait();
      });

      expect([editor.read.text.string([]), registry.owner(a)]).toEqual([
        'helQlo world',
        'B:main',
      ]);
    });

    test('an assistive-technology reselect at the points of the last export, long after it, claims nothing', async () => {
      const { a, registry } = renderTwoRoots();
      const text = textNodeOf(screen.getByLabelText('B editor'));

      await focusBThenPlaceA(a, 3);
      await act(async () => {
        document.dispatchEvent(new Event('selectionchange'));
        await wait(500);
      });
      await act(async () => {
        const selection = document.getSelection()!;
        const range = document.createRange();

        range.setStart(text, 3);
        selection.removeAllRanges();
        selection.addRange(range);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(150);
      });

      expect([registry.owner(a), caret(a)]).toEqual(['A:main', '0.0.3']);
    });
  });
});

describe('restores into what the view shows', () => {
  test('a restore in the same tick as the collapse that hides its caret lands at the end of the title before typing', async () => {
    const editor = createEditor({ initialValue: sectionValue() });
    const registry = createRegistry();
    const ClosingView = ({ name }: { name: string }) => {
      registry.views.set(name, useRootEditor());

      return (
        <Editable
          aria-label={`${name} editor`}
          renderElement={({ children, element }) => {
            if (
              name !== 'B' ||
              element.type !== 'section' ||
              element.closed !== true
            ) {
              return <EditorElement>{children}</EditorElement>;
            }
            const nodes = Children.toArray(children);

            return (
              <EditorElement>
                {nodes[0]}
                <DOMCoverageBoundaryRange
                  boundaryId="B-body"
                  content={nodes.slice(1)}
                  from={1}
                >
                  Collapsed body
                </DOMCoverageBoundaryRange>
              </EditorElement>
            );
          }}
        />
      );
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <ClosingView name="A" />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <ClosingView name="B" />
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;
    const b = registry.views.get('B')!;

    await place(b, 3, [0, 1, 0]);
    await place(a, 1, [0, 0, 0]);
    act(() => {
      a.update((tx) => tx.nodes.set({ closed: true } as never, { at: [0] }));
      screen.getByLabelText('B editor').focus();
    });
    const focused = [
      registry.owner(a),
      caret(b),
      nativeCaret(),
      document.activeElement === screen.getByLabelText('B editor'),
    ];

    await act(async () => {
      typeInto('B editor', 'Q');
      await wait();
    });

    expect(focused).toEqual(['B:main', '0.0.0.7', 'B editor:Summary@7', true]);
    expect([
      editor.read.text.string([0, 0]),
      editor.read.text.string([0, 1]),
    ]).toEqual(['SummaryQ', 'Hidden alpha']);
  });

  test.each([
    ['a transition', true],
    ['component state', false],
  ])(
    'closing a section through %s and focusing in one batch puts the caret at the end of the title',
    async (_name, transition) => {
      const editor = createEditor({ initialValue: sectionValue() });
      const registry = createRegistry();
      const closers = new Map<string, () => void>();

      render(
        <>
          <EditorRoot editor={editor}>
            <SectionView closed={false} name="A" register={registry.views} />
          </EditorRoot>
          <EditorRoot editor={editor}>
            <ClosableSectionView
              closers={closers}
              name="B"
              register={registry.views}
            />
          </EditorRoot>
        </>
      );
      const a = registry.views.get('A')!;
      const b = registry.views.get('B')!;

      await place(b, 3, [0, 1, 0]);
      await place(a, 1, [0, 0, 0]);
      const placements = getPlacementGeneration(b);

      act(() => {
        if (transition) startTransition(closers.get('B')!);
        else closers.get('B')!();
        screen.getByLabelText('B editor').focus();
      });
      await act(async () => {
        await wait();
      });

      expect([
        registry.owner(a),
        caret(b),
        nativeCaret(),
        document.activeElement === screen.getByLabelText('B editor'),
        getPlacementGeneration(b) - placements,
      ]).toEqual(['B:main', '0.0.0.7', 'B editor:Summary@7', true, 1]);
    }
  );

  test('a placement in the batch that focuses a view with no parked caret keeps the caret and focus', async () => {
    const { a, registry } = renderSections();

    await place(a, 3, [0, 1, 0]);
    act(() => {
      a.update((tx) => tx.nodes.set({ checked: true } as never, { at: [1] }));
      screen.getByLabelText('B editor').focus();
      a.update((tx) => tx.selection.set({ path: [0, 1, 0], offset: 5 }));
    });
    await act(async () => {
      await wait();
    });

    expect([
      registry.owner(a),
      caret(a),
      document.activeElement === screen.getByLabelText('B editor'),
    ]).toEqual(['A:main', '0.1.0.5', true]);
  });

  test('focusing a view after the base editor cleared and then placed the caret types at the newer caret', async () => {
    const editor = createViewsEditor();
    const registry = createRegistry();

    render(
      <EditorRoot editor={editor}>
        <View name="A" register={registry.views} />
      </EditorRoot>
    );
    const a = registry.views.get('A')!;

    await place(a, 1);
    await act(async () => {
      editor.update((tx) => tx.selection.set(null));
    });
    await act(async () => {
      editor.update((tx) => tx.selection.set({ path: [0, 0], offset: 6 }));
    });
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });
    const focused = caret(a);

    await act(async () => {
      typeInto('A editor', 'Q');
      await wait();
    });

    expect([focused, editor.read.text.string([])]).toEqual([
      '0.0.6',
      'hello Qworld',
    ]);
  });

  test('a restore keeps a caret inside a boundary that materializes on selection', async () => {
    const editor = createEditor({ initialValue: sectionValue() });
    const registry = createRegistry();

    render(
      <>
        <EditorRoot editor={editor}>
          <SectionView closed={false} name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <SectionView closed materialize name="B" register={registry.views} />
        </EditorRoot>
      </>
    );
    const a = registry.views.get('A')!;
    const b = registry.views.get('B')!;

    await place(b, 3, [0, 1, 0]);
    await place(a, 1, [0, 0, 0]);
    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });

    expect([registry.owner(a), caret(b)]).toEqual(['B:main', '0.1.0.3']);
  });

  test('a restore puts a caret in a virtualized row back exactly', async () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 200 }, (_, index) =>
        paragraph(`row ${index}`)
      ),
    });
    const views = new Map<string, RootView>();
    const VirtualView = ({ name }: { name: string }) => {
      views.set(name, useRootEditor());

      return (
        <VirtualizedEditable
          aria-label={`${name} editor`}
          estimatedBlockSize={32}
        />
      );
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <View name="A" register={views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <VirtualView name="B" />
        </EditorRoot>
      </>
    );
    const a = views.get('A')!;
    const b = views.get('B')!;

    await place(b, 2, [150, 0]);
    await place(a, 1);
    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });

    expect(caret(b)).toBe('150.0.2');
  });

  test('closing a section while the view composes leaves its caret where it is', async () => {
    const editor = createEditor({ initialValue: sectionValue() });
    const registry = createRegistry();
    const closers = new Map<string, () => void>();

    render(
      <EditorRoot editor={editor}>
        <ClosableSectionView
          closers={closers}
          name="A"
          register={registry.views}
        />
      </EditorRoot>
    );
    const a = registry.views.get('A')!;

    await act(async () => {
      screen.getByLabelText('A editor').focus();
    });
    await place(a, 3, [0, 1, 0]);
    await act(async () => {
      fireEvent.compositionStart(screen.getByLabelText('A editor'));
      closers.get('A')!();
      await wait();
    });

    expect(caret(a)).toBe('0.1.0.3');
  });

  test('deleting a selection that runs into a collapsed section removes its hidden body', async () => {
    const editor = createEditor({
      initialValue: [paragraph('Visible beta'), ...sectionValue().slice(0, 1)],
    });
    const registry = createRegistry();

    render(
      <EditorRoot editor={editor}>
        <SectionView closed name="B" register={registry.views} />
      </EditorRoot>
    );
    const b = registry.views.get('B')!;

    await act(async () => {
      screen.getByLabelText('B editor').focus();
      await wait();
    });
    await act(async () => {
      b.update((tx) =>
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 1, 0], offset: 12 },
        })
      );
      await wait();
    });
    await act(async () => {
      fireEvent(
        screen.getByLabelText('B editor'),
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'deleteContentBackward',
        })
      );
      await wait();
    });

    expect(editor.read.text.string([])).toBe('');
  });

  test('a view unmounted during its restore leaves the other view its own caret', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();
    let showB!: (show: boolean) => void;
    const Harness = () => {
      const [show, setShow] = useState(true);
      showB = setShow;

      return (
        <>
          <EditorRoot editor={editor}>
            <View name="A" register={registry.views} />
          </EditorRoot>
          {show ? (
            <EditorRoot editor={editor}>
              <View name="B" register={registry.views} />
            </EditorRoot>
          ) : null}
        </>
      );
    };

    render(<Harness />);
    const a = registry.views.get('A')!;

    await place(a, 1);
    await place(registry.views.get('B')!, 8);
    await act(async () => {
      fireEvent.mouseDown(screen.getByText('B chrome'));
      showB(false);
      await nextFrame();
      await wait(100);
    });
    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });

    expect([
      registry.owner(a),
      caret(a),
      document.activeElement === screen.getByLabelText('A editor'),
    ]).toEqual(['A:main', '0.0.1', true]);
  });

  test('a restore under StrictMode makes one placement', async () => {
    const registry = createRegistry();
    const editor = createViewsEditor();

    render(
      <StrictMode>
        <EditorRoot editor={editor}>
          <View name="A" register={registry.views} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <View name="B" register={registry.views} />
        </EditorRoot>
      </StrictMode>
    );
    const a = registry.views.get('A')!;
    let commits = 0;

    await place(a, 1);
    await place(registry.views.get('B')!, 8);
    const stop = subscribeSource(editor, 'commit', () => {
      commits += 1;
    });

    await act(async () => {
      screen.getByLabelText('A editor').focus();
      await wait();
    });
    stop();

    expect([commits, registry.owner(a), caret(a)]).toEqual([
      1,
      'A:main',
      '0.0.1',
    ]);
  });
});
