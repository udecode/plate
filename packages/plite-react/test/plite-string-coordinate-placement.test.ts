import { afterEach, describe, expect, test } from 'vitest';

import {
  getEditableRootPliteStringCoordinatePlacement,
  getPliteStringCoordinatePlacement,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
} from '../src/editable/plite-string-coordinate-placement';

const rect = ({
  bottom,
  left,
  right,
  top = 0,
}: {
  bottom?: number;
  left: number;
  right: number;
  top?: number;
}) => {
  const resolvedBottom = bottom ?? top + 20;

  return {
    bottom: resolvedBottom,
    height: resolvedBottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
};

const setClientRects = (element: HTMLElement, rects: DOMRect[]) => {
  Object.defineProperty(element, 'getClientRects', {
    configurable: true,
    value: () => rects,
  });
};

const setBoundingRect = (element: HTMLElement, boundingRect: DOMRect) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => boundingRect,
  });
};

const createTextHost = ({
  direction = 'ltr',
  text,
}: {
  direction?: 'ltr' | 'rtl';
  text: string;
}) => {
  const textHost = document.createElement('span');
  const string = document.createElement('span');

  textHost.dataset.pliteNode = 'text';
  textHost.style.direction = direction;
  string.dataset.pliteString = 'true';
  string.textContent = text;
  textHost.append(string);

  return { string, textHost };
};

const rangeDescriptor = Object.getOwnPropertyDescriptor(
  Range.prototype,
  'getClientRects'
);
const rangeBoundingDescriptor = Object.getOwnPropertyDescriptor(
  Range.prototype,
  'getBoundingClientRect'
);

afterEach(() => {
  document.body.textContent = '';

  if (rangeDescriptor) {
    Object.defineProperty(Range.prototype, 'getClientRects', rangeDescriptor);
  } else {
    delete (Range.prototype as Partial<Range>).getClientRects;
  }

  if (rangeBoundingDescriptor) {
    Object.defineProperty(
      Range.prototype,
      'getBoundingClientRect',
      rangeBoundingDescriptor
    );
  } else {
    delete (Range.prototype as Partial<Range>).getBoundingClientRect;
  }
});

