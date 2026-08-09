import { JSDOM } from 'jsdom';

import { createDOMGeometryKernel } from '../src/plugin/dom-geometry';

const rect = (
  _window: Window,
  {
    left = 0,
    right = left + 10,
    top = 0,
    bottom = top + 10,
  }: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  } = {}
) => {
  const values = {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
  const prototype = Object.create(null) as Record<string, unknown>;

  Object.entries(values).forEach(([key, value]) => {
    Object.defineProperty(prototype, key, {
      configurable: true,
      get: () => value,
    });
  });

  return Object.create(prototype) as DOMRect;
};

const setClientRects = (element: Element, rects: DOMRect[]) => {
  Object.defineProperty(element, 'getClientRects', {
    configurable: true,
    value: () => rects,
  });
};

const setBoundingRect = (element: Element, value: DOMRect) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => value,
  });
};

const createTextHost = (
  document: Document,
  text: string,
  direction: 'ltr' | 'rtl' = 'ltr'
) => {
  const host = document.createElement('span');
  const string = document.createElement('span');

  host.dataset.pliteNode = 'text';
  host.style.direction = direction;
  string.dataset.pliteString = 'true';
  string.textContent = text;
  host.append(string);

  return { host, string, text: string.firstChild as Text };
};

describe('Plite DOM geometry kernel', () => {
  test('scopes coordinate placement to one editable root and target', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const nestedRoot = document.createElement('div');
    const outer = createTextHost(document, 'outer');
    const nested = createTextHost(document, 'nested');

    root.dataset.pliteEditor = 'true';
    nestedRoot.dataset.pliteEditor = 'true';
    setBoundingRect(root, rect(dom.window, { bottom: 160, right: 300 }));
    setClientRects(outer.string, [
      rect(dom.window, { left: 20, right: 80, top: 100 }),
    ]);
    setClientRects(nested.string, [
      rect(dom.window, { left: 20, right: 80, top: 10 }),
    ]);
    nestedRoot.append(nested.host);
    root.append(nestedRoot, outer.host);
    document.body.append(root);

    const geometry = createDOMGeometryKernel({ root });

    expect(geometry.coordinatePlacement({ x: 10, y: 15 })?.string).toBe(
      outer.string
    );
    expect(geometry.coordinatePlacement({ x: 10, y: 105 })?.string).toBe(
      outer.string
    );
    expect(
      createDOMGeometryKernel({
        root,
        target: outer.string,
      }).coordinatePlacement({ includeInsideString: true, x: 20, y: 105 })
        ?.string
    ).toBe(outer.string);

    const nestedRange = document.createRange();

    nestedRange.setStart(nested.text, 2);
    nestedRange.collapse(true);
    Object.defineProperty(document, 'caretRangeFromPoint', {
      configurable: true,
      value: () => nestedRange,
    });

    expect(geometry.pointAtCoordinates({ x: 20, y: 105 })?.point[0]).toBe(
      outer.text
    );
    expect(geometry.visualLines(nestedRange)).toEqual([]);
    expect(
      geometry.pointInVisualLine({
        host: nested.host,
        line: rect(dom.window, { left: 20, right: 80, top: 10 }),
        x: 30,
      })
    ).toBeNull();

    dom.window.close();
  });

  test('scopes coordinate placement inside a void to its own spacer', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const firstVoid = document.createElement('div');
    const secondVoid = document.createElement('div');
    const secondVoidContent = document.createElement('img');
    const firstSpacer = createTextHost(document, '');
    const secondSpacer = createTextHost(document, '');

    root.dataset.pliteEditor = 'true';
    firstVoid.dataset.pliteNode = 'element';
    firstVoid.dataset.pliteVoid = 'true';
    secondVoid.dataset.pliteNode = 'element';
    secondVoid.dataset.pliteVoid = 'true';
    firstSpacer.string.dataset.pliteZeroWidth = 'n';
    secondSpacer.string.dataset.pliteZeroWidth = 'n';
    setBoundingRect(root, rect(dom.window, { bottom: 160, right: 300 }));
    setClientRects(firstSpacer.string, [
      rect(dom.window, { bottom: 80, left: 20, right: 20, top: 70 }),
    ]);
    setClientRects(secondSpacer.string, [
      rect(dom.window, { bottom: 110, left: 20, right: 20, top: 100 }),
    ]);
    firstVoid.append(firstSpacer.host);
    secondVoid.append(secondVoidContent, secondSpacer.host);
    root.append(firstVoid, secondVoid);
    document.body.append(root);

    expect(
      createDOMGeometryKernel({
        root,
        target: secondVoidContent,
      }).coordinatePlacement({ includeInsideString: true, x: 20, y: 82 })
        ?.string
    ).toBe(secondSpacer.string);

    dom.window.close();
  });

  test('uses the browser caret before measured fallback', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const rendered = createTextHost(document, 'alpha');
    const nativeRange = document.createRange();

    root.dataset.pliteEditor = 'true';
    root.append(rendered.host);
    document.body.append(root);
    nativeRange.setStart(rendered.text, 3);
    nativeRange.collapse(true);
    Object.defineProperty(document, 'caretRangeFromPoint', {
      configurable: true,
      value: () => nativeRange,
    });

    expect(
      createDOMGeometryKernel({ root }).pointAtCoordinates({ x: 999, y: 999 })
        ?.point
    ).toEqual([rendered.text, 3]);

    dom.window.close();
  });

  test('keeps measured coordinate fallback on grapheme boundaries', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const value = `A${'👨‍👩‍👧‍👦'}B`;
    const rendered = createTextHost(document, value);
    const familyStart = 1;
    const familyEnd = value.length - 1;

    root.dataset.pliteEditor = 'true';
    setBoundingRect(root, rect(dom.window, { bottom: 40, right: 200 }));
    setClientRects(rendered.string, [
      rect(dom.window, { bottom: 20, left: 0, right: 120 }),
    ]);
    Object.defineProperty(dom.window.Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.collapsed) return [];
        if (this.startOffset === 0) {
          return [rect(dom.window, { left: 0, right: 20 })];
        }
        if (this.startOffset === familyStart && this.endOffset === familyEnd) {
          return [rect(dom.window, { left: 20, right: 100 })];
        }

        return [rect(dom.window, { left: 100, right: 120 })];
      },
    });
    root.append(rendered.host);
    document.body.append(root);

    const result = createDOMGeometryKernel({ root }).pointAtCoordinates({
      x: 70,
      y: 10,
    });

    expect(result?.point[0]).toBe(rendered.text);
    expect([familyStart, familyEnd]).toContain(result?.point[1]);

    dom.window.close();
  });

  test('uses association to choose the adjacent measured caret fallback', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const rendered = createTextHost(document, 'ab');

    root.dataset.pliteEditor = 'true';
    root.append(rendered.host);
    document.body.append(root);
    Object.defineProperty(dom.window.Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.collapsed) return [];

        return this.startOffset === 0
          ? [rect(dom.window, { left: 0, right: 10 })]
          : [rect(dom.window, { left: 30, right: 40 })];
      },
    });

    const geometry = createDOMGeometryKernel({ root });
    const backward = geometry.pointRect([rendered.text, 1], {
      association: 'backward',
    });
    const forward = geometry.pointRect([rendered.text, 1], {
      association: 'forward',
    });

    expect(backward).toMatchObject({ left: 10, right: 10, width: 0 });
    expect(forward).toMatchObject({ left: 30, right: 30, width: 0 });

    dom.window.close();
  });

  test('groups visual lines and trusts native caret placement within a line', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const block = document.createElement('div');
    const siblingBlock = document.createElement('div');
    const rendered = createTextHost(document, 'wrapped text');
    const sibling = createTextHost(document, 'sibling');
    const nativeRange = document.createRange();

    root.dataset.pliteEditor = 'true';
    block.append(rendered.host);
    siblingBlock.append(sibling.host);
    root.append(block, siblingBlock);
    document.body.append(root);
    setClientRects(rendered.string, [
      rect(dom.window, { bottom: 20, left: 0, right: 80, top: 10 }),
      rect(dom.window, { bottom: 22, left: 90, right: 120, top: 12 }),
      rect(dom.window, { bottom: 50, left: 0, right: 70, top: 40 }),
    ]);
    setClientRects(sibling.string, [
      rect(dom.window, { bottom: 80, left: 0, right: 70, top: 70 }),
    ]);
    nativeRange.setStart(rendered.text, 4);
    nativeRange.collapse(true);
    Object.defineProperty(document, 'caretRangeFromPoint', {
      configurable: true,
      value: () => nativeRange,
    });

    const geometry = createDOMGeometryKernel({ root });
    const lines = geometry.visualLines(block);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ left: 0, right: 120, top: 10 });
    expect(
      geometry.pointInVisualLine({
        host: rendered.host,
        line: lines[1]!,
        x: 40,
      })
    ).toEqual([rendered.text, 4]);

    dom.window.close();
  });

  test('quantizes measured fallback x like native CSS-pixel hit-testing', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    const root = document.createElement('div');
    const rendered = createTextHost(document, 'a');

    root.dataset.pliteEditor = 'true';
    root.append(rendered.host);
    document.body.append(root);
    Object.defineProperty(document, 'caretRangeFromPoint', {
      configurable: true,
      value: () => null,
    });
    Object.defineProperty(dom.window.Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        return this.collapsed ? [] : [rect(dom.window, { left: 0, right: 10 })];
      },
    });

    expect(
      createDOMGeometryKernel({ root }).pointInVisualLine({
        host: rendered.host,
        line: rect(dom.window, { left: 0, right: 10 }),
        x: 4.9,
      })
    ).toEqual([rendered.text, 0]);

    dom.window.close();
  });
});
