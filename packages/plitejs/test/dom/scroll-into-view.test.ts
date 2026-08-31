import { afterAll, afterEach, beforeAll, expect, mock, test } from 'bun:test';

import type { Point } from 'plitejs';

import type { DOMRange } from '../../src/dom';
import type {
  DOMEditor as DOMEditorType,
  DOMPhaseScheduler,
} from '../../src/dom/internal';

const scrollIntoViewIfNeeded = mock();

mock.module('scroll-into-view-if-needed', () => ({
  default: scrollIntoViewIfNeeded,
}));

const {
  DOMEditor,
  EDITOR_TO_DOM_SCROLL,
  EDITOR_TO_ELEMENT,
  installEditorDOMPhaseScheduler,
} = await import('../../src/dom/internal');

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalResolveDOMNode = DOMEditor.resolveDOMNode;
const originalResolveDOMRange = DOMEditor.resolveDOMRange;

const createDOMRange = () => {
  const leafRect = {
    bottom: 9,
    height: 9,
    left: 0,
    right: 9,
    top: 0,
    width: 9,
  };
  const leafElement = {
    getBoundingClientRect: mock(() => leafRect),
  };
  const rangeRect = {
    bottom: 1,
    height: 1,
    left: 0,
    right: 1,
    top: 0,
    width: 1,
  };
  const domRange = {
    getBoundingClientRect: mock(() => rangeRect),
    startContainer: { parentElement: leafElement },
  } as unknown as DOMRange;

  return { domRange, leafElement, leafRect, rangeRect };
};

beforeAll(() => {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0);

    return 1;
  };
});

afterEach(() => {
  DOMEditor.resolveDOMNode = originalResolveDOMNode;
  DOMEditor.resolveDOMRange = originalResolveDOMRange;
  scrollIntoViewIfNeeded.mockClear();
});

afterAll(() => {
  globalThis.requestAnimationFrame = originalRequestAnimationFrame;
});

test('scrollIntoView converts a Plite point target into a DOM range', () => {
  const { domRange, leafElement, leafRect } = createDOMRange();
  const point: Point = { offset: 2, path: [0, 0] };
  const options = { block: 'nearest', scrollMode: 'if-needed' } as const;

  DOMEditor.resolveDOMRange = mock(() => domRange);

  DOMEditor.scrollIntoView({} as DOMEditorType, point, options);

  expect(DOMEditor.resolveDOMRange).toHaveBeenCalledWith(
    {},
    { anchor: point, focus: point }
  );
  expect(scrollIntoViewIfNeeded).toHaveBeenCalledWith(leafElement, options);
  expect(leafElement.getBoundingClientRect()).toBe(leafRect);
});

test('scrollIntoView resolves a Plite path to its mounted DOM node', () => {
  const element = {} as HTMLElement;
  const editor = {
    read: (read: (state: unknown) => unknown) =>
      read({ nodes: { get: () => [{}, [1]] } }),
  } as unknown as DOMEditorType;

  DOMEditor.resolveDOMNode = mock(() => element);

  DOMEditor.scrollIntoView(editor, [1]);

  expect(DOMEditor.resolveDOMNode).toHaveBeenCalledWith(editor, {});
  expect(scrollIntoViewIfNeeded).toHaveBeenCalledWith(element, {
    scrollMode: 'if-needed',
  });
});

test('scrollIntoView accepts a native DOM range target', () => {
  const { domRange, leafElement, leafRect } = createDOMRange();

  DOMEditor.resolveDOMRange = mock(() => {
    throw new Error('should not resolve an existing DOM range');
  });

  DOMEditor.scrollIntoView({} as DOMEditorType, domRange);

  expect(scrollIntoViewIfNeeded).toHaveBeenCalledWith(leafElement, {
    scrollMode: 'if-needed',
  });
  expect(leafElement.getBoundingClientRect()).toBe(leafRect);
});

test('scrollIntoView returns early when the target cannot be mounted', () => {
  DOMEditor.resolveDOMRange = mock(() => null);

  DOMEditor.scrollIntoView({} as DOMEditorType, { offset: 0, path: [0, 0] });

  expect(scrollIntoViewIfNeeded).not.toHaveBeenCalled();
});

