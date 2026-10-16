import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { createEditor } from 'plitejs';

import { dom } from '../../src/dom';
import { EDITOR_TO_ELEMENT } from '../../src/dom/internal';
import {
  getDragAutoScrollTarget,
  getVisibleRect,
} from '../../src/dom/plugin/dom-drag-scroll';

const VIEWPORT = { height: 600, width: 800 };

type Box = { bottom: number; left?: number; right?: number; top: number };

const cleanups: Array<() => void> = [];

const define = (target: object, values: Record<string, unknown>) => {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(target, key),
    ])
  );

  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(target, key, { configurable: true, value });
  }
  cleanups.push(() => {
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(target, key, descriptor);
      else delete (target as Record<string, unknown>)[key];
    }
  });
};

const place = (
  element: HTMLElement,
  { bottom, left = 0, right = 400, top }: Box,
  scrollHeight = bottom - top
) => {
  const clientHeight = bottom - top;
  let scrollTop = 0;

  element.getBoundingClientRect = () => ({
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
    toJSON: () => ({}),
  });
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: clientHeight },
    clientLeft: { configurable: true, value: 0 },
    clientTop: { configurable: true, value: 0 },
    clientWidth: { configurable: true, value: right - left },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = Math.min(
          Math.max(0, value),
          Math.max(0, scrollHeight - clientHeight)
        );
      },
    },
  });

  return element;
};

const box = (
  style: Partial<CSSStyleDeclaration>,
  geometry: Box,
  scrollHeight?: number
) => {
  const element = document.createElement('div');

  Object.assign(element.style, style);

  return place(element, geometry, scrollHeight);
};

const nest = (...elements: HTMLElement[]) => {
  for (let index = 1; index < elements.length; index++) {
    elements[index - 1].append(elements[index]);
  }
  document.body.append(elements[0]);
  cleanups.push(() => elements[0].remove());

  return elements.at(-1)!;
};

const scrollWindow = (scrollHeight: number) => {
  const scrollingElement =
    document.scrollingElement ?? document.documentElement;
  let scrollTop = 0;

  const previousScrollTop = Object.getOwnPropertyDescriptor(
    scrollingElement,
    'scrollTop'
  );

  define(scrollingElement, {
    clientHeight: VIEWPORT.height,
    scrollHeight,
  });
  Object.defineProperty(scrollingElement, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
  });
  cleanups.push(() => {
    if (previousScrollTop) {
      Object.defineProperty(scrollingElement, 'scrollTop', previousScrollTop);
    } else {
      delete (scrollingElement as Partial<Element>).scrollTop;
    }
  });
  define(window, {
    scrollBy: (_x: number, y: number) => {
      scrollTop = Math.min(
        Math.max(0, scrollTop + y),
        scrollHeight - VIEWPORT.height
      );
    },
  });

  return () => scrollTop;
};

beforeEach(() => {
  define(document.documentElement, {
    clientHeight: VIEWPORT.height,
    clientWidth: VIEWPORT.width,
  });
  scrollWindow(VIEWPORT.height);
});

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()!();
});

describe('drag auto-scroll target', () => {
  test('does not treat hidden vertical overflow as scrollable', () => {
    const scroller = nest(
      box(
        { overflowX: 'auto', overflowY: 'hidden' },
        { bottom: 100, top: 0 },
        200
      )
    );

    const pointer = { clientX: 50, clientY: 90, rootElement: scroller };

    expect(getDragAutoScrollTarget(pointer)).toBeNull();

    scroller.style.overflowY = 'auto';

    expect(getDragAutoScrollTarget(pointer)).not.toBeNull();
  });

  test('scrolls inside the visible edge and returns the pixels moved', () => {
    const scroller = nest(
      box({ overflowY: 'auto' }, { bottom: 100, top: 0 }, 200)
    );
    const target = getDragAutoScrollTarget({
      clientX: 50,
      clientY: 130,
      rootElement: scroller,
    });

    expect(target?.clientX).toBe(50);
    expect(target?.clientY).toBe(99);

    const moved = target?.scroll() ?? 0;

    expect(moved).toBeGreaterThan(0);
    expect(scroller.scrollTop).toBe(moved);
  });

  test('scrolls a scroller taller than the viewport first, then the window at its end', () => {
    const windowScrollTop = scrollWindow(2000);
    const scroller = nest(
      box({ overflowY: 'auto' }, { bottom: 1100, top: 100 }, 2000)
    );
    const scroll = () =>
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: VIEWPORT.height - 4,
        rootElement: scroller,
      })?.scroll() ?? 0;

    expect(scroll()).toBeGreaterThan(0);
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(windowScrollTop()).toBe(0);

    scroller.scrollTop = 1000;

    expect(scroll()).toBeGreaterThan(0);
    expect(windowScrollTop()).toBeGreaterThan(0);
  });

  test('scrolls an inner scroller that an exhausted outer scroller cuts off', () => {
    const outer = box({ overflowY: 'auto' }, { bottom: 500, top: 0 }, 1000);
    const inner = box({ overflowY: 'auto' }, { bottom: 900, top: 100 }, 1600);

    outer.scrollTop = 500;
    nest(outer, inner);

    expect(
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: 498,
        rootElement: inner,
      })?.scroll()
    ).toBeGreaterThan(0);
    expect(inner.scrollTop).toBeGreaterThan(0);
    expect(outer.scrollTop).toBe(500);
  });

  test('ignores a collapsed body with hidden overflow', () => {
    define(document.body, {
      getBoundingClientRect: () =>
        ({ bottom: 0, left: 0, right: 0, top: 0 }) as DOMRect,
    });
    const { overflowX, overflowY } = document.body.style;

    Object.assign(document.body.style, {
      overflowX: 'hidden',
      overflowY: 'hidden',
    });
    cleanups.push(() => {
      Object.assign(document.body.style, { overflowX, overflowY });
    });

    const scroller = nest(
      box({ overflowY: 'auto' }, { bottom: 300, top: 0 }, 600)
    );

    expect(
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: 290,
        rootElement: scroller,
      })?.scroll()
    ).toBeGreaterThan(0);
  });

  test('cuts a fixed panel only to the viewport', () => {
    const clip = box(
      { overflowX: 'hidden', overflowY: 'hidden' },
      { bottom: 100, top: 0 }
    );
    const panel = box(
      { overflowY: 'auto', position: 'fixed' },
      { bottom: 500, top: 200 },
      900
    );

    nest(clip, panel);

    expect(
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: 490,
        rootElement: panel,
      })?.scroll()
    ).toBeGreaterThan(0);
  });

  test('scrolls down near the bottom of a strip shorter than two edge zones', () => {
    const scroller = nest(
      box({ overflowY: 'auto' }, { bottom: 40, top: 0 }, 400)
    );

    scroller.scrollTop = 100;

    expect(
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: 38,
        rootElement: scroller,
      })?.delta
    ).toBeGreaterThan(0);
    expect(
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: 2,
        rootElement: scroller,
      })?.delta
    ).toBeLessThan(0);
    expect(
      getDragAutoScrollTarget({
        clientX: 50,
        clientY: 20,
        rootElement: scroller,
      })
    ).toBeNull();
  });
});

