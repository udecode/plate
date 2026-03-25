import { type TRange, KEYS } from 'platejs';
import { createSlateEditor } from 'platejs';

import { FROZEN_EMPTY_ARRAY } from '../hooks/useCursorOverlay';
import { getCaretPosition } from './getCaretPosition';
import { getCursorOverlayState } from './getCursorOverlayState';
import { getSelectionRects } from './getSelectionRects';

describe('selection cursor overlay queries', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('getCaretPosition', () => {
    const forwardRange: TRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    };

    it('returns null when there is no rect', () => {
      expect(getCaretPosition([], forwardRange)).toBeNull();
    });

    it('uses the end edge for forward expanded ranges', () => {
      expect(
        getCaretPosition(
          [
            { height: 10, left: 5, top: 7, width: 11 },
            { height: 10, left: 40, top: 7, width: 6 },
          ],
          forwardRange
        )
      ).toEqual({
        height: 10,
        left: 46,
        top: 7,
      });
    });

    it('uses the first rect for backward ranges and collapsed ranges', () => {
      const backwardRange: TRange = {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      };
      const collapsedRange: TRange = {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      };

      expect(
        getCaretPosition(
          [{ height: 8, left: 9, top: 4, width: 3 }],
          backwardRange
        )
      ).toEqual({
        height: 8,
        left: 9,
        top: 4,
      });

      expect(
        getCaretPosition(
          [{ height: 8, left: 12, top: 2, width: 1 }],
          collapsedRange
        )
      ).toEqual({
        height: 8,
        left: 12,
        top: 2,
      });
    });
  });

  describe('getCursorOverlayState', () => {
    it('returns an empty array when cursor state is missing', () => {
      expect(
        getCursorOverlayState({
          cursors: undefined as any,
          selectionRects: {},
        })
      ).toEqual([]);
    });

    it('uses frozen empty rects when a cursor has no cached rects', () => {
      const range: TRange = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      };

      const result = getCursorOverlayState({
        cursors: {
          a: {
            data: { userId: 'u1' },
            key: 'a',
            selection: range,
          } as any,
          b: {
            data: { userId: 'u2' },
            key: 'b',
            selection: null,
          } as any,
        },
        selectionRects: {},
      });

      expect(result).toHaveLength(2);
      expect(result[0].selectionRects).toBe(FROZEN_EMPTY_ARRAY);
      expect(result[0].caretPosition).toBeNull();
      expect(result[1].selection).toBeNull();
      expect(result[1].selectionRects).toBe(FROZEN_EMPTY_ARRAY);
    });

    it('computes caret positions from the matching rect bucket', () => {
      const range: TRange = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      };

      expect(
        getCursorOverlayState({
          cursors: {
            a: {
              data: { userId: 'u1' },
              id: 'a',
              selection: range,
            } as any,
          },
          selectionRects: {
            a: [{ height: 12, left: 4, top: 8, width: 9 }],
          },
        })
      ).toEqual([
        {
          caretPosition: { height: 12, left: 13, top: 8 },
          data: { userId: 'u1' },
          id: 'a',
          selection: range,
          selectionRects: [{ height: 12, left: 4, top: 8, width: 9 }],
        },
      ]);
    });
  });

  describe('getSelectionRects', () => {
    it('returns an empty array when the DOM range is missing', () => {
      const editor = createSlateEditor({
        value: [{ children: [{ text: 'one' }], type: KEYS.p }],
      });

      spyOn(editor.api, 'toDOMRange').mockReturnValue(undefined as any);

      expect(
        getSelectionRects(editor, {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
          xOffset: 0,
          yOffset: 0,
        })
      ).toEqual([]);
    });

    it('returns an empty array when a selected text node has no parent element', () => {
      const editor = createSlateEditor({
        value: [{ children: [{ text: 'one' }], type: KEYS.p }],
      });

      const textNode = editor.children[0].children[0];

      spyOn(editor.api, 'toDOMRange').mockReturnValue({
        endContainer: {} as any,
        endOffset: 1,
        startContainer: {} as any,
        startOffset: 0,
      } as any);
      spyOn(editor.api, 'nodes').mockReturnValue([[textNode as any, [0, 0]]]);
      spyOn(editor.api, 'toDOMNode').mockReturnValue({
        getClientRects: () => ({ item: () => null, length: 0 }),
        parentElement: null,
      } as any);

      expect(
        getSelectionRects(editor, {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
          xOffset: 0,
          yOffset: 0,
        })
      ).toEqual([]);
    });

    it('uses partial DOM ranges for start and end nodes and raw client rects for middle nodes', () => {
      const editor = createSlateEditor({
        value: [
          {
            children: [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
            type: KEYS.p,
          },
        ],
      });

      const range: TRange = {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 2] },
      };
      const textEntries = [
        [editor.children[0].children[0] as any, [0, 0]],
        [editor.children[0].children[1] as any, [0, 1]],
        [editor.children[0].children[2] as any, [0, 2]],
      ] as any;
      const domRange = {
        endContainer: { id: 'end' },
        endOffset: 2,
        startContainer: { id: 'start' },
        startOffset: 1,
      } as any;
      const rect = (left: number, top: number, width: number) => ({
        height: 10,
        left,
        top,
        width,
      });

      const startRects = {
        item: (index: number) => (index === 0 ? rect(10, 30, 3) : null),
        length: 1,
      };
      const endRects = {
        item: (index: number) => (index === 0 ? rect(30, 32, 5) : null),
        length: 1,
      };
      const middleRects = {
        item: (index: number) => (index === 0 ? rect(18, 31, 8) : null),
        length: 1,
      };

      const selectNode = mock();
      const setStart = mock();
      const setEnd = mock();

      spyOn(editor.api, 'toDOMRange').mockReturnValue(domRange);
      spyOn(editor.api, 'nodes').mockReturnValue(textEntries);
      spyOn(editor.api, 'toDOMNode')
        .mockReturnValueOnce({
          getClientRects: () => middleRects,
          parentElement: {},
        } as any)
        .mockReturnValueOnce({
          getClientRects: () => middleRects,
          parentElement: {},
        } as any)
        .mockReturnValueOnce({
          getClientRects: () => middleRects,
          parentElement: {},
        } as any);

      const createRangeSpy = spyOn(document, 'createRange');
      createRangeSpy
        .mockReturnValueOnce({
          getClientRects: () => startRects,
          selectNode,
          setEnd,
          setStart,
        } as any)
        .mockReturnValueOnce({
          getClientRects: () => endRects,
          selectNode,
          setEnd,
          setStart,
        } as any);

      const result = getSelectionRects(editor, {
        range,
        xOffset: 5,
        yOffset: 10,
      });

      expect(setStart).toHaveBeenCalledWith(domRange.startContainer, 1);
      expect(setEnd).toHaveBeenCalledWith(domRange.endContainer, 2);
      expect(result).toEqual([
        { height: 10, left: 5, top: 20, width: 3 },
        { height: 10, left: 13, top: 21, width: 8 },
        { height: 10, left: 25, top: 22, width: 5 },
      ]);
    });
  });
});