test('scrollIntoView delays only explicit navigation past selection repair', () => {
  const root = document.createElement('div');
  const editor = {} as DOMEditorType;
  const scheduledCallbacks: Array<() => void> = [];
  const schedule = mock(
    (_phase: unknown, _label: unknown, callback: () => void) => {
      scheduledCallbacks.push(callback);

      return () => {};
    }
  );
  const scheduler: DOMPhaseScheduler = {
    destroy: () => {},
    diagnostics: () => ({
      flushes: 0,
      lastFlushPhases: [],
      loopLimitHits: 0,
      loopRestarts: 0,
      maxObservedPasses: 0,
    }),
    flush: () => {},
    pending: () => 0,
    schedule,
  };

  EDITOR_TO_ELEMENT.set(editor, root);
  const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);

  DOMEditor.scrollIntoView(editor, { offset: 0, path: [0, 0] });

  expect(schedule).toHaveBeenCalledTimes(1);
  expect(schedule.mock.calls[0]?.[0]).toBe('dom-write');
  expect(schedule.mock.calls[0]?.[1]).toBe('dom-editor-scroll-into-view');

  schedule.mockClear();
  scheduledCallbacks.length = 0;
  DOMEditor.scrollIntoView(
    editor,
    { offset: 0, path: [0, 0] },
    { scrollMode: 'always' }
  );

  expect(schedule).toHaveBeenCalledTimes(1);
  expect(schedule.mock.calls[0]?.[0]).toBe('post-selection');
  expect(schedule.mock.calls[0]?.[1]).toBe(
    'dom-editor-scroll-into-view-settle'
  );
  expect(schedule.mock.calls[0]?.[3]).toEqual({
    key: 'dom-editor-scroll-into-view',
    timing: 'animation-frame',
  });

  scheduledCallbacks[0]?.();
  expect(schedule).toHaveBeenCalledTimes(2);
  expect(schedule.mock.calls[1]?.[0]).toBe('post-selection');
  expect(schedule.mock.calls[1]?.[1]).toBe('dom-editor-scroll-into-view');

  uninstall();
  EDITOR_TO_ELEMENT.delete(editor);
});

test('scrollIntoView preserves requested path margins across a rerender', () => {
  const root = document.createElement('div');
  const element = document.createElement('h2');
  const editor = {
    read: (read: (state: unknown) => unknown) =>
      read({ nodes: { get: () => [{}, [1]] } }),
  } as unknown as DOMEditorType;
  const scheduledCallbacks: Array<() => void> = [];
  const scheduler: DOMPhaseScheduler = {
    destroy: () => {},
    diagnostics: () => ({
      flushes: 0,
      lastFlushPhases: [],
      loopLimitHits: 0,
      loopRestarts: 0,
      maxObservedPasses: 0,
    }),
    flush: () => {},
    pending: () => 0,
    schedule: (_phase, _label, callback) => {
      scheduledCallbacks.push(callback);

      return () => {};
    },
  };
  const scroll = mock();

  element.style.scrollMarginTop = '80px';
  element.getBoundingClientRect = mock(() => ({ top: 220 }) as DOMRect);
  root.getBoundingClientRect = mock(() => ({ top: 20 }) as DOMRect);
  Object.defineProperties(root, {
    scrollLeft: { configurable: true, value: 0 },
    scrollTop: { configurable: true, value: 100 },
  });
  root.scroll = scroll;
  DOMEditor.resolveDOMNode = mock(() => element);
  EDITOR_TO_DOM_SCROLL.set(editor, root);
  EDITOR_TO_ELEMENT.set(editor, root);
  const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);

  DOMEditor.scrollIntoView(editor, [1], {
    block: 'start',
    scrollMode: 'always',
  });
  element.style.scrollMarginTop = '';
  scheduledCallbacks[0]?.();
  scheduledCallbacks[1]?.();

  expect(scroll).toHaveBeenCalledWith({
    behavior: 'auto',
    left: 0,
    top: 220,
  });
  expect(scrollIntoViewIfNeeded).not.toHaveBeenCalled();
  expect(element.style.scrollMarginTop).toBe('');

  uninstall();
  EDITOR_TO_DOM_SCROLL.delete(editor);
  EDITOR_TO_ELEMENT.delete(editor);
});
