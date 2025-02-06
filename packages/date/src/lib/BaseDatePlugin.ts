import { type TElement, bindFirst, createSlatePlugin } from '@udecode/plate';

import { isPointNextToNode } from './queries';
import { insertDate } from './transforms';

export interface TDateElement extends TElement {
  date: string;
}

export const BaseDatePlugin = createSlatePlugin({
  key: 'date',
  handlers: {},
  node: {
    isElement: true,
    isInline: true,
    isSelectable: false,
    isVoid: true,
  },
})
  .overrideEditor(({ editor, tf: { move }, type }) => ({
    transforms: {
      // check if cursor is next to a date node. if it is set the unit:'offset'
      // Default left/right behavior is unit:'character'.
      // This fails to distinguish between two cursor positions, such as
      // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
      // Here we modify the behavior to unit:'offset'.
      // This lets the user step into and out of the inline without stepping over characters.
      // You may wish to customize this further to only use unit:'offset' in specific cases.
      move: (options) => {
        const {
          distance = 1,
          reverse = false,
          unit = 'character',
        } = options || {};

        if (
          unit === 'character' &&
          distance === 1 &&
          editor.selection &&
          !editor.api.isExpanded()
        ) {
          const isNextDate = isPointNextToNode(editor, {
            nodeType: type,
            reverse,
          });

          if (isNextDate) {
            return move({
              ...options,
              unit: 'offset',
            });
          }
        }

        return move(options);
      },
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    insert: {
      date: bindFirst(insertDate, editor),
    },
  }));
