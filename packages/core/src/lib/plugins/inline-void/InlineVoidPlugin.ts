import { type OverrideEditor, createSlatePlugin } from '../../plugin';
import { isPointNextToNode } from './isPointNextToNode';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.api.isInline`, `editor.api.markableVoid` and
 * `editor.api.isVoid`
 */
export const withInlineVoid: OverrideEditor = ({
  api: { isInline, isSelectable, isVoid, markableVoid },
  editor,
  tf: { move },
}) => {
  const voidTypes: string[] = [];
  const inlineTypes: string[] = [];
  const markableVoidTypes: string[] = [];
  const nonSelectableTypes: string[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isInline) {
      inlineTypes.push(plugin.node.type);
    }
    if (plugin.node.isVoid) {
      voidTypes.push(plugin.node.type);
    }
    if (plugin.node.isMarkableVoid) {
      markableVoidTypes.push(plugin.node.type);
    }
    if (plugin.node.isSelectable === false) {
      nonSelectableTypes.push(plugin.node.type);
    }
  });

  return {
    api: {
      isInline(element) {
        return inlineTypes.includes(element.type as any)
          ? true
          : isInline(element);
      },
      isSelectable(element) {
        return nonSelectableTypes.includes(element.type)
          ? false
          : isSelectable(element);
      },
      isVoid(element) {
        return voidTypes.includes(element.type as any) ? true : isVoid(element);
      },
      markableVoid(element) {
        return markableVoidTypes.includes(element.type)
          ? true
          : markableVoid(element);
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
          // next to mention or date
          const isNextToUnselectableNode = isPointNextToNode(editor, {
            reverse,
          });

          if (isNextToUnselectableNode) {
            return move({
              ...options,
              unit: 'offset',
            });
          }
        }

        return move(options);
      },
    },
  };
};

/** @see {@link withInlineVoid} */
export const InlineVoidPlugin = createSlatePlugin({
  key: 'inlineVoid',
}).overrideEditor(withInlineVoid);
