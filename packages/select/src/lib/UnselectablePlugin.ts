import {
  type PluginConfig,
  type QueryNodeOptions,
  createTSlatePlugin,
  queryNode,
} from '@udecode/plate';

import { isPointNextToNode } from './queries';

export type UnselectableConfig = PluginConfig<
  'unselectable',
  {
    query: QueryNodeOptions | null;
  }
>;

/**
 * This plugin marks specific inline void nodes (e.g., "date","mention") as
 * unselectable.
 */
export const UnselectablePlugin = createTSlatePlugin<UnselectableConfig>({
  key: 'unselectable',
  options: {
    query: null,
  },
}).overrideEditor(({ editor, tf: { move } }) => ({
  api: {
    isSelectable: (element) => {
      const query = editor.getOption(UnselectablePlugin, 'query');

      if (!query) return true;

      return !queryNode([element, editor.api.findPath(element)!], query);
    },
  },
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
}));
