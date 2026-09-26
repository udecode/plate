import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { getEditorRuntimeOwner, TextApi } from 'plitejs';
import type { DOMRange } from 'plitejs/dom';
import { createRef, StrictMode, useLayoutEffect } from 'react';

import { replace as editorReplace, setEditorFocused } from '../../src/internal';
import {
  createEditor,
  Editable,
  type EditableProps,
  EditorRoot,
  useEditorContext,
} from '../../src/react';
import { defaultScrollSelectionIntoView } from '../../src/react/components/editable';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import {
  createPliteInactiveSelectionStore,
  registerPliteInactiveSelectionFocus,
  setPliteInactiveSelectionVisible,
} from '../../src/react/inactive-selection';

describe('plite-react editable behavior', () => {
  test('renders initial editor children into the editable DOM', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable />
      </EditorRoot>
    );

    expect(rendered.container.querySelector('[data-editor]')).toHaveTextContent(
      'test'
    );
  });

  test('forwards ref to the editable DOM root', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const editableRef = createRef<HTMLDivElement>();

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable ref={editableRef} />
      </EditorRoot>
    );

    const editable = rendered.container.querySelector('[data-editor]');

    expect(editableRef.current).toBe(editable);
    expect(editableRef.current).toHaveAttribute('contenteditable', 'true');
  });

  test('commits autoFocus before the first native key targets the previous surface', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const editableRef = createRef<HTMLDivElement>();
    let focusOwnerBeforePassiveEffects: Element | null = null;
    let selectionOwnerBeforePassiveEffects: Node | null = null;

    function FirstKeyProbe() {
      useLayoutEffect(() => {
        focusOwnerBeforePassiveEffects = document.activeElement;
        selectionOwnerBeforePassiveEffects =
          window.getSelection()?.anchorNode ?? null;
      }, []);

      return null;
    }

    render(
      <EditorRoot editor={editor}>
        <Editable ref={editableRef} autoFocus />
        <FirstKeyProbe />
      </EditorRoot>
    );

    expect(document.activeElement).toBe(editableRef.current);
    expect(focusOwnerBeforePassiveEffects).toBe(editableRef.current);
    expect(
      editableRef.current?.contains(selectionOwnerBeforePassiveEffects)
    ).toBe(true);
  });

  test('runs autoFocus once per mount across read-only transitions and remounts', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const firstEditor = createEditor({ initialValue });
    const readOnlyEditor = createEditor({ initialValue });
    const remountedEditor = createEditor({ initialValue });
    const firstRef = createRef<HTMLDivElement>();
    const readOnlyRef = createRef<HTMLDivElement>();
    const remountedRef = createRef<HTMLDivElement>();
    const rendered = render(
      <EditorRoot editor={firstEditor}>
        <Editable ref={firstRef} autoFocus />
      </EditorRoot>
    );

    expect(document.activeElement).toBe(firstRef.current);
    act(() => {
      firstEditor.update((tx) => tx.selection.set(null));
      window.getSelection()?.removeAllRanges();
    });
    expect(firstEditor.read.selection()).toBeNull();
    expect(() =>
      rendered.rerender(
        <EditorRoot editor={firstEditor} readOnly>
          <Editable ref={firstRef} autoFocus />
        </EditorRoot>
      )
    ).not.toThrow();

    expect(() =>
      rendered.rerender(
        <EditorRoot key="read-only" editor={readOnlyEditor} readOnly>
          <Editable ref={readOnlyRef} autoFocus />
        </EditorRoot>
      )
    ).not.toThrow();
    expect(document.activeElement).toBe(readOnlyRef.current);
    expect(readOnlyEditor.read.selection()).toBeNull();

    rendered.rerender(
      <EditorRoot key="remounted" editor={remountedEditor}>
        <Editable ref={remountedRef} autoFocus />
      </EditorRoot>
    );

    expect(document.activeElement).toBe(remountedRef.current);
    expect(
      remountedRef.current?.contains(window.getSelection()?.anchorNode ?? null)
    ).toBe(true);
  });

  test('keeps an emptied paragraph mounted while navigating neighboring blocks', async () => {
    const editor = createEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'Before' }] },
        { type: 'block', children: [{ text: 'Remove me' }] },
        { type: 'block', children: [{ text: 'After' }] },
      ],
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable />
      </EditorRoot>
    );
    const editable = rendered.container.querySelector<HTMLElement>(
      '[data-editor="true"]'
    );
    const text = rendered.container.querySelectorAll<HTMLElement>(
      '[data-editor-string]'
    )[1]?.firstChild;

    expect(editable).toBeTruthy();
    expect(text).toBeTruthy();
    Object.defineProperty(editable!, 'isContentEditable', {
      configurable: true,
      value: true,
    });
    const readDOMPoint = () => {
      const selection = document.getSelection();
      const anchorNode = selection?.anchorNode ?? null;
      const anchorElement =
        anchorNode?.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as Element)
          : anchorNode?.parentElement;

      return {
        offset: selection?.anchorOffset,
        path: anchorElement
          ?.closest('[data-editor-path]')
          ?.getAttribute('data-editor-path'),
        text: anchorNode?.textContent,
      };
    };

    act(() => {
      editable!.focus();
      document.getSelection()?.setBaseAndExtent(text!, 9, text!, 9);
      document.dispatchEvent(new Event('selectionchange'));
    });
    await waitFor(() => {
      expect(editor.read.selection()).toEqual({
        anchor: { path: [1, 0], offset: 9 },
        focus: { path: [1, 0], offset: 9 },
      });
    });
    act(() => {
      for (let index = 0; index < 9; index++) {
        fireEvent.keyDown(editable!, { key: 'Backspace' });
      }
    });

    expect(editor.read.value().children[1]).toEqual({
      type: 'block',
      children: [{ text: '' }],
    });
    await waitFor(() => {
      expect(
        rendered.container.querySelector(
          '[data-editor-path="1,0"] [data-editor-zero-width]'
        )
      ).not.toBeNull();
    });

    await act(async () => {
      fireEvent.keyDown(editable!, { key: 'ArrowRight' });
    });
    expect(editor.read.selection()).toEqual({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
    expect(readDOMPoint()).toEqual({ offset: 0, path: '2,0', text: 'After' });

    await act(async () => {
      fireEvent.keyDown(editable!, { key: 'ArrowRight' });
    });
    expect(editor.read.selection()).toEqual({
      anchor: { path: [2, 0], offset: 1 },
      focus: { path: [2, 0], offset: 1 },
    });
    expect(readDOMPoint()).toEqual({ offset: 1, path: '2,0', text: 'After' });

    act(() => {
      editor.update((tx) => {
        tx.text.insert('Restored', { at: { path: [1, 0], offset: 0 } });
      });
    });
    await waitFor(() => {
      expect(
        rendered.container.querySelector('[data-editor-path="1,0"]')
      ).toHaveTextContent('Restored');
    });
    expect(
      rendered.container.querySelector(
        '[data-editor-path="1,0"] [data-editor-zero-width]'
      )
    ).toBeNull();
  });

  test('applies visible root defaults as CSS', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable />
      </EditorRoot>
    );

    const editable = rendered.container.querySelector('[data-editor]');

    expect(editable).toBeInstanceOf(HTMLElement);
    expect((editable as HTMLElement).style.position).toBe('relative');
    expect((editable as HTMLElement).style.whiteSpace).toBe('pre-wrap');
    expect((editable as HTMLElement).style.overflowWrap).toBe('break-word');
    expect((editable as HTMLElement).style.zIndex).toBe('0');
    expect(editable).not.toHaveAttribute('zindex');
  });

  test('lets user styles override visible root defaults', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable style={{ zIndex: 2 }} />
      </EditorRoot>
    );

    const editable = rendered.container.querySelector('[data-editor]');

    expect(editable).toBeInstanceOf(HTMLElement);
    expect((editable as HTMLElement).style.zIndex).toBe('2');
  });

  test('keeps disableDefaultStyles as the root style opt-out', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable disableDefaultStyles />
      </EditorRoot>
    );

    const editable = rendered.container.querySelector('[data-editor]');

    expect(editable).toBeInstanceOf(HTMLElement);
    expect((editable as HTMLElement).style.position).toBe('');
    expect((editable as HTMLElement).style.whiteSpace).toBe('');
    expect((editable as HTMLElement).style.overflowWrap).toBe('');
    expect((editable as HTMLElement).style.zIndex).toBe('');
  });

  test('waits for a marked control to receive focus before showing an inactive selection', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <div>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
      </div>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: control });
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();

    await act(async () => {
      fireEvent.focusIn(control, { relatedTarget: editable });
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toHaveTextContent('es');
  });

  test('does not paint an inactive selection while the editor remains focused', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    let mountedEditor!: ReturnType<typeof useEditorContext>;
    const CaptureEditor = () => {
      mountedEditor = useEditorContext();

      return null;
    };
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Editable />
          <CaptureEditor />
        </EditorRoot>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
      </>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: control });
      setEditorFocused(mountedEditor, true);
      fireEvent.focusIn(control, { relatedTarget: editable });
    });

    expect(mountedEditor.read.view.isFocused()).toBe(true);
    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();
  });

  test('shows an expanded selection while focus is in a marked control', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <div data-editor-keep-selection-visible>
          <button type="button">Keep selection</button>
        </div>
      </>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();

    await act(async () => {
      fireEvent.blur(editable, { relatedTarget: control });
      fireEvent.focusIn(control);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toHaveTextContent('es');

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        });
      });
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toHaveTextContent('t');
  });

  test('resolves a marked focus target after a blur with no related target', async () => {
    const editor = createEditor({
      id: 'r0',
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <StrictMode>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
      </StrictMode>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: null });
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();

    await act(async () => {
      fireEvent.focusIn(control);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toHaveTextContent('es');
  });

  test('resolves a marked focus target through an open shadow root', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <div data-testid="shadow-host" />
      </>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const host = rendered.getByTestId('shadow-host');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const control = document.createElement('button');

    control.setAttribute('data-editor-keep-selection-visible', '');
    control.textContent = 'Keep selection';
    shadowRoot.append(control);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: host });
      fireEvent.focusIn(control, { relatedTarget: editable });
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toHaveTextContent('es');
  });

  test('discards an unresolved blur on unmarked focus or window blur', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
        <button type="button">Clear selection</button>
      </>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const keepControl = rendered.getByRole('button', {
      name: 'Keep selection',
    });
    const clearControl = rendered.getByRole('button', {
      name: 'Clear selection',
    });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: null });
      fireEvent.focusIn(clearControl);
      fireEvent.focusIn(keepControl);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();

    await act(async () => {
      fireEvent.focusIn(editable);
      fireEvent.blur(editable, { relatedTarget: null });
      fireEvent.blur(window);
      fireEvent.focusIn(keepControl);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();
  });

  test('clears the inactive selection when focus leaves marked controls', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
        <button type="button">Clear selection</button>
      </>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const keepControl = rendered.getByRole('button', {
      name: 'Keep selection',
    });
    const clearControl = rendered.getByRole('button', {
      name: 'Clear selection',
    });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: keepControl });
      fireEvent.focusIn(keepControl);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).not.toBeNull();

    await act(async () => {
      fireEvent.focusIn(clearControl);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();
  });

  test('clears when focus returns to an Editable inside the marked ancestor', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <div data-editor-keep-selection-visible>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <button type="button">Keep selection</button>
      </div>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: control });
      fireEvent.focusIn(control);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).not.toBeNull();

    await act(async () => {
      fireEvent.focusIn(editable);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();
  });

  test('clears when the browser window loses focus', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Editable />
        </EditorRoot>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
      </>
    );
    const editable = rendered.container.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(editable, { relatedTarget: control });
      fireEvent.focusIn(control);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).not.toBeNull();

    await act(async () => {
      fireEvent.blur(window);
    });

    expect(
      rendered.container.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();
  });

  test.each([
    {
      name: 'nested editable',
      target: 'nested',
      button: 0,
      isPrimary: true,
      visible: false,
    },
    {
      name: 'secondary pointer',
      target: 'nested',
      button: 2,
      isPrimary: true,
      visible: true,
    },
    {
      name: 'non-primary pointer',
      target: 'nested',
      button: 0,
      isPrimary: false,
      visible: true,
    },
    {
      name: 'embedded control',
      target: 'embedded',
      button: 0,
      isPrimary: true,
      visible: true,
    },
    {
      name: 'marked control',
      target: 'marked',
      button: 0,
      isPrimary: true,
      visible: true,
    },
  ])(
    'resolves inactive selection before mousedown for $name',
    ({ target, button, isPrimary, visible }) => {
      const store = createPliteInactiveSelectionStore();
      const unregister = registerPliteInactiveSelectionFocus(document, store);
      const host = document.createElement('div');
      host.innerHTML =
        '<div contenteditable="true"><div contenteditable="false"><button data-target="embedded">Control</button><div contenteditable="true"><span data-target="nested">Nested</span></div></div></div><div data-editor-keep-selection-visible><button data-target="marked">Marked</button></div>';
      document.body.append(host);
      const targetElement = host.querySelector(`[data-target="${target}"]`)!;
      let visibleAtMouseDown: boolean | undefined;
      targetElement.addEventListener('mousedown', () => {
        visibleAtMouseDown = store.getSnapshot();
      });
      try {
        setPliteInactiveSelectionVisible(document, store, true);
        const pointer = new MouseEvent('pointerdown', {
          bubbles: true,
          composed: true,
          button,
        });
        Object.defineProperty(pointer, 'isPrimary', { value: isPrimary });
        targetElement.dispatchEvent(pointer);
        targetElement.dispatchEvent(
          new MouseEvent('mousedown', { bubbles: true, button })
        );
        expect(visibleAtMouseDown).toBe(visible);
      } finally {
        unregister();
        host.remove();
      }
    }
  );

  test('keeps document focus work constant across inactive selection stores', () => {
    const documentAddEventListener = vi.spyOn(document, 'addEventListener');
    const windowAddEventListener = vi.spyOn(window, 'addEventListener');
    const stores = Array.from({ length: 100 }, () =>
      createPliteInactiveSelectionStore()
    );
    const notifications = stores.map(() => 0);
    const unregisterStores: Array<() => void> = [];
    const unsubscribeStores: Array<() => void> = [];

    try {
      stores.forEach((store, index) => {
        unregisterStores.push(
          registerPliteInactiveSelectionFocus(document, store)
        );
        unsubscribeStores.push(
          store.subscribe(() => {
            notifications[index] += 1;
          })
        );
      });

      expect(
        documentAddEventListener.mock.calls.filter(
          ([type]) => type === 'pointerdown'
        )
      ).toHaveLength(1);
      expect(
        documentAddEventListener.mock.calls.filter(
          ([type]) => type === 'focusin'
        )
      ).toHaveLength(1);
      expect(
        documentAddEventListener.mock.calls.filter(
          ([type]) => type === 'focusout'
        )
      ).toHaveLength(1);
      expect(
        windowAddEventListener.mock.calls.filter(([type]) => type === 'blur')
      ).toHaveLength(1);

      setPliteInactiveSelectionVisible(document, stores[25], true);
      setPliteInactiveSelectionVisible(document, stores[75], true);
      fireEvent.blur(window);

      expect(notifications.reduce((total, count) => total + count, 0)).toBe(4);
      expect(notifications.filter((count) => count > 0)).toEqual([2, 2]);
    } finally {
      unsubscribeStores.forEach((unsubscribe) => unsubscribe());
      unregisterStores.reverse().forEach((unregister) => unregister());
      documentAddEventListener.mockRestore();
      windowAddEventListener.mockRestore();
    }
  });

  test('shows a neutral caret for a collapsed inactive selection', async () => {
    const rangePrototype = window.Range.prototype;
    const previousBoundingRect = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getBoundingClientRect'
    );
    const previousClientRects = Object.getOwnPropertyDescriptor(
      rangePrototype,
      'getClientRects'
    );
    const rect = {
      bottom: 58,
      height: 18,
      left: 30,
      right: 31,
      top: 40,
      width: 1,
      x: 30,
      y: 40,
    };

    Object.defineProperties(rangePrototype, {
      getBoundingClientRect: { configurable: true, value: () => rect },
      getClientRects: { configurable: true, value: () => [] },
    });

    try {
      const editor = createEditor({
        initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
      });
      const rendered = render(
        <>
          <EditorRoot editor={editor}>
            <Editable />
          </EditorRoot>
          <button data-editor-keep-selection-visible type="button">
            Keep selection
          </button>
        </>
      );
      const editable = rendered.container.querySelector('[data-editor]')!;
      const control = rendered.getByRole('button', {
        name: 'Keep selection',
      });

      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({ offset: 2, path: [0, 0] });
        });
        fireEvent.blur(editable, { relatedTarget: control });
        fireEvent.focusIn(control);
      });

      await waitFor(() =>
        expect(
          rendered.container.querySelector(
            '[data-editor-inactive-selection-caret]'
          )
        ).toBeTruthy()
      );
      const caret = rendered.container.querySelector<HTMLElement>(
        '[data-editor-inactive-selection-caret]'
      )!;

      expect(caret).toHaveAttribute('aria-hidden', 'true');
      expect(caret).toHaveStyle({ left: '30px', top: '40px' });
      expect(
        rendered.container.querySelector('[data-editor-inactive-selection]')
      ).toBeNull();
    } finally {
      if (previousBoundingRect) {
        Object.defineProperty(
          rangePrototype,
          'getBoundingClientRect',
          previousBoundingRect
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getBoundingClientRect');
      }
      if (previousClientRects) {
        Object.defineProperty(
          rangePrototype,
          'getClientRects',
          previousClientRects
        );
      } else {
        Reflect.deleteProperty(rangePrototype, 'getClientRects');
      }
    }
  });

  test('paints only the exact Editable that yielded focus', async () => {
    const firstEditor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'first' }] }],
    });
    const secondEditor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'second' }] }],
    });
    const rendered = render(
      <>
        <div data-testid="first-editor">
          <EditorRoot editor={firstEditor}>
            <Editable />
          </EditorRoot>
        </div>
        <div data-testid="second-editor">
          <EditorRoot editor={secondEditor}>
            <Editable />
          </EditorRoot>
        </div>
        <button data-editor-keep-selection-visible type="button">
          Keep selection
        </button>
      </>
    );
    const firstRoot = rendered.getByTestId('first-editor');
    const secondRoot = rendered.getByTestId('second-editor');
    const firstEditable = firstRoot.querySelector('[data-editor]')!;
    const control = rendered.getByRole('button', { name: 'Keep selection' });

    await act(async () => {
      firstEditor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      secondEditor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
      });
      fireEvent.blur(firstEditable, { relatedTarget: control });
      fireEvent.focusIn(control);
    });

    expect(
      firstRoot.querySelector('[data-editor-inactive-selection]')
    ).toHaveTextContent('fir');
    expect(
      secondRoot.querySelector('[data-editor-inactive-selection]')
    ).toBeNull();
  });

  test('calls onCommit and onSelectionChange when editor selection changes', async () => {
    const initialValue = [
      { type: 'block', children: [{ text: 'te' }] },
      { type: 'block', children: [{ text: 'st' }] },
    ];
    const editor = createEditor({ initialValue });
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <EditorRoot
          editor={editor}
          onCommit={onCommit}
          onSelectionChange={onSelectionChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </EditorRoot>
      );
    });
    const mountedEditor = findMountedEditableDOMRuntime(
      rendered.container.querySelector('[data-editor]')!
    )!.editor;

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

    expect(onCommit).toHaveBeenCalledWith(
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

  test('calls onCommit and onValueChange when editor children change', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <EditorRoot
          editor={editor}
          onCommit={onCommit}
          onSelectionChange={onSelectionChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </EditorRoot>
      );
    });
    const mountedEditor = findMountedEditableDOMRuntime(
      rendered.container.querySelector('[data-editor]')!
    )!.editor;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('Hello word!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    const expectedValue = [
      { type: 'block', children: [{ text: 'testHello word!' }] },
    ];

    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: mountedEditor,
        snapshot: expect.objectContaining({ children: expectedValue }),
      })
    );
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ editor: mountedEditor, value: expectedValue })
    );
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  test('calls value callbacks when setNodes changes text shape', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const onCommit = vi.fn();
    const onValueChange = vi.fn();

    act(() => {
      render(
        <EditorRoot
          editor={editor}
          onCommit={onCommit}
          onValueChange={onValueChange}
        >
          <Editable />
        </EditorRoot>
      );
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.set(
          { bold: true },
          {
            at: { path: [0, 0], offset: 2 },
            match: TextApi.isText,
            split: true,
          }
        );
      });
    });

    expect(onCommit).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalled();
  });

  test('Editable onKeyDown receives editor context for UI hotkeys', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const onCommit = vi.fn();
    const onKeyDown = vi.fn<NonNullable<EditableProps['onKeyDown']>>(
      (event, context) => {
        if (event.key !== 'x') {
          return undefined;
        }

        context.editor.update((tx) => {
          tx.text.insert('x', { at: { path: [0, 0], offset: 4 } });
        });

        return true;
      }
    );

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <EditorRoot editor={editor} onCommit={onCommit}>
          <Editable onKeyDown={onKeyDown} />
        </EditorRoot>
      );
    });

    const editable = rendered.container.querySelector('[data-editor]');
    expect(editable).toBeTruthy();
    const mountedEditor = findMountedEditableDOMRuntime(editable!)!.editor;
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    await act(async () => {
      fireEvent.keyDown(editable!, { key: 'x' });
    });

    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'x' }),
      { editor: mountedEditor }
    );
    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: mountedEditor,
        snapshot: expect.objectContaining({
          children: [{ type: 'block', children: [{ text: 'testx' }] }],
        }),
      })
    );
  });

  test('Editable onDOMBeforeInput exposes raw native format input', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const onDOMBeforeInput = vi.fn((event, context) => {
      if (event.inputType !== 'formatBold') {
        return undefined;
      }

      expect(getEditorRuntimeOwner(context.editor)).toBe(editor);
      expect(context.inputType).toBe('formatBold');
      expect(context.native).toBe(false);
      return true;
    });

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <EditorRoot editor={editor}>
          <Editable onDOMBeforeInput={onDOMBeforeInput} />
        </EditorRoot>
      );
    });

    const editable = rendered.container.querySelector('[data-editor]');
    expect(editable).toBeTruthy();
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    const event = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'formatBold',
    });

    await act(async () => {
      editable!.dispatchEvent(event);
    });

    expect(onDOMBeforeInput).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  test('Editable onBeforeInput is not replayed from native beforeinput', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const onBeforeInput = vi.fn();
    const onDOMBeforeInput = vi.fn();

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <EditorRoot editor={editor}>
          <Editable
            onBeforeInput={onBeforeInput}
            onDOMBeforeInput={onDOMBeforeInput}
          />
        </EditorRoot>
      );
    });

    const editable = rendered.container.querySelector('[data-editor]');
    expect(editable).toBeTruthy();
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    await act(async () => {
      editable!.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'formatBold',
        })
      );
    });

    expect(onDOMBeforeInput).toHaveBeenCalledTimes(1);
    expect(onBeforeInput).not.toHaveBeenCalled();
  });

  test('default scroll restores leaf measurement after scrolling a collapsed range', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'test' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const leaf = document.createElement('span');
    const text = document.createTextNode('test');
    leaf.append(text);
    document.body.append(leaf);

    const range = {
      cloneRange: () => ({
        collapse: () => {},
        getBoundingClientRect: () =>
          ({
            bottom: 1,
            height: 1,
            left: 1,
            right: 1,
            top: 1,
            width: 1,
            x: 1,
            y: 1,
          }) as DOMRect,
        startContainer: text,
      }),
    } as unknown as DOMRange;

    try {
      defaultScrollSelectionIntoView(editor, range);

      expect(Object.hasOwn(leaf, 'getBoundingClientRect')).toBe(false);
      expect(typeof leaf.getBoundingClientRect).toBe('function');

      defaultScrollSelectionIntoView(editor, range);

      expect(Object.hasOwn(leaf, 'getBoundingClientRect')).toBe(false);
      expect(typeof leaf.getBoundingClientRect).toBe('function');
    } finally {
      leaf.remove();
    }
  });

  test('default scroll keeps the caret below a scroll container top inset', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'test' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    const outer = document.createElement('div');
    outer.style.overflow = 'auto';
    outer.style.scrollPaddingTop = '40px';
    outer.scrollTop = 50;

    Object.defineProperties(outer, {
      clientHeight: { configurable: true, value: 100 },
      clientWidth: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 100 },
    });
    Object.defineProperty(outer, 'getBoundingClientRect', {
      configurable: true,
      value: () =>
        ({
          bottom: 100,
          height: 100,
          left: 0,
          right: 100,
          top: 0,
          width: 100,
          x: 0,
          y: 0,
        }) as DOMRect,
    });

    const leaf = document.createElement('span');
    const text = document.createTextNode('test');
    leaf.append(text);
    outer.append(leaf);
    document.body.append(outer);

    const range = {
      cloneRange: () => ({
        collapse: () => {},
        getBoundingClientRect: () =>
          ({
            bottom: 40,
            height: 20,
            left: 1,
            right: 2,
            top: 20,
            width: 1,
            x: 1,
            y: 20,
          }) as DOMRect,
        startContainer: text,
      }),
    } as unknown as DOMRange;

    try {
      defaultScrollSelectionIntoView(editor, range);

      expect(outer.scrollTop).toBe(26);
    } finally {
      outer.remove();
    }
  });

  test('default scroll crosses a shadow root to reach an outer scroll container', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'test' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const outer = document.createElement('div');
    outer.style.overflow = 'auto';

    Object.defineProperties(outer, {
      clientHeight: { configurable: true, value: 100 },
      clientWidth: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 100 },
    });
    Object.defineProperty(outer, 'getBoundingClientRect', {
      configurable: true,
      value: () =>
        ({
          bottom: 100,
          height: 100,
          left: 0,
          right: 100,
          top: 0,
          width: 100,
          x: 0,
          y: 0,
        }) as DOMRect,
    });

    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const leaf = document.createElement('span');
    const text = document.createTextNode('test');
    leaf.append(text);
    shadowRoot.append(leaf);
    outer.append(host);
    document.body.append(outer);

    const range = {
      cloneRange: () => ({
        collapse: () => {},
        getBoundingClientRect: () =>
          ({
            bottom: 160,
            height: 20,
            left: 1,
            right: 2,
            top: 140,
            width: 1,
            x: 1,
            y: 140,
          }) as DOMRect,
        startContainer: text,
      }),
    } as unknown as DOMRange;

    try {
      defaultScrollSelectionIntoView(editor, range);

      expect(outer.scrollTop).toBeGreaterThan(0);
    } finally {
      outer.remove();
    }
  });
});
