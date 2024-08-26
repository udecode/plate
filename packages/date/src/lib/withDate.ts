import {
  type ExtendEditor,
  type TElement,
  isSelectionExpanded,
} from '@udecode/plate-common';

import { isPointNextToNode } from './queries';

export const withDate: ExtendEditor = ({ editor, type }) => {
  const { isSelectable, move } = editor;

  editor.isSelectable = (element) => {
    return (element as TElement).type !== type && isSelectable(element);
  };

  // check if cursor is next to a date node. if it is set the unit:'offset'
  // Default left/right behavior is unit:'character'.
  // This fails to distinguish between two cursor positions, such as
  // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
  // Here we modify the behavior to unit:'offset'.
  // This lets the user step into and out of the inline without stepping over characters.
  // You may wish to customize this further to only use unit:'offset' in specific cases.
  editor.move = (options) => {
    const { distance = 1, reverse = false, unit = 'character' } = options || {};

    if (
      unit === 'character' &&
      distance === 1 &&
      editor.selection &&
      !isSelectionExpanded(editor)
    ) {
      const isNextDate = isPointNextToNode(editor, {
        nodeType: type,
        reverse,
      });

      if (isNextDate)
        return move({
          ...options,
          unit: 'offset',
        });
    }

    return move(options);
  };

  return editor;
};
