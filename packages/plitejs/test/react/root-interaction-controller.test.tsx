import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import type { Descendant } from 'plitejs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { createEditor, Editable, Plite } from '../../src/react';
import {
  applyDragAutoScrollFrame,
  canScrollY,
  getDragAutoScrollTarget,
  type RootInteractionEditor,
  useRootInteractionController,
} from '../../src/react/editable/root-interaction-controller';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const rect = ({
  bottom = 20,
  left,
  right,
  top = 0,
}: {
  bottom?: number;
  left: number;
  right: number;
  top?: number;
}) =>
  ({
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const rangeDescriptor = Object.getOwnPropertyDescriptor(
  Range.prototype,
  'getClientRects'
);

const createMouseCaptureEvent = ({
  altKey = false,
  clientX,
  clientY,
  ctrlKey = false,
  currentTarget,
  detail = 1,
  metaKey = false,
  shiftKey = false,
  target,
}: {
  altKey?: boolean;
  clientX: number;
  clientY: number;
  ctrlKey?: boolean;
  currentTarget: HTMLElement;
  detail?: number;
  metaKey?: boolean;
  shiftKey?: boolean;
  target: Element;
}) =>
  ({
    altKey,
    buttons: 1,
    clientX,
    clientY,
    ctrlKey,
    currentTarget,
    defaultPrevented: false,
    detail,
    metaKey,
    nativeEvent: {},
    preventDefault: vi.fn(),
    shiftKey,
    target,
  }) as unknown as React.MouseEvent<HTMLElement>;

afterEach(() => {
  if (rangeDescriptor) {
    Object.defineProperty(Range.prototype, 'getClientRects', rangeDescriptor);
  } else {
    delete (Range.prototype as Partial<Range>).getClientRects;
  }
});

describe('root interaction controller', () => {
  const createScrollableElement = () => {
    const scroller = document.createElement('div');

    scroller.style.overflowY = 'auto';
    scroller.getBoundingClientRect = () =>
      rect({ bottom: 100, left: 0, right: 100, top: 0 });
    Object.defineProperties(scroller, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 200 },
    });

    return scroller;
  };

  test('does not treat hidden vertical overflow as drag autoscrollable', () => {
    const scroller = document.createElement('div');

    scroller.style.overflowX = 'auto';
    scroller.style.overflowY = 'hidden';
    Object.defineProperties(scroller, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 200 },
    });

    expect(canScrollY(scroller)).toBe(false);

    scroller.style.overflowY = 'auto';

    expect(canScrollY(scroller)).toBe(true);
  });

  test('resolves drag autoscroll ranges inside the scrollport edge', () => {
    const scroller = createScrollableElement();
    const target = getDragAutoScrollTarget({
      clientX: 50,
      clientY: 130,
      rootElement: scroller,
    });

    expect(target?.clientX).toBe(50);
    expect(target?.clientY).toBe(99);
    expect(target?.scroll()).toBe(true);
    expect(scroller.scrollTop).toBeGreaterThan(0);
  });

  test('stops drag autoscroll when the scrolled frame cannot resolve a range', () => {
    const scroller = createScrollableElement();
    const previousElementFromPoint = document.elementFromPoint;
    const resolveEventRange = vi.fn(() => null);
    const startRange = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };

    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => scroller),
    });

    const continued = applyDragAutoScrollFrame({
      animationFrame: null,
      clientX: 50,
      clientY: 130,
      currentRange: startRange,
      editor: {
        api: {
          dom: {
            hasDOMNode: vi.fn(() => true),
            resolveEventRange,
          },
        },
      } as unknown as RootInteractionEditor,
      releaseCleanup: null,
      root: 'main',
      rootElement: scroller,
      startRange,
    });

    if (previousElementFromPoint) {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: previousElementFromPoint,
      });
    } else {
      delete (document as Partial<Document>).elementFromPoint;
    }

    expect(continued).toBe(false);
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(resolveEventRange).toHaveBeenCalledWith(
      expect.objectContaining({
        clientX: 50,
        clientY: 99,
      })
    );
  });

  test('ignores stale downward drag autoscroll ranges that would reverse selection', () => {
    const scroller = createScrollableElement();
    const previousElementFromPoint = document.elementFromPoint;
    const staleRange = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };
    const startRange = {
      kind: 'text',
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    const currentRange = {
      kind: 'text',
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 10, path: [4, 0] },
    };
    const update = vi.fn();

    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => scroller),
    });

    const continued = applyDragAutoScrollFrame({
      animationFrame: null,
      clientX: 50,
      clientY: 130,
      currentRange,
      editor: {
        api: {
          dom: {
            hasDOMNode: vi.fn(() => true),
            resolveEventRange: vi.fn(() => staleRange),
          },
        },
        update,
      } as unknown as RootInteractionEditor,
      releaseCleanup: null,
      root: 'main',
      rootElement: scroller,
      startRange,
    });

    if (previousElementFromPoint) {
      Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: previousElementFromPoint,
      });
    } else {
      delete (document as Partial<Document>).elementFromPoint;
    }

    expect(continued).toBe(true);
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(update).not.toHaveBeenCalled();
  });

  test('prevents native fallback on focused blank editable-root clicks', async () => {
    const editor = createEditor({
      initialValue: { children: [paragraph('body')] },
    });

    render(
      <Plite editor={editor}>
        <Editable
          aria-label="Main editor"
          domStrategy={{ layout: {}, type: 'virtualized' }}
        />
      </Plite>
    );

    const editable = screen.getByLabelText('Main editor');

    await act(async () => {
      editable.focus();
    });

    expect(document.activeElement).toBe(editable);
    expect(fireEvent.mouseDown(editable)).toBe(false);
  });

  test('preserves model selection when capture owns a blank native-editable mousedown', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('first'), paragraph('second')],
      },
    });
    const onMouseDown = vi.fn();

    render(
      <Plite editor={editor}>
        <Editable
          aria-label="Main editor"
          ignoreBlankEditableRootClicks
          onMouseDown={onMouseDown}
        />
      </Plite>
    );

    const editable = screen.getByLabelText('Main editor');
    const blocks = editable.querySelectorAll<HTMLElement>(
      '[data-plite-node="element"]'
    );
    const strings = editable.querySelectorAll<HTMLElement>(
      '[data-plite-string]'
    );

    expect(blocks).toHaveLength(2);
    expect(strings).toHaveLength(2);

    Object.defineProperty(editable, 'getBoundingClientRect', {
      configurable: true,
      value: () => rect({ bottom: 120, left: 0, right: 240, top: 0 }),
    });
    Object.defineProperty(strings[0], 'getClientRects', {
      configurable: true,
      value: () => [rect({ bottom: 60, left: 20, right: 80, top: 40 })],
    });
    Object.defineProperty(strings[1], 'getClientRects', {
      configurable: true,
      value: () => [rect({ bottom: 100, left: 20, right: 80, top: 80 })],
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [],
    });

    act(() => {
      editor.update((tx) => {
        tx.selection.set({ path: [1, 0], offset: 0 });
      });
    });

    const dispatched = fireEvent.mouseDown(blocks[1], {
      clientX: 4,
      clientY: 4,
    });

    expect(dispatched).toBe(false);
    expect(onMouseDown).toHaveBeenCalledOnce();
    expect(onMouseDown.mock.calls[0][0].defaultPrevented).toBe(true);
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  test('owns focused native-editable coordinate placements in DOM strategy layout mode', async () => {
    const editor = createEditor({
      initialValue: { children: [paragraph('body')] },
    });

    render(
      <Plite editor={editor}>
        <Editable
          aria-label="Main editor"
          domStrategy={{ layout: {}, type: 'virtualized' }}
        />
      </Plite>
    );

    const editable = screen.getByLabelText('Main editor');
    const string = editable.querySelector<HTMLElement>('[data-plite-string]');

    expect(string).toBeTruthy();

    Object.defineProperty(string!, 'getClientRects', {
      configurable: true,
      value: () => [rect({ left: 10, right: 80 })],
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [rect({ left: 10, right: 30 })],
    });

    await act(async () => {
      editable.focus();
    });

    expect(document.activeElement).toBe(editable);
    expect(fireEvent.mouseDown(string!, { clientX: 8, clientY: 10 })).toBe(
      false
    );
  });

  test('leaves modified native text clicks browser-owned in layout mode', () => {
    const editable = document.createElement('div');
    const block = document.createElement('div');
    const textHost = document.createElement('span');
    const string = document.createElement('span');
    const update = vi.fn();
    const resolveEventRange = vi.fn(() => ({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    }));

    editable.dataset.pliteEditor = 'true';
    editable.dataset.pliteRoot = 'main';
    block.dataset.pliteNode = 'element';
    textHost.dataset.pliteNode = 'text';
    textHost.setAttribute('data-plite-path', '0,0');
    string.dataset.pliteString = 'true';
    string.textContent = 'body';
    textHost.append(string);
    block.append(textHost);
    editable.append(block);
    document.body.append(editable);

    const editor = {
      api: {
        dom: {
          assertDOMNode: () => editable,
          focus: vi.fn(),
          resolveDOMNode: () => editable,
          resolveEventRange,
        },
      },
      read: (reader: (state: unknown) => unknown) =>
        reader({
          nodes: {
            get: () => [{ text: 'body' }],
            hasPath: () => true,
          },
          points: {
            end: () => ({ path: [0, 0], offset: 4 }),
          },
          schema: {
            getElementSpec: () => null,
          },
          selection: {
            get: () => null,
          },
          value: {
            get: () => ({ children: [paragraph('body')] }),
          },
        }),
      update,
    };

    const { result, unmount } = renderHook(() =>
      useRootInteractionController({
        disabled: false,
        editor: editor as never,
        getLastSelectionForRoot: () => null,
        getMountedViewEditor: () => editor as never,
        ignoreBlankEditableRootClicks: true,
        root: 'main',
        selection: 'restore',
      })
    );
    const mouseDown = createMouseCaptureEvent({
      clientX: 20,
      clientY: 10,
      currentTarget: editable,
      shiftKey: true,
      target: string,
    });

    act(() => {
      result.current.onMouseDownCapture(mouseDown);
    });

    expect(mouseDown.preventDefault).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    unmount();
    editable.remove();
  });

  test('ignores layout root chrome descendants that only resolve through root-edge placement', () => {
    const editable = document.createElement('div');
    const block = document.createElement('div');
    const chrome = document.createElement('div');
    const textHost = document.createElement('span');
    const string = document.createElement('span');
    const update = vi.fn();

    editable.dataset.pliteEditor = 'true';
    editable.dataset.pliteRoot = 'main';
    block.dataset.pliteNode = 'element';
    textHost.dataset.pliteNode = 'text';
    textHost.setAttribute('data-plite-path', '0,0');
    string.dataset.pliteString = 'true';
    string.textContent = 'body';
    textHost.append(string);
    block.append(textHost);
    editable.append(chrome, block);
    document.body.append(editable);

    Object.defineProperty(editable, 'getBoundingClientRect', {
      configurable: true,
      value: () => rect({ bottom: 120, left: 0, right: 240, top: 0 }),
    });
    Object.defineProperty(string, 'getClientRects', {
      configurable: true,
      value: () => [rect({ bottom: 60, left: 20, right: 80, top: 40 })],
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [],
    });

    const editor = {
      api: {
        dom: {
          assertDOMNode: () => editable,
          focus: vi.fn(),
          resolveDOMNode: () => editable,
          resolveEventRange: vi.fn(() => null),
        },
      },
      read: (reader: (state: unknown) => unknown) =>
        reader({
          nodes: {
            get: () => [{ text: 'body' }],
            hasPath: () => true,
          },
          points: {
            end: () => ({ path: [0, 0], offset: 4 }),
          },
          schema: {
            getElementSpec: () => null,
          },
          selection: {
            get: () => null,
          },
          value: {
            get: () => ({ children: [paragraph('body')] }),
          },
        }),
      update,
    };

    const { result, unmount } = renderHook(() =>
      useRootInteractionController({
        disabled: false,
        editor: editor as never,
        getLastSelectionForRoot: () => null,
        getMountedViewEditor: () => editor as never,
        ignoreBlankEditableRootClicks: true,
        root: 'main',
        selection: 'restore',
      })
    );
    const mouseDown = createMouseCaptureEvent({
      clientX: 4,
      clientY: 4,
      currentTarget: editable,
      target: chrome,
    });

    act(() => {
      result.current.onMouseDownCapture(mouseDown);
      result.current.onMouseUpCapture(
        createMouseCaptureEvent({
          clientX: 4,
          clientY: 4,
          currentTarget: editable,
          target: chrome,
        })
      );
    });

    expect(mouseDown.preventDefault).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    update.mockClear();

    const editableMouseDown = createMouseCaptureEvent({
      clientX: 4,
      clientY: 4,
      currentTarget: editable,
      target: editable,
    });

    act(() => {
      result.current.onMouseDownCapture(editableMouseDown);
      result.current.onMouseUpCapture(
        createMouseCaptureEvent({
          clientX: 4,
          clientY: 4,
          currentTarget: editable,
          target: editable,
        })
      );
    });

    expect(editableMouseDown.preventDefault).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    update.mockClear();

    const nativeEditableMouseDown = createMouseCaptureEvent({
      clientX: 4,
      clientY: 4,
      currentTarget: editable,
      target: block,
    });

    act(() => {
      result.current.onMouseDownCapture(nativeEditableMouseDown);
      result.current.onMouseUpCapture(
        createMouseCaptureEvent({
          clientX: 4,
          clientY: 4,
          currentTarget: editable,
          target: block,
        })
      );
    });

    expect(nativeEditableMouseDown.preventDefault).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    unmount();
    editable.remove();
  });

  test('leaves native double-click word selection to the browser in DOM strategy layout mode', async () => {
    const editor = createEditor({
      initialValue: { children: [paragraph('body')] },
    });

    render(
      <Plite editor={editor}>
        <Editable
          aria-label="Main editor"
          domStrategy={{ layout: {}, type: 'virtualized' }}
        />
      </Plite>
    );

    const editable = screen.getByLabelText('Main editor');
    const string = editable.querySelector<HTMLElement>('[data-plite-string]');

    expect(string).toBeTruthy();

    Object.defineProperty(string!, 'getClientRects', {
      configurable: true,
      value: () => [rect({ left: 10, right: 80 })],
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [rect({ left: 10, right: 30 })],
    });

    await act(async () => {
      editable.focus();
    });

    expect(document.activeElement).toBe(editable);
    expect(
      fireEvent.mouseDown(string!, { clientX: 8, clientY: 10, detail: 2 })
    ).toBe(true);
  });
});
