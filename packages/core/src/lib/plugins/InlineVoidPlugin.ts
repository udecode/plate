import { type OverrideEditor, createSlatePlugin } from '../plugin';

/**
 * Merge and register all the inline types and void types from the plugins and
 * options, using `editor.api.isInline`, `editor.api.markableVoid` and
 * `editor.api.isVoid`
 */
export const withInlineVoid: OverrideEditor = ({
  api: { isInline, isSelectable, isVoid, markableVoid },
  editor,
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
  };
};

/** @see {@link withInlineVoid} */
export const InlineVoidPlugin = createSlatePlugin({
  key: 'inlineVoid',
}).overrideEditor(withInlineVoid);
