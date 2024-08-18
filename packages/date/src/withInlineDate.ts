import {
  type PlateEditor,
  type TElement,
  type Value,
  isSelectionExpanded,
} from '@udecode/plate-common/server';

import { ELEMENT_INLINE_DATE } from './createInlineDatePlugin';
import { isPointNextToNode } from './utils';

export const withInlineDate = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
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
    const { distance = 1, reverse = false, unit = 'character' } = options || {};

    if (
      unit === 'character' &&
      distance === 1 &&
      editor.selection &&
      !isSelectionExpanded(editor)
    ) {
      const isNextDate = isPointNextToNode(editor, ELEMENT_INLINE_DATE, {
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