describe('visible rect', () => {
  test('cuts an element to its clipping ancestors and the viewport', () => {
    const element = nest(
      box(
        { overflowX: 'hidden', overflowY: 'hidden' },
        { bottom: 300, top: 100 }
      ),
      box({}, { bottom: 900, left: -20, right: 400, top: 50 })
    );

    expect(getVisibleRect(element)).toEqual({
      bottom: 300,
      height: 200,
      left: 0,
      right: 400,
      top: 100,
      width: 400,
    });
  });

  test('skips static clipping ancestors of an absolute box up to its positioned container', () => {
    const container = box({ position: 'relative' }, { bottom: 600, top: 0 });
    const clip = box(
      { overflowX: 'hidden', overflowY: 'hidden', position: 'static' },
      { bottom: 50, top: 0 }
    );
    const element = box({ position: 'absolute' }, { bottom: 200, top: 0 });

    nest(container, clip, element);

    expect(getVisibleRect(element)?.height).toBe(200);

    element.style.position = 'static';

    expect(getVisibleRect(element)?.height).toBe(50);
  });

  test('cuts a fixed box inside a transformed ancestor to that ancestor and its clipping ancestors', () => {
    const clip = box(
      { overflowX: 'hidden', overflowY: 'hidden' },
      { bottom: 300, top: 100 }
    );
    const container = box(
      { transform: 'translateX(0px)' },
      { bottom: 600, top: 0 }
    );
    const element = box({ position: 'fixed' }, { bottom: 500, top: 0 });

    nest(clip, container, element);

    expect(getVisibleRect(element)?.height).toBe(200);
  });

  test('cuts only the axis an ancestor clips', () => {
    const clip = box(
      { overflowX: 'clip', overflowY: 'visible' },
      { bottom: 100, left: 0, right: 200, top: 0 }
    );
    const element = box({}, { bottom: 300, left: 0, right: 400, top: 0 });

    nest(clip, element);

    expect(getVisibleRect(element)).toMatchObject({ height: 300, width: 200 });
  });

  test('cuts to a scaled ancestor in its scaled size', () => {
    const clip = box(
      { overflowX: 'hidden', overflowY: 'hidden' },
      { bottom: 400, right: 400, top: 0 }
    );
    const element = box({}, { bottom: 500, right: 400, top: 0 });

    define(clip, {
      clientHeight: 200,
      clientWidth: 200,
      offsetHeight: 200,
      offsetWidth: 200,
    });
    nest(clip, element);

    expect(getVisibleRect(element)).toMatchObject({ height: 400, width: 400 });
  });

  test('returns null when nothing is visible', () => {
    const element = nest(box({}, { bottom: 900, top: 700 }));

    expect(getVisibleRect(element)).toBeNull();
  });
});

describe('editor.api.dom.drag.autoScroll', () => {
  test('scrolls around the editor root and returns the pixels moved', () => {
    const editor = createEditor({ plugins: [dom()] });
    const scroller = box({ overflowY: 'auto' }, { bottom: 100, top: 0 }, 200);
    const root = document.createElement('div');

    nest(scroller, root);
    EDITOR_TO_ELEMENT.set(editor, root);
    cleanups.push(() => EDITOR_TO_ELEMENT.delete(editor));

    const moved = editor.api.dom.drag.autoScroll({ x: 50, y: 95 });

    expect(moved).toBeGreaterThan(0);
    expect(scroller.scrollTop).toBe(moved);
    expect(editor.api.dom.drag.autoScroll({ x: 50, y: 50 })).toBe(0);
  });
});
