import {
  type TElement,
  createPluginFactory,
  getNodeEntry,
  getRange,
  isEndPoint,
  isSelectionExpanded,
  isStartPoint,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

export const ELEMENT_INLINE_DATE = 'inline_date';

export const createInlineDatePlugin = createPluginFactory({
  handlers: {},
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_DATE,
  withOverrides: (editor) => {
    const { isSelectable, move } = editor;

    editor.isSelectable = (element) => {
      return (
        (element as TElement).type !== ELEMENT_INLINE_DATE &&
        isSelectable(element)
      );
    };

    // check if cursor is next to a date node. if it is set the unit:'offset'
    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    editor.move = (options) => {
      const {
        distance = 1,
        reverse = false,
        unit = 'character',
      } = options || {};

      if (
        unit === 'character' &&
        distance === 1 &&
        editor.selection &&
        !isSelectionExpanded(editor)
      ) {
        const point = editor.selection.anchor;
        const selectedRange = getRange(editor, point.path);

        const boundary = (() => {
          let isStart = false;
          let isEnd = false;

          if (isStartPoint(editor, point, selectedRange)) {
            isStart = true;
          }
          if (isEndPoint(editor, point, selectedRange)) {
            isEnd = true;
          }
          if (isStart && isEnd) {
            return 'single';
          }
          if (isStart) {
            return 'start';
          }
          if (isEnd) {
            return 'end';
          }

          return null;
        })();

        if (!boundary) return move(options);

        const adjacentPathFn = (path: Path) => {
          try {
            if (reverse && boundary === 'start') return Path.previous(path);
            if (!reverse && boundary === 'end') return Path.next(path);
            if (boundary === 'single') {
              return reverse ? Path.previous(path) : Path.next(path);
            }
          } catch (error) {
            return null;
          }
        };

        if (!adjacentPathFn) return move(options);

        const adjacentPath = adjacentPathFn(point.path);

        if (!adjacentPath) return move(options);

        const nextNodeEntry = getNodeEntry(editor, adjacentPath) ?? null;

        if (nextNodeEntry && nextNodeEntry[0].type === ELEMENT_INLINE_DATE) {
          return move({
            unit: 'offset',
            ...options,
          });
        }
      }

      return move(options);
    };

    return editor;
  },
});