describe('plite string coordinate placement', () => {
  test('ignores strings owned by nested editable roots', () => {
    const editableRoot = document.createElement('div');
    const nestedEditableRoot = document.createElement('div');
    const outerText = createTextHost({ text: 'outer' });
    const nestedText = createTextHost({ text: 'nested' });

    editableRoot.dataset.pliteEditor = 'true';
    nestedEditableRoot.dataset.pliteEditor = 'true';
    setClientRects(outerText.string, [rect({ left: 0, right: 40, top: 120 })]);
    setClientRects(nestedText.string, [rect({ left: 0, right: 60, top: 0 })]);

    nestedEditableRoot.append(nestedText.textHost);
    editableRoot.append(nestedEditableRoot, outerText.textHost);
    document.body.append(editableRoot);

    expect(
      getEditableRootPliteStringCoordinatePlacement({
        editableRoot,
        event: { clientX: 70, clientY: 8 } as MouseEvent,
      })
    ).toBeNull();

    expect(
      getEditableRootPliteStringCoordinatePlacement({
        editableRoot,
        event: { clientX: 50, clientY: 128 } as MouseEvent,
      })?.string
    ).toBe(outerText.string);
  });

  test('scopes inside-string placement to the hit text host', () => {
    const editableRoot = document.createElement('div');
    const leftText = createTextHost({ text: 'left' });
    const rightText = createTextHost({ text: 'right' });

    editableRoot.dataset.pliteEditor = 'true';
    setClientRects(leftText.string, [rect({ left: 10, right: 50, top: 10 })]);
    setClientRects(rightText.string, [
      rect({ left: 200, right: 250, top: 10 }),
    ]);
    editableRoot.append(leftText.textHost, rightText.textHost);
    document.body.append(editableRoot);

    expect(
      getEditableRootPliteStringCoordinatePlacement({
        editableRoot,
        event: { clientX: 210, clientY: 16 } as MouseEvent,
        includeInsideString: true,
        target: leftText.string,
      })?.string
    ).toBe(leftText.string);
  });

  test('places editable root bottom padding at the root end', () => {
    const editableRoot = document.createElement('div');
    const firstText = createTextHost({ text: 'first line' });
    const lastText = createTextHost({ text: 'last line' });

    editableRoot.dataset.pliteEditor = 'true';
    setBoundingRect(editableRoot, rect({ bottom: 140, left: 0, right: 320 }));
    setClientRects(firstText.string, [rect({ left: 10, right: 80, top: 20 })]);
    setClientRects(lastText.string, [rect({ left: 10, right: 80, top: 60 })]);
    editableRoot.append(firstText.textHost, lastText.textHost);
    document.body.append(editableRoot);

    const placement = getEditableRootPliteStringCoordinatePlacement({
      editableRoot,
      event: { clientX: 300, clientY: 110 } as MouseEvent,
    });

    expect(placement).toMatchObject({
      edge: 'end',
      string: lastText.string,
    });
  });

  test('uses horizontal proximity for root-edge placement across aligned pages', () => {
    const editableRoot = document.createElement('div');
    const leftText = createTextHost({ text: 'left page' });
    const rightText = createTextHost({ text: 'right page' });

    editableRoot.dataset.pliteEditor = 'true';
    setBoundingRect(editableRoot, rect({ bottom: 140, left: 0, right: 400 }));
    setClientRects(leftText.string, [rect({ left: 20, right: 120, top: 40 })]);
    setClientRects(rightText.string, [
      rect({ left: 220, right: 320, top: 40 }),
    ]);
    editableRoot.append(leftText.textHost, rightText.textHost);
    document.body.append(editableRoot);

    expect(
      getEditableRootPliteStringCoordinatePlacement({
        editableRoot,
        event: { clientX: 260, clientY: 20 } as MouseEvent,
      })?.string
    ).toBe(rightText.string);
    expect(
      getEditableRootPliteStringCoordinatePlacement({
        editableRoot,
        event: { clientX: 60, clientY: 100 } as MouseEvent,
      })?.string
    ).toBe(leftText.string);
  });

  test('uses the nearest local edge for page-like interior root gaps', () => {
    const editableRoot = document.createElement('div');
    const firstPageText = createTextHost({ text: 'first page' });
    const secondPageText = createTextHost({ text: 'second page' });
    const thirdPageText = createTextHost({ text: 'third page' });

    editableRoot.dataset.pliteEditor = 'true';
    setBoundingRect(editableRoot, rect({ bottom: 420, left: 0, right: 400 }));
    setClientRects(firstPageText.string, [
      rect({ left: 20, right: 140, top: 40 }),
    ]);
    setClientRects(secondPageText.string, [
      rect({ left: 220, right: 340, top: 220 }),
    ]);
    setClientRects(thirdPageText.string, [
      rect({ left: 20, right: 140, top: 340 }),
    ]);
    editableRoot.append(
      firstPageText.textHost,
      secondPageText.textHost,
      thirdPageText.textHost
    );
    document.body.append(editableRoot);

    expect(
      getEditableRootPliteStringCoordinatePlacement({
        editableRoot,
        event: { clientX: 260, clientY: 180 } as MouseEvent,
      })
    ).toMatchObject({
      edge: 'start',
      string: secondPageText.string,
    });
  });

  test('maps RTL physical line edges to logical text offsets', () => {
    const { string, textHost } = createTextHost({
      direction: 'rtl',
      text: 'אבג',
    });
    const lineRect = rect({ left: 10, right: 110 });
    const characterRects = [
      rect({ left: 80, right: 110 }),
      rect({ left: 50, right: 80 }),
      rect({ left: 10, right: 50 }),
    ];

    setClientRects(string, [lineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    const rightPlacement = getPliteStringCoordinatePlacement({
      event: { clientX: 120, clientY: 10 },
      strings: [string],
    });
    const leftPlacement = getPliteStringCoordinatePlacement({
      event: { clientX: 0, clientY: 10 },
      strings: [string],
    });

    expect(rightPlacement?.edge).toBe('start');
    expect(leftPlacement?.edge).toBe('end');
    expect(
      getPliteStringEdgeOffset({
        edge: rightPlacement!.edge,
        rect: rightPlacement!.rect,
        string,
        textHost,
      })
    ).toBe(0);
    expect(
      getPliteStringEdgeOffset({
        edge: leftPlacement!.edge,
        rect: leftPlacement!.rect,
        string,
        textHost,
      })
    ).toBe(3);
  });

  test('treats near text-edge clicks as line-edge placement', () => {
    const { string } = createTextHost({ text: 'wrapped line' });
    const lineRect = rect({ left: 10, right: 110 });

    setClientRects(string, [lineRect]);

    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 9, clientY: 10 },
        strings: [string],
      })
    ).toMatchObject({
      edge: 'start',
      string,
    });
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 111, clientY: 10 },
        strings: [string],
      })
    ).toMatchObject({
      edge: 'end',
      string,
    });
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 10, clientY: 10 },
        strings: [string],
      })
    ).toMatchObject({
      edge: 'start',
      string,
    });
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 110, clientY: 10 },
        strings: [string],
      })
    ).toMatchObject({
      edge: 'end',
      string,
    });
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 50, clientY: 10 },
        strings: [string],
      })
    ).toBeNull();
  });

  test('prefers the visual line center when overlapping line boxes tie vertically', () => {
    const { string } = createTextHost({ text: 'first second' });
    const firstLineRect = rect({ bottom: 42, left: 10, right: 110, top: 10 });
    const secondLineRect = rect({
      bottom: 60,
      left: 10,
      right: 110,
      top: 28,
    });

    setClientRects(string, [firstLineRect, secondLineRect]);

    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 0, clientY: 36 },
        strings: [string],
      })?.rect
    ).toBe(secondLineRect);
  });

  test('maps overlapping line-box edge offsets to the clicked visual line', () => {
    const { string, textHost } = createTextHost({ text: 'abcdef' });
    const secondLineRect = rect({
      bottom: 60,
      left: 10,
      right: 70,
      top: 28,
    });
    const characterRects = [
      rect({ bottom: 52, left: 10, right: 30, top: 10 }),
      rect({ bottom: 52, left: 30, right: 50, top: 10 }),
      rect({ bottom: 52, left: 50, right: 70, top: 10 }),
      rect({ bottom: 60, left: 10, right: 30, top: 28 }),
      rect({ bottom: 60, left: 30, right: 50, top: 28 }),
      rect({ bottom: 60, left: 50, right: 70, top: 28 }),
    ];

    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'start',
        rect: secondLineRect,
        string,
        textHost,
      })
    ).toBe(3);
  });

  test('keeps line-edge offsets on grapheme boundaries', () => {
    const text = `A${'👨‍👩‍👧‍👦'}`;
    const { string, textHost } = createTextHost({ text });
    const lineRect = rect({ left: 10, right: 110 });
    const letterRect = rect({ left: 10, right: 35 });
    const emojiRect = rect({ left: 35, right: 110 });

    setClientRects(string, [lineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        return this.startOffset === 0 ? [letterRect] : [emojiRect];
      },
    });

    const rightPlacement = getPliteStringCoordinatePlacement({
      event: { clientX: 120, clientY: 10 },
      strings: [string],
    });

    expect(
      getPliteStringEdgeOffset({
        edge: rightPlacement!.edge,
        rect: rightPlacement!.rect,
        string,
        textHost,
      })
    ).toBe(text.length);
  });

  test('places collapsed trailing whitespace right-edge clicks before the wrapped space', () => {
    const { string, textHost } = createTextHost({ text: 'wrap ' });
    const lineRect = rect({ left: 10, right: 90 });
    const wrappedCaretRect = rect({ left: 10, right: 10, top: 24 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 90, right: 90 }),
    ];

    setClientRects(string, [lineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return this.startOffset === 5 ? [wrappedCaretRect] : [];
        }

        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    const rightPlacement = getPliteStringCoordinatePlacement({
      event: { clientX: 120, clientY: 10 },
      strings: [string],
    });

    expect(
      getPliteStringEdgeOffset({
        edge: rightPlacement!.edge,
        rect: rightPlacement!.rect,
        string,
        textHost,
      })
    ).toBe(4);
  });

  test('places right-edge clicks before soft-wrap whitespace when collapsed rects are unavailable', () => {
    const { string, textHost } = createTextHost({ text: 'wrap next' });
    const edgeLineRect = rect({ left: 10, right: 90 });
    const stretchedLineRect = rect({ left: 10, right: 150 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 90, right: 90 }),
      rect({ left: 10, right: 30, top: 24 }),
      rect({ left: 30, right: 50, top: 24 }),
      rect({ left: 50, right: 70, top: 24 }),
      rect({ left: 70, right: 90, top: 24 }),
    ];

    setClientRects(string, [stretchedLineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return [];
        }

        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'end',
        rect: edgeLineRect,
        string,
        textHost,
      })
    ).toBe(4);
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 126, clientY: 10 },
        includeInsideString: true,
        strings: [string],
      })
    ).toMatchObject({
      offset: 4,
      source: 'string-offset',
      string,
    });
  });

  test('places right-edge clicks before soft-wrap whitespace split across strings', () => {
    const textHost = document.createElement('span');
    const firstString = document.createElement('span');
    const secondString = document.createElement('span');
    const firstText = document.createTextNode('wrap ');
    const secondText = document.createTextNode('next');
    const lineRect = rect({ left: 10, right: 90 });
    const firstRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 90, right: 90 }),
    ];
    const secondRect = rect({ left: 10, right: 30, top: 24 });

    textHost.dataset.pliteNode = 'text';
    firstString.dataset.pliteString = 'true';
    secondString.dataset.pliteString = 'true';
    firstString.append(firstText);
    secondString.append(secondText);
    textHost.append(firstString, secondString);
    document.body.append(textHost);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return [];
        }

        return this.startContainer === secondText
          ? [secondRect]
          : [firstRects[this.startOffset] ?? firstRects[0]];
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'end',
        rect: lineRect,
        string: firstString,
        textHost,
      })
    ).toBe(4);
  });

  test('places right-edge clicks before soft-wrap whitespace split across text hosts', () => {
    const element = document.createElement('div');
    const first = createTextHost({ text: 'wrap ' });
    const second = createTextHost({ text: 'next' });
    const firstText = first.string.firstChild;
    const secondText = second.string.firstChild;
    const lineRect = rect({ left: 10, right: 90 });
    const firstRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 90, right: 90 }),
    ];
    const secondRect = rect({ left: 10, right: 30, top: 24 });

    if (!firstText || !secondText) {
      throw new Error('Expected text nodes');
    }

    element.append(first.textHost, second.textHost);
    document.body.append(element);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return [];
        }

        return this.startContainer === secondText
          ? [secondRect]
          : [firstRects[this.startOffset] ?? firstRects[0]];
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'end',
        rect: lineRect,
        string: first.string,
        textHost: first.textHost,
      })
    ).toBe(4);
  });

  test('keeps visible trailing whitespace when the caret stays on the line', () => {
    const { string, textHost } = createTextHost({ text: 'wrap next' });
    const edgeLineRect = rect({ left: 10, right: 90 });
    const stretchedLineRect = rect({ left: 10, right: 150 });
    const visibleCaretRect = rect({ left: 90, right: 90 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 80, right: 90 }),
      rect({ left: 10, right: 30, top: 24 }),
      rect({ left: 30, right: 50, top: 24 }),
      rect({ left: 50, right: 70, top: 24 }),
      rect({ left: 70, right: 90, top: 24 }),
    ];

    setClientRects(string, [stretchedLineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return this.startOffset === 5 ? [visibleCaretRect] : [];
        }

        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'end',
        rect: edgeLineRect,
        string,
        textHost,
      })
    ).toBe(5);
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 126, clientY: 10 },
        includeInsideString: true,
        strings: [string],
      })
    ).toMatchObject({
      offset: 5,
      source: 'string-offset',
      string,
    });
  });

  test('keeps visible trailing whitespace when collapsed caret only has a bounding rect', () => {
    const { string, textHost } = createTextHost({ text: 'wrap next' });
    const edgeLineRect = rect({ left: 10, right: 90 });
    const visibleCaretRect = rect({ left: 90, right: 90 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 80, right: 90 }),
      rect({ left: 10, right: 30, top: 24 }),
      rect({ left: 30, right: 50, top: 24 }),
      rect({ left: 50, right: 70, top: 24 }),
      rect({ left: 70, right: 90, top: 24 }),
    ];

    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return [];
        }

        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value(this: Range) {
        return this.startOffset === this.endOffset && this.startOffset === 5
          ? visibleCaretRect
          : rect({ bottom: 0, left: 0, right: 0 });
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'end',
        rect: edgeLineRect,
        string,
        textHost,
      })
    ).toBe(5);
  });

  test('keeps non-breaking spaces as visible text', () => {
    const { string, textHost } = createTextHost({ text: 'wrap\u00a0' });
    const lineRect = rect({ left: 10, right: 90 });
    const wrappedCaretRect = rect({ left: 10, right: 10, top: 24 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 80, right: 90 }),
    ];

    setClientRects(string, [lineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return this.startOffset === 5 ? [wrappedCaretRect] : [];
        }

        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    expect(
      getPliteStringEdgeOffset({
        edge: 'end',
        rect: lineRect,
        string,
        textHost,
      })
    ).toBe(5);
  });

  test('places stretched-line inside clicks before collapsed trailing whitespace', () => {
    const { string } = createTextHost({ text: 'wrap ' });
    const lineRect = rect({ left: 10, right: 150 });
    const wrappedCaretRect = rect({ left: 10, right: 10, top: 24 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 65 }),
      rect({ left: 65, right: 80 }),
      rect({ left: 80, right: 90 }),
    ];

    setClientRects(string, [lineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        if (this.startOffset === this.endOffset) {
          return this.startOffset === 5 ? [wrappedCaretRect] : [];
        }

        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 126, clientY: 10 },
        includeInsideString: true,
        strings: [string],
      })
    ).toMatchObject({
      offset: 4,
      source: 'string-offset',
      string,
    });
  });

  test('maps split leaf local offsets to document text offsets', () => {
    const textHost = document.createElement('span');
    const firstLeaf = document.createElement('span');
    const secondLeaf = document.createElement('span');
    const firstString = document.createElement('span');
    const secondString = document.createElement('span');

    textHost.dataset.pliteNode = 'text';
    firstLeaf.dataset.pliteLeaf = 'true';
    firstLeaf.setAttribute('data-plite-leaf-start', '0');
    firstLeaf.setAttribute('data-plite-leaf-end', '6');
    firstString.dataset.pliteString = 'true';
    firstString.textContent = 'hello ';
    secondLeaf.dataset.pliteLeaf = 'true';
    secondLeaf.setAttribute('data-plite-leaf-start', '6');
    secondLeaf.setAttribute('data-plite-leaf-end', '11');
    secondString.dataset.pliteString = 'true';
    secondString.textContent = 'world';
    firstLeaf.append(firstString);
    secondLeaf.append(secondString);
    textHost.append(firstLeaf, secondLeaf);

    expect(
      getPliteStringDocumentOffset({
        offset: 2,
        string: secondString,
        textHost,
      })
    ).toBe(8);
  });

  test('maps inside-string clicks to nearest text offsets when requested', () => {
    const { string } = createTextHost({ text: 'abcd' });
    const lineRect = rect({ left: 10, right: 90 });
    const characterRects = [
      rect({ left: 10, right: 30 }),
      rect({ left: 30, right: 50 }),
      rect({ left: 50, right: 70 }),
      rect({ left: 70, right: 90 }),
    ];

    setClientRects(string, [lineRect]);
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        return [characterRects[this.startOffset] ?? characterRects[0]];
      },
    });

    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 66, clientY: 10 },
        includeInsideString: true,
        strings: [string],
      })
    ).toMatchObject({
      offset: 3,
      source: 'string-offset',
      string,
    });
    expect(
      getPliteStringCoordinatePlacement({
        event: { clientX: 50, clientY: 10 },
        strings: [string],
      })
    ).toBeNull();
  });
});
