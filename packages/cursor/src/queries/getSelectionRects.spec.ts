import { getSelectionRects } from './getSelectionRects';

const createRectList = (rects: any[]) => ({
  item: (index: number) => rects[index] ?? null,
  length: rects.length,
});

describe('getSelectionRects', () => {
  const originalCreateRange = document.createRange;

  afterEach(() => {
    document.createRange = originalCreateRange;
  });

  it('returns an empty array when the editor cannot create a DOM range', () => {
    const editor = {
      api: {
        toDOMRange: mock(() => null),
      },
    } as any;

    expect(
      getSelectionRects(editor, {
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        } as any,
        xOffset: 0,
        yOffset: 0,
      })
    ).toEqual([]);
  });

  it('returns an empty array when a DOM text node has no parent element', () => {
    const textNode = { text: 'a' };
    const editor = {
      api: {
        nodes: mock(() => [[textNode, [0, 0]]]),
        toDOMNode: mock(() => ({ parentElement: null })),
        toDOMRange: mock(() => ({
          endContainer: {},
          endOffset: 0,
          startContainer: {},
          startOffset: 0,
        })),
      },
    } as any;

    expect(
      getSelectionRects(editor, {
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        } as any,
        xOffset: 0,
        yOffset: 0,
      })
    ).toEqual([]);
  });

  it('collects start, middle, and end rects with offsets applied', () => {
    const startText = { text: 'a' };
    const middleText = { text: 'b' };
    const endText = { text: 'c' };
    const startDomNode = { parentElement: {}, getClientRects: mock() };
    const middleDomNode = {
      getClientRects: mock(() =>
        createRectList([{ height: 8, left: 30, top: 40, width: 12 }])
      ),
      parentElement: {},
    };
    const endDomNode = { parentElement: {}, getClientRects: mock() };
    const rangeRects = [
      createRectList([{ height: 9, left: 10, top: 20, width: 5 }]),
      createRectList([{ height: 11, left: 50, top: 60, width: 7 }]),
    ];
    let rangeIndex = 0;

    document.createRange = (() => ({
      getClientRects: () => rangeRects[rangeIndex++]!,
      selectNode: mock(() => {}),
      setEnd: mock(() => {}),
      setStart: mock(() => {}),
    })) as unknown as typeof document.createRange;

    const editor = {
      api: {
        nodes: mock(() => [
          [startText, [0, 0]],
          [middleText, [0, 1]],
          [endText, [0, 2]],
        ]),
        toDOMNode: mock((node: any) => {
          if (node === startText) return startDomNode;
          if (node === middleText) return middleDomNode;

          return endDomNode;
        }),
        toDOMRange: mock(() => ({
          endContainer: {},
          endOffset: 1,
          startContainer: {},
          startOffset: 0,
        })),
      },
    } as any;

    expect(
      getSelectionRects(editor, {
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 2] },
        } as any,
        xOffset: 2,
        yOffset: 3,
      })
    ).toEqual([
      { height: 9, left: 8, top: 17, width: 5 },
      { height: 8, left: 28, top: 37, width: 12 },
      { height: 11, left: 48, top: 57, width: 7 },
    ]);
  });
});
